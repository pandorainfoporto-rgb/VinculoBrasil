/**
 * Vinculo.io - Transfero Integration Service
 *
 * Integração com a API da Transfero para:
 * - Conversão de Real (BRL) para BRZ (stablecoin)
 * - Gestão de liquidez do pool
 * - Monitoramento de saldo em tempo real
 * - Transferências para carteiras Polygon
 *
 * A Transfero é uma exchange brasileira que oferece
 * conversão fiat-to-crypto regulamentada pelo Banco Central.
 *
 * Documentação: https://docs.transfero.com/
 */

// ============================================================================
// TIPOS
// ============================================================================

export type TransferoOrderSide = 'buy' | 'sell';
export type TransferoOrderStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
export type TransferoCurrency = 'BRL' | 'BRZ' | 'USD' | 'USDT' | 'USDC' | 'ETH' | 'BTC';
export type TransferoNetwork = 'polygon' | 'ethereum' | 'bsc' | 'solana';

export interface TransferoQuote {
  id: string;
  pair: string;
  side: TransferoOrderSide;
  baseAmount: number;
  quoteAmount: number;
  rate: number;
  fee: number;
  netAmount: number;
  expiresAt: string;
  createdAt: string;
}

export interface TransferoOrder {
  id: string;
  quoteId: string;
  pair: string;
  side: TransferoOrderSide;
  status: TransferoOrderStatus;
  baseAmount: number;
  quoteAmount: number;
  rate: number;
  fee: number;
  netAmount: number;
  destinationWallet?: string;
  destinationNetwork?: TransferoNetwork;
  txHash?: string;
  createdAt: string;
  completedAt?: string;
}

export interface TransferoBalance {
  currency: TransferoCurrency;
  available: number;
  pending: number;
  total: number;
}

export interface TransferoWithdrawal {
  id: string;
  currency: TransferoCurrency;
  amount: number;
  fee: number;
  netAmount: number;
  destinationWallet: string;
  network: TransferoNetwork;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  txHash?: string;
  createdAt: string;
  completedAt?: string;
}

export interface TransferoWebhookEvent {
  event: 'order.completed' | 'order.failed' | 'withdrawal.completed' | 'withdrawal.failed';
  data: TransferoOrder | TransferoWithdrawal;
  timestamp: string;
  signature: string;
}

// ============================================================================
// CONFIGURAÇÃO
// ============================================================================

export interface TransferoConfig {
  apiKey: string;
  apiSecret: string;
  environment: 'sandbox' | 'production';
  webhookSecret?: string;
  defaultDestinationWallet?: string;
  defaultNetwork?: TransferoNetwork;
}

const TRANSFERO_ENDPOINTS = {
  sandbox: 'https://sandbox.api.transfero.com/v1',
  production: 'https://api.transfero.com/v1',
} as const;

// ============================================================================
// CLIENTE TRANSFERO
// ============================================================================

export class TransferoService {
  private apiKey: string;
  private apiSecret: string;
  private baseUrl: string;
  private webhookSecret?: string;
  private defaultDestinationWallet?: string;
  private defaultNetwork: TransferoNetwork;

  constructor(config: TransferoConfig) {
    this.apiKey = config.apiKey;
    this.apiSecret = config.apiSecret;
    this.baseUrl = TRANSFERO_ENDPOINTS[config.environment];
    this.webhookSecret = config.webhookSecret;
    this.defaultDestinationWallet = config.defaultDestinationWallet;
    this.defaultNetwork = config.defaultNetwork || 'polygon';
  }

  /**
   * Gera headers de autenticação HMAC exigidos pela Transfero
   */
  private generateAuthHeaders(path: string, method: string, body = ''): Record<string, string> {
    const timestamp = Date.now().toString();
    const payload = timestamp + method.toUpperCase() + path + body;

    // Em produção, usar crypto.createHmac
    // const signature = crypto
    //   .createHmac('sha256', this.apiSecret)
    //   .update(payload)
    //   .digest('hex');

    // Para frontend, usamos uma versão simplificada
    // Em produção real, isso deve ser feito no backend
    const signature = btoa(payload).substring(0, 64);

    return {
      'X-TRF-KEY': this.apiKey,
      'X-TRF-SIGN': signature,
      'X-TRF-TS': timestamp,
      'Content-Type': 'application/json',
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const method = options.method || 'GET';
    const body = options.body as string || '';
    const headers = this.generateAuthHeaders(endpoint, method, body);

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Transfero API Error: ${JSON.stringify(error)}`);
    }

    return response.json();
  }

  // --------------------------------------------------------------------------
  // COTAÇÕES
  // --------------------------------------------------------------------------

  /**
   * Obtém cotação para conversão BRL -> BRZ
   */
  async getQuoteBrlToBrz(amountBRL: number): Promise<TransferoQuote> {
    const body = JSON.stringify({
      pair: 'BRL/BRZ',
      side: 'buy',
      amount: amountBRL,
    });

    return this.request('/quotes', {
      method: 'POST',
      body,
    });
  }

  /**
   * Obtém cotação para conversão BRZ -> BRL
   */
  async getQuoteBrzToBrl(amountBRZ: number): Promise<TransferoQuote> {
    const body = JSON.stringify({
      pair: 'BRL/BRZ',
      side: 'sell',
      amount: amountBRZ,
    });

    return this.request('/quotes', {
      method: 'POST',
      body,
    });
  }

  // --------------------------------------------------------------------------
  // ORDENS
  // --------------------------------------------------------------------------

  /**
   * Executa ordem de compra de BRZ com Real
   */
  async executeOrder(quoteId: string): Promise<TransferoOrder> {
    const body = JSON.stringify({ quoteId });

    return this.request('/orders', {
      method: 'POST',
      body,
    });
  }

  /**
   * Converte Real recebido via PIX em BRZ automaticamente
   * Este é o método principal para o fluxo de pagamentos do Vinculo
   */
  async convertFiatToBrz(
    amountBRL: number,
    destinationWallet?: string
  ): Promise<{
    success: boolean;
    quote?: TransferoQuote;
    order?: TransferoOrder;
    message: string;
    error?: unknown;
  }> {
    try {
      // 1. Obtém cotação
      const quote = await this.getQuoteBrlToBrz(amountBRL);

      // 2. Executa ordem
      const order = await this.executeOrder(quote.id);

      // 3. Se destino especificado, agenda transferência para a wallet
      if (destinationWallet || this.defaultDestinationWallet) {
        const wallet = destinationWallet || this.defaultDestinationWallet!;

        // Aguarda ordem completar e transfere
        // Em produção, isso seria feito via webhook
        await this.withdrawToWallet(
          'BRZ',
          order.netAmount,
          wallet,
          this.defaultNetwork
        );
      }

      return {
        success: true,
        quote,
        order,
        message: `R$ ${amountBRL.toFixed(2)} convertidos em ${order.netAmount.toFixed(2)} BRZ.`,
      };
    } catch (error) {
      console.error('Erro Transfero:', error);
      return {
        success: false,
        error,
        message: 'Falha na conversão. Tente novamente.',
      };
    }
  }

  /**
   * Obtém status de uma ordem
   */
  async getOrderStatus(orderId: string): Promise<TransferoOrder> {
    return this.request(`/orders/${orderId}`);
  }

  /**
   * Lista ordens recentes
   */
  async listOrders(
    limit = 50,
    offset = 0
  ): Promise<{ data: TransferoOrder[]; total: number }> {
    return this.request(`/orders?limit=${limit}&offset=${offset}`);
  }

  // --------------------------------------------------------------------------
  // SALDOS
  // --------------------------------------------------------------------------

  /**
   * Obtém saldo de todas as moedas
   */
  async getBalances(): Promise<TransferoBalance[]> {
    return this.request('/balances');
  }

  /**
   * Obtém saldo de uma moeda específica
   */
  async getBalance(currency: TransferoCurrency): Promise<TransferoBalance> {
    return this.request(`/balances/${currency}`);
  }

  /**
   * Obtém saldo em BRL (conta bancária virtual)
   */
  async getBrlBalance(): Promise<TransferoBalance> {
    return this.getBalance('BRL');
  }

  /**
   * Obtém saldo em BRZ (stablecoin)
   */
  async getBrzBalance(): Promise<TransferoBalance> {
    return this.getBalance('BRZ');
  }

  // --------------------------------------------------------------------------
  // SAQUES / TRANSFERÊNCIAS
  // --------------------------------------------------------------------------

  /**
   * Transfere crypto para carteira externa
   */
  async withdrawToWallet(
    currency: TransferoCurrency,
    amount: number,
    destinationWallet: string,
    network: TransferoNetwork = 'polygon'
  ): Promise<TransferoWithdrawal> {
    const body = JSON.stringify({
      currency,
      amount,
      destinationWallet,
      network,
    });

    return this.request('/withdrawals', {
      method: 'POST',
      body,
    });
  }

  /**
   * Transfere BRZ para carteira tesoureira do Vinculo (Operator Wallet)
   */
  async transferBrzToTreasury(
    amount: number,
    treasuryWallet: string
  ): Promise<TransferoWithdrawal> {
    return this.withdrawToWallet('BRZ', amount, treasuryWallet, 'polygon');
  }

  /**
   * Obtém status de um saque
   */
  async getWithdrawalStatus(withdrawalId: string): Promise<TransferoWithdrawal> {
    return this.request(`/withdrawals/${withdrawalId}`);
  }

  // --------------------------------------------------------------------------
  // WEBHOOKS
  // --------------------------------------------------------------------------

  /**
   * Valida assinatura do webhook
   */
  validateWebhook(signature: string, payload: string): boolean {
    if (!this.webhookSecret) return false;

    // Em produção, implementar validação HMAC
    // const expectedSignature = crypto
    //   .createHmac('sha256', this.webhookSecret)
    //   .update(payload)
    //   .digest('hex');

    return signature.length > 0;
  }

  /**
   * Processa evento do webhook
   */
  parseWebhookEvent(payload: string): TransferoWebhookEvent {
    return JSON.parse(payload);
  }
}

// ============================================================================
// MÉTRICAS DE LIQUIDEZ
// ============================================================================

export interface LiquidityMetrics {
  // Saldos
  brlBalance: number;
  brzBalance: number;
  brzValueInBrl: number;
  totalLiquidityBrl: number;

  // Cobertura
  coverageRatio: number; // brzBalance / pendingObligations
  pendingObligations: number;
  isFullyCovered: boolean;

  // Movimentação 24h
  volume24h: {
    brlIn: number;
    brlOut: number;
    brzIn: number;
    brzOut: number;
  };

  // Taxa de câmbio atual
  currentRate: number;
  rateChange24h: number;

  // Transações pendentes
  pendingConversions: number;
  pendingWithdrawals: number;

  // Status
  lastSync: string;
  status: 'healthy' | 'warning' | 'critical';
}

export function calculateLiquidityMetrics(
  brlBalance: number,
  brzBalance: number,
  pendingObligations: number,
  currentRate: number,
  volume24h: LiquidityMetrics['volume24h']
): LiquidityMetrics {
  const brzValueInBrl = brzBalance * currentRate;
  const totalLiquidityBrl = brlBalance + brzValueInBrl;
  const coverageRatio = pendingObligations > 0 ? brzBalance / pendingObligations : 1;

  let status: LiquidityMetrics['status'] = 'healthy';
  if (coverageRatio < 0.5) {
    status = 'critical';
  } else if (coverageRatio < 0.8) {
    status = 'warning';
  }

  return {
    brlBalance,
    brzBalance,
    brzValueInBrl,
    totalLiquidityBrl,
    coverageRatio,
    pendingObligations,
    isFullyCovered: coverageRatio >= 1,
    volume24h,
    currentRate,
    rateChange24h: 0, // Calculado externamente
    pendingConversions: 0,
    pendingWithdrawals: 0,
    lastSync: new Date().toISOString(),
    status,
  };
}

// ============================================================================
// MOCK SERVICE (Para desenvolvimento)
// ============================================================================

export class MockTransferoService {
  private balances: Map<TransferoCurrency, TransferoBalance> = new Map();
  private orders: Map<string, TransferoOrder> = new Map();
  private withdrawals: Map<string, TransferoWithdrawal> = new Map();

  constructor() {
    // Inicializa saldos mock
    this.balances.set('BRL', {
      currency: 'BRL',
      available: 150000,
      pending: 12500,
      total: 162500,
    });

    this.balances.set('BRZ', {
      currency: 'BRZ',
      available: 245000,
      pending: 5000,
      total: 250000,
    });
  }

  async getQuoteBrlToBrz(amountBRL: number): Promise<TransferoQuote> {
    const rate = 0.998; // BRL para BRZ (quase 1:1)
    const fee = amountBRL * 0.005; // 0.5% de taxa
    const quoteAmount = (amountBRL - fee) * rate;

    return {
      id: `quote_${Date.now()}`,
      pair: 'BRL/BRZ',
      side: 'buy',
      baseAmount: amountBRL,
      quoteAmount,
      rate,
      fee,
      netAmount: quoteAmount,
      expiresAt: new Date(Date.now() + 30000).toISOString(),
      createdAt: new Date().toISOString(),
    };
  }

  async executeOrder(quoteId: string): Promise<TransferoOrder> {
    const orderId = `order_${Date.now()}`;

    const order: TransferoOrder = {
      id: orderId,
      quoteId,
      pair: 'BRL/BRZ',
      side: 'buy',
      status: 'completed',
      baseAmount: 1000,
      quoteAmount: 995,
      rate: 0.998,
      fee: 5,
      netAmount: 995,
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    };

    this.orders.set(orderId, order);
    return order;
  }

  async convertFiatToBrz(amountBRL: number): Promise<{
    success: boolean;
    quote?: TransferoQuote;
    order?: TransferoOrder;
    message: string;
  }> {
    const quote = await this.getQuoteBrlToBrz(amountBRL);
    const order = await this.executeOrder(quote.id);

    // Atualiza saldos mock
    const brlBalance = this.balances.get('BRL')!;
    const brzBalance = this.balances.get('BRZ')!;

    brlBalance.available -= amountBRL;
    brlBalance.total -= amountBRL;
    brzBalance.available += order.netAmount;
    brzBalance.total += order.netAmount;

    return {
      success: true,
      quote,
      order,
      message: `R$ ${amountBRL.toFixed(2)} convertidos em ${order.netAmount.toFixed(2)} BRZ.`,
    };
  }

  async getBalances(): Promise<TransferoBalance[]> {
    return Array.from(this.balances.values());
  }

  async getBalance(currency: TransferoCurrency): Promise<TransferoBalance> {
    return (
      this.balances.get(currency) || {
        currency,
        available: 0,
        pending: 0,
        total: 0,
      }
    );
  }

  async getBrlBalance(): Promise<TransferoBalance> {
    return this.getBalance('BRL');
  }

  async getBrzBalance(): Promise<TransferoBalance> {
    return this.getBalance('BRZ');
  }

  async withdrawToWallet(
    currency: TransferoCurrency,
    amount: number,
    destinationWallet: string,
    network: TransferoNetwork = 'polygon'
  ): Promise<TransferoWithdrawal> {
    const withdrawalId = `withdrawal_${Date.now()}`;
    const fee = amount * 0.001; // 0.1% taxa de saque

    const withdrawal: TransferoWithdrawal = {
      id: withdrawalId,
      currency,
      amount,
      fee,
      netAmount: amount - fee,
      destinationWallet,
      network,
      status: 'completed',
      txHash: `0x${Date.now().toString(16)}${'0'.repeat(40)}`,
      createdAt: new Date().toISOString(),
      completedAt: new Date().toISOString(),
    };

    this.withdrawals.set(withdrawalId, withdrawal);

    // Atualiza saldo
    const balance = this.balances.get(currency);
    if (balance) {
      balance.available -= amount;
      balance.total -= amount;
    }

    return withdrawal;
  }

  getLiquidityMetrics(): LiquidityMetrics {
    const brlBalance = this.balances.get('BRL')!;
    const brzBalance = this.balances.get('BRZ')!;

    return calculateLiquidityMetrics(
      brlBalance.available,
      brzBalance.available,
      180000, // Obrigações pendentes (exemplo)
      1.0, // Taxa BRZ/BRL
      {
        brlIn: 45000,
        brlOut: 12000,
        brzIn: 44500,
        brzOut: 35000,
      }
    );
  }

  // Simula entrada de pagamento PIX
  async simulatePixReceived(amount: number): Promise<void> {
    const brlBalance = this.balances.get('BRL')!;
    brlBalance.available += amount;
    brlBalance.total += amount;

    // Auto-converte para BRZ
    await this.convertFiatToBrz(amount);
  }
}
