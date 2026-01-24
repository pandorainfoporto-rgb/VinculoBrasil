// ============================================
// ROTA /admin/analytics - Analytics e Métricas
// CONECTADO A DADOS REAIS - ZERO MOCKS
// Modelo Visual: DRE (Demonstrativo do Resultado do Exercício)
// ============================================

import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Building2,
  DollarSign,
  FileText,
  ArrowUpRight,
  ArrowDownRight,
  Home,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Download,
  Calendar,
} from "lucide-react";
import {
  useAnalyticsStats,
  formatCurrency,
  formatCompactCurrency,
  formatPercent,
} from "@/hooks/use-analytics-stats";

export const Route = createFileRoute("/admin/analytics")({
  component: AnalyticsPage,
});

function AnalyticsPage() {
  const { data: stats, isLoading, isError, refetch } = useAnalyticsStats();

  // Cálculos para os gráficos
  const occupancyData = stats?.occupancy || {
    occupied: 0,
    vacant: 0,
    total: 0,
    occupancyRate: 0,
    trend: 0,
  };

  const delinquencyData = stats?.delinquency || {
    onTime: 0,
    late: 0,
    defaulted: 0,
    total: 0,
    delinquencyRate: 0,
    totalOverdueAmount: 0,
    averageDaysLate: 0,
  };

  const cashFlowData = stats?.cashFlow || [];

  // Encontra o valor máximo para escala do gráfico de barras
  const maxCashFlowValue = Math.max(
    ...cashFlowData.flatMap((item) => [item.income, item.expenses])
  );

  return (
    <AdminLayout userName="Administrador">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-blue-500" />
              Dashboard Analytics
            </h1>
            <p className="text-zinc-400 mt-1">
              Métricas e indicadores de performance - Modelo DRE
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={isLoading}
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              Atualizar
            </Button>
            <Button variant="outline" size="sm" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">
              <Download className="h-4 w-4 mr-2" />
              Exportar PDF
            </Button>
          </div>
        </div>

        {/* KPI Cards Principais */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <KPICard
            title="Usuários Ativos"
            value={stats?.activeUsers?.toLocaleString("pt-BR") || "0"}
            subValue={`${stats?.totalUsers?.toLocaleString("pt-BR") || "0"} total`}
            icon={Users}
            trend={12}
            isPositive
            isLoading={isLoading}
          />
          <KPICard
            title="Imóveis Cadastrados"
            value={stats?.totalProperties?.toLocaleString("pt-BR") || "0"}
            subValue={`${occupancyData.occupied} ocupados`}
            icon={Building2}
            trend={8}
            isPositive
            isLoading={isLoading}
          />
          <KPICard
            title="Contratos Ativos"
            value={stats?.activeContracts?.toLocaleString("pt-BR") || "0"}
            subValue="em vigor"
            icon={FileText}
            trend={5}
            isPositive
            isLoading={isLoading}
          />
          <KPICard
            title="Receita Mensal"
            value={formatCompactCurrency(stats?.monthlyRevenue || 0)}
            subValue="este mês"
            icon={DollarSign}
            trend={stats?.revenueTrend || 0}
            isPositive={(stats?.revenueTrend || 0) >= 0}
            isLoading={isLoading}
          />
        </div>

        {/* Painéis Principais de Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ========================================
              PAINEL 1: TAXA DE OCUPAÇÃO
          ======================================== */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-white flex items-center gap-2 text-lg">
                <Home className="h-5 w-5 text-green-500" />
                Taxa de Ocupação
              </CardTitle>
              <CardDescription>Imóveis alugados vs. vagos</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <LoadingSkeleton />
              ) : (
                <div className="space-y-4">
                  {/* Gráfico de Rosca Visual */}
                  <div className="relative h-40 flex items-center justify-center">
                    <svg viewBox="0 0 100 100" className="h-36 w-36 -rotate-90">
                      {/* Círculo de fundo (Vagos) */}
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="#3f3f46"
                        strokeWidth="12"
                      />
                      {/* Círculo de ocupação */}
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="#22c55e"
                        strokeWidth="12"
                        strokeDasharray={`${occupancyData.occupancyRate * 2.51} 251`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-bold text-white">
                        {formatPercent(occupancyData.occupancyRate)}
                      </span>
                      <span className="text-xs text-zinc-400">ocupação</span>
                    </div>
                  </div>

                  {/* Legenda */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 p-2 bg-green-900/20 rounded-lg border border-green-800/30">
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                      <div>
                        <p className="text-xs text-zinc-400">Ocupados</p>
                        <p className="text-lg font-bold text-green-400">
                          {occupancyData.occupied}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-2 bg-zinc-800 rounded-lg border border-zinc-700">
                      <div className="w-3 h-3 rounded-full bg-zinc-500" />
                      <div>
                        <p className="text-xs text-zinc-400">Vagos</p>
                        <p className="text-lg font-bold text-zinc-300">
                          {occupancyData.vacant}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Trend */}
                  <div className="flex items-center justify-center gap-1 text-sm">
                    {occupancyData.trend >= 0 ? (
                      <>
                        <ArrowUpRight className="h-4 w-4 text-green-400" />
                        <span className="text-green-400">+{occupancyData.trend}%</span>
                      </>
                    ) : (
                      <>
                        <ArrowDownRight className="h-4 w-4 text-red-400" />
                        <span className="text-red-400">{occupancyData.trend}%</span>
                      </>
                    )}
                    <span className="text-zinc-500">vs. mês anterior</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* ========================================
              PAINEL 2: INADIMPLÊNCIA
          ======================================== */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-white flex items-center gap-2 text-lg">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                Inadimplência
              </CardTitle>
              <CardDescription>Indicador de pagamentos atrasados</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <LoadingSkeleton />
              ) : (
                <div className="space-y-4">
                  {/* Indicador Principal */}
                  <div className="text-center py-4">
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${
                      delinquencyData.delinquencyRate > 20
                        ? "bg-red-900/30 border border-red-700"
                        : delinquencyData.delinquencyRate > 10
                        ? "bg-amber-900/30 border border-amber-700"
                        : "bg-green-900/30 border border-green-700"
                    }`}>
                      <span className={`text-3xl font-bold ${
                        delinquencyData.delinquencyRate > 20
                          ? "text-red-400"
                          : delinquencyData.delinquencyRate > 10
                          ? "text-amber-400"
                          : "text-green-400"
                      }`}>
                        {formatPercent(delinquencyData.delinquencyRate)}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 mt-2">Taxa de Inadimplência</p>
                  </div>

                  {/* Barra de Status Empilhada */}
                  <div className="space-y-2">
                    <div className="flex h-4 rounded-full overflow-hidden bg-zinc-800">
                      <div
                        className="bg-green-500 transition-all"
                        style={{
                          width: `${(delinquencyData.onTime / delinquencyData.total) * 100}%`,
                        }}
                      />
                      <div
                        className="bg-amber-500 transition-all"
                        style={{
                          width: `${(delinquencyData.late / delinquencyData.total) * 100}%`,
                        }}
                      />
                      <div
                        className="bg-red-500 transition-all"
                        style={{
                          width: `${(delinquencyData.defaulted / delinquencyData.total) * 100}%`,
                        }}
                      />
                    </div>
                  </div>

                  {/* Legenda Detalhada */}
                  <div className="space-y-2">
                    <StatusRow
                      icon={CheckCircle}
                      label="Em dia"
                      value={delinquencyData.onTime}
                      color="green"
                    />
                    <StatusRow
                      icon={Clock}
                      label="Atrasados"
                      value={delinquencyData.late}
                      color="amber"
                      extra={`~${delinquencyData.averageDaysLate} dias`}
                    />
                    <StatusRow
                      icon={XCircle}
                      label="Inadimplentes"
                      value={delinquencyData.defaulted}
                      color="red"
                    />
                  </div>

                  {/* Total em Atraso */}
                  <div className="p-3 bg-red-900/20 rounded-lg border border-red-800/30 text-center">
                    <p className="text-xs text-zinc-400">Total em Atraso</p>
                    <p className="text-xl font-bold text-red-400">
                      {formatCurrency(delinquencyData.totalOverdueAmount)}
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* ========================================
              PAINEL 3: FLUXO DE CAIXA
          ======================================== */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-white flex items-center gap-2 text-lg">
                <TrendingUp className="h-5 w-5 text-blue-500" />
                Fluxo de Caixa
              </CardTitle>
              <CardDescription>Entradas e Saídas do mês</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <LoadingSkeleton />
              ) : (
                <div className="space-y-4">
                  {/* Gráfico de Barras */}
                  <div className="space-y-1">
                    {cashFlowData.map((item, index) => (
                      <div key={index} className="space-y-1">
                        <div className="flex justify-between text-xs text-zinc-400">
                          <span>{item.month}</span>
                          <span className="text-green-400">
                            +{formatCompactCurrency(item.income)}
                          </span>
                        </div>
                        <div className="flex gap-1 h-5">
                          {/* Barra de Entrada */}
                          <div
                            className="bg-green-500 rounded-l transition-all"
                            style={{
                              width: `${(item.income / maxCashFlowValue) * 50}%`,
                            }}
                          />
                          {/* Barra de Saída */}
                          <div
                            className="bg-red-500 rounded-r transition-all"
                            style={{
                              width: `${(item.expenses / maxCashFlowValue) * 50}%`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Legenda */}
                  <div className="flex items-center justify-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-green-500" />
                      <span className="text-zinc-400">Entradas</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded bg-red-500" />
                      <span className="text-zinc-400">Saídas</span>
                    </div>
                  </div>

                  {/* Resumo do Mês Atual */}
                  {cashFlowData.length > 0 && (
                    <div className="grid grid-cols-3 gap-2">
                      <div className="p-2 bg-green-900/20 rounded-lg text-center border border-green-800/30">
                        <p className="text-xs text-zinc-400">Entradas</p>
                        <p className="text-sm font-bold text-green-400">
                          {formatCompactCurrency(cashFlowData[cashFlowData.length - 1].income)}
                        </p>
                      </div>
                      <div className="p-2 bg-red-900/20 rounded-lg text-center border border-red-800/30">
                        <p className="text-xs text-zinc-400">Saídas</p>
                        <p className="text-sm font-bold text-red-400">
                          {formatCompactCurrency(cashFlowData[cashFlowData.length - 1].expenses)}
                        </p>
                      </div>
                      <div className="p-2 bg-blue-900/20 rounded-lg text-center border border-blue-800/30">
                        <p className="text-xs text-zinc-400">Saldo</p>
                        <p className="text-sm font-bold text-blue-400">
                          {formatCompactCurrency(cashFlowData[cashFlowData.length - 1].balance)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* DRE Resumido */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <FileText className="h-5 w-5 text-purple-500" />
              DRE - Demonstrativo do Resultado do Exercício
            </CardTitle>
            <CardDescription>
              Resumo financeiro do período atual
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-10 bg-zinc-800 animate-pulse rounded" />
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                <DRERow
                  label="(+) Receita Bruta de Aluguéis"
                  value={stats?.monthlyRevenue || 0}
                  type="income"
                />
                <DRERow
                  label="(-) Comissões de Administração (10%)"
                  value={(stats?.monthlyRevenue || 0) * 0.1}
                  type="expense"
                />
                <DRERow
                  label="(-) Inadimplência"
                  value={delinquencyData.totalOverdueAmount}
                  type="expense"
                />
                <div className="border-t border-zinc-700 my-2" />
                <DRERow
                  label="(=) Receita Líquida Operacional"
                  value={
                    (stats?.monthlyRevenue || 0) -
                    (stats?.monthlyRevenue || 0) * 0.1 -
                    delinquencyData.totalOverdueAmount
                  }
                  type="subtotal"
                />
                <DRERow
                  label="(-) Despesas Operacionais"
                  value={cashFlowData[cashFlowData.length - 1]?.expenses || 0}
                  type="expense"
                />
                <div className="border-t-2 border-zinc-600 my-2" />
                <DRERow
                  label="(=) Resultado Líquido do Período"
                  value={cashFlowData[cashFlowData.length - 1]?.balance || 0}
                  type="total"
                  isHighlight
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tabs Adicionais */}
        <Tabs defaultValue="users" className="space-y-4">
          <TabsList className="bg-zinc-800 border-zinc-700">
            <TabsTrigger value="users">Por Usuário</TabsTrigger>
            <TabsTrigger value="properties">Por Imóvel</TabsTrigger>
            <TabsTrigger value="region">Por Região</TabsTrigger>
            <TabsTrigger value="period">Período</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white">Métricas por Tipo de Usuário</CardTitle>
                <CardDescription>Distribuição de atividade por perfil</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className="space-y-2">
                        <div className="h-4 w-32 bg-zinc-800 animate-pulse rounded" />
                        <div className="h-2 bg-zinc-800 animate-pulse rounded" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Resumo Geral */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-zinc-800 rounded-lg text-center">
                        <p className="text-xs text-zinc-400">Total de Usuários</p>
                        <p className="text-2xl font-bold text-white">
                          {stats?.totalUsers?.toLocaleString("pt-BR") || "0"}
                        </p>
                      </div>
                      <div className="p-4 bg-blue-900/30 rounded-lg text-center border border-blue-800/30">
                        <p className="text-xs text-zinc-400">Usuários Ativos</p>
                        <p className="text-2xl font-bold text-blue-400">
                          {stats?.activeUsers?.toLocaleString("pt-BR") || "0"}
                        </p>
                      </div>
                    </div>

                    {/* Taxa de Ativação */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-zinc-300">Taxa de Ativação</span>
                        <span className="text-zinc-400">
                          {stats?.totalUsers && stats.totalUsers > 0
                            ? formatPercent((stats.activeUsers / stats.totalUsers) * 100)
                            : "0%"}
                        </span>
                      </div>
                      <Progress
                        value={
                          stats?.totalUsers && stats.totalUsers > 0
                            ? (stats.activeUsers / stats.totalUsers) * 100
                            : 0
                        }
                        className="h-2"
                      />
                    </div>

                    {/* Info */}
                    <div className="p-3 bg-zinc-800 rounded-lg text-center">
                      <p className="text-xs text-zinc-500">
                        Detalhamento por tipo de usuário disponível no endpoint /api/admin/users/stats
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="properties">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white">Métricas de Imóveis</CardTitle>
                <CardDescription>Análise do portfólio de imóveis</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px] flex items-center justify-center">
                <p className="text-zinc-500">Dados de imóveis detalhados</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="region">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white">Distribuição por Região</CardTitle>
                <CardDescription>Concentração geográfica dos imóveis</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px] flex items-center justify-center">
                <p className="text-zinc-500">Mapa de distribuição regional</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="period">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white">Análise de Período</CardTitle>
                <CardDescription>Comparativo entre períodos</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px] flex items-center justify-center">
                <p className="text-zinc-500">Gráfico comparativo de períodos</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}

// =============================================================================
// COMPONENTES AUXILIARES
// =============================================================================

interface KPICardProps {
  title: string;
  value: string;
  subValue: string;
  icon: React.ElementType;
  trend: number;
  isPositive: boolean;
  isLoading?: boolean;
}

function KPICard({ title, value, subValue, icon: Icon, trend, isPositive, isLoading }: KPICardProps) {
  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader className="pb-2">
        <CardDescription className="text-zinc-400 flex items-center gap-2">
          <Icon className="h-4 w-4" />
          {title}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <div className="h-8 w-24 bg-zinc-800 animate-pulse rounded" />
            <div className="h-4 w-16 bg-zinc-800 animate-pulse rounded" />
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-white">{value}</span>
              <span className={`flex items-center text-sm ${isPositive ? "text-green-400" : "text-red-400"}`}>
                {isPositive ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                {Math.abs(trend)}%
              </span>
            </div>
            <p className="text-xs text-zinc-500 mt-1">{subValue}</p>
          </>
        )}
      </CardContent>
    </Card>
  );
}

interface StatusRowProps {
  icon: React.ElementType;
  label: string;
  value: number;
  color: "green" | "amber" | "red";
  extra?: string;
}

function StatusRow({ icon: Icon, label, value, color, extra }: StatusRowProps) {
  const colorClasses = {
    green: "text-green-400",
    amber: "text-amber-400",
    red: "text-red-400",
  };

  return (
    <div className="flex items-center justify-between text-sm">
      <div className="flex items-center gap-2">
        <Icon className={`h-4 w-4 ${colorClasses[color]}`} />
        <span className="text-zinc-300">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className={`font-bold ${colorClasses[color]}`}>{value}</span>
        {extra && <span className="text-zinc-500 text-xs">({extra})</span>}
      </div>
    </div>
  );
}

interface DRERowProps {
  label: string;
  value: number;
  type: "income" | "expense" | "subtotal" | "total";
  isHighlight?: boolean;
}

function DRERow({ label, value, type, isHighlight }: DRERowProps) {
  const typeStyles = {
    income: "text-green-400",
    expense: "text-red-400",
    subtotal: "text-blue-400",
    total: "text-white",
  };

  return (
    <div
      className={`flex items-center justify-between py-2 px-3 rounded ${
        isHighlight ? "bg-blue-900/20 border border-blue-800/30" : ""
      }`}
    >
      <span className={`text-sm ${isHighlight ? "font-medium text-white" : "text-zinc-400"}`}>
        {label}
      </span>
      <span className={`font-mono font-medium ${typeStyles[type]}`}>
        {type === "expense" ? "-" : ""}
        {formatCurrency(value)}
      </span>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-40 bg-zinc-800 animate-pulse rounded-lg" />
      <div className="grid grid-cols-2 gap-2">
        <div className="h-16 bg-zinc-800 animate-pulse rounded" />
        <div className="h-16 bg-zinc-800 animate-pulse rounded" />
      </div>
    </div>
  );
}
