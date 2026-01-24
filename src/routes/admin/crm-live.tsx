// ============================================
// ROTA /admin/crm-live - Mesa de Operações
// Kanban CRM + Chat unificados em tela dividida
// USA AdminLayout (Super Admin)
// ============================================

import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { CRMLive } from "@/components/crm/crm-live";

export const Route = createFileRoute("/admin/crm-live")({
  component: CRMLivePage,
});

function CRMLivePage() {
  return (
    <AdminLayout userName="Administrador">
      <CRMLive />
    </AdminLayout>
  );
}
