import { Prisma } from '@prisma/client';
export type InvestorWithUser = Prisma.InvestorGetPayload<{
    include: {
        user: true;
    };
}>;
export interface CreateInvestorInput {
    name: string;
    email: string;
    password?: string;
    cpf?: string;
    phone?: string;
    kycLevel?: number;
    walletAddress?: string;
    vbrzBalance?: number;
}
export interface UpdateInvestorInput {
    name?: string;
    phone?: string;
    kycLevel?: number;
    walletAddress?: string;
    vbrzBalance?: number;
}
export declare const investorService: {
    /**
     * List investors with pagination and VBRz stats
     */
    list: (page?: number, limit?: number, search?: string) => Promise<{
        data: ({
            user: {
                bankAccount: string | null;
                name: string;
                id: string;
                email: string;
                cpf: string | null;
                passwordHash: string;
                phone: string | null;
                avatar: string | null;
                status: import(".prisma/client").$Enums.UserStatus;
                emailVerified: boolean;
                phoneVerified: boolean;
                twoFactorEnabled: boolean;
                twoFactorSecret: string | null;
                pixKey: string | null;
                pixKeyType: string | null;
                bankCode: string | null;
                bankAgency: string | null;
                bankAccountType: string | null;
                managedWalletAddress: string | null;
                managedWalletEncryptedKey: string | null;
                roleId: string;
                agencyId: string | null;
                createdAt: Date;
                updatedAt: Date;
                lastLoginAt: Date | null;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            vbrzBalance: Prisma.Decimal;
            walletAddress: string | null;
            kycLevel: number;
            totalInvestedP2P: Prisma.Decimal;
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
        stats: {
            totalInvestors: number;
            totalVBRzCirculation: number | Prisma.Decimal;
            totalP2PVolume: number | Prisma.Decimal;
        };
    }>;
    /**
     * Get investor by ID
     */
    getById: (id: string) => Promise<{
        user: {
            bankAccount: string | null;
            name: string;
            id: string;
            email: string;
            cpf: string | null;
            passwordHash: string;
            phone: string | null;
            avatar: string | null;
            status: import(".prisma/client").$Enums.UserStatus;
            emailVerified: boolean;
            phoneVerified: boolean;
            twoFactorEnabled: boolean;
            twoFactorSecret: string | null;
            pixKey: string | null;
            pixKeyType: string | null;
            bankCode: string | null;
            bankAgency: string | null;
            bankAccountType: string | null;
            managedWalletAddress: string | null;
            managedWalletEncryptedKey: string | null;
            roleId: string;
            agencyId: string | null;
            createdAt: Date;
            updatedAt: Date;
            lastLoginAt: Date | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        vbrzBalance: Prisma.Decimal;
        walletAddress: string | null;
        kycLevel: number;
        totalInvestedP2P: Prisma.Decimal;
    }>;
    /**
     * Create new investor (and user if not exists or link)
     * For now, assumes new user creation for simplicity in Admin context
     */
    create: (data: CreateInvestorInput) => Promise<{
        user: {
            bankAccount: string | null;
            name: string;
            id: string;
            email: string;
            cpf: string | null;
            passwordHash: string;
            phone: string | null;
            avatar: string | null;
            status: import(".prisma/client").$Enums.UserStatus;
            emailVerified: boolean;
            phoneVerified: boolean;
            twoFactorEnabled: boolean;
            twoFactorSecret: string | null;
            pixKey: string | null;
            pixKeyType: string | null;
            bankCode: string | null;
            bankAgency: string | null;
            bankAccountType: string | null;
            managedWalletAddress: string | null;
            managedWalletEncryptedKey: string | null;
            roleId: string;
            agencyId: string | null;
            createdAt: Date;
            updatedAt: Date;
            lastLoginAt: Date | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        vbrzBalance: Prisma.Decimal;
        walletAddress: string | null;
        kycLevel: number;
        totalInvestedP2P: Prisma.Decimal;
    }>;
    /**
     * Update investor profile (User + Investor)
     */
    update: (id: string, data: UpdateInvestorInput) => Promise<{
        user: {
            bankAccount: string | null;
            name: string;
            id: string;
            email: string;
            cpf: string | null;
            passwordHash: string;
            phone: string | null;
            avatar: string | null;
            status: import(".prisma/client").$Enums.UserStatus;
            emailVerified: boolean;
            phoneVerified: boolean;
            twoFactorEnabled: boolean;
            twoFactorSecret: string | null;
            pixKey: string | null;
            pixKeyType: string | null;
            bankCode: string | null;
            bankAgency: string | null;
            bankAccountType: string | null;
            managedWalletAddress: string | null;
            managedWalletEncryptedKey: string | null;
            roleId: string;
            agencyId: string | null;
            createdAt: Date;
            updatedAt: Date;
            lastLoginAt: Date | null;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        vbrzBalance: Prisma.Decimal;
        walletAddress: string | null;
        kycLevel: number;
        totalInvestedP2P: Prisma.Decimal;
    }>;
};
//# sourceMappingURL=investor.service.d.ts.map