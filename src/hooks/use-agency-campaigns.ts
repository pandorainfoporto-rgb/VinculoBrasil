// ============================================
// HOOK: useAgencyCampaigns
// Busca campanhas de marketing da imobiliária
// ============================================

import { useQuery } from '@tanstack/react-query';

const API_URL = import.meta.env.VITE_API_URL || 'https://vinculobrasil-production.up.railway.app';

// ============================================
// TIPOS
// ============================================
export interface Campaign {
  id: string;
  name: string;
  description?: string;
  platform: 'facebook' | 'instagram' | 'google' | 'tiktok';
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'DRAFT';
  budget: number;
  spent: number;
  impressions: number;
  clicks: number;
  leads: number;
  ctr: number;
  cpl: number;
  startDate: string;
  endDate?: string;
  createdAt: string;
}

export interface CampaignStats {
  totalInvested: number;
  totalImpressions: number;
  totalClicks: number;
  totalLeads: number;
  avgCtr: number;
  avgCpl: number;
  activeCampaigns: number;
}

// Dados vazios para quando API não está disponível
const EMPTY_RESPONSE: { campaigns: Campaign[]; stats: CampaignStats } = {
  campaigns: [],
  stats: {
    totalInvested: 0,
    totalImpressions: 0,
    totalClicks: 0,
    totalLeads: 0,
    avgCtr: 0,
    avgCpl: 0,
    activeCampaigns: 0,
  },
};

// ============================================
// FETCHER
// ============================================
async function fetchCampaigns(params?: {
  status?: string;
  platform?: string;
}): Promise<{ campaigns: Campaign[]; stats: CampaignStats }> {
  const token = localStorage.getItem('token');

  // Se não há API configurada, retorna dados vazios
  if (!API_URL || API_URL === '') {
    console.warn('[Campaigns] API URL não configurada');
    return EMPTY_RESPONSE;
  }

  if (!token) {
    console.warn('[Campaigns] Token não encontrado');
    return EMPTY_RESPONSE;
  }

  const searchParams = new URLSearchParams();
  if (params?.status && params.status !== 'all') {
    searchParams.append('status', params.status.toUpperCase());
  }
  if (params?.platform && params.platform !== 'all') {
    searchParams.append('platform', params.platform);
  }

  try {
    const response = await fetch(`${API_URL}/api/agency/campaigns?${searchParams}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    // Verifica se a resposta é JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.warn('[Campaigns] API retornou resposta não-JSON');
      return EMPTY_RESPONSE;
    }

    if (!response.ok) {
      console.warn('[Campaigns] Erro na API:', response.status);
      return EMPTY_RESPONSE;
    }

    return response.json();
  } catch (error) {
    console.warn('[Campaigns] Erro ao buscar campanhas:', error);
    return EMPTY_RESPONSE;
  }
}

// ============================================
// HOOK
// ============================================
export function useAgencyCampaigns(params?: { status?: string; platform?: string }) {
  return useQuery({
    queryKey: ['agency', 'campaigns', params],
    queryFn: () => fetchCampaigns(params),
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}
