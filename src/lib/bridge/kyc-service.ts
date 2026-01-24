/**
 * Vinculo.io - KYC Service
 *
 * Integração com APIs de verificação de identidade e crédito:
 * - Unico ID (Unico Check): Biometria facial e validação de documentos
 * - Serasa Experian: Score de crédito, negativações e protestos
 * - Transfeera/Quanto: Open Finance para comprovação de renda
 *
 * LGPD Compliance: Todos os dados são tratados conforme a Lei Geral de Proteção de Dados
 */

// ============================================================================
// TIPOS
// ============================================================================

export type KYCStatus = 'pending' | 'in_progress' | 'approved' | 'rejected' | 'manual_review';

export type DocumentType = 'RG' | 'CNH' | 'PASSPORT' | 'RNE';

export type BiometryStatus = 'pending' | 'captured' | 'validated' | 'failed' | 'liveness_failed';

export interface UnicoCheckResult {
  transactionId: string;
  status: 'APPROVED' | 'REJECTED' | 'PENDING_REVIEW';
  score: number; // 0-100
  documentValid: boolean;
  biometryValid: boolean;
  livenessScore: number;
  faceMatchScore: number;
  documentData: {
    name: string;
    cpf: string;
    birthDate: string;
    documentNumber: string;
    documentType: DocumentType;
    issueDate?: string;
    expiryDate?: string;
  };
  fraudIndicators: string[];
  timestamp: string;
}

export interface SerasaScoreResult {
  consultId: string;
  cpf: string;
  score: number; // 0-1000
  scoreRange: 'very_low' | 'low' | 'medium' | 'good' | 'excellent';
  probability: number; // Probabilidade de inadimplência
  hasNegatives: boolean;
  negativesCount: number;
  totalDebt: number;
  hasProtests: boolean;
  protestsCount: number;
  hasLawsuits: boolean;
  lawsuitsCount: number;
  lastNegativeDate?: string;
  consultDate: string;
}

export interface OpenFinanceIncomeResult {
  consentId: string;
  customerId: string;
  averageMonthlyIncome: number;
  lastThreeMonthsIncome: number[];
  incomeStability: 'stable' | 'variable' | 'irregular';
  mainIncomeSource: string;
  hasMultipleIncomeSources: boolean;
  employmentType: 'CLT' | 'PJ' | 'Autonomo' | 'Aposentado' | 'Outros';
  accountAge: number; // meses
  averageBalance: number;
  consentDate: string;
  dataRetrievalDate: string;
}

export interface KYCAnalysisResult {
  userId: string;
  status: KYCStatus;
  overallScore: number; // 0-100
  riskLevel: 'low' | 'medium' | 'high' | 'very_high';
  requiresGuarantor: boolean;
  maxApprovedRent: number;
  incomeToRentRatio: number;
  identityVerification: UnicoCheckResult | null;
  creditAnalysis: SerasaScoreResult | null;
  incomeVerification: OpenFinanceIncomeResult | null;
  recommendations: string[];
  restrictions: string[];
  analysisDate: string;
  validUntil: string;
}

export interface KYCRequest {
  userId: string;
  fullName: string;
  cpf: string;
  email: string;
  phone: string;
  birthDate: string;
  requestedRentAmount: number;
  documentPhotos?: {
    front: string; // Base64 ou URL
    back?: string;
  };
  selfiePhoto?: string;
  consentTermsAccepted: boolean;
  lgpdConsentAccepted: boolean;
}

// ============================================================================
// CONFIGURAÇÃO
// ============================================================================

export interface KYCServiceConfig {
  unicoApiKey?: string;
  unicoEnvironment?: 'sandbox' | 'production';
  serasaApiKey?: string;
  serasaEnvironment?: 'sandbox' | 'production';
  openFinanceClientId?: string;
  openFinanceClientSecret?: string;
}

// ============================================================================
// REGRAS DE NEGÓCIO VINCULO.IO
// ============================================================================

/**
 * Regras de aprovação automática baseadas na Lei do Inquilinato
 */
export const VINCULO_KYC_RULES = {
  // Renda mínima: 3x o valor do aluguel
  minIncomeToRentRatio: 3,

  // Score mínimo Serasa para aprovação automática
  minSerasaScoreAutoApproval: 600,

  // Score mínimo para aprovação com garantidor
  minSerasaScoreWithGuarantor: 400,

  // Score mínimo de biometria facial
  minFaceMatchScore: 85,

  // Score mínimo de liveness
  minLivenessScore: 90,

  // Máximo de negativações permitidas para aprovação
  maxNegativesAutoApproval: 0,
  maxNegativesWithGuarantor: 3,

  // Tempo de validade da análise (dias)
  analysisValidityDays: 30,
} as const;

// ============================================================================
// SERVIÇO DE KYC
// ============================================================================

export class KYCService {
  private config: KYCServiceConfig;

  constructor(config: KYCServiceConfig) {
    this.config = config;
  }

  /**
   * Realiza análise KYC completa
   */
  async performFullAnalysis(request: KYCRequest): Promise<KYCAnalysisResult> {
    // Verificações em paralelo
    const [identityResult, creditResult, incomeResult] = await Promise.all([
      this.verifyIdentity(request),
      this.checkCredit(request.cpf),
      request.consentTermsAccepted ? this.verifyIncome(request.userId) : Promise.resolve(null),
    ]);

    // Calcula score geral
    const overallScore = this.calculateOverallScore(identityResult, creditResult, incomeResult);

    // Determina nível de risco
    const riskLevel = this.determineRiskLevel(overallScore, creditResult);

    // Calcula ratio renda/aluguel
    const incomeToRentRatio = incomeResult
      ? incomeResult.averageMonthlyIncome / request.requestedRentAmount
      : 0;

    // Determina se precisa de garantidor
    const requiresGuarantor = this.needsGuarantor(overallScore, creditResult, incomeToRentRatio);

    // Calcula aluguel máximo aprovado
    const maxApprovedRent = incomeResult
      ? incomeResult.averageMonthlyIncome / VINCULO_KYC_RULES.minIncomeToRentRatio
      : 0;

    // Gera recomendações
    const { recommendations, restrictions } = this.generateRecommendations(
      identityResult,
      creditResult,
      incomeResult,
      incomeToRentRatio
    );

    // Determina status final
    const status = this.determineStatus(
      identityResult,
      creditResult,
      incomeToRentRatio,
      requiresGuarantor
    );

    const now = new Date();
    const validUntil = new Date(now);
    validUntil.setDate(validUntil.getDate() + VINCULO_KYC_RULES.analysisValidityDays);

    return {
      userId: request.userId,
      status,
      overallScore,
      riskLevel,
      requiresGuarantor,
      maxApprovedRent: Math.round(maxApprovedRent * 100) / 100,
      incomeToRentRatio: Math.round(incomeToRentRatio * 100) / 100,
      identityVerification: identityResult,
      creditAnalysis: creditResult,
      incomeVerification: incomeResult,
      recommendations,
      restrictions,
      analysisDate: now.toISOString(),
      validUntil: validUntil.toISOString(),
    };
  }

  /**
   * Verifica identidade via Unico Check
   */
  async verifyIdentity(request: KYCRequest): Promise<UnicoCheckResult> {
    // Em produção, chamaria API do Unico Check
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Simulação de resultado
    const score = Math.floor(Math.random() * 30) + 70; // 70-100
    const livenessScore = Math.floor(Math.random() * 15) + 85; // 85-100
    const faceMatchScore = Math.floor(Math.random() * 20) + 80; // 80-100

    return {
      transactionId: `unico_${Math.random().toString(36).substr(2, 12)}`,
      status: score >= 80 ? 'APPROVED' : score >= 60 ? 'PENDING_REVIEW' : 'REJECTED',
      score,
      documentValid: score >= 70,
      biometryValid: faceMatchScore >= VINCULO_KYC_RULES.minFaceMatchScore,
      livenessScore,
      faceMatchScore,
      documentData: {
        name: request.fullName,
        cpf: request.cpf,
        birthDate: request.birthDate,
        documentNumber: `${Math.floor(Math.random() * 900000000) + 100000000}`,
        documentType: 'CNH',
      },
      fraudIndicators: [],
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Consulta score de crédito via Serasa
   */
  async checkCredit(cpf: string): Promise<SerasaScoreResult> {
    // Em produção, chamaria API do Serasa
    await new Promise(resolve => setTimeout(resolve, 1200));

    // Simulação de resultado
    const score = Math.floor(Math.random() * 400) + 400; // 400-800
    const hasNegatives = Math.random() < 0.2;
    const negativesCount = hasNegatives ? Math.floor(Math.random() * 3) + 1 : 0;

    const scoreRange: SerasaScoreResult['scoreRange'] =
      score < 300
        ? 'very_low'
        : score < 500
          ? 'low'
          : score < 700
            ? 'medium'
            : score < 900
              ? 'good'
              : 'excellent';

    return {
      consultId: `serasa_${Math.random().toString(36).substr(2, 12)}`,
      cpf,
      score,
      scoreRange,
      probability: Math.round((1 - score / 1000) * 100) / 100,
      hasNegatives,
      negativesCount,
      totalDebt: hasNegatives ? Math.floor(Math.random() * 5000) + 500 : 0,
      hasProtests: Math.random() < 0.1,
      protestsCount: Math.random() < 0.1 ? 1 : 0,
      hasLawsuits: false,
      lawsuitsCount: 0,
      lastNegativeDate: hasNegatives
        ? new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString()
        : undefined,
      consultDate: new Date().toISOString(),
    };
  }

  /**
   * Verifica renda via Open Finance
   */
  async verifyIncome(userId: string): Promise<OpenFinanceIncomeResult> {
    // Em produção, usaria APIs de Open Finance (Transfeera, Quanto, etc.)
    await new Promise(resolve => setTimeout(resolve, 2000));

    const averageMonthlyIncome = Math.floor(Math.random() * 8000) + 3000; // 3000-11000

    return {
      consentId: `consent_${Math.random().toString(36).substr(2, 12)}`,
      customerId: userId,
      averageMonthlyIncome,
      lastThreeMonthsIncome: [
        averageMonthlyIncome * (0.9 + Math.random() * 0.2),
        averageMonthlyIncome * (0.9 + Math.random() * 0.2),
        averageMonthlyIncome * (0.9 + Math.random() * 0.2),
      ].map(v => Math.round(v * 100) / 100),
      incomeStability: 'stable',
      mainIncomeSource: 'Salário',
      hasMultipleIncomeSources: Math.random() < 0.3,
      employmentType: 'CLT',
      accountAge: Math.floor(Math.random() * 60) + 12,
      averageBalance: Math.floor(Math.random() * 5000) + 1000,
      consentDate: new Date().toISOString(),
      dataRetrievalDate: new Date().toISOString(),
    };
  }

  // --------------------------------------------------------------------------
  // MÉTODOS AUXILIARES
  // --------------------------------------------------------------------------

  private calculateOverallScore(
    identity: UnicoCheckResult | null,
    credit: SerasaScoreResult | null,
    income: OpenFinanceIncomeResult | null
  ): number {
    let score = 50; // Base

    if (identity) {
      score += (identity.score / 100) * 20; // Até 20 pontos
      if (identity.biometryValid) score += 10;
    }

    if (credit) {
      score += (credit.score / 1000) * 30; // Até 30 pontos
      if (credit.hasNegatives) score -= 15;
      if (credit.hasProtests) score -= 10;
    }

    if (income) {
      if (income.incomeStability === 'stable') score += 10;
      if (income.employmentType === 'CLT') score += 5;
      if (income.accountAge > 24) score += 5;
    }

    return Math.min(100, Math.max(0, Math.round(score)));
  }

  private determineRiskLevel(
    score: number,
    credit: SerasaScoreResult | null
  ): KYCAnalysisResult['riskLevel'] {
    if (score >= 80 && (!credit || !credit.hasNegatives)) return 'low';
    if (score >= 60) return 'medium';
    if (score >= 40) return 'high';
    return 'very_high';
  }

  private needsGuarantor(
    score: number,
    credit: SerasaScoreResult | null,
    incomeRatio: number
  ): boolean {
    if (score < 60) return true;
    if (credit && credit.score < VINCULO_KYC_RULES.minSerasaScoreAutoApproval) return true;
    if (incomeRatio < VINCULO_KYC_RULES.minIncomeToRentRatio) return true;
    if (credit && credit.hasNegatives) return true;
    return false;
  }

  private determineStatus(
    identity: UnicoCheckResult | null,
    credit: SerasaScoreResult | null,
    incomeRatio: number,
    requiresGuarantor: boolean
  ): KYCStatus {
    // Rejeição automática
    if (identity && identity.status === 'REJECTED') return 'rejected';
    if (credit && credit.score < VINCULO_KYC_RULES.minSerasaScoreWithGuarantor) return 'rejected';

    // Revisão manual
    if (identity && identity.status === 'PENDING_REVIEW') return 'manual_review';
    if (credit && credit.hasLawsuits) return 'manual_review';

    // Aprovação
    if (!requiresGuarantor && incomeRatio >= VINCULO_KYC_RULES.minIncomeToRentRatio) {
      return 'approved';
    }

    // Aprovação condicional (com garantidor)
    if (requiresGuarantor) {
      return 'approved'; // Com flag requiresGuarantor = true
    }

    return 'pending';
  }

  private generateRecommendations(
    identity: UnicoCheckResult | null,
    credit: SerasaScoreResult | null,
    income: OpenFinanceIncomeResult | null,
    incomeRatio: number
  ): { recommendations: string[]; restrictions: string[] } {
    const recommendations: string[] = [];
    const restrictions: string[] = [];

    // Análise de identidade
    if (identity) {
      if (identity.biometryValid) {
        recommendations.push('Identidade verificada com biometria facial');
      }
      if (!identity.documentValid) {
        restrictions.push('Documento apresenta inconsistências - verificar manualmente');
      }
    }

    // Análise de crédito
    if (credit) {
      if (credit.score >= 700) {
        recommendations.push('Excelente histórico de crédito');
      }
      if (credit.hasNegatives) {
        restrictions.push(`${credit.negativesCount} registro(s) de negativação ativo(s)`);
      }
      if (credit.hasProtests) {
        restrictions.push('Possui protestos em cartório');
      }
    }

    // Análise de renda
    if (income) {
      if (incomeRatio >= 4) {
        recommendations.push('Renda confortável para o valor solicitado');
      } else if (incomeRatio < 3) {
        restrictions.push('Renda abaixo de 3x o valor do aluguel - garantidor recomendado');
      }
      if (income.incomeStability === 'stable') {
        recommendations.push('Renda estável nos últimos 3 meses');
      }
    }

    return { recommendations, restrictions };
  }
}

// ============================================================================
// MOCK SERVICE (Para desenvolvimento)
// ============================================================================

export class MockKYCService extends KYCService {
  constructor() {
    super({});
  }

  // Herda todos os métodos que já são simulados
}

// ============================================================================
// FUNÇÕES UTILITÁRIAS
// ============================================================================

/**
 * Valida CPF
 */
export function validateCPF(cpf: string): boolean {
  const cleaned = cpf.replace(/\D/g, '');

  if (cleaned.length !== 11) return false;
  if (/^(\d)\1+$/.test(cleaned)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleaned.charAt(i)) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleaned.charAt(9))) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleaned.charAt(i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cleaned.charAt(10))) return false;

  return true;
}

/**
 * Formata CPF para exibição
 */
export function formatCPF(cpf: string): string {
  const cleaned = cpf.replace(/\D/g, '');
  return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

/**
 * Mascara CPF para exibição segura
 */
export function maskCPF(cpf: string): string {
  const cleaned = cpf.replace(/\D/g, '');
  return `${cleaned.substring(0, 3)}.***.***-${cleaned.substring(9)}`;
}
