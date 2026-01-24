// ============================================
// LEADS ROUTES
// ============================================

import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../middleware/error-handler.js';
import { requirePermission } from '../middleware/auth.js';

const router = Router();

// List leads
router.get('/', requirePermission('leads.view'), async (req, res, next) => {
  try {
    const { page = '1', limit = '10', status, source, ownerId } = req.query;

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (source) where.source = source;
    if (ownerId) where.ownerId = ownerId;

    const [leads, total] = await Promise.all([
      prisma.lead.findMany({
        where,
        include: {
          owner: { select: { id: true, name: true } },
          _count: { select: { deals: true, activities: true } },
        },
        skip: (parseInt(page as string) - 1) * parseInt(limit as string),
        take: parseInt(limit as string),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.lead.count({ where }),
    ]);

    res.json({
      leads,
      total,
      page: parseInt(page as string),
      totalPages: Math.ceil(total / parseInt(limit as string)),
    });
  } catch (error) {
    next(error);
  }
});

// Get lead by ID
router.get('/:id', requirePermission('leads.view'), async (req, res, next) => {
  try {
    const lead = await prisma.lead.findUnique({
      where: { id: req.params.id },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true } },
        deals: true,
        activities: { orderBy: { createdAt: 'desc' }, take: 20 },
      },
    });

    if (!lead) {
      throw new AppError(404, 'Lead not found');
    }

    res.json(lead);
  } catch (error) {
    next(error);
  }
});

// Create lead
router.post('/', requirePermission('leads.create'), async (req, res, next) => {
  try {
    const schema = z.object({
      name: z.string().min(2),
      email: z.string().email().optional(),
      phone: z.string().optional(),
      cpf: z.string().optional(),
      source: z.string().optional(),
      campaign: z.string().optional(),
      interestType: z.string().optional(),
      budget: z.number().optional(),
      notes: z.string().optional(),
      ownerId: z.string().uuid().optional(),
    });

    const data = schema.parse(req.body);

    const lead = await prisma.lead.create({
      data: {
        ...data,
        createdById: req.user?.id,
      },
      include: { owner: { select: { id: true, name: true } } },
    });

    res.status(201).json(lead);
  } catch (error) {
    next(error);
  }
});

// Update lead
router.patch('/:id', requirePermission('leads.update'), async (req, res, next) => {
  try {
    const lead = await prisma.lead.update({
      where: { id: req.params.id },
      data: req.body,
    });

    res.json(lead);
  } catch (error) {
    next(error);
  }
});

// Add activity
router.post('/:id/activities', requirePermission('leads.update'), async (req, res, next) => {
  try {
    const schema = z.object({
      type: z.string(),
      title: z.string(),
      description: z.string().optional(),
      scheduledAt: z.string().transform((s) => new Date(s)).optional(),
    });

    const data = schema.parse(req.body);

    const activity = await prisma.leadActivity.create({
      data: {
        ...data,
        leadId: req.params.id,
      },
    });

    res.status(201).json(activity);
  } catch (error) {
    next(error);
  }
});

// Convert to deal
router.post('/:id/convert', requirePermission('leads.update'), async (req, res, next) => {
  try {
    const lead = await prisma.lead.findUnique({
      where: { id: req.params.id },
    });

    if (!lead) {
      throw new AppError(404, 'Lead not found');
    }

    // Buscar pipeline padrao
    const pipeline = await prisma.pipeline.findFirst({
      where: { isDefault: true },
      include: { stages: { orderBy: { order: 'asc' }, take: 1 } },
    });

    if (!pipeline || pipeline.stages.length === 0) {
      throw new AppError(400, 'No default pipeline configured');
    }

    const deal = await prisma.deal.create({
      data: {
        title: `Negociacao - ${lead.name}`,
        value: lead.budget || 0,
        pipelineId: pipeline.id,
        stageId: pipeline.stages[0].id,
        leadId: lead.id,
        ownerId: lead.ownerId || req.user!.id,
      },
    });

    await prisma.lead.update({
      where: { id: lead.id },
      data: { status: 'CONVERTED', convertedAt: new Date() },
    });

    res.json(deal);
  } catch (error) {
    next(error);
  }
});

export default router;
