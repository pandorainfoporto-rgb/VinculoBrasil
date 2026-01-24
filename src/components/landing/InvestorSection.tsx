// ============================================
// INVESTOR SECTION - Landing Page
// Seção para atrair investidores
// ============================================

import { TrendingUp, ShieldCheck, DollarSign, ArrowRight, Wallet, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export function InvestorSection() {
  const handleInvestorSignup = () => {
    window.location.href = '/register?type=investor';
  };

  return (
    <section className="py-20 bg-gray-900 text-white overflow-hidden relative">
      {/* Elementos de Fundo Decorativos */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Texto de Venda */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-900/50 border border-blue-700 text-blue-300 text-sm font-semibold">
              <TrendingUp size={16} /> Nova Modalidade de Investimento
            </div>

            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
              Faça o Mercado Imobiliário{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-green-400">
                Pagar Você Todo Mês.
              </span>
            </h2>

            <p className="text-gray-400 text-lg leading-relaxed">
              Compre frações de aluguéis reais e receba dividendos mensais na sua conta.
              Sem comprar tijolo, sem obra, sem dor de cabeça.
            </p>

            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-green-500/20 rounded-lg text-green-400 flex-shrink-0">
                  <DollarSign className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-white">Renda Recorrente</h4>
                  <p className="text-sm text-gray-400">Aluguéis caem na sua conta todo dia 05.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400 flex-shrink-0">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-white">Segurança Jurídica</h4>
                  <p className="text-sm text-gray-400">Contratos com Seguro Fiança e lastro em Blockchain.</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-2 bg-purple-500/20 rounded-lg text-purple-400 flex-shrink-0">
                  <Wallet className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-white">Liquidez Garantida</h4>
                  <p className="text-sm text-gray-400">Compre e venda seus ativos no marketplace P2P.</p>
                </div>
              </div>
            </div>

            <Button
              onClick={handleInvestorSignup}
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-6 px-8 rounded-xl shadow-lg shadow-blue-900/50 transition-all transform hover:scale-105"
            >
              Começar a Investir <ArrowRight className="ml-2" />
            </Button>

            <p className="text-xs text-gray-500">
              * Rentabilidade passada não garante resultados futuros. Leia os termos antes de investir.
            </p>
          </div>

          {/* Card Flutuante - Dashboard Preview */}
          <div className="relative">
            <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl transform rotate-2 hover:rotate-0 transition-all duration-500">
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <p className="text-sm text-gray-300">Seu Saldo Vínculo</p>
                    <h3 className="text-3xl font-bold text-white">R$ 14.250,00</h3>
                  </div>
                  <div className="bg-green-500 text-black text-xs font-bold px-2 py-1 rounded">
                    +14.2% a.a.
                  </div>
                </div>

                <div className="space-y-3">
                  {/* Recebimento 1 */}
                  <div className="bg-white/5 p-3 rounded-lg flex justify-between items-center hover:bg-white/10 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-xl">
                        🏢
                      </div>
                      <div>
                        <p className="font-bold text-sm text-white">Apt. Jardins #88</p>
                        <p className="text-xs text-gray-400">Recebido hoje</p>
                      </div>
                    </div>
                    <span className="text-green-400 font-mono font-bold">+ R$ 1.100</span>
                  </div>

                  {/* Recebimento 2 */}
                  <div className="bg-white/5 p-3 rounded-lg flex justify-between items-center hover:bg-white/10 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-xl">
                        🏭
                      </div>
                      <div>
                        <p className="font-bold text-sm text-white">Galpão Logístico</p>
                        <p className="text-xs text-gray-400">Recebido hoje</p>
                      </div>
                    </div>
                    <span className="text-green-400 font-mono font-bold">+ R$ 2.450</span>
                  </div>

                  {/* Recebimento 3 */}
                  <div className="bg-white/5 p-3 rounded-lg flex justify-between items-center hover:bg-white/10 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-xl">
                        🏘️
                      </div>
                      <div>
                        <p className="font-bold text-sm text-white">Casa Condomínio</p>
                        <p className="text-xs text-gray-400">Amanhã</p>
                      </div>
                    </div>
                    <span className="text-gray-400 font-mono">R$ 1.850</span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-white/10 flex justify-between items-center">
                  <span className="text-sm text-gray-400">Total esperado (mês)</span>
                  <span className="text-lg font-bold text-white">R$ 5.400</span>
                </div>
              </CardContent>
            </Card>

            {/* Badge Flutuante */}
            <div className="absolute -top-4 -right-4 bg-gradient-to-r from-green-500 to-green-600 text-white px-4 py-2 rounded-full shadow-lg animate-bounce">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                <span className="text-sm font-bold">142 imóveis disponíveis</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
