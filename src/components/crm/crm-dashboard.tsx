// =============================================================================
// CRM Dashboard - Painel Principal do Vínculo CRM
// =============================================================================

import * as React from 'react';
import {
  LayoutDashboard,
  Users,
  Target,
  TrendingUp,
  DollarSign,
  Webhook,
  Settings,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  Flame,
  Clock,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  Plus,
  Phone,
  Mail,
  MessageSquare,
  Building2,
  CheckCircle2,
  XCircle,
  Activity,
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';

import { KanbanBoard, DealDetailModal } from './kanban';
import { useCRMStore } from './store';
import { leadIngestionService } from './services/lead-ingestion-service';
import {
  type Lead,
  type Deal,
  LEAD_SOURCES_LABELS,
  PRIORITY_COLORS,
  PRIORITY_LABELS,
} from './types';

// -----------------------------------------------------------------------------
// Componente de Estatísticas
// -----------------------------------------------------------------------------

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

function StatCard({ title, value, description, icon, trend, className }: StatCardProps) {
  return (
    <Card className={cn('', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <div className="flex items-center justify-between">
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
          {trend && (
            <div
              className={cn(
                'flex items-center text-xs',
                trend.isPositive ? 'text-green-600' : 'text-red-600'
              )}
            >
              {trend.isPositive ? (
                <ArrowUpRight className="h-3 w-3" />
              ) : (
                <ArrowDownRight className="h-3 w-3" />
              )}
              {Math.abs(trend.value)}%
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// -----------------------------------------------------------------------------
// Componente de Lead Recente
// -----------------------------------------------------------------------------

interface RecentLeadItemProps {
  lead: Lead;
}

function RecentLeadItem({ lead }: RecentLeadItemProps) {
  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));

    if (diffMins < 60) return `${diffMins}min atrás`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h atrás`;
    return format(new Date(date), "dd/MM", { locale: ptBR });
  };

  return (
    <div className="flex items-center gap-3 py-3 border-b last:border-0">
      <div
        className={cn(
          'h-10 w-10 rounded-full flex items-center justify-center text-white font-medium',
          lead.temperature === 'quente'
            ? 'bg-orange-500'
            : lead.temperature === 'morno'
              ? 'bg-yellow-500'
              : 'bg-slate-400'
        )}
      >
        {lead.nome.charAt(0).toUpperCase()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium truncate">{lead.nome}</span>
          {lead.temperature === 'quente' && <Flame className="h-4 w-4 text-orange-500" />}
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="truncate">{lead.email || lead.telefone}</span>
          <span>•</span>
          <span>{LEAD_SOURCES_LABELS[lead.source]}</span>
        </div>
      </div>
      <div className="text-right shrink-0">
        <Badge variant="secondary" className="text-[10px]">
          Score: {lead.score}
        </Badge>
        <p className="text-xs text-muted-foreground mt-1">
          {formatTimeAgo(lead.createdAt)}
        </p>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Componente de Deal Recente
// -----------------------------------------------------------------------------

interface RecentDealItemProps {
  deal: Deal;
  onClick: () => void;
}

function RecentDealItem({ deal, onClick }: RecentDealItemProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div
      className="flex items-center gap-3 py-3 border-b last:border-0 cursor-pointer hover:bg-muted/50 -mx-2 px-2 rounded-lg transition-colors"
      onClick={onClick}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium truncate">{deal.title}</span>
          <Badge
            variant="secondary"
            className={cn('text-[10px]', PRIORITY_COLORS[deal.priority])}
          >
            {PRIORITY_LABELS[deal.priority]}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground truncate">
          {deal.imovelTipo || 'Imóvel não definido'}
        </p>
      </div>
      <div className="text-right shrink-0">
        <p className="font-semibold text-green-600">
          {formatCurrency(deal.valorTotal)}
        </p>
        <p className="text-xs text-muted-foreground">{deal.probability}% prob.</p>
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Componente de Webhook Config
// -----------------------------------------------------------------------------

interface WebhookFormData {
  name: string;
  endpoint: string;
  secretKey: string;
  platform: 'custom' | 'n8n' | 'zapier' | 'make' | 'whatsapp';
  status: 'ativo' | 'inativo' | 'erro';
  description: string;
}

function WebhookConfigPanel() {
  const webhooks = leadIngestionService.getWebhookConfigs();
  const [isNewWebhookOpen, setIsNewWebhookOpen] = React.useState(false);
  const [isEditWebhookOpen, setIsEditWebhookOpen] = React.useState(false);
  const [selectedWebhook, setSelectedWebhook] = React.useState<WebhookFormData | null>(null);
  const [newWebhook, setNewWebhook] = React.useState<WebhookFormData>({
    name: '',
    endpoint: '',
    secretKey: '',
    platform: 'custom',
    status: 'ativo',
    description: '',
  });

  const handleCreateWebhook = () => {
    // Simular criação
    alert(`Webhook "${newWebhook.name}" criado com sucesso!\nPlataforma: ${newWebhook.platform}\nEndpoint: ${newWebhook.endpoint || 'Gerado automaticamente'}`);
    setIsNewWebhookOpen(false);
    setNewWebhook({ name: '', endpoint: '', secretKey: '', platform: 'custom', status: 'ativo', description: '' });
  };

  const handleEditWebhook = (webhook: typeof webhooks[0]) => {
    setSelectedWebhook({
      name: webhook.name,
      endpoint: webhook.endpoint,
      secretKey: webhook.secretKey || '',
      platform: 'custom',
      status: webhook.status,
      description: '',
    });
    setIsEditWebhookOpen(true);
  };

  const handleSaveWebhook = () => {
    alert(`Webhook "${selectedWebhook?.name}" atualizado com sucesso!`);
    setIsEditWebhookOpen(false);
    setSelectedWebhook(null);
  };

  const generateN8NEndpoint = () => {
    const webhookId = Math.random().toString(36).substring(2, 10);
    return `https://api.vinculobrasil.com.br/webhooks/n8n/${webhookId}`;
  };

  const platformOptions = [
    { value: 'custom', label: 'Webhook Personalizado', description: 'Configure seu proprio endpoint' },
    { value: 'n8n', label: 'N8N', description: 'Integração com N8N para automação de fluxos' },
    { value: 'zapier', label: 'Zapier', description: 'Conecte com +5000 apps via Zapier' },
    { value: 'make', label: 'Make (Integromat)', description: 'Automação visual com Make' },
    { value: 'whatsapp', label: 'WhatsApp Business', description: 'Via API do Facebook/Meta' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Webhooks Configurados</h3>
          <p className="text-sm text-muted-foreground">
            Endpoints para receber leads automaticamente. Suporte a N8N, Zapier, Make e WhatsApp Business.
          </p>
        </div>
        <Button size="sm" onClick={() => setIsNewWebhookOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Webhook
        </Button>
      </div>

      {/* Cards de Plataformas Suportadas */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
        {platformOptions.map((platform) => (
          <Card
            key={platform.value}
            className="p-3 cursor-pointer hover:border-primary transition-colors"
            onClick={() => {
              setNewWebhook(prev => ({ ...prev, platform: platform.value as WebhookFormData['platform'] }));
              setIsNewWebhookOpen(true);
            }}
          >
            <div className="text-center">
              <Badge variant="outline" className="mb-2">{platform.label}</Badge>
              <p className="text-xs text-muted-foreground">{platform.description}</p>
            </div>
          </Card>
        ))}
      </div>

      <Separator />

      <div className="space-y-3">
        {webhooks.map((webhook) => (
          <Card key={webhook.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Webhook className="h-4 w-4 text-primary" />
                    <span className="font-medium">{webhook.name}</span>
                    <Badge
                      variant={webhook.status === 'ativo' ? 'default' : 'secondary'}
                    >
                      {webhook.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground font-mono">
                    POST {webhook.endpoint}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mt-2">
                    <span>
                      {webhook.totalLeadsReceived} leads recebidos
                    </span>
                    {webhook.lastLeadAt && (
                      <span>
                        Último: {format(new Date(webhook.lastLeadAt), "dd/MM HH:mm")}
                      </span>
                    )}
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => handleEditWebhook(webhook)}>
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modal Novo Webhook */}
      {isNewWebhookOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Webhook className="h-5 w-5" />
                Novo Webhook
              </CardTitle>
              <CardDescription>
                Configure um novo endpoint para receber leads automaticamente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Plataforma</label>
                <div className="grid grid-cols-2 gap-2">
                  {platformOptions.map((opt) => (
                    <Button
                      key={opt.value}
                      variant={newWebhook.platform === opt.value ? 'default' : 'outline'}
                      size="sm"
                      className="justify-start"
                      onClick={() => setNewWebhook(prev => ({ ...prev, platform: opt.value as WebhookFormData['platform'] }))}
                    >
                      {opt.label}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Nome do Webhook *</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="Ex: Lead do Site Principal"
                  value={newWebhook.name}
                  onChange={(e) => setNewWebhook(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              {newWebhook.platform === 'n8n' && (
                <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <p className="text-sm font-medium text-orange-700 mb-2">Configuração N8N</p>
                  <p className="text-xs text-orange-600 mb-2">
                    Cole este endpoint no seu workflow N8N como Webhook Trigger:
                  </p>
                  <code className="text-xs bg-orange-100 p-2 rounded block break-all">
                    {generateN8NEndpoint()}
                  </code>
                </div>
              )}

              {newWebhook.platform === 'whatsapp' && (
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-sm font-medium text-green-700 mb-2">WhatsApp Business API</p>
                  <p className="text-xs text-green-600">
                    A integração com WhatsApp é feita via API do Facebook/Meta.
                    Configure o webhook no painel do Meta Business Suite.
                  </p>
                  <Button variant="outline" size="sm" className="mt-2" onClick={() => window.open('https://business.facebook.com', '_blank')}>
                    Abrir Meta Business Suite
                  </Button>
                </div>
              )}

              {newWebhook.platform === 'custom' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">URL do Endpoint</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border rounded-md font-mono text-sm"
                    placeholder="https://seu-servidor.com/webhook"
                    value={newWebhook.endpoint}
                    onChange={(e) => setNewWebhook(prev => ({ ...prev, endpoint: e.target.value }))}
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium">Secret (Opcional)</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-md font-mono text-sm"
                  placeholder="Token de autenticação"
                  value={newWebhook.secretKey}
                  onChange={(e) => setNewWebhook(prev => ({ ...prev, secretKey: e.target.value }))}
                />
                <p className="text-xs text-muted-foreground">
                  Será enviado no header X-Webhook-Secret
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Descrição</label>
                <textarea
                  className="w-full px-3 py-2 border rounded-md text-sm resize-none"
                  rows={2}
                  placeholder="Descrição opcional..."
                  value={newWebhook.description}
                  onChange={(e) => setNewWebhook(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
            </CardContent>
            <div className="flex justify-end gap-2 p-4 border-t">
              <Button variant="outline" onClick={() => setIsNewWebhookOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateWebhook} disabled={!newWebhook.name}>
                Criar Webhook
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Modal Editar Webhook */}
      {isEditWebhookOpen && selectedWebhook && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configurar Webhook
              </CardTitle>
              <CardDescription>
                Edite as configurações do webhook
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nome</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-md"
                  value={selectedWebhook.name}
                  onChange={(e) => setSelectedWebhook(prev => prev ? { ...prev, name: e.target.value } : null)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Endpoint</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-md font-mono text-sm"
                  value={selectedWebhook.endpoint}
                  onChange={(e) => setSelectedWebhook(prev => prev ? { ...prev, endpoint: e.target.value } : null)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Secret</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border rounded-md font-mono text-sm"
                  placeholder="Token de autenticação"
                  value={selectedWebhook.secretKey}
                  onChange={(e) => setSelectedWebhook(prev => prev ? { ...prev, secretKey: e.target.value } : null)}
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="text-sm font-medium">Status</span>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant={selectedWebhook.status === 'ativo' ? 'default' : 'outline'}
                    onClick={() => setSelectedWebhook(prev => prev ? { ...prev, status: 'ativo' } : null)}
                  >
                    Ativo
                  </Button>
                  <Button
                    size="sm"
                    variant={selectedWebhook.status === 'inativo' ? 'destructive' : 'outline'}
                    onClick={() => setSelectedWebhook(prev => prev ? { ...prev, status: 'inativo' } : null)}
                  >
                    Inativo
                  </Button>
                </div>
              </div>
            </CardContent>
            <div className="flex justify-end gap-2 p-4 border-t">
              <Button variant="outline" onClick={() => setIsEditWebhookOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveWebhook}>
                Salvar Alterações
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

// -----------------------------------------------------------------------------
// Componente de Funil Visual
// -----------------------------------------------------------------------------

function FunnelChart() {
  const { kanbanColumns } = useCRMStore();

  // Proteção contra array vazio
  if (kanbanColumns.length === 0) {
    return (
      <div className="flex items-center justify-center py-8 text-muted-foreground">
        <p>Carregando funil...</p>
      </div>
    );
  }

  const dealCounts = kanbanColumns.map((col) => col.deals.length);
  const maxDeals = dealCounts.length > 0 ? Math.max(...dealCounts, 1) : 1;

  return (
    <div className="space-y-3">
      {kanbanColumns.slice(0, 7).map((column) => {
        const percentage = (column.deals.length / maxDeals) * 100;
        const totalValue = column.deals.reduce((sum, d) => sum + d.valorTotal, 0);

        return (
          <div key={column.stage.id} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded"
                  style={{ backgroundColor: column.stage.color }}
                />
                <span>{column.stage.name}</span>
              </div>
              <div className="flex items-center gap-4 text-muted-foreground">
                <span>{column.deals.length} deals</span>
                <span className="font-medium text-foreground">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                    minimumFractionDigits: 0,
                  }).format(totalValue)}
                </span>
              </div>
            </div>
            <div className="h-6 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full transition-all duration-500 flex items-center justify-end pr-2"
                style={{
                  width: `${Math.max(percentage, 5)}%`,
                  backgroundColor: column.stage.color,
                }}
              >
                {percentage > 20 && (
                  <span className="text-xs text-white font-medium">
                    {column.stage.probability}%
                  </span>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// -----------------------------------------------------------------------------
// Componente Principal
// -----------------------------------------------------------------------------

export function CRMDashboard() {
  const {
    pipelines,
    leads,
    deals,
    kanbanColumns,
    isLoading,
    loadPipelines,
    selectDeal,
  } = useCRMStore();

  // Estados para modais e ações
  const [isNewLeadOpen, setIsNewLeadOpen] = React.useState(false);
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [isFilterOpen, setIsFilterOpen] = React.useState(false);
  const [filterData, setFilterData] = React.useState({
    search: '',
    status: 'todos',
    temperature: 'todos',
    source: 'todos',
  });
  const [selectedLead, setSelectedLead] = React.useState<Lead | null>(null);
  const [isActionDialogOpen, setIsActionDialogOpen] = React.useState(false);
  const [actionType, setActionType] = React.useState<'phone' | 'email' | 'whatsapp'>('phone');
  const [actionNote, setActionNote] = React.useState('');
  const [newLeadData, setNewLeadData] = React.useState({
    nome: '',
    email: '',
    telefone: '',
    cidade: '',
    estado: '',
    interesse: '',
    source: 'site' as const,
  });

  // Handlers
  const handleExport = () => {
    // Gerar CSV dos leads
    const headers = ['Nome', 'Email', 'Telefone', 'Cidade', 'Estado', 'Score', 'Status', 'Origem'];
    const csvRows = [headers.join(',')];
    leads.forEach(lead => {
      csvRows.push([
        `"${lead.nome}"`,
        lead.email || '',
        lead.telefone || '',
        lead.cidade || '',
        lead.estado || '',
        lead.score.toString(),
        lead.status,
        lead.source,
      ].join(','));
    });
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `leads_vinculo_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadPipelines();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleCreateLead = () => {
    if (!newLeadData.nome || !newLeadData.telefone) {
      alert('Nome e telefone são obrigatórios');
      return;
    }
    // Simular criação
    alert(`Lead "${newLeadData.nome}" criado com sucesso!`);
    setIsNewLeadOpen(false);
    setNewLeadData({ nome: '', email: '', telefone: '', cidade: '', estado: '', interesse: '', source: 'site' });
  };

  // Handler para ações de contato
  const handleLeadAction = (lead: Lead, type: 'phone' | 'email' | 'whatsapp') => {
    setSelectedLead(lead);
    setActionType(type);
    setActionNote('');
    setIsActionDialogOpen(true);
  };

  const handleConfirmAction = () => {
    if (!selectedLead) return;

    const actionLabels = {
      phone: 'Ligação registrada',
      email: 'E-mail enviado',
      whatsapp: 'Mensagem WhatsApp enviada',
    };

    alert(`${actionLabels[actionType]} para ${selectedLead.nome}!\n${actionNote ? `Nota: ${actionNote}` : ''}`);
    setIsActionDialogOpen(false);
    setSelectedLead(null);
    setActionNote('');
  };

  // Filtrar leads
  const filteredLeads = React.useMemo(() => {
    return leads.filter(lead => {
      // Busca por texto
      if (filterData.search) {
        const searchLower = filterData.search.toLowerCase();
        const matchName = lead.nome.toLowerCase().includes(searchLower);
        const matchEmail = lead.email?.toLowerCase().includes(searchLower);
        const matchPhone = lead.telefone?.includes(filterData.search);
        if (!matchName && !matchEmail && !matchPhone) return false;
      }

      // Filtro por status
      if (filterData.status !== 'todos' && lead.status !== filterData.status) return false;

      // Filtro por temperatura
      if (filterData.temperature !== 'todos' && lead.temperature !== filterData.temperature) return false;

      // Filtro por origem
      if (filterData.source !== 'todos' && lead.source !== filterData.source) return false;

      return true;
    });
  }, [leads, filterData]);

  const clearFilters = () => {
    setFilterData({ search: '', status: 'todos', temperature: 'todos', source: 'todos' });
  };

  // Carregar dados ao montar apenas se ainda não carregados
  React.useEffect(() => {
    if (pipelines.length === 0) {
      loadPipelines();
    }
  }, [pipelines.length, loadPipelines]);

  // Cálculo de estatísticas
  const stats = React.useMemo(() => {
    const totalLeads = leads.length;
    const hotLeads = leads.filter((l) => l.temperature === 'quente').length;
    const totalDeals = deals.length;
    const totalValue = deals.reduce((sum, d) => sum + d.valorTotal, 0);
    const wonDeals = deals.filter((d) => d.status === 'ganho');
    const wonValue = wonDeals.reduce((sum, d) => sum + d.valorTotal, 0);
    const lostDeals = deals.filter((d) => d.status === 'perdido').length;
    const conversionRate = totalDeals > 0 ? (wonDeals.length / totalDeals) * 100 : 0;

    const avgDealValue = totalDeals > 0 ? totalValue / totalDeals : 0;

    return {
      totalLeads,
      hotLeads,
      totalDeals,
      totalValue,
      wonDeals: wonDeals.length,
      wonValue,
      lostDeals,
      conversionRate,
      avgDealValue,
    };
  }, [leads, deals]);

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `R$ ${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `R$ ${(value / 1000).toFixed(0)}k`;
    }
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
    }).format(value);
  };

  // Leads recentes (últimos 5)
  const recentLeads = React.useMemo(() => {
    return [...leads]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }, [leads]);

  // Deals recentes (últimos 5)
  const recentDeals = React.useMemo(() => {
    return [...deals]
      .filter((d) => d.status !== 'ganho' && d.status !== 'perdido')
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5);
  }, [deals]);

  // Deals quentes (alta prioridade)
  const hotDeals = React.useMemo(() => {
    return deals
      .filter(
        (d) =>
          (d.priority === 'urgente' || d.priority === 'alta') &&
          d.status !== 'ganho' &&
          d.status !== 'perdido'
      )
      .slice(0, 5);
  }, [deals]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b">
        <div>
          <h1 className="text-2xl font-bold">Vínculo CRM</h1>
          <p className="text-muted-foreground">
            Gestão de Leads e Negócios Imobiliários
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={cn("h-4 w-4 mr-2", isRefreshing && "animate-spin")} />
            Atualizar
          </Button>
          <Button size="sm" onClick={() => setIsNewLeadOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Lead
          </Button>
        </div>
      </div>

      {/* Modal Novo Lead */}
      {isNewLeadOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Novo Lead
              </CardTitle>
              <CardDescription>
                Cadastre um novo lead manualmente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-2">
                  <label className="text-sm font-medium">Nome Completo *</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="Nome do lead"
                    value={newLeadData.nome}
                    onChange={(e) => setNewLeadData(prev => ({ ...prev, nome: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <input
                    type="email"
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="email@exemplo.com"
                    value={newLeadData.email}
                    onChange={(e) => setNewLeadData(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Telefone *</label>
                  <input
                    type="tel"
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="(11) 99999-9999"
                    value={newLeadData.telefone}
                    onChange={(e) => setNewLeadData(prev => ({ ...prev, telefone: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Cidade</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="São Paulo"
                    value={newLeadData.cidade}
                    onChange={(e) => setNewLeadData(prev => ({ ...prev, cidade: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Estado</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="SP"
                    maxLength={2}
                    value={newLeadData.estado}
                    onChange={(e) => setNewLeadData(prev => ({ ...prev, estado: e.target.value.toUpperCase() }))}
                  />
                </div>
                <div className="col-span-2 space-y-2">
                  <label className="text-sm font-medium">Interesse</label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border rounded-md"
                    placeholder="Ex: Apartamento 2 quartos na Zona Sul"
                    value={newLeadData.interesse}
                    onChange={(e) => setNewLeadData(prev => ({ ...prev, interesse: e.target.value }))}
                  />
                </div>
              </div>
            </CardContent>
            <div className="flex justify-end gap-2 p-4 border-t">
              <Button variant="outline" onClick={() => setIsNewLeadOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateLead}>
                Criar Lead
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Tabs */}
      <Tabs defaultValue="kanban" className="flex-1 flex flex-col">
        <div className="px-6 border-b">
          <TabsList>
            <TabsTrigger value="dashboard" className="gap-2">
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="kanban" className="gap-2">
              <Target className="h-4 w-4" />
              Pipeline
            </TabsTrigger>
            <TabsTrigger value="leads" className="gap-2">
              <Users className="h-4 w-4" />
              Leads ({leads.length})
            </TabsTrigger>
            <TabsTrigger value="webhooks" className="gap-2">
              <Webhook className="h-4 w-4" />
              Webhooks
            </TabsTrigger>
          </TabsList>
        </div>

        {/* Tab: Dashboard */}
        <TabsContent value="dashboard" className="flex-1 p-6 space-y-6 overflow-auto">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title="Total de Leads"
              value={stats.totalLeads}
              description={`${stats.hotLeads} leads quentes`}
              icon={<Users className="h-4 w-4" />}
              trend={{ value: 12, isPositive: true }}
            />
            <StatCard
              title="Negócios Ativos"
              value={stats.totalDeals}
              description={`${stats.wonDeals} ganhos este mês`}
              icon={<Target className="h-4 w-4" />}
              trend={{ value: 8, isPositive: true }}
            />
            <StatCard
              title="Valor em Pipeline"
              value={formatCurrency(stats.totalValue)}
              description={`Média: ${formatCurrency(stats.avgDealValue)}/deal`}
              icon={<DollarSign className="h-4 w-4" />}
              trend={{ value: 15, isPositive: true }}
            />
            <StatCard
              title="Taxa de Conversão"
              value={`${stats.conversionRate.toFixed(1)}%`}
              description={`${stats.wonDeals} ganhos / ${stats.lostDeals} perdidos`}
              icon={<TrendingUp className="h-4 w-4" />}
              trend={{ value: 5, isPositive: true }}
            />
          </div>

          {/* Grid de Conteúdo */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Funil Visual */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Funil de Vendas
                </CardTitle>
                <CardDescription>
                  Distribuição de negócios por etapa do funil
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FunnelChart />
              </CardContent>
            </Card>

            {/* Deals Quentes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Flame className="h-5 w-5 text-orange-500" />
                  Negócios Quentes
                </CardTitle>
                <CardDescription>
                  Alta prioridade - Requer atenção
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[280px]">
                  {hotDeals.length > 0 ? (
                    hotDeals.map((deal) => (
                      <RecentDealItem
                        key={deal.id}
                        deal={deal}
                        onClick={() => selectDeal(deal)}
                      />
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <CheckCircle2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>Nenhum negócio urgente</p>
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Segunda Linha */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Leads Recentes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Leads Recentes
                </CardTitle>
                <CardDescription>
                  Últimos leads captados
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  {recentLeads.length > 0 ? (
                    recentLeads.map((lead) => (
                      <RecentLeadItem key={lead.id} lead={lead} />
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>Nenhum lead ainda</p>
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Atividade Recente */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Negócios em Movimento
                </CardTitle>
                <CardDescription>
                  Últimas atualizações no pipeline
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  {recentDeals.length > 0 ? (
                    recentDeals.map((deal) => (
                      <RecentDealItem
                        key={deal.id}
                        deal={deal}
                        onClick={() => selectDeal(deal)}
                      />
                    ))
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>Nenhum negócio ativo</p>
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab: Kanban */}
        <TabsContent value="kanban" className="flex-1 overflow-hidden">
          <KanbanBoard />
        </TabsContent>

        {/* Tab: Leads */}
        <TabsContent value="leads" className="flex-1 p-6 overflow-auto">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Todos os Leads</CardTitle>
                  <CardDescription>
                    {filteredLeads.length} de {leads.length} leads
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant={isFilterOpen ? 'secondary' : 'outline'} size="sm" onClick={() => setIsFilterOpen(!isFilterOpen)}>
                    <Filter className="h-4 w-4 mr-2" />
                    Filtrar
                  </Button>
                  <Button size="sm" onClick={() => setIsNewLeadOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Novo Lead
                  </Button>
                </div>
              </div>

              {/* Filtros */}
              {isFilterOpen && (
                <div className="mt-4 p-4 bg-muted/30 rounded-lg border space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Buscar</label>
                      <input
                        type="text"
                        placeholder="Nome, email ou telefone..."
                        className="w-full px-3 py-2 border rounded-md text-sm"
                        value={filterData.search}
                        onChange={(e) => setFilterData(prev => ({ ...prev, search: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Status</label>
                      <select
                        className="w-full px-3 py-2 border rounded-md text-sm"
                        value={filterData.status}
                        onChange={(e) => setFilterData(prev => ({ ...prev, status: e.target.value }))}
                      >
                        <option value="todos">Todos</option>
                        <option value="novo">Novo</option>
                        <option value="em_contato">Em Contato</option>
                        <option value="qualificado">Qualificado</option>
                        <option value="convertido">Convertido</option>
                        <option value="perdido">Perdido</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Temperatura</label>
                      <select
                        className="w-full px-3 py-2 border rounded-md text-sm"
                        value={filterData.temperature}
                        onChange={(e) => setFilterData(prev => ({ ...prev, temperature: e.target.value }))}
                      >
                        <option value="todos">Todos</option>
                        <option value="quente">Quente</option>
                        <option value="morno">Morno</option>
                        <option value="frio">Frio</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Origem</label>
                      <select
                        className="w-full px-3 py-2 border rounded-md text-sm"
                        value={filterData.source}
                        onChange={(e) => setFilterData(prev => ({ ...prev, source: e.target.value }))}
                      >
                        <option value="todos">Todos</option>
                        <option value="site">Site</option>
                        <option value="whatsapp">WhatsApp</option>
                        <option value="telefone">Telefone</option>
                        <option value="indicacao">Indicação</option>
                        <option value="portal">Portal</option>
                        <option value="google_ads">Google Ads</option>
                        <option value="facebook">Facebook</option>
                        <option value="instagram">Instagram</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button variant="ghost" size="sm" onClick={clearFilters}>
                      Limpar Filtros
                    </Button>
                  </div>
                </div>
              )}
            </CardHeader>
            <CardContent>
              <div className="rounded-lg border">
                <div className="grid grid-cols-6 gap-4 p-4 bg-muted/50 font-medium text-sm">
                  <span>Nome</span>
                  <span>Contato</span>
                  <span>Origem</span>
                  <span>Score</span>
                  <span>Status</span>
                  <span>Ações</span>
                </div>
                <ScrollArea className="h-[400px]">
                  {filteredLeads.length > 0 ? (
                    filteredLeads.map((lead) => (
                      <div
                        key={lead.id}
                        className="grid grid-cols-6 gap-4 p-4 border-t items-center hover:bg-muted/30"
                      >
                        <div>
                          <p className="font-medium">{lead.nome}</p>
                          <p className="text-xs text-muted-foreground">
                            {lead.cidade && `${lead.cidade}, ${lead.estado}`}
                          </p>
                        </div>
                        <div className="text-sm">
                          <p>{lead.email}</p>
                          <p className="text-muted-foreground">{lead.telefone}</p>
                        </div>
                        <Badge variant="outline">
                          {LEAD_SOURCES_LABELS[lead.source]}
                        </Badge>
                        <div className="flex items-center gap-2">
                          <Progress value={lead.score} className="h-2 w-16" />
                          <span className="text-sm">{lead.score}</span>
                        </div>
                        <Badge
                          variant={
                            lead.status === 'convertido'
                              ? 'default'
                              : lead.status === 'perdido'
                                ? 'destructive'
                                : 'secondary'
                          }
                        >
                          {lead.status}
                        </Badge>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="h-8 w-8" title="Registrar Ligação" onClick={() => handleLeadAction(lead, 'phone')}>
                            <Phone className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" title="Enviar E-mail" onClick={() => handleLeadAction(lead, 'email')}>
                            <Mail className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" title="Enviar WhatsApp" onClick={() => handleLeadAction(lead, 'whatsapp')}>
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                      <Users className="h-8 w-8 mb-2 opacity-50" />
                      <p>Nenhum lead encontrado</p>
                      <p className="text-sm">Tente ajustar os filtros</p>
                    </div>
                  )}
                </ScrollArea>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Webhooks */}
        <TabsContent value="webhooks" className="flex-1 p-6 overflow-auto">
          <WebhookConfigPanel />
        </TabsContent>
      </Tabs>

      {/* Modal de Ação de Contato */}
      {isActionDialogOpen && selectedLead && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {actionType === 'phone' && <Phone className="h-5 w-5" />}
                {actionType === 'email' && <Mail className="h-5 w-5" />}
                {actionType === 'whatsapp' && <MessageSquare className="h-5 w-5" />}
                {actionType === 'phone' && 'Registrar Ligação'}
                {actionType === 'email' && 'Enviar E-mail'}
                {actionType === 'whatsapp' && 'Enviar WhatsApp'}
              </CardTitle>
              <CardDescription>
                Contato: {selectedLead.nome}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-muted rounded-lg space-y-1">
                {selectedLead.telefone && (
                  <p className="text-sm flex items-center gap-2">
                    <Phone className="h-3 w-3" />
                    {selectedLead.telefone}
                  </p>
                )}
                {selectedLead.email && (
                  <p className="text-sm flex items-center gap-2">
                    <Mail className="h-3 w-3" />
                    {selectedLead.email}
                  </p>
                )}
              </div>

              {actionType === 'phone' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Notas da Ligação</label>
                  <textarea
                    className="w-full px-3 py-2 border rounded-md text-sm resize-none"
                    rows={3}
                    placeholder="Descreva o resultado da ligação..."
                    value={actionNote}
                    onChange={(e) => setActionNote(e.target.value)}
                  />
                </div>
              )}

              {actionType === 'email' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Assunto</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border rounded-md text-sm"
                      placeholder="Assunto do e-mail..."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Mensagem</label>
                    <textarea
                      className="w-full px-3 py-2 border rounded-md text-sm resize-none"
                      rows={4}
                      placeholder="Conteúdo do e-mail..."
                      value={actionNote}
                      onChange={(e) => setActionNote(e.target.value)}
                    />
                  </div>
                </div>
              )}

              {actionType === 'whatsapp' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Mensagem</label>
                  <textarea
                    className="w-full px-3 py-2 border rounded-md text-sm resize-none"
                    rows={4}
                    placeholder="Digite sua mensagem..."
                    value={actionNote}
                    onChange={(e) => setActionNote(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    A mensagem será aberta no WhatsApp Web
                  </p>
                </div>
              )}
            </CardContent>
            <div className="flex justify-end gap-2 p-4 border-t">
              <Button variant="outline" onClick={() => setIsActionDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleConfirmAction}>
                {actionType === 'phone' && 'Registrar Ligação'}
                {actionType === 'email' && 'Enviar E-mail'}
                {actionType === 'whatsapp' && 'Abrir WhatsApp'}
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Modal de Detalhes do Deal */}
      <DealDetailModal />
    </div>
  );
}
