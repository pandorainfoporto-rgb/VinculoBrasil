// ============================================
// INSPECTIONS ROUTES
// Upload IPFS + AI Vision Analysis
// ============================================
import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { uploadToIPFS, analyzeImage, uploadAndAnalyze, checkConfig, } from '../controllers/inspection.controller.js';
const router = Router();
// ============================================
// MULTER CONFIGURATION
// ============================================
// Garantir que o diretório de uploads existe
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}
// Configuração do storage
const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (_req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, `vistoria-${uniqueSuffix}${ext}`);
    },
});
// Filtro de tipos de arquivo permitidos
const fileFilter = (_req, file, cb) => {
    const allowedMimes = [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp',
        'image/heic',
        'image/heif',
    ];
    if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error('Tipo de arquivo não permitido. Use JPEG, PNG ou WebP.'));
    }
};
// Instância do multer
const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB max
    },
});
// ============================================
// ROUTES
// ============================================
/**
 * POST /api/inspections/upload-ipfs
 * Upload de imagem para IPFS via Pinata
 * Retorna: { ipfsHash, publicUrl }
 */
router.post('/upload-ipfs', upload.single('file'), uploadToIPFS);
/**
 * POST /api/inspections/analyze
 * Análise de imagem com GPT-4 Vision
 * Body: { imageUrl: string }
 * Retorna: { analysis: AIAnalysisResult }
 */
router.post('/analyze', analyzeImage);
/**
 * POST /api/inspections/upload-analyze
 * Upload para IPFS + Análise com IA em uma única requisição
 * Retorna: { ipfsHash, publicUrl, analysis }
 */
router.post('/upload-analyze', upload.single('file'), uploadAndAnalyze);
/**
 * GET /api/inspections/config-status
 * Verifica status das configurações necessárias
 * Retorna: { pinata: boolean, openai: boolean, ready: boolean }
 */
router.get('/config-status', checkConfig);
export default router;
//# sourceMappingURL=inspections.js.map