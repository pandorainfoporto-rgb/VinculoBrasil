// ============================================
// AGENCY OS - Simulador de Split (DeFi)
// Calculadora isolada de split de valores
// ============================================

import { createFileRoute } from '@tanstack/react-router';
import { AgencyLayout } from '@/components/layouts/AgencyLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Calculator,
  ArrowDownRight,
  ArrowUpRight,
  Wallet,
  Building2,
  User,
  Users,
  Shield,
  PiggyBank,
  CornerDownRight,
  Info,
  RefreshCw,
} from 'lucide-react';
import { useState, useMemo } from 'react';

export const Route = createFileRoute('/agency/split-calculator' as never)({
  component: SplitCalculatorPage,
});

interface SimulatorState {
  baseValue: number;
  agencyFee: number;
  agentFee: number;
  pricingModel: 'GROSS' | 'NET';
}

function SplitCalculatorPage() {
  const [sim, setSim] = useState<SimulatorState>({
    baseValue: 2000,
    agencyFee: 10,
    agentFee: 30,
    pricingModel: 'NET',
  });

  // Calculo do Split
  const splitResult = useMemo(() => {
    const agencyRate = sim.agencyFee / 100;
    const agentRate = sim.agentFee / 100;

    let V = 0;          // Base Imobiliaria (85% do Total)
    let ownerShare = 0; // Repasse ao Proprietario
    let agencyGross = 0; // Receita Bruta Agencia

    if (sim.pricingModel === 'GROSS') {
      // GROSS: Valor de entrada ja e o V, comissao descontada do total
      V = sim.baseValue;
      agencyGross = V * agencyRate;
      ownerShare = V - agencyGross;
    } else {
      // NET: Valor de entrada e o liquido do dono, comissao somada
      ownerShare = sim.baseValue;
      agencyGross = sim.baseValue * agencyRate;
      V = ownerShare + agencyGross;
    }

    // Split do Corretor (sai da fatia da Agencia)
    const agentSplit = agencyGross * agentRate;
    const agencyNet = agencyGross - agentSplit;

    // Ecossistema Vinculo: V = 85%, entao VT = V / 0.85
    const VT = V / 0.85;
    const vinculoSystem = VT - V;

    // Detalhes do 15% Vinculo
    const warranty = vinculoSystem * 0.53;   // ~8% do total
    const platform = vinculoSystem * 0.47;   // ~7% do total

    return {
      V,
      VT,
      ownerShare,
      agencyGross,
      agencyNet,
      agentSplit,
      vinculoSystem,
      warranty,
      platform,
    };
  }, [sim]);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const resetSimulator = () => {
    setSim({
      baseValue: 2000,
      agencyFee: 10,
      agentFee: 30,
      pricingModel: 'NET',
    });
  };

  return (
    <AgencyLayout agencyName="Minha Imobiliaria" userName="Usuario" userEmail="usuario@email.com">
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
              <Calculator className="h-6 w-6 text-blue-400" />
              Simulador de Split (DeFi)
            </h1>
            <p className="text-zinc-400 mt-1">
              Visualize como o valor do aluguel e dividido entre todas as partes
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={resetSimulator}
            className="border-zinc-700 text-zinc-400 hover:text-zinc-100"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Resetar
          </Button>
        </div>

        {/* Controles */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-zinc-100">Parametros da Simulacao</CardTitle>
            <CardDescription className="text-zinc-500">
              Ajuste os valores para ver como afeta a distribuicao
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Valor Base */}
            <div className="space-y-2">
              <Label className="text-zinc-300">Valor do Aluguel (Base)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">R$</span>
                <Input
                  type="number"
                  value={sim.baseValue}
                  onChange={(e) => setSim({ ...sim, baseValue: Number(e.target.value) })}
                  className="pl-10 text-lg font-bold bg-zinc-800 border-zinc-700 text-zinc-100"
                />
              </div>
            </div>

            {/* Taxas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-zinc-300">Taxa de Administracao (%)</Label>
                <div className="relative">
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={sim.agencyFee}
                    onChange={(e) => setSim({ ...sim, agencyFee: Number(e.target.value) })}
                    className="bg-zinc-800 border-zinc-700 text-zinc-100"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500">%</span>
                </div>
                <p className="text-xs text-zinc-600">Sua comissao como imobiliaria</p>
              </div>

              <div className="space-y-2">
                <Label className="text-zinc-300">Comissao do Corretor (%)</Label>
                <div className="relative">
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    value={sim.agentFee}
                    onChange={(e) => setSim({ ...sim, agentFee: Number(e.target.value) })}
                    className="bg-zinc-800 border-zinc-700 text-zinc-100"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500">%</span>
                </div>
                <p className="text-xs text-zinc-600">Sobre a sua comissao</p>
              </div>
            </div>

            {/* Toggle GROSS / NET */}
            <div>
              <Label className="text-zinc-300 mb-3 block">Modelo de Precificacao</Label>
              <div className="flex gap-3 p-1 bg-zinc-800 rounded-lg border border-zinc-700">
                <button
                  type="button"
                  onClick={() => setSim({ ...sim, pricingModel: 'GROSS' })}
                  className={`flex-1 py-3 rounded-md font-medium transition-all flex items-center justify-center gap-2 ${
                    sim.pricingModel === 'GROSS'
                      ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                      : 'text-zinc-500 hover:bg-zinc-700'
                  }`}
                >
                  <ArrowDownRight className="h-4 w-4" />
                  GROSS (Descontar)
                </button>
                <button
                  type="button"
                  onClick={() => setSim({ ...sim, pricingModel: 'NET' })}
                  className={`flex-1 py-3 rounded-md font-medium transition-all flex items-center justify-center gap-2 ${
                    sim.pricingModel === 'NET'
                      ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
                      : 'text-zinc-500 hover:bg-zinc-700'
                  }`}
                >
                  <ArrowUpRight className="h-4 w-4" />
                  NET (Acrescentar)
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Resultado Visual - Cascata */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-zinc-100">Cascata de Distribuicao</CardTitle>
            <CardDescription className="text-zinc-500">
              Visualize como o dinheiro flui do inquilino ate cada parte
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 font-mono">
            {/* 1. Boleto do Inquilino */}
            <div className="flex justify-between items-center bg-zinc-800 text-white p-4 rounded-lg">
              <div className="flex items-center gap-3">
                <Wallet className="h-5 w-5 text-zinc-400" />
                <span className="text-zinc-300">Boleto do Inquilino</span>
              </div>
              <span className="font-bold text-xl">{formatCurrency(splitResult.VT)}</span>
            </div>

            {/* Cascata */}
            <div className="pl-4 border-l-2 border-zinc-700 space-y-3 ml-3">
              {/* 2. Vinculo 15% */}
              <div className="flex justify-between text-zinc-500 text-sm py-2">
                <span className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Ecossistema Vinculo (15%)
                </span>
                <span className="text-red-400">- {formatCurrency(splitResult.vinculoSystem)}</span>
              </div>

              {/* Detalhes do 15% */}
              <div className="pl-4 border-l border-zinc-800 ml-2 space-y-1 text-xs text-zinc-600">
                <div className="flex justify-between">
                  <span>├ Garantia Digital (~8%)</span>
                  <span>{formatCurrency(splitResult.warranty)}</span>
                </div>
                <div className="flex justify-between">
                  <span>└ Taxa Plataforma (~7%)</span>
                  <span>{formatCurrency(splitResult.platform)}</span>
                </div>
              </div>

              {/* 3. Base Imobiliaria 85% */}
              <div className="flex justify-between font-bold text-zinc-200 py-2 bg-zinc-800/50 px-3 rounded">
                <span className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-zinc-400" />
                  Base Imobiliaria (85%)
                </span>
                <span>{formatCurrency(splitResult.V)}</span>
              </div>

              {/* 4. Splits Imobiliarios */}
              <div className="pl-4 border-l-2 border-blue-900/50 space-y-3 ml-3">
                {/* Proprietario */}
                <div className="flex justify-between text-emerald-400 font-medium py-2">
                  <span className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Proprietario
                  </span>
                  <span>{formatCurrency(splitResult.ownerShare)}</span>
                </div>

                {/* Agencia Bruto */}
                <div className="flex justify-between text-blue-400 font-medium bg-blue-900/20 p-3 rounded">
                  <span className="flex items-center gap-2">
                    <PiggyBank className="h-4 w-4" />
                    Agencia (Bruto)
                  </span>
                  <span>{formatCurrency(splitResult.agencyGross)}</span>
                </div>

                {/* 5. Corretor dentro da Agencia */}
                <div className="pl-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-orange-400 font-bold">
                    <CornerDownRight className="h-4 w-4" />
                    <div className="flex-1 flex justify-between">
                      <span>Corretor ({sim.agentFee}%)</span>
                      <span>{formatCurrency(splitResult.agentSplit)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-blue-300 font-bold">
                    <CornerDownRight className="h-4 w-4" />
                    <div className="flex-1 flex justify-between">
                      <span>Agencia (Liquido)</span>
                      <span>{formatCurrency(splitResult.agencyNet)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Explicacao do Modelo */}
        <Card className={`${
          sim.pricingModel === 'GROSS'
            ? 'bg-blue-900/20 border-blue-500/30'
            : 'bg-emerald-900/20 border-emerald-500/30'
        }`}>
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className={`p-3 rounded-lg ${
                sim.pricingModel === 'GROSS' ? 'bg-blue-500/20' : 'bg-emerald-500/20'
              }`}>
                <Info className={`h-6 w-6 ${
                  sim.pricingModel === 'GROSS' ? 'text-blue-400' : 'text-emerald-400'
                }`} />
              </div>
              <div>
                <h3 className={`font-bold ${
                  sim.pricingModel === 'GROSS' ? 'text-blue-400' : 'text-emerald-400'
                }`}>
                  {sim.pricingModel === 'GROSS' ? 'Modelo GROSS (Descontar)' : 'Modelo NET (Acrescentar)'}
                </h3>
                <p className="text-sm text-zinc-400 mt-2">
                  {sim.pricingModel === 'GROSS' ? (
                    <>
                      O valor de <strong>{formatCurrency(sim.baseValue)}</strong> ja inclui a comissao.
                      O proprietario recebe <strong>{formatCurrency(splitResult.ownerShare)}</strong> (valor descontado).
                      Ideal quando voce anuncia o valor total e negocia o desconto com o dono.
                    </>
                  ) : (
                    <>
                      O proprietario recebe exatamente <strong>{formatCurrency(sim.baseValue)}</strong> (liquido).
                      A comissao de <strong>{formatCurrency(splitResult.agencyGross)}</strong> e somada ao boleto.
                      Ideal para garantir ao dono o valor que ele espera receber.
                    </>
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Disclaimer */}
        <p className="text-xs text-zinc-600 text-center">
          * Valores estimados. O split final no Gateway pode variar centavos por arredondamento.
          A regra 85/15 e fixa do ecossistema Vinculo Brasil.
        </p>
      </div>
    </AgencyLayout>
  );
}
