/**
 * Sidebar - Barra lateral com componentes arrastáveis
 */

import { type DragEvent } from 'react';
import {
  PlayCircle,
  MessageSquare,
  HelpCircle,
  List,
  GitBranch,
  Bot,
  PhoneForwarded,
  Webhook,
  Clock,
  Tag,
  Variable,
  FileSearch,
  UserCheck,
  CircleSlash,
  ChevronDown,
  Sparkles,
  UserPlus,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useState } from 'react';
import type { FlowNodeType } from './types';

interface NodeTypeItem {
  type: FlowNodeType;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

interface NodeCategory {
  id: string;
  label: string;
  icon: React.ReactNode;
  nodes: NodeTypeItem[];
}

const nodeCategories: NodeCategory[] = [
  {
    id: 'trigger',
    label: 'Gatilhos',
    icon: <PlayCircle className="h-4 w-4" />,
    nodes: [
      {
        type: 'start',
        label: 'Início',
        description: 'Ponto inicial do fluxo',
        icon: <PlayCircle className="h-5 w-5" />,
        color: 'text-emerald-600',
        bgColor: 'bg-emerald-500',
      },
    ],
  },
  {
    id: 'message',
    label: 'Mensagens',
    icon: <MessageSquare className="h-4 w-4" />,
    nodes: [
      {
        type: 'message',
        label: 'Mensagem',
        description: 'Enviar texto ou mídia',
        icon: <MessageSquare className="h-5 w-5" />,
        color: 'text-blue-600',
        bgColor: 'bg-blue-500',
      },
    ],
  },
  {
    id: 'input',
    label: 'Coleta de Dados',
    icon: <HelpCircle className="h-4 w-4" />,
    nodes: [
      {
        type: 'input',
        label: 'Pergunta',
        description: 'Coletar resposta do usuário',
        icon: <HelpCircle className="h-5 w-5" />,
        color: 'text-purple-600',
        bgColor: 'bg-purple-500',
      },
      {
        type: 'menu',
        label: 'Menu',
        description: 'Opções de escolha',
        icon: <List className="h-5 w-5" />,
        color: 'text-amber-600',
        bgColor: 'bg-amber-500',
      },
    ],
  },
  {
    id: 'logic',
    label: 'Lógica & IA',
    icon: <GitBranch className="h-4 w-4" />,
    nodes: [
      {
        type: 'condition',
        label: 'Condição',
        description: 'Se/Então/Senão',
        icon: <GitBranch className="h-5 w-5" />,
        color: 'text-orange-600',
        bgColor: 'bg-orange-500',
      },
      {
        type: 'welcome_ai',
        label: 'IA Boas-Vindas',
        description: 'Áudio, texto, comprovantes',
        icon: <Sparkles className="h-5 w-5" />,
        color: 'text-purple-600',
        bgColor: 'bg-gradient-to-br from-purple-500 to-pink-500',
      },
      {
        type: 'ai_agent',
        label: 'Agente IA',
        description: 'Processar com GPT/Claude',
        icon: <Bot className="h-5 w-5" />,
        color: 'text-violet-600',
        bgColor: 'bg-violet-500',
      },
    ],
  },
  {
    id: 'action',
    label: 'Ações',
    icon: <PhoneForwarded className="h-4 w-4" />,
    nodes: [
      {
        type: 'handoff',
        label: 'Transferir',
        description: 'Passar para atendente',
        icon: <PhoneForwarded className="h-5 w-5" />,
        color: 'text-cyan-600',
        bgColor: 'bg-cyan-500',
      },
      {
        type: 'delay',
        label: 'Aguardar',
        description: 'Pausar execução',
        icon: <Clock className="h-5 w-5" />,
        color: 'text-gray-600',
        bgColor: 'bg-gray-500',
      },
      {
        type: 'tag',
        label: 'Tag',
        description: 'Adicionar/remover tag',
        icon: <Tag className="h-5 w-5" />,
        color: 'text-pink-600',
        bgColor: 'bg-pink-500',
      },
      {
        type: 'variable',
        label: 'Variável',
        description: 'Definir valor',
        icon: <Variable className="h-5 w-5" />,
        color: 'text-teal-600',
        bgColor: 'bg-teal-500',
      },
    ],
  },
  {
    id: 'crm',
    label: 'CRM & Contratos',
    icon: <FileSearch className="h-4 w-4" />,
    nodes: [
      {
        type: 'identify_contract',
        label: 'Identificar Contrato',
        description: 'Buscar por CPF/Tel/Email',
        icon: <FileSearch className="h-5 w-5" />,
        color: 'text-indigo-600',
        bgColor: 'bg-indigo-500',
      },
      {
        type: 'client_tag',
        label: 'Tag Cliente',
        description: 'Tipo automático do cadastro',
        icon: <UserCheck className="h-5 w-5" />,
        color: 'text-rose-600',
        bgColor: 'bg-rose-500',
      },
      {
        type: 'lead_capture',
        label: 'Capturar Lead',
        description: 'Nome, CPF, email, celular',
        icon: <UserPlus className="h-5 w-5" />,
        color: 'text-emerald-600',
        bgColor: 'bg-emerald-500',
      },
    ],
  },
  {
    id: 'integration',
    label: 'Integrações',
    icon: <Webhook className="h-4 w-4" />,
    nodes: [
      {
        type: 'webhook',
        label: 'Webhook',
        description: 'Chamar API externa',
        icon: <Webhook className="h-5 w-5" />,
        color: 'text-slate-600',
        bgColor: 'bg-slate-600',
      },
    ],
  },
  {
    id: 'end',
    label: 'Finalização',
    icon: <CircleSlash className="h-4 w-4" />,
    nodes: [
      {
        type: 'end',
        label: 'Fim',
        description: 'Encerrar fluxo',
        icon: <CircleSlash className="h-5 w-5" />,
        color: 'text-red-600',
        bgColor: 'bg-red-500',
      },
    ],
  },
];

interface DraggableNodeProps {
  node: NodeTypeItem;
}

function DraggableNode({ node }: DraggableNodeProps) {
  const onDragStart = (event: DragEvent<HTMLDivElement>) => {
    event.dataTransfer.setData('application/reactflow', node.type);
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div
      draggable
      onDragStart={onDragStart}
      className={cn(
        'flex items-center gap-3 p-3 rounded-lg border cursor-grab',
        'bg-white hover:bg-slate-50 hover:border-slate-300',
        'transition-all duration-200 active:cursor-grabbing',
        'shadow-sm hover:shadow-md'
      )}
    >
      <div
        className={cn(
          'p-2 rounded-lg text-white shadow-sm',
          node.bgColor
        )}
      >
        {node.icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm text-slate-800">{node.label}</p>
        <p className="text-xs text-slate-500 truncate">{node.description}</p>
      </div>
    </div>
  );
}

export function Sidebar() {
  const [openCategories, setOpenCategories] = useState<string[]>(
    nodeCategories.map((c) => c.id)
  );

  const toggleCategory = (categoryId: string) => {
    setOpenCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  return (
    <div className="w-72 border-r bg-slate-50 flex flex-col h-full">
      <div className="p-4 border-b bg-white">
        <h3 className="font-semibold text-slate-800">Componentes</h3>
        <p className="text-xs text-slate-500 mt-1">
          Arraste para o canvas para adicionar
        </p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3 space-y-2">
          {nodeCategories.map((category) => (
            <Collapsible
              key={category.id}
              open={openCategories.includes(category.id)}
              onOpenChange={() => toggleCategory(category.id)}
            >
              <CollapsibleTrigger className="flex items-center justify-between w-full p-2 rounded-lg hover:bg-slate-100 transition-colors">
                <div className="flex items-center gap-2">
                  <span className="text-slate-500">{category.icon}</span>
                  <span className="text-sm font-medium text-slate-700">
                    {category.label}
                  </span>
                </div>
                <ChevronDown
                  className={cn(
                    'h-4 w-4 text-slate-400 transition-transform duration-200',
                    openCategories.includes(category.id) && 'rotate-180'
                  )}
                />
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-2 mt-2 ml-2">
                {category.nodes.map((node) => (
                  <DraggableNode key={node.type} node={node} />
                ))}
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      </ScrollArea>

      <div className="p-3 border-t bg-white">
        <div className="text-xs text-slate-400 text-center">
          💡 Dica: Use Ctrl+Z para desfazer
        </div>
      </div>
    </div>
  );
}
