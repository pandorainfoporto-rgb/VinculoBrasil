// ============================================
// ROTA /admin/smtp - Configuração SMTP / E-mail
// USA AdminLayout (Super Admin)
// ============================================

import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { SmtpConfigList } from "@/components/engage/smtp-config";

export const Route = createFileRoute("/admin/smtp")({
  component: SmtpPage,
});

function SmtpPage() {
  return (
    <AdminLayout userName="Administrador">
      <div className="p-6">
        <SmtpConfigList />
      </div>
    </AdminLayout>
  );
}
