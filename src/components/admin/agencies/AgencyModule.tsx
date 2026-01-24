// ============================================
// MÓDULO DE GESTÃO DE IMOBILIÁRIAS
// Arquitetura Limpa: Cadastro separado de Deploy
// ============================================

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Building2,
  Globe,
  Rocket,
  Plus,
  Search,
  Loader2,
  RefreshCw,
  Pencil,
  Trash2,
  LogIn,
  AlertCircle,
  Settings,
  ExternalLink,
  CheckCircle,
  MoreVertical,
  Clock,
  Users,
  Home,
  Mail,
  Phone,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { AgencySiteConfigModal } from './AgencySiteConfigModal';

// ============================================
// CONFIGURAÇÃO
// ============================================
const API_URL = import.meta.env.VITE_API_URL || 'https://vinculobrasil-production.up.railway.app';

// ============================================
// TIPOS
// ============================================
interface Agency {
  id: string;
  name: string;
  legalName?: string;
  slug: string;
  cnpj?: string;
  creci?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  logoUrl?: string;
  siteUrl?: string;
  status: string;
  active: boolean;
  createdAt: string;
  adminEmail?: string;
  _count?: {
    users: number;
    properties: number;
  };
}

interface CreateAgencyData {
  name: string;
  slug: string;
  cnpj?: string;
  adminName: string;
  adminEmail: string;
  adminPassword: string;
}

// ============================================
// HELPER: Fetch autenticado
// ============================================
const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem('token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }
  return fetch(url, { ...options, headers });
};

// ============================================
// COMPONENTE: KPI Card Melhorado (Dark Mode)
// ============================================
function KpiCard({
  title,
  value,
  icon: Icon,
  color = 'text-zinc-400',
  bgIcon = 'bg-zinc-800',
  description,
}: {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  color?: string;
  bgIcon?: string;
  description?: string;
}) {
  return (
    <Card className="hover:shadow-md transition-all duration-200 border-zinc-800 bg-zinc-900 shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm text-zinc-400 font-medium">{title}</p>
            <h4 className={cn('text-3xl font-bold', color)}>{value}</h4>
            {description && (
              <p className="text-xs text-zinc-500">{description}</p>
            )}
          </div>
          <div className={cn('p-3 rounded-xl', bgIcon)}>
            <Icon className={cn('h-6 w-6', color)} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================
// COMPONENTE: Modal de Cadastro Simplificado
// Apenas salva no banco - NÃO cria site
// ============================================
function CreateAgencyModal({
  open,
  onOpenChange,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state - Campos essenciais apenas
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [cnpj, setCnpj] = useState('');

  // Admin
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  // Auto-generate slug from name
  const handleNameChange = (value: string) => {
    setName(value);
    const generatedSlug = value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
    setSlug(generatedSlug);
  };

  const resetForm = () => {
    setName('');
    setSlug('');
    setCnpj('');
    setAdminName('');
    setAdminEmail('');
    setAdminPassword('');
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      console.log('📝 [CADASTRO] Salvando imobiliária no banco (sem deploy)...');

      const payload: CreateAgencyData = {
        name,
        slug,
        cnpj: cnpj || undefined,
        adminName,
        adminEmail,
        adminPassword,
      };

      const response = await fetchWithAuth(`${API_URL}/api/agencies`, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Erro ao criar imobiliária');
      }

      console.log('✅ [CADASTRO] Imobiliária salva com sucesso:', data);
      toast.success('Imobiliária cadastrada! Agora você pode publicar o site.');
      resetForm();
      onOpenChange(false);
      onSuccess();
    } catch (err: any) {
      console.error('❌ [CADASTRO ERROR]', err);
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-zinc-900 border-zinc-700">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl text-white">
            <Building2 className="h-6 w-6 text-blue-500" />
            Nova Imobiliária
          </DialogTitle>
          <DialogDescription className="text-zinc-400">
            Cadastro básico - apenas banco de dados e acesso admin.
            O site será configurado depois.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-6 py-4">
            {/* SEÇÃO 1: DADOS DA EMPRESA */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-zinc-300">
                <Building2 className="h-4 w-4" />
                Dados da Empresa
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome da Imobiliária *</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="Ex: Fatto Imóveis"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">Slug (Domínio) *</Label>
                  <Input
                    id="slug"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    placeholder="fatto-imoveis"
                    pattern="^[a-z0-9-]+$"
                    required
                  />
                  {slug && (
                    <p className="text-xs text-muted-foreground">
                      Será: <span className="font-mono text-blue-600">{slug}.vinculobrasil.com.br</span>
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cnpj">CNPJ (opcional)</Label>
                  <Input
                    id="cnpj"
                    value={cnpj}
                    onChange={(e) => setCnpj(e.target.value)}
                    placeholder="00.000.000/0001-00"
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* SEÇÃO 2: DADOS DO ADMIN */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm font-semibold text-zinc-300">
                <Users className="h-4 w-4" />
                Dados de Acesso (Admin)
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="adminName">Nome do Administrador *</Label>
                  <Input
                    id="adminName"
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    placeholder="João Silva"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="adminEmail">Email *</Label>
                  <Input
                    type="email"
                    id="adminEmail"
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="admin@imobiliaria.com"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="adminPassword">Senha Inicial *</Label>
                  <Input
                    type="password"
                    id="adminPassword"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    minLength={6}
                    required
                  />
                </div>
              </div>
            </div>

            {/* INFO BOX */}
            <Alert className="bg-blue-600/10 border-blue-600/30">
              <Clock className="h-4 w-4 text-blue-400" />
              <AlertDescription className="text-blue-300 text-sm">
                <strong className="text-blue-200">Próximo passo:</strong> Após o cadastro, clique em "Publicar Site"
                na tabela para configurar cores, textos e colocar o site no ar.
              </AlertDescription>
            </Alert>
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {loading ? 'Salvando...' : 'Cadastrar Imobiliária'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ============================================
// COMPONENTE: Status Badge do Site (Dark Mode)
// ============================================
function SiteStatusBadge({ agency }: { agency: Agency }) {
  if (agency.siteUrl) {
    return (
      <a
        href={agency.siteUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-600/20 text-green-400 text-xs font-medium hover:bg-green-600/30 transition-colors"
      >
        <Globe className="h-3.5 w-3.5" />
        Online
        <ExternalLink className="h-3 w-3 opacity-60" />
      </a>
    );
  }

  return (
    <Badge variant="outline" className="text-orange-400 border-orange-600/50 bg-orange-600/20 gap-1">
      <Clock className="h-3 w-3" />
      Aguardando
    </Badge>
  );
}

// ============================================
// COMPONENTE PRINCIPAL: Agency Module
// ============================================
export function AgencyModule() {
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedAgency, setSelectedAgency] = useState<Agency | null>(null);
  const [deleteAgency, setDeleteAgency] = useState<Agency | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Fetch agencies
  const fetchAgencies = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('🔄 [ADMIN] Buscando imobiliárias...');
      const response = await fetchWithAuth(`${API_URL}/api/agencies`);

      if (!response.ok) {
        if (response.status === 401) throw new Error('Sessão expirada');
        throw new Error(`Erro: ${response.status}`);
      }

      const data = await response.json();
      const list = Array.isArray(data) ? data : data.agencies || [];
      setAgencies(list);
      console.log('✅ [ADMIN] Imobiliárias carregadas:', list.length);
    } catch (err: any) {
      console.error('❌ [ADMIN ERROR]', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAgencies();
  }, [fetchAgencies]);

  // Delete handler
  const handleDelete = async () => {
    if (!deleteAgency) return;
    setDeleting(true);
    try {
      const response = await fetchWithAuth(`${API_URL}/api/agencies/${deleteAgency.id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Erro ao excluir');
      toast.success('Imobiliária excluída');
      setDeleteAgency(null);
      fetchAgencies();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setDeleting(false);
    }
  };

  // Impersonate handler
  const handleLoginAs = (agency: Agency) => {
    toast.info(`Login como ${agency.name} - Em desenvolvimento`);
  };

  // Filtered agencies
  const filteredAgencies = agencies.filter(
    (a) =>
      a.name.toLowerCase().includes(search.toLowerCase()) ||
      a.slug.toLowerCase().includes(search.toLowerCase()) ||
      (a.adminEmail && a.adminEmail.toLowerCase().includes(search.toLowerCase()))
  );

  // KPI calculations
  const totalAgencies = agencies.length;
  const sitesOnline = agencies.filter((a) => a.siteUrl).length;
  const pendingDeploy = agencies.filter((a) => !a.siteUrl).length;

  return (
    <div className="p-6 space-y-6 bg-zinc-950 min-h-screen">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <div className="p-2 bg-blue-600/20 rounded-xl">
              <Building2 className="h-6 w-6 text-blue-500" />
            </div>
            Gestão de Imobiliárias
          </h1>
          <p className="text-zinc-400 mt-1">
            Administre parceiros e infraestrutura Whitelabel
          </p>
        </div>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 shadow-md"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nova Imobiliária
        </Button>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KpiCard
          title="Total de Imobiliárias"
          value={totalAgencies}
          icon={Building2}
          color="text-blue-400"
          bgIcon="bg-blue-600/20"
          description="Cadastradas no sistema"
        />
        <KpiCard
          title="Sites Online"
          value={sitesOnline}
          icon={Globe}
          color="text-green-400"
          bgIcon="bg-green-600/20"
          description="Publicados e ativos"
        />
        <KpiCard
          title="Aguardando Deploy"
          value={pendingDeploy}
          icon={Rocket}
          color="text-orange-400"
          bgIcon="bg-orange-600/20"
          description="Prontos para publicar"
        />
      </div>

      {/* ERROR STATE */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button variant="outline" size="sm" onClick={fetchAgencies}>
              Tentar Novamente
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* TABLE CARD */}
      <Card className="border-zinc-800 bg-zinc-900 shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-lg text-white">Parceiros Cadastrados</CardTitle>
              <CardDescription className="text-zinc-400">
                {filteredAgencies.length} imobiliária{filteredAgencies.length !== 1 ? 's' : ''} encontrada{filteredAgencies.length !== 1 ? 's' : ''}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <Input
                  placeholder="Buscar por nome, slug ou email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 w-64 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                />
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={fetchAgencies}
                title="Atualizar"
                disabled={loading}
                className="border-zinc-700 hover:bg-zinc-800"
              >
                <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-zinc-800/50 hover:bg-zinc-800/50 border-zinc-700">
                <TableHead className="font-semibold text-zinc-300">Imobiliária</TableHead>
                <TableHead className="font-semibold text-zinc-300">Admin</TableHead>
                <TableHead className="font-semibold text-center text-zinc-300">Status</TableHead>
                <TableHead className="font-semibold text-center text-zinc-300">Site</TableHead>
                <TableHead className="font-semibold text-right text-zinc-300">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow className="border-zinc-800">
                  <TableCell colSpan={5} className="text-center py-16">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500" />
                    <p className="text-zinc-400 mt-3">Carregando imobiliárias...</p>
                  </TableCell>
                </TableRow>
              ) : filteredAgencies.length === 0 ? (
                <TableRow className="border-zinc-800">
                  <TableCell colSpan={5} className="text-center py-16">
                    <Building2 className="h-12 w-12 mx-auto text-zinc-600 mb-3" />
                    <p className="text-zinc-400 font-medium">
                      {search ? 'Nenhum resultado encontrado' : 'Nenhuma imobiliária cadastrada'}
                    </p>
                    <p className="text-zinc-500 text-sm mt-1">
                      {search ? 'Tente outro termo de busca' : 'Clique em "Nova Imobiliária" para começar'}
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredAgencies.map((agency) => (
                  <TableRow key={agency.id} className="hover:bg-zinc-800/50 border-zinc-800">
                    {/* Imobiliária */}
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 rounded-lg border border-zinc-700">
                          {agency.logoUrl ? (
                            <AvatarImage src={agency.logoUrl} alt={agency.name} />
                          ) : null}
                          <AvatarFallback className="rounded-lg bg-blue-600/20 text-blue-400 font-semibold">
                            {agency.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold text-white">{agency.name}</p>
                          <p className="text-xs text-zinc-500 font-mono">{agency.slug}</p>
                        </div>
                      </div>
                    </TableCell>

                    {/* Admin */}
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm text-zinc-300">
                        <Mail className="h-3.5 w-3.5 text-zinc-500" />
                        {agency.adminEmail || '-'}
                      </div>
                    </TableCell>

                    {/* Status Conta */}
                    <TableCell className="text-center">
                      <Badge
                        variant={agency.active ? 'default' : 'secondary'}
                        className={cn(
                          agency.active
                            ? 'bg-green-600/20 text-green-400 hover:bg-green-600/20'
                            : 'bg-zinc-700 text-zinc-400'
                        )}
                      >
                        {agency.active ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </TableCell>

                    {/* Status Site */}
                    <TableCell className="text-center">
                      <SiteStatusBadge agency={agency} />
                    </TableCell>

                    {/* Ações */}
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {/* Botão Principal: Deploy ou Configurar */}
                        {!agency.siteUrl ? (
                          <Button
                            size="sm"
                            onClick={() => setSelectedAgency(agency)}
                            className="bg-orange-500 hover:bg-orange-600 text-white shadow-sm"
                          >
                            <Rocket className="h-4 w-4 mr-1" />
                            Publicar Site
                          </Button>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedAgency(agency)}
                          >
                            <Settings className="h-4 w-4 mr-1" />
                            Configurar
                          </Button>
                        )}

                        {/* Menu de Ações */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-zinc-700">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 bg-zinc-900 border-zinc-700">
                            <DropdownMenuItem
                              onClick={() => setSelectedAgency(agency)}
                              className="text-zinc-300 focus:bg-zinc-800 focus:text-white cursor-pointer"
                            >
                              <Pencil className="h-4 w-4 mr-2" />
                              Editar Cadastro
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleLoginAs(agency)}
                              className="text-zinc-300 focus:bg-zinc-800 focus:text-white cursor-pointer"
                            >
                              <LogIn className="h-4 w-4 mr-2" />
                              Login Como
                            </DropdownMenuItem>
                            {agency.siteUrl && (
                              <DropdownMenuItem
                                onClick={() => window.open(agency.siteUrl, '_blank')}
                                className="text-zinc-300 focus:bg-zinc-800 focus:text-white cursor-pointer"
                              >
                                <ExternalLink className="h-4 w-4 mr-2" />
                                Ver Site
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator className="bg-zinc-700" />
                            <DropdownMenuItem
                              onClick={() => setDeleteAgency(agency)}
                              className="text-red-400 focus:bg-red-500/10 focus:text-red-300 cursor-pointer"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* MODAL: Cadastro Básico */}
      <CreateAgencyModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSuccess={fetchAgencies}
      />

      {/* MODAL: Configurar/Publicar Site Whitelabel */}
      <AgencySiteConfigModal
        agency={selectedAgency}
        open={!!selectedAgency}
        onOpenChange={(open) => !open && setSelectedAgency(null)}
        onSuccess={fetchAgencies}
      />

      {/* DIALOG: Confirmar Exclusão */}
      <AlertDialog open={!!deleteAgency} onOpenChange={() => setDeleteAgency(null)}>
        <AlertDialogContent className="bg-zinc-900 border-zinc-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              Tem certeza que deseja excluir <strong className="text-white">{deleteAgency?.name}</strong>?
              <br />
              <span className="text-red-400">Esta ação não pode ser desfeita.</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting} className="bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700 hover:text-white">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default AgencyModule;
