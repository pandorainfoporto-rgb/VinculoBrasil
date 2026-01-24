// ============================================
// ROTA /admin/nft-registry - Registro de NFTs
// Gestao de NFTs de Imoveis e Alugueis
// CONECTADO A DADOS REAIS - Polygon Blockchain
// ============================================

import { createFileRoute } from '@tanstack/react-router';
import { memo, useState, useMemo } from 'react';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Hexagon,
  Building2,
  FileText,
  ExternalLink,
  RefreshCw,
  Search,
  TrendingUp,
  Wallet,
  Hash,
  Copy,
  CheckCircle,
  Clock,
  Lock,
  XCircle,
} from 'lucide-react';
import {
  useNFTStats,
  useNFTList,
  getPolygonScanUrl,
  shortenAddress,
  formatTokenValue,
  type NFTItem,
} from '@/hooks/use-nft-registry';
import { cn } from '@/lib/utils';

export const Route = createFileRoute('/admin/nft-registry' as never)({
  component: NFTRegistryPage,
});

// =============================================================================
// COMPONENTES MEMOIZADOS
// =============================================================================

// Stats Card
const StatsCard = memo(function StatsCard({
  title,
  value,
  icon: Icon,
  color,
  subValue,
  isLoading,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  subValue?: string;
  isLoading?: boolean;
}) {
  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardContent className="p-4">
        {isLoading ? (
          <div className="animate-pulse space-y-2">
            <div className="h-4 w-20 bg-zinc-800 rounded" />
            <div className="h-8 w-16 bg-zinc-800 rounded" />
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div className={cn('p-2.5 rounded-lg', color)}>
              <Icon className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-zinc-400">{title}</p>
              <p className="text-xl font-bold text-white">{value}</p>
              {subValue && <p className="text-[10px] text-zinc-500">{subValue}</p>}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

// Status Badge
const StatusBadge = memo(function StatusBadge({ status }: { status: NFTItem['status'] }) {
  const config = {
    minted: { label: 'Mintado', color: 'bg-green-500/20 text-green-400 border-green-500/30', icon: CheckCircle },
    transferred: { label: 'Transferido', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: TrendingUp },
    locked: { label: 'Bloqueado', color: 'bg-amber-500/20 text-amber-400 border-amber-500/30', icon: Lock },
    burned: { label: 'Queimado', color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: XCircle },
  };

  const { label, color, icon: Icon } = config[status];

  return (
    <Badge variant="outline" className={cn('text-xs', color)}>
      <Icon className="h-3 w-3 mr-1" />
      {label}
    </Badge>
  );
});

// Copy Button
const CopyButton = memo(function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="p-1 hover:bg-zinc-700 rounded transition-colors"
      title="Copiar"
    >
      {copied ? (
        <CheckCircle className="h-3 w-3 text-green-400" />
      ) : (
        <Copy className="h-3 w-3 text-zinc-500" />
      )}
    </button>
  );
});

// NFT Table Row
const NFTTableRow = memo(function NFTTableRow({ nft }: { nft: NFTItem }) {
  const polygonUrl = getPolygonScanUrl('tx', nft.txHash);

  return (
    <TableRow className="border-zinc-800 hover:bg-zinc-800/50">
      <TableCell className="py-2">
        <div className="flex items-center gap-2">
          <Hexagon className="h-4 w-4 text-purple-400" />
          <span className="font-mono text-sm text-white">#{nft.tokenId}</span>
        </div>
      </TableCell>
      <TableCell className="py-2">
        <span className="text-sm text-zinc-300">{nft.metadata.name}</span>
      </TableCell>
      <TableCell className="py-2">
        <StatusBadge status={nft.status} />
      </TableCell>
      <TableCell className="py-2">
        <div className="flex items-center gap-1">
          <span className="font-mono text-xs text-zinc-400">
            {shortenAddress(nft.owner, 4)}
          </span>
          <CopyButton text={nft.owner} />
        </div>
      </TableCell>
      <TableCell className="py-2">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs text-zinc-400">
            {shortenAddress(nft.txHash, 8)}
          </span>
          <a
            href={polygonUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1 hover:bg-zinc-700 rounded transition-colors"
            title="Ver no PolygonScan"
          >
            <ExternalLink className="h-3 w-3 text-blue-400" />
          </a>
        </div>
      </TableCell>
      <TableCell className="py-2">
        <span className="text-xs text-zinc-500">
          {new Date(nft.createdAt).toLocaleDateString('pt-BR')}
        </span>
      </TableCell>
    </TableRow>
  );
});

// NFT Table com Skeleton
const NFTTable = memo(function NFTTable({
  data,
  isLoading,
  search,
  onSearchChange,
}: {
  data: NFTItem[];
  isLoading: boolean;
  search: string;
  onSearchChange: (s: string) => void;
}) {
  // Filtra por busca
  const filteredData = useMemo(() => {
    if (!search) return data;
    const searchLower = search.toLowerCase();
    return data.filter(
      (nft) =>
        nft.tokenId.includes(search) ||
        nft.metadata.name.toLowerCase().includes(searchLower) ||
        nft.owner.toLowerCase().includes(searchLower) ||
        nft.txHash.toLowerCase().includes(searchLower)
    );
  }, [data, search]);

  return (
    <div className="space-y-4">
      {/* Barra de Busca */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
        <Input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar por ID, nome, owner ou hash..."
          className="pl-9 bg-zinc-800 border-zinc-700 text-sm h-9"
        />
      </div>

      {/* Tabela */}
      <div className="border border-zinc-800 rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-zinc-800 hover:bg-transparent">
              <TableHead className="text-zinc-400 text-xs w-24">Token ID</TableHead>
              <TableHead className="text-zinc-400 text-xs">Nome</TableHead>
              <TableHead className="text-zinc-400 text-xs w-28">Status</TableHead>
              <TableHead className="text-zinc-400 text-xs w-36">Dono Atual</TableHead>
              <TableHead className="text-zinc-400 text-xs w-44">Hash do Contrato</TableHead>
              <TableHead className="text-zinc-400 text-xs w-24">Data</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              // Skeleton
              Array.from({ length: 10 }).map((_, i) => (
                <TableRow key={i} className="border-zinc-800 animate-pulse">
                  <TableCell className="py-3"><div className="h-4 w-16 bg-zinc-800 rounded" /></TableCell>
                  <TableCell className="py-3"><div className="h-4 w-32 bg-zinc-800 rounded" /></TableCell>
                  <TableCell className="py-3"><div className="h-4 w-20 bg-zinc-800 rounded" /></TableCell>
                  <TableCell className="py-3"><div className="h-4 w-24 bg-zinc-800 rounded" /></TableCell>
                  <TableCell className="py-3"><div className="h-4 w-28 bg-zinc-800 rounded" /></TableCell>
                  <TableCell className="py-3"><div className="h-4 w-16 bg-zinc-800 rounded" /></TableCell>
                </TableRow>
              ))
            ) : filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-zinc-500">
                  Nenhum NFT encontrado
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((nft) => <NFTTableRow key={nft.tokenId} nft={nft} />)
            )}
          </TableBody>
        </Table>
      </div>

      {/* Info de registros */}
      <div className="text-xs text-zinc-500 text-right">
        {filteredData.length} de {data.length} registros
      </div>
    </div>
  );
});

// =============================================================================
// PAGINA PRINCIPAL
// =============================================================================

function NFTRegistryPage() {
  const [activeTab, setActiveTab] = useState<'real_estate' | 'rental'>('real_estate');
  const [search, setSearch] = useState('');

  // Hooks de dados
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useNFTStats();
  const { data: realEstateNFTs, isLoading: realEstateLoading, refetch: refetchRealEstate } = useNFTList('real_estate');
  const { data: rentalNFTs, isLoading: rentalLoading, refetch: refetchRental } = useNFTList('rental');

  const handleRefresh = () => {
    refetchStats();
    refetchRealEstate();
    refetchRental();
  };

  return (
    <AdminLayout userName="Administrador">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Hexagon className="h-6 w-6 text-purple-500" />
              NFT Registry
            </h1>
            <p className="text-zinc-400 mt-1">
              Registro de NFTs tokenizados na blockchain Polygon
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
          >
            <RefreshCw className={cn('h-4 w-4 mr-2', statsLoading && 'animate-spin')} />
            Atualizar
          </Button>
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatsCard
            title="Total de NFTs"
            value={stats?.totalNFTs.toLocaleString('pt-BR') || '0'}
            icon={Hexagon}
            color="bg-purple-600"
            subValue={`${stats?.activeNFTs || 0} ativos`}
            isLoading={statsLoading}
          />
          <StatsCard
            title="Imoveis (ERC-721)"
            value={stats?.realEstateNFTs.toLocaleString('pt-BR') || '0'}
            icon={Building2}
            color="bg-blue-600"
            subValue="Real Estate NFTs"
            isLoading={statsLoading}
          />
          <StatsCard
            title="Alugueis (ERC-1155)"
            value={stats?.rentalNFTs.toLocaleString('pt-BR') || '0'}
            icon={FileText}
            color="bg-green-600"
            subValue="Rental NFTs"
            isLoading={statsLoading}
          />
          <StatsCard
            title="Valor Tokenizado"
            value={formatTokenValue(stats?.totalValueTokenized || 0)}
            icon={Wallet}
            color="bg-amber-600"
            subValue="em ativos"
            isLoading={statsLoading}
          />
        </div>

        {/* Tabs de Imoveis vs Alugueis */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'real_estate' | 'rental')}>
          <TabsList className="bg-zinc-800 border-zinc-700">
            <TabsTrigger value="real_estate" className="data-[state=active]:bg-blue-600">
              <Building2 className="h-4 w-4 mr-2" />
              Imoveis (Real Estate)
            </TabsTrigger>
            <TabsTrigger value="rental" className="data-[state=active]:bg-green-600">
              <FileText className="h-4 w-4 mr-2" />
              Alugueis (Rental)
            </TabsTrigger>
          </TabsList>

          <TabsContent value="real_estate" className="mt-4">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-white flex items-center gap-2 text-lg">
                  <Building2 className="h-5 w-5 text-blue-500" />
                  NFTs de Imoveis
                </CardTitle>
                <CardDescription>
                  Tokens ERC-721 representando propriedades imobiliarias
                </CardDescription>
              </CardHeader>
              <CardContent>
                <NFTTable
                  data={realEstateNFTs || []}
                  isLoading={realEstateLoading}
                  search={search}
                  onSearchChange={setSearch}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rental" className="mt-4">
            <Card className="bg-zinc-900 border-zinc-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-white flex items-center gap-2 text-lg">
                  <FileText className="h-5 w-5 text-green-500" />
                  NFTs de Alugueis
                </CardTitle>
                <CardDescription>
                  Tokens ERC-1155 representando contratos de aluguel
                </CardDescription>
              </CardHeader>
              <CardContent>
                <NFTTable
                  data={rentalNFTs || []}
                  isLoading={rentalLoading}
                  search={search}
                  onSearchChange={setSearch}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Info do Contrato */}
        <Card className="bg-zinc-900/50 border-zinc-800 border-dashed">
          <CardContent className="p-4">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-zinc-400">
                <Hash className="h-4 w-4" />
                <span>Contratos Smart Contract:</span>
              </div>
              <div className="flex items-center gap-4">
                <a
                  href={getPolygonScanUrl('address', import.meta.env.VITE_REAL_ESTATE_NFT_ADDRESS || '0x...')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-blue-400 hover:text-blue-300"
                >
                  <Building2 className="h-3 w-3" />
                  Real Estate
                  <ExternalLink className="h-3 w-3" />
                </a>
                <a
                  href={getPolygonScanUrl('address', import.meta.env.VITE_RENTAL_NFT_ADDRESS || '0x...')}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-green-400 hover:text-green-300"
                >
                  <FileText className="h-3 w-3" />
                  Rental
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
