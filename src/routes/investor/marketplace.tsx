// ============================================
// INVESTOR MARKETPLACE - P2P Listings
// Página de marketplace para investidores
// CONECTADO COM API REAL + DASHBOARD DE DIVIDENDOS
// ============================================

import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { useInvest } from '@/hooks/useInvest';
import { TermoModal } from '@/components/legal/TermoModal';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { DashboardSkeleton } from '@/components/ui/loading-skeleton';
import { useInvestorDashboard, useInvestorDividends, type InvestorAsset } from '@/hooks/use-api';
import { useP2PListings } from '@/hooks/use-p2p-marketplace';
import {
  Building2,
  TrendingUp,
  Clock,
  MapPin,
  Copy,
  Check,
  QrCode,
  ArrowRight,
  Shield,
  Wallet,
  PieChart,
  DollarSign,
  Calendar,
  BarChart3,
  CheckCircle,
  AlertTriangle,
  TrendingDown,
  Briefcase,
} from 'lucide-react';

export const Route = createFileRoute('/investor/marketplace')({
  component: InvestorMarketplace,
});

// ============================================
// HELPER FUNCTIONS
// ============================================

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('pt-BR');
}

function formatPercent(value: number): string {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
}

// ============================================
// DIVIDENDS CHART COMPONENT
// ============================================

interface DividendsChartProps {
  dividends: { month: string; expected: number; received: number }[];
}

function DividendsChart({ dividends }: DividendsChartProps) {
  const maxValue = Math.max(...dividends.flatMap((d) => [d.expected, d.received]), 1);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500" />
          <span className="text-gray-600 dark:text-gray-400">Esperado</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-emerald-500" />
          <span className="text-gray-600 dark:text-gray-400">Recebido</span>
        </div>
      </div>
      <div className="space-y-3">
        {dividends.map((item) => (
          <div key={item.month} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-gray-700 dark:text-gray-300 font-medium">{item.month}</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                {formatCurrency(item.received)} / {formatCurrency(item.expected)}
              </span>
            </div>
            <div className="relative h-6 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              {/* Expected bar (background) */}
              <div
                className="absolute inset-y-0 left-0 bg-blue-200 dark:bg-blue-900/50 rounded-full"
                style={{ width: `${(item.expected / maxValue) * 100}%` }}
              />
              {/* Received bar (foreground) */}
              <div
                className="absolute inset-y-0 left-0 bg-emerald-500 dark:bg-emerald-600 rounded-full transition-all duration-500"
                style={{ width: `${(item.received / maxValue) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================
// PORTFOLIO ASSET CARD
// ============================================

interface AssetCardProps {
  asset: InvestorAsset;
}

function AssetCard({ asset }: AssetCardProps) {
  const roi = ((asset.currentValue - asset.investedAmount) / asset.investedAmount) * 100;
  const isPositive = roi >= 0;

  return (
    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
      <CardContent className="p-5">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white truncate">
                {asset.propertyTitle}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-1">
                <MapPin className="w-3 h-3" />
                {asset.propertyAddress}
              </p>
            </div>
            <Badge
              className={
                asset.status === 'ACTIVE'
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                  : asset.status === 'MATURED'
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
              }
            >
              {asset.status === 'ACTIVE' && <CheckCircle className="w-3 h-3 mr-1" />}
              {asset.status === 'MATURED' && <CheckCircle className="w-3 h-3 mr-1" />}
              {asset.status === 'DEFAULTED' && <AlertTriangle className="w-3 h-3 mr-1" />}
              {asset.status === 'ACTIVE' ? 'Ativo' : asset.status === 'MATURED' ? 'Vencido' : 'Inadimplente'}
            </Badge>
          </div>

          {/* Values Grid */}
          <div className="grid grid-cols-2 gap-3 py-3 border-y border-gray-100 dark:border-gray-700">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Investido</p>
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {formatCurrency(asset.investedAmount)}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Valor Atual</p>
              <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                {formatCurrency(asset.currentValue)}
              </p>
            </div>
          </div>

          {/* ROI and Dates */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isPositive ? (
                <TrendingUp className="w-4 h-4 text-emerald-500" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500" />
              )}
              <span
                className={`text-sm font-bold ${
                  isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                }`}
              >
                {formatPercent(roi)} ROI
              </span>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Vence: {formatDate(asset.maturityDate)}
            </div>
          </div>

          {/* Next Payment */}
          {asset.nextPaymentDate && asset.nextPaymentAmount && (
            <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-500" />
                  <span className="text-sm text-blue-700 dark:text-blue-300">Próximo Dividendo</span>
                </div>
                <span className="text-sm font-bold text-blue-900 dark:text-blue-100">
                  {formatCurrency(asset.nextPaymentAmount)}
                </span>
              </div>
              <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                Previsão: {formatDate(asset.nextPaymentDate)}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

// Interface para listing selecionado
interface SelectedListing {
  id: string;
  title: string;
  askingPrice: number;
  faceValue: number;
  monthlyValue: number;
  discountPercent: number;
  monthsRemaining: number;
  city: string;
  state: string;
  tenantScore: number | null;
}

function InvestorMarketplace() {
  const { data, isLoading, error: dashboardError } = useInvestorDashboard();
  const { data: dividendsData } = useInvestorDividends();
  const { data: listingsData, isLoading: listingsLoading } = useP2PListings();

  const [selectedListing, setSelectedListing] = useState<SelectedListing | null>(null);
  const [showTermo, setShowTermo] = useState(false);
  const [copied, setCopied] = useState(false);

  const { createOrder, loading, pixData, error, resetPixData } = useInvest();

  // Dados reais do marketplace
  const listings = listingsData?.listings || [];

  // 1. Usuário clica em "Investir Agora"
  const handleStartInvest = (listing: SelectedListing) => {
    setSelectedListing(listing);
    setShowTermo(true);
  };

  // 2. Usuário aceita o termo -> Chama API
  const handleTermoAccepted = async () => {
    setShowTermo(false);
    if (selectedListing) {
      await createOrder(selectedListing.id);
    }
  };

  // 3. Copiar código Pix
  const copyToClipboard = () => {
    if (pixData?.copyPaste) {
      navigator.clipboard.writeText(pixData.copyPaste);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    }
  };

  // 4. Voltar para a lista
  const handleBackToList = () => {
    resetPixData();
    setSelectedListing(null);
  };

  // Get portfolio and dividends data
  const portfolio = data?.portfolio || [];
  const stats = data?.stats;
  const dividends = dividendsData?.history || data?.dividends || [];

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <DashboardSkeleton />
        </div>
      </div>
    );
  }

  // Error State
  if (dashboardError) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-7xl mx-auto text-center py-16">
          <AlertTriangle className="mx-auto text-red-400 mb-4" size={48} />
          <h2 className="text-xl font-bold text-gray-700 dark:text-gray-300">Erro ao carregar dados</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            {dashboardError instanceof Error ? dashboardError.message : 'Tente novamente mais tarde'}
          </p>
          <Button onClick={() => window.location.reload()} className="mt-4">
            Tentar Novamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Briefcase className="w-8 h-8 text-blue-500" />
            Portal do Investidor
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Gerencie seu portfólio e explore novas oportunidades
          </p>
        </div>

        {/* SE TIVER PIX GERADO, MOSTRA TELA DE PAGAMENTO */}
        {pixData ? (
          <div className="max-w-2xl mx-auto">
            <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-2xl text-gray-900 dark:text-white">
                      Pagamento via Pix
                    </CardTitle>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {selectedListing?.title}
                    </p>
                  </div>
                  <Badge className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-300 dark:border-green-700">
                    Ordem Criada
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                {/* QR CODE */}
                <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 text-center">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <QrCode className="w-5 h-5 text-blue-500" />
                    <span className="text-sm font-bold text-gray-700 dark:text-gray-300">
                      Escaneie para Pagar
                    </span>
                  </div>
                  {pixData.qrCode && (
                    <img
                      src={pixData.qrCode}
                      alt="QR Code Pix"
                      className="w-64 h-64 mx-auto bg-white p-2 rounded-lg"
                    />
                  )}
                </div>

                {/* COPIA E COLA */}
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase text-gray-500 dark:text-gray-400">
                    Ou pague com Pix Copia e Cola
                  </label>
                  <div
                    onClick={copyToClipboard}
                    className="flex items-center gap-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded-lg cursor-pointer hover:border-blue-500 dark:hover:border-blue-500 transition group"
                  >
                    <code className="text-xs text-gray-600 dark:text-gray-300 truncate flex-1 font-mono select-all">
                      {pixData.copyPaste}
                    </code>
                    {copied ? (
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                    ) : (
                      <Copy className="w-5 h-5 text-gray-400 group-hover:text-blue-500 flex-shrink-0" />
                    )}
                  </div>
                  {copied && (
                    <p className="text-xs text-green-600 dark:text-green-400 text-center">
                      ✓ Código copiado!
                    </p>
                  )}
                </div>

                {/* AVISO */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 p-4 rounded-lg">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    <strong>Aguardando confirmação do pagamento...</strong>
                    <br />
                    Assim que o Pix for confirmado, o ativo será transferido automaticamente para sua
                    carteira.
                  </p>
                </div>

                {/* BOTÃO VOLTAR */}
                <Button
                  onClick={handleBackToList}
                  variant="outline"
                  className="w-full border-gray-300 dark:border-gray-600"
                >
                  Voltar para Marketplace
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          /* TABBED INTERFACE */
          <Tabs defaultValue="portfolio" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 max-w-md bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <TabsTrigger value="portfolio">Meu Portfólio</TabsTrigger>
              <TabsTrigger value="dividends">Dividendos</TabsTrigger>
              <TabsTrigger value="marketplace">Marketplace</TabsTrigger>
            </TabsList>

            {/* ============================================ */}
            {/* ABA: MEU PORTFÓLIO */}
            {/* ============================================ */}
            <TabsContent value="portfolio">
              <div className="space-y-6">
                {/* KPIs */}
                {stats && (
                  <div className="grid gap-4 md:grid-cols-4">
                    <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
                      <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-blue-100">Total Investido</p>
                            <p className="text-2xl font-bold">{formatCurrency(stats.totalInvested)}</p>
                          </div>
                          <Wallet className="h-8 w-8 text-blue-200" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-0">
                      <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-emerald-100">Valor Atual</p>
                            <p className="text-2xl font-bold">{formatCurrency(stats.currentValue)}</p>
                          </div>
                          <TrendingUp className="h-8 w-8 text-emerald-200" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                      <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Rendimento Total</p>
                            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                              {formatCurrency(stats.totalYield)}
                            </p>
                          </div>
                          <DollarSign className="h-8 w-8 text-emerald-500" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                      <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Taxa Média</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                              {stats.averageYieldRate.toFixed(1)}% a.a.
                            </p>
                          </div>
                          <PieChart className="h-8 w-8 text-blue-500" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Lista de Ativos */}
                {portfolio.length === 0 ? (
                  <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <CardContent className="py-16 text-center">
                      <Briefcase className="h-16 w-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                      <h3 className="text-lg font-bold text-gray-700 dark:text-gray-300">
                        Nenhum ativo no portfólio
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-md mx-auto">
                        Explore o marketplace e invista em recebíveis de aluguel tokenizados
                      </p>
                      <Button
                        className="mt-6 bg-blue-600 hover:bg-blue-700"
                        onClick={() => {
                          const marketplaceTab = document.querySelector('[data-value="marketplace"]');
                          if (marketplaceTab) (marketplaceTab as HTMLButtonElement).click();
                        }}
                      >
                        <Building2 className="h-4 w-4 mr-2" />
                        Explorar Marketplace
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {portfolio.map((asset) => (
                      <AssetCard key={asset.id} asset={asset} />
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            {/* ============================================ */}
            {/* ABA: DIVIDENDOS */}
            {/* ============================================ */}
            <TabsContent value="dividends">
              <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid gap-4 md:grid-cols-3">
                  <Card className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white border-0">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-emerald-100">Total Recebido</p>
                          <p className="text-3xl font-bold">
                            {formatCurrency(dividends.reduce((acc, d) => acc + d.received, 0))}
                          </p>
                        </div>
                        <div className="p-3 bg-white/20 rounded-lg">
                          <DollarSign className="h-8 w-8" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Esperado no Período</p>
                          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                            {formatCurrency(dividends.reduce((acc, d) => acc + d.expected, 0))}
                          </p>
                        </div>
                        <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                          <Calendar className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Performance</p>
                          <p className="text-3xl font-bold text-gray-900 dark:text-white">
                            {dividends.length > 0
                              ? (
                                  (dividends.reduce((acc, d) => acc + d.received, 0) /
                                    dividends.reduce((acc, d) => acc + d.expected, 0)) *
                                  100
                                ).toFixed(0)
                              : 0}
                            %
                          </p>
                        </div>
                        <div className="p-3 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
                          <BarChart3 className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Dividends Chart */}
                <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-blue-500" />
                      Dividendos: Esperado vs Recebido
                    </CardTitle>
                    <CardDescription className="text-gray-500 dark:text-gray-400">
                      Acompanhe a performance dos seus investimentos mês a mês
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {dividends.length === 0 ? (
                      <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                        <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Nenhum dividendo recebido ainda.</p>
                        <p className="text-sm mt-1">Quando seus ativos pagarem, você verá aqui.</p>
                      </div>
                    ) : (
                      <DividendsChart dividends={dividends} />
                    )}
                  </CardContent>
                </Card>

                {/* Info Card */}
                <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                        <Shield className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h3 className="font-bold text-blue-900 dark:text-blue-100 mb-2">
                          Como funcionam os dividendos?
                        </h3>
                        <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
                          <li>
                            ✅ <strong>Mensal:</strong> Todo mês o inquilino paga, você recebe
                          </li>
                          <li>
                            ✅ <strong>Automático:</strong> Dividendos são depositados na sua conta
                          </li>
                          <li>
                            ✅ <strong>Garantido:</strong> Contratos com fiador ou seguro fiança
                          </li>
                          <li>
                            ✅ <strong>Transparente:</strong> Acompanhe tudo em tempo real
                          </li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* ============================================ */}
            {/* ABA: MARKETPLACE */}
            {/* ============================================ */}
            <TabsContent value="marketplace">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <Building2 className="h-5 w-5 text-blue-500" />
                      Oportunidades Disponíveis
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                      Recebíveis de aluguel tokenizados na blockchain
                    </p>
                  </div>
                </div>

                {listingsLoading ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {[...Array(4)].map((_, i) => (
                      <Card key={i} className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                        <CardContent className="p-6 space-y-4">
                          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 animate-pulse" />
                          <div className="grid grid-cols-2 gap-4 py-4">
                            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                          </div>
                          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : listings.length === 0 ? (
                  <Card className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                    <CardContent className="py-16 text-center">
                      <Building2 className="h-16 w-16 mx-auto text-gray-300 dark:text-gray-600 mb-4" />
                      <h3 className="text-lg font-bold text-gray-700 dark:text-gray-300">
                        Nenhuma oportunidade disponível
                      </h3>
                      <p className="text-gray-500 dark:text-gray-400 mt-2 max-w-md mx-auto">
                        No momento não há recebíveis disponíveis para investimento.
                        Volte em breve para novas oportunidades.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {listings.map((listing) => (
                      <Card
                        key={listing.id}
                        className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow"
                      >
                        <CardContent className="p-6">
                          <div className="space-y-4">
                            {/* HEADER */}
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                                  Contrato #{listing.contractId.slice(-6)}
                                </h3>
                                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mt-1">
                                  <MapPin className="w-4 h-4" />
                                  {listing.city} - {listing.state}
                                </div>
                              </div>
                              <Badge className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-300">
                                {listing.discountPercent}% OFF
                              </Badge>
                            </div>

                            {/* MÉTRICAS */}
                            <div className="grid grid-cols-2 gap-4 py-4 border-y border-gray-100 dark:border-gray-700">
                              <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Valor Mensal</p>
                                <p className="text-lg font-bold text-gray-900 dark:text-white">
                                  {formatCurrency(listing.monthlyValue)}
                                </p>
                              </div>
                              <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Período</p>
                                <p className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  {listing.monthsRemaining} meses
                                </p>
                              </div>
                            </div>

                            {/* PREÇO */}
                            <div className="space-y-2">
                              <div className="flex items-baseline gap-2">
                                <span className="text-sm text-gray-500 dark:text-gray-400 line-through">
                                  {formatCurrency(listing.faceValue)}
                                </span>
                                <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 rounded-full font-bold">
                                  -{listing.discountPercent}%
                                </span>
                              </div>
                              <div className="text-3xl font-bold text-gray-900 dark:text-white">
                                {formatCurrency(listing.askingPrice)}
                              </div>
                            </div>

                            {/* INDICADORES */}
                            <div className="flex items-center gap-4 text-sm">
                              {listing.tenantScore && (
                                <div className="flex items-center gap-2">
                                  <TrendingUp className="w-4 h-4 text-blue-500" />
                                  <span className="text-gray-600 dark:text-gray-300">
                                    Score: <strong>{listing.tenantScore}/100</strong>
                                  </span>
                                </div>
                              )}
                              <div className="flex items-center gap-2">
                                <Shield className="w-4 h-4 text-green-500" />
                                <span className="text-gray-600 dark:text-gray-300">
                                  Garantido
                                </span>
                              </div>
                            </div>

                            {/* BOTÃO DE INVESTIR */}
                            <Button
                              onClick={() => handleStartInvest({
                                id: listing.id,
                                title: `Contrato #${listing.contractId.slice(-6)}`,
                                askingPrice: listing.askingPrice,
                                faceValue: listing.faceValue,
                                monthlyValue: listing.monthlyValue,
                                discountPercent: listing.discountPercent,
                                monthsRemaining: listing.monthsRemaining,
                                city: listing.city,
                                state: listing.state,
                                tenantScore: listing.tenantScore,
                              })}
                              disabled={loading}
                              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg shadow-lg hover:shadow-blue-500/30 transition-all flex items-center justify-center gap-2"
                            >
                              {loading ? (
                                'Processando...'
                              ) : (
                                <>
                                  Investir Agora
                                  <ArrowRight className="w-5 h-5" />
                                </>
                              )}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        )}

        {/* ERRO */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-400 text-sm">
            <strong>Erro:</strong> {error}
          </div>
        )}

        {/* MODAL DO TERMO */}
        {showTermo && selectedListing && (
          <TermoModal
            assetTitle={selectedListing.title}
            assetPrice={selectedListing.askingPrice}
            onClose={() => setShowTermo(false)}
            onAccept={handleTermoAccepted}
          />
        )}
      </div>
    </div>
  );
}
