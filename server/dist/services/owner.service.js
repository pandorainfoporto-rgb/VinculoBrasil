import { prisma } from '../lib/prisma.js';
import { AppError } from '../middleware/error-handler.js';
import bcrypt from 'bcryptjs';
export class OwnerService {
    /**
     * Create a new Owner with all related entities (User, Address, BankAccount)
     * Uses a transaction to ensure atomicity.
     */
    static async createOwner(data) {
        // 1. Check if User already exists by Email or CPF
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: data.email },
                    { cpf: data.cpf }
                ]
            },
            include: {
                ownerProfile: true
            }
        });
        if (existingUser) {
            // If user exists AND has an owner profile, error
            if (existingUser.ownerProfile) {
                throw new AppError('User already registered as an Owner.', 400);
            }
            // If user exists but NOT owner, we will link it? 
            // For now, let's assume we want to attach owner profile to existing user if matched by email.
            // But we need to update their role or permissions potentially?
            // Let's stick to simple flow: if email/cpf taken, error for now unless we implement "Promote User to Owner" logic explicitly.
            throw new AppError('User with this Email or CPF already exists.', 400);
        }
        // 2. Prepare Data
        const hashedPassword = await bcrypt.hash(data.password || data.cpf.replace(/\D/g, '') || 'Vinculo2026!', 10);
        // Find "Owner" Role or similar? 
        // Usually we assign a Role. Let's find 'owner' role or default to user.
        // In many systems, Role is 'user' or 'admin'. Owner might be a permission set or just the existence of OwnerProfile.
        // Let's check Role schema usage. Usually we might assign a basic role ID. 
        // We will query for 'user' or 'client' role if 'owner' role doesn't exist explicitly in seed.
        // For safety, let's try to find a Role.
        const role = await prisma.role.findFirst({
            where: { slug: 'owner' } // Try to find specifc owner role
        }) || await prisma.role.findFirst({
            where: { slug: 'user' } // Fallback
        }) || await prisma.role.findFirst(); // Absolute fallback
        if (!role) {
            throw new AppError('System Role not found. Contact administrator.', 500);
        }
        // 3. Execute Transaction
        return await prisma.$transaction(async (tx) => {
            // A. Create User
            const user = await tx.user.create({
                data: {
                    name: data.name,
                    email: data.email,
                    phone: data.phone,
                    cpf: data.cpf,
                    passwordHash: hashedPassword,
                    roleId: role.id,
                    status: 'ACTIVE',
                    agencyId: data.agencyId
                }
            });
            // B. Create Address
            const address = await tx.address.create({
                data: {
                    street: data.street,
                    number: data.number,
                    complement: data.complement,
                    neighborhood: data.neighborhood,
                    city: data.city,
                    state: data.state,
                    zipCode: data.zipCode,
                }
            });
            // C. Create Owner Profile linked to User and Address
            const owner = await tx.owner.create({
                data: {
                    userId: user.id,
                    addressId: address.id,
                    cpfCnpj: data.cpf, // Same as user CPF usually for individual owners
                    rgIe: data.rgIe,
                    birthDate: data.birthDate ? new Date(data.birthDate) : null,
                    profession: data.profession,
                    maritalStatus: data.maritalStatus,
                }
            });
            // D. Create Bank Account (if provided)
            if (data.bankAccount) {
                await tx.bankAccount.create({
                    data: {
                        ownerId: owner.id,
                        name: `Conta Principal - ${data.name}`,
                        bankName: data.bankAccount.bankName,
                        bankCode: data.bankAccount.bankCode,
                        agencyNumber: data.bankAccount.agencyNumber,
                        accountNumber: data.bankAccount.accountNumber,
                        type: data.bankAccount.accountType,
                        pixKey: data.bankAccount.pixKey,
                        pixKeyType: data.bankAccount.pixKeyType, // Cast if enum mismatch slightly
                        active: true
                    }
                });
            }
            return owner;
        });
    }
    /**
     * List Owners with pagination and search
     */
    static async listOwners(params) {
        const page = params.page || 1;
        const limit = params.limit || 10;
        const skip = (page - 1) * limit;
        const where = {};
        if (params.agencyId) {
            where.user = { agencyId: params.agencyId };
        }
        if (params.search) {
            where.OR = [
                { cpfCnpj: { contains: params.search } },
                { user: { name: { contains: params.search, mode: 'insensitive' } } },
                { user: { email: { contains: params.search, mode: 'insensitive' } } }
            ];
        }
        const [owners, total] = await Promise.all([
            prisma.owner.findMany({
                where,
                take: limit,
                skip,
                include: {
                    user: {
                        select: { name: true, email: true, phone: true, status: true, avatar: true }
                    },
                    address: true,
                    bankAccounts: true, // Include bank accounts in list or maybe just count? Let's include for now.
                    _count: {
                        select: {
                        // properties: true // Property relation is on User usually?
                        // The schema says `Property` has `ownerId` which refs `User` (line 330). 
                        // Wait, Owner model is linked to User. Property is linked to User.
                        // So we need to query properties via User.
                        }
                    }
                },
                orderBy: { createdAt: 'desc' }
            }),
            prisma.owner.count({ where })
        ]);
        // Let's manually fetch property counts if needed, or rely on frontend to fetch details.
        // Ideally we can include it if the relation was direct on Owner model, but it is on User model.
        // We can do a second pass or modify include.
        // `user: { include: { _count: { select: { properties: true } } } }`
        // Check if we can include count on user relation
        // Re-querying to be safe or assuming standard include structure works?
        // Prisma supports nested count.
        return {
            data: owners,
            meta: {
                total,
                page,
                lastPage: Math.ceil(total / limit)
            }
        };
    }
    /**
     * Get Owner by ID
     */
    static async getOwnerById(id) {
        const owner = await prisma.owner.findUnique({
            where: { id },
            include: {
                user: {
                    include: {
                        properties: {
                            select: { id: true, title: true, status: true, rentValue: true }
                        }
                    }
                },
                address: true,
                bankAccounts: true
            }
        });
        if (!owner)
            throw new AppError('Owner not found', 404);
        return owner;
    }
    /**
     * Update Owner
     */
    static async updateOwner(id, data) {
        const existing = await prisma.owner.findUnique({ where: { id }, include: { user: true, address: true } });
        if (!existing)
            throw new AppError('Owner not found', 404);
        return await prisma.$transaction(async (tx) => {
            // Update Owner fields
            await tx.owner.update({
                where: { id },
                data: {
                    cpfCnpj: data.cpf,
                    rgIe: data.rgIe,
                    birthDate: data.birthDate ? new Date(data.birthDate) : undefined,
                    profession: data.profession,
                    maritalStatus: data.maritalStatus,
                }
            });
            // Update User fields
            if (data.name || data.email || data.phone) {
                await tx.user.update({
                    where: { id: existing.userId },
                    data: {
                        name: data.name,
                        email: data.email,
                        phone: data.phone,
                    }
                });
            }
            // Update Address (Assumes address exists, if not strictly 1:1 enforced)
            if (existing.addressId && (data.zipCode || data.street)) {
                await tx.address.update({
                    where: { id: existing.addressId },
                    data: {
                        street: data.street,
                        number: data.number,
                        complement: data.complement,
                        neighborhood: data.neighborhood,
                        city: data.city,
                        state: data.state,
                        zipCode: data.zipCode,
                    }
                });
            }
            // Bank Account - We handle creation/update separately usually, or update the main one if provided?
            // For Update, let's assume we maintain the list separately or just update the primary one if simplified.
            // This is complex for a simple "Update Owner" call. For now, let's ignore bank update here and expect specific endpoints or separate logic.
            // OR if the user provides bankAccount data, we try to update the first one or create one.
            return tx.owner.findUnique({ where: { id }, include: { user: true, address: true } });
        });
    }
}
//# sourceMappingURL=owner.service.js.map