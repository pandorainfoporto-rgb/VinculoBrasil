/**
 * NFT Loans - Sistema de Emprestimos com Garantia de NFTs
 * Permite que proprietarios e garantidores obtenham emprestimos
 * utilizando seus NFTs de contratos como garantia
 *
 * Features:
 * - Visualizacao de NFTs disponiveis como garantia
 * - Simulador de emprestimo
 * - Solicitacao de emprestimo
 * - Acompanhamento de emprestimos ativos
 * - Liquidacao e resgate de garantias
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
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
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import {
  Wallet,
  Lock,
  Unlock,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Percent,
  Clock,
  Calendar,
  FileText,
  Shield,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ArrowRight,
  Calculator,
  Banknote,
  Building2,
  Coins,
  CreditCard,
  ExternalLink,
  Info,
  Loader2,
  RefreshCw,
  Sparkles,
  Zap,
  Home,
  Users,
  Settings,
  BarChart3,
  Edit3,
  Save,
  ToggleLeft,
  ToggleRight,
  Plus,
  Trash2,
  PieChart,
  Activity,
} from 'lucide-react';

// ============= TIPOS =============

// Status do emprestimo
export type LoanStatus = 'pending' | 'active' | 'paid' | 'defaulted' | 'liquidated';

// Tipo de NFT usado como garantia
export type NFTType = 'contract' | 'guarantee' | 'property';

// NFT disponivel como garantia
export interface CollateralNFT {
  id: string;
  tokenId: string;
  contractAddress: string;
  type: NFTType;
  name: string;
  description: string;
  imageUrl: string;
  // Valor do ativo subjacente
  underlyingValue: number;
  // Valor maximo de emprestimo (LTV)
  maxLoanValue: number;
  ltvRatio: number; // Ex: 0.7 = 70% do valor
  // Relacionado ao contrato
  propertyAddress?: string;
  monthlyRent?: number;
  contractEndDate?: Date;
  // Status
  isLocked: boolean;
  lockedInLoanId?: string;
}

// Termos do emprestimo
export interface LoanTerms {
  minAmount: number;
  maxAmount: number;
  minDuration: number; // meses
  maxDuration: number; // meses
  interestRateMonthly: number; // taxa mensal
  interestRateAnnual: number; // taxa anual
  originationFee: number; // taxa de originacao
  lateFee: number; // multa por atraso
  gracePeriodDays: number; // dias de carencia
}

// Emprestimo
export interface NFTLoan {
  id: string;
  borrowerId: string;
  borrowerName: string;
  collateralNFT: CollateralNFT;
  // Valores
  principalAmount: number;
  interestRate: number;
  totalInterest: number;
  totalAmount: number;
  outstandingBalance: number;
  // Datas
  startDate: Date;
  endDate: Date;
  durationMonths: number;
  // Pagamentos
  monthlyPayment: number;
  paymentsMade: number;
  totalPayments: number;
  nextPaymentDate: Date;
  // Status
  status: LoanStatus;
  daysOverdue: number;
  // Historico
  createdAt: Date;
  approvedAt?: Date;
  paidAt?: Date;
  liquidatedAt?: Date;
}

// Pagamento de emprestimo
export interface LoanPayment {
  id: string;
  loanId: string;
  amount: number;
  principalPaid: number;
  interestPaid: number;
  feesPaid: number;
  paymentDate: Date;
  dueDate: Date;
  status: 'pending' | 'paid' | 'late' | 'failed';
  transactionHash?: string;
}

// ============= DADOS MOCK =============

// Termos padrao de emprestimo
const defaultLoanTerms: LoanTerms = {
  minAmount: 1000,
  maxAmount: 500000,
  minDuration: 3,
  maxDuration: 36,
  interestRateMonthly: 1.5, // 1.5% ao mes
  interestRateAnnual: 19.56, // taxa anual equivalente
  originationFee: 2.0, // 2% do valor
  lateFee: 2.0, // 2% de multa
  gracePeriodDays: 5,
};

// NFTs disponiveis como garantia
const mockCollateralNFTs: CollateralNFT[] = [
  {
    id: 'nft_1',
    tokenId: '1001',
    contractAddress: '0x1234...5678',
    type: 'contract',
    name: 'Contrato de Locacao #1001',
    description: 'Apartamento 3 quartos - Vila Madalena',
    imageUrl: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&h=400&fit=crop',
    underlyingValue: 180000,
    maxLoanValue: 126000,
    ltvRatio: 0.70,
    propertyAddress: 'Rua Harmonia, 123 - Vila Madalena, SP',
    monthlyRent: 4500,
    contractEndDate: new Date('2026-06-30'),
    isLocked: false,
  },
  {
    id: 'nft_2',
    tokenId: '1002',
    contractAddress: '0x1234...5678',
    type: 'guarantee',
    name: 'Garantia Solidaria #1002',
    description: 'Garantia de locacao - Moema',
    imageUrl: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=400&fit=crop',
    underlyingValue: 54000,
    maxLoanValue: 37800,
    ltvRatio: 0.70,
    propertyAddress: 'Av. Moema, 456 - Moema, SP',
    monthlyRent: 3000,
    contractEndDate: new Date('2025-12-31'),
    isLocked: true,
    lockedInLoanId: 'loan_1',
  },
  {
    id: 'nft_3',
    tokenId: '2001',
    contractAddress: '0x8765...4321',
    type: 'property',
    name: 'Imovel Tokenizado #2001',
    description: 'Casa 4 quartos com piscina - Alphaville',
    imageUrl: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=400&h=400&fit=crop',
    underlyingValue: 850000,
    maxLoanValue: 510000,
    ltvRatio: 0.60,
    propertyAddress: 'Alameda Rio Negro, 789 - Alphaville, SP',
    isLocked: false,
  },
  {
    id: 'nft_4',
    tokenId: '1003',
    contractAddress: '0x1234...5678',
    type: 'contract',
    name: 'Contrato de Locacao #1003',
    description: 'Sala Comercial - Paulista',
    imageUrl: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=400&fit=crop',
    underlyingValue: 240000,
    maxLoanValue: 168000,
    ltvRatio: 0.70,
    propertyAddress: 'Av. Paulista, 1000 - Bela Vista, SP',
    monthlyRent: 8000,
    contractEndDate: new Date('2027-03-31'),
    isLocked: false,
  },
];

// Emprestimos ativos
const mockLoans: NFTLoan[] = [
  {
    id: 'loan_1',
    borrowerId: 'user_1',
    borrowerName: 'Carlos Silva',
    collateralNFT: mockCollateralNFTs[1],
    principalAmount: 30000,
    interestRate: 1.5,
    totalInterest: 5400,
    totalAmount: 35400,
    outstandingBalance: 23600,
    startDate: new Date('2024-01-15'),
    endDate: new Date('2025-01-15'),
    durationMonths: 12,
    monthlyPayment: 2950,
    paymentsMade: 4,
    totalPayments: 12,
    nextPaymentDate: new Date('2024-05-15'),
    status: 'active',
    daysOverdue: 0,
    createdAt: new Date('2024-01-10'),
    approvedAt: new Date('2024-01-14'),
  },
];

// Pagamentos
const mockPayments: LoanPayment[] = [
  { id: 'pay_1', loanId: 'loan_1', amount: 2950, principalPaid: 2500, interestPaid: 450, feesPaid: 0, paymentDate: new Date('2024-02-15'), dueDate: new Date('2024-02-15'), status: 'paid', transactionHash: '0xabc...' },
  { id: 'pay_2', loanId: 'loan_1', amount: 2950, principalPaid: 2537.5, interestPaid: 412.5, feesPaid: 0, paymentDate: new Date('2024-03-15'), dueDate: new Date('2024-03-15'), status: 'paid', transactionHash: '0xdef...' },
  { id: 'pay_3', loanId: 'loan_1', amount: 2950, principalPaid: 2575.56, interestPaid: 374.44, feesPaid: 0, paymentDate: new Date('2024-04-15'), dueDate: new Date('2024-04-15'), status: 'paid', transactionHash: '0xghi...' },
  { id: 'pay_4', loanId: 'loan_1', amount: 2950, principalPaid: 2614.20, interestPaid: 335.80, feesPaid: 0, paymentDate: new Date('2024-05-10'), dueDate: new Date('2024-05-15'), status: 'paid', transactionHash: '0xjkl...' },
];

// Configuração de taxas para Admin
interface LoanRateConfig {
  id: string;
  name: string;
  minLTV: number;
  maxLTV: number;
  interestRateMonthly: number;
  interestRateAnnual: number;
  originationFee: number;
  lateFee: number;
  gracePeriodDays: number;
  minDuration: number;
  maxDuration: number;
  isActive: boolean;
}

// Métricas globais de empréstimos
interface LoanMetrics {
  totalLoans: number;
  activeLoans: number;
  paidLoans: number;
  defaultedLoans: number;
  totalOriginated: number;
  totalOutstanding: number;
  totalInterestEarned: number;
  totalFeesEarned: number;
  averageLTV: number;
  averageInterestRate: number;
  defaultRate: number;
  avgLoanDuration: number;
}

// Props do componente
interface NFTLoansProps {
  isAdmin?: boolean;
}

// Dados mock de configuração de taxas
const mockRateConfigs: LoanRateConfig[] = [
  {
    id: 'rate_1',
    name: 'Conservador (LTV até 50%)',
    minLTV: 0,
    maxLTV: 50,
    interestRateMonthly: 1.2,
    interestRateAnnual: 15.39,
    originationFee: 1.5,
    lateFee: 2.0,
    gracePeriodDays: 5,
    minDuration: 3,
    maxDuration: 36,
    isActive: true,
  },
  {
    id: 'rate_2',
    name: 'Moderado (LTV 50-65%)',
    minLTV: 50,
    maxLTV: 65,
    interestRateMonthly: 1.5,
    interestRateAnnual: 19.56,
    originationFee: 2.0,
    lateFee: 2.0,
    gracePeriodDays: 5,
    minDuration: 3,
    maxDuration: 24,
    isActive: true,
  },
  {
    id: 'rate_3',
    name: 'Agressivo (LTV 65-75%)',
    minLTV: 65,
    maxLTV: 75,
    interestRateMonthly: 2.0,
    interestRateAnnual: 26.82,
    originationFee: 2.5,
    lateFee: 3.0,
    gracePeriodDays: 3,
    minDuration: 3,
    maxDuration: 18,
    isActive: true,
  },
];

// Métricas globais mock
const mockGlobalMetrics: LoanMetrics = {
  totalLoans: 47,
  activeLoans: 32,
  paidLoans: 12,
  defaultedLoans: 3,
  totalOriginated: 2450000,
  totalOutstanding: 1680000,
  totalInterestEarned: 245000,
  totalFeesEarned: 49000,
  averageLTV: 58.5,
  averageInterestRate: 1.57,
  defaultRate: 6.38,
  avgLoanDuration: 14.2,
};

// ============= COMPONENTE PRINCIPAL =============

export function NFTLoans({ isAdmin = false }: NFTLoansProps) {
  const [activeTab, setActiveTab] = useState(isAdmin ? 'admin_metrics' : 'overview');
  const [collateralNFTs] = useState<CollateralNFT[]>(mockCollateralNFTs);
  const [loans] = useState<NFTLoan[]>(mockLoans);
  const [payments] = useState<LoanPayment[]>(mockPayments);
  const [loanTerms, setLoanTerms] = useState<LoanTerms>(defaultLoanTerms);
  const [rateConfigs, setRateConfigs] = useState<LoanRateConfig[]>(mockRateConfigs);
  const [globalMetrics] = useState<LoanMetrics>(mockGlobalMetrics);
  const [editingConfig, setEditingConfig] = useState<LoanRateConfig | null>(null);
  const [isConfigDialogOpen, setIsConfigDialogOpen] = useState(false);

  // Estado do simulador
  const [selectedNFT, setSelectedNFT] = useState<CollateralNFT | null>(null);
  const [loanAmount, setLoanAmount] = useState<number>(0);
  const [loanDuration, setLoanDuration] = useState<number>(12);
  const [isSimulating, setIsSimulating] = useState(false);

  // Estado do dialog
  const [isLoanDialogOpen, setIsLoanDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Estatisticas
  const stats = {
    totalCollateralValue: collateralNFTs.reduce((sum, nft) => sum + nft.underlyingValue, 0),
    availableCollateral: collateralNFTs.filter(nft => !nft.isLocked).reduce((sum, nft) => sum + nft.maxLoanValue, 0),
    activeLoans: loans.filter(l => l.status === 'active').length,
    totalBorrowed: loans.filter(l => l.status === 'active').reduce((sum, l) => sum + l.principalAmount, 0),
    totalOutstanding: loans.filter(l => l.status === 'active').reduce((sum, l) => sum + l.outstandingBalance, 0),
    healthFactor: 2.1, // Razao entre garantia e divida
  };

  // Calcula parcela mensal (Price)
  const calculateMonthlyPayment = (principal: number, rate: number, months: number) => {
    const monthlyRate = rate / 100;
    if (monthlyRate === 0) return principal / months;
    return principal * (monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
  };

  // Simula emprestimo
  const simulateLoan = () => {
    if (!selectedNFT || loanAmount <= 0) return null;

    const monthlyPayment = calculateMonthlyPayment(loanAmount, loanTerms.interestRateMonthly, loanDuration);
    const totalPayment = monthlyPayment * loanDuration;
    const totalInterest = totalPayment - loanAmount;
    const originationFeeAmount = loanAmount * (loanTerms.originationFee / 100);
    const netAmount = loanAmount - originationFeeAmount;

    return {
      principal: loanAmount,
      duration: loanDuration,
      monthlyPayment,
      totalPayment,
      totalInterest,
      originationFee: originationFeeAmount,
      netAmount,
      interestRate: loanTerms.interestRateMonthly,
      annualRate: loanTerms.interestRateAnnual,
      ltv: (loanAmount / selectedNFT.underlyingValue) * 100,
    };
  };

  const loanSimulation = simulateLoan();

  // Seleciona NFT para emprestimo
  const handleSelectNFT = (nft: CollateralNFT) => {
    setSelectedNFT(nft);
    setLoanAmount(Math.min(nft.maxLoanValue / 2, loanTerms.maxAmount)); // Comeca com 50% do maximo
    setIsSimulating(true);
  };

  // Solicita emprestimo
  const handleRequestLoan = () => {
    setIsLoanDialogOpen(true);
  };

  // Confirma emprestimo
  const handleConfirmLoan = async () => {
    setIsProcessing(true);
    // Simula processamento
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsProcessing(false);
    setIsLoanDialogOpen(false);
    setIsSimulating(false);
    setSelectedNFT(null);
    // Aqui adicionaria o emprestimo a lista
  };

  // Renderiza status
  const renderStatus = (status: LoanStatus) => {
    const config: Record<LoanStatus, { color: string; label: string }> = {
      pending: { color: 'bg-amber-500', label: 'Pendente' },
      active: { color: 'bg-green-500', label: 'Ativo' },
      paid: { color: 'bg-blue-500', label: 'Quitado' },
      defaulted: { color: 'bg-red-500', label: 'Inadimplente' },
      liquidated: { color: 'bg-gray-500', label: 'Liquidado' },
    };
    return <Badge className={config[status].color}>{config[status].label}</Badge>;
  };

  // Renderiza tipo de NFT
  const renderNFTType = (type: NFTType) => {
    const config: Record<NFTType, { icon: React.ComponentType<{ className?: string }>; label: string }> = {
      contract: { icon: FileText, label: 'Contrato' },
      guarantee: { icon: Shield, label: 'Garantia' },
      property: { icon: Home, label: 'Imovel' },
    };
    const { icon: Icon, label } = config[type];
    return (
      <Badge variant="outline" className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Coins className="h-6 w-6" />
            Emprestimos com Garantia NFT
          </h2>
          <p className="text-muted-foreground">
            Utilize seus NFTs de contratos como garantia para obter emprestimos
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-lg px-4 py-2">
            Health Factor: <span className={cn("font-bold ml-1", stats.healthFactor >= 1.5 ? "text-green-600" : "text-amber-600")}>{stats.healthFactor.toFixed(2)}</span>
          </Badge>
        </div>
      </div>

      {/* Alerta de feature beta */}
      <Alert className="border-purple-500 bg-purple-50">
        <Sparkles className="h-4 w-4 text-purple-600" />
        <AlertTitle className="text-purple-800">Funcionalidade em Beta</AlertTitle>
        <AlertDescription className="text-purple-700">
          O sistema de emprestimos com garantia NFT esta em fase beta.
          Taxas e termos podem variar. Consulte os termos completos antes de solicitar.
        </AlertDescription>
      </Alert>

      {/* Estatisticas */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Wallet className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">R$ {(stats.totalCollateralValue / 1000).toFixed(0)}K</p>
                <p className="text-xs text-muted-foreground">Valor Total NFTs</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Unlock className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">R$ {(stats.availableCollateral / 1000).toFixed(0)}K</p>
                <p className="text-xs text-muted-foreground">Disponivel p/ Emprestimo</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-amber-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Banknote className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">R$ {(stats.totalBorrowed / 1000).toFixed(0)}K</p>
                <p className="text-xs text-muted-foreground">Total Emprestado</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <CreditCard className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">R$ {(stats.totalOutstanding / 1000).toFixed(1)}K</p>
                <p className="text-xs text-muted-foreground">Saldo Devedor</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-cyan-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-cyan-100 rounded-lg">
                <FileText className="h-5 w-5 text-cyan-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.activeLoans}</p>
                <p className="text-xs text-muted-foreground">Emprestimos Ativos</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex-wrap h-auto gap-1">
          {isAdmin && (
            <>
              <TabsTrigger value="admin_metrics" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Metricas
              </TabsTrigger>
              <TabsTrigger value="admin_rates" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Taxas & Juros
              </TabsTrigger>
              <TabsTrigger value="admin_loans" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Todos Emprestimos
              </TabsTrigger>
            </>
          )}
          {!isAdmin && (
            <>
              <TabsTrigger value="overview" className="flex items-center gap-2">
                <Wallet className="h-4 w-4" />
                Meus NFTs
              </TabsTrigger>
              <TabsTrigger value="simulate" className="flex items-center gap-2">
                <Calculator className="h-4 w-4" />
                Simular
              </TabsTrigger>
              <TabsTrigger value="loans" className="flex items-center gap-2">
                <Banknote className="h-4 w-4" />
                Meus Emprestimos
              </TabsTrigger>
              <TabsTrigger value="payments" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Pagamentos
              </TabsTrigger>
            </>
          )}
        </TabsList>

        {/* Tab: NFTs Disponiveis */}
        <TabsContent value="overview" className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-muted-foreground">
              NFTs disponiveis para uso como garantia em emprestimos
            </p>
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Atualizar
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {collateralNFTs.map(nft => (
              <Card key={nft.id} className={cn(
                "overflow-hidden transition-all",
                nft.isLocked ? "opacity-75" : "hover:shadow-lg cursor-pointer",
                selectedNFT?.id === nft.id && "ring-2 ring-primary"
              )}>
                {/* Imagem do NFT */}
                <div className="relative aspect-square">
                  <img
                    src={nft.imageUrl}
                    alt={nft.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2">
                    {renderNFTType(nft.type)}
                  </div>
                  <div className="absolute top-2 right-2">
                    {nft.isLocked ? (
                      <Badge className="bg-red-500">
                        <Lock className="h-3 w-3 mr-1" />
                        Bloqueado
                      </Badge>
                    ) : (
                      <Badge className="bg-green-500">
                        <Unlock className="h-3 w-3 mr-1" />
                        Disponivel
                      </Badge>
                    )}
                  </div>
                </div>

                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{nft.name}</CardTitle>
                  <CardDescription className="text-xs">
                    Token ID: {nft.tokenId}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-3">
                  {nft.propertyAddress && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <Building2 className="h-3 w-3" />
                      {nft.propertyAddress}
                    </p>
                  )}

                  <div className="grid grid-cols-2 gap-2">
                    <div className="p-2 bg-slate-50 rounded text-center">
                      <p className="text-sm font-bold">R$ {nft.underlyingValue.toLocaleString()}</p>
                      <p className="text-[10px] text-muted-foreground">Valor do Ativo</p>
                    </div>
                    <div className="p-2 bg-green-50 rounded text-center">
                      <p className="text-sm font-bold text-green-700">R$ {nft.maxLoanValue.toLocaleString()}</p>
                      <p className="text-[10px] text-muted-foreground">Max. Emprestimo</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">LTV Maximo</span>
                    <span className="font-medium">{(nft.ltvRatio * 100).toFixed(0)}%</span>
                  </div>

                  {nft.monthlyRent && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Aluguel Mensal</span>
                      <span className="font-medium">R$ {nft.monthlyRent.toLocaleString()}</span>
                    </div>
                  )}

                  {nft.contractEndDate && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Fim do Contrato</span>
                      <span className="font-medium">{new Date(nft.contractEndDate).toLocaleDateString('pt-BR')}</span>
                    </div>
                  )}
                </CardContent>

                <CardFooter>
                  <Button
                    className="w-full"
                    disabled={nft.isLocked}
                    onClick={() => handleSelectNFT(nft)}
                  >
                    {nft.isLocked ? (
                      <>
                        <Lock className="h-4 w-4 mr-2" />
                        Em Uso
                      </>
                    ) : (
                      <>
                        <Banknote className="h-4 w-4 mr-2" />
                        Usar como Garantia
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Tab: Simulador */}
        <TabsContent value="simulate" className="mt-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Formulario de Simulacao */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calculator className="h-5 w-5" />
                  Simulador de Emprestimo
                </CardTitle>
                <CardDescription>
                  Configure os parametros do seu emprestimo
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Selecao de NFT */}
                <div className="space-y-2">
                  <Label>NFT como Garantia</Label>
                  <Select
                    value={selectedNFT?.id || ''}
                    onValueChange={(v) => {
                      const nft = collateralNFTs.find(n => n.id === v);
                      if (nft) handleSelectNFT(nft);
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um NFT" />
                    </SelectTrigger>
                    <SelectContent>
                      {collateralNFTs.filter(n => !n.isLocked).map(nft => (
                        <SelectItem key={nft.id} value={nft.id}>
                          {nft.name} - Max: R$ {nft.maxLoanValue.toLocaleString()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedNFT && (
                  <>
                    {/* Valor do Emprestimo */}
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <Label>Valor do Emprestimo</Label>
                        <span className="text-sm font-medium">R$ {loanAmount.toLocaleString()}</span>
                      </div>
                      <Slider
                        value={[loanAmount]}
                        min={loanTerms.minAmount}
                        max={Math.min(selectedNFT.maxLoanValue, loanTerms.maxAmount)}
                        step={1000}
                        onValueChange={([v]) => setLoanAmount(v)}
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Min: R$ {loanTerms.minAmount.toLocaleString()}</span>
                        <span>Max: R$ {Math.min(selectedNFT.maxLoanValue, loanTerms.maxAmount).toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Prazo */}
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <Label>Prazo (meses)</Label>
                        <span className="text-sm font-medium">{loanDuration} meses</span>
                      </div>
                      <Slider
                        value={[loanDuration]}
                        min={loanTerms.minDuration}
                        max={loanTerms.maxDuration}
                        step={1}
                        onValueChange={([v]) => setLoanDuration(v)}
                      />
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{loanTerms.minDuration} meses</span>
                        <span>{loanTerms.maxDuration} meses</span>
                      </div>
                    </div>

                    {/* Taxas */}
                    <div className="p-4 bg-slate-50 rounded-lg space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Taxa Mensal</span>
                        <span className="font-medium">{loanTerms.interestRateMonthly}% a.m.</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Taxa Anual (CET)</span>
                        <span className="font-medium">{loanTerms.interestRateAnnual}% a.a.</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Taxa de Originacao</span>
                        <span className="font-medium">{loanTerms.originationFee}%</span>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Resultado da Simulacao */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Resultado da Simulacao
                </CardTitle>
                <CardDescription>
                  Valores calculados com base nos parametros selecionados
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!selectedNFT ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <Wallet className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      Selecione um NFT para simular o emprestimo
                    </p>
                  </div>
                ) : loanSimulation ? (
                  <div className="space-y-4">
                    {/* Resumo Principal */}
                    <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl">
                      <p className="text-sm text-green-700 mb-1">Parcela Mensal</p>
                      <p className="text-4xl font-bold text-green-800">
                        R$ {loanSimulation.monthlyPayment.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                      <p className="text-sm text-green-600 mt-1">
                        {loanSimulation.duration}x de R$ {loanSimulation.monthlyPayment.toFixed(2)}
                      </p>
                    </div>

                    {/* Detalhamento */}
                    <div className="space-y-3">
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-muted-foreground">Valor Solicitado</span>
                        <span className="font-medium">R$ {loanSimulation.principal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-muted-foreground">Taxa de Originacao ({loanTerms.originationFee}%)</span>
                        <span className="font-medium text-red-600">- R$ {loanSimulation.originationFee.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b bg-green-50 px-2 rounded">
                        <span className="font-medium">Valor Liquido</span>
                        <span className="font-bold text-green-700">R$ {loanSimulation.netAmount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-muted-foreground">Total de Juros</span>
                        <span className="font-medium">R$ {loanSimulation.totalInterest.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between py-2 border-b">
                        <span className="text-muted-foreground">Total a Pagar</span>
                        <span className="font-medium">R$ {loanSimulation.totalPayment.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-muted-foreground">LTV (Loan-to-Value)</span>
                        <Badge variant={loanSimulation.ltv <= 60 ? 'default' : loanSimulation.ltv <= 70 ? 'secondary' : 'destructive'}>
                          {loanSimulation.ltv.toFixed(1)}%
                        </Badge>
                      </div>
                    </div>

                    {/* Alerta LTV */}
                    {loanSimulation.ltv > 65 && (
                      <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle>LTV Alto</AlertTitle>
                        <AlertDescription>
                          Um LTV acima de 65% aumenta o risco de liquidacao em caso de desvalorizacao do ativo.
                        </AlertDescription>
                      </Alert>
                    )}

                    <Button className="w-full" size="lg" onClick={handleRequestLoan}>
                      <Zap className="h-5 w-5 mr-2" />
                      Solicitar Emprestimo
                    </Button>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab: Emprestimos Ativos */}
        <TabsContent value="loans" className="mt-6 space-y-4">
          {loans.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Banknote className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">Nenhum emprestimo ativo</p>
                <p className="text-muted-foreground text-center max-w-md mt-2">
                  Voce ainda nao possui emprestimos. Utilize seus NFTs como garantia para obter credito.
                </p>
                <Button className="mt-4" onClick={() => setActiveTab('simulate')}>
                  <Calculator className="h-4 w-4 mr-2" />
                  Simular Emprestimo
                </Button>
              </CardContent>
            </Card>
          ) : (
            loans.map(loan => (
              <Card key={loan.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        Emprestimo #{loan.id.slice(-4).toUpperCase()}
                        {renderStatus(loan.status)}
                      </CardTitle>
                      <CardDescription>
                        Garantia: {loan.collateralNFT.name}
                      </CardDescription>
                    </div>
                    <Button variant="outline" size="sm">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Ver Detalhes
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-3">
                    {/* Valores */}
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Valor Emprestado</span>
                        <span className="font-medium">R$ {loan.principalAmount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Saldo Devedor</span>
                        <span className="font-bold text-lg">R$ {loan.outstandingBalance.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Parcela Mensal</span>
                        <span className="font-medium">R$ {loan.monthlyPayment.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Progresso */}
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>Pagamentos</span>
                        <span>{loan.paymentsMade} de {loan.totalPayments}</span>
                      </div>
                      <Progress value={(loan.paymentsMade / loan.totalPayments) * 100} className="h-3" />
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span>Proximo: {new Date(loan.nextPaymentDate).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>

                    {/* Garantia */}
                    <div className="flex items-center gap-4">
                      <img
                        src={loan.collateralNFT.imageUrl}
                        alt={loan.collateralNFT.name}
                        className="w-20 h-20 rounded-lg object-cover"
                      />
                      <div>
                        <p className="font-medium">{loan.collateralNFT.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Valor: R$ {loan.collateralNFT.underlyingValue.toLocaleString()}
                        </p>
                        <Badge variant="outline" className="mt-1">
                          <Lock className="h-3 w-3 mr-1" />
                          Bloqueado
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    Iniciado em {new Date(loan.startDate).toLocaleDateString('pt-BR')}
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline">
                      <FileText className="h-4 w-4 mr-2" />
                      Extrato
                    </Button>
                    <Button>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Pagar Parcela
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))
          )}
        </TabsContent>

        {/* Tab: Pagamentos */}
        <TabsContent value="payments" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Historico de Pagamentos</CardTitle>
              <CardDescription>
                Todos os pagamentos realizados e pendentes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Emprestimo</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Principal</TableHead>
                    <TableHead>Juros</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>TX Hash</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map(payment => (
                    <TableRow key={payment.id}>
                      <TableCell>
                        {new Date(payment.paymentDate).toLocaleDateString('pt-BR')}
                      </TableCell>
                      <TableCell>
                        #{payment.loanId.slice(-4).toUpperCase()}
                      </TableCell>
                      <TableCell className="font-medium">
                        R$ {payment.amount.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        R$ {payment.principalPaid.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        R$ {payment.interestPaid.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {payment.status === 'paid' ? (
                          <Badge className="bg-green-500">Pago</Badge>
                        ) : payment.status === 'late' ? (
                          <Badge className="bg-red-500">Atrasado</Badge>
                        ) : (
                          <Badge variant="outline">Pendente</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {payment.transactionHash && (
                          <a
                            href={`https://polygonscan.com/tx/${payment.transactionHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline text-xs"
                          >
                            {payment.transactionHash.slice(0, 8)}...
                          </a>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ============= ABAS DE ADMIN ============= */}

        {/* Tab: Metricas Admin */}
        <TabsContent value="admin_metrics" className="mt-6 space-y-6">
          {/* Metricas Principais */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{globalMetrics.totalLoans}</p>
                    <p className="text-xs text-muted-foreground">Total de Emprestimos</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-green-500">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Activity className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{globalMetrics.activeLoans}</p>
                    <p className="text-xs text-muted-foreground">Emprestimos Ativos</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-amber-500">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{globalMetrics.paidLoans}</p>
                    <p className="text-xs text-muted-foreground">Quitados</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-l-4 border-l-red-500">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{globalMetrics.defaultedLoans}</p>
                    <p className="text-xs text-muted-foreground">Inadimplentes</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Valores Financeiros */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Volume Financeiro
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Total Originado</span>
                  <span className="font-bold text-lg">R$ {globalMetrics.totalOriginated.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Saldo Devedor Total</span>
                  <span className="font-bold text-lg">R$ {globalMetrics.totalOutstanding.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Juros Recebidos</span>
                  <span className="font-bold text-lg text-green-600">R$ {globalMetrics.totalInterestEarned.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">Taxas de Originacao</span>
                  <span className="font-bold text-lg text-green-600">R$ {globalMetrics.totalFeesEarned.toLocaleString()}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Indicadores de Risco
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">LTV Medio</span>
                  <Badge variant={globalMetrics.averageLTV <= 60 ? 'default' : 'secondary'}>
                    {globalMetrics.averageLTV.toFixed(1)}%
                  </Badge>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Taxa Media de Juros</span>
                  <span className="font-medium">{globalMetrics.averageInterestRate.toFixed(2)}% a.m.</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Taxa de Inadimplencia</span>
                  <Badge variant={globalMetrics.defaultRate <= 5 ? 'default' : 'destructive'}>
                    {globalMetrics.defaultRate.toFixed(2)}%
                  </Badge>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-muted-foreground">Prazo Medio</span>
                  <span className="font-medium">{globalMetrics.avgLoanDuration.toFixed(1)} meses</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Grafico de Distribuicao (placeholder) */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Distribuicao por Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Ativos</span>
                    <span>{((globalMetrics.activeLoans / globalMetrics.totalLoans) * 100).toFixed(1)}%</span>
                  </div>
                  <Progress value={(globalMetrics.activeLoans / globalMetrics.totalLoans) * 100} className="h-3 bg-gray-200" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Quitados</span>
                    <span>{((globalMetrics.paidLoans / globalMetrics.totalLoans) * 100).toFixed(1)}%</span>
                  </div>
                  <Progress value={(globalMetrics.paidLoans / globalMetrics.totalLoans) * 100} className="h-3 bg-gray-200" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Inadimplentes</span>
                    <span>{((globalMetrics.defaultedLoans / globalMetrics.totalLoans) * 100).toFixed(1)}%</span>
                  </div>
                  <Progress value={(globalMetrics.defaultedLoans / globalMetrics.totalLoans) * 100} className="h-3 bg-gray-200" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Configuracao de Taxas */}
        <TabsContent value="admin_rates" className="mt-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Configuracao de Taxas e Juros</h3>
              <p className="text-sm text-muted-foreground">
                Defina as taxas aplicadas para cada faixa de LTV
              </p>
            </div>
            <Button onClick={() => {
              setEditingConfig({
                id: `rate_${Date.now()}`,
                name: 'Nova Faixa',
                minLTV: 0,
                maxLTV: 50,
                interestRateMonthly: 1.5,
                interestRateAnnual: 19.56,
                originationFee: 2.0,
                lateFee: 2.0,
                gracePeriodDays: 5,
                minDuration: 3,
                maxDuration: 36,
                isActive: true,
              });
              setIsConfigDialogOpen(true);
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Faixa
            </Button>
          </div>

          <div className="grid gap-4">
            {rateConfigs.map((config) => (
              <Card key={config.id} className={cn(!config.isActive && "opacity-60")}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      {config.name}
                      {config.isActive ? (
                        <Badge className="bg-green-500">Ativa</Badge>
                      ) : (
                        <Badge variant="outline">Inativa</Badge>
                      )}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingConfig(config);
                          setIsConfigDialogOpen(true);
                        }}
                      >
                        <Edit3 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setRateConfigs(prev =>
                            prev.map(c => c.id === config.id ? { ...c, isActive: !c.isActive } : c)
                          );
                        }}
                      >
                        {config.isActive ? (
                          <ToggleRight className="h-4 w-4 text-green-600" />
                        ) : (
                          <ToggleLeft className="h-4 w-4 text-gray-400" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                        onClick={() => {
                          if (confirm('Tem certeza que deseja remover esta faixa?')) {
                            setRateConfigs(prev => prev.filter(c => c.id !== config.id));
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-4">
                    <div className="p-3 bg-slate-50 rounded-lg">
                      <p className="text-xs text-muted-foreground">Faixa LTV</p>
                      <p className="font-bold">{config.minLTV}% - {config.maxLTV}%</p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-xs text-muted-foreground">Taxa Mensal</p>
                      <p className="font-bold text-blue-700">{config.interestRateMonthly}% a.m.</p>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <p className="text-xs text-muted-foreground">Taxa Anual</p>
                      <p className="font-bold text-green-700">{config.interestRateAnnual}% a.a.</p>
                    </div>
                    <div className="p-3 bg-amber-50 rounded-lg">
                      <p className="text-xs text-muted-foreground">Taxa Originacao</p>
                      <p className="font-bold text-amber-700">{config.originationFee}%</p>
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-3 mt-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Multa Atraso</span>
                      <span className="font-medium">{config.lateFee}%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Carencia</span>
                      <span className="font-medium">{config.gracePeriodDays} dias</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Prazo</span>
                      <span className="font-medium">{config.minDuration} - {config.maxDuration} meses</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Configuracao Global */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configuracoes Globais
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Valor Minimo de Emprestimo (R$)</Label>
                  <Input
                    type="number"
                    value={loanTerms.minAmount}
                    onChange={(e) => setLoanTerms(prev => ({ ...prev, minAmount: Number(e.target.value) }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Valor Maximo de Emprestimo (R$)</Label>
                  <Input
                    type="number"
                    value={loanTerms.maxAmount}
                    onChange={(e) => setLoanTerms(prev => ({ ...prev, maxAmount: Number(e.target.value) }))}
                  />
                </div>
              </div>
              <Button onClick={() => alert('Configuracoes salvas com sucesso!')}>
                <Save className="h-4 w-4 mr-2" />
                Salvar Configuracoes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Todos Emprestimos (Admin) */}
        <TabsContent value="admin_loans" className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Todos os Emprestimos</CardTitle>
                  <CardDescription>
                    Visao geral de todos os emprestimos da plataforma
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Atualizar
                  </Button>
                  <Button variant="outline" size="sm">
                    Exportar
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Tomador</TableHead>
                    <TableHead>Garantia</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Saldo</TableHead>
                    <TableHead>Taxa</TableHead>
                    <TableHead>LTV</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Acoes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loans.map(loan => (
                    <TableRow key={loan.id}>
                      <TableCell className="font-mono text-sm">
                        #{loan.id.slice(-6).toUpperCase()}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{loan.borrowerName}</p>
                          <p className="text-xs text-muted-foreground">{loan.borrowerId}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <img
                            src={loan.collateralNFT.imageUrl}
                            alt=""
                            className="w-8 h-8 rounded object-cover"
                          />
                          <span className="text-sm">{loan.collateralNFT.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>R$ {loan.principalAmount.toLocaleString()}</TableCell>
                      <TableCell className="font-medium">
                        R$ {loan.outstandingBalance.toLocaleString()}
                      </TableCell>
                      <TableCell>{loan.interestRate}% a.m.</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {((loan.principalAmount / loan.collateralNFT.underlyingValue) * 100).toFixed(0)}%
                        </Badge>
                      </TableCell>
                      <TableCell>{renderStatus(loan.status)}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog de Configuracao de Taxas */}
      <Dialog open={isConfigDialogOpen} onOpenChange={setIsConfigDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingConfig?.id.startsWith('rate_') && !rateConfigs.find(c => c.id === editingConfig.id)
                ? 'Nova Faixa de Taxa'
                : 'Editar Faixa de Taxa'}
            </DialogTitle>
            <DialogDescription>
              Configure os parametros para esta faixa de LTV
            </DialogDescription>
          </DialogHeader>

          {editingConfig && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Nome da Faixa</Label>
                <Input
                  value={editingConfig.name}
                  onChange={(e) => setEditingConfig({ ...editingConfig, name: e.target.value })}
                />
              </div>

              <div className="grid gap-4 grid-cols-2">
                <div className="space-y-2">
                  <Label>LTV Minimo (%)</Label>
                  <Input
                    type="number"
                    value={editingConfig.minLTV}
                    onChange={(e) => setEditingConfig({ ...editingConfig, minLTV: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>LTV Maximo (%)</Label>
                  <Input
                    type="number"
                    value={editingConfig.maxLTV}
                    onChange={(e) => setEditingConfig({ ...editingConfig, maxLTV: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="grid gap-4 grid-cols-2">
                <div className="space-y-2">
                  <Label>Taxa Mensal (%)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={editingConfig.interestRateMonthly}
                    onChange={(e) => {
                      const monthly = Number(e.target.value);
                      const annual = ((Math.pow(1 + monthly / 100, 12) - 1) * 100);
                      setEditingConfig({
                        ...editingConfig,
                        interestRateMonthly: monthly,
                        interestRateAnnual: Number(annual.toFixed(2))
                      });
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Taxa Anual (%) - calculada</Label>
                  <Input
                    type="number"
                    value={editingConfig.interestRateAnnual}
                    disabled
                    className="bg-gray-50"
                  />
                </div>
              </div>

              <div className="grid gap-4 grid-cols-3">
                <div className="space-y-2">
                  <Label>Taxa Originacao (%)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={editingConfig.originationFee}
                    onChange={(e) => setEditingConfig({ ...editingConfig, originationFee: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Multa Atraso (%)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={editingConfig.lateFee}
                    onChange={(e) => setEditingConfig({ ...editingConfig, lateFee: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Carencia (dias)</Label>
                  <Input
                    type="number"
                    value={editingConfig.gracePeriodDays}
                    onChange={(e) => setEditingConfig({ ...editingConfig, gracePeriodDays: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="grid gap-4 grid-cols-2">
                <div className="space-y-2">
                  <Label>Prazo Minimo (meses)</Label>
                  <Input
                    type="number"
                    value={editingConfig.minDuration}
                    onChange={(e) => setEditingConfig({ ...editingConfig, minDuration: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Prazo Maximo (meses)</Label>
                  <Input
                    type="number"
                    value={editingConfig.maxDuration}
                    onChange={(e) => setEditingConfig({ ...editingConfig, maxDuration: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={editingConfig.isActive}
                  onCheckedChange={(checked) => setEditingConfig({ ...editingConfig, isActive: checked })}
                />
                <Label>Faixa ativa</Label>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfigDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => {
              if (editingConfig) {
                const existingIndex = rateConfigs.findIndex(c => c.id === editingConfig.id);
                if (existingIndex >= 0) {
                  setRateConfigs(prev => prev.map(c => c.id === editingConfig.id ? editingConfig : c));
                } else {
                  setRateConfigs(prev => [...prev, editingConfig]);
                }
                setIsConfigDialogOpen(false);
                setEditingConfig(null);
              }
            }}>
              <Save className="h-4 w-4 mr-2" />
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmacao */}
      <Dialog open={isLoanDialogOpen} onOpenChange={setIsLoanDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar Solicitacao de Emprestimo</DialogTitle>
            <DialogDescription>
              Revise os termos antes de confirmar
            </DialogDescription>
          </DialogHeader>

          {loanSimulation && selectedNFT && (
            <div className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Importante</AlertTitle>
                <AlertDescription>
                  Seu NFT sera bloqueado como garantia. Em caso de inadimplencia,
                  o NFT pode ser liquidado para cobrir a divida.
                </AlertDescription>
              </Alert>

              <div className="p-4 bg-slate-50 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span>Garantia</span>
                  <span className="font-medium">{selectedNFT.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Valor do Emprestimo</span>
                  <span className="font-medium">R$ {loanSimulation.principal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Parcela Mensal</span>
                  <span className="font-medium">R$ {loanSimulation.monthlyPayment.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Prazo</span>
                  <span className="font-medium">{loanSimulation.duration} meses</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold">
                  <span>Valor Liquido a Receber</span>
                  <span className="text-green-700">R$ {loanSimulation.netAmount.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input type="checkbox" id="terms" className="rounded" />
                <label htmlFor="terms" className="text-sm">
                  Li e concordo com os <a href="#" className="text-blue-600 hover:underline">termos e condicoes</a>
                </label>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsLoanDialogOpen(false)} disabled={isProcessing}>
              Cancelar
            </Button>
            <Button onClick={handleConfirmLoan} disabled={isProcessing}>
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Confirmar Emprestimo
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default NFTLoans;
