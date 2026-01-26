
import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Filter, Edit, Shield, AlertTriangle, Lock } from "lucide-react";

import { guarantorService } from "../../../../services/guarantorService";

import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "../../../../components/ui/dialog";

import { GuarantorForm } from "./components/GuarantorForm";

export function GuarantorsPage() {
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedGuarantorId, setSelectedGuarantorId] = useState<string | null>(null);

    const queryClient = useQueryClient();

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 500);
        return () => clearTimeout(timer);
    }, [search]);

    const { data, isLoading } = useQuery({
        queryKey: ["guarantors", debouncedSearch],
        queryFn: () => guarantorService.list({ search: debouncedSearch, page: 1, limit: 10 }),
    });

    const { data: selectedGuarantor } = useQuery({
        queryKey: ["guarantor", selectedGuarantorId],
        queryFn: () => guarantorService.getById(selectedGuarantorId!),
        enabled: !!selectedGuarantorId,
    });

    const handleOpenModal = (id?: string) => {
        setSelectedGuarantorId(id || null);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedGuarantorId(null);
    };

    // LOADING BARRIER
    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="text-lg font-medium">Carregando dados dos garantidores...</div>
                    <div className="text-sm text-muted-foreground mt-2">Aguarde um momento</div>
                </div>
            </div>
        );
    }

    // SAFE DATA ACCESS
    const safeGuarantors = Array.isArray(data?.data) ? data.data : [];
    const stats = data?.stats || { totalGuarantors: 0, totalCollateral: 0, activeRisk: 0 };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Gestão de Garantidores</h1>
                    <p className="text-muted-foreground">
                        Administre perfis, colaterais e limites de garantia.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={() => handleOpenModal()}>
                        <Plus className="mr-2 h-4 w-4" />
                        Novo Garantidor
                    </Button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="tracking-tight text-sm font-medium">Total de Garantidores</h3>
                        <Shield className="h-4 w-4 text-blue-500" />
                    </div>
                    <div className="text-2xl font-bold">{stats.totalGuarantors}</div>
                </div>
                <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="tracking-tight text-sm font-medium">Total em Garantia (R$)</h3>
                        <Lock className="h-4 w-4 text-emerald-500" />
                    </div>
                    <div className="text-2xl font-bold">
                        {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(stats.totalCollateral)}
                    </div>
                </div>
                <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="tracking-tight text-sm font-medium">Risco Ativo (Bloqueado)</h3>
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                    </div>
                    <div className="text-2xl font-bold">
                        {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(stats.activeRisk)}
                    </div>
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

            {/* Table */}
            <div className="rounded-md border bg-card overflow-hidden">
                <div className="relative w-full overflow-auto">
                    <table className="w-full caption-bottom text-sm">
                        <thead className="[&_tr]:border-b">
                            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Nome / Email</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">CPF</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Colateral Total</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Bloqueado</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Perfil</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status KYC</th>
                                <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="[&_tr:last-child]:border-0">
                            {isLoading ? (
                                <tr className="border-b transition-colors hover:bg-muted/50">
                                    <td colSpan={7} className="p-4 text-center align-middle h-24">
                                        Carregando...
                                    </td>
                                </tr>
                            ) : safeGuarantors.length === 0 ? (
                                <tr className="border-b transition-colors hover:bg-muted/50">
                                    <td colSpan={7} className="p-4 text-center align-middle h-24 text-muted-foreground">
                                        Nenhum garantidor encontrado.
                                    </td>
                                </tr>
                            ) : (
                                safeGuarantors.map((g: any) => (
                                    <tr key={g.id} className="border-b transition-colors hover:bg-muted/50">
                                        <td className="p-4 align-middle">
                                            <div className="flex flex-col">
                                                <span className="font-medium">{g.user.name}</span>
                                                <span className="text-xs text-muted-foreground">{g.user.email}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 align-middle">{g.user.cpf || "-"}</td>
                                        <td className="p-4 align-middle">
                                            {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(g.totalCollateral))}
                                        </td>
                                        <td className="p-4 align-middle text-amber-600 font-medium">
                                            {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(g.blockedAmount))}
                                        </td>
                                        <td className="p-4 align-middle">
                                            <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
                                                {g.investorProfile}
                                            </span>
                                        </td>
                                        <td className="p-4 align-middle">
                                            <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${g.kycStatus === "APPROVED" ? "border-transparent bg-primary text-primary-foreground hover:bg-primary/80" : "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}>
                                                {g.kycStatus}
                                            </span>
                                        </td>
                                        <td className="p-4 align-middle text-right">
                                            <Button variant="ghost" size="sm" onClick={() => handleOpenModal(g.id)}>
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

            {/* Modal */}
            <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{selectedGuarantorId ? "Editar Garantidor" : "Novo Garantidor"}</DialogTitle>
                    </DialogHeader>
                    <GuarantorForm
                        guarantor={selectedGuarantor}
                        isEditing={!!selectedGuarantorId}
                        onClose={handleCloseModal}
                        onSuccess={() => {
                            handleCloseModal();
                            queryClient.invalidateQueries({ queryKey: ["guarantors"] });
                        }}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}
