/**
 * Pitch Deck Interativo - Vinculo.io
 * A Revolucao da Locacao Imobiliaria via Blockchain
 *
 * IMPORTANTE: Split de Pagamento 85/5/5/5
 * - 85% Locador
 * - 5% Seguradora
 * - 5% Plataforma
 * - 5% Garantidor (Comissao mensal)
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  ChevronLeft,
  ChevronRight,
  Building2,
  FileWarning,
  Scale,
  Eye,
  Zap,
  Shield,
  Link as LinkIcon,
  Users,
  Home,
  UserCheck,
  ShieldCheck,
  Smartphone,
  FileText,
  Lock,
  ArrowRightLeft,
  Camera,
  DollarSign,
  BarChart3,
  ShoppingCart,
  Globe,
  TrendingUp,
  Banknote,
  Rocket,
  Target,
  CheckCircle,
  CircleDot,
} from 'lucide-react';

interface Slide {
  id: number;
  title: string;
  subtitle?: string;
  content: React.ReactNode;
}

export function PitchDeck() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides: Slide[] = [
    // Slide 0: Capa
    {
      id: 0,
      title: 'Vinculo.io',
      subtitle: 'A Revolucao da Locacao Imobiliaria via Blockchain',
      content: (
        <div className="flex flex-col items-center justify-center space-y-8 py-12">
          <div className="p-6 bg-gradient-to-br from-blue-600 to-purple-700 rounded-2xl shadow-2xl">
            <Building2 className="h-24 w-24 text-white" />
          </div>
          <div className="text-center space-y-4">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Vinculo.io
            </h1>
            <p className="text-2xl text-muted-foreground max-w-2xl">
              Contratos de aluguel como NFTs. Garantias inteligentes.
              A seguranca de um banco com a agilidade do Airbnb.
            </p>
          </div>
          <div className="flex gap-4">
            <Badge className="text-lg px-4 py-2 bg-blue-600">Blockchain</Badge>
            <Badge className="text-lg px-4 py-2 bg-purple-600">Smart Contracts</Badge>
            <Badge className="text-lg px-4 py-2 bg-green-600">NFT</Badge>
          </div>
        </div>
      ),
    },

    // Slide 1: O Problema
    {
      id: 1,
      title: 'O Problema: "O Limbo da Locacao"',
      subtitle: 'O mercado imobiliario travado por tres grandes friccoes',
      content: (
        <div className="grid gap-6 md:grid-cols-3 py-8">
          <Card className="border-2 border-red-200 bg-red-50 dark:bg-red-950">
            <CardHeader>
              <div className="p-3 bg-red-100 dark:bg-red-900 rounded-full w-fit">
                <FileWarning className="h-8 w-8 text-red-600" />
              </div>
              <CardTitle className="text-red-700 dark:text-red-400">Burocracia Analogica</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold text-red-600">15 dias</p>
              <p className="text-muted-foreground">
                Processos que levam duas semanas para aprovacao.
                Papelada, reconhecimento de firma, cartorio...
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-orange-200 bg-orange-50 dark:bg-orange-950">
            <CardHeader>
              <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-full w-fit">
                <Scale className="h-8 w-8 text-orange-600" />
              </div>
              <CardTitle className="text-orange-700 dark:text-orange-400">Inseguranca Juridica</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold text-orange-600">Fiadores inacessiveis</p>
              <p className="text-muted-foreground">
                Garantias dificeis de executar. Caucoes que descapitalizam
                o inquilino. Risco para todos.
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-yellow-200 bg-yellow-50 dark:bg-yellow-950">
            <CardHeader>
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-full w-fit">
                <Eye className="h-8 w-8 text-yellow-600" />
              </div>
              <CardTitle className="text-yellow-700 dark:text-yellow-400">Falta de Transparencia</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold text-yellow-600">Taxas ocultas</p>
              <p className="text-muted-foreground">
                Falta de clareza sobre o estado real do imovel
                e dos pagamentos. Disputas judiciais.
              </p>
            </CardContent>
          </Card>
        </div>
      ),
    },

    // Slide 2: A Solucao
    {
      id: 2,
      title: 'A Solucao: Ecossistema Tokenizado',
      subtitle: 'Smart Contracts (NFTs) para contratos de aluguel',
      content: (
        <div className="grid gap-6 md:grid-cols-3 py-8">
          <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950">
            <CardHeader>
              <div className="p-3 bg-blue-600 rounded-full w-fit">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <CardTitle>Agilidade de Airbnb</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Experiencia de usuario fluida</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Aprovacao em minutos, nao dias</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>100% digital, zero cartorio</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
            <CardHeader>
              <div className="p-3 bg-purple-600 rounded-full w-fit">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <CardTitle>Seguranca de Blockchain</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Registro imutavel de transacoes</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Auditoria publica 24/7</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Smart contracts autoexecutaveis</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
            <CardHeader>
              <div className="p-3 bg-green-600 rounded-full w-fit">
                <LinkIcon className="h-8 w-8 text-white" />
              </div>
              <CardTitle>Garantia Liquida</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Colaterais tokenizados</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Execucao imediata se inadimplencia</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Garantidor recebe 5% mensal</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      ),
    },

    // Slide 3: Os 5 Pilares (Modelo Pentagonal)
    {
      id: 3,
      title: 'Os 5 Pilares: O Modelo Pentagonal',
      subtitle: 'Conectando todos os atores em uma rede de confianca',
      content: (
        <div className="py-8">
          <div className="grid gap-4 md:grid-cols-5">
            <Card className="text-center border-2 border-blue-500">
              <CardHeader className="pb-2">
                <div className="mx-auto p-3 bg-blue-100 dark:bg-blue-900 rounded-full w-fit">
                  <Home className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-blue-600">Locador</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Protecao total do patrimonio e recebimento garantido
                </p>
                <Badge className="mt-2 bg-blue-600">85% do aluguel</Badge>
              </CardContent>
            </Card>

            <Card className="text-center border-2 border-green-500">
              <CardHeader className="pb-2">
                <div className="mx-auto p-3 bg-green-100 dark:bg-green-900 rounded-full w-fit">
                  <Users className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-green-600">Locatario</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Aluguel sem burocracia, com score de credito justo
                </p>
                <Badge className="mt-2 bg-green-600">Experiencia fluida</Badge>
              </CardContent>
            </Card>

            <Card className="text-center border-2 border-amber-500">
              <CardHeader className="pb-2">
                <div className="mx-auto p-3 bg-amber-100 dark:bg-amber-900 rounded-full w-fit">
                  <UserCheck className="h-8 w-8 text-amber-600" />
                </div>
                <CardTitle className="text-amber-600">Garantidor</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Monetiza seu imovel parado como colateral digital
                </p>
                <Badge className="mt-2 bg-amber-600">5% de comissao</Badge>
              </CardContent>
            </Card>

            <Card className="text-center border-2 border-purple-500">
              <CardHeader className="pb-2">
                <div className="mx-auto p-3 bg-purple-100 dark:bg-purple-900 rounded-full w-fit">
                  <ShieldCheck className="h-8 w-8 text-purple-600" />
                </div>
                <CardTitle className="text-purple-600">Seguradora</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Opera com dados em tempo real, reduzindo custo
                </p>
                <Badge className="mt-2 bg-purple-600">5% do aluguel</Badge>
              </CardContent>
            </Card>

            <Card className="text-center border-2 border-rose-500">
              <CardHeader className="pb-2">
                <div className="mx-auto p-3 bg-rose-100 dark:bg-rose-900 rounded-full w-fit">
                  <Smartphone className="h-8 w-8 text-rose-600" />
                </div>
                <CardTitle className="text-rose-600">Plataforma</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  O orquestrador que garante a engrenagem 24/7
                </p>
                <Badge className="mt-2 bg-rose-600">5% do aluguel</Badge>
              </CardContent>
            </Card>
          </div>

          <div className="mt-8 p-6 bg-slate-100 dark:bg-slate-900 rounded-xl">
            <h3 className="text-xl font-bold mb-4 text-center">Split de Pagamento (85/5/5/5)</h3>
            <div className="grid grid-cols-4 gap-4 text-center">
              <div className="p-4 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <p className="text-3xl font-bold text-blue-600">85%</p>
                <p className="text-sm text-muted-foreground">Locador</p>
              </div>
              <div className="p-4 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <p className="text-3xl font-bold text-purple-600">5%</p>
                <p className="text-sm text-muted-foreground">Seguradora</p>
              </div>
              <div className="p-4 bg-rose-100 dark:bg-rose-900 rounded-lg">
                <p className="text-3xl font-bold text-rose-600">5%</p>
                <p className="text-sm text-muted-foreground">Plataforma</p>
              </div>
              <div className="p-4 bg-amber-100 dark:bg-amber-900 rounded-lg">
                <p className="text-3xl font-bold text-amber-600">5%</p>
                <p className="text-sm text-muted-foreground">Garantidor</p>
              </div>
            </div>
          </div>
        </div>
      ),
    },

    // Slide 4: Diferenciais Tecnologicos
    {
      id: 4,
      title: 'Diferenciais Tecnologicos',
      subtitle: 'The Secret Sauce',
      content: (
        <div className="grid gap-4 md:grid-cols-2 py-8">
          <Card className="border-l-4 border-l-blue-600">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3">
                <FileText className="h-6 w-6 text-blue-600" />
                <CardTitle className="text-lg">NFT de Propriedade Temporaria</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                O contrato nao e um papel, e um <strong>ativo digital unico</strong>.
                Transferivel, auditavel e imutavel na blockchain.
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-amber-600">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3">
                <Lock className="h-6 w-6 text-amber-600" />
                <CardTitle className="text-lg">Collateral Lock</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Bloqueio inteligente de ativos do garantidor.
                Ate <strong>80% do valor do imovel</strong> como garantia.
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-600">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3">
                <ArrowRightLeft className="h-6 w-6 text-green-600" />
                <CardTitle className="text-lg">Split Automatico de Pagamentos</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span>Locador</span>
                  <Badge variant="outline">85%</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Seguradora</span>
                  <Badge variant="outline">5%</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Plataforma</span>
                  <Badge variant="outline">5%</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span>Garantidor</span>
                  <Badge variant="outline">5%</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-600">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-3">
                <Camera className="h-6 w-6 text-purple-600" />
                <CardTitle className="text-lg">Vistoria Imutavel</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Fotos e videos com <strong>hash gravado na blockchain</strong>.
                Elimina disputas judiciais sobre estado do imovel.
              </p>
            </CardContent>
          </Card>
        </div>
      ),
    },

    // Slide 5: Modelo de Negocio
    {
      id: 5,
      title: 'Modelo de Negocio',
      subtitle: 'Revenue Streams escalaveis e recorrentes',
      content: (
        <div className="grid gap-6 md:grid-cols-2 py-8">
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-600 rounded-lg">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle>Taxa de Intermediacao</CardTitle>
                  <CardDescription>Receita principal</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">5%</p>
              <p className="text-muted-foreground">
                Sobre o valor mensal do aluguel. Receita recorrente e previsivel.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600 rounded-lg">
                  <LinkIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle>Taxa de Tokenizacao</CardTitle>
                  <CardDescription>Minting Fee</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-600">R$ 99-299</p>
              <p className="text-muted-foreground">
                Cobrada na criacao do contrato NFT. One-time fee.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-600 rounded-lg">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle>Analise de Dados</CardTitle>
                  <CardDescription>B2B Revenue</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-purple-600">API</p>
              <p className="text-muted-foreground">
                Inteligencia de mercado para seguradoras e investidores.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950 dark:to-yellow-950">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-600 rounded-lg">
                  <ShoppingCart className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle>Marketplace de Servicos</CardTitle>
                  <CardDescription>Comissao por indicacao</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-amber-600">10-15%</p>
              <p className="text-muted-foreground">
                Integracao com servicos de manutencao, limpeza, mudanca.
              </p>
            </CardContent>
          </Card>
        </div>
      ),
    },

    // Slide 6: Por que agora?
    {
      id: 6,
      title: 'Por que agora?',
      subtitle: 'O timing perfeito para o Vinculo.io',
      content: (
        <div className="py-8 space-y-8">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-2 border-green-500">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-green-600 rounded-full">
                    <Globe className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <CardTitle>Maior Mercado de Locacao</CardTitle>
                    <CardDescription>Brasil</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <CircleDot className="h-4 w-4 text-green-600" />
                    <span>40+ milhoes de domicilios alugados</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CircleDot className="h-4 w-4 text-green-600" />
                    <span>Mercado de R$ 200+ bilhoes/ano</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CircleDot className="h-4 w-4 text-green-600" />
                    <span>Altamente fragmentado e ineficiente</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-2 border-blue-500">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-600 rounded-full">
                    <TrendingUp className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <CardTitle>Lider em Fintech</CardTitle>
                    <CardDescription>Adocao acelerada</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <CircleDot className="h-4 w-4 text-blue-600" />
                    <span>PIX: 150+ milhoes de usuarios</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CircleDot className="h-4 w-4 text-blue-600" />
                    <span>Drex/Real Digital em desenvolvimento</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CircleDot className="h-4 w-4 text-blue-600" />
                    <span>Populacao tech-savvy e bancarizada</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="p-6 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-white text-center">
            <p className="text-2xl font-bold">
              O Vinculo.io esta posicionado exatamente no encontro dessas duas tendencias
            </p>
          </div>
        </div>
      ),
    },

    // Slide 7: Visao de Futuro
    {
      id: 7,
      title: 'A Visao de Futuro',
      subtitle: 'Criando a Liquidez Imobiliaria',
      content: (
        <div className="py-8 space-y-8">
          <div className="text-center space-y-4">
            <div className="inline-block p-4 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl">
              <Banknote className="h-16 w-16 text-white" />
            </div>
            <h2 className="text-3xl font-bold">
              Nao estamos apenas alugando casas
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Estamos criando uma <strong>nova camada financeira</strong> para o setor imobiliario
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Card className="text-center">
              <CardHeader>
                <CardTitle className="text-lg">Fase 1: Locacao</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Contratos tokenizados. Garantias inteligentes. Split automatico.
                </p>
                <Badge className="mt-2 bg-green-600">Atual</Badge>
              </CardContent>
            </Card>

            <Card className="text-center border-2 border-dashed">
              <CardHeader>
                <CardTitle className="text-lg">Fase 2: Recebiveis</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  NFT de contrato como antecipacao de recebiveis para locadores.
                </p>
                <Badge className="mt-2" variant="outline">2026</Badge>
              </CardContent>
            </Card>

            <Card className="text-center border-2 border-dashed">
              <CardHeader>
                <CardTitle className="text-lg">Fase 3: DeFi</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Contratos como garantia para emprestimos. Mercado secundario de NFTs.
                </p>
                <Badge className="mt-2" variant="outline">2027+</Badge>
              </CardContent>
            </Card>
          </div>
        </div>
      ),
    },

    // Slide 8: Resumo para Investidor
    {
      id: 8,
      title: 'Resumo para o Investidor',
      subtitle: 'A oportunidade em uma frase',
      content: (
        <div className="py-8 space-y-8">
          <div className="p-8 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl text-white">
            <blockquote className="text-2xl font-medium text-center italic">
              "Estamos substituindo contratos de papel e fiadores relutantes por
              tecnologia blockchain e garantias inteligentes. O Vinculo.io torna
              o aluguel tao simples quanto reservar um hotel, mas com a
              seguranca de um banco."
            </blockquote>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <Card className="text-center bg-blue-50 dark:bg-blue-950">
              <CardHeader>
                <Rocket className="h-12 w-12 mx-auto text-blue-600" />
                <CardTitle>Mercado Massivo</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-blue-600">R$ 200B+</p>
                <p className="text-muted-foreground">por ano em locacoes</p>
              </CardContent>
            </Card>

            <Card className="text-center bg-green-50 dark:bg-green-950">
              <CardHeader>
                <Target className="h-12 w-12 mx-auto text-green-600" />
                <CardTitle>Modelo Recorrente</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-600">5%</p>
                <p className="text-muted-foreground">de cada aluguel, todo mes</p>
              </CardContent>
            </Card>

            <Card className="text-center bg-purple-50 dark:bg-purple-950">
              <CardHeader>
                <Shield className="h-12 w-12 mx-auto text-purple-600" />
                <CardTitle>Moat Tecnologico</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-purple-600">NFT</p>
                <p className="text-muted-foreground">Contratos na blockchain</p>
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <Button size="lg" className="text-lg px-8 py-6 bg-gradient-to-r from-blue-600 to-purple-600">
              <Building2 className="h-5 w-5 mr-2" />
              Junte-se a Revolucao Imobiliaria
            </Button>
          </div>
        </div>
      ),
    },
  ];

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      {/* Header */}
      <header className="bg-white dark:bg-slate-900 border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Vinculo.io</h1>
                <p className="text-xs text-muted-foreground">Pitch Deck</p>
              </div>
            </div>
            <Badge variant="outline" className="text-base">
              {currentSlide + 1} / {slides.length}
            </Badge>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-white dark:bg-slate-900 border-b">
        <Progress value={((currentSlide + 1) / slides.length) * 100} className="h-1 rounded-none" />
      </div>

      {/* Slide Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <h2 className="text-3xl font-bold">{slides[currentSlide].title}</h2>
            {slides[currentSlide].subtitle && (
              <p className="text-xl text-muted-foreground">{slides[currentSlide].subtitle}</p>
            )}
          </div>

          <Separator className="mb-6" />

          {slides[currentSlide].content}
        </div>
      </div>

      {/* Navigation */}
      <footer className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="lg"
              onClick={prevSlide}
              disabled={currentSlide === 0}
            >
              <ChevronLeft className="h-5 w-5 mr-2" />
              Anterior
            </Button>

            <div className="flex gap-2">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentSlide
                      ? 'bg-blue-600'
                      : 'bg-slate-300 hover:bg-slate-400'
                  }`}
                />
              ))}
            </div>

            <Button
              size="lg"
              onClick={nextSlide}
              disabled={currentSlide === slides.length - 1}
            >
              Proximo
              <ChevronRight className="h-5 w-5 ml-2" />
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
}
