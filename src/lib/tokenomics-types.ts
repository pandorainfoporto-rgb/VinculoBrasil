// =============================================================================
// Vinculo Token (VBRz) - Tipos para Sistema de Tokenomics e Cashback
// =============================================================================
// Este modulo define todos os tipos TypeScript para:
// - Token VBRz (Vinculo Token)
// - Sistema de Cashback
// - Programa de Fidelidade On-Chain
// - Integracao com Blockchain
// =============================================================================

// -----------------------------------------------------------------------------
// CONSTANTES DO TOKEN
// -----------------------------------------------------------------------------

/** Configuracao do token VBRz */
export const VBRZ_CONFIG = {
  name: 'Vinculo Token',
  symbol: 'VBRz',
  decimals: 18,
  maxSupply: 1_000_000_000, // 1 bilhao
  fixedPegBRL: 0.10, // 1 VBRz = R$ 0,10
  chainId: 137, // Polygon Mainnet
  chainName: 'Polygon',
} as const;

/** Distribuicao do token (Tokenomics 2.0) */
export const TOKEN_DISTRIBUTION = {
  treasury: { percent: 20, amount: 200_000_000, label: 'Treasury', color: '#3B82F6' },
  cashbackPool: { percent: 40, amount: 400_000_000, label: 'Cashback Pool', color: '#22C55E' },
  team: { percent: 15, amount: 150_000_000, label: 'Team (Vesting)', color: '#8B5CF6' },
  staking: { percent: 10, amount: 100_000_000, label: 'Staking Rewards', color: '#F59E0B' },
  marketing: { percent: 5, amount: 50_000_000, label: 'Marketing', color: '#EC4899' },
  reserve: { percent: 10, amount: 100_000_000, label: 'Reserve', color: '#6B7280' },
} as const;

/** Configuracao de Vesting da Treasury */
export const VESTING_CONFIG = {
  cliffDays: 365, // 12 meses de cliff
  vestingMonths: 36, // 36 meses de vesting apos cliff
  releasePerMonth: 0.05, // 5% por mes apos cliff
  startDate: new Date('2025-01-01'), // Data de inicio do vesting
} as const;

/** Taxas de cashback por tipo */
export const CASHBACK_RATES = {
  RENT_PAYMENT: 0.01, // 1% do aluguel
  INSURANCE_BONUS: 0.02, // 2% do premio
  REFERRAL_BONUS: 500, // 500 VBRz fixo
  GUARANTOR_BONUS: 0.005, // 0.5% da comissao
  SERVICE_BONUS: 0.01, // 1% do servico
  LOYALTY_MULTIPLIER: {
    bronze: 1.0,
    prata: 1.2,
    ouro: 1.5,
    diamante: 2.0,
  },
} as const;

// -----------------------------------------------------------------------------
// TIPOS DO TOKEN
// -----------------------------------------------------------------------------

/** Tipo de cashback/recompensa */
export type CashbackType =
  // === INQUILINO ===
  | 'RENT_PAYMENT' // Pagamento de aluguel em dia
  | 'RENT_EARLY_PAYMENT' // Pagamento antecipado do aluguel
  | 'CONTRACT_SIGNING' // Assinatura de contrato
  | 'CONTRACT_RENEWAL' // Renovacao de contrato
  // === PROPRIETARIO ===
  | 'RENT_RECEIVED' // Aluguel recebido (proprietario)
  | 'PROPERTY_LISTING' // Cadastro de imovel
  | 'ANTICIPATION_FEE' // Taxa de antecipacao
  // === GARANTIDOR ===
  | 'GUARANTOR_BONUS' // Bonus mensal de garantidor ativo
  | 'GUARANTEE_ISSUED' // Carta de garantia emitida
  | 'GUARANTEE_RENEWAL' // Renovacao de garantia
  // === MARKETPLACE ===
  | 'MARKETPLACE_PURCHASE' // Compra no marketplace
  | 'MARKETPLACE_SALE' // Venda no marketplace (para parceiros)
  | 'SERVICE_HIRE' // Contratacao de servico
  // === SEGUROS ===
  | 'INSURANCE_BONUS' // Bonus por contratar seguro
  | 'INSURANCE_RENEWAL' // Renovacao de seguro
  // === FINANCEIRO ===
  | 'ANTICIPATION_CASHBACK' // Cashback em antecipacao
  | 'PIX_PAYMENT' // Pagamento via Pix
  // === INDICACOES ===
  | 'REFERRAL' // Indicacao de amigo
  | 'REFERRAL_TENANT' // Indicacao de inquilino
  | 'REFERRAL_LANDLORD' // Indicacao de proprietario
  | 'REFERRAL_GUARANTOR' // Indicacao de garantidor
  // === FIDELIDADE ===
  | 'LOYALTY_REWARD' // Recompensa de fidelidade
  | 'TIER_UPGRADE' // Upgrade de tier
  | 'STREAK_BONUS' // Bonus por pagamentos consecutivos
  // === PROMOCIONAL ===
  | 'PROMOTIONAL' // Promocao especial
  | 'FIRST_RENT' // Primeiro aluguel
  | 'WELCOME_BONUS'; // Bonus de boas-vindas

/** Status da transacao de token */
export type TokenTransactionStatus =
  | 'pending'
  | 'processing'
  | 'confirmed'
  | 'failed'
  | 'cancelled';

/** Tipo de transacao de token */
export type TokenTransactionType =
  | 'cashback' // Recebeu cashback
  | 'transfer' // Transferencia entre usuarios
  | 'redeem' // Resgate por servico
  | 'burn' // Queima de tokens
  | 'purchase' // Compra de tokens (Fase 2)
  | 'swap'; // Troca em DEX (Fase 2)

/** Tier do programa de fidelidade */
export type LoyaltyTier = 'bronze' | 'prata' | 'ouro' | 'diamante';

// -----------------------------------------------------------------------------
// INTERFACES PRINCIPAIS
// -----------------------------------------------------------------------------

/** Saldo de tokens do usuario */
export interface TokenBalance {
  userId: string;
  walletAddress: string;

  // Saldos
  balanceVBRz: number; // Saldo em VBRz
  balanceBRL: number; // Valor em Reais (calculado)
  lockedBalance: number; // Tokens bloqueados (staking futuro)

  // Estatisticas
  totalReceived: number; // Total de cashback recebido
  totalBurned: number; // Total resgatado/queimado
  totalTransferred: number; // Total transferido

  // Fidelidade
  loyaltyTier: LoyaltyTier;
  loyaltyMultiplier: number;

  // Timestamps
  lastUpdated: Date;
  createdAt: Date;
}

/** Transacao de cashback */
export interface CashbackTransaction {
  id: string;
  userId: string;
  walletAddress: string;

  // Detalhes do cashback
  type: CashbackType;
  referenceType: 'contract' | 'payment' | 'insurance' | 'service' | 'referral';
  referenceId: string;

  // Valores
  originalAmountBRL: number; // Valor original em Reais
  cashbackRate: number; // Taxa aplicada
  cashbackAmountVBRz: number; // Quantidade de VBRz
  cashbackValueBRL: number; // Valor em Reais

  // Bonus de fidelidade
  loyaltyBonus: number; // Multiplicador aplicado
  bonusAmountVBRz: number; // VBRz extra por fidelidade

  // Status
  status: TokenTransactionStatus;

  // Blockchain
  txHash?: string;
  blockNumber?: number;
  gasUsed?: number;

  // Timestamps
  createdAt: Date;
  processedAt?: Date;
  confirmedAt?: Date;
}

/** Transacao de token generica */
export interface TokenTransaction {
  id: string;
  userId: string;
  walletAddress: string;

  // Tipo e direcao
  type: TokenTransactionType;
  direction: 'in' | 'out';

  // Valores
  amountVBRz: number;
  valueBRL: number;

  // Contraparte (para transferencias)
  counterpartyAddress?: string;
  counterpartyUserId?: string;

  // Detalhes do resgate (se aplicavel)
  redeemDetails?: RedeemDetails;

  // Status
  status: TokenTransactionStatus;

  // Blockchain
  txHash?: string;
  blockNumber?: number;

  // Timestamps
  createdAt: Date;
  confirmedAt?: Date;
}

/** Detalhes de resgate de tokens */
export interface RedeemDetails {
  serviceType: 'marketplace' | 'insurance' | 'rent_discount' | 'partner_voucher';
  serviceId: string;
  serviceName: string;
  originalPriceBRL: number;
  discountBRL: number;
  tokensUsed: number;
}

/** Registro de indicacao */
export interface ReferralRecord {
  id: string;
  referrerId: string;
  referrerWallet: string;
  referredUserId: string;
  referredEmail: string;

  // Recompensa
  bonusVBRz: number;
  bonusStatus: 'pending' | 'paid' | 'cancelled';

  // Condicoes
  conditionMet: boolean; // Ex: indicado fez primeiro pagamento
  conditionDescription: string;

  // Timestamps
  referredAt: Date;
  bonusPaidAt?: Date;
}

/** Configuracao de parceiro para resgate */
export interface RedeemPartner {
  id: string;
  name: string;
  logo: string;
  category: 'delivery' | 'retail' | 'streaming' | 'travel' | 'other';

  // Ofertas
  offers: PartnerOffer[];

  // Status
  isActive: boolean;
  createdAt: Date;
}

/** Oferta de parceiro */
export interface PartnerOffer {
  id: string;
  partnerId: string;
  title: string;
  description: string;

  // Valores
  voucherValueBRL: number;
  priceVBRz: number;
  discountPercent?: number; // Desconto sobre valor normal

  // Estoque
  availableQuantity?: number;
  totalRedeemed: number;

  // Validade
  validUntil?: Date;
  isActive: boolean;
}

// -----------------------------------------------------------------------------
// INTERFACES DE ESTATISTICAS
// -----------------------------------------------------------------------------

/** Estatisticas do token (visao geral) */
export interface TokenStats {
  // Supply
  totalSupply: number;
  circulatingSupply: number;
  treasuryBalance: number;
  totalBurned: number;

  // Distribuicao
  totalCashbackDistributed: number;
  totalUsersWithBalance: number;
  averageBalance: number;

  // Volume (24h)
  volume24h: number;
  transactions24h: number;

  // Valor (Fase 2 - DEX)
  marketPrice?: number; // Preco no mercado
  priceChange24h?: number;
  liquidityPool?: number;

  // Timestamps
  lastUpdated: Date;
}

/** Estatisticas do usuario */
export interface UserTokenStats {
  userId: string;

  // Saldo atual
  currentBalance: number;
  currentValueBRL: number;

  // Historico de cashback
  totalCashbackReceived: number;
  cashbackByType: Record<CashbackType, number>;

  // Resgates
  totalRedeemed: number;
  redemptionsByCategory: Record<string, number>;

  // Indicacoes
  totalReferrals: number;
  successfulReferrals: number;
  referralBonusEarned: number;

  // Fidelidade
  currentTier: LoyaltyTier;
  pointsToNextTier: number;
  tierBenefits: TierBenefits;

  // Periodo
  periodStart: Date;
  periodEnd: Date;
}

/** Beneficios do tier de fidelidade */
export interface TierBenefits {
  tier: LoyaltyTier;
  cashbackMultiplier: number;
  rentDiscount: number; // % de desconto no aluguel
  prioritySupport: boolean;
  exclusiveOffers: boolean;
  partnerDiscounts: number; // % extra em parceiros
}

// -----------------------------------------------------------------------------
// INTERFACES DE INTEGRACAO BLOCKCHAIN
// -----------------------------------------------------------------------------

/** Configuracao de carteira */
export interface WalletConfig {
  userId: string;
  address: string;
  chainId: number;

  // Tipo de carteira
  walletType: 'metamask' | 'walletconnect' | 'coinbase' | 'embedded';
  isEmbedded: boolean; // Carteira custodiada pela plataforma

  // Status
  isVerified: boolean;
  isPrimary: boolean;

  // Timestamps
  connectedAt: Date;
  lastUsed: Date;
}

/** Parametros para distribuicao de cashback */
export interface CashbackDistributionParams {
  tenantWallet: string;
  rentAmountBRL: number; // Em centavos
  contractId: string;
  paymentDate: Date;
  dueDate: Date;
}

/** Resultado da distribuicao de cashback */
export interface CashbackDistributionResult {
  success: boolean;
  transactionId: string;
  cashbackVBRz: number;
  cashbackBRL: number;
  txHash?: string;
  error?: string;
}

/** Parametros para resgate */
export interface RedeemParams {
  userWallet: string;
  amountVBRz: number;
  serviceId: string;
  serviceType: string;
  description: string;
}

/** Resultado do resgate */
export interface RedeemResult {
  success: boolean;
  transactionId: string;
  tokensRedeemed: number;
  valueBRL: number;
  txHash?: string;
  voucherCode?: string;
  error?: string;
}

// -----------------------------------------------------------------------------
// TIPOS PARA NOTIFICACOES
// -----------------------------------------------------------------------------

/** Notificacao de cashback */
export interface CashbackNotification {
  id: string;
  userId: string;
  type: 'cashback_received' | 'referral_bonus' | 'loyalty_upgrade' | 'offer_available';

  // Conteudo
  title: string;
  message: string;
  amountVBRz?: number;
  valueBRL?: number;

  // Acao
  actionUrl?: string;
  actionLabel?: string;

  // Status
  isRead: boolean;
  createdAt: Date;
  readAt?: Date;
}

// -----------------------------------------------------------------------------
// CONSTANTES DE TIERS
// -----------------------------------------------------------------------------

export const LOYALTY_TIERS: Record<LoyaltyTier, TierBenefits> = {
  bronze: {
    tier: 'bronze',
    cashbackMultiplier: 1.0,
    rentDiscount: 0,
    prioritySupport: false,
    exclusiveOffers: false,
    partnerDiscounts: 0,
  },
  prata: {
    tier: 'prata',
    cashbackMultiplier: 1.2,
    rentDiscount: 0.005, // 0.5%
    prioritySupport: false,
    exclusiveOffers: true,
    partnerDiscounts: 0.05, // 5%
  },
  ouro: {
    tier: 'ouro',
    cashbackMultiplier: 1.5,
    rentDiscount: 0.01, // 1%
    prioritySupport: true,
    exclusiveOffers: true,
    partnerDiscounts: 0.10, // 10%
  },
  diamante: {
    tier: 'diamante',
    cashbackMultiplier: 2.0,
    rentDiscount: 0.02, // 2%
    prioritySupport: true,
    exclusiveOffers: true,
    partnerDiscounts: 0.15, // 15%
  },
};

/** Requisitos para cada tier */
export const TIER_REQUIREMENTS: Record<LoyaltyTier, { minBalance: number; minMonths: number }> = {
  bronze: { minBalance: 0, minMonths: 0 },
  prata: { minBalance: 1000, minMonths: 3 },
  ouro: { minBalance: 5000, minMonths: 6 },
  diamante: { minBalance: 20000, minMonths: 12 },
};

// -----------------------------------------------------------------------------
// LABELS E HELPERS
// -----------------------------------------------------------------------------

export const CASHBACK_TYPE_LABELS: Record<CashbackType, string> = {
  // Inquilino
  RENT_PAYMENT: 'Pagamento de Aluguel',
  RENT_EARLY_PAYMENT: 'Pagamento Antecipado',
  CONTRACT_SIGNING: 'Assinatura de Contrato',
  CONTRACT_RENEWAL: 'Renovacao de Contrato',
  // Proprietario
  RENT_RECEIVED: 'Aluguel Recebido',
  PROPERTY_LISTING: 'Cadastro de Imovel',
  ANTICIPATION_FEE: 'Taxa de Antecipacao',
  // Garantidor
  GUARANTOR_BONUS: 'Bonus de Garantidor',
  GUARANTEE_ISSUED: 'Carta de Garantia',
  GUARANTEE_RENEWAL: 'Renovacao de Garantia',
  // Marketplace
  MARKETPLACE_PURCHASE: 'Compra no Marketplace',
  MARKETPLACE_SALE: 'Venda no Marketplace',
  SERVICE_HIRE: 'Contratacao de Servico',
  // Seguros
  INSURANCE_BONUS: 'Bonus de Seguro',
  INSURANCE_RENEWAL: 'Renovacao de Seguro',
  // Financeiro
  ANTICIPATION_CASHBACK: 'Cashback Antecipacao',
  PIX_PAYMENT: 'Pagamento via Pix',
  // Indicacoes
  REFERRAL: 'Indicacao de Amigo',
  REFERRAL_TENANT: 'Indicacao de Inquilino',
  REFERRAL_LANDLORD: 'Indicacao de Proprietario',
  REFERRAL_GUARANTOR: 'Indicacao de Garantidor',
  // Fidelidade
  LOYALTY_REWARD: 'Recompensa de Fidelidade',
  TIER_UPGRADE: 'Upgrade de Tier',
  STREAK_BONUS: 'Bonus Consecutivo',
  // Promocional
  PROMOTIONAL: 'Promocao Especial',
  FIRST_RENT: 'Primeiro Aluguel',
  WELCOME_BONUS: 'Bonus de Boas-vindas',
};

export const LOYALTY_TIER_LABELS: Record<LoyaltyTier, string> = {
  bronze: 'Bronze',
  prata: 'Prata',
  ouro: 'Ouro',
  diamante: 'Diamante',
};

export const TOKEN_TX_TYPE_LABELS: Record<TokenTransactionType, string> = {
  cashback: 'Cashback',
  transfer: 'Transferencia',
  redeem: 'Resgate',
  burn: 'Queima',
  purchase: 'Compra',
  swap: 'Troca',
};

/** Formata quantidade de VBRz para exibicao */
export function formatVBRz(amount: number): string {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/** Converte VBRz para BRL */
export function vbrzToBRL(amountVBRz: number): number {
  return amountVBRz * VBRZ_CONFIG.fixedPegBRL;
}

/** Converte BRL para VBRz */
export function brlToVBRz(amountBRL: number): number {
  return amountBRL / VBRZ_CONFIG.fixedPegBRL;
}

/** Calcula cashback de aluguel */
export function calculateRentCashback(rentAmountBRL: number, tier: LoyaltyTier = 'bronze'): number {
  const baseCashback = rentAmountBRL * CASHBACK_RATES.RENT_PAYMENT;
  const multiplier = CASHBACK_RATES.LOYALTY_MULTIPLIER[tier];
  const cashbackBRL = baseCashback * multiplier;
  return brlToVBRz(cashbackBRL);
}
