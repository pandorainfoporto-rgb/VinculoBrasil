/**
 * Vinculo.io - Web3 Types
 *
 * TypeScript types for Web3 integration
 */

// Wallet connection states
export type WalletConnectionStatus =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'error';

// Transaction states for UI feedback
export type TransactionStatus =
  | 'idle'
  | 'pending_signature' // Waiting for user to sign in wallet
  | 'pending_confirmation' // Transaction sent, waiting for mining
  | 'success'
  | 'error';

// Wallet info after connection
export interface WalletInfo {
  address: string;
  chainId: number;
  balance: string;
  isConnected: boolean;
  connectorName: string;
}

// Transaction result
export interface TransactionResult {
  success: boolean;
  transactionHash: string;
  blockNumber?: number;
  gasUsed?: string;
  error?: string;
}

// Create Rental parameters
export interface CreateRentalParams {
  tenantAddress: string;
  guarantorAddress: string;
  insurerAddress: string;
  rentAmountWei: bigint;
  durationSeconds: number;
  collateralPropertyId: string;
}

// Pay Rent parameters
export interface PayRentParams {
  tokenId: bigint;
  amountWei: bigint;
}

// Rental data from blockchain
export interface OnChainRental {
  tokenId: bigint;
  landlord: string;
  tenant: string;
  guarantor: string;
  insurer: string;
  rentAmount: bigint;
  dueDate: Date;
  isActive: boolean;
  collateralPropertyId: string;
}

// Payment split result
export interface PaymentSplitResult {
  landlordAmount: bigint;
  insurerAmount: bigint;
  platformAmount: bigint;
  guarantorAmount: bigint;
}

// Stablecoin for BRL payments (BRZ token)
export interface StablecoinConfig {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  oracleAddress: string; // Chainlink oracle for BRL/USD
}

export const BRZ_TOKEN: StablecoinConfig = {
  symbol: 'BRZ',
  name: 'Brazilian Digital Token',
  address: '0x4eD141110F6EEeaba9A1df36d8c26f684d2475Dc', // BRZ on Polygon
  decimals: 4,
  oracleAddress: '0x12162c3E810393dEC01F3E1A2Bbb9cFB3E0C6c60', // BRL/USD Chainlink
};

// Helper to convert BRL to token amount
export function brlToTokenAmount(brlAmount: number): bigint {
  // BRZ has 4 decimals, so 1 BRL = 10000 in token units
  return BigInt(Math.round(brlAmount * 10000));
}

// Helper to convert token amount to BRL
export function tokenAmountToBrl(tokenAmount: bigint): number {
  return Number(tokenAmount) / 10000;
}

// Wallet connector types supported
export type WalletConnectorType =
  | 'metamask'
  | 'walletconnect'
  | 'coinbase'
  | 'social'; // Social login via Web3Auth

// Web3 provider configuration
export interface Web3ProviderConfig {
  defaultChainId: number;
  supportedChainIds: number[];
  rpcUrls: Record<number, string>;
  walletConnectProjectId?: string;
}

export const DEFAULT_WEB3_CONFIG: Web3ProviderConfig = {
  defaultChainId: 137, // Polygon
  supportedChainIds: [137, 80001], // Polygon Mainnet + Mumbai
  rpcUrls: {
    137: 'https://polygon-rpc.com',
    80001: 'https://rpc-mumbai.maticvigil.com',
  },
};
