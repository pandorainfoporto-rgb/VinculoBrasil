// ============================================
// VOUCHERS ROUTES - Sistema de Resgate VBRz
// ============================================

import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../middleware/error-handler.js';
import { requirePermission } from '../middleware/auth.js';
import crypto from 'crypto';

const router = Router();

// Endereço de queima (dead address) para política BURN
const DEAD_ADDRESS = '0x000000000000000000000000000000000000dEaD';

// ============================================
// SCHEMAS
// ============================================

const createCampaignSchema = z.object({
  partnerId: z.string().uuid(),
  title: z.string().min(2),
  description: z.string().optional(),
  rules: z.string().optional(),
  termsAndConditions: z.string().optional(),
  costInVbrz: z.number().positive(),
  originalValue: z.number().positive().optional(),
  discountPercentage: z.number().min(0).max(100).optional(),
  settlementType: z.enum(['BURN', 'PARTNER_WALLET']),
  partnerWalletAddress: z.string().optional(),
  totalStock: z.number().int().positive(),
  maxPerUser: z.number().int().positive().default(1),
  minVbrzBalance: z.number().optional(),
  startDate: z.string().datetime().optional(),
  expirationDate: z.string().datetime().optional(),
  bannerImage: z.string().optional(),
  thumbnailImage: z.string().optional(),
  category: z.string().optional(),
  featured: z.boolean().default(false),
});

const generateCodesSchema = z.object({
  quantity: z.number().int().positive().max(1000),
  prefix: z.string().max(10).default('VBRZ'),
});

const redeemVoucherSchema = z.object({
  campaignId: z.string().uuid(),
  userWalletAddress: z.string().min(42).max(42),
  txHash: z.string().min(66).max(66),
});

const confirmRedemptionSchema = z.object({
  redemptionId: z.string().uuid(),
  blockNumber: z.number().int().optional(),
});

// ============================================
// CAMPAIGNS ROUTES (Admin)
// ============================================

// GET /api/vouchers/campaigns - Listar todas as campanhas
router.get('/campaigns', requirePermission('vouchers:read'), async (req, res, next) => {
  try {
    const { partnerId, isActive, settlementType } = req.query;

    const campaigns = await prisma.voucherCampaign.findMany({
      where: {
        ...(partnerId && { partnerId: String(partnerId) }),
        ...(isActive !== undefined && { isActive: isActive === 'true' }),
        ...(settlementType && { settlementType: String(settlementType) as 'BURN' | 'PARTNER_WALLET' }),
      },
      include: {
        partner: {
          select: {
            id: true,
            name: true,
            tradeName: true,
          },
        },
        _count: {
          select: {
            codes: true,
            redemptions: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ data: campaigns });
  } catch (error) {
    next(error);
  }
});

// GET /api/vouchers/campaigns/:id - Obter campanha por ID
router.get('/campaigns/:id', requirePermission('vouchers:read'), async (req, res, next) => {
  try {
    const { id } = req.params;

    const campaign = await prisma.voucherCampaign.findUnique({
      where: { id },
      include: {
        partner: true,
        codes: {
          orderBy: { createdAt: 'desc' },
          take: 100,
        },
        _count: {
          select: {
            codes: true,
            redemptions: true,
          },
        },
      },
    });

    if (!campaign) {
      throw new AppError(404, 'Campaign not found');
    }

    res.json({ data: campaign });
  } catch (error) {
    next(error);
  }
});

// POST /api/vouchers/campaigns - Criar nova campanha
router.post('/campaigns', requirePermission('vouchers:write'), async (req, res, next) => {
  try {
    const data = createCampaignSchema.parse(req.body);

    // Verificar se parceiro existe
    const partner = await prisma.partner.findUnique({
      where: { id: data.partnerId },
    });

    if (!partner) {
      throw new AppError(404, 'Partner not found');
    }

    // Se for PARTNER_WALLET, exigir endereço da carteira
    if (data.settlementType === 'PARTNER_WALLET' && !data.partnerWalletAddress) {
      throw new AppError(400, 'Partner wallet address is required for PARTNER_WALLET settlement type');
    }

    const campaign = await prisma.voucherCampaign.create({
      data: {
        partnerId: data.partnerId,
        title: data.title,
        description: data.description,
        rules: data.rules,
        termsAndConditions: data.termsAndConditions,
        costInVbrz: data.costInVbrz,
        originalValue: data.originalValue,
        discountPercentage: data.discountPercentage,
        settlementType: data.settlementType,
        partnerWalletAddress: data.partnerWalletAddress,
        totalStock: data.totalStock,
        availableStock: data.totalStock,
        maxPerUser: data.maxPerUser,
        minVbrzBalance: data.minVbrzBalance,
        startDate: data.startDate ? new Date(data.startDate) : new Date(),
        expirationDate: data.expirationDate ? new Date(data.expirationDate) : null,
        bannerImage: data.bannerImage,
        thumbnailImage: data.thumbnailImage,
        category: data.category,
        featured: data.featured,
      },
      include: {
        partner: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    res.status(201).json({ data: campaign });
  } catch (error) {
    next(error);
  }
});

// PUT /api/vouchers/campaigns/:id - Atualizar campanha
router.put('/campaigns/:id', requirePermission('vouchers:write'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = createCampaignSchema.partial().parse(req.body);

    const campaign = await prisma.voucherCampaign.update({
      where: { id },
      data: {
        ...data,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        expirationDate: data.expirationDate ? new Date(data.expirationDate) : undefined,
      },
      include: {
        partner: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    res.json({ data: campaign });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/vouchers/campaigns/:id - Excluir campanha
router.delete('/campaigns/:id', requirePermission('vouchers:delete'), async (req, res, next) => {
  try {
    const { id } = req.params;

    // Verificar se há resgates
    const redemptionsCount = await prisma.voucherRedemption.count({
      where: { campaignId: id },
    });

    if (redemptionsCount > 0) {
      throw new AppError(400, 'Cannot delete campaign with existing redemptions. Deactivate it instead.');
    }

    await prisma.voucherCampaign.delete({
      where: { id },
    });

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// POST /api/vouchers/campaigns/:id/generate-codes - Gerar códigos de voucher
router.post('/campaigns/:id/generate-codes', requirePermission('vouchers:write'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { quantity, prefix } = generateCodesSchema.parse(req.body);

    const campaign = await prisma.voucherCampaign.findUnique({
      where: { id },
    });

    if (!campaign) {
      throw new AppError(404, 'Campaign not found');
    }

    // Gerar códigos únicos
    const codes: string[] = [];
    for (let i = 0; i < quantity; i++) {
      const randomPart = crypto.randomBytes(4).toString('hex').toUpperCase();
      const code = `${prefix}-${randomPart}`;
      codes.push(code);
    }

    // Criar códigos no banco
    const createdCodes = await prisma.voucherCode.createMany({
      data: codes.map(code => ({
        campaignId: id,
        code,
        status: 'AVAILABLE',
        expiresAt: campaign.expirationDate,
      })),
      skipDuplicates: true,
    });

    // Atualizar estoque disponível
    await prisma.voucherCampaign.update({
      where: { id },
      data: {
        availableStock: {
          increment: createdCodes.count,
        },
        totalStock: {
          increment: createdCodes.count,
        },
      },
    });

    res.status(201).json({
      data: {
        generated: createdCodes.count,
        codes: codes.slice(0, 10), // Retornar apenas os primeiros 10 como exemplo
      },
    });
  } catch (error) {
    next(error);
  }
});

// ============================================
// PUBLIC/CLIENT ROUTES
// ============================================

// GET /api/vouchers/available - Listar vouchers disponíveis para o cliente
router.get('/available', async (req, res, next) => {
  try {
    const { category } = req.query;

    const campaigns = await prisma.voucherCampaign.findMany({
      where: {
        isActive: true,
        availableStock: { gt: 0 },
        OR: [
          { expirationDate: null },
          { expirationDate: { gte: new Date() } },
        ],
        startDate: { lte: new Date() },
        ...(category && { category: String(category) }),
      },
      include: {
        partner: {
          select: {
            id: true,
            name: true,
            tradeName: true,
            logo: true,
          },
        },
      },
      orderBy: [
        { featured: 'desc' },
        { createdAt: 'desc' },
      ],
    });

    // Não expor informações sensíveis
    const publicCampaigns = campaigns.map(c => ({
      id: c.id,
      title: c.title,
      description: c.description,
      rules: c.rules,
      costInVbrz: c.costInVbrz,
      originalValue: c.originalValue,
      discountPercentage: c.discountPercentage,
      settlementType: c.settlementType, // Cliente pode ver se é BURN ou não
      availableStock: c.availableStock,
      maxPerUser: c.maxPerUser,
      minVbrzBalance: c.minVbrzBalance,
      expirationDate: c.expirationDate,
      bannerImage: c.bannerImage,
      thumbnailImage: c.thumbnailImage,
      category: c.category,
      featured: c.featured,
      partner: c.partner,
    }));

    res.json({ data: publicCampaigns });
  } catch (error) {
    next(error);
  }
});

// POST /api/vouchers/redeem - Resgatar voucher (após transação blockchain)
router.post('/redeem', async (req, res, next) => {
  try {
    const { campaignId, userWalletAddress, txHash } = redeemVoucherSchema.parse(req.body);
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError(401, 'Authentication required');
    }

    // Verificar se a campanha existe e está ativa
    const campaign = await prisma.voucherCampaign.findUnique({
      where: { id: campaignId },
    });

    if (!campaign) {
      throw new AppError(404, 'Campaign not found');
    }

    if (!campaign.isActive) {
      throw new AppError(400, 'Campaign is not active');
    }

    if (campaign.availableStock <= 0) {
      throw new AppError(400, 'No vouchers available');
    }

    if (campaign.expirationDate && campaign.expirationDate < new Date()) {
      throw new AppError(400, 'Campaign has expired');
    }

    // Verificar limite por usuário
    const userRedemptions = await prisma.voucherRedemption.count({
      where: {
        campaignId,
        userId,
      },
    });

    if (userRedemptions >= campaign.maxPerUser) {
      throw new AppError(400, `You have reached the maximum redemptions (${campaign.maxPerUser}) for this campaign`);
    }

    // Verificar se txHash já foi usado
    const existingRedemption = await prisma.voucherRedemption.findUnique({
      where: { txHash },
    });

    if (existingRedemption) {
      throw new AppError(400, 'This transaction has already been used');
    }

    // Pegar um código disponível
    const availableCode = await prisma.voucherCode.findFirst({
      where: {
        campaignId,
        status: 'AVAILABLE',
      },
    });

    if (!availableCode) {
      throw new AppError(400, 'No voucher codes available');
    }

    // Determinar endereço de destino
    const destinationAddress = campaign.settlementType === 'BURN'
      ? DEAD_ADDRESS
      : campaign.partnerWalletAddress || DEAD_ADDRESS;

    // Criar a redenção e atualizar o código em uma transação
    const result = await prisma.$transaction(async (tx) => {
      // Atualizar código
      const updatedCode = await tx.voucherCode.update({
        where: { id: availableCode.id },
        data: {
          status: 'REDEEMED',
          redeemedById: userId,
          redeemedAt: new Date(),
        },
      });

      // Criar redemption
      const redemption = await tx.voucherRedemption.create({
        data: {
          campaignId,
          voucherCodeId: availableCode.id,
          userId,
          userWalletAddress,
          txHash,
          vbrzAmount: campaign.costInVbrz,
          settlementType: campaign.settlementType,
          destinationAddress,
          txStatus: 'pending',
        },
      });

      // Decrementar estoque
      await tx.voucherCampaign.update({
        where: { id: campaignId },
        data: {
          availableStock: {
            decrement: 1,
          },
        },
      });

      return { redemption, code: updatedCode };
    });

    // IMPORTANTE: O código do voucher só é revelado após o registro da transação
    res.status(201).json({
      data: {
        redemptionId: result.redemption.id,
        voucherCode: result.code.code, // Revelar código após transação registrada
        status: 'pending_confirmation',
        message: 'Voucher reserved. Awaiting blockchain confirmation.',
      },
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/vouchers/confirm - Confirmar transação blockchain
router.post('/confirm', async (req, res, next) => {
  try {
    const { redemptionId, blockNumber } = confirmRedemptionSchema.parse(req.body);

    const redemption = await prisma.voucherRedemption.update({
      where: { id: redemptionId },
      data: {
        txStatus: 'confirmed',
        blockNumber,
        txConfirmedAt: new Date(),
      },
      include: {
        voucherCode: true,
        campaign: {
          include: {
            partner: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    res.json({
      data: {
        redemptionId: redemption.id,
        voucherCode: redemption.voucherCode.code,
        status: 'confirmed',
        campaign: {
          title: redemption.campaign.title,
          partner: redemption.campaign.partner.name,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/vouchers/my-vouchers - Meus vouchers resgatados
router.get('/my-vouchers', async (req, res, next) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError(401, 'Authentication required');
    }

    const redemptions = await prisma.voucherRedemption.findMany({
      where: { userId },
      include: {
        voucherCode: true,
        campaign: {
          include: {
            partner: {
              select: {
                name: true,
                tradeName: true,
                logo: true,
              },
            },
          },
        },
      },
      orderBy: { redeemedAt: 'desc' },
    });

    res.json({
      data: redemptions.map(r => ({
        id: r.id,
        voucherCode: r.txStatus === 'confirmed' ? r.voucherCode.code : 'Aguardando confirmação...',
        campaign: {
          id: r.campaign.id,
          title: r.campaign.title,
          description: r.campaign.description,
          rules: r.campaign.rules,
          partner: r.campaign.partner,
        },
        vbrzPaid: r.vbrzAmount,
        settlementType: r.settlementType,
        txHash: r.txHash,
        txStatus: r.txStatus,
        redeemedAt: r.redeemedAt,
        usedAt: r.usedAt,
      })),
    });
  } catch (error) {
    next(error);
  }
});

// ============================================
// STATS
// ============================================

// GET /api/vouchers/stats - Estatísticas de vouchers
router.get('/stats', requirePermission('vouchers:read'), async (_req, res, next) => {
  try {
    const [
      totalCampaigns,
      activeCampaigns,
      totalRedemptions,
      confirmedRedemptions,
      burnRedemptions,
      transferRedemptions,
    ] = await Promise.all([
      prisma.voucherCampaign.count(),
      prisma.voucherCampaign.count({ where: { isActive: true } }),
      prisma.voucherRedemption.count(),
      prisma.voucherRedemption.count({ where: { txStatus: 'confirmed' } }),
      prisma.voucherRedemption.count({ where: { settlementType: 'BURN' } }),
      prisma.voucherRedemption.count({ where: { settlementType: 'PARTNER_WALLET' } }),
    ]);

    // Total de VBRz queimado e transferido
    const burnedVbrz = await prisma.voucherRedemption.aggregate({
      where: { settlementType: 'BURN', txStatus: 'confirmed' },
      _sum: { vbrzAmount: true },
    });

    const transferredVbrz = await prisma.voucherRedemption.aggregate({
      where: { settlementType: 'PARTNER_WALLET', txStatus: 'confirmed' },
      _sum: { vbrzAmount: true },
    });

    res.json({
      data: {
        campaigns: {
          total: totalCampaigns,
          active: activeCampaigns,
        },
        redemptions: {
          total: totalRedemptions,
          confirmed: confirmedRedemptions,
          pending: totalRedemptions - confirmedRedemptions,
        },
        tokenomics: {
          burnRedemptions,
          transferRedemptions,
          totalBurnedVbrz: burnedVbrz._sum.vbrzAmount || 0,
          totalTransferredVbrz: transferredVbrz._sum.vbrzAmount || 0,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
