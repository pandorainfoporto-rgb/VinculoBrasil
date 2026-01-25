import { Link } from "react-router-dom";
import { useAuthStore } from "../../../stores/useAuthStore";
import {
  Crown,
  Building2,
  Home,
  Key,
  TrendingUp,
  Shield,
  FileCheck,
  Moon,
  Sun,
} from "lucide-react";
import { useState, useEffect } from "react";

// ============================================
// HOOK PARA DARK MODE
// ============================================
function useDarkMode() {
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("theme");
      if (saved) return saved === "dark";
      return window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return false;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  const toggle = () => {
    const newValue = !isDark;
    setIsDark(newValue);
    localStorage.setItem("theme", newValue ? "dark" : "light");
  };

  return { isDark, toggle };
}

// ============================================
// TIPOS
// ============================================
interface RoleCard {
  role: string;
  title: string;
  subtitle: string;
  icon: React.ElementType;
  path: string;
  color: string;
  gradient: string;
}

// ============================================
// CONFIGURAÇÃO DOS CARDS
// ============================================
const roleCards: RoleCard[] = [
  {
    role: "superuser",
    title: "Superuser",
    subtitle: "Modo Deus - Controle Total",
    icon: Crown,
    path: "/admin",
    color: "text-purple-600 dark:text-purple-400",
    gradient: "from-purple-500 to-purple-700",
  },
  {
    role: "agency",
    title: "Imobiliária",
    subtitle: "Mini-ERP de Gestão",
    icon: Building2,
    path: "/agency",
    color: "text-blue-600 dark:text-blue-400",
    gradient: "from-blue-500 to-blue-700",
  },
  {
    role: "landlord",
    title: "Proprietário",
    subtitle: "Meus Imóveis & Rendimentos",
    icon: Home,
    path: "/landlord",
    color: "text-emerald-600 dark:text-emerald-400",
    gradient: "from-emerald-500 to-emerald-700",
  },
  {
    role: "tenant",
    title: "Inquilino",
    subtitle: "Meu Aluguel & Cashback",
    icon: Key,
    path: "/tenant",
    color: "text-orange-600 dark:text-orange-400",
    gradient: "from-orange-500 to-orange-700",
  },
  {
    role: "investor",
    title: "Investidor",
    subtitle: "Mercado P2P de Aluguéis",
    icon: TrendingUp,
    path: "/investor",
    color: "text-cyan-600 dark:text-cyan-400",
    gradient: "from-cyan-500 to-cyan-700",
  },
  {
    role: "guarantor",
    title: "Garantidor",
    subtitle: "Colaterais & Yields",
    icon: Shield,
    path: "/guarantor",
    color: "text-indigo-600 dark:text-indigo-400",
    gradient: "from-indigo-500 to-indigo-700",
  },
  {
    role: "insurer",
    title: "Seguradora",
    subtitle: "Apólices & Sinistros",
    icon: FileCheck,
    path: "/insurer",
    color: "text-rose-600 dark:text-rose-400",
    gradient: "from-rose-500 to-rose-700",
  },
];

// ============================================
// GATEWAY PAGE COMPONENT
// ============================================
export function GatewayPage() {
  const { setUser } = useAuthStore();
  const { isDark, toggle: toggleDarkMode } = useDarkMode();

  const handleEnterAs = (role: string) => {
    // Simula login com o papel selecionado
    setUser({
      id: `dev-${role}`,
      name: `Dev ${role.charAt(0).toUpperCase() + role.slice(1)}`,
      email: `${role}@vinculo.dev`,
      role: role as "superuser" | "agency" | "landlord" | "tenant" | "investor" | "guarantor" | "insurer",
      createdAt: new Date().toISOString(),
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-[#0f0f0f] dark:to-[#1a1a1a] transition-colors duration-200">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-[#1a1a1a]/80 border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <span className="text-white font-bold text-xl">V</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                Vínculo Brasil
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Hub de Desenvolvimento
              </p>
            </div>
          </div>

          <button
            onClick={toggleDarkMode}
            className="p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            {isDark ? (
              <Sun size={20} className="text-yellow-500" />
            ) : (
              <Moon size={20} className="text-gray-600" />
            )}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-sm font-medium mb-4">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Ambiente de Desenvolvimento
          </div>
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Selecione um Perfil
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Clique em um dos cards abaixo para entrar no sistema com o perfil
            correspondente. Útil para testar diferentes fluxos de usuário.
          </p>
        </div>

        {/* Role Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {roleCards.map((card) => (
            <Link
              key={card.role}
              to={card.path}
              onClick={() => handleEnterAs(card.role)}
              className="group relative bg-white dark:bg-[#1a1a1a] rounded-2xl border border-gray-200 dark:border-gray-800 p-6 hover:border-gray-300 dark:hover:border-gray-700 transition-all duration-300 hover:shadow-xl hover:shadow-gray-200/50 dark:hover:shadow-black/30 hover:-translate-y-1"
            >
              {/* Icon */}
              <div
                className={`w-14 h-14 rounded-xl bg-gradient-to-br ${card.gradient} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}
              >
                <card.icon size={28} className="text-white" />
              </div>

              {/* Content */}
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
                {card.title}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {card.subtitle}
              </p>

              {/* Arrow indicator */}
              <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className={`w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center ${card.color}`}>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    className="transform group-hover:translate-x-0.5 transition-transform"
                  >
                    <path
                      d="M6 12L10 8L6 4"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Info Section */}
        <div className="mt-16 text-center">
          <div className="inline-flex flex-col items-center gap-4 p-6 bg-white dark:bg-[#1a1a1a] rounded-2xl border border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <span className="text-2xl">🔐</span>
              <span className="text-sm">
                Modo Dev: Autenticação simulada para facilitar testes
              </span>
            </div>
            <div className="flex gap-3">
              <Link
                to="/login"
                className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Login Real →
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto py-8 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-500">
            Vínculo Brasil © 2024 - Plataforma Integrada de Aluguel
          </p>
        </div>
      </footer>
    </div>
  );
}
