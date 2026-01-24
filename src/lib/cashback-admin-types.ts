// =============================================================================
// Tipos para Painel Admin de Cashback VBRz
// =============================================================================

import { type CashbackType, type LoyaltyTier } from './tokenomics-types';

// -----------------------------------------------------------------------------
// TIPOS DE USUARIO
// -----------------------------------------------------------------------------

export type UserRole = 'tenant' | 'landlord' | 'guarantor' | 'admin';

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  tenant: 'Inquilino',
  landlord: 'Proprietário',
  guarantor: 'Garantidor',
  admin: 'Administrador',
};

// -----------------------------------------------------------------------------
// CATEGORIAS DE CASHBACK
// -----------------------------------------------------------------------------

export type CashbackCategory =
  | 'tenant' // Operacoes de inquilino
  | 'landlord' // Operacoes de proprietario
  | 'guarantor' // Operacoes de garantidor
  | 'marketplace' // Marketplace
  | 'insurance' // Seguros
  | 'financial' // Financeiro
  | 'referral' // Indicacoes
  | 'loyalty' // Fidelidade
  | 'promotional'; // Promocional

export const CASHBACK_CATEGORY_LABELS: Record<CashbackCategory, string> = {
  tenant: 'Inquilino',
  landlord: 'Proprietário',
  guarantor: 'Garantidor',
  marketplace: 'Marketplace',
  insurance: 'Seguros',
  financial: 'Financeiro',
  referral: 'Indicações',
  loyalty: 'Fidelidade',
  promotional: 'Promocional',
};

// Mapeamento de tipo para categoria
export const CASHBACK_TYPE_CATEGORY: Record<CashbackType, CashbackCategory> = {
  RENT_PAYMENT: 'tenant',
  RENT_EARLY_PAYMENT: 'tenant',
  CONTRACT_SIGNING: 'tenant',
  CONTRACT_RENEWAL: 'tenant',
  RENT_RECEIVED: 'landlord',
  PROPERTY_LISTING: 'landlord',
  ANTICIPATION_FEE: 'landlord',
  GUARANTOR_BONUS: 'guarantor',
  GUARANTEE_ISSUED: 'guarantor',
  GUARANTEE_RENEWAL: 'guarantor',
  MARKETPLACE_PURCHASE: 'marketplace',
  MARKETPLACE_SALE: 'marketplace',
  SERVICE_HIRE: 'marketplace',
  INSURANCE_BONUS: 'insurance',
  INSURANCE_RENEWAL: 'insurance',
  ANTICIPATION_CASHBACK: 'financial',
  PIX_PAYMENT: 'financial',
  REFERRAL: 'referral',
  REFERRAL_TENANT: 'referral',
  REFERRAL_LANDLORD: 'referral',
  REFERRAL_GUARANTOR: 'referral',
  LOYALTY_REWARD: 'loyalty',
  TIER_UPGRADE: 'loyalty',
  STREAK_BONUS: 'loyalty',
  PROMOTIONAL: 'promotional',
  FIRST_RENT: 'promotional',
  WELCOME_BONUS: 'promotional',
};

// -----------------------------------------------------------------------------
// REGRAS DE CASHBACK
// -----------------------------------------------------------------------------

export interface CashbackRule {
  id: string;
  type: CashbackType;
  category: CashbackCategory;
  name: string;
  description: string;
  // Tipo de calculo
  calculationType: 'percentage' | 'fixed';
  // Valor
  rate: number; // Percentual (0.01 = 1%) ou valor fixo em VBRz
  // Beneficiario
  beneficiary: UserRole;
  // Condicoes
  conditions: CashbackCondition[];
  // Limites
  minAmountBRL?: number;
  maxAmountBRL?: number;
  maxCashbackVBRz?: number;
  // Multiplicadores
  applyLoyaltyMultiplier: boolean;
  // Status
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CashbackCondition {
  field: string;
  operator: 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte';
  value: string | number | boolean;
  description: string;
}

// -----------------------------------------------------------------------------
// TRANSACAO ADMIN
// -----------------------------------------------------------------------------

export interface AdminCashbackTransaction {
  id: string;
  // Usuario
  userId: string;
  userName: string;
  userEmail: string;
  userRole: UserRole;
  walletAddress: string;
  // Tipo
  type: CashbackType;
  category: CashbackCategory;
  // Valores
  originalAmountBRL: number;
  cashbackRate: number;
  cashbackVBRz: number;
  cashbackBRL: number;
  // Bonus
  loyaltyTier: LoyaltyTier;
  loyaltyMultiplier: number;
  bonusVBRz: number;
  // Referencia
  referenceType: string;
  referenceId: string;
  referenceDescription: string;
  // Status
  status: 'pending' | 'processing' | 'confirmed' | 'failed' | 'cancelled';
  // Blockchain
  txHash?: string;
  blockNumber?: number;
  // Timestamps
  createdAt: Date;
  processedAt?: Date;
  confirmedAt?: Date;
}

// -----------------------------------------------------------------------------
// METRICAS E ESTATISTICAS
// -----------------------------------------------------------------------------

export interface CashbackAdminStats {
  // Totais gerais
  totalDistributed: number; // Total VBRz distribuidos
  totalDistributedBRL: number; // Equivalente em BRL
  totalTransactions: number;
  totalUsers: number;
  // Por periodo
  distributedToday: number;
  distributedThisWeek: number;
  distributedThisMonth: number;
  // Por categoria
  byCategory: Record<CashbackCategory, CategoryStats>;
  // Por tipo de usuario
  byUserRole: Record<UserRole, RoleStats>;
  // Por tier
  byTier: Record<LoyaltyTier, number>;
  // Carteira de Cashback (ORIGEM dos pagamentos de cashback)
  // IMPORTANTE: Cashback SAI da CASHBACK_WALLET, não da TREASURY_WALLET
  cashbackWalletBalance: number;
  cashbackWalletBalanceBRL: number;
  // Treasury é separado - usado para reservas e investimentos
  treasuryBalance: number;
  treasuryBalanceBRL: number;
  // Tendencias
  trend7Days: TrendDataPoint[];
  trend30Days: TrendDataPoint[];
}

export interface CategoryStats {
  totalVBRz: number;
  totalBRL: number;
  transactionCount: number;
  userCount: number;
  averagePerTransaction: number;
}

export interface RoleStats {
  totalVBRz: number;
  totalBRL: number;
  userCount: number;
  averagePerUser: number;
}

export interface TrendDataPoint {
  date: string;
  distributed: number;
  transactions: number;
}

// -----------------------------------------------------------------------------
// FILTROS
// -----------------------------------------------------------------------------

export interface CashbackFilters {
  dateFrom?: Date;
  dateTo?: Date;
  types?: CashbackType[];
  categories?: CashbackCategory[];
  userRoles?: UserRole[];
  tiers?: LoyaltyTier[];
  status?: string[];
  minAmount?: number;
  maxAmount?: number;
  searchQuery?: string;
}

// -----------------------------------------------------------------------------
// ACOES EM MASSA
// -----------------------------------------------------------------------------

export interface BulkCashbackAction {
  action: 'approve' | 'reject' | 'retry' | 'cancel';
  transactionIds: string[];
  reason?: string;
}

export interface BulkCashbackResult {
  success: number;
  failed: number;
  errors: { id: string; error: string }[];
}

// -----------------------------------------------------------------------------
// CONFIGURACOES
// -----------------------------------------------------------------------------

export interface CashbackSettings {
  // Limites globais
  dailyLimit: number; // Limite diario de distribuicao
  monthlyLimit: number; // Limite mensal
  perTransactionLimit: number; // Limite por transacao
  // Notificacoes
  notifyOnLargeTransaction: boolean;
  largeTransactionThreshold: number;
  // Auto-aprovacao
  autoApproveBelow: number; // Auto-aprovar abaixo de X VBRz
  requireApprovalAbove: number; // Requerer aprovacao acima de X VBRz
  // Treasury
  treasuryWarningThreshold: number; // Alertar quando treasury cair abaixo
  // Fraude
  enableFraudDetection: boolean;
  maxDailyPerUser: number;
}

// -----------------------------------------------------------------------------
// DADOS VAZIOS PARA PRODUCAO (SEM MOCKS)
// Regras e estatisticas serao carregadas do backend
// -----------------------------------------------------------------------------

export const MOCK_CASHBACK_RULES: CashbackRule[] = [];

const EMPTY_CATEGORY_STATS: CategoryStats = {
  totalVBRz: 0,
  totalBRL: 0,
  transactionCount: 0,
  userCount: 0,
  averagePerTransaction: 0,
};

const EMPTY_ROLE_STATS: RoleStats = {
  totalVBRz: 0,
  totalBRL: 0,
  userCount: 0,
  averagePerUser: 0,
};

export const MOCK_ADMIN_STATS: CashbackAdminStats = {
  totalDistributed: 0,
  totalDistributedBRL: 0,
  totalTransactions: 0,
  totalUsers: 0,
  distributedToday: 0,
  distributedThisWeek: 0,
  distributedThisMonth: 0,
  byCategory: {
    tenant: { ...EMPTY_CATEGORY_STATS },
    landlord: { ...EMPTY_CATEGORY_STATS },
    guarantor: { ...EMPTY_CATEGORY_STATS },
    marketplace: { ...EMPTY_CATEGORY_STATS },
    insurance: { ...EMPTY_CATEGORY_STATS },
    financial: { ...EMPTY_CATEGORY_STATS },
    referral: { ...EMPTY_CATEGORY_STATS },
    loyalty: { ...EMPTY_CATEGORY_STATS },
    promotional: { ...EMPTY_CATEGORY_STATS },
  },
  byUserRole: {
    tenant: { ...EMPTY_ROLE_STATS },
    landlord: { ...EMPTY_ROLE_STATS },
    guarantor: { ...EMPTY_ROLE_STATS },
    admin: { ...EMPTY_ROLE_STATS },
  },
  byTier: {
    bronze: 0,
    prata: 0,
    ouro: 0,
    diamante: 0,
  },
  // Cashback Wallet - ORIGEM dos pagamentos de cashback
  cashbackWalletBalance: 0,
  cashbackWalletBalanceBRL: 0,
  // Treasury - Reservas e investimentos (separado)
  treasuryBalance: 0,
  treasuryBalanceBRL: 0,
  trend7Days: [],
  trend30Days: [],
};

export function generateMockTransactions(_count: number = 50): AdminCashbackTransaction[] {
  // Retorna array vazio em producao - dados virao do backend
  return [];
}
