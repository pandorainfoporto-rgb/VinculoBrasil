// ============================================
// VINCULO BRASIL - SERVER ENTRY POINT
// ============================================

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import { pinoHttp } from 'pino-http';
import { config } from './config/index.js';
import { prisma } from './lib/prisma.js';
import { redis } from './lib/redis.js';
import { logger } from './lib/logger.js';
import { errorHandler } from './middleware/error-handler.js';
import { authMiddleware } from './middleware/auth.js';

// Routes
import publicSetupRoutes from './routes/public-setup.js';
import authRoutes from './routes/auth.js';
import setupRoutes from './routes/setup.js';
import usersRoutes from './routes/users.js';
import propertiesRoutes from './routes/properties.js';
import contractsRoutes from './routes/contracts.js';
import paymentsRoutes from './routes/payments.js';
import leadsRoutes from './routes/leads.js';
import dealsRoutes from './routes/deals.js';
import ticketsRoutes from './routes/tickets.js';
import webhooksRoutes from './routes/webhooks.js';
import blockchainRoutes from './routes/blockchain.js';
import reportsRoutes from './routes/reports.js';
import marketplaceRoutes from './routes/marketplace.js';
import vouchersRoutes from './routes/vouchers.js';
import financeRoutes from './routes/finance.js';
import web3Routes from './routes/web3.js';
import notificationRoutes from './routes/notifications.js';
import servicesRoutes from './routes/services.js';
import insuranceRoutes from './routes/insurance.js';
import agenciesRoutes from './routes/agencies.js';
import publicAgenciesRoutes from './routes/public-agencies.js';
import agencyOwnersRoutes from './routes/agency-owners.js';
import agencyPropertiesRoutes from './routes/agency-properties.js';
import realtorsRoutes from './routes/realtors.js';
import integrationsRoutes from './routes/integrations.js';
import inspectionsRoutes from './routes/inspections.js';
import p2pRoutes from './routes/p2p.js';
import systemConfigRoutes from './routes/system-config.js';
import investRoutes from './routes/invest.js';
import suppliersRoutes from './routes/suppliers.js';

import categoriesRoutes from './routes/categories.js';
import ownersRoutes from './routes/owners.js';
import tenantsRoutes from './routes/tenants.js';
import guarantorsRoutes from "./routes/guarantors.js";
import investorsRoutes from "./routes/investors.js";
import pricingRoutes from "./routes/pricing.js";
import leasesRoutes from "./routes/leases.js";


// P2P Blockchain Event Listener
import { startP2PEventListener } from './services/p2p.service.js';

// Workers
import { initWorkers } from './workers/index.js';

const app = express();

// CORREÇÃO CRÍTICA PARA RAILWAY/PRODUÇÃO
// Confia no primeiro proxy (Load Balancer) - necessário para rate-limiter funcionar
app.set('trust proxy', 1);

// ============================================
// MIDDLEWARE
// ============================================

// Security
app.use(helmet({
  contentSecurityPolicy: false, // Desabilitado para SPA
}));

// CORS - Libera acesso cross-origin para o frontend (DEVE SER PRIMEIRO!)
// FASE 16: Configuração explícita para produção + desenvolvimento
app.use(cors({
  origin: [
    'https://www.vinculobrasil.com.br',      // Produção principal
    'https://vinculobrasil.com.br',          // Produção sem www
    'https://vinculo-brasil.vercel.app',     // Vercel Preview/Production
    'http://localhost:5173',                 // Dev Local (Vite)
    'http://localhost:3000',                 // Dev Local (alternativo)
    'http://localhost:4173',                 // Vite Preview
  ],
  credentials: true,                          // Permite envio de cookies/headers de auth
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  maxAge: 86400,                              // Cache preflight por 24h
}));

// Responder explicitamente a requisições OPTIONS (preflight)
app.options('*', cors());

// Debug de requisições para diagnosticar problemas de CORS/Auth (FASE 16)
app.use((req, res, next) => {
  logger.debug(`[REQUEST] ${req.method} ${req.path} | Origin: ${req.headers.origin || 'N/A'} | Auth: ${req.headers.authorization ? 'Present' : 'Missing'}`);
  next();
});

// Compression
app.use(compression());

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookies
app.use(cookieParser());

// Logging
app.use(pinoHttp({
  logger: logger as any,
  autoLogging: {
    ignore: (req) => req.url?.includes('/health') ?? false,
  },
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 requests por janela
  message: { error: 'Too many requests, please try again later.' },
  skip: (req) => req.url?.includes('/webhooks') ?? false, // Skip para webhooks
});
app.use('/api', limiter);

// ============================================
// HEALTH CHECK
// ============================================

app.get('/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    await redis.ping();
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
  } catch (error) {
    res.status(503).json({ status: 'unhealthy', error: String(error) });
  }
});

// ============================================
// API ROUTES
// ============================================

// ROTAS PÚBLICAS - SEM AUTENTICAÇÃO (ANTES DE TUDO!)
// Acesse: GET /api/public/force-seed para criar admin inicial
app.use('/api/public', publicSetupRoutes);

// Rotas públicas de agências (Whitelabel sites)
app.use('/api/public/agencies', publicAgenciesRoutes);

// Setup (sem autenticacao - primeira execucao)
app.use('/api/setup', setupRoutes);

// Auth
app.use('/api/auth', authRoutes);

// Webhooks (sem autenticacao, validados internamente)
app.use('/api/webhooks', webhooksRoutes);

// ============================================
// ROTA DE RESGATE - PÚBLICA (Temporária)
// Acesse: GET /api/rescue-admin
// ============================================
app.get('/api/rescue-admin', async (_req, res) => {
  try {
    console.log('[RESCUE] Iniciando criação de admin de resgate...');

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
      console.log('[RESCUE] Role super-admin criada');
    }

    // 2. Criar Agência
    const bcrypt = await import('bcryptjs');
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
    console.log('[RESCUE] Agência criada/encontrada:', agency.name);

    // 3. Criar Usuário Admin
    const password = await bcrypt.default.hash('Fatto2026!', 10);
    const user = await prisma.user.upsert({
      where: { email: 'renato@fatto.com' },
      update: {
        passwordHash: password,
        roleId: superAdminRole.id,
        agencyId: agency.id,
        status: 'ACTIVE',
      },
      create: {
        name: 'Renato Admin',
        email: 'renato@fatto.com',
        passwordHash: password,
        roleId: superAdminRole.id,
        agencyId: agency.id,
        status: 'ACTIVE',
        emailVerified: true,
      },
    });
    console.log('[RESCUE] Usuário criado/atualizado:', user.email);

    return res.json({
      status: 'SUCESSO',
      msg: 'Usuário de Resgate Criado!',
      login: 'renato@fatto.com',
      senha: 'Fatto2026!',
      agencyId: agency.id,
      userId: user.id,
      instrucoes: 'Agora vá para /auth/login e use essas credenciais',
    });
  } catch (error: unknown) {
    console.error('[RESCUE] Erro:', error);
    const message = error instanceof Error ? error.message : String(error);
    return res.status(500).json({ error: message });
  }
});

// Rotas públicas de imóveis (landing page pública)
app.use('/api/properties', propertiesRoutes);

// Rotas protegidas
app.use('/api/users', authMiddleware, usersRoutes);
app.use('/api/properties', authMiddleware, propertiesRoutes);
app.use('/api/contracts', authMiddleware, contractsRoutes);
app.use('/api/payments', authMiddleware, paymentsRoutes);
app.use('/api/leads', authMiddleware, leadsRoutes);
app.use('/api/deals', authMiddleware, dealsRoutes);
app.use('/api/tickets', authMiddleware, ticketsRoutes);
app.use('/api/blockchain', authMiddleware, blockchainRoutes);
app.use('/api/reports', authMiddleware, reportsRoutes);
app.use('/api/marketplace', authMiddleware, marketplaceRoutes);
app.use('/api/vouchers', authMiddleware, vouchersRoutes);
app.use('/api/finance', authMiddleware, financeRoutes);
app.use('/api/services', authMiddleware, servicesRoutes);
app.use('/api/insurance', authMiddleware, insuranceRoutes);
app.use('/api/agencies', authMiddleware, agenciesRoutes);
app.use('/api/agency/owners', authMiddleware, agencyOwnersRoutes);
app.use('/api/agency/properties', authMiddleware, agencyPropertiesRoutes);
app.use('/api/agency/realtors', authMiddleware, realtorsRoutes);
app.use('/api/admin/integrations', authMiddleware, integrationsRoutes);
app.use('/api/inspections', authMiddleware, inspectionsRoutes);
app.use('/api/system-config', authMiddleware, systemConfigRoutes);

// Módulo Financeiro V2 - Fornecedores e Categorias
app.use('/api/suppliers', authMiddleware, suppliersRoutes);
app.use('/api/categories', authMiddleware, categoriesRoutes);
app.use('/api/owners', authMiddleware, ownersRoutes);
app.use('/api/tenants', authMiddleware, tenantsRoutes);
app.use('/api/guarantors', authMiddleware, guarantorsRoutes);
app.use('/api/investors', authMiddleware, investorsRoutes);
app.use("/api/pricing", authMiddleware, pricingRoutes);
app.use("/api/leases", authMiddleware, leasesRoutes);
app.use("/api/finance", authMiddleware, financeRoutes);
app.use("/api/web3", authMiddleware, web3Routes);
app.use("/api/notifications", authMiddleware, notificationRoutes);

// P2P Marketplace (Cessão de Crédito Digital)
// Rotas públicas: GET /listings, GET /stats, POST /simulate
// Rotas protegidas dentro do router
app.use('/api/p2p', p2pRoutes);

// Invest - Pedidos de Investimento via Pix
// Blockchain invisível ao usuário
app.use('/api/invest', investRoutes);

// ============================================
// STATIC FILES (Frontend SPA)
// ============================================

app.use(express.static('public'));

// SPA fallback
app.get('*', (_req, res) => {
  res.sendFile('index.html', { root: 'public' });
});

// ============================================
// ERROR HANDLER
// ============================================

app.use(errorHandler);

// ============================================
// SERVER STARTUP
// ============================================

async function bootstrap() {
  try {
    // Verificar conexao com banco
    console.log('Connecting to database...');
    await prisma.$connect();
    console.log('Database connected');
    logger.info('Database connected');

    // Verificar conexao com Redis (OPCIONAL)
    try {
      console.log('Connecting to Redis...');
      await redis.ping();
      console.log('Redis connected');
      logger.info('Redis connected');
    } catch (redisError) {
      console.log('Redis connection failed (optional):', redisError instanceof Error ? redisError.message : String(redisError));
      logger.warn('Redis not available, running without queue workers');
    }

    // Inicializar workers (apenas se Redis estiver disponível)
    try {
      await initWorkers();
      console.log('Workers initialized');
      logger.info('Workers initialized');
    } catch (workerError) {
      console.log('Workers init failed (optional):', workerError instanceof Error ? workerError.message : String(workerError));
      logger.warn('Workers not initialized');
    }

    // Iniciar servidor
    const server = app.listen(config.port, config.host, () => {
      logger.info(`Server running on http://${config.host}:${config.port}`);
      logger.info(`Environment: ${config.nodeEnv}`);

      // ============================================
      // INICIALIZA O P2P BLOCKCHAIN LISTENER
      // Monitora eventos de venda no Smart Contract
      // ============================================
      startP2PEventListener()
        .then(() => {
          logger.info('✅ P2P Event Listener initialized');
          console.log('✅ P2P Blockchain Listener started');
        })
        .catch((err) => {
          logger.error(`❌ P2P Listener failed: ${err instanceof Error ? err.message : String(err)}`);
          console.error('❌ P2P Blockchain Listener failed (non-critical):', err instanceof Error ? err.message : String(err));
          // Não mata o servidor - é opcional
        });
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal: string) => {
      logger.info(`${signal} received, shutting down gracefully...`);

      server.close(async () => {
        logger.info('HTTP server closed');

        await prisma.$disconnect();
        logger.info('Database disconnected');

        await redis.quit();
        logger.info('Redis disconnected');

        process.exit(0);
      });

      // Force close after 30s
      setTimeout(() => {
        logger.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
      }, 30000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error: any) {
    console.log("🔥 ERRO FATAL DETECTADO 🔥");
    console.log("---------------------------------------------------");
    // Imprime o erro como string simples para garantir que apareça no log
    console.log(error instanceof Error ? error.message : String(error));
    console.log("STACK TRACE:");
    console.log(error instanceof Error ? error.stack : "Sem stack trace");
    console.log("---------------------------------------------------");
    process.exit(1);
  }
}

bootstrap();

export { app };
