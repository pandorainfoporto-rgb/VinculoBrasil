/**
 * VBRz Dashboard - Dashboard Completa do Token VBRz
 *
 * Metricas e dados do token utility da plataforma Vinculo.io:
 * - Tokenomics e Supply
 * - Cashback distribuido
 * - Staking e Liquidez
 * - Treasury e Reservas
 * - Cotacao e Volume
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { copyToClipboard as copyToClipboardUtil } from '@/lib/clipboard';
import { useThemeClasses } from '@/hooks/use-theme';
import {
  Coins,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Lock,
  Unlock,
  Users,
  PieChart,
  BarChart3,
  Activity,
  Clock,
  Gift,
  Shield,
  Building2,
  Home,
  Star,
  CircleDollarSign,
  Database,
  Flame,
  Target,
  RefreshCw,
  ExternalLink,
  Copy,
  Check,
  Layers,
  Percent,
  Zap,
} from 'lucide-react';

// ============= DADOS DO TOKEN VBRz =============
// Dados zerados para producao - valores reais virao do backend/blockchain

const tokenData = {
  // Informacoes Basicas
  nome: 'VBRz Token',
  simbolo: 'VBRz',
  rede: 'Polygon PoS',
  contrato: '0x0000...0000',
  decimals: 18,
  standard: 'ERC-20',

  // Supply e Distribuicao
  totalSupply: 0,
  circulatingSupply: 0,
  maxSupply: 100_000_000,

  // Cotacao
  precoUSD: 0,
  precoBRL: 0,
  variacao24h: 0,
  variacao7d: 0,
  volumeUSD24h: 0,
  volumeBRL24h: 0,
  marketCapUSD: 0,
  marketCapBRL: 0,

  // Liquidez
  liquidezTotalUSD: 0,
  liquidezVBRz: 0,
  liquidezUSDC: 0,
  poolDEX: 'Uniswap V3',
  apy: 0,

  // Treasury
  treasuryBalance: 0,
  treasuryValueUSD: 0,
  reservaOperacional: 0,
  reservaMarketing: 0,
  reservaDesenvolvimento: 0,
  fundoCashback: 0,

  // Staking
  totalStaked: 0,
  stakingAPY: 0,
  stakersCount: 0,
  avgStakePeriod: 0,

  // Cashback
  totalDistribuido: 0,
  distribuido30d: 0,
  transacoes30d: 0,
  usuariosAtivos: 0,

  // Burning
  totalQueimado: 0,
  queimado30d: 0,
  proxQueima: new Date(),

  // Holders
  totalHolders: 0,
  novosHolders30d: 0,
  top10Percent: 0,
};

// Distribuicao do Supply - estrutura mantida, valores zerados
const supplyDistribution = [
  { label: 'Circulacao', value: 0, color: 'bg-emerald-500' },
  { label: 'Treasury', value: 0, color: 'bg-indigo-500' },
  { label: 'Staking', value: 0, color: 'bg-violet-500' },
  { label: 'Team (Vesting)', value: 0, color: 'bg-amber-500' },
  { label: 'Parcerias', value: 0, color: 'bg-cyan-500' },
  { label: 'Reserva', value: 0, color: 'bg-rose-500' },
  { label: 'Queimado', value: 0, color: 'bg-slate-500' },
];

// Cashback por categoria - vazio para producao
const cashbackByCategory: { categoria: string; distribuido: number; porcentagem: number }[] = [];

// Cashback por beneficiario - vazio para producao
const cashbackByBeneficiary: { tipo: string; valor: number; usuarios: number; icone: typeof Users }[] = [];

// Historico de precos - vazio para producao
const priceHistory: { dia: string; preco: number; volume: number }[] = [];

// Transacoes recentes de cashback - vazio para producao
const recentTransactions: { id: string; tipo: string; valor: number; wallet: string; tempo: string }[] = [];

// ============= COMPONENTE PRINCIPAL =============

export function VBRzDashboard() {
  const theme = useThemeClasses();
  const [activeTab, setActiveTab] = useState('overview');
  const [copied, setCopied] = useState(false);

  const formatCurrency = (value: number, currency: 'USD' | 'BRL' = 'BRL') => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency === 'USD' ? 'USD' : 'BRL',
      minimumFractionDigits: currency === 'USD' ? 2 : 2,
    }).format(value);
  };

  const formatNumber = (value: number) => {
    if (value >= 1_000_000) {
      return `${(value / 1_000_000).toFixed(2)}M`;
    }
    if (value >= 1_000) {
      return `${(value / 1_000).toFixed(1)}K`;
    }
    return new Intl.NumberFormat('pt-BR').format(value);
  };

  const copyToClipboard = async (text: string) => {
    const success = await copyToClipboardUtil(text);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // ============= KPI CARD =============
  const KPICard = ({
    title,
    value,
    subtitle,
    icon: Icon,
    trend,
    trendValue,
    color = 'blue',
  }: {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: React.ComponentType<{ className?: string }>;
    trend?: 'up' | 'down' | 'neutral';
    trendValue?: string;
    color?: string;
  }) => {
    const colorClasses: Record<string, string> = {
      blue: 'from-blue-500/10 to-blue-600/5 border-blue-500/20',
      emerald: 'from-emerald-500/10 to-emerald-600/5 border-emerald-500/20',
      amber: 'from-amber-500/10 to-amber-600/5 border-amber-500/20',
      violet: 'from-violet-500/10 to-violet-600/5 border-violet-500/20',
      rose: 'from-rose-500/10 to-rose-600/5 border-rose-500/20',
      cyan: 'from-cyan-500/10 to-cyan-600/5 border-cyan-500/20',
      indigo: 'from-indigo-500/10 to-indigo-600/5 border-indigo-500/20',
    };

    const iconColorClasses: Record<string, string> = {
      blue: 'text-blue-500 bg-blue-500/10',
      emerald: 'text-emerald-500 bg-emerald-500/10',
      amber: 'text-amber-500 bg-amber-500/10',
      violet: 'text-violet-500 bg-violet-500/10',
      rose: 'text-rose-500 bg-rose-500/10',
      cyan: 'text-cyan-500 bg-cyan-500/10',
      indigo: 'text-indigo-500 bg-indigo-500/10',
    };

    return (
      <Card className={cn('bg-gradient-to-br border', colorClasses[color])}>
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm text-muted-foreground font-medium">{title}</p>
              <p className="text-2xl font-bold mt-1">{value}</p>
              {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
              {trend && trendValue && (
                <div className={cn(
                  'flex items-center gap-1 mt-2 text-xs font-medium',
                  trend === 'up' ? 'text-emerald-500' : trend === 'down' ? 'text-rose-500' : 'text-muted-foreground'
                )}>
                  {trend === 'up' ? <ArrowUpRight className="h-3 w-3" /> : trend === 'down' ? <ArrowDownRight className="h-3 w-3" /> : null}
                  {trendValue}
                </div>
              )}
            </div>
            <div className={cn('p-3 rounded-xl', iconColorClasses[color])}>
              <Icon className="h-5 w-5" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  // ============= OVERVIEW TAB =============
  const renderOverview = () => (
    <div className="space-y-6">
      {/* Header com info do token */}
      <Card className="bg-gradient-to-r from-indigo-500/10 via-violet-500/10 to-purple-500/10 border-indigo-500/20">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg">
                <Coins className="h-8 w-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{tokenData.nome}</h2>
                <p className="text-muted-foreground flex items-center gap-2">
                  <span className="font-mono text-sm">{tokenData.simbolo}</span>
                  <Badge variant="outline">{tokenData.rede}</Badge>
                  <Badge variant="outline">{tokenData.standard}</Badge>
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-3xl font-bold">{formatCurrency(tokenData.precoBRL)}</p>
                <div className={cn(
                  'flex items-center justify-end gap-1 text-sm font-medium',
                  tokenData.variacao24h >= 0 ? 'text-emerald-500' : 'text-rose-500'
                )}>
                  {tokenData.variacao24h >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                  {tokenData.variacao24h >= 0 ? '+' : ''}{tokenData.variacao24h}% (24h)
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => copyToClipboard(tokenData.contrato)}
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {tokenData.contrato}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPIs Principais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Market Cap"
          value={formatCurrency(tokenData.marketCapBRL)}
          subtitle={formatCurrency(tokenData.marketCapUSD, 'USD')}
          icon={CircleDollarSign}
          color="emerald"
        />
        <KPICard
          title="Volume 24h"
          value={formatCurrency(tokenData.volumeBRL24h)}
          subtitle={formatCurrency(tokenData.volumeUSD24h, 'USD')}
          trend="up"
          trendValue="+15% vs ontem"
          icon={Activity}
          color="blue"
        />
        <KPICard
          title="Total em Staking"
          value={`${formatNumber(tokenData.totalStaked)} VBRz`}
          subtitle={`${((tokenData.totalStaked / tokenData.totalSupply) * 100).toFixed(1)}% do supply`}
          icon={Lock}
          color="violet"
        />
        <KPICard
          title="Cashback Distribuido"
          value={`${formatNumber(tokenData.totalDistribuido)} VBRz`}
          subtitle={formatCurrency(tokenData.totalDistribuido * tokenData.precoBRL)}
          trend="up"
          trendValue="+12% este mes"
          icon={Gift}
          color="amber"
        />
      </div>

      {/* Segunda linha de KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Supply Circulante"
          value={`${formatNumber(tokenData.circulatingSupply)}`}
          subtitle={`${((tokenData.circulatingSupply / tokenData.totalSupply) * 100).toFixed(0)}% do total`}
          icon={Coins}
          color="cyan"
        />
        <KPICard
          title="Liquidez Total"
          value={formatCurrency(tokenData.liquidezTotalUSD, 'USD')}
          subtitle={`${tokenData.poolDEX}`}
          icon={Database}
          color="indigo"
        />
        <KPICard
          title="Total de Holders"
          value={formatNumber(tokenData.totalHolders)}
          subtitle={`+${tokenData.novosHolders30d} novos (30d)`}
          trend="up"
          trendValue="+5.5%"
          icon={Users}
          color="emerald"
        />
        <KPICard
          title="Tokens Queimados"
          value={`${formatNumber(tokenData.totalQueimado)} VBRz`}
          subtitle={`+${formatNumber(tokenData.queimado30d)} este mes`}
          icon={Flame}
          color="rose"
        />
      </div>

      {/* Cards Detalhados */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Distribuicao do Supply */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-indigo-500" />
              Distribuicao do Supply
            </CardTitle>
            <CardDescription>100M tokens totais</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {supplyDistribution.map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="flex items-center gap-2">
                      <div className={cn('w-3 h-3 rounded-full', item.color)} />
                      {item.label}
                    </span>
                    <span className="font-medium">{item.value}%</span>
                  </div>
                  <Progress value={item.value} className="h-2" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Staking Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-violet-500" />
              Staking VBRz
            </CardTitle>
            <CardDescription>Recompensas por bloqueio</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-gradient-to-r from-violet-500/10 to-purple-500/10 rounded-xl">
              <p className="text-sm text-muted-foreground">APY Atual</p>
              <p className="text-3xl font-bold text-violet-600">{tokenData.stakingAPY}%</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-muted/50 rounded-lg text-center">
                <p className="text-xs text-muted-foreground">Total em Stake</p>
                <p className="font-semibold">{formatNumber(tokenData.totalStaked)}</p>
              </div>
              <div className="p-3 bg-muted/50 rounded-lg text-center">
                <p className="text-xs text-muted-foreground">Stakers</p>
                <p className="font-semibold">{formatNumber(tokenData.stakersCount)}</p>
              </div>
            </div>
            <div className="p-3 bg-emerald-500/10 rounded-lg flex items-center justify-between">
              <span className="text-sm">Periodo Medio</span>
              <span className="font-semibold">{tokenData.avgStakePeriod} dias</span>
            </div>
          </CardContent>
        </Card>

        {/* Transacoes Recentes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-cyan-500" />
              Transacoes Recentes
            </CardTitle>
            <CardDescription>Ultimos cashbacks distribuidos</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentTransactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-emerald-500/10">
                      <Gift className="h-4 w-4 text-emerald-500" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{tx.tipo}</p>
                      <p className="text-xs text-muted-foreground font-mono">{tx.wallet}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-emerald-600">+{tx.valor} VBRz</p>
                    <p className="text-xs text-muted-foreground">{tx.tempo}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // ============= TOKENOMICS TAB =============
  const renderTokenomics = () => (
    <div className="space-y-6">
      {/* Supply Info */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-gradient-to-br from-indigo-500/10 to-violet-500/10 border-indigo-500/20">
          <CardContent className="p-6 text-center">
            <Coins className="h-8 w-8 mx-auto mb-3 text-indigo-500" />
            <p className="text-sm text-muted-foreground">Total Supply</p>
            <p className="text-2xl font-bold">{formatNumber(tokenData.totalSupply)} VBRz</p>
            <p className="text-sm text-muted-foreground">Max: {formatNumber(tokenData.maxSupply)}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border-emerald-500/20">
          <CardContent className="p-6 text-center">
            <Unlock className="h-8 w-8 mx-auto mb-3 text-emerald-500" />
            <p className="text-sm text-muted-foreground">Circulante</p>
            <p className="text-2xl font-bold">{formatNumber(tokenData.circulatingSupply)} VBRz</p>
            <p className="text-sm text-muted-foreground">{((tokenData.circulatingSupply / tokenData.totalSupply) * 100).toFixed(0)}% do total</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-rose-500/10 to-amber-500/10 border-rose-500/20">
          <CardContent className="p-6 text-center">
            <Flame className="h-8 w-8 mx-auto mb-3 text-rose-500" />
            <p className="text-sm text-muted-foreground">Queimado</p>
            <p className="text-2xl font-bold">{formatNumber(tokenData.totalQueimado)} VBRz</p>
            <p className="text-sm text-muted-foreground">Deflacionario</p>
          </CardContent>
        </Card>
      </div>

      {/* Detalhamento Treasury */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-indigo-500" />
            Treasury & Reservas
          </CardTitle>
          <CardDescription>Alocacao dos tokens do tesouro</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="p-4 bg-indigo-500/10 rounded-xl">
              <p className="text-sm text-muted-foreground">Fundo de Cashback</p>
              <p className="text-xl font-bold">{formatNumber(tokenData.fundoCashback)} VBRz</p>
              <p className="text-sm text-indigo-600">{formatCurrency(tokenData.fundoCashback * tokenData.precoBRL)}</p>
            </div>
            <div className="p-4 bg-emerald-500/10 rounded-xl">
              <p className="text-sm text-muted-foreground">Reserva Operacional</p>
              <p className="text-xl font-bold">{formatNumber(tokenData.reservaOperacional)} VBRz</p>
              <p className="text-sm text-emerald-600">{formatCurrency(tokenData.reservaOperacional * tokenData.precoBRL)}</p>
            </div>
            <div className="p-4 bg-violet-500/10 rounded-xl">
              <p className="text-sm text-muted-foreground">Marketing</p>
              <p className="text-xl font-bold">{formatNumber(tokenData.reservaMarketing)} VBRz</p>
              <p className="text-sm text-violet-600">{formatCurrency(tokenData.reservaMarketing * tokenData.precoBRL)}</p>
            </div>
            <div className="p-4 bg-cyan-500/10 rounded-xl">
              <p className="text-sm text-muted-foreground">Desenvolvimento</p>
              <p className="text-xl font-bold">{formatNumber(tokenData.reservaDesenvolvimento)} VBRz</p>
              <p className="text-sm text-cyan-600">{formatCurrency(tokenData.reservaDesenvolvimento * tokenData.precoBRL)}</p>
            </div>
          </div>
          <Separator className="my-4" />
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-indigo-500/5 to-violet-500/5 rounded-xl">
            <div>
              <p className="font-semibold">Total Treasury</p>
              <p className="text-sm text-muted-foreground">{formatNumber(tokenData.treasuryBalance)} VBRz</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">{formatCurrency(tokenData.treasuryValueUSD, 'USD')}</p>
              <p className="text-sm text-muted-foreground">{formatCurrency(tokenData.treasuryValueUSD * 5)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cronograma de Vesting */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-amber-500" />
            Cronograma de Vesting
          </CardTitle>
          <CardDescription>Liberacao programada de tokens</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { categoria: 'Team', total: 10_000_000, liberado: 3_000_000, proximo: 'Mar 2026', periodo: '36 meses' },
              { categoria: 'Advisors', total: 2_000_000, liberado: 800_000, proximo: 'Abr 2026', periodo: '24 meses' },
              { categoria: 'Parcerias Estrategicas', total: 5_000_000, liberado: 2_500_000, proximo: 'Fev 2026', periodo: '12 meses' },
            ].map((item) => (
              <div key={item.categoria} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{item.categoria}</span>
                  <Badge variant="outline">{item.periodo}</Badge>
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                  <span>Liberado: {formatNumber(item.liberado)} de {formatNumber(item.total)}</span>
                  <span>Proximo: {item.proximo}</span>
                </div>
                <Progress value={(item.liberado / item.total) * 100} className="h-2" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // ============= CASHBACK TAB =============
  const renderCashback = () => (
    <div className="space-y-6">
      {/* KPIs Cashback */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Total Distribuido"
          value={`${formatNumber(tokenData.totalDistribuido)} VBRz`}
          subtitle={formatCurrency(tokenData.totalDistribuido * tokenData.precoBRL)}
          icon={Gift}
          color="emerald"
        />
        <KPICard
          title="Distribuido (30d)"
          value={`${formatNumber(tokenData.distribuido30d)} VBRz`}
          subtitle={formatCurrency(tokenData.distribuido30d * tokenData.precoBRL)}
          trend="up"
          trendValue="+18% vs periodo anterior"
          icon={TrendingUp}
          color="blue"
        />
        <KPICard
          title="Transacoes (30d)"
          value={formatNumber(tokenData.transacoes30d)}
          subtitle={`${(tokenData.distribuido30d / tokenData.transacoes30d).toFixed(1)} VBRz medio`}
          icon={Activity}
          color="violet"
        />
        <KPICard
          title="Usuarios Ativos"
          value={formatNumber(tokenData.usuariosAtivos)}
          subtitle="Receberam cashback"
          trend="up"
          trendValue="+234 novos"
          icon={Users}
          color="cyan"
        />
      </div>

      {/* Cashback por Categoria */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-indigo-500" />
            Cashback por Categoria
          </CardTitle>
          <CardDescription>Distribuicao por tipo de operacao</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {cashbackByCategory.map((item) => (
              <div key={item.categoria}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{item.categoria}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">{item.porcentagem}%</span>
                    <span className="font-semibold">{formatNumber(item.distribuido)} VBRz</span>
                  </div>
                </div>
                <Progress value={item.porcentagem} className="h-3" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Cashback por Beneficiario */}
      <div className="grid gap-4 md:grid-cols-3">
        {cashbackByBeneficiary.map((item) => {
          const Icon = item.icone;
          return (
            <Card key={item.tipo} className="bg-gradient-to-br from-emerald-500/5 to-cyan-500/5">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 rounded-xl bg-emerald-500/10">
                    <Icon className="h-6 w-6 text-emerald-500" />
                  </div>
                  <div>
                    <p className="font-semibold">{item.tipo}</p>
                    <p className="text-sm text-muted-foreground">{formatNumber(item.usuarios)} usuarios</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total recebido</span>
                    <span className="font-semibold">{formatNumber(item.valor)} VBRz</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Valor em BRL</span>
                    <span className="text-emerald-600">{formatCurrency(item.valor * tokenData.precoBRL)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Media/usuario</span>
                    <span>{(item.valor / item.usuarios).toFixed(0)} VBRz</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Fundo de Cashback */}
      <Card className="bg-gradient-to-r from-indigo-500/10 to-violet-500/10 border-indigo-500/20">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-2xl bg-indigo-500/20">
                <Wallet className="h-8 w-8 text-indigo-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Fundo de Cashback Disponivel</p>
                <p className="text-2xl font-bold">{formatNumber(tokenData.fundoCashback)} VBRz</p>
                <p className="text-sm text-indigo-600">{formatCurrency(tokenData.fundoCashback * tokenData.precoBRL)}</p>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-sm">Saude do fundo: Excelente</span>
              </div>
              <Progress value={((tokenData.fundoCashback - tokenData.totalDistribuido) / tokenData.fundoCashback) * 100} className="h-2 w-48" />
              <p className="text-xs text-muted-foreground">
                {(((tokenData.fundoCashback - tokenData.totalDistribuido) / tokenData.fundoCashback) * 100).toFixed(1)}% disponivel para distribuicao
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // ============= LIQUIDEZ TAB =============
  const renderLiquidez = () => (
    <div className="space-y-6">
      {/* KPIs Liquidez */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Liquidez Total"
          value={formatCurrency(tokenData.liquidezTotalUSD, 'USD')}
          subtitle={tokenData.poolDEX}
          icon={Database}
          color="indigo"
        />
        <KPICard
          title="VBRz na Pool"
          value={`${formatNumber(tokenData.liquidezVBRz)} VBRz`}
          subtitle="50% do par"
          icon={Coins}
          color="violet"
        />
        <KPICard
          title="USDC na Pool"
          value={formatCurrency(tokenData.liquidezUSDC, 'USD')}
          subtitle="50% do par"
          icon={DollarSign}
          color="emerald"
        />
        <KPICard
          title="APY Provedor"
          value={`${tokenData.apy}%`}
          subtitle="Taxas + rewards"
          icon={Percent}
          color="amber"
        />
      </div>

      {/* Pool Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5 text-indigo-500" />
            Pool de Liquidez VBRz/USDC
          </CardTitle>
          <CardDescription>Uniswap V3 - Polygon</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="p-4 border rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <span className="font-medium">Composicao da Pool</span>
                <Badge variant="outline">50/50</Badge>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center">
                      <Coins className="h-4 w-4 text-indigo-500" />
                    </div>
                    <span>VBRz</span>
                  </div>
                  <span className="font-semibold">{formatNumber(tokenData.liquidezVBRz)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <DollarSign className="h-4 w-4 text-emerald-500" />
                    </div>
                    <span>USDC</span>
                  </div>
                  <span className="font-semibold">{formatCurrency(tokenData.liquidezUSDC, 'USD')}</span>
                </div>
              </div>
            </div>
            <div className="p-4 border rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <span className="font-medium">Estatisticas</span>
                <Badge className="bg-emerald-500">Ativo</Badge>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Volume 24h</span>
                  <span className="font-semibold">{formatCurrency(tokenData.volumeUSD24h, 'USD')}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Taxas 24h</span>
                  <span className="font-semibold">{formatCurrency(tokenData.volumeUSD24h * 0.003, 'USD')}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Provedores</span>
                  <span className="font-semibold">127</span>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Historico de Preco */}
          <div>
            <h4 className="font-medium mb-4">Historico de Preco (7 dias)</h4>
            <div className="grid grid-cols-7 gap-2">
              {priceHistory.map((day) => (
                <div key={day.dia} className="text-center">
                  <div
                    className="mx-auto w-8 bg-indigo-500/20 rounded-t-lg"
                    style={{ height: `${(day.preco / 0.1) * 60}px` }}
                  />
                  <p className="text-xs font-medium mt-1">{day.dia}</p>
                  <p className="text-xs text-muted-foreground">${day.preco.toFixed(3)}</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Acoes */}
      <div className="grid gap-4 md:grid-cols-3">
        <Button className="h-auto p-4 flex flex-col items-center gap-2" variant="outline">
          <Zap className="h-6 w-6" />
          <span>Adicionar Liquidez</span>
        </Button>
        <Button className="h-auto p-4 flex flex-col items-center gap-2" variant="outline">
          <RefreshCw className="h-6 w-6" />
          <span>Swap VBRz</span>
        </Button>
        <Button className="h-auto p-4 flex flex-col items-center gap-2" variant="outline">
          <ExternalLink className="h-6 w-6" />
          <span>Ver no Polygonscan</span>
        </Button>
      </div>
    </div>
  );

  // ============= MAIN RENDER =============
  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Visao Geral</span>
          </TabsTrigger>
          <TabsTrigger value="tokenomics" className="gap-2">
            <PieChart className="h-4 w-4" />
            <span className="hidden sm:inline">Tokenomics</span>
          </TabsTrigger>
          <TabsTrigger value="cashback" className="gap-2">
            <Gift className="h-4 w-4" />
            <span className="hidden sm:inline">Cashback</span>
          </TabsTrigger>
          <TabsTrigger value="liquidez" className="gap-2">
            <Database className="h-4 w-4" />
            <span className="hidden sm:inline">Liquidez</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          {renderOverview()}
        </TabsContent>
        <TabsContent value="tokenomics" className="mt-6">
          {renderTokenomics()}
        </TabsContent>
        <TabsContent value="cashback" className="mt-6">
          {renderCashback()}
        </TabsContent>
        <TabsContent value="liquidez" className="mt-6">
          {renderLiquidez()}
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default VBRzDashboard;
