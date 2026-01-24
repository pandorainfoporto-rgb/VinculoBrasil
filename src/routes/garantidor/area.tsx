import { createFileRoute } from '@tanstack/react-router';
import { GuarantorClientArea } from '@/components/guarantor-client-area';

export const Route = createFileRoute('/garantidor/area')({
  component: AreaPage,
});

function AreaPage() {
  return <GuarantorClientArea />;
}
