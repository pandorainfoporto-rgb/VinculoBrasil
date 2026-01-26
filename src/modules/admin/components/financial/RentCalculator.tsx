import { useState, useEffect } from "react";
import { Calculator, DollarSign, TrendingUp, Info } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { pricingService, type PricingBreakdown } from "@/services/pricingService";

export function RentCalculator() {
    const [ownerNet, setOwnerNet] = useState<string>("850");
    const [agencyFee, setAgencyFee] = useState<string>("0");
    const [realtorFee, setRealtorFee] = useState<string>("0");
    const [fireInsurance, setFireInsurance] = useState<string>("0");
    const [breakdown, setBreakdown] = useState<PricingBreakdown | null>(null);
    const [isCalculating, setIsCalculating] = useState(false);

    useEffect(() => {
        const calculate = async () => {
            try {
                setIsCalculating(true);
                const result = await pricingService.simulate({
                    ownerNet: parseFloat(ownerNet) || 0,
                    agencyFee: parseFloat(agencyFee) || 0,
                    realtorFee: parseFloat(realtorFee) || 0,
                    fireInsurance: parseFloat(fireInsurance) || 0,
                });
                setBreakdown(result);
            } catch (error) {
                console.error("Erro ao calcular:", error);
            } finally {
                setIsCalculating(false);
            }
        };

        const timer = setTimeout(calculate, 300);
        return () => clearTimeout(timer);
    }, [ownerNet, agencyFee, realtorFee, fireInsurance]);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
        }).format(value);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                    <Calculator className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold">Simulador de Aluguel</h2>
                    <p className="text-sm text-muted-foreground">
                        Cálculo Reverso (Gross Up) - Fórmula 85/15
                    </p>
                </div>
            </div>

            {/* Info Alert */}
            <div className="flex gap-3 p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg">
                <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-900 dark:text-blue-100">
                    <p className="font-medium mb-1">Como funciona o cálculo?</p>
                    <p className="text-blue-700 dark:text-blue-300">
                        O sistema soma todos os custos (Proprietário + Taxas) e divide por 0.85 para
                        garantir que 85% do aluguel cubra esses valores. Os 15% restantes são a receita
                        da plataforma (Taxa Administrativa + Fundo Garantidor).
                    </p>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Inputs */}
                <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <DollarSign className="h-5 w-5" />
                        Valores de Entrada
                    </h3>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label>Quanto o Proprietário quer receber? *</Label>
                            <Input
                                type="number"
                                step="0.01"
                                value={ownerNet}
                                onChange={(e) => setOwnerNet(e.target.value)}
                                placeholder="850.00"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Taxa da Imobiliária (opcional)</Label>
                            <Input
                                type="number"
                                step="0.01"
                                value={agencyFee}
                                onChange={(e) => setAgencyFee(e.target.value)}
                                placeholder="0.00"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Comissão do Corretor (opcional)</Label>
                            <Input
                                type="number"
                                step="0.01"
                                value={realtorFee}
                                onChange={(e) => setRealtorFee(e.target.value)}
                                placeholder="0.00"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Seguro Incêndio (estimado)</Label>
                            <Input
                                type="number"
                                step="0.01"
                                value={fireInsurance}
                                onChange={(e) => setFireInsurance(e.target.value)}
                                placeholder="0.00"
                            />
                        </div>
                    </div>
                </Card>

                {/* Results */}
                <Card className="p-6">
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Resultado do Cálculo
                    </h3>
                    {isCalculating ? (
                        <div className="text-center py-8 text-muted-foreground">
                            Calculando...
                        </div>
                    ) : breakdown ? (
                        <div className="space-y-4">
                            {/* Main Result */}
                            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 border-2 border-emerald-500 rounded-lg">
                                <div className="text-sm text-emerald-700 dark:text-emerald-300 mb-1">
                                    Valor do Aluguel no Contrato
                                </div>
                                <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">
                                    {formatCurrency(breakdown.tenantTotal)}
                                </div>
                            </div>

                            {/* Breakdown */}
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between py-2 border-b">
                                    <span className="text-muted-foreground">Grupo A (85%)</span>
                                    <span className="font-medium">{formatCurrency(breakdown.groupA)}</span>
                                </div>
                                <div className="flex justify-between py-2 border-b">
                                    <span className="text-muted-foreground ml-4">• Proprietário</span>
                                    <span>{formatCurrency(breakdown.ownerNet)}</span>
                                </div>
                                {breakdown.agencyFee > 0 && (
                                    <div className="flex justify-between py-2 border-b">
                                        <span className="text-muted-foreground ml-4">• Imobiliária</span>
                                        <span>{formatCurrency(breakdown.agencyFee)}</span>
                                    </div>
                                )}
                                {breakdown.realtorFee > 0 && (
                                    <div className="flex justify-between py-2 border-b">
                                        <span className="text-muted-foreground ml-4">• Corretor</span>
                                        <span>{formatCurrency(breakdown.realtorFee)}</span>
                                    </div>
                                )}
                                {breakdown.fireInsurance > 0 && (
                                    <div className="flex justify-between py-2 border-b">
                                        <span className="text-muted-foreground ml-4">• Seguro</span>
                                        <span>{formatCurrency(breakdown.fireInsurance)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between py-2 border-b bg-blue-50 dark:bg-blue-900/10 px-2 rounded">
                                    <span className="font-medium">Receita Plataforma (15%)</span>
                                    <span className="font-medium text-blue-600 dark:text-blue-400">
                                        {formatCurrency(breakdown.platformRevenue)}
                                    </span>
                                </div>
                            </div>

                            {/* Validation */}
                            <div className="text-xs text-muted-foreground pt-2">
                                Validação: Grupo A = {breakdown.groupAPercentage.toFixed(2)}% | Plataforma ={" "}
                                {breakdown.platformPercentage.toFixed(2)}%
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-8 text-muted-foreground">
                            Preencha os valores para ver o resultado
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
}
