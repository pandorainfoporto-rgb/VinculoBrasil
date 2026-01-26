
import api from "./api";

export interface Guarantor {
    id: string;
    userId: string;
    totalCollateral: number;
    availableLimit: number;
    blockedAmount: number;
    investorProfile: 'CONSERVATIVE' | 'MODERATE' | 'AGGRESSIVE';
    kycStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
    user: {
        name: string;
        email: string;
        phone?: string;
        cpf?: string;
        avatar?: string;
    };
    createdAt: string;
}

export interface CreateGuarantorPayload {
    name: string;
    email: string;
    cpf?: string;
    phone?: string;
    totalCollateral?: number;
    availableLimit?: number;
    blockedAmount?: number;
    investorProfile?: string;
    kycStatus?: string;
}

export interface UpdateGuarantorPayload {
    name?: string;
    phone?: string;
    totalCollateral?: number;
    availableLimit?: number;
    blockedAmount?: number;
    investorProfile?: string;
    kycStatus?: string;
}

export interface GuarantorListResponse {
    data: Guarantor[];
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
}

export const guarantorService = {
    list: async (params?: { page?: number; limit?: number; search?: string }) => {
        const { data } = await api.get<GuarantorListResponse>('/guarantors', { params });
        return data;
    },

    getById: async (id: string) => {
        const { data } = await api.get<Guarantor>(`/guarantors/${id}`);
        return data;
    },

    create: async (payload: CreateGuarantorPayload) => {
        const { data } = await api.post<Guarantor>('/guarantors', payload);
        return data;
    },

    update: async (id: string, payload: UpdateGuarantorPayload) => {
        const { data } = await api.put<Guarantor>(`/guarantors/${id}`, payload);
        return data;
    },
};
