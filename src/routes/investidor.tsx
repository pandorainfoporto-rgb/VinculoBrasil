/**
 * Rota: /investidor
 *
 * Dashboard para apresentacao a investidores da CVM.
 * Visualizacao do protocolo de tokenizacao RWA.
 */

import { createFileRoute } from '@tanstack/react-router';
import { CvmInvestorDashboard } from '@/components/cvm-investor-dashboard';

export const Route = createFileRoute('/investidor')({
  component: InvestorPage,
});

function InvestorPage() {
  return <CvmInvestorDashboard />;
}
