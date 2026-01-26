import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
const prisma = new PrismaClient();
export const investorService = {
    /**
     * List investors with pagination and VBRz stats
     */
    list: async (page = 1, limit = 10, search) => {
        const skip = (page - 1) * limit;
        const where = search
            ? {
                user: {
                    OR: [
                        { name: { contains: search, mode: 'insensitive' } },
                        { email: { contains: search, mode: 'insensitive' } },
                        { cpf: { contains: search } },
                    ],
                },
            }
            : {};
        const [investors, total] = await Promise.all([
            prisma.investor.findMany({
                where,
                include: { user: true },
                skip,
                take: limit,
                orderBy: { vbrzBalance: 'desc' }, // Default sort: Top Holders
            }),
            prisma.investor.count({ where }),
        ]);
        // Aggregate Stats (Tokenomics)
        const aggregations = await prisma.investor.aggregate({
            _sum: {
                vbrzBalance: true,
                totalInvestedP2P: true,
            },
        });
        return {
            data: investors,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
            stats: {
                totalInvestors: total,
                totalVBRzCirculation: aggregations._sum.vbrzBalance || 0,
                totalP2PVolume: aggregations._sum.totalInvestedP2P || 0,
            },
        };
    },
    /**
     * Get investor by ID
     */
    getById: async (id) => {
        return prisma.investor.findUnique({
            where: { id },
            include: { user: true },
        });
    },
    /**
     * Create new investor (and user if not exists or link)
     * For now, assumes new user creation for simplicity in Admin context
     */
    create: async (data) => {
        const hashedPassword = await bcrypt.hash(data.password || 'MudaSenha123!', 10);
        // Transaction to ensure atomic creation
        return prisma.$transaction(async (tx) => {
            // Create User
            const user = await tx.user.create({
                data: {
                    name: data.name,
                    email: data.email,
                    passwordHash: hashedPassword,
                    roleId: await tx.role.findUnique({ where: { slug: 'investor' } }).then(r => r?.id || ''),
                    cpf: data.cpf,
                    phone: data.phone,
                },
            });
            // Create Investor Profile
            const investor = await tx.investor.create({
                data: {
                    userId: user.id,
                    kycLevel: data.kycLevel || 1,
                    walletAddress: data.walletAddress,
                    vbrzBalance: data.vbrzBalance || 0,
                },
                include: { user: true },
            });
            return investor;
        });
    },
    /**
     * Update investor profile (User + Investor)
     */
    update: async (id, data) => {
        return prisma.$transaction(async (tx) => {
            const investorHelper = await tx.investor.findUnique({
                where: { id },
                select: { userId: true }
            });
            if (!investorHelper)
                throw new Error("Investor not found");
            // Update User fields
            if (data.name || data.phone) {
                await tx.user.update({
                    where: { id: investorHelper.userId },
                    data: {
                        name: data.name,
                        phone: data.phone,
                    }
                });
            }
            // Update Investor fields
            return tx.investor.update({
                where: { id },
                data: {
                    kycLevel: data.kycLevel,
                    walletAddress: data.walletAddress,
                    vbrzBalance: data.vbrzBalance,
                },
                include: { user: true },
            });
        });
    },
};
//# sourceMappingURL=investor.service.js.map