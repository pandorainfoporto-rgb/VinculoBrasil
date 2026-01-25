// ============================================================
// FINANCIAL MATH - Fórmula Mestra de Precificação
// ============================================================
// Implementação da fórmula reversa de cálculo de aluguel
// Baseada no modelo de split do Vínculo Brasil

export interface PricingRules {
  // Taxa do proprietário recebido (ex: 0.85 = 85%)
  landlordReceiveRate: number;
  // Taxa do garantidor (ex: 0.05 = 5%)
  guarantorFeeRate: number;
  // Taxa de comissão da imobiliária sobre o valor bruto do proprietário (ex: 0.10 = 10%)
  agencyCommissionRate: number;
  // Split do corretor sobre a comissão da imobiliária (ex: 0.30 = 30%)
  realtorCommissionSplit: number;
}

export interface PricingInput {
  // Valor desejado pelo proprietário (X)
  ownerTargetX: number;
  // Custo do seguro (S)
  insuranceCostS: number;
  // Regras de precificação
  rules: PricingRules;
}

export interface PricingResult {
  // Aluguel total cobrado do inquilino (V_total)
  totalRent: number;
  // Taxa do garantidor (G)
  guarantorFee: number;
  // Taxa da plataforma Vínculo (P)
  platformFee: number;
  // Custo do seguro (S) - passthrough
  insuranceCost: number;
  // Comissão da imobiliária (I)
  agencyFee: number;
  // Comissão do corretor (C)
  realtorFee: number;
  // Valor líquido do proprietário após comissão
  ownerNet: number;
  // Valor bruto do proprietário (X)
  ownerGross: number;

  // Percentuais para exibição
  breakdown: {
    landlordPercent: number;
    guarantorPercent: number;
    platformPercent: number;
    insurancePercent: number;
  };
}

/**
 * Fórmula Mestra de Precificação
 *
 * A lógica matemática (estrita):
 * - totalRent (V_total) = ownerTargetX / 0.85
 * - guarantorFee (G) = totalRent * 0.05
 * - platformFee (P) = totalRent - (ownerTargetX + guarantorFee + insuranceCostS)
 * - agencyFee (I) = ownerTargetX * agencyCommissionRate (ex: 10%)
 * - realtorFee (C) = agencyFee * realtorCommissionSplit (ex: 30% da Imobiliária)
 * - ownerNet (Líquido) = ownerTargetX - agencyFee
 *
 * @param input - Dados de entrada para cálculo
 * @returns Resultado completo da precificação
 */
export function calculateRentPricing(input: PricingInput): PricingResult {
  const { ownerTargetX, insuranceCostS, rules } = input;

  // Validação básica
  if (ownerTargetX <= 0) {
    throw new Error("O valor desejado pelo proprietário deve ser maior que zero");
  }

  if (rules.landlordReceiveRate <= 0 || rules.landlordReceiveRate >= 1) {
    throw new Error("A taxa do proprietário deve estar entre 0 e 1");
  }

  // ===== FÓRMULA MESTRA =====

  // 1. Aluguel Total = X / 0.85 (inverso da taxa do proprietário)
  const totalRent = ownerTargetX / rules.landlordReceiveRate;

  // 2. Taxa do Garantidor = 5% do aluguel total
  const guarantorFee = totalRent * rules.guarantorFeeRate;

  // 3. Taxa da Plataforma = Aluguel Total - (X + G + S)
  const platformFee = totalRent - (ownerTargetX + guarantorFee + insuranceCostS);

  // 4. Comissão da Imobiliária = X * taxa de comissão (10%)
  const agencyFee = ownerTargetX * rules.agencyCommissionRate;

  // 5. Comissão do Corretor = Comissão da Imobiliária * split do corretor (30%)
  const realtorFee = agencyFee * rules.realtorCommissionSplit;

  // 6. Líquido do Proprietário = X - Comissão da Imobiliária
  const ownerNet = ownerTargetX - agencyFee;

  // Calcular percentuais para exibição
  const breakdown = {
    landlordPercent: (ownerTargetX / totalRent) * 100,
    guarantorPercent: (guarantorFee / totalRent) * 100,
    platformPercent: (platformFee / totalRent) * 100,
    insurancePercent: (insuranceCostS / totalRent) * 100,
  };

  return {
    totalRent,
    guarantorFee,
    platformFee,
    insuranceCost: insuranceCostS,
    agencyFee,
    realtorFee,
    ownerNet,
    ownerGross: ownerTargetX,
    breakdown,
  };
}

/**
 * Formata valor como moeda brasileira
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

/**
 * Formata percentual para exibição
 */
export function formatPercent(value: number): string {
  return `${value.toFixed(2)}%`;
}

/**
 * Calcula o valor que o inquilino precisa pagar
 * dado o valor líquido desejado pelo proprietário
 */
export function calculateTenantPayment(
  ownerNetDesired: number,
  agencyCommissionRate: number,
  landlordReceiveRate: number
): number {
  // ownerNet = ownerGross - (ownerGross * agencyCommissionRate)
  // ownerNet = ownerGross * (1 - agencyCommissionRate)
  // ownerGross = ownerNet / (1 - agencyCommissionRate)
  const ownerGross = ownerNetDesired / (1 - agencyCommissionRate);

  // totalRent = ownerGross / landlordReceiveRate
  return ownerGross / landlordReceiveRate;
}

/**
 * Valores padrão das regras de precificação
 */
export const DEFAULT_PRICING_RULES: PricingRules = {
  landlordReceiveRate: 0.85, // 85%
  guarantorFeeRate: 0.05, // 5%
  agencyCommissionRate: 0.10, // 10%
  realtorCommissionSplit: 0.30, // 30%
};
