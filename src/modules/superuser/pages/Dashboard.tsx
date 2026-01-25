import { Building2, Home, FileText, DollarSign } from "lucide-react";
import { useBusinessRulesStore } from "../../../stores/useBusinessRulesStore";
import { useAgencyStore } from "../../../stores/useAgencyStore";
import { useContractStore } from "../../../stores/useContractStore";

// Formatador de moeda
function formatCurrency(value: number): string {
  if (value >= 1000000) {
    return `R$ ${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `R$ ${(value / 1000).toFixed(0)}K`;
  }
  return `R$ ${value.toLocaleString("pt-BR")}`;
}

export function SuperuserDashboard() {
  const { splitRates, setupFees, lastUpdated } = useBusinessRulesStore();
  const { agencies } = useAgencyStore();
  const { getActiveContracts, getTotalMonthlyRevenue } = useContractStore();

  // Dados reais das stores
  const totalAgencies = agencies.length;
  const activeAgencies = agencies.filter((a) => a.status === "active").length;
  const activeContracts = getActiveContracts().length;
  const totalMonthlyRevenue = getTotalMonthlyRevenue();
  const totalProperties = agencies.reduce((sum, a) => sum + a.propertiesCount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard Superuser</h1>
        <p className="text-gray-500 dark:text-gray-400">Modo Deus - Visão geral do sistema</p>
      </div>

      {/* Stats Grid - DADOS REAIS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Building2}
          label="Imobiliárias"
          value={`${totalAgencies}`}
          sublabel={`${activeAgencies} ativas`}
          positive
        />
        <StatCard
          icon={Home}
          label="Imóveis"
          value={`${totalProperties}`}
          sublabel="cadastrados"
          positive
        />
        <StatCard
          icon={FileText}
          label="Contratos Ativos"
          value={`${activeContracts}`}
          sublabel="em operação"
          positive
        />
        <StatCard
          icon={DollarSign}
          label="Receita Mensal"
          value={formatCurrency(totalMonthlyRevenue)}
          sublabel="em aluguéis"
          positive
        />
      </div>

      {/* Business Rules Card */}
      <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-gray-800 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Regras de Negócio Ativas
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Última atualização: {new Date(lastUpdated).toLocaleString("pt-BR")}
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Split Rates */}
          <div className="space-y-3">
            <h3 className="font-medium text-gray-700 dark:text-gray-300">Taxas de Split</h3>
            <div className="space-y-2">
              <RuleItem label="Plataforma" value={`${splitRates.platform}%`} />
              <RuleItem label="Seguradora" value={`${splitRates.insurer}%`} />
              <RuleItem label="Garantidor" value={`${splitRates.guarantor}%`} />
              <RuleItem label="Proprietário" value={`${splitRates.landlord}%`} />
            </div>
          </div>

          {/* Setup Fees */}
          <div className="space-y-3">
            <h3 className="font-medium text-gray-700 dark:text-gray-300">Taxas de Setup</h3>
            <div className="space-y-2">
              <RuleItem label="Residencial" value={`R$ ${setupFees.residential}`} />
              <RuleItem label="Comercial" value={`R$ ${setupFees.commercial}`} />
              <RuleItem label="Industrial" value={`R$ ${setupFees.industrial}`} />
              <RuleItem label="Rural" value={`R$ ${setupFees.rural}`} />
            </div>
          </div>
        </div>
      </div>

      {/* Activity Feed */}
      <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-gray-800 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Atividade Recente
        </h2>
        <div className="space-y-4">
          <ActivityItem
            message="Nova imobiliária cadastrada: Imóveis Premium"
            time="há 5 minutos"
          />
          <ActivityItem
            message="Contrato #2156 tokenizado com sucesso"
            time="há 15 minutos"
          />
          <ActivityItem
            message="Antecipação aprovada: R$ 45.000"
            time="há 1 hora"
          />
          <ActivityItem
            message="Investidor comprou 3 ativos no marketplace"
            time="há 2 horas"
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
  sublabel,
  positive,
}: {
  icon: typeof Building2;
  label: string;
  value: string;
  sublabel: string;
  positive: boolean;
}) {
  return (
    <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-gray-800 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
          <Icon className="text-blue-600 dark:text-blue-400" size={20} />
        </div>
        <span
          className={`text-xs font-medium px-2 py-1 rounded-full ${
            positive
              ? "bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400"
              : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
          }`}
        >
          {sublabel}
        </span>
      </div>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
    </div>
  );
}

function RuleItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-2 px-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
      <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
      <span className="text-sm font-semibold text-gray-900 dark:text-white">{value}</span>
    </div>
  );
}

function ActivityItem({ message, time }: { message: string; time: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-2 h-2 bg-blue-500 rounded-full mt-2" />
      <div className="flex-1">
        <p className="text-sm text-gray-700 dark:text-gray-300">{message}</p>
        <p className="text-xs text-gray-400 dark:text-gray-500">{time}</p>
      </div>
    </div>
  );
}
