import { Home, FileText, Users, Wallet, TrendingUp, Calendar } from "lucide-react";

export function AgencyDashboard() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard Imobiliária</h1>
        <p className="text-gray-500 dark:text-gray-400">Gestão completa da sua carteira</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={Home} label="Imóveis Ativos" value="48" color="blue" />
        <StatCard icon={FileText} label="Contratos" value="42" color="green" />
        <StatCard icon={Users} label="Proprietários" value="35" color="purple" />
        <StatCard icon={Wallet} label="Receita Mensal" value="R$ 125k" color="orange" />
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-gray-800 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Ações Rápidas</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <QuickAction icon={Home} label="Novo Imóvel" />
          <QuickAction icon={FileText} label="Novo Contrato" />
          <QuickAction icon={Users} label="Novo Proprietário" />
          <QuickAction icon={Calendar} label="Agendar Vistoria" />
        </div>
      </div>

      {/* Recent Contracts */}
      <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-gray-800 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Contratos Recentes</h2>
        <div className="space-y-3">
          <ContractItem
            address="Rua das Flores, 123 - Apto 401"
            tenant="João Silva"
            value="R$ 2.500"
            status="active"
          />
          <ContractItem
            address="Av. Brasil, 456 - Sala 12"
            tenant="Maria Santos"
            value="R$ 4.800"
            status="active"
          />
          <ContractItem
            address="Rua Central, 789"
            tenant="Pedro Oliveira"
            value="R$ 1.800"
            status="pending"
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
  icon: typeof Home;
  label: string;
  value: string;
  color: "blue" | "green" | "purple" | "orange";
}) {
  const colors = {
    blue: "bg-blue-100 text-blue-600",
    green: "bg-green-100 text-green-600",
    purple: "bg-purple-100 text-purple-600",
    orange: "bg-orange-100 text-orange-600",
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

function QuickAction({ icon: Icon, label }: { icon: typeof Home; label: string }) {
  return (
    <button className="flex flex-col items-center gap-2 p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
        <Icon className="text-blue-600" size={20} />
      </div>
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
    </button>
  );
}

function ContractItem({
  address,
  tenant,
  value,
  status,
}: {
  address: string;
  tenant: string;
  value: string;
  status: "active" | "pending";
}) {
  return (
    <div className="flex items-center justify-between py-3 px-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
      <div>
        <p className="font-medium text-gray-900 dark:text-white">{address}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">{tenant}</p>
      </div>
      <div className="text-right">
        <p className="font-semibold text-gray-900 dark:text-white">{value}</p>
        <span
          className={`text-xs px-2 py-1 rounded-full ${
            status === "active"
              ? "bg-green-100 text-green-700"
              : "bg-yellow-100 text-yellow-700"
          }`}
        >
          {status === "active" ? "Ativo" : "Pendente"}
        </span>
      </div>
    </div>
  );
}
