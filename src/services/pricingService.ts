import api from "./api";

export interface PricingInput {
    ownerNet: number;
    agencyFee?: number;
    realtorFee?: number;
    fireInsurance?: number;
}

export interface PricingBreakdown {
    ownerNet: number;
    agencyFee: number;
    realtorFee: number;
    fireInsurance: number;
    groupA: number;
    tenantTotal: number;
    platformRevenue: number;
    groupAPercentage: number;
    platformPercentage: number;
}

export const pricingService = {
    simulate: async (input: PricingInput) => {
        const { data } = await api.post<PricingBreakdown>('/pricing/simulate', input);
        return data;
    },
};
