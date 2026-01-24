// ============================================
// HOOK: useCashbackStats
// Busca estatísticas de cashback do sistema
// ============================================

import { useQuery } from '@tanstack/react-query';
import { type CashbackAdminStats, MOCK_ADMIN_STATS } from '@/lib/cashback-admin-types';

const API_URL = import.meta.env.VITE_API_URL || 'https://vinculobrasil-production.up.railway.app';

// ============================================
// FETCHER
// ============================================
async function fetchCashbackStats(): Promise<CashbackAdminStats> {
  const token = localStorage.getItem('token');

  if (!token) {
    throw new Error('Token não encontrado');
  }

  const response = await fetch(`${API_URL}/api/admin/cashback/stats`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    // Se endpoint não existe ainda, retorna dados vazios
    if (response.status === 404) {
      return MOCK_ADMIN_STATS;
    }
    throw new Error('Erro ao carregar estatísticas de cashback');
  }

  return response.json();
}

// ============================================
// HOOK
// ============================================
export function useCashbackStats() {
  return useQuery({
    queryKey: ['admin', 'cashback', 'stats'],
    queryFn: fetchCashbackStats,
    staleTime: 1000 * 60 * 2, // 2 minutos
    retry: 1,
  });
}
