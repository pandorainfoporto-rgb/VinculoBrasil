// ============================================
// ROTA /admin/dashboard - Centro de Comando Unificado
// USA AdminLayout (Super Admin) com DashboardContainer
// ============================================

import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { DashboardContainer } from "@/components/admin/dashboard";

export const Route = createFileRoute("/admin/dashboard")({
  component: AdminDashboardPage,
});

function AdminDashboardPage() {
  return (
    <AdminLayout userName="Administrador">
      <DashboardContainer />
    </AdminLayout>
  );
}
