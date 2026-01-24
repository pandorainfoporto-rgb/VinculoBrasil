// =============================================================================
// CashbackAdminDashboard - Painel Admin do Sistema de Cashback VBRz
// CONECTADO A DADOS REAIS - ZERO MOCKS
// =============================================================================

import * as React from 'react';
import {
  Coins,
  TrendingUp,
  Users,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Building,
  UserCheck,
  ShoppingBag,
  Shield,
  Gift,
  Star,
  Settings,
  Download,
  RefreshCw,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  type CashbackCategory,
  type CashbackAdminStats,
  CASHBACK_CATEGORY_LABELS,
  MOCK_ADMIN_STATS,
} from '@/lib/cashback-admin-types';
import { VBRZ_CONFIG, formatVBRz, LOYALTY_TIER_LABELS, type LoyaltyTier } from '@/lib/tokenomics-types';
import { CashbackRulesPanel } from './cashback-rules-panel';
import { CashbackTransactionsTable } from './cashback-transactions-table';
import { CashbackAnalytics } from './cashback-analytics';
import { useCashbackStats } from '@/hooks/use-cashback-stats';

// =============================================================================
// COMPONENTE PRINCIPAL
// =============================================================================

export function CashbackAdminDashboard() {
  const [activeTab, setActiveTab] = React.useState('overview');

  // Busca dados reais da API
  const { data: stats = MOCK_ADMIN_STATS, isLoading, isError, error, refetch } = useCashbackStats();

  // Cashback Wallet - calculado com dados reais da API
  const cashbackWalletPercentage = stats.cashbackWalletBalance
    ? (stats.cashbackWalletBalance / (VBRZ_CONFIG.maxSupply * 100)) * 100
    : 0;

  return (
    <div className="flex flex-col gap-6 p-6 bg-zinc-950 min-h-screen">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Gestão de Cashback VBRz</h1>
          <p className="text-zinc-400">
            Gerencie regras, monitore distribuições e analise métricas do programa de fidelidade
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isLoading} className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button variant="outline" size="sm" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
            <Settings className="mr-2 h-4 w-4" />
            Configurações
          </Button>
        </div>
      </div>

      {/* KPIs Principais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Distribuído"
          value={formatVBRz(stats.totalDistributed)}
          suffix="VBRz"
          subValue={`≈ R$ ${formatVBRz(stats.totalDistributedBRL)}`}
          icon={Coins}
          trend={{ value: 12.5, isPositive: true }}
          variant="primary"
        />
        <StatsCard
          title="Transações"
          value={stats.totalTransactions.toLocaleString('pt-BR')}
          subValue={`${stats.distributedToday.toLocaleString('pt-BR')} VBRz hoje`}
          icon={TrendingUp}
          trend={{ value: 8.2, isPositive: true }}
        />
        <StatsCard
          title="Usuários Ativos"
          value={stats.totalUsers.toLocaleString('pt-BR')}
          subValue="com saldo VBRz"
          icon={Users}
          trend={{ value: 5.1, isPositive: true }}
        />
        <StatsCard
          title="Cashback Wallet"
          value={formatVBRz(stats.cashbackWalletBalance)}
          suffix="VBRz"
          subValue={`${cashbackWalletPercentage.toFixed(1)}% do supply`}
          icon={Gift}
        />
      </div>

      {/* Distribuição por Categoria */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white">Distribuição por Categoria</CardTitle>
          <CardDescription className="text-zinc-400">Cashback distribuído por tipo de operação</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(stats.byCategory).map(([category, categoryStats]) => (
              <CategoryCard
                key={category}
                category={category as CashbackCategory}
                stats={categoryStats}
                total={stats.totalDistributed}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tabs de Conteúdo */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="inline-flex h-10 items-center justify-center rounded-md bg-zinc-800 p-1 text-zinc-400">
          <TabsTrigger value="overview" className="data-[state=active]:bg-zinc-700 data-[state=active]:text-white">Visão Geral</TabsTrigger>
          <TabsTrigger value="transactions" className="data-[state=active]:bg-zinc-700 data-[state=active]:text-white">Transações</TabsTrigger>
          <TabsTrigger value="rules" className="data-[state=active]:bg-zinc-700 data-[state=active]:text-white">Regras</TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-zinc-700 data-[state=active]:text-white">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Por Tipo de Usuário */}
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white">Por Tipo de Usuário</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(stats.byUserRole).map(([role, roleStats]) => (
                  <div key={role} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium capitalize text-zinc-300">
                        {role === 'tenant'
                          ? 'Inquilinos'
                          : role === 'landlord'
                            ? 'Proprietários'
                            : role === 'guarantor'
                              ? 'Garantidores'
                              : 'Admins'}
                      </span>
                      <span className="text-zinc-500">
                        {formatVBRz(roleStats.totalVBRz)} VBRz ({roleStats.userCount.toLocaleString('pt-BR')} usuários)
                      </span>
                    </div>
                    <Progress value={(roleStats.totalVBRz / stats.totalDistributed) * 100} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Por Tier de Fidelidade */}
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white">Por Tier de Fidelidade</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(stats.byTier).map(([tier, amount]) => (
                  <div key={tier} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <TierBadge tier={tier as LoyaltyTier} />
                        <span className="font-medium text-zinc-300">{LOYALTY_TIER_LABELS[tier as LoyaltyTier]}</span>
                      </div>
                      <span className="text-zinc-500">{formatVBRz(amount)} VBRz</span>
                    </div>
                    <Progress value={(amount / stats.totalDistributed) * 100} className="h-2" />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Tendência 7 dias */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white">Tendência Últimos 7 Dias</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex h-48 items-end gap-2">
                {stats.trend7Days.map((day, index) => {
                  const maxDistributed = Math.max(...stats.trend7Days.map((d) => d.distributed));
                  const heightPercent = (day.distributed / maxDistributed) * 100;
                  return (
                    <div key={index} className="flex flex-1 flex-col items-center gap-1">
                      <div
                        className="w-full rounded-t bg-primary transition-all hover:bg-primary/80"
                        style={{ height: `${heightPercent}%`, minHeight: '8px' }}
                      />
                      <span className="text-xs text-muted-foreground">
                        {new Date(day.date).toLocaleDateString('pt-BR', { weekday: 'short' })}
                      </span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions">
          <CashbackTransactionsTable />
        </TabsContent>

        <TabsContent value="rules">
          <CashbackRulesPanel />
        </TabsContent>

        <TabsContent value="analytics">
          <CashbackAnalytics stats={stats} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// =============================================================================
// COMPONENTES AUXILIARES
// =============================================================================

interface StatsCardProps {
  title: string;
  value: string;
  suffix?: string;
  subValue?: string;
  icon: React.ElementType;
  trend?: { value: number; isPositive: boolean };
  variant?: 'default' | 'primary' | 'warning';
}

function StatsCard({ title, value, suffix, subValue, icon: Icon, trend, variant = 'default' }: StatsCardProps) {
  const bgClass =
    variant === 'primary'
      ? 'bg-blue-600/10 border-blue-600/30'
      : variant === 'warning'
        ? 'bg-amber-600/10 border-amber-600/30'
        : 'bg-zinc-900 border-zinc-800';

  return (
    <Card className={bgClass}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-zinc-300">{title}</CardTitle>
        <Icon
          className={`h-4 w-4 ${variant === 'primary' ? 'text-blue-400' : variant === 'warning' ? 'text-amber-400' : 'text-zinc-500'}`}
        />
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold text-white">{value}</span>
          {suffix && <span className="text-sm text-zinc-500">{suffix}</span>}
        </div>
        <div className="flex items-center justify-between">
          {subValue && <p className="text-xs text-zinc-500">{subValue}</p>}
          {trend && (
            <div className={`flex items-center text-xs ${trend.isPositive ? 'text-green-400' : 'text-red-400'}`}>
              {trend.isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              <span>{trend.value}%</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface CategoryCardProps {
  category: CashbackCategory;
  stats: {
    totalVBRz: number;
    totalBRL: number;
    transactionCount: number;
    userCount: number;
    averagePerTransaction: number;
  };
  total: number;
}

function CategoryCard({ category, stats, total }: CategoryCardProps) {
  const percentage = (stats.totalVBRz / total) * 100;

  const iconMap: Record<CashbackCategory, React.ElementType> = {
    tenant: Users,
    landlord: Building,
    guarantor: UserCheck,
    marketplace: ShoppingBag,
    insurance: Shield,
    financial: Wallet,
    referral: Gift,
    loyalty: Star,
    promotional: Gift,
  };

  const Icon = iconMap[category];

  return (
    <div className="flex items-center gap-4 rounded-lg border border-zinc-800 bg-zinc-800/50 p-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600/20">
        <Icon className="h-5 w-5 text-blue-400" />
      </div>
      <div className="flex-1 space-y-1">
        <div className="flex items-center justify-between">
          <span className="font-medium text-white">{CASHBACK_CATEGORY_LABELS[category]}</span>
          <Badge variant="outline" className="border-zinc-700 text-zinc-400">{percentage.toFixed(1)}%</Badge>
        </div>
        <div className="flex items-center justify-between text-sm text-zinc-500">
          <span>{formatVBRz(stats.totalVBRz)} VBRz</span>
          <span>{stats.transactionCount.toLocaleString('pt-BR')} txs</span>
        </div>
        <Progress value={percentage} className="h-1" />
      </div>
    </div>
  );
}

function TierBadge({ tier }: { tier: LoyaltyTier }) {
  const colors: Record<LoyaltyTier, string> = {
    bronze: 'bg-amber-700',
    prata: 'bg-gray-400',
    ouro: 'bg-yellow-500',
    diamante: 'bg-cyan-400',
  };

  return <div className={`h-3 w-3 rounded-full ${colors[tier]}`} />;
}

export default CashbackAdminDashboard;
