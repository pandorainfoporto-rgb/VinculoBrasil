// ============================================
// HOOK: useAgencyDashboard
// Busca dados reais do dashboard da imobiliária
// ============================================

import { useQuery } from '@tanstack/react-query';

const API_URL = import.meta.env.VITE_API_URL || 'https://vinculobrasil-production.up.railway.app';

// ============================================
// TIPOS
// ============================================
export interface AgencyData {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
  primaryColor: string;
  commissionRate: number;
  commissionModel: 'DEDUCT_FROM_OWNER' | 'ADD_ON_PRICE';
}

export interface FinancialKPIs {
  totalPortfolioValue: number;
  activeProperties: number;
  activeContracts: number;
  expectedMonthlyCommission: number;
  collectedThisMonth: number;
  pendingCollection: number;
  ownerPayoutsPending: number;
  overdueContracts: number;
}

export interface RecentActivity {
  id: string;
  type: 'payment' | 'contract' | 'lead' | 'property';
  title: string;
  description: string;
  timestamp: string;
  status: 'success' | 'pending' | 'warning';
}

export interface DashboardData {
  agency: AgencyData;
  kpis: FinancialKPIs;
  recentActivity: RecentActivity[];
}

// ============================================
// FETCHER
// ============================================
async function fetchDashboardData(): Promise<DashboardData> {
  const token = localStorage.getItem('token');

  if (!token) {
    throw new Error('Token não encontrado');
  }

  const response = await fetch(`${API_URL}/api/agency/dashboard`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Erro ao carregar dashboard' }));
    throw new Error(error.error || 'Erro ao carregar dashboard');
  }

  return response.json();
}

// ============================================
// HOOK
// ============================================
export function useAgencyDashboard() {
  return useQuery({
    queryKey: ['agency', 'dashboard'],
    queryFn: fetchDashboardData,
    staleTime: 1000 * 60 * 2, // 2 minutos
    refetchOnWindowFocus: true,
  });
}
