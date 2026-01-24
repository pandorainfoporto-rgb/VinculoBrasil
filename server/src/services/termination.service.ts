// ============================================
// TERMINATION SERVICE - Cálculo de Rescisão
// Lei do Inquilinato - Art. 4º (Multa Proporcional)
// ============================================
//
// FLUXO DE PROTEÇÃO AO INVESTIDOR (3 Escudos):
//
// 1. MULTA RESCISÓRIA (Lei 8.245/91 - Art. 4º)
//    - Base = 3 meses de aluguel (padrão de mercado)
//    - Proporcional = (BaseFine / TotalMonths) * RemainingMonths
//    - Quem PAGA: Inquilino (ou Seguradora se inadimplente)
//    - Quem RECEBE: Investidor (que comprou os recebíveis)
//
// 2. DÉFICIT (COOBRIGAÇÃO DO DONO)
//    - Se Multa < Valor que faltava repassar ao Investidor
//    - Diferença = Débito do Proprietário
//    - Gera cobrança Asaas contra o Proprietário
//
// 3. SEGURO FIANÇA (Garantia Prévia)
//    - Seguradora cobre a multa se inquilino não pagar
//    - NÃO cobre o período de vacância (apenas inadimplência)
//
// ============================================

import axios from 'axios';
import crypto from 'crypto';
import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';
import { config } from '../config/index.js';

// ============================================
// TYPES
// ============================================

export interface TerminationCalculation {
  // Contrato
  contractId: string;
  contractStartDate: Date;
  contractEndDate: Date;
  exitDate: Date;

  // Valores do Contrato
  monthlyRent: number;
  totalDurationMonths: number;
  elapsedMonths: number;
  remainingMonths: number;

  // Cálculo da Multa (Lei do Inquilinato)
  baseFineMonths: number;        // Geralmente 3 meses
  baseFineValue: number;         // monthlyRent * baseFineMonths
  proportionalFine: number;      // (baseFine / totalMonths) * remainingMonths

  // Distribuição para Investidor
  investorTotalOwed: number;     // Valor total que o investidor deveria receber
  investorPayout: number;        // Valor que vai para o investidor (multa)

  // Déficit (Coobrigação do Proprietário)
  hasShortfall: boolean;
  ownerDebt: number;             // Se multa < investorTotalOwed

  // Metadados
  p2pListingId?: string;
  investorId?: string;
  ownerId?: string;
}

export interface TerminationResult {
  success: boolean;
  calculation: TerminationCalculation;

  // Cobranças geradas
  tenantBillId?: string;         // Cobrança da multa ao inquilino
  ownerBillId?: string;          // Cobrança do déficit ao proprietário

  // Erros
  error?: string;
}

// ============================================
// HELPERS
// ============================================

/**
 * Calcula a diferença em meses entre duas datas
 */
const monthDiff = (from: Date, to: Date): number => {
  const fromDate = new Date(from);
  const toDate = new Date(to);

  const months = (toDate.getFullYear() - fromDate.getFullYear()) * 12
    + (toDate.getMonth() - fromDate.getMonth());

  // Ajuste para dias (se ainda não completou o mês, não conta)
  const daysDiff = toDate.getDate() - fromDate.getDate();
  if (daysDiff < 0) {
    return Math.max(0, months - 1);
  }

  return Math.max(0, months);
};

/**
 * Arredonda para 2 casas decimais
 */
const round2 = (value: number): number => Number(value.toFixed(2));

// ============================================
// ASAAS HELPERS
// ============================================

/**
 * Descriptografar chaves do banco
 */
const decrypt = (encryptedText: string): string => {
  try {
    const [ivHex, encrypted] = encryptedText.split(':');
    if (!ivHex || !encrypted) return encryptedText;

    const iv = Buffer.from(ivHex, 'hex');
    const key = Buffer.from(config.encryptionKey.padEnd(32, '0').slice(0, 32));
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch {
    return encryptedText;
  }
};

/**
 * Buscar API Key do Asaas do banco
 */
const getAsaasAPIKey = async (): Promise<string> => {
  try {
    const configRecord = await prisma.systemConfig.findUnique({
      where: { key: 'ASAAS_API_KEY' }
    });

    if (configRecord?.value) {
      return configRecord.encrypted ? decrypt(configRecord.value) : configRecord.value;
    }

    if (process.env.ASAAS_API_KEY) {
      return process.env.ASAAS_API_KEY;
    }

    throw new Error('ASAAS_API_KEY não configurado');
  } catch (error) {
    logger.error(`Failed to get Asaas API Key: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
};

/**
 * Criar cliente HTTP do Asaas
 */
const createAsaasClient = async () => {
  const token = await getAsaasAPIKey();
  const baseURL = process.env.ASAAS_SANDBOX === 'true'
    ? 'https://sandbox.asaas.com/api/v3'
    : 'https://api.asaas.com/v3';

  return axios.create({
    baseURL,
    headers: {
      'access_token': token,
      'Content-Type': 'application/json',
    },
  });
};

interface AsaasChargeResult {
  id: string;
  invoiceUrl: string;
  value: number;
  dueDate: string;
  status: string;
}

/**
 * Cria cobrança de multa rescisória no Asaas
 */
const createTerminationFineCharge = async (
  contract: {
    id: string;
    tenantName: string;
    tenantCpf: string;
    tenantEmail: string;
    tenantPhone: string;
    financialSnapshot?: unknown;
  },
  fineAmount: number,
  investorPixKey?: string
): Promise<AsaasChargeResult | null> => {
  try {
    const api = await createAsaasClient();

    // Buscar ou criar customer no Asaas
    let asaasCustomerId = (contract.financialSnapshot as Record<string, unknown> | null)?.asaasCustomerId as string | undefined;

    if (!asaasCustomerId) {
      const customerRes = await api.post('/customers', {
        name: contract.tenantName,
        cpfCnpj: contract.tenantCpf.replace(/\D/g, ''),
        email: contract.tenantEmail,
        phone: contract.tenantPhone?.replace(/\D/g, ''),
      });
      asaasCustomerId = customerRes.data.id;
    }

    // Data de vencimento: 7 dias
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7);

    // Splits: se tem investidor, direcionar para ele
    const splits = [];
    if (investorPixKey && fineAmount > 0) {
      splits.push({
        walletId: investorPixKey,
        fixedValue: fineAmount,
      });
    }

    const payload = {
      customer: asaasCustomerId,
      billingType: 'PIX',
      value: fineAmount,
      dueDate: dueDate.toISOString().split('T')[0],
      description: `Multa Rescisória - Contrato #${contract.id.slice(0, 8)}`,
      externalReference: `TERM:${contract.id}`,
      ...(splits.length > 0 && { split: splits }),
    };

    logger.info(`[Termination] Creating fine charge: R$ ${fineAmount}`);

    const res = await api.post('/payments', payload);

    // Registrar no banco
    await prisma.payment.create({
      data: {
        contractId: contract.id,
        type: 'FINE',
        status: 'PENDING',
        amount: fineAmount,
        dueDate,
        gatewayId: res.data.id,
        gatewayProvider: 'asaas',
        paymentMethod: 'pix',
      },
    });

    logger.info(`[Termination] Fine charge created: ${res.data.id}`);

    return {
      id: res.data.id,
      invoiceUrl: res.data.invoiceUrl,
      value: res.data.value,
      dueDate: res.data.dueDate,
      status: res.data.status,
    };

  } catch (error) {
    logger.error(`[Termination] Failed to create fine charge: ${error instanceof Error ? error.message : String(error)}`);
    return null;
  }
};

/**
 * Cria cobrança de coobrigação (déficit) contra o proprietário
 */
const createOwnerDebtCharge = async (
  contractId: string,
  owner: {
    id: string;
    name: string;
    cpf?: string | null;
    email?: string;
    phone?: string | null;
    pixKey?: string | null;
  },
  debtAmount: number,
  investorPixKey?: string
): Promise<AsaasChargeResult | null> => {
  try {
    if (!owner.cpf || !owner.email) {
      logger.warn('[Termination] Owner missing CPF or email, cannot create debt charge');
      return null;
    }

    const api = await createAsaasClient();

    // Criar customer para o proprietário
    const customerRes = await api.post('/customers', {
      name: owner.name,
      cpfCnpj: owner.cpf.replace(/\D/g, ''),
      email: owner.email,
      phone: owner.phone?.replace(/\D/g, ''),
    });
    const asaasCustomerId = customerRes.data.id;

    // Data de vencimento: 15 dias
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 15);

    // Split: direcionar para investidor
    const splits = [];
    if (investorPixKey && debtAmount > 0) {
      splits.push({
        walletId: investorPixKey,
        fixedValue: debtAmount,
      });
    }

    const payload = {
      customer: asaasCustomerId,
      billingType: 'PIX',
      value: debtAmount,
      dueDate: dueDate.toISOString().split('T')[0],
      description: `Coobrigação - Rescisão Contrato #${contractId.slice(0, 8)}`,
      externalReference: `COOB:${contractId}`,
      ...(splits.length > 0 && { split: splits }),
    };

    logger.info(`[Termination] Creating owner debt charge: R$ ${debtAmount}`);

    const res = await api.post('/payments', payload);

    // Registrar no banco
    await prisma.payment.create({
      data: {
        contractId,
        type: 'OTHER',
        status: 'PENDING',
        amount: debtAmount,
        dueDate,
        gatewayId: res.data.id,
        gatewayProvider: 'asaas',
        paymentMethod: 'pix',
      },
    });

    logger.info(`[Termination] Owner debt charge created: ${res.data.id}`);

    return {
      id: res.data.id,
      invoiceUrl: res.data.invoiceUrl,
      value: res.data.value,
      dueDate: res.data.dueDate,
      status: res.data.status,
    };

  } catch (error) {
    logger.error(`[Termination] Failed to create owner debt charge: ${error instanceof Error ? error.message : String(error)}`);
    return null;
  }
};

// ============================================
// CORE: CÁLCULO DA RESCISÃO
// ============================================

/**
 * Calcula os valores da rescisão antecipada
 *
 * @param contractId - ID do contrato de locação
 * @param exitDate - Data de entrega das chaves (saída do inquilino)
 * @param baseFineMonths - Meses de multa base (padrão: 3)
 * @returns Cálculo completo da rescisão
 */
export const calculateTermination = async (
  contractId: string,
  exitDate: Date,
  baseFineMonths: number = 3
): Promise<TerminationCalculation> => {

  logger.info(`[Termination] Calculating for contract ${contractId}, exit date: ${exitDate.toISOString()}`);

  // 1. Buscar contrato com dados do P2P
  const contract = await prisma.rentContract.findUnique({
    where: { id: contractId },
    include: {
      property: {
        include: {
          owner: { select: { id: true, name: true, pixKey: true } },
        },
      },
      p2pListings: {
        where: { status: 'SOLD' },
        orderBy: { soldAt: 'desc' },
        take: 1,
      },
    },
  });

  if (!contract) {
    throw new Error('Contrato não encontrado');
  }

  // 2. Verificar se há investidor P2P (cessão de crédito)
  const p2pListing = contract.p2pListings[0];
  const hasInvestor = !!p2pListing;

  // 3. Datas e durações
  const startDate = new Date(contract.startDate);
  const endDate = new Date(contract.endDate);
  const exit = new Date(exitDate);

  // Validações
  if (exit < startDate) {
    throw new Error('Data de saída não pode ser anterior ao início do contrato');
  }

  if (exit > endDate) {
    throw new Error('Data de saída não pode ser posterior ao término do contrato');
  }

  const totalDurationMonths = monthDiff(startDate, endDate);
  const elapsedMonths = monthDiff(startDate, exit);
  const remainingMonths = totalDurationMonths - elapsedMonths;

  // 4. Valores
  const monthlyRent = Number(contract.rentValue);

  // 5. Cálculo da Multa Proporcional (Lei 8.245/91 Art. 4º)
  // Multa Base = 3 meses de aluguel (padrão de mercado)
  // Multa Proporcional = (MultaBase / DuraçãoTotal) * MesesRestantes
  const baseFineValue = round2(monthlyRent * baseFineMonths);
  const proportionalFine = round2((baseFineValue / totalDurationMonths) * remainingMonths);

  logger.info(`[Termination] Base Fine: R$ ${baseFineValue} (${baseFineMonths} months)`);
  logger.info(`[Termination] Proportional Fine: R$ ${proportionalFine} (${remainingMonths}/${totalDurationMonths} months)`);

  // 6. Cálculo do valor devido ao Investidor
  // Se houve cessão P2P, o investidor deveria receber os aluguéis restantes
  let investorTotalOwed = 0;
  let investorId: string | undefined;
  let p2pListingId: string | undefined;

  if (hasInvestor && p2pListing) {
    // Buscar regra de split ativa
    const splitRule = await prisma.contractSplitRule.findFirst({
      where: {
        contractId: contractId,
        isActive: true,
        sourceType: 'P2P_SALE',
        startDate: { lte: exit },
        endDate: { gte: exit },
      },
    });

    if (splitRule) {
      // Calcular quantos meses restantes dentro da regra
      const ruleEndDate = new Date(splitRule.endDate);
      const monthsInRule = monthDiff(exit, ruleEndDate);

      // Valor que o investidor deveria receber = meses restantes * valor mensal
      // (considerando o ownerShare que vai para o investidor)
      const ownerShare = Number(contract.ownerShare || 0.85);
      const monthlyInvestorValue = round2(monthlyRent * ownerShare);
      investorTotalOwed = round2(monthlyInvestorValue * monthsInRule);

      investorId = splitRule.recipientId;
      p2pListingId = p2pListing.id;

      logger.info(`[Termination] Investor Total Owed: R$ ${investorTotalOwed} (${monthsInRule} months @ R$ ${monthlyInvestorValue})`);
    }
  }

  // 7. Distribuição: Multa -> Investidor
  const investorPayout = hasInvestor ? Math.min(proportionalFine, investorTotalOwed) : 0;

  // 8. Déficit: Se multa não cobre, proprietário paga
  const hasShortfall = hasInvestor && proportionalFine < investorTotalOwed;
  const ownerDebt = hasShortfall ? round2(investorTotalOwed - proportionalFine) : 0;

  if (hasShortfall) {
    logger.warn(`[Termination] SHORTFALL: Owner must pay R$ ${ownerDebt} to cover investor`);
  }

  const calculation: TerminationCalculation = {
    contractId,
    contractStartDate: startDate,
    contractEndDate: endDate,
    exitDate: exit,

    monthlyRent,
    totalDurationMonths,
    elapsedMonths,
    remainingMonths,

    baseFineMonths,
    baseFineValue,
    proportionalFine,

    investorTotalOwed,
    investorPayout,

    hasShortfall,
    ownerDebt,

    p2pListingId,
    investorId,
    ownerId: contract.property.owner?.id,
  };

  logger.info(`[Termination] Calculation complete: Fine R$ ${proportionalFine}, Investor Payout R$ ${investorPayout}, Owner Debt R$ ${ownerDebt}`);

  return calculation;
};

// ============================================
// SIMULAÇÃO (Sem criar cobranças)
// ============================================

/**
 * Simula o cálculo de rescisão sem executar ações
 * Útil para preview no frontend antes de confirmar
 */
export const simulateTermination = async (
  contractId: string,
  exitDate: Date,
  baseFineMonths: number = 3
): Promise<TerminationCalculation & { summary: string[] }> => {

  const calculation = await calculateTermination(contractId, exitDate, baseFineMonths);

  const summary: string[] = [
    `📋 Contrato: ${calculation.contractId.slice(0, 8)}...`,
    `📅 Duração: ${calculation.totalDurationMonths} meses (${calculation.elapsedMonths} cumpridos, ${calculation.remainingMonths} restantes)`,
    `💰 Aluguel Mensal: R$ ${calculation.monthlyRent.toFixed(2)}`,
    '',
    '--- MULTA RESCISÓRIA (Lei 8.245/91) ---',
    `Base: ${calculation.baseFineMonths} meses = R$ ${calculation.baseFineValue.toFixed(2)}`,
    `Proporcional: (${calculation.remainingMonths}/${calculation.totalDurationMonths}) = R$ ${calculation.proportionalFine.toFixed(2)}`,
    '',
  ];

  if (calculation.investorId) {
    summary.push('--- PROTEÇÃO AO INVESTIDOR ---');
    summary.push(`Total devido ao Investidor: R$ ${calculation.investorTotalOwed.toFixed(2)}`);
    summary.push(`Multa vai para Investidor: R$ ${calculation.investorPayout.toFixed(2)}`);

    if (calculation.hasShortfall) {
      summary.push('');
      summary.push('⚠️ DÉFICIT IDENTIFICADO');
      summary.push(`Coobrigação do Proprietário: R$ ${calculation.ownerDebt.toFixed(2)}`);
      summary.push('O proprietário será cobrado pela diferença.');
    } else {
      summary.push('');
      summary.push('✅ Multa cobre o investimento. Sem débito para o proprietário.');
    }
  } else {
    summary.push('ℹ️ Contrato sem cessão P2P. Multa segue para o proprietário.');
  }

  return { ...calculation, summary };
};

// ============================================
// EXECUÇÃO DA RESCISÃO
// ============================================

/**
 * Executa a rescisão do contrato
 * - Atualiza status do contrato para TERMINATED
 * - Gera cobrança da multa ao inquilino
 * - Gera cobrança do déficit ao proprietário (se aplicável)
 * - Desativa regras de split P2P
 */
export const executeTermination = async (
  contractId: string,
  exitDate: Date,
  baseFineMonths: number = 3
): Promise<TerminationResult> => {

  logger.info(`[Termination] EXECUTING termination for contract ${contractId}`);

  try {
    // 1. Calcular valores
    const calculation = await calculateTermination(contractId, exitDate, baseFineMonths);

    // 2. Buscar contrato completo
    const contract = await prisma.rentContract.findUnique({
      where: { id: contractId },
      include: {
        property: true,
      },
    });

    if (!contract) {
      throw new Error('Contrato não encontrado');
    }

    // 3. Atualizar status do contrato para TERMINATED
    await prisma.rentContract.update({
      where: { id: contractId },
      data: {
        status: 'TERMINATED',
        // Guardar dados da rescisão no snapshot
        financialSnapshot: {
          ...(contract.financialSnapshot as object || {}),
          terminatedAt: new Date().toISOString(),
          terminationExitDate: exitDate.toISOString(),
          terminationFine: calculation.proportionalFine,
          terminationInvestorPayout: calculation.investorPayout,
          terminationOwnerDebt: calculation.ownerDebt,
        },
      },
    });

    logger.info(`[Termination] Contract ${contractId} status updated to TERMINATED`);

    // 4. Desativar regras de split P2P
    if (calculation.p2pListingId) {
      await prisma.contractSplitRule.updateMany({
        where: {
          contractId: contractId,
          isActive: true,
          sourceType: 'P2P_SALE',
        },
        data: {
          isActive: false,
          // endDate: exitDate, // Encerrar na data de saída
        },
      });

      logger.info(`[Termination] P2P split rules deactivated for contract ${contractId}`);
    }

    // 5. Atualizar status da propriedade para AVAILABLE
    await prisma.property.update({
      where: { id: contract.propertyId },
      data: { status: 'AVAILABLE' },
    });

    logger.info(`[Termination] Property ${contract.propertyId} status updated to AVAILABLE`);

    // 6. Buscar PIX do investidor (se houver)
    let investorPixKey: string | undefined;
    if (calculation.investorId) {
      const investor = await prisma.user.findUnique({
        where: { id: calculation.investorId },
        select: { pixKey: true },
      });
      investorPixKey = investor?.pixKey || undefined;
    }

    // 7. Gerar cobranças via Asaas
    let tenantBillId: string | undefined;
    let ownerBillId: string | undefined;

    // 7.1 Cobrança da multa ao inquilino
    if (calculation.proportionalFine > 0) {
      const fineCharge = await createTerminationFineCharge(
        contract,
        calculation.proportionalFine,
        investorPixKey
      );
      tenantBillId = fineCharge?.id;
    }

    // 7.2 Cobrança do déficit ao proprietário (se hasShortfall)
    if (calculation.hasShortfall && calculation.ownerDebt > 0 && calculation.ownerId) {
      const owner = await prisma.user.findUnique({
        where: { id: calculation.ownerId },
        select: {
          id: true,
          name: true,
          cpf: true,
          email: true,
          phone: true,
          pixKey: true,
        },
      });

      if (owner) {
        const debtCharge = await createOwnerDebtCharge(
          contractId,
          owner,
          calculation.ownerDebt,
          investorPixKey
        );
        ownerBillId = debtCharge?.id;
      }
    }

    return {
      success: true,
      calculation,
      tenantBillId,
      ownerBillId,
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`[Termination] FAILED: ${errorMessage}`);

    return {
      success: false,
      calculation: {} as TerminationCalculation,
      error: errorMessage,
    };
  }
};

// ============================================
// EXPORT DEFAULT
// ============================================

export default {
  calculateTermination,
  simulateTermination,
  executeTermination,
};
