/**
 * Vouchers API Hooks
 *
 * Provides React Query hooks for voucher management:
 * - Campaigns CRUD
 * - Code generation
 * - Redemption
 * - Statistics
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// ============================================
// TYPES
// ============================================

export type VoucherSettlementType = 'BURN' | 'PARTNER_WALLET';
export type VoucherCodeStatus = 'AVAILABLE' | 'REDEEMED' | 'EXPIRED' | 'CANCELLED';

export interface VoucherCampaign {
  id: string;
  partnerId: string;
  title: string;
  description: string | null;
  rules: string | null;
  termsAndConditions: string | null;
  costInVbrz: number;
  originalValue: number | null;
  discountPercentage: number | null;
  settlementType: VoucherSettlementType;
  partnerWalletAddress: string | null;
  totalStock: number;
  availableStock: number;
  maxPerUser: number;
  minVbrzBalance: number | null;
  startDate: string;
  expirationDate: string | null;
  bannerImage: string | null;
  thumbnailImage: string | null;
  category: string | null;
  featured: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  partner?: {
    id: string;
    name: string;
    tradeName?: string;
    logo?: string;
  };
  _count?: {
    codes: number;
    redemptions: number;
  };
}

export interface VoucherCode {
  id: string;
  campaignId: string;
  code: string;
  status: VoucherCodeStatus;
  redeemedById: string | null;
  redeemedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
}

export interface VoucherRedemption {
  id: string;
  voucherCode: string;
  campaign: {
    id: string;
    title: string;
    description: string | null;
    rules: string | null;
    partner: {
      name: string;
      tradeName?: string;
      logo?: string;
    };
  };
  vbrzPaid: number;
  settlementType: VoucherSettlementType;
  txHash: string;
  txStatus: string;
  redeemedAt: string;
  usedAt: string | null;
}

export interface VoucherStats {
  campaigns: {
    total: number;
    active: number;
  };
  redemptions: {
    total: number;
    confirmed: number;
    pending: number;
  };
  tokenomics: {
    burnRedemptions: number;
    transferRedemptions: number;
    totalBurnedVbrz: number;
    totalTransferredVbrz: number;
  };
}

export interface CreateCampaignInput {
  partnerId: string;
  title: string;
  description?: string;
  rules?: string;
  termsAndConditions?: string;
  costInVbrz: number;
  originalValue?: number;
  discountPercentage?: number;
  settlementType: VoucherSettlementType;
  partnerWalletAddress?: string;
  totalStock: number;
  maxPerUser?: number;
  minVbrzBalance?: number;
  startDate?: string;
  expirationDate?: string;
  bannerImage?: string;
  thumbnailImage?: string;
  category?: string;
  featured?: boolean;
}

export interface RedeemVoucherInput {
  campaignId: string;
  userWalletAddress: string;
  txHash: string;
}

export interface RedemptionResult {
  redemptionId: string;
  voucherCode: string;
  status: string;
  message: string;
}

// ============================================
// API BASE URL
// ============================================

const API_BASE = '/api/vouchers';

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
// CAMPAIGNS HOOKS (Admin)
// ============================================

export function useVoucherCampaigns(filters?: {
  partnerId?: string;
  isActive?: boolean;
  settlementType?: VoucherSettlementType;
}) {
  const queryParams = new URLSearchParams();
  if (filters?.partnerId) queryParams.set('partnerId', filters.partnerId);
  if (filters?.isActive !== undefined) queryParams.set('isActive', String(filters.isActive));
  if (filters?.settlementType) queryParams.set('settlementType', filters.settlementType);
  const queryString = queryParams.toString();

  return useQuery({
    queryKey: ['voucher-campaigns', filters],
    queryFn: () => fetchAPI<{ data: VoucherCampaign[] }>(`${API_BASE}/campaigns${queryString ? `?${queryString}` : ''}`),
    select: (response) => response.data,
  });
}

export function useVoucherCampaign(id: string) {
  return useQuery({
    queryKey: ['voucher-campaign', id],
    queryFn: () => fetchAPI<{ data: VoucherCampaign & { codes: VoucherCode[] } }>(`${API_BASE}/campaigns/${id}`),
    select: (response) => response.data,
    enabled: !!id,
  });
}

export function useCreateVoucherCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCampaignInput) =>
      fetchAPI<{ data: VoucherCampaign }>(`${API_BASE}/campaigns`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voucher-campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['voucher-stats'] });
    },
  });
}

export function useUpdateVoucherCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateCampaignInput> }) =>
      fetchAPI<{ data: VoucherCampaign }>(`${API_BASE}/campaigns/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['voucher-campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['voucher-campaign', variables.id] });
    },
  });
}

export function useDeleteVoucherCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      fetchAPI<{ success: boolean }>(`${API_BASE}/campaigns/${id}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['voucher-campaigns'] });
      queryClient.invalidateQueries({ queryKey: ['voucher-stats'] });
    },
  });
}

export function useGenerateVoucherCodes() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ campaignId, quantity, prefix }: { campaignId: string; quantity: number; prefix?: string }) =>
      fetchAPI<{ data: { generated: number; codes: string[] } }>(`${API_BASE}/campaigns/${campaignId}/generate-codes`, {
        method: 'POST',
        body: JSON.stringify({ quantity, prefix }),
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['voucher-campaign', variables.campaignId] });
      queryClient.invalidateQueries({ queryKey: ['voucher-campaigns'] });
    },
  });
}

// ============================================
// PUBLIC/CLIENT HOOKS
// ============================================

export function useAvailableVouchers(category?: string) {
  const queryParams = new URLSearchParams();
  if (category) queryParams.set('category', category);
  const queryString = queryParams.toString();

  return useQuery({
    queryKey: ['available-vouchers', category],
    queryFn: () => fetchAPI<{ data: VoucherCampaign[] }>(`${API_BASE}/available${queryString ? `?${queryString}` : ''}`),
    select: (response) => response.data,
  });
}

export function useRedeemVoucher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RedeemVoucherInput) =>
      fetchAPI<{ data: RedemptionResult }>(`${API_BASE}/redeem`, {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['available-vouchers'] });
      queryClient.invalidateQueries({ queryKey: ['my-vouchers'] });
      queryClient.invalidateQueries({ queryKey: ['voucher-campaigns'] });
    },
  });
}

export function useConfirmRedemption() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ redemptionId, blockNumber }: { redemptionId: string; blockNumber?: number }) =>
      fetchAPI<{ data: { redemptionId: string; voucherCode: string; status: string } }>(`${API_BASE}/confirm`, {
        method: 'POST',
        body: JSON.stringify({ redemptionId, blockNumber }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-vouchers'] });
    },
  });
}

export function useMyVouchers() {
  return useQuery({
    queryKey: ['my-vouchers'],
    queryFn: () => fetchAPI<{ data: VoucherRedemption[] }>(`${API_BASE}/my-vouchers`),
    select: (response) => response.data,
  });
}

// ============================================
// STATISTICS HOOK
// ============================================

export function useVoucherStats() {
  return useQuery({
    queryKey: ['voucher-stats'],
    queryFn: () => fetchAPI<{ data: VoucherStats }>(`${API_BASE}/stats`),
    select: (response) => response.data,
  });
}
