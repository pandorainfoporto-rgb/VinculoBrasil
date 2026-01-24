// =============================================================================
// Vínculo Engage - Marketing Automation Types
// =============================================================================

// -----------------------------------------------------------------------------
// Enums e Constantes
// -----------------------------------------------------------------------------

export type CampaignStatus = 'draft' | 'scheduled' | 'sending' | 'completed' | 'paused' | 'failed';
export type CampaignType = 'one_time' | 'automated' | 'sequence';
export type ChannelType = 'email' | 'whatsapp' | 'sms';
export type TriggerType =
  | 'manual'
  | 'birthday'
  | 'due_date_reminder'
  | 'onboarding_day_1'
  | 'onboarding_day_3'
  | 'onboarding_day_7'
  | 'contract_signed'
  | 'payment_received'
  | 'payment_overdue'
  // =============================================================================
  // TRIGGERS DE INTEGRAÇÃO COM CRM
  // =============================================================================
  | 'crm_lead_created'        // Novo lead captado no CRM
  | 'crm_stage_changed'       // Lead moveu de stage no Kanban
  | 'crm_deal_created'        // Deal/Negócio criado
  | 'crm_deal_won'            // Deal ganho
  | 'crm_deal_lost'           // Deal perdido
  | 'crm_lead_qualified'      // Lead marcado como qualificado
  | 'crm_no_contact_3_days'   // Sem contato há 3 dias
  | 'crm_no_contact_7_days'   // Sem contato há 7 dias
  | 'crm_visit_scheduled'     // Visita agendada
  | 'crm_visit_completed';    // Visita realizada

export type MessageStatus = 'pending' | 'queued' | 'sending' | 'sent' | 'delivered' | 'failed' | 'bounced';
export type SegmentOperator = 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than' | 'in' | 'not_in' | 'is_empty' | 'is_not_empty';

export const CAMPAIGN_STATUS_LABELS: Record<CampaignStatus, string> = {
  draft: 'Rascunho',
  scheduled: 'Agendada',
  sending: 'Enviando',
  completed: 'Concluída',
  paused: 'Pausada',
  failed: 'Falhou',
};

export const CAMPAIGN_STATUS_COLORS: Record<CampaignStatus, string> = {
  draft: 'bg-slate-100 text-slate-700',
  scheduled: 'bg-blue-100 text-blue-700',
  sending: 'bg-yellow-100 text-yellow-700',
  completed: 'bg-green-100 text-green-700',
  paused: 'bg-orange-100 text-orange-700',
  failed: 'bg-red-100 text-red-700',
};

export const CAMPAIGN_TYPE_LABELS: Record<CampaignType, string> = {
  one_time: 'Disparo Único',
  automated: 'Automatizada',
  sequence: 'Sequência',
};

export const CHANNEL_TYPE_LABELS: Record<ChannelType, string> = {
  email: 'E-mail',
  whatsapp: 'WhatsApp',
  sms: 'SMS',
};

export const CHANNEL_TYPE_ICONS: Record<ChannelType, string> = {
  email: 'Mail',
  whatsapp: 'MessageCircle',
  sms: 'Smartphone',
};

export const TRIGGER_TYPE_LABELS: Record<TriggerType, string> = {
  manual: 'Disparo Manual',
  birthday: 'Aniversário',
  due_date_reminder: 'Lembrete de Vencimento',
  onboarding_day_1: 'Onboarding - Dia 1',
  onboarding_day_3: 'Onboarding - Dia 3',
  onboarding_day_7: 'Onboarding - Dia 7',
  contract_signed: 'Contrato Assinado',
  payment_received: 'Pagamento Recebido',
  payment_overdue: 'Pagamento Atrasado',
  // Triggers de Integração CRM
  crm_lead_created: 'CRM: Novo Lead Captado',
  crm_stage_changed: 'CRM: Mudança de Etapa',
  crm_deal_created: 'CRM: Negócio Criado',
  crm_deal_won: 'CRM: Negócio Ganho',
  crm_deal_lost: 'CRM: Negócio Perdido',
  crm_lead_qualified: 'CRM: Lead Qualificado',
  crm_no_contact_3_days: 'CRM: Sem Contato (3 dias)',
  crm_no_contact_7_days: 'CRM: Sem Contato (7 dias)',
  crm_visit_scheduled: 'CRM: Visita Agendada',
  crm_visit_completed: 'CRM: Visita Realizada',
};

export const MESSAGE_STATUS_LABELS: Record<MessageStatus, string> = {
  pending: 'Pendente',
  queued: 'Na Fila',
  sending: 'Enviando',
  sent: 'Enviado',
  delivered: 'Entregue',
  failed: 'Falhou',
  bounced: 'Rejeitado',
};

export const MESSAGE_STATUS_COLORS: Record<MessageStatus, string> = {
  pending: 'bg-slate-100 text-slate-700',
  queued: 'bg-blue-100 text-blue-700',
  sending: 'bg-yellow-100 text-yellow-700',
  sent: 'bg-cyan-100 text-cyan-700',
  delivered: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
  bounced: 'bg-orange-100 text-orange-700',
};

// Variáveis disponíveis para templates
export const TEMPLATE_VARIABLES = [
  { key: '{{lead.name}}', label: 'Nome do Lead', category: 'lead' },
  { key: '{{lead.email}}', label: 'E-mail do Lead', category: 'lead' },
  { key: '{{lead.phone}}', label: 'Telefone do Lead', category: 'lead' },
  { key: '{{lead.company}}', label: 'Empresa do Lead', category: 'lead' },
  { key: '{{tenant.name}}', label: 'Nome do Inquilino', category: 'tenant' },
  { key: '{{tenant.email}}', label: 'E-mail do Inquilino', category: 'tenant' },
  { key: '{{tenant.cpf}}', label: 'CPF do Inquilino', category: 'tenant' },
  { key: '{{landlord.name}}', label: 'Nome do Proprietário', category: 'landlord' },
  { key: '{{contract.value}}', label: 'Valor do Aluguel', category: 'contract' },
  { key: '{{contract.due_date}}', label: 'Data de Vencimento', category: 'contract' },
  { key: '{{contract.address}}', label: 'Endereço do Imóvel', category: 'contract' },
  { key: '{{boleto.url}}', label: 'Link do Boleto', category: 'billing' },
  { key: '{{boleto.barcode}}', label: 'Código de Barras', category: 'billing' },
  { key: '{{boleto.value}}', label: 'Valor do Boleto', category: 'billing' },
  { key: '{{pix.code}}', label: 'Código PIX Copia e Cola', category: 'billing' },
  { key: '{{company.name}}', label: 'Nome da Imobiliária', category: 'company' },
  { key: '{{company.phone}}', label: 'Telefone da Imobiliária', category: 'company' },
  { key: '{{current_date}}', label: 'Data Atual', category: 'system' },
  { key: '{{current_month}}', label: 'Mês Atual', category: 'system' },
];

export const VARIABLE_CATEGORIES = {
  lead: 'Lead/Prospect',
  tenant: 'Inquilino',
  landlord: 'Proprietário',
  contract: 'Contrato',
  billing: 'Cobrança',
  company: 'Imobiliária',
  system: 'Sistema',
};

// -----------------------------------------------------------------------------
// Interfaces Principais
// -----------------------------------------------------------------------------

// Configuração SMTP
export interface SmtpConfig {
  id: string;
  name: string;
  host: string;
  port: number;
  user: string;
  password: string;
  secure: boolean; // true = SSL/TLS
  fromEmail: string;
  fromName: string;
  isDefault: boolean;
  isActive: boolean;
  lastTestedAt?: Date;
  lastTestResult?: 'success' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}

// Template de Mensagem
export interface MessageTemplate {
  id: string;
  name: string;
  channel: ChannelType;
  subject?: string; // Apenas para email
  htmlContent?: string; // Corpo HTML para email
  textContent: string; // Corpo texto (WhatsApp/SMS ou versão plaintext do email)
  previewText?: string; // Preview text do email
  category: string;
  tags: string[];
  variables: string[]; // Lista de variáveis usadas
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// Regra de Segmentação
export interface SegmentRule {
  id: string;
  field: string;
  operator: SegmentOperator;
  value: string | number | boolean | string[];
  logicalOperator?: 'AND' | 'OR';
}

// Segmento de Audiência
export interface AudienceSegment {
  id: string;
  name: string;
  description?: string;
  entityType: 'lead' | 'tenant' | 'landlord' | 'guarantor' | 'all';
  rules: SegmentRule[];
  estimatedCount?: number;
  lastCalculatedAt?: Date;
  isActive: boolean;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// Campanha de Marketing
export interface MarketingCampaign {
  id: string;
  name: string;
  description?: string;
  type: CampaignType;
  channel: ChannelType;
  status: CampaignStatus;

  // Template e Segmento
  templateId: string;
  template?: MessageTemplate;
  segmentId: string;
  segment?: AudienceSegment;

  // Agendamento
  triggerType: TriggerType;
  scheduledAt?: Date;
  triggerDaysBefore?: number; // Para lembretes de vencimento
  triggerTime?: string; // HH:MM para disparos automáticos

  // Configurações de envio
  smtpConfigId?: string;
  smtpConfig?: SmtpConfig;
  batchSize: number; // Envios por lote
  batchDelayMs: number; // Delay entre lotes (ms)
  maxRetries: number;

  // Métricas
  totalRecipients: number;
  sentCount: number;
  deliveredCount: number;
  openedCount: number;
  clickedCount: number;
  failedCount: number;
  bouncedCount: number;

  // Datas
  startedAt?: Date;
  completedAt?: Date;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

// Registro de Envio Individual
export interface CampaignMessage {
  id: string;
  campaignId: string;
  recipientId: string;
  recipientType: 'lead' | 'tenant' | 'landlord' | 'guarantor';
  recipientEmail?: string;
  recipientPhone?: string;
  recipientName: string;

  // Status e Tracking
  status: MessageStatus;
  sentAt?: Date;
  deliveredAt?: Date;
  openedAt?: Date;
  clickedAt?: Date;
  errorMessage?: string;
  retryCount: number;

  // Conteúdo renderizado
  renderedSubject?: string;
  renderedContent?: string;

  createdAt: Date;
  updatedAt: Date;
}

// Régua de Comunicação (Sequência Automatizada)
export interface CommunicationRule {
  id: string;
  name: string;
  description?: string;
  triggerType: TriggerType;
  isActive: boolean;

  // Passos da régua
  steps: CommunicationStep[];

  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CommunicationStep {
  id: string;
  order: number;
  name: string;
  channel: ChannelType;
  templateId: string;
  template?: MessageTemplate;
  delayDays: number; // Dias após o trigger
  delayHours: number; // Horas após os dias
  sendTime?: string; // HH:MM específico
  conditions?: SegmentRule[]; // Condições adicionais
  isActive: boolean;
}

// Job da Fila
export interface QueueJob {
  id: string;
  campaignId: string;
  messageId: string;
  channel: ChannelType;
  priority: number;
  attempts: number;
  maxAttempts: number;
  status: 'waiting' | 'active' | 'completed' | 'failed' | 'delayed';
  scheduledFor?: Date;
  processedAt?: Date;
  failedReason?: string;
  createdAt: Date;
}

// Estatísticas de Fila
export interface QueueStats {
  waiting: number;
  active: number;
  completed: number;
  failed: number;
  delayed: number;
  paused: boolean;
}

// -----------------------------------------------------------------------------
// Interfaces para Formulários
// -----------------------------------------------------------------------------

export interface CampaignFormData {
  name: string;
  description?: string;
  type: CampaignType;
  channel: ChannelType;
  templateId: string;
  segmentId: string;
  triggerType: TriggerType;
  scheduledAt?: Date;
  triggerDaysBefore?: number;
  triggerTime?: string;
  smtpConfigId?: string;
  batchSize: number;
  batchDelayMs: number;
  maxRetries: number;
}

export interface TemplateFormData {
  name: string;
  channel: ChannelType;
  subject?: string;
  htmlContent?: string;
  textContent: string;
  previewText?: string;
  category: string;
  tags: string[];
}

export interface SegmentFormData {
  name: string;
  description?: string;
  entityType: 'lead' | 'tenant' | 'landlord' | 'guarantor' | 'all';
  rules: SegmentRule[];
}

export interface SmtpConfigFormData {
  name: string;
  host: string;
  port: number;
  user: string;
  password: string;
  secure: boolean;
  fromEmail: string;
  fromName: string;
  isDefault: boolean;
}

// -----------------------------------------------------------------------------
// Dashboard e Métricas
// -----------------------------------------------------------------------------

export interface EngageDashboardStats {
  totalCampaigns: number;
  activeCampaigns: number;
  totalSent: number;
  totalDelivered: number;
  deliveryRate: number;
  openRate: number;
  clickRate: number;
  bounceRate: number;

  // Por canal
  emailStats: {
    sent: number;
    delivered: number;
    opened: number;
    clicked: number;
  };
  whatsappStats: {
    sent: number;
    delivered: number;
    read: number;
    replied: number;
  };

  // Tendências (últimos 7 dias)
  dailyStats: {
    date: string;
    sent: number;
    delivered: number;
    opened: number;
  }[];

  // Campanhas recentes
  recentCampaigns: MarketingCampaign[];

  // Status da fila
  queueStats: QueueStats;
}
