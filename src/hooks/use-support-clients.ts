// ============================================
// HOOK: useSupportClients
// Lista de clientes para suporte - CONECTADO A API
// ============================================

import { useQuery } from '@tanstack/react-query';

const API_URL = import.meta.env.VITE_API_URL || 'https://vinculobrasil-production.up.railway.app';

// ============================================
// TIPOS
// ============================================
export type ClientRole = 'TENANT' | 'LANDLORD' | 'GUARANTOR' | 'INVESTOR' | 'AGENCY_USER';
export type ClientStatus = 'ACTIVE' | 'PENDING' | 'INACTIVE' | 'BLOCKED';

export interface SupportClient {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: ClientRole;
  status: ClientStatus;
  agencyId?: string;
  agencyName?: string;
  lastActivityAt?: string;
  createdAt: string;
}

export interface SupportClientStats {
  total: number;
  tenants: number;
  landlords: number;
  guarantors: number;
  investors: number;
  agencyUsers: number;
  active: number;
  pending: number;
}

// ============================================
// FETCHER
// ============================================
async function fetchSupportClients(params?: {
  role?: string;
  status?: string;
  search?: string;
}): Promise<{ clients: SupportClient[]; stats: SupportClientStats }> {
  const token = localStorage.getItem('token');

  if (!token) {
    throw new Error('Token n encontrado');
  }

  const searchParams = new URLSearchParams();
  if (params?.role && params.role !== 'all') {
    searchParams.append('role', params.role.toUpperCase());
  }
  if (params?.status && params.status !== 'all') {
    searchParams.append('status', params.status.toUpperCase());
  }
  if (params?.search) {
    searchParams.append('search', params.search);
  }

  const response = await fetch(`${API_URL}/api/admin/support/clients?${searchParams}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  // Verifica se a resposta JSON antes de parsear
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    console.warn('[API] Resposta n JSON - endpoint pode n existir');
    // Retorna dados vazios em vez de quebrar
    return {
      clients: [],
      stats: {
        total: 0,
        tenants: 0,
        landlords: 0,
        guarantors: 0,
        investors: 0,
        agencyUsers: 0,
        active: 0,
        pending: 0,
      },
    };
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Erro ao carregar clientes');
  }

  return response.json();
}

// ============================================
// HOOK
// ============================================
export function useSupportClients(params?: { role?: string; status?: string; search?: string }) {
  return useQuery({
    queryKey: ['support', 'clients', params],
    queryFn: () => fetchSupportClients(params),
    staleTime: 1000 * 60 * 2, // 2 minutos
  });
}
