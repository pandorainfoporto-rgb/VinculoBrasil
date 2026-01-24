// =============================================================================
// TokenRewards - Historico de Recompensas e Cashback VBRz
// =============================================================================

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Home,
  Shield,
  Users,
  Gift,
  Wrench,
  Star,
  ShoppingBag,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  XCircle,
  ExternalLink,
  ChevronRight,
  Coins,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  type CashbackTransaction,
  type CashbackType,
  type TokenTransactionType,
  CASHBACK_TYPE_LABELS,
  formatVBRz,
  vbrzToBRL,
} from '@/lib/tokenomics-types';

// =============================================================================
// TIPOS
// =============================================================================

interface TokenRewardsProps {
  transactions?: CashbackTransaction[];
  onViewDetails?: (transactionId: string) => void;
  onViewPolygonScan?: (txHash: string) => void;
  className?: string;
}

// =============================================================================
// DADOS MOCK
// =============================================================================

const mockTransactions: CashbackTransaction[] = [
  {
    id: 'tx-001',
    userId: 'user-123',
    walletAddress: '0x1234...5678',
    type: 'RENT_PAYMENT',
    referenceType: 'payment',
    referenceId: 'pay-dec-2024',
    originalAmountBRL: 1500,
    cashbackRate: 0.01,
    cashbackAmountVBRz: 18,
    cashbackValueBRL: 1.8,
    loyaltyBonus: 1.2,
    bonusAmountVBRz: 3.6,
    status: 'confirmed',
    txHash: '0xabc123def456...',
    blockNumber: 12345678,
    createdAt: new Date('2024-12-05T10:30:00'),
    processedAt: new Date('2024-12-05T10:30:05'),
    confirmedAt: new Date('2024-12-05T10:30:10'),
  },
  {
    id: 'tx-002',
    userId: 'user-123',
    walletAddress: '0x1234...5678',
    type: 'REFERRAL',
    referenceType: 'referral',
    referenceId: 'ref-maria-silva',
    originalAmountBRL: 0,
    cashbackRate: 0,
    cashbackAmountVBRz: 500,
    cashbackValueBRL: 50,
    loyaltyBonus: 1,
    bonusAmountVBRz: 0,
    status: 'confirmed',
    txHash: '0xdef789abc012...',
    blockNumber: 12345500,
    createdAt: new Date('2024-11-20T14:00:00'),
    processedAt: new Date('2024-11-20T14:00:05'),
    confirmedAt: new Date('2024-11-20T14:00:10'),
  },
  {
    id: 'tx-003',
    userId: 'user-123',
    walletAddress: '0x1234...5678',
    type: 'RENT_PAYMENT',
    referenceType: 'payment',
    referenceId: 'pay-nov-2024',
    originalAmountBRL: 1500,
    cashbackRate: 0.01,
    cashbackAmountVBRz: 18,
    cashbackValueBRL: 1.8,
    loyaltyBonus: 1.2,
    bonusAmountVBRz: 3.6,
    status: 'confirmed',
    txHash: '0x123456789abc...',
    createdAt: new Date('2024-11-05T09:15:00'),
    processedAt: new Date('2024-11-05T09:15:05'),
    confirmedAt: new Date('2024-11-05T09:15:10'),
  },
  {
    id: 'tx-004',
    userId: 'user-123',
    walletAddress: '0x1234...5678',
    type: 'INSURANCE_BONUS',
    referenceType: 'insurance',
    referenceId: 'ins-fianca-001',
    originalAmountBRL: 800,
    cashbackRate: 0.02,
    cashbackAmountVBRz: 160,
    cashbackValueBRL: 16,
    loyaltyBonus: 1.2,
    bonusAmountVBRz: 32,
    status: 'confirmed',
    txHash: '0x789abcdef012...',
    createdAt: new Date('2024-10-15T16:45:00'),
    processedAt: new Date('2024-10-15T16:45:05'),
    confirmedAt: new Date('2024-10-15T16:45:10'),
  },
  {
    id: 'tx-005',
    userId: 'user-123',
    walletAddress: '0x1234...5678',
    type: 'SERVICE_HIRE',
    referenceType: 'service',
    referenceId: 'srv-pintura-001',
    originalAmountBRL: 350,
    cashbackRate: 0.01,
    cashbackAmountVBRz: 35,
    cashbackValueBRL: 3.5,
    loyaltyBonus: 1.2,
    bonusAmountVBRz: 7,
    status: 'confirmed',
    txHash: '0xfedcba987654...',
    createdAt: new Date('2024-10-01T11:20:00'),
    processedAt: new Date('2024-10-01T11:20:05'),
    confirmedAt: new Date('2024-10-01T11:20:10'),
  },
];

// =============================================================================
// COMPONENTE PRINCIPAL
// =============================================================================

export function TokenRewards({
  transactions = mockTransactions,
  onViewDetails,
  onViewPolygonScan,
  className,
}: TokenRewardsProps) {
  const [activeTab, setActiveTab] = useState<'all' | 'rent' | 'referral' | 'other'>('all');

  // Filtra transacoes por tipo
  const filteredTransactions = transactions.filter((tx) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'rent') return tx.type === 'RENT_PAYMENT';
    if (activeTab === 'referral') return tx.type === 'REFERRAL';
    return !['RENT_PAYMENT', 'REFERRAL'].includes(tx.type);
  });

  // Calcula totais
  const totalCashback = transactions.reduce((sum, tx) => sum + tx.cashbackAmountVBRz, 0);
  const totalBRL = transactions.reduce((sum, tx) => sum + tx.cashbackValueBRL, 0);

  const handleViewPolygonScan = (txHash: string) => {
    if (onViewPolygonScan) {
      onViewPolygonScan(txHash);
    } else {
      window.open(`https://polygonscan.com/tx/${txHash}`, '_blank');
    }
  };

  return (
    <Card className={cn('', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-primary/10 p-2">
              <Gift className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Recompensas VBRz</CardTitle>
              <CardDescription>Historico de cashback e bonus</CardDescription>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-primary">
              +{formatVBRz(totalCashback)} VBRz
            </p>
            <p className="text-sm text-muted-foreground">
              ≈ R$ {totalBRL.toFixed(2)} total
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Tabs de filtro */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="all" className="gap-1.5">
              <Coins className="h-4 w-4" />
              <span className="hidden sm:inline">Todas</span>
            </TabsTrigger>
            <TabsTrigger value="rent" className="gap-1.5">
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">Aluguel</span>
            </TabsTrigger>
            <TabsTrigger value="referral" className="gap-1.5">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Indicacao</span>
            </TabsTrigger>
            <TabsTrigger value="other" className="gap-1.5">
              <Sparkles className="h-4 w-4" />
              <span className="hidden sm:inline">Outros</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Lista de transacoes */}
        <div className="space-y-3">
          {filteredTransactions.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              Nenhuma recompensa encontrada
            </div>
          ) : (
            filteredTransactions.map((tx) => (
              <TransactionItem
                key={tx.id}
                transaction={tx}
                onViewPolygonScan={() => tx.txHash && handleViewPolygonScan(tx.txHash)}
                onViewDetails={() => onViewDetails?.(tx.id)}
              />
            ))
          )}
        </div>

        {/* Ver mais */}
        {transactions.length > 5 && (
          <Button variant="ghost" className="w-full gap-2">
            Ver todas as recompensas
            <ChevronRight className="h-4 w-4" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

// =============================================================================
// COMPONENTES AUXILIARES
// =============================================================================

function TransactionItem({
  transaction,
  onViewPolygonScan,
  onViewDetails,
}: {
  transaction: CashbackTransaction;
  onViewPolygonScan: () => void;
  onViewDetails?: () => void;
}) {
  const icon = getTransactionIcon(transaction.type);
  const statusBadge = getStatusBadge(transaction.status);

  return (
    <div className="flex items-center gap-4 rounded-lg border bg-card p-4 transition-colors hover:bg-muted/50">
      {/* Icone */}
      <div className={cn('rounded-full p-2.5', icon.bg)}>
        {icon.icon}
      </div>

      {/* Detalhes */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium truncate">
            {CASHBACK_TYPE_LABELS[transaction.type]}
          </p>
          {transaction.loyaltyBonus > 1 && (
            <Badge variant="secondary" className="gap-1 text-xs">
              <Star className="h-3 w-3" />
              {transaction.loyaltyBonus}x
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground truncate">
          {formatTransactionDescription(transaction)}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          {formatDate(transaction.createdAt)}
        </p>
      </div>

      {/* Valor */}
      <div className="text-right shrink-0">
        <p className="font-semibold text-green-600">
          +{formatVBRz(transaction.cashbackAmountVBRz + transaction.bonusAmountVBRz)} VBRz
        </p>
        <p className="text-sm text-muted-foreground">
          R$ {(transaction.cashbackValueBRL * transaction.loyaltyBonus).toFixed(2)}
        </p>
        {transaction.txHash && (
          <button
            onClick={onViewPolygonScan}
            className="mt-1 inline-flex items-center gap-1 text-xs text-primary hover:underline"
          >
            <ExternalLink className="h-3 w-3" />
            Ver TX
          </button>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// HELPERS
// =============================================================================

function getTransactionIcon(type: CashbackType): { icon: React.ReactNode; bg: string } {
  switch (type) {
    case 'RENT_PAYMENT':
      return {
        icon: <Home className="h-5 w-5 text-blue-600" />,
        bg: 'bg-blue-100',
      };
    case 'REFERRAL':
      return {
        icon: <Users className="h-5 w-5 text-purple-600" />,
        bg: 'bg-purple-100',
      };
    case 'INSURANCE_BONUS':
      return {
        icon: <Shield className="h-5 w-5 text-green-600" />,
        bg: 'bg-green-100',
      };
    case 'GUARANTOR_BONUS':
      return {
        icon: <Users className="h-5 w-5 text-amber-600" />,
        bg: 'bg-amber-100',
      };
    case 'SERVICE_HIRE':
      return {
        icon: <Wrench className="h-5 w-5 text-orange-600" />,
        bg: 'bg-orange-100',
      };
    case 'LOYALTY_REWARD':
      return {
        icon: <Star className="h-5 w-5 text-yellow-600" />,
        bg: 'bg-yellow-100',
      };
    case 'PROMOTIONAL':
      return {
        icon: <Gift className="h-5 w-5 text-pink-600" />,
        bg: 'bg-pink-100',
      };
    default:
      return {
        icon: <Coins className="h-5 w-5 text-gray-600" />,
        bg: 'bg-gray-100',
      };
  }
}

function getStatusBadge(status: string): { label: string; variant: 'default' | 'secondary' | 'destructive' } {
  switch (status) {
    case 'confirmed':
      return { label: 'Confirmado', variant: 'default' };
    case 'processing':
      return { label: 'Processando', variant: 'secondary' };
    case 'failed':
      return { label: 'Falhou', variant: 'destructive' };
    default:
      return { label: 'Pendente', variant: 'secondary' };
  }
}

function formatTransactionDescription(tx: CashbackTransaction): string {
  switch (tx.type) {
    case 'RENT_PAYMENT':
      return `1% de R$ ${tx.originalAmountBRL.toFixed(2)}`;
    case 'REFERRAL':
      return 'Bonus por indicacao de amigo';
    case 'INSURANCE_BONUS':
      return `2% do premio de seguro`;
    case 'GUARANTOR_BONUS':
      return 'Bonus mensal de garantidor';
    case 'SERVICE_HIRE':
      return `Servico no Marketplace`;
    case 'LOYALTY_REWARD':
      return 'Recompensa de fidelidade';
    case 'PROMOTIONAL':
      return 'Promocao especial';
    default:
      return tx.referenceId;
  }
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

// =============================================================================
// EXPORT
// =============================================================================

export default TokenRewards;
