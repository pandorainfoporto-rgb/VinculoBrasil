// ============================================
// WALLET SERVICE - Carteiras Gerenciadas (Custodial)
// Gera carteiras invisíveis para usuários
// O usuário nunca vê Blockchain - apenas Pix
// ============================================

import { ethers } from 'ethers';
import crypto from 'crypto';
import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';

// ============================================
// ENCRYPTION CONFIG
// ============================================

// Chave mestra de criptografia (32 caracteres = 256 bits)
// IMPORTANTE: Configure no .env para produção!
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'vinculo_default_key_change_me_32';
const IV_LENGTH = 16;
const ALGORITHM = 'aes-256-cbc';

// Validar tamanho da chave
if (ENCRYPTION_KEY.length !== 32) {
  logger.warn('[Wallet] ENCRYPTION_KEY deve ter exatamente 32 caracteres!');
}

// ============================================
// ENCRYPTION HELPERS
// ============================================

/**
 * Criptografa um texto (Private Key) antes de salvar no banco
 * Usa AES-256-CBC com IV aleatório
 */
export function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  // Formato: IV:EncryptedData
  return iv.toString('hex') + ':' + encrypted;
}

/**
 * Descriptografa um texto criptografado
 * Usado quando o sistema precisa assinar transações pelo usuário
 */
export function decrypt(encryptedText: string): string {
  const textParts = encryptedText.split(':');
  const iv = Buffer.from(textParts.shift()!, 'hex');
  const encryptedData = textParts.join(':');
  const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
  let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// ============================================
// WALLET MANAGEMENT
// ============================================

/**
 * Cria uma carteira gerenciada para um usuário
 * Chamado automaticamente no cadastro
 *
 * @param userId - ID do usuário no banco
 * @returns O endereço público da carteira criada
 */
export const createManagedWallet = async (userId: string): Promise<string> => {
  try {
    // 1. Verificar se o usuário já tem carteira
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { managedWalletAddress: true, email: true },
    });

    if (existingUser?.managedWalletAddress) {
      logger.info(`[Wallet] Usuário ${userId} já possui carteira: ${existingUser.managedWalletAddress}`);
      return existingUser.managedWalletAddress;
    }

    // 2. Gerar carteira aleatória (off-chain, instantâneo)
    const wallet = ethers.Wallet.createRandom();

    logger.info(`[Wallet] Gerando carteira invisível para usuário ${userId}`);

    // 3. Criptografar a chave privada
    const encryptedKey = encrypt(wallet.privateKey);

    // 4. Salvar no banco de dados
    await prisma.user.update({
      where: { id: userId },
      data: {
        managedWalletAddress: wallet.address,
        managedWalletEncryptedKey: encryptedKey,
      },
    });

    logger.info(`[Wallet] Carteira criada com sucesso: ${wallet.address}`);

    return wallet.address;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`[Wallet] Erro ao criar carteira para ${userId}: ${errorMessage}`);
    throw error;
  }
};

/**
 * Recupera a carteira de um usuário para assinar transações
 * APENAS o backend deve usar isso!
 *
 * @param userId - ID do usuário
 * @param provider - Provider do Polygon (opcional)
 * @returns Instância da carteira conectada ao provider
 */
export const getUserWallet = async (
  userId: string,
  provider?: ethers.JsonRpcProvider
): Promise<ethers.Wallet> => {
  // 1. Buscar dados do usuário
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      managedWalletAddress: true,
      managedWalletEncryptedKey: true,
    },
  });

  if (!user?.managedWalletEncryptedKey) {
    throw new Error(`Usuário ${userId} não possui carteira gerenciada`);
  }

  // 2. Descriptografar a chave privada
  const privateKey = decrypt(user.managedWalletEncryptedKey);

  // 3. Criar instância da carteira
  if (provider) {
    return new ethers.Wallet(privateKey, provider);
  }

  return new ethers.Wallet(privateKey);
};

/**
 * Verifica se um usuário tem carteira gerenciada
 */
export const hasWallet = async (userId: string): Promise<boolean> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { managedWalletAddress: true },
  });

  return !!user?.managedWalletAddress;
};

/**
 * Busca o endereço da carteira de um usuário
 */
export const getWalletAddress = async (userId: string): Promise<string | null> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { managedWalletAddress: true },
  });

  return user?.managedWalletAddress || null;
};

/**
 * Cria carteiras para todos os usuários que não têm
 * Útil para migração de usuários antigos
 */
export const migrateUsersWithoutWallets = async (): Promise<number> => {
  const usersWithoutWallet = await prisma.user.findMany({
    where: { managedWalletAddress: null },
    select: { id: true, email: true },
  });

  logger.info(`[Wallet] Migrando ${usersWithoutWallet.length} usuários sem carteira...`);

  let count = 0;
  for (const user of usersWithoutWallet) {
    try {
      await createManagedWallet(user.id);
      count++;
    } catch (error) {
      logger.error(`[Wallet] Falha ao migrar ${user.email}: ${error}`);
    }
  }

  logger.info(`[Wallet] Migração concluída: ${count}/${usersWithoutWallet.length} carteiras criadas`);
  return count;
};

export default {
  encrypt,
  decrypt,
  createManagedWallet,
  getUserWallet,
  hasWallet,
  getWalletAddress,
  migrateUsersWithoutWallets,
};
