import { type Request, type Response, type NextFunction } from 'express';
/**
 * POST /api/contracts/:id/simulate-termination
 *
 * Simula o cálculo da rescisão antecipada sem executar.
 * Útil para preview no modal antes de confirmar.
 *
 * Body:
 * - exitDate: string (ISO date) - Data de entrega das chaves
 * - baseFineMonths: number (optional, default: 3) - Meses base da multa
 */
export declare const simulateContractTermination: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>>>;
/**
 * POST /api/contracts/:id/terminate
 *
 * Executa a rescisão antecipada do contrato.
 * - Atualiza status do contrato para TERMINATED
 * - Gera cobranças da multa e déficit
 * - Desativa regras de split P2P
 *
 * Body:
 * - exitDate: string (ISO date) - Data de entrega das chaves
 * - baseFineMonths: number (optional, default: 3) - Meses base da multa
 * - confirmTermination: true (required) - Confirmação explícita
 */
export declare const executeContractTermination: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>>>;
declare const _default: {
    simulateContractTermination: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>>>;
    executeContractTermination: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>>>;
};
export default _default;
//# sourceMappingURL=termination.controller.d.ts.map