/**
 * Vinculo.io - WalletConnector Component
 *
 * UI component for connecting Web3 wallets.
 * Supports MetaMask, WalletConnect, Coinbase, and Social Login.
 */

import { useState } from 'react';
import { Wallet, Check, AlertCircle, Loader2, ExternalLink, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useWalletConnection } from '@/hooks/use-wallet-connection';
import type { WalletConnectorType } from '@/lib/web3/types';
import { cn } from '@/lib/utils';

interface WalletOption {
  id: WalletConnectorType;
  name: string;
  icon: string;
  description: string;
  popular?: boolean;
}

const WALLET_OPTIONS: WalletOption[] = [
  {
    id: 'metamask',
    name: 'MetaMask',
    icon: '\ud83e\udd8a',
    description: 'Carteira mais popular',
    popular: true,
  },
  {
    id: 'walletconnect',
    name: 'WalletConnect',
    icon: '\ud83d\udd17',
    description: 'Conecte qualquer carteira',
  },
  {
    id: 'coinbase',
    name: 'Coinbase Wallet',
    icon: '\ud83d\udfe6',
    description: 'Carteira Coinbase',
  },
  {
    id: 'social',
    name: 'Login Social',
    icon: '\ud83d\udc64',
    description: 'Google, Apple ou Email',
  },
];

interface WalletConnectorProps {
  variant?: 'default' | 'compact' | 'full';
  className?: string;
}

export function WalletConnector({ variant = 'default', className }: WalletConnectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<WalletConnectorType | null>(null);

  const {
    status,
    wallet,
    error,
    connect,
    disconnect,
    isConnected,
    isConnecting,
    shortAddress,
  } = useWalletConnection();

  const handleConnect = async (connectorType: WalletConnectorType) => {
    setSelectedWallet(connectorType);
    await connect(connectorType);
    if (status !== 'error') {
      setIsOpen(false);
    }
  };

  // Connected state display
  if (isConnected && wallet) {
    if (variant === 'compact') {
      return (
        <div className={cn('flex items-center gap-2', className)}>
          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
            <div className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse" />
            {shortAddress}
          </Badge>
          <Button variant="ghost" size="icon" onClick={disconnect} className="h-8 w-8">
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      );
    }

    return (
      <div className={cn('flex items-center gap-3 p-3 bg-slate-50 rounded-xl border', className)}>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-sm font-semibold text-emerald-700">Conectado</span>
          </div>
          <p className="font-mono text-sm text-slate-600">{shortAddress}</p>
          <p className="text-xs text-slate-500">{wallet.balance} MATIC</p>
        </div>
        <div className="flex flex-col gap-1">
          <Badge variant="secondary" className="text-xs">
            Polygon
          </Badge>
          <Button variant="ghost" size="sm" onClick={disconnect} className="text-xs text-slate-500">
            <LogOut className="h-3 w-3 mr-1" />
            Sair
          </Button>
        </div>
      </div>
    );
  }

  // Not connected - show connect button/dialog
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant={variant === 'full' ? 'default' : 'outline'}
          className={cn(
            variant === 'full' && 'w-full bg-indigo-600 hover:bg-indigo-700',
            className
          )}
        >
          <Wallet className="h-4 w-4 mr-2" />
          Conectar Carteira
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-indigo-600" />
            Conectar Carteira
          </DialogTitle>
          <DialogDescription>
            Escolha como deseja conectar sua carteira Web3 ao Vinculo.io
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-3">
          {WALLET_OPTIONS.map((option) => (
            <button
              key={option.id}
              onClick={() => handleConnect(option.id)}
              disabled={isConnecting}
              className={cn(
                'flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all',
                'hover:border-indigo-300 hover:bg-indigo-50',
                isConnecting && selectedWallet === option.id && 'border-indigo-500 bg-indigo-50',
                isConnecting && selectedWallet !== option.id && 'opacity-50'
              )}
            >
              <span className="text-3xl">{option.icon}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">{option.name}</span>
                  {option.popular && (
                    <Badge variant="secondary" className="text-[10px]">
                      Popular
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-slate-500">{option.description}</p>
              </div>
              {isConnecting && selectedWallet === option.id ? (
                <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
              ) : (
                <ExternalLink className="h-4 w-4 text-slate-400" />
              )}
            </button>
          ))}
        </div>

        {isConnecting && (
          <div className="mt-4 p-4 bg-indigo-50 rounded-lg text-center">
            <Loader2 className="h-6 w-6 animate-spin text-indigo-600 mx-auto mb-2" />
            <p className="text-sm font-medium text-indigo-900">
              Confirme a conexao na sua carteira...
            </p>
            <p className="text-xs text-indigo-600 mt-1">
              Verifique sua extensao ou app mobile
            </p>
          </div>
        )}

        <div className="mt-4 pt-4 border-t text-center">
          <p className="text-xs text-slate-500">
            Ao conectar, voce concorda com os{' '}
            <a href="#" className="text-indigo-600 hover:underline">
              Termos de Uso
            </a>{' '}
            e{' '}
            <a href="#" className="text-indigo-600 hover:underline">
              Politica de Privacidade
            </a>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Compact inline wallet status for headers
 */
export function WalletStatus() {
  const { wallet, isConnected, shortAddress } = useWalletConnection();

  if (!isConnected || !wallet) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 rounded-full border border-emerald-200">
      <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
      <span className="text-sm font-medium text-emerald-700">{shortAddress}</span>
    </div>
  );
}
