// ============================================
// OVERVIEW DASHBOARD - CEO Fintech Style
// CONECTADO AO BACKEND REAL - Sem dados mockados
// ============================================

import {
  TrendingUp,
  Users,
  Building2,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  DollarSign,
  Loader2,
  AlertTriangle,
  RefreshCw,
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
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useDashboardMetrics, useCashflow } from '@/hooks/use-dashboard-metrics';
import { useP2PStats } from '@/hooks/use-p2p-marketplace';
import { Link } from '@tanstack/react-router';

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
// COMPONENT
// ============================================

export function OverviewDashboard() {
  // DADOS REAIS VIA HOOKS
  const { data: metrics, isLoading: isLoadingMetrics, refetch: refetchMetrics } = useDashboardMetrics();
  const { data: cashflowData, isLoading: isLoadingCashflow, refetch: refetchCashflow } = useCashflow(6);
  const { data: p2pStats, isLoading: isLoadingP2P, refetch: refetchP2P } = useP2PStats();

  const isLoading = isLoadingMetrics || isLoadingCashflow || isLoadingP2P;

  // Formata dados do cashflow para o gráfico
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

  // Calcular taxa de ocupação
  const occupancyRate = metrics?.totalProperties && metrics.totalProperties > 0
    ? Math.round((metrics.rentedProperties / metrics.totalProperties) * 100)
    : 0;

  return (
    <div className="space-y-8 min-h-screen bg-zinc-950 p-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Visão Geral
          </h1>
          <p className="text-zinc-400 mt-1">
            Dashboard em tempo real - dados do banco de dados
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isLoading}
            className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <a href="/agency/contracts">
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg">
              + Novo Contrato
            </Button>
          </a>
        </div>
      </div>

      {/* GRID DE KPIs - DADOS REAIS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Receita Mensal */}
        <Card className="bg-zinc-900 border-zinc-800 relative overflow-hidden group hover:shadow-xl transition-shadow">
          <CardContent className="p-6">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
              <DollarSign className="w-16 h-16 text-green-500" />
            </div>
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div className="p-2 bg-green-500/10 rounded-lg text-green-500">
                <TrendingUp className="w-6 h-6" />
              </div>
              {metrics?.overduePayments && metrics.overduePayments > 0 ? (
                <span className="flex items-center text-xs font-bold text-red-500 bg-red-500/10 px-2 py-1 rounded-full">
                  <AlertTriangle className="w-3 h-3 mr-1" /> {metrics.overduePayments} vencidos
                </span>
              ) : (
                <span className="flex items-center text-xs font-bold text-green-500 bg-green-500/10 px-2 py-1 rounded-full">
                  <ArrowUpRight className="w-3 h-3 mr-1" /> Em dia
                </span>
              )}
            </div>
            <p className="text-sm font-medium text-zinc-400">Receita Total (Mês)</p>
            <h3 className="text-3xl font-bold text-white mt-1">
              {isLoadingMetrics ? (
                <Loader2 className="w-8 h-8 animate-spin text-zinc-600" />
              ) : (
                formatCurrency(metrics?.monthlyRevenue || 0)
              )}
            </h3>
          </CardContent>
        </Card>

        {/* Card 2: Contratos Ativos */}
        <Card className="bg-zinc-900 border-zinc-800 hover:shadow-xl transition-shadow">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                <Building2 className="w-6 h-6" />
              </div>
            </div>
            <p className="text-sm font-medium text-zinc-400">Contratos Ativos</p>
            <h3 className="text-3xl font-bold text-white mt-1">
              {isLoadingMetrics ? (
                <Loader2 className="w-8 h-8 animate-spin text-zinc-600" />
              ) : (
                metrics?.activeContracts || 0
              )}
            </h3>
            <p className="text-xs text-zinc-500 mt-2">
              Occupancy rate:{' '}
              <span className="text-blue-400 font-bold">{occupancyRate}%</span>
            </p>
          </CardContent>
        </Card>

        {/* Card 3: Investimentos (DeFi) */}
        <Card className="bg-zinc-900 border-zinc-800 hover:shadow-xl transition-shadow">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500">
                <Wallet className="w-6 h-6" />
              </div>
              <span className="flex items-center text-xs font-bold text-purple-400 bg-purple-500/10 px-2 py-1 rounded-full">
                DeFi
              </span>
            </div>
            <p className="text-sm font-medium text-zinc-400">Volume Tokenizado</p>
            <h3 className="text-3xl font-bold text-white mt-1">
              {isLoadingP2P ? (
                <Loader2 className="w-8 h-8 animate-spin text-zinc-600" />
              ) : (
                formatCompact(p2pStats?.totalVolume || 0)
              )}
            </h3>
            <p className="text-xs text-zinc-500 mt-2">
              Ofertas ativas:{' '}
              <span className="text-purple-400 font-bold">{p2pStats?.activeListings || 0}</span>
            </p>
          </CardContent>
        </Card>

        {/* Card 4: Propriedades */}
        <Card className="bg-zinc-900 border-zinc-800 hover:shadow-xl transition-shadow">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-orange-500/10 rounded-lg text-orange-500">
                <Users className="w-6 h-6" />
              </div>
            </div>
            <p className="text-sm font-medium text-zinc-400">Total Imóveis</p>
            <h3 className="text-3xl font-bold text-white mt-1">
              {isLoadingMetrics ? (
                <Loader2 className="w-8 h-8 animate-spin text-zinc-600" />
              ) : (
                metrics?.totalProperties || 0
              )}
            </h3>
            <p className="text-xs text-zinc-500 mt-2">
              Disponíveis:{' '}
              <span className="text-green-400 font-bold">{metrics?.availableProperties || 0}</span>
            </p>
          </CardContent>
        </Card>
      </div>

      {/* SEÇÃO PRINCIPAL: GRÁFICO + ATIVIDADE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* GRÁFICO DE EVOLUÇÃO (2 colunas) */}
        <Card className="lg:col-span-2 bg-zinc-900 border-zinc-800">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-white">Fluxo de Caixa</h3>
              <span className="text-sm text-zinc-500">Últimos 6 meses</span>
            </div>

            <div className="h-[300px] w-full">
              {isLoadingCashflow ? (
                <div className="h-full flex items-center justify-center">
                  <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                  <span className="ml-3 text-zinc-400">Carregando dados...</span>
                </div>
              ) : chartData.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-zinc-500">
                  <Activity className="w-12 h-12 mb-4 text-zinc-600" />
                  <p className="text-center">Sem dados financeiros suficientes ainda.</p>
                  <p className="text-sm text-zinc-600 mt-2">
                    Os gráficos aparecerão quando houver pagamentos registrados.
                  </p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorReceita" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="#374151"
                      opacity={0.2}
                    />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#9CA3AF' }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#9CA3AF' }}
                      tickFormatter={(v) => `R$${v / 1000}k`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1F2937',
                        borderColor: '#374151',
                        color: '#fff',
                        borderRadius: '8px',
                      }}
                      itemStyle={{ color: '#fff' }}
                      formatter={(value: number) => [formatCurrency(value), 'Valor']}
                    />
                    <Area
                      type="monotone"
                      dataKey="receita"
                      name="Recebido"
                      stroke="#10B981"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorReceita)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* LISTA DE STATUS RÁPIDO (1 coluna) */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-400" />
                Status do Sistema
              </h3>
            </div>

            <div className="space-y-4">
              {/* Pagamentos Pendentes */}
              <div className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-500/10 rounded-full">
                    <ArrowDownRight className="w-4 h-4 text-yellow-400" />
                  </div>
                  <span className="text-sm text-zinc-300">Pagamentos Pendentes</span>
                </div>
                <span className="text-lg font-bold text-yellow-400">
                  {isLoadingMetrics ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    metrics?.pendingPayments || 0
                  )}
                </span>
              </div>

              {/* Pagamentos Vencidos */}
              <div className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-500/10 rounded-full">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                  </div>
                  <span className="text-sm text-zinc-300">Pagamentos Vencidos</span>
                </div>
                <span className="text-lg font-bold text-red-400">
                  {isLoadingMetrics ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    metrics?.overduePayments || 0
                  )}
                </span>
              </div>

              {/* Tickets Abertos */}
              <div className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500/10 rounded-full">
                    <Activity className="w-4 h-4 text-blue-400" />
                  </div>
                  <span className="text-sm text-zinc-300">Tickets Abertos</span>
                </div>
                <span className="text-lg font-bold text-blue-400">
                  {isLoadingMetrics ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    metrics?.openTickets || 0
                  )}
                </span>
              </div>

              {/* Leads Novos */}
              <div className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500/10 rounded-full">
                    <Users className="w-4 h-4 text-green-400" />
                  </div>
                  <span className="text-sm text-zinc-300">Leads Novos</span>
                </div>
                <span className="text-lg font-bold text-green-400">
                  {isLoadingMetrics ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    metrics?.newLeads || 0
                  )}
                </span>
              </div>

              {/* Deals em Aberto */}
              <div className="flex items-center justify-between p-3 bg-zinc-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-500/10 rounded-full">
                    <DollarSign className="w-4 h-4 text-purple-400" />
                  </div>
                  <span className="text-sm text-zinc-300">Deals em Negociação</span>
                </div>
                <span className="text-lg font-bold text-purple-400">
                  {isLoadingMetrics ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    metrics?.openDeals || 0
                  )}
                </span>
              </div>
            </div>

            <Link to="/admin/financeiro">
              <Button
                variant="outline"
                className="w-full mt-6 border-zinc-700 text-zinc-300 hover:bg-zinc-800"
              >
                Ver Extrato Completo
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
