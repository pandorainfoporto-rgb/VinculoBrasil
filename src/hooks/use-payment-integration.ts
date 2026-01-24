/**
 * Vinculo.io - Payment Integration Hook
 *
 * Hook React para integração completa de pagamentos:
 * - Criação de cobranças PIX/Boleto via Asaas
 * - Split automático 85/5/5/5
 * - Acompanhamento de status
 * - Webhook handling
 * - Integração com blockchain
 */

import { useState, useCallback } from 'react';
import {
  type AsaasPaymentResponse,
  type AsaasCustomer,
  type AsaasBillingType,
  MockAsaasService,
  formatCpfCnpj,
  formatCurrency,
  generatePaymentReference,
  calculateDueDate,
} from '@/lib/bridge/asaas-service';
import {
  type WebhookPayload,
  type CloudFunctionResponse,
  calculateSplitDistribution,
  VINCULO_SPLIT_CONFIG,
} from '@/lib/bridge/cloud-functions';

// ============================================================================
// TIPOS
// ============================================================================

export interface PaymentRequest {
  contractId: string;
  tokenId: string;
  rentAmount: number;
  dueDay: number;
  tenant: {
    name: string;
    email: string;
    cpf: string;
    phone?: string;
  };
  landlord: {
    walletId: string;
  };
  insurer: {
    walletId: string;
  };
  guarantor?: {
    walletId: string;
  };
  billingType: AsaasBillingType;
}

export interface PaymentState {
  isLoading: boolean;
  error: string | null;
  customer: AsaasCustomer | null;
  payment: AsaasPaymentResponse | null;
  pixQrCode: string | null;
  pixPayload: string | null;
  boletoUrl: string | null;
  boletoBarcode: string | null;
  blockchainTx: CloudFunctionResponse | null;
  splitDistribution: {
    landlord: number;
    insurer: number;
    platform: number;
    guarantor?: number;
  } | null;
}

export interface PaymentActions {
  createPayment: (request: PaymentRequest) => Promise<void>;
  checkPaymentStatus: (paymentId: string) => Promise<AsaasPaymentResponse | null>;
  confirmPaymentOnBlockchain: (paymentId: string) => Promise<CloudFunctionResponse | null>;
  cancelPayment: (paymentId: string) => Promise<boolean>;
  reset: () => void;
}

// ============================================================================
// ESTADO INICIAL
// ============================================================================

const initialState: PaymentState = {
  isLoading: false,
  error: null,
  customer: null,
  payment: null,
  pixQrCode: null,
  pixPayload: null,
  boletoUrl: null,
  boletoBarcode: null,
  blockchainTx: null,
  splitDistribution: null,
};

// ============================================================================
// HOOK
// ============================================================================

export function usePaymentIntegration(): [PaymentState, PaymentActions] {
  const [state, setState] = useState<PaymentState>(initialState);

  // Instância do serviço (mock em desenvolvimento)
  const asaasService = new MockAsaasService();

  /**
   * Cria cobrança completa com split
   */
  const createPayment = useCallback(
    async (request: PaymentRequest) => {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      try {
        // 1. Cria ou busca cliente
        const customer = await asaasService.createCustomer({
          name: request.tenant.name,
          email: request.tenant.email,
          cpfCnpj: formatCpfCnpj(request.tenant.cpf),
          phone: request.tenant.phone,
          externalReference: `tenant_${request.contractId}`,
        });

        // 2. Calcula split
        const splitDistribution = calculateSplitDistribution(
          request.rentAmount,
          request.landlord.walletId,
          request.insurer.walletId,
          'vinculo_platform_wallet',
          request.guarantor?.walletId
        );

        // 3. Cria pagamento
        const payment = await asaasService.createPayment({
          customer: customer.id,
          billingType: request.billingType,
          value: formatCurrency(request.rentAmount),
          dueDate: calculateDueDate(request.dueDay),
          description: `Aluguel - Contrato ${request.contractId}`,
          externalReference: generatePaymentReference(
            request.contractId,
            new Date().getMonth() + 1,
            new Date().getFullYear()
          ),
        });

        // 4. Atualiza estado com dados do pagamento
        const newState: Partial<PaymentState> = {
          isLoading: false,
          customer,
          payment,
          splitDistribution: {
            landlord: splitDistribution.landlordAmount,
            insurer: splitDistribution.insurerAmount,
            platform: splitDistribution.platformAmount,
            guarantor: splitDistribution.guarantorAmount,
          },
        };

        // 5. Se PIX, extrai QR Code
        if (request.billingType === 'PIX' && payment.pixTransaction) {
          newState.pixQrCode = payment.pixTransaction.encodedImage;
          newState.pixPayload = payment.pixTransaction.payload;
        }

        // 6. Se Boleto, extrai URL
        if (request.billingType === 'BOLETO') {
          newState.boletoUrl = payment.bankSlipUrl || null;
        }

        setState(prev => ({ ...prev, ...newState }));
      } catch (error) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Erro ao criar pagamento',
        }));
      }
    },
    [asaasService]
  );

  /**
   * Verifica status do pagamento
   */
  const checkPaymentStatus = useCallback(
    async (paymentId: string): Promise<AsaasPaymentResponse | null> => {
      try {
        const payment = await asaasService.getPayment(paymentId);
        setState(prev => ({ ...prev, payment }));
        return payment;
      } catch (error) {
        setState(prev => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Erro ao verificar pagamento',
        }));
        return null;
      }
    },
    [asaasService]
  );

  /**
   * Confirma pagamento na blockchain após recebimento
   */
  const confirmPaymentOnBlockchain = useCallback(
    async (paymentId: string): Promise<CloudFunctionResponse | null> => {
      setState(prev => ({ ...prev, isLoading: true }));

      try {
        // Verifica se pagamento foi confirmado
        const payment = await asaasService.getPayment(paymentId);

        if (payment.status !== 'CONFIRMED' && payment.status !== 'RECEIVED') {
          throw new Error('Pagamento ainda não foi confirmado');
        }

        // Simula chamada para Cloud Function
        const webhookPayload: WebhookPayload = {
          contractId: payment.externalReference || '',
          tokenId: payment.id,
          amountPaid: payment.value,
          payerId: payment.customer,
          paymentMethod: payment.billingType === 'PIX' ? 'PIX' : 'Boleto',
          paymentReference: payment.id,
          timestamp: new Date().toISOString(),
          idempotencyKey: `${payment.id}_${Date.now()}`,
        };

        // Simula resposta da Cloud Function
        await new Promise(resolve => setTimeout(resolve, 2000));

        const blockchainTx: CloudFunctionResponse = {
          status: 'success',
          hash: `0x${Math.random().toString(16).substr(2, 64)}`,
          blockNumber: Math.floor(Math.random() * 1000000) + 50000000,
          gasUsed: '85000',
          timestamp: new Date().toISOString(),
        };

        setState(prev => ({
          ...prev,
          isLoading: false,
          payment,
          blockchainTx,
        }));

        return blockchainTx;
      } catch (error) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Erro ao confirmar na blockchain',
        }));
        return null;
      }
    },
    [asaasService]
  );

  /**
   * Cancela pagamento (apenas se ainda não foi pago)
   */
  const cancelPayment = useCallback(async (_paymentId: string): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true }));

    try {
      // Em produção, chamaria API de cancelamento
      await new Promise(resolve => setTimeout(resolve, 1000));

      setState(prev => ({
        ...prev,
        isLoading: false,
        payment: prev.payment ? { ...prev.payment, status: 'REFUNDED' as const } : null,
      }));

      return true;
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Erro ao cancelar pagamento',
      }));
      return false;
    }
  }, []);

  /**
   * Reseta estado
   */
  const reset = useCallback(() => {
    setState(initialState);
  }, []);

  return [
    state,
    {
      createPayment,
      checkPaymentStatus,
      confirmPaymentOnBlockchain,
      cancelPayment,
      reset,
    },
  ];
}

// ============================================================================
// HOOK SIMPLIFICADO PARA PIX
// ============================================================================

export function usePixPayment() {
  const [state, actions] = usePaymentIntegration();

  const createPixPayment = useCallback(
    async (
      contractId: string,
      tokenId: string,
      amount: number,
      tenant: PaymentRequest['tenant'],
      landlordWalletId: string,
      insurerWalletId: string,
      guarantorWalletId?: string
    ) => {
      await actions.createPayment({
        contractId,
        tokenId,
        rentAmount: amount,
        dueDay: new Date().getDate(),
        tenant,
        landlord: { walletId: landlordWalletId },
        insurer: { walletId: insurerWalletId },
        guarantor: guarantorWalletId ? { walletId: guarantorWalletId } : undefined,
        billingType: 'PIX',
      });
    },
    [actions]
  );

  return {
    ...state,
    createPixPayment,
    checkStatus: actions.checkPaymentStatus,
    confirmOnBlockchain: actions.confirmPaymentOnBlockchain,
    reset: actions.reset,
  };
}

// ============================================================================
// HOOK SIMPLIFICADO PARA BOLETO
// ============================================================================

export function useBoletoPayment() {
  const [state, actions] = usePaymentIntegration();

  const createBoletoPayment = useCallback(
    async (
      contractId: string,
      tokenId: string,
      amount: number,
      dueDay: number,
      tenant: PaymentRequest['tenant'],
      landlordWalletId: string,
      insurerWalletId: string,
      guarantorWalletId?: string
    ) => {
      await actions.createPayment({
        contractId,
        tokenId,
        rentAmount: amount,
        dueDay,
        tenant,
        landlord: { walletId: landlordWalletId },
        insurer: { walletId: insurerWalletId },
        guarantor: guarantorWalletId ? { walletId: guarantorWalletId } : undefined,
        billingType: 'BOLETO',
      });
    },
    [actions]
  );

  return {
    ...state,
    createBoletoPayment,
    checkStatus: actions.checkPaymentStatus,
    confirmOnBlockchain: actions.confirmPaymentOnBlockchain,
    reset: actions.reset,
  };
}

// ============================================================================
// UTILITÁRIOS
// ============================================================================

/**
 * Formata valor para exibição em BRL
 */
export function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

/**
 * Calcula valores do split para exibição
 */
export function calculateSplitPreview(rentAmount: number, hasGuarantor: boolean) {
  const landlordPercent = hasGuarantor
    ? VINCULO_SPLIT_CONFIG.landlordPercentage
    : VINCULO_SPLIT_CONFIG.landlordPercentage + VINCULO_SPLIT_CONFIG.guarantorPercentage;

  return {
    landlord: {
      percent: landlordPercent,
      value: (rentAmount * landlordPercent) / 100,
    },
    insurer: {
      percent: VINCULO_SPLIT_CONFIG.insurerPercentage,
      value: (rentAmount * VINCULO_SPLIT_CONFIG.insurerPercentage) / 100,
    },
    platform: {
      percent: VINCULO_SPLIT_CONFIG.platformPercentage,
      value: (rentAmount * VINCULO_SPLIT_CONFIG.platformPercentage) / 100,
    },
    guarantor: hasGuarantor
      ? {
          percent: VINCULO_SPLIT_CONFIG.guarantorPercentage,
          value: (rentAmount * VINCULO_SPLIT_CONFIG.guarantorPercentage) / 100,
        }
      : null,
  };
}

/**
 * Retorna cor do status do pagamento
 */
export function getPaymentStatusColor(status: string): string {
  switch (status) {
    case 'CONFIRMED':
    case 'RECEIVED':
      return 'text-green-600 bg-green-100';
    case 'PENDING':
      return 'text-yellow-600 bg-yellow-100';
    case 'OVERDUE':
      return 'text-red-600 bg-red-100';
    case 'REFUNDED':
      return 'text-gray-600 bg-gray-100';
    default:
      return 'text-blue-600 bg-blue-100';
  }
}

/**
 * Traduz status do pagamento
 */
export function translatePaymentStatus(status: string): string {
  const translations: Record<string, string> = {
    PENDING: 'Pendente',
    RECEIVED: 'Recebido',
    CONFIRMED: 'Confirmado',
    OVERDUE: 'Atrasado',
    REFUNDED: 'Estornado',
    REFUND_REQUESTED: 'Estorno Solicitado',
    CHARGEBACK_REQUESTED: 'Disputa Solicitada',
    AWAITING_RISK_ANALYSIS: 'Em Análise',
  };

  return translations[status] || status;
}
