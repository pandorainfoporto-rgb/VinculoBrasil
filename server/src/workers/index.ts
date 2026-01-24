// ============================================
// WORKERS (BullMQ)
// ============================================

import { Worker, Queue } from 'bullmq';
import { redis } from '../lib/redis.js';
import { logger } from '../lib/logger.js';
import { prisma } from '../lib/prisma.js';
import nodemailer from 'nodemailer';

// ============================================
// QUEUES
// ============================================

export const emailQueue = new Queue('email', { connection: redis as any });
export const whatsappQueue = new Queue('whatsapp', { connection: redis as any });
export const blockchainQueue = new Queue('blockchain', { connection: redis as any });
export const aiQueue = new Queue('ai', { connection: redis as any });

// ============================================
// EMAIL WORKER
// ============================================

async function getSmtpConfig() {
  const configs = await prisma.systemConfig.findMany({
    where: {
      key: { in: ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS', 'SMTP_FROM'] },
    },
  });

  const configMap: Record<string, string> = {};
  for (const c of configs) {
    configMap[c.key] = c.value;
  }

  return configMap;
}

const emailWorker = new Worker(
  'email',
  async (job) => {
    const { to, subject, html, text } = job.data;

    const smtpConfig = await getSmtpConfig();

    if (!smtpConfig.SMTP_HOST) {
      logger.warn('SMTP not configured, skipping email');
      return;
    }

    const transporter = nodemailer.createTransport({
      host: smtpConfig.SMTP_HOST,
      port: parseInt(smtpConfig.SMTP_PORT || '587'),
      secure: smtpConfig.SMTP_PORT === '465',
      auth: {
        user: smtpConfig.SMTP_USER,
        pass: smtpConfig.SMTP_PASS, // TODO: Decrypt
      },
    });

    await transporter.sendMail({
      from: smtpConfig.SMTP_FROM || 'noreply@vinculobrasil.com.br',
      to,
      subject,
      html,
      text,
    });

    logger.info(`Email sent to ${to}: ${subject}`);
  },
  { connection: redis as any }
);

emailWorker.on('failed', (job, err) => {
  logger.error(`Email job ${job?.id} failed: ${err?.message || err}`);
});

// ============================================
// WHATSAPP WORKER
// ============================================

const whatsappWorker = new Worker(
  'whatsapp',
  async (job) => {
    const { to, message, type } = job.data;

    // TODO: Integrar com Baileys
    logger.info(`WhatsApp message to ${to}: ${message.substring(0, 50)}...`);

    // Simular envio
    await new Promise((resolve) => setTimeout(resolve, 100));
  },
  { connection: redis as any }
);

whatsappWorker.on('failed', (job, err) => {
  logger.error(`WhatsApp job ${job?.id} failed: ${err?.message || err}`);
});

// ============================================
// BLOCKCHAIN WORKER
// ============================================

const blockchainWorker = new Worker(
  'blockchain',
  async (job) => {
    const { action, data } = job.data;

    logger.info(`Blockchain action: ${action}`);

    switch (action) {
      case 'mint_nft':
        // TODO: Implementar mint real
        break;

      case 'execute_split':
        // TODO: Implementar split de pagamento
        break;

      case 'transfer_token':
        // TODO: Implementar transferencia VBRz
        break;
    }
  },
  { connection: redis as any }
);

blockchainWorker.on('failed', (job, err) => {
  logger.error(`Blockchain job ${job?.id} failed: ${err?.message || err}`);
});

// ============================================
// AI WORKER (OpenAI)
// ============================================

const aiWorker = new Worker(
  'ai',
  async (job) => {
    const { ticketId, message } = job.data;

    // TODO: Integrar com OpenAI para resposta automatica
    logger.info(`AI processing for ticket ${ticketId}`);

    // Por enquanto, apenas log
  },
  { connection: redis as any }
);

aiWorker.on('failed', (job, err) => {
  logger.error(`AI job ${job?.id} failed: ${err?.message || err}`);
});

// ============================================
// INIT
// ============================================

export async function initWorkers() {
  logger.info('Workers initialized');

  // Verificar filas
  const emailCount = await emailQueue.count();
  const whatsappCount = await whatsappQueue.count();
  const blockchainCount = await blockchainQueue.count();

  logger.info(`Queue status - Email: ${emailCount}, WhatsApp: ${whatsappCount}, Blockchain: ${blockchainCount}`);
}
