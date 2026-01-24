// ============================================
// P2P MARKETPLACE HOOK
// Cessão de Crédito Digital (Sem CVM)
// ============================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

// ============================================
// TYPES
// ============================================

export interface P2PListing {
  id: string;
  contractId: string;
  faceValue: number;
  askingPrice: number;
  discountPercent: number;
  tenantScore: number | null;
  monthsRemaining: number;
  monthlyValue: number;
  city: string;
  state: string;
}

export interface P2PListingDetails {
  listing: {
    id: string;
    contractId: string;
    receivableTokenId: string;
    faceValue: number;
    askingPrice: number;
    discountPercent: number;
    totalMonths: number;
    monthlyValue: number;
    startMonth: string;
    endMonth: string;
    tenantScore: number | null;
    contractGuarantee: string | null;
    status: string;
    createdAt: string;
  };
  property: {
    id: string;
    title: string;
    type: string;
    city: string;
    state: string;
    neighborhood: string;
    bedrooms: number | null;
    area: number | null;
    images: string[];
  };
  contract: {
    startDate: string;
    endDate: string;
    dueDay: number;
    hasGuarantor: boolean;
    guarantorType: string | null;
  };
  tenantMetrics: {
    paymentScore: number;
    totalPayments: number;
    paidOnTime: number;
  };
}

export interface P2PStats {
  totalListings: number;
  activeListings: number;
  totalSales: number;
  totalVolume: number;
  averageDiscount: number;
}

export interface P2PSimulation {
  seller: {
    faceValue: number;
    discountPercent: number;
    askingPrice: number;
    platformFee: number;
    netToSeller: number;
    receivingNowVsFaceValue: number;
  };
  investor: {
    purchasePrice: number;
    totalReceivables: number;
    netReceivables: number;
    profit: number;
    totalYield: number;
    monthlyYield: number;
  };
  period: {
    months: number;
    startDate: string;
    endDate: string;
  };
}

export interface MyListing {
  id: string;
  contractId: string;
  propertyTitle: string;
  faceValue: number;
  askingPrice: number;
  discountPercent: number;
  status: string;
  soldAt: string | null;
  soldPrice: number | null;
  createdAt: string;
}

export interface MyPurchase {
  id: string;
  contractId: string;
  propertyTitle: string;
  city: string;
  purchasePrice: number;
  purchaseDate: string;
  monthsRemaining: number;
  expectedReceipts: number;
  estimatedYield: number;
  nextPaymentDate: string | null;
  nextPaymentAmount: number | null;
}

export interface ListingFilters {
  minDiscount?: number;
  maxDiscount?: number;
  minTenantScore?: number;
  city?: string;
  page?: number;
  limit?: number;
}

export interface CreateListingInput {
  contractId: string;
  askingPrice: number;
  priceInMatic?: number;
  priceInStable?: number;
  walletAddress: string;
  userId: string;
}

// ============================================
// API BASE URL
// ============================================

const API_BASE = '/api/p2p';

// ============================================
// API FUNCTIONS
// ============================================

const fetchListings = async (filters: ListingFilters = {}): Promise<{
  listings: P2PListing[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}> => {
  const params = new URLSearchParams();
  if (filters.minDiscount) params.set('minDiscount', String(filters.minDiscount));
  if (filters.maxDiscount) params.set('maxDiscount', String(filters.maxDiscount));
  if (filters.minTenantScore) params.set('minTenantScore', String(filters.minTenantScore));
  if (filters.city) params.set('city', filters.city);
  if (filters.page) params.set('page', String(filters.page));
  if (filters.limit) params.set('limit', String(filters.limit));

  const response = await fetch(`${API_BASE}/listings?${params.toString()}`);
  if (!response.ok) throw new Error('Erro ao buscar ofertas');

  const json = await response.json();
  return json.data;
};

const fetchListingById = async (id: string): Promise<P2PListingDetails> => {
  const response = await fetch(`${API_BASE}/listings/${id}`);
  if (!response.ok) throw new Error('Erro ao buscar oferta');

  const json = await response.json();
  return json.data;
};

const fetchStats = async (): Promise<P2PStats> => {
  const response = await fetch(`${API_BASE}/stats`);
  if (!response.ok) throw new Error('Erro ao buscar estatísticas');

  const json = await response.json();
  return json.data;
};

const fetchMyListings = async (token: string): Promise<MyListing[]> => {
  const response = await fetch(`${API_BASE}/my-listings`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Erro ao buscar suas ofertas');

  const json = await response.json();
  return json.data;
};

const fetchMyPurchases = async (token: string): Promise<MyPurchase[]> => {
  const response = await fetch(`${API_BASE}/my-purchases`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Erro ao buscar suas compras');

  const json = await response.json();
  return json.data;
};

const createListing = async (input: CreateListingInput, token: string): Promise<{
  listingId: string;
  listingIdOnChain: string;
  txHash: string;
}> => {
  const response = await fetch(`${API_BASE}/listings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erro ao criar oferta');
  }

  const json = await response.json();
  return json.data;
};

const cancelListing = async (listingId: string, token: string): Promise<void> => {
  const response = await fetch(`${API_BASE}/listings/${listingId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Erro ao cancelar oferta');
  }
};

const simulateListing = async (input: {
  monthlyRent: number;
  monthsToSell: number;
  discountPercent?: number;
}): Promise<P2PSimulation> => {
  const response = await fetch(`${API_BASE}/simulate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });

  if (!response.ok) throw new Error('Erro ao simular');

  const json = await response.json();
  return json.data;
};

// ============================================
// CUSTOM HOOKS
// ============================================

/**
 * Hook para buscar ofertas ativas no marketplace
 */
export function useP2PListings(filters: ListingFilters = {}) {
  return useQuery({
    queryKey: ['p2p-listings', filters],
    queryFn: () => fetchListings(filters),
    staleTime: 1000 * 60 * 2, // 2 minutos
  });
}

/**
 * Hook para buscar detalhes de uma oferta
 */
export function useP2PListingDetails(id: string) {
  return useQuery({
    queryKey: ['p2p-listing', id],
    queryFn: () => fetchListingById(id),
    enabled: !!id,
  });
}

/**
 * Hook para buscar estatísticas do marketplace
 */
export function useP2PStats() {
  return useQuery({
    queryKey: ['p2p-stats'],
    queryFn: fetchStats,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}

/**
 * Hook para buscar ofertas do usuário (vendedor)
 */
export function useMyListings(token: string | null) {
  return useQuery({
    queryKey: ['p2p-my-listings'],
    queryFn: () => fetchMyListings(token!),
    enabled: !!token,
  });
}

/**
 * Hook para buscar compras do usuário (investidor)
 */
export function useMyPurchases(token: string | null) {
  return useQuery({
    queryKey: ['p2p-my-purchases'],
    queryFn: () => fetchMyPurchases(token!),
    enabled: !!token,
  });
}

/**
 * Hook para criar uma nova oferta
 */
export function useCreateListing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ input, token }: { input: CreateListingInput; token: string }) =>
      createListing(input, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['p2p-listings'] });
      queryClient.invalidateQueries({ queryKey: ['p2p-my-listings'] });
      queryClient.invalidateQueries({ queryKey: ['p2p-stats'] });
    },
  });
}

/**
 * Hook para cancelar uma oferta
 */
export function useCancelListing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ listingId, token }: { listingId: string; token: string }) =>
      cancelListing(listingId, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['p2p-listings'] });
      queryClient.invalidateQueries({ queryKey: ['p2p-my-listings'] });
    },
  });
}

/**
 * Hook para simular uma oferta
 */
export function useP2PSimulation() {
  const [simulation, setSimulation] = useState<P2PSimulation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const simulate = async (input: {
    monthlyRent: number;
    monthsToSell: number;
    discountPercent?: number;
  }) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await simulateListing(input);
      setSimulation(result);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao simular';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setSimulation(null);
    setError(null);
  };

  return {
    simulation,
    simulate,
    reset,
    isLoading,
    error,
  };
}

/**
 * Hook principal do P2P Marketplace
 * Combina todas as funcionalidades
 */
export function useP2PMarketplace(token: string | null = null) {
  const listingsQuery = useP2PListings();
  const statsQuery = useP2PStats();
  const myListingsQuery = useMyListings(token);
  const myPurchasesQuery = useMyPurchases(token);
  const createMutation = useCreateListing();
  const cancelMutation = useCancelListing();
  const simulation = useP2PSimulation();

  return {
    // Ofertas públicas
    listings: listingsQuery.data?.listings || [],
    pagination: listingsQuery.data?.pagination,
    isLoadingListings: listingsQuery.isLoading,
    listingsError: listingsQuery.error,
    refetchListings: listingsQuery.refetch,

    // Estatísticas
    stats: statsQuery.data,
    isLoadingStats: statsQuery.isLoading,

    // Minhas ofertas (vendedor)
    myListings: myListingsQuery.data || [],
    isLoadingMyListings: myListingsQuery.isLoading,

    // Minhas compras (investidor)
    myPurchases: myPurchasesQuery.data || [],
    isLoadingMyPurchases: myPurchasesQuery.isLoading,

    // Criar oferta
    createListing: (input: CreateListingInput) =>
      createMutation.mutateAsync({ input, token: token! }),
    isCreatingListing: createMutation.isPending,
    createListingError: createMutation.error,

    // Cancelar oferta
    cancelListing: (listingId: string) =>
      cancelMutation.mutateAsync({ listingId, token: token! }),
    isCancellingListing: cancelMutation.isPending,

    // Simulação
    simulation: simulation.simulation,
    simulate: simulation.simulate,
    resetSimulation: simulation.reset,
    isSimulating: simulation.isLoading,
    simulationError: simulation.error,
  };
}

export default useP2PMarketplace;
