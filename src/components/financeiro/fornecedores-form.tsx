/**
 * Vinculo.io - Cadastro de Fornecedores
 *
 * Formulario para gerenciamento de fornecedores da plataforma.
 */

import { useState, useCallback } from 'react';
import {
  Building2,
  Plus,
  Search,
  Edit,
  Trash2,
  Phone,
  Mail,
  MapPin,
  FileText,
  MoreVertical,
  CheckCircle2,
  XCircle,
  User,
  Save,
  X,
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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

interface Fornecedor {
  id: string;
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
  inscricaoEstadual?: string;
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
  contato: {
    nome: string;
    cargo: string;
    telefone: string;
    email: string;
  };
  categoria: 'servicos' | 'materiais' | 'equipamentos' | 'manutencao' | 'outros';
  status: 'ativo' | 'inativo' | 'bloqueado';
  observacoes?: string;
  createdAt: Date;
}

// ============================================
// DADOS VAZIOS PARA PRODUCAO
// ============================================

const MOCK_FORNECEDORES: Fornecedor[] = [];

const CATEGORIAS = [
  { value: 'servicos', label: 'Servicos' },
  { value: 'materiais', label: 'Materiais' },
  { value: 'equipamentos', label: 'Equipamentos' },
  { value: 'manutencao', label: 'Manutencao' },
  { value: 'outros', label: 'Outros' },
];

const ESTADOS = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG',
  'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

// ============================================
// HELPER FUNCTIONS
// ============================================

function formatCNPJ(value: string): string {
  const numbers = value.replace(/\D/g, '');
  return numbers
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d)/, '$1-$2')
    .slice(0, 18);
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

function getStatusConfig(status: Fornecedor['status']) {
  const configs = {
    ativo: { label: 'Ativo', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
    inativo: { label: 'Inativo', color: 'bg-muted text-muted-foreground border-border' },
    bloqueado: { label: 'Bloqueado', color: 'bg-red-500/10 text-red-500 border-red-500/20' },
  };
  return configs[status];
}

function getCategoriaLabel(categoria: Fornecedor['categoria']): string {
  const cat = CATEGORIAS.find(c => c.value === categoria);
  return cat?.label || categoria;
}

// ============================================
// COMPONENTS
// ============================================

function FornecedorFormDialog({
  open,
  onClose,
  fornecedor,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  fornecedor?: Fornecedor | null;
  onSave: (data: Partial<Fornecedor>) => void;
}) {
  const [formData, setFormData] = useState<Partial<Fornecedor>>(
    fornecedor || {
      razaoSocial: '',
      nomeFantasia: '',
      cnpj: '',
      inscricaoEstadual: '',
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
      contato: {
        nome: '',
        cargo: '',
        telefone: '',
        email: '',
      },
      categoria: 'servicos',
      status: 'ativo',
      observacoes: '',
    }
  );

  const handleSubmit = () => {
    onSave(formData);
    onClose();
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const updateEndereco = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      endereco: { ...prev.endereco!, [field]: value },
    }));
  };

  const updateContato = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      contato: { ...prev.contato!, [field]: value },
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-background border-border max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-2">
            <Building2 className="h-5 w-5 text-indigo-400" />
            {fornecedor ? 'Editar Fornecedor' : 'Novo Fornecedor'}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Preencha os dados do fornecedor
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Dados da Empresa */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
              Dados da Empresa
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label className="text-muted-foreground">Razao Social *</Label>
                <Input
                  value={formData.razaoSocial || ''}
                  onChange={(e) => updateField('razaoSocial', e.target.value)}
                  className="bg-card border-border mt-1"
                  placeholder="Razao social completa"
                />
              </div>
              <div>
                <Label className="text-muted-foreground">Nome Fantasia</Label>
                <Input
                  value={formData.nomeFantasia || ''}
                  onChange={(e) => updateField('nomeFantasia', e.target.value)}
                  className="bg-card border-border mt-1"
                  placeholder="Nome fantasia"
                />
              </div>
              <div>
                <Label className="text-muted-foreground">CNPJ *</Label>
                <Input
                  value={formData.cnpj || ''}
                  onChange={(e) => updateField('cnpj', formatCNPJ(e.target.value))}
                  className="bg-card border-border mt-1"
                  placeholder="00.000.000/0000-00"
                />
              </div>
              <div>
                <Label className="text-muted-foreground">Inscricao Estadual</Label>
                <Input
                  value={formData.inscricaoEstadual || ''}
                  onChange={(e) => updateField('inscricaoEstadual', e.target.value)}
                  className="bg-card border-border mt-1"
                  placeholder="Inscricao estadual"
                />
              </div>
              <div>
                <Label className="text-muted-foreground">Categoria *</Label>
                <Select
                  value={formData.categoria}
                  onValueChange={(v) => updateField('categoria', v)}
                >
                  <SelectTrigger className="bg-card border-border mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {CATEGORIAS.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-muted-foreground">E-mail *</Label>
                <Input
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => updateField('email', e.target.value)}
                  className="bg-card border-border mt-1"
                  placeholder="email@empresa.com.br"
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
                  placeholder="Sala, Apto, etc."
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

          {/* Contato */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
              Contato Principal
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">Nome</Label>
                <Input
                  value={formData.contato?.nome || ''}
                  onChange={(e) => updateContato('nome', e.target.value)}
                  className="bg-card border-border mt-1"
                  placeholder="Nome do contato"
                />
              </div>
              <div>
                <Label className="text-muted-foreground">Cargo</Label>
                <Input
                  value={formData.contato?.cargo || ''}
                  onChange={(e) => updateContato('cargo', e.target.value)}
                  className="bg-card border-border mt-1"
                  placeholder="Cargo"
                />
              </div>
              <div>
                <Label className="text-muted-foreground">Telefone</Label>
                <Input
                  value={formData.contato?.telefone || ''}
                  onChange={(e) => updateContato('telefone', formatPhone(e.target.value))}
                  className="bg-card border-border mt-1"
                  placeholder="(00) 00000-0000"
                />
              </div>
              <div>
                <Label className="text-muted-foreground">E-mail</Label>
                <Input
                  type="email"
                  value={formData.contato?.email || ''}
                  onChange={(e) => updateContato('email', e.target.value)}
                  className="bg-card border-border mt-1"
                  placeholder="contato@empresa.com.br"
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
                    <SelectItem value="bloqueado">Bloqueado</SelectItem>
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
                placeholder="Observacoes sobre o fornecedor..."
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

export function FornecedoresForm() {
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>(MOCK_FORNECEDORES);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoriaFilter, setCategoriaFilter] = useState<string>('all');
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [selectedFornecedor, setSelectedFornecedor] = useState<Fornecedor | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [fornecedorToDelete, setFornecedorToDelete] = useState<Fornecedor | null>(null);

  const filteredFornecedores = fornecedores.filter((f) => {
    const matchesSearch =
      f.razaoSocial.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.nomeFantasia.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.cnpj.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || f.status === statusFilter;
    const matchesCategoria = categoriaFilter === 'all' || f.categoria === categoriaFilter;
    return matchesSearch && matchesStatus && matchesCategoria;
  });

  const handleNewFornecedor = () => {
    setSelectedFornecedor(null);
    setFormDialogOpen(true);
  };

  const handleEditFornecedor = (fornecedor: Fornecedor) => {
    setSelectedFornecedor(fornecedor);
    setFormDialogOpen(true);
  };

  const handleDeleteFornecedor = (fornecedor: Fornecedor) => {
    setFornecedorToDelete(fornecedor);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (fornecedorToDelete) {
      setFornecedores(prev => prev.filter(f => f.id !== fornecedorToDelete.id));
      setDeleteDialogOpen(false);
      setFornecedorToDelete(null);
    }
  };

  const handleSaveFornecedor = useCallback((data: Partial<Fornecedor>) => {
    if (selectedFornecedor) {
      setFornecedores(prev =>
        prev.map(f => (f.id === selectedFornecedor.id ? { ...f, ...data } : f))
      );
    } else {
      const newFornecedor: Fornecedor = {
        ...data,
        id: `f_${Date.now()}`,
        createdAt: new Date(),
      } as Fornecedor;
      setFornecedores(prev => [...prev, newFornecedor]);
    }
  }, [selectedFornecedor]);

  return (
    <div className="bg-background text-foreground font-sans">
      
        <div className="max-w-7xl mx-auto p-8 space-y-6 pb-16">
          {/* Header */}
          <div className="flex justify-between items-center border-b border-border pb-6">
            <div>
              <h1 className="text-3xl font-black tracking-tight">FORNECEDORES</h1>
              <p className="text-muted-foreground text-sm mt-1">
                Gerenciamento de fornecedores da plataforma
              </p>
            </div>
            <Button onClick={handleNewFornecedor} className="bg-indigo-600 hover:bg-indigo-700">
              <Plus className="h-4 w-4 mr-2" />
              Novo Fornecedor
            </Button>
          </div>

          {/* Filters */}
          <div className="flex gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou CNPJ..."
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
                <SelectItem value="bloqueado">Bloqueado</SelectItem>
              </SelectContent>
            </Select>
            <Select value={categoriaFilter} onValueChange={setCategoriaFilter}>
              <SelectTrigger className="w-40 bg-card border-border">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="all">Todas Categorias</SelectItem>
                {CATEGORIAS.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <p className="text-[10px] text-muted-foreground uppercase font-bold">Total</p>
                <p className="text-2xl font-black">{fornecedores.length}</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <p className="text-[10px] text-muted-foreground uppercase font-bold">Ativos</p>
                <p className="text-2xl font-black text-emerald-400">
                  {fornecedores.filter(f => f.status === 'ativo').length}
                </p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <p className="text-[10px] text-muted-foreground uppercase font-bold">Inativos</p>
                <p className="text-2xl font-black text-muted-foreground">
                  {fornecedores.filter(f => f.status === 'inativo').length}
                </p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <p className="text-[10px] text-muted-foreground uppercase font-bold">Bloqueados</p>
                <p className="text-2xl font-black text-red-400">
                  {fornecedores.filter(f => f.status === 'bloqueado').length}
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
                    Fornecedor
                  </TableHead>
                  <TableHead className="text-muted-foreground text-[10px] uppercase font-bold">
                    CNPJ
                  </TableHead>
                  <TableHead className="text-muted-foreground text-[10px] uppercase font-bold">
                    Categoria
                  </TableHead>
                  <TableHead className="text-muted-foreground text-[10px] uppercase font-bold">
                    Contato
                  </TableHead>
                  <TableHead className="text-muted-foreground text-[10px] uppercase font-bold">
                    Status
                  </TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFornecedores.map((fornecedor) => {
                  const statusConfig = getStatusConfig(fornecedor.status);
                  return (
                    <TableRow
                      key={fornecedor.id}
                      className="border-border/50 hover:bg-card/5 transition-colors"
                    >
                      <TableCell>
                        <div>
                          <p className="font-bold text-sm">{fornecedor.nomeFantasia || fornecedor.razaoSocial}</p>
                          <p className="text-[10px] text-muted-foreground">{fornecedor.razaoSocial}</p>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm text-muted-foreground">
                        {fornecedor.cnpj}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-muted/50 text-muted-foreground border-border">
                          {getCategoriaLabel(fornecedor.categoria)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p className="text-muted-foreground">{fornecedor.contato.nome}</p>
                          <p className="text-[10px] text-muted-foreground">{fornecedor.telefone}</p>
                        </div>
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
                              onClick={() => handleEditFornecedor(fornecedor)}
                              className="text-muted-foreground focus:bg-muted cursor-pointer"
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteFornecedor(fornecedor)}
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
      <FornecedorFormDialog
        open={formDialogOpen}
        onClose={() => setFormDialogOpen(false)}
        fornecedor={selectedFornecedor}
        onSave={handleSaveFornecedor}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-background border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Confirmar Exclusao</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Tem certeza que deseja excluir o fornecedor "{fornecedorToDelete?.nomeFantasia || fornecedorToDelete?.razaoSocial}"?
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

export default FornecedoresForm;
