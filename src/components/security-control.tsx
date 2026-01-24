/**
 * Vinculo.io - SecurityControl Component (Kill Switch)
 *
 * Emergency control panel for protocol administrators.
 * Allows pausing all smart contract operations in case of:
 * - Security breach detection
 * - Exploit attempt
 * - Network anomaly
 * - Emergency maintenance
 *
 * Features:
 * - Protocol pause/unpause (OpenZeppelin Pausable)
 * - Minting freeze
 * - Payment freeze
 * - Audit log display
 * - Multi-sig confirmation (simulated)
 */

import { useState } from 'react';
import { copyToClipboard as copyToClipboardUtil } from '@/lib/clipboard';
import {
  ShieldAlert,
  Lock,
  Unlock,
  ZapOff,
  Zap,
  Activity,
  AlertTriangle,
  Play,
  Pause,
  Clock,
  CheckCircle2,
  XCircle,
  RefreshCw,
  ExternalLink,
  Copy,
  Shield,
  Ban,
  CircleDollarSign,
  FileWarning,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { getNetworkConfig, getBlockExplorerUrl, web3Config } from '@/lib/web3/config';
import { toast } from 'sonner';

interface AuditLogEntry {
  id: string;
  action: string;
  initiator: string;
  timestamp: Date;
  transactionHash?: string;
  status: 'success' | 'failed' | 'pending';
}

interface SecurityControlProps {
  isPaused?: boolean;
  isMintingPaused?: boolean;
  isPaymentsPaused?: boolean;
  lastAuditLogs?: AuditLogEntry[];
  onPauseProtocol?: () => Promise<void>;
  onUnpauseProtocol?: () => Promise<void>;
  onFreezeMinting?: (freeze: boolean) => Promise<void>;
  onFreezePayments?: (freeze: boolean) => Promise<void>;
  adminAddress?: string;
  className?: string;
}

// Mock audit logs
const DEFAULT_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: '1',
    action: 'Protocol Started',
    initiator: '0x88C8d797CF70E082a9b40D70d0bE13620D655d27',
    timestamp: new Date('2026-01-07T10:30:00'),
    transactionHash: '0xabc123def456789...',
    status: 'success',
  },
  {
    id: '2',
    action: 'Minting Resumed',
    initiator: '0x88C8d797CF70E082a9b40D70d0bE13620D655d27',
    timestamp: new Date('2026-01-06T14:22:00'),
    transactionHash: '0xdef789abc123456...',
    status: 'success',
  },
  {
    id: '3',
    action: 'Emergency Maintenance',
    initiator: '0x88C8d797CF70E082a9b40D70d0bE13620D655d27',
    timestamp: new Date('2026-01-05T08:15:00'),
    transactionHash: '0x123abc456def789...',
    status: 'success',
  },
];

export function SecurityControl({
  isPaused = false,
  isMintingPaused = false,
  isPaymentsPaused = false,
  lastAuditLogs = DEFAULT_AUDIT_LOGS,
  onPauseProtocol,
  onUnpauseProtocol,
  onFreezeMinting,
  onFreezePayments,
  adminAddress = '0x88C8d797CF70E082a9b40D70d0bE13620D655d27',
  className,
}: SecurityControlProps) {
  const [protocolPaused, setProtocolPaused] = useState(isPaused);
  const [mintingPaused, setMintingPaused] = useState(isMintingPaused);
  const [paymentsPaused, setPaymentsPaused] = useState(isPaymentsPaused);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingAction, setPendingAction] = useState<'pause' | 'unpause' | null>(null);
  const [confirmationCode, setConfirmationCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const networkConfig = getNetworkConfig();

  const handleKillSwitch = () => {
    setPendingAction(protocolPaused ? 'unpause' : 'pause');
    setShowConfirmDialog(true);
    setConfirmationCode('');
  };

  const handleConfirmAction = async () => {
    // Simple confirmation code check
    if (confirmationCode !== 'CONFIRMAR') {
      toast.error('Codigo de confirmacao incorreto');
      return;
    }

    setIsProcessing(true);

    try {
      if (pendingAction === 'pause') {
        await onPauseProtocol?.();
        setProtocolPaused(true);
        setMintingPaused(true);
        setPaymentsPaused(true);
        toast.success('Protocolo PAUSADO com sucesso', {
          description: 'Todas as operacoes foram suspensas.',
        });
      } else {
        await onUnpauseProtocol?.();
        setProtocolPaused(false);
        setMintingPaused(false);
        setPaymentsPaused(false);
        toast.success('Protocolo ATIVADO com sucesso', {
          description: 'Operacoes normais retomadas.',
        });
      }

      // Simulate transaction delay
      if (web3Config.isDemoMode) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      setShowConfirmDialog(false);
    } catch (error) {
      toast.error('Erro ao executar acao', {
        description: error instanceof Error ? error.message : 'Erro desconhecido',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleToggleMinting = async (freeze: boolean) => {
    try {
      await onFreezeMinting?.(freeze);
      setMintingPaused(freeze);
      toast.info(freeze ? 'Minting PAUSADO' : 'Minting LIBERADO');
    } catch (error) {
      toast.error('Erro ao alterar status do minting');
    }
  };

  const handleTogglePayments = async (freeze: boolean) => {
    try {
      await onFreezePayments?.(freeze);
      setPaymentsPaused(freeze);
      toast.info(freeze ? 'Pagamentos PAUSADOS' : 'Pagamentos LIBERADOS');
    } catch (error) {
      toast.error('Erro ao alterar status dos pagamentos');
    }
  };

  const shortAddress = (address: string): string => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const copyToClipboard = async (text: string) => {
    const success = await copyToClipboardUtil(text);
    if (success) {
      toast.info('Copiado para a area de transferencia');
    }
  };

  return (
    <div className={cn('space-y-6', className)}>
      {/* Main Status Card */}
      <Card className="bg-background border-red-900/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-red-500">
              <ShieldAlert size={24} />
              <div>
                <CardTitle className="text-xl font-black uppercase tracking-tighter italic">
                  Protocol Danger Zone
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Controles de emergencia do protocolo Vinculo.io
                </CardDescription>
              </div>
            </div>
            <Badge
              className={cn(
                'px-3 py-1',
                protocolPaused
                  ? 'bg-red-500/20 text-red-400 border-red-500/30'
                  : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
              )}
            >
              {protocolPaused ? (
                <>
                  <Pause size={12} className="mr-1" />
                  PAUSADO
                </>
              ) : (
                <>
                  <Activity size={12} className="mr-1 animate-pulse" />
                  OPERACIONAL
                </>
              )}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Warning Alert */}
          {protocolPaused && (
            <Alert className="border-red-500/30 bg-red-500/10">
              <AlertTriangle className="text-red-500" />
              <AlertTitle className="text-red-400">Protocolo em Pausa de Emergencia</AlertTitle>
              <AlertDescription className="text-red-300/80">
                Todas as funcoes de smart contract estao suspensas. Nenhuma transacao sera processada
                ate que o protocolo seja reativado.
              </AlertDescription>
            </Alert>
          )}

          {/* Network Info */}
          <div className="flex items-center justify-between p-3 bg-card/50 rounded-xl border border-border">
            <div className="flex items-center gap-2">
              <Activity
                size={14}
                className={cn(
                  protocolPaused ? 'text-red-500' : 'text-emerald-500 animate-pulse'
                )}
              />
              <span className="text-xs text-muted-foreground">
                Rede: <span className="text-foreground font-medium">{networkConfig.name}</span>
              </span>
            </div>
            <span className="text-xs font-mono text-muted-foreground">
              Admin: {shortAddress(adminAddress)}
            </span>
          </div>

          {/* Control Buttons */}
          <div className="grid grid-cols-2 gap-4">
            {/* Kill Switch */}
            <button
              onClick={handleKillSwitch}
              className={cn(
                'flex flex-col items-center justify-center p-6 rounded-2xl border transition-all',
                'hover:scale-[1.02] active:scale-[0.98]',
                protocolPaused
                  ? 'bg-emerald-600/10 border-emerald-600/30 hover:bg-emerald-600/20'
                  : 'bg-red-600/10 border-red-600/20 hover:bg-red-600/20'
              )}
            >
              {protocolPaused ? (
                <Play className="text-emerald-500 mb-2" size={28} />
              ) : (
                <ZapOff className="text-red-500 mb-2" size={28} />
              )}
              <span className="text-[10px] font-bold uppercase text-foreground">
                {protocolPaused ? 'Ativar Protocolo' : 'Kill Switch'}
              </span>
            </button>

            {/* Freeze Minting */}
            <div className="flex flex-col items-center justify-center p-6 bg-card rounded-2xl border border-border">
              <Ban
                className={cn(
                  'mb-2',
                  mintingPaused ? 'text-amber-500' : 'text-muted-foreground'
                )}
                size={28}
              />
              <span className="text-[10px] font-bold uppercase text-foreground mb-2">
                Freeze Minting
              </span>
              <Switch
                checked={mintingPaused}
                onCheckedChange={handleToggleMinting}
                disabled={protocolPaused}
              />
            </div>
          </div>

          {/* Additional Controls */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-4 bg-card/50 rounded-xl border border-border text-center">
              <CircleDollarSign
                className={cn(
                  'mx-auto mb-2',
                  paymentsPaused ? 'text-amber-500' : 'text-emerald-500'
                )}
                size={20}
              />
              <p className="text-[10px] font-bold uppercase text-muted-foreground">Pagamentos</p>
              <Badge
                variant="outline"
                className={cn(
                  'mt-1',
                  paymentsPaused ? 'text-amber-400' : 'text-emerald-400'
                )}
              >
                {paymentsPaused ? 'Pausado' : 'Ativo'}
              </Badge>
            </div>

            <div className="p-4 bg-card/50 rounded-xl border border-border text-center">
              <Lock
                className={cn(
                  'mx-auto mb-2',
                  mintingPaused ? 'text-amber-500' : 'text-emerald-500'
                )}
                size={20}
              />
              <p className="text-[10px] font-bold uppercase text-muted-foreground">Colateral</p>
              <Badge
                variant="outline"
                className={cn(
                  'mt-1',
                  mintingPaused ? 'text-amber-400' : 'text-emerald-400'
                )}
              >
                {mintingPaused ? 'Bloqueado' : 'Livre'}
              </Badge>
            </div>

            <div className="p-4 bg-card/50 rounded-xl border border-border text-center">
              <FileWarning className="mx-auto mb-2 text-muted-foreground" size={20} />
              <p className="text-[10px] font-bold uppercase text-muted-foreground">Disputas</p>
              <Badge variant="outline" className="mt-1 text-muted-foreground">
                Normal
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Log */}
      <Card className="bg-background border-border">
        <CardHeader>
          <CardTitle className="text-foreground flex items-center gap-2 text-sm">
            <Clock size={16} />
            Audit Log (Ultimas Acoes)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {lastAuditLogs.map(log => (
              <div
                key={log.id}
                className="flex items-center justify-between p-3 bg-card/50 rounded-lg border border-border"
              >
                <div className="flex items-center gap-3">
                  {log.status === 'success' ? (
                    <CheckCircle2 className="text-emerald-500" size={16} />
                  ) : log.status === 'failed' ? (
                    <XCircle className="text-red-500" size={16} />
                  ) : (
                    <RefreshCw className="text-amber-500 animate-spin" size={16} />
                  )}
                  <div>
                    <p className="text-sm font-medium text-foreground">{log.action}</p>
                    <p className="text-[10px] text-muted-foreground">
                      {log.timestamp.toLocaleString('pt-BR')} • {shortAddress(log.initiator)}
                    </p>
                  </div>
                </div>
                {log.transactionHash && (
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => copyToClipboard(log.transactionHash!)}
                    >
                      <Copy size={12} />
                    </Button>
                    <a
                      href={getBlockExplorerUrl('tx', log.transactionHash)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-400 hover:text-indigo-300"
                    >
                      <ExternalLink size={12} />
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 text-[10px] text-muted-foreground/70 italic mt-4">
            <AlertTriangle size={12} />
            <span>Todas as acoes sao registradas permanentemente na Blockchain para auditoria.</span>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {pendingAction === 'pause' ? (
                <>
                  <ShieldAlert className="text-red-500" />
                  <span className="text-red-500">Pausa de Emergencia</span>
                </>
              ) : (
                <>
                  <Shield className="text-emerald-500" />
                  <span className="text-emerald-500">Reativar Protocolo</span>
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {pendingAction === 'pause'
                ? 'Voce esta prestes a pausar TODAS as operacoes do protocolo. Esta acao sera registrada na blockchain.'
                : 'Voce esta prestes a reativar o protocolo. Todas as operacoes serao retomadas.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <Alert
              className={cn(
                pendingAction === 'pause'
                  ? 'border-red-500/30 bg-red-500/10'
                  : 'border-emerald-500/30 bg-emerald-500/10'
              )}
            >
              <AlertTriangle
                className={pendingAction === 'pause' ? 'text-red-500' : 'text-emerald-500'}
              />
              <AlertDescription
                className={pendingAction === 'pause' ? 'text-red-300' : 'text-emerald-300'}
              >
                {pendingAction === 'pause'
                  ? 'Ao pausar: Nenhum minting, pagamento ou transferencia sera processado.'
                  : 'Ao reativar: Operacoes pendentes podem ser executadas imediatamente.'}
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <Label htmlFor="confirmation-code" className="text-sm">
                Digite <span className="font-mono font-bold">CONFIRMAR</span> para prosseguir:
              </Label>
              <Input
                id="confirmation-code"
                value={confirmationCode}
                onChange={(e) => setConfirmationCode(e.target.value.toUpperCase())}
                placeholder="CONFIRMAR"
                className="font-mono text-center"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              disabled={isProcessing}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirmAction}
              disabled={confirmationCode !== 'CONFIRMAR' || isProcessing}
              className={cn(
                pendingAction === 'pause'
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-emerald-600 hover:bg-emerald-700'
              )}
            >
              {isProcessing ? (
                <>
                  <RefreshCw className="animate-spin mr-2" size={16} />
                  Processando...
                </>
              ) : pendingAction === 'pause' ? (
                <>
                  <ZapOff className="mr-2" size={16} />
                  Confirmar Pausa
                </>
              ) : (
                <>
                  <Zap className="mr-2" size={16} />
                  Confirmar Ativacao
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default SecurityControl;
