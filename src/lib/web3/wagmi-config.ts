/**
 * Vinculo.io - Web3 Integration with viem
 *
 * Este arquivo configura a integracao Web3 usando viem (biblioteca moderna e typesafe).
 * Funciona com ou sem wagmi, permitindo uso standalone.
 *
 * INSTALACAO (quando disponivel):
 * npm install viem @wagmi/core @wagmi/connectors
 *
 * Ate la, funciona em modo simulado com dados mockados.
 */

import { getNetworkConfig, getRpcUrl, getContractAddress, isDemoMode, web3Log } from './config';
import { VINCULO_CONTRACT_ABI } from './vinculo-contract-abi';

// ============================================
// TYPES
// ============================================

export interface WalletState {
  address: string | null;
  chainId: number | null;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
}

export interface TransactionResult {
  hash: string;
  status: 'pending' | 'success' | 'failed';
  blockNumber?: number;
  gasUsed?: bigint;
}

export interface ContractCallOptions {
  value?: bigint;
  gasLimit?: bigint;
}

// ============================================
// VIEM CLIENT FACTORY
// ============================================

/**
 * Cria um cliente viem para leitura (public client)
 * Em producao, isso usaria createPublicClient do viem
 */
export function createViemPublicClient() {
  const network = getNetworkConfig();
  const rpcUrl = getRpcUrl();

  web3Log('Creating public client for', network.name, 'at', rpcUrl);

  // Em modo real, retornaria:
  // return createPublicClient({
  //   chain: polygon,
  //   transport: http(rpcUrl),
  // });

  // Modo simulado - retorna objeto com metodos mockados
  return {
    chain: {
      id: network.chainId,
      name: network.name,
    },
    transport: {
      url: rpcUrl,
    },

    // Read functions
    async readContract(args: {
      address: string;
      abi: readonly unknown[];
      functionName: string;
      args?: readonly unknown[];
    }) {
      web3Log('readContract:', args.functionName, args.args);

      // Mock responses baseados na funcao
      switch (args.functionName) {
        case 'getStats':
          return {
            totalVolume: BigInt(125000000), // R$ 1.250.000
            totalActiveRentals: BigInt(47),
            totalPaymentsProcessed: BigInt(312),
            totalContracts: BigInt(89),
          };

        case 'getRental':
          return {
            landlord: '0x1234567890123456789012345678901234567890',
            tenant: '0x2345678901234567890123456789012345678901',
            guarantor: '0x3456789012345678901234567890123456789012',
            insurer: '0x4567890123456789012345678901234567890123',
            rentAmount: BigInt(30000000), // R$ 3.000
            securityDeposit: BigInt(0),
            collateralValue: BigInt(50000000000), // R$ 500.000
            startDate: BigInt(1704067200),
            endDate: BigInt(1735689600),
            paymentDueDay: 10,
            status: 1, // Active
            totalPayments: BigInt(6),
            missedPayments: BigInt(0),
            propertyId: 'PROP-001',
            collateralPropertyId: 'PROP-002',
            ipfsHash: 'QmTest123',
          };

        case 'calculateSplit':
          const amount = args.args?.[0] as bigint || BigInt(0);
          return {
            landlordAmount: (amount * BigInt(85)) / BigInt(100),
            insurerAmount: (amount * BigInt(5)) / BigInt(100),
            platformAmount: (amount * BigInt(5)) / BigInt(100),
            guarantorAmount: (amount * BigInt(5)) / BigInt(100),
          };

        case 'getLandlordRentals':
        case 'getTenantRentals':
        case 'getGuarantorRentals':
          return [BigInt(0), BigInt(1), BigInt(2)];

        case 'collateralLocked':
          return true;

        case 'paused':
          return false;

        default:
          web3Log('Unknown function:', args.functionName);
          return null;
      }
    },

    // Get block number
    async getBlockNumber() {
      return BigInt(50000000 + Math.floor(Date.now() / 2000));
    },

    // Get balance
    async getBalance(args: { address: string }) {
      return BigInt(Math.floor(Math.random() * 100) * 10 ** 18); // Random MATIC balance
    },

    // Watch contract event
    watchContractEvent(args: {
      address: string;
      abi: readonly unknown[];
      eventName: string;
      onLogs: (logs: unknown[]) => void;
    }) {
      web3Log('Watching event:', args.eventName);

      // Simula eventos periodicos em modo demo
      if (isDemoMode) {
        const interval = setInterval(() => {
          const mockLog = {
            eventName: args.eventName,
            args: {
              tokenId: BigInt(Math.floor(Math.random() * 100)),
              timestamp: BigInt(Date.now() / 1000),
            },
            blockNumber: BigInt(50000000 + Math.floor(Date.now() / 2000)),
            transactionHash: `0x${Math.random().toString(16).slice(2)}`,
          };
          args.onLogs([mockLog]);
        }, 60000); // A cada 1 minuto

        return () => clearInterval(interval);
      }

      return () => {};
    },
  };
}

/**
 * Cria um cliente viem para escrita (wallet client)
 * Requer conexao de carteira
 */
export function createViemWalletClient(walletAddress: string) {
  const network = getNetworkConfig();
  const rpcUrl = getRpcUrl();

  web3Log('Creating wallet client for', walletAddress);

  return {
    account: walletAddress,
    chain: {
      id: network.chainId,
      name: network.name,
    },

    // Write functions
    async writeContract(args: {
      address: string;
      abi: readonly unknown[];
      functionName: string;
      args?: readonly unknown[];
      value?: bigint;
    }): Promise<TransactionResult> {
      web3Log('writeContract:', args.functionName, args.args, 'value:', args.value);

      // Simula delay de transacao
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Gera hash de transacao mockado
      const txHash = `0x${Array.from({ length: 64 }, () =>
        Math.floor(Math.random() * 16).toString(16)
      ).join('')}`;

      return {
        hash: txHash,
        status: 'success',
        blockNumber: Number(50000000 + Math.floor(Date.now() / 2000)),
        gasUsed: BigInt(150000),
      };
    },

    // Send native token
    async sendTransaction(args: {
      to: string;
      value: bigint;
      data?: string;
    }): Promise<TransactionResult> {
      web3Log('sendTransaction to:', args.to, 'value:', args.value);

      await new Promise((resolve) => setTimeout(resolve, 2000));

      const txHash = `0x${Array.from({ length: 64 }, () =>
        Math.floor(Math.random() * 16).toString(16)
      ).join('')}`;

      return {
        hash: txHash,
        status: 'success',
        blockNumber: Number(50000000 + Math.floor(Date.now() / 2000)),
        gasUsed: BigInt(21000),
      };
    },
  };
}

// ============================================
// WALLET CONNECTION
// ============================================

let walletState: WalletState = {
  address: null,
  chainId: null,
  isConnected: false,
  isConnecting: false,
  error: null,
};

const walletListeners: Set<(state: WalletState) => void> = new Set();

function notifyWalletListeners() {
  walletListeners.forEach((listener) => listener(walletState));
}

/**
 * Conecta carteira via MetaMask ou WalletConnect
 */
export async function connectWallet(
  provider: 'metamask' | 'walletconnect' = 'metamask'
): Promise<WalletState> {
  walletState = { ...walletState, isConnecting: true, error: null };
  notifyWalletListeners();

  try {
    if (provider === 'metamask') {
      // Verifica se MetaMask esta disponivel
      const ethereum = (window as unknown as { ethereum?: {
        request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
        on: (event: string, handler: (...args: unknown[]) => void) => void;
        removeListener: (event: string, handler: (...args: unknown[]) => void) => void;
      } }).ethereum;

      if (!ethereum) {
        // Modo demo - simula conexao
        if (isDemoMode) {
          await new Promise((resolve) => setTimeout(resolve, 1000));

          walletState = {
            address: '0xDemo1234567890123456789012345678901234',
            chainId: getNetworkConfig().chainId,
            isConnected: true,
            isConnecting: false,
            error: null,
          };

          notifyWalletListeners();
          return walletState;
        }

        throw new Error('MetaMask nao encontrado. Instale a extensao.');
      }

      // Solicita conexao
      const accounts = await ethereum.request({
        method: 'eth_requestAccounts',
      }) as string[];

      const chainId = await ethereum.request({
        method: 'eth_chainId',
      }) as string;

      walletState = {
        address: accounts[0],
        chainId: Number.parseInt(chainId, 16),
        isConnected: true,
        isConnecting: false,
        error: null,
      };

      // Escuta mudancas de conta
      ethereum.on('accountsChanged', (newAccounts: unknown) => {
        const accs = newAccounts as string[];
        if (accs.length === 0) {
          disconnectWallet();
        } else {
          walletState = { ...walletState, address: accs[0] };
          notifyWalletListeners();
        }
      });

      // Escuta mudancas de rede
      ethereum.on('chainChanged', (newChainId: unknown) => {
        walletState = {
          ...walletState,
          chainId: Number.parseInt(newChainId as string, 16),
        };
        notifyWalletListeners();
      });
    } else {
      // WalletConnect - seria implementado com @walletconnect/modal
      throw new Error('WalletConnect requer instalacao do pacote @walletconnect/modal');
    }

    notifyWalletListeners();
    return walletState;
  } catch (error) {
    walletState = {
      ...walletState,
      isConnecting: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    };
    notifyWalletListeners();
    throw error;
  }
}

/**
 * Desconecta carteira
 */
export function disconnectWallet(): void {
  walletState = {
    address: null,
    chainId: null,
    isConnected: false,
    isConnecting: false,
    error: null,
  };
  notifyWalletListeners();
}

/**
 * Retorna estado atual da carteira
 */
export function getWalletState(): WalletState {
  return walletState;
}

/**
 * Registra listener para mudancas de estado
 */
export function subscribeToWallet(listener: (state: WalletState) => void): () => void {
  walletListeners.add(listener);
  return () => walletListeners.delete(listener);
}

/**
 * Solicita troca de rede
 */
export async function switchNetwork(chainId: number): Promise<void> {
  const ethereum = (window as unknown as { ethereum?: {
    request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  } }).ethereum;

  if (!ethereum) {
    throw new Error('MetaMask nao encontrado');
  }

  try {
    await ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: `0x${chainId.toString(16)}` }],
    });
  } catch (error) {
    // Se a rede nao existe, adiciona
    const err = error as { code?: number };
    if (err.code === 4902) {
      const network = getNetworkConfig();
      await ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: `0x${chainId.toString(16)}`,
            chainName: network.name,
            nativeCurrency: network.nativeCurrency,
            rpcUrls: [getRpcUrl()],
            blockExplorerUrls: [network.blockExplorer],
          },
        ],
      });
    } else {
      throw error;
    }
  }
}

// ============================================
// CONTRACT INTERACTION HELPERS
// ============================================

/**
 * Wrapper para chamar funcoes de leitura do contrato
 */
export async function readVinculoContract<T>(
  functionName: string,
  args?: readonly unknown[]
): Promise<T> {
  const client = createViemPublicClient();
  const contractAddress = getContractAddress();

  const result = await client.readContract({
    address: contractAddress,
    abi: VINCULO_CONTRACT_ABI,
    functionName,
    args,
  });

  return result as T;
}

/**
 * Wrapper para chamar funcoes de escrita do contrato
 */
export async function writeVinculoContract(
  functionName: string,
  args?: readonly unknown[],
  options?: ContractCallOptions
): Promise<TransactionResult> {
  const wallet = getWalletState();

  if (!wallet.isConnected || !wallet.address) {
    throw new Error('Carteira nao conectada');
  }

  const client = createViemWalletClient(wallet.address);
  const contractAddress = getContractAddress();

  const result = await client.writeContract({
    address: contractAddress,
    abi: VINCULO_CONTRACT_ABI,
    functionName,
    args,
    value: options?.value,
  });

  return result;
}

// ============================================
// UTILITIES
// ============================================

/**
 * Formata endereco para exibicao
 */
export function formatAddress(address: string, chars = 4): string {
  if (!address) return '';
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

/**
 * Formata valor em wei para BRL
 */
export function formatWeiToBRL(wei: bigint, decimals = 4): string {
  const value = Number(wei) / 10 ** decimals;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

/**
 * Converte BRL para wei (4 decimais para BRZ)
 */
export function brlToWei(brl: number, decimals = 4): bigint {
  return BigInt(Math.floor(brl * 10 ** decimals));
}

/**
 * Verifica se esta na rede correta
 */
export function isCorrectNetwork(): boolean {
  const wallet = getWalletState();
  const expected = getNetworkConfig().chainId;
  return wallet.chainId === expected;
}

/**
 * Aguarda confirmacao de transacao
 */
export async function waitForTransaction(
  txHash: string,
  confirmations = 1
): Promise<TransactionResult> {
  web3Log('Waiting for transaction:', txHash, 'confirmations:', confirmations);

  // Simula espera
  await new Promise((resolve) => setTimeout(resolve, 3000 * confirmations));

  return {
    hash: txHash,
    status: 'success',
    blockNumber: Number(50000000 + Math.floor(Date.now() / 2000)),
    gasUsed: BigInt(150000),
  };
}

// ============================================
// EXPORTS
// ============================================

export const viemClient = {
  createPublicClient: createViemPublicClient,
  createWalletClient: createViemWalletClient,
  readContract: readVinculoContract,
  writeContract: writeVinculoContract,
  connect: connectWallet,
  disconnect: disconnectWallet,
  getState: getWalletState,
  subscribe: subscribeToWallet,
  switchNetwork,
  formatAddress,
  formatWeiToBRL,
  brlToWei,
  isCorrectNetwork,
  waitForTransaction,
};

export default viemClient;
