// ============================================
// ROTA /admin/properties - Gestão de Imóveis
// CONECTADO A DADOS REAIS - ZERO MOCKS
// ============================================

import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Home,
  Plus,
  Search,
  MapPin,
  DollarSign,
  Bed,
  Bath,
  Car,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  XCircle,
  RefreshCw,
  AlertCircle,
  Building2,
  Loader2,
} from "lucide-react";
import { useAgencyProperties, type Property } from "@/hooks/use-agency-properties";

export const Route = createFileRoute("/admin/properties")({
  component: PropertiesPage,
});

// ============================================
// STATUS CONFIG
// ============================================
const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  AVAILABLE: { label: "Disponível", color: "bg-green-600", icon: CheckCircle },
  RENTED: { label: "Alugado", color: "bg-blue-600", icon: CheckCircle },
  MAINTENANCE: { label: "Manutenção", color: "bg-yellow-600", icon: Clock },
  UNAVAILABLE: { label: "Indisponível", color: "bg-red-600", icon: XCircle },
};

// ============================================
// EMPTY STATE COMPONENT
// ============================================
function EmptyState() {
  return (
    <div className="text-center py-16">
      <Building2 className="h-16 w-16 mx-auto text-zinc-600 mb-4" />
      <h3 className="text-lg font-medium text-zinc-300 mb-2">
        Nenhum imóvel cadastrado
      </h3>
      <p className="text-zinc-500 max-w-sm mx-auto mb-6">
        Comece cadastrando seu primeiro imóvel para gerenciá-lo na plataforma.
      </p>
      <Button className="bg-blue-600 hover:bg-blue-700">
        <Plus className="h-4 w-4 mr-2" />
        Cadastrar Primeiro Imóvel
      </Button>
    </div>
  );
}

// ============================================
// LOADING SKELETON
// ============================================
function TableSkeleton() {
  return (
    <div className="p-6 space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-center gap-4 animate-pulse">
          <div className="h-4 w-20 bg-zinc-800 rounded" />
          <div className="h-4 w-48 bg-zinc-800 rounded" />
          <div className="h-4 w-24 bg-zinc-800 rounded" />
          <div className="h-4 w-32 bg-zinc-800 rounded" />
          <div className="h-4 w-20 bg-zinc-800 rounded" />
          <div className="h-4 w-16 bg-zinc-800 rounded" />
        </div>
      ))}
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================
function PropertiesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Busca dados reais da API
  const { data, isLoading, isError, error, refetch } = useAgencyProperties({
    status: statusFilter,
    search: searchTerm,
  });

  const properties = data?.properties || [];
  const stats = data?.stats;

  return (
    <AdminLayout userName="Administrador">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Home className="h-6 w-6 text-blue-500" />
              Gestão de Imóveis
            </h1>
            <p className="text-zinc-400 mt-1">
              Cadastro e gerenciamento de imóveis do sistema
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
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Novo Imóvel
            </Button>
          </div>
        </div>

        {/* KPI Cards - Dados Reais */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-2">
              <CardDescription className="text-zinc-400">Total de Imóveis</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-8 w-16 bg-zinc-800 animate-pulse rounded" />
              ) : (
                <>
                  <span className="text-2xl font-bold text-white">{stats?.total || 0}</span>
                  <p className="text-xs text-zinc-500 mt-1">cadastrados</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-2">
              <CardDescription className="text-zinc-400">Disponíveis</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-8 w-16 bg-zinc-800 animate-pulse rounded" />
              ) : (
                <>
                  <span className="text-2xl font-bold text-green-400">{stats?.available || 0}</span>
                  <p className="text-xs text-zinc-500 mt-1">para alugar</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-2">
              <CardDescription className="text-zinc-400">Alugados</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-8 w-16 bg-zinc-800 animate-pulse rounded" />
              ) : (
                <>
                  <span className="text-2xl font-bold text-blue-400">{stats?.rented || 0}</span>
                  <p className="text-xs text-zinc-500 mt-1">ativos</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-2">
              <CardDescription className="text-zinc-400">Em Manutenção</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-8 w-16 bg-zinc-800 animate-pulse rounded" />
              ) : (
                <>
                  <span className="text-2xl font-bold text-yellow-400">{stats?.maintenance || 0}</span>
                  <p className="text-xs text-zinc-500 mt-1">temporário</p>
                </>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
            <Input
              placeholder="Buscar por endereço, bairro ou proprietário..."
              className="pl-10 bg-zinc-900 border-zinc-800 text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Error State */}
        {isError && (
          <Card className="bg-red-900/20 border-red-800">
            <CardContent className="p-4 flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <div className="flex-1">
                <p className="text-red-300 font-medium">Erro ao carregar imóveis</p>
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

        {/* Tabs & Table */}
        <Tabs value={statusFilter} onValueChange={setStatusFilter} className="space-y-4">
          <TabsList className="bg-zinc-800 border-zinc-700">
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="available">Disponíveis</TabsTrigger>
            <TabsTrigger value="rented">Alugados</TabsTrigger>
            <TabsTrigger value="maintenance">Manutenção</TabsTrigger>
          </TabsList>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-0">
              {isLoading ? (
                <TableSkeleton />
              ) : properties.length === 0 ? (
                <EmptyState />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-zinc-800 hover:bg-zinc-800/50">
                      <TableHead className="text-zinc-400">Imóvel</TableHead>
                      <TableHead className="text-zinc-400">Tipo</TableHead>
                      <TableHead className="text-zinc-400">Características</TableHead>
                      <TableHead className="text-zinc-400">Aluguel</TableHead>
                      <TableHead className="text-zinc-400">Status</TableHead>
                      <TableHead className="text-zinc-400">Proprietário</TableHead>
                      <TableHead className="text-zinc-400 text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {properties.map((property: Property) => {
                      const status = statusConfig[property.status] || statusConfig.AVAILABLE;
                      return (
                        <TableRow key={property.id} className="border-zinc-800 hover:bg-zinc-800/50">
                          <TableCell>
                            <div>
                              <p className="font-medium text-white">{property.title}</p>
                              <p className="text-xs text-zinc-500 flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {property.fullAddress}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="border-zinc-700 text-zinc-300">
                              {property.type}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3 text-zinc-400 text-sm">
                              {property.bedrooms && (
                                <span className="flex items-center gap-1">
                                  <Bed className="h-3 w-3" /> {property.bedrooms}
                                </span>
                              )}
                              {property.bathrooms && (
                                <span className="flex items-center gap-1">
                                  <Bath className="h-3 w-3" /> {property.bathrooms}
                                </span>
                              )}
                              {property.parkingSpaces && (
                                <span className="flex items-center gap-1">
                                  <Car className="h-3 w-3" /> {property.parkingSpaces}
                                </span>
                              )}
                              {property.area && <span>{property.area}m²</span>}
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="flex items-center gap-1 text-green-400 font-medium">
                              <DollarSign className="h-3 w-3" />
                              {property.rentValue.toLocaleString('pt-BR')}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge className={status.color}>
                              {status.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-zinc-300">{property.owner?.name || '-'}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-white">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-white">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-red-400">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
