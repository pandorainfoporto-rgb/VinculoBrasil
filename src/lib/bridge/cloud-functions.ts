/**
 * Vinculo.io - Cloud Functions Bridge
 *
 * Ponte entre o mundo real (Google Sheets/AppSheet) e a Blockchain.
 * Estas funções são projetadas para serem deployadas no Firebase Functions
 * ou Google Cloud Functions.
 *
 * Fluxo:
 * 1. Locatário paga aluguel no App (PIX/Boleto)
 * 2. AppSheet/Base44 envia Webhook para Cloud Function
 * 3. Cloud Function assina transação com chave privada da plataforma
 * 4. Chama função payRent no Smart Contract
 * 5. Blockchain confirma e App atualiza status para "Liquidado"
 */

// ============================================================================
// TIPOS
// ============================================================================

export interface WebhookPayload {
  contractId: string;
  tokenId: string;
  amountPaid: number;
  payerId: string;
  payerWallet?: string;
  paymentMethod: 'PIX' | 'Boleto' | 'Crypto';
  paymentReference: string;
  timestamp: string;
  idempotencyKey: string; // Previne pagamentos duplicados
}

export interface CloudFunctionResponse {
  status: 'success' | 'error' | 'duplicate';
  hash?: string;
  blockNumber?: number;
  gasUsed?: string;
  message?: string;
  timestamp: string;
}

export interface TransactionConfig {
  providerUrl: string;
  contractAddress: string;
  platformWallet: string;
  gasLimit: number;
  maxPriorityFeePerGas?: string;
  maxFeePerGas?: string;
}

export interface SplitDistribution {
  landlordAddress: string;
  landlordAmount: number;
  insurerAddress: string;
  insurerAmount: number;
  platformAddress: string;
  platformAmount: number;
  guarantorAddress?: string;
  guarantorAmount?: number;
}

export interface ProcessedTransaction {
  idempotencyKey: string;
  contractId: string;
  txHash: string;
  blockNumber: number;
  timestamp: string;
  status: 'pending' | 'confirmed' | 'failed';
}

// ============================================================================
// CONFIGURAÇÃO (Em produção, usar Secret Manager)
// ============================================================================

export const NETWORK_CONFIGS = {
  polygon_mumbai: {
    name: 'Polygon Mumbai Testnet',
    chainId: 80001,
    providerUrl: 'https://polygon-mumbai.g.alchemy.com/v2/YOUR_API_KEY',
    explorerUrl: 'https://mumbai.polygonscan.com',
    nativeCurrency: 'MATIC',
    isTestnet: true,
  },
  polygon_mainnet: {
    name: 'Polygon Mainnet',
    chainId: 137,
    providerUrl: 'https://polygon-mainnet.g.alchemy.com/v2/YOUR_API_KEY',
    explorerUrl: 'https://polygonscan.com',
    nativeCurrency: 'MATIC',
    isTestnet: false,
  },
  base_sepolia: {
    name: 'Base Sepolia Testnet',
    chainId: 84532,
    providerUrl: 'https://sepolia.base.org',
    explorerUrl: 'https://sepolia.basescan.org',
    nativeCurrency: 'ETH',
    isTestnet: true,
  },
  base_mainnet: {
    name: 'Base Mainnet',
    chainId: 8453,
    providerUrl: 'https://mainnet.base.org',
    explorerUrl: 'https://basescan.org',
    nativeCurrency: 'ETH',
    isTestnet: false,
  },
} as const;

export type NetworkType = keyof typeof NETWORK_CONFIGS;

// ============================================================================
// SPLIT AUTOMÁTICO 85/5/5/5
// ============================================================================

export const VINCULO_SPLIT_CONFIG = {
  landlordPercentage: 85, // Locador
  insurerPercentage: 5, // Seguradora
  platformPercentage: 5, // Vínculo.io
  guarantorPercentage: 5, // Garantidor
} as const;

/**
 * Calcula a distribuição do split de pagamento
 */
export function calculateSplitDistribution(
  totalAmount: number,
  landlordAddress: string,
  insurerAddress: string,
  platformAddress: string,
  guarantorAddress?: string
): SplitDistribution {
  const landlordAmount = (totalAmount * VINCULO_SPLIT_CONFIG.landlordPercentage) / 100;
  const insurerAmount = (totalAmount * VINCULO_SPLIT_CONFIG.insurerPercentage) / 100;
  const platformAmount = (totalAmount * VINCULO_SPLIT_CONFIG.platformPercentage) / 100;
  const guarantorAmount = guarantorAddress
    ? (totalAmount * VINCULO_SPLIT_CONFIG.guarantorPercentage) / 100
    : 0;

  // Se não há garantidor, redistribui para o locador
  const adjustedLandlordAmount = guarantorAddress
    ? landlordAmount
    : landlordAmount + (totalAmount * VINCULO_SPLIT_CONFIG.guarantorPercentage) / 100;

  return {
    landlordAddress,
    landlordAmount: Math.round(adjustedLandlordAmount * 100) / 100,
    insurerAddress,
    insurerAmount: Math.round(insurerAmount * 100) / 100,
    platformAddress,
    platformAmount: Math.round(platformAmount * 100) / 100,
    guarantorAddress,
    guarantorAmount: guarantorAddress ? Math.round(guarantorAmount * 100) / 100 : undefined,
  };
}

/**
 * Valida o total do split (deve somar 100%)
 */
export function validateSplitTotal(distribution: SplitDistribution): boolean {
  const total =
    distribution.landlordAmount +
    distribution.insurerAmount +
    distribution.platformAmount +
    (distribution.guarantorAmount || 0);

  // Recalcula o total esperado
  const expectedTotal =
    distribution.landlordAmount /
    (distribution.guarantorAmount
      ? VINCULO_SPLIT_CONFIG.landlordPercentage / 100
      : (VINCULO_SPLIT_CONFIG.landlordPercentage + VINCULO_SPLIT_CONFIG.guarantorPercentage) / 100);

  // Permite pequena margem de erro por arredondamento
  return Math.abs(total - expectedTotal) < 0.02;
}

// ============================================================================
// IDEMPOTÊNCIA (Previne pagamentos duplicados)
// ============================================================================

// Em produção, usar Redis ou Firestore
const processedTransactions = new Map<string, ProcessedTransaction>();

/**
 * Verifica se a transação já foi processada
 */
export function isTransactionProcessed(idempotencyKey: string): boolean {
  return processedTransactions.has(idempotencyKey);
}

/**
 * Registra transação processada
 */
export function registerProcessedTransaction(transaction: ProcessedTransaction): void {
  processedTransactions.set(transaction.idempotencyKey, transaction);
}

/**
 * Obtém transação processada
 */
export function getProcessedTransaction(idempotencyKey: string): ProcessedTransaction | undefined {
  return processedTransactions.get(idempotencyKey);
}

// ============================================================================
// CLOUD FUNCTION: onPaymentConfirmed
// ============================================================================

/**
 * Handler principal para webhook de pagamento confirmado
 *
 * Esta função é chamada quando o AppSheet/Base44 confirma que um pagamento
 * foi recebido (PIX ou Boleto compensado).
 *
 * Em produção, seria deployada como:
 * exports.onPaymentConfirmed = functions.https.onRequest(handler)
 */
export async function onPaymentConfirmed(
  payload: WebhookPayload,
  config: TransactionConfig
): Promise<CloudFunctionResponse> {
  const timestamp = new Date().toISOString();

  try {
    // 1. Verificação de idempotência
    if (isTransactionProcessed(payload.idempotencyKey)) {
      const existing = getProcessedTransaction(payload.idempotencyKey);
      return {
        status: 'duplicate',
        hash: existing?.txHash,
        message: 'Transaction already processed',
        timestamp,
      };
    }

    // 2. Validação do payload
    if (!payload.contractId || !payload.tokenId || !payload.amountPaid) {
      return {
        status: 'error',
        message: 'Invalid payload: missing required fields',
        timestamp,
      };
    }

    if (payload.amountPaid <= 0) {
      return {
        status: 'error',
        message: 'Invalid amount: must be greater than 0',
        timestamp,
      };
    }

    console.log(`[Vinculo.io] Iniciando liquidação para Contrato: ${payload.contractId}`);

    // 3. Simula conexão com blockchain (em produção, usar ethers.js)
    // const provider = new ethers.JsonRpcProvider(config.providerUrl);
    // const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
    // const contract = new ethers.Contract(config.contractAddress, CONTRACT_ABI, wallet);

    // 4. Simula chamada ao Smart Contract
    await simulateBlockchainTransaction(payload, config);

    // 5. Gera hash de transação simulado
    const txHash = `0x${generateRandomHex(64)}`;
    const blockNumber = Math.floor(Math.random() * 1000000) + 50000000;

    // 6. Registra transação processada
    registerProcessedTransaction({
      idempotencyKey: payload.idempotencyKey,
      contractId: payload.contractId,
      txHash,
      blockNumber,
      timestamp,
      status: 'confirmed',
    });

    console.log(`[Vinculo.io] Transação confirmada no bloco: ${blockNumber}`);

    return {
      status: 'success',
      hash: txHash,
      blockNumber,
      gasUsed: '85000',
      timestamp,
    };
  } catch (error) {
    console.error('[Vinculo.io] Erro na integração Blockchain:', error);

    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp,
    };
  }
}

// ============================================================================
// CLOUD FUNCTION: onCollateralLock
// ============================================================================

export interface CollateralLockPayload {
  contractId: string;
  tokenId: string;
  guarantorId: string;
  guarantorWallet: string;
  propertyId: string;
  propertyValue: number;
  lockDuration: number; // meses
  idempotencyKey: string;
}

/**
 * Handler para bloqueio de garantia do garantidor
 */
export async function onCollateralLock(
  payload: CollateralLockPayload,
  config: TransactionConfig
): Promise<CloudFunctionResponse> {
  const timestamp = new Date().toISOString();

  try {
    // Verificação de idempotência
    if (isTransactionProcessed(payload.idempotencyKey)) {
      const existing = getProcessedTransaction(payload.idempotencyKey);
      return {
        status: 'duplicate',
        hash: existing?.txHash,
        message: 'Collateral already locked',
        timestamp,
      };
    }

    console.log(`[Vinculo.io] Bloqueando garantia para imóvel: ${payload.propertyId}`);

    // Simula transação de bloqueio
    await new Promise(resolve => setTimeout(resolve, 1500));

    const txHash = `0x${generateRandomHex(64)}`;
    const blockNumber = Math.floor(Math.random() * 1000000) + 50000000;

    registerProcessedTransaction({
      idempotencyKey: payload.idempotencyKey,
      contractId: payload.contractId,
      txHash,
      blockNumber,
      timestamp,
      status: 'confirmed',
    });

    return {
      status: 'success',
      hash: txHash,
      blockNumber,
      gasUsed: '120000',
      timestamp,
    };
  } catch (error) {
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp,
    };
  }
}

// ============================================================================
// CLOUD FUNCTION: onCollateralRelease
// ============================================================================

export interface CollateralReleasePayload {
  contractId: string;
  tokenId: string;
  guarantorId: string;
  propertyId: string;
  releaseReason: 'contract_completed' | 'contract_terminated' | 'dispute_resolved';
  approvedBy: string[];
  idempotencyKey: string;
}

/**
 * Handler para liberação de garantia
 */
export async function onCollateralRelease(
  payload: CollateralReleasePayload,
  config: TransactionConfig
): Promise<CloudFunctionResponse> {
  const timestamp = new Date().toISOString();

  try {
    // Verifica Multi-Sig (2 de 3 assinaturas)
    if (payload.approvedBy.length < 2) {
      return {
        status: 'error',
        message: 'Multi-Sig required: at least 2 of 3 signatures needed',
        timestamp,
      };
    }

    if (isTransactionProcessed(payload.idempotencyKey)) {
      const existing = getProcessedTransaction(payload.idempotencyKey);
      return {
        status: 'duplicate',
        hash: existing?.txHash,
        message: 'Collateral already released',
        timestamp,
      };
    }

    console.log(`[Vinculo.io] Liberando garantia do imóvel: ${payload.propertyId}`);

    await new Promise(resolve => setTimeout(resolve, 1200));

    const txHash = `0x${generateRandomHex(64)}`;
    const blockNumber = Math.floor(Math.random() * 1000000) + 50000000;

    registerProcessedTransaction({
      idempotencyKey: payload.idempotencyKey,
      contractId: payload.contractId,
      txHash,
      blockNumber,
      timestamp,
      status: 'confirmed',
    });

    return {
      status: 'success',
      hash: txHash,
      blockNumber,
      gasUsed: '95000',
      timestamp,
    };
  } catch (error) {
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp,
    };
  }
}

// ============================================================================
// CLOUD FUNCTION: onContractMint
// ============================================================================

export interface ContractMintPayload {
  landlordId: string;
  landlordWallet: string;
  tenantId: string;
  tenantWallet: string;
  guarantorId?: string;
  guarantorWallet?: string;
  insurerId: string;
  insurerWallet: string;
  propertyId: string;
  rentAmount: number;
  contractDuration: number; // meses
  collateralPropertyId?: string;
  metadataUri: string;
  idempotencyKey: string;
}

/**
 * Handler para mintagem de NFT do contrato
 */
export async function onContractMint(
  payload: ContractMintPayload,
  config: TransactionConfig
): Promise<CloudFunctionResponse & { tokenId?: string }> {
  const timestamp = new Date().toISOString();

  try {
    if (isTransactionProcessed(payload.idempotencyKey)) {
      const existing = getProcessedTransaction(payload.idempotencyKey);
      return {
        status: 'duplicate',
        hash: existing?.txHash,
        message: 'Contract NFT already minted',
        timestamp,
      };
    }

    console.log(`[Vinculo.io] Mintando NFT para contrato do imóvel: ${payload.propertyId}`);

    // Simula mintagem
    await new Promise(resolve => setTimeout(resolve, 2000));

    const txHash = `0x${generateRandomHex(64)}`;
    const blockNumber = Math.floor(Math.random() * 1000000) + 50000000;
    const tokenId = Math.floor(Math.random() * 100000).toString();

    registerProcessedTransaction({
      idempotencyKey: payload.idempotencyKey,
      contractId: payload.propertyId,
      txHash,
      blockNumber,
      timestamp,
      status: 'confirmed',
    });

    return {
      status: 'success',
      hash: txHash,
      blockNumber,
      tokenId,
      gasUsed: '250000',
      timestamp,
    };
  } catch (error) {
    return {
      status: 'error',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp,
    };
  }
}

// ============================================================================
// HELPERS
// ============================================================================

function generateRandomHex(length: number): string {
  let result = '';
  const characters = '0123456789abcdef';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

async function simulateBlockchainTransaction(
  payload: WebhookPayload,
  _config: TransactionConfig
): Promise<void> {
  // Simula latência de rede
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Simula possível falha (5% chance)
  if (Math.random() < 0.05) {
    throw new Error('Network timeout: Unable to reach blockchain node');
  }
}

// ============================================================================
// WEBHOOK VALIDATION
// ============================================================================

export interface WebhookValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Valida assinatura do webhook (HMAC-SHA256)
 */
export function validateWebhookSignature(
  payload: string,
  signature: string,
  _secret: string
): WebhookValidationResult {
  // Em produção, implementar verificação HMAC-SHA256
  // const expectedSignature = crypto
  //   .createHmac('sha256', secret)
  //   .update(payload)
  //   .digest('hex');

  if (!signature || signature.length < 10) {
    return {
      valid: false,
      error: 'Invalid webhook signature',
    };
  }

  return { valid: true };
}

// ============================================================================
// GAS MANAGEMENT
// ============================================================================

export interface GasEstimate {
  gasPrice: string;
  gasLimit: number;
  estimatedCostWei: string;
  estimatedCostEth: string;
  estimatedCostUsd: number;
}

/**
 * Estima custo de gas para transação
 */
export async function estimateGas(
  _network: NetworkType,
  _functionName: string
): Promise<GasEstimate> {
  // Simula estimativa de gas
  const gasPrice = '30000000000'; // 30 gwei
  const gasLimit = 150000;
  const estimatedCostWei = (BigInt(gasPrice) * BigInt(gasLimit)).toString();
  const estimatedCostEth = (Number(estimatedCostWei) / 1e18).toFixed(6);
  const maticPriceUsd = 0.85; // Preço simulado
  const estimatedCostUsd = Number(estimatedCostEth) * maticPriceUsd;

  return {
    gasPrice,
    gasLimit,
    estimatedCostWei,
    estimatedCostEth,
    estimatedCostUsd: Math.round(estimatedCostUsd * 100) / 100,
  };
}

/**
 * Verifica saldo mínimo da carteira da plataforma
 */
export async function checkPlatformWalletBalance(
  _network: NetworkType,
  _walletAddress: string
): Promise<{
  balance: string;
  balanceEth: string;
  sufficientForGas: boolean;
  minimumRequired: string;
}> {
  // Simula verificação de saldo
  const balance = '5000000000000000000'; // 5 MATIC
  const balanceEth = '5.0';
  const minimumRequired = '0.1';

  return {
    balance,
    balanceEth,
    sufficientForGas: Number(balanceEth) >= Number(minimumRequired),
    minimumRequired,
  };
}
