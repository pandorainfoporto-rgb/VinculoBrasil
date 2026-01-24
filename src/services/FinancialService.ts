/**
 * VINCULO BRASIL - FINANCIAL SERVICE
 * Motor de Cálculo 85/15 (Gross-Up Model)
 *
 * REGRA DE NEGÓCIO:
 * - Proprietário recebe 85% (líquido na mão)
 * - Bloco de Serviços = 15% (Garantia NFT 5% + Seguro + Margem Plataforma)
 */

export interface RentalBreakdownInput {
  ownerNetRequest: number;        // Quanto o proprietário quer receber líquido
  hasAgency: boolean;              // Se tem imobiliária intermediando
  agencyCommissionRate?: number;   // Taxa da imobiliária (%)
  agencyCommissionModel?: 'DEDUCT_FROM_OWNER' | 'ADD_ON_PRICE';
}

export interface RentalBreakdownResult {
  // Valor Final
  totalRent: number;               // Valor total que o inquilino paga

  // Detalhamento do Proprietário (85%)
  baseAmount: number;              // Base de cálculo (85% do total)
  ownerNet: number;                // Líquido que o proprietário recebe
  agencyCommission: number;        // Comissão da imobiliária (se aplicável)

  // Bloco de Serviços (15%)
  serviceBlock: number;            // Total do bloco de serviços
  guarantorFee: number;            // Taxa do Garantidor NFT (5% fixo)
  insuranceFee: number;            // Seguro (valor fixo estimado)
  platformMargin: number;          // Margem/Lucro da Plataforma Vínculo

  // Percentuais para validação
  ownerPercentage: number;         // % que o proprietário recebe
  servicePercentage: number;       // % do bloco de serviços
}

/**
 * Calcula o breakdown financeiro do aluguel usando o modelo 85/15
 */
export function calculateRentalBreakdown(input: RentalBreakdownInput): RentalBreakdownResult {
  const {
    ownerNetRequest,
    hasAgency = false,
    agencyCommissionRate = 10,
    agencyCommissionModel = 'DEDUCT_FROM_OWNER'
  } = input;

  // Constantes
  const INSURANCE_FEE = 50.00;      // Valor fixo estimado do seguro
  const GUARANTOR_RATE = 0.05;      // 5% fixo para Garantia NFT
  const OWNER_BLOCK_RATE = 0.85;    // 85% é o bloco do proprietário
  const SERVICE_BLOCK_RATE = 0.15;  // 15% é o bloco de serviços

  let baseAmount: number;
  let agencyCommission: number = 0;
  let ownerNet: number;

  // PASSO 1: Calcular a Base (O Bloco de 85%)
  if (!hasAgency || agencyCommissionModel === 'DEDUCT_FROM_OWNER') {
    // Cenário A: Não tem agência OU agência desconta do proprietário
    // Base = o que o proprietário pediu
    baseAmount = ownerNetRequest;

    if (hasAgency) {
      // Calcular comissão da agência
      agencyCommission = baseAmount * (agencyCommissionRate / 100);
      ownerNet = baseAmount - agencyCommission;
    } else {
      ownerNet = baseAmount;
    }
  } else {
    // Cenário B: Agência cobra por fora (ADD_ON_PRICE)
    // Precisamos fazer gross-up também na comissão da agência
    // ownerNetRequest = BaseAmount * (1 - agencyRate/100)
    // BaseAmount = ownerNetRequest / (1 - agencyRate/100)
    baseAmount = ownerNetRequest / (1 - (agencyCommissionRate / 100));
    agencyCommission = baseAmount * (agencyCommissionRate / 100);
    ownerNet = ownerNetRequest; // Proprietário recebe exatamente o que pediu
  }

  // PASSO 2: Calcular o Total (Gross-up para 100%)
  // Se BaseAmount = 85%, então Total = BaseAmount / 0.85
  const totalRent = baseAmount / OWNER_BLOCK_RATE;

  // PASSO 3: Calcular o Bloco de Serviços (15%)
  const serviceBlock = totalRent * SERVICE_BLOCK_RATE;

  // PASSO 4: Distribuir o Bloco de Serviços
  const guarantorFee = totalRent * GUARANTOR_RATE; // 5% do total (fixo)
  const insuranceFee = INSURANCE_FEE;               // R$ 50,00 (fixo)

  // O que sobra é a margem da plataforma
  const platformMargin = serviceBlock - guarantorFee - insuranceFee;

  // Calcular percentuais para validação
  const ownerPercentage = (baseAmount / totalRent) * 100;
  const servicePercentage = (serviceBlock / totalRent) * 100;

  return {
    totalRent: Number(totalRent.toFixed(2)),
    baseAmount: Number(baseAmount.toFixed(2)),
    ownerNet: Number(ownerNet.toFixed(2)),
    agencyCommission: Number(agencyCommission.toFixed(2)),
    serviceBlock: Number(serviceBlock.toFixed(2)),
    guarantorFee: Number(guarantorFee.toFixed(2)),
    insuranceFee: Number(insuranceFee.toFixed(2)),
    platformMargin: Number(platformMargin.toFixed(2)),
    ownerPercentage: Number(ownerPercentage.toFixed(2)),
    servicePercentage: Number(servicePercentage.toFixed(2))
  };
}

/**
 * Validação básica dos cálculos
 */
export function validateBreakdown(result: RentalBreakdownResult): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  // Validar que a soma bate
  const sum = result.baseAmount + result.serviceBlock;
  const diff = Math.abs(sum - result.totalRent);

  if (diff > 0.02) { // Tolerância de 2 centavos para arredondamento
    errors.push(`Soma não bate: ${sum.toFixed(2)} !== ${result.totalRent.toFixed(2)}`);
  }

  // Validar percentuais
  if (Math.abs(result.ownerPercentage + result.servicePercentage - 100) > 0.1) {
    errors.push('Percentuais não somam 100%');
  }

  // Validar margem da plataforma não pode ser negativa
  if (result.platformMargin < 0) {
    errors.push('Margem da plataforma está negativa');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
