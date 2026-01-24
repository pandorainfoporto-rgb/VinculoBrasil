// ============================================
// ROTA /admin/users - Gestão de Usuários ADMIN
// Exibe APENAS: SUPER_ADMIN, AGENCY_ADMIN, STAFF
// Para clientes (Inquilinos, Proprietários, etc) use /admin/support-monitor
// ============================================

import { createFileRoute, useSearch, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
  KeyRound,
  Ban,
  CheckCircle,
  RefreshCw,
  AlertCircle,
  Loader2,
  Building2,
} from "lucide-react";
import { useAdminUsers, useResetUserPassword, useUpdateUserStatus, type AdminUser } from "@/hooks/use-admin-users";

export const Route = createFileRoute("/admin/users")({
  component: UsersPage,
  validateSearch: (search: Record<string, unknown>) => {
    return {
      role: (search.role as string) || undefined,
      status: (search.status as string) || undefined,
    };
  },
});

// ============================================
// CONFIGURAÇÕES DE DISPLAY
// Filtro: Apenas roles administrativos (não clientes)
// ============================================
const ADMIN_ROLES = ['SUPER_ADMIN', 'AGENCY_ADMIN', 'STAFF'];

const roleConfig: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  STAFF: { label: "Staff", color: "bg-slate-600", icon: Users },
  AGENCY_ADMIN: { label: "Admin Agência", color: "bg-amber-600", icon: Building2 },
  SUPER_ADMIN: { label: "Super Admin", color: "bg-red-600", icon: ShieldCheck },
};

const statusConfig: Record<string, { label: string; color: string }> = {
  ACTIVE: { label: "Ativo", color: "bg-green-600" },
  PENDING: { label: "Pendente", color: "bg-yellow-600" },
  INACTIVE: { label: "Inativo", color: "bg-zinc-600" },
  BLOCKED: { label: "Bloqueado", color: "bg-red-600" },
};

// ============================================
// COMPONENTES DE LOADING
// ============================================
function KpiSkeleton() {
  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader className="pb-2">
        <Skeleton className="h-4 w-24 bg-zinc-800" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-16 bg-zinc-800" />
        <Skeleton className="h-3 w-20 mt-2 bg-zinc-800" />
      </CardContent>
    </Card>
  );
}

function TableSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4">
          <Skeleton className="h-9 w-9 rounded-full bg-zinc-800" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32 bg-zinc-800" />
            <Skeleton className="h-3 w-48 bg-zinc-800" />
          </div>
          <Skeleton className="h-6 w-20 bg-zinc-800" />
        </div>
      ))}
    </div>
  );
}

// ============================================
// COMPONENTE: EMPTY STATE
// ============================================
function EmptyState({ search, role }: { search: string; role?: string }) {
  return (
    <div className="text-center py-16">
      <Users className="h-16 w-16 mx-auto text-zinc-600 mb-4" />
      <h3 className="text-lg font-medium text-zinc-300 mb-2">
        {search ? "Nenhum usuário encontrado" : "Nenhum usuário cadastrado"}
      </h3>
      <p className="text-zinc-500 max-w-sm mx-auto">
        {search
          ? `Não encontramos usuários com "${search}". Tente outro termo.`
          : role
            ? `Não há ${roleConfig[role.toUpperCase()]?.label?.toLowerCase() || "usuários"} cadastrados ainda.`
            : "Os usuários aparecerão aqui quando forem cadastrados no sistema."}
      </p>
    </div>
  );
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================
function UsersPage() {
  const { role, status } = useSearch({ from: "/admin/users" });
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [resetPasswordUser, setResetPasswordUser] = useState<AdminUser | null>(null);
  const [blockUser, setBlockUser] = useState<AdminUser | null>(null);

  // Busca dados reais da API
  const { data, isLoading, isError, refetch } = useAdminUsers({
    role: role,
    status: status,
    search: searchTerm || undefined,
  });

  // Mutations
  const resetPasswordMutation = useResetUserPassword();
  const updateStatusMutation = useUpdateUserStatus();

  const users = data?.users || [];
  const stats = data?.stats || {
    total: 0,
    tenants: 0,
    landlords: 0,
    guarantors: 0,
    agencyAdmins: 0,
    active: 0,
    pending: 0,
    blocked: 0,
  };

  // Título dinâmico baseado no filtro
  const pageTitle = role
    ? roleConfig[role.toUpperCase()]?.label + "s" || "Usuários"
    : "Todos os Usuários";

  const PageIcon = role ? roleConfig[role.toUpperCase()]?.icon || Users : Users;

  // Handle tab change
  const handleTabChange = (value: string) => {
    if (value === "all") {
      navigate({ to: "/admin/users", search: { role: undefined, status: undefined } });
    } else {
      navigate({ to: "/admin/users", search: { role: value, status: undefined } });
    }
  };

  // Handle reset password
  const handleResetPassword = async () => {
    if (!resetPasswordUser) return;
    await resetPasswordMutation.mutateAsync(resetPasswordUser.id);
    setResetPasswordUser(null);
  };

  // Handle block/unblock
  const handleBlockUser = async () => {
    if (!blockUser) return;
    const newStatus = blockUser.status === "BLOCKED" ? "ACTIVE" : "BLOCKED";
    await updateStatusMutation.mutateAsync({ userId: blockUser.id, status: newStatus });
    setBlockUser(null);
  };

  return (
    <AdminLayout userName="Administrador">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <ShieldCheck className="h-6 w-6 text-red-500" />
              Usuários Administrativos
            </h1>
            <p className="text-zinc-400 mt-1">
              Super Admins, Admins de Agência e Staff do sistema
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => refetch()}
            disabled={isLoading}
            className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Atualizar
          </Button>
        </div>

        {/* KPI Cards */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <KpiSkeleton />
            <KpiSkeleton />
            <KpiSkeleton />
            <KpiSkeleton />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader className="pb-2">
                <CardDescription className="text-zinc-400 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Total de Usuários
                </CardDescription>
              </CardHeader>
              <CardContent>
                <span className="text-2xl font-bold text-white">{stats.total.toLocaleString("pt-BR")}</span>
                <p className="text-xs text-zinc-500 mt-1">{stats.active} ativos</p>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader className="pb-2">
                <CardDescription className="text-zinc-400 flex items-center gap-2">
                  <UserPlus className="h-4 w-4" />
                  Inquilinos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <span className="text-2xl font-bold text-blue-400">{stats.tenants.toLocaleString("pt-BR")}</span>
                <p className="text-xs text-zinc-500 mt-1">
                  {stats.total > 0 ? Math.round((stats.tenants / stats.total) * 100) : 0}% do total
                </p>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader className="pb-2">
                <CardDescription className="text-zinc-400 flex items-center gap-2">
                  <UserCheck className="h-4 w-4" />
                  Proprietários
                </CardDescription>
              </CardHeader>
              <CardContent>
                <span className="text-2xl font-bold text-green-400">{stats.landlords.toLocaleString("pt-BR")}</span>
                <p className="text-xs text-zinc-500 mt-1">
                  {stats.total > 0 ? Math.round((stats.landlords / stats.total) * 100) : 0}% do total
                </p>
              </CardContent>
            </Card>

            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader className="pb-2">
                <CardDescription className="text-zinc-400 flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4" />
                  Garantidores
                </CardDescription>
              </CardHeader>
              <CardContent>
                <span className="text-2xl font-bold text-purple-400">{stats.guarantors.toLocaleString("pt-BR")}</span>
                <p className="text-xs text-zinc-500 mt-1">
                  {stats.total > 0 ? Math.round((stats.guarantors / stats.total) * 100) : 0}% do total
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Search */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
            <Input
              placeholder="Buscar por nome, email ou CPF..."
              className="pl-10 bg-zinc-900 border-zinc-800 text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Error State */}
        {isError && (
          <Card className="bg-red-900/20 border-red-800">
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <AlertCircle className="h-8 w-8 text-red-400" />
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-red-300">Erro ao carregar usuários</h3>
                  <p className="text-red-400/80 text-sm">
                    Não foi possível conectar ao servidor. Verifique sua conexão.
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => refetch()}
                  className="border-red-600 text-red-300 hover:bg-red-900/50"
                >
                  Tentar Novamente
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs & Table - APENAS roles administrativos */}
        <Tabs value={role || "all"} onValueChange={handleTabChange} className="space-y-4">
          <TabsList className="bg-zinc-800 border-zinc-700">
            <TabsTrigger value="all">Todos Admins</TabsTrigger>
            <TabsTrigger value="super_admin">Super Admin</TabsTrigger>
            <TabsTrigger value="agency_admin">Admin Agência</TabsTrigger>
            <TabsTrigger value="staff">Staff</TabsTrigger>
          </TabsList>

          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-0">
              {isLoading ? (
                <TableSkeleton />
              ) : users.length === 0 ? (
                <EmptyState search={searchTerm} role={role} />
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-zinc-800 hover:bg-zinc-800/50">
                      <TableHead className="text-zinc-400">Usuário</TableHead>
                      <TableHead className="text-zinc-400">Contato</TableHead>
                      <TableHead className="text-zinc-400">CPF</TableHead>
                      <TableHead className="text-zinc-400">Tipo</TableHead>
                      <TableHead className="text-zinc-400">Status</TableHead>
                      <TableHead className="text-zinc-400">Cadastro</TableHead>
                      <TableHead className="text-zinc-400 text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => {
                      // Proteção contra role/status serem objetos (React Error #31)
                      const roleKey = typeof user.role === 'object' && user.role !== null
                        ? (user.role as { name?: string }).name || 'TENANT'
                        : user.role;
                      const statusKey = typeof user.status === 'object' && user.status !== null
                        ? (user.status as { name?: string }).name || 'ACTIVE'
                        : user.status;

                      const userRole = roleConfig[roleKey] || { label: String(roleKey), color: "bg-zinc-600", icon: Users };
                      const userStatus = statusConfig[statusKey] || { label: String(statusKey), color: "bg-zinc-600" };
                      return (
                        <TableRow key={user.id} className="border-zinc-800 hover:bg-zinc-800/50">
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <Avatar className="h-9 w-9">
                                <AvatarFallback className="bg-zinc-700 text-white">
                                  {user.name
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")
                                    .slice(0, 2)
                                    .toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <span className="font-medium text-white">{user.name}</span>
                                {user.agency && (
                                  <p className="text-xs text-zinc-500">
                                    {typeof user.agency === 'object' ? user.agency.name : String(user.agency)}
                                  </p>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <p className="text-zinc-300 flex items-center gap-1">
                                <Mail className="h-3 w-3" /> {user.email}
                              </p>
                              {user.phone && (
                                <p className="text-zinc-500 flex items-center gap-1">
                                  <Phone className="h-3 w-3" /> {user.phone}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-zinc-400">
                            {user.cpf || "-"}
                          </TableCell>
                          <TableCell>
                            <Badge className={userRole.color}>{userRole.label}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={`border-0 ${userStatus.color}`}>
                              {userStatus.label}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-zinc-500">
                            {new Date(user.createdAt).toLocaleDateString("pt-BR")}
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
                                  Ver Detalhes
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-zinc-300 focus:bg-zinc-800 focus:text-white"
                                  onClick={() => setResetPasswordUser(user)}
                                >
                                  <KeyRound className="h-4 w-4 mr-2" />
                                  Resetar Senha
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="bg-zinc-700" />
                                <DropdownMenuItem
                                  className={
                                    user.status === "BLOCKED"
                                      ? "text-green-400 focus:bg-zinc-800 focus:text-green-300"
                                      : "text-red-400 focus:bg-zinc-800 focus:text-red-300"
                                  }
                                  onClick={() => setBlockUser(user)}
                                >
                                  {user.status === "BLOCKED" ? (
                                    <>
                                      <CheckCircle className="h-4 w-4 mr-2" />
                                      Desbloquear
                                    </>
                                  ) : (
                                    <>
                                      <Ban className="h-4 w-4 mr-2" />
                                      Bloquear
                                    </>
                                  )}
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

        {/* Dialog: Reset Password */}
        <AlertDialog open={!!resetPasswordUser} onOpenChange={() => setResetPasswordUser(null)}>
          <AlertDialogContent className="bg-zinc-900 border-zinc-700">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white">Resetar Senha</AlertDialogTitle>
              <AlertDialogDescription className="text-zinc-400">
                Tem certeza que deseja resetar a senha de{" "}
                <strong className="text-white">{resetPasswordUser?.name}</strong>?
                <br />
                Uma nova senha temporária será gerada.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                className="bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700"
                disabled={resetPasswordMutation.isPending}
              >
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleResetPassword}
                disabled={resetPasswordMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {resetPasswordMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Resetar Senha
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Dialog: Block/Unblock */}
        <AlertDialog open={!!blockUser} onOpenChange={() => setBlockUser(null)}>
          <AlertDialogContent className="bg-zinc-900 border-zinc-700">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-white">
                {blockUser?.status === "BLOCKED" ? "Desbloquear Usuário" : "Bloquear Usuário"}
              </AlertDialogTitle>
              <AlertDialogDescription className="text-zinc-400">
                {blockUser?.status === "BLOCKED" ? (
                  <>
                    Tem certeza que deseja desbloquear{" "}
                    <strong className="text-white">{blockUser?.name}</strong>?
                    <br />O usuário poderá acessar o sistema novamente.
                  </>
                ) : (
                  <>
                    Tem certeza que deseja bloquear{" "}
                    <strong className="text-white">{blockUser?.name}</strong>?
                    <br />
                    <span className="text-red-400">O usuário não conseguirá mais acessar o sistema.</span>
                  </>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel
                className="bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700"
                disabled={updateStatusMutation.isPending}
              >
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleBlockUser}
                disabled={updateStatusMutation.isPending}
                className={
                  blockUser?.status === "BLOCKED"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700"
                }
              >
                {updateStatusMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {blockUser?.status === "BLOCKED" ? "Desbloquear" : "Bloquear"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </AdminLayout>
  );
}
