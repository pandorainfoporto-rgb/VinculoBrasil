/**
 * Vínculo Omni - Sistema de Atendimento Omnichannel
 *
 * Módulo principal que unifica:
 * - Central de Atendimento (Agent Inbox)
 * - Administração de Departamentos e Filas
 * - Editor de Fluxos de Atendimento
 * - Métricas e Relatórios
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  Inbox,
  Building2,
  GitBranch,
  BarChart3,
  Settings,
  Users,
  MessageSquare,
  Bot,
  Headphones,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  Phone,
  Globe,
  Mail,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Sub-components
import { AgentInbox } from './agent-inbox';
import { DepartmentAdmin } from './department-admin';
import { FlowEditor } from './flow-editor';

interface VinculoOmniProps {
  defaultTab?: 'inbox' | 'departments' | 'flows' | 'metrics' | 'settings';
}

export function VinculoOmni({ defaultTab = 'inbox' }: VinculoOmniProps) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  // Mock metrics
  const overviewMetrics = {
    totalTicketsToday: 156,
    openTickets: 23,
    resolvedToday: 133,
    avgResponseTime: '2m 45s',
    satisfaction: 4.7,
    aiResolutionRate: 68,
    activeAgents: 8,
    totalAgents: 12,
    channels: {
      whatsapp: 89,
      webchat: 45,
      email: 22,
    },
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl">
              <MessageSquare className="h-8 w-8 text-white" />
            </div>
            Vínculo Omni
          </h1>
          <p className="text-muted-foreground mt-1">
            Central de Atendimento Omnichannel com IA Integrada
          </p>
        </div>
        <div className="flex items-center gap-4">
          {/* Quick Stats */}
          <div className="hidden md:flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-muted-foreground">
                {overviewMetrics.activeAgents}/{overviewMetrics.totalAgents} Agentes Online
              </span>
            </div>
            <Separator orientation="vertical" className="h-6" />
            <div className="flex items-center gap-2">
              <Inbox className="h-4 w-4 text-amber-500" />
              <span className="font-medium">{overviewMetrics.openTickets}</span>
              <span className="text-muted-foreground">tickets abertos</span>
            </div>
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tickets Hoje</p>
                <p className="text-2xl font-bold">{overviewMetrics.totalTicketsToday}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <MessageSquare className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-xs text-green-600">+12% vs ontem</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Tempo Médio Resposta</p>
                <p className="text-2xl font-bold">{overviewMetrics.avgResponseTime}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <Clock className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-xs text-green-600">Dentro do SLA</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Satisfação</p>
                <p className="text-2xl font-bold">{overviewMetrics.satisfaction}/5.0</p>
              </div>
              <div className="p-3 bg-amber-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-amber-600" />
              </div>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-muted-foreground">
                Base: {overviewMetrics.resolvedToday} avaliações
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Resoluções IA</p>
                <p className="text-2xl font-bold">{overviewMetrics.aiResolutionRate}%</p>
              </div>
              <div className="p-3 bg-violet-100 rounded-lg">
                <Bot className="h-6 w-6 text-violet-600" />
              </div>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-muted-foreground">
                Sem intervenção humana
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Channel Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-green-500 rounded-lg">
              <Phone className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-green-700">WhatsApp</p>
              <p className="text-2xl font-bold text-green-800">
                {overviewMetrics.channels.whatsapp}
              </p>
              <p className="text-xs text-green-600">tickets hoje</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-blue-500 rounded-lg">
              <Globe className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-blue-700">Webchat</p>
              <p className="text-2xl font-bold text-blue-800">
                {overviewMetrics.channels.webchat}
              </p>
              <p className="text-xs text-blue-600">tickets hoje</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-50 border-slate-200">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="p-3 bg-slate-500 rounded-lg">
              <Mail className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-slate-700">E-mail</p>
              <p className="text-2xl font-bold text-slate-800">
                {overviewMetrics.channels.email}
              </p>
              <p className="text-xs text-slate-600">tickets hoje</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
          <TabsTrigger value="inbox" className="flex items-center gap-2">
            <Inbox className="h-4 w-4" />
            <span className="hidden sm:inline">Atendimento</span>
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

        <TabsContent value="inbox" className="mt-6">
          <AgentInbox />
        </TabsContent>

        <TabsContent value="departments" className="mt-6">
          <DepartmentAdmin />
        </TabsContent>

        <TabsContent value="flows" className="mt-6">
          <FlowEditor />
        </TabsContent>

        <TabsContent value="metrics" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Métricas e Relatórios</CardTitle>
              <CardDescription>
                Análise detalhada do desempenho do atendimento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-30" />
                <p>Dashboard de métricas em desenvolvimento</p>
                <p className="text-sm mt-2">
                  Relatórios de performance, SLA, satisfação e mais
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Re-export components
export { AgentInbox } from './agent-inbox';
export { DepartmentAdmin } from './department-admin';
export { FlowEditor } from './flow-editor';
export { OmnichannelConfig } from './omnichannel-config';

export default VinculoOmni;
