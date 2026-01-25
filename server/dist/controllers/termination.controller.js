// ============================================
// TERMINATION CONTROLLER - Rescisão Antecipada
// Endpoints para simulação e execução de rescisão
// ============================================
import { z } from 'zod';
import { simulateTermination, executeTermination, } from '../services/termination.service.js';
import { logger } from '../lib/logger.js';
import { AppError } from '../middleware/error-handler.js';
// ============================================
// SCHEMAS
// ============================================
const simulateSchema = z.object({
    exitDate: z.string().transform((s) => new Date(s)),
    baseFineMonths: z.number().min(1).max(12).default(3),
});
const executeSchema = z.object({
    exitDate: z.string().transform((s) => new Date(s)),
    baseFineMonths: z.number().min(1).max(12).default(3),
    confirmTermination: z.literal(true, {
        errorMap: () => ({ message: 'Você deve confirmar a rescisão' }),
    }),
});
// ============================================
// 1. SIMULAR RESCISÃO (Preview)
// ============================================
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
export const simulateContractTermination = async (req, res, next) => {
    try {
        const contractId = req.params.id;
        if (!contractId) {
            throw new AppError(400, 'ID do contrato é obrigatório');
        }
        const { exitDate, baseFineMonths } = simulateSchema.parse(req.body);
        logger.info(`[Termination API] Simulating termination for contract ${contractId}`);
        const result = await simulateTermination(contractId, exitDate, baseFineMonths);
        return res.json({
            success: true,
            simulation: result,
        });
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                success: false,
                error: 'Dados inválidos',
                details: error.errors,
            });
        }
        if (error instanceof Error && error.message.includes('não encontrado')) {
            return res.status(404).json({
                success: false,
                error: error.message,
            });
        }
        next(error);
    }
};
// ============================================
// 2. EXECUTAR RESCISÃO
// ============================================
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
export const executeContractTermination = async (req, res, next) => {
    try {
        const contractId = req.params.id;
        if (!contractId) {
            throw new AppError(400, 'ID do contrato é obrigatório');
        }
        const { exitDate, baseFineMonths } = executeSchema.parse(req.body);
        logger.info(`[Termination API] EXECUTING termination for contract ${contractId}`);
        const result = await executeTermination(contractId, exitDate, baseFineMonths);
        if (!result.success) {
            return res.status(500).json({
                success: false,
                error: result.error || 'Erro ao executar rescisão',
            });
        }
        return res.json({
            success: true,
            message: 'Contrato rescindido com sucesso',
            termination: {
                contractId,
                exitDate: exitDate.toISOString(),
                fineAmount: result.calculation.proportionalFine,
                investorPayout: result.calculation.investorPayout,
                ownerDebt: result.calculation.ownerDebt,
                hasShortfall: result.calculation.hasShortfall,
            },
            bills: {
                tenantBillId: result.tenantBillId,
                ownerBillId: result.ownerBillId,
            },
        });
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({
                success: false,
                error: 'Dados inválidos',
                details: error.errors,
            });
        }
        if (error instanceof Error && error.message.includes('não encontrado')) {
            return res.status(404).json({
                success: false,
                error: error.message,
            });
        }
        next(error);
    }
};
// ============================================
// EXPORTS
// ============================================
export default {
    simulateContractTermination,
    executeContractTermination,
};
//# sourceMappingURL=termination.controller.js.map