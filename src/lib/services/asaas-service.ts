/**
 * Asaas Service - Processador de Pagamentos
 * Modelo Hibrido (Oracle Settlement)
 *
 * Este servico gerencia:
 * - Criacao de cobrancas (Boleto/Pix)
 * - Split nativo de pagamentos
 * - Webhooks de confirmacao
 *
 * O dinheiro flui 100% em BRL via Asaas.
 * O backend atua como "Oraculo" que registra na blockchain.
 */

// Tipos do Asaas
export interface AsaasCustomer {
  id: string;
  name: string;
  email: string;
  cpfCnpj: string;
  phone?: string;
  mobilePhone?: string;
  address?: string;
  addressNumber?: string;
  complement?: string;
  province?: string;
  postalCode?: string;
  externalReference?: string;
}

export interface AsaasSplitRule {
  walletId: string; // ID da carteira do beneficiario no Asaas
  fixedValue?: number; // Valor fixo em R$
  percentualValue?: number; // Percentual do valor
  totalFixedValue?: number; // Valor fixo total (apos split)
}

export interface AsaasPayment {
  id: string;
  customer: string;
  billingType: 'BOLETO' | 'PIX' | 'CREDIT_CARD';
  value: number;
  dueDate: string;
  description?: string;
  externalReference?: string;
  split?: AsaasSplitRule[];
  status: AsaasPaymentStatus;
  invoiceUrl?: string;
  bankSlipUrl?: string;
  pixQrCodeUrl?: string;
  pixCopiaECola?: string;
  confirmedDate?: string;
  paymentDate?: string;
}

export type AsaasPaymentStatus =
  | 'PENDING'
  | 'RECEIVED'
  | 'CONFIRMED'
  | 'OVERDUE'
  | 'REFUNDED'
  | 'RECEIVED_IN_CASH'
  | 'REFUND_REQUESTED'
  | 'CHARGEBACK_REQUESTED'
  | 'CHARGEBACK_DISPUTE'
  | 'AWAITING_CHARGEBACK_REVERSAL'
  | 'DUNNING_REQUESTED'
  | 'DUNNING_RECEIVED'
  | 'AWAITING_RISK_ANALYSIS';

export interface AsaasWebhookPayload {
  event: string;
  payment: {
    id: string;
    customer: string;
    value: number;
    netValue: number;
    originalValue: number;
    description: string;
    billingType: string;
    status: AsaasPaymentStatus;
    dueDate: string;
    paymentDate: string;
    clientPaymentDate: string;
    confirmedDate: string;
    externalReference: string;
    split?: AsaasSplitRule[];
  };
}

export interface CreatePaymentParams {
  customerId: string;
  value: number;
  dueDate: string;
  description: string;
  externalReference: string; // contractId ou invoiceId
  billingType: 'BOLETO' | 'PIX';
  split?: {
    locadorWalletId: string;
    locadorPercentage: number;
    seguroWalletId?: string;
    seguroPercentage?: number;
    garantiaWalletId?: string;
    garantiaPercentage?: number;
    plataformaWalletId: string;
    plataformaPercentage: number;
  };
}

// Configuracao do Asaas
const ASAAS_CONFIG = {
  baseUrl: import.meta.env.VITE_ASAAS_API_URL || 'https://api.asaas.com/v3',
  apiKey: import.meta.env.VITE_ASAAS_API_KEY || '',
  environment: (import.meta.env.VITE_ASAAS_ENV || 'sandbox') as 'sandbox' | 'production',
};

/**
 * Classe principal do servico Asaas
 */
export class AsaasService {
  private baseUrl: string;
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || ASAAS_CONFIG.apiKey;
    this.baseUrl = ASAAS_CONFIG.environment === 'production'
      ? 'https://api.asaas.com/v3'
      : 'https://sandbox.asaas.com/api/v3';
  }

  /**
   * Headers padrao para requisicoes
   */
  private getHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
      'access_token': this.apiKey,
    };
  }

  /**
   * Cria ou busca cliente no Asaas
   */
  async findOrCreateCustomer(data: {
    name: string;
    email: string;
    cpfCnpj: string;
    phone?: string;
    externalReference?: string;
  }): Promise<AsaasCustomer> {
    // Primeiro tenta buscar por CPF/CNPJ
    const searchResponse = await fetch(
      `${this.baseUrl}/customers?cpfCnpj=${data.cpfCnpj}`,
      { headers: this.getHeaders() }
    );

    if (searchResponse.ok) {
      const searchResult = await searchResponse.json();
      if (searchResult.data && searchResult.data.length > 0) {
        return searchResult.data[0];
      }
    }

    // Se nao existe, cria novo
    const createResponse = await fetch(`${this.baseUrl}/customers`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        name: data.name,
        email: data.email,
        cpfCnpj: data.cpfCnpj.replace(/\D/g, ''),
        phone: data.phone,
        externalReference: data.externalReference,
      }),
    });

    if (!createResponse.ok) {
      const error = await createResponse.json();
      throw new Error(`Erro ao criar cliente: ${JSON.stringify(error)}`);
    }

    return createResponse.json();
  }

  /**
   * Cria cobranca com Split nativo
   */
  async createPaymentWithSplit(params: CreatePaymentParams): Promise<AsaasPayment> {
    const splitRules: AsaasSplitRule[] = [];

    if (params.split) {
      // Locador (dono do imovel)
      splitRules.push({
        walletId: params.split.locadorWalletId,
        percentualValue: params.split.locadorPercentage,
      });

      // Seguradora (opcional)
      if (params.split.seguroWalletId && params.split.seguroPercentage) {
        splitRules.push({
          walletId: params.split.seguroWalletId,
          percentualValue: params.split.seguroPercentage,
        });
      }

      // Garantidora (opcional)
      if (params.split.garantiaWalletId && params.split.garantiaPercentage) {
        splitRules.push({
          walletId: params.split.garantiaWalletId,
          percentualValue: params.split.garantiaPercentage,
        });
      }

      // Plataforma Vinculo Brasil
      splitRules.push({
        walletId: params.split.plataformaWalletId,
        percentualValue: params.split.plataformaPercentage,
      });
    }

    const paymentData = {
      customer: params.customerId,
      billingType: params.billingType,
      value: params.value,
      dueDate: params.dueDate,
      description: params.description,
      externalReference: params.externalReference,
      split: splitRules.length > 0 ? splitRules : undefined,
    };

    const response = await fetch(`${this.baseUrl}/payments`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(paymentData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Erro ao criar cobranca: ${JSON.stringify(error)}`);
    }

    return response.json();
  }

  /**
   * Busca dados de pagamento
   */
  async getPayment(paymentId: string): Promise<AsaasPayment> {
    const response = await fetch(`${this.baseUrl}/payments/${paymentId}`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Erro ao buscar pagamento: ${paymentId}`);
    }

    return response.json();
  }

  /**
   * Lista pagamentos de um cliente
   */
  async listPayments(customerId: string): Promise<AsaasPayment[]> {
    const response = await fetch(
      `${this.baseUrl}/payments?customer=${customerId}`,
      { headers: this.getHeaders() }
    );

    if (!response.ok) {
      throw new Error(`Erro ao listar pagamentos`);
    }

    const result = await response.json();
    return result.data || [];
  }

  /**
   * Gera QR Code Pix para pagamento
   */
  async getPixQrCode(paymentId: string): Promise<{ encodedImage: string; payload: string }> {
    const response = await fetch(`${this.baseUrl}/payments/${paymentId}/pixQrCode`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Erro ao gerar QR Code Pix`);
    }

    return response.json();
  }

  /**
   * Valida token do webhook (seguranca)
   */
  static validateWebhookToken(receivedToken: string, expectedToken: string): boolean {
    return receivedToken === expectedToken;
  }

  /**
   * Processa evento de webhook
   */
  static parseWebhookEvent(payload: AsaasWebhookPayload): {
    isPaymentConfirmed: boolean;
    paymentId: string;
    contractId: string;
    amount: number;
    paymentDate: string;
  } {
    const isPaymentConfirmed = ['RECEIVED', 'CONFIRMED', 'RECEIVED_IN_CASH'].includes(
      payload.payment.status
    );

    return {
      isPaymentConfirmed,
      paymentId: payload.payment.id,
      contractId: payload.payment.externalReference,
      amount: payload.payment.netValue || payload.payment.value,
      paymentDate: payload.payment.paymentDate || payload.payment.confirmedDate,
    };
  }
}

// Instancia padrao
export const asaasService = new AsaasService();

export default AsaasService;
