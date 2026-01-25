import { TrendingUp, Wallet, ShoppingCart, BarChart3, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useBusinessRulesStore } from "../../../stores/useBusinessRulesStore";

export function InvestorDashboard() {
  const { investorRules } = useBusinessRulesStore();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Portal do Investidor</h1>
        <p className="text-gray-500 dark:text-gray-400">Mercado P2P de Recebíveis Imobiliários</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Wallet}
          label="Portfólio Total"
          value="R$ 125.000"
          change="+12.5%"
          positive
        />
        <StatCard
          icon={TrendingUp}
          label="Rendimento Mensal"
          value="R$ 1.875"
          change={`${investorRules.annualYield}% a.a.`}
          positive
        />
        <StatCard
          icon={ShoppingCart}
          label="Ativos Comprados"
          value="8"
          change="+2 este mês"
          positive
        />
        <StatCard
          icon={BarChart3}
          label="Yield Médio"
          value="18% a.a."
          change="Acima do CDI"
          positive
        />
      </div>

      {/* Marketplace Preview */}
      <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-gray-800 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Oportunidades no Marketplace</h2>
          <button className="text-blue-600 dark:text-blue-400 font-medium text-sm hover:underline">
            Ver Todas
          </button>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          <AssetCard
            title="Residencial Premium"
            location="São Paulo, SP"
            yield={18}
            price={15000}
            months={12}
          />
          <AssetCard
            title="Sala Comercial"
            location="Rio de Janeiro, RJ"
            yield={16}
            price={25000}
            months={24}
          />
          <AssetCard
            title="Apartamento Centro"
            location="Belo Horizonte, MG"
            yield={17}
            price={12000}
            months={12}
          />
        </div>
      </div>

      {/* Portfolio */}
      <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-gray-800 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Meu Portfólio</h2>
        <div className="space-y-3">
          <PortfolioItem
            title="Contrato #1234"
            invested="R$ 20.000"
            returns="R$ 1.200"
            status="active"
          />
          <PortfolioItem
            title="Contrato #1198"
            invested="R$ 15.000"
            returns="R$ 750"
            status="active"
          />
          <PortfolioItem
            title="Contrato #1156"
            invested="R$ 25.000"
            returns="R$ 1.500"
            status="completed"
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
  change,
  positive,
}: {
  icon: typeof Wallet;
  label: string;
  value: string;
  change: string;
  positive: boolean;
}) {
  return (
    <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-gray-800 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
          <Icon className="text-blue-600" size={20} />
        </div>
        <span className={`flex items-center gap-1 text-sm font-medium ${positive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
          {positive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
          {change}
        </span>
      </div>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
    </div>
  );
}

function AssetCard({
  title,
  location,
  yield: yieldValue,
  price,
  months,
}: {
  title: string;
  location: string;
  yield: number;
  price: number;
  months: number;
}) {
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:border-blue-300 dark:hover:border-blue-600 transition-colors cursor-pointer">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
          {yieldValue}% a.a.
        </span>
        <span className="text-xs text-gray-500 dark:text-gray-400">{months} meses</span>
      </div>
      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{title}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{location}</p>
      <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
        R$ {price.toLocaleString("pt-BR")}
      </p>
    </div>
  );
}

function PortfolioItem({
  title,
  invested,
  returns,
  status,
}: {
  title: string;
  invested: string;
  returns: string;
  status: "active" | "completed";
}) {
  return (
    <div className="flex items-center justify-between py-3 px-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
      <div>
        <p className="font-medium text-gray-900 dark:text-white">{title}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">Investido: {invested}</p>
      </div>
      <div className="text-right">
        <p className="font-semibold text-green-600 dark:text-green-400">+{returns}</p>
        <span className={`text-xs px-2 py-1 rounded-full ${
          status === "active" ? "bg-blue-100 text-blue-700" : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
        }`}>
          {status === "active" ? "Ativo" : "Finalizado"}
        </span>
      </div>
    </div>
  );
}
