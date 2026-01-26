import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Plus, FileText, Calendar, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { leaseService } from "@/services/leaseService";

export function LeasesPage() {
    const navigate = useNavigate();
    const [statusFilter, setStatusFilter] = useState<string>("");

    const { data: leases = [], isLoading } = useQuery({
        queryKey: ["leases", statusFilter],
        queryFn: () => leaseService.list({ status: statusFilter || undefined }),
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="text-lg font-medium">Carregando contratos...</div>
                </div>
            </div>
        );
    }

    const safeLeases = Array.isArray(leases) ? leases : [];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Contratos de Locação</h1>
                    <p className="text-muted-foreground">
                        Gerencie contratos ativos e histórico de locações
                    </p>
                </div>
                <Button onClick={() => navigate("/admin/leases/new")}>
                    <Plus className="mr-2 h-4 w-4" />
                    Novo Contrato
                </Button>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="tracking-tight text-sm font-medium">Total de Contratos</h3>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="text-2xl font-bold">{safeLeases.length}</div>
                </div>
                <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="tracking-tight text-sm font-medium">Ativos</h3>
                        <Calendar className="h-4 w-4 text-emerald-500" />
                    </div>
                    <div className="text-2xl font-bold">
                        {safeLeases.filter((l: any) => l.status === 'ACTIVE').length}
                    </div>
                </div>
                <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="tracking-tight text-sm font-medium">Rascunhos</h3>
                        <FileText className="h-4 w-4 text-amber-500" />
                    </div>
                    <div className="text-2xl font-bold">
                        {safeLeases.filter((l: any) => l.status === 'DRAFT').length}
                    </div>
                </div>
                <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="tracking-tight text-sm font-medium">Receita Mensal</h3>
                        <DollarSign className="h-4 w-4 text-blue-500" />
                    </div>
                    <div className="text-2xl font-bold">
                        {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
                            safeLeases
                                .filter((l: any) => l.status === 'ACTIVE')
                                .reduce((sum: number, l: any) => sum + Number(l.adminFeeValue || 0), 0)
                        )}
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="rounded-md border bg-card overflow-hidden">
                <div className="relative w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm">
                        <thead className="[&_tr]:border-b">
                            <tr className="border-b transition-colors hover:bg-muted/50">
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Imóvel</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Inquilino</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Aluguel</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Início</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                                <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="[&_tr:last-child]:border-0">
                            {safeLeases.length === 0 ? (
                                <tr className="border-b transition-colors hover:bg-muted/50">
                                    <td colSpan={6} className="p-4 text-center align-middle h-24 text-muted-foreground">
                                        Nenhum contrato encontrado. Clique em "Novo Contrato" para começar.
                                    </td>
                                </tr>
                            ) : (
                                safeLeases.map((lease: any) => (
                                    <tr key={lease.id} className="border-b transition-colors hover:bg-muted/50">
                                        <td className="p-4 align-middle">
                                            <div className="font-medium">
                                                {lease.property?.street} {lease.property?.number}
                                            </div>
                                            <div className="text-xs text-muted-foreground">
                                                {lease.property?.city}
                                            </div>
                                        </td>
                                        <td className="p-4 align-middle">{lease.tenant?.name}</td>
                                        <td className="p-4 align-middle font-medium">
                                            {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
                                                Number(lease.rentAmount)
                                            )}
                                        </td>
                                        <td className="p-4 align-middle">
                                            {new Date(lease.startDate).toLocaleDateString('pt-BR')}
                                        </td>
                                        <td className="p-4 align-middle">
                                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${lease.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' :
                                                lease.status === 'DRAFT' ? 'bg-amber-100 text-amber-800' :
                                                    'bg-gray-100 text-gray-800'
                                                }`}>
                                                {lease.status}
                                            </span>
                                        </td>
                                        <td className="p-4 align-middle text-right">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => navigate(`/admin/leases/${lease.id}`)}
                                            >
                                                Ver Detalhes
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
