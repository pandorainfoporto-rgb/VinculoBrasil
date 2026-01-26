
import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Filter, Edit, Coins, TrendingUp, Users } from "lucide-react";

import { investorService } from "../../../../services/investorService";

import { Button } from "../../../../components/ui/button";
import { Input } from "../../../../components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "../../../../components/ui/dialog";

import { InvestorForm } from "./components/InvestorForm";

export function InvestorsPage() {
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedInvestorId, setSelectedInvestorId] = useState<string | null>(null);

    const queryClient = useQueryClient();

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 500);
        return () => clearTimeout(timer);
    }, [search]);

    const { data, isLoading } = useQuery({
        queryKey: ["investors", debouncedSearch],
        queryFn: () => investorService.list({ search: debouncedSearch, page: 1, limit: 10 }),
    });

    const { data: selectedInvestor } = useQuery({
        queryKey: ["investor", selectedInvestorId],
        queryFn: () => investorService.getById(selectedInvestorId!),
        enabled: !!selectedInvestorId,
    });

    const handleOpenModal = (id?: string) => {
        setSelectedInvestorId(id || null);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedInvestorId(null);
    };

    // LOADING BARRIER
    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="text-lg font-medium">Carregando dados dos investidores...</div>
                    <div className="text-sm text-muted-foreground mt-2">Aguarde um momento</div>
                </div>
            </div>
        );
    }

    // SAFE DATA ACCESS
    const safeInvestors = Array.isArray(data?.data) ? data.data : [];
    const stats = data?.stats || { totalInvestors: 0, totalVBRzCirculation: 0, totalP2PVolume: 0 };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Investidores & Tokenomics</h1>
                    <p className="text-muted-foreground">
                        Gestão de holders VBRz e participantes do mercado P2P.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button onClick={() => handleOpenModal()}>
                        <Plus className="mr-2 h-4 w-4" />
                        Novo Investidor
                    </Button>
                </div>
            </div>

            {/* Tokenomics Dashboard */}
            <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="tracking-tight text-sm font-medium">VBRz em Circulação</h3>
                        <Coins className="h-4 w-4 text-purple-500" />
                    </div>
                    <div className="text-2xl font-bold">
                        {new Intl.NumberFormat("pt-BR").format(stats.totalVBRzCirculation)} VBRz
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Utility Tokens nas carteiras dos usuários.</p>
                </div>
                <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="tracking-tight text-sm font-medium">Investimento Direto (P2P)</h3>
                        <TrendingUp className="h-4 w-4 text-emerald-500" />
                    </div>
                    <div className="text-2xl font-bold">
                        {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(stats.totalP2PVolume)}
                    </div>
                </div>
                <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="tracking-tight text-sm font-medium">Total de Investidores</h3>
                        <Users className="h-4 w-4 text-blue-500" />
                    </div>
                    <div className="text-2xl font-bold">{stats.totalInvestors}</div>
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
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Saldo VBRz</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Volume P2P</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Review KYC</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Wallet (EVM)</th>
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
                            ) : safeInvestors.length === 0 ? (
                                <tr className="border-b transition-colors hover:bg-muted/50">
                                    <td colSpan={6} className="p-4 text-center align-middle h-24 text-muted-foreground">
                                        Nenhum investidor encontrado.
                                    </td>
                                </tr>
                            ) : (
                                safeInvestors.map((inv: any) => (
                                    <tr key={inv.id} className="border-b transition-colors hover:bg-muted/50">
                                        <td className="p-4 align-middle">
                                            <div className="flex flex-col">
                                                <span className="font-medium">{inv.user.name}</span>
                                                <span className="text-xs text-muted-foreground">{inv.user.email}</span>
                                            </div>
                                        </td>
                                        <td className="p-4 align-middle font-mono font-medium text-purple-600">
                                            {Number(inv.vbrzBalance).toLocaleString('pt-BR')}
                                        </td>
                                        <td className="p-4 align-middle">
                                            {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(inv.totalInvestedP2P))}
                                        </td>
                                        <td className="p-4 align-middle">
                                            <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${inv.kycLevel >= 3 ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-800"}`}>
                                                Nível {inv.kycLevel}
                                            </span>
                                        </td>
                                        <td className="p-4 align-middle font-mono text-xs">
                                            {inv.walletAddress ?
                                                `${inv.walletAddress.substring(0, 6)}...${inv.walletAddress.substring(inv.walletAddress.length - 4)}`
                                                : "-"}
                                        </td>
                                        <td className="p-4 align-middle text-right">
                                            <Button variant="ghost" size="sm" onClick={() => handleOpenModal(inv.id)}>
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
                        <DialogTitle>{selectedInvestorId ? "Editar Investidor" : "Novo Investidor"}</DialogTitle>
                    </DialogHeader>
                    <InvestorForm
                        investor={selectedInvestor}
                        isEditing={!!selectedInvestorId}
                        onClose={handleCloseModal}
                        onSuccess={() => {
                            handleCloseModal();
                            queryClient.invalidateQueries({ queryKey: ["investors"] });
                        }}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}
