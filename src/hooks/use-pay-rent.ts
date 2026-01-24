/**
 * Vinculo.io - usePayRent Hook
 *
 * Hook for paying rent via blockchain with automatic 85/5/5/5 split.
 * Simulates wagmi's useContractWrite behavior.
 */

import { useState, useCallback } from 'react';
import type { TransactionStatus, TransactionResult, PaymentSplitResult } from '@/lib/web3/types';
import { PAYMENT_SPLIT } from '@/lib/web3/vinculo-contract-abi';

interface UsePayRentOptions {
  tokenId: bigint | string;
  amountBrl: number;
  onSuccess?: (result: TransactionResult) => void;
  onError?: (error: string) => void;
}

interface UsePayRentReturn {
  // Transaction state
  status: TransactionStatus;
  transactionHash: string | null;
  error: string | null;

  // Computed values
  split: PaymentSplitResult | null;
  estimatedGas: string;

  // Actions
  pay: () => Promise<TransactionResult | null>;
  reset: () => void;

  // UI helpers
  isPending: boolean;
  isSuccess: boolean;
  statusMessage: string;
}

// Generate realistic-looking transaction hash
function generateTxHash(): string {
  const chars = '0123456789abcdef';
  let hash = '0x';
  for (let i = 0; i < 64; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)];
  }
  return hash;
}

// Calculate split amounts
function calculateSplit(amountBrl: number): PaymentSplitResult {
  const toWei = (brl: number) => BigInt(Math.round(brl * 10000)); // BRZ has 4 decimals

  return {
    landlordAmount: toWei((amountBrl * PAYMENT_SPLIT.LANDLORD_PERCENTAGE) / 100),
    insurerAmount: toWei((amountBrl * PAYMENT_SPLIT.INSURER_PERCENTAGE) / 100),
    platformAmount: toWei((amountBrl * PAYMENT_SPLIT.PLATFORM_PERCENTAGE) / 100),
    guarantorAmount: toWei((amountBrl * PAYMENT_SPLIT.GUARANTOR_PERCENTAGE) / 100),
  };
}

export function usePayRent({
  tokenId,
  amountBrl,
  onSuccess,
  onError,
}: UsePayRentOptions): UsePayRentReturn {
  const [status, setStatus] = useState<TransactionStatus>('idle');
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Pre-calculate split for UI display
  const split = amountBrl > 0 ? calculateSplit(amountBrl) : null;

  // Simulated gas estimate (in MATIC)
  const estimatedGas = '0.0023 MATIC';

  const pay = useCallback(async (): Promise<TransactionResult | null> => {
    if (amountBrl <= 0) {
      const errMsg = 'Valor de pagamento inv\u00e1lido';
      setError(errMsg);
      onError?.(errMsg);
      return null;
    }

    try {
      // Step 1: Waiting for wallet signature
      setStatus('pending_signature');
      setError(null);

      // Simulate user reviewing transaction in wallet (1-3 seconds)
      await new Promise((resolve) =>
        setTimeout(resolve, 1000 + Math.random() * 2000)
      );

      // Simulate possible rejection (5% chance)
      if (Math.random() < 0.05) {
        throw new Error('Transacao rejeitada pelo usuario');
      }

      // Step 2: Transaction sent, waiting for confirmation
      setStatus('pending_confirmation');
      const txHash = generateTxHash();
      setTransactionHash(txHash);

      // Simulate blockchain confirmation (2-5 seconds)
      await new Promise((resolve) =>
        setTimeout(resolve, 2000 + Math.random() * 3000)
      );

      // Simulate possible transaction failure (3% chance)
      if (Math.random() < 0.03) {
        throw new Error('Transacao falhou: Gas insuficiente');
      }

      // Success!
      setStatus('success');

      const result: TransactionResult = {
        success: true,
        transactionHash: txHash,
        blockNumber: Math.floor(Math.random() * 1000000) + 50000000,
        gasUsed: '0.00187 MATIC',
      };

      onSuccess?.(result);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(message);
      setStatus('error');
      onError?.(message);
      return null;
    }
  }, [amountBrl, onSuccess, onError]);

  const reset = useCallback(() => {
    setStatus('idle');
    setTransactionHash(null);
    setError(null);
  }, []);

  // Status message for UI
  const statusMessage = (() => {
    switch (status) {
      case 'idle':
        return 'Pronto para pagar';
      case 'pending_signature':
        return 'Confirme a transacao na sua carteira...';
      case 'pending_confirmation':
        return 'Validando pagamento na rede Blockchain...';
      case 'success':
        return 'Pagamento confirmado! Recibo imutavel gerado.';
      case 'error':
        return error || 'Erro ao processar pagamento';
      default:
        return '';
    }
  })();

  return {
    status,
    transactionHash,
    error,
    split,
    estimatedGas,
    pay,
    reset,
    isPending: status === 'pending_signature' || status === 'pending_confirmation',
    isSuccess: status === 'success',
    statusMessage,
  };
}
