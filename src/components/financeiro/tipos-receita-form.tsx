/**
 * Vinculo.io - Cadastro de Tipos de Receita
 *
 * Formulario para gerenciamento de tipos de receita e categorias contabeis.
 * Segue o padrao do tipos-despesa-form.tsx
 */

import { useState, useCallback } from 'react';
import {
  Tag,
  Plus,
  Search,
  Edit,
  Trash2,
  MoreVertical,
  Save,
  X,
  FolderTree,
  Layers,
  TrendingUp,
  Percent,
} from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
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

export interface TipoReceita {
  id: string;
  codigo: string;
  nome: string;
  descricao?: string;
  categoriaContabil: string;
  subcategoria?: string;
  contaContabil?: string;
  natureza: 'recorrente' | 'avulsa';
  tributavel: boolean;
  percentualTributavel?: number;
  afetaDre: boolean;
  linhaDre?: string;
  status: 'ativo' | 'inativo';
  createdAt: Date;
}

// ============================================
// CONSTANTS - EXPORTED FOR DRE
// ============================================

export const CATEGORIAS_RECEITA = [
  { value: 'receita_servicos', label: 'Receita de Servicos' },
  { value: 'receita_taxas', label: 'Taxas de Plataforma' },
  { value: 'receita_comissao', label: 'Comissoes' },
  { value: 'receita_setup', label: 'Setup de Contrato' },
  { value: 'receita_intermediacao', label: 'Intermediacao' },
  { value: 'receita_financeira', label: 'Receitas Financeiras' },
  { value: 'receita_outras', label: 'Outras Receitas' },
];

export const LINHAS_DRE_RECEITA = [
  { value: 'receita_operacional', label: '(+) Receita Operacional Bruta' },
  { value: 'receita_servicos', label: '(+) Receita de Servicos' },
  { value: 'receita_taxas_plataforma', label: '(+) Taxas de Plataforma' },
  { value: 'receita_comissoes', label: '(+) Comissoes' },
  { value: 'receita_financeira', label: '(+) Receitas Financeiras' },
  { value: 'outras_receitas', label: '(+) Outras Receitas' },
];

// ============================================
// DADOS VAZIOS PARA PRODUCAO
// ============================================

export const MOCK_TIPOS_RECEITA: TipoReceita[] = [];

// ============================================
// HELPER FUNCTIONS
// ============================================

function getCategoriaLabel(categoria: string): string {
  const cat = CATEGORIAS_RECEITA.find(c => c.value === categoria);
  return cat?.label || categoria;
}

function getLinhaDreLabel(linha?: string): string {
  if (!linha) return '-';
  const l = LINHAS_DRE_RECEITA.find(ld => ld.value === linha);
  return l?.label || linha;
}

function getStatusConfig(status: TipoReceita['status']) {
  const configs = {
    ativo: { label: 'Ativo', color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' },
    inativo: { label: 'Inativo', color: 'bg-muted text-muted-foreground border-border' },
  };
  return configs[status];
}

function getNaturezaConfig(natureza: TipoReceita['natureza']) {
  const configs = {
    recorrente: { label: 'Recorrente', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
    avulsa: { label: 'Avulsa', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  };
  return configs[natureza];
}

// ============================================
// FORM DIALOG
// ============================================

function TipoReceitaFormDialog({
  open,
  onClose,
  tipoReceita,
  onSave,
  categoriasContabeis,
  onNovaCategoria,
}: {
  open: boolean;
  onClose: () => void;
  tipoReceita?: TipoReceita | null;
  onSave: (data: Partial<TipoReceita>) => void;
  categoriasContabeis: { value: string; label: string }[];
  onNovaCategoria: () => void;
}) {
  const [formData, setFormData] = useState<Partial<TipoReceita>>(
    tipoReceita || {
      codigo: '',
      nome: '',
      descricao: '',
      categoriaContabil: '',
      subcategoria: '',
      contaContabil: '',
      natureza: 'avulsa',
      tributavel: true,
      percentualTributavel: 100,
      afetaDre: true,
      linhaDre: '',
      status: 'ativo',
    }
  );

  const handleSubmit = () => {
    onSave(formData);
    onClose();
  };

  const updateField = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-background border-border max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-2">
            <Tag className="h-5 w-5 text-emerald-400" />
            {tipoReceita ? 'Editar Tipo de Receita' : 'Novo Tipo de Receita'}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Configure o tipo de receita e sua classificacao contabil
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Identificacao */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
              Identificacao
            </h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label className="text-muted-foreground">Codigo *</Label>
                <Input
                  value={formData.codigo || ''}
                  onChange={(e) => updateField('codigo', e.target.value.toUpperCase())}
                  className="bg-card border-border mt-1 font-mono"
                  placeholder="COM001"
                  maxLength={10}
                />
              </div>
              <div className="col-span-2">
                <Label className="text-muted-foreground">Nome *</Label>
                <Input
                  value={formData.nome || ''}
                  onChange={(e) => updateField('nome', e.target.value)}
                  className="bg-card border-border mt-1"
                  placeholder="Nome do tipo de receita"
                />
              </div>
            </div>
            <div>
              <Label className="text-muted-foreground">Descricao</Label>
              <Textarea
                value={formData.descricao || ''}
                onChange={(e) => updateField('descricao', e.target.value)}
                className="bg-card border-border mt-1"
                placeholder="Descricao detalhada do tipo de receita"
                rows={2}
              />
            </div>
          </div>

          {/* Classificacao Contabil */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
              Classificacao Contabil
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between">
                  <Label className="text-muted-foreground">Categoria Contabil *</Label>
                  <Button
                    variant="link"
                    size="sm"
                    className="h-auto p-0 text-xs text-emerald-400"
                    onClick={onNovaCategoria}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Nova categoria
                  </Button>
                </div>
                <Select
                  value={formData.categoriaContabil}
                  onValueChange={(v) => updateField('categoriaContabil', v)}
                >
                  <SelectTrigger className="bg-card border-border mt-1">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {categoriasContabeis.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-muted-foreground">Subcategoria</Label>
                <Input
                  value={formData.subcategoria || ''}
                  onChange={(e) => updateField('subcategoria', e.target.value)}
                  className="bg-card border-border mt-1"
                  placeholder="Subcategoria"
                />
              </div>
              <div>
                <Label className="text-muted-foreground">Conta Contabil</Label>
                <Input
                  value={formData.contaContabil || ''}
                  onChange={(e) => updateField('contaContabil', e.target.value)}
                  className="bg-card border-border mt-1 font-mono"
                  placeholder="3.1.01.001"
                />
              </div>
              <div>
                <Label className="text-muted-foreground">Natureza *</Label>
                <Select
                  value={formData.natureza}
                  onValueChange={(v) => updateField('natureza', v)}
                >
                  <SelectTrigger className="bg-card border-border mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="recorrente">Receita Recorrente</SelectItem>
                    <SelectItem value="avulsa">Receita Avulsa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Tributacao */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
              Tributacao
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-4 bg-card rounded-lg border border-border">
                <div>
                  <Label className="text-muted-foreground">Receita Tributavel</Label>
                  <p className="text-xs text-muted-foreground">Incide impostos sobre esta receita</p>
                </div>
                <Switch
                  checked={formData.tributavel}
                  onCheckedChange={(checked) => updateField('tributavel', checked)}
                />
              </div>
              {formData.tributavel && (
                <div>
                  <Label className="text-muted-foreground">Percentual Tributavel (%)</Label>
                  <Input
                    type="number"
                    value={formData.percentualTributavel || 100}
                    onChange={(e) => updateField('percentualTributavel', parseFloat(e.target.value) || 0)}
                    className="bg-card border-border mt-1"
                    min={0}
                    max={100}
                  />
                </div>
              )}
            </div>
          </div>

          {/* DRE */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">
              Demonstrativo de Resultado (DRE)
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-4 bg-card rounded-lg border border-border">
                <div>
                  <Label className="text-muted-foreground">Afeta o DRE</Label>
                  <p className="text-xs text-muted-foreground">Inclui nos relatorios</p>
                </div>
                <Switch
                  checked={formData.afetaDre}
                  onCheckedChange={(checked) => updateField('afetaDre', checked)}
                />
              </div>
              {formData.afetaDre && (
                <div>
                  <Label className="text-muted-foreground">Linha do DRE</Label>
                  <Select
                    value={formData.linhaDre}
                    onValueChange={(v) => updateField('linhaDre', v)}
                  >
                    <SelectTrigger className="bg-card border-border mt-1">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      {LINHAS_DRE_RECEITA.map((linha) => (
                        <SelectItem key={linha.value} value={linha.value}>
                          {linha.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>

          {/* Status */}
          <div>
            <Label className="text-muted-foreground">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(v) => updateField('status', v)}
            >
              <SelectTrigger className="bg-card border-border mt-1 w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="ativo">Ativo</SelectItem>
                <SelectItem value="inativo">Inativo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="border-border">
            <X className="h-4 w-4 mr-2" />
            Cancelar
          </Button>
          <Button onClick={handleSubmit} className="bg-emerald-600 hover:bg-emerald-700">
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

export function TiposReceitaForm() {
  const [tiposReceita, setTiposReceita] = useState<TipoReceita[]>(MOCK_TIPOS_RECEITA);
  const [categoriasContabeis, setCategoriasContabeis] = useState(CATEGORIAS_RECEITA);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoriaFilter, setCategoriaFilter] = useState<string>('all');
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [novaContaContabilDialogOpen, setNovaContaContabilDialogOpen] = useState(false);
  const [selectedTipo, setSelectedTipo] = useState<TipoReceita | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [tipoToDelete, setTipoToDelete] = useState<TipoReceita | null>(null);

  // Form state para nova conta contabil
  const [novaContaContabilForm, setNovaContaContabilForm] = useState({
    codigo: '',
    nome: '',
    descricao: '',
    natureza: 'receita' as 'receita' | 'despesa',
    tipo: 'analitica' as 'sintetica' | 'analitica',
  });

  const filteredTipos = tiposReceita.filter((t) => {
    const matchesSearch =
      t.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.codigo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategoria = categoriaFilter === 'all' || t.categoriaContabil === categoriaFilter;
    return matchesSearch && matchesCategoria;
  });

  // Agrupar por categoria
  const tiposPorCategoria = tiposReceita.reduce((acc, tipo) => {
    acc[tipo.categoriaContabil] = (acc[tipo.categoriaContabil] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const handleNewTipo = () => {
    setSelectedTipo(null);
    setFormDialogOpen(true);
  };

  const handleEditTipo = (tipo: TipoReceita) => {
    setSelectedTipo(tipo);
    setFormDialogOpen(true);
  };

  const handleDeleteTipo = (tipo: TipoReceita) => {
    setTipoToDelete(tipo);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (tipoToDelete) {
      setTiposReceita(prev => prev.filter(t => t.id !== tipoToDelete.id));
      setDeleteDialogOpen(false);
      setTipoToDelete(null);
    }
  };

  const handleSaveTipo = useCallback((data: Partial<TipoReceita>) => {
    if (selectedTipo) {
      setTiposReceita(prev =>
        prev.map(t => (t.id === selectedTipo.id ? { ...t, ...data } : t))
      );
    } else {
      const newTipo: TipoReceita = {
        ...data,
        id: `tr_${Date.now()}`,
        createdAt: new Date(),
      } as TipoReceita;
      setTiposReceita(prev => [...prev, newTipo]);
    }
  }, [selectedTipo]);

  // Handler para criar nova conta contabil
  const handleCriarContaContabil = useCallback(() => {
    const novaConta = {
      value: novaContaContabilForm.codigo.toLowerCase().replace(/\s+/g, '_') || `cat_${Date.now()}`,
      label: novaContaContabilForm.nome,
    };
    setCategoriasContabeis(prev => [...prev, novaConta]);
    setNovaContaContabilDialogOpen(false);
    setNovaContaContabilForm({
      codigo: '',
      nome: '',
      descricao: '',
      natureza: 'receita',
      tipo: 'analitica',
    });
  }, [novaContaContabilForm]);

  return (
    <div className="bg-background text-foreground font-sans">

        <div className="max-w-7xl mx-auto p-8 space-y-6 pb-16">
          {/* Header */}
          <div className="flex justify-between items-center border-b border-border pb-6">
            <div>
              <h1 className="text-3xl font-black tracking-tight">TIPOS DE RECEITA</h1>
              <p className="text-muted-foreground text-sm mt-1">
                Configuracao de tipos de receita e categorias contabeis
              </p>
            </div>
            <Button onClick={handleNewTipo} className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="h-4 w-4 mr-2" />
              Novo Tipo
            </Button>
          </div>

          {/* Filters */}
          <div className="flex gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou codigo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-card border-border"
              />
            </div>
            <Select value={categoriaFilter} onValueChange={setCategoriaFilter}>
              <SelectTrigger className="w-56 bg-card border-border">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="all">Todas Categorias</SelectItem>
                {CATEGORIAS_RECEITA.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <FolderTree className="h-5 w-5 text-emerald-400 mb-2" />
                <p className="text-[10px] text-muted-foreground uppercase font-bold">Total Tipos</p>
                <p className="text-2xl font-black">{tiposReceita.length}</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <Layers className="h-5 w-5 text-emerald-400 mb-2" />
                <p className="text-[10px] text-muted-foreground uppercase font-bold">Categorias</p>
                <p className="text-2xl font-black">{Object.keys(tiposPorCategoria).length}</p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <TrendingUp className="h-5 w-5 text-emerald-400 mb-2" />
                <p className="text-[10px] text-muted-foreground uppercase font-bold">Recorrentes</p>
                <p className="text-2xl font-black">
                  {tiposReceita.filter(t => t.natureza === 'recorrente').length}
                </p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <TrendingUp className="h-5 w-5 text-amber-400 mb-2" />
                <p className="text-[10px] text-muted-foreground uppercase font-bold">Avulsas</p>
                <p className="text-2xl font-black">
                  {tiposReceita.filter(t => t.natureza === 'avulsa').length}
                </p>
              </CardContent>
            </Card>
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <Percent className="h-5 w-5 text-blue-400 mb-2" />
                <p className="text-[10px] text-muted-foreground uppercase font-bold">Tributaveis</p>
                <p className="text-2xl font-black">
                  {tiposReceita.filter(t => t.tributavel).length}
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
                    Codigo / Nome
                  </TableHead>
                  <TableHead className="text-muted-foreground text-[10px] uppercase font-bold">
                    Categoria
                  </TableHead>
                  <TableHead className="text-muted-foreground text-[10px] uppercase font-bold">
                    Natureza
                  </TableHead>
                  <TableHead className="text-muted-foreground text-[10px] uppercase font-bold">
                    Linha DRE
                  </TableHead>
                  <TableHead className="text-muted-foreground text-[10px] uppercase font-bold">
                    Status
                  </TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTipos.map((tipo) => {
                  const statusConfig = getStatusConfig(tipo.status);
                  const naturezaConfig = getNaturezaConfig(tipo.natureza);
                  return (
                    <TableRow
                      key={tipo.id}
                      className="border-border/50 hover:bg-background/5 transition-colors"
                    >
                      <TableCell>
                        <div>
                          <div className="flex items-center gap-2">
                            <code className="text-xs bg-muted px-2 py-0.5 rounded font-mono text-emerald-400">
                              {tipo.codigo}
                            </code>
                            <span className="font-bold text-sm">{tipo.nome}</span>
                          </div>
                          {tipo.descricao && (
                            <p className="text-[10px] text-muted-foreground mt-1">{tipo.descricao}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-muted-foreground">{getCategoriaLabel(tipo.categoriaContabil)}</p>
                        {tipo.contaContabil && (
                          <p className="text-[10px] text-muted-foreground font-mono">{tipo.contaContabil}</p>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={naturezaConfig.color}>
                          {naturezaConfig.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {getLinhaDreLabel(tipo.linhaDre)}
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
                              onClick={() => handleEditTipo(tipo)}
                              className="text-muted-foreground focus:bg-muted cursor-pointer"
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteTipo(tipo)}
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
      <TipoReceitaFormDialog
        open={formDialogOpen}
        onClose={() => setFormDialogOpen(false)}
        tipoReceita={selectedTipo}
        onSave={handleSaveTipo}
        categoriasContabeis={categoriasContabeis}
        onNovaCategoria={() => setNovaContaContabilDialogOpen(true)}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-background border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Confirmar Exclusao</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Tem certeza que deseja excluir o tipo de receita "{tipoToDelete?.nome}"?
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

      {/* Nova Conta Contabil Dialog */}
      <Dialog open={novaContaContabilDialogOpen} onOpenChange={setNovaContaContabilDialogOpen}>
        <DialogContent className="bg-background border-border max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2">
              <FolderTree className="h-5 w-5 text-emerald-400" />
              Nova Conta Contabil
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Cadastre uma nova categoria/grupo de receitas
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label className="text-muted-foreground">Codigo *</Label>
                <Input
                  value={novaContaContabilForm.codigo}
                  onChange={(e) => setNovaContaContabilForm(prev => ({ ...prev, codigo: e.target.value.toUpperCase() }))}
                  className="bg-card border-border mt-1 font-mono"
                  placeholder="3.1.01"
                  maxLength={15}
                />
              </div>
              <div className="col-span-2">
                <Label className="text-muted-foreground">Nome *</Label>
                <Input
                  value={novaContaContabilForm.nome}
                  onChange={(e) => setNovaContaContabilForm(prev => ({ ...prev, nome: e.target.value }))}
                  className="bg-card border-border mt-1"
                  placeholder="Nome da conta contabil"
                />
              </div>
            </div>

            <div>
              <Label className="text-muted-foreground">Descricao</Label>
              <Textarea
                value={novaContaContabilForm.descricao}
                onChange={(e) => setNovaContaContabilForm(prev => ({ ...prev, descricao: e.target.value }))}
                className="bg-card border-border mt-1"
                placeholder="Descricao da conta contabil..."
                rows={2}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-muted-foreground">Natureza</Label>
                <Select
                  value={novaContaContabilForm.natureza}
                  onValueChange={(v) => setNovaContaContabilForm(prev => ({ ...prev, natureza: v as 'receita' | 'despesa' }))}
                >
                  <SelectTrigger className="bg-card border-border mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="receita">Receita (Credora)</SelectItem>
                    <SelectItem value="despesa">Despesa (Devedora)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-muted-foreground">Tipo</Label>
                <Select
                  value={novaContaContabilForm.tipo}
                  onValueChange={(v) => setNovaContaContabilForm(prev => ({ ...prev, tipo: v as 'sintetica' | 'analitica' }))}
                >
                  <SelectTrigger className="bg-card border-border mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="analitica">Analitica (permite lancamentos)</SelectItem>
                    <SelectItem value="sintetica">Sintetica (agrupadora)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="p-3 bg-muted/50 rounded-lg border border-border">
              <p className="text-xs text-muted-foreground">
                <strong>Contas Analiticas</strong> sao usadas para lancamentos diretos.
                <br />
                <strong>Contas Sinteticas</strong> agrupam outras contas para totalizacao.
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setNovaContaContabilDialogOpen(false)} className="border-border">
              Cancelar
            </Button>
            <Button
              onClick={handleCriarContaContabil}
              disabled={!novaContaContabilForm.codigo || !novaContaContabilForm.nome}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Cadastrar Conta
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default TiposReceitaForm;
