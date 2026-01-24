/**
 * Vinculo.io - Contas a Receber
 *
 * Formulario para gerenciamento de contas a receber:
 * - Comissoes
 * - Setups (taxa de setup de contrato)
 * - Intermediacoes com prestadores de servico
 *
 * Funcionalidades:
 * - Cadastro de nova conta a receber
 * - Selecao de tipo (comissao, setup, intermediacao)
 * - Selecao de pagador (prestador, seguradora, inquilino, proprietario)
 * - Geracao de titulo para pagamento (gateway/contas)
 * - Baixa automatica com taxas de intermediacao
 * - Lancamento automatico de setup no fechamento do processo
 * - Notificacao de taxas aos clientes
 */

import { useState, useCallback, useMemo } from 'react';
import {
  Receipt,
  Plus,
  Search,
  Eye,
  MoreVertical,
  Calendar,
  DollarSign,
  CreditCard,
  Building2,
  AlertCircle,
  CheckCircle2,
  Clock,
  Wallet,
  Banknote,
  QrCode,
  Bitcoin,
  ArrowRightLeft,
  Filter,
  Download,
  Percent,
  TrendingUp,
  TrendingDown,
  Users,
  FileText,
  Send,
  Copy,
  Check,
  X,
  RefreshCw,
  Zap,
  Shield,
  HandCoins,
  Landmark,
  SplitSquareHorizontal,
  Wrench,
  Settings,
  Bell,
  Mail,
  User,
  Briefcase,
  Home,
  FileCheck,
  Hash,
  CalendarDays,
  BadgeDollarSign,
  ArrowRight,
  Link,
  ExternalLink,
  Trash2,
  Edit,
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';

// ============================================
// TYPES
// ============================================

import { type TipoReceita, MOCK_TIPOS_RECEITA, LINHAS_DRE_RECEITA } from './tipos-receita-form';

type TipoConta = 'comissao' | 'setup' | 'intermediacao';
type TipoPagador = 'prestador' | 'seguradora' | 'inquilino' | 'proprietario' | 'garantidor' | 'imobiliaria';
type FormaPagamento = 'pix' | 'cripto' | 'cartao' | 'boleto';
type StatusConta = 'pendente' | 'pago' | 'vencido' | 'parcial' | 'processando' | 'cancelado';
type ContaContabil = 'receita_comissao' | 'receita_setup' | 'receita_intermediacao' | 'receita_taxa_servico' | 'receita_outras';

interface TaxasPagamento {
  taxaGateway: number;
  taxaGas: number;
  totalTaxas: number;
}

interface Pagador {
  id: string;
  tipo: TipoPagador;
  nome: string;
  documento: string;
  email: string;
  telefone: string;
}

interface ContaReceber {
  id: string;
  numero: string; // Numero do titulo

  // Tipo e Categoria
  tipo: TipoConta;
  tipoReceitaId?: string; // ID do tipo de receita cadastrado
  tipoReceitaCodigo?: string; // Codigo do tipo de receita
  contaContabil: ContaContabil;
  descricao: string;

  // Pagador
  pagadorId: string;
  pagadorTipo: TipoPagador;
  pagadorNome: string;
  pagadorDocumento: string;
  pagadorEmail: string;

  // Vinculo (opcional)
  contratoId?: string;
  imovelId?: string;
  imovelEndereco?: string;
  servicoId?: string;
  servicoDescricao?: string;

  // Valores
  valor: number;
  valorPago?: number;
  taxas?: TaxasPagamento;

  // Datas
  dataEmissao: string;
  dataVencimento: string;
  dataPagamento?: string;

  // Pagamento
  formaPagamento?: FormaPagamento;
  status: StatusConta;

  // Titulo gerado
  linkPagamento?: string;
  qrCodePix?: string;
  boletoCodigo?: string;
  walletCripto?: string;
  txHashCripto?: string;

  // Lancamentos
  lancamentoCaixaId?: string;
  lancamentoContabilId?: string;

  // Notificacoes
  notificacaoEnviada: boolean;
  dataNotificacao?: string;

  // Metadata
  observacoes?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface SetupContrato {
  id: string;
  contratoId: string;
  imovelEndereco: string;
  inquilinoNome: string;
  locadorNome: string;
  garantidorNome?: string;
  dataFechamento: string;
  taxaSetupInquilino: number;
  taxaSetupLocador: number;
  taxaSetupGarantidor: number;
  status: 'pendente' | 'processado';
  contasGeradas: string[];
}

// ============================================
// CONFIGURACAO
// ============================================

const TAXAS_CONFIG = {
  pix: {
    taxaGateway: 0.0099, // 0.99%
    taxaFixa: 0,
    descricao: 'Taxa PIX',
    quemPaga: 'plataforma' as const,
  },
  boleto: {
    taxaGateway: 0.0150, // 1.50%
    taxaFixa: 3.50,
    descricao: 'Taxa Boleto',
    quemPaga: 'plataforma' as const,
  },
  cartao: {
    taxaGateway: 0.0399, // 3.99%
    taxaFixa: 0,
    descricao: 'Taxa Cartao',
    quemPaga: 'cliente' as const,
  },
  cripto: {
    taxaGateway: 0.005, // 0.5%
    taxaGas: 0.50,
    descricao: 'Taxa Gas Polygon',
    quemPaga: 'plataforma' as const,
    desconto: 0.05,
  },
};

const CONTAS_CONTABEIS: { value: ContaContabil; label: string }[] = [
  { value: 'receita_comissao', label: 'Receita de Comissao' },
  { value: 'receita_setup', label: 'Receita de Setup' },
  { value: 'receita_intermediacao', label: 'Receita de Intermediacao' },
  { value: 'receita_taxa_servico', label: 'Receita de Taxa de Servico' },
  { value: 'receita_outras', label: 'Outras Receitas' },
];

const TIPOS_CONTA: { value: TipoConta; label: string; icon: React.ElementType; color: string }[] = [
  { value: 'comissao', label: 'Comissao', icon: Percent, color: 'text-purple-400' },
  { value: 'setup', label: 'Setup de Contrato', icon: Settings, color: 'text-blue-400' },
  { value: 'intermediacao', label: 'Intermediacao', icon: ArrowRightLeft, color: 'text-amber-600' },
];

const TIPOS_PAGADOR: { value: TipoPagador; label: string; icon: React.ElementType }[] = [
  { value: 'prestador', label: 'Prestador de Servico', icon: Wrench },
  { value: 'seguradora', label: 'Seguradora', icon: Shield },
  { value: 'inquilino', label: 'Inquilino', icon: User },
  { value: 'proprietario', label: 'Proprietario/Locador', icon: Home },
  { value: 'garantidor', label: 'Garantidor', icon: HandCoins },
  { value: 'imobiliaria', label: 'Imobiliaria', icon: Building2 },
];

// ============================================
// MOCK DATA
// ============================================

// ============================================
// DADOS VAZIOS PARA PRODUCAO
// ============================================

const MOCK_PAGADORES: Pagador[] = [];

const MOCK_CONTAS: ContaReceber[] = [];

const MOCK_SETUPS_PENDENTES: SetupContrato[] = [];

// ============================================
// HELPER FUNCTIONS
// ============================================

function calcularTaxas(valor: number, formaPagamento: FormaPagamento): TaxasPagamento {
  const config = TAXAS_CONFIG[formaPagamento];
  let taxaGateway = valor * config.taxaGateway;
  if ('taxaFixa' in config) {
    taxaGateway += config.taxaFixa;
  }
  const taxaGas = formaPagamento === 'cripto' ? TAXAS_CONFIG.cripto.taxaGas : 0;
  return {
    taxaGateway,
    taxaGas,
    totalTaxas: taxaGateway + taxaGas,
  };
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('pt-BR');
}

function generateNumeroTitulo(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
  return `CR-${year}-${random}`;
}

// ============================================
// COMPONENT
// ============================================

export function ContasReceberForm() {
  // State
  const [contas, setContas] = useState<ContaReceber[]>(MOCK_CONTAS);
  const [setupsPendentes, setSetupsPendentes] = useState<SetupContrato[]>(MOCK_SETUPS_PENDENTES);
  const [filtroTipo, setFiltroTipo] = useState<string>('all');
  const [filtroStatus, setFiltroStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'contas' | 'setups'>('contas');

  // Dialogs
  const [novaContaDialogOpen, setNovaContaDialogOpen] = useState(false);
  const [pagamentoDialogOpen, setPagamentoDialogOpen] = useState(false);
  const [detalhesSheetOpen, setDetalhesSheetOpen] = useState(false);
  const [notificacaoDialogOpen, setNotificacaoDialogOpen] = useState(false);
  const [processarSetupDialogOpen, setProcessarSetupDialogOpen] = useState(false);
  const [novoPagadorDialogOpen, setNovoPagadorDialogOpen] = useState(false);
  const [selectedConta, setSelectedConta] = useState<ContaReceber | null>(null);
  const [selectedSetup, setSelectedSetup] = useState<SetupContrato | null>(null);

  // State para lista de pagadores (mutavel)
  const [pagadores, setPagadores] = useState<Pagador[]>(MOCK_PAGADORES);

  // Form state para novo pagador
  const [novoPagadorForm, setNovoPagadorForm] = useState({
    tipo: 'inquilino' as TipoPagador,
    nome: '',
    documento: '',
    email: '',
    telefone: '',
  });

  // State para tipos de receita
  const [tiposReceita] = useState<TipoReceita[]>(MOCK_TIPOS_RECEITA);

  // Form state para nova conta
  const [novaContaForm, setNovaContaForm] = useState({
    tipo: 'comissao' as TipoConta,
    tipoReceitaId: '',
    contaContabil: 'receita_comissao' as ContaContabil,
    descricao: '',
    pagadorId: '',
    valor: '',
    dataVencimento: '',
    observacoes: '',
    gerarTitulo: true,
    enviarNotificacao: true,
  });

  // Pagamento
  const [formaPagamentoSelecionada, setFormaPagamentoSelecionada] = useState<FormaPagamento>('pix');
  const [processandoPagamento, setProcessandoPagamento] = useState(false);
  const [processandoSetup, setProcessandoSetup] = useState(false);

  // Calculo de KPIs
  const kpis = useMemo(() => {
    const totalAReceber = contas
      .filter(c => c.status === 'pendente' || c.status === 'vencido')
      .reduce((acc, c) => acc + c.valor, 0);

    const totalRecebido = contas
      .filter(c => c.status === 'pago')
      .reduce((acc, c) => acc + (c.valorPago || 0), 0);

    const totalVencido = contas
      .filter(c => c.status === 'vencido')
      .reduce((acc, c) => acc + c.valor, 0);

    const taxasRecolhidas = contas
      .filter(c => c.status === 'pago' && c.taxas)
      .reduce((acc, c) => acc + (c.taxas?.totalTaxas || 0), 0);

    const porTipo = {
      comissao: contas.filter(c => c.tipo === 'comissao').reduce((acc, c) => acc + c.valor, 0),
      setup: contas.filter(c => c.tipo === 'setup').reduce((acc, c) => acc + c.valor, 0),
      intermediacao: contas.filter(c => c.tipo === 'intermediacao').reduce((acc, c) => acc + c.valor, 0),
    };

    const setupsPendentesTotal = setupsPendentes
      .filter(s => s.status === 'pendente')
      .reduce((acc, s) => acc + s.taxaSetupInquilino + s.taxaSetupLocador + s.taxaSetupGarantidor, 0);

    return {
      totalAReceber,
      totalRecebido,
      totalVencido,
      taxasRecolhidas,
      porTipo,
      setupsPendentesTotal,
      setupsPendentesCount: setupsPendentes.filter(s => s.status === 'pendente').length,
    };
  }, [contas, setupsPendentes]);

  // Filtrar contas
  const contasFiltradas = useMemo(() => {
    return contas.filter(c => {
      const matchTipo = filtroTipo === 'all' || c.tipo === filtroTipo;
      const matchStatus = filtroStatus === 'all' || c.status === filtroStatus;
      const matchSearch = searchTerm === '' ||
        c.pagadorNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.numero.toLowerCase().includes(searchTerm.toLowerCase());

      return matchTipo && matchStatus && matchSearch;
    });
  }, [contas, filtroTipo, filtroStatus, searchTerm]);

  // Abrir dialog de nova conta
  const handleNovaContaOpen = useCallback(() => {
    setNovaContaForm({
      tipo: 'comissao',
      tipoReceitaId: '',
      contaContabil: 'receita_comissao',
      descricao: '',
      pagadorId: '',
      valor: '',
      dataVencimento: '',
      observacoes: '',
      gerarTitulo: true,
      enviarNotificacao: true,
    });
    setNovaContaDialogOpen(true);
  }, []);

  // Criar nova conta
  const handleCriarConta = useCallback(() => {
    const pagador = MOCK_PAGADORES.find(p => p.id === novaContaForm.pagadorId);
    if (!pagador) return;

    // Buscar tipo de receita selecionado
    const tipoReceitaSelecionado = tiposReceita.find(tr => tr.id === novaContaForm.tipoReceitaId);

    const novaConta: ContaReceber = {
      id: `cr_${Date.now()}`,
      numero: generateNumeroTitulo(),
      tipo: novaContaForm.tipo,
      tipoReceitaId: novaContaForm.tipoReceitaId || undefined,
      tipoReceitaCodigo: tipoReceitaSelecionado?.codigo,
      contaContabil: novaContaForm.contaContabil,
      descricao: novaContaForm.descricao,
      pagadorId: pagador.id,
      pagadorTipo: pagador.tipo,
      pagadorNome: pagador.nome,
      pagadorDocumento: pagador.documento,
      pagadorEmail: pagador.email,
      valor: parseFloat(novaContaForm.valor) || 0,
      dataEmissao: new Date().toISOString().split('T')[0],
      dataVencimento: novaContaForm.dataVencimento,
      status: 'pendente',
      linkPagamento: novaContaForm.gerarTitulo ? `https://pay.vinculobrasil.com.br/cr_${Date.now()}` : undefined,
      qrCodePix: novaContaForm.gerarTitulo ? '00020126580014br.gov.bcb.pix...' : undefined,
      notificacaoEnviada: novaContaForm.enviarNotificacao,
      dataNotificacao: novaContaForm.enviarNotificacao ? new Date().toISOString().split('T')[0] : undefined,
      observacoes: novaContaForm.observacoes,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setContas(prev => [novaConta, ...prev]);
    setNovaContaDialogOpen(false);
  }, [novaContaForm, tiposReceita]);

  // Processar pagamento
  const handleProcessarPagamento = useCallback(async () => {
    if (!selectedConta) return;

    setProcessandoPagamento(true);
    await new Promise(resolve => setTimeout(resolve, 2000));

    const taxas = calcularTaxas(selectedConta.valor, formaPagamentoSelecionada);

    setContas(prev => prev.map(c => {
      if (c.id === selectedConta.id) {
        return {
          ...c,
          status: 'pago' as StatusConta,
          formaPagamento: formaPagamentoSelecionada,
          valorPago: selectedConta.valor,
          dataPagamento: new Date().toISOString().split('T')[0],
          taxas,
          lancamentoCaixaId: `lcx_${Date.now()}`,
          lancamentoContabilId: `lct_${Date.now()}`,
          updatedAt: new Date(),
        };
      }
      return c;
    }));

    setProcessandoPagamento(false);
    setPagamentoDialogOpen(false);
    setSelectedConta(null);
  }, [selectedConta, formaPagamentoSelecionada]);

  // Processar setup de contrato - gera contas automaticamente
  const handleProcessarSetup = useCallback(async () => {
    if (!selectedSetup) return;

    setProcessandoSetup(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    const contasGeradas: ContaReceber[] = [];
    const dataVencimento = new Date();
    dataVencimento.setDate(dataVencimento.getDate() + 7); // Vencimento em 7 dias

    // Conta para Inquilino
    if (selectedSetup.taxaSetupInquilino > 0) {
      contasGeradas.push({
        id: `cr_${Date.now()}_inq`,
        numero: generateNumeroTitulo(),
        tipo: 'setup',
        contaContabil: 'receita_setup',
        descricao: `Taxa de Setup - ${selectedSetup.imovelEndereco}`,
        pagadorId: `pag_inq_${selectedSetup.contratoId}`,
        pagadorTipo: 'inquilino',
        pagadorNome: selectedSetup.inquilinoNome,
        pagadorDocumento: '***.***.***-**',
        pagadorEmail: 'inquilino@email.com',
        contratoId: selectedSetup.contratoId,
        imovelEndereco: selectedSetup.imovelEndereco,
        valor: selectedSetup.taxaSetupInquilino,
        dataEmissao: new Date().toISOString().split('T')[0],
        dataVencimento: dataVencimento.toISOString().split('T')[0],
        status: 'pendente',
        linkPagamento: `https://pay.vinculobrasil.com.br/cr_${Date.now()}_inq`,
        qrCodePix: '00020126580014br.gov.bcb.pix...',
        notificacaoEnviada: true,
        dataNotificacao: new Date().toISOString().split('T')[0],
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    // Conta para Locador
    if (selectedSetup.taxaSetupLocador > 0) {
      contasGeradas.push({
        id: `cr_${Date.now()}_loc`,
        numero: generateNumeroTitulo(),
        tipo: 'setup',
        contaContabil: 'receita_setup',
        descricao: `Taxa de Setup - ${selectedSetup.imovelEndereco}`,
        pagadorId: `pag_loc_${selectedSetup.contratoId}`,
        pagadorTipo: 'proprietario',
        pagadorNome: selectedSetup.locadorNome,
        pagadorDocumento: '***.***.***-**',
        pagadorEmail: 'locador@email.com',
        contratoId: selectedSetup.contratoId,
        imovelEndereco: selectedSetup.imovelEndereco,
        valor: selectedSetup.taxaSetupLocador,
        dataEmissao: new Date().toISOString().split('T')[0],
        dataVencimento: dataVencimento.toISOString().split('T')[0],
        status: 'pendente',
        linkPagamento: `https://pay.vinculobrasil.com.br/cr_${Date.now()}_loc`,
        qrCodePix: '00020126580014br.gov.bcb.pix...',
        notificacaoEnviada: true,
        dataNotificacao: new Date().toISOString().split('T')[0],
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    // Conta para Garantidor (se houver)
    if (selectedSetup.garantidorNome && selectedSetup.taxaSetupGarantidor > 0) {
      contasGeradas.push({
        id: `cr_${Date.now()}_gar`,
        numero: generateNumeroTitulo(),
        tipo: 'setup',
        contaContabil: 'receita_setup',
        descricao: `Taxa de Setup - ${selectedSetup.imovelEndereco}`,
        pagadorId: `pag_gar_${selectedSetup.contratoId}`,
        pagadorTipo: 'garantidor',
        pagadorNome: selectedSetup.garantidorNome,
        pagadorDocumento: '***.***.***-**',
        pagadorEmail: 'garantidor@email.com',
        contratoId: selectedSetup.contratoId,
        imovelEndereco: selectedSetup.imovelEndereco,
        valor: selectedSetup.taxaSetupGarantidor,
        dataEmissao: new Date().toISOString().split('T')[0],
        dataVencimento: dataVencimento.toISOString().split('T')[0],
        status: 'pendente',
        linkPagamento: `https://pay.vinculobrasil.com.br/cr_${Date.now()}_gar`,
        qrCodePix: '00020126580014br.gov.bcb.pix...',
        notificacaoEnviada: true,
        dataNotificacao: new Date().toISOString().split('T')[0],
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    // Adicionar contas
    setContas(prev => [...contasGeradas, ...prev]);

    // Marcar setup como processado
    setSetupsPendentes(prev => prev.map(s => {
      if (s.id === selectedSetup.id) {
        return { ...s, status: 'processado' as const, contasGeradas: contasGeradas.map(c => c.id) };
      }
      return s;
    }));

    setProcessandoSetup(false);
    setProcessarSetupDialogOpen(false);
    setSelectedSetup(null);
  }, [selectedSetup]);

  // Enviar notificacao
  const handleEnviarNotificacao = useCallback(() => {
    if (!selectedConta) return;

    setContas(prev => prev.map(c => {
      if (c.id === selectedConta.id) {
        return {
          ...c,
          notificacaoEnviada: true,
          dataNotificacao: new Date().toISOString().split('T')[0],
          updatedAt: new Date(),
        };
      }
      return c;
    }));

    setNotificacaoDialogOpen(false);
    setSelectedConta(null);
  }, [selectedConta]);

  // Status badge
  const getStatusBadge = (status: StatusConta) => {
    const configs = {
      pendente: { label: 'Pendente', className: 'bg-amber-500/10 text-amber-400' },
      pago: { label: 'Pago', className: 'bg-emerald-500/10 text-emerald-400' },
      vencido: { label: 'Vencido', className: 'bg-red-500/10 text-red-400' },
      parcial: { label: 'Parcial', className: 'bg-orange-500/10 text-orange-400' },
      processando: { label: 'Processando', className: 'bg-blue-500/10 text-blue-400' },
      cancelado: { label: 'Cancelado', className: 'bg-card text-foreground' },
    };
    const config = configs[status];
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  // Tipo badge
  const getTipoBadge = (tipo: TipoConta) => {
    const configs = {
      comissao: { label: 'Comissao', className: 'bg-purple-500/10 text-purple-400' },
      setup: { label: 'Setup', className: 'bg-blue-500/10 text-blue-400' },
      intermediacao: { label: 'Intermediacao', className: 'bg-amber-100 text-amber-800' },
    };
    const config = configs[tipo];
    return <Badge variant="outline" className={config.className}>{config.label}</Badge>;
  };

  // Pagador icon
  const getPagadorIcon = (tipo: TipoPagador) => {
    const config = TIPOS_PAGADOR.find(t => t.value === tipo);
    if (!config) return <User className="h-4 w-4" />;
    const Icon = config.icon;
    return <Icon className="h-4 w-4" />;
  };

  // Forma pagamento icon
  const getFormaPagamentoIcon = (forma?: FormaPagamento) => {
    const icons = {
      pix: <QrCode className="h-4 w-4" />,
      cripto: <Bitcoin className="h-4 w-4" />,
      cartao: <CreditCard className="h-4 w-4" />,
      boleto: <Banknote className="h-4 w-4" />,
    };
    return forma ? icons[forma] : null;
  };

  // Preview de taxas
  const previewTaxas = useMemo(() => {
    if (!selectedConta) return null;
    return calcularTaxas(selectedConta.valor, formaPagamentoSelecionada);
  }, [selectedConta, formaPagamentoSelecionada]);

  // Pagadores filtrados por tipo de conta
  const pagadoresFiltrados = useMemo(() => {
    return pagadores;
  }, [pagadores]);

  // Abrir dialog de novo pagador
  const handleNovoPagadorOpen = useCallback(() => {
    setNovoPagadorForm({
      tipo: 'inquilino',
      nome: '',
      documento: '',
      email: '',
      telefone: '',
    });
    setNovoPagadorDialogOpen(true);
  }, []);

  // Criar novo pagador
  const handleCriarPagador = useCallback(() => {
    const novoPagador: Pagador = {
      id: `pag_${Date.now()}`,
      tipo: novoPagadorForm.tipo,
      nome: novoPagadorForm.nome,
      documento: novoPagadorForm.documento,
      email: novoPagadorForm.email,
      telefone: novoPagadorForm.telefone,
    };

    setPagadores(prev => [novoPagador, ...prev]);
    setNovoPagadorDialogOpen(false);

    // Auto-selecionar o pagador recem criado no form de nova conta
    if (novaContaDialogOpen) {
      setNovaContaForm(prev => ({ ...prev, pagadorId: novoPagador.id }));
    }
  }, [novoPagadorForm, novaContaDialogOpen]);

  return (
    <div className="bg-background text-foreground font-sans">
      <div className="max-w-7xl mx-auto p-8 space-y-6 pb-16">
          {/* Header */}
          <div className="flex justify-between items-center border-b border-border pb-6">
            <div>
              <h1 className="text-3xl font-black tracking-tight">CONTAS A RECEBER</h1>
              <p className="text-muted-foreground text-sm mt-1">Comissoes, setups e intermediacoes</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="border-border">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
              <Button onClick={handleNovaContaOpen} className="bg-indigo-600 hover:bg-indigo-700">
                <Plus className="h-4 w-4 mr-2" />
                Nova Conta
              </Button>
            </div>
          </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/10 rounded-lg">
                <Clock className="h-5 w-5 text-amber-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">A Receber</p>
                <p className="text-xl font-bold">{formatCurrency(kpis.totalAReceber)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/10 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Recebido</p>
                <p className="text-xl font-bold">{formatCurrency(kpis.totalRecebido)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-500/10 rounded-lg">
                <AlertCircle className="h-5 w-5 text-red-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Vencido</p>
                <p className="text-xl font-bold">{formatCurrency(kpis.totalVencido)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Percent className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Comissoes</p>
                <p className="text-xl font-bold">{formatCurrency(kpis.porTipo.comissao)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <Settings className="h-5 w-5 text-blue-400" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Setups</p>
                <p className="text-xl font-bold">{formatCurrency(kpis.porTipo.setup)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className={kpis.setupsPendentesCount > 0 ? 'border-amber-300 bg-amber-50' : ''}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${kpis.setupsPendentesCount > 0 ? 'bg-amber-200' : 'bg-card'}`}>
                <FileCheck className={`h-5 w-5 ${kpis.setupsPendentesCount > 0 ? 'text-amber-700' : 'text-muted-foreground'}`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Setups Pendentes</p>
                <p className="text-xl font-bold">{kpis.setupsPendentesCount}</p>
                {kpis.setupsPendentesCount > 0 && (
                  <p className="text-xs text-amber-600">{formatCurrency(kpis.setupsPendentesTotal)}</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'contas' | 'setups')}>
        <TabsList>
          <TabsTrigger value="contas" className="flex items-center gap-2">
            <Receipt className="h-4 w-4" />
            Contas a Receber
            <Badge variant="secondary" className="ml-1">{contas.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="setups" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Setups de Contrato
            {kpis.setupsPendentesCount > 0 && (
              <Badge className="ml-1 bg-amber-500">{kpis.setupsPendentesCount}</Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="contas" className="mt-4">
          {/* Filtros */}
          <Card className="mb-4">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por pagador, descricao ou numero..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os Tipos</SelectItem>
                      <SelectItem value="comissao">Comissao</SelectItem>
                      <SelectItem value="setup">Setup</SelectItem>
                      <SelectItem value="intermediacao">Intermediacao</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={filtroStatus} onValueChange={setFiltroStatus}>
                    <SelectTrigger className="w-[140px]">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="pendente">Pendente</SelectItem>
                      <SelectItem value="pago">Pago</SelectItem>
                      <SelectItem value="vencido">Vencido</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabela de Contas */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Titulos a Receber
              </CardTitle>
              <CardDescription>
                {contasFiltradas.length} contas encontradas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Numero</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Pagador</TableHead>
                      <TableHead>Descricao</TableHead>
                      <TableHead>Vencimento</TableHead>
                      <TableHead className="text-right">Valor</TableHead>
                      <TableHead>Notificacao</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Acoes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contasFiltradas.map((conta) => (
                      <TableRow key={conta.id} className="group">
                        <TableCell>
                          <p className="font-mono text-sm">{conta.numero}</p>
                        </TableCell>
                        <TableCell>
                          <div>
                            {getTipoBadge(conta.tipo)}
                            {conta.tipoReceitaCodigo && (
                              <p className="text-[10px] text-muted-foreground mt-1 font-mono">
                                {conta.tipoReceitaCodigo}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getPagadorIcon(conta.pagadorTipo)}
                            <div>
                              <p className="font-medium text-sm">{conta.pagadorNome}</p>
                              <p className="text-xs text-muted-foreground capitalize">{conta.pagadorTipo}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="text-sm max-w-[200px] truncate">{conta.descricao}</p>
                          {conta.imovelEndereco && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Home className="h-3 w-3" />
                              {conta.imovelEndereco}
                            </p>
                          )}
                        </TableCell>
                        <TableCell>
                          <p className="text-sm">{formatDate(conta.dataVencimento)}</p>
                        </TableCell>
                        <TableCell className="text-right">
                          <p className="font-bold">{formatCurrency(conta.valor)}</p>
                          {conta.valorPago && conta.status === 'pago' && (
                            <p className="text-xs text-emerald-400">
                              Pago: {formatCurrency(conta.valorPago)}
                            </p>
                          )}
                        </TableCell>
                        <TableCell>
                          {conta.notificacaoEnviada ? (
                            <Badge variant="outline" className="text-emerald-400 border-green-200">
                              <Mail className="h-3 w-3 mr-1" />
                              Enviada
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-muted-foreground">
                              <Bell className="h-3 w-3 mr-1" />
                              Pendente
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(conta.status)}
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => {
                                setSelectedConta(conta);
                                setDetalhesSheetOpen(true);
                              }}>
                                <Eye className="h-4 w-4 mr-2" />
                                Ver Detalhes
                              </DropdownMenuItem>
                              {(conta.status === 'pendente' || conta.status === 'vencido') && (
                                <DropdownMenuItem onClick={() => {
                                  setSelectedConta(conta);
                                  setFormaPagamentoSelecionada('pix');
                                  setPagamentoDialogOpen(true);
                                }}>
                                  <DollarSign className="h-4 w-4 mr-2" />
                                  Registrar Pagamento
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuSeparator />
                              {conta.linkPagamento && (
                                <DropdownMenuItem>
                                  <Copy className="h-4 w-4 mr-2" />
                                  Copiar Link de Pagamento
                                </DropdownMenuItem>
                              )}
                              {!conta.notificacaoEnviada && (
                                <DropdownMenuItem onClick={() => {
                                  setSelectedConta(conta);
                                  setNotificacaoDialogOpen(true);
                                }}>
                                  <Send className="h-4 w-4 mr-2" />
                                  Enviar Notificacao
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem>
                                <Mail className="h-4 w-4 mr-2" />
                                Reenviar Cobranca
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="setups" className="mt-4">
          {/* Setups de Contrato Pendentes */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Setups de Contrato Pendentes
              </CardTitle>
              <CardDescription>
                Contratos fechados aguardando geracao de taxas de setup
              </CardDescription>
            </CardHeader>
            <CardContent>
              {setupsPendentes.filter(s => s.status === 'pendente').length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <FileCheck className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p>Nenhum setup pendente</p>
                  <p className="text-sm">Todos os contratos foram processados</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {setupsPendentes.filter(s => s.status === 'pendente').map((setup) => (
                    <Card key={setup.id} className="border-amber-200 bg-amber-50">
                      <CardContent className="pt-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className="bg-amber-500">Novo Contrato</Badge>
                              <p className="text-sm text-muted-foreground">
                                Fechado em {formatDate(setup.dataFechamento)}
                              </p>
                            </div>
                            <h4 className="font-bold text-lg">{setup.imovelEndereco}</h4>
                            <div className="flex flex-wrap gap-4 mt-2 text-sm">
                              <span className="flex items-center gap-1">
                                <User className="h-4 w-4 text-muted-foreground" />
                                {setup.inquilinoNome}
                              </span>
                              <span className="flex items-center gap-1">
                                <Home className="h-4 w-4 text-muted-foreground" />
                                {setup.locadorNome}
                              </span>
                              {setup.garantidorNome && (
                                <span className="flex items-center gap-1">
                                  <HandCoins className="h-4 w-4 text-muted-foreground" />
                                  {setup.garantidorNome}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-col md:items-end gap-2">
                            <div className="grid grid-cols-3 gap-4 text-center">
                              <div>
                                <p className="text-xs text-muted-foreground">Inquilino</p>
                                <p className="font-bold text-emerald-400">{formatCurrency(setup.taxaSetupInquilino)}</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Locador</p>
                                <p className="font-bold text-blue-400">{formatCurrency(setup.taxaSetupLocador)}</p>
                              </div>
                              <div>
                                <p className="text-xs text-muted-foreground">Garantidor</p>
                                <p className="font-bold text-purple-400">
                                  {setup.taxaSetupGarantidor > 0 ? formatCurrency(setup.taxaSetupGarantidor) : '-'}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium">
                                Total: {formatCurrency(setup.taxaSetupInquilino + setup.taxaSetupLocador + setup.taxaSetupGarantidor)}
                              </p>
                              <Button
                                onClick={() => {
                                  setSelectedSetup(setup);
                                  setProcessarSetupDialogOpen(true);
                                }}
                                className="bg-amber-600 hover:bg-amber-700"
                              >
                                <FileCheck className="h-4 w-4 mr-2" />
                                Gerar Titulos
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Setups Processados */}
          {setupsPendentes.filter(s => s.status === 'processado').length > 0 && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-muted-foreground">
                  <CheckCircle2 className="h-5 w-5" />
                  Setups Processados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {setupsPendentes.filter(s => s.status === 'processado').map((setup) => (
                    <div key={setup.id} className="flex items-center justify-between p-3 bg-card rounded-lg">
                      <div>
                        <p className="font-medium">{setup.imovelEndereco}</p>
                        <p className="text-sm text-muted-foreground">
                          {setup.contasGeradas.length} titulos gerados
                        </p>
                      </div>
                      <Badge variant="outline" className="text-emerald-400 border-green-200">
                        <Check className="h-3 w-3 mr-1" />
                        Processado
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Dialog Nova Conta */}
      <Dialog open={novaContaDialogOpen} onOpenChange={setNovaContaDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-emerald-400" />
              Nova Conta a Receber
            </DialogTitle>
            <DialogDescription>
              Cadastre uma nova conta para comissao, setup ou intermediacao
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Tipo de Conta */}
            <div className="space-y-3">
              <Label>Tipo de Conta</Label>
              <RadioGroup
                value={novaContaForm.tipo}
                onValueChange={(v) => {
                  setNovaContaForm(prev => ({
                    ...prev,
                    tipo: v as TipoConta,
                    contaContabil: v === 'comissao' ? 'receita_comissao' :
                                   v === 'setup' ? 'receita_setup' : 'receita_intermediacao',
                  }));
                }}
                className="grid grid-cols-3 gap-3"
              >
                {TIPOS_CONTA.map((tipo) => (
                  <div
                    key={tipo.value}
                    className={cn(
                      "flex items-center space-x-3 border rounded-lg p-4 cursor-pointer transition-colors",
                      novaContaForm.tipo === tipo.value && "border-primary bg-primary/5"
                    )}
                  >
                    <RadioGroupItem value={tipo.value} id={tipo.value} />
                    <Label htmlFor={tipo.value} className="flex items-center gap-2 cursor-pointer">
                      <tipo.icon className={`h-5 w-5 ${tipo.color}`} />
                      {tipo.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Tipo de Receita */}
            <div className="space-y-2">
              <Label>Tipo de Receita *</Label>
              <Select
                value={novaContaForm.tipoReceitaId}
                onValueChange={(v) => {
                  const tipoReceita = tiposReceita.find(tr => tr.id === v);
                  setNovaContaForm(prev => ({
                    ...prev,
                    tipoReceitaId: v,
                    contaContabil: (tipoReceita?.categoriaContabil as ContaContabil) || prev.contaContabil,
                  }));
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo de receita" />
                </SelectTrigger>
                <SelectContent>
                  {tiposReceita.filter(tr => tr.status === 'ativo').map((tipoReceita) => (
                    <SelectItem key={tipoReceita.id} value={tipoReceita.id}>
                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-muted px-1 py-0.5 rounded font-mono text-emerald-400">
                          {tipoReceita.codigo}
                        </code>
                        <span>{tipoReceita.nome}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Conta Contabil */}
            <div className="space-y-2">
              <Label>Conta Contabil</Label>
              <Select
                value={novaContaForm.contaContabil}
                onValueChange={(v) => setNovaContaForm(prev => ({ ...prev, contaContabil: v as ContaContabil }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CONTAS_CONTABEIS.map((conta) => (
                    <SelectItem key={conta.value} value={conta.value}>
                      {conta.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Pagador */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Pagador</Label>
                <Button
                  variant="link"
                  size="sm"
                  className="h-auto p-0 text-xs text-indigo-400"
                  onClick={handleNovoPagadorOpen}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Cadastrar novo pagador
                </Button>
              </div>
              <Select
                value={novaContaForm.pagadorId}
                onValueChange={(v) => setNovaContaForm(prev => ({ ...prev, pagadorId: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o pagador" />
                </SelectTrigger>
                <SelectContent>
                  {pagadoresFiltrados.map((pagador) => {
                    const tipoConfig = TIPOS_PAGADOR.find(t => t.value === pagador.tipo);
                    const Icon = tipoConfig?.icon || User;
                    return (
                      <SelectItem key={pagador.id} value={pagador.id}>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          <span>{pagador.nome}</span>
                          <span className="text-xs text-muted-foreground">({tipoConfig?.label})</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* Descricao */}
            <div className="space-y-2">
              <Label>Descricao</Label>
              <Input
                placeholder="Ex: Comissao de intermediacao - Jan/2026"
                value={novaContaForm.descricao}
                onChange={(e) => setNovaContaForm(prev => ({ ...prev, descricao: e.target.value }))}
              />
            </div>

            {/* Valor e Data */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Valor (R$)</Label>
                <Input
                  type="number"
                  placeholder="0,00"
                  value={novaContaForm.valor}
                  onChange={(e) => setNovaContaForm(prev => ({ ...prev, valor: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Data de Vencimento</Label>
                <Input
                  type="date"
                  value={novaContaForm.dataVencimento}
                  onChange={(e) => setNovaContaForm(prev => ({ ...prev, dataVencimento: e.target.value }))}
                />
              </div>
            </div>

            {/* Observacoes */}
            <div className="space-y-2">
              <Label>Observacoes (opcional)</Label>
              <Textarea
                placeholder="Informacoes adicionais..."
                value={novaContaForm.observacoes}
                onChange={(e) => setNovaContaForm(prev => ({ ...prev, observacoes: e.target.value }))}
              />
            </div>

            {/* Opcoes */}
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="gerarTitulo"
                  checked={novaContaForm.gerarTitulo}
                  onCheckedChange={(checked) => setNovaContaForm(prev => ({ ...prev, gerarTitulo: !!checked }))}
                />
                <Label htmlFor="gerarTitulo" className="text-sm">
                  Gerar titulo/link de pagamento (PIX, Boleto, etc.)
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="enviarNotificacao"
                  checked={novaContaForm.enviarNotificacao}
                  onCheckedChange={(checked) => setNovaContaForm(prev => ({ ...prev, enviarNotificacao: !!checked }))}
                />
                <Label htmlFor="enviarNotificacao" className="text-sm">
                  Enviar notificacao por e-mail ao pagador
                </Label>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setNovaContaDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleCriarConta}
              disabled={!novaContaForm.pagadorId || !novaContaForm.valor || !novaContaForm.dataVencimento}
            >
              <Plus className="h-4 w-4 mr-2" />
              Criar Conta
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Pagamento */}
      <Dialog open={pagamentoDialogOpen} onOpenChange={setPagamentoDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-emerald-400" />
              Registrar Pagamento
            </DialogTitle>
            <DialogDescription>
              {selectedConta?.numero} - {selectedConta?.pagadorNome}
            </DialogDescription>
          </DialogHeader>

          {selectedConta && (
            <div className="space-y-6">
              {/* Resumo */}
              <Card className="bg-card">
                <CardContent className="pt-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Tipo</p>
                      {getTipoBadge(selectedConta.tipo)}
                    </div>
                    <div>
                      <p className="text-muted-foreground">Valor</p>
                      <p className="font-bold text-lg">{formatCurrency(selectedConta.valor)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Forma de Pagamento */}
              <div className="space-y-3">
                <Label>Forma de Pagamento</Label>
                <RadioGroup
                  value={formaPagamentoSelecionada}
                  onValueChange={(v) => setFormaPagamentoSelecionada(v as FormaPagamento)}
                  className="grid grid-cols-2 gap-3"
                >
                  <div className={cn(
                    "flex items-center space-x-3 border rounded-lg p-4 cursor-pointer transition-colors",
                    formaPagamentoSelecionada === 'pix' && "border-green-500 bg-green-50"
                  )}>
                    <RadioGroupItem value="pix" id="pix-pay" />
                    <Label htmlFor="pix-pay" className="flex items-center gap-2 cursor-pointer flex-1">
                      <QrCode className="h-5 w-5 text-emerald-400" />
                      <div>
                        <p className="font-medium">PIX</p>
                        <p className="text-xs text-muted-foreground">Taxa: 0.99%</p>
                      </div>
                    </Label>
                  </div>

                  <div className={cn(
                    "flex items-center space-x-3 border rounded-lg p-4 cursor-pointer transition-colors",
                    formaPagamentoSelecionada === 'boleto' && "border-border bg-card"
                  )}>
                    <RadioGroupItem value="boleto" id="boleto-pay" />
                    <Label htmlFor="boleto-pay" className="flex items-center gap-2 cursor-pointer flex-1">
                      <Banknote className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Boleto</p>
                        <p className="text-xs text-muted-foreground">Taxa: 1.5% + R$3,50</p>
                      </div>
                    </Label>
                  </div>

                  <div className={cn(
                    "flex items-center space-x-3 border rounded-lg p-4 cursor-pointer transition-colors",
                    formaPagamentoSelecionada === 'cartao' && "border-blue-500 bg-blue-50"
                  )}>
                    <RadioGroupItem value="cartao" id="cartao-pay" />
                    <Label htmlFor="cartao-pay" className="flex items-center gap-2 cursor-pointer flex-1">
                      <CreditCard className="h-5 w-5 text-blue-400" />
                      <div>
                        <p className="font-medium">Cartao</p>
                        <p className="text-xs text-red-500">Taxa: 3.99%</p>
                      </div>
                    </Label>
                  </div>

                  <div className={cn(
                    "flex items-center space-x-3 border rounded-lg p-4 cursor-pointer transition-colors",
                    formaPagamentoSelecionada === 'cripto' && "border-orange-500 bg-orange-50"
                  )}>
                    <RadioGroupItem value="cripto" id="cripto-pay" />
                    <Label htmlFor="cripto-pay" className="flex items-center gap-2 cursor-pointer flex-1">
                      <Bitcoin className="h-5 w-5 text-orange-400" />
                      <div>
                        <p className="font-medium">Cripto</p>
                        <p className="text-xs text-muted-foreground">Taxa: 0.5%</p>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Preview Taxas */}
              {previewTaxas && (
                <Card className="bg-card border-border">
                  <CardContent className="pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Valor Bruto</span>
                      <span>{formatCurrency(selectedConta.valor)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Taxa Gateway</span>
                      <span className="text-red-400">-{formatCurrency(previewTaxas.taxaGateway)}</span>
                    </div>
                    {previewTaxas.taxaGas > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Taxa Gas</span>
                        <span className="text-red-400">-{formatCurrency(previewTaxas.taxaGas)}</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between font-bold">
                      <span>Liquido</span>
                      <span className="text-emerald-400">
                        {formatCurrency(selectedConta.valor - previewTaxas.totalTaxas)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Taxas lancadas como custo de intermediacao no caixa
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setPagamentoDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleProcessarPagamento}
              disabled={processandoPagamento}
              className="bg-green-600 hover:bg-green-700"
            >
              {processandoPagamento ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Confirmar Pagamento
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Processar Setup */}
      <AlertDialog open={processarSetupDialogOpen} onOpenChange={setProcessarSetupDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <FileCheck className="h-5 w-5 text-amber-600" />
              Gerar Titulos de Setup
            </AlertDialogTitle>
            <AlertDialogDescription>
              Sera(ao) gerado(s) os seguintes titulos de cobranca:
            </AlertDialogDescription>
          </AlertDialogHeader>

          {selectedSetup && (
            <div className="space-y-4 my-4">
              <Card className="bg-card">
                <CardContent className="pt-4">
                  <p className="font-medium mb-2">{selectedSetup.imovelEndereco}</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        {selectedSetup.inquilinoNome} (Inquilino)
                      </span>
                      <span className="font-bold">{formatCurrency(selectedSetup.taxaSetupInquilino)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="flex items-center gap-2">
                        <Home className="h-4 w-4 text-muted-foreground" />
                        {selectedSetup.locadorNome} (Locador)
                      </span>
                      <span className="font-bold">{formatCurrency(selectedSetup.taxaSetupLocador)}</span>
                    </div>
                    {selectedSetup.garantidorNome && selectedSetup.taxaSetupGarantidor > 0 && (
                      <div className="flex justify-between">
                        <span className="flex items-center gap-2">
                          <HandCoins className="h-4 w-4 text-muted-foreground" />
                          {selectedSetup.garantidorNome} (Garantidor)
                        </span>
                        <span className="font-bold">{formatCurrency(selectedSetup.taxaSetupGarantidor)}</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between font-bold">
                      <span>Total</span>
                      <span>{formatCurrency(
                        selectedSetup.taxaSetupInquilino + selectedSetup.taxaSetupLocador + selectedSetup.taxaSetupGarantidor
                      )}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="flex items-start gap-2 text-sm text-muted-foreground">
                <Bell className="h-4 w-4 mt-0.5 text-amber-500" />
                <p>Todos os clientes serao notificados por e-mail com o link de pagamento.</p>
              </div>
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleProcessarSetup}
              disabled={processandoSetup}
              className="bg-amber-600 hover:bg-amber-700"
            >
              {processandoSetup ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <FileCheck className="h-4 w-4 mr-2" />
                  Gerar Titulos e Notificar
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog Notificacao */}
      <AlertDialog open={notificacaoDialogOpen} onOpenChange={setNotificacaoDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Send className="h-5 w-5 text-blue-400" />
              Enviar Notificacao
            </AlertDialogTitle>
            <AlertDialogDescription>
              Enviar e-mail de cobranca para {selectedConta?.pagadorNome}?
            </AlertDialogDescription>
          </AlertDialogHeader>

          {selectedConta && (
            <div className="my-4 p-4 bg-card rounded-lg text-sm">
              <p><strong>Para:</strong> {selectedConta.pagadorEmail}</p>
              <p><strong>Assunto:</strong> Cobranca {selectedConta.numero}</p>
              <p><strong>Valor:</strong> {formatCurrency(selectedConta.valor)}</p>
              <p><strong>Vencimento:</strong> {formatDate(selectedConta.dataVencimento)}</p>
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleEnviarNotificacao}>
              <Send className="h-4 w-4 mr-2" />
              Enviar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Sheet Detalhes */}
      <Sheet open={detalhesSheetOpen} onOpenChange={setDetalhesSheetOpen}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Detalhes da Conta</SheetTitle>
            <SheetDescription>
              {selectedConta?.numero}
            </SheetDescription>
          </SheetHeader>

          {selectedConta && (
            <div className="mt-6 space-y-6">
              {/* Status e Tipo */}
              <div className="flex items-center justify-between">
                {getStatusBadge(selectedConta.status)}
                {getTipoBadge(selectedConta.tipo)}
              </div>

              {/* Pagador */}
              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    {getPagadorIcon(selectedConta.pagadorTipo)}
                    Pagador
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="font-medium">{selectedConta.pagadorNome}</p>
                  <p className="text-sm text-muted-foreground">{selectedConta.pagadorDocumento}</p>
                  <p className="text-sm text-muted-foreground">{selectedConta.pagadorEmail}</p>
                  <Badge variant="outline" className="capitalize">{selectedConta.pagadorTipo}</Badge>
                </CardContent>
              </Card>

              {/* Detalhes */}
              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Detalhes
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm">{selectedConta.descricao}</p>
                  {selectedConta.imovelEndereco && (
                    <p className="text-sm flex items-center gap-1">
                      <Home className="h-3 w-3" />
                      {selectedConta.imovelEndereco}
                    </p>
                  )}
                  {selectedConta.servicoDescricao && (
                    <p className="text-sm flex items-center gap-1">
                      <Wrench className="h-3 w-3" />
                      {selectedConta.servicoDescricao}
                    </p>
                  )}
                  {selectedConta.observacoes && (
                    <p className="text-sm text-muted-foreground mt-2">{selectedConta.observacoes}</p>
                  )}
                </CardContent>
              </Card>

              {/* Valores */}
              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Valores
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Valor</span>
                    <span className="font-bold">{formatCurrency(selectedConta.valor)}</span>
                  </div>
                  {selectedConta.valorPago && (
                    <div className="flex justify-between text-sm text-emerald-400">
                      <span>Valor Pago</span>
                      <span className="font-bold">{formatCurrency(selectedConta.valorPago)}</span>
                    </div>
                  )}
                  {selectedConta.taxas && (
                    <>
                      <Separator />
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Taxas</span>
                        <span className="text-red-400">-{formatCurrency(selectedConta.taxas.totalTaxas)}</span>
                      </div>
                      <div className="flex justify-between text-sm font-bold">
                        <span>Liquido</span>
                        <span className="text-emerald-400">
                          {formatCurrency((selectedConta.valorPago || selectedConta.valor) - selectedConta.taxas.totalTaxas)}
                        </span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Datas */}
              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Datas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Emissao</span>
                    <span>{formatDate(selectedConta.dataEmissao)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Vencimento</span>
                    <span>{formatDate(selectedConta.dataVencimento)}</span>
                  </div>
                  {selectedConta.dataPagamento && (
                    <div className="flex justify-between text-sm text-emerald-400">
                      <span>Pagamento</span>
                      <span>{formatDate(selectedConta.dataPagamento)}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Link de Pagamento */}
              {selectedConta.linkPagamento && selectedConta.status !== 'pago' && (
                <Card className="bg-card border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Link className="h-4 w-4" />
                      Link de Pagamento
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <Input
                        value={selectedConta.linkPagamento}
                        readOnly
                        className="text-xs font-mono"
                      />
                      <Button variant="outline" size="icon">
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Lancamentos */}
              {selectedConta.status === 'pago' && (
                <Card className="bg-card border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <FileCheck className="h-4 w-4" />
                      Lancamentos
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    {selectedConta.lancamentoCaixaId && (
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">Caixa</Badge>
                        <span className="font-mono text-xs">{selectedConta.lancamentoCaixaId}</span>
                      </div>
                    )}
                    {selectedConta.lancamentoContabilId && (
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">Contabil</Badge>
                        <span className="font-mono text-xs">{selectedConta.lancamentoContabilId}</span>
                      </div>
                    )}
                    <p className="text-muted-foreground">Baixa automatica realizada</p>
                  </CardContent>
                </Card>
              )}

              {/* Acoes */}
              {(selectedConta.status === 'pendente' || selectedConta.status === 'vencido') && (
                <Button
                  className="w-full"
                  onClick={() => {
                    setDetalhesSheetOpen(false);
                    setFormaPagamentoSelecionada('pix');
                    setPagamentoDialogOpen(true);
                  }}
                >
                  <DollarSign className="h-4 w-4 mr-2" />
                  Registrar Pagamento
                </Button>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Dialog Novo Pagador */}
      <Dialog open={novoPagadorDialogOpen} onOpenChange={setNovoPagadorDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-indigo-400" />
              Novo Pagador
            </DialogTitle>
            <DialogDescription>
              Cadastre um novo pagador para contas a receber
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Tipo de Pagador */}
            <div className="space-y-3">
              <Label>Tipo de Pagador</Label>
              <RadioGroup
                value={novoPagadorForm.tipo}
                onValueChange={(v) => setNovoPagadorForm(prev => ({ ...prev, tipo: v as TipoPagador }))}
                className="grid grid-cols-2 gap-3"
              >
                {TIPOS_PAGADOR.map((tipo) => (
                  <div
                    key={tipo.value}
                    className={cn(
                      "flex items-center space-x-3 border rounded-lg p-3 cursor-pointer transition-colors",
                      novoPagadorForm.tipo === tipo.value && "border-indigo-500 bg-indigo-50"
                    )}
                  >
                    <RadioGroupItem value={tipo.value} id={`pagador-${tipo.value}`} />
                    <Label htmlFor={`pagador-${tipo.value}`} className="flex items-center gap-2 cursor-pointer">
                      <tipo.icon className="h-4 w-4" />
                      {tipo.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Nome */}
            <div className="space-y-2">
              <Label>Nome Completo / Razao Social *</Label>
              <Input
                placeholder="Nome do pagador"
                value={novoPagadorForm.nome}
                onChange={(e) => setNovoPagadorForm(prev => ({ ...prev, nome: e.target.value }))}
              />
            </div>

            {/* Documento */}
            <div className="space-y-2">
              <Label>CPF / CNPJ *</Label>
              <Input
                placeholder={novoPagadorForm.tipo === 'seguradora' || novoPagadorForm.tipo === 'imobiliaria' ? '00.000.000/0000-00' : '000.000.000-00'}
                value={novoPagadorForm.documento}
                onChange={(e) => setNovoPagadorForm(prev => ({ ...prev, documento: e.target.value }))}
              />
            </div>

            {/* Email e Telefone */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>E-mail *</Label>
                <Input
                  type="email"
                  placeholder="email@exemplo.com"
                  value={novoPagadorForm.email}
                  onChange={(e) => setNovoPagadorForm(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Telefone</Label>
                <Input
                  placeholder="(00) 00000-0000"
                  value={novoPagadorForm.telefone}
                  onChange={(e) => setNovoPagadorForm(prev => ({ ...prev, telefone: e.target.value }))}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setNovoPagadorDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleCriarPagador}
              disabled={!novoPagadorForm.nome || !novoPagadorForm.documento || !novoPagadorForm.email}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Cadastrar Pagador
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
}
