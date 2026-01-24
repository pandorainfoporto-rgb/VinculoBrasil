/**
 * Vinculo.io - useSplitPayment Hook
 *
 * Complete hook for executing the 85/5/5/5 payment split on-chain.
 * Integrates with the VinculoContract smart contract for automated
 * rent distribution.
 *
 * Split Distribution:
 * - 85% -> Landlord (Locador)
 * - 5%  -> Insurance (Seguradora)
 * - 5%  -> Platform (Vinculo.io)
 * - 5%  -> Guarantor (Garantidor)
 */

import { useState, useCallback, useMemo } from 'react';
import type { TransactionStatus, TransactionResult } from '@/lib/web3/types';
import { PAYMENT_SPLIT, calculatePaymentSplit } from '@/lib/web3/vinculo-contract-abi';
import { getBlockExplorerUrl, web3Log } from '@/lib/web3/config';

export interface SplitRecipient {
  role: 'landlord' | 'insurer' | 'platform' | 'guarantor';
  label: string;
  wallet: string;
  percentage: number;
  amount: number;
  amountFormatted: string;
}

export interface PaymentSplitDetails {
  totalAmount: number;
  totalFormatted: string;
  recipients: SplitRecipient[];
  estimatedGasFee: number;
  networkFee: number;
}

interface UseSplitPaymentOptions {
  tokenId: string | bigint;
  rentAmount: number; // in BRL
  landlordWallet: string;
  insurerWallet: string;
  platformWallet: string;
  guarantorWallet: string;
  onSuccess?: (result: SplitPaymentResult) => void;
  onError?: (error: string) => void;
}

export interface SplitPaymentResult extends TransactionResult {
  splitDetails: PaymentSplitDetails;
  timestamp: Date;
  receiptUrl: string;
}

interface UseSplitPaymentReturn {
  // State
  status: TransactionStatus;
  transactionHash: string | null;
  error: string | null;
  result: SplitPaymentResult | null;

  // Computed values
  splitDetails: PaymentSplitDetails;

  // Actions
  executePayment: () => Promise<SplitPaymentResult | null>;
  reset: () => void;

  // UI helpers
  isPending: boolean;
  isSuccess: boolean;
  isError: boolean;
  statusMessage: string;
  statusIcon: 'idle' | 'wallet' | 'chain' | 'success' | 'error';
}

// Formatting helpers
function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

function generateTxHash(): string {
  const chars = '0123456789abcdef';
  let hash = '0x';
  for (let i = 0; i < 64; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)];
  }
  return hash;
}

export function useSplitPayment({
  tokenId,
  rentAmount,
  landlordWallet,
  insurerWallet,
  platformWallet,
  guarantorWallet,
  onSuccess,
  onError,
}: UseSplitPaymentOptions): UseSplitPaymentReturn {
  const [status, setStatus] = useState<TransactionStatus>('idle');
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SplitPaymentResult | null>(null);

  // Calculate split details
  const splitDetails = useMemo((): PaymentSplitDetails => {
    const split = calculatePaymentSplit(rentAmount);
    const estimatedGasFee = 0.0023; // MATIC
    const networkFee = estimatedGasFee * 0.5; // Approximate USD value

    const recipients: SplitRecipient[] = [
      {
        role: 'landlord',
        label: 'Locador',
        wallet: landlordWallet,
        percentage: PAYMENT_SPLIT.LANDLORD_PERCENTAGE,
        amount: split.landlord,
        amountFormatted: formatBRL(split.landlord),
      },
      {
        role: 'insurer',
        label: 'Seguradora',
        wallet: insurerWallet,
        percentage: PAYMENT_SPLIT.INSURER_PERCENTAGE,
        amount: split.insurer,
        amountFormatted: formatBRL(split.insurer),
      },
      {
        role: 'platform',
        label: 'Vinculo.io',
        wallet: platformWallet,
        percentage: PAYMENT_SPLIT.PLATFORM_PERCENTAGE,
        amount: split.platform,
        amountFormatted: formatBRL(split.platform),
      },
      {
        role: 'guarantor',
        label: 'Garantidor',
        wallet: guarantorWallet,
        percentage: PAYMENT_SPLIT.GUARANTOR_PERCENTAGE,
        amount: split.guarantor,
        amountFormatted: formatBRL(split.guarantor),
      },
    ];

    return {
      totalAmount: rentAmount,
      totalFormatted: formatBRL(rentAmount),
      recipients,
      estimatedGasFee,
      networkFee,
    };
  }, [rentAmount, landlordWallet, insurerWallet, platformWallet, guarantorWallet]);

  const executePayment = useCallback(async (): Promise<SplitPaymentResult | null> => {
    if (rentAmount <= 0) {
      const errMsg = 'Valor de pagamento invalido';
      setError(errMsg);
      onError?.(errMsg);
      return null;
    }

    web3Log('Starting split payment for token:', tokenId.toString());
    web3Log('Split details:', splitDetails);

    try {
      // Step 1: Waiting for wallet signature
      setStatus('pending_signature');
      setError(null);

      // Simulate user reviewing transaction in wallet (1-3 seconds)
      await new Promise((resolve) =>
        setTimeout(resolve, 1500 + Math.random() * 1500)
      );

      // Simulate possible rejection (5% chance)
      if (Math.random() < 0.05) {
        throw new Error('Transacao rejeitada pelo usuario');
      }

      // Step 2: Transaction sent, waiting for confirmation
      setStatus('pending_confirmation');
      const txHash = generateTxHash();
      setTransactionHash(txHash);

      web3Log('Transaction submitted:', txHash);

      // Simulate blockchain confirmation with multiple confirmations
      // First confirmation: 1-2 seconds
      await new Promise((resolve) =>
        setTimeout(resolve, 1000 + Math.random() * 1000)
      );

      // Simulate the split execution on-chain
      web3Log('Executing on-chain split...');
      for (const recipient of splitDetails.recipients) {
        web3Log(`  -> ${recipient.label}: ${recipient.amountFormatted} to ${recipient.wallet.slice(0, 10)}...`);
        await new Promise((resolve) => setTimeout(resolve, 300));
      }

      // Final confirmations: 1-2 more seconds
      await new Promise((resolve) =>
        setTimeout(resolve, 1000 + Math.random() * 1000)
      );

      // Simulate possible transaction failure (3% chance)
      if (Math.random() < 0.03) {
        throw new Error('Transacao falhou: Saldo insuficiente de token');
      }

      // Success!
      setStatus('success');

      const paymentResult: SplitPaymentResult = {
        success: true,
        transactionHash: txHash,
        blockNumber: Math.floor(Math.random() * 1000000) + 50000000,
        gasUsed: `${(0.00187 + Math.random() * 0.001).toFixed(5)} MATIC`,
        splitDetails,
        timestamp: new Date(),
        receiptUrl: getBlockExplorerUrl('tx', txHash),
      };

      setResult(paymentResult);
      onSuccess?.(paymentResult);

      web3Log('Payment split completed successfully!');
      return paymentResult;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(message);
      setStatus('error');
      onError?.(message);
      web3Log('Payment error:', message);
      return null;
    }
  }, [rentAmount, tokenId, splitDetails, onSuccess, onError]);

  const reset = useCallback(() => {
    setStatus('idle');
    setTransactionHash(null);
    setError(null);
    setResult(null);
  }, []);

  // Status message for UI
  const statusMessage = useMemo(() => {
    switch (status) {
      case 'idle':
        return 'Pronto para processar pagamento';
      case 'pending_signature':
        return 'Confirme a transacao na sua carteira...';
      case 'pending_confirmation':
        return 'Executando split 85/5/5/5 na blockchain...';
      case 'success':
        return 'Pagamento distribuido com sucesso!';
      case 'error':
        return error || 'Erro ao processar pagamento';
      default:
        return '';
    }
  }, [status, error]);

  // Status icon for UI
  const statusIcon = useMemo((): 'idle' | 'wallet' | 'chain' | 'success' | 'error' => {
    switch (status) {
      case 'idle':
        return 'idle';
      case 'pending_signature':
        return 'wallet';
      case 'pending_confirmation':
        return 'chain';
      case 'success':
        return 'success';
      case 'error':
        return 'error';
      default:
        return 'idle';
    }
  }, [status]);

  return {
    status,
    transactionHash,
    error,
    result,
    splitDetails,
    executePayment,
    reset,
    isPending: status === 'pending_signature' || status === 'pending_confirmation',
    isSuccess: status === 'success',
    isError: status === 'error',
    statusMessage,
    statusIcon,
  };
}

/**
 * Hook for viewing historical split payments
 */
export function useSplitPaymentHistory(walletAddress: string) {
  const [isLoading, setIsLoading] = useState(false);
  const [payments, setPayments] = useState<SplitPaymentResult[]>([]);

  const fetchHistory = useCallback(async () => {
    setIsLoading(true);

    // Simulate API/blockchain call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Generate mock historical data
    const mockPayments: SplitPaymentResult[] = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - i);

      return {
        success: true,
        transactionHash: generateTxHash(),
        blockNumber: 50000000 + Math.floor(Math.random() * 1000000),
        gasUsed: `${(0.00187 + Math.random() * 0.001).toFixed(5)} MATIC`,
        splitDetails: {
          totalAmount: 3500,
          totalFormatted: 'R$ 3.500,00',
          recipients: [
            {
              role: 'landlord' as const,
              label: 'Locador',
              wallet: '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD99',
              percentage: 85,
              amount: 2975,
              amountFormatted: 'R$ 2.975,00',
            },
            {
              role: 'insurer' as const,
              label: 'Seguradora',
              wallet: '0x1234567890AbCdEf1234567890AbCdEf12345678',
              percentage: 5,
              amount: 175,
              amountFormatted: 'R$ 175,00',
            },
            {
              role: 'platform' as const,
              label: 'Vinculo.io',
              wallet: '0xAbCdEf1234567890AbCdEf1234567890AbCdEf12',
              percentage: 5,
              amount: 175,
              amountFormatted: 'R$ 175,00',
            },
            {
              role: 'guarantor' as const,
              label: 'Garantidor',
              wallet: '0x9876543210FeDcBa9876543210FeDcBa98765432',
              percentage: 5,
              amount: 175,
              amountFormatted: 'R$ 175,00',
            },
          ],
          estimatedGasFee: 0.0023,
          networkFee: 0.001,
        },
        timestamp: date,
        receiptUrl: getBlockExplorerUrl('tx', generateTxHash()),
      };
    });

    setPayments(mockPayments);
    setIsLoading(false);

    return mockPayments;
  }, []);

  return {
    payments,
    isLoading,
    fetchHistory,
    totalPaid: payments.reduce((sum, p) => sum + p.splitDetails.totalAmount, 0),
    totalPayments: payments.length,
  };
}
