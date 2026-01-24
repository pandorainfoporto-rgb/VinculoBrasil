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

import axios, { type AxiosInstance } from 'axios';
import FormData from 'form-data';
import crypto from 'crypto';
import * as fs from 'fs';
import { prisma } from './prisma.js';
import { config } from '../config/index.js';
import { logger } from './logger.js';

interface PinataResponse {
  IpfsHash: string;
  PinSize: number;
  Timestamp: string;
}

interface InspectionMetadata {
  name: string;
  description: string;
  image: string;
  external_url?: string;
  attributes: Array<{
    trait_type: string;
    value: string | number;
  }>;
  properties: {
    propertyAddress: string;
    inspectionType: 'ENTRADA' | 'SAIDA' | 'CONTRATO';
    inspectionDate: string;
    inspector: string;
    photos: string[];
    report?: string;
  };
}

// Função para descriptografar dados do banco
const decrypt = (encryptedText: string): string => {
  try {
    const [ivHex, encrypted] = encryptedText.split(':');
    if (!ivHex || !encrypted) return encryptedText;

    const iv = Buffer.from(ivHex, 'hex');
    const key = Buffer.from(config.encryptionKey.padEnd(32, '0').slice(0, 32));
    const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (error) {
    logger.error('Pinata decrypt error:', error);
    return encryptedText;
  }
};

export class PinataService {
  private readonly GATEWAY_URL = 'https://gateway.pinata.cloud/ipfs/';

  /**
   * Buscar JWT do Pinata do banco de dados
   */
  private async getJWT(): Promise<string> {
    try {
      const configRecord = await prisma.systemConfig.findUnique({
        where: { key: 'PINATA_JWT' }
      });

      if (!configRecord?.value) {
        // Fallback para variável de ambiente
        if (process.env.PINATA_JWT) {
          return process.env.PINATA_JWT;
        }
        throw new Error('Pinata JWT não configurado. Configure em /admin/integrations');
      }

      // Descriptografar se necessário
      if (configRecord.encrypted) {
        return decrypt(configRecord.value);
      }

      return configRecord.value;
    } catch (error) {
      logger.error('Failed to get Pinata JWT:', error);
      throw error;
    }
  }

  /**
   * Criar cliente HTTP com JWT dinâmico
   */
  private async createClient(): Promise<AxiosInstance> {
    const jwt = await this.getJWT();

    return axios.create({
      baseURL: 'https://api.pinata.cloud',
      headers: {
        'Authorization': `Bearer ${jwt}`,
      },
    });
  }

  /**
   * Testar conexão com Pinata
   */
  async testAuthentication(): Promise<boolean> {
    try {
      const client = await this.createClient();
      const response = await client.get('/data/testAuthentication');
      logger.info(`Pinata authentication successful: ${typeof response.data === "string" ? response.data : JSON.stringify(response.data)}`);
      return true;
    } catch (error) {
      logger.error(`Pinata authentication failed: ${typeof error === "string" ? error : JSON.stringify(error)}`);
      return false;
    }
  }

  /**
   * Upload de arquivo (imagem, PDF, etc) para IPFS
   */
  async uploadFile(
    filePath: string,
    metadata?: { name?: string; keyvalues?: Record<string, string> }
  ): Promise<string> {
    try {
      const client = await this.createClient();
      const formData = new FormData();
      const file = fs.createReadStream(filePath);

      formData.append('file', file);

      if (metadata) {
        const pinataMetadata = {
          name: metadata.name || filePath.split('/').pop(),
          keyvalues: metadata.keyvalues || {},
        };
        formData.append('pinataMetadata', JSON.stringify(pinataMetadata));
      }

      const response = await client.post<PinataResponse>(
        '/pinning/pinFileToIPFS',
        formData,
        {
          headers: formData.getHeaders(),
          maxBodyLength: Infinity,
        }
      );

      const ipfsHash = response.data.IpfsHash;
      logger.info(`File uploaded to IPFS: ${ipfsHash} (file: ${filePath}, size: ${response.data.PinSize})`);

      return ipfsHash;
    } catch (error) {
      logger.error(`Failed to upload file to Pinata: ${typeof error === "string" ? error : JSON.stringify(error)}`);
      throw new Error(`Pinata upload failed: ${error}`);
    }
  }

  /**
   * Upload de Buffer (para imagens em memória)
   */
  async uploadBuffer(
    buffer: Buffer,
    filename: string,
    metadata?: { keyvalues?: Record<string, string> }
  ): Promise<string> {
    try {
      const client = await this.createClient();
      const formData = new FormData();
      formData.append('file', buffer, filename);

      if (metadata) {
        const pinataMetadata = {
          name: filename,
          keyvalues: metadata.keyvalues || {},
        };
        formData.append('pinataMetadata', JSON.stringify(pinataMetadata));
      }

      const response = await client.post<PinataResponse>(
        '/pinning/pinFileToIPFS',
        formData,
        {
          headers: formData.getHeaders(),
          maxBodyLength: Infinity,
        }
      );

      const ipfsHash = response.data.IpfsHash;
      logger.info(`Buffer uploaded to IPFS: ${ipfsHash} (filename: ${filename})`);

      return ipfsHash;
    } catch (error) {
      logger.error(`Failed to upload buffer to Pinata: ${typeof error === "string" ? error : JSON.stringify(error)}`);
      throw new Error(`Pinata buffer upload failed: ${error}`);
    }
  }

  /**
   * Upload de JSON (metadata do NFT)
   */
  async uploadJSON(data: object, name?: string): Promise<string> {
    try {
      const client = await this.createClient();
      const response = await client.post<PinataResponse>('/pinning/pinJSONToIPFS', {
        pinataContent: data,
        pinataMetadata: {
          name: name || 'metadata.json',
        },
      });

      const ipfsHash = response.data.IpfsHash;
      logger.info(`JSON uploaded to IPFS: ${ipfsHash}`);

      return ipfsHash;
    } catch (error) {
      logger.error(`Failed to upload JSON to Pinata: ${typeof error === "string" ? error : JSON.stringify(error)}`);
      throw new Error(`Pinata JSON upload failed: ${error}`);
    }
  }

  /**
   * Upload completo de uma vistoria (fotos + metadata)
   *
   * Fluxo:
   * 1. Upload de todas as fotos
   * 2. Montagem do JSON de metadata
   * 3. Upload do metadata JSON
   * 4. Retorno do IPFS hash final (que vai no NFT)
   */
  async uploadInspection(params: {
    photos: Array<{ path: string; description?: string }>;
    propertyAddress: string;
    inspectionType: 'ENTRADA' | 'SAIDA' | 'CONTRATO';
    inspector: string;
    notes?: string;
  }): Promise<{ metadataHash: string; photosHashes: string[] }> {
    try {
      logger.info(`Starting inspection upload to IPFS: propertyAddress=${params.propertyAddress}, photosCount=${params.photos.length}`);

      // 1. Upload de todas as fotos
      const photosHashes: string[] = [];

      for (const photo of params.photos) {
        const hash = await this.uploadFile(photo.path, {
          name: photo.description || photo.path.split('/').pop(),
          keyvalues: {
            type: 'inspection-photo',
            property: params.propertyAddress,
          },
        });
        photosHashes.push(hash);
      }

      logger.info(`Uploaded ${photosHashes.length} photos to IPFS`);

      // 2. Montar metadata JSON (formato ERC-721)
      const metadata: InspectionMetadata = {
        name: `${params.propertyAddress} - ${params.inspectionType}`,
        description:
          params.notes ||
          `Vistoria de ${params.inspectionType.toLowerCase()} realizada em ${new Date().toLocaleDateString('pt-BR')}`,
        image: `ipfs://${photosHashes[0]}`,
        external_url: `https://vinculobrasil.com.br/inspections/${params.propertyAddress}`,
        attributes: [
          {
            trait_type: 'Property Address',
            value: params.propertyAddress,
          },
          {
            trait_type: 'Inspection Type',
            value: params.inspectionType,
          },
          {
            trait_type: 'Inspector',
            value: params.inspector,
          },
          {
            trait_type: 'Photos Count',
            value: photosHashes.length,
          },
          {
            trait_type: 'Inspection Date',
            value: new Date().toISOString(),
          },
        ],
        properties: {
          propertyAddress: params.propertyAddress,
          inspectionType: params.inspectionType,
          inspectionDate: new Date().toISOString(),
          inspector: params.inspector,
          photos: photosHashes,
        },
      };

      // 3. Upload do metadata JSON
      const metadataHash = await this.uploadJSON(
        metadata,
        `${params.propertyAddress}-${params.inspectionType}-metadata.json`
      );

      logger.info(`Inspection metadata uploaded successfully: metadataHash=${metadataHash}, photosCount=${photosHashes.length}`);

      return {
        metadataHash,
        photosHashes,
      };
    } catch (error) {
      logger.error(`Failed to upload inspection to IPFS: ${typeof error === "string" ? error : JSON.stringify(error)}`);
      throw error;
    }
  }

  /**
   * Upload de buffer de vistoria (para uso via API)
   */
  async uploadInspectionBuffer(params: {
    photos: Array<{ buffer: Buffer; filename: string; description?: string }>;
    propertyAddress: string;
    inspectionType: 'ENTRADA' | 'SAIDA' | 'CONTRATO';
    inspector: string;
    notes?: string;
  }): Promise<{ metadataHash: string; photosHashes: string[] }> {
    try {
      logger.info(`Starting inspection buffer upload to IPFS: propertyAddress=${params.propertyAddress}, photosCount=${params.photos.length}`);

      // 1. Upload de todas as fotos (buffers)
      const photosHashes: string[] = [];

      for (const photo of params.photos) {
        const hash = await this.uploadBuffer(photo.buffer, photo.filename, {
          keyvalues: {
            type: 'inspection-photo',
            property: params.propertyAddress,
            description: photo.description || '',
          },
        });
        photosHashes.push(hash);
      }

      logger.info(`Uploaded ${photosHashes.length} photo buffers to IPFS`);

      // 2. Montar metadata JSON
      const metadata: InspectionMetadata = {
        name: `${params.propertyAddress} - ${params.inspectionType}`,
        description:
          params.notes ||
          `Vistoria de ${params.inspectionType.toLowerCase()} realizada em ${new Date().toLocaleDateString('pt-BR')}`,
        image: `ipfs://${photosHashes[0]}`,
        external_url: `https://vinculobrasil.com.br/inspections/${encodeURIComponent(params.propertyAddress)}`,
        attributes: [
          { trait_type: 'Property Address', value: params.propertyAddress },
          { trait_type: 'Inspection Type', value: params.inspectionType },
          { trait_type: 'Inspector', value: params.inspector },
          { trait_type: 'Photos Count', value: photosHashes.length },
          { trait_type: 'Inspection Date', value: new Date().toISOString() },
        ],
        properties: {
          propertyAddress: params.propertyAddress,
          inspectionType: params.inspectionType,
          inspectionDate: new Date().toISOString(),
          inspector: params.inspector,
          photos: photosHashes,
        },
      };

      // 3. Upload do metadata
      const metadataHash = await this.uploadJSON(
        metadata,
        `${params.propertyAddress}-${params.inspectionType}-metadata.json`
      );

      return { metadataHash, photosHashes };
    } catch (error) {
      logger.error(`Failed to upload inspection buffers to IPFS: ${error}`);
      throw error;
    }
  }

  /**
   * Retorna URL pública do IPFS (via gateway Pinata)
   */
  getPublicUrl(ipfsHash: string): string {
    return `${this.GATEWAY_URL}${ipfsHash}`;
  }

  /**
   * Unpinning (remover arquivo do IPFS)
   * CUIDADO: Use apenas se tiver certeza!
   */
  async unpin(ipfsHash: string): Promise<void> {
    try {
      const client = await this.createClient();
      await client.delete(`/pinning/unpin/${ipfsHash}`);
      logger.info(`Unpinned ${ipfsHash} from IPFS`);
    } catch (error) {
      logger.error(`Failed to unpin ${ipfsHash}`, error);
      throw error;
    }
  }

  /**
   * Listar todos os pins da conta
   */
  async listPins(filters?: {
    status?: 'pinned' | 'unpinned';
    metadata?: Record<string, string>;
  }): Promise<any[]> {
    try {
      const client = await this.createClient();
      const params = new URLSearchParams();

      if (filters?.status) {
        params.append('status', filters.status);
      }

      if (filters?.metadata) {
        Object.entries(filters.metadata).forEach(([key, value]) => {
          params.append(`metadata[keyvalues][${key}]`, value);
        });
      }

      const response = await client.get('/data/pinList', { params });
      return response.data.rows;
    } catch (error) {
      logger.error(`Failed to list pins: ${typeof error === "string" ? error : JSON.stringify(error)}`);
      throw error;
    }
  }
}

// Export singleton instance
export const pinataService = new PinataService();
