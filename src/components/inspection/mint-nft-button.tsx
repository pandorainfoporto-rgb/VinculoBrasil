/**
 * Botão para Mintar NFT de Vistoria
 *
 * Componente que permite transformar uma vistoria completa em NFT na blockchain Polygon.
 * Upload automático de fotos para IPFS via Pinata e criação do token.
 */

import { useState } from 'react';
import { Loader2, CheckCircle2, XCircle, ExternalLink, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface MintNFTButtonProps {
  inspectionId: string;
  propertyAddress: string;
  inspectionType: 'ENTRADA' | 'SAIDA' | 'CONTRATO';
  photos: Array<{
    url: string;
    description?: string;
  }>;
  inspector: string;
  notes?: string;
  ownerAddress?: string; // Endereço da carteira MetaMask do dono
  onSuccess?: (nftData: NFTMintResult) => void;
  disabled?: boolean;
}

interface NFTMintResult {
  tokenId: number;
  transactionHash: string;
  ipfsHash: string;
  ipfsUrl: string;
  polygonScanUrl: string;
}

type MintStatus = 'idle' | 'uploading' | 'minting' | 'success' | 'error';

export function MintNFTButton({
  inspectionId,
  propertyAddress,
  inspectionType,
  photos,
  inspector,
  notes,
  ownerAddress,
  onSuccess,
  disabled = false,
}: MintNFTButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState<MintStatus>('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [nftResult, setNftResult] = useState<NFTMintResult | null>(null);

  const handleMint = async () => {
    if (!ownerAddress) {
      setError('Endereço da carteira não fornecido. Conecte sua MetaMask.');
      setStatus('error');
      return;
    }

    try {
      setStatus('uploading');
      setProgress(10);
      setError(null);

      // 1. Preparar dados
      const photosData = photos.map((photo) => ({
        path: photo.url, // URL do Supabase Storage
        description: photo.description || '',
      }));

      setProgress(30);

      // 2. Chamar API para mintar NFT
      setStatus('minting');
      setProgress(50);

      const response = await fetch('/api/nft/mint', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ownerAddress,
          propertyAddress,
          inspectionType,
          photos: photosData,
          inspector,
          notes,
        }),
      });

      setProgress(80);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao mintar NFT');
      }

      const result = await response.json();

      setProgress(100);
      setStatus('success');
      setNftResult(result.data);

      // Chamar callback de sucesso
      if (onSuccess) {
        onSuccess(result.data);
      }

      // Salvar tokenId no banco (opcional)
      await saveNFTToDatabase(inspectionId, result.data);
    } catch (err) {
      console.error('Erro ao mintar NFT:', err);
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    }
  };

  const saveNFTToDatabase = async (inspectionId: string, nftData: NFTMintResult) => {
    // TODO: Implementar salvamento no banco de dados
    // Enviar para backend: tokenId, transactionHash, ipfsHash
    console.log('Salvando NFT no banco:', {
      inspectionId,
      tokenId: nftData.tokenId,
      transactionHash: nftData.transactionHash,
      ipfsHash: nftData.ipfsHash,
    });
  };

  const getStatusMessage = () => {
    switch (status) {
      case 'uploading':
        return 'Enviando fotos para IPFS...';
      case 'minting':
        return 'Criando NFT na Polygon...';
      case 'success':
        return 'NFT criado com sucesso!';
      case 'error':
        return 'Erro ao criar NFT';
      default:
        return '';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'uploading':
      case 'minting':
        return <Loader2 className="h-6 w-6 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle2 className="h-6 w-6 text-green-500" />;
      case 'error':
        return <XCircle className="h-6 w-6 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        disabled={disabled || photos.length === 0}
        variant="default"
        size="lg"
        className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
      >
        <ImageIcon className="mr-2 h-5 w-5" />
        Gerar NFT na Blockchain
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {getStatusIcon()}
              {status === 'idle' ? 'Criar NFT de Vistoria' : getStatusMessage()}
            </DialogTitle>
            <DialogDescription>
              {status === 'idle' &&
                'Transforme esta vistoria em um NFT permanente na blockchain Polygon com armazenamento descentralizado no IPFS.'}
              {status === 'success' && 'Sua vistoria foi tokenizada com sucesso!'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Informações da vistoria */}
            {status === 'idle' && (
              <div className="space-y-3">
                <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Imóvel:</span>
                    <span className="font-medium">{propertyAddress}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Tipo:</span>
                    <Badge variant="secondary">{inspectionType}</Badge>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Fotos:</span>
                    <span className="font-medium">{photos.length} arquivos</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Vistoriador:</span>
                    <span className="font-medium">{inspector}</span>
                  </div>
                </div>

                <Alert>
                  <AlertTitle>⚡ O que vai acontecer?</AlertTitle>
                  <AlertDescription className="text-sm space-y-1">
                    <p>1. Upload de {photos.length} fotos para IPFS (Pinata)</p>
                    <p>2. Criação de metadata JSON permanente</p>
                    <p>3. Mint do NFT na blockchain Polygon</p>
                    <p>4. Registro imutável da vistoria</p>
                  </AlertDescription>
                </Alert>

                {!ownerAddress && (
                  <Alert variant="destructive">
                    <AlertTitle>Atenção</AlertTitle>
                    <AlertDescription>
                      Conecte sua carteira MetaMask para receber o NFT.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}

            {/* Progress bar durante processo */}
            {(status === 'uploading' || status === 'minting') && (
              <div className="space-y-3">
                <Progress value={progress} className="w-full" />
                <p className="text-center text-sm text-muted-foreground">
                  {progress}% - Aguarde, isso pode levar alguns minutos...
                </p>
              </div>
            )}

            {/* Resultado de sucesso */}
            {status === 'success' && nftResult && (
              <div className="space-y-3">
                <Alert className="border-green-500 bg-green-50">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <AlertTitle className="text-green-900">NFT Criado!</AlertTitle>
                  <AlertDescription className="text-green-800">
                    Token ID: #{nftResult.tokenId}
                  </AlertDescription>
                </Alert>

                <div className="rounded-lg border p-4 space-y-3">
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Transação Blockchain:</p>
                    <a
                      href={nftResult.polygonScanUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
                    >
                      Ver no PolygonScan <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>

                  <div className="space-y-2">
                    <p className="text-sm font-medium">Metadata IPFS:</p>
                    <a
                      href={nftResult.ipfsUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800"
                    >
                      Ver no IPFS Gateway <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>

                  <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground">
                      Hash: {nftResult.ipfsHash.substring(0, 20)}...
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Erro */}
            {status === 'error' && (
              <Alert variant="destructive">
                <XCircle className="h-5 w-5" />
                <AlertTitle>Erro ao criar NFT</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>

          <DialogFooter>
            {status === 'idle' && (
              <>
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleMint} disabled={!ownerAddress}>
                  Confirmar e Criar NFT
                </Button>
              </>
            )}

            {status === 'success' && (
              <Button onClick={() => setIsOpen(false)} className="w-full">
                Fechar
              </Button>
            )}

            {status === 'error' && (
              <>
                <Button variant="outline" onClick={() => setIsOpen(false)}>
                  Fechar
                </Button>
                <Button onClick={handleMint}>Tentar Novamente</Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
