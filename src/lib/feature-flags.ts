/**
 * Feature Flags - Sistema de Controle de Modulos
 * Permite habilitar/desabilitar funcionalidades especificas da plataforma
 *
 * Uso:
 * - Lancamento gradual de features
 * - A/B testing
 * - Controle de acesso por ambiente
 * - Campanhas de lancamento
 */

// Tipos de modulos disponiveis
export type FeatureModule =
  // DeFi e Blockchain
  | 'nft_loans'           // Emprestimos com garantia NFT
  | 'vbrz_tokens'         // Token VBRZ
  | 'yield_stacking'      // Staking de tokens
  | 'rent_anticipation'   // Antecipacao de alugueis
  | 'blockchain_contracts' // Contratos em blockchain
  | 'crypto_wallets'      // Carteiras crypto
  // Comunicacao
  | 'omnichannel'         // Sistema omnichannel
  | 'whatsapp_channels'   // Canais WhatsApp
  | 'ai_agents'           // Agentes de IA
  // Monetizacao
  | 'ad_engine'           // Engine de anuncios
  | 'cashback'            // Sistema de cashback
  // Marketplace
  | 'marketplace'         // Marketplace de servicos
  | 'partners'            // Parceiros comerciais
  // Relatorios
  | 'dimob_report'        // Relatorio DIMOB
  | 'dre_report'          // Relatorio DRE
  | 'blockchain_report'   // Relatorio blockchain
  // Seguranca
  | 'kyc_verification'    // Verificacao KYC
  | 'multi_sig'           // Multi-assinatura
  // CRM
  | 'crm_kanban'          // Kanban CRM
  | 'lead_automation'     // Automacao de leads
  // Seguros
  | 'insurance_integration' // Integracao seguradoras
  // Novo
  | 'inspection_ai'       // Vistorias com IA
  | 'engage_marketing';   // Marketing automatizado

// Status da feature
export type FeatureStatus = 'enabled' | 'disabled' | 'beta' | 'coming_soon' | 'maintenance';

// Ambiente de execucao
export type Environment = 'development' | 'staging' | 'production';

// Configuracao de uma feature
export interface FeatureConfig {
  id: FeatureModule;
  name: string;
  description: string;
  status: FeatureStatus;
  category: 'defi' | 'communication' | 'monetization' | 'marketplace' | 'reports' | 'security' | 'crm' | 'insurance' | 'inspection' | 'marketing';
  icon?: string;
  // Controle de visibilidade
  visible: boolean; // Se aparece no menu/UI
  // Controle por ambiente
  environments: Environment[];
  // Data de lancamento (opcional)
  launchDate?: Date;
  // Usuarios com acesso beta (emails)
  betaUsers?: string[];
  // Roles com acesso
  allowedRoles?: ('admin' | 'tenant' | 'landlord' | 'guarantor' | 'insurer' | 'realestate')[];
  // Dependencias de outras features
  dependencies?: FeatureModule[];
  // Configuracoes adicionais
  config?: Record<string, unknown>;
}

// Configuracao padrao das features
const defaultFeatureFlags: Record<FeatureModule, FeatureConfig> = {
  // DeFi e Blockchain
  nft_loans: {
    id: 'nft_loans',
    name: 'Emprestimos NFT',
    description: 'Sistema de emprestimos com garantia de NFTs de contratos',
    status: 'coming_soon',
    category: 'defi',
    visible: false,
    environments: ['development', 'staging'],
    launchDate: new Date('2025-03-01'),
    allowedRoles: ['admin', 'landlord', 'guarantor'],
    dependencies: ['blockchain_contracts', 'crypto_wallets'],
  },
  vbrz_tokens: {
    id: 'vbrz_tokens',
    name: 'Token VBRZ',
    description: 'Token nativo da plataforma para transacoes e rewards',
    status: 'beta',
    category: 'defi',
    visible: true,
    environments: ['development', 'staging', 'production'],
    betaUsers: ['admin@vinculobrasil.com.br', 'renato@vinculobrasil.com.br'],
    allowedRoles: ['admin', 'landlord', 'guarantor'],
  },
  yield_stacking: {
    id: 'yield_stacking',
    name: 'Yield Stacking',
    description: 'Staking de tokens VBRZ com rendimentos',
    status: 'coming_soon',
    category: 'defi',
    visible: false,
    environments: ['development'],
    dependencies: ['vbrz_tokens'],
  },
  rent_anticipation: {
    id: 'rent_anticipation',
    name: 'Antecipacao de Alugueis',
    description: 'Antecipacao de recebiveis de aluguel via DeFi',
    status: 'enabled',
    category: 'defi',
    visible: true,
    environments: ['development', 'staging', 'production'],
    allowedRoles: ['admin', 'landlord', 'realestate'],
  },
  blockchain_contracts: {
    id: 'blockchain_contracts',
    name: 'Contratos Blockchain',
    description: 'Contratos de locacao registrados em blockchain',
    status: 'enabled',
    category: 'defi',
    visible: true,
    environments: ['development', 'staging', 'production'],
  },
  crypto_wallets: {
    id: 'crypto_wallets',
    name: 'Carteiras Crypto',
    description: 'Configuracao de carteiras e redes blockchain',
    status: 'enabled',
    category: 'defi',
    visible: true,
    environments: ['development', 'staging', 'production'],
    allowedRoles: ['admin'],
  },

  // Comunicacao
  omnichannel: {
    id: 'omnichannel',
    name: 'Omnichannel',
    description: 'Central de atendimento multicanal',
    status: 'enabled',
    category: 'communication',
    visible: true,
    environments: ['development', 'staging', 'production'],
  },
  whatsapp_channels: {
    id: 'whatsapp_channels',
    name: 'Canais WhatsApp',
    description: 'Integracao com WhatsApp Business',
    status: 'enabled',
    category: 'communication',
    visible: true,
    environments: ['development', 'staging', 'production'],
    dependencies: ['omnichannel'],
  },
  ai_agents: {
    id: 'ai_agents',
    name: 'Agentes de IA',
    description: 'Agentes inteligentes para atendimento automatizado',
    status: 'enabled',
    category: 'communication',
    visible: true,
    environments: ['development', 'staging', 'production'],
    dependencies: ['omnichannel'],
  },

  // Monetizacao
  ad_engine: {
    id: 'ad_engine',
    name: 'Engine de Anuncios',
    description: 'Sistema de campanhas publicitarias',
    status: 'enabled',
    category: 'monetization',
    visible: true,
    environments: ['development', 'staging', 'production'],
    allowedRoles: ['admin'],
  },
  cashback: {
    id: 'cashback',
    name: 'Cashback',
    description: 'Sistema de cashback para clientes',
    status: 'enabled',
    category: 'monetization',
    visible: true,
    environments: ['development', 'staging', 'production'],
  },

  // Marketplace
  marketplace: {
    id: 'marketplace',
    name: 'Marketplace',
    description: 'Marketplace de servicos imobiliarios',
    status: 'enabled',
    category: 'marketplace',
    visible: true,
    environments: ['development', 'staging', 'production'],
  },
  partners: {
    id: 'partners',
    name: 'Parceiros',
    description: 'Gestao de parceiros comerciais',
    status: 'enabled',
    category: 'marketplace',
    visible: true,
    environments: ['development', 'staging', 'production'],
    allowedRoles: ['admin'],
  },

  // Relatorios
  dimob_report: {
    id: 'dimob_report',
    name: 'Relatorio DIMOB',
    description: 'Geracao de relatorio DIMOB para Receita Federal',
    status: 'enabled',
    category: 'reports',
    visible: true,
    environments: ['development', 'staging', 'production'],
    allowedRoles: ['admin', 'realestate'],
  },
  dre_report: {
    id: 'dre_report',
    name: 'Relatorio DRE',
    description: 'Demonstrativo de Resultado do Exercicio',
    status: 'enabled',
    category: 'reports',
    visible: true,
    environments: ['development', 'staging', 'production'],
    allowedRoles: ['admin'],
  },
  blockchain_report: {
    id: 'blockchain_report',
    name: 'Relatorio Blockchain',
    description: 'Relatorio de transacoes em blockchain',
    status: 'enabled',
    category: 'reports',
    visible: true,
    environments: ['development', 'staging', 'production'],
    dependencies: ['blockchain_contracts'],
  },

  // Seguranca
  kyc_verification: {
    id: 'kyc_verification',
    name: 'Verificacao KYC',
    description: 'Verificacao de identidade Know Your Customer',
    status: 'enabled',
    category: 'security',
    visible: true,
    environments: ['development', 'staging', 'production'],
  },
  multi_sig: {
    id: 'multi_sig',
    name: 'Multi-Assinatura',
    description: 'Assinaturas multiplas para transacoes criticas',
    status: 'enabled',
    category: 'security',
    visible: true,
    environments: ['development', 'staging', 'production'],
    dependencies: ['blockchain_contracts'],
  },

  // CRM
  crm_kanban: {
    id: 'crm_kanban',
    name: 'CRM Kanban',
    description: 'Gestao de leads e negocios em kanban',
    status: 'enabled',
    category: 'crm',
    visible: true,
    environments: ['development', 'staging', 'production'],
  },
  lead_automation: {
    id: 'lead_automation',
    name: 'Automacao de Leads',
    description: 'Automacao de qualificacao e nurturing de leads',
    status: 'enabled',
    category: 'crm',
    visible: true,
    environments: ['development', 'staging', 'production'],
    dependencies: ['crm_kanban'],
  },

  // Seguros
  insurance_integration: {
    id: 'insurance_integration',
    name: 'Integracao Seguradoras',
    description: 'Integracao com seguradoras parceiras',
    status: 'enabled',
    category: 'insurance',
    visible: true,
    environments: ['development', 'staging', 'production'],
  },

  // Inspecao
  inspection_ai: {
    id: 'inspection_ai',
    name: 'Vistorias com IA',
    description: 'Vistorias automatizadas com inteligencia artificial',
    status: 'enabled',
    category: 'inspection',
    visible: true,
    environments: ['development', 'staging', 'production'],
  },

  // Marketing
  engage_marketing: {
    id: 'engage_marketing',
    name: 'Marketing Automatizado',
    description: 'Campanhas de email e automacao de marketing',
    status: 'enabled',
    category: 'marketing',
    visible: true,
    environments: ['development', 'staging', 'production'],
  },
};

// Estado global das feature flags
let featureFlags: Record<FeatureModule, FeatureConfig> = { ...defaultFeatureFlags };

// Ambiente atual
const currentEnvironment: Environment = (import.meta.env.MODE as Environment) || 'development';

// Usuario atual (para verificacao de beta)
let currentUserEmail: string | null = null;
let currentUserRole: string | null = null;

/**
 * Inicializa o sistema de feature flags
 */
export function initFeatureFlags(userEmail?: string, userRole?: string) {
  currentUserEmail = userEmail || null;
  currentUserRole = userRole || null;

  // Aqui poderia carregar configuracoes remotas
  // Por enquanto usa as configuracoes padrao
}

/**
 * Verifica se uma feature esta habilitada
 */
export function isFeatureEnabled(featureId: FeatureModule): boolean {
  const feature = featureFlags[featureId];
  if (!feature) return false;

  // Verifica status
  if (feature.status === 'disabled' || feature.status === 'maintenance') {
    return false;
  }

  // Verifica ambiente
  if (!feature.environments.includes(currentEnvironment)) {
    return false;
  }

  // Verifica se e beta e usuario tem acesso
  if (feature.status === 'beta') {
    if (!currentUserEmail) return false;
    if (!feature.betaUsers?.includes(currentUserEmail)) {
      // Admins sempre tem acesso a beta
      if (currentUserRole !== 'admin') return false;
    }
  }

  // Verifica roles
  if (feature.allowedRoles && currentUserRole) {
    if (!feature.allowedRoles.includes(currentUserRole as never)) {
      return false;
    }
  }

  // Verifica dependencias
  if (feature.dependencies) {
    for (const dep of feature.dependencies) {
      if (!isFeatureEnabled(dep)) {
        return false;
      }
    }
  }

  // Verifica data de lancamento
  if (feature.launchDate && feature.status === 'coming_soon') {
    if (new Date() < feature.launchDate) {
      return false;
    }
  }

  return feature.status === 'enabled' || feature.status === 'beta';
}

/**
 * Verifica se uma feature esta visivel no menu/UI
 */
export function isFeatureVisible(featureId: FeatureModule): boolean {
  const feature = featureFlags[featureId];
  if (!feature) return false;

  // Se nao esta habilitada, nao mostra
  if (!isFeatureEnabled(featureId)) {
    // Exceto coming_soon que pode ser mostrado com badge
    if (feature.status !== 'coming_soon') {
      return false;
    }
  }

  return feature.visible;
}

/**
 * Retorna o status de uma feature
 */
export function getFeatureStatus(featureId: FeatureModule): FeatureStatus {
  return featureFlags[featureId]?.status || 'disabled';
}

/**
 * Retorna a configuracao completa de uma feature
 */
export function getFeatureConfig(featureId: FeatureModule): FeatureConfig | null {
  return featureFlags[featureId] || null;
}

/**
 * Retorna todas as features de uma categoria
 */
export function getFeaturesByCategory(category: FeatureConfig['category']): FeatureConfig[] {
  return Object.values(featureFlags).filter(f => f.category === category);
}

/**
 * Retorna todas as features visiveis
 */
export function getVisibleFeatures(): FeatureConfig[] {
  return Object.values(featureFlags).filter(f => isFeatureVisible(f.id));
}

/**
 * Atualiza a configuracao de uma feature (admin only)
 */
export function updateFeatureConfig(featureId: FeatureModule, config: Partial<FeatureConfig>): boolean {
  if (!featureFlags[featureId]) return false;

  featureFlags[featureId] = {
    ...featureFlags[featureId],
    ...config,
  };

  return true;
}

/**
 * Atualiza multiplas features de uma vez
 */
export function updateMultipleFeatures(updates: Partial<Record<FeatureModule, Partial<FeatureConfig>>>): void {
  for (const [featureId, config] of Object.entries(updates)) {
    if (config) {
      updateFeatureConfig(featureId as FeatureModule, config);
    }
  }
}

/**
 * Reseta para configuracoes padrao
 */
export function resetFeatureFlags(): void {
  featureFlags = { ...defaultFeatureFlags };
}

/**
 * Retorna todas as features
 */
export function getAllFeatures(): FeatureConfig[] {
  return Object.values(featureFlags);
}

/**
 * Hook helper para usar em componentes React
 */
export function useFeatureFlag(featureId: FeatureModule) {
  return {
    isEnabled: isFeatureEnabled(featureId),
    isVisible: isFeatureVisible(featureId),
    status: getFeatureStatus(featureId),
    config: getFeatureConfig(featureId),
  };
}

export default {
  initFeatureFlags,
  isFeatureEnabled,
  isFeatureVisible,
  getFeatureStatus,
  getFeatureConfig,
  getFeaturesByCategory,
  getVisibleFeatures,
  updateFeatureConfig,
  updateMultipleFeatures,
  resetFeatureFlags,
  getAllFeatures,
  useFeatureFlag,
};
