// ============================================
// REPORTS ROUTES
// ============================================

import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requirePermission } from '../middleware/auth.js';
import dayjs from 'dayjs';

const router = Router();

// Dashboard stats
router.get('/dashboard', requirePermission('reports.view'), async (_req, res, next) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const [
      totalProperties,
      totalContracts,
      activeContracts,
      totalLeads,
      totalDeals,
      monthlyRevenue,
      yearlyRevenue,
      pendingPayments,
      overduePayments,
      openTickets,
    ] = await Promise.all([
      prisma.property.count(),
      prisma.rentContract.count(),
      prisma.rentContract.count({ where: { status: 'ACTIVE' } }),
      prisma.lead.count(),
      prisma.deal.count({ where: { status: 'OPEN' } }),
      prisma.payment.aggregate({
        where: { status: 'PAID', paidAt: { gte: startOfMonth } },
        _sum: { amount: true },
      }),
      prisma.payment.aggregate({
        where: { status: 'PAID', paidAt: { gte: startOfYear } },
        _sum: { amount: true },
      }),
      prisma.payment.count({ where: { status: 'PENDING' } }),
      prisma.payment.count({ where: { status: 'OVERDUE' } }),
      prisma.ticket.count({ where: { status: { in: ['OPEN', 'IN_PROGRESS'] } } }),
    ]);

    res.json({
      properties: {
        total: totalProperties,
        available: await prisma.property.count({ where: { status: 'AVAILABLE' } }),
        rented: await prisma.property.count({ where: { status: 'RENTED' } }),
      },
      contracts: {
        total: totalContracts,
        active: activeContracts,
      },
      leads: {
        total: totalLeads,
        new: await prisma.lead.count({ where: { status: 'NEW' } }),
      },
      deals: {
        open: totalDeals,
        wonThisMonth: await prisma.deal.count({
          where: { status: 'WON', closedAt: { gte: startOfMonth } },
        }),
      },
      financial: {
        monthlyRevenue: monthlyRevenue._sum.amount || 0,
        yearlyRevenue: yearlyRevenue._sum.amount || 0,
        pendingPayments,
        overduePayments,
      },
      support: {
        openTickets,
      },
    });
  } catch (error) {
    next(error);
  }
});

// Financial DRE (Demonstrativo de Resultados)
router.get('/financial/dre', requirePermission('reports.financial'), async (req, res, next) => {
  try {
    const { year, month } = req.query;
    const targetYear = parseInt(year as string) || new Date().getFullYear();
    const targetMonth = month ? parseInt(month as string) - 1 : null;

    const startDate = targetMonth !== null
      ? new Date(targetYear, targetMonth, 1)
      : new Date(targetYear, 0, 1);

    const endDate = targetMonth !== null
      ? new Date(targetYear, targetMonth + 1, 0)
      : new Date(targetYear, 11, 31);

    // Receitas
    const revenues = await prisma.payment.groupBy({
      by: ['type'],
      where: {
        status: 'PAID',
        paidAt: { gte: startDate, lte: endDate },
      },
      _sum: { amount: true },
    });

    // Total por categoria
    const totalRevenue = revenues.reduce((sum, r) => sum + Number(r._sum.amount || 0), 0);

    // Split (comissoes)
    const platformFees = await prisma.payment.aggregate({
      where: {
        status: 'PAID',
        paidAt: { gte: startDate, lte: endDate },
      },
      _sum: { platformAmount: true },
    });

    res.json({
      period: {
        year: targetYear,
        month: targetMonth !== null ? targetMonth + 1 : null,
        startDate,
        endDate,
      },
      revenues: {
        byType: revenues.map((r) => ({
          type: r.type,
          amount: Number(r._sum.amount || 0),
        })),
        total: totalRevenue,
      },
      platformRevenue: Number(platformFees._sum.platformAmount || 0),
      // Adicionar mais categorias conforme necessario
    });
  } catch (error) {
    next(error);
  }
});

// Cash flow
router.get('/financial/cashflow', requirePermission('reports.financial'), async (req, res, next) => {
  try {
    const { months = '6' } = req.query;
    const numMonths = parseInt(months as string);

    const data = [];
    for (let i = numMonths - 1; i >= 0; i--) {
      const date = dayjs().subtract(i, 'month');
      const startOfMonth = date.startOf('month').toDate();
      const endOfMonth = date.endOf('month').toDate();

      const [income, pendingIncome] = await Promise.all([
        prisma.payment.aggregate({
          where: {
            status: 'PAID',
            paidAt: { gte: startOfMonth, lte: endOfMonth },
          },
          _sum: { amount: true },
        }),
        prisma.payment.aggregate({
          where: {
            status: 'PENDING',
            dueDate: { gte: startOfMonth, lte: endOfMonth },
          },
          _sum: { amount: true },
        }),
      ]);

      data.push({
        month: date.format('YYYY-MM'),
        label: date.format('MMM/YY'),
        income: Number(income._sum.amount || 0),
        pending: Number(pendingIncome._sum.amount || 0),
      });
    }

    res.json(data);
  } catch (error) {
    next(error);
  }
});

// CRM funnel
router.get('/crm/funnel', requirePermission('reports.view'), async (_req, res, next) => {
  try {
    const pipeline = await prisma.pipeline.findFirst({
      where: { isDefault: true },
      include: {
        stages: {
          orderBy: { order: 'asc' },
          include: {
            _count: { select: { deals: true } },
            deals: {
              where: { status: 'OPEN' },
              select: { value: true },
            },
          },
        },
      },
    });

    if (!pipeline) {
      return res.json({ stages: [] });
    }

    const funnel = pipeline.stages.map((stage) => ({
      id: stage.id,
      name: stage.name,
      color: stage.color,
      order: stage.order,
      count: stage._count.deals,
      value: stage.deals.reduce((sum, d) => sum + Number(d.value), 0),
    }));

    res.json({ pipeline: pipeline.name, funnel });
  } catch (error) {
    next(error);
  }
});

// Properties by status
router.get('/properties/status', requirePermission('reports.view'), async (_req, res, next) => {
  try {
    const byStatus = await prisma.property.groupBy({
      by: ['status'],
      _count: true,
    });

    const byType = await prisma.property.groupBy({
      by: ['type'],
      _count: true,
    });

    res.json({
      byStatus: byStatus.map((s) => ({ status: s.status, count: s._count })),
      byType: byType.map((t) => ({ type: t.type, count: t._count })),
    });
  } catch (error) {
    next(error);
  }
});

export default router;
