// ============================================
// ROTA /admin/contracts - Gestão de Contratos
// CONECTADO A DADOS REAIS - ZERO MOCKS
// ============================================

import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
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
  FileText,
  Plus,
  Search,
  Calendar,
  DollarSign,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Eye,
  Edit,
  Download,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import { useAgencyContracts, type Contract } from "@/hooks/use-agency-contracts";

export const Route = createFileRoute("/admin/contracts")({
  component: ContractsPage,
});

// ============================================
// STATUS CONFIG
// ============================================
const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  DRAFT: { label: "Rascunho", color: "bg-zinc-600", icon: FileText },
  PENDING_SIGNATURE: { label: "Aguardando Assinatura", color: "bg-yellow-600", icon: AlertTriangle },
  ACTIVE: { label: "Ativo", color: "bg-green-600", icon: CheckCircle },
  EXPIRED: { label: "Expirado", color: "bg-zinc-600", icon: XCircle },
  TERMINATED: { label: "Encerrado", color: "bg-red-600", icon: XCircle },
};

// ============================================
// EMPTY STATE COMPONENT
// ============================================
function EmptyState() {
  return (
    <div className="text-center py-16">
      <FileText className="h-16 w-16 mx-auto text-zinc-600 mb-4" />
      <h3 className="text-lg font-medium text-zinc-300 mb-2">
        Nenhum contrato cadastrado
      </h3>
      <p className="text-zinc-500 max-w-sm mx-auto mb-6">
        Comece criando seu primeiro contrato para gerenciá-lo na plataforma.
      </p>
      <Button className="bg-purple-600 hover:bg-purple-700">
        <Plus className="h-4 w-4 mr-2" />
        Criar Primeiro Contrato
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
          <div className="h-4 w-24 bg-zinc-800 rounded" />
          <div className="h-4 w-48 bg-zinc-800 rounded" />
          <div className="h-4 w-32 bg-zinc-800 rounded" />
          <div className="h-4 w-24 bg-zinc-800 rounded" />
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
function ContractsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Busca dados reais da API
  const { data, isLoading, isError, error, refetch } = useAgencyContracts({
    status: statusFilter,
    search: searchTerm,
  });

  const contracts = data?.contracts || [];
  const stats = data?.stats;

  return (
    <AdminLayout userName="Administrador">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <FileText className="h-6 w-6 text-purple-500" />
              Gestão de Contratos
            </h1>
            <p className="text-zinc-400 mt-1">
              Contratos de locação e administração
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
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Plus className="h-4 w-4 mr-2" />
              Novo Contrato
            </Button>
          </div>
        </div>

        {/* KPI Cards - Dados Reais */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-2">
              <CardDescription className="text-zinc-400">Total de Contratos</CardDescription>
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
              <CardDescription className="text-zinc-400">Ativos</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-8 w-16 bg-zinc-800 animate-pulse rounded" />
              ) : (
                <>
                  <span className="text-2xl font-bold text-green-400">{stats?.active || 0}</span>
                  <p className="text-xs text-zinc-500 mt-1">em vigor</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-2">
              <CardDescription className="text-zinc-400">Aguardando Assinatura</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-8 w-16 bg-zinc-800 animate-pulse rounded" />
              ) : (
                <>
                  <span className="text-2xl font-bold text-yellow-400">{stats?.pending || 0}</span>
                  <p className="text-xs text-zinc-500 mt-1">pendentes</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader className="pb-2">
              <CardDescription className="text-zinc-400">Receita Mensal</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="h-8 w-16 bg-zinc-800 animate-pulse rounded" />
              ) : (
                <>
                  <span className="text-2xl font-bold text-white">
                    R$ {(stats?.totalMonthlyValue || 0).toLocaleString('pt-BR')}
                  </span>
                  <p className="text-xs text-zinc-500 mt-1">valor total</p>
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
              placeholder="Buscar por imóvel, inquilino ou proprietário..."
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
                <p className="text-red-300 font-medium">Erro ao carregar contratos</p>
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
            <TabsTrigger value="active">Ativos</TabsTrigger>
            <TabsTrigger value="pending_signature">Aguardando</TabsTrigger>
            <TabsTrigger value="expired">Expirados</TabsTrigger>
          </TabsList>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-0">
              {isLoading ? (
                <TableSkeleton />
              ) : contracts.length === 0 ? (
                <EmptyState />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-zinc-800 hover:bg-zinc-800/50">
                      <TableHead className="text-zinc-400">Imóvel</TableHead>
                      <TableHead className="text-zinc-400">Inquilino</TableHead>
                      <TableHead className="text-zinc-400">Proprietário</TableHead>
                      <TableHead className="text-zinc-400">Vigência</TableHead>
                      <TableHead className="text-zinc-400">Aluguel</TableHead>
                      <TableHead className="text-zinc-400">Status</TableHead>
                      <TableHead className="text-zinc-400 text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contracts.map((contract: Contract) => {
                      const status = statusConfig[contract.status] || statusConfig.ACTIVE;
                      return (
                        <TableRow key={contract.id} className="border-zinc-800 hover:bg-zinc-800/50">
                          <TableCell>
                            <div>
                              <p className="font-medium text-white">{contract.property.title}</p>
                              <p className="text-xs text-zinc-500">{contract.property.fullAddress}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="text-white">{contract.tenant.name}</p>
                              <p className="text-xs text-zinc-500">{contract.tenant.email}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="text-zinc-300">{contract.owner.name}</p>
                              <p className="text-xs text-zinc-500">{contract.owner.email}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <p className="text-zinc-300 flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(contract.startDate).toLocaleDateString('pt-BR')}
                              </p>
                              <p className="text-zinc-500 text-xs">
                                até {new Date(contract.endDate).toLocaleDateString('pt-BR')}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="flex items-center gap-1 text-green-400 font-medium">
                              <DollarSign className="h-3 w-3" />
                              {contract.rentValue.toLocaleString('pt-BR')}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge className={status.color}>
                              {status.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-white">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-white">
                                <Download className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-white">
                                <Edit className="h-4 w-4" />
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
