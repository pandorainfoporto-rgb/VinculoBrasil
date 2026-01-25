// ============================================
// AGENCIES ROUTES
// ============================================
import { Router } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../middleware/error-handler.js';
import { requirePermission } from '../middleware/auth.js';
const router = Router();
// ============================================
// MULTER CONFIG - Memory Storage para uploads
// ============================================
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max
    },
    fileFilter: (_req, file, cb) => {
        const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        }
        else {
            cb(new Error('Tipo de arquivo não permitido. Use JPEG, PNG, WebP ou GIF.'));
        }
    },
});
// Middleware para múltiplos arquivos: logo e cover
const uploadFields = upload.fields([
    { name: 'logo', maxCount: 1 },
    { name: 'cover', maxCount: 1 },
]);
// ============================================
// SCHEMAS DE VALIDAÇÃO
// ============================================
const createAgencySchema = z.object({
    // Dados Empresariais
    name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
    legalName: z.string().optional(), // Razão Social
    slug: z.string().min(2, 'Slug deve ter pelo menos 2 caracteres').regex(/^[a-z0-9-]+$/, 'Slug deve conter apenas letras minúsculas, números e hífens'),
    cnpj: z.string().optional(),
    creci: z.string().optional(), // Registro no Conselho
    // Contato
    phone: z.string().optional(),
    email: z.string().email().optional(),
    // Endereço
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().max(2).optional(),
    zipCode: z.string().optional(),
    // Branding
    primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Cor primária inválida').optional(),
    secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Cor secundária inválida').optional(),
    // Dados do usuário admin
    adminName: z.string().min(2, 'Nome do admin deve ter pelo menos 2 caracteres'),
    adminEmail: z.string().email('Email do admin inválido'),
    adminPassword: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
});
const updateAgencySchema = z.object({
    // Dados Empresariais
    name: z.string().min(2).optional(),
    legalName: z.string().optional(),
    slug: z.string().min(2).regex(/^[a-z0-9-]+$/).optional(),
    cnpj: z.string().optional(),
    creci: z.string().optional(),
    // Contato
    phone: z.string().optional(),
    email: z.string().email().optional(),
    // Endereço
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().max(2).optional(),
    zipCode: z.string().optional(),
    // Branding
    primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
    secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
    slogan: z.string().optional(),
    whatsapp: z.string().optional(),
    instagram: z.string().optional(),
    website: z.string().optional(),
    description: z.string().optional(),
    // Status
    active: z.boolean().optional(),
});
// ============================================
// HELPER: Upload de arquivo (placeholder)
// ============================================
async function uploadFileToStorage(buffer, _filename, _mimetype) {
    // TODO: Implementar upload real para S3/CloudFlare R2/etc
    // Por enquanto, retorna null (sem upload)
    // Quando implementar, retornar a URL do arquivo
    // Exemplo de implementação futura:
    // const key = `agencies/${Date.now()}-${filename}`;
    // await s3Client.putObject({ Bucket, Key: key, Body: buffer, ContentType: mimetype });
    // return `https://cdn.vinculobrasil.com/${key}`;
    if (buffer) {
        // Placeholder: log do tamanho do arquivo
        console.log(`[Upload] Arquivo recebido: ${buffer.length} bytes`);
    }
    return null;
}
// ============================================
// ROUTES
// ============================================
// ============================================
// ROTA DE RESGATE - PÚBLICA (Temporária)
// Acesse: GET /api/agencies/setup-admin-rescue
// ============================================
router.get('/setup-admin-rescue', async (_req, res) => {
    try {
        console.log('[RESCUE] Iniciando criação de admin de resgate...');
        // 1. Buscar ou criar Role de Super Admin
        let superAdminRole = await prisma.role.findFirst({
            where: { slug: 'super-admin' },
        });
        if (!superAdminRole) {
            superAdminRole = await prisma.role.create({
                data: {
                    name: 'Super Admin',
                    slug: 'super-admin',
                    description: 'Administrador Master do Sistema',
                    permissions: ['*'], // Todas as permissões
                    isSystem: true,
                },
            });
            console.log('[RESCUE] Role super-admin criada');
        }
        // 2. Criar Agência
        const agency = await prisma.agency.upsert({
            where: { slug: 'fatto-imoveis' },
            update: {},
            create: {
                name: 'Fatto Imóveis',
                slug: 'fatto-imoveis',
                cnpj: '12.345.678/0001-99',
                primaryColor: '#000000',
                secondaryColor: '#ffffff',
                active: true,
            },
        });
        console.log('[RESCUE] Agência criada/encontrada:', agency.name);
        // 3. Criar Usuário Admin
        const password = await bcrypt.hash('Fatto2026!', 10);
        const user = await prisma.user.upsert({
            where: { email: 'renato@fatto.com' },
            update: {
                passwordHash: password,
                roleId: superAdminRole.id,
                agencyId: agency.id,
                status: 'ACTIVE',
            },
            create: {
                name: 'Renato Admin',
                email: 'renato@fatto.com',
                passwordHash: password,
                roleId: superAdminRole.id,
                agencyId: agency.id,
                status: 'ACTIVE',
                emailVerified: true,
            },
        });
        console.log('[RESCUE] Usuário criado/atualizado:', user.email);
        return res.json({
            status: 'SUCESSO',
            msg: 'Usuário de Resgate Criado!',
            login: 'renato@fatto.com',
            senha: 'Fatto2026!',
            agencyId: agency.id,
            userId: user.id,
            instrucoes: 'Agora vá para /auth/login e use essas credenciais',
        });
    }
    catch (error) {
        console.error('[RESCUE] Erro:', error);
        const message = error instanceof Error ? error.message : String(error);
        return res.status(500).json({ error: message, stack: error instanceof Error ? error.stack : undefined });
    }
});
// List agencies
router.get('/', requirePermission('agencies.view'), async (req, res, next) => {
    try {
        const { page = '1', limit = '10', search, active } = req.query;
        const where = {};
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { slug: { contains: search, mode: 'insensitive' } },
                { cnpj: { contains: search, mode: 'insensitive' } },
            ];
        }
        if (active !== undefined) {
            where.active = active === 'true';
        }
        const [agencies, total] = await Promise.all([
            prisma.agency.findMany({
                where,
                include: {
                    _count: {
                        select: {
                            users: true,
                            properties: true,
                        },
                    },
                },
                skip: (parseInt(page) - 1) * parseInt(limit),
                take: parseInt(limit),
                orderBy: { createdAt: 'desc' },
            }),
            prisma.agency.count({ where }),
        ]);
        res.json({
            agencies,
            total,
            page: parseInt(page),
            totalPages: Math.ceil(total / parseInt(limit)),
        });
    }
    catch (error) {
        next(error);
    }
});
// Get agency by ID
router.get('/:id', requirePermission('agencies.view'), async (req, res, next) => {
    try {
        const id = req.params.id;
        const agency = await prisma.agency.findUnique({
            where: { id },
            include: {
                users: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        role: { select: { name: true } },
                        status: true,
                    },
                },
                _count: {
                    select: {
                        properties: true,
                        adCampaigns: true,
                    },
                },
            },
        });
        if (!agency) {
            throw new AppError(404, 'Imobiliária não encontrada');
        }
        res.json(agency);
    }
    catch (error) {
        next(error);
    }
});
// Create agency with admin user (TRANSAÇÃO ATÔMICA)
router.post('/', requirePermission('agencies.create'), uploadFields, async (req, res, next) => {
    try {
        // 1. Parse e valida o body
        const data = createAgencySchema.parse(req.body);
        // 2. Verificar unicidade de slug e cnpj
        const [existingSlug, existingCnpj] = await Promise.all([
            prisma.agency.findUnique({ where: { slug: data.slug } }),
            data.cnpj ? prisma.agency.findFirst({ where: { cnpj: data.cnpj } }) : null,
        ]);
        if (existingSlug) {
            throw new AppError(400, `Slug "${data.slug}" já está em uso. Escolha outro.`);
        }
        if (existingCnpj) {
            throw new AppError(400, `CNPJ "${data.cnpj}" já está cadastrado.`);
        }
        // 3. Verificar se email do admin já existe
        const existingUser = await prisma.user.findUnique({
            where: { email: data.adminEmail },
        });
        if (existingUser) {
            throw new AppError(400, `Email "${data.adminEmail}" já está em uso.`);
        }
        // 4. Buscar role de admin da imobiliária
        let agencyAdminRole = await prisma.role.findFirst({
            where: { slug: 'agency-admin' },
        });
        // Se não existir, criar a role
        if (!agencyAdminRole) {
            agencyAdminRole = await prisma.role.create({
                data: {
                    name: 'Admin da Imobiliária',
                    slug: 'agency-admin',
                    description: 'Administrador de uma imobiliária',
                    permissions: [
                        'agencies.view',
                        'properties.view',
                        'properties.create',
                        'properties.update',
                        'properties.delete',
                        'contracts.view',
                        'contracts.create',
                        'leads.view',
                        'leads.create',
                        'leads.update',
                        'users.view',
                    ],
                    isSystem: true,
                },
            });
        }
        // 5. Processar uploads de arquivos (se houver)
        let logoUrl = null;
        let coverUrl = null;
        const files = req.files;
        if (files) {
            try {
                if (files.logo?.[0]) {
                    const logoFile = files.logo[0];
                    logoUrl = await uploadFileToStorage(logoFile.buffer, logoFile.originalname, logoFile.mimetype);
                }
                if (files.cover?.[0]) {
                    const coverFile = files.cover[0];
                    coverUrl = await uploadFileToStorage(coverFile.buffer, coverFile.originalname, coverFile.mimetype);
                }
            }
            catch (uploadError) {
                // Log do erro mas não falha a requisição
                console.error('[Agencies] Erro no upload de arquivo:', uploadError);
                // Continua sem as imagens
            }
        }
        // 6. Hash da senha
        const passwordHash = await bcrypt.hash(data.adminPassword, 12);
        // 7. TRANSAÇÃO ATÔMICA: Criar Agency + User
        const result = await prisma.$transaction(async (tx) => {
            // Criar a agência com todos os dados fiscais
            const agency = await tx.agency.create({
                data: {
                    // Dados Empresariais
                    name: data.name,
                    legalName: data.legalName,
                    slug: data.slug,
                    cnpj: data.cnpj,
                    creci: data.creci,
                    // Contato
                    phone: data.phone,
                    email: data.email,
                    // Endereço
                    address: data.address,
                    city: data.city,
                    state: data.state,
                    zipCode: data.zipCode,
                    // Branding
                    primaryColor: data.primaryColor || '#0066FF',
                    secondaryColor: data.secondaryColor || '#00CC99',
                    logoUrl,
                    coverImageUrl: coverUrl,
                    active: true,
                },
            });
            // Criar o usuário admin vinculado à agência
            const adminUser = await tx.user.create({
                data: {
                    name: data.adminName,
                    email: data.adminEmail,
                    passwordHash,
                    roleId: agencyAdminRole.id,
                    agencyId: agency.id,
                    status: 'ACTIVE',
                    emailVerified: false,
                },
            });
            return { agency, adminUser };
        });
        // 8. Retorno de sucesso
        res.status(201).json({
            success: true,
            message: 'Imobiliária criada com sucesso',
            agencyId: result.agency.id,
            adminUserId: result.adminUser.id,
            agency: {
                id: result.agency.id,
                name: result.agency.name,
                slug: result.agency.slug,
                logoUrl: result.agency.logoUrl,
            },
        });
    }
    catch (error) {
        // Tratamento específico de erros do Zod
        if (error instanceof z.ZodError) {
            return next(new AppError(400, error.errors.map(e => e.message).join(', ')));
        }
        next(error);
    }
});
// Update agency
router.patch('/:id', requirePermission('agencies.update'), uploadFields, async (req, res, next) => {
    try {
        const id = req.params.id;
        // Verificar se a agência existe
        const existing = await prisma.agency.findUnique({ where: { id } });
        if (!existing) {
            throw new AppError(404, 'Imobiliária não encontrada');
        }
        // Parse e valida o body
        const data = updateAgencySchema.parse(req.body);
        // Verificar unicidade de slug (se estiver sendo alterado)
        if (data.slug && data.slug !== existing.slug) {
            const slugExists = await prisma.agency.findUnique({ where: { slug: data.slug } });
            if (slugExists) {
                throw new AppError(400, `Slug "${data.slug}" já está em uso.`);
            }
        }
        // Verificar unicidade de cnpj (se estiver sendo alterado)
        if (data.cnpj && data.cnpj !== existing.cnpj) {
            const cnpjExists = await prisma.agency.findFirst({ where: { cnpj: data.cnpj } });
            if (cnpjExists) {
                throw new AppError(400, `CNPJ "${data.cnpj}" já está cadastrado.`);
            }
        }
        // Processar uploads de arquivos (se houver)
        let logoUrl = existing.logoUrl;
        let coverUrl = existing.coverImageUrl;
        const files = req.files;
        if (files) {
            try {
                if (files.logo?.[0]) {
                    const logoFile = files.logo[0];
                    const newLogoUrl = await uploadFileToStorage(logoFile.buffer, logoFile.originalname, logoFile.mimetype);
                    if (newLogoUrl)
                        logoUrl = newLogoUrl;
                }
                if (files.cover?.[0]) {
                    const coverFile = files.cover[0];
                    const newCoverUrl = await uploadFileToStorage(coverFile.buffer, coverFile.originalname, coverFile.mimetype);
                    if (newCoverUrl)
                        coverUrl = newCoverUrl;
                }
            }
            catch (uploadError) {
                console.error('[Agencies] Erro no upload de arquivo:', uploadError);
            }
        }
        // Atualizar a agência
        const agency = await prisma.agency.update({
            where: { id },
            data: {
                ...data,
                logoUrl,
                coverImageUrl: coverUrl,
            },
        });
        res.json({
            success: true,
            message: 'Imobiliária atualizada com sucesso',
            agency,
        });
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            return next(new AppError(400, error.errors.map(e => e.message).join(', ')));
        }
        next(error);
    }
});
// Delete agency
router.delete('/:id', requirePermission('agencies.delete'), async (req, res, next) => {
    try {
        const id = req.params.id;
        // Verificar se a agência existe e contar dependências
        const existing = await prisma.agency.findUnique({
            where: { id },
        });
        if (!existing) {
            throw new AppError(404, 'Imobiliária não encontrada');
        }
        // Contar dependências separadamente
        const [propertiesCount, usersCount] = await Promise.all([
            prisma.property.count({ where: { agencyId: id } }),
            prisma.user.count({ where: { agencyId: id } }),
        ]);
        // Verificar se há dependências
        if (propertiesCount > 0) {
            throw new AppError(400, `Não é possível excluir: existem ${propertiesCount} imóvel(is) vinculado(s).`);
        }
        if (usersCount > 0) {
            throw new AppError(400, `Não é possível excluir: existem ${usersCount} usuário(s) vinculado(s).`);
        }
        await prisma.agency.delete({ where: { id } });
        res.json({
            success: true,
            message: 'Imobiliária excluída com sucesso',
        });
    }
    catch (error) {
        next(error);
    }
});
// Toggle agency active status
router.patch('/:id/toggle-active', requirePermission('agencies.update'), async (req, res, next) => {
    try {
        const id = req.params.id;
        const existing = await prisma.agency.findUnique({ where: { id } });
        if (!existing) {
            throw new AppError(404, 'Imobiliária não encontrada');
        }
        const agency = await prisma.agency.update({
            where: { id },
            data: { active: !existing.active },
        });
        res.json({
            success: true,
            message: `Imobiliária ${agency.active ? 'ativada' : 'desativada'} com sucesso`,
            agency,
        });
    }
    catch (error) {
        next(error);
    }
});
export default router;
//# sourceMappingURL=agencies.js.map