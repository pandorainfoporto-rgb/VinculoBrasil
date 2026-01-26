import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, FileText, Shield, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { leaseService } from "@/services/leaseService";
import { web3Service } from "@/services/web3Service";

export function LeaseDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: lease, isLoading } = useQuery({
        queryKey: ["lease", id],
        queryFn: () => leaseService.getById(id!),
        enabled: !!id,
    });

    const { data: web3Status } = useQuery({
        queryKey: ["web3Status", id],
        queryFn: () => web3Service.getStatus(id!),
        enabled: !!id,
    });

    const mintMutation = useMutation({
        mutationFn: () => web3Service.mintLease(id!),
        onSuccess: () => {
            alert("Contrato tokenizado com sucesso!");
            queryClient.invalidateQueries({ queryKey: ["web3Status", id] });
            queryClient.invalidateQueries({ queryKey: ["lease", id] });
        },
        onError: (error: any) => {
            alert(`Erro: ${error.response?.data?.error || "Falha ao tokenizar"}`);
        },
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-lg font-medium">Carregando contrato...</div>
            </div>
        );
    }

    if (!lease) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-lg text-muted-foreground">Contrato não encontrado</div>
            </div>
        );
    }

    const onChainStatus = web3Status?.onChainStatus || "NOT_MINTED";
    const isMinted = onChainStatus === "MINTED";

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={() => navigate("/admin/leases")}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Voltar
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Detalhes do Contrato</h1>
                    <p className="text-muted-foreground">
                        {lease.property?.street}, {lease.property?.number}
                    </p>
                </div>
            </div>

            {/* Contract Info */}
            <div className="rounded-lg border bg-card p-6 space-y-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Informações do Contrato
                </h2>
                <div className="grid gap-4 md:grid-cols-2">
                    <div>
                        <div className="text-sm text-muted-foreground">Inquilino</div>
                        <div className="font-medium">{lease.tenant?.name}</div>
                    </div>
                    <div>
                        <div className="text-sm text-muted-foreground">Proprietário</div>
                        <div className="font-medium">{lease.owner?.name}</div>
                    </div>
                    <div>
                        <div className="text-sm text-muted-foreground">Valor do Aluguel</div>
                        <div className="font-medium text-lg">
                            {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
                                Number(lease.rentAmount)
                            )}
                        </div>
                    </div>
                    <div>
                        <div className="text-sm text-muted-foreground">Status</div>
                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${lease.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' :
                                'bg-gray-100 text-gray-800'
                            }`}>
                            {lease.status}
                        </span>
                    </div>
                </div>
            </div>

            {/* Blockchain Assets Card */}
            <div className="rounded-lg border bg-card p-6 space-y-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                    <Shield className="h-5 w-5 text-purple-500" />
                    Blockchain Assets (Web3)
                </h2>

                {!isMinted ? (
                    <div className="space-y-4">
                        <p className="text-sm text-muted-foreground">
                            Este contrato ainda não foi tokenizado. Clique no botão abaixo para criar um ativo digital imutável na blockchain Polygon.
                        </p>
                        <Button
                            onClick={() => mintMutation.mutate()}
                            disabled={mintMutation.isPending || lease.status !== 'ACTIVE'}
                            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                        >
                            {mintMutation.isPending ? "Tokenizando..." : "🔐 Tokenizar Contrato (Mint NFT)"}
                        </Button>
                        {lease.status !== 'ACTIVE' && (
                            <p className="text-xs text-amber-600">
                                ⚠️ Apenas contratos ATIVOS podem ser tokenizados
                            </p>
                        )}
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div className="rounded-lg bg-gradient-to-r from-emerald-50 to-blue-50 border-2 border-emerald-200 p-6 space-y-3">
                            <div className="flex items-center gap-2 text-emerald-700 font-semibold">
                                <Shield className="h-5 w-5" />
                                ✅ Contrato Registrado na Blockchain
                            </div>

                            <div className="grid gap-3">
                                <div>
                                    <div className="text-xs text-muted-foreground">Token ID</div>
                                    <div className="font-mono text-sm font-medium">
                                        #{web3Status?.tokenId}
                                    </div>
                                </div>

                                <div>
                                    <div className="text-xs text-muted-foreground">Smart Contract Address</div>
                                    <div className="font-mono text-xs break-all">
                                        {web3Status?.smartContractAddress}
                                    </div>
                                </div>

                                {web3Status?.mockMode && (
                                    <div className="rounded bg-amber-100 border border-amber-300 p-2">
                                        <div className="text-xs text-amber-800">
                                            🔶 <strong>MOCK MODE:</strong> Este é um hash simulado para testes. Configure BLOCKCHAIN_RPC_URL para usar blockchain real.
                                        </div>
                                    </div>
                                )}
                            </div>

                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(`https://polygonscan.com/address/${web3Status?.smartContractAddress}`, '_blank')}
                                className="mt-2"
                            >
                                <ExternalLink className="h-4 w-4 mr-2" />
                                Ver no PolygonScan
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
