import { Coins, TrendingUp, Users, ArrowUpRight, ArrowDownLeft, RefreshCw } from "lucide-react";

// ============================================================
// VBRz PAGE - Token VBRz Dashboard
// ============================================================

export function VBRzPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Coins className="text-yellow-600" size={28} />
            VBRz Token
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Gestão do token utilitário da plataforma
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
          <RefreshCw size={18} />
          Atualizar
        </button>
      </div>

      {/* Token Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <TokenStatCard
          label="Supply Total"
          value="1.000.000.000"
          suffix="VBRz"
          color="yellow"
        />
        <TokenStatCard
          label="Em Circulação"
          value="0"
          suffix="VBRz"
          color="blue"
        />
        <TokenStatCard
          label="Queimados (Burn)"
          value="0"
          suffix="VBRz"
          color="red"
        />
        <TokenStatCard
          label="Holders"
          value="0"
          suffix="wallets"
          color="green"
        />
      </div>

      {/* Token Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Distribuição do Token
          </h3>
          <div className="space-y-4">
            <DistributionRow label="Tesouraria" percentage={40} color="purple" />
            <DistributionRow label="Equipe (Vesting)" percentage={15} color="blue" />
            <DistributionRow label="Investidores" percentage={20} color="green" />
            <DistributionRow label="Recompensas/Cashback" percentage={15} color="yellow" />
            <DistributionRow label="Reserva" percentage={10} color="gray" />
          </div>
        </div>

        <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-gray-800 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Utilidade do Token
          </h3>
          <div className="space-y-3">
            <UtilityItem
              title="Cashback de Pagamentos"
              description="Inquilinos recebem VBRz a cada pagamento em dia"
            />
            <UtilityItem
              title="Desconto em Taxas"
              description="Use VBRz para pagar taxas da plataforma com desconto"
            />
            <UtilityItem
              title="Staking de Garantia"
              description="Garantidores podem fazer stake de VBRz como colateral"
            />
            <UtilityItem
              title="Governança"
              description="Vote em propostas de melhoria da plataforma"
            />
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-gray-800">
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Atividade Recente
          </h3>
        </div>
        <div className="p-12 text-center">
          <Coins className="mx-auto text-gray-300 dark:text-gray-600 mb-4" size={48} />
          <p className="text-gray-500 dark:text-gray-400">
            Nenhuma transação de VBRz registrada
          </p>
        </div>
      </div>
    </div>
  );
}

function TokenStatCard({
  label,
  value,
  suffix,
  color,
}: {
  label: string;
  value: string;
  suffix: string;
  color: "yellow" | "blue" | "red" | "green";
}) {
  const colors = {
    yellow: "text-yellow-600 dark:text-yellow-400",
    blue: "text-blue-600 dark:text-blue-400",
    red: "text-red-600 dark:text-red-400",
    green: "text-green-600 dark:text-green-400",
  };

  return (
    <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-gray-800 p-4">
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${colors[color]}`}>{value}</p>
      <p className="text-xs text-gray-400 dark:text-gray-500">{suffix}</p>
    </div>
  );
}

function DistributionRow({
  label,
  percentage,
  color,
}: {
  label: string;
  percentage: number;
  color: "purple" | "blue" | "green" | "yellow" | "gray";
}) {
  const bgColors = {
    purple: "bg-purple-500",
    blue: "bg-blue-500",
    green: "bg-green-500",
    yellow: "bg-yellow-500",
    gray: "bg-gray-500",
  };

  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1">
        <span className="text-gray-700 dark:text-gray-300">{label}</span>
        <span className="text-gray-900 dark:text-white font-medium">{percentage}%</span>
      </div>
      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className={`h-full ${bgColors[color]} rounded-full`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function UtilityItem({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
      <div className="w-8 h-8 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center flex-shrink-0">
        <Coins className="text-yellow-600 dark:text-yellow-400" size={16} />
      </div>
      <div>
        <p className="font-medium text-gray-900 dark:text-white">{title}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
      </div>
    </div>
  );
}
