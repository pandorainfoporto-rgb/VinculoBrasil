/**
 * Limpa o cache de configurações
 * Útil após atualizar uma configuração
 */
export declare const clearConfigCache: (key?: string) => void;
/**
 * Busca uma configuração do sistema
 * Prioridade: Cache -> Banco de Dados -> .env (fallback)
 *
 * @param key - Chave da configuração (ex: 'P2P_CONTRACT_ADDRESS')
 * @param envFallback - Nome da variável de ambiente para fallback (opcional)
 * @returns O valor da configuração
 * @throws Error se a configuração não for encontrada e não houver fallback
 */
export declare const getConfig: (key: string, envFallback?: string) => Promise<string>;
/**
 * Busca uma configuração com valor padrão (não lança erro)
 */
export declare const getConfigOrDefault: (key: string, defaultValue: string) => Promise<string>;
/**
 * Busca múltiplas configurações de uma vez
 */
export declare const getConfigs: (keys: string[]) => Promise<Record<string, string>>;
/**
 * Busca todas as configurações de um grupo
 */
export declare const getConfigsByGroup: (group: string) => Promise<Array<{
    key: string;
    value: string;
    label: string | null;
    description: string | null;
    isSecret: boolean;
}>>;
/**
 * Lista todos os grupos de configuração disponíveis
 */
export declare const getConfigGroups: () => Promise<string[]>;
/**
 * Atualiza uma configuração do sistema
 * Limpa o cache automaticamente após a atualização
 */
export declare const updateConfig: (key: string, value: string) => Promise<{
    success: boolean;
    error?: string;
}>;
/**
 * Cria ou atualiza uma configuração (upsert)
 */
export declare const upsertConfig: (data: {
    key: string;
    value: string;
    label?: string;
    description?: string;
    group?: string;
    isSecret?: boolean;
}) => Promise<{
    success: boolean;
    error?: string;
}>;
/**
 * Remove uma configuração
 */
export declare const deleteConfig: (key: string) => Promise<{
    success: boolean;
    error?: string;
}>;
/**
 * Busca endereços de contratos blockchain
 */
export declare const getBlockchainConfig: () => Promise<{
    smartContract: string;
    receivablesContract: string;
    p2pContract: string;
    rpcUrl: string;
    chainId: number;
}>;
/**
 * Busca configurações de pagamento
 */
export declare const getPaymentConfig: () => Promise<{
    asaasApiUrl: string;
    asaasApiKey: string;
    platformFeePercent: number;
}>;
declare const _default: {
    getConfig: (key: string, envFallback?: string) => Promise<string>;
    getConfigOrDefault: (key: string, defaultValue: string) => Promise<string>;
    getConfigs: (keys: string[]) => Promise<Record<string, string>>;
    getConfigsByGroup: (group: string) => Promise<Array<{
        key: string;
        value: string;
        label: string | null;
        description: string | null;
        isSecret: boolean;
    }>>;
    getConfigGroups: () => Promise<string[]>;
    updateConfig: (key: string, value: string) => Promise<{
        success: boolean;
        error?: string;
    }>;
    upsertConfig: (data: {
        key: string;
        value: string;
        label?: string;
        description?: string;
        group?: string;
        isSecret?: boolean;
    }) => Promise<{
        success: boolean;
        error?: string;
    }>;
    deleteConfig: (key: string) => Promise<{
        success: boolean;
        error?: string;
    }>;
    clearConfigCache: (key?: string) => void;
    getBlockchainConfig: () => Promise<{
        smartContract: string;
        receivablesContract: string;
        p2pContract: string;
        rpcUrl: string;
        chainId: number;
    }>;
    getPaymentConfig: () => Promise<{
        asaasApiUrl: string;
        asaasApiKey: string;
        platformFeePercent: number;
    }>;
};
export default _default;
//# sourceMappingURL=config.service.d.ts.map