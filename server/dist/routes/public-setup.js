// ============================================
// PUBLIC SETUP ROUTES - SEM AUTENTICAÇÃO
// ============================================
// ATENÇÃO: Remova este arquivo após o setup inicial!
import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
const router = Router();
const prisma = new PrismaClient();
// Rota de força-bruta para criar admin
// Acesse: GET /api/public/force-seed
router.get('/force-seed', async (_req, res) => {
    try {
        console.log('[FORCE-SEED] Iniciando seed de emergência...');
        // 1. Buscar ou criar Role de Super Admin
        let superAdminRole = await prisma.role.findFirst({
            where: { slug: 'super-admin' },
        });
        if (!superAdminRole) {
            superAdminRole = await prisma.role.create({
                data: {
                    name: 'Super Admin',
                    slug: 'super-admin',
                    description: 'Administrador Master do Sistema',
                    permissions: ['*'],
                    isSystem: true,
                },
            });
            console.log('[FORCE-SEED] Role super-admin criada');
        }
        // 2. Cria a Agência Fatto
        const agency = await prisma.agency.upsert({
            where: { slug: 'fatto-imoveis' },
            update: {},
            create: {
                name: 'Fatto Imóveis',
                slug: 'fatto-imoveis',
                cnpj: '12.345.678/0001-99',
                primaryColor: '#000000',
                secondaryColor: '#ffffff',
                active: true,
            },
        });
        console.log('[FORCE-SEED] Agência criada/encontrada:', agency.id);
        // 3. Cria o Admin
        const password = await bcrypt.hash('Fatto2026!', 10);
        const user = await prisma.user.upsert({
            where: { email: 'renato@fatto.com' },
            update: {
                passwordHash: password,
                roleId: superAdminRole.id,
                agencyId: agency.id,
                status: 'ACTIVE',
            },
            create: {
                name: 'Renato Fatto',
                email: 'renato@fatto.com',
                passwordHash: password,
                roleId: superAdminRole.id,
                agencyId: agency.id,
                status: 'ACTIVE',
                emailVerified: true,
            },
        });
        console.log('[FORCE-SEED] Usuário criado/atualizado:', user.id);
        return res.json({
            status: 'SUCESSO',
            msg: 'Banco Semeado! Usuário criado com sucesso.',
            login: 'renato@fatto.com',
            senha: 'Fatto2026!',
            agencyId: agency.id,
            userId: user.id,
            roleId: superAdminRole.id,
            instrucoes: 'Agora vá para /auth/login e use essas credenciais. REMOVA ESTA ROTA APÓS O SETUP!',
        });
    }
    catch (e) {
        console.error('[FORCE-SEED] Erro:', e);
        const message = e instanceof Error ? e.message : String(e);
        return res.status(500).json({ error: message });
    }
});
// Health check público
router.get('/health', async (_req, res) => {
    try {
        await prisma.$queryRaw `SELECT 1`;
        return res.json({ status: 'ok', database: 'connected' });
    }
    catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        return res.status(500).json({ status: 'error', database: 'disconnected', error: message });
    }
});
// ============================================
// SEED DE TODOS OS USUÁRIOS DE TESTE
// ============================================
router.get('/seed-test-users', async (_req, res) => {
    try {
        console.log('🏗️ Iniciando Seed Completo de Usuários de Teste...');
        const logs = [];
        // 1. Definição dos Cargos Necessários
        const rolesToEnsure = [
            { name: 'Super Admin', slug: 'super-admin', description: 'Administrador Master do Sistema', permissions: ['*'], isSystem: true },
            { name: 'Inquilino', slug: 'tenant', description: 'Usuário Inquilino', permissions: ['tenant:*'], isSystem: false },
            { name: 'Proprietário', slug: 'landlord', description: 'Proprietário de Imóvel', permissions: ['landlord:*'], isSystem: false },
            { name: 'Garantidor', slug: 'guarantor', description: 'Garantidor de Contrato', permissions: ['guarantor:*'], isSystem: false },
            { name: 'Seguradora', slug: 'insurer', description: 'Empresa Seguradora', permissions: ['insurer:*'], isSystem: false },
            { name: 'Admin Imobiliária', slug: 'agency-admin', description: 'Administrador de Imobiliária', permissions: ['agency:*'], isSystem: false }
        ];
        // Garante que os cargos existem
        for (const r of rolesToEnsure) {
            await prisma.role.upsert({
                where: { slug: r.slug },
                update: {},
                create: {
                    name: r.name,
                    slug: r.slug,
                    description: r.description,
                    permissions: r.permissions,
                    isSystem: r.isSystem
                }
            });
        }
        logs.push('✅ Cargos verificados/criados: ' + rolesToEnsure.map(r => r.slug).join(', '));
        // 2. Garante uma Imobiliária de Teste para o usuário "Imobiliária"
        const agency = await prisma.agency.upsert({
            where: { slug: 'imobiliaria-teste' },
            update: {},
            create: {
                name: 'Imobiliária Teste Ltda',
                slug: 'imobiliaria-teste',
                cnpj: '99.999.999/0001-99',
                active: true,
                primaryColor: '#0000ff',
                secondaryColor: '#ffffff'
            }
        });
        logs.push('✅ Imobiliária de Teste criada: ' + agency.name);
        // 3. Definição dos Usuários
        const usersToCreate = [
            {
                email: 'renato@vinculobrasil.com.br',
                password: 'VinculoAdmin2024!',
                name: 'Renato Admin',
                roleSlug: 'super-admin',
                agencyId: null
            },
            {
                email: 'inquilino.teste@vinculobrasil.com.br',
                password: 'InquilinoTeste2024!',
                name: 'Inquilino Teste',
                roleSlug: 'tenant',
                agencyId: null
            },
            {
                email: 'proprietario.teste@vinculobrasil.com.br',
                password: 'ProprietarioTeste2024!',
                name: 'Proprietário Teste',
                roleSlug: 'landlord',
                agencyId: null
            },
            {
                email: 'garantidor.teste@vinculobrasil.com.br',
                password: 'GarantidorTeste2024!',
                name: 'Garantidor Teste',
                roleSlug: 'guarantor',
                agencyId: null
            },
            {
                email: 'seguradora.teste@vinculobrasil.com.br',
                password: 'SeguradoraTeste2024!',
                name: 'Seguradora Teste',
                roleSlug: 'insurer',
                agencyId: null
            },
            {
                email: 'imobiliaria.teste@vinculobrasil.com.br',
                password: 'ImobiliariaTeste2024!',
                name: 'Imobiliária Teste',
                roleSlug: 'agency-admin',
                agencyId: agency.id
            }
        ];
        // 4. Criação/Atualização dos Usuários
        for (const u of usersToCreate) {
            const role = await prisma.role.findFirst({ where: { slug: u.roleSlug } });
            if (role) {
                const hashedPassword = await bcrypt.hash(u.password, 10);
                await prisma.user.upsert({
                    where: { email: u.email },
                    update: {
                        passwordHash: hashedPassword,
                        roleId: role.id,
                        agencyId: u.agencyId,
                        status: 'ACTIVE',
                        emailVerified: true
                    },
                    create: {
                        email: u.email,
                        name: u.name,
                        passwordHash: hashedPassword,
                        roleId: role.id,
                        agencyId: u.agencyId,
                        status: 'ACTIVE',
                        emailVerified: true
                    }
                });
                logs.push(`👤 Usuário criado/atualizado: ${u.email} (${u.roleSlug})`);
            }
        }
        console.log('✅ Seed completo finalizado!');
        return res.json({
            status: 'SUCESSO TOTAL 🚀',
            message: 'Todos os usuários de teste foram criados!',
            logs,
            usuarios: usersToCreate.map(u => ({
                email: u.email,
                senha: u.password,
                role: u.roleSlug
            }))
        });
    }
    catch (error) {
        console.error('[SEED-TEST-USERS] Erro:', error);
        const message = error instanceof Error ? error.message : String(error);
        return res.status(500).json({ error: message });
    }
});
// ============================================
// PROMOÇÃO PARA SUPER ADMIN
// ============================================
router.get('/promote-renato', async (_req, res) => {
    try {
        console.log('[PROMOTE] Iniciando promoção do Renato...');
        // 1. Busca o cargo de Super Admin
        let superRole = await prisma.role.findFirst({
            where: { slug: 'super-admin' }
        });
        if (!superRole) {
            console.log('[PROMOTE] Role super-admin não existe, criando...');
            superRole = await prisma.role.create({
                data: {
                    name: 'Super Admin',
                    slug: 'super-admin',
                    description: 'Administrador Master do Sistema',
                    permissions: ['*'],
                    isSystem: true
                }
            });
        }
        console.log('[PROMOTE] Role super-admin encontrada:', superRole.id);
        // 2. Promove o Renato (tenta ambos os emails)
        const emails = ['renato@fatto.com', 'renato@vinculobrasil.com.br'];
        let updatedUser = null;
        for (const email of emails) {
            try {
                updatedUser = await prisma.user.update({
                    where: { email },
                    data: { roleId: superRole.id },
                    include: { role: true }
                });
                console.log('[PROMOTE] Usuário promovido:', updatedUser.name);
                break;
            }
            catch {
                // Tenta o próximo email
            }
        }
        if (!updatedUser) {
            return res.status(404).json({
                error: 'Nenhum usuário Renato encontrado',
                hint: 'Execute /api/public/seed-test-users ou /api/public/force-seed primeiro'
            });
        }
        return res.json({
            status: 'PROMOVIDO 👑',
            user: updatedUser.name,
            email: updatedUser.email,
            newRole: updatedUser.role?.name,
            slug: updatedUser.role?.slug,
            instrucao: 'Faça logout e login novamente para acessar /admin/dashboard'
        });
    }
    catch (e) {
        console.error('[PROMOTE] ERRO:', e);
        const message = e instanceof Error ? e.message : String(e);
        return res.status(500).json({ error: message });
    }
});
export default router;
//# sourceMappingURL=public-setup.js.map