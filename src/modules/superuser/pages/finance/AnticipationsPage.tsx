import { FastForward, Plus, Filter, Download, Clock, CheckCircle, XCircle } from "lucide-react";
import { EmptyState } from "../../../../components/ui/EmptyState";

// ============================================================
// ANTICIPATIONS PAGE - Gestão de Antecipações
// ============================================================

export function AnticipationsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <FastForward className="text-cyan-600" size={28} />
            Antecipações
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Gestão de antecipações de recebíveis
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
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          label="Solicitações Pendentes"
          value="0"
          color="yellow"
          icon={Clock}
        />
        <StatCard
          label="Aprovadas (Mês)"
          value="0"
          color="green"
          icon={CheckCircle}
        />
        <StatCard
          label="Rejeitadas (Mês)"
          value="0"
          color="red"
          icon={XCircle}
        />
        <StatCard
          label="Volume Antecipado"
          value="R$ 0,00"
          color="cyan"
        />
      </div>

      {/* Content */}
      <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-gray-800">
        <EmptyState
          icon={FastForward}
          title="Nenhuma antecipação registrada"
          description="As solicitações de antecipação de aluguéis dos proprietários aparecerão aqui."
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
  color: "yellow" | "green" | "red" | "cyan";
  icon?: typeof Clock;
}) {
  const colors = {
    yellow: "text-yellow-600 dark:text-yellow-400",
    green: "text-green-600 dark:text-green-400",
    red: "text-red-600 dark:text-red-400",
    cyan: "text-cyan-600 dark:text-cyan-400",
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
