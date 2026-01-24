// ============================================
// P2P BLOCKCHAIN HOOK
// Interação com Smart Contracts via Backend
// Para operações que requerem wallet do usuário
// ============================================

import { useState, useCallback } from 'react';
import { CONTRACT_ADDRESSES } from '@/lib/abis';

// ============================================
// TYPES
// ============================================

export interface ListingOnChain {
  listingId: string;
  seller: string;
  nftContract: string;
  tokenId: string;
  amount: string;
  priceNative: string;
  priceStable: string;
  acceptsNative: boolean;
  acceptsStable: boolean;
  status: number; // 0 = ACTIVE, 1 = SOLD, 2 = CANCELLED
  createdAt: string;
  soldAt: string;
  buyer: string;
  contractRef: string;
}

export interface MarketplaceStats {
  totalListings: number;
  totalSales: number;
  totalVolumeNative: string;
  totalVolumeStable: string;
  platformFeePercent: number;
}

export interface BuyResult {
  success: boolean;
  txHash?: string;
  error?: string;
}

// ============================================
// HELPER: Check if MetaMask is available
// ============================================

const hasMetaMask = (): boolean => {
  return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
};

const requestAccount = async (): Promise<string | null> => {
  if (!hasMetaMask()) return null;
  try {
    const accounts = await window.ethereum!.request({ method: 'eth_requestAccounts' }) as string[];
    return accounts[0] || null;
  } catch {
    return null;
  }
};

const switchToPolygon = async (): Promise<boolean> => {
  if (!hasMetaMask()) return false;
  try {
    await window.ethereum!.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0x89' }], // 137 in hex
    });
    return true;
  } catch (switchError: unknown) {
    // Chain not added, try to add it
    if ((switchError as { code?: number })?.code === 4902) {
      try {
        await window.ethereum!.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: '0x89',
            chainName: 'Polygon Mainnet',
            nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
            rpcUrls: ['https://polygon-rpc.com'],
            blockExplorerUrls: ['https://polygonscan.com/'],
          }],
        });
        return true;
      } catch {
        return false;
      }
    }
    return false;
  }
};

// ============================================
// MAIN HOOK
// ============================================

export function useP2PBlockchain() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectedAddress, setConnectedAddress] = useState<string | null>(null);

  /**
   * Connect wallet (MetaMask)
   */
  const connectWallet = useCallback(async (): Promise<string | null> => {
    setIsLoading(true);
    setError(null);

    try {
      if (!hasMetaMask()) {
        throw new Error('MetaMask não encontrado. Por favor, instale a extensão.');
      }

      // Request account access
      const address = await requestAccount();
      if (!address) {
        throw new Error('Conexão recusada pelo usuário');
      }

      // Switch to Polygon network
      const switched = await switchToPolygon();
      if (!switched) {
        throw new Error('Por favor, conecte-se à rede Polygon Mainnet');
      }

      setConnectedAddress(address);
      setIsLoading(false);
      return address;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao conectar carteira';
      setError(errorMessage);
      setIsLoading(false);
      return null;
    }
  }, []);

  /**
   * Get current connected address
   */
  const getConnectedAddress = useCallback(async (): Promise<string | null> => {
    if (!hasMetaMask()) return null;
    try {
      const accounts = await window.ethereum!.request({ method: 'eth_accounts' }) as string[];
      const address = accounts[0] || null;
      setConnectedAddress(address);
      return address;
    } catch {
      return null;
    }
  }, []);

  /**
   * Buy listing with MATIC via Backend API
   * The backend handles the blockchain transaction
   */
  const buyWithMatic = useCallback(async (
    listingId: number,
    priceInMatic: string
  ): Promise<BuyResult> => {
    setIsLoading(true);
    setError(null);

    try {
      if (!hasMetaMask()) {
        throw new Error('MetaMask não encontrado');
      }

      // Ensure wallet is connected
      const address = await requestAccount();
      if (!address) {
        throw new Error('Conecte sua carteira primeiro');
      }

      // Switch to Polygon
      await switchToPolygon();

      // Call backend API which handles the transaction
      const response = await fetch('/api/p2p/buy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId,
          buyerWallet: address,
          priceInMatic,
        }),
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Erro ao processar compra');
      }

      setIsLoading(false);
      return {
        success: true,
        txHash: result.txHash,
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao comprar';
      setError(errorMessage);
      setIsLoading(false);
      return {
        success: false,
        error: errorMessage,
      };
    }
  }, []);

  /**
   * Get marketplace stats from backend
   */
  const getMarketplaceStats = useCallback(async (): Promise<MarketplaceStats | null> => {
    try {
      const response = await fetch('/api/p2p/stats');
      const result = await response.json();
      if (result.success) {
        return result.data;
      }
      return null;
    } catch (err) {
      console.error('Error getting stats:', err);
      return null;
    }
  }, []);

  /**
   * Format MATIC value for display
   */
  const formatMatic = useCallback((weiValue: string): string => {
    try {
      const wei = BigInt(weiValue);
      const matic = Number(wei) / 1e18;
      return matic.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 4 });
    } catch {
      return '0';
    }
  }, []);

  /**
   * Get PolygonScan link for transaction
   */
  const getExplorerLink = useCallback((txHash: string): string => {
    return `https://polygonscan.com/tx/${txHash}`;
  }, []);

  /**
   * Get PolygonScan link for contract
   */
  const getContractLink = useCallback((address: string): string => {
    return `https://polygonscan.com/address/${address}`;
  }, []);

  return {
    // State
    isLoading,
    error,
    connectedAddress,

    // Wallet functions
    connectWallet,
    getConnectedAddress,
    hasMetaMask: hasMetaMask(),

    // Transaction functions
    buyWithMatic,
    getMarketplaceStats,

    // Utility functions
    formatMatic,
    getExplorerLink,
    getContractLink,

    // Contract addresses (for display)
    contracts: CONTRACT_ADDRESSES,
  };
}

export default useP2PBlockchain;
