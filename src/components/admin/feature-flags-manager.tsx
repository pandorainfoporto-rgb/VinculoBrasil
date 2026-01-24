/**
 * Feature Flags Manager - Painel de Controle de Modulos
 * Interface administrativa para gerenciar visibilidade e status de funcionalidades
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Settings,
  Eye,
  EyeOff,
  Play,
  Pause,
  Clock,
  Wrench,
  Sparkles,
  Shield,
  Wallet,
  MessageSquare,
  Megaphone,
  ShoppingBag,
  BarChart3,
  Lock,
  Users,
  Heart,
  Camera,
  Mail,
  Search,
  AlertTriangle,
  CheckCircle,
  Info,
  RefreshCw,
  Save,
  History,
  Calendar,
} from 'lucide-react';
import {
  type FeatureModule,
  type FeatureConfig,
  type FeatureStatus,
  getAllFeatures,
  updateFeatureConfig,
  getFeaturesByCategory,
  resetFeatureFlags,
} from '@/lib/feature-flags';

// Icons por categoria
const categoryIcons: Record<FeatureConfig['category'], React.ComponentType<{ className?: string }>> = {
  defi: Wallet,
  communication: MessageSquare,
  monetization: Megaphone,
  marketplace: ShoppingBag,
  reports: BarChart3,
  security: Lock,
  crm: Users,
  insurance: Shield,
  inspection: Camera,
  marketing: Mail,
};

// Labels das categorias
const categoryLabels: Record<FeatureConfig['category'], string> = {
  defi: 'DeFi & Blockchain',
  communication: 'Comunicacao',
  monetization: 'Monetizacao',
  marketplace: 'Marketplace',
  reports: 'Relatorios',
  security: 'Seguranca',
  crm: 'CRM',
  insurance: 'Seguros',
  inspection: 'Vistorias',
  marketing: 'Marketing',
};

// Labels de status
const statusLabels: Record<FeatureStatus, string> = {
  enabled: 'Habilitado',
  disabled: 'Desabilitado',
  beta: 'Beta',
  coming_soon: 'Em Breve',
  maintenance: 'Manutencao',
};

// Cores de status
const statusColors: Record<FeatureStatus, string> = {
  enabled: 'bg-green-500',
  disabled: 'bg-gray-400',
  beta: 'bg-purple-500',
  coming_soon: 'bg-blue-500',
  maintenance: 'bg-amber-500',
};

export function FeatureFlagsManager() {
  const [features, setFeatures] = useState<FeatureConfig[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<FeatureConfig['category'] | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<FeatureStatus | 'all'>('all');
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState<FeatureConfig | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Carrega features
  useEffect(() => {
    setFeatures(getAllFeatures());
  }, []);

  // Filtra features
  const filteredFeatures = features.filter(f => {
    if (searchTerm && !f.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !f.description.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    if (selectedCategory !== 'all' && f.category !== selectedCategory) {
      return false;
    }
    if (selectedStatus !== 'all' && f.status !== selectedStatus) {
      return false;
    }
    return true;
  });

  // Estatisticas
  const stats = {
    total: features.length,
    enabled: features.filter(f => f.status === 'enabled').length,
    beta: features.filter(f => f.status === 'beta').length,
    disabled: features.filter(f => f.status === 'disabled').length,
    comingSoon: features.filter(f => f.status === 'coming_soon').length,
    visible: features.filter(f => f.visible).length,
  };

  // Toggle visibilidade
  const handleToggleVisibility = (featureId: FeatureModule) => {
    const feature = features.find(f => f.id === featureId);
    if (!feature) return;

    updateFeatureConfig(featureId, { visible: !feature.visible });
    setFeatures(getAllFeatures());
    setHasChanges(true);
  };

  // Toggle status
  const handleToggleStatus = (featureId: FeatureModule) => {
    const feature = features.find(f => f.id === featureId);
    if (!feature) return;

    const newStatus: FeatureStatus = feature.status === 'enabled' ? 'disabled' : 'enabled';
    updateFeatureConfig(featureId, { status: newStatus });
    setFeatures(getAllFeatures());
    setHasChanges(true);
  };

  // Alterar status
  const handleChangeStatus = (featureId: FeatureModule, status: FeatureStatus) => {
    updateFeatureConfig(featureId, { status });
    setFeatures(getAllFeatures());
    setHasChanges(true);
  };

  // Reset
  const handleReset = () => {
    if (confirm('Tem certeza que deseja resetar todas as configuracoes para o padrao?')) {
      resetFeatureFlags();
      setFeatures(getAllFeatures());
      setHasChanges(false);
    }
  };

  // Salvar alteracoes
  const handleSave = () => {
    // As alteracoes ja foram persistidas via updateFeatureConfig
    // que salva no localStorage automaticamente
    setHasChanges(false);
    alert('Alteracoes salvas com sucesso!');
  };

  // Abrir detalhes
  const handleOpenDetails = (feature: FeatureConfig) => {
    setSelectedFeature(feature);
    setIsDetailDialogOpen(true);
  };

  // Categorias unicas
  const categories = [...new Set(features.map(f => f.category))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Settings className="h-6 w-6" />
            Feature Flags
          </h2>
          <p className="text-muted-foreground">
            Controle de visibilidade e status dos modulos da plataforma
          </p>
        </div>
        <div className="flex gap-2">
          {hasChanges && (
            <Badge variant="outline" className="text-amber-600 border-amber-300 bg-amber-50">
              Alteracoes nao salvas
            </Badge>
          )}
          <Button variant="outline" onClick={handleReset}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Resetar
          </Button>
          <Button disabled={!hasChanges} onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Salvar Alteracoes
          </Button>
        </div>
      </div>

      {/* Alerta */}
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Controle de Lancamento</AlertTitle>
        <AlertDescription>
          Use as feature flags para controlar quais modulos estao visiveis para os clientes.
          Features marcadas como "Em Breve" aparecerao com badge especial. Features ocultas nao aparecerao no menu.
        </AlertDescription>
      </Alert>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-slate-100 rounded-lg">
                <Settings className="h-5 w-5 text-slate-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Play className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.enabled}</p>
                <p className="text-xs text-muted-foreground">Habilitados</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Sparkles className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.beta}</p>
                <p className="text-xs text-muted-foreground">Beta</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.comingSoon}</p>
                <p className="text-xs text-muted-foreground">Em Breve</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-gray-400">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Pause className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.disabled}</p>
                <p className="text-xs text-muted-foreground">Desabilitados</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-l-4 border-l-cyan-500">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-cyan-100 rounded-lg">
                <Eye className="h-5 w-5 text-cyan-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.visible}</p>
                <p className="text-xs text-muted-foreground">Visiveis</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar modulo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as typeof selectedCategory)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas Categorias</SelectItem>
            {categories.map(cat => (
              <SelectItem key={cat} value={cat}>{categoryLabels[cat]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedStatus} onValueChange={(v) => setSelectedStatus(v as typeof selectedStatus)}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos Status</SelectItem>
            <SelectItem value="enabled">Habilitado</SelectItem>
            <SelectItem value="disabled">Desabilitado</SelectItem>
            <SelectItem value="beta">Beta</SelectItem>
            <SelectItem value="coming_soon">Em Breve</SelectItem>
            <SelectItem value="maintenance">Manutencao</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabs por categoria */}
      <Tabs defaultValue="all">
        <TabsList className="flex-wrap h-auto">
          <TabsTrigger value="all" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Todos
          </TabsTrigger>
          {categories.map(cat => {
            const Icon = categoryIcons[cat];
            return (
              <TabsTrigger key={cat} value={cat} className="flex items-center gap-2">
                <Icon className="h-4 w-4" />
                {categoryLabels[cat]}
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Todos os Modulos</CardTitle>
              <CardDescription>
                {filteredFeatures.length} modulo(s) encontrado(s)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Modulo</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Visivel</TableHead>
                      <TableHead>Ambientes</TableHead>
                      <TableHead className="text-right">Acoes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredFeatures.map(feature => {
                      const CategoryIcon = categoryIcons[feature.category];
                      return (
                        <TableRow key={feature.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{feature.name}</p>
                              <p className="text-xs text-muted-foreground max-w-[300px] truncate">
                                {feature.description}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="flex items-center gap-1 w-fit">
                              <CategoryIcon className="h-3 w-3" />
                              {categoryLabels[feature.category]}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Select
                              value={feature.status}
                              onValueChange={(v) => handleChangeStatus(feature.id, v as FeatureStatus)}
                            >
                              <SelectTrigger className="w-[130px]">
                                <SelectValue>
                                  <Badge className={statusColors[feature.status]}>
                                    {statusLabels[feature.status]}
                                  </Badge>
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="enabled">
                                  <Badge className="bg-green-500">Habilitado</Badge>
                                </SelectItem>
                                <SelectItem value="disabled">
                                  <Badge className="bg-gray-400">Desabilitado</Badge>
                                </SelectItem>
                                <SelectItem value="beta">
                                  <Badge className="bg-purple-500">Beta</Badge>
                                </SelectItem>
                                <SelectItem value="coming_soon">
                                  <Badge className="bg-blue-500">Em Breve</Badge>
                                </SelectItem>
                                <SelectItem value="maintenance">
                                  <Badge className="bg-amber-500">Manutencao</Badge>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Switch
                              checked={feature.visible}
                              onCheckedChange={() => handleToggleVisibility(feature.id)}
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              {feature.environments.map(env => (
                                <Badge key={env} variant="outline" className="text-xs">
                                  {env === 'development' ? 'Dev' : env === 'staging' ? 'Stg' : 'Prod'}
                                </Badge>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" onClick={() => handleOpenDetails(feature)}>
                              <Info className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {categories.map(cat => (
          <TabsContent key={cat} value={cat} className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {(() => {
                    const Icon = categoryIcons[cat];
                    return <Icon className="h-5 w-5" />;
                  })()}
                  {categoryLabels[cat]}
                </CardTitle>
                <CardDescription>
                  {getFeaturesByCategory(cat).length} modulo(s) nesta categoria
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {getFeaturesByCategory(cat).map(feature => (
                    <Card key={feature.id} className={`border-l-4 ${feature.visible ? 'border-l-green-500' : 'border-l-gray-300'}`}>
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">{feature.name}</CardTitle>
                          <Badge className={statusColors[feature.status]}>
                            {statusLabels[feature.status]}
                          </Badge>
                        </div>
                        <CardDescription>{feature.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {feature.visible ? (
                              <Eye className="h-4 w-4 text-green-600" />
                            ) : (
                              <EyeOff className="h-4 w-4 text-gray-400" />
                            )}
                            <span className="text-sm">
                              {feature.visible ? 'Visivel no menu' : 'Oculto do menu'}
                            </span>
                          </div>
                          <Switch
                            checked={feature.visible}
                            onCheckedChange={() => handleToggleVisibility(feature.id)}
                          />
                        </div>

                        {feature.dependencies && feature.dependencies.length > 0 && (
                          <div className="text-xs text-muted-foreground">
                            Dependencias: {feature.dependencies.join(', ')}
                          </div>
                        )}

                        {feature.launchDate && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3" />
                            Lancamento: {new Date(feature.launchDate).toLocaleDateString('pt-BR')}
                          </div>
                        )}

                        {feature.betaUsers && feature.betaUsers.length > 0 && (
                          <div className="text-xs text-muted-foreground">
                            Beta users: {feature.betaUsers.length} usuario(s)
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Dialog de Detalhes */}
      <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedFeature?.name}</DialogTitle>
            <DialogDescription>{selectedFeature?.description}</DialogDescription>
          </DialogHeader>

          {selectedFeature && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Status</Label>
                  <Badge className={`${statusColors[selectedFeature.status]} mt-1`}>
                    {statusLabels[selectedFeature.status]}
                  </Badge>
                </div>
                <div>
                  <Label>Categoria</Label>
                  <Badge variant="outline" className="mt-1">
                    {categoryLabels[selectedFeature.category]}
                  </Badge>
                </div>
              </div>

              <div>
                <Label>Visibilidade</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Switch
                    checked={selectedFeature.visible}
                    onCheckedChange={() => {
                      handleToggleVisibility(selectedFeature.id);
                      setSelectedFeature(getAllFeatures().find(f => f.id === selectedFeature.id) || null);
                    }}
                  />
                  <span className="text-sm">
                    {selectedFeature.visible ? 'Visivel no menu' : 'Oculto do menu'}
                  </span>
                </div>
              </div>

              <div>
                <Label>Ambientes</Label>
                <div className="flex gap-2 mt-1">
                  {selectedFeature.environments.map(env => (
                    <Badge key={env} variant="outline">
                      {env}
                    </Badge>
                  ))}
                </div>
              </div>

              {selectedFeature.allowedRoles && (
                <div>
                  <Label>Roles Permitidos</Label>
                  <div className="flex gap-2 mt-1 flex-wrap">
                    {selectedFeature.allowedRoles.map(role => (
                      <Badge key={role} variant="secondary">
                        {role}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {selectedFeature.dependencies && selectedFeature.dependencies.length > 0 && (
                <div>
                  <Label>Dependencias</Label>
                  <div className="flex gap-2 mt-1 flex-wrap">
                    {selectedFeature.dependencies.map(dep => (
                      <Badge key={dep} variant="outline">
                        {dep}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {selectedFeature.betaUsers && selectedFeature.betaUsers.length > 0 && (
                <div>
                  <Label>Usuarios Beta</Label>
                  <div className="text-sm mt-1 space-y-1">
                    {selectedFeature.betaUsers.map(email => (
                      <p key={email} className="text-muted-foreground">{email}</p>
                    ))}
                  </div>
                </div>
              )}

              {selectedFeature.launchDate && (
                <div>
                  <Label>Data de Lancamento</Label>
                  <p className="text-sm mt-1">
                    {new Date(selectedFeature.launchDate).toLocaleDateString('pt-BR', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default FeatureFlagsManager;
