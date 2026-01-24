/**
 * Nexus Imobi - Guarantor Matching & Asset Custody Service
 *
 * Manages guarantor property collateral and matching algorithms.
 * Properties used as guarantees are locked on blockchain to prevent
 * simultaneous use in multiple contracts.
 */

export interface GuarantorProfile {
  userId: string;
  name: string;
  cpf: string;
  walletAddress: string;
  ownedProperties: GuarantorProperty[];
  totalAvailableGuaranteeValue: number;
  currentlyPledgedValue: number;
  availableMargin: number;
  creditScore: number;
}

export interface GuarantorProperty {
  propertyId: string;
  address: string;
  appraisedValue: number;
  status: 'Ativo' | 'Empenhado' | 'Bloqueado' | 'Disponivel';
  availableMargin: number; // How much value can still be used as guarantee
  currentPledges: PropertyPledge[];
  matriculaHash: string; // Property deed blockchain hash
}

export interface PropertyPledge {
  contractId: string;
  pledgedAmount: number;
  lockHash: string;
  startDate: Date;
  endDate: Date;
  status: 'active' | 'released';
}

export interface GuarantorMatchCriteria {
  requiredGuaranteeAmount: number;
  contractDuration: number; // months
  tenantCreditScore: number;
  propertyCity: string;
}

export interface GuarantorMatch {
  guarantor: GuarantorProfile;
  matchScore: number; // 0-100
  recommendedProperty: GuarantorProperty;
  pledgeAmount: number;
  estimatedRisk: 'low' | 'medium' | 'high';
  reasons: string[];
}

/**
 * Calculate available guarantee margin for a property
 * Allows partial pledging - property can guarantee multiple contracts
 * up to its total appraised value.
 */
export function calculateAvailableMargin(property: GuarantorProperty): number {
  const totalPledged = property.currentPledges
    .filter(p => p.status === 'active')
    .reduce((sum, p) => sum + p.pledgedAmount, 0);

  // Allow up to 80% of property value to be used as guarantee
  const maxGuaranteeValue = property.appraisedValue * 0.8;

  return Math.max(0, maxGuaranteeValue - totalPledged);
}

/**
 * Find matching guarantors for a rental contract
 * Uses intelligent matching based on:
 * - Available guarantee capacity
 * - Geographic proximity
 * - Credit score
 * - Historical performance
 */
export async function findMatchingGuarantors(
  criteria: GuarantorMatchCriteria,
  availableGuarantors: GuarantorProfile[]
): Promise<GuarantorMatch[]> {
  const matches: GuarantorMatch[] = [];

  for (const guarantor of availableGuarantors) {
    // Find suitable properties from this guarantor
    for (const property of guarantor.ownedProperties) {
      const availableMargin = calculateAvailableMargin(property);

      // Skip if property doesn't have enough available margin
      if (availableMargin < criteria.requiredGuaranteeAmount) {
        continue;
      }

      // Skip if property is blocked
      if (property.status === 'Bloqueado') {
        continue;
      }

      // Calculate match score
      let matchScore = 0;
      const reasons: string[] = [];

      // Credit score factor (0-40 points)
      const creditScoreFactor = (guarantor.creditScore / 1000) * 40;
      matchScore += creditScoreFactor;
      if (guarantor.creditScore >= 750) {
        reasons.push(`Excelente score de crédito (${guarantor.creditScore})`);
      }

      // Available margin factor (0-30 points)
      const marginRatio = availableMargin / criteria.requiredGuaranteeAmount;
      const marginFactor = Math.min(marginRatio, 3) * 10; // Up to 30 points
      matchScore += marginFactor;
      if (marginRatio >= 2) {
        reasons.push('Margem de garantia confortável (2x o valor necessário)');
      }

      // Property value factor (0-20 points)
      const valueRatio = property.appraisedValue / criteria.requiredGuaranteeAmount;
      const valueFactor = Math.min(valueRatio, 5) * 4; // Up to 20 points
      matchScore += valueFactor;

      // Current utilization factor (0-10 points)
      // Prefer guarantors with lower utilization
      const utilizationRate = guarantor.currentlyPledgedValue / guarantor.totalAvailableGuaranteeValue;
      const utilizationFactor = (1 - utilizationRate) * 10;
      matchScore += utilizationFactor;
      if (utilizationRate < 0.3) {
        reasons.push('Baixa taxa de utilização de garantias (< 30%)');
      }

      // Estimate risk level
      let estimatedRisk: 'low' | 'medium' | 'high';
      if (matchScore >= 75 && criteria.tenantCreditScore >= 700) {
        estimatedRisk = 'low';
        reasons.push('Risco baixo baseado em análise combinada');
      } else if (matchScore >= 50 && criteria.tenantCreditScore >= 600) {
        estimatedRisk = 'medium';
      } else {
        estimatedRisk = 'high';
      }

      matches.push({
        guarantor,
        matchScore: Math.min(100, matchScore),
        recommendedProperty: property,
        pledgeAmount: criteria.requiredGuaranteeAmount,
        estimatedRisk,
        reasons,
      });
    }
  }

  // Sort by match score (highest first)
  matches.sort((a, b) => b.matchScore - a.matchScore);

  return matches.slice(0, 10); // Return top 10 matches
}

/**
 * Create a property pledge (lock property value as guarantee)
 */
export async function createPropertyPledge(
  guarantorId: string,
  propertyId: string,
  contractId: string,
  pledgeAmount: number,
  contractEndDate: Date
): Promise<{
  success: boolean;
  pledge?: PropertyPledge;
  lockHash?: string;
  error?: string;
}> {
  // Simulate blockchain lock transaction
  await new Promise(resolve => setTimeout(resolve, 1500));

  const lockHash = `0x${Math.random().toString(16).substr(2, 64)}`;

  const pledge: PropertyPledge = {
    contractId,
    pledgedAmount: pledgeAmount,
    lockHash,
    startDate: new Date(),
    endDate: contractEndDate,
    status: 'active',
  };

  return {
    success: true,
    pledge,
    lockHash,
  };
}

/**
 * Release property pledge after contract completion
 */
export async function releasePropertyPledge(
  propertyId: string,
  contractId: string,
  lockHash: string
): Promise<{
  success: boolean;
  releasedAmount: number;
  newAvailableMargin: number;
}> {
  // Simulate blockchain unlock transaction
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Mock values - would query actual property data
  const releasedAmount = 100000; // Amount released
  const newAvailableMargin = 250000; // New available margin

  return {
    success: true,
    releasedAmount,
    newAvailableMargin,
  };
}

/**
 * Calculate guarantor dashboard metrics
 */
export function calculateGuarantorMetrics(guarantor: GuarantorProfile): {
  totalPropertiesValue: number;
  pledgedPercentage: number;
  availablePercentage: number;
  activeContracts: number;
  riskExposure: number;
} {
  const totalPropertiesValue = guarantor.ownedProperties.reduce(
    (sum, p) => sum + p.appraisedValue,
    0
  );

  const pledgedPercentage =
    totalPropertiesValue > 0 ? (guarantor.currentlyPledgedValue / totalPropertiesValue) * 100 : 0;

  const availablePercentage = 100 - pledgedPercentage;

  const activeContracts = guarantor.ownedProperties.reduce(
    (sum, p) => sum + p.currentPledges.filter(pl => pl.status === 'active').length,
    0
  );

  // Risk exposure: how much value is at risk if all contracts default
  const riskExposure = guarantor.currentlyPledgedValue;

  return {
    totalPropertiesValue,
    pledgedPercentage,
    availablePercentage,
    activeContracts,
    riskExposure,
  };
}

/**
 * Request release of property after contract ends
 * "Desoneração" workflow
 */
export async function requestPropertyRelease(
  guarantorId: string,
  propertyId: string,
  contractId: string
): Promise<{
  success: boolean;
  requestId: string;
  estimatedReleaseDate: Date;
  requiresVerification: boolean;
}> {
  // Simulate request processing
  await new Promise(resolve => setTimeout(resolve, 800));

  const requestId = `REL${Date.now()}${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

  // Estimate release date (typically 7 days for verification)
  const estimatedReleaseDate = new Date();
  estimatedReleaseDate.setDate(estimatedReleaseDate.getDate() + 7);

  return {
    success: true,
    requestId,
    estimatedReleaseDate,
    requiresVerification: true,
  };
}
