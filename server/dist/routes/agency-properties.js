// ============================================
// AGENCY PROPERTIES ROUTES (Carteira de Imóveis)
// Gerencia imóveis vinculados à agência
// ============================================
import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../middleware/error-handler.js';
const router = Router();
// ============================================
// LISTAR IMÓVEIS DA AGÊNCIA
// GET /api/agency/properties
// ============================================
router.get('/', async (req, res, next) => {
    try {
        const agencyId = req.user?.agencyId;
        if (!agencyId) {
            throw new AppError(403, 'Acesso restrito a usuários de agências.');
        }
        const { status, search, page = '1', limit = '20' } = req.query;
        // Buscar dados da agência para obter taxa de comissão
        const agency = await prisma.agency.findUnique({
            where: { id: agencyId },
            select: {
                commissionRate: true,
                commissionModel: true,
            },
        });
        // Montar filtros
        const where = {
            agencyId: agencyId,
        };
        if (status) {
            where.status = status;
        }
        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { street: { contains: search, mode: 'insensitive' } },
                { city: { contains: search, mode: 'insensitive' } },
                { neighborhood: { contains: search, mode: 'insensitive' } },
            ];
        }
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const [properties, total] = await Promise.all([
            prisma.property.findMany({
                where,
                include: {
                    owner: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            phone: true,
                            pixKey: true,
                        },
                    },
                    images: {
                        select: { url: true },
                        take: 1,
                        orderBy: { order: 'asc' },
                    },
                    _count: {
                        select: {
                            contracts: true,
                            inspections: true,
                        },
                    },
                },
                orderBy: [
                    { isPromoted: 'desc' },
                    { createdAt: 'desc' },
                ],
                skip: (pageNum - 1) * limitNum,
                take: limitNum,
            }),
            prisma.property.count({ where }),
        ]);
        // Calcular comissão para cada imóvel
        const propertiesWithCommission = properties.map((prop) => {
            const rentValue = Number(prop.rentValue);
            const commissionRate = agency?.commissionRate || 10;
            const commissionModel = agency?.commissionModel || 'DEDUCT_FROM_OWNER';
            // Calcular valor da comissão
            const commissionValue = (rentValue * commissionRate) / 100;
            // Valor que o proprietário recebe
            const ownerValue = commissionModel === 'DEDUCT_FROM_OWNER'
                ? rentValue - commissionValue
                : rentValue;
            // Valor total cobrado do inquilino
            const tenantValue = commissionModel === 'ADD_ON_PRICE'
                ? rentValue + commissionValue
                : rentValue;
            return {
                ...prop,
                rentValue: rentValue,
                // Dados da comissão
                commission: {
                    rate: commissionRate,
                    model: commissionModel,
                    value: commissionValue,
                    ownerReceives: ownerValue,
                    tenantPays: tenantValue,
                },
                // Endereço formatado
                fullAddress: `${prop.street}, ${prop.number}${prop.complement ? ` - ${prop.complement}` : ''}, ${prop.neighborhood}, ${prop.city}/${prop.state}`,
                // Status do anúncio
                isPublished: prop.status === 'AVAILABLE',
                // Thumbnail
                thumbnail: prop.images[0]?.url || null,
            };
        });
        console.log(`🏠 [AGENCY PROPERTIES] Listando ${properties.length} imóveis da agência ${agencyId}`);
        return res.json({
            properties: propertiesWithCommission,
            total,
            page: pageNum,
            totalPages: Math.ceil(total / limitNum),
            agency: {
                commissionRate: agency?.commissionRate || 10,
                commissionModel: agency?.commissionModel || 'DEDUCT_FROM_OWNER',
            },
        });
    }
    catch (error) {
        next(error);
    }
});
// ============================================
// BUSCAR IMÓVEL POR ID
// GET /api/agency/properties/:id
// ============================================
router.get('/:id', async (req, res, next) => {
    try {
        const agencyId = req.user?.agencyId;
        if (!agencyId) {
            throw new AppError(403, 'Acesso restrito a usuários de agências.');
        }
        const property = await prisma.property.findFirst({
            where: {
                id: req.params.id,
                agencyId: agencyId,
            },
            include: {
                owner: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                        pixKey: true,
                        pixKeyType: true,
                    },
                },
                images: {
                    orderBy: { order: 'asc' },
                },
                contracts: {
                    select: {
                        id: true,
                        status: true,
                        tenantName: true,
                        startDate: true,
                        endDate: true,
                        rentValue: true,
                    },
                    orderBy: { createdAt: 'desc' },
                    take: 5,
                },
                inspections: {
                    select: {
                        id: true,
                        type: true,
                        status: true,
                        scheduledAt: true,
                    },
                    orderBy: { scheduledAt: 'desc' },
                    take: 3,
                },
            },
        });
        if (!property) {
            throw new AppError(404, 'Imóvel não encontrado.');
        }
        return res.json(property);
    }
    catch (error) {
        next(error);
    }
});
// ============================================
// CRIAR IMÓVEL
// POST /api/agency/properties
// ============================================
router.post('/', async (req, res, next) => {
    try {
        const agencyId = req.user?.agencyId;
        if (!agencyId) {
            throw new AppError(403, 'Acesso restrito a usuários de agências.');
        }
        const schema = z.object({
            ownerId: z.string().uuid('ID do proprietário inválido'),
            title: z.string().min(3, 'Título deve ter pelo menos 3 caracteres'),
            description: z.string().optional(),
            type: z.enum(['HOUSE', 'APARTMENT', 'COMMERCIAL', 'LAND', 'KITNET', 'LOFT', 'STUDIO', 'FARM', 'WAREHOUSE']),
            // Endereço
            street: z.string().min(3),
            number: z.string().min(1),
            complement: z.string().optional(),
            neighborhood: z.string().min(2),
            city: z.string().min(2),
            state: z.string().length(2),
            zipCode: z.string().min(8),
            // Características
            area: z.number().positive().optional(),
            bedrooms: z.number().int().min(0).optional(),
            bathrooms: z.number().int().min(0).optional(),
            parkingSpaces: z.number().int().min(0).optional(),
            floor: z.number().int().optional(),
            furnished: z.boolean().optional(),
            petFriendly: z.boolean().optional(),
            // Valores
            rentValue: z.number().positive('Valor do aluguel é obrigatório'),
            condoFee: z.number().min(0).optional(),
            iptuValue: z.number().min(0).optional(),
            // Collateral/Garantia
            collateralEnabled: z.boolean().optional().default(false),
            collateralYieldRate: z.number().min(0).max(0.05).optional(), // Até 5% ao mês
            collateralMaxExposure: z.number().positive().optional(),
        });
        const data = schema.parse(req.body);
        // Verificar se o proprietário pertence à agência
        const owner = await prisma.user.findFirst({
            where: {
                id: data.ownerId,
                agencyId: agencyId,
            },
        });
        if (!owner) {
            throw new AppError(400, 'Proprietário não encontrado ou não pertence a esta agência.');
        }
        // Se collateral habilitado, definir status como PENDING_CONSENT
        const collateralStatus = data.collateralEnabled ? 'PENDING_CONSENT' : null;
        const property = await prisma.property.create({
            data: {
                ...data,
                agencyId: agencyId,
                status: 'AVAILABLE',
                collateralStatus,
            },
            include: {
                owner: {
                    select: { name: true, email: true },
                },
            },
        });
        console.log(`✅ [AGENCY PROPERTIES] Imóvel criado: ${property.title} (${property.id})`);
        return res.status(201).json(property);
    }
    catch (error) {
        next(error);
    }
});
// ============================================
// ATUALIZAR IMÓVEL
// PATCH /api/agency/properties/:id
// ============================================
router.patch('/:id', async (req, res, next) => {
    try {
        const agencyId = req.user?.agencyId;
        if (!agencyId) {
            throw new AppError(403, 'Acesso restrito a usuários de agências.');
        }
        // Verificar se o imóvel pertence à agência
        const existingProperty = await prisma.property.findFirst({
            where: {
                id: req.params.id,
                agencyId: agencyId,
            },
        });
        if (!existingProperty) {
            throw new AppError(404, 'Imóvel não encontrado.');
        }
        const schema = z.object({
            title: z.string().min(3).optional(),
            description: z.string().optional(),
            status: z.enum(['AVAILABLE', 'RENTED', 'MAINTENANCE', 'RESERVED', 'INACTIVE']).optional(),
            // Valores
            rentValue: z.number().positive().optional(),
            condoFee: z.number().min(0).optional(),
            iptuValue: z.number().min(0).optional(),
            // Características
            bedrooms: z.number().int().min(0).optional(),
            bathrooms: z.number().int().min(0).optional(),
            parkingSpaces: z.number().int().min(0).optional(),
            furnished: z.boolean().optional(),
            petFriendly: z.boolean().optional(),
            // Promoção
            isPromoted: z.boolean().optional(),
            promotedUntil: z.string().datetime().optional(),
        });
        const data = schema.parse(req.body);
        const property = await prisma.property.update({
            where: { id: req.params.id },
            data: {
                ...data,
                promotedUntil: data.promotedUntil ? new Date(data.promotedUntil) : undefined,
            },
        });
        console.log(`✏️ [AGENCY PROPERTIES] Imóvel atualizado: ${property.title}`);
        return res.json(property);
    }
    catch (error) {
        next(error);
    }
});
// ============================================
// PROMOVER IMÓVEL (Boost/Ads)
// POST /api/agency/properties/:id/promote
// ============================================
router.post('/:id/promote', async (req, res, next) => {
    try {
        const agencyId = req.user?.agencyId;
        if (!agencyId) {
            throw new AppError(403, 'Acesso restrito a usuários de agências.');
        }
        const existingProperty = await prisma.property.findFirst({
            where: {
                id: req.params.id,
                agencyId: agencyId,
            },
        });
        if (!existingProperty) {
            throw new AppError(404, 'Imóvel não encontrado.');
        }
        const schema = z.object({
            days: z.number().int().min(1).max(90).default(7),
            promotionType: z.enum(['FIXED_TIME', 'CPC']).default('FIXED_TIME'),
        });
        const { days, promotionType } = schema.parse(req.body);
        // Calcular data de término
        const promotedUntil = new Date();
        promotedUntil.setDate(promotedUntil.getDate() + days);
        const property = await prisma.property.update({
            where: { id: req.params.id },
            data: {
                isPromoted: true,
                promotedUntil,
                promotionType,
                priorityScore: { increment: 100 },
            },
        });
        console.log(`🚀 [AGENCY PROPERTIES] Imóvel promovido: ${property.title} por ${days} dias`);
        return res.json({
            message: `Imóvel promovido por ${days} dias!`,
            promotedUntil,
            property,
        });
    }
    catch (error) {
        next(error);
    }
});
// ============================================
// ESTATÍSTICAS DA CARTEIRA
// GET /api/agency/properties/stats
// ============================================
router.get('/stats/summary', async (req, res, next) => {
    try {
        const agencyId = req.user?.agencyId;
        if (!agencyId) {
            throw new AppError(403, 'Acesso restrito a usuários de agências.');
        }
        const agency = await prisma.agency.findUnique({
            where: { id: agencyId },
            select: { commissionRate: true },
        });
        const [total, available, rented, promoted, rentSum,] = await Promise.all([
            prisma.property.count({ where: { agencyId } }),
            prisma.property.count({ where: { agencyId, status: 'AVAILABLE' } }),
            prisma.property.count({ where: { agencyId, status: 'RENTED' } }),
            prisma.property.count({ where: { agencyId, isPromoted: true } }),
            prisma.property.aggregate({
                where: { agencyId },
                _sum: { rentValue: true },
            }),
        ]);
        const totalRentValue = Number(rentSum._sum.rentValue || 0);
        const commissionRate = agency?.commissionRate || 10;
        const potentialCommission = (totalRentValue * commissionRate) / 100;
        return res.json({
            total,
            available,
            rented,
            promoted,
            maintenance: total - available - rented,
            totalRentValue,
            commissionRate,
            potentialMonthlyCommission: potentialCommission,
        });
    }
    catch (error) {
        next(error);
    }
});
// ============================================
// ENVIAR PEDIDO DE CONSENTIMENTO COLLATERAL
// POST /api/agency/properties/:id/collateral/request-consent
// ============================================
router.post('/:id/collateral/request-consent', async (req, res, next) => {
    try {
        const agencyId = req.user?.agencyId;
        if (!agencyId) {
            throw new AppError(403, 'Acesso restrito a usuários de agências.');
        }
        const property = await prisma.property.findFirst({
            where: {
                id: req.params.id,
                agencyId: agencyId,
            },
            include: {
                owner: {
                    select: { id: true, name: true, email: true },
                },
            },
        });
        if (!property) {
            throw new AppError(404, 'Imóvel não encontrado.');
        }
        if (!property.collateralEnabled) {
            throw new AppError(400, 'Este imóvel não está habilitado para collateral.');
        }
        if (property.collateralStatus === 'APPROVED' || property.collateralStatus === 'ACTIVE') {
            throw new AppError(400, 'Este imóvel já foi aprovado como garantia.');
        }
        // Atualizar status e data de envio
        await prisma.property.update({
            where: { id: req.params.id },
            data: {
                collateralStatus: 'PENDING_CONSENT',
                collateralConsentSentAt: new Date(),
            },
        });
        // TODO: Enviar email/notificação ao proprietário com link para consentimento
        console.log(`📧 [COLLATERAL] Pedido de consentimento enviado para ${property.owner.email}`);
        return res.json({
            message: 'Pedido de consentimento enviado ao proprietário.',
            propertyId: property.id,
            ownerEmail: property.owner.email,
        });
    }
    catch (error) {
        next(error);
    }
});
// ============================================
// PROPRIETÁRIO ACEITA/REJEITA COLLATERAL
// POST /api/agency/properties/:id/collateral/consent
// ============================================
router.post('/:id/collateral/consent', async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            throw new AppError(401, 'Autenticação necessária.');
        }
        const schema = z.object({
            accept: z.boolean(),
            signature: z.string().optional(), // Hash de assinatura digital
        });
        const { accept, signature } = schema.parse(req.body);
        // Buscar imóvel e verificar se o usuário é o proprietário
        const property = await prisma.property.findFirst({
            where: {
                id: req.params.id,
                ownerId: userId,
            },
        });
        if (!property) {
            throw new AppError(404, 'Imóvel não encontrado ou você não é o proprietário.');
        }
        if (!property.collateralEnabled) {
            throw new AppError(400, 'Este imóvel não está habilitado para collateral.');
        }
        if (property.collateralStatus === 'ACTIVE') {
            throw new AppError(400, 'Este imóvel já está ativo como garantia.');
        }
        const newStatus = accept ? 'APPROVED' : 'REJECTED';
        await prisma.property.update({
            where: { id: req.params.id },
            data: {
                collateralStatus: newStatus,
                collateralConsentAt: accept ? new Date() : null,
                collateralConsentHash: signature || null,
            },
        });
        console.log(`${accept ? '✅' : '❌'} [COLLATERAL] Proprietário ${accept ? 'aceitou' : 'rejeitou'} collateral para imóvel ${property.id}`);
        return res.json({
            message: accept
                ? 'Consentimento registrado! Seu imóvel agora pode ser usado como garantia.'
                : 'Você rejeitou o uso do imóvel como garantia.',
            status: newStatus,
        });
    }
    catch (error) {
        next(error);
    }
});
// ============================================
// LISTAR IMÓVEIS DISPONÍVEIS COMO GARANTIA
// GET /api/agency/properties/collateral/available
// ============================================
router.get('/collateral/available', async (req, res, next) => {
    try {
        const properties = await prisma.property.findMany({
            where: {
                collateralEnabled: true,
                collateralStatus: { in: ['APPROVED', 'ACTIVE'] },
                status: 'RENTED', // Só imóveis alugados podem ser usados como garantia
            },
            select: {
                id: true,
                title: true,
                city: true,
                state: true,
                rentValue: true,
                collateralYieldRate: true,
                collateralMaxExposure: true,
                collateralActiveLoans: true,
                owner: {
                    select: { name: true },
                },
            },
            orderBy: { collateralYieldRate: 'desc' },
        });
        return res.json({ properties });
    }
    catch (error) {
        next(error);
    }
});
export default router;
//# sourceMappingURL=agency-properties.js.map