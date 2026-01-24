// ============================================
// CONFIG SERVICE - Gestão Dinâmica de Configurações
// Lê configurações do banco de dados com fallback para .env
// ============================================
import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';
// ============================================
// CACHE DE CONFIGURAÇÕES
// ============================================
// Cache em memória para evitar queries repetidas
const configCache = new Map();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutos
/**
 * Limpa o cache de configurações
 * Útil após atualizar uma configuração
 */
export const clearConfigCache = (key) => {
    if (key) {
        configCache.delete(key);
        logger.info(`[Config] Cache limpo para chave: ${key}`);
    }
    else {
        configCache.clear();
        logger.info('[Config] Cache de configurações limpo completamente');
    }
};
// ============================================
// FUNÇÕES DE LEITURA
// ============================================
/**
 * Busca uma configuração do sistema
 * Prioridade: Cache -> Banco de Dados -> .env (fallback)
 *
 * @param key - Chave da configuração (ex: 'P2P_CONTRACT_ADDRESS')
 * @param envFallback - Nome da variável de ambiente para fallback (opcional)
 * @returns O valor da configuração
 * @throws Error se a configuração não for encontrada e não houver fallback
 */
export const getConfig = async (key, envFallback) => {
    // 1. Verificar cache
    const cached = configCache.get(key);
    if (cached && cached.expiresAt > Date.now()) {
        return cached.value;
    }
    // 2. Buscar no banco de dados
    try {
        const config = await prisma.systemConfig.findUnique({
            where: { key },
        });
        if (config && config.value) {
            // Atualizar cache
            configCache.set(key, {
                value: config.value,
                expiresAt: Date.now() + CACHE_TTL_MS,
            });
            return config.value;
        }
    }
    catch (error) {
        logger.warn(`[Config] Erro ao buscar ${key} no banco: ${error instanceof Error ? error.message : String(error)}`);
    }
    // 3. Fallback para variável de ambiente
    if (envFallback && process.env[envFallback]) {
        const envValue = process.env[envFallback];
        // Cachear o valor do .env também
        configCache.set(key, {
            value: envValue,
            expiresAt: Date.now() + CACHE_TTL_MS,
        });
        return envValue;
    }
    // 4. Tentar buscar diretamente da chave como env var
    if (process.env[key]) {
        const envValue = process.env[key];
        configCache.set(key, {
            value: envValue,
            expiresAt: Date.now() + CACHE_TTL_MS,
        });
        return envValue;
    }
    throw new Error(`Configuração crítica ausente: ${key}`);
};
/**
 * Busca uma configuração com valor padrão (não lança erro)
 */
export const getConfigOrDefault = async (key, defaultValue) => {
    try {
        return await getConfig(key);
    }
    catch {
        return defaultValue;
    }
};
/**
 * Busca múltiplas configurações de uma vez
 */
export const getConfigs = async (keys) => {
    const result = {};
    for (const key of keys) {
        try {
            result[key] = await getConfig(key);
        }
        catch {
            result[key] = '';
        }
    }
    return result;
};
/**
 * Busca todas as configurações de um grupo
 */
export const getConfigsByGroup = async (group) => {
    try {
        const configs = await prisma.systemConfig.findMany({
            where: { group },
            select: {
                key: true,
                value: true,
                label: true,
                description: true,
                isSecret: true,
            },
            orderBy: { key: 'asc' },
        });
        // Mascarar valores secretos
        return configs.map((config) => ({
            ...config,
            value: config.isSecret ? '••••••••' : config.value,
        }));
    }
    catch (error) {
        logger.error(`[Config] Erro ao buscar configs do grupo ${group}: ${error instanceof Error ? error.message : String(error)}`);
        return [];
    }
};
/**
 * Lista todos os grupos de configuração disponíveis
 */
export const getConfigGroups = async () => {
    try {
        const groups = await prisma.systemConfig.findMany({
            select: { group: true },
            distinct: ['group'],
            orderBy: { group: 'asc' },
        });
        return groups.map((g) => g.group);
    }
    catch (error) {
        logger.error(`[Config] Erro ao buscar grupos: ${error instanceof Error ? error.message : String(error)}`);
        return [];
    }
};
// ============================================
// FUNÇÕES DE ESCRITA (ADMIN ONLY)
// ============================================
/**
 * Atualiza uma configuração do sistema
 * Limpa o cache automaticamente após a atualização
 */
export const updateConfig = async (key, value) => {
    try {
        await prisma.systemConfig.update({
            where: { key },
            data: { value },
        });
        // Limpar cache da chave atualizada
        clearConfigCache(key);
        logger.info(`[Config] Configuração atualizada: ${key}`);
        return { success: true };
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error(`[Config] Erro ao atualizar ${key}: ${errorMessage}`);
        return { success: false, error: errorMessage };
    }
};
/**
 * Cria ou atualiza uma configuração (upsert)
 */
export const upsertConfig = async (data) => {
    try {
        await prisma.systemConfig.upsert({
            where: { key: data.key },
            update: {
                value: data.value,
                label: data.label,
                description: data.description,
                group: data.group,
                isSecret: data.isSecret,
            },
            create: {
                key: data.key,
                value: data.value,
                label: data.label || data.key,
                description: data.description,
                group: data.group || 'GENERAL',
                isSecret: data.isSecret || false,
            },
        });
        // Limpar cache
        clearConfigCache(data.key);
        logger.info(`[Config] Configuração upserted: ${data.key}`);
        return { success: true };
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error(`[Config] Erro ao upsert ${data.key}: ${errorMessage}`);
        return { success: false, error: errorMessage };
    }
};
/**
 * Remove uma configuração
 */
export const deleteConfig = async (key) => {
    try {
        await prisma.systemConfig.delete({
            where: { key },
        });
        clearConfigCache(key);
        logger.info(`[Config] Configuração removida: ${key}`);
        return { success: true };
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error(`[Config] Erro ao remover ${key}: ${errorMessage}`);
        return { success: false, error: errorMessage };
    }
};
// ============================================
// HELPERS PARA CONFIGURAÇÕES COMUNS
// ============================================
/**
 * Busca endereços de contratos blockchain
 */
export const getBlockchainConfig = async () => {
    const [smartContract, receivablesContract, p2pContract, rpcUrl, chainId] = await Promise.all([
        getConfig('SMART_CONTRACT_ADDRESS', 'SMART_CONTRACT_ADDRESS'),
        getConfig('RECEIVABLES_CONTRACT_ADDRESS', 'RECEIVABLES_CONTRACT_ADDRESS'),
        getConfig('P2P_CONTRACT_ADDRESS', 'P2P_MARKETPLACE_CONTRACT_ADDRESS'),
        getConfigOrDefault('POLYGON_RPC_URL', 'https://polygon-rpc.com'),
        getConfigOrDefault('POLYGON_CHAIN_ID', '137'),
    ]);
    return {
        smartContract,
        receivablesContract,
        p2pContract,
        rpcUrl,
        chainId: parseInt(chainId, 10),
    };
};
/**
 * Busca configurações de pagamento
 */
export const getPaymentConfig = async () => {
    const [asaasApiUrl, asaasApiKey, platformFeePercent] = await Promise.all([
        getConfigOrDefault('ASAAS_API_URL', 'https://api.asaas.com/v3'),
        getConfigOrDefault('ASAAS_API_KEY', ''),
        getConfigOrDefault('PLATFORM_FEE_PERCENT', '5'),
    ]);
    return {
        asaasApiUrl,
        asaasApiKey,
        platformFeePercent: parseFloat(platformFeePercent),
    };
};
export default {
    getConfig,
    getConfigOrDefault,
    getConfigs,
    getConfigsByGroup,
    getConfigGroups,
    updateConfig,
    upsertConfig,
    deleteConfig,
    clearConfigCache,
    getBlockchainConfig,
    getPaymentConfig,
};
//# sourceMappingURL=config.service.js.map