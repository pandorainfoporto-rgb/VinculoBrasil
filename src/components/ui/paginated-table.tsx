// =============================================================================
// PaginatedTable - Tabela com Paginacao Server-Side
// PERFORMANCE: Skeletons em vez de spinners, React.memo para otimizacao
// =============================================================================

import React, { memo, useMemo, useCallback } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// =============================================================================
// TIPOS
// =============================================================================

export interface Column<T> {
  key: string;
  header: string;
  width?: string;
  sortable?: boolean;
  render?: (item: T, index: number) => React.ReactNode;
}

export interface PaginatedTableProps<T> {
  columns: Column<T>[];
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
  isLoading?: boolean;
  isFetching?: boolean;

  // Navegacao
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;

  // Busca
  search?: string;
  onSearchChange?: (search: string) => void;
  searchPlaceholder?: string;

  // Ordenacao
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (field: string) => void;

  // Customizacao
  emptyMessage?: string;
  className?: string;
  pageSizeOptions?: number[];

  // Acoes por linha
  onRowClick?: (item: T) => void;
  getRowKey?: (item: T, index: number) => string | number;
}

// =============================================================================
// SKELETON ROW - Linha de loading
// =============================================================================

const SkeletonRow = memo(function SkeletonRow({
  columnsCount,
}: {
  columnsCount: number;
}) {
  return (
    <TableRow className="animate-pulse">
      {Array.from({ length: columnsCount }).map((_, i) => (
        <TableCell key={i} className="py-3">
          <div className="h-4 bg-zinc-800 rounded w-3/4" />
        </TableCell>
      ))}
    </TableRow>
  );
});

// =============================================================================
// TABLE SKELETON - Multiple skeleton rows
// =============================================================================

const TableSkeleton = memo(function TableSkeleton({
  rowsCount,
  columnsCount,
}: {
  rowsCount: number;
  columnsCount: number;
}) {
  return (
    <>
      {Array.from({ length: rowsCount }).map((_, i) => (
        <SkeletonRow key={i} columnsCount={columnsCount} />
      ))}
    </>
  );
});

// =============================================================================
// SORT HEADER - Cabecalho com ordenacao
// =============================================================================

const SortHeader = memo(function SortHeader({
  column,
  sortBy,
  sortOrder,
  onSort,
}: {
  column: Column<unknown>;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (field: string) => void;
}) {
  const isActive = sortBy === column.key;

  if (!column.sortable || !onSort) {
    return <span>{column.header}</span>;
  }

  return (
    <button
      onClick={() => onSort(column.key)}
      className="flex items-center gap-1 hover:text-white transition-colors group"
    >
      <span>{column.header}</span>
      {isActive ? (
        sortOrder === 'asc' ? (
          <ArrowUp className="h-3 w-3 text-blue-400" />
        ) : (
          <ArrowDown className="h-3 w-3 text-blue-400" />
        )
      ) : (
        <ArrowUpDown className="h-3 w-3 opacity-0 group-hover:opacity-50 transition-opacity" />
      )}
    </button>
  );
});

// =============================================================================
// PAGINATION CONTROLS - Controles de navegacao
// =============================================================================

const PaginationControls = memo(function PaginationControls({
  pagination,
  onPageChange,
  onPageSizeChange,
  isFetching,
  pageSizeOptions = [10, 20, 50, 100],
}: {
  pagination: PaginatedTableProps<unknown>['pagination'];
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  isFetching?: boolean;
  pageSizeOptions?: number[];
}) {
  const { page, pageSize, totalItems, totalPages, hasNextPage, hasPreviousPage } = pagination;

  const startItem = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, totalItems);

  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-800">
      {/* Info de registros */}
      <div className="flex items-center gap-4 text-sm text-zinc-400">
        <span>
          {startItem}-{endItem} de {totalItems.toLocaleString('pt-BR')}
        </span>

        {/* Seletor de tamanho de pagina */}
        {onPageSizeChange && (
          <div className="flex items-center gap-2">
            <span className="text-xs">Por pagina:</span>
            <Select
              value={pageSize.toString()}
              onValueChange={(v) => onPageSizeChange(Number(v))}
            >
              <SelectTrigger className="w-16 h-8 bg-zinc-800 border-zinc-700 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-700">
                {pageSizeOptions.map((size) => (
                  <SelectItem key={size} value={size.toString()} className="text-xs">
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Indicador de loading */}
        {isFetching && <Loader2 className="h-4 w-4 animate-spin text-blue-400" />}
      </div>

      {/* Botoes de navegacao */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => onPageChange(1)}
          disabled={!hasPreviousPage || isFetching}
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => onPageChange(page - 1)}
          disabled={!hasPreviousPage || isFetching}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {/* Indicador de pagina */}
        <span className="px-3 text-sm text-zinc-300">
          {page} / {totalPages || 1}
        </span>

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => onPageChange(page + 1)}
          disabled={!hasNextPage || isFetching}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => onPageChange(totalPages)}
          disabled={!hasNextPage || isFetching}
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
});

// =============================================================================
// SEARCH BAR - Barra de busca
// =============================================================================

const SearchBar = memo(function SearchBar({
  search,
  onSearchChange,
  placeholder,
}: {
  search?: string;
  onSearchChange?: (search: string) => void;
  placeholder?: string;
}) {
  if (!onSearchChange) return null;

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
      <Input
        value={search || ''}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder={placeholder || 'Buscar...'}
        className="pl-9 bg-zinc-800 border-zinc-700 text-sm h-9"
      />
    </div>
  );
});

// =============================================================================
// COMPONENTE PRINCIPAL - PaginatedTable
// =============================================================================

function PaginatedTableInner<T>({
  columns,
  data,
  pagination,
  isLoading,
  isFetching,
  onPageChange,
  onPageSizeChange,
  search,
  onSearchChange,
  searchPlaceholder,
  sortBy,
  sortOrder,
  onSort,
  emptyMessage = 'Nenhum registro encontrado',
  className,
  pageSizeOptions,
  onRowClick,
  getRowKey,
}: PaginatedTableProps<T>) {
  // Memoiza a renderizacao das celulas
  const renderCell = useCallback(
    (item: T, column: Column<T>, index: number) => {
      if (column.render) {
        return column.render(item, index);
      }
      // Acesso seguro a propriedade
      const value = (item as Record<string, unknown>)[column.key];
      return value !== undefined && value !== null ? String(value) : '-';
    },
    []
  );

  // Key extractor
  const getKey = useCallback(
    (item: T, index: number) => {
      if (getRowKey) return getRowKey(item, index);
      const id = (item as Record<string, unknown>)['id'];
      return id !== undefined ? String(id) : index;
    },
    [getRowKey]
  );

  return (
    <div className={cn('bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden', className)}>
      {/* Barra de busca */}
      {onSearchChange && (
        <div className="p-4 border-b border-zinc-800">
          <SearchBar
            search={search}
            onSearchChange={onSearchChange}
            placeholder={searchPlaceholder}
          />
        </div>
      )}

      {/* Tabela */}
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-zinc-800 hover:bg-transparent">
              {columns.map((column) => (
                <TableHead
                  key={column.key}
                  style={{ width: column.width }}
                  className="text-zinc-400 font-medium text-xs"
                >
                  <SortHeader
                    column={column as Column<unknown>}
                    sortBy={sortBy}
                    sortOrder={sortOrder}
                    onSort={onSort}
                  />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableSkeleton
                rowsCount={pagination.pageSize}
                columnsCount={columns.length}
              />
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-32 text-center text-zinc-500"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              data.map((item, index) => (
                <TableRow
                  key={getKey(item, index)}
                  className={cn(
                    'border-zinc-800',
                    onRowClick && 'cursor-pointer hover:bg-zinc-800/50',
                    isFetching && 'opacity-50'
                  )}
                  onClick={() => onRowClick?.(item)}
                >
                  {columns.map((column) => (
                    <TableCell key={column.key} className="text-sm text-zinc-300 py-2.5">
                      {renderCell(item, column, index)}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Controles de paginacao */}
      <PaginationControls
        pagination={pagination}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        isFetching={isFetching}
        pageSizeOptions={pageSizeOptions}
      />
    </div>
  );
}

// Exporta com memo
export const PaginatedTable = memo(PaginatedTableInner) as typeof PaginatedTableInner;
