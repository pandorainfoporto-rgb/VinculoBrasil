/**
 * Clear configuration cache (call when config is updated)
 */
export declare const clearP2PConfigCache: () => void;
export interface TokenizeReceivablesInput {
    contractId: string;
    sellerId: string;
    sellerWallet: string;
    totalMonths: number;
    startMonth: Date;
    metadataUri?: string;
}
export interface CreateListingInput {
    contractId: string;
    sellerId: string;
    sellerWallet: string;
    askingPrice: number;
    priceInMatic?: number;
    priceInStable?: number;
}
export interface P2PMarketplaceStats {
    totalListings: number;
    activeListings: number;
    totalSales: number;
    totalVolume: number;
    averageDiscount: number;
}
/**
 * Tokeniza os recebíveis de um contrato de aluguel
 * Cria um ERC-1155 representando os próximos X meses de pagamento
 */
export declare const tokenizeReceivables: (input: TokenizeReceivablesInput) => Promise<{
    success: boolean;
    tokenId?: string;
    txHash?: string;
    error?: string;
}>;
/**
 * Cria uma oferta no marketplace P2P
 * O proprietário define o preço (com deságio) para vender seus recebíveis
 */
export declare const createP2PListing: (input: CreateListingInput) => Promise<{
    success: boolean;
    listingId?: string;
    dbListingId?: string;
    txHash?: string;
    error?: string;
}>;
/**
 * Handler chamado quando uma venda P2P é detectada na blockchain
 * Atualiza o Split do Asaas para redirecionar pagamentos ao novo dono
 */
export declare const handleP2PSale: (listingId: string, buyerWallet: string, txHash: string) => Promise<void>;
/**
 * Busca ofertas ativas no marketplace
 */
export declare const getActiveListings: (filters?: {
    minDiscount?: number;
    maxDiscount?: number;
    minTenantScore?: number;
    city?: string;
}) => Promise<Array<{
    id: string;
    contractId: string;
    faceValue: number;
    askingPrice: number;
    discountPercent: number;
    tenantScore: number | null;
    monthsRemaining: number;
    monthlyValue: number;
    city: string;
    state: string;
}>>;
/**
 * Retorna estatísticas do marketplace
 */
export declare const getMarketplaceStats: () => Promise<P2PMarketplaceStats>;
/**
 * Escuta eventos do smart contract P2P
 * Deve ser chamado na inicialização do servidor
 */
export declare const startP2PEventListener: () => Promise<void>;
/**
 * Cancela uma oferta no marketplace
 */
export declare const cancelListing: (listingId: string, sellerId: string) => Promise<{
    success: boolean;
    error?: string;
}>;
declare const _default: {
    tokenizeReceivables: (input: TokenizeReceivablesInput) => Promise<{
        success: boolean;
        tokenId?: string;
        txHash?: string;
        error?: string;
    }>;
    createP2PListing: (input: CreateListingInput) => Promise<{
        success: boolean;
        listingId?: string;
        dbListingId?: string;
        txHash?: string;
        error?: string;
    }>;
    handleP2PSale: (listingId: string, buyerWallet: string, txHash: string) => Promise<void>;
    getActiveListings: (filters?: {
        minDiscount?: number;
        maxDiscount?: number;
        minTenantScore?: number;
        city?: string;
    }) => Promise<Array<{
        id: string;
        contractId: string;
        faceValue: number;
        askingPrice: number;
        discountPercent: number;
        tenantScore: number | null;
        monthsRemaining: number;
        monthlyValue: number;
        city: string;
        state: string;
    }>>;
    getMarketplaceStats: () => Promise<P2PMarketplaceStats>;
    startP2PEventListener: () => Promise<void>;
    cancelListing: (listingId: string, sellerId: string) => Promise<{
        success: boolean;
        error?: string;
    }>;
    clearP2PConfigCache: () => void;
};
export default _default;
//# sourceMappingURL=p2p.service.d.ts.map