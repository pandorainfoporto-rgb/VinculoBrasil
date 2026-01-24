/**
 * Vinculo.io - Payment Split Card Component
 *
 * Visual component for displaying and executing the 85/5/5/5 payment split.
 * Integrates with useSplitPayment hook for blockchain transactions.
 */

import { useState } from 'react';
import { copyToClipboard } from '@/lib/clipboard';
import {
  Wallet,
  Send,
  CheckCircle2,
  Loader2,
  AlertCircle,
  ExternalLink,
  Copy,
  ChevronDown,
  ChevronUp,
  Coins,
  ArrowRight,
  Clock,
  Receipt,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSplitPayment, type SplitRecipient } from '@/hooks/use-split-payment';
import { useWalletConnection } from '@/hooks/use-wallet-connection';
// WalletConnector removido - nao utiliza mais carteira
import { cn } from '@/lib/utils';

interface PaymentSplitCardProps {
  tokenId: string;
  rentAmount: number;
  dueDate: Date;
  landlordWallet: string;
  insurerWallet: string;
  platformWallet: string;
  guarantorWallet: string;
  landlordName?: string;
  propertyAddress?: string;
  onSuccess?: () => void;
  compact?: boolean;
}

// Color mapping for recipient roles
const ROLE_COLORS: Record<SplitRecipient['role'], { bg: string; text: string; border: string }> = {
  landlord: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  insurer: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  platform: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  guarantor: { bg: 'bg-orange-50', text: 'text-orange-700', border: 'border-orange-200' },
};

const ROLE_ICONS: Record<SplitRecipient['role'], string> = {
  landlord: '🏠',
  insurer: '🛡️',
  platform: '⚡',
  guarantor: '🤝',
};

export function PaymentSplitCard({
  tokenId,
  rentAmount,
  dueDate,
  landlordWallet,
  insurerWallet,
  platformWallet,
  guarantorWallet,
  landlordName,
  propertyAddress,
  onSuccess,
  compact = false,
}: PaymentSplitCardProps) {
  const [showDetails, setShowDetails] = useState(!compact);
  const [copiedHash, setCopiedHash] = useState(false);

  const { isConnected } = useWalletConnection();

  const {
    status,
    transactionHash,
    error,
    result,
    splitDetails,
    executePayment,
    reset,
    isPending,
    isSuccess,
    isError,
    statusMessage,
  } = useSplitPayment({
    tokenId,
    rentAmount,
    landlordWallet,
    insurerWallet,
    platformWallet,
    guarantorWallet,
    onSuccess: () => {
      onSuccess?.();
    },
  });

  const handleCopyHash = async () => {
    if (transactionHash) {
      const success = await copyToClipboard(transactionHash);
      if (success) {
        setCopiedHash(true);
        setTimeout(() => setCopiedHash(false), 2000);
      }
    }
  };

  const isOverdue = dueDate < new Date();
  const daysUntilDue = Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));

  // Success state
  if (isSuccess && result) {
    return (
      <Card className="border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500 rounded-full">
                <CheckCircle2 className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg text-emerald-900">Pagamento Confirmado!</CardTitle>
                <CardDescription className="text-emerald-700">
                  Split 85/5/5/5 executado na blockchain
                </CardDescription>
              </div>
            </div>
            <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
              <Receipt className="h-3 w-3 mr-1" />
              Recibo Imutavel
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Split Summary */}
          <div className="grid grid-cols-4 gap-2">
            {splitDetails.recipients.map((recipient) => {
              const colors = ROLE_COLORS[recipient.role];
              return (
                <div
                  key={recipient.role}
                  className={cn('rounded-lg p-2 text-center', colors.bg, colors.border, 'border')}
                >
                  <span className="text-lg">{ROLE_ICONS[recipient.role]}</span>
                  <p className={cn('text-xs font-medium', colors.text)}>{recipient.label}</p>
                  <p className={cn('text-sm font-bold', colors.text)}>{recipient.amountFormatted}</p>
                </div>
              );
            })}
          </div>

          {/* Transaction Hash */}
          {transactionHash && (
            <div className="bg-white rounded-lg p-3 border border-emerald-100">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-slate-500">Transaction Hash</span>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs px-2"
                    onClick={handleCopyHash}
                  >
                    {copiedHash ? <CheckCircle2 className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 text-xs px-2"
                    onClick={() => window.open(result.receiptUrl, '_blank')}
                  >
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <code className="text-[10px] font-mono text-slate-600 break-all block">
                {transactionHash}
              </code>
            </div>
          )}

          <Button variant="outline" className="w-full" onClick={reset}>
            Fechar
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Processing state
  if (isPending) {
    return (
      <Card className="border-2 border-indigo-200">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-full">
              <Loader2 className="h-5 w-5 text-indigo-600 animate-spin" />
            </div>
            <div>
              <CardTitle className="text-lg">Processando Pagamento</CardTitle>
              <CardDescription>{statusMessage}</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Animated Progress */}
          <div className="space-y-2">
            <Progress
              value={status === 'pending_signature' ? 25 : 75}
              className="h-2"
            />
            <div className="flex justify-between text-xs text-slate-500">
              <span className={status === 'pending_signature' ? 'text-indigo-600 font-medium' : ''}>
                Assinatura
              </span>
              <span className={status === 'pending_confirmation' ? 'text-indigo-600 font-medium' : ''}>
                Confirmacao
              </span>
              <span>Concluido</span>
            </div>
          </div>

          {/* Split Preview */}
          <div className="grid grid-cols-4 gap-2 opacity-75">
            {splitDetails.recipients.map((recipient) => (
              <div
                key={recipient.role}
                className="bg-slate-50 rounded-lg p-2 text-center border"
              >
                <span className="text-sm">{ROLE_ICONS[recipient.role]}</span>
                <p className="text-[10px] text-slate-500">{recipient.label}</p>
                <p className="text-xs font-medium">{recipient.percentage}%</p>
              </div>
            ))}
          </div>

          {/* Transaction hash if available */}
          {transactionHash && (
            <div className="bg-slate-50 rounded-lg p-2 text-center">
              <p className="text-xs text-slate-500">Aguardando confirmacao...</p>
              <code className="text-[10px] font-mono text-slate-600">
                {transactionHash.slice(0, 20)}...
              </code>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (isError) {
    return (
      <Card className="border-2 border-red-200">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-full">
              <AlertCircle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <CardTitle className="text-lg text-red-900">Erro no Pagamento</CardTitle>
              <CardDescription className="text-red-700">{error}</CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={reset}>
              Cancelar
            </Button>
            <Button className="flex-1" onClick={executePayment}>
              Tentar Novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Default state - ready to pay
  return (
    <Card className={cn('border-2', isOverdue ? 'border-red-200' : 'border-slate-200')}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg flex items-center gap-2">
              <Coins className="h-5 w-5 text-indigo-600" />
              Pagar Aluguel
            </CardTitle>
            {propertyAddress && (
              <CardDescription className="truncate max-w-[250px]">
                {propertyAddress}
              </CardDescription>
            )}
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-slate-900">
              {splitDetails.totalFormatted}
            </p>
            <Badge
              variant="outline"
              className={cn(
                isOverdue
                  ? 'border-red-200 text-red-700 bg-red-50'
                  : daysUntilDue <= 3
                    ? 'border-amber-200 text-amber-700 bg-amber-50'
                    : 'border-slate-200'
              )}
            >
              <Clock className="h-3 w-3 mr-1" />
              {isOverdue
                ? `Vencido há ${Math.abs(daysUntilDue)} dias`
                : daysUntilDue === 0
                  ? 'Vence hoje'
                  : `Vence em ${daysUntilDue} dias`}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Split Distribution Preview */}
        <Collapsible open={showDetails} onOpenChange={setShowDetails}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between h-auto py-2">
              <span className="text-sm text-slate-600">Distribuicao Automatica (85/5/5/5)</span>
              {showDetails ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>

          <CollapsibleContent className="mt-2 space-y-2">
            {splitDetails.recipients.map((recipient) => {
              const colors = ROLE_COLORS[recipient.role];
              return (
                <div
                  key={recipient.role}
                  className={cn(
                    'flex items-center justify-between p-3 rounded-lg border',
                    colors.bg,
                    colors.border
                  )}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{ROLE_ICONS[recipient.role]}</span>
                    <div>
                      <p className={cn('font-medium', colors.text)}>{recipient.label}</p>
                      <p className="text-xs text-slate-500 font-mono truncate max-w-[120px]">
                        {recipient.wallet.slice(0, 6)}...{recipient.wallet.slice(-4)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={cn('font-bold', colors.text)}>{recipient.amountFormatted}</p>
                    <p className="text-xs text-slate-500">{recipient.percentage}%</p>
                  </div>
                </div>
              );
            })}

            {/* Gas fee info */}
            <div className="flex items-center justify-between text-xs text-slate-500 px-3 py-2 bg-slate-50 rounded-lg">
              <span>Taxa de rede estimada:</span>
              <span>{splitDetails.estimatedGasFee.toFixed(4)} MATIC</span>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Overdue warning */}
        {isOverdue && (
          <Alert variant="destructive" className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-red-800">
              Este pagamento esta vencido. Regularize para evitar penalidades.
            </AlertDescription>
          </Alert>
        )}

        {/* Action Buttons */}
        <Button
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
          size="lg"
          onClick={executePayment}
        >
          <Send className="h-4 w-4 mr-2" />
          Pagar {splitDetails.totalFormatted}
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>

        {/* Info footer */}
        <p className="text-[10px] text-center text-slate-400">
          Pagamento processado via Smart Contract na rede Polygon
        </p>
      </CardContent>
    </Card>
  );
}

/**
 * Compact inline payment button for lists/tables
 */
export function PaymentSplitButton({
  tokenId,
  rentAmount,
  dueDate,
  landlordWallet,
  insurerWallet,
  platformWallet,
  guarantorWallet,
  onSuccess,
}: Omit<PaymentSplitCardProps, 'compact' | 'landlordName' | 'propertyAddress'>) {
  const { isConnected } = useWalletConnection();

  const {
    splitDetails,
    executePayment,
    isPending,
    isSuccess,
    isError,
    statusMessage,
  } = useSplitPayment({
    tokenId,
    rentAmount,
    landlordWallet,
    insurerWallet,
    platformWallet,
    guarantorWallet,
    onSuccess,
  });

  if (!isConnected) {
    return (
      <Badge variant="outline" className="text-slate-500">
        <Wallet className="h-3 w-3 mr-1" />
        Conectar
      </Badge>
    );
  }

  if (isSuccess) {
    return (
      <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
        <CheckCircle2 className="h-3 w-3 mr-1" />
        Pago
      </Badge>
    );
  }

  if (isError) {
    return (
      <Badge variant="destructive">
        <AlertCircle className="h-3 w-3 mr-1" />
        Erro
      </Badge>
    );
  }

  if (isPending) {
    return (
      <Badge variant="secondary">
        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
        Processando
      </Badge>
    );
  }

  return (
    <Button size="sm" onClick={executePayment}>
      <Send className="h-3 w-3 mr-1" />
      Pagar
    </Button>
  );
}
