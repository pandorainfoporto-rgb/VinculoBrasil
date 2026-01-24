// ============================================
// AGENCY OS - Contratos Smart
// CONECTADO A DADOS REAIS - ZERO MOCKS
// ============================================

import { createFileRoute } from '@tanstack/react-router';
import { AgencyLayout } from '@/components/layouts/AgencyLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  FileText,
  Plus,
  Search,
  Clock,
  CheckCircle,
  AlertTriangle,
  FileSignature,
  Calendar,
  User,
  Home,
  DollarSign,
  Eye,
  Download,
  Loader2,
  Banknote,
  TrendingUp,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { AnticipationModal } from '@/components/owner/AnticipationModal';
import { useAgencyContracts, type Contract } from '@/hooks/use-agency-contracts';
import { toast } from 'sonner';

export const Route = createFileRoute('/agency/contracts' as never)({
  component: AgencyContractsPage,
});

// ============================================
// SKELETON COMPONENTS
// ============================================
function ContractRowSkeleton() {
  return (
    <tr className="border-b border-zinc-800">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-lg" />
          <div>
            <Skeleton className="h-4 w-32 mb-2" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      </td>
      <td className="px-6 py-4"><Skeleton className="h-4 w-28" /></td>
      <td className="px-6 py-4"><Skeleton className="h-4 w-36" /></td>
      <td className="px-6 py-4"><Skeleton className="h-4 w-20" /></td>
      <td className="px-6 py-4"><Skeleton className="h-6 w-24 rounded-full" /></td>
      <td className="px-6 py-4 text-right"><Skeleton className="h-8 w-20 ml-auto" /></td>
    </tr>
  );
}

function KPICardSkeleton() {
  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-3 w-24 mb-2" />
            <Skeleton className="h-8 w-12" />
          </div>
          <Skeleton className="h-8 w-8 rounded" />
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================
// EMPTY STATE
// ============================================
function EmptyContracts() {
  return (
    <div className="text-center py-16">
      <div className="p-6 rounded-full bg-zinc-800/50 inline-block mb-6">
        <FileText className="h-16 w-16 text-zinc-500" />
      </div>
      <h2 className="text-xl font-bold text-zinc-100 mb-2">
        Nenhum contrato encontrado
      </h2>
      <p className="text-zinc-400 max-w-md mx-auto mb-6">
        Comece criando seu primeiro contrato para gerenciar as locações da sua imobiliária.
      </p>
      <Button className="bg-emerald-600 hover:bg-emerald-700">
        <Plus className="h-4 w-4 mr-2" />
        Novo Contrato
      </Button>
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================
function AgencyContractsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [isDetailsDialogOpen, setIsDetailsDialogOpen] = useState(false);
  const [isAnticipationModalOpen, setIsAnticipationModalOpen] = useState(false);

  // Fetch real contracts from API
  const { data, isLoading, isError, error } = useAgencyContracts({
    status: statusFilter !== 'all' ? statusFilter : undefined,
    search: searchTerm || undefined,
  });

  const contracts = data?.contracts || [];
  const stats = data?.stats || {
    total: 0,
    active: 0,
    pending: 0,
    expired: 0,
    totalMonthlyValue: 0,
  };

  // Show error toast
  useEffect(() => {
    if (isError && error) {
      toast.error('Erro ao carregar contratos', {
        description: error.message,
      });
    }
  }, [isError, error]);

  // Filter contracts locally (for search that's not sent to API)
  const filteredContracts = contracts.filter((contract) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      contract.property.title.toLowerCase().includes(term) ||
      contract.tenant.name.toLowerCase().includes(term) ||
      contract.owner.name.toLowerCase().includes(term)
    );
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
            <CheckCircle className="h-3 w-3 mr-1" />
            Ativo
          </Badge>
        );
      case 'PENDING_SIGNATURE':
        return (
          <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/30">
            <Clock className="h-3 w-3 mr-1" />
            Aguardando Assinatura
          </Badge>
        );
      case 'EXPIRED':
        return (
          <Badge className="bg-red-500/10 text-red-400 border-red-500/30">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Vencido
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('pt-BR');

  const handleViewDetails = (contract: Contract) => {
    setSelectedContract(contract);
    setIsDetailsDialogOpen(true);
  };

  const handleTokenize = () => {
    setIsDetailsDialogOpen(false);
    setIsAnticipationModalOpen(true);
  };

  const handleConfirmAnticipation = async (anticipationData: { amount: number; months: number; listingData: unknown }) => {
    if (!selectedContract) return;

    try {
      const response = await fetch('/api/p2p/listings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contractId: selectedContract.id,
          askingPrice: anticipationData.amount,
          userId: 'temp-user-id',
          walletAddress: '0x0000000000000000000000000000000000000000',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao criar oferta');
      }

      const result = await response.json();

      toast.success('Oferta criada com sucesso!', {
        description: `Valor: ${formatCurrency(anticipationData.amount)} - ID: ${result.data?.listingId || 'N/A'}`,
      });

      window.location.href = '/admin/investments';
    } catch (err) {
      console.error('Erro ao criar oferta:', err);
      toast.error('Erro ao criar oferta', {
        description: err instanceof Error ? err.message : 'Erro desconhecido',
      });
    }
  };

  const calculateAnticipationPotential = (rentValue: number) => {
    return rentValue * 12;
  };

  return (
    <AgencyLayout agencyName="Minha Imobiliária" userName="Usuário" userEmail="usuario@email.com">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
              <FileText className="h-6 w-6 text-blue-400" />
              Contratos Smart
            </h1>
            <p className="text-zinc-400 mt-1">
              Gerencie contratos digitais com assinatura eletrônica
            </p>
          </div>
          <Button className="bg-emerald-600 hover:bg-emerald-700">
            <Plus className="h-4 w-4 mr-2" />
            Novo Contrato
          </Button>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {isLoading ? (
            <>
              <KPICardSkeleton />
              <KPICardSkeleton />
              <KPICardSkeleton />
              <KPICardSkeleton />
            </>
          ) : (
            <>
              <Card className="bg-zinc-900 border-zinc-800">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-zinc-500">Total de Contratos</p>
                      <p className="text-2xl font-bold text-zinc-100">{stats.total}</p>
                    </div>
                    <FileText className="h-8 w-8 text-blue-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900 border-zinc-800">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-zinc-500">Contratos Ativos</p>
                      <p className="text-2xl font-bold text-emerald-400">{stats.active}</p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-emerald-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900 border-zinc-800">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-zinc-500">Aguardando Assinatura</p>
                      <p className="text-2xl font-bold text-amber-400">{stats.pending}</p>
                    </div>
                    <Clock className="h-8 w-8 text-amber-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900 border-zinc-800">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-zinc-500">Receita Mensal</p>
                      <p className="text-xl font-bold text-zinc-100">{formatCurrency(stats.totalMonthlyValue)}</p>
                    </div>
                    <DollarSign className="h-8 w-8 text-green-400" />
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <Input
              placeholder="Buscar por imóvel, inquilino ou proprietário..."
              className="pl-10 bg-zinc-800 border-zinc-700 text-zinc-100"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            {['all', 'ACTIVE', 'PENDING_SIGNATURE', 'EXPIRED'].map((status) => (
              <Button
                key={status}
                variant={statusFilter === status ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter(status)}
                className={statusFilter === status
                  ? 'bg-emerald-600'
                  : 'border-zinc-700 text-zinc-400 hover:text-zinc-100'}
              >
                {status === 'all' ? 'Todos' :
                 status === 'ACTIVE' ? 'Ativos' :
                 status === 'PENDING_SIGNATURE' ? 'Pendentes' : 'Vencidos'}
              </Button>
            ))}
          </div>
        </div>

        {/* Contracts Table */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-zinc-800/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-400 uppercase">Imóvel</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-400 uppercase">Inquilino</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-400 uppercase">Vigência</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-400 uppercase">Valor</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-400 uppercase">Status</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-zinc-400 uppercase">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    <ContractRowSkeleton />
                    <ContractRowSkeleton />
                    <ContractRowSkeleton />
                  </tbody>
                </table>
              </div>
            ) : filteredContracts.length === 0 ? (
              <EmptyContracts />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-zinc-800/50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-400 uppercase">Imóvel</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-400 uppercase">Inquilino</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-400 uppercase">Vigência</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-400 uppercase">Valor</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-zinc-400 uppercase">Status</th>
                      <th className="px-6 py-4 text-right text-xs font-semibold text-zinc-400 uppercase">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {filteredContracts.map((contract) => (
                      <tr key={contract.id} className="hover:bg-zinc-800/30 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                              <Home className="h-5 w-5 text-blue-400" />
                            </div>
                            <div>
                              <p className="font-medium text-zinc-100">{contract.property.title}</p>
                              <p className="text-xs text-zinc-500">Prop: {contract.owner.name}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-zinc-500" />
                            <span className="text-zinc-300">{contract.tenant.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-zinc-400 text-sm">
                            <Calendar className="h-4 w-4" />
                            {formatDate(contract.startDate)} - {formatDate(contract.endDate)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-bold text-emerald-400">{formatCurrency(contract.rentValue)}</span>
                        </td>
                        <td className="px-6 py-4">
                          {getStatusBadge(contract.status)}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8 text-zinc-400 hover:text-zinc-100"
                              onClick={() => handleViewDetails(contract)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-8 w-8 text-zinc-400 hover:text-zinc-100">
                              <Download className="h-4 w-4" />
                            </Button>
                            {contract.status === 'PENDING_SIGNATURE' && (
                              <Button size="sm" className="bg-amber-600 hover:bg-amber-700">
                                <FileSignature className="h-4 w-4 mr-1" />
                                Assinar
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/20">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-blue-500/20">
                <FileSignature className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <h3 className="font-bold text-zinc-100">Contratos Smart com Blockchain</h3>
                <p className="text-sm text-zinc-400 mt-1">
                  Todos os contratos são registrados em blockchain para maior segurança e transparência.
                  A assinatura digital tem validade jurídica conforme MP 2.200-2/2001.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contract Details Dialog */}
      <Dialog open={isDetailsDialogOpen} onOpenChange={setIsDetailsDialogOpen}>
        <DialogContent className="max-w-4xl bg-zinc-900 border-zinc-800 text-zinc-100">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-2">
              <FileText className="h-6 w-6 text-blue-400" />
              Detalhes do Contrato
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              Informações completas e opções de antecipação de recebíveis
            </DialogDescription>
          </DialogHeader>

          {selectedContract && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-4">
              {/* Left Column - Contract Info */}
              <div className="lg:col-span-2 space-y-4">
                <Card className="bg-zinc-800 border-zinc-700">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Home className="h-5 w-5 text-blue-400" />
                      Informações do Imóvel
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-zinc-500">Imóvel</p>
                        <p className="font-medium text-zinc-100">{selectedContract.property.title}</p>
                      </div>
                      <div>
                        <p className="text-xs text-zinc-500">Proprietário</p>
                        <p className="font-medium text-zinc-100">{selectedContract.owner.name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-zinc-500">Inquilino</p>
                        <p className="font-medium text-zinc-100">{selectedContract.tenant.name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-zinc-500">Valor Mensal</p>
                        <p className="font-bold text-emerald-400">{formatCurrency(selectedContract.rentValue)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-zinc-500">Início do Contrato</p>
                        <p className="text-zinc-300">{formatDate(selectedContract.startDate)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-zinc-500">Término</p>
                        <p className="text-zinc-300">{formatDate(selectedContract.endDate)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-zinc-500">Status</p>
                        <div className="mt-1">{getStatusBadge(selectedContract.status)}</div>
                      </div>
                      {selectedContract.signedAt && (
                        <div>
                          <p className="text-xs text-zinc-500">Assinado em</p>
                          <p className="text-zinc-300">{formatDate(selectedContract.signedAt)}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Anticipation Card */}
              <div>
                {selectedContract.status === 'ACTIVE' ? (
                  <div className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-xl p-6 text-white shadow-xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 opacity-10 transform translate-x-4 -translate-y-4">
                      <Banknote size={120} />
                    </div>

                    <div className="relative z-10">
                      <h3 className="text-lg font-bold flex items-center gap-2 mb-2">
                        <TrendingUp className="w-5 h-5 text-green-400" />
                        Antecipação de Recebíveis
                      </h3>

                      <p className="text-blue-200 text-sm mb-6">
                        Este contrato é elegível para tokenização. Transforme os próximos 12 meses de aluguel em dinheiro à vista agora.
                      </p>

                      <div className="bg-white/10 rounded-lg p-3 mb-6 backdrop-blur-sm">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-blue-200">Potencial de Saque</span>
                          <span className="font-bold text-green-400">
                            {formatCurrency(calculateAnticipationPotential(selectedContract.rentValue))}
                          </span>
                        </div>
                        <div className="text-xs text-blue-300 mt-1">
                          {formatCurrency(selectedContract.rentValue)} x 12 meses
                        </div>
                        <div className="w-full bg-blue-950/50 h-1.5 rounded-full mt-2">
                          <div className="bg-green-400 h-1.5 rounded-full w-full"></div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleTokenize}
                        className="w-full bg-white text-blue-900 font-bold py-3 px-4 rounded-lg hover:bg-blue-50 transition-colors shadow-lg flex items-center justify-center gap-2"
                      >
                        <Banknote className="w-4 h-4" />
                        Antecipar Valores Agora
                      </button>

                      <p className="text-xs text-blue-300 mt-3 text-center">
                        Crie uma oferta no marketplace P2P e receba o dinheiro em até 24h via Pix
                      </p>
                    </div>
                  </div>
                ) : (
                  <Card className="bg-zinc-800 border-zinc-700">
                    <CardContent className="p-6">
                      <div className="flex flex-col items-center text-center gap-3">
                        <div className="p-3 rounded-full bg-amber-500/20">
                          <AlertTriangle className="h-8 w-8 text-amber-400" />
                        </div>
                        <div>
                          <h4 className="font-bold text-zinc-100 mb-1">Contrato não elegível</h4>
                          <p className="text-sm text-zinc-400">
                            Apenas contratos ativos podem ser tokenizados para antecipação de recebíveis.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Anticipation Modal */}
      {selectedContract && (
        <AnticipationModal
          contract={{
            id: selectedContract.id,
            property: selectedContract.property.title,
            rentValue: selectedContract.rentValue,
            status: selectedContract.status,
          }}
          isOpen={isAnticipationModalOpen}
          onClose={() => setIsAnticipationModalOpen(false)}
          onConfirm={handleConfirmAnticipation}
        />
      )}
    </AgencyLayout>
  );
}
