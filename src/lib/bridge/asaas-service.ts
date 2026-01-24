/**
 * Vinculo.io - Asaas Payment Service
 *
 * Integração com a API da Asaas para:
 * - Criação de cobranças (PIX, Boleto, Cartão)
 * - Split automático de pagamentos
 * - Gestão de assinaturas recorrentes
 * - Webhooks de confirmação
 *
 * Documentação: https://docs.asaas.com/
 */

// ============================================================================
// TIPOS
// ============================================================================

export type AsaasBillingType = 'BOLETO' | 'CREDIT_CARD' | 'PIX' | 'UNDEFINED';

export type AsaasPaymentStatus =
  | 'PENDING'
  | 'RECEIVED'
  | 'CONFIRMED'
  | 'OVERDUE'
  | 'REFUNDED'
  | 'RECEIVED_IN_CASH'
  | 'REFUND_REQUESTED'
  | 'REFUND_IN_PROGRESS'
  | 'CHARGEBACK_REQUESTED'
  | 'CHARGEBACK_DISPUTE'
  | 'AWAITING_CHARGEBACK_REVERSAL'
  | 'DUNNING_REQUESTED'
  | 'DUNNING_RECEIVED'
  | 'AWAITING_RISK_ANALYSIS';

export interface AsaasCustomer {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  mobilePhone?: string;
  cpfCnpj: string;
  postalCode?: string;
  address?: string;
  addressNumber?: string;
  complement?: string;
  province?: string;
  externalReference?: string;
  notificationDisabled?: boolean;
  additionalEmails?: string;
  municipalInscription?: string;
  stateInscription?: string;
  observations?: string;
}

export interface AsaasPayment {
  id?: string;
  customer: string; // Customer ID
  billingType: AsaasBillingType;
  value: number;
  dueDate: string; // YYYY-MM-DD
  description?: string;
  externalReference?: string;
  installmentCount?: number;
  installmentValue?: number;
  discount?: {
    value: number;
    dueDateLimitDays: number;
    type: 'FIXED' | 'PERCENTAGE';
  };
  interest?: {
    value: number;
  };
  fine?: {
    value: number;
    type: 'FIXED' | 'PERCENTAGE';
  };
  postalService?: boolean;
  split?: AsaasSplit[];
}

export interface AsaasSplit {
  walletId: string;
  fixedValue?: number;
  percentualValue?: number;
  totalFixedValue?: number;
  externalReference?: string;
}

export interface AsaasPixQrCode {
  encodedImage: string;
  payload: string;
  expirationDate: string;
}

export interface AsaasBoletoData {
  identificationField: string;
  nossoNumero: string;
  barCode: string;
  bankSlipUrl: string;
}

export interface AsaasPaymentResponse {
  id: string;
  dateCreated: string;
  customer: string;
  paymentLink?: string;
  value: number;
  netValue: number;
  billingType: AsaasBillingType;
  status: AsaasPaymentStatus;
  dueDate: string;
  originalDueDate: string;
  clientPaymentDate?: string;
  invoiceUrl: string;
  bankSlipUrl?: string;
  transactionReceiptUrl?: string;
  invoiceNumber?: string;
  externalReference?: string;
  deleted: boolean;
  postalService: boolean;
  anticipated: boolean;
  anticipable: boolean;
  lastInvoiceViewedDate?: string;
  lastBankSlipViewedDate?: string;
  pixTransaction?: AsaasPixQrCode;
}

export interface AsaasWebhookEvent {
  event:
    | 'PAYMENT_CREATED'
    | 'PAYMENT_UPDATED'
    | 'PAYMENT_CONFIRMED'
    | 'PAYMENT_RECEIVED'
    | 'PAYMENT_OVERDUE'
    | 'PAYMENT_DELETED'
    | 'PAYMENT_RESTORED'
    | 'PAYMENT_REFUNDED'
    | 'PAYMENT_RECEIVED_IN_CASH_UNDONE'
    | 'PAYMENT_CHARGEBACK_REQUESTED'
    | 'PAYMENT_CHARGEBACK_DISPUTE'
    | 'PAYMENT_AWAITING_CHARGEBACK_REVERSAL'
    | 'PAYMENT_DUNNING_RECEIVED'
    | 'PAYMENT_DUNNING_REQUESTED'
    | 'PAYMENT_BANK_SLIP_VIEWED'
    | 'PAYMENT_CHECKOUT_VIEWED';
  payment: AsaasPaymentResponse;
}

export interface AsaasSubscription {
  id?: string;
  customer: string;
  billingType: AsaasBillingType;
  value: number;
  nextDueDate: string;
  cycle: 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'BIMONTHLY' | 'QUARTERLY' | 'SEMIANNUALLY' | 'YEARLY';
  description?: string;
  endDate?: string;
  maxPayments?: number;
  externalReference?: string;
  split?: AsaasSplit[];
}

// ============================================================================
// CONFIGURAÇÃO
// ============================================================================

export interface AsaasConfig {
  apiKey: string;
  environment: 'sandbox' | 'production';
  webhookToken?: string;
}

const ASAAS_ENDPOINTS = {
  sandbox: 'https://sandbox.asaas.com/api/v3',
  production: 'https://api.asaas.com/v3',
} as const;

// ============================================================================
// CLIENTE ASAAS
// ============================================================================

export class AsaasService {
  private apiKey: string;
  private baseUrl: string;
  private webhookToken?: string;

  constructor(config: AsaasConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = ASAAS_ENDPOINTS[config.environment];
    this.webhookToken = config.webhookToken;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        access_token: this.apiKey,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Asaas API Error: ${JSON.stringify(error)}`);
    }

    return response.json();
  }

  // --------------------------------------------------------------------------
  // CUSTOMERS
  // --------------------------------------------------------------------------

  async createCustomer(customer: AsaasCustomer): Promise<AsaasCustomer & { id: string }> {
    return this.request('/customers', {
      method: 'POST',
      body: JSON.stringify(customer),
    });
  }

  async getCustomer(customerId: string): Promise<AsaasCustomer & { id: string }> {
    return this.request(`/customers/${customerId}`);
  }

  async findCustomerByCpfCnpj(
    cpfCnpj: string
  ): Promise<{ data: Array<AsaasCustomer & { id: string }> }> {
    return this.request(`/customers?cpfCnpj=${cpfCnpj}`);
  }

  // --------------------------------------------------------------------------
  // PAYMENTS
  // --------------------------------------------------------------------------

  async createPayment(payment: AsaasPayment): Promise<AsaasPaymentResponse> {
    return this.request('/payments', {
      method: 'POST',
      body: JSON.stringify(payment),
    });
  }

  async getPayment(paymentId: string): Promise<AsaasPaymentResponse> {
    return this.request(`/payments/${paymentId}`);
  }

  async getPixQrCode(paymentId: string): Promise<AsaasPixQrCode> {
    return this.request(`/payments/${paymentId}/pixQrCode`);
  }

  async getBoletoData(paymentId: string): Promise<AsaasBoletoData> {
    return this.request(`/payments/${paymentId}/identificationField`);
  }

  async refundPayment(
    paymentId: string,
    value?: number
  ): Promise<{ id: string; status: string; value: number }> {
    return this.request(`/payments/${paymentId}/refund`, {
      method: 'POST',
      body: JSON.stringify({ value }),
    });
  }

  // --------------------------------------------------------------------------
  // SUBSCRIPTIONS (Assinaturas Recorrentes)
  // --------------------------------------------------------------------------

  async createSubscription(
    subscription: AsaasSubscription
  ): Promise<AsaasSubscription & { id: string }> {
    return this.request('/subscriptions', {
      method: 'POST',
      body: JSON.stringify(subscription),
    });
  }

  async cancelSubscription(subscriptionId: string): Promise<{ id: string; deleted: boolean }> {
    return this.request(`/subscriptions/${subscriptionId}`, {
      method: 'DELETE',
    });
  }

  // --------------------------------------------------------------------------
  // SPLIT (Divisão de Pagamentos)
  // --------------------------------------------------------------------------

  /**
   * Cria pagamento com split automático para Vinculo.io
   * Split 85/5/5/5: Locador / Seguradora / Plataforma / Garantidor
   */
  async createPaymentWithSplit(
    payment: Omit<AsaasPayment, 'split'>,
    landlordWalletId: string,
    insurerWalletId: string,
    platformWalletId: string,
    guarantorWalletId?: string
  ): Promise<AsaasPaymentResponse> {
    const splits: AsaasSplit[] = [
      {
        walletId: landlordWalletId,
        percentualValue: guarantorWalletId ? 85 : 90,
        externalReference: 'landlord',
      },
      {
        walletId: insurerWalletId,
        percentualValue: 5,
        externalReference: 'insurer',
      },
      {
        walletId: platformWalletId,
        percentualValue: 5,
        externalReference: 'platform',
      },
    ];

    if (guarantorWalletId) {
      splits.push({
        walletId: guarantorWalletId,
        percentualValue: 5,
        externalReference: 'guarantor',
      });
    }

    return this.createPayment({
      ...payment,
      split: splits,
    });
  }

  // --------------------------------------------------------------------------
  // WEBHOOKS
  // --------------------------------------------------------------------------

  validateWebhook(signature: string, payload: string): boolean {
    if (!this.webhookToken) return false;

    // Em produção, implementar validação HMAC
    // const expectedSignature = crypto
    //   .createHmac('sha256', this.webhookToken)
    //   .update(payload)
    //   .digest('hex');

    return signature.length > 0;
  }

  parseWebhookEvent(payload: string): AsaasWebhookEvent {
    return JSON.parse(payload);
  }
}

// ============================================================================
// FUNÇÕES AUXILIARES
// ============================================================================

/**
 * Formata CPF/CNPJ para enviar à API
 */
export function formatCpfCnpj(value: string): string {
  return value.replace(/\D/g, '');
}

/**
 * Formata valor para centavos
 */
export function formatCurrency(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Gera referência externa única para pagamento
 */
export function generatePaymentReference(contractId: string, month: number, year: number): string {
  return `VINCULO_${contractId}_${year}${month.toString().padStart(2, '0')}`;
}

/**
 * Calcula data de vencimento
 */
export function calculateDueDate(dayOfMonth: number): string {
  const now = new Date();
  const dueDate = new Date(now.getFullYear(), now.getMonth(), dayOfMonth);

  // Se a data já passou neste mês, vai para o próximo
  if (dueDate <= now) {
    dueDate.setMonth(dueDate.getMonth() + 1);
  }

  return dueDate.toISOString().split('T')[0];
}

// ============================================================================
// MOCK SERVICE (Para desenvolvimento)
// ============================================================================

export class MockAsaasService {
  private customers: Map<string, AsaasCustomer & { id: string }> = new Map();
  private payments: Map<string, AsaasPaymentResponse> = new Map();

  async createCustomer(customer: AsaasCustomer): Promise<AsaasCustomer & { id: string }> {
    const id = `cus_${Math.random().toString(36).substr(2, 14)}`;
    const created = { ...customer, id };
    this.customers.set(id, created);
    return created;
  }

  async createPayment(payment: AsaasPayment): Promise<AsaasPaymentResponse> {
    const id = `pay_${Math.random().toString(36).substr(2, 14)}`;

    const response: AsaasPaymentResponse = {
      id,
      dateCreated: new Date().toISOString(),
      customer: payment.customer,
      value: payment.value,
      netValue: payment.value * 0.97, // Simula taxa
      billingType: payment.billingType,
      status: 'PENDING',
      dueDate: payment.dueDate,
      originalDueDate: payment.dueDate,
      invoiceUrl: `https://sandbox.asaas.com/i/${id}`,
      bankSlipUrl:
        payment.billingType === 'BOLETO' ? `https://sandbox.asaas.com/b/${id}` : undefined,
      deleted: false,
      postalService: false,
      anticipated: false,
      anticipable: true,
      pixTransaction:
        payment.billingType === 'PIX'
          ? {
              encodedImage: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
              payload: `00020126580014BR.GOV.BCB.PIX0136${id}520400005303986540${payment.value.toFixed(2)}5802BR`,
              expirationDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            }
          : undefined,
    };

    this.payments.set(id, response);
    return response;
  }

  async getPayment(paymentId: string): Promise<AsaasPaymentResponse> {
    const payment = this.payments.get(paymentId);
    if (!payment) throw new Error('Payment not found');
    return payment;
  }

  async confirmPayment(paymentId: string): Promise<AsaasPaymentResponse> {
    const payment = this.payments.get(paymentId);
    if (!payment) throw new Error('Payment not found');

    payment.status = 'CONFIRMED';
    payment.clientPaymentDate = new Date().toISOString();
    this.payments.set(paymentId, payment);

    return payment;
  }
}
