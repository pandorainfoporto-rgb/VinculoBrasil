// ============================================
// AGENCY OS - Carteira de Imóveis
// Listagem com visão de rentabilidade
// ============================================

import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { AgencyLayout } from '@/components/layouts/AgencyLayout';
import {
  Home,
  Building2,
  Plus,
  Search,
  MapPin,
  Bed,
  Bath,
  Car,
  DollarSign,
  Rocket,
  MoreHorizontal,
  Eye,
  Pencil,
  TrendingUp,
  CheckCircle,
  Clock,
  AlertTriangle,
  Loader2,
  Filter,
  Users,
  Wallet,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

export const Route = createFileRoute('/agency/properties/')({
  component: AgencyPropertiesList,
});

// ============================================
// TIPOS
// ============================================
interface PropertyOwner {
  id: string;
  name: string;
  email: string;
  phone?: string;
  pixKey?: string;
}

interface PropertyCommission {
  rate: number;
  model: string;
  value: number;
  ownerReceives: number;
  tenantPays: number;
}

interface Property {
  id: string;
  title: string;
  description?: string;
  type: string;
  status: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  fullAddress: string;
  area?: number;
  bedrooms?: number;
  bathrooms?: number;
  parkingSpaces?: number;
  rentValue: number;
  condoFee?: number;
  iptuValue?: number;
  owner: PropertyOwner;
  commission: PropertyCommission;
  isPromoted: boolean;
  promotedUntil?: string;
  isPublished: boolean;
  thumbnail?: string;
  _count: {
    contracts: number;
    inspections: number;
  };
  createdAt: string;
}

interface Stats {
  total: number;
  available: number;
  rented: number;
  promoted: number;
  maintenance: number;
  totalRentValue: number;
  commissionRate: number;
  potentialMonthlyCommission: number;
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
function AgencyPropertiesList() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [promoteDialogOpen, setPromoteDialogOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [promoteDays, setPromoteDays] = useState(7);
  const [promoting, setPromoting] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL || 'https://vinculobrasil-production.up.railway.app';

  // ============================================
  // FETCH PROPERTIES
  // ============================================
  const fetchProperties = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      if (statusFilter && statusFilter !== 'all') {
        params.append('status', statusFilter.toUpperCase());
      }
      if (searchTerm) {
        params.append('search', searchTerm);
      }

      const res = await fetch(`${API_URL}/api/agency/properties?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error('Erro ao carregar imóveis');

      const data = await res.json();
      setProperties(data.properties || []);
    } catch (err) {
      console.error('Erro ao buscar imóveis:', err);
      toast.error('Erro ao carregar lista de imóveis');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/agency/properties/stats/summary`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Erro ao buscar estatísticas:', err);
    }
  };

  useEffect(() => {
    fetchProperties();
    fetchStats();
  }, [statusFilter]);

  // ============================================
  // PROMOVER IMÓVEL
  // ============================================
  const handlePromote = async () => {
    if (!selectedProperty) return;

    setPromoting(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/api/agency/properties/${selectedProperty.id}/promote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          days: promoteDays,
          promotionType: 'FIXED_TIME',
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Erro ao promover imóvel');
      }

      toast.success(`Imóvel promovido por ${promoteDays} dias!`);
      setPromoteDialogOpen(false);
      setSelectedProperty(null);
      fetchProperties();
      fetchStats();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Erro desconhecido';
      toast.error(message);
    } finally {
      setPromoting(false);
    }
  };

  // ============================================
  // FORMATADORES
  // ============================================
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const getStatusBadge = (status: string) => {
    const configs: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ReactNode }> = {
      AVAILABLE: { label: 'Disponível', variant: 'default', icon: <CheckCircle className="h-3 w-3" /> },
      RENTED: { label: 'Alugado', variant: 'secondary', icon: <Users className="h-3 w-3" /> },
      MAINTENANCE: { label: 'Manutenção', variant: 'destructive', icon: <AlertTriangle className="h-3 w-3" /> },
      RESERVED: { label: 'Reservado', variant: 'outline', icon: <Clock className="h-3 w-3" /> },
      INACTIVE: { label: 'Inativo', variant: 'outline', icon: <AlertTriangle className="h-3 w-3" /> },
    };
    const config = configs[status] || configs.AVAILABLE;
    return (
      <Badge variant={config.variant} className="gap-1 text-xs">
        {config.icon}
        {config.label}
      </Badge>
    );
  };

  const getPropertyTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      APARTMENT: 'Apartamento',
      HOUSE: 'Casa',
      COMMERCIAL: 'Comercial',
      LAND: 'Terreno',
      KITNET: 'Kitnet',
      LOFT: 'Loft',
      STUDIO: 'Studio',
      FARM: 'Chácara/Sítio',
      WAREHOUSE: 'Galpão',
    };
    return types[type] || type;
  };

  // ============================================
  // FILTRO DE BUSCA
  // ============================================
  const filteredProperties = properties.filter(
    (prop) =>
      prop.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prop.fullAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prop.owner.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ============================================
  // LOADING STATE
  // ============================================
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  // ============================================
  // RENDER
  // ============================================
  return (
    <AgencyLayout agencyName="Minha Imobiliaria" userName="Usuario" userEmail="usuario@email.com">
    <div className="space-y-6 p-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Building2 className="h-7 w-7 text-blue-600" />
            Carteira de Imóveis
          </h1>
          <p className="text-gray-500 mt-1">
            Gerencie seus ativos e acompanhe a rentabilidade.
          </p>
        </div>
        <a href="/agency/properties/new">
          <Button className="bg-blue-600 hover:bg-blue-700 gap-2">
            <Plus className="h-4 w-4" /> Novo Imóvel
          </Button>
        </a>
      </div>

      {/* KPIs */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Total de Imóveis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Home className="h-5 w-5 text-blue-500" />
                <span className="text-2xl font-bold">{stats.total}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Disponíveis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-2xl font-bold">{stats.available}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Alugados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-500" />
                <span className="text-2xl font-bold">{stats.rented}</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-700">Receita Potencial/Mês</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Wallet className="h-5 w-5 text-green-600" />
                <span className="text-xl font-bold text-green-700">
                  {formatCurrency(stats.potentialMonthlyCommission)}
                </span>
              </div>
              <p className="text-xs text-green-600 mt-1">
                Taxa: {stats.commissionRate}%
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* FILTROS */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Buscar por endereço, título ou proprietário..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Todos os status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="available">Disponíveis</SelectItem>
            <SelectItem value="rented">Alugados</SelectItem>
            <SelectItem value="maintenance">Manutenção</SelectItem>
            <SelectItem value="reserved">Reservados</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* TABELA */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">
                  Imóvel
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">
                  Proprietário
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">
                  Aluguel
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">
                  Sua Comissão
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProperties.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-400">
                    <Home className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                    {searchTerm
                      ? 'Nenhum imóvel encontrado com esse termo.'
                      : 'Nenhum imóvel cadastrado ainda.'}
                  </td>
                </tr>
              ) : (
                filteredProperties.map((prop) => (
                  <tr key={prop.id} className="hover:bg-gray-50 transition-colors">
                    {/* IMÓVEL */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
                          {prop.thumbnail ? (
                            <img
                              src={prop.thumbnail}
                              alt={prop.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Home className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 flex items-center gap-2">
                            {prop.title}
                            {prop.isPromoted && (
                              <Badge variant="secondary" className="bg-orange-100 text-orange-700 text-[10px]">
                                <Rocket className="h-3 w-3 mr-1" />
                                Destaque
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                            <MapPin className="h-3 w-3" />
                            {prop.neighborhood}, {prop.city}/{prop.state}
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                            {prop.bedrooms !== undefined && prop.bedrooms > 0 && (
                              <span className="flex items-center gap-1">
                                <Bed className="h-3 w-3" /> {prop.bedrooms}
                              </span>
                            )}
                            {prop.bathrooms !== undefined && prop.bathrooms > 0 && (
                              <span className="flex items-center gap-1">
                                <Bath className="h-3 w-3" /> {prop.bathrooms}
                              </span>
                            )}
                            {prop.parkingSpaces !== undefined && prop.parkingSpaces > 0 && (
                              <span className="flex items-center gap-1">
                                <Car className="h-3 w-3" /> {prop.parkingSpaces}
                              </span>
                            )}
                            {prop.area && (
                              <span>{Number(prop.area)}m²</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* PROPRIETÁRIO */}
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-700">{prop.owner.name}</div>
                      <div className="text-xs text-gray-400">{prop.owner.email}</div>
                      {prop.owner.pixKey && (
                        <Badge variant="outline" className="mt-1 text-[10px] text-green-600 border-green-200">
                          <Wallet className="h-3 w-3 mr-1" /> PIX
                        </Badge>
                      )}
                    </td>

                    {/* ALUGUEL */}
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900">
                        {formatCurrency(prop.rentValue)}
                      </div>
                      {prop.condoFee && Number(prop.condoFee) > 0 && (
                        <div className="text-xs text-gray-400">
                          + {formatCurrency(Number(prop.condoFee))} condo
                        </div>
                      )}
                    </td>

                    {/* COMISSÃO */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-green-600 flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          {formatCurrency(prop.commission.value)}
                        </span>
                        <span className="text-[10px] text-gray-400">
                          {prop.commission.rate}% - {prop.commission.model === 'DEDUCT_FROM_OWNER' ? 'Deduzido' : 'Adicionado'}
                        </span>
                      </div>
                    </td>

                    {/* STATUS */}
                    <td className="px-6 py-4">
                      {getStatusBadge(prop.status)}
                      {prop._count.contracts > 0 && (
                        <div className="text-[10px] text-gray-400 mt-1">
                          {prop._count.contracts} contrato(s)
                        </div>
                      )}
                    </td>

                    {/* AÇÕES */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-orange-500 bg-orange-50 hover:bg-orange-100"
                          title="Impulsionar Anúncio"
                          onClick={() => {
                            setSelectedProperty(prop);
                            setPromoteDialogOpen(true);
                          }}
                        >
                          <Rocket className="h-4 w-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-gray-400 hover:text-gray-900"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              Ver Detalhes
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Pencil className="h-4 w-4 mr-2" />
                              Editar Imóvel
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>
                              <TrendingUp className="h-4 w-4 mr-2" />
                              Criar Contrato
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DIALOG DE PROMOÇÃO */}
      <Dialog open={promoteDialogOpen} onOpenChange={setPromoteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Rocket className="h-5 w-5 text-orange-500" />
              Impulsionar Imóvel
            </DialogTitle>
            <DialogDescription>
              Destaque este imóvel no topo das buscas e no site whitelabel.
            </DialogDescription>
          </DialogHeader>

          {selectedProperty && (
            <div className="space-y-4 py-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="font-medium">{selectedProperty.title}</div>
                <div className="text-sm text-gray-500">{selectedProperty.fullAddress}</div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Período de Destaque</label>
                <Select
                  value={promoteDays.toString()}
                  onValueChange={(v) => setPromoteDays(parseInt(v))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">7 dias</SelectItem>
                    <SelectItem value="15">15 dias</SelectItem>
                    <SelectItem value="30">30 dias</SelectItem>
                    <SelectItem value="60">60 dias</SelectItem>
                    <SelectItem value="90">90 dias</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <div className="flex items-center gap-2 text-orange-700 font-medium">
                  <TrendingUp className="h-4 w-4" />
                  Benefícios do Destaque
                </div>
                <ul className="text-sm text-orange-600 mt-2 space-y-1">
                  <li>• Aparece no topo das listagens</li>
                  <li>• Badge de "Destaque" no anúncio</li>
                  <li>• Maior visibilidade no site whitelabel</li>
                </ul>
              </div>

              <Button
                onClick={handlePromote}
                className="w-full bg-orange-500 hover:bg-orange-600"
                disabled={promoting}
              >
                {promoting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Promovendo...
                  </>
                ) : (
                  <>
                    <Rocket className="h-4 w-4 mr-2" />
                    Promover por {promoteDays} dias
                  </>
                )}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
    </AgencyLayout>
  );
}
