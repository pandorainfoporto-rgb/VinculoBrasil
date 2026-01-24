/**
 * Vinculo.io - Web3 Configuration
 *
 * Centralized configuration for blockchain integration.
 * Reads from environment variables for deployment flexibility.
 */

import {
  VINCULO_CONTRACT_ADDRESSES,
  PROPERTY_COLLATERAL_ADDRESSES,
  GOVERNANCE_ADDRESSES,
  SUPPORTED_NETWORKS,
  INFURA_RPC_URLS,
  DEFAULT_INFURA_API_KEY,
} from './vinculo-contract-abi';
import { BRZ_TOKEN, DEFAULT_WEB3_CONFIG } from './types';

// Environment detection
export const isProduction = import.meta.env.VITE_APP_ENV === 'production';
export const isDemoMode = import.meta.env.VITE_DEMO_MODE === 'true';
export const isDebugMode = import.meta.env.VITE_DEBUG_WEB3 === 'true';

// Active network from environment
export type NetworkName = 'polygon' | 'polygonAmoy' | 'polygonMumbai' | 'localhost';
export const activeNetwork: NetworkName =
  (import.meta.env.VITE_BLOCKCHAIN_NETWORK as NetworkName) || 'polygonAmoy';

// Get network configuration
export function getNetworkConfig() {
  const network = activeNetwork === 'localhost' ? 'polygonAmoy' : activeNetwork;
  if (network === 'polygonMumbai') {
    // Mumbai is deprecated, fallback to Amoy
    return SUPPORTED_NETWORKS.polygonAmoy;
  }
  return SUPPORTED_NETWORKS[network];
}

// Get VinculoContract address for active network
export function getContractAddress(): string {
  // First check environment variable
  const envAddress = import.meta.env.VITE_VINCULO_CONTRACT_ADDRESS;
  if (envAddress && envAddress !== '0x0000000000000000000000000000000000000000') {
    return envAddress;
  }

  // Fallback to predefined addresses
  return VINCULO_CONTRACT_ADDRESSES[activeNetwork] || VINCULO_CONTRACT_ADDRESSES.polygonAmoy;
}

// Get PropertyCollateral contract address
export function getPropertyCollateralAddress(): string {
  const envAddress = import.meta.env.VITE_PROPERTY_COLLATERAL_ADDRESS;
  if (envAddress && envAddress !== '0x0000000000000000000000000000000000000000') {
    return envAddress;
  }
  return PROPERTY_COLLATERAL_ADDRESSES[activeNetwork as keyof typeof PROPERTY_COLLATERAL_ADDRESSES]
    || PROPERTY_COLLATERAL_ADDRESSES.polygonAmoy;
}

// Get VinculoGovernance contract address
export function getGovernanceAddress(): string {
  const envAddress = import.meta.env.VITE_GOVERNANCE_ADDRESS;
  if (envAddress && envAddress !== '0x0000000000000000000000000000000000000000') {
    return envAddress;
  }
  return GOVERNANCE_ADDRESSES[activeNetwork as keyof typeof GOVERNANCE_ADDRESSES]
    || GOVERNANCE_ADDRESSES.polygonAmoy;
}

// Get all contract addresses
export function getAllContractAddresses() {
  return {
    vinculoContract: getContractAddress(),
    propertyCollateral: getPropertyCollateralAddress(),
    governance: getGovernanceAddress(),
  };
}

// Get RPC URL for active network
export function getRpcUrl(): string {
  const network = getNetworkConfig();
  const infuraKey = import.meta.env.VITE_INFURA_API_KEY || DEFAULT_INFURA_API_KEY;
  const alchemyKey = import.meta.env.VITE_ALCHEMY_API_KEY;

  if (activeNetwork === 'polygon') {
    // Prefer Infura, then Alchemy, then default
    if (infuraKey) {
      return INFURA_RPC_URLS.polygon(infuraKey);
    }
    if (alchemyKey) {
      return `https://polygon-mainnet.g.alchemy.com/v2/${alchemyKey}`;
    }
    return import.meta.env.VITE_POLYGON_RPC_URL || network.rpcUrl;
  }

  if (activeNetwork === 'polygonAmoy' || activeNetwork === 'polygonMumbai') {
    // Prefer Infura, then Alchemy, then default
    if (infuraKey) {
      return INFURA_RPC_URLS.polygonAmoy(infuraKey);
    }
    if (alchemyKey) {
      return `https://polygon-amoy.g.alchemy.com/v2/${alchemyKey}`;
    }
    return import.meta.env.VITE_POLYGON_AMOY_RPC_URL || network.rpcUrl;
  }

  return network.rpcUrl;
}

// Get BRZ token configuration
export function getBrzTokenConfig() {
  const envAddress = import.meta.env.VITE_BRZ_TOKEN_ADDRESS;

  return {
    ...BRZ_TOKEN,
    address: envAddress || BRZ_TOKEN.address,
  };
}

// Platform wallet addresses
export function getPlatformWallets() {
  return {
    platform: import.meta.env.VITE_PLATFORM_WALLET || '0x0000000000000000000000000000000000000001',
    insurance: import.meta.env.VITE_INSURANCE_WALLET || '0x0000000000000000000000000000000000000002',
  };
}

// WalletConnect configuration
export function getWalletConnectConfig() {
  return {
    projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || '',
    chains: [getNetworkConfig().chainId],
    showQrModal: true,
  };
}

// Full Web3 configuration
export function getWeb3Config() {
  const networkConfig = getNetworkConfig();

  return {
    ...DEFAULT_WEB3_CONFIG,
    defaultChainId: networkConfig.chainId,
    rpcUrls: {
      [networkConfig.chainId]: getRpcUrl(),
    },
    walletConnectProjectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID,
  };
}

// Block explorer URL helpers
export function getBlockExplorerUrl(type: 'tx' | 'address' | 'token', hash: string): string {
  const network = getNetworkConfig();
  const base = network.blockExplorer;

  switch (type) {
    case 'tx':
      return `${base}/tx/${hash}`;
    case 'address':
      return `${base}/address/${hash}`;
    case 'token':
      return `${base}/token/${hash}`;
    default:
      return base;
  }
}

// Debug logger
export function web3Log(...args: unknown[]) {
  if (isDebugMode) {
    console.log('[Vinculo.io Web3]', ...args);
  }
}

// Configuration summary for debugging
export function getConfigSummary() {
  return {
    network: activeNetwork,
    chainId: getNetworkConfig().chainId,
    contracts: getAllContractAddresses(),
    rpcUrl: getRpcUrl(),
    brzToken: getBrzTokenConfig().address,
    isDemo: isDemoMode,
    isProduction,
  };
}

// Export as default config object
export const web3Config = {
  network: activeNetwork,
  getNetworkConfig,
  getContractAddress,
  getPropertyCollateralAddress,
  getGovernanceAddress,
  getAllContractAddresses,
  getRpcUrl,
  getBrzTokenConfig,
  getPlatformWallets,
  getWalletConnectConfig,
  getWeb3Config,
  getBlockExplorerUrl,
  isDemoMode,
  isProduction,
  isDebugMode,
  log: web3Log,
};

export default web3Config;
