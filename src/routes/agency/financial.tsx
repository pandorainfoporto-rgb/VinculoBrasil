// ============================================
// AGENCY OS - Financeiro & Splits
// Dashboard de fluxo de caixa
// ============================================

import { createFileRoute } from '@tanstack/react-router';
import { AgencyLayout } from '@/components/layouts/AgencyLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  DollarSign,
  Users,
  Building2,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  CheckCircle,
  Clock,
  AlertTriangle,
  CreditCard,
  PiggyBank,
  Banknote,
} from 'lucide-react';
import { useState } from 'react';

export const Route = createFileRoute('/agency/financial' as never)({
  component: AgencyFinancialPage,
});

// Mock de transacoes
const MOCK_TRANSACTIONS = [
  {
    id: '1',
    type: 'RENT_RECEIVED',
    description: 'Aluguel Apt 302 - Maria Silva',
    amount: 2500,
    date: '2024-01-15',
    status: 'COMPLETED',
    splitDone: true,
  },
  {
    id: '2',
    type: 'OWNER_PAYOUT',
    description: 'Repasse Joao Oliveira (Apt 302)',
    amount: -2250,
    date: '2024-01-16',
    status: 'COMPLETED',
    splitDone: true,
  },
  {
    id: '3',
    type: 'RENT_RECEIVED',
    description: 'Aluguel Casa Jardim - Carlos Lima',
    amount: 3800,
    date: '2024-01-14',
    status: 'COMPLETED',
    splitDone: true,
  },
  {
    id: '4',
    type: 'OWNER_PAYOUT',
    description: 'Repasse Ana Costa (Casa Jardim)',
    amount: -3420,
    date: '2024-01-15',
    status: 'COMPLETED',
    splitDone: true,
  },
  {
    id: '5',
    type: 'RENT_RECEIVED',
    description: 'Aluguel Kitnet Centro - Pedro',
    amount: 1200,
    date: '2024-01-13',
    status: 'PENDING',
    splitDone: false,
  },
  {
    id: '6',
    type: 'AGENT_COMMISSION',
    description: 'Comissao Carlos Mendes (30%)',
    amount: -250,
    date: '2024-01-16',
    status: 'COMPLETED',
    splitDone: true,
  },
];

function AgencyFinancialPage() {
  const [period, setPeriod] = useState('month');

  // Calculos
  const totalReceived = MOCK_TRANSACTIONS
    .filter(t => t.type === 'RENT_RECEIVED' && t.status === 'COMPLETED')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalPayouts = Math.abs(MOCK_TRANSACTIONS
    .filter(t => t.type === 'OWNER_PAYOUT' && t.status === 'COMPLETED')
    .reduce((sum, t) => sum + t.amount, 0));

  const agentCommissions = Math.abs(MOCK_TRANSACTIONS
    .filter(t => t.type === 'AGENT_COMMISSION' && t.status === 'COMPLETED')
    .reduce((sum, t) => sum + t.amount, 0));

  const netProfit = totalReceived - totalPayouts - agentCommissions;

  const pendingTransactions = MOCK_TRANSACTIONS.filter(t => t.status === 'PENDING');

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('pt-BR');

  const getTypeInfo = (type: string) => {
    switch (type) {
      case 'RENT_RECEIVED':
        return { label: 'Aluguel Recebido', color: 'text-emerald-400', icon: ArrowUpRight };
      case 'OWNER_PAYOUT':
        return { label: 'Repasse Proprietario', color: 'text-blue-400', icon: ArrowDownRight };
      case 'AGENT_COMMISSION':
        return { label: 'Comissao Corretor', color: 'text-orange-400', icon: Users };
      default:
        return { label: type, color: 'text-zinc-400', icon: DollarSign };
    }
  };

  return (
    <AgencyLayout agencyName="Minha Imobiliaria" userName="Usuario" userEmail="usuario@email.com">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
              <Wallet className="h-6 w-6 text-emerald-400" />
              Financeiro & Splits
            </h1>
            <p className="text-zinc-400 mt-1">
              Acompanhe receitas, repasses e comissoes em tempo real
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="border-zinc-700 text-zinc-400 hover:text-zinc-100">
              <Filter className="h-4 w-4 mr-2" />
              Filtrar
            </Button>
            <Button variant="outline" className="border-zinc-700 text-zinc-400 hover:text-zinc-100">
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
          </div>
        </div>

        {/* KPIs Principais */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-br from-emerald-900/30 to-emerald-800/10 border-emerald-500/30">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-lg bg-emerald-500/20">
                  <ArrowUpRight className="h-5 w-5 text-emerald-400" />
                </div>
                <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                  +12.5%
                </Badge>
              </div>
              <p className="text-2xl font-bold text-emerald-400">{formatCurrency(totalReceived)}</p>
              <p className="text-sm text-zinc-500 mt-1">Receita Total (Mes)</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-900/30 to-blue-800/10 border-blue-500/30">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-lg bg-blue-500/20">
                  <ArrowDownRight className="h-5 w-5 text-blue-400" />
                </div>
              </div>
              <p className="text-2xl font-bold text-blue-400">{formatCurrency(totalPayouts)}</p>
              <p className="text-sm text-zinc-500 mt-1">Repasses Proprietarios</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-900/30 to-orange-800/10 border-orange-500/30">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-lg bg-orange-500/20">
                  <Users className="h-5 w-5 text-orange-400" />
                </div>
              </div>
              <p className="text-2xl font-bold text-orange-400">{formatCurrency(agentCommissions)}</p>
              <p className="text-sm text-zinc-500 mt-1">Comissoes Corretores</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-zinc-800 to-zinc-900 border-zinc-700">
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-lg bg-zinc-700">
                  <PiggyBank className="h-5 w-5 text-zinc-300" />
                </div>
                <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                  Liquido
                </Badge>
              </div>
              <p className="text-2xl font-bold text-zinc-100">{formatCurrency(netProfit)}</p>
              <p className="text-sm text-zinc-500 mt-1">Lucro Agencia</p>
            </CardContent>
          </Card>
        </div>

        {/* Alerta de Pendencias */}
        {pendingTransactions.length > 0 && (
          <Card className="bg-amber-500/10 border-amber-500/30">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-500/20">
                  <Clock className="h-5 w-5 text-amber-400" />
                </div>
                <div>
                  <p className="font-medium text-amber-400">
                    {pendingTransactions.length} transacao(es) pendente(s)
                  </p>
                  <p className="text-sm text-zinc-400">
                    Aguardando confirmacao de pagamento
                  </p>
                </div>
              </div>
              <Button size="sm" className="bg-amber-600 hover:bg-amber-700">
                <RefreshCw className="h-4 w-4 mr-2" />
                Atualizar Status
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Transacoes Recentes */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-zinc-100">Ultimas Transacoes</CardTitle>
                <CardDescription className="text-zinc-500">
                  Movimentacoes de Split Automatico
                </CardDescription>
              </div>
              <div className="flex gap-2">
                {['week', 'month', 'year'].map((p) => (
                  <Button
                    key={p}
                    variant={period === p ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setPeriod(p)}
                    className={period === p ? 'bg-emerald-600' : 'text-zinc-400'}
                  >
                    {p === 'week' ? 'Semana' : p === 'month' ? 'Mes' : 'Ano'}
                  </Button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-zinc-800">
              {MOCK_TRANSACTIONS.map((tx) => {
                const typeInfo = getTypeInfo(tx.type);
                const Icon = typeInfo.icon;
                const isIncome = tx.amount > 0;

                return (
                  <div key={tx.id} className="px-6 py-4 hover:bg-zinc-800/30 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`p-2.5 rounded-lg ${
                          isIncome ? 'bg-emerald-500/10' : 'bg-zinc-800'
                        }`}>
                          <Icon className={`h-5 w-5 ${typeInfo.color}`} />
                        </div>
                        <div>
                          <p className="font-medium text-zinc-100">{tx.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline" className="text-xs border-zinc-700 text-zinc-500">
                              {typeInfo.label}
                            </Badge>
                            <span className="text-xs text-zinc-600">{formatDate(tx.date)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold text-lg ${isIncome ? 'text-emerald-400' : 'text-zinc-400'}`}>
                          {isIncome ? '+' : ''}{formatCurrency(tx.amount)}
                        </p>
                        <div className="flex items-center gap-1 justify-end mt-1">
                          {tx.status === 'COMPLETED' ? (
                            <CheckCircle className="h-3 w-3 text-emerald-400" />
                          ) : (
                            <Clock className="h-3 w-3 text-amber-400" />
                          )}
                          <span className={`text-xs ${
                            tx.status === 'COMPLETED' ? 'text-emerald-400' : 'text-amber-400'
                          }`}>
                            {tx.status === 'COMPLETED' ? 'Confirmado' : 'Pendente'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Info Card - Integracao */}
        <Card className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/20">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-purple-500/20">
                <CreditCard className="h-6 w-6 text-purple-400" />
              </div>
              <div>
                <h3 className="font-bold text-zinc-100">Split Automatico via Asaas</h3>
                <p className="text-sm text-zinc-400 mt-1">
                  Os pagamentos sao processados automaticamente. Quando o inquilino paga,
                  o sistema divide: 85% Base Imobiliaria (seu repasse e comissao) e 15% Ecossistema Vinculo.
                </p>
                <Button size="sm" variant="link" className="text-purple-400 p-0 mt-2">
                  Configurar Gateway de Pagamento →
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AgencyLayout>
  );
}
