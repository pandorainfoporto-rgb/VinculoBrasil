import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DollarSign, ArrowUpRight, ArrowDownLeft, Wallet, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { financeService } from "@/services/financeService";

export function FinancialDashboard() {
    const queryClient = useQueryClient();
    const [activeTab, setActiveTab] = useState("receivables");

    const { data: invoices = [], isLoading: loadingInvoices } = useQuery({
        queryKey: ["invoices"],
        queryFn: () => financeService.listInvoices(),
    });

    const { data: settlements = [], isLoading: loadingSettlements } = useQuery({
        queryKey: ["settlements"],
        queryFn: () => financeService.listSettlements(),
    });

    const generateMutation = useMutation({
        mutationFn: financeService.generateNextMonthInvoices,
        onSuccess: () => {
            alert("Faturas geradas com sucesso!");
            queryClient.invalidateQueries({ queryKey: ["invoices"] });
            queryClient.invalidateQueries({ queryKey: ["settlements"] });
        },
        onError: () => alert("Erro ao gerar faturas"),
    });

    const safeInvoices = Array.isArray(invoices) ? invoices : [];
    const safeSettlements = Array.isArray(settlements) ? settlements : [];

    // KPIS
    const totalReceivables = safeInvoices.reduce((acc: number, inv: any) => acc + Number(inv.amount), 0);
    const totalPayables = safeSettlements.reduce((acc: number, sett: any) => acc + Number(sett.amount), 0);
    const platformRevenue = safeInvoices.reduce((acc: number, inv: any) => acc + Number(inv.adminFee), 0);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Financeiro</h1>
                    <p className="text-muted-foreground">
                        Fluxo de caixa, faturamento e repasses.
                    </p>
                </div>
                <Button
                    onClick={() => generateMutation.mutate()}
                    disabled={generateMutation.isPending}
                >
                    <Calendar className="mr-2 h-4 w-4" />
                    {generateMutation.isPending ? "Gerando..." : "Gerar Faturamento do Mês"}
                </Button>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="tracking-tight text-sm font-medium">Total a Receber (Inquilinos)</h3>
                        <ArrowDownLeft className="h-4 w-4 text-emerald-500" />
                    </div>
                    <div className="text-2xl font-bold">
                        {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(totalReceivables)}
                    </div>
                </div>
                <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="tracking-tight text-sm font-medium">Total a Pagar (Repasses)</h3>
                        <ArrowUpRight className="h-4 w-4 text-amber-500" />
                    </div>
                    <div className="text-2xl font-bold">
                        {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(totalPayables)}
                    </div>
                </div>
                <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="tracking-tight text-sm font-medium">Receita Líquida (Spread)</h3>
                        <Wallet className="h-4 w-4 text-blue-500" />
                    </div>
                    <div className="text-2xl font-bold">
                        {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(platformRevenue)}
                    </div>
                </div>
            </div>

            <Tabs defaultValue="receivables" className="space-y-4" onValueChange={setActiveTab}>
                <TabsList>
                    <TabsTrigger value="receivables">A Receber (Invoices)</TabsTrigger>
                    <TabsTrigger value="payables">A Pagar (Settlements)</TabsTrigger>
                </TabsList>

                <TabsContent value="receivables" className="space-y-4">
                    <div className="rounded-md border bg-card overflow-hidden">
                        <table className="w-full caption-bottom text-sm">
                            <thead className="[&_tr]:border-b">
                                <tr className="border-b transition-colors hover:bg-muted/50">
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Inquilino</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Imóvel</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Valor</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Vencimento</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loadingInvoices ? (
                                    <tr><td colSpan={5} className="p-4 text-center">Carregando...</td></tr>
                                ) : safeInvoices.length === 0 ? (
                                    <tr><td colSpan={5} className="p-4 text-center text-muted-foreground">Nenhuma fatura encontrada.</td></tr>
                                ) : (
                                    safeInvoices.map((inv: any) => (
                                        <tr key={inv.id} className="border-b transition-colors hover:bg-muted/50">
                                            <td className="p-4 align-middle font-medium">{inv.payer?.name}</td>
                                            <td className="p-4 align-middle text-muted-foreground">
                                                {inv.lease?.property ? `${inv.lease.property.street}, ${inv.lease.property.number}` : '-'}
                                            </td>
                                            <td className="p-4 align-middle font-medium text-emerald-600">
                                                {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(inv.amount))}
                                            </td>
                                            <td className="p-4 align-middle">
                                                {new Date(inv.dueDate).toLocaleDateString('pt-BR')}
                                            </td>
                                            <td className="p-4 align-middle">
                                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${inv.status === 'PAID' ? 'bg-emerald-100 text-emerald-800' :
                                                        inv.status === 'PENDING' ? 'bg-amber-100 text-amber-800' :
                                                            'bg-red-100 text-red-800'
                                                    }`}>
                                                    {inv.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </TabsContent>

                <TabsContent value="payables" className="space-y-4">
                    <div className="rounded-md border bg-card overflow-hidden">
                        <table className="w-full caption-bottom text-sm">
                            <thead className="[&_tr]:border-b">
                                <tr className="border-b transition-colors hover:bg-muted/50">
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Favorecido (Dono)</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Origem (Invoice)</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Valor Repasse</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Data Agendada</th>
                                    <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loadingSettlements ? (
                                    <tr><td colSpan={5} className="p-4 text-center">Carregando...</td></tr>
                                ) : safeSettlements.length === 0 ? (
                                    <tr><td colSpan={5} className="p-4 text-center text-muted-foreground">Nenhum repasse encontrado.</td></tr>
                                ) : (
                                    safeSettlements.map((sett: any) => (
                                        <tr key={sett.id} className="border-b transition-colors hover:bg-muted/50">
                                            <td className="p-4 align-middle font-medium">{sett.recipient?.name}</td>
                                            <td className="p-4 align-middle text-xs text-muted-foreground font-mono">
                                                {sett.invoiceId.substring(0, 8)}...
                                            </td>
                                            <td className="p-4 align-middle font-medium text-amber-600">
                                                {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(sett.amount))}
                                            </td>
                                            <td className="p-4 align-middle">
                                                {new Date(sett.scheduledDate).toLocaleDateString('pt-BR')}
                                            </td>
                                            <td className="p-4 align-middle">
                                                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${sett.status === 'PAID' ? 'bg-emerald-100 text-emerald-800' :
                                                        sett.status === 'SCHEDULED' ? 'bg-blue-100 text-blue-800' :
                                                            'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {sett.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
