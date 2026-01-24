/**
 * Hook para Relatórios Financeiros
 *
 * CONECTADO AO BACKEND REAL - Sem dados mockados
 *
 * Endpoints utilizados:
 * - GET /api/reports/dashboard - KPIs gerais
 * - GET /api/reports/financial/dre - DRE (Demonstrativo de Resultados)
 * - GET /api/reports/financial/cashflow - Fluxo de caixa mensal
 * - GET /api/reports/crm/funnel - Funil de vendas
 * - GET /api/reports/properties/status - Status de imóveis
 */

import { useQuery } from '@tanstack/react-query';

// ============================================
// TIPOS
// ============================================

export interface DREReport {
  period: {
    year: number;
    month: number | null;
    startDate: string;
    endDate: string;
  };
  revenues: {
    byType: Array<{ type: string; amount: number }>;
    total: number;
  };
  platformRevenue: number;
}

export interface CashflowData {
  month: string;
  label: string;
  income: number;
  pending: number;
}

export interface CRMFunnel {
  pipeline: string;
  funnel: Array<{
    id: string;
    name: string;
    color: string;
    order: number;
    count: number;
    value: number;
  }>;
}

export interface PropertyStatusReport {
  byStatus: Array<{ status: string; count: number }>;
  byType: Array<{ type: string; count: number }>;
}

export interface FinancialSummary {
  totalRevenue: number;
  occupancyRate: number;
  delinquencyRate: number;
  netProfit: number;
}

// ============================================
// API FUNCTIONS
// ============================================

async function fetchDRE(year?: number, month?: number): Promise<DREReport> {
  const params = new URLSearchParams();
  if (year) params.set('year', String(year));
  if (month) params.set('month', String(month));

  const response = await fetch(`/api/reports/financial/dre?${params.toString()}`);

  if (!response.ok) {
    throw new Error('Erro ao buscar DRE');
  }

  return response.json();
}

async function fetchCashflow(months: number = 6): Promise<CashflowData[]> {
  const response = await fetch(`/api/reports/financial/cashflow?months=${months}`);

  if (!response.ok) {
    throw new Error('Erro ao buscar fluxo de caixa');
  }

  return response.json();
}

async function fetchCRMFunnel(): Promise<CRMFunnel> {
  const response = await fetch('/api/reports/crm/funnel');

  if (!response.ok) {
    throw new Error('Erro ao buscar funil CRM');
  }

  return response.json();
}

async function fetchPropertyStatus(): Promise<PropertyStatusReport> {
  const response = await fetch('/api/reports/properties/status');

  if (!response.ok) {
    throw new Error('Erro ao buscar status de imóveis');
  }

  return response.json();
}

// ============================================
// HOOKS
// ============================================

/**
 * Hook para buscar DRE (Demonstrativo de Resultados)
 */
export function useDRE(year?: number, month?: number) {
  return useQuery({
    queryKey: ['dre', year, month],
    queryFn: () => fetchDRE(year, month),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
}

/**
 * Hook para buscar fluxo de caixa mensal
 */
export function useCashflow(months: number = 6) {
  return useQuery({
    queryKey: ['cashflow', months],
    queryFn: () => fetchCashflow(months),
    staleTime: 5 * 60 * 1000,
    placeholderData: [],
  });
}

/**
 * Hook para buscar funil de CRM
 */
export function useCRMFunnel() {
  return useQuery({
    queryKey: ['crm-funnel'],
    queryFn: fetchCRMFunnel,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook para buscar status de imóveis
 */
export function usePropertyStatus() {
  return useQuery({
    queryKey: ['property-status'],
    queryFn: fetchPropertyStatus,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook combinado para todos os relatórios financeiros
 */
export function useFinancialReports(options?: {
  year?: number;
  month?: number;
  cashflowMonths?: number;
}) {
  const dreQuery = useDRE(options?.year, options?.month);
  const cashflowQuery = useCashflow(options?.cashflowMonths || 6);
  const propertyStatusQuery = usePropertyStatus();

  const isLoading = dreQuery.isLoading || cashflowQuery.isLoading || propertyStatusQuery.isLoading;
  const hasError = dreQuery.error || cashflowQuery.error || propertyStatusQuery.error;

  // Calcula métricas consolidadas
  const summary: FinancialSummary = {
    totalRevenue: dreQuery.data?.revenues.total || 0,
    occupancyRate: calculateOccupancyRate(propertyStatusQuery.data),
    delinquencyRate: 0, // Será calculado quando tivermos dados de inadimplência
    netProfit: dreQuery.data?.platformRevenue || 0,
  };

  return {
    // DRE
    dre: dreQuery.data,
    isLoadingDRE: dreQuery.isLoading,

    // Cashflow
    cashflow: cashflowQuery.data || [],
    isLoadingCashflow: cashflowQuery.isLoading,

    // Property Status
    propertyStatus: propertyStatusQuery.data,
    isLoadingPropertyStatus: propertyStatusQuery.isLoading,

    // Consolidated
    summary,
    isLoading,
    hasError,

    // Refetch
    refetchAll: () => {
      dreQuery.refetch();
      cashflowQuery.refetch();
      propertyStatusQuery.refetch();
    },
  };
}

// ============================================
// HELPERS
// ============================================

function calculateOccupancyRate(data?: PropertyStatusReport): number {
  if (!data) return 0;

  const rented = data.byStatus.find((s) => s.status === 'RENTED')?.count || 0;
  const total = data.byStatus.reduce((sum, s) => sum + s.count, 0);

  if (total === 0) return 0;

  return (rented / total) * 100;
}
