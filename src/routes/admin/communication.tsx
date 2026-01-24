// ============================================
// ROTA /admin/communication - Central de Mensagens
// USA AdminLayout (Super Admin)
// ============================================

import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { CommunicationHub } from "@/components/communication-hub";

export const Route = createFileRoute("/admin/communication")({
  component: CommunicationPage,
});

function CommunicationPage() {
  return (
    <AdminLayout userName="Administrador">
      <CommunicationHub />
    </AdminLayout>
  );
}
