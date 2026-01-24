/**
 * Vinculo.io - Blockchain Transaction Feed
 *
 * Real-time feed of blockchain transactions for the platform.
 * Shows payments, NFT mints, and collateral locks.
 */

import { useState, useEffect } from 'react';
import {
  Coins,
  FileCheck,
  Lock,
  Unlock,
  ExternalLink,
  RefreshCw,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getBlockExplorerUrl, getNetworkConfig } from '@/lib/web3/config';
import { cn } from '@/lib/utils';
import { useCryptoWallets } from '@/contexts/crypto-wallets-context';

type TransactionType = 'payment' | 'mint' | 'collateral_lock' | 'collateral_unlock' | 'transfer';

interface BlockchainTransaction {
  id: string;
  type: TransactionType;
  hash: string;
  timestamp: Date;
  amount?: number;
  from: string;
  to: string;
  status: 'pending' | 'confirmed' | 'failed';
  confirmations: number;
  gasUsed?: string;
  metadata?: {
    tokenId?: string;
    propertyId?: string;
    contractId?: string;
    splitBreakdown?: {
      landlord: number;
      insurer: number;
      platform: number;
      guarantor: number;
    };
  };
}

const TRANSACTION_CONFIG: Record<
  TransactionType,
  {
    icon: React.ReactNode;
    label: string;
    color: string;
    bgColor: string;
  }
> = {
  payment: {
    icon: <Coins className="h-4 w-4" />,
    label: 'Pagamento',
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-100',
  },
  mint: {
    icon: <FileCheck className="h-4 w-4" />,
    label: 'Mint NFT',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
  },
  collateral_lock: {
    icon: <Lock className="h-4 w-4" />,
    label: 'Colateral Bloqueado',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
  },
  collateral_unlock: {
    icon: <Unlock className="h-4 w-4" />,
    label: 'Colateral Liberado',
    color: 'text-teal-600',
    bgColor: 'bg-teal-100',
  },
  transfer: {
    icon: <ArrowUpRight className="h-4 w-4" />,
    label: 'Transferencia',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
};

// Generate mock transactions - usa enderecos das carteiras cadastradas
function generateMockTransactions(count: number, walletAddresses: string[]): BlockchainTransaction[] {
  const types: TransactionType[] = ['payment', 'mint', 'collateral_lock', 'payment', 'payment'];
  // Usa enderecos das carteiras cadastradas, ou fallback se nao houver
  const addresses = walletAddresses.length > 0 ? walletAddresses : [
    '0x0000000000000000000000000000000000000001',
    '0x0000000000000000000000000000000000000002',
  ];

  return Array.from({ length: count }, (_, i) => {
    const type = types[Math.floor(Math.random() * types.length)];
    const timestamp = new Date(Date.now() - i * 1000 * 60 * 60 * (1 + Math.random() * 5));
    const amount = type === 'payment' ? 2500 + Math.random() * 2000 : undefined;

    const chars = '0123456789abcdef';
    let hash = '0x';
    for (let j = 0; j < 64; j++) {
      hash += chars[Math.floor(Math.random() * chars.length)];
    }

    return {
      id: `tx-${i}`,
      type,
      hash,
      timestamp,
      amount,
      from: addresses[Math.floor(Math.random() * addresses.length)],
      to: addresses[Math.floor(Math.random() * addresses.length)],
      status: i === 0 && Math.random() > 0.7 ? 'pending' : 'confirmed',
      confirmations: i === 0 ? Math.floor(Math.random() * 5) : 12 + Math.floor(Math.random() * 100),
      gasUsed: `${(0.001 + Math.random() * 0.005).toFixed(5)} MATIC`,
      metadata:
        type === 'payment'
          ? {
              splitBreakdown: {
                landlord: (amount || 3000) * 0.85,
                insurer: (amount || 3000) * 0.05,
                platform: (amount || 3000) * 0.05,
                guarantor: (amount || 3000) * 0.05,
              },
            }
          : type === 'mint'
            ? { tokenId: BigInt(Math.floor(Math.random() * 1e18)).toString().slice(0, 8) }
            : type === 'collateral_lock'
              ? { propertyId: `PROP-${2024}-${String(Math.floor(Math.random() * 1000)).padStart(4, '0')}` }
              : undefined,
    } as BlockchainTransaction;
  });
}

interface BlockchainTransactionFeedProps {
  maxItems?: number;
  autoRefresh?: boolean;
  refreshInterval?: number;
  showHeader?: boolean;
  compact?: boolean;
  filterType?: TransactionType | 'all';
}

export function BlockchainTransactionFeed({
  maxItems = 10,
  autoRefresh = true,
  refreshInterval = 30000,
  showHeader = true,
  compact = false,
  filterType = 'all',
}: BlockchainTransactionFeedProps) {
  const [transactions, setTransactions] = useState<BlockchainTransaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const networkConfig = getNetworkConfig();

  // Usa carteiras cadastradas no sistema
  const { wallets } = useCryptoWallets();
  const walletAddresses = wallets.filter(w => w.isActive).map(w => w.address);

  const fetchTransactions = async () => {
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800));
    const mockTxs = generateMockTransactions(maxItems, walletAddresses);
    setTransactions(
      filterType === 'all' ? mockTxs : mockTxs.filter((tx) => tx.type === filterType)
    );
    setLastUpdate(new Date());
    setIsLoading(false);
  };

  useEffect(() => {
    fetchTransactions();

    if (autoRefresh) {
      const interval = setInterval(fetchTransactions, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [maxItems, filterType, autoRefresh, refreshInterval]);

  const formatTimeAgo = (date: Date): string => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return `${seconds}s atras`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}min atras`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h atras`;
    return `${Math.floor(seconds / 86400)}d atras`;
  };

  const formatAmount = (amount: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(amount);
  };

  const handleViewExplorer = (hash: string) => {
    window.open(getBlockExplorerUrl('tx', hash), '_blank');
  };

  if (compact) {
    return (
      <div className="space-y-2">
        {transactions.slice(0, 5).map((tx) => {
          const config = TRANSACTION_CONFIG[tx.type];
          return (
            <div
              key={tx.id}
              className="flex items-center justify-between p-2 bg-slate-50 rounded-lg"
            >
              <div className="flex items-center gap-2">
                <div className={cn('p-1.5 rounded-full', config.bgColor, config.color)}>
                  {config.icon}
                </div>
                <div>
                  <p className="text-xs font-medium">{config.label}</p>
                  <p className="text-[10px] text-slate-500">{formatTimeAgo(tx.timestamp)}</p>
                </div>
              </div>
              {tx.amount && (
                <span className="text-sm font-semibold text-emerald-600">
                  {formatAmount(tx.amount)}
                </span>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <Card>
      {showHeader && (
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                <div className="p-1.5 bg-indigo-100 rounded-lg">
                  <Coins className="h-4 w-4 text-indigo-600" />
                </div>
                Transacoes Blockchain
              </CardTitle>
              <CardDescription className="flex items-center gap-1 mt-1">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                {networkConfig.name} - Atualizado {formatTimeAgo(lastUpdate)}
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchTransactions}
              disabled={isLoading}
            >
              <RefreshCw className={cn('h-4 w-4', isLoading && 'animate-spin')} />
            </Button>
          </div>
        </CardHeader>
      )}

      <CardContent className="p-0">
        <ScrollArea className="h-[400px]">
          <div className="p-4 space-y-3">
            {isLoading && transactions.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                Nenhuma transacao encontrada
              </div>
            ) : (
              transactions.map((tx) => {
                const config = TRANSACTION_CONFIG[tx.type];
                return (
                  <div
                    key={tx.id}
                    className="group flex items-start gap-3 p-3 rounded-xl border hover:bg-slate-50 transition-colors"
                  >
                    {/* Icon */}
                    <div className={cn('p-2 rounded-xl', config.bgColor, config.color)}>
                      {tx.status === 'pending' ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        config.icon
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{config.label}</span>
                        {tx.status === 'pending' ? (
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                            Pendente
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="text-[10px] px-1.5 py-0 border-emerald-200 text-emerald-700"
                          >
                            <CheckCircle2 className="h-2.5 w-2.5 mr-0.5" />
                            {tx.confirmations} conf.
                          </Badge>
                        )}
                      </div>

                      {/* Hash */}
                      <p className="text-xs font-mono text-slate-500 truncate">
                        {tx.hash.slice(0, 20)}...{tx.hash.slice(-8)}
                      </p>

                      {/* Metadata */}
                      {tx.metadata?.splitBreakdown && (
                        <div className="flex gap-1 mt-2">
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                            85% Locador
                          </Badge>
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                            5% Seg.
                          </Badge>
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                            5% Plat.
                          </Badge>
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                            5% Gar.
                          </Badge>
                        </div>
                      )}
                      {tx.metadata?.tokenId && (
                        <p className="text-[10px] text-slate-400 mt-1">
                          Token ID: {tx.metadata.tokenId}...
                        </p>
                      )}
                      {tx.metadata?.propertyId && (
                        <p className="text-[10px] text-slate-400 mt-1">
                          Imovel: {tx.metadata.propertyId}
                        </p>
                      )}

                      {/* Footer */}
                      <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-400">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatTimeAgo(tx.timestamp)}
                        </span>
                        {tx.gasUsed && <span>Gas: {tx.gasUsed}</span>}
                      </div>
                    </div>

                    {/* Amount & Actions */}
                    <div className="text-right">
                      {tx.amount && (
                        <p className="font-bold text-emerald-600 mb-1">
                          {formatAmount(tx.amount)}
                        </p>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleViewExplorer(tx.hash)}
                      >
                        <ExternalLink className="h-3 w-3 mr-1" />
                        Explorer
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

/**
 * Live Transaction Counter Widget
 */
export function TransactionCounterWidget() {
  const [count, setCount] = useState(0);
  const [volume, setVolume] = useState(0);

  useEffect(() => {
    // Simulate counting up from 0
    const targetCount = 1247;
    const targetVolume = 4850000;
    const duration = 2000;
    const steps = 60;
    const stepTime = duration / steps;

    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      const easeOut = 1 - Math.pow(1 - progress, 3);

      setCount(Math.floor(targetCount * easeOut));
      setVolume(Math.floor(targetVolume * easeOut));

      if (currentStep >= steps) {
        clearInterval(interval);
      }
    }, stepTime);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-4 text-foreground">
        <div className="flex items-center gap-2 mb-2">
          <FileCheck className="h-5 w-5 opacity-80" />
          <span className="text-sm opacity-80">Contratos NFT</span>
        </div>
        <p className="text-3xl font-bold">{count.toLocaleString('pt-BR')}</p>
        <p className="text-xs opacity-60 mt-1">Registrados na blockchain</p>
      </div>

      <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-4 text-foreground">
        <div className="flex items-center gap-2 mb-2">
          <Coins className="h-5 w-5 opacity-80" />
          <span className="text-sm opacity-80">Volume Transacionado</span>
        </div>
        <p className="text-3xl font-bold">
          R$ {(volume / 1000000).toFixed(1)}M
        </p>
        <p className="text-xs opacity-60 mt-1">Split 85/5/5/5 automatico</p>
      </div>
    </div>
  );
}
