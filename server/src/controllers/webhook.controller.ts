// ============================================
// WEBHOOK CONTROLLER - Gatilho do Asaas 🔔
// Quando o Asaas grita "PAYMENT_RECEIVED",
// chamamos o Robô de Liquidação
// ============================================

import type { Request, Response } from 'express';
import { logger } from '../lib/logger.js';
import { settleInvestmentOrder } from '../services/settlement.service.js';

/**
 * Handler principal do Webhook Asaas
 *
 * Fluxo:
 * 1. Asaas envia evento de pagamento confirmado
 * 2. Verificamos token de segurança
 * 3. Disparamos liquidação em background
 * 4. Respondemos 200 rapidamente (Asaas exige resposta rápida)
 */
export async function handleAsaasWebhook(req: Request, res: Response) {
  const event = req.body as {
    event: string;
    payment: {
      id: string;
      externalReference?: string;
      value?: number;
      status?: string;
      billingType?: string;
      customer?: string;
    };
  };

  // Verificação de Segurança (Token do Asaas)
  const asaasToken = req.headers['asaas-access-token'];
  if (process.env.ASAAS_WEBHOOK_TOKEN && asaasToken !== process.env.ASAAS_WEBHOOK_TOKEN) {
    logger.warn('[Webhook] Token Asaas inválido');
    return res.status(401).send();
  }

  // Log do evento
  logger.info(`🔔 Webhook Asaas: ${event.event} - ID: ${event.payment?.id}`);

  // Se o pagamento foi confirmado
  if (event.event === 'PAYMENT_RECEIVED' || event.event === 'PAYMENT_CONFIRMED') {
    const paymentId = event.payment?.id;

    if (!paymentId) {
      logger.warn('[Webhook] Pagamento sem ID');
      return res.status(200).send({ received: true });
    }

    // Dispara a liquidação em Background (sem travar a resposta pro Asaas)
    settleInvestmentOrder(paymentId).catch(err =>
      logger.error(`[Webhook] Erro no processamento async: ${err}`)
    );
  }

  return res.status(200).send({ received: true });
}

/**
 * Handler alternativo que usa o asaasPaymentId diretamente
 * Pode ser usado para reprocessar pagamentos manualmente
 */
export async function reprocessPayment(req: Request, res: Response) {
  try {
    const { paymentId } = req.params;

    if (!paymentId) {
      return res.status(400).json({
        success: false,
        error: 'paymentId é obrigatório',
      });
    }

    logger.info(`🔄 Reprocessando pagamento: ${paymentId}`);

    // Executa a liquidação de forma síncrona para dar feedback
    await settleInvestmentOrder(paymentId);

    return res.json({
      success: true,
      message: 'Pagamento reprocessado com sucesso',
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error(`[Webhook] Erro ao reprocessar: ${errorMessage}`);

    return res.status(500).json({
      success: false,
      error: 'Erro ao reprocessar pagamento',
    });
  }
}

export default {
  handleAsaasWebhook,
  reprocessPayment,
};
