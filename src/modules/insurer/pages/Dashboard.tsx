import { Shield, FileText, AlertTriangle, CheckCircle, Clock, DollarSign } from "lucide-react";
import { useBusinessRulesStore } from "../../../stores/useBusinessRulesStore";

export function InsurerDashboard() {
  const { splitRates } = useBusinessRulesStore();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Portal da Seguradora</h1>
        <p className="text-gray-500 dark:text-gray-400">Gestão de apólices e sinistros</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={FileText}
          label="Apólices Ativas"
          value="156"
          color="blue"
        />
        <StatCard
          icon={DollarSign}
          label="Prêmios Mensais"
          value="R$ 78.000"
          color="green"
        />
        <StatCard
          icon={AlertTriangle}
          label="Sinistros Abertos"
          value="3"
          color="yellow"
        />
        <StatCard
          icon={Shield}
          label="Taxa de Cobertura"
          value={`${splitRates.insurer}%`}
          color="purple"
        />
      </div>

      {/* Pending Approvals */}
      <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-gray-800 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Apólices Pendentes de Aprovação</h2>
        <div className="space-y-3">
          <PolicyItem
            contract="Contrato #2157"
            tenant="Ana Souza"
            coverage="R$ 30.000"
            premium="R$ 450"
            status="pending"
          />
          <PolicyItem
            contract="Contrato #2158"
            tenant="Carlos Lima"
            coverage="R$ 45.000"
            premium="R$ 675"
            status="pending"
          />
        </div>
      </div>

      {/* Active Claims */}
      <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-gray-800 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Sinistros em Análise</h2>
        <div className="space-y-3">
          <ClaimItem
            contract="Contrato #2098"
            type="Inadimplência"
            amount="R$ 5.000"
            date="15/01/2024"
            status="analyzing"
          />
          <ClaimItem
            contract="Contrato #2045"
            type="Danos ao Imóvel"
            amount="R$ 8.500"
            date="10/01/2024"
            status="approved"
          />
          <ClaimItem
            contract="Contrato #2012"
            type="Inadimplência"
            amount="R$ 2.500"
            date="05/01/2024"
            status="paid"
          />
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
  color: "blue" | "green" | "yellow" | "purple";
}) {
  const colors = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    yellow: "bg-yellow-100 text-yellow-600",
    purple: "bg-purple-100 text-purple-600",
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

function PolicyItem({
  contract,
  tenant,
  coverage,
  premium,
  status,
}: {
  contract: string;
  tenant: string;
  coverage: string;
  premium: string;
  status: "pending" | "approved" | "rejected";
}) {
  return (
    <div className="flex items-center justify-between py-4 px-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
      <div className="flex items-center gap-3">
        <Clock className="text-yellow-600 dark:text-yellow-400" size={20} />
        <div>
          <p className="font-medium text-gray-900 dark:text-white">{contract}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{tenant}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-semibold text-gray-900 dark:text-white">{coverage}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">Prêmio: {premium}/mês</p>
      </div>
      <div className="flex gap-2">
        <button className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700">
          Aprovar
        </button>
        <button className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-sm rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50">
          Rejeitar
        </button>
      </div>
    </div>
  );
}

function ClaimItem({
  contract,
  type,
  amount,
  date,
  status,
}: {
  contract: string;
  type: string;
  amount: string;
  date: string;
  status: "analyzing" | "approved" | "paid" | "rejected";
}) {
  const statusConfig = {
    analyzing: { icon: Clock, color: "text-yellow-600", bg: "bg-yellow-50", label: "Em Análise" },
    approved: { icon: CheckCircle, color: "text-blue-600", bg: "bg-blue-50", label: "Aprovado" },
    paid: { icon: CheckCircle, color: "text-green-600", bg: "bg-green-50", label: "Pago" },
    rejected: { icon: AlertTriangle, color: "text-red-600", bg: "bg-red-50", label: "Rejeitado" },
  };

  const config = statusConfig[status];

  return (
    <div className={`flex items-center justify-between py-4 px-4 rounded-lg ${config.bg}`}>
      <div className="flex items-center gap-3">
        <config.icon className={config.color} size={20} />
        <div>
          <p className="font-medium text-gray-900 dark:text-white">{contract}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{type} - {date}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-semibold text-gray-900 dark:text-white">{amount}</p>
        <span className={`text-xs ${config.color}`}>{config.label}</span>
      </div>
    </div>
  );
}
