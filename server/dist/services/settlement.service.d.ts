export interface PurchaseIntent {
    id: string;
    listingId: string;
    buyerId: string;
    sellerId: string;
    amount: number;
    tokenId: string;
    asaasChargeId?: string;
    status: 'PENDING' | 'PAID' | 'SETTLED' | 'FAILED' | 'CANCELLED';
}
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
export declare const settleInvestment: (listingId: string, buyerId: string, asaasPaymentId?: string) => Promise<{
    success: boolean;
    txHash?: string;
    error?: string;
}>;
/**
 * Processa webhook do Asaas quando pagamento é confirmado
 * Chamado pela rota de webhooks
 */
export declare const handleAsaasPaymentConfirmed: (paymentId: string, externalReference?: string) => Promise<void>;
/**
 * Cria uma intenção de compra (usado antes do Pix)
 * Retorna os dados para gerar a cobrança no Asaas
 */
export declare const createPurchaseIntent: (listingId: string, buyerId: string) => Promise<{
    intentId: string;
    listing: {
        id: string;
        askingPrice: number;
        monthlyValue: number;
        totalMonths: number;
        contractId: string;
    };
    externalReference: string;
}>;
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
export declare const settleInvestmentOrder: (asaasPaymentId: string) => Promise<void>;
declare const _default: {
    settleInvestment: (listingId: string, buyerId: string, asaasPaymentId?: string) => Promise<{
        success: boolean;
        txHash?: string;
        error?: string;
    }>;
    settleInvestmentOrder: (asaasPaymentId: string) => Promise<void>;
    handleAsaasPaymentConfirmed: (paymentId: string, externalReference?: string) => Promise<void>;
    createPurchaseIntent: (listingId: string, buyerId: string) => Promise<{
        intentId: string;
        listing: {
            id: string;
            askingPrice: number;
            monthlyValue: number;
            totalMonths: number;
            contractId: string;
        };
        externalReference: string;
    }>;
};
export default _default;
//# sourceMappingURL=settlement.service.d.ts.map