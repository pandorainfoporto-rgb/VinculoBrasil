/**
 * Vinculo.io - Marketplace de Garantidores
 *
 * O "Tinder" das garantias imobiliarias. Aqui o inquilino escolhe
 * qual imovel vai "bancar" o contrato dele.
 */

import { useState, useMemo } from 'react';
import {
  Search,
  ShieldCheck,
  Star,
  MapPin,
  Building2,
  Filter,
  SlidersHorizontal,
  ChevronDown,
  ArrowUpDown,
  Check,
  Info,
  TrendingUp,
  Users,
  Zap,
  ExternalLink,
  Heart,
  X,
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

// ============================================
// TYPES
// ============================================

interface Guarantor {
  id: string;
  name: string;
  city: string;
  state: string;
  propertyType: 'apartment' | 'house' | 'commercial' | 'land';
  marketValue: number;
  availableLTV: number;
  monthlyFee: number;
  rating: number;
  totalContracts: number;
  successRate: number;
  image: string;
  isVerified: boolean;
  isFavorite: boolean;
  trustScore: number;
  responseTime: string;
}

interface FilterState {
  search: string;
  city: string;
  minValue: number;
  maxValue: number;
  maxFee: number;
  propertyType: string;
  sortBy: 'fee' | 'rating' | 'value' | 'trustScore';
}

// ============================================
// DADOS VAZIOS PARA PRODUCAO
// ============================================

const EMPTY_GUARANTORS: Guarantor[] = [];

const PROPERTY_TYPES = {
  apartment: 'Apartamento',
  house: 'Casa',
  commercial: 'Comercial',
  land: 'Terreno',
};

// ============================================
// HELPER FUNCTIONS
// ============================================

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function getTrustScoreColor(score: number): string {
  if (score >= 900) return 'text-emerald-600 bg-emerald-50';
  if (score >= 800) return 'text-blue-600 bg-blue-50';
  if (score >= 700) return 'text-amber-600 bg-amber-50';
  return 'text-red-600 bg-red-50';
}

function getTrustScoreLabel(score: number): string {
  if (score >= 900) return 'Excelente';
  if (score >= 800) return 'Muito Bom';
  if (score >= 700) return 'Bom';
  return 'Regular';
}

// ============================================
// COMPONENTS
// ============================================

function StatsBar() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      <Card className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-foreground border-0">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Building2 className="h-8 w-8 opacity-80" />
            <div>
              <p className="text-xs opacity-80">Garantidores Ativos</p>
              <p className="text-2xl font-bold">127</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-foreground border-0">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="h-8 w-8 opacity-80" />
            <div>
              <p className="text-xs opacity-80">TVL Disponivel</p>
              <p className="text-2xl font-bold">R$ 8.4M</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-foreground border-0">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8 opacity-80" />
            <div>
              <p className="text-xs opacity-80">Matchings Hoje</p>
              <p className="text-2xl font-bold">14</p>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="bg-gradient-to-br from-zinc-700 to-zinc-800 text-foreground border-0">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-8 w-8 opacity-80" />
            <div>
              <p className="text-xs opacity-80">Taxa de Sucesso</p>
              <p className="text-2xl font-bold">99.2%</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function FilterBar({
  filters,
  onFilterChange,
}: {
  filters: FilterState;
  onFilterChange: (filters: Partial<FilterState>) => void;
}) {
  return (
    <div className="bg-white border rounded-2xl p-4 mb-6 space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            type="text"
            placeholder="Buscar por cidade, nome ou tipo..."
            value={filters.search}
            onChange={(e) => onFilterChange({ search: e.target.value })}
            className="pl-10"
          />
        </div>

        {/* City Filter */}
        <Select value={filters.city} onValueChange={(value) => onFilterChange({ city: value })}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Cidade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as cidades</SelectItem>
            <SelectItem value="Cuiaba">Cuiaba</SelectItem>
            <SelectItem value="Varzea Grande">Varzea Grande</SelectItem>
            <SelectItem value="Sinop">Sinop</SelectItem>
            <SelectItem value="Porto dos Gauchos">Porto dos Gauchos</SelectItem>
          </SelectContent>
        </Select>

        {/* Property Type */}
        <Select
          value={filters.propertyType}
          onValueChange={(value) => onFilterChange({ propertyType: value })}
        >
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tipos</SelectItem>
            <SelectItem value="apartment">Apartamento</SelectItem>
            <SelectItem value="house">Casa</SelectItem>
            <SelectItem value="commercial">Comercial</SelectItem>
          </SelectContent>
        </Select>

        {/* Sort */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <ArrowUpDown className="h-4 w-4" />
              Ordenar
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onFilterChange({ sortBy: 'fee' })}>
              Menor Taxa
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onFilterChange({ sortBy: 'rating' })}>
              Melhor Avaliacao
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onFilterChange({ sortBy: 'trustScore' })}>
              Maior Trust Score
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onFilterChange({ sortBy: 'value' })}>
              Maior Capacidade
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Advanced Filters */}
      <div className="flex flex-wrap gap-4 items-center pt-2 border-t">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Taxa ate:</span>
          <Badge variant="outline" className="font-mono">
            R$ {filters.maxFee}
          </Badge>
          <Slider
            value={[filters.maxFee]}
            onValueChange={([value]) => onFilterChange({ maxFee: value })}
            min={50}
            max={500}
            step={10}
            className="w-32"
          />
        </div>
        <Separator orientation="vertical" className="h-6" />
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Capacidade min:</span>
          <Badge variant="outline" className="font-mono">
            {formatCurrency(filters.minValue)}
          </Badge>
        </div>
      </div>
    </div>
  );
}

function GuarantorCard({
  guarantor,
  onSelect,
  onToggleFavorite,
}: {
  guarantor: Guarantor;
  onSelect: (g: Guarantor) => void;
  onToggleFavorite: (id: string) => void;
}) {
  return (
    <Card className="overflow-hidden hover:shadow-xl transition-all group border-border">
      {/* Image */}
      <div className="h-48 overflow-hidden relative">
        <img
          src={guarantor.image}
          alt={guarantor.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          {guarantor.isVerified && (
            <Badge className="bg-emerald-500 text-foreground border-0 gap-1">
              <ShieldCheck className="h-3 w-3" />
              Verificado
            </Badge>
          )}
        </div>

        {/* Rating */}
        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur px-2.5 py-1 rounded-full flex items-center gap-1 text-xs font-bold">
          <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
          {guarantor.rating}
        </div>

        {/* Favorite Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(guarantor.id);
          }}
          className="absolute bottom-3 right-3 w-9 h-9 bg-white/90 backdrop-blur rounded-full flex items-center justify-center hover:bg-white transition-colors"
        >
          <Heart
            className={`h-5 w-5 ${
              guarantor.isFavorite ? 'text-red-500 fill-red-500' : 'text-muted-foreground'
            }`}
          />
        </button>
      </div>

      {/* Content */}
      <CardContent className="p-5 space-y-4">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <h3 className="font-bold text-lg text-foreground leading-tight">{guarantor.name}</h3>
            <p className="text-muted-foreground text-xs flex items-center gap-1 mt-1">
              <MapPin className="h-3 w-3" />
              {guarantor.city}, {guarantor.state}
            </p>
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Badge className={`${getTrustScoreColor(guarantor.trustScore)} font-mono`}>
                  {guarantor.trustScore}
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <p>Trust Score: {getTrustScoreLabel(guarantor.trustScore)}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-2.5 bg-muted rounded-lg">
            <p className="text-[10px] text-muted-foreground uppercase font-medium">Capacidade LTV</p>
            <p className="text-sm font-bold text-foreground">{formatCurrency(guarantor.availableLTV)}</p>
          </div>
          <div className="p-2.5 bg-muted rounded-lg">
            <p className="text-[10px] text-muted-foreground uppercase font-medium">Contratos</p>
            <p className="text-sm font-bold text-foreground">
              {guarantor.totalContracts}{' '}
              <span className="text-emerald-600 text-xs">({guarantor.successRate}%)</span>
            </p>
          </div>
        </div>

        <Separator />

        {/* Footer */}
        <div className="flex justify-between items-center">
          <div>
            <p className="text-[10px] text-muted-foreground font-medium uppercase">Taxa Mensal</p>
            <p className="text-xl font-black text-indigo-600">
              R$ {guarantor.monthlyFee}
              <span className="text-xs font-normal text-muted-foreground">/mes</span>
            </p>
          </div>
          <Button
            onClick={() => onSelect(guarantor)}
            className="bg-card hover:bg-indigo-600 transition-colors"
          >
            Selecionar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function GuarantorDetailDialog({
  guarantor,
  isOpen,
  onClose,
  onConfirm,
}: {
  guarantor: Guarantor | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  if (!guarantor) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl overflow-hidden">
              <img src={guarantor.image} alt={guarantor.name} className="w-full h-full object-cover" />
            </div>
            <div>
              <span>{guarantor.name}</span>
              <p className="text-sm text-muted-foreground font-normal flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {guarantor.city}, {guarantor.state}
              </p>
            </div>
          </DialogTitle>
          <DialogDescription>Confirme os detalhes antes de selecionar este garantidor</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Trust Score */}
          <div className="p-4 bg-gradient-to-br from-indigo-50 to-emerald-50 rounded-xl">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground/70">Trust Score</p>
                <p className="text-3xl font-black text-indigo-600">{guarantor.trustScore}</p>
                <p className="text-xs text-muted-foreground">{getTrustScoreLabel(guarantor.trustScore)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground/70">Taxa de Sucesso</p>
                <p className="text-3xl font-black text-emerald-600">{guarantor.successRate}%</p>
                <p className="text-xs text-muted-foreground">{guarantor.totalContracts} contratos</p>
              </div>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground uppercase">Valor de Mercado</p>
                <p className="text-lg font-bold">{formatCurrency(guarantor.marketValue)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground uppercase">Capacidade Disponivel</p>
                <p className="text-lg font-bold text-emerald-600">
                  {formatCurrency(guarantor.availableLTV)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground uppercase">Tipo de Imovel</p>
                <p className="text-lg font-bold">
                  {PROPERTY_TYPES[guarantor.propertyType]}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <p className="text-xs text-muted-foreground uppercase">Tempo de Resposta</p>
                <p className="text-lg font-bold flex items-center gap-2">
                  <Zap className="h-4 w-4 text-amber-500" />
                  {guarantor.responseTime}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Fee Highlight */}
          <div className="p-4 bg-card rounded-xl text-foreground flex justify-between items-center">
            <div>
              <p className="text-muted-foreground text-sm">Taxa Mensal de Garantia</p>
              <p className="text-2xl font-black">R$ {guarantor.monthlyFee}/mes</p>
            </div>
            <div className="text-right">
              <p className="text-muted-foreground text-sm">Split do Aluguel</p>
              <p className="text-sm">
                <span className="text-indigo-400">85%</span> Locador |{' '}
                <span className="text-amber-400">5%</span> Garantidor |{' '}
                <span className="text-emerald-400">5%</span> Seguro |{' '}
                <span className="text-muted-foreground">5%</span> Plataforma
              </p>
            </div>
          </div>

          {/* Warning */}
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
            <Info className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-amber-700">
              Ao confirmar, este garantidor sera vinculado ao seu contrato de locacao. A taxa mensal
              sera adicionada ao valor do aluguel automaticamente.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={onConfirm} className="bg-emerald-600 hover:bg-emerald-700 gap-2">
            <Check className="h-4 w-4" />
            Confirmar Garantidor
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export function GuarantorMarketplace() {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    city: 'all',
    minValue: 0,
    maxValue: 2000000,
    maxFee: 500,
    propertyType: 'all',
    sortBy: 'fee',
  });

  const [guarantors, setGuarantors] = useState<Guarantor[]>(EMPTY_GUARANTORS);
  const [selectedGuarantor, setSelectedGuarantor] = useState<Guarantor | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleFilterChange = (newFilters: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleToggleFavorite = (id: string) => {
    setGuarantors((prev) =>
      prev.map((g) => (g.id === id ? { ...g, isFavorite: !g.isFavorite } : g))
    );
  };

  const handleSelectGuarantor = (guarantor: Guarantor) => {
    setSelectedGuarantor(guarantor);
    setIsDialogOpen(true);
  };

  const handleConfirmGuarantor = () => {
    console.log('Garantidor selecionado:', selectedGuarantor);
    setIsDialogOpen(false);
    // TODO: Navigate to contract minting or next step
  };

  const filteredGuarantors = useMemo(() => {
    let result = [...guarantors];

    // Search filter
    if (filters.search) {
      const search = filters.search.toLowerCase();
      result = result.filter(
        (g) =>
          g.name.toLowerCase().includes(search) ||
          g.city.toLowerCase().includes(search) ||
          PROPERTY_TYPES[g.propertyType].toLowerCase().includes(search)
      );
    }

    // City filter
    if (filters.city !== 'all') {
      result = result.filter((g) => g.city === filters.city);
    }

    // Property type filter
    if (filters.propertyType !== 'all') {
      result = result.filter((g) => g.propertyType === filters.propertyType);
    }

    // Fee filter
    result = result.filter((g) => g.monthlyFee <= filters.maxFee);

    // Sort
    switch (filters.sortBy) {
      case 'fee':
        result.sort((a, b) => a.monthlyFee - b.monthlyFee);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'trustScore':
        result.sort((a, b) => b.trustScore - a.trustScore);
        break;
      case 'value':
        result.sort((a, b) => b.availableLTV - a.availableLTV);
        break;
    }

    return result;
  }, [guarantors, filters]);

  return (
    <div className="min-h-screen bg-muted">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-3xl font-black text-foreground">Marketplace de Garantidores</h1>
              <p className="text-muted-foreground mt-1">
                Encontre o lastro ideal para o seu novo contrato de locacao
              </p>
            </div>
            <Badge variant="outline" className="gap-1">
              <Zap className="h-3 w-3 text-amber-500" />
              {filteredGuarantors.length} disponiveis
            </Badge>
          </div>
        </div>

        {/* Stats */}
        <StatsBar />

        {/* Filters */}
        <FilterBar filters={filters} onFilterChange={handleFilterChange} />

        {/* Grid */}
        {filteredGuarantors.length === 0 ? (
          <Card className="py-12 text-center">
            <CardContent>
              <Building2 className="h-12 w-12 mx-auto text-foreground mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                Nenhum garantidor encontrado
              </h3>
              <p className="text-muted-foreground mb-4">Tente ajustar os filtros de busca</p>
              <Button
                variant="outline"
                onClick={() =>
                  setFilters({
                    search: '',
                    city: 'all',
                    minValue: 0,
                    maxValue: 2000000,
                    maxFee: 500,
                    propertyType: 'all',
                    sortBy: 'fee',
                  })
                }
              >
                Limpar Filtros
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredGuarantors.map((guarantor) => (
              <GuarantorCard
                key={guarantor.id}
                guarantor={guarantor}
                onSelect={handleSelectGuarantor}
                onToggleFavorite={handleToggleFavorite}
              />
            ))}
          </div>
        )}

        {/* Detail Dialog */}
        <GuarantorDetailDialog
          guarantor={selectedGuarantor}
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          onConfirm={handleConfirmGuarantor}
        />
      </div>
    </div>
  );
}

export default GuarantorMarketplace;
