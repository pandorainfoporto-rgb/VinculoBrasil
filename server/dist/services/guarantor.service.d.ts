import { Prisma } from '@prisma/client';
type GuarantorKYCStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
type GuarantorProfile = 'CONSERVATIVE' | 'MODERATE' | 'AGGRESSIVE';
export interface CreateGuarantorDTO {
    name: string;
    email: string;
    password?: string;
    phone?: string;
    cpf?: string;
    totalCollateral?: number;
    availableLimit?: number;
    blockedAmount?: number;
    investorProfile?: GuarantorProfile;
    kycStatus?: GuarantorKYCStatus;
}
export interface UpdateGuarantorDTO {
    name?: string;
    phone?: string;
    avatar?: string;
    totalCollateral?: number;
    availableLimit?: number;
    blockedAmount?: number;
    kycStatus?: GuarantorKYCStatus;
    investorProfile?: GuarantorProfile;
}
export declare const guarantorService: {
    list(page?: number, limit?: number, search?: string): Promise<{
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
            investorProfile: import(".prisma/client").$Enums.GuarantorProfile;
            userId: string;
            totalCollateral: Prisma.Decimal;
            availableLimit: Prisma.Decimal;
            blockedAmount: Prisma.Decimal;
            kycStatus: import(".prisma/client").$Enums.GuarantorKYCStatus;
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
        stats: {
            totalGuarantors: number;
            totalCollateral: number;
            activeRisk: number;
        };
    }>;
    getById(id: string): Promise<{
        user: {
            ticketsRequested: {
                id: string;
                status: import(".prisma/client").$Enums.TicketState;
                createdAt: Date;
                updatedAt: Date;
                description: string | null;
                title: string;
                priority: import(".prisma/client").$Enums.TicketLevel;
                closedAt: Date | null;
                requesterId: string;
                assigneeId: string | null;
            }[];
        } & {
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
        investorProfile: import(".prisma/client").$Enums.GuarantorProfile;
        userId: string;
        totalCollateral: Prisma.Decimal;
        availableLimit: Prisma.Decimal;
        blockedAmount: Prisma.Decimal;
        kycStatus: import(".prisma/client").$Enums.GuarantorKYCStatus;
    }>;
    create(data: CreateGuarantorDTO): Promise<{
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
        investorProfile: import(".prisma/client").$Enums.GuarantorProfile;
        userId: string;
        totalCollateral: Prisma.Decimal;
        availableLimit: Prisma.Decimal;
        blockedAmount: Prisma.Decimal;
        kycStatus: import(".prisma/client").$Enums.GuarantorKYCStatus;
    }>;
    update(id: string, data: UpdateGuarantorDTO): Promise<{
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
        investorProfile: import(".prisma/client").$Enums.GuarantorProfile;
        userId: string;
        totalCollateral: Prisma.Decimal;
        availableLimit: Prisma.Decimal;
        blockedAmount: Prisma.Decimal;
        kycStatus: import(".prisma/client").$Enums.GuarantorKYCStatus;
    }>;
};
export {};
//# sourceMappingURL=guarantor.service.d.ts.map