/**
 * Pinata Service - IPFS Upload para VinculoBrasil
 *
 * Responsável por:
 * - Upload de fotos de vistoria para IPFS
 * - Geração de metadata JSON
 * - Pinning permanente dos arquivos
 * - Retorno do IPFS hash (CID)
 *
 * ATUALIZADO: Busca chaves do banco de dados (SystemConfig)
 */
export declare class PinataService {
    private readonly GATEWAY_URL;
    /**
     * Buscar JWT do Pinata do banco de dados
     */
    private getJWT;
    /**
     * Criar cliente HTTP com JWT dinâmico
     */
    private createClient;
    /**
     * Testar conexão com Pinata
     */
    testAuthentication(): Promise<boolean>;
    /**
     * Upload de arquivo (imagem, PDF, etc) para IPFS
     */
    uploadFile(filePath: string, metadata?: {
        name?: string;
        keyvalues?: Record<string, string>;
    }): Promise<string>;
    /**
     * Upload de Buffer (para imagens em memória)
     */
    uploadBuffer(buffer: Buffer, filename: string, metadata?: {
        keyvalues?: Record<string, string>;
    }): Promise<string>;
    /**
     * Upload de JSON (metadata do NFT)
     */
    uploadJSON(data: object, name?: string): Promise<string>;
    /**
     * Upload completo de uma vistoria (fotos + metadata)
     *
     * Fluxo:
     * 1. Upload de todas as fotos
     * 2. Montagem do JSON de metadata
     * 3. Upload do metadata JSON
     * 4. Retorno do IPFS hash final (que vai no NFT)
     */
    uploadInspection(params: {
        photos: Array<{
            path: string;
            description?: string;
        }>;
        propertyAddress: string;
        inspectionType: 'ENTRADA' | 'SAIDA' | 'CONTRATO';
        inspector: string;
        notes?: string;
    }): Promise<{
        metadataHash: string;
        photosHashes: string[];
    }>;
    /**
     * Upload de buffer de vistoria (para uso via API)
     */
    uploadInspectionBuffer(params: {
        photos: Array<{
            buffer: Buffer;
            filename: string;
            description?: string;
        }>;
        propertyAddress: string;
        inspectionType: 'ENTRADA' | 'SAIDA' | 'CONTRATO';
        inspector: string;
        notes?: string;
    }): Promise<{
        metadataHash: string;
        photosHashes: string[];
    }>;
    /**
     * Retorna URL pública do IPFS (via gateway Pinata)
     */
    getPublicUrl(ipfsHash: string): string;
    /**
     * Unpinning (remover arquivo do IPFS)
     * CUIDADO: Use apenas se tiver certeza!
     */
    unpin(ipfsHash: string): Promise<void>;
    /**
     * Listar todos os pins da conta
     */
    listPins(filters?: {
        status?: 'pinned' | 'unpinned';
        metadata?: Record<string, string>;
    }): Promise<any[]>;
}
export declare const pinataService: PinataService;
//# sourceMappingURL=pinata-service.d.ts.map