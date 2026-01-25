import { useState, useMemo } from "react";
import {
  Calculator,
  DollarSign,
  Users,
  Building2,
  Shield,
  TrendingUp,
  Info,
  RefreshCw,
} from "lucide-react";
import { useBusinessRulesStore } from "../../../stores/useBusinessRulesStore";
import {
  calculateRentPricing,
  formatCurrency,
  formatPercent,
  type PricingRules,
} from "../../../utils/financial-math";

// ============================================================
// SPLIT CALCULATOR PAGE - Calculadora de Precificação
// ============================================================

export function SplitCalculatorPage() {
  const { splitRates, agencyCommissionRules } = useBusinessRulesStore();

  // Inputs
  const [ownerTarget, setOwnerTarget] = useState<number>(2500);
  const [insuranceCost, setInsuranceCost] = useState<number>(0);
  const [customAgencyRate, setCustomAgencyRate] = useState<number | null>(null);
  const [customRealtorSplit, setCustomRealtorSplit] = useState<number | null>(null);

  // Regras de precificação
  const pricingRules: PricingRules = useMemo(() => ({
    landlordReceiveRate: splitRates.landlord / 100,
    guarantorFeeRate: splitRates.guarantor / 100,
    agencyCommissionRate: customAgencyRate ?? agencyCommissionRules.agencyCommissionRate,
    realtorCommissionSplit: customRealtorSplit ?? agencyCommissionRules.realtorCommissionSplit,
  }), [splitRates, agencyCommissionRules, customAgencyRate, customRealtorSplit]);

  // Cálculo
  const result = useMemo(() => {
    if (ownerTarget <= 0) return null;
    try {
      return calculateRentPricing({
        ownerTargetX: ownerTarget,
        insuranceCostS: insuranceCost,
        rules: pricingRules,
      });
    } catch {
      return null;
    }
  }, [ownerTarget, insuranceCost, pricingRules]);

  const handleReset = () => {
    setOwnerTarget(2500);
    setInsuranceCost(0);
    setCustomAgencyRate(null);
    setCustomRealtorSplit(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Calculator className="text-blue-600" size={28} />
            Calculadora de Split
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Simule a precificação de aluguel com a Fórmula Mestra
          </p>
        </div>
        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <RefreshCw size={18} />
          Resetar
        </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="space-y-6">
          {/* Valor Desejado pelo Proprietário */}
          <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-gray-800 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <DollarSign className="text-green-600" size={20} />
              Valor Desejado pelo Proprietário (X)
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Quanto o proprietário quer receber de aluguel por mês?
            </p>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">R$</span>
              <input
                type="number"
                value={ownerTarget}
                onChange={(e) => setOwnerTarget(Number(e.target.value))}
                className="w-full pl-12 pr-4 py-4 text-2xl font-bold bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                placeholder="2500"
                min={0}
              />
            </div>
          </div>

          {/* Custo do Seguro */}
          <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-gray-800 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Shield className="text-purple-600" size={20} />
              Custo do Seguro (S)
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Custo mensal do seguro fiança ou incêndio
            </p>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">R$</span>
              <input
                type="number"
                value={insuranceCost}
                onChange={(e) => setInsuranceCost(Number(e.target.value))}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                placeholder="0"
                min={0}
              />
            </div>
          </div>

          {/* Taxas Personalizadas */}
          <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-gray-800 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <TrendingUp className="text-blue-600" size={20} />
              Taxas de Comissão
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Taxa da Imobiliária (sobre X)
                </label>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="number"
                    value={((customAgencyRate ?? agencyCommissionRules.agencyCommissionRate) * 100).toFixed(0)}
                    onChange={(e) => setCustomAgencyRate(Number(e.target.value) / 100)}
                    className="flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
                    min={0}
                    max={100}
                  />
                  <span className="text-gray-500">%</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Padrão: {(agencyCommissionRules.agencyCommissionRate * 100).toFixed(0)}%
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Split do Corretor (sobre comissão)
                </label>
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="number"
                    value={((customRealtorSplit ?? agencyCommissionRules.realtorCommissionSplit) * 100).toFixed(0)}
                    onChange={(e) => setCustomRealtorSplit(Number(e.target.value) / 100)}
                    className="flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white"
                    min={0}
                    max={100}
                  />
                  <span className="text-gray-500">%</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Padrão: {(agencyCommissionRules.realtorCommissionSplit * 100).toFixed(0)}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="space-y-6">
          {/* Aluguel Total */}
          {result && (
            <>
              <div className="bg-gradient-to-br from-blue-600 to-purple-700 rounded-xl p-6 text-white">
                <h3 className="text-lg font-medium opacity-90 mb-2">Aluguel Total para o Inquilino</h3>
                <p className="text-4xl font-bold mb-2">{formatCurrency(result.totalRent)}</p>
                <p className="text-sm opacity-75">
                  Baseado na fórmula: X / {(pricingRules.landlordReceiveRate * 100).toFixed(0)}%
                </p>
              </div>

              {/* Breakdown Cards */}
              <div className="grid grid-cols-2 gap-4">
                <BreakdownCard
                  icon={Building2}
                  label="Proprietário (X)"
                  value={formatCurrency(result.ownerGross)}
                  percent={formatPercent(result.breakdown.landlordPercent)}
                  color="green"
                />
                <BreakdownCard
                  icon={Shield}
                  label="Garantidor (G)"
                  value={formatCurrency(result.guarantorFee)}
                  percent={formatPercent(result.breakdown.guarantorPercent)}
                  color="purple"
                />
                <BreakdownCard
                  icon={TrendingUp}
                  label="Plataforma (P)"
                  value={formatCurrency(result.platformFee)}
                  percent={formatPercent(result.breakdown.platformPercent)}
                  color="blue"
                />
                <BreakdownCard
                  icon={Shield}
                  label="Seguro (S)"
                  value={formatCurrency(result.insuranceCost)}
                  percent={formatPercent(result.breakdown.insurancePercent)}
                  color="gray"
                />
              </div>

              {/* Comissões */}
              <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-gray-800 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Users className="text-orange-600" size={20} />
                  Distribuição da Comissão
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Comissão da Imobiliária (I)</p>
                      <p className="text-xl font-bold text-orange-600 dark:text-orange-400">
                        {formatCurrency(result.agencyFee)}
                      </p>
                    </div>
                    <span className="text-sm text-gray-500">
                      {(pricingRules.agencyCommissionRate * 100).toFixed(0)}% de X
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Comissão do Corretor (C)</p>
                      <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                        {formatCurrency(result.realtorFee)}
                      </p>
                    </div>
                    <span className="text-sm text-gray-500">
                      {(pricingRules.realtorCommissionSplit * 100).toFixed(0)}% de I
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Líquido do Proprietário</p>
                      <p className="text-xl font-bold text-green-600 dark:text-green-400">
                        {formatCurrency(result.ownerNet)}
                      </p>
                    </div>
                    <span className="text-sm text-gray-500">
                      X - I
                    </span>
                  </div>
                </div>
              </div>

              {/* Formula Info */}
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
                <div className="flex items-start gap-3">
                  <Info className="text-blue-600 mt-0.5" size={18} />
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <p className="font-medium text-gray-900 dark:text-white mb-2">Fórmula Mestra:</p>
                    <ul className="space-y-1 font-mono text-xs">
                      <li>V_total = X / 0.85</li>
                      <li>G = V_total × 5%</li>
                      <li>P = V_total - (X + G + S)</li>
                      <li>I = X × {(pricingRules.agencyCommissionRate * 100).toFixed(0)}%</li>
                      <li>C = I × {(pricingRules.realtorCommissionSplit * 100).toFixed(0)}%</li>
                      <li>Líquido = X - I</li>
                    </ul>
                  </div>
                </div>
              </div>
            </>
          )}

          {!result && (
            <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-gray-800 p-12 text-center">
              <Calculator className="mx-auto text-gray-300 dark:text-gray-600 mb-4" size={48} />
              <p className="text-gray-500 dark:text-gray-400">
                Digite um valor maior que zero para ver o cálculo
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// BREAKDOWN CARD
// ============================================================
function BreakdownCard({
  icon: Icon,
  label,
  value,
  percent,
  color,
}: {
  icon: typeof DollarSign;
  label: string;
  value: string;
  percent: string;
  color: "green" | "purple" | "blue" | "gray";
}) {
  const colors = {
    green: "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400",
    purple: "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400",
    blue: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
    gray: "bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400",
  };

  const iconColors = {
    green: "text-green-600 dark:text-green-400",
    purple: "text-purple-600 dark:text-purple-400",
    blue: "text-blue-600 dark:text-blue-400",
    gray: "text-gray-600 dark:text-gray-400",
  };

  return (
    <div className={`rounded-xl p-4 ${colors[color]}`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon size={16} className={iconColors[color]} />
        <span className="text-xs font-medium">{label}</span>
      </div>
      <p className="text-xl font-bold">{value}</p>
      <p className="text-xs opacity-75">{percent} do total</p>
    </div>
  );
}
