// ============================================
// ADMIN CASHBACK - Sistema de Cashback VBRz
// Dashboard completo de gestão do cashback
// ============================================

import { createFileRoute } from '@tanstack/react-router';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { CashbackAdminDashboard } from '@/components/admin/cashback/cashback-admin-dashboard';

export const Route = createFileRoute('/admin/cashback' as never)({
  component: CashbackPage,
});

function CashbackPage() {
  return (
    <AdminLayout>
      <CashbackAdminDashboard />
    </AdminLayout>
  );
}
