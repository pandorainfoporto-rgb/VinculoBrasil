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
  Umbrella,
  // Additional icons for new menu structure
  ArrowUpRight,
  ArrowDownLeft,
  Image,
  Handshake,
  Link,
  Cloud,
  FileCode,
  Megaphone,
  Ticket,
  Plug,
  Palette,
  Globe,
  Database,
  Tag,
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

export const adminTabs: SidebarTab[] = [
  {
    id: "dashboards",
    icon: LayoutDashboard,
    label: "Dashboards",
    items: [
      { icon: LayoutDashboard, label: "Geral", path: "/admin" },
      { icon: Receipt, label: "Faturamento", path: "/admin/finance" },
      { icon: ArrowUpRight, label: "A Pagar", path: "/admin/finance/payables" },
      { icon: ArrowDownLeft, label: "A Receber", path: "/admin/finance/receivables" },
      { icon: FileText, label: "Contratos", path: "/admin/leases" },
      { icon: Shield, label: "Seguros", path: "/admin/insurance" },
      { icon: Building2, label: "Imóveis", path: "/admin/properties" },
      { icon: Users, label: "Inquilinos", path: "/admin/tenants" },
      { icon: TrendingUp, label: "Investimentos", path: "/admin/investments" },
      { icon: Coins, label: "VBRz", path: "/admin/vbrz" },
      { icon: Image, label: "NFTs", path: "/admin/nfts" },
    ]
  },
  {
    id: "cadastro",
    icon: Database,
    label: "Cadastro / Financeiro",
    items: [
      { icon: Wallet, label: "Caixa", path: "/admin/finance/cash" },
      { icon: ChartPie, label: "DRE", path: "/admin/finance/dre" },
      { icon: Tag, label: "Tipos de Despesa", path: "/admin/expense-types" },
    ]
  },
  {
    id: "gerenciamento",
    icon: Users,
    label: "Gerenciamento",
    items: [
      { icon: Building2, label: "Imóveis", path: "/admin/properties" },
      { icon: UserCheck, label: "Inquilinos", path: "/admin/tenants" },
      { icon: Home, label: "Proprietários", path: "/admin/landlords" },
      { icon: Shield, label: "Garantidores", path: "/admin/guarantors" },
      { icon: TrendingUp, label: "Investidores", path: "/admin/investors" },
    ]
  },
  {
    id: "imobiliaria",
    icon: Briefcase,
    label: "Imobiliária (B2B)",
    items: [
      { icon: Building2, label: "Imobiliárias Parceiras", path: "/admin/agencies" },
      { icon: Users, label: "Corretores", path: "/admin/realtors" },
      { icon: Globe, label: "Sites B2B", path: "/admin/b2b-sites" },
    ]
  },
  {
    id: "seguradoras",
    icon: Umbrella,
    label: "Seguradoras",
    items: [
      { icon: Shield, label: "Seguradoras", path: "/admin/insurers" },
      { icon: Users, label: "Associações", path: "/admin/associations" },
    ]
  },
  {
    id: "balcao",
    icon: Store,
    label: "Balcão de Negócios",
    items: [
      { icon: Handshake, label: "Investimentos P2P", path: "/admin/p2p" },
      { icon: ShoppingCart, label: "Vendas VBRz", path: "/admin/vbrz-market" },
    ]
  },
  {
    id: "crypto",
    icon: Cpu,
    label: "Crypto & Web3",
    items: [
      { icon: Link, label: "Blockchain", path: "/admin/blockchain" },
      { icon: Image, label: "NFTs", path: "/admin/nfts" },
      { icon: Wallet, label: "Carteira VBRz", path: "/admin/vbrz-wallet" },
    ]
  },
  {
    id: "cashback",
    icon: Gift,
    label: "Cashback",
    items: [
      { icon: Store, label: "Parceiros", path: "/admin/cashback-partners" },
      { icon: DollarSign, label: "Distribuição", path: "/admin/cashback-distribution" },
      { icon: Megaphone, label: "Campanhas", path: "/admin/campaigns" },
      { icon: Ticket, label: "Vouchers", path: "/admin/vouchers" },
    ]
  },
  {
    id: "config",
    icon: Settings,
    label: "Configurações",
    items: [
      {
        icon: Plug,
        label: "Integrações",
        isCollapsible: true,
        children: [
          { icon: Key, label: "API Keys", path: "/admin/settings/api-keys" },
          { icon: FileCode, label: "Smart Contracts", path: "/admin/settings/contracts" },
          { icon: Cloud, label: "Pinata IPFS", path: "/admin/settings/pinata" },
          { icon: Wallet, label: "Wallets", path: "/admin/settings/wallets" },
          { icon: MessageSquare, label: "Meta (WhatsApp)", path: "/admin/settings/meta" },
          { icon: Bot, label: "OpenAI", path: "/admin/settings/openai" },
        ]
      },
      { icon: Users, label: "Usuários do Sistema", path: "/admin/users" },
      { icon: Palette, label: "Meu Site", path: "/admin/whitelabel" },
    ]
  }
];

// Keep superuserTabs for backward compatibility
export const superuserTabs: SidebarTab[] = adminTabs;

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
