// ============================================
// WEBHOOKS ROUTES (Asaas, Transfero, etc.)
// Robô de Liquidação 🤖 - Escuta o "PLIM" do Asaas
// ============================================

import { Router } from 'express';
import crypto from 'crypto';
import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';
import { redis } from '../lib/redis.js';
import {
  handleAsaasPaymentConfirmed,
  settleInvestmentOrder,
} from '../services/settlement.service.js';
import { processPaymentConfirmed as processInvestmentPayment } from '../controllers/invest.controller.js';
import { handleAsaasWebhook, reprocessPayment } from '../controllers/webhook.controller.js';

const router = Router();

// ============================================
// ROTA ALTERNATIVA - Controller simplificado
// Pode ser usada como endpoint direto do Asaas
// ============================================
router.post('/asaas-simple', handleAsaasWebhook);

// ============================================
// ROTA DE REPROCESSAMENTO (Admin)
// Para reprocessar pagamentos manualmente
// ============================================
router.post('/reprocess/:paymentId', reprocessPayment);

// ============================================
// ASAAS WEBHOOK PRINCIPAL
// Processa todos os tipos de pagamento
// ============================================
router.post('/asaas', async (req, res) => {
  try {
    const event = req.body.event;
    const payment = req.body.payment;

    // Log webhook
    await prisma.webhookLog.create({
      data: {
        provider: 'asaas',
        event,
        payload: req.body,
      },
    });

    logger.info(`Asaas webhook: ${event}`);

    switch (event) {
      case 'PAYMENT_CONFIRMED':
      case 'PAYMENT_RECEIVED': {
        // ============================================
        // 🤖 ROBÔ DE LIQUIDAÇÃO - Ordem de processamento:
        // 1. INV: -> Sistema novo de Investment Order
        // 2. P2P: -> Sistema legado de P2P
        // 3. Direct -> Busca por asaasPaymentId direto
        // 4. Normal -> Pagamento de aluguel
        // ============================================

        // ============================================
        // 1. VERIFICAR SE É PAGAMENTO DE INVESTIMENTO (novo)
        // O externalReference começa com "INV:" (novo sistema)
        // ============================================
        if (payment.externalReference?.startsWith('INV:')) {
          logger.info(`🔔 [Webhook] Pagamento de Investimento (INV): ${payment.externalReference}`);
          try {
            await processInvestmentPayment(payment.externalReference, payment.id);
          } catch (invError) {
            logger.error(`❌ [Webhook] Erro ao processar investimento: ${invError}`);
          }
          break;
        }

        // ============================================
        // 2. VERIFICAR SE É PAGAMENTO P2P (legado)
        // O externalReference começa com "P2P:"
        // ============================================
        if (payment.externalReference?.startsWith('P2P:')) {
          logger.info(`🔔 [Webhook] Pagamento P2P detectado: ${payment.externalReference}`);
          try {
            await handleAsaasPaymentConfirmed(payment.id, payment.externalReference);
          } catch (p2pError) {
            logger.error(`❌ [Webhook] Erro ao liquidar P2P: ${p2pError}`);
          }
          break;
        }

        // ============================================
        // 3. TENTAR LIQUIDAÇÃO DIRETA POR asaasPaymentId
        // Caso o pedido esteja vinculado diretamente ao paymentId
        // ============================================
        const investmentOrder = await prisma.investmentOrder.findFirst({
          where: { asaasPaymentId: payment.id },
        });

        if (investmentOrder) {
          logger.info(`🤖 [Webhook] Liquidação direta por asaasPaymentId: ${payment.id}`);
          try {
            // Dispara em background para não travar a resposta
            settleInvestmentOrder(payment.id).catch(err =>
              logger.error(`❌ [Webhook] Erro na liquidação direta: ${err}`)
            );
          } catch (directError) {
            logger.error(`❌ [Webhook] Erro ao chamar settleInvestmentOrder: ${directError}`);
          }
          break;
        }

        // ============================================
        // 4. PAGAMENTO NORMAL (Aluguel)
        // ============================================
        const dbPayment = await prisma.payment.findFirst({
          where: { gatewayId: payment.id },
        });

        if (dbPayment) {
          await prisma.payment.update({
            where: { id: dbPayment.id },
            data: {
              status: 'PAID',
              paidAt: new Date(),
            },
          });

          // Adicionar job para processar split
          await redis.lpush('payment:split', JSON.stringify({
            paymentId: dbPayment.id,
            amount: payment.value,
          }));
        }
        break;
      }

      case 'PAYMENT_OVERDUE': {
        const dbPayment = await prisma.payment.findFirst({
          where: { gatewayId: payment.id },
        });

        if (dbPayment) {
          await prisma.payment.update({
            where: { id: dbPayment.id },
            data: { status: 'OVERDUE' },
          });
        }
        break;
      }
    }

    res.json({ received: true });
  } catch (error) {
    logger.error('Asaas webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Transfero Webhook
router.post('/transfero', async (req, res) => {
  try {
    const { type, data } = req.body;

    await prisma.webhookLog.create({
      data: {
        provider: 'transfero',
        event: type,
        payload: req.body,
      },
    });

    logger.info(`Transfero webhook: ${type}`);

    switch (type) {
      case 'swap.completed': {
        // VBRz swap completado
        await prisma.vBRzTransaction.create({
          data: {
            type: 'TRANSFER',
            amount: data.amount,
            fromAddress: data.from,
            toAddress: data.to,
            txHash: data.txHash,
            description: `Swap ${data.fromCurrency} -> ${data.toCurrency}`,
          },
        });
        break;
      }
    }

    res.json({ received: true });
  } catch (error) {
    logger.error('Transfero webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// WhatsApp Webhook (Baileys callback)
router.post('/whatsapp', async (req, res) => {
  try {
    const { type, message, from } = req.body;

    await prisma.webhookLog.create({
      data: {
        provider: 'whatsapp',
        event: type,
        payload: req.body,
      },
    });

    if (type === 'message') {
      // Buscar ou criar ticket
      let ticket = await prisma.ticket.findFirst({
        where: {
          contactPhone: from,
          status: { notIn: ['RESOLVED', 'CLOSED'] },
        },
      });

      if (!ticket) {
        ticket = await prisma.ticket.create({
          data: {
            contactPhone: from,
            contactName: message.pushName || from,
            channel: 'WHATSAPP',
          },
        });
      }

      // Criar mensagem
      await prisma.message.create({
        data: {
          ticketId: ticket.id,
          content: message.body,
          contentType: message.type === 'image' ? 'IMAGE' : 'TEXT',
          senderType: 'CUSTOMER',
          senderName: message.pushName,
          channel: 'WHATSAPP',
          externalId: message.id,
        },
      });

      // Adicionar job para IA responder
      await redis.lpush('ai:process', JSON.stringify({
        ticketId: ticket.id,
        message: message.body,
      }));
    }

    res.json({ received: true });
  } catch (error) {
    logger.error('WhatsApp webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Blockchain Events (Polygon listener)
router.post('/blockchain', async (req, res) => {
  try {
    const { event, data, txHash } = req.body;

    // Verificar assinatura
    const signature = req.headers['x-blockchain-signature'];
    const expectedSignature = crypto
      .createHmac('sha256', process.env.BLOCKCHAIN_WEBHOOK_SECRET || '')
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (signature !== expectedSignature) {
      return res.status(401).json({ error: 'Invalid signature' });
    }

    await prisma.webhookLog.create({
      data: {
        provider: 'blockchain',
        event,
        payload: req.body,
      },
    });

    logger.info(`Blockchain event: ${event}`);

    switch (event) {
      case 'NFT_MINTED': {
        await prisma.blockchainTransaction.create({
          data: {
            txHash,
            type: 'MINT_NFT',
            status: 'CONFIRMED',
            fromAddress: data.from,
            toAddress: data.to,
            value: 0,
            confirmedAt: new Date(),
          },
        });
        break;
      }

      case 'SPLIT_EXECUTED': {
        // Split de pagamento executado
        await prisma.blockchainTransaction.create({
          data: {
            txHash,
            type: 'SPLIT_PAYMENT',
            status: 'CONFIRMED',
            fromAddress: data.from,
            toAddress: data.treasury,
            value: data.amount,
            confirmedAt: new Date(),
          },
        });
        break;
      }
    }

    res.json({ received: true });
  } catch (error) {
    logger.error('Blockchain webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

export default router;
