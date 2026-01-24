/**
 * Dashboard do Garantidor - Vínculo.io
 * Sistema completo com: Certificado NFT, Calculadora ROI,
 * Dashboard de Ganhos, Termo de Consentimento e Yield Stacking
 */

import { useState } from 'react';
import { copyToClipboard as copyToClipboardUtil } from '@/lib/clipboard';
import { VinculoBrasilLogo } from '@/components/vinculo-brasil-logo';
import { AdBanner } from '@/components/engine';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  Unlock,
  TrendingUp,
  Award,
  Home,
  Wallet,
  Calculator,
  ArrowRight,
  ShieldCheck,
  Share2,
  Download,
  FileText,
  Zap,
  Landmark,
  History,
  ArrowUpRight,
  ExternalLink,
  QrCode,
  Lock,
  Sparkles,
  DollarSign,
  PiggyBank,
  Target,
  Gift,
  Crown,
  Star,
  Copy,
  Check,
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

interface GuaranteedContract {
  id: string;
  tenant: string;
  propertyAddress: string;
  monthlyRent: number;
  lockedAmount: number;
  status: 'active' | 'overdue' | 'paid';
  contractEnd: Date;
  daysOverdue?: number;
  transactionHash: string;
}

interface CollateralProperty {
  id: string;
  address: string;
  marketValue: number;
  maxCapacity: number;
  currentlyLocked: number;
  remainingCapacity: number;
  activeGuarantees: number;
  blockchainStatus: 'LOCKED_COLLATERAL' | 'AVAILABLE';
  isOwnProperty: boolean;
  monthlyRent?: number;
}

interface EarningsHistory {
  id: string;
  month: string;
  contractId: string;
  propertyAddress: string;
  commission: number;
  status: 'paid' | 'pending';
  transactionHash: string;
  paidAt?: Date;
}

interface LoyaltyReward {
  level: 'Bronze' | 'Prata' | 'Ouro' | 'Platinum' | 'Diamante';
  activeGuarantees: number;
  discount: number;
  benefits: string[];
  nextLevel?: string;
  guaranteesToNextLevel?: number;
}

export function GuarantorDashboard() {
  // Estados principais
  const [activeTab, setActiveTab] = useState('overview');
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [consentChecks, setConsentChecks] = useState({ terms1: false, terms2: false, terms3: false });
  const [propertyValueSlider, setPropertyValueSlider] = useState([500000]);
  const [yieldStackingEnabled, setYieldStackingEnabled] = useState(false);
  const [contractsToGuarantee, setContractsToGuarantee] = useState(2);
  const [copied, setCopied] = useState(false);

  // Dados do garantidor
  const [guarantorData] = useState({
    name: 'Renato Rodrigues Rufatto',
    level: 'Ouro' as const,
    totalEarnings: 18400,
    availableBalance: 4250,
    monthlyEarnings: 3200,
    activeContracts: 4,
    propertyValue: 500000,
    transactionHash: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
    joinedAt: new Date('2025-06-15'),
    trustScore: 94,
  });

  // Propriedades colaterais - Vazio para producao
  const [collateralProperties] = useState<CollateralProperty[]>([]);

  // Contratos garantidos - Vazio para producao
  const [guaranteedContracts] = useState<GuaranteedContract[]>([]);

  // Histórico de ganhos - Vazio para producao
  const [earningsHistory] = useState<EarningsHistory[]>([]);

  // Dados de gráfico mensal - Vazio para producao
  const [monthlyChartData] = useState<{ month: string; value: number }[]>([]);

  // Programa de fidelidade - Zerado para producao
  const [loyaltyReward] = useState<LoyaltyReward>({
    level: 'Bronze',
    activeGuarantees: 0,
    discount: 0,
    benefits: [],
    nextLevel: 'Prata',
    guaranteesToNextLevel: 1,
  });

  // Cálculos
  const totalLocked = collateralProperties.reduce((acc, p) => acc + p.currentlyLocked, 0);
  const totalCapacity = collateralProperties.reduce((acc, p) => acc + p.maxCapacity, 0);
  const utilizationRate = (totalLocked / totalCapacity) * 100;
  const monthlyCommission = guaranteedContracts.reduce((acc, c) => acc + c.monthlyRent * 0.05, 0);

  // Cálculos da calculadora ROI
  const propertyValue = propertyValueSlider[0];
  const estimatedRent = propertyValue * 0.005;
  const monthlyYield = estimatedRent * 0.05;
  const annualYield = monthlyYield * 12;
  const fiveYearYield = annualYield * 5;

  // Cálculos de Yield Stacking (Locador → Garantidor)
  const ownPropertyRent = collateralProperties.filter(p => p.isOwnProperty).reduce((acc, p) => acc + (p.monthlyRent || 0), 0);
  const ownPropertyLandlordShare = ownPropertyRent * 0.85;
  const extraGuarantorYield = contractsToGuarantee * (estimatedRent * 0.05);
  const totalCombinedYield = ownPropertyLandlordShare + extraGuarantorYield;

  const copyToClipboard = async (text: string) => {
    const success = await copyToClipboardUtil(text);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleConsentSubmit = () => {
    if (consentChecks.terms1 && consentChecks.terms2 && consentChecks.terms3) {
      setShowConsentModal(false);
      // Aqui iria a lógica de salvar o consentimento
      alert('Termo aceito com sucesso! Seu imóvel está agora tokenizado como colateral.');
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'Bronze': return <Award className="h-5 w-5 text-orange-700" />;
      case 'Prata': return <Award className="h-5 w-5 text-slate-400" />;
      case 'Ouro': return <Crown className="h-5 w-5 text-amber-500" />;
      case 'Platinum': return <Star className="h-5 w-5 text-violet-500" />;
      case 'Diamante': return <Sparkles className="h-5 w-5 text-cyan-400" />;
      default: return <Award className="h-5 w-5" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header com Badge de Nível */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <VinculoBrasilLogo size="sm" />
          <div className="border-l pl-4">
            <h1 className="text-3xl font-bold">Dashboard do Garantidor</h1>
            <p className="text-muted-foreground">
              Transparência total sobre suas garantias e rendimentos
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-amber-400 to-orange-600 p-[2px] rounded-2xl">
            <div className="bg-background px-4 py-2 rounded-[14px] flex items-center gap-2">
              {getLevelIcon(loyaltyReward.level)}
              <span className="font-bold text-sm text-foreground">Garantidor {loyaltyReward.level}</span>
            </div>
          </div>
          <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50">
            Trust Score: {guarantorData.trustScore}%
          </Badge>
        </div>
      </div>

      {/* Alert de Inadimplência */}
      {guaranteedContracts.some(c => c.status === 'overdue') && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Alerta de Inadimplência</AlertTitle>
          <AlertDescription>
            Um dos locatários que você garante está com pagamento atrasado há{' '}
            {guaranteedContracts.find(c => c.status === 'overdue')?.daysOverdue} dia(s).
            A seguradora já foi notificada e cobrirá o pagamento ao locador.
          </AlertDescription>
        </Alert>
      )}

      {/* Banner de Anuncios */}
      <AdBanner placement="header" clientType="guarantor" maxAds={3} />

      {/* Tabs Principais */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />Visão Geral
          </TabsTrigger>
          <TabsTrigger value="earnings" className="flex items-center gap-2">
            <Wallet className="h-4 w-4" />Ganhos
          </TabsTrigger>
          <TabsTrigger value="calculator" className="flex items-center gap-2">
            <Calculator className="h-4 w-4" />Calculadora
          </TabsTrigger>
          <TabsTrigger value="certificate" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />Certificado NFT
          </TabsTrigger>
          <TabsTrigger value="yield-stacking" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />Yield Stacking
          </TabsTrigger>
          <TabsTrigger value="contracts" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />Contratos
          </TabsTrigger>
        </TabsList>

        {/* Tab: Visão Geral */}
        <TabsContent value="overview" className="space-y-6">
          {/* Cards de Resumo */}
          <div className="grid gap-4 md:grid-cols-5">
            <Card className="bg-card text-foreground">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Saldo Disponível</CardTitle>
                <Wallet className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  R$ {guarantorData.availableBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <Button size="sm" className="w-full mt-3 bg-background text-foreground hover:bg-muted">
                  Sacar via PIX
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Comissão Mensal</CardTitle>
                <TrendingUp className="h-4 w-4 text-emerald-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-400">
                  R$ {monthlyCommission.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <div className="flex items-center gap-1 text-xs text-emerald-600 mt-1">
                  <ArrowUpRight className="h-3 w-3" />+12.5% vs mês anterior
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Acumulado</CardTitle>
                <PiggyBank className="h-4 w-4 text-violet-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  R$ {guarantorData.totalEarnings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
                <p className="text-xs text-muted-foreground">Desde {guarantorData.joinedAt.toLocaleDateString('pt-BR')}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Contratos Ativos</CardTitle>
                <Shield className="h-4 w-4 text-blue-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{guarantorData.activeContracts}</div>
                <p className="text-xs text-muted-foreground">Locatários garantidos</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Taxa de Yield</CardTitle>
                <Target className="h-4 w-4 text-indigo-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-indigo-600">5%</div>
                <p className="text-xs text-muted-foreground">Sobre aluguel bruto</p>
              </CardContent>
            </Card>
          </div>

          {/* Medidor de Margem */}
          <Card>
            <CardHeader>
              <CardTitle>Medidor de Margem de Garantia</CardTitle>
              <CardDescription>
                Você pode comprometer até 80% do valor dos seus imóveis como garantia (LTV)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Utilização: {utilizationRate.toFixed(1)}%</span>
                  <span className="text-muted-foreground">
                    R$ {totalLocked.toLocaleString('pt-BR')} de R$ {totalCapacity.toLocaleString('pt-BR')}
                  </span>
                </div>
                <Progress value={utilizationRate} className="h-4" />
              </div>

              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="rounded-lg border p-3">
                  <div className="text-sm text-muted-foreground">Capacidade Total (80% LTV)</div>
                  <div className="text-lg font-bold">R$ {totalCapacity.toLocaleString('pt-BR')}</div>
                </div>
                <div className="rounded-lg border p-3 bg-orange-50">
                  <div className="text-sm text-muted-foreground">Comprometido</div>
                  <div className="text-lg font-bold text-orange-400">R$ {totalLocked.toLocaleString('pt-BR')}</div>
                </div>
                <div className="rounded-lg border p-3 bg-green-50">
                  <div className="text-sm text-muted-foreground">Disponível</div>
                  <div className="text-lg font-bold text-emerald-400">R$ {(totalCapacity - totalLocked).toLocaleString('pt-BR')}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Programa de Fidelidade */}
          <Card className="border-2 border-amber-400 bg-gradient-to-br from-amber-50 to-orange-50">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl text-foreground">
                    <Crown className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle>Programa de Fidelidade - Nível {loyaltyReward.level}</CardTitle>
                    <CardDescription>
                      Faltam {loyaltyReward.guaranteesToNextLevel} garantias para o nível {loyaltyReward.nextLevel}
                    </CardDescription>
                  </div>
                </div>
                <Badge className="bg-amber-500">{loyaltyReward.discount}% OFF</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Progress value={(loyaltyReward.activeGuarantees / 6) * 100} className="h-2" />

              <div className="grid grid-cols-5 gap-2 text-center">
                {['Bronze', 'Prata', 'Ouro', 'Platinum', 'Diamante'].map((level, i) => (
                  <div key={level} className={cn(
                    "rounded-lg border p-2 transition-all",
                    level === loyaltyReward.level ? 'border-2 border-amber-500 bg-background shadow-lg' : 'opacity-60'
                  )}>
                    <div className="text-xs text-muted-foreground">{level}</div>
                    <div className="text-sm font-semibold">{i + 1}+ garantia{i > 0 ? 's' : ''}</div>
                    <div className="text-xs text-emerald-400">{[5, 15, 25, 35, 50][i]}% off</div>
                  </div>
                ))}
              </div>

              <div className="bg-background rounded-lg p-4">
                <h4 className="font-semibold mb-2">Seus Benefícios Atuais:</h4>
                <ul className="space-y-1">
                  {loyaltyReward.benefits.map((benefit, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-emerald-400" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Dashboard de Ganhos */}
        <TabsContent value="earnings" className="space-y-6">
          {/* Cards de Ganhos */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="bg-card text-foreground">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="p-2 bg-background/10 rounded-lg"><Wallet className="h-5 w-5" /></div>
                  <Badge className="bg-emerald-500">Disponível</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-xs uppercase font-bold tracking-widest">Saldo Atual</p>
                <h2 className="text-3xl font-black mt-1">R$ {guarantorData.availableBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h2>
                <Button size="sm" className="w-full mt-4 bg-background text-foreground hover:bg-muted">
                  Sacar via PIX
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground text-xs uppercase font-bold tracking-widest mb-1">Total Acumulado</p>
                <h2 className="text-2xl font-bold">R$ {guarantorData.totalEarnings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h2>
                <div className="flex items-center gap-1 text-emerald-600 font-bold text-xs mt-2">
                  <TrendingUp className="h-4 w-4" /> +12.5% vs mês anterior
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground text-xs uppercase font-bold tracking-widest mb-1">Contratos Ativos</p>
                <h2 className="text-2xl font-bold">{guarantorData.activeContracts}</h2>
                <p className="text-muted-foreground text-xs mt-2 italic">Garantindo R$ {(totalLocked / 1000).toFixed(0)}k em ativos</p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <p className="text-muted-foreground text-xs uppercase font-bold tracking-widest mb-1">Taxa de Yield</p>
                <h2 className="text-2xl font-bold">5% fixo</h2>
                <p className="text-muted-foreground text-xs mt-2">Remuneração sobre aluguel bruto</p>
              </CardContent>
            </Card>
          </div>

          {/* Gráfico de Crescimento */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-indigo-600" />
                Crescimento Mensal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between h-48 gap-2">
                {monthlyChartData.map((d, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                    <div
                      style={{ height: `${(d.value / 3500) * 100}%` }}
                      className="w-full bg-indigo-100 group-hover:bg-indigo-600 rounded-t-lg transition-all duration-300 relative cursor-pointer"
                    >
                      <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-card text-foreground text-xs px-2 py-1 rounded whitespace-nowrap">
                        R$ {d.value.toLocaleString('pt-BR')}
                      </div>
                    </div>
                    <span className="text-xs font-bold text-muted-foreground">{d.month}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Histórico de Comissões */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Histórico de Comissões
              </CardTitle>
              <Button variant="outline" size="sm"><Download className="h-4 w-4 mr-2" />Exportar</Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Contrato</TableHead>
                    <TableHead>Imóvel</TableHead>
                    <TableHead>Comissão</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Hash</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {earningsHistory.map(earning => (
                    <TableRow key={earning.id}>
                      <TableCell className="font-medium">{earning.month}</TableCell>
                      <TableCell className="font-mono text-xs">{earning.contractId}</TableCell>
                      <TableCell>{earning.propertyAddress}</TableCell>
                      <TableCell className="text-emerald-600 font-bold">
                        + R$ {earning.commission.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell>
                        <Badge className={earning.status === 'paid' ? 'bg-emerald-500' : 'bg-amber-500'}>
                          {earning.status === 'paid' ? 'Pago' : 'Pendente'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs text-muted-foreground">{earning.transactionHash}</code>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Calculadora de ROI */}
        <TabsContent value="calculator" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-indigo-600 rounded-2xl text-foreground">
                  <Calculator className="h-6 w-6" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Calculadora de Renda Passiva</CardTitle>
                  <CardDescription>Simule seus ganhos como Garantidor Vínculo.io</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-8">
                {/* Input Side */}
                <div className="space-y-8">
                  <div>
                    <label className="block text-sm font-bold text-muted-foreground mb-4 uppercase tracking-wider">
                      Valor de Mercado do seu Imóvel
                    </label>
                    <Slider
                      value={propertyValueSlider}
                      onValueChange={setPropertyValueSlider}
                      min={200000}
                      max={5000000}
                      step={50000}
                      className="w-full"
                    />
                    <div className="mt-4 text-4xl font-black text-foreground">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(propertyValue)}
                    </div>
                  </div>

                  <Card className="bg-muted border-border">
                    <CardContent className="pt-6">
                      <h4 className="font-bold text-foreground mb-2 flex items-center gap-2">
                        <ShieldCheck className="text-indigo-600 h-5 w-5" />
                        Como funciona?
                      </h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        O seu imóvel garante contratos de locação. Você recebe 5% de cada aluguel mensal
                        processado sob a sua garantia. Sem custos de manutenção ou impostos adicionais.
                      </p>
                    </CardContent>
                  </Card>

                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-400" />
                      <span>Seguro-fiança protege você de inadimplência</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-400" />
                      <span>Seu imóvel nunca sai do seu nome</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-emerald-400" />
                      <span>Rendimento depositado automaticamente via PIX</span>
                    </div>
                  </div>
                </div>

                {/* Results Side */}
                <div className="bg-indigo-600 rounded-3xl p-8 text-foreground relative overflow-hidden">
                  <div className="relative z-10 space-y-8">
                    <div>
                      <p className="text-indigo-200 text-xs font-bold uppercase tracking-widest mb-1">Ganho Mensal Estimado</p>
                      <h3 className="text-4xl font-black">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(monthlyYield)}
                      </h3>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-background/10 p-4 rounded-2xl">
                        <p className="text-indigo-200 text-xs font-bold uppercase mb-1">Em 1 Ano</p>
                        <p className="text-xl font-bold">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(annualYield)}
                        </p>
                      </div>
                      <div className="bg-background/10 p-4 rounded-2xl">
                        <p className="text-indigo-200 text-xs font-bold uppercase mb-1">Em 5 Anos</p>
                        <p className="text-xl font-bold">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(fiveYearYield)}
                        </p>
                      </div>
                    </div>

                    <Dialog open={showConsentModal} onOpenChange={setShowConsentModal}>
                      <DialogTrigger asChild>
                        <Button className="w-full bg-background text-indigo-600 font-bold py-6 rounded-2xl hover:bg-indigo-50">
                          Tornar-me um Garantidor <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[90vh]">
                        <DialogHeader>
                          <div className="flex items-center gap-3">
                            <div className="p-3 bg-indigo-100 rounded-xl">
                              <Lock className="h-6 w-6 text-indigo-600" />
                            </div>
                            <div>
                              <DialogTitle className="text-xl">Termo de Garantia Tokenizada</DialogTitle>
                              <DialogDescription>Leia atentamente antes de aceitar</DialogDescription>
                            </div>
                          </div>
                        </DialogHeader>

                        {/* Resumo do Acordo */}
                        <div className="grid grid-cols-3 gap-4 my-4">
                          <div className="p-4 bg-muted rounded-xl text-center">
                            <Home className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
                            <p className="text-xs text-muted-foreground">Imóvel Garantido</p>
                            <p className="font-bold text-sm">Seu Imóvel</p>
                          </div>
                          <div className="p-4 bg-muted rounded-xl text-center">
                            <DollarSign className="h-6 w-6 mx-auto text-muted-foreground mb-2" />
                            <p className="text-xs text-muted-foreground">Valor da Garantia</p>
                            <p className="font-bold text-sm">R$ {(propertyValue * 0.8).toLocaleString('pt-BR')}</p>
                          </div>
                          <div className="p-4 bg-emerald-50 rounded-xl text-center">
                            <TrendingUp className="h-6 w-6 mx-auto text-emerald-500 mb-2" />
                            <p className="text-xs text-muted-foreground">Remuneração</p>
                            <p className="font-bold text-sm text-emerald-600">5% / mês</p>
                          </div>
                        </div>

                        {/* Termo Jurídico */}
                        <ScrollArea className="h-48 border rounded-lg p-4 bg-muted">
                          <div className="space-y-4 text-sm">
                            <h4 className="font-bold uppercase text-xs tracking-wider text-muted-foreground">
                              Termo de Constituição de Garantia Real via Ativo Digital
                            </h4>
                            <p>Ao clicar em "Aceitar", eu, na qualidade de GARANTIDOR, declaro e aceito que:</p>
                            <p><strong>1. Remuneração:</strong> Em contrapartida à garantia prestada, receberei mensalmente a quantia correspondente a 5% (cinco por cento) do valor do aluguel bruto, depositada automaticamente na minha carteira digital.</p>
                            <p><strong>2. Tokenização:</strong> Autorizo a emissão de um certificado digital (NFT) vinculado à matrícula do meu imóvel, que servirá como prova de colateral no protocolo Vínculo.io.</p>
                            <p><strong>3. Execução de Garantia:</strong> Em caso de inadimplência do locatário, não coberta pela apólice de seguro-fiança, autorizo a retenção proporcional de valores do colateral para quitação de débitos, conforme decisão do Administrador da plataforma.</p>
                            <p><strong>4. Imutabilidade:</strong> Este termo é registrado em blockchain, sendo as suas cláusulas irrevogáveis durante a vigência do contrato de locação principal.</p>
                          </div>
                        </ScrollArea>

                        {/* Checkboxes */}
                        <div className="space-y-3 mt-4">
                          <div className="flex items-start gap-3">
                            <Checkbox
                              id="terms1"
                              checked={consentChecks.terms1}
                              onCheckedChange={(checked) => setConsentChecks(prev => ({ ...prev, terms1: checked as boolean }))}
                            />
                            <label htmlFor="terms1" className="text-sm">
                              Compreendo que o meu imóvel será tokenizado como colateral.
                            </label>
                          </div>
                          <div className="flex items-start gap-3">
                            <Checkbox
                              id="terms2"
                              checked={consentChecks.terms2}
                              onCheckedChange={(checked) => setConsentChecks(prev => ({ ...prev, terms2: checked as boolean }))}
                            />
                            <label htmlFor="terms2" className="text-sm">
                              Aceito a remuneração de 5% sobre o valor líquido do aluguel.
                            </label>
                          </div>
                          <div className="flex items-start gap-3">
                            <Checkbox
                              id="terms3"
                              checked={consentChecks.terms3}
                              onCheckedChange={(checked) => setConsentChecks(prev => ({ ...prev, terms3: checked as boolean }))}
                            />
                            <label htmlFor="terms3" className="text-sm">
                              Li e concordo com o Termo de Garantia Tokenizada acima.
                            </label>
                          </div>
                        </div>

                        <DialogFooter className="mt-4">
                          <Button variant="outline" onClick={() => setShowConsentModal(false)}>Cancelar</Button>
                          <Button
                            onClick={handleConsentSubmit}
                            disabled={!consentChecks.terms1 || !consentChecks.terms2 || !consentChecks.terms3}
                            className="bg-indigo-600 hover:bg-indigo-700"
                          >
                            <Sparkles className="h-4 w-4 mr-2" />
                            Assinar e Bloquear Colateral
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>

                  <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-background/10 rounded-full blur-3xl" />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Certificado NFT */}
        <TabsContent value="certificate" className="space-y-6">
          <div className="max-w-2xl mx-auto">
            <Card className="bg-background rounded-3xl border border-border shadow-2xl relative overflow-hidden">
              {/* Detalhe Decorativo */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full -mr-32 -mt-32 blur-3xl opacity-50" />

              <CardContent className="p-8 relative z-10">
                {/* Header */}
                <div className="flex justify-between items-start mb-12">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 bg-indigo-600 rounded" />
                      <span className="font-bold text-foreground tracking-tight">Vínculo.io</span>
                    </div>
                    <h1 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                      Protocolo de Ativo Digital
                    </h1>
                  </div>
                  <Badge className="bg-emerald-50 text-emerald-700 border-emerald-100">
                    <ShieldCheck className="h-3 w-3 mr-1" />
                    Garantia Verificada
                  </Badge>
                </div>

                {/* Corpo do Certificado */}
                <div className="text-center space-y-6 mb-12">
                  <p className="text-muted-foreground font-medium">Este documento certifica que</p>
                  <h2 className="text-3xl font-serif italic text-foreground">{guarantorData.name}</h2>
                  <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
                    Disponibilizou o imóvel <span className="text-foreground font-semibold">{collateralProperties[0].address}</span> como
                    colateral digital para contratos no protocolo <span className="font-mono text-indigo-600">Vínculo.io</span>.
                  </p>
                </div>

                {/* Grid de Dados */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="p-4 bg-muted rounded-2xl border border-border">
                    <p className="text-xs text-muted-foreground font-bold uppercase mb-1">Remuneração Mensal</p>
                    <p className="text-xl font-bold text-indigo-600">5% do Aluguel</p>
                  </div>
                  <div className="p-4 bg-muted rounded-2xl border border-border">
                    <p className="text-xs text-muted-foreground font-bold uppercase mb-1">Status na Rede</p>
                    <p className="text-xl font-bold text-foreground">Bloqueado</p>
                  </div>
                  <div className="p-4 bg-muted rounded-2xl border border-border">
                    <p className="text-xs text-muted-foreground font-bold uppercase mb-1">Valor Tokenizado</p>
                    <p className="text-xl font-bold text-foreground">
                      R$ {collateralProperties[0].maxCapacity.toLocaleString('pt-BR')}
                    </p>
                  </div>
                  <div className="p-4 bg-muted rounded-2xl border border-border">
                    <p className="text-xs text-muted-foreground font-bold uppercase mb-1">Contratos Ativos</p>
                    <p className="text-xl font-bold text-foreground">{guarantorData.activeContracts}</p>
                  </div>
                </div>

                {/* Rodapé Técnico */}
                <div className="pt-8 border-t border-border flex justify-between items-end">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground font-bold uppercase tracking-tighter">Blockchain Proof (Hash)</p>
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-mono text-muted-foreground">{guarantorData.transactionHash}</p>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0"
                        onClick={() => copyToClipboard(guarantorData.transactionHash)}
                      >
                        {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                      </Button>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline"><Share2 className="h-4 w-4 mr-1" />Compartilhar</Button>
                    <Button size="sm" variant="outline"><Download className="h-4 w-4 mr-1" />Baixar PDF</Button>
                  </div>
                </div>

                {/* QR Code Simulado */}
                <div className="mt-6 flex justify-center">
                  <div className="p-4 bg-muted rounded-xl flex items-center gap-4">
                    <QrCode className="h-16 w-16 text-muted-foreground" />
                    <div className="text-left">
                      <p className="text-xs font-bold text-muted-foreground">Verificar na Blockchain</p>
                      <p className="text-xs text-muted-foreground">Escaneie para validar autenticidade</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="text-center mt-6">
              <p className="text-sm text-muted-foreground">
                Este certificado é gerado automaticamente e registrado na rede Polygon/Base.
              </p>
            </div>
          </div>
        </TabsContent>

        {/* Tab: Yield Stacking (Locador → Garantidor) */}
        <TabsContent value="yield-stacking" className="space-y-6">
          <Card className="bg-gradient-to-br from-violet-600 to-indigo-700 text-foreground overflow-hidden relative">
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-background/10 rounded-full blur-3xl" />
            <CardContent className="p-8 relative z-10">
              <div className="flex items-start gap-4 mb-6">
                <div className="p-3 bg-background/20 rounded-xl">
                  <Zap className="h-8 w-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Yield Stacking</h2>
                  <p className="text-violet-200">Turbine o rendimento do seu imóvel já alugado</p>
                </div>
              </div>
              <p className="text-violet-100 leading-relaxed">
                Você já é locador e recebe 85% do aluguel. Agora, use o <strong>lastro do seu próprio imóvel</strong> para
                garantir outros contratos e receba <strong>+5% adicional</strong> por cada contrato garantido.
              </p>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Card de Ativação */}
            <Card className="border-2 border-dashed border-violet-300 bg-gradient-to-br from-violet-50 to-indigo-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-violet-600" />
                  Ativar Rendimento Residual
                </CardTitle>
                <CardDescription>
                  Utilize o lastro do seu imóvel para garantir bons inquilinos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Medidor de Capacidade */}
                <div className="p-4 bg-background rounded-xl border">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Capacidade de Garantia Residual</span>
                    <Badge variant="outline" className="text-violet-600">
                      {((totalCapacity - totalLocked) / totalCapacity * 100).toFixed(0)}% livre
                    </Badge>
                  </div>
                  <Progress value={utilizationRate} className="h-3 mb-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Usando: R$ {totalLocked.toLocaleString('pt-BR')}</span>
                    <span>Disponível: R$ {(totalCapacity - totalLocked).toLocaleString('pt-BR')}</span>
                  </div>
                </div>

                {/* Seletor de Contratos */}
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Quantos contratos você quer garantir?
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(n => (
                      <Button
                        key={n}
                        variant={contractsToGuarantee === n ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setContractsToGuarantee(n)}
                        className={cn(contractsToGuarantee === n && 'bg-violet-600')}
                      >
                        {n}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Toggle de Ativação */}
                <div className="flex items-center justify-between p-4 bg-background rounded-xl border">
                  <div>
                    <p className="font-medium">Ativar Yield Stacking</p>
                    <p className="text-xs text-muted-foreground">Seu imóvel entrará na vitrine de garantidores</p>
                  </div>
                  <Switch
                    checked={yieldStackingEnabled}
                    onCheckedChange={setYieldStackingEnabled}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Card de Projeção */}
            <Card className="bg-card text-foreground">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-emerald-400" />
                  Projeção de Rendimento Turbinado
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="p-4 bg-background/5 rounded-xl">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground text-sm">Renda como Locador (85%)</span>
                      <span className="text-xl font-bold">
                        R$ {ownPropertyLandlordShare.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <div className="p-2 bg-emerald-500/20 rounded-full">
                      <ArrowRight className="h-5 w-5 text-emerald-400" />
                    </div>
                  </div>

                  <div className="p-4 bg-emerald-500/20 rounded-xl border border-emerald-500/30">
                    <div className="flex justify-between items-center">
                      <span className="text-emerald-300 text-sm">+ Renda Extra como Garantidor</span>
                      <span className="text-xl font-bold text-emerald-400">
                        + R$ {(contractsToGuarantee * monthlyYield).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <p className="text-xs text-emerald-400/70 mt-1">
                      {contractsToGuarantee} contrato{contractsToGuarantee > 1 ? 's' : ''} × 5% = {contractsToGuarantee * 5}% extra
                    </p>
                  </div>

                  <div className="p-4 bg-gradient-to-r from-violet-500/20 to-indigo-500/20 rounded-xl border border-violet-500/30">
                    <div className="flex justify-between items-center">
                      <span className="text-violet-300 text-sm font-bold">TOTAL MENSAL</span>
                      <span className="text-2xl font-black text-foreground">
                        R$ {(ownPropertyLandlordShare + contractsToGuarantee * monthlyYield).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-background/5 rounded-lg text-center">
                    <p className="text-xs text-muted-foreground">Em 1 Ano</p>
                    <p className="font-bold text-lg">
                      R$ {((ownPropertyLandlordShare + contractsToGuarantee * monthlyYield) * 12).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                    </p>
                  </div>
                  <div className="p-3 bg-background/5 rounded-lg text-center">
                    <p className="text-xs text-muted-foreground">Em 5 Anos</p>
                    <p className="font-bold text-lg">
                      R$ {((ownPropertyLandlordShare + contractsToGuarantee * monthlyYield) * 60).toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
                    </p>
                  </div>
                </div>

                <Button
                  className="w-full bg-gradient-to-r from-violet-500 to-indigo-500 hover:from-violet-600 hover:to-indigo-600"
                  disabled={!yieldStackingEnabled}
                >
                  <Zap className="h-4 w-4 mr-2" />
                  {yieldStackingEnabled ? 'Confirmar Ativação' : 'Ative o Yield Stacking Primeiro'}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Explicação */}
          <Card>
            <CardHeader>
              <CardTitle>Como funciona o Yield Stacking?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="flex flex-col items-center text-center p-4">
                  <div className="p-4 bg-violet-100 rounded-full mb-4">
                    <Home className="h-8 w-8 text-violet-600" />
                  </div>
                  <h4 className="font-bold mb-2">1. Seu Imóvel Alugado</h4>
                  <p className="text-sm text-muted-foreground">
                    Você já recebe 85% do aluguel como locador. O imóvel tem lastro e reputação na plataforma.
                  </p>
                </div>
                <div className="flex flex-col items-center text-center p-4">
                  <div className="p-4 bg-indigo-100 rounded-full mb-4">
                    <Shield className="h-8 w-8 text-indigo-600" />
                  </div>
                  <h4 className="font-bold mb-2">2. Garantia de Terceiros</h4>
                  <p className="text-sm text-muted-foreground">
                    Use o lastro do seu imóvel (80% do valor) para garantir outros contratos de bons inquilinos.
                  </p>
                </div>
                <div className="flex flex-col items-center text-center p-4">
                  <div className="p-4 bg-emerald-100 rounded-full mb-4">
                    <TrendingUp className="h-8 w-8 text-emerald-600" />
                  </div>
                  <h4 className="font-bold mb-2">3. Rendimento Turbinado</h4>
                  <p className="text-sm text-muted-foreground">
                    Receba +5% de comissão por cada contrato garantido. Seu Cap Rate pode dobrar!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Contratos Garantidos */}
        <TabsContent value="contracts" className="space-y-6">
          {/* Ativos Sob Custódia */}
          <Card>
            <CardHeader>
              <CardTitle>Ativos Sob Custódia</CardTitle>
              <CardDescription>Imóveis registrados como garantia na blockchain</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Endereço</TableHead>
                    <TableHead>Valor de Mercado</TableHead>
                    <TableHead>Bloqueado</TableHead>
                    <TableHead>Disponível</TableHead>
                    <TableHead>Garantias</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {collateralProperties.map(property => (
                    <TableRow key={property.id}>
                      <TableCell className="font-medium">{property.address}</TableCell>
                      <TableCell>R$ {property.marketValue.toLocaleString('pt-BR')}</TableCell>
                      <TableCell>
                        <span className={property.currentlyLocked > 0 ? 'text-orange-400 font-semibold' : ''}>
                          R$ {property.currentlyLocked.toLocaleString('pt-BR')}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-emerald-400 font-semibold">
                          R$ {property.remainingCapacity.toLocaleString('pt-BR')}
                        </span>
                      </TableCell>
                      <TableCell>{property.activeGuarantees}</TableCell>
                      <TableCell>
                        <Badge variant={property.blockchainStatus === 'LOCKED_COLLATERAL' ? 'destructive' : 'default'}>
                          {property.blockchainStatus === 'LOCKED_COLLATERAL' ? 'Bloqueado' : 'Disponível'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {property.activeGuarantees > 0 && (
                          <Button size="sm" variant="outline">
                            <Unlock className="mr-1 h-4 w-4" />Desoneração
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Contratos Garantidos */}
          <Card>
            <CardHeader>
              <CardTitle>Contratos Garantidos</CardTitle>
              <CardDescription>Locatários sob sua responsabilidade</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Status</TableHead>
                    <TableHead>Contrato</TableHead>
                    <TableHead>Locatário</TableHead>
                    <TableHead>Imóvel</TableHead>
                    <TableHead>Aluguel</TableHead>
                    <TableHead>Sua Comissão (5%)</TableHead>
                    <TableHead>Fim</TableHead>
                    <TableHead>Hash</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {guaranteedContracts.map(contract => (
                    <TableRow key={contract.id}>
                      <TableCell>
                        {contract.status === 'paid' && (
                          <Badge className="bg-emerald-500">
                            <CheckCircle className="mr-1 h-3 w-3" />Em dia
                          </Badge>
                        )}
                        {contract.status === 'overdue' && (
                          <Badge variant="destructive">
                            <AlertTriangle className="mr-1 h-3 w-3" />
                            Atrasado {contract.daysOverdue}d
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-xs">{contract.id}</TableCell>
                      <TableCell className="font-medium">{contract.tenant}</TableCell>
                      <TableCell>{contract.propertyAddress}</TableCell>
                      <TableCell>R$ {contract.monthlyRent.toLocaleString('pt-BR')}</TableCell>
                      <TableCell className="text-emerald-600 font-bold">
                        R$ {(contract.monthlyRent * 0.05).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell>{contract.contractEnd.toLocaleDateString('pt-BR')}</TableCell>
                      <TableCell>
                        <code className="text-xs text-muted-foreground">{contract.transactionHash}</code>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
