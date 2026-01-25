import { ethers } from 'ethers';
/**
 * Criptografa um texto (Private Key) antes de salvar no banco
 * Usa AES-256-CBC com IV aleatório
 */
export declare function encrypt(text: string): string;
/**
 * Descriptografa um texto criptografado
 * Usado quando o sistema precisa assinar transações pelo usuário
 */
export declare function decrypt(encryptedText: string): string;
/**
 * Cria uma carteira gerenciada para um usuário
 * Chamado automaticamente no cadastro
 *
 * @param userId - ID do usuário no banco
 * @returns O endereço público da carteira criada
 */
export declare const createManagedWallet: (userId: string) => Promise<string>;
/**
 * Recupera a carteira de um usuário para assinar transações
 * APENAS o backend deve usar isso!
 *
 * @param userId - ID do usuário
 * @param provider - Provider do Polygon (opcional)
 * @returns Instância da carteira conectada ao provider
 */
export declare const getUserWallet: (userId: string, provider?: ethers.JsonRpcProvider) => Promise<ethers.Wallet>;
/**
 * Verifica se um usuário tem carteira gerenciada
 */
export declare const hasWallet: (userId: string) => Promise<boolean>;
/**
 * Busca o endereço da carteira de um usuário
 */
export declare const getWalletAddress: (userId: string) => Promise<string | null>;
/**
 * Cria carteiras para todos os usuários que não têm
 * Útil para migração de usuários antigos
 */
export declare const migrateUsersWithoutWallets: () => Promise<number>;
declare const _default: {
    encrypt: typeof encrypt;
    decrypt: typeof decrypt;
    createManagedWallet: (userId: string) => Promise<string>;
    getUserWallet: (userId: string, provider?: ethers.JsonRpcProvider) => Promise<ethers.Wallet>;
    hasWallet: (userId: string) => Promise<boolean>;
    getWalletAddress: (userId: string) => Promise<string | null>;
    migrateUsersWithoutWallets: () => Promise<number>;
};
export default _default;
//# sourceMappingURL=wallet.service.d.ts.map