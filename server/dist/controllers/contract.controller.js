// ============================================
// CONTRACT CONTROLLER - Server-Side NFT Minting
// Custodial Model: Vinculo is the NFT Custodian
// ============================================
import { prisma } from '../lib/prisma.js';
import { pinataService } from '../lib/pinata-service.js';
import { getAdminWallet, getContract, checkBlockchainHealth, getSmartContractAddress } from '../lib/web3.js';
import { logger } from '../lib/logger.js';
import { AppError } from '../middleware/error-handler.js';
// ============================================
// 1. MINT CONTRACT (Custodial NFT)
// ============================================
/**
 * POST /api/contracts/mint
 *
 * Creates a Smart Contract NFT on Polygon blockchain.
 * The admin wallet pays the gas (custodial model).
 * The NFT represents the rental agreement with inspection hash.
 *
 * Body:
 * - propertyId: string (required)
 * - rentValue: number (required)
 * - inspectionHash: string (optional, from AI inspection)
 * - startDate: string (optional, ISO date)
 * - endDate: string (optional, ISO date)
 */
export const mintContract = async (req, res, next) => {
    try {
        const { propertyId, rentValue, inspectionHash, startDate, endDate } = req.body;
        // Get tenant from authenticated user
        const tenantId = req.user?.id;
        if (!tenantId) {
            throw new AppError(401, 'User not authenticated');
        }
        // 1. Validate Property exists
        logger.info(`Starting contract mint: propertyId=${propertyId}, tenantId=${tenantId}`);
        const property = await prisma.property.findUnique({
            where: { id: propertyId },
            include: {
                owner: { select: { id: true, name: true } },
                agency: { select: { id: true, name: true } },
                images: { take: 1, orderBy: { order: 'asc' } },
            },
        });
        if (!property) {
            throw new AppError(404, 'Property not found');
        }
        if (property.status !== 'AVAILABLE') {
            throw new AppError(400, 'Property is not available for rent');
        }
        // 2. Build NFT Metadata (OpenSea-compatible)
        const coverImage = property.images[0]?.url || 'https://vinculobrasil.com.br/placeholder.png';
        const propertyAddress = `${property.street}, ${property.number} - ${property.neighborhood}, ${property.city}/${property.state}`;
        const contractStartDate = startDate || new Date().toISOString().split('T')[0];
        const contractEndDate = endDate || new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        const metadata = {
            name: `Vinculo Rental Contract - ${property.title}`,
            description: `Digital Rental Contract for property "${property.title}" at ${propertyAddress}. This NFT represents a legally binding rental agreement under Brazilian law (MP 2.200-2/2001).`,
            image: coverImage,
            external_url: `https://vinculobrasil.com.br/contracts/${propertyId}`,
            attributes: [
                { trait_type: 'Property', value: property.title },
                { trait_type: 'Address', value: propertyAddress },
                { trait_type: 'Monthly Rent', value: rentValue, display_type: 'number' },
                { trait_type: 'Start Date', value: contractStartDate },
                { trait_type: 'End Date', value: contractEndDate },
                { trait_type: 'Status', value: 'Active' },
                { trait_type: 'Owner', value: property.owner?.name || 'Unknown' },
                { trait_type: 'Agency', value: property.agency?.name || 'Direct' },
                {
                    trait_type: 'Inspection Hash',
                    value: inspectionHash || 'pending-inspection'
                },
                { trait_type: 'Contract Type', value: 'RENTAL' },
                { trait_type: 'Minted At', value: new Date().toISOString() },
            ],
            properties: {
                tenantId,
                propertyId,
                inspectionHash: inspectionHash || 'pending',
                rentValue: Number(rentValue),
                startDate: contractStartDate,
                agencyId: property.agencyId || undefined,
                contractType: 'RENTAL',
            },
        };
        logger.info('NFT Metadata built, uploading to IPFS...');
        // 3. Upload Metadata to IPFS (Pinata)
        const metadataName = `vinculo-contract-${tenantId}-${Date.now()}.json`;
        const ipfsHash = await pinataService.uploadJSON(metadata, metadataName);
        const tokenUri = `ipfs://${ipfsHash}`;
        const ipfsUrl = pinataService.getPublicUrl(ipfsHash);
        logger.info(`Metadata uploaded to IPFS: ${ipfsHash}`);
        // 4. Mint NFT on Polygon (Admin pays gas)
        logger.info('Minting NFT on Polygon blockchain...');
        const wallet = getAdminWallet();
        const contract = await getContract(wallet);
        // safeMint(to, uri) -> Mint to admin wallet (Custodial)
        const tx = await contract.safeMint(wallet.address, tokenUri);
        logger.info(`Transaction sent: ${tx.hash}`);
        logger.info('Waiting for blockchain confirmation...');
        // Wait for confirmation
        const receipt = await tx.wait(2);
        // Extract tokenId from Transfer event
        let tokenId = '0';
        for (const log of receipt.logs) {
            try {
                const parsed = contract.interface.parseLog({
                    topics: log.topics,
                    data: log.data,
                });
                if (parsed && parsed.name === 'Transfer') {
                    tokenId = parsed.args.tokenId.toString();
                    break;
                }
            }
            catch {
                // Not a Transfer event
            }
        }
        logger.info(`NFT minted! Token ID: ${tokenId}, Block: ${receipt.blockNumber}`);
        // 5. Save to Database (Off-chain mirror)
        const contractAddress = await getSmartContractAddress();
        // Create RentContract
        const rentContract = await prisma.rentContract.create({
            data: {
                propertyId,
                tenantName: req.user?.name || 'Tenant',
                tenantCpf: req.user?.cpf || '',
                tenantEmail: req.user?.email || '',
                tenantPhone: req.user?.phone || '',
                startDate: new Date(contractStartDate),
                endDate: new Date(contractEndDate),
                rentValue: Number(rentValue),
                dueDay: 5,
                status: 'ACTIVE',
            },
        });
        // Create NFT record
        await prisma.propertyNFT.create({
            data: {
                contractId: rentContract.id,
                tokenId: parseInt(tokenId) || 0,
                contractAddress,
                metadataUri: tokenUri,
                ipfsHash,
                transactionHash: receipt.hash,
                mintedAt: new Date(),
                status: 'MINTED',
            },
        });
        // Update property status to RENTED
        await prisma.property.update({
            where: { id: propertyId },
            data: { status: 'RENTED' },
        });
        logger.info(`Contract saved to database: ${rentContract.id}`);
        // 6. Return success response
        const networkId = process.env.POLYGON_RPC_URL?.includes('amoy') ? 'amoy' : 'polygon';
        const explorerBaseUrl = networkId === 'amoy'
            ? 'https://amoy.polygonscan.com'
            : 'https://polygonscan.com';
        return res.status(201).json({
            success: true,
            contractId: rentContract.id,
            nft: {
                tokenId,
                contractAddress,
                tokenUri,
                ipfsUrl,
                transactionHash: receipt.hash,
                blockNumber: receipt.blockNumber,
            },
            explorerUrl: `${explorerBaseUrl}/tx/${receipt.hash}`,
            openseaUrl: networkId === 'amoy'
                ? `https://testnets.opensea.io/assets/amoy/${contractAddress}/${tokenId}`
                : `https://opensea.io/assets/matic/${contractAddress}/${tokenId}`,
        });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error(`Contract mint failed: ${errorMessage}`);
        // Check for specific errors
        if (errorMessage.includes('insufficient funds')) {
            return res.status(503).json({
                success: false,
                error: 'Admin wallet has insufficient POL for gas fees.',
                details: 'Contact system administrator to fund the wallet.',
            });
        }
        if (errorMessage.includes('not configured')) {
            return res.status(503).json({
                success: false,
                error: 'Blockchain not configured',
                details: errorMessage,
            });
        }
        next(error);
    }
};
// ============================================
// 2. CHECK BLOCKCHAIN STATUS
// ============================================
/**
 * GET /api/contracts/blockchain-status
 *
 * Returns blockchain configuration and connection status.
 */
export const getBlockchainStatus = async (_req, res) => {
    const health = await checkBlockchainHealth();
    return res.json({
        blockchain: {
            configured: health.configured,
            connected: health.connected,
            network: process.env.POLYGON_RPC_URL?.includes('amoy') ? 'Polygon Amoy (Testnet)' : 'Polygon Mainnet',
        },
        adminWallet: {
            address: health.adminAddress,
            balancePOL: health.balance,
        },
        smartContract: {
            address: health.contractAddress,
        },
        error: health.error,
    });
};
// ============================================
// 3. GET CONTRACT NFT DETAILS
// ============================================
/**
 * GET /api/contracts/:id/nft
 *
 * Returns NFT details for a specific contract.
 */
export const getContractNFT = async (req, res, next) => {
    try {
        const { id } = req.params;
        const contract = await prisma.rentContract.findUnique({
            where: { id },
            include: {
                nft: true,
                property: {
                    select: {
                        id: true,
                        title: true,
                        street: true,
                        city: true,
                    },
                },
            },
        });
        if (!contract) {
            throw new AppError(404, 'Contract not found');
        }
        if (!contract.nft) {
            return res.json({
                hasNFT: false,
                message: 'This contract does not have an associated NFT yet.',
            });
        }
        const networkId = process.env.POLYGON_RPC_URL?.includes('amoy') ? 'amoy' : 'polygon';
        const explorerBaseUrl = networkId === 'amoy'
            ? 'https://amoy.polygonscan.com'
            : 'https://polygonscan.com';
        return res.json({
            hasNFT: true,
            nft: {
                tokenId: contract.nft.tokenId,
                contractAddress: contract.nft.contractAddress,
                metadataUri: contract.nft.metadataUri,
                ipfsUrl: contract.nft.ipfsHash
                    ? `https://gateway.pinata.cloud/ipfs/${contract.nft.ipfsHash}`
                    : null,
                transactionHash: contract.nft.transactionHash,
                mintedAt: contract.nft.mintedAt,
                status: contract.nft.status,
            },
            links: {
                explorer: `${explorerBaseUrl}/tx/${contract.nft.transactionHash}`,
                opensea: networkId === 'amoy'
                    ? `https://testnets.opensea.io/assets/amoy/${contract.nft.contractAddress}/${contract.nft.tokenId}`
                    : `https://opensea.io/assets/matic/${contract.nft.contractAddress}/${contract.nft.tokenId}`,
            },
            property: contract.property,
        });
    }
    catch (error) {
        next(error);
    }
};
// ============================================
// 4. ESTIMATE MINT COST
// ============================================
/**
 * GET /api/contracts/estimate-mint
 *
 * Estimates the gas cost for minting a contract NFT.
 */
export const estimateMintCost = async (_req, res, next) => {
    try {
        const wallet = getAdminWallet();
        const contract = await getContract(wallet);
        // Estimate gas for a sample mint
        const gasEstimate = await contract.safeMint.estimateGas(wallet.address, 'ipfs://QmDummy...');
        const feeData = await wallet.provider.getFeeData();
        const gasPrice = feeData.gasPrice || 0n;
        const estimatedCostWei = gasEstimate * gasPrice;
        const { ethers } = await import('ethers');
        return res.json({
            gasLimit: gasEstimate.toString(),
            gasPrice: ethers.formatUnits(gasPrice, 'gwei') + ' gwei',
            estimatedCostPOL: ethers.formatEther(estimatedCostWei),
            network: process.env.POLYGON_RPC_URL?.includes('amoy') ? 'testnet' : 'mainnet',
        });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        if (errorMessage.includes('not configured')) {
            return res.status(503).json({
                error: 'Blockchain not configured',
                details: errorMessage,
            });
        }
        next(error);
    }
};
//# sourceMappingURL=contract.controller.js.map