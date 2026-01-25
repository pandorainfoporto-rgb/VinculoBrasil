// ============================================
// MARKETPLACE ROUTES - Gestao de Parceiros e Produtos
// ============================================
import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../middleware/error-handler.js';
import { requirePermission } from '../middleware/auth.js';
const router = Router();
// ============================================
// SCHEMAS
// ============================================
const partnerSchema = z.object({
    name: z.string().min(2),
    tradeName: z.string().optional(),
    cnpj: z.string().min(14).max(18),
    email: z.string().email(),
    phone: z.string().optional(),
    website: z.string().url().optional().or(z.literal('')),
    logo: z.string().optional(),
    description: z.string().optional(),
    street: z.string().optional(),
    number: z.string().optional(),
    complement: z.string().optional(),
    neighborhood: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional(),
    defaultCommissionRate: z.number().min(0).max(1).default(0.10),
    isActive: z.boolean().default(true),
});
const marketplaceItemSchema = z.object({
    partnerId: z.string().uuid(),
    title: z.string().min(2),
    description: z.string().optional(),
    category: z.string().min(2),
    basePrice: z.number().positive(),
    images: z.array(z.string()).default([]),
    negotiatedCommission: z.number().min(0).max(1).optional(),
    acceptsVbrz: z.boolean().default(false),
    acceptsCrypto: z.boolean().default(false),
    acceptsPix: z.boolean().default(true),
    acceptsCard: z.boolean().default(true),
    vinculoClientDiscount: z.number().min(0).max(100).default(0),
    featured: z.boolean().default(false),
    displayOrder: z.number().int().default(0),
});
const approvalActionSchema = z.object({
    action: z.enum(['approve', 'reject', 'request_changes']),
    feedback: z.string().optional(),
});
const updatePaymentFlagsSchema = z.object({
    acceptsVbrz: z.boolean().optional(),
    acceptsCrypto: z.boolean().optional(),
    acceptsPix: z.boolean().optional(),
    acceptsCard: z.boolean().optional(),
});
// ============================================
// PARTNERS ROUTES
// ============================================
// GET /api/marketplace/partners - Listar todos os parceiros
router.get('/partners', requirePermission('marketplace:read'), async (req, res, next) => {
    try {
        const { search, isActive } = req.query;
        const partners = await prisma.partner.findMany({
            where: {
                ...(search && {
                    OR: [
                        { name: { contains: String(search), mode: 'insensitive' } },
                        { cnpj: { contains: String(search) } },
                        { email: { contains: String(search), mode: 'insensitive' } },
                    ],
                }),
                ...(isActive !== undefined && { isActive: isActive === 'true' }),
            },
            include: {
                _count: {
                    select: { items: true },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        res.json({ data: partners });
    }
    catch (error) {
        next(error);
    }
});
// GET /api/marketplace/partners/:id - Obter parceiro por ID
router.get('/partners/:id', requirePermission('marketplace:read'), async (req, res, next) => {
    try {
        const { id } = req.params;
        const partner = await prisma.partner.findUnique({
            where: { id },
            include: {
                items: {
                    orderBy: { createdAt: 'desc' },
                },
            },
        });
        if (!partner) {
            throw new AppError(404, 'Partner not found');
        }
        res.json({ data: partner });
    }
    catch (error) {
        next(error);
    }
});
// POST /api/marketplace/partners - Criar novo parceiro
router.post('/partners', requirePermission('marketplace:write'), async (req, res, next) => {
    try {
        const data = partnerSchema.parse(req.body);
        // Verificar se CNPJ ja existe
        const existing = await prisma.partner.findUnique({
            where: { cnpj: data.cnpj },
        });
        if (existing) {
            throw new AppError(409, 'Partner with this CNPJ already exists');
        }
        const partner = await prisma.partner.create({
            data: {
                ...data,
                website: data.website || null,
            },
        });
        res.status(201).json({ data: partner });
    }
    catch (error) {
        next(error);
    }
});
// PUT /api/marketplace/partners/:id - Atualizar parceiro
router.put('/partners/:id', requirePermission('marketplace:write'), async (req, res, next) => {
    try {
        const { id } = req.params;
        const data = partnerSchema.partial().parse(req.body);
        const partner = await prisma.partner.update({
            where: { id },
            data: {
                ...data,
                website: data.website || null,
            },
        });
        res.json({ data: partner });
    }
    catch (error) {
        next(error);
    }
});
// DELETE /api/marketplace/partners/:id - Excluir parceiro
router.delete('/partners/:id', requirePermission('marketplace:delete'), async (req, res, next) => {
    try {
        const { id } = req.params;
        await prisma.partner.delete({
            where: { id },
        });
        res.json({ success: true });
    }
    catch (error) {
        next(error);
    }
});
// ============================================
// MARKETPLACE ITEMS ROUTES
// ============================================
// GET /api/marketplace/items - Listar todos os itens
router.get('/items', requirePermission('marketplace:read'), async (req, res, next) => {
    try {
        const { status, category, partnerId, search } = req.query;
        const items = await prisma.marketplaceItem.findMany({
            where: {
                ...(status && { status: String(status) }),
                ...(category && { category: String(category) }),
                ...(partnerId && { partnerId: String(partnerId) }),
                ...(search && {
                    OR: [
                        { title: { contains: String(search), mode: 'insensitive' } },
                        { description: { contains: String(search), mode: 'insensitive' } },
                    ],
                }),
            },
            include: {
                partner: {
                    select: {
                        id: true,
                        name: true,
                        cnpj: true,
                        defaultCommissionRate: true,
                    },
                },
            },
            orderBy: { submittedAt: 'desc' },
        });
        res.json({ data: items });
    }
    catch (error) {
        next(error);
    }
});
// GET /api/marketplace/items/pending - Listar itens pendentes de aprovacao
router.get('/items/pending', requirePermission('marketplace:read'), async (req, res, next) => {
    try {
        const items = await prisma.marketplaceItem.findMany({
            where: {
                status: { in: ['PENDING', 'CHANGES_REQUESTED'] },
            },
            include: {
                partner: {
                    select: {
                        id: true,
                        name: true,
                        cnpj: true,
                        defaultCommissionRate: true,
                    },
                },
            },
            orderBy: { submittedAt: 'asc' },
        });
        res.json({ data: items });
    }
    catch (error) {
        next(error);
    }
});
// GET /api/marketplace/items/:id - Obter item por ID
router.get('/items/:id', requirePermission('marketplace:read'), async (req, res, next) => {
    try {
        const { id } = req.params;
        const item = await prisma.marketplaceItem.findUnique({
            where: { id },
            include: {
                partner: true,
            },
        });
        if (!item) {
            throw new AppError(404, 'Marketplace item not found');
        }
        res.json({ data: item });
    }
    catch (error) {
        next(error);
    }
});
// POST /api/marketplace/items - Criar novo item
router.post('/items', requirePermission('marketplace:write'), async (req, res, next) => {
    try {
        const data = marketplaceItemSchema.parse(req.body);
        // Verificar se parceiro existe
        const partner = await prisma.partner.findUnique({
            where: { id: data.partnerId },
        });
        if (!partner) {
            throw new AppError(404, 'Partner not found');
        }
        const item = await prisma.marketplaceItem.create({
            data: {
                ...data,
                basePrice: data.basePrice,
                status: 'PENDING',
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
        res.status(201).json({ data: item });
    }
    catch (error) {
        next(error);
    }
});
// PUT /api/marketplace/items/:id - Atualizar item
router.put('/items/:id', requirePermission('marketplace:write'), async (req, res, next) => {
    try {
        const { id } = req.params;
        const data = marketplaceItemSchema.partial().parse(req.body);
        const item = await prisma.marketplaceItem.update({
            where: { id },
            data: {
                ...data,
                basePrice: data.basePrice,
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
        res.json({ data: item });
    }
    catch (error) {
        next(error);
    }
});
// POST /api/marketplace/items/:id/approval - Aprovar/Rejeitar/Solicitar alteracao
router.post('/items/:id/approval', requirePermission('marketplace:approve'), async (req, res, next) => {
    try {
        const { id } = req.params;
        const { action, feedback } = approvalActionSchema.parse(req.body);
        const existingItem = await prisma.marketplaceItem.findUnique({
            where: { id },
        });
        if (!existingItem) {
            throw new AppError(404, 'Marketplace item not found');
        }
        let updateData;
        switch (action) {
            case 'approve':
                updateData = {
                    status: 'APPROVED',
                    adminFeedback: null,
                    approvedAt: new Date(),
                    approvedBy: req.user?.id,
                };
                break;
            case 'reject':
                updateData = {
                    status: 'REJECTED',
                    adminFeedback: feedback || null,
                    approvedAt: null,
                    approvedBy: null,
                };
                break;
            case 'request_changes':
                if (!feedback) {
                    throw new AppError(400, 'Feedback is required when requesting changes');
                }
                updateData = {
                    status: 'CHANGES_REQUESTED',
                    adminFeedback: feedback,
                    approvedAt: null,
                    approvedBy: null,
                };
                break;
        }
        const item = await prisma.marketplaceItem.update({
            where: { id },
            data: updateData,
            include: {
                partner: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });
        res.json({ data: item });
    }
    catch (error) {
        next(error);
    }
});
// PATCH /api/marketplace/items/:id/payment-flags - Atualizar flags de pagamento
router.patch('/items/:id/payment-flags', requirePermission('marketplace:write'), async (req, res, next) => {
    try {
        const { id } = req.params;
        const data = updatePaymentFlagsSchema.parse(req.body);
        const item = await prisma.marketplaceItem.update({
            where: { id },
            data,
            include: {
                partner: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });
        res.json({ data: item });
    }
    catch (error) {
        next(error);
    }
});
// DELETE /api/marketplace/items/:id - Excluir item
router.delete('/items/:id', requirePermission('marketplace:delete'), async (req, res, next) => {
    try {
        const { id } = req.params;
        await prisma.marketplaceItem.delete({
            where: { id },
        });
        res.json({ success: true });
    }
    catch (error) {
        next(error);
    }
});
// ============================================
// STATS E DASHBOARD
// ============================================
// GET /api/marketplace/stats - Estatisticas do marketplace
router.get('/stats', requirePermission('marketplace:read'), async (_req, res, next) => {
    try {
        const [totalPartners, activePartners, totalItems, pendingItems, approvedItems, rejectedItems, changesRequestedItems,] = await Promise.all([
            prisma.partner.count(),
            prisma.partner.count({ where: { isActive: true } }),
            prisma.marketplaceItem.count(),
            prisma.marketplaceItem.count({ where: { status: 'PENDING' } }),
            prisma.marketplaceItem.count({ where: { status: 'APPROVED' } }),
            prisma.marketplaceItem.count({ where: { status: 'REJECTED' } }),
            prisma.marketplaceItem.count({ where: { status: 'CHANGES_REQUESTED' } }),
        ]);
        // Categorias mais populares
        const categoryCounts = await prisma.marketplaceItem.groupBy({
            by: ['category'],
            _count: { id: true },
            orderBy: { _count: { id: 'desc' } },
            take: 5,
        });
        res.json({
            data: {
                partners: {
                    total: totalPartners,
                    active: activePartners,
                },
                items: {
                    total: totalItems,
                    pending: pendingItems,
                    approved: approvedItems,
                    rejected: rejectedItems,
                    changesRequested: changesRequestedItems,
                },
                topCategories: categoryCounts.map(c => ({
                    category: c.category,
                    count: c._count.id,
                })),
            },
        });
    }
    catch (error) {
        next(error);
    }
});
export default router;
//# sourceMappingURL=marketplace.js.map