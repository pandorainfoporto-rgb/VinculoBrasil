import { Wallet, Plus, Filter, Download, ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { EmptyState } from "../../../../components/ui/EmptyState";

// ============================================================
// CASH FLOW PAGE - Gestão de Caixa
// ============================================================

export function CashFlowPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Wallet className="text-green-600" size={28} />
            Caixa
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Gestão de fluxo de caixa e transações
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            <Filter size={18} />
            Filtrar
          </button>
          <button className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            <Download size={18} />
            Exportar
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            <Plus size={18} />
            Nova Transação
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Saldo Atual" value="R$ 0,00" color="blue" />
        <StatCard label="Entradas (Mês)" value="R$ 0,00" color="green" icon={ArrowUpRight} />
        <StatCard label="Saídas (Mês)" value="R$ 0,00" color="red" icon={ArrowDownLeft} />
        <StatCard label="Saldo Projetado" value="R$ 0,00" color="purple" />
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-gray-800">
        <EmptyState
          icon={Wallet}
          title="Nenhuma transação registrada"
          description="As transações de caixa aparecerão aqui quando forem registradas pelo sistema ou manualmente."
          action={{
            label: "Registrar Transação",
            onClick: () => console.log("TODO: Abrir modal"),
          }}
        />
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
  icon: Icon,
}: {
  label: string;
  value: string;
  color: "blue" | "green" | "red" | "purple";
  icon?: typeof ArrowUpRight;
}) {
  const colors = {
    blue: "text-blue-600 dark:text-blue-400",
    green: "text-green-600 dark:text-green-400",
    red: "text-red-600 dark:text-red-400",
    purple: "text-purple-600 dark:text-purple-400",
  };

  return (
    <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-gray-800 p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
        {Icon && <Icon size={18} className={colors[color]} />}
      </div>
      <p className={`text-2xl font-bold mt-1 ${colors[color]}`}>{value}</p>
    </div>
  );
}
