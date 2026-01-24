/**
 * Vinculo.io - Cadastro de Colaboradores
 *
 * Formulario para gerenciamento de colaboradores da plataforma.
 */

import { useState, useCallback } from 'react';
import {
  Users,
  Plus,
  Search,
  Edit,
  Trash2,
  Phone,
  Mail,
  MapPin,
  MoreVertical,
  Save,
  X,
  Briefcase,
  Calendar,
  DollarSign,
  CreditCard,
  Building2,
} from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
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

// ============================================
// TYPES
// ============================================

interface Colaborador {
  id: string;
  nome: string;
  cpf: string;
  rg?: string;
  dataNascimento: string;
  email: string;
  telefone: string;
  endereco: {
    logradouro: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    estado: string;
    cep: string;
  };
  cargo: string;
  departamento: string;
  dataAdmissao: string;
  dataDemissao?: string;
  tipoContrato: 'clt' | 'pj' | 'estagiario' | 'temporario';
  salario: number;
  centroCusto: string;
  dadosBancarios: {
    banco: string;
    agencia: string;
    conta: string;
    tipoConta: 'corrente' | 'poupanca';
    pix?: string;
  };
  status: 'ativo' | 'inativo' | 'ferias' | 'afastado';
  observacoes?: string;
  createdAt: Date;
}

// ============================================
// MOCK DATA
// ============================================

// ============================================
// DADOS VAZIOS PARA PRODUCAO
// ============================================

const MOCK_COLABORADORES: Colaborador[] = [];

const DEPARTAMENTOS = [
  'Operacoes',
  'Tecnologia',
  'Financeiro',
  'Comercial',
  'RH',
  'Marketing',
  'Juridico',
  'Administrativo',
];

const BANCOS = [
  'Banco do Brasil',
  'Bradesco',
  'Caixa Economica',
  'Itau',
  'Nubank',
  'Santander',
  'Inter',
  'C6 Bank',
  'BTG Pactual',
  'Safra',
];

const ESTADOS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
  'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

// ============================================
// HELPER FUNCTIONS
// ============================================

function formatCPF(value: string): string {
  const numbers = value.replace(/\D/g, '');
  return numbers
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1-$2')
    .slice(0, 14);
}

function formatPhone(value: string): string {
  const numbers = value.replace(/\D/g, '');
  if (numbers.length <= 10) {
    return numbers
      .replace(/^(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .slice(0, 14);
  }
  return numbers
    .replace(/^(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .slice(0, 15);
}

function formatCEP(value: string): string {
  const numbers = value.replace(/\D/g, '');
  return numbers.replace(/^(\d{5})(\d)/, '$1-$2').slice(0, 9);
}

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

function getStatusConfig(status: Colaborador['status']) {
  const configs = {
    ativo: { label: 'Ativo', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
    inativo: { label: 'Inativo', color: 'bg-muted text-muted-foreground border-border' },
    ferias: { label: 'Ferias', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' },
    afastado: { label: 'Afastado', color: 'bg-amber-500/10 text-amber-500 border-amber-500/20' },
  };
  return configs[status];
}

function getTipoContratoLabel(tipo: Colaborador['tipoContrato']): string {
  const labels = {
    clt: 'CLT',
    pj: 'PJ',
    estagiario: 'Estagiario',
    temporario: 'Temporario',
  };
  return labels[tipo];
}

// ============================================
// COMPONENTS
// ============================================

function ColaboradorFormDialog({
  open,
  onClose,
  colaborador,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  colaborador?: Colaborador | null;
  onSave: (data: Partial<Colaborador>) => void;
}) {
  const [formData, setFormData] = useState<Partial<Colaborador>>(
    colaborador || {
      nome: '',
      cpf: '',
      rg: '',
      dataNascimento: '',
      email: '',
      telefone: '',
      endereco: {
        logradouro: '',
        numero: '',
        complemento: '',
        bairro: '',
        cidade: '',
        estado: '',
        cep: '',
      },
      cargo: '',
      departamento: '',
      dataAdmissao: '',
      tipoContrato: 'clt',
      salario: 0,
      centroCusto: '',
      dadosBancarios: {
        banco: '',
        agencia: '',
        conta: '',
        tipoConta: 'corrente',
        pix: '',
      },
      status: 'ativo',
      observacoes: '',
    }
  );

  const handleSubmit = () => {
    onSave(formData);
    onClose();
  };

  const updateField = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateEndereco = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      endereco: { ...prev.endereco!, [field]: value },
    }));
  };

  const updateBancarios = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      dadosBancarios: { ...prev.dadosBancarios!, [field]: value },
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-background border-border max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-2">
            <Users className="h-5 w-5 text-indigo-400" />
            {colaborador ? 'Editar Colaborador' : 'Novo Colaborador'}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Preencha os dados do colaborador
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Dados Pessoais */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
              Dados Pessoais
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <Label className="text-muted-foreground">Nome Completo *</Label>
                <Input
                  value={formData.nome || ''}
                  onChange={(e) => updateField('nome', e.target.value)}
                  className="bg-card border-border mt-1"
                  placeholder="Nome completo"
                />
              </div>
              <div>
                <Label className="text-muted-foreground">Data de Nascimento</Label>
                <Input
                  type="date"
                  value={formData.dataNascimento || ''}
                  onChange={(e) => updateField('dataNascimento', e.target.value)}
                  className="bg-card border-border mt-1"
                />
              </div>
              <div>
                <Label className="text-muted-foreground">CPF *</Label>
                <Input
                  value={formData.cpf || ''}
                  onChange={(e) => updateField('cpf', formatCPF(e.target.value))}
                  className="bg-card border-border mt-1"
                  placeholder="000.000.000-00"
                />
              </div>
              <div>
                <Label className="text-muted-foreground">RG</Label>
                <Input
                  value={formData.rg || ''}
                  onChange={(e) => updateField('rg', e.target.value)}
                  className="bg-card border-border mt-1"
                  placeholder="RG"
                />
              </div>
              <div>
                <Label className="text-muted-foreground">Telefone *</Label>
                <Input
                  value={formData.telefone || ''}
                  onChange={(e) => updateField('telefone', formatPhone(e.target.value))}
                  className="bg-card border-border mt-1"
                  placeholder="(00) 00000-0000"
                />
              </div>
              <div className="col-span-2">
                <Label className="text-muted-foreground">E-mail *</Label>
                <Input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => updateField('email', e.target.value)}
                  className="bg-card border-border mt-1"
                  placeholder="email@empresa.com.br"
                />
              </div>
            </div>
          </div>

          {/* Endereco */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
              Endereco
            </h3>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <Label className="text-muted-foreground">CEP</Label>
                <Input
                  value={formData.endereco?.cep || ''}
                  onChange={(e) => updateEndereco('cep', formatCEP(e.target.value))}
                  className="bg-card border-border mt-1"
                  placeholder="00000-000"
                />
              </div>
              <div className="col-span-2">
                <Label className="text-muted-foreground">Logradouro</Label>
                <Input
                  value={formData.endereco?.logradouro || ''}
                  onChange={(e) => updateEndereco('logradouro', e.target.value)}
                  className="bg-card border-border mt-1"
                  placeholder="Rua, Av., etc."
                />
              </div>
              <div>
                <Label className="text-muted-foreground">Numero</Label>
                <Input
                  value={formData.endereco?.numero || ''}
                  onChange={(e) => updateEndereco('numero', e.target.value)}
                  className="bg-card border-border mt-1"
                  placeholder="000"
                />
              </div>
              <div>
                <Label className="text-muted-foreground">Complemento</Label>
                <Input
                  value={formData.endereco?.complemento || ''}
                  onChange={(e) => updateEndereco('complemento', e.target.value)}
                  className="bg-card border-border mt-1"
                  placeholder="Sala, Apto"
                />
              </div>
              <div>
                <Label className="text-muted-foreground">Bairro</Label>
                <Input
                  value={formData.endereco?.bairro || ''}
                  onChange={(e) => updateEndereco('bairro', e.target.value)}
                  className="bg-card border-border mt-1"
                  placeholder="Bairro"
                />
              </div>
              <div>
                <Label className="text-muted-foreground">Cidade</Label>
                <Input
                  value={formData.endereco?.cidade || ''}
                  onChange={(e) => updateEndereco('cidade', e.target.value)}
                  className="bg-card border-border mt-1"
                  placeholder="Cidade"
                />
              </div>
              <div>
                <Label className="text-muted-foreground">Estado</Label>
                <Select
                  value={formData.endereco?.estado}
                  onValueChange={(v) => updateEndereco('estado', v)}
                >
                  <SelectTrigger className="bg-card border-border mt-1">
                    <SelectValue placeholder="UF" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border max-h-48">
                    {ESTADOS.map((uf) => (
                      <SelectItem key={uf} value={uf}>
                        {uf}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Dados Profissionais */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
              Dados Profissionais
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label className="text-muted-foreground">Cargo *</Label>
                <Input
                  value={formData.cargo || ''}
                  onChange={(e) => updateField('cargo', e.target.value)}
                  className="bg-card border-border mt-1"
                  placeholder="Cargo"
                />
              </div>
              <div>
                <Label className="text-muted-foreground">Departamento *</Label>
                <Select
                  value={formData.departamento}
                  onValueChange={(v) => updateField('departamento', v)}
                >
                  <SelectTrigger className="bg-card border-border mt-1">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {DEPARTAMENTOS.map((dep) => (
                      <SelectItem key={dep} value={dep}>
                        {dep}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-muted-foreground">Centro de Custo</Label>
                <Input
                  value={formData.centroCusto || ''}
                  onChange={(e) => updateField('centroCusto', e.target.value)}
                  className="bg-card border-border mt-1"
                  placeholder="CC001"
                />
              </div>
              <div>
                <Label className="text-muted-foreground">Tipo de Contrato *</Label>
                <Select
                  value={formData.tipoContrato}
                  onValueChange={(v) => updateField('tipoContrato', v)}
                >
                  <SelectTrigger className="bg-card border-border mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="clt">CLT</SelectItem>
                    <SelectItem value="pj">PJ</SelectItem>
                    <SelectItem value="estagiario">Estagiario</SelectItem>
                    <SelectItem value="temporario">Temporario</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-muted-foreground">Salario *</Label>
                <Input
                  type="number"
                  value={formData.salario || ''}
                  onChange={(e) => updateField('salario', parseFloat(e.target.value) || 0)}
                  className="bg-card border-border mt-1"
                  placeholder="0.00"
                />
              </div>
              <div>
                <Label className="text-muted-foreground">Data de Admissao *</Label>
                <Input
                  type="date"
                  value={formData.dataAdmissao || ''}
                  onChange={(e) => updateField('dataAdmissao', e.target.value)}
                  className="bg-card border-border mt-1"
                />
              </div>
            </div>
          </div>

          {/* Dados Bancarios */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
              Dados Bancarios
            </h3>
            <div className="grid grid-cols-5 gap-4">
              <div className="col-span-2">
                <Label className="text-muted-foreground">Banco</Label>
                <Select
                  value={formData.dadosBancarios?.banco}
                  onValueChange={(v) => updateBancarios('banco', v)}
                >
                  <SelectTrigger className="bg-card border-border mt-1">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {BANCOS.map((banco) => (
                      <SelectItem key={banco} value={banco}>
                        {banco}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-muted-foreground">Agencia</Label>
                <Input
                  value={formData.dadosBancarios?.agencia || ''}
                  onChange={(e) => updateBancarios('agencia', e.target.value)}
                  className="bg-card border-border mt-1"
                  placeholder="0000"
                />
              </div>
              <div>
                <Label className="text-muted-foreground">Conta</Label>
                <Input
                  value={formData.dadosBancarios?.conta || ''}
                  onChange={(e) => updateBancarios('conta', e.target.value)}
                  className="bg-card border-border mt-1"
                  placeholder="00000-0"
                />
              </div>
              <div>
                <Label className="text-muted-foreground">Tipo</Label>
                <Select
                  value={formData.dadosBancarios?.tipoConta}
                  onValueChange={(v) => updateBancarios('tipoConta', v)}
                >
                  <SelectTrigger className="bg-card border-border mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="corrente">Corrente</SelectItem>
                    <SelectItem value="poupanca">Poupanca</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2">
                <Label className="text-muted-foreground">Chave PIX</Label>
                <Input
                  value={formData.dadosBancarios?.pix || ''}
                  onChange={(e) => updateBancarios('pix', e.target.value)}
                  className="bg-card border-border mt-1"
                  placeholder="CPF, e-mail, telefone ou chave aleatoria"
                />
              </div>
            </div>
          </div>

          {/* Status e Observacoes */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(v) => updateField('status', v)}
                >
                  <SelectTrigger className="bg-card border-border mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="inativo">Inativo</SelectItem>
                    <SelectItem value="ferias">Ferias</SelectItem>
                    <SelectItem value="afastado">Afastado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-muted-foreground">Observacoes</Label>
              <Textarea
                value={formData.observacoes || ''}
                onChange={(e) => updateField('observacoes', e.target.value)}
                className="bg-card border-border mt-1"
                placeholder="Observacoes sobre o colaborador..."
                rows={3}
              />
            </div>
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

export function ColaboradoresForm() {
  const [colaboradores, setColaboradores] = useState<Colaborador[]>(MOCK_COLABORADORES);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [departamentoFilter, setDepartamentoFilter] = useState<string>('all');
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [selectedColaborador, setSelectedColaborador] = useState<Colaborador | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [colaboradorToDelete, setColaboradorToDelete] = useState<Colaborador | null>(null);

  const filteredColaboradores = colaboradores.filter((c) => {
    const matchesSearch =
      c.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.cpf.includes(searchTerm) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    const matchesDepartamento = departamentoFilter === 'all' || c.departamento === departamentoFilter;
    return matchesSearch && matchesStatus && matchesDepartamento;
  });

  const totalSalarios = colaboradores
    .filter(c => c.status === 'ativo')
    .reduce((sum, c) => sum + c.salario, 0);

  const handleNewColaborador = () => {
    setSelectedColaborador(null);
    setFormDialogOpen(true);
  };

  const handleEditColaborador = (colaborador: Colaborador) => {
    setSelectedColaborador(colaborador);
    setFormDialogOpen(true);
  };

  const handleDeleteColaborador = (colaborador: Colaborador) => {
    setColaboradorToDelete(colaborador);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (colaboradorToDelete) {
      setColaboradores(prev => prev.filter(c => c.id !== colaboradorToDelete.id));
      setDeleteDialogOpen(false);
      setColaboradorToDelete(null);
    }
  };

  const handleSaveColaborador = useCallback((data: Partial<Colaborador>) => {
    if (selectedColaborador) {
      setColaboradores(prev =>
        prev.map(c => (c.id === selectedColaborador.id ? { ...c, ...data } : c))
      );
    } else {
      const newColaborador: Colaborador = {
        ...data,
        id: `c_${Date.now()}`,
        createdAt: new Date(),
      } as Colaborador;
      setColaboradores(prev => [...prev, newColaborador]);
    }
  }, [selectedColaborador]);

  return (
    <div className="bg-background text-foreground font-sans">
      
        <div className="max-w-7xl mx-auto p-8 space-y-6 pb-16">
          {/* Header */}
          <div className="flex justify-between items-center border-b border-border pb-6">
            <div>
              <h1 className="text-3xl font-black tracking-tight">COLABORADORES</h1>
              <p className="text-muted-foreground text-sm mt-1">
                Gerenciamento de colaboradores da plataforma
              </p>
            </div>
            <Button onClick={handleNewColaborador} className="bg-indigo-600 hover:bg-indigo-700">
              <Plus className="h-4 w-4 mr-2" />
              Novo Colaborador
            </Button>
          </div>

          {/* Filters */}
          <div className="flex gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, CPF ou e-mail..."
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
                <SelectItem value="ativo">Ativo</SelectItem>
                <SelectItem value="inativo">Inativo</SelectItem>
                <SelectItem value="ferias">Ferias</SelectItem>
                <SelectItem value="afastado">Afastado</SelectItem>
              </SelectContent>
            </Select>
            <Select value={departamentoFilter} onValueChange={setDepartamentoFilter}>
              <SelectTrigger className="w-48 bg-card border-border">
                <SelectValue placeholder="Departamento" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="all">Todos Departamentos</SelectItem>
                {DEPARTAMENTOS.map((dep) => (
                  <SelectItem key={dep} value={dep}>
                    {dep}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <p className="text-[10px] text-muted-foreground uppercase font-bold">Total</p>
                <p className="text-2xl font-black">{colaboradores.length}</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <p className="text-[10px] text-muted-foreground uppercase font-bold">Ativos</p>
                <p className="text-2xl font-black text-emerald-400">
                  {colaboradores.filter(c => c.status === 'ativo').length}
                </p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <p className="text-[10px] text-muted-foreground uppercase font-bold">Ferias</p>
                <p className="text-2xl font-black text-blue-400">
                  {colaboradores.filter(c => c.status === 'ferias').length}
                </p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <p className="text-[10px] text-muted-foreground uppercase font-bold">Afastados</p>
                <p className="text-2xl font-black text-amber-400">
                  {colaboradores.filter(c => c.status === 'afastado').length}
                </p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <p className="text-[10px] text-muted-foreground uppercase font-bold">Folha Ativa</p>
                <p className="text-xl font-black text-indigo-400">
                  {formatCurrency(totalSalarios)}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Table */}
          <Card className="bg-card border-border">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-muted-foreground text-[10px] uppercase font-bold">
                    Colaborador
                  </TableHead>
                  <TableHead className="text-muted-foreground text-[10px] uppercase font-bold">
                    Cargo / Departamento
                  </TableHead>
                  <TableHead className="text-muted-foreground text-[10px] uppercase font-bold">
                    Contrato
                  </TableHead>
                  <TableHead className="text-muted-foreground text-[10px] uppercase font-bold">
                    Salario
                  </TableHead>
                  <TableHead className="text-muted-foreground text-[10px] uppercase font-bold">
                    Admissao
                  </TableHead>
                  <TableHead className="text-muted-foreground text-[10px] uppercase font-bold">
                    Status
                  </TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredColaboradores.map((colaborador) => {
                  const statusConfig = getStatusConfig(colaborador.status);
                  return (
                    <TableRow
                      key={colaborador.id}
                      className="border-border/50 hover:bg-card/5 transition-colors"
                    >
                      <TableCell>
                        <div>
                          <p className="font-bold text-sm">{colaborador.nome}</p>
                          <p className="text-[10px] text-muted-foreground">{colaborador.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-sm text-muted-foreground">{colaborador.cargo}</p>
                          <p className="text-[10px] text-muted-foreground">{colaborador.departamento}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-muted/50 text-muted-foreground border-border">
                          {getTipoContratoLabel(colaborador.tipoContrato)}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm text-muted-foreground">
                        {formatCurrency(colaborador.salario)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(colaborador.dataAdmissao)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={statusConfig.color}>
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
                            <DropdownMenuItem
                              onClick={() => handleEditColaborador(colaborador)}
                              className="text-muted-foreground focus:bg-muted cursor-pointer"
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteColaborador(colaborador)}
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
      <ColaboradorFormDialog
        open={formDialogOpen}
        onClose={() => setFormDialogOpen(false)}
        colaborador={selectedColaborador}
        onSave={handleSaveColaborador}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-background border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Confirmar Exclusao</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Tem certeza que deseja excluir o colaborador "{colaboradorToDelete?.nome}"?
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
    </div>
  );
}

export default ColaboradoresForm;
