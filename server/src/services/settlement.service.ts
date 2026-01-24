// ============================================
// SETTLEMENT SERVICE - Robô de Liquidação 🤖
// Escuta o "PLIM" do Asaas e corre na Blockchain
// para entregar o Token na carteira invisível do investidor
// ============================================

import { ethers } from 'ethers';
import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';
import { getBlockchainConfig } from './config.service.js';
import { getUserWallet, getWalletAddress, createManagedWallet } from './wallet.service.js';
import { RECEIVABLES_ABI } from '../lib/abis.js';
import { sendInvestmentReceipt } from './notification.service.js';

// ============================================
// TYPES
// ============================================

export interface PurchaseIntent {
  id: string;
  listingId: string;
  buyerId: string;
  sellerId: string;
  amount: number;         // Valor em Reais
  tokenId: string;        // ID do token ERC-1155
  asaasChargeId?: string; // ID da cobrança no Asaas
  status: 'PENDING' | 'PAID' | 'SETTLED' | 'FAILED' | 'CANCELLED';
}

// ============================================
// HELPERS
// ============================================

/**
 * Obtém o provider do Polygon
 */
const getProvider = async (): Promise<ethers.JsonRpcProvider> => {
  const config = await getBlockchainConfig();
  return new ethers.JsonRpcProvider(config.rpcUrl);
};

/**
 * Obtém a carteira admin para pagar gas
 */
const getAdminWallet = async (): Promise<ethers.Wallet> => {
  const adminPrivateKey = process.env.ADMIN_PRIVATE_KEY;
  if (!adminPrivateKey) {
    throw new Error('ADMIN_PRIVATE_KEY não configurado');
  }
  const provider = await getProvider();
  return new ethers.Wallet(adminPrivateKey, provider);
};

/**
 * Obtém o contrato de recebíveis
 */
const getReceivablesContract = async (signer: ethers.Signer): Promise<ethers.Contract> => {
  const config = await getBlockchainConfig();
  return new ethers.Contract(config.receivablesContract, RECEIVABLES_ABI, signer);
};

// ============================================
// SETTLEMENT FUNCTIONS
// ============================================

/**
 * Liquida um investimento após pagamento Pix confirmado
 *
 * Fluxo:
 * 1. Asaas confirma pagamento via Webhook
 * 2. Esta função é chamada
 * 3. Backend transfere o token do vendedor para o comprador
 * 4. Atualiza splits para redirecionar aluguéis futuros
 *
 * @param listingId - ID da oferta P2P no banco
 * @param buyerId - ID do comprador
 * @param asaasPaymentId - ID do pagamento no Asaas (para referência)
 */
export const settleInvestment = async (
  listingId: string,
  buyerId: string,
  asaasPaymentId?: string
): Promise<{
  success: boolean;
  txHash?: string;
  error?: string;
}> => {
  try {
    logger.info(`[Settlement] Iniciando liquidação: Listing ${listingId}, Buyer ${buyerId}`);

    // 1. Buscar a oferta no banco
    const listing = await prisma.p2PListing.findUnique({
      where: { id: listingId },
      include: {
        contract: {
          include: {
            property: true,
          },
        },
      },
    });

    if (!listing) {
      throw new Error('Oferta não encontrada');
    }

    if (listing.status !== 'ACTIVE') {
      throw new Error(`Oferta não está ativa. Status: ${listing.status}`);
    }

    // 2. Buscar comprador e sua carteira
    const buyer = await prisma.user.findUnique({
      where: { id: buyerId },
      select: {
        id: true,
        email: true,
        managedWalletAddress: true,
      },
    });

    if (!buyer) {
      throw new Error('Comprador não encontrado');
    }

    // Criar carteira para o comprador se não tiver
    let buyerWalletAddress = buyer.managedWalletAddress;
    if (!buyerWalletAddress) {
      logger.info(`[Settlement] Criando carteira para comprador ${buyer.email}`);
      buyerWalletAddress = await createManagedWallet(buyer.id);
    }

    // 3. Buscar vendedor
    const seller = await prisma.user.findUnique({
      where: { id: listing.sellerId },
      select: {
        id: true,
        email: true,
        managedWalletAddress: true,
      },
    });

    if (!seller?.managedWalletAddress) {
      throw new Error('Vendedor não possui carteira gerenciada');
    }

    // 4. Configurar blockchain
    const adminWallet = await getAdminWallet();
    const receivablesContract = await getReceivablesContract(adminWallet);
    const config = await getBlockchainConfig();

    logger.info(`[Settlement] Transferindo Token #${listing.receivableTokenId}`);
    logger.info(`[Settlement] De: ${seller.managedWalletAddress}`);
    logger.info(`[Settlement] Para: ${buyerWalletAddress}`);

    // 5. Verificar se admin tem aprovação para transferir
    // IMPORTANTE: O vendedor precisa ter aprovado o contrato admin como operator
    // Isso pode ser feito no momento da listagem ou via setApprovalForAll

    // 6. Executar transferência via Admin (forceTransfer ou safeTransferFrom)
    // O admin atua como "trusted forwarder" - precisa ter permissão no contrato
    const tx = await receivablesContract.safeTransferFrom(
      seller.managedWalletAddress,    // from
      buyerWalletAddress,              // to
      listing.receivableTokenId,       // tokenId
      1,                               // amount (1 para tokens únicos)
      '0x'                             // data (vazio)
    );

    logger.info(`[Settlement] Transação enviada: ${tx.hash}`);

    const receipt = await tx.wait();

    logger.info(`[Settlement] Transação confirmada! Block: ${receipt.blockNumber}`);

    // 7. Atualizar oferta como vendida
    await prisma.p2PListing.update({
      where: { id: listingId },
      data: {
        status: 'SOLD',
        buyerId: buyerId,
        buyerWallet: buyerWalletAddress,
        soldPrice: listing.askingPrice,
        soldAt: new Date(),
        saleTxHash: tx.hash,
      },
    });

    // 8. Criar regra de split para redirecionar aluguéis
    await prisma.contractSplitRule.create({
      data: {
        contractId: listing.contractId,
        recipientId: buyerId,
        recipientType: 'INVESTOR',
        recipientWalletId: null, // Pode ser preenchido com subconta Asaas
        startDate: new Date(),
        endDate: listing.endMonth,
        sharePercent: 0.85, // Investidor recebe a parte do proprietário
        sourceType: 'P2P_SALE',
        sourceId: listingId,
        isActive: true,
      },
    });

    // 9. Registrar transação P2P
    await prisma.p2PTransaction.create({
      data: {
        listingId: listingId,
        sellerId: listing.sellerId,
        buyerId: buyerId,
        amount: listing.askingPrice,
        platformFee: listing.platformFee || 0,
        netToSeller: Number(listing.askingPrice) - Number(listing.platformFee || 0),
        paymentMethod: 'PIX',
        paymentReference: asaasPaymentId,
        txHash: tx.hash,
        blockNumber: receipt.blockNumber,
        status: 'CONFIRMED',
        confirmedAt: new Date(),
      },
    });

    // 10. Atualizar estatísticas do investidor
    const investorRecord = await prisma.investor.findUnique({
      where: { userId: buyerId },
    });

    if (investorRecord) {
      await prisma.investor.update({
        where: { id: investorRecord.id },
        data: {
          totalPurchases: { increment: 1 },
          totalInvested: { increment: Number(listing.askingPrice) },
        },
      });
    }

    logger.info(`[Settlement] Liquidação concluída com sucesso!`);
    logger.info(`[Settlement] Investidor ${buyer.email} agora recebe os aluguéis do contrato ${listing.contractId}`);

    return {
      success: true,
      txHash: tx.hash,
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`[Settlement] Erro na liquidação: ${errorMessage}`);

    return {
      success: false,
      error: errorMessage,
    };
  }
};

/**
 * Processa webhook do Asaas quando pagamento é confirmado
 * Chamado pela rota de webhooks
 */
export const handleAsaasPaymentConfirmed = async (
  paymentId: string,
  externalReference?: string
): Promise<void> => {
  try {
    logger.info(`[Settlement] Webhook Asaas: Pagamento ${paymentId} confirmado`);

    // O externalReference deve conter o formato: "P2P:<listingId>:<buyerId>"
    if (!externalReference?.startsWith('P2P:')) {
      logger.info(`[Settlement] Pagamento ${paymentId} não é P2P, ignorando`);
      return;
    }

    const parts = externalReference.split(':');
    if (parts.length !== 3) {
      logger.warn(`[Settlement] Referência inválida: ${externalReference}`);
      return;
    }

    const [, listingId, buyerId] = parts;

    const result = await settleInvestment(listingId, buyerId, paymentId);

    if (!result.success) {
      logger.error(`[Settlement] Falha ao liquidar: ${result.error}`);
      // TODO: Criar alerta para operações ou retry automático
    }
  } catch (error) {
    logger.error(`[Settlement] Erro no webhook: ${error}`);
    throw error;
  }
};

/**
 * Cria uma intenção de compra (usado antes do Pix)
 * Retorna os dados para gerar a cobrança no Asaas
 */
export const createPurchaseIntent = async (
  listingId: string,
  buyerId: string
): Promise<{
  intentId: string;
  listing: {
    id: string;
    askingPrice: number;
    monthlyValue: number;
    totalMonths: number;
    contractId: string;
  };
  externalReference: string;
}> => {
  // 1. Buscar oferta
  const listing = await prisma.p2PListing.findUnique({
    where: { id: listingId },
  });

  if (!listing || listing.status !== 'ACTIVE') {
    throw new Error('Oferta não disponível');
  }

  // 2. Verificar se comprador não é o vendedor
  if (listing.sellerId === buyerId) {
    throw new Error('Você não pode comprar sua própria oferta');
  }

  // 3. Gerar referência externa para rastrear no webhook
  const externalReference = `P2P:${listingId}:${buyerId}`;

  // TODO: Criar registro de intenção de compra se quiser bloquear vendas duplicadas

  return {
    intentId: `intent_${listingId}_${Date.now()}`,
    listing: {
      id: listing.id,
      askingPrice: Number(listing.askingPrice),
      monthlyValue: Number(listing.monthlyValue),
      totalMonths: listing.totalMonths,
      contractId: listing.contractId,
    },
    externalReference,
  };
};

// ============================================
// SETTLE INVESTMENT ORDER - Por asaasPaymentId
// Função principal chamada pelo webhook controller
// ============================================

/**
 * Liquida um pedido de investimento pelo ID do pagamento Asaas
 * Esta é a função que o webhook chama diretamente
 *
 * Fluxo:
 * 1. Busca o pedido pelo asaasPaymentId (status PENDING ou AWAITING_PAYMENT)
 * 2. Configura conexão Blockchain (Admin Wallet)
 * 3. Executa transferência do Token para carteira invisível do investidor
 * 4. Atualiza banco de dados: pedido, oferta, regras de split
 *
 * @param asaasPaymentId - ID do pagamento confirmado no Asaas
 */
export const settleInvestmentOrder = async (asaasPaymentId: string): Promise<void> => {
  logger.info(`🤖 Iniciando Liquidação para Pagamento: ${asaasPaymentId}`);

  // 1. Buscar o Pedido Pendente
  const order = await prisma.investmentOrder.findFirst({
    where: {
      asaasPaymentId,
      status: { in: ['PENDING', 'AWAITING_PAYMENT', 'PAID'] },
    },
  });

  if (!order) {
    logger.warn(`⚠️ Pedido não encontrado ou já processado para ID: ${asaasPaymentId}`);
    return;
  }

  // Buscar listing e dados relacionados
  const listing = await prisma.p2PListing.findUnique({
    where: { id: order.listingId },
    include: {
      contract: {
        include: {
          property: true,
        },
      },
    },
  });

  if (!listing) {
    logger.error(`❌ Listing não encontrado: ${order.listingId}`);
    await prisma.investmentOrder.update({
      where: { id: order.id },
      data: {
        status: 'FAILED',
        errorMessage: 'Listing não encontrado',
      },
    });
    return;
  }

  // Buscar dados do usuário comprador
  const user = await prisma.user.findUnique({
    where: { id: order.userId },
  });

  if (!user) {
    logger.error(`❌ Usuário não encontrado: ${order.userId}`);
    await prisma.investmentOrder.update({
      where: { id: order.id },
      data: {
        status: 'FAILED',
        errorMessage: 'Usuário não encontrado',
      },
    });
    return;
  }

  try {
    // Atualizar status para SETTLING
    await prisma.investmentOrder.update({
      where: { id: order.id },
      data: {
        status: 'SETTLING',
        paidAt: new Date(),
      },
    });

    // 2. Configurar Blockchain (Admin Wallet)
    // A carteira Admin paga o gás e executa a transferência
    const rpcUrl = process.env.POLYGON_RPC_URL || 'https://polygon-rpc.com';
    const provider = new ethers.JsonRpcProvider(rpcUrl);

    if (!process.env.ADMIN_PRIVATE_KEY) {
      throw new Error('ADMIN_PRIVATE_KEY não configurado');
    }

    const adminWallet = new ethers.Wallet(process.env.ADMIN_PRIVATE_KEY, provider);

    const receivablesContractAddress =
      process.env.VITE_RECEIVABLES_CONTRACT_ADDRESS ||
      process.env.RECEIVABLES_CONTRACT_ADDRESS ||
      '0x4081D8c80bae80aB36AaE3e83082BE1083C32F9A';

    const receivablesContract = new ethers.Contract(
      receivablesContractAddress,
      RECEIVABLES_ABI,
      adminWallet
    );

    // Garantir que usuário tem carteira gerenciada
    let buyerWallet = user.managedWalletAddress;
    if (!buyerWallet) {
      logger.info(`🔐 Criando carteira gerenciada para usuário ${user.email}`);
      buyerWallet = await createManagedWallet(user.id);
    }

    // 3. Executar Transferência na Blockchain
    // De: Vendedor (Seller) -> Para: Investidor (Managed Wallet)
    logger.info(`🚚 Transferindo Token ID ${listing.receivableTokenId} na Polygon...`);
    logger.info(`   De: ${listing.sellerWallet}`);
    logger.info(`   Para: ${buyerWallet}`);

    const tx = await receivablesContract.safeTransferFrom(
      listing.sellerWallet,    // De quem sai
      buyerWallet,             // Pra quem vai (Carteira Invisível)
      listing.receivableTokenId, // Token ID
      order.amountInTokens,    // Quantidade
      '0x'                     // Data vazia
    );

    logger.info(`⏳ Aguardando mineração: ${tx.hash}`);
    const receipt = await tx.wait();

    logger.info(`✅ Transação confirmada! Block: ${receipt.blockNumber}`);

    // 4. Atualizar Banco de Dados (Sucesso)

    // A. Marca Pedido como Concluído
    await prisma.investmentOrder.update({
      where: { id: order.id },
      data: {
        status: 'COMPLETED',
        txHash: tx.hash,
        blockNumber: receipt.blockNumber,
        settledAt: new Date(),
      },
    });

    // B. Marca Oferta como Vendida
    await prisma.p2PListing.update({
      where: { id: order.listingId },
      data: {
        status: 'SOLD',
        buyerId: order.userId,
        buyerWallet: buyerWallet,
        soldPrice: order.totalPrice,
        soldAt: new Date(),
        saleTxHash: tx.hash,
      },
    });

    // C. CRÍTICO: Criar Regra de Split do Aluguel (Asaas)
    // Isso garante que o próximo boleto de aluguel vá para o Investidor
    await prisma.contractSplitRule.create({
      data: {
        contractId: listing.contractId,
        recipientId: order.userId,
        recipientType: 'INVESTOR',
        recipientWalletId: null, // Pode ser preenchido com subconta Asaas depois
        recipientPixKey: user.pixKey || null,
        startDate: new Date(),
        endDate: listing.endMonth,
        sharePercent: 0.85, // Investidor recebe a parte do proprietário (85%)
        sourceType: 'P2P_SALE',
        sourceId: order.id,
        isActive: true,
      },
    });

    // D. Registrar transação P2P
    await prisma.p2PTransaction.create({
      data: {
        listingId: order.listingId,
        sellerId: listing.sellerId,
        buyerId: order.userId,
        amount: order.totalPrice,
        platformFee: order.platformFee || 0,
        netToSeller: Number(order.totalPrice) - Number(order.platformFee || 0),
        paymentMethod: 'PIX',
        paymentReference: asaasPaymentId,
        txHash: tx.hash,
        blockNumber: receipt.blockNumber,
        status: 'CONFIRMED',
        confirmedAt: new Date(),
      },
    });

    // E. Atualizar estatísticas do investidor (se existir)
    const investorRecord = await prisma.investor.findUnique({
      where: { userId: order.userId },
    });

    if (investorRecord) {
      await prisma.investor.update({
        where: { id: investorRecord.id },
        data: {
          totalPurchases: { increment: 1 },
          totalInvested: { increment: Number(order.totalPrice) },
        },
      });
    }

    logger.info(`🎉 INVESTIMENTO CONCLUÍDO!`);
    logger.info(`   ✅ Token transferido para ${buyerWallet}`);
    logger.info(`   ✅ Fluxo de aluguel redirecionado para o investidor`);
    logger.info(`   ✅ TX: ${tx.hash}`);

    // F. Enviar comprovante de investimento por email
    try {
      logger.info(`📧 Enviando comprovante de investimento para ${user.email}`);

      const emailResult = await sendInvestmentReceipt({
        investorEmail: user.email,
        investorName: user.name || user.email,
        listingId: listing.id,
        propertyTitle: listing.contract?.property?.address || 'Imóvel não identificado',
        amountPaid: Number(order.totalPrice),
        monthsInvested: listing.totalMonths,
        paymentDate: new Date(),
        txHash: tx.hash,
      });

      if (emailResult.success) {
        logger.info(`✅ Comprovante enviado com sucesso! Message ID: ${emailResult.messageId}`);
      } else {
        logger.warn(`⚠️ Falha ao enviar comprovante: ${emailResult.error}`);
        // Não falhamos a liquidação se o email falhar
      }
    } catch (emailError) {
      logger.warn(`⚠️ Erro ao enviar email de comprovante: ${emailError}`);
      // Não falhamos a liquidação se o email falhar
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`❌ Erro crítico na liquidação: ${errorMessage}`);

    // Marcar pedido como FAILED
    await prisma.investmentOrder.update({
      where: { id: order.id },
      data: {
        status: 'FAILED',
        errorMessage: errorMessage,
      },
    });

    // TODO: Criar alerta para suporte ou lógica de reembolso
  }
};

export default {
  settleInvestment,
  settleInvestmentOrder,
  handleAsaasPaymentConfirmed,
  createPurchaseIntent,
};
