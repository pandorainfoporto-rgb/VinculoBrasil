/**
 * Vinculo.io - Contas a Pagar
 *
 * Formulario para gerenciamento de contas a pagar com dialog de pagamento.
 */

import { useState, useCallback } from 'react';
import {
  Receipt,
  Plus,
  Search,
  Edit,
  Trash2,
  MoreVertical,
  Save,
  X,
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
  ArrowRightLeft,
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
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
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

// ============================================
// TYPES
// ============================================

interface ContaPagar {
  id: string;
  descricao: string;
  fornecedorId: string;
  fornecedorNome: string;
  tipoDespesaId: string;
  tipoDespesaNome: string;
  categoriaContabil: string;
  numeroDocumento?: string;
  valor: number;
  dataEmissao: string;
  dataVencimento: string;
  dataPagamento?: string;
  valorPago?: number;
  tipoPagamento?: 'pix' | 'boleto' | 'transferencia' | 'cartao' | 'dinheiro';
  contaBancariaId?: string;
  contaBancariaNome?: string;
  status: 'pendente' | 'pago' | 'vencido' | 'parcial' | 'cancelado';
  recorrente: boolean;
  observacoes?: string;
  centroCusto?: string;
  createdAt: Date;
}

interface ContaBancaria {
  id: string;
  nome: string;
  banco: string;
  agencia: string;
  conta: string;
  saldo: number;
}

// ============================================
// MOCK DATA
// ============================================

// ============================================
// DADOS VAZIOS PARA PRODUCAO
// ============================================

const MOCK_CONTAS_BANCARIAS: ContaBancaria[] = [];

const MOCK_FORNECEDORES: { id: string; nome: string }[] = [];

const MOCK_TIPOS_DESPESA: { id: string; nome: string; categoria: string }[] = [];

const MOCK_CONTAS_PAGAR: ContaPagar[] = [];

// ============================================
// HELPER FUNCTIONS
// ============================================

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return new Intl.DateTimeFormat('pt-BR').format(date);
}

function getStatusConfig(status: ContaPagar['status']) {
  const configs = {
    pendente: { label: 'Pendente', color: 'bg-amber-500/10 text-amber-500 border-amber-500/20', icon: Clock },
    pago: { label: 'Pago', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20', icon: CheckCircle2 },
    vencido: { label: 'Vencido', color: 'bg-red-500/10 text-red-500 border-red-500/20', icon: AlertCircle },
    parcial: { label: 'Parcial', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20', icon: Clock },
    cancelado: { label: 'Cancelado', color: 'bg-muted text-muted-foreground border-border', icon: X },
  };
  return configs[status];
}

function getTipoPagamentoConfig(tipo: ContaPagar['tipoPagamento']) {
  const configs = {
    pix: { label: 'PIX', icon: QrCode },
    boleto: { label: 'Boleto', icon: Receipt },
    transferencia: { label: 'Transferencia', icon: ArrowRightLeft },
    cartao: { label: 'Cartao', icon: CreditCard },
    dinheiro: { label: 'Dinheiro', icon: Banknote },
  };
  return tipo ? configs[tipo] : null;
}

// ============================================
// PAYMENT DIALOG
// ============================================

function PagamentoDialog({
  open,
  onClose,
  conta,
  contasBancarias,
  onConfirm,
}: {
  open: boolean;
  onClose: () => void;
  conta: ContaPagar | null;
  contasBancarias: ContaBancaria[];
  onConfirm: (pagamento: { tipoPagamento: string; contaBancariaId: string; valorPago: number; dataPagamento: string }) => void;
}) {
  const [tipoPagamento, setTipoPagamento] = useState<string>('pix');
  const [contaBancariaId, setContaBancariaId] = useState<string>(contasBancarias[0]?.id || '');
  const [valorPago, setValorPago] = useState<number>(conta?.valor || 0);
  const [dataPagamento, setDataPagamento] = useState<string>(new Date().toISOString().split('T')[0]);

  if (!conta) return null;

  const contaSelecionada = contasBancarias.find(c => c.id === contaBancariaId);

  const handleConfirm = () => {
    onConfirm({
      tipoPagamento,
      contaBancariaId,
      valorPago,
      dataPagamento,
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-background border-border max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-2">
            <Wallet className="h-5 w-5 text-emerald-400" />
            Registrar Pagamento
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Confirme os dados do pagamento
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Resumo da Conta */}
          <div className="p-4 bg-card rounded-xl border border-border">
            <div className="flex justify-between items-start mb-3">
              <div>
                <p className="font-bold text-foreground">{conta.descricao}</p>
                <p className="text-sm text-muted-foreground">{conta.fornecedorNome}</p>
              </div>
              <p className="text-xl font-black text-indigo-400">{formatCurrency(conta.valor)}</p>
            </div>
            <div className="flex gap-4 text-sm text-muted-foreground">
              <span>Vencimento: {formatDate(conta.dataVencimento)}</span>
              {conta.numeroDocumento && <span>Doc: {conta.numeroDocumento}</span>}
            </div>
          </div>

          {/* Tipo de Pagamento */}
          <div className="space-y-3">
            <Label className="text-muted-foreground">Forma de Pagamento</Label>
            <RadioGroup value={tipoPagamento} onValueChange={setTipoPagamento} className="grid grid-cols-3 gap-3">
              {[
                { value: 'pix', label: 'PIX', icon: QrCode },
                { value: 'boleto', label: 'Boleto', icon: Receipt },
                { value: 'transferencia', label: 'TED/DOC', icon: ArrowRightLeft },
                { value: 'cartao', label: 'Cartao', icon: CreditCard },
                { value: 'dinheiro', label: 'Dinheiro', icon: Banknote },
              ].map((tipo) => (
                <Label
                  key={tipo.value}
                  className={`flex flex-col items-center gap-2 p-4 rounded-lg border cursor-pointer transition-all ${
                    tipoPagamento === tipo.value
                      ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-400'
                      : 'bg-card border-border text-muted-foreground hover:bg-muted'
                  }`}
                >
                  <RadioGroupItem value={tipo.value} className="sr-only" />
                  <tipo.icon className="h-5 w-5" />
                  <span className="text-xs font-medium">{tipo.label}</span>
                </Label>
              ))}
            </RadioGroup>
          </div>

          {/* Conta Bancaria */}
          <div className="space-y-3">
            <Label className="text-muted-foreground">Conta Bancaria</Label>
            <Select value={contaBancariaId} onValueChange={setContaBancariaId}>
              <SelectTrigger className="bg-card border-border">
                <SelectValue placeholder="Selecione a conta" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {contasBancarias.map((cb) => (
                  <SelectItem key={cb.id} value={cb.id}>
                    <div className="flex justify-between items-center gap-4">
                      <span>{cb.nome} - {cb.banco}</span>
                      <span className="text-emerald-400 font-mono text-sm">{formatCurrency(cb.saldo)}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {contaSelecionada && (
              <p className="text-xs text-muted-foreground">
                Saldo disponivel: <span className="text-emerald-400 font-bold">{formatCurrency(contaSelecionada.saldo)}</span>
              </p>
            )}
          </div>

          {/* Valor e Data */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-muted-foreground">Valor Pago</Label>
              <Input
                type="number"
                value={valorPago}
                onChange={(e) => setValorPago(parseFloat(e.target.value) || 0)}
                className="bg-card border-border"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-muted-foreground">Data do Pagamento</Label>
              <Input
                type="date"
                value={dataPagamento}
                onChange={(e) => setDataPagamento(e.target.value)}
                className="bg-card border-border"
              />
            </div>
          </div>

          {/* Aviso de Saldo */}
          {contaSelecionada && valorPago > contaSelecionada.saldo && (
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-red-400" />
              <p className="text-sm text-red-400">Saldo insuficiente na conta selecionada</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="border-border">
            Cancelar
          </Button>
          <Button
            onClick={handleConfirm}
            className="bg-emerald-600 hover:bg-emerald-700"
            disabled={contaSelecionada && valorPago > contaSelecionada.saldo}
          >
            <CheckCircle2 className="h-4 w-4 mr-2" />
            Confirmar Pagamento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================
// FORM DIALOG
// ============================================

function ContaPagarFormDialog({
  open,
  onClose,
  conta,
  onSave,
  fornecedores,
  tiposDespesa,
  onNovoFornecedor,
  onNovoTipoDespesa,
}: {
  open: boolean;
  onClose: () => void;
  conta?: ContaPagar | null;
  onSave: (data: Partial<ContaPagar>) => void;
  fornecedores: { id: string; nome: string }[];
  tiposDespesa: { id: string; nome: string; categoria: string }[];
  onNovoFornecedor: () => void;
  onNovoTipoDespesa: () => void;
}) {
  const [formData, setFormData] = useState<Partial<ContaPagar>>(
    conta || {
      descricao: '',
      fornecedorId: '',
      fornecedorNome: '',
      tipoDespesaId: '',
      tipoDespesaNome: '',
      categoriaContabil: '',
      numeroDocumento: '',
      valor: 0,
      dataEmissao: new Date().toISOString().split('T')[0],
      dataVencimento: '',
      status: 'pendente',
      recorrente: false,
      centroCusto: '',
      observacoes: '',
    }
  );

  const handleSubmit = () => {
    onSave(formData);
    onClose();
  };

  const updateField = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFornecedorChange = (fornecedorId: string) => {
    const fornecedor = fornecedores.find(f => f.id === fornecedorId);
    setFormData(prev => ({
      ...prev,
      fornecedorId,
      fornecedorNome: fornecedor?.nome || '',
    }));
  };

  const handleTipoDespesaChange = (tipoDespesaId: string) => {
    const tipo = tiposDespesa.find(t => t.id === tipoDespesaId);
    setFormData(prev => ({
      ...prev,
      tipoDespesaId,
      tipoDespesaNome: tipo?.nome || '',
      categoriaContabil: tipo?.categoria || '',
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-background border-border max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-2">
            <Receipt className="h-5 w-5 text-indigo-400" />
            {conta ? 'Editar Conta a Pagar' : 'Nova Conta a Pagar'}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Preencha os dados da conta a pagar
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Descricao */}
          <div>
            <Label className="text-muted-foreground">Descricao *</Label>
            <Input
              value={formData.descricao || ''}
              onChange={(e) => updateField('descricao', e.target.value)}
              className="bg-card border-border mt-1"
              placeholder="Descricao da conta"
            />
          </div>

          {/* Fornecedor e Tipo de Despesa */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between">
                <Label className="text-muted-foreground">Fornecedor *</Label>
                <Button
                  variant="link"
                  size="sm"
                  className="h-auto p-0 text-xs text-indigo-400"
                  onClick={onNovoFornecedor}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Novo fornecedor
                </Button>
              </div>
              <Select value={formData.fornecedorId} onValueChange={handleFornecedorChange}>
                <SelectTrigger className="bg-card border-border mt-1">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {fornecedores.map((f) => (
                    <SelectItem key={f.id} value={f.id}>
                      {f.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <div className="flex items-center justify-between">
                <Label className="text-muted-foreground">Tipo de Despesa *</Label>
                <Button
                  variant="link"
                  size="sm"
                  className="h-auto p-0 text-xs text-indigo-400"
                  onClick={onNovoTipoDespesa}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Novo tipo
                </Button>
              </div>
              <Select value={formData.tipoDespesaId} onValueChange={handleTipoDespesaChange}>
                <SelectTrigger className="bg-card border-border mt-1">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  {tiposDespesa.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Categoria Contabil */}
          {formData.categoriaContabil && (
            <div className="p-3 bg-card rounded-lg border border-border">
              <p className="text-xs text-muted-foreground">Categoria Contabil</p>
              <p className="text-sm font-bold text-indigo-400">{formData.categoriaContabil}</p>
            </div>
          )}

          {/* Valores */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label className="text-muted-foreground">Valor *</Label>
              <Input
                type="number"
                value={formData.valor || ''}
                onChange={(e) => updateField('valor', parseFloat(e.target.value) || 0)}
                className="bg-card border-border mt-1"
                placeholder="0.00"
              />
            </div>
            <div>
              <Label className="text-muted-foreground">Data Emissao</Label>
              <Input
                type="date"
                value={formData.dataEmissao || ''}
                onChange={(e) => updateField('dataEmissao', e.target.value)}
                className="bg-card border-border mt-1"
              />
            </div>
            <div>
              <Label className="text-muted-foreground">Data Vencimento *</Label>
              <Input
                type="date"
                value={formData.dataVencimento || ''}
                onChange={(e) => updateField('dataVencimento', e.target.value)}
                className="bg-card border-border mt-1"
              />
            </div>
          </div>

          {/* Documento e Centro de Custo */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-muted-foreground">Numero do Documento</Label>
              <Input
                value={formData.numeroDocumento || ''}
                onChange={(e) => updateField('numeroDocumento', e.target.value)}
                className="bg-card border-border mt-1"
                placeholder="NF, Fatura, OS..."
              />
            </div>
            <div>
              <Label className="text-muted-foreground">Centro de Custo</Label>
              <Input
                value={formData.centroCusto || ''}
                onChange={(e) => updateField('centroCusto', e.target.value)}
                className="bg-card border-border mt-1"
                placeholder="ADM001, OP001..."
              />
            </div>
          </div>

          {/* Observacoes */}
          <div>
            <Label className="text-muted-foreground">Observacoes</Label>
            <Textarea
              value={formData.observacoes || ''}
              onChange={(e) => updateField('observacoes', e.target.value)}
              className="bg-card border-border mt-1"
              placeholder="Observacoes adicionais..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="border-border">
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <Button onClick={handleSubmit} className="bg-indigo-600 hover:bg-indigo-700">
            <Save className="h-4 w-4 mr-2" />
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export function ContasPagarForm() {
  const [contasPagar, setContasPagar] = useState<ContaPagar[]>(MOCK_CONTAS_PAGAR);
  const [contasBancarias] = useState<ContaBancaria[]>(MOCK_CONTAS_BANCARIAS);
  const [fornecedores, setFornecedores] = useState(MOCK_FORNECEDORES);
  const [tiposDespesa, setTiposDespesa] = useState(MOCK_TIPOS_DESPESA);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [pagamentoDialogOpen, setPagamentoDialogOpen] = useState(false);
  const [novoFornecedorDialogOpen, setNovoFornecedorDialogOpen] = useState(false);
  const [novoTipoDespesaDialogOpen, setNovoTipoDespesaDialogOpen] = useState(false);
  const [selectedConta, setSelectedConta] = useState<ContaPagar | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [contaToDelete, setContaToDelete] = useState<ContaPagar | null>(null);

  // Form states para novo fornecedor e tipo de despesa
  const [novoFornecedorForm, setNovoFornecedorForm] = useState({
    nome: '',
    cnpj: '',
    email: '',
    telefone: '',
    categoria: 'servicos' as 'servicos' | 'materiais' | 'equipamentos' | 'manutencao' | 'outros',
  });

  const [novoTipoDespesaForm, setNovoTipoDespesaForm] = useState({
    nome: '',
    categoria: '',
  });

  const filteredContas = contasPagar.filter((c) => {
    const matchesSearch =
      c.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.fornecedorNome.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calcular totais
  const totalPendente = contasPagar
    .filter(c => c.status === 'pendente')
    .reduce((sum, c) => sum + c.valor, 0);
  const totalVencido = contasPagar
    .filter(c => c.status === 'vencido')
    .reduce((sum, c) => sum + c.valor, 0);
  const totalPago = contasPagar
    .filter(c => c.status === 'pago')
    .reduce((sum, c) => sum + (c.valorPago || 0), 0);

  const handleNewConta = () => {
    setSelectedConta(null);
    setFormDialogOpen(true);
  };

  const handleEditConta = (conta: ContaPagar) => {
    setSelectedConta(conta);
    setFormDialogOpen(true);
  };

  const handlePagarConta = (conta: ContaPagar) => {
    setSelectedConta(conta);
    setPagamentoDialogOpen(true);
  };

  const handleDeleteConta = (conta: ContaPagar) => {
    setContaToDelete(conta);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (contaToDelete) {
      setContasPagar(prev => prev.filter(c => c.id !== contaToDelete.id));
      setDeleteDialogOpen(false);
      setContaToDelete(null);
    }
  };

  const handleSaveConta = useCallback((data: Partial<ContaPagar>) => {
    if (selectedConta) {
      setContasPagar(prev =>
        prev.map(c => (c.id === selectedConta.id ? { ...c, ...data } : c))
      );
    } else {
      const newConta: ContaPagar = {
        ...data,
        id: `cp_${Date.now()}`,
        createdAt: new Date(),
      } as ContaPagar;
      setContasPagar(prev => [...prev, newConta]);
    }
  }, [selectedConta]);

  const handleConfirmPagamento = useCallback((pagamento: {
    tipoPagamento: string;
    contaBancariaId: string;
    valorPago: number;
    dataPagamento: string;
  }) => {
    if (selectedConta) {
      const contaBancaria = contasBancarias.find(c => c.id === pagamento.contaBancariaId);
      setContasPagar(prev =>
        prev.map(c => {
          if (c.id === selectedConta.id) {
            const novoStatus = pagamento.valorPago >= c.valor ? 'pago' : 'parcial';
            return {
              ...c,
              status: novoStatus as ContaPagar['status'],
              tipoPagamento: pagamento.tipoPagamento as ContaPagar['tipoPagamento'],
              contaBancariaId: pagamento.contaBancariaId,
              contaBancariaNome: contaBancaria?.nome || '',
              valorPago: pagamento.valorPago,
              dataPagamento: pagamento.dataPagamento,
            };
          }
          return c;
        })
      );
    }
  }, [selectedConta, contasBancarias]);

  // Handler para criar novo fornecedor
  const handleCriarFornecedor = useCallback(() => {
    const novoFornecedor = {
      id: `f_${Date.now()}`,
      nome: novoFornecedorForm.nome,
    };
    setFornecedores(prev => [novoFornecedor, ...prev]);
    setNovoFornecedorDialogOpen(false);
    setNovoFornecedorForm({
      nome: '',
      cnpj: '',
      email: '',
      telefone: '',
      categoria: 'servicos',
    });
  }, [novoFornecedorForm]);

  // Handler para criar novo tipo de despesa
  const handleCriarTipoDespesa = useCallback(() => {
    const novoTipo = {
      id: `td_${Date.now()}`,
      nome: novoTipoDespesaForm.nome,
      categoria: novoTipoDespesaForm.categoria,
    };
    setTiposDespesa(prev => [novoTipo, ...prev]);
    setNovoTipoDespesaDialogOpen(false);
    setNovoTipoDespesaForm({
      nome: '',
      categoria: '',
    });
  }, [novoTipoDespesaForm]);

  return (
    <div className="bg-background text-foreground font-sans">
      
        <div className="max-w-7xl mx-auto p-8 space-y-6 pb-16">
          {/* Header */}
          <div className="flex justify-between items-center border-b border-border pb-6">
            <div>
              <h1 className="text-3xl font-black tracking-tight">CONTAS A PAGAR</h1>
              <p className="text-muted-foreground text-sm mt-1">
                Gerenciamento de contas a pagar e pagamentos
              </p>
            </div>
            <Button onClick={handleNewConta} className="bg-indigo-600 hover:bg-indigo-700">
              <Plus className="h-4 w-4 mr-2" />
              Nova Conta
            </Button>
          </div>

          {/* Filters */}
          <div className="flex gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por descricao ou fornecedor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-card border-border"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40 bg-card border-border">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="all">Todos Status</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
                <SelectItem value="pago">Pago</SelectItem>
                <SelectItem value="vencido">Vencido</SelectItem>
                <SelectItem value="parcial">Parcial</SelectItem>
                <SelectItem value="cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <p className="text-[10px] text-muted-foreground uppercase font-bold">Total Contas</p>
                <p className="text-2xl font-black">{contasPagar.length}</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <p className="text-[10px] text-muted-foreground uppercase font-bold">A Pagar</p>
                <p className="text-xl font-black text-amber-400">{formatCurrency(totalPendente)}</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <p className="text-[10px] text-muted-foreground uppercase font-bold">Vencido</p>
                <p className="text-xl font-black text-red-400">{formatCurrency(totalVencido)}</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <p className="text-[10px] text-muted-foreground uppercase font-bold">Pago (Mes)</p>
                <p className="text-xl font-black text-emerald-400">{formatCurrency(totalPago)}</p>
              </CardContent>
            </Card>
          </div>

          {/* Table */}
          <Card className="bg-card border-border">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground text-[10px] uppercase font-bold">
                    Descricao / Fornecedor
                  </TableHead>
                  <TableHead className="text-muted-foreground text-[10px] uppercase font-bold">
                    Tipo Despesa
                  </TableHead>
                  <TableHead className="text-muted-foreground text-[10px] uppercase font-bold">
                    Valor
                  </TableHead>
                  <TableHead className="text-muted-foreground text-[10px] uppercase font-bold">
                    Vencimento
                  </TableHead>
                  <TableHead className="text-muted-foreground text-[10px] uppercase font-bold">
                    Status
                  </TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContas.map((conta) => {
                  const statusConfig = getStatusConfig(conta.status);
                  return (
                    <TableRow
                      key={conta.id}
                      className="border-border/50 hover:bg-card/5 transition-colors"
                    >
                      <TableCell>
                        <div>
                          <p className="font-bold text-sm">{conta.descricao}</p>
                          <p className="text-[10px] text-muted-foreground">{conta.fornecedorNome}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm text-muted-foreground">{conta.tipoDespesaNome}</p>
                          <p className="text-[10px] text-muted-foreground">{conta.categoriaContabil}</p>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm font-bold text-foreground">
                        {formatCurrency(conta.valor)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(conta.dataVencimento)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={statusConfig.color}>
                          <statusConfig.icon className="h-3 w-3 mr-1" />
                          {statusConfig.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-card border-border">
                            {(conta.status === 'pendente' || conta.status === 'vencido') && (
                              <DropdownMenuItem
                                onClick={() => handlePagarConta(conta)}
                                className="text-emerald-400 focus:bg-muted cursor-pointer"
                              >
                                <Wallet className="h-4 w-4 mr-2" />
                                Pagar
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem
                              onClick={() => handleEditConta(conta)}
                              className="text-muted-foreground focus:bg-muted cursor-pointer"
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteConta(conta)}
                              className="text-red-400 focus:bg-muted cursor-pointer"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>
        </div>
      

      {/* Form Dialog */}
      <ContaPagarFormDialog
        open={formDialogOpen}
        onClose={() => setFormDialogOpen(false)}
        conta={selectedConta}
        onSave={handleSaveConta}
        fornecedores={fornecedores}
        tiposDespesa={tiposDespesa}
        onNovoFornecedor={() => setNovoFornecedorDialogOpen(true)}
        onNovoTipoDespesa={() => setNovoTipoDespesaDialogOpen(true)}
      />

      {/* Pagamento Dialog */}
      <PagamentoDialog
        open={pagamentoDialogOpen}
        onClose={() => setPagamentoDialogOpen(false)}
        conta={selectedConta}
        contasBancarias={contasBancarias}
        onConfirm={handleConfirmPagamento}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-background border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Confirmar Exclusao</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Tem certeza que deseja excluir a conta "{contaToDelete?.descricao}"?
              Esta acao nao pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-card border-border text-muted-foreground hover:bg-muted">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Novo Fornecedor Dialog */}
      <Dialog open={novoFornecedorDialogOpen} onOpenChange={setNovoFornecedorDialogOpen}>
        <DialogContent className="bg-background border-border max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2">
              <Building2 className="h-5 w-5 text-indigo-400" />
              Novo Fornecedor
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Cadastro rapido de fornecedor
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label className="text-muted-foreground">Nome / Razao Social *</Label>
              <Input
                value={novoFornecedorForm.nome}
                onChange={(e) => setNovoFornecedorForm(prev => ({ ...prev, nome: e.target.value }))}
                className="bg-card border-border mt-1"
                placeholder="Nome do fornecedor"
              />
            </div>
            <div>
              <Label className="text-muted-foreground">CNPJ</Label>
              <Input
                value={novoFornecedorForm.cnpj}
                onChange={(e) => setNovoFornecedorForm(prev => ({ ...prev, cnpj: e.target.value }))}
                className="bg-card border-border mt-1"
                placeholder="00.000.000/0000-00"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">E-mail</Label>
                <Input
                  type="email"
                  value={novoFornecedorForm.email}
                  onChange={(e) => setNovoFornecedorForm(prev => ({ ...prev, email: e.target.value }))}
                  className="bg-card border-border mt-1"
                  placeholder="email@fornecedor.com"
                />
              </div>
              <div>
                <Label className="text-muted-foreground">Telefone</Label>
                <Input
                  value={novoFornecedorForm.telefone}
                  onChange={(e) => setNovoFornecedorForm(prev => ({ ...prev, telefone: e.target.value }))}
                  className="bg-card border-border mt-1"
                  placeholder="(00) 00000-0000"
                />
              </div>
            </div>
            <div>
              <Label className="text-muted-foreground">Categoria</Label>
              <Select
                value={novoFornecedorForm.categoria}
                onValueChange={(v) => setNovoFornecedorForm(prev => ({ ...prev, categoria: v as typeof novoFornecedorForm.categoria }))}
              >
                <SelectTrigger className="bg-card border-border mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="servicos">Servicos</SelectItem>
                  <SelectItem value="materiais">Materiais</SelectItem>
                  <SelectItem value="equipamentos">Equipamentos</SelectItem>
                  <SelectItem value="manutencao">Manutencao</SelectItem>
                  <SelectItem value="outros">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setNovoFornecedorDialogOpen(false)} className="border-border">
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button
              onClick={handleCriarFornecedor}
              disabled={!novoFornecedorForm.nome}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              <Save className="h-4 w-4 mr-2" />
              Cadastrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Novo Tipo de Despesa Dialog */}
      <Dialog open={novoTipoDespesaDialogOpen} onOpenChange={setNovoTipoDespesaDialogOpen}>
        <DialogContent className="bg-background border-border max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2">
              <Receipt className="h-5 w-5 text-indigo-400" />
              Novo Tipo de Despesa
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Cadastro rapido de tipo de despesa
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <Label className="text-muted-foreground">Nome *</Label>
              <Input
                value={novoTipoDespesaForm.nome}
                onChange={(e) => setNovoTipoDespesaForm(prev => ({ ...prev, nome: e.target.value }))}
                className="bg-card border-border mt-1"
                placeholder="Nome do tipo de despesa"
              />
            </div>
            <div>
              <Label className="text-muted-foreground">Categoria Contabil *</Label>
              <Select
                value={novoTipoDespesaForm.categoria}
                onValueChange={(v) => setNovoTipoDespesaForm(prev => ({ ...prev, categoria: v }))}
              >
                <SelectTrigger className="bg-card border-border mt-1">
                  <SelectValue placeholder="Selecione a categoria" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="Custos Fixos">Custos Fixos</SelectItem>
                  <SelectItem value="Custos Operacionais">Custos Operacionais</SelectItem>
                  <SelectItem value="Despesas Administrativas">Despesas Administrativas</SelectItem>
                  <SelectItem value="Despesas Comerciais">Despesas Comerciais</SelectItem>
                  <SelectItem value="Despesas Financeiras">Despesas Financeiras</SelectItem>
                  <SelectItem value="Tecnologia">Tecnologia</SelectItem>
                  <SelectItem value="Impostos e Taxas">Impostos e Taxas</SelectItem>
                  <SelectItem value="Pessoal e Encargos">Pessoal e Encargos</SelectItem>
                  <SelectItem value="Outros">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setNovoTipoDespesaDialogOpen(false)} className="border-border">
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button
              onClick={handleCriarTipoDespesa}
              disabled={!novoTipoDespesaForm.nome || !novoTipoDespesaForm.categoria}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              <Save className="h-4 w-4 mr-2" />
              Cadastrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default ContasPagarForm;
