/**
 * Flow Builder Types - Tipos para o Editor Visual de Fluxos
 * Baseado em React Flow / Typebot / n8n
 */

import type { Node, Edge } from '@xyflow/react';

// Tipos de nós disponíveis
export type FlowNodeType =
  | 'start'
  | 'message'
  | 'input'
  | 'menu'
  | 'condition'
  | 'ai_agent'
  | 'welcome_ai'
  | 'handoff'
  | 'webhook'
  | 'delay'
  | 'tag'
  | 'variable'
  | 'identify_contract'
  | 'client_tag'
  | 'lead_capture'
  | 'end';

// Dados base para todos os nós
export interface BaseNodeData {
  label: string;
  description?: string;
}

// StartNode - Gatilho inicial
export interface StartNodeData extends BaseNodeData {
  triggerType: 'new_conversation' | 'keyword' | 'schedule' | 'webhook';
  keywords?: string[];
  scheduleExpression?: string;
}

// MessageNode - Enviar mensagem
export interface MessageNodeData extends BaseNodeData {
  message: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video' | 'audio' | 'document';
  buttons?: { id: string; label: string; value: string }[];
}

// InputNode - Coletar entrada
export interface InputNodeData extends BaseNodeData {
  question: string;
  variableName: string;
  validationType: 'text' | 'number' | 'email' | 'cpf' | 'phone' | 'date' | 'custom';
  customValidation?: string;
  errorMessage?: string;
  timeout?: number;
  timeoutMessage?: string;
}

// MenuNode - Menu de opções
export interface MenuNodeData extends BaseNodeData {
  menuTitle: string;
  options: { id: string; label: string; value: string; description?: string }[];
  invalidMessage?: string;
  allowText?: boolean;
}

// ConditionNode - Desvio condicional
export interface ConditionNodeData extends BaseNodeData {
  conditions: {
    id: string;
    variable: string;
    operator: 'equals' | 'not_equals' | 'contains' | 'starts_with' | 'ends_with' | 'greater_than' | 'less_than' | 'is_empty' | 'is_not_empty' | 'matches_regex';
    value: string;
    handleId: string;
  }[];
  defaultHandleId: string;
}

// AIAgentNode - Processamento com IA
export interface AIAgentNodeData extends BaseNodeData {
  systemPrompt: string;
  model?: 'gpt-4' | 'gpt-4-turbo' | 'gpt-3.5-turbo' | 'claude-3-opus' | 'claude-3-sonnet';
  temperature?: number;
  maxTokens?: number;
  tools: string[];
  fallbackMessage?: string;
  contextVariables?: string[];
}

// HandoffNode - Transferir para humano
export interface HandoffNodeData extends BaseNodeData {
  transferType: 'department' | 'queue' | 'agent';
  targetId: string;
  transferMessage?: string;
  priority?: 'low' | 'normal' | 'high' | 'urgent';
  metadata?: Record<string, string>;
}

// WebhookNode - Chamar API externa
export interface WebhookNodeData extends BaseNodeData {
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  body?: string;
  responseVariable?: string;
  timeout?: number;
  retryCount?: number;
}

// DelayNode - Aguardar
export interface DelayNodeData extends BaseNodeData {
  delaySeconds: number;
  showTyping?: boolean;
}

// TagNode - Adicionar/remover tag
export interface TagNodeData extends BaseNodeData {
  tagName: string;
  action: 'add' | 'remove' | 'toggle';
}

// VariableNode - Definir variável
export interface VariableNodeData extends BaseNodeData {
  variableName: string;
  value: string;
  valueType: 'static' | 'expression' | 'from_variable';
  sourceVariable?: string;
}

// IdentifyContractNode - Identificar contrato
export interface IdentifyContractNodeData extends BaseNodeData {
  identifyBy: 'cpf' | 'phone' | 'email';
  lockContract: boolean;
  askForSelection: boolean;
  selectionMessage?: string;
  notFoundMessage: string;
  variableName?: string;
}

// ClientTagNode - Tag de tipo de cliente (melhorado para buscar do cadastro)
export interface ClientTagNodeData extends BaseNodeData {
  clientTagType: 'novo' | 'recorrente' | 'vip' | 'inadimplente' | 'investidor' | 'garantidor' | 'imobiliaria' | 'proprietario' | 'inquilino' | 'lead' | 'custom' | 'from_contract';
  customTag?: string;
  action: 'add' | 'remove' | 'set';
  // Novo: Selecionar campo do cadastro para tipo automático
  autoDetectFromContract: boolean;
  contractField?: 'tipo_cliente' | 'perfil' | 'categoria' | 'segmento';
}

// WelcomeAINode - IA de boas-vindas multimodal
export interface WelcomeAINodeData extends BaseNodeData {
  // Configurações gerais
  greetingMessage: string;
  model: 'gpt-4' | 'gpt-4-turbo' | 'gpt-3.5-turbo' | 'claude-3-opus' | 'claude-3-sonnet';
  temperature?: number;

  // Capacidades multimodais
  capabilities: {
    handleAudio: boolean;       // Transcrever e responder áudios
    handleText: boolean;        // Ler e responder textos
    handlePaymentProof: boolean; // Interpretar comprovantes de pagamento
    handleImages: boolean;      // Interpretar imagens gerais
    handleDocuments: boolean;   // Ler PDFs e documentos
  };

  // Transcrição de áudio
  audioTranscriptionProvider: 'whisper' | 'azure' | 'google';
  audioResponseType: 'text' | 'audio' | 'both';

  // OCR para comprovantes
  ocrProvider: 'google_vision' | 'azure' | 'tesseract';
  paymentProofFields: string[]; // Campos a extrair: valor, data, banco, etc.

  // Roteamento inteligente
  enableSmartRouting: boolean;
  routingRules: {
    id: string;
    condition: string; // Expressão ou intent
    targetType: 'ai_sector' | 'human' | 'flow';
    targetId: string;
    targetName: string;
  }[];

  // IAs de setor disponíveis para transferência
  sectorAIs: {
    id: string;
    name: string;
    description: string;
    keywords: string[];
  }[];

  // Transferência para humano
  humanHandoffTriggers: string[]; // Palavras/frases que acionam transferência
  humanHandoffMessage: string;
  humanHandoffDepartment: string;

  // Prompt do sistema
  systemPrompt: string;

  // Contexto adicional
  contextVariables: string[];
}

// LeadCaptureNode - Captura de leads para prospecção
export interface LeadCaptureNodeData extends BaseNodeData {
  // Campos a capturar
  captureFields: {
    nome: { enabled: boolean; required: boolean; question: string };
    cpf: { enabled: boolean; required: boolean; question: string };
    email: { enabled: boolean; required: boolean; question: string };
    celular: { enabled: boolean; required: boolean; question: string };
    empresa: { enabled: boolean; required: boolean; question: string };
    cargo: { enabled: boolean; required: boolean; question: string };
    interesse: { enabled: boolean; required: boolean; question: string };
    origem: { enabled: boolean; required: boolean; question: string };
  };

  // Ordem de captura
  captureOrder: ('nome' | 'cpf' | 'email' | 'celular' | 'empresa' | 'cargo' | 'interesse' | 'origem')[];

  // Configurações de persistência
  saveToDatabase: boolean;
  databaseTable: string;

  // Webhook para CRM externo
  sendToWebhook: boolean;
  webhookUrl: string;

  // Tags automáticas
  autoTags: string[];

  // Origem do lead
  leadSource: string;
  leadCampaign?: string;

  // Mensagens
  introMessage: string;
  successMessage: string;
  errorMessage: string;

  // Validação
  validateDuplicates: boolean;
  duplicateField: 'cpf' | 'email' | 'celular';
  duplicateMessage: string;
}

// EndNode - Finalizar fluxo
export interface EndNodeData extends BaseNodeData {
  endType: 'complete' | 'cancel' | 'error';
  finalMessage?: string;
  markAsResolved?: boolean;
}

// União de todos os tipos de dados de nós
export type CustomNodeData =
  | StartNodeData
  | MessageNodeData
  | InputNodeData
  | MenuNodeData
  | ConditionNodeData
  | AIAgentNodeData
  | WelcomeAINodeData
  | HandoffNodeData
  | WebhookNodeData
  | DelayNodeData
  | TagNodeData
  | VariableNodeData
  | IdentifyContractNodeData
  | ClientTagNodeData
  | LeadCaptureNodeData
  | EndNodeData;

// Nó customizado do fluxo
export type FlowNode = Node<CustomNodeData & Record<string, unknown>, FlowNodeType>;

// Aresta do fluxo
export interface FlowEdge extends Edge {
  label?: string;
  animated?: boolean;
  data?: {
    condition?: string;
  };
}

// Variável do fluxo
export interface FlowVariable {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array';
  defaultValue?: unknown;
  description?: string;
}

// Fluxo completo
export interface Flow {
  id: string;
  name: string;
  description?: string;
  departmentId?: string;
  isActive: boolean;
  isDefault: boolean;
  triggerType: 'new_conversation' | 'keyword' | 'schedule' | 'webhook';
  nodes: FlowNode[];
  edges: FlowEdge[];
  variables: FlowVariable[];
  version: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// Definição de tipo de nó para a sidebar
export interface NodeTypeDefinition {
  type: FlowNodeType;
  label: string;
  description: string;
  icon: string;
  color: string;
  bgColor: string;
  category: 'trigger' | 'message' | 'input' | 'logic' | 'action' | 'integration' | 'end';
  defaultData: Partial<CustomNodeData>;
}

// Contexto de execução do fluxo
export interface FlowExecutionContext {
  sessionId: string;
  contactId: string;
  contactPhone?: string;
  contactName?: string;
  variables: Record<string, unknown>;
  currentNodeId: string;
  history: { nodeId: string; timestamp: Date; action: string }[];
  startedAt: Date;
  lastActivityAt: Date;
}

// Resultado da execução de um nó
export interface NodeExecutionResult {
  success: boolean;
  output?: string | string[];
  nextNodeId?: string;
  variables?: Record<string, unknown>;
  waitForInput?: boolean;
  error?: string;
}
