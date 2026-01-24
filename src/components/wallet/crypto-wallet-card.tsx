// =============================================================================
// CryptoWalletCard - Carteira de Tokens VBRz para Dashboard do Inquilino
// =============================================================================

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Wallet,
  ExternalLink,
  ShoppingBag,
  TrendingUp,
  Gift,
  Copy,
  Check,
  ChevronRight,
  Coins,
  Star,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  type TokenBalance,
  type LoyaltyTier,
  VBRZ_CONFIG,
  LOYALTY_TIER_LABELS,
  LOYALTY_TIERS,
  TIER_REQUIREMENTS,
  formatVBRz,
  vbrzToBRL,
} from '@/lib/tokenomics-types';
import { useCryptoWallets } from '@/contexts/crypto-wallets-context';
import { copyToClipboard } from '@/lib/clipboard';

// =============================================================================
// TIPOS
// =============================================================================

interface CryptoWalletCardProps {
  balance?: TokenBalance;
  walletAddress?: string;
  onUseInMarketplace?: () => void;
  onViewHistory?: () => void;
  onViewOnPolygonScan?: () => void;
  className?: string;
}

// =============================================================================
// COMPONENTE PRINCIPAL
// =============================================================================

export function CryptoWalletCard({
  balance,
  walletAddress: propWalletAddress,
  onUseInMarketplace,
  onViewHistory,
  onViewOnPolygonScan,
  className,
}: CryptoWalletCardProps) {
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(!balance);

  // Usa carteira operacional cadastrada no sistema
  const { getOperationalWallet, primaryWallet } = useCryptoWallets();
  const systemWallet = getOperationalWallet() || primaryWallet;
  const walletAddress = propWalletAddress || systemWallet?.address || '0x0000000000000000000000000000000000000000';

  // Dados baseados na carteira do sistema ou mock para demonstracao
  const mockBalance: TokenBalance = balance || {
    userId: 'user-123',
    walletAddress,
    balanceVBRz: systemWallet?.balance.brz || 1250,
    balanceBRL: (systemWallet?.balance.brz || 1250) * 0.1,
    lockedBalance: 0,
    totalReceived: 2500,
    totalBurned: 1250,
    totalTransferred: 0,
    loyaltyTier: 'prata',
    loyaltyMultiplier: 1.2,
    lastUpdated: new Date(),
    createdAt: new Date('2024-01-01'),
  };

  useEffect(() => {
    if (!balance) {
      const timer = setTimeout(() => setIsLoading(false), 500);
      return () => clearTimeout(timer);
    }
  }, [balance]);

  const handleCopyAddress = async () => {
    const success = await copyToClipboard(mockBalance.walletAddress);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleViewPolygonScan = () => {
    const url = `https://polygonscan.com/address/${mockBalance.walletAddress}`;
    if (onViewOnPolygonScan) {
      onViewOnPolygonScan();
    } else {
      window.open(url, '_blank');
    }
  };

  // Calcula progresso para proximo tier
  const nextTier = getNextTier(mockBalance.loyaltyTier);
  const progressToNextTier = nextTier
    ? Math.min(
        100,
        (mockBalance.balanceVBRz / TIER_REQUIREMENTS[nextTier].minBalance) * 100
      )
    : 100;

  const tierColor = getTierColor(mockBalance.loyaltyTier);

  if (isLoading) {
    return <WalletSkeleton className={className} />;
  }

  return (
    <Card className={cn('overflow-hidden', className)}>
      {/* Header com gradiente */}
      <div className={cn('bg-gradient-to-r p-6', tierColor.gradient)}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-white/20 p-2.5 backdrop-blur-sm">
              <Coins className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Carteira VBRz</h3>
              <p className="text-sm text-white/80">Vinculo Token</p>
            </div>
          </div>
          <Badge
            variant="secondary"
            className={cn(
              'gap-1 border-0',
              tierColor.badge
            )}
          >
            <Star className="h-3 w-3" />
            {LOYALTY_TIER_LABELS[mockBalance.loyaltyTier]}
          </Badge>
        </div>

        {/* Saldo principal */}
        <div className="mt-6">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold text-white">
              {formatVBRz(mockBalance.balanceVBRz)}
            </span>
            <span className="text-lg font-medium text-white/80">VBRz</span>
          </div>
          <p className="mt-1 text-lg text-white/90">
            ≈ R$ {mockBalance.balanceBRL.toFixed(2)}
          </p>
        </div>

        {/* Endereco da carteira */}
        <div className="mt-4 flex items-center gap-2">
          <code className="rounded bg-white/10 px-2 py-1 text-xs text-white/80">
            {formatAddress(mockBalance.walletAddress)}
          </code>
          <button
            onClick={handleCopyAddress}
            className="rounded p-1 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
          >
            {copied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      <CardContent className="space-y-6 pt-6">
        {/* Bonus de fidelidade */}
        <div className="rounded-lg border bg-muted/30 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className={cn('h-5 w-5', tierColor.text)} />
              <span className="font-medium">Bonus de Fidelidade</span>
            </div>
            <span className={cn('text-lg font-bold', tierColor.text)}>
              {mockBalance.loyaltyMultiplier}x
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Seu cashback e multiplicado por {mockBalance.loyaltyMultiplier}
          </p>

          {/* Progresso para proximo tier */}
          {nextTier && (
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Proximo: {LOYALTY_TIER_LABELS[nextTier]}
                </span>
                <span className="font-medium">
                  {mockBalance.balanceVBRz} / {TIER_REQUIREMENTS[nextTier].minBalance} VBRz
                </span>
              </div>
              <Progress
                value={progressToNextTier}
                className="mt-2 h-2"
              />
            </div>
          )}
        </div>

        {/* Estatisticas */}
        <div className="grid grid-cols-2 gap-4">
          <StatCard
            icon={<Gift className="h-5 w-5 text-green-500" />}
            label="Total Recebido"
            value={`${formatVBRz(mockBalance.totalReceived)} VBRz`}
            subvalue={`R$ ${vbrzToBRL(mockBalance.totalReceived).toFixed(2)}`}
          />
          <StatCard
            icon={<ShoppingBag className="h-5 w-5 text-blue-500" />}
            label="Total Usado"
            value={`${formatVBRz(mockBalance.totalBurned)} VBRz`}
            subvalue={`R$ ${vbrzToBRL(mockBalance.totalBurned).toFixed(2)}`}
          />
        </div>

        {/* Acoes */}
        <div className="flex flex-col gap-3">
          <Button
            onClick={onUseInMarketplace}
            className="w-full gap-2"
          >
            <ShoppingBag className="h-4 w-4" />
            Usar no Marketplace
          </Button>

          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={onViewHistory}
              className="gap-2"
            >
              <TrendingUp className="h-4 w-4" />
              Historico
            </Button>
            <Button
              variant="outline"
              onClick={handleViewPolygonScan}
              className="gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              PolygonScan
            </Button>
          </div>
        </div>

        {/* Informacoes do token */}
        <div className="border-t pt-4">
          <p className="text-center text-xs text-muted-foreground">
            1 VBRz = R$ {VBRZ_CONFIG.fixedPegBRL.toFixed(2)} | Rede: {VBRZ_CONFIG.chainName}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// =============================================================================
// COMPONENTES AUXILIARES
// =============================================================================

function StatCard({
  icon,
  label,
  value,
  subvalue,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  subvalue: string;
}) {
  return (
    <div className="rounded-lg border bg-card p-3">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <p className="mt-1 font-semibold">{value}</p>
      <p className="text-xs text-muted-foreground">{subvalue}</p>
    </div>
  );
}

function WalletSkeleton({ className }: { className?: string }) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      <div className="h-48 animate-pulse bg-gradient-to-r from-zinc-300 to-zinc-400" />
      <CardContent className="space-y-4 pt-6">
        <div className="h-20 animate-pulse rounded-lg bg-muted" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-20 animate-pulse rounded-lg bg-muted" />
          <div className="h-20 animate-pulse rounded-lg bg-muted" />
        </div>
        <div className="h-10 animate-pulse rounded-lg bg-muted" />
      </CardContent>
    </Card>
  );
}

// =============================================================================
// HELPERS
// =============================================================================

function formatAddress(address: string): string {
  if (address.length <= 13) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

function getNextTier(currentTier: LoyaltyTier): LoyaltyTier | null {
  const tiers: LoyaltyTier[] = ['bronze', 'prata', 'ouro', 'diamante'];
  const currentIndex = tiers.indexOf(currentTier);
  if (currentIndex === -1 || currentIndex === tiers.length - 1) return null;
  return tiers[currentIndex + 1];
}

function getTierColor(tier: LoyaltyTier): {
  gradient: string;
  badge: string;
  text: string;
} {
  switch (tier) {
    case 'diamante':
      return {
        gradient: 'from-purple-600 to-indigo-700',
        badge: 'bg-purple-100 text-purple-800',
        text: 'text-purple-600',
      };
    case 'ouro':
      return {
        gradient: 'from-amber-500 to-yellow-600',
        badge: 'bg-amber-100 text-amber-800',
        text: 'text-amber-600',
      };
    case 'prata':
      return {
        gradient: 'from-slate-500 to-zinc-600',
        badge: 'bg-slate-100 text-slate-800',
        text: 'text-slate-600',
      };
    default:
      return {
        gradient: 'from-orange-600 to-amber-700',
        badge: 'bg-orange-100 text-orange-800',
        text: 'text-orange-600',
      };
  }
}

// =============================================================================
// EXPORT
// =============================================================================

export default CryptoWalletCard;
