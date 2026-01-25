import { Shield, Wallet, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";
import { useBusinessRulesStore } from "../../../stores/useBusinessRulesStore";

export function GuarantorDashboard() {
  const { splitRates } = useBusinessRulesStore();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Portal do Garantidor</h1>
        <p className="text-gray-500 dark:text-gray-400">Gestão de colaterais e rendimentos</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Shield}
          label="Garantias Ativas"
          value="23"
          color="blue"
        />
        <StatCard
          icon={Wallet}
          label="Colateral Bloqueado"
          value="R$ 450.000"
          color="purple"
        />
        <StatCard
          icon={TrendingUp}
          label="Yield Mensal"
          value={`${splitRates.guarantor}%`}
          color="green"
        />
        <StatCard
          icon={AlertTriangle}
          label="Em Risco"
          value="1"
          color="red"
        />
      </div>

      {/* Active Guarantees */}
      <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-gray-800 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Garantias Ativas</h2>
        <div className="space-y-3">
          <GuaranteeItem
            contract="Contrato #2156"
            tenant="João Silva"
            collateral="R$ 15.000"
            monthlyYield="R$ 750"
            status="healthy"
          />
          <GuaranteeItem
            contract="Contrato #2134"
            tenant="Maria Santos"
            collateral="R$ 25.000"
            monthlyYield="R$ 1.250"
            status="healthy"
          />
          <GuaranteeItem
            contract="Contrato #2098"
            tenant="Pedro Oliveira"
            collateral="R$ 10.000"
            monthlyYield="R$ 500"
            status="warning"
          />
        </div>
      </div>

      {/* Yield History */}
      <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-gray-800 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Histórico de Rendimentos</h2>
        <div className="space-y-3">
          <YieldItem month="Janeiro 2024" value="R$ 22.500" contracts={23} />
          <YieldItem month="Dezembro 2023" value="R$ 21.000" contracts={21} />
          <YieldItem month="Novembro 2023" value="R$ 19.500" contracts={20} />
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: typeof Shield;
  label: string;
  value: string;
  color: "blue" | "purple" | "green" | "red";
}) {
  const colors = {
    blue: "bg-blue-100 text-blue-600",
    purple: "bg-purple-100 text-purple-600",
    green: "bg-green-100 text-green-600",
    red: "bg-red-100 text-red-600",
  };

  return (
    <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-gray-800 p-6">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${colors[color]}`}>
        <Icon size={20} />
      </div>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
    </div>
  );
}

function GuaranteeItem({
  contract,
  tenant,
  collateral,
  monthlyYield,
  status,
}: {
  contract: string;
  tenant: string;
  collateral: string;
  monthlyYield: string;
  status: "healthy" | "warning" | "critical";
}) {
  const statusConfig = {
    healthy: { icon: CheckCircle, color: "text-green-600", bg: "bg-green-50" },
    warning: { icon: AlertTriangle, color: "text-yellow-600", bg: "bg-yellow-50" },
    critical: { icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50" },
  };

  const config = statusConfig[status];

  return (
    <div className={`flex items-center justify-between py-4 px-4 rounded-lg ${config.bg}`}>
      <div className="flex items-center gap-3">
        <config.icon className={config.color} size={20} />
        <div>
          <p className="font-medium text-gray-900 dark:text-white">{contract}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{tenant}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-semibold text-gray-900 dark:text-white">{collateral}</p>
        <p className="text-sm text-green-600 dark:text-green-400">+{monthlyYield}/mês</p>
      </div>
    </div>
  );
}

function YieldItem({
  month,
  value,
  contracts,
}: {
  month: string;
  value: string;
  contracts: number;
}) {
  return (
    <div className="flex items-center justify-between py-3 px-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
      <div>
        <p className="font-medium text-gray-900 dark:text-white">{month}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">{contracts} contratos</p>
      </div>
      <p className="font-semibold text-green-600 dark:text-green-400">{value}</p>
    </div>
  );
}
