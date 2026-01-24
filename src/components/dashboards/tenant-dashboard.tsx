/**
 * Dashboard do Locatario - Vinculo.io
 * Experiencia fluida de aluguel como reservar um hotel
 *
 * MODELO FINANCEIRO: Split 85/5/5/5
 * - 85% Locador
 * - 5% Seguradora
 * - 5% Plataforma
 * - 5% Garantidor
 *
 * O locatario paga o valor TOTAL do aluguel.
 * A plataforma faz o split automatico.
 */

import { useState } from 'react';
import { VinculoBrasilLogo } from '@/components/vinculo-brasil-logo';
import { AdBanner } from '@/components/engine';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Home,
  Search,
  MapPin,
  Bed,
  Bath,
  Square,
  PawPrint,
  Star,
  Heart,
  Send,
  CreditCard,
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  Calendar,
  Building2,
  Shield,
  ArrowRight,
  Download,
  Eye,
  Smartphone,
  QrCode,
  Banknote,
  TrendingUp,
  Filter,
  Wallet,
  Activity,
  Loader2,
  Map,
  List,
  Navigation,
  X,
  Car,
  Calculator,
} from 'lucide-react';
// WalletConnector removido - nao utiliza mais carteira
import { useWalletConnection } from '@/hooks/use-wallet-connection';
import { usePayRent } from '@/hooks/use-pay-rent';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { LogOut } from 'lucide-react';
import {
  downloadContractPDF,
  downloadPaymentReceiptPDF,
  type ContractPDFData,
  type PaymentReceiptData,
} from '@/lib/pdf-generator';
import { SETUP_FEE_PERCENTAGE } from '@/lib/rental-payment-calculator';

// Coordenadas centrais das cidades
const CITY_CENTERS: Record<string, { lat: number; lng: number; zoom: number }> = {
  'Sao Paulo': { lat: -23.5505, lng: -46.6333, zoom: 12 },
  'Rio de Janeiro': { lat: -22.9068, lng: -43.1729, zoom: 12 },
  'Belo Horizonte': { lat: -19.9167, lng: -43.9345, zoom: 12 },
};

// Props do componente
interface TenantDashboardProps {
  onLogout?: () => void;
  userName?: string;
  userEmail?: string;
}

// Tipos
interface PropertyListing {
  id: string;
  address: string;
  city: string;
  state: string;
  neighborhood: string;
  propertyType: 'apartment' | 'house' | 'commercial';
  rentAmount: number;
  condoFees: number;
  iptuTax: number;
  bedrooms: number;
  bathrooms: number;
  area: number;
  petFriendly: boolean;
  parkingSpaces: number;
  description: string;
  landlordName: string;
  landlordRating: number;
  availableFrom: Date;
  photos: string[];
  hasGuarantor: boolean;
  insuranceIncluded: boolean;
  // Coordenadas para o mapa (latitude, longitude)
  coordinates: {
    lat: number;
    lng: number;
  };
}

interface ActiveContract {
  id: string;
  propertyAddress: string;
  monthlyRent: number;
  startDate: Date;
  endDate: Date;
  status: 'active' | 'pending' | 'ending_soon';
  nextPaymentDate: Date;
  nftTokenHash: string;
  landlordName: string;
  guarantorName?: string;
}

interface PaymentHistory {
  id: string;
  date: Date;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  method: 'pix' | 'boleto' | 'card';
  receiptHash?: string;
}

interface RentalProposal {
  id: string;
  propertyAddress: string;
  proposedRent: number;
  status: 'pending' | 'approved' | 'rejected' | 'counter_offer';
  submittedAt: Date;
  responseAt?: Date;
  counterOfferAmount?: number;
}

export function TenantDashboard({ onLogout, userName, userEmail }: TenantDashboardProps = {}) {
  const [activeTab, setActiveTab] = useState<'overview' | 'search' | 'proposals' | 'payments' | 'contract'>('overview');
  const [searchFilters, setSearchFilters] = useState({
    city: 'Sao Paulo',
    minRent: 1500,
    maxRent: 5000,
    bedrooms: 2,
    petFriendly: false,
  });
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showWeb3PaymentDialog, setShowWeb3PaymentDialog] = useState(false);

  // Estados do mapa
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [selectedProperty, setSelectedProperty] = useState<PropertyListing | null>(null);
  const [hoveredProperty, setHoveredProperty] = useState<string | null>(null);
  const [showSimulationDialog, setShowSimulationDialog] = useState(false);
  const [searchLocation, setSearchLocation] = useState('');
  const [mapCenter, setMapCenter] = useState(CITY_CENTERS['Sao Paulo']);

  // Web3 hooks
  const { isConnected, wallet, shortAddress } = useWalletConnection();
  const {
    pay: payRent,
    isPending: isPayingRent,
    isSuccess: paymentSuccess,
    statusMessage: paymentStatusMessage,
    transactionHash,
    split: paymentSplit,
    reset: resetPayment,
  } = usePayRent({
    tokenId: BigInt(12345), // Would come from actual contract
    amountBrl: 3500, // activeContract.monthlyRent
    onSuccess: () => {
      setTimeout(() => {
        setShowWeb3PaymentDialog(false);
        resetPayment();
      }, 3000);
    },
  });

  // Dados mock do locatario
  const [tenantData] = useState({
    name: 'Joao Silva',
    cpf: '123.456.789-00',
    creditScore: 780,
    kycStatus: 'approved' as const,
    incomeVerified: true,
    monthlyIncome: 12000,
  });

  // Contrato ativo
  const [activeContract] = useState<ActiveContract>({
    id: 'CTR-001',
    propertyAddress: 'Rua das Flores, 123 - Jardins, Sao Paulo',
    monthlyRent: 3500,
    startDate: new Date('2025-01-01'),
    endDate: new Date('2026-12-31'),
    status: 'active',
    nextPaymentDate: new Date('2026-02-05'),
    nftTokenHash: '0x7a8b9c...d4e5f6',
    landlordName: 'Maria Oliveira',
    guarantorName: 'Carlos Santos',
  });

  // Historico de pagamentos - Vazio para producao
  const [paymentHistory] = useState<PaymentHistory[]>([]);

  // Propostas enviadas - Vazio para producao
  const [proposals] = useState<RentalProposal[]>([]);

  // Imoveis disponiveis - Vazio para producao
  const allProperties: PropertyListing[] = [];

  // Estado dos imoveis filtrados
  const [filteredProperties, setFilteredProperties] = useState<PropertyListing[]>(allProperties);
  const [hasSearched, setHasSearched] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Funcao de busca
  const handleSearch = () => {
    setIsSearching(true);
    setHasSearched(true);

    // Simula um pequeno delay para feedback visual
    setTimeout(() => {
      const results = allProperties.filter((property) => {
        // Filtro por cidade
        if (searchFilters.city && property.city !== searchFilters.city) {
          return false;
        }

        // Filtro por faixa de preco
        if (property.rentAmount < searchFilters.minRent || property.rentAmount > searchFilters.maxRent) {
          return false;
        }

        // Filtro por quartos (4+ significa 4 ou mais)
        if (searchFilters.bedrooms === 4) {
          if (property.bedrooms < 4) return false;
        } else if (property.bedrooms !== searchFilters.bedrooms) {
          return false;
        }

        // Filtro por pet friendly (se ativado)
        if (searchFilters.petFriendly && !property.petFriendly) {
          return false;
        }

        return true;
      });

      setFilteredProperties(results);
      setIsSearching(false);
      // Atualiza o centro do mapa baseado na cidade selecionada
      if (searchFilters.city && CITY_CENTERS[searchFilters.city]) {
        setMapCenter(CITY_CENTERS[searchFilters.city]);
      }
    }, 500);
  };

  // Funcao para calcular posicao do marcador no mapa simulado
  const calculateMarkerPosition = (property: PropertyListing) => {
    const center = CITY_CENTERS[property.city] || mapCenter;
    // Calcula posicao relativa baseada nas coordenadas
    const latDiff = (property.coordinates.lat - center.lat) * 100;
    const lngDiff = (property.coordinates.lng - center.lng) * 100;
    // Converte para percentagem (50% = centro)
    const left = 50 + lngDiff * 8; // Multiplica para espalhar mais
    const top = 50 - latDiff * 8;
    return {
      left: `${Math.max(5, Math.min(95, left))}%`,
      top: `${Math.max(5, Math.min(95, top))}%`,
    };
  };

  // Calculo do contrato restante
  const contractProgress = () => {
    const total = activeContract.endDate.getTime() - activeContract.startDate.getTime();
    const elapsed = new Date().getTime() - activeContract.startDate.getTime();
    return Math.min(100, Math.max(0, (elapsed / total) * 100));
  };

  const daysUntilNextPayment = () => {
    const today = new Date();
    const diff = activeContract.nextPaymentDate.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  // Calculo de quanto o locatario paga vs distribuicao
  const calculatePaymentBreakdown = (totalRent: number) => {
    return {
      total: totalRent,
      landlord: totalRent * 0.85,
      insurer: totalRent * 0.05,
      platform: totalRent * 0.05,
      guarantor: totalRent * 0.05,
    };
  };

  // Handler para download do contrato em PDF
  const handleDownloadContractPDF = () => {
    const contractData: ContractPDFData = {
      contractId: activeContract.id,
      landlordName: activeContract.landlordName,
      tenantName: tenantData.name,
      guarantorName: activeContract.guarantorName,
      propertyAddress: activeContract.propertyAddress,
      rentAmount: activeContract.monthlyRent,
      startDate: activeContract.startDate,
      endDate: activeContract.endDate,
      paymentDueDay: 10, // Data de vencimento padrao
      setupFee: activeContract.monthlyRent * SETUP_FEE_PERCENTAGE,
      nftTokenId: activeContract.nftTokenHash,
    };
    downloadContractPDF(contractData);
  };

  // Handler para download de recibo de pagamento
  const handleDownloadReceiptPDF = (payment: PaymentHistory) => {
    const receiptData: PaymentReceiptData = {
      receiptNumber: `REC-${payment.id}-${payment.date.getTime()}`,
      payerName: tenantData.name,
      amount: payment.amount,
      paymentDate: payment.date,
      dueDate: payment.date, // Data de vencimento seria a mesma neste caso
      description: `Aluguel referente a ${payment.date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}`,
      transactionHash: payment.receiptHash,
    };
    downloadPaymentReceiptPDF(receiptData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="bg-background dark:bg-slate-900 border-b shadow-sm">
        <div className="container mx-auto px-4 py-3 lg:py-4">
          <div className="flex items-center justify-between gap-2">
            <VinculoBrasilLogo size="sm" />
            <div className="flex items-center gap-2 lg:gap-4">
              <div className="text-right hidden sm:block">
                <p className="font-medium text-sm lg:text-base">{userName || tenantData.name}</p>
                <div className="flex items-center gap-1 lg:gap-2 justify-end">
                  <Badge variant="outline" className="text-xs">
                    Score: {tenantData.creditScore}
                  </Badge>
                  <Badge className="bg-green-600 text-xs hidden lg:inline-flex">KYC Aprovado</Badge>
                </div>
              </div>
              {onLogout && (
                <Button variant="ghost" size="sm" onClick={onLogout} title="Sair">
                  <LogOut className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-background dark:bg-slate-900 border-b">
        <div className="container mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto">
            {[
              { id: 'overview', label: 'Visao Geral', icon: Home },
              { id: 'search', label: 'Buscar Imoveis', icon: Search },
              { id: 'proposals', label: 'Minhas Propostas', icon: Send },
              { id: 'payments', label: 'Pagamentos', icon: CreditCard },
              { id: 'contract', label: 'Meu Contrato', icon: FileText },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-green-600 text-emerald-400'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Banner de Anuncios */}
        <div className="mb-6">
          <AdBanner placement="header" clientType="tenant" maxAds={3} />
        </div>

        {/* VISAO GERAL */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Alerta de pagamento proximo */}
            {daysUntilNextPayment() <= 5 && daysUntilNextPayment() > 0 && (
              <Alert className="border-amber-500 bg-amber-50 dark:bg-amber-950">
                <Clock className="h-4 w-4 text-amber-600" />
                <AlertTitle className="text-amber-700">Pagamento Proximo</AlertTitle>
                <AlertDescription>
                  Seu proximo aluguel vence em <strong>{daysUntilNextPayment()} dia(s)</strong>.
                  <Button size="sm" className="ml-4" onClick={() => setShowPaymentDialog(true)}>
                    Pagar Agora
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {/* Cards de resumo - clicaveis */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card
                className="cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02]"
                onClick={() => setActiveTab('payments')}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Aluguel Mensal</CardTitle>
                  <Banknote className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    R$ {activeContract.monthlyRent.toLocaleString('pt-BR')}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Vencimento dia 5 de cada mes
                  </p>
                  <p className="text-xs text-primary mt-1">Ver pagamentos →</p>
                </CardContent>
              </Card>

              <Card
                className="cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02]"
                onClick={() => setActiveTab('payments')}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Proximo Pagamento</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {daysUntilNextPayment()} dias
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {activeContract.nextPaymentDate.toLocaleDateString('pt-BR')}
                  </p>
                  <p className="text-xs text-primary mt-1">Pagar agora →</p>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02]">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Score de Credito</CardTitle>
                  <TrendingUp className="h-4 w-4 text-emerald-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-emerald-400">{tenantData.creditScore}</div>
                  <Progress value={tenantData.creditScore / 10} className="mt-2" />
                  <p className="text-xs text-emerald-500 mt-1">Ver historico →</p>
                </CardContent>
              </Card>

              <Card
                className="cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02]"
                onClick={() => setActiveTab('contract')}
              >
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Status do Contrato</CardTitle>
                  <Shield className="h-4 w-4 text-emerald-400" />
                </CardHeader>
                <CardContent>
                  <Badge className="bg-green-600">Ativo</Badge>
                  <p className="text-xs text-muted-foreground mt-1">
                    NFT: {activeContract.nftTokenHash}
                  </p>
                  <p className="text-xs text-primary mt-1">Ver contrato →</p>
                </CardContent>
              </Card>
            </div>

            {/* Meu Imovel Atual */}
            <Card>
              <CardHeader>
                <CardTitle>Meu Imovel Atual</CardTitle>
                <CardDescription>Contrato tokenizado na blockchain</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="p-4 bg-emerald-500/10 dark:bg-green-900 rounded-xl">
                    <Building2 className="h-12 w-12 text-emerald-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">{activeContract.propertyAddress}</h3>
                    <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                      <span>Locador: {activeContract.landlordName}</span>
                      {activeContract.guarantorName && (
                        <span>Garantidor: {activeContract.guarantorName}</span>
                      )}
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs font-mono">
                    {activeContract.nftTokenHash}
                  </Badge>
                </div>

                <Separator />

                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Progresso do Contrato</span>
                    <span>{contractProgress().toFixed(0)}%</span>
                  </div>
                  <Progress value={contractProgress()} />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>{activeContract.startDate.toLocaleDateString('pt-BR')}</span>
                    <span>{activeContract.endDate.toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ultimos Pagamentos */}
            <Card>
              <CardHeader>
                <CardTitle>Ultimos Pagamentos</CardTitle>
                <CardDescription>Historico com comprovantes na blockchain</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Metodo</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Comprovante</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paymentHistory.slice(0, 3).map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>{payment.date.toLocaleDateString('pt-BR')}</TableCell>
                        <TableCell className="font-semibold">
                          R$ {payment.amount.toLocaleString('pt-BR')}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{payment.method.toUpperCase()}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-green-600">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Pago
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDownloadReceiptPDF(payment)}
                          >
                            <Download className="h-4 w-4 mr-1" />
                            Recibo PDF
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}

        {/* BUSCAR IMOVEIS */}
        {activeTab === 'search' && (
          <div className="space-y-6">
            {/* Barra de Pesquisa por Localizacao */}
            <Card className="border-2 border-emerald-200 dark:border-emerald-800">
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Navigation className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      placeholder="Pesquisar por endereco, bairro ou ponto de referencia (ex: proximo ao metro, shopping, hospital...)"
                      className="pl-10 h-12 text-base"
                      value={searchLocation}
                      onChange={(e) => setSearchLocation(e.target.value)}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'outline'}
                      onClick={() => setViewMode('list')}
                      className={viewMode === 'list' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
                    >
                      <List className="h-4 w-4 mr-2" />
                      Lista
                    </Button>
                    <Button
                      variant={viewMode === 'map' ? 'default' : 'outline'}
                      onClick={() => setViewMode('map')}
                      className={viewMode === 'map' ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
                    >
                      <Map className="h-4 w-4 mr-2" />
                      Mapa
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Filtros */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filtros de Busca
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-5">
                  <div className="space-y-2">
                    <Label>Cidade</Label>
                    <Select
                      value={searchFilters.city}
                      onValueChange={(v) => setSearchFilters({ ...searchFilters, city: v })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Sao Paulo">Sao Paulo</SelectItem>
                        <SelectItem value="Rio de Janeiro">Rio de Janeiro</SelectItem>
                        <SelectItem value="Belo Horizonte">Belo Horizonte</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Quartos</Label>
                    <Select
                      value={String(searchFilters.bedrooms)}
                      onValueChange={(v) => setSearchFilters({ ...searchFilters, bedrooms: Number(v) })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1 quarto</SelectItem>
                        <SelectItem value="2">2 quartos</SelectItem>
                        <SelectItem value="3">3 quartos</SelectItem>
                        <SelectItem value="4">4+ quartos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2 col-span-2">
                    <Label>Faixa de Preco: R$ {searchFilters.minRent} - R$ {searchFilters.maxRent}</Label>
                    <Slider
                      value={[searchFilters.minRent, searchFilters.maxRent]}
                      min={1000}
                      max={10000}
                      step={500}
                      onValueChange={(v) => setSearchFilters({
                        ...searchFilters,
                        minRent: v[0],
                        maxRent: v[1],
                      })}
                    />
                  </div>

                  <div className="flex items-end">
                    <Button className="w-full bg-emerald-600 hover:bg-emerald-700" onClick={handleSearch} disabled={isSearching}>
                      {isSearching ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Search className="h-4 w-4 mr-2" />
                      )}
                      {isSearching ? 'Buscando...' : 'Buscar'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Resultados da Busca */}
            {hasSearched && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">
                  {filteredProperties.length === 0
                    ? 'Nenhum imovel encontrado com os filtros selecionados.'
                    : `${filteredProperties.length} ${filteredProperties.length === 1 ? 'imovel encontrado' : 'imoveis encontrados'}`}
                </p>
                {filteredProperties.length === 0 && (
                  <Button variant="outline" size="sm" onClick={() => {
                    setSearchFilters({ city: 'Sao Paulo', minRent: 1000, maxRent: 10000, bedrooms: 2, petFriendly: false });
                    setFilteredProperties(allProperties);
                    setHasSearched(false);
                  }}>
                    Limpar Filtros
                  </Button>
                )}
              </div>
            )}

            {/* VISUALIZACAO EM MAPA */}
            {viewMode === 'map' && (
              <div className="grid gap-6 lg:grid-cols-3">
                {/* Mapa Interativo */}
                <div className="lg:col-span-2">
                  <Card className="overflow-hidden">
                    <div className="relative h-[600px] bg-gradient-to-br from-slate-200 to-slate-300 dark:from-slate-700 dark:to-slate-800">
                      {/* Mapa simulado com estilo de ruas */}
                      <div className="absolute inset-0 opacity-20">
                        <div className="absolute inset-0" style={{
                          backgroundImage: `
                            linear-gradient(to right, rgba(0,0,0,0.1) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(0,0,0,0.1) 1px, transparent 1px)
                          `,
                          backgroundSize: '40px 40px',
                        }} />
                      </div>

                      {/* Indicador da cidade */}
                      <div className="absolute top-4 left-4 z-10">
                        <Badge className="bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-lg px-3 py-1.5">
                          <MapPin className="h-4 w-4 mr-1 text-emerald-600" />
                          {searchFilters.city}
                        </Badge>
                      </div>

                      {/* Legenda */}
                      <div className="absolute bottom-4 left-4 z-10 bg-white dark:bg-slate-800 rounded-lg shadow-lg p-3">
                        <p className="text-xs font-medium mb-2">Legenda</p>
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 text-xs">
                            <div className="w-3 h-3 rounded-full bg-emerald-500" />
                            <span>Disponivel</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <div className="w-3 h-3 rounded-full bg-amber-500" />
                            <span>Com Garantidor</span>
                          </div>
                        </div>
                      </div>

                      {/* Zoom Controls */}
                      <div className="absolute top-4 right-4 z-10 flex flex-col gap-1">
                        <Button size="sm" variant="secondary" className="h-8 w-8 p-0 shadow-lg">+</Button>
                        <Button size="sm" variant="secondary" className="h-8 w-8 p-0 shadow-lg">-</Button>
                      </div>

                      {/* Marcadores dos Imoveis */}
                      <TooltipProvider>
                        {filteredProperties.map((property) => {
                          const position = calculateMarkerPosition(property);
                          const isHovered = hoveredProperty === property.id;
                          const isSelected = selectedProperty?.id === property.id;

                          return (
                            <Tooltip key={property.id}>
                              <TooltipTrigger asChild>
                                <button
                                  className={`absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-200 z-20 ${
                                    isHovered || isSelected ? 'scale-125 z-30' : 'hover:scale-110'
                                  }`}
                                  style={{ left: position.left, top: position.top }}
                                  onMouseEnter={() => setHoveredProperty(property.id)}
                                  onMouseLeave={() => setHoveredProperty(null)}
                                  onClick={() => setSelectedProperty(property)}
                                >
                                  <div className={`relative ${isSelected ? 'animate-bounce' : ''}`}>
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg border-2 border-white ${
                                      property.hasGuarantor ? 'bg-amber-500' : 'bg-emerald-500'
                                    }`}>
                                      <Building2 className="h-5 w-5 text-white" />
                                    </div>
                                    {/* Balao de preco */}
                                    <div className={`absolute -top-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap transition-opacity ${
                                      isHovered || isSelected ? 'opacity-100' : 'opacity-0'
                                    }`}>
                                      <Badge className="bg-slate-900 text-white shadow-lg">
                                        R$ {property.rentAmount.toLocaleString('pt-BR')}
                                      </Badge>
                                    </div>
                                  </div>
                                </button>
                              </TooltipTrigger>
                              <TooltipContent side="top" className="max-w-xs">
                                <div className="space-y-1">
                                  <p className="font-semibold">{property.address}</p>
                                  <p className="text-xs text-muted-foreground">{property.neighborhood}</p>
                                  <div className="flex items-center gap-2 text-xs">
                                    <span>{property.bedrooms} quartos</span>
                                    <span>|</span>
                                    <span>{property.area}m2</span>
                                  </div>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          );
                        })}
                      </TooltipProvider>

                      {/* Mensagem quando nao ha imoveis */}
                      {filteredProperties.length === 0 && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center p-8 bg-white dark:bg-slate-800 rounded-xl shadow-lg">
                            <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <p className="text-muted-foreground">Nenhum imovel encontrado nesta area</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </Card>
                </div>

                {/* Lista lateral / Detalhes do imovel selecionado */}
                <div className="space-y-4">
                  {selectedProperty ? (
                    /* Card de Detalhes do Imovel Selecionado */
                    <Card className="border-2 border-emerald-500">
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-lg">{selectedProperty.address}</CardTitle>
                            <CardDescription className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {selectedProperty.neighborhood}, {selectedProperty.city}
                            </CardDescription>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => setSelectedProperty(null)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="aspect-video bg-gradient-to-br from-emerald-500 to-green-600 rounded-lg flex items-center justify-center relative">
                          <Building2 className="h-12 w-12 text-white opacity-50" />
                          {selectedProperty.hasGuarantor && (
                            <Badge className="absolute bottom-2 left-2 bg-amber-600">
                              <Shield className="h-3 w-3 mr-1" />
                              Garantidor Incluso
                            </Badge>
                          )}
                        </div>

                        <div className="grid grid-cols-4 gap-2 text-sm">
                          <div className="flex flex-col items-center p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                            <Bed className="h-4 w-4 text-emerald-600 mb-1" />
                            <span className="font-medium">{selectedProperty.bedrooms}</span>
                            <span className="text-xs text-muted-foreground">Quartos</span>
                          </div>
                          <div className="flex flex-col items-center p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                            <Bath className="h-4 w-4 text-emerald-600 mb-1" />
                            <span className="font-medium">{selectedProperty.bathrooms}</span>
                            <span className="text-xs text-muted-foreground">Banheiros</span>
                          </div>
                          <div className="flex flex-col items-center p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                            <Square className="h-4 w-4 text-emerald-600 mb-1" />
                            <span className="font-medium">{selectedProperty.area}</span>
                            <span className="text-xs text-muted-foreground">m2</span>
                          </div>
                          <div className="flex flex-col items-center p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
                            <Car className="h-4 w-4 text-emerald-600 mb-1" />
                            <span className="font-medium">{selectedProperty.parkingSpaces}</span>
                            <span className="text-xs text-muted-foreground">Vagas</span>
                          </div>
                        </div>

                        <p className="text-sm text-muted-foreground">{selectedProperty.description}</p>

                        <Separator />

                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Aluguel:</span>
                            <span className="font-bold text-lg text-emerald-600">
                              R$ {selectedProperty.rentAmount.toLocaleString('pt-BR')}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Condominio:</span>
                            <span>R$ {selectedProperty.condoFees.toLocaleString('pt-BR')}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">IPTU:</span>
                            <span>R$ {selectedProperty.iptuTax.toLocaleString('pt-BR')}</span>
                          </div>
                          <Separator />
                          <div className="flex justify-between font-semibold">
                            <span>Total Mensal:</span>
                            <span className="text-emerald-600">
                              R$ {(selectedProperty.rentAmount + selectedProperty.condoFees + selectedProperty.iptuTax).toLocaleString('pt-BR')}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 p-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
                          <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center">
                            <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{selectedProperty.landlordName}</p>
                            <p className="text-xs text-muted-foreground">Proprietario - {selectedProperty.landlordRating} estrelas</p>
                          </div>
                        </div>

                        <div className="grid gap-2">
                          <Button
                            className="w-full bg-emerald-600 hover:bg-emerald-700"
                            onClick={() => {
                              setSelectedProperty(selectedProperty);
                              setShowSimulationDialog(true);
                            }}
                          >
                            <Calculator className="h-4 w-4 mr-2" />
                            Simular Locacao
                          </Button>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" className="w-full">
                                <Send className="h-4 w-4 mr-2" />
                                Enviar Proposta
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Enviar Proposta</DialogTitle>
                                <DialogDescription>
                                  {selectedProperty.address} - {selectedProperty.neighborhood}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                  <Label>Valor proposto (aluguel)</Label>
                                  <Input type="number" defaultValue={selectedProperty.rentAmount} />
                                </div>
                                <div className="space-y-2">
                                  <Label>Mensagem ao proprietario</Label>
                                  <Input placeholder="Opcional: conte um pouco sobre voce..." />
                                </div>
                                <Alert>
                                  <Shield className="h-4 w-4" />
                                  <AlertTitle>Seu Score: {tenantData.creditScore}</AlertTitle>
                                  <AlertDescription>
                                    Seu score de credito sera compartilhado com o proprietario.
                                  </AlertDescription>
                                </Alert>
                              </div>
                              <DialogFooter>
                                <Button variant="outline">Cancelar</Button>
                                <Button className="bg-emerald-600">Enviar Proposta</Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    /* Lista de Imoveis Miniatura */
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm">Imoveis na Area</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-2 max-h-[520px] overflow-y-auto">
                        {filteredProperties.map((property) => (
                          <button
                            key={property.id}
                            className={`w-full text-left p-3 rounded-lg border transition-all ${
                              hoveredProperty === property.id
                                ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950'
                                : 'border-border hover:border-emerald-300'
                            }`}
                            onMouseEnter={() => setHoveredProperty(property.id)}
                            onMouseLeave={() => setHoveredProperty(null)}
                            onClick={() => setSelectedProperty(property)}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                property.hasGuarantor ? 'bg-amber-100 dark:bg-amber-900' : 'bg-emerald-100 dark:bg-emerald-900'
                              }`}>
                                <Building2 className={`h-5 w-5 ${
                                  property.hasGuarantor ? 'text-amber-600' : 'text-emerald-600'
                                }`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-sm truncate">{property.address}</p>
                                <p className="text-xs text-muted-foreground">{property.neighborhood}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="secondary" className="text-xs">
                                    {property.bedrooms}q | {property.area}m2
                                  </Badge>
                                  <span className="text-sm font-semibold text-emerald-600">
                                    R$ {property.rentAmount.toLocaleString('pt-BR')}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </button>
                        ))}
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            )}

            {/* VISUALIZACAO EM LISTA */}
            {viewMode === 'list' && (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {filteredProperties.map((property) => (
                  <Card key={property.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                    <div className="aspect-video bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center relative">
                      <Building2 className="h-16 w-16 text-foreground opacity-50" />
                      <button className="absolute top-3 right-3 p-2 bg-background rounded-full shadow hover:scale-110 transition">
                        <Heart className="h-4 w-4 text-rose-500" />
                      </button>
                      {property.hasGuarantor && (
                        <Badge className="absolute bottom-3 left-3 bg-amber-600">
                          <Shield className="h-3 w-3 mr-1" />
                          Garantidor Incluso
                        </Badge>
                      )}
                    </div>
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{property.address}</CardTitle>
                          <CardDescription className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {property.neighborhood}, {property.city}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                          <span className="text-sm font-medium">{property.landlordRating}</span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-4 gap-2 text-sm">
                        <div className="flex items-center gap-1">
                          <Bed className="h-4 w-4 text-muted-foreground" />
                          <span>{property.bedrooms}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Bath className="h-4 w-4 text-muted-foreground" />
                          <span>{property.bathrooms}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Square className="h-4 w-4 text-muted-foreground" />
                          <span>{property.area}m2</span>
                        </div>
                        {property.petFriendly && (
                          <div className="flex items-center gap-1">
                            <PawPrint className="h-4 w-4 text-emerald-400" />
                          </div>
                        )}
                      </div>

                      <Separator />

                      <div className="space-y-1">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Aluguel:</span>
                          <span className="font-bold text-lg">
                            R$ {property.rentAmount.toLocaleString('pt-BR')}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Condominio:</span>
                          <span>R$ {property.condoFees.toLocaleString('pt-BR')}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Total:</span>
                          <span className="font-semibold">
                            R$ {(property.rentAmount + property.condoFees + property.iptuTax).toLocaleString('pt-BR')}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => {
                            setViewMode('map');
                            setSelectedProperty(property);
                          }}
                        >
                          <Map className="h-4 w-4 mr-2" />
                          Ver no Mapa
                        </Button>
                        <Button
                          className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                          onClick={() => {
                            setSelectedProperty(property);
                            setShowSimulationDialog(true);
                          }}
                        >
                          <Calculator className="h-4 w-4 mr-2" />
                          Simular
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* MINHAS PROPOSTAS */}
        {activeTab === 'proposals' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Minhas Propostas</CardTitle>
                <CardDescription>Acompanhe o status das suas propostas de locacao</CardDescription>
              </CardHeader>
              <CardContent>
                {proposals.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Send className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Voce ainda nao enviou nenhuma proposta.</p>
                    <Button className="mt-4" onClick={() => setActiveTab('search')}>
                      <Search className="h-4 w-4 mr-2" />
                      Buscar Imoveis
                    </Button>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Imovel</TableHead>
                        <TableHead>Valor Proposto</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Acao</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {proposals.map((proposal) => (
                        <TableRow key={proposal.id}>
                          <TableCell className="font-medium">
                            {proposal.propertyAddress}
                          </TableCell>
                          <TableCell>
                            R$ {proposal.proposedRent.toLocaleString('pt-BR')}
                            {proposal.counterOfferAmount && (
                              <div className="text-sm text-amber-600">
                                <ArrowRight className="h-3 w-3 inline mr-1" />
                                Contra: R$ {proposal.counterOfferAmount.toLocaleString('pt-BR')}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            {proposal.submittedAt.toLocaleDateString('pt-BR')}
                          </TableCell>
                          <TableCell>
                            {proposal.status === 'pending' && (
                              <Badge variant="outline">
                                <Clock className="h-3 w-3 mr-1" />
                                Pendente
                              </Badge>
                            )}
                            {proposal.status === 'approved' && (
                              <Badge className="bg-green-600">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Aprovada
                              </Badge>
                            )}
                            {proposal.status === 'rejected' && (
                              <Badge variant="destructive">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                Rejeitada
                              </Badge>
                            )}
                            {proposal.status === 'counter_offer' && (
                              <Badge className="bg-amber-600">
                                <ArrowRight className="h-3 w-3 mr-1" />
                                Contra-proposta
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            {proposal.status === 'counter_offer' && (
                              <div className="flex gap-2 justify-end">
                                <Button size="sm" variant="outline">Recusar</Button>
                                <Button size="sm" className="bg-green-600">Aceitar</Button>
                              </div>
                            )}
                            {proposal.status === 'approved' && (
                              <Button size="sm" className="bg-green-600">
                                Assinar Contrato
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* PAGAMENTOS */}
        {activeTab === 'payments' && (
          <div className="space-y-6">
            {/* Card de Pagamento */}
            <Card className="border-2 border-green-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-emerald-400" />
                  Pagar Aluguel
                </CardTitle>
                <CardDescription>
                  Proximo vencimento: {activeContract.nextPaymentDate.toLocaleDateString('pt-BR')}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-lg text-center">
                    <p className="text-sm text-muted-foreground">Valor do Aluguel</p>
                    <p className="text-2xl font-bold">
                      R$ {activeContract.monthlyRent.toLocaleString('pt-BR')}
                    </p>
                  </div>
                  <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg text-center">
                    <p className="text-sm text-muted-foreground">Dias Restantes</p>
                    <p className="text-2xl font-bold text-emerald-400">
                      {daysUntilNextPayment()}
                    </p>
                  </div>
                  <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg text-center">
                    <p className="text-sm text-muted-foreground">Status</p>
                    <Badge className="bg-green-600 mt-1">Em Dia</Badge>
                  </div>
                </div>

                <Separator />

                {/* Split Breakdown */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <h4 className="font-semibold mb-3">Distribuicao Automatica (Split 85/5/5/5)</h4>
                  <div className="grid grid-cols-4 gap-4 text-center text-sm">
                    {(() => {
                      const breakdown = calculatePaymentBreakdown(activeContract.monthlyRent);
                      return (
                        <>
                          <div>
                            <p className="text-muted-foreground">Locador (85%)</p>
                            <p className="font-semibold">R$ {breakdown.landlord.toLocaleString('pt-BR')}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Seguro (5%)</p>
                            <p className="font-semibold">R$ {breakdown.insurer.toLocaleString('pt-BR')}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Plataforma (5%)</p>
                            <p className="font-semibold">R$ {breakdown.platform.toLocaleString('pt-BR')}</p>
                          </div>
                          <div>
                            <p className="text-muted-foreground">Garantidor (5%)</p>
                            <p className="font-semibold">R$ {breakdown.guarantor.toLocaleString('pt-BR')}</p>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-4">
                  <Button size="lg" className="bg-green-600 hover:bg-green-700">
                    <QrCode className="h-5 w-5 mr-2" />
                    Pagar com PIX
                  </Button>
                  <Button size="lg" variant="outline">
                    <Banknote className="h-5 w-5 mr-2" />
                    Gerar Boleto
                  </Button>
                  <Button size="lg" variant="outline">
                    <CreditCard className="h-5 w-5 mr-2" />
                    Cartao de Credito
                  </Button>
                  <Button
                    size="lg"
                    className="bg-indigo-600 hover:bg-indigo-700"
                    onClick={() => setShowWeb3PaymentDialog(true)}
                  >
                    <Wallet className="h-5 w-5 mr-2" />
                    Pagar com Crypto
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Historico Completo */}
            <Card>
              <CardHeader>
                <CardTitle>Historico de Pagamentos</CardTitle>
                <CardDescription>
                  Todos os pagamentos registrados na blockchain
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Metodo</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Hash Blockchain</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paymentHistory.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>{payment.date.toLocaleDateString('pt-BR')}</TableCell>
                        <TableCell className="font-semibold">
                          R$ {payment.amount.toLocaleString('pt-BR')}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {payment.method === 'pix' && <QrCode className="h-4 w-4" />}
                            {payment.method === 'boleto' && <Banknote className="h-4 w-4" />}
                            {payment.method === 'card' && <CreditCard className="h-4 w-4" />}
                            {payment.method.toUpperCase()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className="bg-green-600">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Confirmado
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant="outline" className="font-mono text-xs">
                            {payment.receiptHash}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}

        {/* MEU CONTRATO */}
        {activeTab === 'contract' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Contrato NFT</CardTitle>
                    <CardDescription>
                      Token ID: {activeContract.nftTokenHash}
                    </CardDescription>
                  </div>
                  <Badge className="bg-purple-600">
                    <Smartphone className="h-3 w-3 mr-1" />
                    Polygon Network
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <h4 className="font-semibold">Dados do Contrato</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Imovel:</span>
                        <span className="font-medium">{activeContract.propertyAddress}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Locador:</span>
                        <span className="font-medium">{activeContract.landlordName}</span>
                      </div>
                      {activeContract.guarantorName && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Garantidor:</span>
                          <span className="font-medium">{activeContract.guarantorName}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Aluguel Mensal:</span>
                        <span className="font-medium">R$ {activeContract.monthlyRent.toLocaleString('pt-BR')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Inicio:</span>
                        <span className="font-medium">{activeContract.startDate.toLocaleDateString('pt-BR')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Termino:</span>
                        <span className="font-medium">{activeContract.endDate.toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold">Clausulas Automatizadas</h4>
                    <div className="space-y-2">
                      {[
                        'Reajuste anual pelo IPCA',
                        'Multa de 10% por atraso',
                        'Aviso previo de 30 dias',
                        'Vistoria digital com hash',
                        'Split automatico 85/5/5/5',
                        'Execucao via Smart Contract',
                      ].map((clausula, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-emerald-400" />
                          <span>{clausula}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="flex gap-4">
                  <Button variant="outline" className="flex-1" onClick={handleDownloadContractPDF}>
                    <Download className="h-4 w-4 mr-2" />
                    Baixar Contrato PDF
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => window.open(`https://polygonscan.com/token/${activeContract.nftTokenHash}`, '_blank')}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Ver no Blockchain Explorer
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Vistoria */}
            <Card>
              <CardHeader>
                <CardTitle>Vistoria de Entrada</CardTitle>
                <CardDescription>
                  Registrada na blockchain em {activeContract.startDate.toLocaleDateString('pt-BR')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-4">
                  {['Sala', 'Quarto', 'Cozinha', 'Banheiro'].map((room) => (
                    <Card key={room} className="overflow-hidden">
                      <div className="aspect-video bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                        <Building2 className="h-8 w-8 text-slate-400" />
                      </div>
                      <CardContent className="p-3">
                        <p className="font-medium text-sm">{room}</p>
                        <Badge variant="outline" className="text-xs mt-1">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Excelente
                        </Badge>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Dialog de Pagamento */}
      <Dialog open={showPaymentDialog} onOpenChange={setShowPaymentDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pagar Aluguel</DialogTitle>
            <DialogDescription>
              Escolha o metodo de pagamento preferido
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-lg text-center">
              <p className="text-sm text-muted-foreground">Valor a pagar</p>
              <p className="text-3xl font-bold">
                R$ {activeContract.monthlyRent.toLocaleString('pt-BR')}
              </p>
            </div>

            <div className="grid gap-3">
              <Button size="lg" className="w-full bg-green-600">
                <QrCode className="h-5 w-5 mr-2" />
                Pagar com PIX (Instantaneo)
              </Button>
              <Button size="lg" variant="outline" className="w-full">
                <Banknote className="h-5 w-5 mr-2" />
                Gerar Boleto Bancario
              </Button>
              <Button size="lg" variant="outline" className="w-full">
                <CreditCard className="h-5 w-5 mr-2" />
                Cartao de Credito (ate 3x)
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog de Pagamento Web3/Crypto */}
      <Dialog open={showWeb3PaymentDialog} onOpenChange={setShowWeb3PaymentDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wallet className="h-5 w-5 text-indigo-600" />
              Pagar com Crypto
            </DialogTitle>
            <DialogDescription>
              Pagamento direto na blockchain com split automatico
            </DialogDescription>
          </DialogHeader>

          {(
            <div className="space-y-4 py-4">
              {/* Valor e Split */}
              <div className="p-4 bg-gradient-to-br from-indigo-50 to-violet-50 rounded-xl">
                <div className="text-center mb-4">
                  <p className="text-sm text-muted-foreground">Valor do Aluguel</p>
                  <p className="text-3xl font-bold text-indigo-700">
                    R$ {activeContract.monthlyRent.toLocaleString('pt-BR')}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    ~3500 BRZ (Brazilian Digital Token)
                  </p>
                </div>

                <Separator className="my-4" />

                {/* Split Preview */}
                <div className="space-y-2 text-sm">
                  <p className="font-semibold text-center mb-2">Split Automatico (85/5/5/5)</p>
                  <div className="grid grid-cols-4 gap-2 text-center">
                    <div className="p-2 bg-background rounded-lg">
                      <p className="text-xs text-slate-500">Locador</p>
                      <p className="font-bold text-emerald-600">85%</p>
                    </div>
                    <div className="p-2 bg-background rounded-lg">
                      <p className="text-xs text-slate-500">Seguro</p>
                      <p className="font-bold text-blue-400">5%</p>
                    </div>
                    <div className="p-2 bg-background rounded-lg">
                      <p className="text-xs text-slate-500">Plataforma</p>
                      <p className="font-bold text-violet-600">5%</p>
                    </div>
                    <div className="p-2 bg-background rounded-lg">
                      <p className="text-xs text-slate-500">Garantidor</p>
                      <p className="font-bold text-amber-600">5%</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Wallet Info */}
              <div className="flex items-center justify-between p-3 bg-slate-100 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-sm font-medium">Pagando de:</span>
                </div>
                <Badge variant="outline" className="font-mono">
                  {shortAddress}
                </Badge>
              </div>

              {/* Transaction Status */}
              {isPayingRent && (
                <div className="p-4 bg-indigo-50 rounded-xl text-center">
                  <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mx-auto mb-2" />
                  <p className="font-medium text-indigo-900">{paymentStatusMessage}</p>
                  {transactionHash && (
                    <p className="text-xs text-indigo-600 mt-2 font-mono">
                      TX: {transactionHash.slice(0, 20)}...
                    </p>
                  )}
                </div>
              )}

              {paymentSuccess && (
                <div className="p-4 bg-emerald-50 rounded-xl text-center">
                  <CheckCircle className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
                  <p className="font-medium text-emerald-900">Pagamento Confirmado!</p>
                  <p className="text-sm text-emerald-700 mt-1">
                    Recibo imutavel gerado na blockchain
                  </p>
                  {transactionHash && (
                    <Badge variant="outline" className="font-mono text-xs mt-2">
                      {transactionHash.slice(0, 16)}...
                    </Badge>
                  )}
                </div>
              )}

              {/* Gas Estimate */}
              {!isPayingRent && !paymentSuccess && (
                <div className="flex items-center justify-between text-sm text-slate-500">
                  <span>Taxa de Gas estimada:</span>
                  <span className="font-mono">~0.0023 MATIC</span>
                </div>
              )}

              {/* Pay Button */}
              {!paymentSuccess && (
                <Button
                  size="lg"
                  className="w-full bg-indigo-600 hover:bg-indigo-700"
                  onClick={() => payRent()}
                  disabled={isPayingRent}
                >
                  {isPayingRent ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    <>
                      <Activity className="h-5 w-5 mr-2" />
                      Confirmar Pagamento Blockchain
                    </>
                  )}
                </Button>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog de Simulacao de Locacao */}
      <Dialog open={showSimulationDialog} onOpenChange={setShowSimulationDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-emerald-600" />
              Simular Locacao
            </DialogTitle>
            {selectedProperty && (
              <DialogDescription>
                {selectedProperty.address} - {selectedProperty.neighborhood}
              </DialogDescription>
            )}
          </DialogHeader>

          {selectedProperty && (
            <div className="space-y-6 py-4">
              {/* Resumo do Imovel */}
              <div className="flex items-center gap-4 p-4 bg-slate-100 dark:bg-slate-800 rounded-xl">
                <div className="w-16 h-16 rounded-lg bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center">
                  <Building2 className="h-8 w-8 text-emerald-600" />
                </div>
                <div>
                  <p className="font-semibold">{selectedProperty.address}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedProperty.bedrooms} quartos | {selectedProperty.bathrooms} banheiros | {selectedProperty.area}m2
                  </p>
                </div>
              </div>

              {/* Custos Mensais */}
              <div className="space-y-3">
                <h4 className="font-semibold text-sm">Custos Mensais</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Aluguel</span>
                    <span>R$ {selectedProperty.rentAmount.toLocaleString('pt-BR')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Condominio</span>
                    <span>R$ {selectedProperty.condoFees.toLocaleString('pt-BR')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">IPTU (mensal)</span>
                    <span>R$ {selectedProperty.iptuTax.toLocaleString('pt-BR')}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold text-base">
                    <span>Total Mensal</span>
                    <span className="text-emerald-600">
                      R$ {(selectedProperty.rentAmount + selectedProperty.condoFees + selectedProperty.iptuTax).toLocaleString('pt-BR')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Custos de Entrada */}
              <div className="space-y-3">
                <h4 className="font-semibold text-sm">Custos de Entrada (Estimativa)</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Primeiro Aluguel</span>
                    <span>R$ {selectedProperty.rentAmount.toLocaleString('pt-BR')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Taxa de Plataforma (unica)</span>
                    <span>R$ {(selectedProperty.rentAmount * 0.5).toLocaleString('pt-BR')}</span>
                  </div>
                  {selectedProperty.hasGuarantor && (
                    <div className="flex justify-between text-amber-600">
                      <span>Garantidor Incluso</span>
                      <span>Sem custos adicionais</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-semibold text-base">
                    <span>Total para Mudar</span>
                    <span className="text-emerald-600">
                      R$ {(selectedProperty.rentAmount * 1.5 + selectedProperty.condoFees + selectedProperty.iptuTax).toLocaleString('pt-BR')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Vantagens Vinculo */}
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950 rounded-xl">
                <h4 className="font-semibold text-sm text-emerald-700 dark:text-emerald-300 mb-3">
                  Vantagens Vinculo.io
                </h4>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                    <span>Sem caucao ou deposito</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                    <span>Contrato tokenizado na blockchain</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                    <span>Split automatico de pagamentos</span>
                  </div>
                  {selectedProperty.hasGuarantor && (
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-emerald-600" />
                      <span>Garantidor ja incluso</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-emerald-600" />
                    <span>Seguro residencial incluso</span>
                  </div>
                </div>
              </div>

              {/* Analise de Acessibilidade */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl">
                <h4 className="font-semibold text-sm mb-3">Analise de Acessibilidade</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Sua renda declarada</span>
                    <span>R$ {tenantData.monthlyIncome.toLocaleString('pt-BR')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Comprometimento de renda</span>
                    <span className={
                      ((selectedProperty.rentAmount + selectedProperty.condoFees + selectedProperty.iptuTax) / tenantData.monthlyIncome * 100) > 30
                        ? 'text-amber-600'
                        : 'text-emerald-600'
                    }>
                      {((selectedProperty.rentAmount + selectedProperty.condoFees + selectedProperty.iptuTax) / tenantData.monthlyIncome * 100).toFixed(1)}%
                    </span>
                  </div>
                  <Progress
                    value={(selectedProperty.rentAmount + selectedProperty.condoFees + selectedProperty.iptuTax) / tenantData.monthlyIncome * 100}
                    className="h-2"
                  />
                  <p className="text-xs text-muted-foreground">
                    {((selectedProperty.rentAmount + selectedProperty.condoFees + selectedProperty.iptuTax) / tenantData.monthlyIncome * 100) > 30
                      ? 'O valor ultrapassa 30% da sua renda. Considere negociar ou buscar outras opcoes.'
                      : 'O valor esta dentro do recomendado (ate 30% da renda).'}
                  </p>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowSimulationDialog(false)}>
              Fechar
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bg-emerald-600 hover:bg-emerald-700">
                  <Send className="h-4 w-4 mr-2" />
                  Enviar Proposta
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Enviar Proposta</DialogTitle>
                  <DialogDescription>
                    {selectedProperty?.address} - {selectedProperty?.neighborhood}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label>Valor proposto (aluguel)</Label>
                    <Input type="number" defaultValue={selectedProperty?.rentAmount} />
                  </div>
                  <div className="space-y-2">
                    <Label>Mensagem ao proprietario</Label>
                    <Input placeholder="Opcional: conte um pouco sobre voce..." />
                  </div>
                  <Alert>
                    <Shield className="h-4 w-4" />
                    <AlertTitle>Seu Score: {tenantData.creditScore}</AlertTitle>
                    <AlertDescription>
                      Seu score de credito sera compartilhado com o proprietario.
                    </AlertDescription>
                  </Alert>
                </div>
                <DialogFooter>
                  <Button variant="outline">Cancelar</Button>
                  <Button className="bg-emerald-600">Enviar Proposta</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="bg-background dark:bg-slate-900 border-t mt-16">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <VinculoBrasilLogo size="sm" />
            <p className="text-sm text-muted-foreground">
              Sua locacao segura e transparente - Lei 8.245/91 - LGPD
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
