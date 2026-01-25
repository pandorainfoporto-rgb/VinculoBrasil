// ============================================
// FINANCE CONTROLLER - Módulo Financeiro V2
// ============================================

import { type Request, type Response, type NextFunction } from 'express';
import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';
import { AppError } from '../middleware/error-handler.js';

// ============================================
// TYPES
// ============================================

interface CreatePayableBody {
  description: string;
  amount: number;
  dueDate: string;
  supplierId?: string;
  supplierName?: string;
  category?: string;
  barcode?: string;
  isRecurring?: boolean;
  recurrenceInterval?: string;
  agencyId?: string;
  notes?: string;
}

interface CreateReceivableBody {
  description: string;
  amount: number;
  dueDate: string;
  origin?: string;
  clientType?: string;
  type?: 'MANUAL' | 'BOLETO' | 'MARKETPLACE' | 'RENTAL';
  agencyId?: string;
  notes?: string;
}

interface CreateBankAccountBody {
  name: string;
  bankName: string;
  agency: string;
  accountNumber: string;
  type: 'CHECKING' | 'SAVINGS' | 'GATEWAY';
  balance: number;
  agencyId?: string;
  active?: boolean;
  notes?: string;
}

// ============================================
// ACCOUNTS PAYABLE (Contas a Pagar)
// ============================================

/**
 * POST /api/finance/payables
 * Creates a new account payable (conta a pagar)
 */
export async function createPayable(req: Request, res: Response, next: NextFunction) {
  try {
    const {
      description,
      amount,
      dueDate,
      supplierId,
      supplierName,
      category,
      barcode,
      isRecurring,
      recurrenceInterval,
      agencyId,
      notes,
    }: CreatePayableBody = req.body;

    // Validation
    if (!description || !amount || !dueDate) {
      throw new AppError('Missing required fields: description, amount, dueDate', 400);
    }

    // Create payable
    const payable = await prisma.accountsPayable.create({
      data: {
        description,
        amount,
        dueDate: new Date(dueDate),
        supplierId,
        supplierName,
        category,
        barcode,
        isRecurring: isRecurring || false,
        recurrenceInterval,
        agencyId,
        notes,
        status: 'PENDING',
      },
      include: {
        supplier: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    logger.info(`[Finance] Payable created: ${payable.id} - ${payable.description} - R$ ${payable.amount}`);

    res.status(201).json({
      success: true,
      data: payable,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/finance/payables
 * Lists all accounts payable with optional filters
 */
export async function listPayables(req: Request, res: Response, next: NextFunction) {
  try {
    const { agencyId, status, search } = req.query;

    const where: any = {};

    if (agencyId) {
      where.agencyId = agencyId as string;
    }

    if (status) {
      where.status = status as string;
    }

    if (search) {
      where.OR = [
        { description: { contains: search as string, mode: 'insensitive' } },
        { supplierName: { contains: search as string, mode: 'insensitive' } },
        { category: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const payables = await prisma.accountsPayable.findMany({
      where,
      include: {
        supplier: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        dueDate: 'asc',
      },
    });

    res.json({
      success: true,
      data: payables,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/finance/payables/:id/pay
 * Marks a payable as paid
 */
export async function payBill(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { paymentMethod, paymentDate } = req.body;

    // Check if payable exists
    const existing = await prisma.accountsPayable.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new AppError('Payable not found', 404);
    }

    // Update payable
    const payable = await prisma.accountsPayable.update({
      where: { id },
      data: {
        status: 'PAID',
        paymentMethod,
        paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
      },
      include: {
        supplier: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    logger.info(`[Finance] Payable paid: ${payable.id} - ${payable.description}`);

    res.json({
      success: true,
      data: payable,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/finance/payables/:id
 * Updates a payable
 */
export async function updatePayable(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check if payable exists
    const existing = await prisma.accountsPayable.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new AppError('Payable not found', 404);
    }

    // Update payable
    const payable = await prisma.accountsPayable.update({
      where: { id },
      data: {
        ...updateData,
        dueDate: updateData.dueDate ? new Date(updateData.dueDate) : undefined,
        paymentDate: updateData.paymentDate ? new Date(updateData.paymentDate) : undefined,
      },
      include: {
        supplier: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    logger.info(`[Finance] Payable updated: ${payable.id}`);

    res.json({
      success: true,
      data: payable,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/finance/payables/:id
 * Deletes a payable
 */
export async function deletePayable(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;

    // Check if payable exists
    const existing = await prisma.accountsPayable.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new AppError('Payable not found', 404);
    }

    // Delete payable
    await prisma.accountsPayable.delete({
      where: { id },
    });

    logger.info(`[Finance] Payable deleted: ${id}`);

    res.json({
      success: true,
      message: 'Payable deleted successfully',
    });
  } catch (error) {
    next(error);
  }
}

// ============================================
// ACCOUNTS RECEIVABLE (Contas a Receber)
// ============================================

/**
 * POST /api/finance/receivables
 * Creates a new account receivable (conta a receber)
 */
export async function createReceivable(req: Request, res: Response, next: NextFunction) {
  try {
    const {
      description,
      amount,
      dueDate,
      origin,
      clientType,
      type,
      agencyId,
      notes,
    }: CreateReceivableBody = req.body;

    // Validation
    if (!description || !amount || !dueDate) {
      throw new AppError('Missing required fields: description, amount, dueDate', 400);
    }

    // Create receivable
    const receivable = await prisma.accountsReceivable.create({
      data: {
        description,
        amount,
        dueDate: new Date(dueDate),
        origin,
        clientType,
        type: type || 'MANUAL',
        agencyId,
        notes,
        status: 'PENDING',
      },
    });

    logger.info(`[Finance] Receivable created: ${receivable.id} - ${receivable.description} - R$ ${receivable.amount}`);

    res.status(201).json({
      success: true,
      data: receivable,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/finance/receivables
 * Lists all accounts receivable with optional filters
 */
export async function listReceivables(req: Request, res: Response, next: NextFunction) {
  try {
    const { agencyId, status, search } = req.query;

    const where: any = {};

    if (agencyId) {
      where.agencyId = agencyId as string;
    }

    if (status) {
      where.status = status as string;
    }

    if (search) {
      where.OR = [
        { description: { contains: search as string, mode: 'insensitive' } },
        { origin: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    const receivables = await prisma.accountsReceivable.findMany({
      where,
      orderBy: {
        dueDate: 'asc',
      },
    });

    res.json({
      success: true,
      data: receivables,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/finance/receivables/:id/receive
 * Marks a receivable as received
 */
export async function receivePayment(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { paymentMethod, receivedDate, receivedAmount } = req.body;

    // Check if receivable exists
    const existing = await prisma.accountsReceivable.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new AppError('Receivable not found', 404);
    }

    // Determine status based on received amount
    let status: 'PAID' | 'PARTIAL' = 'PAID';
    if (receivedAmount && receivedAmount < existing.amount) {
      status = 'PARTIAL';
    }

    // Update receivable
    const receivable = await prisma.accountsReceivable.update({
      where: { id },
      data: {
        status,
        paymentMethod,
        receivedDate: receivedDate ? new Date(receivedDate) : new Date(),
        receivedAmount: receivedAmount || existing.amount,
      },
    });

    logger.info(`[Finance] Receivable received: ${receivable.id} - ${receivable.description}`);

    res.json({
      success: true,
      data: receivable,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/finance/receivables/:id
 * Updates a receivable
 */
export async function updateReceivable(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check if receivable exists
    const existing = await prisma.accountsReceivable.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new AppError('Receivable not found', 404);
    }

    // Update receivable
    const receivable = await prisma.accountsReceivable.update({
      where: { id },
      data: {
        ...updateData,
        dueDate: updateData.dueDate ? new Date(updateData.dueDate) : undefined,
        receivedDate: updateData.receivedDate ? new Date(updateData.receivedDate) : undefined,
      },
    });

    logger.info(`[Finance] Receivable updated: ${receivable.id}`);

    res.json({
      success: true,
      data: receivable,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/finance/receivables/:id
 * Deletes a receivable
 */
export async function deleteReceivable(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;

    // Check if receivable exists
    const existing = await prisma.accountsReceivable.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new AppError('Receivable not found', 404);
    }

    // Delete receivable
    await prisma.accountsReceivable.delete({
      where: { id },
    });

    logger.info(`[Finance] Receivable deleted: ${id}`);

    res.json({
      success: true,
      message: 'Receivable deleted successfully',
    });
  } catch (error) {
    next(error);
  }
}

// ============================================
// BANK ACCOUNTS (Contas Bancárias)
// ============================================

/**
 * POST /api/finance/bank-accounts
 * Creates a new bank account
 */
export async function createBankAccount(req: Request, res: Response, next: NextFunction) {
  try {
    const {
      name,
      bankName,
      agency, // Frontend ainda envia 'agency', mas vamos salvar como 'agencyNumber'
      accountNumber,
      type,
      balance,
      agencyId,
      active,
      notes,
    }: CreateBankAccountBody = req.body;

    // Validation
    if (!name || !bankName || !agency || !accountNumber || !type) {
      throw new AppError('Missing required fields: name, bankName, agency, accountNumber, type', 400);
    }

    // Create bank account
    const bankAccount = await prisma.bankAccount.create({
      data: {
        name,
        bankName,
        agencyNumber: agency, // Mapeado para agencyNumber no schema
        accountNumber,
        type,
        balance: balance || 0,
        agencyId,
        active: active !== undefined ? active : true,
        notes,
      },
    });

    logger.info(`[Finance] Bank account created: ${bankAccount.id} - ${bankAccount.name}`);

    res.status(201).json({
      success: true,
      data: bankAccount,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/finance/bank-accounts
 * Lists all bank accounts with optional filters
 */
export async function listBankAccounts(req: Request, res: Response, next: NextFunction) {
  try {
    const { agencyId, active } = req.query;

    const where: any = {};

    if (agencyId) {
      where.agencyId = agencyId as string;
    }

    if (active !== undefined) {
      where.active = active === 'true';
    }

    const bankAccounts = await prisma.bankAccount.findMany({
      where,
      orderBy: {
        name: 'asc',
      },
    });

    res.json({
      success: true,
      data: bankAccounts,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/finance/bank-accounts/:id
 * Updates a bank account
 */
export async function updateBankAccount(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check if bank account exists
    const existing = await prisma.bankAccount.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new AppError('Bank account not found', 404);
    }

    // Map 'agency' to 'agencyNumber' if present
    if (updateData.agency) {
      updateData.agencyNumber = updateData.agency;
      delete updateData.agency;
    }

    // Update bank account
    const bankAccount = await prisma.bankAccount.update({
      where: { id },
      data: updateData,
    });

    logger.info(`[Finance] Bank account updated: ${bankAccount.id}`);

    res.json({
      success: true,
      data: bankAccount,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/finance/bank-accounts/:id
 * Deletes a bank account
 */
export async function deleteBankAccount(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;

    // Check if bank account exists
    const existing = await prisma.bankAccount.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new AppError('Bank account not found', 404);
    }

    // Delete bank account
    await prisma.bankAccount.delete({
      where: { id },
    });

    logger.info(`[Finance] Bank account deleted: ${id}`);

    res.json({
      success: true,
      message: 'Bank account deleted successfully',
    });
  } catch (error) {
    next(error);
  }
}

// ============================================
// DASHBOARD & SUMMARY
// ============================================

/**
 * GET /api/finance/summary
 * Gets financial summary (dashboard data)
 */
export async function getFinancialSummary(req: Request, res: Response, next: NextFunction) {
  try {
    const { agencyId } = req.query;

    const where: any = {};

    if (agencyId) {
      where.agencyId = agencyId as string;
    }

    // Calculate totals
    const [
      totalPayable,
      totalReceivable,
      overduePayables,
      overdueReceivables,
      totalBankBalance,
    ] = await Promise.all([
      // Total a Pagar (PENDING)
      prisma.accountsPayable.aggregate({
        where: { ...where, status: 'PENDING' },
        _sum: { amount: true },
      }),
      // Total a Receber (PENDING)
      prisma.accountsReceivable.aggregate({
        where: { ...where, status: 'PENDING' },
        _sum: { amount: true },
      }),
      // Contas Vencidas a Pagar
      prisma.accountsPayable.count({
        where: {
          ...where,
          status: 'PENDING',
          dueDate: { lt: new Date() },
        },
      }),
      // Contas Vencidas a Receber
      prisma.accountsReceivable.count({
        where: {
          ...where,
          status: 'PENDING',
          dueDate: { lt: new Date() },
        },
      }),
      // Saldo Total em Bancos
      prisma.bankAccount.aggregate({
        where: { ...where, active: true },
        _sum: { balance: true },
      }),
    ]);

    const summary = {
      payables: {
        total: totalPayable._sum.amount || 0,
        overdue: overduePayables,
      },
      receivables: {
        total: totalReceivable._sum.amount || 0,
        overdue: overdueReceivables,
      },
      bankAccounts: {
        totalBalance: totalBankBalance._sum.balance || 0,
      },
      cashFlow: {
        net: (totalReceivable._sum.amount || 0) - (totalPayable._sum.amount || 0),
      },
    };

    res.json({
      success: true,
      data: summary,
    });
  } catch (error) {
    next(error);
  }
}
