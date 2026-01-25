// ============================================
// ASAAS SPLIT ENGINE V4 - GROSS-UP LOGIC
// Lógica de precificação INVERSA (Regra de Três)
// ============================================
//
// FÓRMULA MATEMÁTICA:
// 1. Base Imobiliária ($V) = contract.rentValue (o que o proprietário pediu)
// 2. Valor Total Cobrado ($VT) = $V / 0.85 (Gross-Up para 100%)
// 3. Delta Ecossistema ($E) = $VT - $V (Os 15% que financiam o sistema)
//
// DISTRIBUIÇÃO DO DELTA ($E):
// - Se KYC <= 80: Paga Garantidor (5% de $VT) + Seguradora + Vínculo
// - Se KYC > 80 (Prime): Garantidor = R$ 0. Paga Seguradora + Vínculo (Lucro Máximo)
//
// ============================================
import axios from 'axios';
import crypto from 'crypto';
import { prisma } from '../lib/prisma.js';
import { config } from '../config/index.js';
import { logger } from '../lib/logger.js';
// ============================================
// CONSTANTS - WALLET IDs
// ============================================
// Carteiras do Ecossistema (configurar no Asaas)
const WALLET_VINCULO = process.env.ASAAS_WALLET_VINCULO || 'WALLET_VINCULO_MAIN';
const WALLET_GARANTIDORA = process.env.ASAAS_WALLET_GARANTIDORA || 'WALLET_PARCEIRO_LIQUIDEZ';
const WALLET_SEGURADORA = process.env.ASAAS_WALLET_SEGURADORA || 'WALLET_PARCEIRO_FIANCA';
// Custo fixo do Seguro Fiança (pode ser configurável por contrato)
const DEFAULT_SURETY_COST = 30.00; // R$ 30,00 por mês
// Percentuais do sistema
const OWNER_BASE_PERCENTAGE = 0.85; // 85% = Base Imobiliária
const GUARANTOR_PERCENTAGE = 0.05; // 5% do VT para garantidor (quando aplicável)
const AGENCY_COMMISSION_RATE = 0.10; // 10% da parte imobiliária para imobiliária
// ============================================
// HELPERS
// ============================================
// Descriptografar chaves do banco
const decrypt = (encryptedText) => {
    try {
        const [ivHex, encrypted] = encryptedText.split(':');
        if (!ivHex || !encrypted)
            return encryptedText;
        const iv = Buffer.from(ivHex, 'hex');
        const key = Buffer.from(config.encryptionKey.padEnd(32, '0').slice(0, 32));
        const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }
    catch {
        return encryptedText;
    }
};
// Buscar API Key do Asaas do banco
const getAsaasAPIKey = async () => {
    try {
        const configRecord = await prisma.systemConfig.findUnique({
            where: { key: 'ASAAS_API_KEY' }
        });
        if (configRecord?.value) {
            return configRecord.encrypted ? decrypt(configRecord.value) : configRecord.value;
        }
        // Fallback para variável de ambiente
        if (process.env.ASAAS_API_KEY) {
            return process.env.ASAAS_API_KEY;
        }
        throw new Error('ASAAS_API_KEY não configurado. Configure em /admin/integrations');
    }
    catch (error) {
        logger.error(`Failed to get Asaas API Key: ${error instanceof Error ? error.message : String(error)}`);
        throw error;
    }
};
// Criar cliente HTTP do Asaas
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
// Arredondar para 2 casas decimais
const round2 = (value) => Number(value.toFixed(2));
// ============================================
// CORE: CÁLCULO DO WATERFALL (GROSS-UP)
// ============================================
/**
 * Calcula a distribuição de pagamentos usando a lógica Gross-Up
 * O valor no banco (rentValue) é os 85%. O inquilino paga 100%.
 */
export const calculateWaterfall = (baseValue, kycScore = 0, suretyCost = DEFAULT_SURETY_COST, agencyRate = AGENCY_COMMISSION_RATE) => {
    // === PASSO 1: GROSS-UP (Regra de Três Inversa) ===
    // Se V é 85%, quanto é 100%?
    // VT = V / 0.85
    const V = baseValue;
    const VT = round2(V / OWNER_BASE_PERCENTAGE);
    const ecosystemPot = round2(VT - V); // Os 15%
    logger.info(`[Waterfall] Base (V): R$ ${V} | Total (VT): R$ ${VT} | Delta (E): R$ ${ecosystemPot}`);
    // === PASSO 2: DISTRIBUIÇÃO DO DELTA (ECOSSISTEMA) ===
    let guarantorShare = 0;
    let vinculoShare = 0;
    const isPrime = kycScore > 80;
    if (isPrime) {
        // CENÁRIO PRIME: Sem Garantidor Externo
        // Vínculo absorve a margem do garantidor
        logger.info(`[Waterfall] Cliente PRIME (Score ${kycScore}). Margem total para Vínculo.`);
        guarantorShare = 0;
        // Vínculo pega tudo o que sobrar depois de pagar a Seguradora
        vinculoShare = round2(ecosystemPot - suretyCost);
    }
    else {
        // CENÁRIO PADRÃO: Com Garantidor
        // Garantidor leva 5% do VALOR TOTAL (VT), não do Delta
        guarantorShare = round2(VT * GUARANTOR_PERCENTAGE);
        logger.info(`[Waterfall] Risco Padrão (Score ${kycScore}). Garantidor: R$ ${guarantorShare}`);
        // Vínculo pega o que sobrar do Delta
        // Delta - Garantidor - Seguradora
        vinculoShare = round2(ecosystemPot - guarantorShare - suretyCost);
    }
    // Trava de segurança (Vínculo nunca paga a conta)
    if (vinculoShare < 0) {
        logger.warn('[Waterfall] ALERTA: Custo do Garantidor + Seguradora > 15%. Ajustando...');
        vinculoShare = 0;
    }
    // === PASSO 3: SPLIT IMOBILIÁRIO (DENTRO DOS 85% / V) ===
    // Aqui usamos V, pois V já é os 85% limpos
    const agencyShare = round2(V * agencyRate);
    const ownerShare = round2(V - agencyShare);
    logger.info(`[Waterfall] Split Imobiliário: Agência R$ ${agencyShare} | Proprietário R$ ${ownerShare}`);
    logger.info(`[Waterfall] Split Ecossistema: Garantidor R$ ${guarantorShare} | Seguro R$ ${suretyCost} | Vínculo R$ ${vinculoShare}`);
    return {
        baseValue: V,
        totalValue: VT,
        ecosystemPot,
        guarantorShare,
        suretyShare: suretyCost,
        vinculoShare,
        agencyShare,
        ownerShare,
        isPrime,
        kycScore,
    };
};
// ============================================
// MAIN: CRIAR COBRANÇA COM SPLIT AUTOMÁTICO
// ============================================
/**
 * Cria uma cobrança no Asaas com Split automático (Waterfall)
 * ATUALIZADO: Suporta garantidores e seguradoras dinâmicas por contrato
 * @param contractId - ID do contrato de locação
 * @returns Dados da cobrança criada
 */
export const createWaterfallCharge = async (contractId) => {
    const api = await createAsaasClient();
    // 1. Buscar contrato com todos os relacionamentos (incluindo garantidores e regras P2P)
    const contract = await prisma.rentContract.findUnique({
        where: { id: contractId },
        include: {
            // Garantidores do contrato (podem ser vários: garantidor de liquidez, seguradora, etc.)
            guarantors: {
                where: { status: 'APPROVED' },
                select: {
                    id: true,
                    type: true,
                    name: true,
                    pixKey: true,
                    asaasWalletId: true,
                    feePercentage: true,
                    fixedFee: true,
                },
            },
            property: {
                include: {
                    owner: { select: { id: true, name: true, pixKey: true } },
                    agency: {
                        include: {
                            users: {
                                where: { role: { slug: { in: ['admin', 'agency-owner'] } } },
                                take: 1,
                                select: { pixKey: true },
                            },
                        },
                    },
                },
            },
        },
    });
    // 1.1 BUSCA REGRA P2P ATIVA (Cessão de Crédito)
    // Se o aluguel foi vendido para um investidor, o pagamento vai para ele
    const p2pSplitRule = await prisma.contractSplitRule.findFirst({
        where: {
            contractId: contractId,
            isActive: true,
            sourceType: 'P2P_SALE',
            startDate: { lte: new Date() },
            endDate: { gte: new Date() },
        },
        orderBy: { createdAt: 'desc' },
    });
    if (!contract) {
        throw new Error('Contrato não encontrado');
    }
    // 2. Buscar ou criar customer no Asaas
    let asaasCustomerId = contract.asaasCustomerId;
    if (!asaasCustomerId) {
        // Criar customer
        const customerRes = await api.post('/customers', {
            name: contract.tenantName,
            cpfCnpj: contract.tenantCpf.replace(/\D/g, ''),
            email: contract.tenantEmail,
            phone: contract.tenantPhone?.replace(/\D/g, ''),
        });
        asaasCustomerId = customerRes.data.id;
        // Salvar no contrato
        await prisma.rentContract.update({
            where: { id: contractId },
            data: { financialSnapshot: { asaasCustomerId } },
        });
    }
    // 3. Separar garantidores por tipo
    // INDIVIDUAL = Garantidor de Liquidez (pessoa física ou empresa que garante)
    // COMPANY = Seguradora (empresa de seguro fiança)
    // COLLATERAL = Imóvel usado como colateral
    const liquidityGuarantor = contract.guarantors.find(g => g.type === 'INDIVIDUAL' || g.type === 'COLLATERAL');
    const insuranceCompany = contract.guarantors.find(g => g.type === 'COMPANY');
    // 4. Calcular custos baseados nos garantidores do contrato
    const V = Number(contract.rentValue);
    const kycScore = contract.financialSnapshot?.kycScore || 0;
    // Custo da seguradora: usa o fixedFee do garantidor tipo COMPANY, ou fallback
    const suretyCost = insuranceCompany?.fixedFee
        ? Number(insuranceCompany.fixedFee)
        : contract.financialSnapshot?.suretyBondValue || DEFAULT_SURETY_COST;
    const agencyRate = contract.property.agency?.commissionRate
        ? Number(contract.property.agency.commissionRate) / 100
        : AGENCY_COMMISSION_RATE;
    // 5. Calcular Waterfall
    const waterfall = calculateWaterfall(V, kycScore, suretyCost, agencyRate);
    // 6. Montar array de splits com garantidores DINÂMICOS
    const splits = [];
    // --- GARANTIDOR DE LIQUIDEZ (Dinâmico) ---
    if (waterfall.guarantorShare > 0 && liquidityGuarantor) {
        // Usa o PIX/Wallet do garantidor específico deste contrato
        const guarantorWallet = liquidityGuarantor.asaasWalletId || liquidityGuarantor.pixKey;
        if (guarantorWallet) {
            splits.push({
                walletId: guarantorWallet,
                fixedValue: waterfall.guarantorShare,
                description: `Garantidor: ${liquidityGuarantor.name}`,
            });
            logger.info(`[Waterfall] Garantidor dinâmico: ${liquidityGuarantor.name} (${guarantorWallet}) = R$ ${waterfall.guarantorShare}`);
        }
        else {
            // Fallback para wallet padrão se não tiver PIX configurado
            splits.push({
                walletId: WALLET_GARANTIDORA,
                fixedValue: waterfall.guarantorShare,
                description: 'Garantidor de Liquidez (Pool)',
            });
            logger.warn(`[Waterfall] Garantidor ${liquidityGuarantor.name} sem PIX, usando pool padrão`);
        }
    }
    else if (waterfall.guarantorShare > 0) {
        // Sem garantidor específico, usa o pool padrão
        splits.push({
            walletId: WALLET_GARANTIDORA,
            fixedValue: waterfall.guarantorShare,
            description: 'Garantidor de Liquidez (Pool)',
        });
    }
    // --- SEGURADORA (Dinâmica) ---
    if (waterfall.suretyShare > 0 && insuranceCompany) {
        // Usa o PIX/Wallet da seguradora específica deste contrato
        const insurerWallet = insuranceCompany.asaasWalletId || insuranceCompany.pixKey;
        if (insurerWallet) {
            splits.push({
                walletId: insurerWallet,
                fixedValue: waterfall.suretyShare,
                description: `Seguro Fiança: ${insuranceCompany.name}`,
            });
            logger.info(`[Waterfall] Seguradora dinâmica: ${insuranceCompany.name} (${insurerWallet}) = R$ ${waterfall.suretyShare}`);
        }
        else {
            // Fallback para wallet padrão
            splits.push({
                walletId: WALLET_SEGURADORA,
                fixedValue: waterfall.suretyShare,
                description: 'Seguro Fiança (Pool)',
            });
            logger.warn(`[Waterfall] Seguradora ${insuranceCompany.name} sem PIX, usando pool padrão`);
        }
    }
    else if (waterfall.suretyShare > 0) {
        // Sem seguradora específica, usa o pool padrão
        splits.push({
            walletId: WALLET_SEGURADORA,
            fixedValue: waterfall.suretyShare,
            description: 'Seguro Fiança (Pool)',
        });
    }
    // --- VÍNCULO (Plataforma) ---
    if (waterfall.vinculoShare > 0) {
        splits.push({
            walletId: WALLET_VINCULO,
            fixedValue: waterfall.vinculoShare,
            description: 'Taxa Plataforma Vínculo',
        });
    }
    // --- IMOBILIÁRIO ---
    const agencyPixKey = contract.property.agency?.users?.[0]?.pixKey;
    const ownerPixKey = contract.property.owner?.pixKey;
    if (agencyPixKey && waterfall.agencyShare > 0) {
        splits.push({
            walletId: agencyPixKey,
            fixedValue: waterfall.agencyShare,
            description: `Comissão ${contract.property.agency?.name || 'Imobiliária'}`,
        });
    }
    // ============================================
    // INTEGRAÇÃO P2P - CESSÃO DE CRÉDITO DIGITAL
    // ============================================
    // Se existe uma regra P2P ativa, o repasse vai para o INVESTIDOR
    // que comprou os recebíveis, não mais para o proprietário original.
    // A Agência SEMPRE recebe a comissão, mesmo após cessão.
    // ============================================
    // Determinar beneficiário principal (Proprietário OU Investidor P2P)
    let beneficiaryWalletId = ownerPixKey;
    let beneficiaryName = contract.property.owner?.name || 'Proprietário';
    if (p2pSplitRule && (p2pSplitRule.recipientWalletId || p2pSplitRule.recipientPixKey)) {
        // ALUGUEL FOI VENDIDO! Redireciona para o investidor
        beneficiaryWalletId = p2pSplitRule.recipientWalletId || p2pSplitRule.recipientPixKey;
        beneficiaryName = `Investidor P2P (Rule: ${p2pSplitRule.id.slice(0, 8)})`;
        logger.info(`🔀 [P2P] Pagamento REDIRECIONADO para Investidor!`);
        logger.info(`🔀 [P2P] Rule ID: ${p2pSplitRule.id}`);
        logger.info(`🔀 [P2P] Beneficiário: ${beneficiaryWalletId}`);
        logger.info(`🔀 [P2P] Valor: R$ ${waterfall.ownerShare}`);
    }
    // Repasse para beneficiário principal (Proprietário ou Investidor P2P)
    if (beneficiaryWalletId && waterfall.ownerShare > 0) {
        splits.push({
            walletId: beneficiaryWalletId,
            fixedValue: waterfall.ownerShare,
            description: `Repasse ${beneficiaryName}`,
        });
    }
    // 7. Ajuste de arredondamento (centavos sempre vão para Vínculo)
    const totalSplit = splits.reduce((acc, s) => acc + s.fixedValue, 0);
    const diff = round2(waterfall.totalValue - totalSplit);
    if (Math.abs(diff) > 0.01) {
        const vinculoIndex = splits.findIndex(s => s.walletId === WALLET_VINCULO);
        if (vinculoIndex >= 0) {
            splits[vinculoIndex].fixedValue = round2(splits[vinculoIndex].fixedValue + diff);
        }
        else if (diff > 0) {
            // Se não tem Vínculo no split, adicionar
            splits.push({
                walletId: WALLET_VINCULO,
                fixedValue: diff,
                description: 'Ajuste de arredondamento',
            });
        }
    }
    // 7. Montar payload do Asaas
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 3); // Vence em 3 dias
    const payload = {
        customer: asaasCustomerId,
        billingType: 'PIX',
        value: waterfall.totalValue, // Cobra o Valor Cheio (100%)
        dueDate: dueDate.toISOString().split('T')[0],
        description: `Aluguel Vínculo #${contract.id.slice(0, 6)} - ${contract.property.title || 'Imóvel'}`,
        externalReference: contract.id,
        split: splits.map(s => ({
            walletId: s.walletId,
            fixedValue: s.fixedValue,
        })),
    };
    logger.info(`[Asaas] Creating charge for contract ${contractId}`);
    logger.info(`[Asaas] Total: R$ ${payload.value} | Splits: ${splits.length}`);
    // 8. Criar cobrança
    try {
        const res = await api.post('/payments', payload);
        // 9. Salvar payment no banco
        await prisma.payment.create({
            data: {
                contractId,
                type: 'RENT',
                status: 'PENDING',
                amount: waterfall.totalValue,
                dueDate,
                gatewayId: res.data.id,
                gatewayProvider: 'asaas',
                paymentMethod: 'pix',
                ownerAmount: waterfall.ownerShare,
                platformAmount: waterfall.vinculoShare,
                guarantorAmount: waterfall.guarantorShare,
                tokenAmount: 0,
            },
        });
        logger.info(`[Asaas] Charge created: ${res.data.id}`);
        return {
            id: res.data.id,
            invoiceUrl: res.data.invoiceUrl,
            pixCopiaECola: res.data.pixCopiaECola,
            value: res.data.value,
            dueDate: res.data.dueDate,
            status: res.data.status,
        };
    }
    catch (error) {
        const errorData = axios.isAxiosError(error) ? error.response?.data : error;
        logger.error(`[Asaas] Split Error: ${JSON.stringify(errorData)}`);
        throw new Error(`Asaas Split Error: ${JSON.stringify(errorData)}`);
    }
};
// ============================================
// UTILITY: SIMULAR CÁLCULO (SEM CRIAR COBRANÇA)
// ============================================
/**
 * Simula o cálculo do waterfall sem criar cobrança
 * Útil para preview no frontend
 */
export const simulateWaterfall = (rentValue, kycScore = 50, suretyCost = DEFAULT_SURETY_COST, agencyRate = AGENCY_COMMISSION_RATE) => {
    const calculation = calculateWaterfall(rentValue, kycScore, suretyCost, agencyRate);
    const breakdown = [
        `Base Imobiliária (V): R$ ${calculation.baseValue.toFixed(2)} (85%)`,
        `Valor Total Cobrado (VT): R$ ${calculation.totalValue.toFixed(2)} (100%)`,
        `Delta Ecossistema (E): R$ ${calculation.ecosystemPot.toFixed(2)} (15%)`,
        '',
        '--- Split Ecossistema ---',
        `Garantidor: R$ ${calculation.guarantorShare.toFixed(2)} ${calculation.isPrime ? '(ZERO - Cliente Prime)' : '(5% do VT)'}`,
        `Seguro Fiança: R$ ${calculation.suretyShare.toFixed(2)} (Fixo)`,
        `Vínculo: R$ ${calculation.vinculoShare.toFixed(2)} (Margem Líquida)`,
        '',
        '--- Split Imobiliário ---',
        `Imobiliária: R$ ${calculation.agencyShare.toFixed(2)} (${(agencyRate * 100).toFixed(0)}% da Base)`,
        `Proprietário: R$ ${calculation.ownerShare.toFixed(2)} (Líquido)`,
        '',
        `Cliente Prime: ${calculation.isPrime ? 'SIM' : 'NÃO'} (KYC Score: ${calculation.kycScore})`,
    ];
    return { ...calculation, breakdown };
};
// ============================================
// BULK: GERAR COBRANÇAS DO MÊS
// ============================================
/**
 * Gera cobranças para todos os contratos ativos
 */
export const generateMonthlyCharges = async (month, year) => {
    const contracts = await prisma.rentContract.findMany({
        where: { status: 'ACTIVE' },
        select: { id: true, dueDay: true },
    });
    let created = 0;
    let skipped = 0;
    const errors = [];
    for (const contract of contracts) {
        try {
            // Verificar se já existe cobrança para este mês
            const existing = await prisma.payment.findFirst({
                where: {
                    contractId: contract.id,
                    type: 'RENT',
                    dueDate: {
                        gte: new Date(year, month - 1, 1),
                        lt: new Date(year, month, 1),
                    },
                },
            });
            if (existing) {
                skipped++;
                continue;
            }
            await createWaterfallCharge(contract.id);
            created++;
        }
        catch (error) {
            const msg = error instanceof Error ? error.message : String(error);
            errors.push(`Contract ${contract.id}: ${msg}`);
        }
    }
    logger.info(`[Asaas] Monthly generation complete: ${created} created, ${skipped} skipped, ${errors.length} errors`);
    return { created, skipped, errors };
};
// ============================================
// EXPORT DEFAULT
// ============================================
export default {
    calculateWaterfall,
    createWaterfallCharge,
    simulateWaterfall,
    generateMonthlyCharges,
};
//# sourceMappingURL=asaas.service.js.map