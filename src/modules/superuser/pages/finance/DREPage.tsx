import { PieChart, Download, Calendar, TrendingUp, TrendingDown, DollarSign } from "lucide-react";

// ============================================================
// DRE PAGE - Demonstração do Resultado do Exercício
// ============================================================

export function DREPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <PieChart className="text-purple-600" size={28} />
            Plano de Contas (DRE)
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Demonstração do Resultado do Exercício
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select className="px-4 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white">
            <option>Janeiro 2025</option>
            <option>Fevereiro 2025</option>
            <option>Março 2025</option>
          </select>
          <button className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            <Download size={18} />
            Exportar PDF
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <DRECard
          title="Receita Bruta"
          value="R$ 0,00"
          change="+0%"
          trend="up"
          icon={TrendingUp}
          color="green"
        />
        <DRECard
          title="Despesas Totais"
          value="R$ 0,00"
          change="+0%"
          trend="down"
          icon={TrendingDown}
          color="red"
        />
        <DRECard
          title="Lucro Líquido"
          value="R$ 0,00"
          change="+0%"
          trend="up"
          icon={DollarSign}
          color="blue"
        />
      </div>

      {/* DRE Table */}
      <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Demonstrativo Detalhado
          </h3>
        </div>

        {/* Receitas */}
        <div className="border-b border-gray-200 dark:border-gray-800">
          <div className="p-4 bg-green-50 dark:bg-green-900/20">
            <h4 className="font-semibold text-green-700 dark:text-green-400">RECEITAS</h4>
          </div>
          <DRERow label="Aluguéis Recebidos" value="R$ 0,00" level={1} />
          <DRERow label="Taxas de Setup" value="R$ 0,00" level={1} />
          <DRERow label="Comissões de Imobiliárias" value="R$ 0,00" level={1} />
          <DRERow label="Taxa da Plataforma" value="R$ 0,00" level={1} />
          <DRERow label="Taxas de Antecipação" value="R$ 0,00" level={1} />
          <DRERow label="Outras Receitas" value="R$ 0,00" level={1} />
          <DRERow label="Total de Receitas" value="R$ 0,00" level={0} bold />
        </div>

        {/* Despesas */}
        <div className="border-b border-gray-200 dark:border-gray-800">
          <div className="p-4 bg-red-50 dark:bg-red-900/20">
            <h4 className="font-semibold text-red-700 dark:text-red-400">DESPESAS</h4>
          </div>
          <DRERow label="Custos Operacionais" value="R$ 0,00" level={1} />
          <DRERow label="Despesas Administrativas" value="R$ 0,00" level={1} />
          <DRERow label="Marketing e Vendas" value="R$ 0,00" level={1} />
          <DRERow label="Tecnologia e Infraestrutura" value="R$ 0,00" level={1} />
          <DRERow label="Pessoal e Encargos" value="R$ 0,00" level={1} />
          <DRERow label="Impostos e Taxas" value="R$ 0,00" level={1} />
          <DRERow label="Despesas Financeiras" value="R$ 0,00" level={1} />
          <DRERow label="Outras Despesas" value="R$ 0,00" level={1} />
          <DRERow label="Total de Despesas" value="R$ 0,00" level={0} bold />
        </div>

        {/* Resultado */}
        <div className="p-4 bg-blue-50 dark:bg-blue-900/20">
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-blue-900 dark:text-blue-300">
              RESULTADO LÍQUIDO
            </span>
            <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
              R$ 0,00
            </span>
          </div>
          <p className="text-sm text-blue-600/70 dark:text-blue-400/70 mt-1">
            Margem: 0%
          </p>
        </div>
      </div>
    </div>
  );
}

function DRECard({
  title,
  value,
  change,
  trend,
  icon: Icon,
  color,
}: {
  title: string;
  value: string;
  change: string;
  trend: "up" | "down";
  icon: typeof TrendingUp;
  color: "green" | "red" | "blue";
}) {
  const colors = {
    green: "from-green-500 to-emerald-600",
    red: "from-red-500 to-rose-600",
    blue: "from-blue-500 to-indigo-600",
  };

  return (
    <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-gray-800 p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
          <p className={`text-sm mt-1 ${trend === "up" ? "text-green-600" : "text-red-600"}`}>
            {change} vs. mês anterior
          </p>
        </div>
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors[color]} flex items-center justify-center`}>
          <Icon className="text-white" size={24} />
        </div>
      </div>
    </div>
  );
}

function DRERow({
  label,
  value,
  level,
  bold = false,
}: {
  label: string;
  value: string;
  level: number;
  bold?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800 last:border-b-0 ${
        level === 0 ? "bg-gray-50 dark:bg-gray-800/50" : ""
      }`}
      style={{ paddingLeft: `${1 + level * 1.5}rem` }}
    >
      <span
        className={`text-gray-700 dark:text-gray-300 ${
          bold ? "font-semibold" : ""
        }`}
      >
        {label}
      </span>
      <span
        className={`text-gray-900 dark:text-white ${
          bold ? "font-semibold" : ""
        }`}
      >
        {value}
      </span>
    </div>
  );
}
