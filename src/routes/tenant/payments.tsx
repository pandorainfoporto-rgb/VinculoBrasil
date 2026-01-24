// ============================================
// TENANT PORTAL - Histórico de Pagamentos
// CONECTADO A DADOS REAIS - ZERO MOCKS
// ============================================

import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { TenantLayout } from '@/components/layouts/TenantLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useTenantPayments, usePayRent, type TenantPayment } from '@/hooks/use-api';
import { toast } from 'sonner';
import {
  CheckCircle,
  AlertCircle,
  Clock,
  Download,
  Eye,
  Calendar,
  CreditCard,
  TrendingUp,
  Wallet,
  Copy,
  Loader2,
  RefreshCw,
} from 'lucide-react';

export const Route = createFileRoute('/tenant/payments')({
  component: TenantPaymentsPage,
});

// ============================================
// LOADING SKELETON
// ============================================
function PaymentsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="bg-white shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-6 w-24" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="flex gap-2">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-8 w-20" />
        ))}
      </div>
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="bg-white shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Skeleton className="w-12 h-12 rounded-xl" />
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
                <Skeleton className="h-6 w-20" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ============================================
// EMPTY STATE
// ============================================
function EmptyState() {
  return (
    <div className="text-center py-16">
      <CreditCard className="h-16 w-16 text-slate-300 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-slate-700 mb-2">
        Nenhum pagamento registrado
      </h3>
      <p className="text-slate-500 max-w-sm mx-auto">
        Seus pagamentos aparecerão aqui quando houver faturas geradas.
      </p>
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================
function TenantPaymentsPage() {
  const { data, isLoading, error, refetch } = useTenantPayments();
  const payRentMutation = usePayRent();
  const [filter, setFilter] = useState<'all' | 'open' | 'paid'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const payments = data?.data || [];

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const formatDate = (dateStr: string | null) =>
    dateStr ? new Date(dateStr).toLocaleDateString('pt-BR') : '-';

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'PAID':
        return {
          label: 'Pago',
          color: 'bg-emerald-100 text-emerald-700 border-emerald-200',
          icon: CheckCircle,
        };
      case 'OVERDUE':
        return {
          label: 'Vencido',
          color: 'bg-red-100 text-red-700 border-red-200',
          icon: AlertCircle,
        };
      case 'PENDING':
      default:
        return {
          label: 'Em Aberto',
          color: 'bg-blue-100 text-blue-700 border-blue-200',
          icon: Clock,
        };
    }
  };

  const filteredPayments = payments.filter((p) => {
    if (filter === 'open') return p.status === 'PENDING' || p.status === 'OVERDUE';
    if (filter === 'paid') return p.status === 'PAID';
    return true;
  });

  const totalPaid = payments
    .filter((p) => p.status === 'PAID')
    .reduce((sum, p) => sum + p.amount, 0);

  const openAmount = payments
    .filter((p) => p.status === 'PENDING' || p.status === 'OVERDUE')
    .reduce((sum, p) => sum + p.amount, 0);

  const paidCount = payments.filter((p) => p.status === 'PAID').length;
  const adimplencia = payments.length > 0 ? Math.round((paidCount / payments.length) * 100) : 100;

  const handleGeneratePix = async (payment: TenantPayment) => {
    try {
      const result = await payRentMutation.mutateAsync(payment.id);
      if (result.pixCode) {
        await navigator.clipboard.writeText(result.pixCode);
        setCopiedId(payment.id);
        toast.success('Código PIX copiado!');
        setTimeout(() => setCopiedId(null), 3000);
      }
    } catch {
      toast.error('Erro ao gerar código PIX');
    }
  };

  const handleCopyPix = async (pixCode: string, paymentId: string) => {
    try {
      await navigator.clipboard.writeText(pixCode);
      setCopiedId(paymentId);
      toast.success('Código PIX copiado!');
      setTimeout(() => setCopiedId(null), 3000);
    } catch {
      toast.error('Erro ao copiar código');
    }
  };

  if (error) {
    return (
      <TenantLayout>
        <div className="md:ml-64 p-4 md:p-6">
          <div className="text-center py-16">
            <AlertCircle className="mx-auto text-red-400 mb-4" size={48} />
            <h2 className="text-xl font-bold text-slate-700">Erro ao carregar pagamentos</h2>
            <p className="text-slate-500 mt-2">
              {error instanceof Error ? error.message : 'Tente novamente mais tarde'}
            </p>
            <Button onClick={() => refetch()} className="mt-4">
              Tentar Novamente
            </Button>
          </div>
        </div>
      </TenantLayout>
    );
  }

  return (
    <TenantLayout>
      <div className="space-y-6 md:ml-64 p-4 md:p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Pagamentos</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">Histórico de faturas e comprovantes</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
        </div>

        {isLoading ? (
          <PaymentsSkeleton />
        ) : payments.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <Card className="bg-white dark:bg-gray-800 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                      <Wallet className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Total Pago</p>
                      <p className="text-lg font-bold text-slate-900 dark:text-white">{formatCurrency(totalPaid)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-gray-800 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Em Aberto</p>
                      <p className="text-lg font-bold text-slate-900 dark:text-white">{formatCurrency(openAmount)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-gray-800 shadow-sm col-span-2 md:col-span-1">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                      <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Adimplência</p>
                      <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{adimplencia}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex gap-2">
              {[
                { value: 'all', label: 'Todos' },
                { value: 'open', label: 'Em Aberto' },
                { value: 'paid', label: 'Pagos' },
              ].map((f) => (
                <Button
                  key={f.value}
                  variant={filter === f.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilter(f.value as typeof filter)}
                  className={filter === f.value ? 'bg-indigo-600' : ''}
                >
                  {f.label}
                </Button>
              ))}
            </div>

            <div className="space-y-3">
              {filteredPayments.map((payment) => {
                const statusInfo = getStatusInfo(payment.status);
                const StatusIcon = statusInfo.icon;
                const isOpen = payment.status === 'PENDING' || payment.status === 'OVERDUE';

                return (
                  <Card key={payment.id} className="bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            payment.status === 'PENDING' ? 'bg-blue-100 dark:bg-blue-900/30' :
                            payment.status === 'OVERDUE' ? 'bg-red-100 dark:bg-red-900/30' : 'bg-emerald-100 dark:bg-emerald-900/30'
                          }`}>
                            <StatusIcon className={`h-6 w-6 ${
                              payment.status === 'PENDING' ? 'text-blue-600 dark:text-blue-400' :
                              payment.status === 'OVERDUE' ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'
                            }`} />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white">{formatCurrency(payment.amount)}</p>
                            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
                              <Calendar className="h-3 w-3" />
                              <span>Venc: {formatDate(payment.dueDate)}</span>
                              {payment.paidAt && (
                                <>
                                  <span>•</span>
                                  <span>Pago: {formatDate(payment.paidAt)}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
                          <div className="flex gap-1">
                            {isOpen && (
                              <Button
                                size="sm"
                                onClick={() => payment.pixCode ? handleCopyPix(payment.pixCode, payment.id) : handleGeneratePix(payment)}
                                disabled={payRentMutation.isPending}
                                className="bg-indigo-600 hover:bg-indigo-700 h-9 min-w-[120px]"
                              >
                                {payRentMutation.isPending ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : copiedId === payment.id ? (
                                  <><CheckCircle className="h-4 w-4 mr-1" />Copiado!</>
                                ) : (
                                  <><Copy className="h-4 w-4 mr-1" />Pagar PIX</>
                                )}
                              </Button>
                            )}
                            <Button size="icon" variant="ghost" className="h-9 w-9 text-slate-400">
                              <Eye className="h-4 w-4" />
                            </Button>
                            {payment.status === 'PAID' && (
                              <Button size="icon" variant="ghost" className="h-9 w-9 text-slate-400">
                                <Download className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-gray-700 flex flex-wrap gap-4 text-xs text-slate-500 dark:text-slate-400">
                        <span>Aluguel: {formatCurrency(payment.breakdown.rent)}</span>
                        <span>Cond: {formatCurrency(payment.breakdown.condo)}</span>
                        <span>IPTU: {formatCurrency(payment.breakdown.iptu)}</span>
                        {payment.breakdown.extras && payment.breakdown.extras > 0 && (
                          <span>Extras: {formatCurrency(payment.breakdown.extras)}</span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {filteredPayments.length === 0 && (
              <div className="text-center py-12">
                <CreditCard className="h-12 w-12 text-slate-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-slate-500 dark:text-slate-400">Nenhum pagamento encontrado com este filtro</p>
              </div>
            )}
          </>
        )}
      </div>
    </TenantLayout>
  );
}
