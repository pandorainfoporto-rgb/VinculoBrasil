// ============================================
// FINANCE ROUTES
// ============================================

import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../middleware/error-handler.js';

const router = Router();

// ============================================
// GET /summary - Resumo financeiro do mês atual
// ============================================
router.get('/summary', async (req, res, next) => {
  try {
    const agencyId = req.user?.agencyId;

    if (!agencyId) {
      throw new AppError(403, 'User is not associated with an agency');
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    // Soma de receitas (INCOME) do mês atual
    const incomeResult = await prisma.transaction.aggregate({
      where: {
        agencyId,
        type: 'INCOME',
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      _sum: {
        amount: true,
      },
    });

    // Soma de despesas (EXPENSE) do mês atual
    const expenseResult = await prisma.transaction.aggregate({
      where: {
        agencyId,
        type: 'EXPENSE',
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      _sum: {
        amount: true,
      },
    });

    const income = incomeResult._sum.amount?.toNumber() ?? 0;
    const expense = expenseResult._sum.amount?.toNumber() ?? 0;
    const balance = income - expense;

    res.json({
      data: {
        income,
        expense,
        balance,
        month: now.getMonth() + 1,
        year: now.getFullYear(),
      },
    });
  } catch (error) {
    next(error);
  }
});

// ============================================
// GET /chart - Transações dos últimos 6 meses
// ============================================
router.get('/chart', async (req, res, next) => {
  try {
    const agencyId = req.user?.agencyId;

    if (!agencyId) {
      throw new AppError(403, 'User is not associated with an agency');
    }

    const now = new Date();
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    // Buscar transações dos últimos 6 meses
    const transactions = await prisma.transaction.findMany({
      where: {
        agencyId,
        date: {
          gte: sixMonthsAgo,
        },
      },
      select: {
        type: true,
        amount: true,
        date: true,
      },
      orderBy: {
        date: 'asc',
      },
    });

    // Agrupar por mês
    const monthlyData: Record<string, { income: number; expense: number }> = {};

    // Inicializar os últimos 6 meses
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyData[key] = { income: 0, expense: 0 };
    }

    // Somar transações por mês
    for (const tx of transactions) {
      const date = new Date(tx.date);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      if (monthlyData[key]) {
        const amount = tx.amount.toNumber();
        if (tx.type === 'INCOME') {
          monthlyData[key].income += amount;
        } else if (tx.type === 'EXPENSE') {
          monthlyData[key].expense += amount;
        }
      }
    }

    // Converter para array ordenado
    const chartData = Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({
        month,
        income: data.income,
        expense: data.expense,
        balance: data.income - data.expense,
      }));

    res.json({
      data: chartData,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
