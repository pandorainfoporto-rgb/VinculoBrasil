/**
 * System Configuration Hooks
 *
 * Provides React Query hooks for system configuration management:
 * - Fetch configurations by group
 * - Update configurations
 * - Get blockchain addresses
 * - Clear cache
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// ============================================
// TYPES
// ============================================

export interface SystemConfig {
  key: string;
  value: string;
  label: string | null;
  description: string | null;
  isSecret: boolean;
  updatedAt?: string;
}

export interface BlockchainConfig {
  smartContract: string;
  receivablesContract: string;
  p2pContract: string;
  rpcUrl: string;
  chainId: number;
}

export interface ConfigUpdateInput {
  key: string;
  value: string;
}

export interface ConfigCreateInput {
  key: string;
  value: string;
  label?: string;
  description?: string;
  group?: string;
  isSecret?: boolean;
}

// ============================================
// API BASE URL
// ============================================

const API_BASE = '/api/system-config';

// ============================================
// API HELPERS
// ============================================

const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const handleResponse = async <T>(response: Response): Promise<T> => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error || data.message || 'Erro na requisição');
  }
  return data.data || data;
};

// ============================================
// PUBLIC HOOKS (No auth required)
// ============================================

/**
 * Fetch public blockchain configuration
 * Available without authentication
 */
export const useBlockchainConfig = () => {
  return useQuery<BlockchainConfig>({
    queryKey: ['system-config', 'blockchain', 'public'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/public/blockchain`);
      return handleResponse<BlockchainConfig>(response);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// ============================================
// ADMIN HOOKS (Auth required)
// ============================================

/**
 * Fetch all configuration groups
 */
export const useConfigGroups = () => {
  return useQuery<string[]>({
    queryKey: ['system-config', 'groups'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/groups`, {
        headers: getAuthHeaders(),
      });
      return handleResponse<string[]>(response);
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Fetch configurations by group
 */
export const useConfigsByGroup = (group: string) => {
  return useQuery<SystemConfig[]>({
    queryKey: ['system-config', 'by-group', group],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/by-group/${group}`, {
        headers: getAuthHeaders(),
      });
      return handleResponse<SystemConfig[]>(response);
    },
    enabled: !!group,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Fetch all configurations grouped
 */
export const useAllConfigs = () => {
  return useQuery<Record<string, SystemConfig[]>>({
    queryKey: ['system-config', 'all'],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/all`, {
        headers: getAuthHeaders(),
      });
      return handleResponse<Record<string, SystemConfig[]>>(response);
    },
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Fetch a specific configuration by key
 */
export const useConfig = (key: string) => {
  return useQuery<SystemConfig>({
    queryKey: ['system-config', key],
    queryFn: async () => {
      const response = await fetch(`${API_BASE}/${key}`, {
        headers: getAuthHeaders(),
      });
      return handleResponse<SystemConfig>(response);
    },
    enabled: !!key,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Update a configuration value
 */
export const useUpdateConfig = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ key, value }: ConfigUpdateInput) => {
      const response = await fetch(`${API_BASE}/${key}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ value }),
      });
      return handleResponse<{ success: boolean; message: string }>(response);
    },
    onSuccess: (_data, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['system-config'] });
      queryClient.invalidateQueries({ queryKey: ['system-config', variables.key] });
    },
  });
};

/**
 * Create a new configuration
 */
export const useCreateConfig = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: ConfigCreateInput) => {
      const response = await fetch(API_BASE, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(input),
      });
      return handleResponse<{ success: boolean; message: string }>(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-config'] });
    },
  });
};

/**
 * Delete a configuration
 */
export const useDeleteConfig = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (key: string) => {
      const response = await fetch(`${API_BASE}/${key}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      return handleResponse<{ success: boolean; message: string }>(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['system-config'] });
    },
  });
};

/**
 * Clear all configuration caches
 */
export const useClearConfigCache = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await fetch(`${API_BASE}/clear-cache`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });
      return handleResponse<{ success: boolean; message: string }>(response);
    },
    onSuccess: () => {
      // Invalidate all system-config queries
      queryClient.invalidateQueries({ queryKey: ['system-config'] });
    },
  });
};

// ============================================
// UTILITY HOOKS
// ============================================

/**
 * Hook to get contract addresses for blockchain integration
 */
export const useContractAddresses = () => {
  const { data, isLoading, error } = useBlockchainConfig();

  return {
    isLoading,
    error,
    addresses: data
      ? {
          rental: data.smartContract,
          receivables: data.receivablesContract,
          p2p: data.p2pContract,
        }
      : null,
    rpcUrl: data?.rpcUrl,
    chainId: data?.chainId,
  };
};

export default {
  useBlockchainConfig,
  useConfigGroups,
  useConfigsByGroup,
  useAllConfigs,
  useConfig,
  useUpdateConfig,
  useCreateConfig,
  useDeleteConfig,
  useClearConfigCache,
  useContractAddresses,
};
