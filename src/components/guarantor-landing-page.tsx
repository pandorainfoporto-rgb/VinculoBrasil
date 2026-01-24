/**
 * Vinculo Brasil - Landing Page para Garantidores
 *
 * Pagina de captacao de garantidores com calculadora de ROI.
 * Mostra beneficios, como funciona e permite simulacao de ganhos.
 */

import { useState, useMemo } from 'react';
import { Link } from '@tanstack/react-router';
import { VinculoBrasilLogo } from '@/components/vinculo-brasil-logo';
import {
  Building2,
  Shield,
  TrendingUp,
  Calculator,
  CheckCircle,
  ArrowRight,
  DollarSign,
  Home,
  Users,
  Lock,
  Percent,
  Calendar,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Eye,
  EyeOff,
  MailCheck,
  AlertCircle,
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';

// ============================================
// TYPES
// ============================================

type AuthStep = 'idle' | 'registration' | 'email_verification' | 'login';

interface RegistrationForm {
  fullName: string;
  email: string;
  phone: string;
  cpf: string;
  password: string;
}

interface LoginForm {
  email: string;
  password: string;
}

interface ROICalculation {
  propertyValue: number;
  guaranteeCapacity: number;
  contractsGuaranteed: number;
  averageRent: number;
  monthlyYield: number;
  annualYield: number;
  yieldPercentage: number;
  riskLevel: 'low' | 'medium' | 'high';
}

// ============================================
// CONSTANTS
// ============================================

const LTV_PERCENTAGE = 80;
const YIELD_PERCENTAGE = 5;
const AVERAGE_CONTRACT_DURATION_MONTHS = 12;

const BENEFITS = [
  {
    icon: TrendingUp,
    title: 'Renda Passiva',
    description: 'Ganhe 5% de cada aluguel garantido pelo seu imovel, sem esforco.',
  },
  {
    icon: Lock,
    title: 'Imovel Seguro',
    description: 'Seu imovel nao sai do seu nome. Usamos apenas como lastro digital.',
  },
  {
    icon: Shield,
    title: 'Risco Gerenciado',
    description: 'Garantimos apenas ate 80% do valor do seu imovel. Pool de risco diversificado.',
  },
  {
    icon: Building2,
    title: 'Valorizacao do Ativo',
    description: 'Seu imovel continua valorizando normalmente enquanto gera rendimento extra.',
  },
];

const HOW_IT_WORKS_STEPS = [
  {
    step: 1,
    title: 'Cadastre seu Imovel',
    description: 'Registre seu imovel na plataforma com documentacao basica (matricula, fotos).',
  },
  {
    step: 2,
    title: 'Verificacao',
    description: 'Nossa equipe valida a documentacao e aprova seu imovel em ate 48h.',
  },
  {
    step: 3,
    title: 'Ative o Yield Stacking',
    description: 'Escolha quantos contratos deseja garantir com base na capacidade do seu imovel.',
  },
  {
    step: 4,
    title: 'Receba Automaticamente',
    description: 'A cada pagamento de aluguel, voce recebe 5% direto na sua carteira.',
  },
];

const FAQ_ITEMS = [
  {
    question: 'O que acontece se o locatario nao pagar?',
    answer:
      'Primeiro, o seguro e acionado. Se a inadimplencia persistir por 3 meses, o colateral pode ser parcialmente utilizado para cobrir o debito. Por isso, garantimos apenas ate 80% do valor do imovel - para ter margem de seguranca.',
  },
  {
    question: 'Meu imovel pode ser tomado?',
    answer:
      'Nao. Seu imovel permanece 100% seu. Apenas registramos um gravame digital que pode ser utilizado em casos extremos de inadimplencia prolongada, e mesmo assim apenas proporcionalmente ao valor devido.',
  },
  {
    question: 'Posso vender ou alugar meu imovel?',
    answer:
      'Sim! Voce pode continuar alugando seu imovel normalmente. Para vender, basta encerrar os contratos garantidos (aguardando o fim natural) ou transferir a garantia para outro imovel.',
  },
  {
    question: 'Quanto tempo leva para comecar a receber?',
    answer:
      'Apos aprovacao do seu imovel (ate 48h), voce ja pode ativar o Yield Stacking. O primeiro pagamento vem no proximo ciclo de alugueis dos contratos que garantir.',
  },
  {
    question: 'Qual o rendimento real?',
    answer:
      'Voce recebe 5% de cada aluguel pago. Se garantir contratos que somam R$ 10.000/mes em alugueis, voce recebe R$ 500/mes. Isso equivale a aproximadamente 1.2% ao mes sobre o capital utilizado.',
  },
  {
    question: 'E se eu quiser parar de ser garantidor?',
    answer:
      'Voce pode desativar o Yield Stacking a qualquer momento. Contratos em andamento continuam ate o fim, mas nao sao renovados. Seu imovel fica livre apos o termino.',
  },
];

// ============================================
// HELPER FUNCTIONS
// ============================================

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function calculateROI(
  propertyValue: number,
  utilizationPercentage: number,
  averageRent: number
): ROICalculation {
  const guaranteeCapacity = (propertyValue * LTV_PERCENTAGE) / 100;
  const usedCapacity = (guaranteeCapacity * utilizationPercentage) / 100;

  // Estima quantos contratos podem ser garantidos
  // Assumindo que cada contrato precisa de ~6 meses de aluguel como garantia
  const guaranteePerContract = averageRent * 6;
  const contractsGuaranteed = Math.floor(usedCapacity / guaranteePerContract);

  // Calcula rendimento
  const monthlyYield = contractsGuaranteed * averageRent * (YIELD_PERCENTAGE / 100);
  const annualYield = monthlyYield * 12;
  const yieldPercentage = propertyValue > 0 ? (annualYield / propertyValue) * 100 : 0;

  // Determina nivel de risco
  let riskLevel: 'low' | 'medium' | 'high' = 'low';
  if (utilizationPercentage > 60) riskLevel = 'medium';
  if (utilizationPercentage > 80) riskLevel = 'high';

  return {
    propertyValue,
    guaranteeCapacity,
    contractsGuaranteed,
    averageRent,
    monthlyYield,
    annualYield,
    yieldPercentage,
    riskLevel,
  };
}

// ============================================
// COMPONENTS
// ============================================

function Navbar() {
  return (
    <nav className="absolute top-0 left-0 right-0 z-50 flex justify-between items-center px-6 md:px-12 py-6 max-w-7xl mx-auto">
      <Link to="/" className="hover:opacity-80 transition-opacity">
        <VinculoBrasilLogo size="md" />
      </Link>
      <div className="hidden md:flex items-center gap-8">
        <a href="#beneficios" className="text-sm text-white/80 hover:text-white">
          Beneficios
        </a>
        <a href="#como-funciona" className="text-sm text-white/80 hover:text-white">
          Como Funciona
        </a>
        <a href="#calculator" className="text-sm text-white/80 hover:text-white">
          Calculadora
        </a>
        <a href="#faq" className="text-sm text-white/80 hover:text-white">
          FAQ
        </a>
      </div>
      <div className="flex items-center gap-3">
        <Link to="/">
          <Button variant="outline" className="border-white text-white bg-white/10 hover:bg-white/20">
            Voltar
          </Button>
        </Link>
      </div>
    </nav>
  );
}

function HeroSection({ onCTAClick }: { onCTAClick: () => void }) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 text-white">
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid gap-12 md:grid-cols-2 items-center">
          <div className="space-y-6">
            <Badge className="bg-white/20 text-white hover:bg-white/30">
              Novo: Yield Stacking
            </Badge>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
              Seu imovel gerando{' '}
              <span className="text-yellow-300">renda extra</span> todo mes
            </h1>

            <p className="text-lg md:text-xl text-emerald-100 max-w-xl">
              Use seu imovel como garantia digital e ganhe 5% de cada aluguel que ele garantir.
              Sem alugar, sem vender, sem sair de casa.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                size="lg"
                className="bg-white text-emerald-700 hover:bg-emerald-50"
                onClick={onCTAClick}
              >
                <Calculator className="mr-2 h-5 w-5" />
                Calcular meu Rendimento
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white bg-white/10 hover:bg-white/20"
              >
                Como Funciona
                <ChevronDown className="ml-2 h-5 w-5" />
              </Button>
            </div>

            <div className="flex items-center gap-6 pt-4 text-emerald-100">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-yellow-300" />
                <span>Sem custos</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-yellow-300" />
                <span>Imovel seguro</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-yellow-300" />
                <span>Rendimento real</span>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-yellow-400/20 to-emerald-400/20 blur-3xl" />
            <Card className="relative bg-white/95 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-emerald-800 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Simulacao Rapida
                </CardTitle>
                <CardDescription>
                  Imovel de R$ 500.000 garantindo contratos
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-emerald-50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Rendimento Mensal</p>
                    <p className="text-2xl font-bold text-emerald-700">R$ 625</p>
                  </div>
                  <div className="text-center p-4 bg-emerald-50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Rendimento Anual</p>
                    <p className="text-2xl font-bold text-emerald-700">R$ 7.500</p>
                  </div>
                </div>
                <div className="text-center p-3 bg-yellow-50 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    Equivale a <strong>1.5% ao ano</strong> de rendimento extra sobre o imovel
                  </p>
                </div>
                <Button className="w-full bg-emerald-600 hover:bg-emerald-700" onClick={onCTAClick}>
                  Fazer Simulacao Completa
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}

function BenefitsSection() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Por que ser um Garantidor Vinculo?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Transforme seu imovel em uma fonte de renda passiva sem abrir mao da propriedade
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {BENEFITS.map((benefit) => (
            <Card key={benefit.title} className="border-0 shadow-md hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-emerald-100 flex items-center justify-center mb-4">
                  <benefit.icon className="h-6 w-6 text-emerald-600" />
                </div>
                <CardTitle className="text-lg">{benefit.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{benefit.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Como Funciona</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Em 4 passos simples, seu imovel comeca a gerar rendimento
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {HOW_IT_WORKS_STEPS.map((item, index) => (
            <div key={item.step} className="relative">
              {index < HOW_IT_WORKS_STEPS.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-emerald-200 -translate-x-1/2" />
              )}
              <div className="text-center space-y-4">
                <div className="relative inline-flex">
                  <div className="w-16 h-16 rounded-full bg-emerald-600 text-white flex items-center justify-center text-2xl font-bold">
                    {item.step}
                  </div>
                </div>
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

interface ROICalculatorSectionProps {
  onOpenRegistration: () => void;
}

function ROICalculatorSection({ onOpenRegistration }: ROICalculatorSectionProps) {
  const [propertyValue, setPropertyValue] = useState(500000);
  const [utilizationPercentage, setUtilizationPercentage] = useState(50);
  const [averageRent, setAverageRent] = useState(3000);
  const [propertyType, setPropertyType] = useState('apartment');

  const calculation = useMemo(
    () => calculateROI(propertyValue, utilizationPercentage, averageRent),
    [propertyValue, utilizationPercentage, averageRent]
  );

  const riskColors = {
    low: 'text-emerald-600 bg-emerald-100',
    medium: 'text-yellow-600 bg-yellow-100',
    high: 'text-red-600 bg-red-100',
  };

  const riskLabels = {
    low: 'Baixo',
    medium: 'Medio',
    high: 'Alto',
  };

  return (
    <section id="calculator" className="py-16 bg-gradient-to-b from-white to-emerald-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Badge className="mb-4 bg-emerald-100 text-emerald-700">Calculadora</Badge>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Quanto seu imovel pode render?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Simule o rendimento do Yield Stacking com base no valor do seu imovel
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="shadow-xl">
            <CardContent className="p-8">
              <div className="grid gap-8 md:grid-cols-2">
                {/* Inputs */}
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="property-type">Tipo de Imovel</Label>
                    <Select value={propertyType} onValueChange={setPropertyType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="apartment">Apartamento</SelectItem>
                        <SelectItem value="house">Casa</SelectItem>
                        <SelectItem value="commercial">Comercial</SelectItem>
                        <SelectItem value="land">Terreno</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="property-value">
                      Valor do Imovel: {formatCurrency(propertyValue)}
                    </Label>
                    <Slider
                      id="property-value"
                      min={100000}
                      max={5000000}
                      step={50000}
                      value={[propertyValue]}
                      onValueChange={([value]) => setPropertyValue(value)}
                      className="py-4"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>R$ 100.000</span>
                      <span>R$ 5.000.000</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="average-rent">
                      Aluguel Medio dos Contratos: {formatCurrency(averageRent)}
                    </Label>
                    <Slider
                      id="average-rent"
                      min={500}
                      max={20000}
                      step={100}
                      value={[averageRent]}
                      onValueChange={([value]) => setAverageRent(value)}
                      className="py-4"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>R$ 500</span>
                      <span>R$ 20.000</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="utilization">
                      Utilizacao da Capacidade: {utilizationPercentage}%
                    </Label>
                    <Slider
                      id="utilization"
                      min={10}
                      max={100}
                      step={5}
                      value={[utilizationPercentage]}
                      onValueChange={([value]) => setUtilizationPercentage(value)}
                      className="py-4"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Conservador (10%)</span>
                      <span>Maximo (100%)</span>
                    </div>
                  </div>
                </div>

                {/* Results */}
                <div className="space-y-6">
                  <div className="p-6 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl text-white">
                    <p className="text-emerald-100 text-sm">Rendimento Mensal Estimado</p>
                    <p className="text-4xl font-bold mt-1">
                      {formatCurrency(calculation.monthlyYield)}
                    </p>
                    <Separator className="my-4 bg-white/20" />
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-emerald-100">Rendimento Anual</p>
                        <p className="font-semibold">{formatCurrency(calculation.annualYield)}</p>
                      </div>
                      <div>
                        <p className="text-emerald-100">Yield sobre Imovel</p>
                        <p className="font-semibold">{calculation.yieldPercentage.toFixed(2)}% a.a.</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <Card className="bg-gray-50">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 text-muted-foreground text-sm">
                          <Lock className="h-4 w-4" />
                          Capacidade de Garantia
                        </div>
                        <p className="text-lg font-semibold mt-1">
                          {formatCurrency(calculation.guaranteeCapacity)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {LTV_PERCENTAGE}% do valor do imovel
                        </p>
                      </CardContent>
                    </Card>

                    <Card className="bg-gray-50">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 text-muted-foreground text-sm">
                          <Users className="h-4 w-4" />
                          Contratos Garantidos
                        </div>
                        <p className="text-lg font-semibold mt-1">
                          {calculation.contractsGuaranteed}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          ~6 meses de garantia cada
                        </p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-muted-foreground" />
                      <span className="text-sm">Nivel de Risco</span>
                    </div>
                    <Badge className={riskColors[calculation.riskLevel]}>
                      {riskLabels[calculation.riskLevel]}
                    </Badge>
                  </div>

                  <Button
                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                    size="lg"
                    onClick={onOpenRegistration}
                  >
                    Cadastrar meu Imovel
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

interface PlatformStats {
  totalProperties: number;
  totalValueLocked: number;
  totalYieldPaid: number;
  activeGuarantors: number;
}

const MINIMUM_PROPERTIES_FOR_STATS = 1000;

interface StatsSectionProps {
  stats: PlatformStats;
}

function StatsSection({ stats }: StatsSectionProps) {
  if (stats.totalProperties < MINIMUM_PROPERTIES_FOR_STATS) {
    return null;
  }

  const statsData = [
    { label: 'TVL (Total Value Locked)', value: formatCurrency(stats.totalValueLocked), icon: Lock },
    { label: 'Imoveis Cadastrados', value: stats.totalProperties.toLocaleString('pt-BR'), icon: Building2 },
    { label: 'Yield Pago', value: formatCurrency(stats.totalYieldPaid), icon: DollarSign },
    { label: 'Garantidores Ativos', value: stats.activeGuarantors.toLocaleString('pt-BR'), icon: Users },
  ];

  return (
    <section className="py-16 bg-gray-900 text-white">
      <div className="container mx-auto px-4">
        <div className="grid gap-8 md:grid-cols-4">
          {statsData.map((stat) => (
            <div key={stat.label} className="text-center">
              <stat.icon className="h-8 w-8 mx-auto mb-4 text-emerald-400" />
              <p className="text-3xl font-bold mb-2">{stat.value}</p>
              <p className="text-gray-400">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQSection() {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Perguntas Frequentes</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Tire suas duvidas sobre o programa de garantidores
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {FAQ_ITEMS.map((item, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="border rounded-lg px-6"
              >
                <AccordionTrigger className="text-left hover:no-underline">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}

interface CTASectionProps {
  onOpenRegistration: () => void;
}

function CTASection({ onOpenRegistration }: CTASectionProps) {
  return (
    <section className="py-16 bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Pronto para comecar a ganhar?
        </h2>
        <p className="text-lg text-emerald-100 mb-8 max-w-2xl mx-auto">
          Cadastre seu imovel agora e comece a receber rendimentos passivos todo mes.
          Processo 100% digital, sem burocracia.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            size="lg"
            className="bg-white text-emerald-700 hover:bg-emerald-50"
            onClick={onOpenRegistration}
          >
            <Home className="mr-2 h-5 w-5" />
            Cadastrar meu Imovel
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-white text-white hover:bg-white/10"
            disabled
          >
            Especialista em breve
            <ExternalLink className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </section>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export interface GuarantorLandingPageProps {
  onRegisterClick?: () => void;
}

export function GuarantorLandingPage({ onRegisterClick }: GuarantorLandingPageProps) {
  const [authStep, setAuthStep] = useState<AuthStep>('idle');
  const [showPassword, setShowPassword] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [verificationError, setVerificationError] = useState('');
  const [loginError, setLoginError] = useState('');

  const [registrationForm, setRegistrationForm] = useState<RegistrationForm>({
    fullName: '',
    email: '',
    phone: '',
    cpf: '',
    password: '',
  });

  const [loginForm, setLoginForm] = useState<LoginForm>({
    email: '',
    password: '',
  });

  const scrollToCalculator = () => {
    document.getElementById('calculator')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleOpenRegistration = () => {
    setAuthStep('registration');
  };

  const handleOpenLogin = () => {
    setLoginError('');
    setAuthStep('login');
  };

  const handleCloseAuth = () => {
    setAuthStep('idle');
    setVerificationCode('');
    setVerificationError('');
    setLoginError('');
  };

  const handleRegistrationSubmit = () => {
    if (!registrationForm.fullName || !registrationForm.email || !registrationForm.phone || !registrationForm.cpf || !registrationForm.password) {
      return;
    }
    console.log('Cadastro de garantidor:', registrationForm);
    setAuthStep('email_verification');
  };

  const handleVerifyEmail = () => {
    if (verificationCode === '123456') {
      setAuthStep('idle');
      setVerificationCode('');
      setVerificationError('');
      console.log('Email verificado com sucesso!');
    } else {
      setVerificationError('Codigo de verificacao invalido. Tente novamente.');
    }
  };

  const handleLogin = () => {
    if (!loginForm.email || !loginForm.password) {
      setLoginError('Preencha todos os campos.');
      return;
    }
    console.log('Login:', loginForm);
    setAuthStep('idle');
  };

  const handleResendCode = () => {
    console.log('Codigo reenviado para:', registrationForm.email);
    setVerificationError('');
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="relative">
        <Navbar />
        <HeroSection onCTAClick={scrollToCalculator} />
      </div>
      <BenefitsSection />
      <HowItWorksSection />
      <ROICalculatorSection onOpenRegistration={handleOpenRegistration} />
      <StatsSection stats={{
        totalProperties: 0,
        totalValueLocked: 0,
        totalYieldPaid: 0,
        activeGuarantors: 0,
      }} />
      <FAQSection />
      <CTASection onOpenRegistration={handleOpenRegistration} />

      {/* Registration Modal - Garantidor */}
      <Dialog open={authStep === 'registration'} onOpenChange={(open) => !open && handleCloseAuth()}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl">Cadastro de Garantidor</DialogTitle>
            <DialogDescription>
              Preencha seus dados para comecar a ganhar com seu imovel
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 p-4 bg-emerald-50 rounded-lg">
            <div className="flex items-start gap-3">
              <Building2 className="h-5 w-5 text-emerald-600 mt-0.5" />
              <div>
                <p className="font-medium text-emerald-900">Quero ser Garantidor</p>
                <p className="text-sm text-emerald-700">
                  Apos o cadastro e verificacao do email, voce podera cadastrar seu imovel,
                  ativar o Yield Stacking e comecar a receber rendimentos.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Nome Completo</Label>
              <Input
                id="fullName"
                placeholder="Seu nome completo"
                value={registrationForm.fullName}
                onChange={(e) => setRegistrationForm(prev => ({ ...prev, fullName: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={registrationForm.email}
                onChange={(e) => setRegistrationForm(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Celular</Label>
                <Input
                  id="phone"
                  placeholder="(11) 99999-9999"
                  value={registrationForm.phone}
                  onChange={(e) => setRegistrationForm(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cpf">CPF</Label>
                <Input
                  id="cpf"
                  placeholder="000.000.000-00"
                  value={registrationForm.cpf}
                  onChange={(e) => setRegistrationForm(prev => ({ ...prev, cpf: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Crie uma senha segura"
                  value={registrationForm.password}
                  onChange={(e) => setRegistrationForm(prev => ({ ...prev, password: e.target.value }))}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2 mt-6">
            <Button variant="outline" onClick={handleCloseAuth}>
              Cancelar
            </Button>
            <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={handleRegistrationSubmit}>
              Criar Conta
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </DialogFooter>

          <div className="text-center text-sm text-gray-500">
            Ja tem uma conta?{' '}
            <button
              className="text-emerald-600 hover:underline font-medium"
              onClick={handleOpenLogin}
            >
              Faca login
            </button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Email Verification Modal */}
      <Dialog open={authStep === 'email_verification'} onOpenChange={(open) => !open && handleCloseAuth()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
              <MailCheck className="h-8 w-8 text-emerald-600" />
            </div>
            <DialogTitle className="text-2xl text-center">Verifique seu email</DialogTitle>
            <DialogDescription className="text-center">
              Enviamos um codigo de verificacao para{' '}
              <span className="font-medium text-gray-900">
                {registrationForm.email}
              </span>
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="verificationCode">Codigo de Verificacao</Label>
              <Input
                id="verificationCode"
                placeholder="Digite o codigo de 6 digitos"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                className="text-center text-2xl tracking-widest"
                maxLength={6}
              />
              <p className="text-xs text-gray-500 text-center">
                Para teste, use o codigo: <span className="font-mono font-bold">123456</span>
              </p>
            </div>

            {verificationError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{verificationError}</AlertDescription>
              </Alert>
            )}

            <Button className="w-full bg-emerald-600 hover:bg-emerald-700" onClick={handleVerifyEmail}>
              Verificar Email
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>

            <div className="text-center">
              <button
                className="text-sm text-emerald-600 hover:underline"
                onClick={handleResendCode}
              >
                Reenviar codigo
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Login Modal */}
      <Dialog open={authStep === 'login'} onOpenChange={(open) => !open && handleCloseAuth()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl">Entrar</DialogTitle>
            <DialogDescription>
              Acesse sua conta no Vinculo Brasil
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="loginEmail">E-mail</Label>
              <Input
                id="loginEmail"
                type="email"
                placeholder="seu@email.com"
                value={loginForm.email}
                onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="loginPassword">Senha</Label>
              <div className="relative">
                <Input
                  id="loginPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Sua senha"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {loginError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{loginError}</AlertDescription>
              </Alert>
            )}

            <Button className="w-full bg-emerald-600 hover:bg-emerald-700" onClick={handleLogin}>
              Entrar
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>

            <div className="text-center text-sm text-gray-500">
              Nao tem uma conta?{' '}
              <button
                className="text-emerald-600 hover:underline font-medium"
                onClick={handleOpenRegistration}
              >
                Cadastre-se
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default GuarantorLandingPage;
