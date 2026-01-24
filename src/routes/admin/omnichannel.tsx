// ============================================
// ROTA /admin/omnichannel - Configuração Omnichannel
// USA AdminLayout (Super Admin)
// ============================================

import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import OmnichannelConfig from "@/components/omnichannel/omnichannel-config";

export const Route = createFileRoute("/admin/omnichannel")({
  component: OmnichannelPage,
});

function OmnichannelPage() {
  return (
    <AdminLayout userName="Administrador">
      <OmnichannelConfig />
    </AdminLayout>
  );
}
