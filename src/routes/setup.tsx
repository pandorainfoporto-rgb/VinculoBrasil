// ============================================
// ROTA /setup - Wizard de Configuracao Inicial
// ============================================

import { createFileRoute } from "@tanstack/react-router";
import { SetupWizard } from "@/components/setup";

export const Route = createFileRoute("/setup")({
  component: SetupPage,
});

function SetupPage() {
  return <SetupWizard />;
}
