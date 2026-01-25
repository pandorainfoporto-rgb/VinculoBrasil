import { ethers, type Contract } from 'ethers';
/**
 * Get JSON RPC Provider for Polygon
 */
export declare const getProvider: () => ethers.JsonRpcProvider;
/**
 * Get Admin Wallet (Custodian)
 * This wallet pays gas and signs all NFT mint transactions
 */
export declare const getAdminWallet: () => ethers.Wallet;
/**
 * Get VinculoNFT Contract Instance
 * @param wallet - Wallet to use for signing transactions
 */
export declare const getContract: (wallet: ethers.Wallet) => Promise<Contract>;
/**
 * Get Admin Wallet Balance (for gas monitoring)
 */
export declare const getAdminBalance: () => Promise<{
    address: string;
    balancePOL: string;
    balanceWei: string;
}>;
/**
 * Estimate Gas for Minting
 */
export declare const estimateMintGas: (toAddress: string, tokenUri: string) => Promise<{
    gasLimit: bigint;
    gasPricePOL: string;
    estimatedCostPOL: string;
}>;
/**
 * Mint NFT (Custodial)
 * The Admin wallet pays gas and mints to itself (custody)
 */
export declare const mintNFT: (tokenUri: string) => Promise<{
    tokenId: string;
    transactionHash: string;
    blockNumber: number;
    from: string;
    to: string;
}>;
/**
 * Get Contract Address (for frontend)
 */
export declare const getSmartContractAddress: () => Promise<string>;
/**
 * Check if blockchain is configured and accessible
 */
export declare const checkBlockchainHealth: () => Promise<{
    configured: boolean;
    connected: boolean;
    adminAddress?: string;
    contractAddress?: string;
    balance?: string;
    error?: string;
}>;
//# sourceMappingURL=web3.d.ts.map