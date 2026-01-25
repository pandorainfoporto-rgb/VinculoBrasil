export interface TerminationCalculation {
    contractId: string;
    contractStartDate: Date;
    contractEndDate: Date;
    exitDate: Date;
    monthlyRent: number;
    totalDurationMonths: number;
    elapsedMonths: number;
    remainingMonths: number;
    baseFineMonths: number;
    baseFineValue: number;
    proportionalFine: number;
    investorTotalOwed: number;
    investorPayout: number;
    hasShortfall: boolean;
    ownerDebt: number;
    p2pListingId?: string;
    investorId?: string;
    ownerId?: string;
}
export interface TerminationResult {
    success: boolean;
    calculation: TerminationCalculation;
    tenantBillId?: string;
    ownerBillId?: string;
    error?: string;
}
/**
 * Calcula os valores da rescisão antecipada
 *
 * @param contractId - ID do contrato de locação
 * @param exitDate - Data de entrega das chaves (saída do inquilino)
 * @param baseFineMonths - Meses de multa base (padrão: 3)
 * @returns Cálculo completo da rescisão
 */
export declare const calculateTermination: (contractId: string, exitDate: Date, baseFineMonths?: number) => Promise<TerminationCalculation>;
/**
 * Simula o cálculo de rescisão sem executar ações
 * Útil para preview no frontend antes de confirmar
 */
export declare const simulateTermination: (contractId: string, exitDate: Date, baseFineMonths?: number) => Promise<TerminationCalculation & {
    summary: string[];
}>;
/**
 * Executa a rescisão do contrato
 * - Atualiza status do contrato para TERMINATED
 * - Gera cobrança da multa ao inquilino
 * - Gera cobrança do déficit ao proprietário (se aplicável)
 * - Desativa regras de split P2P
 */
export declare const executeTermination: (contractId: string, exitDate: Date, baseFineMonths?: number) => Promise<TerminationResult>;
declare const _default: {
    calculateTermination: (contractId: string, exitDate: Date, baseFineMonths?: number) => Promise<TerminationCalculation>;
    simulateTermination: (contractId: string, exitDate: Date, baseFineMonths?: number) => Promise<TerminationCalculation & {
        summary: string[];
    }>;
    executeTermination: (contractId: string, exitDate: Date, baseFineMonths?: number) => Promise<TerminationResult>;
};
export default _default;
//# sourceMappingURL=termination.service.d.ts.map