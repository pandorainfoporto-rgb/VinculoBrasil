// =============================================================================
// Vínculo Engage Dashboard - Painel Principal de Automação de Marketing
// =============================================================================

import * as React from 'react';
import {
  LayoutDashboard,
  Mail,
  MessageCircle,
  Smartphone,
  Send,
  Users,
  FileText,
  Target,
  Settings,
  Server,
  Activity,
  Play,
  Pause,
  Trash2,
  Edit,
  Eye,
  Plus,
  MoreVertical,
  Calendar,
  Clock,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Zap,
  Repeat,
  ChevronRight,
  BarChart3,
  PieChart,
  ListFilter,
  Download,
} from 'lucide-react';
import { format, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import { useEngageStore } from './store';
import { CampaignWizard } from './campaign-wizard';
import { TemplateEditor } from './template-editor';
import { AudienceBuilder } from './audience-builder';
import { SmtpConfigList } from './smtp-config';
import {
  type MarketingCampaign,
  type MessageTemplate,
  type AudienceSegment,
  CAMPAIGN_STATUS_LABELS,
  CAMPAIGN_STATUS_COLORS,
  CAMPAIGN_TYPE_LABELS,
  CHANNEL_TYPE_LABELS,
  TRIGGER_TYPE_LABELS,
} from './types';

// -----------------------------------------------------------------------------
// Stat Card Component
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
// Queue Status Component
// -----------------------------------------------------------------------------

function QueueStatus() {
  const { queueStats } = useEngageStore();

  if (!queueStats) return null;

  const total = queueStats.waiting + queueStats.active + queueStats.completed + queueStats.failed;

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Status da Fila
          </CardTitle>
          <Badge variant={queueStats.paused ? 'secondary' : 'default'}>
            {queueStats.paused ? 'Pausada' : 'Ativa'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-5 gap-2 text-center text-xs">
          <div className="p-2 bg-muted rounded-lg">
            <p className="font-bold text-lg">{queueStats.waiting}</p>
            <p className="text-muted-foreground">Aguardando</p>
          </div>
          <div className="p-2 bg-yellow-100 rounded-lg">
            <p className="font-bold text-lg text-yellow-700">{queueStats.active}</p>
            <p className="text-yellow-600">Processando</p>
          </div>
          <div className="p-2 bg-green-100 rounded-lg">
            <p className="font-bold text-lg text-green-700">{queueStats.completed}</p>
            <p className="text-green-600">Concluídos</p>
          </div>
          <div className="p-2 bg-red-100 rounded-lg">
            <p className="font-bold text-lg text-red-700">{queueStats.failed}</p>
            <p className="text-red-600">Falhas</p>
          </div>
          <div className="p-2 bg-blue-100 rounded-lg">
            <p className="font-bold text-lg text-blue-700">{queueStats.delayed}</p>
            <p className="text-blue-600">Atrasados</p>
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Progresso Geral</span>
            <span>{total > 0 ? Math.round((queueStats.completed / total) * 100) : 0}%</span>
          </div>
          <Progress
            value={total > 0 ? (queueStats.completed / total) * 100 : 0}
            className="h-2"
          />
        </div>
      </CardContent>
    </Card>
  );
}

// -----------------------------------------------------------------------------
// Mini Chart Component (Simulated)
// -----------------------------------------------------------------------------

interface MiniChartProps {
  data: { date: string; sent: number; delivered: number; opened: number }[];
}

function MiniChart({ data }: MiniChartProps) {
  const maxValue = Math.max(...data.map((d) => d.sent));

  return (
    <div className="flex items-end gap-1 h-20">
      {data.map((item, index) => (
        <TooltipProvider key={index}>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex-1 flex flex-col gap-0.5">
                <div
                  className="w-full bg-primary/20 rounded-t"
                  style={{ height: `${(item.sent / maxValue) * 100}%`, minHeight: 4 }}
                />
                <div
                  className="w-full bg-primary/40 rounded-t"
                  style={{ height: `${(item.delivered / maxValue) * 100}%`, minHeight: 4 }}
                />
                <div
                  className="w-full bg-primary rounded-t"
                  style={{ height: `${(item.opened / maxValue) * 100}%`, minHeight: 4 }}
                />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="font-medium">{format(new Date(item.date), 'dd/MM', { locale: ptBR })}</p>
              <p className="text-xs">Enviados: {item.sent}</p>
              <p className="text-xs">Entregues: {item.delivered}</p>
              <p className="text-xs">Abertos: {item.opened}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ))}
    </div>
  );
}

// -----------------------------------------------------------------------------
// Campaign Table Component
// -----------------------------------------------------------------------------

interface CampaignTableProps {
  campaigns: MarketingCampaign[];
  onEdit: (campaign: MarketingCampaign) => void;
  onPause: (campaign: MarketingCampaign) => void;
  onResume: (campaign: MarketingCampaign) => void;
  onDelete: (campaign: MarketingCampaign) => void;
  onViewDetails: (campaign: MarketingCampaign) => void;
}

function CampaignTable({ campaigns, onEdit, onPause, onResume, onDelete, onViewDetails }: CampaignTableProps) {
  const channelIcons: Record<string, React.ReactNode> = {
    email: <Mail className="h-4 w-4" />,
    whatsapp: <MessageCircle className="h-4 w-4" />,
    sms: <Smartphone className="h-4 w-4" />,
  };

  const typeIcons: Record<string, React.ReactNode> = {
    one_time: <Send className="h-4 w-4" />,
    automated: <Zap className="h-4 w-4" />,
    sequence: <Repeat className="h-4 w-4" />,
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Campanha</TableHead>
          <TableHead>Canal</TableHead>
          <TableHead>Tipo</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Enviados</TableHead>
          <TableHead className="text-right">Taxa Abertura</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {campaigns.length === 0 ? (
          <TableRow>
            <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
              Nenhuma campanha encontrada
            </TableCell>
          </TableRow>
        ) : (
          campaigns.map((campaign) => {
            const openRate = campaign.sentCount > 0
              ? Math.round((campaign.openedCount / campaign.sentCount) * 100)
              : 0;

            return (
              <TableRow key={campaign.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{campaign.name}</p>
                    {campaign.scheduledAt && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(campaign.scheduledAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {channelIcons[campaign.channel]}
                    <span className="text-sm">{CHANNEL_TYPE_LABELS[campaign.channel]}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {typeIcons[campaign.type]}
                    <span className="text-sm">{CAMPAIGN_TYPE_LABELS[campaign.type]}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={cn('text-xs', CAMPAIGN_STATUS_COLORS[campaign.status])}>
                    {CAMPAIGN_STATUS_LABELS[campaign.status]}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <span className="font-medium">{campaign.sentCount}</span>
                  <span className="text-muted-foreground">/{campaign.totalRecipients}</span>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    <span className={cn(
                      'font-medium',
                      openRate >= 30 ? 'text-green-600' : openRate >= 15 ? 'text-yellow-600' : 'text-muted-foreground'
                    )}>
                      {openRate}%
                    </span>
                    {campaign.sentCount > 0 && (
                      <Progress value={openRate} className="w-16 h-1.5" />
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(campaign)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onViewDetails(campaign)}>
                        <Eye className="h-4 w-4 mr-2" />
                        Ver Detalhes
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      {campaign.status === 'sending' || campaign.status === 'scheduled' ? (
                        <DropdownMenuItem onClick={() => onPause(campaign)}>
                          <Pause className="h-4 w-4 mr-2" />
                          Pausar
                        </DropdownMenuItem>
                      ) : campaign.status === 'paused' ? (
                        <DropdownMenuItem onClick={() => onResume(campaign)}>
                          <Play className="h-4 w-4 mr-2" />
                          Retomar
                        </DropdownMenuItem>
                      ) : null}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => onDelete(campaign)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })
        )}
      </TableBody>
    </Table>
  );
}

// -----------------------------------------------------------------------------
// Templates List Component
// -----------------------------------------------------------------------------

interface TemplatesListProps {
  templates: MessageTemplate[];
  onEdit: (template: MessageTemplate) => void;
  onCreate: () => void;
}

function TemplatesList({ templates, onEdit, onCreate }: TemplatesListProps) {
  const channelIcons: Record<string, React.ReactNode> = {
    email: <Mail className="h-4 w-4" />,
    whatsapp: <MessageCircle className="h-4 w-4" />,
    sms: <Smartphone className="h-4 w-4" />,
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Templates de Mensagem</h3>
          <p className="text-sm text-muted-foreground">
            Modelos prontos para suas campanhas
          </p>
        </div>
        <Button onClick={onCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Template
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {templates.map((template) => (
          <Card
            key={template.id}
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => onEdit(template)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    {channelIcons[template.channel]}
                  </div>
                  <div>
                    <CardTitle className="text-sm">{template.name}</CardTitle>
                    <CardDescription className="text-xs">
                      {CHANNEL_TYPE_LABELS[template.channel]}
                    </CardDescription>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">
                  {template.category}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {template.textContent.substring(0, 100)}...
              </p>
              <div className="flex flex-wrap gap-1 mt-3">
                {template.variables.slice(0, 3).map((v) => (
                  <Badge key={v} variant="secondary" className="text-[10px]">
                    {`{{${v}}}`}
                  </Badge>
                ))}
                {template.variables.length > 3 && (
                  <Badge variant="secondary" className="text-[10px]">
                    +{template.variables.length - 3}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Segments List Component
// -----------------------------------------------------------------------------

interface SegmentsListProps {
  segments: AudienceSegment[];
  onEdit: (segment: AudienceSegment) => void;
  onCreate: () => void;
}

function SegmentsList({ segments, onEdit, onCreate }: SegmentsListProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Segmentos de Audiência</h3>
          <p className="text-sm text-muted-foreground">
            Públicos-alvo para suas campanhas
          </p>
        </div>
        <Button onClick={onCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Segmento
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {segments.map((segment) => (
          <Card
            key={segment.id}
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => onEdit(segment)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-sm">{segment.name}</CardTitle>
                    {segment.description && (
                      <CardDescription className="text-xs">
                        {segment.description}
                      </CardDescription>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">{segment.estimatedCount}</p>
                  <p className="text-xs text-muted-foreground">contatos</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1">
                {segment.rules.map((rule, idx) => (
                  <Badge key={rule.id} variant="outline" className="text-xs">
                    {idx > 0 && <span className="text-primary mr-1">{rule.logicalOperator}</span>}
                    {rule.field} {rule.operator} {String(rule.value)}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Main Engage Dashboard Component
// -----------------------------------------------------------------------------

export function EngageDashboard() {
  const [activeTab, setActiveTab] = React.useState('dashboard');
  const [campaignWizardOpen, setCampaignWizardOpen] = React.useState(false);
  const [templateEditorOpen, setTemplateEditorOpen] = React.useState(false);
  const [audienceBuilderOpen, setAudienceBuilderOpen] = React.useState(false);
  const [campaignDetailsOpen, setCampaignDetailsOpen] = React.useState(false);
  const [viewingCampaign, setViewingCampaign] = React.useState<MarketingCampaign | undefined>();
  const [editingCampaign, setEditingCampaign] = React.useState<MarketingCampaign | undefined>();
  const [editingTemplate, setEditingTemplate] = React.useState<MessageTemplate | undefined>();
  const [editingSegment, setEditingSegment] = React.useState<AudienceSegment | undefined>();
  const [searchQuery, setSearchQuery] = React.useState('');

  const {
    campaigns,
    templates,
    segments,
    dashboardStats,
    updateCampaignStatus,
    deleteCampaign,
    setCampaignFilter,
    getFilteredCampaigns,
  } = useEngageStore();

  // Filtrar campanhas por busca
  React.useEffect(() => {
    setCampaignFilter({ search: searchQuery });
  }, [searchQuery, setCampaignFilter]);

  const filteredCampaigns = getFilteredCampaigns();

  // Handlers
  const handleEditCampaign = (campaign: MarketingCampaign) => {
    setEditingCampaign(campaign);
    setCampaignWizardOpen(true);
  };

  const handleViewDetails = (campaign: MarketingCampaign) => {
    setViewingCampaign(campaign);
    setCampaignDetailsOpen(true);
  };

  const handlePauseCampaign = (campaign: MarketingCampaign) => {
    updateCampaignStatus(campaign.id, 'paused');
  };

  const handleResumeCampaign = (campaign: MarketingCampaign) => {
    updateCampaignStatus(campaign.id, 'sending');
  };

  const handleDeleteCampaign = (campaign: MarketingCampaign) => {
    if (confirm(`Deseja realmente excluir a campanha "${campaign.name}"?`)) {
      deleteCampaign(campaign.id);
    }
  };

  const handleEditTemplate = (template: MessageTemplate) => {
    setEditingTemplate(template);
    setTemplateEditorOpen(true);
  };

  const handleEditSegment = (segment: AudienceSegment) => {
    setEditingSegment(segment);
    setAudienceBuilderOpen(true);
  };

  const handleCloseWizard = () => {
    setCampaignWizardOpen(false);
    setEditingCampaign(undefined);
  };

  const handleCloseTemplateEditor = () => {
    setTemplateEditorOpen(false);
    setEditingTemplate(undefined);
  };

  const handleCloseAudienceBuilder = () => {
    setAudienceBuilderOpen(false);
    setEditingSegment(undefined);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Zap className="h-6 w-6 text-primary" />
            Vínculo Engage
          </h2>
          <p className="text-muted-foreground">
            Automação de Marketing e Comunicação
          </p>
        </div>
        <Button onClick={() => setCampaignWizardOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Campanha
        </Button>
      </div>

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="dashboard" className="gap-2">
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="campaigns" className="gap-2">
            <Send className="h-4 w-4" />
            Campanhas
            <Badge variant="secondary" className="ml-1">
              {campaigns.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="templates" className="gap-2">
            <FileText className="h-4 w-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="segments" className="gap-2">
            <Target className="h-4 w-4" />
            Segmentos
          </TabsTrigger>
          <TabsTrigger value="smtp" className="gap-2">
            <Server className="h-4 w-4" />
            SMTP
          </TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          {/* Stats Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Enviados"
              value={dashboardStats?.totalSent.toLocaleString() || '0'}
              description="Últimos 30 dias"
              icon={<Send className="h-4 w-4" />}
              trend={{ value: 12.5, isPositive: true }}
            />
            <StatCard
              title="Taxa de Entrega"
              value={`${dashboardStats?.deliveryRate || 0}%`}
              description="E-mails entregues"
              icon={<CheckCircle2 className="h-4 w-4" />}
              trend={{ value: 2.3, isPositive: true }}
            />
            <StatCard
              title="Taxa de Abertura"
              value={`${dashboardStats?.openRate || 0}%`}
              description="E-mails abertos"
              icon={<Eye className="h-4 w-4" />}
              trend={{ value: 5.1, isPositive: true }}
            />
            <StatCard
              title="Taxa de Cliques"
              value={`${dashboardStats?.clickRate || 0}%`}
              description="Links clicados"
              icon={<TrendingUp className="h-4 w-4" />}
              trend={{ value: 1.8, isPositive: false }}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Chart */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Desempenho dos Últimos 7 Dias
                </CardTitle>
              </CardHeader>
              <CardContent>
                {dashboardStats?.dailyStats && (
                  <MiniChart data={dashboardStats.dailyStats} />
                )}
                <div className="flex items-center justify-center gap-6 mt-4 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-primary/20" />
                    <span>Enviados</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-primary/40" />
                    <span>Entregues</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-primary" />
                    <span>Abertos</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Queue Status */}
            <QueueStatus />
          </div>

          {/* Channel Stats */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  E-mail Marketing
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold">{dashboardStats?.emailStats.sent || 0}</p>
                    <p className="text-xs text-muted-foreground">Enviados</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">
                      {dashboardStats?.emailStats.delivered || 0}
                    </p>
                    <p className="text-xs text-muted-foreground">Entregues</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-blue-600">
                      {dashboardStats?.emailStats.opened || 0}
                    </p>
                    <p className="text-xs text-muted-foreground">Abertos</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-purple-600">
                      {dashboardStats?.emailStats.clicked || 0}
                    </p>
                    <p className="text-xs text-muted-foreground">Cliques</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp Broadcast
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold">{dashboardStats?.whatsappStats.sent || 0}</p>
                    <p className="text-xs text-muted-foreground">Enviados</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">
                      {dashboardStats?.whatsappStats.delivered || 0}
                    </p>
                    <p className="text-xs text-muted-foreground">Entregues</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-blue-600">
                      {dashboardStats?.whatsappStats.read || 0}
                    </p>
                    <p className="text-xs text-muted-foreground">Lidos</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-purple-600">
                      {dashboardStats?.whatsappStats.replied || 0}
                    </p>
                    <p className="text-xs text-muted-foreground">Respostas</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Campaigns */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Campanhas Recentes</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => setActiveTab('campaigns')}>
                  Ver Todas
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <CampaignTable
                campaigns={campaigns.slice(0, 5)}
                onEdit={handleEditCampaign}
                onPause={handlePauseCampaign}
                onResume={handleResumeCampaign}
                onDelete={handleDeleteCampaign}
                onViewDetails={handleViewDetails}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Campaigns Tab */}
        <TabsContent value="campaigns" className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <Input
                placeholder="Buscar campanhas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="draft">Rascunho</SelectItem>
                <SelectItem value="scheduled">Agendada</SelectItem>
                <SelectItem value="sending">Enviando</SelectItem>
                <SelectItem value="completed">Concluída</SelectItem>
                <SelectItem value="paused">Pausada</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="all">
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Canal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="email">E-mail</SelectItem>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                <SelectItem value="sms">SMS</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardContent className="p-0">
              <CampaignTable
                campaigns={filteredCampaigns}
                onEdit={handleEditCampaign}
                onPause={handlePauseCampaign}
                onResume={handleResumeCampaign}
                onDelete={handleDeleteCampaign}
                onViewDetails={handleViewDetails}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates">
          <TemplatesList
            templates={templates}
            onEdit={handleEditTemplate}
            onCreate={() => setTemplateEditorOpen(true)}
          />
        </TabsContent>

        {/* Segments Tab */}
        <TabsContent value="segments">
          <SegmentsList
            segments={segments}
            onEdit={handleEditSegment}
            onCreate={() => setAudienceBuilderOpen(true)}
          />
        </TabsContent>

        {/* SMTP Tab */}
        <TabsContent value="smtp">
          <SmtpConfigList />
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <CampaignWizard
        open={campaignWizardOpen}
        onClose={handleCloseWizard}
        editCampaign={editingCampaign}
      />

      <TemplateEditor
        open={templateEditorOpen}
        onClose={handleCloseTemplateEditor}
        editTemplate={editingTemplate}
      />

      <AudienceBuilder
        open={audienceBuilderOpen}
        onClose={handleCloseAudienceBuilder}
        editSegment={editingSegment}
      />

      {/* Campaign Details Modal */}
      {campaignDetailsOpen && viewingCampaign && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <Card className="w-full max-w-3xl max-h-[90vh] overflow-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl flex items-center gap-2">
                    {viewingCampaign.channel === 'email' && <Mail className="h-5 w-5" />}
                    {viewingCampaign.channel === 'whatsapp' && <MessageCircle className="h-5 w-5" />}
                    {viewingCampaign.channel === 'sms' && <Smartphone className="h-5 w-5" />}
                    {viewingCampaign.name}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {CAMPAIGN_TYPE_LABELS[viewingCampaign.type]} via {CHANNEL_TYPE_LABELS[viewingCampaign.channel]}
                  </CardDescription>
                </div>
                <Badge className={cn('text-xs', CAMPAIGN_STATUS_COLORS[viewingCampaign.status])}>
                  {CAMPAIGN_STATUS_LABELS[viewingCampaign.status]}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Métricas */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-muted rounded-lg text-center">
                  <p className="text-2xl font-bold">{viewingCampaign.totalRecipients}</p>
                  <p className="text-xs text-muted-foreground">Total Destinatários</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg text-center">
                  <p className="text-2xl font-bold text-blue-700">{viewingCampaign.sentCount}</p>
                  <p className="text-xs text-blue-600">Enviados</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg text-center">
                  <p className="text-2xl font-bold text-green-700">{viewingCampaign.openedCount}</p>
                  <p className="text-xs text-green-600">Abertos</p>
                </div>
                <div className="p-4 bg-purple-50 rounded-lg text-center">
                  <p className="text-2xl font-bold text-purple-700">{viewingCampaign.clickedCount}</p>
                  <p className="text-xs text-purple-600">Cliques</p>
                </div>
              </div>

              {/* Taxas */}
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Taxa de Abertura</span>
                    <span className="font-medium">
                      {viewingCampaign.sentCount > 0
                        ? Math.round((viewingCampaign.openedCount / viewingCampaign.sentCount) * 100)
                        : 0}%
                    </span>
                  </div>
                  <Progress
                    value={viewingCampaign.sentCount > 0
                      ? (viewingCampaign.openedCount / viewingCampaign.sentCount) * 100
                      : 0}
                    className="h-2"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Taxa de Cliques</span>
                    <span className="font-medium">
                      {viewingCampaign.openedCount > 0
                        ? Math.round((viewingCampaign.clickedCount / viewingCampaign.openedCount) * 100)
                        : 0}%
                    </span>
                  </div>
                  <Progress
                    value={viewingCampaign.openedCount > 0
                      ? (viewingCampaign.clickedCount / viewingCampaign.openedCount) * 100
                      : 0}
                    className="h-2"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progresso Envio</span>
                    <span className="font-medium">
                      {viewingCampaign.totalRecipients > 0
                        ? Math.round((viewingCampaign.sentCount / viewingCampaign.totalRecipients) * 100)
                        : 0}%
                    </span>
                  </div>
                  <Progress
                    value={viewingCampaign.totalRecipients > 0
                      ? (viewingCampaign.sentCount / viewingCampaign.totalRecipients) * 100
                      : 0}
                    className="h-2"
                  />
                </div>
              </div>

              <Separator />

              {/* Informações */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Datas
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Criada em:</span>
                      <span>{format(new Date(viewingCampaign.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</span>
                    </div>
                    {viewingCampaign.scheduledAt && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Agendada para:</span>
                        <span>{format(new Date(viewingCampaign.scheduledAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</span>
                      </div>
                    )}
                    {viewingCampaign.startedAt && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Iniciada em:</span>
                        <span>{format(new Date(viewingCampaign.startedAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Configuração
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tipo:</span>
                      <span>{CAMPAIGN_TYPE_LABELS[viewingCampaign.type]}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Canal:</span>
                      <span>{CHANNEL_TYPE_LABELS[viewingCampaign.channel]}</span>
                    </div>
                    {viewingCampaign.triggerType && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Gatilho:</span>
                        <span>{TRIGGER_TYPE_LABELS[viewingCampaign.triggerType]}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Erros */}
              {viewingCampaign.bouncedCount > 0 || viewingCampaign.failedCount > 0 ? (
                <>
                  <Separator />
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <h4 className="font-semibold text-red-700 mb-2">Falhas de Envio</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-red-600">Bounces: </span>
                        <span className="font-medium">{viewingCampaign.bouncedCount}</span>
                      </div>
                      <div>
                        <span className="text-red-600">Erros: </span>
                        <span className="font-medium">{viewingCampaign.failedCount}</span>
                      </div>
                    </div>
                  </div>
                </>
              ) : null}
            </CardContent>
            <div className="flex justify-end gap-2 p-4 border-t">
              <Button variant="outline" onClick={() => setCampaignDetailsOpen(false)}>
                Fechar
              </Button>
              <Button onClick={() => {
                setCampaignDetailsOpen(false);
                handleEditCampaign(viewingCampaign);
              }}>
                <Edit className="h-4 w-4 mr-2" />
                Editar Campanha
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

export default EngageDashboard;
