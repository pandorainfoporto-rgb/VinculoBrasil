// ============================================
// NOTIFICATION SERVICE
// WhatsApp & Email Notifications
// ============================================
import { logger } from '../lib/logger.js';
import { prisma } from '../lib/prisma.js';
/**
 * Send WhatsApp notification using Twilio
 * Requires: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_FROM
 */
export const sendWhatsAppNotification = async (data) => {
    try {
        const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
        const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
        const TWILIO_WHATSAPP_FROM = process.env.TWILIO_WHATSAPP_FROM || 'whatsapp:+14155238886';
        if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
            logger.warn('[WhatsApp] Twilio credentials not configured. Skipping WhatsApp notification.');
            return {
                success: false,
                error: 'Twilio credentials not configured',
            };
        }
        // Twilio API endpoint
        const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`;
        const body = new URLSearchParams({
            From: TWILIO_WHATSAPP_FROM,
            To: `whatsapp:${data.to}`,
            Body: data.message || 'Nova notificação do Vínculo Brasil',
        });
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Basic ${Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64')}`,
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: body.toString(),
        });
        if (!response.ok) {
            const error = await response.text();
            logger.error(`[WhatsApp] Twilio error: ${error}`);
            return {
                success: false,
                error: `Twilio API error: ${response.status}`,
            };
        }
        const result = await response.json();
        logger.info(`[WhatsApp] Message sent successfully to ${data.to}. SID: ${result.sid}`);
        return {
            success: true,
            messageId: result.sid,
        };
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error(`[WhatsApp] Error sending notification: ${errorMessage}`);
        return {
            success: false,
            error: errorMessage,
        };
    }
};
/**
 * Send Email notification using Resend
 * Requires: RESEND_API_KEY
 */
export const sendEmailNotification = async (data) => {
    try {
        const RESEND_API_KEY = process.env.RESEND_API_KEY;
        const DEFAULT_FROM = process.env.EMAIL_FROM || 'Vínculo Brasil <noreply@vinculobrasil.com>';
        if (!RESEND_API_KEY) {
            logger.warn('[Email] Resend API key not configured. Skipping email notification.');
            return {
                success: false,
                error: 'Resend API key not configured',
            };
        }
        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${RESEND_API_KEY}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                from: data.from || DEFAULT_FROM,
                to: [data.to],
                subject: data.subject,
                html: data.html,
            }),
        });
        if (!response.ok) {
            const error = await response.text();
            logger.error(`[Email] Resend error: ${error}`);
            return {
                success: false,
                error: `Resend API error: ${response.status}`,
            };
        }
        const result = await response.json();
        logger.info(`[Email] Email sent successfully to ${data.to}. ID: ${result.id}`);
        return {
            success: true,
            messageId: result.id,
        };
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error(`[Email] Error sending notification: ${errorMessage}`);
        return {
            success: false,
            error: errorMessage,
        };
    }
};
/**
 * Notifica todos os investidores ativos sobre nova oferta P2P
 * Dispara WhatsApp e Email em paralelo
 */
export const notifyInvestorsNewListing = async (listing) => {
    try {
        logger.info(`[Notifications] Notificando investidores sobre nova oferta: ${listing.listingId}`);
        // 1. Buscar investidores aprovados e ativos
        const investors = await prisma.investor.findMany({
            where: {
                kycStatus: 'APPROVED',
            },
            include: {
            // user: true, // Descomentado quando a relação for criada
            },
        });
        if (investors.length === 0) {
            logger.warn('[Notifications] Nenhum investidor ativo encontrado');
            return {
                success: true,
                whatsappSent: 0,
                emailsSent: 0,
            };
        }
        logger.info(`[Notifications] ${investors.length} investidores encontrados`);
        // 2. Buscar dados dos usuários (temporário até criar relação)
        const userIds = investors.map((i) => i.userId);
        const users = await prisma.user.findMany({
            where: {
                id: { in: userIds },
            },
        });
        const userMap = new Map(users.map((u) => [u.id, u]));
        // 3. Preparar mensagens
        const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
        const whatsappMessage = `🔔 *Nova Oportunidade de Investimento - Vínculo Brasil*

📍 *Imóvel:* ${listing.propertyTitle}
📍 *Localização:* ${listing.city}, ${listing.state}

💰 *Valor Mensal:* ${formatCurrency(listing.monthlyValue)}
📅 *Período:* ${listing.totalMonths} meses
💵 *Preço Total:* ${formatCurrency(listing.askingPrice)}
📊 *Desconto:* ${listing.discountPercent.toFixed(2)}%

✨ *Seja o primeiro a investir!*
Clique no link para ver mais detalhes:
https://vinculobrasil.com/p2p/listings/${listing.listingId}

---
_Vínculo Brasil - Investimentos em Recebíveis de Aluguel_`;
        const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #0066FF 0%, #00CC99 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
    .card { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .highlight { color: #0066FF; font-weight: bold; font-size: 24px; }
    .button { display: inline-block; background: #0066FF; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
    .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🔔 Nova Oportunidade de Investimento</h1>
      <p>Seja o primeiro a investir nesta oferta exclusiva!</p>
    </div>
    <div class="content">
      <div class="card">
        <h2>📍 ${listing.propertyTitle}</h2>
        <p><strong>Localização:</strong> ${listing.city}, ${listing.state}</p>

        <hr style="border: 1px solid #eee; margin: 20px 0;">

        <table style="width: 100%;">
          <tr>
            <td><strong>💰 Valor Mensal:</strong></td>
            <td style="text-align: right;">${formatCurrency(listing.monthlyValue)}</td>
          </tr>
          <tr>
            <td><strong>📅 Período:</strong></td>
            <td style="text-align: right;">${listing.totalMonths} meses</td>
          </tr>
          <tr>
            <td><strong>📊 Desconto:</strong></td>
            <td style="text-align: right; color: #00CC99; font-weight: bold;">${listing.discountPercent.toFixed(2)}%</td>
          </tr>
        </table>

        <hr style="border: 1px solid #eee; margin: 20px 0;">

        <div style="text-align: center;">
          <p><strong>Preço Total:</strong></p>
          <p class="highlight">${formatCurrency(listing.askingPrice)}</p>
          <a href="https://vinculobrasil.com/p2p/listings/${listing.listingId}" class="button">
            Ver Detalhes e Investir
          </a>
        </div>
      </div>

      <p style="text-align: center; color: #666; font-size: 14px;">
        ⚡ <em>Esta é uma oportunidade limitada. Primeiro que pagar via Pix garante o investimento!</em>
      </p>
    </div>

    <div class="footer">
      <p>Vínculo Brasil - Investimentos em Recebíveis de Aluguel</p>
      <p>Este é um email automático. Não responda.</p>
    </div>
  </div>
</body>
</html>
    `;
        // 4. Disparar notificações em paralelo
        const notifications = investors.map(async (investor) => {
            const user = userMap.get(investor.userId);
            if (!user)
                return { whatsapp: false, email: false };
            const results = await Promise.allSettled([
                // WhatsApp (se tiver telefone)
                user.phone
                    ? sendWhatsAppNotification({
                        to: user.phone,
                        message: whatsappMessage,
                    })
                    : Promise.resolve({ success: false }),
                // Email
                sendEmailNotification({
                    to: user.email,
                    subject: `🔔 Nova Oferta: ${listing.propertyTitle} - ${formatCurrency(listing.askingPrice)}`,
                    html: emailHtml,
                }),
            ]);
            return {
                whatsapp: results[0].status === 'fulfilled' && results[0].value.success,
                email: results[1].status === 'fulfilled' && results[1].value.success,
            };
        });
        const results = await Promise.all(notifications);
        const whatsappSent = results.filter((r) => r.whatsapp).length;
        const emailsSent = results.filter((r) => r.email).length;
        logger.info(`[Notifications] ✅ Notificações enviadas: ${whatsappSent} WhatsApp, ${emailsSent} Emails`);
        return {
            success: true,
            whatsappSent,
            emailsSent,
        };
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error(`[Notifications] Erro ao notificar investidores: ${errorMessage}`);
        return {
            success: false,
            whatsappSent: 0,
            emailsSent: 0,
        };
    }
};
/**
 * Envia email com comprovante de investimento
 */
export const sendInvestmentReceipt = async (data) => {
    try {
        const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
        const formatDate = (date) => new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long', timeStyle: 'short' }).format(date);
        const emailHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #0066FF 0%, #00CC99 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
    .content { background: #f9f9f9; padding: 30px; }
    .card { background: white; padding: 25px; border-radius: 8px; margin: 20px 0; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .success-badge { background: #10B981; color: white; padding: 8px 16px; border-radius: 20px; display: inline-block; font-weight: bold; }
    .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; }
    table { width: 100%; border-collapse: collapse; }
    td { padding: 12px 0; border-bottom: 1px solid #eee; }
    .label { color: #666; font-weight: 500; }
    .value { text-align: right; font-weight: bold; }
    .button { display: inline-block; background: #0066FF; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>✅ Investimento Confirmado!</h1>
      <p class="success-badge">Pagamento Aprovado</p>
    </div>

    <div class="content">
      <p>Olá <strong>${data.investorName}</strong>,</p>
      <p>Seu investimento foi confirmado com sucesso! Os recebíveis já estão na sua carteira digital.</p>

      <div class="card">
        <h2 style="margin-top: 0; color: #0066FF;">📋 Detalhes do Investimento</h2>
        <table>
          <tr>
            <td class="label">Imóvel:</td>
            <td class="value">${data.propertyTitle}</td>
          </tr>
          <tr>
            <td class="label">Valor Investido:</td>
            <td class="value">${formatCurrency(data.amountPaid)}</td>
          </tr>
          <tr>
            <td class="label">Período:</td>
            <td class="value">${data.monthsInvested} meses</td>
          </tr>
          <tr>
            <td class="label">Data do Pagamento:</td>
            <td class="value">${formatDate(data.paymentDate)}</td>
          </tr>
          <tr>
            <td class="label">ID da Operação:</td>
            <td class="value" style="font-family: monospace; font-size: 11px;">${data.listingId}</td>
          </tr>
          ${data.txHash ? `<tr><td class="label">Hash Blockchain:</td><td class="value" style="font-family: monospace; font-size: 10px;">${data.txHash}</td></tr>` : ''}
        </table>
      </div>

      <div style="background: #EFF6FF; border-left: 4px solid #0066FF; padding: 15px; margin: 20px 0; border-radius: 4px;">
        <p style="margin: 0;"><strong>📅 Próximos Passos:</strong></p>
        <ul style="margin: 10px 0;">
          <li>Os aluguéis começarão a cair na sua conta a partir do dia 05 do mês.</li>
          <li>Você pode acompanhar os recebimentos no seu Dashboard de Investidor.</li>
          <li>Se quiser revender, acesse o Marketplace P2P a qualquer momento.</li>
        </ul>
      </div>

      <div style="text-align: center;">
        <a href="https://vinculobrasil.com/investor/dashboard" class="button">Acessar Meu Dashboard</a>
      </div>
    </div>

    <div class="footer">
      <p><strong>Vínculo Brasil</strong> - Investimentos em Recebíveis de Aluguel</p>
      <p>Este é um email automático. Não responda.</p>
      <p style="font-size: 10px; color: #999; margin-top: 10px;">Dúvidas? suporte@vinculobrasil.com.br</p>
    </div>
  </div>
</body>
</html>
    `;
        const result = await sendEmailNotification({
            to: data.investorEmail,
            subject: `✅ Comprovante de Investimento - ${data.propertyTitle}`,
            html: emailHtml,
        });
        logger.info(`[Email] Comprovante enviado para ${data.investorEmail} - Listing ${data.listingId}`);
        return result;
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error(`[Email] Erro ao enviar comprovante: ${errorMessage}`);
        return { success: false, error: errorMessage };
    }
};
export default {
    sendWhatsAppNotification,
    sendEmailNotification,
    notifyInvestorsNewListing,
    sendInvestmentReceipt,
};
//# sourceMappingURL=notification.service.js.map