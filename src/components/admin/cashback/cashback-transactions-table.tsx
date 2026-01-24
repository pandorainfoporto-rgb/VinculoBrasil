// =============================================================================
// CashbackTransactionsTable - Tabela de Transações de Cashback
// =============================================================================

import * as React from 'react';
import {
  Search,
  Filter,
  Download,
  ExternalLink,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Users,
  Building,
  UserCheck,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import {
  type AdminCashbackTransaction,
  type CashbackCategory,
  type UserRole,
  CASHBACK_CATEGORY_LABELS,
  USER_ROLE_LABELS,
  generateMockTransactions,
} from '@/lib/cashback-admin-types';
import { CASHBACK_TYPE_LABELS, LOYALTY_TIER_LABELS, formatVBRz, type LoyaltyTier } from '@/lib/tokenomics-types';

// =============================================================================
// COMPONENTE PRINCIPAL
// =============================================================================

export function CashbackTransactionsTable() {
  const [transactions] = React.useState<AdminCashbackTransaction[]>(() => generateMockTransactions(50));
  const [searchQuery, setSearchQuery] = React.useState('');
  const [categoryFilter, setCategoryFilter] = React.useState<string>('all');
  const [roleFilter, setRoleFilter] = React.useState<string>('all');
  const [statusFilter, setStatusFilter] = React.useState<string>('all');
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 10;

  // Filtrar transações
  const filteredTransactions = React.useMemo(() => {
    return transactions.filter((tx) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (
          !tx.userName.toLowerCase().includes(query) &&
          !tx.userEmail.toLowerCase().includes(query) &&
          !tx.walletAddress.toLowerCase().includes(query) &&
          !tx.id.toLowerCase().includes(query)
        ) {
          return false;
        }
      }
      if (categoryFilter !== 'all' && tx.category !== categoryFilter) return false;
      if (roleFilter !== 'all' && tx.userRole !== roleFilter) return false;
      if (statusFilter !== 'all' && tx.status !== statusFilter) return false;
      return true;
    });
  }, [transactions, searchQuery, categoryFilter, roleFilter, statusFilter]);

  // Paginação
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Seleção
  const toggleSelectAll = () => {
    if (selectedIds.size === paginatedTransactions.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedTransactions.map((tx) => tx.id)));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Estatísticas da seleção
  const selectedTotal = React.useMemo(() => {
    return filteredTransactions
      .filter((tx) => selectedIds.has(tx.id))
      .reduce((sum, tx) => sum + tx.cashbackVBRz, 0);
  }, [filteredTransactions, selectedIds]);

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Transações de Cashback</CardTitle>
            <CardDescription>
              {filteredTransactions.length} transações encontradas
              {selectedIds.size > 0 && ` • ${selectedIds.size} selecionadas (${formatVBRz(selectedTotal)} VBRz)`}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            {selectedIds.size > 0 && (
              <>
                <Button variant="outline" size="sm">
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Aprovar
                </Button>
                <Button variant="outline" size="sm" className="text-destructive">
                  <XCircle className="mr-2 h-4 w-4" />
                  Rejeitar
                </Button>
              </>
            )}
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Filtros */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, email, wallet ou ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas Categorias</SelectItem>
              {Object.entries(CASHBACK_CATEGORY_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="Tipo Usuário" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos Tipos</SelectItem>
              {Object.entries(USER_ROLE_LABELS).map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos Status</SelectItem>
              <SelectItem value="confirmed">Confirmado</SelectItem>
              <SelectItem value="pending">Pendente</SelectItem>
              <SelectItem value="processing">Processando</SelectItem>
              <SelectItem value="failed">Falhou</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tabela */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedIds.size === paginatedTransactions.length && paginatedTransactions.length > 0}
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
                <TableHead>Usuário</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-right">Valor Original</TableHead>
                <TableHead className="text-right">Cashback</TableHead>
                <TableHead>Tier</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedTransactions.map((tx) => (
                <TableRow key={tx.id} className={selectedIds.has(tx.id) ? 'bg-muted/50' : ''}>
                  <TableCell>
                    <Checkbox checked={selectedIds.has(tx.id)} onCheckedChange={() => toggleSelect(tx.id)} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <UserRoleIcon role={tx.userRole} />
                      <div>
                        <div className="font-medium">{tx.userName}</div>
                        <div className="text-xs text-muted-foreground">{tx.walletAddress}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <Badge variant="outline" className="text-xs">
                        {CASHBACK_TYPE_LABELS[tx.type]}
                      </Badge>
                      <div className="mt-1 text-xs text-muted-foreground">
                        {CASHBACK_CATEGORY_LABELS[tx.category]}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <span className="font-medium">R$ {tx.originalAmountBRL.toFixed(2)}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div>
                      <span className="font-medium text-primary">{formatVBRz(tx.cashbackVBRz)} VBRz</span>
                      {tx.bonusVBRz > 0 && (
                        <div className="text-xs text-green-600">+{formatVBRz(tx.bonusVBRz)} bonus</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <TierBadge tier={tx.loyaltyTier} multiplier={tx.loyaltyMultiplier} />
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={tx.status} />
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{tx.createdAt.toLocaleDateString('pt-BR')}</div>
                    <div className="text-xs text-muted-foreground">
                      {tx.createdAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </TableCell>
                  <TableCell>
                    {tx.txHash && (
                      <Button variant="ghost" size="icon" asChild>
                        <a
                          href={`https://polygonscan.com/tx/${tx.txHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Paginação */}
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Mostrando {(currentPage - 1) * itemsPerPage + 1} a{' '}
            {Math.min(currentPage * itemsPerPage, filteredTransactions.length)} de {filteredTransactions.length}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm">
              Página {currentPage} de {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// =============================================================================
// COMPONENTES AUXILIARES
// =============================================================================

function UserRoleIcon({ role }: { role: UserRole }) {
  const icons: Record<UserRole, React.ElementType> = {
    tenant: Users,
    landlord: Building,
    guarantor: UserCheck,
    admin: Users,
  };
  const Icon = icons[role];
  return (
    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
      <Icon className="h-4 w-4 text-muted-foreground" />
    </div>
  );
}

function TierBadge({ tier, multiplier }: { tier: LoyaltyTier; multiplier: number }) {
  const colors: Record<LoyaltyTier, string> = {
    bronze: 'bg-amber-100 text-amber-800',
    prata: 'bg-gray-100 text-gray-800',
    ouro: 'bg-yellow-100 text-yellow-800',
    diamante: 'bg-cyan-100 text-cyan-800',
  };

  return (
    <div className="flex flex-col items-start gap-1">
      <Badge className={colors[tier]}>{LOYALTY_TIER_LABELS[tier]}</Badge>
      {multiplier > 1 && <span className="text-xs text-muted-foreground">x{multiplier}</span>}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { icon: React.ElementType; label: string; className: string }> = {
    confirmed: { icon: CheckCircle, label: 'Confirmado', className: 'bg-green-100 text-green-800' },
    pending: { icon: Clock, label: 'Pendente', className: 'bg-yellow-100 text-yellow-800' },
    processing: { icon: AlertCircle, label: 'Processando', className: 'bg-blue-100 text-blue-800' },
    failed: { icon: XCircle, label: 'Falhou', className: 'bg-red-100 text-red-800' },
    cancelled: { icon: XCircle, label: 'Cancelado', className: 'bg-gray-100 text-gray-800' },
  };

  const { icon: Icon, label, className } = config[status] || config.pending;

  return (
    <Badge className={className}>
      <Icon className="mr-1 h-3 w-3" />
      {label}
    </Badge>
  );
}

export default CashbackTransactionsTable;
