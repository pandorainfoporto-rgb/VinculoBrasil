/**
 * Vinculo.io - React Hook para Wallet Web3
 *
 * Hook que gerencia conexao de carteira, estado e interacoes com o blockchain.
 *
 * Uso:
 * const { address, isConnected, connect, disconnect } = useWallet();
 */

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import {
  viemClient,
  type WalletState,
  type TransactionResult,
} from '@/lib/web3/wagmi-config';
import { getNetworkConfig, isDemoMode, web3Log } from '@/lib/web3/config';

// ============================================
// TYPES
// ============================================

export interface UseWalletReturn {
  // State
  address: string | null;
  chainId: number | null;
  isConnected: boolean;
  isConnecting: boolean;
  isCorrectNetwork: boolean;
  error: string | null;

  // Actions
  connect: (provider?: 'metamask' | 'walletconnect') => Promise<void>;
  disconnect: () => void;
  switchNetwork: () => Promise<void>;

  // Utilities
  formatAddress: (chars?: number) => string;
  explorerUrl: string | null;
}

export interface UseContractReadReturn<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export interface UseContractWriteReturn {
  write: (args?: readonly unknown[]) => Promise<TransactionResult | null>;
  isLoading: boolean;
  error: string | null;
  txHash: string | null;
  status: 'idle' | 'pending' | 'success' | 'error';
  reset: () => void;
}

// ============================================
// useWallet HOOK
// ============================================

export function useWallet(): UseWalletReturn {
  const [state, setState] = useState<WalletState>(viemClient.getState());
  const network = getNetworkConfig();

  // Subscribe to wallet state changes
  useEffect(() => {
    const unsubscribe = viemClient.subscribe((newState) => {
      setState(newState);
    });
    return unsubscribe;
  }, []);

  // Connect wallet
  const connect = useCallback(
    async (provider: 'metamask' | 'walletconnect' = 'metamask') => {
      try {
        await viemClient.connect(provider);

        toast.success('Carteira Conectada', {
          description: isDemoMode
            ? 'Modo demonstracao ativo'
            : `Conectado a ${network.name}`,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Erro ao conectar';

        toast.error('Erro de Conexao', {
          description: message,
        });

        throw error;
      }
    },
    [network.name]
  );

  // Disconnect wallet
  const disconnect = useCallback(() => {
    viemClient.disconnect();

    toast.info('Carteira Desconectada', {
      description: 'Sua carteira foi desconectada',
    });
  }, []);

  // Switch to correct network
  const switchNetwork = useCallback(async () => {
    try {
      await viemClient.switchNetwork(network.chainId);

      toast.success('Rede Alterada', {
        description: `Conectado a ${network.name}`,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao trocar rede';

      toast.error('Erro de Rede', {
        description: message,
      });

      throw error;
    }
  }, [network.chainId, network.name]);

  // Format address for display
  const formatAddress = useCallback(
    (chars = 4) => {
      if (!state.address) return '';
      return viemClient.formatAddress(state.address, chars);
    },
    [state.address]
  );

  // Explorer URL for current address
  const explorerUrl = state.address
    ? `${network.blockExplorer}/address/${state.address}`
    : null;

  return {
    address: state.address,
    chainId: state.chainId,
    isConnected: state.isConnected,
    isConnecting: state.isConnecting,
    isCorrectNetwork: viemClient.isCorrectNetwork(),
    error: state.error,
    connect,
    disconnect,
    switchNetwork,
    formatAddress,
    explorerUrl,
  };
}

// ============================================
// useContractRead HOOK
// ============================================

export function useContractRead<T>(
  functionName: string,
  args?: readonly unknown[],
  options?: {
    enabled?: boolean;
    refetchInterval?: number;
  }
): UseContractReadReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const enabled = options?.enabled ?? true;
  const refetchInterval = options?.refetchInterval;

  const fetchData = useCallback(async () => {
    if (!enabled) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await viemClient.readContract<T>(functionName, args);
      setData(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao ler contrato';
      setError(message);
      web3Log('Contract read error:', functionName, err);
    } finally {
      setIsLoading(false);
    }
  }, [functionName, args, enabled]);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Refetch interval
  useEffect(() => {
    if (!refetchInterval || !enabled) return;

    const interval = setInterval(fetchData, refetchInterval);
    return () => clearInterval(interval);
  }, [fetchData, refetchInterval, enabled]);

  return {
    data,
    isLoading,
    error,
    refetch: fetchData,
  };
}

// ============================================
// useContractWrite HOOK
// ============================================

export function useContractWrite(
  functionName: string,
  options?: {
    value?: bigint;
    onSuccess?: (result: TransactionResult) => void;
    onError?: (error: Error) => void;
  }
): UseContractWriteReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');

  const write = useCallback(
    async (args?: readonly unknown[]): Promise<TransactionResult | null> => {
      setIsLoading(true);
      setError(null);
      setStatus('pending');

      try {
        const result = await viemClient.writeContract(functionName, args, {
          value: options?.value,
        });

        setTxHash(result.hash);
        setStatus('success');

        toast.success('Transacao Enviada', {
          description: `Hash: ${viemClient.formatAddress(result.hash, 8)}`,
        });

        options?.onSuccess?.(result);
        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erro ao executar transacao';
        setError(message);
        setStatus('error');

        toast.error('Erro na Transacao', {
          description: message,
        });

        options?.onError?.(err instanceof Error ? err : new Error(message));
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [functionName, options]
  );

  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
    setTxHash(null);
    setStatus('idle');
  }, []);

  return {
    write,
    isLoading,
    error,
    txHash,
    status,
    reset,
  };
}

// ============================================
// SPECIALIZED HOOKS
// ============================================

/**
 * Hook para obter estatisticas do protocolo
 */
export function useProtocolStats() {
  return useContractRead<{
    totalVolume: bigint;
    totalActiveRentals: bigint;
    totalPaymentsProcessed: bigint;
    totalContracts: bigint;
  }>('getStats', undefined, {
    refetchInterval: 30000, // 30 segundos
  });
}

/**
 * Hook para obter detalhes de um contrato de aluguel
 */
export function useRental(tokenId: bigint | number | null) {
  return useContractRead('getRental', tokenId !== null ? [BigInt(tokenId)] : undefined, {
    enabled: tokenId !== null,
  });
}

/**
 * Hook para obter historico de pagamentos
 */
export function usePaymentHistory(tokenId: bigint | number | null) {
  return useContractRead('getPaymentHistory', tokenId !== null ? [BigInt(tokenId)] : undefined, {
    enabled: tokenId !== null,
  });
}

/**
 * Hook para obter contratos de um locador
 */
export function useLandlordRentals(address: string | null) {
  return useContractRead<bigint[]>('getLandlordRentals', address ? [address] : undefined, {
    enabled: !!address,
  });
}

/**
 * Hook para obter contratos de um locatario
 */
export function useTenantRentals(address: string | null) {
  return useContractRead<bigint[]>('getTenantRentals', address ? [address] : undefined, {
    enabled: !!address,
  });
}

/**
 * Hook para obter contratos de um garantidor
 */
export function useGuarantorRentals(address: string | null) {
  return useContractRead<bigint[]>('getGuarantorRentals', address ? [address] : undefined, {
    enabled: !!address,
  });
}

/**
 * Hook para criar um novo contrato de aluguel
 */
export function useCreateRental(options?: {
  onSuccess?: (result: TransactionResult) => void;
  onError?: (error: Error) => void;
}) {
  return useContractWrite('createRental', options);
}

/**
 * Hook para pagar aluguel
 */
export function usePayRent(
  rentAmount: bigint,
  options?: {
    onSuccess?: (result: TransactionResult) => void;
    onError?: (error: Error) => void;
  }
) {
  return useContractWrite('payRent', {
    value: rentAmount,
    ...options,
  });
}

/**
 * Hook para bloquear colateral
 */
export function useLockCollateral(options?: {
  onSuccess?: (result: TransactionResult) => void;
  onError?: (error: Error) => void;
}) {
  return useContractWrite('lockCollateral', options);
}

/**
 * Hook para abrir disputa
 */
export function useOpenDispute(options?: {
  onSuccess?: (result: TransactionResult) => void;
  onError?: (error: Error) => void;
}) {
  return useContractWrite('openDispute', options);
}

// ============================================
// EXPORTS
// ============================================

export default useWallet;
