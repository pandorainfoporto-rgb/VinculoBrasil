// =============================================================================
// Hook: usePaginatedQuery - Paginacao Server-Side para Tabelas
// PERFORMANCE: Carrega apenas 20-50 registros por vez
// =============================================================================

import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { useState, useCallback, useMemo } from 'react';

// Tipos para paginacao
export interface PaginationParams {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  filters?: Record<string, unknown>;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface UsePaginatedQueryOptions<T> {
  queryKey: string[];
  endpoint: string;
  pageSize?: number;
  initialPage?: number;
  enabled?: boolean;
  staleTime?: number;
  // Funcao para transformar a resposta da API
  transformResponse?: (data: unknown) => PaginatedResponse<T>;
}

// Funcao generica para buscar dados paginados
async function fetchPaginatedData<T>(
  endpoint: string,
  params: PaginationParams,
  transformResponse?: (data: unknown) => PaginatedResponse<T>
): Promise<PaginatedResponse<T>> {
  const apiUrl = import.meta.env.VITE_API_URL;

  if (!apiUrl) {
    // Mock para desenvolvimento - simula paginacao
    console.warn('[Pagination] VITE_API_URL nao configurada, usando dados mock');
    return {
      data: [],
      pagination: {
        page: params.page,
        pageSize: params.pageSize,
        totalItems: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    };
  }

  const token = localStorage.getItem('auth_token');

  // Monta query string
  const queryParams = new URLSearchParams({
    page: params.page.toString(),
    pageSize: params.pageSize.toString(),
    ...(params.sortBy && { sortBy: params.sortBy }),
    ...(params.sortOrder && { sortOrder: params.sortOrder }),
    ...(params.search && { search: params.search }),
  });

  // Adiciona filtros customizados
  if (params.filters) {
    Object.entries(params.filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, String(value));
      }
    });
  }

  const response = await fetch(`${apiUrl}${endpoint}?${queryParams}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });

  if (!response.ok) {
    throw new Error(`Erro ao buscar dados: ${response.statusText}`);
  }

  const rawData = await response.json();

  // Aplica transformacao se fornecida
  if (transformResponse) {
    return transformResponse(rawData);
  }

  return rawData;
}

// Hook principal
export function usePaginatedQuery<T>(options: UsePaginatedQueryOptions<T>) {
  const {
    queryKey,
    endpoint,
    pageSize = 20,
    initialPage = 1,
    enabled = true,
    staleTime = 5 * 60 * 1000, // 5 minutos
    transformResponse,
  } = options;

  // Estado de paginacao
  const [page, setPage] = useState(initialPage);
  const [currentPageSize, setPageSize] = useState(pageSize);
  const [sortBy, setSortBy] = useState<string | undefined>();
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Record<string, unknown>>({});

  // Params para a query
  const params: PaginationParams = useMemo(() => ({
    page,
    pageSize: currentPageSize,
    sortBy,
    sortOrder,
    search,
    filters,
  }), [page, currentPageSize, sortBy, sortOrder, search, filters]);

  // Query com TanStack Query
  const query = useQuery({
    queryKey: [...queryKey, params],
    queryFn: () => fetchPaginatedData<T>(endpoint, params, transformResponse),
    enabled,
    staleTime,
    placeholderData: keepPreviousData, // Mantem dados anteriores durante loading
  });

  // Helpers de navegacao
  const goToPage = useCallback((newPage: number) => {
    setPage(Math.max(1, newPage));
  }, []);

  const nextPage = useCallback(() => {
    if (query.data?.pagination.hasNextPage) {
      setPage((p) => p + 1);
    }
  }, [query.data?.pagination.hasNextPage]);

  const previousPage = useCallback(() => {
    if (query.data?.pagination.hasPreviousPage) {
      setPage((p) => Math.max(1, p - 1));
    }
  }, [query.data?.pagination.hasPreviousPage]);

  const updateSearch = useCallback((newSearch: string) => {
    setSearch(newSearch);
    setPage(1); // Reset para primeira pagina ao buscar
  }, []);

  const updateFilters = useCallback((newFilters: Record<string, unknown>) => {
    setFilters(newFilters);
    setPage(1); // Reset para primeira pagina ao filtrar
  }, []);

  const updateSort = useCallback((field: string) => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setPage(1);
  }, [sortBy]);

  const updatePageSize = useCallback((newSize: number) => {
    setPageSize(newSize);
    setPage(1);
  }, []);

  return {
    // Dados
    data: query.data?.data ?? [],
    pagination: query.data?.pagination ?? {
      page: 1,
      pageSize: currentPageSize,
      totalItems: 0,
      totalPages: 0,
      hasNextPage: false,
      hasPreviousPage: false,
    },

    // Status
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,

    // Navegacao
    goToPage,
    nextPage,
    previousPage,

    // Busca e Filtros
    search,
    updateSearch,
    filters,
    updateFilters,

    // Ordenacao
    sortBy,
    sortOrder,
    updateSort,

    // Tamanho da pagina
    pageSize: currentPageSize,
    updatePageSize,

    // Refetch
    refetch: query.refetch,
  };
}

// =============================================================================
// MOCK DATA GENERATOR - Para desenvolvimento
// =============================================================================

export function generateMockPaginatedResponse<T>(
  allData: T[],
  params: PaginationParams
): PaginatedResponse<T> {
  const { page, pageSize, search } = params;

  // Aplica busca se houver
  let filtered = allData;
  if (search) {
    const searchLower = search.toLowerCase();
    filtered = allData.filter((item) =>
      JSON.stringify(item).toLowerCase().includes(searchLower)
    );
  }

  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const data = filtered.slice(startIndex, endIndex);

  return {
    data,
    pagination: {
      page,
      pageSize,
      totalItems,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
}
