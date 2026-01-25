import { Blocks, RefreshCw, ExternalLink, Activity, Wallet, FileText, Coins } from "lucide-react";

// ============================================================
// BLOCKCHAIN PAGE - Monitoramento Blockchain
// ============================================================

export function BlockchainPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Blocks className="text-purple-600" size={28} />
            Blockchain
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Monitoramento de contratos e transações on-chain
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Polygon Mainnet
          </div>
          <button className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            <RefreshCw size={18} />
            Atualizar
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          label="Contratos NFT"
          value="0"
          icon={FileText}
          color="purple"
        />
        <StatCard
          label="VBRz em Circulação"
          value="0"
          icon={Coins}
          color="yellow"
        />
        <StatCard
          label="Transações (24h)"
          value="0"
          icon={Activity}
          color="blue"
        />
        <StatCard
          label="Wallets Conectadas"
          value="0"
          icon={Wallet}
          color="green"
        />
      </div>

      {/* Smart Contracts */}
      <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-gray-800">
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Smart Contracts Deployados
          </h3>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-800">
          <ContractRow
            name="VinculoContract"
            address="0x..."
            network="Polygon"
            status="active"
          />
          <ContractRow
            name="VBRzToken"
            address="0x..."
            network="Polygon"
            status="active"
          />
          <ContractRow
            name="PropertyCollateral"
            address="0x..."
            network="Polygon"
            status="active"
          />
          <ContractRow
            name="VinculoP2P"
            address="0x..."
            network="Polygon"
            status="pending"
          />
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-gray-800">
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Transações Recentes
          </h3>
        </div>
        <div className="p-12 text-center">
          <Activity className="mx-auto text-gray-300 dark:text-gray-600 mb-4" size={48} />
          <p className="text-gray-500 dark:text-gray-400">
            Nenhuma transação registrada ainda
          </p>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: string;
  icon: typeof Blocks;
  color: "purple" | "yellow" | "blue" | "green";
}) {
  const colors = {
    purple: "text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30",
    yellow: "text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30",
    blue: "text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30",
    green: "text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30",
  };

  const textColors = {
    purple: "text-purple-600 dark:text-purple-400",
    yellow: "text-yellow-600 dark:text-yellow-400",
    blue: "text-blue-600 dark:text-blue-400",
    green: "text-green-600 dark:text-green-400",
  };

  return (
    <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-gray-800 p-4">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colors[color]}`}>
          <Icon size={20} />
        </div>
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
          <p className={`text-xl font-bold ${textColors[color]}`}>{value}</p>
        </div>
      </div>
    </div>
  );
}

function ContractRow({
  name,
  address,
  network,
  status,
}: {
  name: string;
  address: string;
  network: string;
  status: "active" | "pending" | "deprecated";
}) {
  const statusColors = {
    active: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    deprecated: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  };

  return (
    <div className="flex items-center justify-between p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
          <FileText className="text-purple-600 dark:text-purple-400" size={20} />
        </div>
        <div>
          <p className="font-medium text-gray-900 dark:text-white">{name}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400 font-mono">{address}</p>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-500 dark:text-gray-400">{network}</span>
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[status]}`}>
          {status === "active" ? "Ativo" : status === "pending" ? "Pendente" : "Depreciado"}
        </span>
        <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
          <ExternalLink size={16} />
        </button>
      </div>
    </div>
  );
}
