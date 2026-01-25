import { Radio, Plus, Settings, MessageSquare, Mail, Phone } from "lucide-react";
import { EmptyState } from "../../../../components/ui/EmptyState";

// ============================================================
// CHANNELS PAGE - Gestão de Canais de Comunicação
// ============================================================

export function ChannelsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Radio className="text-purple-600" size={28} />
            Canais
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Configure canais de comunicação omnichannel
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
          <Plus size={18} />
          Novo Canal
        </button>
      </div>

      {/* Available Channels */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ChannelCard
          name="WhatsApp Business"
          icon={MessageSquare}
          status="inactive"
          description="Conecte sua conta WhatsApp Business API"
          color="green"
        />
        <ChannelCard
          name="Email"
          icon={Mail}
          status="inactive"
          description="Configure SMTP para envio de emails"
          color="blue"
        />
        <ChannelCard
          name="SMS"
          icon={Phone}
          status="inactive"
          description="Integre com provedor de SMS"
          color="orange"
        />
      </div>

      {/* Active Channels */}
      <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-gray-800">
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Canais Ativos
          </h3>
        </div>
        <EmptyState
          icon={Radio}
          title="Nenhum canal configurado"
          description="Configure um canal de comunicação para começar a receber mensagens."
          action={{
            label: "Configurar Canal",
            onClick: () => console.log("TODO: Abrir configuração"),
          }}
        />
      </div>
    </div>
  );
}

function ChannelCard({
  name,
  icon: Icon,
  status,
  description,
  color,
}: {
  name: string;
  icon: typeof MessageSquare;
  status: "active" | "inactive" | "pending";
  description: string;
  color: "green" | "blue" | "orange";
}) {
  const colors = {
    green: "from-green-500 to-emerald-600",
    blue: "from-blue-500 to-indigo-600",
    orange: "from-orange-500 to-amber-600",
  };

  const statusColors = {
    active: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    inactive: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400",
    pending: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  };

  return (
    <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-gray-800 p-6">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors[color]} flex items-center justify-center`}>
          <Icon className="text-white" size={24} />
        </div>
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColors[status]}`}>
          {status === "active" ? "Ativo" : status === "pending" ? "Pendente" : "Inativo"}
        </span>
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
        {name}
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        {description}
      </p>
      <button className="flex items-center gap-2 text-sm text-purple-600 dark:text-purple-400 hover:underline">
        <Settings size={16} />
        Configurar
      </button>
    </div>
  );
}
