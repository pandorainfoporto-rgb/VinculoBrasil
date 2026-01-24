// ============================================
// P2P MARKETPLACE PAGE
// Balcão de Negócios - Cessão de Crédito Digital
// ============================================

import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import {
  ArrowRight,
  TrendingUp,
  Shield,
  Building2,
  Calculator,
  Filter,
  Search,
  Star,
  Clock,
  DollarSign,
  Users,
  ChevronRight,
  BadgeCheck,
  Wallet,
  FileText,
  Percent,
  Calendar,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { useP2PMarketplace, useP2PListingDetails, type P2PListing } from '@/hooks/use-p2p-marketplace';

export const Route = createFileRoute('/p2p')({
  component: P2PMarketplacePage,
});

function P2PMarketplacePage() {
  const [selectedListing, setSelectedListing] = useState<string | null>(null);
  const [showSimulator, setShowSimulator] = useState(false);

  const {
    listings,
    stats,
    isLoadingListings,
    isLoadingStats,
    simulation,
    simulate,
    isSimulating,
    resetSimulation,
  } = useP2PMarketplace();

  // Simulation form state
  const [simMonthlyRent, setSimMonthlyRent] = useState(2000);
  const [simMonths, setSimMonths] = useState(12);
  const [simDiscount, setSimDiscount] = useState(15);

  const handleSimulate = async () => {
    await simulate({
      monthlyRent: simMonthlyRent,
      monthsToSell: simMonths,
      discountPercent: simDiscount,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-900 to-zinc-950">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4">
        <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-10" />
        <div className="container mx-auto relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <Badge variant="outline" className="mb-4 border-emerald-500/50 text-emerald-400">
              Cessão de Crédito P2P
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Vínculo <span className="text-emerald-400">OTC</span>
            </h1>
            <p className="text-xl text-zinc-400 mb-8">
              O Mercado Secundário de Recebíveis Imobiliários.
              <br />
              Compre aluguéis futuros com desconto. Sem bancos. Sem burocracia.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-emerald-500 hover:bg-emerald-600 text-black font-semibold"
                onClick={() => setShowSimulator(true)}
              >
                <Calculator className="w-5 h-5 mr-2" />
                Simular Investimento
              </Button>
              <Button size="lg" variant="outline" className="border-zinc-700 text-white">
                <FileText className="w-5 h-5 mr-2" />
                Como Funciona
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 px-4 border-y border-zinc-800 bg-zinc-900/50">
        <div className="container mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            <StatCard
              icon={<FileText className="w-5 h-5 text-emerald-400" />}
              label="Ofertas Ativas"
              value={stats?.activeListings || 0}
              isLoading={isLoadingStats}
            />
            <StatCard
              icon={<DollarSign className="w-5 h-5 text-emerald-400" />}
              label="Volume Total"
              value={`R$ ${((stats?.totalVolume || 0) / 1000).toFixed(0)}k`}
              isLoading={isLoadingStats}
            />
            <StatCard
              icon={<Users className="w-5 h-5 text-emerald-400" />}
              label="Negociações"
              value={stats?.totalSales || 0}
              isLoading={isLoadingStats}
            />
            <StatCard
              icon={<Percent className="w-5 h-5 text-emerald-400" />}
              label="Deságio Médio"
              value={`${(stats?.averageDiscount || 0).toFixed(1)}%`}
              isLoading={isLoadingStats}
            />
            <StatCard
              icon={<TrendingUp className="w-5 h-5 text-emerald-400" />}
              label="Yield Médio"
              value="~18% a.a."
              isLoading={false}
            />
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 px-4">
        <div className="container mx-auto">
          <Tabs defaultValue="marketplace" className="space-y-8">
            <TabsList className="bg-zinc-800/50 border border-zinc-700">
              <TabsTrigger value="marketplace">Ofertas Disponíveis</TabsTrigger>
              <TabsTrigger value="how-it-works">Como Funciona</TabsTrigger>
              <TabsTrigger value="legal">Base Jurídica</TabsTrigger>
            </TabsList>

            <TabsContent value="marketplace" className="space-y-6">
              {/* Filters */}
              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <Label className="text-zinc-400">Cidade</Label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <Input
                          placeholder="Buscar cidade..."
                          className="pl-10 bg-zinc-800 border-zinc-700 text-white"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-zinc-400">
                        Deságio Mínimo: {simDiscount}%
                      </Label>
                      <Slider
                        value={[simDiscount]}
                        onValueChange={(v) => setSimDiscount(v[0])}
                        max={50}
                        step={1}
                        className="py-2"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-zinc-400">Score Mínimo do Inquilino</Label>
                      <Input
                        type="number"
                        placeholder="80"
                        className="bg-zinc-800 border-zinc-700 text-white"
                      />
                    </div>
                    <div className="flex items-end">
                      <Button variant="outline" className="w-full border-zinc-700">
                        <Filter className="w-4 h-4 mr-2" />
                        Filtrar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Listings Grid */}
              {isLoadingListings ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <Card key={i} className="bg-zinc-900/50 border-zinc-800 animate-pulse">
                      <CardContent className="p-6">
                        <div className="h-32 bg-zinc-800 rounded" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : listings.length === 0 ? (
                <Card className="bg-zinc-900/50 border-zinc-800">
                  <CardContent className="py-16 text-center">
                    <Building2 className="w-16 h-16 text-zinc-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">
                      Nenhuma oferta disponível
                    </h3>
                    <p className="text-zinc-400">
                      Novas ofertas serão listadas em breve. Volte depois!
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {listings.map((listing) => (
                    <ListingCard
                      key={listing.id}
                      listing={listing}
                      onSelect={() => setSelectedListing(listing.id)}
                    />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="how-it-works" className="space-y-6">
              <HowItWorksSection />
            </TabsContent>

            <TabsContent value="legal" className="space-y-6">
              <LegalSection />
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Simulator Dialog */}
      <Dialog open={showSimulator} onOpenChange={setShowSimulator}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <Calculator className="w-6 h-6 text-emerald-400" />
              Simulador P2P
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              Calcule o retorno de um investimento em recebíveis
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Aluguel Mensal (R$)</Label>
                <Input
                  type="number"
                  value={simMonthlyRent}
                  onChange={(e) => setSimMonthlyRent(Number(e.target.value))}
                  className="bg-zinc-800 border-zinc-700"
                />
              </div>
              <div className="space-y-2">
                <Label>Meses a Vender</Label>
                <Input
                  type="number"
                  value={simMonths}
                  onChange={(e) => setSimMonths(Number(e.target.value))}
                  className="bg-zinc-800 border-zinc-700"
                />
              </div>
              <div className="space-y-2">
                <Label>Deságio (%)</Label>
                <Input
                  type="number"
                  value={simDiscount}
                  onChange={(e) => setSimDiscount(Number(e.target.value))}
                  className="bg-zinc-800 border-zinc-700"
                />
              </div>
            </div>

            <Button
              onClick={handleSimulate}
              disabled={isSimulating}
              className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-semibold"
            >
              {isSimulating ? 'Calculando...' : 'Calcular'}
            </Button>

            {simulation && (
              <div className="space-y-4 pt-4 border-t border-zinc-800">
                <div className="grid grid-cols-2 gap-4">
                  {/* Vendedor */}
                  <Card className="bg-zinc-800/50 border-zinc-700">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-zinc-400">Para o Vendedor</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Valor de Face:</span>
                        <span className="text-white font-mono">
                          R$ {simulation.seller.faceValue.toLocaleString('pt-BR')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Preço de Venda:</span>
                        <span className="text-emerald-400 font-mono font-semibold">
                          R$ {simulation.seller.askingPrice.toLocaleString('pt-BR')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Taxa Plataforma:</span>
                        <span className="text-red-400 font-mono">
                          - R$ {simulation.seller.platformFee.toLocaleString('pt-BR')}
                        </span>
                      </div>
                      <Separator className="bg-zinc-700" />
                      <div className="flex justify-between">
                        <span className="text-zinc-400 font-semibold">Recebe Hoje:</span>
                        <span className="text-white font-mono font-bold">
                          R$ {simulation.seller.netToSeller.toLocaleString('pt-BR')}
                        </span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Investidor */}
                  <Card className="bg-zinc-800/50 border-zinc-700">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm text-zinc-400">Para o Investidor</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Investimento:</span>
                        <span className="text-white font-mono">
                          R$ {simulation.investor.purchasePrice.toLocaleString('pt-BR')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Recebe (85% dos aluguéis):</span>
                        <span className="text-white font-mono">
                          R$ {simulation.investor.netReceivables.toLocaleString('pt-BR')}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Lucro:</span>
                        <span className="text-emerald-400 font-mono font-semibold">
                          R$ {simulation.investor.profit.toLocaleString('pt-BR')}
                        </span>
                      </div>
                      <Separator className="bg-zinc-700" />
                      <div className="flex justify-between">
                        <span className="text-zinc-400 font-semibold">Yield Total:</span>
                        <span className="text-emerald-400 font-mono font-bold">
                          {simulation.investor.totalYield.toFixed(1)}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Yield Mensal:</span>
                        <span className="text-emerald-400 font-mono">
                          {simulation.investor.monthlyYield.toFixed(2)}%/mês
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="text-center text-sm text-zinc-500">
                  Período: {simulation.period.months} meses ({simulation.period.startDate} a{' '}
                  {simulation.period.endDate})
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Listing Details Dialog */}
      {selectedListing && (
        <ListingDetailsDialog
          listingId={selectedListing}
          onClose={() => setSelectedListing(null)}
        />
      )}
    </div>
  );
}

// ============================================
// SUB-COMPONENTS
// ============================================

function StatCard({
  icon,
  label,
  value,
  isLoading,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  isLoading: boolean;
}) {
  return (
    <div className="text-center">
      <div className="flex justify-center mb-2">{icon}</div>
      {isLoading ? (
        <div className="h-8 w-20 bg-zinc-800 rounded animate-pulse mx-auto" />
      ) : (
        <div className="text-2xl font-bold text-white">{value}</div>
      )}
      <div className="text-sm text-zinc-500">{label}</div>
    </div>
  );
}

function ListingCard({
  listing,
  onSelect,
}: {
  listing: P2PListing;
  onSelect: () => void;
}) {
  return (
    <Card
      className="bg-zinc-900/50 border-zinc-800 hover:border-emerald-500/50 transition-all cursor-pointer group"
      onClick={onSelect}
    >
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Building2 className="w-4 h-4 text-zinc-500" />
              <span className="text-zinc-400 text-sm">
                {listing.city}, {listing.state}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-white">
              Contrato #{listing.contractId.slice(0, 8)}
            </h3>
          </div>
          <Badge
            variant="outline"
            className="border-emerald-500/50 text-emerald-400"
          >
            -{listing.discountPercent.toFixed(0)}%
          </Badge>
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex justify-between">
            <span className="text-zinc-500 text-sm">Valor de Face:</span>
            <span className="text-zinc-300 font-mono">
              R$ {listing.faceValue.toLocaleString('pt-BR')}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500 text-sm">Preço de Compra:</span>
            <span className="text-emerald-400 font-mono font-semibold">
              R$ {listing.askingPrice.toLocaleString('pt-BR')}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500 text-sm">Período:</span>
            <span className="text-zinc-300">{listing.monthsRemaining} meses</span>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-4">
          {listing.tenantScore && listing.tenantScore >= 80 && (
            <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-400">
              <Star className="w-3 h-3 mr-1" />
              Score {listing.tenantScore}
            </Badge>
          )}
          <Badge variant="secondary" className="bg-zinc-800 text-zinc-400">
            <Clock className="w-3 h-3 mr-1" />
            R$ {listing.monthlyValue.toLocaleString('pt-BR')}/mês
          </Badge>
        </div>

        <Button
          className="w-full bg-zinc-800 hover:bg-zinc-700 group-hover:bg-emerald-500 group-hover:text-black transition-all"
        >
          Ver Detalhes
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
}

function ListingDetailsDialog({
  listingId,
  onClose,
}: {
  listingId: string;
  onClose: () => void;
}) {
  const { data, isLoading } = useP2PListingDetails(listingId);

  return (
    <Dialog open={!!listingId} onOpenChange={() => onClose()}>
      <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-3xl max-h-[90vh] overflow-y-auto">
        {isLoading ? (
          <div className="py-12 text-center">
            <div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full mx-auto" />
          </div>
        ) : data ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl">
                {data.property.title}
              </DialogTitle>
              <DialogDescription className="text-zinc-400">
                {data.property.neighborhood}, {data.property.city} - {data.property.state}
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              {/* Left Column */}
              <div className="space-y-4">
                <Card className="bg-zinc-800/50 border-zinc-700">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-zinc-400">Dados do Investimento</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Valor de Face:</span>
                      <span className="text-white font-mono">
                        R$ {data.listing.faceValue.toLocaleString('pt-BR')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Preço de Compra:</span>
                      <span className="text-emerald-400 font-mono font-bold text-lg">
                        R$ {data.listing.askingPrice.toLocaleString('pt-BR')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Deságio:</span>
                      <Badge variant="outline" className="border-emerald-500/50 text-emerald-400">
                        -{data.listing.discountPercent.toFixed(1)}%
                      </Badge>
                    </div>
                    <Separator className="bg-zinc-700" />
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Período:</span>
                      <span className="text-white">{data.listing.totalMonths} meses</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Aluguel Mensal:</span>
                      <span className="text-white font-mono">
                        R$ {data.listing.monthlyValue.toLocaleString('pt-BR')}
                      </span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-zinc-800/50 border-zinc-700">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-zinc-400">Imóvel</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Tipo:</span>
                      <span className="text-white">{data.property.type}</span>
                    </div>
                    {data.property.bedrooms && (
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Quartos:</span>
                        <span className="text-white">{data.property.bedrooms}</span>
                      </div>
                    )}
                    {data.property.area && (
                      <div className="flex justify-between">
                        <span className="text-zinc-500">Área:</span>
                        <span className="text-white">{data.property.area}m²</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <Card className="bg-zinc-800/50 border-zinc-700">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-zinc-400">Análise de Risco</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-500">Score do Inquilino:</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-zinc-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500"
                            style={{ width: `${data.tenantMetrics.paymentScore}%` }}
                          />
                        </div>
                        <span className="text-emerald-400 font-semibold">
                          {data.tenantMetrics.paymentScore}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Pagamentos em Dia:</span>
                      <span className="text-white">
                        {data.tenantMetrics.paidOnTime}/{data.tenantMetrics.totalPayments}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Garantia:</span>
                      <Badge
                        variant={data.contract.hasGuarantor ? 'default' : 'secondary'}
                        className={
                          data.contract.hasGuarantor
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-zinc-700 text-zinc-400'
                        }
                      >
                        {data.contract.hasGuarantor ? (
                          <>
                            <Shield className="w-3 h-3 mr-1" />
                            {data.contract.guarantorType}
                          </>
                        ) : (
                          'Sem Garantia'
                        )}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-zinc-800/50 border-zinc-700">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-zinc-400">Contrato</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Início:</span>
                      <span className="text-white">
                        {new Date(data.contract.startDate).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Fim:</span>
                      <span className="text-white">
                        {new Date(data.contract.endDate).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-500">Vencimento:</span>
                      <span className="text-white">Dia {data.contract.dueDay}</span>
                    </div>
                  </CardContent>
                </Card>

                <Button
                  size="lg"
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-black font-semibold"
                >
                  <Wallet className="w-5 h-5 mr-2" />
                  Comprar Recebíveis
                </Button>

                <p className="text-xs text-zinc-500 text-center">
                  Ao comprar, você receberá 85% dos aluguéis futuros diretamente na sua conta.
                </p>
              </div>
            </div>
          </>
        ) : (
          <div className="py-12 text-center text-zinc-400">Oferta não encontrada</div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function HowItWorksSection() {
  const steps = [
    {
      icon: <FileText className="w-8 h-8" />,
      title: 'Tokenização',
      description:
        'O proprietário transforma seus aluguéis futuros em um token digital (ERC-1155), criando um "pacote" de recebíveis.',
    },
    {
      icon: <DollarSign className="w-8 h-8" />,
      title: 'Listagem com Deságio',
      description:
        'O proprietário define o preço de venda com desconto. Ex: 12 meses de R$ 2.000 (R$ 24k) vendidos por R$ 20k.',
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Compra P2P',
      description:
        'O investidor analisa o score do inquilino e a garantia do contrato. Se aprovar, envia o pagamento (PIX ou Crypto).',
    },
    {
      icon: <ArrowRight className="w-8 h-8" />,
      title: 'Swap Atômico',
      description:
        'O Smart Contract libera o dinheiro para o proprietário e transfere o token de recebíveis para o investidor. Tudo na mesma transação.',
    },
    {
      icon: <Calendar className="w-8 h-8" />,
      title: 'Recebimento Mensal',
      description:
        'Quando o inquilino paga o aluguel, o sistema identifica o novo dono do token e repassa 85% diretamente para o investidor.',
    },
  ];

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Como Funciona</h2>
        <p className="text-zinc-400 max-w-2xl mx-auto">
          O Vínculo OTC é um balcão de negócios para cessão de créditos imobiliários.
          Não somos um banco. Não prometemos juros. Facilitamos a compra e venda de ativos.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {steps.map((step, index) => (
          <Card key={index} className="bg-zinc-900/50 border-zinc-800">
            <CardContent className="pt-6 text-center">
              <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-400">
                {step.icon}
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{step.title}</h3>
              <p className="text-sm text-zinc-400">{step.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function LegalSection() {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-4">Base Jurídica</h2>
        <p className="text-zinc-400 max-w-2xl mx-auto">
          Por que o Vínculo OTC não é regulado pela CVM?
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-emerald-400 flex items-center gap-2">
              <BadgeCheck className="w-5 h-5" />
              Cessão de Crédito (Art. 286-298, CC)
            </CardTitle>
          </CardHeader>
          <CardContent className="text-zinc-400 space-y-3">
            <p>
              A operação é uma <strong className="text-white">Cessão de Crédito</strong> entre
              particulares, prevista no Código Civil Brasileiro.
            </p>
            <p>
              O cedente (proprietário) transfere seus direitos creditórios (aluguéis futuros) ao
              cessionário (investidor) mediante pagamento.
            </p>
            <p>
              É como vender um cheque pré-datado ou uma duplicata. Não há promessa de rendimento,
              apenas a transferência de um ativo.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-red-400 flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Por que NÃO é Valor Mobiliário?
            </CardTitle>
          </CardHeader>
          <CardContent className="text-zinc-400 space-y-3">
            <p>
              Valores Mobiliários (CVM) são caracterizados por <strong className="text-white">
                promessa de rendimento futuro
              </strong>{' '}
              baseada em esforço de terceiros.
            </p>
            <p>
              No Vínculo OTC, não prometemos juros. Negociamos <strong className="text-white">preço</strong>.
              O investidor compra um ativo com desconto e recebe o valor de face ao longo do tempo.
            </p>
            <p>
              O lucro não vem de "rendimento", vem do <strong className="text-white">deságio na compra</strong>.
              É ganho de capital na alienação de bem digital.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-900/50 border-zinc-800 md:col-span-2">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Wallet className="w-5 h-5" />
              Modelo P2P Puro
            </CardTitle>
          </CardHeader>
          <CardContent className="text-zinc-400">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-zinc-800/50 p-4 rounded-lg">
                <h4 className="text-emerald-400 font-semibold mb-2">A Vínculo NÃO...</h4>
                <ul className="space-y-1 text-sm">
                  <li>- Custodia fundos de terceiros</li>
                  <li>- Promete rentabilidade</li>
                  <li>- Gerencia pools de investimento</li>
                  <li>- Assume risco de crédito</li>
                </ul>
              </div>
              <div className="bg-zinc-800/50 p-4 rounded-lg">
                <h4 className="text-emerald-400 font-semibold mb-2">A Vínculo É...</h4>
                <ul className="space-y-1 text-sm">
                  <li>+ Marketplace de ativos</li>
                  <li>+ Facilitadora de transações</li>
                  <li>+ Infraestrutura tecnológica</li>
                  <li>+ Cobradora de taxa de sucesso</li>
                </ul>
              </div>
              <div className="bg-zinc-800/50 p-4 rounded-lg">
                <h4 className="text-emerald-400 font-semibold mb-2">O Fluxo Financeiro</h4>
                <ul className="space-y-1 text-sm">
                  <li>1. Investidor → Smart Contract → Proprietário</li>
                  <li>2. Inquilino → Asaas → Investidor (85%)</li>
                  <li>3. Vínculo cobra 2% de taxa por transação</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default P2PMarketplacePage;
