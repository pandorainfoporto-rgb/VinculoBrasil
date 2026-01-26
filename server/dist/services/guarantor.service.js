import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';
const prisma = new PrismaClient();
export const guarantorService = {
    // List Guarantors with Pagination and Search
    async list(page = 1, limit = 10, search) {
        const skip = (page - 1) * limit;
        const where = {};
        if (search) {
            where.user = {
                OR: [
                    { name: { contains: search, mode: 'insensitive' } },
                    { email: { contains: search, mode: 'insensitive' } },
                    { cpf: { contains: search } }
                ]
            };
        }
        const [guarantors, total] = await Promise.all([
            prisma.guarantor.findMany({
                where,
                include: { user: true },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            prisma.guarantor.count({ where }),
        ]);
        // KPI Aggregation
        const aggregations = await prisma.guarantor.aggregate({
            _sum: {
                totalCollateral: true,
                blockedAmount: true,
            },
            _count: {
                id: true
            }
        });
        return {
            data: guarantors,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
            stats: {
                totalGuarantors: aggregations._count.id,
                totalCollateral: Number(aggregations._sum.totalCollateral) || 0,
                activeRisk: Number(aggregations._sum.blockedAmount) || 0,
            }
        };
    },
    // Get by ID
    async getById(id) {
        return prisma.guarantor.findUnique({
            where: { id },
            include: {
                user: {
                    include: {
                        ticketsRequested: true
                    }
                }
            }
        });
    },
    // Create User + Guarantor Profile
    async create(data) {
        const existingUser = await prisma.user.findUnique({ where: { email: data.email } });
        if (existingUser) {
            const existingProfile = await prisma.guarantor.findUnique({ where: { userId: existingUser.id } });
            if (existingProfile) {
                throw new Error('User already has a guarantor profile');
            }
            return prisma.guarantor.create({
                data: {
                    userId: existingUser.id,
                    totalCollateral: data.totalCollateral || 0,
                    availableLimit: data.availableLimit || 0,
                    blockedAmount: data.blockedAmount || 0,
                    investorProfile: data.investorProfile || 'CONSERVATIVE',
                    kycStatus: data.kycStatus || 'PENDING',
                },
                include: { user: true }
            });
        }
        const passwordHash = await hash(data.password || 'Mudar@123', 6);
        // Explicitly define user create input to avoid type inference issues
        const userCreateInput = {
            name: data.name,
            email: data.email,
            passwordHash,
            cpf: data.cpf,
            phone: data.phone,
            role: {
                connect: { slug: 'guarantor' } // Assuming role exists
            }
        };
        return prisma.guarantor.create({
            data: {
                totalCollateral: data.totalCollateral || 0,
                availableLimit: data.availableLimit || 0,
                blockedAmount: data.blockedAmount || 0,
                investorProfile: data.investorProfile || 'CONSERVATIVE',
                kycStatus: data.kycStatus || 'PENDING',
                user: {
                    create: userCreateInput // Force casting to avoid complex nested type errors
                }
            },
            include: { user: true }
        });
    },
    // Update
    async update(id, data) {
        const guarantor = await prisma.guarantor.findUnique({ where: { id }, include: { user: true } });
        if (!guarantor)
            throw new Error('Guarantor not found');
        return prisma.guarantor.update({
            where: { id },
            data: {
                totalCollateral: data.totalCollateral,
                availableLimit: data.availableLimit,
                blockedAmount: data.blockedAmount,
                kycStatus: data.kycStatus,
                investorProfile: data.investorProfile,
                user: {
                    update: {
                        name: data.name,
                        phone: data.phone,
                        avatar: data.avatar,
                    }
                }
            },
            include: { user: true } // Ensure this include matches logic
        });
    }
};
//# sourceMappingURL=guarantor.service.js.map