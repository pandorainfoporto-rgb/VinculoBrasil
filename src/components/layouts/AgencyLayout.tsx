// ============================================
// AGENCY OS - Layout Principal do ERP de Imobiliarias
// ============================================

import { useState } from 'react';
import { useLocation, useNavigate } from '@tanstack/react-router';
import { VinculoBrasilLogo } from '@/components/vinculo-brasil-logo';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { AgencyAdsWidget } from '@/components/agency/AgencyAdsWidget';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Building2,
  Users,
  FileText,
  Wallet,
  Settings,
  Bell,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Home,
  Calculator,
  Megaphone,
  HelpCircle,
  Globe,
  Menu,
  X,
} from 'lucide-react';

// ============================================
// TIPOS
// ============================================

interface AgencyLayoutProps {
  children: React.ReactNode;
  agencyName?: string;
  agencyLogo?: string;
  userName?: string;
  userEmail?: string;
}

interface NavItem {
  label: string;
  icon: React.ElementType;
  href: string;
  badge?: string | number;
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline';
}

// ============================================
// NAVEGACAO DO SIDEBAR
// ============================================

const MAIN_NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/agency/dashboard' },
  { label: 'Imoveis', icon: Home, href: '/agency/properties' },
  { label: 'Proprietarios', icon: Users, href: '/agency/owners' },
  { label: 'Contratos', icon: FileText, href: '/agency/contracts' },
  { label: 'Financeiro', icon: Wallet, href: '/agency/financial' },
];

const TOOLS_NAV_ITEMS: NavItem[] = [
  { label: 'Calculadora Split', icon: Calculator, href: '/agency/split-calculator' },
  { label: 'Anuncios Ads', icon: Megaphone, href: '/agency/ads' },
  { label: 'Meu Site', icon: Globe, href: '/agency/site' },
];

// REMOVIDO: DeFi items movidos para AdminLayout
// Imobiliária parceira NÃO deve ver menus de administração DeFi

const BOTTOM_NAV_ITEMS: NavItem[] = [
  { label: 'Configuracoes', icon: Settings, href: '/agency/settings' },
  { label: 'Suporte', icon: HelpCircle, href: '/agency/support' },
];

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export function AgencyLayout({
  children,
  agencyName = 'Minha Imobiliaria',
  agencyLogo,
  userName = 'Usuario',
  userEmail = 'usuario@email.com',
}: AgencyLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Funcao para verificar se o item esta ativo
  const isActive = (href: string) => {
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  // Funcao de logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('auth_token');
    localStorage.removeItem('currentUser');
    window.location.href = '/';
  };

  // Hook para navegacao SPA
  const navigate = useNavigate();

  // Renderiza um item de navegacao - usando navigate para SPA navigation
  const renderNavItem = (item: NavItem, collapsed: boolean) => (
    <button
      key={item.href}
      type="button"
      onClick={() => {
        setMobileMenuOpen(false);
        navigate({ to: item.href as never });
      }}
      className={cn(
        'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
        'hover:bg-zinc-800/50 cursor-pointer',
        isActive(item.href)
          ? 'bg-gradient-to-r from-emerald-600/20 to-teal-600/10 text-emerald-400 border-l-2 border-emerald-500'
          : 'text-zinc-400 hover:text-zinc-100',
        collapsed && 'justify-center px-2'
      )}
      title={collapsed ? item.label : undefined}
    >
      <item.icon className={cn('h-5 w-5 shrink-0', isActive(item.href) && 'text-emerald-400')} />
      {!collapsed && (
        <>
          <span className="text-sm font-medium">{item.label}</span>
          {item.badge && (
            <Badge variant={item.badgeVariant || 'secondary'} className="ml-auto text-xs">
              {item.badge}
            </Badge>
          )}
        </>
      )}
    </button>
  );

  return (
    <div className="min-h-screen bg-zinc-950 flex">
      {/* ============================================ */}
      {/* SIDEBAR - DESKTOP */}
      {/* ============================================ */}
      <aside
        className={cn(
          'hidden lg:flex flex-col bg-zinc-900 border-r border-zinc-800 transition-all duration-300',
          sidebarCollapsed ? 'w-16' : 'w-64'
        )}
      >
        {/* Header do Sidebar */}
        <div className={cn('p-4 flex items-center', sidebarCollapsed ? 'justify-center' : 'justify-between')}>
          {!sidebarCollapsed ? (
            <div className="flex items-center gap-3">
              {agencyLogo ? (
                <img src={agencyLogo} alt={agencyName} className="h-8 w-8 rounded-lg object-cover" />
              ) : (
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                  <Building2 className="h-4 w-4 text-white" />
                </div>
              )}
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-zinc-100 truncate max-w-[140px]">{agencyName}</span>
                <span className="text-xs text-zinc-500">AgencyOS</span>
              </div>
            </div>
          ) : (
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <Building2 className="h-4 w-4 text-white" />
            </div>
          )}
          {!sidebarCollapsed && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-zinc-500 hover:text-zinc-300"
              onClick={() => setSidebarCollapsed(true)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
        </div>

        <Separator className="bg-zinc-800" />

        {/* Navegacao Principal */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {/* Menu Principal */}
          <div className="mb-4">
            {!sidebarCollapsed && (
              <p className="px-3 mb-2 text-xs font-medium text-zinc-600 uppercase tracking-wider">Menu</p>
            )}
            {MAIN_NAV_ITEMS.map((item) => renderNavItem(item, sidebarCollapsed))}
          </div>

          {/* Ferramentas */}
          <div className="mb-4">
            {!sidebarCollapsed && (
              <p className="px-3 mb-2 text-xs font-medium text-zinc-600 uppercase tracking-wider">Ferramentas</p>
            )}
            {TOOLS_NAV_ITEMS.map((item) => renderNavItem(item, sidebarCollapsed))}
          </div>

          {/* Seção DeFi REMOVIDA - Imobiliária não deve ver */}
        </nav>

        {/* Native Ads Widget - Desktop */}
        <AgencyAdsWidget collapsed={sidebarCollapsed} variant="sidebar" />

        {/* Footer do Sidebar */}
        <div className="p-3 space-y-1">
          <Separator className="bg-zinc-800 mb-3" />
          {BOTTOM_NAV_ITEMS.map((item) => renderNavItem(item, sidebarCollapsed))}

          {/* Botao Expandir (quando colapsado) */}
          {sidebarCollapsed && (
            <Button
              variant="ghost"
              size="icon"
              className="w-full h-10 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800"
              onClick={() => setSidebarCollapsed(false)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      </aside>

      {/* ============================================ */}
      {/* MOBILE MENU OVERLAY */}
      {/* ============================================ */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/80" onClick={() => setMobileMenuOpen(false)}>
          <aside
            className="w-72 h-full bg-zinc-900 border-r border-zinc-800 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header Mobile */}
            <div className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                  <Building2 className="h-4 w-4 text-white" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-zinc-100">{agencyName}</span>
                  <span className="text-xs text-zinc-500">AgencyOS</span>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
                <X className="h-5 w-5 text-zinc-400" />
              </Button>
            </div>

            <Separator className="bg-zinc-800" />

            {/* Navegacao Mobile */}
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
              {MAIN_NAV_ITEMS.map((item) => renderNavItem(item, false))}
              <Separator className="bg-zinc-800 my-3" />
              {TOOLS_NAV_ITEMS.map((item) => renderNavItem(item, false))}
              <Separator className="bg-zinc-800 my-3" />
              {/* DeFi REMOVIDO do menu mobile - Imobiliária não deve ver */}
              {BOTTOM_NAV_ITEMS.map((item) => renderNavItem(item, false))}

              {/* Native Ads Widget - Mobile Menu */}
              <div className="pt-3">
                <AgencyAdsWidget variant="mobile" />
              </div>
            </nav>

            {/* Logout Mobile */}
            <div className="p-3 border-t border-zinc-800">
              <Button
                variant="ghost"
                className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-500/10"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </Button>
            </div>
          </aside>
        </div>
      )}

      {/* ============================================ */}
      {/* CONTEUDO PRINCIPAL */}
      {/* ============================================ */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header Principal */}
        <header className="h-16 bg-zinc-900/80 backdrop-blur-xl border-b border-zinc-800 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-40">
          {/* Left: Menu Mobile + Breadcrumb */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-zinc-400 hover:text-zinc-100"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>

            {/* Powered by Vinculo - apenas desktop */}
            <div className="hidden md:flex items-center gap-2 text-zinc-500">
              <span className="text-xs">Powered by</span>
              <VinculoBrasilLogo size="sm" />
            </div>
          </div>

          {/* Right: Acoes e Usuario */}
          <div className="flex items-center gap-3">
            {/* Notificacoes */}
            <Button variant="ghost" size="icon" className="relative text-zinc-400 hover:text-zinc-100">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 bg-emerald-500 rounded-full" />
            </Button>

            {/* Separador */}
            <Separator orientation="vertical" className="h-8 bg-zinc-700 hidden sm:block" />

            {/* Usuario */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-sm font-medium text-zinc-100">{userName}</span>
                <span className="text-xs text-zinc-500">{userEmail}</span>
              </div>
              <Avatar className="h-9 w-9 border border-zinc-700">
                <AvatarImage src="" />
                <AvatarFallback className="bg-zinc-800 text-zinc-300 text-sm">
                  {userName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <Button
                variant="ghost"
                size="icon"
                className="text-zinc-400 hover:text-red-400"
                onClick={handleLogout}
                title="Sair"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </header>

        {/* Conteudo */}
        <main className="flex-1 overflow-auto bg-zinc-950">
          {children}
        </main>
      </div>
    </div>
  );
}

export default AgencyLayout;
