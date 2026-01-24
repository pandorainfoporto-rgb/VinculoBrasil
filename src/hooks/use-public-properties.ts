// Hook para buscar imóveis públicos da API (landing page)
import { useQuery } from '@tanstack/react-query';

// Tipo do imóvel público (retornado pela API)
export interface PublicProperty {
  id: string;
  title: string;
  description: string | null;
  type: string;
  status: string;
  // Endereço
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  latitude: number | null;
  longitude: number | null;
  // Características
  area: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  parkingSpaces: number | null;
  furnished: boolean;
  petFriendly: boolean;
  // Valores
  rentValue: number;
  condoFee: number;
  iptuValue: number;
  // Imagens
  images: Array<{
    id: string;
    url: string;
    caption: string | null;
  }>;
  // Agência
  agency: {
    id: string;
    name: string;
    slug: string | null;
    logoUrl: string | null;
  } | null;
  // Destaque/Patrocinado
  isPromoted: boolean;
  promotedUntil: string | null;
  priorityScore: number;
  // Datas
  createdAt: string;
}

export interface PublicPropertiesResponse {
  properties: PublicProperty[];
  total: number;
  page: number;
  totalPages: number;
}

export interface PublicPropertiesFilters {
  page?: number;
  limit?: number;
  state?: string;
  city?: string;
  type?: string;
  minPrice?: number;
  maxPrice?: number;
  bedrooms?: number;
  petFriendly?: boolean;
}

// Detectar URL da API baseado no ambiente
function getApiBaseUrl(): string {
  // Em produção, a API está no mesmo servidor (Railway)
  if (typeof window !== 'undefined') {
    // Se estamos no browser, usar a mesma origem ou variável de ambiente
    const envApiUrl = import.meta.env.VITE_API_URL;
    if (envApiUrl) return envApiUrl;

    // Fallback: mesma origem
    return window.location.origin;
  }
  return 'http://localhost:3000';
}

async function fetchPublicProperties(filters: PublicPropertiesFilters = {}): Promise<PublicPropertiesResponse> {
  const baseUrl = getApiBaseUrl();
  const params = new URLSearchParams();

  if (filters.page) params.set('page', filters.page.toString());
  if (filters.limit) params.set('limit', filters.limit.toString());
  if (filters.state) params.set('state', filters.state);
  if (filters.city) params.set('city', filters.city);
  if (filters.type) params.set('type', filters.type);
  if (filters.minPrice) params.set('minPrice', filters.minPrice.toString());
  if (filters.maxPrice) params.set('maxPrice', filters.maxPrice.toString());
  if (filters.bedrooms) params.set('bedrooms', filters.bedrooms.toString());
  if (filters.petFriendly !== undefined) params.set('petFriendly', filters.petFriendly.toString());

  const url = `${baseUrl}/api/properties/public?${params.toString()}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Erro ao buscar imóveis: ${response.status}`);
  }

  return response.json();
}

async function fetchPublicProperty(id: string): Promise<PublicProperty> {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}/api/properties/public/${id}`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Erro ao buscar imóvel: ${response.status}`);
  }

  return response.json();
}

// Hook para listar imóveis públicos
export function usePublicProperties(filters: PublicPropertiesFilters = {}) {
  return useQuery({
    queryKey: ['public-properties', filters],
    queryFn: () => fetchPublicProperties(filters),
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}

// Hook para buscar um imóvel específico
export function usePublicProperty(id: string | undefined) {
  return useQuery({
    queryKey: ['public-property', id],
    queryFn: () => fetchPublicProperty(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}
