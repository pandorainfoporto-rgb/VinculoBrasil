/**
 * Workflows de Automação - Vínculo.io
 * Sistema de Check-in de Risco e Decisões Inteligentes
 */

import { type User, type KYCProfile } from './types';

// Extended user type for risk assessment
export interface TenantProfile extends User {
  kycProfile?: KYCProfile;
  cpf?: string;
  fullName?: string;
}

export interface RiskAssessment {
  tenant_id: string;
  credit_score: number; // 0-1000
  risk_level: 'low' | 'medium' | 'high';
  requires_guarantor: boolean;
  requires_insurance: boolean;
  guarantor_amount_required: number;
  insurance_premium_multiplier: number; // 1.0 = normal, 1.5 = high risk
  assessment_factors: {
    credit_history_score: number;
    income_vs_rent_ratio: number;
    previous_rental_history: number;
    kyc_validation_status: number;
  };
  recommendation: string;
  created_at: Date;
}

export interface RiskCheckInResult {
  approved: boolean;
  risk_assessment: RiskAssessment;
  next_steps: string[];
  required_documents: string[];
  estimated_approval_time: number; // in hours
}

/**
 * WORKFLOW A: Check-in de Risco (Automação de Entrada)
 *
 * Gatilho: Locatário envia proposta
 * Ação: Sistema consulta score de crédito e histórico
 * Resultado: Campo "Garantidor" torna-se obrigatório se score médio/baixo
 */
export async function performRiskCheckIn(
  tenant: TenantProfile,
  property_value: number,
  monthly_rent: number
): Promise<RiskCheckInResult> {
  const tenantName = tenant.fullName || tenant.kycProfile?.fullName || 'Tenant';
  const tenantCPF = tenant.cpf || tenant.kycProfile?.cpf || '';

  console.log(`[WORKFLOW A] Iniciando Check-in de Risco para ${tenantName}`);

  // Simula consulta a bureau de crédito (Serasa, SPC, etc.)
  const creditScore = await consultCreditBureau(tenantCPF);

  // Calcula proporção renda/aluguel
  const incomeRatio = calculateIncomeRatio(tenant, monthly_rent);

  // Consulta histórico de locações na plataforma
  const rentalHistory = await getRentalHistory(tenant.id);

  // Valida status KYC
  const kycStatus = tenant.kycProfile?.validationStatus === 'approved' ? 100 : 0;

  // Calcula score final ponderado
  const assessmentFactors = {
    credit_history_score: creditScore * 0.4, // 40% do peso
    income_vs_rent_ratio: incomeRatio * 0.3, // 30% do peso
    previous_rental_history: rentalHistory * 0.2, // 20% do peso
    kyc_validation_status: kycStatus * 0.1, // 10% do peso
  };

  const finalScore =
    assessmentFactors.credit_history_score +
    assessmentFactors.income_vs_rent_ratio +
    assessmentFactors.previous_rental_history +
    assessmentFactors.kyc_validation_status;

  // Determina nível de risco
  let riskLevel: 'low' | 'medium' | 'high';
  let requiresGuarantor = false;
  let requiresInsurance = true; // Sempre obrigatório
  let guarantorAmount = 0;
  let insurancePremiumMultiplier = 1.0;
  let recommendation = '';
  let approved = false;

  if (finalScore >= 750) {
    // BAIXO RISCO
    riskLevel = 'low';
    requiresGuarantor = false;
    requiresInsurance = true;
    insurancePremiumMultiplier = 1.0;
    recommendation =
      '✅ Perfil aprovado automaticamente. Apenas seguro obrigatório necessário.';
    approved = true;
  } else if (finalScore >= 500 && finalScore < 750) {
    // MÉDIO RISCO
    riskLevel = 'medium';
    requiresGuarantor = true; // ⚠️ Campo "Garantidor" torna-se OBRIGATÓRIO
    guarantorAmount = monthly_rent * 12; // Garantia de 12 meses
    requiresInsurance = true;
    insurancePremiumMultiplier = 1.2; // 20% mais caro
    recommendation =
      '⚠️ Perfil requer garantidor. Sistema abrirá marketplace de garantidores automaticamente.';
    approved = true; // Aprovado com condições
  } else {
    // ALTO RISCO
    riskLevel = 'high';
    requiresGuarantor = true;
    guarantorAmount = monthly_rent * 24; // Garantia de 24 meses
    requiresInsurance = true;
    insurancePremiumMultiplier = 1.5; // 50% mais caro
    recommendation =
      '🚨 Perfil de alto risco. Requer garantidor com margem elevada e seguro premium.';
    approved = true; // Aprovado com condições restritivas
  }

  const riskAssessment: RiskAssessment = {
    tenant_id: tenant.id,
    credit_score: creditScore,
    risk_level: riskLevel,
    requires_guarantor: requiresGuarantor,
    requires_insurance: requiresInsurance,
    guarantor_amount_required: guarantorAmount,
    insurance_premium_multiplier: insurancePremiumMultiplier,
    assessment_factors: assessmentFactors,
    recommendation,
    created_at: new Date(),
  };

  // Define próximos passos
  const nextSteps: string[] = [];
  const requiredDocuments: string[] = [];

  if (requiresGuarantor) {
    nextSteps.push('Buscar garantidor no marketplace da plataforma');
    nextSteps.push('Validar patrimônio do garantidor via blockchain');
    requiredDocuments.push('Comprovante de patrimônio do garantidor');
  }

  nextSteps.push('Contratar seguro fiança obrigatório');
  nextSteps.push('Aguardar análise da seguradora');
  nextSteps.push('Coletar assinaturas digitais de todas as partes');

  requiredDocuments.push('RG ou CNH (frente e verso)');
  requiredDocuments.push('Comprovante de residência');
  requiredDocuments.push('Comprovante de renda (3 últimos meses)');

  // Estima tempo de aprovação
  const estimatedTime = requiresGuarantor ? 48 : 24; // horas

  console.log(`[WORKFLOW A] ✓ Risco avaliado: ${riskLevel.toUpperCase()}`);
  console.log(`[WORKFLOW A] ✓ Garantidor obrigatório: ${requiresGuarantor ? 'SIM' : 'NÃO'}`);

  return {
    approved,
    risk_assessment: riskAssessment,
    next_steps: nextSteps,
    required_documents: requiredDocuments,
    estimated_approval_time: estimatedTime,
  };
}

/**
 * Consulta bureau de crédito (mock - integrar com Serasa, SPC, etc.)
 */
async function consultCreditBureau(cpf: string): Promise<number> {
  // Mock: Simula consulta ao bureau
  // Em produção: integrar com API da Serasa, SPC, Boa Vista, etc.
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Simula score baseado no CPF (apenas para demo)
  const sum = cpf.split('').reduce((acc, digit) => acc + Number.parseInt(digit), 0);
  return Math.min(1000, (sum * 37) % 1000);
}

/**
 * Calcula proporção renda vs aluguel
 */
function calculateIncomeRatio(tenant: TenantProfile, monthlyRent: number): number {
  // Regra: Renda deve ser no mínimo 3x o aluguel
  // Simulação de renda (em produção, vem do cadastro do usuário)
  const estimatedIncome = 5000; // Mock
  const ratio = estimatedIncome / monthlyRent;

  if (ratio >= 3) return 100; // Ideal
  if (ratio >= 2.5) return 70; // Aceitável
  if (ratio >= 2) return 40; // Arriscado
  return 10; // Muito arriscado
}

/**
 * Consulta histórico de locações na plataforma
 */
async function getRentalHistory(userId: string): Promise<number> {
  // Mock: Consulta histórico no banco de dados
  // Em produção: SELECT COUNT(*) FROM Contratos WHERE locatario_id = userId AND status = 'Quitado'
  await new Promise(resolve => setTimeout(resolve, 500));

  // Simula: 0 contratos = 50, 1+ contratos = 100
  return Math.random() > 0.5 ? 100 : 50;
}

/**
 * WORKFLOW B: Bloqueio de Colateral (Tokenização)
 *
 * Gatilho: Assinatura do Garantidor
 * Ação: Altera status do NFT do imóvel para LOCKED_COLLATERAL
 * Regra: Imóvel não pode ser listado enquanto contrato estiver ativo
 */
export interface CollateralLockResult {
  success: boolean;
  property_id: string;
  lock_status: 'LOCKED_COLLATERAL' | 'AVAILABLE';
  locked_amount: number;
  remaining_capacity: number;
  blockchain_tx_hash: string;
  lock_metadata: {
    contract_id: string;
    guarantor_id: string;
    locked_at: Date;
    unlock_scheduled_at: Date;
  };
}

export async function lockPropertyAsCollateral(
  guarantor_id: string,
  property_id: string,
  contract_id: string,
  amount_to_lock: number,
  contract_end_date: Date
): Promise<CollateralLockResult> {
  console.log(`[WORKFLOW B] Iniciando bloqueio de colateral do imóvel ${property_id}`);

  // 1. Consulta valor atual do imóvel
  const propertyValue = await getPropertyValuation(property_id);

  // 2. Verifica capacidade de garantia (máximo 80% do valor)
  const maxCapacity = propertyValue * 0.8;
  const currentlyLocked = await getCurrentlyLockedAmount(property_id);
  const remainingCapacity = maxCapacity - currentlyLocked;

  if (amount_to_lock > remainingCapacity) {
    return {
      success: false,
      property_id,
      lock_status: 'AVAILABLE',
      locked_amount: 0,
      remaining_capacity: remainingCapacity,
      blockchain_tx_hash: '',
      lock_metadata: {
        contract_id: '',
        guarantor_id: '',
        locked_at: new Date(),
        unlock_scheduled_at: new Date(),
      },
    };
  }

  // 3. Cria metadado do bloqueio no NFT
  const lockMetadata = {
    contract_id,
    guarantor_id,
    locked_at: new Date(),
    unlock_scheduled_at: contract_end_date,
  };

  // 4. Altera status do NFT para LOCKED_COLLATERAL
  const blockchainTx = await updateNFTMetadata(property_id, {
    status: 'LOCKED_COLLATERAL',
    locked_amount: currentlyLocked + amount_to_lock,
    max_capacity: maxCapacity,
    locks: [lockMetadata], // Adiciona à lista de locks
  });

  console.log(`[WORKFLOW B] ✓ Imóvel bloqueado na blockchain: ${blockchainTx}`);
  console.log(`[WORKFLOW B] ✓ Valor bloqueado: R$ ${amount_to_lock.toFixed(2)}`);
  console.log(`[WORKFLOW B] ✓ Capacidade restante: R$ ${(remainingCapacity - amount_to_lock).toFixed(2)}`);

  // 5. Registra na tabela de garantias
  await saveGuaranteeRecord({
    contract_id,
    guarantor_id,
    collateral_property_id: property_id,
    lock_status_blockchain: 'LOCKED_COLLATERAL',
    valuation_amount: amount_to_lock,
    blockchain_tx_id: blockchainTx,
  });

  return {
    success: true,
    property_id,
    lock_status: 'LOCKED_COLLATERAL',
    locked_amount: amount_to_lock,
    remaining_capacity: remainingCapacity - amount_to_lock,
    blockchain_tx_hash: blockchainTx,
    lock_metadata: lockMetadata,
  };
}

/**
 * Desbloqueia colateral quando contrato termina
 */
export async function unlockPropertyCollateral(
  property_id: string,
  contract_id: string
): Promise<boolean> {
  console.log(`[WORKFLOW B] Desbloqueando colateral do imóvel ${property_id}`);

  // Remove o lock específico do NFT
  const blockchainTx = await removeNFTLock(property_id, contract_id);

  // Verifica se ainda há outros locks
  const remainingLocks = await getRemainingLocks(property_id);

  if (remainingLocks === 0) {
    // Se não há mais locks, volta status para AVAILABLE
    await updateNFTMetadata(property_id, {
      status: 'AVAILABLE',
      locked_amount: 0,
    });
    console.log(`[WORKFLOW B] ✓ Imóvel completamente desbloqueado e disponível para locação`);
  } else {
    console.log(`[WORKFLOW B] ✓ Imóvel ainda possui ${remainingLocks} garantias ativas`);
  }

  return true;
}

// ============================================================================
// FUNÇÕES AUXILIARES (Mock - em produção, integrar com blockchain e database)
// ============================================================================

async function getPropertyValuation(propertyId: string): Promise<number> {
  // Mock: R$ 300.000 a R$ 800.000
  return 500000;
}

async function getCurrentlyLockedAmount(propertyId: string): Promise<number> {
  // Mock: Consulta soma de todos os locks ativos
  return 100000;
}

async function updateNFTMetadata(propertyId: string, metadata: any): Promise<string> {
  // Mock: Retorna hash da transação blockchain
  return `0x${Math.random().toString(16).slice(2, 42)}`;
}

async function saveGuaranteeRecord(guarantee: any): Promise<void> {
  // Mock: INSERT INTO Guarantees
  console.log('[DB] Garantia salva:', guarantee);
}

async function removeNFTLock(propertyId: string, contractId: string): Promise<string> {
  // Mock: Remove lock específico do array de locks
  return `0x${Math.random().toString(16).slice(2, 42)}`;
}

async function getRemainingLocks(propertyId: string): Promise<number> {
  // Mock: Conta quantos locks ainda existem
  return Math.floor(Math.random() * 3);
}

/**
 * WORKFLOW C: Split de Pagamento Inteligente
 *
 * Gatilho: Confirmação de pagamento do Locatário
 * Ação: Divide valor instantaneamente (85% locador, 5% seguradora, 5% plataforma, 5% garantidor)
 * Registro: Hash da transação gravado no NFT do contrato
 *
 * NOVO MODELO: O garantidor recebe 5% como comissão mensal por empenhar seu imóvel como garantia
 */
export interface PaymentSplitResult {
  success: boolean;
  total_amount: number;
  splits: {
    landlord: { wallet: string; amount: number; percentage: number; tx_hash: string };
    insurer: { wallet: string; amount: number; percentage: number; tx_hash: string };
    platform: { wallet: string; amount: number; percentage: number; tx_hash: string };
    guarantor: { wallet: string; amount: number; percentage: number; tx_hash: string };
  };
  nft_registry_tx: string;
  payment_method: 'PIX' | 'Boleto' | 'Crypto';
  created_at: Date;
}

export async function executeAutomaticPaymentSplit(
  contractId: string,
  totalAmount: number,
  landlordWallet: string,
  insurerWallet: string,
  platformWallet: string,
  guarantorWallet: string,
  paymentMethod: 'PIX' | 'Boleto' | 'Crypto'
): Promise<PaymentSplitResult> {
  console.log(`[WORKFLOW C] Iniciando split de pagamento de R$ ${totalAmount.toFixed(2)}`);

  // Calcula valores do split (85% / 5% / 5% / 5%)
  // NOVO MODELO: Garantidor recebe 5% como comissão mensal por empenhar o imóvel
  const landlordAmount = totalAmount * 0.85;
  const insurerAmount = totalAmount * 0.05;
  const platformAmount = totalAmount * 0.05;
  const guarantorAmount = totalAmount * 0.05;

  // Executa transferências simultâneas para os 4 players
  const [landlordTx, insurerTx, platformTx, guarantorTx] = await Promise.all([
    transferFunds(landlordWallet, landlordAmount, paymentMethod),
    transferFunds(insurerWallet, insurerAmount, paymentMethod),
    transferFunds(platformWallet, platformAmount, paymentMethod),
    transferFunds(guarantorWallet, guarantorAmount, paymentMethod),
  ]);

  console.log(`[WORKFLOW C] ✓ 85% (R$ ${landlordAmount.toFixed(2)}) → Locador`);
  console.log(`[WORKFLOW C] ✓ 5% (R$ ${insurerAmount.toFixed(2)}) → Seguradora`);
  console.log(`[WORKFLOW C] ✓ 5% (R$ ${platformAmount.toFixed(2)}) → Plataforma`);
  console.log(`[WORKFLOW C] ✓ 5% (R$ ${guarantorAmount.toFixed(2)}) → Garantidor (Comissão)`);

  // Registra no NFT do contrato como recibo imutável
  const nftRegistryTx = await recordPaymentInNFT(contractId, {
    total_amount: totalAmount,
    landlord_received: landlordAmount,
    insurer_received: insurerAmount,
    platform_received: platformAmount,
    guarantor_received: guarantorAmount,
    timestamp: new Date(),
    payment_method: paymentMethod,
  });

  console.log(`[WORKFLOW C] ✓ Pagamento registrado no NFT: ${nftRegistryTx}`);

  return {
    success: true,
    total_amount: totalAmount,
    splits: {
      landlord: { wallet: landlordWallet, amount: landlordAmount, percentage: 85, tx_hash: landlordTx },
      insurer: { wallet: insurerWallet, amount: insurerAmount, percentage: 5, tx_hash: insurerTx },
      platform: { wallet: platformWallet, amount: platformAmount, percentage: 5, tx_hash: platformTx },
      guarantor: { wallet: guarantorWallet, amount: guarantorAmount, percentage: 5, tx_hash: guarantorTx },
    },
    nft_registry_tx: nftRegistryTx,
    payment_method: paymentMethod,
    created_at: new Date(),
  };
}

async function transferFunds(wallet: string, amount: number, method: string): Promise<string> {
  // Mock: Integração com gateway de pagamento (Mercado Pago, PagSeguro, etc.)
  await new Promise(resolve => setTimeout(resolve, 1000));
  return `0x${Math.random().toString(16).slice(2, 42)}`;
}

async function recordPaymentInNFT(contractId: string, paymentData: any): Promise<string> {
  // Mock: Adiciona receipt ao metadata do NFT
  return `0x${Math.random().toString(16).slice(2, 42)}`;
}

/**
 * CÁLCULO DO VALOR TOTAL DO ALUGUEL
 *
 * Considerando o novo modelo de rateio com 4 players:
 * - 85% Locador (proprietário do imóvel)
 * - 5% Seguradora (seguro fiança obrigatório)
 * - 5% Plataforma (taxa de intermediação)
 * - 5% Garantidor (comissão mensal por empenhar o imóvel)
 *
 * Na elaboração do preço final do aluguel, o sistema calcula automaticamente
 * a divisão para garantir que todos os players recebam suas porcentagens.
 */
export interface RentalPriceBreakdown {
  base_rent: number; // Valor que o locador quer receber (85%)
  landlord_amount: number; // 85% do total
  insurer_premium: number; // 5% do total
  platform_fee: number; // 5% do total
  guarantor_commission: number; // 5% do total
  total_monthly_rent: number; // Valor total que o locatário paga
  breakdown_details: {
    landlord_percentage: number;
    insurer_percentage: number;
    platform_percentage: number;
    guarantor_percentage: number;
  };
}

/**
 * Calcula o valor total do aluguel baseado no valor desejado pelo locador
 *
 * @param desiredLandlordAmount - Valor que o locador quer receber (será 85% do total)
 * @returns Breakdown completo do aluguel
 *
 * @example
 * // Locador quer receber R$ 2.550,00
 * const breakdown = calculateRentalPrice(2550);
 * // total_monthly_rent = R$ 3.000,00
 * // landlord: R$ 2.550 (85%)
 * // insurer: R$ 150 (5%)
 * // platform: R$ 150 (5%)
 * // guarantor: R$ 150 (5%)
 */
export function calculateRentalPrice(desiredLandlordAmount: number): RentalPriceBreakdown {
  // Se o locador quer receber X, isso representa 85% do total
  // Então: X = 0.85 * Total
  // Total = X / 0.85
  const totalMonthlyRent = desiredLandlordAmount / 0.85;

  const landlordAmount = totalMonthlyRent * 0.85;
  const insurerPremium = totalMonthlyRent * 0.05;
  const platformFee = totalMonthlyRent * 0.05;
  const guarantorCommission = totalMonthlyRent * 0.05;

  return {
    base_rent: desiredLandlordAmount,
    landlord_amount: landlordAmount,
    insurer_premium: insurerPremium,
    platform_fee: platformFee,
    guarantor_commission: guarantorCommission,
    total_monthly_rent: totalMonthlyRent,
    breakdown_details: {
      landlord_percentage: 85,
      insurer_percentage: 5,
      platform_percentage: 5,
      guarantor_percentage: 5,
    },
  };
}

/**
 * Exibe o breakdown do aluguel de forma formatada
 */
export function displayRentalPriceBreakdown(breakdown: RentalPriceBreakdown): string {
  return `
╔════════════════════════════════════════════════════════════╗
║           COMPOSIÇÃO DO VALOR DO ALUGUEL                  ║
╠════════════════════════════════════════════════════════════╣
║                                                            ║
║  💰 VALOR TOTAL MENSAL: R$ ${breakdown.total_monthly_rent.toFixed(2).padStart(12)}        ║
║                                                            ║
║  Distribuição automática:                                 ║
║  ┌────────────────────────────────────────────────────┐   ║
║  │ 🏠 Locador (85%):        R$ ${breakdown.landlord_amount.toFixed(2).padStart(12)}   │   ║
║  │ 🛡️  Seguradora (5%):      R$ ${breakdown.insurer_premium.toFixed(2).padStart(12)}   │   ║
║  │ 🏢 Plataforma (5%):       R$ ${breakdown.platform_fee.toFixed(2).padStart(12)}   │   ║
║  │ 🤝 Garantidor (5%):       R$ ${breakdown.guarantor_commission.toFixed(2).padStart(12)}   │   ║
║  └────────────────────────────────────────────────────┘   ║
║                                                            ║
║  ℹ️  O locatário paga UM único valor mensal                ║
║  ℹ️  A divisão é feita automaticamente pela plataforma     ║
║  ℹ️  O garantidor recebe comissão por empenhar seu imóvel  ║
║                                                            ║
╚════════════════════════════════════════════════════════════╝
  `.trim();
}
