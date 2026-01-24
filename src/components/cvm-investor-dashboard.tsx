/**
 * Vinculo Brasil - CVM Investor Dashboard
 *
 * Dashboard executivo para apresentacao a investidores da CVM.
 * Demonstra a arquitetura do Smart Settlement Protocol com
 * tokenizacao RWA, fluxo de liquidez e compliance.
 *
 * Baseado no Sumario Executivo:
 * - Modelo 85/5/5/5 de Yield Stacking
 * - On-Ramp Automatico (PIX -> BRZ -> Split)
 * - Zero Custody Risk
 * - Auditoria em Tempo Real
 */

import { useState, useEffect } from 'react';
import {
  Globe,
  Activity,
  Layers,
  ShieldCheck,
  TrendingUp,
  Landmark,
  Building2,
  Users,
  Coins,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  ExternalLink,
  Zap,
  Lock,
  Unlock,
  CheckCircle2,
  AlertCircle,
  Clock,
  Wallet,
  Server,
  Database,
  ArrowRight,
  Shield,
  FileCheck,
  BarChart3,
  PieChart,
  Banknote,
  CreditCard,
  QrCode,
  Receipt,
  Eye,
  Download,
  ChevronRight,
  Hexagon,
  Box,
  GitBranch,
  Terminal,
  Cpu,
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { VinculoBrasilLogo } from '@/components/vinculo-brasil-logo';

// ============================================
// TYPES
// ============================================

interface ProtocolMetrics {
  tvl: number;
  collateralCapacity: number;
  utilizationRate: number;
  activeContracts: number;
  totalGuarantors: number;
  totalTenants: number;
  defaultRate: number;
  avgTrustScore: number;
}

interface YieldStackingMetrics {
  totalRentProcessed: number;
  landlordPayout: number;
  guarantorYield: number;
  insuranceReserve: number;
  platformRevenue: number;
}

interface LiquidityPoolStatus {
  treasuryBalance: number;
  pendingSettlements: number;
  last24hVolume: number;
  rebalanceThreshold: number;
  healthStatus: 'healthy' | 'warning' | 'critical';
  lastRebalance: Date;
}

interface TokenizationTransaction {
  id: string;
  type: 'pix' | 'boleto' | 'card';
  amount: number;
  brzEquivalent: number;
  contractNftId: string;
  timestamp: Date;
  status: 'completed' | 'pending' | 'processing';
  txHash?: string;
}

interface ComplianceMetric {
  label: string;
  status: 'compliant' | 'pending' | 'review';
  lastAudit: Date;
  details: string;
}

// ============================================
// DADOS VAZIOS PARA PRODUCAO
// ============================================

const EMPTY_PROTOCOL_METRICS: ProtocolMetrics = {
  tvl: 0,
  collateralCapacity: 0,
  utilizationRate: 0,
  activeContracts: 0,
  totalGuarantors: 0,
  totalTenants: 0,
  defaultRate: 0,
  avgTrustScore: 0,
};

const EMPTY_YIELD_STACKING: YieldStackingMetrics = {
  totalRentProcessed: 0,
  landlordPayout: 0,
  guarantorYield: 0,
  insuranceReserve: 0,
  platformRevenue: 0,
};

const EMPTY_LIQUIDITY_STATUS: LiquidityPoolStatus = {
  treasuryBalance: 0,
  pendingSettlements: 0,
  last24hVolume: 0,
  rebalanceThreshold: 0,
  healthStatus: 'healthy',
  lastRebalance: new Date(),
};

const EMPTY_TOKENIZATION_TXS: TokenizationTransaction[] = [];

const EMPTY_COMPLIANCE: ComplianceMetric[] = [];

// ============================================
// HELPER FUNCTIONS
// ============================================

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatShortCurrency(value: number): string {
  if (value >= 1000000000) {
    return `R$ ${(value / 1000000000).toFixed(1)}B`;
  }
  if (value >= 1000000) {
    return `R$ ${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `R$ ${(value / 1000).toFixed(0)}K`;
  }
  return formatCurrency(value);
}

function formatTimestamp(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);

  if (minutes < 60) return `${minutes}min atras`;
  if (hours < 24) return `${hours}h atras`;
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function formatHash(hash: string): string {
  return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
}

// ============================================
// SUB-COMPONENTS
// ============================================

/**
 * Header com logo e status da rede
 */
function DashboardHeader() {
  return (
    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-border pb-6">
      <div className="flex items-center gap-4">
        <VinculoBrasilLogo size="md" showText={false} />
        <div>
          <h1 className="text-2xl lg:text-3xl font-black tracking-tight">
            INVESTOR DASHBOARD
          </h1>
          <p className="text-muted-foreground font-mono text-[10px] uppercase tracking-[0.2em]">
            Protocolo Descentralizado de Liquidez para RWA
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 rounded-full border border-emerald-500/20">
          <Activity className="h-4 w-4 text-emerald-500 animate-pulse" />
          <span className="text-xs font-bold text-emerald-500">REDE OPERACIONAL</span>
        </div>
        <Badge variant="outline" className="font-mono border-border text-muted-foreground">
          <Hexagon className="h-3 w-3 mr-1" />
          Polygon
        </Badge>
        <Badge variant="outline" className="font-mono border-border text-muted-foreground">
          <Server className="h-3 w-3 mr-1" />
          Self-Hosted (Proxmox)
        </Badge>
      </div>
    </div>
  );
}

/**
 * Metricas principais do protocolo
 */
function ProtocolMetricsGrid({ metrics }: { metrics: ProtocolMetrics }) {
  const items = [
    {
      label: 'TVL (Imoveis Tokenizados)',
      value: formatShortCurrency(metrics.tvl),
      icon: Globe,
      color: 'text-indigo-400',
      subtext: `${metrics.totalGuarantors} garantidores ativos`,
    },
    {
      label: 'Capacidade de Garantia (80% LTV)',
      value: formatShortCurrency(metrics.collateralCapacity),
      icon: Layers,
      color: 'text-emerald-400',
      subtext: `${metrics.utilizationRate}% utilizado`,
    },
    {
      label: 'Contratos Ativos (NFTs)',
      value: metrics.activeContracts.toString(),
      icon: FileCheck,
      color: 'text-amber-400',
      subtext: `${metrics.totalTenants} inquilinos`,
    },
    {
      label: 'Taxa de Inadimplencia',
      value: `${metrics.defaultRate}%`,
      icon: ShieldCheck,
      color: 'text-cyan-400',
      subtext: `Trust Score medio: ${metrics.avgTrustScore}`,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map((item) => (
        <Card key={item.label} className="bg-card/50 border-border">
          <CardContent className="p-4 lg:p-6">
            <item.icon className={cn('h-5 w-5 mb-3', item.color)} />
            <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-wide">
              {item.label}
            </p>
            <h2 className="text-xl lg:text-2xl font-black mt-1">{item.value}</h2>
            <p className="text-[10px] text-muted-foreground/70 mt-1">{item.subtext}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

/**
 * Visualizacao do modelo 85/5/5/5
 */
function YieldStackingVisualization({ data }: { data: YieldStackingMetrics }) {
  const splits = [
    {
      label: 'Locador',
      percentage: 85,
      amount: data.landlordPayout,
      color: 'bg-indigo-500',
      description: 'Receita liquida do aluguel',
    },
    {
      label: 'Garantidor',
      percentage: 5,
      amount: data.guarantorYield,
      color: 'bg-amber-500',
      description: 'Remuneracao pelo risco de lastro',
    },
    {
      label: 'Reserva de Liquidez',
      percentage: 5,
      amount: data.insuranceReserve,
      color: 'bg-emerald-500',
      description: 'Fundo de protecao on-chain',
    },
    {
      label: 'Plataforma',
      percentage: 5,
      amount: data.platformRevenue,
      color: 'bg-muted-foreground',
      description: 'Taxa de servico do protocolo',
    },
  ];

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-foreground flex items-center gap-2">
              <PieChart className="h-5 w-5 text-indigo-400" />
              Modelo 85/5/5/5 - Yield Stacking
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Distribuicao atomica de fluxo de caixa via Smart Contract
            </CardDescription>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-muted-foreground uppercase">Total Processado</p>
            <p className="text-xl font-black text-foreground">
              {formatShortCurrency(data.totalRentProcessed)}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Visual Bar */}
        <div className="flex h-8 rounded-xl overflow-hidden">
          {splits.map((split) => (
            <TooltipProvider key={split.label}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className={cn(split.color, 'flex items-center justify-center transition-all hover:opacity-80 cursor-help')}
                    style={{ width: `${split.percentage}%` }}
                  >
                    <span className="text-[10px] font-bold text-foreground">
                      {split.percentage}%
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent className="bg-card border-border">
                  <p className="font-bold">{split.label}</p>
                  <p className="text-muted-foreground">{split.description}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>

        {/* Detailed Breakdown */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {splits.map((split) => (
            <div
              key={split.label}
              className="p-4 bg-muted/50 rounded-xl border border-border/50"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={cn('h-3 w-3 rounded-full', split.color)} />
                <span className="text-xs font-bold text-muted-foreground uppercase">
                  {split.label}
                </span>
              </div>
              <p className="text-lg font-black text-foreground">
                {formatShortCurrency(split.amount)}
              </p>
              <p className="text-[10px] text-muted-foreground/70 mt-1">{split.description}</p>
            </div>
          ))}
        </div>

        <div className="p-4 bg-indigo-500/5 rounded-xl border border-indigo-500/20">
          <p className="text-xs text-indigo-300 italic">
            <strong>Nota para o Investidor:</strong> O split ocorre atomicamente na blockchain.
            O locador recebe em D+0, eliminando o float bancario tradicional de 5-10 dias.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Diagrama de Fluxo de Tokenizacao
 */
function TokenizationFlowDiagram() {
  const steps = [
    {
      id: 1,
      icon: QrCode,
      label: 'PIX/Boleto/Cartao',
      description: 'Inquilino paga via gateway',
      color: 'bg-blue-500',
    },
    {
      id: 2,
      icon: Server,
      label: 'Webhook Validado',
      description: 'HMAC-SHA256 + IP Whitelist',
      color: 'bg-purple-500',
    },
    {
      id: 3,
      icon: Coins,
      label: 'Conversao BRZ',
      description: 'R$ 1,00 = 1 Token BRZ',
      color: 'bg-amber-500',
    },
    {
      id: 4,
      icon: GitBranch,
      label: 'Smart Contract Split',
      description: 'payRent() atomico',
      color: 'bg-emerald-500',
    },
    {
      id: 5,
      icon: Wallet,
      label: 'Distribuicao Instantanea',
      description: '85/5/5/5 em <30s',
      color: 'bg-indigo-500',
    },
  ];

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="text-foreground flex items-center gap-2">
          <GitBranch className="h-5 w-5 text-purple-400" />
          Fluxo de Tokenizacao (On-Ramp Automatico)
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Do PIX ao Split na Blockchain - Execucao em tempo real
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative">
          {/* Connection Line */}
          <div className="absolute top-8 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-500 hidden lg:block" />

          {/* Steps */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 lg:gap-2">
            {steps.map((step, index) => (
              <div key={step.id} className="relative flex flex-col items-center text-center">
                {/* Step Circle */}
                <div
                  className={cn(
                    'h-16 w-16 rounded-2xl flex items-center justify-center mb-3 relative z-10',
                    step.color
                  )}
                >
                  <step.icon className="h-7 w-7 text-foreground" />
                </div>

                {/* Arrow for mobile */}
                {index < steps.length - 1 && (
                  <ArrowRight className="h-5 w-5 text-muted-foreground/70 my-2 lg:hidden" />
                )}

                {/* Label */}
                <p className="text-sm font-bold text-foreground">{step.label}</p>
                <p className="text-[10px] text-muted-foreground mt-1">{step.description}</p>
              </div>
            ))}
          </div>
        </div>

        <Separator className="my-6 bg-muted" />

        {/* Key Features */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="p-4 bg-emerald-500/5 rounded-xl border border-emerald-500/20">
            <ShieldCheck className="h-5 w-5 text-emerald-400 mb-2" />
            <p className="text-sm font-bold text-emerald-400">Shield Layer</p>
            <p className="text-[10px] text-muted-foreground">
              Tripla blindagem: HMAC + IP Whitelist + Idempotencia
            </p>
          </div>
          <div className="p-4 bg-amber-500/5 rounded-xl border border-amber-500/20">
            <Coins className="h-5 w-5 text-amber-400 mb-2" />
            <p className="text-sm font-bold text-amber-400">Lastro 1:1</p>
            <p className="text-[10px] text-muted-foreground">
              Cada BRZ na blockchain tem R$1 correspondente no banco
            </p>
          </div>
          <div className="p-4 bg-indigo-500/5 rounded-xl border border-indigo-500/20">
            <Zap className="h-5 w-5 text-indigo-400 mb-2" />
            <p className="text-sm font-bold text-indigo-400">Liquidacao D+0</p>
            <p className="text-[10px] text-muted-foreground">
              Locador recebe em segundos, nao em dias
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Monitor de Liquidez da Carteira Tesoureira
 */
function LiquidityMonitor({ status }: { status: LiquidityPoolStatus }) {
  const healthColors = {
    healthy: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    warning: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    critical: 'text-red-400 bg-red-500/10 border-red-500/20',
  };

  const healthLabels = {
    healthy: 'Saudavel',
    warning: 'Atencao',
    critical: 'Critico',
  };

  const utilizationPercent = Math.min(
    ((status.treasuryBalance - status.rebalanceThreshold) / status.rebalanceThreshold) * 100 + 100,
    100
  );

  return (
    <Card className="bg-gradient-to-br from-zinc-900 to-zinc-950 border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Wallet className="h-5 w-5 text-cyan-400" />
              Carteira Tesoureira (Operator Wallet)
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Pool de liquidez para On-Ramp automatico
            </CardDescription>
          </div>
          <Badge className={cn('border', healthColors[status.healthStatus])}>
            {status.healthStatus === 'healthy' ? (
              <CheckCircle2 className="h-3 w-3 mr-1" />
            ) : status.healthStatus === 'warning' ? (
              <AlertCircle className="h-3 w-3 mr-1" />
            ) : (
              <AlertCircle className="h-3 w-3 mr-1" />
            )}
            {healthLabels[status.healthStatus]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Balance */}
        <div className="p-6 bg-gradient-to-r from-cyan-500/10 to-indigo-500/10 rounded-2xl border border-cyan-500/20">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">
                Saldo BRZ Disponivel
              </p>
              <p className="text-3xl font-black text-foreground">
                {formatCurrency(status.treasuryBalance)}
              </p>
            </div>
            <div className="h-16 w-16 rounded-2xl bg-cyan-500/20 flex items-center justify-center">
              <Coins className="h-8 w-8 text-cyan-400" />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Limite de Rebalanceamento</span>
              <span className="text-amber-400">{formatCurrency(status.rebalanceThreshold)}</span>
            </div>
            <Progress value={utilizationPercent} className="h-2" />
            <p className="text-[10px] text-muted-foreground/70">
              Alerta automatico quando saldo baixar de {formatCurrency(status.rebalanceThreshold)}
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 bg-muted/50 rounded-xl text-center">
            <Clock className="h-5 w-5 text-muted-foreground mx-auto mb-2" />
            <p className="text-[10px] text-muted-foreground uppercase">Pendentes</p>
            <p className="text-lg font-bold text-amber-400">
              {formatShortCurrency(status.pendingSettlements)}
            </p>
          </div>
          <div className="p-4 bg-muted/50 rounded-xl text-center">
            <TrendingUp className="h-5 w-5 text-muted-foreground mx-auto mb-2" />
            <p className="text-[10px] text-muted-foreground uppercase">Volume 24h</p>
            <p className="text-lg font-bold text-emerald-400">
              {formatShortCurrency(status.last24hVolume)}
            </p>
          </div>
          <div className="p-4 bg-muted/50 rounded-xl text-center">
            <RefreshCw className="h-5 w-5 text-muted-foreground mx-auto mb-2" />
            <p className="text-[10px] text-muted-foreground uppercase">Ultimo Rebalance</p>
            <p className="text-sm font-bold text-foreground">
              {formatTimestamp(status.lastRebalance)}
            </p>
          </div>
        </div>

        {/* Integration Status */}
        <div className="p-4 bg-muted/30 rounded-xl border border-border/50">
          <p className="text-xs font-bold text-muted-foreground mb-3 flex items-center gap-2">
            <Database className="h-4 w-4" />
            Integracao Transfero (BRZ)
          </p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs text-muted-foreground">API Ativa</span>
            </div>
            <span className="text-xs text-muted-foreground font-mono">
              Rebalanceamento automatico configurado
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Feed de Transacoes de Tokenizacao
 */
function TokenizationFeed({ transactions }: { transactions: TokenizationTransaction[] }) {
  const typeIcons = {
    pix: QrCode,
    boleto: Receipt,
    card: CreditCard,
  };

  const typeLabels = {
    pix: 'PIX',
    boleto: 'Boleto',
    card: 'Cartao',
  };

  const statusConfig = {
    completed: { color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20', icon: CheckCircle2 },
    processing: { color: 'bg-blue-500/10 text-blue-400 border-blue-500/20', icon: RefreshCw },
    pending: { color: 'bg-amber-500/10 text-amber-400 border-amber-500/20', icon: Clock },
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Activity className="h-5 w-5 text-emerald-400" />
              Transacoes em Tempo Real
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Fluxo de tokenizacao Fiat → BRZ → Split
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" className="border-border text-muted-foreground">
            <Eye className="h-4 w-4 mr-2" />
            Ver Todas
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {transactions.map((tx) => {
            const TypeIcon = typeIcons[tx.type];
            const config = statusConfig[tx.status];
            const StatusIcon = config.icon;

            return (
              <div
                key={tx.id}
                className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border border-border/30 hover:border-border transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-xl bg-muted flex items-center justify-center">
                    <TypeIcon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground">
                        {formatCurrency(tx.amount)}
                      </span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground/70" />
                      <span className="font-bold text-amber-400">
                        {tx.brzEquivalent} BRZ
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                      <span>{typeLabels[tx.type]}</span>
                      <span>•</span>
                      <span>{tx.contractNftId}</span>
                      <span>•</span>
                      <span>{formatTimestamp(tx.timestamp)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {tx.txHash && (
                    <a
                      href={`https://polygonscan.com/tx/${tx.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-mono text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                    >
                      {formatHash(tx.txHash)}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                  <Badge variant="outline" className={cn('text-[10px]', config.color)}>
                    <StatusIcon className={cn('h-3 w-3 mr-1', tx.status === 'processing' && 'animate-spin')} />
                    {tx.status === 'completed' ? 'Concluido' : tx.status === 'processing' ? 'Processando' : 'Pendente'}
                  </Badge>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Painel de Compliance para CVM
 */
function CompliancePanel({ metrics }: { metrics: ComplianceMetric[] }) {
  const statusConfig = {
    compliant: { color: 'text-emerald-400 bg-emerald-500/10', icon: CheckCircle2, label: 'Conforme' },
    pending: { color: 'text-amber-400 bg-amber-500/10', icon: Clock, label: 'Pendente' },
    review: { color: 'text-blue-400 bg-blue-500/10', icon: Eye, label: 'Em Revisao' },
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Shield className="h-5 w-5 text-emerald-400" />
              Compliance & Gestao de Risco
            </CardTitle>
            <CardDescription className="text-muted-foreground">
              Status de conformidade regulatoria
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" className="border-border text-muted-foreground">
            <Download className="h-4 w-4 mr-2" />
            Exportar Relatorio
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {metrics.map((metric, index) => {
            const config = statusConfig[metric.status];
            const StatusIcon = config.icon;

            return (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border border-border/30"
              >
                <div className="flex items-center gap-4">
                  <div className={cn('h-10 w-10 rounded-xl flex items-center justify-center', config.color)}>
                    <StatusIcon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{metric.label}</p>
                    <p className="text-[10px] text-muted-foreground">{metric.details}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className={cn('text-[10px] border-0', config.color)}>
                    {config.label}
                  </Badge>
                  <p className="text-[10px] text-muted-foreground/70 mt-1">
                    Ultima auditoria: {formatTimestamp(metric.lastAudit)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <Separator className="my-6 bg-muted" />

        {/* Self-Hosting Highlight */}
        <div className="p-4 bg-indigo-500/5 rounded-xl border border-indigo-500/20">
          <div className="flex items-start gap-4">
            <div className="h-12 w-12 rounded-xl bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
              <Cpu className="h-6 w-6 text-indigo-400" />
            </div>
            <div>
              <p className="font-bold text-indigo-400">Soberania Digital - Self-Hosting</p>
              <p className="text-xs text-muted-foreground mt-1">
                Infraestrutura propria hospedada em servidores Proxmox, garantindo total controle
                sobre privacidade de dados e resiliencia da rede. Nao dependemos de AWS/Azure para
                logica critica.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Card de destaque para integração com Drex
 */
function DrexIntegrationCard() {
  return (
    <Card className="bg-gradient-to-br from-emerald-900/30 to-cyan-900/30 border-emerald-500/20">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center flex-shrink-0">
            <Banknote className="h-7 w-7 text-foreground" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-foreground mb-2">
              Preparado para o Real Digital (Drex)
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              A arquitetura do Vinculo Brasil esta alinhada com a evolucao do sistema financeiro
              brasileiro. Nossa infraestrutura de tokenizacao e Smart Contracts esta pronta para
              integrar com o Drex, permitindo liquidacao instantanea e programavel com a moeda
              digital do Banco Central.
            </p>
            <div className="flex items-center gap-4 mt-4">
              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Arquitetura Compativel
              </Badge>
              <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-500/30">
                <Zap className="h-3 w-3 mr-1" />
                Liquidez Programavel
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export function CvmInvestorDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsRefreshing(false);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <ScrollArea className="h-screen">
        <div className="max-w-7xl mx-auto p-6 lg:p-8 space-y-8 pb-16">
          {/* Header */}
          <DashboardHeader />

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <TabsList className="bg-card border border-border">
                <TabsTrigger value="overview" className="data-[state=active]:bg-muted">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Visao Geral
                </TabsTrigger>
                <TabsTrigger value="tokenization" className="data-[state=active]:bg-muted">
                  <GitBranch className="h-4 w-4 mr-2" />
                  Tokenizacao
                </TabsTrigger>
                <TabsTrigger value="compliance" className="data-[state=active]:bg-muted">
                  <Shield className="h-4 w-4 mr-2" />
                  Compliance
                </TabsTrigger>
              </TabsList>

              <Button
                variant="outline"
                size="sm"
                className="border-border gap-2"
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                <RefreshCw className={cn('h-4 w-4', isRefreshing && 'animate-spin')} />
                Atualizar Dados
              </Button>
            </div>

            {/* Overview Tab */}
            <TabsContent value="overview" className="mt-6 space-y-6">
              <ProtocolMetricsGrid metrics={EMPTY_PROTOCOL_METRICS} />
              <YieldStackingVisualization data={EMPTY_YIELD_STACKING} />
              <DrexIntegrationCard />
            </TabsContent>

            {/* Tokenization Tab */}
            <TabsContent value="tokenization" className="mt-6 space-y-6">
              <TokenizationFlowDiagram />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <LiquidityMonitor status={EMPTY_LIQUIDITY_STATUS} />
                <TokenizationFeed transactions={EMPTY_TOKENIZATION_TXS} />
              </div>
            </TabsContent>

            {/* Compliance Tab */}
            <TabsContent value="compliance" className="mt-6 space-y-6">
              <CompliancePanel metrics={EMPTY_COMPLIANCE} />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-foreground flex items-center gap-2">
                      <Lock className="h-5 w-5 text-amber-400" />
                      Zero Custody Risk
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      O protocolo nao exerce custodia sobre o aluguel. O Smart Contract atua como
                      um <strong className="text-foreground">orquestrador de fluxo</strong>. Os fundos
                      passam pelo contrato e sao liquidados instantaneamente, reduzindo o risco
                      sistemico e juridico.
                    </p>
                    <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                      <p className="text-xs text-muted-foreground">
                        <strong>Fluxo:</strong> Banco (Gateway) → Transfero (Conversao) →
                        Blockchain (Distribuicao)
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-foreground flex items-center gap-2">
                      <FileCheck className="h-5 w-5 text-cyan-400" />
                      Auditoria Cruzada
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      Sistema de dupla verificacao para integridade total:
                    </p>
                    <div className="mt-4 space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                        <Banknote className="h-5 w-5 text-emerald-400" />
                        <div>
                          <p className="text-xs font-bold text-foreground">Log Bancario</p>
                          <p className="text-[10px] text-muted-foreground">Extrato do Gateway (Entrada do Real)</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                        <Box className="h-5 w-5 text-indigo-400" />
                        <div>
                          <p className="text-xs font-bold text-foreground">Log Blockchain</p>
                          <p className="text-[10px] text-muted-foreground">Transacao na Polygon (Distribuicao do Token)</p>
                        </div>
                      </div>
                    </div>
                    <p className="text-[10px] text-muted-foreground/70 mt-3 italic">
                      Se os dois baterem, o sistema esta saudavel. Facilita auditorias para fundos de investimento.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          {/* Footer Quote */}
          <div className="p-6 bg-gradient-to-r from-indigo-900/20 via-purple-900/20 to-pink-900/20 rounded-2xl border border-indigo-500/20 text-center">
            <p className="text-lg font-medium text-foreground italic">
              "Estamos a construir a infraestrutura para o futuro dos ativos imobiliarios no Brasil.
              Onde outros veem burocracia, nos entregamos liquidez programavel e auditavel."
            </p>
            <p className="text-sm text-indigo-400 mt-3 font-bold">
              Vinculo Brasil - Financial Tech Infrastructure
            </p>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}

export default CvmInvestorDashboard;
