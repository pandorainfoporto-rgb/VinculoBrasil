// ============================================
// SETTLEMENT SERVICE - Liquidação Pix -> Blockchain
// Quando o Pix cai, transfere o Token automaticamente
// O usuário só vê Reais, o sistema faz o resto
// ============================================
import { ethers } from 'ethers';
import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';
import { getBlockchainConfig } from './config.service.js';
import { createManagedWallet } from './wallet.service.js';
import { RECEIVABLES_ABI } from '../lib/abis.js';
// ============================================
// HELPERS
// ============================================
/**
 * Obtém o provider do Polygon
 */
const getProvider = async () => {
    const config = await getBlockchainConfig();
    return new ethers.JsonRpcProvider(config.rpcUrl);
};
/**
 * Obtém a carteira admin para pagar gas
 */
const getAdminWallet = async () => {
    const adminPrivateKey = process.env.ADMIN_PRIVATE_KEY;
    if (!adminPrivateKey) {
        throw new Error('ADMIN_PRIVATE_KEY não configurado');
    }
    const provider = await getProvider();
    return new ethers.Wallet(adminPrivateKey, provider);
};
/**
 * Obtém o contrato de recebíveis
 */
const getReceivablesContract = async (signer) => {
    const config = await getBlockchainConfig();
    return new ethers.Contract(config.receivablesContract, RECEIVABLES_ABI, signer);
};
// ============================================
// SETTLEMENT FUNCTIONS
// ============================================
/**
 * Liquida um investimento após pagamento Pix confirmado
 *
 * Fluxo:
 * 1. Asaas confirma pagamento via Webhook
 * 2. Esta função é chamada
 * 3. Backend transfere o token do vendedor para o comprador
 * 4. Atualiza splits para redirecionar aluguéis futuros
 *
 * @param listingId - ID da oferta P2P no banco
 * @param buyerId - ID do comprador
 * @param asaasPaymentId - ID do pagamento no Asaas (para referência)
 */
export const settleInvestment = async (listingId, buyerId, asaasPaymentId) => {
    try {
        logger.info(`[Settlement] Iniciando liquidação: Listing ${listingId}, Buyer ${buyerId}`);
        // 1. Buscar a oferta no banco
        const listing = await prisma.p2PListing.findUnique({
            where: { id: listingId },
            include: {
                contract: {
                    include: {
                        property: true,
                    },
                },
            },
        });
        if (!listing) {
            throw new Error('Oferta não encontrada');
        }
        if (listing.status !== 'ACTIVE') {
            throw new Error(`Oferta não está ativa. Status: ${listing.status}`);
        }
        // 2. Buscar comprador e sua carteira
        const buyer = await prisma.user.findUnique({
            where: { id: buyerId },
            select: {
                id: true,
                email: true,
                managedWalletAddress: true,
            },
        });
        if (!buyer) {
            throw new Error('Comprador não encontrado');
        }
        // Criar carteira para o comprador se não tiver
        let buyerWalletAddress = buyer.managedWalletAddress;
        if (!buyerWalletAddress) {
            logger.info(`[Settlement] Criando carteira para comprador ${buyer.email}`);
            buyerWalletAddress = await createManagedWallet(buyer.id);
        }
        // 3. Buscar vendedor
        const seller = await prisma.user.findUnique({
            where: { id: listing.sellerId },
            select: {
                id: true,
                email: true,
                managedWalletAddress: true,
            },
        });
        if (!seller?.managedWalletAddress) {
            throw new Error('Vendedor não possui carteira gerenciada');
        }
        // 4. Configurar blockchain
        const adminWallet = await getAdminWallet();
        const receivablesContract = await getReceivablesContract(adminWallet);
        const config = await getBlockchainConfig();
        logger.info(`[Settlement] Transferindo Token #${listing.receivableTokenId}`);
        logger.info(`[Settlement] De: ${seller.managedWalletAddress}`);
        logger.info(`[Settlement] Para: ${buyerWalletAddress}`);
        // 5. Verificar se admin tem aprovação para transferir
        // IMPORTANTE: O vendedor precisa ter aprovado o contrato admin como operator
        // Isso pode ser feito no momento da listagem ou via setApprovalForAll
        // 6. Executar transferência via Admin (forceTransfer ou safeTransferFrom)
        // O admin atua como "trusted forwarder" - precisa ter permissão no contrato
        const tx = await receivablesContract.safeTransferFrom(seller.managedWalletAddress, // from
        buyerWalletAddress, // to
        listing.receivableTokenId, // tokenId
        1, // amount (1 para tokens únicos)
        '0x' // data (vazio)
        );
        logger.info(`[Settlement] Transação enviada: ${tx.hash}`);
        const receipt = await tx.wait();
        logger.info(`[Settlement] Transação confirmada! Block: ${receipt.blockNumber}`);
        // 7. Atualizar oferta como vendida
        await prisma.p2PListing.update({
            where: { id: listingId },
            data: {
                status: 'SOLD',
                buyerId: buyerId,
                buyerWallet: buyerWalletAddress,
                soldPrice: listing.askingPrice,
                soldAt: new Date(),
                saleTxHash: tx.hash,
            },
        });
        // 8. Criar regra de split para redirecionar aluguéis
        await prisma.contractSplitRule.create({
            data: {
                contractId: listing.contractId,
                recipientId: buyerId,
                recipientType: 'INVESTOR',
                recipientWalletId: null, // Pode ser preenchido com subconta Asaas
                startDate: new Date(),
                endDate: listing.endMonth,
                sharePercent: 0.85, // Investidor recebe a parte do proprietário
                sourceType: 'P2P_SALE',
                sourceId: listingId,
                isActive: true,
            },
        });
        // 9. Registrar transação P2P
        await prisma.p2PTransaction.create({
            data: {
                listingId: listingId,
                sellerId: listing.sellerId,
                buyerId: buyerId,
                amount: listing.askingPrice,
                platformFee: listing.platformFee || 0,
                netToSeller: Number(listing.askingPrice) - Number(listing.platformFee || 0),
                paymentMethod: 'PIX',
                paymentReference: asaasPaymentId,
                txHash: tx.hash,
                blockNumber: receipt.blockNumber,
                status: 'CONFIRMED',
                confirmedAt: new Date(),
            },
        });
        // 10. Atualizar estatísticas do investidor
        const investorRecord = await prisma.investor.findUnique({
            where: { userId: buyerId },
        });
        if (investorRecord) {
            await prisma.investor.update({
                where: { id: investorRecord.id },
                data: {
                    totalPurchases: { increment: 1 },
                    totalInvested: { increment: Number(listing.askingPrice) },
                },
            });
        }
        logger.info(`[Settlement] Liquidação concluída com sucesso!`);
        logger.info(`[Settlement] Investidor ${buyer.email} agora recebe os aluguéis do contrato ${listing.contractId}`);
        return {
            success: true,
            txHash: tx.hash,
        };
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error(`[Settlement] Erro na liquidação: ${errorMessage}`);
        return {
            success: false,
            error: errorMessage,
        };
    }
};
/**
 * Processa webhook do Asaas quando pagamento é confirmado
 * Chamado pela rota de webhooks
 */
export const handleAsaasPaymentConfirmed = async (paymentId, externalReference) => {
    try {
        logger.info(`[Settlement] Webhook Asaas: Pagamento ${paymentId} confirmado`);
        // O externalReference deve conter o formato: "P2P:<listingId>:<buyerId>"
        if (!externalReference?.startsWith('P2P:')) {
            logger.info(`[Settlement] Pagamento ${paymentId} não é P2P, ignorando`);
            return;
        }
        const parts = externalReference.split(':');
        if (parts.length !== 3) {
            logger.warn(`[Settlement] Referência inválida: ${externalReference}`);
            return;
        }
        const [, listingId, buyerId] = parts;
        const result = await settleInvestment(listingId, buyerId, paymentId);
        if (!result.success) {
            logger.error(`[Settlement] Falha ao liquidar: ${result.error}`);
            // TODO: Criar alerta para operações ou retry automático
        }
    }
    catch (error) {
        logger.error(`[Settlement] Erro no webhook: ${error}`);
        throw error;
    }
};
/**
 * Cria uma intenção de compra (usado antes do Pix)
 * Retorna os dados para gerar a cobrança no Asaas
 */
export const createPurchaseIntent = async (listingId, buyerId) => {
    // 1. Buscar oferta
    const listing = await prisma.p2PListing.findUnique({
        where: { id: listingId },
    });
    if (!listing || listing.status !== 'ACTIVE') {
        throw new Error('Oferta não disponível');
    }
    // 2. Verificar se comprador não é o vendedor
    if (listing.sellerId === buyerId) {
        throw new Error('Você não pode comprar sua própria oferta');
    }
    // 3. Gerar referência externa para rastrear no webhook
    const externalReference = `P2P:${listingId}:${buyerId}`;
    // TODO: Criar registro de intenção de compra se quiser bloquear vendas duplicadas
    return {
        intentId: `intent_${listingId}_${Date.now()}`,
        listing: {
            id: listing.id,
            askingPrice: Number(listing.askingPrice),
            monthlyValue: Number(listing.monthlyValue),
            totalMonths: listing.totalMonths,
            contractId: listing.contractId,
        },
        externalReference,
    };
};
export default {
    settleInvestment,
    handleAsaasPaymentConfirmed,
    createPurchaseIntent,
};
//# sourceMappingURL=settlement.service.js.map