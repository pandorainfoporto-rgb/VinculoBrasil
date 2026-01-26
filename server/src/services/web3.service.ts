import { prisma } from '../lib/prisma.js';
import { notificationService } from './notification.service.js';
import crypto from 'crypto';

// Check if we're in mock mode (no blockchain RPC configured)
const MOCK_MODE = !process.env.BLOCKCHAIN_RPC_URL;

export const web3Service = {
    /**
     * Mint a lease as an NFT on blockchain (or mock)
     */
    mintLeaseToken: async (leaseId: string, ownerWallet?: string) => {
        const lease = await prisma.lease.findUnique({
            where: { id: leaseId },
            include: { property: true, owner: true }
        });

        if (!lease) throw new Error('Lease not found');
        if (lease.onChainStatus === 'MINTED') {
            throw new Error('Lease already minted');
        }

        // Update lease to MINTING status
        await prisma.lease.update({
            where: { id: leaseId },
            data: { onChainStatus: 'MINTING' }
        });

        try {
            let txHash: string;
            let contractAddress: string;
            let tokenId: string;

            if (MOCK_MODE) {
                // MOCK MODE: Generate fake blockchain data
                txHash = `0xMOCK${crypto.randomBytes(32).toString('hex')}`;
                contractAddress = `0xMOCK${crypto.randomBytes(20).toString('hex')}`;
                tokenId = Math.floor(Math.random() * 1000000).toString();

                console.log('🔶 MOCK MODE: Simulating blockchain transaction');
            } else {
                // REAL MODE: Call actual smart contract
                // TODO: Implement real blockchain interaction
                throw new Error('Real blockchain mode not implemented yet');
            }

            // Update lease with blockchain data
            await prisma.lease.update({
                where: { id: leaseId },
                data: {
                    onChainStatus: 'MINTED',
                    smartContractAddress: contractAddress,
                    tokenId: tokenId,
                }
            });

            // Notify owner about successful tokenization
            await notificationService.notify(
                lease.ownerId,
                '🔐 Contrato Tokenizado!',
                `Seu contrato foi registrado na blockchain Polygon. Token ID: #${tokenId}`,
                'SUCCESS'
            );

            return {
                success: true,
                txHash,
                contractAddress,
                tokenId,
                mockMode: MOCK_MODE,
                explorerUrl: MOCK_MODE
                    ? `https://polygonscan.com/tx/${txHash}`
                    : `https://polygonscan.com/tx/${txHash}`
            };
        } catch (error) {
            // Revert to NOT_MINTED on error
            await prisma.lease.update({
                where: { id: leaseId },
                data: { onChainStatus: 'NOT_MINTED' }
            });
            throw error;
        }
    },

    /**
     * Get blockchain status for a lease
     */
    getLeaseBlockchainStatus: async (leaseId: string) => {
        const lease = await prisma.lease.findUnique({
            where: { id: leaseId }
        });

        if (!lease) throw new Error('Lease not found');

        return {
            onChainStatus: lease.onChainStatus,
            smartContractAddress: lease.smartContractAddress,
            tokenId: lease.tokenId,
            mockMode: MOCK_MODE
        };
    },

    /**
     * Get explorer URL for a transaction
     */
    getExplorerUrl: (txHash: string) => {
        const isMock = txHash.startsWith('0xMOCK');
        return {
            url: `https://polygonscan.com/tx/${txHash}`,
            mockMode: isMock
        };
    }
};
