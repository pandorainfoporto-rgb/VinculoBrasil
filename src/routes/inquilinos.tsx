import { createFileRoute } from '@tanstack/react-router';
import { TenantLandingPage } from '@/components/tenant-landing-page';

export const Route = createFileRoute('/inquilinos')({
  component: InquilinosPage,
});

function InquilinosPage() {
  return <TenantLandingPage />;
}
