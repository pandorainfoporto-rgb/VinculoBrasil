import {
  LayoutDashboard,
  Settings,
  Users,
  BarChart3,
  Scale,
  Building2,
  Home,
  FileText,
  Wallet,
  TrendingUp,
  Eye,
  Gift,
  ShoppingCart,
  Briefcase,
  Shield,
  DollarSign,
  FileCheck,
  AlertTriangle,
  PieChart,
  Bug,
  Calculator,
  // New icons for tabbed menu
  Boxes,
  Key,
  UserCheck,
  Bot,
  MessageSquare,
  Banknote,
  CreditCard,
  Receipt,
  FileSpreadsheet,
  Factory,
  Coins,
  Cpu,
  Store,
  Info,
  ChartPie,
  type LucideIcon,
} from "lucide-react";
import type { MenuItem } from "../components/layouts/MainLayout";

// ============================================
// TIPOS PARA MENU TABULADO
// ============================================

export interface TabbedMenuItem {
  icon: LucideIcon;
  label: string;
  path?: string;
  children?: TabbedMenuItem[];
  isCollapsible?: boolean;
}

export interface SidebarTab {
  id: string;
  icon: LucideIcon;
  label: string;
  items: TabbedMenuItem[];
}

// ============================================
// SUPERUSER MENU - ESTRUTURA TABULADA
// ============================================

export const superuserTabs: SidebarTab[] = [
  {
    id: "principal",
    icon: Home,
    label: "Principal",
    items: [
      // Dashboards (collapsible)
      {
        icon: LayoutDashboard,
        label: "Dashboards",
        isCollapsible: true,
        children: [
          { icon: LayoutDashboard, label: "Visão Geral", path: "/admin" },
          { icon: BarChart3, label: "BI & Analytics", path: "/admin/bi" },
        ],
      },
      // Entidades
      { icon: Building2, label: "Imóveis", path: "/admin/properties" },
      { icon: Building2, label: "Imobiliárias", path: "/admin/agencies" },
      { icon: Home, label: "Proprietários", path: "/admin/landlords" },
      { icon: Key, label: "Inquilinos", path: "/admin/tenants" },
      { icon: Shield, label: "Garantidores", path: "/admin/guarantors" },
      { icon: TrendingUp, label: "Investidores", path: "/admin/investors" },
      { icon: FileCheck, label: "Seguradoras", path: "/admin/insurers" },
      { icon: Users, label: "Corretores", path: "/admin/realtors" },
      // Financeiro (collapsible)
      {
        icon: PieChart,
        label: "Financeiro",
        isCollapsible: true,
        children: [
          { icon: Banknote, label: "Caixa", path: "/admin/finance/cash" },
          { icon: CreditCard, label: "Contas Bancárias", path: "/admin/finance/banks" },
          { icon: Receipt, label: "A Pagar", path: "/admin/finance/payables" },
          { icon: FileSpreadsheet, label: "A Receber", path: "/admin/finance/receivables" },
          { icon: Factory, label: "Fornecedores", path: "/admin/finance/suppliers" },
          { icon: ChartPie, label: "Plano de Contas (DRE)", path: "/admin/finance/dre" },
        ],
      },
      // Antecipações & Blockchain
      { icon: Coins, label: "Antecipações", path: "/admin/anticipations" },
      { icon: Cpu, label: "Blockchain", path: "/admin/blockchain" },
      { icon: Boxes, label: "VBRz", path: "/admin/vbrz" },
      { icon: Store, label: "Mercado VBRz", path: "/admin/vbrz-market" },
      // Omnichannel (collapsible)
      {
        icon: MessageSquare,
        label: "Omnichannel",
        isCollapsible: true,
        children: [
          { icon: MessageSquare, label: "Canais", path: "/admin/channels" },
          { icon: Users, label: "CRM", path: "/admin/crm" },
          { icon: Bot, label: "IA Agents", path: "/admin/ai-agents" },
        ],
      },
    ],
  },
  {
    id: "relatorios",
    icon: BarChart3,
    label: "Relatórios",
    items: [
      { icon: BarChart3, label: "BI Geral", path: "/admin/reports/bi" },
      { icon: PieChart, label: "DRE Consolidado", path: "/admin/reports/dre" },
      { icon: TrendingUp, label: "Performance", path: "/admin/reports/performance" },
      { icon: FileSpreadsheet, label: "Extrato Geral", path: "/admin/reports/statements" },
    ],
  },
  {
    id: "config",
    icon: Settings,
    label: "Configurações",
    items: [
      { icon: Settings, label: "Splits & Taxas", path: "/admin/settings" },
      { icon: Scale, label: "Mediação", path: "/admin/mediation" },
      { icon: Bug, label: "Web3 Debug", path: "/admin/web3-debug" },
      { icon: UserCheck, label: "Permissões", path: "/admin/permissions" },
    ],
  },
  {
    id: "sobre",
    icon: Info,
    label: "Sobre",
    items: [
      { icon: Info, label: "Versão do Sistema", path: "/admin/about" },
      { icon: FileText, label: "Changelog", path: "/admin/changelog" },
      { icon: Bug, label: "Reportar Bug", path: "/admin/report-bug" },
    ],
  },
];

// ============================================
// MENUS SIMPLES (MANTIDOS PARA OUTROS MÓDULOS)
// ============================================

export const superuserMenu: MenuItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/admin" },
  { icon: Settings, label: "Configurações (Splits)", path: "/admin/settings" },
  { icon: PieChart, label: "Financeiro & DRE", path: "/admin/finance" },
  { icon: Users, label: "CRM", path: "/admin/crm" },
  { icon: BarChart3, label: "BI & Analytics", path: "/admin/bi" },
  { icon: Scale, label: "Mediação", path: "/admin/mediation" },
  { icon: Building2, label: "Imobiliárias", path: "/admin/agencies" },
  { icon: Bug, label: "Web3 Debug", path: "/admin/web3-debug" },
];

export const agencyMenu: MenuItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/agency" },
  { icon: Home, label: "Meus Imóveis", path: "/agency/properties" },
  { icon: Users, label: "Corretores", path: "/agency/realtors" },
  { icon: FileText, label: "Contratos", path: "/agency/contracts" },
  { icon: Calculator, label: "Calculadora Split", path: "/agency/split-calculator" },
  { icon: Wallet, label: "Financeiro", path: "/agency/finances" },
];

export const landlordMenu: MenuItem[] = [
  { icon: LayoutDashboard, label: "Visão Geral", path: "/landlord" },
  { icon: TrendingUp, label: "Antecipação", path: "/landlord/anticipation" },
  { icon: Briefcase, label: "Meus Ativos", path: "/landlord/assets" },
  { icon: FileText, label: "Contratos", path: "/landlord/contracts" },
];

export const tenantMenu: MenuItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/tenant" },
  { icon: Wallet, label: "Aluguel", path: "/tenant/payments" },
  { icon: Eye, label: "Vistorias", path: "/tenant/inspections" },
  { icon: Gift, label: "Cashback", path: "/tenant/cashback" },
];

export const investorMenu: MenuItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/investor" },
  { icon: ShoppingCart, label: "Oportunidades P2P", path: "/investor/marketplace" },
  { icon: Briefcase, label: "Minha Carteira", path: "/investor/portfolio" },
  { icon: TrendingUp, label: "OTC", path: "/investor/otc" },
];

export const guarantorMenu: MenuItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/guarantor" },
  { icon: Shield, label: "Colaterais", path: "/guarantor/collaterals" },
  { icon: DollarSign, label: "Yield", path: "/guarantor/yield" },
];

export const insurerMenu: MenuItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/insurer" },
  { icon: FileCheck, label: "Apólices", path: "/insurer/policies" },
  { icon: AlertTriangle, label: "Sinistros", path: "/insurer/claims" },
];
