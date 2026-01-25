import { create } from "zustand";
import { persist } from "zustand/middleware";
import { BrowserProvider, formatEther, type Eip1193Provider } from "ethers";

// ============================================================
// WALLET STORE - Web3 Real com Ethers v6
// Conexão REAL com MetaMask - SEM MOCKS
// ============================================================

// Tipos de rede suportados
export interface NetworkInfo {
  chainId: string;
  name: string;
  isSupported: boolean;
}

// Redes suportadas (Polygon)
const SUPPORTED_NETWORKS: Record<string, string> = {
  "0x89": "Polygon Mainnet",
  "0x13882": "Polygon Amoy Testnet",
  "0x13881": "Polygon Mumbai (deprecated)",
  "0x1": "Ethereum Mainnet",
  "0xaa36a7": "Sepolia Testnet",
};

const PREFERRED_NETWORKS = ["0x89", "0x13882"]; // Polygon Mainnet e Amoy

interface WalletState {
  // Estado
  address: string | null;
  balance: string | null;
  network: NetworkInfo | null;
  isConnecting: boolean;
  isConnected: boolean;
  error: string | null;

  // Actions
  connectWallet: () => Promise<void>;
  disconnect: () => void;
  refreshBalance: () => Promise<void>;
  signMessage: (message: string) => Promise<string | null>;
  switchNetwork: (chainId: string) => Promise<boolean>;
}

// Declaração global para window.ethereum
declare global {
  interface Window {
    ethereum?: Eip1193Provider & {
      isMetaMask?: boolean;
      on?: (event: string, callback: (...args: unknown[]) => void) => void;
      removeListener?: (event: string, callback: (...args: unknown[]) => void) => void;
      request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
    };
  }
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      address: null,
      balance: null,
      network: null,
      isConnecting: false,
      isConnected: false,
      error: null,

      connectWallet: async () => {
        // Verifica se MetaMask está instalada
        if (typeof window === "undefined" || !window.ethereum) {
          set({
            error: "MetaMask não detectada. Por favor, instale a extensão MetaMask.",
            isConnecting: false,
          });
          return;
        }

        set({ isConnecting: true, error: null });

        try {
          // Solicita conexão
          const provider = new BrowserProvider(window.ethereum);
          const accounts = await provider.send("eth_requestAccounts", []);

          if (!accounts || accounts.length === 0) {
            throw new Error("Nenhuma conta autorizada");
          }

          const address = accounts[0] as string;

          // Obtém informações da rede
          const network = await provider.getNetwork();
          const chainIdHex = `0x${network.chainId.toString(16)}`;
          const networkName = SUPPORTED_NETWORKS[chainIdHex] || `Rede Desconhecida (${chainIdHex})`;
          const isSupported = PREFERRED_NETWORKS.includes(chainIdHex);

          // Obtém saldo
          const balanceWei = await provider.getBalance(address);
          const balanceFormatted = formatEther(balanceWei);

          set({
            address,
            balance: balanceFormatted,
            network: {
              chainId: chainIdHex,
              name: networkName,
              isSupported,
            },
            isConnected: true,
            isConnecting: false,
            error: isSupported ? null : `Rede não recomendada. Use Polygon Mainnet ou Amoy Testnet.`,
          });

          // Registra listeners para mudanças
          if (window.ethereum?.on) {
            window.ethereum.on("accountsChanged", (accounts: unknown) => {
              const accs = accounts as string[];
              if (accs.length === 0) {
                get().disconnect();
              } else {
                set({ address: accs[0] });
                get().refreshBalance();
              }
            });

            window.ethereum.on("chainChanged", () => {
              // Reconecta para atualizar a rede
              get().connectWallet();
            });
          }
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : "Erro ao conectar carteira";
          set({
            error: errorMessage,
            isConnecting: false,
            isConnected: false,
          });
        }
      },

      disconnect: () => {
        set({
          address: null,
          balance: null,
          network: null,
          isConnected: false,
          error: null,
        });
      },

      refreshBalance: async () => {
        const { address } = get();
        if (!address || !window.ethereum) return;

        try {
          const provider = new BrowserProvider(window.ethereum);
          const balanceWei = await provider.getBalance(address);
          const balanceFormatted = formatEther(balanceWei);
          set({ balance: balanceFormatted });
        } catch (err) {
          console.error("Erro ao atualizar saldo:", err);
        }
      },

      signMessage: async (message: string) => {
        const { address } = get();
        if (!address || !window.ethereum) {
          set({ error: "Carteira não conectada" });
          return null;
        }

        try {
          const provider = new BrowserProvider(window.ethereum);
          const signer = await provider.getSigner();
          const signature = await signer.signMessage(message);
          return signature;
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : "Erro ao assinar mensagem";
          set({ error: errorMessage });
          return null;
        }
      },

      switchNetwork: async (chainId: string) => {
        if (!window.ethereum) {
          set({ error: "MetaMask não detectada" });
          return false;
        }

        try {
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId }],
          });
          return true;
        } catch (err) {
          // Se a rede não existe, tenta adicionar
          if ((err as { code?: number }).code === 4902) {
            try {
              if (chainId === "0x89") {
                await window.ethereum.request({
                  method: "wallet_addEthereumChain",
                  params: [
                    {
                      chainId: "0x89",
                      chainName: "Polygon Mainnet",
                      nativeCurrency: { name: "MATIC", symbol: "MATIC", decimals: 18 },
                      rpcUrls: ["https://polygon-rpc.com/"],
                      blockExplorerUrls: ["https://polygonscan.com/"],
                    },
                  ],
                });
                return true;
              } else if (chainId === "0x13882") {
                await window.ethereum.request({
                  method: "wallet_addEthereumChain",
                  params: [
                    {
                      chainId: "0x13882",
                      chainName: "Polygon Amoy Testnet",
                      nativeCurrency: { name: "MATIC", symbol: "MATIC", decimals: 18 },
                      rpcUrls: ["https://rpc-amoy.polygon.technology/"],
                      blockExplorerUrls: ["https://amoy.polygonscan.com/"],
                    },
                  ],
                });
                return true;
              }
            } catch (addErr) {
              console.error("Erro ao adicionar rede:", addErr);
            }
          }
          const errorMessage = err instanceof Error ? err.message : "Erro ao trocar de rede";
          set({ error: errorMessage });
          return false;
        }
      },
    }),
    {
      name: "vinculo-wallet",
      partialize: (state) => ({
        // Não persistimos dados sensíveis - apenas se estava conectado
        // O usuário precisa reconectar a cada sessão por segurança
      }),
    }
  )
);

// Helper para encurtar endereço
export function shortenAddress(address: string | null): string {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// Helper para formatar saldo
export function formatBalance(balance: string | null): string {
  if (!balance) return "0.00";
  const num = parseFloat(balance);
  if (num < 0.0001) return "< 0.0001";
  return num.toFixed(4);
}
