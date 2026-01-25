interface WaterfallCalculation {
    baseValue: number;
    totalValue: number;
    ecosystemPot: number;
    guarantorShare: number;
    suretyShare: number;
    vinculoShare: number;
    agencyShare: number;
    ownerShare: number;
    isPrime: boolean;
    kycScore: number;
}
interface AsaasChargeResult {
    id: string;
    invoiceUrl: string;
    pixCopiaECola?: string;
    value: number;
    dueDate: string;
    status: string;
}
/**
 * Calcula a distribuição de pagamentos usando a lógica Gross-Up
 * O valor no banco (rentValue) é os 85%. O inquilino paga 100%.
 */
export declare const calculateWaterfall: (baseValue: number, kycScore?: number, suretyCost?: number, agencyRate?: number) => WaterfallCalculation;
/**
 * Cria uma cobrança no Asaas com Split automático (Waterfall)
 * ATUALIZADO: Suporta garantidores e seguradoras dinâmicas por contrato
 * @param contractId - ID do contrato de locação
 * @returns Dados da cobrança criada
 */
export declare const createWaterfallCharge: (contractId: string) => Promise<AsaasChargeResult>;
/**
 * Simula o cálculo do waterfall sem criar cobrança
 * Útil para preview no frontend
 */
export declare const simulateWaterfall: (rentValue: number, kycScore?: number, suretyCost?: number, agencyRate?: number) => WaterfallCalculation & {
    breakdown: string[];
};
/**
 * Gera cobranças para todos os contratos ativos
 */
export declare const generateMonthlyCharges: (month: number, year: number) => Promise<{
    created: number;
    skipped: number;
    errors: string[];
}>;
declare const _default: {
    calculateWaterfall: (baseValue: number, kycScore?: number, suretyCost?: number, agencyRate?: number) => WaterfallCalculation;
    createWaterfallCharge: (contractId: string) => Promise<AsaasChargeResult>;
    simulateWaterfall: (rentValue: number, kycScore?: number, suretyCost?: number, agencyRate?: number) => WaterfallCalculation & {
        breakdown: string[];
    };
    generateMonthlyCharges: (month: number, year: number) => Promise<{
        created: number;
        skipped: number;
        errors: string[];
    }>;
};
export default _default;
//# sourceMappingURL=asaas.service.d.ts.map