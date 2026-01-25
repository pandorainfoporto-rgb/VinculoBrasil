// ============================================
// SERVICES ROUTES (Ordens de Serviço)
// ============================================
import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../middleware/error-handler.js';
const router = Router();
// ============================================
// GET /stats - Contagem de ServiceOrder por status
// ============================================
router.get('/stats', async (req, res, next) => {
    try {
        const agencyId = req.user?.agencyId;
        if (!agencyId) {
            throw new AppError(403, 'User is not associated with an agency');
        }
        // Contagem agrupada por status
        const statusCounts = await prisma.serviceOrder.groupBy({
            by: ['status'],
            where: {
                agencyId,
            },
            _count: {
                id: true,
            },
        });
        // Mapear para formato mais legível
        const stats = {
            PENDING: 0,
            IN_PROGRESS: 0,
            COMPLETED: 0,
            CANCELLED: 0,
        };
        for (const item of statusCounts) {
            stats[item.status] = item._count.id;
        }
        const total = Object.values(stats).reduce((a, b) => a + b, 0);
        res.json({
            data: {
                ...stats,
                total,
            },
        });
    }
    catch (error) {
        next(error);
    }
});
// ============================================
// GET /top-suppliers - Top 5 Fornecedores por rating
// ============================================
router.get('/top-suppliers', async (req, res, next) => {
    try {
        const agencyId = req.user?.agencyId;
        if (!agencyId) {
            throw new AppError(403, 'User is not associated with an agency');
        }
        const topSuppliers = await prisma.supplier.findMany({
            where: {
                agencyId,
                isActive: true,
            },
            orderBy: {
                rating: 'desc',
            },
            take: 5,
            select: {
                id: true,
                name: true,
                category: true,
                rating: true,
                phone: true,
                email: true,
                _count: {
                    select: {
                        serviceOrders: true,
                    },
                },
            },
        });
        const formatted = topSuppliers.map((supplier) => ({
            id: supplier.id,
            name: supplier.name,
            category: supplier.category,
            rating: supplier.rating,
            phone: supplier.phone,
            email: supplier.email,
            totalOrders: supplier._count.serviceOrders,
        }));
        res.json({
            data: formatted,
        });
    }
    catch (error) {
        next(error);
    }
});
export default router;
//# sourceMappingURL=services.js.map