
import api from "./api";

export interface Investor {
    id: string;
    userId: string;
    vbrzBalance: number;
    walletAddress?: string;
    kycLevel: number;
    totalInvestedP2P: number;
    user: {
        name: string;
        email: string;
        phone?: string;
        cpf?: string;
        avatar?: string;
    };
    createdAt: string;
}

export interface CreateInvestorPayload {
    name: string;
    email: string;
    cpf?: string;
    phone?: string;
    kycLevel?: number;
    vbrzBalance?: number;
    walletAddress?: string;
    password?: string;
}

export interface UpdateInvestorPayload {
    name?: string;
    phone?: string;
    kycLevel?: number;
    vbrzBalance?: number;
    walletAddress?: string;
}

export interface InvestorListResponse {
    data: Investor[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
    stats: {
        totalInvestors: number;
        totalVBRzCirculation: number;
        totalP2PVolume: number;
    };
}

export const investorService = {
    list: async (params?: { page?: number; limit?: number; search?: string }) => {
        const { data } = await api.get<InvestorListResponse>('/investors', { params });
        return data;
    },

    getById: async (id: string) => {
        const { data } = await api.get<Investor>(`/investors/${id}`);
        return data;
    },

    create: async (payload: CreateInvestorPayload) => {
        const { data } = await api.post<Investor>('/investors', payload);
        return data;
    },

    update: async (id: string, payload: UpdateInvestorPayload) => {
        const { data } = await api.put<Investor>(`/investors/${id}`, payload);
        return data;
    },
};
