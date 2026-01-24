// ============================================
// HOOK: useOmnichannel
// Busca dados do sistema omnichannel
// ============================================

import { useQuery } from '@tanstack/react-query';

const API_URL = import.meta.env.VITE_API_URL || 'https://vinculobrasil-production.up.railway.app';

// ============================================
// TIPOS
// ============================================
export interface WhatsAppChannel {
  id: string;
  name: string;
  phoneNumber: string;
  businessName: string;
  provider: 'evolution' | 'baileys' | 'cloud_api' | 'wppconnect';
  status: 'connected' | 'disconnected' | 'pending' | 'error';
  qrCode?: string;
  webhookUrl: string;
  department?: string;
  isDefault: boolean;
  createdAt: string;
  lastActivity?: string;
  messagesCount: number;
  initialFlowId?: string;
  aiAgentId?: string;
  aiEnabled: boolean;
  knowledgeBaseId?: string;
  autoQualifyLeads: boolean;
  leadTags?: string[];
}

export interface AIAgent {
  id: string;
  name: string;
  department: string;
  description: string;
  capabilities: ('text' | 'audio' | 'image' | 'pdf')[];
  knowledgeBaseId: string;
  autoQualifyLeads: boolean;
  leadTags: string[];
  isActive: boolean;
  responseTime: number;
  successRate: number;
}

export interface AttendanceFlow {
  id: string;
  name: string;
  description: string;
  isDefault: boolean;
  triggerType: 'all' | 'whatsapp' | 'landpage' | 'api';
  steps: { id: string; type: string; config: Record<string, unknown> }[];
}

export interface OmnichannelMetrics {
  totalTicketsToday: number;
  resolvedToday: number;
  avgResponseTime: string;
  avgResolutionTime: string;
  satisfaction: number;
  aiResolutionRate: number;
  slaCompliance: number;
  activeAgents: number;
  totalAgents: number;
  byDepartment: {
    name: string;
    tickets: number;
    resolved: number;
    satisfaction: number;
  }[];
  byChannel: {
    whatsapp: { tickets: number; percentage: number };
    webchat: { tickets: number; percentage: number };
    email: { tickets: number; percentage: number };
  };
}

export interface OmnichannelData {
  channels: WhatsAppChannel[];
  agents: AIAgent[];
  flows: AttendanceFlow[];
  metrics: OmnichannelMetrics;
}

// Dados vazios padrão
const EMPTY_METRICS: OmnichannelMetrics = {
  totalTicketsToday: 0,
  resolvedToday: 0,
  avgResponseTime: '-',
  avgResolutionTime: '-',
  satisfaction: 0,
  aiResolutionRate: 0,
  slaCompliance: 0,
  activeAgents: 0,
  totalAgents: 0,
  byDepartment: [],
  byChannel: {
    whatsapp: { tickets: 0, percentage: 0 },
    webchat: { tickets: 0, percentage: 0 },
    email: { tickets: 0, percentage: 0 },
  },
};

const EMPTY_DATA: OmnichannelData = {
  channels: [],
  agents: [],
  flows: [],
  metrics: EMPTY_METRICS,
};

// ============================================
// FETCHERS
// ============================================
async function fetchOmnichannelData(): Promise<OmnichannelData> {
  const token = localStorage.getItem('token');

  if (!token) {
    throw new Error('Token não encontrado');
  }

  const response = await fetch(`${API_URL}/api/admin/omnichannel`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    // Se endpoint não existe ainda, retorna dados vazios
    if (response.status === 404) {
      return EMPTY_DATA;
    }
    throw new Error('Erro ao carregar dados omnichannel');
  }

  return response.json();
}

async function fetchChannels(): Promise<WhatsAppChannel[]> {
  const token = localStorage.getItem('token');

  if (!token) {
    throw new Error('Token não encontrado');
  }

  const response = await fetch(`${API_URL}/api/admin/omnichannel/channels`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    if (response.status === 404) {
      return [];
    }
    throw new Error('Erro ao carregar canais');
  }

  const data = await response.json();
  return data.channels || [];
}

async function fetchMetrics(): Promise<OmnichannelMetrics> {
  const token = localStorage.getItem('token');

  if (!token) {
    throw new Error('Token não encontrado');
  }

  const response = await fetch(`${API_URL}/api/admin/omnichannel/metrics`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    if (response.status === 404) {
      return EMPTY_METRICS;
    }
    throw new Error('Erro ao carregar métricas');
  }

  return response.json();
}

// ============================================
// HOOKS
// ============================================
export function useOmnichannelData() {
  return useQuery({
    queryKey: ['admin', 'omnichannel'],
    queryFn: fetchOmnichannelData,
    staleTime: 1000 * 60 * 2, // 2 minutos
    retry: 1,
  });
}

export function useOmnichannelChannels() {
  return useQuery({
    queryKey: ['admin', 'omnichannel', 'channels'],
    queryFn: fetchChannels,
    staleTime: 1000 * 60 * 2,
    retry: 1,
  });
}

export function useOmnichannelMetrics() {
  return useQuery({
    queryKey: ['admin', 'omnichannel', 'metrics'],
    queryFn: fetchMetrics,
    staleTime: 1000 * 60, // 1 minuto
    retry: 1,
  });
}
