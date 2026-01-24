import { createFileRoute } from '@tanstack/react-router';
import { GuarantorLandingPage } from '@/components/guarantor-landing-page';

export const Route = createFileRoute('/garantidores')({
  component: GarantidoresPage,
});

function GarantidoresPage() {
  return <GuarantorLandingPage />;
}
