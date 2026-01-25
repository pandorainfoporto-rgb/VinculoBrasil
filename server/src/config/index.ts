// ============================================
// CONFIGURACAO DO SERVIDOR
// ============================================

import 'dotenv/config';

export const config = {
  // Server
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3001', 10),
  host: process.env.HOST || '0.0.0.0',
  corsOrigin: process.env.CORS_ORIGIN || '*',

  // Database
  databaseUrl: process.env.DATABASE_URL || 'postgresql://vinculo:vinculo@localhost:5432/vinculo',

  // Redis
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',

  // JWT
  jwtSecret: process.env.JWT_SECRET || 'change-this-secret-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',

  // Encryption
  encryptionKey: process.env.ENCRYPTION_KEY || 'change-this-32-char-key-in-prod!',

  // Blockchain - Polygon
  polygonRpcUrl: process.env.POLYGON_RPC_URL || 'https://polygon-rpc.com',
  operatorPrivateKey: process.env.OPERATOR_PRIVATE_KEY || '',
  treasuryWallet: process.env.TREASURY_WALLET || '',
  nftContractAddress: process.env.NFT_CONTRACT_ADDRESS || '',
  vbrzTokenAddress: process.env.VBRZ_TOKEN_ADDRESS || '',

  // Asaas
  asaasApiKey: process.env.ASAAS_API_KEY || '',
  asaasWalletId: process.env.ASAAS_WALLET_ID || '',
  asaasSandbox: process.env.ASAAS_SANDBOX === 'true',

  // Transfero
  transferoClientId: process.env.TRANSFERO_CLIENT_ID || '',
  transferoClientSecret: process.env.TRANSFERO_CLIENT_SECRET || '',
  transferoSandbox: process.env.TRANSFERO_SANDBOX === 'true',

  // SMTP
  smtpHost: process.env.SMTP_HOST || '',
  smtpPort: parseInt(process.env.SMTP_PORT || '587', 10),
  smtpUser: process.env.SMTP_USER || '',
  smtpPass: process.env.SMTP_PASS || '',
  smtpFrom: process.env.SMTP_FROM || 'noreply@vinculobrasil.com.br',

  // OpenAI
  openaiApiKey: process.env.OPENAI_API_KEY || '',

  // WhatsApp (Baileys)
  whatsappSessionPath: process.env.WHATSAPP_SESSION_PATH || './whatsapp-sessions',

  // Upload
  uploadPath: process.env.UPLOAD_PATH || './uploads',
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10), // 10MB

  // Setup
  isSetupComplete: process.env.SETUP_COMPLETE === 'true',
};

// Validar configuracoes criticas em producao
if (config.nodeEnv === 'production') {
  const requiredEnvVars = [
    'DATABASE_URL',
    // REDIS_URL é opcional - funciona sem ele
    // 'JWT_SECRET', - tem fallback
    // 'ENCRYPTION_KEY', - tem fallback
  ];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      console.error(`Missing required environment variable: ${envVar}`);
      process.exit(1);
    }
  }

  // Log de configuração para debug
  console.log('=== CONFIG LOADED ===');
  console.log('NODE_ENV:', config.nodeEnv);
  console.log('PORT:', config.port);
  console.log('HOST:', config.host);
  console.log('DATABASE_URL:', config.databaseUrl ? 'SET' : 'NOT SET');
  console.log('REDIS_URL:', config.redisUrl ? 'SET' : 'NOT SET');
  console.log('=====================');
}
