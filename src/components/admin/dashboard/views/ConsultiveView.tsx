// ============================================
// CONSULTIVE VIEW - Consultiva & KPIs
// Ocupacao, Churn, Performance de corretores
// ============================================

import { useState } from 'react';
import {
  Brain,
  Users,
  Building,
  TrendingUp,
  TrendingDown,
  Target,
  Activity,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Star,
  UserCheck,
  UserX,
  Home,
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { useDashboardMetrics } from '@/hooks/use-dashboard-metrics';

// ============================================
// COMPONENTE
// ============================================

export function ConsultiveView() {
  const { data: metrics, isLoading, refetch } = useDashboardMetrics();
  const [activeTab, setActiveTab] = useState('overview');

  // Calculos de KPIs
  const occupancyRate = metrics?.totalProperties && metrics.totalProperties > 0
    ? Math.round((metrics.rentedProperties / metrics.totalProperties) * 100)
    : 0;

  const conversionRate = metrics?.totalLeads && metrics.totalLeads > 0
    ? Math.round((metrics.wonDealsThisMonth / metrics.totalLeads) * 100)
    : 0;

  const ticketResolutionRate = metrics?.openTickets !== undefined
    ? Math.max(0, 100 - (metrics.openTickets * 5)) // Estimativa
    : 85;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-zinc-400">
          Metricas de ocupacao, churn e performance operacional
        </p>
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

      {/* KPI Cards Principais */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Taxa de Ocupacao"
          value={`${occupancyRate}%`}
          target="Meta: 90%"
          icon={Home}
          progress={occupancyRate}
          color={occupancyRate >= 90 ? 'green' : occupancyRate >= 70 ? 'amber' : 'red'}
          isLoading={isLoading}
        />
        <KPICard
          title="Conversao de Leads"
          value={`${conversionRate}%`}
          target="Meta: 25%"
          icon={Target}
          progress={Math.min(conversionRate * 4, 100)}
          color={conversionRate >= 25 ? 'green' : conversionRate >= 15 ? 'amber' : 'red'}
          isLoading={isLoading}
        />
        <KPICard
          title="Resolucao Tickets"
          value={`${ticketResolutionRate}%`}
          target="Meta: 95%"
          icon={CheckCircle}
          progress={ticketResolutionRate}
          color={ticketResolutionRate >= 95 ? 'green' : ticketResolutionRate >= 80 ? 'amber' : 'red'}
          isLoading={isLoading}
        />
        <KPICard
          title="Churn Mensal"
          value="2.3%"
          target="Meta: <3%"
          icon={UserX}
          progress={77}
          color="green"
          isLoading={isLoading}
          inverted
        />
      </div>

      {/* Tabs de Analise */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-zinc-800 border-zinc-700">
          <TabsTrigger value="overview" className="data-[state=active]:bg-zinc-700">
            Visao Geral
          </TabsTrigger>
          <TabsTrigger value="leads" className="data-[state=active]:bg-zinc-700">
            Leads & Deals
          </TabsTrigger>
          <TabsTrigger value="properties" className="data-[state=active]:bg-zinc-700">
            Imoveis
          </TabsTrigger>
          <TabsTrigger value="support" className="data-[state=active]:bg-zinc-700">
            Suporte
          </TabsTrigger>
        </TabsList>

        {/* Tab: Visao Geral */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Funil de Conversao */}
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-400" />
                  Funil de Conversao
                </CardTitle>
                <CardDescription>Pipeline de leads para contratos</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoading ? (
                  <LoadingSkeleton />
                ) : (
                  <>
                    <FunnelStep label="Leads Captados" value={metrics?.totalLeads || 0} percent={100} color="blue" />
                    <FunnelStep label="Leads Qualificados" value={Math.round((metrics?.totalLeads || 0) * 0.6)} percent={60} color="violet" />
                    <FunnelStep label="Visitas Agendadas" value={Math.round((metrics?.totalLeads || 0) * 0.35)} percent={35} color="amber" />
                    <FunnelStep label="Propostas Enviadas" value={metrics?.openDeals || 0} percent={20} color="orange" />
                    <FunnelStep label="Contratos Fechados" value={metrics?.wonDealsThisMonth || 0} percent={conversionRate} color="green" />
                  </>
                )}
              </CardContent>
            </Card>

            {/* Distribuicao de Imoveis */}
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <PieChart className="h-5 w-5 text-violet-400" />
                  Distribuicao de Imoveis
                </CardTitle>
                <CardDescription>Por status de ocupacao</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <LoadingSkeleton />
                ) : (
                  <div className="space-y-4">
                    {/* Grafico de Rosca Visual */}
                    <div className="relative h-40 flex items-center justify-center">
                      <svg viewBox="0 0 100 100" className="h-36 w-36 -rotate-90">
                        <circle cx="50" cy="50" r="40" fill="none" stroke="#3f3f46" strokeWidth="10" />
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          fill="none"
                          stroke="#22c55e"
                          strokeWidth="10"
                          strokeDasharray={`${occupancyRate * 2.51} 251`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-bold text-white">{metrics?.totalProperties || 0}</span>
                        <span className="text-xs text-zinc-400">imoveis</span>
                      </div>
                    </div>

                    {/* Legenda */}
                    <div className="grid grid-cols-3 gap-2">
                      <div className="p-2 bg-green-900/20 rounded-lg text-center border border-green-800/30">
                        <p className="text-xs text-zinc-400">Alugados</p>
                        <p className="text-lg font-bold text-green-400">{metrics?.rentedProperties || 0}</p>
                      </div>
                      <div className="p-2 bg-blue-900/20 rounded-lg text-center border border-blue-800/30">
                        <p className="text-xs text-zinc-400">Disponiveis</p>
                        <p className="text-lg font-bold text-blue-400">{metrics?.availableProperties || 0}</p>
                      </div>
                      <div className="p-2 bg-zinc-800 rounded-lg text-center border border-zinc-700">
                        <p className="text-xs text-zinc-400">Outros</p>
                        <p className="text-lg font-bold text-zinc-400">
                          {Math.max(0, (metrics?.totalProperties || 0) - (metrics?.rentedProperties || 0) - (metrics?.availableProperties || 0))}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Metricas de Atendimento */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Activity className="h-5 w-5 text-emerald-400" />
                Metricas de Atendimento
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-24 bg-zinc-800 animate-pulse rounded" />
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <MetricBox label="Tickets Abertos" value={metrics?.openTickets || 0} icon={AlertTriangle} color="amber" />
                  <MetricBox label="Disputas" value={metrics?.openDisputes || 0} icon={AlertTriangle} color="red" />
                  <MetricBox label="Vistorias Pendentes" value={metrics?.pendingInspections || 0} icon={Clock} color="violet" />
                  <MetricBox label="KYC Pendente" value={metrics?.pendingKYC || 0} icon={UserCheck} color="blue" />
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Leads & Deals */}
        <TabsContent value="leads" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Total de Leads" value={metrics?.totalLeads || 0} icon={Users} color="blue" isLoading={isLoading} />
            <StatCard title="Leads Novos" value={metrics?.newLeads || 0} icon={UserCheck} color="green" isLoading={isLoading} />
            <StatCard title="Deals Abertos" value={metrics?.openDeals || 0} icon={Target} color="amber" isLoading={isLoading} />
            <StatCard title="Fechados (Mes)" value={metrics?.wonDealsThisMonth || 0} icon={CheckCircle} color="emerald" isLoading={isLoading} />
          </div>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white">Pipeline de Vendas</CardTitle>
              <CardDescription>Status dos deals em andamento</CardDescription>
            </CardHeader>
            <CardContent className="text-center py-8 text-zinc-500">
              <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Dados do pipeline serao exibidos aqui</p>
              <p className="text-xs mt-1">Conecte ao endpoint /api/deals/pipeline</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Imoveis */}
        <TabsContent value="properties" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Total Imoveis" value={metrics?.totalProperties || 0} icon={Building} color="blue" isLoading={isLoading} />
            <StatCard title="Alugados" value={metrics?.rentedProperties || 0} icon={Home} color="green" isLoading={isLoading} />
            <StatCard title="Disponiveis" value={metrics?.availableProperties || 0} icon={Home} color="amber" isLoading={isLoading} />
            <StatCard
              title="Taxa Ocupacao"
              value={`${occupancyRate}%`}
              icon={TrendingUp}
              color={occupancyRate >= 80 ? 'green' : 'amber'}
              isLoading={isLoading}
              isPercentage
            />
          </div>
        </TabsContent>

        {/* Tab: Suporte */}
        <TabsContent value="support" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Tickets Abertos" value={metrics?.openTickets || 0} icon={AlertTriangle} color="amber" isLoading={isLoading} />
            <StatCard title="Disputas Ativas" value={metrics?.openDisputes || 0} icon={AlertTriangle} color="red" isLoading={isLoading} />
            <StatCard title="Vistorias Pendentes" value={metrics?.pendingInspections || 0} icon={Clock} color="violet" isLoading={isLoading} />
            <StatCard title="Taxa Resolucao" value={`${ticketResolutionRate}%`} icon={CheckCircle} color="green" isLoading={isLoading} isPercentage />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ============================================
// COMPONENTES AUXILIARES
// ============================================

interface KPICardProps {
  title: string;
  value: string;
  target: string;
  icon: React.ElementType;
  progress: number;
  color: 'green' | 'amber' | 'red' | 'blue';
  isLoading?: boolean;
  inverted?: boolean;
}

function KPICard({ title, value, target, icon: Icon, progress, color, isLoading, inverted }: KPICardProps) {
  const colorStyles = {
    green: 'text-green-400',
    amber: 'text-amber-400',
    red: 'text-red-400',
    blue: 'text-blue-400',
  };

  const progressColors = {
    green: 'bg-green-500',
    amber: 'bg-amber-500',
    red: 'bg-red-500',
    blue: 'bg-blue-500',
  };

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardContent className="p-4">
        {isLoading ? (
          <div className="space-y-3">
            <div className="h-6 w-20 bg-zinc-800 animate-pulse rounded" />
            <div className="h-2 bg-zinc-800 animate-pulse rounded" />
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-zinc-400">{title}</p>
                <p className={cn('text-2xl font-bold', colorStyles[color])}>{value}</p>
              </div>
              <Icon className={cn('h-8 w-8 opacity-50', colorStyles[color])} />
            </div>
            <div className="space-y-1">
              <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div className={cn('h-full transition-all', progressColors[color])} style={{ width: `${progress}%` }} />
              </div>
              <p className="text-xs text-zinc-500">{target}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface FunnelStepProps {
  label: string;
  value: number;
  percent: number;
  color: string;
}

function FunnelStep({ label, value, percent, color }: FunnelStepProps) {
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-500',
    violet: 'bg-violet-500',
    amber: 'bg-amber-500',
    orange: 'bg-orange-500',
    green: 'bg-green-500',
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-sm">
        <span className="text-zinc-300">{label}</span>
        <span className="text-white font-medium">{value}</span>
      </div>
      <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
        <div className={cn('h-full transition-all', colorMap[color])} style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

interface MetricBoxProps {
  label: string;
  value: number;
  icon: React.ElementType;
  color: 'amber' | 'red' | 'violet' | 'blue' | 'green';
}

function MetricBox({ label, value, icon: Icon, color }: MetricBoxProps) {
  const colorStyles = {
    amber: { bg: 'bg-amber-900/20', border: 'border-amber-700/30', text: 'text-amber-400' },
    red: { bg: 'bg-red-900/20', border: 'border-red-700/30', text: 'text-red-400' },
    violet: { bg: 'bg-violet-900/20', border: 'border-violet-700/30', text: 'text-violet-400' },
    blue: { bg: 'bg-blue-900/20', border: 'border-blue-700/30', text: 'text-blue-400' },
    green: { bg: 'bg-green-900/20', border: 'border-green-700/30', text: 'text-green-400' },
  };

  const styles = colorStyles[color];

  return (
    <div className={cn('p-4 rounded-lg border', styles.bg, styles.border)}>
      <div className="flex items-center gap-3">
        <Icon className={cn('h-5 w-5', styles.text)} />
        <div>
          <p className="text-xs text-zinc-400">{label}</p>
          <p className={cn('text-xl font-bold', styles.text)}>{value}</p>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ElementType;
  color: 'blue' | 'green' | 'amber' | 'violet' | 'red' | 'emerald';
  isLoading?: boolean;
  isPercentage?: boolean;
}

function StatCard({ title, value, icon: Icon, color, isLoading, isPercentage }: StatCardProps) {
  const colorStyles = {
    blue: { bg: 'bg-blue-600/20', text: 'text-blue-400' },
    green: { bg: 'bg-green-600/20', text: 'text-green-400' },
    amber: { bg: 'bg-amber-600/20', text: 'text-amber-400' },
    violet: { bg: 'bg-violet-600/20', text: 'text-violet-400' },
    red: { bg: 'bg-red-600/20', text: 'text-red-400' },
    emerald: { bg: 'bg-emerald-600/20', text: 'text-emerald-400' },
  };

  const styles = colorStyles[color];

  return (
    <Card className="bg-zinc-900 border-zinc-800">
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
                {isPercentage ? value : typeof value === 'number' ? value.toLocaleString('pt-BR') : value}
              </p>
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

function LoadingSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="space-y-1">
          <div className="h-4 w-32 bg-zinc-800 animate-pulse rounded" />
          <div className="h-2 bg-zinc-800 animate-pulse rounded" />
        </div>
      ))}
    </div>
  );
}

export default ConsultiveView;
