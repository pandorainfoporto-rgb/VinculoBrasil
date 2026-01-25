import axios, { type AxiosInstance, type AxiosError } from "axios";
import { useAuthStore } from "../stores/useAuthStore";

// ============================================
// AXIOS INSTANCE
// ============================================
const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// ============================================
// REQUEST INTERCEPTOR (Inject Auth Token)
// FASE 18 AJUSTADA: Prioridade para chaves diretas no localStorage
// ============================================
api.interceptors.request.use(
  (config: any) => {
    // ORDEM DE PRIORIDADE CRÍTICA (Baseada no dump do usuário):
    // O token válido está na chave 'token' direta, não dentro do Zustand

    // 1. Tenta pegar a chave 'token' direta (onde o login legado salvou)
    let token: string | null = localStorage.getItem('token');

    // 2. Se não achar, tenta 'accessToken'
    if (!token) {
      token = localStorage.getItem('accessToken');
    }

    // 3. Se não achar, tenta 'access_token' (snake_case)
    if (!token) {
      token = localStorage.getItem('access_token');
    }

    // 4. Só se não achar nada, tenta ler o JSON do Zustand (vinculo-auth)
    if (!token) {
      try {
        const authStorage = localStorage.getItem('vinculo-auth');
        if (authStorage) {
          const parsed = JSON.parse(authStorage);
          token = parsed.state?.token || parsed.token || null;
        }
      } catch (e) {
        console.warn('[API] Erro ao ler vinculo-auth:', e);
      }
    }

    // 5. Fallback: tenta auth-storage (outro nome comum do Zustand)
    if (!token) {
      try {
        const authStorage = localStorage.getItem('auth-storage');
        if (authStorage) {
          const parsed = JSON.parse(authStorage);
          token = parsed.state?.token || parsed.state?.accessToken || null;
        }
      } catch (e) {
        console.warn('[API] Erro ao ler auth-storage:', e);
      }
    }

    // 6. Último recurso: Zustand Store (pode estar vazio se não hidratado)
    if (!token) {
      try {
        token = useAuthStore.getState().token || null;
      } catch {
        // Store não disponível
      }
    }

    // Se encontrou algo, injeta no header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: any) => Promise.reject(error)
);

// ============================================
// RESPONSE INTERCEPTOR (Handle 401 Logout)
// ============================================
api.interceptors.response.use(
  (response: any) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Unauthorized - logout and redirect
      useAuthStore.getState().logout();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
