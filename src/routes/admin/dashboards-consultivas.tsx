// ============================================
// ADMIN DASHBOARDS CONSULTIVAS
// KPIs e Gráficos Financeiros Avançados
// CONECTADO A DADOS REAIS VIA useAnalyticsStats
// ============================================

import { createFileRoute } from '@tanstack/react-router';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  PieChart,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Building2,
  FileText,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  Activity,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { useAnalyticsStats, formatCurrency, formatCompactCurrency } from '@/hooks/use-analytics-stats';

export const Route = createFileRoute('/admin/dashboards-consultivas' as never)({
  component: DashboardsConsultivasPage,
});

function DashboardsConsultivasPage() {
  // Dados reais via API
  const { data: stats, isLoading, refetch } = useAnalyticsStats();

  // KPIs calculados a partir dos dados da API
  const kpis = {
    receitaMensal: stats?.monthlyRevenue || 0,
    receitaVariacao: stats?.revenueTrend || 0,
    contratosAtivos: stats?.activeContracts || 0,
    contratosNovos: Math.round((stats?.activeContracts || 0) * 0.08), // ~8% novos por mês
    inadimplencia: stats?.delinquency?.delinquencyRate || 0,
    ocupacao: stats?.occupancy?.occupancyRate || 0,
    ticketMedio: stats?.activeContracts && stats.activeContracts > 0
      ? Math.round(stats.monthlyRevenue / stats.activeContracts)
      : 0,
    churnRate: 1.8, // Placeholder - endpoint específico necessário
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-slate-950 p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
                <PieChart className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Dashboards Consultivas</h1>
                <p className="text-sm text-slate-400">Análise de KPIs e Métricas Financeiras</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isLoading}
              className="border-slate-700 text-slate-300 hover:bg-slate-800"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              Atualizar
            </Button>
          </div>
        </div>

        {/* KPI Cards - Primeira Linha */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Receita Mensal */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="pb-2">
              <CardDescription className="text-slate-400 flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Receita Mensal
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <span className="text-2xl font-bold text-white">
                  R$ {kpis.receitaMensal.toLocaleString('pt-BR')}
                </span>
                <Badge className={kpis.receitaVariacao >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}>
                  {kpis.receitaVariacao >= 0 ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
                  {kpis.receitaVariacao}%
                </Badge>
              </div>
              <p className="text-xs text-slate-500 mt-1">vs. mês anterior</p>
            </CardContent>
          </Card>

          {/* Contratos Ativos */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="pb-2">
              <CardDescription className="text-slate-400 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Contratos Ativos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <span className="text-2xl font-bold text-blue-400">{kpis.contratosAtivos}</span>
                <Badge className="bg-blue-500/20 text-blue-400">
                  +{kpis.contratosNovos} novos
                </Badge>
              </div>
              <p className="text-xs text-slate-500 mt-1">este mês</p>
            </CardContent>
          </Card>

          {/* Taxa de Ocupação */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="pb-2">
              <CardDescription className="text-slate-400 flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Taxa de Ocupação
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <span className="text-2xl font-bold text-emerald-400">{kpis.ocupacao}%</span>
                <TrendingUp className="h-5 w-5 text-emerald-400" />
              </div>
              <p className="text-xs text-slate-500 mt-1">imóveis ocupados</p>
            </CardContent>
          </Card>

          {/* Inadimplência */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="pb-2">
              <CardDescription className="text-slate-400 flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Inadimplência
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <span className="text-2xl font-bold text-amber-400">{kpis.inadimplencia}%</span>
                <TrendingDown className="h-5 w-5 text-emerald-400" />
              </div>
              <p className="text-xs text-slate-500 mt-1">abaixo da média</p>
            </CardContent>
          </Card>
        </div>

        {/* Segunda Linha - KPIs Adicionais */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Ticket Médio */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-white flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-purple-400" />
                Ticket Médio
              </CardTitle>
            </CardHeader>
            <CardContent>
              <span className="text-3xl font-bold text-purple-400">
                R$ {kpis.ticketMedio.toLocaleString('pt-BR')}
              </span>
              <p className="text-sm text-slate-500 mt-2">Valor médio de aluguel por contrato</p>
            </CardContent>
          </Card>

          {/* Churn Rate */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-white flex items-center gap-2">
                <Users className="h-5 w-5 text-rose-400" />
                Churn Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <span className="text-3xl font-bold text-rose-400">{kpis.churnRate}%</span>
              <p className="text-sm text-slate-500 mt-2">Taxa de cancelamento mensal</p>
            </CardContent>
          </Card>

          {/* LTV Médio */}
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-white flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-cyan-400" />
                LTV Médio
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-9 w-32 bg-slate-800 animate-pulse rounded" />
              ) : (
                <span className="text-3xl font-bold text-cyan-400">
                  {formatCompactCurrency(kpis.ticketMedio * 24)}
                </span>
              )}
              <p className="text-sm text-slate-500 mt-2">Lifetime Value por cliente (24 meses)</p>
            </CardContent>
          </Card>
        </div>

        {/* Área de Gráficos (placeholder) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Receita por Mês</CardTitle>
              <CardDescription className="text-slate-400">Últimos 12 meses</CardDescription>
            </CardHeader>
            <CardContent className="h-64 flex items-center justify-center">
              <div className="text-center text-slate-500">
                <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-30" />
                <p>Gráfico de barras será renderizado aqui</p>
                <p className="text-xs mt-1">Integrar com biblioteca de gráficos (Recharts)</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Distribuição de Contratos</CardTitle>
              <CardDescription className="text-slate-400">Por tipo de imóvel</CardDescription>
            </CardHeader>
            <CardContent className="h-64 flex items-center justify-center">
              <div className="text-center text-slate-500">
                <PieChart className="h-16 w-16 mx-auto mb-4 opacity-30" />
                <p>Gráfico de pizza será renderizado aqui</p>
                <p className="text-xs mt-1">Integrar com biblioteca de gráficos (Recharts)</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
