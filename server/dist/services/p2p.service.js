// ============================================
// P2P MARKETPLACE SERVICE
// Cessão de Crédito Digital (Sem CVM)
// Art. 286-298 do Código Civil Brasileiro
// ============================================
//
// CONCEITO JURÍDICO:
// - Não é valor mobiliário (não prometemos juros)
// - É troca de ativos P2P (compra de direito creditório)
// - Deságio = lucro na compra de ativo, não "rentabilidade"
//
// FLUXO:
// 1. Proprietário tokeniza seus recebíveis futuros
// 2. Investidor compra os tokens com deságio
// 3. Sistema atualiza Split do Asaas para redirecionar pagamentos
// 4. Inquilino paga normalmente, dinheiro vai direto pro investidor
//
// ============================================
import { ethers } from 'ethers';
import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';
// ============================================
// IMPORT ABIs FROM CENTRALIZED FILE
// ============================================
import { RECEIVABLES_ABI, P2P_MARKETPLACE_ABI, } from '../lib/abis.js';
// ============================================
// DYNAMIC CONFIG SERVICE
// ============================================
import { getBlockchainConfig } from './config.service.js';
// ============================================
// CONFIGURATION CACHE (lazy loaded from DB)
// ============================================
let cachedConfig = null;
const ADMIN_PRIVATE_KEY = process.env.ADMIN_PRIVATE_KEY || '';
/**
 * Load blockchain configuration from database
 */
const loadBlockchainConfig = async () => {
    if (cachedConfig)
        return cachedConfig;
    try {
        const blockchainConfig = await getBlockchainConfig();
        cachedConfig = {
            rpcUrl: blockchainConfig.rpcUrl,
            receivablesContract: blockchainConfig.receivablesContract,
            p2pContract: blockchainConfig.p2pContract,
        };
        logger.info('[P2P] Configuração blockchain carregada do banco de dados');
    }
    catch (error) {
        // Fallback to environment variables
        logger.warn('[P2P] Usando fallback de variáveis de ambiente');
        cachedConfig = {
            rpcUrl: process.env.POLYGON_RPC_URL || 'https://polygon-rpc.com',
            receivablesContract: process.env.RECEIVABLES_CONTRACT_ADDRESS || '',
            p2pContract: process.env.P2P_MARKETPLACE_CONTRACT_ADDRESS || '',
        };
    }
    return cachedConfig;
};
/**
 * Clear configuration cache (call when config is updated)
 */
export const clearP2PConfigCache = () => {
    cachedConfig = null;
    logger.info('[P2P] Cache de configuração limpo');
};
// ============================================
// BLOCKCHAIN HELPERS
// ============================================
/**
 * Get Polygon provider (async to load config from DB)
 */
const getProvider = async () => {
    const cfg = await loadBlockchainConfig();
    return new ethers.JsonRpcProvider(cfg.rpcUrl);
};
/**
 * Get admin wallet for transactions
 */
const getAdminWallet = async () => {
    if (!ADMIN_PRIVATE_KEY) {
        throw new Error('ADMIN_PRIVATE_KEY não configurado');
    }
    const provider = await getProvider();
    return new ethers.Wallet(ADMIN_PRIVATE_KEY, provider);
};
/**
 * Get Receivables contract instance
 */
const getReceivablesContract = async (signer) => {
    const cfg = await loadBlockchainConfig();
    if (!cfg.receivablesContract) {
        throw new Error('RECEIVABLES_CONTRACT_ADDRESS não configurado');
    }
    const provider = signer || await getProvider();
    return new ethers.Contract(cfg.receivablesContract, RECEIVABLES_ABI, provider);
};
/**
 * Get P2P Marketplace contract instance
 */
const getP2PContract = async (signer) => {
    const cfg = await loadBlockchainConfig();
    if (!cfg.p2pContract) {
        throw new Error('P2P_MARKETPLACE_CONTRACT_ADDRESS não configurado');
    }
    const provider = signer || await getProvider();
    return new ethers.Contract(cfg.p2pContract, P2P_MARKETPLACE_ABI, provider);
};
/**
 * Tokeniza os recebíveis de um contrato de aluguel
 * Cria um ERC-1155 representando os próximos X meses de pagamento
 */
export const tokenizeReceivables = async (input) => {
    try {
        logger.info(`[P2P] Tokenizando recebíveis do contrato ${input.contractId}`);
        // 1. Buscar contrato no banco
        const contract = await prisma.rentContract.findUnique({
            where: { id: input.contractId },
            include: {
                property: true,
                nft: true,
            },
        });
        if (!contract) {
            throw new Error('Contrato não encontrado');
        }
        if (contract.status !== 'ACTIVE') {
            throw new Error('Contrato não está ativo');
        }
        // 2. Calcular período dos recebíveis
        const monthlyValue = Number(contract.rentValue);
        const startTimestamp = Math.floor(input.startMonth.getTime() / 1000);
        const endDate = new Date(input.startMonth);
        endDate.setMonth(endDate.getMonth() + input.totalMonths);
        const endTimestamp = Math.floor(endDate.getTime() / 1000);
        // 3. Preparar metadados
        const metadata = input.metadataUri || `ipfs://pending/${input.contractId}`;
        // 4. Mintar token de recebíveis
        const wallet = await getAdminWallet();
        const receivablesContract = await getReceivablesContract(wallet);
        // Valor mensal em wei (considerando 18 decimais para BRL tokenizado)
        const monthlyValueWei = ethers.parseEther(monthlyValue.toString());
        const tx = await receivablesContract.mintReceivable(input.sellerWallet, input.contractId, input.totalMonths, monthlyValueWei, startTimestamp, endTimestamp, metadata);
        const receipt = await tx.wait();
        // Extrair tokenId do evento
        const mintEvent = receipt.logs.find((log) => {
            try {
                const parsed = receivablesContract.interface.parseLog({
                    topics: log.topics,
                    data: log.data,
                });
                return parsed?.name === 'ReceivableMinted';
            }
            catch {
                return false;
            }
        });
        let tokenId = '0';
        if (mintEvent) {
            const parsed = receivablesContract.interface.parseLog({
                topics: mintEvent.topics,
                data: mintEvent.data,
            });
            tokenId = parsed?.args?.tokenId?.toString() || '0';
        }
        logger.info(`[P2P] Recebíveis tokenizados: Token #${tokenId}, TX: ${tx.hash}`);
        return {
            success: true,
            tokenId,
            txHash: tx.hash,
        };
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error(`[P2P] Erro ao tokenizar recebíveis: ${errorMessage}`);
        return {
            success: false,
            error: errorMessage,
        };
    }
};
/**
 * Cria uma oferta no marketplace P2P
 * O proprietário define o preço (com deságio) para vender seus recebíveis
 */
export const createP2PListing = async (input) => {
    try {
        logger.info(`[P2P] Criando oferta para contrato ${input.contractId}`);
        // 1. Buscar contrato e verificar se já foi tokenizado
        const contract = await prisma.rentContract.findUnique({
            where: { id: input.contractId },
            include: {
                property: true,
                guarantors: true,
            },
        });
        if (!contract) {
            throw new Error('Contrato não encontrado');
        }
        // 2. Calcular valores
        const monthlyValue = Number(contract.rentValue);
        const monthsRemaining = Math.ceil((new Date(contract.endDate).getTime() - Date.now()) / (30 * 24 * 60 * 60 * 1000));
        const faceValue = monthlyValue * monthsRemaining;
        const discountPercent = ((faceValue - input.askingPrice) / faceValue) * 100;
        // 3. Carregar configuração blockchain
        const blockchainCfg = await loadBlockchainConfig();
        // 4. Criar registro no banco
        const dbListing = await prisma.p2PListing.create({
            data: {
                contractId: input.contractId,
                receivableTokenId: '0', // Será atualizado após mint
                receivableContract: blockchainCfg.receivablesContract,
                sellerId: input.sellerId,
                sellerWallet: input.sellerWallet,
                totalMonths: monthsRemaining,
                monthlyValue: monthlyValue,
                faceValue: faceValue,
                askingPrice: input.askingPrice,
                discountPercent: discountPercent,
                startMonth: new Date(),
                endMonth: contract.endDate,
                tenantScore: 85, // TODO: Calcular score real
                contractGuarantee: contract.guarantors.length > 0 ? 'GUARANTEED' : 'NONE',
                priceNative: input.priceInMatic ? BigInt(Math.floor(input.priceInMatic * 1e18)).toString() : null,
                priceStable: input.priceInStable || null,
                status: 'PENDING',
            },
        });
        // 5. Tokenizar recebíveis (se ainda não tokenizado)
        const tokenResult = await tokenizeReceivables({
            contractId: input.contractId,
            sellerId: input.sellerId,
            sellerWallet: input.sellerWallet,
            totalMonths: monthsRemaining,
            startMonth: new Date(),
        });
        if (!tokenResult.success) {
            await prisma.p2PListing.update({
                where: { id: dbListing.id },
                data: {
                    status: 'CANCELLED',
                    notes: `Erro ao tokenizar: ${tokenResult.error}`,
                },
            });
            throw new Error(`Erro ao tokenizar: ${tokenResult.error}`);
        }
        // 6. Criar oferta no smart contract
        const wallet = await getAdminWallet();
        const p2pContract = await getP2PContract(wallet);
        const priceNativeWei = input.priceInMatic
            ? ethers.parseEther(input.priceInMatic.toString())
            : 0n;
        const priceStableWei = input.priceInStable
            ? BigInt(Math.floor(input.priceInStable * 1e6)) // USDT/USDC tem 6 decimais
            : 0n;
        // Primeiro, aprovar o marketplace para transferir o token
        const cfg = await loadBlockchainConfig();
        const receivablesContract = await getReceivablesContract(wallet);
        const isApproved = await receivablesContract.isApprovedForAll(input.sellerWallet, cfg.p2pContract);
        if (!isApproved) {
            logger.info('[P2P] Aprovando marketplace para transferir tokens...');
            // Nota: O proprietário precisa fazer isso manualmente ou via meta-transaction
        }
        const tx = await p2pContract.createListing(cfg.receivablesContract, tokenResult.tokenId, 1, // Quantidade sempre 1
        priceNativeWei, priceStableWei, input.contractId);
        const receipt = await tx.wait();
        // Extrair listingId do evento
        const listingEvent = receipt.logs.find((log) => {
            try {
                const parsed = p2pContract.interface.parseLog({
                    topics: log.topics,
                    data: log.data,
                });
                return parsed?.name === 'ListingCreated';
            }
            catch {
                return false;
            }
        });
        let onChainListingId = '0';
        if (listingEvent) {
            const parsed = p2pContract.interface.parseLog({
                topics: listingEvent.topics,
                data: listingEvent.data,
            });
            onChainListingId = parsed?.args?.listingId?.toString() || '0';
        }
        // 7. Atualizar registro no banco
        await prisma.p2PListing.update({
            where: { id: dbListing.id },
            data: {
                receivableTokenId: tokenResult.tokenId || '0',
                listingIdOnChain: onChainListingId,
                escrowTxHash: tx.hash,
                status: 'ACTIVE',
            },
        });
        logger.info(`[P2P] Oferta criada: DB #${dbListing.id}, Chain #${onChainListingId}`);
        return {
            success: true,
            listingId: onChainListingId,
            dbListingId: dbListing.id,
            txHash: tx.hash,
        };
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error(`[P2P] Erro ao criar oferta: ${errorMessage}`);
        return {
            success: false,
            error: errorMessage,
        };
    }
};
/**
 * Handler chamado quando uma venda P2P é detectada na blockchain
 * Atualiza o Split do Asaas para redirecionar pagamentos ao novo dono
 */
export const handleP2PSale = async (listingId, buyerWallet, txHash) => {
    try {
        logger.info(`[P2P] Processando venda: Listing #${listingId}, Buyer: ${buyerWallet}`);
        // 1. Buscar oferta no banco
        const listing = await prisma.p2PListing.findFirst({
            where: { listingIdOnChain: listingId },
            include: {
                contract: {
                    include: {
                        property: true,
                    },
                },
            },
        });
        if (!listing) {
            logger.warn(`[P2P] Oferta #${listingId} não encontrada no banco`);
            return;
        }
        // 2. Buscar investidor pelo endereço da carteira
        const investor = await prisma.investor.findFirst({
            where: { primaryWallet: buyerWallet.toLowerCase() },
        });
        // 3. Atualizar oferta como vendida
        await prisma.p2PListing.update({
            where: { id: listing.id },
            data: {
                status: 'SOLD',
                buyerId: investor?.userId || null,
                buyerWallet: buyerWallet,
                soldPrice: listing.askingPrice,
                soldAt: new Date(),
                saleTxHash: txHash,
            },
        });
        // 4. Criar regra de split para redirecionar pagamentos ao investidor
        await prisma.contractSplitRule.create({
            data: {
                contractId: listing.contractId,
                recipientId: investor?.userId || buyerWallet,
                recipientType: 'INVESTOR',
                recipientWalletId: investor?.asaasWalletId || null,
                recipientPixKey: null, // TODO: Buscar PIX do investidor
                startDate: new Date(),
                endDate: listing.endMonth,
                sharePercent: 0.85, // O investidor recebe a parte do proprietário
                sourceType: 'P2P_SALE',
                sourceId: listing.id,
                isActive: true,
            },
        });
        // 5. Registrar transação P2P
        await prisma.p2PTransaction.create({
            data: {
                listingId: listing.id,
                sellerId: listing.sellerId,
                buyerId: investor?.userId || buyerWallet,
                amount: listing.askingPrice,
                platformFee: listing.platformFee || 0,
                netToSeller: Number(listing.askingPrice) - Number(listing.platformFee || 0),
                paymentMethod: 'NATIVE', // ou detectar do evento
                txHash: txHash,
                status: 'CONFIRMED',
                confirmedAt: new Date(),
            },
        });
        // 6. Atualizar estatísticas do investidor
        if (investor) {
            await prisma.investor.update({
                where: { id: investor.id },
                data: {
                    totalPurchases: { increment: 1 },
                    totalInvested: { increment: Number(listing.askingPrice) },
                },
            });
        }
        logger.info(`[P2P] ✅ Venda processada! Contrato #${listing.contractId} cedido para ${buyerWallet}`);
        logger.info(`[P2P] 💰 A partir de agora, os aluguéis serão redirecionados ao investidor`);
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error(`[P2P] Erro ao processar venda: ${errorMessage}`);
        throw error;
    }
};
/**
 * Busca ofertas ativas no marketplace
 */
export const getActiveListings = async (filters) => {
    try {
        const listings = await prisma.p2PListing.findMany({
            where: {
                status: 'ACTIVE',
                discountPercent: {
                    gte: filters?.minDiscount || 0,
                    lte: filters?.maxDiscount || 100,
                },
                tenantScore: filters?.minTenantScore
                    ? { gte: filters.minTenantScore }
                    : undefined,
            },
            include: {
                contract: {
                    include: {
                        property: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        return listings
            .filter((listing) => {
            if (filters?.city) {
                return listing.contract.property.city.toLowerCase().includes(filters.city.toLowerCase());
            }
            return true;
        })
            .map((listing) => ({
            id: listing.id,
            contractId: listing.contractId,
            faceValue: Number(listing.faceValue),
            askingPrice: Number(listing.askingPrice),
            discountPercent: Number(listing.discountPercent),
            tenantScore: listing.tenantScore,
            monthsRemaining: listing.totalMonths,
            monthlyValue: Number(listing.monthlyValue),
            city: listing.contract.property.city,
            state: listing.contract.property.state,
        }));
    }
    catch (error) {
        logger.error(`[P2P] Erro ao buscar ofertas: ${error instanceof Error ? error.message : String(error)}`);
        return [];
    }
};
/**
 * Retorna estatísticas do marketplace
 */
export const getMarketplaceStats = async () => {
    try {
        const [totalListings, activeListings, soldListings] = await Promise.all([
            prisma.p2PListing.count(),
            prisma.p2PListing.count({ where: { status: 'ACTIVE' } }),
            prisma.p2PListing.findMany({
                where: { status: 'SOLD' },
                select: {
                    soldPrice: true,
                    discountPercent: true,
                },
            }),
        ]);
        const totalVolume = soldListings.reduce((sum, l) => sum + Number(l.soldPrice || 0), 0);
        const averageDiscount = soldListings.length > 0
            ? soldListings.reduce((sum, l) => sum + Number(l.discountPercent), 0) / soldListings.length
            : 0;
        return {
            totalListings,
            activeListings,
            totalSales: soldListings.length,
            totalVolume,
            averageDiscount,
        };
    }
    catch (error) {
        logger.error(`[P2P] Erro ao buscar estatísticas: ${error instanceof Error ? error.message : String(error)}`);
        return {
            totalListings: 0,
            activeListings: 0,
            totalSales: 0,
            totalVolume: 0,
            averageDiscount: 0,
        };
    }
};
/**
 * Escuta eventos do smart contract P2P
 * Deve ser chamado na inicialização do servidor
 */
export const startP2PEventListener = async () => {
    try {
        const cfg = await loadBlockchainConfig();
        if (!cfg.p2pContract) {
            logger.warn('[P2P] P2P_CONTRACT_ADDRESS não configurado. Event listener desativado.');
            return;
        }
        const provider = await getProvider();
        const p2pContract = await getP2PContract(provider);
        // Escutar evento Sale
        p2pContract.on('Sale', async (listingId, seller, buyer, price, paymentMethod, platformFee, event) => {
            logger.info(`[P2P] 🎉 Evento Sale detectado: Listing #${listingId}`);
            try {
                await handleP2PSale(listingId.toString(), buyer, event.log.transactionHash);
            }
            catch (error) {
                logger.error(`[P2P] Erro ao processar evento Sale: ${error instanceof Error ? error.message : String(error)}`);
            }
        });
        logger.info('[P2P] ✅ Event listener iniciado para VinculoP2P');
    }
    catch (error) {
        logger.error(`[P2P] Erro ao iniciar event listener: ${error instanceof Error ? error.message : String(error)}`);
    }
};
/**
 * Cancela uma oferta no marketplace
 */
export const cancelListing = async (listingId, sellerId) => {
    try {
        // 1. Verificar se a oferta pertence ao vendedor
        const listing = await prisma.p2PListing.findFirst({
            where: {
                id: listingId,
                sellerId: sellerId,
                status: 'ACTIVE',
            },
        });
        if (!listing) {
            return { success: false, error: 'Oferta não encontrada ou não pertence a você' };
        }
        // 2. Cancelar no smart contract
        if (listing.listingIdOnChain) {
            const wallet = await getAdminWallet();
            const p2pContract = await getP2PContract(wallet);
            const tx = await p2pContract.cancelListing(listing.listingIdOnChain);
            await tx.wait();
        }
        // 3. Atualizar no banco
        await prisma.p2PListing.update({
            where: { id: listingId },
            data: {
                status: 'CANCELLED',
            },
        });
        logger.info(`[P2P] Oferta #${listingId} cancelada`);
        return { success: true };
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error(`[P2P] Erro ao cancelar oferta: ${errorMessage}`);
        return { success: false, error: errorMessage };
    }
};
export default {
    tokenizeReceivables,
    createP2PListing,
    handleP2PSale,
    getActiveListings,
    getMarketplaceStats,
    startP2PEventListener,
    cancelListing,
    clearP2PConfigCache,
};
//# sourceMappingURL=p2p.service.js.map