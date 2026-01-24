import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { TenantKYCForm } from '@/components/tenant-kyc-form';

export const Route = createFileRoute('/verificar')({
  component: VerificarPage,
});

function VerificarPage() {
  const navigate = useNavigate();

  const handleComplete = () => {
    // Navigate to marketplace after KYC completion
    navigate({ to: '/marketplace' });
  };

  return (
    <div className="min-h-screen bg-muted py-12 px-4">
      <div className="max-w-2xl mx-auto mb-8 text-center">
        <h1 className="text-3xl font-bold text-foreground mb-2">Verificacao de Perfil</h1>
        <p className="text-muted-foreground">
          Complete sua verificacao para acessar o Marketplace de Garantidores
        </p>
      </div>
      <TenantKYCForm onComplete={handleComplete} />
    </div>
  );
}
