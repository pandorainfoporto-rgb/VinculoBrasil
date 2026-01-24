/**
 * Seção de Gestão de Parceiros/Fornecedores
 * Usado tanto em config_marketplace quanto em /admin/marketplace
 * Ambos compartilham os mesmos dados via API de Partners
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Plus,
  Edit3,
  Trash2,
  Package,
  Building2,
  Loader2,
  RefreshCw,
  Search,
  Eye,
  ShoppingBag,
  Wrench,
  DollarSign,
} from 'lucide-react';
import {
  usePartners,
  useCreatePartner,
  useUpdatePartner,
  useDeletePartner,
  type Partner,
  type CreatePartnerInput,
} from '@/hooks/use-marketplace';

export function PartnersManagementSection() {
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [viewingPartner, setViewingPartner] = useState<Partner | null>(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  // API Hooks
  const { data: partners = [], isLoading, refetch } = usePartners({ search: searchTerm || undefined });
  const createPartnerMutation = useCreatePartner();
  const updatePartnerMutation = useUpdatePartner();
  const deletePartnerMutation = useDeletePartner();

  const handleOpenCreate = () => {
    setEditingPartner(null);
    setDialogOpen(true);
  };

  const handleOpenEdit = (partner: Partner) => {
    setEditingPartner(partner);
    setDialogOpen(true);
  };

  const handleViewDetails = (partner: Partner) => {
    setViewingPartner(partner);
    setDetailsDialogOpen(true);
  };

  const handleDelete = async (partner: Partner) => {
    if (!confirm(`Deseja excluir o parceiro "${partner.name}"?`)) return;
    try {
      await deletePartnerMutation.mutateAsync(partner.id);
    } catch (error) {
      console.error('Erro ao excluir parceiro:', error);
    }
  };

  const handleSave = async (data: Partial<CreatePartnerInput>) => {
    try {
      if (editingPartner) {
        await updatePartnerMutation.mutateAsync({ id: editingPartner.id, data });
      } else {
        await createPartnerMutation.mutateAsync(data as CreatePartnerInput);
      }
      setDialogOpen(false);
      setEditingPartner(null);
    } catch (error) {
      console.error('Erro ao salvar parceiro:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground">
          Parceiros comerciais e fornecedores de servicos que pagam comissao para a plataforma
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button onClick={handleOpenCreate}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Parceiro
          </Button>
        </div>
      </div>

      {/* Busca */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome, CNPJ ou email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Lista de Parceiros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Parceiros Cadastrados
          </CardTitle>
          <CardDescription>
            {partners.length} parceiro{partners.length !== 1 ? 's' : ''} encontrado{partners.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-12 text-center">
              <Loader2 className="h-8 w-8 mx-auto animate-spin text-gray-400" />
              <p className="mt-2 text-muted-foreground">Carregando parceiros...</p>
            </div>
          ) : partners.length === 0 ? (
            <div className="py-12 text-center">
              <Package className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium">Nenhum parceiro cadastrado</h3>
              <p className="text-muted-foreground">Clique em "Novo Parceiro" para adicionar o primeiro.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Empresa</TableHead>
                  <TableHead>CNPJ</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Comissao</TableHead>
                  <TableHead>Itens</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Acoes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {partners.map((partner) => (
                  <TableRow key={partner.id}>
                    <TableCell>
                      <div className="font-medium">{partner.tradeName || partner.name}</div>
                      {partner.tradeName && (
                        <div className="text-sm text-muted-foreground">{partner.name}</div>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-sm">{partner.cnpj}</TableCell>
                    <TableCell>
                      <div className="text-sm">{partner.email}</div>
                      {partner.phone && (
                        <div className="text-sm text-muted-foreground">{partner.phone}</div>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-emerald-600">
                        {(partner.defaultCommissionRate * 100).toFixed(0)}%
                      </span>
                    </TableCell>
                    <TableCell>{partner._count?.items ?? 0}</TableCell>
                    <TableCell>
                      <Badge variant={partner.isActive ? 'default' : 'secondary'}>
                        {partner.isActive ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewDetails(partner)}
                          title="Ver detalhes"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenEdit(partner)}
                          title="Editar"
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(partner)}
                          disabled={deletePartnerMutation.isPending}
                          title="Excluir"
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog de Cadastro/Edicao */}
      <PartnerDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        partner={editingPartner}
        onSave={handleSave}
        isLoading={createPartnerMutation.isPending || updatePartnerMutation.isPending}
      />

      {/* Dialog de Detalhes com abas Produtos e Servicos */}
      <PartnerDetailsDialog
        open={detailsDialogOpen}
        onOpenChange={setDetailsDialogOpen}
        partner={viewingPartner}
        onEdit={() => {
          setDetailsDialogOpen(false);
          if (viewingPartner) handleOpenEdit(viewingPartner);
        }}
      />
    </div>
  );
}

// ============================================
// DIALOG COMPONENT: PARTNER
// ============================================
interface PartnerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  partner: Partner | null;
  onSave: (data: Partial<CreatePartnerInput>) => Promise<void>;
  isLoading: boolean;
}

function PartnerDialog({ open, onOpenChange, partner, onSave, isLoading }: PartnerDialogProps) {
  const isEdit = !!partner;
  const [formData, setFormData] = useState<Partial<CreatePartnerInput>>({
    name: '',
    tradeName: '',
    cnpj: '',
    email: '',
    phone: '',
    website: '',
    description: '',
    defaultCommissionRate: 0.10,
    isActive: true,
  });

  // Reset form when dialog opens/closes or partner changes
  useState(() => {
    if (partner) {
      setFormData({
        name: partner.name,
        tradeName: partner.tradeName || '',
        cnpj: partner.cnpj,
        email: partner.email,
        phone: partner.phone || '',
        website: partner.website || '',
        description: partner.description || '',
        defaultCommissionRate: partner.defaultCommissionRate,
        isActive: partner.isActive,
      });
    } else {
      setFormData({
        name: '',
        tradeName: '',
        cnpj: '',
        email: '',
        phone: '',
        website: '',
        description: '',
        defaultCommissionRate: 0.10,
        isActive: true,
      });
    }
  });

  const formatCNPJ = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 14) {
      return numbers
        .replace(/(\d{2})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1/$2')
        .replace(/(\d{4})(\d)/, '$1-$2');
    }
    return value;
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.cnpj || !formData.email) {
      alert('Preencha os campos obrigatorios: Nome, CNPJ e Email');
      return;
    }
    onSave(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar Parceiro' : 'Novo Parceiro'}</DialogTitle>
          <DialogDescription>
            {isEdit ? 'Atualize as informacoes do parceiro' : 'Cadastre um novo parceiro comercial'}
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[500px] pr-4">
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nome da Empresa *</Label>
                <Input
                  placeholder="Razao Social"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Nome Fantasia</Label>
                <Input
                  placeholder="Nome Fantasia"
                  value={formData.tradeName}
                  onChange={(e) => setFormData({ ...formData, tradeName: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>CNPJ *</Label>
              <Input
                placeholder="00.000.000/0000-00"
                value={formData.cnpj}
                onChange={(e) => setFormData({ ...formData, cnpj: formatCNPJ(e.target.value) })}
                maxLength={18}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input
                  type="email"
                  placeholder="contato@empresa.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Telefone</Label>
                <Input
                  placeholder="(11) 99999-9999"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Website</Label>
              <Input
                placeholder="https://www.empresa.com.br"
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Descricao</Label>
              <Textarea
                placeholder="Breve descricao do parceiro e seus servicos..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Comissao Padrao (%)</Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  step={1}
                  placeholder="10"
                  value={(formData.defaultCommissionRate ?? 0.10) * 100}
                  onChange={(e) => setFormData({ ...formData, defaultCommissionRate: Number(e.target.value) / 100 })}
                />
                <p className="text-xs text-muted-foreground">Nossa comissao sobre vendas deste parceiro</p>
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <div className="flex items-center gap-2 pt-2">
                  <Switch
                    checked={formData.isActive ?? true}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  />
                  <span className="text-sm">{formData.isActive ? 'Ativo' : 'Inativo'}</span>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            {isLoading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {isEdit ? 'Salvar Alteracoes' : 'Cadastrar Parceiro'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================
// DIALOG COMPONENT: PARTNER DETAILS (Produtos e Servicos)
// ============================================
interface PartnerDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  partner: Partner | null;
  onEdit: () => void;
}

function PartnerDetailsDialog({ open, onOpenChange, partner, onEdit }: PartnerDetailsDialogProps) {
  const [newProductName, setNewProductName] = useState('');
  const [newProductPrice, setNewProductPrice] = useState('');
  const [newServiceName, setNewServiceName] = useState('');
  const [newServicePrice, setNewServicePrice] = useState('');

  // Mock data for products and services
  const [products, setProducts] = useState([
    { id: '1', name: 'Seguro Fianca', price: 150, description: 'Seguro fianca locaticia mensal' },
    { id: '2', name: 'Titulo de Capitalizacao', price: 200, description: 'Garantia via titulo de capitalizacao' },
    { id: '3', name: 'Seguro Incendio', price: 50, description: 'Seguro contra incendio obrigatorio' },
  ]);

  const [services, setServices] = useState([
    { id: '1', name: 'Vistoria de Entrada', price: 350, description: 'Vistoria completa com fotos e laudo' },
    { id: '2', name: 'Vistoria de Saida', price: 350, description: 'Vistoria de saida com comparativo' },
    { id: '3', name: 'Laudo Tecnico', price: 500, description: 'Laudo tecnico de engenharia' },
  ]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const handleAddProduct = () => {
    if (!newProductName || !newProductPrice) return;
    setProducts([...products, {
      id: Date.now().toString(),
      name: newProductName,
      price: parseFloat(newProductPrice),
      description: '',
    }]);
    setNewProductName('');
    setNewProductPrice('');
  };

  const handleAddService = () => {
    if (!newServiceName || !newServicePrice) return;
    setServices([...services, {
      id: Date.now().toString(),
      name: newServiceName,
      price: parseFloat(newServicePrice),
      description: '',
    }]);
    setNewServiceName('');
    setNewServicePrice('');
  };

  const handleRemoveProduct = (id: string) => {
    setProducts(products.filter(p => p.id !== id));
  };

  const handleRemoveService = (id: string) => {
    setServices(services.filter(s => s.id !== id));
  };

  if (!partner) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            {partner.tradeName || partner.name}
          </DialogTitle>
          <DialogDescription>
            CNPJ: {partner.cnpj} | Comissao: {(partner.defaultCommissionRate * 100).toFixed(0)}%
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="info" className="gap-2">
              <Building2 className="h-4 w-4" />
              Informacoes
            </TabsTrigger>
            <TabsTrigger value="products" className="gap-2">
              <ShoppingBag className="h-4 w-4" />
              Produtos
            </TabsTrigger>
            <TabsTrigger value="services" className="gap-2">
              <Wrench className="h-4 w-4" />
              Servicos
            </TabsTrigger>
          </TabsList>

          {/* Tab Informacoes */}
          <TabsContent value="info" className="mt-4">
            <Card>
              <CardContent className="pt-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">Razao Social</Label>
                    <p className="font-medium">{partner.name}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Nome Fantasia</Label>
                    <p className="font-medium">{partner.tradeName || '-'}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Email</Label>
                    <p className="font-medium">{partner.email}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Telefone</Label>
                    <p className="font-medium">{partner.phone || '-'}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Website</Label>
                    <p className="font-medium">{partner.website || '-'}</p>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Status</Label>
                    <Badge variant={partner.isActive ? 'default' : 'secondary'}>
                      {partner.isActive ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </div>
                </div>
                {partner.description && (
                  <div>
                    <Label className="text-xs text-muted-foreground">Descricao</Label>
                    <p className="text-sm">{partner.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Produtos */}
          <TabsContent value="products" className="mt-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4" />
                  Produtos do Parceiro
                </CardTitle>
                <CardDescription>
                  Produtos oferecidos por este parceiro que geram comissao
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Adicionar Produto */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Nome do produto"
                    value={newProductName}
                    onChange={(e) => setNewProductName(e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    placeholder="Preco"
                    value={newProductPrice}
                    onChange={(e) => setNewProductPrice(e.target.value)}
                    className="w-32"
                  />
                  <Button onClick={handleAddProduct} size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    Adicionar
                  </Button>
                </div>

                {/* Lista de Produtos */}
                <ScrollArea className="h-[200px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Produto</TableHead>
                        <TableHead className="text-right">Preco</TableHead>
                        <TableHead className="text-right">Comissao</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell>
                            <div className="font-medium">{product.name}</div>
                            {product.description && (
                              <div className="text-xs text-muted-foreground">{product.description}</div>
                            )}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(product.price)}
                          </TableCell>
                          <TableCell className="text-right text-emerald-600 font-medium">
                            {formatCurrency(product.price * partner.defaultCommissionRate)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveProduct(product.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>

                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="text-sm text-muted-foreground">{products.length} produtos cadastrados</span>
                  <span className="text-sm font-medium text-emerald-600">
                    <DollarSign className="h-4 w-4 inline" />
                    Comissao total estimada: {formatCurrency(products.reduce((sum, p) => sum + p.price * partner.defaultCommissionRate, 0))}
                  </span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tab Servicos */}
          <TabsContent value="services" className="mt-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Wrench className="h-4 w-4" />
                  Servicos do Parceiro
                </CardTitle>
                <CardDescription>
                  Servicos prestados por este parceiro que geram comissao
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Adicionar Servico */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Nome do servico"
                    value={newServiceName}
                    onChange={(e) => setNewServiceName(e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    placeholder="Preco"
                    value={newServicePrice}
                    onChange={(e) => setNewServicePrice(e.target.value)}
                    className="w-32"
                  />
                  <Button onClick={handleAddService} size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    Adicionar
                  </Button>
                </div>

                {/* Lista de Servicos */}
                <ScrollArea className="h-[200px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Servico</TableHead>
                        <TableHead className="text-right">Preco</TableHead>
                        <TableHead className="text-right">Comissao</TableHead>
                        <TableHead></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {services.map((service) => (
                        <TableRow key={service.id}>
                          <TableCell>
                            <div className="font-medium">{service.name}</div>
                            {service.description && (
                              <div className="text-xs text-muted-foreground">{service.description}</div>
                            )}
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            {formatCurrency(service.price)}
                          </TableCell>
                          <TableCell className="text-right text-emerald-600 font-medium">
                            {formatCurrency(service.price * partner.defaultCommissionRate)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveService(service.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>

                <div className="flex justify-between items-center pt-2 border-t">
                  <span className="text-sm text-muted-foreground">{services.length} servicos cadastrados</span>
                  <span className="text-sm font-medium text-emerald-600">
                    <DollarSign className="h-4 w-4 inline" />
                    Comissao total estimada: {formatCurrency(services.reduce((sum, s) => sum + s.price * partner.defaultCommissionRate, 0))}
                  </span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
          <Button onClick={onEdit}>
            <Edit3 className="h-4 w-4 mr-2" />
            Editar Parceiro
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
