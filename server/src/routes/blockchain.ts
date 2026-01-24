// ============================================
// BLOCKCHAIN ROUTES
// ============================================

import { Router } from 'express';
import { ethers } from 'ethers';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../middleware/error-handler.js';
import { requirePermission } from '../middleware/auth.js';
import { logger } from '../lib/logger.js';

const router = Router();

// Get blockchain config
async function getBlockchainConfig() {
  const configs = await prisma.systemConfig.findMany({
    where: {
      key: { in: ['POLYGON_RPC_URL', 'OPERATOR_PRIVATE_KEY', 'TREASURY_WALLET', 'NFT_CONTRACT_ADDRESS', 'VBRZ_TOKEN_ADDRESS'] },
    },
  });

  const configMap: Record<string, string> = {};
  for (const c of configs) {
    configMap[c.key] = c.value;
  }

  return configMap;
}

// Get network status
router.get('/status', requirePermission('blockchain.view'), async (_req, res, next) => {
  try {
    const config = await getBlockchainConfig();

    if (!config.POLYGON_RPC_URL) {
      return res.json({ connected: false, message: 'Blockchain not configured' });
    }

    const provider = new ethers.JsonRpcProvider(config.POLYGON_RPC_URL);
    const [network, blockNumber] = await Promise.all([
      provider.getNetwork(),
      provider.getBlockNumber(),
    ]);

    res.json({
      connected: true,
      network: network.name,
      chainId: Number(network.chainId),
      blockNumber,
      treasuryWallet: config.TREASURY_WALLET,
    });
  } catch (error) {
    next(new AppError(500, `Blockchain connection failed: ${error}`));
  }
});

// Get wallet balance
router.get('/wallet/:address', requirePermission('blockchain.view'), async (req, res, next) => {
  try {
    const config = await getBlockchainConfig();
    const provider = new ethers.JsonRpcProvider(config.POLYGON_RPC_URL);

    const balance = await provider.getBalance(req.params.address);

    res.json({
      address: req.params.address,
      balanceMatic: ethers.formatEther(balance),
      balanceWei: balance.toString(),
    });
  } catch (error) {
    next(error);
  }
});

// Mint NFT for contract
router.post('/nft/mint', requirePermission('blockchain.mint'), async (req, res, next) => {
  try {
    const schema = z.object({
      contractId: z.string().uuid(),
      recipientWallet: z.string().min(42),
    });

    const data = schema.parse(req.body);

    // Verificar contrato
    const contract = await prisma.rentContract.findUnique({
      where: { id: data.contractId },
      include: { property: true, nft: true },
    });

    if (!contract) {
      throw new AppError(404, 'Contract not found');
    }

    if (contract.nft) {
      throw new AppError(400, 'NFT already minted for this contract');
    }

    // Buscar ou criar wallet
    let wallet = await prisma.wallet.findUnique({
      where: { address: data.recipientWallet },
    });

    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: {
          address: data.recipientWallet,
          type: 'USER',
        },
      });
    }

    // TODO: Implementar mint real no smart contract
    // Por enquanto, simular
    const tokenId = `VB-${Date.now()}`;
    const txHash = `0x${crypto.randomUUID().replace(/-/g, '')}`;

    // Criar registro do NFT
    const nft = await prisma.rentContractNFT.create({
      data: {
        contractId: contract.id,
        tokenId,
        contractAddress: '0x...', // Endereco do contrato NFT
        ownerWalletId: wallet.id,
        mintedAt: new Date(),
      },
    });

    // Registrar transacao
    await prisma.blockchainTransaction.create({
      data: {
        txHash,
        type: 'MINT_NFT',
        status: 'PENDING',
        fromAddress: '0x0000000000000000000000000000000000000000',
        toAddress: data.recipientWallet,
        value: 0,
        contractNftId: nft.id,
      },
    });

    logger.info(`NFT minted: ${tokenId} for contract ${contract.id}`);

    res.status(201).json({
      success: true,
      nft,
      txHash,
    });
  } catch (error) {
    next(error);
  }
});

// Transfer NFT
router.post('/nft/transfer', requirePermission('blockchain.transfer'), async (req, res, next) => {
  try {
    const schema = z.object({
      nftId: z.string().uuid(),
      toAddress: z.string().min(42),
    });

    const data = schema.parse(req.body);

    const nft = await prisma.rentContractNFT.findUnique({
      where: { id: data.nftId },
      include: { ownerWallet: true },
    });

    if (!nft) {
      throw new AppError(404, 'NFT not found');
    }

    // TODO: Implementar transferencia real
    const txHash = `0x${crypto.randomUUID().replace(/-/g, '')}`;

    // Atualizar wallet
    let newWallet = await prisma.wallet.findUnique({
      where: { address: data.toAddress },
    });

    if (!newWallet) {
      newWallet = await prisma.wallet.create({
        data: {
          address: data.toAddress,
          type: 'USER',
        },
      });
    }

    await prisma.rentContractNFT.update({
      where: { id: nft.id },
      data: { ownerWalletId: newWallet.id },
    });

    // Registrar transacao
    await prisma.blockchainTransaction.create({
      data: {
        txHash,
        type: 'TRANSFER_NFT',
        status: 'PENDING',
        fromAddress: nft.ownerWallet.address,
        toAddress: data.toAddress,
        value: 0,
        contractNftId: nft.id,
      },
    });

    res.json({ success: true, txHash });
  } catch (error) {
    next(error);
  }
});

// Get transactions
router.get('/transactions', requirePermission('blockchain.view'), async (req, res, next) => {
  try {
    const { page = '1', limit = '20', type, status } = req.query;

    const where: Record<string, unknown> = {};
    if (type) where.type = type;
    if (status) where.status = status;

    const [transactions, total] = await Promise.all([
      prisma.blockchainTransaction.findMany({
        where,
        include: { contractNft: { select: { tokenId: true } } },
        skip: (parseInt(page as string) - 1) * parseInt(limit as string),
        take: parseInt(limit as string),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.blockchainTransaction.count({ where }),
    ]);

    res.json({
      transactions,
      total,
      page: parseInt(page as string),
      totalPages: Math.ceil(total / parseInt(limit as string)),
    });
  } catch (error) {
    next(error);
  }
});

// VBRz Token balance
router.get('/vbrz/balance/:address', requirePermission('blockchain.view'), async (req, res, next) => {
  try {
    const wallet = await prisma.wallet.findUnique({
      where: { address: req.params.address },
    });

    res.json({
      address: req.params.address,
      balance: wallet?.vbrzBalance?.toString() || '0',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
