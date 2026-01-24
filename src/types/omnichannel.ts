/**
 * Vinculo Omni - Sistema de Atendimento Omnichannel
 * Tipos e interfaces para o sistema completo de atendimento
 */

// ============= ENUMS =============

export type ChannelType = 'whatsapp' | 'webchat' | 'email' | 'instagram' | 'telegram';

export type TicketStatus =
  | 'waiting' // Aguardando na fila
  | 'bot_handling' // IA está atendendo
  | 'agent_handling' // Humano atendendo
  | 'pending_customer' // Aguardando resposta do cliente
  | 'pending_agent' // Aguardando resposta do agente
  | 'on_hold' // Em espera (pausado)
  | 'transferred' // Transferido
  | 'resolved' // Resolvido
  | 'closed'; // Fechado

export type TicketPriority = 'low' | 'normal' | 'high' | 'urgent';

export type MessageSender = 'customer' | 'agent' | 'bot' | 'system';

export type MessageType =
  | 'text'
  | 'image'
  | 'document'
  | 'audio'
  | 'video'
  | 'location'
  | 'contact'
  | 'sticker'
  | 'template'
  | 'interactive'
  | 'system_event';

export type MessageStatus = 'pending' | 'sent' | 'delivered' | 'read' | 'failed';

export type FlowNodeType =
  | 'start'
  | 'message'
  | 'question'
  | 'menu'
  | 'condition'
  | 'action'
  | 'ai_agent'
  | 'transfer'
  | 'webhook'
  | 'delay'
  | 'tag'
  | 'variable'
  | 'identify_contract' // Identificar e vincular contrato por CPF/Telefone/Email
  | 'client_tag' // Tag por tipo de cliente
  | 'end';

export type AgentStatus = 'online' | 'away' | 'busy' | 'offline';

// ============= CONTACTS =============

export interface Contact {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  avatar?: string;
  cpf?: string;
  lastSeen?: Date;
  isOnline?: boolean;
  channel: ChannelType;
  channelId: string; // ID do contato no canal (ex: número WhatsApp, email, etc.)
  metadata?: Record<string, unknown>;
  tags?: string[];
  customFields?: Record<string, string>;
  createdAt: Date;
  updatedAt: Date;
}

// ============= MESSAGES =============

export interface Message {
  id: string;
  ticketId: string;
  contactId: string;
  content: string;
  timestamp: Date;
  sender: MessageSender;
  senderName?: string;
  senderId?: string; // ID do agente ou bot
  status: MessageStatus;
  type: MessageType;
  mediaUrl?: string;
  mediaMimeType?: string;
  mediaSize?: number;
  replyToId?: string; // Mensagem à qual está respondendo
  templateId?: string;
  templateVariables?: Record<string, string>;
  suggestedByAI?: boolean;
  aiConfidence?: number;
  metadata?: Record<string, unknown>;
}

// ============= TICKETS =============

export interface Ticket {
  id: string;
  number: number; // Número sequencial do ticket
  contactId: string;
  contact: Contact;
  channel: ChannelType;
  status: TicketStatus;
  priority: TicketPriority;
  departmentId: string;
  department?: Department;
  queueId: string;
  queue?: Queue;
  subject: string;
  assignedAgentId?: string;
  assignedAgent?: Agent;
  flowId?: string;
  currentFlowNodeId?: string;
  flowVariables?: Record<string, unknown>;
  messages: Message[];
  lastMessageAt: Date;
  unreadCount: number;
  isStarred: boolean;
  tags: TicketTag[];
  sentiment?: 'positive' | 'neutral' | 'negative';
  sla?: TicketSLA;
  contractId?: string;
  metadata?: Record<string, unknown>;
  firstResponseAt?: Date;
  resolvedAt?: Date;
  closedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface TicketTag {
  id: string;
  name: string;
  color: string;
  type: 'auto' | 'manual';
  category: 'request_type' | 'handler' | 'status' | 'priority' | 'custom';
}

export interface TicketSLA {
  id: string;
  firstResponseDue: Date;
  resolutionDue: Date;
  firstResponseBreached: boolean;
  resolutionBreached: boolean;
}

// ============= DEPARTMENTS & QUEUES =============

export interface Department {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  isActive: boolean;
  defaultQueueId?: string;
  workingHours?: WorkingHours;
  agents: Agent[];
  queues: Queue[];
  autoAssign: boolean;
  maxTicketsPerAgent: number;
  slaConfig?: SLAConfig;
  flowId?: string; // Fluxo padrão do departamento
  whatsappWelcomeMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Queue {
  id: string;
  name: string;
  description?: string;
  departmentId: string;
  department?: Department;
  priority: number; // Ordem de prioridade da fila
  isActive: boolean;
  maxWaitTime?: number; // Tempo máximo de espera em minutos
  agents: Agent[];
  ticketCount?: number;
  avgWaitTime?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface WorkingHours {
  timezone: string;
  schedule: {
    day: number; // 0-6 (domingo-sábado)
    isOpen: boolean;
    openTime?: string; // HH:mm
    closeTime?: string; // HH:mm
  }[];
  holidays?: Date[];
}

export interface SLAConfig {
  firstResponseTime: number; // Minutos
  resolutionTime: number; // Minutos
  escalationEmail?: string;
  escalateToAgentId?: string;
}

// ============= AGENTS =============

export interface Agent {
  id: string;
  userId: string;
  name: string;
  email: string;
  avatar?: string;
  status: AgentStatus;
  role: 'agent' | 'supervisor' | 'admin';
  departmentIds: string[];
  departments?: Department[];
  queueIds: string[];
  queues?: Queue[];
  maxConcurrentChats: number;
  activeChats: number;
  skills?: string[];
  isOnline: boolean;
  lastSeenAt?: Date;
  metrics?: AgentMetrics;
  createdAt: Date;
  updatedAt: Date;
}

export interface AgentMetrics {
  ticketsHandledToday: number;
  ticketsResolvedToday: number;
  avgResponseTime: number; // Segundos
  avgResolutionTime: number; // Minutos
  customerSatisfaction: number; // 0-100
  ticketsInProgress: number;
}

// ============= FLOWS =============

export interface Flow {
  id: string;
  name: string;
  description?: string;
  departmentId?: string;
  isActive: boolean;
  isDefault: boolean;
  triggerType: 'new_conversation' | 'keyword' | 'manual' | 'schedule';
  triggerKeywords?: string[];
  nodes: FlowNode[];
  edges: FlowEdge[];
  variables: FlowVariable[];
  version: number;
  publishedAt?: Date;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface FlowNode {
  id: string;
  type: FlowNodeType;
  position: { x: number; y: number };
  data: FlowNodeData;
}

export interface FlowNodeData {
  label?: string;
  // Nó de mensagem
  message?: string;
  messageType?: MessageType;
  mediaUrl?: string;
  // Nó de pergunta
  question?: string;
  variableName?: string;
  validationType?: 'text' | 'number' | 'email' | 'cpf' | 'phone' | 'date' | 'custom';
  validationRegex?: string;
  errorMessage?: string;
  // Nó de menu
  menuTitle?: string;
  menuOptions?: FlowMenuOption[];
  // Nó de condição
  conditionVariable?: string;
  conditionOperator?: 'equals' | 'contains' | 'greater' | 'less' | 'regex' | 'exists';
  conditionValue?: string;
  // Nó de IA
  aiPrompt?: string;
  aiTools?: string[];
  aiMaxTokens?: number;
  // Nó de transferência
  transferType?: 'department' | 'queue' | 'agent';
  transferTargetId?: string;
  transferMessage?: string;
  // Nó de webhook
  webhookUrl?: string;
  webhookMethod?: 'GET' | 'POST' | 'PUT';
  webhookHeaders?: Record<string, string>;
  webhookBody?: string;
  // Nó de delay
  delaySeconds?: number;
  // Nó de tag
  tagAction?: 'add' | 'remove';
  tagNames?: string[];
  // Nó de variável
  variableAction?: 'set' | 'increment' | 'clear';
  variableValue?: string;
  // Nó de identificar contrato
  identifyBy?: 'cpf' | 'phone' | 'email';
  lockContract?: boolean; // Travar contrato para próximo atendimento
  askForSelection?: boolean; // Se múltiplos contratos, perguntar qual
  selectionMessage?: string; // Mensagem para seleção de contrato
  notFoundMessage?: string; // Mensagem se contrato não encontrado
  // Nó de tag de cliente
  clientTagType?: 'novo' | 'recorrente' | 'vip' | 'inadimplente' | 'investidor' | 'garantidor' | 'imobiliaria' | 'proprietario' | 'inquilino' | 'lead' | 'custom';
  customClientTag?: string; // Tag customizada
  clientTagAction?: 'add' | 'remove' | 'set';
}

export interface FlowMenuOption {
  id: string;
  label: string;
  value: string;
  icon?: string;
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  label?: string;
  condition?: string;
}

export interface FlowVariable {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'date' | 'array' | 'object';
  defaultValue?: unknown;
  description?: string;
}

// ============= AI AGENT =============

export interface AIAgentConfig {
  id: string;
  name: string;
  model: 'gpt-4o' | 'gpt-4o-mini' | 'gpt-3.5-turbo' | 'claude-3-opus' | 'claude-3-sonnet';
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
  tools: AITool[];
  fallbackToHuman: boolean;
  maxInteractions: number; // Máximo de interações antes de transferir
  confidenceThreshold: number; // Confiança mínima para responder
  departmentId?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AITool {
  id: string;
  name: string;
  description: string;
  parameters: AIToolParameter[];
  handler: string; // Nome da função handler
  isActive: boolean;
}

export interface AIToolParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array' | 'object';
  description: string;
  required: boolean;
  enum?: string[];
}

// ============= TEMPLATES =============

export interface MessageTemplate {
  id: string;
  name: string;
  content: string;
  category: string;
  channel: ChannelType;
  variables: string[];
  usageCount: number;
  isActive: boolean;
  isApproved: boolean; // Para WhatsApp Business API
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface QuickReply {
  id: string;
  trigger: string;
  response: string;
  category: string;
  agentId?: string; // Se pertence a um agente específico
  isGlobal: boolean;
  usageCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ============= KNOWLEDGE BASE =============

export interface KnowledgeEntry {
  id: string;
  question: string;
  answer: string;
  category: string;
  keywords: string[];
  confidence: number;
  usageCount: number;
  feedbackPositive: number;
  feedbackNegative: number;
  source: 'manual' | 'learned' | 'imported';
  relatedEntryIds: string[];
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// ============= METRICS & REPORTS =============

export interface OmnichannelMetrics {
  period: {
    start: Date;
    end: Date;
  };
  tickets: {
    total: number;
    open: number;
    resolved: number;
    closed: number;
    byChannel: Record<ChannelType, number>;
    byDepartment: Record<string, number>;
    byPriority: Record<TicketPriority, number>;
  };
  responseTime: {
    avg: number; // Segundos
    median: number;
    p95: number;
  };
  resolutionTime: {
    avg: number; // Minutos
    median: number;
    p95: number;
  };
  satisfaction: {
    avg: number; // 0-5
    responses: number;
    distribution: Record<number, number>;
  };
  agents: {
    online: number;
    total: number;
    avgTicketsPerAgent: number;
  };
  ai: {
    ticketsHandled: number;
    successfulResolutions: number;
    transferredToHuman: number;
    avgConfidence: number;
  };
}

// ============= CHANNEL PROVIDERS =============

export interface WhatsAppConfig {
  id: string;
  name: string;
  phoneNumber: string;
  phoneNumberId: string;
  businessAccountId: string;
  accessToken: string;
  webhookVerifyToken: string;
  isActive: boolean;
  departmentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WebchatConfig {
  id: string;
  name: string;
  widgetColor: string;
  welcomeMessage: string;
  offlineMessage: string;
  inputPlaceholder: string;
  logoUrl?: string;
  departmentId?: string;
  collectName: boolean;
  collectEmail: boolean;
  collectPhone: boolean;
  isActive: boolean;
  allowedDomains: string[];
  createdAt: Date;
  updatedAt: Date;
}

// ============= EVENTS =============

export interface OmnichannelEvent {
  id: string;
  type:
    | 'ticket.created'
    | 'ticket.assigned'
    | 'ticket.transferred'
    | 'ticket.resolved'
    | 'ticket.closed'
    | 'message.received'
    | 'message.sent'
    | 'agent.online'
    | 'agent.offline'
    | 'sla.breached'
    | 'flow.started'
    | 'flow.completed';
  ticketId?: string;
  agentId?: string;
  data: Record<string, unknown>;
  timestamp: Date;
}

// ============= API RESPONSES =============

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}
