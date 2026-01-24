/**
 * VinculoProtocol ABI (ERC-721)
 * Contrato principal para NFTs de contratos de aluguel
 * Address: 0x6748Cf729dc62bef157b40ABBd44365c2f12702a
 */
export declare const VINCULO_PROTOCOL_ABI: string[];
/**
 * VinculoReceivables ABI (ERC-1155)
 * Tokenização de recebíveis de aluguel
 * Address: 0x4081D8c80bae80aB36AaE3e83082BE1083C32F9A
 */
export declare const RECEIVABLES_ABI: string[];
/**
 * VinculoP2P Marketplace ABI
 * Escrow atômico para cessão de crédito P2P
 * Address: 0x8641445fD7079Bd439F137Aaec5D3b534bB608a0
 */
export declare const P2P_MARKETPLACE_ABI: string[];
export declare const CONTRACT_ADDRESSES: {
    readonly VINCULO_PROTOCOL: string;
    readonly RECEIVABLES: string;
    readonly P2P_MARKETPLACE: string;
    readonly RPC_URL: string;
};
export declare const POLYGON_CONFIG: {
    readonly chainId: 137;
    readonly chainName: "Polygon Mainnet";
    readonly nativeCurrency: {
        readonly name: "MATIC";
        readonly symbol: "MATIC";
        readonly decimals: 18;
    };
    readonly rpcUrls: readonly ["https://polygon-rpc.com", "https://rpc-mainnet.matic.quiknode.pro"];
    readonly blockExplorerUrls: readonly ["https://polygonscan.com/"];
};
declare const _default: {
    VINCULO_PROTOCOL_ABI: string[];
    RECEIVABLES_ABI: string[];
    P2P_MARKETPLACE_ABI: string[];
    CONTRACT_ADDRESSES: {
        readonly VINCULO_PROTOCOL: string;
        readonly RECEIVABLES: string;
        readonly P2P_MARKETPLACE: string;
        readonly RPC_URL: string;
    };
    POLYGON_CONFIG: {
        readonly chainId: 137;
        readonly chainName: "Polygon Mainnet";
        readonly nativeCurrency: {
            readonly name: "MATIC";
            readonly symbol: "MATIC";
            readonly decimals: 18;
        };
        readonly rpcUrls: readonly ["https://polygon-rpc.com", "https://rpc-mainnet.matic.quiknode.pro"];
        readonly blockExplorerUrls: readonly ["https://polygonscan.com/"];
    };
};
export default _default;
//# sourceMappingURL=abis.d.ts.map