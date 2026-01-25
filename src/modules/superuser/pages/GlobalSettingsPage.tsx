import { useState } from "react";
import {
  Settings,
  Percent,
  DollarSign,
  Gift,
  TrendingUp,
  BarChart3,
  Save,
  RotateCcw,
  AlertTriangle,
  CheckCircle,
  Building2,
} from "lucide-react";
import { useBusinessRulesStore } from "../../../stores/useBusinessRulesStore";
import { toast } from "sonner";

// ============================================================
// GLOBAL SETTINGS PAGE - Editor de Regras de Negócio
// ============================================================

type TabType = "splits" | "fees" | "cashback" | "anticipation" | "investor" | "agency";

export function GlobalSettingsPage() {
  const [activeTab, setActiveTab] = useState<TabType>("splits");
  const { lastUpdated, version, resetToDefaults } = useBusinessRulesStore();

  const tabs = [
    { id: "splits" as TabType, label: "Splits", icon: Percent },
    { id: "fees" as TabType, label: "Taxas", icon: DollarSign },
    { id: "agency" as TabType, label: "Imobiliária", icon: Building2 },
    { id: "cashback" as TabType, label: "Cashback", icon: Gift },
    { id: "anticipation" as TabType, label: "Antecipação", icon: TrendingUp },
    { id: "investor" as TabType, label: "Investidor", icon: BarChart3 },
  ];

  const handleReset = () => {
    if (confirm("Tem certeza que deseja resetar todas as configurações para os valores padrão?")) {
      resetToDefaults();
      toast.success("Configurações resetadas com sucesso!");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Settings className="text-blue-600" size={28} />
            Configurações Globais
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Gerencie as regras de negócio da plataforma
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Versão: <span className="font-semibold">{version}</span>
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Última atualização: {new Date(lastUpdated).toLocaleString("pt-BR")}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-gray-800">
        <div className="border-b border-gray-200 dark:border-gray-800">
          <div className="flex overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? "border-blue-600 text-blue-600"
                    : "border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                }`}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === "splits" && <SplitsTab />}
          {activeTab === "fees" && <FeesTab />}
          {activeTab === "agency" && <AgencyTab />}
          {activeTab === "cashback" && <CashbackTab />}
          {activeTab === "anticipation" && <AnticipationTab />}
          {activeTab === "investor" && <InvestorTab />}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex justify-end gap-3">
        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <RotateCcw size={18} />
          Resetar Padrões
        </button>
      </div>
    </div>
  );
}

// ============================================================
// SPLITS TAB
// ============================================================
function SplitsTab() {
  const { splitRates, setSplitRates } = useBusinessRulesStore();
  const [values, setValues] = useState(splitRates);

  const total = values.platform + values.insurer + values.guarantor + values.landlord;
  const isValid = total === 100;

  const handleSave = () => {
    if (!isValid) {
      toast.error("A soma dos splits deve ser exatamente 100%");
      return;
    }
    setSplitRates(values);
    toast.success("Taxas de split atualizadas com sucesso!");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start gap-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Distribuição de Split
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Configure como o valor do aluguel é distribuído entre os participantes.
            A soma deve totalizar exatamente 100%.
          </p>
        </div>
        <div className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
          isValid
            ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400"
            : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400"
        }`}>
          {isValid ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
          <span className="font-semibold">{total}%</span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <InputField
          label="Plataforma Vínculo"
          value={values.platform}
          onChange={(v) => setValues({ ...values, platform: v })}
          suffix="%"
          description="Taxa da plataforma por transação"
        />
        <InputField
          label="Seguradora"
          value={values.insurer}
          onChange={(v) => setValues({ ...values, insurer: v })}
          suffix="%"
          description="Prêmio de seguro fiança"
        />
        <InputField
          label="Garantidor"
          value={values.guarantor}
          onChange={(v) => setValues({ ...values, guarantor: v })}
          suffix="%"
          description="Taxa do garantidor do pool"
        />
        <InputField
          label="Proprietário"
          value={values.landlord}
          onChange={(v) => setValues({ ...values, landlord: v })}
          suffix="%"
          description="Valor líquido para o proprietário"
        />
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={!isValid}
          className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save size={18} />
          Salvar Splits
        </button>
      </div>
    </div>
  );
}

// ============================================================
// FEES TAB
// ============================================================
function FeesTab() {
  const { setupFees, setSetupFees } = useBusinessRulesStore();
  const [values, setValues] = useState(setupFees);

  const handleSave = () => {
    setSetupFees(values);
    toast.success("Taxas de setup atualizadas com sucesso!");
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Taxas de Setup
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Configure o valor cobrado na criação de novos contratos por tipo de imóvel.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <InputField
          label="Residencial"
          value={values.residential}
          onChange={(v) => setValues({ ...values, residential: v })}
          prefix="R$"
          description="Apartamentos, casas, studios"
        />
        <InputField
          label="Comercial"
          value={values.commercial}
          onChange={(v) => setValues({ ...values, commercial: v })}
          prefix="R$"
          description="Lojas, escritórios, salas"
        />
        <InputField
          label="Industrial"
          value={values.industrial}
          onChange={(v) => setValues({ ...values, industrial: v })}
          prefix="R$"
          description="Galpões, fábricas"
        />
        <InputField
          label="Rural"
          value={values.rural}
          onChange={(v) => setValues({ ...values, rural: v })}
          prefix="R$"
          description="Fazendas, sítios, chácaras"
        />
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Save size={18} />
          Salvar Taxas
        </button>
      </div>
    </div>
  );
}

// ============================================================
// AGENCY TAB
// ============================================================
function AgencyTab() {
  const { agencyCommissionRules, setAgencyCommissionRules } = useBusinessRulesStore();
  const [values, setValues] = useState({
    agencyCommissionRate: agencyCommissionRules.agencyCommissionRate * 100,
    realtorCommissionSplit: agencyCommissionRules.realtorCommissionSplit * 100,
  });

  const handleSave = () => {
    setAgencyCommissionRules({
      agencyCommissionRate: values.agencyCommissionRate / 100,
      realtorCommissionSplit: values.realtorCommissionSplit / 100,
    });
    toast.success("Regras de comissão atualizadas com sucesso!");
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Regras de Comissão (Imobiliária & Corretor)
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Configure as taxas padrão de comissão para imobiliárias e corretores.
          Estes valores são usados na Fórmula Mestra de precificação.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <InputField
          label="Taxa da Imobiliária"
          value={values.agencyCommissionRate}
          onChange={(v) => setValues({ ...values, agencyCommissionRate: v })}
          suffix="%"
          description="Comissão sobre o valor bruto do proprietário (X)"
        />
        <InputField
          label="Split do Corretor"
          value={values.realtorCommissionSplit}
          onChange={(v) => setValues({ ...values, realtorCommissionSplit: v })}
          suffix="%"
          description="Percentual da comissão destinado ao corretor"
        />
      </div>

      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
        <h4 className="text-sm font-medium text-blue-700 dark:text-blue-400 mb-2">
          Exemplo de Cálculo
        </h4>
        <p className="text-sm text-blue-600 dark:text-blue-300">
          Se o proprietário quer receber <strong>R$ 2.500</strong>:
        </p>
        <ul className="text-sm text-blue-600 dark:text-blue-300 mt-2 space-y-1">
          <li>• Comissão da Imobiliária (I) = R$ 2.500 × {values.agencyCommissionRate}% = <strong>R$ {(2500 * values.agencyCommissionRate / 100).toFixed(2)}</strong></li>
          <li>• Comissão do Corretor (C) = R$ {(2500 * values.agencyCommissionRate / 100).toFixed(2)} × {values.realtorCommissionSplit}% = <strong>R$ {(2500 * values.agencyCommissionRate / 100 * values.realtorCommissionSplit / 100).toFixed(2)}</strong></li>
          <li>• Líquido do Proprietário = R$ 2.500 - R$ {(2500 * values.agencyCommissionRate / 100).toFixed(2)} = <strong>R$ {(2500 - 2500 * values.agencyCommissionRate / 100).toFixed(2)}</strong></li>
        </ul>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Save size={18} />
          Salvar Comissões
        </button>
      </div>
    </div>
  );
}

// ============================================================
// CASHBACK TAB
// ============================================================
function CashbackTab() {
  const { cashbackRules, setCashbackRules } = useBusinessRulesStore();
  const [values, setValues] = useState(cashbackRules);

  const handleSave = () => {
    setCashbackRules(values);
    toast.success("Regras de cashback atualizadas com sucesso!");
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Regras de Cashback (VBRz)
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Configure os benefícios de cashback para inquilinos.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <InputField
          label="Pagamento em Dia"
          value={values.onTimePayment}
          onChange={(v) => setValues({ ...values, onTimePayment: v })}
          suffix="%"
          description="Cashback por pagar antes do vencimento"
        />
        <InputField
          label="Bônus por Indicação"
          value={values.referralBonus}
          onChange={(v) => setValues({ ...values, referralBonus: v })}
          prefix="R$"
          description="Valor ganho por indicar novo inquilino"
        />
        <InputField
          label="Multiplicador de Fidelidade"
          value={values.loyaltyMultiplier}
          onChange={(v) => setValues({ ...values, loyaltyMultiplier: v })}
          suffix="x"
          step={0.1}
          description="Multiplicador após 6 meses de contrato"
        />
        <InputField
          label="Máximo Mensal"
          value={values.maxMonthlyReward}
          onChange={(v) => setValues({ ...values, maxMonthlyReward: v })}
          prefix="R$"
          description="Limite máximo de cashback por mês"
        />
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Save size={18} />
          Salvar Cashback
        </button>
      </div>
    </div>
  );
}

// ============================================================
// ANTICIPATION TAB
// ============================================================
function AnticipationTab() {
  const { anticipationRules, setAnticipationRules } = useBusinessRulesStore();
  const [values, setValues] = useState(anticipationRules);

  const handleSave = () => {
    setAnticipationRules(values);
    toast.success("Regras de antecipação atualizadas com sucesso!");
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Regras de Antecipação
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Configure os parâmetros para antecipação de aluguéis para proprietários.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <InputField
          label="Mínimo de Meses"
          value={values.minMonths}
          onChange={(v) => setValues({ ...values, minMonths: v })}
          suffix="meses"
          description="Quantidade mínima para antecipar"
        />
        <InputField
          label="Máximo de Meses"
          value={values.maxMonths}
          onChange={(v) => setValues({ ...values, maxMonths: v })}
          suffix="meses"
          description="Quantidade máxima para antecipar"
        />
        <InputField
          label="Taxa de Desconto"
          value={values.discountRate}
          onChange={(v) => setValues({ ...values, discountRate: v })}
          suffix="%"
          description="Desconto aplicado na antecipação"
        />
        <InputField
          label="Taxa da Plataforma"
          value={values.platformFee}
          onChange={(v) => setValues({ ...values, platformFee: v })}
          suffix="%"
          description="Fee da plataforma na operação"
        />
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Save size={18} />
          Salvar Antecipação
        </button>
      </div>
    </div>
  );
}

// ============================================================
// INVESTOR TAB
// ============================================================
function InvestorTab() {
  const { investorRules, setInvestorRules } = useBusinessRulesStore();
  const [values, setValues] = useState(investorRules);

  const handleSave = () => {
    setInvestorRules(values);
    toast.success("Regras de investidor atualizadas com sucesso!");
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Regras para Investidores
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Configure os parâmetros do marketplace P2P de recebíveis.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <InputField
          label="Investimento Mínimo"
          value={values.minInvestment}
          onChange={(v) => setValues({ ...values, minInvestment: v })}
          prefix="R$"
          description="Valor mínimo por ativo"
        />
        <InputField
          label="Investimento Máximo"
          value={values.maxInvestment}
          onChange={(v) => setValues({ ...values, maxInvestment: v })}
          prefix="R$"
          description="Valor máximo por ativo"
        />
        <InputField
          label="Rendimento Anual Estimado"
          value={values.annualYield}
          onChange={(v) => setValues({ ...values, annualYield: v })}
          suffix="% a.a."
          description="Yield médio esperado"
        />
        <InputField
          label="Período de Lock"
          value={values.lockPeriodDays}
          onChange={(v) => setValues({ ...values, lockPeriodDays: v })}
          suffix="dias"
          description="Carência após compra de ativo"
        />
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Save size={18} />
          Salvar Investidor
        </button>
      </div>
    </div>
  );
}

// ============================================================
// INPUT FIELD COMPONENT
// ============================================================
function InputField({
  label,
  value,
  onChange,
  prefix,
  suffix,
  description,
  step = 1,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  prefix?: string;
  suffix?: string;
  description?: string;
  step?: number;
}) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <div className="relative">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
            {prefix}
          </span>
        )}
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          step={step}
          className={`w-full px-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
            prefix ? "pl-10" : ""
          } ${suffix ? "pr-16" : ""}`}
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
            {suffix}
          </span>
        )}
      </div>
      {description && (
        <p className="text-xs text-gray-500 dark:text-gray-400">{description}</p>
      )}
    </div>
  );
}
