import api from "./api";

export interface CreateLeaseData {
    propertyId: string;
    tenantId: string;
    ownerId: string;
    guarantorId?: string;
    ownerNetValue: number;
    startDate: string;
    durationMonths: number;
    paymentDay?: number;
}

export const leaseService = {
    create: async (data: CreateLeaseData) => {
        const response = await api.post('/leases', data);
        return response.data;
    },

    list: async (filters?: { status?: string }) => {
        const response = await api.get('/leases', { params: filters });
        return response.data;
    },

    getById: async (id: string) => {
        const response = await api.get(`/leases/${id}`);
        return response.data;
    },

    endLease: async (id: string) => {
        const response = await api.patch(`/leases/${id}/end`);
        return response.data;
    },
};
