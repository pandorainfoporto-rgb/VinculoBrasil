// =============================================================================
// Lead Ingestion Service - Motor de Ingestão de Leads
// =============================================================================
// Este serviço processa leads de múltiplas fontes (webhooks) e os insere no CRM.
// Suporta: Facebook Ads, Google Ads, Landing Pages, Omnichannel e outros.
// =============================================================================

import {
  type Lead,
  type Deal,
  type Activity,
  type CreateLeadDTO,
  type IngestionResult,
  type WebhookPayload,
  type FacebookLeadPayload,
  type GoogleAdsLeadPayload,
  type WebhookConfig,
  type FieldMapping,
  type LeadSource,
  type LeadActorType,
  type ChatMessage,
} from '../types';

// -----------------------------------------------------------------------------
// Tipos Internos
// -----------------------------------------------------------------------------

interface ProcessedLeadData {
  nome: string;
  email?: string;
  telefone: string;
  cpf?: string;
  source: LeadSource;
  actorType: LeadActorType;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  cidade?: string;
  estado?: string;
  interesseImovel?: string;
  valorMaximo?: number;
  externalId?: string;
  chatHistory?: ChatMessage[];
  tags: string[];
  rawPayload: Record<string, unknown>;
}

// -----------------------------------------------------------------------------
// Simulação de Banco de Dados (em produção: Prisma/PostgreSQL)
// -----------------------------------------------------------------------------

let leadsDb: Lead[] = [];
let dealsDb: Deal[] = [];
let activitiesDb: Activity[] = [];

// -----------------------------------------------------------------------------
// Lead Ingestion Service
// -----------------------------------------------------------------------------

export class LeadIngestionService {
  private webhookConfigs: Map<string, WebhookConfig> = new Map();

  constructor() {
    this.initializeDefaultWebhooks();
  }

  // ---------------------------------------------------------------------------
  // Configuração de Webhooks
  // ---------------------------------------------------------------------------

  private initializeDefaultWebhooks(): void {
    // Webhook padrão para Facebook Ads
    this.webhookConfigs.set('facebook', {
      id: 'wh_facebook',
      name: 'Facebook Lead Ads',
      source: 'facebook_ads',
      endpoint: '/api/crm/leads/webhook/facebook',
      secretKey: 'fb_secret_key_123',
      status: 'ativo',
      fieldMapping: [
        { sourceField: 'full_name', targetField: 'nome' },
        { sourceField: 'email', targetField: 'email', transform: 'lowercase' },
        { sourceField: 'phone_number', targetField: 'telefone', transform: 'phone_format' },
        { sourceField: 'city', targetField: 'cidade' },
        { sourceField: 'state', targetField: 'estado' },
      ],
      targetPipelineId: 'pipeline_inquilino',
      targetStageId: 'stage_novo',
      autoAssign: false,
      defaultTags: ['facebook', 'ads'],
      deduplicateBy: 'email_telefone',
      totalLeadsReceived: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Webhook para Google Ads
    this.webhookConfigs.set('google', {
      id: 'wh_google',
      name: 'Google Ads Leads',
      source: 'google_ads',
      endpoint: '/api/crm/leads/webhook/google',
      secretKey: 'google_secret_key_456',
      status: 'ativo',
      fieldMapping: [
        { sourceField: 'FULL_NAME', targetField: 'nome' },
        { sourceField: 'EMAIL', targetField: 'email', transform: 'lowercase' },
        { sourceField: 'PHONE_NUMBER', targetField: 'telefone', transform: 'phone_format' },
      ],
      targetPipelineId: 'pipeline_inquilino',
      targetStageId: 'stage_novo',
      autoAssign: false,
      defaultTags: ['google', 'ads'],
      deduplicateBy: 'email',
      totalLeadsReceived: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Webhook para Landing Page
    this.webhookConfigs.set('landing', {
      id: 'wh_landing',
      name: 'Landing Page',
      source: 'landing_page',
      endpoint: '/api/crm/leads/webhook/landing',
      secretKey: 'landing_secret_789',
      status: 'ativo',
      fieldMapping: [
        { sourceField: 'name', targetField: 'nome' },
        { sourceField: 'email', targetField: 'email', transform: 'lowercase' },
        { sourceField: 'phone', targetField: 'telefone', transform: 'phone_format' },
        { sourceField: 'cpf', targetField: 'cpf', transform: 'cpf_format' },
        { sourceField: 'interest', targetField: 'interesseImovel' },
        { sourceField: 'budget', targetField: 'valorMaximo' },
      ],
      targetPipelineId: 'pipeline_inquilino',
      targetStageId: 'stage_novo',
      autoAssign: true,
      defaultTags: ['landing', 'site'],
      deduplicateBy: 'email_telefone',
      totalLeadsReceived: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Webhook para Omnichannel
    this.webhookConfigs.set('omnichannel', {
      id: 'wh_omnichannel',
      name: 'Omnichannel (Chatbot)',
      source: 'omnichannel',
      endpoint: '/api/crm/leads/webhook/omnichannel',
      secretKey: 'omni_secret_abc',
      status: 'ativo',
      fieldMapping: [
        { sourceField: 'lead_nome', targetField: 'nome' },
        { sourceField: 'lead_email', targetField: 'email', transform: 'lowercase' },
        { sourceField: 'lead_celular', targetField: 'telefone', transform: 'phone_format' },
        { sourceField: 'lead_cpf', targetField: 'cpf', transform: 'cpf_format' },
      ],
      targetPipelineId: 'pipeline_inquilino',
      targetStageId: 'stage_novo',
      autoAssign: true,
      defaultTags: ['omnichannel', 'whatsapp'],
      deduplicateBy: 'cpf',
      totalLeadsReceived: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  // ---------------------------------------------------------------------------
  // Processamento de Webhook Genérico
  // ---------------------------------------------------------------------------

  async processWebhook(
    webhookId: string,
    payload: WebhookPayload | FacebookLeadPayload | GoogleAdsLeadPayload | Record<string, unknown>
  ): Promise<IngestionResult> {
    try {
      console.log('[LeadIngestion] Processing webhook:', webhookId, payload);

      const config = this.webhookConfigs.get(webhookId);
      if (!config) {
        return {
          success: false,
          isDuplicate: false,
          action: 'skipped',
          message: `Webhook ${webhookId} não configurado`,
          errors: ['Webhook configuration not found'],
        };
      }

      // Detectar e processar tipo de payload
      let processedData: ProcessedLeadData;

      if (this.isFacebookPayload(payload)) {
        processedData = this.processFacebookPayload(payload as FacebookLeadPayload, config);
      } else if (this.isGoogleAdsPayload(payload)) {
        processedData = this.processGoogleAdsPayload(payload as GoogleAdsLeadPayload, config);
      } else if (this.isOmnichannelPayload(payload)) {
        processedData = this.processOmnichannelPayload(payload as Record<string, unknown>, config);
      } else {
        processedData = this.processGenericPayload(payload as WebhookPayload, config);
      }

      // Verificar duplicidade
      const duplicateCheck = await this.checkDuplicate(processedData, config.deduplicateBy);

      if (duplicateCheck.isDuplicate && duplicateCheck.existingLead) {
        // Atualizar lead existente
        const updatedLead = await this.updateExistingLead(duplicateCheck.existingLead, processedData);

        return {
          success: true,
          leadId: updatedLead.id,
          isDuplicate: true,
          action: 'updated',
          message: 'Lead existente atualizado com novos dados',
        };
      }

      // Criar novo lead
      const newLead = await this.createLead(processedData);

      // Criar deal na primeira coluna do funil
      const deal = await this.createDealFromLead(newLead, config);

      // Se veio do omnichannel, anexar histórico do chat
      if (processedData.chatHistory && processedData.chatHistory.length > 0) {
        await this.attachChatHistory(deal.id, newLead.id, processedData.chatHistory);
      }

      // Atualizar estatísticas do webhook
      config.totalLeadsReceived++;
      config.lastLeadAt = new Date();

      return {
        success: true,
        leadId: newLead.id,
        dealId: deal.id,
        isDuplicate: false,
        action: 'created',
        message: 'Lead e Deal criados com sucesso',
      };
    } catch (error) {
      console.error('[LeadIngestion] Error processing webhook:', error);
      return {
        success: false,
        isDuplicate: false,
        action: 'skipped',
        message: 'Erro ao processar webhook',
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }

  // ---------------------------------------------------------------------------
  // Detecção de Tipo de Payload
  // ---------------------------------------------------------------------------

  private isFacebookPayload(payload: unknown): payload is FacebookLeadPayload {
    return (
      typeof payload === 'object' &&
      payload !== null &&
      'entry' in payload &&
      Array.isArray((payload as FacebookLeadPayload).entry)
    );
  }

  private isGoogleAdsPayload(payload: unknown): payload is GoogleAdsLeadPayload {
    return (
      typeof payload === 'object' &&
      payload !== null &&
      'lead_id' in payload &&
      'google_key' in payload &&
      'column_data' in payload
    );
  }

  private isOmnichannelPayload(payload: unknown): boolean {
    return (
      typeof payload === 'object' &&
      payload !== null &&
      ('lead_data' in payload || 'chat_history' in payload || 'flow_variables' in payload)
    );
  }

  // ---------------------------------------------------------------------------
  // Processamento por Fonte
  // ---------------------------------------------------------------------------

  private processFacebookPayload(
    payload: FacebookLeadPayload,
    config: WebhookConfig
  ): ProcessedLeadData {
    const entry = payload.entry[0];
    const change = entry?.changes[0];
    const leadData = change?.value;

    if (!leadData) {
      throw new Error('Facebook payload inválido: sem dados de lead');
    }

    // Mapear campos do Facebook
    const fieldData = new Map<string, string>();
    leadData.field_data.forEach((field) => {
      fieldData.set(field.name.toLowerCase(), field.values[0] || '');
    });

    const data: ProcessedLeadData = {
      nome: fieldData.get('full_name') || fieldData.get('nome') || 'Sem Nome',
      email: fieldData.get('email'),
      telefone: this.formatPhone(fieldData.get('phone_number') || ''),
      source: 'facebook_ads',
      actorType: 'inquilino',
      cidade: fieldData.get('city'),
      estado: fieldData.get('state'),
      interesseImovel: fieldData.get('interest') || fieldData.get('interesse'),
      externalId: leadData.leadgen_id,
      tags: [...config.defaultTags],
      rawPayload: payload as unknown as Record<string, unknown>,
    };

    // Aplicar transformações
    return this.applyFieldMappingTransforms(data, config.fieldMapping);
  }

  private processGoogleAdsPayload(
    payload: GoogleAdsLeadPayload,
    config: WebhookConfig
  ): ProcessedLeadData {
    const columnData = new Map<string, string>();
    payload.column_data.forEach((col) => {
      columnData.set(col.column_name.toUpperCase(), col.string_value || String(col.double_value || ''));
    });

    const data: ProcessedLeadData = {
      nome: columnData.get('FULL_NAME') || columnData.get('NAME') || 'Sem Nome',
      email: columnData.get('EMAIL'),
      telefone: this.formatPhone(columnData.get('PHONE_NUMBER') || ''),
      source: 'google_ads',
      actorType: 'inquilino',
      cidade: columnData.get('CITY'),
      estado: columnData.get('STATE'),
      externalId: payload.lead_id,
      tags: [...config.defaultTags, `campaign_${payload.campaign_id}`],
      rawPayload: payload as unknown as Record<string, unknown>,
    };

    return this.applyFieldMappingTransforms(data, config.fieldMapping);
  }

  private processOmnichannelPayload(
    payload: Record<string, unknown>,
    config: WebhookConfig
  ): ProcessedLeadData {
    // Dados do lead podem vir de flow_variables ou lead_data
    const leadData = (payload.lead_data || payload.flow_variables || payload) as Record<string, unknown>;
    const chatHistory = payload.chat_history as ChatMessage[] | undefined;

    const data: ProcessedLeadData = {
      nome: String(leadData.lead_nome || leadData.nome || 'Sem Nome'),
      email: leadData.lead_email as string | undefined || leadData.email as string | undefined,
      telefone: this.formatPhone(String(leadData.lead_celular || leadData.telefone || '')),
      cpf: this.formatCPF(String(leadData.lead_cpf || leadData.cpf || '')),
      source: 'omnichannel',
      actorType: this.detectActorType(leadData),
      interesseImovel: leadData.interesse_imovel as string | undefined,
      valorMaximo: leadData.valor_maximo as number | undefined,
      chatHistory: chatHistory || [],
      tags: [...config.defaultTags],
      rawPayload: payload,
    };

    // Adicionar tags baseadas no contexto do chat
    if (leadData.client_type) {
      data.tags.push(String(leadData.client_type));
    }

    return this.applyFieldMappingTransforms(data, config.fieldMapping);
  }

  private processGenericPayload(
    payload: WebhookPayload,
    config: WebhookConfig
  ): ProcessedLeadData {
    const { data, metadata } = payload;

    const processedData: ProcessedLeadData = {
      nome: String(data.name || data.nome || 'Sem Nome'),
      email: data.email as string | undefined,
      telefone: this.formatPhone(String(data.phone || data.telefone || '')),
      cpf: data.cpf as string | undefined,
      source: config.source,
      actorType: 'inquilino',
      utmSource: metadata?.utm_source,
      utmMedium: metadata?.utm_medium,
      utmCampaign: metadata?.utm_campaign,
      utmContent: metadata?.utm_content,
      utmTerm: metadata?.utm_term,
      cidade: data.city as string | undefined || data.cidade as string | undefined,
      estado: data.state as string | undefined || data.estado as string | undefined,
      interesseImovel: data.interest as string | undefined || data.interesse as string | undefined,
      valorMaximo: data.budget as number | undefined || data.valor_maximo as number | undefined,
      externalId: data.external_id as string | undefined,
      tags: [...config.defaultTags],
      rawPayload: payload as unknown as Record<string, unknown>,
    };

    return this.applyFieldMappingTransforms(processedData, config.fieldMapping);
  }

  // ---------------------------------------------------------------------------
  // Transformações e Formatação
  // ---------------------------------------------------------------------------

  private applyFieldMappingTransforms(
    data: ProcessedLeadData,
    mappings: FieldMapping[]
  ): ProcessedLeadData {
    const result = { ...data };

    for (const mapping of mappings) {
      const fieldKey = mapping.targetField as keyof ProcessedLeadData;
      const value = result[fieldKey];

      if (value && typeof value === 'string') {
        switch (mapping.transform) {
          case 'lowercase':
            (result as Record<string, unknown>)[fieldKey] = value.toLowerCase();
            break;
          case 'uppercase':
            (result as Record<string, unknown>)[fieldKey] = value.toUpperCase();
            break;
          case 'trim':
            (result as Record<string, unknown>)[fieldKey] = value.trim();
            break;
          case 'phone_format':
            (result as Record<string, unknown>)[fieldKey] = this.formatPhone(value);
            break;
          case 'cpf_format':
            (result as Record<string, unknown>)[fieldKey] = this.formatCPF(value);
            break;
        }
      }
    }

    return result;
  }

  private formatPhone(phone: string): string {
    const digits = phone.replace(/\D/g, '');

    // Adicionar código do Brasil se não tiver
    if (digits.length === 11) {
      return `+55${digits}`;
    }
    if (digits.length === 10) {
      return `+55${digits}`;
    }
    if (digits.length === 13 && digits.startsWith('55')) {
      return `+${digits}`;
    }

    return digits;
  }

  private formatCPF(cpf: string): string {
    const digits = cpf.replace(/\D/g, '');
    if (digits.length !== 11) return digits;

    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
  }

  private detectActorType(data: Record<string, unknown>): LeadActorType {
    const clientType = String(data.client_type || data.tipo_cliente || '').toLowerCase();

    if (clientType.includes('proprietario') || clientType.includes('locador')) {
      return 'locador';
    }
    if (clientType.includes('garantidor') || clientType.includes('fiador')) {
      return 'garantidor';
    }
    if (clientType.includes('inquilino') || clientType.includes('locatario')) {
      return 'inquilino';
    }

    return 'prospect';
  }

  // ---------------------------------------------------------------------------
  // Verificação de Duplicidade
  // ---------------------------------------------------------------------------

  private async checkDuplicate(
    data: ProcessedLeadData,
    deduplicateBy: 'email' | 'cpf' | 'telefone' | 'email_telefone'
  ): Promise<{ isDuplicate: boolean; existingLead?: Lead }> {
    let existingLead: Lead | undefined;

    switch (deduplicateBy) {
      case 'email':
        if (data.email) {
          existingLead = leadsDb.find((l) => l.email === data.email);
        }
        break;
      case 'cpf':
        if (data.cpf) {
          existingLead = leadsDb.find((l) => l.cpf === data.cpf);
        }
        break;
      case 'telefone':
        if (data.telefone) {
          existingLead = leadsDb.find((l) => l.telefone === data.telefone);
        }
        break;
      case 'email_telefone':
        if (data.email || data.telefone) {
          existingLead = leadsDb.find(
            (l) =>
              (data.email && l.email === data.email) ||
              (data.telefone && l.telefone === data.telefone)
          );
        }
        break;
    }

    return {
      isDuplicate: !!existingLead,
      existingLead,
    };
  }

  // ---------------------------------------------------------------------------
  // CRUD de Leads
  // ---------------------------------------------------------------------------

  private async createLead(data: ProcessedLeadData): Promise<Lead> {
    const now = new Date();
    const lead: Lead = {
      id: `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      nome: data.nome,
      email: data.email || '',
      telefone: data.telefone,
      cpf: data.cpf,
      actorType: data.actorType,
      status: 'novo',
      source: data.source,
      score: this.calculateInitialScore(data),
      temperature: 'frio',
      utmSource: data.utmSource,
      utmMedium: data.utmMedium,
      utmCampaign: data.utmCampaign,
      utmContent: data.utmContent,
      utmTerm: data.utmTerm,
      cidade: data.cidade,
      estado: data.estado,
      interesseImovel: data.interesseImovel,
      valorMaximo: data.valorMaximo,
      externalId: data.externalId,
      webhookSource: data.source,
      rawPayload: data.rawPayload,
      chatHistory: data.chatHistory,
      tags: data.tags,
      createdAt: now,
      updatedAt: now,
      firstContactAt: now,
    };

    leadsDb.push(lead);
    console.log('[LeadIngestion] Lead created:', lead.id);

    return lead;
  }

  private async updateExistingLead(
    existingLead: Lead,
    newData: ProcessedLeadData
  ): Promise<Lead> {
    const updatedLead: Lead = {
      ...existingLead,
      // Atualizar apenas campos vazios ou novos
      telefone: newData.telefone || existingLead.telefone,
      cpf: newData.cpf || existingLead.cpf,
      cidade: newData.cidade || existingLead.cidade,
      estado: newData.estado || existingLead.estado,
      interesseImovel: newData.interesseImovel || existingLead.interesseImovel,
      valorMaximo: newData.valorMaximo || existingLead.valorMaximo,
      // Mesclar tags
      tags: [...new Set([...existingLead.tags, ...newData.tags])],
      // Mesclar histórico de chat
      chatHistory: [
        ...(existingLead.chatHistory || []),
        ...(newData.chatHistory || []),
      ],
      // Atualizar score
      score: Math.max(existingLead.score, this.calculateInitialScore(newData)),
      // Atualizar temperatura
      temperature: this.calculateTemperature(existingLead),
      updatedAt: new Date(),
      lastContactAt: new Date(),
    };

    const index = leadsDb.findIndex((l) => l.id === existingLead.id);
    if (index >= 0) {
      leadsDb[index] = updatedLead;
    }

    console.log('[LeadIngestion] Lead updated:', updatedLead.id);

    return updatedLead;
  }

  private calculateInitialScore(data: ProcessedLeadData): number {
    let score = 20; // Base

    // Pontuação por dados preenchidos
    if (data.email) score += 15;
    if (data.telefone) score += 15;
    if (data.cpf) score += 20;
    if (data.interesseImovel) score += 10;
    if (data.valorMaximo) score += 10;
    if (data.cidade) score += 5;

    // Pontuação por fonte
    switch (data.source) {
      case 'omnichannel':
        score += 15; // Engajou com o bot
        break;
      case 'landing_page':
        score += 10; // Preencheu formulário
        break;
      case 'facebook_ads':
      case 'instagram_ads':
      case 'google_ads':
        score += 5; // Clicou no anúncio
        break;
      case 'indicacao':
        score += 20; // Indicação é muito qualificado
        break;
    }

    // Pontuação por histórico de chat
    if (data.chatHistory && data.chatHistory.length > 3) {
      score += 10; // Conversou bastante
    }

    return Math.min(score, 100);
  }

  private calculateTemperature(lead: Lead): 'frio' | 'morno' | 'quente' {
    if (lead.score >= 70) return 'quente';
    if (lead.score >= 40) return 'morno';
    return 'frio';
  }

  // ---------------------------------------------------------------------------
  // CRUD de Deals
  // ---------------------------------------------------------------------------

  private async createDealFromLead(lead: Lead, config: WebhookConfig): Promise<Deal> {
    const now = new Date();
    const deal: Deal = {
      id: `deal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      leadId: lead.id,
      pipelineId: config.targetPipelineId,
      stageId: config.targetStageId,
      title: `${lead.nome} - ${lead.interesseImovel || 'Novo Lead'}`,
      valorAluguel: lead.valorMaximo || 0,
      valorTotal: lead.valorMaximo || 0,
      status: 'aberto',
      priority: lead.score >= 70 ? 'alta' : lead.score >= 40 ? 'media' : 'baixa',
      probability: 10,
      activityCount: 0,
      tags: [...lead.tags],
      assignedTo: config.autoAssign ? config.assignToUserId : undefined,
      createdAt: now,
      updatedAt: now,
      movedAt: now,
    };

    dealsDb.push(deal);
    console.log('[LeadIngestion] Deal created:', deal.id);

    // Criar atividade de sistema
    await this.createSystemActivity(deal.id, lead.id, 'Lead captado automaticamente', {
      source: lead.source,
      webhook: config.name,
    });

    return deal;
  }

  private async attachChatHistory(
    dealId: string,
    leadId: string,
    chatHistory: ChatMessage[]
  ): Promise<void> {
    const activity: Activity = {
      id: `act_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      dealId,
      leadId,
      type: 'whatsapp',
      title: 'Histórico de Conversa do Chatbot',
      description: `${chatHistory.length} mensagens importadas do Omnichannel`,
      chatMessages: chatHistory,
      createdBy: 'system',
      isAutomatic: true,
      createdAt: new Date(),
    };

    activitiesDb.push(activity);
    console.log('[LeadIngestion] Chat history attached:', activity.id);

    // Atualizar contador de atividades do deal
    const deal = dealsDb.find((d) => d.id === dealId);
    if (deal) {
      deal.activityCount++;
      deal.lastActivityAt = new Date();
    }
  }

  private async createSystemActivity(
    dealId: string,
    leadId: string,
    title: string,
    metadata: Record<string, unknown>
  ): Promise<void> {
    const activity: Activity = {
      id: `act_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      dealId,
      leadId,
      type: 'sistema',
      title,
      metadata,
      createdBy: 'system',
      isAutomatic: true,
      createdAt: new Date(),
    };

    activitiesDb.push(activity);

    // Atualizar contador de atividades do deal
    const deal = dealsDb.find((d) => d.id === dealId);
    if (deal) {
      deal.activityCount++;
      deal.lastActivityAt = new Date();
    }
  }

  // ---------------------------------------------------------------------------
  // API Pública (Simulada - em produção seria Express/API Routes)
  // ---------------------------------------------------------------------------

  /**
   * POST /api/crm/leads/webhook/:source
   * Endpoint principal para receber leads de qualquer fonte
   */
  async handleWebhookRequest(
    source: string,
    payload: Record<string, unknown>,
    headers?: Record<string, string>
  ): Promise<IngestionResult> {
    // Validar secret key (em produção)
    const config = this.webhookConfigs.get(source);
    if (config && headers) {
      const providedSecret = headers['x-webhook-secret'] || headers['x-api-key'];
      if (providedSecret && providedSecret !== config.secretKey) {
        return {
          success: false,
          isDuplicate: false,
          action: 'skipped',
          message: 'Autenticação inválida',
          errors: ['Invalid webhook secret'],
        };
      }
    }

    return this.processWebhook(source, payload);
  }

  /**
   * POST /api/crm/leads
   * Criação manual de lead
   */
  async createLeadManually(dto: CreateLeadDTO): Promise<IngestionResult> {
    const processedData: ProcessedLeadData = {
      nome: dto.nome,
      email: dto.email,
      telefone: this.formatPhone(dto.telefone),
      cpf: dto.cpf ? this.formatCPF(dto.cpf) : undefined,
      source: dto.source,
      actorType: dto.actorType || 'prospect',
      utmSource: dto.utmSource,
      utmMedium: dto.utmMedium,
      utmCampaign: dto.utmCampaign,
      cidade: dto.cidade,
      estado: dto.estado,
      interesseImovel: dto.interesseImovel,
      valorMaximo: dto.valorMaximo,
      chatHistory: dto.chatHistory,
      externalId: dto.externalId,
      tags: dto.tags || [],
      rawPayload: dto.rawPayload || {},
    };

    // Verificar duplicidade
    const duplicateCheck = await this.checkDuplicate(processedData, 'email_telefone');

    if (duplicateCheck.isDuplicate) {
      return {
        success: false,
        leadId: duplicateCheck.existingLead?.id,
        isDuplicate: true,
        action: 'skipped',
        message: 'Lead já existe no sistema',
      };
    }

    const lead = await this.createLead(processedData);

    // Criar deal no pipeline padrão
    const defaultConfig = this.webhookConfigs.get('landing')!;
    const deal = await this.createDealFromLead(lead, defaultConfig);

    return {
      success: true,
      leadId: lead.id,
      dealId: deal.id,
      isDuplicate: false,
      action: 'created',
      message: 'Lead criado com sucesso',
    };
  }

  // ---------------------------------------------------------------------------
  // Getters para o Frontend
  // ---------------------------------------------------------------------------

  getLeads(): Lead[] {
    return leadsDb;
  }

  getDeals(): Deal[] {
    return dealsDb;
  }

  getActivities(dealId?: string): Activity[] {
    if (dealId) {
      return activitiesDb.filter((a) => a.dealId === dealId);
    }
    return activitiesDb;
  }

  getLeadById(id: string): Lead | undefined {
    return leadsDb.find((l) => l.id === id);
  }

  getDealById(id: string): Deal | undefined {
    return dealsDb.find((d) => d.id === id);
  }

  getWebhookConfigs(): WebhookConfig[] {
    return Array.from(this.webhookConfigs.values());
  }
}

// Singleton export
export const leadIngestionService = new LeadIngestionService();
