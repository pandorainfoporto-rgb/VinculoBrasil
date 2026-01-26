
import api from "./api";

export interface Owner {
    id: string;
    userId: string;
    cpfCnpj: string;
    rgIe?: string;
    birthDate?: string;
    profession?: string;
    maritalStatus?: string;
    addressId?: string;

    user: {
        name: string;
        email: string;
        phone?: string;
        status: string;
        avatar?: string;
    };

    address?: {
        street: string;
        number: string;
        complement?: string;
        neighborhood: string;
        city: string;
        state: string;
        zipCode: string;
    };

    bankAccounts?: Array<{
        id: string;
        bankName?: string;
        bankCode: string;
        agencyNumber: string;
        accountNumber: string;
        type: string;
        pixKey?: string;
    }>;
}

export interface CreateOwnerPayload {
    name: string;
    email: string;
    phone?: string;
    cpf: string;
    rgIe?: string;
    birthDate?: string;
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
        accountType: string;
        pixKey?: string;
        pixKeyType?: string;
    };
}

export const ownerService = {
    async getOwners(filters?: { page?: number; limit?: number; search?: string }) {
        const { data } = await api.get("/owners", { params: filters });
        return data;
    },

    async getOwner(id: string) {
        const { data } = await api.get(`/owners/${id}`);
        return data;
    },

    async createOwner(payload: CreateOwnerPayload) {
        const { data } = await api.post("/owners", payload);
        return data;
    },

    async updateOwner(id: string, payload: Partial<CreateOwnerPayload>) {
        const { data } = await api.put(`/owners/${id}`, payload);
        return data;
    },
};
