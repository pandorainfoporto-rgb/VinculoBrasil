import { createFileRoute } from '@tanstack/react-router';
import { TenantClientArea } from '@/components/tenant-client-area';

export const Route = createFileRoute('/inquilino/area')({
  component: AreaPage,
});

function AreaPage() {
  return <TenantClientArea />;
}
