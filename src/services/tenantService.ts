
import api from "./api";

export interface Tenant {
    id: string;
    userId: string;
    monthlyIncome?: string; // Decimal comes as string often
    creditScore?: number;
    status: 'ACTIVE' | 'PENDING' | 'BLOCKED' | 'EVICTED';
    notes?: string;
    user: {
        name: string;
        email: string;
        phone?: string;
        cpf?: string;
        avatar?: string;
    };
    createdAt: string;
}

export interface TenantTicket {
    id: string;
    title: string;
    status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED' | 'CANCELLED';
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    createdAt: string;
}

export interface CreateTenantPayload {
    name: string;
    email: string;
    cpf: string;
    phone?: string;
    monthlyIncome?: number;
    creditScore?: number;
    notes?: string;
}

export interface UpdateTenantPayload {
    name?: string;
    email?: string;
    phone?: string;
    monthlyIncome?: number;
    creditScore?: number;
    notes?: string;
    status?: string;
}

export interface TenantListResponse {
    tenants: Tenant[];
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
}

export const tenantService = {
    listTenants: async (params?: { page?: number; limit?: number; search?: string; status?: string }) => {
        const { data } = await api.get<TenantListResponse>('/tenants', { params });
        return data;
    },

    getTenantById: async (id: string) => {
        const { data } = await api.get<Tenant & { user: { ticketsRequested: TenantTicket[] } }>(`/tenants/${id}`);
        return data;
    },

    createTenant: async (payload: CreateTenantPayload) => {
        const { data } = await api.post<Tenant>('/tenants', payload);
        return data;
    },

    updateTenant: async (id: string, payload: UpdateTenantPayload) => {
        const { data } = await api.put<Tenant>(`/tenants/${id}`, payload);
        return data;
    },
};
