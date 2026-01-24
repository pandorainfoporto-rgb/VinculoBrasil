/**
 * ERP Administrativo - Vinculo.io
 * Sistema completo de gestao imobiliaria com IA
 *
 * Modulos:
 * - Menu Principal: Dashboard, Contratos, Imoveis, Usuarios
 * - Relatorios: DRE, Fluxo de Caixa, DIMOB, Inadimplencia
 * - Configuracoes: Usuarios/Permissoes, Gateways, Seguradoras, Marketplace
 * - Tarefas: Atendimento IA, Disputas, Vistorias
 */

import { useState, useEffect } from 'react';
import { Link, useNavigate } from '@tanstack/react-router';
import { VinculoBrasilLogo } from '@/components/vinculo-brasil-logo';
import { VinculoOmni, DepartmentAdmin, OmnichannelConfig } from '@/components/omnichannel';
import { AdCampaignManager } from '@/components/engine';
import { FeatureFlagsManager } from '@/components/admin/feature-flags-manager';
import { NFTLoans } from '@/components/defi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Shield,
  TrendingUp,
  Users,
  FileText,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  DollarSign,
  Activity,
  AlertTriangle,
  Scale,
  Eye,
  Image,
  Gavel,
  Lock,
  UserCheck,
  Building2,
  ExternalLink,
  Hash,
  Loader2,
  ShieldAlert,
  Camera,
  Plug,
  CreditCard,
  Fingerprint,
  PenTool,
  RefreshCw,
  Zap,
  Database,
  Cloud,
  ClipboardList,
  Settings,
  BarChart3,
  PieChart,
  ArrowUpRight,
  Play,
  Pause,
  Workflow,
  Bell,
  Home,
  UserPlus,
  FileSignature,
  ClipboardCheck,
  AlertOctagon,
  CircleDollarSign,
  Percent,
  MapPin,
  Target,
  Filter,
  ChevronRight,
  Menu,
  X,
  LayoutDashboard,
  Search,
  Landmark,
  ShoppingBag,
  ShoppingCart,
  MessageSquare,
  Bot,
  Send,
  Upload,
  Headphones,
  Phone,
  Mail,
  Globe,
  Smartphone,
  Brain,
  BookOpen,
  Network,
  Wallet,
  Receipt,
  TrendingDown,
  ArrowDownRight,
  Calculator,
  FileSpreadsheet,
  Users2,
  ShieldCheck,
  Key,
  Layers,
  Plus,
  Trash2,
  Edit3,
  Pencil,
  Save,
  ToggleLeft,
  ToggleRight,
  MessageCircle,
  Instagram,
  QrCode,
  Banknote,
  Building,
  Briefcase,
  Package,
  Star,
  ThumbsUp,
  ThumbsDown,
  ArrowRight,
  Copy,
  Check,
  Bed,
  Bath,
  Square,
  Coins,
  Info,
  History,
  HelpCircle,
  Warehouse,
  MoreHorizontal,
  Megaphone,
  LogOut,
} from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
// WalletConnector removido - nao utiliza mais carteira
import { CRMDashboard } from '@/components/crm';
import { EngageDashboard } from '@/components/engage';
import { PartnersManagementSection } from '@/components/partners-management-section';
// Agency Module
import { AgencyModule } from '@/components/admin/agencies';
import { useWalletConnection } from '@/hooks/use-wallet-connection';
import {
  usePartners,
  useCreatePartner,
  useUpdatePartner,
  useDeletePartner,
  type Partner,
  type CreatePartnerInput,
} from '@/hooks/use-marketplace';
import { BlockchainTransactionFeed, TransactionCounterWidget } from '@/components/blockchain-transaction-feed';
import { cn } from '@/lib/utils';
import { useThemeClasses } from '@/hooks/use-theme';
import { ThemeToggle } from '@/components/theme-toggle';
import { useDashboardMetrics } from '@/hooks/use-dashboard-metrics';
import { useTickets } from '@/hooks/use-tickets';

// Componentes Financeiros
import { AlugueisReceberForm } from '@/components/financeiro/alugueis-receber-form';
import { ContasReceberForm } from '@/components/financeiro/contas-receber-form';
import { ContasPagarForm } from '@/components/financeiro/contas-pagar-form';
import { FornecedoresForm } from '@/components/financeiro/fornecedores-form';
import { ColaboradoresForm } from '@/components/financeiro/colaboradores-form';
import { TiposDespesaForm } from '@/components/financeiro/tipos-despesa-form';
import { DreReport } from '@/components/financeiro/dre-report';
import { DashboardsConsultivas } from '@/components/dashboards/dashboards-consultivas';
import { VBRzDashboard } from '@/components/dashboards/vbrz-dashboard';
import { CashbackAdminDashboard } from '@/components/admin/cashback';

// Componentes de Grupos e Permissoes
import { NewGroupDialog, EditGroupDialog } from '@/components/group-permission-dialogs';
import { BankAccountDialog } from '@/components/bank-account-dialogs';
import { GatewayDialog } from '@/components/gateway-dialogs';
import { InsurerDialog } from '@/components/insurer-dialogs';
import { MarketplaceDialog } from '@/components/marketplace-dialogs';
import { ServiceDialog, IntegrationDialog } from '@/components/services-integration-dialogs';
import { UserDialog, type AdminUser as AdminUserType } from '@/components/user-dialogs';
import { WhatsAppDashboard } from '@/components/whatsapp-dashboard';
import { LiquidityDashboard } from '@/components/liquidity-dashboard';
import { CryptoWalletConfig } from '@/components/crypto-wallet-config';
import { CommunicationHub } from '@/components/communication-hub';
import { SystemDocumentation } from '@/components/documentation';

// ============= TIPOS DO ERP =============

type ERPSection =
  // Menu Principal
  | 'dashboard'
  | 'dashboards_consultivas'
  | 'vbrz_dashboard'
  | 'financeiro'
  | 'contracts'
  | 'properties'
  | 'guarantors'
  | 'tenants'
  | 'landlords'
  | 'crm'
  | 'engage'
  | 'marketplace'
  | 'agencies'
  // Relatorios
  | 'reports_dre'
  | 'reports_cashflow'
  | 'reports_dimob'
  | 'reports_delinquency'
  | 'reports_blockchain'
  | 'reports_contracts'
  | 'reports_tenants'
  | 'reports_landlords'
  | 'reports_properties'
  | 'reports_guarantors'
  | 'reports_commissions'
  | 'reports_insurance'
  | 'reports_marketplace'
  | 'reports_crm'
  | 'reports_vbrz'
  | 'reports_b2b'
  // Configuracoes
  | 'config_users'
  | 'config_permissions'
  | 'config_gateways'
  | 'config_bank_accounts'
  | 'config_insurers'
  | 'config_marketplace'
  | 'config_services'
  | 'config_liquidity'
  | 'config_crypto_wallets'
  | 'config_omnichannel'
  // Engine (Monetizacao)
  | 'engine_ads'
  | 'engine_feature_flags'
  | 'engine_nft_loans'
  // Tarefas/Operacional
  | 'tasks_communication_hub'
  | 'tasks_disputes'
  | 'tasks_inspections'
  | 'tasks_kyc'
  | 'tasks_processes'
  // Documentacao
  | 'docs_about'
  | 'docs_changelog'
  | 'docs_wiki'
  | 'docs_faq'
  | 'docs_technical';

type MenuCategory = 'menu' | 'reports' | 'integrations' | 'config' | 'tasks' | 'docs';

interface MenuGroup {
  category: MenuCategory;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  items: MenuItem[];
}

interface MenuItem {
  id: ERPSection;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  externalLink?: string;
}

// Tipos Financeiros
interface BankAccount {
  id: string;
  bankName: string;
  bankCode: string;
  agency: string;
  accountNumber: string;
  accountType: 'checking' | 'savings';
  pixKey?: string;
  pixKeyType?: 'cpf' | 'cnpj' | 'email' | 'phone' | 'random';
  isPrimary: boolean;
  status: 'active' | 'inactive';
  balance: number;
}

interface PaymentGateway {
  id: string;
  provider: 'asaas' | 'stripe' | 'mercadopago' | 'pagarme';
  name: string;
  apiKey: string;
  webhookSecret: string;
  environment: 'sandbox' | 'production';
  status: 'connected' | 'disconnected' | 'error';
  supportedMethods: ('pix' | 'boleto' | 'credit_card' | 'debit_card')[];
  lastSync?: Date;
  transactionsToday: number;
  volumeToday: number;
}

// Tipos de Usuario e Permissoes
interface UserRole {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  userCount: number;
  isSystem: boolean;
}

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  status: 'active' | 'inactive' | 'pending';
  lastLogin?: Date;
  createdAt: Date;
  avatar?: string;
}

// Tipos de Seguradora e Marketplace
interface Insurer {
  id: string;
  name: string;
  cnpj: string;
  contactEmail: string;
  contactPhone: string;
  commissionRate: number;
  policyTypes: string[];
  activeContracts: number;
  totalPremium: number;
  status: 'active' | 'pending' | 'inactive';
  portalAccess: boolean;
}

interface ServiceProvider {
  id: string;
  name: string;
  category: 'reforma' | 'vistoria' | 'limpeza' | 'mudanca' | 'manutencao';
  cnpj: string;
  contactEmail: string;
  contactPhone: string;
  commissionRate: number;
  rating: number;
  completedJobs: number;
  status: 'active' | 'pending' | 'inactive';
}

// Tipos de Atendimento IA
interface AIAgent {
  id: string;
  name: string;
  department: 'financeiro' | 'suporte' | 'disputas' | 'comercial' | 'geral';
  tone: 'formal' | 'friendly' | 'professional';
  status: 'active' | 'paused' | 'training';
  conversationsToday: number;
  resolutionRate: number;
  avgResponseTime: number;
  knowledgeBaseSize: number;
}

interface Conversation {
  id: string;
  channel: 'whatsapp' | 'instagram' | 'webchat' | 'email';
  customerName: string;
  customerPhone?: string;
  subject: string;
  status: 'ai_handling' | 'human_needed' | 'resolved' | 'waiting';
  assignedAgent?: string;
  messages: ChatMessage[];
  startedAt: Date;
  department: string;
}

interface ChatMessage {
  id: string;
  sender: 'customer' | 'ai' | 'human';
  content: string;
  timestamp: Date;
}

interface KnowledgeBase {
  id: string;
  title: string;
  category: string;
  content: string;
  fileType?: 'pdf' | 'text' | 'faq';
  uploadedAt: Date;
  usageCount: number;
}

// Tipos DRE e Contabilidade
interface DREData {
  period: string;
  receitaBruta: number;                  // Total de alugueis recebidos
  repasseLocadores: number;              // (-) 85% repasse proprietarios
  repasseSeguradoras: number;            // (-) 5% repasse seguradoras
  repasseGarantidores: number;           // (-) 5% repasse garantidores
  taxaPlataforma: number;                // (+) 5% receita da plataforma (ENTRADA)
  comissaoSeguradorasRecebida: number;   // (+) XX% comissao recebida das seguradoras conforme cadastro
  marketplaceComissions: number;         // (+) Comissoes marketplace
  despesasOperacionais: number;          // (-) Custos operacionais
  lucroOperacional: number;              // = Resultado operacional
  impostos: number;                      // (-) Impostos
  lucroLiquido: number;                  // = Resultado liquido
}

interface ChartOfAccount {
  id: string;
  code: string;
  name: string;
  type: 'receita' | 'despesa' | 'ativo' | 'passivo';
  category: string;
  balance: number;
  isActive: boolean;
}

interface CashFlowEntry {
  id: string;
  date: Date;
  description: string;
  type: 'entrada' | 'saida';
  category: string;
  amount: number;
  balance: number;
  contractId?: string;
}

// Tipos de Disputa (expandido)
interface Dispute {
  id: string;
  contractId: string;
  propertyAddress: string;
  type: 'payment_failure' | 'inspection_damage' | 'contract_termination' | 'collateral_release';
  status: 'open' | 'pending_signatures' | 'resolved' | 'escalated';
  openedBy: 'tenant' | 'landlord' | 'insurer';
  openedByName: string;
  openedAt: Date;
  description: string;
  evidenceHashes: string[];
  signatures: { admin: boolean; insurer: boolean; party: boolean };
  claimAmount: number;
  entryPhotos: string[];
  exitPhotos: string[];
}

// Tipos de Contrato
interface Contract {
  id: string;
  nftTokenId: string;
  propertyId: string;
  propertyAddress: string;
  tenantId: string;
  tenantName: string;
  tenantCpf: string;
  landlordId: string;
  landlordName: string;
  guarantorId?: string;
  guarantorName?: string;
  insurerId: string;
  insurerName: string;
  rentAmount: number;
  startDate: Date;
  endDate: Date;
  status: 'active' | 'pending_signatures' | 'pending_deposit' | 'expired' | 'terminated';
  paymentStatus: 'current' | 'late' | 'defaulted';
  lastPaymentDate?: Date;
  nextPaymentDate: Date;
  blockchainHash: string;
  createdAt: Date;
}

// Tipos de Imovel
interface Property {
  id: string;
  nftTokenId?: string;
  address: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  propertyType: 'apartment' | 'house' | 'commercial' | 'land';
  bedrooms: number;
  bathrooms: number;
  area: number;
  parkingSpaces: number;
  rentAmount: number;
  condoFees: number;
  iptuAmount: number;
  ownerId: string;
  ownerName: string;
  status: 'available' | 'rented' | 'maintenance' | 'inactive';
  tokenizedValue?: number;
  lastInspectionDate?: Date;
  photos: string[];
  registrationNumber: string;
  createdAt: Date;
}

// Tipos de Locatario
interface Tenant {
  id: string;
  fullName: string;
  cpf: string;
  email: string;
  phone: string;
  occupation: string;
  monthlyIncome: number;
  employer?: string;
  creditScore: number;
  trustScore: number;
  kycStatus: 'pending' | 'approved' | 'rejected' | 'expired';
  kycVerifiedAt?: Date;
  activeContractsCount: number;
  totalRentPaid: number;
  paymentHistory: 'excellent' | 'good' | 'regular' | 'poor';
  walletAddress?: string;
  createdAt: Date;
  lastLogin?: Date;
}

// Tipos de Proprietario
interface Landlord {
  id: string;
  fullName: string;
  cpfCnpj: string;
  email: string;
  phone: string;
  personType: 'pf' | 'pj' | 'imobiliaria';
  companyName?: string;
  creciNumber?: string; // CRECI para imobiliarias
  commissionRate?: number; // Taxa de comissao para imobiliarias
  propertiesCount: number;
  activeContractsCount: number;
  totalMonthlyRevenue: number;
  totalReceivedAllTime: number;
  bankAccount: {
    bank: string;
    agency: string;
    account: string;
    pixKey?: string;
  };
  walletAddress?: string;
  kycStatus: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  lastLogin?: Date;
}

// Tipos de Garantidor
interface Guarantor {
  id: string;
  fullName: string;
  cpfCnpj: string;
  email: string;
  phone: string;
  collateralPropertyId: string;
  collateralPropertyAddress: string;
  collateralValue: number;
  tokenizedValue: number;
  ltv: number;
  activeContractsGuaranteed: number;
  monthlyCommission: number;
  totalEarnedAllTime: number;
  status: 'active' | 'pending_tokenization' | 'blocked' | 'inactive';
  walletAddress?: string;
  nftCertificateId?: string;
  fidelityLevel: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  yieldStackingEnabled: boolean;
  createdAt: Date;
  lastPaymentDate?: Date;
}

// ============= COMPONENTE PRINCIPAL =============

export function AdminDashboard() {
  const { isConnected } = useWalletConnection();
  const theme = useThemeClasses();
  const [currentSection, setCurrentSection] = useState<ERPSection>('dashboard');
  const [activeCategory, setActiveCategory] = useState<MenuCategory>('menu');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isProcessingMultiSig, setIsProcessingMultiSig] = useState(false);
  const [adminDecision, setAdminDecision] = useState('');
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [chatInput, setChatInput] = useState('');

  // Estados dos Dialogos de Grupos
  const [isNewGroupDialogOpen, setIsNewGroupDialogOpen] = useState(false);
  const [isEditGroupDialogOpen, setIsEditGroupDialogOpen] = useState(false);
  const [selectedGroupForEdit, setSelectedGroupForEdit] = useState<UserRole | null>(null);

  // Estados dos dialogs de configuração
  const [isBankAccountDialogOpen, setIsBankAccountDialogOpen] = useState(false);
  const [selectedBankAccount, setSelectedBankAccount] = useState<BankAccount | null>(null);

  const [isGatewayDialogOpen, setIsGatewayDialogOpen] = useState(false);
  const [selectedGateway, setSelectedGateway] = useState<PaymentGateway | null>(null);

  const [isInsurerDialogOpen, setIsInsurerDialogOpen] = useState(false);
  const [selectedInsurer, setSelectedInsurer] = useState<Insurer | null>(null);

  const [isMarketplaceDialogOpen, setIsMarketplaceDialogOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<ServiceProvider | null>(null);

  const [isServiceDialogOpen, setIsServiceDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(null);

  const [isIntegrationDialogOpen, setIsIntegrationDialogOpen] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<any>(null);

  // Estados do Dialog de Usuario
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);

  // Hook de navegação para logout
  const navigate = useNavigate();

  // Função de Logout - Limpa localStorage e redireciona para login
  const handleLogout = () => {
    // Limpa todo o localStorage
    localStorage.clear();
    // Limpa sessionStorage também por segurança
    sessionStorage.clear();
    // Redireciona para a página de login
    navigate({ to: '/auth/login' });
  };

  // ============= DADOS DO ERP =============

  // Metricas Principais
  // Busca metricas reais da API
  const { data: dashboardMetrics } = useDashboardMetrics();
  const { data: ticketsData } = useTickets({ status: 'OPEN', limit: 1 });

  // Metricas para badges do menu - usando dados reais da API
  const metrics = {
    tvl: dashboardMetrics?.tvl || 0,
    activeContracts: dashboardMetrics?.activeContracts || 0,
    monthlyRevenue: dashboardMetrics?.monthlyRevenue || 0,
    openDisputes: dashboardMetrics?.openDisputes || 0,
    pendingKYC: dashboardMetrics?.pendingKYC || 0,
    pendingInspections: dashboardMetrics?.pendingInspections || 0,
    aiConversations: ticketsData?.total || 0, // Tickets abertos = conversas pendentes
    revenueGrowth: dashboardMetrics?.revenueGrowth || 0,
  };

  // Contas Bancarias - Vazio para producao
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);

  // Gateways de Pagamento - Vazio para producao
  const [gateways, setGateways] = useState<PaymentGateway[]>([]);

  // Roles e Usuarios - Apenas roles do sistema
  const [userRoles, setUserRoles] = useState<UserRole[]>([
    { id: '1', name: 'Super Admin', description: 'Acesso total ao sistema', permissions: ['*'], userCount: 1, isSystem: true },
  ]);

  // Usuario admin preservado
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([
    { id: '1', name: 'Renato Admin', email: 'renato@vinculobrasil.com.br', role: 'Super Admin', department: 'Diretoria', status: 'active', lastLogin: new Date(), createdAt: new Date('2024-01-01') },
  ]);

  // Seguradoras - Vazio para producao
  const [insurers, setInsurers] = useState<Insurer[]>([]);

  // Marketplace - Fornecedores - Vazio para producao
  const [serviceProviders, setServiceProviders] = useState<ServiceProvider[]>([]);

  // Agentes de IA - Vazio para producao
  const [aiAgents] = useState<AIAgent[]>([]);

  // Conversas Ativas - Vazio para producao
  const [conversations] = useState<Conversation[]>([]);

  // Base de Conhecimento - Protocolo Vinculo.io
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeBase[]>([
    {
      id: '1',
      title: 'Protocolo Vinculo.io - Manual Completo',
      category: 'Institucional',
      content: `# Protocolo Vinculo.io - Base de Conhecimento Oficial

## 1. O que e o Vinculo.io?
O Vinculo.io nao e apenas uma imobiliaria, e um ecossistema de locacao inteligente baseado em Blockchain. Ele utiliza Contratos Inteligentes (Smart Contracts) para automatizar pagamentos, garantir vistorias imutaveis e remunerar todos os envolvidos de forma justa e transparente.

## 2. O Modelo Financeiro (Split 85/5/5/5)
Todas as transacoes de aluguel no sistema seguem uma divisao automatica e instantanea assim que o pagamento e confirmado:

- **85% Locador (Proprietario):** Valor liquido do aluguel.
- **5% Seguradora:** Pagamento mensal do seguro-fianca que protege o contrato.
- **5% Plataforma (Vinculo.io):** Taxa de servico e manutencao do ecossistema.
- **5% Garantidor (Fiador):** Comissao mensal paga ao garantidor por disponibilizar seu imovel como colateral digital.

## 3. Papeis no Ecossistema

### 3.1. O Locador
Recebe o valor do aluguel com liquidez imediata. A seguranca e tripla: Seguro-fianca + Imovel do Garantidor como colateral + Contrato NFT imutavel.

### 3.2. O Locatario
Aluga sem a necessidade de deposito caucao pesado ou burocracia bancaria. Sua pontuacao no sistema (Trust Score) gera descontos futuros.

### 3.3. O Garantidor (O Diferencial)
Diferente do fiador tradicional que so tem riscos, o Garantidor no Vinculo.io e um investidor. Ao empenhar um imovel de sua propriedade como garantia digital, ele recebe 5% do valor do aluguel todos os meses como recompensa pelo risco.

## 4. Processos Operacionais

### 4.1. Vistoria Digital
As fotos e videos de entrada e saida sao transformadas em um Hash (identidade digital) e gravadas na Blockchain. Isso impede alteracoes fraudulentas e serve como prova em caso de disputas.

### 4.2. Inadimplencia
Caso o locatario nao pague, o Smart Contract notifica a Seguradora imediatamente. O repasse ao locador e mantido pela seguradora, enquanto o sistema inicia a mediacao ou aciona o colateral do garantidor em casos extremos.

### 4.3. Mediacao de Disputas
O Administrador do Vinculo.io atua como arbitro. Ele compara as vistorias de entrada e saida. Se houver danos, o valor do conserto e retido da garantia e transferido ao locador.

## 5. Tecnologia e Seguranca
- **Blockchain:** Utilizamos a rede (Polygon/Base) para garantir que os contratos nao possam ser alterados.
- **NFTs:** Cada contrato de locacao e um NFT unico que contém todo o historico do imovel.
- **Drex:** O sistema esta preparado para integracao com o Real Digital (Drex) para garantir colateralizacao bancaria oficial.`,
      fileType: 'text',
      uploadedAt: new Date('2026-01-06'),
      usageCount: 1247
    },
    {
      id: '2',
      title: 'FAQ Rapido - Respostas para IA',
      category: 'FAQ',
      content: `# FAQ Rapido - Respostas Curtas para a IA

**"Preciso de fiador?"**
Sim, ou um Garantidor Remunerado da nossa plataforma.

**"Como recebo meu dinheiro?"**
Via PIX automatico, processado pelo nosso Smart Contract.

**"O que acontece se eu estragar algo no imovel?"**
A vistoria de saida detectara o dano e o valor sera descontado da garantia depositada no inicio ou cobrado do garantidor.

**"E seguro?"**
Sim, todas as transacoes sao auditaveis publicamente na Blockchain, mas protegemos seus dados sensiveis via LGPD.

**"Como funciona o split 85/5/5/5?"**
O aluguel e dividido automaticamente: 85% vai para o proprietario, 5% para a seguradora, 5% para a plataforma e 5% para o garantidor.

**"O que e Trust Score?"**
E sua pontuacao de confiabilidade no sistema. Quanto mais pagamentos em dia, maior seu score e maiores seus descontos futuros.

**"Posso ser um Garantidor?"**
Sim! Se voce possui um imovel quitado, pode cadastra-lo como colateral e receber 5% do aluguel de outros contratos mensalmente.

**"O que acontece se o locatario nao pagar?"**
A seguradora cobre o pagamento ao proprietario enquanto iniciamos o processo de cobranca ou acionamos a garantia.`,
      fileType: 'faq',
      uploadedAt: new Date('2026-01-06'),
      usageCount: 2156
    },
    {
      id: '3',
      title: 'Processo de Vistoria Digital',
      category: 'Operacional',
      content: `# Processo de Vistoria Digital

## Vistoria de Entrada
1. Agendamento pelo app ou plataforma
2. Vistoriador certificado realiza a inspecao
3. Fotos e videos em alta resolucao de cada comodo
4. Geracao de Hash SHA-256 de cada arquivo
5. Registro imutavel na Blockchain
6. Assinatura digital de todas as partes

## Vistoria de Saida
1. Mesmo processo da entrada
2. Comparacao automatica com vistoria de entrada
3. IA identifica danos ou divergencias
4. Laudo automatico gerado
5. Se houver danos, inicia processo de mediacao

## Garantias
- Nenhuma foto pode ser alterada apos registro
- Hash criptografico garante integridade
- Auditoria publica disponivel a qualquer momento`,
      fileType: 'text',
      uploadedAt: new Date('2024-03-10'),
      usageCount: 567
    },
    {
      id: '4',
      title: 'Script de Atendimento Humano - Completo',
      category: 'Atendimento',
      content: `# Script de Atendimento Humano: Vinculo.io

## 1. Diretrizes de Tom de Voz
- **Profissional e Empatico:** Reconhecemos que estamos a lidar com o patrimonio das pessoas.
- **Autoridade Tecnica:** Falamos com propriedade sobre Blockchain, Contratos e a Lei do Inquilinato.
- **Transparencia Total:** Se houver um erro, assumimos e mostramos a solucao via ledger (registro).

## 2. Fluxo de Boas-Vindas (Apos Handoff da IA)
"Ola, [Nome do Usuario]! Eu sou o [Seu Nome], analista do departamento de [Financeiro/Mediacao]. Ja revi o historico da sua conversa com a nossa IA e compreendo que o motivo do seu contacto e [Motivo]. Vou ajuda-lo a resolver isso agora mesmo."

## 3. Scripts por Cenario Especifico

### CENARIO A: Disputa de Vistoria (Saida do Imovel)
**Situacao:** O Locatario nao concorda com a retencao de parte da garantia para reparos.

**Agente:** "Compreendo a sua posicao. Para garantir a total imparcialidade, o Vinculo.io utiliza o protocolo de Vistoria Imutavel. Estou a abrir aqui as fotos do check-in (registradas no IPFS no dia [Data]) e as fotos do check-out."

**Acao:** "Note que na foto [ID], o item [Objeto] nao apresentava a avaria [X]. Como o nosso contrato NFT preve a entrega no estado original, o valor de R$ [Valor] sera retido para o reparo, conforme orcamentado. Tem alguma evidencia adicional que gostaria que eu analisasse?"

### CENARIO B: Duvida do Garantidor (O Investidor)
**Situacao:** O Garantidor quer saber por que e seguro deixar o seu imovel como colateral.

**Agente:** "E uma excelente pergunta. O seu imovel funciona como um colateral digital de ultima instancia. Antes de qualquer acionamento do seu bem, o sistema ativa o Seguro Fianca da [Nome da Seguradora]."

**Venda:** "Alem disso, lembre-se que por este risco controlado, o senhor esta a receber 5% do valor do aluguel todos os meses diretamente na sua carteira. E um rendimento passivo sobre um patrimonio que estaria parado."

### CENARIO C: Problemas com o Split de Pagamento
**Situacao:** O Locador afirma que o valor nao caiu na conta.

**Agente:** "Vou verificar o status da transacao na rede [Polygon/Base]. [Pausa para consulta]."

**Acao:** "Confirmado aqui: a transacao de split foi executada com o hash 0x.... O valor de 85% ja foi enviado para a sua carteira digital. Recomendo que verifique o seu extrato no Gateway de Pagamento [Asaas/Stripe], pois o repasse bancario pode levar ate [X] minutos conforme o processamento do banco."

## 4. Fecho de Atendimento
"Fico feliz em ter ajudado. O registro deste atendimento foi anexado ao metadado do seu contrato para consulta futura. O Vinculo.io agradece a sua confianca. Posso ajudar em algo mais?"

## 5. Guia de Gestao de Crise (Objecoes Comuns)

| Objecao | Resposta do Agente |
|---------|-------------------|
| "Nao confio em Blockchain." | "Entendo perfeitamente. A Blockchain e apenas a tecnologia que usamos para que voce nao precise confiar em nos, mas sim na matematica. O seu contrato e publico e auditavel a qualquer momento." |
| "A taxa de 5% da plataforma e alta." | "Essa taxa cobre toda a infraestrutura de IA, a seguranca dos smart contracts e a mediacao juridica gratuita que estamos a realizar agora. E um custo de eficiencia." |
| "O inquilino estragou tudo e o seguro nao cobre." | "Nesse caso, o Vinculo.io aciona imediatamente o colateral do Garantidor. O seu rendimento esta protegido por multiplas camadas de seguranca." |`,
      fileType: 'text',
      uploadedAt: new Date('2026-01-06'),
      usageCount: 156
    },
  ]);

  // System Prompts dos Agentes
  const [systemPrompts] = useState({
    default: `Voce e o assistente virtual do Vinculo.io. Sua missao e ajudar usuarios a entenderem o modelo 85/5/5/5. Seja profissional, seguro e enfatize sempre a transparencia da Blockchain. Use a base de conhecimento fornecida para responder duvidas sobre garantias, pagamentos e vistorias.`,
    financeiro: `Voce e o Vini Financeiro, especialista em pagamentos do Vinculo.io. Ajude com duvidas sobre boletos, PIX, faturas e o split 85/5/5/5. Seja preciso com valores e datas. Se o cliente tiver disputa financeira complexa, transfira para humano.`,
    suporte: `Voce e o Vini Suporte, assistente geral do Vinculo.io. Ajude com duvidas sobre contratos, vistorias e funcionamento da plataforma. Seja amigavel e educativo sobre a tecnologia Blockchain.`,
    disputas: `Voce e o Vini Disputas, mediador oficial do Vinculo.io. Lide com reclamacoes sobre danos, pagamentos em atraso e conflitos entre partes. Seja formal e imparcial. Sempre transfira para humano se a disputa envolver valores acima de R$5.000.`,
    comercial: `Voce e o Vini Comercial, especialista em novos negocios do Vinculo.io. Ajude interessados a entender como alugar, como se tornar garantidor e os beneficios do sistema. Seja entusiasmado mas profissional.`,
  });

  // Regras de Handoff (IA para Humano)
  const [handoffRules] = useState([
    { id: '1', trigger: 'Cliente solicita falar com humano', action: 'transfer_immediate', department: 'suporte', priority: 'high' },
    { id: '2', trigger: 'Disputa de vistoria com fotos', action: 'transfer_immediate', department: 'disputas', priority: 'high' },
    { id: '3', trigger: 'Valor da disputa > R$ 5.000', action: 'transfer_immediate', department: 'disputas', priority: 'critical' },
    { id: '4', trigger: 'Mencao a processo judicial ou advogado', action: 'transfer_immediate', department: 'juridico', priority: 'critical' },
    { id: '5', trigger: 'Cliente irritado apos 3 mensagens', action: 'offer_transfer', department: 'suporte', priority: 'medium' },
    { id: '6', trigger: 'Duvida sobre contrato especifico', action: 'transfer_if_needed', department: 'comercial', priority: 'low' },
    { id: '7', trigger: 'Problema tecnico com app/site', action: 'transfer_immediate', department: 'suporte_tecnico', priority: 'medium' },
    { id: '8', trigger: 'Solicitacao de reembolso', action: 'transfer_immediate', department: 'financeiro', priority: 'high' },
  ]);

  // Estado para edicao de conhecimento
  const [editingKnowledge, setEditingKnowledge] = useState<KnowledgeBase | null>(null);
  const [newKnowledgeContent, setNewKnowledgeContent] = useState('');

  // Estados para modais de detalhes dos modulos
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(null);
  const [selectedLandlord, setSelectedLandlord] = useState<Landlord | null>(null);
  const [selectedGuarantor, setSelectedGuarantor] = useState<Guarantor | null>(null);
  const [modalMode, setModalMode] = useState<'view' | 'edit'>('view');

  // Estados para modais de CADASTRO (criar novos registros)
  const [newPropertyOpen, setNewPropertyOpen] = useState(false);
  const [newTenantOpen, setNewTenantOpen] = useState(false);
  const [newLandlordOpen, setNewLandlordOpen] = useState(false);
  const [newGuarantorOpen, setNewGuarantorOpen] = useState(false);
  const [newContractOpen, setNewContractOpen] = useState(false);

  // Estados para formularios de novo cadastro
  const [newPropertyForm, setNewPropertyForm] = useState({
    address: '',
    neighborhood: '',
    city: '',
    state: 'SP',
    zipCode: '',
    propertyType: 'apartment' as Property['propertyType'],
    bedrooms: 2,
    bathrooms: 1,
    area: 50,
    parkingSpaces: 1,
    rentAmount: 0,
    condoFees: 0,
    iptuAmount: 0,
    ownerId: '',
    registrationNumber: '',
  });

  const [newTenantForm, setNewTenantForm] = useState({
    fullName: '',
    cpf: '',
    email: '',
    phone: '',
    occupation: '',
    monthlyIncome: 0,
    employer: '',
  });

  const [newLandlordForm, setNewLandlordForm] = useState({
    fullName: '',
    cpfCnpj: '',
    email: '',
    phone: '',
    personType: 'pf' as Landlord['personType'],
    companyName: '',
    creciNumber: '',
    commissionRate: 0,
    bankName: '',
    agency: '',
    account: '',
    pixKey: '',
  });

  const [newGuarantorForm, setNewGuarantorForm] = useState({
    fullName: '',
    cpfCnpj: '',
    email: '',
    phone: '',
    collateralPropertyAddress: '',
    collateralValue: 0,
  });

  const [newContractForm, setNewContractForm] = useState({
    propertyId: '',
    tenantId: '',
    landlordId: '',
    guarantorId: '',
    insurerId: '',
    rentAmount: 0,
    startDate: '',
    endDate: '',
  });

  // DRE - Novo modelo contabil
  // Split: 85% Locadores | 5% Seguradoras | 5% Garantidores | 5% Plataforma (nos)
  // Receitas da Plataforma: Taxa 5% (entrada) + Comissao das Seguradoras (XX% conforme cadastro)
  const [dreData] = useState<DREData[]>([]);

  // Fluxo de Caixa
  const [cashFlow] = useState<CashFlowEntry[]>([]);

  // Disputas
  const [disputes] = useState<Dispute[]>([]);

  // ============= DADOS DOS MODULOS PRINCIPAIS =============

  // Contratos
  const [contracts] = useState<Contract[]>([]);

  // Imoveis
  const [properties] = useState<Property[]>([]);

  // Locatarios
  const [tenants] = useState<Tenant[]>([]);

  // Proprietarios
  const [landlords] = useState<Landlord[]>([]);

  // Garantidores
  const [guarantors] = useState<Guarantor[]>([]);

  // ============= MENU DO ERP =============

  const menuGroups: MenuGroup[] = [
    {
      category: 'menu',
      title: 'Menu Principal',
      icon: LayoutDashboard,
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'dashboards_consultivas', label: 'Dashboards Consultivas', icon: PieChart },
        { id: 'vbrz_dashboard', label: 'VBRz Token', icon: Coins },
        { id: 'financeiro', label: 'Financeiro', icon: Wallet },
        { id: 'contracts', label: 'Contratos', icon: FileText, badge: metrics.activeContracts },
        { id: 'properties', label: 'Imoveis', icon: Building2 },
        { id: 'tenants', label: 'Locatarios', icon: Users },
        { id: 'landlords', label: 'Proprietarios', icon: Building },
        { id: 'guarantors', label: 'Garantidores', icon: Shield },
        { id: 'crm', label: 'CRM', icon: Target },
        { id: 'engage', label: 'Engage', icon: Zap },
        { id: 'marketplace', label: 'Marketplace', icon: ShoppingCart },
        { id: 'agencies', label: 'Imobiliarias', icon: Building2 },
      ],
    },
    {
      category: 'reports',
      title: 'Relatorios & BI',
      icon: BarChart3,
      items: [
        { id: 'reports_dre', label: 'DRE Contabil', icon: Calculator },
        { id: 'reports_cashflow', label: 'Fluxo de Caixa', icon: TrendingUp },
        { id: 'reports_dimob', label: 'DIMOB / Fiscal', icon: FileSpreadsheet },
        { id: 'reports_delinquency', label: 'Inadimplencia', icon: AlertTriangle },
        { id: 'reports_blockchain', label: 'Auditoria Blockchain', icon: Database },
        { id: 'reports_contracts', label: 'Contratos & Locacoes', icon: FileSignature },
        { id: 'reports_tenants', label: 'Base de Inquilinos', icon: Users },
        { id: 'reports_landlords', label: 'Base de Proprietarios', icon: Building2 },
        { id: 'reports_properties', label: 'Carteira de Imoveis', icon: Home },
        { id: 'reports_guarantors', label: 'Garantidores', icon: Shield },
        { id: 'reports_commissions', label: 'Comissoes & Repasses', icon: CircleDollarSign },
        { id: 'reports_insurance', label: 'Seguros & Apolices', icon: ShieldCheck },
        { id: 'reports_marketplace', label: 'Marketplace & Parceiros', icon: ShoppingCart },
        { id: 'reports_crm', label: 'CRM & Leads', icon: Target },
        { id: 'reports_vbrz', label: 'Token VBRz', icon: Coins },
        { id: 'reports_b2b', label: 'Rede B2B - Imobiliarias', icon: Building2 },
      ],
    },
    {
      category: 'integrations',
      title: 'Integracoes',
      icon: Plug,
      items: [
        { id: 'config_bank_accounts', label: 'Contas Bancarias', icon: Landmark },
        { id: 'config_gateways', label: 'Gateways de Pagamento', icon: CreditCard },
        { id: 'config_crypto_wallets', label: 'Blockchain & Split', icon: Wallet },
        { id: 'config_services', label: 'Servicos Externos', icon: Package },
        { id: 'config_liquidity', label: 'Liquidez', icon: DollarSign },
        { id: 'config_omnichannel', label: 'Canais de Comunicacao', icon: Headphones },
      ],
    },
    {
      category: 'config',
      title: 'Configuracoes',
      icon: Settings,
      items: [
        { id: 'config_users', label: 'Usuarios', icon: Users2 },
        { id: 'config_permissions', label: 'Permissoes', icon: Key },
        { id: 'config_insurers', label: 'Seguradoras', icon: ShieldCheck },
        { id: 'config_marketplace', label: 'Parceiros Comerciais', icon: ShoppingBag },
        { id: 'engine_ads', label: 'Engine de Anuncios', icon: Megaphone },
        { id: 'engine_feature_flags', label: 'Feature Flags', icon: Settings },
        { id: 'engine_nft_loans', label: 'Emprestimos NFT', icon: Coins },
      ],
    },
    {
      category: 'tasks',
      title: 'Operacional & IA',
      icon: Workflow,
      items: [
        { id: 'tasks_communication_hub', label: 'Central de Comunicação', icon: MessageCircle, badge: metrics.aiConversations },
        { id: 'tasks_disputes', label: 'Disputas', icon: Gavel, badge: metrics.openDisputes },
        { id: 'tasks_inspections', label: 'Vistorias', icon: ClipboardCheck, badge: metrics.pendingInspections },
        { id: 'tasks_kyc', label: 'KYC Pendentes', icon: Fingerprint, badge: metrics.pendingKYC },
        { id: 'tasks_processes', label: 'Processos', icon: Workflow },
      ],
    },
    {
      category: 'docs',
      title: 'Documentacao',
      icon: BookOpen,
      items: [
        { id: 'docs_about', label: 'Sobre o Sistema', icon: Info },
        { id: 'docs_changelog', label: 'Changelog', icon: History },
        { id: 'docs_wiki', label: 'Wiki', icon: BookOpen },
        { id: 'docs_faq', label: 'FAQ', icon: HelpCircle },
        { id: 'docs_technical', label: 'Doc. Tecnica', icon: FileText },
      ],
    },
  ];

  const currentGroup = menuGroups.find(g => g.category === activeCategory);

  // ============= HANDLERS =============

  const handleTestGateway = async (gatewayId: string): Promise<boolean> => {
    alert('Testando conexao com gateway...');
    await new Promise(r => setTimeout(r, 1500));
    alert('Conexao estabelecida com sucesso!');
    return true;
  };

  const handleSendMessage = () => {
    if (!chatInput.trim() || !selectedConversation) return;
    setChatInput('');
    alert('Mensagem enviada!');
  };

  const handleMultiSigAction = async (dispute: Dispute, action: 'approve' | 'reject') => {
    if (!isConnected) {
      alert('Conecte sua carteira para assinar');
      return;
    }
    setIsProcessingMultiSig(true);
    await new Promise(r => setTimeout(r, 2000));
    setIsProcessingMultiSig(false);
    alert(`Disputa ${dispute.id} ${action === 'approve' ? 'resolvida' : 'escalada'}!`);
    setAdminDecision('');
  };

  const exportDIMOB = () => {
    // Gerar arquivo DIMOB em formato texto conforme especificacao da Receita Federal
    const year = new Date().getFullYear();
    const dimobContent = `DIMOB - Declaracao de Informacoes sobre Atividades Imobiliarias
Ano-Calendario: ${year}
CNPJ: 00.000.000/0001-00
Razao Social: Vinculo Brasil Tecnologia LTDA

RESUMO DOS CONTRATOS:
Total de Contratos: ${contracts.length}
Valor Total de Alugueis: ${formatCurrency(contracts.reduce((sum, c) => sum + c.rentAmount, 0))}

DETALHAMENTO:
${contracts.map((c, i) => `${i + 1}. Contrato: ${c.id}
   - Locatario: ${c.tenantName} (CPF: ***.***.***-**)
   - Imovel: ${c.propertyAddress}
   - Valor Mensal: ${formatCurrency(c.rentAmount)}
   - Periodo: ${c.startDate} a ${c.endDate}
`).join('\n')}

Arquivo gerado em: ${new Date().toLocaleString('pt-BR')}
`;
    const blob = new Blob([dimobContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `DIMOB_${year}_vinculo.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Funcoes de exportacao genericas
  const exportToCSV = (data: Record<string, unknown>[], filename: string, headers: string[]) => {
    const csvRows = [headers.join(';')];
    data.forEach(row => {
      const values = headers.map(h => {
        const val = row[h.toLowerCase().replace(/ /g, '_')] ?? row[h] ?? '';
        return `"${String(val).replace(/"/g, '""')}"`;
      });
      csvRows.push(values.join(';'));
    });
    const csvContent = '\uFEFF' + csvRows.join('\n'); // BOM for Excel UTF-8
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportToPDF = (title: string, content: string) => {
    // Gera um HTML para impressao como PDF
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; }
            h1 { color: #1e40af; border-bottom: 2px solid #1e40af; padding-bottom: 10px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #1e40af; color: white; }
            tr:nth-child(even) { background-color: #f9f9f9; }
            .header { display: flex; justify-content: space-between; margin-bottom: 20px; }
            .logo { font-size: 24px; font-weight: bold; color: #1e40af; }
            .date { color: #666; }
            @media print { button { display: none; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">Vinculo Brasil</div>
            <div class="date">Gerado em: ${new Date().toLocaleString('pt-BR')}</div>
          </div>
          <h1>${title}</h1>
          ${content}
          <script>window.print();</script>
        </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  // Exportar Contratos
  const exportContractsExcel = () => {
    const data = contracts.map(c => ({
      id: c.id,
      inquilino: c.tenantName,
      imovel: c.propertyAddress,
      valor: c.rentAmount,
      status: c.status,
      inicio: c.startDate,
      fim: c.endDate,
    }));
    exportToCSV(data, 'contratos_vinculo', ['ID', 'Inquilino', 'Imovel', 'Valor', 'Status', 'Inicio', 'Fim']);
  };

  const exportContractsPDF = () => {
    const tableRows = contracts.map(c => `
      <tr>
        <td>${c.id}</td>
        <td>${c.tenantName}</td>
        <td>${c.propertyAddress}</td>
        <td>${formatCurrency(c.rentAmount)}</td>
        <td>${c.status}</td>
      </tr>
    `).join('');
    exportToPDF('Relatorio de Contratos', `
      <p>Total de contratos: ${contracts.length}</p>
      <p>Valor total em carteira: ${formatCurrency(contracts.reduce((sum, c) => sum + c.rentAmount, 0))}</p>
      <table>
        <thead><tr><th>ID</th><th>Inquilino</th><th>Imovel</th><th>Valor</th><th>Status</th></tr></thead>
        <tbody>${tableRows}</tbody>
      </table>
    `);
  };

  // Exportar Inquilinos
  const exportTenantsExcel = () => {
    const tenantData = [
      { nome: 'Maria Santos', email: 'maria@email.com', telefone: '11 99999-1111', imovel: 'Apt 101 - Ed. Aurora', aluguel: 2500, status: 'adimplente' },
      { nome: 'Joao Oliveira', email: 'joao@email.com', telefone: '11 99999-2222', imovel: 'Casa 45 - Jd. Primavera', aluguel: 3200, status: 'adimplente' },
      { nome: 'Ana Costa', email: 'ana@email.com', telefone: '11 99999-3333', imovel: 'Sala 302 - Centro Emp.', aluguel: 1800, status: 'inadimplente' },
      { nome: 'Pedro Lima', email: 'pedro@email.com', telefone: '11 99999-4444', imovel: 'Apt 502 - Ed. Central', aluguel: 2800, status: 'adimplente' },
      { nome: 'Carla Souza', email: 'carla@email.com', telefone: '11 99999-5555', imovel: 'Loja 12 - Shopping Bela', aluguel: 5500, status: 'adimplente' },
    ];
    exportToCSV(tenantData, 'inquilinos_vinculo', ['Nome', 'Email', 'Telefone', 'Imovel', 'Aluguel', 'Status']);
  };

  const exportTenantsPDF = () => {
    const tenantData = [
      { nome: 'Maria Santos', email: 'maria@email.com', imovel: 'Apt 101 - Ed. Aurora', aluguel: 2500, status: 'adimplente' },
      { nome: 'Joao Oliveira', email: 'joao@email.com', imovel: 'Casa 45 - Jd. Primavera', aluguel: 3200, status: 'adimplente' },
      { nome: 'Ana Costa', email: 'ana@email.com', imovel: 'Sala 302 - Centro Emp.', aluguel: 1800, status: 'inadimplente' },
      { nome: 'Pedro Lima', email: 'pedro@email.com', imovel: 'Apt 502 - Ed. Central', aluguel: 2800, status: 'adimplente' },
      { nome: 'Carla Souza', email: 'carla@email.com', imovel: 'Loja 12 - Shopping Bela', aluguel: 5500, status: 'adimplente' },
    ];
    const tableRows = tenantData.map(t => `
      <tr>
        <td>${t.nome}</td>
        <td>${t.email}</td>
        <td>${t.imovel}</td>
        <td>${formatCurrency(t.aluguel)}</td>
        <td>${t.status}</td>
      </tr>
    `).join('');
    exportToPDF('Relatorio de Inquilinos', `
      <p>Total de inquilinos: ${tenantData.length}</p>
      <table>
        <thead><tr><th>Nome</th><th>Email</th><th>Imovel</th><th>Aluguel</th><th>Status</th></tr></thead>
        <tbody>${tableRows}</tbody>
      </table>
    `);
  };

  // Exportar Proprietarios
  const exportLandlordsExcel = () => {
    const landlordData = [
      { nome: 'Carlos Mendes', email: 'carlos@email.com', imoveis: 5, receita: 12500, pendente: 0 },
      { nome: 'Fernanda Lima', email: 'fernanda@email.com', imoveis: 3, receita: 7800, pendente: 2600 },
      { nome: 'Roberto Santos', email: 'roberto@email.com', imoveis: 8, receita: 24000, pendente: 0 },
      { nome: 'Lucia Oliveira', email: 'lucia@email.com', imoveis: 2, receita: 4500, pendente: 0 },
    ];
    exportToCSV(landlordData, 'proprietarios_vinculo', ['Nome', 'Email', 'Imoveis', 'Receita', 'Pendente']);
  };

  const exportLandlordsPDF = () => {
    const landlordData = [
      { nome: 'Carlos Mendes', email: 'carlos@email.com', imoveis: 5, receita: 12500, pendente: 0 },
      { nome: 'Fernanda Lima', email: 'fernanda@email.com', imoveis: 3, receita: 7800, pendente: 2600 },
      { nome: 'Roberto Santos', email: 'roberto@email.com', imoveis: 8, receita: 24000, pendente: 0 },
      { nome: 'Lucia Oliveira', email: 'lucia@email.com', imoveis: 2, receita: 4500, pendente: 0 },
    ];
    const tableRows = landlordData.map(l => `
      <tr>
        <td>${l.nome}</td>
        <td>${l.email}</td>
        <td>${l.imoveis}</td>
        <td>${formatCurrency(l.receita)}</td>
        <td>${l.pendente > 0 ? formatCurrency(l.pendente) : 'Em dia'}</td>
      </tr>
    `).join('');
    exportToPDF('Relatorio de Proprietarios', `
      <p>Total de proprietarios: ${landlordData.length}</p>
      <table>
        <thead><tr><th>Nome</th><th>Email</th><th>Imoveis</th><th>Receita Mensal</th><th>Pendente</th></tr></thead>
        <tbody>${tableRows}</tbody>
      </table>
    `);
  };

  // Ver detalhes do contrato
  const [selectedContractDetails, setSelectedContractDetails] = useState<Contract | null>(null);
  const viewContractDetails = (contract: Contract) => {
    setSelectedContractDetails(contract);
  };

  // ============= HELPERS =============

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const getSectionTitle = (section: ERPSection): string => {
    const titles: Record<ERPSection, string> = {
      dashboard: 'Dashboard',
      dashboards_consultivas: 'Dashboards Consultivas',
      vbrz_dashboard: 'VBRz Token Dashboard',
      financeiro: 'Modulo Financeiro',
      contracts: 'Contratos Ativos',
      properties: 'Gestao de Imoveis',
      guarantors: 'Garantidores',
      tenants: 'Locatarios',
      landlords: 'Proprietarios',
      crm: 'CRM - Gestao de Leads',
      engage: 'Vinculo Engage - Automacao de Marketing',
      marketplace: 'Gestao do Marketplace',
      agencies: 'Gestao de Imobiliarias',
      reports_dre: 'DRE - Demonstrativo de Resultados',
      reports_cashflow: 'Fluxo de Caixa',
      reports_dimob: 'DIMOB / Receita Federal',
      reports_delinquency: 'Relatorio de Inadimplencia',
      reports_blockchain: 'Auditoria Blockchain',
      reports_contracts: 'Relatorio de Contratos & Locacoes',
      reports_tenants: 'Relatorio Base de Inquilinos',
      reports_landlords: 'Relatorio Base de Proprietarios',
      reports_properties: 'Relatorio Carteira de Imoveis',
      reports_guarantors: 'Relatorio de Garantidores',
      reports_commissions: 'Relatorio de Comissoes & Repasses',
      reports_insurance: 'Relatorio de Seguros & Apolices',
      reports_marketplace: 'Relatorio Marketplace & Parceiros',
      reports_crm: 'Relatorio CRM & Leads',
      reports_vbrz: 'Relatorio Token VBRz',
      reports_b2b: 'Relatorio Rede B2B - Imobiliarias',
      config_users: 'Gestao de Usuarios',
      config_permissions: 'Grupos e Permissoes',
      config_bank_accounts: 'Contas Bancarias',
      config_gateways: 'Gateways de Pagamento',
      config_insurers: 'Seguradoras Parceiras',
      config_marketplace: 'Parceiros Comerciais',
      config_services: 'Servicos da Plataforma',
      config_liquidity: 'Dashboard de Liquidez',
      config_crypto_wallets: 'Blockchain & Split Asaas',
      config_omnichannel: 'Canais de Comunicacao',
      engine_ads: 'Engine de Anuncios',
      engine_feature_flags: 'Feature Flags',
      engine_nft_loans: 'Emprestimos NFT',
      tasks_communication_hub: 'Central de Comunicação',
      tasks_disputes: 'Mediacao de Disputas',
      tasks_inspections: 'Vistorias Pendentes',
      tasks_kyc: 'KYC Pendentes',
      tasks_processes: 'Processos Automatizados',
      docs_about: 'Sobre o Sistema',
      docs_changelog: 'Changelog',
      docs_wiki: 'Wiki',
      docs_faq: 'Perguntas Frequentes',
      docs_technical: 'Documentacao Tecnica',
    };
    return titles[section];
  };

  const getChannelIcon = (channel: Conversation['channel']) => {
    const icons = { whatsapp: MessageCircle, instagram: Instagram, webchat: Globe, email: Mail };
    return icons[channel];
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-green-500',
      connected: 'bg-green-500',
      pending: 'bg-amber-500',
      inactive: 'bg-gray-400',
      disconnected: 'bg-gray-400',
      error: 'bg-red-500',
      paused: 'bg-amber-500',
      training: 'bg-blue-500',
    };
    return colors[status] || 'bg-gray-400';
  };

  // ============= RENDER SECTIONS =============

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Alertas */}
      {metrics.openDisputes > 0 && (
        <Alert className="border-amber-500 bg-amber-50">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-700">Atencao Necessaria</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span><strong>{metrics.openDisputes} disputas</strong> e <strong>{metrics.pendingKYC} KYCs</strong> aguardando analise.</span>
            <Button size="sm" variant="outline" onClick={() => { setActiveCategory('tasks'); setCurrentSection('tasks_disputes'); }}>
              Ver Tarefas <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Metricas Principais - Cards clicaveis */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card
          className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02]"
          onClick={() => { setActiveCategory('reports'); setCurrentSection('reports_dre'); }}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-400">TVL</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700">{formatCurrency(metrics.tvl)}</div>
            <p className="text-xs text-blue-400">Total Value Locked</p>
            <p className="text-xs text-blue-500 mt-1 flex items-center gap-1">
              <ChevronRight className="h-3 w-3" /> Ver relatorio financeiro
            </p>
          </CardContent>
        </Card>

        <Card
          className="bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200 cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02]"
          onClick={() => { setActiveCategory('reports'); setCurrentSection('financeiro'); }}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-emerald-800">Receita Mensal</CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-700">{formatCurrency(metrics.monthlyRevenue)}</div>
            <div className="flex items-center text-xs text-emerald-600">
              <ArrowUpRight className="h-3 w-3 mr-1" />+{metrics.revenueGrowth}%
            </div>
            <p className="text-xs text-emerald-500 mt-1 flex items-center gap-1">
              <ChevronRight className="h-3 w-3" /> Ver fluxo de caixa
            </p>
          </CardContent>
        </Card>

        <Card
          className="cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02]"
          onClick={() => { setActiveCategory('menu'); setCurrentSection('contracts'); }}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contratos Ativos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeContracts}</div>
            <p className="text-xs text-muted-foreground">NFTs mintados na rede</p>
            <p className="text-xs text-primary mt-1 flex items-center gap-1">
              <ChevronRight className="h-3 w-3" /> Ver todos contratos
            </p>
          </CardContent>
        </Card>

        <Card
          className="bg-gradient-to-br from-violet-50 to-purple-50 border-violet-200 cursor-pointer hover:shadow-lg transition-all hover:scale-[1.02]"
          onClick={() => { setActiveCategory('tasks'); setCurrentSection('tasks_communication_hub'); }}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-violet-800">Atendimentos IA</CardTitle>
            <Bot className="h-4 w-4 text-violet-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-violet-700">{metrics.aiConversations}</div>
            <p className="text-xs text-violet-600">Conversas hoje</p>
            <p className="text-xs text-violet-500 mt-1 flex items-center gap-1">
              <ChevronRight className="h-3 w-3" /> Central de Comunicacao
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Acesso Rapido */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => { setActiveCategory('reports'); setCurrentSection('reports_dre'); }}>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-emerald-100 rounded-lg">
              <Calculator className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <p className="font-semibold">DRE Contabil</p>
              <p className="text-sm text-muted-foreground">Ver resultados</p>
            </div>
            <ChevronRight className="h-5 w-5 ml-auto text-muted-foreground" />
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => { setActiveCategory('tasks'); setCurrentSection('tasks_communication_hub'); }}>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-violet-100 rounded-lg">
              <MessageCircle className="h-6 w-6 text-violet-600" />
            </div>
            <div>
              <p className="font-semibold">Central de Comunicação</p>
              <p className="text-sm text-muted-foreground">{conversations.filter(c => c.status === 'human_needed').length} precisam humano</p>
            </div>
            <ChevronRight className="h-5 w-5 ml-auto text-muted-foreground" />
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => { setActiveCategory('config'); setCurrentSection('config_gateways'); }}>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <CreditCard className="h-6 w-6 text-blue-400" />
            </div>
            <div>
              <p className="font-semibold">Gateways</p>
              <p className="text-sm text-muted-foreground">{gateways.filter(g => g.status === 'connected').length} conectados</p>
            </div>
            <ChevronRight className="h-5 w-5 ml-auto text-muted-foreground" />
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => { setActiveCategory('config'); setCurrentSection('config_insurers'); }}>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-amber-100 rounded-lg">
              <ShieldCheck className="h-6 w-6 text-amber-600" />
            </div>
            <div>
              <p className="font-semibold">Seguradoras</p>
              <p className="text-sm text-muted-foreground">{insurers.filter(i => i.status === 'active').length} ativas</p>
            </div>
            <ChevronRight className="h-5 w-5 ml-auto text-muted-foreground" />
          </CardContent>
        </Card>
      </div>

      {/* Grafico DRE Resumido */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Receita vs Lucro (Ultimos 3 Meses)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {dreData.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-30" />
              <p>Nenhum dado disponivel no momento</p>
            </div>
          ) : (
            <>
              <div className="flex items-end justify-between gap-4 h-48">
                {dreData.map((d) => {
                  const maxValue = Math.max(...dreData.map(x => x.receitaBruta));
                  const receitaHeight = (d.receitaBruta / maxValue) * 100;
                  const lucroHeight = (d.lucroLiquido / maxValue) * 100;
                  return (
                    <div key={d.period} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full flex gap-1 items-end h-40">
                        <div className="flex-1 bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-md" style={{ height: `${receitaHeight}%` }} title={`Receita: ${formatCurrency(d.receitaBruta)}`} />
                        <div className="flex-1 bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-t-md" style={{ height: `${lucroHeight}%` }} title={`Lucro: ${formatCurrency(d.lucroLiquido)}`} />
                      </div>
                      <p className="text-xs font-medium">{d.period}</p>
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center justify-center gap-6 mt-4">
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-blue-500" /><span className="text-sm">Receita Bruta</span></div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-emerald-500" /><span className="text-sm">Lucro Liquido</span></div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderDRE = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-muted-foreground">Demonstrativo de Resultados do Exercicio</p>
        </div>
        <Button variant="outline"><Download className="h-4 w-4 mr-2" />Exportar Excel</Button>
      </div>

      {/* Resumo Visual do Split */}
      <Card className="bg-gradient-to-r from-slate-50 to-blue-50">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Split de Distribuicao dos Alugueis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-1 h-8 rounded-lg overflow-hidden">
            <div className="h-full bg-blue-500 flex items-center justify-center text-foreground text-xs font-medium" style={{ width: '85%' }}>
              85% Proprietarios
            </div>
            <div className="h-full bg-amber-500 flex items-center justify-center text-foreground text-xs font-medium" style={{ width: '5%' }} title="Repasse Seguradoras">
              5%
            </div>
            <div className="h-full bg-violet-500 flex items-center justify-center text-foreground text-xs font-medium" style={{ width: '5%' }} title="Repasse Garantidores">
              5%
            </div>
            <div className="h-full bg-emerald-500 flex items-center justify-center text-foreground text-xs font-medium" style={{ width: '5%' }} title="Taxa Plataforma">
              5%
            </div>
          </div>
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span>Repasse Proprietarios (85%)</span>
            <div className="flex gap-4">
              <span className="text-amber-600">Repasse Seguradoras (-5%)</span>
              <span className="text-violet-600">Repasse Garantidores (-5%)</span>
              <span className="text-emerald-600 font-semibold">Taxa Plataforma (+5%)</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>DRE Mensal - Visao da Plataforma</CardTitle>
          <CardDescription>Receitas e despesas da plataforma Vinculo</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table className="min-w-[700px]">
            <TableHeader>
              <TableRow className="bg-slate-100">
                <TableHead className="font-bold">Conta Contabil</TableHead>
                {dreData.map(d => <TableHead key={d.period} className="text-right font-bold">{d.period}</TableHead>)}
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* SECAO: FLUXO DE ALUGUEIS (Informativo) */}
              <TableRow className="bg-slate-50">
                <TableCell colSpan={dreData.length + 1} className="font-semibold text-slate-600 text-xs uppercase tracking-wide">
                  Fluxo de Alugueis (Informativo)
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="pl-6 text-muted-foreground">Total Alugueis Recebidos</TableCell>
                {dreData.map(d => <TableCell key={d.period} className="text-right text-muted-foreground">{formatCurrency(d.receitaBruta)}</TableCell>)}
              </TableRow>
              <TableRow>
                <TableCell className="pl-6 text-muted-foreground">(-) Repasse Proprietarios (85%)</TableCell>
                {dreData.map(d => <TableCell key={d.period} className="text-right text-muted-foreground">({formatCurrency(d.repasseLocadores)})</TableCell>)}
              </TableRow>
              <TableRow>
                <TableCell className="pl-6 text-muted-foreground">(-) Repasse Seguradoras (5%)</TableCell>
                {dreData.map(d => <TableCell key={d.period} className="text-right text-muted-foreground">({formatCurrency(d.repasseSeguradoras)})</TableCell>)}
              </TableRow>
              <TableRow>
                <TableCell className="pl-6 text-muted-foreground">(-) Repasse Garantidores (5%)</TableCell>
                {dreData.map(d => <TableCell key={d.period} className="text-right text-muted-foreground">({formatCurrency(d.repasseGarantidores)})</TableCell>)}
              </TableRow>

              {/* SECAO: RECEITAS DA PLATAFORMA */}
              <TableRow className="bg-emerald-50">
                <TableCell colSpan={dreData.length + 1} className="font-semibold text-emerald-700 text-xs uppercase tracking-wide">
                  Receitas da Plataforma
                </TableCell>
              </TableRow>
              <TableRow className="bg-emerald-50/50">
                <TableCell className="pl-6 font-medium">(+) Taxa Plataforma (5%)</TableCell>
                {dreData.map(d => <TableCell key={d.period} className="text-right font-semibold text-emerald-600">+{formatCurrency(d.taxaPlataforma)}</TableCell>)}
              </TableRow>
              <TableRow>
                <TableCell className="pl-6">(+) Comissao das Seguradoras (conforme cadastro)</TableCell>
                {dreData.map(d => <TableCell key={d.period} className="text-right text-emerald-600">+{formatCurrency(d.comissaoSeguradorasRecebida)}</TableCell>)}
              </TableRow>
              <TableRow>
                <TableCell className="pl-6">(+) Comissoes Marketplace</TableCell>
                {dreData.map(d => <TableCell key={d.period} className="text-right text-emerald-600">+{formatCurrency(d.marketplaceComissions)}</TableCell>)}
              </TableRow>
              <TableRow className="bg-emerald-100 font-semibold">
                <TableCell>= RECEITA BRUTA PLATAFORMA</TableCell>
                {dreData.map(d => <TableCell key={d.period} className="text-right text-emerald-700">
                  {formatCurrency(d.taxaPlataforma + d.comissaoSeguradorasRecebida + d.marketplaceComissions)}
                </TableCell>)}
              </TableRow>

              {/* SECAO: DESPESAS */}
              <TableRow className="bg-red-50">
                <TableCell colSpan={dreData.length + 1} className="font-semibold text-red-700 text-xs uppercase tracking-wide">
                  Despesas Operacionais
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="pl-6">(-) Custos Operacionais</TableCell>
                {dreData.map(d => <TableCell key={d.period} className="text-right text-red-400">({formatCurrency(d.despesasOperacionais)})</TableCell>)}
              </TableRow>

              {/* RESULTADO */}
              <TableRow className="bg-amber-50 font-semibold">
                <TableCell>= LUCRO OPERACIONAL (EBITDA)</TableCell>
                {dreData.map(d => <TableCell key={d.period} className="text-right text-amber-700">{formatCurrency(d.lucroOperacional)}</TableCell>)}
              </TableRow>
              <TableRow>
                <TableCell className="pl-6">(-) Impostos (15%)</TableCell>
                {dreData.map(d => <TableCell key={d.period} className="text-right text-red-400">({formatCurrency(d.impostos)})</TableCell>)}
              </TableRow>
              <TableRow className="bg-emerald-100 font-bold text-lg">
                <TableCell>= LUCRO LIQUIDO</TableCell>
                {dreData.map(d => <TableCell key={d.period} className="text-right text-emerald-700">{formatCurrency(d.lucroLiquido)}</TableCell>)}
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  const renderCashFlow = () => (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-emerald-800">Saldo Atual</CardTitle>
            <Wallet className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-700">{formatCurrency(cashFlow[0]?.balance || 0)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entradas Hoje</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-400">{formatCurrency(cashFlow.filter(c => c.type === 'entrada' && c.date.toDateString() === new Date().toDateString()).reduce((s, c) => s + c.amount, 0))}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saidas Hoje</CardTitle>
            <ArrowDownRight className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-400">{formatCurrency(cashFlow.filter(c => c.type === 'saida' && c.date.toDateString() === new Date().toDateString()).reduce((s, c) => s + c.amount, 0))}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Movimentacoes</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table className="min-w-[600px]">
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Descricao</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead className="text-right">Saldo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cashFlow.map(entry => (
                <TableRow key={entry.id}>
                  <TableCell>{entry.date.toLocaleDateString('pt-BR')}</TableCell>
                  <TableCell>{entry.description}</TableCell>
                  <TableCell><Badge variant="outline">{entry.category}</Badge></TableCell>
                  <TableCell className={cn("text-right font-medium", entry.type === 'entrada' ? 'text-emerald-400' : 'text-red-400')}>
                    {entry.type === 'entrada' ? '+' : '-'}{formatCurrency(entry.amount)}
                  </TableCell>
                  <TableCell className="text-right">{formatCurrency(entry.balance)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  const renderDIMOB = () => (
    <Card>
      <CardHeader>
        <CardTitle>Exportacao DIMOB</CardTitle>
        <CardDescription>Declaracao de Informacoes sobre Atividades Imobiliarias</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg border p-4 bg-slate-50">
          <h3 className="font-semibold mb-2">Dados para DIMOB {new Date().getFullYear()}</h3>
          <div className="grid gap-2 text-sm">
            <div className="flex items-center"><CheckCircle className="mr-2 h-4 w-4 text-emerald-400" /><span>Contratos ativos: {metrics.activeContracts}</span></div>
            <div className="flex items-center"><CheckCircle className="mr-2 h-4 w-4 text-emerald-400" /><span>Valor total de alugueis: {formatCurrency(dreData[0]?.receitaBruta || 0)}</span></div>
            <div className="flex items-center"><CheckCircle className="mr-2 h-4 w-4 text-emerald-400" /><span>CPFs/CNPJs validados: 100%</span></div>
          </div>
        </div>
        <Button onClick={exportDIMOB} className="w-full" size="lg">
          <Download className="mr-2 h-5 w-5" />Gerar Arquivo DIMOB
        </Button>
      </CardContent>
    </Card>
  );

  const renderBankAccounts = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><p className="text-muted-foreground">Gerencie suas contas bancarias</p></div>
        <Button onClick={() => {
          setSelectedBankAccount(null);
          setIsBankAccountDialogOpen(true);
        }}>
          <Plus className="h-4 w-4 mr-2" />Nova Conta
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {bankAccounts.map(account => (
          <Card key={account.id} className={account.isPrimary ? 'border-blue-500 border-2' : ''}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-100 rounded-lg"><Landmark className="h-5 w-5" /></div>
                  <div>
                    <CardTitle className="text-base">{account.bankName}</CardTitle>
                    <CardDescription>Ag: {account.agency} | Cc: {account.accountNumber}</CardDescription>
                  </div>
                </div>
                {account.isPrimary && <Badge className="bg-blue-500">Principal</Badge>}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-2xl font-bold">{formatCurrency(account.balance)}</div>
              {account.pixKey && (
                <div className="flex items-center gap-2 p-2 bg-slate-50 rounded text-sm">
                  <QrCode className="h-4 w-4 text-emerald-600" />
                  <span className="flex-1 truncate">{account.pixKey}</span>
                  <Button size="sm" variant="ghost"><Copy className="h-3 w-3" /></Button>
                </div>
              )}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => handleOpenEditBankAccount(account)}
                >
                  <Edit3 className="h-3 w-3 mr-1" />Editar
                </Button>
                {!account.isPrimary && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeleteBankAccount(account.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dialog de Conta Bancária */}
      <BankAccountDialog
        open={isBankAccountDialogOpen}
        onOpenChange={setIsBankAccountDialogOpen}
        account={selectedBankAccount}
        onSave={selectedBankAccount ? handleEditBankAccount : handleCreateBankAccount}
      />
    </div>
  );

  const renderGateways = () => (
    <div className="space-y-6">
      <Tabs defaultValue="gateways">
        <TabsList>
          <TabsTrigger value="gateways">Gateways de Pagamento</TabsTrigger>
          <TabsTrigger value="methods">Metodos Ativos</TabsTrigger>
        </TabsList>

        <TabsContent value="gateways" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground">Configure suas integracoes de pagamento</p>
            <Button onClick={() => {
              setSelectedGateway(null);
              setIsGatewayDialogOpen(true);
            }}>
              <Plus className="h-4 w-4 mr-2" />Novo Gateway
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {gateways.map(gateway => (
              <Card key={gateway.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn("p-2 rounded-lg", gateway.status === 'connected' ? 'bg-emerald-100' : 'bg-card')}>
                        <CreditCard className={cn("h-5 w-5", gateway.status === 'connected' ? 'text-emerald-600' : 'text-muted-foreground')} />
                      </div>
                      <div>
                        <CardTitle className="text-base">{gateway.name}</CardTitle>
                        <CardDescription className="capitalize">{gateway.provider}</CardDescription>
                      </div>
                    </div>
                    <div className={cn("w-3 h-3 rounded-full", getStatusColor(gateway.status))} />
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><p className="text-muted-foreground">Ambiente</p><Badge variant={gateway.environment === 'production' ? 'default' : 'secondary'}>{gateway.environment}</Badge></div>
                    <div><p className="text-muted-foreground">Transacoes Hoje</p><p className="font-semibold">{gateway.transactionsToday}</p></div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {gateway.supportedMethods.map(m => (
                      <Badge key={m} variant="outline" className="text-xs">{m.toUpperCase()}</Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1" onClick={() => handleTestGateway(gateway.id)}>
                      <RefreshCw className="h-3 w-3 mr-1" />Testar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleOpenEditGateway(gateway)}
                    >
                      <Settings className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="methods" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="p-6 flex items-center gap-4">
                <div className="p-3 bg-emerald-100 rounded-lg"><QrCode className="h-8 w-8 text-emerald-600" /></div>
                <div>
                  <p className="font-semibold text-lg">PIX</p>
                  <p className="text-sm text-muted-foreground">Ativo em 2 gateways</p>
                </div>
                <Switch defaultChecked className="ml-auto" />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 flex items-center gap-4">
                <div className="p-3 bg-blue-500/10 rounded-lg"><Banknote className="h-8 w-8 text-blue-400" /></div>
                <div>
                  <p className="font-semibold text-lg">Boleto</p>
                  <p className="text-sm text-muted-foreground">Ativo em 2 gateways</p>
                </div>
                <Switch defaultChecked className="ml-auto" />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 flex items-center gap-4">
                <div className="p-3 bg-purple-500/10 rounded-lg"><CreditCard className="h-8 w-8 text-purple-400" /></div>
                <div>
                  <p className="font-semibold text-lg">Cartao</p>
                  <p className="text-sm text-muted-foreground">Ativo em 2 gateways</p>
                </div>
                <Switch defaultChecked className="ml-auto" />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialog de Gateway */}
      <GatewayDialog
        open={isGatewayDialogOpen}
        onOpenChange={setIsGatewayDialogOpen}
        gateway={selectedGateway}
        onSave={selectedGateway ? handleEditGateway : handleCreateGateway}
        onTest={handleTestGateway}
        onDelete={handleDeleteGateway}
      />
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground">Gerencie os usuarios administradores</p>
        <Button onClick={handleOpenNewUser}><UserPlus className="h-4 w-4 mr-2" />Novo Usuario</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Funcao</TableHead>
                <TableHead>Departamento</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ultimo Acesso</TableHead>
                <TableHead className="text-right">Acoes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {adminUsers.map(user => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-semibold text-sm">{user.name.charAt(0)}</div>
                      <div><p className="font-medium">{user.name}</p><p className="text-xs text-muted-foreground">{user.email}</p></div>
                    </div>
                  </TableCell>
                  <TableCell><Badge variant="outline">{user.role}</Badge></TableCell>
                  <TableCell>{user.department}</TableCell>
                  <TableCell><Badge className={getStatusColor(user.status)}>{user.status}</Badge></TableCell>
                  <TableCell>{user.lastLogin?.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button size="sm" variant="ghost" onClick={() => handleOpenEditUser(user)} title="Editar"><Edit3 className="h-4 w-4" /></Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDeleteUser(user.id)} title="Excluir" className="text-red-500 hover:text-red-700"><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog de Usuario */}
      <UserDialog
        open={isUserDialogOpen}
        onOpenChange={setIsUserDialogOpen}
        user={selectedUser}
        onSave={selectedUser ? handleEditUser : handleCreateUser}
        roles={userRoles.map(r => ({ id: r.id, name: r.name }))}
      />
    </div>
  );

  // ============= HANDLERS DE GRUPOS =============

  const handleCreateGroup = (newGroup: Omit<UserRole, 'id' | 'userCount'>) => {
    const newId = String(userRoles.length + 1);
    const groupWithId: UserRole = {
      ...newGroup,
      id: newId,
      userCount: 0,
    };
    setUserRoles(prev => [...prev, groupWithId]);
  };

  const handleEditGroup = (updatedGroup: UserRole) => {
    setUserRoles(prev => prev.map(role => role.id === updatedGroup.id ? updatedGroup : role));
  };

  const handleDeleteGroup = (roleId: string) => {
    const role = userRoles.find(r => r.id === roleId);
    if (!role) return;

    if (role.isSystem) {
      alert('Grupos do sistema não podem ser excluídos');
      return;
    }

    if (role.userCount > 0) {
      const confirmed = confirm(`Este grupo possui ${role.userCount} usuário(s). Deseja realmente excluir?`);
      if (!confirmed) return;
    }

    setUserRoles(prev => prev.filter(r => r.id !== roleId));
  };

  const handleOpenEditDialog = (role: UserRole) => {
    setSelectedGroupForEdit(role);
    setIsEditGroupDialogOpen(true);
  };

  // ============= HANDLERS DE CONTAS BANCÁRIAS =============

  const handleCreateBankAccount = (newAccount: Omit<BankAccount, 'id' | 'balance'> | BankAccount) => {
    const newId = String(bankAccounts.length + 1);
    const accountWithId: BankAccount = {
      ...newAccount,
      id: 'id' in newAccount ? newAccount.id : newId,
      balance: 'balance' in newAccount ? newAccount.balance : 0,
      status: 'status' in newAccount ? newAccount.status : 'active',
    };

    // Se a nova conta é principal, remove primary das outras
    if (newAccount.isPrimary) {
      setBankAccounts(prev => prev.map(acc => ({ ...acc, isPrimary: false })));
    }

    setBankAccounts(prev => [...prev, accountWithId]);
  };

  const handleEditBankAccount = (updatedAccount: BankAccount) => {
    // Se a conta atualizada é principal, remove primary das outras
    if (updatedAccount.isPrimary) {
      setBankAccounts(prev =>
        prev.map(acc =>
          acc.id === updatedAccount.id
            ? updatedAccount
            : { ...acc, isPrimary: false }
        )
      );
    } else {
      setBankAccounts(prev => prev.map(acc => acc.id === updatedAccount.id ? updatedAccount : acc));
    }
  };

  const handleDeleteBankAccount = (accountId: string) => {
    const account = bankAccounts.find(a => a.id === accountId);
    if (!account) return;

    if (account.isPrimary) {
      alert('Não é possível excluir a conta principal');
      return;
    }

    const confirmed = confirm(`Deseja realmente excluir a conta ${account.bankName}?`);
    if (!confirmed) return;

    setBankAccounts(prev => prev.filter(a => a.id !== accountId));
  };

  const handleOpenEditBankAccount = (account: BankAccount) => {
    setSelectedBankAccount(account);
    setIsBankAccountDialogOpen(true);
  };

  // ============= HANDLERS DE GATEWAYS =============

  const handleCreateGateway = (newGateway: Omit<PaymentGateway, 'id' | 'status' | 'transactionsToday'>) => {
    const newId = String(gateways.length + 1);
    const gatewayWithId: PaymentGateway = {
      ...newGateway,
      id: newId,
      status: 'disconnected',
      transactionsToday: 0,
    };
    setGateways(prev => [...prev, gatewayWithId]);
  };

  const handleEditGateway = (updatedGateway: PaymentGateway) => {
    setGateways(prev => prev.map(gw => gw.id === updatedGateway.id ? updatedGateway : gw));
  };

  const handleDeleteGateway = (gatewayId: string) => {
    const gateway = gateways.find(g => g.id === gatewayId);
    if (!gateway) return;

    const confirmed = confirm(`Deseja realmente excluir o gateway ${gateway.name}?`);
    if (!confirmed) return;

    setGateways(prev => prev.filter(g => g.id !== gatewayId));
  };

  const handleOpenEditGateway = (gateway: PaymentGateway) => {
    setSelectedGateway(gateway);
    setIsGatewayDialogOpen(true);
  };

  // ============= HANDLERS DE SEGURADORAS =============

  const handleCreateInsurer = (newInsurer: Omit<Insurer, 'id' | 'activeContracts' | 'totalPremium'>) => {
    const newId = String(insurers.length + 1);
    const insurerWithId: Insurer = {
      ...newInsurer,
      id: newId,
      activeContracts: 0,
      totalPremium: 0,
    };
    setInsurers(prev => [...prev, insurerWithId]);
  };

  const handleEditInsurer = (updatedInsurer: Insurer) => {
    setInsurers(prev => prev.map(ins => ins.id === updatedInsurer.id ? updatedInsurer : ins));
  };

  const handleDeleteInsurer = (insurerId: string) => {
    const insurer = insurers.find(i => i.id === insurerId);
    if (!insurer) return;

    if (insurer.activeContracts > 0) {
      const confirmed = confirm(
        `A seguradora ${insurer.name} possui ${insurer.activeContracts} contrato(s) ativo(s). Deseja realmente excluir?`
      );
      if (!confirmed) return;
    } else {
      const confirmed = confirm(`Deseja realmente excluir a seguradora ${insurer.name}?`);
      if (!confirmed) return;
    }

    setInsurers(prev => prev.filter(i => i.id !== insurerId));
  };

  const handleOpenEditInsurer = (insurer: Insurer) => {
    setSelectedInsurer(insurer);
    setIsInsurerDialogOpen(true);
  };

  // ============= HANDLERS DE MARKETPLACE =============

  const handleCreateProvider = (newProvider: Omit<ServiceProvider, 'id' | 'rating' | 'completedJobs'>) => {
    const newId = String(serviceProviders.length + 1);
    const providerWithId: ServiceProvider = {
      ...newProvider,
      id: newId,
      rating: 0,
      completedJobs: 0,
    };
    setServiceProviders(prev => [...prev, providerWithId]);
  };

  const handleEditProvider = (updatedProvider: ServiceProvider) => {
    setServiceProviders(prev => prev.map(sp => sp.id === updatedProvider.id ? updatedProvider : sp));
  };

  const handleDeleteProvider = (providerId: string) => {
    const provider = serviceProviders.find(p => p.id === providerId);
    if (!provider) return;

    const confirmed = confirm(`Deseja realmente excluir o fornecedor ${provider.name}?`);
    if (!confirmed) return;

    setServiceProviders(prev => prev.filter(p => p.id !== providerId));
  };

  const handleOpenEditProvider = (provider: ServiceProvider) => {
    setSelectedProvider(provider);
    setIsMarketplaceDialogOpen(true);
  };

  // ============= HANDLERS DE USUARIOS =============

  const handleCreateUser = (newUser: Omit<AdminUser, 'id' | 'lastLogin' | 'createdAt'>) => {
    const newId = String(adminUsers.length + 1);
    const userWithId: AdminUser = {
      ...newUser,
      id: newId,
      createdAt: new Date(),
    };
    setAdminUsers(prev => [...prev, userWithId]);
  };

  const handleEditUser = (updatedUser: AdminUser) => {
    setAdminUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
  };

  const handleDeleteUser = (userId: string) => {
    const user = adminUsers.find(u => u.id === userId);
    if (!user) return;

    const confirmed = confirm(`Deseja realmente excluir o usuario ${user.name}?`);
    if (!confirmed) return;

    setAdminUsers(prev => prev.filter(u => u.id !== userId));
  };

  const handleOpenEditUser = (user: AdminUser) => {
    setSelectedUser(user);
    setIsUserDialogOpen(true);
  };

  const handleOpenNewUser = () => {
    setSelectedUser(null);
    setIsUserDialogOpen(true);
  };

  // ============= HANDLERS DE SERVICOS =============

  const handleCreateService = (newService: any) => {
    // Adiciona o servico ao sistema
    console.log('Novo servico criado:', newService);
    alert(`Servico "${newService.name}" criado com sucesso!`);
  };

  const handleEditService = (updatedService: any) => {
    console.log('Servico atualizado:', updatedService);
    alert(`Servico "${updatedService.name}" atualizado com sucesso!`);
  };

  const handleOpenEditService = (service: any) => {
    setSelectedService(service);
    setIsServiceDialogOpen(true);
  };

  const handleOpenNewService = () => {
    setSelectedService(null);
    setIsServiceDialogOpen(true);
  };

  // ============= HANDLERS DE INTEGRACOES =============

  const handleCreateIntegration = (newIntegration: any) => {
    console.log('Nova integracao criada:', newIntegration);
    alert(`Integracao "${newIntegration.name}" criada com sucesso!`);
  };

  const handleEditIntegration = (updatedIntegration: any) => {
    console.log('Integracao atualizada:', updatedIntegration);
    alert(`Integracao "${updatedIntegration.name}" atualizada com sucesso!`);
  };

  const handleOpenEditIntegration = (integration: any) => {
    setSelectedIntegration(integration);
    setIsIntegrationDialogOpen(true);
  };

  const handleOpenNewIntegration = () => {
    setSelectedIntegration(null);
    setIsIntegrationDialogOpen(true);
  };

  const handleTestIntegration = async (integrationId: string): Promise<boolean> => {
    // Simula teste de conexao
    await new Promise(resolve => setTimeout(resolve, 1500));
    return Math.random() > 0.3; // 70% de chance de sucesso
  };

  const renderPermissions = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground">Configure grupos e permissoes de acesso (RBAC)</p>
        <Button onClick={() => setIsNewGroupDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Grupo
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {userRoles.map(role => (
          <Card key={role.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base flex items-center gap-2">
                    {role.name}
                    {role.isSystem && <Badge variant="secondary" className="text-xs">Sistema</Badge>}
                  </CardTitle>
                  <CardDescription>{role.description}</CardDescription>
                </div>
                <Badge variant="outline">{role.userCount} usuarios</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">Permissoes:</p>
                <div className="flex flex-wrap gap-1">
                  {role.permissions.slice(0, 4).map((p, i) => (
                    <Badge key={i} variant="outline" className="text-xs">{p}</Badge>
                  ))}
                  {role.permissions.length > 4 && <Badge variant="secondary" className="text-xs">+{role.permissions.length - 4}</Badge>}
                </div>
              </div>
              {!role.isSystem && (
                <div className="flex gap-2 mt-4">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleOpenEditDialog(role)}
                  >
                    <Edit3 className="h-3 w-3 mr-1" />
                    Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeleteGroup(role.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dialogos */}
      <NewGroupDialog
        open={isNewGroupDialogOpen}
        onOpenChange={setIsNewGroupDialogOpen}
        onSave={handleCreateGroup}
      />

      <EditGroupDialog
        open={isEditGroupDialogOpen}
        onOpenChange={setIsEditGroupDialogOpen}
        group={selectedGroupForEdit}
        onSave={handleEditGroup}
      />
    </div>
  );

  const renderInsurers = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground">Seguradoras parceiras e portal de acesso</p>
        <Button onClick={() => {
          setSelectedInsurer(null);
          setIsInsurerDialogOpen(true);
        }}>
          <Plus className="h-4 w-4 mr-2" />Nova Seguradora
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Seguradora</TableHead>
                <TableHead>Tipos de Apolice</TableHead>
                <TableHead>Comissao</TableHead>
                <TableHead>Contratos</TableHead>
                <TableHead>Premio Total</TableHead>
                <TableHead>Portal</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Acoes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {insurers.map(insurer => (
                <TableRow key={insurer.id}>
                  <TableCell>
                    <div><p className="font-medium">{insurer.name}</p><p className="text-xs text-muted-foreground">{insurer.cnpj}</p></div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {insurer.policyTypes.map((p, i) => <Badge key={i} variant="outline" className="text-xs">{p}</Badge>)}
                    </div>
                  </TableCell>
                  <TableCell><span className="font-semibold">{insurer.commissionRate}%</span></TableCell>
                  <TableCell>{insurer.activeContracts}</TableCell>
                  <TableCell>{formatCurrency(insurer.totalPremium)}</TableCell>
                  <TableCell>{insurer.portalAccess ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-muted-foreground" />}</TableCell>
                  <TableCell><Badge className={getStatusColor(insurer.status)}>{insurer.status}</Badge></TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleOpenEditInsurer(insurer)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteInsurer(insurer.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog de Seguradora */}
      <InsurerDialog
        open={isInsurerDialogOpen}
        onOpenChange={setIsInsurerDialogOpen}
        insurer={selectedInsurer}
        onSave={selectedInsurer ? handleEditInsurer : handleCreateInsurer}
      />
    </div>
  );

  const renderMarketplace = () => <PartnersManagementSection />;

  const renderMarketplaceRedirect = () => (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-6 w-6 text-green-600" />
            Gestao do Marketplace
          </CardTitle>
          <CardDescription>
            Sistema completo de gestao de parceiros, produtos e aprovacoes do marketplace Vinculo Brasil.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            O modulo de Marketplace permite gerenciar:
          </p>
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
            <li>Parceiros comerciais (seguradoras, empresas de mudanca, internet, etc.)</li>
            <li>Produtos e servicos para aprovacao</li>
            <li>Configuracoes de comissao e descontos</li>
            <li>Formas de pagamento aceitas (PIX, Cartao, Crypto, VBRZ)</li>
          </ul>
          <div className="pt-4">
            <Link to="/admin/marketplace">
              <Button className="bg-green-600 hover:bg-green-700">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Acessar Gestao do Marketplace
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderAISupport = () => (
    <div className="space-y-6">
      <Tabs defaultValue="conversations">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="conversations" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />Conversas
          </TabsTrigger>
          <TabsTrigger value="agents" className="flex items-center gap-2">
            <Bot className="h-4 w-4" />Agentes IA
          </TabsTrigger>
          <TabsTrigger value="knowledge" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />Base Conhecimento
          </TabsTrigger>
          <TabsTrigger value="prompts" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />System Prompts
          </TabsTrigger>
          <TabsTrigger value="handoff" className="flex items-center gap-2">
            <Headphones className="h-4 w-4" />Regras Handoff
          </TabsTrigger>
        </TabsList>

        {/* Tab: Conversas */}
        <TabsContent value="conversations" className="space-y-4">
          <div className="grid gap-6 lg:grid-cols-3 h-[calc(100vh-280px)]">
            <Card className="lg:col-span-1">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center justify-between">
                  Conversas Ativas
                  <Badge variant="secondary">{conversations.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[450px]">
                  {conversations.map(conv => {
                    const ChannelIcon = getChannelIcon(conv.channel);
                    return (
                      <div
                        key={conv.id}
                        onClick={() => setSelectedConversation(conv)}
                        className={cn(
                          "p-4 border-b cursor-pointer hover:bg-slate-50 transition-colors",
                          selectedConversation?.id === conv.id && "bg-blue-50"
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <div className={cn(
                            "p-2 rounded-full",
                            conv.channel === 'whatsapp' ? 'bg-emerald-500/10' :
                            conv.channel === 'instagram' ? 'bg-pink-100' : 'bg-blue-500/10'
                          )}>
                            <ChannelIcon className={cn(
                              "h-4 w-4",
                              conv.channel === 'whatsapp' ? 'text-emerald-400' :
                              conv.channel === 'instagram' ? 'text-pink-600' : 'text-blue-400'
                            )} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="font-medium text-sm truncate">{conv.customerName}</p>
                              <Badge className={cn(
                                "text-xs",
                                conv.status === 'ai_handling' ? 'bg-violet-500' :
                                conv.status === 'human_needed' ? 'bg-amber-500' :
                                conv.status === 'resolved' ? 'bg-green-500' : 'bg-gray-400'
                              )}>
                                {conv.status === 'ai_handling' ? 'IA' : conv.status === 'human_needed' ? 'Humano' : conv.status}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground truncate">{conv.subject}</p>
                            <p className="text-xs text-muted-foreground mt-1">{conv.messages[conv.messages.length - 1]?.content.slice(0, 40)}...</p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </ScrollArea>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2 flex flex-col">
              {selectedConversation ? (
                <>
                  <CardHeader className="border-b pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-semibold">{selectedConversation.customerName.charAt(0)}</div>
                        <div>
                          <CardTitle className="text-base">{selectedConversation.customerName}</CardTitle>
                          <CardDescription>{selectedConversation.subject}</CardDescription>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline"><Phone className="h-4 w-4 mr-1" />Ligar</Button>
                        <Button size="sm" variant="outline"><Headphones className="h-4 w-4 mr-1" />Assumir</Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1 overflow-hidden p-0">
                    <ScrollArea className="h-[300px] p-4">
                      <div className="space-y-4">
                        {selectedConversation.messages.map(msg => (
                          <div key={msg.id} className={cn("flex", msg.sender === 'customer' ? 'justify-start' : 'justify-end')}>
                            <div className={cn(
                              "max-w-[80%] rounded-lg p-3",
                              msg.sender === 'customer' ? 'bg-slate-100' :
                              msg.sender === 'ai' ? 'bg-violet-100' : 'bg-blue-500/10'
                            )}>
                              <div className="flex items-center gap-2 mb-1">
                                {msg.sender === 'ai' && <Bot className="h-3 w-3 text-violet-600" />}
                                <span className="text-xs font-medium capitalize">{msg.sender}</span>
                                <span className="text-xs text-muted-foreground">{msg.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                              </div>
                              <p className="text-sm">{msg.content}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                  <div className="p-4 border-t">
                    <div className="flex gap-2">
                      <Input placeholder="Digite sua mensagem..." value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()} className="flex-1" />
                      <Button onClick={handleSendMessage}><Send className="h-4 w-4" /></Button>
                    </div>
                  </div>
                </>
              ) : (
                <CardContent className="flex-1 flex items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Selecione uma conversa para visualizar</p>
                  </div>
                </CardContent>
              )}
            </Card>
          </div>
        </TabsContent>

        {/* Tab: Agentes IA */}
        <TabsContent value="agents" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground">Gerencie os agentes de IA por departamento</p>
            <Button onClick={() => alert("Funcionalidade de cadastro de novo agente IA em desenvolvimento")}><Plus className="h-4 w-4 mr-2" />Novo Agente</Button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {aiAgents.map(agent => (
              <Card key={agent.id} className={cn(agent.status === 'active' ? 'border-green-200' : agent.status === 'paused' ? 'border-amber-200' : 'border-blue-200')}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn("p-3 rounded-xl", agent.status === 'active' ? 'bg-violet-100' : 'bg-card')}>
                        <Bot className={cn("h-6 w-6", agent.status === 'active' ? 'text-violet-600' : 'text-muted-foreground')} />
                      </div>
                      <div>
                        <CardTitle className="text-base">{agent.name}</CardTitle>
                        <CardDescription className="capitalize">Departamento: {agent.department}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={cn(
                        agent.status === 'active' ? 'bg-green-500' :
                        agent.status === 'paused' ? 'bg-amber-500' : 'bg-blue-500'
                      )}>
                        {agent.status === 'active' ? 'Ativo' : agent.status === 'paused' ? 'Pausado' : 'Treinando'}
                      </Badge>
                      <Switch checked={agent.status === 'active'} />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <p className="text-muted-foreground text-xs">Conversas Hoje</p>
                      <p className="text-xl font-bold">{agent.conversationsToday}</p>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <p className="text-muted-foreground text-xs">Taxa Resolucao</p>
                      <p className="text-xl font-bold text-emerald-400">{agent.resolutionRate}%</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Tom: <Badge variant="outline" className="capitalize">{agent.tone}</Badge></span>
                    <span className="text-muted-foreground">Base: {agent.knowledgeBaseSize} docs</span>
                  </div>
                  <Button size="sm" variant="outline" className="w-full"><Settings className="h-4 w-4 mr-2" />Configurar Agente</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Tab: Base de Conhecimento */}
        <TabsContent value="knowledge" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground">Documentos que alimentam a IA do Vinculo.io</p>
              <p className="text-xs text-muted-foreground mt-1">Total: {knowledgeBase.reduce((sum, kb) => sum + kb.usageCount, 0)} consultas</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => alert("Funcionalidade de upload de PDF em desenvolvimento")}><Upload className="h-4 w-4 mr-2" />Upload PDF</Button>
              <Button onClick={() => alert("Funcionalidade de upload de documento em desenvolvimento")}><Plus className="h-4 w-4 mr-2" />Novo Documento</Button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {knowledgeBase.map(kb => (
              <Card key={kb.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "p-2 rounded-lg",
                        kb.fileType === 'pdf' ? 'bg-red-500/10' :
                        kb.fileType === 'faq' ? 'bg-blue-500/10' : 'bg-emerald-500/10'
                      )}>
                        {kb.fileType === 'pdf' ? <FileText className="h-5 w-5 text-red-400" /> :
                         kb.fileType === 'faq' ? <MessageSquare className="h-5 w-5 text-blue-400" /> :
                         <BookOpen className="h-5 w-5 text-emerald-400" />}
                      </div>
                      <div>
                        <CardTitle className="text-base">{kb.title}</CardTitle>
                        <CardDescription>{kb.category}</CardDescription>
                      </div>
                    </div>
                    <Badge variant="secondary">{kb.usageCount} usos</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="p-3 bg-slate-50 rounded-lg max-h-32 overflow-y-auto">
                    <pre className="text-xs whitespace-pre-wrap font-mono">{kb.content.slice(0, 300)}...</pre>
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Atualizado: {kb.uploadedAt.toLocaleDateString('pt-BR')}</span>
                    <span className="capitalize">{kb.fileType}</span>
                  </div>
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline" className="flex-1" onClick={() => { setEditingKnowledge(kb); setNewKnowledgeContent(kb.content); }}>
                          <Eye className="h-3 w-3 mr-1" />Visualizar
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[90vh]">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2">
                            <BookOpen className="h-5 w-5 text-violet-600" />
                            {kb.title}
                          </DialogTitle>
                          <DialogDescription>{kb.category} - {kb.usageCount} consultas da IA</DialogDescription>
                        </DialogHeader>
                        <ScrollArea className="h-[500px] mt-4">
                          <div className="p-4 bg-slate-50 rounded-lg">
                            <pre className="whitespace-pre-wrap font-mono text-sm">{kb.content}</pre>
                          </div>
                        </ScrollArea>
                        <DialogFooter>
                          <Button variant="outline"><Download className="h-4 w-4 mr-2" />Exportar TXT</Button>
                          <Button><Edit3 className="h-4 w-4 mr-2" />Editar Documento</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    <Button size="sm" variant="ghost"><Edit3 className="h-3 w-3" /></Button>
                    <Button size="sm" variant="ghost" className="text-red-500"><Trash2 className="h-3 w-3" /></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Tab: System Prompts */}
        <TabsContent value="prompts" className="space-y-4">
          <Card className="bg-gradient-to-br from-violet-50 to-indigo-50 border-violet-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-violet-100 rounded-xl"><Brain className="h-6 w-6 text-violet-600" /></div>
                <div>
                  <h4 className="font-bold text-violet-900">System Prompts</h4>
                  <p className="text-sm text-violet-700 mt-1">Configure a "personalidade" e instrucoes de cada agente de IA. Estes prompts definem como a IA deve se comportar e responder.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {Object.entries(systemPrompts).map(([key, prompt]) => (
              <Card key={key}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-violet-100 rounded-lg">
                        <Bot className="h-5 w-5 text-violet-600" />
                      </div>
                      <div>
                        <CardTitle className="text-base capitalize">
                          {key === 'default' ? 'Prompt Padrao (Todos)' : `Vini ${key.charAt(0).toUpperCase() + key.slice(1)}`}
                        </CardTitle>
                        <CardDescription>
                          {key === 'default' ? 'Usado como base para todos os agentes' : `Especializado em ${key}`}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge variant="outline" className="capitalize">{key}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Textarea value={prompt} rows={4} className="font-mono text-sm" readOnly />
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1"><Edit3 className="h-3 w-3 mr-1" />Editar Prompt</Button>
                    <Button size="sm" variant="outline"><Copy className="h-3 w-3" /></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Tab: Regras de Handoff */}
        <TabsContent value="handoff" className="space-y-4">
          <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-amber-100 rounded-xl"><Headphones className="h-6 w-6 text-amber-600" /></div>
                <div>
                  <h4 className="font-bold text-amber-900">Regras de Handoff (IA → Humano)</h4>
                  <p className="text-sm text-amber-700 mt-1">Configure quando a IA deve transferir o atendimento para um agente humano. Isso garante que casos complexos recebam atencao especializada.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-between">
            <p className="text-muted-foreground">{handoffRules.length} regras configuradas</p>
            <Button onClick={() => alert("Funcionalidade de criacao de nova regra de handoff em desenvolvimento")}><Plus className="h-4 w-4 mr-2" />Nova Regra</Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Gatilho</TableHead>
                    <TableHead>Acao</TableHead>
                    <TableHead>Departamento</TableHead>
                    <TableHead>Prioridade</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Acoes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {handoffRules.map(rule => (
                    <TableRow key={rule.id}>
                      <TableCell className="font-medium">{rule.trigger}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {rule.action === 'transfer_immediate' ? 'Transferir Imediato' :
                           rule.action === 'offer_transfer' ? 'Oferecer Transferencia' : 'Se Necessario'}
                        </Badge>
                      </TableCell>
                      <TableCell className="capitalize">{rule.department}</TableCell>
                      <TableCell>
                        <Badge className={cn(
                          rule.priority === 'critical' ? 'bg-red-500' :
                          rule.priority === 'high' ? 'bg-amber-500' :
                          rule.priority === 'medium' ? 'bg-blue-500' : 'bg-gray-400'
                        )}>
                          {rule.priority === 'critical' ? 'Critica' :
                           rule.priority === 'high' ? 'Alta' :
                           rule.priority === 'medium' ? 'Media' : 'Baixa'}
                        </Badge>
                      </TableCell>
                      <TableCell><Switch defaultChecked /></TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button size="sm" variant="ghost"><Edit3 className="h-4 w-4" /></Button>
                          <Button size="sm" variant="ghost" className="text-red-500"><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Instrucao de Handoff para IA</CardTitle>
              <CardDescription>Esta instrucao e adicionada ao prompt de todos os agentes</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value="Se o usuario pedir para falar com um humano ou tiver uma disputa complexa de vistoria, transfira o atendimento para o Departamento de Mediacao. Sempre informe ao cliente que um especialista assumira o atendimento em breve."
                rows={3}
                className="font-mono text-sm"
              />
              <Button className="mt-3"><Save className="h-4 w-4 mr-2" />Salvar Instrucao</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );

  const renderDisputes = () => (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-indigo-50 to-violet-50 border-indigo-200">
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-indigo-100 rounded-xl"><ShieldAlert className="h-6 w-6 text-indigo-600" /></div>
            <div>
              <h4 className="font-bold text-indigo-900">Sistema Multi-Sig (2 de 3)</h4>
              <p className="text-sm text-indigo-700 mt-1">Resolucoes requerem 2 de 3 assinaturas: <strong>Admin</strong>, <strong>Seguradora</strong> e <strong>Parte</strong>.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Gavel className="h-5 w-5" />Disputas Ativas</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table className="min-w-[700px]">
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Imovel</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Assinaturas</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Acoes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {disputes.map(dispute => (
                <TableRow key={dispute.id}>
                  <TableCell className="font-mono text-sm">{dispute.id}</TableCell>
                  <TableCell>
                    <div><p className="font-medium text-sm">{dispute.propertyAddress.slice(0, 30)}...</p><p className="text-xs text-muted-foreground">{dispute.contractId}</p></div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {dispute.type === 'inspection_damage' ? 'Danos' :
                       dispute.type === 'payment_failure' ? 'Pagamento' :
                       dispute.type === 'collateral_release' ? 'Liberacao' : 'Rescisao'}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-semibold">{dispute.claimAmount > 0 ? formatCurrency(dispute.claimAmount) : '-'}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold", dispute.signatures.admin ? 'bg-green-500 text-foreground' : 'bg-secondary')}>A</div>
                      <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold", dispute.signatures.insurer ? 'bg-green-500 text-foreground' : 'bg-secondary')}>S</div>
                      <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold", dispute.signatures.party ? 'bg-green-500 text-foreground' : 'bg-secondary')}>P</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={cn(
                      dispute.status === 'open' ? 'bg-amber-500' :
                      dispute.status === 'pending_signatures' ? 'bg-blue-500' :
                      dispute.status === 'resolved' ? 'bg-green-500' : 'bg-red-500'
                    )}>
                      {dispute.status === 'open' ? 'Aberta' :
                       dispute.status === 'pending_signatures' ? 'Aguardando' :
                       dispute.status === 'resolved' ? 'Resolvida' : 'Escalada'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline"><Eye className="h-4 w-4 mr-1" />Analisar</Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle className="flex items-center gap-2"><Gavel className="h-5 w-5 text-indigo-600" />Disputa {dispute.id}</DialogTitle>
                          <DialogDescription>{dispute.propertyAddress}</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-6 py-4">
                          <div className="grid grid-cols-3 gap-4">
                            <div><p className="text-sm text-muted-foreground">Contrato</p><p className="font-mono font-semibold">{dispute.contractId}</p></div>
                            <div><p className="text-sm text-muted-foreground">Aberto por</p><p className="font-semibold">{dispute.openedByName}</p></div>
                            <div><p className="text-sm text-muted-foreground">Valor Reclamado</p><p className="font-semibold text-red-400">{formatCurrency(dispute.claimAmount)}</p></div>
                          </div>
                          <Separator />
                          <div><p className="font-semibold mb-2">Descricao</p><p className="text-sm bg-slate-50 p-4 rounded-lg">{dispute.description}</p></div>

                          {dispute.type === 'inspection_damage' && (
                            <>
                              <Separator />
                              <div>
                                <p className="font-semibold mb-4 flex items-center gap-2"><Camera className="h-4 w-4" />Comparacao de Vistoria</p>
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="border rounded-lg p-4">
                                    <p className="font-medium text-center mb-4 text-emerald-400">ENTRADA</p>
                                    <div className="aspect-video bg-slate-200 rounded flex items-center justify-center"><Image className="h-12 w-12 text-slate-400" /></div>
                                  </div>
                                  <div className="border rounded-lg p-4">
                                    <p className="font-medium text-center mb-4 text-red-400">SAIDA (com danos)</p>
                                    <div className="aspect-video bg-slate-200 rounded flex items-center justify-center"><Image className="h-12 w-12 text-slate-400" /></div>
                                  </div>
                                </div>
                              </div>
                            </>
                          )}

                          <Separator />
                          <div>
                            <p className="font-semibold mb-4">Status Multi-Sig</p>
                            <div className="grid grid-cols-3 gap-4">
                              {[
                                { key: 'admin', label: 'Administrador', signed: dispute.signatures.admin },
                                { key: 'insurer', label: 'Seguradora', signed: dispute.signatures.insurer },
                                { key: 'party', label: 'Parte Interessada', signed: dispute.signatures.party },
                              ].map(sig => (
                                <div key={sig.key} className={cn("p-4 rounded-lg border-2", sig.signed ? 'border-green-500 bg-green-50' : 'border-border')}>
                                  <div className="flex items-center gap-2 mb-2">
                                    {sig.signed ? <CheckCircle className="h-5 w-5 text-emerald-400" /> : <Clock className="h-5 w-5 text-muted-foreground" />}
                                    <span className="font-semibold">{sig.label}</span>
                                  </div>
                                  <p className="text-xs text-muted-foreground">{sig.signed ? 'Assinado' : 'Pendente'}</p>
                                </div>
                              ))}
                            </div>
                          </div>

                          {!dispute.signatures.admin && (
                            <div>
                              <p className="font-semibold mb-2">Sua Decisao</p>
                              <Textarea placeholder="Justifique sua decisao..." value={adminDecision} onChange={(e) => setAdminDecision(e.target.value)} rows={3} />
                            </div>
                          )}

                        </div>
                        <DialogFooter className="gap-2">
                          <Button variant="outline" onClick={() => handleMultiSigAction(dispute, 'reject')} disabled={!isConnected || isProcessingMultiSig}>
                            {isProcessingMultiSig ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <ThumbsDown className="h-4 w-4 mr-2" />}
                            Liberar Garantia Total
                          </Button>
                          <Button className="bg-amber-600 hover:bg-amber-700" onClick={() => handleMultiSigAction(dispute, 'approve')} disabled={!isConnected || isProcessingMultiSig}>
                            {isProcessingMultiSig ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <ThumbsUp className="h-4 w-4 mr-2" />}
                            Reter para Reparos
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );

  // ============= MODULO: CONTRATOS =============
  const renderContracts = () => {
    const getContractStatusBadge = (status: Contract['status']) => {
      const styles = {
        active: 'bg-emerald-500/10 text-green-700',
        pending_signatures: 'bg-amber-100 text-amber-700',
        pending_deposit: 'bg-blue-500/10 text-blue-700',
        expired: 'bg-card text-muted-foreground',
        terminated: 'bg-red-500/10 text-red-700',
      };
      const labels = {
        active: 'Ativo',
        pending_signatures: 'Aguardando Assinaturas',
        pending_deposit: 'Aguardando Deposito',
        expired: 'Expirado',
        terminated: 'Rescindido',
      };
      return <Badge className={styles[status]}>{labels[status]}</Badge>;
    };

    const getPaymentStatusBadge = (status: Contract['paymentStatus']) => {
      const styles = {
        current: 'bg-emerald-500/10 text-green-700',
        late: 'bg-amber-100 text-amber-700',
        defaulted: 'bg-red-500/10 text-red-700',
      };
      const labels = {
        current: 'Em dia',
        late: 'Atrasado',
        defaulted: 'Inadimplente',
      };
      return <Badge className={styles[status]}>{labels[status]}</Badge>;
    };

    const activeContracts = contracts.filter(c => c.status === 'active');
    const pendingContracts = contracts.filter(c => c.status === 'pending_signatures' || c.status === 'pending_deposit');
    const lateContracts = contracts.filter(c => c.paymentStatus === 'late' || c.paymentStatus === 'defaulted');
    const totalRentValue = activeContracts.reduce((sum, c) => sum + c.rentAmount, 0);

    return (
      <div className="space-y-6">
        {/* Metricas de Contratos */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-400">Contratos Ativos</CardTitle>
              <FileText className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-700">{activeContracts.length}</div>
              <p className="text-xs text-blue-400">NFTs mintados na blockchain</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-amber-800">Pendentes</CardTitle>
              <Clock className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-700">{pendingContracts.length}</div>
              <p className="text-xs text-amber-600">Aguardando assinaturas</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-rose-50 border-red-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-red-400">Com Atraso</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-700">{lateContracts.length}</div>
              <p className="text-xs text-red-400">Pagamentos pendentes</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-emerald-800">Receita Mensal</CardTitle>
              <DollarSign className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-700">{formatCurrency(totalRentValue)}</div>
              <p className="text-xs text-emerald-600">Total em alugueis</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabela de Contratos */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <FileSignature className="h-5 w-5" />
                  Contratos
                </CardTitle>
                <CardDescription>Gestao completa de contratos de locacao NFT</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => alert("Funcionalidade de filtros em desenvolvimento")}>
                  <Filter className="h-4 w-4 mr-2" />
                  Filtrar
                </Button>
                <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700" onClick={() => setNewContractOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Contrato
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table className="min-w-[900px]">
              <TableHeader>
                <TableRow>
                  <TableHead>ID / NFT</TableHead>
                  <TableHead>Imovel</TableHead>
                  <TableHead>Locatario</TableHead>
                  <TableHead>Proprietario</TableHead>
                  <TableHead>Garantidor</TableHead>
                  <TableHead className="text-right">Aluguel</TableHead>
                  <TableHead>Vigencia</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Pagamento</TableHead>
                  <TableHead className="text-right">Acoes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {contracts.map(contract => (
                  <TableRow key={contract.id}>
                    <TableCell>
                      <div>
                        <p className="font-mono font-semibold">{contract.id}</p>
                        {contract.nftTokenId && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Hash className="h-3 w-3" />
                            {contract.nftTokenId}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="max-w-[200px] truncate">{contract.propertyAddress}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{contract.tenantName}</p>
                        <p className="text-xs text-muted-foreground">{contract.tenantCpf}</p>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{contract.landlordName}</TableCell>
                    <TableCell>
                      {contract.guarantorName ? (
                        <div className="flex items-center gap-1">
                          <Shield className="h-4 w-4 text-emerald-600" />
                          <span>{contract.guarantorName}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-semibold">{formatCurrency(contract.rentAmount)}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>{contract.startDate.toLocaleDateString('pt-BR')}</p>
                        <p className="text-muted-foreground">ate {contract.endDate.toLocaleDateString('pt-BR')}</p>
                      </div>
                    </TableCell>
                    <TableCell>{getContractStatusBadge(contract.status)}</TableCell>
                    <TableCell>{getPaymentStatusBadge(contract.paymentStatus)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-1 justify-end">
                        <Button variant="ghost" size="sm" title="Ver detalhes" onClick={() => { setSelectedContract(contract); setModalMode('view'); }}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        {contract.blockchainHash && (
                          <Button variant="ghost" size="sm" title="Ver na blockchain" onClick={() => window.open(`https://polygonscan.com/tx/${contract.blockchainHash}`, '_blank')}>
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" title="Baixar PDF" onClick={() => alert(`Baixando PDF do contrato ${contract.id}...`)}>
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Modal de Detalhes do Contrato */}
        <Dialog open={!!selectedContract} onOpenChange={(open) => !open && setSelectedContract(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            {selectedContract && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <FileSignature className="h-5 w-5 text-indigo-600" />
                    Contrato {selectedContract.id}
                    {selectedContract.nftTokenId && <Badge variant="secondary" className="ml-2">NFT Mintado</Badge>}
                  </DialogTitle>
                  <DialogDescription>Detalhes completos do contrato de locacao</DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                  {/* Status e NFT */}
                  <div className="flex items-center gap-4">
                    {getContractStatusBadge(selectedContract.status)}
                    {getPaymentStatusBadge(selectedContract.paymentStatus)}
                    {selectedContract.nftTokenId && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Hash className="h-3 w-3" />
                        {selectedContract.nftTokenId}
                      </Badge>
                    )}
                  </div>

                  <Separator />

                  {/* Informacoes do Imovel */}
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2"><Building2 className="h-4 w-4" />Imovel</h4>
                    <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg">
                      <div><p className="text-sm text-muted-foreground">Endereco</p><p className="font-medium">{selectedContract.propertyAddress}</p></div>
                      <div><p className="text-sm text-muted-foreground">ID do Imovel</p><p className="font-mono">{selectedContract.propertyId}</p></div>
                    </div>
                  </div>

                  {/* Partes Envolvidas */}
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2"><Users className="h-4 w-4" />Partes Envolvidas</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm text-muted-foreground">Locatario</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="font-semibold">{selectedContract.tenantName}</p>
                          <p className="text-sm text-muted-foreground">{selectedContract.tenantCpf}</p>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm text-muted-foreground">Proprietario</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="font-semibold">{selectedContract.landlordName}</p>
                          <p className="text-sm text-muted-foreground">ID: {selectedContract.landlordId}</p>
                        </CardContent>
                      </Card>
                      {selectedContract.guarantorName && (
                        <Card className="border-emerald-200 bg-emerald-50">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm text-emerald-700 flex items-center gap-1"><Shield className="h-3 w-3" />Garantidor</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="font-semibold text-emerald-800">{selectedContract.guarantorName}</p>
                            <p className="text-sm text-emerald-600">ID: {selectedContract.guarantorId}</p>
                          </CardContent>
                        </Card>
                      )}
                      {selectedContract.insurerName && (
                        <Card className="border-blue-200 bg-blue-50">
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm text-blue-700 flex items-center gap-1"><ShieldCheck className="h-3 w-3" />Seguradora</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="font-semibold text-blue-400">{selectedContract.insurerName}</p>
                            <p className="text-sm text-blue-400">ID: {selectedContract.insurerId}</p>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </div>

                  {/* Valores e Datas */}
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2"><DollarSign className="h-4 w-4" />Valores e Vigencia</h4>
                    <div className="grid grid-cols-4 gap-4">
                      <div className="bg-emerald-50 p-4 rounded-lg text-center">
                        <p className="text-xs text-emerald-600">Aluguel Mensal</p>
                        <p className="text-xl font-bold text-emerald-700">{formatCurrency(selectedContract.rentAmount)}</p>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-lg text-center">
                        <p className="text-xs text-muted-foreground">Inicio</p>
                        <p className="font-semibold">{selectedContract.startDate.toLocaleDateString('pt-BR')}</p>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-lg text-center">
                        <p className="text-xs text-muted-foreground">Termino</p>
                        <p className="font-semibold">{selectedContract.endDate.toLocaleDateString('pt-BR')}</p>
                      </div>
                      <div className="bg-blue-50 p-4 rounded-lg text-center">
                        <p className="text-xs text-blue-400">Proximo Pagamento</p>
                        <p className="font-semibold text-blue-700">{selectedContract.nextPaymentDate?.toLocaleDateString('pt-BR') || '-'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Blockchain */}
                  {selectedContract.blockchainHash && (
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2"><Database className="h-4 w-4" />Registro Blockchain</h4>
                      <div className="bg-violet-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-violet-600">Hash da Transacao</p>
                            <p className="font-mono text-sm">{selectedContract.blockchainHash}</p>
                          </div>
                          <Button variant="outline" size="sm" onClick={() => window.open(`https://polygonscan.com/tx/${selectedContract.blockchainHash}`, '_blank')}>
                            <ExternalLink className="h-4 w-4 mr-2" />Ver no Explorer
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <DialogFooter className="gap-2">
                  <Button variant="outline" onClick={() => alert(`Baixando PDF do contrato ${selectedContract.id}...`)}>
                    <Download className="h-4 w-4 mr-2" />Baixar PDF
                  </Button>
                  <Button variant="outline" onClick={() => { setModalMode('edit'); }}>
                    <Edit3 className="h-4 w-4 mr-2" />Editar
                  </Button>
                  <Button onClick={() => setSelectedContract(null)}>Fechar</Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Modal de CADASTRO de Novo Contrato */}
        <Dialog open={newContractOpen} onOpenChange={setNewContractOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileSignature className="h-5 w-5 text-indigo-600" />
                Criar Novo Contrato
              </DialogTitle>
              <DialogDescription>Preencha os dados para criar um novo contrato de locacao (atendimento humano)</DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Imovel */}
              <div className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2"><Building2 className="h-4 w-4" />Imovel</h4>
                <div className="space-y-2">
                  <Label>Selecionar Imovel *</Label>
                  <Select value={newContractForm.propertyId} onValueChange={(v) => {
                    const prop = properties.find(p => p.id === v);
                    setNewContractForm({
                      ...newContractForm,
                      propertyId: v,
                      landlordId: prop?.ownerId || '',
                      rentAmount: prop?.rentAmount || 0
                    });
                  }}>
                    <SelectTrigger><SelectValue placeholder="Selecione um imovel disponivel" /></SelectTrigger>
                    <SelectContent>
                      {properties.filter(p => p.status === 'available').map(p => (
                        <SelectItem key={p.id} value={p.id}>{p.address} - {formatCurrency(p.rentAmount)}/mes</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">Imovel nao cadastrado? <button className="text-indigo-600 hover:underline" onClick={() => { setNewContractOpen(false); setNewPropertyOpen(true); }}>Cadastrar novo imovel</button></p>
                </div>
              </div>

              <Separator />

              {/* Locatario */}
              <div className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2"><Users className="h-4 w-4" />Locatario</h4>
                <div className="space-y-2">
                  <Label>Selecionar Locatario *</Label>
                  <Select value={newContractForm.tenantId} onValueChange={(v) => setNewContractForm({...newContractForm, tenantId: v})}>
                    <SelectTrigger><SelectValue placeholder="Selecione um locatario" /></SelectTrigger>
                    <SelectContent>
                      {tenants.filter(t => t.kycStatus === 'approved').map(t => (
                        <SelectItem key={t.id} value={t.id}>{t.fullName} ({t.cpf})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">Locatario nao cadastrado? <button className="text-indigo-600 hover:underline" onClick={() => { setNewContractOpen(false); setNewTenantOpen(true); }}>Cadastrar novo locatario</button></p>
                </div>
              </div>

              <Separator />

              {/* Garantidor */}
              <div className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2"><Shield className="h-4 w-4" />Garantidor (Opcional)</h4>
                <div className="space-y-2">
                  <Label>Selecionar Garantidor</Label>
                  <Select value={newContractForm.guarantorId} onValueChange={(v) => setNewContractForm({...newContractForm, guarantorId: v})}>
                    <SelectTrigger><SelectValue placeholder="Selecione um garantidor (opcional)" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Nenhum garantidor</SelectItem>
                      {guarantors.filter(g => g.status === 'active').map(g => (
                        <SelectItem key={g.id} value={g.id}>{g.fullName} - {formatCurrency(g.tokenizedValue)} tokenizado</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">Garantidor nao cadastrado? <button className="text-indigo-600 hover:underline" onClick={() => { setNewContractOpen(false); setNewGuarantorOpen(true); }}>Cadastrar novo garantidor</button></p>
                </div>
              </div>

              <Separator />

              {/* Seguradora */}
              <div className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2"><ShieldCheck className="h-4 w-4" />Seguradora</h4>
                <div className="space-y-2">
                  <Label>Selecionar Seguradora *</Label>
                  <Select value={newContractForm.insurerId} onValueChange={(v) => setNewContractForm({...newContractForm, insurerId: v})}>
                    <SelectTrigger><SelectValue placeholder="Selecione a seguradora" /></SelectTrigger>
                    <SelectContent>
                      {insurers.filter(i => i.status === 'active').map(i => (
                        <SelectItem key={i.id} value={i.id}>{i.name} - {i.commissionRate}% comissao</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              {/* Valores e Datas */}
              <div className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2"><DollarSign className="h-4 w-4" />Valores e Periodo</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Valor Aluguel (R$) *</Label>
                    <Input
                      type="number"
                      min={0}
                      value={newContractForm.rentAmount || ''}
                      onChange={(e) => setNewContractForm({...newContractForm, rentAmount: Number(e.target.value)})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Data Inicio *</Label>
                    <Input
                      type="date"
                      value={newContractForm.startDate}
                      onChange={(e) => setNewContractForm({...newContractForm, startDate: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Data Fim *</Label>
                    <Input
                      type="date"
                      value={newContractForm.endDate}
                      onChange={(e) => setNewContractForm({...newContractForm, endDate: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              {/* Resumo do Split */}
              {newContractForm.rentAmount > 0 && (
                <div className="bg-slate-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-3">Distribuicao do Aluguel (Split 85/5/5/5)</h4>
                  <div className="grid grid-cols-4 gap-4 text-center">
                    <div>
                      <p className="text-xs text-muted-foreground">Proprietario</p>
                      <p className="text-lg font-bold text-emerald-600">{formatCurrency(newContractForm.rentAmount * 0.85)}</p>
                      <p className="text-xs text-muted-foreground">85%</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Seguradora</p>
                      <p className="text-lg font-bold text-blue-600">{formatCurrency(newContractForm.rentAmount * 0.05)}</p>
                      <p className="text-xs text-muted-foreground">5%</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Plataforma</p>
                      <p className="text-lg font-bold text-violet-600">{formatCurrency(newContractForm.rentAmount * 0.05)}</p>
                      <p className="text-xs text-muted-foreground">5%</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Garantidor</p>
                      <p className="text-lg font-bold text-amber-600">{formatCurrency(newContractForm.rentAmount * 0.05)}</p>
                      <p className="text-xs text-muted-foreground">5%</p>
                    </div>
                  </div>
                </div>
              )}

              <Alert className="bg-indigo-50 border-indigo-200">
                <FileSignature className="h-4 w-4 text-indigo-600" />
                <AlertTitle className="text-indigo-800">Proximas Etapas</AlertTitle>
                <AlertDescription className="text-indigo-700">
                  Apos criar o contrato, todas as partes receberao um link para assinatura digital. O contrato sera mintado como NFT na blockchain apos todas as assinaturas.
                </AlertDescription>
              </Alert>
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setNewContractOpen(false)}>Cancelar</Button>
              <Button
                className="bg-indigo-600 hover:bg-indigo-700"
                onClick={() => {
                  if (!newContractForm.propertyId || !newContractForm.tenantId || !newContractForm.insurerId || !newContractForm.rentAmount || !newContractForm.startDate || !newContractForm.endDate) {
                    alert('Preencha todos os campos obrigatorios (*)');
                    return;
                  }
                  const prop = properties.find(p => p.id === newContractForm.propertyId);
                  const tenant = tenants.find(t => t.id === newContractForm.tenantId);
                  const insurer = insurers.find(i => i.id === newContractForm.insurerId);
                  alert(`Contrato criado com sucesso!\n\nImovel: ${prop?.address}\nLocatario: ${tenant?.fullName}\nSeguradora: ${insurer?.name}\nAluguel: ${formatCurrency(newContractForm.rentAmount)}/mes\n\nPeriodo: ${newContractForm.startDate} a ${newContractForm.endDate}\n\nLinks de assinatura foram enviados para todas as partes.`);
                  setNewContractOpen(false);
                  setNewContractForm({
                    propertyId: '', tenantId: '', landlordId: '', guarantorId: '', insurerId: '',
                    rentAmount: 0, startDate: '', endDate: '',
                  });
                }}
              >
                <Save className="h-4 w-4 mr-2" />
                Criar Contrato
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  };

  // ============= MODULO: IMOVEIS =============
  const renderProperties = () => {
    const getPropertyStatusBadge = (status: Property['status']) => {
      const styles = {
        available: 'bg-emerald-500/10 text-green-700',
        rented: 'bg-blue-500/10 text-blue-700',
        maintenance: 'bg-amber-100 text-amber-700',
        inactive: 'bg-card text-muted-foreground',
      };
      const labels = {
        available: 'Disponivel',
        rented: 'Alugado',
        maintenance: 'Em Manutencao',
        inactive: 'Inativo',
      };
      return <Badge className={styles[status]}>{labels[status]}</Badge>;
    };

    const getPropertyTypeLabel = (type: Property['propertyType']) => {
      const labels = {
        apartment: 'Apartamento',
        house: 'Casa',
        commercial: 'Comercial',
        land: 'Terreno',
      };
      return labels[type];
    };

    const rentedProperties = properties.filter(p => p.status === 'rented');
    const availableProperties = properties.filter(p => p.status === 'available');
    const tokenizedProperties = properties.filter(p => p.tokenizedValue);
    const totalTokenizedValue = tokenizedProperties.reduce((sum, p) => sum + (p.tokenizedValue || 0), 0);

    return (
      <div className="space-y-6">
        {/* Metricas de Imoveis */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Imoveis</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{properties.length}</div>
              <p className="text-xs text-muted-foreground">Cadastrados na plataforma</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-400">Alugados</CardTitle>
              <Users className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-700">{rentedProperties.length}</div>
              <Progress value={(rentedProperties.length / properties.length) * 100} className="mt-2 h-2" />
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-emerald-400">Disponiveis</CardTitle>
              <Home className="h-4 w-4 text-emerald-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-700">{availableProperties.length}</div>
              <p className="text-xs text-emerald-400">Prontos para locacao</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-violet-50 to-purple-50 border-violet-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-violet-800">Valor Tokenizado</CardTitle>
              <Database className="h-4 w-4 text-violet-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-violet-700">{formatCurrency(totalTokenizedValue)}</div>
              <p className="text-xs text-violet-600">{tokenizedProperties.length} imoveis tokenizados</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabela de Imoveis */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Gestao de Imoveis
                </CardTitle>
                <CardDescription>Cadastro e controle de propriedades</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => alert("Funcionalidade de filtros em desenvolvimento")}>
                  <Filter className="h-4 w-4 mr-2" />
                  Filtrar
                </Button>
                <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700" onClick={() => setNewPropertyOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Imovel
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table className="min-w-[800px]">
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Endereco</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Caracteristicas</TableHead>
                  <TableHead>Proprietario</TableHead>
                  <TableHead className="text-right">Aluguel</TableHead>
                  <TableHead className="text-right">Valor Token</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Acoes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {properties.map(property => (
                  <TableRow key={property.id}>
                    <TableCell>
                      <div>
                        <p className="font-mono font-semibold">{property.id}</p>
                        {property.nftTokenId && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Hash className="h-3 w-3" />
                            {property.nftTokenId}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium max-w-[200px] truncate">{property.address}</p>
                        <p className="text-xs text-muted-foreground">{property.neighborhood}, {property.city}</p>
                      </div>
                    </TableCell>
                    <TableCell>{getPropertyTypeLabel(property.propertyType)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1"><Bed className="h-4 w-4" />{property.bedrooms}</span>
                        <span className="flex items-center gap-1"><Bath className="h-4 w-4" />{property.bathrooms}</span>
                        <span className="flex items-center gap-1"><Square className="h-4 w-4" />{property.area}m²</span>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{property.ownerName}</TableCell>
                    <TableCell className="text-right font-semibold">{formatCurrency(property.rentAmount)}</TableCell>
                    <TableCell className="text-right">
                      {property.tokenizedValue ? (
                        <span className="font-semibold text-violet-600">{formatCurrency(property.tokenizedValue)}</span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>{getPropertyStatusBadge(property.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-1 justify-end">
                        <Button variant="ghost" size="sm" title="Ver detalhes" onClick={() => { setSelectedProperty(property); setModalMode('view'); }}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" title="Editar" onClick={() => { setSelectedProperty(property); setModalMode('edit'); }}>
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" title="Vistoria" onClick={() => alert(`Abrindo vistoria do imovel ${property.id}...`)}>
                          <Camera className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Modal de Detalhes do Imovel */}
        <Dialog open={!!selectedProperty} onOpenChange={(open) => !open && setSelectedProperty(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            {selectedProperty && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-indigo-600" />
                    Imovel {selectedProperty.id}
                    {selectedProperty.nftTokenId && <Badge variant="secondary" className="ml-2">Tokenizado</Badge>}
                  </DialogTitle>
                  <DialogDescription>{selectedProperty.address}</DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                  {/* Status */}
                  <div className="flex items-center gap-4">
                    {getPropertyStatusBadge(selectedProperty.status)}
                    <Badge variant="outline">{getPropertyTypeLabel(selectedProperty.propertyType)}</Badge>
                    {selectedProperty.nftTokenId && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Hash className="h-3 w-3" />
                        {selectedProperty.nftTokenId}
                      </Badge>
                    )}
                  </div>

                  <Separator />

                  {/* Localizacao */}
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2"><MapPin className="h-4 w-4" />Localizacao</h4>
                    <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg">
                      <div><p className="text-sm text-muted-foreground">Endereco</p><p className="font-medium">{selectedProperty.address}</p></div>
                      <div><p className="text-sm text-muted-foreground">Bairro</p><p className="font-medium">{selectedProperty.neighborhood}</p></div>
                      <div><p className="text-sm text-muted-foreground">Cidade/Estado</p><p className="font-medium">{selectedProperty.city} - {selectedProperty.state}</p></div>
                      <div><p className="text-sm text-muted-foreground">CEP</p><p className="font-mono">{selectedProperty.zipCode}</p></div>
                    </div>
                  </div>

                  {/* Caracteristicas */}
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2"><Home className="h-4 w-4" />Caracteristicas</h4>
                    <div className="grid grid-cols-4 gap-4">
                      <div className="bg-blue-50 p-4 rounded-lg text-center">
                        <Bed className="h-6 w-6 mx-auto text-blue-400 mb-1" />
                        <p className="text-2xl font-bold text-blue-700">{selectedProperty.bedrooms}</p>
                        <p className="text-xs text-blue-400">Quartos</p>
                      </div>
                      <div className="bg-cyan-50 p-4 rounded-lg text-center">
                        <Bath className="h-6 w-6 mx-auto text-cyan-600 mb-1" />
                        <p className="text-2xl font-bold text-cyan-700">{selectedProperty.bathrooms}</p>
                        <p className="text-xs text-cyan-600">Banheiros</p>
                      </div>
                      <div className="bg-amber-50 p-4 rounded-lg text-center">
                        <Square className="h-6 w-6 mx-auto text-amber-600 mb-1" />
                        <p className="text-2xl font-bold text-amber-700">{selectedProperty.area}m²</p>
                        <p className="text-xs text-amber-600">Area</p>
                      </div>
                      <div className="bg-card p-4 rounded-lg text-center">
                        <Building2 className="h-6 w-6 mx-auto text-muted-foreground mb-1" />
                        <p className="text-2xl font-bold text-muted-foreground">{selectedProperty.parkingSpaces}</p>
                        <p className="text-xs text-muted-foreground">Vagas</p>
                      </div>
                    </div>
                  </div>

                  {/* Valores */}
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2"><DollarSign className="h-4 w-4" />Valores</h4>
                    <div className="grid grid-cols-4 gap-4">
                      <div className="bg-emerald-50 p-4 rounded-lg text-center">
                        <p className="text-xs text-emerald-600">Aluguel</p>
                        <p className="text-xl font-bold text-emerald-700">{formatCurrency(selectedProperty.rentAmount)}</p>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-lg text-center">
                        <p className="text-xs text-muted-foreground">Condominio</p>
                        <p className="font-semibold">{formatCurrency(selectedProperty.condoFees)}</p>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-lg text-center">
                        <p className="text-xs text-muted-foreground">IPTU</p>
                        <p className="font-semibold">{formatCurrency(selectedProperty.iptuAmount)}</p>
                      </div>
                      {selectedProperty.tokenizedValue && (
                        <div className="bg-violet-50 p-4 rounded-lg text-center">
                          <p className="text-xs text-violet-600">Valor Tokenizado</p>
                          <p className="text-xl font-bold text-violet-700">{formatCurrency(selectedProperty.tokenizedValue)}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Proprietario */}
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2"><Users className="h-4 w-4" />Proprietario</h4>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold">{selectedProperty.ownerName}</p>
                            <p className="text-sm text-muted-foreground">ID: {selectedProperty.ownerId}</p>
                          </div>
                          <Button variant="outline" size="sm" onClick={() => alert(`Ver proprietario ${selectedProperty.ownerId}`)}>
                            <Eye className="h-4 w-4 mr-2" />Ver Perfil
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Vistoria */}
                  {selectedProperty.lastInspectionDate && (
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2"><Camera className="h-4 w-4" />Ultima Vistoria</h4>
                      <div className="bg-blue-50 p-4 rounded-lg flex items-center justify-between">
                        <div>
                          <p className="font-medium">{selectedProperty.lastInspectionDate.toLocaleDateString('pt-BR')}</p>
                          <p className="text-sm text-blue-400">{selectedProperty.photos?.length || 0} fotos registradas</p>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => alert('Abrindo galeria de vistoria...')}>
                          <Camera className="h-4 w-4 mr-2" />Ver Fotos
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                <DialogFooter className="gap-2">
                  <Button variant="outline" onClick={() => alert('Abrindo vistoria...')}>
                    <Camera className="h-4 w-4 mr-2" />Nova Vistoria
                  </Button>
                  <Button variant="outline" onClick={() => setModalMode('edit')}>
                    <Edit3 className="h-4 w-4 mr-2" />Editar
                  </Button>
                  <Button onClick={() => setSelectedProperty(null)}>Fechar</Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Modal de CADASTRO de Novo Imovel */}
        <Dialog open={newPropertyOpen} onOpenChange={setNewPropertyOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-indigo-600" />
                Cadastrar Novo Imovel
              </DialogTitle>
              <DialogDescription>Preencha os dados do imovel para cadastro manual (atendimento humano)</DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Endereco */}
              <div className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2"><MapPin className="h-4 w-4" />Localizacao</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 space-y-2">
                    <Label>Endereco Completo *</Label>
                    <Input
                      placeholder="Ex: Av. Paulista, 1000 - Apto 402"
                      value={newPropertyForm.address}
                      onChange={(e) => setNewPropertyForm({...newPropertyForm, address: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Bairro *</Label>
                    <Input
                      placeholder="Ex: Bela Vista"
                      value={newPropertyForm.neighborhood}
                      onChange={(e) => setNewPropertyForm({...newPropertyForm, neighborhood: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Cidade *</Label>
                    <Input
                      placeholder="Ex: Sao Paulo"
                      value={newPropertyForm.city}
                      onChange={(e) => setNewPropertyForm({...newPropertyForm, city: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Estado</Label>
                    <Select value={newPropertyForm.state} onValueChange={(v) => setNewPropertyForm({...newPropertyForm, state: v})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SP">Sao Paulo</SelectItem>
                        <SelectItem value="RJ">Rio de Janeiro</SelectItem>
                        <SelectItem value="MG">Minas Gerais</SelectItem>
                        <SelectItem value="PR">Parana</SelectItem>
                        <SelectItem value="SC">Santa Catarina</SelectItem>
                        <SelectItem value="RS">Rio Grande do Sul</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>CEP</Label>
                    <Input
                      placeholder="00000-000"
                      value={newPropertyForm.zipCode}
                      onChange={(e) => setNewPropertyForm({...newPropertyForm, zipCode: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Caracteristicas */}
              <div className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2"><Home className="h-4 w-4" />Caracteristicas</h4>
                <div className="grid grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>Tipo de Imovel</Label>
                    <Select value={newPropertyForm.propertyType} onValueChange={(v) => setNewPropertyForm({...newPropertyForm, propertyType: v as Property['propertyType']})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="apartment">Apartamento</SelectItem>
                        <SelectItem value="house">Casa</SelectItem>
                        <SelectItem value="commercial">Comercial</SelectItem>
                        <SelectItem value="land">Terreno</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Quartos</Label>
                    <Input
                      type="number"
                      min={0}
                      value={newPropertyForm.bedrooms}
                      onChange={(e) => setNewPropertyForm({...newPropertyForm, bedrooms: Number(e.target.value)})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Banheiros</Label>
                    <Input
                      type="number"
                      min={0}
                      value={newPropertyForm.bathrooms}
                      onChange={(e) => setNewPropertyForm({...newPropertyForm, bathrooms: Number(e.target.value)})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Area (m²)</Label>
                    <Input
                      type="number"
                      min={0}
                      value={newPropertyForm.area}
                      onChange={(e) => setNewPropertyForm({...newPropertyForm, area: Number(e.target.value)})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Vagas Garagem</Label>
                    <Input
                      type="number"
                      min={0}
                      value={newPropertyForm.parkingSpaces}
                      onChange={(e) => setNewPropertyForm({...newPropertyForm, parkingSpaces: Number(e.target.value)})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Matricula</Label>
                    <Input
                      placeholder="MAT-000000"
                      value={newPropertyForm.registrationNumber}
                      onChange={(e) => setNewPropertyForm({...newPropertyForm, registrationNumber: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Valores */}
              <div className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2"><DollarSign className="h-4 w-4" />Valores</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Valor Aluguel (R$) *</Label>
                    <Input
                      type="number"
                      min={0}
                      placeholder="0,00"
                      value={newPropertyForm.rentAmount || ''}
                      onChange={(e) => setNewPropertyForm({...newPropertyForm, rentAmount: Number(e.target.value)})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Condominio (R$)</Label>
                    <Input
                      type="number"
                      min={0}
                      placeholder="0,00"
                      value={newPropertyForm.condoFees || ''}
                      onChange={(e) => setNewPropertyForm({...newPropertyForm, condoFees: Number(e.target.value)})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>IPTU Mensal (R$)</Label>
                    <Input
                      type="number"
                      min={0}
                      placeholder="0,00"
                      value={newPropertyForm.iptuAmount || ''}
                      onChange={(e) => setNewPropertyForm({...newPropertyForm, iptuAmount: Number(e.target.value)})}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Proprietario */}
              <div className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2"><Users className="h-4 w-4" />Proprietario</h4>
                <div className="space-y-2">
                  <Label>Selecionar Proprietario *</Label>
                  <Select value={newPropertyForm.ownerId} onValueChange={(v) => setNewPropertyForm({...newPropertyForm, ownerId: v})}>
                    <SelectTrigger><SelectValue placeholder="Selecione um proprietario cadastrado" /></SelectTrigger>
                    <SelectContent>
                      {landlords.map(l => (
                        <SelectItem key={l.id} value={l.id}>{l.fullName} ({l.cpfCnpj})</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">Proprietario nao cadastrado? <button className="text-indigo-600 hover:underline" onClick={() => { setNewPropertyOpen(false); setNewLandlordOpen(true); }}>Cadastrar novo proprietario</button></p>
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setNewPropertyOpen(false)}>Cancelar</Button>
              <Button
                className="bg-indigo-600 hover:bg-indigo-700"
                onClick={() => {
                  if (!newPropertyForm.address || !newPropertyForm.neighborhood || !newPropertyForm.city || !newPropertyForm.ownerId || !newPropertyForm.rentAmount) {
                    alert('Preencha todos os campos obrigatorios (*)');
                    return;
                  }
                  alert(`Imovel cadastrado com sucesso!\n\nEndereco: ${newPropertyForm.address}\nProprietario: ${landlords.find(l => l.id === newPropertyForm.ownerId)?.fullName}\nAluguel: R$ ${newPropertyForm.rentAmount.toLocaleString('pt-BR')}`);
                  setNewPropertyOpen(false);
                  setNewPropertyForm({
                    address: '', neighborhood: '', city: '', state: 'SP', zipCode: '',
                    propertyType: 'apartment', bedrooms: 2, bathrooms: 1, area: 50, parkingSpaces: 1,
                    rentAmount: 0, condoFees: 0, iptuAmount: 0, ownerId: '', registrationNumber: '',
                  });
                }}
              >
                <Save className="h-4 w-4 mr-2" />
                Cadastrar Imovel
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  };

  // ============= MODULO: LOCATARIOS =============
  const renderTenants = () => {
    const getKycStatusBadge = (status: Tenant['kycStatus']) => {
      const styles = {
        pending: 'bg-amber-100 text-amber-700',
        approved: 'bg-emerald-500/10 text-green-700',
        rejected: 'bg-red-500/10 text-red-700',
        expired: 'bg-card text-muted-foreground',
      };
      const labels = {
        pending: 'Pendente',
        approved: 'Aprovado',
        rejected: 'Rejeitado',
        expired: 'Expirado',
      };
      return <Badge className={styles[status]}>{labels[status]}</Badge>;
    };

    const getPaymentHistoryBadge = (history: Tenant['paymentHistory']) => {
      const styles = {
        excellent: 'bg-emerald-100 text-emerald-700',
        good: 'bg-emerald-500/10 text-green-700',
        regular: 'bg-amber-100 text-amber-700',
        poor: 'bg-red-500/10 text-red-700',
      };
      const labels = {
        excellent: 'Excelente',
        good: 'Bom',
        regular: 'Regular',
        poor: 'Ruim',
      };
      return <Badge className={styles[history]}>{labels[history]}</Badge>;
    };

    const approvedTenants = tenants.filter(t => t.kycStatus === 'approved');
    const pendingKycTenants = tenants.filter(t => t.kycStatus === 'pending');
    const activeTenants = tenants.filter(t => t.activeContractsCount > 0);
    const totalRentPaid = tenants.reduce((sum, t) => sum + t.totalRentPaid, 0);

    return (
      <div className="space-y-6">
        {/* Metricas de Locatarios */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Locatarios</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tenants.length}</div>
              <p className="text-xs text-muted-foreground">Cadastrados</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-emerald-400">KYC Aprovado</CardTitle>
              <UserCheck className="h-4 w-4 text-emerald-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-700">{approvedTenants.length}</div>
              <p className="text-xs text-emerald-400">Verificados</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-amber-800">KYC Pendente</CardTitle>
              <Fingerprint className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-700">{pendingKycTenants.length}</div>
              <p className="text-xs text-amber-600">Aguardando verificacao</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-400">Total Pago</CardTitle>
              <DollarSign className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-700">{formatCurrency(totalRentPaid)}</div>
              <p className="text-xs text-blue-400">Alugueis recebidos</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabela de Locatarios */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Locatarios
                </CardTitle>
                <CardDescription>Gestao de inquilinos e seus contratos</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => alert("Funcionalidade de filtros em desenvolvimento")}>
                  <Filter className="h-4 w-4 mr-2" />
                  Filtrar
                </Button>
                <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700" onClick={() => setNewTenantOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Locatario
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table className="min-w-[800px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>CPF</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Ocupacao</TableHead>
                  <TableHead className="text-right">Renda</TableHead>
                  <TableHead className="text-center">Credit Score</TableHead>
                  <TableHead className="text-center">Trust Score</TableHead>
                  <TableHead>KYC</TableHead>
                  <TableHead>Historico</TableHead>
                  <TableHead className="text-right">Acoes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tenants.map(tenant => (
                  <TableRow key={tenant.id}>
                    <TableCell>
                      <div>
                        <p className="font-semibold">{tenant.fullName}</p>
                        {tenant.walletAddress && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Wallet className="h-3 w-3" />
                            {tenant.walletAddress}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{tenant.cpf}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>{tenant.email}</p>
                        <p className="text-muted-foreground">{tenant.phone}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>{tenant.occupation}</p>
                        {tenant.employer && <p className="text-muted-foreground">{tenant.employer}</p>}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-semibold">{formatCurrency(tenant.monthlyIncome)}</TableCell>
                    <TableCell className="text-center">
                      <div className={cn("inline-flex items-center justify-center w-12 h-8 rounded-full text-sm font-bold", tenant.creditScore >= 800 ? 'bg-emerald-100 text-emerald-700' : tenant.creditScore >= 700 ? 'bg-emerald-500/10 text-green-700' : tenant.creditScore >= 600 ? 'bg-amber-100 text-amber-700' : 'bg-red-500/10 text-red-700')}>
                        {tenant.creditScore}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className={cn("inline-flex items-center justify-center w-12 h-8 rounded-full text-sm font-bold", tenant.trustScore >= 90 ? 'bg-emerald-100 text-emerald-700' : tenant.trustScore >= 70 ? 'bg-emerald-500/10 text-green-700' : tenant.trustScore >= 50 ? 'bg-amber-100 text-amber-700' : 'bg-red-500/10 text-red-700')}>
                        {tenant.trustScore}
                      </div>
                    </TableCell>
                    <TableCell>{getKycStatusBadge(tenant.kycStatus)}</TableCell>
                    <TableCell>{getPaymentHistoryBadge(tenant.paymentHistory)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-1 justify-end">
                        <Button variant="ghost" size="sm" title="Ver detalhes" onClick={() => { setSelectedTenant(tenant); setModalMode('view'); }}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" title="Editar" onClick={() => { setSelectedTenant(tenant); setModalMode('edit'); }}>
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        {tenant.kycStatus === 'pending' && (
                          <Button variant="ghost" size="sm" title="Aprovar KYC" className="text-emerald-400" onClick={() => alert(`Aprovando KYC do locatario ${tenant.fullName}...`)}>
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Modal de Detalhes do Locatario */}
        <Dialog open={!!selectedTenant} onOpenChange={(open) => !open && setSelectedTenant(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            {selectedTenant && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-indigo-600" />
                    {selectedTenant.fullName}
                  </DialogTitle>
                  <DialogDescription>Detalhes do locatario</DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                  {/* Status e Badges */}
                  <div className="flex items-center gap-4">
                    {getKycStatusBadge(selectedTenant.kycStatus)}
                    {getPaymentHistoryBadge(selectedTenant.paymentHistory)}
                    {selectedTenant.walletAddress && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Wallet className="h-3 w-3" />
                        Carteira Conectada
                      </Badge>
                    )}
                  </div>

                  <Separator />

                  {/* Informacoes Pessoais */}
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2"><Users className="h-4 w-4" />Informacoes Pessoais</h4>
                    <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg">
                      <div><p className="text-sm text-muted-foreground">Nome Completo</p><p className="font-medium">{selectedTenant.fullName}</p></div>
                      <div><p className="text-sm text-muted-foreground">CPF</p><p className="font-mono">{selectedTenant.cpf}</p></div>
                      <div><p className="text-sm text-muted-foreground">E-mail</p><p className="font-medium">{selectedTenant.email}</p></div>
                      <div><p className="text-sm text-muted-foreground">Telefone</p><p className="font-medium">{selectedTenant.phone}</p></div>
                    </div>
                  </div>

                  {/* Informacoes Profissionais */}
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2"><Briefcase className="h-4 w-4" />Informacoes Profissionais</h4>
                    <div className="grid grid-cols-3 gap-4 bg-slate-50 p-4 rounded-lg">
                      <div><p className="text-sm text-muted-foreground">Ocupacao</p><p className="font-medium">{selectedTenant.occupation}</p></div>
                      {selectedTenant.employer && <div><p className="text-sm text-muted-foreground">Empregador</p><p className="font-medium">{selectedTenant.employer}</p></div>}
                      <div><p className="text-sm text-muted-foreground">Renda Mensal</p><p className="font-semibold text-emerald-600">{formatCurrency(selectedTenant.monthlyIncome)}</p></div>
                    </div>
                  </div>

                  {/* Scores */}
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2"><Target className="h-4 w-4" />Scores e Avaliacao</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className={cn("p-4 rounded-lg text-center", selectedTenant.creditScore >= 800 ? 'bg-emerald-50' : selectedTenant.creditScore >= 700 ? 'bg-green-50' : selectedTenant.creditScore >= 600 ? 'bg-amber-50' : 'bg-red-50')}>
                        <p className="text-xs text-muted-foreground">Credit Score</p>
                        <p className={cn("text-3xl font-bold", selectedTenant.creditScore >= 800 ? 'text-emerald-700' : selectedTenant.creditScore >= 700 ? 'text-green-700' : selectedTenant.creditScore >= 600 ? 'text-amber-700' : 'text-red-700')}>{selectedTenant.creditScore}</p>
                        <p className="text-xs">{selectedTenant.creditScore >= 800 ? 'Excelente' : selectedTenant.creditScore >= 700 ? 'Bom' : selectedTenant.creditScore >= 600 ? 'Regular' : 'Baixo'}</p>
                      </div>
                      <div className={cn("p-4 rounded-lg text-center", selectedTenant.trustScore >= 90 ? 'bg-emerald-50' : selectedTenant.trustScore >= 70 ? 'bg-green-50' : selectedTenant.trustScore >= 50 ? 'bg-amber-50' : 'bg-red-50')}>
                        <p className="text-xs text-muted-foreground">Trust Score</p>
                        <p className={cn("text-3xl font-bold", selectedTenant.trustScore >= 90 ? 'text-emerald-700' : selectedTenant.trustScore >= 70 ? 'text-green-700' : selectedTenant.trustScore >= 50 ? 'text-amber-700' : 'text-red-700')}>{selectedTenant.trustScore}</p>
                        <p className="text-xs">{selectedTenant.trustScore >= 90 ? 'Muito Confiavel' : selectedTenant.trustScore >= 70 ? 'Confiavel' : selectedTenant.trustScore >= 50 ? 'Moderado' : 'Em Analise'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Historico Financeiro */}
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2"><DollarSign className="h-4 w-4" />Historico Financeiro</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-blue-50 p-4 rounded-lg text-center">
                        <p className="text-xs text-blue-400">Contratos Ativos</p>
                        <p className="text-2xl font-bold text-blue-700">{selectedTenant.activeContractsCount}</p>
                      </div>
                      <div className="bg-emerald-50 p-4 rounded-lg text-center">
                        <p className="text-xs text-emerald-600">Total Pago em Alugueis</p>
                        <p className="text-xl font-bold text-emerald-700">{formatCurrency(selectedTenant.totalRentPaid)}</p>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-lg text-center">
                        <p className="text-xs text-muted-foreground">Cadastrado em</p>
                        <p className="font-semibold">{selectedTenant.createdAt.toLocaleDateString('pt-BR')}</p>
                      </div>
                    </div>
                  </div>

                  {/* Wallet */}
                  {selectedTenant.walletAddress && (
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2"><Wallet className="h-4 w-4" />Carteira Digital</h4>
                      <div className="bg-violet-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-violet-600">Endereco da Carteira</p>
                            <p className="font-mono text-sm">{selectedTenant.walletAddress}</p>
                          </div>
                          <Button variant="outline" size="sm" onClick={() => window.open(`https://polygonscan.com/address/${selectedTenant.walletAddress}`, '_blank')}>
                            <ExternalLink className="h-4 w-4 mr-2" />Ver no Explorer
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* KYC */}
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2"><Fingerprint className="h-4 w-4" />Status KYC</h4>
                    <Card className={cn(selectedTenant.kycStatus === 'approved' ? 'border-green-200 bg-green-50' : selectedTenant.kycStatus === 'pending' ? 'border-amber-200 bg-amber-50' : 'border-red-200 bg-red-50')}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            {getKycStatusBadge(selectedTenant.kycStatus)}
                            {selectedTenant.kycVerifiedAt && <p className="text-sm mt-1">Verificado em: {selectedTenant.kycVerifiedAt.toLocaleDateString('pt-BR')}</p>}
                          </div>
                          {selectedTenant.kycStatus === 'pending' && (
                            <Button className="bg-green-600 hover:bg-green-700" onClick={() => alert(`Aprovando KYC de ${selectedTenant.fullName}...`)}>
                              <CheckCircle className="h-4 w-4 mr-2" />Aprovar KYC
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <DialogFooter className="gap-2">
                  {selectedTenant.kycStatus === 'pending' && (
                    <Button variant="outline" className="text-emerald-400 border-green-600" onClick={() => alert(`Aprovando KYC...`)}>
                      <CheckCircle className="h-4 w-4 mr-2" />Aprovar KYC
                    </Button>
                  )}
                  <Button variant="outline" onClick={() => setModalMode('edit')}>
                    <Edit3 className="h-4 w-4 mr-2" />Editar
                  </Button>
                  <Button onClick={() => setSelectedTenant(null)}>Fechar</Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Modal de CADASTRO de Novo Locatario */}
        <Dialog open={newTenantOpen} onOpenChange={setNewTenantOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-indigo-600" />
                Cadastrar Novo Locatario
              </DialogTitle>
              <DialogDescription>Preencha os dados do locatario para cadastro manual (atendimento humano)</DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Dados Pessoais */}
              <div className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2"><UserCheck className="h-4 w-4" />Dados Pessoais</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 space-y-2">
                    <Label>Nome Completo *</Label>
                    <Input
                      placeholder="Ex: Carlos Silva Santos"
                      value={newTenantForm.fullName}
                      onChange={(e) => setNewTenantForm({...newTenantForm, fullName: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>CPF *</Label>
                    <Input
                      placeholder="000.000.000-00"
                      value={newTenantForm.cpf}
                      onChange={(e) => setNewTenantForm({...newTenantForm, cpf: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email *</Label>
                    <Input
                      type="email"
                      placeholder="email@exemplo.com"
                      value={newTenantForm.email}
                      onChange={(e) => setNewTenantForm({...newTenantForm, email: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Telefone *</Label>
                    <Input
                      placeholder="(11) 99999-9999"
                      value={newTenantForm.phone}
                      onChange={(e) => setNewTenantForm({...newTenantForm, phone: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Dados Profissionais */}
              <div className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2"><Briefcase className="h-4 w-4" />Dados Profissionais</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Ocupacao/Profissao *</Label>
                    <Input
                      placeholder="Ex: Engenheiro de Software"
                      value={newTenantForm.occupation}
                      onChange={(e) => setNewTenantForm({...newTenantForm, occupation: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Renda Mensal (R$) *</Label>
                    <Input
                      type="number"
                      min={0}
                      placeholder="0,00"
                      value={newTenantForm.monthlyIncome || ''}
                      onChange={(e) => setNewTenantForm({...newTenantForm, monthlyIncome: Number(e.target.value)})}
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label>Empresa/Empregador</Label>
                    <Input
                      placeholder="Ex: Tech Corp"
                      value={newTenantForm.employer}
                      onChange={(e) => setNewTenantForm({...newTenantForm, employer: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Verificacao KYC</AlertTitle>
                <AlertDescription>
                  Apos o cadastro, o locatario recebera um link por email para completar a verificacao de identidade (KYC) obrigatoria.
                </AlertDescription>
              </Alert>
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setNewTenantOpen(false)}>Cancelar</Button>
              <Button
                className="bg-indigo-600 hover:bg-indigo-700"
                onClick={() => {
                  if (!newTenantForm.fullName || !newTenantForm.cpf || !newTenantForm.email || !newTenantForm.phone || !newTenantForm.occupation || !newTenantForm.monthlyIncome) {
                    alert('Preencha todos os campos obrigatorios (*)');
                    return;
                  }
                  alert(`Locatario cadastrado com sucesso!\n\nNome: ${newTenantForm.fullName}\nCPF: ${newTenantForm.cpf}\nEmail: ${newTenantForm.email}\n\nUm link de verificacao KYC foi enviado para o email informado.`);
                  setNewTenantOpen(false);
                  setNewTenantForm({
                    fullName: '', cpf: '', email: '', phone: '',
                    occupation: '', monthlyIncome: 0, employer: '',
                  });
                }}
              >
                <Save className="h-4 w-4 mr-2" />
                Cadastrar Locatario
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  };

  // ============= MODULO: PROPRIETARIOS =============
  const renderLandlords = () => {
    const getKycStatusBadge = (status: Landlord['kycStatus']) => {
      const styles = {
        pending: 'bg-amber-100 text-amber-700',
        approved: 'bg-emerald-500/10 text-green-700',
        rejected: 'bg-red-500/10 text-red-700',
      };
      const labels = {
        pending: 'Pendente',
        approved: 'Aprovado',
        rejected: 'Rejeitado',
      };
      return <Badge className={styles[status]}>{labels[status]}</Badge>;
    };

    const activeLandlords = landlords.filter(l => l.activeContractsCount > 0);
    const totalMonthlyRevenue = landlords.reduce((sum, l) => sum + l.totalMonthlyRevenue, 0);
    const totalReceivedAllTime = landlords.reduce((sum, l) => sum + l.totalReceivedAllTime, 0);
    const totalProperties = landlords.reduce((sum, l) => sum + l.propertiesCount, 0);
    const imobiliarias = landlords.filter(l => l.personType === 'imobiliaria');
    const proprietariosPf = landlords.filter(l => l.personType === 'pf');
    const proprietariosPj = landlords.filter(l => l.personType === 'pj' && !l.creciNumber);

    return (
      <div className="space-y-6">
        {/* Metricas de Proprietarios */}
        <div className="grid gap-4 md:grid-cols-5">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Cadastros</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{landlords.length}</div>
              <p className="text-xs text-muted-foreground">{totalProperties} imoveis cadastrados</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-amber-800">Imobiliarias</CardTitle>
              <Building2 className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-700">{imobiliarias.length}</div>
              <p className="text-xs text-amber-600">Parceiras B2B2C</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-400">PF + PJ</CardTitle>
              <UserCheck className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-700">{proprietariosPf.length + proprietariosPj.length}</div>
              <p className="text-xs text-blue-400">{proprietariosPf.length} PF / {proprietariosPj.length} PJ</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-emerald-800">Receita Mensal</CardTitle>
              <TrendingUp className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-700">{formatCurrency(totalMonthlyRevenue)}</div>
              <p className="text-xs text-emerald-600">Repasse 85%</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-violet-50 to-purple-50 border-violet-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-violet-800">Total Repassado</CardTitle>
              <Wallet className="h-4 w-4 text-violet-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-violet-700">{formatCurrency(totalReceivedAllTime)}</div>
              <p className="text-xs text-violet-600">Desde o inicio</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabela de Proprietarios */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Proprietarios
                </CardTitle>
                <CardDescription>Gestao de locadores e seus imoveis</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => alert("Funcionalidade de filtros em desenvolvimento")}>
                  <Filter className="h-4 w-4 mr-2" />
                  Filtrar
                </Button>
                <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700" onClick={() => setNewLandlordOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Proprietario
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table className="min-w-[800px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Nome / Razao Social</TableHead>
                  <TableHead>CPF/CNPJ</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead className="text-center">Imoveis</TableHead>
                  <TableHead className="text-center">Contratos</TableHead>
                  <TableHead className="text-right">Receita Mensal</TableHead>
                  <TableHead className="text-right">Total Recebido</TableHead>
                  <TableHead>Conta PIX</TableHead>
                  <TableHead>KYC</TableHead>
                  <TableHead className="text-right">Acoes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {landlords.map(landlord => (
                  <TableRow key={landlord.id}>
                    <TableCell>
                      <div>
                        <p className="font-semibold">{landlord.fullName}</p>
                        {landlord.companyName && <p className="text-xs text-muted-foreground">{landlord.companyName}</p>}
                        {landlord.walletAddress && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Wallet className="h-3 w-3" />
                            {landlord.walletAddress}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={cn("text-xs", landlord.personType === 'imobiliaria' && "bg-amber-100 text-amber-700 border-amber-300")}>
                          {landlord.personType === 'pf' ? 'PF' : landlord.personType === 'pj' ? 'PJ' : 'IMOB'}
                        </Badge>
                        <span className="font-mono text-sm">{landlord.cpfCnpj}</span>
                      </div>
                      {landlord.creciNumber && <p className="text-xs text-amber-600 mt-1">{landlord.creciNumber}</p>}
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>{landlord.email}</p>
                        <p className="text-muted-foreground">{landlord.phone}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-center font-semibold">{landlord.propertiesCount}</TableCell>
                    <TableCell className="text-center font-semibold">{landlord.activeContractsCount}</TableCell>
                    <TableCell className="text-right font-semibold text-emerald-600">{formatCurrency(landlord.totalMonthlyRevenue)}</TableCell>
                    <TableCell className="text-right font-semibold">{formatCurrency(landlord.totalReceivedAllTime)}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>{landlord.bankAccount.bank} - {landlord.bankAccount.agency}/{landlord.bankAccount.account}</p>
                        {landlord.bankAccount.pixKey && <p className="text-xs text-muted-foreground">PIX: {landlord.bankAccount.pixKey}</p>}
                      </div>
                    </TableCell>
                    <TableCell>{getKycStatusBadge(landlord.kycStatus)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-1 justify-end">
                        <Button variant="ghost" size="sm" title="Ver detalhes" onClick={() => { setSelectedLandlord(landlord); setModalMode('view'); }}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" title="Editar" onClick={() => { setSelectedLandlord(landlord); setModalMode('edit'); }}>
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" title="Extrato" onClick={() => alert(`Gerando extrato do proprietario ${landlord.fullName}...`)}>
                          <Receipt className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Modal de Detalhes do Proprietario */}
        <Dialog open={!!selectedLandlord} onOpenChange={(open) => !open && setSelectedLandlord(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            {selectedLandlord && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5 text-indigo-600" />
                    {selectedLandlord.fullName}
                    <Badge variant="outline" className={selectedLandlord.personType === 'imobiliaria' ? "bg-amber-100 text-amber-700" : ""}>
                      {selectedLandlord.personType === 'pf' ? 'Pessoa Fisica' : selectedLandlord.personType === 'pj' ? 'Pessoa Juridica' : 'Imobiliaria Parceira'}
                    </Badge>
                  </DialogTitle>
                  <DialogDescription>
                    {selectedLandlord.personType === 'imobiliaria' ? 'Detalhes da imobiliaria parceira' : 'Detalhes do proprietario'}
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                  {/* Status */}
                  <div className="flex items-center gap-4">
                    {getKycStatusBadge(selectedLandlord.kycStatus)}
                    {selectedLandlord.walletAddress && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Wallet className="h-3 w-3" />
                        Carteira Conectada
                      </Badge>
                    )}
                  </div>

                  <Separator />

                  {/* Informacoes Pessoais/Empresariais */}
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2"><Users className="h-4 w-4" />Informacoes Cadastrais</h4>
                    <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg">
                      <div><p className="text-sm text-muted-foreground">Nome</p><p className="font-medium">{selectedLandlord.fullName}</p></div>
                      {selectedLandlord.companyName && <div><p className="text-sm text-muted-foreground">Razao Social</p><p className="font-medium">{selectedLandlord.companyName}</p></div>}
                      <div><p className="text-sm text-muted-foreground">{selectedLandlord.personType === 'pf' ? 'CPF' : 'CNPJ'}</p><p className="font-mono">{selectedLandlord.cpfCnpj}</p></div>
                      <div><p className="text-sm text-muted-foreground">E-mail</p><p className="font-medium">{selectedLandlord.email}</p></div>
                      <div><p className="text-sm text-muted-foreground">Telefone</p><p className="font-medium">{selectedLandlord.phone}</p></div>
                      {selectedLandlord.creciNumber && (
                        <div><p className="text-sm text-amber-600">CRECI</p><p className="font-mono font-medium text-amber-700">{selectedLandlord.creciNumber}</p></div>
                      )}
                      {selectedLandlord.commissionRate !== undefined && selectedLandlord.commissionRate > 0 && (
                        <div><p className="text-sm text-amber-600">Taxa de Comissao</p><p className="font-bold text-amber-700">{(selectedLandlord.commissionRate * 100).toFixed(0)}%</p></div>
                      )}
                    </div>
                  </div>

                  {/* Estatisticas */}
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2"><BarChart3 className="h-4 w-4" />Estatisticas</h4>
                    <div className="grid grid-cols-4 gap-4">
                      <div className="bg-blue-50 p-4 rounded-lg text-center">
                        <Building2 className="h-6 w-6 mx-auto text-blue-400 mb-1" />
                        <p className="text-2xl font-bold text-blue-700">{selectedLandlord.propertiesCount}</p>
                        <p className="text-xs text-blue-400">Imoveis</p>
                      </div>
                      <div className="bg-indigo-50 p-4 rounded-lg text-center">
                        <FileText className="h-6 w-6 mx-auto text-indigo-600 mb-1" />
                        <p className="text-2xl font-bold text-indigo-700">{selectedLandlord.activeContractsCount}</p>
                        <p className="text-xs text-indigo-600">Contratos</p>
                      </div>
                      <div className="bg-emerald-50 p-4 rounded-lg text-center">
                        <TrendingUp className="h-6 w-6 mx-auto text-emerald-600 mb-1" />
                        <p className="text-xl font-bold text-emerald-700">{formatCurrency(selectedLandlord.totalMonthlyRevenue)}</p>
                        <p className="text-xs text-emerald-600">Receita Mensal</p>
                      </div>
                      <div className="bg-violet-50 p-4 rounded-lg text-center">
                        <Wallet className="h-6 w-6 mx-auto text-violet-600 mb-1" />
                        <p className="text-xl font-bold text-violet-700">{formatCurrency(selectedLandlord.totalReceivedAllTime)}</p>
                        <p className="text-xs text-violet-600">Total Recebido</p>
                      </div>
                    </div>
                  </div>

                  {/* Conta Bancaria */}
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2"><Landmark className="h-4 w-4" />Conta Bancaria</h4>
                    <Card>
                      <CardContent className="p-4">
                        <div className="grid grid-cols-4 gap-4">
                          <div><p className="text-sm text-muted-foreground">Banco</p><p className="font-semibold">{selectedLandlord.bankAccount.bank}</p></div>
                          <div><p className="text-sm text-muted-foreground">Agencia</p><p className="font-mono">{selectedLandlord.bankAccount.agency}</p></div>
                          <div><p className="text-sm text-muted-foreground">Conta</p><p className="font-mono">{selectedLandlord.bankAccount.account}</p></div>
                          {selectedLandlord.bankAccount.pixKey && <div><p className="text-sm text-muted-foreground">Chave PIX</p><p className="font-mono text-sm break-all">{selectedLandlord.bankAccount.pixKey}</p></div>}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Wallet */}
                  {selectedLandlord.walletAddress && (
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2"><Wallet className="h-4 w-4" />Carteira Digital</h4>
                      <div className="bg-violet-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-violet-600">Endereco da Carteira</p>
                            <p className="font-mono text-sm">{selectedLandlord.walletAddress}</p>
                          </div>
                          <Button variant="outline" size="sm" onClick={() => window.open(`https://polygonscan.com/address/${selectedLandlord.walletAddress}`, '_blank')}>
                            <ExternalLink className="h-4 w-4 mr-2" />Ver no Explorer
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Split de Pagamento */}
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2"><PieChart className="h-4 w-4" />Split de Pagamento (85/5/5/5)</h4>
                    <div className="bg-emerald-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm">Repasse Proprietario</span>
                        <span className="font-bold text-emerald-700">85%</span>
                      </div>
                      <Progress value={85} className="h-3 mb-2" />
                      <p className="text-xs text-emerald-600">O proprietario recebe 85% do valor do aluguel via repasse automatico</p>
                    </div>
                  </div>
                </div>

                <DialogFooter className="gap-2">
                  <Button variant="outline" onClick={() => alert(`Gerando extrato de ${selectedLandlord.fullName}...`)}>
                    <Receipt className="h-4 w-4 mr-2" />Ver Extrato
                  </Button>
                  <Button variant="outline" onClick={() => setModalMode('edit')}>
                    <Edit3 className="h-4 w-4 mr-2" />Editar
                  </Button>
                  <Button onClick={() => setSelectedLandlord(null)}>Fechar</Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Modal de CADASTRO de Novo Proprietario */}
        <Dialog open={newLandlordOpen} onOpenChange={setNewLandlordOpen}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Building className="h-5 w-5 text-indigo-600" />
                Cadastrar Novo Proprietario
              </DialogTitle>
              <DialogDescription>Preencha os dados do proprietario para cadastro manual (atendimento humano)</DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Tipo de Pessoa */}
              <div className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2"><UserCheck className="h-4 w-4" />Tipo de Cadastro</h4>
                <Select value={newLandlordForm.personType} onValueChange={(v) => setNewLandlordForm({...newLandlordForm, personType: v as Landlord['personType']})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pf">Pessoa Fisica</SelectItem>
                    <SelectItem value="pj">Pessoa Juridica</SelectItem>
                    <SelectItem value="imobiliaria">Imobiliaria</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Separator />

              {/* Dados Pessoais/Empresa */}
              <div className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2">
                  {newLandlordForm.personType === 'pf' ? <UserCheck className="h-4 w-4" /> : <Building className="h-4 w-4" />}
                  {newLandlordForm.personType === 'pf' ? 'Dados Pessoais' : 'Dados da Empresa'}
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 space-y-2">
                    <Label>{newLandlordForm.personType === 'pf' ? 'Nome Completo *' : 'Razao Social *'}</Label>
                    <Input
                      placeholder={newLandlordForm.personType === 'pf' ? 'Ex: Maria Oliveira' : 'Ex: Empresa Imoveis Ltda'}
                      value={newLandlordForm.fullName}
                      onChange={(e) => setNewLandlordForm({...newLandlordForm, fullName: e.target.value})}
                    />
                  </div>
                  {newLandlordForm.personType !== 'pf' && (
                    <div className="col-span-2 space-y-2">
                      <Label>Nome Fantasia</Label>
                      <Input
                        placeholder="Ex: Imoveis Premium"
                        value={newLandlordForm.companyName}
                        onChange={(e) => setNewLandlordForm({...newLandlordForm, companyName: e.target.value})}
                      />
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label>{newLandlordForm.personType === 'pf' ? 'CPF *' : 'CNPJ *'}</Label>
                    <Input
                      placeholder={newLandlordForm.personType === 'pf' ? '000.000.000-00' : '00.000.000/0001-00'}
                      value={newLandlordForm.cpfCnpj}
                      onChange={(e) => setNewLandlordForm({...newLandlordForm, cpfCnpj: e.target.value})}
                    />
                  </div>
                  {newLandlordForm.personType === 'imobiliaria' && (
                    <div className="space-y-2">
                      <Label>CRECI *</Label>
                      <Input
                        placeholder="CRECI-SP 00000-J"
                        value={newLandlordForm.creciNumber}
                        onChange={(e) => setNewLandlordForm({...newLandlordForm, creciNumber: e.target.value})}
                      />
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label>Email *</Label>
                    <Input
                      type="email"
                      placeholder="email@exemplo.com"
                      value={newLandlordForm.email}
                      onChange={(e) => setNewLandlordForm({...newLandlordForm, email: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Telefone *</Label>
                    <Input
                      placeholder="(11) 99999-9999"
                      value={newLandlordForm.phone}
                      onChange={(e) => setNewLandlordForm({...newLandlordForm, phone: e.target.value})}
                    />
                  </div>
                  {newLandlordForm.personType === 'imobiliaria' && (
                    <div className="space-y-2">
                      <Label>Taxa de Comissao (%)</Label>
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        step={0.5}
                        placeholder="5"
                        value={newLandlordForm.commissionRate || ''}
                        onChange={(e) => setNewLandlordForm({...newLandlordForm, commissionRate: Number(e.target.value)})}
                      />
                    </div>
                  )}
                </div>
              </div>

              <Separator />

              {/* Dados Bancarios */}
              <div className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2"><Landmark className="h-4 w-4" />Dados Bancarios (para recebimento)</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Banco</Label>
                    <Input
                      placeholder="Ex: Itau"
                      value={newLandlordForm.bankName}
                      onChange={(e) => setNewLandlordForm({...newLandlordForm, bankName: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Agencia</Label>
                    <Input
                      placeholder="0001"
                      value={newLandlordForm.agency}
                      onChange={(e) => setNewLandlordForm({...newLandlordForm, agency: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Conta</Label>
                    <Input
                      placeholder="12345-6"
                      value={newLandlordForm.account}
                      onChange={(e) => setNewLandlordForm({...newLandlordForm, account: e.target.value})}
                    />
                  </div>
                  <div className="col-span-3 space-y-2">
                    <Label>Chave PIX</Label>
                    <Input
                      placeholder="CPF, CNPJ, email ou telefone"
                      value={newLandlordForm.pixKey}
                      onChange={(e) => setNewLandlordForm({...newLandlordForm, pixKey: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Verificacao de Documentos</AlertTitle>
                <AlertDescription>
                  Apos o cadastro, o proprietario recebera um link por email para envio de documentos e verificacao de identidade.
                </AlertDescription>
              </Alert>
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setNewLandlordOpen(false)}>Cancelar</Button>
              <Button
                className="bg-indigo-600 hover:bg-indigo-700"
                onClick={() => {
                  if (!newLandlordForm.fullName || !newLandlordForm.cpfCnpj || !newLandlordForm.email || !newLandlordForm.phone) {
                    alert('Preencha todos os campos obrigatorios (*)');
                    return;
                  }
                  if (newLandlordForm.personType === 'imobiliaria' && !newLandlordForm.creciNumber) {
                    alert('CRECI e obrigatorio para imobiliarias');
                    return;
                  }
                  const tipo = newLandlordForm.personType === 'pf' ? 'Pessoa Fisica' : newLandlordForm.personType === 'pj' ? 'Pessoa Juridica' : 'Imobiliaria';
                  alert(`Proprietario cadastrado com sucesso!\n\nTipo: ${tipo}\nNome: ${newLandlordForm.fullName}\n${newLandlordForm.personType === 'pf' ? 'CPF' : 'CNPJ'}: ${newLandlordForm.cpfCnpj}\nEmail: ${newLandlordForm.email}\n\nUm link de verificacao foi enviado para o email informado.`);
                  setNewLandlordOpen(false);
                  setNewLandlordForm({
                    fullName: '', cpfCnpj: '', email: '', phone: '',
                    personType: 'pf', companyName: '', creciNumber: '', commissionRate: 0,
                    bankName: '', agency: '', account: '', pixKey: '',
                  });
                }}
              >
                <Save className="h-4 w-4 mr-2" />
                Cadastrar Proprietario
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  };

  // ============= MODULO: GARANTIDORES =============
  const renderGuarantors = () => {
    const getStatusBadge = (status: Guarantor['status']) => {
      const styles = {
        active: 'bg-emerald-500/10 text-green-700',
        pending_tokenization: 'bg-amber-100 text-amber-700',
        blocked: 'bg-red-500/10 text-red-700',
        inactive: 'bg-card text-muted-foreground',
      };
      const labels = {
        active: 'Ativo',
        pending_tokenization: 'Aguardando Tokenizacao',
        blocked: 'Bloqueado',
        inactive: 'Inativo',
      };
      return <Badge className={styles[status]}>{labels[status]}</Badge>;
    };

    const getFidelityBadge = (level: Guarantor['fidelityLevel']) => {
      const styles = {
        bronze: 'bg-orange-500/10 text-orange-700',
        silver: 'bg-secondary text-muted-foreground',
        gold: 'bg-amber-500/10 text-yellow-700',
        platinum: 'bg-blue-500/10 text-blue-700',
        diamond: 'bg-violet-100 text-violet-700',
      };
      const labels = {
        bronze: 'Bronze',
        silver: 'Prata',
        gold: 'Ouro',
        platinum: 'Platinum',
        diamond: 'Diamante',
      };
      return <Badge className={cn(styles[level], "font-bold")}>{labels[level]}</Badge>;
    };

    const activeGuarantors = guarantors.filter(g => g.status === 'active');
    const totalTokenizedValue = guarantors.reduce((sum, g) => sum + g.tokenizedValue, 0);
    const totalMonthlyCommissions = guarantors.reduce((sum, g) => sum + g.monthlyCommission, 0);
    const totalEarned = guarantors.reduce((sum, g) => sum + g.totalEarnedAllTime, 0);

    return (
      <div className="space-y-6">
        {/* Metricas de Garantidores */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Garantidores</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{guarantors.length}</div>
              <p className="text-xs text-muted-foreground">{activeGuarantors.length} ativos</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-violet-50 to-purple-50 border-violet-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-violet-800">TVL Colateral</CardTitle>
              <Lock className="h-4 w-4 text-violet-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-violet-700">{formatCurrency(totalTokenizedValue)}</div>
              <p className="text-xs text-violet-600">Valor tokenizado</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-emerald-800">Comissoes Mensais</CardTitle>
              <TrendingUp className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-700">{formatCurrency(totalMonthlyCommissions)}</div>
              <p className="text-xs text-emerald-600">5% do aluguel</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-400">Total Pago</CardTitle>
              <Wallet className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-700">{formatCurrency(totalEarned)}</div>
              <p className="text-xs text-blue-400">Desde o inicio</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabela de Garantidores */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Garantidores
                </CardTitle>
                <CardDescription>Gestao de garantidores e seus colaterais tokenizados</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => alert("Funcionalidade de filtros em desenvolvimento")}>
                  <Filter className="h-4 w-4 mr-2" />
                  Filtrar
                </Button>
                <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700" onClick={() => setNewGuarantorOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Garantidor
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table className="min-w-[800px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Imovel Colateral</TableHead>
                  <TableHead className="text-right">Valor Tokenizado</TableHead>
                  <TableHead className="text-center">LTV</TableHead>
                  <TableHead className="text-center">Contratos</TableHead>
                  <TableHead className="text-right">Comissao Mensal</TableHead>
                  <TableHead>Fidelidade</TableHead>
                  <TableHead>Yield Stacking</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Acoes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {guarantors.map(guarantor => (
                  <TableRow key={guarantor.id}>
                    <TableCell>
                      <div>
                        <p className="font-semibold">{guarantor.fullName}</p>
                        {guarantor.walletAddress && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <Wallet className="h-3 w-3" />
                            {guarantor.walletAddress}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>{guarantor.email}</p>
                        <p className="text-muted-foreground">{guarantor.phone}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <span className="max-w-[180px] truncate text-sm">{guarantor.collateralPropertyAddress}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-semibold text-violet-600">
                      {guarantor.tokenizedValue > 0 ? formatCurrency(guarantor.tokenizedValue) : '-'}
                    </TableCell>
                    <TableCell className="text-center">
                      {guarantor.ltv > 0 ? (
                        <div className={cn("inline-flex items-center justify-center w-12 h-8 rounded-full text-sm font-bold", guarantor.ltv <= 70 ? 'bg-emerald-500/10 text-green-700' : guarantor.ltv <= 80 ? 'bg-amber-100 text-amber-700' : 'bg-red-500/10 text-red-700')}>
                          {guarantor.ltv}%
                        </div>
                      ) : '-'}
                    </TableCell>
                    <TableCell className="text-center font-semibold">{guarantor.activeContractsGuaranteed}</TableCell>
                    <TableCell className="text-right font-semibold text-emerald-600">
                      {guarantor.monthlyCommission > 0 ? formatCurrency(guarantor.monthlyCommission) : '-'}
                    </TableCell>
                    <TableCell>{getFidelityBadge(guarantor.fidelityLevel)}</TableCell>
                    <TableCell>
                      {guarantor.yieldStackingEnabled ? (
                        <Badge className="bg-violet-100 text-violet-700 flex items-center gap-1 w-fit">
                          <Layers className="h-3 w-3" />
                          Ativo
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(guarantor.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-1 justify-end">
                        <Button variant="ghost" size="sm" title="Ver detalhes" onClick={() => { setSelectedGuarantor(guarantor); setModalMode('view'); }}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" title="Certificado NFT" onClick={() => alert(`Abrindo certificado NFT ${guarantor.nftCertificateId || 'N/A'}...`)}>
                          <QrCode className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" title="Extrato" onClick={() => alert(`Gerando extrato do garantidor ${guarantor.fullName}...`)}>
                          <Receipt className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Modal de Detalhes do Garantidor */}
        <Dialog open={!!selectedGuarantor} onOpenChange={(open) => !open && setSelectedGuarantor(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            {selectedGuarantor && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-emerald-600" />
                    {selectedGuarantor.fullName}
                    {getFidelityBadge(selectedGuarantor.fidelityLevel)}
                  </DialogTitle>
                  <DialogDescription>Detalhes do garantidor e colateral tokenizado</DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                  {/* Status e Badges */}
                  <div className="flex items-center gap-4">
                    {getStatusBadge(selectedGuarantor.status)}
                    {selectedGuarantor.yieldStackingEnabled && (
                      <Badge className="bg-violet-100 text-violet-700 flex items-center gap-1">
                        <Layers className="h-3 w-3" />
                        Yield Stacking Ativo
                      </Badge>
                    )}
                    {selectedGuarantor.walletAddress && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Wallet className="h-3 w-3" />
                        Carteira Conectada
                      </Badge>
                    )}
                  </div>

                  <Separator />

                  {/* Informacoes Pessoais */}
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2"><Users className="h-4 w-4" />Informacoes Pessoais</h4>
                    <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg">
                      <div><p className="text-sm text-muted-foreground">Nome Completo</p><p className="font-medium">{selectedGuarantor.fullName}</p></div>
                      <div><p className="text-sm text-muted-foreground">CPF/CNPJ</p><p className="font-mono">{selectedGuarantor.cpfCnpj}</p></div>
                      <div><p className="text-sm text-muted-foreground">E-mail</p><p className="font-medium">{selectedGuarantor.email}</p></div>
                      <div><p className="text-sm text-muted-foreground">Telefone</p><p className="font-medium">{selectedGuarantor.phone}</p></div>
                    </div>
                  </div>

                  {/* Imovel Colateral */}
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2"><Building2 className="h-4 w-4" />Imovel Colateral</h4>
                    <Card className="border-violet-200 bg-violet-50">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-start gap-3">
                            <div className="p-2 bg-violet-100 rounded-lg">
                              <Lock className="h-5 w-5 text-violet-600" />
                            </div>
                            <div>
                              <p className="font-semibold">{selectedGuarantor.collateralPropertyAddress}</p>
                              <p className="text-sm text-violet-600">ID: {selectedGuarantor.collateralPropertyId}</p>
                            </div>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="bg-background p-3 rounded-lg text-center">
                            <p className="text-xs text-muted-foreground">Valor do Imovel</p>
                            <p className="font-bold">{formatCurrency(selectedGuarantor.collateralValue)}</p>
                          </div>
                          <div className="bg-background p-3 rounded-lg text-center">
                            <p className="text-xs text-muted-foreground">Valor Tokenizado</p>
                            <p className="font-bold text-violet-600">{formatCurrency(selectedGuarantor.tokenizedValue)}</p>
                          </div>
                          <div className={cn("p-3 rounded-lg text-center", selectedGuarantor.ltv <= 70 ? 'bg-emerald-500/10' : selectedGuarantor.ltv <= 80 ? 'bg-amber-100' : 'bg-red-500/10')}>
                            <p className="text-xs text-muted-foreground">LTV</p>
                            <p className={cn("font-bold", selectedGuarantor.ltv <= 70 ? 'text-green-700' : selectedGuarantor.ltv <= 80 ? 'text-amber-700' : 'text-red-700')}>{selectedGuarantor.ltv}%</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Estatisticas de Garantia */}
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2"><BarChart3 className="h-4 w-4" />Estatisticas de Garantia</h4>
                    <div className="grid grid-cols-4 gap-4">
                      <div className="bg-blue-50 p-4 rounded-lg text-center">
                        <FileSignature className="h-6 w-6 mx-auto text-blue-400 mb-1" />
                        <p className="text-2xl font-bold text-blue-700">{selectedGuarantor.activeContractsGuaranteed}</p>
                        <p className="text-xs text-blue-400">Contratos Garantidos</p>
                      </div>
                      <div className="bg-emerald-50 p-4 rounded-lg text-center">
                        <DollarSign className="h-6 w-6 mx-auto text-emerald-600 mb-1" />
                        <p className="text-xl font-bold text-emerald-700">{formatCurrency(selectedGuarantor.monthlyCommission)}</p>
                        <p className="text-xs text-emerald-600">Comissao Mensal (5%)</p>
                      </div>
                      <div className="bg-violet-50 p-4 rounded-lg text-center">
                        <Wallet className="h-6 w-6 mx-auto text-violet-600 mb-1" />
                        <p className="text-xl font-bold text-violet-700">{formatCurrency(selectedGuarantor.totalEarnedAllTime)}</p>
                        <p className="text-xs text-violet-600">Total Recebido</p>
                      </div>
                      <div className="bg-amber-50 p-4 rounded-lg text-center">
                        <Star className="h-6 w-6 mx-auto text-amber-600 mb-1" />
                        <p className="text-sm font-bold text-amber-700">{selectedGuarantor.fidelityLevel.toUpperCase()}</p>
                        <p className="text-xs text-amber-600">Nivel Fidelidade</p>
                      </div>
                    </div>
                  </div>

                  {/* NFT Certificate */}
                  {selectedGuarantor.nftCertificateId && (
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2"><QrCode className="h-4 w-4" />Certificado NFT</h4>
                      <Card className="border-emerald-200 bg-emerald-50">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-3 bg-emerald-100 rounded-lg">
                                <Shield className="h-6 w-6 text-emerald-600" />
                              </div>
                              <div>
                                <p className="font-semibold text-emerald-800">Certificado de Garantidor</p>
                                <p className="font-mono text-sm text-emerald-600">{selectedGuarantor.nftCertificateId}</p>
                              </div>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => alert('Abrindo certificado NFT...')}>
                              <ExternalLink className="h-4 w-4 mr-2" />Ver NFT
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {/* Wallet */}
                  {selectedGuarantor.walletAddress && (
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2"><Wallet className="h-4 w-4" />Carteira Digital</h4>
                      <div className="bg-violet-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-violet-600">Endereco da Carteira</p>
                            <p className="font-mono text-sm">{selectedGuarantor.walletAddress}</p>
                          </div>
                          <Button variant="outline" size="sm" onClick={() => window.open(`https://polygonscan.com/address/${selectedGuarantor.walletAddress}`, '_blank')}>
                            <ExternalLink className="h-4 w-4 mr-2" />Ver no Explorer
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Programa de Fidelidade */}
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2"><Star className="h-4 w-4" />Programa de Fidelidade</h4>
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            {getFidelityBadge(selectedGuarantor.fidelityLevel)}
                            <span className="text-sm text-muted-foreground">Proximo nivel: {
                              selectedGuarantor.fidelityLevel === 'bronze' ? 'Prata' :
                              selectedGuarantor.fidelityLevel === 'silver' ? 'Ouro' :
                              selectedGuarantor.fidelityLevel === 'gold' ? 'Platinum' :
                              selectedGuarantor.fidelityLevel === 'platinum' ? 'Diamante' : 'Nivel Maximo'
                            }</span>
                          </div>
                          {selectedGuarantor.yieldStackingEnabled && (
                            <Badge className="bg-violet-100 text-violet-700">
                              <Layers className="h-3 w-3 mr-1" />
                              Yield Stacking Ativo
                            </Badge>
                          )}
                        </div>
                        <Progress value={
                          selectedGuarantor.fidelityLevel === 'bronze' ? 20 :
                          selectedGuarantor.fidelityLevel === 'silver' ? 40 :
                          selectedGuarantor.fidelityLevel === 'gold' ? 60 :
                          selectedGuarantor.fidelityLevel === 'platinum' ? 80 : 100
                        } className="h-2" />
                      </CardContent>
                    </Card>
                  </div>
                </div>

                <DialogFooter className="gap-2">
                  {selectedGuarantor.nftCertificateId && (
                    <Button variant="outline" onClick={() => alert('Abrindo certificado NFT...')}>
                      <QrCode className="h-4 w-4 mr-2" />Ver Certificado
                    </Button>
                  )}
                  <Button variant="outline" onClick={() => alert(`Gerando extrato de ${selectedGuarantor.fullName}...`)}>
                    <Receipt className="h-4 w-4 mr-2" />Ver Extrato
                  </Button>
                  <Button onClick={() => setSelectedGuarantor(null)}>Fechar</Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* Modal de CADASTRO de Novo Garantidor */}
        <Dialog open={newGuarantorOpen} onOpenChange={setNewGuarantorOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-indigo-600" />
                Cadastrar Novo Garantidor
              </DialogTitle>
              <DialogDescription>Preencha os dados do garantidor para cadastro manual (atendimento humano)</DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Dados Pessoais */}
              <div className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2"><UserCheck className="h-4 w-4" />Dados Pessoais</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 space-y-2">
                    <Label>Nome Completo *</Label>
                    <Input
                      placeholder="Ex: Roberto Santos"
                      value={newGuarantorForm.fullName}
                      onChange={(e) => setNewGuarantorForm({...newGuarantorForm, fullName: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>CPF/CNPJ *</Label>
                    <Input
                      placeholder="000.000.000-00"
                      value={newGuarantorForm.cpfCnpj}
                      onChange={(e) => setNewGuarantorForm({...newGuarantorForm, cpfCnpj: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email *</Label>
                    <Input
                      type="email"
                      placeholder="email@exemplo.com"
                      value={newGuarantorForm.email}
                      onChange={(e) => setNewGuarantorForm({...newGuarantorForm, email: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Telefone *</Label>
                    <Input
                      placeholder="(11) 99999-9999"
                      value={newGuarantorForm.phone}
                      onChange={(e) => setNewGuarantorForm({...newGuarantorForm, phone: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Imovel Colateral */}
              <div className="space-y-4">
                <h4 className="font-semibold flex items-center gap-2"><Building2 className="h-4 w-4" />Imovel Colateral</h4>
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label>Endereco do Imovel *</Label>
                    <Input
                      placeholder="Ex: Rua dos Pinheiros, 500 - Pinheiros, Sao Paulo"
                      value={newGuarantorForm.collateralPropertyAddress}
                      onChange={(e) => setNewGuarantorForm({...newGuarantorForm, collateralPropertyAddress: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Valor Estimado do Imovel (R$) *</Label>
                    <Input
                      type="number"
                      min={0}
                      placeholder="0,00"
                      value={newGuarantorForm.collateralValue || ''}
                      onChange={(e) => setNewGuarantorForm({...newGuarantorForm, collateralValue: Number(e.target.value)})}
                    />
                    <p className="text-xs text-muted-foreground">O valor tokenizado sera de 80% (LTV) do valor estimado</p>
                  </div>
                </div>
              </div>

              <Alert className="bg-blue-50 border-blue-200">
                <Shield className="h-4 w-4 text-blue-600" />
                <AlertTitle className="text-blue-800">Como funciona o Garantidor</AlertTitle>
                <AlertDescription className="text-blue-700">
                  O garantidor empenha seu imovel como colateral digital. Em troca, recebe <strong>5% do valor do aluguel</strong> mensalmente de cada contrato garantido. O imovel sera tokenizado com LTV de 80%.
                </AlertDescription>
              </Alert>

              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Proximos Passos</AlertTitle>
                <AlertDescription>
                  Apos o cadastro, o garantidor recebera um link para:
                  <ol className="list-decimal list-inside mt-2 space-y-1">
                    <li>Verificacao de identidade (KYC)</li>
                    <li>Envio de documentos do imovel</li>
                    <li>Assinatura digital para tokenizacao</li>
                    <li>Conexao da carteira digital (wallet)</li>
                  </ol>
                </AlertDescription>
              </Alert>
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setNewGuarantorOpen(false)}>Cancelar</Button>
              <Button
                className="bg-indigo-600 hover:bg-indigo-700"
                onClick={() => {
                  if (!newGuarantorForm.fullName || !newGuarantorForm.cpfCnpj || !newGuarantorForm.email || !newGuarantorForm.phone || !newGuarantorForm.collateralPropertyAddress || !newGuarantorForm.collateralValue) {
                    alert('Preencha todos os campos obrigatorios (*)');
                    return;
                  }
                  const valorTokenizado = newGuarantorForm.collateralValue * 0.8;
                  alert(`Garantidor cadastrado com sucesso!\n\nNome: ${newGuarantorForm.fullName}\nCPF/CNPJ: ${newGuarantorForm.cpfCnpj}\nEmail: ${newGuarantorForm.email}\n\nImovel Colateral: ${newGuarantorForm.collateralPropertyAddress}\nValor Estimado: R$ ${newGuarantorForm.collateralValue.toLocaleString('pt-BR')}\nValor Tokenizado (80%): R$ ${valorTokenizado.toLocaleString('pt-BR')}\n\nUm link de verificacao foi enviado para o email informado.`);
                  setNewGuarantorOpen(false);
                  setNewGuarantorForm({
                    fullName: '', cpfCnpj: '', email: '', phone: '',
                    collateralPropertyAddress: '', collateralValue: 0,
                  });
                }}
              >
                <Save className="h-4 w-4 mr-2" />
                Cadastrar Garantidor
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  };

  // ============= MODULO: VISTORIAS =============

  // Tipos de Vistoria
  interface Inspection {
    id: string;
    contractId: string;
    propertyId: string;
    propertyAddress: string;
    type: 'entrada' | 'saida' | 'periodica';
    status: 'agendada' | 'em_andamento' | 'concluida' | 'pendente_aprovacao' | 'cancelada';
    scheduledDate: Date;
    completedDate?: Date;
    inspectorId?: string;
    inspectorName?: string;
    tenantName: string;
    landlordName: string;
    totalPhotos: number;
    hashBlockchain?: string;
    damagesFound: number;
    estimatedRepairCost: number;
    notes?: string;
    createdAt: Date;
  }

  const [inspections] = useState<Inspection[]>([
    { id: 'VIST-001', contractId: 'CTR-001', propertyId: 'PROP-001', propertyAddress: 'Av. Paulista, 1000 - Apto 402', type: 'saida', status: 'pendente_aprovacao', scheduledDate: new Date('2026-01-05'), completedDate: new Date('2026-01-05'), inspectorId: 'INSP-001', inspectorName: 'Vistoria Pro - Carlos', tenantName: 'Carlos Silva', landlordName: 'Maria Oliveira', totalPhotos: 47, hashBlockchain: '0xIPFS_VISTORIA_001', damagesFound: 3, estimatedRepairCost: 2500, notes: 'Danos na parede da sala e piso da cozinha', createdAt: new Date('2026-01-03') },
    { id: 'VIST-002', contractId: 'CTR-002', propertyId: 'PROP-002', propertyAddress: 'Rua Oscar Freire, 500 - Jardins', type: 'periodica', status: 'agendada', scheduledDate: new Date('2026-01-15'), tenantName: 'Ana Ferreira', landlordName: 'Joao Mendes', totalPhotos: 0, damagesFound: 0, estimatedRepairCost: 0, createdAt: new Date('2026-01-06') },
    { id: 'VIST-003', contractId: 'CTR-003', propertyId: 'PROP-003', propertyAddress: 'Rua das Flores, 123 - Jardins', type: 'entrada', status: 'concluida', scheduledDate: new Date('2025-05-28'), completedDate: new Date('2025-05-28'), inspectorId: 'INSP-002', inspectorName: 'Vistoria Pro - Maria', tenantName: 'Joao Silva', landlordName: 'Maria Oliveira', totalPhotos: 62, hashBlockchain: '0xIPFS_VISTORIA_002', damagesFound: 0, estimatedRepairCost: 0, notes: 'Imovel em perfeitas condicoes', createdAt: new Date('2025-05-25') },
    { id: 'VIST-004', contractId: 'CTR-004', propertyId: 'PROP-004', propertyAddress: 'Al. Santos, 800 - Cerqueira Cesar', type: 'periodica', status: 'em_andamento', scheduledDate: new Date('2026-01-07'), inspectorId: 'INSP-001', inspectorName: 'Vistoria Pro - Carlos', tenantName: 'Fernanda Costa', landlordName: 'Fernando Lima', totalPhotos: 23, damagesFound: 0, estimatedRepairCost: 0, createdAt: new Date('2026-01-04') },
    { id: 'VIST-005', contractId: '', propertyId: 'PROP-005', propertyAddress: 'Rua Harmonia, 200 - Vila Madalena', type: 'entrada', status: 'agendada', scheduledDate: new Date('2026-01-20'), tenantName: 'Lucas Martins', landlordName: 'Joao Mendes', totalPhotos: 0, damagesFound: 0, estimatedRepairCost: 0, createdAt: new Date('2026-01-05') },
  ]);

  const [newInspectionOpen, setNewInspectionOpen] = useState(false);
  const [selectedInspection, setSelectedInspection] = useState<Inspection | null>(null);
  const [newInspectionForm, setNewInspectionForm] = useState({
    propertyAddress: '',
    type: 'entrada' as Inspection['type'],
    scheduledDate: '',
    tenantName: '',
    landlordName: '',
    inspectorName: '',
    notes: '',
  });

  const renderInspections = () => {
    const getStatusBadge = (status: Inspection['status']) => {
      const styles = {
        agendada: 'bg-blue-500/10 text-blue-700',
        em_andamento: 'bg-amber-100 text-amber-700',
        concluida: 'bg-emerald-500/10 text-green-700',
        pendente_aprovacao: 'bg-purple-500/10 text-purple-700',
        cancelada: 'bg-card text-muted-foreground',
      };
      const labels = {
        agendada: 'Agendada',
        em_andamento: 'Em Andamento',
        concluida: 'Concluida',
        pendente_aprovacao: 'Pendente Aprovacao',
        cancelada: 'Cancelada',
      };
      return <Badge className={styles[status]}>{labels[status]}</Badge>;
    };

    const getTypeBadge = (type: Inspection['type']) => {
      const styles = {
        entrada: 'bg-emerald-100 text-emerald-700',
        saida: 'bg-red-500/10 text-red-700',
        periodica: 'bg-blue-500/10 text-blue-700',
      };
      const labels = {
        entrada: 'Entrada',
        saida: 'Saida',
        periodica: 'Periodica',
      };
      return <Badge className={styles[type]}>{labels[type]}</Badge>;
    };

    const pendingApproval = inspections.filter(i => i.status === 'pendente_aprovacao');
    const scheduled = inspections.filter(i => i.status === 'agendada');
    const inProgress = inspections.filter(i => i.status === 'em_andamento');
    const completed = inspections.filter(i => i.status === 'concluida');

    const handleCreateInspection = () => {
      alert(`Vistoria criada para ${newInspectionForm.propertyAddress}!`);
      setNewInspectionOpen(false);
      setNewInspectionForm({
        propertyAddress: '',
        type: 'entrada',
        scheduledDate: '',
        tenantName: '',
        landlordName: '',
        inspectorName: '',
        notes: '',
      });
    };

    return (
      <div className="space-y-6">
        {/* Metricas */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-purple-400">Pendentes Aprovacao</CardTitle>
              <ClipboardCheck className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-700">{pendingApproval.length}</div>
              <p className="text-xs text-purple-400">Aguardando analise</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-400">Agendadas</CardTitle>
              <Clock className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-700">{scheduled.length}</div>
              <p className="text-xs text-blue-400">Proximos dias</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-amber-800">Em Andamento</CardTitle>
              <Camera className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-700">{inProgress.length}</div>
              <p className="text-xs text-amber-600">Vistoriador em campo</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-emerald-400">Concluidas</CardTitle>
              <CheckCircle className="h-4 w-4 text-emerald-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-700">{completed.length}</div>
              <p className="text-xs text-emerald-400">Total historico</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabela de Vistorias */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <ClipboardCheck className="h-5 w-5" />
                  Gestao de Vistorias
                </CardTitle>
                <CardDescription>Acompanhe e gerencie todas as vistorias de imoveis</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => alert("Funcionalidade de filtros em desenvolvimento")}>
                  <Filter className="h-4 w-4 mr-2" />
                  Filtrar
                </Button>
                <Dialog open={newInspectionOpen} onOpenChange={setNewInspectionOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Nova Vistoria
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <ClipboardCheck className="h-5 w-5 text-indigo-600" />
                        Agendar Nova Vistoria
                      </DialogTitle>
                      <DialogDescription>Preencha os dados para agendar uma nova vistoria</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Endereco do Imovel</Label>
                          <Input
                            placeholder="Av. Paulista, 1000 - Apto 402"
                            value={newInspectionForm.propertyAddress}
                            onChange={(e) => setNewInspectionForm({ ...newInspectionForm, propertyAddress: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Tipo de Vistoria</Label>
                          <Select
                            value={newInspectionForm.type}
                            onValueChange={(v) => setNewInspectionForm({ ...newInspectionForm, type: v as Inspection['type'] })}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="entrada">Entrada</SelectItem>
                              <SelectItem value="saida">Saida</SelectItem>
                              <SelectItem value="periodica">Periodica</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Data Agendada</Label>
                          <Input
                            type="date"
                            value={newInspectionForm.scheduledDate}
                            onChange={(e) => setNewInspectionForm({ ...newInspectionForm, scheduledDate: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Vistoriador</Label>
                          <Select
                            value={newInspectionForm.inspectorName}
                            onValueChange={(v) => setNewInspectionForm({ ...newInspectionForm, inspectorName: v })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o vistoriador" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Vistoria Pro - Carlos">Vistoria Pro - Carlos</SelectItem>
                              <SelectItem value="Vistoria Pro - Maria">Vistoria Pro - Maria</SelectItem>
                              <SelectItem value="Vistoria Pro - Jose">Vistoria Pro - Jose</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Nome do Locatario</Label>
                          <Input
                            placeholder="Nome completo"
                            value={newInspectionForm.tenantName}
                            onChange={(e) => setNewInspectionForm({ ...newInspectionForm, tenantName: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Nome do Proprietario</Label>
                          <Input
                            placeholder="Nome completo"
                            value={newInspectionForm.landlordName}
                            onChange={(e) => setNewInspectionForm({ ...newInspectionForm, landlordName: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Observacoes</Label>
                        <Textarea
                          placeholder="Instrucoes especiais ou observacoes..."
                          value={newInspectionForm.notes}
                          onChange={(e) => setNewInspectionForm({ ...newInspectionForm, notes: e.target.value })}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setNewInspectionOpen(false)}>Cancelar</Button>
                      <Button onClick={handleCreateInspection} className="bg-indigo-600 hover:bg-indigo-700">
                        <Plus className="h-4 w-4 mr-2" />
                        Agendar Vistoria
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table className="min-w-[900px]">
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Imovel</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Partes</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Vistoriador</TableHead>
                  <TableHead className="text-center">Fotos</TableHead>
                  <TableHead className="text-center">Danos</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Acoes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inspections.map(inspection => (
                  <TableRow key={inspection.id}>
                    <TableCell className="font-mono text-sm">{inspection.id}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-muted-foreground" />
                        <span className="max-w-[200px] truncate">{inspection.propertyAddress}</span>
                      </div>
                    </TableCell>
                    <TableCell>{getTypeBadge(inspection.type)}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p><span className="text-muted-foreground">Loc:</span> {inspection.tenantName}</p>
                        <p><span className="text-muted-foreground">Prop:</span> {inspection.landlordName}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>{inspection.scheduledDate.toLocaleDateString('pt-BR')}</p>
                        {inspection.completedDate && (
                          <p className="text-xs text-muted-foreground">Concl: {inspection.completedDate.toLocaleDateString('pt-BR')}</p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{inspection.inspectorName || <span className="text-muted-foreground">-</span>}</TableCell>
                    <TableCell className="text-center">
                      {inspection.totalPhotos > 0 ? (
                        <Badge variant="outline">{inspection.totalPhotos}</Badge>
                      ) : '-'}
                    </TableCell>
                    <TableCell className="text-center">
                      {inspection.damagesFound > 0 ? (
                        <Badge className="bg-red-500/10 text-red-700">{inspection.damagesFound}</Badge>
                      ) : (
                        <Badge className="bg-emerald-500/10 text-green-700">0</Badge>
                      )}
                    </TableCell>
                    <TableCell>{getStatusBadge(inspection.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-1 justify-end">
                        <Button variant="ghost" size="sm" title="Ver detalhes" onClick={() => setSelectedInspection(inspection)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        {inspection.hashBlockchain && (
                          <Button variant="ghost" size="sm" title="Ver na blockchain" onClick={() => window.open(`https://polygonscan.com/tx/${inspection.hashBlockchain}`, '_blank')}>
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        )}
                        <Button variant="ghost" size="sm" title="Editar" onClick={() => alert(`Editando vistoria ${inspection.id}...`)}>
                          <Edit3 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Modal de Detalhes da Vistoria */}
        <Dialog open={!!selectedInspection} onOpenChange={(open) => !open && setSelectedInspection(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            {selectedInspection && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <ClipboardCheck className="h-5 w-5 text-indigo-600" />
                    Vistoria {selectedInspection.id}
                    {getTypeBadge(selectedInspection.type)}
                  </DialogTitle>
                  <DialogDescription>{selectedInspection.propertyAddress}</DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                  <div className="flex items-center gap-4">
                    {getStatusBadge(selectedInspection.status)}
                    {selectedInspection.hashBlockchain && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Hash className="h-3 w-3" />
                        Hash Registrado
                      </Badge>
                    )}
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3">Informacoes</h4>
                      <div className="space-y-2 text-sm">
                        <p><span className="text-muted-foreground">Contrato:</span> {selectedInspection.contractId || '-'}</p>
                        <p><span className="text-muted-foreground">Data Agendada:</span> {selectedInspection.scheduledDate.toLocaleDateString('pt-BR')}</p>
                        {selectedInspection.completedDate && <p><span className="text-muted-foreground">Data Conclusao:</span> {selectedInspection.completedDate.toLocaleDateString('pt-BR')}</p>}
                        <p><span className="text-muted-foreground">Vistoriador:</span> {selectedInspection.inspectorName || '-'}</p>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3">Partes Envolvidas</h4>
                      <div className="space-y-2 text-sm">
                        <p><span className="text-muted-foreground">Locatario:</span> {selectedInspection.tenantName}</p>
                        <p><span className="text-muted-foreground">Proprietario:</span> {selectedInspection.landlordName}</p>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg text-center">
                      <Camera className="h-6 w-6 mx-auto text-blue-400 mb-1" />
                      <p className="text-2xl font-bold text-blue-700">{selectedInspection.totalPhotos}</p>
                      <p className="text-xs text-blue-400">Fotos</p>
                    </div>
                    <div className={cn("p-4 rounded-lg text-center", selectedInspection.damagesFound > 0 ? 'bg-red-50' : 'bg-green-50')}>
                      <AlertTriangle className={cn("h-6 w-6 mx-auto mb-1", selectedInspection.damagesFound > 0 ? 'text-red-400' : 'text-emerald-400')} />
                      <p className={cn("text-2xl font-bold", selectedInspection.damagesFound > 0 ? 'text-red-700' : 'text-green-700')}>{selectedInspection.damagesFound}</p>
                      <p className={cn("text-xs", selectedInspection.damagesFound > 0 ? 'text-red-400' : 'text-emerald-400')}>Danos</p>
                    </div>
                    <div className="bg-amber-50 p-4 rounded-lg text-center">
                      <DollarSign className="h-6 w-6 mx-auto text-amber-600 mb-1" />
                      <p className="text-xl font-bold text-amber-700">{formatCurrency(selectedInspection.estimatedRepairCost)}</p>
                      <p className="text-xs text-amber-600">Custo Estimado</p>
                    </div>
                  </div>

                  {selectedInspection.notes && (
                    <div>
                      <h4 className="font-semibold mb-2">Observacoes</h4>
                      <p className="text-sm bg-slate-50 p-4 rounded-lg">{selectedInspection.notes}</p>
                    </div>
                  )}

                  {selectedInspection.hashBlockchain && (
                    <div className="bg-violet-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-violet-600">Hash Blockchain (IPFS)</p>
                          <p className="font-mono text-sm">{selectedInspection.hashBlockchain}</p>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => window.open(`https://polygonscan.com/tx/${selectedInspection.hashBlockchain}`, '_blank')}>
                          <ExternalLink className="h-4 w-4 mr-2" />Ver no Explorer
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                <DialogFooter className="gap-2">
                  {selectedInspection.status === 'pendente_aprovacao' && (
                    <>
                      <Button variant="outline" className="text-red-400 border-red-600" onClick={() => alert('Solicitando revisao...')}>
                        <XCircle className="h-4 w-4 mr-2" />Solicitar Revisao
                      </Button>
                      <Button className="bg-green-600 hover:bg-green-700" onClick={() => alert('Vistoria aprovada!')}>
                        <CheckCircle className="h-4 w-4 mr-2" />Aprovar Vistoria
                      </Button>
                    </>
                  )}
                  <Button variant="outline" onClick={() => alert('Abrindo galeria de fotos...')}>
                    <Camera className="h-4 w-4 mr-2" />Ver Fotos
                  </Button>
                  <Button onClick={() => setSelectedInspection(null)}>Fechar</Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    );
  };

  // ============= MODULO: KYC PENDENTES =============

  interface KYCRequest {
    id: string;
    userId: string;
    userType: 'tenant' | 'landlord' | 'guarantor';
    fullName: string;
    cpfCnpj: string;
    email: string;
    phone: string;
    status: 'pending' | 'in_review' | 'approved' | 'rejected' | 'expired';
    submittedAt: Date;
    reviewedAt?: Date;
    reviewedBy?: string;
    documents: { type: string; status: 'valid' | 'invalid' | 'pending'; fileName: string }[];
    riskScore?: number;
    notes?: string;
    rejectionReason?: string;
  }

  const [kycRequests] = useState<KYCRequest[]>([
    { id: 'KYC-001', userId: 'TEN-005', userType: 'tenant', fullName: 'Lucas Martins', cpfCnpj: '777.888.999-00', email: 'lucas.martins@email.com', phone: '(11) 97777-8888', status: 'pending', submittedAt: new Date('2026-01-02'), documents: [{ type: 'RG/CNH', status: 'pending', fileName: 'rg_lucas.pdf' }, { type: 'Comprovante Endereco', status: 'pending', fileName: 'comp_end_lucas.pdf' }, { type: 'Comprovante Renda', status: 'pending', fileName: 'holerite_lucas.pdf' }], riskScore: 75 },
    { id: 'KYC-002', userId: 'LAN-004', userType: 'landlord', fullName: 'Rodrigo Pereira', cpfCnpj: '88.999.111-22', email: 'rodrigo.p@email.com', phone: '(11) 94444-5555', status: 'in_review', submittedAt: new Date('2026-01-05'), documents: [{ type: 'RG/CNH', status: 'valid', fileName: 'rg_rodrigo.pdf' }, { type: 'Comprovante Endereco', status: 'valid', fileName: 'comp_end_rodrigo.pdf' }, { type: 'Matricula Imovel', status: 'pending', fileName: 'matricula_rodrigo.pdf' }], riskScore: 82, reviewedBy: 'Maria Financeiro' },
    { id: 'KYC-003', userId: 'GAR-004', userType: 'guarantor', fullName: 'Claudia Ferreira', cpfCnpj: '444.333.222-11', email: 'claudia.f@email.com', phone: '(11) 92222-1111', status: 'pending', submittedAt: new Date('2026-01-04'), documents: [{ type: 'RG/CNH', status: 'pending', fileName: 'rg_claudia.pdf' }, { type: 'Matricula Imovel Colateral', status: 'pending', fileName: 'matricula_claudia.pdf' }, { type: 'Laudo Avaliacao', status: 'pending', fileName: 'laudo_claudia.pdf' }], riskScore: 68 },
    { id: 'KYC-004', userId: 'TEN-007', userType: 'tenant', fullName: 'Mariana Costa', cpfCnpj: '555.666.777-88', email: 'mariana.costa@email.com', phone: '(11) 96666-7777', status: 'pending', submittedAt: new Date('2026-01-06'), documents: [{ type: 'RG/CNH', status: 'pending', fileName: 'rg_mariana.pdf' }, { type: 'Comprovante Endereco', status: 'pending', fileName: 'comp_end_mariana.pdf' }], riskScore: 45 },
    { id: 'KYC-005', userId: 'TEN-006', userType: 'tenant', fullName: 'Patricia Almeida', cpfCnpj: '222.333.444-55', email: 'patricia@email.com', phone: '(11) 92222-3333', status: 'rejected', submittedAt: new Date('2025-12-28'), reviewedAt: new Date('2025-12-30'), reviewedBy: 'Joao Suporte', documents: [{ type: 'RG/CNH', status: 'invalid', fileName: 'rg_patricia.pdf' }, { type: 'Comprovante Renda', status: 'invalid', fileName: 'renda_patricia.pdf' }], riskScore: 25, rejectionReason: 'Documentos ilegíveis e renda incompatível' },
  ]);

  const [selectedKYC, setSelectedKYC] = useState<KYCRequest | null>(null);
  const [newKYCOpen, setNewKYCOpen] = useState(false);

  const renderKYC = () => {
    const getStatusBadge = (status: KYCRequest['status']) => {
      const styles = {
        pending: 'bg-amber-100 text-amber-700',
        in_review: 'bg-blue-500/10 text-blue-700',
        approved: 'bg-emerald-500/10 text-green-700',
        rejected: 'bg-red-500/10 text-red-700',
        expired: 'bg-card text-muted-foreground',
      };
      const labels = {
        pending: 'Pendente',
        in_review: 'Em Analise',
        approved: 'Aprovado',
        rejected: 'Rejeitado',
        expired: 'Expirado',
      };
      return <Badge className={styles[status]}>{labels[status]}</Badge>;
    };

    const getUserTypeBadge = (type: KYCRequest['userType']) => {
      const styles = {
        tenant: 'bg-blue-500/10 text-blue-700',
        landlord: 'bg-violet-100 text-violet-700',
        guarantor: 'bg-emerald-100 text-emerald-700',
      };
      const labels = {
        tenant: 'Locatario',
        landlord: 'Proprietario',
        guarantor: 'Garantidor',
      };
      return <Badge className={styles[type]}>{labels[type]}</Badge>;
    };

    const pendingKYC = kycRequests.filter(k => k.status === 'pending');
    const inReviewKYC = kycRequests.filter(k => k.status === 'in_review');

    return (
      <div className="space-y-6">
        {/* Metricas */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-amber-800">Pendentes</CardTitle>
              <Fingerprint className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-700">{pendingKYC.length}</div>
              <p className="text-xs text-amber-600">Aguardando analise</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-400">Em Analise</CardTitle>
              <Eye className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-700">{inReviewKYC.length}</div>
              <p className="text-xs text-blue-400">Sendo verificados</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-emerald-400">Taxa Aprovacao</CardTitle>
              <CheckCircle className="h-4 w-4 text-emerald-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-700">87%</div>
              <p className="text-xs text-emerald-400">Ultimos 30 dias</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-violet-50 to-purple-50 border-violet-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-violet-800">Tempo Medio</CardTitle>
              <Clock className="h-4 w-4 text-violet-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-violet-700">4h</div>
              <p className="text-xs text-violet-600">Para aprovacao</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabela de KYC */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Fingerprint className="h-5 w-5" />
                  Solicitacoes KYC
                </CardTitle>
                <CardDescription>Verificacao de identidade e documentos</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => alert("Funcionalidade de filtros em desenvolvimento")}>
                  <Filter className="h-4 w-4 mr-2" />
                  Filtrar
                </Button>
                <Dialog open={newKYCOpen} onOpenChange={setNewKYCOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Solicitar KYC
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Solicitar Verificacao KYC</DialogTitle>
                      <DialogDescription>Envie uma solicitacao de KYC para um usuario</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <Label>E-mail do Usuario</Label>
                        <Input placeholder="usuario@email.com" />
                      </div>
                      <div className="space-y-2">
                        <Label>Tipo de Usuario</Label>
                        <Select>
                          <SelectTrigger><SelectValue placeholder="Selecione o tipo" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="tenant">Locatario</SelectItem>
                            <SelectItem value="landlord">Proprietario</SelectItem>
                            <SelectItem value="guarantor">Garantidor</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Mensagem (opcional)</Label>
                        <Textarea placeholder="Instrucoes adicionais..." />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setNewKYCOpen(false)}>Cancelar</Button>
                      <Button onClick={() => { alert('Solicitacao enviada!'); setNewKYCOpen(false); }}>
                        <Send className="h-4 w-4 mr-2" />Enviar Solicitacao
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table className="min-w-[800px]">
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Documentos</TableHead>
                  <TableHead className="text-center">Risk Score</TableHead>
                  <TableHead>Submetido</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Acoes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {kycRequests.map(kyc => (
                  <TableRow key={kyc.id}>
                    <TableCell className="font-mono text-sm">{kyc.id}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-semibold">{kyc.fullName}</p>
                        <p className="text-xs text-muted-foreground">{kyc.cpfCnpj}</p>
                      </div>
                    </TableCell>
                    <TableCell>{getUserTypeBadge(kyc.userType)}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <p>{kyc.email}</p>
                        <p className="text-muted-foreground">{kyc.phone}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {kyc.documents.map((doc, i) => (
                          <Badge
                            key={i}
                            variant="outline"
                            className={cn(
                              "text-xs",
                              doc.status === 'valid' && 'border-green-500 text-emerald-400',
                              doc.status === 'invalid' && 'border-red-500 text-red-400',
                              doc.status === 'pending' && 'border-amber-500 text-amber-600'
                            )}
                          >
                            {doc.type.split(' ')[0]}
                          </Badge>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {kyc.riskScore !== undefined && (
                        <div className={cn(
                          "inline-flex items-center justify-center w-12 h-8 rounded-full text-sm font-bold",
                          kyc.riskScore >= 70 ? 'bg-emerald-500/10 text-green-700' :
                          kyc.riskScore >= 50 ? 'bg-amber-100 text-amber-700' :
                          'bg-red-500/10 text-red-700'
                        )}>
                          {kyc.riskScore}
                        </div>
                      )}
                    </TableCell>
                    <TableCell>{kyc.submittedAt.toLocaleDateString('pt-BR')}</TableCell>
                    <TableCell>{getStatusBadge(kyc.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-1 justify-end">
                        <Button variant="ghost" size="sm" title="Analisar" onClick={() => setSelectedKYC(kyc)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        {kyc.status === 'pending' && (
                          <>
                            <Button variant="ghost" size="sm" title="Aprovar" className="text-emerald-400" onClick={() => alert(`Aprovando KYC ${kyc.id}...`)}>
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" title="Rejeitar" className="text-red-400" onClick={() => alert(`Rejeitando KYC ${kyc.id}...`)}>
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Modal de Analise KYC */}
        <Dialog open={!!selectedKYC} onOpenChange={(open) => !open && setSelectedKYC(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            {selectedKYC && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Fingerprint className="h-5 w-5 text-indigo-600" />
                    Analise KYC - {selectedKYC.id}
                  </DialogTitle>
                  <DialogDescription>{selectedKYC.fullName}</DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                  <div className="flex items-center gap-4">
                    {getStatusBadge(selectedKYC.status)}
                    {getUserTypeBadge(selectedKYC.userType)}
                    {selectedKYC.riskScore !== undefined && (
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Target className="h-3 w-3" />
                        Risk Score: {selectedKYC.riskScore}
                      </Badge>
                    )}
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-lg">
                    <div><p className="text-sm text-muted-foreground">Nome Completo</p><p className="font-medium">{selectedKYC.fullName}</p></div>
                    <div><p className="text-sm text-muted-foreground">CPF/CNPJ</p><p className="font-mono">{selectedKYC.cpfCnpj}</p></div>
                    <div><p className="text-sm text-muted-foreground">E-mail</p><p className="font-medium">{selectedKYC.email}</p></div>
                    <div><p className="text-sm text-muted-foreground">Telefone</p><p className="font-medium">{selectedKYC.phone}</p></div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Documentos Enviados</h4>
                    <div className="space-y-2">
                      {selectedKYC.documents.map((doc, i) => (
                        <div key={i} className={cn(
                          "flex items-center justify-between p-3 rounded-lg border",
                          doc.status === 'valid' && 'bg-green-50 border-green-200',
                          doc.status === 'invalid' && 'bg-red-50 border-red-200',
                          doc.status === 'pending' && 'bg-amber-50 border-amber-200'
                        )}>
                          <div className="flex items-center gap-3">
                            <FileText className={cn(
                              "h-5 w-5",
                              doc.status === 'valid' && 'text-emerald-400',
                              doc.status === 'invalid' && 'text-red-400',
                              doc.status === 'pending' && 'text-amber-600'
                            )} />
                            <div>
                              <p className="font-medium">{doc.type}</p>
                              <p className="text-xs text-muted-foreground">{doc.fileName}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={cn(
                              doc.status === 'valid' && 'bg-emerald-500/10 text-green-700',
                              doc.status === 'invalid' && 'bg-red-500/10 text-red-700',
                              doc.status === 'pending' && 'bg-amber-100 text-amber-700'
                            )}>
                              {doc.status === 'valid' ? 'Valido' : doc.status === 'invalid' ? 'Invalido' : 'Pendente'}
                            </Badge>
                            <Button variant="ghost" size="sm" onClick={() => alert(`Visualizando ${doc.fileName}...`)}>
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {selectedKYC.rejectionReason && (
                    <Alert variant="destructive">
                      <AlertOctagon className="h-4 w-4" />
                      <AlertTitle>Motivo da Rejeicao</AlertTitle>
                      <AlertDescription>{selectedKYC.rejectionReason}</AlertDescription>
                    </Alert>
                  )}

                  {selectedKYC.status === 'pending' && (
                    <div className="space-y-2">
                      <Label>Notas da Analise</Label>
                      <Textarea placeholder="Observacoes sobre a analise dos documentos..." />
                    </div>
                  )}
                </div>

                <DialogFooter className="gap-2">
                  {selectedKYC.status === 'pending' && (
                    <>
                      <Button variant="outline" className="text-red-400 border-red-600" onClick={() => alert('KYC rejeitado!')}>
                        <XCircle className="h-4 w-4 mr-2" />Rejeitar
                      </Button>
                      <Button className="bg-green-600 hover:bg-green-700" onClick={() => alert('KYC aprovado!')}>
                        <CheckCircle className="h-4 w-4 mr-2" />Aprovar
                      </Button>
                    </>
                  )}
                  <Button onClick={() => setSelectedKYC(null)}>Fechar</Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    );
  };

  // ============= MODULO: PROCESSOS AUTOMATIZADOS =============

  interface AutomatedProcess {
    id: string;
    name: string;
    description: string;
    type: 'payment_split' | 'kyc_verification' | 'inspection_trigger' | 'delinquency_alert' | 'contract_renewal' | 'report_generation' | 'notification';
    status: 'active' | 'paused' | 'error' | 'disabled';
    schedule: string;
    lastRun?: Date;
    nextRun?: Date;
    executionsToday: number;
    successRate: number;
    avgExecutionTime: number;
    createdAt: Date;
  }

  const [automatedProcesses] = useState<AutomatedProcess[]>([
    { id: 'PROC-001', name: 'Split de Pagamentos 85/5/5/5', description: 'Distribui automaticamente os pagamentos de aluguel entre proprietario, seguradora, plataforma e garantidor', type: 'payment_split', status: 'active', schedule: 'A cada pagamento recebido', lastRun: new Date(Date.now() - 300000), executionsToday: 47, successRate: 99.8, avgExecutionTime: 2.3, createdAt: new Date('2024-01-01') },
    { id: 'PROC-002', name: 'Verificacao KYC Automatica', description: 'Valida documentos enviados usando IA e bases de dados publicas', type: 'kyc_verification', status: 'active', schedule: 'A cada novo upload', lastRun: new Date(Date.now() - 1800000), executionsToday: 12, successRate: 87.5, avgExecutionTime: 15.7, createdAt: new Date('2024-03-15') },
    { id: 'PROC-003', name: 'Alerta de Inadimplencia', description: 'Notifica partes interessadas quando pagamento esta atrasado', type: 'delinquency_alert', status: 'active', schedule: 'Diariamente as 9h', lastRun: new Date(Date.now() - 3600000), nextRun: new Date(Date.now() + 86400000), executionsToday: 1, successRate: 100, avgExecutionTime: 5.2, createdAt: new Date('2024-02-01') },
    { id: 'PROC-004', name: 'Agendamento de Vistorias', description: 'Agenda automaticamente vistorias periodicas conforme contrato', type: 'inspection_trigger', status: 'active', schedule: 'Semanalmente', lastRun: new Date(Date.now() - 172800000), nextRun: new Date(Date.now() + 432000000), executionsToday: 0, successRate: 95.2, avgExecutionTime: 8.1, createdAt: new Date('2024-06-01') },
    { id: 'PROC-005', name: 'Renovacao de Contratos', description: 'Envia notificacoes e prepara renovacao 60 dias antes do vencimento', type: 'contract_renewal', status: 'active', schedule: 'Diariamente as 8h', lastRun: new Date(Date.now() - 7200000), nextRun: new Date(Date.now() + 79200000), executionsToday: 1, successRate: 92.3, avgExecutionTime: 12.4, createdAt: new Date('2024-04-01') },
    { id: 'PROC-006', name: 'Geracao de Relatorios DRE', description: 'Gera relatorios contabeis automaticamente no fechamento mensal', type: 'report_generation', status: 'paused', schedule: 'Mensal - dia 1', lastRun: new Date('2026-01-01'), nextRun: new Date('2026-02-01'), executionsToday: 0, successRate: 100, avgExecutionTime: 45.6, createdAt: new Date('2024-01-01') },
    { id: 'PROC-007', name: 'Notificacoes Push', description: 'Envia notificacoes via WhatsApp, Email e App', type: 'notification', status: 'active', schedule: 'Em tempo real', lastRun: new Date(Date.now() - 60000), executionsToday: 234, successRate: 98.7, avgExecutionTime: 0.8, createdAt: new Date('2024-05-01') },
    { id: 'PROC-008', name: 'Backup Blockchain', description: 'Sincroniza dados on-chain com banco de dados local', type: 'report_generation', status: 'error', schedule: 'A cada 6 horas', lastRun: new Date(Date.now() - 21600000), nextRun: new Date(Date.now() + 3600000), executionsToday: 3, successRate: 75, avgExecutionTime: 120, createdAt: new Date('2024-07-01') },
  ]);

  const [newProcessOpen, setNewProcessOpen] = useState(false);
  const [selectedProcess, setSelectedProcess] = useState<AutomatedProcess | null>(null);

  const renderProcesses = () => {
    const getStatusBadge = (status: AutomatedProcess['status']) => {
      const styles = {
        active: 'bg-emerald-500/10 text-green-700',
        paused: 'bg-amber-100 text-amber-700',
        error: 'bg-red-500/10 text-red-700',
        disabled: 'bg-card text-muted-foreground',
      };
      const labels = {
        active: 'Ativo',
        paused: 'Pausado',
        error: 'Erro',
        disabled: 'Desativado',
      };
      return <Badge className={styles[status]}>{labels[status]}</Badge>;
    };

    const getTypeIcon = (type: AutomatedProcess['type']) => {
      const icons = {
        payment_split: CircleDollarSign,
        kyc_verification: Fingerprint,
        inspection_trigger: Camera,
        delinquency_alert: AlertTriangle,
        contract_renewal: FileSignature,
        report_generation: FileSpreadsheet,
        notification: Bell,
      };
      return icons[type];
    };

    const activeProcesses = automatedProcesses.filter(p => p.status === 'active');
    const errorProcesses = automatedProcesses.filter(p => p.status === 'error');
    const totalExecutions = automatedProcesses.reduce((sum, p) => sum + p.executionsToday, 0);
    const avgSuccessRate = automatedProcesses.reduce((sum, p) => sum + p.successRate, 0) / automatedProcesses.length;

    return (
      <div className="space-y-6">
        {/* Alertas de Erro */}
        {errorProcesses.length > 0 && (
          <Alert variant="destructive">
            <AlertOctagon className="h-4 w-4" />
            <AlertTitle>Processos com Erro</AlertTitle>
            <AlertDescription>
              {errorProcesses.length} processo(s) com falha: {errorProcesses.map(p => p.name).join(', ')}
            </AlertDescription>
          </Alert>
        )}

        {/* Metricas */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-emerald-400">Processos Ativos</CardTitle>
              <Zap className="h-4 w-4 text-emerald-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-700">{activeProcesses.length}</div>
              <p className="text-xs text-emerald-400">de {automatedProcesses.length} total</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-400">Execucoes Hoje</CardTitle>
              <Activity className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-700">{totalExecutions}</div>
              <p className="text-xs text-blue-400">Transacoes processadas</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-emerald-800">Taxa de Sucesso</CardTitle>
              <CheckCircle className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-700">{avgSuccessRate.toFixed(1)}%</div>
              <p className="text-xs text-emerald-600">Media geral</p>
            </CardContent>
          </Card>

          <Card className={cn("bg-gradient-to-br border-red-200", errorProcesses.length > 0 ? 'from-red-50 to-rose-50' : 'from-gray-50 to-slate-50 border-border')}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className={cn("text-sm font-medium", errorProcesses.length > 0 ? 'text-red-400' : 'text-foreground')}>Com Erro</CardTitle>
              <AlertTriangle className={cn("h-4 w-4", errorProcesses.length > 0 ? 'text-red-400' : 'text-muted-foreground')} />
            </CardHeader>
            <CardContent>
              <div className={cn("text-2xl font-bold", errorProcesses.length > 0 ? 'text-red-700' : 'text-muted-foreground')}>{errorProcesses.length}</div>
              <p className={cn("text-xs", errorProcesses.length > 0 ? 'text-red-400' : 'text-muted-foreground')}>Requerem atencao</p>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Processos */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Workflow className="h-5 w-5" />
                  Processos Automatizados
                </CardTitle>
                <CardDescription>Automacoes e workflows do sistema</CardDescription>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => alert('Executando todos os processos agendados...')}>
                  <Play className="h-4 w-4 mr-2" />
                  Executar Todos
                </Button>
                <Dialog open={newProcessOpen} onOpenChange={setNewProcessOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Novo Processo
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Criar Novo Processo</DialogTitle>
                      <DialogDescription>Configure um novo processo automatizado</DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="space-y-2">
                        <Label>Nome do Processo</Label>
                        <Input placeholder="Ex: Notificacao de Vencimento" />
                      </div>
                      <div className="space-y-2">
                        <Label>Tipo</Label>
                        <Select>
                          <SelectTrigger><SelectValue placeholder="Selecione o tipo" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="payment_split">Split de Pagamento</SelectItem>
                            <SelectItem value="notification">Notificacao</SelectItem>
                            <SelectItem value="report_generation">Geracao de Relatorio</SelectItem>
                            <SelectItem value="delinquency_alert">Alerta de Inadimplencia</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Agendamento</Label>
                        <Select>
                          <SelectTrigger><SelectValue placeholder="Selecione a frequencia" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="realtime">Tempo Real</SelectItem>
                            <SelectItem value="hourly">A cada hora</SelectItem>
                            <SelectItem value="daily">Diariamente</SelectItem>
                            <SelectItem value="weekly">Semanalmente</SelectItem>
                            <SelectItem value="monthly">Mensalmente</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Descricao</Label>
                        <Textarea placeholder="Descreva o que este processo faz..." />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setNewProcessOpen(false)}>Cancelar</Button>
                      <Button onClick={() => { alert('Processo criado!'); setNewProcessOpen(false); }}>
                        <Plus className="h-4 w-4 mr-2" />Criar Processo
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {automatedProcesses.map(process => {
                const TypeIcon = getTypeIcon(process.type);
                return (
                  <Card key={process.id} className={cn(
                    "transition-all hover:shadow-md",
                    process.status === 'error' && 'border-red-300 bg-red-50/50',
                    process.status === 'paused' && 'opacity-75'
                  )}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "p-3 rounded-xl",
                          process.status === 'active' && 'bg-emerald-500/10',
                          process.status === 'paused' && 'bg-amber-100',
                          process.status === 'error' && 'bg-red-500/10',
                          process.status === 'disabled' && 'bg-card'
                        )}>
                          <TypeIcon className={cn(
                            "h-6 w-6",
                            process.status === 'active' && 'text-emerald-400',
                            process.status === 'paused' && 'text-amber-600',
                            process.status === 'error' && 'text-red-400',
                            process.status === 'disabled' && 'text-muted-foreground'
                          )} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold truncate">{process.name}</h4>
                            {getStatusBadge(process.status)}
                          </div>
                          <p className="text-sm text-muted-foreground truncate">{process.description}</p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{process.schedule}</span>
                            {process.lastRun && <span>Ultima: {process.lastRun.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}</span>}
                          </div>
                        </div>

                        <div className="hidden md:flex items-center gap-6 text-center">
                          <div>
                            <p className="text-lg font-bold">{process.executionsToday}</p>
                            <p className="text-xs text-muted-foreground">Hoje</p>
                          </div>
                          <div>
                            <p className={cn(
                              "text-lg font-bold",
                              process.successRate >= 95 ? 'text-emerald-400' :
                              process.successRate >= 80 ? 'text-amber-600' : 'text-red-400'
                            )}>{process.successRate}%</p>
                            <p className="text-xs text-muted-foreground">Sucesso</p>
                          </div>
                          <div>
                            <p className="text-lg font-bold">{process.avgExecutionTime}s</p>
                            <p className="text-xs text-muted-foreground">Tempo</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Switch
                            checked={process.status === 'active'}
                            onCheckedChange={() => alert(`${process.status === 'active' ? 'Pausando' : 'Ativando'} processo...`)}
                          />
                          <Button variant="ghost" size="sm" onClick={() => setSelectedProcess(process)}>
                            <Settings className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => alert(`Executando ${process.name}...`)}>
                            <Play className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Modal de Configuracao do Processo */}
        <Dialog open={!!selectedProcess} onOpenChange={(open) => !open && setSelectedProcess(null)}>
          <DialogContent className="max-w-2xl">
            {selectedProcess && (
              <>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Workflow className="h-5 w-5 text-indigo-600" />
                    Configurar Processo
                  </DialogTitle>
                  <DialogDescription>{selectedProcess.name}</DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-4">
                  <div className="flex items-center gap-4">
                    {getStatusBadge(selectedProcess.status)}
                    <Badge variant="outline">{selectedProcess.schedule}</Badge>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-lg">
                    <p className="text-sm">{selectedProcess.description}</p>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg text-center">
                      <p className="text-2xl font-bold text-blue-700">{selectedProcess.executionsToday}</p>
                      <p className="text-xs text-blue-400">Execucoes Hoje</p>
                    </div>
                    <div className={cn("p-4 rounded-lg text-center", selectedProcess.successRate >= 95 ? 'bg-green-50' : selectedProcess.successRate >= 80 ? 'bg-amber-50' : 'bg-red-50')}>
                      <p className={cn("text-2xl font-bold", selectedProcess.successRate >= 95 ? 'text-green-700' : selectedProcess.successRate >= 80 ? 'text-amber-700' : 'text-red-700')}>{selectedProcess.successRate}%</p>
                      <p className="text-xs text-muted-foreground">Taxa de Sucesso</p>
                    </div>
                    <div className="bg-violet-50 p-4 rounded-lg text-center">
                      <p className="text-2xl font-bold text-violet-700">{selectedProcess.avgExecutionTime}s</p>
                      <p className="text-xs text-violet-600">Tempo Medio</p>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Status do Processo</p>
                        <p className="text-sm text-muted-foreground">Ativar ou pausar este processo</p>
                      </div>
                      <Switch checked={selectedProcess.status === 'active'} />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Notificacoes de Erro</p>
                        <p className="text-sm text-muted-foreground">Receber alertas quando falhar</p>
                      </div>
                      <Switch defaultChecked />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Logs Detalhados</p>
                        <p className="text-sm text-muted-foreground">Registrar todas as execucoes</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </div>
                </div>

                <DialogFooter className="gap-2">
                  <Button variant="outline" onClick={() => alert('Abrindo logs...')}>
                    <FileText className="h-4 w-4 mr-2" />Ver Logs
                  </Button>
                  <Button variant="outline" onClick={() => alert(`Executando ${selectedProcess.name}...`)}>
                    <Play className="h-4 w-4 mr-2" />Executar Agora
                  </Button>
                  <Button onClick={() => setSelectedProcess(null)}>Fechar</Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    );
  };

  // ============= MODULO: SERVICOS =============

  const renderServices = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground">Configure os servicos disponiveis na plataforma</p>
        <Button onClick={handleOpenNewService}><Plus className="h-4 w-4 mr-2" />Novo Servico</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[
          { id: 'vistoria', name: 'Vistoria Digital', description: 'Vistorias com registro em blockchain', status: 'active', icon: Camera, color: 'blue', category: 'verification' as const },
          { id: 'seguro', name: 'Seguro Fianca', description: 'Integracao com seguradoras parceiras', status: 'active', icon: ShieldCheck, color: 'green', category: 'security' as const },
          { id: 'assinatura', name: 'Assinatura Digital', description: 'Contratos assinados via ZapSign', status: 'active', icon: PenTool, color: 'violet', category: 'document' as const },
          { id: 'kyc', name: 'Verificacao KYC', description: 'Validacao de identidade automatica', status: 'active', icon: Fingerprint, color: 'amber', category: 'verification' as const },
          { id: 'pix', name: 'Pagamento PIX', description: 'Cobrancas via Asaas/Stripe', status: 'active', icon: QrCode, color: 'emerald', category: 'payment' as const },
          { id: 'chatbot', name: 'Chatbot IA', description: 'Atendimento automatizado', status: 'active', icon: Bot, color: 'purple', category: 'automation' as const },
        ].map((service, i) => (
          <Card key={i} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={cn("p-3 rounded-xl", `bg-${service.color}-100`)}>
                  <service.icon className={cn("h-6 w-6", `text-${service.color}-600`)} />
                </div>
                <Switch defaultChecked={service.status === 'active'} />
              </div>
              <h4 className="font-semibold mb-1">{service.name}</h4>
              <p className="text-sm text-muted-foreground mb-4">{service.description}</p>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => handleOpenEditService({
                  id: service.id,
                  name: service.name,
                  description: service.description,
                  category: service.category,
                  icon: service.color,
                  isActive: service.status === 'active',
                })}
              >
                <Settings className="h-4 w-4 mr-2" />Configurar
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dialog de Servico */}
      <ServiceDialog
        open={isServiceDialogOpen}
        onOpenChange={setIsServiceDialogOpen}
        service={selectedService}
        onSave={selectedService?.id ? handleEditService : handleCreateService}
      />
    </div>
  );

  // ============= MODULO: INTEGRACOES =============

  const renderIntegrations = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground">Gerencie as integracoes com sistemas externos</p>
        <Button onClick={handleOpenNewIntegration}><Plus className="h-4 w-4 mr-2" />Nova Integracao</Button>
      </div>

      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">Ativas</TabsTrigger>
          <TabsTrigger value="available">Disponiveis</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {/* GitHub Integration - Link to Deploy Page */}
          <Card className="border-purple-200 bg-gradient-to-r from-purple-50 to-slate-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-slate-900 rounded-xl text-2xl text-white">
                  <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z"/></svg>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold">GitHub</h4>
                  <p className="text-sm text-muted-foreground">Versionamento e deploy automatico do codigo</p>
                </div>
                <Badge className="bg-emerald-500/10 text-green-700">Conectado</Badge>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleOpenEditIntegration({
                    id: 'github',
                    name: 'GitHub',
                    description: 'Versionamento e deploy automatico do codigo',
                    provider: 'custom',
                    status: 'connected',
                    lastSync: new Date().toISOString(),
                  })}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Configurar
                </Button>
              </div>
            </CardContent>
          </Card>

          {[
            { id: 'asaas', name: 'Asaas', description: 'Gateway de pagamentos PIX/Boleto', status: 'connected', logo: '💰', provider: 'asaas' },
            { id: 'zapsign', name: 'ZapSign', description: 'Assinatura digital de contratos', status: 'connected', logo: '✍️', provider: 'zapsign' },
            { id: 'polygon', name: 'Polygon', description: 'Blockchain para smart contracts', status: 'connected', logo: '⬡', provider: 'polygon' },
            { id: 'ipfs', name: 'IPFS', description: 'Armazenamento descentralizado', status: 'connected', logo: '🌐', provider: 'ipfs' },
            { id: 'whatsapp', name: 'WhatsApp Business', description: 'Notificacoes e chatbot', status: 'connected', logo: '💬', provider: 'whatsapp' },
          ].map((integration, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-slate-100 rounded-xl text-2xl">{integration.logo}</div>
                  <div className="flex-1">
                    <h4 className="font-semibold">{integration.name}</h4>
                    <p className="text-sm text-muted-foreground">{integration.description}</p>
                  </div>
                  <Badge className="bg-emerald-500/10 text-green-700">Conectado</Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenEditIntegration({
                      id: integration.id,
                      name: integration.name,
                      description: integration.description,
                      provider: integration.provider,
                      status: integration.status,
                      lastSync: new Date().toISOString(),
                    })}
                  >
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="available" className="space-y-4">
          {[
            { id: 'drex', name: 'Drex (Real Digital)', description: 'Integracao com CBDC brasileiro', status: 'coming_soon', logo: '🇧🇷', provider: 'custom' },
            { id: 'stripe', name: 'Stripe', description: 'Pagamentos internacionais', status: 'available', logo: '💳', provider: 'custom' },
            { id: 'analytics', name: 'Google Analytics', description: 'Metricas e analytics', status: 'available', logo: '📊', provider: 'custom' },
          ].map((integration, i) => (
            <Card key={i} className="opacity-75">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-slate-100 rounded-xl text-2xl">{integration.logo}</div>
                  <div className="flex-1">
                    <h4 className="font-semibold">{integration.name}</h4>
                    <p className="text-sm text-muted-foreground">{integration.description}</p>
                  </div>
                  {integration.status === 'coming_soon' ? (
                    <Badge variant="secondary">Em Breve</Badge>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => handleOpenEditIntegration({
                        id: integration.id,
                        name: integration.name,
                        description: integration.description,
                        provider: integration.provider,
                        status: 'disconnected',
                      })}
                    >
                      <Plus className="h-4 w-4 mr-2" />Conectar
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      {/* Dialog de Integracao */}
      <IntegrationDialog
        open={isIntegrationDialogOpen}
        onOpenChange={setIsIntegrationDialogOpen}
        integration={selectedIntegration}
        onSave={selectedIntegration?.id ? handleEditIntegration : handleCreateIntegration}
        onTest={handleTestIntegration}
      />
    </div>
  );

  // ============= MODULO: WHATSAPP BUSINESS API =============

  const renderWhatsAppDashboard = () => <WhatsAppDashboard />;

  // ============= MODULO: DASHBOARD DE LIQUIDEZ =============

  const renderLiquidityDashboard = () => <LiquidityDashboard />;

  // ============= MODULO: INADIMPLENCIA =============

  const renderDelinquency = () => {
    const lateContracts = contracts.filter(c => c.paymentStatus === 'late' || c.paymentStatus === 'defaulted');

    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-amber-800">Em Atraso</CardTitle>
              <Clock className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-700">{lateContracts.filter(c => c.paymentStatus === 'late').length}</div>
              <p className="text-xs text-amber-600">1-30 dias</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-rose-50 border-red-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-red-400">Inadimplentes</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-700">{lateContracts.filter(c => c.paymentStatus === 'defaulted').length}</div>
              <p className="text-xs text-red-400">+30 dias</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-emerald-800">Taxa de Adimplencia</CardTitle>
              <CheckCircle className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-700">97.2%</div>
              <p className="text-xs text-emerald-600">Ultimos 12 meses</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Contratos em Atraso</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table className="min-w-[700px]">
              <TableHeader>
                <TableRow>
                  <TableHead>Contrato</TableHead>
                  <TableHead>Locatario</TableHead>
                  <TableHead>Imovel</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Dias Atraso</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Acoes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lateContracts.map(contract => (
                  <TableRow key={contract.id}>
                    <TableCell className="font-mono">{contract.id}</TableCell>
                    <TableCell>{contract.tenantName}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{contract.propertyAddress}</TableCell>
                    <TableCell className="font-semibold">{formatCurrency(contract.rentAmount)}</TableCell>
                    <TableCell>
                      <Badge className={contract.paymentStatus === 'defaulted' ? 'bg-red-500/10 text-red-700' : 'bg-amber-100 text-amber-700'}>
                        {contract.paymentStatus === 'defaulted' ? '+30' : '1-30'} dias
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={contract.paymentStatus === 'defaulted' ? 'bg-red-500/10 text-red-700' : 'bg-amber-100 text-amber-700'}>
                        {contract.paymentStatus === 'defaulted' ? 'Inadimplente' : 'Atrasado'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={() => alert(`Enviando cobranca para ${contract.tenantName}...`)}>
                        <Send className="h-4 w-4 mr-2" />Cobrar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    );
  };

  // ============= NOVOS RELATORIOS ERP DETALHADOS =============

  const renderReportContracts = () => {
    const contractsByStatus = {
      active: contracts.filter(c => c.status === 'active'),
      pending: contracts.filter(c => c.status === 'pending_signatures' || c.status === 'pending_deposit'),
      expired: contracts.filter(c => c.status === 'expired'),
    };
    const monthlyData: Array<{ month: string; novos: number; renovados: number; encerrados: number }> = [];

    return (
      <div className="space-y-6">
        {/* Filtros */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Filtros:</span>
              </div>
              <Select defaultValue="all">
                <SelectTrigger className="w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Ativos</SelectItem>
                  <SelectItem value="pending">Pendentes</SelectItem>
                  <SelectItem value="expired">Vencidos</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="all">
                <SelectTrigger className="w-[150px]"><SelectValue placeholder="Tipo" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="residential">Residencial</SelectItem>
                  <SelectItem value="commercial">Comercial</SelectItem>
                </SelectContent>
              </Select>
              <Input placeholder="Buscar locatario..." className="w-[200px]" />
              <div className="ml-auto flex gap-2">
                <Button variant="outline" size="sm" onClick={exportContractsExcel}><FileSpreadsheet className="h-4 w-4 mr-2" />Excel</Button>
                <Button variant="outline" size="sm" onClick={exportContractsPDF}><FileText className="h-4 w-4 mr-2" />PDF</Button>
                <Button size="sm" onClick={exportContractsExcel}><Download className="h-4 w-4 mr-2" />Exportar</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* KPIs */}
        <div className="grid gap-4 md:grid-cols-5">
          <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total Contratos</CardTitle></CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{contracts.length}</div>
              <p className="text-xs text-muted-foreground mt-1">+12 este mes</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Ativos</CardTitle></CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">{contractsByStatus.active.length}</div>
              <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
                <div className="bg-emerald-500 h-1.5 rounded-full" style={{width: `${(contractsByStatus.active.length / contracts.length) * 100}%`}} />
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Vencendo (30d)</CardTitle></CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-amber-600">23</div>
              <p className="text-xs text-amber-600 mt-1">Requer atenção</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-rose-50 to-red-50 border-rose-200">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Vencidos</CardTitle></CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-rose-600">{contractsByStatus.expired.length}</div>
              <p className="text-xs text-rose-600 mt-1">Ação necessária</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-violet-50 to-purple-50 border-violet-200">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Valor Carteira</CardTitle></CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(contracts.reduce((sum, c) => sum + c.rentAmount, 0))}</div>
              <p className="text-xs text-emerald-600 mt-1">+8.5% vs mês anterior</p>
            </CardContent>
          </Card>
        </div>

        {/* Gráfico de Evolução */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5" />Evolucao Mensal</CardTitle>
              <CardDescription>Movimentacao de contratos nos ultimos 6 meses</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {monthlyData.map((m, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <span className="w-10 text-sm font-medium">{m.month}</span>
                    <div className="flex-1 flex gap-1 h-6">
                      <div className="bg-emerald-500 rounded-l" style={{width: `${(m.novos / 80) * 100}%`}} title={`Novos: ${m.novos}`} />
                      <div className="bg-blue-500" style={{width: `${(m.renovados / 80) * 100}%`}} title={`Renovados: ${m.renovados}`} />
                      <div className="bg-rose-400 rounded-r" style={{width: `${(m.encerrados / 80) * 100}%`}} title={`Encerrados: ${m.encerrados}`} />
                    </div>
                    <span className="text-xs text-muted-foreground w-20">+{m.novos - m.encerrados} liq.</span>
                  </div>
                ))}
              </div>
              <div className="flex gap-4 mt-4 text-xs">
                <div className="flex items-center gap-1"><div className="w-3 h-3 bg-emerald-500 rounded" />Novos</div>
                <div className="flex items-center gap-1"><div className="w-3 h-3 bg-blue-500 rounded" />Renovados</div>
                <div className="flex items-center gap-1"><div className="w-3 h-3 bg-rose-400 rounded" />Encerrados</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><PieChart className="h-5 w-5" />Distribuicao por Tipo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Home className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium">Residencial</p>
                      <p className="text-xs text-muted-foreground">Apartamentos e casas</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold">847</p>
                    <p className="text-xs text-muted-foreground">68%</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Building2 className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-medium">Comercial</p>
                      <p className="text-xs text-muted-foreground">Salas e lojas</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold">312</p>
                    <p className="text-xs text-muted-foreground">25%</p>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Warehouse className="h-5 w-5 text-amber-600" />
                    <div>
                      <p className="font-medium">Industrial</p>
                      <p className="text-xs text-muted-foreground">Galpoes e depositos</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold">89</p>
                    <p className="text-xs text-muted-foreground">7%</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabela Detalhada */}
        <Card>
          <CardHeader>
            <CardTitle>Contratos Detalhados</CardTitle>
            <CardDescription>Lista completa com todas as informacoes contratuais</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[400px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">Contrato</TableHead>
                    <TableHead>Locatario</TableHead>
                    <TableHead>Imovel</TableHead>
                    <TableHead>Proprietario</TableHead>
                    <TableHead className="text-right">Aluguel</TableHead>
                    <TableHead>Inicio</TableHead>
                    <TableHead>Termino</TableHead>
                    <TableHead>Garantia</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Acoes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contracts.map(c => (
                    <TableRow key={c.id}>
                      <TableCell className="font-mono text-xs">{c.id}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-7 w-7"><AvatarFallback className="text-xs">{c.tenantName.slice(0,2).toUpperCase()}</AvatarFallback></Avatar>
                          <span className="font-medium">{c.tenantName}</span>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[180px] truncate">{c.propertyAddress}</TableCell>
                      <TableCell className="text-sm">Carlos Silva</TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(c.rentAmount)}</TableCell>
                      <TableCell className="text-sm">{new Date(c.startDate).toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell className="text-sm">{new Date(c.endDate).toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell><Badge variant="outline" className="text-xs">Fiador</Badge></TableCell>
                      <TableCell>
                        <Badge variant={c.status === 'active' ? 'default' : (c.status === 'pending_signatures' || c.status === 'pending_deposit') ? 'secondary' : 'destructive'}>
                          {c.status === 'active' ? 'Ativo' : (c.status === 'pending_signatures' || c.status === 'pending_deposit') ? 'Pendente' : 'Vencido'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => viewContractDetails(c)}><Eye className="h-4 w-4" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Modal Detalhes Contrato */}
        {selectedContractDetails && (
          <Dialog open={!!selectedContractDetails} onOpenChange={() => setSelectedContractDetails(null)}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Detalhes do Contrato #{selectedContractDetails.id}</DialogTitle>
                <DialogDescription>Informacoes completas do contrato de locacao</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Inquilino</Label>
                    <p className="font-medium">{selectedContractDetails.tenantName}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">CPF</Label>
                    <p className="font-medium">{selectedContractDetails.tenantCpf}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Imovel</Label>
                    <p className="font-medium">{selectedContractDetails.propertyAddress}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Proprietario</Label>
                    <p className="font-medium">{selectedContractDetails.landlordName}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Valor Aluguel</Label>
                    <p className="font-medium text-emerald-600">{formatCurrency(selectedContractDetails.rentAmount)}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Status</Label>
                    <Badge variant={selectedContractDetails.status === 'active' ? 'default' : 'secondary'}>
                      {selectedContractDetails.status === 'active' ? 'Ativo' : selectedContractDetails.status}
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Inicio</Label>
                    <p className="font-medium">{new Date(selectedContractDetails.startDate).toLocaleDateString('pt-BR')}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Termino</Label>
                    <p className="font-medium">{new Date(selectedContractDetails.endDate).toLocaleDateString('pt-BR')}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">NFT Token</Label>
                    <p className="font-mono text-xs">{selectedContractDetails.nftTokenId}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Seguradora</Label>
                    <p className="font-medium">{selectedContractDetails.insurerName}</p>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedContractDetails(null)}>Fechar</Button>
                <Button onClick={() => { exportContractsPDF(); setSelectedContractDetails(null); }}>
                  <Download className="h-4 w-4 mr-2" />Exportar PDF
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    );
  };

  const renderReportTenants = () => {
    const tenantData = [
      { id: 'T001', name: 'Maria Santos', email: 'maria@email.com', phone: '11 99999-1111', property: 'Apt 101 - Ed. Aurora', rent: 2500, status: 'adimplente', since: '2022-03-15', rating: 4.8 },
      { id: 'T002', name: 'João Oliveira', email: 'joao@email.com', phone: '11 99999-2222', property: 'Casa 45 - Jd. Primavera', rent: 3200, status: 'adimplente', since: '2021-08-01', rating: 4.5 },
      { id: 'T003', name: 'Ana Costa', email: 'ana@email.com', phone: '11 99999-3333', property: 'Sala 302 - Centro Emp.', rent: 1800, status: 'inadimplente', since: '2023-01-10', rating: 3.2 },
      { id: 'T004', name: 'Pedro Lima', email: 'pedro@email.com', phone: '11 99999-4444', property: 'Apt 502 - Ed. Central', rent: 2800, status: 'adimplente', since: '2022-11-20', rating: 4.9 },
      { id: 'T005', name: 'Carla Souza', email: 'carla@email.com', phone: '11 99999-5555', property: 'Loja 12 - Shopping Bela', rent: 5500, status: 'adimplente', since: '2020-06-15', rating: 4.7 },
    ];

    return (
      <div className="space-y-6">
        {/* Filtros */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">Filtros:</span>
              </div>
              <Select defaultValue="all">
                <SelectTrigger className="w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="adimplente">Adimplentes</SelectItem>
                  <SelectItem value="inadimplente">Inadimplentes</SelectItem>
                </SelectContent>
              </Select>
              <Input placeholder="Buscar inquilino..." className="w-[200px]" />
              <div className="ml-auto flex gap-2">
                <Button variant="outline" size="sm" onClick={exportTenantsExcel}><FileSpreadsheet className="h-4 w-4 mr-2" />Excel</Button>
                <Button variant="outline" size="sm" onClick={exportTenantsPDF}><FileText className="h-4 w-4 mr-2" />PDF</Button>
                <Button size="sm" onClick={exportTenantsExcel}><Download className="h-4 w-4 mr-2" />Exportar</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* KPIs */}
        <div className="grid gap-4 md:grid-cols-5">
          <Card className="bg-gradient-to-br from-cyan-50 to-teal-50 border-cyan-200">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total Inquilinos</CardTitle></CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1.523</div>
              <p className="text-xs text-emerald-600 mt-1">+45 este mes</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Adimplentes</CardTitle></CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">1.478</div>
              <p className="text-xs text-muted-foreground mt-1">97% do total</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-rose-50 to-red-50 border-rose-200">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Inadimplentes</CardTitle></CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-rose-600">45</div>
              <p className="text-xs text-rose-600 mt-1">R$ 156.780 em atraso</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Tempo Medio</CardTitle></CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2.4 anos</div>
              <p className="text-xs text-muted-foreground mt-1">de permanencia</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-violet-50 to-purple-50 border-violet-200">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Satisfacao</CardTitle></CardHeader>
            <CardContent>
              <div className="text-2xl font-bold flex items-center gap-1">4.2 <Star className="h-4 w-4 fill-amber-400 text-amber-400" /></div>
              <p className="text-xs text-muted-foreground mt-1">baseado em 890 avaliacoes</p>
            </CardContent>
          </Card>
        </div>

        {/* Distribuição e Histórico */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Distribuicao por Tempo de Locacao</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Menos de 1 ano</span>
                  <div className="flex items-center gap-2">
                    <div className="w-40 bg-gray-200 rounded-full h-2"><div className="bg-blue-500 h-2 rounded-full" style={{width: '35%'}} /></div>
                    <span className="text-sm font-medium">534</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">1 a 2 anos</span>
                  <div className="flex items-center gap-2">
                    <div className="w-40 bg-gray-200 rounded-full h-2"><div className="bg-emerald-500 h-2 rounded-full" style={{width: '45%'}} /></div>
                    <span className="text-sm font-medium">685</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">2 a 5 anos</span>
                  <div className="flex items-center gap-2">
                    <div className="w-40 bg-gray-200 rounded-full h-2"><div className="bg-purple-500 h-2 rounded-full" style={{width: '15%'}} /></div>
                    <span className="text-sm font-medium">228</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Mais de 5 anos</span>
                  <div className="flex items-center gap-2">
                    <div className="w-40 bg-gray-200 rounded-full h-2"><div className="bg-amber-500 h-2 rounded-full" style={{width: '5%'}} /></div>
                    <span className="text-sm font-medium">76</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Novos Inquilinos (Ultimos 6 meses)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between h-32 gap-2">
                {[45, 52, 48, 61, 55, 67].map((val, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full bg-blue-500 rounded-t" style={{height: `${(val / 70) * 100}%`}} />
                    <span className="text-xs text-muted-foreground">{['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'][i]}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabela */}
        <Card>
          <CardHeader>
            <CardTitle>Base Completa de Inquilinos</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[350px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Inquilino</TableHead>
                    <TableHead>Contato</TableHead>
                    <TableHead>Imovel</TableHead>
                    <TableHead className="text-right">Aluguel</TableHead>
                    <TableHead>Cliente desde</TableHead>
                    <TableHead>Avaliacao</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Acoes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tenantData.map(t => (
                    <TableRow key={t.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8"><AvatarFallback>{t.name.slice(0,2).toUpperCase()}</AvatarFallback></Avatar>
                          <div>
                            <p className="font-medium">{t.name}</p>
                            <p className="text-xs text-muted-foreground">{t.id}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p>{t.email}</p>
                          <p className="text-muted-foreground">{t.phone}</p>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[180px] truncate">{t.property}</TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(t.rent)}</TableCell>
                      <TableCell>{new Date(t.since).toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                          <span>{t.rating}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={t.status === 'adimplente' ? 'default' : 'destructive'}>
                          {t.status === 'adimplente' ? 'Adimplente' : 'Inadimplente'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => alert(`Detalhes do Inquilino:\n\nNome: ${t.name}\nEmail: ${t.email}\nTelefone: ${t.phone}\nImovel: ${t.property}\nAluguel: ${formatCurrency(t.rent)}\nStatus: ${t.status}\nDesde: ${t.since}`)}><Eye className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => alert(`Abrindo WhatsApp para ${t.name}...`)}><MessageSquare className="h-4 w-4" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderReportLandlords = () => {
    const landlordData = [
      { id: 'P001', name: 'Carlos Mendes', email: 'carlos@email.com', properties: 5, totalRent: 12500, pendingPayment: 0, rating: 4.9 },
      { id: 'P002', name: 'Fernanda Lima', email: 'fernanda@email.com', properties: 3, totalRent: 7800, pendingPayment: 2600, rating: 4.5 },
      { id: 'P003', name: 'Roberto Santos', email: 'roberto@email.com', properties: 8, totalRent: 24000, pendingPayment: 0, rating: 4.8 },
      { id: 'P004', name: 'Lucia Oliveira', email: 'lucia@email.com', properties: 2, totalRent: 4500, pendingPayment: 0, rating: 4.7 },
    ];

    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap items-center gap-4">
              <Input placeholder="Buscar proprietario..." className="w-[250px]" />
              <div className="ml-auto flex gap-2">
                <Button variant="outline" size="sm" onClick={exportLandlordsExcel}><FileSpreadsheet className="h-4 w-4 mr-2" />Excel</Button>
                <Button variant="outline" size="sm" onClick={exportLandlordsPDF}><FileText className="h-4 w-4 mr-2" />PDF</Button>
                <Button size="sm" onClick={exportLandlordsExcel}><Download className="h-4 w-4 mr-2" />Exportar</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-4">
          <Card className="bg-gradient-to-br from-indigo-50 to-blue-50 border-indigo-200">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total Proprietarios</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">678</div></CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Imoveis Gerenciados</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold text-emerald-600">1.248</div></CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-violet-50 to-purple-50 border-violet-200">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Repasses/Mes</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold">{formatCurrency(2_080_000)}</div></CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200">
            <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Satisfacao Media</CardTitle></CardHeader>
            <CardContent><div className="text-2xl font-bold flex items-center gap-1">4.5 <Star className="h-4 w-4 fill-amber-400 text-amber-400" /></div></CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader><CardTitle>Proprietarios e seus Imoveis</CardTitle></CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[350px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Proprietario</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="text-center">Imoveis</TableHead>
                    <TableHead className="text-right">Receita Mensal</TableHead>
                    <TableHead className="text-right">Repasse Pendente</TableHead>
                    <TableHead>Avaliacao</TableHead>
                    <TableHead className="text-right">Acoes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {landlordData.map(l => (
                    <TableRow key={l.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8"><AvatarFallback>{l.name.slice(0,2).toUpperCase()}</AvatarFallback></Avatar>
                          <div>
                            <p className="font-medium">{l.name}</p>
                            <p className="text-xs text-muted-foreground">{l.id}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{l.email}</TableCell>
                      <TableCell className="text-center"><Badge variant="secondary">{l.properties}</Badge></TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(l.totalRent)}</TableCell>
                      <TableCell className="text-right">
                        {l.pendingPayment > 0 ? (
                          <span className="text-amber-600 font-medium">{formatCurrency(l.pendingPayment)}</span>
                        ) : (
                          <span className="text-emerald-600">Em dia</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                          <span>{l.rating}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => alert(`Detalhes do Proprietario:\n\nNome: ${l.name}\nEmail: ${l.email}\nImoveis: ${l.properties}\nReceita Mensal: ${formatCurrency(l.totalRent)}\nPendente: ${l.pendingPayment > 0 ? formatCurrency(l.pendingPayment) : 'Nenhum'}\nAvaliacao: ${l.rating}`)}><Eye className="h-4 w-4" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderReportProperties = () => (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <Select defaultValue="all">
              <SelectTrigger className="w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="rented">Ocupados</SelectItem>
                <SelectItem value="available">Disponiveis</SelectItem>
                <SelectItem value="maintenance">Manutencao</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="all">
              <SelectTrigger className="w-[150px]"><SelectValue placeholder="Tipo" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="apartment">Apartamento</SelectItem>
                <SelectItem value="house">Casa</SelectItem>
                <SelectItem value="commercial">Comercial</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="Buscar por endereco..." className="w-[250px]" />
            <div className="ml-auto flex gap-2">
              <Button variant="outline" size="sm"><FileSpreadsheet className="h-4 w-4 mr-2" />Excel</Button>
              <Button size="sm"><Download className="h-4 w-4 mr-2" />Exportar</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-5">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total Imoveis</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{properties.length}</div></CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Ocupados</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-emerald-600">{properties.filter(p => p.status === 'rented').length}</div></CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Disponiveis</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-amber-600">{properties.filter(p => p.status === 'available').length}</div></CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-rose-50 to-red-50 border-rose-200">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Manutencao</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-rose-600">{properties.filter(p => p.status === 'maintenance').length}</div></CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-violet-50 to-purple-50 border-violet-200">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Taxa Ocupacao</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{((properties.filter(p => p.status === 'rented').length / properties.length) * 100).toFixed(1)}%</div></CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Distribuicao por Tipo</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { type: 'Apartamento', count: 523, color: 'bg-blue-500' },
                { type: 'Casa', count: 312, color: 'bg-emerald-500' },
                { type: 'Sala Comercial', count: 189, color: 'bg-purple-500' },
                { type: 'Loja', count: 98, color: 'bg-amber-500' },
                { type: 'Galpao', count: 45, color: 'bg-rose-500' },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded ${item.color}`} />
                    <span className="text-sm">{item.type}</span>
                  </div>
                  <span className="font-medium">{item.count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Valor Medio por Tipo</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { type: 'Apartamento', value: 2450 },
                { type: 'Casa', value: 3200 },
                { type: 'Sala Comercial', value: 1800 },
                { type: 'Loja', value: 4500 },
                { type: 'Galpao', value: 8500 },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-2 bg-slate-50 rounded">
                  <span className="text-sm">{item.type}</span>
                  <span className="font-medium">{formatCurrency(item.value)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Carteira de Imoveis Detalhada</CardTitle></CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[350px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Codigo</TableHead>
                  <TableHead>Endereco</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Proprietario</TableHead>
                  <TableHead className="text-right">Valor Aluguel</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Acoes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {properties.map(p => (
                  <TableRow key={p.id}>
                    <TableCell className="font-mono text-xs">{p.id}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{p.address}</TableCell>
                    <TableCell><Badge variant="outline">{p.propertyType}</Badge></TableCell>
                    <TableCell>{p.ownerName}</TableCell>
                    <TableCell className="text-right font-medium">{formatCurrency(p.rentAmount)}</TableCell>
                    <TableCell>
                      <Badge variant={p.status === 'rented' ? 'default' : p.status === 'available' ? 'secondary' : 'destructive'}>
                        {p.status === 'rented' ? 'Ocupado' : p.status === 'available' ? 'Disponivel' : 'Manutencao'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm"><Eye className="h-4 w-4" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );

  const renderReportGuarantors = () => (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <Select defaultValue="all">
              <SelectTrigger className="w-[150px]"><SelectValue placeholder="Tipo" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="fiador">Fiador</SelectItem>
                <SelectItem value="seguro">Seguro Fianca</SelectItem>
                <SelectItem value="titulo">Titulo Capitalizacao</SelectItem>
              </SelectContent>
            </Select>
            <Input placeholder="Buscar garantidor..." className="w-[200px]" />
            <div className="ml-auto flex gap-2">
              <Button size="sm"><Download className="h-4 w-4 mr-2" />Exportar</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-5">
        <Card className="bg-gradient-to-br from-rose-50 to-pink-50 border-rose-200">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total Garantidores</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">456</div></CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Fiadores PF</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">289</div></CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Seguros Fianca</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-emerald-600">145</div></CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-violet-50 to-purple-50 border-violet-200">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Valor em Garantias</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{formatCurrency(12_500_000)}</div></CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Taxa Execucao</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-emerald-600">0.7%</div><p className="text-xs text-muted-foreground">Muito baixo</p></CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Distribuicao por Tipo de Garantia</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2"><Users className="h-5 w-5 text-blue-600" /><span>Fiador Pessoa Fisica</span></div>
                <div className="text-right"><p className="font-bold">289</p><p className="text-xs text-muted-foreground">63%</p></div>
              </div>
              <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-lg">
                <div className="flex items-center gap-2"><Shield className="h-5 w-5 text-emerald-600" /><span>Seguro Fianca</span></div>
                <div className="text-right"><p className="font-bold">145</p><p className="text-xs text-muted-foreground">32%</p></div>
              </div>
              <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                <div className="flex items-center gap-2"><Landmark className="h-5 w-5 text-amber-600" /><span>Titulo Capitalizacao</span></div>
                <div className="text-right"><p className="font-bold">22</p><p className="text-xs text-muted-foreground">5%</p></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Historico de Execucoes</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Ultimos 12 meses</span>
                  <Badge variant="secondary">3 execucoes</Badge>
                </div>
                <p className="text-2xl font-bold text-rose-600">{formatCurrency(18_500)}</p>
                <p className="text-xs text-muted-foreground">Valor total executado</p>
              </div>
              <div className="p-4 border rounded-lg bg-emerald-50">
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Taxa de Recuperacao</span>
                  <Badge className="bg-emerald-500">Excelente</Badge>
                </div>
                <p className="text-2xl font-bold text-emerald-600">94%</p>
                <p className="text-xs text-muted-foreground">Valores recuperados via garantias</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderReportCommissions = () => (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <Select defaultValue="current">
              <SelectTrigger className="w-[150px]"><SelectValue placeholder="Periodo" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="current">Mes Atual</SelectItem>
                <SelectItem value="last">Mes Anterior</SelectItem>
                <SelectItem value="quarter">Trimestre</SelectItem>
                <SelectItem value="year">Ano</SelectItem>
              </SelectContent>
            </Select>
            <div className="ml-auto flex gap-2">
              <Button variant="outline" size="sm"><FileSpreadsheet className="h-4 w-4 mr-2" />Excel</Button>
              <Button size="sm"><Download className="h-4 w-4 mr-2" />Exportar</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Taxa Administracao</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(104_000)}</div>
            <p className="text-xs text-emerald-600 mt-1">5% sobre {formatCurrency(2_080_000)}</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-violet-50 to-purple-50 border-violet-200">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Comissoes Seguros</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(21_250)}</div>
            <p className="text-xs text-muted-foreground mt-1">85 apolices ativas</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Repasses Proprietarios</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(1_976_000)}</div>
            <p className="text-xs text-muted-foreground mt-1">95% do valor bruto</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Pendentes</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">8</div>
            <p className="text-xs text-amber-600 mt-1">{formatCurrency(12_400)} a processar</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Evolucao de Comissoes (6 meses)</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { month: 'Jan', admin: 98000, seguros: 18500, total: 116500 },
                { month: 'Fev', admin: 101000, seguros: 19200, total: 120200 },
                { month: 'Mar', admin: 99500, seguros: 20100, total: 119600 },
                { month: 'Abr', admin: 102000, seguros: 21000, total: 123000 },
                { month: 'Mai', admin: 103500, seguros: 20800, total: 124300 },
                { month: 'Jun', admin: 104000, seguros: 21250, total: 125250 },
              ].map((m, i) => (
                <div key={i} className="flex items-center gap-4">
                  <span className="w-10 text-sm font-medium">{m.month}</span>
                  <div className="flex-1 h-6 flex gap-0.5 rounded overflow-hidden">
                    <div className="bg-emerald-500" style={{width: `${(m.admin / m.total) * 100}%`}} />
                    <div className="bg-violet-500" style={{width: `${(m.seguros / m.total) * 100}%`}} />
                  </div>
                  <span className="text-sm font-medium w-24 text-right">{formatCurrency(m.total)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Ultimos Repasses</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: 'Carlos Mendes', value: 11875, date: '15/01', status: 'pago' },
                { name: 'Fernanda Lima', value: 7410, date: '15/01', status: 'pago' },
                { name: 'Roberto Santos', value: 22800, date: '15/01', status: 'pago' },
                { name: 'Lucia Oliveira', value: 4275, date: '15/01', status: 'pendente' },
              ].map((r, i) => (
                <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8"><AvatarFallback>{r.name.slice(0,2).toUpperCase()}</AvatarFallback></Avatar>
                    <div>
                      <p className="font-medium text-sm">{r.name}</p>
                      <p className="text-xs text-muted-foreground">{r.date}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{formatCurrency(r.value)}</span>
                    <Badge variant={r.status === 'pago' ? 'default' : 'secondary'}>{r.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderReportInsurance = () => (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <Select defaultValue="all">
              <SelectTrigger className="w-[150px]"><SelectValue placeholder="Seguradora" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="porto">Porto Seguro</SelectItem>
                <SelectItem value="tokio">Tokio Marine</SelectItem>
                <SelectItem value="liberty">Liberty</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="all">
              <SelectTrigger className="w-[150px]"><SelectValue placeholder="Tipo" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="fianca">Seguro Fianca</SelectItem>
                <SelectItem value="incendio">Incendio</SelectItem>
                <SelectItem value="conteudo">Conteudo</SelectItem>
              </SelectContent>
            </Select>
            <div className="ml-auto flex gap-2">
              <Button size="sm"><Download className="h-4 w-4 mr-2" />Exportar</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-5">
        <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total Apolices</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">890</div></CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Ativas</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-emerald-600">845</div></CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Vencendo (30d)</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-blue-600">45</div></CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-violet-50 to-purple-50 border-violet-200">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Premio Mensal</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{formatCurrency(425_000)}</div></CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-rose-50 to-red-50 border-rose-200">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Sinistros Abertos</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-rose-600">8</div></CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Apolices por Seguradora</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: 'Porto Seguro', count: 412, premium: 196000, color: 'bg-blue-500' },
                { name: 'Tokio Marine', count: 245, premium: 118000, color: 'bg-red-500' },
                { name: 'Liberty', count: 156, premium: 78000, color: 'bg-emerald-500' },
                { name: 'Outros', count: 77, premium: 33000, color: 'bg-gray-500' },
              ].map((s, i) => (
                <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-8 rounded ${s.color}`} />
                    <div>
                      <p className="font-medium">{s.name}</p>
                      <p className="text-xs text-muted-foreground">{s.count} apolices</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(s.premium)}</p>
                    <p className="text-xs text-muted-foreground">premio/mes</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Sinistros Recentes</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { id: 'SIN-001', type: 'Vazamento', property: 'Apt 302', value: 4500, status: 'analise' },
                { id: 'SIN-002', type: 'Incendio', property: 'Sala 15', value: 28000, status: 'aprovado' },
                { id: 'SIN-003', type: 'Roubo', property: 'Loja 8', value: 12000, status: 'analise' },
              ].map((s, i) => (
                <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs">{s.id}</span>
                      <Badge variant="outline">{s.type}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{s.property}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{formatCurrency(s.value)}</span>
                    <Badge variant={s.status === 'aprovado' ? 'default' : 'secondary'}>{s.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderReportMarketplace = () => (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Parceiros Ativos</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">45</div><p className="text-xs text-emerald-600">+3 este mes</p></CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Produtos/Servicos</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">156</div></CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-violet-50 to-purple-50 border-violet-200">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Volume Mensal</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{formatCurrency(245_000)}</div></CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Comissoes</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{formatCurrency(24_500)}</div><p className="text-xs text-muted-foreground">10% medio</p></CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Top Parceiros por Volume</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: 'Eletro Casa', category: 'Eletrodomesticos', volume: 78000, orders: 156 },
                { name: 'Mudancas Express', category: 'Servicos', volume: 45000, orders: 89 },
                { name: 'Pinturas Prime', category: 'Reformas', volume: 38000, orders: 67 },
                { name: 'Moveis Art', category: 'Mobiliario', volume: 32000, orders: 45 },
                { name: 'Seguros Plus', category: 'Seguros', volume: 28000, orders: 112 },
              ].map((p, i) => (
                <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center font-bold text-slate-600">{i + 1}</div>
                    <div>
                      <p className="font-medium">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.category} • {p.orders} pedidos</p>
                    </div>
                  </div>
                  <span className="font-bold">{formatCurrency(p.volume)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Categorias Populares</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: 'Mudancas', percentage: 32, value: 78400 },
                { name: 'Reformas', percentage: 25, value: 61250 },
                { name: 'Eletrodomesticos', percentage: 18, value: 44100 },
                { name: 'Mobiliario', percentage: 15, value: 36750 },
                { name: 'Outros', percentage: 10, value: 24500 },
              ].map((c, i) => (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{c.name}</span>
                    <span className="font-medium">{formatCurrency(c.value)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-violet-500 h-2 rounded-full" style={{width: `${c.percentage}%`}} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderReportCRM = () => (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <Select defaultValue="all">
              <SelectTrigger className="w-[150px]"><SelectValue placeholder="Origem" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                <SelectItem value="site">Site</SelectItem>
                <SelectItem value="indicacao">Indicacao</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="all">
              <SelectTrigger className="w-[150px]"><SelectValue placeholder="Etapa" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="novo">Novo</SelectItem>
                <SelectItem value="qualificado">Qualificado</SelectItem>
                <SelectItem value="negociacao">Negociacao</SelectItem>
                <SelectItem value="fechado">Fechado</SelectItem>
              </SelectContent>
            </Select>
            <div className="ml-auto flex gap-2">
              <Button size="sm"><Download className="h-4 w-4 mr-2" />Exportar</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-5">
        <Card className="bg-gradient-to-br from-cyan-50 to-teal-50 border-cyan-200">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total Leads</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">1.234</div><p className="text-xs text-emerald-600">+89 esta semana</p></CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Leads Quentes</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-orange-600">89</div><p className="text-xs text-muted-foreground">Prioridade alta</p></CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Em Negociacao</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-blue-600">156</div></CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Convertidos (Mes)</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold text-emerald-600">234</div></CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-violet-50 to-purple-50 border-violet-200">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Taxa Conversao</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">18.9%</div><p className="text-xs text-emerald-600">+2.1% vs mes anterior</p></CardContent>
        </Card>
      </div>

      {/* Funil de Vendas */}
      <Card>
        <CardHeader><CardTitle>Funil de Vendas</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[
              { stage: 'Novos Leads', count: 456, value: 1_140_000, color: 'bg-cyan-500', width: '100%' },
              { stage: 'Qualificados', count: 312, value: 780_000, color: 'bg-blue-500', width: '68%' },
              { stage: 'Em Negociacao', count: 156, value: 390_000, color: 'bg-indigo-500', width: '34%' },
              { stage: 'Proposta Enviada', count: 89, value: 222_500, color: 'bg-violet-500', width: '20%' },
              { stage: 'Fechados', count: 45, value: 112_500, color: 'bg-emerald-500', width: '10%' },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-32 text-sm">{s.stage}</div>
                <div className="flex-1">
                  <div className={`h-10 ${s.color} rounded flex items-center justify-center text-white font-medium`} style={{width: s.width}}>
                    {s.count} leads
                  </div>
                </div>
                <div className="w-28 text-right text-sm font-medium">{formatCurrency(s.value)}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Origem dos Leads</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { source: 'WhatsApp', icon: MessageSquare, count: 456, percentage: 37, color: 'text-green-600' },
                { source: 'Site', icon: Globe, count: 312, percentage: 25, color: 'text-blue-600' },
                { source: 'Indicacao', icon: Users, count: 234, percentage: 19, color: 'text-purple-600' },
                { source: 'Portais', icon: Building2, count: 156, percentage: 13, color: 'text-orange-600' },
                { source: 'Outros', icon: MoreHorizontal, count: 76, percentage: 6, color: 'text-gray-600' },
              ].map((o, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <o.icon className={`h-5 w-5 ${o.color}`} />
                    <span>{o.source}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div className="bg-violet-500 h-2 rounded-full" style={{width: `${o.percentage}%`}} />
                    </div>
                    <span className="w-12 text-right font-medium">{o.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Performance por Corretor</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: 'Ana Silva', leads: 89, converted: 23, rate: 25.8 },
                { name: 'Carlos Santos', leads: 76, converted: 18, rate: 23.7 },
                { name: 'Maria Lima', leads: 68, converted: 14, rate: 20.6 },
                { name: 'Pedro Costa', leads: 54, converted: 9, rate: 16.7 },
              ].map((c, i) => (
                <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8"><AvatarFallback>{c.name.slice(0,2).toUpperCase()}</AvatarFallback></Avatar>
                    <div>
                      <p className="font-medium">{c.name}</p>
                      <p className="text-xs text-muted-foreground">{c.leads} leads atribuidos</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-emerald-600">{c.converted} conversoes</p>
                    <p className="text-xs text-muted-foreground">{c.rate}% taxa</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderReportVBRZ = () => (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-5">
        <Card className="bg-gradient-to-br from-indigo-50 to-violet-50 border-indigo-200">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Preco VBRz</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ 0,50</div>
            <p className="text-xs text-emerald-600">+2.5% (24h)</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Market Cap</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{formatCurrency(25_000_000)}</div></CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Volume 24h</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{formatCurrency(1_250_000)}</div></CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-violet-50 to-purple-50 border-violet-200">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total Staked</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">18M VBRz</div><p className="text-xs text-muted-foreground">36% do supply</p></CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Holders</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">8.765</div><p className="text-xs text-emerald-600">+156 esta semana</p></CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Distribuicao de Cashback</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span className="text-sm">Total Distribuido (Mes)</span>
                  <Badge className="bg-emerald-500">Ativo</Badge>
                </div>
                <p className="text-3xl font-bold text-emerald-700">2.5M VBRz</p>
                <p className="text-sm text-emerald-600">{formatCurrency(1_250_000)}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-muted-foreground">Inquilinos</p>
                  <p className="text-lg font-bold">1.8M VBRz</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-muted-foreground">Proprietarios</p>
                  <p className="text-lg font-bold">700K VBRz</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Staking & Rewards</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-violet-50 rounded-lg">
                <div className="flex justify-between mb-2">
                  <span className="text-sm">APY Atual</span>
                  <Badge className="bg-violet-500">Premium</Badge>
                </div>
                <p className="text-3xl font-bold text-violet-700">12.5%</p>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between p-2 bg-slate-50 rounded">
                  <span className="text-sm">Stakers Ativos</span>
                  <span className="font-medium">2.345</span>
                </div>
                <div className="flex justify-between p-2 bg-slate-50 rounded">
                  <span className="text-sm">Media Staked</span>
                  <span className="font-medium">7.673 VBRz</span>
                </div>
                <div className="flex justify-between p-2 bg-slate-50 rounded">
                  <span className="text-sm">Rewards Distribuidos</span>
                  <span className="font-medium">450K VBRz</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Top Holders</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { wallet: '0x7a1c...9b0c', balance: 2500000, percentage: 5.0, type: 'Plataforma' },
              { wallet: '0x9c3e...0b1c', balance: 1200000, percentage: 2.4, type: 'Investidor' },
              { wallet: '0xbe5g...1c2d', balance: 850000, percentage: 1.7, type: 'Investidor' },
              { wallet: '0xcf6h...2d3e', balance: 620000, percentage: 1.2, type: 'Staker' },
              { wallet: '0xdg7i...3e4f', balance: 450000, percentage: 0.9, type: 'Staker' },
            ].map((h, i) => (
              <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center font-bold text-violet-600">{i + 1}</div>
                  <div>
                    <p className="font-mono text-sm">{h.wallet}</p>
                    <Badge variant="outline" className="text-xs mt-1">{h.type}</Badge>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold">{(h.balance / 1000000).toFixed(2)}M VBRz</p>
                  <p className="text-xs text-muted-foreground">{h.percentage}% do supply</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // ============= RELATORIO B2B - IMOBILIARIAS =============
  const renderReportB2B = () => (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Total Imobiliarias</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">Parceiras ativas na rede</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Imoveis B2B</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-emerald-600">+23 este mes</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-violet-50 to-purple-50 border-violet-200">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Contratos B2B</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">89</div>
            <p className="text-xs text-muted-foreground">Via imobiliarias parceiras</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200">
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium">Receita Parceiros</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(45200)}</div>
            <p className="text-xs text-emerald-600">+12% vs mes anterior</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Imobiliarias */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Rede de Imobiliarias Parceiras
          </CardTitle>
          <CardDescription>Gestao White Label B2B - Cada imobiliaria tem site personalizado</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Imobiliaria</TableHead>
                <TableHead>Cidade</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center">Imoveis</TableHead>
                <TableHead className="text-center">Contratos</TableHead>
                <TableHead className="text-right">Comissao Mes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[
                { name: 'Predileta Imoveis', city: 'Sao Paulo', status: 'active', properties: 45, contracts: 28, commission: 12500 },
                { name: 'Casa & Lar', city: 'Rio de Janeiro', status: 'active', properties: 32, contracts: 19, commission: 8200 },
                { name: 'Habitare Premium', city: 'Curitiba', status: 'active', properties: 28, contracts: 15, commission: 6800 },
                { name: 'Morada Certa', city: 'Belo Horizonte', status: 'active', properties: 22, contracts: 12, commission: 5400 },
                { name: 'Lar Ideal', city: 'Porto Alegre', status: 'pending', properties: 15, contracts: 8, commission: 3200 },
                { name: 'Prime Realty', city: 'Brasilia', status: 'active', properties: 14, contracts: 7, commission: 2900 },
              ].map((agency, i) => (
                <TableRow key={i}>
                  <TableCell className="font-medium">{agency.name}</TableCell>
                  <TableCell>{agency.city}</TableCell>
                  <TableCell>
                    <Badge className={agency.status === 'active' ? 'bg-emerald-500' : 'bg-amber-500'}>
                      {agency.status === 'active' ? 'Ativa' : 'Pendente'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">{agency.properties}</TableCell>
                  <TableCell className="text-center">{agency.contracts}</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(agency.commission)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Info sobre o modelo */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader><CardTitle className="text-base">Sites White Label</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Cada imobiliaria parceira recebe um site personalizado com suas cores e logo, acessivel via /imob/[slug]</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Comissoes Automaticas</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Split de pagamento automatico via Asaas. Comissao configuravel por parceiro (padrao: 15%)</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Onboarding Concierge</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Modelo exclusivo: cadastro de imobiliarias feito pelo admin Vinculo, sem auto-cadastro</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  const renderPlaceholder = (title: string) => (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>Modulo em desenvolvimento</CardDescription>
      </CardHeader>
      <CardContent className="py-12 text-center text-muted-foreground">
        <Workflow className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>Este modulo esta sendo implementado.</p>
      </CardContent>
    </Card>
  );

  // ============= BLOCKCHAIN REPORT =============
  const renderBlockchainReport = () => (
    <div className="space-y-6">
      {/* Counters */}
      <TransactionCounterWidget />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Transaction Feed */}
        <BlockchainTransactionFeed maxItems={15} showHeader={true} />

        {/* Smart Contract Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-purple-400" />
              Smart Contracts Ativos
            </CardTitle>
            <CardDescription>Status dos contratos na rede Polygon</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-purple-50 rounded-xl text-center">
                <p className="text-3xl font-bold text-purple-700">1,247</p>
                <p className="text-sm text-purple-400">NFTs Mintados</p>
              </div>
              <div className="p-4 bg-emerald-50 rounded-xl text-center">
                <p className="text-3xl font-bold text-emerald-700">98.7%</p>
                <p className="text-sm text-emerald-600">Taxa de Sucesso</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-xl text-center">
                <p className="text-3xl font-bold text-blue-700">342</p>
                <p className="text-sm text-blue-400">Colaterais Bloqueados</p>
              </div>
              <div className="p-4 bg-amber-50 rounded-xl text-center">
                <p className="text-3xl font-bold text-amber-700">12</p>
                <p className="text-sm text-amber-600">Disputas Ativas</p>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Split 85/5/5/5 - Ultimas 24h</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Locadores (85%)</span>
                  <span className="font-semibold text-emerald-600">R$ 127.500,00</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Seguradoras (5%)</span>
                  <span className="font-semibold text-blue-400">R$ 7.500,00</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Plataforma (5%)</span>
                  <span className="font-semibold text-purple-400">R$ 7.500,00</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Garantidores (5%)</span>
                  <span className="font-semibold text-amber-600">R$ 7.500,00</span>
                </div>
              </div>
            </div>

            <Button variant="outline" className="w-full">
              <ExternalLink className="h-4 w-4 mr-2" />
              Ver no Polygon Explorer
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // ============= MÓDULO FINANCEIRO INTEGRADO =============
  const [financeiroTab, setFinanceiroTab] = useState<'alugueis' | 'contas-receber' | 'contas-pagar' | 'fornecedores' | 'colaboradores' | 'tipos-despesa' | 'cashback' | 'dre'>('alugueis');

  const renderFinanceiro = () => (
    <div className="space-y-6">
      {/* Header do Módulo Financeiro */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Wallet className="h-6 w-6 text-indigo-600" />
            Módulo Financeiro
          </h2>
          <p className="text-muted-foreground">Gestão completa de receitas, despesas e fluxo de caixa</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Sincronizado
          </Badge>
          <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
            Vinculo.io
          </Badge>
        </div>
      </div>

      {/* Navegação em Tabs */}
      <Tabs value={financeiroTab} onValueChange={(v) => setFinanceiroTab(v as typeof financeiroTab)} className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 h-auto gap-1 bg-muted p-1">
          <TabsTrigger value="alugueis" className="text-xs lg:text-sm py-2">
            <Banknote className="h-4 w-4 mr-1 hidden lg:inline" />
            Aluguéis
          </TabsTrigger>
          <TabsTrigger value="contas-receber" className="text-xs lg:text-sm py-2">
            <DollarSign className="h-4 w-4 mr-1 hidden lg:inline" />
            A Receber
          </TabsTrigger>
          <TabsTrigger value="contas-pagar" className="text-xs lg:text-sm py-2">
            <Receipt className="h-4 w-4 mr-1 hidden lg:inline" />
            A Pagar
          </TabsTrigger>
          <TabsTrigger value="fornecedores" className="text-xs lg:text-sm py-2">
            <Building2 className="h-4 w-4 mr-1 hidden lg:inline" />
            Fornecedores
          </TabsTrigger>
          <TabsTrigger value="colaboradores" className="text-xs lg:text-sm py-2">
            <Users className="h-4 w-4 mr-1 hidden lg:inline" />
            Colaboradores
          </TabsTrigger>
          <TabsTrigger value="tipos-despesa" className="text-xs lg:text-sm py-2">
            <Layers className="h-4 w-4 mr-1 hidden lg:inline" />
            Categorias
          </TabsTrigger>
          <TabsTrigger value="cashback" className="text-xs lg:text-sm py-2">
            <Coins className="h-4 w-4 mr-1 hidden lg:inline" />
            Cashback
          </TabsTrigger>
          <TabsTrigger value="dre" className="text-xs lg:text-sm py-2">
            <BarChart3 className="h-4 w-4 mr-1 hidden lg:inline" />
            DRE
          </TabsTrigger>
        </TabsList>

        <div className="mt-6 bg-background rounded-xl overflow-hidden max-h-[calc(100vh-280px)] overflow-y-auto">
          <TabsContent value="alugueis" className="m-0">
            <AlugueisReceberForm />
          </TabsContent>
          <TabsContent value="contas-receber" className="m-0">
            <ContasReceberForm />
          </TabsContent>
          <TabsContent value="contas-pagar" className="m-0">
            <ContasPagarForm />
          </TabsContent>
          <TabsContent value="fornecedores" className="m-0">
            <FornecedoresForm />
          </TabsContent>
          <TabsContent value="colaboradores" className="m-0">
            <ColaboradoresForm />
          </TabsContent>
          <TabsContent value="tipos-despesa" className="m-0">
            <TiposDespesaForm />
          </TabsContent>
          <TabsContent value="cashback" className="m-0">
            <CashbackAdminDashboard />
          </TabsContent>
          <TabsContent value="dre" className="m-0">
            <DreReport />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );

  const renderContent = () => {
    switch (currentSection) {
      case 'dashboard': return renderDashboard();
      case 'dashboards_consultivas': return <DashboardsConsultivas />;
      case 'vbrz_dashboard': return <VBRzDashboard />;
      case 'financeiro': return renderFinanceiro();
      case 'contracts': return renderContracts();
      case 'properties': return renderProperties();
      case 'tenants': return renderTenants();
      case 'landlords': return renderLandlords();
      case 'guarantors': return renderGuarantors();
      case 'crm': return <CRMDashboard />;
      case 'engage': return <EngageDashboard />;
      case 'marketplace': return renderMarketplace();
      case 'agencies': return <AgencyModule />;
      case 'reports_dre': return renderDRE();
      case 'reports_cashflow': return renderCashFlow();
      case 'reports_dimob': return renderDIMOB();
      case 'reports_delinquency': return renderDelinquency();
      case 'reports_blockchain': return renderBlockchainReport();
      case 'reports_contracts': return renderReportContracts();
      case 'reports_tenants': return renderReportTenants();
      case 'reports_landlords': return renderReportLandlords();
      case 'reports_properties': return renderReportProperties();
      case 'reports_guarantors': return renderReportGuarantors();
      case 'reports_commissions': return renderReportCommissions();
      case 'reports_insurance': return renderReportInsurance();
      case 'reports_marketplace': return renderReportMarketplace();
      case 'reports_crm': return renderReportCRM();
      case 'reports_vbrz': return renderReportVBRZ();
      case 'reports_b2b': return renderReportB2B();
      case 'config_bank_accounts': return renderBankAccounts();
      case 'config_gateways': return renderGateways();
      case 'config_users': return renderUsers();
      case 'config_permissions': return renderPermissions();
      case 'config_insurers': return renderInsurers();
      case 'config_marketplace': return renderMarketplace();
      case 'tasks_disputes': return renderDisputes();
      case 'tasks_inspections': return renderInspections();
      case 'tasks_kyc': return renderKYC();
      case 'tasks_processes': return renderProcesses();
      case 'config_services': return renderServices();
      case 'config_omnichannel': return <OmnichannelConfig />;
      case 'config_liquidity': return renderLiquidityDashboard();
      case 'config_crypto_wallets': return <CryptoWalletConfig />;
      case 'engine_ads': return <AdCampaignManager />;
      case 'engine_feature_flags': return <FeatureFlagsManager />;
      case 'engine_nft_loans': return <NFTLoans isAdmin={true} />;
      case 'tasks_communication_hub': return <CommunicationHub />;
      case 'docs_about':
      case 'docs_changelog':
      case 'docs_wiki':
      case 'docs_faq':
      case 'docs_technical':
        return <SystemDocumentation />;
      default: return renderPlaceholder(getSectionTitle(currentSection));
    }
  };

  // ============= LAYOUT PRINCIPAL =============

  // Função para fechar menu mobile ao trocar de seção
  const handleSectionChange = (section: ERPSection) => {
    setCurrentSection(section);
    setMobileMenuOpen(false);
  };

  return (
    <div className={cn("flex h-screen", theme.bgSecondary)}>
      {/* Mobile Menu Button - Fixed */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className={cn("lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg shadow-lg border", theme.bgSidebar, theme.borderPrimary, theme.textPrimary)}
      >
        {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "border-r shadow-sm transition-all duration-300 flex flex-col z-40",
        theme.bgSidebar, theme.borderPrimary,
        // Desktop: sidebar normal
        "hidden lg:flex",
        sidebarOpen ? "w-64" : "w-20"
      )}>
        {/* Logo */}
        <div className={cn("p-4 border-b flex items-center justify-between", theme.borderPrimary)}>
          {sidebarOpen ? (
            <VinculoBrasilLogo size="sm" />
          ) : (
            <VinculoBrasilLogo size="sm" variant="icon" />
          )}
          <Button variant="ghost" size="sm" onClick={() => setSidebarOpen(!sidebarOpen)} className={cn("p-2", theme.textPrimary)}>
            {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>
        </div>

        {/* Abas de Categoria */}
        <div className={cn("p-2 border-b", theme.borderPrimary)}>
          <div className={cn("grid gap-1", sidebarOpen ? "grid-cols-5" : "grid-cols-1")}>
            {menuGroups.map(group => {
              const Icon = group.icon;
              return (
                <button
                  key={group.category}
                  onClick={() => setActiveCategory(group.category)}
                  className={cn(
                    "p-2 rounded-lg transition-colors flex items-center justify-center",
                    activeCategory === group.category ? theme.menuActive : theme.menuInactive
                  )}
                  title={group.title}
                >
                  <Icon className="h-4 w-4" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Menu Items */}
        <ScrollArea className="flex-1 py-2">
          <nav className="space-y-1 px-2">
            {sidebarOpen && currentGroup && (
              <div className="pt-2 pb-3 px-3">
                <p className={cn("text-xs font-semibold uppercase tracking-wider", theme.textSecondary)}>{currentGroup.title}</p>
              </div>
            )}
            {currentGroup?.items.map(item => {
              const Icon = item.icon;
              const isActive = currentSection === item.id;
              const handleClick = () => {
                if (item.externalLink) {
                  window.location.href = item.externalLink;
                } else {
                  setCurrentSection(item.id);
                }
              };
              return (
                <button
                  key={item.id}
                  onClick={handleClick}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                    isActive ? theme.menuActive + " font-medium" : theme.menuInactive
                  )}
                >
                  <Icon className={cn("h-5 w-5 shrink-0", isActive ? "text-indigo-600" : "")} />
                  {sidebarOpen && (
                    <>
                      <span className="flex-1 text-left truncate">{item.label}</span>
                      {item.externalLink && <ExternalLink className={cn("h-3 w-3", theme.textMuted)} />}
                      {item.badge !== undefined && item.badge > 0 && (
                        <Badge className="bg-red-500 text-foreground text-xs h-5 min-w-5 flex items-center justify-center">{item.badge}</Badge>
                      )}
                    </>
                  )}
                </button>
              );
            })}
          </nav>
        </ScrollArea>

        {/* Botão de Logout - Desktop */}
        <div className={cn("p-3 border-t", theme.borderPrimary)}>
          <Button
            variant="ghost"
            onClick={handleLogout}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2 text-sm text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20",
              !sidebarOpen && "justify-center"
            )}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {sidebarOpen && <span>Sair</span>}
          </Button>
        </div>

      </aside>

      {/* Mobile Sidebar */}
      <aside className={cn(
        "lg:hidden fixed inset-y-0 left-0 z-40 w-72 border-r shadow-lg transform transition-transform duration-300 flex flex-col",
        theme.bgSidebar, theme.borderPrimary,
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Logo Mobile */}
        <div className={cn("p-4 border-b flex items-center gap-2 pt-16", theme.borderPrimary)}>
          <VinculoBrasilLogo size="sm" />
        </div>

        {/* Abas de Categoria Mobile */}
        <div className={cn("p-2 border-b", theme.borderPrimary)}>
          <div className="grid grid-cols-5 gap-1">
            {menuGroups.map(group => {
              const Icon = group.icon;
              return (
                <button
                  key={group.category}
                  onClick={() => setActiveCategory(group.category)}
                  className={cn(
                    "p-2 rounded-lg transition-colors flex items-center justify-center",
                    activeCategory === group.category ? theme.menuActive : theme.menuInactive
                  )}
                  title={group.title}
                >
                  <Icon className="h-4 w-4" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Menu Items Mobile */}
        <ScrollArea className="flex-1 py-2">
          <nav className="space-y-1 px-2">
            {currentGroup && (
              <div className="pt-2 pb-3 px-3">
                <p className={cn("text-xs font-semibold uppercase tracking-wider", theme.textSecondary)}>{currentGroup.title}</p>
              </div>
            )}
            {currentGroup?.items.map(item => {
              const Icon = item.icon;
              const isActive = currentSection === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSectionChange(item.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors",
                    isActive ? theme.menuActive + " font-medium" : theme.menuInactive
                  )}
                >
                  <Icon className={cn("h-5 w-5 shrink-0", isActive ? "text-indigo-600" : "")} />
                  <span className="flex-1 text-left truncate">{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <Badge className="bg-red-500 text-foreground text-xs h-5 min-w-5 flex items-center justify-center">{item.badge}</Badge>
                  )}
                </button>
              );
            })}
          </nav>
        </ScrollArea>

        {/* Botão de Logout - Mobile */}
        <div className={cn("p-3 border-t", theme.borderPrimary)}>
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            <span>Sair</span>
          </Button>
        </div>

      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <header className={cn("border-b px-4 lg:px-6 py-4", theme.bgHeader, theme.borderPrimary)}>
          <div className="flex items-center justify-between">
            <div className="pl-12 lg:pl-0">
              <h1 className={cn("text-xl lg:text-2xl font-bold", theme.textPrimary)}>{getSectionTitle(currentSection)}</h1>
              <p className={cn("text-xs lg:text-sm", theme.textSecondary)}>Sistema de Gestao Vinculo.io</p>
            </div>
            <div className="flex items-center gap-2 lg:gap-3">
              <ThemeToggle />
              <Button variant="outline" size="sm" className="hidden sm:flex"><Search className="h-4 w-4 mr-2" />Buscar</Button>
              <Button variant="outline" size="sm" className="sm:hidden"><Search className="h-4 w-4" /></Button>
              <Button variant="outline" size="sm"><Bell className="h-4 w-4" /></Button>
            </div>
          </div>
        </header>

        {/* Content */}
        <ScrollArea className="flex-1">
          <div className="p-4 lg:p-6">{renderContent()}</div>
        </ScrollArea>
      </main>
    </div>
  );
}
