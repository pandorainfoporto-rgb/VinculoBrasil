// ============================================
// ADMIN INTEGRATIONS - Gestao de Chaves de API
// Pinata (IPFS), Asaas (Pagamentos), OpenAI (IA), Smart Contract
// ============================================

import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import {
  Box,
  Server,
  Brain,
  Save,
  Shield,
  CheckCircle,
  XCircle,
  Loader2,
  RefreshCw,
  Eye,
  EyeOff,
  ExternalLink,
  AlertTriangle,
  Zap,
  Database,
  Lock,
  Link2,
  Hexagon,
  Wallet,
  Coins,
  Gift,
  Users,
  FileText,
  Clock,
  Copy,
} from 'lucide-react';

export const Route = createFileRoute('/admin/integrations' as never)({
  component: AdminIntegrationsPage,
});

interface IntegrationConfig {
  key: string;
  value: string;
  maskedValue?: string;
  category: string;
  updatedAt?: string;
  isConfigured: boolean;
}

interface IntegrationStatus {
  pinata: 'unconfigured' | 'configured' | 'testing' | 'success' | 'error';
  asaas: 'unconfigured' | 'configured' | 'testing' | 'success' | 'error';
  openai: 'unconfigured' | 'configured' | 'testing' | 'success' | 'error';
  smartContract: 'unconfigured' | 'configured' | 'testing' | 'success' | 'error';
  receivablesContract: 'unconfigured' | 'configured' | 'testing' | 'success' | 'error';
  p2pContract: 'unconfigured' | 'configured' | 'testing' | 'success' | 'error';
}

function AdminIntegrationsPage() {
  // Estado das chaves
  const [pinataJwt, setPinataJwt] = useState('');
  const [asaasApiKey, setAsaasApiKey] = useState('');
  const [openaiApiKey, setOpenaiApiKey] = useState('');
  const [smartContractAddress, setSmartContractAddress] = useState('');
  const [receivablesContractAddress, setReceivablesContractAddress] = useState('');
  const [p2pContractAddress, setP2pContractAddress] = useState('');

  // Estado das carteiras do ecossistema
  const [treasuryWallet, setTreasuryWallet] = useState(import.meta.env.VITE_TREASURY_WALLET || '');
  const [cashbackWallet, setCashbackWallet] = useState(import.meta.env.VITE_CASHBACK_WALLET || '');
  const [marketingWallet, setMarketingWallet] = useState(import.meta.env.VITE_MARKETING_WALLET || '');
  const [teamLeaderWallet, setTeamLeaderWallet] = useState(import.meta.env.VITE_TEAM_LEADER_WALLET || '');
  const [vbrzContract, setVbrzContract] = useState(import.meta.env.VITE_VBRZ_CONTRACT || '');
  const [vestingContract, setVestingContract] = useState(import.meta.env.VITE_VESTING_CONTRACT || '');

  // Estado de visibilidade
  const [showPinata, setShowPinata] = useState(false);
  const [showAsaas, setShowAsaas] = useState(false);
  const [showOpenai, setShowOpenai] = useState(false);

  // Estado de carregamento
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [testing, setTesting] = useState<string | null>(null);

  // Status das integrações
  const [status, setStatus] = useState<IntegrationStatus>({
    pinata: 'unconfigured',
    asaas: 'unconfigured',
    openai: 'unconfigured',
    smartContract: 'unconfigured',
    receivablesContract: 'unconfigured',
    p2pContract: 'unconfigured',
  });

  // Configs carregadas
  const [configs, setConfigs] = useState<IntegrationConfig[]>([]);

  // Carregar configurações existentes
  useEffect(() => {
    loadConfigs();
  }, []);

  const loadConfigs = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/admin/integrations`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setConfigs(data.configs || []);

        // Atualizar status baseado nas configs
        const newStatus: IntegrationStatus = {
          pinata: 'unconfigured',
          asaas: 'unconfigured',
          openai: 'unconfigured',
          smartContract: 'unconfigured',
          receivablesContract: 'unconfigured',
          p2pContract: 'unconfigured',
        };

        data.configs?.forEach((cfg: IntegrationConfig) => {
          if (cfg.key === 'PINATA_JWT' && cfg.isConfigured) newStatus.pinata = 'configured';
          if (cfg.key === 'ASAAS_API_KEY' && cfg.isConfigured) newStatus.asaas = 'configured';
          if (cfg.key === 'OPENAI_API_KEY' && cfg.isConfigured) newStatus.openai = 'configured';
          if (cfg.key === 'SMART_CONTRACT_ADDRESS' && cfg.isConfigured) newStatus.smartContract = 'configured';
          if (cfg.key === 'RECEIVABLES_CONTRACT_ADDRESS' && cfg.isConfigured) newStatus.receivablesContract = 'configured';
          if (cfg.key === 'P2P_CONTRACT_ADDRESS' && cfg.isConfigured) newStatus.p2pContract = 'configured';
        });

        setStatus(newStatus);
      }
    } catch (err) {
      console.error('Erro ao carregar configs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (key: string, value: string, category: string) => {
    if (!value.trim()) {
      toast.error('Insira um valor válido');
      return;
    }

    setSaving(key);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/admin/integrations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ key, value, category }),
      });

      if (!response.ok) {
        throw new Error('Erro ao salvar');
      }

      toast.success(`${key} salva com sucesso!`);

      // Atualizar status
      if (key === 'PINATA_JWT') {
        setStatus(s => ({ ...s, pinata: 'configured' }));
        setPinataJwt('');
      }
      if (key === 'ASAAS_API_KEY') {
        setStatus(s => ({ ...s, asaas: 'configured' }));
        setAsaasApiKey('');
      }
      if (key === 'OPENAI_API_KEY') {
        setStatus(s => ({ ...s, openai: 'configured' }));
        setOpenaiApiKey('');
      }
      if (key === 'SMART_CONTRACT_ADDRESS') {
        setStatus(s => ({ ...s, smartContract: 'configured' }));
        setSmartContractAddress('');
      }
      if (key === 'RECEIVABLES_CONTRACT_ADDRESS') {
        setStatus(s => ({ ...s, receivablesContract: 'configured' }));
        setReceivablesContractAddress('');
      }
      if (key === 'P2P_CONTRACT_ADDRESS') {
        setStatus(s => ({ ...s, p2pContract: 'configured' }));
        setP2pContractAddress('');
      }

      // Recarregar configs
      await loadConfigs();
    } catch (err) {
      toast.error('Erro ao salvar configuração');
    } finally {
      setSaving(null);
    }
  };

  const handleTest = async (service: 'pinata' | 'asaas' | 'openai') => {
    setTesting(service);
    setStatus(s => ({ ...s, [service]: 'testing' }));

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || ''}/api/admin/integrations/test/${service}`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        setStatus(s => ({ ...s, [service]: 'success' }));
        toast.success(`Conexão com ${service.toUpperCase()} funcionando!`);
      } else {
        setStatus(s => ({ ...s, [service]: 'error' }));
        toast.error(`Falha na conexão com ${service.toUpperCase()}`);
      }
    } catch (err) {
      setStatus(s => ({ ...s, [service]: 'error' }));
      toast.error(`Erro ao testar ${service.toUpperCase()}`);
    } finally {
      setTesting(null);
    }
  };

  const getStatusBadge = (statusValue: string) => {
    switch (statusValue) {
      case 'success':
        return (
          <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Conectado
          </Badge>
        );
      case 'error':
        return (
          <Badge className="bg-red-100 text-red-700 border-red-200">
            <XCircle className="w-3 h-3 mr-1" />
            Erro
          </Badge>
        );
      case 'testing':
        return (
          <Badge className="bg-blue-100 text-blue-700 border-blue-200">
            <Loader2 className="w-3 h-3 mr-1 animate-spin" />
            Testando
          </Badge>
        );
      case 'configured':
        return (
          <Badge className="bg-amber-100 text-amber-700 border-amber-200">
            <CheckCircle className="w-3 h-3 mr-1" />
            Configurado
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-slate-500">
            <XCircle className="w-3 h-3 mr-1" />
            Não configurado
          </Badge>
        );
    }
  };

  const getConfigValue = (key: string) => {
    const config = configs.find(c => c.key === key);
    return config?.maskedValue || '';
  };

  if (loading) {
    return (
      <AdminLayout userName="Administrador">
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout userName="Administrador">
      <div className="min-h-screen bg-slate-950 p-6">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-white">Integrações do Sistema</h1>
          <p className="text-slate-400 mt-2">
            Gerencie as chaves de API para Blockchain/IPFS, Pagamentos e Inteligência Artificial.
          </p>
        </div>

        {/* Security Notice */}
        <Alert className="bg-blue-900/30 border-blue-700">
          <Shield className="h-4 w-4 text-blue-400" />
          <AlertDescription className="text-blue-300">
            <strong>Segurança:</strong> Todas as chaves são criptografadas antes de serem salvas no banco de dados.
            Os valores exibidos são mascarados para sua proteção.
          </AlertDescription>
        </Alert>

        {/* ========================================
            GESTÃO DE CARTEIRAS DO ECOSSISTEMA
        ======================================== */}
        <Card className="border-amber-200 shadow-md bg-gradient-to-br from-amber-50 to-yellow-50">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-br from-amber-500 to-yellow-600 rounded-xl text-white shadow-lg shadow-amber-200">
                  <Wallet className="w-6 h-6" />
                </div>
                <div>
                  <CardTitle className="text-xl text-amber-900">Gestão de Carteiras do Ecossistema</CardTitle>
                  <CardDescription className="text-amber-700">
                    Endereços das carteiras operacionais do token VBRz e contratos
                  </CardDescription>
                </div>
              </div>
              <Badge className="bg-amber-100 text-amber-800 border-amber-300">
                <Coins className="w-3 h-3 mr-1" />
                VBRz Token
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Grid de Carteiras */}
            <div className="grid md:grid-cols-2 gap-4">
              {/* Treasury Wallet */}
              <div className="space-y-2">
                <Label className="text-amber-900 flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-amber-600" />
                  Treasury Wallet (Tesouraria)
                </Label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="0x..."
                    value={treasuryWallet}
                    onChange={e => setTreasuryWallet(e.target.value)}
                    className="font-mono text-sm bg-white border-amber-200"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      navigator.clipboard.writeText(treasuryWallet);
                      toast.success('Endereço copiado!');
                    }}
                    className="border-amber-300 hover:bg-amber-100"
                  >
                    <Copy className="w-4 h-4 text-amber-600" />
                  </Button>
                  {treasuryWallet && (
                    <a
                      href={`https://polygonscan.com/address/${treasuryWallet}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center w-10 h-10 rounded-md border border-amber-300 hover:bg-amber-100"
                    >
                      <ExternalLink className="w-4 h-4 text-amber-600" />
                    </a>
                  )}
                </div>
                <p className="text-xs text-amber-600">Recebe taxas da plataforma e lucros operacionais</p>
              </div>

              {/* Cashback Wallet */}
              <div className="space-y-2">
                <Label className="text-amber-900 flex items-center gap-2">
                  <Gift className="w-4 h-4 text-green-600" />
                  Cashback Wallet (Pool)
                </Label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="0x..."
                    value={cashbackWallet}
                    onChange={e => setCashbackWallet(e.target.value)}
                    className="font-mono text-sm bg-white border-amber-200"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      navigator.clipboard.writeText(cashbackWallet);
                      toast.success('Endereço copiado!');
                    }}
                    className="border-amber-300 hover:bg-amber-100"
                  >
                    <Copy className="w-4 h-4 text-amber-600" />
                  </Button>
                  {cashbackWallet && (
                    <a
                      href={`https://polygonscan.com/address/${cashbackWallet}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center w-10 h-10 rounded-md border border-amber-300 hover:bg-amber-100"
                    >
                      <ExternalLink className="w-4 h-4 text-amber-600" />
                    </a>
                  )}
                </div>
                <p className="text-xs text-amber-600">Distribui cashback VBRz para usuários</p>
              </div>

              {/* Marketing Wallet */}
              <div className="space-y-2">
                <Label className="text-amber-900 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-purple-600" />
                  Marketing Wallet
                </Label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="0x..."
                    value={marketingWallet}
                    onChange={e => setMarketingWallet(e.target.value)}
                    className="font-mono text-sm bg-white border-amber-200"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      navigator.clipboard.writeText(marketingWallet);
                      toast.success('Endereço copiado!');
                    }}
                    className="border-amber-300 hover:bg-amber-100"
                  >
                    <Copy className="w-4 h-4 text-amber-600" />
                  </Button>
                  {marketingWallet && (
                    <a
                      href={`https://polygonscan.com/address/${marketingWallet}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center w-10 h-10 rounded-md border border-amber-300 hover:bg-amber-100"
                    >
                      <ExternalLink className="w-4 h-4 text-amber-600" />
                    </a>
                  )}
                </div>
                <p className="text-xs text-amber-600">Campanhas, parcerias e airdrops</p>
              </div>

              {/* Team Leader Wallet */}
              <div className="space-y-2">
                <Label className="text-amber-900 flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  Team Leader Wallet
                </Label>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="0x..."
                    value={teamLeaderWallet}
                    onChange={e => setTeamLeaderWallet(e.target.value)}
                    className="font-mono text-sm bg-white border-amber-200"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      navigator.clipboard.writeText(teamLeaderWallet);
                      toast.success('Endereço copiado!');
                    }}
                    className="border-amber-300 hover:bg-amber-100"
                  >
                    <Copy className="w-4 h-4 text-amber-600" />
                  </Button>
                  {teamLeaderWallet && (
                    <a
                      href={`https://polygonscan.com/address/${teamLeaderWallet}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center w-10 h-10 rounded-md border border-amber-300 hover:bg-amber-100"
                    >
                      <ExternalLink className="w-4 h-4 text-amber-600" />
                    </a>
                  )}
                </div>
                <p className="text-xs text-amber-600">Alocação da equipe fundadora (vesting)</p>
              </div>
            </div>

            <Separator className="bg-amber-200" />

            {/* Contratos VBRz */}
            <div className="space-y-4">
              <h4 className="font-semibold text-amber-900 flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Contratos Inteligentes VBRz
              </h4>

              <div className="grid md:grid-cols-2 gap-4">
                {/* VBRz Token Contract */}
                <div className="space-y-2">
                  <Label className="text-amber-900 flex items-center gap-2">
                    <Coins className="w-4 h-4 text-amber-600" />
                    Contrato VBRz Token (ERC-20)
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="0x..."
                      value={vbrzContract}
                      onChange={e => setVbrzContract(e.target.value)}
                      className="font-mono text-sm bg-white border-amber-200"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        navigator.clipboard.writeText(vbrzContract);
                        toast.success('Endereço copiado!');
                      }}
                      className="border-amber-300 hover:bg-amber-100"
                    >
                      <Copy className="w-4 h-4 text-amber-600" />
                    </Button>
                    {vbrzContract && (
                      <a
                        href={`https://polygonscan.com/address/${vbrzContract}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center w-10 h-10 rounded-md border border-amber-300 hover:bg-amber-100"
                      >
                        <ExternalLink className="w-4 h-4 text-amber-600" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Vesting Contract */}
                <div className="space-y-2">
                  <Label className="text-amber-900 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-indigo-600" />
                    Contrato de Vesting
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      type="text"
                      placeholder="0x..."
                      value={vestingContract}
                      onChange={e => setVestingContract(e.target.value)}
                      className="font-mono text-sm bg-white border-amber-200"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        navigator.clipboard.writeText(vestingContract);
                        toast.success('Endereço copiado!');
                      }}
                      className="border-amber-300 hover:bg-amber-100"
                    >
                      <Copy className="w-4 h-4 text-amber-600" />
                    </Button>
                    {vestingContract && (
                      <a
                        href={`https://polygonscan.com/address/${vestingContract}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center w-10 h-10 rounded-md border border-amber-300 hover:bg-amber-100"
                      >
                        <ExternalLink className="w-4 h-4 text-amber-600" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Botão de Salvar */}
            <div className="flex justify-end pt-2">
              <Button
                onClick={() => {
                  // Aqui seria chamada a API para salvar os endereços
                  toast.success('Carteiras salvas com sucesso!');
                }}
                className="bg-amber-600 hover:bg-amber-700 text-white"
              >
                <Save className="w-4 h-4 mr-2" />
                Salvar Alterações
              </Button>
            </div>

            {/* Info */}
            <div className="bg-amber-100 p-3 rounded-lg text-sm text-amber-800 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>
                <strong>Importante:</strong> Alterações nos endereços de carteira afetam todo o ecossistema VBRz.
                Certifique-se de que os endereços estão corretos antes de salvar. Endereços incorretos podem
                resultar em perda permanente de tokens.
              </span>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6">
          {/* ========================================
              SMART CONTRACT - POLYGON BLOCKCHAIN
          ======================================== */}
          <Card className="border-violet-100 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl text-white shadow-lg shadow-violet-200">
                    <Hexagon className="w-6 h-6" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Smart Contract (Polygon)</CardTitle>
                    <CardDescription>
                      Endereço do contrato inteligente para NFTs de Vistoria e Contratos
                    </CardDescription>
                  </div>
                </div>
                {getStatusBadge(status.smartContract)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Info atual */}
              {getConfigValue('SMART_CONTRACT_ADDRESS') && (
                <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Link2 className="w-4 h-4" />
                    <span>Contrato atual:</span>
                    <code className="bg-slate-200 px-2 py-0.5 rounded text-xs font-mono">
                      {getConfigValue('SMART_CONTRACT_ADDRESS')}
                    </code>
                    <a
                      href={`https://polygonscan.com/address/${getConfigValue('SMART_CONTRACT_ADDRESS').replace('••••••••', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-violet-600 hover:underline"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              )}

              {/* Input novo endereco */}
              <div className="space-y-2">
                <Label className="text-slate-700">
                  Endereço do Smart Contract (0x...)
                  <a
                    href="https://polygonscan.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 text-violet-600 hover:underline text-xs inline-flex items-center gap-1"
                  >
                    Ver no PolygonScan <ExternalLink className="w-3 h-3" />
                  </a>
                </Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      type="text"
                      placeholder="0x6748Cf729dc62bef157b40ABBd44365c2f12702a"
                      value={smartContractAddress}
                      onChange={e => setSmartContractAddress(e.target.value)}
                      className="font-mono text-sm"
                    />
                  </div>
                  <Button
                    onClick={() => handleSave('SMART_CONTRACT_ADDRESS', smartContractAddress, 'BLOCKCHAIN')}
                    disabled={saving === 'SMART_CONTRACT_ADDRESS' || !smartContractAddress.trim()}
                    className="bg-violet-600 hover:bg-violet-700"
                  >
                    {saving === 'SMART_CONTRACT_ADDRESS' ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Salvar
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Uso */}
              <div className="bg-violet-50 p-3 rounded-lg text-sm text-violet-800 flex items-start gap-2">
                <Hexagon className="w-4 h-4 mt-0.5 shrink-0" />
                <span>
                  <strong>Uso:</strong> Registro imutável de vistorias e contratos na blockchain Polygon.
                  Mint de NFTs de contrato e armazenamento de hashes de vistoria.
                </span>
              </div>
            </CardContent>
          </Card>

          {/* ========================================
              RECEIVABLES CONTRACT - ERC1155 TOKEN
          ======================================== */}
          <Card className="border-indigo-100 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl text-white shadow-lg shadow-indigo-200">
                    <Hexagon className="w-6 h-6" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Contrato de Recebíveis (ERC1155)</CardTitle>
                    <CardDescription>
                      Tokenização de recebíveis de aluguel para cessão de crédito
                    </CardDescription>
                  </div>
                </div>
                {getStatusBadge(status.receivablesContract)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Info atual */}
              {getConfigValue('RECEIVABLES_CONTRACT_ADDRESS') && (
                <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Link2 className="w-4 h-4" />
                    <span>Contrato atual:</span>
                    <code className="bg-slate-200 px-2 py-0.5 rounded text-xs font-mono">
                      {getConfigValue('RECEIVABLES_CONTRACT_ADDRESS')}
                    </code>
                    <a
                      href={`https://polygonscan.com/address/${getConfigValue('RECEIVABLES_CONTRACT_ADDRESS').replace('••••••••', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:underline"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              )}

              {/* Input novo endereco */}
              <div className="space-y-2">
                <Label className="text-slate-700">
                  Endereço do Contrato de Recebíveis (0x...)
                </Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      type="text"
                      placeholder="0x4081D8c80bae80aB36AaE3e83082BE1083C32F9A"
                      value={receivablesContractAddress}
                      onChange={e => setReceivablesContractAddress(e.target.value)}
                      className="font-mono text-sm"
                    />
                  </div>
                  <Button
                    onClick={() => handleSave('RECEIVABLES_CONTRACT_ADDRESS', receivablesContractAddress, 'BLOCKCHAIN')}
                    disabled={saving === 'RECEIVABLES_CONTRACT_ADDRESS' || !receivablesContractAddress.trim()}
                    className="bg-indigo-600 hover:bg-indigo-700"
                  >
                    {saving === 'RECEIVABLES_CONTRACT_ADDRESS' ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Salvar
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Uso */}
              <div className="bg-indigo-50 p-3 rounded-lg text-sm text-indigo-800 flex items-start gap-2">
                <Hexagon className="w-4 h-4 mt-0.5 shrink-0" />
                <span>
                  <strong>Uso:</strong> Tokenização de recebíveis futuros de aluguel (ERC-1155).
                  Permite a cessão de crédito digital no marketplace P2P.
                </span>
              </div>
            </CardContent>
          </Card>

          {/* ========================================
              P2P MARKETPLACE CONTRACT
          ======================================== */}
          <Card className="border-cyan-100 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-cyan-500 to-teal-600 rounded-xl text-white shadow-lg shadow-cyan-200">
                    <Hexagon className="w-6 h-6" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Marketplace P2P</CardTitle>
                    <CardDescription>
                      Contrato para negociação de recebíveis entre investidores
                    </CardDescription>
                  </div>
                </div>
                {getStatusBadge(status.p2pContract)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Info atual */}
              {getConfigValue('P2P_CONTRACT_ADDRESS') && (
                <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Link2 className="w-4 h-4" />
                    <span>Contrato atual:</span>
                    <code className="bg-slate-200 px-2 py-0.5 rounded text-xs font-mono">
                      {getConfigValue('P2P_CONTRACT_ADDRESS')}
                    </code>
                    <a
                      href={`https://polygonscan.com/address/${getConfigValue('P2P_CONTRACT_ADDRESS').replace('••••••••', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-cyan-600 hover:underline"
                    >
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              )}

              {/* Input novo endereco */}
              <div className="space-y-2">
                <Label className="text-slate-700">
                  Endereço do Contrato P2P Marketplace (0x...)
                </Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      type="text"
                      placeholder="0x8641445fD7079Bd439F137Aaec5D3b534bB608a0"
                      value={p2pContractAddress}
                      onChange={e => setP2pContractAddress(e.target.value)}
                      className="font-mono text-sm"
                    />
                  </div>
                  <Button
                    onClick={() => handleSave('P2P_CONTRACT_ADDRESS', p2pContractAddress, 'BLOCKCHAIN')}
                    disabled={saving === 'P2P_CONTRACT_ADDRESS' || !p2pContractAddress.trim()}
                    className="bg-cyan-600 hover:bg-cyan-700"
                  >
                    {saving === 'P2P_CONTRACT_ADDRESS' ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Salvar
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Uso */}
              <div className="bg-cyan-50 p-3 rounded-lg text-sm text-cyan-800 flex items-start gap-2">
                <Hexagon className="w-4 h-4 mt-0.5 shrink-0" />
                <span>
                  <strong>Uso:</strong> Marketplace P2P para cessão de crédito digital.
                  Investidores podem comprar recebíveis tokenizados com deságio.
                </span>
              </div>
            </CardContent>
          </Card>

          {/* ========================================
              PINATA - IPFS / BLOCKCHAIN STORAGE
          ======================================== */}
          <Card className="border-purple-100 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl text-white shadow-lg shadow-purple-200">
                    <Box className="w-6 h-6" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">IPFS & Blockchain (Pinata)</CardTitle>
                    <CardDescription>
                      Armazenamento descentralizado para fotos de vistoria e metadados NFT
                    </CardDescription>
                  </div>
                </div>
                {getStatusBadge(status.pinata)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Info atual */}
              {getConfigValue('PINATA_JWT') && (
                <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Lock className="w-4 h-4" />
                    <span>Chave atual:</span>
                    <code className="bg-slate-200 px-2 py-0.5 rounded text-xs font-mono">
                      {getConfigValue('PINATA_JWT')}
                    </code>
                  </div>
                </div>
              )}

              {/* Input nova chave */}
              <div className="space-y-2">
                <Label className="text-slate-700">
                  Pinata JWT (Secret Token)
                  <a
                    href="https://app.pinata.cloud/developers/api-keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 text-purple-600 hover:underline text-xs inline-flex items-center gap-1"
                  >
                    Obter chave <ExternalLink className="w-3 h-3" />
                  </a>
                </Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      type={showPinata ? 'text' : 'password'}
                      placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                      value={pinataJwt}
                      onChange={e => setPinataJwt(e.target.value)}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPinata(!showPinata)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPinata ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <Button
                    onClick={() => handleSave('PINATA_JWT', pinataJwt, 'STORAGE')}
                    disabled={saving === 'PINATA_JWT' || !pinataJwt.trim()}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {saving === 'PINATA_JWT' ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Salvar
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Testar conexão */}
              {status.pinata !== 'unconfigured' && (
                <>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-500">
                      Testar conexão com a API do Pinata
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTest('pinata')}
                      disabled={testing === 'pinata'}
                    >
                      {testing === 'pinata' ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <RefreshCw className="w-4 h-4 mr-2" />
                      )}
                      Testar Conexão
                    </Button>
                  </div>
                </>
              )}

              {/* Uso */}
              <div className="bg-purple-50 p-3 rounded-lg text-sm text-purple-800 flex items-start gap-2">
                <Database className="w-4 h-4 mt-0.5 shrink-0" />
                <span>
                  <strong>Uso:</strong> Upload de fotos de vistoria para IPFS, armazenamento
                  permanente e descentralizado com hash imutável para prova jurídica.
                </span>
              </div>
            </CardContent>
          </Card>

          {/* ========================================
              ASAAS - PAGAMENTOS
          ======================================== */}
          <Card className="border-blue-100 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl text-white shadow-lg shadow-blue-200">
                    <Server className="w-6 h-6" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Gateway de Pagamento (Asaas)</CardTitle>
                    <CardDescription>
                      Processamento de boletos, PIX e splits automáticos
                    </CardDescription>
                  </div>
                </div>
                {getStatusBadge(status.asaas)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Info atual */}
              {getConfigValue('ASAAS_API_KEY') && (
                <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Lock className="w-4 h-4" />
                    <span>Chave atual:</span>
                    <code className="bg-slate-200 px-2 py-0.5 rounded text-xs font-mono">
                      {getConfigValue('ASAAS_API_KEY')}
                    </code>
                  </div>
                </div>
              )}

              {/* Input nova chave */}
              <div className="space-y-2">
                <Label className="text-slate-700">
                  Asaas API Key (Produção)
                  <a
                    href="https://www.asaas.com/settings/api"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 text-blue-600 hover:underline text-xs inline-flex items-center gap-1"
                  >
                    Obter chave <ExternalLink className="w-3 h-3" />
                  </a>
                </Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      type={showAsaas ? 'text' : 'password'}
                      placeholder="$aact_YTU5YTE0M2M2..."
                      value={asaasApiKey}
                      onChange={e => setAsaasApiKey(e.target.value)}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAsaas(!showAsaas)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showAsaas ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <Button
                    onClick={() => handleSave('ASAAS_API_KEY', asaasApiKey, 'PAYMENT')}
                    disabled={saving === 'ASAAS_API_KEY' || !asaasApiKey.trim()}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {saving === 'ASAAS_API_KEY' ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Salvar
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Testar conexão */}
              {status.asaas !== 'unconfigured' && (
                <>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-500">
                      Testar conexão com a API do Asaas
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTest('asaas')}
                      disabled={testing === 'asaas'}
                    >
                      {testing === 'asaas' ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <RefreshCw className="w-4 h-4 mr-2" />
                      )}
                      Testar Conexão
                    </Button>
                  </div>
                </>
              )}

              {/* Uso */}
              <div className="bg-blue-50 p-3 rounded-lg text-sm text-blue-800 flex items-start gap-2">
                <Zap className="w-4 h-4 mt-0.5 shrink-0" />
                <span>
                  <strong>Uso:</strong> Geração de boletos, cobranças PIX, splits automáticos
                  entre proprietário/imobiliária e gestão de inadimplência.
                </span>
              </div>
            </CardContent>
          </Card>

          {/* ========================================
              OPENAI - INTELIGÊNCIA ARTIFICIAL
          ======================================== */}
          <Card className="border-emerald-100 shadow-sm hover:shadow-md transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl text-white shadow-lg shadow-emerald-200">
                    <Brain className="w-6 h-6" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Visão Computacional (OpenAI)</CardTitle>
                    <CardDescription>
                      Motor de análise de fotos para vistoria inteligente
                    </CardDescription>
                  </div>
                </div>
                {getStatusBadge(status.openai)}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Info atual */}
              {getConfigValue('OPENAI_API_KEY') && (
                <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Lock className="w-4 h-4" />
                    <span>Chave atual:</span>
                    <code className="bg-slate-200 px-2 py-0.5 rounded text-xs font-mono">
                      {getConfigValue('OPENAI_API_KEY')}
                    </code>
                  </div>
                </div>
              )}

              {/* Input nova chave */}
              <div className="space-y-2">
                <Label className="text-slate-700">
                  OpenAI API Key
                  <a
                    href="https://platform.openai.com/api-keys"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-2 text-emerald-600 hover:underline text-xs inline-flex items-center gap-1"
                  >
                    Obter chave <ExternalLink className="w-3 h-3" />
                  </a>
                </Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      type={showOpenai ? 'text' : 'password'}
                      placeholder="sk-proj-..."
                      value={openaiApiKey}
                      onChange={e => setOpenaiApiKey(e.target.value)}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowOpenai(!showOpenai)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showOpenai ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <Button
                    onClick={() => handleSave('OPENAI_API_KEY', openaiApiKey, 'AI')}
                    disabled={saving === 'OPENAI_API_KEY' || !openaiApiKey.trim()}
                    className="bg-emerald-600 hover:bg-emerald-700"
                  >
                    {saving === 'OPENAI_API_KEY' ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Salvar
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Testar conexão */}
              {status.openai !== 'unconfigured' && (
                <>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-slate-500">
                      Testar conexão com a API da OpenAI
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTest('openai')}
                      disabled={testing === 'openai'}
                    >
                      {testing === 'openai' ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : (
                        <RefreshCw className="w-4 h-4 mr-2" />
                      )}
                      Testar Conexão
                    </Button>
                  </div>
                </>
              )}

              {/* Uso */}
              <div className="bg-emerald-50 p-3 rounded-lg text-sm text-emerald-800 flex items-start gap-2">
                <Brain className="w-4 h-4 mt-0.5 shrink-0" />
                <span>
                  <strong>Uso:</strong> Análise automática de fotos de vistoria, detecção de
                  ambientes, identificação de avarias e classificação de condição do imóvel.
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

          {/* Footer */}
          <div className="text-center text-sm text-slate-400 pt-4">
            <Shield className="w-4 h-4 inline mr-1" />
            Chaves criptografadas com AES-256-CBC
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
