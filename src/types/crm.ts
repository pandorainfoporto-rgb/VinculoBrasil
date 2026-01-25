// ============================================================
// CRM TYPES - Tipos para o Módulo de CRM e Omnichannel
// ============================================================

// Lead
export interface Lead {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  source: "website" | "whatsapp" | "instagram" | "facebook" | "referral" | "organic" | "paid" | "other";
  channel?: string;
  status: "new" | "contacted" | "qualified" | "proposal" | "negotiation" | "won" | "lost";
  stage: string;
  assignedTo?: string;
  interestType: "rent" | "invest" | "guarantee" | "insure" | "partner";
  propertyInterest?: string;
  budget?: {
    min: number;
    max: number;
  };
  notes?: string;
  tags?: string[];
  score?: number;
  lastContactAt?: string;
  nextFollowUpAt?: string;
  createdAt: string;
  updatedAt: string;
}

// Contato
export interface Contact {
  id: string;
  leadId?: string;
  type: "tenant" | "landlord" | "investor" | "guarantor" | "agency" | "partner" | "other";
  name: string;
  email?: string;
  phone?: string;
  whatsapp?: string;
  document?: string;
  address?: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  isActive: boolean;
  tags?: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Canal de Comunicação
export interface Channel {
  id: string;
  name: string;
  type: "whatsapp" | "email" | "sms" | "instagram" | "facebook" | "telegram" | "webchat";
  status: "active" | "inactive" | "pending";
  config: Record<string, unknown>;
  stats?: {
    totalMessages: number;
    totalConversations: number;
    averageResponseTime: number;
  };
  createdAt: string;
  updatedAt: string;
}

// Conversa
export interface Conversation {
  id: string;
  channelId: string;
  contactId?: string;
  leadId?: string;
  status: "open" | "pending" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "urgent";
  assignedTo?: string;
  subject?: string;
  lastMessageAt: string;
  unreadCount: number;
  tags?: string[];
  metadata?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

// Mensagem
export interface Message {
  id: string;
  conversationId: string;
  direction: "inbound" | "outbound";
  type: "text" | "image" | "audio" | "video" | "document" | "location" | "template";
  content: string;
  mediaUrl?: string;
  templateName?: string;
  status: "pending" | "sent" | "delivered" | "read" | "failed";
  sentBy?: string;
  sentAt: string;
  deliveredAt?: string;
  readAt?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

// Agente de IA
export interface AIAgent {
  id: string;
  name: string;
  type: "chatbot" | "assistant" | "classifier" | "scheduler";
  status: "active" | "inactive" | "training";
  description?: string;
  capabilities: string[];
  config: {
    model?: string;
    temperature?: number;
    maxTokens?: number;
    systemPrompt?: string;
    tools?: string[];
  };
  stats?: {
    totalInteractions: number;
    successRate: number;
    averageResponseTime: number;
  };
  createdAt: string;
  updatedAt: string;
}

// Template de Mensagem
export interface MessageTemplate {
  id: string;
  name: string;
  channel: "whatsapp" | "email" | "sms";
  category: "marketing" | "utility" | "authentication" | "notification";
  language: string;
  status: "pending" | "approved" | "rejected";
  content: {
    header?: {
      type: "text" | "image" | "video" | "document";
      content: string;
    };
    body: string;
    footer?: string;
    buttons?: Array<{
      type: "quick_reply" | "url" | "phone";
      text: string;
      value?: string;
    }>;
  };
  variables?: string[];
  createdAt: string;
  updatedAt: string;
}

// Campanha
export interface Campaign {
  id: string;
  name: string;
  type: "broadcast" | "drip" | "trigger";
  channel: "whatsapp" | "email" | "sms" | "multi";
  status: "draft" | "scheduled" | "running" | "paused" | "completed" | "cancelled";
  audience: {
    type: "all" | "segment" | "list" | "filter";
    filter?: Record<string, unknown>;
    estimatedReach: number;
  };
  content: {
    templateId?: string;
    subject?: string;
    body: string;
  };
  schedule?: {
    startAt: string;
    endAt?: string;
    timezone: string;
  };
  stats?: {
    sent: number;
    delivered: number;
    read: number;
    clicked: number;
    converted: number;
  };
  createdAt: string;
  updatedAt: string;
}

// Pipeline de Vendas
export interface Pipeline {
  id: string;
  name: string;
  type: "sales" | "rental" | "investment" | "partnership";
  stages: Array<{
    id: string;
    name: string;
    order: number;
    color: string;
    probability: number;
  }>;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

// Oportunidade
export interface Opportunity {
  id: string;
  pipelineId: string;
  stageId: string;
  leadId?: string;
  contactId?: string;
  name: string;
  value: number;
  probability: number;
  expectedCloseDate?: string;
  assignedTo?: string;
  status: "open" | "won" | "lost";
  lostReason?: string;
  notes?: string;
  activities?: Array<{
    id: string;
    type: "call" | "email" | "meeting" | "task" | "note";
    description: string;
    completedAt?: string;
    createdAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

// Resumo CRM
export interface CRMSummary {
  period: string;
  leads: {
    total: number;
    new: number;
    qualified: number;
    converted: number;
    conversionRate: number;
  };
  conversations: {
    total: number;
    open: number;
    pending: number;
    resolved: number;
    averageResponseTime: number;
  };
  opportunities: {
    total: number;
    totalValue: number;
    wonValue: number;
    winRate: number;
  };
}
