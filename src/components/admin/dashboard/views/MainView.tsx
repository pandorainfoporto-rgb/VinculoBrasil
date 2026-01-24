// ============================================
// MAIN VIEW - Visao Principal do Dashboard
// Resumo geral, Cards de VBRz, Alertas Criticos
// ============================================

import {
  TrendingUp,
  Building2,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  DollarSign,
  AlertTriangle,
  RefreshCw,
  FileText,
  Home,
  Coins,
  Bell,
  Clock,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useDashboardMetrics, useCashflow } from '@/hooks/use-dashboard-metrics';
import { useP2PStats } from '@/hooks/use-p2p-marketplace';
import { cn } from '@/lib/utils';

// ============================================
// HELPERS
// ============================================

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const formatCompact = (value: number) => {
  if (value >= 1000000) {
    return `R$ ${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `R$ ${(value / 1000).toFixed(0)}k`;
  }
  return formatCurrency(value);
};

// ============================================
// COMPONENTE
// ============================================

export function MainView() {
  const { data: metrics, isLoading: isLoadingMetrics, refetch: refetchMetrics } = useDashboardMetrics();
  const { data: cashflowData, isLoading: isLoadingCashflow, refetch: refetchCashflow } = useCashflow(6);
  const { data: p2pStats, isLoading: isLoadingP2P, refetch: refetchP2P } = useP2PStats();

  const isLoading = isLoadingMetrics || isLoadingCashflow || isLoadingP2P;

  const chartData = (cashflowData || []).map((item) => ({
    name: item.label,
    receita: item.income,
    pendente: item.pending,
  }));

  const handleRefresh = () => {
    refetchMetrics();
    refetchCashflow();
    refetchP2P();
  };

  const occupancyRate = metrics?.totalProperties && metrics.totalProperties > 0
    ? Math.round((metrics.rentedProperties / metrics.totalProperties) * 100)
    : 0;

  return (
    <div className="space-y-6 p-6">
      {/* HEADER COM REFRESH */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-zinc-400">
            Dashboard em tempo real - dados do banco de dados
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isLoading}
          className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
        >
          <RefreshCw className={cn('h-4 w-4 mr-2', isLoading && 'animate-spin')} />
          Atualizar
        </Button>
      </div>

      {/* ALERTAS CRITICOS */}
      {metrics && (metrics.pendingPayments > 0 || metrics.overduePayments > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {metrics.pendingPayments > 0 && (
            <Card className="bg-amber-900/20 border-amber-700/50">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 rounded-full bg-amber-500/20">
                  <Clock className="h-5 w-5 text-amber-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-amber-200">Pagamentos Pendentes</p>
                  <p className="text-2xl font-bold text-amber-400">{metrics.pendingPayments}</p>
                </div>
                <Button variant="ghost" size="sm" className="text-amber-400 hover:text-amber-300">
                  Ver
                </Button>
              </CardContent>
            </Card>
          )}
          {metrics.overduePayments > 0 && (
            <Card className="bg-red-900/20 border-red-700/50">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 rounded-full bg-red-500/20">
                  <AlertTriangle className="h-5 w-5 text-red-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-200">Pagamentos Atrasados</p>
                  <p className="text-2xl font-bold text-red-400">{metrics.overduePayments}</p>
                </div>
                <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300">
                  Ver
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* KPI CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Imoveis"
          value={metrics?.totalProperties || 0}
          subValue={`${metrics?.availableProperties || 0} disponiveis`}
          icon={Building2}
          color="blue"
          isLoading={isLoading}
        />
        <KpiCard
          title="Ocupacao"
          value={`${occupancyRate}%`}
          subValue={`${metrics?.rentedProperties || 0} alugados`}
          icon={Home}
          color="green"
          isLoading={isLoading}
        />
        <KpiCard
          title="Contratos Ativos"
          value={metrics?.activeContracts || 0}
          subValue={`${metrics?.totalContracts || 0} total`}
          icon={FileText}
          color="violet"
          isLoading={isLoading}
        />
        <KpiCard
          title="Receita Mensal"
          value={formatCompact(metrics?.monthlyRevenue || 0)}
          trend={metrics?.revenueGrowth}
          icon={DollarSign}
          color="emerald"
          isLoading={isLoading}
          isCurrency
        />
      </div>

      {/* VBRZ STATS & GRAFICO */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* VBRz Token Card */}
        <Card className="bg-gradient-to-br from-amber-900/30 to-zinc-900 border-amber-700/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-white flex items-center gap-2 text-lg">
              <Coins className="h-5 w-5 text-amber-400" />
              VBRz Token
            </CardTitle>
            <CardDescription className="text-zinc-400">
              Token utility da plataforma
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <div className="space-y-3">
                <div className="h-8 bg-zinc-800 animate-pulse rounded" />
                <div className="h-8 bg-zinc-800 animate-pulse rounded" />
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-400">Total Listagens</span>
                  <span className="text-lg font-bold text-amber-400">
                    {(p2pStats?.totalListings || 0).toLocaleString('pt-BR')} VBRz
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-400">Volume Total</span>
                  <span className="text-lg font-bold text-white">
                    {formatCurrency(p2pStats?.totalVolume || 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-zinc-400">Ofertas Ativas</span>
                  <Badge className="bg-green-600">{p2pStats?.activeListings || 0}</Badge>
                </div>
                <a href="/admin/vbrz-token">
                  <Button className="w-full mt-2 bg-amber-600 hover:bg-amber-700">
                    Ver Dashboard VBRz
                  </Button>
                </a>
              </>
            )}
          </CardContent>
        </Card>

        {/* Grafico de Receita */}
        <Card className="lg:col-span-2 bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-white flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5 text-blue-400" />
              Fluxo de Receitas
            </CardTitle>
            <CardDescription className="text-zinc-400">
              Ultimos 6 meses
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-[200px] bg-zinc-800 animate-pulse rounded" />
            ) : (
              <div className="h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorPendente" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} />
                    <YAxis stroke="#9ca3af" fontSize={12} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#18181b', border: '1px solid #3f3f46' }}
                      labelStyle={{ color: '#fff' }}
                      formatter={(value: number) => formatCurrency(value)}
                    />
                    <Area
                      type="monotone"
                      dataKey="receita"
                      stroke="#3b82f6"
                      fillOpacity={1}
                      fill="url(#colorReceita)"
                      name="Receita"
                    />
                    <Area
                      type="monotone"
                      dataKey="pendente"
                      stroke="#f59e0b"
                      fillOpacity={1}
                      fill="url(#colorPendente)"
                      name="Pendente"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ATIVIDADE RECENTE */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-400" />
            Atividade Recente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isLoading ? (
              [1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-zinc-800 animate-pulse rounded-full" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-zinc-800 animate-pulse rounded w-3/4" />
                    <div className="h-3 bg-zinc-800 animate-pulse rounded w-1/2" />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-zinc-500">
                <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Atividades serao exibidas aqui em tempo real</p>
                <p className="text-xs mt-1">Conecte via WebSocket para atualizacoes instantaneas</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================
// COMPONENTES AUXILIARES
// ============================================

interface KpiCardProps {
  title: string;
  value: number | string;
  subValue?: string;
  trend?: number;
  icon: React.ElementType;
  color: 'blue' | 'green' | 'violet' | 'emerald' | 'amber' | 'red';
  isLoading?: boolean;
  isCurrency?: boolean;
}

function KpiCard({ title, value, subValue, trend, icon: Icon, color, isLoading }: KpiCardProps) {
  const colorStyles = {
    blue: { bg: 'bg-blue-600/20', text: 'text-blue-400', border: 'border-blue-700/30' },
    green: { bg: 'bg-green-600/20', text: 'text-green-400', border: 'border-green-700/30' },
    violet: { bg: 'bg-violet-600/20', text: 'text-violet-400', border: 'border-violet-700/30' },
    emerald: { bg: 'bg-emerald-600/20', text: 'text-emerald-400', border: 'border-emerald-700/30' },
    amber: { bg: 'bg-amber-600/20', text: 'text-amber-400', border: 'border-amber-700/30' },
    red: { bg: 'bg-red-600/20', text: 'text-red-400', border: 'border-red-700/30' },
  };

  const styles = colorStyles[color];

  return (
    <Card className={cn('bg-zinc-900 border-zinc-800', styles.border)}>
      <CardContent className="p-4">
        {isLoading ? (
          <div className="space-y-2">
            <div className="h-8 w-16 bg-zinc-800 animate-pulse rounded" />
            <div className="h-4 w-24 bg-zinc-800 animate-pulse rounded" />
          </div>
        ) : (
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-zinc-400 mb-1">{title}</p>
              <p className="text-2xl font-bold text-white">
                {typeof value === 'number' ? value.toLocaleString('pt-BR') : value}
              </p>
              {subValue && <p className="text-xs text-zinc-500 mt-1">{subValue}</p>}
              {trend !== undefined && trend !== 0 && (
                <div className={cn('flex items-center gap-1 text-xs mt-1', trend >= 0 ? 'text-green-400' : 'text-red-400')}>
                  {trend >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                  {Math.abs(trend)}%
                </div>
              )}
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

export default MainView;
