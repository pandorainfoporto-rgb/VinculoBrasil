// ============================================
// ROTA /admin/flow-builder - Flow Builder (IA)
// USA AdminLayout (Super Admin)
// ============================================

import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/layouts/AdminLayout";
import { FlowBuilder } from "@/components/omnichannel/flow-builder/flow-builder";

export const Route = createFileRoute("/admin/flow-builder")({
  component: FlowBuilderPage,
});

function FlowBuilderPage() {
  return (
    <AdminLayout userName="Administrador">
      <div className="p-6">
        <FlowBuilder />
      </div>
    </AdminLayout>
  );
}
