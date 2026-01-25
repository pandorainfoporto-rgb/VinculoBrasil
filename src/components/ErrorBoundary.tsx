import React, { type ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

// ============================================
// ERROR BOUNDARY - Evita Tela Branca
// ============================================

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log do erro para debugging
    console.error("[ErrorBoundary] Erro capturado:", error);
    console.error("[ErrorBoundary] Stack:", errorInfo.componentStack);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 dark:bg-[#0f0f0f] flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-xl border border-gray-200 dark:border-gray-800 p-8 text-center">
            {/* Icon */}
            <div className="w-16 h-16 mx-auto mb-6 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Erro no Carregamento
            </h1>

            {/* Message */}
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Ocorreu um erro inesperado ao carregar a aplicação.
              Por favor, tente recarregar a página.
            </p>

            {/* Error Details (Dev Mode) */}
            {import.meta.env.DEV && this.state.error && (
              <div className="mb-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg text-left overflow-auto max-h-32">
                <p className="text-xs font-mono text-red-600 dark:text-red-400">
                  {this.state.error.message}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={this.handleGoHome}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-xl transition-colors"
              >
                <Home size={18} />
                Ir para Home
              </button>
              <button
                onClick={this.handleReload}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors"
              >
                <RefreshCw size={18} />
                Recarregar
              </button>
            </div>

            {/* Branding */}
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Vinculo Brasil v2.0
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
