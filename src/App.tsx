import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "sonner";

// Layouts
import { MainLayout } from "./components/layouts/MainLayout";
import { AuthLayout } from "./components/layouts/AuthLayout";

// Menus
import {
  superuserTabs,
  agencyMenu,
  landlordMenu,
  tenantMenu,
  investorMenu,
  guarantorMenu,
  insurerMenu,
} from "./config/menus";

// Páginas Públicas
import { LandingPage } from "./modules/public/pages/LandingPage";
import { GatewayPage } from "./modules/public/pages/GatewayPage";
import { LoginPage } from "./modules/public/pages/LoginPage";

// Páginas Superuser
import { SuperuserDashboard } from "./modules/superuser/pages/Dashboard";
import { GlobalSettingsPage } from "./modules/superuser/pages/GlobalSettingsPage";
import { AgenciesManagementPage } from "./modules/superuser/pages/AgenciesManagementPage";
import { Web3DebugPage } from "./modules/superuser/pages/Web3DebugPage";
import { FinancialPage } from "./modules/superuser/pages/FinancialPage";

// Páginas Superuser - Finance
import { CashFlowPage } from "./modules/superuser/pages/finance/CashFlowPage";
import { BankAccountsPage } from "./modules/superuser/pages/finance/BankAccountsPage";
import { AccountsPayablePage } from "./modules/superuser/pages/finance/AccountsPayablePage";
import { AccountsReceivablePage } from "./modules/superuser/pages/finance/AccountsReceivablePage";
import { SuppliersPage } from "./modules/superuser/pages/finance/SuppliersPage";
import { DREPage } from "./modules/superuser/pages/finance/DREPage";
import { AnticipationsPage } from "./modules/superuser/pages/finance/AnticipationsPage";

// Páginas Superuser - CRM
import { ChannelsPage } from "./modules/superuser/pages/crm/ChannelsPage";
import { CRMPage } from "./modules/superuser/pages/crm/CRMPage";
import { AIAgentsPage } from "./modules/superuser/pages/crm/AIAgentsPage";

// Páginas Superuser - Blockchain
import { BlockchainPage } from "./modules/superuser/pages/blockchain/BlockchainPage";
import { VBRzPage } from "./modules/superuser/pages/blockchain/VBRzPage";
import { VBRzMarketPage } from "./modules/superuser/pages/blockchain/VBRzMarketPage";

// Páginas Agency
import { AgencyDashboard } from "./modules/agency/pages/Dashboard";
import { PropertiesPage } from "./modules/agency/pages/PropertiesPage";
import { RealtorsPage } from "./modules/agency/pages/RealtorsPage";
import { SplitCalculatorPage } from "./modules/agency/pages/SplitCalculatorPage";

// Páginas outros módulos
import { LandlordDashboard } from "./modules/landlord/pages/Dashboard";
import { TenantDashboard } from "./modules/tenant/pages/Dashboard";
import { InvestorDashboard } from "./modules/investor/pages/Dashboard";
import { GuarantorDashboard } from "./modules/guarantor/pages/Dashboard";
import { InsurerDashboard } from "./modules/insurer/pages/Dashboard";

// Guards
import { ProtectedRoute } from "./components/guards/ProtectedRoute";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* ============================================ */}
        {/* LANDING PAGE - Página Pública */}
        {/* ============================================ */}
        <Route path="/" element={<LandingPage />} />

        {/* ============================================ */}
        {/* HUB - Gateway de Desenvolvimento */}
        {/* ============================================ */}
        <Route path="/hub" element={<GatewayPage />} />

        {/* ============================================ */}
        {/* SIMULADOR - Calculadora de Split Pública */}
        {/* ============================================ */}
        <Route path="/simulador" element={<SplitCalculatorPage />} />

        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<LoginPage />} />
          <Route path="/forgot-password" element={<LoginPage />} />
        </Route>

        {/* ============================================ */}
        {/* SUPERUSER - Modo Deus (Tabbed Sidebar) */}
        {/* ============================================ */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute allowedRoles={["superuser"]}>
              <MainLayout
                tabs={superuserTabs}
                title="Superuser"
                subtitle="Modo Deus"
              >
                <Routes>
                  {/* Dashboard */}
                  <Route index element={<SuperuserDashboard />} />
                  <Route path="bi" element={<SuperuserDashboard />} />

                  {/* Entidades (placeholder - uses Dashboard) */}
                  <Route path="properties" element={<SuperuserDashboard />} />
                  <Route path="agencies" element={<AgenciesManagementPage />} />
                  <Route path="landlords" element={<SuperuserDashboard />} />
                  <Route path="tenants" element={<SuperuserDashboard />} />
                  <Route path="guarantors" element={<SuperuserDashboard />} />
                  <Route path="investors" element={<SuperuserDashboard />} />
                  <Route path="insurers" element={<SuperuserDashboard />} />
                  <Route path="realtors" element={<SuperuserDashboard />} />

                  {/* Financeiro */}
                  <Route path="finance" element={<FinancialPage />} />
                  <Route path="finance/cash" element={<CashFlowPage />} />
                  <Route path="finance/banks" element={<BankAccountsPage />} />
                  <Route path="finance/payables" element={<AccountsPayablePage />} />
                  <Route path="finance/receivables" element={<AccountsReceivablePage />} />
                  <Route path="finance/suppliers" element={<SuppliersPage />} />
                  <Route path="finance/dre" element={<DREPage />} />

                  {/* Antecipações */}
                  <Route path="anticipations" element={<AnticipationsPage />} />

                  {/* Blockchain */}
                  <Route path="blockchain" element={<BlockchainPage />} />
                  <Route path="vbrz" element={<VBRzPage />} />
                  <Route path="vbrz-market" element={<VBRzMarketPage />} />

                  {/* Omnichannel */}
                  <Route path="channels" element={<ChannelsPage />} />
                  <Route path="crm" element={<CRMPage />} />
                  <Route path="ai-agents" element={<AIAgentsPage />} />

                  {/* Relatórios (placeholders) */}
                  <Route path="reports/bi" element={<SuperuserDashboard />} />
                  <Route path="reports/dre" element={<DREPage />} />
                  <Route path="reports/performance" element={<SuperuserDashboard />} />
                  <Route path="reports/statements" element={<SuperuserDashboard />} />

                  {/* Configurações */}
                  <Route path="settings" element={<GlobalSettingsPage />} />
                  <Route path="mediation" element={<SuperuserDashboard />} />
                  <Route path="web3-debug" element={<Web3DebugPage />} />
                  <Route path="permissions" element={<SuperuserDashboard />} />

                  {/* Sobre */}
                  <Route path="about" element={<SuperuserDashboard />} />
                  <Route path="changelog" element={<SuperuserDashboard />} />
                  <Route path="report-bug" element={<SuperuserDashboard />} />
                </Routes>
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* ============================================ */}
        {/* AGENCY - Mini-ERP para Imobiliárias */}
        {/* ============================================ */}
        <Route
          path="/agency/*"
          element={
            <ProtectedRoute allowedRoles={["agency", "superuser"]}>
              <MainLayout
                menuItems={agencyMenu}
                title="Imobiliária"
                subtitle="Gestão de Carteira"
              >
                <Routes>
                  <Route index element={<AgencyDashboard />} />
                  <Route path="properties" element={<PropertiesPage />} />
                  <Route path="realtors" element={<RealtorsPage />} />
                  <Route path="split-calculator" element={<SplitCalculatorPage />} />
                  <Route path="contracts" element={<AgencyDashboard />} />
                  <Route path="finances" element={<AgencyDashboard />} />
                </Routes>
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* ============================================ */}
        {/* LANDLORD - Proprietário */}
        {/* ============================================ */}
        <Route
          path="/landlord/*"
          element={
            <ProtectedRoute allowedRoles={["landlord", "superuser"]}>
              <MainLayout
                menuItems={landlordMenu}
                title="Proprietário"
                subtitle="Meus Imóveis"
              >
                <Routes>
                  <Route index element={<LandlordDashboard />} />
                  <Route path="anticipation" element={<LandlordDashboard />} />
                  <Route path="assets" element={<LandlordDashboard />} />
                  <Route path="contracts" element={<LandlordDashboard />} />
                </Routes>
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* ============================================ */}
        {/* TENANT - Inquilino */}
        {/* ============================================ */}
        <Route
          path="/tenant/*"
          element={
            <ProtectedRoute allowedRoles={["tenant", "superuser"]}>
              <MainLayout
                menuItems={tenantMenu}
                title="Inquilino"
                subtitle="Meu Aluguel"
              >
                <Routes>
                  <Route index element={<TenantDashboard />} />
                  <Route path="payments" element={<TenantDashboard />} />
                  <Route path="inspections" element={<TenantDashboard />} />
                  <Route path="cashback" element={<TenantDashboard />} />
                </Routes>
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* ============================================ */}
        {/* INVESTOR - Investidor P2P */}
        {/* ============================================ */}
        <Route
          path="/investor/*"
          element={
            <ProtectedRoute allowedRoles={["investor", "superuser"]}>
              <MainLayout
                menuItems={investorMenu}
                title="Investidor"
                subtitle="Mercado P2P"
              >
                <Routes>
                  <Route index element={<InvestorDashboard />} />
                  <Route path="marketplace" element={<InvestorDashboard />} />
                  <Route path="portfolio" element={<InvestorDashboard />} />
                  <Route path="otc" element={<InvestorDashboard />} />
                </Routes>
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* ============================================ */}
        {/* GUARANTOR - Garantidor */}
        {/* ============================================ */}
        <Route
          path="/guarantor/*"
          element={
            <ProtectedRoute allowedRoles={["guarantor", "superuser"]}>
              <MainLayout
                menuItems={guarantorMenu}
                title="Garantidor"
                subtitle="Gestão de Colaterais"
              >
                <Routes>
                  <Route index element={<GuarantorDashboard />} />
                  <Route path="collaterals" element={<GuarantorDashboard />} />
                  <Route path="yield" element={<GuarantorDashboard />} />
                </Routes>
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* ============================================ */}
        {/* INSURER - Seguradora */}
        {/* ============================================ */}
        <Route
          path="/insurer/*"
          element={
            <ProtectedRoute allowedRoles={["insurer", "superuser"]}>
              <MainLayout
                menuItems={insurerMenu}
                title="Seguradora"
                subtitle="Apólices & Sinistros"
              >
                <Routes>
                  <Route index element={<InsurerDashboard />} />
                  <Route path="policies" element={<InsurerDashboard />} />
                  <Route path="claims" element={<InsurerDashboard />} />
                </Routes>
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* ============================================ */}
        {/* FALLBACK - 404 */}
        {/* ============================================ */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Toast Notifications */}
      <Toaster position="top-right" richColors />
    </BrowserRouter>
  );
}
