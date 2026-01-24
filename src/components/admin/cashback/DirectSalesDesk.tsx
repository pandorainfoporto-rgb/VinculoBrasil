/**
 * DirectSalesDesk - Balcao de Vendas OTC (Over-The-Counter)
 *
 * Ferramenta para Admin vender tokens VBRz manualmente para investidores.
 * Suporta dois modos:
 * - Liquido (Tesouraria): Transferencia imediata
 * - Bloqueado (Anjo): Cria vesting de 12 meses
 */

import { useState } from 'react';
import {
  Wallet,
  Send,
  Lock,
  Unlock,
  DollarSign,
  Calculator,
  CheckCircle,
  AlertTriangle,
  Loader2,
  Copy,
  Check,
  FileText,
  Clock,
  TrendingUp,
  Users,
  ArrowRight,
  Banknote,
  Shield,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { VBRZ_CONFIG, formatVBRz } from '@/lib/tokenomics-types';

// =============================================================================
// TIPOS
// =============================================================================

interface SaleTransaction {
  id: string;
  buyerAddress: string;
  buyerName?: string;
  amount: number;
  valueBRL: number;
  type: 'liquid' | 'vested';
  vestingMonths?: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  txHash?: string;
  scheduleId?: string;
  createdAt: Date;
}

interface VestingPreset {
  id: string;
  name: string;
  cliffMonths: number;
  vestingMonths: number;
  description: string;
}

// =============================================================================
// CONSTANTES
// =============================================================================

const VESTING_PRESETS: VestingPreset[] = [
  {
    id: 'angel',
    name: 'Investidor Anjo',
    cliffMonths: 6,
    vestingMonths: 12,
    description: '6 meses cliff + 12 meses linear',
  },
  {
    id: 'seed',
    name: 'Seed Round',
    cliffMonths: 3,
    vestingMonths: 18,
    description: '3 meses cliff + 18 meses linear',
  },
  {
    id: 'strategic',
    name: 'Parceiro Estratégico',
    cliffMonths: 0,
    vestingMonths: 24,
    description: 'Sem cliff, 24 meses linear',
  },
  {
    id: 'team',
    name: 'Team Member',
    cliffMonths: 12,
    vestingMonths: 36,
    description: '12 meses cliff + 36 meses linear',
  },
];

// Mock de transacoes recentes
const MOCK_RECENT_SALES: SaleTransaction[] = [
  {
    id: '1',
    buyerAddress: '0x1234...5678',
    buyerName: 'João Silva',
    amount: 500000,
    valueBRL: 50000,
    type: 'liquid',
    status: 'completed',
    txHash: '0xabc...123',
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
  },
  {
    id: '2',
    buyerAddress: '0xabcd...efgh',
    buyerName: 'Fundo XYZ',
    amount: 2000000,
    valueBRL: 200000,
    type: 'vested',
    vestingMonths: 12,
    status: 'completed',
    txHash: '0xdef...456',
    scheduleId: '0x789...abc',
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
  },
  {
    id: '3',
    buyerAddress: '0x9876...5432',
    amount: 100000,
    valueBRL: 10000,
    type: 'liquid',
    status: 'processing',
    createdAt: new Date(Date.now() - 5 * 60 * 1000),
  },
];

// =============================================================================
// COMPONENTES AUXILIARES
// =============================================================================

function SaleTypeCard({
  type,
  isSelected,
  onClick,
}: {
  type: 'liquid' | 'vested';
  isSelected: boolean;
  onClick: () => void;
}) {
  const config = {
    liquid: {
      icon: Unlock,
      title: 'Líquido (Tesouraria)',
      description: 'Tokens transferidos imediatamente',
      color: 'emerald',
      badge: 'Instantâneo',
    },
    vested: {
      icon: Lock,
      title: 'Bloqueado (Anjo)',
      description: 'Cria vesting com cliff e liberação',
      color: 'purple',
      badge: 'Com Vesting',
    },
  };

  const c = config[type];
  const Icon = c.icon;

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all duration-200 border-2',
        isSelected
          ? type === 'liquid'
            ? 'border-emerald-500 bg-emerald-500/10'
            : 'border-purple-500 bg-purple-500/10'
          : 'border-slate-700 bg-slate-900/50 hover:border-slate-600'
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              'p-2 rounded-lg',
              isSelected
                ? type === 'liquid'
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'bg-purple-500/20 text-purple-400'
                : 'bg-slate-800 text-slate-400'
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h3 className={cn(
                'font-medium',
                isSelected ? 'text-white' : 'text-slate-300'
              )}>
                {c.title}
              </h3>
              <Badge
                variant="outline"
                className={cn(
                  'text-xs',
                  isSelected
                    ? type === 'liquid'
                      ? 'border-emerald-500/50 text-emerald-400'
                      : 'border-purple-500/50 text-purple-400'
                    : 'border-slate-600 text-slate-500'
                )}
              >
                {c.badge}
              </Badge>
            </div>
            <p className="text-sm text-slate-500">{c.description}</p>
          </div>
          <div
            className={cn(
              'w-5 h-5 rounded-full border-2 flex items-center justify-center',
              isSelected
                ? type === 'liquid'
                  ? 'border-emerald-500 bg-emerald-500'
                  : 'border-purple-500 bg-purple-500'
                : 'border-slate-600'
            )}
          >
            {isSelected && <Check className="h-3 w-3 text-white" />}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function RecentSaleRow({ sale }: { sale: SaleTransaction }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (sale.txHash) {
      navigator.clipboard.writeText(sale.txHash);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const statusConfig = {
    pending: { color: 'text-amber-400', bg: 'bg-amber-500/20', label: 'Pendente' },
    processing: { color: 'text-blue-400', bg: 'bg-blue-500/20', label: 'Processando' },
    completed: { color: 'text-emerald-400', bg: 'bg-emerald-500/20', label: 'Concluído' },
    failed: { color: 'text-red-400', bg: 'bg-red-500/20', label: 'Falhou' },
  };

  const status = statusConfig[sale.status];
  const timeAgo = Math.floor((Date.now() - sale.createdAt.getTime()) / 60000);
  const timeLabel = timeAgo < 60 ? `${timeAgo}min` : `${Math.floor(timeAgo / 60)}h`;

  return (
    <TableRow className="border-slate-700/50 hover:bg-slate-800/50">
      <TableCell>
        <div className="flex items-center gap-2">
          <div className={cn('p-1.5 rounded', sale.type === 'liquid' ? 'bg-emerald-500/20' : 'bg-purple-500/20')}>
            {sale.type === 'liquid' ? (
              <Send className="h-3.5 w-3.5 text-emerald-400" />
            ) : (
              <Lock className="h-3.5 w-3.5 text-purple-400" />
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-slate-300">{sale.buyerName || sale.buyerAddress}</p>
            <p className="text-xs text-slate-500 font-mono">{sale.buyerAddress}</p>
          </div>
        </div>
      </TableCell>
      <TableCell className="text-right">
        <p className="font-medium text-amber-400">{formatVBRz(sale.amount)}</p>
        <p className="text-xs text-slate-500">R$ {sale.valueBRL.toLocaleString('pt-BR')}</p>
      </TableCell>
      <TableCell>
        <Badge variant="outline" className={cn('text-xs', sale.type === 'liquid' ? 'text-emerald-400 border-emerald-500/30' : 'text-purple-400 border-purple-500/30')}>
          {sale.type === 'liquid' ? 'Líquido' : `${sale.vestingMonths}m Vesting`}
        </Badge>
      </TableCell>
      <TableCell>
        <Badge className={cn('text-xs', status.bg, status.color)}>
          {status.label}
        </Badge>
      </TableCell>
      <TableCell className="text-slate-500 text-sm">{timeLabel}</TableCell>
      <TableCell>
        {sale.txHash && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-slate-500 hover:text-slate-300"
            onClick={handleCopy}
          >
            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
          </Button>
        )}
      </TableCell>
    </TableRow>
  );
}

// =============================================================================
// COMPONENTE PRINCIPAL
// =============================================================================

export function DirectSalesDesk() {
  // Form State
  const [buyerAddress, setBuyerAddress] = useState('');
  const [buyerName, setBuyerName] = useState('');
  const [amountVBRz, setAmountVBRz] = useState('');
  const [saleType, setSaleType] = useState<'liquid' | 'vested'>('liquid');
  const [vestingPreset, setVestingPreset] = useState<string>('angel');
  const [customCliff, setCustomCliff] = useState('');
  const [customVesting, setCustomVesting] = useState('');
  const [useCustomVesting, setUseCustomVesting] = useState(false);

  // UI State
  const [isProcessing, setIsProcessing] = useState(false);
  const [recentSales] = useState<SaleTransaction[]>(MOCK_RECENT_SALES);

  // Calculos
  const amount = parseFloat(amountVBRz) || 0;
  const valueBRL = amount * VBRZ_CONFIG.fixedPegBRL;

  // Validacao
  const isValidAddress = buyerAddress.startsWith('0x') && buyerAddress.length >= 42;
  const isValidAmount = amount > 0 && amount <= 100_000_000; // Max 100M por transacao

  const selectedPreset = VESTING_PRESETS.find(p => p.id === vestingPreset);
  const cliffMonths = useCustomVesting ? parseInt(customCliff) || 0 : (selectedPreset?.cliffMonths || 0);
  const vestingMonths = useCustomVesting ? parseInt(customVesting) || 0 : (selectedPreset?.vestingMonths || 0);

  const canSubmit = isValidAddress && isValidAmount && !isProcessing;

  // Handlers
  const handleSubmit = async () => {
    if (!canSubmit) return;

    setIsProcessing(true);

    try {
      // Simula chamada de contrato
      await new Promise(resolve => setTimeout(resolve, 2000));

      if (saleType === 'liquid') {
        // Simula transfer()
        toast.success('Transferência realizada com sucesso!', {
          description: `${formatVBRz(amount)} VBRz enviados para ${buyerAddress.slice(0, 10)}...`,
        });
      } else {
        // Simula createVestingSchedule()
        toast.success('Vesting criado com sucesso!', {
          description: `Schedule de ${vestingMonths} meses criado para ${buyerAddress.slice(0, 10)}...`,
        });
      }

      // Reset form
      setBuyerAddress('');
      setBuyerName('');
      setAmountVBRz('');
    } catch {
      toast.error('Erro ao processar transação', {
        description: 'Verifique os dados e tente novamente.',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-6 bg-slate-950 p-6 rounded-2xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl">
            <Banknote className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              Balcão de Vendas OTC
              <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                ADMIN
              </Badge>
            </h1>
            <p className="text-slate-400">
              Venda manual de tokens VBRz para investidores
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-slate-400">Cotação Atual</p>
          <p className="text-2xl font-bold text-amber-400">
            R$ {VBRZ_CONFIG.fixedPegBRL.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Formulario de Venda - 2/3 */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tipo de Venda */}
          <Card className="bg-slate-900/80 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-400" />
                Tipo de Venda
              </CardTitle>
              <CardDescription className="text-slate-400">
                Escolha como os tokens serão entregues ao comprador
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <SaleTypeCard
                  type="liquid"
                  isSelected={saleType === 'liquid'}
                  onClick={() => setSaleType('liquid')}
                />
                <SaleTypeCard
                  type="vested"
                  isSelected={saleType === 'vested'}
                  onClick={() => setSaleType('vested')}
                />
              </div>

              {/* Opcoes de Vesting */}
              {saleType === 'vested' && (
                <div className="mt-4 p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
                  <div className="flex items-center justify-between mb-4">
                    <Label className="text-purple-300">Configuração do Vesting</Label>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={useCustomVesting}
                        onCheckedChange={setUseCustomVesting}
                      />
                      <span className="text-sm text-slate-400">Personalizado</span>
                    </div>
                  </div>

                  {!useCustomVesting ? (
                    <Select value={vestingPreset} onValueChange={setVestingPreset}>
                      <SelectTrigger className="bg-slate-800 border-slate-600 text-white">
                        <SelectValue placeholder="Selecione um preset" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-600">
                        {VESTING_PRESETS.map(preset => (
                          <SelectItem
                            key={preset.id}
                            value={preset.id}
                            className="text-white hover:bg-slate-700"
                          >
                            <div>
                              <p className="font-medium">{preset.name}</p>
                              <p className="text-xs text-slate-400">{preset.description}</p>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-slate-400 text-sm">Cliff (meses)</Label>
                        <Input
                          type="number"
                          value={customCliff}
                          onChange={(e) => setCustomCliff(e.target.value)}
                          placeholder="0"
                          className="bg-slate-800 border-slate-600 text-white"
                        />
                      </div>
                      <div>
                        <Label className="text-slate-400 text-sm">Vesting (meses)</Label>
                        <Input
                          type="number"
                          value={customVesting}
                          onChange={(e) => setCustomVesting(e.target.value)}
                          placeholder="12"
                          className="bg-slate-800 border-slate-600 text-white"
                        />
                      </div>
                    </div>
                  )}

                  <div className="mt-4 flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-amber-400" />
                      <span className="text-slate-400">Cliff:</span>
                      <span className="text-white font-medium">{cliffMonths} meses</span>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-600" />
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-emerald-400" />
                      <span className="text-slate-400">Liberação:</span>
                      <span className="text-white font-medium">{vestingMonths} meses</span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Dados do Comprador */}
          <Card className="bg-slate-900/80 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Users className="h-5 w-5 text-cyan-400" />
                Dados do Comprador
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-400">Endereço da Carteira *</Label>
                  <Input
                    value={buyerAddress}
                    onChange={(e) => setBuyerAddress(e.target.value)}
                    placeholder="0x..."
                    className={cn(
                      'bg-slate-800 border-slate-600 text-white font-mono',
                      buyerAddress && !isValidAddress && 'border-red-500'
                    )}
                  />
                  {buyerAddress && !isValidAddress && (
                    <p className="text-xs text-red-400 mt-1">Endereço inválido</p>
                  )}
                </div>
                <div>
                  <Label className="text-slate-400">Nome do Comprador (opcional)</Label>
                  <Input
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    placeholder="Ex: João Silva, Fundo ABC"
                    className="bg-slate-800 border-slate-600 text-white"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quantidade e Valor */}
          <Card className="bg-slate-900/80 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Calculator className="h-5 w-5 text-amber-400" />
                Quantidade e Valor
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-400">Quantidade VBRz *</Label>
                  <Input
                    type="number"
                    value={amountVBRz}
                    onChange={(e) => setAmountVBRz(e.target.value)}
                    placeholder="100000"
                    className="bg-slate-800 border-slate-600 text-white text-lg"
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Máximo: 100.000.000 VBRz por transação
                  </p>
                </div>
                <div>
                  <Label className="text-slate-400">Valor em Reais</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-emerald-400" />
                    <Input
                      value={valueBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      readOnly
                      className="bg-slate-800 border-slate-600 text-emerald-400 text-lg pl-10"
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Calculado automaticamente (R$ 0,10/VBRz)
                  </p>
                </div>
              </div>

              {/* Quick Amount Buttons */}
              <div className="flex flex-wrap gap-2">
                {[10000, 50000, 100000, 500000, 1000000].map(amt => (
                  <Button
                    key={amt}
                    variant="outline"
                    size="sm"
                    className="border-slate-600 text-slate-400 hover:text-white hover:border-amber-500"
                    onClick={() => setAmountVBRz(amt.toString())}
                  >
                    {(amt / 1000).toFixed(0)}K
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Aviso de Vesting */}
          {saleType === 'vested' && (
            <Alert className="bg-purple-500/10 border-purple-500/30">
              <Lock className="h-4 w-4 text-purple-400" />
              <AlertTitle className="text-purple-300">Vesting Schedule</AlertTitle>
              <AlertDescription className="text-purple-400/80">
                Será criado um schedule de vesting com {cliffMonths} meses de cliff e {vestingMonths} meses de liberação linear.
                Os tokens serão bloqueados no contrato TokenVesting.sol.
              </AlertDescription>
            </Alert>
          )}

          {/* Submit Button */}
          <Button
            className={cn(
              'w-full h-14 text-lg font-bold',
              saleType === 'liquid'
                ? 'bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700'
                : 'bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-600 hover:to-violet-700'
            )}
            disabled={!canSubmit}
            onClick={handleSubmit}
          >
            {isProcessing ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Processando...
              </>
            ) : saleType === 'liquid' ? (
              <>
                <Send className="h-5 w-5 mr-2" />
                Transferir {formatVBRz(amount)} VBRz
              </>
            ) : (
              <>
                <Lock className="h-5 w-5 mr-2" />
                Criar Vesting de {formatVBRz(amount)} VBRz
              </>
            )}
          </Button>
        </div>

        {/* Sidebar - Resumo e Historico */}
        <div className="space-y-6">
          {/* Resumo da Transacao */}
          <Card className="bg-slate-900/80 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white text-lg">Resumo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Quantidade</span>
                  <span className="text-amber-400 font-bold">{formatVBRz(amount)} VBRz</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Valor Total</span>
                  <span className="text-emerald-400 font-bold">
                    R$ {valueBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <Separator className="bg-slate-700" />
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Tipo</span>
                  <Badge
                    variant="outline"
                    className={cn(
                      saleType === 'liquid'
                        ? 'text-emerald-400 border-emerald-500/30'
                        : 'text-purple-400 border-purple-500/30'
                    )}
                  >
                    {saleType === 'liquid' ? 'Líquido' : 'Vesting'}
                  </Badge>
                </div>
                {saleType === 'vested' && (
                  <>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Cliff</span>
                      <span className="text-white">{cliffMonths} meses</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Liberação</span>
                      <span className="text-white">{vestingMonths} meses</span>
                    </div>
                  </>
                )}
                <Separator className="bg-slate-700" />
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Destinatário</span>
                  <span className="text-white font-mono text-xs">
                    {buyerAddress ? `${buyerAddress.slice(0, 8)}...` : '-'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Estatisticas de Vendas */}
          <Card className="bg-slate-900/80 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white text-lg flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-400" />
                Estatísticas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-800/50 rounded-lg text-center">
                  <p className="text-2xl font-bold text-amber-400">15</p>
                  <p className="text-xs text-slate-500">Vendas Hoje</p>
                </div>
                <div className="p-3 bg-slate-800/50 rounded-lg text-center">
                  <p className="text-2xl font-bold text-emerald-400">2.5M</p>
                  <p className="text-xs text-slate-500">VBRz Vendidos</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Volume (7d)</span>
                  <span className="text-white">R$ 850.000</span>
                </div>
                <Progress value={68} className="h-1.5 bg-slate-800" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Historico de Vendas Recentes */}
      <Card className="bg-slate-900/80 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Clock className="h-5 w-5 text-slate-400" />
            Vendas Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-slate-700/50 overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-800/50">
                <TableRow className="border-slate-700/50">
                  <TableHead className="text-slate-400">Comprador</TableHead>
                  <TableHead className="text-right text-slate-400">Quantidade</TableHead>
                  <TableHead className="text-slate-400">Tipo</TableHead>
                  <TableHead className="text-slate-400">Status</TableHead>
                  <TableHead className="text-slate-400">Tempo</TableHead>
                  <TableHead className="w-8"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentSales.map(sale => (
                  <RecentSaleRow key={sale.id} sale={sale} />
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        <CardFooter className="border-t border-slate-700/50 justify-center">
          <Button variant="ghost" className="text-slate-400 hover:text-white">
            Ver todas as transações
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

export default DirectSalesDesk;
