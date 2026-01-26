import { useState } from "react";
import { Plus, Search, Filter, Building2, MapPin, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function PropertiesPage() {
    const [search, setSearch] = useState("");

    // Mock data - will be replaced with real API call
    const properties: any[] = [];
    const isLoading = false;

    const stats = {
        total: 0,
        available: 0,
        rented: 0,
        totalValue: 0,
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Gestão de Imóveis</h1>
                    <p className="text-muted-foreground">
                        Administre propriedades, disponibilidade e contratos.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Novo Imóvel
                    </Button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid gap-4 md:grid-cols-4">
                <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="tracking-tight text-sm font-medium">Total de Imóveis</h3>
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="text-2xl font-bold">{stats.total}</div>
                </div>
                <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="tracking-tight text-sm font-medium">Disponíveis</h3>
                        <MapPin className="h-4 w-4 text-emerald-500" />
                    </div>
                    <div className="text-2xl font-bold">{stats.available}</div>
                </div>
                <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="tracking-tight text-sm font-medium">Alugados</h3>
                        <Building2 className="h-4 w-4 text-blue-500" />
                    </div>
                    <div className="text-2xl font-bold">{stats.rented}</div>
                </div>
                <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                    <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <h3 className="tracking-tight text-sm font-medium">Valor Total</h3>
                        <DollarSign className="h-4 w-4 text-amber-500" />
                    </div>
                    <div className="text-2xl font-bold">
                        {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(stats.totalValue)}
                    </div>
                </div>
            </div>

            {/* Filters & Actions */}
            <div className="flex items-center justify-between gap-4 bg-card p-4 rounded-lg border shadow-sm">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar por endereço, proprietário..."
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
                            <tr className="border-b transition-colors hover:bg-muted/50">
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Endereço</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Proprietário</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Valor Aluguel</th>
                                <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">Status</th>
                                <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="[&_tr:last-child]:border-0">
                            {isLoading ? (
                                <tr className="border-b transition-colors hover:bg-muted/50">
                                    <td colSpan={5} className="p-4 text-center align-middle h-24">
                                        Carregando...
                                    </td>
                                </tr>
                            ) : properties.length === 0 ? (
                                <tr className="border-b transition-colors hover:bg-muted/50">
                                    <td colSpan={5} className="p-4 text-center align-middle h-24 text-muted-foreground">
                                        Nenhum imóvel cadastrado. Clique em "Novo Imóvel" para começar.
                                    </td>
                                </tr>
                            ) : (
                                properties.map((property: any) => (
                                    <tr key={property.id} className="border-b transition-colors hover:bg-muted/50">
                                        <td className="p-4 align-middle">{property.address}</td>
                                        <td className="p-4 align-middle">{property.owner}</td>
                                        <td className="p-4 align-middle">{property.rent}</td>
                                        <td className="p-4 align-middle">{property.status}</td>
                                        <td className="p-4 align-middle text-right">
                                            <Button variant="ghost" size="sm">
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
