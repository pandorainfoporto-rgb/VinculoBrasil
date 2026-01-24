// ============================================
// TENANT PORTAL - Layout Mobile-First
// Experiencia "Nubank" para inquilinos
// ============================================

import { useNavigate, useLocation } from '@tanstack/react-router';
import { Home, FileText, User, LogOut, CreditCard, Bell, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TenantLayoutProps {
  children: React.ReactNode;
}

export function TenantLayout({ children }: TenantLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    window.location.href = '/';
  };

  const navItems = [
    { icon: Home, label: 'Inicio', path: '/tenant/dashboard' },
    { icon: CreditCard, label: 'Pagamentos', path: '/tenant/payments' },
    { icon: FileText, label: 'Contrato', path: '/tenant/contract' },
    { icon: User, label: 'Perfil', path: '/tenant/profile' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-0">
      {/* ============================================ */}
      {/* HEADER */}
      {/* ============================================ */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between max-w-4xl">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center">
              <Home className="h-4 w-4 text-white" />
            </div>
            <div>
              <span className="font-bold text-lg text-slate-900">Vinculo</span>
              <span className="text-slate-400 font-normal text-sm">.tenant</span>
            </div>
          </div>

          {/* Header Actions */}
          <div className="flex items-center gap-2">
            <button className="p-2 rounded-full hover:bg-slate-100 transition-colors relative">
              <Bell className="h-5 w-5 text-slate-500" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <button className="p-2 rounded-full hover:bg-slate-100 transition-colors hidden md:block">
              <HelpCircle className="h-5 w-5 text-slate-500" />
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden md:inline">Sair</span>
            </button>
          </div>
        </div>
      </header>

      {/* ============================================ */}
      {/* MAIN CONTENT */}
      {/* ============================================ */}
      <main className="container mx-auto px-4 py-6 max-w-4xl">
        {children}
      </main>

      {/* ============================================ */}
      {/* BOTTOM NAVIGATION (MOBILE) */}
      {/* ============================================ */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex md:hidden justify-around py-2 z-40 safe-area-inset-bottom">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);

          return (
            <button
              key={item.path}
              onClick={() => navigate({ to: item.path as never })}
              className={cn(
                'flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors',
                active
                  ? 'text-indigo-600'
                  : 'text-slate-400 hover:text-slate-600'
              )}
            >
              <Icon className={cn('h-5 w-5', active && 'text-indigo-600')} />
              <span className={cn('text-[10px] font-medium', active && 'text-indigo-600')}>
                {item.label}
              </span>
            </button>
          );
        })}
      </nav>

      {/* ============================================ */}
      {/* DESKTOP NAVIGATION (SIDEBAR SIMPLES) */}
      {/* ============================================ */}
      <div className="hidden md:block fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-slate-200 p-4">
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <button
                key={item.path}
                onClick={() => navigate({ to: item.path as never })}
                className={cn(
                  'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all',
                  active
                    ? 'bg-indigo-50 text-indigo-700 font-medium'
                    : 'text-slate-600 hover:bg-slate-50'
                )}
              >
                <Icon className={cn('h-5 w-5', active ? 'text-indigo-600' : 'text-slate-400')} />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Help Card */}
        <div className="mt-8 p-4 bg-gradient-to-br from-slate-100 to-slate-50 rounded-xl">
          <HelpCircle className="h-6 w-6 text-slate-400 mb-2" />
          <p className="text-sm font-medium text-slate-700">Precisa de ajuda?</p>
          <p className="text-xs text-slate-500 mt-1">
            Fale com a imobiliaria ou acesse nosso suporte 24h.
          </p>
          <button className="mt-3 text-sm text-indigo-600 font-medium hover:underline">
            Abrir chamado
          </button>
        </div>
      </div>
    </div>
  );
}

export default TenantLayout;
