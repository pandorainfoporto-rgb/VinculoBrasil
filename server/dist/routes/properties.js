// ============================================
// PROPERTIES ROUTES
// ============================================
import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../middleware/error-handler.js';
import { requirePermission } from '../middleware/auth.js';
const router = Router();
// ============================================
// PUBLIC ROUTES (No auth required)
// ============================================
// List properties for landing page (public, no auth)
// Ordenação: patrocinados primeiro (isPromoted=true, priorityScore desc), depois os demais
router.get('/public', async (req, res, next) => {
    try {
        const { page = '1', limit = '20', state, city, type, minPrice, maxPrice, bedrooms, petFriendly } = req.query;
        const where = {
            status: 'AVAILABLE', // Apenas imóveis disponíveis
        };
        if (state)
            where.state = state;
        if (city)
            where.city = { contains: city, mode: 'insensitive' };
        if (type)
            where.type = type;
        if (bedrooms)
            where.bedrooms = { gte: parseInt(bedrooms) };
        if (petFriendly === 'true')
            where.petFriendly = true;
        if (minPrice || maxPrice) {
            where.rentValue = {};
            if (minPrice)
                where.rentValue.gte = parseFloat(minPrice);
            if (maxPrice)
                where.rentValue.lte = parseFloat(maxPrice);
        }
        const [properties, total] = await Promise.all([
            prisma.property.findMany({
                where,
                include: {
                    images: { take: 3, orderBy: { order: 'asc' } },
                    agency: {
                        select: {
                            id: true,
                            name: true,
                            slug: true,
                            logoUrl: true
                        }
                    },
                },
                skip: (parseInt(page) - 1) * parseInt(limit),
                take: parseInt(limit),
                // Ordenação: patrocinados primeiro, depois por priorityScore e data de criação
                orderBy: [
                    { isPromoted: 'desc' },
                    { priorityScore: 'desc' },
                    { createdAt: 'desc' },
                ],
            }),
            prisma.property.count({ where }),
        ]);
        // Formatar dados para o frontend (remover dados sensíveis do owner)
        const formattedProperties = properties.map((p) => ({
            id: p.id,
            title: p.title,
            description: p.description,
            type: p.type,
            status: p.status,
            // Endereço
            street: p.street,
            number: p.number,
            neighborhood: p.neighborhood,
            city: p.city,
            state: p.state,
            zipCode: p.zipCode,
            latitude: p.latitude ? parseFloat(p.latitude.toString()) : null,
            longitude: p.longitude ? parseFloat(p.longitude.toString()) : null,
            // Características
            area: p.area ? parseFloat(p.area.toString()) : null,
            bedrooms: p.bedrooms,
            bathrooms: p.bathrooms,
            parkingSpaces: p.parkingSpaces,
            furnished: p.furnished,
            petFriendly: p.petFriendly,
            // Valores
            rentValue: parseFloat(p.rentValue.toString()),
            condoFee: p.condoFee ? parseFloat(p.condoFee.toString()) : 0,
            iptuValue: p.iptuValue ? parseFloat(p.iptuValue.toString()) : 0,
            // Imagens
            images: p.images.map((img) => ({
                id: img.id,
                url: img.url,
                caption: img.caption,
            })),
            // Agência (se tiver)
            agency: p.agency ? {
                id: p.agency.id,
                name: p.agency.name,
                slug: p.agency.slug,
                logoUrl: p.agency.logoUrl,
            } : null,
            // Destaque/Patrocinado
            isPromoted: p.isPromoted,
            promotedUntil: p.promotedUntil,
            priorityScore: p.priorityScore,
            // Datas
            createdAt: p.createdAt,
        }));
        res.json({
            properties: formattedProperties,
            total,
            page: parseInt(page),
            totalPages: Math.ceil(total / parseInt(limit)),
        });
    }
    catch (error) {
        next(error);
    }
});
// Get single property for landing page (public, no auth)
router.get('/public/:id', async (req, res, next) => {
    try {
        const property = await prisma.property.findUnique({
            where: { id: req.params.id },
            include: {
                images: { orderBy: { order: 'asc' } },
                agency: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        logoUrl: true,
                        phone: true,
                        whatsapp: true,
                    }
                },
            },
        });
        if (!property || property.status !== 'AVAILABLE') {
            throw new AppError(404, 'Imóvel não encontrado');
        }
        // Incrementar contador de cliques para CPC
        await prisma.property.update({
            where: { id: req.params.id },
            data: { clicksCount: { increment: 1 } },
        });
        res.json({
            id: property.id,
            title: property.title,
            description: property.description,
            type: property.type,
            status: property.status,
            street: property.street,
            number: property.number,
            neighborhood: property.neighborhood,
            city: property.city,
            state: property.state,
            zipCode: property.zipCode,
            latitude: property.latitude ? parseFloat(property.latitude.toString()) : null,
            longitude: property.longitude ? parseFloat(property.longitude.toString()) : null,
            area: property.area ? parseFloat(property.area.toString()) : null,
            bedrooms: property.bedrooms,
            bathrooms: property.bathrooms,
            parkingSpaces: property.parkingSpaces,
            furnished: property.furnished,
            petFriendly: property.petFriendly,
            rentValue: parseFloat(property.rentValue.toString()),
            condoFee: property.condoFee ? parseFloat(property.condoFee.toString()) : 0,
            iptuValue: property.iptuValue ? parseFloat(property.iptuValue.toString()) : 0,
            images: property.images.map((img) => ({
                id: img.id,
                url: img.url,
                caption: img.caption,
            })),
            agency: property.agency,
            isPromoted: property.isPromoted,
            createdAt: property.createdAt,
        });
    }
    catch (error) {
        next(error);
    }
});
// ============================================
// PROTECTED ROUTES (Auth required)
// ============================================
// List properties
router.get('/', requirePermission('properties.view'), async (req, res, next) => {
    try {
        const { page = '1', limit = '10', status, type, city } = req.query;
        const where = {};
        if (status)
            where.status = status;
        if (type)
            where.type = type;
        if (city)
            where.city = { contains: city, mode: 'insensitive' };
        const [properties, total] = await Promise.all([
            prisma.property.findMany({
                where,
                include: {
                    owner: { select: { id: true, name: true, email: true } },
                    images: { take: 1, orderBy: { order: 'asc' } },
                    _count: { select: { contracts: true, inspections: true } },
                },
                skip: (parseInt(page) - 1) * parseInt(limit),
                take: parseInt(limit),
                orderBy: { createdAt: 'desc' },
            }),
            prisma.property.count({ where }),
        ]);
        res.json({
            properties,
            total,
            page: parseInt(page),
            totalPages: Math.ceil(total / parseInt(limit)),
        });
    }
    catch (error) {
        next(error);
    }
});
// Get property by ID
router.get('/:id', requirePermission('properties.view'), async (req, res, next) => {
    try {
        const property = await prisma.property.findUnique({
            where: { id: req.params.id },
            include: {
                owner: { select: { id: true, name: true, email: true, phone: true } },
                images: { orderBy: { order: 'asc' } },
                inspections: { orderBy: { scheduledAt: 'desc' }, take: 5 },
                contracts: {
                    orderBy: { createdAt: 'desc' },
                    include: { nft: true },
                },
            },
        });
        if (!property) {
            throw new AppError(404, 'Property not found');
        }
        res.json(property);
    }
    catch (error) {
        next(error);
    }
});
// Create property
router.post('/', requirePermission('properties.create'), async (req, res, next) => {
    try {
        const schema = z.object({
            ownerId: z.string().uuid(),
            title: z.string().min(5),
            description: z.string().optional(),
            type: z.enum(['APARTMENT', 'HOUSE', 'COMMERCIAL', 'LAND', 'STUDIO', 'LOFT', 'PENTHOUSE']),
            street: z.string(),
            number: z.string(),
            complement: z.string().optional(),
            neighborhood: z.string(),
            city: z.string(),
            state: z.string(),
            zipCode: z.string(),
            area: z.number().optional(),
            bedrooms: z.number().optional(),
            bathrooms: z.number().optional(),
            parkingSpaces: z.number().optional(),
            floor: z.number().optional(),
            furnished: z.boolean().optional(),
            petFriendly: z.boolean().optional(),
            rentValue: z.number().positive(),
            condoFee: z.number().optional(),
            iptuValue: z.number().optional(),
        });
        const data = schema.parse(req.body);
        const property = await prisma.property.create({
            data,
            include: { owner: { select: { id: true, name: true } } },
        });
        res.status(201).json(property);
    }
    catch (error) {
        next(error);
    }
});
// Update property
router.patch('/:id', requirePermission('properties.update'), async (req, res, next) => {
    try {
        const property = await prisma.property.update({
            where: { id: req.params.id },
            data: req.body,
        });
        res.json(property);
    }
    catch (error) {
        next(error);
    }
});
// Delete property
router.delete('/:id', requirePermission('properties.delete'), async (req, res, next) => {
    try {
        await prisma.property.delete({
            where: { id: req.params.id },
        });
        res.json({ message: 'Property deleted successfully' });
    }
    catch (error) {
        next(error);
    }
});
// Add images
router.post('/:id/images', requirePermission('properties.update'), async (req, res, next) => {
    try {
        const { images } = req.body;
        const created = await prisma.propertyImage.createMany({
            data: images.map((img, i) => ({
                propertyId: req.params.id,
                url: img.url,
                caption: img.caption,
                order: i,
            })),
        });
        res.status(201).json({ count: created.count });
    }
    catch (error) {
        next(error);
    }
});
export default router;
//# sourceMappingURL=properties.js.map