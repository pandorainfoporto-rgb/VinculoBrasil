import { Users, Plus, Filter, Search, Kanban, List } from "lucide-react";
import { useState } from "react";
import { EmptyState } from "../../../../components/ui/EmptyState";

// ============================================================
// CRM PAGE - Gestão de Leads e Oportunidades
// ============================================================

export function CRMPage() {
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Users className="text-indigo-600" size={28} />
            CRM
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Gestão de leads e pipeline de vendas
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* View Toggle */}
          <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode("kanban")}
              className={`p-2 rounded-md transition-colors ${
                viewMode === "kanban"
                  ? "bg-white dark:bg-gray-700 shadow"
                  : "hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              <Kanban size={18} className="text-gray-600 dark:text-gray-400" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-md transition-colors ${
                viewMode === "list"
                  ? "bg-white dark:bg-gray-700 shadow"
                  : "hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              <List size={18} className="text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Buscar lead..."
              className="pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <button className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            <Filter size={18} />
            Filtrar
          </button>

          <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
            <Plus size={18} />
            Novo Lead
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <StatCard label="Total de Leads" value="0" color="gray" />
        <StatCard label="Novos (Semana)" value="0" color="blue" />
        <StatCard label="Qualificados" value="0" color="yellow" />
        <StatCard label="Em Negociação" value="0" color="purple" />
        <StatCard label="Convertidos" value="0" color="green" />
      </div>

      {/* Kanban Board */}
      {viewMode === "kanban" && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <KanbanColumn title="Novos" count={0} color="blue" />
          <KanbanColumn title="Contatados" count={0} color="indigo" />
          <KanbanColumn title="Qualificados" count={0} color="yellow" />
          <KanbanColumn title="Proposta" count={0} color="purple" />
          <KanbanColumn title="Fechados" count={0} color="green" />
        </div>
      )}

      {/* List View */}
      {viewMode === "list" && (
        <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-gray-800">
          <EmptyState
            icon={Users}
            title="Nenhum lead cadastrado"
            description="Os leads capturados pelos canais de comunicação aparecerão aqui."
            action={{
              label: "Criar Lead Manual",
              onClick: () => console.log("TODO: Abrir modal"),
            }}
          />
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: "gray" | "blue" | "yellow" | "purple" | "green";
}) {
  const colors = {
    gray: "text-gray-600 dark:text-gray-400",
    blue: "text-blue-600 dark:text-blue-400",
    yellow: "text-yellow-600 dark:text-yellow-400",
    purple: "text-purple-600 dark:text-purple-400",
    green: "text-green-600 dark:text-green-400",
  };

  return (
    <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-gray-800 p-4">
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      <p className={`text-2xl font-bold mt-1 ${colors[color]}`}>{value}</p>
    </div>
  );
}

function KanbanColumn({
  title,
  count,
  color,
}: {
  title: string;
  count: number;
  color: "blue" | "indigo" | "yellow" | "purple" | "green";
}) {
  const borderColors = {
    blue: "border-t-blue-500",
    indigo: "border-t-indigo-500",
    yellow: "border-t-yellow-500",
    purple: "border-t-purple-500",
    green: "border-t-green-500",
  };

  return (
    <div className={`bg-gray-50 dark:bg-gray-800/50 rounded-xl border-t-4 ${borderColors[color]} min-h-[400px]`}>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
          <span className="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded-full">
            {count}
          </span>
        </div>
      </div>
      <div className="p-4">
        <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-8">
          Arraste leads para cá
        </p>
      </div>
    </div>
  );
}
