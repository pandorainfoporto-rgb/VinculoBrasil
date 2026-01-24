/**
 * Marketplace API Hooks
 *
 * Provides React Query hooks for marketplace management:
 * - Partners CRUD
 * - Marketplace Items CRUD
 * - Approval actions
 * - Statistics
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// ============================================
// TYPES
// ============================================

export type MarketplaceItemStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CHANGES_REQUESTED';

export interface Partner {
  id: string;
  name: string;
  tradeName: string | null;
  cnpj: string;
  email: string;
  phone: string | null;
  website: string | null;
  logo: string | null;
  description: string | null;
  street: string | null;
  number: string | null;
  complement: string | null;
  neighborhood: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  defaultCommissionRate: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: {
    items: number;
  };
  items?: MarketplaceItem[];
}

export interface MarketplaceItem {
  id: string;
  partnerId: string;
  title: string;
  description: string | null;
  category: string;
  basePrice: number;
  images: string[];
  status: MarketplaceItemStatus;
  adminFeedback: string | null;
  negotiatedCommission: number | null;
  acceptsVbrz: boolean;
  acceptsCrypto: boolean;
  acceptsPix: boolean;
  acceptsCard: boolean;
  vinculoClientDiscount: number;
  featured: boolean;
  displayOrder: number;
  isActive: boolean;
  submittedAt: string;
  approvedAt: string | null;
  approvedBy: string | null;
  createdAt: string;
  updatedAt: string;
  partner?: {
    id: string;
    name: string;
    cnpj?: string;
    defaultCommissionRate?: number;
  };
}

export interface MarketplaceStats {
  partners: {
    total: number;
    active: number;
  };
  items: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    changesRequested: number;
  };
  topCategories: Array<{
    category: string;
    count: number;
  }>;
}

export interface CreatePartnerInput {
  name: string;
  tradeName?: string;
  cnpj: string;
  email: string;
  phone?: string;
  website?: string;
  logo?: string;
  description?: string;
  street?: string;
  number?: string;
  complement?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  defaultCommissionRate?: number;
  isActive?: boolean;
}

export interface CreateMarketplaceItemInput {
  partnerId: string;
  title: string;
  description?: string;
  category: string;
  basePrice: number;
  images?: string[];
  negotiatedCommission?: number;
  acceptsVbrz?: boolean;
  acceptsCrypto?: boolean;
  acceptsPix?: boolean;
  acceptsCard?: boolean;
  vinculoClientDiscount?: number;
  featured?: boolean;
  displayOrder?: number;
}

export interface ApprovalAction {
  action: 'approve' | 'reject' | 'request_changes';
  feedback?: string;
}

export interface PaymentFlagsUpdate {
  acceptsVbrz?: boolean;
  acceptsCrypto?: boolean;
  acceptsPix?: boolean;
  acceptsCard?: boolean;
}

// ============================================
// API BASE URL
// ============================================

const API_BASE = '/api/marketplace';

async function fetchAPI<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || error.message || 'API request failed');
  }

  return response.json();
}

// ============================================
// PARTNERS HOOKS
// ============================================

export function usePartners(filters?: { search?: string; isActive?: boolean }) {
  const queryParams = new URLSearchParams();
  if (filters?.search) queryParams.set('search', filters.search);
  if (filters?.isActive !== undefined) queryParams.set('isActive', String(filters.isActive));
  const queryString = queryParams.toString();

  return useQuery({
    queryKey: ['partners', filters],
    queryFn: () => fetchAPI<{ data: Partner[] }>(`${API_BASE}/partners${queryString ? `?${queryString}` : ''}`),
    select: (response) => response.data,
  });
}

export function usePartner(id: string) {
  return useQuery({
    queryKey: ['partner', id],
    queryFn: () => fetchAPI<{ data: Partner }>(`${API_BASE}/partners/${id}`),
    select: (response) => response.data,
    enabled: !!id,
  });
}

export function useCreatePartner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreatePartnerInput) =>
      fetchAPI<{ data: Partner }>(`${API_BASE}/partners`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partners'] });
      queryClient.invalidateQueries({ queryKey: ['marketplace-stats'] });
    },
  });
}

export function useUpdatePartner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreatePartnerInput> }) =>
      fetchAPI<{ data: Partner }>(`${API_BASE}/partners/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['partners'] });
      queryClient.invalidateQueries({ queryKey: ['partner', variables.id] });
    },
  });
}

export function useDeletePartner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      fetchAPI<{ success: boolean }>(`${API_BASE}/partners/${id}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partners'] });
      queryClient.invalidateQueries({ queryKey: ['marketplace-stats'] });
    },
  });
}

// ============================================
// MARKETPLACE ITEMS HOOKS
// ============================================

export function useMarketplaceItems(filters?: {
  status?: MarketplaceItemStatus;
  category?: string;
  partnerId?: string;
  search?: string;
}) {
  const queryParams = new URLSearchParams();
  if (filters?.status) queryParams.set('status', filters.status);
  if (filters?.category) queryParams.set('category', filters.category);
  if (filters?.partnerId) queryParams.set('partnerId', filters.partnerId);
  if (filters?.search) queryParams.set('search', filters.search);
  const queryString = queryParams.toString();

  return useQuery({
    queryKey: ['marketplace-items', filters],
    queryFn: () => fetchAPI<{ data: MarketplaceItem[] }>(`${API_BASE}/items${queryString ? `?${queryString}` : ''}`),
    select: (response) => response.data,
  });
}

export function usePendingItems() {
  return useQuery({
    queryKey: ['marketplace-items', 'pending'],
    queryFn: () => fetchAPI<{ data: MarketplaceItem[] }>(`${API_BASE}/items/pending`),
    select: (response) => response.data,
  });
}

export function useMarketplaceItem(id: string) {
  return useQuery({
    queryKey: ['marketplace-item', id],
    queryFn: () => fetchAPI<{ data: MarketplaceItem }>(`${API_BASE}/items/${id}`),
    select: (response) => response.data,
    enabled: !!id,
  });
}

export function useCreateMarketplaceItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateMarketplaceItemInput) =>
      fetchAPI<{ data: MarketplaceItem }>(`${API_BASE}/items`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketplace-items'] });
      queryClient.invalidateQueries({ queryKey: ['marketplace-stats'] });
    },
  });
}

export function useUpdateMarketplaceItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateMarketplaceItemInput> }) =>
      fetchAPI<{ data: MarketplaceItem }>(`${API_BASE}/items/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['marketplace-items'] });
      queryClient.invalidateQueries({ queryKey: ['marketplace-item', variables.id] });
    },
  });
}

export function useApproveItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: ApprovalAction }) =>
      fetchAPI<{ data: MarketplaceItem }>(`${API_BASE}/items/${id}/approval`, {
        method: 'POST',
        body: JSON.stringify(action),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketplace-items'] });
      queryClient.invalidateQueries({ queryKey: ['marketplace-stats'] });
    },
  });
}

export function useUpdatePaymentFlags() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, flags }: { id: string; flags: PaymentFlagsUpdate }) =>
      fetchAPI<{ data: MarketplaceItem }>(`${API_BASE}/items/${id}/payment-flags`, {
        method: 'PATCH',
        body: JSON.stringify(flags),
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['marketplace-items'] });
      queryClient.invalidateQueries({ queryKey: ['marketplace-item', variables.id] });
    },
  });
}

export function useDeleteMarketplaceItem() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      fetchAPI<{ success: boolean }>(`${API_BASE}/items/${id}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marketplace-items'] });
      queryClient.invalidateQueries({ queryKey: ['marketplace-stats'] });
    },
  });
}

// ============================================
// STATISTICS HOOK
// ============================================

export function useMarketplaceStats() {
  return useQuery({
    queryKey: ['marketplace-stats'],
    queryFn: () => fetchAPI<{ data: MarketplaceStats }>(`${API_BASE}/stats`),
    select: (response) => response.data,
  });
}
