import type { Request, Response } from 'express';
/**
 * Handler principal do Webhook Asaas
 *
 * Fluxo:
 * 1. Asaas envia evento de pagamento confirmado
 * 2. Verificamos token de segurança
 * 3. Disparamos liquidação em background
 * 4. Respondemos 200 rapidamente (Asaas exige resposta rápida)
 */
export declare function handleAsaasWebhook(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
/**
 * Handler alternativo que usa o asaasPaymentId diretamente
 * Pode ser usado para reprocessar pagamentos manualmente
 */
export declare function reprocessPayment(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
declare const _default: {
    handleAsaasWebhook: typeof handleAsaasWebhook;
    reprocessPayment: typeof reprocessPayment;
};
export default _default;
//# sourceMappingURL=webhook.controller.d.ts.map