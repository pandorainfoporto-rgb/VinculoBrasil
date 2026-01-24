/**
 * Vinculo.io - Admin Audit Dashboard
 *
 * Centro de Comando da Verdade. Dashboard onde o Admin ve todos os
 * "Matchings" feitos no Marketplace em tempo real. Cruza dados do
 * Firestore com eventos da Blockchain.
 */

import { useState, useCallback } from 'react';
import { copyToClipboard } from '@/lib/clipboard';
import {
  Activity,
  ShieldCheck,
  Search,
  ArrowUpRight,
  AlertCircle,
  Landmark,
  UserCheck,
  Zap,
  RefreshCw,
  Download,
  Filter,
  Eye,
  MoreVertical,
  CheckCircle2,
  Clock,
  XCircle,
  TrendingUp,
  Building2,
  Users,
  DollarSign,
  FileText,
  ExternalLink,
  AlertTriangle,
  X,
  User,
  Mail,
  Phone,
  MapPin,
  CreditCard,
  Wallet,
  Award,
  Shield,
  FileCheck,
  BadgeCheck,
  Copy,
  Printer,
  Share2,
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';

// ============================================
// TYPES
// ============================================

interface TenantProfile {
  id: string;
  name: string;
  cpf: string;
  email: string;
  phone: string;
  address: string;
  trustScore: number;
  kycStatus: 'pending' | 'approved' | 'rejected' | 'under_review';
  kycSubmittedAt: Date;
  documents: {
    type: string;
    status: 'verified' | 'pending' | 'rejected';
    uploadedAt: Date;
  }[];
  income: number;
  employer: string;
  employmentType: string;
  rentalHistory: {
    property: string;
    period: string;
    status: 'completed' | 'active' | 'terminated';
  }[];
}

interface AuditLog {
  id: string;
  tenantName: string;
  tenantCpf: string;
  tenantProfile?: TenantProfile;
  guarantorName: string;
  guarantorId: string;
  propertyValue: number;
  rentValue: number;
  propertyAddress?: string;
  status: 'verified' | 'locked' | 'dispute' | 'pending' | 'executed';
  txHash: string;
  timestamp: Date;
  contractId?: string;
  nftTokenId?: string;
  split: {
    landlord: number;
    guarantor: number;
    insurance: number;
    platform: number;
  };
}

interface ProtocolStats {
  tvl: number;
  allocatedGuarantee: number;
  activeMatchings: number;
  inDispute: number;
  networkHealth: number;
  lastSync: Date;
}

interface FilterState {
  status: string[];
  dateRange: string;
  minValue: string;
  maxValue: string;
  guarantorId: string;
}

// ============================================
// DADOS VAZIOS PARA PRODUCAO
// ============================================

const EMPTY_STATS: ProtocolStats = {
  tvl: 0,
  allocatedGuarantee: 0,
  activeMatchings: 0,
  inDispute: 0,
  networkHealth: 100,
  lastSync: new Date(),
};

const EMPTY_TENANT_PROFILES: Record<string, TenantProfile> = {};

const EMPTY_AUDIT_LOGS: AuditLog[] = [];

// ============================================
// HELPER FUNCTIONS
// ============================================

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function formatShortCurrency(value: number): string {
  if (value >= 1000000) {
    return `R$ ${(value / 1000000).toFixed(1)}M`;
  }
  if (value >= 1000) {
    return `R$ ${(value / 1000).toFixed(0)}K`;
  }
  return formatCurrency(value);
}

function formatHash(hash: string): string {
  return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
}

function formatTimestamp(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 60) return `${minutes}min atras`;
  if (hours < 24) return `${hours}h atras`;
  return `${days}d atras`;
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function getStatusConfig(status: AuditLog['status']) {
  const configs = {
    verified: {
      label: 'VERIFIED',
      color: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
      icon: CheckCircle2,
    },
    locked: {
      label: 'LOCKED',
      color: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
      icon: Clock,
    },
    dispute: {
      label: 'DISPUTE',
      color: 'bg-red-500/10 text-red-500 border-red-500/20',
      icon: AlertCircle,
    },
    pending: {
      label: 'PENDING',
      color: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
      icon: Clock,
    },
    executed: {
      label: 'EXECUTED',
      color: 'bg-muted-foreground/10 text-muted-foreground border-border',
      icon: CheckCircle2,
    },
  };
  return configs[status];
}

function getKycStatusConfig(status: TenantProfile['kycStatus']) {
  const configs = {
    pending: { label: 'Pendente', color: 'bg-amber-500/10 text-amber-500', icon: Clock },
    approved: { label: 'Aprovado', color: 'bg-emerald-500/10 text-emerald-500', icon: CheckCircle2 },
    rejected: { label: 'Rejeitado', color: 'bg-red-500/10 text-red-500', icon: XCircle },
    under_review: { label: 'Em Analise', color: 'bg-blue-500/10 text-blue-500', icon: Eye },
  };
  return configs[status];
}

function getTrustScoreColor(score: number): string {
  if (score >= 800) return 'text-emerald-500';
  if (score >= 650) return 'text-amber-500';
  return 'text-red-500';
}

// ============================================
// COMPONENTS
// ============================================

function ProtocolHeader({ stats, onSync }: { stats: ProtocolStats; onSync: () => void }) {
  const [syncing, setSyncing] = useState(false);

  const handleSync = () => {
    setSyncing(true);
    setTimeout(() => {
      onSync();
      setSyncing(false);
    }, 1500);
  };

  return (
    <div className="flex justify-between items-start border-b border-border pb-8">
      <div>
        <h1 className="text-4xl font-black tracking-tighter italic">AUDITORIA DE PROTOCOLO</h1>
        <p className="text-muted-foreground font-mono text-[10px] uppercase tracking-[0.3em] mt-2">
          Real-Time Matching & Collateral Verification
        </p>
      </div>
      <div className="flex gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4 flex items-center gap-3">
            <Activity className="text-emerald-500 animate-pulse" size={20} />
            <div>
              <p className="text-[10px] text-muted-foreground uppercase font-bold">Network Health</p>
              <p className="text-sm font-bold">{stats.networkHealth}% Sync</p>
            </div>
          </CardContent>
        </Card>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 border-border hover:bg-muted"
          onClick={handleSync}
          disabled={syncing}
        >
          <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
          {syncing ? 'Sincronizando...' : 'Sincronizar'}
        </Button>
      </div>
    </div>
  );
}

function MetricsGrid({ stats }: { stats: ProtocolStats }) {
  const metrics = [
    {
      label: 'TVL (Imoveis)',
      value: formatShortCurrency(stats.tvl),
      icon: Landmark,
      color: 'text-indigo-400',
    },
    {
      label: 'Garantia Alocada',
      value: formatShortCurrency(stats.allocatedGuarantee),
      icon: Zap,
      color: 'text-amber-400',
    },
    {
      label: 'Matchings Ativos',
      value: stats.activeMatchings.toString(),
      icon: UserCheck,
      color: 'text-emerald-400',
    },
    {
      label: 'Em Disputa',
      value: stats.inDispute.toString(),
      icon: AlertCircle,
      color: 'text-red-400',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {metrics.map((item) => (
        <Card
          key={item.label}
          className="bg-card/50 border-border hover:bg-card transition-all"
        >
          <CardContent className="p-6">
            <item.icon className={`${item.color} mb-4`} size={20} />
            <p className="text-muted-foreground text-[10px] font-bold uppercase">{item.label}</p>
            <h2 className="text-2xl font-black mt-1">{item.value}</h2>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function SplitVisualizer({ split }: { split: AuditLog['split'] }) {
  const total = split.landlord + split.guarantor + split.insurance + split.platform;
  const percentages = {
    landlord: (split.landlord / total) * 100,
    guarantor: (split.guarantor / total) * 100,
    insurance: (split.insurance / total) * 100,
    platform: (split.platform / total) * 100,
  };

  return (
    <div className="flex gap-0.5 h-5">
      <div
        className="bg-indigo-500 rounded-l-sm"
        style={{ width: `${percentages.landlord}%` }}
        title={`85% Locador: ${formatCurrency(split.landlord)}`}
      />
      <div
        className="bg-amber-500"
        style={{ width: `${percentages.guarantor}%` }}
        title={`5% Garantidor: ${formatCurrency(split.guarantor)}`}
      />
      <div
        className="bg-emerald-500"
        style={{ width: `${percentages.insurance}%` }}
        title={`5% Seguro: ${formatCurrency(split.insurance)}`}
      />
      <div
        className="bg-muted-foreground rounded-r-sm"
        style={{ width: `${percentages.platform}%` }}
        title={`5% Plataforma: ${formatCurrency(split.platform)}`}
      />
    </div>
  );
}

// Profile View Modal
function ProfileViewModal({
  profile,
  open,
  onClose,
  onApproveKyc,
  onRejectKyc,
}: {
  profile: TenantProfile | null;
  open: boolean;
  onClose: () => void;
  onApproveKyc: (id: string) => void;
  onRejectKyc: (id: string) => void;
}) {
  if (!profile) return null;

  const kycConfig = getKycStatusConfig(profile.kycStatus);

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="bg-background border-border w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-foreground flex items-center gap-2">
            <User className="h-5 w-5" />
            Perfil do Locatario
          </SheetTitle>
          <SheetDescription className="text-muted-foreground">
            Detalhes completos e historico do inquilino
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Basic Info */}
          <div className="p-4 bg-card rounded-xl border border-border">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <span className="text-2xl font-bold text-foreground">
                    {profile.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">{profile.name}</h3>
                  <p className="text-sm text-muted-foreground">{profile.cpf}</p>
                </div>
              </div>
              <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold ${kycConfig.color}`}>
                <kycConfig.icon className="h-3 w-3" />
                {kycConfig.label}
              </div>
            </div>

            <Separator className="my-4 bg-muted" />

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                {profile.email}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4" />
                {profile.phone}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground col-span-2">
                <MapPin className="h-4 w-4" />
                {profile.address}
              </div>
            </div>
          </div>

          {/* Trust Score */}
          <div className="p-4 bg-card rounded-xl border border-border">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold text-muted-foreground">Trust Score</span>
              <span className={`text-2xl font-black ${getTrustScoreColor(profile.trustScore)}`}>
                {profile.trustScore}
              </span>
            </div>
            <Progress value={(profile.trustScore / 1000) * 100} className="h-2" />
            <div className="flex justify-between text-[10px] text-muted-foreground/70 mt-1">
              <span>0</span>
              <span>500</span>
              <span>1000</span>
            </div>
          </div>

          {/* Financial Info */}
          <div className="p-4 bg-card rounded-xl border border-border">
            <h4 className="text-sm font-bold text-muted-foreground mb-3 flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Informacoes Financeiras
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-[10px] text-muted-foreground/70 uppercase">Renda Mensal</p>
                <p className="text-lg font-bold text-foreground">{formatCurrency(profile.income)}</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground/70 uppercase">Vinculo</p>
                <p className="text-lg font-bold text-foreground">{profile.employmentType}</p>
              </div>
              <div className="col-span-2">
                <p className="text-[10px] text-muted-foreground/70 uppercase">Empregador</p>
                <p className="text-lg font-bold text-foreground">{profile.employer}</p>
              </div>
            </div>
          </div>

          {/* Documents */}
          <div className="p-4 bg-card rounded-xl border border-border">
            <h4 className="text-sm font-bold text-muted-foreground mb-3 flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Documentos KYC
            </h4>
            <div className="space-y-2">
              {profile.documents.map((doc, i) => (
                <div key={i} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                  <span className="text-sm text-foreground">{doc.type}</span>
                  <Badge
                    variant="outline"
                    className={
                      doc.status === 'verified'
                        ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                        : doc.status === 'pending'
                        ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                        : 'bg-red-500/10 text-red-500 border-red-500/20'
                    }
                  >
                    {doc.status === 'verified' ? 'Verificado' : doc.status === 'pending' ? 'Pendente' : 'Rejeitado'}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Rental History */}
          {profile.rentalHistory.length > 0 && (
            <div className="p-4 bg-card rounded-xl border border-border">
              <h4 className="text-sm font-bold text-muted-foreground mb-3 flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Historico de Locacoes
              </h4>
              <div className="space-y-2">
                {profile.rentalHistory.map((rental, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                    <div>
                      <p className="text-sm text-foreground">{rental.property}</p>
                      <p className="text-[10px] text-muted-foreground/70">{rental.period}</p>
                    </div>
                    <Badge
                      variant="outline"
                      className={
                        rental.status === 'completed'
                          ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                          : rental.status === 'active'
                          ? 'bg-blue-500/10 text-blue-500 border-blue-500/20'
                          : 'bg-red-500/10 text-red-500 border-red-500/20'
                      }
                    >
                      {rental.status === 'completed' ? 'Concluido' : rental.status === 'active' ? 'Ativo' : 'Encerrado'}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <SheetFooter className="mt-6 gap-2">
          {(profile.kycStatus === 'pending' || profile.kycStatus === 'under_review') && (
            <>
              <Button
                variant="outline"
                className="flex-1 border-red-500/30 text-red-400 hover:bg-red-500/10"
                onClick={() => onRejectKyc(profile.id)}
              >
                <XCircle className="h-4 w-4 mr-2" />
                Rejeitar KYC
              </Button>
              <Button
                className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                onClick={() => onApproveKyc(profile.id)}
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Aprovar KYC
              </Button>
            </>
          )}
          {profile.kycStatus === 'approved' && (
            <Button variant="outline" className="w-full" onClick={onClose}>
              Fechar
            </Button>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

// KYC Approval Modal
function KycApprovalModal({
  profile,
  open,
  onClose,
  onConfirm,
  action,
}: {
  profile: TenantProfile | null;
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  action: 'approve' | 'reject';
}) {
  const [notes, setNotes] = useState('');

  if (!profile) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-background border-border max-w-md">
        <DialogHeader>
          <DialogTitle className={action === 'approve' ? 'text-emerald-400' : 'text-red-400'}>
            {action === 'approve' ? 'Aprovar KYC' : 'Rejeitar KYC'}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            {action === 'approve'
              ? 'Confirmar aprovacao do KYC para este locatario'
              : 'Confirmar rejeicao do KYC para este locatario'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="p-4 bg-card rounded-xl border border-border mb-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <span className="text-lg font-bold text-foreground">
                  {profile.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div>
                <p className="font-bold text-foreground">{profile.name}</p>
                <p className="text-sm text-muted-foreground">{profile.cpf}</p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-muted-foreground">Observacoes (opcional)</Label>
            <Textarea
              placeholder={action === 'approve'
                ? 'Adicionar observacoes sobre a aprovacao...'
                : 'Motivo da rejeicao...'
              }
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="bg-card border-border text-foreground"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="border-border">
            Cancelar
          </Button>
          <Button
            onClick={() => {
              onConfirm();
              setNotes('');
            }}
            className={action === 'approve' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'}
          >
            {action === 'approve' ? 'Confirmar Aprovacao' : 'Confirmar Rejeicao'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// NFT Certificate Modal
function NftCertificateModal({
  log,
  open,
  onClose,
}: {
  log: AuditLog | null;
  open: boolean;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);

  if (!log) return null;

  const handleCopy = async (text: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-background border-border max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-foreground flex items-center gap-2">
            <Award className="h-5 w-5 text-indigo-400" />
            Certificado NFT de Garantia
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Comprovante imutavel registrado na blockchain
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          {/* NFT Visual */}
          <div className="relative p-6 bg-gradient-to-br from-indigo-900/30 via-purple-900/30 to-pink-900/30 rounded-2xl border border-indigo-500/20 mb-6">
            <div className="absolute top-3 right-3">
              <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Valido
              </Badge>
            </div>

            <div className="text-center mb-6">
              <div className="h-20 w-20 mx-auto bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mb-4">
                <Shield className="h-10 w-10 text-foreground" />
              </div>
              <h3 className="text-xl font-black text-foreground">CERTIFICADO DE GARANTIA</h3>
              <p className="text-sm text-muted-foreground">Token #{log.nftTokenId || 'Pendente'}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-[10px] text-muted-foreground/70 uppercase">Locatario</p>
                <p className="font-bold text-foreground">{log.tenantName}</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground/70 uppercase">Garantidor</p>
                <p className="font-bold text-foreground">{log.guarantorName}</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground/70 uppercase">Aluguel</p>
                <p className="font-bold text-foreground">{formatCurrency(log.rentValue)}/mes</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground/70 uppercase">Contrato</p>
                <p className="font-bold text-foreground">{log.contractId || 'N/A'}</p>
              </div>
            </div>

            <Separator className="my-4 bg-border" />

            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                <span className="text-xs text-muted-foreground">Hash da Transacao</span>
                <button
                  onClick={() => handleCopy(log.txHash)}
                  className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300"
                >
                  <code>{formatHash(log.txHash)}</code>
                  <Copy className="h-3 w-3" />
                </button>
              </div>
              <div className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                <span className="text-xs text-muted-foreground">Data de Emissao</span>
                <span className="text-xs text-foreground">{formatDate(log.timestamp)}</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-muted/50 rounded-lg">
                <span className="text-xs text-muted-foreground">Rede</span>
                <span className="text-xs text-foreground">Polygon Amoy (Testnet)</span>
              </div>
            </div>
          </div>

          {copied && (
            <div className="text-center text-sm text-emerald-400 mb-4">
              Hash copiado para a area de transferencia!
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            className="border-border gap-2"
            onClick={() => window.open(`https://polygonscan.com/tx/${log.txHash}`, '_blank')}
          >
            <ExternalLink className="h-4 w-4" />
            Ver no Explorer
          </Button>
          <Button
            variant="outline"
            className="border-border gap-2"
            onClick={() => window.print()}
          >
            <Printer className="h-4 w-4" />
            Imprimir
          </Button>
          <Button
            className="bg-indigo-600 hover:bg-indigo-700 gap-2"
            onClick={() => {
              const shareData = {
                title: 'Certificado NFT Vinculo.io',
                text: `Certificado de Garantia - ${log.tenantName}`,
                url: `https://vinculobrasil.com.br/certificado/${log.nftTokenId}`,
              };
              if (navigator.share) {
                navigator.share(shareData);
              } else {
                handleCopy(`https://vinculobrasil.com.br/certificado/${log.nftTokenId}`);
              }
            }}
          >
            <Share2 className="h-4 w-4" />
            Compartilhar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Filter Sheet
function FilterSheet({
  open,
  onClose,
  filters,
  onApplyFilters,
}: {
  open: boolean;
  onClose: () => void;
  filters: FilterState;
  onApplyFilters: (filters: FilterState) => void;
}) {
  const [localFilters, setLocalFilters] = useState<FilterState>(filters);

  const handleStatusToggle = (status: string) => {
    const newStatus = localFilters.status.includes(status)
      ? localFilters.status.filter(s => s !== status)
      : [...localFilters.status, status];
    setLocalFilters({ ...localFilters, status: newStatus });
  };

  const handleApply = () => {
    onApplyFilters(localFilters);
    onClose();
  };

  const handleClear = () => {
    const clearedFilters: FilterState = {
      status: [],
      dateRange: 'all',
      minValue: '',
      maxValue: '',
      guarantorId: '',
    };
    setLocalFilters(clearedFilters);
    onApplyFilters(clearedFilters);
    onClose();
  };

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="bg-background border-border overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-foreground flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros Avancados
          </SheetTitle>
          <SheetDescription className="text-muted-foreground">
            Refine sua busca com filtros detalhados
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Status Filter */}
          <div className="space-y-3">
            <Label className="text-muted-foreground">Status</Label>
            <div className="space-y-2">
              {[
                { value: 'verified', label: 'Verified', color: 'text-emerald-400' },
                { value: 'locked', label: 'Locked', color: 'text-amber-400' },
                { value: 'pending', label: 'Pending', color: 'text-blue-400' },
                { value: 'dispute', label: 'Dispute', color: 'text-red-400' },
                { value: 'executed', label: 'Executed', color: 'text-muted-foreground' },
              ].map((status) => (
                <div key={status.value} className="flex items-center gap-2">
                  <Checkbox
                    id={status.value}
                    checked={localFilters.status.includes(status.value)}
                    onCheckedChange={() => handleStatusToggle(status.value)}
                    className="border-border"
                  />
                  <Label htmlFor={status.value} className={`cursor-pointer ${status.color}`}>
                    {status.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Date Range */}
          <div className="space-y-3">
            <Label className="text-muted-foreground">Periodo</Label>
            <Select
              value={localFilters.dateRange}
              onValueChange={(v) => setLocalFilters({ ...localFilters, dateRange: v })}
            >
              <SelectTrigger className="bg-card border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="today">Hoje</SelectItem>
                <SelectItem value="week">Ultima semana</SelectItem>
                <SelectItem value="month">Ultimo mes</SelectItem>
                <SelectItem value="quarter">Ultimo trimestre</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Value Range */}
          <div className="space-y-3">
            <Label className="text-muted-foreground">Faixa de Valor (Aluguel)</Label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Input
                  type="number"
                  placeholder="Min"
                  value={localFilters.minValue}
                  onChange={(e) => setLocalFilters({ ...localFilters, minValue: e.target.value })}
                  className="bg-card border-border"
                />
              </div>
              <div>
                <Input
                  type="number"
                  placeholder="Max"
                  value={localFilters.maxValue}
                  onChange={(e) => setLocalFilters({ ...localFilters, maxValue: e.target.value })}
                  className="bg-card border-border"
                />
              </div>
            </div>
          </div>

          {/* Guarantor Filter */}
          <div className="space-y-3">
            <Label className="text-muted-foreground">Garantidor</Label>
            <Select
              value={localFilters.guarantorId}
              onValueChange={(v) => setLocalFilters({ ...localFilters, guarantorId: v })}
            >
              <SelectTrigger className="bg-card border-border">
                <SelectValue placeholder="Todos os garantidores" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="g_001">Ed. Horizonte</SelectItem>
                <SelectItem value="g_002">Flat Premium</SelectItem>
                <SelectItem value="g_003">Residencial Jardins</SelectItem>
                <SelectItem value="g_004">Loft Moderno</SelectItem>
                <SelectItem value="g_005">Comercial Prime</SelectItem>
                <SelectItem value="g_006">Casa Colonial</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <SheetFooter className="mt-8 gap-2">
          <Button variant="outline" onClick={handleClear} className="flex-1 border-border">
            Limpar Filtros
          </Button>
          <Button onClick={handleApply} className="flex-1 bg-indigo-600 hover:bg-indigo-700">
            Aplicar Filtros
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function AuditTable({
  logs,
  onViewProfile,
  onViewNft,
}: {
  logs: AuditLog[];
  onViewProfile: (log: AuditLog) => void;
  onViewNft: (log: AuditLog) => void;
}) {
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    status: [],
    dateRange: 'all',
    minValue: '',
    maxValue: '',
    guarantorId: '',
  });

  const handleExport = () => {
    const csvContent = [
      ['ID', 'Locatario', 'CPF', 'Garantidor', 'Aluguel', 'Status', 'Hash', 'Data'].join(','),
      ...logs.map(log => [
        log.id,
        log.tenantName,
        log.tenantCpf,
        log.guarantorName,
        log.rentValue,
        log.status,
        log.txHash,
        formatDate(log.timestamp),
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dimob_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const activeFiltersCount =
    filters.status.length +
    (filters.dateRange !== 'all' ? 1 : 0) +
    (filters.minValue ? 1 : 0) +
    (filters.maxValue ? 1 : 0) +
    (filters.guarantorId && filters.guarantorId !== 'all' ? 1 : 0);

  return (
    <>
      <Card className="bg-card border-border overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-border flex justify-between items-center bg-card/50">
          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Log de Matchings Recentes
          </h3>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="text-[10px] hover:bg-muted gap-1"
              onClick={() => setFilterSheetOpen(true)}
            >
              <Filter className="h-3 w-3" />
              Filtrar
              {activeFiltersCount > 0 && (
                <Badge className="ml-1 h-4 w-4 p-0 flex items-center justify-center bg-indigo-600 text-[10px]">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-[10px] border-border hover:bg-muted gap-1"
              onClick={handleExport}
            >
              <Download className="h-3 w-3" />
              Exportar DIMOB (CSV)
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground text-[10px] uppercase font-bold">
                  Locatario / Garantidor
                </TableHead>
                <TableHead className="text-muted-foreground text-[10px] uppercase font-bold">
                  Valor Aluguel
                </TableHead>
                <TableHead className="text-muted-foreground text-[10px] uppercase font-bold">
                  Split (85/5/5/5)
                </TableHead>
                <TableHead className="text-muted-foreground text-[10px] uppercase font-bold">
                  Status Blockchain
                </TableHead>
                <TableHead className="text-muted-foreground text-[10px] uppercase font-bold text-right">
                  Hash / Tempo
                </TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => {
                const statusConfig = getStatusConfig(log.status);
                return (
                  <TableRow
                    key={log.id}
                    className="border-border/50 hover:bg-white/5 transition-colors"
                  >
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-bold text-sm">{log.tenantName}</span>
                        <span className="text-[10px] text-muted-foreground uppercase">
                          Garantido por: {log.guarantorName}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono font-bold text-foreground">
                      {formatCurrency(log.rentValue)}
                    </TableCell>
                    <TableCell>
                      <SplitVisualizer split={log.split} />
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={`text-[10px] font-black ${statusConfig.color}`}
                      >
                        <statusConfig.icon className="h-3 w-3 mr-1" />
                        {statusConfig.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <a
                        href={`https://polygonscan.com/tx/${log.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted-foreground/70 hover:text-indigo-400 transition-colors flex items-center justify-end gap-1"
                      >
                        <code className="text-[10px]">{formatHash(log.txHash)}</code>
                        <ArrowUpRight size={12} />
                      </a>
                      <p className="text-[10px] text-muted-foreground/70 mt-1">
                        {formatTimestamp(log.timestamp)}
                      </p>
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-card border-border">
                          <DropdownMenuItem
                            onClick={() => onViewProfile(log)}
                            className="text-foreground focus:bg-muted cursor-pointer"
                          >
                            <User className="h-4 w-4 mr-2" />
                            Ver Perfil
                          </DropdownMenuItem>
                          {log.nftTokenId && (
                            <DropdownMenuItem
                              onClick={() => onViewNft(log)}
                              className="text-foreground focus:bg-muted cursor-pointer"
                            >
                              <Award className="h-4 w-4 mr-2" />
                              Certificado NFT
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={handleExport}
                            className="text-foreground focus:bg-muted cursor-pointer"
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            Gerar Relatorio
                          </DropdownMenuItem>
                          <DropdownMenuSeparator className="bg-muted" />
                          <DropdownMenuItem
                            onClick={() => window.open(`https://polygonscan.com/tx/${log.txHash}`, '_blank')}
                            className="text-foreground focus:bg-muted cursor-pointer"
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            Ver no PolygonScan
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </Card>

      <FilterSheet
        open={filterSheetOpen}
        onClose={() => setFilterSheetOpen(false)}
        filters={filters}
        onApplyFilters={setFilters}
      />
    </>
  );
}

function DisputePanel({
  disputes,
  onInvestigate,
  onExecuteCollateral,
}: {
  disputes: AuditLog[];
  onInvestigate: (log: AuditLog) => void;
  onExecuteCollateral: (log: AuditLog) => void;
}) {
  if (disputes.length === 0) {
    return (
      <Card className="bg-card border-border">
        <CardContent className="py-8 text-center">
          <CheckCircle2 className="h-12 w-12 mx-auto text-emerald-500 mb-4" />
          <p className="text-muted-foreground">Nenhuma disputa ativa no momento</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-400">
          <AlertCircle className="h-5 w-5" />
          Disputas Ativas ({disputes.length})
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Contratos que precisam de atencao imediata
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {disputes.map((dispute) => (
          <div
            key={dispute.id}
            className="p-4 bg-red-500/5 border border-red-500/20 rounded-xl flex justify-between items-center"
          >
            <div>
              <p className="font-bold text-red-400">{dispute.tenantName}</p>
              <p className="text-xs text-muted-foreground">
                Garantido por: {dispute.guarantorName} | {formatCurrency(dispute.rentValue)}/mes
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                onClick={() => onInvestigate(dispute)}
              >
                Investigar
              </Button>
              <Button
                size="sm"
                className="bg-red-600 hover:bg-red-700"
                onClick={() => onExecuteCollateral(dispute)}
              >
                Executar Colateral
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function SecurityAlert({ onOpenKillSwitch }: { onOpenKillSwitch: () => void }) {
  return (
    <div className="flex items-center gap-3 p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl">
      <ShieldCheck className="text-amber-500 flex-shrink-0" size={18} />
      <p className="text-[11px] text-amber-200/70 italic">
        Atencao: Todos os dados acima sao espelhados diretamente da Polygon Amoy. Divergencias
        devem ser reportadas ao Security Officer via Kill Switch Dashboard.
      </p>
      <Button
        variant="ghost"
        size="sm"
        className="text-amber-400 hover:text-amber-300 ml-auto"
        onClick={onOpenKillSwitch}
      >
        Abrir Kill Switch
      </Button>
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

export function AdminAuditDashboard() {
  const [stats, setStats] = useState<ProtocolStats>(EMPTY_STATS);
  const [logs, setLogs] = useState<AuditLog[]>(EMPTY_AUDIT_LOGS);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('all');

  // Modal states
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<TenantProfile | null>(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [nftModalOpen, setNftModalOpen] = useState(false);
  const [kycModalOpen, setKycModalOpen] = useState(false);
  const [kycAction, setKycAction] = useState<'approve' | 'reject'>('approve');

  // Filter and search
  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.tenantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.guarantorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.txHash.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || log.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const disputeLogs = logs.filter((log) => log.status === 'dispute');

  // Handlers
  const handleViewProfile = useCallback((log: AuditLog) => {
    setSelectedLog(log);
    if (log.tenantProfile) {
      setSelectedProfile(log.tenantProfile);
      setProfileModalOpen(true);
    }
  }, []);

  const handleViewNft = useCallback((log: AuditLog) => {
    setSelectedLog(log);
    setNftModalOpen(true);
  }, []);

  const handleApproveKyc = useCallback((profileId: string) => {
    const profile = Object.values(EMPTY_TENANT_PROFILES).find((p: TenantProfile) => p.id === profileId);
    if (profile) {
      setSelectedProfile(profile as TenantProfile);
      setKycAction('approve');
      setKycModalOpen(true);
    }
  }, []);

  const handleRejectKyc = useCallback((profileId: string) => {
    const profile = Object.values(EMPTY_TENANT_PROFILES).find((p: TenantProfile) => p.id === profileId);
    if (profile) {
      setSelectedProfile(profile as TenantProfile);
      setKycAction('reject');
      setKycModalOpen(true);
    }
  }, []);

  const handleConfirmKyc = useCallback(() => {
    if (selectedProfile) {
      // Update the profile status
      const newStatus = kycAction === 'approve' ? 'approved' : 'rejected';
      // In a real app, this would call an API
      console.log(`KYC ${kycAction}d for profile ${selectedProfile.id}`);
      setKycModalOpen(false);
      setProfileModalOpen(false);
    }
  }, [selectedProfile, kycAction]);

  const handleInvestigate = useCallback((log: AuditLog) => {
    // Open profile for investigation
    handleViewProfile(log);
  }, [handleViewProfile]);

  const handleExecuteCollateral = useCallback((log: AuditLog) => {
    console.log('Executing collateral for:', log.id);
    // In a real app, this would trigger a blockchain transaction
    alert(`Executando colateral para contrato ${log.contractId}. Esta acao sera registrada na blockchain.`);
  }, []);

  const handleSync = useCallback(() => {
    setStats(prev => ({
      ...prev,
      lastSync: new Date(),
      networkHealth: 100,
    }));
  }, []);

  const handleOpenKillSwitch = useCallback(() => {
    window.open('/admin/kill-switch', '_blank');
  }, []);

  const handleSearch = useCallback(() => {
    // Search is already reactive via the searchTerm state
    // This is for the explicit button click
    console.log('Searching for:', searchTerm);
  }, [searchTerm]);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans overflow-auto">
      <ScrollArea className="h-screen">
        <div className="max-w-7xl mx-auto p-8 space-y-8 pb-16">
          {/* Header */}
          <ProtocolHeader stats={stats} onSync={handleSync} />

          {/* Metrics */}
          <MetricsGrid stats={stats} />

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <TabsList className="bg-card border border-border">
                <TabsTrigger value="all" className="data-[state=active]:bg-muted">
                  Todos os Matchings
                </TabsTrigger>
                <TabsTrigger value="disputes" className="data-[state=active]:bg-muted">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Disputas ({disputeLogs.length})
                </TabsTrigger>
                <TabsTrigger value="analytics" className="data-[state=active]:bg-muted">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Analytics
                </TabsTrigger>
              </TabsList>

              {/* Filters */}
              <div className="flex gap-3">
                <div className="relative flex">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar locatario, garantidor ou hash..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    className="pl-10 bg-card border-border w-64 rounded-r-none"
                  />
                  <Button
                    onClick={handleSearch}
                    className="rounded-l-none bg-indigo-600 hover:bg-indigo-700"
                  >
                    Buscar
                  </Button>
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40 bg-card border-border">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="verified">Verified</SelectItem>
                    <SelectItem value="locked">Locked</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="dispute">Dispute</SelectItem>
                    <SelectItem value="executed">Executed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <TabsContent value="all" className="mt-6">
              <AuditTable
                logs={filteredLogs}
                onViewProfile={handleViewProfile}
                onViewNft={handleViewNft}
              />
            </TabsContent>

            <TabsContent value="disputes" className="mt-6">
              <DisputePanel
                disputes={disputeLogs}
                onInvestigate={handleInvestigate}
                onExecuteCollateral={handleExecuteCollateral}
              />
            </TabsContent>

            <TabsContent value="analytics" className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-lg">Volume de Transacoes (30d)</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-48 flex items-center justify-center text-muted-foreground">
                      [Grafico de Volume]
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-lg">Distribuicao por Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {logs.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        <p>Nenhum dado disponível</p>
                        <p className="text-xs mt-1">Os dados serão exibidos quando houver matchings registrados</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {(() => {
                          const total = logs.length || 1;
                          const verified = logs.filter(l => l.status === 'verified').length;
                          const locked = logs.filter(l => l.status === 'locked').length;
                          const pending = logs.filter(l => l.status === 'pending').length;
                          const dispute = logs.filter(l => l.status === 'dispute').length;
                          return (
                            <>
                              <div>
                                <div className="flex justify-between text-sm mb-1">
                                  <span className="text-emerald-400">Verified</span>
                                  <span>{Math.round((verified / total) * 100)}%</span>
                                </div>
                                <Progress value={(verified / total) * 100} className="h-2" />
                              </div>
                              <div>
                                <div className="flex justify-between text-sm mb-1">
                                  <span className="text-amber-400">Locked</span>
                                  <span>{Math.round((locked / total) * 100)}%</span>
                                </div>
                                <Progress value={(locked / total) * 100} className="h-2" />
                              </div>
                              <div>
                                <div className="flex justify-between text-sm mb-1">
                                  <span className="text-blue-400">Pending</span>
                                  <span>{Math.round((pending / total) * 100)}%</span>
                                </div>
                                <Progress value={(pending / total) * 100} className="h-2" />
                              </div>
                              <div>
                                <div className="flex justify-between text-sm mb-1">
                                  <span className="text-red-400">Dispute</span>
                                  <span>{Math.round((dispute / total) * 100)}%</span>
                                </div>
                                <Progress value={(dispute / total) * 100} className="h-2" />
                              </div>
                            </>
                          );
                        })()}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          {/* Security Alert */}
          <SecurityAlert onOpenKillSwitch={handleOpenKillSwitch} />
        </div>
      </ScrollArea>

      {/* Modals */}
      <ProfileViewModal
        profile={selectedProfile}
        open={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        onApproveKyc={handleApproveKyc}
        onRejectKyc={handleRejectKyc}
      />

      <KycApprovalModal
        profile={selectedProfile}
        open={kycModalOpen}
        onClose={() => setKycModalOpen(false)}
        onConfirm={handleConfirmKyc}
        action={kycAction}
      />

      <NftCertificateModal
        log={selectedLog}
        open={nftModalOpen}
        onClose={() => setNftModalOpen(false)}
      />
    </div>
  );
}

export default AdminAuditDashboard;
