/**
 * Vinculo.io - useWalletConnection Hook
 *
 * Manages wallet connection state and interactions.
 * Supports real MetaMask/Web3 connections and demo mode.
 *
 * Features:
 * - MetaMask direct integration
 * - WalletConnect support (placeholder)
 * - Coinbase Wallet (placeholder)
 * - Social Login (placeholder)
 * - Demo mode fallback
 */

import { useState, useCallback, useEffect } from 'react';
import type {
  WalletConnectionStatus,
  WalletInfo,
  WalletConnectorType,
} from '@/lib/web3/types';
import { web3Config, getNetworkConfig } from '@/lib/web3/config';

interface UseWalletConnectionReturn {
  // Connection state
  status: WalletConnectionStatus;
  wallet: WalletInfo | null;
  error: string | null;

  // Actions
  connect: (connectorType?: WalletConnectorType) => Promise<void>;
  disconnect: () => void;
  switchNetwork: (chainId: number) => Promise<void>;

  // Helpers
  isConnected: boolean;
  isConnecting: boolean;
  shortAddress: string;
}

// Simulated wallet addresses for demo
const DEMO_WALLETS: Record<WalletConnectorType, string> = {
  metamask: '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD99',
  walletconnect: '0x1234567890AbCdEf1234567890AbCdEf12345678',
  coinbase: '0xAbCdEf1234567890AbCdEf1234567890AbCdEf12',
  social: '0x9876543210FeDcBa9876543210FeDcBa98765432',
};

// Polygon network configurations for MetaMask
const POLYGON_NETWORKS = {
  polygon: {
    chainId: '0x89', // 137 in hex
    chainName: 'Polygon Mainnet',
    nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
    rpcUrls: ['https://polygon-rpc.com/'],
    blockExplorerUrls: ['https://polygonscan.com/'],
  },
  polygonAmoy: {
    chainId: '0x13882', // 80002 in hex
    chainName: 'Polygon Amoy Testnet',
    nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
    rpcUrls: ['https://rpc-amoy.polygon.technology/'],
    blockExplorerUrls: ['https://amoy.polygonscan.com/'],
  },
  localhost: {
    chainId: '0x7a69', // 31337 in hex
    chainName: 'Localhost',
    nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
    rpcUrls: ['http://127.0.0.1:8545'],
    blockExplorerUrls: [],
  },
};

// Declare ethereum type for TypeScript
declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean;
      isCoinbaseWallet?: boolean;
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
      on?: (event: string, callback: (...args: unknown[]) => void) => void;
      removeListener?: (event: string, callback: (...args: unknown[]) => void) => void;
    };
  }
}

export function useWalletConnection(): UseWalletConnectionReturn {
  const [status, setStatus] = useState<WalletConnectionStatus>('disconnected');
  const [wallet, setWallet] = useState<WalletInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Get network config
  const networkConfig = getNetworkConfig();

  // Helper to get MATIC balance
  const getBalance = async (address: string): Promise<string> => {
    if (!window.ethereum) return '0';
    try {
      const balance = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [address, 'latest'],
      });
      // Convert from wei to MATIC (18 decimals)
      const balanceInMatic = parseInt(balance as string, 16) / 1e18;
      return balanceInMatic.toFixed(4);
    } catch {
      return '0';
    }
  };

  // Helper to get current chain ID
  const getCurrentChainId = async (): Promise<number> => {
    if (!window.ethereum) return 0;
    try {
      const chainId = await window.ethereum.request({ method: 'eth_chainId' });
      return parseInt(chainId as string, 16);
    } catch {
      return 0;
    }
  };

  // Helper to switch or add network
  const ensureCorrectNetwork = async (): Promise<boolean> => {
    if (!window.ethereum) return false;

    const currentChainId = await getCurrentChainId();
    const targetChainId = networkConfig.chainId;

    if (currentChainId === targetChainId) {
      return true;
    }

    // Determine which network config to use
    const networkKey = networkConfig.name.toLowerCase().includes('amoy')
      ? 'polygonAmoy'
      : networkConfig.name.toLowerCase().includes('local')
        ? 'localhost'
        : 'polygon';
    const networkParams = POLYGON_NETWORKS[networkKey];

    try {
      // Try to switch to the network
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: networkParams.chainId }],
      });
      return true;
    } catch (switchError: unknown) {
      // Network not added, try to add it
      const typedError = switchError as { code?: number };
      if (typedError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [networkParams],
          });
          return true;
        } catch {
          return false;
        }
      }
      return false;
    }
  };

  // Check for existing connection on mount
  useEffect(() => {
    const checkConnection = async () => {
      // First check localStorage for saved session
      const savedWallet = localStorage.getItem('vinculo_wallet');
      if (savedWallet) {
        try {
          const parsed = JSON.parse(savedWallet) as WalletInfo;

          // If not in demo mode, verify the connection is still valid
          if (!web3Config.isDemoMode && window.ethereum) {
            const accounts = (await window.ethereum.request({
              method: 'eth_accounts',
            })) as string[];

            if (accounts.length > 0 && accounts[0].toLowerCase() === parsed.address.toLowerCase()) {
              // Connection still valid, update balance
              const balance = await getBalance(accounts[0]);
              const chainId = await getCurrentChainId();
              const updatedWallet: WalletInfo = {
                ...parsed,
                balance,
                chainId,
              };
              setWallet(updatedWallet);
              setStatus('connected');
              localStorage.setItem('vinculo_wallet', JSON.stringify(updatedWallet));
              web3Config.log('Restored real wallet connection:', updatedWallet.address);
              return;
            }
          }

          // Demo mode or no real connection
          if (web3Config.isDemoMode) {
            if (parsed.chainId !== networkConfig.chainId) {
              parsed.chainId = networkConfig.chainId;
            }
            setWallet(parsed);
            setStatus('connected');
            web3Config.log('Restored demo wallet connection:', parsed.address);
            return;
          }
        } catch {
          localStorage.removeItem('vinculo_wallet');
        }
      }
    };

    checkConnection();
  }, [networkConfig.chainId]);

  // Listen for account and chain changes
  useEffect(() => {
    if (!window.ethereum || web3Config.isDemoMode) return;

    const handleAccountsChanged = async (accounts: unknown) => {
      const accountList = accounts as string[];
      if (accountList.length === 0) {
        // User disconnected
        setWallet(null);
        setStatus('disconnected');
        localStorage.removeItem('vinculo_wallet');
      } else if (wallet && accountList[0].toLowerCase() !== wallet.address.toLowerCase()) {
        // Account changed
        const balance = await getBalance(accountList[0]);
        const chainId = await getCurrentChainId();
        const updatedWallet: WalletInfo = {
          address: accountList[0],
          chainId,
          balance,
          isConnected: true,
          connectorName: wallet.connectorName,
        };
        setWallet(updatedWallet);
        localStorage.setItem('vinculo_wallet', JSON.stringify(updatedWallet));
      }
    };

    const handleChainChanged = async (chainId: unknown) => {
      const newChainId = parseInt(chainId as string, 16);
      if (wallet) {
        const updatedWallet = { ...wallet, chainId: newChainId };
        setWallet(updatedWallet);
        localStorage.setItem('vinculo_wallet', JSON.stringify(updatedWallet));
      }
    };

    window.ethereum.on?.('accountsChanged', handleAccountsChanged);
    window.ethereum.on?.('chainChanged', handleChainChanged);

    return () => {
      window.ethereum?.removeListener?.('accountsChanged', handleAccountsChanged);
      window.ethereum?.removeListener?.('chainChanged', handleChainChanged);
    };
  }, [wallet]);

  const connect = useCallback(
    async (connectorType: WalletConnectorType = 'metamask') => {
      setStatus('connecting');
      setError(null);

      web3Config.log('Connecting wallet:', connectorType, 'Network:', networkConfig.name);

      try {
        // Demo mode - simulate connection
        if (web3Config.isDemoMode) {
          await new Promise((resolve) => setTimeout(resolve, 1500));

          if (Math.random() < 0.1) {
            throw new Error('User rejected the connection request');
          }

          const walletInfo: WalletInfo = {
            address: DEMO_WALLETS[connectorType],
            chainId: networkConfig.chainId,
            balance: (Math.random() * 100 + 10).toFixed(4),
            isConnected: true,
            connectorName: connectorType,
          };

          setWallet(walletInfo);
          setStatus('connected');
          localStorage.setItem('vinculo_wallet', JSON.stringify(walletInfo));
          web3Config.log('Demo wallet connected:', walletInfo.address);
          return;
        }

        // Production mode - real Web3 connection
        switch (connectorType) {
          case 'metamask': {
            if (!window.ethereum) {
              throw new Error(
                'MetaMask nao encontrada. Por favor, instale a extensao MetaMask em metamask.io'
              );
            }

            if (!window.ethereum.isMetaMask) {
              throw new Error(
                'Por favor, use MetaMask como carteira principal. Outras carteiras podem estar interferindo.'
              );
            }

            // Request account access
            const accounts = (await window.ethereum.request({
              method: 'eth_requestAccounts',
            })) as string[];

            if (!accounts || accounts.length === 0) {
              throw new Error('Nenhuma conta autorizada. Por favor, autorize o acesso.');
            }

            // Ensure we're on the correct network
            const networkSwitched = await ensureCorrectNetwork();
            if (!networkSwitched) {
              web3Config.log('Network switch failed, but continuing...');
            }

            // Get balance and chain ID
            const balance = await getBalance(accounts[0]);
            const chainId = await getCurrentChainId();

            const walletInfo: WalletInfo = {
              address: accounts[0],
              chainId,
              balance,
              isConnected: true,
              connectorName: 'metamask',
            };

            setWallet(walletInfo);
            setStatus('connected');
            localStorage.setItem('vinculo_wallet', JSON.stringify(walletInfo));
            web3Config.log('MetaMask connected:', walletInfo.address);
            break;
          }

          case 'coinbase': {
            if (!window.ethereum) {
              throw new Error(
                'Coinbase Wallet nao encontrada. Por favor, instale a extensao.'
              );
            }

            // Check if Coinbase Wallet is available
            if (!window.ethereum.isCoinbaseWallet && !window.ethereum.isMetaMask) {
              throw new Error('Por favor, instale Coinbase Wallet ou MetaMask.');
            }

            // Use the same flow as MetaMask
            const accounts = (await window.ethereum.request({
              method: 'eth_requestAccounts',
            })) as string[];

            if (!accounts || accounts.length === 0) {
              throw new Error('Nenhuma conta autorizada.');
            }

            await ensureCorrectNetwork();
            const balance = await getBalance(accounts[0]);
            const chainId = await getCurrentChainId();

            const walletInfo: WalletInfo = {
              address: accounts[0],
              chainId,
              balance,
              isConnected: true,
              connectorName: 'coinbase',
            };

            setWallet(walletInfo);
            setStatus('connected');
            localStorage.setItem('vinculo_wallet', JSON.stringify(walletInfo));
            web3Config.log('Coinbase Wallet connected:', walletInfo.address);
            break;
          }

          case 'walletconnect': {
            // WalletConnect requires additional setup with @walletconnect/modal
            // For now, show a message that it's coming soon
            throw new Error(
              'WalletConnect sera implementado em breve. Por favor, use MetaMask.'
            );
          }

          case 'social': {
            // Social login requires Web3Auth or similar
            throw new Error(
              'Login Social sera implementado em breve. Por favor, use MetaMask.'
            );
          }

          default:
            throw new Error(`Tipo de carteira nao suportado: ${connectorType}`);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Falha na conexao';
        setError(message);
        setStatus('error');
        web3Config.log('Connection error:', message);
      }
    },
    [networkConfig]
  );

  const disconnect = useCallback(() => {
    setWallet(null);
    setStatus('disconnected');
    setError(null);
    localStorage.removeItem('vinculo_wallet');
    web3Config.log('Wallet disconnected');
  }, []);

  const switchNetwork = useCallback(
    async (chainId: number) => {
      if (!wallet) {
        setError('Nenhuma carteira conectada');
        return;
      }

      if (web3Config.isDemoMode) {
        // Demo mode - just update the state
        await new Promise((resolve) => setTimeout(resolve, 800));
        const updatedWallet = { ...wallet, chainId };
        setWallet(updatedWallet);
        localStorage.setItem('vinculo_wallet', JSON.stringify(updatedWallet));
        return;
      }

      // Real mode - request network switch
      if (!window.ethereum) {
        setError('Carteira nao encontrada');
        return;
      }

      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${chainId.toString(16)}` }],
        });

        const updatedWallet = { ...wallet, chainId };
        setWallet(updatedWallet);
        localStorage.setItem('vinculo_wallet', JSON.stringify(updatedWallet));
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Falha ao trocar rede';
        setError(message);
      }
    },
    [wallet]
  );

  const shortAddress = wallet
    ? `${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}`
    : '';

  return {
    status,
    wallet,
    error,
    connect,
    disconnect,
    switchNetwork,
    isConnected: status === 'connected',
    isConnecting: status === 'connecting',
    shortAddress,
  };
}
