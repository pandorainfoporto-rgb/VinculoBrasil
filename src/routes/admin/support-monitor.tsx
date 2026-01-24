// ============================================
// ROTA /admin/support-monitor - Suporte & Monitoramento
// Lista usuários CLIENTES para fins de suporte - CONECTADO A API
// (Imobiliárias, Inquilinos, Proprietários, Garantidores, Investidores)
// ============================================

import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Users,
  UserPlus,
  UserCheck,
  ShieldCheck,
  Search,
  Mail,
  Phone,
  Eye,
  MoreVertical,
  MessageSquare,
  Building2,
  RefreshCw,
  Headphones,
  TrendingUp,
  Loader2,
} from "lucide-react";
import { useSupportClients, type SupportClient } from "@/hooks/use-support-clients";

export const Route = createFileRoute("/admin/support-monitor" as never)({
  component: SupportMonitorPage,
});

// ============================================
// CONFIGURAÇÕES
// ============================================
const roleConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  TENANT: { label: "Inquilino", color: "bg-blue-600", icon: UserPlus },
  LANDLORD: { label: "Proprietário", color: "bg-green-600", icon: UserCheck },
  GUARANTOR: { label: "Garantidor", color: "bg-purple-600", icon: ShieldCheck },
  INVESTOR: { label: "Investidor", color: "bg-amber-600", icon: TrendingUp },
  AGENCY_USER: { label: "Usuário Agência", color: "bg-slate-600", icon: Building2 },
};

const statusConfig: Record<string, { label: string; color: string }> = {
  ACTIVE: { label: "Ativo", color: "bg-green-600" },
  PENDING: { label: "Pendente", color: "bg-yellow-600" },
  INACTIVE: { label: "Inativo", color: "bg-zinc-600" },
  BLOCKED: { label: "Bloqueado", color: "bg-red-600" },
};

function SupportMonitorPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("all");

  // Busca dados reais da API
  const { data, isLoading, refetch } = useSupportClients({
    role: selectedRole,
    search: searchTerm,
  });

  const clients = data?.clients || [];
  const stats = data?.stats;

  return (
    <AdminLayout userName="Administrador">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Headphones className="h-6 w-6 text-emerald-500" />
              Suporte & Monitoramento
            </h1>
            <p className="text-zinc-400 mt-1">
              Acompanhamento de clientes para fins de suporte
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => refetch()}
            disabled={isLoading}
            className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>

        {/* KPI Cards - Dados Reais */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-zinc-800 rounded-lg">
                  <Users className="h-5 w-5 text-zinc-400" />
                </div>
                <div>
                  {isLoading ? (
                    <div className="h-8 w-12 bg-zinc-800 animate-pulse rounded" />
                  ) : (
                    <p className="text-2xl font-bold text-white">{stats?.total || 0}</p>
                  )}
                  <p className="text-xs text-zinc-500">Total Clientes</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-900/30 rounded-lg">
                  <UserPlus className="h-5 w-5 text-blue-400" />
                </div>
                <div>
                  {isLoading ? (
                    <div className="h-8 w-12 bg-zinc-800 animate-pulse rounded" />
                  ) : (
                    <p className="text-2xl font-bold text-blue-400">{stats?.tenants || 0}</p>
                  )}
                  <p className="text-xs text-zinc-500">Inquilinos</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-900/30 rounded-lg">
                  <UserCheck className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  {isLoading ? (
                    <div className="h-8 w-12 bg-zinc-800 animate-pulse rounded" />
                  ) : (
                    <p className="text-2xl font-bold text-green-400">{stats?.landlords || 0}</p>
                  )}
                  <p className="text-xs text-zinc-500">Proprietários</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-900/30 rounded-lg">
                  <ShieldCheck className="h-5 w-5 text-purple-400" />
                </div>
                <div>
                  {isLoading ? (
                    <div className="h-8 w-12 bg-zinc-800 animate-pulse rounded" />
                  ) : (
                    <p className="text-2xl font-bold text-purple-400">{stats?.guarantors || 0}</p>
                  )}
                  <p className="text-xs text-zinc-500">Garantidores</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-900/30 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-amber-400" />
                </div>
                <div>
                  {isLoading ? (
                    <div className="h-8 w-12 bg-zinc-800 animate-pulse rounded" />
                  ) : (
                    <p className="text-2xl font-bold text-amber-400">{stats?.investors || 0}</p>
                  )}
                  <p className="text-xs text-zinc-500">Investidores</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
            <Input
              placeholder="Buscar cliente por nome ou email..."
              className="pl-10 bg-zinc-900 border-zinc-800 text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Tabs & Table */}
        <Tabs value={selectedRole} onValueChange={setSelectedRole} className="space-y-4">
          <TabsList className="bg-zinc-800 border-zinc-700">
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="tenant">Inquilinos</TabsTrigger>
            <TabsTrigger value="landlord">Proprietários</TabsTrigger>
            <TabsTrigger value="guarantor">Garantidores</TabsTrigger>
            <TabsTrigger value="investor">Investidores</TabsTrigger>
          </TabsList>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
                </div>
              ) : clients.length === 0 ? (
                <div className="text-center py-16">
                  <Users className="h-16 w-16 mx-auto text-zinc-600 mb-4" />
                  <h3 className="text-lg font-medium text-zinc-300 mb-2">
                    Nenhum cliente encontrado
                  </h3>
                  <p className="text-zinc-500 max-w-sm mx-auto">
                    Tente ajustar os filtros de busca.
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-zinc-800 hover:bg-zinc-800/50">
                      <TableHead className="text-zinc-400">Cliente</TableHead>
                      <TableHead className="text-zinc-400">Contato</TableHead>
                      <TableHead className="text-zinc-400">Tipo</TableHead>
                      <TableHead className="text-zinc-400">Agência</TableHead>
                      <TableHead className="text-zinc-400">Status</TableHead>
                      <TableHead className="text-zinc-400">Última Atividade</TableHead>
                      <TableHead className="text-zinc-400 text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {clients.map((client: SupportClient) => {
                      const clientRole = roleConfig[client.role] || { label: client.role, color: "bg-zinc-600", icon: Users };
                      const clientStatus = statusConfig[client.status] || { label: client.status, color: "bg-zinc-600" };
                      const RoleIcon = clientRole.icon;

                      return (
                        <TableRow key={client.id} className="border-zinc-800 hover:bg-zinc-800/50">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-9 w-9">
                                <AvatarFallback className="bg-zinc-700 text-white">
                                  {client.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <span className="font-medium text-white">{client.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <p className="text-zinc-300 flex items-center gap-1">
                                <Mail className="h-3 w-3" /> {client.email}
                              </p>
                              <p className="text-zinc-500 flex items-center gap-1">
                                <Phone className="h-3 w-3" /> {client.phone || '-'}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={clientRole.color}>
                              <RoleIcon className="h-3 w-3 mr-1" />
                              {clientRole.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-zinc-400">
                            {client.agencyName || "-"}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={`border-0 ${clientStatus.color}`}>
                              {clientStatus.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-zinc-500">
                            {client.lastActivityAt ? new Date(client.lastActivityAt).toLocaleDateString('pt-BR') : '-'}
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 text-zinc-400 hover:text-white"
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-700">
                                <DropdownMenuItem className="text-zinc-300 focus:bg-zinc-800 focus:text-white">
                                  <Eye className="h-4 w-4 mr-2" />
                                  Ver Perfil
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-zinc-300 focus:bg-zinc-800 focus:text-white">
                                  <MessageSquare className="h-4 w-4 mr-2" />
                                  Enviar Mensagem
                                </DropdownMenuItem>
                                <DropdownMenuItem className="text-zinc-300 focus:bg-zinc-800 focus:text-white">
                                  <Headphones className="h-4 w-4 mr-2" />
                                  Abrir Ticket
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
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

export default SupportMonitorPage;
