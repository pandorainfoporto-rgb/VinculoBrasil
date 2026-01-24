// ============================================
// ADMIN FEATURE FLAGS - Controle de Módulos
// Painel para ativar/desativar funcionalidades
// ============================================

import { createFileRoute } from '@tanstack/react-router';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { FeatureFlagsManager } from '@/components/admin/feature-flags-manager';

export const Route = createFileRoute('/admin/feature-flags' as never)({
  component: FeatureFlagsPage,
});

function FeatureFlagsPage() {
  return (
    <AdminLayout>
      <FeatureFlagsManager />
    </AdminLayout>
  );
}
