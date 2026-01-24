// ============================================
// Hook de API Base - Conexão Real com Backend
// Remove mocks e conecta com endpoints reais
// ============================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// API Base URL - Em produção, vem de variável de ambiente
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Tipos base
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Função para fazer requisições autenticadas
async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('auth_token');

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    // Token expirado - redireciona para login
    localStorage.removeItem('auth_token');
    window.location.href = '/auth/login';
    throw new Error('Sessão expirada');
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Erro desconhecido' }));
    throw new Error(error.message || `Erro ${response.status}`);
  }

  return response.json();
}

// ============================================
// HOOKS DO PAINEL DO INQUILINO (/tenant)
// ============================================

export interface TenantContract {
  id: string;
  status: 'ACTIVE' | 'PENDING' | 'EXPIRED' | 'CANCELLED';
  startDate: string;
  endDate: string;
  rentAmount: number;
  condoFee: number;
  iptuMonthly: number;
  property: {
    id: string;
    title: string;
    address: string;
    coverImage: string | null;
    bedrooms: number;
    bathrooms: number;
    area: number;
  };
  agency: {
    id: string;
    name: string;
    phone: string;
    email: string;
  };
  contractHash?: string;
  pdfUrl?: string;
}

export interface TenantPayment {
  id: string;
  dueDate: string;
  paidAt: string | null;
  amount: number;
  status: 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED';
  breakdown: {
    rent: number;
    condo: number;
    iptu: number;
    extras?: number;
  };
  pixCode?: string;
  boletoUrl?: string;
}

export interface TenantDashboard {
  hasContract: boolean;
  tenant: {
    id: string;
    name: string;
    email: string;
    cpf: string;
    phone?: string;
  };
  contract: TenantContract | null;
  nextPayment: TenantPayment | null;
  paymentHistory: TenantPayment[];
  stats: {
    totalPaid: number;
    monthsOnTime: number;
    cashbackBalance: number;
  };
}

export function useTenantDashboard() {
  return useQuery({
    queryKey: ['tenant', 'dashboard'],
    queryFn: () => fetchApi<TenantDashboard>('/tenant/dashboard'),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

export function useTenantContract() {
  return useQuery({
    queryKey: ['tenant', 'contract'],
    queryFn: () => fetchApi<TenantContract>('/tenant/contract'),
    staleTime: 10 * 60 * 1000,
  });
}

export function useTenantPayments() {
  return useQuery({
    queryKey: ['tenant', 'payments'],
    queryFn: () => fetchApi<PaginatedResponse<TenantPayment>>('/tenant/payments'),
    staleTime: 2 * 60 * 1000,
  });
}

export function usePayRent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (paymentId: string) =>
      fetchApi<{ pixCode: string; qrCodeUrl: string }>(`/tenant/payments/${paymentId}/pix`, {
        method: 'POST',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenant', 'payments'] });
      queryClient.invalidateQueries({ queryKey: ['tenant', 'dashboard'] });
    },
  });
}

// ============================================
// HOOKS DO PAINEL DO PROPRIETÁRIO (/landlord)
// ============================================

export interface LandlordProperty {
  id: string;
  title: string;
  address: string;
  status: 'AVAILABLE' | 'RENTED' | 'MAINTENANCE';
  rentAmount: number;
  coverImage: string | null;
  tenant?: {
    name: string;
    phone: string;
  };
  contract?: {
    id: string;
    endDate: string;
    monthlyIncome: number;
  };
}

export interface LandlordStatement {
  id: string;
  month: string;
  grossAmount: number;
  adminFee: number;
  guarantorFee: number;
  netAmount: number;
  status: 'PENDING' | 'PAID' | 'PROCESSING';
  paidAt: string | null;
  propertyId: string;
  propertyTitle: string;
}

export interface LandlordDashboard {
  owner: {
    id: string;
    name: string;
    email: string;
  };
  properties: LandlordProperty[];
  stats: {
    totalProperties: number;
    rentedProperties: number;
    vacancyRate: number;
    monthlyIncome: number;
    pendingPayments: number;
  };
  recentStatements: LandlordStatement[];
  anticipationOffers: {
    id: string;
    amount: number;
    status: string;
  }[];
}

export function useLandlordDashboard() {
  return useQuery({
    queryKey: ['landlord', 'dashboard'],
    queryFn: () => fetchApi<LandlordDashboard>('/landlord/dashboard'),
    staleTime: 5 * 60 * 1000,
  });
}

export function useLandlordProperties() {
  return useQuery({
    queryKey: ['landlord', 'properties'],
    queryFn: () => fetchApi<LandlordProperty[]>('/landlord/properties'),
    staleTime: 5 * 60 * 1000,
  });
}

export function useLandlordStatements(propertyId?: string) {
  return useQuery({
    queryKey: ['landlord', 'statements', propertyId],
    queryFn: () => fetchApi<PaginatedResponse<LandlordStatement>>(
      `/landlord/statements${propertyId ? `?propertyId=${propertyId}` : ''}`
    ),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateAnticipationOffer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { contractId: string; amount: number; discount: number }) =>
      fetchApi<{ offerId: string }>('/p2p/offers', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['landlord'] });
    },
  });
}

// ============================================
// HOOKS DO PAINEL DO GARANTIDOR (/garantidor)
// ============================================

export interface GuarantorContract {
  id: string;
  property: {
    title: string;
    address: string;
  };
  tenant: {
    name: string;
    cpf: string;
  };
  rentAmount: number;
  guarantorFee: number; // 5% do aluguel
  status: 'ACTIVE' | 'PENDING' | 'EXPIRED';
  paymentStatus: 'ON_TIME' | 'LATE' | 'DEFAULTED';
  lastPaymentDate: string | null;
  daysOverdue: number;
}

export interface GuarantorDashboard {
  guarantor: {
    id: string;
    name: string;
    email: string;
    cpf: string;
  };
  contracts: GuarantorContract[];
  stats: {
    activeContracts: number;
    totalEarnings: number;
    pendingEarnings: number;
    riskExposure: number;
    defaultedContracts: number;
  };
  earnings: {
    month: string;
    amount: number;
    status: 'PAID' | 'PENDING';
  }[];
}

export function useGuarantorDashboard() {
  return useQuery({
    queryKey: ['guarantor', 'dashboard'],
    queryFn: () => fetchApi<GuarantorDashboard>('/guarantor/dashboard'),
    staleTime: 5 * 60 * 1000,
  });
}

export function useGuarantorContracts() {
  return useQuery({
    queryKey: ['guarantor', 'contracts'],
    queryFn: () => fetchApi<GuarantorContract[]>('/guarantor/contracts'),
    staleTime: 5 * 60 * 1000,
  });
}

export function useGuarantorEarnings() {
  return useQuery({
    queryKey: ['guarantor', 'earnings'],
    queryFn: () => fetchApi<{
      total: number;
      pending: number;
      history: { month: string; amount: number; status: string }[];
    }>('/guarantor/earnings'),
    staleTime: 5 * 60 * 1000,
  });
}

// ============================================
// HOOKS DO PAINEL DO INVESTIDOR (/investor)
// ============================================

export interface InvestorAsset {
  id: string;
  contractId: string;
  propertyTitle: string;
  propertyAddress: string;
  investedAmount: number;
  currentValue: number;
  expectedYield: number;
  actualYield: number;
  purchaseDate: string;
  maturityDate: string;
  status: 'ACTIVE' | 'MATURED' | 'DEFAULTED';
  nextPaymentDate: string | null;
  nextPaymentAmount: number | null;
}

export interface InvestorDashboard {
  investor: {
    id: string;
    name: string;
    email: string;
    walletAddress?: string;
  };
  portfolio: InvestorAsset[];
  stats: {
    totalInvested: number;
    currentValue: number;
    totalYield: number;
    averageYieldRate: number;
    activeAssets: number;
  };
  dividends: {
    month: string;
    expected: number;
    received: number;
  }[];
}

export function useInvestorDashboard() {
  return useQuery({
    queryKey: ['investor', 'dashboard'],
    queryFn: () => fetchApi<InvestorDashboard>('/investor/dashboard'),
    staleTime: 5 * 60 * 1000,
  });
}

export function useInvestorPortfolio() {
  return useQuery({
    queryKey: ['investor', 'portfolio'],
    queryFn: () => fetchApi<InvestorAsset[]>('/investor/portfolio'),
    staleTime: 5 * 60 * 1000,
  });
}

export function useInvestorDividends() {
  return useQuery({
    queryKey: ['investor', 'dividends'],
    queryFn: () => fetchApi<{
      total: number;
      history: { month: string; expected: number; received: number }[];
    }>('/investor/dividends'),
    staleTime: 5 * 60 * 1000,
  });
}

// ============================================
// HOOKS DA IMOBILIÁRIA (/agency)
// ============================================

export interface AgencyDashboard {
  agency: {
    id: string;
    name: string;
    slug: string;
    logo: string | null;
  };
  stats: {
    totalProperties: number;
    rentedProperties: number;
    availableProperties: number;
    vacancyRate: number;
    activeContracts: number;
    monthlyRevenue: number;
    pendingPayments: number;
    overduePayments: number;
  };
  recentActivities: {
    type: string;
    description: string;
    createdAt: string;
  }[];
}

export function useAgencyDashboard() {
  return useQuery({
    queryKey: ['agency', 'dashboard'],
    queryFn: () => fetchApi<AgencyDashboard>('/agency/dashboard'),
    staleTime: 5 * 60 * 1000,
  });
}

// ============================================
// HOOKS DE TICKETS / CHAMADOS
// ============================================

export interface Ticket {
  id: string;
  title: string;
  description: string;
  category: 'MAINTENANCE' | 'PAYMENT' | 'CONTRACT' | 'OTHER';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  createdAt: string;
  updatedAt: string;
  propertyId?: string;
  attachments?: string[];
}

export function useTickets() {
  return useQuery({
    queryKey: ['tickets'],
    queryFn: () => fetchApi<PaginatedResponse<Ticket>>('/tickets'),
    staleTime: 2 * 60 * 1000,
  });
}

export function useCreateTicket() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: {
      title: string;
      description: string;
      category: Ticket['category'];
      priority?: Ticket['priority'];
      propertyId?: string;
    }) =>
      fetchApi<Ticket>('/tickets', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
  });
}

// ============================================
// EXPORT DEFAULT API FETCH
// ============================================
export { fetchApi };
