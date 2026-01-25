/**
 * Script de Resgate - Cria usuário Admin inicial
 * Executar: npx tsx server/src/scripts/create-admin.ts
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🔧 Criando Admin de Resgate...');

  // Hash da senha
  const password = await bcrypt.hash('Mudar123!', 10);

  // Tenta criar a Agência Fatto (se não existir)
  const agency = await prisma.agency.upsert({
    where: { slug: 'fatto' },
    update: {},
    create: {
      name: 'Fatto Imóveis',
      slug: 'fatto',
      cnpj: '00.000.000/0001-00',
      primaryColor: '#000000',
      secondaryColor: '#ffffff',
      isActive: true
    }
  });

  console.log('✅ Agência criada/encontrada:', agency.name);

  // Cria/Atualiza o Usuário
  const user = await prisma.user.upsert({
    where: { email: 'renato@fatto.com' },
    update: {
      password,
      role: 'AGENCY_ADMIN',
      agencyId: agency.id
    },
    create: {
      email: 'renato@fatto.com',
      name: 'Renato Fatto',
      password,
      role: 'AGENCY_ADMIN',
      agencyId: agency.id
    }
  });

  console.log('✅ Usuário criado/atualizado:', user.email);
  console.log('');
  console.log('========================================');
  console.log('🔑 CREDENCIAIS DE ACESSO:');
  console.log('   Email: renato@fatto.com');
  console.log('   Senha: Mudar123!');
  console.log('========================================');
}

main()
  .catch(e => {
    console.error('❌ Erro:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
