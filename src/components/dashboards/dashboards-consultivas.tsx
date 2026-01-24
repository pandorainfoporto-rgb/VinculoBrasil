/**
 * Dashboards Consultivas - Vinculo.io
 * Sistema de dashboards totalizadoras com menu vertical de selecao
 *
 * Dashboards disponiveis:
 * - Financeira: Resumo financeiro geral
 * - Locacao: Indicadores de contratos e imoveis
 * - Servicos Externos: Fornecedores e marketplace
 * - Seguradora: Apolices e sinistros
 * - Inquilinos: Base de locatarios
 * - Proprietarios: Base de locadores
 * - Garantidores: Base de garantidores
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useThemeClasses } from '@/hooks/use-theme';
import {
  Wallet,
  Building2,
  Package,
  ShieldCheck,
  Users,
  Building,
  Shield,
  TrendingUp,
  TrendingDown,
  DollarSign,
  FileText,
  AlertTriangle,
  CheckCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Percent,
  CircleDollarSign,
  Home,
  MapPin,
  Calendar,
  Star,
  Phone,
  Mail,
  UserCheck,
  UserX,
  Activity,
  PieChart,
  BarChart3,
  Target,
  Briefcase,
  Hammer,
  Receipt,
  CreditCard,
  Banknote,
  Scale,
  FileSignature,
  Eye,
  ChevronRight,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react';

// Tipos de Dashboard
type DashboardType =
  | 'financeira'
  | 'locacao'
  | 'servicos'
  | 'seguradora'
  | 'inquilinos'
  | 'proprietarios'
  | 'garantidores';

interface DashboardMenuItem {
  id: DashboardType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  color: string;
}

// Menu de Dashboards
const dashboardMenuItems: DashboardMenuItem[] = [
  { id: 'financeira', label: 'Financeira', icon: Wallet, description: 'Resumo financeiro geral', color: 'emerald' },
  { id: 'locacao', label: 'Locacao', icon: Home, description: 'Contratos e imoveis', color: 'blue' },
  { id: 'servicos', label: 'Servicos Externos', icon: Package, description: 'Fornecedores e marketplace', color: 'violet' },
  { id: 'seguradora', label: 'Seguradora', icon: ShieldCheck, description: 'Apolices e sinistros', color: 'amber' },
  { id: 'inquilinos', label: 'Inquilinos', icon: Users, description: 'Base de locatarios', color: 'cyan' },
  { id: 'proprietarios', label: 'Proprietarios', icon: Building, description: 'Base de locadores', color: 'indigo' },
  { id: 'garantidores', label: 'Garantidores', icon: Shield, description: 'Base de garantidores', color: 'rose' },
];

// ============= DADOS ZERADOS PARA PRODUCAO =============
// Valores reais virao do backend

// Dados Financeiros
const dadosFinanceiros = {
  receitaBrutaMes: 0,
  receitaBrutaAno: 0,
  despesasTotaisMes: 0,
  lucroLiquidoMes: 0,
  taxaAdministracao: 0,
  comissoesRecebidas: 0,
  inadimplencia: 0,
  ticketMedio: 0,
  contasReceber: 0,
  contasReceberVencidas: 0,
  contasPagar: 0,
  contasPagarVencidas: 0,
  saldoBancario: 0,
  fluxoCaixaPrevistoMes: 0,
  crescimentoMensal: 0,
  margemLucro: 0,
};

// Dados de Locacao
const dadosLocacao = {
  totalImoveis: 0,
  imoveisOcupados: 0,
  imoveisVagos: 0,
  imoveisEmNegociacao: 0,
  taxaOcupacao: 0,
  contratosAtivos: 0,
  contratosVencendoMes: 0,
  contratosVencidos: 0,
  novasLocacoes30d: 0,
  distratosAno: 0,
  tempoMedioLocacao: 0,
  valorCarteira: 0,
  reajustesPendentes: 0,
  renovacoesPendentes: 0,
  vistoriasAgendadas: 0,
  imoveisResidenciais: 0,
  imoveisComerciais: 0,
};

// Dados de Servicos Externos
const dadosServicos = {
  totalFornecedores: 0,
  fornecedoresAtivos: 0,
  servicosContratadosMes: 0,
  volumeServicos: 0,
  comissoesGeradas: 0,
  avaliacaoMedia: 0,
  servicosReformas: 0,
  servicosVistorias: 0,
  servicosLimpeza: 0,
  servicosMudancas: 0,
  pendentesAprovacao: 0,
  emAndamento: 0,
  concluidos30d: 0,
  reclamacoes: 0,
  topFornecedores: [] as Array<{ nome: string; rating: number; jobs: number }>,
};

// Dados Seguradora
const dadosSeguradora = {
  totalApolices: 0,
  apolicesAtivas: 0,
  apolicesVencendo30d: 0,
  valorPremioMensal: 0,
  valorPremioAnual: 0,
  sinistrosAbertos: 0,
  sinistrosAnalise: 0,
  sinistrosAprovados: 0,
  valorSinistros: 0,
  sinistrosPagosAnual: 0,
  taxaSinistralidade: 0,
  comissaoMensal: 0,
  comissaoAnual: 0,
  seguradoras: [] as { nome: string; apolices: number; premioMensal: number; comissao: number }[],
  renovacoesAutomaticas: 0,
  cancelamentos: 0,
};

// Dados Inquilinos
const dadosInquilinos = {
  totalInquilinos: 0,
  inquilinosAtivos: 0,
  inquilinosInadimplentes: 0,
  novosInquilinos30d: 0,
  inquilinosPF: 0,
  inquilinosPJ: 0,
  ticketMedioAluguel: 0,
  tempoMedioContrato: 0,
  taxaRenovacao: 0,
  satisfacao: 0,
  avaliacoesPositivas: 0,
  tempoMedioResposta: 0,
  taxaResolucao: 0,
  chamadosSuporte: 0,
  chamadosResolvidos: 0,
  inadimplencia30d: 0,
  inadimplencia60d: 0,
  inadimplencia90d: 0,
  acordosAtivos: 0,
};

// Dados Proprietarios
const dadosProprietarios = {
  totalProprietarios: 0,
  proprietariosAtivos: 0,
  novosProprietarios30d: 0,
  proprietariosPF: 0,
  proprietariosPJ: 0,
  imoveisPorProprietario: 0,
  valorCarteira: 0,
  rendimentoMedio: 0,
  repassesMes: 0,
  taxaSatisfacao: 0,
  proprietariosExclusivos: 0,
  comMultiplosImoveis: 0,
  solicitacoesManutencao: 0,
  pendenciasRepasse: 0,
};

// Dados Garantidores
const dadosGarantidores = {
  totalGarantidores: 0,
  garantidoresAtivos: 0,
  novosGarantidores30d: 0,
  garantidoresPF: 0,
  garantidoresPJ: 0,
  valorGarantiasAtivas: 0,
  garantiasExecutadas: 0,
  valorExecutado: 0,
  taxaExecucao: 0,
  garantiasVencendo30d: 0,
  pendentesAnalise: 0,
  aprovados30d: 0,
  reprovados30d: 0,
  scoreMin: 0,
  scoreMedio: 0,
};

// ============= COMPONENTE PRINCIPAL =============

export function DashboardsConsultivas() {
  const theme = useThemeClasses();
  const [selectedDashboard, setSelectedDashboard] = useState<DashboardType>('financeira');

  // Funcao auxiliar para formatar moeda
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  // Funcao auxiliar para formatar numeros grandes
  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('pt-BR').format(value);
  };

  // Estado para detalhes clicáveis
  const [detailModal, setDetailModal] = useState<{
    open: boolean;
    title: string;
    data: Array<{ label: string; value: string | number; highlight?: boolean }>;
    color: string;
  }>({ open: false, title: '', data: [], color: 'blue' });

  // ============= CARDS DE INDICADORES =============

  const KPICard = ({
    title,
    value,
    subtitle,
    icon: Icon,
    trend,
    trendValue,
    color = 'blue',
    onClick,
    detailData,
  }: {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: React.ComponentType<{ className?: string }>;
    trend?: 'up' | 'down' | 'neutral';
    trendValue?: string;
    color?: string;
    onClick?: () => void;
    detailData?: Array<{ label: string; value: string | number; highlight?: boolean }>;
  }) => {
    const colorClasses: Record<string, string> = {
      blue: 'from-blue-500/10 to-blue-600/5 border-blue-500/20',
      emerald: 'from-emerald-500/10 to-emerald-600/5 border-emerald-500/20',
      amber: 'from-amber-500/10 to-amber-600/5 border-amber-500/20',
      violet: 'from-violet-500/10 to-violet-600/5 border-violet-500/20',
      rose: 'from-rose-500/10 to-rose-600/5 border-rose-500/20',
      cyan: 'from-cyan-500/10 to-cyan-600/5 border-cyan-500/20',
      indigo: 'from-indigo-500/10 to-indigo-600/5 border-indigo-500/20',
    };

    const iconColorClasses: Record<string, string> = {
      blue: 'text-blue-500 bg-blue-500/10',
      emerald: 'text-emerald-500 bg-emerald-500/10',
      amber: 'text-amber-500 bg-amber-500/10',
      violet: 'text-violet-500 bg-violet-500/10',
      rose: 'text-rose-500 bg-rose-500/10',
      cyan: 'text-cyan-500 bg-cyan-500/10',
      indigo: 'text-indigo-500 bg-indigo-500/10',
    };

    const handleClick = () => {
      if (onClick) {
        onClick();
      } else if (detailData) {
        setDetailModal({ open: true, title, data: detailData, color });
      }
    };

    const isClickable = onClick || detailData;

    return (
      <Card
        className={cn(
          'bg-gradient-to-br border transition-all',
          colorClasses[color],
          isClickable && 'cursor-pointer hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]'
        )}
        onClick={isClickable ? handleClick : undefined}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm text-muted-foreground font-medium">{title}</p>
              <p className="text-2xl font-bold mt-1">{value}</p>
              {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
              {trend && trendValue && (
                <div className={cn('flex items-center gap-1 mt-2 text-xs font-medium', trend === 'up' ? 'text-emerald-500' : trend === 'down' ? 'text-rose-500' : 'text-muted-foreground')}>
                  {trend === 'up' ? <ArrowUpRight className="h-3 w-3" /> : trend === 'down' ? <ArrowDownRight className="h-3 w-3" /> : null}
                  {trendValue}
                </div>
              )}
            </div>
            <div className={cn('p-3 rounded-xl', iconColorClasses[color])}>
              <Icon className="h-5 w-5" />
            </div>
          </div>
          {isClickable && (
            <div className="mt-2 pt-2 border-t border-dashed border-current/10">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <ChevronRight className="h-3 w-3" /> Clique para detalhes
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  // Card de Lista
  const ListCard = ({
    title,
    items,
    icon: Icon,
  }: {
    title: string;
    items: { label: string; value: string | number; sublabel?: string; status?: 'success' | 'warning' | 'danger' }[];
    icon?: React.ComponentType<{ className?: string }>;
  }) => (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          {items.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{item.label}</p>
                {item.sublabel && <p className="text-xs text-muted-foreground">{item.sublabel}</p>}
              </div>
              <Badge variant={item.status === 'success' ? 'default' : item.status === 'warning' ? 'secondary' : item.status === 'danger' ? 'destructive' : 'outline'}>
                {item.value}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  // ============= DASHBOARDS =============

  // Dashboard Financeira
  const renderFinanceira = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Wallet className="h-6 w-6 text-emerald-500" />
          Dashboard Financeira
        </h2>
        <p className="text-muted-foreground">Visao geral das operacoes financeiras</p>
      </div>

      {/* KPIs Principais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard title="Receita Bruta (Mes)" value={formatCurrency(dadosFinanceiros.receitaBrutaMes)} trend="up" trendValue="+12.5% vs mes anterior" icon={DollarSign} color="emerald" />
        <KPICard title="Lucro Liquido (Mes)" value={formatCurrency(dadosFinanceiros.lucroLiquidoMes)} subtitle={`Margem: ${dadosFinanceiros.margemLucro}%`} icon={TrendingUp} color="blue" />
        <KPICard title="Taxa de Administracao" value={formatCurrency(dadosFinanceiros.taxaAdministracao)} subtitle="5% sobre receita bruta" icon={Percent} color="violet" />
        <KPICard title="Inadimplencia" value={`${dadosFinanceiros.inadimplencia}%`} trend="down" trendValue="-0.5% vs mes anterior" icon={AlertTriangle} color="amber" />
      </div>

      {/* Segunda linha de KPIs */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard title="Contas a Receber" value={formatCurrency(dadosFinanceiros.contasReceber)} subtitle={`${formatCurrency(dadosFinanceiros.contasReceberVencidas)} vencidas`} icon={Receipt} color="cyan" />
        <KPICard title="Contas a Pagar" value={formatCurrency(dadosFinanceiros.contasPagar)} subtitle={`${formatCurrency(dadosFinanceiros.contasPagarVencidas)} vencidas`} icon={CreditCard} color="rose" />
        <KPICard title="Saldo Bancario" value={formatCurrency(dadosFinanceiros.saldoBancario)} subtitle="Todas as contas" icon={Banknote} color="indigo" />
        <KPICard title="Fluxo Previsto (Mes)" value={formatCurrency(dadosFinanceiros.fluxoCaixaPrevistoMes)} subtitle="Saldo projetado" icon={Activity} color="emerald" />
      </div>

      {/* Cards Detalhados */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-emerald-500" />
              Composicao da Receita
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Taxa de Administracao</span>
                  <span className="font-medium">{formatCurrency(dadosFinanceiros.taxaAdministracao)}</span>
                </div>
                <Progress value={45} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Comissoes Seguradoras</span>
                  <span className="font-medium">{formatCurrency(dadosFinanceiros.comissoesRecebidas)}</span>
                </div>
                <Progress value={25} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Servicos Marketplace</span>
                  <span className="font-medium">{formatCurrency(0)}</span>
                </div>
                <Progress value={0} className="h-2" />
              </div>
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Total Receitas Proprias</span>
                <span>{formatCurrency(dadosFinanceiros.taxaAdministracao + dadosFinanceiros.comissoesRecebidas)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <ListCard
          title="Indicadores Financeiros"
          icon={Target}
          items={[
            { label: 'Ticket Medio', value: formatCurrency(dadosFinanceiros.ticketMedio), sublabel: 'Por contrato' },
            { label: 'Receita Anual', value: formatCurrency(dadosFinanceiros.receitaBrutaAno), sublabel: 'Acumulado' },
            { label: 'Despesas Totais', value: formatCurrency(dadosFinanceiros.despesasTotaisMes), sublabel: 'Mes atual' },
            { label: 'Crescimento Mensal', value: `+${dadosFinanceiros.crescimentoMensal}%`, status: 'success' },
          ]}
        />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-blue-500" />
              Fluxo de Caixa Resumido
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dadosFinanceiros.receitaBrutaMes === 0 && dadosFinanceiros.despesasTotaisMes === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <PieChart className="h-12 w-12 mx-auto mb-2 opacity-30" />
                <p>Nenhum dado disponivel no momento</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-emerald-500/10 rounded-lg">
                  <div className="flex items-center gap-2">
                    <ArrowUpRight className="h-4 w-4 text-emerald-500" />
                    <span className="text-sm">Entradas Previstas</span>
                  </div>
                  <span className="font-semibold text-emerald-600">{formatCurrency(dadosFinanceiros.receitaBrutaMes)}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-rose-500/10 rounded-lg">
                  <div className="flex items-center gap-2">
                    <ArrowDownRight className="h-4 w-4 text-rose-500" />
                    <span className="text-sm">Saidas Previstas</span>
                  </div>
                  <span className="font-semibold text-rose-600">{formatCurrency(dadosFinanceiros.despesasTotaisMes)}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between p-3 bg-blue-500/10 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Scale className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium">Saldo Projetado</span>
                  </div>
                  <span className="font-bold text-blue-600">{formatCurrency(dadosFinanceiros.receitaBrutaMes - dadosFinanceiros.despesasTotaisMes)}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Dashboard de Locacao
  const renderLocacao = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Home className="h-6 w-6 text-blue-500" />
          Dashboard de Locacao
        </h2>
        <p className="text-muted-foreground">Indicadores de contratos e imoveis</p>
      </div>

      {/* KPIs Principais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard title="Total de Imoveis" value={formatNumber(dadosLocacao.totalImoveis)} subtitle={`${dadosLocacao.imoveisOcupados} ocupados`} icon={Building2} color="blue" />
        <KPICard title="Taxa de Ocupacao" value={`${dadosLocacao.taxaOcupacao}%`} trend="up" trendValue="+2.3% vs mes anterior" icon={Target} color="emerald" />
        <KPICard title="Contratos Ativos" value={formatNumber(dadosLocacao.contratosAtivos)} subtitle={`${dadosLocacao.contratosVencendoMes} vencendo este mes`} icon={FileText} color="violet" />
        <KPICard title="Valor da Carteira" value={formatCurrency(dadosLocacao.valorCarteira)} subtitle="Receita mensal" icon={DollarSign} color="amber" />
      </div>

      {/* Segunda linha */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard title="Imoveis Vagos" value={formatNumber(dadosLocacao.imoveisVagos)} trend="down" trendValue="-8 vs mes anterior" icon={Building2} color="rose" />
        <KPICard title="Novas Locacoes (30d)" value={formatNumber(dadosLocacao.novasLocacoes30d)} trend="up" trendValue="+15% vs periodo anterior" icon={FileSignature} color="cyan" />
        <KPICard title="Tempo Medio Contrato" value={`${dadosLocacao.tempoMedioLocacao} meses`} subtitle="Media de duracao" icon={Calendar} color="indigo" />
        <KPICard title="Distratos (Ano)" value={formatNumber(dadosLocacao.distratosAno)} subtitle={`Taxa: ${((dadosLocacao.distratosAno / dadosLocacao.totalImoveis) * 100).toFixed(1)}%`} icon={FileText} color="amber" />
      </div>

      {/* Cards Detalhados */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-blue-500" />
              Distribuicao de Imoveis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Residenciais</span>
                  <span className="font-medium">{formatNumber(dadosLocacao.imoveisResidenciais)} ({((dadosLocacao.imoveisResidenciais / dadosLocacao.totalImoveis) * 100).toFixed(0)}%)</span>
                </div>
                <Progress value={(dadosLocacao.imoveisResidenciais / dadosLocacao.totalImoveis) * 100} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Comerciais</span>
                  <span className="font-medium">{formatNumber(dadosLocacao.imoveisComerciais)} ({((dadosLocacao.imoveisComerciais / dadosLocacao.totalImoveis) * 100).toFixed(0)}%)</span>
                </div>
                <Progress value={(dadosLocacao.imoveisComerciais / dadosLocacao.totalImoveis) * 100} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <ListCard
          title="Pendencias Operacionais"
          icon={Clock}
          items={[
            { label: 'Reajustes Pendentes', value: dadosLocacao.reajustesPendentes, status: 'warning' },
            { label: 'Renovacoes Pendentes', value: dadosLocacao.renovacoesPendentes, status: 'warning' },
            { label: 'Vistorias Agendadas', value: dadosLocacao.vistoriasAgendadas },
            { label: 'Contratos Vencidos', value: dadosLocacao.contratosVencidos, status: 'danger' },
          ]}
        />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-emerald-500" />
              Status dos Imoveis
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dadosLocacao.totalImoveis === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Building2 className="h-12 w-12 mx-auto mb-2 opacity-30" />
                <p>Nenhum dado disponivel no momento</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-emerald-500/10 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-500" />
                    <span className="text-sm">Ocupados</span>
                  </div>
                  <span className="font-semibold">{formatNumber(dadosLocacao.imoveisOcupados)}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-amber-500/10 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-amber-500" />
                    <span className="text-sm">Em Negociacao</span>
                  </div>
                  <span className="font-semibold">{formatNumber(dadosLocacao.imoveisEmNegociacao)}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-rose-500/10 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-rose-500" />
                    <span className="text-sm">Vagos</span>
                  </div>
                  <span className="font-semibold">{formatNumber(dadosLocacao.imoveisVagos)}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Dashboard de Servicos Externos
  const renderServicos = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Package className="h-6 w-6 text-violet-500" />
          Dashboard de Servicos Externos
        </h2>
        <p className="text-muted-foreground">Fornecedores e marketplace de servicos</p>
      </div>

      {/* KPIs Principais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard title="Total Fornecedores" value={formatNumber(dadosServicos.totalFornecedores)} subtitle={`${dadosServicos.fornecedoresAtivos} ativos`} icon={Briefcase} color="violet" />
        <KPICard title="Servicos Contratados (Mes)" value={formatNumber(dadosServicos.servicosContratadosMes)} trend="up" trendValue="+23% vs mes anterior" icon={Package} color="blue" />
        <KPICard title="Volume de Servicos" value={formatCurrency(dadosServicos.volumeServicos)} subtitle="Mes atual" icon={DollarSign} color="emerald" />
        <KPICard title="Comissoes Geradas" value={formatCurrency(dadosServicos.comissoesGeradas)} subtitle="10% media" icon={CircleDollarSign} color="amber" />
      </div>

      {/* Segunda linha */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard title="Avaliacao Media" value={dadosServicos.avaliacaoMedia.toFixed(1)} subtitle="De 5.0" icon={Star} color="amber" />
        <KPICard title="Em Andamento" value={formatNumber(dadosServicos.emAndamento)} subtitle="Servicos ativos" icon={Activity} color="cyan" />
        <KPICard title="Concluidos (30d)" value={formatNumber(dadosServicos.concluidos30d)} trend="up" trendValue="+18% vs periodo anterior" icon={CheckCircle} color="emerald" />
        <KPICard title="Reclamacoes" value={formatNumber(dadosServicos.reclamacoes)} subtitle="Este mes" icon={AlertTriangle} color="rose" />
      </div>

      {/* Cards Detalhados */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-violet-500" />
              Servicos por Categoria
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Vistorias</span>
                  <span className="font-medium">{dadosServicos.servicosVistorias}</span>
                </div>
                <Progress value={(dadosServicos.servicosVistorias / dadosServicos.servicosContratadosMes) * 100} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Reformas</span>
                  <span className="font-medium">{dadosServicos.servicosReformas}</span>
                </div>
                <Progress value={(dadosServicos.servicosReformas / dadosServicos.servicosContratadosMes) * 100} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Limpeza</span>
                  <span className="font-medium">{dadosServicos.servicosLimpeza}</span>
                </div>
                <Progress value={(dadosServicos.servicosLimpeza / dadosServicos.servicosContratadosMes) * 100} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Mudancas</span>
                  <span className="font-medium">{dadosServicos.servicosMudancas}</span>
                </div>
                <Progress value={(dadosServicos.servicosMudancas / dadosServicos.servicosContratadosMes) * 100} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <ListCard
          title="Status dos Servicos"
          icon={Activity}
          items={[
            { label: 'Pendentes Aprovacao', value: dadosServicos.pendentesAprovacao, status: 'warning' },
            { label: 'Em Andamento', value: dadosServicos.emAndamento },
            { label: 'Concluidos (30d)', value: dadosServicos.concluidos30d, status: 'success' },
            { label: 'Com Reclamacao', value: dadosServicos.reclamacoes, status: 'danger' },
          ]}
        />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-amber-500" />
              Top Fornecedores
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dadosServicos.topFornecedores.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Briefcase className="h-12 w-12 mx-auto mb-2 opacity-30" />
                <p>Nenhum fornecedor cadastrado</p>
              </div>
            ) : (
              <div className="space-y-3">
                {dadosServicos.topFornecedores.map((f, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                    <div>
                      <p className="font-medium text-sm">{f.nome}</p>
                      <p className="text-xs text-muted-foreground">{f.jobs} servicos</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                      <span className="font-semibold">{f.rating}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Dashboard Seguradora
  const renderSeguradora = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-amber-500" />
          Dashboard Seguradora
        </h2>
        <p className="text-muted-foreground">Apolices, sinistros e seguradoras parceiras</p>
      </div>

      {/* KPIs Principais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard title="Total de Apolices" value={formatNumber(dadosSeguradora.totalApolices)} subtitle={`${dadosSeguradora.apolicesAtivas} ativas`} icon={FileText} color="amber" />
        <KPICard title="Premio Mensal" value={formatCurrency(dadosSeguradora.valorPremioMensal)} trend="up" trendValue="+8.5% vs mes anterior" icon={DollarSign} color="emerald" />
        <KPICard title="Sinistros Abertos" value={formatNumber(dadosSeguradora.sinistrosAbertos)} subtitle={`${dadosSeguradora.sinistrosAnalise} em analise`} icon={AlertTriangle} color="rose" />
        <KPICard title="Taxa Sinistralidade" value={`${dadosSeguradora.taxaSinistralidade}%`} trend="down" trendValue="-0.3% vs mes anterior" icon={Percent} color="blue" />
      </div>

      {/* Segunda linha */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard title="Comissao Mensal" value={formatCurrency(dadosSeguradora.comissaoMensal)} subtitle={`${formatCurrency(dadosSeguradora.comissaoAnual)} anual`} icon={CircleDollarSign} color="violet" />
        <KPICard title="Valor Sinistros" value={formatCurrency(dadosSeguradora.valorSinistros)} subtitle="Em aberto" icon={Scale} color="amber" />
        <KPICard title="Renovacoes Automaticas" value={formatNumber(dadosSeguradora.renovacoesAutomaticas)} subtitle="Este mes" icon={CheckCircle} color="cyan" />
        <KPICard title="Apolices Vencendo (30d)" value={formatNumber(dadosSeguradora.apolicesVencendo30d)} subtitle="Requer atencao" icon={Clock} color="amber" />
      </div>

      {/* Cards Detalhados */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-amber-500" />
              Seguradoras Parceiras
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dadosSeguradora.seguradoras.map((s, idx) => (
                <div key={idx} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold">{s.nome}</span>
                    <Badge variant="outline">{s.comissao}% comissao</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                    <span>{s.apolices} apolices</span>
                    <span className="text-right">{formatCurrency(s.premioMensal)}/mes</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <ListCard
          title="Status dos Sinistros"
          icon={AlertTriangle}
          items={[
            { label: 'Em Analise', value: dadosSeguradora.sinistrosAnalise, status: 'warning' },
            { label: 'Aprovados (aguard. pag.)', value: dadosSeguradora.sinistrosAprovados, status: 'success' },
            { label: 'Total Abertos', value: dadosSeguradora.sinistrosAbertos },
            { label: 'Cancelamentos', value: dadosSeguradora.cancelamentos, status: 'danger' },
          ]}
        />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-blue-500" />
              Resumo Anual
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dadosSeguradora.totalApolices === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <ShieldCheck className="h-12 w-12 mx-auto mb-2 opacity-30" />
                <p>Nenhum dado disponivel no momento</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-emerald-500/10 rounded-lg">
                  <span className="text-sm">Premio Anual</span>
                  <span className="font-semibold text-emerald-600">{formatCurrency(dadosSeguradora.valorPremioAnual)}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-violet-500/10 rounded-lg">
                  <span className="text-sm">Comissao Anual</span>
                  <span className="font-semibold text-violet-600">{formatCurrency(dadosSeguradora.comissaoAnual)}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-amber-500/10 rounded-lg">
                  <span className="text-sm">Sinistros Pagos</span>
                  <span className="font-semibold text-amber-600">{formatCurrency(dadosSeguradora.sinistrosPagosAnual)}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Dashboard Inquilinos
  const renderInquilinos = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Users className="h-6 w-6 text-cyan-500" />
          Dashboard Inquilinos
        </h2>
        <p className="text-muted-foreground">Base de locatarios e indicadores</p>
      </div>

      {/* KPIs Principais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Total de Inquilinos"
          value={formatNumber(dadosInquilinos.totalInquilinos)}
          subtitle={`${dadosInquilinos.inquilinosAtivos} ativos`}
          icon={Users}
          color="cyan"
          detailData={[
            { label: 'Total Cadastrados', value: formatNumber(dadosInquilinos.totalInquilinos), highlight: true },
            { label: 'Inquilinos Ativos', value: formatNumber(dadosInquilinos.inquilinosAtivos) },
            { label: 'Pessoa Física', value: formatNumber(dadosInquilinos.inquilinosPF) },
            { label: 'Pessoa Jurídica', value: formatNumber(dadosInquilinos.inquilinosPJ) },
            { label: 'Novos (30 dias)', value: formatNumber(dadosInquilinos.novosInquilinos30d) },
          ]}
        />
        <KPICard
          title="Novos Inquilinos (30d)"
          value={formatNumber(dadosInquilinos.novosInquilinos30d)}
          trend="up"
          trendValue="+12% vs periodo anterior"
          icon={UserCheck}
          color="emerald"
          detailData={[
            { label: 'Novos no Período', value: formatNumber(dadosInquilinos.novosInquilinos30d), highlight: true },
            { label: 'Contratos Assinados', value: formatNumber(dadosInquilinos.novosInquilinos30d) },
            { label: 'Em Análise', value: '0' },
            { label: 'Aguardando Documentação', value: '0' },
          ]}
        />
        <KPICard
          title="Inadimplentes"
          value={formatNumber(dadosInquilinos.inquilinosInadimplentes)}
          subtitle={`${((dadosInquilinos.inquilinosInadimplentes / dadosInquilinos.inquilinosAtivos) * 100).toFixed(1)}% da base`}
          icon={AlertTriangle}
          color="rose"
          detailData={[
            { label: 'Total Inadimplentes', value: formatNumber(dadosInquilinos.inquilinosInadimplentes), highlight: true },
            { label: 'Até 30 dias', value: formatNumber(dadosInquilinos.inadimplencia30d) },
            { label: '31 a 60 dias', value: formatNumber(dadosInquilinos.inadimplencia60d) },
            { label: 'Mais de 90 dias', value: formatNumber(dadosInquilinos.inadimplencia90d) },
            { label: 'Acordos Ativos', value: formatNumber(dadosInquilinos.acordosAtivos) },
          ]}
        />
        <KPICard
          title="Taxa de Renovacao"
          value={`${dadosInquilinos.taxaRenovacao}%`}
          trend="up"
          trendValue="+3% vs ano anterior"
          icon={Target}
          color="blue"
          detailData={[
            { label: 'Taxa de Renovação', value: `${dadosInquilinos.taxaRenovacao}%`, highlight: true },
            { label: 'Contratos Renovados (ano)', value: '0' },
            { label: 'Não Renovados', value: '0' },
            { label: 'Tempo Médio', value: `${dadosInquilinos.tempoMedioContrato} meses` },
          ]}
        />
      </div>

      {/* Segunda linha */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard
          title="Ticket Medio"
          value={formatCurrency(dadosInquilinos.ticketMedioAluguel)}
          subtitle="Aluguel medio"
          icon={DollarSign}
          color="violet"
          detailData={[
            { label: 'Ticket Médio', value: formatCurrency(dadosInquilinos.ticketMedioAluguel), highlight: true },
            { label: 'Menor Aluguel', value: 'R$ 0,00' },
            { label: 'Maior Aluguel', value: 'R$ 0,00' },
            { label: 'Mediana', value: 'R$ 0,00' },
          ]}
        />
        <KPICard title="Tempo Medio Contrato" value={`${dadosInquilinos.tempoMedioContrato} meses`} subtitle="Permanencia media" icon={Calendar} color="indigo" />
        <KPICard
          title="Satisfacao"
          value={dadosInquilinos.satisfacao.toFixed(1)}
          subtitle="De 5.0"
          icon={Star}
          color="amber"
          detailData={[
            { label: 'Nota Média', value: dadosInquilinos.satisfacao.toFixed(1), highlight: true },
            { label: 'Avaliações 5 estrelas', value: '0' },
            { label: 'Avaliações 4 estrelas', value: '0' },
            { label: 'Avaliações abaixo de 3', value: '0' },
          ]}
        />
        <KPICard
          title="Chamados Abertos"
          value={formatNumber(dadosInquilinos.chamadosSuporte - dadosInquilinos.chamadosResolvidos)}
          subtitle={`${dadosInquilinos.chamadosResolvidos} resolvidos`}
          icon={Phone}
          color="cyan"
          detailData={[
            { label: 'Chamados Abertos', value: formatNumber(dadosInquilinos.chamadosSuporte - dadosInquilinos.chamadosResolvidos), highlight: true },
            { label: 'Total Chamados', value: formatNumber(dadosInquilinos.chamadosSuporte) },
            { label: 'Resolvidos', value: formatNumber(dadosInquilinos.chamadosResolvidos) },
            { label: 'Tempo Médio Resposta', value: '0 horas' },
          ]}
        />
      </div>

      {/* Cards Detalhados */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-cyan-500" />
              Perfil dos Inquilinos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Pessoa Fisica</span>
                  <span className="font-medium">{formatNumber(dadosInquilinos.inquilinosPF)} ({((dadosInquilinos.inquilinosPF / dadosInquilinos.totalInquilinos) * 100).toFixed(0)}%)</span>
                </div>
                <Progress value={(dadosInquilinos.inquilinosPF / dadosInquilinos.totalInquilinos) * 100} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Pessoa Juridica</span>
                  <span className="font-medium">{formatNumber(dadosInquilinos.inquilinosPJ)} ({((dadosInquilinos.inquilinosPJ / dadosInquilinos.totalInquilinos) * 100).toFixed(0)}%)</span>
                </div>
                <Progress value={(dadosInquilinos.inquilinosPJ / dadosInquilinos.totalInquilinos) * 100} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <ListCard
          title="Inadimplencia por Faixa"
          icon={AlertTriangle}
          items={[
            { label: 'Ate 30 dias', value: dadosInquilinos.inadimplencia30d, status: 'warning' },
            { label: '31 a 60 dias', value: dadosInquilinos.inadimplencia60d, status: 'warning' },
            { label: 'Acima de 60 dias', value: dadosInquilinos.inadimplencia90d, status: 'danger' },
            { label: 'Acordos Ativos', value: dadosInquilinos.acordosAtivos, status: 'success' },
          ]}
        />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-emerald-500" />
              Satisfacao e Suporte
            </CardTitle>
          </CardHeader>
          <CardContent>
            {dadosInquilinos.totalInquilinos === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-2 opacity-30" />
                <p>Nenhum dado disponivel no momento</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-emerald-500/10 rounded-lg">
                  <div className="flex items-center gap-2">
                    <ThumbsUp className="h-4 w-4 text-emerald-500" />
                    <span className="text-sm">Avaliacoes Positivas</span>
                  </div>
                  <span className="font-semibold">{dadosInquilinos.avaliacoesPositivas}%</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-amber-500/10 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-amber-500" />
                    <span className="text-sm">Tempo Medio Resposta</span>
                  </div>
                  <span className="font-semibold">{dadosInquilinos.tempoMedioResposta}h</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-500/10 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-blue-500" />
                    <span className="text-sm">Taxa Resolucao</span>
                  </div>
                  <span className="font-semibold">{dadosInquilinos.taxaResolucao}%</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Dashboard Proprietarios
  const renderProprietarios = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Building className="h-6 w-6 text-indigo-500" />
          Dashboard Proprietarios
        </h2>
        <p className="text-muted-foreground">Base de locadores e indicadores</p>
      </div>

      {/* KPIs Principais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard title="Total de Proprietarios" value={formatNumber(dadosProprietarios.totalProprietarios)} subtitle={`${dadosProprietarios.proprietariosAtivos} ativos`} icon={Building} color="indigo" />
        <KPICard title="Novos Proprietarios (30d)" value={formatNumber(dadosProprietarios.novosProprietarios30d)} trend="up" trendValue="+8% vs periodo anterior" icon={UserCheck} color="emerald" />
        <KPICard title="Repasses do Mes" value={formatCurrency(dadosProprietarios.repassesMes)} subtitle="Total repassado" icon={DollarSign} color="blue" />
        <KPICard title="Satisfacao" value={dadosProprietarios.taxaSatisfacao.toFixed(1)} subtitle="De 5.0" icon={Star} color="amber" />
      </div>

      {/* Segunda linha */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard title="Imoveis/Proprietario" value={dadosProprietarios.imoveisPorProprietario.toFixed(1)} subtitle="Media" icon={Building2} color="violet" />
        <KPICard title="Rendimento Medio" value={formatCurrency(dadosProprietarios.rendimentoMedio)} subtitle="Por proprietario" icon={CircleDollarSign} color="cyan" />
        <KPICard title="Exclusivos" value={formatNumber(dadosProprietarios.proprietariosExclusivos)} subtitle={`${((dadosProprietarios.proprietariosExclusivos / dadosProprietarios.totalProprietarios) * 100).toFixed(0)}% da base`} icon={UserCheck} color="emerald" />
        <KPICard title="Pendencias Repasse" value={formatNumber(dadosProprietarios.pendenciasRepasse)} subtitle="Requer atencao" icon={AlertTriangle} color="rose" />
      </div>

      {/* Cards Detalhados */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5 text-indigo-500" />
              Perfil dos Proprietarios
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Pessoa Fisica</span>
                  <span className="font-medium">{formatNumber(dadosProprietarios.proprietariosPF)} ({((dadosProprietarios.proprietariosPF / dadosProprietarios.totalProprietarios) * 100).toFixed(0)}%)</span>
                </div>
                <Progress value={(dadosProprietarios.proprietariosPF / dadosProprietarios.totalProprietarios) * 100} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Pessoa Juridica</span>
                  <span className="font-medium">{formatNumber(dadosProprietarios.proprietariosPJ)} ({((dadosProprietarios.proprietariosPJ / dadosProprietarios.totalProprietarios) * 100).toFixed(0)}%)</span>
                </div>
                <Progress value={(dadosProprietarios.proprietariosPJ / dadosProprietarios.totalProprietarios) * 100} className="h-2" />
              </div>
              <Separator />
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Com multiplos imoveis</span>
                  <span className="font-medium">{formatNumber(dadosProprietarios.comMultiplosImoveis)}</span>
                </div>
                <Progress value={(dadosProprietarios.comMultiplosImoveis / dadosProprietarios.totalProprietarios) * 100} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <ListCard
          title="Operacional"
          icon={Activity}
          items={[
            { label: 'Solicitacoes Manutencao', value: dadosProprietarios.solicitacoesManutencao, status: 'warning' },
            { label: 'Pendencias de Repasse', value: dadosProprietarios.pendenciasRepasse, status: dadosProprietarios.pendenciasRepasse > 5 ? 'danger' : 'warning' },
            { label: 'Proprietarios Exclusivos', value: dadosProprietarios.proprietariosExclusivos, status: 'success' },
            { label: 'Novos (30d)', value: dadosProprietarios.novosProprietarios30d, status: 'success' },
          ]}
        />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-emerald-500" />
              Valor da Carteira
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-4 bg-gradient-to-r from-indigo-500/10 to-violet-500/10 rounded-lg text-center">
                <p className="text-sm text-muted-foreground">Valor Total dos Imoveis</p>
                <p className="text-2xl font-bold mt-1">{formatCurrency(dadosProprietarios.valorCarteira)}</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 bg-emerald-500/10 rounded-lg text-center">
                  <p className="text-xs text-muted-foreground">Repasses Mes</p>
                  <p className="font-semibold text-emerald-600">{formatCurrency(dadosProprietarios.repassesMes)}</p>
                </div>
                <div className="p-3 bg-blue-500/10 rounded-lg text-center">
                  <p className="text-xs text-muted-foreground">Rend. Medio</p>
                  <p className="font-semibold text-blue-600">{formatCurrency(dadosProprietarios.rendimentoMedio)}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Dashboard Garantidores
  const renderGarantidores = () => (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Shield className="h-6 w-6 text-rose-500" />
          Dashboard Garantidores
        </h2>
        <p className="text-muted-foreground">Base de garantidores e indicadores</p>
      </div>

      {/* KPIs Principais */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard title="Total de Garantidores" value={formatNumber(dadosGarantidores.totalGarantidores)} subtitle={`${dadosGarantidores.garantidoresAtivos} ativos`} icon={Shield} color="rose" />
        <KPICard title="Novos Garantidores (30d)" value={formatNumber(dadosGarantidores.novosGarantidores30d)} trend="up" trendValue="+18% vs periodo anterior" icon={UserCheck} color="emerald" />
        <KPICard title="Valor em Garantias" value={formatCurrency(dadosGarantidores.valorGarantiasAtivas)} subtitle="Total ativo" icon={DollarSign} color="blue" />
        <KPICard title="Taxa de Execucao" value={`${dadosGarantidores.taxaExecucao}%`} trend="down" trendValue="-0.2% vs ano anterior" icon={Scale} color="amber" />
      </div>

      {/* Segunda linha */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard title="Garantias Executadas" value={formatNumber(dadosGarantidores.garantiasExecutadas)} subtitle={formatCurrency(dadosGarantidores.valorExecutado)} icon={AlertTriangle} color="rose" />
        <KPICard title="Score Medio" value={dadosGarantidores.scoreMedio} subtitle={`Min: ${dadosGarantidores.scoreMin}`} icon={Target} color="violet" />
        <KPICard title="Vencendo (30d)" value={formatNumber(dadosGarantidores.garantiasVencendo30d)} subtitle="Requer atencao" icon={Clock} color="amber" />
        <KPICard title="Pendentes Analise" value={formatNumber(dadosGarantidores.pendentesAnalise)} subtitle="Aguardando aprovacao" icon={Eye} color="cyan" />
      </div>

      {/* Cards Detalhados */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-rose-500" />
              Perfil dos Garantidores
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Pessoa Fisica</span>
                  <span className="font-medium">{formatNumber(dadosGarantidores.garantidoresPF)} ({((dadosGarantidores.garantidoresPF / dadosGarantidores.totalGarantidores) * 100).toFixed(0)}%)</span>
                </div>
                <Progress value={(dadosGarantidores.garantidoresPF / dadosGarantidores.totalGarantidores) * 100} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Pessoa Juridica</span>
                  <span className="font-medium">{formatNumber(dadosGarantidores.garantidoresPJ)} ({((dadosGarantidores.garantidoresPJ / dadosGarantidores.totalGarantidores) * 100).toFixed(0)}%)</span>
                </div>
                <Progress value={(dadosGarantidores.garantidoresPJ / dadosGarantidores.totalGarantidores) * 100} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        <ListCard
          title="Analise de Garantidores"
          icon={Eye}
          items={[
            { label: 'Pendentes Analise', value: dadosGarantidores.pendentesAnalise, status: 'warning' },
            { label: 'Aprovados (30d)', value: dadosGarantidores.aprovados30d, status: 'success' },
            { label: 'Reprovados (30d)', value: dadosGarantidores.reprovados30d, status: 'danger' },
            { label: 'Garantias Vencendo', value: dadosGarantidores.garantiasVencendo30d, status: 'warning' },
          ]}
        />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Scale className="h-5 w-5 text-amber-500" />
              Execucao de Garantias
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-4 bg-gradient-to-r from-rose-500/10 to-amber-500/10 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm">Garantias Executadas</span>
                  <Badge variant="destructive">{dadosGarantidores.garantiasExecutadas}</Badge>
                </div>
                <p className="text-xl font-bold">{formatCurrency(dadosGarantidores.valorExecutado)}</p>
                <p className="text-xs text-muted-foreground mt-1">Taxa: {dadosGarantidores.taxaExecucao}%</p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 bg-emerald-500/10 rounded-lg text-center">
                  <p className="text-xs text-muted-foreground">Score Medio</p>
                  <p className="font-semibold text-emerald-600">{dadosGarantidores.scoreMedio}</p>
                </div>
                <div className="p-3 bg-amber-500/10 rounded-lg text-center">
                  <p className="text-xs text-muted-foreground">Score Min.</p>
                  <p className="font-semibold text-amber-600">{dadosGarantidores.scoreMin}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  // Renderizar dashboard selecionada
  const renderSelectedDashboard = () => {
    switch (selectedDashboard) {
      case 'financeira':
        return renderFinanceira();
      case 'locacao':
        return renderLocacao();
      case 'servicos':
        return renderServicos();
      case 'seguradora':
        return renderSeguradora();
      case 'inquilinos':
        return renderInquilinos();
      case 'proprietarios':
        return renderProprietarios();
      case 'garantidores':
        return renderGarantidores();
      default:
        return renderFinanceira();
    }
  };

  // Obter cor do item selecionado
  const getColorClasses = (color: string, isSelected: boolean) => {
    const colors: Record<string, { bg: string; text: string; border: string }> = {
      emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-500', border: 'border-emerald-500' },
      blue: { bg: 'bg-blue-500/10', text: 'text-blue-500', border: 'border-blue-500' },
      violet: { bg: 'bg-violet-500/10', text: 'text-violet-500', border: 'border-violet-500' },
      amber: { bg: 'bg-amber-500/10', text: 'text-amber-500', border: 'border-amber-500' },
      cyan: { bg: 'bg-cyan-500/10', text: 'text-cyan-500', border: 'border-cyan-500' },
      indigo: { bg: 'bg-indigo-500/10', text: 'text-indigo-500', border: 'border-indigo-500' },
      rose: { bg: 'bg-rose-500/10', text: 'text-rose-500', border: 'border-rose-500' },
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="flex h-full">
      {/* Menu Vertical de Selecao */}
      <aside className={cn('w-64 border-r flex-shrink-0', theme.borderPrimary, theme.bgSidebar)}>
        <div className="p-4 border-b">
          <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Dashboards</h3>
        </div>
        <ScrollArea className="h-[calc(100%-60px)]">
          <nav className="p-2 space-y-1">
            {dashboardMenuItems.map((item) => {
              const Icon = item.icon;
              const isSelected = selectedDashboard === item.id;
              const colorClasses = getColorClasses(item.color, isSelected);

              return (
                <button
                  key={item.id}
                  onClick={() => setSelectedDashboard(item.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-all',
                    isSelected ? cn(colorClasses.bg, 'border-l-4', colorClasses.border) : 'hover:bg-muted/50 border-l-4 border-transparent'
                  )}
                >
                  <div className={cn('p-2 rounded-lg', isSelected ? colorClasses.bg : 'bg-muted')}>
                    <Icon className={cn('h-4 w-4', isSelected ? colorClasses.text : 'text-muted-foreground')} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={cn('font-medium text-sm', isSelected ? colorClasses.text : '')}>{item.label}</p>
                    <p className="text-xs text-muted-foreground truncate">{item.description}</p>
                  </div>
                  {isSelected && <ChevronRight className={cn('h-4 w-4', colorClasses.text)} />}
                </button>
              );
            })}
          </nav>
        </ScrollArea>
      </aside>

      {/* Conteudo da Dashboard */}
      <main className="flex-1 overflow-auto">
        <ScrollArea className="h-full">
          <div className="p-6">{renderSelectedDashboard()}</div>
        </ScrollArea>
      </main>

      {/* Modal de Detalhes */}
      {detailModal.open && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                {detailModal.title}
              </CardTitle>
              <CardDescription>
                Detalhes e informações complementares
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {detailModal.data.map((item, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      'flex items-center justify-between p-3 rounded-lg',
                      item.highlight ? 'bg-primary/10' : 'bg-muted/50'
                    )}
                  >
                    <span className="text-sm">{item.label}</span>
                    <span className={cn('font-semibold', item.highlight && 'text-primary')}>
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
            <div className="flex justify-end gap-2 p-4 border-t">
              <Button variant="outline" onClick={() => setDetailModal({ ...detailModal, open: false })}>
                Fechar
              </Button>
              <Button onClick={() => setDetailModal({ ...detailModal, open: false })}>
                Ver Formulário Completo
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

export default DashboardsConsultivas;
