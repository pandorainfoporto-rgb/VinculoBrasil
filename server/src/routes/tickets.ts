// ============================================
// TICKETS ROUTES (Omnichannel)
// ============================================

import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../middleware/error-handler.js';
import { requirePermission } from '../middleware/auth.js';

const router = Router();

// List tickets
router.get('/', requirePermission('tickets.view'), async (req, res, next) => {
  try {
    const { page = '1', limit = '20', status, channel, agentId, priority } = req.query;

    const where: Record<string, unknown> = {};
    if (status) where.status = status;
    if (channel) where.channel = channel;
    if (agentId) where.agentId = agentId;
    if (priority) where.priority = priority;

    const [tickets, total] = await Promise.all([
      prisma.ticket.findMany({
        where,
        include: {
          agent: { select: { id: true, name: true, avatar: true } },
          messages: { take: 1, orderBy: { createdAt: 'desc' } },
          _count: { select: { messages: true } },
        },
        skip: (parseInt(page as string) - 1) * parseInt(limit as string),
        take: parseInt(limit as string),
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.ticket.count({ where }),
    ]);

    res.json({
      tickets,
      total,
      page: parseInt(page as string),
      totalPages: Math.ceil(total / parseInt(limit as string)),
    });
  } catch (error) {
    next(error);
  }
});

// Get ticket by ID
router.get('/:id', requirePermission('tickets.view'), async (req, res, next) => {
  try {
    const ticket = await prisma.ticket.findUnique({
      where: { id: req.params.id },
      include: {
        agent: { select: { id: true, name: true, avatar: true } },
        messages: {
          include: {
            sender: { select: { id: true, name: true, avatar: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!ticket) {
      throw new AppError(404, 'Ticket not found');
    }

    res.json(ticket);
  } catch (error) {
    next(error);
  }
});

// Create ticket
router.post('/', requirePermission('tickets.create'), async (req, res, next) => {
  try {
    const schema = z.object({
      contactName: z.string(),
      contactEmail: z.string().email().optional(),
      contactPhone: z.string().optional(),
      channel: z.enum(['WHATSAPP', 'EMAIL', 'CHAT', 'PHONE', 'SMS']),
      subject: z.string().optional(),
      priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
      agentId: z.string().uuid().optional(),
      initialMessage: z.string().optional(),
    });

    const data = schema.parse(req.body);
    const { initialMessage, ...ticketData } = data;

    const ticket = await prisma.ticket.create({
      data: {
        ...ticketData,
        createdById: req.user?.id,
      },
    });

    // Criar mensagem inicial se fornecida
    if (initialMessage) {
      await prisma.message.create({
        data: {
          ticketId: ticket.id,
          content: initialMessage,
          senderType: 'CUSTOMER',
          senderName: data.contactName,
          channel: data.channel,
        },
      });
    }

    res.status(201).json(ticket);
  } catch (error) {
    next(error);
  }
});

// Send message
router.post('/:id/messages', requirePermission('tickets.update'), async (req, res, next) => {
  try {
    const schema = z.object({
      content: z.string().min(1),
      contentType: z.enum(['TEXT', 'IMAGE', 'AUDIO', 'VIDEO', 'DOCUMENT']).optional(),
      attachments: z.array(z.string()).optional(),
    });

    const data = schema.parse(req.body);

    const ticket = await prisma.ticket.findUnique({
      where: { id: req.params.id },
    });

    if (!ticket) {
      throw new AppError(404, 'Ticket not found');
    }

    const message = await prisma.message.create({
      data: {
        ticketId: req.params.id,
        content: data.content,
        contentType: data.contentType || 'TEXT',
        attachments: data.attachments,
        senderId: req.user?.id,
        senderType: 'AGENT',
        senderName: req.user?.name,
        channel: ticket.channel,
      },
      include: {
        sender: { select: { id: true, name: true, avatar: true } },
      },
    });

    // Atualizar ticket
    await prisma.ticket.update({
      where: { id: req.params.id },
      data: {
        status: 'IN_PROGRESS',
        firstResponseAt: ticket.firstResponseAt || new Date(),
      },
    });

    // TODO: Enviar mensagem pelo canal real (WhatsApp, Email, etc.)

    res.status(201).json(message);
  } catch (error) {
    next(error);
  }
});

// Assign agent
router.post('/:id/assign', requirePermission('tickets.update'), async (req, res, next) => {
  try {
    const { agentId } = req.body;

    const ticket = await prisma.ticket.update({
      where: { id: req.params.id },
      data: { agentId, status: 'IN_PROGRESS' },
      include: { agent: { select: { id: true, name: true } } },
    });

    res.json(ticket);
  } catch (error) {
    next(error);
  }
});

// Update status
router.patch('/:id/status', requirePermission('tickets.update'), async (req, res, next) => {
  try {
    const { status } = req.body;

    const ticket = await prisma.ticket.update({
      where: { id: req.params.id },
      data: {
        status,
        resolvedAt: status === 'RESOLVED' || status === 'CLOSED' ? new Date() : undefined,
      },
    });

    res.json(ticket);
  } catch (error) {
    next(error);
  }
});

// ============================================
// GET /stats - Estatísticas de Suporte (SupportTicket)
// ============================================
router.get('/stats', async (req, res, next) => {
  try {
    const agencyId = req.user?.agencyId;

    if (!agencyId) {
      throw new AppError(403, 'User is not associated with an agency');
    }

    // Contagem de tickets por status
    const ticketsByStatus = await prisma.supportTicket.groupBy({
      by: ['status'],
      where: {
        agencyId,
      },
      _count: {
        id: true,
      },
    });

    // Média de NPS Score
    const npsAverage = await prisma.supportTicket.aggregate({
      where: {
        agencyId,
        npsScore: { not: null },
      },
      _avg: {
        npsScore: true,
      },
      _count: {
        npsScore: true,
      },
    });

    // Tickets abertos
    const openTickets = await prisma.supportTicket.count({
      where: {
        agencyId,
        status: 'OPEN',
      },
    });

    // Formatar contagem por status
    const statusCounts: Record<string, number> = {
      OPEN: 0,
      IN_PROGRESS: 0,
      WAITING_CUSTOMER: 0,
      RESOLVED: 0,
      CLOSED: 0,
    };
    for (const item of ticketsByStatus) {
      statusCounts[item.status] = item._count.id;
    }

    const totalTickets = Object.values(statusCounts).reduce((a, b) => a + b, 0);

    res.json({
      data: {
        total: totalTickets,
        open: openTickets,
        byStatus: statusCounts,
        nps: {
          average: npsAverage._avg.npsScore ?? null,
          totalResponses: npsAverage._count.npsScore,
        },
      },
    });
  } catch (error) {
    next(error);
  }
});

export default router;
