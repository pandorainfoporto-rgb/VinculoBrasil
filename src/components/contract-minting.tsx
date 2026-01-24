/**
 * Vinculo.io - Contract Minting Component
 *
 * Visual component for minting rental contracts as NFTs on the blockchain.
 * Shows step-by-step progress with animations for a premium UX.
 */

import { useState, useEffect } from 'react';
import {
  FileCheck,
  Shield,
  Coins,
  CheckCircle2,
  Loader2,
  ExternalLink,
  Copy,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Lock,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useCreateRental } from '@/hooks/use-create-rental';
import { useWalletConnection } from '@/hooks/use-wallet-connection';
// WalletConnector removido - nao utiliza mais carteira
import { getBlockExplorerUrl, getNetworkConfig } from '@/lib/web3/config';
import { PAYMENT_SPLIT } from '@/lib/web3/vinculo-contract-abi';
import { cn } from '@/lib/utils';
import { useCryptoWallets } from '@/contexts/crypto-wallets-context';
import { copyToClipboard } from '@/lib/clipboard';

interface ContractDetails {
  propertyAddress: string;
  rentAmount: number;
  landlordName: string;
  tenantName: string;
  guarantorName?: string;
  startDate: Date;
  endDate: Date;
  landlordWallet: string;
  tenantWallet: string;
  guarantorWallet?: string;
  insurerWallet: string;
  collateralPropertyId?: string;
}

interface ContractMintingProps {
  contractDetails: ContractDetails;
  onSuccess?: (tokenId: string, txHash: string) => void;
  onCancel?: () => void;
}

type MintingStep =
  | 'review'
  | 'connecting'
  | 'validating_signatures'
  | 'uploading_ipfs'
  | 'minting_nft'
  | 'locking_collateral'
  | 'success'
  | 'error';

interface StepInfo {
  id: MintingStep;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const MINTING_STEPS: StepInfo[] = [
  {
    id: 'validating_signatures',
    title: 'Validando Assinaturas Digitais',
    description: 'Verificando assinaturas de todas as partes...',
    icon: <FileCheck className="h-5 w-5" />,
  },
  {
    id: 'uploading_ipfs',
    title: 'Enviando para IPFS',
    description: 'Armazenando metadados de forma descentralizada...',
    icon: <Shield className="h-5 w-5" />,
  },
  {
    id: 'minting_nft',
    title: 'Gerando NFT de Locacao (ERC-721)',
    description: 'Mintando contrato imutavel na blockchain...',
    icon: <Coins className="h-5 w-5" />,
  },
  {
    id: 'locking_collateral',
    title: 'Bloqueando Colateral do Garantidor',
    description: 'Registrando garantia na rede Polygon...',
    icon: <Lock className="h-5 w-5" />,
  },
];

export function ContractMinting({
  contractDetails,
  onSuccess,
  onCancel,
}: ContractMintingProps) {
  const [currentStep, setCurrentStep] = useState<MintingStep>('review');
  const [stepProgress, setStepProgress] = useState(0);
  const [copiedHash, setCopiedHash] = useState(false);

  const { isConnected, wallet } = useWalletConnection();
  const {
    status,
    transactionHash,
    tokenId,
    metadataUri,
    error,
    createRental,
    reset,
    isPending,
    isSuccess,
    estimatedGas,
  } = useCreateRental();

  const networkConfig = getNetworkConfig();

  // Simulate step progression during minting
  useEffect(() => {
    if (status === 'pending_signature') {
      setCurrentStep('validating_signatures');
      animateProgress(0, 25, 1500);
    } else if (status === 'pending_confirmation') {
      // Progress through steps during confirmation
      const progressSteps = async () => {
        setCurrentStep('uploading_ipfs');
        await animateProgress(25, 50, 1500);

        setCurrentStep('minting_nft');
        await animateProgress(50, 75, 2000);

        if (contractDetails.guarantorWallet) {
          setCurrentStep('locking_collateral');
          await animateProgress(75, 95, 1500);
        } else {
          await animateProgress(75, 95, 500);
        }
      };
      progressSteps();
    } else if (status === 'success') {
      setCurrentStep('success');
      setStepProgress(100);
    } else if (status === 'error') {
      setCurrentStep('error');
    }
  }, [status, contractDetails.guarantorWallet]);

  const animateProgress = (from: number, to: number, duration: number): Promise<void> => {
    return new Promise((resolve) => {
      const startTime = Date.now();
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        setStepProgress(from + (to - from) * progress);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          resolve();
        }
      };
      requestAnimationFrame(animate);
    });
  };

  const handleStartMinting = async () => {
    if (!wallet) return;

    setCurrentStep('connecting');

    await createRental({
      tenantAddress: contractDetails.tenantWallet,
      guarantorAddress: contractDetails.guarantorWallet || '0x0000000000000000000000000000000000000000',
      insurerAddress: contractDetails.insurerWallet,
      rentAmountWei: BigInt(Math.round(contractDetails.rentAmount * 10000)), // BRZ decimals
      durationSeconds: Math.floor((contractDetails.endDate.getTime() - contractDetails.startDate.getTime()) / 1000),
      collateralPropertyId: contractDetails.collateralPropertyId || '',
    });
  };

  const handleCopyHash = async () => {
    if (transactionHash) {
      const success = await copyToClipboard(transactionHash);
      if (success) {
        setCopiedHash(true);
        setTimeout(() => setCopiedHash(false), 2000);
      }
    }
  };

  const handleViewExplorer = () => {
    if (transactionHash) {
      window.open(getBlockExplorerUrl('tx', transactionHash), '_blank');
    }
  };

  const handleComplete = () => {
    if (tokenId && transactionHash) {
      onSuccess?.(tokenId, transactionHash);
    }
  };

  const handleRetry = () => {
    reset();
    setCurrentStep('review');
    setStepProgress(0);
  };

  // Get current step index for progress display
  const getCurrentStepIndex = () => {
    const stepIds = MINTING_STEPS.map(s => s.id);
    const idx = stepIds.indexOf(currentStep as typeof stepIds[number]);
    return idx >= 0 ? idx : -1;
  };

  // Review state - show contract summary
  if (currentStep === 'review') {
    return (
      <Card className="max-w-2xl mx-auto border-2 border-indigo-100">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-4 p-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl w-fit">
            <Sparkles className="h-10 w-10 text-white" />
          </div>
          <CardTitle className="text-2xl">Ativar Contrato na Blockchain</CardTitle>
          <CardDescription>
            Este contrato sera registrado como NFT imutavel na rede {networkConfig.name}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Contract Summary Card */}
          <div className="bg-slate-50 rounded-xl p-5 space-y-4">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <FileCheck className="h-4 w-4 text-indigo-600" />
              Resumo do Contrato
            </h3>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-slate-500">Imovel</span>
                <p className="font-medium">{contractDetails.propertyAddress}</p>
              </div>
              <div>
                <span className="text-slate-500">Aluguel Mensal</span>
                <p className="font-medium text-emerald-600">
                  R$ {contractDetails.rentAmount.toLocaleString('pt-BR')}
                </p>
              </div>
              <div>
                <span className="text-slate-500">Locador</span>
                <p className="font-medium">{contractDetails.landlordName}</p>
              </div>
              <div>
                <span className="text-slate-500">Locatario</span>
                <p className="font-medium">{contractDetails.tenantName}</p>
              </div>
              {contractDetails.guarantorName && (
                <div>
                  <span className="text-slate-500">Garantidor</span>
                  <p className="font-medium">{contractDetails.guarantorName}</p>
                </div>
              )}
              <div>
                <span className="text-slate-500">Vigencia</span>
                <p className="font-medium">
                  {contractDetails.startDate.toLocaleDateString('pt-BR')} -{' '}
                  {contractDetails.endDate.toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
          </div>

          {/* Split 85/5/5/5 Preview */}
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-5 space-y-3">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2">
              <Coins className="h-4 w-4 text-emerald-600" />
              Split Automatico do Aluguel
            </h3>

            <div className="grid grid-cols-4 gap-2 text-center text-sm">
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <p className="text-2xl font-bold text-emerald-600">{PAYMENT_SPLIT.LANDLORD_PERCENTAGE}%</p>
                <p className="text-xs text-slate-500">Locador</p>
                <p className="text-xs font-medium">
                  R$ {((contractDetails.rentAmount * PAYMENT_SPLIT.LANDLORD_PERCENTAGE) / 100).toLocaleString('pt-BR')}
                </p>
              </div>
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <p className="text-2xl font-bold text-blue-600">{PAYMENT_SPLIT.INSURER_PERCENTAGE}%</p>
                <p className="text-xs text-slate-500">Seguradora</p>
                <p className="text-xs font-medium">
                  R$ {((contractDetails.rentAmount * PAYMENT_SPLIT.INSURER_PERCENTAGE) / 100).toLocaleString('pt-BR')}
                </p>
              </div>
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <p className="text-2xl font-bold text-purple-600">{PAYMENT_SPLIT.PLATFORM_PERCENTAGE}%</p>
                <p className="text-xs text-slate-500">Vinculo</p>
                <p className="text-xs font-medium">
                  R$ {((contractDetails.rentAmount * PAYMENT_SPLIT.PLATFORM_PERCENTAGE) / 100).toLocaleString('pt-BR')}
                </p>
              </div>
              <div className="bg-white rounded-lg p-3 shadow-sm">
                <p className="text-2xl font-bold text-orange-600">{PAYMENT_SPLIT.GUARANTOR_PERCENTAGE}%</p>
                <p className="text-xs text-slate-500">Garantidor</p>
                <p className="text-xs font-medium">
                  R$ {((contractDetails.rentAmount * PAYMENT_SPLIT.GUARANTOR_PERCENTAGE) / 100).toLocaleString('pt-BR')}
                </p>
              </div>
            </div>
          </div>

          {/* Gas Estimate */}
          <div className="flex items-center justify-between text-sm text-slate-600 bg-slate-100 rounded-lg px-4 py-3">
            <span>Taxa de Gas Estimada:</span>
            <Badge variant="secondary">{estimatedGas}</Badge>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
              {onCancel && (
                <Button variant="outline" className="flex-1" onClick={onCancel}>
                  Cancelar
                </Button>
              )}
              <Button
                className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                onClick={handleStartMinting}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Confirmar e Ativar
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
        </CardContent>
      </Card>
    );
  }

  // Processing state - show progress steps
  if (isPending || currentStep === 'connecting') {
    return (
      <Card className="max-w-xl mx-auto border-2 border-indigo-100">
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Ativando Contrato na Blockchain</CardTitle>
          <CardDescription>
            Aguarde enquanto processamos seu contrato
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Progress Bar */}
          <div className="space-y-2">
            <Progress value={stepProgress} className="h-3" />
            <p className="text-sm text-center text-slate-600">
              {Math.round(stepProgress)}% concluido
            </p>
          </div>

          {/* Steps List */}
          <div className="space-y-3">
            {MINTING_STEPS.map((step, index) => {
              const currentIdx = getCurrentStepIndex();
              const isCompleted = index < currentIdx;
              const isCurrent = step.id === currentStep;
              const isPending = index > currentIdx;

              return (
                <div
                  key={step.id}
                  className={cn(
                    'flex items-center gap-4 p-4 rounded-xl transition-all duration-300',
                    isCurrent && 'bg-indigo-50 border-2 border-indigo-200',
                    isCompleted && 'bg-emerald-50',
                    isPending && 'opacity-50'
                  )}
                >
                  <div
                    className={cn(
                      'p-2 rounded-full',
                      isCurrent && 'bg-indigo-100 text-indigo-600',
                      isCompleted && 'bg-emerald-100 text-emerald-600',
                      isPending && 'bg-slate-100 text-slate-400'
                    )}
                  >
                    {isCurrent ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : isCompleted ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      step.icon
                    )}
                  </div>
                  <div className="flex-1">
                    <p
                      className={cn(
                        'font-medium',
                        isCurrent && 'text-indigo-900',
                        isCompleted && 'text-emerald-900',
                        isPending && 'text-slate-500'
                      )}
                    >
                      {step.title}
                    </p>
                    {isCurrent && (
                      <p className="text-sm text-indigo-600">{step.description}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Transaction Hash (if available) */}
          {transactionHash && (
            <div className="bg-slate-100 rounded-lg p-3">
              <p className="text-xs text-slate-500 mb-1">Transaction Hash</p>
              <div className="flex items-center gap-2">
                <code className="text-xs font-mono flex-1 truncate">
                  {transactionHash}
                </code>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleCopyHash}>
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
          )}

          {/* Wallet confirmation reminder */}
          {status === 'pending_signature' && (
            <Alert className="border-amber-200 bg-amber-50">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                Confirme a transacao na sua carteira para continuar
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    );
  }

  // Success state
  if (currentStep === 'success' || isSuccess) {
    return (
      <Card className="max-w-xl mx-auto border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-4 p-4 bg-emerald-500 rounded-full w-fit animate-pulse">
            <CheckCircle2 className="h-12 w-12 text-white" />
          </div>
          <CardTitle className="text-2xl text-emerald-900">
            Contrato Ativado com Sucesso!
          </CardTitle>
          <CardDescription className="text-emerald-700">
            Seu contrato foi registrado de forma imutavel na blockchain
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* NFT Card Preview */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-emerald-100">
            <div className="flex items-center justify-between mb-4">
              <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                NFT #{tokenId?.slice(0, 8)}...
              </Badge>
              <Badge variant="outline" className="border-purple-200 text-purple-700">
                ERC-721
              </Badge>
            </div>

            <h3 className="font-bold text-lg mb-2">Contrato de Locacao</h3>
            <p className="text-sm text-slate-600 mb-4">{contractDetails.propertyAddress}</p>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-slate-500">Locador</span>
                <p className="font-medium truncate">{contractDetails.landlordName}</p>
              </div>
              <div>
                <span className="text-slate-500">Locatario</span>
                <p className="font-medium truncate">{contractDetails.tenantName}</p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Rede</span>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-purple-500" />
                  <span className="text-sm font-medium">{networkConfig.name}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Transaction Details */}
          <div className="space-y-3">
            {transactionHash && (
              <div className="bg-white rounded-lg p-4 border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-500">Hash da Transacao</span>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={handleCopyHash}
                    >
                      {copiedHash ? (
                        <CheckCircle2 className="h-3 w-3 mr-1 text-emerald-600" />
                      ) : (
                        <Copy className="h-3 w-3 mr-1" />
                      )}
                      {copiedHash ? 'Copiado!' : 'Copiar'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs"
                      onClick={handleViewExplorer}
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Ver no Explorer
                    </Button>
                  </div>
                </div>
                <code className="text-xs font-mono text-slate-600 break-all">
                  {transactionHash}
                </code>
              </div>
            )}

            {metadataUri && (
              <div className="bg-white rounded-lg p-4 border">
                <span className="text-sm text-slate-500">Metadados IPFS</span>
                <code className="block text-xs font-mono text-slate-600 mt-1 break-all">
                  {metadataUri}
                </code>
              </div>
            )}
          </div>

          {/* Actions */}
          <Button
            className="w-full bg-emerald-600 hover:bg-emerald-700"
            onClick={handleComplete}
          >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Ir para meu Dashboard
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (currentStep === 'error') {
    return (
      <Card className="max-w-xl mx-auto border-2 border-red-200">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-4 bg-red-100 rounded-full w-fit">
            <AlertCircle className="h-10 w-10 text-red-600" />
          </div>
          <CardTitle className="text-xl text-red-900">Erro ao Ativar Contrato</CardTitle>
          <CardDescription className="text-red-700">
            Ocorreu um problema durante o processo
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error || 'Erro desconhecido'}</AlertDescription>
          </Alert>

          <div className="flex gap-3">
            {onCancel && (
              <Button variant="outline" className="flex-1" onClick={onCancel}>
                Cancelar
              </Button>
            )}
            <Button className="flex-1" onClick={handleRetry}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar Novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}

// Standalone demo component for testing
export function ContractMintingDemo() {
  const [showMinting, setShowMinting] = useState(true);

  // Usa carteiras cadastradas no sistema
  const { wallets, getOperationalWallet, getSplitReceiverWallets } = useCryptoWallets();
  const operationalWallet = getOperationalWallet();
  const splitReceivers = getSplitReceiverWallets();

  // Busca carteiras por proposito ou usa fallback
  const landlordWallet = splitReceivers[0]?.address || operationalWallet?.address || '0x0000000000000000000000000000000000000001';
  const tenantWallet = wallets.find(w => w.purpose === 'operations' && w.isActive)?.address || '0x0000000000000000000000000000000000000002';
  const guarantorWallet = wallets.find(w => w.purpose === 'backup' && w.isActive)?.address || '0x0000000000000000000000000000000000000003';
  const insurerWallet = wallets.find(w => w.purpose === 'treasury' && w.isActive)?.address || '0x0000000000000000000000000000000000000004';

  const demoContract: ContractDetails = {
    propertyAddress: 'Rua das Flores, 123 - Apt 501, Jardins - Sao Paulo/SP',
    rentAmount: 3500,
    landlordName: 'Maria Silva',
    tenantName: 'Joao Santos',
    guarantorName: 'Carlos Oliveira',
    startDate: new Date(),
    endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    landlordWallet,
    tenantWallet,
    guarantorWallet,
    insurerWallet,
    collateralPropertyId: 'PROP-2024-0042',
  };

  if (!showMinting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Minting concluido!</h2>
          <Button onClick={() => setShowMinting(true)}>Reiniciar Demo</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 p-8">
      <ContractMinting
        contractDetails={demoContract}
        onSuccess={(tokenId, txHash) => {
          console.log('Minting success:', { tokenId, txHash });
          setShowMinting(false);
        }}
        onCancel={() => setShowMinting(false)}
      />
    </div>
  );
}
