import { createFileRoute } from '@tanstack/react-router';
import { LandlordClientArea } from '@/components/landlord-client-area';

export const Route = createFileRoute('/locador/area')({
  component: AreaPage,
});

function AreaPage() {
  return <LandlordClientArea />;
}
