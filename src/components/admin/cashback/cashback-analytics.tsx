// =============================================================================
// CashbackAnalytics - Analytics e Métricas do Sistema de Cashback
// =============================================================================

import * as React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Coins,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  type CashbackAdminStats,
  type CashbackCategory,
  CASHBACK_CATEGORY_LABELS,
} from '@/lib/cashback-admin-types';
import { formatVBRz, LOYALTY_TIER_LABELS, type LoyaltyTier } from '@/lib/tokenomics-types';

// =============================================================================
// PROPS
// =============================================================================

interface CashbackAnalyticsProps {
  stats: CashbackAdminStats;
}

// =============================================================================
// COMPONENTE PRINCIPAL
// =============================================================================

export function CashbackAnalytics({ stats }: CashbackAnalyticsProps) {
  const [period, setPeriod] = React.useState('7d');

  // Calcular métricas
  const avgPerTransaction = stats.totalTransactions > 0 ? stats.totalDistributed / stats.totalTransactions : 0;
  const avgPerUser = stats.totalUsers > 0 ? stats.totalDistributed / stats.totalUsers : 0;

  // Encontrar categoria com maior distribuição
  const topCategory = Object.entries(stats.byCategory).reduce(
    (max, [cat, catStats]) => (catStats.totalVBRz > max.value ? { category: cat, value: catStats.totalVBRz } : max),
    { category: '', value: 0 }
  );

  // Encontrar tier mais ativo
  const topTier = Object.entries(stats.byTier).reduce(
    (max, [tier, value]) => (value > max.value ? { tier, value } : max),
    { tier: '', value: 0 }
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Analytics de Cashback</h2>
          <p className="text-sm text-muted-foreground">Métricas detalhadas do programa de fidelidade VBRz</p>
        </div>
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[150px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="24h">Últimas 24h</SelectItem>
            <SelectItem value="7d">Últimos 7 dias</SelectItem>
            <SelectItem value="30d">Últimos 30 dias</SelectItem>
            <SelectItem value="90d">Últimos 90 dias</SelectItem>
            <SelectItem value="all">Todo período</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* KPIs de Performance */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Média por Transação"
          value={formatVBRz(avgPerTransaction)}
          suffix="VBRz"
          description="Valor médio distribuído por transação"
          icon={BarChart3}
          trend={{ value: 5.2, isPositive: true }}
        />
        <MetricCard
          title="Média por Usuário"
          value={formatVBRz(avgPerUser)}
          suffix="VBRz"
          description="Cashback médio por usuário ativo"
          icon={Users}
          trend={{ value: 8.7, isPositive: true }}
        />
        <MetricCard
          title="Categoria Líder"
          value={CASHBACK_CATEGORY_LABELS[topCategory.category as CashbackCategory]}
          description={`${formatVBRz(topCategory.value)} VBRz distribuídos`}
          icon={PieChart}
        />
        <MetricCard
          title="Tier Mais Ativo"
          value={LOYALTY_TIER_LABELS[topTier.tier as LoyaltyTier]}
          description={`${formatVBRz(topTier.value)} VBRz recebidos`}
          icon={Activity}
        />
      </div>

      {/* Tabs de Análise */}
      <Tabs defaultValue="distribution" className="space-y-4">
        <TabsList>
          <TabsTrigger value="distribution">Distribuição</TabsTrigger>
          <TabsTrigger value="users">Usuários</TabsTrigger>
          <TabsTrigger value="trends">Tendências</TabsTrigger>
          <TabsTrigger value="roi">ROI</TabsTrigger>
        </TabsList>

        <TabsContent value="distribution" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Por Categoria */}
            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Categoria</CardTitle>
                <CardDescription>Proporção de cashback por tipo de operação</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(stats.byCategory)
                  .sort(([, a], [, b]) => b.totalVBRz - a.totalVBRz)
                  .map(([category, categoryStats]) => {
                    const percentage = (categoryStats.totalVBRz / stats.totalDistributed) * 100;
                    return (
                      <div key={category} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">
                            {CASHBACK_CATEGORY_LABELS[category as CashbackCategory]}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">{formatVBRz(categoryStats.totalVBRz)}</span>
                            <Badge variant="outline">{percentage.toFixed(1)}%</Badge>
                          </div>
                        </div>
                        <Progress value={percentage} className="h-2" />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>{categoryStats.transactionCount.toLocaleString('pt-BR')} transações</span>
                          <span>{categoryStats.userCount.toLocaleString('pt-BR')} usuários</span>
                        </div>
                      </div>
                    );
                  })}
              </CardContent>
            </Card>

            {/* Por Tier */}
            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Tier</CardTitle>
                <CardDescription>Cashback recebido por nível de fidelidade</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(stats.byTier)
                  .sort(([, a], [, b]) => b - a)
                  .map(([tier, amount]) => {
                    const percentage = (amount / stats.totalDistributed) * 100;
                    const tierColors: Record<string, string> = {
                      bronze: 'bg-amber-500',
                      prata: 'bg-gray-400',
                      ouro: 'bg-yellow-500',
                      diamante: 'bg-cyan-400',
                    };
                    return (
                      <div key={tier} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <div className={`h-3 w-3 rounded-full ${tierColors[tier]}`} />
                            <span className="font-medium">{LOYALTY_TIER_LABELS[tier as LoyaltyTier]}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">{formatVBRz(amount)}</span>
                            <Badge variant="outline">{percentage.toFixed(1)}%</Badge>
                          </div>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    );
                  })}

                <div className="mt-4 rounded-lg bg-muted p-4">
                  <h4 className="font-medium">Impacto dos Multiplicadores</h4>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Usuários Diamante recebem 2x mais cashback que Bronze, incentivando a fidelização.
                  </p>
                  <div className="mt-3 grid grid-cols-4 gap-2 text-center text-xs">
                    <div>
                      <div className="font-bold text-amber-700">1.0x</div>
                      <div className="text-muted-foreground">Bronze</div>
                    </div>
                    <div>
                      <div className="font-bold text-gray-600">1.2x</div>
                      <div className="text-muted-foreground">Prata</div>
                    </div>
                    <div>
                      <div className="font-bold text-yellow-600">1.5x</div>
                      <div className="text-muted-foreground">Ouro</div>
                    </div>
                    <div>
                      <div className="font-bold text-cyan-600">2.0x</div>
                      <div className="text-muted-foreground">Diamante</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            {/* Por Tipo de Usuário */}
            <Card>
              <CardHeader>
                <CardTitle>Por Tipo de Usuário</CardTitle>
                <CardDescription>Distribuição entre inquilinos, proprietários e garantidores</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(stats.byUserRole).map(([role, roleStats]) => {
                  const percentage = (roleStats.totalVBRz / stats.totalDistributed) * 100;
                  const roleLabels: Record<string, string> = {
                    tenant: 'Inquilinos',
                    landlord: 'Proprietários',
                    guarantor: 'Garantidores',
                    admin: 'Administradores',
                  };
                  return (
                    <div key={role} className="rounded-lg border p-4">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{roleLabels[role]}</span>
                        <Badge>{percentage.toFixed(1)}%</Badge>
                      </div>
                      <Progress value={percentage} className="my-2 h-2" />
                      <div className="grid grid-cols-3 gap-2 text-center text-xs">
                        <div>
                          <div className="font-bold">{formatVBRz(roleStats.totalVBRz)}</div>
                          <div className="text-muted-foreground">VBRz Total</div>
                        </div>
                        <div>
                          <div className="font-bold">{roleStats.userCount.toLocaleString('pt-BR')}</div>
                          <div className="text-muted-foreground">Usuários</div>
                        </div>
                        <div>
                          <div className="font-bold">{formatVBRz(roleStats.averagePerUser)}</div>
                          <div className="text-muted-foreground">Média/Usuário</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Top Usuários */}
            <Card>
              <CardHeader>
                <CardTitle>Engajamento</CardTitle>
                <CardDescription>Métricas de engajamento do programa</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg bg-primary/10 p-4 text-center">
                    <div className="text-3xl font-bold text-primary">{stats.totalUsers.toLocaleString('pt-BR')}</div>
                    <div className="text-sm text-muted-foreground">Usuários com VBRz</div>
                  </div>
                  <div className="rounded-lg bg-green-100 p-4 text-center">
                    <div className="text-3xl font-bold text-green-700">
                      {((stats.totalUsers / 15000) * 100).toFixed(1)}%
                    </div>
                    <div className="text-sm text-muted-foreground">Taxa de Adoção</div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Distribuição por Saldo</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>0 - 100 VBRz</span>
                      <span className="text-muted-foreground">45%</span>
                    </div>
                    <Progress value={45} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>100 - 500 VBRz</span>
                      <span className="text-muted-foreground">30%</span>
                    </div>
                    <Progress value={30} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>500 - 1.000 VBRz</span>
                      <span className="text-muted-foreground">15%</span>
                    </div>
                    <Progress value={15} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>1.000+ VBRz</span>
                      <span className="text-muted-foreground">10%</span>
                    </div>
                    <Progress value={10} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Tendência de Distribuição</CardTitle>
              <CardDescription>Volume de cashback distribuído ao longo do tempo</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Gráfico de barras simples */}
              <div className="flex h-64 items-end gap-2">
                {stats.trend7Days.map((day, index) => {
                  const maxDistributed = Math.max(...stats.trend7Days.map((d) => d.distributed));
                  const heightPercent = (day.distributed / maxDistributed) * 100;
                  const isToday = index === stats.trend7Days.length - 1;
                  return (
                    <div key={index} className="flex flex-1 flex-col items-center gap-2">
                      <div className="text-xs font-medium">{formatVBRz(day.distributed)}</div>
                      <div
                        className={`w-full rounded-t transition-all ${isToday ? 'bg-primary' : 'bg-primary/60'} hover:bg-primary/80`}
                        style={{ height: `${heightPercent}%`, minHeight: '8px' }}
                      />
                      <div className="text-center">
                        <div className="text-xs font-medium">
                          {new Date(day.date).toLocaleDateString('pt-BR', { weekday: 'short' })}
                        </div>
                        <div className="text-xs text-muted-foreground">{day.transactions} txs</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 grid grid-cols-3 gap-4 rounded-lg bg-muted p-4">
                <div className="text-center">
                  <div className="text-lg font-bold">{formatVBRz(stats.distributedToday)}</div>
                  <div className="text-xs text-muted-foreground">Hoje</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold">{formatVBRz(stats.distributedThisWeek)}</div>
                  <div className="text-xs text-muted-foreground">Esta Semana</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold">{formatVBRz(stats.distributedThisMonth)}</div>
                  <div className="text-xs text-muted-foreground">Este Mês</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roi" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Custo do Programa</CardTitle>
                <CardDescription>Análise de custos e retorno</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-lg border p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total Distribuído (BRL)</span>
                    <span className="text-xl font-bold">R$ {formatVBRz(stats.totalDistributedBRL)}</span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between rounded-lg bg-muted p-3">
                    <span>Custo por Transação</span>
                    <span className="font-medium">
                      R$ {(stats.totalDistributedBRL / stats.totalTransactions).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-muted p-3">
                    <span>Custo por Usuário</span>
                    <span className="font-medium">
                      R$ {(stats.totalDistributedBRL / stats.totalUsers).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between rounded-lg bg-muted p-3">
                    <span>Custo Mensal Médio</span>
                    <span className="font-medium">R$ {formatVBRz(stats.distributedThisMonth * 0.1)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Retorno Estimado</CardTitle>
                <CardDescription>Impacto do programa na retenção</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg bg-green-100 p-4 text-center">
                    <div className="text-2xl font-bold text-green-700">+23%</div>
                    <div className="text-sm text-muted-foreground">Retenção</div>
                  </div>
                  <div className="rounded-lg bg-blue-100 p-4 text-center">
                    <div className="text-2xl font-bold text-blue-700">+15%</div>
                    <div className="text-sm text-muted-foreground">Indicações</div>
                  </div>
                </div>

                <div className="rounded-lg border p-4">
                  <h4 className="font-medium">ROI Estimado</h4>
                  <div className="mt-2 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-600" />
                    <span className="text-2xl font-bold text-green-600">3.2x</span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Para cada R$ 1 investido em cashback, estimamos R$ 3,20 de retorno em lifetime value.
                  </p>
                </div>

                <div className="rounded-lg bg-primary/10 p-4">
                  <h4 className="font-medium">Projeção Anual</h4>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Com base no crescimento atual, projetamos distribuir <strong>R$ 2.8M</strong> em cashback no
                    próximo ano, gerando aproximadamente <strong>R$ 8.9M</strong> em valor retido.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// =============================================================================
// COMPONENTES AUXILIARES
// =============================================================================

interface MetricCardProps {
  title: string;
  value: string;
  suffix?: string;
  description: string;
  icon: React.ElementType;
  trend?: { value: number; isPositive: boolean };
}

function MetricCard({ title, value, suffix, description, icon: Icon, trend }: MetricCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold">{value}</span>
          {suffix && <span className="text-sm text-muted-foreground">{suffix}</span>}
        </div>
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">{description}</p>
          {trend && (
            <div className={`flex items-center text-xs ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {trend.isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              <span>{trend.value}%</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default CashbackAnalytics;
