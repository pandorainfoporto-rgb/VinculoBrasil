/**
 * NFT Service - Interação com Smart Contract VinculoNFT
 *
 * Responsável por:
 * - Mint de NFTs de vistoria
 * - Consulta de NFTs existentes
 * - Transferência de propriedade
 * - Atualização de metadata
 */
import { ethers } from 'ethers';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { logger } from './logger.js';
import { pinataService } from './pinata-service.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export class NFTService {
    provider;
    wallet;
    contract = null;
    contractAddress;
    contractABI;
    constructor() {
        const rpcUrl = process.env.POLYGON_RPC_URL || 'https://polygon-rpc.com';
        const privateKey = process.env.ADMIN_PRIVATE_KEY;
        const contractAddress = process.env.SMART_CONTRACT_ADDRESS;
        if (!privateKey) {
            throw new Error('ADMIN_PRIVATE_KEY not configured');
        }
        if (!contractAddress) {
            logger.warn('SMART_CONTRACT_ADDRESS not configured. NFT minting will fail.');
            this.contractAddress = '';
            this.contractABI = [];
        }
        else {
            this.contractAddress = contractAddress;
            // Carregar ABI do arquivo
            try {
                const abiPath = path.join(__dirname, '../config/VinculoNFT.abi.json');
                if (fs.existsSync(abiPath)) {
                    this.contractABI = JSON.parse(fs.readFileSync(abiPath, 'utf-8'));
                }
                else {
                    // ABI mínimo para funcionar
                    this.contractABI = [
                        'function safeMint(address to, string memory propertyAddress, string memory inspectionType, string memory ipfsHash) public returns (uint256)',
                        'function tokenURI(uint256 tokenId) public view returns (string memory)',
                        'function ownerOf(uint256 tokenId) public view returns (address)',
                        'function totalSupply() public view returns (uint256)',
                        'function getPropertyMetadata(uint256 tokenId) public view returns (tuple(string propertyAddress, string inspectionType, uint256 timestamp, address inspector, bool isActive))',
                        'event PropertyNFTMinted(uint256 indexed tokenId, address indexed owner, string propertyAddress, string inspectionType, string ipfsHash)',
                    ];
                    logger.warn('ABI file not found, using minimal ABI');
                }
            }
            catch (error) {
                logger.error(`Failed to load contract ABI: ${error instanceof Error ? error.message : String(error)}`);
                this.contractABI = [];
            }
        }
        // Setup provider e wallet
        this.provider = new ethers.JsonRpcProvider(rpcUrl);
        this.wallet = new ethers.Wallet(privateKey, this.provider);
        // Inicializar contrato se tiver endereço
        if (this.contractAddress && this.contractABI.length > 0) {
            this.contract = new ethers.Contract(this.contractAddress, this.contractABI, this.wallet);
        }
    }
    /**
     * Verificar se o serviço está configurado corretamente
     */
    async checkHealth() {
        try {
            if (!this.contract) {
                return { configured: false, connected: false };
            }
            const balance = await this.provider.getBalance(this.wallet.address);
            return {
                configured: true,
                connected: true,
                contractAddress: this.contractAddress,
                balance: ethers.formatEther(balance),
            };
        }
        catch (error) {
            logger.error(`NFT Service health check failed: ${error instanceof Error ? error.message : String(error)}`);
            return { configured: false, connected: false };
        }
    }
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
    async mintInspectionNFT(params) {
        if (!this.contract) {
            throw new Error('NFT Contract not initialized. Check SMART_CONTRACT_ADDRESS.');
        }
        try {
            logger.info(`Starting NFT minting process for property ${params.propertyAddress} (${params.inspectionType}) with ${params.photos.length} photos`);
            // 1. Upload para IPFS via Pinata
            logger.info('Uploading inspection to IPFS...');
            const { metadataHash, photosHashes } = await pinataService.uploadInspection({
                photos: params.photos,
                propertyAddress: params.propertyAddress,
                inspectionType: params.inspectionType,
                inspector: params.inspector,
                notes: params.notes,
            });
            logger.info(`IPFS upload complete: metadataHash=${metadataHash}, photosCount=${photosHashes.length}`);
            // 2. Formatar IPFS URI
            const ipfsUri = `ipfs://${metadataHash}`;
            // 3. Chamar smart contract para mintar NFT
            logger.info('Calling smart contract safeMint...');
            const tx = await this.contract.safeMint(params.ownerAddress, params.propertyAddress, params.inspectionType, ipfsUri);
            logger.info(`Transaction sent, waiting for confirmation... txHash=${tx.hash}`);
            // 4. Aguardar confirmação
            const receipt = await tx.wait(2); // 2 confirmações de bloco
            // 5. Extrair tokenId do evento PropertyNFTMinted
            const mintEvent = receipt.logs
                .map((log) => {
                try {
                    return this.contract.interface.parseLog(log);
                }
                catch {
                    return null;
                }
            })
                .find((event) => event && event.name === 'PropertyNFTMinted');
            const tokenId = mintEvent ? Number(mintEvent.args.tokenId) : 0;
            logger.info(`NFT minted successfully! tokenId=${tokenId}, txHash=${receipt.hash}, blockNumber=${receipt.blockNumber}`);
            return {
                tokenId,
                transactionHash: receipt.hash,
                ipfsHash: metadataHash,
                ipfsUrl: pinataService.getPublicUrl(metadataHash),
                polygonScanUrl: `https://polygonscan.com/tx/${receipt.hash}`,
            };
        }
        catch (error) {
            logger.error(`Failed to mint NFT: ${error instanceof Error ? error.message : String(error)}`);
            throw new Error(`NFT minting failed: ${error}`);
        }
    }
    /**
     * Consultar NFT por tokenId
     */
    async getNFTMetadata(tokenId) {
        if (!this.contract) {
            throw new Error('Contract not initialized');
        }
        try {
            const metadata = await this.contract.getPropertyMetadata(tokenId);
            return {
                propertyAddress: metadata.propertyAddress,
                inspectionType: metadata.inspectionType,
                timestamp: Number(metadata.timestamp),
                inspector: metadata.inspector,
                isActive: metadata.isActive,
            };
        }
        catch (error) {
            logger.error(`Failed to get NFT metadata for token ${tokenId}: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
    }
    /**
     * Consultar dono de um NFT
     */
    async getNFTOwner(tokenId) {
        if (!this.contract) {
            throw new Error('Contract not initialized');
        }
        try {
            return await this.contract.ownerOf(tokenId);
        }
        catch (error) {
            logger.error(`Failed to get NFT owner for token ${tokenId}: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
    }
    /**
     * Consultar URI do metadata (IPFS)
     */
    async getTokenURI(tokenId) {
        if (!this.contract) {
            throw new Error('Contract not initialized');
        }
        try {
            return await this.contract.tokenURI(tokenId);
        }
        catch (error) {
            logger.error(`Failed to get token URI for token ${tokenId}: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
    }
    /**
     * Total de NFTs mintados
     */
    async getTotalSupply() {
        if (!this.contract) {
            throw new Error('Contract not initialized');
        }
        try {
            const total = await this.contract.totalSupply();
            return Number(total);
        }
        catch (error) {
            logger.error(`Failed to get total supply: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
    }
    /**
     * Estimar custo de gas para mintar NFT
     */
    async estimateMintGas(params) {
        if (!this.contract) {
            throw new Error('Contract not initialized');
        }
        try {
            // Estimar gas necessário
            const gasEstimate = await this.contract.safeMint.estimateGas(params.ownerAddress, params.propertyAddress, params.inspectionType, 'ipfs://dummy' // URI dummy para estimativa
            );
            // Obter gas price atual
            const feeData = await this.provider.getFeeData();
            const gasPrice = feeData.gasPrice || 0n;
            // Calcular custo
            const estimatedCost = gasEstimate * gasPrice;
            return {
                gasLimit: gasEstimate.toString(),
                estimatedCostPOL: ethers.formatEther(estimatedCost),
            };
        }
        catch (error) {
            logger.error(`Failed to estimate gas: ${error instanceof Error ? error.message : String(error)}`);
            throw error;
        }
    }
}
// Export singleton
export const nftService = new NFTService();
//# sourceMappingURL=nft-service.js.map