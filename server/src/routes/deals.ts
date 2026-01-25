// ============================================
// DEALS ROUTES
// ============================================

import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../middleware/error-handler.js';
import { requirePermission } from '../middleware/auth.js';

const router = Router();

// List deals (Kanban)
router.get('/', requirePermission('deals.view'), async (req, res, next) => {
  try {
    const { pipelineId, status, ownerId } = req.query;

    const where: Record<string, unknown> = {};
    if (pipelineId) where.pipelineId = pipelineId;
    if (status) where.status = status;
    if (ownerId) where.ownerId = ownerId;

    const deals = await prisma.deal.findMany({
      where,
      include: {
        stage: true,
        lead: { select: { id: true, name: true, email: true, phone: true } },
        owner: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Agrupar por stage para Kanban
    const stages = await prisma.pipelineStage.findMany({
      where: pipelineId ? { pipelineId: pipelineId as string } : {},
      orderBy: { order: 'asc' },
    });

    const kanban = stages.map((stage) => ({
      ...stage,
      deals: deals.filter((d) => d.stageId === stage.id),
    }));

    res.json({ deals, kanban, total: deals.length });
  } catch (error) {
    next(error);
  }
});

// Get pipelines
router.get('/pipelines', requirePermission('deals.view'), async (_req, res, next) => {
  try {
    const pipelines = await prisma.pipeline.findMany({
      include: {
        stages: { orderBy: { order: 'asc' } },
        _count: { select: { deals: true } },
      },
    });

    res.json(pipelines);
  } catch (error) {
    next(error);
  }
});

// Get deal by ID
router.get('/:id', requirePermission('deals.view'), async (req, res, next) => {
  try {
    const deal = await prisma.deal.findUnique({
      where: { id: String(req.params.id) },
      include: {
        pipeline: true,
        stage: true,
        lead: true,
        owner: { select: { id: true, name: true, email: true } },
      },
    });

    if (!deal) {
      throw new AppError(404, 'Deal not found');
    }

    res.json(deal);
  } catch (error) {
    next(error);
  }
});

// Create deal
router.post('/', requirePermission('deals.create'), async (req, res, next) => {
  try {
    const schema = z.object({
      title: z.string().min(2),
      value: z.number().positive(),
      pipelineId: z.string().uuid(),
      stageId: z.string().uuid(),
      leadId: z.string().uuid().optional(),
      probability: z.number().min(0).max(100).optional(),
      expectedCloseAt: z.string().transform((s) => new Date(s)).optional(),
      notes: z.string().optional(),
    });

    const data = schema.parse(req.body);

    const deal = await prisma.deal.create({
      data: {
        ...data,
        ownerId: req.user!.id,
      },
      include: { stage: true, lead: true },
    });

    res.status(201).json(deal);
  } catch (error) {
    next(error);
  }
});

// Move deal (Kanban drag)
router.patch('/:id/move', requirePermission('deals.update'), async (req, res, next) => {
  try {
    const { stageId } = req.body;

    const deal = await prisma.deal.update({
      where: { id: String(req.params.id) },
      data: { stageId },
      include: { stage: true },
    });

    res.json(deal);
  } catch (error) {
    next(error);
  }
});

// Update deal
router.patch('/:id', requirePermission('deals.update'), async (req, res, next) => {
  try {
    const deal = await prisma.deal.update({
      where: { id: String(req.params.id) },
      data: req.body,
    });

    res.json(deal);
  } catch (error) {
    next(error);
  }
});

// Win deal
router.post('/:id/win', requirePermission('deals.update'), async (req, res, next) => {
  try {
    const deal = await prisma.deal.update({
      where: { id: String(req.params.id) },
      data: {
        status: 'WON',
        closedAt: new Date(),
        probability: 100,
      },
    });

    res.json(deal);
  } catch (error) {
    next(error);
  }
});

// Lose deal
router.post('/:id/lose', requirePermission('deals.update'), async (req, res, next) => {
  try {
    const { reason } = req.body;

    const deal = await prisma.deal.update({
      where: { id: String(req.params.id) },
      data: {
        status: 'LOST',
        closedAt: new Date(),
        lostReason: reason,
        probability: 0,
      },
    });

    res.json(deal);
  } catch (error) {
    next(error);
  }
});

export default router;
