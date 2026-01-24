// ============================================
// TENANT PORTAL - Visualização do Contrato
// CONECTADO A DADOS REAIS - ZERO MOCKS
// ============================================

import { createFileRoute } from '@tanstack/react-router';
import { TenantLayout } from '@/components/layouts/TenantLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useTenantContract } from '@/hooks/use-api';
import { toast } from 'sonner';
import {
  FileText,
  Download,
  MapPin,
  Building2,
  User,
  Phone,
  Mail,
  Shield,
  CheckCircle,
  Clock,
  Home,
  DollarSign,
  AlertCircle,
  ExternalLink,
  Copy,
  RefreshCw,
} from 'lucide-react';

export const Route = createFileRoute('/tenant/contract')({
  component: TenantContractPage,
});

// ============================================
// LOADING SKELETON
// ============================================
function ContractSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      {/* Status Card Skeleton */}
      <Skeleton className="h-40 w-full rounded-xl" />

      {/* Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="bg-white shadow-sm">
            <CardContent className="p-5 space-y-4">
              <Skeleton className="h-6 w-32" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Warranty Skeleton */}
      <Skeleton className="h-32 w-full rounded-xl" />

      {/* Blockchain Skeleton */}
      <Skeleton className="h-48 w-full rounded-xl" />
    </div>
  );
}

// ============================================
// EMPTY STATE
// ============================================
function NoContractState() {
  return (
    <div className="text-center py-16">
      <FileText className="h-16 w-16 text-slate-300 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-slate-700 mb-2">
        Nenhum contrato ativo
      </h3>
      <p className="text-slate-500 max-w-sm mx-auto">
        Você ainda não possui um contrato de locação ativo.
        Entre em contato com sua imobiliária para mais informações.
      </p>
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================
function TenantContractPage() {
  const { data: contract, isLoading, error, refetch } = useTenantContract();

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('pt-BR');

  const copyHash = async (hash: string) => {
    try {
      await navigator.clipboard.writeText(hash);
      toast.success('Hash copiado!');
    } catch {
      toast.error('Erro ao copiar');
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return { label: 'Ativo', color: 'from-emerald-500 to-teal-600', icon: CheckCircle };
      case 'PENDING':
        return { label: 'Pendente', color: 'from-amber-500 to-orange-600', icon: Clock };
      case 'EXPIRED':
        return { label: 'Expirado', color: 'from-gray-500 to-gray-600', icon: AlertCircle };
      default:
        return { label: status, color: 'from-gray-500 to-gray-600', icon: FileText };
    }
  };

  // Error State
  if (error) {
    return (
      <TenantLayout>
        <div className="md:ml-64 p-4 md:p-6">
          <div className="text-center py-16">
            <AlertCircle className="mx-auto text-red-400 mb-4" size={48} />
            <h2 className="text-xl font-bold text-slate-700">Erro ao carregar contrato</h2>
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
        {isLoading ? (
          <ContractSkeleton />
        ) : !contract ? (
          <NoContractState />
        ) : (
          <>
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileText className="h-6 w-6 text-indigo-600" />
                  Meu Contrato
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                  Contrato #{contract.id}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => refetch()}
                  disabled={isLoading}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  Atualizar
                </Button>
                {contract.pdfUrl && (
                  <Button
                    className="bg-indigo-600 hover:bg-indigo-700"
                    onClick={() => window.open(contract.pdfUrl, '_blank')}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Baixar PDF
                  </Button>
                )}
              </div>
            </div>

            {/* Status Card */}
            {(() => {
              const statusConfig = getStatusConfig(contract.status);
              const StatusIcon = statusConfig.icon;
              const totalMonthly = contract.rentAmount + contract.condoFee + contract.iptuMonthly;
              const durationMonths = Math.round(
                (new Date(contract.endDate).getTime() - new Date(contract.startDate).getTime()) /
                  (1000 * 60 * 60 * 24 * 30)
              );

              return (
                <Card className={`bg-gradient-to-r ${statusConfig.color} text-white border-0`}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
                          <StatusIcon className="h-7 w-7 text-white" />
                        </div>
                        <div>
                          <p className="text-white/80 text-sm">Status do Contrato</p>
                          <h2 className="text-2xl font-bold">{statusConfig.label}</h2>
                        </div>
                      </div>
                      <div className="text-right hidden md:block">
                        <p className="text-white/80 text-sm">Vigência</p>
                        <p className="font-medium">
                          {formatDate(contract.startDate)} - {formatDate(contract.endDate)}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-4 md:gap-6 mt-4 pt-4 border-t border-white/20 text-sm">
                      <div>
                        <p className="text-white/80">Duração</p>
                        <p className="font-medium">{durationMonths} meses</p>
                      </div>
                      <div>
                        <p className="text-white/80">Valor Mensal</p>
                        <p className="font-medium">{formatCurrency(totalMonthly)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })()}

            {/* Grid de Informações */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Valores */}
              <Card className="bg-white dark:bg-gray-800 shadow-sm">
                <CardContent className="p-5">
                  <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                    <DollarSign className="h-5 w-5 text-emerald-600" />
                    Valores Mensais
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b border-slate-100 dark:border-gray-700">
                      <span className="text-slate-600 dark:text-slate-400">Aluguel</span>
                      <span className="font-medium text-slate-900 dark:text-white">
                        {formatCurrency(contract.rentAmount)}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-100 dark:border-gray-700">
                      <span className="text-slate-600 dark:text-slate-400">Condomínio</span>
                      <span className="font-medium text-slate-900 dark:text-white">
                        {formatCurrency(contract.condoFee)}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-100 dark:border-gray-700">
                      <span className="text-slate-600 dark:text-slate-400">IPTU (mensal)</span>
                      <span className="font-medium text-slate-900 dark:text-white">
                        {formatCurrency(contract.iptuMonthly)}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 bg-indigo-50 dark:bg-indigo-900/30 -mx-5 px-5 rounded-b-lg">
                      <span className="font-bold text-indigo-900 dark:text-indigo-200">Total Mensal</span>
                      <span className="font-bold text-indigo-900 dark:text-indigo-200">
                        {formatCurrency(contract.rentAmount + contract.condoFee + contract.iptuMonthly)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Imóvel */}
              <Card className="bg-white dark:bg-gray-800 shadow-sm">
                <CardContent className="p-5">
                  <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                    <Building2 className="h-5 w-5 text-blue-600" />
                    Imóvel
                  </h3>
                  <div className="space-y-3">
                    <p className="font-medium text-slate-900 dark:text-white">
                      {contract.property.title}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 flex items-start gap-2">
                      <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                      {contract.property.address}
                    </p>
                    <div className="flex flex-wrap gap-3 text-sm text-slate-500 dark:text-slate-400 pt-2">
                      {contract.property.bedrooms > 0 && (
                        <span>{contract.property.bedrooms} quartos</span>
                      )}
                      {contract.property.bathrooms > 0 && (
                        <span>{contract.property.bathrooms} banheiro(s)</span>
                      )}
                      {contract.property.area > 0 && (
                        <span>{contract.property.area}m²</span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Imobiliária */}
              <Card className="bg-white dark:bg-gray-800 shadow-sm">
                <CardContent className="p-5">
                  <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                    <Home className="h-5 w-5 text-orange-600" />
                    Imobiliária
                  </h3>
                  <div className="space-y-2">
                    <p className="font-medium text-slate-900 dark:text-white">
                      {contract.agency.name}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      {contract.agency.phone}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      {contract.agency.email}
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Contato da Gestão */}
              <Card className="bg-white dark:bg-gray-800 shadow-sm">
                <CardContent className="p-5">
                  <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                    <User className="h-5 w-5 text-purple-600" />
                    Suporte
                  </h3>
                  <div className="space-y-3">
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Para dúvidas ou suporte, entre em contato com sua imobiliária.
                    </p>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() =>
                        window.open(
                          `https://wa.me/55${contract.agency.phone.replace(/\D/g, '')}`,
                          '_blank'
                        )
                      }
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      Falar no WhatsApp
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Smart Contract / Blockchain */}
            {contract.contractHash && (
              <Card className="bg-slate-900 text-white border-0">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold flex items-center gap-2">
                      <Shield className="h-5 w-5 text-emerald-400" />
                      Smart Contract (Blockchain)
                    </h3>
                    <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Registrado
                    </Badge>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-slate-400 uppercase mb-1">Contract Hash</p>
                      <div className="flex items-center gap-2">
                        <code className="text-sm font-mono text-white bg-slate-800 px-3 py-2 rounded-lg flex-1 truncate">
                          {contract.contractHash}
                        </code>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-slate-400 hover:text-white"
                          onClick={() => copyHash(contract.contractHash!)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-slate-400 hover:text-white"
                          onClick={() =>
                            window.open(
                              `https://polygonscan.com/address/${contract.contractHash}`,
                              '_blank'
                            )
                          }
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex gap-6">
                      <div>
                        <p className="text-xs text-slate-400 uppercase">Network</p>
                        <p className="text-white">Polygon (Mainnet)</p>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 mt-4">
                    Este contrato foi registrado em blockchain para garantir imutabilidade e
                    transparência. As assinaturas digitais têm validade jurídica conforme MP
                    2.200-2/2001.
                  </p>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </TenantLayout>
  );
}
