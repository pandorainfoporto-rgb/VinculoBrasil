// ============================================
// INSURANCE ROUTES (Seguros e Sinistros)
// ============================================
import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../middleware/error-handler.js';
const router = Router();
// ============================================
// GET /dashboard - Dashboard de Seguros
// ============================================
router.get('/dashboard', async (req, res, next) => {
    try {
        const agencyId = req.user?.agencyId;
        if (!agencyId) {
            throw new AppError(403, 'User is not associated with an agency');
        }
        // Contagem de apólices ativas
        const activePolicies = await prisma.insurancePolicy.count({
            where: {
                agencyId,
                active: true,
            },
        });
        // Contagem de apólices por tipo
        const policiesByType = await prisma.insurancePolicy.groupBy({
            by: ['type'],
            where: {
                agencyId,
                active: true,
            },
            _count: {
                id: true,
            },
        });
        // Soma total de valores de apólices ativas
        const totalPoliciesValue = await prisma.insurancePolicy.aggregate({
            where: {
                agencyId,
                active: true,
            },
            _sum: {
                value: true,
            },
        });
        // Contagem de sinistros por status
        const claimsByStatus = await prisma.claim.groupBy({
            by: ['status'],
            where: {
                agencyId,
            },
            _count: {
                id: true,
            },
        });
        // Soma total de sinistros
        const totalClaimsAmount = await prisma.claim.aggregate({
            where: {
                agencyId,
            },
            _sum: {
                amount: true,
            },
        });
        // Sinistros pagos
        const paidClaimsAmount = await prisma.claim.aggregate({
            where: {
                agencyId,
                status: 'PAID',
            },
            _sum: {
                amount: true,
            },
        });
        // Formatar contagem por tipo de apólice
        const policyTypes = {};
        for (const item of policiesByType) {
            policyTypes[item.type] = item._count.id;
        }
        // Formatar contagem por status de sinistro
        const claimStatus = {
            OPEN: 0,
            UNDER_ANALYSIS: 0,
            APPROVED: 0,
            REJECTED: 0,
            PAID: 0,
        };
        for (const item of claimsByStatus) {
            claimStatus[item.status] = item._count.id;
        }
        const totalClaims = Object.values(claimStatus).reduce((a, b) => a + b, 0);
        res.json({
            data: {
                policies: {
                    active: activePolicies,
                    totalValue: totalPoliciesValue._sum.value?.toNumber() ?? 0,
                    byType: policyTypes,
                },
                claims: {
                    total: totalClaims,
                    totalAmount: totalClaimsAmount._sum.amount?.toNumber() ?? 0,
                    paidAmount: paidClaimsAmount._sum.amount?.toNumber() ?? 0,
                    byStatus: claimStatus,
                },
            },
        });
    }
    catch (error) {
        next(error);
    }
});
export default router;
//# sourceMappingURL=insurance.js.map