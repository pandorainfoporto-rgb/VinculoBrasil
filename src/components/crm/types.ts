// =============================================================================
// Vínculo CRM - Sistema de Gestão de Relacionamento com Cliente
// =============================================================================
// Este módulo define todos os tipos TypeScript para o CRM do Vínculo Brasil,
// focado no mercado imobiliário com suporte a múltiplas fontes de leads.
// =============================================================================

// -----------------------------------------------------------------------------
// Enums e Tipos Base
// -----------------------------------------------------------------------------

/** Tipo de ator no CRM */
export type LeadActorType = 'inquilino' | 'locador' | 'garantidor' | 'prospect';

/** Status do Lead no funil */
export type LeadStatus =
  | 'novo'
  | 'qualificando'
  | 'qualificado'
  | 'convertido'
  | 'perdido'
  | 'descartado';

/** Status do Deal/Negócio */
export type DealStatus =
  | 'aberto'
  | 'em_negociacao'
  | 'documentacao'
  | 'contrato'
  | 'ganho'
  | 'perdido';

/** Fonte de origem do Lead */
export type LeadSource =
  | 'landing_page'
  | 'facebook_ads'
  | 'instagram_ads'
  | 'google_ads'
  | 'whatsapp'
  | 'omnichannel'
  | 'indicacao'
  | 'organico'
  | 'evento'
  | 'parceiro'
  | 'outro';

/** Tipo de atividade registrada */
export type ActivityType =
  | 'chamada'
  | 'email'
  | 'whatsapp'
  | 'visita'
  | 'reuniao'
  | 'documento'
  | 'contrato'
  | 'nota'
  | 'sistema'
  | 'automacao';

/** Tipo de Pipeline */
export type PipelineType =
  | 'inquilino'
  | 'locador'
  | 'garantidor'
  | 'geral';

/** Prioridade do Deal */
export type DealPriority = 'baixa' | 'media' | 'alta' | 'urgente';

/** Status do webhook */
export type WebhookStatus = 'ativo' | 'inativo' | 'erro';

// -----------------------------------------------------------------------------
// Entidades Principais
// -----------------------------------------------------------------------------

/**
 * Lead - Contato captado de qualquer fonte
 * Representa dados brutos de um potencial cliente
 */
export interface Lead {
  id: string;

  // Dados de Identificação
  nome: string;
  email: string;
  telefone: string;
  cpf?: string;

  // Classificação
  actorType: LeadActorType;
  status: LeadStatus;
  source: LeadSource;

  // Scoring e Qualificação
  score: number; // 0-100
  temperature: 'frio' | 'morno' | 'quente';
  qualifiedAt?: Date;

  // Dados Adicionais
  empresa?: string;
  cargo?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;

  // Interesses
  interesseImovel?: string;
  valorMaximo?: number;
  valorMinimo?: number;
  tipoImovel?: string;
  regioesInteresse?: string[];

  // Dados Proprietário (se locador)
  quantidadeImoveis?: number;
  rendaMedia?: number;

  // Rastreamento
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;

  // Webhook/Integração
  externalId?: string; // ID externo (Facebook Lead ID, etc.)
  webhookSource?: string;
  rawPayload?: Record<string, unknown>;

  // Chat/Omnichannel
  chatHistory?: ChatMessage[];
  lastChannelUsed?: string;

  // =============================================================================
  // INTEGRAÇÃO COM OUTROS MÓDULOS (Communication Hub + Engage)
  // =============================================================================

  /**
   * ID da última conversa no Communication Hub
   * Permite abrir o histórico de mensagens diretamente do CRM
   */
  lastConversationId?: string;

  /**
   * ID da campanha Engage ativa para este lead
   * Se preenchido, o lead está recebendo mensagens automáticas
   * Permite mostrar botão "Pausar Marketing" no CRM
   */
  activeEngageCampaignId?: string;

  /**
   * Status do marketing automation para este lead
   * 'active' = Recebendo mensagens automáticas
   * 'paused' = Marketing pausado manualmente
   * 'completed' = Fluxo de automação concluído
   * 'none' = Não está em nenhuma automação
   */
  engageStatus?: 'active' | 'paused' | 'completed' | 'none';

  /**
   * Data da última mensagem automática enviada
   */
  lastEngageMessageAt?: Date;

  // Metadados
  tags: string[];
  assignedTo?: string; // ID do corretor/atendente
  convertedToUserId?: string;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  firstContactAt?: Date;
  lastContactAt?: Date;
}

/**
 * Pipeline - Funil de vendas customizável
 */
export interface Pipeline {
  id: string;
  name: string;
  description?: string;
  type: PipelineType;
  stages: PipelineStage[];
  isDefault: boolean;
  isActive: boolean;

  // Configurações
  automations: PipelineAutomation[];

  // Metadados
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
}

/**
 * PipelineStage - Etapa do funil
 */
export interface PipelineStage {
  id: string;
  pipelineId: string;
  name: string;
  description?: string;
  order: number;
  color: string;

  // Configurações
  probability: number; // 0-100% de chance de fechamento
  maxDaysInStage?: number; // Alerta se passar desse prazo
  requiredFields?: string[]; // Campos obrigatórios para avançar

  // Automações
  onEnterActions?: StageAction[];
  onExitActions?: StageAction[];

  // Estatísticas (calculadas)
  dealCount?: number;
  totalValue?: number;

  // Metadados
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Deal - Negócio/Oportunidade em andamento
 */
export interface Deal {
  id: string;

  // Relacionamentos
  leadId: string;
  pipelineId: string;
  stageId: string;
  propertyId?: string;

  // Dados do Negócio
  title: string;
  description?: string;

  // Valores
  valorAluguel: number;
  valorCondominio?: number;
  valorIPTU?: number;
  valorTotal: number;
  comissao?: number;

  // Status e Prioridade
  status: DealStatus;
  priority: DealPriority;
  probability: number; // 0-100

  // Imóvel de Interesse
  imovelEndereco?: string;
  imovelTipo?: string;
  imovelCaracteristicas?: Record<string, unknown>;

  // Responsável
  assignedTo?: string;

  // Datas
  expectedCloseDate?: Date;
  closedAt?: Date;
  lostReason?: string;

  // Atividades (contagem)
  activityCount: number;
  lastActivityAt?: Date;

  // Tags e Metadata
  tags: string[];
  customFields?: Record<string, unknown>;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  movedAt: Date; // Última movimentação de stage
}

/**
 * Activity - Registro de interação/atividade
 */
export interface Activity {
  id: string;

  // Relacionamentos
  dealId?: string;
  leadId?: string;

  // Tipo e Conteúdo
  type: ActivityType;
  title: string;
  description?: string;

  // Dados da Atividade
  metadata?: Record<string, unknown>;

  // Para chamadas
  callDuration?: number; // segundos
  callRecordingUrl?: string;

  // Para emails
  emailSubject?: string;
  emailBody?: string;

  // Para WhatsApp/Chat
  chatMessages?: ChatMessage[];

  // Para visitas/reuniões
  scheduledAt?: Date;
  location?: string;
  attendees?: string[];

  // Para documentos
  documentUrl?: string;
  documentType?: string;

  // Responsável
  createdBy: string;

  // Automação
  isAutomatic: boolean;
  automationId?: string;

  // Timestamps
  createdAt: Date;
  completedAt?: Date;
}

/**
 * Mensagem de Chat (do Omnichannel)
 */
export interface ChatMessage {
  id: string;
  content: string;
  sender: 'cliente' | 'atendente' | 'bot';
  timestamp: Date;
  channel: string;
  mediaType?: 'text' | 'audio' | 'image' | 'document';
  mediaUrl?: string;
}

// -----------------------------------------------------------------------------
// Configurações e Automações
// -----------------------------------------------------------------------------

/**
 * Automação do Pipeline
 */
export interface PipelineAutomation {
  id: string;
  name: string;
  trigger: AutomationTrigger;
  conditions?: AutomationCondition[];
  actions: AutomationAction[];
  isActive: boolean;
}

export interface AutomationTrigger {
  type: 'stage_enter' | 'stage_exit' | 'deal_created' | 'deal_won' | 'deal_lost' | 'time_in_stage' | 'lead_created';
  stageId?: string;
  daysInStage?: number;
}

export interface AutomationCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'contains' | 'greater_than' | 'less_than';
  value: string | number | boolean;
}

export interface AutomationAction {
  type: 'send_email' | 'send_whatsapp' | 'create_task' | 'update_field' | 'notify_user' | 'webhook' | 'generate_contract';
  config: Record<string, unknown>;
}

export interface StageAction {
  type: 'send_notification' | 'create_activity' | 'update_deal' | 'trigger_webhook' | 'generate_document';
  config: Record<string, unknown>;
}

// -----------------------------------------------------------------------------
// Webhooks e Integração
// -----------------------------------------------------------------------------

/**
 * Configuração de Webhook para ingestão de leads
 */
export interface WebhookConfig {
  id: string;
  name: string;
  source: LeadSource;
  endpoint: string; // URL gerada
  secretKey: string;
  status: WebhookStatus;

  // Mapeamento de campos
  fieldMapping: FieldMapping[];

  // Pipeline destino
  targetPipelineId: string;
  targetStageId: string;

  // Configurações
  autoAssign: boolean;
  assignToUserId?: string;
  defaultTags: string[];
  deduplicateBy: 'email' | 'cpf' | 'telefone' | 'email_telefone';

  // Estatísticas
  totalLeadsReceived: number;
  lastLeadAt?: Date;

  // Metadados
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Mapeamento de campo para webhook
 */
export interface FieldMapping {
  sourceField: string; // Campo no payload do webhook
  targetField: keyof Lead | string; // Campo no Lead
  transform?: 'lowercase' | 'uppercase' | 'trim' | 'phone_format' | 'cpf_format';
  defaultValue?: string;
}

/**
 * Payload genérico de webhook
 */
export interface WebhookPayload {
  source: string;
  timestamp: string;
  data: Record<string, unknown>;
  metadata?: {
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_content?: string;
    utm_term?: string;
    page_url?: string;
    ip_address?: string;
  };
}

/**
 * Payload específico do Facebook Lead Ads
 */
export interface FacebookLeadPayload {
  entry: Array<{
    id: string;
    time: number;
    changes: Array<{
      value: {
        form_id: string;
        leadgen_id: string;
        created_time: number;
        page_id: string;
        ad_id?: string;
        adgroup_id?: string;
        field_data: Array<{
          name: string;
          values: string[];
        }>;
      };
      field: string;
    }>;
  }>;
}

/**
 * Payload específico do Google Ads
 */
export interface GoogleAdsLeadPayload {
  lead_id: string;
  google_key: string;
  campaign_id: string;
  form_id: string;
  column_data: Array<{
    column_name: string;
    string_value?: string;
    double_value?: number;
  }>;
  user_column_data: Array<{
    column_id: string;
    string_value?: string;
  }>;
}

// -----------------------------------------------------------------------------
// DTOs e Requests
// -----------------------------------------------------------------------------

/**
 * DTO para criar Lead
 */
export interface CreateLeadDTO {
  nome: string;
  email?: string;
  telefone: string;
  cpf?: string;
  actorType?: LeadActorType;
  source: LeadSource;

  // UTMs
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;

  // Dados adicionais
  empresa?: string;
  cargo?: string;
  cidade?: string;
  estado?: string;

  // Interesses
  interesseImovel?: string;
  valorMaximo?: number;

  // Chat
  chatHistory?: ChatMessage[];

  // Tags
  tags?: string[];

  // Webhook
  externalId?: string;
  webhookSource?: string;
  rawPayload?: Record<string, unknown>;
}

/**
 * DTO para criar Deal
 */
export interface CreateDealDTO {
  leadId: string;
  pipelineId: string;
  stageId: string;
  title: string;
  valorAluguel: number;
  valorCondominio?: number;
  valorIPTU?: number;
  propertyId?: string;
  assignedTo?: string;
  priority?: DealPriority;
  expectedCloseDate?: Date;
  tags?: string[];
}

/**
 * DTO para mover Deal entre stages
 */
export interface MoveDealDTO {
  dealId: string;
  targetStageId: string;
  note?: string;
}

/**
 * DTO para criar Activity
 */
export interface CreateActivityDTO {
  dealId?: string;
  leadId?: string;
  type: ActivityType;
  title: string;
  description?: string;
  scheduledAt?: Date;
  metadata?: Record<string, unknown>;
}

// -----------------------------------------------------------------------------
// Resultados de Ingestão
// -----------------------------------------------------------------------------

/**
 * Resultado do processamento de webhook
 */
export interface IngestionResult {
  success: boolean;
  leadId?: string;
  dealId?: string;
  isDuplicate: boolean;
  action: 'created' | 'updated' | 'skipped';
  message: string;
  errors?: string[];
}

// -----------------------------------------------------------------------------
// Estatísticas e Analytics
// -----------------------------------------------------------------------------

/**
 * Estatísticas do Pipeline
 */
export interface PipelineStats {
  pipelineId: string;
  totalDeals: number;
  totalValue: number;
  avgDealValue: number;
  avgTimeToClose: number; // dias
  conversionRate: number; // %
  stageStats: StageStats[];
}

/**
 * Estatísticas por Stage
 */
export interface StageStats {
  stageId: string;
  stageName: string;
  dealCount: number;
  totalValue: number;
  avgDaysInStage: number;
  conversionToNext: number; // %
}

/**
 * Estatísticas gerais do CRM
 */
export interface CRMStats {
  totalLeads: number;
  totalDeals: number;
  totalWon: number;
  totalLost: number;
  totalValue: number;
  wonValue: number;
  conversionRate: number;
  avgDealSize: number;
  leadsBySource: Record<LeadSource, number>;
  dealsByStatus: Record<DealStatus, number>;
  monthlyTrend: MonthlyTrend[];
}

export interface MonthlyTrend {
  month: string;
  leads: number;
  deals: number;
  won: number;
  value: number;
}

// -----------------------------------------------------------------------------
// Estado do Kanban (UI)
// -----------------------------------------------------------------------------

/**
 * Estado do Board Kanban
 */
export interface KanbanState {
  pipeline: Pipeline | null;
  columns: KanbanColumn[];
  isLoading: boolean;
  error: string | null;
  filters: KanbanFilters;
  selectedDeal: Deal | null;
}

/**
 * Coluna do Kanban (com deals)
 */
export interface KanbanColumn {
  stage: PipelineStage;
  deals: Deal[];
  isCollapsed: boolean;
}

/**
 * Filtros do Kanban
 */
export interface KanbanFilters {
  search: string;
  assignedTo: string[];
  priority: DealPriority[];
  tags: string[];
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
}

// -----------------------------------------------------------------------------
// Exports de constantes
// -----------------------------------------------------------------------------

export const LEAD_SOURCES_LABELS: Record<LeadSource, string> = {
  landing_page: 'Landing Page',
  facebook_ads: 'Facebook Ads',
  instagram_ads: 'Instagram Ads',
  google_ads: 'Google Ads',
  whatsapp: 'WhatsApp',
  omnichannel: 'Omnichannel',
  indicacao: 'Indicação',
  organico: 'Orgânico',
  evento: 'Evento',
  parceiro: 'Parceiro',
  outro: 'Outro',
};

export const DEAL_STATUS_LABELS: Record<DealStatus, string> = {
  aberto: 'Aberto',
  em_negociacao: 'Em Negociação',
  documentacao: 'Documentação',
  contrato: 'Contrato',
  ganho: 'Ganho',
  perdido: 'Perdido',
};

export const ACTIVITY_TYPE_LABELS: Record<ActivityType, string> = {
  chamada: 'Chamada',
  email: 'E-mail',
  whatsapp: 'WhatsApp',
  visita: 'Visita',
  reuniao: 'Reunião',
  documento: 'Documento',
  contrato: 'Contrato',
  nota: 'Nota',
  sistema: 'Sistema',
  automacao: 'Automação',
};

export const PRIORITY_LABELS: Record<DealPriority, string> = {
  baixa: 'Baixa',
  media: 'Média',
  alta: 'Alta',
  urgente: 'Urgente',
};

export const PRIORITY_COLORS: Record<DealPriority, string> = {
  baixa: 'bg-slate-100 text-slate-700',
  media: 'bg-blue-100 text-blue-700',
  alta: 'bg-orange-100 text-orange-700',
  urgente: 'bg-red-100 text-red-700',
};

export const DEFAULT_PIPELINE_STAGES: Omit<PipelineStage, 'id' | 'pipelineId' | 'createdAt' | 'updatedAt'>[] = [
  { name: 'Novo', order: 0, color: '#6366f1', probability: 10 },
  { name: 'Qualificação', order: 1, color: '#8b5cf6', probability: 20 },
  { name: 'Visita Agendada', order: 2, color: '#3b82f6', probability: 40 },
  { name: 'Visita Realizada', order: 3, color: '#0ea5e9', probability: 60 },
  { name: 'Documentação', order: 4, color: '#14b8a6', probability: 75 },
  { name: 'Contrato Enviado', order: 5, color: '#22c55e', probability: 90 },
  { name: 'Ganho', order: 6, color: '#10b981', probability: 100 },
  { name: 'Perdido', order: 7, color: '#ef4444', probability: 0 },
];
