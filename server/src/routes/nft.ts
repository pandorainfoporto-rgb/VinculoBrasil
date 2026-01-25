/**
 * NFT Routes - API para minting e consulta de NFTs de Vistoria
 *
 * Endpoints:
 * POST   /api/nft/mint              - Mintar novo NFT de vistoria
 * GET    /api/nft/:tokenId          - Consultar NFT por ID
 * GET    /api/nft/owner/:address    - Listar NFTs de um dono
 * GET    /api/nft/health            - Status do serviço
 */

import { Router, type Request, type Response } from 'express';
import { z } from 'zod';
import { nftService } from '../lib/nft-service.js';
import { logger } from '../lib/logger.js';

const router = Router();

// Schema de validação para mint
const MintNFTSchema = z.object({
  ownerAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address'),
  propertyAddress: z.string().min(1, 'Property address is required'),
  inspectionType: z.enum(['ENTRADA', 'SAIDA', 'CONTRATO']),
  photos: z
    .array(
      z.object({
        path: z.string(),
        description: z.string().optional(),
      })
    )
    .min(1, 'At least one photo is required'),
  inspector: z.string().min(1, 'Inspector name is required'),
  notes: z.string().optional(),
});

/**
 * POST /api/nft/mint
 * Mintar novo NFT de vistoria
 */
router.post('/mint', async (req: Request, res: Response) => {
  try {
    // Validar request body
    const validatedData = MintNFTSchema.parse(req.body);

    logger.info('NFT mint request received', {
      propertyAddress: validatedData.propertyAddress,
      inspectionType: validatedData.inspectionType,
    });

    // Mintar NFT
    const result = await nftService.mintInspectionNFT(validatedData);

    logger.info('NFT minted successfully', {
      tokenId: result.tokenId,
      txHash: result.transactionHash,
    });

    res.status(201).json({
      success: true,
      message: 'NFT minted successfully',
      data: result,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors,
      });
    }

    logger.error('Failed to mint NFT', error);

    res.status(500).json({
      success: false,
      message: 'Failed to mint NFT',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/nft/:tokenId
 * Consultar NFT por token ID
 */
router.get('/:tokenId', async (req: Request, res: Response) => {
  try {
    const tokenId = parseInt(req.params.tokenId);

    if (isNaN(tokenId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid token ID',
      });
    }

    const [metadata, owner, tokenURI] = await Promise.all([
      nftService.getNFTMetadata(tokenId),
      nftService.getNFTOwner(tokenId),
      nftService.getTokenURI(tokenId),
    ]);

    res.json({
      success: true,
      data: {
        tokenId,
        owner,
        tokenURI,
        metadata,
      },
    });
  } catch (error) {
    logger.error(`Failed to get NFT ${req.params.tokenId}`, error);

    res.status(500).json({
      success: false,
      message: 'Failed to get NFT',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * GET /api/nft/total-supply
 * Total de NFTs mintados
 */
router.get('/stats/total-supply', async (req: Request, res: Response) => {
  try {
    const totalSupply = await nftService.getTotalSupply();

    res.json({
      success: true,
      data: {
        totalSupply,
      },
    });
  } catch (error) {
    logger.error('Failed to get total supply', error);

    res.status(500).json({
      success: false,
      message: 'Failed to get total supply',
    });
  }
});

/**
 * GET /api/nft/health
 * Status do serviço NFT
 */
router.get('/health', async (req: Request, res: Response) => {
  try {
    const health = await nftService.checkHealth();

    res.json({
      success: true,
      data: health,
    });
  } catch (error) {
    logger.error('NFT service health check failed', error);

    res.status(503).json({
      success: false,
      message: 'NFT service unavailable',
    });
  }
});

/**
 * POST /api/nft/estimate-gas
 * Estimar custo de gas para mintar NFT
 */
router.post('/estimate-gas', async (req: Request, res: Response) => {
  try {
    const validatedData = MintNFTSchema.parse(req.body);

    const estimate = await nftService.estimateMintGas(validatedData);

    res.json({
      success: true,
      data: estimate,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors,
      });
    }

    logger.error('Failed to estimate gas', error);

    res.status(500).json({
      success: false,
      message: 'Failed to estimate gas',
    });
  }
});

export default router;
