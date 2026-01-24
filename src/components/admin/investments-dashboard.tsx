// ============================================
// Mesa de Operações DeFi - Gestão de Investimentos
// CONECTADO AO BACKEND REAL - Sem dados mockados
// ============================================

import { Tag, CheckCircle, Clock, Banknote, TrendingUp, Users, Wallet, AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useP2PListings, useP2PStats } from '@/hooks/use-p2p-marketplace';
import { Link } from '@tanstack/react-router';

// ============================================
// HELPERS
// ============================================

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

const getStatusBadge = (status: string) => {
  switch (status) {
    case 'ACTIVE':
      return (
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-700">
          <Tag className="w-3 h-3 mr-1" />À Venda
        </Badge>
      );
    case 'SOLD':
      return (
        <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-700">
          <Clock className="w-3 h-3 mr-1" />
          Aguardando Liq.
        </Badge>
      );
    case 'SETTLED':
      return (
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-700">
          <CheckCircle className="w-3 h-3 mr-1" />
          Finalizado
        </Badge>
      );
    default:
      return null;
  }
};

// ============================================
// MAIN COMPONENT
// ============================================

export function InvestmentsDashboard() {
  // DADOS REAIS VIA HOOKS
  const { data: listingsData, isLoading: isLoadingListings, refetch: refetchListings } = useP2PListings();
  const { data: stats, isLoading: isLoadingStats, refetch: refetchStats } = useP2PStats();

  const listings = listingsData?.listings || [];
  const isLoading = isLoadingListings || isLoadingStats;

  const handleRefresh = () => {
    refetchListings();
    refetchStats();
  };

  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <Wallet className="w-8 h-8 text-blue-500" />
                Mesa de Operações (DeFi)
              </h1>
              <p className="text-zinc-400 mt-1">
                Gerencie ofertas, vendas e liquidação financeira do marketplace P2P
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleRefresh}
                disabled={isLoading}
                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Atualizar
              </Button>
              <Link to="/p2p">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Ver Marketplace P2P
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Cards de Estatísticas - DADOS REAIS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {/* Card 1: Total em Oferta */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-zinc-400 mb-1">Volume em Oferta</p>
                  <h3 className="text-2xl font-bold text-white">
                    {isLoadingStats ? (
                      <Loader2 className="w-6 h-6 animate-spin text-zinc-500" />
                    ) : (
                      formatCurrency(stats?.totalVolume || 0)
                    )}
                  </h3>
                  <span className="text-xs text-green-500 font-medium mt-1 inline-block">
                    {stats?.activeListings || 0} ofertas ativas
                  </span>
                </div>
                <div className="p-3 bg-blue-500/10 rounded-lg text-blue-500">
                  <Banknote className="w-5 h-5" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Captado (Vendido) */}
          <Card className="bg-gradient-to-r from-green-600 to-green-700 text-white border-0">
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-green-100 mb-1">Capital Captado (Pix)</p>
                  <h3 className="text-2xl font-bold">
                    {isLoadingStats ? (
                      <Loader2 className="w-6 h-6 animate-spin text-green-200" />
                    ) : (
                      formatCurrency(stats?.totalVolume || 0)
                    )}
                  </h3>
                  <span className="text-xs text-green-100 mt-1 inline-block">
                    {stats?.totalSales || 0} vendas realizadas
                  </span>
                </div>
                <div className="p-3 bg-white/20 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 3: Ofertas */}
          <Card className="bg-zinc-900 border-zinc-800">
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-zinc-400 mb-1">Total de Ofertas</p>
                  <h3 className="text-2xl font-bold text-white">
                    {isLoadingStats ? (
                      <Loader2 className="w-6 h-6 animate-spin text-zinc-500" />
                    ) : (
                      stats?.totalListings || 0
                    )}
                  </h3>
                  <span className="text-xs text-zinc-500 mt-1 inline-block">
                    Desconto médio: {stats?.averageDiscount?.toFixed(1) || 0}%
                  </span>
                </div>
                <div className="p-3 bg-purple-500/10 rounded-lg text-purple-500">
                  <Users className="w-5 h-5" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card 4: Botão de Ação Rápida */}
          <Link to="/p2p" className="block">
            <Card className="bg-blue-600 hover:bg-blue-700 transition-colors cursor-pointer border-0 h-full">
              <CardContent className="pt-6 flex flex-col justify-center items-center h-full text-white">
                <TrendingUp className="w-8 h-8 mb-2" />
                <span className="font-bold text-lg">Ver Ofertas</span>
                <span className="text-xs opacity-90">Marketplace P2P</span>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Tabela de Gestão - DADOS REAIS */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-white">Ofertas de Investimento</CardTitle>
            <CardDescription className="text-zinc-400">
              Visualize e gerencie todas as ofertas, vendas e liquidações do marketplace
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingListings ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
                <span className="ml-3 text-zinc-400">Carregando ofertas...</span>
              </div>
            ) : listings.length === 0 ? (
              <div className="text-center py-12">
                <Wallet className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-zinc-300 mb-2">Nenhuma oferta cadastrada</h3>
                <p className="text-zinc-500 mb-4">
                  Proprietários e imobiliárias podem criar ofertas em seus painéis
                </p>
                <Link to="/p2p">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Ver Marketplace P2P
                  </Button>
                </Link>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-zinc-800">
                    <TableHead className="text-zinc-400">Cidade</TableHead>
                    <TableHead className="text-zinc-400">Valor Face</TableHead>
                    <TableHead className="text-zinc-400">Preço Venda</TableHead>
                    <TableHead className="text-zinc-400">Desconto</TableHead>
                    <TableHead className="text-zinc-400">Score Inquilino</TableHead>
                    <TableHead className="text-zinc-400">Meses</TableHead>
                    <TableHead className="text-right text-zinc-400">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {listings.map((item) => (
                    <TableRow key={item.id} className="hover:bg-zinc-800 border-zinc-800">
                      <TableCell className="font-medium text-white">
                        {item.city}, {item.state}
                      </TableCell>
                      <TableCell className="font-mono text-zinc-300">
                        {formatCurrency(item.faceValue)}
                      </TableCell>
                      <TableCell className="font-mono text-green-400">
                        {formatCurrency(item.askingPrice)}
                      </TableCell>
                      <TableCell className="text-blue-400">
                        {item.discountPercent.toFixed(1)}%
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            (item.tenantScore || 0) >= 80
                              ? 'bg-green-500/10 text-green-400 border-green-700'
                              : (item.tenantScore || 0) >= 60
                                ? 'bg-yellow-500/10 text-yellow-400 border-yellow-700'
                                : 'bg-red-500/10 text-red-400 border-red-700'
                          }
                        >
                          {item.tenantScore || 'N/A'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-zinc-400">{item.monthsRemaining}</TableCell>
                      <TableCell className="text-right">
                        <Link to={`/p2p`}>
                          <Button variant="ghost" size="sm" className="text-blue-400 hover:text-blue-300">
                            Ver Detalhes
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Info Footer */}
        <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-200">
              <p className="font-semibold mb-1">Central de Controle DeFi</p>
              <p className="text-blue-300">
                Esta é a visão administrativa do marketplace P2P. Os investidores acessam as ofertas
                pela rota pública <code className="bg-blue-500/20 px-1 rounded">/p2p</code>. Aqui você
                controla toda a operação, cria novas ofertas e gerencia liquidações.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================
// WIDGET COMPACTO (Para Dashboard Principal)
// TAMBÉM CONECTADO AOS DADOS REAIS
// ============================================

export function DefiWidget() {
  const { data: stats, isLoading } = useP2PStats();

  return (
    <div className="mb-8">
      <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        <Wallet className="w-6 h-6 text-blue-500" />
        Mesa de Operações (DeFi)
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Card 1: Total em Oferta */}
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-zinc-400">Volume em Oferta</p>
              <h3 className="text-2xl font-bold text-white">
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-zinc-500" />
                ) : (
                  formatCurrency(stats?.totalVolume || 0)
                )}
              </h3>
            </div>
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
              <Banknote className="w-5 h-5" />
            </div>
          </div>
          <span className="text-xs text-green-500 font-medium">
            {stats?.activeListings || 0} ofertas ativas
          </span>
        </div>

        {/* Card 2: Captado (Vendido) */}
        <div className="bg-gradient-to-r from-green-600 to-green-700 p-4 rounded-xl text-white">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-green-100">Capital Captado</p>
              <h3 className="text-2xl font-bold">
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-green-200" />
                ) : (
                  formatCurrency(stats?.totalVolume || 0)
                )}
              </h3>
            </div>
            <div className="p-2 bg-white/20 rounded-lg">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
          </div>
          <span className="text-xs text-green-100">{stats?.totalSales || 0} vendas</span>
        </div>

        {/* Card 3: Ofertas */}
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-zinc-400">Total Ofertas</p>
              <h3 className="text-2xl font-bold text-white">
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-zinc-500" />
                ) : (
                  stats?.totalListings || 0
                )}
              </h3>
            </div>
            <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <span className="text-xs text-zinc-500">
            Desc. médio: {stats?.averageDiscount?.toFixed(1) || 0}%
          </span>
        </div>

        {/* Card 4: Botão de Ação Rápida */}
        <Link
          to="/admin/investments"
          className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-xl transition-all flex flex-col justify-center items-center gap-2"
        >
          <Wallet className="w-6 h-6" />
          <span className="font-bold">Gerenciar</span>
          <span className="text-xs opacity-80">Mesa de Operações</span>
        </Link>
      </div>
    </div>
  );
}
