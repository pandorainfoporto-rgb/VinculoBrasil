// ============================================
// HOOK: useAgencyContracts
// CRUD de contratos da imobiliária
// ============================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const API_URL = import.meta.env.VITE_API_URL || 'https://vinculobrasil-production.up.railway.app';

// ============================================
// TIPOS
// ============================================
export interface Contract {
  id: string;
  propertyId: string;
  property: {
    id: string;
    title: string;
    fullAddress: string;
    rentValue: number;
  };
  tenantId: string;
  tenant: {
    id: string;
    name: string;
    email: string;
  };
  ownerId: string;
  owner: {
    id: string;
    name: string;
    email: string;
  };
  startDate: string;
  endDate: string;
  rentValue: number;
  status: 'DRAFT' | 'PENDING_SIGNATURE' | 'ACTIVE' | 'EXPIRED' | 'TERMINATED';
  signedAt?: string;
  createdAt: string;
}

export interface ContractStats {
  total: number;
  active: number;
  pending: number;
  expired: number;
  totalMonthlyValue: number;
}

export interface CreateContractData {
  propertyId: string;
  tenantId: string;
  startDate: string;
  endDate: string;
  rentValue: number;
  paymentDay?: number;
}

export interface AvailableProperty {
  id: string;
  title: string;
  fullAddress: string;
  rentValue: number;
  status: string;
}

export interface AvailableTenant {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

export interface AvailableLandlord {
  id: string;
  name: string;
  email: string;
  phone?: string;
}

// ============================================
// FETCHERS
// ============================================
async function fetchContracts(params?: {
  status?: string;
  search?: string;
}): Promise<{ contracts: Contract[]; stats: ContractStats }> {
  const token = localStorage.getItem('token');

  if (!token) {
    throw new Error('Token não encontrado');
  }

  const searchParams = new URLSearchParams();
  if (params?.status && params.status !== 'all') {
    searchParams.append('status', params.status.toUpperCase());
  }
  if (params?.search) {
    searchParams.append('search', params.search);
  }

  const response = await fetch(`${API_URL}/api/agency/contracts?${searchParams}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  // Verifica se a resposta é JSON antes de parsear
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    console.warn('[API] Resposta não é JSON - endpoint pode não existir');
    // Retorna dados vazios em vez de quebrar
    return { contracts: [], stats: { total: 0, active: 0, pending: 0, expired: 0, totalMonthlyValue: 0 } };
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Erro ao carregar contratos');
  }

  return response.json();
}

async function fetchAvailableProperties(): Promise<AvailableProperty[]> {
  const token = localStorage.getItem('token');

  if (!token) {
    throw new Error('Token não encontrado');
  }

  const response = await fetch(`${API_URL}/api/agency/properties?status=AVAILABLE`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Erro ao carregar imóveis disponíveis');
  }

  const data = await response.json();
  return data.properties || [];
}

async function fetchTenants(): Promise<AvailableTenant[]> {
  const token = localStorage.getItem('token');

  if (!token) {
    throw new Error('Token não encontrado');
  }

  const response = await fetch(`${API_URL}/api/agency/tenants`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Erro ao carregar inquilinos');
  }

  const data = await response.json();
  return data.tenants || [];
}

async function fetchLandlords(): Promise<AvailableLandlord[]> {
  const token = localStorage.getItem('token');

  if (!token) {
    throw new Error('Token não encontrado');
  }

  const response = await fetch(`${API_URL}/api/agency/owners`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Erro ao carregar proprietários');
  }

  const data = await response.json();
  return data.owners || [];
}

async function createContract(data: CreateContractData): Promise<Contract> {
  const token = localStorage.getItem('token');

  if (!token) {
    throw new Error('Token não encontrado');
  }

  const response = await fetch(`${API_URL}/api/agency/contracts`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Erro ao criar contrato' }));
    throw new Error(error.error || 'Erro ao criar contrato');
  }

  return response.json();
}

// ============================================
// HOOKS
// ============================================
export function useAgencyContracts(params?: { status?: string; search?: string }) {
  return useQuery({
    queryKey: ['agency', 'contracts', params],
    queryFn: () => fetchContracts(params),
    staleTime: 1000 * 60 * 2,
  });
}

export function useAvailableProperties() {
  return useQuery({
    queryKey: ['agency', 'properties', 'available'],
    queryFn: fetchAvailableProperties,
    staleTime: 1000 * 60 * 2,
  });
}

export function useAgencyTenants() {
  return useQuery({
    queryKey: ['agency', 'tenants'],
    queryFn: fetchTenants,
    staleTime: 1000 * 60 * 2,
  });
}

export function useAgencyOwners() {
  return useQuery({
    queryKey: ['agency', 'owners'],
    queryFn: fetchLandlords,
    staleTime: 1000 * 60 * 2,
  });
}

export function useCreateContract() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createContract,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agency', 'contracts'] });
      queryClient.invalidateQueries({ queryKey: ['agency', 'properties'] });
      toast.success('Contrato criado com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao criar contrato');
    },
  });
}
