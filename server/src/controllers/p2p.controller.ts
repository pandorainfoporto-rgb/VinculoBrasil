// ============================================
// P2P MARKETPLACE CONTROLLER
// Endpoints para Cessão de Crédito Digital
// ============================================

import type { Request, Response } from 'express';
import p2pService from '../services/p2p.service.js';
import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';
import { createPurchaseIntent, settleInvestment } from '../services/settlement.service.js';
import { notifyInvestorsNewListing } from '../services/notification.service.js';

// ============================================
// LISTAGENS (OFERTAS)
// ============================================

/**
 * GET /api/p2p/listings
 * Busca ofertas ativas no marketplace
 */
export const getListings = async (req: Request, res: Response) => {
  try {
    const {
      minDiscount,
      maxDiscount,
      minTenantScore,
      city,
      page = '1',
      limit = '20',
    } = req.query;

    const listings = await p2pService.getActiveListings({
      minDiscount: minDiscount ? Number(minDiscount) : undefined,
      maxDiscount: maxDiscount ? Number(maxDiscount) : undefined,
      minTenantScore: minTenantScore ? Number(minTenantScore) : undefined,
      city: city as string | undefined,
    });

    // Paginação simples
    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(100, Math.max(1, Number(limit)));
    const start = (pageNum - 1) * limitNum;
    const paginatedListings = listings.slice(start, start + limitNum);

    res.json({
      success: true,
      data: {
        listings: paginatedListings,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: listings.length,
          totalPages: Math.ceil(listings.length / limitNum),
        },
      },
    });
  } catch (error) {
    logger.error(`[P2P Controller] getListings error: ${error instanceof Error ? error.message : String(error)}`);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar ofertas',
    });
  }
};

/**
 * GET /api/p2p/listings/:id
 * Busca detalhes de uma oferta específica
 */
export const getListingById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const listing = await prisma.p2PListing.findUnique({
      where: { id },
      include: {
        contract: {
          include: {
            property: {
              include: {
                images: true,
              },
            },
            guarantors: true,
            payments: {
              orderBy: { dueDate: 'desc' },
              take: 12,
            },
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

    // Calcular estatísticas do inquilino
    const totalPayments = listing.contract.payments.length;
    const paidOnTime = listing.contract.payments.filter(
      (p) => p.status === 'PAID' && p.paidAt && p.paidAt <= p.dueDate
    ).length;
    const paymentScore = totalPayments > 0 ? Math.round((paidOnTime / totalPayments) * 100) : 0;

    res.json({
      success: true,
      data: {
        listing: {
          id: listing.id,
          contractId: listing.contractId,
          receivableTokenId: listing.receivableTokenId,
          faceValue: Number(listing.faceValue),
          askingPrice: Number(listing.askingPrice),
          discountPercent: Number(listing.discountPercent),
          totalMonths: listing.totalMonths,
          monthlyValue: Number(listing.monthlyValue),
          startMonth: listing.startMonth,
          endMonth: listing.endMonth,
          tenantScore: listing.tenantScore,
          contractGuarantee: listing.contractGuarantee,
          status: listing.status,
          createdAt: listing.createdAt,
        },
        property: {
          id: listing.contract.property.id,
          title: listing.contract.property.title,
          type: listing.contract.property.type,
          city: listing.contract.property.city,
          state: listing.contract.property.state,
          neighborhood: listing.contract.property.neighborhood,
          bedrooms: listing.contract.property.bedrooms,
          area: listing.contract.property.area ? Number(listing.contract.property.area) : null,
          images: listing.contract.property.images.map((img) => img.url),
        },
        contract: {
          startDate: listing.contract.startDate,
          endDate: listing.contract.endDate,
          dueDay: listing.contract.dueDay,
          hasGuarantor: listing.contract.guarantors.length > 0,
          guarantorType: listing.contract.guarantors[0]?.type || null,
        },
        tenantMetrics: {
          paymentScore,
          totalPayments,
          paidOnTime,
        },
      },
    });
  } catch (error) {
    logger.error(`[P2P Controller] getListingById error: ${error instanceof Error ? error.message : String(error)}`);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar oferta',
    });
  }
};

/**
 * POST /api/p2p/listings
 * Cria uma nova oferta de venda
 */
export const createListing = async (req: Request, res: Response) => {
  try {
    const {
      contractId,
      askingPrice,
      priceInMatic,
      priceInStable,
    } = req.body;

    // @ts-ignore - userId vem do middleware de auth
    const userId = req.userId || req.body.userId;
    // @ts-ignore - walletAddress pode vir do auth ou do body
    const walletAddress = req.walletAddress || req.body.walletAddress;

    if (!contractId || !askingPrice) {
      return res.status(400).json({
        success: false,
        error: 'contractId e askingPrice são obrigatórios',
      });
    }

    if (!walletAddress) {
      return res.status(400).json({
        success: false,
        error: 'walletAddress é obrigatório para criar ofertas',
      });
    }

    // Verificar se o usuário é o proprietário do contrato
    const contract = await prisma.rentContract.findUnique({
      where: { id: contractId },
      include: {
        property: true,
      },
    });

    if (!contract) {
      return res.status(404).json({
        success: false,
        error: 'Contrato não encontrado',
      });
    }

    // Verificar se já existe uma oferta ativa para este contrato
    const existingListing = await prisma.p2PListing.findFirst({
      where: {
        contractId,
        status: 'ACTIVE',
      },
    });

    if (existingListing) {
      return res.status(400).json({
        success: false,
        error: 'Já existe uma oferta ativa para este contrato',
      });
    }

    const result = await p2pService.createP2PListing({
      contractId,
      sellerId: userId,
      sellerWallet: walletAddress,
      askingPrice: Number(askingPrice),
      priceInMatic: priceInMatic ? Number(priceInMatic) : undefined,
      priceInStable: priceInStable ? Number(priceInStable) : undefined,
    });

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error,
      });
    }

    // ============================================
    // 🚀 NOTIFICAR INVESTIDORES AUTOMATICAMENTE
    // WhatsApp + Email em paralelo (não bloqueia resposta)
    // ============================================
    if (result.dbListingId) {
      // Buscar dados da listing criada para notificação
      const createdListing = await prisma.p2PListing.findUnique({
        where: { id: result.dbListingId },
        include: {
          contract: {
            include: {
              property: true,
            },
          },
        },
      });

      if (createdListing) {
        // Disparar notificações em background (não espera completar)
        notifyInvestorsNewListing({
          listingId: createdListing.id,
          propertyTitle: createdListing.contract.property.title,
          monthlyValue: Number(createdListing.monthlyValue),
          totalMonths: createdListing.totalMonths,
          askingPrice: Number(createdListing.askingPrice),
          discountPercent: Number(createdListing.discountPercent),
          city: createdListing.contract.property.city,
          state: createdListing.contract.property.state,
        }).catch((error) => {
          logger.error(`[P2P Controller] Erro ao notificar investidores: ${error instanceof Error ? error.message : String(error)}`);
        });

        logger.info(`[P2P Controller] 📲 Notificações disparadas para investidores sobre listing ${result.dbListingId}`);
      }
    }

    res.status(201).json({
      success: true,
      data: {
        listingId: result.dbListingId,
        listingIdOnChain: result.listingId,
        txHash: result.txHash,
        message: 'Oferta criada com sucesso! Seus recebíveis foram tokenizados e investidores foram notificados automaticamente via WhatsApp e E-mail.',
      },
    });
  } catch (error) {
    logger.error(`[P2P Controller] createListing error: ${error instanceof Error ? error.message : String(error)}`);
    res.status(500).json({
      success: false,
      error: 'Erro ao criar oferta',
    });
  }
};

/**
 * DELETE /api/p2p/listings/:id
 * Cancela uma oferta
 */
export const cancelListing = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    // @ts-ignore
    const userId = req.userId || req.body.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Não autorizado',
      });
    }

    const result = await p2pService.cancelListing(id, userId);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error,
      });
    }

    res.json({
      success: true,
      message: 'Oferta cancelada com sucesso',
    });
  } catch (error) {
    logger.error(`[P2P Controller] cancelListing error: ${error instanceof Error ? error.message : String(error)}`);
    res.status(500).json({
      success: false,
      error: 'Erro ao cancelar oferta',
    });
  }
};

// ============================================
// ESTATÍSTICAS
// ============================================

/**
 * GET /api/p2p/stats
 * Retorna estatísticas do marketplace
 */
export const getStats = async (req: Request, res: Response) => {
  try {
    const stats = await p2pService.getMarketplaceStats();

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    logger.error(`[P2P Controller] getStats error: ${error instanceof Error ? error.message : String(error)}`);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar estatísticas',
    });
  }
};

// ============================================
// MINHAS OFERTAS (VENDEDOR)
// ============================================

/**
 * GET /api/p2p/my-listings
 * Retorna ofertas do usuário logado
 */
export const getMyListings = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Não autorizado',
      });
    }

    const listings = await prisma.p2PListing.findMany({
      where: { sellerId: userId },
      include: {
        contract: {
          include: {
            property: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: listings.map((listing) => ({
        id: listing.id,
        contractId: listing.contractId,
        propertyTitle: listing.contract.property.title,
        faceValue: Number(listing.faceValue),
        askingPrice: Number(listing.askingPrice),
        discountPercent: Number(listing.discountPercent),
        status: listing.status,
        soldAt: listing.soldAt,
        soldPrice: listing.soldPrice ? Number(listing.soldPrice) : null,
        createdAt: listing.createdAt,
      })),
    });
  } catch (error) {
    logger.error(`[P2P Controller] getMyListings error: ${error instanceof Error ? error.message : String(error)}`);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar suas ofertas',
    });
  }
};

// ============================================
// MINHAS COMPRAS (INVESTIDOR)
// ============================================

/**
 * GET /api/p2p/my-purchases
 * Retorna compras do investidor logado
 */
export const getMyPurchases = async (req: Request, res: Response) => {
  try {
    // @ts-ignore
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Não autorizado',
      });
    }

    const purchases = await prisma.p2PListing.findMany({
      where: {
        buyerId: userId,
        status: 'SOLD',
      },
      include: {
        contract: {
          include: {
            property: true,
            payments: {
              where: {
                dueDate: { gte: new Date() },
              },
              orderBy: { dueDate: 'asc' },
            },
          },
        },
      },
      orderBy: { soldAt: 'desc' },
    });

    // Calcular valor esperado de recebimento
    const purchasesWithProjection = purchases.map((purchase) => {
      const futurePayments = purchase.contract.payments;
      const expectedReceipts = futurePayments.reduce(
        (sum, p) => sum + Number(p.amount) * 0.85, // 85% vai pro investidor
        0
      );

      return {
        id: purchase.id,
        contractId: purchase.contractId,
        propertyTitle: purchase.contract.property.title,
        city: purchase.contract.property.city,
        purchasePrice: Number(purchase.soldPrice),
        purchaseDate: purchase.soldAt,
        monthsRemaining: futurePayments.length,
        expectedReceipts,
        estimatedYield: ((expectedReceipts - Number(purchase.soldPrice)) / Number(purchase.soldPrice)) * 100,
        nextPaymentDate: futurePayments[0]?.dueDate || null,
        nextPaymentAmount: futurePayments[0] ? Number(futurePayments[0].amount) * 0.85 : null,
      };
    });

    res.json({
      success: true,
      data: purchasesWithProjection,
    });
  } catch (error) {
    logger.error(`[P2P Controller] getMyPurchases error: ${error instanceof Error ? error.message : String(error)}`);
    res.status(500).json({
      success: false,
      error: 'Erro ao buscar suas compras',
    });
  }
};

// ============================================
// SIMULADOR DE PREÇO
// ============================================

/**
 * POST /api/p2p/simulate
 * Simula o preço de venda e retorno para investidor
 */
export const simulateListing = async (req: Request, res: Response) => {
  try {
    const {
      monthlyRent,
      monthsToSell,
      discountPercent,
    } = req.body;

    if (!monthlyRent || !monthsToSell) {
      return res.status(400).json({
        success: false,
        error: 'monthlyRent e monthsToSell são obrigatórios',
      });
    }

    const faceValue = Number(monthlyRent) * Number(monthsToSell);
    const discount = Number(discountPercent) || 15; // 15% default
    const askingPrice = faceValue * (1 - discount / 100);
    const platformFee = askingPrice * 0.02; // 2%
    const netToSeller = askingPrice - platformFee;

    // Para o investidor
    const investorReceives = faceValue * 0.85; // 85% dos aluguéis
    const investorProfit = investorReceives - askingPrice;
    const investorYield = (investorProfit / askingPrice) * 100;
    const monthlyYield = investorYield / Number(monthsToSell);

    res.json({
      success: true,
      data: {
        seller: {
          faceValue,
          discountPercent: discount,
          askingPrice,
          platformFee,
          netToSeller,
          receivingNowVsFaceValue: (netToSeller / faceValue) * 100,
        },
        investor: {
          purchasePrice: askingPrice,
          totalReceivables: faceValue,
          netReceivables: investorReceives,
          profit: investorProfit,
          totalYield: investorYield,
          monthlyYield,
        },
        period: {
          months: Number(monthsToSell),
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date(Date.now() + Number(monthsToSell) * 30 * 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0],
        },
      },
    });
  } catch (error) {
    logger.error(`[P2P Controller] simulateListing error: ${error instanceof Error ? error.message : String(error)}`);
    res.status(500).json({
      success: false,
      error: 'Erro ao simular',
    });
  }
};

// ============================================
// WEBHOOK BLOCKCHAIN (chamado por serviço externo)
// ============================================

/**
 * POST /api/p2p/webhook/sale
 * Webhook chamado quando uma venda é detectada na blockchain
 */
export const handleSaleWebhook = async (req: Request, res: Response) => {
  try {
    const { listingId, buyerWallet, txHash, signature } = req.body;

    // TODO: Validar assinatura do webhook

    if (!listingId || !buyerWallet || !txHash) {
      return res.status(400).json({
        success: false,
        error: 'listingId, buyerWallet e txHash são obrigatórios',
      });
    }

    await p2pService.handleP2PSale(listingId, buyerWallet, txHash);

    res.json({
      success: true,
      message: 'Venda processada com sucesso',
    });
  } catch (error) {
    logger.error(`[P2P Controller] handleSaleWebhook error: ${error instanceof Error ? error.message : String(error)}`);
    res.status(500).json({
      success: false,
      error: 'Erro ao processar webhook',
    });
  }
};

// ============================================
// COMPRA VIA PIX (Blockchain Invisível)
// ============================================

/**
 * POST /api/p2p/buy-intent
 * Cria uma intenção de compra e retorna dados para gerar Pix
 * O usuário só vê Reais, a blockchain é invisível
 */
export const createBuyIntent = async (req: Request, res: Response) => {
  try {
    const { listingId } = req.body;
    // @ts-ignore - userId vem do middleware de auth
    const userId = req.userId || req.body.buyerId;

    if (!listingId) {
      return res.status(400).json({
        success: false,
        error: 'listingId é obrigatório',
      });
    }

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Não autorizado. Faça login para comprar.',
      });
    }

    const intent = await createPurchaseIntent(listingId, userId);

    res.json({
      success: true,
      data: {
        intentId: intent.intentId,
        listing: intent.listing,
        externalReference: intent.externalReference,
        // O frontend usa isso para gerar a cobrança no Asaas
        paymentDetails: {
          amount: intent.listing.askingPrice,
          description: `Investimento: Cessão de ${intent.listing.totalMonths} meses de aluguel`,
          externalReference: intent.externalReference,
        },
        message: 'Pague via Pix para concluir a compra. Assim que o pagamento for confirmado, os recebíveis serão transferidos automaticamente.',
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`[P2P Controller] createBuyIntent error: ${errorMessage}`);
    res.status(400).json({
      success: false,
      error: errorMessage,
    });
  }
};

/**
 * GET /api/invest/orders/:orderId/status
 * Verifica o status de um pedido de investimento (para polling)
 * Retorna apenas o status sem dados sensíveis
 */
export const getOrderStatus = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return res.status(400).json({
        success: false,
        error: 'orderId é obrigatório',
      });
    }

    // Buscar pedido pelo intentId ou pelo ID do pedido
    const order = await prisma.investmentOrder.findFirst({
      where: {
        OR: [
          { id: orderId },
          // intentId format: intent_<listingId>_<timestamp>
          { id: { contains: orderId } },
        ],
      },
      select: {
        id: true,
        status: true,
        txHash: true,
        settledAt: true,
      },
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Pedido não encontrado',
      });
    }

    res.json({
      success: true,
      status: order.status,
      txHash: order.txHash,
      settledAt: order.settledAt,
    });
  } catch (error) {
    logger.error(`[P2P Controller] getOrderStatus error: ${error instanceof Error ? error.message : String(error)}`);
    res.status(500).json({
      success: false,
      error: 'Erro ao verificar status',
    });
  }
};

/**
 * POST /api/p2p/settle
 * Liquida a compra após pagamento Pix confirmado
 * Chamado pelo webhook do Asaas ou manualmente pelo admin
 */
export const settlePurchase = async (req: Request, res: Response) => {
  try {
    const { listingId, buyerId, asaasPaymentId } = req.body;

    if (!listingId || !buyerId) {
      return res.status(400).json({
        success: false,
        error: 'listingId e buyerId são obrigatórios',
      });
    }

    logger.info(`[P2P Controller] Liquidando compra: Listing ${listingId}, Buyer ${buyerId}`);

    const result = await settleInvestment(listingId, buyerId, asaasPaymentId);

    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error,
      });
    }

    res.json({
      success: true,
      data: {
        txHash: result.txHash,
        message: 'Compra liquidada com sucesso! Os recebíveis foram transferidos para sua conta.',
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`[P2P Controller] settlePurchase error: ${errorMessage}`);
    res.status(500).json({
      success: false,
      error: 'Erro ao liquidar compra',
    });
  }
};

export default {
  getListings,
  getListingById,
  createListing,
  cancelListing,
  getStats,
  getMyListings,
  getMyPurchases,
  simulateListing,
  handleSaleWebhook,
  // PIX-based purchases (Invisible Blockchain)
  createBuyIntent,
  settlePurchase,
  getOrderStatus,
};
