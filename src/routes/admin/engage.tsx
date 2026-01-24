// ============================================
// ROTA /admin/engage - Engage (Marketing Automation)
// USA AdminLayout (Super Admin)
// ============================================

import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { EngageDashboard } from "@/components/engage/engage-dashboard";

export const Route = createFileRoute("/admin/engage")({
  component: EngagePage,
});

function EngagePage() {
  return (
    <AdminLayout userName="Administrador">
      <EngageDashboard />
    </AdminLayout>
  );
}
