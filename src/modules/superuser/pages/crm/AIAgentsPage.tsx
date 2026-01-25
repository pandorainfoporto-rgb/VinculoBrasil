import { Bot, Plus, Play, Pause, Settings, Zap } from "lucide-react";
import { EmptyState } from "../../../../components/ui/EmptyState";

// ============================================================
// AI AGENTS PAGE - Gestão de Agentes de IA
// ============================================================

export function AIAgentsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <Bot className="text-cyan-600" size={28} />
            IA Agents
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Configure agentes de IA para atendimento automatizado
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors">
          <Plus size={18} />
          Novo Agente
        </button>
      </div>

      {/* Agent Templates */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <AgentTemplateCard
          name="Atendimento Inicial"
          description="Responde perguntas frequentes e qualifica leads automaticamente"
          capabilities={["FAQ", "Qualificação", "Agendamento"]}
          status="available"
        />
        <AgentTemplateCard
          name="Assistente de Aluguel"
          description="Auxilia inquilinos com dúvidas sobre contratos e pagamentos"
          capabilities={["Contratos", "Pagamentos", "Suporte"]}
          status="available"
        />
        <AgentTemplateCard
          name="Consultor de Investimentos"
          description="Explica opções de investimento e tokenização para investidores"
          capabilities={["P2P", "Yields", "Tokenização"]}
          status="coming_soon"
        />
      </div>

      {/* Active Agents */}
      <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-gray-800">
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Agentes Ativos
          </h3>
        </div>
        <EmptyState
          icon={Bot}
          title="Nenhum agente configurado"
          description="Crie agentes de IA para automatizar atendimentos e qualificação de leads."
          action={{
            label: "Criar Agente",
            onClick: () => console.log("TODO: Abrir wizard"),
          }}
        />
      </div>
    </div>
  );
}

function AgentTemplateCard({
  name,
  description,
  capabilities,
  status,
}: {
  name: string;
  description: string;
  capabilities: string[];
  status: "available" | "coming_soon";
}) {
  return (
    <div className="bg-white dark:bg-[#1a1a1a] rounded-xl border border-gray-200 dark:border-gray-800 p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
          <Bot className="text-white" size={24} />
        </div>
        {status === "coming_soon" && (
          <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 rounded-full">
            Em breve
          </span>
        )}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
        {name}
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        {description}
      </p>
      <div className="flex flex-wrap gap-2 mb-4">
        {capabilities.map((cap) => (
          <span
            key={cap}
            className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full"
          >
            {cap}
          </span>
        ))}
      </div>
      <button
        disabled={status === "coming_soon"}
        className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
          status === "available"
            ? "bg-cyan-600 text-white hover:bg-cyan-700"
            : "bg-gray-100 dark:bg-gray-800 text-gray-400 cursor-not-allowed"
        }`}
      >
        <Zap size={18} />
        {status === "available" ? "Usar Template" : "Indisponível"}
      </button>
    </div>
  );
}
