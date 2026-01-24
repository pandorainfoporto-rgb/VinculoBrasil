// ============================================
// HOOK: usePaymentPolling
// Polling automático para detectar pagamento Pix confirmado
// ============================================

import { useEffect, useState } from 'react';

interface PollingOptions {
  orderId: string | null;
  enabled: boolean; // Só roda se estiver esperando pagamento
  interval?: number; // Intervalo em ms (default: 3000)
  onSuccess?: (txHash?: string) => void;
  onExpired?: () => void;
}

interface PaymentStatus {
  status: 'PENDING' | 'PAID' | 'SETTLING' | 'COMPLETED' | 'FAILED' | 'EXPIRED';
  txHash?: string;
}

export function usePaymentPolling({
  orderId,
  enabled,
  interval = 3000,
  onSuccess,
  onExpired,
}: PollingOptions) {
  const [isPaid, setIsPaid] = useState(false);
  const [isFailed, setIsFailed] = useState(false);
  const [txHash, setTxHash] = useState<string | undefined>();

  useEffect(() => {
    if (!enabled || !orderId || isPaid || isFailed) {
      return;
    }

    const checkStatus = async () => {
      try {
        const response = await fetch(`/api/invest/orders/${orderId}/status`);
        const data: PaymentStatus = await response.json();

        console.log(`🔄 Polling pagamento ${orderId}: ${data.status}`);

        // Pagamento confirmado ou liquidado
        if (data.status === 'COMPLETED' || data.status === 'SETTLING' || data.status === 'PAID') {
          setIsPaid(true);
          setTxHash(data.txHash);
          onSuccess?.(data.txHash);
        }

        // Pagamento expirado ou falhou
        if (data.status === 'EXPIRED') {
          setIsFailed(true);
          onExpired?.();
        }

        if (data.status === 'FAILED') {
          setIsFailed(true);
        }
      } catch (error) {
        console.error('Erro ao verificar status do pagamento:', error);
      }
    };

    // Primeira verificação imediata
    checkStatus();

    // Polling contínuo
    const intervalId = setInterval(checkStatus, interval);

    return () => clearInterval(intervalId);
  }, [orderId, enabled, isPaid, isFailed, interval, onSuccess, onExpired]);

  return {
    isPaid,
    isFailed,
    txHash,
  };
}
