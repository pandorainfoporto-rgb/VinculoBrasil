// ============================================
// INSPECTION CONTROLLER
// Upload IPFS + AI Vision Analysis
// ============================================

import { type Request, type Response, type NextFunction } from 'express';
import fs from 'fs';
import crypto from 'crypto';
import FormData from 'form-data';
import axios from 'axios';
import { prisma } from '../lib/prisma.js';
import { config } from '../config/index.js';
import { logger } from '../lib/logger.js';
import { AppError } from '../middleware/error-handler.js';

// ============================================
// HELPERS
// ============================================

// Descriptografar chaves do banco
const decrypt = (encryptedText: string): string => {
  try {
    const [ivHex, encrypted] = encryptedText.split(':');
    if (!ivHex || !encrypted) return encryptedText;

    const iv = Buffer.from(ivHex, 'hex');
    const key = Buffer.from(config.encryptionKey.padEnd(32, '0').slice(0, 32));
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    logger.error(`Decrypt error: ${error instanceof Error ? error.message : String(error)}`);
    return encryptedText;
  }
};

// Buscar config do banco
const getConfig = async (key: string): Promise<string | null> => {
  try {
    const configRecord = await prisma.systemConfig.findUnique({
      where: { key }
    });

    if (!configRecord?.value) return null;

    if (configRecord.encrypted) {
      return decrypt(configRecord.value);
    }

    return configRecord.value;
  } catch (error) {
    logger.error(`Failed to get config ${key}: ${error instanceof Error ? error.message : String(error)}`);
    return null;
  }
};

// ============================================
// 1. UPLOAD PARA PINATA (IPFS)
// ============================================
export const uploadToIPFS = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Verificar se tem arquivo
    if (!req.file) {
      throw new AppError(400, 'Nenhum arquivo enviado.');
    }

    logger.info(`IPFS Upload: Processing file ${req.file.originalname} (${req.file.size} bytes)`);

    // Buscar Token Pinata do banco
    const pinataJwt = await getConfig('PINATA_JWT');
    if (!pinataJwt) {
      // Limpar arquivo temporário
      if (req.file.path) fs.unlinkSync(req.file.path);
      throw new AppError(500, 'Configuração PINATA_JWT não encontrada. Configure em /admin/integrations.');
    }

    // Preparar FormData para Pinata
    const formData = new FormData();
    formData.append('file', fs.createReadStream(req.file.path), {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });

    // Metadata do arquivo
    const pinataMetadata = {
      name: `vistoria-${Date.now()}-${req.file.originalname}`,
      keyvalues: {
        type: 'inspection-photo',
        uploadedBy: req.user?.id || 'anonymous',
        uploadedAt: new Date().toISOString(),
      }
    };
    formData.append('pinataMetadata', JSON.stringify(pinataMetadata));

    // Opções do Pinata
    const pinataOptions = { cidVersion: 1 };
    formData.append('pinataOptions', JSON.stringify(pinataOptions));

    // Enviar para Pinata
    const pinataRes = await axios.post(
      'https://api.pinata.cloud/pinning/pinFileToIPFS',
      formData,
      {
        maxBodyLength: Infinity,
        headers: {
          'Authorization': `Bearer ${pinataJwt}`,
          ...formData.getHeaders()
        },
        timeout: 60000, // 60 segundos
      }
    );

    // Limpar arquivo temporário
    fs.unlinkSync(req.file.path);

    const ipfsHash = pinataRes.data.IpfsHash;
    const publicUrl = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
    const pinSize = pinataRes.data.PinSize;

    logger.info(`IPFS Upload Success: ${ipfsHash} (${pinSize} bytes)`);

    return res.json({
      success: true,
      ipfsHash,
      publicUrl,
      pinSize,
      timestamp: pinataRes.data.Timestamp,
    });

  } catch (error: any) {
    // Limpar arquivo temporário em caso de erro
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    logger.error(`IPFS Upload Error: ${error.response?.data ? JSON.stringify(error.response.data) : error.message}`);

    if (axios.isAxiosError(error)) {
      return res.status(500).json({
        success: false,
        error: 'Falha no upload IPFS',
        details: error.response?.data?.error || error.message
      });
    }

    next(error);
  }
};

// ============================================
// 2. ANÁLISE COM GPT-4 VISION
// ============================================
export const analyzeImage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { imageUrl } = req.body;

    if (!imageUrl) {
      throw new AppError(400, 'URL da imagem é obrigatória.');
    }

    logger.info(`AI Analysis: Processing image ${imageUrl}`);

    // Buscar OpenAI API Key do banco
    const openaiApiKey = await getConfig('OPENAI_API_KEY');
    if (!openaiApiKey) {
      throw new AppError(500, 'Configuração OPENAI_API_KEY não encontrada. Configure em /admin/integrations.');
    }

    // Prompt para análise de vistoria imobiliária
    const systemPrompt = `Você é um especialista em vistoria imobiliária.
Analise a imagem e retorne APENAS um JSON válido (sem markdown, sem código, apenas o JSON) com a seguinte estrutura:
{
  "roomType": "string (ex: Sala de Estar, Cozinha, Banheiro, Quarto, Área de Serviço, Varanda, Hall)",
  "items": ["array de itens identificados na foto (ex: Piso, Janela, Pia, Tomada, etc)"],
  "condition": "EXCELLENT | GOOD | FAIR | DAMAGED",
  "conditionScore": "número de 0 a 100",
  "issues": [
    {
      "type": "CRACK | STAIN | SCRATCH | DAMAGE | WEAR | MISSING",
      "severity": "LOW | MEDIUM | HIGH",
      "description": "descrição breve do problema"
    }
  ],
  "notes": "descrição técnica breve do ambiente e sua condição geral"
}`;

    // Chamar API da OpenAI
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o', // ou gpt-4-vision-preview
        max_tokens: 500,
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analise esta imagem de vistoria imobiliária e retorne o JSON conforme especificado.'
              },
              {
                type: 'image_url',
                image_url: { url: imageUrl }
              }
            ]
          }
        ]
      },
      {
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000, // 30 segundos
      }
    );

    // Extrair e limpar o JSON da resposta
    const content = response.data.choices[0]?.message?.content || '{}';

    // Limpar possíveis marcadores de código
    let cleanJson = content
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();

    // Tentar fazer parse do JSON
    let result;
    try {
      result = JSON.parse(cleanJson);
    } catch (parseError) {
      logger.warn(`Failed to parse AI response, using fallback: ${cleanJson}`);
      // Fallback se não conseguir fazer parse
      result = {
        roomType: 'Ambiente',
        items: [],
        condition: 'GOOD',
        conditionScore: 75,
        issues: [],
        notes: 'Análise automática não disponível para esta imagem.'
      };
    }

    logger.info(`AI Analysis Success: ${result.roomType} - ${result.condition}`);

    return res.json({
      success: true,
      analysis: result,
      model: response.data.model,
      usage: response.data.usage,
    });

  } catch (error: any) {
    logger.error(`AI Analysis Error: ${error.response?.data ? JSON.stringify(error.response.data) : error.message}`);

    if (axios.isAxiosError(error)) {
      // Retornar fallback gracioso em caso de erro
      return res.json({
        success: false,
        analysis: {
          roomType: 'Desconhecido',
          items: [],
          condition: 'GOOD',
          conditionScore: 70,
          issues: [],
          notes: 'Análise automática indisponível. Erro de conexão com serviço de IA.'
        },
        error: error.response?.data?.error?.message || error.message
      });
    }

    next(error);
  }
};

// ============================================
// 3. UPLOAD + ANÁLISE COMBINADOS
// ============================================
export const uploadAndAnalyze = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Verificar se tem arquivo
    if (!req.file) {
      throw new AppError(400, 'Nenhum arquivo enviado.');
    }

    logger.info(`Upload+Analyze: Processing ${req.file.originalname}`);

    // 1. Upload para IPFS
    const pinataJwt = await getConfig('PINATA_JWT');
    if (!pinataJwt) {
      if (req.file.path) fs.unlinkSync(req.file.path);
      throw new AppError(500, 'PINATA_JWT não configurado.');
    }

    const formData = new FormData();
    formData.append('file', fs.createReadStream(req.file.path), {
      filename: req.file.originalname,
      contentType: req.file.mimetype,
    });
    formData.append('pinataMetadata', JSON.stringify({
      name: `vistoria-${Date.now()}`,
    }));
    formData.append('pinataOptions', JSON.stringify({ cidVersion: 1 }));

    const pinataRes = await axios.post(
      'https://api.pinata.cloud/pinning/pinFileToIPFS',
      formData,
      {
        maxBodyLength: Infinity,
        headers: {
          'Authorization': `Bearer ${pinataJwt}`,
          ...formData.getHeaders()
        },
        timeout: 60000,
      }
    );

    fs.unlinkSync(req.file.path);

    const ipfsHash = pinataRes.data.IpfsHash;
    const publicUrl = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;

    logger.info(`IPFS uploaded: ${ipfsHash}`);

    // 2. Análise com IA
    const openaiApiKey = await getConfig('OPENAI_API_KEY');
    let analysis = {
      roomType: 'Ambiente',
      items: [],
      condition: 'GOOD',
      conditionScore: 75,
      issues: [],
      notes: 'Análise de IA não disponível.'
    };

    if (openaiApiKey) {
      try {
        const aiResponse = await axios.post(
          'https://api.openai.com/v1/chat/completions',
          {
            model: 'gpt-4o',
            max_tokens: 500,
            messages: [
              {
                role: 'user',
                content: [
                  {
                    type: 'text',
                    text: 'Analise esta imagem de vistoria imobiliária. Retorne APENAS um JSON com: roomType (string), items (array), condition (EXCELLENT|GOOD|FAIR|DAMAGED), conditionScore (0-100), issues (array com type, severity, description), notes (string).'
                  },
                  {
                    type: 'image_url',
                    image_url: { url: publicUrl }
                  }
                ]
              }
            ]
          },
          {
            headers: {
              'Authorization': `Bearer ${openaiApiKey}`,
              'Content-Type': 'application/json'
            },
            timeout: 30000,
          }
        );

        const content = aiResponse.data.choices[0]?.message?.content || '{}';
        const cleanJson = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

        try {
          analysis = JSON.parse(cleanJson);
        } catch {
          logger.warn('Failed to parse AI response');
        }

        logger.info(`AI analysis: ${analysis.roomType} - ${analysis.condition}`);
      } catch (aiError: unknown) {
        logger.warn(`AI analysis failed: ${aiError instanceof Error ? aiError.message : String(aiError)}`);
      }
    }

    // 3. Retornar resultado combinado
    return res.json({
      success: true,
      ipfsHash,
      publicUrl,
      analysis,
      timestamp: new Date().toISOString(),
    });

  } catch (error: unknown) {
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    logger.error(`Upload+Analyze Error: ${error instanceof Error ? error.message : String(error)}`);
    next(error);
  }
};

// ============================================
// 4. VERIFICAR STATUS DAS CONFIGURAÇÕES
// ============================================
export const checkConfig = async (_req: Request, res: Response) => {
  const pinataConfigured = !!(await getConfig('PINATA_JWT'));
  const openaiConfigured = !!(await getConfig('OPENAI_API_KEY'));
  const smartContractConfigured = !!(await getConfig('SMART_CONTRACT_ADDRESS'));

  return res.json({
    pinata: pinataConfigured,
    openai: openaiConfigured,
    smartContract: smartContractConfigured,
    ready: pinataConfigured && openaiConfigured,
  });
};
