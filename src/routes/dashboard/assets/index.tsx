import { createFileRoute, Link } from '@tanstack/react-router';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Building2,
  TrendingUp,
  Wallet,
  Plus,
  ExternalLink,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Home,
  MapPin,
  Shield,
  FileSearch,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const Route = createFileRoute('/dashboard/assets/' as any)({
  component: AssetPortfolioDashboard,
});

// Mock data for demonstration
interface Asset {
  id: string;
  title: string;
  address: string;
  city: string;
  state: string;
  type: 'APARTMENT' | 'HOUSE' | 'COMMERCIAL';
  status: 'ACTIVE' | 'PENDING_PAYMENT' | 'VALIDATING';
  tokenId?: string;
  monthlyRent: number;
  guaranteeFee: number;
  createdAt: string;
  paymentDueDate?: string;
  image?: string;
}

const MOCK_ASSETS: Asset[] = [
  {
    id: '1',
    title: 'Edifício Fatto Tower - Apto 402',
    address: 'Av. Paulista, 1000',
    city: 'São Paulo',
    state: 'SP',
    type: 'APARTMENT',
    status: 'ACTIVE',
    tokenId: 'VB-00001',
    monthlyRent: 4500,
    guaranteeFee: 225,
    createdAt: '2024-01-15',
  },
  {
    id: '2',
    title: 'Casa Condomínio Jardins',
    address: 'Rua das Flores, 250',
    city: 'Campinas',
    state: 'SP',
    type: 'HOUSE',
    status: 'PENDING_PAYMENT',
    monthlyRent: 3200,
    guaranteeFee: 160,
    createdAt: '2024-01-18',
    paymentDueDate: '2024-01-22',
  },
  {
    id: '3',
    title: 'Loja Comercial Centro',
    address: 'Rua XV de Novembro, 450',
    city: 'Curitiba',
    state: 'PR',
    type: 'COMMERCIAL',
    status: 'VALIDATING',
    monthlyRent: 6800,
    guaranteeFee: 340,
    createdAt: '2024-01-19',
  },
];

// Calculate portfolio metrics
function calculateMetrics(assets: Asset[]) {
  const activeAssets = assets.filter(a => a.status === 'ACTIVE');
  const totalPatrimony = assets.reduce((sum, a) => sum + (a.monthlyRent * 12 * 25), 0); // Rough valuation
  const monthlyIncome = activeAssets.reduce((sum, a) => sum + a.guaranteeFee, 0);

  return {
    totalPatrimony,
    monthlyIncome,
    activeCount: activeAssets.length,
    totalCount: assets.length,
  };
}

const PROPERTY_TYPE_ICONS: Record<string, string> = {
  APARTMENT: '🏢',
  HOUSE: '🏠',
  COMMERCIAL: '🏪',
};

function AssetPortfolioDashboard() {
  const assets = MOCK_ASSETS;
  const metrics = calculateMetrics(assets);
  const isEmpty = assets.length === 0;

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Wallet className="w-8 h-8 text-primary" />
            Carteira de Ativos
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie seus imóveis tokenizados e acompanhe sua renda passiva
          </p>
        </div>
        <Button asChild size="lg" className="gap-2">
          <Link to="/assets/new">
            <Plus className="w-5 h-5" />
            Novo Ativo
          </Link>
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-blue-200 dark:border-blue-800">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2 text-blue-600 dark:text-blue-400">
              <Building2 className="w-4 h-4" />
              Patrimônio Tokenizado
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">
              R$ {metrics.totalPatrimony.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              Valor estimado dos imóveis
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 border-green-200 dark:border-green-800">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2 text-green-600 dark:text-green-400">
              <TrendingUp className="w-4 h-4" />
              Renda Passiva Mensal (Est.)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-900 dark:text-green-100">
              R$ {metrics.monthlyIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-green-600 dark:text-green-400 mt-1">
              Soma das taxas de garantia (5%)
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950 dark:to-violet-950 border-purple-200 dark:border-purple-800">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2 text-purple-600 dark:text-purple-400">
              <Shield className="w-4 h-4" />
              Ativos Ativos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-900 dark:text-purple-100">
              {metrics.activeCount}/{metrics.totalCount}
            </div>
            <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">
              Imóveis garantindo contratos
            </p>
          </CardContent>
        </Card>
      </div>

      <Separator className="mb-8" />

      {/* Assets List */}
      {isEmpty ? (
        <EmptyState />
      ) : (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Home className="w-5 h-5" />
            Meus Imóveis ({assets.length})
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {assets.map((asset) => (
              <AssetCard key={asset.id} asset={asset} />
            ))}
          </div>
        </div>
      )}

      {/* Floating Action Button (Mobile) */}
      <div className="fixed bottom-6 right-6 md:hidden">
        <Button asChild size="lg" className="rounded-full w-14 h-14 shadow-lg">
          <Link to="/assets/new">
            <Plus className="w-6 h-6" />
          </Link>
        </Button>
      </div>
    </div>
  );
}

// Asset Card Component
function AssetCard({ asset }: { asset: Asset }) {
  const statusConfig = {
    ACTIVE: {
      color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
      dotColor: 'bg-green-500',
      label: 'Ativo & Garantindo',
      icon: CheckCircle2,
    },
    PENDING_PAYMENT: {
      color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
      dotColor: 'bg-yellow-500',
      label: 'Aguardando Compensação',
      icon: Clock,
    },
    VALIDATING: {
      color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
      dotColor: 'bg-blue-500',
      label: 'Análise Jurídica',
      icon: FileSearch,
    },
  };

  const status = statusConfig[asset.status];
  const StatusIcon = status.icon;

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow">
      {/* Image Placeholder */}
      <div className="h-40 bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
        <div className="text-6xl">{PROPERTY_TYPE_ICONS[asset.type]}</div>
      </div>

      <CardContent className="p-4 space-y-4">
        {/* Title & Address */}
        <div>
          <h3 className="font-bold text-lg line-clamp-1">{asset.title}</h3>
          <p className="text-sm text-muted-foreground flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {asset.city} - {asset.state}
          </p>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-2">
          <Badge className={cn('gap-1', status.color)}>
            <div className={cn('w-2 h-2 rounded-full', status.dotColor)} />
            {status.label}
          </Badge>
        </div>

        {/* Token ID (if active) */}
        {asset.tokenId && (
          <div className="flex items-center gap-2 text-sm">
            <Shield className="w-4 h-4 text-primary" />
            <span className="font-mono font-semibold">NFT #{asset.tokenId}</span>
          </div>
        )}

        {/* Warning for pending payment */}
        {asset.status === 'PENDING_PAYMENT' && asset.paymentDueDate && (
          <div className="flex items-center gap-2 text-sm text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-950 p-2 rounded-lg">
            <AlertTriangle className="w-4 h-4" />
            <span>Boleto vence em 2 dias</span>
          </div>
        )}

        {/* Info for validating */}
        {asset.status === 'VALIDATING' && (
          <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 p-2 rounded-lg">
            <FileSearch className="w-4 h-4" />
            <span>Validando matrícula (Prazo: 24h)</span>
          </div>
        )}

        {/* Financial Info */}
        <div className="grid grid-cols-2 gap-2 text-sm pt-2 border-t">
          <div>
            <div className="text-muted-foreground">Aluguel Mensal</div>
            <div className="font-semibold">
              R$ {asset.monthlyRent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </div>
          <div>
            <div className="text-muted-foreground">Garantia (5%)</div>
            <div className="font-semibold text-green-600">
              R$ {asset.guaranteeFee.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-2">
          {asset.status === 'ACTIVE' && (
            <Button variant="outline" className="w-full gap-2" size="sm">
              <ExternalLink className="w-4 h-4" />
              Ver na Blockchain
            </Button>
          )}
          {asset.status === 'PENDING_PAYMENT' && (
            <Button asChild className="w-full gap-2 bg-yellow-600 hover:bg-yellow-700" size="sm">
              <Link to="/assets/pending">
                <Clock className="w-4 h-4" />
                Pagar Setup
              </Link>
            </Button>
          )}
          {asset.status === 'VALIDATING' && (
            <Button variant="secondary" className="w-full gap-2" size="sm" disabled>
              <FileSearch className="w-4 h-4" />
              Em Análise
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Empty State Component
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary/10 to-purple-500/10 flex items-center justify-center mb-6">
        <Building2 className="w-16 h-16 text-primary" />
      </div>
      <h2 className="text-2xl font-bold text-center mb-2">
        Sua Carteira Está Vazia
      </h2>
      <p className="text-muted-foreground text-center max-w-md mb-8">
        Comece a construir seu império de garantias reais. Tokenize seu primeiro
        imóvel e comece a ganhar 5% de taxa de garantia em cada contrato.
      </p>
      <Button asChild size="lg" className="gap-2">
        <Link to="/assets/new">
          Tokenizar Meu Primeiro Imóvel
          <ArrowRight className="w-5 h-5" />
        </Link>
      </Button>

      <div className="mt-12 grid md:grid-cols-3 gap-6 max-w-3xl">
        <div className="text-center p-4">
          <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center mx-auto mb-3">
            <Shield className="w-6 h-6 text-green-600" />
          </div>
          <div className="font-semibold mb-1">NFT de Garantia</div>
          <p className="text-sm text-muted-foreground">
            Seu imóvel vira um token na blockchain
          </p>
        </div>
        <div className="text-center p-4">
          <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center mx-auto mb-3">
            <TrendingUp className="w-6 h-6 text-blue-600" />
          </div>
          <div className="font-semibold mb-1">Renda Passiva</div>
          <p className="text-sm text-muted-foreground">
            Ganhe 5% em cada contrato garantido
          </p>
        </div>
        <div className="text-center p-4">
          <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center mx-auto mb-3">
            <Wallet className="w-6 h-6 text-purple-600" />
          </div>
          <div className="font-semibold mb-1">Liquidez</div>
          <p className="text-sm text-muted-foreground">
            Venda seu NFT no marketplace
          </p>
        </div>
      </div>
    </div>
  );
}
