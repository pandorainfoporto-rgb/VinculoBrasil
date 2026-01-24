// ============================================
// FINANCIAL VIEW - Analytics Financeiro
// Graficos de Receita, Inadimplencia, DRE
// ============================================

import {
  BarChart3,
  TrendingUp,
  TrendingDown,
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
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useAnalyticsStats, formatCurrency, formatCompactCurrency, formatPercent } from '@/hooks/use-analytics-stats';
import { cn } from '@/lib/utils';

// ============================================
// COMPONENTE
// ============================================

export function FinancialView() {
  const { data: stats, isLoading, refetch } = useAnalyticsStats();

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
  const maxCashFlowValue = Math.max(...cashFlowData.flatMap((item) => [item.income, item.expenses]), 1);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-zinc-400">
          Metricas e indicadores de performance - Modelo DRE
        </p>
        <div className="flex items-center gap-2">
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
          <Button variant="outline" size="sm" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">
            <Download className="h-4 w-4 mr-2" />
            Exportar PDF
          </Button>
        </div>
      </div>

      {/* KPI Cards Principais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KPICard
          title="Receita Mensal"
          value={formatCompactCurrency(stats?.monthlyRevenue || 0)}
          subValue="este mes"
          icon={DollarSign}
          trend={stats?.revenueTrend || 0}
          isPositive={(stats?.revenueTrend || 0) >= 0}
          isLoading={isLoading}
        />
        <KPICard
          title="Imoveis Cadastrados"
          value={(stats?.totalProperties || 0).toLocaleString('pt-BR')}
          subValue={`${occupancyData.occupied} ocupados`}
          icon={Home}
          trend={8}
          isPositive
          isLoading={isLoading}
        />
        <KPICard
          title="Contratos Ativos"
          value={(stats?.activeContracts || 0).toLocaleString('pt-BR')}
          subValue="em vigor"
          icon={FileText}
          trend={5}
          isPositive
          isLoading={isLoading}
        />
        <KPICard
          title="Taxa Inadimplencia"
          value={formatPercent(delinquencyData.delinquencyRate)}
          subValue="do total"
          icon={AlertTriangle}
          trend={delinquencyData.delinquencyRate > 10 ? 0 : -2}
          isPositive={delinquencyData.delinquencyRate <= 10}
          isLoading={isLoading}
        />
      </div>

      {/* Paineis Principais */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* PAINEL 1: TAXA DE OCUPACAO */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-white flex items-center gap-2 text-lg">
              <Home className="h-5 w-5 text-green-500" />
              Taxa de Ocupacao
            </CardTitle>
            <CardDescription>Imoveis alugados vs. vagos</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <LoadingSkeleton />
            ) : (
              <div className="space-y-4">
                <div className="relative h-40 flex items-center justify-center">
                  <svg viewBox="0 0 100 100" className="h-36 w-36 -rotate-90">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="#3f3f46" strokeWidth="12" />
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
                    <span className="text-xs text-zinc-400">ocupacao</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 p-2 bg-green-900/20 rounded-lg border border-green-800/30">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <div>
                      <p className="text-xs text-zinc-400">Ocupados</p>
                      <p className="text-lg font-bold text-green-400">{occupancyData.occupied}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-zinc-800 rounded-lg border border-zinc-700">
                    <div className="w-3 h-3 rounded-full bg-zinc-500" />
                    <div>
                      <p className="text-xs text-zinc-400">Vagos</p>
                      <p className="text-lg font-bold text-zinc-300">{occupancyData.vacant}</p>
                    </div>
                  </div>
                </div>

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
                  <span className="text-zinc-500">vs. mes anterior</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* PAINEL 2: INADIMPLENCIA */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-white flex items-center gap-2 text-lg">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Inadimplencia
            </CardTitle>
            <CardDescription>Indicador de pagamentos atrasados</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <LoadingSkeleton />
            ) : (
              <div className="space-y-4">
                <div className="text-center py-4">
                  <div
                    className={cn(
                      'inline-flex items-center gap-2 px-4 py-2 rounded-full',
                      delinquencyData.delinquencyRate > 20
                        ? 'bg-red-900/30 border border-red-700'
                        : delinquencyData.delinquencyRate > 10
                        ? 'bg-amber-900/30 border border-amber-700'
                        : 'bg-green-900/30 border border-green-700'
                    )}
                  >
                    <span
                      className={cn(
                        'text-3xl font-bold',
                        delinquencyData.delinquencyRate > 20
                          ? 'text-red-400'
                          : delinquencyData.delinquencyRate > 10
                          ? 'text-amber-400'
                          : 'text-green-400'
                      )}
                    >
                      {formatPercent(delinquencyData.delinquencyRate)}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500 mt-2">Taxa de Inadimplencia</p>
                </div>

                <div className="space-y-2">
                  <div className="flex h-4 rounded-full overflow-hidden bg-zinc-800">
                    <div
                      className="bg-green-500 transition-all"
                      style={{ width: `${delinquencyData.total > 0 ? (delinquencyData.onTime / delinquencyData.total) * 100 : 0}%` }}
                    />
                    <div
                      className="bg-amber-500 transition-all"
                      style={{ width: `${delinquencyData.total > 0 ? (delinquencyData.late / delinquencyData.total) * 100 : 0}%` }}
                    />
                    <div
                      className="bg-red-500 transition-all"
                      style={{ width: `${delinquencyData.total > 0 ? (delinquencyData.defaulted / delinquencyData.total) * 100 : 0}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <StatusRow icon={CheckCircle} label="Em dia" value={delinquencyData.onTime} color="green" />
                  <StatusRow icon={Clock} label="Atrasados" value={delinquencyData.late} color="amber" extra={`~${delinquencyData.averageDaysLate} dias`} />
                  <StatusRow icon={XCircle} label="Inadimplentes" value={delinquencyData.defaulted} color="red" />
                </div>

                <div className="p-3 bg-red-900/20 rounded-lg border border-red-800/30 text-center">
                  <p className="text-xs text-zinc-400">Total em Atraso</p>
                  <p className="text-xl font-bold text-red-400">{formatCurrency(delinquencyData.totalOverdueAmount)}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* PAINEL 3: FLUXO DE CAIXA */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-white flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              Fluxo de Caixa
            </CardTitle>
            <CardDescription>Entradas e Saidas do mes</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <LoadingSkeleton />
            ) : (
              <div className="space-y-4">
                <div className="space-y-1">
                  {cashFlowData.map((item, index) => (
                    <div key={index} className="space-y-1">
                      <div className="flex justify-between text-xs text-zinc-400">
                        <span>{item.month}</span>
                        <span className="text-green-400">+{formatCompactCurrency(item.income)}</span>
                      </div>
                      <div className="flex gap-1 h-5">
                        <div
                          className="bg-green-500 rounded-l transition-all"
                          style={{ width: `${(item.income / maxCashFlowValue) * 50}%` }}
                        />
                        <div
                          className="bg-red-500 rounded-r transition-all"
                          style={{ width: `${(item.expenses / maxCashFlowValue) * 50}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-green-500" />
                    <span className="text-zinc-400">Entradas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-red-500" />
                    <span className="text-zinc-400">Saidas</span>
                  </div>
                </div>

                {cashFlowData.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-2 bg-green-900/20 rounded-lg text-center border border-green-800/30">
                      <p className="text-xs text-zinc-400">Entradas</p>
                      <p className="text-sm font-bold text-green-400">
                        {formatCompactCurrency(cashFlowData[cashFlowData.length - 1].income)}
                      </p>
                    </div>
                    <div className="p-2 bg-red-900/20 rounded-lg text-center border border-red-800/30">
                      <p className="text-xs text-zinc-400">Saidas</p>
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
            DRE - Demonstrativo do Resultado do Exercicio
          </CardTitle>
          <CardDescription>Resumo financeiro do periodo atual</CardDescription>
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
              <DRERow label="(+) Receita Bruta de Alugueis" value={stats?.monthlyRevenue || 0} type="income" />
              <DRERow label="(-) Comissoes de Administracao (10%)" value={(stats?.monthlyRevenue || 0) * 0.1} type="expense" />
              <DRERow label="(-) Inadimplencia" value={delinquencyData.totalOverdueAmount} type="expense" />
              <div className="border-t border-zinc-700 my-2" />
              <DRERow
                label="(=) Receita Liquida Operacional"
                value={(stats?.monthlyRevenue || 0) - (stats?.monthlyRevenue || 0) * 0.1 - delinquencyData.totalOverdueAmount}
                type="subtotal"
              />
              <DRERow label="(-) Despesas Operacionais" value={cashFlowData[cashFlowData.length - 1]?.expenses || 0} type="expense" />
              <div className="border-t-2 border-zinc-600 my-2" />
              <DRERow
                label="(=) Resultado Liquido do Periodo"
                value={cashFlowData[cashFlowData.length - 1]?.balance || 0}
                type="total"
                isHighlight
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ============================================
// COMPONENTES AUXILIARES
// ============================================

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
              <span className={cn('flex items-center text-sm', isPositive ? 'text-green-400' : 'text-red-400')}>
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
  color: 'green' | 'amber' | 'red';
  extra?: string;
}

function StatusRow({ icon: Icon, label, value, color, extra }: StatusRowProps) {
  const colorClasses = {
    green: 'text-green-400',
    amber: 'text-amber-400',
    red: 'text-red-400',
  };

  return (
    <div className="flex items-center justify-between text-sm">
      <div className="flex items-center gap-2">
        <Icon className={cn('h-4 w-4', colorClasses[color])} />
        <span className="text-zinc-300">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className={cn('font-bold', colorClasses[color])}>{value}</span>
        {extra && <span className="text-zinc-500 text-xs">({extra})</span>}
      </div>
    </div>
  );
}

interface DRERowProps {
  label: string;
  value: number;
  type: 'income' | 'expense' | 'subtotal' | 'total';
  isHighlight?: boolean;
}

function DRERow({ label, value, type, isHighlight }: DRERowProps) {
  const typeStyles = {
    income: 'text-green-400',
    expense: 'text-red-400',
    subtotal: 'text-blue-400',
    total: 'text-white',
  };

  return (
    <div className={cn('flex items-center justify-between py-2 px-3 rounded', isHighlight && 'bg-blue-900/20 border border-blue-800/30')}>
      <span className={cn('text-sm', isHighlight ? 'font-medium text-white' : 'text-zinc-400')}>{label}</span>
      <span className={cn('font-mono font-medium', typeStyles[type])}>
        {type === 'expense' ? '-' : ''}
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

export default FinancialView;
