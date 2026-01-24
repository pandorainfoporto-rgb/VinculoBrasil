/**
 * Webhook Handler - Processamento de eventos Asaas
 * Modelo Hibrido (Oracle Settlement)
 *
 * Este modulo processa webhooks do Asaas e:
 * 1. Valida a autenticidade do webhook
 * 2. Identifica o tipo de evento
 * 3. Atualiza o banco de dados local
 * 4. Dispara o Oracle para registrar na blockchain
 *
 * NOTA: Este codigo seria executado no backend (Railway/Node.js)
 * Aqui definimos a interface e logica para referencia.
 */

import { type AsaasWebhookPayload, AsaasService } from './asaas-service';
import { getOracleService, type PaymentRecord } from './oracle-service';

// Tipos de eventos do Asaas
export type AsaasEventType =
  | 'PAYMENT_CREATED'
  | 'PAYMENT_AWAITING_RISK_ANALYSIS'
  | 'PAYMENT_APPROVED_BY_RISK_ANALYSIS'
  | 'PAYMENT_REPROVED_BY_RISK_ANALYSIS'
  | 'PAYMENT_UPDATED'
  | 'PAYMENT_CONFIRMED'
  | 'PAYMENT_RECEIVED'
  | 'PAYMENT_ANTICIPATED'
  | 'PAYMENT_OVERDUE'
  | 'PAYMENT_DELETED'
  | 'PAYMENT_RESTORED'
  | 'PAYMENT_REFUNDED'
  | 'PAYMENT_RECEIVED_IN_CASH_UNDONE'
  | 'PAYMENT_CHARGEBACK_REQUESTED'
  | 'PAYMENT_CHARGEBACK_DISPUTE'
  | 'PAYMENT_AWAITING_CHARGEBACK_REVERSAL'
  | 'PAYMENT_DUNNING_RECEIVED'
  | 'PAYMENT_DUNNING_REQUESTED';

// Resultado do processamento do webhook
export interface WebhookProcessResult {
  success: boolean;
  event: string;
  paymentId: string;
  contractId?: string;
  action: string;
  blockchainTx?: string;
  vbrzMinted?: number;
  error?: string;
}

// Configuracao do webhook
export interface WebhookConfig {
  expectedToken: string;
  enableBlockchainRecord: boolean;
  enableCashback: boolean;
}

/**
 * Classe principal do Webhook Handler
 */
export class WebhookHandler {
  private config: WebhookConfig;

  constructor(config?: Partial<WebhookConfig>) {
    this.config = {
      expectedToken: config?.expectedToken || '',
      enableBlockchainRecord: config?.enableBlockchainRecord ?? true,
      enableCashback: config?.enableCashback ?? true,
    };
  }

  /**
   * Valida token do webhook
   */
  validateToken(receivedToken: string): boolean {
    if (!this.config.expectedToken) {
      console.warn('[Webhook] Token nao configurado - aceitando todos');
      return true;
    }
    return AsaasService.validateWebhookToken(receivedToken, this.config.expectedToken);
  }

  /**
   * Processa webhook do Asaas
   */
  async processWebhook(
    payload: AsaasWebhookPayload,
    authToken?: string
  ): Promise<WebhookProcessResult> {
    // 1. Valida autenticidade
    if (authToken && !this.validateToken(authToken)) {
      return {
        success: false,
        event: payload.event,
        paymentId: payload.payment?.id || 'unknown',
        action: 'REJECTED',
        error: 'Token de autenticacao invalido',
      };
    }

    // 2. Parseia o evento
    const eventData = AsaasService.parseWebhookEvent(payload);
    console.log('[Webhook] Evento recebido:', {
      event: payload.event,
      paymentId: eventData.paymentId,
      contractId: eventData.contractId,
      isConfirmed: eventData.isPaymentConfirmed,
    });

    // 3. Processa baseado no tipo de evento
    if (eventData.isPaymentConfirmed) {
      return this.handlePaymentConfirmed(eventData, payload);
    }

    // Outros eventos (criacao, atualizacao, etc)
    return {
      success: true,
      event: payload.event,
      paymentId: eventData.paymentId,
      contractId: eventData.contractId,
      action: 'LOGGED',
    };
  }

  /**
   * Processa pagamento confirmado
   */
  private async handlePaymentConfirmed(
    eventData: ReturnType<typeof AsaasService.parseWebhookEvent>,
    payload: AsaasWebhookPayload
  ): Promise<WebhookProcessResult> {
    const result: WebhookProcessResult = {
      success: true,
      event: payload.event,
      paymentId: eventData.paymentId,
      contractId: eventData.contractId,
      action: 'PAYMENT_CONFIRMED',
    };

    try {
      // 1. Atualizar banco de dados local (seria Prisma/Supabase)
      console.log('[Webhook] Atualizando fatura no banco de dados...');
      await this.updateInvoiceInDatabase(eventData);

      // 2. Registrar na blockchain via Oracle
      if (this.config.enableBlockchainRecord) {
        console.log('[Webhook] Registrando pagamento na blockchain...');

        const paymentDate = new Date(eventData.paymentDate);
        const paymentRecord: PaymentRecord = {
          contractId: eventData.contractId,
          month: paymentDate.getMonth() + 1,
          year: paymentDate.getFullYear(),
          amount: eventData.amount,
          paymentDate,
          asaasPaymentId: eventData.paymentId,
        };

        const oracle = getOracleService();
        const oracleResult = await oracle.recordPayment(paymentRecord);

        if (oracleResult.success) {
          result.blockchainTx = oracleResult.transactionHash;
          result.vbrzMinted = oracleResult.vbrzMinted;
          console.log('[Webhook] Pagamento registrado na blockchain:', oracleResult.transactionHash);
        } else {
          console.error('[Webhook] Erro ao registrar na blockchain:', oracleResult.error);
        }
      }

      // 3. Disparar notificacoes (email, push, etc)
      await this.sendPaymentNotifications(eventData);

      return result;
    } catch (error) {
      console.error('[Webhook] Erro ao processar pagamento:', error);
      return {
        ...result,
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      };
    }
  }

  /**
   * Atualiza fatura no banco de dados
   * NOTA: Implementacao real usaria Prisma/Supabase
   */
  private async updateInvoiceInDatabase(
    eventData: ReturnType<typeof AsaasService.parseWebhookEvent>
  ): Promise<void> {
    // Simulacao - seria:
    // await prisma.invoice.update({
    //   where: { asaasPaymentId: eventData.paymentId },
    //   data: {
    //     status: 'PAID',
    //     paidAt: new Date(eventData.paymentDate),
    //     paidAmount: eventData.amount,
    //   },
    // });

    console.log('[Webhook] [DB] Fatura atualizada:', {
      contractId: eventData.contractId,
      paymentId: eventData.paymentId,
      status: 'PAID',
    });
  }

  /**
   * Envia notificacoes de pagamento
   */
  private async sendPaymentNotifications(
    eventData: ReturnType<typeof AsaasService.parseWebhookEvent>
  ): Promise<void> {
    // Simulacao - seria integracao com SendGrid, OneSignal, etc
    console.log('[Webhook] [Notificacao] Enviando confirmacao de pagamento:', {
      contractId: eventData.contractId,
      amount: eventData.amount,
    });
  }
}

// Instancia padrao
let webhookHandlerInstance: WebhookHandler | null = null;

export function getWebhookHandler(config?: Partial<WebhookConfig>): WebhookHandler {
  if (!webhookHandlerInstance) {
    webhookHandlerInstance = new WebhookHandler(config);
  }
  return webhookHandlerInstance;
}

/**
 * Funcao helper para processar webhook (uso em API routes)
 * Exemplo de uso no backend:
 *
 * ```typescript
 * // pages/api/webhook/asaas.ts (Next.js) ou routes (Express)
 * export async function POST(req: Request) {
 *   const payload = await req.json();
 *   const token = req.headers.get('asaas-access-token');
 *
 *   const result = await processAsaasWebhook(payload, token);
 *
 *   return Response.json(result);
 * }
 * ```
 */
export async function processAsaasWebhook(
  payload: AsaasWebhookPayload,
  authToken?: string
): Promise<WebhookProcessResult> {
  const handler = getWebhookHandler();
  return handler.processWebhook(payload, authToken);
}

export default WebhookHandler;
