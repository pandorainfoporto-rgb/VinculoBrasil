/**
 * Vinculo Brasil - Tenant Landing Page
 *
 * Landing page focada em atrair inquilinos.
 * Mensagem principal: "Alugue sem fiador em 5 minutos"
 */

import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { VinculoBrasilLogo } from '@/components/vinculo-brasil-logo';
import {
  Clock,
  ShieldCheck,
  Zap,
  Home,
  ArrowRight,
  CheckCircle2,
  Users,
  Building2,
  Sparkles,
  FileText,
  Lock,
  CreditCard,
  MessageCircle,
  ChevronRight,
  Play,
  Key,
  Eye,
  EyeOff,
  AlertCircle,
  MailCheck,
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

// Tipos para cadastro
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

// ============================================
// CONSTANTS
// ============================================

const FEATURES = [
  {
    icon: Clock,
    title: 'Aprovacao Flash',
    description:
      'Nosso Score AI analisa o seu perfil em tempo real. Sem espera de dias para saber se pode morar.',
  },
  {
    icon: Home,
    title: 'Garantia sob demanda',
    description:
      'Nao tem fiador? Escolha um garantidor elite no nosso marketplace e pague uma pequena taxa mensal.',
  },
  {
    icon: ShieldCheck,
    title: 'Contrato Imutavel',
    description:
      'Tudo registrado na rede Polygon. Seguranca juridica de nivel bancario direto no seu celular.',
  },
];

const HOW_IT_WORKS = [
  {
    step: 1,
    title: 'Crie sua conta',
    description: 'Cadastre-se em menos de 2 minutos com seus dados basicos.',
    icon: Users,
  },
  {
    step: 2,
    title: 'Envie seus documentos',
    description: 'Upload seguro de RG, comprovante de renda e endereco.',
    icon: FileText,
  },
  {
    step: 3,
    title: 'Receba seu Score',
    description: 'Nossa IA analisa seu perfil e libera seu limite de aluguel.',
    icon: Sparkles,
  },
  {
    step: 4,
    title: 'Escolha um Garantidor',
    description: 'Selecione o imovel que vai garantir seu contrato.',
    icon: Building2,
  },
  {
    step: 5,
    title: 'Assine e More',
    description: 'Contrato digital com validade juridica. Chaves na mao!',
    icon: Home,
  },
];

const FAQ_ITEMS = [
  {
    question: 'Preciso ter fiador para alugar?',
    answer:
      'Nao! Nossa plataforma conecta voce a garantidores que usam seus imoveis como lastro. Voce paga apenas uma pequena taxa mensal.',
  },
  {
    question: 'Quanto tempo demora a aprovacao?',
    answer:
      'Nossa IA analisa seu perfil em tempo real. A maioria das aprovacoes acontece em menos de 5 minutos apos o envio dos documentos.',
  },
  {
    question: 'Qual o custo da garantia?',
    answer:
      'A taxa de garantia varia de R$ 80 a R$ 350 por mes, dependendo do valor do aluguel e do seu Trust Score. Quanto maior seu score, menor a taxa.',
  },
  {
    question: 'O contrato tem validade juridica?',
    answer:
      'Sim! Nossos contratos sao registrados em blockchain e possuem validade juridica conforme a Lei 14.063/2020 de assinaturas eletronicas.',
  },
  {
    question: 'E se eu atrasar o aluguel?',
    answer:
      'Temos um periodo de carencia de 48h. Apos isso, o sistema aciona automaticamente o garantidor e o seguro para cobrir o pagamento.',
  },
];


// ============================================
// COMPONENTS
// ============================================

interface NavbarProps {
  onOpenLogin: () => void;
  onOpenRegistration: () => void;
}

function Navbar({ onOpenLogin, onOpenRegistration }: NavbarProps) {
  return (
    <nav className="flex justify-between items-center px-6 md:px-12 py-6 max-w-7xl mx-auto">
      <Link to="/" className="hover:opacity-80 transition-opacity">
        <VinculoBrasilLogo size="md" />
      </Link>
      <div className="hidden md:flex items-center gap-8">
        <a href="#como-funciona" className="text-sm text-muted-foreground/70 hover:text-foreground">
          Como Funciona
        </a>
        <a href="#garantia" className="text-sm text-muted-foreground/70 hover:text-foreground">
          Garantia
        </a>
        <a href="#faq" className="text-sm text-muted-foreground/70 hover:text-foreground">
          FAQ
        </a>
      </div>
      <div className="flex items-center gap-3">
        <Button variant="ghost" className="hidden md:flex" onClick={onOpenLogin}>
          Entrar
        </Button>
        <Button className="bg-card hover:bg-indigo-600" onClick={onOpenRegistration}>
          Comecar Agora
        </Button>
      </div>
    </nav>
  );
}

interface HeroSectionProps {
  onOpenRegistration: () => void;
}

function HeroSection({ onOpenRegistration }: HeroSectionProps) {
  return (
    <header className="pt-12 pb-24 px-6 text-center max-w-5xl mx-auto space-y-8">
      {/* Badge */}
      <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full text-sm font-bold border border-emerald-100">
        <Zap size={16} className="fill-current" />
        APROVACAO EM SEGUNDOS
      </div>

      {/* Headline */}
      <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.9]">
        O fim da era <br />
        <span className="text-indigo-600">do fiador.</span>
      </h1>

      {/* Subheadline */}
      <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
        Alugue o seu proximo lar em <strong>5 minutos</strong>. Use o nosso marketplace de
        garantidores e assine o seu contrato via Blockchain. Sem papelada, sem burocracia.
      </p>

      {/* CTA */}
      <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
        <Button
          size="lg"
          className="px-10 py-6 bg-card text-foreground font-bold rounded-2xl hover:bg-indigo-600 transition-all shadow-xl shadow-indigo-100 text-lg"
          onClick={onOpenRegistration}
        >
          Comecar Agora
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
        <a href="#como-funciona">
          <Button
            size="lg"
            variant="outline"
            className="px-10 py-6 rounded-2xl text-lg flex items-center gap-2"
          >
            <Play className="h-5 w-5" />
            Ver Como Funciona
          </Button>
        </a>
      </div>

    </header>
  );
}


function FeaturesSection() {
  return (
    <section className="py-24 bg-muted border-y border-border">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-indigo-100 text-indigo-700">Vantagens</Badge>
          <h2 className="text-3xl md:text-4xl font-black text-foreground">
            Por que escolher o Vinculo?
          </h2>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
            Uma nova forma de alugar, desenhada para a sua realidade
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {FEATURES.map((feature) => (
            <Card key={feature.title} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardContent className="p-8 space-y-4">
                <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center">
                  <feature.icon className="h-7 w-7 text-indigo-600" />
                </div>
                <h3 className="font-bold text-xl">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
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
    <section id="como-funciona" className="py-24">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-emerald-100 text-emerald-700">Passo a Passo</Badge>
          <h2 className="text-3xl md:text-4xl font-black text-foreground">
            Alugue em 5 passos simples
          </h2>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">
            Do cadastro as chaves na mao, tudo pelo seu celular
          </p>
        </div>

        <div className="relative">
          {/* Timeline Line */}
          <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-muted -translate-x-1/2" />

          <div className="space-y-12 md:space-y-0">
            {HOW_IT_WORKS.map((item, index) => (
              <div
                key={item.step}
                className={`flex flex-col md:flex-row items-center gap-8 ${
                  index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                }`}
              >
                <div className={`flex-1 ${index % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                  <Card className="inline-block border-0 shadow-lg">
                    <CardContent className="p-6">
                      <div
                        className={`flex items-center gap-3 ${
                          index % 2 === 0 ? 'md:flex-row-reverse' : ''
                        }`}
                      >
                        <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center flex-shrink-0">
                          <item.icon className="h-6 w-6 text-indigo-600" />
                        </div>
                        <div className={index % 2 === 0 ? 'md:text-right' : ''}>
                          <h3 className="font-bold text-lg">{item.title}</h3>
                          <p className="text-muted-foreground text-sm mt-1">{item.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Step Number */}
                <div className="relative z-10 w-12 h-12 bg-indigo-600 text-foreground rounded-full flex items-center justify-center font-bold text-lg shadow-lg shadow-indigo-200">
                  {item.step}
                </div>

                <div className="flex-1" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

interface GuaranteeSectionProps {
  onOpenRegistration: () => void;
}

function GuaranteeSection({ onOpenRegistration }: GuaranteeSectionProps) {
  return (
    <section id="garantia" className="py-24 bg-gradient-to-br from-indigo-600 to-indigo-800 text-foreground">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <Badge className="bg-white/20 text-foreground hover:bg-white/30">
              <Lock className="h-3 w-3 mr-1" />
              Garantia Inteligente
            </Badge>
            <h2 className="text-3xl md:text-4xl font-black leading-tight">
              Seu contrato protegido por Blockchain
            </h2>
            <p className="text-indigo-100 text-lg leading-relaxed">
              Nosso sistema conecta voce a proprietarios de imoveis que usam o patrimonio como
              lastro de garantia. E o fim do fiador tradicional.
            </p>

            <ul className="space-y-4">
              {[
                'Garantidores verificados com Trust Score',
                'Split automatico 85/5/5/5 a cada pagamento',
                'Contrato NFT com validade juridica',
                'Seguro inadimplencia incluso',
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <Button size="lg" className="bg-white text-indigo-700 hover:bg-indigo-50 mt-4" onClick={onOpenRegistration}>
              Ver Garantidores Disponiveis
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </div>

          <div className="relative">
            <Card className="bg-white/10 backdrop-blur border-white/20">
              <CardContent className="p-8 space-y-6">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-indigo-200 text-sm">Taxa de Garantia</p>
                    <p className="text-3xl font-black">A partir de R$ 80/mes</p>
                  </div>
                  <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
                    <CreditCard className="h-8 w-8" />
                  </div>
                </div>

                <Separator className="bg-white/20" />

                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-indigo-200">Locador</span>
                    <span className="font-bold">85%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-indigo-200">Garantidor</span>
                    <span className="font-bold">5%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-indigo-200">Seguro</span>
                    <span className="font-bold">5%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-indigo-200">Plataforma</span>
                    <span className="font-bold">5%</span>
                  </div>
                </div>

                <div className="p-4 bg-emerald-500/20 rounded-xl">
                  <p className="text-sm text-center">
                    <Zap className="h-4 w-4 inline mr-1" />
                    Split automatico via Smart Contract
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}

function FAQSection() {
  return (
    <section id="faq" className="py-24 bg-muted">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-16">
          <Badge className="mb-4 bg-muted text-muted-foreground">FAQ</Badge>
          <h2 className="text-3xl md:text-4xl font-black text-foreground">Perguntas Frequentes</h2>
        </div>

        <Accordion type="single" collapsible className="space-y-4">
          {FAQ_ITEMS.map((item, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="bg-white border rounded-xl px-6 shadow-sm"
            >
              <AccordionTrigger className="text-left hover:no-underline font-medium">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{item.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="text-center mt-12">
          <p className="text-muted-foreground mb-4">Ainda tem duvidas?</p>
          <Button variant="outline" className="gap-2" disabled>
            <MessageCircle className="h-4 w-4" />
            Suporte em breve
          </Button>
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
    <section className="py-24 bg-card text-foreground text-center">
      <div className="max-w-4xl mx-auto px-6 space-y-8">
        <h2 className="text-3xl md:text-5xl font-black leading-tight">
          Pronto para alugar sem fiador?
        </h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Crie sua conta agora e receba seu Trust Score em menos de 5 minutos.
        </p>
        <Button
          size="lg"
          className="px-12 py-6 bg-indigo-600 hover:bg-indigo-500 text-lg font-bold rounded-2xl shadow-lg shadow-indigo-500/20"
          onClick={onOpenRegistration}
        >
          COMECAR AGORA - E GRATIS
          <ArrowRight className="ml-2 h-5 w-5" />
        </Button>
        <p className="text-muted-foreground text-sm">
          Powered by Polygon Network | Smart Contracts Auditados
        </p>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="py-12 border-t">
      <div className="max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-2xl font-black tracking-tighter italic text-indigo-600">
            Vinculo Brasil
          </div>
          <div className="flex gap-8 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground">
              Termos de Uso
            </a>
            <a href="#" className="hover:text-foreground">
              Privacidade
            </a>
            <a href="#" className="hover:text-foreground">
              Contato
            </a>
          </div>
          <p className="text-sm text-muted-foreground">
            2024 Vinculo Brasil - Todos os direitos reservados
          </p>
        </div>
      </div>
    </footer>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export function TenantLandingPage() {
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
    console.log('Cadastro de inquilino:', registrationForm);
    setAuthStep('email_verification');
  };

  const handleVerifyEmail = () => {
    if (verificationCode === '123456') {
      setAuthStep('idle');
      setVerificationCode('');
      setVerificationError('');
      // Em produção, redirecionaria para o app
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
    // Em produção, validaria com API
    setAuthStep('idle');
  };

  const handleResendCode = () => {
    console.log('Codigo reenviado para:', registrationForm.email);
    setVerificationError('');
  };

  return (
    <div className="min-h-screen bg-white text-foreground selection:bg-indigo-100">
      <Navbar onOpenLogin={handleOpenLogin} onOpenRegistration={handleOpenRegistration} />
      <HeroSection onOpenRegistration={handleOpenRegistration} />
      <FeaturesSection />
      <HowItWorksSection />
      <GuaranteeSection onOpenRegistration={handleOpenRegistration} />
      <FAQSection />
      <CTASection onOpenRegistration={handleOpenRegistration} />
      <Footer />

      {/* Registration Modal - Inquilino */}
      <Dialog open={authStep === 'registration'} onOpenChange={(open) => !open && handleCloseAuth()}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-2xl">Cadastro de Inquilino</DialogTitle>
            <DialogDescription>
              Preencha seus dados para comecar a alugar com o Vinculo Brasil
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 p-4 bg-indigo-50 rounded-lg">
            <div className="flex items-start gap-3">
              <Key className="h-5 w-5 text-indigo-600 mt-0.5" />
              <div>
                <p className="font-medium text-indigo-900">Quero Alugar</p>
                <p className="text-sm text-indigo-700">
                  Apos o cadastro e verificacao do email, voce podera buscar imoveis,
                  ver valores e escolher seu garantidor.
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
            <Button onClick={handleRegistrationSubmit}>
              Criar Conta
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </DialogFooter>

          <div className="text-center text-sm text-gray-500">
            Ja tem uma conta?{' '}
            <button
              className="text-indigo-600 hover:underline font-medium"
              onClick={() => setAuthStep('login')}
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
            <div className="mx-auto w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mb-4">
              <MailCheck className="h-8 w-8 text-indigo-600" />
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

            <Button className="w-full" onClick={handleVerifyEmail}>
              Verificar Email
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>

            <div className="text-center">
              <button
                className="text-sm text-indigo-600 hover:underline"
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

            <Button className="w-full" onClick={handleLogin}>
              Entrar
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>

            <div className="text-center text-sm text-gray-500">
              Nao tem uma conta?{' '}
              <button
                className="text-indigo-600 hover:underline font-medium"
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

export default TenantLandingPage;
