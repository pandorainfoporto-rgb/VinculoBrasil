/**
 * NFT Service - Interação com Smart Contract VinculoNFT
 *
 * Responsável por:
 * - Mint de NFTs de vistoria
 * - Consulta de NFTs existentes
 * - Transferência de propriedade
 * - Atualização de metadata
 */
interface NFTMintParams {
    ownerAddress: string;
    propertyAddress: string;
    inspectionType: 'ENTRADA' | 'SAIDA' | 'CONTRATO';
    photos: Array<{
        path: string;
        description?: string;
    }>;
    inspector: string;
    notes?: string;
}
interface NFTMetadata {
    propertyAddress: string;
    inspectionType: string;
    timestamp: number;
    inspector: string;
    isActive: boolean;
}
export declare class NFTService {
    private provider;
    private wallet;
    private contract;
    private contractAddress;
    private contractABI;
    constructor();
    /**
     * Verificar se o serviço está configurado corretamente
     */
    checkHealth(): Promise<{
        configured: boolean;
        connected: boolean;
        contractAddress?: string;
        balance?: string;
    }>;
    /**
     * Mint de NFT de Vistoria
     *
     * Fluxo completo:
     * 1. Upload das fotos para IPFS (via Pinata)
     * 2. Geração do metadata JSON
     * 3. Upload do metadata para IPFS
     * 4. Chamada ao smart contract para mintar o NFT
     * 5. Aguardar confirmação na blockchain
     */
    mintInspectionNFT(params: NFTMintParams): Promise<{
        tokenId: number;
        transactionHash: string;
        ipfsHash: string;
        ipfsUrl: string;
        polygonScanUrl: string;
    }>;
    /**
     * Consultar NFT por tokenId
     */
    getNFTMetadata(tokenId: number): Promise<NFTMetadata>;
    /**
     * Consultar dono de um NFT
     */
    getNFTOwner(tokenId: number): Promise<string>;
    /**
     * Consultar URI do metadata (IPFS)
     */
    getTokenURI(tokenId: number): Promise<string>;
    /**
     * Total de NFTs mintados
     */
    getTotalSupply(): Promise<number>;
    /**
     * Estimar custo de gas para mintar NFT
     */
    estimateMintGas(params: NFTMintParams): Promise<{
        gasLimit: string;
        estimatedCostPOL: string;
        estimatedCostUSD?: string;
    }>;
}
export declare const nftService: NFTService;
export {};
//# sourceMappingURL=nft-service.d.ts.map