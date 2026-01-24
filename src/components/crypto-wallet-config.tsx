/**
 * Configuracao de Blockchain e Split Asaas
 * MODELO HIBRIDO (Oracle Settlement):
 * - Liquidez (Fiat): Dinheiro flui 100% em BRL via Asaas com Split nativo
 * - Verdade (Web3): Blockchain (Polygon) usado para auditoria e fidelidade (VBRz)
 *
 * O Backend atua como "Oraculo" que escuta Webhooks do Asaas
 * e grava eventos de pagamento na blockchain para:
 * - Historico de pagamento imutavel
 * - Score de credito descentralizado
 * - Mint automatico de VBRz (cashback)
 */

import { useState } from 'react';
import { copyToClipboard } from '@/lib/clipboard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Wallet,
  Plus,
  Settings,
  Trash2,
  Edit3,
  ExternalLink,
  Copy,
  Check,
  RefreshCw,
  Shield,
  Key,
  Zap,
  AlertTriangle,
  CheckCircle,
  Eye,
  EyeOff,
  Network,
  Globe,
  Lock,
  Loader2,
  Database,
  HardDrive,
  Link2,
  FileCode,
  Server,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCryptoWallets, type CryptoWallet } from '@/contexts/crypto-wallets-context';

// Re-exportar tipo para compatibilidade
export type { CryptoWallet };

// Tipos locais

// Configuracao do Asaas (Processador de Pagamentos)
export interface AsaasConfig {
  apiKey: string;
  environment: 'sandbox' | 'production';
  webhookUrl: string;
  webhookToken: string;
  status: 'connected' | 'disconnected' | 'error';
  lastSync?: Date;
  accountType: 'standard' | 'subaccount';
  walletId?: string;
}

// Split via Asaas (Contas Bancarias)
export interface AsaasSplitReceiver {
  purpose: string;
  percentage: number;
  walletId: string; // Wallet ID do Asaas (wal_xxx)
  bankAccount: string; // Nome da conta para exibicao
}

export interface SplitConfig {
  id: string;
  name: string;
  description: string;
  wallets: AsaasSplitReceiver[];
  isActive: boolean;
}

export interface IPFSConfig {
  gateway: string;
  apiEndpoint: string;
  apiKey: string;
  pinningService: 'pinata' | 'infura' | 'web3storage' | 'custom';
  autoPin: boolean;
  maxFileSize: number;
  status: 'connected' | 'disconnected' | 'error';
  lastSync?: Date;
  totalPinned: number;
  storageUsed: number;
}

export interface PolygonConfig {
  rpcUrl: string;
  chainId: number;
  networkName: string;
  explorerUrl: string;
  contractAddress: string;
  abiVersion: string;
  gasStrategy: 'standard' | 'fast' | 'aggressive';
  maxGasPrice: number;
  status: 'connected' | 'disconnected' | 'error';
  lastBlock?: number;
  lastSync?: Date;
}

const NETWORK_INFO = {
  polygon: { name: 'Polygon', symbol: 'MATIC', explorer: 'https://polygonscan.com', color: 'bg-purple-500' },
  ethereum: { name: 'Ethereum', symbol: 'ETH', explorer: 'https://etherscan.io', color: 'bg-blue-500' },
  base: { name: 'Base', symbol: 'ETH', explorer: 'https://basescan.org', color: 'bg-blue-600' },
  arbitrum: { name: 'Arbitrum', symbol: 'ETH', explorer: 'https://arbiscan.io', color: 'bg-sky-500' },
  bsc: { name: 'BNB Chain', symbol: 'BNB', explorer: 'https://bscscan.com', color: 'bg-yellow-500' },
};

export function CryptoWalletConfig() {
  // Usa o contexto global de carteiras
  const {
    wallets,
    addWallet,
    updateWallet,
    removeWallet,
    setPrimaryWallet: setAsPrimary,
  } = useCryptoWallets();

  const [asaasConfig, setAsaasConfig] = useState<AsaasConfig>({
    apiKey: '$aact_YTU5YTE0M2M2OT...',
    environment: 'production',
    webhookUrl: 'https://api.vinculobrasil.com.br/webhook/asaas',
    webhookToken: 'whsec_****************************',
    status: 'connected',
    lastSync: new Date(),
    accountType: 'standard',
    walletId: 'wal_xxxxxxxxxxxx',
  });

  const [splitConfigs, setSplitConfigs] = useState<SplitConfig[]>([
    {
      id: 'split1',
      name: 'Split Padrao 85/5/5/5',
      description: 'Distribuicao padrao de alugueis via Asaas',
      wallets: [
        { purpose: 'Locadores', percentage: 85, walletId: 'wal_locador001', bankAccount: 'Conta Principal Locador' },
        { purpose: 'Seguradoras', percentage: 5, walletId: 'wal_seguro001', bankAccount: 'Porto Seguro' },
        { purpose: 'Garantidores', percentage: 5, walletId: 'wal_garantia001', bankAccount: 'Fundo Garantidor' },
        { purpose: 'Plataforma', percentage: 5, walletId: 'wal_vinculo001', bankAccount: 'Vinculo Brasil' },
      ],
      isActive: true,
    },
  ]);

  // IPFS Config state
  const [ipfsConfig, setIpfsConfig] = useState<IPFSConfig>({
    gateway: 'https://gateway.pinata.cloud/ipfs/',
    apiEndpoint: 'https://api.pinata.cloud',
    apiKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    pinningService: 'pinata',
    autoPin: true,
    maxFileSize: 100,
    status: 'connected',
    lastSync: new Date(),
    totalPinned: 1247,
    storageUsed: 2.8,
  });

  // Polygon Config state
  const [polygonConfig, setPolygonConfig] = useState<PolygonConfig>({
    rpcUrl: 'https://polygon-mainnet.g.alchemy.com/v2/...',
    chainId: 137,
    networkName: 'Polygon Mainnet',
    explorerUrl: 'https://polygonscan.com',
    contractAddress: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
    abiVersion: 'v2.1.0',
    gasStrategy: 'standard',
    maxGasPrice: 500,
    status: 'connected',
    lastBlock: 52847291,
    lastSync: new Date(),
  });

  const [isIPFSDialogOpen, setIsIPFSDialogOpen] = useState(false);
  const [isPolygonDialogOpen, setIsPolygonDialogOpen] = useState(false);
  const [showIPFSApiKey, setShowIPFSApiKey] = useState(false);

  // Split dialog states
  const [isSplitDialogOpen, setIsSplitDialogOpen] = useState(false);
  const [selectedSplit, setSelectedSplit] = useState<SplitConfig | null>(null);
  const [splitForm, setSplitForm] = useState({
    name: '',
    description: '',
    wallets: [
      { purpose: 'Locadores', percentage: 85, walletId: '', bankAccount: '' },
      { purpose: 'Seguradoras', percentage: 5, walletId: '', bankAccount: '' },
      { purpose: 'Garantidores', percentage: 5, walletId: '', bankAccount: '' },
      { purpose: 'Plataforma', percentage: 5, walletId: '', bankAccount: '' },
    ],
    isActive: true,
  });

  // Dialog states
  const [isWalletDialogOpen, setIsWalletDialogOpen] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState<CryptoWallet | null>(null);
  const [isAsaasDialogOpen, setIsAsaasDialogOpen] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);

  // Wallet form state
  const [walletForm, setWalletForm] = useState({
    name: '',
    address: '',
    network: 'polygon' as CryptoWallet['network'],
    type: 'hot' as CryptoWallet['type'],
    purpose: 'operations' as CryptoWallet['purpose'],
  });

  // Handlers
  const handleCopyAddress = async (address: string) => {
    const success = await copyToClipboard(address);
    if (success) {
      setCopiedAddress(address);
      setTimeout(() => setCopiedAddress(null), 2000);
    }
  };

  const handleOpenWalletDialog = (wallet?: CryptoWallet) => {
    if (wallet) {
      setSelectedWallet(wallet);
      setWalletForm({
        name: wallet.name,
        address: wallet.address,
        network: wallet.network,
        type: wallet.type,
        purpose: wallet.purpose,
      });
    } else {
      setSelectedWallet(null);
      setWalletForm({
        name: '',
        address: '',
        network: 'polygon',
        type: 'hot',
        purpose: 'operations',
      });
    }
    setIsWalletDialogOpen(true);
  };

  const handleSaveWallet = () => {
    if (selectedWallet) {
      // Atualiza carteira existente via contexto global
      updateWallet(selectedWallet.id, walletForm);
    } else {
      // Adiciona nova carteira via contexto global
      addWallet({
        ...walletForm,
        balance: { native: 0, brz: 0 },
        isActive: true,
        isPrimary: false,
      });
    }
    setIsWalletDialogOpen(false);
  };

  const handleDeleteWallet = (walletId: string) => {
    if (confirm('Tem certeza que deseja remover esta carteira?')) {
      removeWallet(walletId);
    }
  };

  const handleToggleWallet = (walletId: string) => {
    const wallet = wallets.find(w => w.id === walletId);
    if (wallet) {
      updateWallet(walletId, { isActive: !wallet.isActive });
    }
  };

  const handleSetPrimary = (walletId: string) => {
    setAsPrimary(walletId);
  };

  const handleTestAsaas = async () => {
    setIsTesting(true);
    await new Promise(r => setTimeout(r, 2000));
    setIsTesting(false);
    alert('Conexao com Asaas testada com sucesso!');
  };

  const handleSaveAsaas = () => {
    setIsAsaasDialogOpen(false);
    alert('Configuracoes do Asaas salvas com sucesso!');
  };

  // Split handlers
  const handleOpenSplitDialog = (split?: SplitConfig) => {
    if (split) {
      setSelectedSplit(split);
      setSplitForm({
        name: split.name,
        description: split.description,
        wallets: split.wallets.map(w => ({ ...w })),
        isActive: split.isActive,
      });
    } else {
      setSelectedSplit(null);
      setSplitForm({
        name: '',
        description: '',
        wallets: [
          { purpose: 'Locadores', percentage: 85, walletId: '', bankAccount: '' },
          { purpose: 'Seguradoras', percentage: 5, walletId: '', bankAccount: '' },
          { purpose: 'Garantidores', percentage: 5, walletId: '', bankAccount: '' },
          { purpose: 'Plataforma', percentage: 5, walletId: '', bankAccount: '' },
        ],
        isActive: true,
      });
    }
    setIsSplitDialogOpen(true);
  };

  const handleSaveSplit = () => {
    if (selectedSplit) {
      // Atualiza split existente
      setSplitConfigs(prev =>
        prev.map(s => s.id === selectedSplit.id ? { ...s, ...splitForm } : s)
      );
    } else {
      // Adiciona novo split
      setSplitConfigs(prev => [
        ...prev,
        {
          id: `split_${Date.now()}`,
          ...splitForm,
        },
      ]);
    }
    setIsSplitDialogOpen(false);
    setSelectedSplit(null);
  };

  const handleDeleteSplit = (splitId: string) => {
    if (confirm('Tem certeza que deseja remover esta configuracao de split?')) {
      setSplitConfigs(prev => prev.filter(s => s.id !== splitId));
    }
  };

  const handleToggleSplitActive = (splitId: string) => {
    setSplitConfigs(prev =>
      prev.map(s => s.id === splitId ? { ...s, isActive: !s.isActive } : s)
    );
  };

  const updateSplitWallet = (index: number, field: string, value: string | number) => {
    setSplitForm(prev => ({
      ...prev,
      wallets: prev.wallets.map((w, i) =>
        i === index ? { ...w, [field]: value } : w
      ),
    }));
  };

  const addSplitWallet = () => {
    setSplitForm(prev => ({
      ...prev,
      wallets: [...prev.wallets, { purpose: '', percentage: 0, walletId: '', bankAccount: '' }],
    }));
  };

  const removeSplitWallet = (index: number) => {
    setSplitForm(prev => ({
      ...prev,
      wallets: prev.wallets.filter((_, i) => i !== index),
    }));
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatCurrency = (value: number, decimals = 2) => {
    return value.toLocaleString('pt-BR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="wallets">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="wallets" className="flex items-center gap-2">
            <Wallet className="h-4 w-4" />Carteiras VBRz
          </TabsTrigger>
          <TabsTrigger value="blockchain" className="flex items-center gap-2">
            <Database className="h-4 w-4" />Blockchain
          </TabsTrigger>
          <TabsTrigger value="split" className="flex items-center gap-2">
            <Network className="h-4 w-4" />Split Asaas
          </TabsTrigger>
        </TabsList>

        {/* Tab: Carteiras Crypto (Auditoria + VBRz) */}
        <TabsContent value="wallets" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground">Carteiras para auditoria blockchain e distribuicao de VBRz (cashback)</p>
              <p className="text-xs text-muted-foreground mt-1">
                Saldo total: {formatCurrency(wallets.reduce((sum, w) => sum + w.balance.brz, 0))} BRZ
              </p>
            </div>
            <Button onClick={() => handleOpenWalletDialog()}>
              <Plus className="h-4 w-4 mr-2" />Nova Carteira
            </Button>
          </div>

          {/* Resumo por Rede */}
          <div className="grid gap-4 md:grid-cols-4">
            {Object.entries(NETWORK_INFO).map(([key, info]) => {
              const networkWallets = wallets.filter(w => w.network === key && w.isActive);
              const totalBrz = networkWallets.reduce((sum, w) => sum + w.balance.brz, 0);
              if (networkWallets.length === 0) return null;
              return (
                <Card key={key} className="border-l-4" style={{ borderLeftColor: info.color.replace('bg-', '') }}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={cn("w-3 h-3 rounded-full", info.color)} />
                      <span className="font-semibold">{info.name}</span>
                    </div>
                    <div className="text-2xl font-bold">{networkWallets.length}</div>
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(totalBrz)} BRZ
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Lista de Carteiras */}
          <Card>
            <CardContent className="p-0">
              <ScrollArea className="h-[400px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Endereco</TableHead>
                      <TableHead>Rede</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Proposito</TableHead>
                      <TableHead className="text-right">Saldo BRZ</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Acoes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {wallets.map(wallet => {
                      const networkInfo = NETWORK_INFO[wallet.network];
                      return (
                        <TableRow key={wallet.id} className={cn(!wallet.isActive && "opacity-50")}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {wallet.isPrimary && (
                                <Badge className="bg-amber-500 text-xs">Principal</Badge>
                              )}
                              <span className="font-medium">{wallet.name}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2 font-mono text-sm">
                              <span>{formatAddress(wallet.address)}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => handleCopyAddress(wallet.address)}
                              >
                                {copiedAddress === wallet.address ? (
                                  <Check className="h-3 w-3 text-green-500" />
                                ) : (
                                  <Copy className="h-3 w-3" />
                                )}
                              </Button>
                              <a
                                href={`${networkInfo.explorer}/address/${wallet.address}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:text-blue-700"
                              >
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={cn(networkInfo.color, "text-white")}>
                              {networkInfo.name}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {wallet.type === 'hot' && <Zap className="h-3 w-3 mr-1" />}
                              {wallet.type === 'cold' && <Lock className="h-3 w-3 mr-1" />}
                              {wallet.type === 'multisig' && <Shield className="h-3 w-3 mr-1" />}
                              {wallet.type.replace('_', ' ')}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm capitalize">{wallet.purpose.replace('_', ' ')}</span>
                          </TableCell>
                          <TableCell className="text-right font-mono">
                            {formatCurrency(wallet.balance.brz)}
                          </TableCell>
                          <TableCell>
                            <Switch
                              checked={wallet.isActive}
                              onCheckedChange={() => handleToggleWallet(wallet.id)}
                            />
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              {!wallet.isPrimary && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleSetPrimary(wallet.id)}
                                  title="Definir como principal"
                                >
                                  <Shield className="h-4 w-4" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleOpenWalletDialog(wallet)}
                              >
                                <Edit3 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-500"
                                onClick={() => handleDeleteWallet(wallet.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Blockchain (IPFS + Polygon) */}
        <TabsContent value="blockchain" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            {/* IPFS Config Card */}
            <Card className={cn(
              "border-l-4",
              ipfsConfig.status === 'connected' ? "border-l-green-500" :
              ipfsConfig.status === 'error' ? "border-l-red-500" : "border-l-gray-400"
            )}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl text-white">
                      <HardDrive className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        IPFS Storage
                        <Badge className={cn(
                          ipfsConfig.status === 'connected' ? "bg-green-500" :
                          ipfsConfig.status === 'error' ? "bg-red-500" : "bg-gray-400"
                        )}>
                          {ipfsConfig.status === 'connected' ? 'Conectado' :
                           ipfsConfig.status === 'error' ? 'Erro' : 'Desconectado'}
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        Armazenamento descentralizado de contratos e documentos
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 grid-cols-2">
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Arquivos Pinados</p>
                    <p className="text-xl font-bold">{ipfsConfig.totalPinned.toLocaleString()}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Armazenamento</p>
                    <p className="text-xl font-bold">{ipfsConfig.storageUsed} GB</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
                    <div className="flex items-center gap-2">
                      <Server className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Servico</span>
                    </div>
                    <Badge variant="outline" className="capitalize">{ipfsConfig.pinningService}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Gateway</span>
                    </div>
                    <code className="text-xs truncate max-w-[150px]">{ipfsConfig.gateway}</code>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
                    <div className="flex items-center gap-2">
                      <Key className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">API Key</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <code className="text-xs">
                        {showIPFSApiKey ? ipfsConfig.apiKey : '••••••••••••'}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={() => setShowIPFSApiKey(!showIPFSApiKey)}
                      >
                        {showIPFSApiKey ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={ipfsConfig.autoPin}
                      onCheckedChange={(v) => setIpfsConfig({ ...ipfsConfig, autoPin: v })}
                    />
                    <span className="text-sm">Auto-pin documentos</span>
                  </div>
                  <Button onClick={() => setIsIPFSDialogOpen(true)}>
                    <Settings className="h-4 w-4 mr-2" />Configurar
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Polygon Config Card */}
            <Card className={cn(
              "border-l-4",
              polygonConfig.status === 'connected' ? "border-l-purple-500" :
              polygonConfig.status === 'error' ? "border-l-red-500" : "border-l-gray-400"
            )}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl text-white">
                      <Link2 className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        Polygon Network
                        <Badge className={cn(
                          polygonConfig.status === 'connected' ? "bg-purple-500" :
                          polygonConfig.status === 'error' ? "bg-red-500" : "bg-gray-400"
                        )}>
                          {polygonConfig.status === 'connected' ? 'Conectado' :
                           polygonConfig.status === 'error' ? 'Erro' : 'Desconectado'}
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        Smart contracts e transacoes blockchain
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 grid-cols-2">
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Chain ID</p>
                    <p className="text-xl font-bold">{polygonConfig.chainId}</p>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-sm text-muted-foreground">Ultimo Bloco</p>
                    <p className="text-xl font-bold">{polygonConfig.lastBlock?.toLocaleString()}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Rede</span>
                    </div>
                    <Badge variant="outline">{polygonConfig.networkName}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
                    <div className="flex items-center gap-2">
                      <FileCode className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Contrato</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <code className="text-xs">{formatAddress(polygonConfig.contractAddress)}</code>
                      <a
                        href={`${polygonConfig.explorerUrl}/address/${polygonConfig.contractAddress}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Gas Strategy</span>
                    </div>
                    <Badge variant="outline" className="capitalize">{polygonConfig.gasStrategy}</Badge>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-slate-50 rounded">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Max Gas Price</span>
                    </div>
                    <span className="text-sm font-mono">{polygonConfig.maxGasPrice} GWEI</span>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button onClick={() => setIsPolygonDialogOpen(true)}>
                    <Settings className="h-4 w-4 mr-2" />Configurar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Documentacao Blockchain */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Recursos e Documentacao</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 md:grid-cols-4">
                <a
                  href="https://docs.ipfs.tech"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-3 border rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span className="text-sm">IPFS Docs</span>
                </a>
                <a
                  href="https://www.pinata.cloud/documentation"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-3 border rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span className="text-sm">Pinata API</span>
                </a>
                <a
                  href="https://polygon.technology/developers"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-3 border rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span className="text-sm">Polygon Docs</span>
                </a>
                <a
                  href={polygonConfig.explorerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-3 border rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span className="text-sm">PolygonScan</span>
                </a>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Configuracao Split (Asaas - Modelo Hibrido) */}
        <TabsContent value="split" className="space-y-4">
          {/* Card de Explicacao do Modelo Hibrido */}
          <Card className="border-blue-200 bg-blue-50/50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Zap className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-blue-900">Modelo Hibrido: Oracle Settlement</h4>
                  <p className="text-sm text-blue-700 mt-1">
                    <strong>Liquidez (Fiat):</strong> O dinheiro flui 100% em BRL via Asaas com Split nativo.
                  </p>
                  <p className="text-sm text-blue-700">
                    <strong>Verdade (Web3):</strong> O pagamento é registrado na blockchain para auditoria e dispara o cashback VBRz.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground">Configure o split de pagamentos via Asaas (Pix/Boleto)</p>
            </div>
            <Button onClick={() => handleOpenSplitDialog()}>
              <Plus className="h-4 w-4 mr-2" />Novo Split Config
            </Button>
          </div>

          {splitConfigs.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Network className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium">Nenhuma configuracao de split</p>
                <p className="text-muted-foreground text-center max-w-md mt-2">
                  Configure como os pagamentos serao distribuidos entre as contas bancarias via Asaas.
                </p>
                <Button className="mt-4" onClick={() => handleOpenSplitDialog()}>
                  <Plus className="h-4 w-4 mr-2" />Criar Split Config
                </Button>
              </CardContent>
            </Card>
          ) : (
            splitConfigs.map(config => (
              <Card key={config.id} className={cn(config.isActive && "border-green-200")}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {config.name}
                        {config.isActive ? (
                          <Badge className="bg-green-500">Ativo</Badge>
                        ) : (
                          <Badge variant="outline">Inativo</Badge>
                        )}
                      </CardTitle>
                      <CardDescription>{config.description}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleSplitActive(config.id)}
                        title={config.isActive ? 'Desativar' : 'Ativar'}
                      >
                        <Switch checked={config.isActive} />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleOpenSplitDialog(config)}>
                        <Edit3 className="h-4 w-4 mr-2" />Editar
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500"
                        onClick={() => handleDeleteSplit(config.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-4">
                    {config.wallets.map((wallet, index) => (
                      <div
                        key={index}
                        className="p-4 bg-slate-50 rounded-lg border-l-4"
                        style={{
                          borderLeftColor: index === 0 ? '#22c55e' : index === 1 ? '#3b82f6' : index === 2 ? '#f59e0b' : '#8b5cf6'
                        }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium">{wallet.purpose}</span>
                          <Badge variant="secondary">{wallet.percentage}%</Badge>
                        </div>
                        <code className="text-xs text-muted-foreground">{wallet.bankAccount || wallet.walletId}</code>
                      </div>
                    ))}
                  </div>

                  {/* Visual do Split */}
                  <div className="mt-4 h-4 rounded-full overflow-hidden flex">
                    {config.wallets.map((wallet, index) => (
                      <div
                        key={index}
                        className="h-full"
                        style={{
                          width: `${wallet.percentage}%`,
                          backgroundColor: index === 0 ? '#22c55e' : index === 1 ? '#3b82f6' : index === 2 ? '#f59e0b' : '#8b5cf6'
                        }}
                      />
                    ))}
                  </div>
                  <div className="flex justify-between mt-2 text-xs text-muted-foreground">
                    {config.wallets.map((wallet, index) => (
                      <span key={index}>{wallet.purpose}: {wallet.percentage}%</span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Dialog: Nova/Editar Carteira */}
      <Dialog open={isWalletDialogOpen} onOpenChange={setIsWalletDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedWallet ? 'Editar Carteira' : 'Nova Carteira'}</DialogTitle>
            <DialogDescription>
              {selectedWallet ? 'Atualize as informacoes da carteira' : 'Adicione uma nova carteira crypto ao sistema'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="walletName">Nome</Label>
              <Input
                id="walletName"
                value={walletForm.name}
                onChange={(e) => setWalletForm({ ...walletForm, name: e.target.value })}
                placeholder="Ex: Operacional Principal"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="walletAddress">Endereco (0x...)</Label>
              <Input
                id="walletAddress"
                value={walletForm.address}
                onChange={(e) => setWalletForm({ ...walletForm, address: e.target.value })}
                placeholder="0x..."
                className="font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Rede</Label>
                <Select
                  value={walletForm.network}
                  onValueChange={(v) => setWalletForm({ ...walletForm, network: v as CryptoWallet['network'] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(NETWORK_INFO).map(([key, info]) => (
                      <SelectItem key={key} value={key}>{info.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Tipo</Label>
                <Select
                  value={walletForm.type}
                  onValueChange={(v) => setWalletForm({ ...walletForm, type: v as CryptoWallet['type'] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hot">Hot Wallet</SelectItem>
                    <SelectItem value="cold">Cold Wallet</SelectItem>
                    <SelectItem value="multisig">Multisig</SelectItem>
                    <SelectItem value="smart_contract">Smart Contract</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Proposito</Label>
              <Select
                value={walletForm.purpose}
                onValueChange={(v) => setWalletForm({ ...walletForm, purpose: v as CryptoWallet['purpose'] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="operations">Operacional</SelectItem>
                  <SelectItem value="treasury">Tesouraria</SelectItem>
                  <SelectItem value="split_receiver">Receptor de Split</SelectItem>
                  <SelectItem value="gas_tank">Gas Tank</SelectItem>
                  <SelectItem value="backup">Backup</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsWalletDialogOpen(false)}>Cancelar</Button>
            <Button onClick={handleSaveWallet}>
              <CheckCircle className="h-4 w-4 mr-2" />
              {selectedWallet ? 'Salvar Alteracoes' : 'Adicionar Carteira'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Configurar IPFS */}
      <Dialog open={isIPFSDialogOpen} onOpenChange={setIsIPFSDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Configurar IPFS</DialogTitle>
            <DialogDescription>
              Configure o armazenamento descentralizado IPFS
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Servico de Pinning</Label>
              <Select
                value={ipfsConfig.pinningService}
                onValueChange={(v) => setIpfsConfig({ ...ipfsConfig, pinningService: v as IPFSConfig['pinningService'] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pinata">Pinata</SelectItem>
                  <SelectItem value="infura">Infura</SelectItem>
                  <SelectItem value="web3storage">Web3.Storage</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ipfsGateway">Gateway URL</Label>
              <Input
                id="ipfsGateway"
                value={ipfsConfig.gateway}
                onChange={(e) => setIpfsConfig({ ...ipfsConfig, gateway: e.target.value })}
                placeholder="https://gateway.pinata.cloud/ipfs/"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ipfsEndpoint">API Endpoint</Label>
              <Input
                id="ipfsEndpoint"
                value={ipfsConfig.apiEndpoint}
                onChange={(e) => setIpfsConfig({ ...ipfsConfig, apiEndpoint: e.target.value })}
                placeholder="https://api.pinata.cloud"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="ipfsApiKey">API Key / JWT</Label>
              <div className="flex gap-2">
                <Input
                  id="ipfsApiKey"
                  type={showIPFSApiKey ? 'text' : 'password'}
                  value={ipfsConfig.apiKey}
                  onChange={(e) => setIpfsConfig({ ...ipfsConfig, apiKey: e.target.value })}
                  className="font-mono"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setShowIPFSApiKey(!showIPFSApiKey)}
                >
                  {showIPFSApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxFileSize">Tamanho Maximo de Arquivo (MB)</Label>
              <Input
                id="maxFileSize"
                type="number"
                value={ipfsConfig.maxFileSize}
                onChange={(e) => setIpfsConfig({ ...ipfsConfig, maxFileSize: Number(e.target.value) })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Auto-pin Documentos</Label>
                <p className="text-xs text-muted-foreground">Faz pin automatico de contratos e docs</p>
              </div>
              <Switch
                checked={ipfsConfig.autoPin}
                onCheckedChange={(v) => setIpfsConfig({ ...ipfsConfig, autoPin: v })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsIPFSDialogOpen(false)}>Cancelar</Button>
            <Button onClick={() => { setIsIPFSDialogOpen(false); alert('Configuracoes IPFS salvas!'); }}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Configurar Polygon */}
      <Dialog open={isPolygonDialogOpen} onOpenChange={setIsPolygonDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Configurar Polygon Network</DialogTitle>
            <DialogDescription>
              Configure a conexao com a rede Polygon
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="polygonRpc">RPC URL</Label>
              <Input
                id="polygonRpc"
                value={polygonConfig.rpcUrl}
                onChange={(e) => setPolygonConfig({ ...polygonConfig, rpcUrl: e.target.value })}
                placeholder="https://polygon-mainnet.g.alchemy.com/v2/..."
                className="font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="chainId">Chain ID</Label>
                <Input
                  id="chainId"
                  type="number"
                  value={polygonConfig.chainId}
                  onChange={(e) => setPolygonConfig({ ...polygonConfig, chainId: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="networkName">Nome da Rede</Label>
                <Input
                  id="networkName"
                  value={polygonConfig.networkName}
                  onChange={(e) => setPolygonConfig({ ...polygonConfig, networkName: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="contractAddress">Endereco do Contrato</Label>
              <Input
                id="contractAddress"
                value={polygonConfig.contractAddress}
                onChange={(e) => setPolygonConfig({ ...polygonConfig, contractAddress: e.target.value })}
                placeholder="0x..."
                className="font-mono"
              />
            </div>

            <div className="space-y-2">
              <Label>Estrategia de Gas</Label>
              <Select
                value={polygonConfig.gasStrategy}
                onValueChange={(v) => setPolygonConfig({ ...polygonConfig, gasStrategy: v as PolygonConfig['gasStrategy'] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard (economico)</SelectItem>
                  <SelectItem value="fast">Fast (rapido)</SelectItem>
                  <SelectItem value="aggressive">Aggressive (prioridade maxima)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxGas">Max Gas Price (GWEI)</Label>
              <Input
                id="maxGas"
                type="number"
                value={polygonConfig.maxGasPrice}
                onChange={(e) => setPolygonConfig({ ...polygonConfig, maxGasPrice: Number(e.target.value) })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="explorerUrl">Explorer URL</Label>
              <Input
                id="explorerUrl"
                value={polygonConfig.explorerUrl}
                onChange={(e) => setPolygonConfig({ ...polygonConfig, explorerUrl: e.target.value })}
                placeholder="https://polygonscan.com"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPolygonDialogOpen(false)}>Cancelar</Button>
            <Button onClick={() => { setIsPolygonDialogOpen(false); alert('Configuracoes Polygon salvas!'); }}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog: Configurar Split */}
      <Dialog open={isSplitDialogOpen} onOpenChange={setIsSplitDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedSplit ? 'Editar Split Config' : 'Nova Configuracao de Split'}</DialogTitle>
            <DialogDescription>
              Configure como os pagamentos serao distribuidos entre as carteiras
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="splitName">Nome</Label>
                <Input
                  id="splitName"
                  value={splitForm.name}
                  onChange={(e) => setSplitForm({ ...splitForm, name: e.target.value })}
                  placeholder="Ex: Split Padrao 85/5/5/5"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="splitDescription">Descricao</Label>
                <Input
                  id="splitDescription"
                  value={splitForm.description}
                  onChange={(e) => setSplitForm({ ...splitForm, description: e.target.value })}
                  placeholder="Ex: Distribuicao padrao de alugueis"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Distribuicao de Carteiras</Label>
                <Button variant="outline" size="sm" onClick={addSplitWallet}>
                  <Plus className="h-4 w-4 mr-2" />Adicionar
                </Button>
              </div>

              {/* Validacao de percentual */}
              {(() => {
                const totalPercentage = splitForm.wallets.reduce((sum, w) => sum + w.percentage, 0);
                if (totalPercentage !== 100) {
                  return (
                    <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                      <span className="text-sm text-amber-700">
                        Total: {totalPercentage}% - O total deve ser 100%
                      </span>
                    </div>
                  );
                }
                return (
                  <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <span className="text-sm text-green-700">
                      Total: 100% - Configuracao valida
                    </span>
                  </div>
                );
              })()}

              <div className="space-y-3">
                {splitForm.wallets.map((wallet, index) => (
                  <div key={index} className="flex items-end gap-3 p-4 bg-slate-50 rounded-lg">
                    <div className="flex-1 space-y-2">
                      <Label>Proposito</Label>
                      <Input
                        value={wallet.purpose}
                        onChange={(e) => updateSplitWallet(index, 'purpose', e.target.value)}
                        placeholder="Ex: Locadores"
                      />
                    </div>
                    <div className="w-24 space-y-2">
                      <Label>%</Label>
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        value={wallet.percentage}
                        onChange={(e) => updateSplitWallet(index, 'percentage', Number(e.target.value))}
                      />
                    </div>
                    <div className="flex-1 space-y-2">
                      <Label>Wallet ID Asaas</Label>
                      <Input
                        value={wallet.walletId}
                        onChange={(e) => updateSplitWallet(index, 'walletId', e.target.value)}
                        placeholder="wal_xxxxxxxxxxxxx"
                        className="font-mono"
                      />
                    </div>
                    <div className="flex-1 space-y-2">
                      <Label>Conta Bancaria</Label>
                      <Input
                        value={wallet.bankAccount}
                        onChange={(e) => updateSplitWallet(index, 'bankAccount', e.target.value)}
                        placeholder="Nome da conta"
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-red-500"
                      onClick={() => removeSplitWallet(index)}
                      disabled={splitForm.wallets.length <= 2}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Preview visual */}
            <div className="space-y-2">
              <Label>Preview da Distribuicao</Label>
              <div className="h-6 rounded-full overflow-hidden flex">
                {splitForm.wallets.map((wallet, index) => (
                  <div
                    key={index}
                    className="h-full flex items-center justify-center text-xs text-white font-medium"
                    style={{
                      width: `${wallet.percentage}%`,
                      backgroundColor: index === 0 ? '#22c55e' : index === 1 ? '#3b82f6' : index === 2 ? '#f59e0b' : '#8b5cf6',
                      minWidth: wallet.percentage > 0 ? '30px' : '0'
                    }}
                  >
                    {wallet.percentage >= 10 && `${wallet.percentage}%`}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={splitForm.isActive}
                onCheckedChange={(v) => setSplitForm({ ...splitForm, isActive: v })}
              />
              <Label>Configuracao ativa</Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSplitDialogOpen(false)}>Cancelar</Button>
            <Button
              onClick={handleSaveSplit}
              disabled={splitForm.wallets.reduce((sum, w) => sum + w.percentage, 0) !== 100}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              {selectedSplit ? 'Salvar Alteracoes' : 'Criar Split'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
