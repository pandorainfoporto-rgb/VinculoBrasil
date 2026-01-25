// ============================================
// PAYMENTS ROUTES
// ============================================
import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../middleware/error-handler.js';
import { requirePermission } from '../middleware/auth.js';
import { createWaterfallCharge, simulateWaterfall, generateMonthlyCharges, } from '../services/asaas.service.js';
const router = Router();
// ============================================
// ASAAS INTEGRATION ROUTES (Gross-Up Waterfall)
// ============================================
/**
 * POST /api/payments/create-charge
 * Cria uma cobrança PIX com split automático (Waterfall)
 * Usa a lógica Gross-Up: rentValue = 85%, inquilino paga 100%
 */
router.post('/create-charge', requirePermission('payments.create'), async (req, res, next) => {
    try {
        const { contractId } = req.body;
        if (!contractId) {
            throw new AppError(400, 'contractId é obrigatório');
        }
        const result = await createWaterfallCharge(contractId);
        res.status(201).json({
            success: true,
            charge: result,
            message: 'Cobrança criada com sucesso',
        });
    }
    catch (error) {
        next(error);
    }
});
/**
 * POST /api/payments/simulate
 * Simula o cálculo do split sem criar cobrança
 * Útil para preview no frontend antes de finalizar contrato
 */
router.post('/simulate', async (req, res, next) => {
    try {
        const schema = z.object({
            rentValue: z.number().positive(),
            kycScore: z.number().min(0).max(100).default(50),
            suretyCost: z.number().min(0).default(30),
            agencyRate: z.number().min(0).max(1).default(0.10),
        });
        const data = schema.parse(req.body);
        const simulation = simulateWaterfall(data.rentValue, data.kycScore, data.suretyCost, data.agencyRate);
        res.json({
            success: true,
            simulation: {
                input: {
                    rentValue: data.rentValue,
                    kycScore: data.kycScore,
                    isPrime: simulation.isPrime,
                },
                output: {
                    totalCharged: simulation.totalValue,
                    baseValue: simulation.baseValue,
                    ecosystemPot: simulation.ecosystemPot,
                },
                split: {
                    owner: simulation.ownerShare,
                    agency: simulation.agencyShare,
                    guarantor: simulation.guarantorShare,
                    surety: simulation.suretyShare,
                    platform: simulation.vinculoShare,
                },
                breakdown: simulation.breakdown,
            },
        });
    }
    catch (error) {
        next(error);
    }
});
/**
 * POST /api/payments/generate-monthly
 * Gera cobranças para todos os contratos ativos com Asaas Split
 */
router.post('/generate-monthly', requirePermission('payments.create'), async (req, res, next) => {
    try {
        const { month, year } = req.body;
        if (!month || !year) {
            throw new AppError(400, 'month e year são obrigatórios');
        }
        const result = await generateMonthlyCharges(month, year);
        res.json({
            success: true,
            ...result,
            message: `${result.created} cobranças criadas, ${result.skipped} ignoradas`,
        });
    }
    catch (error) {
        next(error);
    }
});
// List payments
router.get('/', requirePermission('payments.view'), async (req, res, next) => {
    try {
        const { page = '1', limit = '10', status, contractId } = req.query;
        const where = {};
        if (status)
            where.status = status;
        if (contractId)
            where.contractId = contractId;
        const [payments, total] = await Promise.all([
            prisma.payment.findMany({
                where,
                include: {
                    contract: {
                        select: { id: true, tenantName: true, property: { select: { title: true } } },
                    },
                },
                skip: (parseInt(page) - 1) * parseInt(limit),
                take: parseInt(limit),
                orderBy: { dueDate: 'desc' },
            }),
            prisma.payment.count({ where }),
        ]);
        res.json({
            payments,
            total,
            page: parseInt(page),
            totalPages: Math.ceil(total / parseInt(limit)),
        });
    }
    catch (error) {
        next(error);
    }
});
// Get payment by ID
router.get('/:id', requirePermission('payments.view'), async (req, res, next) => {
    try {
        const payment = await prisma.payment.findUnique({
            where: { id: req.params.id },
            include: {
                contract: {
                    include: { property: true },
                },
            },
        });
        if (!payment) {
            throw new AppError(404, 'Payment not found');
        }
        res.json(payment);
    }
    catch (error) {
        next(error);
    }
});
// Create payment
router.post('/', requirePermission('payments.create'), async (req, res, next) => {
    try {
        const schema = z.object({
            contractId: z.string().uuid(),
            type: z.enum(['RENT', 'DEPOSIT', 'CONDO_FEE', 'IPTU', 'FINE', 'OTHER']),
            amount: z.number().positive(),
            dueDate: z.string().transform((s) => new Date(s)),
        });
        const data = schema.parse(req.body);
        // Buscar contrato para calcular split
        const contract = await prisma.rentContract.findUnique({
            where: { id: data.contractId },
        });
        if (!contract) {
            throw new AppError(404, 'Contract not found');
        }
        const payment = await prisma.payment.create({
            data: {
                ...data,
                ownerAmount: Number(data.amount) * Number(contract.ownerShare),
                platformAmount: Number(data.amount) * Number(contract.platformFee),
                guarantorAmount: Number(data.amount) * Number(contract.guarantorFee),
                tokenAmount: Number(data.amount) * Number(contract.tokenHolderFee),
            },
        });
        res.status(201).json(payment);
    }
    catch (error) {
        next(error);
    }
});
// Mark as paid
router.post('/:id/pay', requirePermission('payments.update'), async (req, res, next) => {
    try {
        const { gatewayId, paymentMethod } = req.body;
        const payment = await prisma.payment.update({
            where: { id: req.params.id },
            data: {
                status: 'PAID',
                paidAt: new Date(),
                gatewayId,
                paymentMethod,
            },
        });
        // TODO: Executar split no blockchain
        res.json(payment);
    }
    catch (error) {
        next(error);
    }
});
// Generate billing (bulk create)
router.post('/generate', requirePermission('payments.create'), async (req, res, next) => {
    try {
        const { month, year } = req.body;
        // Buscar contratos ativos
        const contracts = await prisma.rentContract.findMany({
            where: { status: 'ACTIVE' },
        });
        const payments = [];
        for (const contract of contracts) {
            const dueDate = new Date(year, month - 1, contract.dueDay);
            // Verificar se ja existe
            const existing = await prisma.payment.findFirst({
                where: {
                    contractId: contract.id,
                    type: 'RENT',
                    dueDate: {
                        gte: new Date(year, month - 1, 1),
                        lt: new Date(year, month, 1),
                    },
                },
            });
            if (!existing) {
                const payment = await prisma.payment.create({
                    data: {
                        contractId: contract.id,
                        type: 'RENT',
                        amount: contract.rentValue,
                        dueDate,
                        ownerAmount: Number(contract.rentValue) * Number(contract.ownerShare),
                        platformAmount: Number(contract.rentValue) * Number(contract.platformFee),
                        guarantorAmount: Number(contract.rentValue) * Number(contract.guarantorFee),
                        tokenAmount: Number(contract.rentValue) * Number(contract.tokenHolderFee),
                    },
                });
                payments.push(payment);
            }
        }
        res.json({ created: payments.length, payments });
    }
    catch (error) {
        next(error);
    }
});
export default router;
//# sourceMappingURL=payments.js.map