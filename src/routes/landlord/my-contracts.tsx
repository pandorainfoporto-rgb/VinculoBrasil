// ============================================
// PAINEL DO PROPRIETÁRIO - Meus Contratos
// Self-Service de Antecipação de Recebíveis
// Conexão Real com API
// ============================================

import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { DashboardSkeleton } from '@/components/ui/loading-skeleton';
import { NoPropertiesEmpty } from '@/components/ui/empty-state';
import { useLandlordDashboard, useLandlordStatements, useCreateAnticipationOffer } from '@/hooks/use-api';
import {
  Home,
  DollarSign,
  Calendar,
  TrendingUp,
  Banknote,
  CheckCircle,
  AlertCircle,
  Building2,
  ArrowRight,
  Wallet,
  Clock,
  FileText,
} from 'lucide-react';
import { AnticipationModal } from '@/components/owner/AnticipationModal';

export const Route = createFileRoute('/landlord/my-contracts')({
  component: LandlordMyContractsPage,
});

function LandlordMyContractsPage() {
  const { data, isLoading, error } = useLandlordDashboard();
  const { data: statementsData } = useLandlordStatements();
  const createOfferMutation = useCreateAnticipationOffer();

  const [selectedContract, setSelectedContract] = useState<{
    id: string;
    property: string;
    rentValue: number;
    status: string;
  } | null>(null);
  const [isAnticipationModalOpen, setIsAnticipationModalOpen] = useState(false);

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('pt-BR');

  const handleAnticipate = (property: NonNullable<typeof data>['properties'][0]) => {
    setSelectedContract({
      id: property.contract?.id || property.id,
      property: property.title,
      rentValue: property.rentAmount,
      status: property.status,
    });
    setIsAnticipationModalOpen(true);
  };

  const handleConfirmAnticipation = async (anticipationData: { amount: number; months: number }) => {
    if (!selectedContract) return;

    try {
      await createOfferMutation.mutateAsync({
        contractId: selectedContract.id,
        amount: anticipationData.amount,
        discount: 20, // 20% de deságio padrão
      });

      toast.success('Oferta criada com sucesso! Investidores serão notificados.');
      setIsAnticipationModalOpen(false);
    } catch {
      toast.error('Erro ao criar oferta. Tente novamente.');
    }
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="max-w-6xl mx-auto">
          <DashboardSkeleton />
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="max-w-6xl mx-auto text-center py-16">
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
    );
  }

  // Empty State
  if (!data?.properties || data.properties.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
        <div className="max-w-6xl mx-auto">
          <NoPropertiesEmpty />
        </div>
      </div>
    );
  }

  const { owner, properties, stats, recentStatements } = data;
  const statements = statementsData?.data || recentStatements || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Olá, {owner.name.split(' ')[0]}! 👋
              </h1>
              <p className="text-gray-500">
                Gerencie seus imóveis e antecipe recebíveis com 1 clique
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Receita Mensal Total</p>
              <p className="text-2xl font-bold text-emerald-600">
                {formatCurrency(stats.monthlyIncome)}
              </p>
            </div>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-white border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Total de Imóveis</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalProperties}</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <Home className="h-8 w-8 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Alugados</p>
                  <p className="text-3xl font-bold text-emerald-600">{stats.rentedProperties}</p>
                </div>
                <div className="p-3 bg-emerald-50 rounded-lg">
                  <CheckCircle className="h-8 w-8 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-emerald-500 to-emerald-600 border-0 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-emerald-100 mb-1">Receita Mensal</p>
                  <p className="text-3xl font-bold">{formatCurrency(stats.monthlyIncome)}</p>
                </div>
                <div className="p-3 bg-white/20 rounded-lg">
                  <DollarSign className="h-8 w-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-gray-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Taxa Vacância</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.vacancyRate.toFixed(0)}%</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <TrendingUp className="h-8 w-8 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Imóveis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {properties.map((property) => (
            <Card key={property.id} className="bg-white border-gray-200 hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      {property.status === 'RENTED' ? (
                        <Home className="h-5 w-5 text-emerald-600" />
                      ) : (
                        <Building2 className="h-5 w-5 text-gray-400" />
                      )}
                      {property.title}
                    </CardTitle>
                    <CardDescription className="mt-1">{property.address}</CardDescription>
                  </div>
                  <Badge
                    className={
                      property.status === 'RENTED'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : property.status === 'AVAILABLE'
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                    }
                  >
                    {property.status === 'RENTED' && <CheckCircle className="h-3 w-3 mr-1" />}
                    {property.status === 'RENTED'
                      ? 'Alugado'
                      : property.status === 'AVAILABLE'
                      ? 'Disponível'
                      : 'Manutenção'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Info do Imóvel */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {property.tenant && (
                    <div>
                      <p className="text-gray-500 mb-1">Inquilino</p>
                      <p className="font-medium text-gray-900">{property.tenant.name}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-gray-500 mb-1">Valor do Aluguel</p>
                    <p className="font-bold text-emerald-600">{formatCurrency(property.rentAmount)}</p>
                  </div>
                  {property.contract && (
                    <>
                      <div>
                        <p className="text-gray-500 mb-1">Término do Contrato</p>
                        <p className="text-gray-900">{formatDate(property.contract.endDate)}</p>
                      </div>
                      <div>
                        <p className="text-gray-500 mb-1">Renda Líquida/Mês</p>
                        <p className="font-medium text-gray-900">
                          {formatCurrency(property.contract.monthlyIncome)}
                        </p>
                      </div>
                    </>
                  )}
                </div>

                {/* Card de Destaque - Antecipação (apenas para alugados) */}
                {property.status === 'RENTED' && property.contract && (
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-sm font-semibold text-blue-900">Antecipe 12 meses</p>
                      <TrendingUp className="h-4 w-4 text-blue-600" />
                    </div>
                    <p className="text-2xl font-bold text-blue-900 mb-1">
                      ~{formatCurrency(property.rentAmount * 12 * 0.8)}
                    </p>
                    <p className="text-xs text-blue-700 mb-3">
                      Receba à vista em até 24h após a venda
                    </p>
                    <Button
                      onClick={() => handleAnticipate(property)}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                      disabled={createOfferMutation.isPending}
                    >
                      <Banknote className="h-4 w-4 mr-2" />
                      Antecipar Recebíveis
                    </Button>
                  </div>
                )}

                {/* CTA para imóveis disponíveis */}
                {property.status === 'AVAILABLE' && (
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-600 mb-3">
                      Este imóvel está disponível para locação
                    </p>
                    <Button variant="outline" className="w-full">
                      Divulgar Imóvel
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Extrato de Repasses */}
        <Card className="bg-white border-gray-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Wallet className="h-5 w-5 text-emerald-600" />
                  Extrato de Repasses
                </CardTitle>
                <CardDescription>Histórico de pagamentos recebidos</CardDescription>
              </div>
              <Button variant="outline" size="sm">
                <FileText className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {statements.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Wallet className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">Nenhum repasse registrado ainda</p>
              </div>
            ) : (
              <div className="space-y-3">
                {statements.slice(0, 5).map((statement) => (
                  <div
                    key={statement.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`p-2 rounded-lg ${
                          statement.status === 'PAID' ? 'bg-emerald-100' : 'bg-yellow-100'
                        }`}
                      >
                        {statement.status === 'PAID' ? (
                          <CheckCircle className="h-5 w-5 text-emerald-600" />
                        ) : (
                          <Clock className="h-5 w-5 text-yellow-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{statement.propertyTitle}</p>
                        <p className="text-sm text-gray-500">
                          {statement.month} • {statement.paidAt ? formatDate(statement.paidAt) : 'Pendente'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-500 space-y-0.5">
                        <p>Bruto: {formatCurrency(statement.grossAmount)}</p>
                        <p>Taxa Adm: -{formatCurrency(statement.adminFee)}</p>
                        <p>Garantidor: -{formatCurrency(statement.guarantorFee)}</p>
                      </div>
                      <p className="text-lg font-bold text-emerald-600 mt-1">
                        {formatCurrency(statement.netAmount)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Footer */}
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Banknote className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-blue-900 mb-2">
                  Como funciona a antecipação de recebíveis?
                </h3>
                <ul className="space-y-1 text-sm text-blue-800">
                  <li>
                    ✅ <strong>1. Você escolhe:</strong> Selecione o contrato e simule quanto
                    receberá
                  </li>
                  <li>
                    ✅ <strong>2. Confirme:</strong> Aceite o deságio e autorize a venda
                  </li>
                  <li>
                    ✅ <strong>3. Automático:</strong> Investidores recebem notificação por
                    WhatsApp/E-mail
                  </li>
                  <li>
                    ✅ <strong>4. Receba:</strong> Dinheiro na sua conta em até 24h após a compra
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal de Antecipação Self-Service */}
      {selectedContract && (
        <AnticipationModal
          contract={selectedContract}
          isOpen={isAnticipationModalOpen}
          onClose={() => setIsAnticipationModalOpen(false)}
          onConfirm={handleConfirmAnticipation}
        />
      )}
    </div>
  );
}
