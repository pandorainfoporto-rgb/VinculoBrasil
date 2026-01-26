interface CreateOwnerData {
    name: string;
    email: string;
    phone?: string;
    cpf: string;
    password?: string;
    rgIe?: string;
    birthDate?: string | Date;
    profession?: string;
    maritalStatus?: string;
    zipCode: string;
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    bankAccount?: {
        bankCode: string;
        bankName?: string;
        agencyNumber: string;
        accountNumber: string;
        accountType: 'CHECKING' | 'SAVINGS';
        pixKey?: string;
        pixKeyType?: 'CPF' | 'CNPJ' | 'EMAIL' | 'PHONE' | 'RANDOM';
    };
    agencyId?: string;
}
export declare class OwnerService {
    /**
     * Create a new Owner with all related entities (User, Address, BankAccount)
     * Uses a transaction to ensure atomicity.
     */
    static createOwner(data: CreateOwnerData): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        cpfCnpj: string;
        rgIe: string | null;
        birthDate: Date | null;
        profession: string | null;
        maritalStatus: string | null;
        addressId: string | null;
    }>;
    /**
     * List Owners with pagination and search
     */
    static listOwners(params: {
        page?: number;
        limit?: number;
        search?: string;
        agencyId?: string;
    }): Promise<{
        data: ({
            address: {
                number: string;
                id: string;
                createdAt: Date;
                updatedAt: Date;
                city: string;
                state: string;
                zipCode: string;
                street: string;
                complement: string | null;
                neighborhood: string;
                country: string | null;
            };
            user: {
                name: string;
                email: string;
                phone: string;
                avatar: string;
                status: import(".prisma/client").$Enums.UserStatus;
            };
            _count: {};
            bankAccounts: {
                name: string;
                id: string;
                agencyId: string | null;
                createdAt: Date;
                updatedAt: Date;
                active: boolean;
                type: import(".prisma/client").$Enums.BankAccountType;
                balance: import("@prisma/client/runtime/library").Decimal;
                ownerId: string | null;
                notes: string | null;
                bankName: string | null;
                accountNumber: string | null;
                agencyNumber: string | null;
            }[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            userId: string;
            cpfCnpj: string;
            rgIe: string | null;
            birthDate: Date | null;
            profession: string | null;
            maritalStatus: string | null;
            addressId: string | null;
        })[];
        meta: {
            total: number;
            page: number;
            lastPage: number;
        };
    }>;
    /**
     * Get Owner by ID
     */
    static getOwnerById(id: string): Promise<{
        address: {
            number: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            city: string;
            state: string;
            zipCode: string;
            street: string;
            complement: string | null;
            neighborhood: string;
            country: string | null;
        };
        user: {
            properties: {
                id: string;
                status: import(".prisma/client").$Enums.PropertyStatus;
                rentValue: import("@prisma/client/runtime/library").Decimal;
                title: string;
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
        bankAccounts: {
            name: string;
            id: string;
            agencyId: string | null;
            createdAt: Date;
            updatedAt: Date;
            active: boolean;
            type: import(".prisma/client").$Enums.BankAccountType;
            balance: import("@prisma/client/runtime/library").Decimal;
            ownerId: string | null;
            notes: string | null;
            bankName: string | null;
            accountNumber: string | null;
            agencyNumber: string | null;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        cpfCnpj: string;
        rgIe: string | null;
        birthDate: Date | null;
        profession: string | null;
        maritalStatus: string | null;
        addressId: string | null;
    }>;
    /**
     * Update Owner
     */
    static updateOwner(id: string, data: Partial<CreateOwnerData>): Promise<{
        address: {
            number: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            city: string;
            state: string;
            zipCode: string;
            street: string;
            complement: string | null;
            neighborhood: string;
            country: string | null;
        };
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
        cpfCnpj: string;
        rgIe: string | null;
        birthDate: Date | null;
        profession: string | null;
        maritalStatus: string | null;
        addressId: string | null;
    }>;
}
export {};
//# sourceMappingURL=owner.service.d.ts.map