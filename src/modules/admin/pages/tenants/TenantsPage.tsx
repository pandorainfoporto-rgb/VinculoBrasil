
import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Filter, Edit, FileText, User, Home, AlertCircle } from "lucide-react";

import { tenantService } from "../../../../services/tenantService";

import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "../../../../components/ui/dialog";

import { TenantForm } from "./components/TenantForm";

export function TenantsPage() {
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTenantId, setSelectedTenantId] = useState<string | null>(null);

    const queryClient = useQueryClient();

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 500);
        return () => clearTimeout(timer);
    }, [search]);

    const { data, isLoading } = useQuery({
        queryKey: ["tenants", debouncedSearch],
        queryFn: () => tenantService.listTenants({ search: debouncedSearch, page: 1, limit: 10 }),
    });

    const { data: selectedTenant } = useQuery({
        queryKey: ["tenant", selectedTenantId],
        queryFn: () => tenantService.getTenantById(selectedTenantId!),
        enabled: !!selectedTenantId,
    });

    const handleOpenModal = (tenantId?: string) => {
        setSelectedTenantId(tenantId || null);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedTenantId(null);
    };

    // LOADING BARRIER - Prevents any calculations before data is ready
    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="text-lg font-medium">Carregando dados dos inquilinos...</div>
                    <div className="text-sm text-muted-foreground mt-2">Aguarde um momento</div>
                </div>
            </div>
        );
    }

    // SAFE DATA ACCESS - Always ensures an array, even if API fails
    const safeTenants = Array.isArray(data?.tenants) ? data.tenants : [];
    const stats = data?.stats || { total: 0, active: 0, pending: 0, openTickets: 0 };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Gestão de Inquilinos</h1>
                    <p className="text-muted-foreground">
                        Gerencie locatários, contratos e chamados de suporte.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={() => handleOpenModal()}>
                        <Plus className="mr-2 h-4 w-4" />
                        Novo Inquilino
                    </Button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="tracking-tight text-sm font-medium">Total de Inquilinos</h3>
                        <User className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="text-2xl font-bold">{stats.total}</div>
                </div>
                <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="tracking-tight text-sm font-medium">Ativos</h3>
                        <Home className="h-4 w-4 text-emerald-500" />
                    </div>
                    <div className="text-2xl font-bold">{stats.active}</div>
                </div>
                <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="tracking-tight text-sm font-medium">Novos / Pendentes</h3>
                        <AlertCircle className="h-4 w-4 text-amber-500" />
                    </div>
                    <div className="text-2xl font-bold">{stats.pending}</div>
                </div>
                <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="tracking-tight text-sm font-medium">Chamados Abertos</h3>
                        <FileText className="h-4 w-4 text-blue-500" />
                    </div>
                    <div className="text-2xl font-bold">{stats.openTickets}</div>
                </div>
            </div>

            {/* Filters & Actions */}
            <div className="flex items-center justify-between gap-4 bg-card p-4 rounded-lg border shadow-sm">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por nome, email ou CPF..."
                        className="pl-8"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <Button variant="outline">
                    <Filter className="mr-2 h-4 w-4" />
                    Filtros
                </Button>
            </div>

            {/* Table - HTML Implementation */}
            <div className="rounded-md border bg-card overflow-hidden">
                <div className="relative w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm">
                        <thead className="[&_tr]:border-b">
                            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Nome / Email</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">CPF</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Renda Mensal</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Score</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                                <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="[&_tr:last-child]:border-0">
                            {isLoading ? (
                                <tr className="border-b transition-colors hover:bg-muted/50">
                                    <td colSpan={6} className="p-4 text-center align-middle h-24">
                                        Carregando...
                                    </td>
                                </tr>
                            ) : safeTenants.length === 0 ? (
                                <tr className="border-b transition-colors hover:bg-muted/50">
                                    <td colSpan={6} className="p-4 text-center align-middle h-24 text-muted-foreground">
                                        Nenhum inquilino encontrado.
                                    </td>
                                </tr>
                            ) : (
                                safeTenants.map((tenant: any) => (
                                    <tr key={tenant.id} className="border-b transition-colors hover:bg-muted/50">
                                        <td className="p-4 align-middle">
                                            <div className="flex flex-col">
                                                <span className="font-medium">{tenant.user.name}</span>
                                                <span className="text-xs text-muted-foreground">{tenant.user.email}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 align-middle">{tenant.user.cpf || "-"}</td>
                                        <td className="p-4 align-middle">
                                            {tenant.monthlyIncome
                                                ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(tenant.monthlyIncome))
                                                : "-"}
                                        </td>
                                        <td className="p-4 align-middle">
                                            <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${tenant.creditScore > 700 ? "border-transparent bg-primary text-primary-foreground hover:bg-primary/80" :
                                                tenant.creditScore < 400 ? "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80" :
                                                    "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80"
                                                }`}>
                                                {tenant.creditScore || "N/A"}
                                            </span>
                                        </td>
                                        <td className="p-4 align-middle">
                                            <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${tenant.status === "ACTIVE" ? "border-transparent bg-primary text-primary-foreground hover:bg-primary/80" : "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80"
                                                }`}>
                                                {tenant.status === "ACTIVE" ? "Ativo" : tenant.status === "PENDING" ? "Pendente" : "Inativo"}
                                            </span>
                                        </td>
                                        <td className="p-4 align-middle text-right">
                                            <Button variant="ghost" size="sm" onClick={() => handleOpenModal(tenant.id)}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal - Create/Edit */}
            <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{selectedTenantId ? "Editar Inquilino" : "Novo Inquilino"}</DialogTitle>
                    </DialogHeader>
                    <TenantForm
                        tenant={selectedTenant}
                        isEditing={!!selectedTenantId}
                        onClose={handleCloseModal}
                        onSuccess={() => {
                            handleCloseModal();
                            queryClient.invalidateQueries({ queryKey: ["tenants"] });
                        }}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}
