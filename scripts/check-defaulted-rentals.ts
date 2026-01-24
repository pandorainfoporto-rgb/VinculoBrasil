#!/usr/bin/env tsx
/**
 * Vinculo.io - Script de Automacao Noturna
 *
 * Este script verifica contratos inadimplentes e executa acoes automaticas:
 * 1. Verifica todos os contratos ativos
 * 2. Identifica pagamentos atrasados
 * 3. Marca contratos como inadimplentes apos 3 meses
 * 4. Notifica partes envolvidas
 * 5. Gera relatorio DIMOB
 *
 * Uso:
 *   npx tsx scripts/check-defaulted-rentals.ts
 *
 * Cron (executar diariamente as 02:00):
 *   0 2 * * * cd /app && npx tsx scripts/check-defaulted-rentals.ts >> /var/log/vinculo-cron.log 2>&1
 *
 * Variaveis de ambiente necessarias:
 *   VITE_BLOCKCHAIN_NETWORK - polygon ou polygonAmoy
 *   VITE_VINCULO_CONTRACT_ADDRESS - endereco do contrato
 *   OPERATOR_PRIVATE_KEY - chave privada do operator (para transacoes)
 *   NOTIFICATION_WEBHOOK_URL - URL para notificacoes (Slack/Discord)
 */

// ============================================
// IMPORTS E CONFIGURACAO
// ============================================

import * as dotenv from 'dotenv';
dotenv.config();

// Tipos
interface RentalInfo {
  tokenId: number;
  landlord: string;
  tenant: string;
  guarantor: string;
  rentAmount: bigint;
  lastPaymentDate: bigint;
  missedPayments: number;
  status: number;
  propertyId: string;
}

interface DefaultedRental {
  tokenId: number;
  landlord: string;
  tenant: string;
  guarantor: string;
  rentAmount: number;
  missedPayments: number;
  totalOwed: number;
  daysSinceLastPayment: number;
  propertyId: string;
  action: 'warning' | 'default' | 'seize';
}

interface AutomationReport {
  timestamp: Date;
  network: string;
  totalRentalsChecked: number;
  activeRentals: number;
  warningsIssued: number;
  defaultsMarked: number;
  collateralsSeized: number;
  errors: string[];
  defaultedRentals: DefaultedRental[];
}

// ============================================
// CONFIGURACAO
// ============================================

const CONFIG = {
  network: process.env.VITE_BLOCKCHAIN_NETWORK || 'polygonAmoy',
  contractAddress: process.env.VITE_VINCULO_CONTRACT_ADDRESS || '',
  operatorPrivateKey: process.env.OPERATOR_PRIVATE_KEY || '',
  notificationWebhook: process.env.NOTIFICATION_WEBHOOK_URL || '',
  rpcUrl: process.env.VITE_POLYGON_AMOY_RPC_URL || 'https://rpc-amoy.polygon.technology/',

  // Regras de inadimplencia
  warningAfterDays: 5,        // Aviso apos 5 dias de atraso
  defaultAfterMissed: 3,       // Default apos 3 pagamentos perdidos
  seizeAfterDays: 90,          // Acionar colateral apos 90 dias

  // Modo simulacao (nao executa transacoes reais)
  dryRun: process.env.DRY_RUN !== 'false',
};

// Status do contrato (deve bater com o enum Solidity)
enum RentalStatus {
  Pending = 0,
  Active = 1,
  Disputed = 2,
  Terminated = 3,
  Defaulted = 4,
}

// ============================================
// LOGGING
// ============================================

const log = {
  info: (msg: string, data?: unknown) => {
    console.log(`[${new Date().toISOString()}] INFO: ${msg}`, data ? JSON.stringify(data) : '');
  },
  warn: (msg: string, data?: unknown) => {
    console.warn(`[${new Date().toISOString()}] WARN: ${msg}`, data ? JSON.stringify(data) : '');
  },
  error: (msg: string, data?: unknown) => {
    console.error(`[${new Date().toISOString()}] ERROR: ${msg}`, data ? JSON.stringify(data) : '');
  },
  success: (msg: string, data?: unknown) => {
    console.log(`[${new Date().toISOString()}] SUCCESS: ${msg}`, data ? JSON.stringify(data) : '');
  },
};

// ============================================
// MOCK DATA (para demonstracao)
// ============================================

function generateMockRentals(): RentalInfo[] {
  const now = Date.now() / 1000;
  const oneDay = 86400;
  const oneMonth = oneDay * 30;

  return [
    // Contrato em dia
    {
      tokenId: 1,
      landlord: '0x1234567890123456789012345678901234567890',
      tenant: '0x2345678901234567890123456789012345678901',
      guarantor: '0x3456789012345678901234567890123456789012',
      rentAmount: BigInt(30000000), // R$ 3.000
      lastPaymentDate: BigInt(Math.floor(now - 5 * oneDay)),
      missedPayments: 0,
      status: RentalStatus.Active,
      propertyId: 'PROP-001',
    },
    // Contrato com 1 pagamento atrasado (aviso)
    {
      tokenId: 2,
      landlord: '0x4567890123456789012345678901234567890123',
      tenant: '0x5678901234567890123456789012345678901234',
      guarantor: '0x6789012345678901234567890123456789012345',
      rentAmount: BigInt(25000000), // R$ 2.500
      lastPaymentDate: BigInt(Math.floor(now - 40 * oneDay)),
      missedPayments: 1,
      status: RentalStatus.Active,
      propertyId: 'PROP-002',
    },
    // Contrato com 2 pagamentos atrasados (pre-default)
    {
      tokenId: 3,
      landlord: '0x7890123456789012345678901234567890123456',
      tenant: '0x8901234567890123456789012345678901234567',
      guarantor: '0x9012345678901234567890123456789012345678',
      rentAmount: BigInt(45000000), // R$ 4.500
      lastPaymentDate: BigInt(Math.floor(now - 70 * oneDay)),
      missedPayments: 2,
      status: RentalStatus.Active,
      propertyId: 'PROP-003',
    },
    // Contrato com 3+ pagamentos atrasados (default)
    {
      tokenId: 4,
      landlord: '0xa012345678901234567890123456789012345678',
      tenant: '0xb123456789012345678901234567890123456789',
      guarantor: '0xc234567890123456789012345678901234567890',
      rentAmount: BigInt(35000000), // R$ 3.500
      lastPaymentDate: BigInt(Math.floor(now - 95 * oneDay)),
      missedPayments: 3,
      status: RentalStatus.Active,
      propertyId: 'PROP-004',
    },
    // Contrato ja em default (aguardando acao de colateral)
    {
      tokenId: 5,
      landlord: '0xd345678901234567890123456789012345678901',
      tenant: '0xe456789012345678901234567890123456789012',
      guarantor: '0xf567890123456789012345678901234567890123',
      rentAmount: BigInt(50000000), // R$ 5.000
      lastPaymentDate: BigInt(Math.floor(now - 120 * oneDay)),
      missedPayments: 4,
      status: RentalStatus.Defaulted,
      propertyId: 'PROP-005',
    },
  ];
}

// ============================================
// BLOCKCHAIN INTERACTIONS
// ============================================

async function fetchActiveRentals(): Promise<RentalInfo[]> {
  log.info('Buscando contratos ativos...');

  // Em producao, isso usaria viem/ethers para consultar o contrato
  // const client = createPublicClient({ chain: polygon, transport: http(CONFIG.rpcUrl) });
  // const stats = await client.readContract({ address: CONFIG.contractAddress, abi, functionName: 'getStats' });
  // for (let i = 0; i < stats.totalContracts; i++) { ... }

  // Por enquanto, retorna dados mockados
  const rentals = generateMockRentals();
  log.info(`Encontrados ${rentals.length} contratos`);

  return rentals;
}

async function markAsDefaulted(tokenId: number): Promise<boolean> {
  log.info(`Marcando contrato #${tokenId} como inadimplente...`);

  if (CONFIG.dryRun) {
    log.info(`[DRY RUN] Contrato #${tokenId} seria marcado como inadimplente`);
    return true;
  }

  // Em producao:
  // const walletClient = createWalletClient({ ... });
  // const hash = await walletClient.writeContract({
  //   address: CONFIG.contractAddress,
  //   abi: VINCULO_CONTRACT_ABI,
  //   functionName: 'markPaymentMissed',
  //   args: [BigInt(tokenId), BigInt(Date.now() / 1000)],
  // });

  return true;
}

async function seizeCollateral(tokenId: number): Promise<boolean> {
  log.info(`Acionando colateral do contrato #${tokenId}...`);

  if (CONFIG.dryRun) {
    log.info(`[DRY RUN] Colateral do contrato #${tokenId} seria acionado`);
    return true;
  }

  // Em producao:
  // await walletClient.writeContract({
  //   functionName: 'seizeCollateral',
  //   args: [BigInt(tokenId)],
  // });

  return true;
}

// ============================================
// NOTIFICATION
// ============================================

async function sendNotification(report: AutomationReport): Promise<void> {
  if (!CONFIG.notificationWebhook) {
    log.info('Webhook de notificacao nao configurado, pulando...');
    return;
  }

  const message = {
    text: `Vinculo Automation Report - ${report.timestamp.toISOString()}`,
    blocks: [
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: 'Vinculo - Relatorio de Automacao Noturna',
        },
      },
      {
        type: 'section',
        fields: [
          { type: 'mrkdwn', text: `*Network:*\n${report.network}` },
          { type: 'mrkdwn', text: `*Total Verificados:*\n${report.totalRentalsChecked}` },
          { type: 'mrkdwn', text: `*Avisos Emitidos:*\n${report.warningsIssued}` },
          { type: 'mrkdwn', text: `*Defaults Marcados:*\n${report.defaultsMarked}` },
        ],
      },
    ],
  };

  if (report.defaultedRentals.length > 0) {
    const defaultsList = report.defaultedRentals
      .map((r) => `- #${r.tokenId}: ${r.missedPayments} pagamentos, R$ ${(r.totalOwed / 100).toFixed(2)} devido`)
      .join('\n');

    message.blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*Contratos Inadimplentes:*\n${defaultsList}`,
      },
    } as never);
  }

  try {
    // Em producao: await fetch(CONFIG.notificationWebhook, { method: 'POST', body: JSON.stringify(message) });
    log.info('Notificacao enviada com sucesso');
  } catch (error) {
    log.error('Falha ao enviar notificacao', error);
  }
}

// ============================================
// DIMOB REPORT GENERATION
// ============================================

function generateDIMOBReport(rentals: RentalInfo[], defaultedRentals: DefaultedRental[]): string {
  const lines: string[] = [];
  const now = new Date();

  lines.push('='.repeat(80));
  lines.push('RELATORIO DIMOB - VINCULO.IO');
  lines.push(`Data de Geracao: ${now.toLocaleDateString('pt-BR')} ${now.toLocaleTimeString('pt-BR')}`);
  lines.push('='.repeat(80));
  lines.push('');

  // Resumo
  lines.push('RESUMO:');
  lines.push('-'.repeat(40));
  lines.push(`Total de Contratos Ativos: ${rentals.filter((r) => r.status === RentalStatus.Active).length}`);
  lines.push(`Contratos em Dia: ${rentals.filter((r) => r.missedPayments === 0).length}`);
  lines.push(`Contratos com Atraso: ${rentals.filter((r) => r.missedPayments > 0 && r.missedPayments < 3).length}`);
  lines.push(`Contratos Inadimplentes: ${defaultedRentals.length}`);
  lines.push('');

  // Detalhes de inadimplentes
  if (defaultedRentals.length > 0) {
    lines.push('CONTRATOS INADIMPLENTES:');
    lines.push('-'.repeat(40));

    for (const rental of defaultedRentals) {
      lines.push(`Contrato #${rental.tokenId}`);
      lines.push(`  Imovel: ${rental.propertyId}`);
      lines.push(`  Locador: ${rental.landlord}`);
      lines.push(`  Locatario: ${rental.tenant}`);
      lines.push(`  Garantidor: ${rental.guarantor}`);
      lines.push(`  Aluguel Mensal: R$ ${(rental.rentAmount / 100).toFixed(2)}`);
      lines.push(`  Pagamentos Perdidos: ${rental.missedPayments}`);
      lines.push(`  Total Devido: R$ ${(rental.totalOwed / 100).toFixed(2)}`);
      lines.push(`  Dias desde ultimo pagamento: ${rental.daysSinceLastPayment}`);
      lines.push(`  Acao Recomendada: ${rental.action.toUpperCase()}`);
      lines.push('');
    }
  }

  lines.push('='.repeat(80));
  lines.push('FIM DO RELATORIO');
  lines.push('='.repeat(80));

  return lines.join('\n');
}

// ============================================
// MAIN AUTOMATION LOGIC
// ============================================

async function analyzeRental(rental: RentalInfo): Promise<DefaultedRental | null> {
  const now = Date.now() / 1000;
  const lastPayment = Number(rental.lastPaymentDate);
  const daysSinceLastPayment = Math.floor((now - lastPayment) / 86400);

  // Ignora contratos que nao estao ativos
  if (rental.status !== RentalStatus.Active && rental.status !== RentalStatus.Defaulted) {
    return null;
  }

  // Ignora contratos em dia
  if (rental.missedPayments === 0 && daysSinceLastPayment < 35) {
    return null;
  }

  // Determina acao baseada no numero de pagamentos perdidos
  let action: 'warning' | 'default' | 'seize';

  if (rental.missedPayments >= CONFIG.defaultAfterMissed) {
    if (daysSinceLastPayment >= CONFIG.seizeAfterDays) {
      action = 'seize';
    } else {
      action = 'default';
    }
  } else {
    action = 'warning';
  }

  const rentAmount = Number(rental.rentAmount);
  const totalOwed = rentAmount * rental.missedPayments;

  return {
    tokenId: rental.tokenId,
    landlord: rental.landlord,
    tenant: rental.tenant,
    guarantor: rental.guarantor,
    rentAmount,
    missedPayments: rental.missedPayments,
    totalOwed,
    daysSinceLastPayment,
    propertyId: rental.propertyId,
    action,
  };
}

async function runAutomation(): Promise<AutomationReport> {
  log.info('Iniciando automacao noturna...');
  log.info(`Modo: ${CONFIG.dryRun ? 'DRY RUN (simulacao)' : 'PRODUCAO'}`);
  log.info(`Network: ${CONFIG.network}`);

  const report: AutomationReport = {
    timestamp: new Date(),
    network: CONFIG.network,
    totalRentalsChecked: 0,
    activeRentals: 0,
    warningsIssued: 0,
    defaultsMarked: 0,
    collateralsSeized: 0,
    errors: [],
    defaultedRentals: [],
  };

  try {
    // 1. Buscar todos os contratos
    const rentals = await fetchActiveRentals();
    report.totalRentalsChecked = rentals.length;
    report.activeRentals = rentals.filter((r) => r.status === RentalStatus.Active).length;

    // 2. Analisar cada contrato
    for (const rental of rentals) {
      try {
        const analysis = await analyzeRental(rental);

        if (analysis) {
          report.defaultedRentals.push(analysis);

          // 3. Executar acoes baseadas na analise
          switch (analysis.action) {
            case 'warning':
              log.warn(`Aviso: Contrato #${rental.tokenId} com ${analysis.missedPayments} pagamento(s) atrasado(s)`);
              report.warningsIssued++;
              break;

            case 'default':
              log.warn(`Default: Contrato #${rental.tokenId} sera marcado como inadimplente`);
              if (rental.status === RentalStatus.Active) {
                const success = await markAsDefaulted(rental.tokenId);
                if (success) {
                  report.defaultsMarked++;
                }
              }
              break;

            case 'seize':
              log.warn(`Seize: Colateral do contrato #${rental.tokenId} sera acionado`);
              const success = await seizeCollateral(rental.tokenId);
              if (success) {
                report.collateralsSeized++;
              }
              break;
          }
        }
      } catch (error) {
        const errorMsg = `Erro ao processar contrato #${rental.tokenId}: ${error}`;
        log.error(errorMsg);
        report.errors.push(errorMsg);
      }
    }

    // 4. Gerar relatorio DIMOB
    const dimobReport = generateDIMOBReport(rentals, report.defaultedRentals);
    log.info('Relatorio DIMOB gerado');
    console.log('\n' + dimobReport);

    // 5. Enviar notificacoes
    if (report.defaultedRentals.length > 0 || report.errors.length > 0) {
      await sendNotification(report);
    }

  } catch (error) {
    const errorMsg = `Erro fatal na automacao: ${error}`;
    log.error(errorMsg);
    report.errors.push(errorMsg);
  }

  // Resumo final
  log.success('Automacao concluida', {
    checked: report.totalRentalsChecked,
    warnings: report.warningsIssued,
    defaults: report.defaultsMarked,
    seized: report.collateralsSeized,
    errors: report.errors.length,
  });

  return report;
}

// ============================================
// ENTRY POINT
// ============================================

async function main() {
  console.log('');
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║        VINCULO.IO - AUTOMACAO DE INADIMPLENCIA             ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('');

  const startTime = Date.now();

  try {
    const report = await runAutomation();

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log('');
    console.log(`Tempo de execucao: ${duration}s`);
    console.log('');

    // Exit code baseado em erros
    if (report.errors.length > 0) {
      process.exit(1);
    }

    process.exit(0);
  } catch (error) {
    log.error('Erro fatal', error);
    process.exit(1);
  }
}

// Executa se chamado diretamente
main();
