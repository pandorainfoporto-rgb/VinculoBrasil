import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Calculator, TrendingUp, Shield, Building2, Percent } from 'lucide-react';
import { calculateRentalBreakdown, validateBreakdown, type RentalBreakdownResult } from '@/services/FinancialService';

export const Route = createFileRoute('/simulador')({
  component: SimuladorPage,
});

function SimuladorPage() {
  const [ownerNet, setOwnerNet] = useState<number>(1000);
  const [hasAgency, setHasAgency] = useState<boolean>(false);
  const [agencyRate, setAgencyRate] = useState<number>(10);
  const [agencyModel, setAgencyModel] = useState<'DEDUCT_FROM_OWNER' | 'ADD_ON_PRICE'>('DEDUCT_FROM_OWNER');

  // Calcular breakdown
  const breakdown: RentalBreakdownResult = calculateRentalBreakdown({
    ownerNetRequest: ownerNet,
    hasAgency,
    agencyCommissionRate: agencyRate,
    agencyCommissionModel: agencyModel
  });

  const validation = validateBreakdown(breakdown);

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Calculator className="w-8 h-8 text-primary" />
          <h1 className="text-4xl font-bold">Simulador Financeiro 85/15</h1>
        </div>
        <p className="text-muted-foreground text-lg">
          Motor de Cálculo do Protocolo Phoenix - Vínculo Brasil
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Painel de Inputs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Configuração do Contrato
            </CardTitle>
            <CardDescription>
              Configure os parâmetros para simular o cálculo do aluguel
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Input: Valor Líquido */}
            <div className="space-y-2">
              <Label htmlFor="ownerNet" className="text-base font-semibold">
                Quanto você quer receber LÍQUIDO? 💰
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  R$
                </span>
                <Input
                  id="ownerNet"
                  type="number"
                  value={ownerNet}
                  onChange={(e) => setOwnerNet(Number(e.target.value))}
                  className="pl-10 text-lg font-semibold"
                  min={0}
                  step={50}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                Valor que o proprietário quer receber na mão (líquido)
              </p>
            </div>

            <Separator />

            {/* Toggle: Tem Imobiliária */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="hasAgency" className="text-base font-semibold">
                  Tem Imobiliária? 🏢
                </Label>
                <p className="text-sm text-muted-foreground">
                  Se a negociação passa por uma agência imobiliária
                </p>
              </div>
              <Switch
                id="hasAgency"
                checked={hasAgency}
                onCheckedChange={setHasAgency}
              />
            </div>

            {/* Inputs condicionais da Agência */}
            {hasAgency && (
              <div className="space-y-4 pl-4 border-l-2 border-primary/20">
                {/* Taxa da Agência */}
                <div className="space-y-2">
                  <Label htmlFor="agencyRate" className="flex items-center gap-2">
                    <Percent className="w-4 h-4" />
                    Taxa da Imobiliária (%)
                  </Label>
                  <Input
                    id="agencyRate"
                    type="number"
                    value={agencyRate}
                    onChange={(e) => setAgencyRate(Number(e.target.value))}
                    min={0}
                    max={30}
                    step={0.5}
                  />
                </div>

                {/* Modelo de Comissão */}
                <div className="space-y-2">
                  <Label>Modelo de Cobrança</Label>
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => setAgencyModel('DEDUCT_FROM_OWNER')}
                      className={`w-full p-3 rounded-lg border-2 text-left transition-colors ${
                        agencyModel === 'DEDUCT_FROM_OWNER'
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="font-semibold">Desconta do Proprietário</div>
                      <div className="text-sm text-muted-foreground">
                        A comissão sai do valor líquido do dono
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setAgencyModel('ADD_ON_PRICE')}
                      className={`w-full p-3 rounded-lg border-2 text-left transition-colors ${
                        agencyModel === 'ADD_ON_PRICE'
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <div className="font-semibold">Cobra por Fora</div>
                      <div className="text-sm text-muted-foreground">
                        A comissão é adicionada ao preço total
                      </div>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Painel de Resultados */}
        <div className="space-y-6">
          {/* Card Principal: Valor Total */}
          <Card className="border-2 border-primary">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Inquilino Paga
                </span>
                {!validation.isValid && (
                  <Badge variant="destructive">Erro nos Cálculos</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-5xl font-bold text-primary mb-2">
                R$ {breakdown.totalRent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-muted-foreground">
                Valor total do aluguel por mês
              </p>
            </CardContent>
          </Card>

          {/* Card: Distribuição */}
          <Card>
            <CardHeader>
              <CardTitle>Distribuição Financeira</CardTitle>
              <CardDescription>Como o valor é dividido (Modelo 85/15)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Bloco do Proprietário (85%) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    Bloco do Proprietário
                  </span>
                  <Badge variant="secondary">{breakdown.ownerPercentage.toFixed(1)}%</Badge>
                </div>
                <div className="text-2xl font-bold mb-3">
                  R$ {breakdown.baseAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <div className="space-y-2 pl-4 border-l-2 border-muted">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Proprietário Recebe:</span>
                    <span className="font-semibold text-green-600">
                      R$ {breakdown.ownerNet.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  {breakdown.agencyCommission > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Comissão Imobiliária:</span>
                      <span className="font-semibold text-orange-600">
                        - R$ {breakdown.agencyCommission.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Bloco de Serviços (15%) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Bloco de Serviços
                  </span>
                  <Badge variant="secondary">{breakdown.servicePercentage.toFixed(1)}%</Badge>
                </div>
                <div className="text-2xl font-bold mb-3">
                  R$ {breakdown.serviceBlock.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <div className="space-y-2 pl-4 border-l-2 border-primary/30">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">🎯 Garantia NFT (5%):</span>
                    <span className="font-semibold">
                      R$ {breakdown.guarantorFee.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">🛡️ Seguro (Fixo):</span>
                    <span className="font-semibold">
                      R$ {breakdown.insuranceFee.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">💎 Margem Vínculo:</span>
                    <span className="font-semibold text-blue-600">
                      R$ {breakdown.platformMargin.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card: Validação */}
          {!validation.isValid && (
            <Card className="border-destructive">
              <CardHeader>
                <CardTitle className="text-destructive">Erros de Validação</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1 text-sm">
                  {validation.errors.map((error, idx) => (
                    <li key={idx} className="text-destructive">• {error}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Footer com Explicação */}
      <Card className="mt-8 bg-muted/50">
        <CardHeader>
          <CardTitle className="text-lg">🦅 Como funciona o Protocolo Phoenix?</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            <strong>Modelo 85/15:</strong> O proprietário sempre recebe 85% do valor total do aluguel.
            Os 15% restantes são distribuídos entre garantia NFT (5% fixo), seguro e margem da plataforma.
          </p>
          <p>
            <strong>Gross-Up Automático:</strong> O sistema calcula automaticamente qual deve ser o valor
            total do aluguel para que o proprietário receba exatamente o que pediu (líquido).
          </p>
          <p>
            <strong>Transparência Total:</strong> Todos os valores são calculados de forma transparente
            e validados matematicamente para garantir que a distribuição está correta.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
