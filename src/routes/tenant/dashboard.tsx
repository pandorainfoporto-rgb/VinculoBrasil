// ============================================
// TENANT PORTAL - Dashboard Principal
// Experiência "Nubank" - Conexão Real com API
// ============================================

import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { TenantLayout } from '@/components/layouts/TenantLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { TenantDashboardSkeleton } from '@/components/ui/loading-skeleton';
import { TenantNoContractEmpty } from '@/components/ui/empty-state';
import { useTenantDashboard, usePayRent } from '@/hooks/use-api';
import {
  Copy,
  Check,
  MapPin,
  Building2,
  ShieldCheck,
  AlertCircle,
  Clock,
  CheckCircle,
  Calendar,
  Phone,
  MessageCircle,
  ChevronRight,
  Wallet,
  TrendingUp,
  FileText,
  Star,
  Wrench,
  ExternalLink,
} from 'lucide-react';

export const Route = createFileRoute('/tenant/dashboard')({
  component: TenantDashboardPage,
});

function TenantDashboardPage() {
  const { data, isLoading, error } = useTenantDashboard();
  const payRentMutation = usePayRent();
  const [copied, setCopied] = useState(false);

  const copyPix = async (pixCode: string) => {
    try {
      await navigator.clipboard.writeText(pixCode);
      setCopied(true);
      toast.success('Código PIX copiado!');
      setTimeout(() => setCopied(false), 3000);
    } catch {
      toast.error('Erro ao copiar. Tente novamente.');
    }
  };

  const handlePayRent = async (paymentId: string) => {
    try {
      const result = await payRentMutation.mutateAsync(paymentId);
      if (result.pixCode) {
        await copyPix(result.pixCode);
      }
    } catch {
      toast.error('Erro ao gerar código de pagamento');
    }
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('pt-BR');

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diff = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const getStatusBadge = (status: string, dueDate: string) => {
    const days = getDaysUntilDue(dueDate);

    if (status === 'PAID') {
      return (
        <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
          <CheckCircle className="h-3 w-3 mr-1" />
          Pago
        </Badge>
      );
    }

    if (status === 'OVERDUE' || days < 0) {
      return (
        <Badge className="bg-red-100 text-red-700 border-red-200">
          <AlertCircle className="h-3 w-3 mr-1" />
          Vencido
        </Badge>
      );
    }

    if (days === 0) {
      return (
        <Badge className="bg-orange-100 text-orange-700 border-orange-200">
          <Clock className="h-3 w-3 mr-1" />
          Vence Hoje
        </Badge>
      );
    }

    if (days <= 3) {
      return (
        <Badge className="bg-amber-100 text-amber-700 border-amber-200">
          <Clock className="h-3 w-3 mr-1" />
          Vence em {days} dias
        </Badge>
      );
    }

    return (
      <Badge className="bg-blue-100 text-blue-700 border-blue-200">
        <Calendar className="h-3 w-3 mr-1" />
        Vence em {days} dias
      </Badge>
    );
  };

  // ============================================
  // LOADING STATE - Skeleton Profissional
  // ============================================
  if (isLoading) {
    return (
      <TenantLayout>
        <div className="md:ml-64 p-4 md:p-6">
          <TenantDashboardSkeleton />
        </div>
      </TenantLayout>
    );
  }

  // ============================================
  // ERROR STATE
  // ============================================
  if (error) {
    return (
      <TenantLayout>
        <div className="md:ml-64 p-4 md:p-6">
          <div className="text-center py-16">
            <AlertCircle className="mx-auto text-red-400 mb-4" size={48} />
            <h2 className="text-xl font-bold text-slate-700">Erro ao carregar dados</h2>
            <p className="text-slate-500 mt-2">
              {error instanceof Error ? error.message : 'Tente novamente mais tarde'}
            </p>
            <Button onClick={() => window.location.reload()} className="mt-4">
              Tentar Novamente
            </Button>
          </div>
        </div>
      </TenantLayout>
    );
  }

  // ============================================
  // SEM CONTRATO - Empty State Bonito
  // ============================================
  if (!data?.hasContract || !data.contract) {
    return (
      <TenantLayout>
        <div className="md:ml-64 p-4 md:p-6">
          <TenantNoContractEmpty
            onContact={() => window.open('https://wa.me/5511999999999', '_blank')}
          />
        </div>
      </TenantLayout>
    );
  }

  const { contract, nextPayment, paymentHistory, stats, tenant } = data;

  // ============================================
  // RENDER PRINCIPAL
  // ============================================
  return (
    <TenantLayout>
      <div className="space-y-6 md:ml-64 p-4 md:p-6">
        {/* ============================================ */}
        {/* SAUDAÇÃO */}
        {/* ============================================ */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Olá, {tenant.name.split(' ')[0]}! 👋
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Bem-vindo ao seu portal. Aqui você gerencia sua moradia.
          </p>
        </div>

        {/* ============================================ */}
        {/* HERO - PRÓXIMA FATURA */}
        {/* ============================================ */}
        {nextPayment && (
          <Card className="bg-white dark:bg-gray-800 border-0 shadow-xl shadow-indigo-100/50 dark:shadow-none overflow-hidden">
            <CardContent className="p-0">
              {/* Gradiente decorativo */}
              <div className="h-2 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600" />

              <div className="p-6 relative">
                {/* Ícone decorativo */}
                <div className="absolute top-4 right-4 opacity-5">
                  <ShieldCheck size={120} className="text-indigo-600" />
                </div>

                {/* Status */}
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                    Próximo Vencimento
                  </p>
                  {getStatusBadge(nextPayment.status, nextPayment.dueDate)}
                </div>

                {/* Valor Principal */}
                <h2 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-white">
                  {formatCurrency(nextPayment.amount)}
                </h2>

                {/* Breakdown */}
                <div className="flex flex-wrap gap-3 mt-3 text-sm text-slate-500 dark:text-slate-400">
                  <span>Aluguel: {formatCurrency(nextPayment.breakdown.rent)}</span>
                  <span>•</span>
                  <span>Condomínio: {formatCurrency(nextPayment.breakdown.condo)}</span>
                  <span>•</span>
                  <span>IPTU: {formatCurrency(nextPayment.breakdown.iptu)}</span>
                </div>

                {/* Data de vencimento */}
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Vencimento: {formatDate(nextPayment.dueDate)}
                </p>

                {/* Botões de Ação */}
                <div className="mt-6 pt-6 border-t border-slate-100 dark:border-gray-700 flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={() => nextPayment.pixCode ? copyPix(nextPayment.pixCode) : handlePayRent(nextPayment.id)}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 h-14 text-lg font-bold shadow-lg shadow-indigo-200"
                    disabled={nextPayment.status === 'PAID' || payRentMutation.isPending}
                  >
                    {payRentMutation.isPending ? (
                      <span className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Gerando...
                      </span>
                    ) : copied ? (
                      <>
                        <Check className="h-5 w-5 mr-2" />
                        Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="h-5 w-5 mr-2" />
                        Copiar Código PIX
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1 h-14 border-slate-200 text-slate-600"
                    onClick={() => nextPayment.boletoUrl && window.open(nextPayment.boletoUrl, '_blank')}
                  >
                    <FileText className="h-5 w-5 mr-2" />
                    Ver Boleto
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ============================================ */}
        {/* DADOS DO IMÓVEL */}
        {/* ============================================ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card do Imóvel */}
          <Card className="bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex gap-4">
                <div className="w-20 h-20 bg-slate-100 dark:bg-gray-700 rounded-xl overflow-hidden shrink-0 flex items-center justify-center">
                  {contract.property.coverImage ? (
                    <img
                      src={contract.property.coverImage}
                      alt={contract.property.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Building2 className="h-8 w-8 text-slate-300 dark:text-gray-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-900 dark:text-white truncate">
                    {contract.property.title}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 flex items-start gap-1 mt-1">
                    <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                    <span className="line-clamp-2">{contract.property.address}</span>
                  </p>
                  <div className="flex gap-3 mt-2 text-xs text-slate-400 dark:text-slate-500">
                    <span>{contract.property.bedrooms} quartos</span>
                    <span>•</span>
                    <span>{contract.property.area}m²</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card da Imobiliária */}
          <Card className="bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase mb-3">
                Gestão / Suporte
              </p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">{contract.agency.name}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-1">
                    <Phone className="h-3 w-3" />
                    {contract.agency.phone}
                  </p>
                </div>
                <Button
                  size="sm"
                  className="bg-emerald-500 hover:bg-emerald-600"
                  onClick={() => window.open(`https://wa.me/55${contract.agency.phone.replace(/\D/g, '')}`, '_blank')}
                >
                  <MessageCircle className="h-4 w-4 mr-1" />
                  WhatsApp
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ============================================ */}
        {/* ESTATÍSTICAS DO INQUILINO */}
        {/* ============================================ */}
        {stats && (
          <div className="grid grid-cols-3 gap-3">
            <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold">{stats.monthsOnTime}</p>
                <p className="text-xs text-emerald-100">Meses em dia</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold">{formatCurrency(stats.totalPaid)}</p>
                <p className="text-xs text-blue-100">Total pago</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
              <CardContent className="p-4 text-center">
                <p className="text-2xl font-bold">{formatCurrency(stats.cashbackBalance)}</p>
                <p className="text-xs text-purple-100">Cashback VBRZ</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* ============================================ */}
        {/* AÇÕES RÁPIDAS */}
        {/* ============================================ */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { icon: FileText, label: 'Ver Contrato', color: 'bg-blue-500', href: '/tenant/contract' },
            { icon: Wallet, label: 'Histórico', color: 'bg-emerald-500', href: '/tenant/payments' },
            { icon: TrendingUp, label: 'Reajustes', color: 'bg-purple-500', href: '#' },
            { icon: Star, label: 'Avaliar', color: 'bg-amber-500', href: '#' },
            { icon: Wrench, label: 'Manutenção', color: 'bg-red-500', href: '/tenant/support' },
          ].map((action, i) => (
            <a
              key={i}
              href={action.href}
              className="flex flex-col items-center gap-2 p-4 bg-white dark:bg-gray-800 rounded-xl border border-slate-100 dark:border-gray-700 hover:border-slate-200 dark:hover:border-gray-600 hover:shadow-sm transition-all"
            >
              <div className={`w-10 h-10 rounded-full ${action.color} flex items-center justify-center`}>
                <action.icon className="h-5 w-5 text-white" />
              </div>
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{action.label}</span>
            </a>
          ))}
        </div>

        {/* ============================================ */}
        {/* HISTÓRICO DE PAGAMENTOS */}
        {/* ============================================ */}
        <Card className="bg-white dark:bg-gray-800 shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-900 dark:text-white">Últimos Pagamentos</h3>
              <Button variant="ghost" size="sm" className="text-indigo-600" asChild>
                <a href="/tenant/payments">
                  Ver todos
                  <ChevronRight className="h-4 w-4 ml-1" />
                </a>
              </Button>
            </div>

            {paymentHistory && paymentHistory.length > 0 ? (
              <div className="space-y-3">
                {paymentHistory.slice(0, 3).map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between py-3 border-b border-slate-50 dark:border-gray-700 last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        payment.status === 'PAID' ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-amber-100 dark:bg-amber-900/30'
                      }`}>
                        {payment.status === 'PAID' ? (
                          <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">
                          {formatCurrency(payment.amount)}
                        </p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          {payment.paidAt ? `Pago em ${formatDate(payment.paidAt)}` : `Vence em ${formatDate(payment.dueDate)}`}
                        </p>
                      </div>
                    </div>
                    <Badge className={payment.status === 'PAID' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}>
                      {payment.status === 'PAID' ? 'Pago' : 'Pendente'}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                <Wallet className="h-8 w-8 mx-auto mb-2 text-slate-300 dark:text-gray-600" />
                <p className="text-sm">Nenhum pagamento registrado ainda</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ============================================ */}
        {/* SMART CONTRACT INFO */}
        {/* ============================================ */}
        {contract.contractHash && (
          <Card className="bg-slate-900 text-white border-0">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center">
                    <ShieldCheck className="h-5 w-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400 uppercase">Smart Contract Hash</p>
                    <p className="font-mono text-sm text-white truncate max-w-[200px]">
                      {contract.contractHash.slice(0, 10)}...{contract.contractHash.slice(-8)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-xs text-slate-400 uppercase">Status</p>
                    <p className="text-emerald-400 font-bold flex items-center gap-1 justify-end">
                      <Check className="h-4 w-4" />
                      ACTIVE
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-slate-400 hover:text-white"
                    onClick={() => window.open(`https://polygonscan.com/address/${contract.contractHash}`, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-4">
                Seu contrato está registrado em blockchain para maior segurança e transparência.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </TenantLayout>
  );
}
