// ============================================
// ROTA /admin/ads - Engine de Anúncios
// CONECTADO A DADOS REAIS - ZERO MOCKS
// ============================================

import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Megaphone,
  DollarSign,
  Eye,
  MousePointer,
  Target,
  Plus,
  RefreshCw,
  AlertCircle,
  Facebook,
  Instagram,
} from "lucide-react";
import { useAgencyCampaigns, type Campaign } from "@/hooks/use-agency-campaigns";

export const Route = createFileRoute("/admin/ads")({
  component: AdsPage,
});

// ============================================
// STATUS CONFIG
// ============================================
const statusConfig: Record<string, { label: string; color: string }> = {
  ACTIVE: { label: "Ativa", color: "bg-green-600" },
  PAUSED: { label: "Pausada", color: "bg-yellow-600" },
  COMPLETED: { label: "Finalizada", color: "bg-zinc-600" },
  DRAFT: { label: "Rascunho", color: "bg-blue-600" },
};

const platformConfig: Record<string, { icon: React.ElementType; bgColor: string }> = {
  facebook: { icon: Facebook, bgColor: "bg-blue-600" },
  instagram: { icon: Instagram, bgColor: "bg-gradient-to-tr from-purple-600 to-pink-500" },
  google: { icon: Target, bgColor: "bg-red-600" },
  tiktok: { icon: Target, bgColor: "bg-black" },
};

// ============================================
// EMPTY STATE COMPONENT
// ============================================
function EmptyState() {
  return (
    <div className="text-center py-16">
      <Megaphone className="h-16 w-16 mx-auto text-zinc-600 mb-4" />
      <h3 className="text-lg font-medium text-zinc-300 mb-2">
        Nenhuma campanha cadastrada
      </h3>
      <p className="text-zinc-500 max-w-sm mx-auto mb-6">
        Crie sua primeira campanha para começar a divulgar seus imóveis nas redes sociais.
      </p>
      <Button className="bg-orange-600 hover:bg-orange-700">
        <Plus className="h-4 w-4 mr-2" />
        Criar Primeira Campanha
      </Button>
    </div>
  );
}

// ============================================
// LOADING SKELETON
// ============================================
function CampaignsSkeleton() {
  return (
    <div className="space-y-4 p-6">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center justify-between p-4 bg-zinc-800 rounded-lg animate-pulse">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 bg-zinc-700 rounded-lg" />
            <div className="space-y-2">
              <div className="h-4 w-48 bg-zinc-700 rounded" />
              <div className="h-3 w-32 bg-zinc-700 rounded" />
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="h-4 w-20 bg-zinc-700 rounded" />
            <div className="h-4 w-16 bg-zinc-700 rounded" />
            <div className="h-6 w-16 bg-zinc-700 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================
function AdsPage() {
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Busca dados reais da API
  const { data, isLoading, isError, error, refetch } = useAgencyCampaigns({
    status: statusFilter,
  });

  const campaigns = data?.campaigns || [];
  const stats = data?.stats;

  // Calcula dias desde o início da campanha
  const getDaysSinceStart = (startDate: string) => {
    const start = new Date(startDate);
    const now = new Date();
    const diff = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  return (
    <AdminLayout userName="Administrador">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Megaphone className="h-6 w-6 text-orange-500" />
              Engine de Anúncios
            </h1>
            <p className="text-zinc-400 mt-1">
              Gerencie campanhas de Facebook Ads, Google Ads e Instagram
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => refetch()}
              disabled={isLoading}
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
            <Button className="bg-orange-600 hover:bg-orange-700">
              <Plus className="h-4 w-4 mr-2" />
              Nova Campanha
            </Button>
          </div>
        </div>

        {/* KPI Cards - Dados Reais */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-2">
              <CardDescription className="text-zinc-400">Investido (Mês)</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-8 w-20 bg-zinc-800 animate-pulse rounded" />
              ) : (
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-white">
                    R$ {(stats?.totalInvested || 0).toLocaleString('pt-BR')}
                  </span>
                  <DollarSign className="h-8 w-8 text-green-500 opacity-50" />
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-2">
              <CardDescription className="text-zinc-400">Impressões</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-8 w-20 bg-zinc-800 animate-pulse rounded" />
              ) : (
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-white">
                    {stats?.totalImpressions ? (stats.totalImpressions / 1000).toFixed(1) + 'K' : '0'}
                  </span>
                  <Eye className="h-8 w-8 text-blue-500 opacity-50" />
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-2">
              <CardDescription className="text-zinc-400">Cliques</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-8 w-20 bg-zinc-800 animate-pulse rounded" />
              ) : (
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-white">
                    {stats?.totalClicks ? (stats.totalClicks / 1000).toFixed(1) + 'K' : '0'}
                  </span>
                  <MousePointer className="h-8 w-8 text-purple-500 opacity-50" />
                </div>
              )}
              {!isLoading && stats?.avgCtr !== undefined && (
                <p className="text-xs text-purple-400 mt-1">CTR: {stats.avgCtr.toFixed(1)}%</p>
              )}
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-2">
              <CardDescription className="text-zinc-400">Leads Gerados</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-8 w-20 bg-zinc-800 animate-pulse rounded" />
              ) : (
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-white">{stats?.totalLeads || 0}</span>
                  <Target className="h-8 w-8 text-orange-500 opacity-50" />
                </div>
              )}
              {!isLoading && stats?.avgCpl !== undefined && (
                <p className="text-xs text-orange-400 mt-1">CPL: R$ {stats.avgCpl.toFixed(2)}</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Error State */}
        {isError && (
          <Card className="bg-red-900/20 border-red-800">
            <CardContent className="p-4 flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <div className="flex-1">
                <p className="text-red-300 font-medium">Erro ao carregar campanhas</p>
                <p className="text-red-400/70 text-sm">{error?.message || 'Tente novamente'}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                className="border-red-700 text-red-400 hover:bg-red-900/30"
              >
                Tentar Novamente
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Tabs & Campaigns List */}
        <Tabs value={statusFilter} onValueChange={setStatusFilter} className="space-y-4">
          <TabsList className="bg-zinc-800 border-zinc-700">
            <TabsTrigger value="all">Todas</TabsTrigger>
            <TabsTrigger value="active">Ativas</TabsTrigger>
            <TabsTrigger value="paused">Pausadas</TabsTrigger>
            <TabsTrigger value="completed">Finalizadas</TabsTrigger>
          </TabsList>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-white">Campanhas</CardTitle>
              <CardDescription>
                {campaigns.length > 0
                  ? `${campaigns.length} campanha${campaigns.length > 1 ? 's' : ''} encontrada${campaigns.length > 1 ? 's' : ''}`
                  : 'Nenhuma campanha encontrada'}
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <CampaignsSkeleton />
              ) : campaigns.length === 0 ? (
                <EmptyState />
              ) : (
                <div className="space-y-4 p-6">
                  {campaigns.map((campaign: Campaign) => {
                    const platform = platformConfig[campaign.platform] || platformConfig.facebook;
                    const status = statusConfig[campaign.status] || statusConfig.DRAFT;
                    const PlatformIcon = platform.icon;
                    const daysSinceStart = getDaysSinceStart(campaign.startDate);

                    return (
                      <div
                        key={campaign.id}
                        className="flex items-center justify-between p-4 bg-zinc-800 rounded-lg hover:bg-zinc-800/80 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`p-2 ${platform.bgColor} rounded-lg`}>
                            <PlatformIcon className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <h4 className="font-medium text-white">{campaign.name}</h4>
                            <p className="text-sm text-zinc-400">
                              {campaign.platform.charAt(0).toUpperCase() + campaign.platform.slice(1)} Ads
                              {daysSinceStart > 0 && ` • Iniciada há ${daysSinceStart} dias`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <div className="text-right">
                            <p className="text-sm text-zinc-400">Gasto</p>
                            <p className="font-medium text-white">R$ {campaign.spent.toLocaleString('pt-BR')}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-zinc-400">Leads</p>
                            <p className="font-medium text-green-400">{campaign.leads}</p>
                          </div>
                          <Badge className={status.color}>{status.label}</Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
