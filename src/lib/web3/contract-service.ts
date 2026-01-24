/**
 * Vinculo.io - Contract Service
 *
 * High-level service for interacting with Vinculo.io smart contracts.
 * Provides a clean API for the frontend without exposing low-level Web3 details.
 *
 * Contracts:
 * - VinculoContract: Main rental NFT with 85/5/5/5 split
 * - PropertyCollateral: Property NFT for collateral
 * - VinculoGovernance: Dispute resolution
 */

import {
  web3Config,
  getContractAddress,
  getPropertyCollateralAddress,
  getGovernanceAddress,
  getRpcUrl,
  getNetworkConfig,
  getBlockExplorerUrl,
} from './config';
import {
  VINCULO_CONTRACT_ABI,
  PROPERTY_COLLATERAL_ABI,
  calculatePaymentSplit,
  RentalStatus,
  type RentalStruct,
  type PaymentStruct,
} from './vinculo-contract-abi';
import type {
  CreateRentalParams,
  PayRentParams,
  TransactionResult,
  OnChainRental,
} from './types';

// ============================================
// TYPES
// ============================================

export interface ProtocolStats {
  totalVolume: bigint;
  totalActiveRentals: number;
  totalPaymentsProcessed: number;
  totalContracts: number;
}

export interface PropertyInfo {
  propertyId: string;
  registrationNumber: string;
  owner: string;
  valueBRL: bigint;
  valueWei: bigint;
  ipfsHash: string;
  city: string;
  state: string;
  isLocked: boolean;
  lockedForRental: bigint;
  registeredAt: bigint;
  isVerified: boolean;
}

// ============================================
// DEMO MODE HELPERS
// ============================================

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const generateFakeTxHash = (): string => {
  return `0x${Array.from({ length: 64 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join('')}`;
};

const generateFakeTokenId = (): bigint => {
  return BigInt(Math.floor(Math.random() * 1000000) + 1);
};

// ============================================
// CONTRACT SERVICE
// ============================================

export const contractService = {
  // Contract addresses
  get vinculoAddress(): string {
    return getContractAddress();
  },

  get collateralAddress(): string {
    return getPropertyCollateralAddress();
  },

  get governanceAddress(): string {
    return getGovernanceAddress();
  },

  // Network info
  get network() {
    return getNetworkConfig();
  },

  get rpcUrl(): string {
    return getRpcUrl();
  },

  // ============================================
  // READ FUNCTIONS
  // ============================================

  /**
   * Get protocol statistics
   */
  async getProtocolStats(): Promise<ProtocolStats> {
    web3Config.log('Getting protocol stats...');

    if (web3Config.isDemoMode) {
      await delay(500);
      return {
        totalVolume: BigInt(125400000 * 10000), // 125.4M BRL in BRZ units
        totalActiveRentals: 847,
        totalPaymentsProcessed: 12543,
        totalContracts: 1250,
      };
    }

    // Production: Would call contract.getStats()
    throw new Error('Production mode requires Web3 provider');
  },

  /**
   * Get rental by token ID
   */
  async getRental(tokenId: bigint): Promise<OnChainRental | null> {
    web3Config.log('Getting rental:', tokenId.toString());

    if (web3Config.isDemoMode) {
      await delay(300);
      return {
        tokenId,
        landlord: '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD99',
        tenant: '0x1234567890AbCdEf1234567890AbCdEf12345678',
        guarantor: '0xAbCdEf1234567890AbCdEf1234567890AbCdEf12',
        insurer: '0x9876543210FeDcBa9876543210FeDcBa98765432',
        rentAmount: BigInt(35000000), // 3500 BRL
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        isActive: true,
        collateralPropertyId: 'PROP-2024-0042',
      };
    }

    throw new Error('Production mode requires Web3 provider');
  },

  /**
   * Get landlord's rentals
   */
  async getLandlordRentals(address: string): Promise<bigint[]> {
    web3Config.log('Getting landlord rentals:', address);

    if (web3Config.isDemoMode) {
      await delay(400);
      return [BigInt(1), BigInt(5), BigInt(12), BigInt(23)];
    }

    throw new Error('Production mode requires Web3 provider');
  },

  /**
   * Get tenant's rentals
   */
  async getTenantRentals(address: string): Promise<bigint[]> {
    web3Config.log('Getting tenant rentals:', address);

    if (web3Config.isDemoMode) {
      await delay(400);
      return [BigInt(42)];
    }

    throw new Error('Production mode requires Web3 provider');
  },

  /**
   * Get guarantor's rentals
   */
  async getGuarantorRentals(address: string): Promise<bigint[]> {
    web3Config.log('Getting guarantor rentals:', address);

    if (web3Config.isDemoMode) {
      await delay(400);
      return [BigInt(3), BigInt(7), BigInt(15), BigInt(28), BigInt(35)];
    }

    throw new Error('Production mode requires Web3 provider');
  },

  /**
   * Get payment history for a rental
   */
  async getPaymentHistory(tokenId: bigint): Promise<PaymentStruct[]> {
    web3Config.log('Getting payment history:', tokenId.toString());

    if (web3Config.isDemoMode) {
      await delay(500);
      const now = Date.now();
      return [
        {
          rentalId: tokenId,
          amount: BigInt(35000000),
          timestamp: BigInt(Math.floor((now - 30 * 24 * 60 * 60 * 1000) / 1000)),
          dueDate: BigInt(Math.floor((now - 25 * 24 * 60 * 60 * 1000) / 1000)),
          status: 1, // Paid
          landlordAmount: BigInt(29750000), // 85%
          insurerAmount: BigInt(1750000), // 5%
          platformAmount: BigInt(1750000), // 5%
          guarantorAmount: BigInt(1750000), // 5%
        },
        {
          rentalId: tokenId,
          amount: BigInt(35000000),
          timestamp: BigInt(Math.floor((now - 60 * 24 * 60 * 60 * 1000) / 1000)),
          dueDate: BigInt(Math.floor((now - 55 * 24 * 60 * 60 * 1000) / 1000)),
          status: 1,
          landlordAmount: BigInt(29750000),
          insurerAmount: BigInt(1750000),
          platformAmount: BigInt(1750000),
          guarantorAmount: BigInt(1750000),
        },
      ];
    }

    throw new Error('Production mode requires Web3 provider');
  },

  /**
   * Calculate payment split
   */
  calculateSplit(totalBrl: number) {
    return calculatePaymentSplit(totalBrl);
  },

  // ============================================
  // WRITE FUNCTIONS
  // ============================================

  /**
   * Create a new rental (mint NFT)
   */
  async createRental(params: CreateRentalParams): Promise<TransactionResult> {
    web3Config.log('Creating rental:', params);

    if (web3Config.isDemoMode) {
      await delay(2000);

      // Simulate occasional failure
      if (Math.random() < 0.05) {
        return {
          success: false,
          transactionHash: '',
          error: 'User rejected the transaction',
        };
      }

      const txHash = generateFakeTxHash();
      const tokenId = generateFakeTokenId();

      return {
        success: true,
        transactionHash: txHash,
        blockNumber: 12345678 + Math.floor(Math.random() * 1000),
        gasUsed: '0.0045',
      };
    }

    throw new Error('Production mode requires Web3 provider');
  },

  /**
   * Pay rent with automatic 85/5/5/5 split
   */
  async payRent(params: PayRentParams): Promise<TransactionResult> {
    web3Config.log('Paying rent:', params);

    if (web3Config.isDemoMode) {
      await delay(2500);

      // Simulate occasional failure
      if (Math.random() < 0.03) {
        return {
          success: false,
          transactionHash: '',
          error: 'Insufficient funds for gas',
        };
      }

      const txHash = generateFakeTxHash();

      return {
        success: true,
        transactionHash: txHash,
        blockNumber: 12345678 + Math.floor(Math.random() * 1000),
        gasUsed: '0.0023',
      };
    }

    throw new Error('Production mode requires Web3 provider');
  },

  /**
   * Lock collateral for a rental
   */
  async lockCollateral(
    tokenId: bigint,
    collateralPropertyId: string,
    collateralValue: bigint
  ): Promise<TransactionResult> {
    web3Config.log('Locking collateral:', { tokenId, collateralPropertyId, collateralValue });

    if (web3Config.isDemoMode) {
      await delay(2000);

      const txHash = generateFakeTxHash();

      return {
        success: true,
        transactionHash: txHash,
        blockNumber: 12345678 + Math.floor(Math.random() * 1000),
        gasUsed: '0.0035',
      };
    }

    throw new Error('Production mode requires Web3 provider');
  },

  /**
   * Open a dispute
   */
  async openDispute(tokenId: bigint, reason: string): Promise<TransactionResult> {
    web3Config.log('Opening dispute:', { tokenId, reason });

    if (web3Config.isDemoMode) {
      await delay(1500);

      const txHash = generateFakeTxHash();

      return {
        success: true,
        transactionHash: txHash,
        blockNumber: 12345678 + Math.floor(Math.random() * 1000),
        gasUsed: '0.0018',
      };
    }

    throw new Error('Production mode requires Web3 provider');
  },

  /**
   * Resolve a dispute (admin only)
   */
  async resolveDispute(tokenId: bigint, inFavorOfLandlord: boolean): Promise<TransactionResult> {
    web3Config.log('Resolving dispute:', { tokenId, inFavorOfLandlord });

    if (web3Config.isDemoMode) {
      await delay(2000);

      const txHash = generateFakeTxHash();

      return {
        success: true,
        transactionHash: txHash,
        blockNumber: 12345678 + Math.floor(Math.random() * 1000),
        gasUsed: '0.0028',
      };
    }

    throw new Error('Production mode requires Web3 provider');
  },

  /**
   * Terminate a rental
   */
  async terminateRental(tokenId: bigint): Promise<TransactionResult> {
    web3Config.log('Terminating rental:', tokenId.toString());

    if (web3Config.isDemoMode) {
      await delay(2000);

      const txHash = generateFakeTxHash();

      return {
        success: true,
        transactionHash: txHash,
        blockNumber: 12345678 + Math.floor(Math.random() * 1000),
        gasUsed: '0.0032',
      };
    }

    throw new Error('Production mode requires Web3 provider');
  },

  // ============================================
  // ADMIN FUNCTIONS
  // ============================================

  /**
   * Pause the protocol (emergency)
   */
  async pauseProtocol(): Promise<TransactionResult> {
    web3Config.log('Pausing protocol...');

    if (web3Config.isDemoMode) {
      await delay(2000);

      const txHash = generateFakeTxHash();

      return {
        success: true,
        transactionHash: txHash,
        blockNumber: 12345678 + Math.floor(Math.random() * 1000),
        gasUsed: '0.0012',
      };
    }

    throw new Error('Production mode requires Web3 provider');
  },

  /**
   * Unpause the protocol
   */
  async unpauseProtocol(): Promise<TransactionResult> {
    web3Config.log('Unpausing protocol...');

    if (web3Config.isDemoMode) {
      await delay(2000);

      const txHash = generateFakeTxHash();

      return {
        success: true,
        transactionHash: txHash,
        blockNumber: 12345678 + Math.floor(Math.random() * 1000),
        gasUsed: '0.0012',
      };
    }

    throw new Error('Production mode requires Web3 provider');
  },

  // ============================================
  // PROPERTY COLLATERAL FUNCTIONS
  // ============================================

  /**
   * Register a property as collateral
   */
  async registerProperty(
    propertyId: string,
    registrationNumber: string,
    valueBRL: number,
    city: string,
    state: string,
    ipfsHash: string
  ): Promise<TransactionResult> {
    web3Config.log('Registering property:', { propertyId, valueBRL, city, state });

    if (web3Config.isDemoMode) {
      await delay(2500);

      const txHash = generateFakeTxHash();

      return {
        success: true,
        transactionHash: txHash,
        blockNumber: 12345678 + Math.floor(Math.random() * 1000),
        gasUsed: '0.0055',
      };
    }

    throw new Error('Production mode requires Web3 provider');
  },

  /**
   * Get property information
   */
  async getProperty(tokenId: bigint): Promise<PropertyInfo | null> {
    web3Config.log('Getting property:', tokenId.toString());

    if (web3Config.isDemoMode) {
      await delay(300);
      return {
        propertyId: `PROP-${tokenId}`,
        registrationNumber: `MAT-${Math.floor(Math.random() * 100000)}`,
        owner: '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD99',
        valueBRL: BigInt(5000000000), // 500k BRL in cents
        valueWei: BigInt(100000000000000000), // 0.1 ETH equivalent
        ipfsHash: 'QmXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXxXx',
        city: 'Sao Paulo',
        state: 'SP',
        isLocked: false,
        lockedForRental: BigInt(0),
        registeredAt: BigInt(Math.floor(Date.now() / 1000) - 30 * 24 * 60 * 60),
        isVerified: true,
      };
    }

    throw new Error('Production mode requires Web3 provider');
  },

  // ============================================
  // UTILITY FUNCTIONS
  // ============================================

  /**
   * Get block explorer URL for a transaction
   */
  getTxUrl(hash: string): string {
    return getBlockExplorerUrl('tx', hash);
  },

  /**
   * Get block explorer URL for an address
   */
  getAddressUrl(address: string): string {
    return getBlockExplorerUrl('address', address);
  },

  /**
   * Check if demo mode is active
   */
  get isDemoMode(): boolean {
    return web3Config.isDemoMode;
  },
};

export default contractService;
