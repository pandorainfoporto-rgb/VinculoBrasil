import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { GuarantorConsentTerm } from '@/components/guarantor-consent-term';

export const Route = createFileRoute('/garantidor/termo')({
  component: TermoPage,
});

function TermoPage() {
  const navigate = useNavigate();

  // Mock property data - in production, this would come from state/params
  const mockProperty = {
    id: 'prop_001',
    matricula: '12.345-CRI-MT',
    address: 'Rua das Flores, 123 - Jardim Europa, Cuiaba/MT - CEP 78000-000',
    marketValue: 450000,
    ownerName: 'Proprietario Teste',
    ownerCpf: '123.456.789-00',
  };

  const handleSign = async (signatureData: unknown) => {
    console.log('Assinatura recebida:', signatureData);
    // Simulate blockchain transaction
    await new Promise((resolve) => setTimeout(resolve, 3000));
  };

  const handleCancel = () => {
    navigate({ to: '/garantidores' });
  };

  return (
    <div className="min-h-screen bg-muted py-12 px-4">
      <GuarantorConsentTerm
        property={mockProperty}
        onSign={handleSign}
        onCancel={handleCancel}
      />
    </div>
  );
}
