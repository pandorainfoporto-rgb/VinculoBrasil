import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import { ErrorBoundary } from "./components/ErrorBoundary";
import "./styles.css";

// Configuração do React Query para gerenciar estado do servidor
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos (dados considerados "frescos")
      retry: 1, // 1 retry em caso de falha
      refetchOnWindowFocus: false, // Não refetch ao focar na janela
    },
  },
});

// Inicialização do Vínculo Brasil V2
// Validação de segurança para evitar erro #299
const rootElement = document.getElementById("root");

if (!rootElement) {
  // Fallback: criar elemento root se não existir
  const fallbackRoot = document.createElement("div");
  fallbackRoot.id = "root";
  document.body.appendChild(fallbackRoot);
  console.error("ERRO CRÍTICO: Elemento #root não encontrado no HTML. Criado dinamicamente.");

  createRoot(fallbackRoot).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </QueryClientProvider>
    </StrictMode>
  );
} else {
  createRoot(rootElement).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </QueryClientProvider>
    </StrictMode>
  );
}
