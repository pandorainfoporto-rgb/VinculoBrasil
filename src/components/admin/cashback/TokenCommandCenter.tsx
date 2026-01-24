/**
 * TokenCommandCenter - Dashboard completo do token VBRz
 *
 * Estilo "Bloomberg Terminal" para gestao do token.
 * Exibe metricas, graficos, transacoes e acoes administrativas.
 */

import { useState } from 'react';
import {
  Coins,
  TrendingUp,
  TrendingDown,
  Flame,
  Gift,
  Users,
  Activity,
  Lock,
  Unlock,
  Clock,
  RefreshCw,
  Pause,
  Play,
  Send,
  Settings,
  ExternalLink,
  Copy,
  Check,
  AlertTriangle,
  Wallet,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  Crown,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AreaChart,
  Area,
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useTokenMetrics, type TokenTransaction, type TopHolder } from '@/hooks/useTokenMetrics';
import { VBRZ_CONFIG, formatVBRz } from '@/lib/tokenomics-types';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// =============================================================================
// COMPONENTES AUXILIARES
// =============================================================================

function MetricCard({
  title,
  value,
  subValue,
  icon: Icon,
  trend,
  trendValue,
  color = 'gold',
}: {
  title: string;
  value: string;
  subValue?: string;
  icon: React.ElementType;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  color?: 'gold' | 'green' | 'red' | 'blue' | 'purple';
}) {
  const colorClasses = {
    gold: 'from-amber-500/20 to-yellow-500/10 border-amber-500/30',
    green: 'from-emerald-500/20 to-green-500/10 border-emerald-500/30',
    red: 'from-red-500/20 to-rose-500/10 border-red-500/30',
    blue: 'from-blue-500/20 to-cyan-500/10 border-blue-500/30',
    purple: 'from-purple-500/20 to-violet-500/10 border-purple-500/30',
  };

  const iconColors = {
    gold: 'text-amber-400',
    green: 'text-emerald-400',
    red: 'text-red-400',
    blue: 'text-blue-400',
    purple: 'text-purple-400',
  };

  return (
    <Card className={cn(
      'bg-gradient-to-br border',
      colorClasses[color],
      'bg-slate-900/80 backdrop-blur-sm'
    )}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">
              {title}
            </p>
            <p className={cn('text-2xl font-bold', color === 'gold' ? 'text-amber-400' : 'text-white')}>
              {value}
            </p>
            {subValue && (
              <p className="text-sm text-slate-500">{subValue}</p>
            )}
            {trend && trendValue && (
              <div className={cn(
                'flex items-center gap-1 text-xs font-medium',
                trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-red-400' : 'text-slate-400'
              )}>
                {trend === 'up' ? <ArrowUpRight className="h-3 w-3" /> :
                 trend === 'down' ? <ArrowDownRight className="h-3 w-3" /> : null}
                {trendValue}
              </div>
            )}
          </div>
          <div className={cn('p-2 rounded-lg bg-slate-800/50', iconColors[color])}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TransactionRow({ tx }: { tx: TokenTransaction }) {
  const [copied, setCopied] = useState(false);

  const typeConfig = {
    cashback: { icon: Gift, color: 'text-emerald-400', bg: 'bg-emerald-500/20' },
    burn: { icon: Flame, color: 'text-red-400', bg: 'bg-red-500/20' },
    transfer: { icon: Send, color: 'text-blue-400', bg: 'bg-blue-500/20' },
    mint: { icon: Coins, color: 'text-amber-400', bg: 'bg-amber-500/20' },
    airdrop: { icon: Gift, color: 'text-purple-400', bg: 'bg-purple-500/20' },
  };

  const config = typeConfig[tx.type];
  const Icon = config.icon;

  const handleCopy = () => {
    navigator.clipboard.writeText(tx.txHash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const timeDiff = Date.now() - tx.timestamp.getTime();
  const minutes = Math.floor(timeDiff / 60000);
  const hours = Math.floor(minutes / 60);
  const timeAgo = hours > 0 ? `${hours}h atrás` : `${minutes}min atrás`;

  return (
    <TableRow className="border-slate-700/50 hover:bg-slate-800/50">
      <TableCell>
        <div className="flex items-center gap-2">
          <div className={cn('p-1.5 rounded', config.bg)}>
            <Icon className={cn('h-3.5 w-3.5', config.color)} />
          </div>
          <span className="text-sm font-medium text-slate-300 capitalize">{tx.type}</span>
        </div>
      </TableCell>
      <TableCell>
        <span className="text-sm text-slate-400 font-mono">{tx.from}</span>
      </TableCell>
      <TableCell>
        <span className="text-sm text-slate-400 font-mono">{tx.to}</span>
      </TableCell>
      <TableCell className="text-right">
        <span className={cn(
          'font-medium',
          tx.type === 'burn' ? 'text-red-400' : tx.type === 'cashback' || tx.type === 'mint' ? 'text-emerald-400' : 'text-slate-300'
        )}>
          {tx.type === 'burn' ? '-' : '+'}{formatVBRz(tx.amount)}
        </span>
      </TableCell>
      <TableCell className="text-right text-slate-400 text-sm">
        R$ {tx.valueBRL.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
      </TableCell>
      <TableCell>
        <span className="text-xs text-slate-500">{timeAgo}</span>
      </TableCell>
      <TableCell>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-slate-500 hover:text-slate-300"
          onClick={handleCopy}
        >
          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
        </Button>
      </TableCell>
    </TableRow>
  );
}

function HolderRow({ holder }: { holder: TopHolder }) {
  const categoryConfig = {
    treasury: { label: 'Treasury', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
    team: { label: 'Team', color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
    investor: { label: 'Investor', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    exchange: { label: 'Exchange', color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30' },
    user: { label: 'User', color: 'bg-slate-500/20 text-slate-400 border-slate-500/30' },
    contract: { label: 'Contract', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
  };

  const config = categoryConfig[holder.category];

  const isWhale = holder.percentOfSupply > 1;

  return (
    <TableRow className="border-slate-700/50 hover:bg-slate-800/50">
      <TableCell>
        <span className="text-sm font-bold text-amber-400">#{holder.rank}</span>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <span className="text-sm font-mono text-slate-400">{holder.address}</span>
          {holder.label && (
            <Badge variant="outline" className={cn('text-xs', config.color)}>
              {holder.label}
            </Badge>
          )}
          {isWhale && <Crown className="h-3.5 w-3.5 text-amber-400" />}
        </div>
      </TableCell>
      <TableCell className="text-right">
        <span className="font-medium text-slate-300">
          {(holder.balance / 1_000_000).toFixed(2)}M
        </span>
      </TableCell>
      <TableCell className="text-right">
        <span className="text-slate-400">{holder.percentOfSupply.toFixed(2)}%</span>
      </TableCell>
      <TableCell className="text-right text-slate-400">
        R$ {(holder.valueBRL / 1_000_000).toFixed(2)}M
      </TableCell>
    </TableRow>
  );
}

// =============================================================================
// COMPONENTE PRINCIPAL
// =============================================================================

export function TokenCommandCenter() {
  const {
    metrics,
    transactions,
    topHolders,
    vestingChartData,
    distributionData,
    isLoading,
    refresh,
  } = useTokenMetrics();

  const [isPaused, setIsPaused] = useState(false);

  if (isLoading || !metrics) {
    return (
      <div className="flex items-center justify-center h-96 bg-slate-900 rounded-xl">
        <Loader2 className="h-8 w-8 animate-spin text-amber-400" />
      </div>
    );
  }

  const handleBurn = () => {
    toast.info('Funcionalidade de burn em desenvolvimento');
  };

  const handlePause = () => {
    setIsPaused(!isPaused);
    toast.success(isPaused ? 'Contrato despausado' : 'Contrato pausado');
  };

  const handleAirdrop = () => {
    toast.info('Funcionalidade de airdrop em desenvolvimento');
  };

  const handleConfig = () => {
    toast.info('Configuracoes do token em desenvolvimento');
  };

  // Formata contagem regressiva para proximo unlock
  const formatCountdown = () => {
    if (metrics.isInCliff) {
      const daysToCliff = Math.ceil(
        (metrics.vestingCliffEndDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );
      return `${daysToCliff} dias até fim do cliff`;
    }
    const daysToNextUnlock = Math.ceil(
      (metrics.nextUnlockDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    return `${daysToNextUnlock} dias`;
  };

  return (
    <div className="space-y-6 bg-slate-950 p-6 rounded-2xl min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-xl">
            <Coins className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              VBRz Command Center
              <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                LIVE
              </Badge>
            </h1>
            <p className="text-slate-400">
              Dashboard de controle do token {VBRZ_CONFIG.symbol}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-slate-400 border-slate-600">
            Polygon Mainnet
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refresh()}
            className="border-slate-600 text-slate-400 hover:text-white"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <MetricCard
          title="Preco VBRz"
          value={`R$ ${metrics.priceBRL.toFixed(2)}`}
          subValue="Fixed Peg"
          icon={Coins}
          color="gold"
        />
        <MetricCard
          title="Market Cap"
          value={`R$ ${(metrics.marketCapBRL / 1_000_000_000).toFixed(1)}B`}
          subValue={`${(metrics.circulatingSupply / 1_000_000).toFixed(0)}M em circulacao`}
          icon={BarChart3}
          color="blue"
        />
        <MetricCard
          title="Circulacao"
          value={`${(metrics.circulatingSupply / 1_000_000).toFixed(0)}M`}
          subValue={`${((metrics.circulatingSupply / metrics.totalSupply) * 100).toFixed(1)}% do total`}
          icon={Activity}
          color="purple"
        />
        <MetricCard
          title="Total Queimado"
          value={`${(metrics.totalBurned / 1_000_000).toFixed(2)}M`}
          subValue={`R$ ${(metrics.totalBurnedBRL / 1_000_000).toFixed(2)}M`}
          icon={Flame}
          trend="up"
          trendValue={`+${formatVBRz(metrics.burnedLast24h)} 24h`}
          color="red"
        />
        <MetricCard
          title="Cashback Dist."
          value={`${(metrics.totalCashbackDistributed / 1_000_000).toFixed(1)}M`}
          subValue={`R$ ${(metrics.cashbackDistributedBRL / 1_000_000).toFixed(2)}M`}
          icon={Gift}
          trend="up"
          trendValue={`+${formatVBRz(metrics.cashbackLast24h)} 24h`}
          color="green"
        />
        <MetricCard
          title="Holders"
          value={metrics.totalHolders.toLocaleString()}
          subValue={`${metrics.activeHolders24h} ativos 24h`}
          icon={Users}
          color="blue"
        />
      </div>

      {/* Graficos */}
      <div className="grid lg:grid-cols-5 gap-6">
        {/* Vesting Chart - 60% */}
        <Card className="lg:col-span-3 bg-slate-900/80 border-slate-700/50">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white flex items-center gap-2">
                  <Lock className="h-5 w-5 text-purple-400" />
                  Treasury Vesting Schedule
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Liberacao linear de 5% por mes apos cliff de 12 meses
                </CardDescription>
              </div>
              <div className="text-right">
                <Badge className={cn(
                  'mb-1',
                  metrics.isInCliff
                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                    : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                )}>
                  {metrics.isInCliff ? 'EM CLIFF' : 'LIBERANDO'}
                </Badge>
                <p className="text-xs text-slate-500">{formatCountdown()}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Progress Bar */}
            <div className="mb-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Progresso do Vesting</span>
                <span className="text-amber-400 font-bold">{metrics.vestingProgress.toFixed(1)}%</span>
              </div>
              <Progress value={metrics.vestingProgress} className="h-2 bg-slate-800" />
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="p-3 bg-slate-800/50 rounded-lg">
                <p className="text-xs text-slate-500 uppercase">Bloqueado</p>
                <p className="text-lg font-bold text-amber-400">
                  {(metrics.lockedInVesting / 1_000_000).toFixed(1)}M
                </p>
              </div>
              <div className="p-3 bg-slate-800/50 rounded-lg">
                <p className="text-xs text-slate-500 uppercase">Liberado</p>
                <p className="text-lg font-bold text-emerald-400">
                  {(metrics.vestedAmount / 1_000_000).toFixed(1)}M
                </p>
              </div>
              <div className="p-3 bg-slate-800/50 rounded-lg">
                <p className="text-xs text-slate-500 uppercase">Prox. Unlock</p>
                <p className="text-lg font-bold text-purple-400">
                  {(metrics.nextUnlockAmount / 1_000_000).toFixed(1)}M
                </p>
              </div>
            </div>

            {/* Area Chart */}
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={vestingChartData}>
                  <defs>
                    <linearGradient id="colorLocked" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorReleased" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis
                    dataKey="label"
                    stroke="#64748b"
                    fontSize={10}
                    tickLine={false}
                  />
                  <YAxis
                    stroke="#64748b"
                    fontSize={10}
                    tickLine={false}
                    tickFormatter={(value) => `${(value / 1_000_000).toFixed(0)}M`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #334155',
                      borderRadius: '8px',
                    }}
                    labelStyle={{ color: '#f8fafc' }}
                    formatter={(value: number) => [`${formatVBRz(value)} VBRz`, '']}
                  />
                  <Area
                    type="monotone"
                    dataKey="locked"
                    stroke="#f59e0b"
                    fillOpacity={1}
                    fill="url(#colorLocked)"
                    name="Bloqueado"
                  />
                  <Area
                    type="monotone"
                    dataKey="cumulative"
                    stroke="#22c55e"
                    fillOpacity={1}
                    fill="url(#colorReleased)"
                    name="Liberado"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Distribution Pie Chart - 40% */}
        <Card className="lg:col-span-2 bg-slate-900/80 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <PieChart className="h-5 w-5 text-blue-400" />
              Distribuicao do Supply
            </CardTitle>
            <CardDescription className="text-slate-400">
              Alocacao dos 1 bilhao de tokens
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={distributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {distributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e293b',
                      border: '1px solid #334155',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => [`${(value / 1_000_000).toFixed(0)}M VBRz`, '']}
                  />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value) => <span className="text-slate-400 text-xs">{value}</span>}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>

            {/* Distribution Legend */}
            <div className="mt-4 space-y-2">
              {distributionData.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-slate-400">{item.name}</span>
                  </div>
                  <span className="text-slate-300 font-medium">{item.percent}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Admin Actions */}
      <Card className="bg-slate-900/80 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Settings className="h-5 w-5 text-slate-400" />
            Acoes Administrativas
          </CardTitle>
          <CardDescription className="text-slate-400">
            Funcoes de governanca do token VBRz
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              variant="outline"
              className="h-auto py-4 flex-col gap-2 border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300"
              onClick={handleBurn}
            >
              <Flame className="h-5 w-5" />
              <span className="text-sm font-medium">Queimar Tokens</span>
              <span className="text-xs text-red-400/70">Burn manual</span>
            </Button>

            <Button
              variant="outline"
              className={cn(
                'h-auto py-4 flex-col gap-2',
                isPaused
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                  : 'border-amber-500/30 bg-amber-500/10 text-amber-400 hover:bg-amber-500/20'
              )}
              onClick={handlePause}
            >
              {isPaused ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
              <span className="text-sm font-medium">
                {isPaused ? 'Retomar Contrato' : 'Pausar Contrato'}
              </span>
              <span className="text-xs opacity-70">
                {isPaused ? 'Reativar operacoes' : 'Pausa de emergencia'}
              </span>
            </Button>

            <Button
              variant="outline"
              className="h-auto py-4 flex-col gap-2 border-purple-500/30 bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 hover:text-purple-300"
              onClick={handleAirdrop}
            >
              <Gift className="h-5 w-5" />
              <span className="text-sm font-medium">Airdrop</span>
              <span className="text-xs text-purple-400/70">Envio em massa</span>
            </Button>

            <Button
              variant="outline"
              className="h-auto py-4 flex-col gap-2 border-slate-500/30 bg-slate-500/10 text-slate-400 hover:bg-slate-500/20 hover:text-slate-300"
              onClick={handleConfig}
            >
              <Settings className="h-5 w-5" />
              <span className="text-sm font-medium">Configuracoes</span>
              <span className="text-xs text-slate-400/70">Parametros do token</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabs: Transactions & Holders */}
      <Card className="bg-slate-900/80 border-slate-700/50">
        <Tabs defaultValue="transactions">
          <CardHeader>
            <div className="flex items-center justify-between">
              <TabsList className="bg-slate-800/50">
                <TabsTrigger value="transactions" className="data-[state=active]:bg-slate-700">
                  <Activity className="h-4 w-4 mr-2" />
                  Transacoes Recentes
                </TabsTrigger>
                <TabsTrigger value="holders" className="data-[state=active]:bg-slate-700">
                  <Crown className="h-4 w-4 mr-2" />
                  Top Holders
                </TabsTrigger>
              </TabsList>
              <Button
                variant="ghost"
                size="sm"
                className="text-slate-400 hover:text-white"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Ver no Polygonscan
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            <TabsContent value="transactions" className="mt-0">
              <div className="rounded-lg border border-slate-700/50 overflow-hidden">
                <Table>
                  <TableHeader className="bg-slate-800/50">
                    <TableRow className="border-slate-700/50">
                      <TableHead className="text-slate-400">Tipo</TableHead>
                      <TableHead className="text-slate-400">De</TableHead>
                      <TableHead className="text-slate-400">Para</TableHead>
                      <TableHead className="text-right text-slate-400">Qtd VBRz</TableHead>
                      <TableHead className="text-right text-slate-400">Valor BRL</TableHead>
                      <TableHead className="text-slate-400">Tempo</TableHead>
                      <TableHead className="w-8"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactions.slice(0, 10).map((tx) => (
                      <TransactionRow key={tx.id} tx={tx} />
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="holders" className="mt-0">
              <div className="rounded-lg border border-slate-700/50 overflow-hidden">
                <Table>
                  <TableHeader className="bg-slate-800/50">
                    <TableRow className="border-slate-700/50">
                      <TableHead className="text-slate-400 w-16">Rank</TableHead>
                      <TableHead className="text-slate-400">Endereco</TableHead>
                      <TableHead className="text-right text-slate-400">Saldo</TableHead>
                      <TableHead className="text-right text-slate-400">% Supply</TableHead>
                      <TableHead className="text-right text-slate-400">Valor BRL</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {topHolders.map((holder) => (
                      <HolderRow key={holder.rank} holder={holder} />
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>

      {/* Footer */}
      <div className="text-center py-4 border-t border-slate-800">
        <p className="text-xs text-slate-600">
          VBRz Token - Polygon Mainnet - Contract: 0x742d...f44e
        </p>
        <p className="text-xs text-slate-700 mt-1">
          Um produto da FATTO Tecnologia LTDA
        </p>
      </div>
    </div>
  );
}

export default TokenCommandCenter;
