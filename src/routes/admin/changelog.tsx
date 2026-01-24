// ============================================
// ADMIN CHANGELOG - Historico de Atualizacoes
// Timeline Visual do Sistema
// ============================================

import { createFileRoute } from '@tanstack/react-router';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import {
  FileText,
  Plus,
  Zap,
  Bug,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Rocket,
  Star,
  Shield,
  BarChart3,
  Headphones,
  BookOpen,
} from 'lucide-react';

export const Route = createFileRoute('/admin/changelog')({
  component: ChangelogPage,
});

// Dados do changelog - Timeline completa do sistema
const changelog = [
  {
    version: '2.0.0',
    date: '24 Janeiro 2026',
    type: 'major',
    title: 'Relatorios, KPIs e Institucional (LOTE 4)',
    description: 'Finalizacao do sistema com paineis de analytics, paginas institucionais e canal de suporte.',
    changes: [
      {
        category: 'added',
        items: [
          'Dashboard Analytics com graficos visuais de Ocupacao, Inadimplencia e Fluxo de Caixa',
          'Modelo DRE (Demonstrativo do Resultado do Exercicio)',
          'Pagina Sobre o Sistema com informacoes legais e termos de uso',
          'Timeline visual do Changelog com historico de versoes',
          'Canal de Suporte Tecnico Oficial da Fatto Tecnologia',
          'Integracao com WhatsApp para suporte',
        ],
      },
      {
        category: 'changed',
        items: [
          'Pagina About redesenhada com informacoes da desenvolvedora',
          'Layout do Changelog em formato timeline',
          'KPIs com conexao a dados reais da API',
        ],
      },
    ],
  },
  {
    version: '1.3.0',
    date: '23 Janeiro 2026',
    type: 'minor',
    title: 'Conexao com Dados Reais (LOTE 3)',
    description: 'Remocao de todos os mocks e conexao com banco de dados e blockchain.',
    changes: [
      {
        category: 'added',
        items: [
          'Hook useAgencyProperties para gestao de imoveis',
          'Hook useAgencyContracts para contratos',
          'Hook useAgencyCampaigns para campanhas de anuncios',
          'Hook useCashbackStats para estatisticas do VBRz',
          'Hook useOmnichannelMetrics para metricas de atendimento',
          'Integracao ethers.js para leitura de dados da blockchain',
          'Empty states amigaveis em todas as telas',
          'Loading skeletons com animate-pulse',
        ],
      },
      {
        category: 'changed',
        items: [
          'Todas as telas conectadas a dados reais',
          'Marcacao "CONECTADO A DADOS REAIS - ZERO MOCKS" em todos os arquivos',
          'Fallback para mocks apenas em ambiente de desenvolvimento',
        ],
      },
    ],
  },
  {
    version: '1.2.0',
    date: '22 Janeiro 2026',
    type: 'minor',
    title: 'Logica de Negocios e Fluxos (LOTE 2)',
    description: 'Implementacao das regras de negocio, fluxos DeFi e reestruturacao de usuarios.',
    changes: [
      {
        category: 'added',
        items: [
          'Regras de Vistoria (pre e pos locacao)',
          'Fluxo DeFi completo com investimentos e antecipacao',
          'Reestruturacao de usuarios: Inquilino, Proprietario, Garantidor, Imobiliaria',
          'Logica de Cashback Wallet separada da Treasury',
          'Pagina de Perfil e Contato',
          'Suporte a cargos hierarquicos',
        ],
      },
      {
        category: 'changed',
        items: [
          'Hierarquia de usuarios atualizada',
          'Split de pagamentos 85/5/5/5 implementado',
          'Tokens VBRz vinculados a operacoes reais',
        ],
      },
    ],
  },
  {
    version: '1.1.0',
    date: '20 Janeiro 2026',
    type: 'minor',
    title: 'Correcoes Visuais (LOTE 1)',
    description: 'Melhorias de interface, modo dark e reorganizacao do menu.',
    changes: [
      {
        category: 'added',
        items: [
          'Menu lateral colapsavel com tooltip',
          'Abas horizontais para organizacao',
          'Modo Dark em todas as telas',
          'Suporte a Dashboards Consultivas',
          'Logo Vinculo Brasil no header',
        ],
      },
      {
        category: 'changed',
        items: [
          'Reorganizacao do menu: Analytics na raiz',
          'Investimentos DeFi agrupados em secao unica',
          'Branding atualizado para Vinculo Brasil',
          'Cores padronizadas (zinc/dark theme)',
        ],
      },
      {
        category: 'fixed',
        items: [
          'Correcao do tema Dark em Integracoes API',
          'Correcao do tema Dark em Omnichannel',
          'Remocao de itens duplicados no menu',
          'Contraste de texto em cards',
        ],
      },
    ],
  },
  {
    version: '1.0.1',
    date: '01 Dezembro 2025',
    type: 'patch',
    title: 'VBRz Token e Carteiras',
    description: 'Lancamento do sistema de tokens e gestao de carteiras.',
    changes: [
      {
        category: 'added',
        items: [
          'VBRz Token Admin com Command Center',
          'Balcao OTC para vendas diretas',
          'Gestao de Carteiras do Ecossistema',
          'Integracao com MetaMask',
          'Grafico de Vesting da Treasury',
        ],
      },
    ],
  },
  {
    version: '1.0.0',
    date: '01 Outubro 2025',
    type: 'major',
    title: 'Lancamento Oficial',
    description: 'Primeira versao do sistema Vinculo Brasil em producao.',
    changes: [
      {
        category: 'added',
        items: [
          'Dashboard Administrativa',
          'Gestao de Contratos NFT',
          'Gestao de Imoveis',
          'Gestao de Locatarios',
          'Gestao de Proprietarios',
          'Gestao de Garantidores',
          'Split automatico 85/5/5/5',
          'Integracao blockchain Polygon',
          'Vistoria digital com hash IPFS',
          'Mediacao de disputas multi-sig',
          'Sistema de permissoes RBAC',
        ],
      },
    ],
  },
];

const categoryConfig = {
  added: {
    label: 'Adicionado',
    icon: Plus,
    color: 'bg-green-500/20 text-green-400 border-green-500/30',
    iconColor: 'text-green-500',
  },
  changed: {
    label: 'Alterado',
    icon: Zap,
    color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    iconColor: 'text-blue-500',
  },
  fixed: {
    label: 'Corrigido',
    icon: Bug,
    color: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    iconColor: 'text-amber-500',
  },
  deprecated: {
    label: 'Descontinuado',
    icon: AlertTriangle,
    color: 'bg-red-500/20 text-red-400 border-red-500/30',
    iconColor: 'text-red-500',
  },
};

const typeConfig = {
  major: { label: 'Major', color: 'bg-purple-600', icon: Rocket },
  minor: { label: 'Minor', color: 'bg-blue-600', icon: Star },
  patch: { label: 'Patch', color: 'bg-zinc-600', icon: Shield },
};

function ChangelogPage() {
  return (
    <AdminLayout userName="Administrador">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <FileText className="h-6 w-6 text-purple-500" />
              Changelog
            </h1>
            <p className="text-zinc-400 mt-1">
              Historico de atualizacoes e melhorias do sistema
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className="bg-purple-600 text-white text-lg px-3 py-1">
              v{changelog[0].version}
            </Badge>
          </div>
        </div>

        {/* Resumo das Versoes */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-purple-900/20 border-purple-800">
            <CardContent className="p-4 flex items-center gap-3">
              <Rocket className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold text-white">
                  {changelog.filter((c) => c.type === 'major').length}
                </p>
                <p className="text-xs text-zinc-400">Versoes Major</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-blue-900/20 border-blue-800">
            <CardContent className="p-4 flex items-center gap-3">
              <Star className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold text-white">
                  {changelog.filter((c) => c.type === 'minor').length}
                </p>
                <p className="text-xs text-zinc-400">Versoes Minor</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-zinc-800 border-zinc-700">
            <CardContent className="p-4 flex items-center gap-3">
              <Shield className="h-8 w-8 text-zinc-500" />
              <div>
                <p className="text-2xl font-bold text-white">
                  {changelog.filter((c) => c.type === 'patch').length}
                </p>
                <p className="text-xs text-zinc-400">Patches</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-green-900/20 border-green-800">
            <CardContent className="p-4 flex items-center gap-3">
              <CheckCircle2 className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold text-white">
                  {changelog.reduce(
                    (acc, c) =>
                      acc +
                      c.changes.reduce(
                        (sum, ch) => sum + ch.items.length,
                        0
                      ),
                    0
                  )}
                </p>
                <p className="text-xs text-zinc-400">Total de Mudancas</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Linha vertical */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-purple-600 via-blue-600 to-zinc-700" />

          <div className="space-y-6">
            {changelog.map((release, index) => {
              const typeInfo = typeConfig[release.type as keyof typeof typeConfig];
              const TypeIcon = typeInfo?.icon || Star;
              const isLatest = index === 0;

              return (
                <div key={release.version} className="relative pl-14">
                  {/* Marcador do timeline */}
                  <div
                    className={`absolute left-4 -translate-x-1/2 w-5 h-5 rounded-full z-10 flex items-center justify-center ${
                      isLatest
                        ? 'bg-purple-600 ring-4 ring-purple-600/30'
                        : 'bg-zinc-900 border-2 border-zinc-600'
                    }`}
                  >
                    {isLatest && <span className="w-2 h-2 bg-white rounded-full animate-pulse" />}
                  </div>

                  <Card className={`bg-zinc-900 border-zinc-800 ${isLatest ? 'ring-1 ring-purple-600/50' : ''}`}>
                    <CardHeader className="pb-3">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${typeInfo?.color}`}>
                            <TypeIcon className="h-4 w-4 text-white" />
                          </div>
                          <div>
                            <CardTitle className="text-white text-lg flex items-center gap-2">
                              {release.title}
                              {isLatest && (
                                <Badge className="bg-green-600 text-xs">Atual</Badge>
                              )}
                            </CardTitle>
                            <CardDescription className="text-zinc-500 text-sm mt-0.5">
                              {release.description}
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={typeInfo?.color}>v{release.version}</Badge>
                          <div className="flex items-center gap-1 text-zinc-500 text-sm">
                            <Calendar className="h-4 w-4" />
                            {release.date}
                          </div>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="pt-0">
                      <div className="space-y-4">
                        {release.changes.map((change, changeIndex) => {
                          const config =
                            categoryConfig[change.category as keyof typeof categoryConfig];
                          const ChangeIcon = config?.icon || CheckCircle2;

                          return (
                            <div key={changeIndex}>
                              <div className="flex items-center gap-2 mb-2">
                                <Badge variant="outline" className={config?.color}>
                                  <ChangeIcon className="h-3 w-3 mr-1" />
                                  {config?.label}
                                </Badge>
                                <span className="text-zinc-600 text-xs">
                                  {change.items.length} item{change.items.length > 1 ? 's' : ''}
                                </span>
                              </div>
                              <ul className="space-y-1.5 ml-4">
                                {change.items.map((item, itemIndex) => (
                                  <li
                                    key={itemIndex}
                                    className="text-zinc-400 text-sm flex items-start gap-2"
                                  >
                                    <CheckCircle2
                                      className={`h-4 w-4 mt-0.5 flex-shrink-0 ${config?.iconColor}`}
                                    />
                                    <span>{item}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>
        </div>

        {/* Roadmap Preview */}
        <Card className="bg-zinc-900 border-zinc-800 border-dashed">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Rocket className="h-5 w-5 text-purple-500" />
              Proximas Atualizacoes (Roadmap)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-zinc-800 rounded-lg border border-zinc-700">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="border-purple-600 text-purple-400">
                    v2.1.0
                  </Badge>
                  <span className="text-xs text-zinc-500">Q1 2026</span>
                </div>
                <p className="text-sm text-zinc-400">
                  App Mobile nativo com Capacitor para iOS e Android
                </p>
              </div>
              <div className="p-4 bg-zinc-800 rounded-lg border border-zinc-700">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="border-blue-600 text-blue-400">
                    v2.2.0
                  </Badge>
                  <span className="text-xs text-zinc-500">Q2 2026</span>
                </div>
                <p className="text-sm text-zinc-400">
                  Integracao com Pix via Open Finance e boletos hibridos
                </p>
              </div>
              <div className="p-4 bg-zinc-800 rounded-lg border border-zinc-700">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="border-green-600 text-green-400">
                    v3.0.0
                  </Badge>
                  <span className="text-xs text-zinc-500">Q3 2026</span>
                </div>
                <p className="text-sm text-zinc-400">
                  Marketplace DeFi publico e staking de VBRz Token
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <Separator className="bg-zinc-800" />
        <div className="text-center text-zinc-500 text-sm">
          <p>© 2025-2026 Vinculo Brasil. Todos os direitos reservados.</p>
          <p className="text-xs mt-1">
            Desenvolvido por FATTO Tecnologia LTDA
          </p>
        </div>
      </div>
    </AdminLayout>
  );
}

export default ChangelogPage;
