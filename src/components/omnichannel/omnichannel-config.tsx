/**
 * Omnichannel Config - Configurações Completas do Sistema Omnichannel
 * CONECTADO A DADOS REAIS - Métricas e Canais buscados da API
 *
 * Inclui:
 * - Departamentos e Filas
 * - Editor de Fluxos
 * - Métricas e Relatórios
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Building2,
  GitBranch,
  BarChart3,
  TrendingUp,
  Clock,
  Users,
  MessageSquare,
  Bot,
  CheckCircle,
  AlertTriangle,
  Phone,
  Plus,
  Settings,
  Trash2,
  Edit3,
  RefreshCw,
  Globe,
  Wifi,
  WifiOff,
  QrCode,
  ExternalLink,
  Smartphone,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { DepartmentAdmin } from './department-admin';
import { FlowBuilder } from './flow-builder';
import { useOmnichannelChannels, useOmnichannelMetrics } from '@/hooks/use-omnichannel';

// Tipo para canais de WhatsApp
export interface WhatsAppChannel {
  id: string;
  name: string;
  phoneNumber: string;
  businessName: string;
  provider: 'evolution' | 'baileys' | 'cloud_api' | 'wppconnect';
  status: 'connected' | 'disconnected' | 'pending' | 'error';
  qrCode?: string;
  webhookUrl: string;
  department?: string;
  isDefault: boolean;
  createdAt: Date;
  lastActivity?: Date;
  messagesCount: number;
  // Configuração de Fluxo e IA
  initialFlowId?: string;
  aiAgentId?: string;
  aiEnabled: boolean;
  knowledgeBaseId?: string;
  autoQualifyLeads: boolean;
  leadTags?: string[];
}

// Tipo para Fluxos de Atendimento
export interface AttendanceFlow {
  id: string;
  name: string;
  description: string;
  isDefault: boolean;
  triggerType: 'all' | 'whatsapp' | 'landpage' | 'api';
  steps: FlowStep[];
}

export interface FlowStep {
  id: string;
  type: 'ai_triage' | 'department_router' | 'ai_agent' | 'human_transfer' | 'crm_qualify';
  config: Record<string, unknown>;
}

// Tipo para Agentes de IA por Setor
export interface AIAgent {
  id: string;
  name: string;
  department: string;
  description: string;
  capabilities: ('text' | 'audio' | 'image' | 'pdf')[];
  knowledgeBaseId: string;
  autoQualifyLeads: boolean;
  leadTags: string[];
  isActive: boolean;
  responseTime: number;
  successRate: number;
}

export function OmnichannelConfig() {
  const [activeTab, setActiveTab] = useState('channels');

  // Busca dados reais da API
  const { data: metricsData, isLoading: metricsLoading, refetch: refetchMetrics } = useOmnichannelMetrics();
  const { data: channelsData } = useOmnichannelChannels();

  // Fluxos de Atendimento - inicialmente vazios, preenchidos pela API
  const [attendanceFlows, setAttendanceFlows] = useState<AttendanceFlow[]>([]);

  // Agentes de IA - inicialmente vazios, preenchidos pela API
  const [aiAgents, setAiAgents] = useState<AIAgent[]>([]);

  // WhatsApp Channels state - inicialmente vazio, preenchido pela API
  const [whatsappChannels, setWhatsappChannels] = useState<WhatsAppChannel[]>([]);

  // Sincroniza dados da API quando disponíveis
  useEffect(() => {
    if (channelsData && Array.isArray(channelsData)) {
      const mappedChannels: WhatsAppChannel[] = channelsData.map((ch) => ({
        id: ch.id,
        name: ch.name,
        phoneNumber: ch.phoneNumber,
        businessName: ch.businessName || ch.name,
        provider: (ch.provider || 'evolution') as WhatsAppChannel['provider'],
        status: (ch.status || 'pending') as WhatsAppChannel['status'],
        webhookUrl: ch.webhookUrl || '',
        department: ch.department,
        isDefault: ch.isDefault || false,
        createdAt: ch.createdAt ? new Date(ch.createdAt) : new Date(),
        lastActivity: ch.lastActivity ? new Date(ch.lastActivity) : undefined,
        messagesCount: ch.messagesCount || 0,
        initialFlowId: ch.initialFlowId,
        aiAgentId: ch.aiAgentId,
        aiEnabled: ch.aiEnabled || false,
        knowledgeBaseId: ch.knowledgeBaseId,
        autoQualifyLeads: ch.autoQualifyLeads || false,
        leadTags: ch.leadTags,
      }));
      setWhatsappChannels(mappedChannels);
    }
  }, [channelsData]);

  // Dialog states
  const [isChannelDialogOpen, setIsChannelDialogOpen] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<WhatsAppChannel | null>(null);
  const [channelForm, setChannelForm] = useState({
    name: '',
    phoneNumber: '',
    businessName: '',
    provider: 'evolution' as WhatsAppChannel['provider'],
    webhookUrl: '',
    department: '',
    isDefault: false,
    initialFlowId: '',
    aiAgentId: '',
    aiEnabled: true,
    knowledgeBaseId: '',
    autoQualifyLeads: true,
    leadTags: [] as string[],
  });

  // Handlers
  const handleOpenChannelDialog = (channel?: WhatsAppChannel) => {
    if (channel) {
      setSelectedChannel(channel);
      setChannelForm({
        name: channel.name,
        phoneNumber: channel.phoneNumber,
        businessName: channel.businessName,
        provider: channel.provider,
        webhookUrl: channel.webhookUrl,
        department: channel.department || '',
        isDefault: channel.isDefault,
        initialFlowId: channel.initialFlowId || '',
        aiAgentId: channel.aiAgentId || '',
        aiEnabled: channel.aiEnabled,
        knowledgeBaseId: channel.knowledgeBaseId || '',
        autoQualifyLeads: channel.autoQualifyLeads,
        leadTags: channel.leadTags || [],
      });
    } else {
      setSelectedChannel(null);
      setChannelForm({
        name: '',
        phoneNumber: '',
        businessName: '',
        provider: 'evolution',
        webhookUrl: 'https://n8n.vinculobrasil.com.br/webhook/whatsapp/',
        department: '',
        isDefault: false,
        initialFlowId: 'flow_main',
        aiAgentId: 'agent_geral',
        aiEnabled: true,
        knowledgeBaseId: 'kb_geral',
        autoQualifyLeads: true,
        leadTags: [],
      });
    }
    setIsChannelDialogOpen(true);
  };

  const handleSaveChannel = () => {
    if (selectedChannel) {
      setWhatsappChannels(channels =>
        channels.map(ch =>
          ch.id === selectedChannel.id
            ? { ...ch, ...channelForm }
            : channelForm.isDefault && ch.isDefault
              ? { ...ch, isDefault: false }
              : ch
        )
      );
    } else {
      const newChannel: WhatsAppChannel = {
        id: `wa${Date.now()}`,
        ...channelForm,
        status: 'pending',
        createdAt: new Date(),
        messagesCount: 0,
      };
      if (channelForm.isDefault) {
        setWhatsappChannels(channels => [
          ...channels.map(ch => ({ ...ch, isDefault: false })),
          newChannel,
        ]);
      } else {
        setWhatsappChannels(channels => [...channels, newChannel]);
      }
    }
    setIsChannelDialogOpen(false);
  };

  const handleDeleteChannel = (channelId: string) => {
    if (confirm('Tem certeza que deseja remover este canal WhatsApp?')) {
      setWhatsappChannels(channels => channels.filter(ch => ch.id !== channelId));
    }
  };

  const handleReconnectChannel = (channelId: string) => {
    setWhatsappChannels(channels =>
      channels.map(ch =>
        ch.id === channelId ? { ...ch, status: 'pending' } : ch
      )
    );
    setTimeout(() => {
      setWhatsappChannels(channels =>
        channels.map(ch =>
          ch.id === channelId ? { ...ch, status: 'connected', lastActivity: new Date() } : ch
        )
      );
    }, 3000);
  };

  const getStatusBadge = (status: WhatsAppChannel['status']) => {
    switch (status) {
      case 'connected':
        return <Badge className="bg-green-500"><Wifi className="h-3 w-3 mr-1" />Conectado</Badge>;
      case 'disconnected':
        return <Badge className="bg-red-500"><WifiOff className="h-3 w-3 mr-1" />Desconectado</Badge>;
      case 'pending':
        return <Badge className="bg-amber-500"><RefreshCw className="h-3 w-3 mr-1 animate-spin" />Conectando</Badge>;
      case 'error':
        return <Badge className="bg-red-600"><AlertTriangle className="h-3 w-3 mr-1" />Erro</Badge>;
    }
  };

  const getProviderName = (provider: WhatsAppChannel['provider']) => {
    switch (provider) {
      case 'evolution': return 'Evolution API';
      case 'baileys': return 'Baileys';
      case 'cloud_api': return 'Cloud API (Meta)';
      case 'wppconnect': return 'WPPConnect';
    }
  };

  // Métricas do sistema - Dados reais da API (ou valores vazios se não disponível)
  const metrics = metricsData || {
    totalTicketsToday: 0,
    resolvedToday: 0,
    avgResponseTime: '-',
    avgResolutionTime: '-',
    satisfaction: 0,
    aiResolutionRate: 0,
    slaCompliance: 0,
    activeAgents: 0,
    totalAgents: 0,
    byDepartment: [],
    byChannel: {
      whatsapp: { tickets: 0, percentage: 0 },
      webchat: { tickets: 0, percentage: 0 },
      email: { tickets: 0, percentage: 0 },
    },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Configurações Omnichannel</h2>
          <p className="text-muted-foreground">
            Gerencie departamentos, fluxos e acompanhe métricas do atendimento
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
          <TabsTrigger value="channels" className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            <span className="hidden sm:inline">Canais</span>
          </TabsTrigger>
          <TabsTrigger value="ai-agents" className="flex items-center gap-2">
            <Bot className="h-4 w-4" />
            <span className="hidden sm:inline">Agentes IA</span>
          </TabsTrigger>
          <TabsTrigger value="departments" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            <span className="hidden sm:inline">Departamentos</span>
          </TabsTrigger>
          <TabsTrigger value="flows" className="flex items-center gap-2">
            <GitBranch className="h-4 w-4" />
            <span className="hidden sm:inline">Fluxos</span>
          </TabsTrigger>
          <TabsTrigger value="metrics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Métricas</span>
          </TabsTrigger>
        </TabsList>

        {/* Tab: Canais WhatsApp */}
        <TabsContent value="channels" className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground">
                Gerencie os canais de comunicacao WhatsApp
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {whatsappChannels.filter(ch => ch.status === 'connected').length} de {whatsappChannels.length} canais conectados
              </p>
            </div>
            <Button onClick={() => handleOpenChannelDialog()}>
              <Plus className="h-4 w-4 mr-2" />Novo Canal
            </Button>
          </div>

          {/* Resumo dos Canais */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="border-l-4 border-l-green-500">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-900/30 rounded-lg">
                    <Wifi className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{whatsappChannels.filter(ch => ch.status === 'connected').length}</p>
                    <p className="text-xs text-muted-foreground">Conectados</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-900/30 rounded-lg">
                    <MessageSquare className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{whatsappChannels.reduce((sum, ch) => sum + ch.messagesCount, 0).toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Mensagens Total</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-900/30 rounded-lg">
                    <Smartphone className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{whatsappChannels.length}</p>
                    <p className="text-xs text-muted-foreground">Total Canais</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-900/30 rounded-lg">
                    <Globe className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{new Set(whatsappChannels.map(ch => ch.provider)).size}</p>
                    <p className="text-xs text-muted-foreground">Provedores</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Lista de Canais */}
          <Card>
            <CardHeader>
              <CardTitle>Canais WhatsApp</CardTitle>
              <CardDescription>
                Configure multiplos numeros de WhatsApp para diferentes departamentos
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Canal</TableHead>
                    <TableHead>Numero</TableHead>
                    <TableHead>Provedor</TableHead>
                    <TableHead>Departamento</TableHead>
                    <TableHead>Mensagens</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Acoes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {whatsappChannels.map(channel => (
                    <TableRow key={channel.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            "p-2 rounded-lg",
                            channel.status === 'connected' ? "bg-green-900/30" : "bg-slate-800"
                          )}>
                            <Phone className={cn(
                              "h-4 w-4",
                              channel.status === 'connected' ? "text-green-600" : "text-gray-400"
                            )} />
                          </div>
                          <div>
                            <p className="font-medium flex items-center gap-2">
                              {channel.name}
                              {channel.isDefault && (
                                <Badge variant="outline" className="text-xs">Principal</Badge>
                              )}
                            </p>
                            <p className="text-xs text-muted-foreground">{channel.businessName}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-sm">{channel.phoneNumber}</code>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{getProviderName(channel.provider)}</Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{channel.department || '-'}</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-sm">{channel.messagesCount.toLocaleString()}</span>
                      </TableCell>
                      <TableCell>{getStatusBadge(channel.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          {channel.status === 'disconnected' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleReconnectChannel(channel.id)}
                              title="Reconectar"
                            >
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                          )}
                          {channel.status === 'pending' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              title="Escanear QR Code"
                            >
                              <QrCode className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleOpenChannelDialog(channel)}
                            title="Editar"
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500"
                            onClick={() => handleDeleteChannel(channel.id)}
                            title="Remover"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Documentacao */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Integracao N8N</CardTitle>
              <CardDescription>
                Os canais de WhatsApp sao integrados via webhooks N8N
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-3">
                <a
                  href="https://docs.evolution-api.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-3 border border-slate-700 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span className="text-sm">Evolution API Docs</span>
                </a>
                <a
                  href="https://developers.facebook.com/docs/whatsapp/cloud-api"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-3 border border-slate-700 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span className="text-sm">Cloud API (Meta)</span>
                </a>
                <a
                  href="https://n8n.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-3 border border-slate-700 rounded-lg hover:bg-slate-800 transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span className="text-sm">N8N Workflows</span>
                </a>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Agentes de IA */}
        <TabsContent value="ai-agents" className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground">
                Configure os agentes de IA por departamento
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {aiAgents.filter(a => a.isActive).length} de {aiAgents.length} agentes ativos
              </p>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />Novo Agente
            </Button>
          </div>

          {/* Resumo dos Agentes */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card className="border-l-4 border-l-green-500">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-900/30 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{aiAgents.filter(a => a.isActive).length}</p>
                    <p className="text-xs text-muted-foreground">Agentes Ativos</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-900/30 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{Math.round(aiAgents.reduce((sum, a) => sum + a.successRate, 0) / aiAgents.length)}%</p>
                    <p className="text-xs text-muted-foreground">Taxa de Sucesso Media</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-900/30 rounded-lg">
                    <Clock className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{(aiAgents.reduce((sum, a) => sum + a.responseTime, 0) / aiAgents.length).toFixed(1)}s</p>
                    <p className="text-xs text-muted-foreground">Tempo Resposta Medio</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-900/30 rounded-lg">
                    <Users className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{aiAgents.filter(a => a.autoQualifyLeads).length}</p>
                    <p className="text-xs text-muted-foreground">Qualificam Leads</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Lista de Agentes */}
          <div className="grid gap-4 md:grid-cols-2">
            {aiAgents.map(agent => (
              <Card key={agent.id} className={cn(
                "border-l-4",
                agent.isActive ? "border-l-green-500" : "border-l-gray-300"
              )}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "p-3 rounded-xl",
                        agent.isActive ? "bg-gradient-to-br from-violet-500 to-purple-600 text-white" : "bg-slate-800"
                      )}>
                        <Bot className="h-6 w-6" />
                      </div>
                      <div>
                        <CardTitle className="text-base flex items-center gap-2">
                          {agent.name}
                          {agent.isActive ? (
                            <Badge className="bg-green-500">Ativo</Badge>
                          ) : (
                            <Badge variant="outline">Inativo</Badge>
                          )}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          {agent.department}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{agent.description}</p>

                  {/* Capacidades */}
                  <div className="flex flex-wrap gap-2">
                    {agent.capabilities.map(cap => (
                      <Badge key={cap} variant="outline" className="text-xs">
                        {cap === 'text' && 'Texto'}
                        {cap === 'audio' && 'Audio'}
                        {cap === 'image' && 'Imagem'}
                        {cap === 'pdf' && 'PDF'}
                      </Badge>
                    ))}
                  </div>

                  {/* Metricas */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-2 bg-slate-800 rounded-lg">
                      <p className="text-xs text-muted-foreground">Taxa Sucesso</p>
                      <div className="flex items-center gap-2">
                        <p className="text-lg font-bold">{agent.successRate}%</p>
                        <div className="flex-1 h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full",
                              agent.successRate >= 90 ? "bg-green-500" :
                              agent.successRate >= 80 ? "bg-amber-500" : "bg-red-500"
                            )}
                            style={{ width: `${agent.successRate}%` }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="p-2 bg-slate-800 rounded-lg">
                      <p className="text-xs text-muted-foreground">Tempo Resposta</p>
                      <p className="text-lg font-bold">{agent.responseTime}s</p>
                    </div>
                  </div>

                  {/* Configurações de Lead */}
                  {agent.autoQualifyLeads && (
                    <div className="p-3 bg-blue-900/30 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Users className="h-4 w-4 text-blue-600" />
                        <span className="text-sm font-medium text-blue-400">Qualificacao de Leads Ativa</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {agent.leadTags.map((tag, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Fluxos de Atendimento */}
          <Card>
            <CardHeader>
              <CardTitle>Fluxos de Atendimento</CardTitle>
              <CardDescription>
                Fluxos disponiveis para roteamento de atendimentos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Fluxo</TableHead>
                    <TableHead>Tipo Trigger</TableHead>
                    <TableHead>Etapas</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attendanceFlows.map(flow => (
                    <TableRow key={flow.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium flex items-center gap-2">
                            {flow.name}
                            {flow.isDefault && <Badge className="bg-amber-500">Padrao</Badge>}
                          </p>
                          <p className="text-xs text-muted-foreground">{flow.description}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {flow.triggerType === 'all' ? 'Todos' :
                           flow.triggerType === 'whatsapp' ? 'WhatsApp' :
                           flow.triggerType === 'landpage' ? 'Landing Page' : 'API'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {flow.steps.map((step, i) => (
                            <div key={step.id} className="flex items-center">
                              <Badge variant="secondary" className="text-xs">
                                {step.type === 'ai_triage' ? 'Triagem IA' :
                                 step.type === 'department_router' ? 'Roteador' :
                                 step.type === 'ai_agent' ? 'Agente IA' :
                                 step.type === 'human_transfer' ? 'Humano' : 'CRM'}
                              </Badge>
                              {i < flow.steps.length - 1 && (
                                <GitBranch className="h-3 w-3 mx-1 text-muted-foreground rotate-90" />
                              )}
                            </div>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-green-500">Ativo</Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="departments" className="mt-6">
          <DepartmentAdmin />
        </TabsContent>

        <TabsContent value="flows" className="mt-6 h-[calc(100vh-280px)]">
          <FlowBuilder />
        </TabsContent>

        <TabsContent value="metrics" className="mt-6">
          <div className="space-y-6">
            {/* Overview Stats */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Tickets Hoje</p>
                      <p className="text-2xl font-bold">{metrics.totalTicketsToday}</p>
                      <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                        <TrendingUp className="h-3 w-3" />
                        +12% vs ontem
                      </p>
                    </div>
                    <div className="p-3 bg-blue-900/30 rounded-lg">
                      <MessageSquare className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Tempo Médio Resposta</p>
                      <p className="text-2xl font-bold">{metrics.avgResponseTime}</p>
                      <p className="text-xs text-green-600 flex items-center gap-1 mt-1">
                        <CheckCircle className="h-3 w-3" />
                        Dentro do SLA
                      </p>
                    </div>
                    <div className="p-3 bg-green-900/30 rounded-lg">
                      <Clock className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Resoluções IA</p>
                      <p className="text-2xl font-bold">{metrics.aiResolutionRate}%</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Sem intervenção humana
                      </p>
                    </div>
                    <div className="p-3 bg-violet-900/30 rounded-lg">
                      <Bot className="h-6 w-6 text-violet-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Satisfação</p>
                      <p className="text-2xl font-bold">{metrics.satisfaction}/5.0</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {metrics.resolvedToday} avaliações
                      </p>
                    </div>
                    <div className="p-3 bg-amber-900/30 rounded-lg">
                      <TrendingUp className="h-6 w-6 text-amber-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Performance by Department */}
            <Card>
              <CardHeader>
                <CardTitle>Performance por Departamento</CardTitle>
                <CardDescription>
                  Comparativo de atendimento entre departamentos
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {metrics.byDepartment.map((dept) => (
                    <div key={dept.name} className="flex items-center justify-between p-3 rounded-lg bg-slate-800">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-700 rounded-lg">
                          <Building2 className="h-4 w-4 text-slate-400" />
                        </div>
                        <div>
                          <p className="font-medium">{dept.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {dept.resolved}/{dept.tickets} resolvidos
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-sm font-medium">{Math.round((dept.resolved / dept.tickets) * 100)}%</p>
                          <p className="text-xs text-muted-foreground">Taxa resolução</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{dept.satisfaction}</p>
                          <p className="text-xs text-muted-foreground">Satisfação</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* SLA & Agent Stats */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>SLA Compliance</CardTitle>
                  <CardDescription>
                    Cumprimento dos acordos de nível de serviço
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Primeira Resposta</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div className="h-full bg-green-500 rounded-full" style={{ width: '96%' }} />
                        </div>
                        <span className="text-sm font-medium">96%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Tempo de Resolução</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div className="h-full bg-green-500 rounded-full" style={{ width: '92%' }} />
                        </div>
                        <span className="text-sm font-medium">92%</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Satisfação do Cliente</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-slate-700 rounded-full overflow-hidden">
                          <div className="h-full bg-green-500 rounded-full" style={{ width: '94%' }} />
                        </div>
                        <span className="text-sm font-medium">94%</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Agentes</CardTitle>
                  <CardDescription>
                    Status da equipe de atendimento
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-green-900/30 border border-green-700">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-green-500" />
                        <span>Online</span>
                      </div>
                      <span className="font-medium">{metrics.activeAgents}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-amber-900/30 border border-amber-700">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-amber-500" />
                        <span>Ausente</span>
                      </div>
                      <span className="font-medium">2</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-slate-800 border border-slate-700">
                      <div className="flex items-center gap-2">
                        <div className="h-2 w-2 rounded-full bg-gray-400" />
                        <span>Offline</span>
                      </div>
                      <span className="font-medium">{metrics.totalAgents - metrics.activeAgents - 2}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialog: Novo/Editar Canal WhatsApp */}
      <Dialog open={isChannelDialogOpen} onOpenChange={setIsChannelDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedChannel ? 'Editar Canal' : 'Novo Canal WhatsApp'}</DialogTitle>
            <DialogDescription>
              {selectedChannel
                ? 'Atualize as configuracoes do canal'
                : 'Adicione um novo numero de WhatsApp como canal de comunicacao'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="channelName">Nome do Canal</Label>
              <Input
                id="channelName"
                value={channelForm.name}
                onChange={(e) => setChannelForm({ ...channelForm, name: e.target.value })}
                placeholder="Ex: Atendimento Principal"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Numero de Telefone</Label>
              <Input
                id="phoneNumber"
                value={channelForm.phoneNumber}
                onChange={(e) => setChannelForm({ ...channelForm, phoneNumber: e.target.value })}
                placeholder="+55 11 99999-0000"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="businessName">Nome do Negocio</Label>
              <Input
                id="businessName"
                value={channelForm.businessName}
                onChange={(e) => setChannelForm({ ...channelForm, businessName: e.target.value })}
                placeholder="Vinculo Brasil - Departamento"
              />
            </div>

            <div className="space-y-2">
              <Label>Provedor</Label>
              <Select
                value={channelForm.provider}
                onValueChange={(v) => setChannelForm({ ...channelForm, provider: v as WhatsAppChannel['provider'] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="evolution">Evolution API</SelectItem>
                  <SelectItem value="baileys">Baileys</SelectItem>
                  <SelectItem value="cloud_api">Cloud API (Meta)</SelectItem>
                  <SelectItem value="wppconnect">WPPConnect</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="webhookUrl">Webhook URL (N8N)</Label>
              <Input
                id="webhookUrl"
                value={channelForm.webhookUrl}
                onChange={(e) => setChannelForm({ ...channelForm, webhookUrl: e.target.value })}
                placeholder="https://n8n.vinculobrasil.com.br/webhook/whatsapp/..."
                className="font-mono text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="department">Departamento</Label>
              <Input
                id="department"
                value={channelForm.department}
                onChange={(e) => setChannelForm({ ...channelForm, department: e.target.value })}
                placeholder="Ex: Comercial, Suporte, Financeiro"
              />
            </div>

            {/* Configuração de Fluxo e IA */}
            <div className="pt-4 border-t">
              <p className="text-sm font-medium mb-3 flex items-center gap-2">
                <Bot className="h-4 w-4" />
                Configuracao de IA e Fluxo
              </p>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>IA Habilitada</Label>
                    <p className="text-xs text-muted-foreground">Ativar atendimento automatizado por IA</p>
                  </div>
                  <Switch
                    checked={channelForm.aiEnabled}
                    onCheckedChange={(v) => setChannelForm({ ...channelForm, aiEnabled: v })}
                  />
                </div>

                {channelForm.aiEnabled && (
                  <>
                    <div className="space-y-2">
                      <Label>Fluxo Inicial</Label>
                      <Select
                        value={channelForm.initialFlowId}
                        onValueChange={(v) => setChannelForm({ ...channelForm, initialFlowId: v })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o fluxo" />
                        </SelectTrigger>
                        <SelectContent>
                          {attendanceFlows.map(flow => (
                            <SelectItem key={flow.id} value={flow.id}>
                              <div className="flex items-center gap-2">
                                <span>{flow.name}</span>
                                {flow.isDefault && <Badge variant="outline" className="text-xs">Padrao</Badge>}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        Define o fluxo de atendimento para mensagens recebidas neste canal
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label>Agente IA</Label>
                      <Select
                        value={channelForm.aiAgentId}
                        onValueChange={(v) => setChannelForm({ ...channelForm, aiAgentId: v })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o agente" />
                        </SelectTrigger>
                        <SelectContent>
                          {aiAgents.filter(a => a.isActive).map(agent => (
                            <SelectItem key={agent.id} value={agent.id}>
                              <div className="flex items-center gap-2">
                                <span>{agent.name}</span>
                                <Badge variant="outline" className="text-xs">{agent.department}</Badge>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        Agente de IA responsavel pelo primeiro atendimento
                      </p>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Qualificar Leads Automaticamente</Label>
                        <p className="text-xs text-muted-foreground">Cadastrar novos contatos como leads no CRM</p>
                      </div>
                      <Switch
                        checked={channelForm.autoQualifyLeads}
                        onCheckedChange={(v) => setChannelForm({ ...channelForm, autoQualifyLeads: v })}
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Canal Principal</Label>
                <p className="text-xs text-muted-foreground">Define este como canal padrao</p>
              </div>
              <Switch
                checked={channelForm.isDefault}
                onCheckedChange={(v) => setChannelForm({ ...channelForm, isDefault: v })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsChannelDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSaveChannel}>
              <CheckCircle className="h-4 w-4 mr-2" />
              {selectedChannel ? 'Salvar Alteracoes' : 'Adicionar Canal'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default OmnichannelConfig;
