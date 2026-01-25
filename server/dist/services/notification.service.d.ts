interface WhatsAppNotificationData {
    to: string;
    template?: string;
    variables?: Record<string, string>;
    message?: string;
}
/**
 * Send WhatsApp notification using Twilio
 * Requires: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_FROM
 */
export declare const sendWhatsAppNotification: (data: WhatsAppNotificationData) => Promise<{
    success: boolean;
    messageId?: string;
    error?: string;
}>;
interface EmailNotificationData {
    to: string;
    subject: string;
    html: string;
    from?: string;
}
/**
 * Send Email notification using Resend
 * Requires: RESEND_API_KEY
 */
export declare const sendEmailNotification: (data: EmailNotificationData) => Promise<{
    success: boolean;
    messageId?: string;
    error?: string;
}>;
interface P2PListingData {
    listingId: string;
    propertyTitle: string;
    monthlyValue: number;
    totalMonths: number;
    askingPrice: number;
    discountPercent: number;
    city: string;
    state: string;
}
/**
 * Notifica todos os investidores ativos sobre nova oferta P2P
 * Dispara WhatsApp e Email em paralelo
 */
export declare const notifyInvestorsNewListing: (listing: P2PListingData) => Promise<{
    success: boolean;
    whatsappSent: number;
    emailsSent: number;
}>;
interface InvestmentReceiptData {
    investorEmail: string;
    investorName: string;
    listingId: string;
    propertyTitle: string;
    amountPaid: number;
    monthsInvested: number;
    paymentDate: Date;
    txHash?: string;
}
/**
 * Envia email com comprovante de investimento
 */
export declare const sendInvestmentReceipt: (data: InvestmentReceiptData) => Promise<{
    success: boolean;
    messageId?: string;
    error?: string;
}>;
declare const _default: {
    sendWhatsAppNotification: (data: WhatsAppNotificationData) => Promise<{
        success: boolean;
        messageId?: string;
        error?: string;
    }>;
    sendEmailNotification: (data: EmailNotificationData) => Promise<{
        success: boolean;
        messageId?: string;
        error?: string;
    }>;
    notifyInvestorsNewListing: (listing: P2PListingData) => Promise<{
        success: boolean;
        whatsappSent: number;
        emailsSent: number;
    }>;
    sendInvestmentReceipt: (data: InvestmentReceiptData) => Promise<{
        success: boolean;
        messageId?: string;
        error?: string;
    }>;
};
export default _default;
//# sourceMappingURL=notification.service.d.ts.map