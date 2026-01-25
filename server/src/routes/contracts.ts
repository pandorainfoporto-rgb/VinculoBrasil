// ============================================
// CONTRACTS ROUTES
// ============================================

import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../middleware/error-handler.js';
import { requirePermission } from '../middleware/auth.js';
import {
  mintContract,
  getBlockchainStatus,
  getContractNFT,
  estimateMintCost,
} from '../controllers/contract.controller.js';
import {
  simulateContractTermination,
  executeContractTermination,
} from '../controllers/termination.controller.js';

const router = Router();

// ============================================
// BLOCKCHAIN / NFT ROUTES
// ============================================

// Mint a new contract NFT (Custodial - Admin pays gas)
router.post('/mint', mintContract);

// Check blockchain configuration status
router.get('/blockchain-status', getBlockchainStatus);

// Estimate gas cost for minting
router.get('/estimate-mint', estimateMintCost);

// Get NFT details for a specific contract
router.get('/:id/nft', getContractNFT);

// List contracts
router.get('/', requirePermission('contracts.view'), async (req, res, next) => {
  try {
    const { page = '1', limit = '10', status } = req.query;

    const where: Record<string, unknown> = {};
    if (status) where.status = status;

    const [contracts, total] = await Promise.all([
      prisma.rentContract.findMany({
        where,
        include: {
          property: { select: { id: true, title: true, street: true, city: true } },
          nft: { select: { tokenId: true, contractAddress: true } },
          _count: { select: { payments: true, guarantors: true } },
        },
        skip: (parseInt(page as string) - 1) * parseInt(limit as string),
        take: parseInt(limit as string),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.rentContract.count({ where }),
    ]);

    res.json({
      contracts,
      total,
      page: parseInt(page as string),
      totalPages: Math.ceil(total / parseInt(limit as string)),
    });
  } catch (error) {
    next(error);
  }
});

// Get contract by ID
router.get('/:id', requirePermission('contracts.view'), async (req, res, next) => {
  try {
    const contract = await prisma.rentContract.findUnique({
      where: { id: String(req.params.id) },
      include: {
        property: { include: { owner: true, images: { take: 1 } } },
        guarantors: true,
        nft: { include: { transactions: { take: 10 } } },
        payments: { orderBy: { dueDate: 'desc' } },
      },
    });

    if (!contract) {
      throw new AppError(404, 'Contract not found');
    }

    res.json(contract);
  } catch (error) {
    next(error);
  }
});

// Create contract
router.post('/', requirePermission('contracts.create'), async (req, res, next) => {
  try {
    const schema = z.object({
      propertyId: z.string().uuid(),
      tenantName: z.string(),
      tenantCpf: z.string(),
      tenantEmail: z.string().email(),
      tenantPhone: z.string(),
      startDate: z.string().transform((s) => new Date(s)),
      endDate: z.string().transform((s) => new Date(s)),
      rentValue: z.number().positive(),
      dueDay: z.number().min(1).max(28).default(5),
    });

    const data = schema.parse(req.body);

    // Verificar se imovel esta disponivel
    const property = await prisma.property.findUnique({
      where: { id: data.propertyId },
    });

    if (!property) {
      throw new AppError(404, 'Property not found');
    }

    if (property.status !== 'AVAILABLE') {
      throw new AppError(400, 'Property is not available');
    }

    const contract = await prisma.rentContract.create({
      data: {
        ...data,
        status: 'DRAFT',
      },
      include: { property: true },
    });

    res.status(201).json(contract);
  } catch (error) {
    next(error);
  }
});

// Update contract status
router.patch('/:id/status', requirePermission('contracts.update'), async (req, res, next) => {
  try {
    const { status } = req.body;

    const contract = await prisma.rentContract.update({
      where: { id: String(req.params.id) },
      data: { status },
    });

    // Se ativou o contrato, atualizar status do imovel
    if (status === 'ACTIVE') {
      await prisma.property.update({
        where: { id: contract.propertyId },
        data: { status: 'RENTED' },
      });
    }

    res.json(contract);
  } catch (error) {
    next(error);
  }
});

// Add guarantor
router.post('/:id/guarantors', requirePermission('contracts.update'), async (req, res, next) => {
  try {
    const schema = z.object({
      name: z.string(),
      cpf: z.string(),
      email: z.string().email(),
      phone: z.string(),
      stakeAmount: z.number().positive(),
    });

    const data = schema.parse(req.body);

    const guarantor = await prisma.guarantor.create({
      data: {
        ...data,
        contractId: String(req.params.id),
      },
    });

    res.status(201).json(guarantor);
  } catch (error) {
    next(error);
  }
});

// ============================================
// TERMINATION / RESCISÃO ROUTES
// Lei do Inquilinato - Art. 4º (Multa Proporcional)
// ============================================

// Simular rescisão (preview antes de executar)
router.post(
  '/:id/simulate-termination',
  requirePermission('contracts.update'),
  simulateContractTermination
);

// Executar rescisão (ação definitiva)
router.post(
  '/:id/terminate',
  requirePermission('contracts.update'),
  executeContractTermination
);

export default router;
