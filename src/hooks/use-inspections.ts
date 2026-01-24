// ============================================
// HOOK: useInspections
// CRUD de vistorias - CONECTADO A API
// ============================================

import { useQuery } from '@tanstack/react-query';

const API_URL = import.meta.env.VITE_API_URL || 'https://vinculobrasil-production.up.railway.app';

// ============================================
// TIPOS
// ============================================
export type InspectionType = 'ENTRY' | 'EXIT';
export type InspectionStatus = 'SCHEDULED' | 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type InspectionResponsible = 'TENANT' | 'LANDLORD' | 'AGENCY';

export interface Inspection {
  id: string;
  propertyId: string;
  property: {
    id: string;
    title: string;
    fullAddress: string;
  };
  contractId?: string;
  type: InspectionType;
  status: InspectionStatus;
  scheduledDate: string;
  scheduledTime?: string;
  responsibleType: InspectionResponsible;
  responsibleId: string;
  responsibleName: string;
  completedAt?: string;
  reportUrl?: string;
  notes?: string;
  createdAt: string;
}

export interface InspectionStats {
  total: number;
  scheduled: number;
  pending: number;
  inProgress: number;
  completed: number;
}

// ============================================
// FETCHER
// ============================================
async function fetchInspections(params?: {
  type?: string;
  status?: string;
  search?: string;
}): Promise<{ inspections: Inspection[]; stats: InspectionStats }> {
  const token = localStorage.getItem('token');

  if (!token) {
    throw new Error('Token n encontrado');
  }

  const searchParams = new URLSearchParams();
  if (params?.type && params.type !== 'all') {
    searchParams.append('type', params.type.toUpperCase());
  }
  if (params?.status && params.status !== 'all') {
    searchParams.append('status', params.status.toUpperCase());
  }
  if (params?.search) {
    searchParams.append('search', params.search);
  }

  const response = await fetch(`${API_URL}/api/agency/inspections?${searchParams}`, {
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
      inspections: [],
      stats: { total: 0, scheduled: 0, pending: 0, inProgress: 0, completed: 0 },
    };
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Erro ao carregar vistorias');
  }

  return response.json();
}

// ============================================
// HOOK
// ============================================
export function useInspections(params?: { type?: string; status?: string; search?: string }) {
  return useQuery({
    queryKey: ['inspections', params],
    queryFn: () => fetchInspections(params),
    staleTime: 1000 * 60 * 2, // 2 minutos
  });
}
