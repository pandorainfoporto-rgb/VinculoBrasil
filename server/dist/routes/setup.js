// ============================================
// SETUP ROUTES - First Run Configuration
// ============================================
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { ethers } from 'ethers';
import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { prisma } from '../lib/prisma.js';
import { config } from '../config/index.js';
import { AppError } from '../middleware/error-handler.js';
import { logger } from '../lib/logger.js';
const router = Router();
// Schema do Wizard
const setupSchema = z.object({
    // Passo 1: Admin
    admin: z.object({
        name: z.string().min(2),
        email: z.string().email(),
        password: z.string().min(8),
    }),
    // Passo 2: Empresa
    company: z.object({
        name: z.string().min(2),
        cnpj: z.string().min(14),
        email: z.string().email(),
        phone: z.string().optional(),
        logo: z.string().optional(),
        primaryColor: z.string().default('#0066FF'),
        street: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        zipCode: z.string().optional(),
    }),
    // Passo 3: Blockchain
    blockchain: z.object({
        polygonRpcUrl: z.string().url(),
        operatorPrivateKey: z.string().min(64),
        treasuryWallet: z.string().min(42),
    }),
    // Passo 4: Fintechs
    fintechs: z.object({
        asaasApiKey: z.string().optional(),
        asaasWalletId: z.string().optional(),
        asaasSandbox: z.boolean().default(true),
        transferoClientId: z.string().optional(),
        transferoClientSecret: z.string().optional(),
        transferoSandbox: z.boolean().default(true),
    }),
    // Passo 5: Comunicacao
    communication: z.object({
        smtpHost: z.string().optional(),
        smtpPort: z.number().optional(),
        smtpUser: z.string().optional(),
        smtpPass: z.string().optional(),
        smtpFrom: z.string().email().optional(),
        openaiApiKey: z.string().optional(),
    }),
});
// Verificar se setup ja foi completado
router.get('/status', async (_req, res) => {
    try {
        const adminExists = await prisma.user.findFirst({
            where: { role: { slug: 'admin' } },
        });
        const companyExists = await prisma.company.findFirst();
        res.json({
            isComplete: !!(adminExists && companyExists),
            hasAdmin: !!adminExists,
            hasCompany: !!companyExists,
        });
    }
    catch (error) {
        res.json({ isComplete: false, hasAdmin: false, hasCompany: false });
    }
});
// Testar conexao blockchain
router.post('/test-blockchain', async (req, res, next) => {
    try {
        const { rpcUrl, operatorKey } = req.body;
        const provider = new ethers.JsonRpcProvider(rpcUrl);
        const wallet = new ethers.Wallet(operatorKey, provider);
        const [network, balance] = await Promise.all([
            provider.getNetwork(),
            provider.getBalance(wallet.address),
        ]);
        res.json({
            success: true,
            network: network.name,
            chainId: Number(network.chainId),
            operatorAddress: wallet.address,
            balanceMatic: ethers.formatEther(balance),
        });
    }
    catch (error) {
        next(new AppError(400, `Blockchain connection failed: ${error}`));
    }
});
// Finalizar setup
router.post('/finish', async (req, res, next) => {
    try {
        // Verificar se ja foi configurado
        const existingAdmin = await prisma.user.findFirst({
            where: { role: { slug: 'admin' } },
        });
        if (existingAdmin) {
            throw new AppError(400, 'Setup already completed');
        }
        const data = setupSchema.parse(req.body);
        // Funcao para criptografar dados sensiveis
        const encrypt = (text) => {
            const iv = crypto.randomBytes(16);
            const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(config.encryptionKey.padEnd(32, '0').slice(0, 32)), iv);
            let encrypted = cipher.update(text, 'utf8', 'hex');
            encrypted += cipher.final('hex');
            return `${iv.toString('hex')}:${encrypted}`;
        };
        // Transacao para criar tudo atomicamente
        await prisma.$transaction(async (tx) => {
            // 1. Criar role admin se nao existir
            let adminRole = await tx.role.findFirst({ where: { slug: 'admin' } });
            if (!adminRole) {
                adminRole = await tx.role.create({
                    data: {
                        name: 'Administrador',
                        slug: 'admin',
                        permissions: ['*'], // Full access
                        isSystem: true,
                    },
                });
            }
            // 2. Criar roles padrao
            const defaultRoles = [
                { name: 'Proprietario', slug: 'owner', permissions: ['properties.*', 'contracts.*', 'payments.view'] },
                { name: 'Inquilino', slug: 'tenant', permissions: ['contracts.view', 'payments.*', 'tickets.*'] },
                { name: 'Corretor', slug: 'broker', permissions: ['leads.*', 'deals.*', 'properties.view'] },
                { name: 'Atendente', slug: 'agent', permissions: ['tickets.*', 'leads.*', 'messages.*'] },
                { name: 'Usuario', slug: 'user', permissions: ['profile.*'] },
            ];
            for (const roleData of defaultRoles) {
                await tx.role.upsert({
                    where: { slug: roleData.slug },
                    update: {},
                    create: { ...roleData, isSystem: true },
                });
            }
            // 3. Criar admin user
            const passwordHash = await bcrypt.hash(data.admin.password, 12);
            await tx.user.create({
                data: {
                    email: data.admin.email,
                    passwordHash,
                    name: data.admin.name,
                    roleId: adminRole.id,
                    emailVerified: true,
                },
            });
            // 4. Criar empresa
            await tx.company.create({
                data: {
                    name: data.company.name,
                    cnpj: data.company.cnpj,
                    email: data.company.email,
                    phone: data.company.phone,
                    logo: data.company.logo,
                    primaryColor: data.company.primaryColor,
                    street: data.company.street,
                    city: data.company.city,
                    state: data.company.state,
                    zipCode: data.company.zipCode,
                },
            });
            // 5. Salvar configuracoes no banco (criptografadas)
            const configs = [
                { key: 'POLYGON_RPC_URL', value: data.blockchain.polygonRpcUrl, encrypted: false },
                { key: 'OPERATOR_PRIVATE_KEY', value: encrypt(data.blockchain.operatorPrivateKey), encrypted: true },
                { key: 'TREASURY_WALLET', value: data.blockchain.treasuryWallet, encrypted: false },
                { key: 'ASAAS_API_KEY', value: data.fintechs.asaasApiKey ? encrypt(data.fintechs.asaasApiKey) : '', encrypted: true },
                { key: 'ASAAS_WALLET_ID', value: data.fintechs.asaasWalletId || '', encrypted: false },
                { key: 'ASAAS_SANDBOX', value: String(data.fintechs.asaasSandbox), encrypted: false },
                { key: 'TRANSFERO_CLIENT_ID', value: data.fintechs.transferoClientId || '', encrypted: false },
                { key: 'TRANSFERO_CLIENT_SECRET', value: data.fintechs.transferoClientSecret ? encrypt(data.fintechs.transferoClientSecret) : '', encrypted: true },
                { key: 'TRANSFERO_SANDBOX', value: String(data.fintechs.transferoSandbox), encrypted: false },
                { key: 'SMTP_HOST', value: data.communication.smtpHost || '', encrypted: false },
                { key: 'SMTP_PORT', value: String(data.communication.smtpPort || 587), encrypted: false },
                { key: 'SMTP_USER', value: data.communication.smtpUser || '', encrypted: false },
                { key: 'SMTP_PASS', value: data.communication.smtpPass ? encrypt(data.communication.smtpPass) : '', encrypted: true },
                { key: 'SMTP_FROM', value: data.communication.smtpFrom || '', encrypted: false },
                { key: 'OPENAI_API_KEY', value: data.communication.openaiApiKey ? encrypt(data.communication.openaiApiKey) : '', encrypted: true },
                { key: 'SETUP_COMPLETE', value: 'true', encrypted: false },
            ];
            for (const cfg of configs) {
                if (cfg.value) {
                    await tx.systemConfig.upsert({
                        where: { key: cfg.key },
                        update: { value: cfg.value, encrypted: cfg.encrypted },
                        create: { key: cfg.key, value: cfg.value, encrypted: cfg.encrypted },
                    });
                }
            }
            // 6. Criar pipeline padrao de CRM
            const pipeline = await tx.pipeline.create({
                data: {
                    name: 'Pipeline Principal',
                    description: 'Pipeline padrao de vendas',
                    isDefault: true,
                },
            });
            const stages = [
                { name: 'Novo Lead', color: '#6366F1', order: 1 },
                { name: 'Contato Inicial', color: '#8B5CF6', order: 2 },
                { name: 'Visita Agendada', color: '#A855F7', order: 3 },
                { name: 'Proposta Enviada', color: '#D946EF', order: 4 },
                { name: 'Negociacao', color: '#EC4899', order: 5 },
                { name: 'Fechamento', color: '#22C55E', order: 6 },
            ];
            for (const stage of stages) {
                await tx.pipelineStage.create({
                    data: { ...stage, pipelineId: pipeline.id },
                });
            }
            // 7. Criar wallet treasury
            await tx.wallet.create({
                data: {
                    address: data.blockchain.treasuryWallet,
                    type: 'TREASURY',
                    label: 'Treasury Principal',
                    isTreasury: true,
                },
            });
        });
        // Gerar arquivo .env para referencia
        const envContent = `
# Vinculo Brasil - Environment Variables
# Generated by Setup Wizard

NODE_ENV=production
PORT=3001
HOST=0.0.0.0

DATABASE_URL=${config.databaseUrl}
REDIS_URL=${config.redisUrl}

JWT_SECRET=${config.jwtSecret}
ENCRYPTION_KEY=${config.encryptionKey}

# Blockchain config stored in database (encrypted)
# Fintech config stored in database (encrypted)
# SMTP config stored in database

SETUP_COMPLETE=true
`.trim();
        // Salvar .env de backup
        try {
            await fs.writeFile(path.join(process.cwd(), '.env.generated'), envContent);
        }
        catch {
            logger.warn('Could not write .env.generated file');
        }
        logger.info('Setup completed successfully');
        res.json({
            success: true,
            message: 'Setup completed! Please restart the application.',
        });
    }
    catch (error) {
        next(error);
    }
});
// Gerar QR Code para WhatsApp (Baileys)
router.get('/whatsapp/qr', async (_req, res, next) => {
    try {
        // Aqui seria a integracao com Baileys
        // Por enquanto retorna placeholder
        res.json({
            status: 'pending',
            message: 'WhatsApp connection will be configured after setup',
        });
    }
    catch (error) {
        next(error);
    }
});
export default router;
//# sourceMappingURL=setup.js.map