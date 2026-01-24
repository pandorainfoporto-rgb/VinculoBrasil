/**
 * Vinculo.io - GlobalLiquidityPool Component
 *
 * The "Market Cap" view of the Vinculo.io protocol.
 * Shows total value locked (TVL), collateral capacity, active nodes,
 * and real-time protocol health metrics.
 *
 * Key Metrics:
 * - TVL (Total Value Locked): Sum of all guarantor properties
 * - Collateral Capacity: 80% LTV of TVL
 * - Active Nodes: Properties serving as collateral
 * - Yield Paid: Total commissions paid to guarantors
 * - Utilization Rate: How much capacity is being used
 */

import { useState, useEffect } from 'react';
import {
  Globe,
  Activity,
  Layers,
  ShieldCheck,
  TrendingUp,
  Landmark,
  Building2,
  Users,
  Coins,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  ExternalLink,
  MapPin,
  Zap,
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
import { cn } from '@/lib/utils';
import { getNetworkConfig, getBlockExplorerUrl } from '@/lib/web3/config';

interface ProtocolStats {
  tvl: number; // Total Value Locked in BRL
  utilizationRate: number; // Percentage of capacity used
  activeNodes: number; // Properties as collateral
  totalContracts: number; // Active rental contracts
  totalYieldPaid: number; // Total paid to guarantors
  platformRevenue: number; // 5% platform fees
  avgRiskScore: number; // Average tenant score
  defaultRate: number; // Percentage of defaults
}

interface CollateralNode {
  id: string;
  propertyAddress: string;
  city: string;
  state: string;
  ownerAddress: string;
  marketValue: number;
  stakedValue: number;
  contractsGuaranteed: number;
  yieldEarned: number;
  status: 'active' | 'locked' | 'pending';
  lastActivity: Date;
}

interface GlobalLiquidityPoolProps {
  stats?: ProtocolStats;
  nodes?: CollateralNode[];
  onRefresh?: () => void;
  onExportDimob?: () => void;
  className?: string;
}

// Mock data for demonstration
const DEFAULT_STATS: ProtocolStats = {
  tvl: 125400000,
  utilizationRate: 62,
  activeNodes: 142,
  totalContracts: 847,
  totalYieldPaid: 245000,
  platformRevenue: 312500,
  avgRiskScore: 785,
  defaultRate: 1.2,
};

const DEFAULT_NODES: CollateralNode[] = [
  {
    id: '1',
    propertyAddress: 'Av. Paulista, 1500',
    city: 'Sao Paulo',
    state: 'SP',
    ownerAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f2bD99',
    marketValue: 2500000,
    stakedValue: 450000,
    contractsGuaranteed: 8,
    yieldEarned: 12500,
    status: 'active',
    lastActivity: new Date('2026-01-07'),
  },
  {
    id: '2',
    propertyAddress: 'Rua Oscar Freire, 200',
    city: 'Sao Paulo',
    state: 'SP',
    ownerAddress: '0x1234567890AbCdEf1234567890AbCdEf12345678',
    marketValue: 1800000,
    stakedValue: 320000,
    contractsGuaranteed: 5,
    yieldEarned: 8750,
    status: 'active',
    lastActivity: new Date('2026-01-06'),
  },
  {
    id: '3',
    propertyAddress: 'Av. Atlantica, 3000',
    city: 'Rio de Janeiro',
    state: 'RJ',
    ownerAddress: '0xAbCdEf1234567890AbCdEf1234567890AbCdEf12',
    marketValue: 4200000,
    stakedValue: 890000,
    contractsGuaranteed: 12,
    yieldEarned: 22300,
    status: 'active',
    lastActivity: new Date('2026-01-07'),
  },
  {
    id: '4',
    propertyAddress: 'Rua da Bahia, 1200',
    city: 'Belo Horizonte',
    state: 'MG',
    ownerAddress: '0x9876543210FeDcBa9876543210FeDcBa98765432',
    marketValue: 950000,
    stakedValue: 180000,
    contractsGuaranteed: 3,
    yieldEarned: 4500,
    status: 'locked',
    lastActivity: new Date('2026-01-05'),
  },
];

export function GlobalLiquidityPool({
  stats = DEFAULT_STATS,
  nodes = DEFAULT_NODES,
  onRefresh,
  onExportDimob,
  className,
}: GlobalLiquidityPoolProps) {
  const [filterCity, setFilterCity] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const networkConfig = getNetworkConfig();

  // Calculate derived metrics
  const collateralCapacity = stats.tvl * 0.8;
  const riskExposed = (stats.utilizationRate / 100) * collateralCapacity;
  const safetyMargin = collateralCapacity - riskExposed;

  // Filter nodes
  const filteredNodes = nodes.filter(node => {
    if (filterCity !== 'all' && node.city !== filterCity) return false;
    if (filterStatus !== 'all' && node.status !== filterStatus) return false;
    return true;
  });

  // Get unique cities for filter
  const cities = [...new Set(nodes.map(n => n.city))];

  const handleRefresh = async () => {
    setIsRefreshing(true);
    onRefresh?.();
    // Simulate refresh
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsRefreshing(false);
  };

  const formatCurrency = (value: number): string => {
    if (value >= 1000000) {
      return `R$ ${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `R$ ${(value / 1000).toFixed(0)}k`;
    }
    return `R$ ${value.toLocaleString('pt-BR')}`;
  };

  const shortAddress = (address: string): string => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className={cn('space-y-6 lg:space-y-8', className)}>
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-2xl lg:text-4xl font-black tracking-tighter">
            PROTOCOLO DE LIQUIDEZ
          </h1>
          <p className="text-muted-foreground font-mono text-xs uppercase tracking-[0.3em]">
            Global Collateral Reserves
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-emerald-500">
            <Activity size={16} className="animate-pulse" />
            <span className="text-sm font-bold">REDE OPERACIONAL</span>
          </div>
          <Badge variant="outline" className="font-mono">
            {networkConfig.name}
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw
              size={14}
              className={cn('mr-2', isRefreshing && 'animate-spin')}
            />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border text-foreground">
          <CardHeader className="pb-2">
            <Globe className="text-indigo-500" size={20} />
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-[10px] font-bold uppercase mb-1">
              TVL (Total Value Locked)
            </p>
            <h2 className="text-xl lg:text-2xl font-black">
              {formatCurrency(stats.tvl)}
            </h2>
            <div className="flex items-center gap-1 text-emerald-400 text-xs mt-1">
              <TrendingUp size={12} />
              <span>+12.5% (30d)</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border text-foreground">
          <CardHeader className="pb-2">
            <Layers className="text-indigo-500" size={20} />
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-[10px] font-bold uppercase mb-1">
              Capacidade de Garantia
            </p>
            <h2 className="text-xl lg:text-2xl font-black text-emerald-400">
              {formatCurrency(collateralCapacity)}
            </h2>
            <p className="text-[10px] text-muted-foreground/70 mt-1">80% LTV</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border text-foreground">
          <CardHeader className="pb-2">
            <ShieldCheck className="text-indigo-500" size={20} />
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-[10px] font-bold uppercase mb-1">
              Nos (Imoveis) Ativos
            </p>
            <h2 className="text-xl lg:text-2xl font-black">{stats.activeNodes}</h2>
            <p className="text-[10px] text-muted-foreground/70 mt-1">
              {stats.totalContracts} contratos garantidos
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border text-foreground">
          <CardHeader className="pb-2">
            <TrendingUp className="text-indigo-500" size={20} />
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-[10px] font-bold uppercase mb-1">
              Yield Pago (Garantidores)
            </p>
            <h2 className="text-xl lg:text-2xl font-black">
              {formatCurrency(stats.totalYieldPaid)}
            </h2>
            <p className="text-[10px] text-emerald-400 mt-1">
              5% de cada aluguel
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Utilization Gauge & Platform Revenue */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Utilization Gauge */}
        <Card className="lg:col-span-2 bg-card border-border text-foreground">
          <CardHeader>
            <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
              Utilizacao do Pool
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-xs text-muted-foreground">Colateral Comprometido</p>
                <p className="text-lg font-bold">{formatCurrency(riskExposed)}</p>
              </div>
              <span className="text-4xl font-black text-indigo-500">
                {stats.utilizationRate}%
              </span>
            </div>

            <div className="w-full h-4 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-600 to-emerald-500 transition-all duration-1000"
                style={{ width: `${stats.utilizationRate}%` }}
              />
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
              <div>
                <p className="text-xs text-muted-foreground">Risco Exposto</p>
                <p className="text-sm font-bold text-amber-400">
                  {formatCurrency(riskExposed)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Margem de Seguranca</p>
                <p className="text-sm font-bold text-emerald-400">
                  {formatCurrency(safetyMargin)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Taxa de Inadimplencia</p>
                <p className="text-sm font-bold">{stats.defaultRate}%</p>
              </div>
            </div>

            <p className="text-[10px] text-muted-foreground/70 italic">
              * Margem de seguranca de 18% para liquidez imediata em caso de sinistro.
            </p>
          </CardContent>
        </Card>

        {/* Platform Revenue */}
        <Card className="bg-gradient-to-br from-indigo-600 to-indigo-900 border-0 text-foreground">
          <CardHeader>
            <Landmark size={32} className="opacity-50" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="text-xl font-bold">Receita da Plataforma</h3>
              <p className="text-3xl font-black mt-2">
                {formatCurrency(stats.platformRevenue)}
              </p>
            </div>
            <p className="text-xs text-indigo-200 leading-relaxed">
              Sua fatia de 5% sobre todos os alugueis e taxas de intermediacao de servicos.
            </p>

            <div className="pt-4 border-t border-indigo-500/30 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-indigo-200">Score Medio Inquilinos</span>
                <span className="font-bold">{stats.avgRiskScore}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-indigo-200">Total Contratos</span>
                <span className="font-bold">{stats.totalContracts}</span>
              </div>
            </div>

            <Button
              className="w-full bg-white text-indigo-900 hover:bg-muted font-bold"
              onClick={onExportDimob}
            >
              Exportar DIMOB / Fiscal
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Collateral Nodes Table */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Building2 size={20} />
                Mapa de Nos (Imoveis Garantidores)
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Propriedades emprestando lastro para o protocolo
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Select value={filterCity} onValueChange={setFilterCity}>
                <SelectTrigger className="w-[150px] bg-muted border-border text-foreground">
                  <SelectValue placeholder="Cidade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas Cidades</SelectItem>
                  {cities.map(city => (
                    <SelectItem key={city} value={city}>{city}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[130px] bg-muted border-border text-foreground">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Ativos</SelectItem>
                  <SelectItem value="locked">Bloqueados</SelectItem>
                  <SelectItem value="pending">Pendentes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-border">
                  <TableHead className="text-muted-foreground">Imovel</TableHead>
                  <TableHead className="text-muted-foreground">Proprietario</TableHead>
                  <TableHead className="text-muted-foreground text-right">Valor</TableHead>
                  <TableHead className="text-muted-foreground text-right">Staked</TableHead>
                  <TableHead className="text-muted-foreground text-right">Contratos</TableHead>
                  <TableHead className="text-muted-foreground text-right">Yield</TableHead>
                  <TableHead className="text-muted-foreground">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredNodes.map(node => (
                  <TableRow key={node.id} className="border-border text-foreground">
                    <TableCell>
                      <div>
                        <p className="font-medium">{node.propertyAddress}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin size={10} />
                          {node.city}, {node.state}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <a
                        href={getBlockExplorerUrl('address', node.ownerAddress)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-xs text-indigo-400 hover:underline flex items-center gap-1"
                      >
                        {shortAddress(node.ownerAddress)}
                        <ExternalLink size={10} />
                      </a>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(node.marketValue)}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="text-amber-400">
                        {formatCurrency(node.stakedValue)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant="outline" className="border-border">
                        {node.contractsGuaranteed}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="text-emerald-400 font-medium">
                        +{formatCurrency(node.yieldEarned)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={cn(
                          node.status === 'active' && 'bg-emerald-500/20 text-emerald-400',
                          node.status === 'locked' && 'bg-amber-500/20 text-amber-400',
                          node.status === 'pending' && 'bg-muted/50 text-muted-foreground'
                        )}
                      >
                        <Zap size={10} className="mr-1" />
                        {node.status === 'active' ? 'On-chain' :
                         node.status === 'locked' ? 'Bloqueado' : 'Pendente'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default GlobalLiquidityPool;
