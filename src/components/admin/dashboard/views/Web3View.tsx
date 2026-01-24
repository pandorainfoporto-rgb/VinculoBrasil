// ============================================
// WEB3 VIEW - Dashboard Web3 & Token
// Treasury, Vesting, Dados da Blockchain
// ============================================

import { useState } from 'react';
import {
  Coins,
  Wallet,
  Lock,
  Unlock,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  ExternalLink,
  Copy,
  Check,
  Database,
  Flame,
  Shield,
  Gift,
  Users,
  Activity,
  Layers,
  Zap,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { useP2PStats } from '@/hooks/use-p2p-marketplace';

// ============================================
// DADOS DO TOKEN (Placeholder - virao do backend)
// ============================================

const TOKEN_DATA = {
  nome: 'VBRz Token',
  simbolo: 'VBRz',
  rede: 'Polygon PoS',
  contrato: '0x0000...0000',
  decimals: 18,
  standard: 'ERC-20',
  totalSupply: 100_000_000,
  circulatingSupply: 0,
  maxSupply: 100_000_000,
  precoUSD: 0.01,
  precoBRL: 0.05,
  variacao24h: 0,
  variacao7d: 0,
};

const TREASURY_DATA = {
  balance: 50_000_000,
  valueUSD: 500_000,
  reservaOperacional: 20_000_000,
  reservaMarketing: 10_000_000,
  reservaDesenvolvimento: 10_000_000,
  fundoCashback: 10_000_000,
};

const VESTING_DATA = {
  schedules: [
    { name: 'Team', total: 15_000_000, released: 3_000_000, cliff: '12 meses', duration: '48 meses' },
    { name: 'Advisors', total: 5_000_000, released: 1_000_000, cliff: '6 meses', duration: '24 meses' },
    { name: 'Investors', total: 20_000_000, released: 5_000_000, cliff: '6 meses', duration: '36 meses' },
    { name: 'Ecosystem', total: 30_000_000, released: 10_000_000, cliff: '0 meses', duration: '60 meses' },
  ],
};

// ============================================
// HELPERS
// ============================================

const formatNumber = (value: number) => {
  return new Intl.NumberFormat('pt-BR').format(value);
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const formatCompact = (value: number) => {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(0)}K`;
  }
  return formatNumber(value);
};

// ============================================
// COMPONENTE
// ============================================

export function Web3View() {
  const { data: p2pStats, isLoading, refetch } = useP2PStats();
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const handleCopy = () => {
    navigator.clipboard.writeText(TOKEN_DATA.contrato);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-zinc-400">
            Dados da blockchain, treasury e tokenomics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-violet-600">
            <Layers className="h-3 w-3 mr-1" />
            {TOKEN_DATA.rede}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading}
            className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
          >
            <RefreshCw className={cn('h-4 w-4 mr-2', isLoading && 'animate-spin')} />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Token Info Card */}
      <Card className="bg-gradient-to-br from-amber-900/30 via-zinc-900 to-violet-900/20 border-amber-700/30">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600">
                <Coins className="h-8 w-8 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">{TOKEN_DATA.nome}</h2>
                <p className="text-zinc-400">{TOKEN_DATA.simbolo} - {TOKEN_DATA.standard}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <code className="px-3 py-2 bg-zinc-800 rounded-lg text-zinc-300 text-sm font-mono">
                {TOKEN_DATA.contrato}
              </code>
              <Button variant="ghost" size="icon" onClick={handleCopy} className="text-zinc-400 hover:text-white">
                {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
              </Button>
              <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white">
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <TokenKpiCard
          title="Total Supply"
          value={formatCompact(TOKEN_DATA.totalSupply)}
          subValue="VBRz"
          icon={Database}
          color="amber"
          isLoading={isLoading}
        />
        <TokenKpiCard
          title="Circulante"
          value={formatCompact(p2pStats?.totalListings || TOKEN_DATA.circulatingSupply)}
          subValue="VBRz"
          icon={Activity}
          color="blue"
          isLoading={isLoading}
        />
        <TokenKpiCard
          title="Treasury"
          value={formatCompact(TREASURY_DATA.balance)}
          subValue="VBRz"
          icon={Shield}
          color="violet"
          isLoading={isLoading}
        />
        <TokenKpiCard
          title="Volume P2P"
          value={formatCurrency(p2pStats?.totalVolume || 0)}
          subValue="total"
          icon={TrendingUp}
          color="green"
          isLoading={isLoading}
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-zinc-800 border-zinc-700">
          <TabsTrigger value="overview" className="data-[state=active]:bg-zinc-700">
            Visao Geral
          </TabsTrigger>
          <TabsTrigger value="treasury" className="data-[state=active]:bg-zinc-700">
            Treasury
          </TabsTrigger>
          <TabsTrigger value="vesting" className="data-[state=active]:bg-zinc-700">
            Vesting
          </TabsTrigger>
          <TabsTrigger value="p2p" className="data-[state=active]:bg-zinc-700">
            Marketplace P2P
          </TabsTrigger>
        </TabsList>

        {/* Tab: Visao Geral */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Tokenomics Distribution */}
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Layers className="h-5 w-5 text-violet-400" />
                  Distribuicao de Tokens
                </CardTitle>
                <CardDescription>Alocacao do supply total</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <AllocationBar label="Treasury & Reserva" value={50} color="violet" />
                <AllocationBar label="Ecosystem Fund" value={30} color="blue" />
                <AllocationBar label="Team & Advisors" value={15} color="amber" />
                <AllocationBar label="Liquidity" value={5} color="green" />
              </CardContent>
            </Card>

            {/* Token Stats */}
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-400" />
                  Estatisticas do Token
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <StatRow label="Preco Atual (USD)" value={`$${TOKEN_DATA.precoUSD.toFixed(4)}`} />
                <StatRow label="Preco Atual (BRL)" value={`R$ ${TOKEN_DATA.precoBRL.toFixed(4)}`} />
                <StatRow label="Variacao 24h" value={`${TOKEN_DATA.variacao24h}%`} isChange />
                <StatRow label="Variacao 7d" value={`${TOKEN_DATA.variacao7d}%`} isChange />
                <StatRow label="Holders" value="0" />
                <StatRow label="Transacoes" value="0" />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab: Treasury */}
        <TabsContent value="treasury" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <TreasuryCard title="Reserva Operacional" value={TREASURY_DATA.reservaOperacional} icon={Wallet} color="blue" />
            <TreasuryCard title="Marketing" value={TREASURY_DATA.reservaMarketing} icon={Zap} color="violet" />
            <TreasuryCard title="Desenvolvimento" value={TREASURY_DATA.reservaDesenvolvimento} icon={Database} color="amber" />
            <TreasuryCard title="Fundo Cashback" value={TREASURY_DATA.fundoCashback} icon={Gift} color="green" />
          </div>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Shield className="h-5 w-5 text-violet-400" />
                Treasury Total
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-6 bg-gradient-to-r from-violet-900/30 to-zinc-900 rounded-xl border border-violet-700/30">
                <div>
                  <p className="text-sm text-zinc-400">Balance Total</p>
                  <p className="text-3xl font-bold text-white">{formatCompact(TREASURY_DATA.balance)} VBRz</p>
                  <p className="text-sm text-zinc-500 mt-1">≈ {formatCurrency(TREASURY_DATA.valueUSD * 5)}</p>
                </div>
                <Shield className="h-16 w-16 text-violet-500 opacity-30" />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Vesting */}
        <TabsContent value="vesting" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {VESTING_DATA.schedules.map((schedule) => (
              <VestingCard key={schedule.name} schedule={schedule} />
            ))}
          </div>
        </TabsContent>

        {/* Tab: P2P */}
        <TabsContent value="p2p" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <TokenKpiCard
              title="Ofertas Ativas"
              value={p2pStats?.activeListings || 0}
              subValue="listagens"
              icon={Activity}
              color="blue"
              isLoading={isLoading}
            />
            <TokenKpiCard
              title="Total Vendas"
              value={p2pStats?.totalSales || 0}
              subValue="transacoes"
              icon={TrendingUp}
              color="green"
              isLoading={isLoading}
            />
            <TokenKpiCard
              title="Volume Total"
              value={formatCurrency(p2pStats?.totalVolume || 0)}
              subValue=""
              icon={Wallet}
              color="violet"
              isLoading={isLoading}
            />
            <TokenKpiCard
              title="Desconto Medio"
              value={`${(p2pStats?.averageDiscount || 0).toFixed(1)}%`}
              subValue="sobre face value"
              icon={Flame}
              color="amber"
              isLoading={isLoading}
            />
          </div>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white">Marketplace P2P</CardTitle>
              <CardDescription>Cessao de credito imobiliario tokenizado</CardDescription>
            </CardHeader>
            <CardContent className="text-center py-8 text-zinc-500">
              <Coins className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Acesse o marketplace completo em</p>
              <a href="/admin/investments" className="text-blue-400 hover:text-blue-300 mt-2 inline-block">
                Investimentos &rarr;
              </a>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ============================================
// COMPONENTES AUXILIARES
// ============================================

interface TokenKpiCardProps {
  title: string;
  value: number | string;
  subValue: string;
  icon: React.ElementType;
  color: 'amber' | 'blue' | 'violet' | 'green';
  isLoading?: boolean;
}

function TokenKpiCard({ title, value, subValue, icon: Icon, color, isLoading }: TokenKpiCardProps) {
  const colorStyles = {
    amber: { bg: 'bg-amber-600/20', text: 'text-amber-400', border: 'border-amber-700/30' },
    blue: { bg: 'bg-blue-600/20', text: 'text-blue-400', border: 'border-blue-700/30' },
    violet: { bg: 'bg-violet-600/20', text: 'text-violet-400', border: 'border-violet-700/30' },
    green: { bg: 'bg-green-600/20', text: 'text-green-400', border: 'border-green-700/30' },
  };

  const styles = colorStyles[color];

  return (
    <Card className={cn('bg-zinc-900 border-zinc-800', styles.border)}>
      <CardContent className="p-4">
        {isLoading ? (
          <div className="space-y-2">
            <div className="h-8 w-20 bg-zinc-800 animate-pulse rounded" />
            <div className="h-4 w-16 bg-zinc-800 animate-pulse rounded" />
          </div>
        ) : (
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-zinc-400 mb-1">{title}</p>
              <p className="text-2xl font-bold text-white">
                {typeof value === 'number' ? value.toLocaleString('pt-BR') : value}
              </p>
              {subValue && <p className="text-xs text-zinc-500 mt-1">{subValue}</p>}
            </div>
            <div className={cn('p-2 rounded-lg', styles.bg)}>
              <Icon className={cn('h-5 w-5', styles.text)} />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface AllocationBarProps {
  label: string;
  value: number;
  color: string;
}

function AllocationBar({ label, value, color }: AllocationBarProps) {
  const colorMap: Record<string, string> = {
    violet: 'bg-violet-500',
    blue: 'bg-blue-500',
    amber: 'bg-amber-500',
    green: 'bg-green-500',
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="text-zinc-300">{label}</span>
        <span className="text-white font-medium">{value}%</span>
      </div>
      <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
        <div className={cn('h-full transition-all', colorMap[color])} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

interface StatRowProps {
  label: string;
  value: string;
  isChange?: boolean;
}

function StatRow({ label, value, isChange }: StatRowProps) {
  const numValue = parseFloat(value);
  const isPositive = numValue >= 0;

  return (
    <div className="flex items-center justify-between py-2 border-b border-zinc-800 last:border-0">
      <span className="text-sm text-zinc-400">{label}</span>
      <span className={cn('text-sm font-medium', isChange ? (isPositive ? 'text-green-400' : 'text-red-400') : 'text-white')}>
        {isChange && isPositive && '+'}
        {value}
      </span>
    </div>
  );
}

interface TreasuryCardProps {
  title: string;
  value: number;
  icon: React.ElementType;
  color: 'blue' | 'violet' | 'amber' | 'green';
}

function TreasuryCard({ title, value, icon: Icon, color }: TreasuryCardProps) {
  const colorStyles = {
    blue: { bg: 'bg-blue-900/20', border: 'border-blue-700/30', text: 'text-blue-400' },
    violet: { bg: 'bg-violet-900/20', border: 'border-violet-700/30', text: 'text-violet-400' },
    amber: { bg: 'bg-amber-900/20', border: 'border-amber-700/30', text: 'text-amber-400' },
    green: { bg: 'bg-green-900/20', border: 'border-green-700/30', text: 'text-green-400' },
  };

  const styles = colorStyles[color];

  return (
    <Card className={cn('border', styles.bg, styles.border)}>
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <Icon className={cn('h-6 w-6', styles.text)} />
          <div>
            <p className="text-xs text-zinc-400">{title}</p>
            <p className={cn('text-xl font-bold', styles.text)}>{formatCompact(value)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface VestingSchedule {
  name: string;
  total: number;
  released: number;
  cliff: string;
  duration: string;
}

function VestingCard({ schedule }: { schedule: VestingSchedule }) {
  const progress = (schedule.released / schedule.total) * 100;

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader className="pb-2">
        <CardTitle className="text-white flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-amber-400" />
            {schedule.name}
          </span>
          <Badge className="bg-zinc-700">{schedule.duration}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-zinc-400">Liberado</span>
          <span className="text-white font-medium">
            {formatCompact(schedule.released)} / {formatCompact(schedule.total)}
          </span>
        </div>
        <Progress value={progress} className="h-2" />
        <div className="flex items-center justify-between text-xs text-zinc-500">
          <span>Cliff: {schedule.cliff}</span>
          <span>{progress.toFixed(1)}%</span>
        </div>
      </CardContent>
    </Card>
  );
}

export default Web3View;
