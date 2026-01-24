// ============================================
// SCRIPT: Adicionar Role INVESTOR
// Cria o papel de Investidor no sistema
// ============================================

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Adicionando role INVESTOR ao sistema...');

  // Verificar se já existe
  const existingRole = await prisma.role.findUnique({
    where: { slug: 'investor' },
  });

  if (existingRole) {
    console.log('✅ Role INVESTOR já existe!');
    console.log(`   ID: ${existingRole.id}`);
    console.log(`   Nome: ${existingRole.name}`);
    return;
  }

  // Criar o role INVESTOR
  const investorRole = await prisma.role.create({
    data: {
      name: 'Investidor',
      slug: 'investor',
      description: 'Investidor que compra recebíveis de aluguel no marketplace P2P',
      permissions: {
        // Permissões do Investidor
        canViewP2PListings: true,
        canBuyP2PListings: true,
        canViewInvestorDashboard: true,
        canManageInvestorProfile: true,
        canViewReceipts: true,
        canWithdrawFunds: true,
      },
      isSystem: true,
    },
  });

  console.log('✅ Role INVESTOR criado com sucesso!');
  console.log(`   ID: ${investorRole.id}`);
  console.log(`   Nome: ${investorRole.name}`);
  console.log(`   Slug: ${investorRole.slug}`);
  console.log('\n📌 Agora os usuários podem se cadastrar como investidores!');
}

main()
  .catch((error) => {
    console.error('❌ Erro ao adicionar role INVESTOR:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
