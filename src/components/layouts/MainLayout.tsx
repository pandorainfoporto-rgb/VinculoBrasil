import { type ReactNode, useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/useAuthStore";
import { useWalletStore, shortenAddress } from "../../stores/useWalletStore";
import {
  Menu,
  X,
  LogOut,
  User,
  Moon,
  Sun,
  ChevronDown,
  Home,
  Wallet,
  Link2,
  Link2Off,
} from "lucide-react";
import { TabbedSidebar } from "./TabbedSidebar";
import type { SidebarTab } from "../../config/menus";

// ============================================
// TIPOS
// ============================================
export interface MenuItem {
  icon: React.ElementType;
  label: string;
  path: string;
}

interface MainLayoutProps {
  children: ReactNode;
  menuItems?: MenuItem[];
  tabs?: SidebarTab[];
  title: string;
  subtitle?: string;
}

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
// ROTAS QUE MOSTRAM O WALLET WIDGET
// ============================================
const WALLET_ENABLED_ROUTES = ["/admin", "/investor", "/landlord"];

function shouldShowWallet(pathname: string): boolean {
  return WALLET_ENABLED_ROUTES.some((route) => pathname.startsWith(route));
}

// ============================================
// WALLET WIDGET COMPONENT
// ============================================
function WalletWidget() {
  const location = useLocation();
  const { address, isConnected, isConnecting, connectWallet, disconnect } = useWalletStore();

  // Não mostrar em rotas não autorizadas
  if (!shouldShowWallet(location.pathname)) {
    return null;
  }

  if (!isConnected) {
    return (
      <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
        <button
          onClick={connectWallet}
          disabled={isConnecting}
          className="flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-xl transition-colors disabled:opacity-50"
        >
          {isConnecting ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Conectando...
            </>
          ) : (
            <>
              <Wallet size={18} />
              Conectar Carteira
            </>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
      <div className="flex items-center gap-3 px-3 py-2 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
        <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
          <Link2 size={16} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs text-purple-600 dark:text-purple-400 font-medium">Conectado</p>
          <p className="text-sm font-mono text-gray-900 dark:text-white truncate">
            {shortenAddress(address)}
          </p>
        </div>
        <button
          onClick={disconnect}
          className="p-1.5 hover:bg-purple-100 dark:hover:bg-purple-800/30 rounded-lg transition-colors"
          title="Desconectar"
        >
          <Link2Off size={16} className="text-purple-600 dark:text-purple-400" />
        </button>
      </div>
    </div>
  );
}

// ============================================
// SIMPLE MENU NAVIGATION
// ============================================
function SimpleNavigation({
  menuItems,
  onItemClick,
}: {
  menuItems: MenuItem[];
  onItemClick: () => void;
}) {
  const location = useLocation();

  return (
    <nav className="flex-1 overflow-y-auto p-4 space-y-1">
      {menuItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
              isActive
                ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium shadow-sm"
                : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-200"
            }`}
            onClick={onItemClick}
          >
            <item.icon size={20} className={isActive ? "text-blue-600 dark:text-blue-400" : ""} />
            <span>{item.label}</span>
          </Link>
        );
      })}

      {/* Voltar ao Hub */}
      <div className="pt-4 mt-4 border-t border-gray-100 dark:border-gray-800">
        <Link
          to="/"
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-500 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          onClick={onItemClick}
        >
          <Home size={20} />
          <span>Voltar ao Hub</span>
        </Link>
      </div>
    </nav>
  );
}

// ============================================
// MAIN LAYOUT COMPONENT
// ============================================
export function MainLayout({ children, menuItems, tabs, title, subtitle }: MainLayoutProps) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { isDark, toggle: toggleDarkMode } = useDarkMode();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const closeSidebar = () => setSidebarOpen(false);

  // Determine if using tabbed or simple menu
  const useTabbedMenu = tabs && tabs.length > 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f0f0f] transition-colors duration-200">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2.5 rounded-xl bg-white dark:bg-[#1a1a1a] shadow-lg border border-gray-200 dark:border-gray-800 transition-colors"
        >
          {sidebarOpen ? (
            <X size={22} className="text-gray-700 dark:text-gray-300" />
          ) : (
            <Menu size={22} className="text-gray-700 dark:text-gray-300" />
          )}
        </button>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 bg-white dark:bg-[#1a1a1a] border-r border-gray-200 dark:border-gray-800 transform transition-transform duration-300 ease-in-out lg:translate-x-0 flex flex-col ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="h-20 flex items-center px-6 border-b border-gray-100 dark:border-gray-800">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/30 transition-shadow">
              <span className="text-white font-bold text-xl">V</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Vínculo</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 -mt-0.5">Brasil</p>
            </div>
          </Link>
        </div>

        {/* Module Title */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">{title}</h2>
          {subtitle && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{subtitle}</p>
          )}
        </div>

        {/* Wallet Widget */}
        <WalletWidget />

        {/* Navigation - Tabbed or Simple */}
        {useTabbedMenu ? (
          <TabbedSidebar tabs={tabs} onItemClick={closeSidebar} />
        ) : menuItems ? (
          <SimpleNavigation menuItems={menuItems} onItemClick={closeSidebar} />
        ) : null}

        {/* Footer Actions */}
        {!useTabbedMenu && (
          <>
            {/* Dark Mode Toggle */}
            <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800">
              <button
                onClick={toggleDarkMode}
                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-xl transition-colors"
              >
                {isDark ? <Sun size={18} /> : <Moon size={18} />}
                <span>{isDark ? "Modo Claro" : "Modo Escuro"}</span>
              </button>
            </div>
          </>
        )}

        {/* Tabbed Menu Footer */}
        {useTabbedMenu && (
          <div className="border-t border-gray-100 dark:border-gray-800">
            {/* Hub Link */}
            <div className="px-3 py-2">
              <Link
                to="/"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-500 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                onClick={closeSidebar}
              >
                <Home size={18} />
                <span className="text-sm font-medium">Voltar ao Hub</span>
              </Link>
            </div>

            {/* Dark Mode Toggle */}
            <div className="px-3 py-2 border-t border-gray-100 dark:border-gray-800">
              <button
                onClick={toggleDarkMode}
                className="flex items-center gap-3 w-full px-3 py-2.5 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 rounded-lg transition-colors"
              >
                {isDark ? <Sun size={18} /> : <Moon size={18} />}
                <span className="text-sm font-medium">{isDark ? "Modo Claro" : "Modo Escuro"}</span>
              </button>
            </div>
          </div>
        )}

        {/* User section */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-[#151515]">
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-3 w-full p-2 rounded-xl hover:bg-white dark:hover:bg-gray-800/50 transition-colors"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                <span className="text-white font-semibold text-sm">
                  {user?.name?.charAt(0) || "D"}
                </span>
              </div>
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {user?.name || "Dev Mode"}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user?.email || "dev@vinculo.io"}
                </p>
              </div>
              <ChevronDown
                size={16}
                className={`text-gray-400 transition-transform duration-200 ${userMenuOpen ? "rotate-180" : ""}`}
              />
            </button>

            {/* User Dropdown */}
            {userMenuOpen && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden">
                <Link
                  to="/profile"
                  className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  onClick={() => setUserMenuOpen(false)}
                >
                  <User size={18} />
                  <span>Perfil</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <LogOut size={18} />
                  <span>Sair</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="lg:ml-72 min-h-screen transition-all duration-300">
        <div className="p-4 lg:p-8">{children}</div>
      </main>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
