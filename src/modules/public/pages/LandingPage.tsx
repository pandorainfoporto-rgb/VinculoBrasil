import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Building2,
  Home,
  Users,
  Shield,
  Key,
  ArrowRight,
  Check,
  Zap,
  Lock,
  FileCheck,
  Menu,
  X,
  Handshake,
  TrendingUp,
  Wallet,
  BarChart3,
  Clock,
  ShieldCheck,
  Sparkles,
  Calculator,
  ChevronDown,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";

// ============================================================
// LANDING PAGE - Vínculo Brasil (Resgatada da V1)
// ============================================================

export function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-white">
      {/* Header/Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-green-200/50 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 hover:opacity-90 transition-opacity">
              <img src="/favicon.svg" alt="Vínculo Brasil" className="h-10 w-10" />
              <span className="text-xl font-bold text-blue-900">Vínculo Brasil</span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-6">
              <a href="#como-funciona" className="text-gray-700 hover:text-green-600 transition-colors font-medium">
                Como Funciona
              </a>
              <a href="#inquilinos" className="text-gray-700 hover:text-green-600 transition-colors font-medium">
                Inquilinos
              </a>
              <a href="#garantidores" className="text-gray-700 hover:text-green-600 transition-colors font-medium">
                Garantidores
              </a>
              <a href="#imobiliarias" className="text-gray-700 hover:text-green-600 transition-colors font-medium">
                Imobiliárias
              </a>
              <a href="#faq" className="text-gray-700 hover:text-green-600 transition-colors font-medium">
                FAQ
              </a>
              <Link
                to="/simulador"
                className="px-4 py-2 border border-green-300 text-green-700 rounded-lg hover:bg-green-50 transition-colors font-medium"
              >
                <Calculator className="inline-block mr-2 h-4 w-4" />
                Simular
              </Link>
              <Link
                to="/hub"
                className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 font-semibold shadow-lg transition-all"
              >
                Entrar
                <ArrowRight className="inline-block ml-2 h-4 w-4" />
              </Link>
            </nav>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-green-600"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-green-200">
              <nav className="flex flex-col gap-4">
                <a
                  href="#como-funciona"
                  className="text-gray-700 hover:text-green-600 py-2 font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Como Funciona
                </a>
                <a
                  href="#inquilinos"
                  className="text-gray-700 hover:text-green-600 py-2 font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Inquilinos
                </a>
                <a
                  href="#garantidores"
                  className="text-gray-700 hover:text-green-600 py-2 font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Garantidores
                </a>
                <a
                  href="#imobiliarias"
                  className="text-gray-700 hover:text-green-600 py-2 font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Imobiliárias
                </a>
                <a
                  href="#faq"
                  className="text-gray-700 hover:text-green-600 py-2 font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  FAQ
                </a>
                <Link
                  to="/simulador"
                  className="w-full px-4 py-2 border border-green-300 text-green-700 rounded-lg hover:bg-green-50 text-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Simular Aluguel
                </Link>
                <Link
                  to="/hub"
                  className="w-full px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg text-center font-semibold"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Entrar
                </Link>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-24 md:pt-32 pb-16 md:pb-24 bg-gradient-to-br from-green-50 via-emerald-50 to-yellow-50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            {/* Hero Text */}
            <div className="space-y-6 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 text-sm border border-green-300 bg-green-100/80 text-green-700 rounded-full">
                <Zap className="h-4 w-4 text-yellow-500" />
                Tecnologia Blockchain + PIX
              </div>

              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-blue-900 leading-tight">
                Alugue com
                <span className="text-green-600"> confiança</span>,
                <br />
                garantido por quem você conhece
              </h1>

              <p className="text-lg md:text-xl text-blue-800/70 max-w-xl">
                A primeira plataforma de locação que usa garantidores próprios e tecnologia blockchain!
                Rapidez, segurança e seu novo endereço em tempo recorde!
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <Link
                  to="/hub"
                  className="inline-flex items-center justify-center px-8 py-4 text-lg bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-lg shadow-green-200 transition-colors"
                >
                  <Key className="mr-2 h-5 w-5" />
                  Quero Alugar
                </Link>
                <Link
                  to="/hub"
                  className="inline-flex items-center justify-center px-8 py-4 text-lg border border-green-400/50 bg-white/50 text-green-700 hover:bg-green-50 rounded-lg backdrop-blur-sm transition-colors"
                >
                  <Home className="mr-2 h-5 w-5" />
                  Sou Proprietário
                </Link>
              </div>

              {/* Link B2B para Imobiliárias */}
              <div className="pt-2">
                <a
                  href="https://wa.me/5566992377502?text=Ola,%20sou%20uma%20imobiliaria%20e%20tenho%20interesse%20na%20parceria%20B2B"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium inline-flex items-center gap-1 hover:underline"
                >
                  <Building2 className="h-4 w-4" />
                  É uma Imobiliária? Seja nossa parceira
                  <ArrowRight className="h-4 w-4" />
                </a>
              </div>

              {/* Trust Badges */}
              <div className="flex flex-wrap gap-4 justify-center md:justify-start pt-4">
                <div className="flex items-center gap-2 text-sm text-blue-800 bg-white/60 border border-green-200 px-3 py-1.5 rounded-full backdrop-blur-sm">
                  <Shield className="h-4 w-4 text-green-600" />
                  <span>100% Seguro</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-blue-800 bg-white/60 border border-green-200 px-3 py-1.5 rounded-full backdrop-blur-sm">
                  <Lock className="h-4 w-4 text-green-600" />
                  <span>Contratos NFT</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-blue-800 bg-white/60 border border-green-200 px-3 py-1.5 rounded-full backdrop-blur-sm">
                  <FileCheck className="h-4 w-4 text-green-600" />
                  <span>Lei 8.245/91</span>
                </div>
              </div>
            </div>

            {/* Hero Visual - Phone Mockup */}
            <div className="relative">
              <div className="relative z-10">
                <div className="mx-auto max-w-[280px] md:max-w-[320px]">
                  <div className="bg-slate-800 rounded-[3rem] p-3 shadow-xl">
                    <div className="bg-white rounded-[2.5rem] overflow-hidden">
                      <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6">
                        <div className="flex items-center gap-2 text-white mb-4">
                          <Building2 className="h-6 w-6" />
                          <span className="font-semibold">Vínculo Brasil</span>
                        </div>
                        <p className="text-white/90 text-sm">Seu próximo lar está aqui</p>
                      </div>
                      <div className="p-4 space-y-3">
                        <div className="bg-green-50 rounded-xl p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                              <Home className="h-4 w-4 text-green-600" />
                            </div>
                            <div>
                              <p className="text-xs font-medium text-blue-900">Av. Paulista, 1000</p>
                              <p className="text-[10px] text-blue-700/60">2 quartos • Jardins</p>
                            </div>
                          </div>
                        </div>
                        <div className="bg-yellow-50 rounded-xl p-3">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center">
                              <Check className="h-4 w-4 text-yellow-600" />
                            </div>
                            <div>
                              <p className="text-xs font-medium text-blue-900">Contrato Ativo</p>
                              <p className="text-[10px] text-blue-700/60">NFT validado na blockchain</p>
                            </div>
                          </div>
                        </div>
                        <div className="bg-green-600 text-white text-center py-2 rounded-lg text-sm font-medium">
                          Ver Detalhes
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Decorative circles */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-200 rounded-full blur-3xl opacity-50" />
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-green-200 rounded-full blur-3xl opacity-50" />
            </div>
          </div>
        </div>
      </section>

      {/* Como Funciona Section */}
      <section id="como-funciona" className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-blue-900 mb-4">
              Como Funciona?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Um processo simples e transparente para todos os participantes
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                step: "1",
                icon: Home,
                title: "Encontre o Imóvel",
                description: "Busque imóveis disponíveis na nossa plataforma ou traga o seu.",
              },
              {
                step: "2",
                icon: Users,
                title: "Indique um Garantidor",
                description: "Um familiar ou amigo de confiança que será seu garantidor.",
              },
              {
                step: "3",
                icon: FileCheck,
                title: "Assine o Contrato",
                description: "Contrato digital registrado em blockchain como NFT.",
              },
              {
                step: "4",
                icon: Key,
                title: "Receba as Chaves",
                description: "Pronto! Seu novo lar está esperando por você.",
              },
            ].map((item) => (
              <div key={item.step} className="relative text-center group">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <item.icon className="h-8 w-8 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center text-blue-900 font-bold text-sm">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold text-blue-900 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Para Inquilinos Section */}
      <section id="inquilinos" className="py-16 md:py-24 bg-gradient-to-br from-green-50 to-emerald-50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-green-100 text-green-700 rounded-full mb-4">
                <Key className="h-4 w-4" />
                Para Inquilinos
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-blue-900 mb-6">
                Alugue sem burocracia, com quem você confia
              </h2>
              <div className="space-y-4">
                {[
                  { icon: Clock, text: "Aprovação em até 24 horas" },
                  { icon: ShieldCheck, text: "Sem fiador tradicional ou caução" },
                  { icon: Sparkles, text: "Cashback em VBRz a cada pagamento" },
                  { icon: FileCheck, text: "Contrato digital seguro em blockchain" },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <item.icon className="h-5 w-5 text-green-600" />
                    </div>
                    <span className="text-lg text-blue-800">{item.text}</span>
                  </div>
                ))}
              </div>
              <Link
                to="/hub"
                className="inline-flex items-center mt-8 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors"
              >
                Quero Alugar
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
            <div className="bg-white rounded-2xl p-8 shadow-xl border border-green-100">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                  <Key className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-blue-900 mb-2">Inquilino</h3>
                <p className="text-gray-600 mb-6">Seu novo lar está a poucos cliques</p>
                <div className="space-y-3 text-left">
                  <div className="flex items-center gap-2 text-green-600">
                    <Check className="h-5 w-5" />
                    <span>Sem comprovação de renda complexa</span>
                  </div>
                  <div className="flex items-center gap-2 text-green-600">
                    <Check className="h-5 w-5" />
                    <span>Pagamento via PIX ou boleto</span>
                  </div>
                  <div className="flex items-center gap-2 text-green-600">
                    <Check className="h-5 w-5" />
                    <span>Acumule pontos e ganhe cashback</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Para Garantidores Section */}
      <section id="garantidores" className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="order-2 md:order-1 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-8 shadow-xl border border-indigo-100">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                  <Handshake className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-blue-900 mb-2">Garantidor</h3>
                <p className="text-gray-600 mb-6">Ajude quem você ama e ganhe rendimentos</p>
                <div className="space-y-3 text-left">
                  <div className="flex items-center gap-2 text-indigo-600">
                    <Check className="h-5 w-5" />
                    <span>Rendimento de até 5% ao mês</span>
                  </div>
                  <div className="flex items-center gap-2 text-indigo-600">
                    <Check className="h-5 w-5" />
                    <span>Colateral protegido em pool</span>
                  </div>
                  <div className="flex items-center gap-2 text-indigo-600">
                    <Check className="h-5 w-5" />
                    <span>Transparência total via blockchain</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="order-1 md:order-2">
              <div className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-indigo-100 text-indigo-700 rounded-full mb-4">
                <Shield className="h-4 w-4" />
                Para Garantidores
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-blue-900 mb-6">
                Garanta seu familiar e ganhe rendimentos
              </h2>
              <div className="space-y-4">
                {[
                  { icon: Wallet, text: "Deposite colateral e ganhe yields" },
                  { icon: TrendingUp, text: "Rendimento passivo mensal" },
                  { icon: Shield, text: "Risco controlado e transparente" },
                  { icon: BarChart3, text: "Dashboard completo de acompanhamento" },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <item.icon className="h-5 w-5 text-indigo-600" />
                    </div>
                    <span className="text-lg text-blue-800">{item.text}</span>
                  </div>
                ))}
              </div>
              <Link
                to="/hub"
                className="inline-flex items-center mt-8 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-colors"
              >
                Quero Ser Garantidor
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Para Imobiliárias Section */}
      <section id="imobiliarias" className="py-16 md:py-24 bg-gradient-to-br from-blue-50 to-cyan-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 text-sm bg-blue-100 text-blue-700 rounded-full mb-4">
              <Building2 className="h-4 w-4" />
              Para Imobiliárias
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-blue-900 mb-4">
              Aumente sua conversão com tecnologia
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Integre sua imobiliária à plataforma Vínculo Brasil e transforme a experiência de locação
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Zap,
                title: "Aprovação Rápida",
                description: "Reduza o ciclo de fechamento de contratos de semanas para dias.",
              },
              {
                icon: Shield,
                title: "Garantia Sólida",
                description: "Pool de garantidores com colateral real, sem inadimplência.",
              },
              {
                icon: BarChart3,
                title: "Dashboard B2B",
                description: "Gestão completa de carteira, contratos e recebimentos.",
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-8 shadow-lg border border-blue-100 hover:shadow-xl transition-shadow"
              >
                <div className="w-14 h-14 mb-4 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
                  <item.icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-blue-900 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <a
              href="https://wa.me/5566992377502?text=Ola,%20sou%20uma%20imobiliaria%20e%20tenho%20interesse%20na%20parceria%20B2B"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors shadow-lg"
            >
              <Building2 className="mr-2 h-5 w-5" />
              Fale com Nosso Time Comercial
              <ArrowRight className="ml-2 h-5 w-5" />
            </a>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-16 md:py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-blue-900 mb-4">
              Perguntas Frequentes
            </h2>
            <p className="text-lg text-gray-600">
              Tire suas dúvidas sobre a plataforma
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {[
              {
                question: "O que é um garantidor na Vínculo Brasil?",
                answer:
                  "O garantidor é uma pessoa de confiança do inquilino (familiar, amigo) que deposita um colateral como garantia do contrato de aluguel. Diferente do fiador tradicional, o garantidor recebe rendimentos sobre o valor depositado.",
              },
              {
                question: "Como funciona o contrato NFT?",
                answer:
                  "O contrato de locação é registrado em blockchain como um NFT (token não-fungível), garantindo imutabilidade, transparência e validade jurídica. Isso elimina fraudes e facilita a verificação.",
              },
              {
                question: "Qual o rendimento para garantidores?",
                answer:
                  "Garantidores recebem um yield de até 5% ao mês sobre o valor depositado como colateral, enquanto o contrato estiver ativo e adimplente.",
              },
              {
                question: "Quanto tempo leva para aprovar um aluguel?",
                answer:
                  "Com a documentação em dia e um garantidor cadastrado, a aprovação pode ocorrer em até 24 horas úteis.",
              },
              {
                question: "A Vínculo Brasil está em conformidade com a Lei do Inquilinato?",
                answer:
                  "Sim! Todos os contratos seguem a Lei 8.245/91 (Lei do Inquilinato) e são juridicamente válidos em todo o território nacional.",
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="border border-gray-200 rounded-xl overflow-hidden"
              >
                <button
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                >
                  <span className="text-lg font-semibold text-blue-900">{item.question}</span>
                  <ChevronDown
                    className={`h-5 w-5 text-gray-500 transition-transform ${
                      openFaq === idx ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="px-6 pb-6">
                    <p className="text-gray-600">{item.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-r from-green-600 to-emerald-700">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Pronto para encontrar seu novo lar?
          </h2>
          <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            Junte-se a milhares de brasileiros que já alugam com confiança e segurança
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/hub"
              className="inline-flex items-center justify-center px-8 py-4 text-lg bg-white text-green-700 hover:bg-gray-100 rounded-lg font-semibold transition-colors shadow-lg"
            >
              Começar Agora
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              to="/simulador"
              className="inline-flex items-center justify-center px-8 py-4 text-lg border-2 border-white text-white hover:bg-white/10 rounded-lg font-semibold transition-colors"
            >
              <Calculator className="mr-2 h-5 w-5" />
              Simular Aluguel
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-blue-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img src="/favicon.svg" alt="Vínculo Brasil" className="h-10 w-10" />
                <span className="text-xl font-bold">Vínculo Brasil</span>
              </div>
              <p className="text-blue-200 text-sm">
                A plataforma de locação com garantidores próprios e tecnologia blockchain.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Links</h4>
              <ul className="space-y-2 text-sm text-blue-200">
                <li><a href="#como-funciona" className="hover:text-white">Como Funciona</a></li>
                <li><a href="#inquilinos" className="hover:text-white">Para Inquilinos</a></li>
                <li><a href="#garantidores" className="hover:text-white">Para Garantidores</a></li>
                <li><a href="#imobiliarias" className="hover:text-white">Para Imobiliárias</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-blue-200">
                <li><a href="#" className="hover:text-white">Termos de Uso</a></li>
                <li><a href="#" className="hover:text-white">Política de Privacidade</a></li>
                <li><a href="#" className="hover:text-white">Lei 8.245/91</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contato</h4>
              <ul className="space-y-2 text-sm text-blue-200">
                <li className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  (66) 99237-7502
                </li>
                <li className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  contato@vinculobrasil.com.br
                </li>
                <li className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Brasil
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-blue-800 mt-8 pt-8 text-center text-sm text-blue-300">
            <p>Vínculo Brasil © 2024 - Todos os direitos reservados</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
