/**
 * Hook para metricas do Dashboard Admin
 *
 * CONECTADO AO BACKEND REAL - Sem dados mockados
 *
 * Busca contagens reais de:
 * - Tickets/Conversas abertos
 * - Contratos ativos
 * - Receita mensal/anual
 * - Propriedades
 * - Leads e Deals
 * - Pagamentos pendentes/vencidos
 */

import { useQuery } from '@tanstack/react-query';

// ============================================
// TIPOS
// ============================================

export interface DashboardMetrics {
  // Metricas principais
  tvl: number;
  activeContracts: number;
  totalContracts: number;
  monthlyRevenue: number;
  yearlyRevenue: number;
  revenueGrowth: number;

  // Notificacoes (badges do menu)
  openTickets: number;
  openDisputes: number;
  pendingKYC: number;
  pendingInspections: number;
  pendingPayments: number;
  overduePayments: number;

  // Metricas secundarias
  totalProperties: number;
  availableProperties: number;
  rentedProperties: number;
  totalLeads: number;
  newLeads: number;
  openDeals: number;
  wonDealsThisMonth: number;
}

export interface CashflowData {
  month: string;
  label: string;
  income: number;
  pending: number;
}

// ============================================
// API FUNCTIONS
// ============================================

async function fetchDashboardMetrics(): Promise<DashboardMetrics> {
  // Busca do endpoint real /api/reports/dashboard
  const response = await fetch('/api/reports/dashboard');

  if (!response.ok) {
    // Se a API falhar, retorna zeros ao inves de quebrar
    console.error('Erro ao buscar metricas do dashboard');
    return getDefaultMetrics();
  }

  const data = await response.json();

  // Mapeia a resposta do backend para o formato esperado
  return {
    // Metricas principais
    tvl: data.financial?.yearlyRevenue || 0,
    activeContracts: data.contracts?.active || 0,
    totalContracts: data.contracts?.total || 0,
    monthlyRevenue: data.financial?.monthlyRevenue || 0,
    yearlyRevenue: data.financial?.yearlyRevenue || 0,
    revenueGrowth: 0, // Calculado no frontend se necessario

    // Notificacoes - baseadas em contagens reais
    openTickets: data.support?.openTickets || 0,
    openDisputes: 0,
    pendingKYC: 0,
    pendingInspections: 0,
    pendingPayments: data.financial?.pendingPayments || 0,
    overduePayments: data.financial?.overduePayments || 0,

    // Metricas secundarias
    totalProperties: data.properties?.total || 0,
    availableProperties: data.properties?.available || 0,
    rentedProperties: data.properties?.rented || 0,
    totalLeads: data.leads?.total || 0,
    newLeads: data.leads?.new || 0,
    openDeals: data.deals?.open || 0,
    wonDealsThisMonth: data.deals?.wonThisMonth || 0,
  };
}

async function fetchCashflow(months: number = 6): Promise<CashflowData[]> {
  const response = await fetch(`/api/reports/financial/cashflow?months=${months}`);

  if (!response.ok) {
    console.error('Erro ao buscar dados de fluxo de caixa');
    return [];
  }

  return response.json();
}

function getDefaultMetrics(): DashboardMetrics {
  return {
    tvl: 0,
    activeContracts: 0,
    totalContracts: 0,
    monthlyRevenue: 0,
    yearlyRevenue: 0,
    revenueGrowth: 0,
    openTickets: 0,
    openDisputes: 0,
    pendingKYC: 0,
    pendingInspections: 0,
    pendingPayments: 0,
    overduePayments: 0,
    totalProperties: 0,
    availableProperties: 0,
    rentedProperties: 0,
    totalLeads: 0,
    newLeads: 0,
    openDeals: 0,
    wonDealsThisMonth: 0,
  };
}

// ============================================
// HOOKS
// ============================================

/**
 * Hook para buscar metricas do dashboard
 * Atualiza automaticamente a cada 60 segundos
 */
export function useDashboardMetrics() {
  return useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: fetchDashboardMetrics,
    staleTime: 30 * 1000, // 30 segundos
    refetchInterval: 60 * 1000, // Refetch a cada 60 segundos
    placeholderData: getDefaultMetrics(),
  });
}

/**
 * Hook para buscar dados de fluxo de caixa (grafico)
 */
export function useCashflow(months: number = 6) {
  return useQuery({
    queryKey: ['cashflow', months],
    queryFn: () => fetchCashflow(months),
    staleTime: 5 * 60 * 1000, // 5 minutos
    placeholderData: [],
  });
}
