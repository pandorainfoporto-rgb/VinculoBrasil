import type { Request, Response } from 'express';
/**
 * POST /api/invest/order
 * Cria um pedido de investimento e gera o QR Code Pix
 *
 * O usuário clica "Comprar" -> Recebe QR Code Pix
 * Quando pagar, o webhook atualiza e liquida na blockchain
 */
export declare const createInvestmentOrder: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
/**
 * GET /api/invest/orders
 * Lista os pedidos de investimento do usuário
 */
export declare const getMyOrders: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
/**
 * GET /api/invest/orders/:id
 * Retorna detalhes de um pedido específico
 */
export declare const getOrderById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
/**
 * DELETE /api/invest/orders/:id
 * Cancela um pedido pendente
 */
export declare const cancelOrder: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
/**
 * Processa o pagamento confirmado e inicia liquidação blockchain
 * Chamado pelo webhook do Asaas quando o Pix é confirmado
 */
export declare const processPaymentConfirmed: (externalReference: string, asaasPaymentId: string) => Promise<{
    success: boolean;
    error?: string;
}>;
declare const _default: {
    createInvestmentOrder: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    getMyOrders: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    getOrderById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    cancelOrder: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    processPaymentConfirmed: (externalReference: string, asaasPaymentId: string) => Promise<{
        success: boolean;
        error?: string;
    }>;
};
export default _default;
//# sourceMappingURL=invest.controller.d.ts.map