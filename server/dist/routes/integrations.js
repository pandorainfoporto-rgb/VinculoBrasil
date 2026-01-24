// ============================================
// INTEGRATIONS ROUTES - Gerenciamento de Chaves de API
// CRUD seguro para SystemConfig
// ============================================
import { Router } from 'express';
import crypto from 'crypto';
import axios from 'axios';
import { prisma } from '../lib/prisma.js';
import { config } from '../config/index.js';
import { logger } from '../lib/logger.js';
import { AppError } from '../middleware/error-handler.js';
const router = Router();
// ============================================
// HELPERS
// ============================================
// Função para criptografar dados sensíveis
const encrypt = (text) => {
    try {
        const iv = crypto.randomBytes(16);
        const key = Buffer.from(config.encryptionKey.padEnd(32, '0').slice(0, 32));
        const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return `${iv.toString('hex')}:${encrypted}`;
    }
    catch (error) {
        logger.error('Encryption error:', error);
        throw new AppError(500, 'Erro ao criptografar dado');
    }
};
// Função para descriptografar dados
const decrypt = (encryptedText) => {
    try {
        const [ivHex, encrypted] = encryptedText.split(':');
        if (!ivHex || !encrypted)
            return encryptedText; // Não criptografado
        const iv = Buffer.from(ivHex, 'hex');
        const key = Buffer.from(config.encryptionKey.padEnd(32, '0').slice(0, 32));
        const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }
    catch (error) {
        logger.error('Decryption error:', error);
        return encryptedText; // Retorna original se falhar
    }
};
// Mascarar valor da chave para exibição
const maskValue = (value) => {
    if (!value || value.length < 12)
        return '••••••••';
    return value.substring(0, 8) + '••••••••' + value.slice(-4);
};
// Verificar se usuário é admin
const isAdmin = (user) => {
    if (!user)
        return false;
    const role = user.role?.slug || user.roleSlug || '';
    return ['admin', 'super-admin', 'master-admin', 'MASTER_ADMIN'].includes(role);
};
// ============================================
// GET /api/admin/integrations - Listar configs
// ============================================
router.get('/', async (req, res, next) => {
    try {
        // Verificar permissão
        if (!isAdmin(req.user)) {
            throw new AppError(403, 'Acesso negado. Apenas administradores podem visualizar integrações.');
        }
        // Buscar todas as configs de integração
        const configs = await prisma.systemConfig.findMany({
            where: {
                key: {
                    in: ['PINATA_JWT', 'ASAAS_API_KEY', 'OPENAI_API_KEY', 'PINATA_API_KEY', 'PINATA_SECRET_KEY', 'SMART_CONTRACT_ADDRESS']
                }
            },
            select: {
                id: true,
                key: true,
                value: true,
                encrypted: true,
                updatedAt: true,
            }
        });
        // Mascarar valores para exibição
        const masked = configs.map(c => {
            let realValue = c.value;
            // Descriptografar se necessário
            if (c.encrypted) {
                try {
                    realValue = decrypt(c.value);
                }
                catch {
                    realValue = c.value;
                }
            }
            return {
                key: c.key,
                maskedValue: maskValue(realValue),
                category: getCategoryForKey(c.key),
                updatedAt: c.updatedAt,
                isConfigured: !!c.value && c.value.length > 0,
            };
        });
        // Adicionar chaves não configuradas
        const allKeys = ['PINATA_JWT', 'ASAAS_API_KEY', 'OPENAI_API_KEY', 'SMART_CONTRACT_ADDRESS'];
        const configuredKeys = masked.map(m => m.key);
        for (const key of allKeys) {
            if (!configuredKeys.includes(key)) {
                masked.push({
                    key,
                    maskedValue: '',
                    category: getCategoryForKey(key),
                    updatedAt: null,
                    isConfigured: false,
                });
            }
        }
        return res.json({ configs: masked });
    }
    catch (error) {
        next(error);
    }
});
// Helper para categorias
function getCategoryForKey(key) {
    if (key.includes('PINATA'))
        return 'STORAGE';
    if (key.includes('ASAAS'))
        return 'PAYMENT';
    if (key.includes('OPENAI'))
        return 'AI';
    if (key.includes('SMART_CONTRACT'))
        return 'BLOCKCHAIN';
    return 'OTHER';
}
// ============================================
// POST /api/admin/integrations - Criar/Atualizar config
// ============================================
router.post('/', async (req, res, next) => {
    try {
        // Verificar permissão
        if (!isAdmin(req.user)) {
            throw new AppError(403, 'Acesso negado. Apenas administradores podem gerenciar integrações.');
        }
        const { key, value, category } = req.body;
        if (!key || !value) {
            throw new AppError(400, 'Chave e valor são obrigatórios');
        }
        // Validar chaves permitidas
        const allowedKeys = ['PINATA_JWT', 'PINATA_API_KEY', 'PINATA_SECRET_KEY', 'ASAAS_API_KEY', 'OPENAI_API_KEY', 'SMART_CONTRACT_ADDRESS'];
        if (!allowedKeys.includes(key)) {
            throw new AppError(400, `Chave inválida. Permitidas: ${allowedKeys.join(', ')}`);
        }
        // Smart Contract Address não precisa criptografia (é público)
        const needsEncryption = key !== 'SMART_CONTRACT_ADDRESS';
        const finalValue = needsEncryption ? encrypt(value) : value;
        // Upsert no banco
        const configRecord = await prisma.systemConfig.upsert({
            where: { key },
            update: {
                value: finalValue,
                encrypted: needsEncryption,
                updatedAt: new Date()
            },
            create: {
                key,
                value: finalValue,
                encrypted: needsEncryption
            }
        });
        logger.info(`Integration config updated: ${key} by user ${req.user?.id}`);
        return res.json({
            message: 'Configuração salva com sucesso',
            key: configRecord.key,
            updatedAt: configRecord.updatedAt
        });
    }
    catch (error) {
        next(error);
    }
});
// ============================================
// POST /api/admin/integrations/test/:service - Testar conexão
// ============================================
router.post('/test/:service', async (req, res, next) => {
    try {
        // Verificar permissão
        if (!isAdmin(req.user)) {
            throw new AppError(403, 'Acesso negado');
        }
        const { service } = req.params;
        switch (service) {
            case 'pinata': {
                // Buscar chave do Pinata
                const pinataConfig = await prisma.systemConfig.findUnique({
                    where: { key: 'PINATA_JWT' }
                });
                if (!pinataConfig?.value) {
                    throw new AppError(400, 'Pinata JWT não configurado');
                }
                const jwt = decrypt(pinataConfig.value);
                // Testar autenticação
                const response = await axios.get('https://api.pinata.cloud/data/testAuthentication', {
                    headers: {
                        'Authorization': `Bearer ${jwt}`
                    },
                    timeout: 10000
                });
                if (response.status === 200) {
                    logger.info('Pinata connection test successful');
                    return res.json({ success: true, message: 'Conexão com Pinata OK' });
                }
                else {
                    throw new AppError(400, 'Falha na autenticação Pinata');
                }
            }
            case 'asaas': {
                // Buscar chave do Asaas
                const asaasConfig = await prisma.systemConfig.findUnique({
                    where: { key: 'ASAAS_API_KEY' }
                });
                if (!asaasConfig?.value) {
                    throw new AppError(400, 'Asaas API Key não configurada');
                }
                const apiKey = decrypt(asaasConfig.value);
                // Testar autenticação - endpoint de status
                const response = await axios.get('https://api.asaas.com/v3/myAccount', {
                    headers: {
                        'access_token': apiKey
                    },
                    timeout: 10000
                });
                if (response.status === 200) {
                    logger.info('Asaas connection test successful');
                    return res.json({
                        success: true,
                        message: 'Conexão com Asaas OK',
                        account: response.data.name
                    });
                }
                else {
                    throw new AppError(400, 'Falha na autenticação Asaas');
                }
            }
            case 'openai': {
                // Buscar chave da OpenAI
                const openaiConfig = await prisma.systemConfig.findUnique({
                    where: { key: 'OPENAI_API_KEY' }
                });
                if (!openaiConfig?.value) {
                    throw new AppError(400, 'OpenAI API Key não configurada');
                }
                const apiKey = decrypt(openaiConfig.value);
                // Testar autenticação - listar modelos
                const response = await axios.get('https://api.openai.com/v1/models', {
                    headers: {
                        'Authorization': `Bearer ${apiKey}`
                    },
                    timeout: 10000
                });
                if (response.status === 200) {
                    logger.info('OpenAI connection test successful');
                    return res.json({
                        success: true,
                        message: 'Conexão com OpenAI OK',
                        modelsCount: response.data.data?.length || 0
                    });
                }
                else {
                    throw new AppError(400, 'Falha na autenticação OpenAI');
                }
            }
            default:
                throw new AppError(400, `Serviço desconhecido: ${service}`);
        }
    }
    catch (error) {
        logger.error(`Integration test failed for ${req.params.service}:`, error.message);
        // Retornar erro amigável
        if (axios.isAxiosError(error)) {
            return res.status(400).json({
                success: false,
                message: error.response?.data?.message || 'Falha na conexão com o serviço'
            });
        }
        next(error);
    }
});
// ============================================
// GET /api/admin/integrations/config/:key - Buscar config específica (uso interno)
// ============================================
router.get('/config/:key', async (req, res, next) => {
    try {
        // Verificar permissão
        if (!isAdmin(req.user)) {
            throw new AppError(403, 'Acesso negado');
        }
        const { key } = req.params;
        const configRecord = await prisma.systemConfig.findUnique({
            where: { key }
        });
        if (!configRecord) {
            return res.json({ configured: false, value: null });
        }
        // Não retorna o valor real, apenas status
        return res.json({
            configured: true,
            key: configRecord.key,
            updatedAt: configRecord.updatedAt
        });
    }
    catch (error) {
        next(error);
    }
});
// ============================================
// DELETE /api/admin/integrations/:key - Remover config
// ============================================
router.delete('/:key', async (req, res, next) => {
    try {
        // Verificar permissão
        if (!isAdmin(req.user)) {
            throw new AppError(403, 'Acesso negado');
        }
        const { key } = req.params;
        await prisma.systemConfig.delete({
            where: { key }
        });
        logger.info(`Integration config deleted: ${key} by user ${req.user?.id}`);
        return res.json({ message: 'Configuração removida com sucesso' });
    }
    catch (error) {
        next(error);
    }
});
export default router;
//# sourceMappingURL=integrations.js.map