/**
 * PRICING SERVICE - ENGINE DE PRECIFICAÇÃO
 * 
 * Implementa o cálculo "Bottom-Up" (Gross Up) para determinar o valor
 * total do aluguel baseado no que o proprietário deseja receber.
 * 
 * FÓRMULA 85/15:
 * - Grupo A (85%): OwnerNet + AgencyFee + RealtorFee + FireInsurance
 * - TenantTotal: Grupo A / 0.85
 * - PlatformRevenue (15%): TenantTotal - Grupo A
 */

export interface PricingInput {
    ownerNet: number;
    agencyFee?: number;
    realtorFee?: number;
    fireInsurance?: number;
}

export interface PricingBreakdown {
    // Inputs
    ownerNet: number;
    agencyFee: number;
    realtorFee: number;
    fireInsurance: number;

    // Calculated
    groupA: number;              // Soma dos custos (Target 85%)
    tenantTotal: number;         // Valor final do boleto
    platformRevenue: number;     // Receita da plataforma (15%)

    // Percentages (for validation)
    groupAPercentage: number;
    platformPercentage: number;
}

export const pricingService = {
    /**
     * Calcula o breakdown completo do aluguel usando a fórmula 85/15
     */
    calculateRentBreakdown: (input: PricingInput): PricingBreakdown => {
        // Normalize inputs
        const ownerNet = input.ownerNet || 0;
        const agencyFee = input.agencyFee || 0;
        const realtorFee = input.realtorFee || 0;
        const fireInsurance = input.fireInsurance || 0;

        // Step 1: Calculate Group A (sum of all costs)
        const groupA = ownerNet + agencyFee + realtorFee + fireInsurance;

        // Step 2: Calculate Tenant Total (Gross Up)
        // Group A should be 85% of the total, so: Total = Group A / 0.85
        const tenantTotal = groupA / 0.85;

        // Step 3: Calculate Platform Revenue (the remaining 15%)
        const platformRevenue = tenantTotal - groupA;

        // Calculate percentages for validation
        const groupAPercentage = tenantTotal > 0 ? (groupA / tenantTotal) * 100 : 0;
        const platformPercentage = tenantTotal > 0 ? (platformRevenue / tenantTotal) * 100 : 0;

        // Round all values to 2 decimal places
        return {
            ownerNet: Math.round(ownerNet * 100) / 100,
            agencyFee: Math.round(agencyFee * 100) / 100,
            realtorFee: Math.round(realtorFee * 100) / 100,
            fireInsurance: Math.round(fireInsurance * 100) / 100,
            groupA: Math.round(groupA * 100) / 100,
            tenantTotal: Math.round(tenantTotal * 100) / 100,
            platformRevenue: Math.round(platformRevenue * 100) / 100,
            groupAPercentage: Math.round(groupAPercentage * 100) / 100,
            platformPercentage: Math.round(platformPercentage * 100) / 100,
        };
    },
};
