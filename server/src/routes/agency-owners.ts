// ============================================
// AGENCY OWNERS ROUTES (CRM de Proprietários)
// Gerencia proprietários vinculados à agência
// ============================================

import { Router } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../middleware/error-handler.js';

const router = Router();

// ============================================
// LISTAR PROPRIETÁRIOS DA AGÊNCIA
// GET /api/agency/owners
// ============================================
router.get('/', async (req, res, next) => {
  try {
    const agencyId = req.user?.agencyId;
    if (!agencyId) {
      throw new AppError(403, 'Acesso restrito a usuários de agências.');
    }

    // Buscar a role de proprietário (landlord)
    const landlordRole = await prisma.role.findFirst({
      where: {
        OR: [
          { slug: 'landlord' },
          { slug: 'owner' },
          { slug: 'proprietario' },
        ],
      },
    });

    const owners = await prisma.user.findMany({
      where: {
        agencyId: agencyId,
        ...(landlordRole ? { roleId: landlordRole.id } : {}),
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        cpf: true,
        pixKey: true,
        pixKeyType: true,
        bankCode: true,
        bankAgency: true,
        bankAccount: true,
        bankAccountType: true,
        status: true,
        createdAt: true,
        _count: {
          select: { properties: true },
        },
      },
      orderBy: { name: 'asc' },
    });

    console.log(`📋 [AGENCY OWNERS] Listando ${owners.length} proprietários da agência ${agencyId}`);

    return res.json({ owners });
  } catch (error) {
    next(error);
  }
});

// ============================================
// CRIAR PROPRIETÁRIO
// POST /api/agency/owners
// ============================================
router.post('/', async (req, res, next) => {
  try {
    const agencyId = req.user?.agencyId;
    if (!agencyId) {
      throw new AppError(403, 'Acesso restrito a usuários de agências.');
    }

    const schema = z.object({
      name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
      email: z.string().email('Email inválido'),
      phone: z.string().optional(),
      cpf: z.string().optional(),
      pixKey: z.string().optional(),
      pixKeyType: z.enum(['CPF', 'CNPJ', 'EMAIL', 'PHONE', 'RANDOM']).optional(),
      bankCode: z.string().optional(),
      bankAgency: z.string().optional(),
      bankAccount: z.string().optional(),
      bankAccountType: z.enum(['CORRENTE', 'POUPANCA']).optional(),
    });

    const data = schema.parse(req.body);

    // Verificar se email já existe
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new AppError(400, 'Este email já está cadastrado no sistema.');
    }

    // Buscar ou criar a role de proprietário
    let landlordRole = await prisma.role.findFirst({
      where: { slug: 'landlord' },
    });

    if (!landlordRole) {
      landlordRole = await prisma.role.create({
        data: {
          name: 'Proprietário',
          slug: 'landlord',
          description: 'Proprietário de imóveis vinculado a uma agência',
          permissions: ['properties.view', 'contracts.view', 'payments.view'],
          isSystem: false,
        },
      });
      console.log('✅ [AGENCY OWNERS] Role "landlord" criada automaticamente');
    }

    // Senha temporária (proprietário deve alterar no primeiro acesso)
    const temporaryPassword = 'mudar123';
    const passwordHash = await bcrypt.hash(temporaryPassword, 10);

    const owner = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        cpf: data.cpf,
        passwordHash,
        roleId: landlordRole.id,
        agencyId: agencyId, // VÍNCULO CRÍTICO COM A AGÊNCIA
        pixKey: data.pixKey,
        pixKeyType: data.pixKeyType,
        bankCode: data.bankCode,
        bankAgency: data.bankAgency,
        bankAccount: data.bankAccount,
        bankAccountType: data.bankAccountType,
        status: 'ACTIVE',
        emailVerified: false,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        cpf: true,
        pixKey: true,
        pixKeyType: true,
        status: true,
        createdAt: true,
      },
    });

    console.log(`✅ [AGENCY OWNERS] Proprietário criado: ${owner.name} (${owner.email}) na agência ${agencyId}`);

    return res.status(201).json({
      ...owner,
      message: 'Proprietário cadastrado com sucesso!',
      temporaryPassword: temporaryPassword, // Enviar apenas na criação
    });
  } catch (error) {
    next(error);
  }
});

// ============================================
// BUSCAR PROPRIETÁRIO POR ID
// GET /api/agency/owners/:id
// ============================================
router.get('/:id', async (req, res, next) => {
  try {
    const agencyId = req.user?.agencyId;
    if (!agencyId) {
      throw new AppError(403, 'Acesso restrito a usuários de agências.');
    }

    const owner = await prisma.user.findFirst({
      where: {
        id: req.params.id,
        agencyId: agencyId, // Garantir que pertence à agência
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        cpf: true,
        pixKey: true,
        pixKeyType: true,
        bankCode: true,
        bankAgency: true,
        bankAccount: true,
        bankAccountType: true,
        status: true,
        createdAt: true,
        properties: {
          select: {
            id: true,
            title: true,
            city: true,
            state: true,
            rentValue: true,
            status: true,
          },
        },
      },
    });

    if (!owner) {
      throw new AppError(404, 'Proprietário não encontrado.');
    }

    return res.json(owner);
  } catch (error) {
    next(error);
  }
});

// ============================================
// ATUALIZAR PROPRIETÁRIO
// PATCH /api/agency/owners/:id
// ============================================
router.patch('/:id', async (req, res, next) => {
  try {
    const agencyId = req.user?.agencyId;
    if (!agencyId) {
      throw new AppError(403, 'Acesso restrito a usuários de agências.');
    }

    // Verificar se o proprietário pertence à agência
    const existingOwner = await prisma.user.findFirst({
      where: {
        id: req.params.id,
        agencyId: agencyId,
      },
    });

    if (!existingOwner) {
      throw new AppError(404, 'Proprietário não encontrado.');
    }

    const schema = z.object({
      name: z.string().min(2).optional(),
      phone: z.string().optional(),
      cpf: z.string().optional(),
      pixKey: z.string().optional(),
      pixKeyType: z.enum(['CPF', 'CNPJ', 'EMAIL', 'PHONE', 'RANDOM']).optional(),
      bankCode: z.string().optional(),
      bankAgency: z.string().optional(),
      bankAccount: z.string().optional(),
      bankAccountType: z.enum(['CORRENTE', 'POUPANCA']).optional(),
      status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']).optional(),
    });

    const data = schema.parse(req.body);

    const owner = await prisma.user.update({
      where: { id: req.params.id },
      data,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        cpf: true,
        pixKey: true,
        pixKeyType: true,
        bankCode: true,
        bankAgency: true,
        bankAccount: true,
        bankAccountType: true,
        status: true,
        updatedAt: true,
      },
    });

    console.log(`✏️ [AGENCY OWNERS] Proprietário atualizado: ${owner.name}`);

    return res.json(owner);
  } catch (error) {
    next(error);
  }
});

// ============================================
// DELETAR PROPRIETÁRIO (Soft Delete)
// DELETE /api/agency/owners/:id
// ============================================
router.delete('/:id', async (req, res, next) => {
  try {
    const agencyId = req.user?.agencyId;
    if (!agencyId) {
      throw new AppError(403, 'Acesso restrito a usuários de agências.');
    }

    // Verificar se o proprietário pertence à agência
    const existingOwner = await prisma.user.findFirst({
      where: {
        id: req.params.id,
        agencyId: agencyId,
      },
      include: {
        _count: { select: { properties: true } },
      },
    });

    if (!existingOwner) {
      throw new AppError(404, 'Proprietário não encontrado.');
    }

    // Não permitir exclusão se tiver imóveis vinculados
    if (existingOwner._count.properties > 0) {
      throw new AppError(400, `Este proprietário possui ${existingOwner._count.properties} imóvel(is) vinculado(s). Transfira os imóveis antes de excluir.`);
    }

    // Soft delete: mudar status para INACTIVE
    await prisma.user.update({
      where: { id: req.params.id },
      data: { status: 'INACTIVE' },
    });

    console.log(`🗑️ [AGENCY OWNERS] Proprietário desativado: ${existingOwner.name}`);

    return res.json({ message: 'Proprietário desativado com sucesso.' });
  } catch (error) {
    next(error);
  }
});

export default router;
