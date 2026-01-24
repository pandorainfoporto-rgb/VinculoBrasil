// ============================================
// HOOK: useAdminUsers
// Busca lista de usuários para o Super Admin
// ============================================

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

const API_URL = import.meta.env.VITE_API_URL || 'https://vinculobrasil-production.up.railway.app';

// ============================================
// TIPOS
// ============================================
export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  cpf?: string;
  role: 'SUPER_ADMIN' | 'AGENCY_ADMIN' | 'LANDLORD' | 'TENANT' | 'GUARANTOR';
  status: 'ACTIVE' | 'PENDING' | 'INACTIVE' | 'BLOCKED';
  agencyId?: string;
  agency?: {
    id: string;
    name: string;
    slug: string;
  };
  createdAt: string;
  _count?: {
    contracts: number;
    properties: number;
  };
}

export interface AdminUsersStats {
  total: number;
  tenants: number;
  landlords: number;
  guarantors: number;
  agencyAdmins: number;
  active: number;
  pending: number;
  blocked: number;
}

export interface AdminUsersFilters {
  role?: string;
  status?: string;
  agencyId?: string;
  search?: string;
}

// ============================================
// FETCHERS
// ============================================
async function fetchAdminUsers(filters?: AdminUsersFilters): Promise<{
  users: AdminUser[];
  stats: AdminUsersStats;
}> {
  const token = localStorage.getItem('token');

  if (!token) {
    throw new Error('Token não encontrado');
  }

  const searchParams = new URLSearchParams();
  if (filters?.role && filters.role !== 'all') {
    searchParams.append('role', filters.role.toUpperCase());
  }
  if (filters?.status && filters.status !== 'all') {
    searchParams.append('status', filters.status.toUpperCase());
  }
  if (filters?.agencyId) {
    searchParams.append('agencyId', filters.agencyId);
  }
  if (filters?.search) {
    searchParams.append('search', filters.search);
  }

  const response = await fetch(`${API_URL}/api/users?${searchParams}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Erro ao carregar usuários' }));
    throw new Error(error.error || 'Erro ao carregar usuários');
  }

  const data = await response.json();

  // Calcula stats se o backend não retornar
  const users: AdminUser[] = data.users || data || [];
  const stats: AdminUsersStats = data.stats || {
    total: users.length,
    tenants: users.filter(u => u.role === 'TENANT').length,
    landlords: users.filter(u => u.role === 'LANDLORD').length,
    guarantors: users.filter(u => u.role === 'GUARANTOR').length,
    agencyAdmins: users.filter(u => u.role === 'AGENCY_ADMIN').length,
    active: users.filter(u => u.status === 'ACTIVE').length,
    pending: users.filter(u => u.status === 'PENDING').length,
    blocked: users.filter(u => u.status === 'BLOCKED').length,
  };

  return { users, stats };
}

async function resetUserPassword(userId: string): Promise<{ temporaryPassword: string }> {
  const token = localStorage.getItem('token');

  if (!token) {
    throw new Error('Token não encontrado');
  }

  const response = await fetch(`${API_URL}/api/users/${userId}/reset-password`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Erro ao resetar senha' }));
    throw new Error(error.error || 'Erro ao resetar senha');
  }

  return response.json();
}

async function updateUserStatus(userId: string, status: string): Promise<AdminUser> {
  const token = localStorage.getItem('token');

  if (!token) {
    throw new Error('Token não encontrado');
  }

  const response = await fetch(`${API_URL}/api/users/${userId}/status`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Erro ao atualizar status' }));
    throw new Error(error.error || 'Erro ao atualizar status');
  }

  return response.json();
}

// ============================================
// HOOKS
// ============================================
export function useAdminUsers(filters?: AdminUsersFilters) {
  return useQuery({
    queryKey: ['admin', 'users', filters],
    queryFn: () => fetchAdminUsers(filters),
    staleTime: 1000 * 60 * 2, // 2 minutos
  });
}

export function useResetUserPassword() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: resetUserPassword,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast.success(`Senha resetada! Nova senha: ${data.temporaryPassword}`);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao resetar senha');
    },
  });
}

export function useUpdateUserStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, status }: { userId: string; status: string }) =>
      updateUserStatus(userId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      toast.success('Status atualizado com sucesso!');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Erro ao atualizar status');
    },
  });
}
