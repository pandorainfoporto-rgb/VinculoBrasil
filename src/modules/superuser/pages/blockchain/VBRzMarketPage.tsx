import { Store, TrendingUp, ArrowUpRight, ArrowDownLeft, Repeat } from "lucide-react";
import { EmptyState } from "../../../../components/ui/EmptyState";

// ============================================================
// VBRz MARKET PAGE - Mercado P2P de VBRz
// ============================================================

export function VBRzMarketPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Store className="text-emerald-600" size={28} />
            Mercado VBRz
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Compra, venda e troca de tokens VBRz
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            <ArrowDownLeft size={18} />
            Comprar VBRz
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
            <ArrowUpRight size={18} />
            Vender VBRz
          </button>
        </div>
      </div>

      {/* Market Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MarketStatCard
          label="Preço Atual"
          value="R$ 0,00"
          change="+0%"
          trend="neutral"
        />
        <MarketStatCard
          label="Volume 24h"
          value="R$ 0,00"
          change="+0%"
          trend="neutral"
        />
        <MarketStatCard
          label="Ofertas de Compra"
          value="0"
          change=""
          trend="neutral"
        />
        <MarketStatCard
          label="Ofertas de Venda"
          value="0"
          change=""
          trend="neutral"
        />
      </div>

      {/* Order Book */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Buy Orders */}
        <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-gray-800">
          <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center gap-2">
            <ArrowDownLeft className="text-green-600" size={20} />
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Ordens de Compra
            </h3>
          </div>
          <div className="p-8 text-center">
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Nenhuma ordem de compra ativa
            </p>
          </div>
        </div>

        {/* Sell Orders */}
        <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-gray-800">
          <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex items-center gap-2">
            <ArrowUpRight className="text-red-600" size={20} />
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Ordens de Venda
            </h3>
          </div>
          <div className="p-8 text-center">
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              Nenhuma ordem de venda ativa
            </p>
          </div>
        </div>
      </div>

      {/* Trade History */}
      <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-gray-800">
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Histórico de Trades
          </h3>
        </div>
        <EmptyState
          icon={Repeat}
          title="Nenhum trade realizado"
          description="O histórico de compras e vendas de VBRz aparecerá aqui."
        />
      </div>
    </div>
  );
}

function MarketStatCard({
  label,
  value,
  change,
  trend,
}: {
  label: string;
  value: string;
  change: string;
  trend: "up" | "down" | "neutral";
}) {
  const trendColors = {
    up: "text-green-600",
    down: "text-red-600",
    neutral: "text-gray-500",
  };

  return (
    <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-gray-800 p-4">
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
      {change && (
        <p className={`text-sm ${trendColors[trend]}`}>{change}</p>
      )}
    </div>
  );
}
