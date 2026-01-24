/**
 * Vinculo.io - WhatsApp Business API Service
 *
 * Integração completa com a Meta WhatsApp Business API
 * Inclui todas as métricas e requisitos exigidos pela Meta:
 * - Template Messages
 * - Interactive Messages
 * - Media Messages
 * - Webhooks
 * - Métricas de qualidade
 * - Gestão de conversas (24h)
 * - Compliance e Opt-in/Opt-out
 *
 * Documentação: https://developers.facebook.com/docs/whatsapp/business-platform
 */

// ============================================================================
// TIPOS - META WHATSAPP BUSINESS API
// ============================================================================

export type WhatsAppMessageType =
  | 'text'
  | 'image'
  | 'document'
  | 'audio'
  | 'video'
  | 'sticker'
  | 'location'
  | 'contacts'
  | 'interactive'
  | 'template';

export type WhatsAppMessageStatus =
  | 'sent'
  | 'delivered'
  | 'read'
  | 'failed';

export type WhatsAppConversationType =
  | 'marketing'
  | 'utility'
  | 'authentication'
  | 'service';

export type WhatsAppQualityRating =
  | 'GREEN'   // Alta qualidade
  | 'YELLOW'  // Qualidade média
  | 'RED';    // Baixa qualidade - risco de restrição

export type WhatsAppPhoneStatus =
  | 'CONNECTED'
  | 'DISCONNECTED'
  | 'FLAGGED'
  | 'RESTRICTED'
  | 'RATE_LIMITED';

// ============================================================================
// INTERFACES - META COMPLIANCE
// ============================================================================

export interface WhatsAppContact {
  wa_id: string;
  profile: {
    name: string;
  };
}

export interface WhatsAppMessage {
  id: string;
  from: string;
  timestamp: string;
  type: WhatsAppMessageType;
  text?: {
    body: string;
  };
  image?: WhatsAppMedia;
  document?: WhatsAppMedia;
  audio?: WhatsAppMedia;
  video?: WhatsAppMedia;
  interactive?: WhatsAppInteractive;
  button?: {
    text: string;
    payload: string;
  };
  context?: {
    message_id: string;
    from: string;
  };
}

export interface WhatsAppMedia {
  id: string;
  mime_type: string;
  sha256?: string;
  caption?: string;
  filename?: string;
  link?: string;
}

export interface WhatsAppInteractive {
  type: 'list' | 'button' | 'product' | 'product_list';
  header?: {
    type: 'text' | 'image' | 'video' | 'document';
    text?: string;
    image?: WhatsAppMedia;
  };
  body: {
    text: string;
  };
  footer?: {
    text: string;
  };
  action: WhatsAppInteractiveAction;
}

export interface WhatsAppInteractiveAction {
  button?: string;
  buttons?: Array<{
    type: 'reply';
    reply: {
      id: string;
      title: string;
    };
  }>;
  sections?: Array<{
    title?: string;
    rows: Array<{
      id: string;
      title: string;
      description?: string;
    }>;
  }>;
  catalog_id?: string;
  product_retailer_id?: string;
}

// ============================================================================
// TEMPLATES - Exigidos pela Meta para mensagens fora da janela de 24h
// ============================================================================

export interface WhatsAppTemplate {
  name: string;
  language: {
    code: string;
  };
  components?: WhatsAppTemplateComponent[];
}

export interface WhatsAppTemplateComponent {
  type: 'header' | 'body' | 'button';
  sub_type?: 'quick_reply' | 'url';
  index?: number;
  parameters?: Array<{
    type: 'text' | 'currency' | 'date_time' | 'image' | 'document' | 'video';
    text?: string;
    currency?: {
      fallback_value: string;
      code: string;
      amount_1000: number;
    };
    date_time?: {
      fallback_value: string;
    };
    image?: WhatsAppMedia;
    document?: WhatsAppMedia;
    video?: WhatsAppMedia;
  }>;
}

// ============================================================================
// MÉTRICAS EXIGIDAS PELA META
// ============================================================================

export interface WhatsAppMetrics {
  // Qualidade do número
  qualityRating: WhatsAppQualityRating;
  phoneStatus: WhatsAppPhoneStatus;
  messagingLimit: number; // Limite de mensagens por dia
  messagingTier: 'TIER_50' | 'TIER_250' | 'TIER_1K' | 'TIER_10K' | 'TIER_100K' | 'TIER_UNLIMITED';

  // Métricas de mensagens
  messagesSent: number;
  messagesDelivered: number;
  messagesRead: number;
  messagesFailed: number;

  // Taxa de entrega e leitura
  deliveryRate: number;
  readRate: number;

  // Conversas por categoria (cobradas pela Meta)
  conversations: {
    marketing: number;
    utility: number;
    authentication: number;
    service: number; // Gratuitas na janela de 24h
  };

  // Compliance
  optOutRequests: number;
  blockedUsers: number;
  spamReports: number;

  // Janela de atendimento 24h
  activeConversations: number;
  expiredConversations: number;

  // Templates
  templatesApproved: number;
  templatesPending: number;
  templatesRejected: number;

  // Período do relatório
  periodStart: string;
  periodEnd: string;
}

export interface WhatsAppConversation {
  id: string;
  contact: WhatsAppContact;
  type: WhatsAppConversationType;
  startedAt: string;
  expiresAt: string; // 24h após última mensagem do usuário
  isActive: boolean;
  messages: WhatsAppMessage[];
  optedIn: boolean;
  optInDate?: string;
  lastMessageAt: string;
}

export interface WhatsAppWebhookEvent {
  object: 'whatsapp_business_account';
  entry: Array<{
    id: string;
    changes: Array<{
      value: {
        messaging_product: 'whatsapp';
        metadata: {
          display_phone_number: string;
          phone_number_id: string;
        };
        contacts?: WhatsAppContact[];
        messages?: WhatsAppMessage[];
        statuses?: Array<{
          id: string;
          status: WhatsAppMessageStatus;
          timestamp: string;
          recipient_id: string;
          conversation?: {
            id: string;
            expiration_timestamp?: string;
            origin: {
              type: WhatsAppConversationType;
            };
          };
          pricing?: {
            billable: boolean;
            pricing_model: 'CBP';
            category: WhatsAppConversationType;
          };
          errors?: Array<{
            code: number;
            title: string;
            message: string;
          }>;
        }>;
      };
      field: 'messages';
    }>;
  }>;
}

// ============================================================================
// CONFIGURAÇÃO
// ============================================================================

export interface WhatsAppConfig {
  phoneNumberId: string;
  businessAccountId: string;
  accessToken: string;
  webhookVerifyToken: string;
  apiVersion: string;
  environment: 'sandbox' | 'production';
}

const META_API_URL = 'https://graph.facebook.com';

// ============================================================================
// TEMPLATES PADRÃO VINCULO.IO
// ============================================================================

export const VINCULO_TEMPLATES = {
  // Template: Lembrete de pagamento
  PAYMENT_REMINDER: {
    name: 'vinculo_payment_reminder',
    language: { code: 'pt_BR' },
    components: [
      {
        type: 'body' as const,
        parameters: [
          { type: 'text' as const, text: '' }, // {{1}} Nome do inquilino
          { type: 'currency' as const, currency: { fallback_value: '', code: 'BRL', amount_1000: 0 } }, // {{2}} Valor
          { type: 'text' as const, text: '' }, // {{3}} Data vencimento
        ],
      },
    ],
  },

  // Template: Confirmação de pagamento
  PAYMENT_CONFIRMED: {
    name: 'vinculo_payment_confirmed',
    language: { code: 'pt_BR' },
    components: [
      {
        type: 'body' as const,
        parameters: [
          { type: 'text' as const, text: '' }, // {{1}} Nome
          { type: 'currency' as const, currency: { fallback_value: '', code: 'BRL', amount_1000: 0 } }, // {{2}} Valor pago
          { type: 'text' as const, text: '' }, // {{3}} Hash da transação blockchain
        ],
      },
    ],
  },

  // Template: Contrato pronto para assinatura
  CONTRACT_READY: {
    name: 'vinculo_contract_ready',
    language: { code: 'pt_BR' },
    components: [
      {
        type: 'body' as const,
        parameters: [
          { type: 'text' as const, text: '' }, // {{1}} Nome
          { type: 'text' as const, text: '' }, // {{2}} Endereço do imóvel
        ],
      },
      {
        type: 'button' as const,
        sub_type: 'url' as const,
        index: 0,
        parameters: [
          { type: 'text' as const, text: '' }, // {{1}} Link para assinar
        ],
      },
    ],
  },

  // Template: Alerta de inadimplência
  DELINQUENCY_ALERT: {
    name: 'vinculo_delinquency_alert',
    language: { code: 'pt_BR' },
    components: [
      {
        type: 'body' as const,
        parameters: [
          { type: 'text' as const, text: '' }, // {{1}} Nome
          { type: 'text' as const, text: '' }, // {{2}} Dias em atraso
          { type: 'currency' as const, currency: { fallback_value: '', code: 'BRL', amount_1000: 0 } }, // {{3}} Valor total
        ],
      },
    ],
  },

  // Template: Vistoria agendada
  INSPECTION_SCHEDULED: {
    name: 'vinculo_inspection_scheduled',
    language: { code: 'pt_BR' },
    components: [
      {
        type: 'body' as const,
        parameters: [
          { type: 'text' as const, text: '' }, // {{1}} Nome
          { type: 'text' as const, text: '' }, // {{2}} Data/hora
          { type: 'text' as const, text: '' }, // {{3}} Endereço
        ],
      },
    ],
  },

  // Template: Código de verificação (autenticação)
  VERIFICATION_CODE: {
    name: 'vinculo_verification_code',
    language: { code: 'pt_BR' },
    components: [
      {
        type: 'body' as const,
        parameters: [
          { type: 'text' as const, text: '' }, // {{1}} Código
        ],
      },
    ],
  },
};

// ============================================================================
// CLIENTE WHATSAPP BUSINESS API
// ============================================================================

export class WhatsAppService {
  private phoneNumberId: string;
  private businessAccountId: string;
  private accessToken: string;
  private webhookVerifyToken: string;
  private apiVersion: string;
  private baseUrl: string;

  // Armazenamento local de métricas (em produção, usar banco de dados)
  private metrics: WhatsAppMetrics;
  private conversations: Map<string, WhatsAppConversation> = new Map();

  constructor(config: WhatsAppConfig) {
    this.phoneNumberId = config.phoneNumberId;
    this.businessAccountId = config.businessAccountId;
    this.accessToken = config.accessToken;
    this.webhookVerifyToken = config.webhookVerifyToken;
    this.apiVersion = config.apiVersion || 'v18.0';
    this.baseUrl = `${META_API_URL}/${this.apiVersion}`;

    // Inicializa métricas
    this.metrics = this.initializeMetrics();
  }

  private initializeMetrics(): WhatsAppMetrics {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return {
      qualityRating: 'GREEN',
      phoneStatus: 'CONNECTED',
      messagingLimit: 1000,
      messagingTier: 'TIER_1K',
      messagesSent: 0,
      messagesDelivered: 0,
      messagesRead: 0,
      messagesFailed: 0,
      deliveryRate: 100,
      readRate: 0,
      conversations: {
        marketing: 0,
        utility: 0,
        authentication: 0,
        service: 0,
      },
      optOutRequests: 0,
      blockedUsers: 0,
      spamReports: 0,
      activeConversations: 0,
      expiredConversations: 0,
      templatesApproved: Object.keys(VINCULO_TEMPLATES).length,
      templatesPending: 0,
      templatesRejected: 0,
      periodStart: startOfDay.toISOString(),
      periodEnd: new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000).toISOString(),
    };
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.accessToken}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      this.metrics.messagesFailed++;
      throw new Error(`WhatsApp API Error: ${JSON.stringify(error)}`);
    }

    return response.json();
  }

  // --------------------------------------------------------------------------
  // ENVIO DE MENSAGENS
  // --------------------------------------------------------------------------

  /**
   * Envia mensagem de texto simples (apenas dentro da janela de 24h)
   */
  async sendTextMessage(to: string, text: string): Promise<{ messageId: string }> {
    const conversation = this.conversations.get(to);

    if (!conversation || !this.isConversationActive(conversation)) {
      throw new Error(
        'Conversa expirada ou inexistente. Use um template para iniciar nova conversa.'
      );
    }

    const response = await this.request<{ messages: Array<{ id: string }> }>(
      `/${this.phoneNumberId}/messages`,
      {
        method: 'POST',
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to,
          type: 'text',
          text: { body: text },
        }),
      }
    );

    this.metrics.messagesSent++;
    this.updateConversation(to, 'service');

    return { messageId: response.messages[0].id };
  }

  /**
   * Envia mensagem de template (pode iniciar nova conversa)
   */
  async sendTemplateMessage(
    to: string,
    template: WhatsAppTemplate,
    conversationType: WhatsAppConversationType = 'utility'
  ): Promise<{ messageId: string }> {
    const response = await this.request<{ messages: Array<{ id: string }> }>(
      `/${this.phoneNumberId}/messages`,
      {
        method: 'POST',
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to,
          type: 'template',
          template,
        }),
      }
    );

    this.metrics.messagesSent++;
    this.metrics.conversations[conversationType]++;
    this.updateConversation(to, conversationType);

    return { messageId: response.messages[0].id };
  }

  /**
   * Envia mensagem interativa com botões
   */
  async sendInteractiveButtons(
    to: string,
    bodyText: string,
    buttons: Array<{ id: string; title: string }>,
    headerText?: string,
    footerText?: string
  ): Promise<{ messageId: string }> {
    const conversation = this.conversations.get(to);

    if (!conversation || !this.isConversationActive(conversation)) {
      throw new Error('Conversa expirada. Use um template para iniciar.');
    }

    const interactive: WhatsAppInteractive = {
      type: 'button',
      body: { text: bodyText },
      action: {
        buttons: buttons.slice(0, 3).map((btn) => ({
          type: 'reply' as const,
          reply: { id: btn.id, title: btn.title.substring(0, 20) },
        })),
      },
    };

    if (headerText) {
      interactive.header = { type: 'text', text: headerText };
    }

    if (footerText) {
      interactive.footer = { text: footerText };
    }

    const response = await this.request<{ messages: Array<{ id: string }> }>(
      `/${this.phoneNumberId}/messages`,
      {
        method: 'POST',
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to,
          type: 'interactive',
          interactive,
        }),
      }
    );

    this.metrics.messagesSent++;

    return { messageId: response.messages[0].id };
  }

  /**
   * Envia mensagem interativa com lista
   */
  async sendInteractiveList(
    to: string,
    bodyText: string,
    buttonText: string,
    sections: Array<{
      title: string;
      rows: Array<{ id: string; title: string; description?: string }>;
    }>,
    headerText?: string,
    footerText?: string
  ): Promise<{ messageId: string }> {
    const conversation = this.conversations.get(to);

    if (!conversation || !this.isConversationActive(conversation)) {
      throw new Error('Conversa expirada. Use um template para iniciar.');
    }

    const interactive: WhatsAppInteractive = {
      type: 'list',
      body: { text: bodyText },
      action: {
        button: buttonText.substring(0, 20),
        sections: sections.map((section) => ({
          title: section.title,
          rows: section.rows.slice(0, 10).map((row) => ({
            id: row.id,
            title: row.title.substring(0, 24),
            description: row.description?.substring(0, 72),
          })),
        })),
      },
    };

    if (headerText) {
      interactive.header = { type: 'text', text: headerText };
    }

    if (footerText) {
      interactive.footer = { text: footerText };
    }

    const response = await this.request<{ messages: Array<{ id: string }> }>(
      `/${this.phoneNumberId}/messages`,
      {
        method: 'POST',
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to,
          type: 'interactive',
          interactive,
        }),
      }
    );

    this.metrics.messagesSent++;

    return { messageId: response.messages[0].id };
  }

  /**
   * Envia mídia (imagem, documento, vídeo, áudio)
   */
  async sendMediaMessage(
    to: string,
    type: 'image' | 'document' | 'video' | 'audio',
    mediaUrl: string,
    caption?: string,
    filename?: string
  ): Promise<{ messageId: string }> {
    const conversation = this.conversations.get(to);

    if (!conversation || !this.isConversationActive(conversation)) {
      throw new Error('Conversa expirada. Use um template para iniciar.');
    }

    const mediaPayload: Record<string, unknown> = {
      link: mediaUrl,
    };

    if (caption && (type === 'image' || type === 'video' || type === 'document')) {
      mediaPayload.caption = caption;
    }

    if (filename && type === 'document') {
      mediaPayload.filename = filename;
    }

    const response = await this.request<{ messages: Array<{ id: string }> }>(
      `/${this.phoneNumberId}/messages`,
      {
        method: 'POST',
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to,
          type,
          [type]: mediaPayload,
        }),
      }
    );

    this.metrics.messagesSent++;

    return { messageId: response.messages[0].id };
  }

  // --------------------------------------------------------------------------
  // TEMPLATES VINCULO.IO
  // --------------------------------------------------------------------------

  /**
   * Envia lembrete de pagamento
   */
  async sendPaymentReminder(
    to: string,
    tenantName: string,
    amount: number,
    dueDate: string
  ): Promise<{ messageId: string }> {
    const template = {
      ...VINCULO_TEMPLATES.PAYMENT_REMINDER,
      components: [
        {
          type: 'body' as const,
          parameters: [
            { type: 'text' as const, text: tenantName },
            {
              type: 'currency' as const,
              currency: {
                fallback_value: `R$ ${amount.toFixed(2)}`,
                code: 'BRL',
                amount_1000: Math.round(amount * 1000),
              },
            },
            { type: 'text' as const, text: dueDate },
          ],
        },
      ],
    };

    return this.sendTemplateMessage(to, template, 'utility');
  }

  /**
   * Envia confirmação de pagamento com hash da blockchain
   */
  async sendPaymentConfirmation(
    to: string,
    name: string,
    amount: number,
    blockchainHash: string
  ): Promise<{ messageId: string }> {
    const template = {
      ...VINCULO_TEMPLATES.PAYMENT_CONFIRMED,
      components: [
        {
          type: 'body' as const,
          parameters: [
            { type: 'text' as const, text: name },
            {
              type: 'currency' as const,
              currency: {
                fallback_value: `R$ ${amount.toFixed(2)}`,
                code: 'BRL',
                amount_1000: Math.round(amount * 1000),
              },
            },
            { type: 'text' as const, text: blockchainHash.substring(0, 20) + '...' },
          ],
        },
      ],
    };

    return this.sendTemplateMessage(to, template, 'utility');
  }

  /**
   * Envia alerta de inadimplência
   */
  async sendDelinquencyAlert(
    to: string,
    name: string,
    daysOverdue: number,
    totalAmount: number
  ): Promise<{ messageId: string }> {
    const template = {
      ...VINCULO_TEMPLATES.DELINQUENCY_ALERT,
      components: [
        {
          type: 'body' as const,
          parameters: [
            { type: 'text' as const, text: name },
            { type: 'text' as const, text: daysOverdue.toString() },
            {
              type: 'currency' as const,
              currency: {
                fallback_value: `R$ ${totalAmount.toFixed(2)}`,
                code: 'BRL',
                amount_1000: Math.round(totalAmount * 1000),
              },
            },
          ],
        },
      ],
    };

    return this.sendTemplateMessage(to, template, 'utility');
  }

  /**
   * Envia código de verificação (autenticação)
   */
  async sendVerificationCode(to: string, code: string): Promise<{ messageId: string }> {
    const template = {
      ...VINCULO_TEMPLATES.VERIFICATION_CODE,
      components: [
        {
          type: 'body' as const,
          parameters: [{ type: 'text' as const, text: code }],
        },
      ],
    };

    return this.sendTemplateMessage(to, template, 'authentication');
  }

  // --------------------------------------------------------------------------
  // WEBHOOKS - Processamento de eventos da Meta
  // --------------------------------------------------------------------------

  /**
   * Verifica token do webhook (setup inicial)
   */
  verifyWebhook(mode: string, token: string, challenge: string): string | null {
    if (mode === 'subscribe' && token === this.webhookVerifyToken) {
      return challenge;
    }
    return null;
  }

  /**
   * Processa eventos do webhook
   */
  async processWebhookEvent(event: WhatsAppWebhookEvent): Promise<void> {
    for (const entry of event.entry) {
      for (const change of entry.changes) {
        const value = change.value;

        // Processa mensagens recebidas
        if (value.messages) {
          for (const message of value.messages) {
            await this.handleIncomingMessage(message, value.contacts?.[0]);
          }
        }

        // Processa status de mensagens
        if (value.statuses) {
          for (const status of value.statuses) {
            this.handleMessageStatus(status);
          }
        }
      }
    }
  }

  private async handleIncomingMessage(
    message: WhatsAppMessage,
    contact?: WhatsAppContact
  ): Promise<void> {
    const from = message.from;

    // Atualiza ou cria conversa
    let conversation = this.conversations.get(from);

    if (!conversation) {
      conversation = {
        id: `conv_${Date.now()}`,
        contact: contact || { wa_id: from, profile: { name: 'Desconhecido' } },
        type: 'service',
        startedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        isActive: true,
        messages: [],
        optedIn: true,
        optInDate: new Date().toISOString(),
        lastMessageAt: new Date().toISOString(),
      };
      this.metrics.activeConversations++;
    }

    // Renova janela de 24h
    conversation.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    conversation.lastMessageAt = new Date().toISOString();
    conversation.isActive = true;
    conversation.messages.push(message);

    this.conversations.set(from, conversation);

    // Verifica opt-out
    if (message.text?.body.toLowerCase().includes('sair') ||
        message.text?.body.toLowerCase().includes('parar') ||
        message.text?.body.toLowerCase().includes('cancelar')) {
      await this.handleOptOut(from);
    }
  }

  private handleMessageStatus(status: {
    id: string;
    status: WhatsAppMessageStatus;
    timestamp: string;
    recipient_id: string;
  }): void {
    switch (status.status) {
      case 'delivered':
        this.metrics.messagesDelivered++;
        break;
      case 'read':
        this.metrics.messagesRead++;
        break;
      case 'failed':
        this.metrics.messagesFailed++;
        break;
    }

    // Recalcula taxas
    if (this.metrics.messagesSent > 0) {
      this.metrics.deliveryRate = (this.metrics.messagesDelivered / this.metrics.messagesSent) * 100;
      this.metrics.readRate = (this.metrics.messagesRead / this.metrics.messagesDelivered) * 100;
    }
  }

  // --------------------------------------------------------------------------
  // OPT-IN / OPT-OUT - Compliance Meta
  // --------------------------------------------------------------------------

  /**
   * Registra opt-in do usuário
   */
  async registerOptIn(phoneNumber: string, source: string): Promise<void> {
    let conversation = this.conversations.get(phoneNumber);

    if (!conversation) {
      conversation = {
        id: `conv_${Date.now()}`,
        contact: { wa_id: phoneNumber, profile: { name: '' } },
        type: 'service',
        startedAt: new Date().toISOString(),
        expiresAt: new Date().toISOString(),
        isActive: false,
        messages: [],
        optedIn: true,
        optInDate: new Date().toISOString(),
        lastMessageAt: new Date().toISOString(),
      };
    } else {
      conversation.optedIn = true;
      conversation.optInDate = new Date().toISOString();
    }

    this.conversations.set(phoneNumber, conversation);

    console.log(`Opt-in registrado: ${phoneNumber} via ${source}`);
  }

  /**
   * Processa opt-out do usuário
   */
  async handleOptOut(phoneNumber: string): Promise<void> {
    const conversation = this.conversations.get(phoneNumber);

    if (conversation) {
      conversation.optedIn = false;
      conversation.isActive = false;
      this.conversations.set(phoneNumber, conversation);
    }

    this.metrics.optOutRequests++;

    // Envia confirmação de opt-out
    await this.sendTextMessage(
      phoneNumber,
      'Você foi removido da nossa lista de mensagens. Para voltar a receber, envie "ATIVAR".'
    ).catch(() => {}); // Ignora erro se conversa expirou
  }

  /**
   * Verifica se usuário deu opt-in
   */
  isOptedIn(phoneNumber: string): boolean {
    const conversation = this.conversations.get(phoneNumber);
    return conversation?.optedIn ?? false;
  }

  // --------------------------------------------------------------------------
  // MÉTRICAS E RELATÓRIOS
  // --------------------------------------------------------------------------

  /**
   * Retorna métricas atuais
   */
  getMetrics(): WhatsAppMetrics {
    // Atualiza conversas expiradas
    this.cleanupExpiredConversations();

    return { ...this.metrics };
  }

  /**
   * Retorna status de qualidade do número
   */
  async getPhoneQualityRating(): Promise<{
    quality_rating: WhatsAppQualityRating;
    messaging_limit: string;
  }> {
    return this.request(`/${this.phoneNumberId}?fields=quality_rating,messaging_limit`);
  }

  /**
   * Retorna templates aprovados
   */
  async getMessageTemplates(): Promise<{
    data: Array<{
      name: string;
      status: 'APPROVED' | 'PENDING' | 'REJECTED';
      language: string;
    }>;
  }> {
    return this.request(
      `/${this.businessAccountId}/message_templates?fields=name,status,language`
    );
  }

  /**
   * Retorna analytics de conversas (métricas Meta)
   */
  async getConversationAnalytics(
    startDate: string,
    endDate: string
  ): Promise<{
    data: Array<{
      data_points: Array<{
        start: number;
        end: number;
        sent: number;
        delivered: number;
      }>;
    }>;
  }> {
    return this.request(
      `/${this.businessAccountId}/conversation_analytics?` +
        `start=${new Date(startDate).getTime()}` +
        `&end=${new Date(endDate).getTime()}` +
        `&granularity=DAILY` +
        `&phone_numbers=${this.phoneNumberId}` +
        `&metric_types=SENT,DELIVERED`
    );
  }

  // --------------------------------------------------------------------------
  // UTILITÁRIOS
  // --------------------------------------------------------------------------

  private isConversationActive(conversation: WhatsAppConversation): boolean {
    return (
      conversation.isActive &&
      conversation.optedIn &&
      new Date(conversation.expiresAt) > new Date()
    );
  }

  private updateConversation(phoneNumber: string, type: WhatsAppConversationType): void {
    const conversation = this.conversations.get(phoneNumber);

    if (conversation) {
      conversation.lastMessageAt = new Date().toISOString();
    }
  }

  private cleanupExpiredConversations(): void {
    const now = new Date();

    this.conversations.forEach((conv, phone) => {
      if (conv.isActive && new Date(conv.expiresAt) <= now) {
        conv.isActive = false;
        this.metrics.activeConversations--;
        this.metrics.expiredConversations++;
      }
    });
  }

  /**
   * Formata número de telefone para padrão WhatsApp
   */
  static formatPhoneNumber(phone: string, countryCode = '55'): string {
    const cleaned = phone.replace(/\D/g, '');

    if (cleaned.startsWith(countryCode)) {
      return cleaned;
    }

    return `${countryCode}${cleaned}`;
  }
}

// ============================================================================
// MOCK SERVICE (Para desenvolvimento)
// ============================================================================

export class MockWhatsAppService {
  private metrics: WhatsAppMetrics;
  private conversations: Map<string, WhatsAppConversation> = new Map();
  private messageLog: Array<{
    id: string;
    to: string;
    type: string;
    content: unknown;
    timestamp: string;
  }> = [];

  constructor() {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    this.metrics = {
      qualityRating: 'GREEN',
      phoneStatus: 'CONNECTED',
      messagingLimit: 1000,
      messagingTier: 'TIER_1K',
      messagesSent: 127,
      messagesDelivered: 124,
      messagesRead: 98,
      messagesFailed: 3,
      deliveryRate: 97.6,
      readRate: 79.0,
      conversations: {
        marketing: 12,
        utility: 89,
        authentication: 26,
        service: 45,
      },
      optOutRequests: 2,
      blockedUsers: 1,
      spamReports: 0,
      activeConversations: 34,
      expiredConversations: 138,
      templatesApproved: 6,
      templatesPending: 1,
      templatesRejected: 0,
      periodStart: startOfDay.toISOString(),
      periodEnd: new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000).toISOString(),
    };
  }

  async sendTextMessage(to: string, text: string): Promise<{ messageId: string }> {
    const messageId = `wamid.${Date.now()}`;
    this.messageLog.push({
      id: messageId,
      to,
      type: 'text',
      content: { body: text },
      timestamp: new Date().toISOString(),
    });
    this.metrics.messagesSent++;
    return { messageId };
  }

  async sendTemplateMessage(
    to: string,
    template: WhatsAppTemplate,
    conversationType: WhatsAppConversationType = 'utility'
  ): Promise<{ messageId: string }> {
    const messageId = `wamid.${Date.now()}`;
    this.messageLog.push({
      id: messageId,
      to,
      type: 'template',
      content: template,
      timestamp: new Date().toISOString(),
    });
    this.metrics.messagesSent++;
    this.metrics.conversations[conversationType]++;
    return { messageId };
  }

  async sendPaymentReminder(
    to: string,
    tenantName: string,
    amount: number,
    dueDate: string
  ): Promise<{ messageId: string }> {
    return this.sendTemplateMessage(
      to,
      {
        name: 'vinculo_payment_reminder',
        language: { code: 'pt_BR' },
        components: [
          {
            type: 'body',
            parameters: [
              { type: 'text', text: tenantName },
              { type: 'text', text: `R$ ${amount.toFixed(2)}` },
              { type: 'text', text: dueDate },
            ],
          },
        ],
      },
      'utility'
    );
  }

  async sendPaymentConfirmation(
    to: string,
    name: string,
    amount: number,
    blockchainHash: string
  ): Promise<{ messageId: string }> {
    return this.sendTemplateMessage(
      to,
      {
        name: 'vinculo_payment_confirmed',
        language: { code: 'pt_BR' },
        components: [
          {
            type: 'body',
            parameters: [
              { type: 'text', text: name },
              { type: 'text', text: `R$ ${amount.toFixed(2)}` },
              { type: 'text', text: blockchainHash },
            ],
          },
        ],
      },
      'utility'
    );
  }

  getMetrics(): WhatsAppMetrics {
    return { ...this.metrics };
  }

  getMessageLog() {
    return [...this.messageLog];
  }

  simulateMessageDelivered(messageId: string): void {
    this.metrics.messagesDelivered++;
    this.metrics.deliveryRate = (this.metrics.messagesDelivered / this.metrics.messagesSent) * 100;
  }

  simulateMessageRead(messageId: string): void {
    this.metrics.messagesRead++;
    this.metrics.readRate = (this.metrics.messagesRead / this.metrics.messagesDelivered) * 100;
  }
}
