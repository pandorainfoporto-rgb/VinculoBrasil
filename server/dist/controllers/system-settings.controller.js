// ============================================
// SYSTEM SETTINGS CONTROLLER
// Gerencia configurações globais da plataforma
// ============================================
import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';
import { AppError } from '../middleware/error-handler.js';
// ============================================
// GET /api/system-config/settings
// Busca as configurações do sistema
// ============================================
export async function getSystemSettings(req, res, next) {
    try {
        logger.info('[SystemSettings] Fetching system settings');
        // Busca a primeira (e única) entrada de configurações
        let settings = await prisma.systemSettings.findFirst();
        // Se não existir, cria com valores padrão
        if (!settings) {
            logger.info('[SystemSettings] No settings found, creating defaults');
            settings = await prisma.systemSettings.create({
                data: {
                    platformFee: 0.05, // 5%
                    insuranceFee: 0.03, // 3%
                    guarantorFee: 0.05, // 5%
                    agencyCommissionRate: 0.10, // 10%
                    realtorCommissionSplit: 0.50, // 50%
                    notes: 'Configurações padrão do sistema',
                },
            });
        }
        res.json({
            data: settings,
        });
    }
    catch (error) {
        logger.error('[SystemSettings] Error fetching settings:', error);
        next(error);
    }
}
// ============================================
// PUT /api/system-config/settings
// Atualiza as configurações do sistema
// ============================================
export async function updateSystemSettings(req, res, next) {
    try {
        const { platformFee, insuranceFee, guarantorFee, agencyCommissionRate, realtorCommissionSplit, notes, } = req.body;
        logger.info('[SystemSettings] Updating system settings', {
            userId: req.user?.id,
            platformFee,
            insuranceFee,
        });
        // Validações
        if (platformFee !== undefined && (platformFee < 0 || platformFee > 1)) {
            throw new AppError(400, 'Taxa da plataforma deve estar entre 0 e 1 (0% a 100%)');
        }
        if (insuranceFee !== undefined && (insuranceFee < 0 || insuranceFee > 1)) {
            throw new AppError(400, 'Taxa de seguro deve estar entre 0 e 1 (0% a 100%)');
        }
        if (guarantorFee !== undefined && (guarantorFee < 0 || guarantorFee > 1)) {
            throw new AppError(400, 'Taxa do garantidor deve estar entre 0 e 1 (0% a 100%)');
        }
        if (agencyCommissionRate !== undefined && (agencyCommissionRate < 0 || agencyCommissionRate > 1)) {
            throw new AppError(400, 'Comissão da agência deve estar entre 0 e 1 (0% a 100%)');
        }
        if (realtorCommissionSplit !== undefined && (realtorCommissionSplit < 0 || realtorCommissionSplit > 1)) {
            throw new AppError(400, 'Divisão corretor/agência deve estar entre 0 e 1 (0% a 100%)');
        }
        // Busca a configuração existente
        const existing = await prisma.systemSettings.findFirst();
        let settings;
        if (existing) {
            // Atualiza a existente
            settings = await prisma.systemSettings.update({
                where: { id: existing.id },
                data: {
                    ...(platformFee !== undefined && { platformFee }),
                    ...(insuranceFee !== undefined && { insuranceFee }),
                    ...(guarantorFee !== undefined && { guarantorFee }),
                    ...(agencyCommissionRate !== undefined && { agencyCommissionRate }),
                    ...(realtorCommissionSplit !== undefined && { realtorCommissionSplit }),
                    ...(notes !== undefined && { notes }),
                    updatedBy: req.user?.id,
                },
            });
            logger.info('[SystemSettings] Settings updated successfully', {
                settingsId: settings.id,
                updatedBy: req.user?.id,
            });
        }
        else {
            // Cria nova entrada
            settings = await prisma.systemSettings.create({
                data: {
                    platformFee: platformFee ?? 0.05,
                    insuranceFee: insuranceFee ?? 0.03,
                    guarantorFee: guarantorFee ?? 0.05,
                    agencyCommissionRate: agencyCommissionRate ?? 0.10,
                    realtorCommissionSplit: realtorCommissionSplit ?? 0.50,
                    notes,
                    updatedBy: req.user?.id,
                },
            });
            logger.info('[SystemSettings] Settings created successfully', {
                settingsId: settings.id,
            });
        }
        res.json({
            data: settings,
            message: 'Configurações atualizadas com sucesso',
        });
    }
    catch (error) {
        logger.error('[SystemSettings] Error updating settings:', error);
        next(error);
    }
}
//# sourceMappingURL=system-settings.controller.js.map