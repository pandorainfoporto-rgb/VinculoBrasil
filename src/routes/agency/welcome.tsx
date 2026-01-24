import { createFileRoute } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2, MessageCircle, LogIn, ArrowRight, Shield, Zap, Users } from 'lucide-react'

export const Route = createFileRoute('/agency/welcome')({
  component: AgencyWelcomePage,
})

function AgencyWelcomePage() {
  const whatsappLink = "https://wa.me/5566992377502?text=Ola,%20sou%20uma%20imobiliaria%20e%20quero%20conhecer%20a%20Vinculo"

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-xl text-slate-900">Vínculo Brasil</h1>
              <p className="text-xs text-slate-500">Plataforma para Imobiliárias</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Shield className="h-4 w-4" />
              Área do Parceiro
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Área do Parceiro Vínculo
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Transforme sua imobiliária com tecnologia de ponta.
              Ganhe seu site próprio, gestão digital e acesso ao marketplace.
            </p>
          </div>

          {/* Two Options Cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {/* Already Partner */}
            <Card className="border-2 hover:border-blue-300 transition-all hover:shadow-lg">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <LogIn className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-2xl">Já sou Parceiro</CardTitle>
                <CardDescription className="text-base">
                  Acesse sua conta e gerencie sua imobiliária
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button
                  size="lg"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-6"
                  onClick={() => window.location.href = '/login'}
                >
                  <LogIn className="mr-2 h-5 w-5" />
                  Acessar Minha Conta
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <p className="text-center text-sm text-slate-500 mt-4">
                  Use seu email e senha cadastrados
                </p>
              </CardContent>
            </Card>

            {/* Want to be Partner */}
            <Card className="border-2 border-green-200 hover:border-green-400 transition-all hover:shadow-lg bg-gradient-to-br from-white to-green-50">
              <CardHeader className="text-center pb-4">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-2xl">Quero ser Parceiro</CardTitle>
                <CardDescription className="text-base">
                  Converse com nosso time de expansão
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button
                  size="lg"
                  className="w-full bg-green-600 hover:bg-green-700 text-lg py-6"
                  onClick={() => window.open(whatsappLink, '_blank')}
                >
                  <MessageCircle className="mr-2 h-5 w-5" />
                  Falar no WhatsApp
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <p className="text-center text-sm text-slate-500 mt-4">
                  Fale com nosso time de expansão
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Benefits Section */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border">
            <h3 className="text-2xl font-bold text-center text-slate-900 mb-8">
              Por que ser parceiro Vínculo?
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-6 w-6 text-blue-600" />
                </div>
                <h4 className="font-semibold text-slate-900 mb-2">Site Próprio Grátis</h4>
                <p className="text-sm text-slate-600">
                  Seu site personalizado com sua marca, cores e logo. Pronto em minutos.
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Shield className="h-6 w-6 text-green-600" />
                </div>
                <h4 className="font-semibold text-slate-900 mb-2">Contratos Digitais</h4>
                <p className="text-sm text-slate-600">
                  Tokenização de contratos com segurança blockchain. Pagamentos automatizados.
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Users className="h-6 w-6 text-purple-600" />
                </div>
                <h4 className="font-semibold text-slate-900 mb-2">Marketplace Nacional</h4>
                <p className="text-sm text-slate-600">
                  Seus imóveis visíveis para milhares de inquilinos em todo o Brasil.
                </p>
              </div>
            </div>
          </div>

          {/* Footer CTA */}
          <div className="text-center mt-12">
            <p className="text-slate-500 mb-4">
              Dúvidas? Entre em contato conosco
            </p>
            <Button
              variant="outline"
              size="lg"
              onClick={() => window.open(whatsappLink, '_blank')}
              className="border-green-300 text-green-700 hover:bg-green-50"
            >
              <MessageCircle className="mr-2 h-5 w-5" />
              WhatsApp: (66) 99237-7502
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white py-6 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-slate-500">
            © 2024 Vínculo Brasil. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  )
}
