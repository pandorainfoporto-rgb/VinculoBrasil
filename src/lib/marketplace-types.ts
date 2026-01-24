// =============================================================================
// Vinculo Marketplace - Tipos para Super App Imobiliario
// =============================================================================
// Este modulo define todos os tipos TypeScript para:
// - Vinculo Insure (Cross-Sell de Seguros)
// - Service Hub (Uber da Manutencao)
// - Vinculo DeFi (Antecipacao de Aluguel)
// - Smart Access (IoT - Fechaduras Inteligentes)
// - AI Inspection (Vistoria com IA)
// =============================================================================

// -----------------------------------------------------------------------------
// MODULO 1: VINCULO INSURE (Cross-Sell de Seguros)
// -----------------------------------------------------------------------------

/** Tipo de produto de seguro */
export type InsuranceProductType =
  | 'seguro_fianca' // Seguro Fianca (principal)
  | 'seguro_incendio' // Obrigatorio por lei
  | 'seguro_conteudo' // Para inquilino proteger bens
  | 'seguro_auto' // Cross-sell automovel
  | 'seguro_vida' // Cross-sell vida
  | 'seguro_residencial'; // Pacote completo casa

/** Status da cotacao de seguro */
export type InsuranceQuoteStatus =
  | 'pendente'
  | 'aprovada'
  | 'recusada'
  | 'expirada'
  | 'contratada';

/** Produto de Seguro disponivel no marketplace */
export interface InsuranceProduct {
  id: string;
  insurerId: string; // Seguradora que oferta
  insurerName: string;
  type: InsuranceProductType;
  name: string;
  description: string;

  // Cobertura
  coverageDetails: InsuranceCoverage[];
  minCoverage: number; // Valor minimo de cobertura
  maxCoverage: number; // Valor maximo de cobertura

  // Precificacao
  basePremiumRate: number; // Taxa base (% sobre cobertura)
  minPremium: number; // Premio minimo
  maxPremium: number;

  // Condicoes especiais
  specialConditions?: SpecialCondition[];
  eligibilityCriteria: EligibilityCriteria;

  // Comissionamento
  platformCommissionRate: number; // % para plataforma
  brokerCommissionRate: number; // % para corretor

  // Status
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/** Detalhes de cobertura */
export interface InsuranceCoverage {
  id: string;
  name: string;
  description: string;
  coverageAmount: number;
  isIncluded: boolean; // Se esta incluido no pacote base
  additionalPremium?: number; // Custo extra se opcional
}

/** Condicao especial de desconto */
export interface SpecialCondition {
  id: string;
  name: string;
  description: string;
  discountPercent: number;
  validFrom?: Date;
  validUntil?: Date;
  criteria: {
    userType?: 'tenant' | 'landlord' | 'guarantor';
    hasGarage?: boolean;
    hasActiveContract?: boolean;
    contractMonths?: number; // Tempo minimo de contrato
    bundleWith?: InsuranceProductType[]; // Combo com outros produtos
  };
}

/** Criterios de elegibilidade */
export interface EligibilityCriteria {
  minAge?: number;
  maxAge?: number;
  minIncome?: number;
  requiresProperty?: boolean;
  propertyTypes?: ('apartment' | 'house' | 'commercial')[];
  requiresVehicle?: boolean;
  vehicleMaxAge?: number;
}

/** Cotacao de seguro gerada para usuario */
export interface InsuranceQuote {
  id: string;
  userId: string;
  productId: string;
  propertyId?: string;
  contractId?: string;

  // Valores calculados
  coverageAmount: number;
  basePremium: number;
  discounts: AppliedDiscount[];
  finalPremium: number;
  monthlyPayment: number;

  // Status
  status: InsuranceQuoteStatus;
  validUntil: Date;

  // Dados adicionais
  vehiclePlate?: string; // Para seguro auto
  vehicleModel?: string;
  vehicleYear?: number;

  // Timestamps
  createdAt: Date;
  contractedAt?: Date;
}

/** Desconto aplicado */
export interface AppliedDiscount {
  conditionId: string;
  name: string;
  discountPercent: number;
  discountAmount: number;
}

/** Apolice de seguro contratada (estende tipos existentes) */
export interface ExtendedInsurancePolicy {
  id: string;
  quoteId: string;
  userId: string;
  productId: string;
  contractId?: string;
  propertyId?: string;

  // Dados da apolice
  policyNumber: string;
  coverageAmount: number;
  premiumAmount: number;
  monthlyPayment: number;

  // Vigencia
  startDate: Date;
  endDate: Date;
  status: 'ativa' | 'suspensa' | 'cancelada' | 'expirada' | 'sinistro';

  // Pagamento acoplado ao boleto do aluguel
  attachedToRent: boolean;
  invoiceIntegration: boolean;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

// -----------------------------------------------------------------------------
// MODULO 2: SERVICE HUB (Uber da Manutencao)
// -----------------------------------------------------------------------------

/** Especialidade do prestador */
export type ServiceSpecialty =
  | 'eletricista'
  | 'encanador'
  | 'pintor'
  | 'marceneiro'
  | 'pedreiro'
  | 'ar_condicionado'
  | 'limpeza'
  | 'jardinagem'
  | 'chaveiro'
  | 'dedetizacao'
  | 'vidraceiro'
  | 'geral';

/** Status da ordem de servico */
export type ServiceOrderStatus =
  | 'aberta' // Aguardando prestadores
  | 'aceita' // Prestador aceitou
  | 'em_deslocamento' // Prestador a caminho
  | 'em_execucao' // Servico sendo realizado
  | 'aguardando_aprovacao' // Precisa aprovacao do valor
  | 'concluida' // Servico finalizado
  | 'cancelada'
  | 'disputada'; // Em disputa

/** Urgencia do servico */
export type ServiceUrgency = 'baixa' | 'normal' | 'alta' | 'emergencia';

/** Prestador de servico */
export interface ServiceProvider {
  id: string;
  userId: string;
  name: string;
  cpf: string;
  phone: string;
  email: string;

  // Especializacao
  specialties: ServiceSpecialty[];
  primarySpecialty: ServiceSpecialty;

  // Localizacao
  currentLocation?: GeoLocation;
  serviceRadius: number; // Raio de atuacao em km
  baseAddress: string;
  city: string;
  state: string;

  // Avaliacao
  rating: number; // 0-5
  totalRatings: number;
  completedJobs: number;
  cancelledJobs: number;

  // Documentacao
  documentsVerified: boolean;
  insuranceVerified: boolean;
  backgroundCheckPassed: boolean;

  // Disponibilidade
  isAvailable: boolean;
  availableFrom?: Date;
  availableUntil?: Date;
  workingDays: number[]; // 0-6 (Domingo-Sabado)

  // Financeiro
  hourlyRate: number;
  minimumCharge: number;
  bankAccount?: BankAccountInfo;

  // Status
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/** Informacoes de conta bancaria */
export interface BankAccountInfo {
  bankCode: string;
  bankName: string;
  agency: string;
  accountNumber: string;
  accountType: 'corrente' | 'poupanca';
  holderName: string;
  holderCpf: string;
  pixKey?: string;
}

/** Geolocalizacao */
export interface GeoLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp?: Date;
}

/** Ordem de servico */
export interface ServiceOrder {
  id: string;
  requesterId: string; // Inquilino ou Locador
  requesterType: 'tenant' | 'landlord';
  propertyId: string;
  contractId?: string;

  // Detalhes do servico
  specialty: ServiceSpecialty;
  title: string;
  description: string;
  urgency: ServiceUrgency;

  // Fotos
  photosBefore: ServicePhoto[];
  photosAfter: ServicePhoto[];

  // Localizacao
  location: GeoLocation;
  address: string;

  // Orcamento
  estimatedValue?: number;
  finalValue?: number;
  approvalThreshold: number; // Valor auto-aprovado (R$ 200 default)
  autoApproved: boolean;

  // Prestador
  providerId?: string;
  providerAcceptedAt?: Date;
  providerArrivedAt?: Date;

  // GPS Tracking
  providerLocation?: GeoLocation;
  trackingEnabled: boolean;

  // Status
  status: ServiceOrderStatus;

  // Avaliacao
  rating?: number;
  ratingComment?: string;

  // Pagamento
  paymentStatus: 'pendente' | 'processando' | 'pago' | 'estornado';
  paymentMethod?: 'pix' | 'credito' | 'boleto' | 'saldo_plataforma';

  // Timestamps
  createdAt: Date;
  scheduledFor?: Date;
  startedAt?: Date;
  completedAt?: Date;
  paidAt?: Date;
}

/** Foto do servico */
export interface ServicePhoto {
  id: string;
  url: string;
  caption?: string;
  takenAt: Date;
  geoLocation?: GeoLocation;
}

/** Notificacao para prestadores */
export interface ServiceNotification {
  id: string;
  orderId: string;
  providerId: string;
  status: 'enviada' | 'visualizada' | 'aceita' | 'recusada' | 'expirada';
  sentAt: Date;
  respondedAt?: Date;
  distanceKm: number;
  estimatedArrival?: number; // minutos
}

// -----------------------------------------------------------------------------
// MODULO 3: VINCULO DEFI (Antecipacao de Aluguel)
// -----------------------------------------------------------------------------

/** Status do emprestimo */
export type LoanStatus =
  | 'simulado'
  | 'solicitado'
  | 'aprovado'
  | 'ativo'
  | 'quitado'
  | 'inadimplente'
  | 'liquidado'; // NFT executado

/** Tipo de investidor */
export type InvestorType = 'individual' | 'institucional' | 'plataforma';

/** Pool de liquidez */
export interface LiquidityPool {
  id: string;
  name: string;
  tokenSymbol: string; // Ex: vBRZ

  // Valores
  totalDeposited: number; // Total depositado
  totalBorrowed: number; // Total emprestado
  availableLiquidity: number; // Disponivel para emprestimo
  utilizationRate: number; // % utilizado

  // Taxas
  depositAPY: number; // Rendimento para investidores
  borrowAPR: number; // Taxa para tomadores
  platformFeeRate: number; // Taxa da plataforma

  // Reservas
  reserveFactor: number; // % mantido como reserva

  // Blockchain
  contractAddress: string;
  chainId: number;
  lastUpdated: Date;
}

/** Deposito no pool de liquidez */
export interface LiquidityDeposit {
  id: string;
  poolId: string;
  investorId: string;
  investorType: InvestorType;

  // Valores
  amountDeposited: number;
  sharesReceived: number; // Tokens vBRZ recebidos
  currentValue: number; // Valor atual com rendimentos

  // Rendimentos
  accruedInterest: number;
  lastHarvestAt?: Date;

  // Blockchain
  txHash: string;
  blockNumber: number;

  // Timestamps
  depositedAt: Date;
  withdrawnAt?: Date;
}

/** Emprestimo de antecipacao de aluguel */
export interface RentAnticipationLoan {
  id: string;
  poolId: string;
  borrowerId: string; // Locador

  // Contrato/NFT
  contractId: string;
  nftTokenId: string;
  nftContractAddress: string;
  nftLocked: boolean;

  // Valores do contrato
  monthlyRent: number;
  monthsAnticipated: number; // 1-12
  totalContractValue: number; // monthlyRent * monthsAnticipated

  // Calculo do emprestimo
  discountRate: number; // Taxa de desconto
  grossLoanAmount: number; // Valor bruto
  fees: LoanFees;
  netLoanAmount: number; // Valor liquido recebido

  // Pagamento
  monthlyRepayment: number; // Parcela mensal (85% do aluguel)
  remainingDebt: number;
  paidInstallments: number;
  totalInstallments: number;

  // Status
  status: LoanStatus;
  nextPaymentDate?: Date;
  daysOverdue: number;

  // Blockchain
  loanTxHash: string;
  repaymentTxHashes: string[];

  // Timestamps
  requestedAt: Date;
  approvedAt?: Date;
  disbursedAt?: Date;
  completedAt?: Date;
}

/** Taxas do emprestimo */
export interface LoanFees {
  originationFee: number; // Taxa de originacao
  platformFee: number; // Taxa da plataforma
  insuranceFee: number; // Seguro do emprestimo
  totalFees: number;
}

/** Pagamento de parcela */
export interface LoanRepayment {
  id: string;
  loanId: string;
  installmentNumber: number;

  // Valores
  principalAmount: number;
  interestAmount: number;
  totalAmount: number;

  // Origem
  fromContractPayment: boolean; // Veio do split do aluguel
  paymentId?: string; // ID do pagamento de aluguel

  // Status
  status: 'pendente' | 'pago' | 'atrasado';
  dueDate: Date;
  paidAt?: Date;

  // Blockchain
  txHash?: string;
}

// -----------------------------------------------------------------------------
// MODULO 4: SMART ACCESS (IoT - Fechaduras Inteligentes)
// -----------------------------------------------------------------------------

/** Tipo de fechadura */
export type SmartLockType = 'tuya' | 'ttlock' | 'yale' | 'august' | 'nuki' | 'generic';

/** Status da fechadura */
export type SmartLockStatus = 'online' | 'offline' | 'low_battery' | 'error';

/** Fechadura inteligente */
export interface SmartLock {
  id: string;
  propertyId: string;
  name: string;
  location: string; // Ex: "Porta Principal", "Portaria"

  // Dispositivo
  deviceId: string;
  deviceType: SmartLockType;
  firmwareVersion?: string;
  batteryLevel?: number;

  // Conectividade
  status: SmartLockStatus;
  lastOnlineAt: Date;
  wifiSsid?: string;

  // Configuracao
  autoLockEnabled: boolean;
  autoLockDelaySeconds: number;

  // Timestamps
  installedAt: Date;
  lastMaintenanceAt?: Date;
}

/** Senha temporaria OTP */
export interface TemporaryAccessCode {
  id: string;
  lockId: string;
  propertyId: string;

  // Codigo
  code: string; // Senha numerica
  codeType: 'otp' | 'recorrente' | 'permanente';

  // Validade
  validFrom: Date;
  validUntil: Date;
  usageLimit?: number; // Numero maximo de usos
  usageCount: number;

  // Contexto
  purpose: 'visita' | 'manutencao' | 'entrega' | 'mudanca' | 'emergencia';
  guestName?: string;
  guestPhone?: string;
  scheduledVisitId?: string;

  // Quem criou
  createdById: string;
  createdByRole: 'tenant' | 'landlord' | 'platform' | 'provider';

  // Status
  isActive: boolean;
  revokedAt?: Date;
  revokedReason?: string;

  // Log de uso
  accessLogs: AccessLog[];

  // Timestamps
  createdAt: Date;
}

/** Log de acesso */
export interface AccessLog {
  id: string;
  lockId: string;
  codeId?: string;

  // Evento
  eventType: 'unlock' | 'lock' | 'failed_attempt' | 'tamper_alert';
  method: 'code' | 'app' | 'fingerprint' | 'key' | 'auto';

  // Detalhes
  success: boolean;
  failureReason?: string;

  // Timestamps
  timestamp: Date;
}

// -----------------------------------------------------------------------------
// MODULO 5: AI INSPECTION (Vistoria com IA)
// -----------------------------------------------------------------------------

/** Tipo de vistoria IA */
export type AIInspectionType = 'entrada' | 'saida' | 'periodica';

/** Status da analise */
export type AIAnalysisStatus = 'pendente' | 'processando' | 'concluida' | 'erro';

/** Tipo de dano detectado */
export type DamageType =
  | 'furo_parede'
  | 'mancha'
  | 'rachadura'
  | 'quebra'
  | 'pintura_descascada'
  | 'mofo_umidade'
  | 'risco_piso'
  | 'vidro_quebrado'
  | 'ferrugem'
  | 'desgaste_natural'
  | 'outro';

/** Vistoria com IA */
export interface AIInspection {
  id: string;
  propertyId: string;
  contractId: string;
  inspectionType: AIInspectionType;

  // Quem realizou
  performedById: string;
  performedByRole: 'tenant' | 'landlord' | 'platform';

  // Fotos
  rooms: AIInspectionRoom[];
  totalPhotos: number;

  // Resultado geral
  overallCondition: 'excelente' | 'bom' | 'regular' | 'ruim';
  totalDamagesFound: number;
  estimatedRepairCost: number;

  // Status
  status: AIAnalysisStatus;
  analysisCompletedAt?: Date;

  // Comparacao (para vistoria de saida)
  comparedWithInspectionId?: string;
  newDamagesFound: number;

  // Timestamps
  createdAt: Date;
  completedAt?: Date;
}

/** Comodo da vistoria */
export interface AIInspectionRoom {
  id: string;
  inspectionId: string;
  roomName: string;
  roomType: string; // Ex: "sala", "quarto", "cozinha"

  // Fotos
  photos: AIInspectionPhoto[];

  // Resultado do comodo
  condition: 'excelente' | 'bom' | 'regular' | 'ruim';
  damagesDetected: DetectedDamage[];
}

/** Foto da vistoria com analise IA */
export interface AIInspectionPhoto {
  id: string;
  roomId: string;
  url: string;

  // Guia de captura
  suggestedAngle: string; // Ex: "parede_norte", "piso", "teto"
  angleCompliance: number; // 0-100 se seguiu o guia

  // Analise IA
  analysisStatus: AIAnalysisStatus;
  analysisResult?: PhotoAnalysisResult;

  // Timestamps
  takenAt: Date;
  analyzedAt?: Date;
}

/** Resultado da analise de foto */
export interface PhotoAnalysisResult {
  hasDamage: boolean;
  damages: DetectedDamage[];
  confidence: number; // 0-100
  rawAIResponse?: string;
}

/** Dano detectado pela IA */
export interface DetectedDamage {
  id: string;
  type: DamageType;
  description: string;
  severity: 'leve' | 'moderado' | 'grave';
  confidence: number; // 0-100

  // Localizacao na imagem
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };

  // Custo estimado
  estimatedRepairCost: number;

  // Comparacao
  existedInPreviousInspection?: boolean;
  previousDamageId?: string;
}

/** Comparacao entre vistorias */
export interface InspectionComparison {
  id: string;
  entryInspectionId: string;
  exitInspectionId: string;
  contractId: string;

  // Resultados
  newDamages: DetectedDamage[];
  repairedDamages: DetectedDamage[];
  unchangedDamages: DetectedDamage[];

  // Custos
  totalNewDamageCost: number;
  deductFromDeposit: boolean;
  depositDeductionAmount: number;

  // Status
  approvedByLandlord: boolean;
  approvedByTenant: boolean;
  disputeStatus?: 'aberta' | 'mediacao' | 'resolvida';

  // Timestamps
  createdAt: Date;
  resolvedAt?: Date;
}

// -----------------------------------------------------------------------------
// TIPOS AUXILIARES E UTILITARIOS
// -----------------------------------------------------------------------------

/** Oferta personalizada para usuario */
export interface PersonalizedOffer {
  id: string;
  userId: string;
  productId: string;
  productType: 'insurance' | 'service';

  // Oferta
  title: string;
  description: string;
  originalPrice: number;
  discountedPrice: number;
  discountPercent: number;

  // Contexto
  reason: string; // Ex: "Voce alugou imovel com garagem"
  relevanceScore: number;

  // Validade
  validUntil: Date;
  isExpired: boolean;

  // Status
  viewed: boolean;
  clicked: boolean;
  converted: boolean;

  // Timestamps
  createdAt: Date;
  viewedAt?: Date;
  convertedAt?: Date;
}

/** Programa de fidelidade */
export interface LoyaltyProgram {
  userId: string;
  tier: 'bronze' | 'prata' | 'ouro' | 'diamante';
  totalPoints: number;
  availablePoints: number;
  lifetimeSpent: number;

  // Beneficios
  rentDiscount: number; // Desconto no aluguel
  insuranceDiscount: number; // Desconto em seguros
  serviceDiscount: number; // Desconto em servicos
  prioritySupport: boolean;

  // Historico
  pointsHistory: PointsTransaction[];
}

/** Transacao de pontos */
export interface PointsTransaction {
  id: string;
  userId: string;
  type: 'ganho' | 'resgate' | 'expiracao' | 'ajuste';
  points: number;
  description: string;
  referenceType?: 'insurance' | 'service' | 'rent' | 'referral';
  referenceId?: string;
  createdAt: Date;
}

// -----------------------------------------------------------------------------
// EXPORTS DE CONSTANTES
// -----------------------------------------------------------------------------

export const INSURANCE_PRODUCT_LABELS: Record<InsuranceProductType, string> = {
  seguro_fianca: 'Seguro Fianca',
  seguro_incendio: 'Seguro Incendio',
  seguro_conteudo: 'Seguro Conteudo',
  seguro_auto: 'Seguro Automovel',
  seguro_vida: 'Seguro de Vida',
  seguro_residencial: 'Seguro Residencial',
};

export const SERVICE_SPECIALTY_LABELS: Record<ServiceSpecialty, string> = {
  eletricista: 'Eletricista',
  encanador: 'Encanador',
  pintor: 'Pintor',
  marceneiro: 'Marceneiro',
  pedreiro: 'Pedreiro',
  ar_condicionado: 'Ar Condicionado',
  limpeza: 'Limpeza',
  jardinagem: 'Jardinagem',
  chaveiro: 'Chaveiro',
  dedetizacao: 'Dedetizacao',
  vidraceiro: 'Vidraceiro',
  geral: 'Servicos Gerais',
};

export const SERVICE_URGENCY_LABELS: Record<ServiceUrgency, string> = {
  baixa: 'Baixa Prioridade',
  normal: 'Normal',
  alta: 'Alta Prioridade',
  emergencia: 'Emergencia 24h',
};

export const DAMAGE_TYPE_LABELS: Record<DamageType, string> = {
  furo_parede: 'Furo na Parede',
  mancha: 'Mancha',
  rachadura: 'Rachadura',
  quebra: 'Quebra',
  pintura_descascada: 'Pintura Descascada',
  mofo_umidade: 'Mofo/Umidade',
  risco_piso: 'Risco no Piso',
  vidro_quebrado: 'Vidro Quebrado',
  ferrugem: 'Ferrugem',
  desgaste_natural: 'Desgaste Natural',
  outro: 'Outro',
};

export const LOAN_STATUS_LABELS: Record<LoanStatus, string> = {
  simulado: 'Simulado',
  solicitado: 'Solicitado',
  aprovado: 'Aprovado',
  ativo: 'Ativo',
  quitado: 'Quitado',
  inadimplente: 'Inadimplente',
  liquidado: 'NFT Liquidado',
};
