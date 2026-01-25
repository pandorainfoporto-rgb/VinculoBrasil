// ============================================
// SEED DE CONFIGURAÇÕES DO SISTEMA
// Popula o banco com endereços de contrato e configurações iniciais
// ============================================

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface SystemConfigSeed {
  key: string;
  value: string;
  label: string;
  description?: string;
  group: string;
  isSecret?: boolean;
}

async function main() {
  const configs: SystemConfigSeed[] = [
    // ============================================
    // BLOCKCHAIN - Endereços de Contratos
    // ============================================
    {
      key: 'SMART_CONTRACT_ADDRESS',
      value: '0x6748Cf729dc62bef157b40ABBd44365c2f12702a',
      label: 'Contrato Principal (Imóveis/ERC721)',
      description: 'Endereço do contrato VinculoRental para tokenização de contratos de aluguel',
      group: 'BLOCKCHAIN',
    },
    {
      key: 'RECEIVABLES_CONTRACT_ADDRESS',
      value: '0x4081D8c80bae80aB36AaE3e83082BE1083C32F9A',
      label: 'Contrato de Recebíveis (ERC1155)',
      description: 'Endereço do contrato VinculoReceivables para tokenização de recebíveis',
      group: 'BLOCKCHAIN',
    },
    {
      key: 'P2P_CONTRACT_ADDRESS',
      value: '0x8641445fD7079Bd439F137Aaec5D3b534bB608a0',
      label: 'Contrato Marketplace P2P',
      description: 'Endereço do contrato VinculoP2P para cessão de crédito digital',
      group: 'BLOCKCHAIN',
    },
    {
      key: 'POLYGON_RPC_URL',
      value: 'https://polygon-rpc.com',
      label: 'RPC Polygon Mainnet',
      description: 'URL do provedor RPC para a rede Polygon Mainnet',
      group: 'BLOCKCHAIN',
    },
    {
      key: 'POLYGON_CHAIN_ID',
      value: '137',
      label: 'Chain ID Polygon',
      description: 'ID da rede Polygon Mainnet',
      group: 'BLOCKCHAIN',
    },
    // ============================================
    // PAYMENT - Configurações de Pagamento
    // ============================================
    {
      key: 'ASAAS_API_URL',
      value: 'https://api.asaas.com/v3',
      label: 'URL API Asaas',
      description: 'URL base da API do Asaas (produção)',
      group: 'PAYMENT',
    },
    {
      key: 'ASAAS_API_KEY',
      value: '',
      label: 'Chave API Asaas',
      description: 'Chave de API do Asaas para integração de pagamentos',
      group: 'PAYMENT',
      isSecret: true,
    },
    {
      key: 'PLATFORM_FEE_PERCENT',
      value: '5',
      label: 'Taxa da Plataforma (%)',
      description: 'Percentual de taxa cobrado pela plataforma em cada transação',
      group: 'PAYMENT',
    },
    // ============================================
    // API - Integrações Externas
    // ============================================
    {
      key: 'GOOGLE_MAPS_API_KEY',
      value: '',
      label: 'Chave API Google Maps',
      description: 'Chave de API do Google Maps para geolocalização',
      group: 'API',
      isSecret: true,
    },
    {
      key: 'SENDGRID_API_KEY',
      value: '',
      label: 'Chave API SendGrid',
      description: 'Chave de API do SendGrid para envio de emails',
      group: 'API',
      isSecret: true,
    },
    // ============================================
    // SYSTEM - Configurações Gerais
    // ============================================
    {
      key: 'PLATFORM_NAME',
      value: 'Vínculo Brasil',
      label: 'Nome da Plataforma',
      description: 'Nome exibido em emails e interface',
      group: 'SYSTEM',
    },
    {
      key: 'SUPPORT_EMAIL',
      value: 'suporte@vinculobrasil.com',
      label: 'Email de Suporte',
      description: 'Email para contato de suporte',
      group: 'SYSTEM',
    },
  ];

  console.log('🔧 Iniciando seed de configurações do sistema...\n');

  for (const config of configs) {
    const result = await prisma.systemConfig.upsert({
      where: { key: config.key },
      update: {
        // Não atualiza o value se já existir (preserva configurações manuais)
        label: config.label,
        description: config.description,
        group: config.group,
        isSecret: config.isSecret || false,
      },
      create: {
        key: config.key,
        value: config.value,
        label: config.label,
        description: config.description,
        group: config.group,
        isSecret: config.isSecret || false,
      },
    });

    const icon = config.isSecret ? '🔒' : '✅';
    console.log(`${icon} [${config.group}] ${config.key}`);
  }

  console.log('\n✅ Configurações do sistema salvas no banco!');
  console.log('📌 Use a tela de Admin > Integrações para alterar os valores.');
}

main()
  .catch((e) => {
    console.error('❌ Erro ao executar seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
