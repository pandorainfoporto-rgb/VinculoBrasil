/**
 * Vinculo.io - Webhook Handler
 *
 * Gerenciador centralizado de webhooks para todas as integrações:
 * - Asaas (Pagamentos)
 * - ZapSign (Assinaturas)
 * - AppSheet/Base44 (Banco de dados)
 * - Blockchain Events
 *
 * Responsabilidades:
 * - Validação de assinaturas
 * - Roteamento de eventos
 * - Idempotência
 * - Logging e auditoria
 */

import {
  type WebhookPayload,
  type CloudFunctionResponse,
  type CollateralLockPayload,
  type CollateralReleasePayload,
  type ContractMintPayload,
  onPaymentConfirmed,
  onCollateralLock,
  onCollateralRelease,
  onContractMint,
} from './cloud-functions';

// ============================================================================
// TIPOS
// ============================================================================

export type WebhookSource =
  | 'asaas'
  | 'zapsign'
  | 'appsheet'
  | 'base44'
  | 'blockchain'
  | 'twilio'
  | 'serasa';

export type WebhookEventType =
  // Pagamentos
  | 'payment.created'
  | 'payment.confirmed'
  | 'payment.failed'
  | 'payment.refunded'
  | 'payment.overdue'
  // Assinaturas
  | 'signature.created'
  | 'signature.signed'
  | 'signature.refused'
  | 'signature.expired'
  // Contratos
  | 'contract.created'
  | 'contract.activated'
  | 'contract.terminated'
  | 'contract.renewed'
  // Garantias
  | 'collateral.locked'
  | 'collateral.released'
  | 'collateral.disputed'
  // KYC
  | 'kyc.approved'
  | 'kyc.rejected'
  | 'kyc.manual_review'
  // Notificações
  | 'notification.sent'
  | 'notification.delivered'
  | 'notification.failed';

export interface WebhookEvent {
  id: string;
  source: WebhookSource;
  eventType: WebhookEventType;
  timestamp: string;
  payload: Record<string, unknown>;
  signature?: string;
  retryCount?: number;
}

export interface WebhookHandlerResult {
  success: boolean;
  eventId: string;
  eventType: WebhookEventType;
  processedAt: string;
  result?: Record<string, unknown>;
  error?: string;
  shouldRetry?: boolean;
}

export interface WebhookConfig {
  source: WebhookSource;
  secret: string;
  enabled: boolean;
  retryPolicy: {
    maxRetries: number;
    backoffMs: number;
  };
}

// ============================================================================
// REGISTRO DE EVENTOS PROCESSADOS (Idempotência)
// ============================================================================

const processedEvents = new Map<
  string,
  {
    result: WebhookHandlerResult;
    processedAt: Date;
  }
>();

/**
 * Limpa eventos antigos (mais de 24h)
 */
function cleanupOldEvents(): void {
  const now = Date.now();
  const maxAge = 24 * 60 * 60 * 1000; // 24 horas

  for (const [eventId, data] of processedEvents.entries()) {
    if (now - data.processedAt.getTime() > maxAge) {
      processedEvents.delete(eventId);
    }
  }
}

// ============================================================================
// WEBHOOK HANDLER
// ============================================================================

export class WebhookHandler {
  private configs: Map<WebhookSource, WebhookConfig> = new Map();
  private eventLog: WebhookEvent[] = [];

  constructor(configs?: WebhookConfig[]) {
    if (configs) {
      configs.forEach(config => {
        this.configs.set(config.source, config);
      });
    }

    // Limpa eventos antigos a cada hora
    setInterval(cleanupOldEvents, 60 * 60 * 1000);
  }

  /**
   * Registra configuração de webhook
   */
  registerWebhook(config: WebhookConfig): void {
    this.configs.set(config.source, config);
  }

  /**
   * Processa evento de webhook
   */
  async handleEvent(event: WebhookEvent): Promise<WebhookHandlerResult> {
    const startTime = Date.now();

    try {
      // Verifica idempotência
      const existing = processedEvents.get(event.id);
      if (existing) {
        return {
          ...existing.result,
          error: 'Event already processed',
        };
      }

      // Valida fonte
      const config = this.configs.get(event.source);
      if (config && !config.enabled) {
        return {
          success: false,
          eventId: event.id,
          eventType: event.eventType,
          processedAt: new Date().toISOString(),
          error: `Webhook source ${event.source} is disabled`,
        };
      }

      // Valida assinatura (se configurado)
      if (config?.secret && event.signature) {
        const isValid = this.validateSignature(event.source, event.signature, event.payload);
        if (!isValid) {
          return {
            success: false,
            eventId: event.id,
            eventType: event.eventType,
            processedAt: new Date().toISOString(),
            error: 'Invalid webhook signature',
          };
        }
      }

      // Roteia para handler específico
      const result = await this.routeEvent(event);

      // Registra evento processado
      processedEvents.set(event.id, {
        result,
        processedAt: new Date(),
      });

      // Log do evento
      this.eventLog.push(event);

      console.log(
        `[WebhookHandler] Evento ${event.eventType} processado em ${Date.now() - startTime}ms`
      );

      return result;
    } catch (error) {
      const errorResult: WebhookHandlerResult = {
        success: false,
        eventId: event.id,
        eventType: event.eventType,
        processedAt: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
        shouldRetry: true,
      };

      return errorResult;
    }
  }

  /**
   * Roteia evento para handler específico
   */
  private async routeEvent(event: WebhookEvent): Promise<WebhookHandlerResult> {
    const baseResult = {
      eventId: event.id,
      eventType: event.eventType,
      processedAt: new Date().toISOString(),
    };

    switch (event.eventType) {
      // Pagamentos
      case 'payment.confirmed':
        return this.handlePaymentConfirmed(event, baseResult);

      case 'payment.failed':
      case 'payment.overdue':
        return this.handlePaymentIssue(event, baseResult);

      // Assinaturas
      case 'signature.signed':
        return this.handleSignatureSigned(event, baseResult);

      case 'signature.refused':
        return this.handleSignatureRefused(event, baseResult);

      // Contratos
      case 'contract.created':
        return this.handleContractCreated(event, baseResult);

      case 'contract.activated':
        return this.handleContractActivated(event, baseResult);

      // Garantias
      case 'collateral.locked':
        return this.handleCollateralLocked(event, baseResult);

      case 'collateral.released':
        return this.handleCollateralReleased(event, baseResult);

      // KYC
      case 'kyc.approved':
      case 'kyc.rejected':
        return this.handleKYCResult(event, baseResult);

      default:
        return {
          ...baseResult,
          success: true,
          result: { message: 'Event logged but no handler configured' },
        };
    }
  }

  // --------------------------------------------------------------------------
  // HANDLERS ESPECÍFICOS
  // --------------------------------------------------------------------------

  private async handlePaymentConfirmed(
    event: WebhookEvent,
    baseResult: Omit<WebhookHandlerResult, 'success'>
  ): Promise<WebhookHandlerResult> {
    const payload = event.payload as unknown as WebhookPayload;

    const cloudFunctionConfig = {
      providerUrl: 'https://polygon-mumbai.g.alchemy.com/v2/DEMO',
      contractAddress: '0x0000000000000000000000000000000000000000',
      platformWallet: '0x0000000000000000000000000000000000000000',
      gasLimit: 150000,
    };

    const result: CloudFunctionResponse = await onPaymentConfirmed(payload, cloudFunctionConfig);

    return {
      ...baseResult,
      success: result.status === 'success',
      result: result as unknown as Record<string, unknown>,
      error: result.status === 'error' ? result.message : undefined,
    };
  }

  private async handlePaymentIssue(
    event: WebhookEvent,
    baseResult: Omit<WebhookHandlerResult, 'success'>
  ): Promise<WebhookHandlerResult> {
    // Em produção: disparar notificações, iniciar fluxo de cobrança
    console.log(`[WebhookHandler] Pagamento com problema: ${event.eventType}`, event.payload);

    return {
      ...baseResult,
      success: true,
      result: {
        action: 'notification_sent',
        message: 'Payment issue notification dispatched',
      },
    };
  }

  private async handleSignatureSigned(
    event: WebhookEvent,
    baseResult: Omit<WebhookHandlerResult, 'success'>
  ): Promise<WebhookHandlerResult> {
    const { documentToken, signerRole, allSigned } = event.payload as {
      documentToken: string;
      signerRole: string;
      allSigned: boolean;
    };

    console.log(`[WebhookHandler] Assinatura recebida: ${signerRole}`);

    if (allSigned) {
      // Todos assinaram - pode mintar NFT
      console.log(`[WebhookHandler] Todas assinaturas coletadas para documento ${documentToken}`);
    }

    return {
      ...baseResult,
      success: true,
      result: {
        documentToken,
        signerRole,
        allSigned,
        action: allSigned ? 'ready_for_nft_mint' : 'awaiting_signatures',
      },
    };
  }

  private async handleSignatureRefused(
    event: WebhookEvent,
    baseResult: Omit<WebhookHandlerResult, 'success'>
  ): Promise<WebhookHandlerResult> {
    console.log(`[WebhookHandler] Assinatura recusada`, event.payload);

    return {
      ...baseResult,
      success: true,
      result: {
        action: 'contract_cancelled',
        message: 'Contract cancelled due to signature refusal',
      },
    };
  }

  private async handleContractCreated(
    event: WebhookEvent,
    baseResult: Omit<WebhookHandlerResult, 'success'>
  ): Promise<WebhookHandlerResult> {
    const payload = event.payload as unknown as ContractMintPayload;

    const cloudFunctionConfig = {
      providerUrl: 'https://polygon-mumbai.g.alchemy.com/v2/DEMO',
      contractAddress: '0x0000000000000000000000000000000000000000',
      platformWallet: '0x0000000000000000000000000000000000000000',
      gasLimit: 250000,
    };

    const result = await onContractMint(payload, cloudFunctionConfig);

    return {
      ...baseResult,
      success: result.status === 'success',
      result: result as unknown as Record<string, unknown>,
      error: result.status === 'error' ? result.message : undefined,
    };
  }

  private async handleContractActivated(
    event: WebhookEvent,
    baseResult: Omit<WebhookHandlerResult, 'success'>
  ): Promise<WebhookHandlerResult> {
    console.log(`[WebhookHandler] Contrato ativado`, event.payload);

    return {
      ...baseResult,
      success: true,
      result: {
        action: 'contract_active',
        message: 'Contract is now active',
      },
    };
  }

  private async handleCollateralLocked(
    event: WebhookEvent,
    baseResult: Omit<WebhookHandlerResult, 'success'>
  ): Promise<WebhookHandlerResult> {
    const payload = event.payload as unknown as CollateralLockPayload;

    const cloudFunctionConfig = {
      providerUrl: 'https://polygon-mumbai.g.alchemy.com/v2/DEMO',
      contractAddress: '0x0000000000000000000000000000000000000000',
      platformWallet: '0x0000000000000000000000000000000000000000',
      gasLimit: 120000,
    };

    const result = await onCollateralLock(payload, cloudFunctionConfig);

    return {
      ...baseResult,
      success: result.status === 'success',
      result: result as unknown as Record<string, unknown>,
      error: result.status === 'error' ? result.message : undefined,
    };
  }

  private async handleCollateralReleased(
    event: WebhookEvent,
    baseResult: Omit<WebhookHandlerResult, 'success'>
  ): Promise<WebhookHandlerResult> {
    const payload = event.payload as unknown as CollateralReleasePayload;

    const cloudFunctionConfig = {
      providerUrl: 'https://polygon-mumbai.g.alchemy.com/v2/DEMO',
      contractAddress: '0x0000000000000000000000000000000000000000',
      platformWallet: '0x0000000000000000000000000000000000000000',
      gasLimit: 95000,
    };

    const result = await onCollateralRelease(payload, cloudFunctionConfig);

    return {
      ...baseResult,
      success: result.status === 'success',
      result: result as unknown as Record<string, unknown>,
      error: result.status === 'error' ? result.message : undefined,
    };
  }

  private async handleKYCResult(
    event: WebhookEvent,
    baseResult: Omit<WebhookHandlerResult, 'success'>
  ): Promise<WebhookHandlerResult> {
    const { userId, status } = event.payload as { userId: string; status: string };

    console.log(`[WebhookHandler] KYC ${status} para usuário ${userId}`);

    return {
      ...baseResult,
      success: true,
      result: {
        userId,
        kycStatus: status,
        action: status === 'approved' ? 'user_approved' : 'user_rejected',
      },
    };
  }

  // --------------------------------------------------------------------------
  // VALIDAÇÃO
  // --------------------------------------------------------------------------

  private validateSignature(
    _source: WebhookSource,
    _signature: string,
    _payload: Record<string, unknown>
  ): boolean {
    // Em produção, implementar validação HMAC-SHA256 específica para cada fonte
    return true;
  }

  // --------------------------------------------------------------------------
  // UTILITÁRIOS
  // --------------------------------------------------------------------------

  /**
   * Obtém log de eventos
   */
  getEventLog(limit?: number): WebhookEvent[] {
    const log = [...this.eventLog].reverse();
    return limit ? log.slice(0, limit) : log;
  }

  /**
   * Obtém estatísticas
   */
  getStats(): {
    totalEvents: number;
    bySource: Record<string, number>;
    byType: Record<string, number>;
    last24h: number;
  } {
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;

    const bySource: Record<string, number> = {};
    const byType: Record<string, number> = {};
    let last24h = 0;

    for (const event of this.eventLog) {
      bySource[event.source] = (bySource[event.source] || 0) + 1;
      byType[event.eventType] = (byType[event.eventType] || 0) + 1;

      if (now - new Date(event.timestamp).getTime() < day) {
        last24h++;
      }
    }

    return {
      totalEvents: this.eventLog.length,
      bySource,
      byType,
      last24h,
    };
  }
}

// ============================================================================
// INSTÂNCIA SINGLETON
// ============================================================================

export const webhookHandler = new WebhookHandler([
  {
    source: 'asaas',
    secret: process.env.ASAAS_WEBHOOK_SECRET || 'demo_secret',
    enabled: true,
    retryPolicy: { maxRetries: 3, backoffMs: 1000 },
  },
  {
    source: 'zapsign',
    secret: process.env.ZAPSIGN_WEBHOOK_SECRET || 'demo_secret',
    enabled: true,
    retryPolicy: { maxRetries: 3, backoffMs: 1000 },
  },
  {
    source: 'appsheet',
    secret: process.env.APPSHEET_WEBHOOK_SECRET || 'demo_secret',
    enabled: true,
    retryPolicy: { maxRetries: 5, backoffMs: 2000 },
  },
]);

// ============================================================================
// FUNÇÕES UTILITÁRIAS
// ============================================================================

/**
 * Gera ID único para evento
 */
export function generateEventId(): string {
  return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Cria evento a partir de payload raw
 */
export function createWebhookEvent(
  source: WebhookSource,
  eventType: WebhookEventType,
  payload: Record<string, unknown>,
  signature?: string
): WebhookEvent {
  return {
    id: generateEventId(),
    source,
    eventType,
    timestamp: new Date().toISOString(),
    payload,
    signature,
    retryCount: 0,
  };
}
