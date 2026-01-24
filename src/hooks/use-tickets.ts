/**
 * Tickets API Hooks (Central de Comunicacao)
 *
 * Provides React Query hooks for ticket/message management:
 * - Tickets CRUD (conversations)
 * - Messages (send/receive)
 * - Assignment
 * - Status updates
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// ============================================
// TYPES
// ============================================

export type ChannelType = 'WHATSAPP' | 'EMAIL' | 'CHAT' | 'PHONE' | 'SMS';
export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'WAITING' | 'RESOLVED' | 'CLOSED';
export type Priority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type SenderType = 'CUSTOMER' | 'AGENT' | 'BOT' | 'SYSTEM';
export type MessageContentType = 'TEXT' | 'IMAGE' | 'AUDIO' | 'VIDEO' | 'DOCUMENT';
export type MessageStatus = 'PENDING' | 'SENT' | 'DELIVERED' | 'READ' | 'FAILED';

export interface Message {
  id: string;
  ticketId: string;
  senderId: string | null;
  sender?: {
    id: string;
    name: string;
    avatar?: string;
  };
  senderType: SenderType;
  senderName: string | null;
  content: string;
  contentType: MessageContentType;
  attachments: string[] | null;
  channel: ChannelType;
  externalId: string | null;
  status: MessageStatus;
  readAt: string | null;
  createdAt: string;
}

/** Status do Lead no CRM (espelhado para integração) */
export type CRMLeadStage =
  | 'novo'
  | 'qualificando'
  | 'qualificado'
  | 'convertido'
  | 'perdido'
  | 'descartado';

export interface Ticket {
  id: string;
  contactName: string;
  contactEmail: string | null;
  contactPhone: string | null;
  channel: ChannelType;
  status: TicketStatus;
  priority: Priority;
  subject: string | null;
  agentId: string | null;
  agent?: {
    id: string;
    name: string;
    avatar?: string;
  };
  createdById: string | null;
  messages: Message[];
  firstResponseAt: string | null;
  resolvedAt: string | null;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  _count?: {
    messages: number;
  };

  // =============================================================================
  // INTEGRAÇÃO COM CRM
  // =============================================================================

  /**
   * ID do Lead vinculado no CRM
   * Permite navegação direta para o card do Lead no Kanban
   */
  crmLeadId?: string | null;

  /**
   * Stage atual do Lead no CRM (sincronizado)
   * Permite ao operador ver a etapa do funil sem sair da conversa
   */
  crmStage?: CRMLeadStage | null;

  /**
   * Nome do Deal associado (se existir)
   */
  crmDealTitle?: string | null;

  /**
   * Valor do negócio em andamento
   */
  crmDealValue?: number | null;
}

export interface TicketListResponse {
  tickets: Ticket[];
  total: number;
  page: number;
  totalPages: number;
}

export interface CreateTicketInput {
  contactName: string;
  contactEmail?: string;
  contactPhone?: string;
  channel: ChannelType;
  subject?: string;
  priority?: Priority;
  agentId?: string;
  initialMessage?: string;
}

export interface SendMessageInput {
  content: string;
  contentType?: MessageContentType;
  attachments?: string[];
}

// ============================================
// API FUNCTIONS
// ============================================

const API_BASE = '/api/tickets';

async function fetchTickets(params: {
  page?: number;
  limit?: number;
  status?: TicketStatus;
  channel?: ChannelType;
  agentId?: string;
  priority?: Priority;
}): Promise<TicketListResponse> {
  const searchParams = new URLSearchParams();
  if (params.page) searchParams.set('page', String(params.page));
  if (params.limit) searchParams.set('limit', String(params.limit));
  if (params.status) searchParams.set('status', params.status);
  if (params.channel) searchParams.set('channel', params.channel);
  if (params.agentId) searchParams.set('agentId', params.agentId);
  if (params.priority) searchParams.set('priority', params.priority);

  const res = await fetch(`${API_BASE}?${searchParams.toString()}`);
  if (!res.ok) throw new Error('Erro ao buscar tickets');
  return res.json();
}

async function fetchTicketById(id: string): Promise<Ticket> {
  const res = await fetch(`${API_BASE}/${id}`);
  if (!res.ok) throw new Error('Erro ao buscar ticket');
  return res.json();
}

async function createTicket(data: CreateTicketInput): Promise<Ticket> {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Erro ao criar ticket');
  return res.json();
}

async function sendMessage(ticketId: string, data: SendMessageInput): Promise<Message> {
  const res = await fetch(`${API_BASE}/${ticketId}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error('Erro ao enviar mensagem');
  return res.json();
}

async function assignAgent(ticketId: string, agentId: string): Promise<Ticket> {
  const res = await fetch(`${API_BASE}/${ticketId}/assign`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ agentId }),
  });
  if (!res.ok) throw new Error('Erro ao atribuir agente');
  return res.json();
}

async function updateTicketStatus(ticketId: string, status: TicketStatus): Promise<Ticket> {
  const res = await fetch(`${API_BASE}/${ticketId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error('Erro ao atualizar status');
  return res.json();
}

// ============================================
// HOOKS
// ============================================

/**
 * Hook para listar tickets com filtros
 */
export function useTickets(params: {
  page?: number;
  limit?: number;
  status?: TicketStatus;
  channel?: ChannelType;
  agentId?: string;
  priority?: Priority;
} = {}) {
  return useQuery({
    queryKey: ['tickets', params],
    queryFn: () => fetchTickets(params),
    staleTime: 30 * 1000, // 30 segundos
    refetchInterval: 30 * 1000, // Refetch a cada 30s para mensagens novas
  });
}

/**
 * Hook para buscar um ticket especifico com mensagens
 */
export function useTicket(ticketId: string | null) {
  return useQuery({
    queryKey: ['ticket', ticketId],
    queryFn: () => fetchTicketById(ticketId!),
    enabled: !!ticketId,
    staleTime: 10 * 1000, // 10 segundos
    refetchInterval: 10 * 1000, // Refetch a cada 10s para novas mensagens
  });
}

/**
 * Hook para criar novo ticket
 */
export function useCreateTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTicket,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
  });
}

/**
 * Hook para enviar mensagem em um ticket
 */
export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ticketId, data }: { ticketId: string; data: SendMessageInput }) =>
      sendMessage(ticketId, data),
    onSuccess: (_, { ticketId }) => {
      queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] });
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
  });
}

/**
 * Hook para atribuir agente a ticket
 */
export function useAssignAgent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ticketId, agentId }: { ticketId: string; agentId: string }) =>
      assignAgent(ticketId, agentId),
    onSuccess: (_, { ticketId }) => {
      queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] });
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
  });
}

/**
 * Hook para atualizar status do ticket
 */
export function useUpdateTicketStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ ticketId, status }: { ticketId: string; status: TicketStatus }) =>
      updateTicketStatus(ticketId, status),
    onSuccess: (_, { ticketId }) => {
      queryClient.invalidateQueries({ queryKey: ['ticket', ticketId] });
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
  });
}

/**
 * Helper para mapear channel type para label em PT-BR
 */
export const channelLabels: Record<ChannelType, string> = {
  WHATSAPP: 'WhatsApp',
  EMAIL: 'E-mail',
  CHAT: 'Chat',
  PHONE: 'Telefone',
  SMS: 'SMS',
};

/**
 * Helper para mapear status para label em PT-BR
 */
export const statusLabels: Record<TicketStatus, string> = {
  OPEN: 'Aberto',
  IN_PROGRESS: 'Em Atendimento',
  WAITING: 'Aguardando',
  RESOLVED: 'Resolvido',
  CLOSED: 'Fechado',
};

/**
 * Helper para mapear priority para label em PT-BR
 */
export const priorityLabels: Record<Priority, string> = {
  LOW: 'Baixa',
  MEDIUM: 'Media',
  HIGH: 'Alta',
  URGENT: 'Urgente',
};
