// ============================================
// ADMIN VBRz TOKEN - Command Center + Balcão OTC
// Dashboard completo do token VBRz
// ============================================

import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect, useCallback } from 'react';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { TokenCommandCenter } from '@/components/admin/cashback/TokenCommandCenter';
import { DirectSalesDesk } from '@/components/admin/cashback/DirectSalesDesk';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BarChart3, Banknote, Coins, Wallet, CheckCircle2, ExternalLink, Loader2, AlertCircle } from 'lucide-react';

export const Route = createFileRoute('/admin/vbrz-token' as never)({
  component: VBRzTokenPage,
});

function VBRzTokenPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [walletConnected, setWalletConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  // Função para conectar carteira MetaMask
  const connectWallet = useCallback(async () => {
    const ethereum = window.ethereum as {
      request: (args: { method: string }) => Promise<string[]>;
      on?: (event: string, callback: (accounts: string[]) => void) => void;
      removeListener?: (event: string, callback: (accounts: string[]) => void) => void;
    } | undefined;

    if (typeof ethereum === 'undefined') {
      return false;
    }

    setIsConnecting(true);
    try {
      // Primeiro tenta obter contas já conectadas
      let accounts = await ethereum.request({ method: 'eth_accounts' });

      // Se não houver contas conectadas, solicita conexão
      if (!accounts || accounts.length === 0) {
        accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      }

      if (accounts && accounts.length > 0) {
        setWalletAddress(accounts[0]);
        setWalletConnected(true);
        return true;
      }
    } catch (error) {
      console.error('Erro ao conectar carteira:', error);
    } finally {
      setIsConnecting(false);
    }
    return false;
  }, []);

  // Auto-conectar ao carregar a página
  useEffect(() => {
    connectWallet();

    // Listener para mudanças de conta
    const ethereum = window.ethereum as {
      on?: (event: string, callback: (accounts: string[]) => void) => void;
      removeListener?: (event: string, callback: (accounts: string[]) => void) => void;
    } | undefined;

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length > 0) {
        setWalletAddress(accounts[0]);
        setWalletConnected(true);
      } else {
        setWalletConnected(false);
        setWalletAddress(null);
      }
    };

    if (ethereum?.on) {
      ethereum.on('accountsChanged', handleAccountsChanged);
    }

    return () => {
      if (ethereum?.removeListener) {
        ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, [connectWallet]);

  // Função para desconectar (apenas limpa o estado local)
  const disconnectWallet = () => {
    setWalletConnected(false);
    setWalletAddress(null);
  };

  // Formata o endereço para exibição
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-slate-950">
        {/* Header com Tabs */}
        <div className="sticky top-0 z-10 bg-slate-950/95 backdrop-blur-sm border-b border-slate-800 px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-lg">
                <Coins className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">VBRz Token Admin</h1>
                <p className="text-sm text-slate-400">Gestão completa do token Vinculo</p>
              </div>
            </div>

            {/* Botão de Conectar Carteira Admin */}
            <div className="flex items-center gap-3">
              {walletConnected ? (
                <div className="flex items-center gap-2">
                  <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 flex items-center gap-1.5 px-3 py-1.5">
                    <CheckCircle2 className="h-4 w-4" />
                    Conectado
                  </Badge>
                  <div className="flex items-center gap-2 bg-slate-800/50 rounded-lg px-3 py-2">
                    <Wallet className="h-4 w-4 text-amber-400" />
                    <span className="text-sm font-mono text-slate-300">
                      {walletAddress ? formatAddress(walletAddress) : ''}
                    </span>
                    <a
                      href={`https://polygonscan.com/address/${walletAddress}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-slate-500 hover:text-amber-400 transition-colors"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={disconnectWallet}
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                  >
                    Desconectar
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={connectWallet}
                  disabled={isConnecting}
                  className="bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-white font-semibold shadow-lg shadow-amber-500/20"
                >
                  {isConnecting ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      Conectando...
                    </>
                  ) : (
                    <>
                      <Wallet className="h-4 w-4 mr-2" />
                      Conectar Carteira Admin
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>

          {/* Aviso se não conectado */}
          {!walletConnected && (
            <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-amber-400 flex-shrink-0" />
              <p className="text-sm text-amber-300">
                <strong>Atenção:</strong> Para executar operações de token (mint, transfer, vesting), você precisa conectar a carteira Admin com permissões de Owner.
              </p>
            </div>
          )}

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="bg-slate-800/50 p-1">
              <TabsTrigger
                value="dashboard"
                className="data-[state=active]:bg-amber-500/20 data-[state=active]:text-amber-400 text-slate-400"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Command Center
              </TabsTrigger>
              <TabsTrigger
                value="sales"
                className="data-[state=active]:bg-blue-500/20 data-[state=active]:text-blue-400 text-slate-400"
              >
                <Banknote className="h-4 w-4 mr-2" />
                Balcão de Vendas OTC
              </TabsTrigger>
            </TabsList>

            {/* Tab Contents */}
            <TabsContent value="dashboard" className="mt-0">
              <TokenCommandCenter />
            </TabsContent>

            <TabsContent value="sales" className="mt-0">
              <DirectSalesDesk />
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer FATTO */}
        <div className="text-center py-6 border-t border-slate-800 mt-6">
          <p className="text-sm text-slate-500">
            Um produto da FATTO Tecnologia LTDA.{' '}
            <a
              href="https://www.fattotecnologia.com.br"
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-500 hover:text-green-400"
            >
              www.fattotecnologia.com.br
            </a>
          </p>
        </div>
      </div>
    </AdminLayout>
  );
}

export default VBRzTokenPage;
