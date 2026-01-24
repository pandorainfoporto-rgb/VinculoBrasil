import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { VinculoBrasilLogo } from '@/components/vinculo-brasil-logo';
import { PitchDeck } from '@/components/pitch-deck';
import { TenantDashboard } from '@/components/dashboards/tenant-dashboard';
import { GuarantorDashboard } from '@/components/dashboards/guarantor-dashboard';
import { LandlordDashboard } from '@/components/dashboards/landlord-dashboard';
import { AdminDashboard } from '@/components/dashboards/admin-dashboard';
import { InsurerDashboard } from '@/components/dashboards/insurer-dashboard';
import { LandingPage, type RegisteredUser } from '@/components/landing-page';

export const Route = createFileRoute('/')({
  component: RentalPlatform,
});

// Email especial que concede acesso admin
const ADMIN_EMAILS = ['admin@vinculobrasil.com.br', 'renato@vinculobrasil.com.br', 'admin@vinculobrasil.com.br', 'renato@vinculobrasil.com.br'];

function RentalPlatform() {
  const [showLanding, setShowLanding] = useState(true);
  const [authenticatedUser, setAuthenticatedUser] = useState<RegisteredUser | null>(null);
  const [showPitchDeck, setShowPitchDeck] = useState(false);

  const handleEnterApp = (user: RegisteredUser) => {
    setAuthenticatedUser(user);
    setShowLanding(false);
  };

  const handleLogout = () => {
    setAuthenticatedUser(null);
    setShowLanding(true);
    setShowPitchDeck(false);
  };

  // Verifica se o usuario e admin pelo email
  const isAdmin = authenticatedUser && ADMIN_EMAILS.includes(authenticatedUser.email.toLowerCase());

  // Determina o tipo de dashboard baseado no userType do cadastro
  const getUserDashboardType = (): 'tenant' | 'guarantor' | 'landlord' | 'admin' | 'realestate' | 'insurer' => {
    if (!authenticatedUser) return 'tenant';
    if (isAdmin) return 'admin';
    return authenticatedUser.userType;
  };

  // Labels para exibicao
  const getUserTypeLabel = (userType: string, isAdminUser: boolean): string => {
    if (isAdminUser) return 'Administrador';
    const labels: Record<string, string> = {
      tenant: 'Locatario',
      landlord: 'Proprietario',
      guarantor: 'Garantidor',
      realestate: 'Imobiliaria',
      insurer: 'Seguradora',
    };
    return labels[userType] || userType;
  };

  // Se estiver mostrando a Landing Page, renderiza apenas ela
  if (showLanding) {
    return <LandingPage onEnterApp={handleEnterApp} />;
  }

  // Se estiver mostrando o Pitch Deck (disponivel apenas para admin)
  if (showPitchDeck && isAdmin) {
    return (
      <div>
        <div className="fixed top-4 right-4 z-50">
          <Button onClick={() => setShowPitchDeck(false)} variant="outline" className="bg-card border-border">
            Voltar ao Dashboard
          </Button>
        </div>
        <PitchDeck />
      </div>
    );
  }

  // Renderiza o dashboard baseado no tipo de usuario autenticado
  const dashboardType = getUserDashboardType();

  // Header compartilhado por todos os dashboards
  const DashboardHeader = () => (
    <header className="bg-background border-b border-border">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <VinculoBrasilLogo size="lg" />
          </div>
          <div className="flex items-center gap-4">
            {/* Botao Pitch Deck - apenas para admin */}
            {isAdmin && (
              <Button variant="outline" size="sm" onClick={() => setShowPitchDeck(true)} className="border-border">
                Pitch Deck
              </Button>
            )}

            <Badge variant="outline" className="text-base border-border">
              {getUserTypeLabel(authenticatedUser?.userType || '', !!isAdmin)}
            </Badge>
            <div className="text-right hidden md:block">
              <p className="text-sm font-medium text-foreground">{authenticatedUser?.fullName}</p>
              <p className="text-xs text-muted-foreground">{authenticatedUser?.email}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout} title="Sair">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );

  // Dashboard do Locatario
  if (dashboardType === 'tenant') {
    return (
      <TenantDashboard
        onLogout={handleLogout}
        userName={authenticatedUser?.fullName}
        userEmail={authenticatedUser?.email}
      />
    );
  }

  // Dashboard do Garantidor
  if (dashboardType === 'guarantor') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
        <DashboardHeader />
        <div className="container mx-auto p-6">
          <GuarantorDashboard />
        </div>
      </div>
    );
  }

  // Dashboard do Locador/Proprietario
  if (dashboardType === 'landlord') {
    return (
      <LandlordDashboard
        onLogout={handleLogout}
        userName={authenticatedUser?.fullName}
        userEmail={authenticatedUser?.email}
      />
    );
  }

  // Dashboard do Administrador (CRM com layout proprio)
  if (dashboardType === 'admin') {
    return <AdminDashboard />;
  }

  // Dashboard da Imobiliaria (B2B2C) - usa dashboard do landlord com funcionalidades extras
  if (dashboardType === 'realestate') {
    return (
      <LandlordDashboard
        onLogout={handleLogout}
        userName={authenticatedUser?.fullName}
        userEmail={authenticatedUser?.email}
      />
    );
  }

  // Dashboard da Seguradora
  if (dashboardType === 'insurer') {
    return (
      <InsurerDashboard
        onLogout={handleLogout}
        userName={authenticatedUser?.fullName}
        userEmail={authenticatedUser?.email}
      />
    );
  }

  // Fallback - nunca deveria chegar aqui
  return <TenantDashboard />;
}
