// ============================================
// AGENCY OS - Dashboard Principal do ERP de Imobiliárias
// CONECTADO A DADOS REAIS - ZERO MOCKS
// ============================================

import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { AgencyLayout } from '@/components/layouts/AgencyLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useAgencyDashboard, type RecentActivity } from '@/hooks/use-agency-dashboard';
import {
  Home,
  FileText,
  Users,
  Plus,
  Eye,
  DollarSign,
  ArrowUpRight,
  Wallet,
  Calculator,
  PiggyBank,
  BarChart3,
  Clock,
  CheckCircle,
  AlertTriangle,
  ChevronRight,
  Percent,
  ExternalLink,
  AlertCircle,
  Building2,
} from 'lucide-react';
import { toast } from 'sonner';

export const Route = createFileRoute('/agency/dashboard/' as never)({
  component: AgencyDashboardPage,
});

// ============================================
// SKELETON COMPONENTS
// ============================================
function KPICardSkeleton() {
  return (
    <Card className="bg-gradient-to-br from-zinc-900 to-zinc-800 border-zinc-700">
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-3">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <Skeleton className="h-5 w-16 rounded" />
        </div>
        <Skeleton className="h-8 w-24 mb-2" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-40 mt-2" />
      </CardContent>
    </Card>
  );
}

function ActivitySkeleton() {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-zinc-800/30">
      <Skeleton className="h-10 w-10 rounded-lg" />
      <div className="flex-1">
        <Skeleton className="h-4 w-32 mb-2" />
        <Skeleton className="h-3 w-48" />
      </div>
      <Skeleton className="h-3 w-16" />
    </div>
  );
}

// ============================================
// EMPTY STATE COMPONENT
// ============================================
function EmptyDashboard() {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="p-6 rounded-full bg-zinc-800/50 mb-6">
        <Building2 className="h-16 w-16 text-zinc-500" />
      </div>
      <h2 className="text-2xl font-bold text-zinc-100 mb-2">
        Bem-vindo ao AgencyOS!
      </h2>
      <p className="text-zinc-400 text-center max-w-md mb-6">
        Comece cadastrando seu primeiro imóvel para visualizar suas métricas e acompanhar sua carteira.
      </p>
      <Button
        className="bg-emerald-600 hover:bg-emerald-700 text-white"
        onClick={() => window.location.href = '/agency/properties/new'}
      >
        <Plus className="h-4 w-4 mr-2" />
        Cadastrar Primeiro Imóvel
      </Button>
    </div>
  );
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
function AgencyDashboardPage() {
  const [userName, setUserName] = useState('Usuário');
  const [userEmail, setUserEmail] = useState('usuario@email.com');

  // Busca dados reais do dashboard
  const { data, isLoading, isError, error } = useAgencyDashboard();

  // Carrega dados do usuário do localStorage
  useEffect(() => {
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        setUserName(user.name || 'Usuário');
        setUserEmail(user.email || 'usuario@email.com');
      }
    } catch {
      // Ignora erros de parse
    }
  }, []);

  // Mostra toast de erro
  useEffect(() => {
    if (isError && error) {
      toast.error('Erro ao carregar dashboard', {
        description: error.message,
      });
    }
  }, [isError, error]);

  // Dados do dashboard (ou valores padrão se ainda carregando)
  const agency = data?.agency || {
    id: '',
    name: 'Carregando...',
    slug: '',
    logoUrl: null,
    primaryColor: '#10B981',
    commissionRate: 0,
    commissionModel: 'DEDUCT_FROM_OWNER' as const,
  };

  const kpis = data?.kpis || {
    totalPortfolioValue: 0,
    activeProperties: 0,
    activeContracts: 0,
    expectedMonthlyCommission: 0,
    collectedThisMonth: 0,
    pendingCollection: 0,
    ownerPayoutsPending: 0,
    overdueContracts: 0,
  };

  const recentActivity = data?.recentActivity || [];

  // Calcula progresso de coleta do mês
  const collectionProgress = kpis.expectedMonthlyCommission > 0
    ? (kpis.collectedThisMonth / kpis.expectedMonthlyCommission) * 100
    : 0;

  // Se não há dados e terminou de carregar, mostra empty state
  const showEmptyState = !isLoading && !isError && kpis.activeProperties === 0;

  return (
    <AgencyLayout
      agencyName={agency.name}
      agencyLogo={agency.logoUrl || undefined}
      userName={userName}
      userEmail={userEmail}
    >
      <div className="p-6 space-y-6">
        {/* ============================================ */}
        {/* HEADER COM BOAS VINDAS */}
        {/* ============================================ */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-zinc-100">
              Bem-vindo ao AgencyOS
            </h1>
            <p className="text-zinc-400 mt-1">
              Gerencie sua carteira de imóveis e acompanhe suas comissões em tempo real.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {agency.slug && (
              <Button
                variant="outline"
                className="border-zinc-700 bg-zinc-800/50 text-zinc-300 hover:bg-zinc-700"
                onClick={() => window.open(`/imob/${agency.slug}`, '_blank')}
              >
                <Eye className="h-4 w-4 mr-2" />
                Ver Meu Site
              </Button>
            )}
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={() => window.location.href = '/agency/properties/new'}
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Imóvel
            </Button>
          </div>
        </div>

        {/* ============================================ */}
        {/* ERROR STATE */}
        {/* ============================================ */}
        {isError && (
          <Card className="bg-red-900/20 border-red-800">
            <CardContent className="p-6 flex items-center gap-4">
              <AlertCircle className="h-8 w-8 text-red-400" />
              <div>
                <h3 className="font-bold text-red-400">Erro ao carregar dados</h3>
                <p className="text-sm text-red-300">{error?.message || 'Tente novamente mais tarde.'}</p>
              </div>
              <Button
                variant="outline"
                className="ml-auto border-red-500 text-red-400 hover:bg-red-500/20"
                onClick={() => window.location.reload()}
              >
                Tentar Novamente
              </Button>
            </CardContent>
          </Card>
        )}

        {/* ============================================ */}
        {/* EMPTY STATE */}
        {/* ============================================ */}
        {showEmptyState && <EmptyDashboard />}

        {/* ============================================ */}
        {/* KPIs PRINCIPAIS - FINANCEIRO */}
        {/* ============================================ */}
        {!showEmptyState && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {isLoading ? (
                <>
                  <KPICardSkeleton />
                  <KPICardSkeleton />
                  <KPICardSkeleton />
                  <KPICardSkeleton />
                </>
              ) : (
                <>
                  {/* Carteira Total (Valor Sob Gestão) */}
                  <Card className="bg-gradient-to-br from-zinc-900 to-zinc-800 border-zinc-700">
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between mb-3">
                        <div className="p-2.5 rounded-lg bg-emerald-500/10">
                          <Wallet className="h-5 w-5 text-emerald-400" />
                        </div>
                        <Badge variant="outline" className="border-emerald-500/30 text-emerald-400 text-xs">
                          <ArrowUpRight className="h-3 w-3 mr-1" />
                          Ativo
                        </Badge>
                      </div>
                      <p className="text-2xl font-bold text-zinc-100">
                        R$ {(kpis.totalPortfolioValue / 1000).toFixed(1)}k
                      </p>
                      <p className="text-sm text-zinc-500 mt-1">Carteira Mensal</p>
                      <p className="text-xs text-zinc-600 mt-2">Valor total de aluguéis sob gestão</p>
                    </CardContent>
                  </Card>

                  {/* Imóveis Ativos */}
                  <Card className="bg-gradient-to-br from-zinc-900 to-zinc-800 border-zinc-700">
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between mb-3">
                        <div className="p-2.5 rounded-lg bg-blue-500/10">
                          <Home className="h-5 w-5 text-blue-400" />
                        </div>
                        <Badge variant="outline" className="border-blue-500/30 text-blue-400 text-xs">
                          {kpis.activeContracts} alugados
                        </Badge>
                      </div>
                      <p className="text-2xl font-bold text-zinc-100">
                        {kpis.activeProperties}
                      </p>
                      <p className="text-sm text-zinc-500 mt-1">Imóveis Ativos</p>
                      <p className="text-xs text-zinc-600 mt-2">
                        {kpis.activeProperties > 0
                          ? `${Math.round((kpis.activeContracts / kpis.activeProperties) * 100)}% de ocupação`
                          : 'Sem imóveis cadastrados'}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Receita Prevista (Comissões) */}
                  <Card className="bg-gradient-to-br from-zinc-900 to-zinc-800 border-zinc-700">
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between mb-3">
                        <div className="p-2.5 rounded-lg bg-amber-500/10">
                          <PiggyBank className="h-5 w-5 text-amber-400" />
                        </div>
                        <Badge variant="outline" className="border-amber-500/30 text-amber-400 text-xs">
                          <Percent className="h-3 w-3 mr-1" />
                          {agency.commissionRate}%
                        </Badge>
                      </div>
                      <p className="text-2xl font-bold text-zinc-100">
                        R$ {(kpis.expectedMonthlyCommission / 1000).toFixed(1)}k
                      </p>
                      <p className="text-sm text-zinc-500 mt-1">Comissão Prevista</p>
                      <p className="text-xs text-zinc-600 mt-2">
                        {agency.commissionModel === 'DEDUCT_FROM_OWNER'
                          ? 'Descontado do proprietário'
                          : 'Adicionado ao aluguel'}
                      </p>
                    </CardContent>
                  </Card>

                  {/* Inadimplência */}
                  <Card className="bg-gradient-to-br from-zinc-900 to-zinc-800 border-zinc-700">
                    <CardContent className="p-5">
                      <div className="flex items-center justify-between mb-3">
                        <div className="p-2.5 rounded-lg bg-red-500/10">
                          <AlertTriangle className="h-5 w-5 text-red-400" />
                        </div>
                        {kpis.overdueContracts > 0 ? (
                          <Badge variant="destructive" className="text-xs">
                            Atenção
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="border-green-500/30 text-green-400 text-xs">
                            OK
                          </Badge>
                        )}
                      </div>
                      <p className="text-2xl font-bold text-zinc-100">
                        {kpis.overdueContracts}
                      </p>
                      <p className="text-sm text-zinc-500 mt-1">Contratos Atrasados</p>
                      <p className="text-xs text-zinc-600 mt-2">
                        {kpis.overdueContracts > 0 ? 'Requer ação imediata' : 'Nenhuma pendência'}
                      </p>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>

            {/* ============================================ */}
            {/* PROGRESSO DE COLETA DO MÊS */}
            {/* ============================================ */}
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-zinc-100">Coleta do Mês</CardTitle>
                    <CardDescription className="text-zinc-500">
                      Acompanhe o recebimento das suas comissões
                    </CardDescription>
                  </div>
                  <Button variant="ghost" className="text-zinc-400 hover:text-zinc-100">
                    Ver Detalhes
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {isLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-3 w-full" />
                    <div className="grid grid-cols-3 gap-4">
                      <Skeleton className="h-20 w-full rounded-lg" />
                      <Skeleton className="h-20 w-full rounded-lg" />
                      <Skeleton className="h-20 w-full rounded-lg" />
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Barra de Progresso */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-zinc-400">Progresso</span>
                        <span className="text-zinc-100 font-medium">{collectionProgress.toFixed(0)}%</span>
                      </div>
                      <Progress value={collectionProgress} className="h-3 bg-zinc-800" />
                    </div>

                    {/* Detalhes */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                      <div className="p-4 rounded-lg bg-zinc-800/50 border border-zinc-700">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="h-4 w-4 text-emerald-400" />
                          <span className="text-sm text-zinc-400">Recebido</span>
                        </div>
                        <p className="text-xl font-bold text-emerald-400">
                          R$ {kpis.collectedThisMonth.toLocaleString('pt-BR')}
                        </p>
                      </div>

                      <div className="p-4 rounded-lg bg-zinc-800/50 border border-zinc-700">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="h-4 w-4 text-amber-400" />
                          <span className="text-sm text-zinc-400">A Receber</span>
                        </div>
                        <p className="text-xl font-bold text-amber-400">
                          R$ {kpis.pendingCollection.toLocaleString('pt-BR')}
                        </p>
                      </div>

                      <div className="p-4 rounded-lg bg-zinc-800/50 border border-zinc-700">
                        <div className="flex items-center gap-2 mb-2">
                          <DollarSign className="h-4 w-4 text-blue-400" />
                          <span className="text-sm text-zinc-400">Repasses Pendentes</span>
                        </div>
                        <p className="text-xl font-bold text-blue-400">
                          R$ {(kpis.ownerPayoutsPending / 1000).toFixed(1)}k
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* ============================================ */}
            {/* GRID INFERIOR */}
            {/* ============================================ */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Atividade Recente */}
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-zinc-100">Atividade Recente</CardTitle>
                    <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-zinc-100">
                      Ver Todas
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-4">
                      <ActivitySkeleton />
                      <ActivitySkeleton />
                      <ActivitySkeleton />
                      <ActivitySkeleton />
                    </div>
                  ) : recentActivity.length === 0 ? (
                    <div className="text-center py-8">
                      <Clock className="h-12 w-12 mx-auto text-zinc-600 mb-3" />
                      <p className="text-zinc-500">Nenhuma atividade recente</p>
                      <p className="text-xs text-zinc-600 mt-1">
                        As atividades aparecerão aqui conforme você usar o sistema
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {recentActivity.map((activity: RecentActivity) => (
                        <div
                          key={activity.id}
                          className="flex items-start gap-3 p-3 rounded-lg bg-zinc-800/30 hover:bg-zinc-800/50 transition-colors"
                        >
                          <div
                            className={`p-2 rounded-lg ${
                              activity.status === 'success'
                                ? 'bg-emerald-500/10'
                                : activity.status === 'warning'
                                  ? 'bg-amber-500/10'
                                  : 'bg-blue-500/10'
                            }`}
                          >
                            {activity.type === 'payment' && (
                              <DollarSign
                                className={`h-4 w-4 ${
                                  activity.status === 'success'
                                    ? 'text-emerald-400'
                                    : activity.status === 'warning'
                                      ? 'text-amber-400'
                                      : 'text-blue-400'
                                }`}
                              />
                            )}
                            {activity.type === 'contract' && <FileText className="h-4 w-4 text-emerald-400" />}
                            {activity.type === 'lead' && <Users className="h-4 w-4 text-blue-400" />}
                            {activity.type === 'property' && <Home className="h-4 w-4 text-blue-400" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-zinc-200">{activity.title}</p>
                            <p className="text-xs text-zinc-500 truncate">{activity.description}</p>
                          </div>
                          <span className="text-xs text-zinc-600 whitespace-nowrap">{activity.timestamp}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Ações Rápidas */}
              <Card className="bg-zinc-900 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-zinc-100">Ações Rápidas</CardTitle>
                  <CardDescription className="text-zinc-500">
                    Atalhos para as tarefas mais comuns
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      variant="outline"
                      className="h-auto py-6 flex-col gap-2 border-zinc-700 bg-zinc-800/30 hover:bg-zinc-800 hover:border-emerald-500/50 text-zinc-300"
                      onClick={() => (window.location.href = '/agency/properties/new')}
                    >
                      <Plus className="h-6 w-6 text-emerald-400" />
                      <span className="text-sm">Cadastrar Imóvel</span>
                    </Button>

                    <Button
                      variant="outline"
                      className="h-auto py-6 flex-col gap-2 border-zinc-700 bg-zinc-800/30 hover:bg-zinc-800 hover:border-blue-500/50 text-zinc-300"
                      onClick={() => (window.location.href = '/agency/owners')}
                    >
                      <Users className="h-6 w-6 text-blue-400" />
                      <span className="text-sm">Proprietários</span>
                    </Button>

                    <Button
                      variant="outline"
                      className="h-auto py-6 flex-col gap-2 border-zinc-700 bg-zinc-800/30 hover:bg-zinc-800 hover:border-amber-500/50 text-zinc-300"
                      onClick={() => (window.location.href = '/agency/split-calculator')}
                    >
                      <Calculator className="h-6 w-6 text-amber-400" />
                      <span className="text-sm">Calculadora Split</span>
                    </Button>

                    <Button
                      variant="outline"
                      className="h-auto py-6 flex-col gap-2 border-zinc-700 bg-zinc-800/30 hover:bg-zinc-800 hover:border-purple-500/50 text-zinc-300"
                      onClick={() => agency.slug && window.open(`/imob/${agency.slug}`, '_blank')}
                      disabled={!agency.slug}
                    >
                      <ExternalLink className="h-6 w-6 text-purple-400" />
                      <span className="text-sm">Ver Meu Site</span>
                    </Button>
                  </div>

                  {/* Split Info Card */}
                  <div className="mt-4 p-4 rounded-lg bg-gradient-to-r from-emerald-500/10 to-teal-500/5 border border-emerald-500/20">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-emerald-500/20">
                        <BarChart3 className="h-5 w-5 text-emerald-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-zinc-100">Modelo de Comissão</p>
                        <p className="text-xs text-zinc-400">
                          {agency.commissionModel === 'DEDUCT_FROM_OWNER'
                            ? `${agency.commissionRate}% descontado do valor do proprietário`
                            : `${agency.commissionRate}% adicionado ao valor do aluguel`}
                        </p>
                      </div>
                      <Button size="sm" variant="ghost" className="text-emerald-400 hover:text-emerald-300">
                        Alterar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </AgencyLayout>
  );
}
