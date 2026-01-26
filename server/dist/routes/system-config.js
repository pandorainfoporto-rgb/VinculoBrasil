// ============================================
// SYSTEM CONFIG ROUTES - Gestão de Configurações
// Apenas admins podem acessar essas rotas
// ============================================
import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../middleware/error-handler.js';
import { logger } from '../lib/logger.js';
import { getConfigsByGroup, getConfigGroups, updateConfig, upsertConfig, deleteConfig, clearConfigCache, getBlockchainConfig, } from '../services/config.service.js';
import { clearP2PConfigCache } from '../services/p2p.service.js';
import { getSystemSettings, updateSystemSettings, } from '../controllers/system-settings.controller.js';
const router = Router();
// ============================================
// SCHEMAS DE VALIDAÇÃO
// ============================================
const updateConfigSchema = z.object({
    value: z.string().min(1, 'Valor é obrigatório'),
});
const createConfigSchema = z.object({
    key: z.string().min(1, 'Chave é obrigatória'),
    value: z.string(),
    label: z.string().optional(),
    description: z.string().optional(),
    group: z.string().default('GENERAL'),
    isSecret: z.boolean().default(false),
});
// ============================================
// ROTAS PÚBLICAS (para front-end buscar configs não-secretas)
// ============================================
/**
 * GET /api/system-config/public/blockchain
 * Retorna endereços de contrato (públicos)
 */
router.get('/public/blockchain', async (_req, res, next) => {
    try {
        const config = await getBlockchainConfig();
        res.json({
            success: true,
            data: {
                smartContract: config.smartContract,
                receivablesContract: config.receivablesContract,
                p2pContract: config.p2pContract,
                rpcUrl: config.rpcUrl,
                chainId: config.chainId,
            },
        });
    }
    catch (error) {
        next(error);
    }
});
// ============================================
// ROTAS DE SYSTEM SETTINGS (Taxas e Comissões)
// ============================================
/**
 * GET /api/system-config/settings
 * Busca as configurações globais do sistema (taxas, comissões, etc.)
 */
router.get('/settings', getSystemSettings);
/**
 * PUT /api/system-config/settings
 * Atualiza as configurações globais do sistema
 */
router.put('/settings', updateSystemSettings);
// ============================================
// ROTAS ADMINISTRATIVAS
// ============================================
/**
 * GET /api/system-config/groups
 * Lista todos os grupos de configuração
 */
router.get('/groups', async (_req, res, next) => {
    try {
        const groups = await getConfigGroups();
        res.json({
            success: true,
            data: groups,
        });
    }
    catch (error) {
        next(error);
    }
});
/**
 * GET /api/system-config/by-group/:group
 * Lista todas as configurações de um grupo
 */
router.get('/by-group/:group', async (req, res, next) => {
    try {
        const { group } = req.params;
        const configs = await getConfigsByGroup(group);
        res.json({
            success: true,
            data: configs,
        });
    }
    catch (error) {
        next(error);
    }
});
/**
 * GET /api/system-config/all
 * Lista todas as configurações agrupadas
 */
router.get('/all', async (_req, res, next) => {
    try {
        const groups = await getConfigGroups();
        const result = {};
        for (const group of groups) {
            result[group] = await getConfigsByGroup(group);
        }
        res.json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
});
/**
 * GET /api/system-config/:key
 * Busca uma configuração específica
 */
router.get('/:key', async (req, res, next) => {
    try {
        const { key } = req.params;
        const config = await prisma.systemConfig.findUnique({
            where: { key },
        });
        if (!config) {
            throw new AppError(404, 'Configuração não encontrada');
        }
        res.json({
            success: true,
            data: {
                key: config.key,
                value: config.isSecret ? '••••••••' : config.value,
                label: config.label,
                description: config.description,
                group: config.group,
                isSecret: config.isSecret,
                updatedAt: config.updatedAt,
            },
        });
    }
    catch (error) {
        next(error);
    }
});
/**
 * PUT /api/system-config/:key
 * Atualiza o valor de uma configuração
 */
router.put('/:key', async (req, res, next) => {
    try {
        const { key } = req.params;
        const { value } = updateConfigSchema.parse(req.body);
        // Verificar se existe
        const existing = await prisma.systemConfig.findUnique({
            where: { key },
        });
        if (!existing) {
            throw new AppError(404, 'Configuração não encontrada');
        }
        // Atualizar
        const result = await updateConfig(key, value);
        if (!result.success) {
            throw new AppError(500, result.error || 'Erro ao atualizar configuração');
        }
        // Limpar caches relacionados
        clearConfigCache(key);
        // Se for configuração de blockchain, limpar cache do P2P também
        if (existing.group === 'BLOCKCHAIN') {
            clearP2PConfigCache();
        }
        logger.info(`[SystemConfig] Configuração atualizada: ${key}`);
        res.json({
            success: true,
            message: 'Configuração atualizada com sucesso',
        });
    }
    catch (error) {
        next(error);
    }
});
/**
 * POST /api/system-config
 * Cria uma nova configuração
 */
router.post('/', async (req, res, next) => {
    try {
        const data = createConfigSchema.parse(req.body);
        // Verificar se já existe
        const existing = await prisma.systemConfig.findUnique({
            where: { key: data.key },
        });
        if (existing) {
            throw new AppError(409, 'Configuração com essa chave já existe');
        }
        // Criar
        const result = await upsertConfig(data);
        if (!result.success) {
            throw new AppError(500, result.error || 'Erro ao criar configuração');
        }
        logger.info(`[SystemConfig] Configuração criada: ${data.key}`);
        res.status(201).json({
            success: true,
            message: 'Configuração criada com sucesso',
        });
    }
    catch (error) {
        next(error);
    }
});
/**
 * DELETE /api/system-config/:key
 * Remove uma configuração
 */
router.delete('/:key', async (req, res, next) => {
    try {
        const { key } = req.params;
        // Verificar se existe
        const existing = await prisma.systemConfig.findUnique({
            where: { key },
        });
        if (!existing) {
            throw new AppError(404, 'Configuração não encontrada');
        }
        // Não permitir deletar configs críticas
        const criticalKeys = [
            'SMART_CONTRACT_ADDRESS',
            'RECEIVABLES_CONTRACT_ADDRESS',
            'P2P_CONTRACT_ADDRESS',
            'POLYGON_RPC_URL',
        ];
        if (criticalKeys.includes(key)) {
            throw new AppError(403, 'Não é possível remover configurações críticas do sistema');
        }
        const result = await deleteConfig(key);
        if (!result.success) {
            throw new AppError(500, result.error || 'Erro ao remover configuração');
        }
        logger.info(`[SystemConfig] Configuração removida: ${key}`);
        res.json({
            success: true,
            message: 'Configuração removida com sucesso',
        });
    }
    catch (error) {
        next(error);
    }
});
/**
 * POST /api/system-config/clear-cache
 * Limpa todo o cache de configurações
 */
router.post('/clear-cache', async (_req, res, next) => {
    try {
        clearConfigCache();
        clearP2PConfigCache();
        logger.info('[SystemConfig] Cache de configurações limpo manualmente');
        res.json({
            success: true,
            message: 'Cache limpo com sucesso',
        });
    }
    catch (error) {
        next(error);
    }
});
export default router;
//# sourceMappingURL=system-config.js.map