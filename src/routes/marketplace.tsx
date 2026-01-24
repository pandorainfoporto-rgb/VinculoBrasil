import { createFileRoute } from '@tanstack/react-router';
import { GuarantorMarketplace } from '@/components/guarantor-marketplace';

export const Route = createFileRoute('/marketplace')({
  component: MarketplacePage,
});

function MarketplacePage() {
  return <GuarantorMarketplace />;
}
