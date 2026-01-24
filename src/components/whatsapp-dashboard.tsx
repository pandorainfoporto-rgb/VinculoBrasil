/**
 * Dashboard WhatsApp Business API - Vinculo.io
 *
 * Monitora todas as métricas exigidas pela Meta:
 * - Qualidade do número (Green/Yellow/Red)
 * - Taxa de entrega e leitura
 * - Conversas por categoria (Marketing/Utility/Auth/Service)
 * - Templates aprovados/pendentes/rejeitados
 * - Opt-in/Opt-out compliance
 * - Janela de atendimento 24h
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  MessageSquare,
  Send,
  CheckCircle2,
  Eye,
  XCircle,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Users,
  Clock,
  RefreshCw,
  Shield,
  FileText,
  Bell,
  UserMinus,
  Phone,
  Activity,
  BarChart3,
  PieChart,
  MessageCircle,
  Zap,
  AlertOctagon,
} from 'lucide-react';
import {
  type WhatsAppMetrics,
  type WhatsAppQualityRating,
  MockWhatsAppService,
} from '@/lib/bridge/whatsapp-service';

// ============================================================================
// TIPOS
// ============================================================================

interface TemplateInfo {
  name: string;
  category: 'marketing' | 'utility' | 'authentication';
  status: 'approved' | 'pending' | 'rejected';
  language: string;
  lastUsed?: string;
  usageCount: number;
}

interface ConversationInfo {
  id: string;
  contact: string;
  contactName: string;
  type: 'marketing' | 'utility' | 'authentication' | 'service';
  startedAt: string;
  expiresAt: string;
  isActive: boolean;
  messageCount: number;
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export function WhatsAppDashboard() {
  const [metrics, setMetrics] = useState<WhatsAppMetrics | null>(null);
  const [templates, setTemplates] = useState<TemplateInfo[]>([]);
  const [conversations, setConversations] = useState<ConversationInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // Mock service para demonstração
  const whatsappService = new MockWhatsAppService();

  useEffect(() => {
    loadData();
    // Auto-refresh a cada 60 segundos
    const interval = setInterval(loadData, 60000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      setMetrics(whatsappService.getMetrics());
      setTemplates(generateMockTemplates());
      setConversations(generateMockConversations());
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMockTemplates = (): TemplateInfo[] => [
    {
      name: 'vinculo_payment_reminder',
      category: 'utility',
      status: 'approved',
      language: 'pt_BR',
      lastUsed: new Date(Date.now() - 3600000).toISOString(),
      usageCount: 1234,
    },
    {
      name: 'vinculo_payment_confirmed',
      category: 'utility',
      status: 'approved',
      language: 'pt_BR',
      lastUsed: new Date(Date.now() - 7200000).toISOString(),
      usageCount: 987,
    },
    {
      name: 'vinculo_contract_ready',
      category: 'utility',
      status: 'approved',
      language: 'pt_BR',
      lastUsed: new Date(Date.now() - 86400000).toISOString(),
      usageCount: 456,
    },
    {
      name: 'vinculo_delinquency_alert',
      category: 'utility',
      status: 'approved',
      language: 'pt_BR',
      lastUsed: new Date(Date.now() - 172800000).toISOString(),
      usageCount: 89,
    },
    {
      name: 'vinculo_verification_code',
      category: 'authentication',
      status: 'approved',
      language: 'pt_BR',
      lastUsed: new Date(Date.now() - 1800000).toISOString(),
      usageCount: 2345,
    },
    {
      name: 'vinculo_marketing_promo',
      category: 'marketing',
      status: 'pending',
      language: 'pt_BR',
      usageCount: 0,
    },
  ];

  const generateMockConversations = (): ConversationInfo[] => {
    const now = Date.now();
    return [
      {
        id: 'conv_1',
        contact: '5511999998888',
        contactName: 'João Silva',
        type: 'service',
        startedAt: new Date(now - 3600000).toISOString(),
        expiresAt: new Date(now + 20 * 3600000).toISOString(),
        isActive: true,
        messageCount: 8,
      },
      {
        id: 'conv_2',
        contact: '5511888887777',
        contactName: 'Maria Santos',
        type: 'utility',
        startedAt: new Date(now - 7200000).toISOString(),
        expiresAt: new Date(now + 16 * 3600000).toISOString(),
        isActive: true,
        messageCount: 3,
      },
      {
        id: 'conv_3',
        contact: '5511777776666',
        contactName: 'Carlos Oliveira',
        type: 'authentication',
        startedAt: new Date(now - 1800000).toISOString(),
        expiresAt: new Date(now + 22 * 3600000).toISOString(),
        isActive: true,
        messageCount: 2,
      },
    ];
  };

  const getQualityColor = (rating: WhatsAppQualityRating) => {
    switch (rating) {
      case 'GREEN':
        return 'bg-green-500';
      case 'YELLOW':
        return 'bg-yellow-500';
      case 'RED':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getQualityLabel = (rating: WhatsAppQualityRating) => {
    switch (rating) {
      case 'GREEN':
        return 'Alta Qualidade';
      case 'YELLOW':
        return 'Qualidade Média';
      case 'RED':
        return 'Baixa Qualidade';
      default:
        return 'Desconhecido';
    }
  };

  const formatTimeRemaining = (expiresAt: string) => {
    const remaining = new Date(expiresAt).getTime() - Date.now();
    const hours = Math.floor(remaining / 3600000);
    const minutes = Math.floor((remaining % 3600000) / 60000);
    return `${hours}h ${minutes}m`;
  };

  if (!metrics) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const totalConversations =
    metrics.conversations.marketing +
    metrics.conversations.utility +
    metrics.conversations.authentication +
    metrics.conversations.service;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-green-600" />
            WhatsApp Business API
          </h2>
          <p className="text-muted-foreground">
            Métricas e compliance Meta Business Platform
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            <Clock className="h-4 w-4 inline mr-1" />
            Atualizado: {lastRefresh.toLocaleTimeString('pt-BR')}
          </div>
          <Button variant="outline" size="sm" onClick={loadData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Alertas de Qualidade */}
      {metrics.qualityRating === 'RED' && (
        <Alert variant="destructive">
          <AlertOctagon className="h-4 w-4" />
          <AlertTitle>Qualidade Crítica - Risco de Restrição</AlertTitle>
          <AlertDescription>
            Seu número está com qualidade baixa. Reduza o volume de mensagens e melhore o conteúdo
            para evitar restrições da Meta.
          </AlertDescription>
        </Alert>
      )}

      {metrics.qualityRating === 'YELLOW' && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Atenção: Qualidade em Declínio</AlertTitle>
          <AlertDescription>
            A qualidade do seu número está em risco. Monitore as métricas e evite spam.
          </AlertDescription>
        </Alert>
      )}

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Qualidade do Número */}
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Qualidade do Número
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <div className={`w-4 h-4 rounded-full ${getQualityColor(metrics.qualityRating)}`} />
              <span className="text-xl font-bold">{getQualityLabel(metrics.qualityRating)}</span>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Status: {metrics.phoneStatus}
            </p>
          </CardContent>
        </Card>

        {/* Limite de Mensagens */}
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Limite Diário
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics.messagingLimit.toLocaleString()}
            </div>
            <Badge variant="outline" className="mt-2">
              {metrics.messagingTier.replace('TIER_', 'Tier ')}
            </Badge>
          </CardContent>
        </Card>

        {/* Taxa de Entrega */}
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Taxa de Entrega
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {metrics.deliveryRate.toFixed(1)}%
            </div>
            <Progress value={metrics.deliveryRate} className="h-2 mt-2" />
          </CardContent>
        </Card>

        {/* Taxa de Leitura */}
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Taxa de Leitura
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {metrics.readRate.toFixed(1)}%
            </div>
            <Progress value={metrics.readRate} className="h-2 mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Métricas de Mensagens */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Estatísticas de Envio */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Estatísticas de Mensagens
            </CardTitle>
            <CardDescription>Período: Hoje</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Send className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-blue-600">{metrics.messagesSent}</p>
                <p className="text-sm text-muted-foreground">Enviadas</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <CheckCircle2 className="h-6 w-6 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-600">{metrics.messagesDelivered}</p>
                <p className="text-sm text-muted-foreground">Entregues</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <Eye className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-purple-600">{metrics.messagesRead}</p>
                <p className="text-sm text-muted-foreground">Lidas</p>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <XCircle className="h-6 w-6 text-red-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-red-600">{metrics.messagesFailed}</p>
                <p className="text-sm text-muted-foreground">Falhas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Conversas por Categoria (Cobrança Meta) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Conversas por Categoria
            </CardTitle>
            <CardDescription>
              Categorias de cobrança Meta (Faturamento)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">Marketing</span>
                  <span className="text-sm text-muted-foreground">
                    {metrics.conversations.marketing} ({((metrics.conversations.marketing / totalConversations) * 100).toFixed(0)}%)
                  </span>
                </div>
                <Progress
                  value={(metrics.conversations.marketing / totalConversations) * 100}
                  className="h-2"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">Utility</span>
                  <span className="text-sm text-muted-foreground">
                    {metrics.conversations.utility} ({((metrics.conversations.utility / totalConversations) * 100).toFixed(0)}%)
                  </span>
                </div>
                <Progress
                  value={(metrics.conversations.utility / totalConversations) * 100}
                  className="h-2"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">Authentication</span>
                  <span className="text-sm text-muted-foreground">
                    {metrics.conversations.authentication} ({((metrics.conversations.authentication / totalConversations) * 100).toFixed(0)}%)
                  </span>
                </div>
                <Progress
                  value={(metrics.conversations.authentication / totalConversations) * 100}
                  className="h-2"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium flex items-center gap-1">
                    Service
                    <Badge variant="outline" className="text-xs">Grátis 24h</Badge>
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {metrics.conversations.service} ({((metrics.conversations.service / totalConversations) * 100).toFixed(0)}%)
                  </span>
                </div>
                <Progress
                  value={(metrics.conversations.service / totalConversations) * 100}
                  className="h-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs para Templates e Conversas */}
      <Tabs defaultValue="templates">
        <TabsList>
          <TabsTrigger value="templates">
            <FileText className="h-4 w-4 mr-2" />
            Templates ({templates.length})
          </TabsTrigger>
          <TabsTrigger value="conversations">
            <MessageCircle className="h-4 w-4 mr-2" />
            Conversas Ativas ({metrics.activeConversations})
          </TabsTrigger>
          <TabsTrigger value="compliance">
            <Shield className="h-4 w-4 mr-2" />
            Compliance
          </TabsTrigger>
        </TabsList>

        {/* Templates */}
        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle>Templates de Mensagem</CardTitle>
              <CardDescription>
                Templates aprovados pela Meta para envio fora da janela de 24h
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <CheckCircle2 className="h-6 w-6 text-green-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-green-600">{metrics.templatesApproved}</p>
                  <p className="text-sm text-muted-foreground">Aprovados</p>
                </div>
                <div className="text-center p-4 bg-yellow-50 rounded-lg">
                  <Clock className="h-6 w-6 text-yellow-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-yellow-600">{metrics.templatesPending}</p>
                  <p className="text-sm text-muted-foreground">Pendentes</p>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <XCircle className="h-6 w-6 text-red-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-red-600">{metrics.templatesRejected}</p>
                  <p className="text-sm text-muted-foreground">Rejeitados</p>
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Idioma</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Uso</TableHead>
                    <TableHead>Último Uso</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {templates.map((template) => (
                    <TableRow key={template.name}>
                      <TableCell className="font-mono text-sm">{template.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {template.category.charAt(0).toUpperCase() + template.category.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>{template.language}</TableCell>
                      <TableCell>
                        <Badge
                          className={
                            template.status === 'approved'
                              ? 'bg-green-500'
                              : template.status === 'pending'
                                ? 'bg-yellow-500'
                                : 'bg-red-500'
                          }
                        >
                          {template.status === 'approved'
                            ? 'Aprovado'
                            : template.status === 'pending'
                              ? 'Pendente'
                              : 'Rejeitado'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        {template.usageCount.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {template.lastUsed
                          ? new Date(template.lastUsed).toLocaleString('pt-BR')
                          : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Conversas Ativas */}
        <TabsContent value="conversations">
          <Card>
            <CardHeader>
              <CardTitle>Conversas Ativas (Janela 24h)</CardTitle>
              <CardDescription>
                Conversas dentro da janela de atendimento gratuito
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <Activity className="h-6 w-6 text-green-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-green-600">{metrics.activeConversations}</p>
                  <p className="text-sm text-muted-foreground">Ativas</p>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <Clock className="h-6 w-6 text-gray-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-gray-600">{metrics.expiredConversations}</p>
                  <p className="text-sm text-muted-foreground">Expiradas Hoje</p>
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Contato</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Mensagens</TableHead>
                    <TableHead>Tempo Restante</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {conversations.map((conv) => (
                    <TableRow key={conv.id}>
                      <TableCell className="font-mono text-sm">
                        +{conv.contact.replace(/(\d{2})(\d{2})(\d{5})(\d{4})/, '$1 $2 $3-$4')}
                      </TableCell>
                      <TableCell>{conv.contactName}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {conv.type.charAt(0).toUpperCase() + conv.type.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>{conv.messageCount}</TableCell>
                      <TableCell className="font-mono">
                        {formatTimeRemaining(conv.expiresAt)}
                      </TableCell>
                      <TableCell>
                        <Badge className={conv.isActive ? 'bg-green-500' : 'bg-gray-500'}>
                          {conv.isActive ? 'Ativa' : 'Expirada'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Compliance */}
        <TabsContent value="compliance">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Meta</CardTitle>
              <CardDescription>
                Métricas de conformidade exigidas pela Meta Business Platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <UserMinus className="h-6 w-6 text-orange-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-orange-600">{metrics.optOutRequests}</p>
                  <p className="text-sm text-muted-foreground">Opt-Out Requests</p>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <XCircle className="h-6 w-6 text-red-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-red-600">{metrics.blockedUsers}</p>
                  <p className="text-sm text-muted-foreground">Usuários Bloqueados</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-purple-600">{metrics.spamReports}</p>
                  <p className="text-sm text-muted-foreground">Denúncias de Spam</p>
                </div>
              </div>

              <Separator className="my-6" />

              <div className="space-y-4">
                <h4 className="font-semibold">Requisitos Meta</h4>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <span>Opt-in explícito coletado</span>
                    </div>
                    <Badge className="bg-green-500">Conforme</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <span>Opt-out disponível em todas as mensagens</span>
                    </div>
                    <Badge className="bg-green-500">Conforme</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <span>Templates aprovados antes do uso</span>
                    </div>
                    <Badge className="bg-green-500">Conforme</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <span>Janela de 24h respeitada</span>
                    </div>
                    <Badge className="bg-green-500">Conforme</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <span>Política de privacidade atualizada</span>
                    </div>
                    <Badge className="bg-green-500">Conforme</Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2">
                      {metrics.spamReports === 0 ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-yellow-600" />
                      )}
                      <span>Taxa de spam abaixo do limite</span>
                    </div>
                    <Badge className={metrics.spamReports === 0 ? 'bg-green-500' : 'bg-yellow-500'}>
                      {metrics.spamReports === 0 ? 'Conforme' : 'Monitorar'}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Informações Técnicas */}
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5 text-green-600" />
            Configuração Técnica
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Phone Number ID</p>
              <p className="font-mono">123456789012345</p>
            </div>
            <div>
              <p className="text-muted-foreground">Business Account ID</p>
              <p className="font-mono">987654321098765</p>
            </div>
            <div>
              <p className="text-muted-foreground">API Version</p>
              <p className="font-mono">v18.0</p>
            </div>
            <div>
              <p className="text-muted-foreground">Webhook Status</p>
              <Badge className="bg-green-500">Ativo</Badge>
            </div>
          </div>

          <Separator />

          <div className="text-sm">
            <p className="text-muted-foreground mb-2">Webhook URL:</p>
            <code className="block p-2 bg-muted rounded font-mono text-xs">
              https://api.vinculobrasil.com.br/webhooks/whatsapp
            </code>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default WhatsAppDashboard;
