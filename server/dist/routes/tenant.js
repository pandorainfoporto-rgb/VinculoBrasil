// ============================================
// TENANT PORTAL - Backend Routes
// API para o portal do inquilino
// ============================================
import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/error-handler';
const router = Router();
// Middleware para verificar se o usuario e inquilino
const requireTenant = async (req, res, next) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            throw new AppError(401, 'Usuario nao autenticado');
        }
        next();
    }
    catch (error) {
        next(error);
    }
};
// ============================================
// GET /api/tenant/dashboard
// Dashboard principal do inquilino
// ============================================
router.get('/dashboard', requireTenant, async (req, res, next) => {
    try {
        const userId = req.user?.id;
        // Busca usuario
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                cpf: true,
                phone: true,
            },
        });
        if (!user) {
            throw new AppError(404, 'Usuario nao encontrado');
        }
        // Busca contrato ativo onde o usuario e inquilino
        // Nota: Dependendo do schema, pode ser por tenantId ou tenantEmail
        const contract = await prisma.contract.findFirst({
            where: {
                OR: [
                    { tenantId: userId },
                    { tenantEmail: user.email },
                ],
                status: { in: ['ACTIVE', 'PENDING', 'SIGNED'] },
            },
            include: {
                property: {
                    select: {
                        id: true,
                        title: true,
                        address: true,
                        city: true,
                        state: true,
                        zipCode: true,
                        coverImage: true,
                        bedrooms: true,
                        bathrooms: true,
                        area: true,
                    },
                },
                agency: {
                    select: {
                        id: true,
                        name: true,
                        phone: true,
                        email: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        if (!contract) {
            return res.json({
                hasContract: false,
                tenant: {
                    name: user.name,
                    email: user.email,
                },
            });
        }
        // Mock de proxima fatura (quando integrarmos com Asaas)
        const nextBill = {
            id: `FAT-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`,
            dueDate: new Date(new Date().getFullYear(), new Date().getMonth(), 25).toISOString(),
            amount: (contract.rentAmount || 0) + (contract.condoFee || 0) + ((contract.iptuValue || 0) / 12),
            breakdown: {
                rent: contract.rentAmount || 0,
                condo: contract.condoFee || 0,
                iptu: (contract.iptuValue || 0) / 12,
            },
            status: 'OPEN',
            pixCode: '00020126580014BR.GOV.BCB.PIX0136123e4567-e89b-12d3-a456-4266141740005204000053039865802BR5913Vinculo Ltda6008Sao Paulo62070503***6304E2CA',
        };
        // Mock de historico de pagamentos
        const paymentHistory = [
            { id: 1, date: new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString(), amount: nextBill.amount, status: 'PAID' },
            { id: 2, date: new Date(new Date().setMonth(new Date().getMonth() - 2)).toISOString(), amount: nextBill.amount, status: 'PAID' },
            { id: 3, date: new Date(new Date().setMonth(new Date().getMonth() - 3)).toISOString(), amount: nextBill.amount, status: 'PAID' },
        ];
        return res.json({
            hasContract: true,
            tenant: {
                name: user.name,
                email: user.email,
                cpf: user.cpf,
            },
            contract: {
                id: contract.id,
                status: contract.status,
                startDate: contract.startDate,
                endDate: contract.endDate,
                rentAmount: contract.rentAmount,
                condoFee: contract.condoFee,
                iptuMonthly: (contract.iptuValue || 0) / 12,
                property: contract.property,
                agency: contract.agency,
                contractHash: contract.nftTokenId ? `0x${contract.nftTokenId}` : null,
            },
            nextBill,
            paymentHistory,
        });
    }
    catch (error) {
        next(error);
    }
});
// ============================================
// GET /api/tenant/contract
// Detalhes do contrato ativo
// ============================================
router.get('/contract', requireTenant, async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { email: true },
        });
        if (!user) {
            throw new AppError(404, 'Usuario nao encontrado');
        }
        const contract = await prisma.contract.findFirst({
            where: {
                OR: [
                    { tenantId: userId },
                    { tenantEmail: user.email },
                ],
                status: { in: ['ACTIVE', 'PENDING', 'SIGNED'] },
            },
            include: {
                property: {
                    include: {
                        owner: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                phone: true,
                            },
                        },
                    },
                },
                agency: {
                    select: {
                        id: true,
                        name: true,
                        cnpj: true,
                        phone: true,
                        email: true,
                    },
                },
            },
        });
        if (!contract) {
            throw new AppError(404, 'Nenhum contrato ativo encontrado');
        }
        return res.json({
            contract: {
                id: contract.id,
                status: contract.status,
                createdAt: contract.createdAt,
                signedAt: contract.signedAt,
                startDate: contract.startDate,
                endDate: contract.endDate,
                durationMonths: contract.durationMonths || 12,
                rentAmount: contract.rentAmount,
                condoFee: contract.condoFee,
                iptuValue: contract.iptuValue,
                iptuMonthly: (contract.iptuValue || 0) / 12,
                totalMonthly: (contract.rentAmount || 0) + (contract.condoFee || 0) + ((contract.iptuValue || 0) / 12),
                securityDeposit: contract.securityDeposit,
                adjustmentIndex: contract.adjustmentIndex || 'IGPM',
                property: contract.property,
                owner: contract.property?.owner,
                agency: contract.agency,
                contractHash: contract.nftTokenId ? `0x${contract.nftTokenId}` : null,
                nftTokenId: contract.nftTokenId,
                warranty: {
                    type: 'DIGITAL_WARRANTY',
                    provider: 'Vinculo DeFi',
                    status: 'ACTIVE',
                    coverageAmount: (contract.rentAmount || 0) * 3,
                },
            },
        });
    }
    catch (error) {
        next(error);
    }
});
// ============================================
// GET /api/tenant/payments
// Historico de pagamentos
// ============================================
router.get('/payments', requireTenant, async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { email: true },
        });
        if (!user) {
            throw new AppError(404, 'Usuario nao encontrado');
        }
        // Busca contrato
        const contract = await prisma.contract.findFirst({
            where: {
                OR: [
                    { tenantId: userId },
                    { tenantEmail: user.email },
                ],
            },
        });
        if (!contract) {
            return res.json({ payments: [] });
        }
        // Busca pagamentos reais (quando existir a tabela)
        // Por enquanto, mock
        const baseAmount = (contract.rentAmount || 0) + (contract.condoFee || 0) + ((contract.iptuValue || 0) / 12);
        const payments = [];
        for (let i = 0; i < 12; i++) {
            const dueDate = new Date();
            dueDate.setMonth(dueDate.getMonth() - i);
            dueDate.setDate(25);
            payments.push({
                id: `FAT-${dueDate.getFullYear()}-${String(dueDate.getMonth() + 1).padStart(2, '0')}`,
                dueDate: dueDate.toISOString(),
                paidDate: i > 0 ? new Date(dueDate.setDate(dueDate.getDate() - Math.floor(Math.random() * 5))).toISOString() : null,
                amount: baseAmount,
                status: i === 0 ? 'OPEN' : 'PAID',
                breakdown: {
                    rent: contract.rentAmount || 0,
                    condo: contract.condoFee || 0,
                    iptu: (contract.iptuValue || 0) / 12,
                },
            });
        }
        return res.json({ payments });
    }
    catch (error) {
        next(error);
    }
});
// ============================================
// GET /api/tenant/profile
// Perfil do inquilino
// ============================================
router.get('/profile', requireTenant, async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                cpf: true,
                role: true,
                createdAt: true,
                emailVerified: true,
            },
        });
        if (!user) {
            throw new AppError(404, 'Usuario nao encontrado');
        }
        return res.json({
            user: {
                ...user,
                verified: !!user.emailVerified,
                verifiedAt: user.emailVerified,
                preferences: {
                    emailNotifications: true,
                    smsNotifications: false,
                    pushNotifications: true,
                    paymentReminders: true,
                },
            },
        });
    }
    catch (error) {
        next(error);
    }
});
// ============================================
// PATCH /api/tenant/profile
// Atualizar perfil do inquilino
// ============================================
router.patch('/profile', requireTenant, async (req, res, next) => {
    try {
        const userId = req.user?.id;
        const { name, phone } = req.body;
        const updated = await prisma.user.update({
            where: { id: userId },
            data: {
                ...(name && { name }),
                ...(phone && { phone }),
            },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
            },
        });
        return res.json({ user: updated, message: 'Perfil atualizado com sucesso' });
    }
    catch (error) {
        next(error);
    }
});
export default router;
//# sourceMappingURL=tenant.js.map