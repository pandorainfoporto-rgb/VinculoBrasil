// ============================================
// FINANCE CONTROLLER - Módulo Financeiro V2
// ============================================
import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';
import { AppError } from '../middleware/error-handler.js';
// ============================================
// BANK REGISTRY (Bancos e Gateways)
// ============================================
/**
 * GET /api/finance/bank-registry
 * Lists all available banks and gateways
 */
export async function listBankRegistry(req, res, next) {
    try {
        const { isGateway } = req.query;
        const where = { isActive: true };
        if (isGateway !== undefined) {
            where.isGateway = isGateway === 'true';
        }
        const banks = await prisma.bankRegistry.findMany({
            where,
            orderBy: { name: 'asc' },
        });
        res.json({
            success: true,
            data: banks,
        });
    }
    catch (error) {
        next(error);
    }
}
// ============================================
// ACCOUNTS PAYABLE (Contas a Pagar)
// ============================================
/**
 * POST /api/finance/payables
 * Creates a new account payable (conta a pagar)
 */
export async function createPayable(req, res, next) {
    try {
        const { description, amount, dueDate, supplierId, supplierName, category, barcode, isRecurring, recurrenceInterval, agencyId, notes, } = req.body;
        // Validation
        if (!description || !amount || !dueDate) {
            throw new AppError(400, 'Missing required fields: description, amount, dueDate');
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
    }
    catch (error) {
        next(error);
    }
}
/**
 * GET /api/finance/payables
 * Lists all accounts payable with optional filters
 */
export async function listPayables(req, res, next) {
    try {
        const { agencyId, status, search } = req.query;
        const where = {};
        if (agencyId) {
            where.agencyId = agencyId;
        }
        if (status) {
            where.status = status;
        }
        if (search) {
            where.OR = [
                { description: { contains: search, mode: 'insensitive' } },
                { supplierName: { contains: search, mode: 'insensitive' } },
                { category: { contains: search, mode: 'insensitive' } },
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
    }
    catch (error) {
        next(error);
    }
}
/**
 * PUT /api/finance/payables/:id/pay
 * Marks a payable as paid
 */
export async function payBill(req, res, next) {
    try {
        const { id } = req.params;
        const { paymentMethod, paymentDate } = req.body;
        // Check if payable exists
        const existing = await prisma.accountsPayable.findUnique({
            where: { id },
        });
        if (!existing) {
            throw new AppError(404, 'Payable not found');
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
    }
    catch (error) {
        next(error);
    }
}
/**
 * PUT /api/finance/payables/:id
 * Updates a payable
 */
export async function updatePayable(req, res, next) {
    try {
        const { id } = req.params;
        const updateData = req.body;
        // Check if payable exists
        const existing = await prisma.accountsPayable.findUnique({
            where: { id },
        });
        if (!existing) {
            throw new AppError(404, 'Payable not found');
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
    }
    catch (error) {
        next(error);
    }
}
/**
 * DELETE /api/finance/payables/:id
 * Deletes a payable
 */
export async function deletePayable(req, res, next) {
    try {
        const { id } = req.params;
        // Check if payable exists
        const existing = await prisma.accountsPayable.findUnique({
            where: { id },
        });
        if (!existing) {
            throw new AppError(404, 'Payable not found');
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
    }
    catch (error) {
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
export async function createReceivable(req, res, next) {
    try {
        const { description, amount, dueDate, origin, clientType, type, agencyId, notes, } = req.body;
        // Validation
        if (!description || !amount || !dueDate) {
            throw new AppError(400, 'Missing required fields: description, amount, dueDate');
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
    }
    catch (error) {
        next(error);
    }
}
/**
 * GET /api/finance/receivables
 * Lists all accounts receivable with optional filters
 */
export async function listReceivables(req, res, next) {
    try {
        const { agencyId, status, search } = req.query;
        const where = {};
        if (agencyId) {
            where.agencyId = agencyId;
        }
        if (status) {
            where.status = status;
        }
        if (search) {
            where.OR = [
                { description: { contains: search, mode: 'insensitive' } },
                { origin: { contains: search, mode: 'insensitive' } },
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
    }
    catch (error) {
        next(error);
    }
}
/**
 * PUT /api/finance/receivables/:id/receive
 * Marks a receivable as received
 */
export async function receivePayment(req, res, next) {
    try {
        const { id } = req.params;
        const { paymentMethod, receivedDate, receivedAmount } = req.body;
        // Check if receivable exists
        const existing = await prisma.accountsReceivable.findUnique({
            where: { id },
        });
        if (!existing) {
            throw new AppError(404, 'Receivable not found');
        }
        // Determine status based on received amount
        let status = 'PAID';
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
    }
    catch (error) {
        next(error);
    }
}
/**
 * PUT /api/finance/receivables/:id
 * Updates a receivable
 */
export async function updateReceivable(req, res, next) {
    try {
        const { id } = req.params;
        const updateData = req.body;
        // Check if receivable exists
        const existing = await prisma.accountsReceivable.findUnique({
            where: { id },
        });
        if (!existing) {
            throw new AppError(404, 'Receivable not found');
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
    }
    catch (error) {
        next(error);
    }
}
/**
 * DELETE /api/finance/receivables/:id
 * Deletes a receivable
 */
export async function deleteReceivable(req, res, next) {
    try {
        const { id } = req.params;
        // Check if receivable exists
        const existing = await prisma.accountsReceivable.findUnique({
            where: { id },
        });
        if (!existing) {
            throw new AppError(404, 'Receivable not found');
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
    }
    catch (error) {
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
export async function createBankAccount(req, res, next) {
    try {
        const { name, bankName, agency, // Frontend ainda envia 'agency', mas vamos salvar como 'agencyNumber'
        accountNumber, type, balance, agencyId, active, notes, } = req.body;
        // Validation
        if (!name || !type) {
            throw new AppError(400, 'Missing required fields: name, type');
        }
        if (type === 'CHECKING' || type === 'SAVINGS') {
            if (!bankName || !agency || !accountNumber) {
                throw new AppError(400, 'Missing required fields for bank account: bankName, agency, accountNumber');
            }
        }
        else if (type === 'GATEWAY') {
            if (!bankName) {
                throw new AppError(400, 'Gateway name is required');
            }
            // Gateways valid logic can be expanded here
        }
        else if (type === 'CASH') {
            // Cash doesn't need bank details
        }
        // Create bank account
        const bankAccount = await prisma.bankAccount.create({
            data: {
                name,
                bankName: type === 'CASH' ? null : bankName,
                agencyNumber: type === 'CASH' ? null : agency, // Mapeado para agencyNumber no schema
                accountNumber: type === 'CASH' ? null : accountNumber,
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
    }
    catch (error) {
        next(error);
    }
}
/**
 * GET /api/finance/bank-accounts
 * Lists all bank accounts with optional filters
 */
export async function listBankAccounts(req, res, next) {
    try {
        const { agencyId, active } = req.query;
        const where = {};
        if (agencyId) {
            where.agencyId = agencyId;
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
    }
    catch (error) {
        next(error);
    }
}
/**
 * PUT /api/finance/bank-accounts/:id
 * Updates a bank account
 */
export async function updateBankAccount(req, res, next) {
    try {
        const { id } = req.params;
        const updateData = req.body;
        // Check if bank account exists
        const existing = await prisma.bankAccount.findUnique({
            where: { id },
        });
        if (!existing) {
            throw new AppError(404, 'Bank account not found');
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
    }
    catch (error) {
        next(error);
    }
}
/**
 * DELETE /api/finance/bank-accounts/:id
 * Deletes a bank account
 */
export async function deleteBankAccount(req, res, next) {
    try {
        const { id } = req.params;
        // Check if bank account exists
        const existing = await prisma.bankAccount.findUnique({
            where: { id },
        });
        if (!existing) {
            throw new AppError(404, 'Bank account not found');
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
    }
    catch (error) {
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
export async function getFinancialSummary(req, res, next) {
    try {
        const { agencyId } = req.query;
        const where = {};
        if (agencyId) {
            where.agencyId = agencyId;
        }
        // Calculate totals
        const [totalPayable, totalReceivable, overduePayables, overdueReceivables, totalBankBalance,] = await Promise.all([
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
    }
    catch (error) {
        next(error);
    }
}
//# sourceMappingURL=finance.controller.js.map