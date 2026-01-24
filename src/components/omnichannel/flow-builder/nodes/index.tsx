/**
 * Custom Nodes - Nós customizados para o Flow Builder
 */

import { memo } from 'react';
import { type NodeProps } from '@xyflow/react';
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
  Check,
  X,
  Sparkles,
  Mic,
  Image,
  FileText,
  Receipt,
  UserPlus,
  Database,
  ArrowRightLeft,
} from 'lucide-react';
import { BaseNode, type BaseNodeData } from './base-node';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// StartNode - Gatilho inicial
interface StartNodeData extends BaseNodeData {
  triggerType?: 'new_conversation' | 'keyword' | 'schedule' | 'webhook';
  keywords?: string[];
}

function StartNodeComponent(props: NodeProps) {
  const data = props.data as StartNodeData;
  const triggerLabels: Record<string, string> = {
    new_conversation: 'Nova conversa',
    keyword: 'Palavra-chave',
    schedule: 'Agendamento',
    webhook: 'Webhook',
  };

  return (
    <BaseNode
      {...props}
      data={data}
      icon={<PlayCircle className="h-5 w-5" />}
      iconBgColor="bg-emerald-500"
      showTargetHandle={false}
    >
      <div className="text-xs text-slate-600 bg-emerald-50 rounded-md px-2 py-1">
        {triggerLabels[data.triggerType || 'new_conversation']}
      </div>
      {data.triggerType === 'keyword' && data.keywords && data.keywords.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1">
          {data.keywords.slice(0, 3).map((kw) => (
            <Badge key={kw} variant="outline" className="text-[10px]">
              {kw}
            </Badge>
          ))}
          {data.keywords.length > 3 && (
            <Badge variant="outline" className="text-[10px]">
              +{data.keywords.length - 3}
            </Badge>
          )}
        </div>
      )}
    </BaseNode>
  );
}
export const StartNode = memo(StartNodeComponent);

// MessageNode - Enviar mensagem
interface MessageNodeData extends BaseNodeData {
  message?: string;
  mediaType?: 'image' | 'video' | 'audio' | 'document';
}

function MessageNodeComponent(props: NodeProps) {
  const data = props.data as MessageNodeData;

  return (
    <BaseNode
      {...props}
      data={data}
      icon={<MessageSquare className="h-5 w-5" />}
      iconBgColor="bg-blue-500"
    >
      {data.message && (
        <div className="text-xs text-slate-600 bg-blue-50 rounded-md px-2 py-1.5 line-clamp-3">
          {data.message}
        </div>
      )}
      {data.mediaType && (
        <Badge variant="outline" className="text-[10px]">
          📎 {data.mediaType}
        </Badge>
      )}
    </BaseNode>
  );
}
export const MessageNode = memo(MessageNodeComponent);

// InputNode - Coletar entrada
interface InputNodeData extends BaseNodeData {
  question?: string;
  variableName?: string;
  validationType?: string;
}

function InputNodeComponent(props: NodeProps) {
  const data = props.data as InputNodeData;

  return (
    <BaseNode
      {...props}
      data={data}
      icon={<HelpCircle className="h-5 w-5" />}
      iconBgColor="bg-purple-500"
    >
      {data.question && (
        <div className="text-xs text-slate-600 bg-purple-50 rounded-md px-2 py-1.5 line-clamp-2">
          {data.question}
        </div>
      )}
      {data.variableName && (
        <div className="flex items-center gap-1 mt-1">
          <Variable className="h-3 w-3 text-purple-500" />
          <code className="text-[10px] text-purple-700 bg-purple-100 px-1 rounded">
            {'{' + data.variableName + '}'}
          </code>
        </div>
      )}
    </BaseNode>
  );
}
export const InputNode = memo(InputNodeComponent);

// MenuNode - Menu de opções
interface MenuNodeData extends BaseNodeData {
  menuTitle?: string;
  options?: { id: string; label: string; value: string }[];
}

function MenuNodeComponent(props: NodeProps) {
  const data = props.data as MenuNodeData;
  const options = data.options || [];

  return (
    <BaseNode
      {...props}
      data={data}
      icon={<List className="h-5 w-5" />}
      iconBgColor="bg-amber-500"
      sourceHandles={options.map((opt) => ({
        id: opt.id,
        label: opt.label.slice(0, 10),
        position: 'right' as const,
      }))}
    >
      {data.menuTitle && (
        <div className="text-xs text-slate-600 font-medium mb-1">
          {data.menuTitle}
        </div>
      )}
      <div className="space-y-1">
        {options.slice(0, 4).map((opt, idx) => (
          <div
            key={opt.id}
            className="flex items-center gap-2 text-xs bg-amber-50 rounded px-2 py-1"
          >
            <span className="w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center text-[10px]">
              {idx + 1}
            </span>
            <span className="text-slate-700 truncate">{opt.label}</span>
          </div>
        ))}
        {options.length > 4 && (
          <div className="text-[10px] text-slate-400 text-center">
            +{options.length - 4} opções
          </div>
        )}
      </div>
    </BaseNode>
  );
}
export const MenuNode = memo(MenuNodeComponent);

// ConditionNode - Desvio condicional
interface ConditionNodeData extends BaseNodeData {
  conditions?: { id: string; variable: string; operator: string; value: string }[];
}

function ConditionNodeComponent(props: NodeProps) {
  const data = props.data as ConditionNodeData;
  const conditions = data.conditions || [];

  return (
    <BaseNode
      {...props}
      data={data}
      icon={<GitBranch className="h-5 w-5" />}
      iconBgColor="bg-orange-500"
      sourceHandles={[
        { id: 'true', label: 'Sim', position: 'right' },
        { id: 'false', label: 'Não', position: 'right' },
      ]}
    >
      {conditions.length > 0 ? (
        <div className="space-y-1">
          {conditions.slice(0, 2).map((cond) => (
            <div
              key={cond.id}
              className="text-[10px] bg-orange-50 rounded px-2 py-1 flex items-center gap-1"
            >
              <code className="text-orange-700">{cond.variable}</code>
              <span className="text-slate-500">{cond.operator}</span>
              <code className="text-orange-700">{cond.value}</code>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-xs text-slate-400 italic">
          Configurar condição
        </div>
      )}
      <div className="flex gap-2 mt-2">
        <div className="flex items-center gap-1 text-[10px]">
          <Check className="h-3 w-3 text-green-500" />
          <span className="text-green-600">True</span>
        </div>
        <div className="flex items-center gap-1 text-[10px]">
          <X className="h-3 w-3 text-red-500" />
          <span className="text-red-600">False</span>
        </div>
      </div>
    </BaseNode>
  );
}
export const ConditionNode = memo(ConditionNodeComponent);

// AIAgentNode - Processamento com IA
interface AIAgentNodeData extends BaseNodeData {
  systemPrompt?: string;
  model?: string;
  tools?: string[];
}

function AIAgentNodeComponent(props: NodeProps) {
  const data = props.data as AIAgentNodeData;

  return (
    <BaseNode
      {...props}
      data={data}
      icon={<Bot className="h-5 w-5" />}
      iconBgColor="bg-violet-500"
    >
      {data.systemPrompt && (
        <div className="text-xs text-slate-600 bg-violet-50 rounded-md px-2 py-1.5 line-clamp-2 italic">
          "{data.systemPrompt.slice(0, 60)}..."
        </div>
      )}
      {data.model && (
        <Badge variant="outline" className="text-[10px] mt-1">
          🤖 {data.model}
        </Badge>
      )}
      {data.tools && data.tools.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1">
          {data.tools.slice(0, 2).map((tool) => (
            <Badge key={tool} variant="secondary" className="text-[10px]">
              {tool.replace(/_/g, ' ')}
            </Badge>
          ))}
          {data.tools.length > 2 && (
            <Badge variant="secondary" className="text-[10px]">
              +{data.tools.length - 2}
            </Badge>
          )}
        </div>
      )}
    </BaseNode>
  );
}
export const AIAgentNode = memo(AIAgentNodeComponent);

// HandoffNode - Transferir para humano
interface HandoffNodeData extends BaseNodeData {
  transferType?: 'department' | 'queue' | 'agent';
  targetId?: string;
  transferMessage?: string;
}

function HandoffNodeComponent(props: NodeProps) {
  const data = props.data as HandoffNodeData;
  const typeLabels: Record<string, string> = {
    department: 'Departamento',
    queue: 'Fila',
    agent: 'Agente',
  };

  return (
    <BaseNode
      {...props}
      data={data}
      icon={<PhoneForwarded className="h-5 w-5" />}
      iconBgColor="bg-cyan-500"
    >
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="text-[10px]">
          {typeLabels[data.transferType || 'department']}
        </Badge>
        {data.targetId && (
          <span className="text-xs text-slate-600">{data.targetId}</span>
        )}
      </div>
      {data.transferMessage && (
        <div className="text-xs text-slate-500 bg-cyan-50 rounded px-2 py-1 mt-1 line-clamp-2">
          {data.transferMessage}
        </div>
      )}
    </BaseNode>
  );
}
export const HandoffNode = memo(HandoffNodeComponent);

// WebhookNode - Chamar API externa
interface WebhookNodeData extends BaseNodeData {
  url?: string;
  method?: string;
}

function WebhookNodeComponent(props: NodeProps) {
  const data = props.data as WebhookNodeData;

  return (
    <BaseNode
      {...props}
      data={data}
      icon={<Webhook className="h-5 w-5" />}
      iconBgColor="bg-slate-600"
    >
      <div className="flex items-center gap-2">
        <Badge
          className={cn(
            'text-[10px]',
            data.method === 'POST' && 'bg-green-500',
            data.method === 'PUT' && 'bg-blue-500',
            data.method === 'DELETE' && 'bg-red-500'
          )}
        >
          {data.method || 'GET'}
        </Badge>
      </div>
      {data.url && (
        <code className="text-[10px] text-slate-600 bg-slate-100 rounded px-2 py-1 block mt-1 truncate">
          {data.url}
        </code>
      )}
    </BaseNode>
  );
}
export const WebhookNode = memo(WebhookNodeComponent);

// DelayNode - Aguardar
interface DelayNodeData extends BaseNodeData {
  delaySeconds?: number;
  showTyping?: boolean;
}

function DelayNodeComponent(props: NodeProps) {
  const data = props.data as DelayNodeData;

  return (
    <BaseNode
      {...props}
      data={data}
      icon={<Clock className="h-5 w-5" />}
      iconBgColor="bg-gray-500"
    >
      <div className="flex items-center gap-2 text-xs">
        <span className="text-slate-600">Aguardar</span>
        <Badge variant="outline">{data.delaySeconds || 5}s</Badge>
      </div>
      {data.showTyping && (
        <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-1">
          ⌨️ Mostrar digitando...
        </div>
      )}
    </BaseNode>
  );
}
export const DelayNode = memo(DelayNodeComponent);

// TagNode - Adicionar/remover tag
interface TagNodeData extends BaseNodeData {
  tagName?: string;
  action?: 'add' | 'remove' | 'toggle';
}

function TagNodeComponent(props: NodeProps) {
  const data = props.data as TagNodeData;
  const actionLabels: Record<string, string> = {
    add: 'Adicionar',
    remove: 'Remover',
    toggle: 'Alternar',
  };

  return (
    <BaseNode
      {...props}
      data={data}
      icon={<Tag className="h-5 w-5" />}
      iconBgColor="bg-pink-500"
    >
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-600">
          {actionLabels[data.action || 'add']}:
        </span>
        {data.tagName && (
          <Badge className="bg-pink-100 text-pink-700 text-[10px]">
            {data.tagName}
          </Badge>
        )}
      </div>
    </BaseNode>
  );
}
export const TagNode = memo(TagNodeComponent);

// VariableNode - Definir variável
interface VariableNodeData extends BaseNodeData {
  variableName?: string;
  value?: string;
  valueType?: 'static' | 'expression' | 'from_variable';
}

function VariableNodeComponent(props: NodeProps) {
  const data = props.data as VariableNodeData;

  return (
    <BaseNode
      {...props}
      data={data}
      icon={<Variable className="h-5 w-5" />}
      iconBgColor="bg-teal-500"
    >
      <div className="flex items-center gap-1 text-xs">
        <code className="text-teal-700 bg-teal-100 px-1 rounded">
          {data.variableName || 'var'}
        </code>
        <span className="text-slate-400">=</span>
        <code className="text-slate-600 bg-slate-100 px-1 rounded truncate">
          {data.value || '...'}
        </code>
      </div>
    </BaseNode>
  );
}
export const VariableNode = memo(VariableNodeComponent);

// IdentifyContractNode - Identificar contrato
interface IdentifyContractNodeData extends BaseNodeData {
  identifyBy?: 'cpf' | 'phone' | 'email';
  lockContract?: boolean;
}

function IdentifyContractNodeComponent(props: NodeProps) {
  const data = props.data as IdentifyContractNodeData;
  const identifyLabels: Record<string, string> = {
    cpf: 'CPF',
    phone: 'Telefone',
    email: 'E-mail',
  };

  return (
    <BaseNode
      {...props}
      data={data}
      icon={<FileSearch className="h-5 w-5" />}
      iconBgColor="bg-indigo-500"
      sourceHandles={[
        { id: 'found', label: 'Encontrado', position: 'right' },
        { id: 'not_found', label: 'Não encontrado', position: 'right' },
      ]}
    >
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-600">Buscar por:</span>
        <Badge variant="outline" className="text-[10px]">
          {identifyLabels[data.identifyBy || 'cpf']}
        </Badge>
      </div>
      {data.lockContract && (
        <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-1">
          🔒 Travar contrato
        </div>
      )}
    </BaseNode>
  );
}
export const IdentifyContractNode = memo(IdentifyContractNodeComponent);

// ClientTagNode - Tag de tipo de cliente (melhorado com detecção automática do cadastro)
interface ClientTagNodeData extends BaseNodeData {
  clientTagType?: string;
  customTag?: string;
  action?: 'add' | 'remove' | 'set';
  autoDetectFromContract?: boolean;
  contractField?: 'tipo_cliente' | 'perfil' | 'categoria' | 'segmento';
}

function ClientTagNodeComponent(props: NodeProps) {
  const data = props.data as ClientTagNodeData;
  const tagLabels: Record<string, string> = {
    novo: 'Novo',
    recorrente: 'Recorrente',
    vip: 'VIP',
    inadimplente: 'Inadimplente',
    investidor: 'Investidor',
    garantidor: 'Garantidor',
    imobiliaria: 'Imobiliária',
    proprietario: 'Proprietário',
    inquilino: 'Inquilino',
    lead: 'Lead',
    from_contract: 'Do Cadastro',
    custom: data.customTag || 'Customizado',
  };

  const fieldLabels: Record<string, string> = {
    tipo_cliente: 'Tipo Cliente',
    perfil: 'Perfil',
    categoria: 'Categoria',
    segmento: 'Segmento',
  };

  return (
    <BaseNode
      {...props}
      data={data}
      icon={<UserCheck className="h-5 w-5" />}
      iconBgColor="bg-rose-500"
    >
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <Badge className="bg-rose-100 text-rose-700 text-[10px]">
            {tagLabels[data.clientTagType || 'novo']}
          </Badge>
        </div>
        {data.autoDetectFromContract && (
          <div className="flex items-center gap-1 text-[10px] text-rose-600 bg-rose-50 rounded px-2 py-1">
            <Database className="h-3 w-3" />
            <span>Campo: {fieldLabels[data.contractField || 'tipo_cliente']}</span>
          </div>
        )}
        {data.clientTagType === 'from_contract' && (
          <div className="text-[10px] text-slate-500 italic">
            Tipo detectado automaticamente
          </div>
        )}
      </div>
    </BaseNode>
  );
}
export const ClientTagNode = memo(ClientTagNodeComponent);

// WelcomeAINode - IA de boas-vindas multimodal
interface WelcomeAINodeData extends BaseNodeData {
  greetingMessage?: string;
  model?: string;
  capabilities?: {
    handleAudio?: boolean;
    handleText?: boolean;
    handlePaymentProof?: boolean;
    handleImages?: boolean;
    handleDocuments?: boolean;
  };
  enableSmartRouting?: boolean;
  sectorAIs?: { id: string; name: string }[];
  humanHandoffTriggers?: string[];
}

function WelcomeAINodeComponent(props: NodeProps) {
  const data = props.data as WelcomeAINodeData;
  const capabilities = data.capabilities || {};
  const activeCapabilities: string[] = [];

  if (capabilities.handleAudio) activeCapabilities.push('Áudio');
  if (capabilities.handleText) activeCapabilities.push('Texto');
  if (capabilities.handlePaymentProof) activeCapabilities.push('Comprovante');
  if (capabilities.handleImages) activeCapabilities.push('Imagem');
  if (capabilities.handleDocuments) activeCapabilities.push('Documento');

  return (
    <BaseNode
      {...props}
      data={data}
      icon={<Sparkles className="h-5 w-5" />}
      iconBgColor="bg-gradient-to-br from-purple-500 to-pink-500"
      sourceHandles={[
        { id: 'continue', label: 'Continuar', position: 'right' },
        { id: 'sector_ai', label: 'IA Setor', position: 'right' },
        { id: 'human', label: 'Humano', position: 'right' },
      ]}
    >
      {data.greetingMessage && (
        <div className="text-xs text-slate-600 bg-purple-50 rounded-md px-2 py-1.5 line-clamp-2">
          {data.greetingMessage}
        </div>
      )}

      {/* Capacidades ativas */}
      <div className="flex flex-wrap gap-1 mt-2">
        {capabilities.handleAudio && (
          <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-700 border-blue-200">
            <Mic className="h-2.5 w-2.5 mr-1" />
            Áudio
          </Badge>
        )}
        {capabilities.handleText && (
          <Badge variant="outline" className="text-[10px] bg-green-50 text-green-700 border-green-200">
            <MessageSquare className="h-2.5 w-2.5 mr-1" />
            Texto
          </Badge>
        )}
        {capabilities.handlePaymentProof && (
          <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-700 border-amber-200">
            <Receipt className="h-2.5 w-2.5 mr-1" />
            Comprovante
          </Badge>
        )}
        {capabilities.handleImages && (
          <Badge variant="outline" className="text-[10px] bg-pink-50 text-pink-700 border-pink-200">
            <Image className="h-2.5 w-2.5 mr-1" />
            Imagem
          </Badge>
        )}
        {capabilities.handleDocuments && (
          <Badge variant="outline" className="text-[10px] bg-slate-50 text-slate-700 border-slate-200">
            <FileText className="h-2.5 w-2.5 mr-1" />
            Doc
          </Badge>
        )}
      </div>

      {/* Roteamento inteligente */}
      {data.enableSmartRouting && (
        <div className="flex items-center gap-1 mt-2 text-[10px] text-purple-600 bg-purple-50 rounded px-2 py-1">
          <ArrowRightLeft className="h-3 w-3" />
          <span>Roteamento inteligente</span>
        </div>
      )}

      {/* IAs de setor */}
      {data.sectorAIs && data.sectorAIs.length > 0 && (
        <div className="mt-1 text-[10px] text-slate-500">
          {data.sectorAIs.length} IA(s) de setor
        </div>
      )}

      {/* Modelo */}
      {data.model && (
        <Badge variant="outline" className="text-[10px] mt-1">
          🤖 {data.model}
        </Badge>
      )}
    </BaseNode>
  );
}
export const WelcomeAINode = memo(WelcomeAINodeComponent);

// LeadCaptureNode - Captura de leads para prospecção
interface LeadCaptureNodeData extends BaseNodeData {
  captureFields?: {
    nome?: { enabled: boolean; required: boolean };
    cpf?: { enabled: boolean; required: boolean };
    email?: { enabled: boolean; required: boolean };
    celular?: { enabled: boolean; required: boolean };
    empresa?: { enabled: boolean; required: boolean };
    cargo?: { enabled: boolean; required: boolean };
    interesse?: { enabled: boolean; required: boolean };
    origem?: { enabled: boolean; required: boolean };
  };
  saveToDatabase?: boolean;
  sendToWebhook?: boolean;
  leadSource?: string;
  autoTags?: string[];
}

function LeadCaptureNodeComponent(props: NodeProps) {
  const data = props.data as LeadCaptureNodeData;
  const fields = data.captureFields || {};

  const enabledFields: string[] = [];
  const fieldLabels: Record<string, string> = {
    nome: 'Nome',
    cpf: 'CPF',
    email: 'E-mail',
    celular: 'Celular',
    empresa: 'Empresa',
    cargo: 'Cargo',
    interesse: 'Interesse',
    origem: 'Origem',
  };

  Object.entries(fields).forEach(([key, value]) => {
    if (value?.enabled) {
      enabledFields.push(fieldLabels[key] || key);
    }
  });

  return (
    <BaseNode
      {...props}
      data={data}
      icon={<UserPlus className="h-5 w-5" />}
      iconBgColor="bg-emerald-500"
      sourceHandles={[
        { id: 'success', label: 'Sucesso', position: 'right' },
        { id: 'duplicate', label: 'Duplicado', position: 'right' },
        { id: 'error', label: 'Erro', position: 'right' },
      ]}
    >
      {/* Campos ativos */}
      <div className="space-y-1">
        <div className="text-[10px] text-slate-500 font-medium">
          Campos a capturar:
        </div>
        <div className="flex flex-wrap gap-1">
          {enabledFields.length > 0 ? (
            enabledFields.slice(0, 4).map((field) => (
              <Badge
                key={field}
                variant="outline"
                className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200"
              >
                {field}
              </Badge>
            ))
          ) : (
            <span className="text-[10px] text-slate-400 italic">
              Configurar campos
            </span>
          )}
          {enabledFields.length > 4 && (
            <Badge variant="outline" className="text-[10px]">
              +{enabledFields.length - 4}
            </Badge>
          )}
        </div>
      </div>

      {/* Integrações */}
      <div className="flex gap-2 mt-2">
        {data.saveToDatabase && (
          <div className="flex items-center gap-1 text-[10px] text-blue-600 bg-blue-50 rounded px-2 py-0.5">
            <Database className="h-3 w-3" />
            <span>BD</span>
          </div>
        )}
        {data.sendToWebhook && (
          <div className="flex items-center gap-1 text-[10px] text-slate-600 bg-slate-50 rounded px-2 py-0.5">
            <Webhook className="h-3 w-3" />
            <span>Webhook</span>
          </div>
        )}
      </div>

      {/* Origem do lead */}
      {data.leadSource && (
        <div className="text-[10px] text-slate-500 mt-1">
          Origem: {data.leadSource}
        </div>
      )}

      {/* Tags automáticas */}
      {data.autoTags && data.autoTags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1">
          {data.autoTags.slice(0, 2).map((tag) => (
            <Badge
              key={tag}
              className="bg-emerald-100 text-emerald-700 text-[10px]"
            >
              #{tag}
            </Badge>
          ))}
        </div>
      )}
    </BaseNode>
  );
}
export const LeadCaptureNode = memo(LeadCaptureNodeComponent);

// EndNode - Finalizar fluxo
interface EndNodeData extends BaseNodeData {
  endType?: 'complete' | 'cancel' | 'error';
  finalMessage?: string;
}

function EndNodeComponent(props: NodeProps) {
  const data = props.data as EndNodeData;
  const endConfig: Record<string, { label: string; color: string }> = {
    complete: { label: 'Concluído', color: 'bg-green-100 text-green-700' },
    cancel: { label: 'Cancelado', color: 'bg-yellow-100 text-yellow-700' },
    error: { label: 'Erro', color: 'bg-red-100 text-red-700' },
  };
  const config = endConfig[data.endType || 'complete'];

  return (
    <BaseNode
      {...props}
      data={data}
      icon={<CircleSlash className="h-5 w-5" />}
      iconBgColor="bg-red-500"
      showSourceHandle={false}
    >
      <Badge className={cn('text-[10px]', config.color)}>
        {config.label}
      </Badge>
      {data.finalMessage && (
        <div className="text-xs text-slate-500 mt-1 line-clamp-2">
          {data.finalMessage}
        </div>
      )}
    </BaseNode>
  );
}
export const EndNode = memo(EndNodeComponent);

// Exportar mapa de tipos de nós para o React Flow
export const nodeTypes = {
  start: StartNode,
  message: MessageNode,
  input: InputNode,
  menu: MenuNode,
  condition: ConditionNode,
  ai_agent: AIAgentNode,
  welcome_ai: WelcomeAINode,
  handoff: HandoffNode,
  webhook: WebhookNode,
  delay: DelayNode,
  tag: TagNode,
  variable: VariableNode,
  identify_contract: IdentifyContractNode,
  client_tag: ClientTagNode,
  lead_capture: LeadCaptureNode,
  end: EndNode,
};
