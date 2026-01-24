/**
 * Documentacao do Sistema Vinculo.io
 * Pagina completa com Changelog, Wiki e Sobre
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Download,
  FileText,
  Book,
  Info,
  History,
  Search,
  ExternalLink,
  CheckCircle,
  Star,
  Zap,
  Shield,
  Wallet,
  Users,
  Building2,
  FileSignature,
  Bot,
  BarChart3,
  Settings,
  Coins,
  Gift,
  Globe,
  Smartphone,
  Lock,
  Database,
  Code,
  Rocket,
  Target,
  Heart,
  Award,
  TrendingUp,
  ChevronRight,
  Calendar,
  Tag,
  AlertCircle,
  Lightbulb,
  HelpCircle,
} from 'lucide-react';
import { VinculoBrasilLogo } from '@/components/vinculo-brasil-logo';

// ============= TIPOS =============

interface ChangelogEntry {
  version: string;
  date: string;
  type: 'major' | 'minor' | 'patch';
  title: string;
  description: string;
  changes: {
    category: 'added' | 'changed' | 'fixed' | 'removed' | 'security';
    items: string[];
  }[];
}

interface WikiArticle {
  id: string;
  title: string;
  category: string;
  icon: React.ComponentType<{ className?: string }>;
  content: WikiSection[];
  relatedArticles?: string[];
}

interface WikiSection {
  title: string;
  content: string;
  subsections?: { title: string; content: string }[];
}

interface FAQ {
  question: string;
  answer: string;
  category: string;
}

// ============= DADOS =============

const changelogData: ChangelogEntry[] = [
  {
    version: '2.0.0',
    date: '10 Janeiro 2026',
    type: 'major',
    title: 'Dashboard VBRz e Programa de Cashback',
    description: 'Grande atualizacao com dashboard completa do token VBRz, programa de cashback integrado e reorganizacao do menu principal.',
    changes: [
      {
        category: 'added',
        items: [
          'Dashboard VBRz Token com 4 abas: Visao Geral, Tokenomics, Cashback, Liquidez',
          'Programa de Cashback completo com regras configuraveis',
          'Aba Cashback no modulo Financeiro',
          'Niveis de fidelidade (Bronze, Prata, Ouro, Platina, Diamante)',
          'Metricas de distribuicao de cashback por categoria',
          'Historico de transacoes de cashback',
        ],
      },
      {
        category: 'changed',
        items: [
          'Menu reorganizado: Dashboard agora e o primeiro item',
          'VBRz Token movido para posicao de destaque no menu',
          'Financeiro agora inclui aba de Cashback',
          'Dashboards Consultivas com novos graficos',
        ],
      },
      {
        category: 'fixed',
        items: [
          'Correcao de tipagem TypeScript em componentes',
          'Ajustes de responsividade em dashboards',
        ],
      },
    ],
  },
  {
    version: '1.9.0',
    date: '05 Janeiro 2026',
    type: 'minor',
    title: 'Central de Comunicacao e Omnichannel',
    description: 'Nova Central de Comunicacao unificada com suporte a WhatsApp, Instagram, WebChat e Email.',
    changes: [
      {
        category: 'added',
        items: [
          'Central de Comunicacao (Communication Hub)',
          'Integracao WhatsApp Business API',
          'Integracao Instagram Direct',
          'WebChat integrado',
          'Agentes de IA por departamento',
          'Base de conhecimento editavel',
          'Regras de handoff automatico',
        ],
      },
      {
        category: 'changed',
        items: [
          'Menu "Atendimento IA" renomeado para "Central de Comunicacao"',
          'Painel de conversas redesenhado',
        ],
      },
    ],
  },
  {
    version: '1.8.0',
    date: '28 Dezembro 2025',
    type: 'minor',
    title: 'Dashboards Consultivas e BI',
    description: 'Novas dashboards consultivas com Business Intelligence avancado.',
    changes: [
      {
        category: 'added',
        items: [
          'Dashboard Consultiva de Contratos',
          'Dashboard Consultiva Financeira',
          'Dashboard Consultiva de Usuarios',
          'Dashboard Consultiva de Imoveis',
          'Dashboard Consultiva de Operacoes',
          'Exportacao de relatorios em Excel',
        ],
      },
    ],
  },
  {
    version: '1.7.0',
    date: '20 Dezembro 2025',
    type: 'minor',
    title: 'Modulo Financeiro Completo',
    description: 'Modulo financeiro integrado com 7 abas para gestao completa.',
    changes: [
      {
        category: 'added',
        items: [
          'Gestao de Alugueis a Receber',
          'Contas a Receber',
          'Contas a Pagar',
          'Cadastro de Fornecedores',
          'Cadastro de Colaboradores',
          'Categorias de Despesa/Receita',
          'DRE integrado ao modulo',
        ],
      },
    ],
  },
  {
    version: '1.6.0',
    date: '10 Dezembro 2025',
    type: 'minor',
    title: 'CRM e Engage',
    description: 'Novos modulos de CRM com Kanban e Automacao de Marketing.',
    changes: [
      {
        category: 'added',
        items: [
          'CRM com pipeline Kanban',
          'Gestao de leads e oportunidades',
          'Vinculo Engage - Automacao de Marketing',
          'Campanhas de email',
          'Segmentacao de audiencia',
          'Templates de comunicacao',
        ],
      },
    ],
  },
  {
    version: '1.5.0',
    date: '25 Novembro 2025',
    type: 'minor',
    title: 'Configuracoes Avancadas',
    description: 'Novos modulos de configuracao e integracoes.',
    changes: [
      {
        category: 'added',
        items: [
          'Gestao de Usuarios e Permissoes',
          'Configuracao de Gateways (Asaas, Stripe)',
          'Configuracao de Contas Bancarias',
          'Cadastro de Seguradoras',
          'Marketplace de Servicos',
          'Integracao Carteiras Crypto',
        ],
      },
    ],
  },
  {
    version: '1.0.0',
    date: '01 Outubro 2025',
    type: 'major',
    title: 'Lancamento Oficial',
    description: 'Primeira versao publica do ERP Vinculo.io com funcionalidades core.',
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
          'Vistoria digital com hash',
          'Mediacao de disputas multi-sig',
        ],
      },
    ],
  },
];

const wikiArticles: WikiArticle[] = [
  {
    id: 'como-funciona',
    title: 'Como Funciona o Vinculo.io',
    category: 'Introducao',
    icon: Info,
    content: [
      {
        title: 'O que e o Vinculo.io?',
        content: 'O Vinculo.io e um ecossistema de locacao imobiliaria baseado em blockchain. Diferente de uma imobiliaria tradicional, utilizamos Smart Contracts para automatizar pagamentos, garantir vistorias imutaveis e remunerar todos os envolvidos de forma justa e transparente.',
      },
      {
        title: 'O Modelo 85/5/5/5',
        content: 'Todas as transacoes de aluguel seguem uma divisao automatica e instantanea: 85% para o Proprietario, 5% para a Seguradora, 5% para a Plataforma e 5% para o Garantidor.',
        subsections: [
          { title: 'Proprietario (85%)', content: 'Recebe o valor liquido do aluguel com seguranca tripla: seguro-fianca, colateral do garantidor e contrato NFT imutavel.' },
          { title: 'Seguradora (5%)', content: 'Pagamento mensal do seguro-fianca que protege o contrato contra inadimplencia.' },
          { title: 'Plataforma (5%)', content: 'Taxa de servico que mantem toda a infraestrutura, IA, blockchain e suporte.' },
          { title: 'Garantidor (5%)', content: 'Comissao mensal paga ao garantidor por disponibilizar seu imovel como colateral digital.' },
        ],
      },
    ],
    relatedArticles: ['contratos-nft', 'garantidores', 'split-pagamento'],
  },
  {
    id: 'contratos-nft',
    title: 'Contratos NFT',
    category: 'Blockchain',
    icon: FileSignature,
    content: [
      {
        title: 'O que sao Contratos NFT?',
        content: 'Cada contrato de locacao no Vinculo.io e representado por um NFT (Token Nao-Fungivel) unico na blockchain. Este NFT contem todo o historico do contrato, vistorias e pagamentos de forma imutavel.',
      },
      {
        title: 'Beneficios',
        content: 'Os contratos NFT oferecem: transparencia total, auditoria publica, impossibilidade de fraude, historico permanente e automacao de pagamentos via Smart Contract.',
      },
      {
        title: 'Ciclo de Vida',
        content: 'O contrato passa pelos seguintes estados: Rascunho > Aguardando Assinaturas > Aguardando Deposito > Ativo > Encerrado. Todas as transicoes sao registradas na blockchain.',
      },
    ],
  },
  {
    id: 'garantidores',
    title: 'Sistema de Garantidores',
    category: 'Usuarios',
    icon: Shield,
    content: [
      {
        title: 'Quem e o Garantidor?',
        content: 'O Garantidor e um investidor que disponibiliza um imovel de sua propriedade como colateral digital. Diferente do fiador tradicional que so tem riscos, o Garantidor recebe 5% do aluguel mensalmente como recompensa.',
      },
      {
        title: 'Como Funciona',
        content: 'O Garantidor tokeniza seu imovel na plataforma (geralmente ate 80% do valor). Este colateral fica disponivel como garantia adicional em caso de inadimplencia grave.',
      },
      {
        title: 'Niveis de Fidelidade',
        content: 'Garantidores acumulam pontos e sobem de nivel: Bronze, Prata, Ouro, Platina e Diamante. Niveis mais altos desbloqueiam beneficios como taxas menores e acesso a mais contratos.',
      },
    ],
  },
  {
    id: 'vistoria-digital',
    title: 'Vistoria Digital',
    category: 'Operacional',
    icon: Building2,
    content: [
      {
        title: 'Processo de Vistoria',
        content: 'As vistorias de entrada e saida sao realizadas com fotos e videos em alta resolucao. Cada arquivo gera um hash SHA-256 unico que e registrado na blockchain, garantindo que nenhuma alteracao seja possivel.',
      },
      {
        title: 'Comparacao Automatica',
        content: 'Na saida, o sistema compara automaticamente as fotos de entrada e saida. Nossa IA identifica divergencias e gera um laudo automatico.',
      },
      {
        title: 'Resolucao de Disputas',
        content: 'Se houver danos, o valor do conserto pode ser retido da garantia. Em caso de disputa, o processo multi-sig (admin + seguradora + parte) decide o desfecho.',
      },
    ],
  },
  {
    id: 'token-vbrz',
    title: 'Token VBRz',
    category: 'Blockchain',
    icon: Coins,
    content: [
      {
        title: 'O que e o VBRz?',
        content: 'O Vinculo Brasil Token (VBRz) e o token nativo do ecossistema Vinculo.io. E um token ERC-20 na rede Polygon com supply total de 100 milhoes de unidades.',
      },
      {
        title: 'Utilidades',
        content: 'O VBRz pode ser usado para: receber cashback em pagamentos, fazer staking para rendimento passivo, participar de governanca, obter descontos em taxas e servir como colateral adicional.',
      },
      {
        title: 'Tokenomics',
        content: '35% circulante, 25% treasury, 18% em staking, 15% equipe (vesting), 5% parceiros, 2% queimados.',
      },
    ],
  },
  {
    id: 'cashback',
    title: 'Programa de Cashback',
    category: 'Beneficios',
    icon: Gift,
    content: [
      {
        title: 'Como Funciona',
        content: 'Todas as transacoes na plataforma geram cashback em tokens VBRz. As taxas variam por categoria: 3% em pagamento de aluguel, 5% em marketplace, 2% em antecipacao.',
      },
      {
        title: 'Categorias',
        content: 'Cashback disponivel em: pagamento de aluguel, indicacao de inquilino (50 VBRz), indicacao de proprietario (100 VBRz), servicos do marketplace e antecipacao de aluguel.',
      },
      {
        title: 'Multiplicadores',
        content: 'Seu nivel de fidelidade multiplica o cashback: Bronze 1x, Prata 1.25x, Ouro 1.5x, Platina 1.75x, Diamante 2x.',
      },
    ],
  },
  {
    id: 'modulo-financeiro',
    title: 'Modulo Financeiro',
    category: 'Gestao',
    icon: Wallet,
    content: [
      {
        title: 'Visao Geral',
        content: 'O modulo financeiro integrado oferece gestao completa de receitas e despesas, com 8 abas: Alugueis, A Receber, A Pagar, Fornecedores, Colaboradores, Categorias, Cashback e DRE.',
      },
      {
        title: 'DRE',
        content: 'O Demonstrativo de Resultados mostra a saude financeira da operacao, separando receita bruta, repasses, receitas da plataforma, despesas e lucro liquido.',
      },
      {
        title: 'Fluxo de Caixa',
        content: 'Acompanhamento em tempo real de todas as entradas e saidas, com categorizacao automatica e conciliacao bancaria.',
      },
    ],
  },
  {
    id: 'crm',
    title: 'CRM e Pipeline de Vendas',
    category: 'Comercial',
    icon: Target,
    content: [
      {
        title: 'Pipeline Kanban',
        content: 'O CRM utiliza metodologia Kanban com estagios configurraveis. Por padrao: Lead, Qualificado, Proposta, Negociacao, Fechado.',
      },
      {
        title: 'Gestao de Leads',
        content: 'Capture leads de multiplas fontes (site, indicacao, WhatsApp), qualifique automaticamente e acompanhe toda a jornada ate a conversao.',
      },
      {
        title: 'Automacoes',
        content: 'Configure automacoes para follow-up, lembretes, envio de materiais e notificacoes de mudanca de estagio.',
      },
    ],
  },
  {
    id: 'omnichannel',
    title: 'Atendimento Omnichannel',
    category: 'Comunicacao',
    icon: Globe,
    content: [
      {
        title: 'Canais Integrados',
        content: 'Atenda seus clientes em WhatsApp, Instagram, WebChat e Email, tudo em uma unica interface.',
      },
      {
        title: 'Agentes de IA (Vini)',
        content: 'Nossos agentes de IA atendem 24/7 com conhecimento completo do protocolo. Existem agentes especializados por departamento: Financeiro, Suporte, Disputas e Comercial.',
      },
      {
        title: 'Handoff Inteligente',
        content: 'Quando necessario, a IA transfere para um atendente humano de forma automatica, passando todo o contexto da conversa.',
      },
    ],
  },
];

const faqData: FAQ[] = [
  { question: 'Preciso de fiador para alugar?', answer: 'Nao necessariamente. Voce pode usar nosso sistema de Garantidores Remunerados, que sao investidores que oferecem seus imoveis como garantia e recebem 5% do aluguel por isso.', category: 'Aluguel' },
  { question: 'Como funciona o split 85/5/5/5?', answer: 'O aluguel e dividido automaticamente pelo Smart Contract: 85% para o proprietario, 5% para a seguradora, 5% para a plataforma e 5% para o garantidor.', category: 'Pagamentos' },
  { question: 'O que acontece se o inquilino nao pagar?', answer: 'A seguradora cobre o pagamento ao proprietario enquanto iniciamos o processo de cobranca. Em casos extremos, podemos acionar o colateral do garantidor.', category: 'Inadimplencia' },
  { question: 'O que e Trust Score?', answer: 'E sua pontuacao de confiabilidade no sistema. Quanto mais pagamentos em dia, maior seu score e maiores seus descontos futuros.', category: 'Beneficios' },
  { question: 'Posso ser um Garantidor?', answer: 'Sim! Se voce possui um imovel quitado, pode cadastra-lo como colateral e receber 5% do aluguel de outros contratos mensalmente.', category: 'Investimento' },
  { question: 'Como funciona o cashback em VBRz?', answer: 'Todas as transacoes geram cashback automatico em tokens VBRz. Inquilinos recebem 3% do aluguel, indicacoes rendem de 50 a 100 VBRz, e servicos do marketplace dao 5%.', category: 'Beneficios' },
  { question: 'O que e um Contrato NFT?', answer: 'Seu contrato de locacao e transformado em um NFT unico na blockchain, contendo todo o historico imutavel de vistorias, pagamentos e alteracoes.', category: 'Tecnologia' },
  { question: 'Como funciona a vistoria digital?', answer: 'As fotos e videos da vistoria sao transformadas em hash criptografico e registradas na blockchain. Isso garante que nenhuma alteracao seja possivel apos o registro.', category: 'Operacional' },
  { question: 'Quais formas de pagamento sao aceitas?', answer: 'Aceitamos PIX, boleto bancario e cartao de credito. Os pagamentos sao processados pelos gateways Asaas e Stripe.', category: 'Pagamentos' },
  { question: 'Como faco para baixar a documentacao tecnica?', answer: 'Na aba "Sobre" da documentacao, voce encontra o botao para download do PDF completo da documentacao tecnica.', category: 'Sistema' },
];

// ============= COMPONENTES =============

function ChangelogSection() {
  const getCategoryBadge = (category: string) => {
    const styles = {
      added: 'bg-green-100 text-green-800',
      changed: 'bg-blue-100 text-blue-800',
      fixed: 'bg-amber-100 text-amber-800',
      removed: 'bg-red-100 text-red-800',
      security: 'bg-purple-100 text-purple-800',
    };
    const labels = {
      added: 'Adicionado',
      changed: 'Alterado',
      fixed: 'Corrigido',
      removed: 'Removido',
      security: 'Seguranca',
    };
    return (
      <Badge className={styles[category as keyof typeof styles]}>
        {labels[category as keyof typeof labels]}
      </Badge>
    );
  };

  const getVersionBadge = (type: string) => {
    const styles = {
      major: 'bg-violet-600 text-white',
      minor: 'bg-blue-600 text-white',
      patch: 'bg-gray-600 text-white',
    };
    return <Badge className={styles[type as keyof typeof styles]}>{type.toUpperCase()}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <History className="h-6 w-6 text-violet-600" />
        <h2 className="text-2xl font-bold">Changelog</h2>
      </div>

      <div className="space-y-6">
        {changelogData.map((entry, index) => (
          <Card key={entry.version} className={index === 0 ? 'border-violet-300 bg-violet-50/50' : ''}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold">v{entry.version}</span>
                  {getVersionBadge(entry.type)}
                  {index === 0 && <Badge className="bg-green-600 text-white">Atual</Badge>}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{entry.date}</span>
                </div>
              </div>
              <CardTitle className="text-lg">{entry.title}</CardTitle>
              <CardDescription>{entry.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {entry.changes.map((change, changeIndex) => (
                  <div key={changeIndex}>
                    {getCategoryBadge(change.category)}
                    <ul className="mt-2 ml-4 space-y-1">
                      {change.items.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-start gap-2 text-sm">
                          <ChevronRight className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function WikiSection() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<WikiArticle | null>(null);

  const categories = [...new Set(wikiArticles.map((a) => a.category))];

  const filteredArticles = wikiArticles.filter(
    (article) =>
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.content.some((section) => section.content.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (selectedArticle) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => setSelectedArticle(null)} className="mb-4">
          <ChevronRight className="h-4 w-4 rotate-180 mr-2" />
          Voltar para Wiki
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 bg-violet-100 rounded-lg">
                <selectedArticle.icon className="h-6 w-6 text-violet-600" />
              </div>
              <div>
                <Badge variant="outline" className="mb-1">
                  {selectedArticle.category}
                </Badge>
                <CardTitle className="text-2xl">{selectedArticle.title}</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {selectedArticle.content.map((section, index) => (
                <div key={index}>
                  <h3 className="text-lg font-semibold mb-3">{section.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{section.content}</p>
                  {section.subsections && (
                    <div className="mt-4 ml-4 space-y-3">
                      {section.subsections.map((sub, subIndex) => (
                        <div key={subIndex} className="border-l-2 border-violet-200 pl-4">
                          <h4 className="font-medium">{sub.title}</h4>
                          <p className="text-sm text-muted-foreground">{sub.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {selectedArticle.relatedArticles && (
              <div className="mt-8 pt-6 border-t">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" />
                  Artigos Relacionados
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedArticle.relatedArticles.map((articleId) => {
                    const related = wikiArticles.find((a) => a.id === articleId);
                    return related ? (
                      <Button key={articleId} variant="outline" size="sm" onClick={() => setSelectedArticle(related)}>
                        {related.title}
                      </Button>
                    ) : null;
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Book className="h-6 w-6 text-violet-600" />
        <h2 className="text-2xl font-bold">Wiki do Sistema</h2>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar na wiki..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {categories.map((category) => {
          const categoryArticles = filteredArticles.filter((a) => a.category === category);
          if (categoryArticles.length === 0) return null;

          return (
            <Card key={category}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{category}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {categoryArticles.map((article) => (
                    <Button
                      key={article.id}
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => setSelectedArticle(article)}
                    >
                      <article.icon className="h-4 w-4 mr-2 text-violet-600" />
                      {article.title}
                      <ChevronRight className="h-4 w-4 ml-auto" />
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function FAQSection() {
  const [searchTerm, setSearchTerm] = useState('');
  const categories = [...new Set(faqData.map((f) => f.category))];

  const filteredFAQs = faqData.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <HelpCircle className="h-6 w-6 text-violet-600" />
        <h2 className="text-2xl font-bold">Perguntas Frequentes</h2>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar perguntas..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <Accordion type="single" collapsible className="space-y-2">
        {filteredFAQs.map((faq, index) => (
          <AccordionItem key={index} value={`faq-${index}`} className="border rounded-lg px-4">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex items-center gap-3 text-left">
                <Badge variant="outline" className="shrink-0">
                  {faq.category}
                </Badge>
                <span>{faq.question}</span>
              </div>
            </AccordionTrigger>
            <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}

function AboutSection() {
  const handleDownloadPDF = () => {
    // Abre o markdown da documentacao tecnica
    window.open('/docs/DOCUMENTACAO_TECNICA_VINCULO.md', '_blank');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <Info className="h-6 w-6 text-violet-600" />
        <h2 className="text-2xl font-bold">Sobre o Sistema</h2>
      </div>

      {/* Hero Card */}
      <Card className="bg-gradient-to-br from-violet-600 to-indigo-700 text-white border-0">
        <CardContent className="p-8">
          <div className="flex items-center gap-6">
            <div className="p-4 bg-white/20 rounded-2xl">
              <VinculoBrasilLogo className="h-16 w-16" />
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2">Vinculo.io</h1>
              <p className="text-white/80 text-lg">
                ERP Administrativo - Sistema Completo de Gestao Imobiliaria com Blockchain
              </p>
              <div className="flex items-center gap-4 mt-4">
                <Badge className="bg-white/20 text-white hover:bg-white/30">v2.0.0</Badge>
                <Badge className="bg-white/20 text-white hover:bg-white/30">Janeiro 2026</Badge>
                <Badge className="bg-green-500/80 text-white">Producao</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Download Button */}
      <Card className="border-violet-200 bg-violet-50/50">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-violet-100 rounded-lg">
                <FileText className="h-6 w-6 text-violet-600" />
              </div>
              <div>
                <h3 className="font-semibold">Documentacao Tecnica Completa</h3>
                <p className="text-sm text-muted-foreground">
                  Baixe o documento tecnico completo para o time de desenvolvimento
                </p>
              </div>
            </div>
            <Button onClick={handleDownloadPDF} className="bg-violet-600 hover:bg-violet-700">
              <Download className="h-4 w-4 mr-2" />
              Baixar Documentacao
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-violet-600">40+</div>
            <div className="text-sm text-muted-foreground">Componentes UI</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-violet-600">12</div>
            <div className="text-sm text-muted-foreground">Modulos Ativos</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-violet-600">5</div>
            <div className="text-sm text-muted-foreground">Dashboards</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-violet-600">4</div>
            <div className="text-sm text-muted-foreground">Integracoes</div>
          </CardContent>
        </Card>
      </div>

      {/* Features */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[
          { icon: Database, title: 'Blockchain', desc: 'Contratos NFT na Polygon' },
          { icon: Bot, title: 'IA Omnichannel', desc: 'Atendimento 24/7 automatizado' },
          { icon: Wallet, title: 'DeFi Integrado', desc: 'Token VBRz e Cashback' },
          { icon: Shield, title: 'Seguranca', desc: 'Multi-sig e auditoria' },
          { icon: BarChart3, title: 'BI Avancado', desc: 'Dashboards consultivas' },
          { icon: Zap, title: 'Automacao', desc: 'CRM e Engage' },
        ].map((feature, index) => (
          <Card key={index}>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-2 bg-violet-100 rounded-lg">
                <feature.icon className="h-5 w-5 text-violet-600" />
              </div>
              <div>
                <h4 className="font-semibold">{feature.title}</h4>
                <p className="text-sm text-muted-foreground">{feature.desc}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tech Stack */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            Stack Tecnologico
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <h4 className="font-semibold mb-2">Frontend</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>React 19 + TypeScript</li>
                <li>Tailwind CSS v4</li>
                <li>TanStack Router + Query</li>
                <li>shadcn/ui Components</li>
                <li>Lucide React Icons</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Blockchain</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>Polygon Network</li>
                <li>Smart Contracts (Solidity)</li>
                <li>IPFS Storage</li>
                <li>Ethers.js / Viem</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Integracoes</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>Asaas / Stripe</li>
                <li>WhatsApp Business API</li>
                <li>Transfero (Crypto)</li>
                <li>Seguradoras Parceiras</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Team */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Equipe Vinculo.io
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <a href="https://vinculobrasil.com.br" className="text-violet-600 hover:underline">
                vinculobrasil.com.br
              </a>
            </div>
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              <a href="https://docs.vinculobrasil.com.br" className="text-violet-600 hover:underline">
                docs.vinculobrasil.com.br
              </a>
            </div>
            <div className="flex items-center gap-2">
              <Code className="h-4 w-4 text-muted-foreground" />
              <a href="https://github.com/vinculo-io" className="text-violet-600 hover:underline">
                github.com/vinculo-io
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ============= COMPONENTE PRINCIPAL =============

export function SystemDocumentation() {
  const [activeTab, setActiveTab] = useState('about');

  return (
    <div className="min-h-screen bg-gray-50/50">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-violet-100 rounded-lg">
              <Book className="h-6 w-6 text-violet-600" />
            </div>
            <h1 className="text-3xl font-bold">Documentacao</h1>
          </div>
          <p className="text-muted-foreground">
            Guia completo do sistema Vinculo.io com changelog, wiki e informacoes tecnicas.
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="about" className="flex items-center gap-2">
              <Info className="h-4 w-4" />
              Sobre
            </TabsTrigger>
            <TabsTrigger value="changelog" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              Changelog
            </TabsTrigger>
            <TabsTrigger value="wiki" className="flex items-center gap-2">
              <Book className="h-4 w-4" />
              Wiki
            </TabsTrigger>
            <TabsTrigger value="faq" className="flex items-center gap-2">
              <HelpCircle className="h-4 w-4" />
              FAQ
            </TabsTrigger>
          </TabsList>

          <TabsContent value="about">
            <AboutSection />
          </TabsContent>

          <TabsContent value="changelog">
            <ChangelogSection />
          </TabsContent>

          <TabsContent value="wiki">
            <WikiSection />
          </TabsContent>

          <TabsContent value="faq">
            <FAQSection />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default SystemDocumentation;
