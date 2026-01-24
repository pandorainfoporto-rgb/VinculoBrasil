// ============================================
// ROTA /admin/agencies - Gestão de Imobiliárias
// Arquitetura Limpa: Cadastro separado de Deploy
// ============================================

import { createFileRoute } from '@tanstack/react-router';
import { AgencyModule } from '@/components/admin/agencies/AgencyModule';
import { AdminLayout } from '@/components/layouts/AdminLayout';

export const Route = createFileRoute('/admin/agencies')({
  component: AdminAgenciesPage,
});

function AdminAgenciesPage() {
  return (
    <AdminLayout userName="Administrador">
      <AgencyModule />
    </AdminLayout>
  );
}
