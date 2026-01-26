import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowLeft, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { leaseService } from "@/services/leaseService";
import { pricingService } from "@/services/pricingService";

export function NewLeasePage() {
    const navigate = useNavigate();
    const [ownerNetValue, setOwnerNetValue] = useState("850");
    const [calculatedRent, setCalculatedRent] = useState<number | null>(null);

    const [formData, setFormData] = useState({
        propertyId: "",
        tenantId: "",
        ownerId: "",
        guarantorId: "",
        startDate: new Date().toISOString().split('T')[0],
        durationMonths: 30,
        paymentDay: 10,
    });

    const createMutation = useMutation({
        mutationFn: leaseService.create,
        onSuccess: () => {
            alert("Contrato criado com sucesso!");
            navigate("/admin/leases");
        },
        onError: (error) => {
            console.error(error);
            alert("Erro ao criar contrato");
        },
    });

    const handleCalculate = async () => {
        try {
            const result = await pricingService.simulate({ ownerNet: parseFloat(ownerNetValue) });
            setCalculatedRent(result.tenantTotal);
        } catch (error) {
            console.error(error);
            alert("Erro ao calcular aluguel");
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.propertyId || !formData.tenantId || !formData.ownerId) {
            alert("Preencha todos os campos obrigatórios");
            return;
        }

        createMutation.mutate({
            ...formData,
            ownerNetValue: parseFloat(ownerNetValue),
            guarantorId: formData.guarantorId || undefined,
        });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" onClick={() => navigate("/admin/leases")}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Voltar
                </Button>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Novo Contrato de Locação</h1>
                    <p className="text-muted-foreground">
                        Crie um novo contrato vinculando imóvel, inquilino e valores
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Property & People */}
                <div className="rounded-lg border bg-card p-6 space-y-4">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Partes do Contrato
                    </h2>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <Label htmlFor="propertyId">ID do Imóvel *</Label>
                            <Input
                                id="propertyId"
                                placeholder="UUID do imóvel"
                                value={formData.propertyId}
                                onChange={(e) => setFormData({ ...formData, propertyId: e.target.value })}
                                required
                            />
                            <p className="text-xs text-muted-foreground mt-1">
                                Copie o ID da página de Imóveis
                            </p>
                        </div>

                        <div>
                            <Label htmlFor="ownerId">ID do Proprietário *</Label>
                            <Input
                                id="ownerId"
                                placeholder="UUID do proprietário"
                                value={formData.ownerId}
                                onChange={(e) => setFormData({ ...formData, ownerId: e.target.value })}
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="tenantId">ID do Inquilino *</Label>
                            <Input
                                id="tenantId"
                                placeholder="UUID do inquilino"
                                value={formData.tenantId}
                                onChange={(e) => setFormData({ ...formData, tenantId: e.target.value })}
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="guarantorId">ID do Garantidor (Opcional)</Label>
                            <Input
                                id="guarantorId"
                                placeholder="UUID do garantidor"
                                value={formData.guarantorId}
                                onChange={(e) => setFormData({ ...formData, guarantorId: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                {/* Financial */}
                <div className="rounded-lg border bg-card p-6 space-y-4">
                    <h2 className="text-xl font-semibold">Valores Financeiros</h2>

                    <div className="grid gap-4 md:grid-cols-3">
                        <div>
                            <Label htmlFor="ownerNet">Valor Líquido do Dono (R$) *</Label>
                            <Input
                                id="ownerNet"
                                type="number"
                                step="0.01"
                                value={ownerNetValue}
                                onChange={(e) => setOwnerNetValue(e.target.value)}
                                required
                            />
                        </div>

                        <div className="flex items-end">
                            <Button type="button" onClick={handleCalculate} variant="outline">
                                Calcular Aluguel Total
                            </Button>
                        </div>

                        {calculatedRent && (
                            <div className="flex items-end">
                                <div className="text-2xl font-bold text-green-600">
                                    R$ {calculatedRent.toFixed(2)}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Contract Terms */}
                <div className="rounded-lg border bg-card p-6 space-y-4">
                    <h2 className="text-xl font-semibold">Termos do Contrato</h2>

                    <div className="grid gap-4 md:grid-cols-3">
                        <div>
                            <Label htmlFor="startDate">Data de Início *</Label>
                            <Input
                                id="startDate"
                                type="date"
                                value={formData.startDate}
                                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="durationMonths">Duração (Meses) *</Label>
                            <Input
                                id="durationMonths"
                                type="number"
                                value={formData.durationMonths}
                                onChange={(e) => setFormData({ ...formData, durationMonths: parseInt(e.target.value) })}
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="paymentDay">Dia do Vencimento *</Label>
                            <Input
                                id="paymentDay"
                                type="number"
                                min="1"
                                max="31"
                                value={formData.paymentDay}
                                onChange={(e) => setFormData({ ...formData, paymentDay: parseInt(e.target.value) })}
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-4">
                    <Button type="button" variant="outline" onClick={() => navigate("/admin/leases")}>
                        Cancelar
                    </Button>
                    <Button type="submit" disabled={createMutation.isPending}>
                        {createMutation.isPending ? "Criando..." : "Criar Contrato"}
                    </Button>
                </div>
            </form>
        </div>
    );
}
