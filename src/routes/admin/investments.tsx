// ============================================
// ROTA /admin/investments - Mesa de Operacoes DeFi
// USA AdminLayout (Super Admin) - NÃO AgencyLayout
// ============================================

import { createFileRoute } from "@tanstack/react-router";
import { InvestmentsDashboard } from "@/components/admin/investments-dashboard";
import { AdminLayout } from "@/components/layouts/AdminLayout";

export const Route = createFileRoute("/admin/investments")({
  component: InvestmentsPage,
});

function InvestmentsPage() {
  return (
    <AdminLayout userName="Administrador">
      <InvestmentsDashboard />
    </AdminLayout>
  );
}
