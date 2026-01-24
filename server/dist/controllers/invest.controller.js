// ============================================
// INVEST CONTROLLER - Pedidos de Investimento
// "Caixa da Loja" - Compra de Recebíveis via Pix
// Blockchain Invisível ao Usuário
// ============================================
import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';
import { settleInvestment } from '../services/settlement.service.js';
import { getConfig } from '../services/config.service.js';
// Use type assertion for Prisma models - will be typed after prisma generate
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = prisma;
// ============================================
// CRIAR PEDIDO DE INVESTIMENTO
// ============================================
/**
 * POST /api/invest/order
 * Cria um pedido de investimento e gera o QR Code Pix
 *
 * O usuário clica "Comprar" -> Recebe QR Code Pix
 * Quando pagar, o webhook atualiza e liquida na blockchain
 */
export const createInvestmentOrder = async (req, res) => {
    try {
        const { listingId } = req.body;
        // @ts-ignore - userId vem do middleware de auth
        const userId = req.userId;
        if (!listingId) {
            return res.status(400).json({
                success: false,
                error: 'listingId é obrigatório',
            });
        }
        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'Faça login para investir',
            });
        }
        // 1. Buscar a oferta no marketplace
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
            return res.status(404).json({
                success: false,
                error: 'Oferta não encontrada',
            });
        }
        if (listing.status !== 'ACTIVE') {
            return res.status(400).json({
                success: false,
                error: 'Esta oferta não está mais disponível',
            });
        }
        // 2. Verificar se o usuário não está comprando de si mesmo
        if (listing.sellerId === userId) {
            return res.status(400).json({
                success: false,
                error: 'Você não pode comprar sua própria oferta',
            });
        }
        // 3. Verificar se já existe um pedido pendente para este usuário/listing
        const existingOrder = await prisma.investmentOrder.findFirst({
            where: {
                userId,
                listingId,
                status: { in: ['PENDING', 'AWAITING_PAYMENT'] },
            },
        });
        if (existingOrder) {
            // Retornar o pedido existente
            return res.json({
                success: true,
                data: {
                    order: {
                        id: existingOrder.id,
                        status: existingOrder.status,
                        totalPrice: Number(existingOrder.totalPrice),
                        pixQrCode: existingOrder.pixQrCode,
                        pixExpiresAt: existingOrder.pixExpiresAt,
                    },
                    message: 'Você já tem um pedido pendente para esta oferta',
                },
            });
        }
        // 4. Buscar dados do usuário comprador
        const buyer = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                name: true,
                cpf: true,
                phone: true,
            },
        });
        if (!buyer) {
            return res.status(404).json({
                success: false,
                error: 'Usuário não encontrado',
            });
        }
        // 5. Calcular valores
        const totalPrice = Number(listing.askingPrice);
        const platformFee = totalPrice * 0.02; // 2% de taxa
        // 6. Gerar referência externa única
        const externalReference = `INV:${crypto.randomUUID()}`;
        // 7. Criar o pedido no banco
        const order = await prisma.investmentOrder.create({
            data: {
                userId,
                listingId,
                amountInTokens: 1,
                totalPrice,
                platformFee,
                externalReference,
                status: 'PENDING',
            },
        });
        // 8. Gerar cobrança no Asaas
        let pixData = {};
        try {
            pixData = await generateAsaasPixCharge({
                buyer,
                amount: totalPrice,
                description: `Investimento: ${listing.totalMonths} meses de recebíveis - ${listing.contract.property.title}`,
                externalReference,
            });
            // 9. Atualizar pedido com dados do Pix
            await prisma.investmentOrder.update({
                where: { id: order.id },
                data: {
                    status: 'AWAITING_PAYMENT',
                    asaasPaymentId: pixData.paymentId,
                    pixQrCode: pixData.qrCode,
                    pixQrCodeImage: pixData.qrCodeImage,
                    pixExpiresAt: pixData.expiresAt,
                },
            });
        }
        catch (asaasError) {
            logger.error(`[Invest] Erro ao gerar Pix: ${asaasError}`);
            // Manter o pedido como PENDING para retry
        }
        logger.info(`[Invest] Pedido ${order.id} criado para listing ${listingId}`);
        res.status(201).json({
            success: true,
            data: {
                order: {
                    id: order.id,
                    status: pixData.qrCode ? 'AWAITING_PAYMENT' : 'PENDING',
                    totalPrice,
                    platformFee,
                    listing: {
                        id: listing.id,
                        totalMonths: listing.totalMonths,
                        monthlyValue: Number(listing.monthlyValue),
                        faceValue: Number(listing.faceValue),
                        discountPercent: Number(listing.discountPercent),
                        property: {
                            title: listing.contract.property.title,
                            city: listing.contract.property.city,
                            state: listing.contract.property.state,
                        },
                    },
                },
                pix: pixData.qrCode
                    ? {
                        qrCode: pixData.qrCode,
                        qrCodeImage: pixData.qrCodeImage,
                        expiresAt: pixData.expiresAt,
                    }
                    : null,
                message: pixData.qrCode
                    ? 'Pague o Pix para concluir seu investimento. Após a confirmação, os recebíveis serão transferidos automaticamente.'
                    : 'Pedido criado. Aguarde a geração do QR Code Pix.',
            },
        });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error(`[Invest Controller] createInvestmentOrder error: ${errorMessage}`);
        res.status(500).json({
            success: false,
            error: 'Erro ao criar pedido de investimento',
        });
    }
};
// ============================================
// BUSCAR MEUS PEDIDOS
// ============================================
/**
 * GET /api/invest/orders
 * Lista os pedidos de investimento do usuário
 */
export const getMyOrders = async (req, res) => {
    try {
        // @ts-ignore
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'Não autorizado',
            });
        }
        const orders = await prisma.investmentOrder.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
        });
        // Buscar listings relacionados
        const listingIds = [...new Set(orders.map((o) => o.listingId))];
        const listings = await prisma.p2PListing.findMany({
            where: { id: { in: listingIds } },
            include: {
                contract: {
                    include: {
                        property: {
                            select: {
                                title: true,
                                city: true,
                                state: true,
                            },
                        },
                    },
                },
            },
        });
        const listingsMap = new Map(listings.map((l) => [l.id, l]));
        res.json({
            success: true,
            data: orders.map((order) => {
                const listing = listingsMap.get(order.listingId);
                return {
                    id: order.id,
                    status: order.status,
                    totalPrice: Number(order.totalPrice),
                    platformFee: order.platformFee ? Number(order.platformFee) : null,
                    createdAt: order.createdAt,
                    paidAt: order.paidAt,
                    settledAt: order.settledAt,
                    txHash: order.txHash,
                    listing: listing
                        ? {
                            id: listing.id,
                            totalMonths: listing.totalMonths,
                            monthlyValue: Number(listing.monthlyValue),
                            faceValue: Number(listing.faceValue),
                            property: {
                                title: listing.contract.property.title,
                                city: listing.contract.property.city,
                                state: listing.contract.property.state,
                            },
                        }
                        : null,
                };
            }),
        });
    }
    catch (error) {
        logger.error(`[Invest Controller] getMyOrders error: ${error}`);
        res.status(500).json({
            success: false,
            error: 'Erro ao buscar pedidos',
        });
    }
};
// ============================================
// BUSCAR DETALHES DE UM PEDIDO
// ============================================
/**
 * GET /api/invest/orders/:id
 * Retorna detalhes de um pedido específico
 */
export const getOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        // @ts-ignore
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'Não autorizado',
            });
        }
        const order = await prisma.investmentOrder.findUnique({
            where: { id },
        });
        if (!order) {
            return res.status(404).json({
                success: false,
                error: 'Pedido não encontrado',
            });
        }
        // Verificar se o pedido pertence ao usuário
        if (order.userId !== userId) {
            return res.status(403).json({
                success: false,
                error: 'Você não tem permissão para ver este pedido',
            });
        }
        // Buscar dados do listing
        const listing = await prisma.p2PListing.findUnique({
            where: { id: order.listingId },
            include: {
                contract: {
                    include: {
                        property: true,
                    },
                },
            },
        });
        res.json({
            success: true,
            data: {
                order: {
                    id: order.id,
                    status: order.status,
                    totalPrice: Number(order.totalPrice),
                    platformFee: order.platformFee ? Number(order.platformFee) : null,
                    createdAt: order.createdAt,
                    paidAt: order.paidAt,
                    settledAt: order.settledAt,
                    txHash: order.txHash,
                    errorMessage: order.errorMessage,
                },
                pix: order.status === 'AWAITING_PAYMENT'
                    ? {
                        qrCode: order.pixQrCode,
                        qrCodeImage: order.pixQrCodeImage,
                        expiresAt: order.pixExpiresAt,
                    }
                    : null,
                listing: listing
                    ? {
                        id: listing.id,
                        totalMonths: listing.totalMonths,
                        monthlyValue: Number(listing.monthlyValue),
                        faceValue: Number(listing.faceValue),
                        discountPercent: Number(listing.discountPercent),
                        startMonth: listing.startMonth,
                        endMonth: listing.endMonth,
                        property: {
                            id: listing.contract.property.id,
                            title: listing.contract.property.title,
                            city: listing.contract.property.city,
                            state: listing.contract.property.state,
                            type: listing.contract.property.type,
                        },
                    }
                    : null,
            },
        });
    }
    catch (error) {
        logger.error(`[Invest Controller] getOrderById error: ${error}`);
        res.status(500).json({
            success: false,
            error: 'Erro ao buscar pedido',
        });
    }
};
// ============================================
// CANCELAR PEDIDO
// ============================================
/**
 * DELETE /api/invest/orders/:id
 * Cancela um pedido pendente
 */
export const cancelOrder = async (req, res) => {
    try {
        const { id } = req.params;
        // @ts-ignore
        const userId = req.userId;
        if (!userId) {
            return res.status(401).json({
                success: false,
                error: 'Não autorizado',
            });
        }
        const order = await prisma.investmentOrder.findUnique({
            where: { id },
        });
        if (!order) {
            return res.status(404).json({
                success: false,
                error: 'Pedido não encontrado',
            });
        }
        if (order.userId !== userId) {
            return res.status(403).json({
                success: false,
                error: 'Você não tem permissão para cancelar este pedido',
            });
        }
        // Só pode cancelar pedidos pendentes ou aguardando pagamento
        if (!['PENDING', 'AWAITING_PAYMENT'].includes(order.status)) {
            return res.status(400).json({
                success: false,
                error: 'Este pedido não pode ser cancelado',
            });
        }
        // Atualizar status
        await prisma.investmentOrder.update({
            where: { id },
            data: { status: 'CANCELLED' },
        });
        // TODO: Se tiver cobrança no Asaas, cancelar lá também
        logger.info(`[Invest] Pedido ${id} cancelado pelo usuário ${userId}`);
        res.json({
            success: true,
            message: 'Pedido cancelado com sucesso',
        });
    }
    catch (error) {
        logger.error(`[Invest Controller] cancelOrder error: ${error}`);
        res.status(500).json({
            success: false,
            error: 'Erro ao cancelar pedido',
        });
    }
};
// ============================================
// PROCESSAR PAGAMENTO (chamado pelo webhook)
// ============================================
/**
 * Processa o pagamento confirmado e inicia liquidação blockchain
 * Chamado pelo webhook do Asaas quando o Pix é confirmado
 */
export const processPaymentConfirmed = async (externalReference, asaasPaymentId) => {
    try {
        // 1. Buscar o pedido pela referência externa
        const order = await prisma.investmentOrder.findFirst({
            where: { externalReference },
        });
        if (!order) {
            logger.error(`[Invest] Pedido não encontrado para ref: ${externalReference}`);
            return { success: false, error: 'Pedido não encontrado' };
        }
        if (order.status !== 'AWAITING_PAYMENT') {
            logger.warn(`[Invest] Pedido ${order.id} não está aguardando pagamento (status: ${order.status})`);
            return { success: false, error: 'Pedido não está aguardando pagamento' };
        }
        // 2. Atualizar status para PAID
        await prisma.investmentOrder.update({
            where: { id: order.id },
            data: {
                status: 'PAID',
                paidAt: new Date(),
                asaasPaymentId,
            },
        });
        logger.info(`[Invest] Pagamento confirmado para pedido ${order.id}`);
        // 3. Iniciar liquidação blockchain (transferência de tokens)
        await prisma.investmentOrder.update({
            where: { id: order.id },
            data: { status: 'SETTLING' },
        });
        const settlementResult = await settleInvestment(order.listingId, order.userId, asaasPaymentId);
        if (settlementResult.success) {
            // 4. Sucesso! Atualizar pedido como concluído
            await prisma.investmentOrder.update({
                where: { id: order.id },
                data: {
                    status: 'COMPLETED',
                    txHash: settlementResult.txHash,
                    settledAt: new Date(),
                },
            });
            logger.info(`[Invest] Pedido ${order.id} concluído! TX: ${settlementResult.txHash}`);
            return { success: true };
        }
        else {
            // 5. Falha na liquidação
            await prisma.investmentOrder.update({
                where: { id: order.id },
                data: {
                    status: 'FAILED',
                    errorMessage: settlementResult.error,
                },
            });
            logger.error(`[Invest] Falha na liquidação do pedido ${order.id}: ${settlementResult.error}`);
            return { success: false, error: settlementResult.error };
        }
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error(`[Invest] processPaymentConfirmed error: ${errorMessage}`);
        return { success: false, error: errorMessage };
    }
};
async function generateAsaasPixCharge(params) {
    // Buscar API Key do Asaas
    const asaasApiKey = await getConfig('ASAAS_API_KEY');
    if (!asaasApiKey) {
        throw new Error('Asaas não configurado');
    }
    const baseUrl = process.env.ASAAS_SANDBOX === 'true'
        ? 'https://sandbox.asaas.com/api/v3'
        : 'https://api.asaas.com/v3';
    // 1. Buscar ou criar cliente no Asaas
    let customerId;
    // Buscar cliente por email
    const searchResponse = await fetch(`${baseUrl}/customers?email=${encodeURIComponent(params.buyer.email)}`, {
        headers: {
            'Content-Type': 'application/json',
            access_token: asaasApiKey,
        },
    });
    const searchData = await searchResponse.json();
    if (searchData.data && searchData.data.length > 0) {
        customerId = searchData.data[0].id;
    }
    else {
        // Criar cliente
        const customerResponse = await fetch(`${baseUrl}/customers`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                access_token: asaasApiKey,
            },
            body: JSON.stringify({
                name: params.buyer.name,
                email: params.buyer.email,
                cpfCnpj: params.buyer.cpf?.replace(/\D/g, ''),
                phone: params.buyer.phone?.replace(/\D/g, ''),
            }),
        });
        const customerData = await customerResponse.json();
        if (!customerData.id) {
            throw new Error(`Erro ao criar cliente Asaas: ${JSON.stringify(customerData)}`);
        }
        customerId = customerData.id;
    }
    // 2. Criar cobrança Pix
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 1); // Vence em 1 dia
    const chargeResponse = await fetch(`${baseUrl}/payments`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            access_token: asaasApiKey,
        },
        body: JSON.stringify({
            customer: customerId,
            billingType: 'PIX',
            value: params.amount,
            dueDate: dueDate.toISOString().split('T')[0],
            description: params.description,
            externalReference: params.externalReference,
        }),
    });
    const chargeData = await chargeResponse.json();
    if (!chargeData.id) {
        throw new Error(`Erro ao criar cobrança: ${JSON.stringify(chargeData)}`);
    }
    // 3. Buscar QR Code
    const pixResponse = await fetch(`${baseUrl}/payments/${chargeData.id}/pixQrCode`, {
        headers: {
            'Content-Type': 'application/json',
            access_token: asaasApiKey,
        },
    });
    const pixData = await pixResponse.json();
    if (!pixData.payload) {
        throw new Error('Erro ao gerar QR Code Pix');
    }
    // Calcular expiração (Pix vence em 30 minutos)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 30);
    return {
        paymentId: chargeData.id,
        qrCode: pixData.payload,
        qrCodeImage: pixData.encodedImage,
        expiresAt,
    };
}
export default {
    createInvestmentOrder,
    getMyOrders,
    getOrderById,
    cancelOrder,
    processPaymentConfirmed,
};
//# sourceMappingURL=invest.controller.js.map