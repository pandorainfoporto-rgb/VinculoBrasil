// ============================================
// HOOK: useAgencyProperties
// CRUD completo de imóveis da imobiliária
// ============================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const API_URL = import.meta.env.VITE_API_URL || 'https://vinculobrasil-production.up.railway.app';

// ============================================
// TIPOS
// ============================================
export interface PropertyOwner {
  id: string;
  name: string;
  email: string;
  phone?: string;
  pixKey?: string;
}

export interface PropertyCommission {
  rate: number;
  model: string;
  value: number;
  ownerReceives: number;
  tenantPays: number;
}

export interface Property {
  id: string;
  title: string;
  description?: string;
  type: string;
  status: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  fullAddress: string;
  area?: number;
  bedrooms?: number;
  bathrooms?: number;
  parkingSpaces?: number;
  rentValue: number;
  condoFee?: number;
  iptuValue?: number;
  owner: PropertyOwner;
  commission: PropertyCommission;
  isPromoted: boolean;
  promotedUntil?: string;
  isPublished: boolean;
  thumbnail?: string;
  _count: {
    contracts: number;
    inspections: number;
  };
  createdAt: string;
}

export interface PropertiesStats {
  total: number;
  available: number;
  rented: number;
  promoted: number;
  maintenance: number;
  totalRentValue: number;
  commissionRate: number;
  potentialMonthlyCommission: number;
}

export interface CreatePropertyData {
  ownerId: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  propertyType: string;
  bedrooms?: number;
  bathrooms?: number;
  parkingSpaces?: number;
  area: number;
  description?: string;
  baseValue: number;
  pricingModel: 'GROSS' | 'NET';
  commissionType: 'PERCENTAGE' | 'FIXED';
  commissionValue: number;
  condoFee?: number;
  iptuValue?: number;
}

// ============================================
// FETCHERS
// ============================================
async function fetchProperties(params?: {
  status?: string;
  search?: string;
}): Promise<{ properties: Property[]; stats: PropertiesStats }> {
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

  const response = await fetch(`${API_URL}/api/agency/properties?${searchParams}`, {
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
    return { properties: [], stats: { total: 0, available: 0, rented: 0, promoted: 0, maintenance: 0, totalRentValue: 0, commissionRate: 0, potentialMonthlyCommission: 0 } };
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Erro ao carregar imóveis');
  }

  return response.json();
}

async function fetchPropertiesStats(): Promise<PropertiesStats> {
  const token = localStorage.getItem('token');

  if (!token) {
    throw new Error('Token não encontrado');
  }

  const response = await fetch(`${API_URL}/api/agency/properties/stats/summary`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Erro ao carregar estatísticas');
  }

  return response.json();
}

async function createProperty(data: CreatePropertyData): Promise<Property> {
  const token = localStorage.getItem('token');

  if (!token) {
    throw new Error('Token não encontrado');
  }

  const response = await fetch(`${API_URL}/api/agency/properties`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Erro ao criar imóvel' }));
    throw new Error(error.error || 'Erro ao criar imóvel');
  }

  return response.json();
}

async function deleteProperty(id: string): Promise<void> {
  const token = localStorage.getItem('token');

  if (!token) {
    throw new Error('Token não encontrado');
  }

  const response = await fetch(`${API_URL}/api/agency/properties/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Erro ao excluir imóvel' }));
    throw new Error(error.error || 'Erro ao excluir imóvel');
  }
}

async function promoteProperty(id: string, days: number): Promise<Property> {
  const token = localStorage.getItem('token');

  if (!token) {
    throw new Error('Token não encontrado');
  }

  const response = await fetch(`${API_URL}/api/agency/properties/${id}/promote`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      days,
      promotionType: 'FIXED_TIME',
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Erro ao promover imóvel' }));
    throw new Error(error.error || 'Erro ao promover imóvel');
  }

  return response.json();
}

// ============================================
// HOOKS
// ============================================
export function useAgencyProperties(params?: { status?: string; search?: string }) {
  return useQuery({
    queryKey: ['agency', 'properties', params],
    queryFn: () => fetchProperties(params),
    staleTime: 1000 * 60 * 2, // 2 minutos
  });
}

export function useAgencyPropertiesStats() {
  return useQuery({
    queryKey: ['agency', 'properties', 'stats'],
    queryFn: fetchPropertiesStats,
    staleTime: 1000 * 60 * 2,
  });
}

export function useCreateProperty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProperty,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agency', 'properties'] });
      toast.success('Imóvel cadastrado com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao cadastrar imóvel');
    },
  });
}

export function useDeleteProperty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProperty,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['agency', 'properties'] });
      toast.success('Imóvel excluído com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao excluir imóvel');
    },
  });
}

export function usePromoteProperty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, days }: { id: string; days: number }) => promoteProperty(id, days),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['agency', 'properties'] });
      toast.success(`Imóvel promovido por ${variables.days} dias!`);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao promover imóvel');
    },
  });
}
