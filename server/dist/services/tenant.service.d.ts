import { TenantStatus, Prisma } from '@prisma/client';
export interface CreateTenantData {
    name: string;
    email: string;
    cpf: string;
    phone?: string;
    monthlyIncome?: number;
    creditScore?: number;
    notes?: string;
}
export declare class TenantService {
    /**
     * List tenants with pagination and search
     */
    static listTenants(params: {
        page?: number;
        limit?: number;
        search?: string;
        status?: TenantStatus;
    }): Promise<{
        tenants: ({
            user: {
                name: string;
                id: string;
                email: string;
                cpf: string;
                phone: string;
                avatar: string;
            };
        } & {
            id: string;
            status: import(".prisma/client").$Enums.TenantStatus;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            notes: string | null;
            monthlyIncome: Prisma.Decimal | null;
            creditScore: number | null;
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
        stats: {
            total: number;
            active: number;
            pending: number;
            openTickets: number;
        };
    }>;
    /**
     * Create a new Tenant (and User if needed)
     */
    static createTenant(data: CreateTenantData): Promise<{
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
        status: import(".prisma/client").$Enums.TenantStatus;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        notes: string | null;
        monthlyIncome: Prisma.Decimal | null;
        creditScore: number | null;
    }>;
    /**
     * Get Tenant by ID with detailed info (Tickets, etc)
     */
    static getTenantById(id: string): Promise<{
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
        status: import(".prisma/client").$Enums.TenantStatus;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        notes: string | null;
        monthlyIncome: Prisma.Decimal | null;
        creditScore: number | null;
    }>;
    /**
     * Update Tenant Status/Info
     */
    static updateTenant(id: string, data: Partial<CreateTenantData> & {
        status?: TenantStatus;
    }): Promise<{
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
        status: import(".prisma/client").$Enums.TenantStatus;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        notes: string | null;
        monthlyIncome: Prisma.Decimal | null;
        creditScore: number | null;
    }>;
}
//# sourceMappingURL=tenant.service.d.ts.map