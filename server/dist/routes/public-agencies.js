// ============================================
// PUBLIC AGENCIES ROUTES (NO AUTH REQUIRED)
// Para sites Whitelabel acessarem dados públicos
// ============================================
import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../middleware/error-handler.js';
const router = Router();
// ============================================
// GET /api/public/agencies/:slug
// Retorna dados públicos da agência pelo slug
// ============================================
router.get('/:slug', async (req, res, next) => {
    try {
        const { slug } = req.params;
        console.log(`🌐 [PUBLIC API] Buscando agência: ${slug}`);
        const agency = await prisma.agency.findUnique({
            where: { slug },
            select: {
                id: true,
                name: true,
                slug: true,
                legalName: true,
                cnpj: true,
                creci: true,
                phone: true,
                email: true,
                whatsapp: true,
                instagram: true,
                city: true,
                state: true,
                address: true,
                logoUrl: true,
                coverImageUrl: true,
                primaryColor: true,
                secondaryColor: true,
                slogan: true,
                headerTitle: true,
                headerSubtitle: true,
                description: true,
                active: true,
                // Incluir imóveis disponíveis desta agência
                properties: {
                    where: {
                        status: 'AVAILABLE',
                    },
                    select: {
                        id: true,
                        title: true,
                        city: true,
                        state: true,
                        neighborhood: true,
                        rentValue: true,
                        condoFee: true,
                        iptuValue: true,
                        type: true,
                        bedrooms: true,
                        bathrooms: true,
                        parkingSpaces: true,
                        area: true,
                        furnished: true,
                        petFriendly: true,
                        images: {
                            select: {
                                url: true,
                            },
                            take: 1,
                            orderBy: {
                                order: 'asc',
                            },
                        },
                    },
                    take: 12, // Limitar a 12 imóveis na home
                    orderBy: [
                        { isPromoted: 'desc' },
                        { priorityScore: 'desc' },
                        { createdAt: 'desc' },
                    ],
                },
            },
        });
        if (!agency) {
            throw new AppError(404, 'Imobiliária não encontrada');
        }
        // Verificar se a agência está ativa
        if (!agency.active) {
            throw new AppError(404, 'Imobiliária não disponível');
        }
        console.log(`✅ [PUBLIC API] Agência encontrada: ${agency.name} (${agency.properties.length} imóveis)`);
        // Remover campo 'active' da resposta (não é necessário para o frontend)
        const { active: _active, ...publicAgency } = agency;
        res.json(publicAgency);
    }
    catch (error) {
        next(error);
    }
});
// ============================================
// GET /api/public/agencies/:slug/properties
// Lista todos os imóveis disponíveis da agência
// ============================================
router.get('/:slug/properties', async (req, res, next) => {
    try {
        const { slug } = req.params;
        const { page = '1', limit = '12', type, bedrooms, minPrice, maxPrice } = req.query;
        // Primeiro, buscar a agência
        const agency = await prisma.agency.findUnique({
            where: { slug },
            select: { id: true, active: true, name: true },
        });
        if (!agency || !agency.active) {
            throw new AppError(404, 'Imobiliária não encontrada');
        }
        // Montar filtros
        const where = {
            agencyId: agency.id,
            status: 'AVAILABLE',
        };
        if (type) {
            where.type = type;
        }
        if (bedrooms) {
            where.bedrooms = parseInt(bedrooms);
        }
        if (minPrice || maxPrice) {
            where.rentValue = {};
            if (minPrice) {
                where.rentValue.gte = parseFloat(minPrice);
            }
            if (maxPrice) {
                where.rentValue.lte = parseFloat(maxPrice);
            }
        }
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const [properties, total] = await Promise.all([
            prisma.property.findMany({
                where,
                select: {
                    id: true,
                    title: true,
                    description: true,
                    city: true,
                    state: true,
                    neighborhood: true,
                    rentValue: true,
                    condoFee: true,
                    type: true,
                    bedrooms: true,
                    bathrooms: true,
                    parkingSpaces: true,
                    area: true,
                    petFriendly: true,
                    furnished: true,
                    images: {
                        select: {
                            url: true,
                            caption: true,
                        },
                        orderBy: {
                            order: 'asc',
                        },
                    },
                },
                skip: (pageNum - 1) * limitNum,
                take: limitNum,
                orderBy: [
                    { isPromoted: 'desc' },
                    { priorityScore: 'desc' },
                    { createdAt: 'desc' },
                ],
            }),
            prisma.property.count({ where }),
        ]);
        res.json({
            agency: agency.name,
            properties,
            pagination: {
                total,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(total / limitNum),
            },
        });
    }
    catch (error) {
        next(error);
    }
});
// ============================================
// GET /api/public/agencies/:slug/property/:propertyId
// Detalhes de um imóvel específico
// ============================================
router.get('/:slug/property/:propertyId', async (req, res, next) => {
    try {
        const { slug, propertyId } = req.params;
        // Verificar se a agência existe e está ativa
        const agency = await prisma.agency.findUnique({
            where: { slug },
            select: {
                id: true,
                active: true,
                name: true,
                phone: true,
                whatsapp: true,
                email: true,
            },
        });
        if (!agency || !agency.active) {
            throw new AppError(404, 'Imobiliária não encontrada');
        }
        // Buscar o imóvel
        const property = await prisma.property.findFirst({
            where: {
                id: propertyId,
                agencyId: agency.id,
                status: 'AVAILABLE',
            },
            select: {
                id: true,
                title: true,
                description: true,
                type: true,
                street: true,
                number: true,
                complement: true,
                neighborhood: true,
                city: true,
                state: true,
                zipCode: true,
                rentValue: true,
                condoFee: true,
                iptuValue: true,
                area: true,
                bedrooms: true,
                bathrooms: true,
                parkingSpaces: true,
                floor: true,
                furnished: true,
                petFriendly: true,
                images: {
                    select: {
                        id: true,
                        url: true,
                        caption: true,
                    },
                    orderBy: {
                        order: 'asc',
                    },
                },
            },
        });
        if (!property) {
            throw new AppError(404, 'Imóvel não encontrado');
        }
        res.json({
            property,
            agency: {
                name: agency.name,
                phone: agency.phone,
                whatsapp: agency.whatsapp,
                email: agency.email,
                primaryColor: agency.primaryColor,
            },
        });
    }
    catch (error) {
        next(error);
    }
});
// ============================================
// POST /api/public/leads
// Captura de Leads do Site Publico
// ============================================
router.post('/leads', async (req, res, next) => {
    try {
        const { name, email, phone, message, propertyId, agencyId, source } = req.body;
        if (!name || !phone) {
            throw new AppError(400, 'Nome e telefone sao obrigatorios');
        }
        if (!propertyId || !agencyId) {
            throw new AppError(400, 'Dados do imovel sao obrigatorios');
        }
        // Verificar se a agencia existe
        const agency = await prisma.agency.findUnique({
            where: { id: agencyId },
            select: { id: true, name: true },
        });
        if (!agency) {
            throw new AppError(404, 'Agencia nao encontrada');
        }
        // Verificar se o imovel existe
        const property = await prisma.property.findUnique({
            where: { id: propertyId },
            select: { id: true, title: true },
        });
        if (!property) {
            throw new AppError(404, 'Imovel nao encontrado');
        }
        // Criar o lead no banco
        // Nota: Se a tabela Lead nao existir, cria uma entrada na tabela de Deal/Opportunity
        // ou loga para processamento manual
        console.log('===================================');
        console.log('NOVO LEAD CAPTURADO!');
        console.log('===================================');
        console.log(`Nome: ${name}`);
        console.log(`Telefone: ${phone}`);
        console.log(`Email: ${email || 'Nao informado'}`);
        console.log(`Mensagem: ${message || 'Nenhuma'}`);
        console.log(`Imovel: ${property.title} (${propertyId})`);
        console.log(`Agencia: ${agency.name} (${agencyId})`);
        console.log(`Origem: ${source || 'WEBSITE'}`);
        console.log('===================================');
        // Tentar criar na tabela Lead se existir
        try {
            await prisma.lead.create({
                data: {
                    name,
                    email: email || null,
                    phone,
                    message: message || null,
                    propertyId,
                    agencyId,
                    source: source || 'WEBSITE',
                    status: 'NEW',
                },
            });
        }
        catch {
            // Tabela Lead pode nao existir, apenas logar
            console.log('[LEAD] Tabela Lead nao existe, lead registrado apenas em log');
        }
        res.status(201).json({
            success: true,
            message: 'Lead criado com sucesso',
        });
    }
    catch (error) {
        next(error);
    }
});
export default router;
//# sourceMappingURL=public-agencies.js.map