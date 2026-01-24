/**
 * Vinculo.io - Alugueis a Receber
 *
 * Formulario para gerenciamento de faturas de aluguel com:
 * - Multiplas formas de pagamento (PIX, Cripto, Cartao, Boleto)
 * - Calculo automatico de taxas
 * - Split de pagamento em reais e crypto
 * - Baixa automatica no caixa
 * - Lancamento contabil de custos de intermediacao
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
  Home,
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
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { cn } from '@/lib/utils';

// ============================================
// TYPES
// ============================================

type FormaPagamento = 'pix' | 'cripto' | 'cartao' | 'boleto';
type StatusFatura = 'pendente' | 'pago' | 'vencido' | 'parcial' | 'processando' | 'cancelado';

interface TaxasPagamento {
  taxaGateway: number; // Taxa do gateway (cartao, pix, boleto)
  taxaGas: number; // Taxa de gas (cripto)
  taxaPlataforma: number; // Taxa da plataforma Vinculo.io
  totalTaxas: number;
}

interface SplitPagamento {
  locador: number; // 85%
  seguradora: number; // 5%
  garantidor: number; // 5%
  plataforma: number; // 5%
  imobiliaria?: number; // Comissao imobiliaria se houver
}

interface FaturaAluguel {
  id: string;
  contratoId: string;
  nftTokenId: string;

  // Imovel
  imovelId: string;
  imovelEndereco: string;
  imovelCidade: string;

  // Partes
  inquilinoId: string;
  inquilinoNome: string;
  inquilinoCpf: string;
  locadorId: string;
  locadorNome: string;
  garantidorId?: string;
  garantidorNome?: string;
  imobiliariaId?: string;
  imobiliariaNome?: string;

  // Valores
  valorAluguel: number;
  valorCondominio: number;
  valorIPTU: number;
  valorTotal: number;

  // Datas
  competencia: string; // MM/YYYY
  dataVencimento: string;
  dataPagamento?: string;

  // Pagamento
  formaPagamento?: FormaPagamento;
  valorPago?: number;
  status: StatusFatura;

  // Taxas (quando pago)
  taxas?: TaxasPagamento;
  split?: SplitPagamento;

  // Lancamentos
  lancamentoCaixaId?: string;
  lancamentoContabilId?: string;

  // Metadata
  linkPagamento?: string;
  qrCodePix?: string;
  boletoCodigo?: string;
  walletCripto?: string;
  txHashCripto?: string;
  createdAt: Date;
}

interface LancamentoCaixa {
  id: string;
  faturaId: string;
  tipo: 'entrada' | 'saida';
  categoria: string;
  descricao: string;
  valor: number;
  data: Date;
  contaBancariaId: string;
}

interface ContaBancaria {
  id: string;
  nome: string;
  banco: string;
  saldo: number;
}

// ============================================
// CONFIGURACAO DE TAXAS
// ============================================

const TAXAS_CONFIG = {
  pix: {
    taxaGateway: 0.0099, // 0.99%
    taxaFixa: 0,
    descricao: 'Taxa PIX',
    quemPaga: 'plataforma' as const, // Descontado da plataforma
  },
  boleto: {
    taxaGateway: 0.0150, // 1.50%
    taxaFixa: 3.50, // R$ 3,50 por boleto
    descricao: 'Taxa Boleto',
    quemPaga: 'plataforma' as const,
  },
  cartao: {
    taxaGateway: 0.0399, // 3.99%
    taxaFixa: 0,
    descricao: 'Taxa Cartao',
    quemPaga: 'cliente' as const, // Cobrado do inquilino
  },
  cripto: {
    taxaGateway: 0.005, // 0.5%
    taxaGas: 0.50, // Estimativa gas em USD
    descricao: 'Taxa Gas Polygon',
    quemPaga: 'plataforma' as const,
    desconto: 0.05, // 5% de desconto para pagamento crypto
  },
};

const SPLIT_CONFIG = {
  locador: 0.85, // 85%
  seguradora: 0.05, // 5%
  garantidor: 0.05, // 5%
  plataforma: 0.05, // 5%
};

/**
 * Calcula o valor TOTAL a cobrar do inquilino baseado no valor
 * que o proprietario deseja RECEBER liquido.
 *
 * Formula: x = (valorDesejadoLocador × 100) / 85
 *
 * Exemplo:
 *   Proprietario quer receber R$ 2.000
 *   x = (2000 × 100) / 85 = R$ 2.352,94
 *
 *   Distribuicao:
 *   - Locador: R$ 2.000,00 (85%)
 *   - Seguradora: R$ 117,65 (5%)
 *   - Garantidor: R$ 117,65 (5%)
 *   - Plataforma: R$ 117,65 (5%)
 */
function calcularValorTotalPeloLocador(valorDesejadoLocador: number): {
  valorTotal: number;
  locador: number;
  seguradora: number;
  garantidor: number;
  plataforma: number;
} {
  const percentualLocador = SPLIT_CONFIG.locador * 100; // 85
  const valorTotal = (valorDesejadoLocador * 100) / percentualLocador;
  const valorTotalArredondado = Math.round(valorTotal * 100) / 100;

  return {
    valorTotal: valorTotalArredondado,
    locador: Math.round(valorTotalArredondado * SPLIT_CONFIG.locador * 100) / 100,
    seguradora: Math.round(valorTotalArredondado * SPLIT_CONFIG.seguradora * 100) / 100,
    garantidor: Math.round(valorTotalArredondado * SPLIT_CONFIG.garantidor * 100) / 100,
    plataforma: Math.round(valorTotalArredondado * SPLIT_CONFIG.plataforma * 100) / 100,
  };
}

// ============================================
// MOCK DATA
// ============================================

// ============================================
// DADOS VAZIOS PARA PRODUCAO
// ============================================

const MOCK_CONTAS_BANCARIAS: ContaBancaria[] = [];

const MOCK_FATURAS: FaturaAluguel[] = [];

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
  const taxaPlataforma = valor * SPLIT_CONFIG.plataforma;

  return {
    taxaGateway,
    taxaGas,
    taxaPlataforma,
    totalTaxas: taxaGateway + taxaGas + taxaPlataforma,
  };
}

function calcularSplit(valor: number, temGarantidor: boolean, temImobiliaria: boolean): SplitPagamento {
  const locador = valor * SPLIT_CONFIG.locador;
  const seguradora = valor * SPLIT_CONFIG.seguradora;
  const garantidor = temGarantidor ? valor * SPLIT_CONFIG.garantidor : 0;
  const plataforma = valor * SPLIT_CONFIG.plataforma + (temGarantidor ? 0 : valor * SPLIT_CONFIG.garantidor);

  return {
    locador,
    seguradora,
    garantidor,
    plataforma,
    imobiliaria: temImobiliaria ? valor * 0.05 : undefined, // 5% comissao imobiliaria (adicional)
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

// ============================================
// COMPONENT
// ============================================

export function AlugueisReceberForm() {
  const [faturas, setFaturas] = useState<FaturaAluguel[]>(MOCK_FATURAS);
  const [filtroStatus, setFiltroStatus] = useState<string>('all');
  const [filtroCompetencia, setFiltroCompetencia] = useState<string>('01/2026');
  const [searchTerm, setSearchTerm] = useState('');

  // Dialogs
  const [pagamentoDialogOpen, setPagamentoDialogOpen] = useState(false);
  const [detalhesSheetOpen, setDetalhesSheetOpen] = useState(false);
  const [selectedFatura, setSelectedFatura] = useState<FaturaAluguel | null>(null);

  // Pagamento
  const [formaPagamentoSelecionada, setFormaPagamentoSelecionada] = useState<FormaPagamento>('pix');
  const [contaBancariaSelecionada, setContaBancariaSelecionada] = useState<string>('cb_001');
  const [processandoPagamento, setProcessandoPagamento] = useState(false);

  // Helper para formatacao de moeda
  const formatCurrencyLocal = (value: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  // Calculo de KPIs
  const kpis = useMemo(() => {
    const totalAReceber = faturas
      .filter(f => f.status === 'pendente' || f.status === 'vencido')
      .reduce((acc, f) => acc + f.valorTotal, 0);

    const totalRecebido = faturas
      .filter(f => f.status === 'pago')
      .reduce((acc, f) => acc + (f.valorPago || 0), 0);

    const totalVencido = faturas
      .filter(f => f.status === 'vencido')
      .reduce((acc, f) => acc + f.valorTotal, 0);

    const taxasRecolhidas = faturas
      .filter(f => f.status === 'pago' && f.taxas)
      .reduce((acc, f) => acc + (f.taxas?.totalTaxas || 0), 0);

    const totalFaturas = faturas.length;
    const faturasRecebidas = faturas.filter(f => f.status === 'pago').length;
    const taxaRecebimento = totalFaturas > 0 ? (faturasRecebidas / totalFaturas) * 100 : 0;

    return {
      totalAReceber,
      totalRecebido,
      totalVencido,
      taxasRecolhidas,
      taxaRecebimento,
    };
  }, [faturas]);

  // Filtrar faturas
  const faturasFiltradas = useMemo(() => {
    return faturas.filter(f => {
      const matchStatus = filtroStatus === 'all' || f.status === filtroStatus;
      const matchCompetencia = f.competencia === filtroCompetencia;
      const matchSearch = searchTerm === '' ||
        f.inquilinoNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.imovelEndereco.toLowerCase().includes(searchTerm.toLowerCase()) ||
        f.locadorNome.toLowerCase().includes(searchTerm.toLowerCase());

      return matchStatus && matchCompetencia && matchSearch;
    });
  }, [faturas, filtroStatus, filtroCompetencia, searchTerm]);

  // Abrir dialog de pagamento
  const handleAbrirPagamento = useCallback((fatura: FaturaAluguel) => {
    setSelectedFatura(fatura);
    setFormaPagamentoSelecionada('pix');
    setPagamentoDialogOpen(true);
  }, []);

  // Abrir detalhes
  const handleAbrirDetalhes = useCallback((fatura: FaturaAluguel) => {
    setSelectedFatura(fatura);
    setDetalhesSheetOpen(true);
  }, []);

  // Processar pagamento
  const handleProcessarPagamento = useCallback(async () => {
    if (!selectedFatura) return;

    setProcessandoPagamento(true);

    // Simular processamento
    await new Promise(resolve => setTimeout(resolve, 2000));

    const taxas = calcularTaxas(selectedFatura.valorTotal, formaPagamentoSelecionada);
    const split = calcularSplit(
      selectedFatura.valorTotal,
      !!selectedFatura.garantidorId,
      !!selectedFatura.imobiliariaId
    );

    // Calcular valor com desconto para cripto
    let valorFinal = selectedFatura.valorTotal;
    if (formaPagamentoSelecionada === 'cripto') {
      valorFinal = selectedFatura.valorTotal * (1 - TAXAS_CONFIG.cripto.desconto);
    }

    // Atualizar fatura
    setFaturas(prev => prev.map(f => {
      if (f.id === selectedFatura.id) {
        return {
          ...f,
          status: 'pago' as StatusFatura,
          formaPagamento: formaPagamentoSelecionada,
          valorPago: valorFinal,
          dataPagamento: new Date().toISOString().split('T')[0],
          taxas,
          split,
          lancamentoCaixaId: `lcx_${Date.now()}`,
          lancamentoContabilId: `lct_${Date.now()}`,
        };
      }
      return f;
    }));

    setProcessandoPagamento(false);
    setPagamentoDialogOpen(false);
    setSelectedFatura(null);
  }, [selectedFatura, formaPagamentoSelecionada]);

  // Calcular preview de taxas
  const previewTaxas = useMemo(() => {
    if (!selectedFatura) return null;
    return calcularTaxas(selectedFatura.valorTotal, formaPagamentoSelecionada);
  }, [selectedFatura, formaPagamentoSelecionada]);

  const previewSplit = useMemo(() => {
    if (!selectedFatura) return null;
    return calcularSplit(
      selectedFatura.valorTotal,
      !!selectedFatura.garantidorId,
      !!selectedFatura.imobiliariaId
    );
  }, [selectedFatura]);

  // Status badge
  const getStatusBadge = (status: StatusFatura) => {
    const configs = {
      pendente: { label: 'Pendente', className: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
      pago: { label: 'Pago', className: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
      vencido: { label: 'Vencido', className: 'bg-red-500/10 text-red-500 border-red-500/20' },
      parcial: { label: 'Parcial', className: 'bg-orange-500/10 text-orange-500 border-orange-500/20' },
      processando: { label: 'Processando', className: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
      cancelado: { label: 'Cancelado', className: 'bg-muted text-muted-foreground border-border' },
    };
    const config = configs[status];
    return <Badge variant="outline" className={config.className}>{config.label}</Badge>;
  };

  // Icone forma de pagamento
  const getFormaPagamentoIcon = (forma?: FormaPagamento) => {
    const icons = {
      pix: <QrCode className="h-4 w-4" />,
      cripto: <Bitcoin className="h-4 w-4" />,
      cartao: <CreditCard className="h-4 w-4" />,
      boleto: <Banknote className="h-4 w-4" />,
    };
    return forma ? icons[forma] : null;
  };

  return (
    <div className="bg-background text-foreground font-sans">
      <div className="max-w-7xl mx-auto p-8 space-y-6 pb-16">
          {/* Header */}
          <div className="flex justify-between items-center border-b border-border pb-6">
            <div>
              <h1 className="text-3xl font-black tracking-tight">ALUGUEIS A RECEBER</h1>
              <p className="text-muted-foreground text-sm mt-1">Gestao de faturas e recebimentos de aluguel</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="border-border">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
              <Button variant="outline" size="sm" className="border-border">
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar
              </Button>
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <p className="text-[10px] text-muted-foreground uppercase font-bold">A Receber</p>
                <p className="text-xl font-black text-amber-400">{formatCurrency(kpis.totalAReceber)}</p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <p className="text-[10px] text-muted-foreground uppercase font-bold">Recebido</p>
                <p className="text-xl font-black text-emerald-400">{formatCurrency(kpis.totalRecebido)}</p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <p className="text-[10px] text-muted-foreground uppercase font-bold">Vencido</p>
                <p className="text-xl font-black text-red-400">{formatCurrency(kpis.totalVencido)}</p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <p className="text-[10px] text-muted-foreground uppercase font-bold">Taxas Recolhidas</p>
                <p className="text-xl font-black text-purple-400">{formatCurrency(kpis.taxasRecolhidas)}</p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <p className="text-[10px] text-muted-foreground uppercase font-bold">Taxa Recebimento</p>
                <p className="text-xl font-black text-blue-400">{kpis.taxaRecebimento.toFixed(1)}%</p>
              </CardContent>
            </Card>
          </div>

          {/* Filtros */}
          <div className="flex gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por inquilino, endereco ou locador..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-card border-border"
              />
            </div>
            <Select value={filtroCompetencia} onValueChange={setFiltroCompetencia}>
              <SelectTrigger className="w-40 bg-card border-border">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="01/2026">Jan/2026</SelectItem>
                <SelectItem value="02/2026">Fev/2026</SelectItem>
                <SelectItem value="03/2026">Mar/2026</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filtroStatus} onValueChange={setFiltroStatus}>
              <SelectTrigger className="w-40 bg-card border-border">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="pago">Pago</SelectItem>
                <SelectItem value="vencido">Vencido</SelectItem>
                <SelectItem value="processando">Processando</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tabela de Faturas */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Receipt className="h-5 w-5" />
                Faturas de Aluguel
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                {faturasFiltradas.length} faturas encontradas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-muted-foreground text-[10px] uppercase font-bold">Imovel</TableHead>
                    <TableHead className="text-muted-foreground text-[10px] uppercase font-bold">Inquilino</TableHead>
                    <TableHead className="text-muted-foreground text-[10px] uppercase font-bold">Locador</TableHead>
                    <TableHead className="text-muted-foreground text-[10px] uppercase font-bold">Competencia</TableHead>
                    <TableHead className="text-muted-foreground text-[10px] uppercase font-bold">Vencimento</TableHead>
                    <TableHead className="text-muted-foreground text-[10px] uppercase font-bold text-right">Valor</TableHead>
                    <TableHead className="text-muted-foreground text-[10px] uppercase font-bold">Forma Pgto</TableHead>
                    <TableHead className="text-muted-foreground text-[10px] uppercase font-bold">Status</TableHead>
                    <TableHead className="w-12" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {faturasFiltradas.map((fatura) => (
                    <TableRow key={fatura.id} className="border-border/50 hover:bg-card/5 transition-colors">
                      <TableCell>
                        <div className="flex items-start gap-2">
                          <Home className="h-4 w-4 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="font-bold text-sm">{fatura.imovelEndereco}</p>
                            <p className="text-[10px] text-muted-foreground">{fatura.imovelCidade}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium text-sm text-muted-foreground">{fatura.inquilinoNome}</p>
                          <p className="text-[10px] text-muted-foreground">{fatura.inquilinoCpf}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-muted-foreground">{fatura.locadorNome}</p>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-muted/50 text-muted-foreground border-border">{fatura.competencia}</Badge>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-muted-foreground">{formatDate(fatura.dataVencimento)}</p>
                      </TableCell>
                      <TableCell className="text-right">
                        <p className="font-mono font-bold text-foreground">{formatCurrency(fatura.valorTotal)}</p>
                        {fatura.valorPago && fatura.valorPago !== fatura.valorTotal && (
                          <p className="text-xs text-emerald-400">
                            Pago: {formatCurrency(fatura.valorPago)}
                          </p>
                        )}
                      </TableCell>
                      <TableCell>
                        {fatura.formaPagamento ? (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            {getFormaPagamentoIcon(fatura.formaPagamento)}
                            <span className="text-xs capitalize">{fatura.formaPagamento}</span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(fatura.status)}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-card border-border">
                            <DropdownMenuItem onClick={() => handleAbrirDetalhes(fatura)} className="text-muted-foreground focus:bg-muted cursor-pointer">
                              <Eye className="h-4 w-4 mr-2" />
                              Ver Detalhes
                            </DropdownMenuItem>
                            {(fatura.status === 'pendente' || fatura.status === 'vencido') && (
                              <DropdownMenuItem onClick={() => handleAbrirPagamento(fatura)} className="text-emerald-400 focus:bg-muted cursor-pointer">
                                <DollarSign className="h-4 w-4 mr-2" />
                                Registrar Pagamento
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator className="bg-muted" />
                            {fatura.linkPagamento && (
                              <DropdownMenuItem className="text-muted-foreground focus:bg-muted cursor-pointer">
                                <Copy className="h-4 w-4 mr-2" />
                                Copiar Link
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem className="text-muted-foreground focus:bg-muted cursor-pointer">
                              <Send className="h-4 w-4 mr-2" />
                              Reenviar Cobranca
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-muted-foreground focus:bg-muted cursor-pointer">
                              <FileText className="h-4 w-4 mr-2" />
                              Ver Contrato NFT
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </CardContent>
          </Card>

      {/* Dialog de Pagamento */}
      <Dialog open={pagamentoDialogOpen} onOpenChange={setPagamentoDialogOpen}>
        <DialogContent className="max-w-2xl bg-background border-border">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground">
              <DollarSign className="h-5 w-5 text-emerald-400" />
              Registrar Pagamento
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Fatura #{selectedFatura?.id} - {selectedFatura?.imovelEndereco}
            </DialogDescription>
          </DialogHeader>

          {selectedFatura && (
            <div className="space-y-6">
              {/* Resumo da Fatura */}
              <Card className="bg-card border-border">
                <CardContent className="pt-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Inquilino</p>
                      <p className="font-medium text-foreground">{selectedFatura.inquilinoNome}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Competencia</p>
                      <p className="font-medium text-foreground">{selectedFatura.competencia}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Valor Total</p>
                      <p className="font-bold text-lg text-indigo-400">{formatCurrency(selectedFatura.valorTotal)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Vencimento</p>
                      <p className="font-medium text-foreground">{formatDate(selectedFatura.dataVencimento)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Forma de Pagamento */}
              <div className="space-y-3">
                <Label className="text-muted-foreground">Forma de Pagamento</Label>
                <RadioGroup
                  value={formaPagamentoSelecionada}
                  onValueChange={(v) => setFormaPagamentoSelecionada(v as FormaPagamento)}
                  className="grid grid-cols-2 gap-3"
                >
                  <div className={cn(
                    "flex items-center space-x-3 border rounded-lg p-4 cursor-pointer transition-colors bg-card border-border",
                    formaPagamentoSelecionada === 'pix' && "border-emerald-500/50 bg-emerald-500/10"
                  )}>
                    <RadioGroupItem value="pix" id="pix" />
                    <Label htmlFor="pix" className="flex items-center gap-2 cursor-pointer flex-1">
                      <QrCode className="h-5 w-5 text-emerald-400" />
                      <div>
                        <p className="font-medium text-foreground">PIX</p>
                        <p className="text-xs text-muted-foreground">Taxa: 0.99% (plataforma)</p>
                      </div>
                    </Label>
                  </div>

                  <div className={cn(
                    "flex items-center space-x-3 border rounded-lg p-4 cursor-pointer transition-colors bg-card border-border",
                    formaPagamentoSelecionada === 'cripto' && "border-orange-500/50 bg-orange-500/10"
                  )}>
                    <RadioGroupItem value="cripto" id="cripto" />
                    <Label htmlFor="cripto" className="flex items-center gap-2 cursor-pointer flex-1">
                      <Bitcoin className="h-5 w-5 text-orange-400" />
                      <div>
                        <p className="font-medium text-foreground">Cripto (BRZ)</p>
                        <p className="text-xs text-emerald-400 font-medium">5% desconto!</p>
                      </div>
                    </Label>
                  </div>

                  <div className={cn(
                    "flex items-center space-x-3 border rounded-lg p-4 cursor-pointer transition-colors bg-card border-border",
                    formaPagamentoSelecionada === 'cartao' && "border-blue-500/50 bg-blue-500/10"
                  )}>
                    <RadioGroupItem value="cartao" id="cartao" />
                    <Label htmlFor="cartao" className="flex items-center gap-2 cursor-pointer flex-1">
                      <CreditCard className="h-5 w-5 text-blue-400" />
                      <div>
                        <p className="font-medium text-foreground">Cartao</p>
                        <p className="text-xs text-red-400">Taxa: 3.99% (cliente)</p>
                      </div>
                    </Label>
                  </div>

                  <div className={cn(
                    "flex items-center space-x-3 border rounded-lg p-4 cursor-pointer transition-colors bg-card border-border",
                    formaPagamentoSelecionada === 'boleto' && "border-border bg-muted"
                  )}>
                    <RadioGroupItem value="boleto" id="boleto" />
                    <Label htmlFor="boleto" className="flex items-center gap-2 cursor-pointer flex-1">
                      <Banknote className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-foreground">Boleto</p>
                        <p className="text-xs text-muted-foreground">Taxa: 1.5% + R$3,50</p>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              {/* Preview de Taxas e Split */}
              {previewTaxas && previewSplit && (
                <Tabs defaultValue="taxas">
                  <TabsList className="w-full bg-card border-border">
                    <TabsTrigger value="taxas" className="flex-1">Taxas</TabsTrigger>
                    <TabsTrigger value="split" className="flex-1">Split (85/5/5/5)</TabsTrigger>
                  </TabsList>

                  <TabsContent value="taxas" className="mt-4">
                    <Card className="bg-card border-border">
                      <CardContent className="pt-4 space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Valor Bruto</span>
                          <span className="font-medium text-foreground">{formatCurrency(selectedFatura.valorTotal)}</span>
                        </div>

                        {formaPagamentoSelecionada === 'cripto' && (
                          <div className="flex justify-between text-sm text-emerald-400">
                            <span>Desconto Crypto (5%)</span>
                            <span>-{formatCurrency(selectedFatura.valorTotal * 0.05)}</span>
                          </div>
                        )}

                        <Separator className="bg-muted" />

                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground flex items-center gap-1">
                            {getFormaPagamentoIcon(formaPagamentoSelecionada)}
                            Taxa Gateway
                            {formaPagamentoSelecionada === 'cartao' && (
                              <Badge variant="destructive" className="text-[10px] ml-1">Cliente paga</Badge>
                            )}
                          </span>
                          <span className={formaPagamentoSelecionada === 'cartao' ? 'text-red-400' : 'text-foreground'}>
                            {formatCurrency(previewTaxas.taxaGateway)}
                          </span>
                        </div>

                        {formaPagamentoSelecionada === 'cripto' && previewTaxas.taxaGas > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground flex items-center gap-1">
                              <Zap className="h-3 w-3" />
                              Taxa Gas (Polygon)
                            </span>
                            <span className="text-foreground">{formatCurrency(previewTaxas.taxaGas)}</span>
                          </div>
                        )}

                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Taxa Plataforma (5%)</span>
                          <span className="text-foreground">{formatCurrency(previewTaxas.taxaPlataforma)}</span>
                        </div>

                        <Separator className="bg-muted" />

                        <div className="flex justify-between font-bold text-foreground">
                          <span>Total Taxas</span>
                          <span>{formatCurrency(previewTaxas.totalTaxas)}</span>
                        </div>

                        {formaPagamentoSelecionada !== 'cartao' && (
                          <p className="text-xs text-muted-foreground flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            Taxas descontadas como custo de intermediacao no caixa
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="split" className="mt-4">
                    <Card className="bg-card border-border">
                      <CardContent className="pt-4 space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            Locador (85%)
                          </span>
                          <span className="font-bold text-emerald-400">
                            {formatCurrency(previewSplit.locador)}
                          </span>
                        </div>

                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground flex items-center gap-1">
                            <Shield className="h-4 w-4" />
                            Seguradora (5%)
                          </span>
                          <span className="text-foreground">{formatCurrency(previewSplit.seguradora)}</span>
                        </div>

                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground flex items-center gap-1">
                            <HandCoins className="h-4 w-4" />
                            Garantidor (5%)
                          </span>
                          <span className="text-foreground">
                            {selectedFatura.garantidorId
                              ? formatCurrency(previewSplit.garantidor)
                              : <span className="text-muted-foreground">N/A (vai p/ plataforma)</span>
                            }
                          </span>
                        </div>

                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground flex items-center gap-1">
                            <Landmark className="h-4 w-4" />
                            Plataforma (5%)
                          </span>
                          <span className="text-foreground">{formatCurrency(previewSplit.plataforma)}</span>
                        </div>

                        {previewSplit.imobiliaria && previewSplit.imobiliaria > 0 && (
                          <>
                            <Separator className="bg-muted" />
                            <div className="flex justify-between text-sm">
                              <span className="text-amber-400 flex items-center gap-1">
                                <Building2 className="h-4 w-4" />
                                Imobiliaria ({selectedFatura.imobiliariaNome})
                              </span>
                              <span className="text-amber-400 font-medium">
                                {formatCurrency(previewSplit.imobiliaria)}
                              </span>
                            </div>
                          </>
                        )}

                        <Separator className="bg-muted" />

                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <SplitSquareHorizontal className="h-3 w-3" />
                          Split executado automaticamente via Smart Contract
                        </p>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              )}

              {/* Conta Bancaria */}
              <div className="space-y-3">
                <Label className="text-muted-foreground">Conta para Credito</Label>
                <Select value={contaBancariaSelecionada} onValueChange={setContaBancariaSelecionada}>
                  <SelectTrigger className="bg-card border-border">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {MOCK_CONTAS_BANCARIAS.map(conta => (
                      <SelectItem key={conta.id} value={conta.id}>
                        {conta.nome} - {conta.banco} (Saldo: {formatCurrency(conta.saldo)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setPagamentoDialogOpen(false)} className="border-border">
              Cancelar
            </Button>
            <Button
              onClick={handleProcessarPagamento}
              disabled={processandoPagamento}
              className="bg-emerald-600 hover:bg-emerald-700"
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

      {/* Sheet de Detalhes */}
      <Sheet open={detalhesSheetOpen} onOpenChange={setDetalhesSheetOpen}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto bg-background border-border">
          <SheetHeader>
            <SheetTitle className="text-foreground">Detalhes da Fatura</SheetTitle>
            <SheetDescription className="text-muted-foreground">
              {selectedFatura?.id} - {selectedFatura?.competencia}
            </SheetDescription>
          </SheetHeader>

          {selectedFatura && (
            <div className="mt-6 space-y-6">
              {/* Status */}
              <div className="flex items-center justify-between">
                {getStatusBadge(selectedFatura.status)}
                {selectedFatura.nftTokenId && (
                  <Badge variant="outline" className="font-mono text-xs">
                    NFT: {selectedFatura.nftTokenId}
                  </Badge>
                )}
              </div>

              {/* Imovel */}
              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2 text-foreground">
                    <Home className="h-4 w-4" />
                    Imovel
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="font-medium text-foreground">{selectedFatura.imovelEndereco}</p>
                  <p className="text-sm text-muted-foreground">{selectedFatura.imovelCidade}</p>
                </CardContent>
              </Card>

              {/* Partes */}
              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2 text-foreground">
                    <Users className="h-4 w-4" />
                    Partes Envolvidas
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Inquilino</p>
                    <p className="font-medium text-foreground">{selectedFatura.inquilinoNome}</p>
                    <p className="text-xs text-muted-foreground">{selectedFatura.inquilinoCpf}</p>
                  </div>
                  <Separator className="bg-muted" />
                  <div>
                    <p className="text-xs text-muted-foreground">Locador</p>
                    <p className="font-medium text-foreground">{selectedFatura.locadorNome}</p>
                  </div>
                  {selectedFatura.garantidorNome && (
                    <>
                      <Separator className="bg-muted" />
                      <div>
                        <p className="text-xs text-muted-foreground">Garantidor</p>
                        <p className="font-medium text-foreground">{selectedFatura.garantidorNome}</p>
                      </div>
                    </>
                  )}
                  {selectedFatura.imobiliariaNome && (
                    <>
                      <Separator className="bg-muted" />
                      <div>
                        <p className="text-xs text-amber-400">Imobiliaria Parceira</p>
                        <p className="font-medium text-foreground">{selectedFatura.imobiliariaNome}</p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Valores */}
              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2 text-foreground">
                    <DollarSign className="h-4 w-4" />
                    Valores
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Aluguel</span>
                    <span className="text-foreground">{formatCurrency(selectedFatura.valorAluguel)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Condominio</span>
                    <span className="text-foreground">{formatCurrency(selectedFatura.valorCondominio)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">IPTU</span>
                    <span className="text-foreground">{formatCurrency(selectedFatura.valorIPTU)}</span>
                  </div>
                  <Separator className="bg-muted" />
                  <div className="flex justify-between font-bold text-foreground">
                    <span>Total</span>
                    <span>{formatCurrency(selectedFatura.valorTotal)}</span>
                  </div>
                  {selectedFatura.valorPago && (
                    <div className="flex justify-between text-emerald-400">
                      <span>Valor Pago</span>
                      <span className="font-bold">{formatCurrency(selectedFatura.valorPago)}</span>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Pagamento (se pago) */}
              {selectedFatura.status === 'pago' && selectedFatura.taxas && selectedFatura.split && (
                <>
                  <Card className="bg-card border-border">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2 text-foreground">
                        <Receipt className="h-4 w-4" />
                        Pagamento
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Forma</span>
                        <span className="flex items-center gap-1 capitalize text-foreground">
                          {getFormaPagamentoIcon(selectedFatura.formaPagamento)}
                          {selectedFatura.formaPagamento}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Data</span>
                        <span className="text-foreground">{selectedFatura.dataPagamento && formatDate(selectedFatura.dataPagamento)}</span>
                      </div>
                      {selectedFatura.txHashCripto && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">TX Hash</span>
                          <span className="font-mono text-xs truncate max-w-[150px] text-muted-foreground">
                            {selectedFatura.txHashCripto}
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="bg-card border-border">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2 text-foreground">
                        <SplitSquareHorizontal className="h-4 w-4" />
                        Split Executado
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Locador</span>
                        <span className="text-emerald-400 font-medium">
                          {formatCurrency(selectedFatura.split.locador)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Seguradora</span>
                        <span className="text-foreground">{formatCurrency(selectedFatura.split.seguradora)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Garantidor</span>
                        <span className="text-foreground">{formatCurrency(selectedFatura.split.garantidor)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Plataforma</span>
                        <span className="text-foreground">{formatCurrency(selectedFatura.split.plataforma)}</span>
                      </div>
                      {selectedFatura.split.imobiliaria && selectedFatura.split.imobiliaria > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-amber-400">Imobiliaria</span>
                          <span className="text-amber-400">
                            {formatCurrency(selectedFatura.split.imobiliaria)}
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="bg-card border-border">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2 text-foreground">
                        <Percent className="h-4 w-4" />
                        Taxas Descontadas (Custo Intermediacao)
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Taxa Gateway</span>
                        <span className="text-foreground">{formatCurrency(selectedFatura.taxas.taxaGateway)}</span>
                      </div>
                      {selectedFatura.taxas.taxaGas > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Taxa Gas</span>
                          <span className="text-foreground">{formatCurrency(selectedFatura.taxas.taxaGas)}</span>
                        </div>
                      )}
                      <Separator className="bg-muted" />
                      <div className="flex justify-between text-sm font-medium">
                        <span className="text-foreground">Total Taxas</span>
                        <span className="text-red-400">
                          -{formatCurrency(selectedFatura.taxas.taxaGateway + selectedFatura.taxas.taxaGas)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Lancado como despesa no caixa (Custo de Intermediacao)
                      </p>
                    </CardContent>
                  </Card>
                </>
              )}

              {/* Acoes */}
              {(selectedFatura.status === 'pendente' || selectedFatura.status === 'vencido') && (
                <Button
                  className="w-full bg-indigo-600 hover:bg-indigo-700"
                  onClick={() => {
                    setDetalhesSheetOpen(false);
                    handleAbrirPagamento(selectedFatura);
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
      </div>
    </div>
  );
}
