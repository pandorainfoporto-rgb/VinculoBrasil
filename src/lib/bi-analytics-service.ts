/**
 * Nexus Imobi - Business Intelligence & Analytics Service
 *
 * Generates comprehensive reports for platform monitoring:
 * - LTV (Lifetime Value)
 * - Churn Rate
 * - Claims Analytics (Sinistralidade)
 */

export interface LTVAnalytics {
  averageLTV: number;
  medianLTV: number;
  ltvBySegment: {
    highValue: number; // Top 20% tenants
    midValue: number; // Middle 60%
    lowValue: number; // Bottom 20%
  };
  projectedAnnualRevenue: number;
  tenantsByLTVRange: {
    range: string;
    count: number;
    totalRevenue: number;
  }[];
}

export interface ChurnAnalytics {
  landlordChurnRate: number; // % of landlords who leave after first contract
  tenantChurnRate: number; // % of tenants who don't renew
  contractRenewalRate: number; // % of contracts renewed
  averageContractDuration: number; // in months
  churnReasons: {
    reason: string;
    percentage: number;
  }[];
  churnByPropertyType: {
    propertyType: string;
    churnRate: number;
  }[];
}

export interface ClaimsAnalytics {
  totalClaims: number;
  totalClaimsValue: number;
  claimsRate: number; // Claims per 100 contracts
  averageClaimValue: number;
  claimsByType: {
    type: 'Inadimplência' | 'Danos' | 'Abandono' | 'Outros';
    count: number;
    totalValue: number;
  }[];
  insurerPerformance: {
    insurerId: string;
    insurerName: string;
    totalClaims: number;
    approvalRate: number;
    averageProcessingDays: number;
  }[];
  monthlyTrend: {
    month: string;
    claimsCount: number;
    claimsValue: number;
  }[];
}

export interface PlatformMetrics {
  totalActiveContracts: number;
  totalNFTsMinted: number;
  monthlyRevenue: number;
  defaultRate: number; // Taxa de inadimplência
  averageRentValue: number;
  totalPropertiesOnPlatform: number;
  totalUsers: number;
  usersByRole: {
    landlords: number;
    tenants: number;
    guarantors: number;
    insurers: number;
  };
}

/**
 * Calculate Lifetime Value (LTV) for tenants
 */
export async function calculateLTV(contracts: any[]): Promise<LTVAnalytics> {
  // Simulate analytics processing
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Calculate LTV per tenant
  const tenantLTVs = new Map<string, number>();

  contracts.forEach(contract => {
    const tenantId = contract.tenantId;
    const contractValue = contract.rentAmount * contract.durationMonths;

    if (!tenantLTVs.has(tenantId)) {
      tenantLTVs.set(tenantId, 0);
    }
    tenantLTVs.set(tenantId, tenantLTVs.get(tenantId)! + contractValue);
  });

  const ltvValues = Array.from(tenantLTVs.values()).sort((a, b) => b - a);

  const averageLTV = ltvValues.reduce((sum, ltv) => sum + ltv, 0) / ltvValues.length;
  const medianLTV = ltvValues[Math.floor(ltvValues.length / 2)];

  // Segment by value
  const top20Index = Math.floor(ltvValues.length * 0.2);
  const bottom20Index = Math.floor(ltvValues.length * 0.8);

  const highValue =
    ltvValues.slice(0, top20Index).reduce((sum, ltv) => sum + ltv, 0) / top20Index || 0;
  const lowValue =
    ltvValues.slice(bottom20Index).reduce((sum, ltv) => sum + ltv, 0) /
      (ltvValues.length - bottom20Index) || 0;
  const midValue =
    ltvValues.slice(top20Index, bottom20Index).reduce((sum, ltv) => sum + ltv, 0) /
      (bottom20Index - top20Index) || 0;

  // Project annual revenue
  const averageMonthlyValue = averageLTV / 12; // Assuming average 12 month contracts
  const projectedAnnualRevenue = averageMonthlyValue * 12 * tenantLTVs.size;

  // LTV ranges
  const ltvByRange = [
    { range: 'R$ 0 - R$ 20.000', count: 0, totalRevenue: 0 },
    { range: 'R$ 20.000 - R$ 50.000', count: 0, totalRevenue: 0 },
    { range: 'R$ 50.000 - R$ 100.000', count: 0, totalRevenue: 0 },
    { range: 'R$ 100.000+', count: 0, totalRevenue: 0 },
  ];

  ltvValues.forEach(ltv => {
    if (ltv < 20000) {
      ltvByRange[0].count++;
      ltvByRange[0].totalRevenue += ltv;
    } else if (ltv < 50000) {
      ltvByRange[1].count++;
      ltvByRange[1].totalRevenue += ltv;
    } else if (ltv < 100000) {
      ltvByRange[2].count++;
      ltvByRange[2].totalRevenue += ltv;
    } else {
      ltvByRange[3].count++;
      ltvByRange[3].totalRevenue += ltv;
    }
  });

  return {
    averageLTV,
    medianLTV,
    ltvBySegment: {
      highValue,
      midValue,
      lowValue,
    },
    projectedAnnualRevenue,
    tenantsByLTVRange: ltvByRange,
  };
}

/**
 * Calculate churn rate metrics
 */
export async function calculateChurnRate(
  contracts: any[],
  properties: any[]
): Promise<ChurnAnalytics> {
  await new Promise(resolve => setTimeout(resolve, 800));

  // Mock churn calculations
  const landlordChurnRate = 15.5; // 15.5% of landlords leave after first contract
  const tenantChurnRate = 22.3; // 22.3% of tenants don't renew
  const contractRenewalRate = 77.7; // 77.7% renewal rate

  const averageContractDuration = 14.5; // 14.5 months average

  const churnReasons = [
    { reason: 'Mudança de cidade', percentage: 35 },
    { reason: 'Compra de imóvel próprio', percentage: 28 },
    { reason: 'Valor do aluguel', percentage: 18 },
    { reason: 'Problemas com proprietário', percentage: 10 },
    { reason: 'Outros', percentage: 9 },
  ];

  const churnByPropertyType = [
    { propertyType: 'Apartamento', churnRate: 20.1 },
    { propertyType: 'Casa', churnRate: 18.5 },
    { propertyType: 'Comercial', churnRate: 25.8 },
  ];

  return {
    landlordChurnRate,
    tenantChurnRate,
    contractRenewalRate,
    averageContractDuration,
    churnReasons,
    churnByPropertyType,
  };
}

/**
 * Calculate insurance claims analytics (Sinistralidade)
 */
export async function calculateClaimsAnalytics(
  claims: any[],
  contracts: any[]
): Promise<ClaimsAnalytics> {
  await new Promise(resolve => setTimeout(resolve, 900));

  const totalClaims = claims.length;
  const totalClaimsValue = claims.reduce((sum, claim) => sum + claim.value, 0);
  const claimsRate = (totalClaims / contracts.length) * 100;
  const averageClaimValue = totalClaimsValue / totalClaims || 0;

  const claimsByType = [
    {
      type: 'Inadimplência' as const,
      count: Math.floor(totalClaims * 0.65),
      totalValue: totalClaimsValue * 0.7,
    },
    {
      type: 'Danos' as const,
      count: Math.floor(totalClaims * 0.2),
      totalValue: totalClaimsValue * 0.18,
    },
    {
      type: 'Abandono' as const,
      count: Math.floor(totalClaims * 0.1),
      totalValue: totalClaimsValue * 0.08,
    },
    {
      type: 'Outros' as const,
      count: Math.floor(totalClaims * 0.05),
      totalValue: totalClaimsValue * 0.04,
    },
  ];

  const insurerPerformance = [
    {
      insurerId: 'ins_001',
      insurerName: 'Porto Seguro Aluguel',
      totalClaims: Math.floor(totalClaims * 0.45),
      approvalRate: 92.5,
      averageProcessingDays: 7,
    },
    {
      insurerId: 'ins_002',
      insurerName: 'Youse Garantia',
      totalClaims: Math.floor(totalClaims * 0.35),
      approvalRate: 88.2,
      averageProcessingDays: 10,
    },
    {
      insurerId: 'ins_003',
      insurerName: 'Junto Seguros',
      totalClaims: Math.floor(totalClaims * 0.2),
      approvalRate: 95.1,
      averageProcessingDays: 5,
    },
  ];

  // Generate 12-month trend
  const monthlyTrend = [];
  const months = [
    'Jan',
    'Fev',
    'Mar',
    'Abr',
    'Mai',
    'Jun',
    'Jul',
    'Ago',
    'Set',
    'Out',
    'Nov',
    'Dez',
  ];

  for (let i = 0; i < 12; i++) {
    monthlyTrend.push({
      month: months[i],
      claimsCount: Math.floor(Math.random() * 15) + 5,
      claimsValue: Math.random() * 50000 + 10000,
    });
  }

  return {
    totalClaims,
    totalClaimsValue,
    claimsRate,
    averageClaimValue,
    claimsByType,
    insurerPerformance,
    monthlyTrend,
  };
}

/**
 * Get comprehensive platform metrics
 */
export async function getPlatformMetrics(): Promise<PlatformMetrics> {
  await new Promise(resolve => setTimeout(resolve, 600));

  return {
    totalActiveContracts: 1247,
    totalNFTsMinted: 1589,
    monthlyRevenue: 1876543.21,
    defaultRate: 2.3, // 2.3% inadimplência
    averageRentValue: 3250.0,
    totalPropertiesOnPlatform: 2134,
    totalUsers: 5678,
    usersByRole: {
      landlords: 1890,
      tenants: 2450,
      guarantors: 1145,
      insurers: 193,
    },
  };
}

/**
 * Generate executive summary report
 */
export async function generateExecutiveReport(): Promise<{
  ltv: LTVAnalytics;
  churn: ChurnAnalytics;
  claims: ClaimsAnalytics;
  platform: PlatformMetrics;
  generatedAt: string;
}> {
  // Mock data for demonstration
  const mockContracts: any[] = [];
  const mockClaims: any[] = [];
  const mockProperties: any[] = [];

  const [ltv, churn, claims, platform] = await Promise.all([
    calculateLTV(mockContracts),
    calculateChurnRate(mockContracts, mockProperties),
    calculateClaimsAnalytics(mockClaims, mockContracts),
    getPlatformMetrics(),
  ]);

  return {
    ltv,
    churn,
    claims,
    platform,
    generatedAt: new Date().toISOString(),
  };
}
