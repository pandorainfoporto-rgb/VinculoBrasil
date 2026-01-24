// ============================================
// AGENCY OS - Gestor de Anuncios
// Marketplace de publicidade para imoveis
// ============================================

import { createFileRoute } from '@tanstack/react-router';
import { AgencyLayout } from '@/components/layouts/AgencyLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Megaphone,
  Rocket,
  Star,
  Zap,
  TrendingUp,
  Eye,
  MousePointer,
  Clock,
  CheckCircle,
  Home,
  Target,
  BarChart3,
  Crown,
} from 'lucide-react';
import { useState } from 'react';

export const Route = createFileRoute('/agency/ads' as never)({
  component: AgencyAdsPage,
});

// Mock de campanhas ativas
const MOCK_CAMPAIGNS = [
  {
    id: '1',
    property: 'Apartamento 302 - Ed. Solar',
    plan: 'Super Premium',
    startDate: '2024-01-10',
    endDate: '2024-02-10',
    views: 1234,
    clicks: 89,
    status: 'ACTIVE',
  },
  {
    id: '2',
    property: 'Casa Jardim Europa',
    plan: 'Destaque Basico',
    startDate: '2024-01-15',
    endDate: '2024-02-15',
    views: 567,
    clicks: 34,
    status: 'ACTIVE',
  },
];

// Planos de anuncio
const AD_PLANS = [
  {
    id: 'basic',
    name: 'Destaque Basico',
    price: 99,
    period: 'mes',
    icon: Star,
    color: 'blue',
    features: [
      'Selo de destaque na listagem',
      'Prioridade nas buscas',
      'Badge "Destaque" no imovel',
    ],
    recommended: false,
  },
  {
    id: 'premium',
    name: 'Super Premium',
    price: 199,
    period: 'mes',
    icon: Rocket,
    color: 'purple',
    features: [
      'Tudo do plano Basico',
      'Posicao no topo da lista',
      'Destaque no portal Vinculo',
      'Relatorio de performance',
    ],
    recommended: true,
  },
  {
    id: 'boost',
    name: 'Boost 24h',
    price: 29,
    period: 'dia',
    icon: Zap,
    color: 'orange',
    features: [
      'Destaque imediato',
      'Push notification para interessados',
      'Ideal para urgencia',
    ],
    recommended: false,
  },
];

function AgencyAdsPage() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('pt-BR');

  // KPIs
  const totalViews = MOCK_CAMPAIGNS.reduce((sum, c) => sum + c.views, 0);
  const totalClicks = MOCK_CAMPAIGNS.reduce((sum, c) => sum + c.clicks, 0);
  const avgCTR = totalViews > 0 ? ((totalClicks / totalViews) * 100).toFixed(1) : 0;

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue':
        return {
          bg: 'bg-blue-500/10',
          text: 'text-blue-400',
          border: 'border-blue-500/30',
          ring: 'ring-blue-500',
        };
      case 'purple':
        return {
          bg: 'bg-purple-500/10',
          text: 'text-purple-400',
          border: 'border-purple-500/30',
          ring: 'ring-purple-500',
        };
      case 'orange':
        return {
          bg: 'bg-orange-500/10',
          text: 'text-orange-400',
          border: 'border-orange-500/30',
          ring: 'ring-orange-500',
        };
      default:
        return {
          bg: 'bg-zinc-500/10',
          text: 'text-zinc-400',
          border: 'border-zinc-500/30',
          ring: 'ring-zinc-500',
        };
    }
  };

  return (
    <AgencyLayout agencyName="Minha Imobiliaria" userName="Usuario" userEmail="usuario@email.com">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
            <Megaphone className="h-6 w-6 text-orange-400" />
            Gestor de Anuncios
          </h1>
          <p className="text-zinc-400 mt-1">
            Destaque seus imoveis no portal Vinculo e parceiros
          </p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-zinc-500">Campanhas Ativas</p>
                  <p className="text-2xl font-bold text-zinc-100">{MOCK_CAMPAIGNS.length}</p>
                </div>
                <Target className="h-8 w-8 text-orange-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-zinc-500">Visualizacoes</p>
                  <p className="text-2xl font-bold text-blue-400">{totalViews.toLocaleString()}</p>
                </div>
                <Eye className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-zinc-500">Cliques</p>
                  <p className="text-2xl font-bold text-emerald-400">{totalClicks}</p>
                </div>
                <MousePointer className="h-8 w-8 text-emerald-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-zinc-500">CTR Medio</p>
                  <p className="text-2xl font-bold text-purple-400">{avgCTR}%</p>
                </div>
                <BarChart3 className="h-8 w-8 text-purple-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Planos de Anuncio */}
        <div>
          <h2 className="text-lg font-semibold text-zinc-100 mb-4">Planos de Destaque</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {AD_PLANS.map((plan) => {
              const colors = getColorClasses(plan.color);
              const Icon = plan.icon;

              return (
                <Card
                  key={plan.id}
                  className={`bg-zinc-900 relative overflow-hidden transition-all ${
                    plan.recommended
                      ? `border-2 ${colors.border} ring-1 ${colors.ring}`
                      : 'border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  {plan.recommended && (
                    <div className="absolute top-0 right-0 bg-purple-600 text-white text-xs px-3 py-1 rounded-bl-lg">
                      <Crown className="h-3 w-3 inline mr-1" />
                      Recomendado
                    </div>
                  )}
                  <CardContent className="p-6">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 ${colors.bg}`}>
                      <Icon className={`h-7 w-7 ${colors.text}`} />
                    </div>
                    <h3 className="text-xl font-bold text-zinc-100">{plan.name}</h3>
                    <div className="mt-3">
                      <span className="text-3xl font-bold text-zinc-100">{formatCurrency(plan.price)}</span>
                      <span className="text-zinc-500">/{plan.period}</span>
                    </div>
                    <ul className="mt-6 space-y-3">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-zinc-400">
                          <CheckCircle className={`h-4 w-4 mt-0.5 ${colors.text}`} />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Button
                      className={`w-full mt-6 ${
                        plan.recommended
                          ? 'bg-purple-600 hover:bg-purple-700'
                          : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-100'
                      }`}
                      onClick={() => setSelectedPlan(plan.id)}
                    >
                      Contratar
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Campanhas Ativas */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-zinc-100">Campanhas Ativas</CardTitle>
            <CardDescription className="text-zinc-500">
              Imoveis com destaque contratado
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-zinc-800">
              {MOCK_CAMPAIGNS.map((campaign) => (
                <div key={campaign.id} className="px-6 py-4 hover:bg-zinc-800/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                        <Home className="h-6 w-6 text-blue-400" />
                      </div>
                      <div>
                        <p className="font-medium text-zinc-100">{campaign.property}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="border-purple-500/30 text-purple-400 text-xs">
                            {campaign.plan}
                          </Badge>
                          <span className="text-xs text-zinc-600">
                            {formatDate(campaign.startDate)} - {formatDate(campaign.endDate)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <p className="text-lg font-bold text-blue-400">{campaign.views}</p>
                        <p className="text-xs text-zinc-500">Views</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-emerald-400">{campaign.clicks}</p>
                        <p className="text-xs text-zinc-500">Cliques</p>
                      </div>
                      <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Ativo
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}

              {MOCK_CAMPAIGNS.length === 0 && (
                <div className="px-6 py-12 text-center">
                  <Megaphone className="h-12 w-12 text-zinc-700 mx-auto mb-3" />
                  <p className="text-zinc-500">Nenhuma campanha ativa</p>
                  <p className="text-sm text-zinc-600 mt-1">
                    Contrate um plano para destacar seus imoveis
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AgencyLayout>
  );
}
