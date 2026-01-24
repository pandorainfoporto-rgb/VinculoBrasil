/**
 * Dashboard da Seguradora - Vínculo.io
 * Sistema para gestao de apolices, sinistros e analytics
 */

import { useState } from 'react';
import { VinculoBrasilLogo } from '@/components/vinculo-brasil-logo';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
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
  Shield,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  FileText,
  Home,
  Wallet,
  BarChart3,
  Clock,
  DollarSign,
  Users,
  AlertCircle,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Policy {
  id: string;
  propertyAddress: string;
  tenantName: string;
  landlordName: string;
  monthlyRent: number;
  coverageAmount: number;
  premium: number;
  status: 'active' | 'pending' | 'expired' | 'claimed';
  startDate: Date;
  endDate: Date;
}

interface Claim {
  id: string;
  policyId: string;
  propertyAddress: string;
  claimType: 'default' | 'damage' | 'eviction';
  amount: number;
  status: 'pending' | 'approved' | 'rejected' | 'paid';
  submittedAt: Date;
  resolvedAt?: Date;
}

// Dados vazios para producao - apolices e sinistros virao do backend
const SAMPLE_POLICIES: Policy[] = [];

const SAMPLE_CLAIMS: Claim[] = [];

interface InsurerDashboardProps {
  onLogout?: () => void;
  userName?: string;
  userEmail?: string;
}

export function InsurerDashboard({ onLogout, userName, userEmail }: InsurerDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [policies] = useState<Policy[]>(SAMPLE_POLICIES);
  const [claims] = useState<Claim[]>(SAMPLE_CLAIMS);

  // Metricas calculadas
  const activePolicies = policies.filter(p => p.status === 'active').length;
  const totalPremiums = policies.filter(p => p.status === 'active').reduce((sum, p) => sum + p.premium, 0);
  const totalCoverage = policies.filter(p => p.status === 'active').reduce((sum, p) => sum + p.coverageAmount, 0);
  const pendingClaims = claims.filter(c => c.status === 'pending').length;
  const totalClaimsValue = claims.filter(c => c.status === 'pending' || c.status === 'approved').reduce((sum, c) => sum + c.amount, 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pt-BR').format(date);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
      active: { variant: 'default', label: 'Ativa' },
      pending: { variant: 'secondary', label: 'Pendente' },
      expired: { variant: 'outline', label: 'Expirada' },
      claimed: { variant: 'destructive', label: 'Sinistrada' },
      approved: { variant: 'default', label: 'Aprovado' },
      rejected: { variant: 'destructive', label: 'Rejeitado' },
      paid: { variant: 'default', label: 'Pago' },
    };
    const config = variants[status] || { variant: 'outline' as const, label: status };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getClaimTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      default: 'Inadimplencia',
      damage: 'Danos ao Imovel',
      eviction: 'Despejo',
    };
    return labels[type] || type;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-background border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <VinculoBrasilLogo size="lg" />
            </div>
            <div className="flex items-center gap-4">
              <Badge variant="outline" className="text-base border-border">
                Seguradora
              </Badge>
              <div className="text-right hidden md:block">
                <p className="text-sm font-medium text-foreground">{userName || 'Seguradora'}</p>
                <p className="text-xs text-muted-foreground">{userEmail || ''}</p>
              </div>
              {onLogout && (
                <Button variant="ghost" size="sm" onClick={onLogout} title="Sair">
                  <LogOut className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Dashboard Seguradora</h1>
          <p className="text-muted-foreground/70">Gestao de apolices e sinistros do sistema Vinculo.io</p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Apolices Ativas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-foreground">{activePolicies}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Premios Mensais
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">{formatCurrency(totalPremiums)}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <Wallet className="h-4 w-4" />
                Cobertura Total
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-600">{formatCurrency(totalCoverage)}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Sinistros Pendentes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-amber-600">{pendingClaims}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Valor em Sinistros
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-red-600">{formatCurrency(totalClaimsValue)}</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="bg-white border">
            <TabsTrigger value="overview" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Visao Geral
            </TabsTrigger>
            <TabsTrigger value="policies" className="gap-2">
              <FileText className="h-4 w-4" />
              Apolices
            </TabsTrigger>
            <TabsTrigger value="claims" className="gap-2">
              <AlertCircle className="h-4 w-4" />
              Sinistros
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Risk Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Analise de Risco
                  </CardTitle>
                  <CardDescription>Indicadores de performance da carteira</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Taxa de Sinistralidade</span>
                      <span className="font-medium">12.5%</span>
                    </div>
                    <Progress value={12.5} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Indice de Cobertura</span>
                      <span className="font-medium">98.2%</span>
                    </div>
                    <Progress value={98.2} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Score Medio de Risco</span>
                      <span className="font-medium text-green-600">Baixo</span>
                    </div>
                    <Progress value={25} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Atividades Recentes
                  </CardTitle>
                  <CardDescription>Ultimas movimentacoes do sistema</CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-48">
                    <div className="space-y-3">
                      <div className="flex items-start gap-3 p-2 rounded-lg bg-green-50">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">Nova apolice emitida</p>
                          <p className="text-xs text-muted-foreground">POL-003 - Rua Boa Vista, 789</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-2 rounded-lg bg-amber-50">
                        <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">Sinistro em analise</p>
                          <p className="text-xs text-muted-foreground">CLM-001 - Inadimplencia</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-2 rounded-lg bg-blue-50">
                        <DollarSign className="h-5 w-5 text-blue-600 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">Premio recebido</p>
                          <p className="text-xs text-muted-foreground">POL-002 - R$ 228,00</p>
                        </div>
                      </div>
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Policies Tab */}
          <TabsContent value="policies">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Apolices de Seguro Fianca
                </CardTitle>
                <CardDescription>Todas as apolices vinculadas a sua seguradora</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Imovel</TableHead>
                      <TableHead>Inquilino</TableHead>
                      <TableHead>Aluguel</TableHead>
                      <TableHead>Cobertura</TableHead>
                      <TableHead>Premio</TableHead>
                      <TableHead>Vigencia</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {policies.map((policy) => (
                      <TableRow key={policy.id}>
                        <TableCell className="font-mono text-xs">{policy.id}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{policy.propertyAddress}</TableCell>
                        <TableCell>{policy.tenantName}</TableCell>
                        <TableCell>{formatCurrency(policy.monthlyRent)}</TableCell>
                        <TableCell>{formatCurrency(policy.coverageAmount)}</TableCell>
                        <TableCell className="text-green-600 font-medium">{formatCurrency(policy.premium)}/mes</TableCell>
                        <TableCell className="text-xs">
                          {formatDate(policy.startDate)} - {formatDate(policy.endDate)}
                        </TableCell>
                        <TableCell>{getStatusBadge(policy.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Claims Tab */}
          <TabsContent value="claims">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  Sinistros
                </CardTitle>
                <CardDescription>Gestao de sinistros e indenizacoes</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>Apolice</TableHead>
                      <TableHead>Imovel</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Data Abertura</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Acoes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {claims.map((claim) => (
                      <TableRow key={claim.id}>
                        <TableCell className="font-mono text-xs">{claim.id}</TableCell>
                        <TableCell className="font-mono text-xs">{claim.policyId}</TableCell>
                        <TableCell className="max-w-[200px] truncate">{claim.propertyAddress}</TableCell>
                        <TableCell>{getClaimTypeLabel(claim.claimType)}</TableCell>
                        <TableCell className="text-red-600 font-medium">{formatCurrency(claim.amount)}</TableCell>
                        <TableCell className="text-xs">{formatDate(claim.submittedAt)}</TableCell>
                        <TableCell>{getStatusBadge(claim.status)}</TableCell>
                        <TableCell>
                          <Button variant="outline" size="sm">
                            Analisar
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
