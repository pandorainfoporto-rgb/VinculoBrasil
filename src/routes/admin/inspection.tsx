// ============================================
// ROTA /admin/inspection - Vistorias
// USA AdminLayout (Super Admin) - CONECTADO A API
// ============================================

import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Camera,
  Plus,
  Search,
  Calendar,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
  FileText,
  Info,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useInspections, type Inspection } from "@/hooks/use-inspections";

export const Route = createFileRoute("/admin/inspection")({
  component: InspectionPage,
});

// ============================================
// REGRAS DE VISTORIA:
// - Vistoria de ENTRADA: Apenas o INQUILINO pode iniciar/realizar
// - Vistoria de SAÍDA: Inquilino, Proprietário ou Imobiliária
// - NÃO existe vistoriadora terceirizada no sistema
// ============================================

const statusConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  SCHEDULED: { label: "Agendada", color: "bg-blue-500/20 text-blue-400", icon: Calendar },
  PENDING: { label: "Pendente", color: "bg-yellow-500/20 text-yellow-400", icon: Clock },
  IN_PROGRESS: { label: "Em Andamento", color: "bg-purple-500/20 text-purple-400", icon: Eye },
  COMPLETED: { label: "Concluída", color: "bg-green-500/20 text-green-400", icon: CheckCircle },
  CANCELLED: { label: "Cancelada", color: "bg-red-500/20 text-red-400", icon: AlertCircle },
};

const typeLabels: Record<string, string> = {
  ENTRY: "Entrada",
  EXIT: "Saída",
};

function InspectionPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");

  // Busca dados reais da API
  const { data, isLoading, refetch } = useInspections({
    type: typeFilter,
    search: searchTerm,
  });

  const inspections = data?.inspections || [];
  const stats = data?.stats;

  return (
    <AdminLayout userName="Administrador">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Camera className="h-7 w-7 text-blue-500" />
              Vistorias
            </h1>
            <p className="text-zinc-400 mt-1">
              Gerencie vistorias de entrada e saída
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
              Nova Vistoria
            </Button>
          </div>
        </div>

        {/* Regras de Vistoria */}
        <Alert className="bg-blue-900/20 border-blue-700">
          <Info className="h-4 w-4 text-blue-400" />
          <AlertTitle className="text-blue-300">Regras de Vistoria</AlertTitle>
          <AlertDescription className="text-blue-400/80">
            <strong>Entrada:</strong> Apenas o Inquilino pode realizar a vistoria de entrada.{' '}
            <strong>Saída:</strong> Pode ser feita pelo Inquilino, Proprietário ou Imobiliária.
          </AlertDescription>
        </Alert>

        {/* Stats - Dados Reais */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Calendar className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  {isLoading ? (
                    <div className="h-8 w-12 bg-zinc-800 animate-pulse rounded" />
                  ) : (
                    <p className="text-2xl font-bold text-white">{stats?.scheduled || 0}</p>
                  )}
                  <p className="text-xs text-zinc-500">Agendadas</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Eye className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  {isLoading ? (
                    <div className="h-8 w-12 bg-zinc-800 animate-pulse rounded" />
                  ) : (
                    <p className="text-2xl font-bold text-white">{stats?.inProgress || 0}</p>
                  )}
                  <p className="text-xs text-zinc-500">Em Andamento</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  {isLoading ? (
                    <div className="h-8 w-12 bg-zinc-800 animate-pulse rounded" />
                  ) : (
                    <p className="text-2xl font-bold text-white">{stats?.completed || 0}</p>
                  )}
                  <p className="text-xs text-zinc-500">Concluídas</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-500/20 rounded-lg">
                  <AlertCircle className="h-5 w-5 text-yellow-400" />
                </div>
                <div>
                  {isLoading ? (
                    <div className="h-8 w-12 bg-zinc-800 animate-pulse rounded" />
                  ) : (
                    <p className="text-2xl font-bold text-white">{stats?.pending || 0}</p>
                  )}
                  <p className="text-xs text-zinc-500">Pendentes</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <Input
                  placeholder="Buscar por imóvel, endereço ou responsável..."
                  className="pl-10 bg-zinc-800 border-zinc-700 text-white"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant={typeFilter === "all" ? "default" : "outline"}
                  className={typeFilter === "all" ? "bg-blue-600" : "border-zinc-700 text-zinc-300"}
                  onClick={() => setTypeFilter("all")}
                >
                  Todos
                </Button>
                <Button
                  variant={typeFilter === "entry" ? "default" : "outline"}
                  className={typeFilter === "entry" ? "bg-blue-600" : "border-zinc-700 text-zinc-300"}
                  onClick={() => setTypeFilter("entry")}
                >
                  Entrada
                </Button>
                <Button
                  variant={typeFilter === "exit" ? "default" : "outline"}
                  className={typeFilter === "exit" ? "bg-blue-600" : "border-zinc-700 text-zinc-300"}
                  onClick={() => setTypeFilter("exit")}
                >
                  Saída
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Inspection List */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white">Vistorias Recentes</CardTitle>
            <CardDescription className="text-zinc-500">
              Lista de todas as vistorias do sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              </div>
            ) : inspections.length === 0 ? (
              <div className="text-center py-16">
                <Camera className="h-16 w-16 mx-auto text-zinc-600 mb-4" />
                <h3 className="text-lg font-medium text-zinc-300 mb-2">
                  Nenhuma vistoria encontrada
                </h3>
                <p className="text-zinc-500 max-w-sm mx-auto">
                  Clique em "Nova Vistoria" para agendar uma.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {inspections.map((inspection: Inspection) => {
                  const status = statusConfig[inspection.status] || statusConfig.PENDING;
                  const StatusIcon = status.icon;

                  return (
                    <div
                      key={inspection.id}
                      className="flex items-center gap-4 p-4 bg-zinc-800/50 rounded-lg hover:bg-zinc-800 transition-colors"
                    >
                      <div className="p-3 bg-zinc-700 rounded-lg">
                        <Camera className="h-6 w-6 text-zinc-300" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium truncate">{inspection.property.title}</p>
                        <div className="flex items-center gap-2 text-sm text-zinc-500 mt-1">
                          <MapPin className="h-3 w-3" />
                          <span className="truncate">{inspection.property.fullAddress}</span>
                        </div>
                      </div>
                      <div className="text-right hidden md:block">
                        <p className="text-white text-sm">
                          {new Date(inspection.scheduledDate).toLocaleDateString('pt-BR')}
                        </p>
                        <p className="text-zinc-500 text-xs">{inspection.scheduledTime || '-'}</p>
                      </div>
                      <Badge variant="outline" className="border-zinc-700">
                        {typeLabels[inspection.type] || inspection.type}
                      </Badge>
                      <Badge className={status.color}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {status.label}
                      </Badge>
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost" className="text-zinc-400 hover:text-white">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="text-zinc-400 hover:text-white">
                          <FileText className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
