/**
 * Vinculo.io - Smart Contract ABI
 *
 * Este arquivo contém a ABI (Application Binary Interface) dos Smart Contracts
 * para integração com o frontend via ethers.js/wagmi.
 *
 * Network: Polygon (MATIC) - escolhido por baixas taxas de gas
 * Token Standard: ERC-721 (NFT)
 *
 * Contracts:
 * - VinculoContract: Main rental NFT contract with 85/5/5/5 split
 * - PropertyCollateral: NFT for collateralized properties
 * - VinculoGovernance: Dispute resolution system
 */

// ============================================
// CONTRACT ADDRESSES
// ============================================

// VinculoContract - Main Rental NFT Contract
// These will be updated after deployment - check contracts/deployments/*.json
export const VINCULO_CONTRACT_ADDRESSES = {
  polygon: '0x0000000000000000000000000000000000000000', // Deploy pending
  polygonAmoy: '0x0000000000000000000000000000000000000000', // Deploy pending
  polygonMumbai: '0x0000000000000000000000000000000000000000', // Deprecated - use Amoy
  localhost: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
} as const;

// PropertyCollateral - Collateral Property NFT Contract
export const PROPERTY_COLLATERAL_ADDRESSES = {
  polygon: '0x0000000000000000000000000000000000000000',
  polygonAmoy: '0x0000000000000000000000000000000000000000',
  localhost: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
} as const;

// VinculoGovernance - Dispute Resolution Contract
export const GOVERNANCE_ADDRESSES = {
  polygon: '0x0000000000000000000000000000000000000000',
  polygonAmoy: '0x0000000000000000000000000000000000000000',
  localhost: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0',
} as const;

// ============================================
// TYPE DEFINITIONS
// ============================================

// Rental Status Enum (matching Solidity)
export enum RentalStatus {
  Pending = 0,
  Active = 1,
  Disputed = 2,
  Terminated = 3,
  Defaulted = 4,
}

// Payment Status Enum
export enum PaymentStatus {
  Pending = 0,
  Paid = 1,
  Late = 2,
  Disputed = 3,
}

// Rental struct as defined in Solidity
export interface RentalStruct {
  landlord: string;
  tenant: string;
  guarantor: string;
  insurer: string;
  rentAmount: bigint;
  securityDeposit: bigint;
  collateralValue: bigint;
  startDate: bigint;
  endDate: bigint;
  paymentDueDay: number;
  status: RentalStatus;
  totalPayments: bigint;
  missedPayments: bigint;
  propertyId: string;
  collateralPropertyId: string;
  ipfsHash: string;
}

// Legacy interface for backward compatibility
export interface LegacyRentalStruct {
  landlord: string;
  tenant: string;
  guarantor: string;
  insurer: string;
  rentAmount: bigint;
  dueDate: bigint;
  isActive: boolean;
  collateralPropertyId: string;
}

// Payment struct
export interface PaymentStruct {
  rentalId: bigint;
  amount: bigint;
  timestamp: bigint;
  dueDate: bigint;
  status: PaymentStatus;
  landlordAmount: bigint;
  insurerAmount: bigint;
  platformAmount: bigint;
  guarantorAmount: bigint;
}

// Contract events
export interface RentalCreatedEvent {
  tokenId: bigint;
  landlord: string;
  tenant: string;
  rentAmount: bigint;
  propertyId: string;
}

export interface PaymentReceivedEvent {
  tokenId: bigint;
  payer: string;
  amount: bigint;
  landlordAmount: bigint;
  insurerAmount: bigint;
  platformAmount: bigint;
  guarantorAmount: bigint;
}

export interface CollateralLockedEvent {
  tokenId: bigint;
  guarantor: string;
  collateralPropertyId: string;
  value: bigint;
}

export interface RentalActivatedEvent {
  tokenId: bigint;
  startDate: bigint;
  endDate: bigint;
}

export interface DisputeOpenedEvent {
  tokenId: bigint;
  initiator: string;
  reason: string;
}

// ============================================
// VINCULO CONTRACT ABI
// ============================================

export const VINCULO_CONTRACT_ABI = [
  // ERC721 Standard
  {
    inputs: [{ name: '_platformWallet', type: 'address' }],
    stateMutability: 'nonpayable',
    type: 'constructor',
  },
  {
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    name: 'ownerOf',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [{ name: 'owner', type: 'address' }],
    name: 'balanceOf',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },

  // === SPLIT CONSTANTS ===
  {
    inputs: [],
    name: 'LANDLORD_SPLIT',
    outputs: [{ name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'INSURER_SPLIT',
    outputs: [{ name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'PLATFORM_SPLIT',
    outputs: [{ name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function',
  },
  {
    inputs: [],
    name: 'GUARANTOR_SPLIT',
    outputs: [{ name: '', type: 'uint8' }],
    stateMutability: 'view',
    type: 'function',
  },

  // === MAIN FUNCTIONS ===

  // Create Rental (Minting NFT)
  {
    inputs: [
      { name: 'landlord', type: 'address' },
      { name: 'tenant', type: 'address' },
      { name: 'guarantor', type: 'address' },
      { name: 'insurer', type: 'address' },
      { name: 'rentAmount', type: 'uint256' },
      { name: 'securityDeposit', type: 'uint256' },
      { name: 'startDate', type: 'uint256' },
      { name: 'endDate', type: 'uint256' },
      { name: 'paymentDueDay', type: 'uint8' },
      { name: 'propertyId', type: 'string' },
      { name: 'ipfsHash', type: 'string' },
    ],
    name: 'createRental',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },

  // Lock Collateral
  {
    inputs: [
      { name: 'tokenId', type: 'uint256' },
      { name: 'collateralPropertyId', type: 'string' },
      { name: 'collateralValue', type: 'uint256' },
    ],
    name: 'lockCollateral',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },

  // Activate Rental
  {
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    name: 'activateRental',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },

  // Pay Rent with 85/5/5/5 Split
  {
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    name: 'payRent',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },

  // Open Dispute
  {
    inputs: [
      { name: 'tokenId', type: 'uint256' },
      { name: 'reason', type: 'string' },
    ],
    name: 'openDispute',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },

  // Resolve Dispute (admin only)
  {
    inputs: [
      { name: 'tokenId', type: 'uint256' },
      { name: 'inFavorOfLandlord', type: 'bool' },
    ],
    name: 'resolveDispute',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },

  // Terminate Rental
  {
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    name: 'terminateRental',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },

  // Seize Collateral
  {
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    name: 'seizeCollateral',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },

  // === VIEW FUNCTIONS ===

  // Get Rental
  {
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    name: 'getRental',
    outputs: [
      {
        components: [
          { name: 'landlord', type: 'address' },
          { name: 'tenant', type: 'address' },
          { name: 'guarantor', type: 'address' },
          { name: 'insurer', type: 'address' },
          { name: 'rentAmount', type: 'uint256' },
          { name: 'securityDeposit', type: 'uint256' },
          { name: 'collateralValue', type: 'uint256' },
          { name: 'startDate', type: 'uint256' },
          { name: 'endDate', type: 'uint256' },
          { name: 'paymentDueDay', type: 'uint256' },
          { name: 'status', type: 'uint8' },
          { name: 'totalPayments', type: 'uint256' },
          { name: 'missedPayments', type: 'uint256' },
          { name: 'propertyId', type: 'string' },
          { name: 'collateralPropertyId', type: 'string' },
          { name: 'ipfsHash', type: 'string' },
        ],
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },

  // Get Payment History
  {
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    name: 'getPaymentHistory',
    outputs: [
      {
        components: [
          { name: 'rentalId', type: 'uint256' },
          { name: 'amount', type: 'uint256' },
          { name: 'timestamp', type: 'uint256' },
          { name: 'dueDate', type: 'uint256' },
          { name: 'status', type: 'uint8' },
          { name: 'landlordAmount', type: 'uint256' },
          { name: 'insurerAmount', type: 'uint256' },
          { name: 'platformAmount', type: 'uint256' },
          { name: 'guarantorAmount', type: 'uint256' },
        ],
        name: '',
        type: 'tuple[]',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },

  // Get Landlord Rentals
  {
    inputs: [{ name: 'landlord', type: 'address' }],
    name: 'getLandlordRentals',
    outputs: [{ name: '', type: 'uint256[]' }],
    stateMutability: 'view',
    type: 'function',
  },

  // Get Tenant Rentals
  {
    inputs: [{ name: 'tenant', type: 'address' }],
    name: 'getTenantRentals',
    outputs: [{ name: '', type: 'uint256[]' }],
    stateMutability: 'view',
    type: 'function',
  },

  // Get Guarantor Rentals
  {
    inputs: [{ name: 'guarantor', type: 'address' }],
    name: 'getGuarantorRentals',
    outputs: [{ name: '', type: 'uint256[]' }],
    stateMutability: 'view',
    type: 'function',
  },

  // Calculate Split
  {
    inputs: [{ name: 'amount', type: 'uint256' }],
    name: 'calculateSplit',
    outputs: [
      { name: 'landlordAmount', type: 'uint256' },
      { name: 'insurerAmount', type: 'uint256' },
      { name: 'platformAmount', type: 'uint256' },
      { name: 'guarantorAmount', type: 'uint256' },
    ],
    stateMutability: 'pure',
    type: 'function',
  },

  // Get Stats
  {
    inputs: [],
    name: 'getStats',
    outputs: [
      { name: '_totalVolume', type: 'uint256' },
      { name: '_totalActiveRentals', type: 'uint256' },
      { name: '_totalPaymentsProcessed', type: 'uint256' },
      { name: '_totalContracts', type: 'uint256' },
    ],
    stateMutability: 'view',
    type: 'function',
  },

  // Collateral Locked
  {
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    name: 'collateralLocked',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },

  // Platform Wallet
  {
    inputs: [],
    name: 'platformWallet',
    outputs: [{ name: '', type: 'address' }],
    stateMutability: 'view',
    type: 'function',
  },

  // === EVENTS ===
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'tokenId', type: 'uint256' },
      { indexed: true, name: 'landlord', type: 'address' },
      { indexed: true, name: 'tenant', type: 'address' },
      { indexed: false, name: 'rentAmount', type: 'uint256' },
      { indexed: false, name: 'propertyId', type: 'string' },
    ],
    name: 'RentalCreated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'tokenId', type: 'uint256' },
      { indexed: false, name: 'startDate', type: 'uint256' },
      { indexed: false, name: 'endDate', type: 'uint256' },
    ],
    name: 'RentalActivated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'tokenId', type: 'uint256' },
      { indexed: true, name: 'payer', type: 'address' },
      { indexed: false, name: 'amount', type: 'uint256' },
      { indexed: false, name: 'landlordAmount', type: 'uint256' },
      { indexed: false, name: 'insurerAmount', type: 'uint256' },
      { indexed: false, name: 'platformAmount', type: 'uint256' },
      { indexed: false, name: 'guarantorAmount', type: 'uint256' },
    ],
    name: 'PaymentReceived',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'tokenId', type: 'uint256' },
      { indexed: true, name: 'guarantor', type: 'address' },
      { indexed: false, name: 'collateralPropertyId', type: 'string' },
      { indexed: false, name: 'value', type: 'uint256' },
    ],
    name: 'CollateralLocked',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'tokenId', type: 'uint256' },
      { indexed: true, name: 'guarantor', type: 'address' },
    ],
    name: 'CollateralUnlocked',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'tokenId', type: 'uint256' },
      { indexed: true, name: 'guarantor', type: 'address' },
      { indexed: false, name: 'amountClaimed', type: 'uint256' },
    ],
    name: 'CollateralSeized',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'tokenId', type: 'uint256' },
      { indexed: false, name: 'finalStatus', type: 'uint8' },
    ],
    name: 'RentalTerminated',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'tokenId', type: 'uint256' },
      { indexed: true, name: 'initiator', type: 'address' },
      { indexed: false, name: 'reason', type: 'string' },
    ],
    name: 'DisputeOpened',
    type: 'event',
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: 'tokenId', type: 'uint256' },
      { indexed: false, name: 'inFavorOfLandlord', type: 'bool' },
    ],
    name: 'DisputeResolved',
    type: 'event',
  },
] as const;

// ============================================
// PROPERTY COLLATERAL ABI
// ============================================

export const PROPERTY_COLLATERAL_ABI = [
  // Register Property
  {
    inputs: [
      { name: 'propertyId', type: 'string' },
      { name: 'registrationNumber', type: 'string' },
      { name: 'valueBRL', type: 'uint256' },
      { name: 'valueWei', type: 'uint256' },
      { name: 'city', type: 'string' },
      { name: 'state', type: 'string' },
      { name: 'ipfsHash', type: 'string' },
    ],
    name: 'registerProperty',
    outputs: [{ name: '', type: 'uint256' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  // Verify Property (admin)
  {
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    name: 'verifyProperty',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  // Lock as Collateral
  {
    inputs: [
      { name: 'tokenId', type: 'uint256' },
      { name: 'rentalContractId', type: 'uint256' },
    ],
    name: 'lockAsCollateral',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  // Unlock Collateral
  {
    inputs: [
      { name: 'tokenId', type: 'uint256' },
      { name: 'rentalContractId', type: 'uint256' },
    ],
    name: 'unlockCollateral',
    outputs: [],
    stateMutability: 'nonpayable',
    type: 'function',
  },
  // Get Property
  {
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    name: 'getProperty',
    outputs: [
      {
        components: [
          { name: 'propertyId', type: 'string' },
          { name: 'registrationNumber', type: 'string' },
          { name: 'owner', type: 'address' },
          { name: 'valueBRL', type: 'uint256' },
          { name: 'valueWei', type: 'uint256' },
          { name: 'ipfsHash', type: 'string' },
          { name: 'city', type: 'string' },
          { name: 'state', type: 'string' },
          { name: 'isLocked', type: 'bool' },
          { name: 'lockedForRental', type: 'uint256' },
          { name: 'registeredAt', type: 'uint256' },
          { name: 'isVerified', type: 'bool' },
        ],
        name: '',
        type: 'tuple',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
  // Can Be Used as Collateral
  {
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    name: 'canBeUsedAsCollateral',
    outputs: [{ name: '', type: 'bool' }],
    stateMutability: 'view',
    type: 'function',
  },
] as const;

// ============================================
// CONSTANTS
// ============================================

// Split percentages (immutable in contract)
export const PAYMENT_SPLIT = {
  LANDLORD_PERCENTAGE: 85,
  INSURER_PERCENTAGE: 5,
  PLATFORM_PERCENTAGE: 5,
  GUARANTOR_PERCENTAGE: 5,
} as const;

// Helper to calculate split amounts from total (what tenant pays)
export function calculatePaymentSplit(totalAmount: number): {
  landlord: number;
  insurer: number;
  platform: number;
  guarantor: number;
} {
  return {
    landlord: (totalAmount * PAYMENT_SPLIT.LANDLORD_PERCENTAGE) / 100,
    insurer: (totalAmount * PAYMENT_SPLIT.INSURER_PERCENTAGE) / 100,
    platform: (totalAmount * PAYMENT_SPLIT.PLATFORM_PERCENTAGE) / 100,
    guarantor: (totalAmount * PAYMENT_SPLIT.GUARANTOR_PERCENTAGE) / 100,
  };
}

/**
 * Calcula o valor TOTAL a cobrar do inquilino baseado no valor
 * que o proprietario deseja RECEBER liquido.
 *
 * Formula: x = (valorDesejadoLocador × 100) / 85
 *
 * Exemplo:
 *   Proprietario quer receber R$ 2.000
 *   x = (2000 × 100) / 85 = R$ 2.352,94
 *
 *   Distribuicao (5% cada):
 *   - Locador: R$ 2.000,00 (85%)
 *   - Seguradora: R$ 117,65 (5%)
 *   - Garantidor: R$ 117,65 (5%)
 *   - Plataforma: R$ 117,65 (5%)
 */
export function calculateTotalFromLandlordAmount(landlordDesiredAmount: number): {
  valorTotal: number;
  landlord: number;
  insurer: number;
  platform: number;
  guarantor: number;
  detalhes: {
    formula: string;
    percentualLocador: number;
    percentualTaxas: number;
  };
} {
  // Formula: x = (B × C) / A  onde B = valor desejado, C = 100, A = 85
  const valorTotal = (landlordDesiredAmount * 100) / PAYMENT_SPLIT.LANDLORD_PERCENTAGE;

  // Arredondar para 2 casas decimais
  const valorTotalArredondado = Math.round(valorTotal * 100) / 100;

  // Calcular as parcelas
  const landlord = Math.round((valorTotalArredondado * PAYMENT_SPLIT.LANDLORD_PERCENTAGE) / 100 * 100) / 100;
  const insurer = Math.round((valorTotalArredondado * PAYMENT_SPLIT.INSURER_PERCENTAGE) / 100 * 100) / 100;
  const platform = Math.round((valorTotalArredondado * PAYMENT_SPLIT.PLATFORM_PERCENTAGE) / 100 * 100) / 100;
  const guarantor = Math.round((valorTotalArredondado * PAYMENT_SPLIT.GUARANTOR_PERCENTAGE) / 100 * 100) / 100;

  return {
    valorTotal: valorTotalArredondado,
    landlord,
    insurer,
    platform,
    guarantor,
    detalhes: {
      formula: `(${landlordDesiredAmount} × 100) / ${PAYMENT_SPLIT.LANDLORD_PERCENTAGE} = ${valorTotalArredondado}`,
      percentualLocador: PAYMENT_SPLIT.LANDLORD_PERCENTAGE,
      percentualTaxas: PAYMENT_SPLIT.INSURER_PERCENTAGE + PAYMENT_SPLIT.PLATFORM_PERCENTAGE + PAYMENT_SPLIT.GUARANTOR_PERCENTAGE,
    },
  };
}

// Network configuration for supported chains
export const SUPPORTED_NETWORKS = {
  polygon: {
    chainId: 137,
    name: 'Polygon Mainnet',
    rpcUrl: 'https://polygon-rpc.com',
    blockExplorer: 'https://polygonscan.com',
    nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
  },
  polygonAmoy: {
    chainId: 80002,
    name: 'Polygon Amoy Testnet',
    rpcUrl: 'https://rpc-amoy.polygon.technology',
    blockExplorer: 'https://amoy.polygonscan.com',
    nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
  },
  polygonMumbai: {
    chainId: 80001,
    name: 'Polygon Mumbai Testnet (Deprecated)',
    rpcUrl: 'https://rpc-mumbai.maticvigil.com',
    blockExplorer: 'https://mumbai.polygonscan.com',
    nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
  },
} as const;

// Infura RPC URLs
export const INFURA_RPC_URLS = {
  polygon: (apiKey: string) => `https://polygon-mainnet.infura.io/v3/${apiKey}`,
  polygonAmoy: (apiKey: string) => `https://polygon-amoy.infura.io/v3/${apiKey}`,
} as const;

// Default Infura API Key (for read-only operations)
export const DEFAULT_INFURA_API_KEY = 'e174778af54f4deb952c3f95a6f11c68';
