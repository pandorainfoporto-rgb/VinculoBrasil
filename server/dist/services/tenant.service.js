import { prisma } from '../lib/prisma.js';
import { AppError } from '../middleware/error-handler.js';
import bcrypt from 'bcryptjs';
export class TenantService {
    /**
     * List tenants with pagination and search
     */
    static async listTenants(params) {
        const page = params.page || 1;
        const limit = params.limit || 10;
        const skip = (page - 1) * limit;
        const where = {
            status: params.status,
            user: params.search
                ? {
                    OR: [
                        { name: { contains: params.search, mode: 'insensitive' } },
                        { email: { contains: params.search, mode: 'insensitive' } },
                        { cpf: { contains: params.search } },
                    ],
                }
                : undefined,
        };
        const [tenants, total] = await Promise.all([
            prisma.tenant.findMany({
                where,
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            cpf: true,
                            phone: true,
                            avatar: true,
                        },
                    },
                },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            prisma.tenant.count({ where }),
        ]);
        // Calculate RBIs (KPIs)
        const [totalTenants, activeTenants, pendingTenants, totalTickets] = await Promise.all([
            prisma.tenant.count(),
            prisma.tenant.count({ where: { status: 'ACTIVE' } }),
            prisma.tenant.count({ where: { status: 'PENDING' } }),
            // Count open tickets for context (optional but requested in dashboard)
            prisma.tenantTicket.count({ where: { status: 'OPEN' } })
        ]);
        return {
            tenants,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
            stats: {
                total: totalTenants,
                active: activeTenants,
                pending: pendingTenants,
                openTickets: totalTickets
            }
        };
    }
    /**
     * Create a new Tenant (and User if needed)
     */
    static async createTenant(data) {
        // 1. Check if User exists
        let userId = null;
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [{ email: data.email }, { cpf: data.cpf }],
            },
            include: { tenantProfile: true }
        });
        if (existingUser) {
            if (existingUser.tenantProfile) {
                throw new AppError('User is already registered as a Tenant.', 400);
            }
            userId = existingUser.id;
        }
        return await prisma.$transaction(async (tx) => {
            // Create User if not exists
            if (!userId) {
                const role = await tx.role.findFirst({ where: { slug: 'user' } }) || await tx.role.findFirst();
                if (!role)
                    throw new AppError('Role not found', 500);
                const hashedPassword = await bcrypt.hash(data.cpf.replace(/\D/g, '') || 'Vinculo2026!', 10);
                const newUser = await tx.user.create({
                    data: {
                        name: data.name,
                        email: data.email,
                        cpf: data.cpf,
                        phone: data.phone,
                        passwordHash: hashedPassword,
                        roleId: role.id,
                        status: 'ACTIVE',
                    },
                });
                userId = newUser.id;
            }
            // Create Tenant Profile
            const tenant = await tx.tenant.create({
                data: {
                    userId: userId,
                    monthlyIncome: data.monthlyIncome,
                    creditScore: data.creditScore,
                    status: 'PENDING',
                    notes: data.notes,
                },
                include: {
                    user: true
                }
            });
            return tenant;
        });
    }
    /**
     * Get Tenant by ID with detailed info (Tickets, etc)
     */
    static async getTenantById(id) {
        const tenant = await prisma.tenant.findUnique({
            where: { id },
            include: {
                user: {
                    include: {
                        ticketsRequested: {
                            orderBy: { createdAt: 'desc' },
                            take: 5
                        }
                    }
                }
            }
        });
        if (!tenant) {
            throw new AppError('Tenant not found', 404);
        }
        return tenant;
    }
    /**
     * Update Tenant Status/Info
     */
    static async updateTenant(id, data) {
        const tenant = await prisma.tenant.findUnique({ where: { id } });
        if (!tenant)
            throw new AppError('Tenant not found', 404);
        return await prisma.tenant.update({
            where: { id },
            data: {
                status: data.status,
                monthlyIncome: data.monthlyIncome,
                creditScore: data.creditScore,
                notes: data.notes,
                user: {
                    update: {
                        name: data.name,
                        phone: data.phone,
                        email: data.email
                    }
                }
            },
            include: { user: true }
        });
    }
}
//# sourceMappingURL=tenant.service.js.map