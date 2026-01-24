/**
 * Contexto Global de Carteiras Crypto
 *
 * Gerencia as carteiras cadastradas em "Configuracao Carteiras Crypto"
 * e disponibiliza para todos os componentes do sistema que precisam
 * executar transacoes blockchain.
 */

import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

// ============================================
// TIPOS
// ============================================

export interface CryptoWallet {
  id: string;
  name: string;
  address: string;
  network: 'polygon' | 'ethereum' | 'base' | 'arbitrum' | 'bsc';
  type: 'hot' | 'cold' | 'multisig' | 'smart_contract';
  purpose: 'operations' | 'treasury' | 'split_receiver' | 'gas_tank' | 'backup';
  balance: {
    native: number;
    brz: number;
    usdc?: number;
  };
  isActive: boolean;
  isPrimary: boolean;
  createdAt: Date;
  lastUsed?: Date;
}

export interface CryptoWalletsContextType {
  // Lista de carteiras
  wallets: CryptoWallet[];

  // Carteira principal (para operacoes padrao)
  primaryWallet: CryptoWallet | null;

  // Getters por proposito
  getOperationalWallet: () => CryptoWallet | null;
  getTreasuryWallet: () => CryptoWallet | null;
  getGasTankWallet: () => CryptoWallet | null;
  getSplitReceiverWallets: () => CryptoWallet[];

  // Getter por ID
  getWalletById: (id: string) => CryptoWallet | null;

  // Getter por endereco
  getWalletByAddress: (address: string) => CryptoWallet | null;

  // Gerenciamento
  addWallet: (wallet: Omit<CryptoWallet, 'id' | 'createdAt'>) => void;
  updateWallet: (id: string, updates: Partial<CryptoWallet>) => void;
  removeWallet: (id: string) => void;
  setPrimaryWallet: (id: string) => void;

  // Estado de carregamento
  isLoading: boolean;
}

// ============================================
// CARTEIRAS INICIAIS (do sistema)
// ============================================

const DEFAULT_WALLETS: CryptoWallet[] = [
  {
    id: 'w1',
    name: 'Operacional Principal',
    address: '0x7a1c8f3e4b2d9a6c5e8f1d2a3b4c5d6e7f8a9b0c',
    network: 'polygon',
    type: 'multisig',
    purpose: 'operations',
    balance: { native: 125.5, brz: 450000, usdc: 15000 },
    isActive: true,
    isPrimary: true,
    createdAt: new Date('2025-01-15'),
    lastUsed: new Date(),
  },
  {
    id: 'w2',
    name: 'Tesouraria (Cold)',
    address: '0x8b2d9e4f5c3a6b7d8e9f0a1b2c3d4e5f6a7b8c9d',
    network: 'polygon',
    type: 'cold',
    purpose: 'treasury',
    balance: { native: 50.0, brz: 2500000, usdc: 100000 },
    isActive: true,
    isPrimary: false,
    createdAt: new Date('2024-12-01'),
    lastUsed: new Date('2026-01-05'),
  },
  {
    id: 'w3',
    name: 'Split - Locadores (85%)',
    address: '0x9c3e0f5g6d7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c',
    network: 'polygon',
    type: 'smart_contract',
    purpose: 'split_receiver',
    balance: { native: 10.0, brz: 85000 },
    isActive: true,
    isPrimary: false,
    createdAt: new Date('2025-06-01'),
    lastUsed: new Date(),
  },
  {
    id: 'w4',
    name: 'Gas Tank',
    address: '0xad4f1g6h7i8j9k0l1m2n3o4p5q6r7s8t9u0v1w2x',
    network: 'polygon',
    type: 'hot',
    purpose: 'gas_tank',
    balance: { native: 500.0, brz: 0 },
    isActive: true,
    isPrimary: false,
    createdAt: new Date('2025-03-01'),
  },
];

// ============================================
// CONTEXTO
// ============================================

const CryptoWalletsContext = createContext<CryptoWalletsContextType | null>(null);

// ============================================
// PROVIDER
// ============================================

interface CryptoWalletsProviderProps {
  children: ReactNode;
}

export function CryptoWalletsProvider({ children }: CryptoWalletsProviderProps) {
  const [wallets, setWallets] = useState<CryptoWallet[]>(DEFAULT_WALLETS);
  const [isLoading] = useState(false);

  // Carteira principal
  const primaryWallet = wallets.find(w => w.isPrimary && w.isActive) || null;

  // Getters por proposito
  const getOperationalWallet = useCallback(() => {
    return wallets.find(w => w.purpose === 'operations' && w.isActive) || primaryWallet;
  }, [wallets, primaryWallet]);

  const getTreasuryWallet = useCallback(() => {
    return wallets.find(w => w.purpose === 'treasury' && w.isActive) || null;
  }, [wallets]);

  const getGasTankWallet = useCallback(() => {
    return wallets.find(w => w.purpose === 'gas_tank' && w.isActive) || null;
  }, [wallets]);

  const getSplitReceiverWallets = useCallback(() => {
    return wallets.filter(w => w.purpose === 'split_receiver' && w.isActive);
  }, [wallets]);

  // Getter por ID
  const getWalletById = useCallback((id: string) => {
    return wallets.find(w => w.id === id) || null;
  }, [wallets]);

  // Getter por endereco
  const getWalletByAddress = useCallback((address: string) => {
    return wallets.find(w => w.address.toLowerCase() === address.toLowerCase()) || null;
  }, [wallets]);

  // Adicionar carteira
  const addWallet = useCallback((wallet: Omit<CryptoWallet, 'id' | 'createdAt'>) => {
    const newWallet: CryptoWallet = {
      ...wallet,
      id: `w${Date.now()}`,
      createdAt: new Date(),
    };
    setWallets(prev => [...prev, newWallet]);
  }, []);

  // Atualizar carteira
  const updateWallet = useCallback((id: string, updates: Partial<CryptoWallet>) => {
    setWallets(prev => prev.map(w =>
      w.id === id ? { ...w, ...updates } : w
    ));
  }, []);

  // Remover carteira
  const removeWallet = useCallback((id: string) => {
    setWallets(prev => prev.filter(w => w.id !== id));
  }, []);

  // Definir carteira principal
  const setPrimaryWallet = useCallback((id: string) => {
    setWallets(prev => prev.map(w => ({
      ...w,
      isPrimary: w.id === id,
    })));
  }, []);

  const value: CryptoWalletsContextType = {
    wallets,
    primaryWallet,
    getOperationalWallet,
    getTreasuryWallet,
    getGasTankWallet,
    getSplitReceiverWallets,
    getWalletById,
    getWalletByAddress,
    addWallet,
    updateWallet,
    removeWallet,
    setPrimaryWallet,
    isLoading,
  };

  return (
    <CryptoWalletsContext.Provider value={value}>
      {children}
    </CryptoWalletsContext.Provider>
  );
}

// ============================================
// HOOK
// ============================================

/**
 * Hook para acessar as carteiras crypto cadastradas no sistema
 *
 * Uso:
 * const { primaryWallet, getOperationalWallet } = useCryptoWallets();
 */
export function useCryptoWallets(): CryptoWalletsContextType {
  const context = useContext(CryptoWalletsContext);

  if (!context) {
    throw new Error('useCryptoWallets deve ser usado dentro de CryptoWalletsProvider');
  }

  return context;
}
