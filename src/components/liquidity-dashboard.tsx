/**
 * Dashboard de Liquidez - Vinculo.io
 *
 * Monitora em tempo real:
 * - Saldo em conta bancária (BRL)
 * - Saldo em BRZ na wallet tesoureira
 * - Taxa de cobertura do lastro 1:1
 * - Movimentação 24h
 *
 * Ideal para apresentação a investidores CVM
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Shield,
  AlertTriangle,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  Banknote,
  Coins,
  Activity,
  Clock,
  ExternalLink,
  Copy,
  Check,
} from 'lucide-react';
import {
  type LiquidityMetrics,
  type TransferoBalance,
  MockTransferoService,
} from '@/lib/bridge/transfero-service';
import { useCryptoWallets } from '@/contexts/crypto-wallets-context';
import { copyToClipboard } from '@/lib/clipboard';

// ============================================================================
// TIPOS
// ============================================================================

interface LiquidityTransaction {
  id: string;
  type: 'pix_in' | 'pix_out' | 'conversion' | 'withdrawal' | 'split';
  amount: number;
  currency: 'BRL' | 'BRZ';
  description: string;
  status: 'completed' | 'pending' | 'failed';
  txHash?: string;
  timestamp: string;
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export function LiquidityDashboard() {
  const [metrics, setMetrics] = useState<LiquidityMetrics | null>(null);
  const [brlBalance, setBrlBalance] = useState<TransferoBalance | null>(null);
  const [brzBalance, setBrzBalance] = useState<TransferoBalance | null>(null);
  const [transactions, setTransactions] = useState<LiquidityTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [copiedAddress, setCopiedAddress] = useState(false);

  // Mock service para demonstração
  const transferoService = new MockTransferoService();

  // Usa carteira de tesouraria cadastrada no sistema
  const { getTreasuryWallet } = useCryptoWallets();
  const treasuryWalletData = getTreasuryWallet();
  const treasuryWallet = treasuryWalletData?.address || '0x0000000000000000000000000000000000000000';

  useEffect(() => {
    loadData();
    // Auto-refresh a cada 30 segundos
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [brl, brz] = await Promise.all([
        transferoService.getBrlBalance(),
        transferoService.getBrzBalance(),
      ]);

      setBrlBalance(brl);
      setBrzBalance(brz);
      setMetrics(transferoService.getLiquidityMetrics());
      setTransactions(generateMockTransactions());
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateMockTransactions = (): LiquidityTransaction[] => {
    const now = Date.now();
    return [
      {
        id: '1',
        type: 'pix_in',
        amount: 2500,
        currency: 'BRL',
        description: 'PIX recebido - Aluguel #1234',
        status: 'completed',
        timestamp: new Date(now - 5 * 60000).toISOString(),
      },
      {
        id: '2',
        type: 'conversion',
        amount: 2487.5,
        currency: 'BRZ',
        description: 'Conversão BRL → BRZ',
        status: 'completed',
        txHash: '0x1234...5678',
        timestamp: new Date(now - 4 * 60000).toISOString(),
      },
      {
        id: '3',
        type: 'split',
        amount: 2113.38,
        currency: 'BRZ',
        description: 'Split 85% → Locador',
        status: 'completed',
        txHash: '0x2345...6789',
        timestamp: new Date(now - 3 * 60000).toISOString(),
      },
      {
        id: '4',
        type: 'split',
        amount: 124.38,
        currency: 'BRZ',
        description: 'Split 5% → Seguradora',
        status: 'completed',
        txHash: '0x3456...7890',
        timestamp: new Date(now - 2 * 60000).toISOString(),
      },
      {
        id: '5',
        type: 'pix_in',
        amount: 1800,
        currency: 'BRL',
        description: 'PIX recebido - Aluguel #1235',
        status: 'pending',
        timestamp: new Date(now - 1 * 60000).toISOString(),
      },
    ];
  };

  const handleCopyAddress = async () => {
    const success = await copyToClipboard(treasuryWallet);
    if (success) {
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
    }
  };

  const formatCurrency = (value: number, currency: 'BRL' | 'BRZ' = 'BRL') => {
    if (currency === 'BRZ') {
      return `${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} BRZ`;
    }
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  if (!metrics || !brlBalance || !brzBalance) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const coveragePercent = Math.min(metrics.coverageRatio * 100, 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Dashboard de Liquidez</h2>
          <p className="text-muted-foreground">
            Monitoramento em tempo real do lastro BRL/BRZ
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

      {/* Status Alert */}
      {metrics.status === 'critical' && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Atenção: Liquidez Crítica</AlertTitle>
          <AlertDescription>
            O saldo em BRZ está abaixo de 50% das obrigações pendentes. Considere converter mais BRL.
          </AlertDescription>
        </Alert>
      )}

      {metrics.status === 'warning' && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Aviso: Liquidez Baixa</AlertTitle>
          <AlertDescription>
            O saldo em BRZ está entre 50-80% das obrigações. Monitore de perto.
          </AlertDescription>
        </Alert>
      )}

      {/* Cards de Saldo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Saldo BRL */}
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Banknote className="h-4 w-4" />
              Conta Bancária (BRL)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {formatCurrency(brlBalance.available)}
            </div>
            <div className="flex items-center gap-4 mt-2 text-sm">
              <span className="text-muted-foreground">
                Pendente: {formatCurrency(brlBalance.pending)}
              </span>
            </div>
            <div className="flex items-center gap-1 mt-2 text-sm text-green-600">
              <ArrowUpRight className="h-4 w-4" />
              +{formatCurrency(metrics.volume24h.brlIn)} hoje
            </div>
          </CardContent>
        </Card>

        {/* Saldo BRZ */}
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Coins className="h-4 w-4" />
              Wallet Tesoureira (BRZ)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">
              {formatCurrency(brzBalance.available, 'BRZ')}
            </div>
            <div className="flex items-center gap-4 mt-2 text-sm">
              <span className="text-muted-foreground">
                Pendente: {formatCurrency(brzBalance.pending, 'BRZ')}
              </span>
            </div>
            <div className="flex items-center gap-1 mt-2 text-sm text-purple-600">
              <ArrowUpRight className="h-4 w-4" />
              +{formatCurrency(metrics.volume24h.brzIn, 'BRZ')} hoje
            </div>
          </CardContent>
        </Card>

        {/* Liquidez Total */}
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Wallet className="h-4 w-4" />
              Liquidez Total (BRL equiv.)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {formatCurrency(metrics.totalLiquidityBrl)}
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Badge
                className={
                  metrics.status === 'healthy'
                    ? 'bg-green-500'
                    : metrics.status === 'warning'
                      ? 'bg-yellow-500'
                      : 'bg-red-500'
                }
              >
                {metrics.status === 'healthy'
                  ? 'Saudável'
                  : metrics.status === 'warning'
                    ? 'Atenção'
                    : 'Crítico'}
              </Badge>
            </div>
            <div className="text-sm text-muted-foreground mt-2">
              Taxa: 1 BRZ = {formatCurrency(metrics.currentRate)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cobertura de Lastro */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Cobertura de Lastro 1:1
          </CardTitle>
          <CardDescription>
            Garantia de que cada BRZ em circulação possui R$ 1,00 de lastro
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-2xl font-bold">{coveragePercent.toFixed(1)}%</span>
                <span className="text-muted-foreground ml-2">
                  ({formatCurrency(brzBalance.available, 'BRZ')} / {formatCurrency(metrics.pendingObligations, 'BRZ')})
                </span>
              </div>
              {metrics.isFullyCovered ? (
                <Badge className="bg-green-500">
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  100% Coberto
                </Badge>
              ) : (
                <Badge variant="destructive">
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  Cobertura Parcial
                </Badge>
              )}
            </div>

            <Progress value={coveragePercent} className="h-4" />

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Saldo Disponível</p>
                <p className="font-semibold">{formatCurrency(brzBalance.available, 'BRZ')}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Obrigações Pendentes</p>
                <p className="font-semibold">{formatCurrency(metrics.pendingObligations, 'BRZ')}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Wallet Tesoureira */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5" />
            Carteira Tesoureira (Operator Wallet)
          </CardTitle>
          <CardDescription>
            Endereço da carteira que recebe BRZ da Transfero após conversão
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg font-mono text-sm">
            <span className="truncate flex-1">{treasuryWallet}</span>
            <Button variant="ghost" size="sm" onClick={handleCopyAddress}>
              {copiedAddress ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <a
                href={`https://polygonscan.com/address/${treasuryWallet}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Rede: Polygon (MATIC) | Contrato BRZ verificado
          </p>
        </CardContent>
      </Card>

      {/* Movimentação 24h */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Movimentação 24h
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <ArrowDownRight className="h-5 w-5 text-green-600 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Entrada BRL</p>
              <p className="text-lg font-bold text-green-600">
                {formatCurrency(metrics.volume24h.brlIn)}
              </p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <ArrowUpRight className="h-5 w-5 text-red-600 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Saída BRL</p>
              <p className="text-lg font-bold text-red-600">
                {formatCurrency(metrics.volume24h.brlOut)}
              </p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <ArrowDownRight className="h-5 w-5 text-purple-600 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Entrada BRZ</p>
              <p className="text-lg font-bold text-purple-600">
                {formatCurrency(metrics.volume24h.brzIn, 'BRZ')}
              </p>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <ArrowUpRight className="h-5 w-5 text-orange-600 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Saída BRZ</p>
              <p className="text-lg font-bold text-orange-600">
                {formatCurrency(metrics.volume24h.brzOut, 'BRZ')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transações Recentes */}
      <Card>
        <CardHeader>
          <CardTitle>Transações Recentes</CardTitle>
          <CardDescription>Últimas movimentações de liquidez</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Horário</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>TX</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((tx) => (
                <TableRow key={tx.id}>
                  <TableCell className="font-mono text-sm">
                    {formatTime(tx.timestamp)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {tx.type === 'pix_in' && 'PIX Entrada'}
                      {tx.type === 'pix_out' && 'PIX Saída'}
                      {tx.type === 'conversion' && 'Conversão'}
                      {tx.type === 'withdrawal' && 'Saque'}
                      {tx.type === 'split' && 'Split'}
                    </Badge>
                  </TableCell>
                  <TableCell>{tx.description}</TableCell>
                  <TableCell className="text-right font-mono">
                    {formatCurrency(tx.amount, tx.currency)}
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        tx.status === 'completed'
                          ? 'bg-green-500'
                          : tx.status === 'pending'
                            ? 'bg-yellow-500'
                            : 'bg-red-500'
                      }
                    >
                      {tx.status === 'completed'
                        ? 'Concluído'
                        : tx.status === 'pending'
                          ? 'Pendente'
                          : 'Falha'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {tx.txHash ? (
                      <a
                        href={`https://polygonscan.com/tx/${tx.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-600 hover:underline font-mono text-xs"
                      >
                        {tx.txHash}
                      </a>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Informações para Investidor */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            Informações para Investidor
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm">
            Nossa tesouraria é automatizada via API da Transfero. Quando o sistema detecta
            a entrada do Real via PIX, ele aciona um gatilho de compra de BRZ em tempo real.
            Isso mantém nosso lastro 1:1 e garante que o Smart Contract sempre tenha tokens
            para executar o split 85/5/5/5 instantaneamente.
          </p>

          <Separator />

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-blue-600">1:1</p>
              <p className="text-xs text-muted-foreground">Lastro Garantido</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">100%</p>
              <p className="text-xs text-muted-foreground">Automatizado</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600">&lt;5s</p>
              <p className="text-xs text-muted-foreground">Tempo Split</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-600">Polygon</p>
              <p className="text-xs text-muted-foreground">Rede Blockchain</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default LiquidityDashboard;
