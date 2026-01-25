import { Home, FileText, TrendingUp, Wallet, Calendar } from "lucide-react";
import { useBusinessRulesStore } from "../../../stores/useBusinessRulesStore";

export function LandlordDashboard() {
  const { anticipationRules } = useBusinessRulesStore();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Meus Imóveis</h1>
        <p className="text-gray-500 dark:text-gray-400">Acompanhe seus contratos e antecipações</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={Home} label="Imóveis" value="3" />
        <StatCard icon={FileText} label="Contratos Ativos" value="3" />
        <StatCard icon={Wallet} label="Receita Mensal" value="R$ 8.500" />
        <StatCard icon={TrendingUp} label="Disponível p/ Antecipação" value="R$ 85.000" />
      </div>

      {/* Anticipation CTA */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold mb-2">Antecipe seus aluguéis</h2>
            <p className="text-blue-100">
              Receba até {anticipationRules.maxMonths} meses de aluguel antecipado com desconto de apenas {anticipationRules.discountRate}%
            </p>
          </div>
          <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
            Simular Antecipação
          </button>
        </div>
      </div>

      {/* Properties List */}
      <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-gray-800 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Meus Imóveis</h2>
        <div className="space-y-4">
          <PropertyCard
            address="Rua das Flores, 123 - Apto 401"
            tenant="João Silva"
            rent="R$ 2.500"
            nextPayment="05/02/2024"
          />
          <PropertyCard
            address="Av. Brasil, 456 - Sala 12"
            tenant="Empresa XYZ Ltda"
            rent="R$ 4.800"
            nextPayment="10/02/2024"
          />
          <PropertyCard
            address="Rua Central, 789"
            tenant="Maria Oliveira"
            rent="R$ 1.200"
            nextPayment="15/02/2024"
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
}: {
  icon: typeof Home;
  label: string;
  value: string;
}) {
  return (
    <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-gray-800 p-6">
      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
        <Icon className="text-blue-600" size={20} />
      </div>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
    </div>
  );
}

function PropertyCard({
  address,
  tenant,
  rent,
  nextPayment,
}: {
  address: string;
  tenant: string;
  rent: string;
  nextPayment: string;
}) {
  return (
    <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
          <Home className="text-gray-500 dark:text-gray-400" size={24} />
        </div>
        <div>
          <p className="font-medium text-gray-900 dark:text-white">{address}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Inquilino: {tenant}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-semibold text-gray-900 dark:text-white">{rent}/mês</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">Próx: {nextPayment}</p>
      </div>
    </div>
  );
}
