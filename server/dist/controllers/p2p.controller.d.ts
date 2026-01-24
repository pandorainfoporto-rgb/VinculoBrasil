import type { Request, Response } from 'express';
/**
 * GET /api/p2p/listings
 * Busca ofertas ativas no marketplace
 */
export declare const getListings: (req: Request, res: Response) => Promise<void>;
/**
 * GET /api/p2p/listings/:id
 * Busca detalhes de uma oferta específica
 */
export declare const getListingById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
/**
 * POST /api/p2p/listings
 * Cria uma nova oferta de venda
 */
export declare const createListing: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
/**
 * DELETE /api/p2p/listings/:id
 * Cancela uma oferta
 */
export declare const cancelListing: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
/**
 * GET /api/p2p/stats
 * Retorna estatísticas do marketplace
 */
export declare const getStats: (req: Request, res: Response) => Promise<void>;
/**
 * GET /api/p2p/my-listings
 * Retorna ofertas do usuário logado
 */
export declare const getMyListings: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
/**
 * GET /api/p2p/my-purchases
 * Retorna compras do investidor logado
 */
export declare const getMyPurchases: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
/**
 * POST /api/p2p/simulate
 * Simula o preço de venda e retorno para investidor
 */
export declare const simulateListing: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
/**
 * POST /api/p2p/webhook/sale
 * Webhook chamado quando uma venda é detectada na blockchain
 */
export declare const handleSaleWebhook: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
/**
 * POST /api/p2p/buy-intent
 * Cria uma intenção de compra e retorna dados para gerar Pix
 * O usuário só vê Reais, a blockchain é invisível
 */
export declare const createBuyIntent: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
/**
 * POST /api/p2p/settle
 * Liquida a compra após pagamento Pix confirmado
 * Chamado pelo webhook do Asaas ou manualmente pelo admin
 */
export declare const settlePurchase: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
declare const _default: {
    getListings: (req: Request, res: Response) => Promise<void>;
    getListingById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    createListing: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    cancelListing: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    getStats: (req: Request, res: Response) => Promise<void>;
    getMyListings: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    getMyPurchases: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    simulateListing: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    handleSaleWebhook: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    createBuyIntent: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    settlePurchase: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
};
export default _default;
//# sourceMappingURL=p2p.controller.d.ts.map