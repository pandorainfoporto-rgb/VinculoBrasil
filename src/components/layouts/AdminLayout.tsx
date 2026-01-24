// ============================================
// ADMIN LAYOUT - Painel do Super Admin (Vinculo)
// Sistema de ABAS HORIZONTAIS para organização
// ============================================

import { useState, useEffect } from 'react';
import { useLocation } from '@tanstack/react-router';
import { VinculoBrasilLogo } from '@/components/vinculo-brasil-logo';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { SupportWidget } from '@/components/support/SupportWidget';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { SetupWizard } from '@/components/setup';
import { cn } from '@/lib/utils';
import {
  // Ícones das Abas
  LayoutGrid,
  BarChart3,
  Settings,
  Info,
  // Ícones dos Itens
  LayoutDashboard,
  Building2,
  FileText,
  Users,
  UserPlus,
  UserCheck,
  ShieldCheck,
  Flame,
  MessageSquare,
  Megaphone,
  Zap,
  Banknote,
  TrendingUp,
  Shield,
  Wallet,
  Globe,
  PlugZap,
  Mail,
  HelpCircle,
  LogOut,
  Home,
  ChevronLeft,
  ChevronRight,
  Bell,
  Menu,
  X,
  Store,
  Camera,
  Github,
  Wrench,
  BookOpen,
  PieChart,
  Coins,
  CreditCard,
  Landmark,
  ToggleLeft,
  Sun,
  Moon,
  Key,
  Lock,
  User,
  Hexagon,
} from 'lucide-react';

// ============================================
// TIPOS
// ============================================

interface AdminLayoutProps {
  children: React.ReactNode;
  userName?: string;
  userEmail?: string;
}

interface NavItem {
  label: string;
  icon: React.ElementType;
  href: string;
  badge?: string | number;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

type TabType = 'principal' | 'relatorios' | 'config' | 'sobre';

// ============================================
// NAVEGAÇÃO ORGANIZADA POR ABAS
// ============================================

const TABS: { id: TabType; label: string; icon: React.ElementType; description: string }[] = [
  { id: 'principal', label: 'Principal', icon: LayoutGrid, description: 'Operação do dia a dia' },
  { id: 'relatorios', label: 'Relatórios', icon: BarChart3, description: 'Análises e métricas' },
  { id: 'config', label: 'Configuração', icon: Settings, description: 'Sistema e integrações' },
  { id: 'sobre', label: 'Sobre', icon: Info, description: 'Informações do sistema' },
];

const NAV_BY_TAB: Record<TabType, NavSection[]> = {
  // =========================================
  // ABA 1: PRINCIPAL (Operação Diária)
  // Centro de Comando unificado + Operacional
  // =========================================
  principal: [
    {
      title: 'Centro de Comando',
      items: [
        // Dashboard unificado com seletor de views (Principal, Financeiro, KPIs, Web3)
        { label: 'Visao Geral', icon: LayoutDashboard, href: '/admin/dashboard' },
      ],
    },
    {
      title: 'Gestao',
      items: [
        { label: 'Imobiliarias', icon: Building2, href: '/admin/agencies' },
        { label: 'Imoveis', icon: Home, href: '/admin/properties' },
        { label: 'Contratos', icon: FileText, href: '/admin/contracts' },
        { label: 'Vistorias', icon: Camera, href: '/admin/inspection' },
      ],
    },
    {
      title: 'Atendimento',
      items: [
        { label: 'Suporte & Monitoramento', icon: Users, href: '/admin/support-monitor' },
        { label: 'CRM Live', icon: Flame, href: '/admin/crm-live' },
        { label: 'Central Mensagens', icon: MessageSquare, href: '/admin/communication' },
      ],
    },
    {
      title: 'Token & Marketplace',
      items: [
        { label: 'VBRz Token Admin', icon: Coins, href: '/admin/vbrz-token' },
        { label: 'Cashback', icon: CreditCard, href: '/admin/cashback' },
        { label: 'NFT Registry', icon: Hexagon, href: '/admin/nft-registry' },
        { label: 'Produtos & Seguros', icon: Store, href: '/admin/marketplace' },
      ],
    },
  ],

  // =========================================
  // ABA 2: RELATÓRIOS (Detalhes e Finanças)
  // Dashboards de detalhe acessiveis via Centro de Comando
  // =========================================
  relatorios: [
    {
      title: 'Financeiro',
      items: [
        { label: 'DRE Geral', icon: Wallet, href: '/admin/financeiro' },
        { label: 'Investimentos', icon: Banknote, href: '/admin/investments' },
        { label: 'Antecipacao de Aluguel', icon: Landmark, href: '/admin/defi' },
      ],
    },
    {
      title: 'Auditoria',
      items: [
        { label: 'Logs do Sistema', icon: Shield, href: '/admin/auditoria' },
      ],
    },
  ],

  // =========================================
  // ABA 3: CONFIGURAÇÃO (Sistema e Integrações)
  // =========================================
  config: [
    {
      title: 'Cérebro / Automação',
      items: [
        { label: 'Engage (Marketing)', icon: Zap, href: '/admin/engage' },
        { label: 'Engine de Anúncios', icon: Megaphone, href: '/admin/ads' },
      ],
    },
    {
      title: 'Canais & Integrações',
      items: [
        { label: 'Omnichannel', icon: Globe, href: '/admin/omnichannel' },
        { label: 'Integrações API', icon: PlugZap, href: '/admin/integrations' },
        { label: 'SMTP / E-mail', icon: Mail, href: '/admin/smtp' },
        { label: 'GitHub', icon: Github, href: '/admin/github' },
      ],
    },
    {
      title: 'Segurança',
      items: [
        { label: 'Usuários Admin', icon: Users, href: '/admin/users' },
        { label: 'Gestão de Acessos', icon: Key, href: '/admin/permissions' },
        { label: 'Roles & Permissões', icon: Lock, href: '/admin/roles' },
      ],
    },
    {
      title: 'Sistema',
      items: [
        { label: 'Configurações Gerais', icon: Settings, href: '/admin/settings' },
        { label: 'Feature Flags', icon: ToggleLeft, href: '/admin/feature-flags' },
        { label: 'Assistente de Configuração', icon: Wrench, href: '/setup' },
      ],
    },
  ],

  // =========================================
  // ABA 4: SOBRE (Informações do Sistema)
  // =========================================
  sobre: [
    {
      title: 'Vínculo Brasil',
      items: [
        { label: 'Sobre o Sistema', icon: Info, href: '/admin/about' },
        { label: 'Documentação', icon: BookOpen, href: '/admin/docs' },
        { label: 'Changelog', icon: FileText, href: '/admin/changelog' },
      ],
    },
    {
      title: 'Suporte',
      items: [
        { label: 'Central de Ajuda', icon: HelpCircle, href: '/admin/help' },
        { label: 'Contato', icon: MessageSquare, href: '/admin/contact' },
      ],
    },
  ],
};

// Função para detectar qual aba baseado na URL atual
function detectActiveTab(pathname: string): TabType {
  // Relatórios (paginas de detalhe financeiro)
  if (
    pathname.includes('/financeiro') ||
    pathname.includes('/auditoria') ||
    pathname.includes('/investments') ||
    pathname.includes('/defi')
  ) {
    return 'relatorios';
  }

  // Configuração
  if (
    pathname.includes('/settings') ||
    pathname.includes('/engage') ||
    pathname.includes('/flow-builder') ||
    pathname.includes('/ads') ||
    pathname.includes('/omnichannel') ||
    pathname.includes('/integrations') ||
    pathname.includes('/smtp') ||
    pathname.includes('/github') ||
    pathname.includes('/setup') ||
    pathname.includes('/feature-flags')
  ) {
    return 'config';
  }

  // Sobre
  if (
    pathname.includes('/about') ||
    pathname.includes('/docs') ||
    pathname.includes('/changelog') ||
    pathname.includes('/help') ||
    pathname.includes('/contact')
  ) {
    return 'sobre';
  }

  // Default: Principal (inclui vbrz-token, cashback, etc)
  return 'principal';
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

export function AdminLayout({
  children,
  userName = 'Administrador',
}: AdminLayoutProps) {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<TabType>(() => detectActiveTab(location.pathname));
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false); // Inicia expandido (menus com título)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [showSetupWizard, setShowSetupWizard] = useState(false);

  // Toggle tema claro/escuro
  const toggleTheme = () => {
    setDarkMode(!darkMode);
    // Aqui você pode adicionar lógica para persistir o tema
    document.documentElement.classList.toggle('dark', !darkMode);
  };

  // Conectar carteira
  const connectWallet = async () => {
    const ethereum = window.ethereum as { request: (args: { method: string }) => Promise<string[]> } | undefined;
    if (!ethereum) {
      alert('MetaMask não encontrada!');
      return;
    }
    try {
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      if (accounts?.[0]) {
        setWalletAddress(accounts[0]);
        setWalletConnected(true);
      }
    } catch (error) {
      console.error('Erro ao conectar:', error);
    }
  };

  // Sincroniza a aba ativa com a URL atual
  useEffect(() => {
    setActiveTab(detectActiveTab(location.pathname));
  }, [location.pathname]);

  const isActive = (href: string) => {
    const basePath = href.split('?')[0];
    return location.pathname === basePath || location.pathname.startsWith(basePath + '/');
  };

  const currentSections = NAV_BY_TAB[activeTab];
  const currentTabInfo = TABS.find(t => t.id === activeTab);

  const renderNavItem = (item: NavItem, collapsed: boolean) => {
    const active = isActive(item.href);
    const Icon = item.icon;

    // Setup Wizard abre como dialog em vez de navegar
    if (item.href === '/setup') {
      return (
        <button
          key={item.href}
          onClick={() => setShowSetupWizard(true)}
          title={collapsed ? item.label : undefined}
          className={cn(
            'w-full flex items-center gap-2 px-2.5 py-2 rounded-md transition-all duration-150 group relative',
            collapsed && 'justify-center px-2 py-1.5',
            showSetupWizard
              ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
              : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
          )}
        >
          <Icon className={cn('h-4 w-4 flex-shrink-0', showSetupWizard ? 'text-white' : 'text-zinc-500 group-hover:text-white')} />
          {!collapsed && (
            <span className="font-medium text-xs truncate">{item.label}</span>
          )}
        </button>
      );
    }

    return (
      <a
        key={item.href}
        href={item.href}
        title={collapsed ? item.label : undefined}
        className={cn(
          // Densidade alta: padding reduzido em 20% (py-2 em vez de py-2.5, px-2.5 em vez de px-3)
          'flex items-center gap-2 px-2.5 py-2 rounded-md transition-all duration-150 group relative',
          collapsed && 'justify-center px-2 py-1.5',
          active
            ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
            : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
        )}
      >
        <Icon className={cn('h-4 w-4 flex-shrink-0', active ? 'text-white' : 'text-zinc-500 group-hover:text-white')} />
        {!collapsed && (
          <span className="font-medium text-xs truncate">{item.label}</span>
        )}
      </a>
    );
  };

  // Abas sempre mostram só ícone com tooltip (mesmo quando sidebar expandido)
  const renderTabs = () => (
    <div className="flex justify-center gap-1 p-2 border-b border-zinc-800 bg-zinc-900/50">
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const isActiveTab = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            title={tab.label} // Tooltip ao passar o mouse
            className={cn(
              'flex items-center justify-center p-2.5 rounded-md transition-all duration-150 relative group',
              isActiveTab
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-zinc-800/50 text-zinc-400 hover:bg-zinc-800 hover:text-white'
            )}
          >
            <Icon className="h-4 w-4" />
            {/* Tooltip customizado */}
            <span className="absolute left-1/2 -translate-x-1/2 -bottom-8 px-2 py-1 text-[10px] font-medium text-white bg-zinc-800 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
              {tab.label}
            </span>
          </button>
        );
      })}
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-950">
      {/* SIDEBAR DESKTOP */}
      <aside
        className={cn(
          'fixed left-0 top-0 h-full bg-zinc-900 border-r border-zinc-800 z-40 transition-all duration-300 hidden md:flex flex-col',
          sidebarCollapsed ? 'w-16' : 'w-64'
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-zinc-800">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-2">
              <VinculoBrasilLogo className="h-8 w-8" />
              <div>
                <span className="text-white font-bold">Vínculo</span>
                <span className="text-xs text-blue-400 ml-1">Admin</span>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="text-zinc-500 hover:text-white hover:bg-zinc-800"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          >
            {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        {/* ABAS HORIZONTAIS */}
        {renderTabs()}

        {/* Título da Aba Atual - Compacto */}
        {!sidebarCollapsed && currentTabInfo && (
          <div className="px-3 py-2 border-b border-zinc-800/50">
            <h3 className="text-xs font-bold text-white">{currentTabInfo.label}</h3>
            <p className="text-[10px] text-zinc-500">{currentTabInfo.description}</p>
          </div>
        )}

        {/* Navigation - Itens da Aba Selecionada - Densidade Alta */}
        <nav className="flex-1 overflow-y-auto p-2 space-y-2">
          {currentSections.map((section) => (
            <div key={section.title}>
              {!sidebarCollapsed && (
                <p className="px-2 mb-1 text-[10px] font-bold text-zinc-600 uppercase tracking-wider">
                  {section.title}
                </p>
              )}
              <div className="space-y-0.5">
                {section.items.map((item) => renderNavItem(item, sidebarCollapsed))}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer do Sidebar - Menu do Usuário com Dropdown */}
        <div className="p-3 border-t border-zinc-800">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer',
                  sidebarCollapsed && 'justify-center'
                )}
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-gradient-to-tr from-blue-500 to-purple-500 text-white text-sm">
                    {userName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {!sidebarCollapsed && (
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-sm font-medium text-white truncate">{userName}</p>
                    <p className="text-xs text-zinc-500 truncate">Super Admin</p>
                  </div>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align={sidebarCollapsed ? 'center' : 'start'}
              side="top"
              className="w-56 bg-zinc-900 border-zinc-700"
            >
              <DropdownMenuItem asChild>
                <a href="/admin/profile" className="flex items-center text-zinc-300 focus:bg-zinc-800 focus:text-white cursor-pointer">
                  <User className="h-4 w-4 mr-2" />
                  Meu Perfil
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <a href="/admin/settings" className="flex items-center text-zinc-300 focus:bg-zinc-800 focus:text-white cursor-pointer">
                  <Settings className="h-4 w-4 mr-2" />
                  Configurações
                </a>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-zinc-700" />
              <DropdownMenuItem className="text-red-400 focus:bg-red-500/10 focus:text-red-300 cursor-pointer">
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* HEADER MOBILE */}
      <header className="fixed top-0 left-0 right-0 h-14 bg-zinc-900 border-b border-zinc-800 z-50 flex items-center justify-between px-4 md:hidden">
        <div className="flex items-center gap-2">
          <VinculoBrasilLogo className="h-6 w-6" />
          <span className="text-white font-bold">Vínculo</span>
          <span className="text-xs text-blue-400">Admin</span>
        </div>
        <div className="flex items-center gap-1">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="text-zinc-400 hover:text-white"
            onClick={toggleTheme}
            title={darkMode ? 'Modo Claro' : 'Modo Escuro'}
          >
            {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>
          {/* Wallet Connect */}
          <Button
            variant="ghost"
            size="icon"
            className={walletConnected ? 'text-green-400 hover:text-green-300' : 'text-zinc-400 hover:text-white'}
            onClick={connectWallet}
            title={walletConnected ? `Conectado: ${walletAddress?.slice(0, 6)}...` : 'Conectar Carteira'}
          >
            <Wallet className="h-5 w-5" />
          </Button>
          {/* Notifications */}
          <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white">
            <Bell className="h-5 w-5" />
          </Button>
          {/* Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="text-zinc-400 hover:text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </header>

      {/* MOBILE MENU OVERLAY */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* MOBILE SIDEBAR */}
      <div
        className={cn(
          'fixed top-14 left-0 bottom-0 w-72 bg-zinc-900 z-50 transform transition-transform duration-300 md:hidden overflow-y-auto flex flex-col',
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* ABAS MOBILE */}
        <div className="flex p-2 gap-1 border-b border-zinc-800 bg-zinc-900/50">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActiveTab = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex-1 flex items-center justify-center gap-1 px-2 py-2 rounded-lg transition-all',
                  isActiveTab
                    ? 'bg-blue-600 text-white'
                    : 'bg-zinc-800/50 text-zinc-400'
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="text-[10px] font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Título da Aba */}
        {currentTabInfo && (
          <div className="px-4 py-3 border-b border-zinc-800/50">
            <h3 className="text-sm font-bold text-white">{currentTabInfo.label}</h3>
            <p className="text-xs text-zinc-500">{currentTabInfo.description}</p>
          </div>
        )}

        {/* Navegação Mobile */}
        <nav className="flex-1 p-3 space-y-4 overflow-y-auto">
          {currentSections.map((section) => (
            <div key={section.title}>
              <p className="px-3 mb-2 text-xs font-bold text-zinc-600 uppercase tracking-wider">
                {section.title}
              </p>
              <div className="space-y-1">
                {section.items.map((item) => renderNavItem(item, false))}
              </div>
            </div>
          ))}
        </nav>

        <div className="p-3 border-t border-zinc-800">
          <Button
            variant="ghost"
            className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-500/10"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sair
          </Button>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <main
        className={cn(
          'min-h-screen pt-14 md:pt-0 transition-all duration-300',
          sidebarCollapsed ? 'md:ml-16' : 'md:ml-64'
        )}
      >
        {children}
      </main>

      {/* Widget de Suporte Flutuante */}
      <SupportWidget position="bottom-right" />

      {/* Setup Wizard Sheet */}
      <Sheet open={showSetupWizard} onOpenChange={setShowSetupWizard}>
        <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto bg-zinc-950 border-zinc-800">
          <SheetHeader>
            <SheetTitle className="text-white">Assistente de Configuração</SheetTitle>
            <SheetDescription className="text-zinc-400">
              Configure as integrações e credenciais do sistema
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6">
            <SetupWizard />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
