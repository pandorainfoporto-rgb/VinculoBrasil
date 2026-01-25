// ============================================
// WEB3 HELPER - Polygon Blockchain Connection
// Custodial Model: Admin Wallet signs all transactions
// ============================================

import { ethers, type Contract } from 'ethers';
import { prisma } from './prisma.js';
import { config } from '../config/index.js';
import { logger } from './logger.js';
import crypto from 'crypto';

// ============================================
// CONFIGURATION
// ============================================

// RPC URL - Polygon Amoy Testnet or Mainnet
const RPC_URL = process.env.POLYGON_RPC_URL || 'https://rpc-amoy.polygon.technology/';

// Private Key from environment (Admin Wallet - Custodian)
const PRIVATE_KEY = process.env.ADMIN_PRIVATE_KEY;

// ============================================
// HELPERS
// ============================================

// Decrypt config values from database
const decrypt = (encryptedText: string): string => {
  try {
    const [ivHex, encrypted] = encryptedText.split(':');
    if (!ivHex || !encrypted) return encryptedText;

    const iv = Buffer.from(ivHex, 'hex');
    const key = Buffer.from(config.encryptionKey.padEnd(32, '0').slice(0, 32));
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch {
    return encryptedText;
  }
};

// Get Smart Contract Address from database or env
const getContractAddress = async (): Promise<string> => {
  try {
    // First try database
    const configRecord = await prisma.systemConfig.findUnique({
      where: { key: 'SMART_CONTRACT_ADDRESS' }
    });

    if (configRecord?.value) {
      // Smart contract address is NOT encrypted (it's public)
      return configRecord.value;
    }

    // Fallback to environment variable
    if (process.env.SMART_CONTRACT_ADDRESS) {
      return process.env.SMART_CONTRACT_ADDRESS;
    }

    throw new Error('SMART_CONTRACT_ADDRESS not configured');
  } catch (error) {
    logger.error(`Failed to get contract address: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
};

// ============================================
// ABI - Minimal Interface for VinculoNFT
// ============================================

const VINCULO_NFT_ABI = [
  // Mint function (only owner can call)
  'function safeMint(address to, string memory uri) public returns (uint256)',

  // Standard ERC-721 view functions
  'function tokenURI(uint256 tokenId) public view returns (string memory)',
  'function ownerOf(uint256 tokenId) public view returns (address)',
  'function balanceOf(address owner) public view returns (uint256)',
  'function totalSupply() public view returns (uint256)',

  // Events
  'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)',
];

// ============================================
// EXPORTED FUNCTIONS
// ============================================

/**
 * Get JSON RPC Provider for Polygon
 */
export const getProvider = () => {
  return new ethers.JsonRpcProvider(RPC_URL);
};

/**
 * Get Admin Wallet (Custodian)
 * This wallet pays gas and signs all NFT mint transactions
 */
export const getAdminWallet = () => {
  if (!PRIVATE_KEY) {
    throw new Error('ADMIN_PRIVATE_KEY not configured. Set it in server/.env');
  }

  const provider = getProvider();
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

  logger.info(`Admin wallet initialized: ${wallet.address}`);

  return wallet;
};

/**
 * Get VinculoNFT Contract Instance
 * @param wallet - Wallet to use for signing transactions
 */
export const getContract = async (wallet: ethers.Wallet): Promise<Contract> => {
  const contractAddress = await getContractAddress();

  if (!contractAddress) {
    throw new Error('Smart Contract address not configured');
  }

  const contract = new ethers.Contract(contractAddress, VINCULO_NFT_ABI, wallet);

  return contract;
};

/**
 * Get Admin Wallet Balance (for gas monitoring)
 */
export const getAdminBalance = async (): Promise<{
  address: string;
  balancePOL: string;
  balanceWei: string;
}> => {
  const wallet = getAdminWallet();
  const balance = await wallet.provider!.getBalance(wallet.address);

  return {
    address: wallet.address,
    balancePOL: ethers.formatEther(balance),
    balanceWei: balance.toString(),
  };
};

/**
 * Estimate Gas for Minting
 */
export const estimateMintGas = async (
  toAddress: string,
  tokenUri: string
): Promise<{
  gasLimit: bigint;
  gasPricePOL: string;
  estimatedCostPOL: string;
}> => {
  const wallet = getAdminWallet();
  const contract = await getContract(wallet);

  const gasEstimate = await contract.safeMint.estimateGas(toAddress, tokenUri);
  const feeData = await wallet.provider!.getFeeData();
  const gasPrice = feeData.gasPrice || 0n;

  const estimatedCost = gasEstimate * gasPrice;

  return {
    gasLimit: gasEstimate,
    gasPricePOL: ethers.formatUnits(gasPrice, 'gwei'),
    estimatedCostPOL: ethers.formatEther(estimatedCost),
  };
};

/**
 * Mint NFT (Custodial)
 * The Admin wallet pays gas and mints to itself (custody)
 */
export const mintNFT = async (
  tokenUri: string
): Promise<{
  tokenId: string;
  transactionHash: string;
  blockNumber: number;
  from: string;
  to: string;
}> => {
  const wallet = getAdminWallet();
  const contract = await getContract(wallet);

  logger.info(`Minting NFT to custodial wallet: ${wallet.address}`);
  logger.info(`Token URI: ${tokenUri}`);

  // Mint to admin wallet (custodial model)
  const tx = await contract.safeMint(wallet.address, tokenUri);

  logger.info(`Transaction sent: ${tx.hash}`);
  logger.info('Waiting for confirmation...');

  // Wait for 2 block confirmations
  const receipt = await tx.wait(2);

  // Extract tokenId from Transfer event
  let tokenId = '0';
  for (const log of receipt.logs) {
    try {
      const parsed = contract.interface.parseLog({
        topics: log.topics as string[],
        data: log.data,
      });
      if (parsed && parsed.name === 'Transfer') {
        tokenId = parsed.args.tokenId.toString();
        break;
      }
    } catch {
      // Not a Transfer event, continue
    }
  }

  logger.info(`NFT minted successfully! Token ID: ${tokenId}, Block: ${receipt.blockNumber}`);

  return {
    tokenId,
    transactionHash: receipt.hash,
    blockNumber: receipt.blockNumber,
    from: receipt.from,
    to: wallet.address,
  };
};

/**
 * Get Contract Address (for frontend)
 */
export const getSmartContractAddress = async (): Promise<string> => {
  return await getContractAddress();
};

/**
 * Check if blockchain is configured and accessible
 */
export const checkBlockchainHealth = async (): Promise<{
  configured: boolean;
  connected: boolean;
  adminAddress?: string;
  contractAddress?: string;
  balance?: string;
  error?: string;
}> => {
  try {
    if (!PRIVATE_KEY) {
      return { configured: false, connected: false, error: 'ADMIN_PRIVATE_KEY not set' };
    }

    const wallet = getAdminWallet();
    const contractAddress = await getContractAddress();
    const balance = await wallet.provider!.getBalance(wallet.address);

    return {
      configured: true,
      connected: true,
      adminAddress: wallet.address,
      contractAddress,
      balance: ethers.formatEther(balance),
    };
  } catch (error) {
    return {
      configured: false,
      connected: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
};
