import { createFileRoute } from '@tanstack/react-router';
import { AdminAuditDashboard } from '@/components/admin-audit-dashboard';
import { AdminLayout } from '@/components/layouts/AdminLayout';

export const Route = createFileRoute('/admin/auditoria')({
  component: AuditoriaPage,
});

function AuditoriaPage() {
  return (
    <AdminLayout userName="Administrador">
      <AdminAuditDashboard />
    </AdminLayout>
  );
}
