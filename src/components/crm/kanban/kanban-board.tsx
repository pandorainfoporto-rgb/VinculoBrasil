// =============================================================================
// Kanban Board - Componente Principal do CRM Visual
// =============================================================================

import * as React from 'react';
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
  type DraggableProvided,
  type DroppableProvided,
} from '@hello-pangea/dnd';
import {
  Plus,
  Filter,
  Search,
  MoreHorizontal,
  Flame,
  Clock,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  Building2,
  User,
  Tag,
  ChevronDown,
  ChevronRight,
  X,
  ArrowUpRight,
  MessageSquare,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { useCRMStore } from '../store';
import {
  type Deal,
  type KanbanColumn,
  type DealPriority,
  PRIORITY_COLORS,
  PRIORITY_LABELS,
} from '../types';

// -----------------------------------------------------------------------------
// Componente DealCard
// -----------------------------------------------------------------------------

interface DealCardProps {
  deal: Deal;
  provided: DraggableProvided;
  isDragging: boolean;
}

function DealCard({ deal, provided, isDragging }: DealCardProps) {
  const { selectDeal } = useCRMStore();

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - new Date(date).getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Hoje';
    if (diffDays === 1) return 'Ontem';
    if (diffDays < 7) return `${diffDays} dias`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} sem`;
    return `${Math.floor(diffDays / 30)} mês`;
  };

  return (
    <div
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      className={cn(
        'group mb-2 rounded-lg border bg-card shadow-sm transition-all',
        'hover:border-primary/30 hover:shadow-md',
        isDragging && 'rotate-2 shadow-lg ring-2 ring-primary/20'
      )}
    >
      <Card className="border-0 shadow-none">
        <CardHeader className="p-3 pb-2">
          {/* Header com prioridade e menu */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h4
                className="font-medium text-sm leading-tight truncate cursor-pointer hover:text-primary"
                onClick={() => selectDeal(deal)}
              >
                {deal.title}
              </h4>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <Badge
                variant="secondary"
                className={cn('text-[10px] px-1.5 py-0', PRIORITY_COLORS[deal.priority])}
              >
                {PRIORITY_LABELS[deal.priority]}
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100"
                  >
                    <MoreHorizontal className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => selectDeal(deal)}>
                    <ArrowUpRight className="h-4 w-4 mr-2" />
                    Abrir detalhes
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Phone className="h-4 w-4 mr-2" />
                    Ligar
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Enviar WhatsApp
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Calendar className="h-4 w-4 mr-2" />
                    Agendar visita
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-3 pt-0 space-y-2">
          {/* Valor */}
          <div className="flex items-center gap-1.5 text-sm">
            <DollarSign className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
            <span className="font-semibold text-green-700 dark:text-green-400">
              {formatCurrency(deal.valorTotal)}
            </span>
            <span className="text-muted-foreground text-xs">/mês</span>
          </div>

          {/* Imóvel */}
          {deal.imovelTipo && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Building2 className="h-3 w-3" />
              <span className="truncate">{deal.imovelTipo}</span>
              {deal.imovelEndereco && (
                <span className="truncate">- {deal.imovelEndereco}</span>
              )}
            </div>
          )}

          {/* Tags */}
          {deal.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {deal.tags.slice(0, 3).map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="text-[10px] px-1.5 py-0 bg-muted/50"
                >
                  {tag}
                </Badge>
              ))}
              {deal.tags.length > 3 && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                  +{deal.tags.length - 3}
                </Badge>
              )}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-1 border-t">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{getTimeAgo(deal.movedAt)}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    Movido para este estágio
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" />
                      <span>{deal.activityCount}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    {deal.activityCount} atividades registradas
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {/* Probabilidade */}
            <div className="flex items-center gap-1">
              <div
                className="h-1.5 w-12 rounded-full bg-muted overflow-hidden"
                title={`${deal.probability}% de chance`}
              >
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${deal.probability}%` }}
                />
              </div>
              <span className="text-[10px] text-muted-foreground">
                {deal.probability}%
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Componente KanbanColumn
// -----------------------------------------------------------------------------

interface KanbanColumnProps {
  column: KanbanColumn;
  index: number;
}

function KanbanColumnComponent({ column, index }: KanbanColumnProps) {
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [isAddDealOpen, setIsAddDealOpen] = React.useState(false);
  const [newDealForm, setNewDealForm] = React.useState({
    title: '',
    valorAluguel: '',
  });
  const { createDeal, selectedPipelineId, leads } = useCRMStore();

  const handleAddDeal = () => {
    if (!newDealForm.title || !selectedPipelineId) return;

    // Usa o primeiro lead disponível ou cria um ID temporário
    const leadId = leads.length > 0 ? leads[0].id : `temp_lead_${Date.now()}`;

    createDeal({
      leadId,
      title: newDealForm.title,
      valorAluguel: parseFloat(newDealForm.valorAluguel) || 0,
      pipelineId: selectedPipelineId,
      stageId: column.stage.id,
      priority: 'media',
      tags: [],
    });

    setNewDealForm({ title: '', valorAluguel: '' });
    setIsAddDealOpen(false);
  };

  const totalValue = column.deals.reduce((sum, deal) => sum + deal.valorTotal, 0);

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `R$ ${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `R$ ${(value / 1000).toFixed(0)}k`;
    }
    return `R$ ${value.toFixed(0)}`;
  };

  return (
    <div
      className={cn(
        'flex flex-col bg-muted/30 rounded-xl min-w-[300px] max-w-[300px] h-full border',
        isCollapsed && 'min-w-[60px] max-w-[60px]'
      )}
    >
      {/* Header da Coluna */}
      <div
        className={cn(
          'p-3 flex items-center justify-between border-b bg-background/50 rounded-t-xl',
          isCollapsed && 'flex-col gap-2 py-4'
        )}
      >
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
          <div
            className="w-3 h-3 rounded-full shrink-0"
            style={{ backgroundColor: column.stage.color }}
          />
          {!isCollapsed && (
            <span className="font-semibold text-sm">{column.stage.name}</span>
          )}
        </button>

        {isCollapsed ? (
          <div className="flex flex-col items-center gap-1 text-xs text-muted-foreground writing-vertical">
            <span className="rotate-90 whitespace-nowrap">
              {column.stage.name}
            </span>
            <Badge variant="secondary" className="mt-2">
              {column.deals.length}
            </Badge>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">
              {column.deals.length}
            </Badge>
            <span className="text-xs text-muted-foreground font-medium">
              {formatCurrency(totalValue)}
            </span>
          </div>
        )}
      </div>

      {/* Lista de Cards */}
      {!isCollapsed && (
        <Droppable droppableId={column.stage.id} type="DEAL">
          {(provided: DroppableProvided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={cn(
                'flex-1 p-2 overflow-y-auto min-h-[200px] transition-colors',
                snapshot.isDraggingOver && 'bg-primary/5'
              )}
            >
              {column.deals.map((deal, dealIndex) => (
                <Draggable key={deal.id} draggableId={deal.id} index={dealIndex}>
                  {(provided: DraggableProvided, snapshot) => (
                    <DealCard
                      deal={deal}
                      provided={provided}
                      isDragging={snapshot.isDragging}
                    />
                  )}
                </Draggable>
              ))}
              {provided.placeholder}

              {/* Empty State */}
              {column.deals.length === 0 && (
                <div className="flex flex-col items-center justify-center py-8 text-muted-foreground text-sm">
                  <Building2 className="h-8 w-8 mb-2 opacity-50" />
                  <p>Nenhum negócio</p>
                  <p className="text-xs">Arraste um card para cá</p>
                </div>
              )}
            </div>
          )}
        </Droppable>
      )}

      {/* Botão Adicionar */}
      {!isCollapsed && (
        <div className="p-2 border-t">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-muted-foreground hover:text-foreground"
            onClick={() => setIsAddDealOpen(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar negócio
          </Button>
        </div>
      )}

      {/* Dialog Adicionar Negócio */}
      <Dialog open={isAddDealOpen} onOpenChange={setIsAddDealOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Novo Negócio</DialogTitle>
            <DialogDescription>
              Adicionar negócio na etapa "{column.stage.name}"
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título do Negócio *</Label>
              <Input
                id="title"
                placeholder="Ex: Locação Apartamento Centro"
                value={newDealForm.title}
                onChange={(e) => setNewDealForm({ ...newDealForm, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="valorAluguel">Valor do Aluguel (R$)</Label>
              <Input
                id="valorAluguel"
                type="number"
                placeholder="0,00"
                value={newDealForm.valorAluguel}
                onChange={(e) => setNewDealForm({ ...newDealForm, valorAluguel: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDealOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddDeal} disabled={!newDealForm.title}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Componente Principal KanbanBoard
// -----------------------------------------------------------------------------

export function KanbanBoard() {
  const {
    pipelines,
    kanbanColumns,
    selectedPipelineId,
    filters,
    isLoading,
    loadPipelines,
    selectPipeline,
    moveDeal,
    setFilters,
    clearFilters,
  } = useCRMStore();

  const [showFilters, setShowFilters] = React.useState(false);

  // Carregar pipelines ao montar apenas se ainda não carregados
  React.useEffect(() => {
    if (pipelines.length === 0) {
      loadPipelines();
    }
  }, [pipelines.length, loadPipelines]);

  // Handler do Drag & Drop
  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    // Se não tem destino ou é o mesmo lugar, ignora
    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    // Mover deal para nova coluna
    moveDeal({
      dealId: draggableId,
      targetStageId: destination.droppableId,
    });
  };

  // Estatísticas do pipeline
  const stats = React.useMemo(() => {
    const allDeals = kanbanColumns.flatMap((col) => col.deals);
    return {
      total: allDeals.length,
      value: allDeals.reduce((sum, d) => sum + d.valorTotal, 0),
      avgValue: allDeals.length > 0
        ? allDeals.reduce((sum, d) => sum + d.valorTotal, 0) / allDeals.length
        : 0,
      hot: allDeals.filter((d) => d.priority === 'urgente' || d.priority === 'alta').length,
    };
  }, [kanbanColumns]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
    }).format(value);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 p-4 border-b bg-background">
        {/* Seletor de Pipeline */}
        <div className="flex items-center gap-4">
          <Select
            value={selectedPipelineId || ''}
            onValueChange={selectPipeline}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Selecione o funil" />
            </SelectTrigger>
            <SelectContent>
              {pipelines.map((pipeline) => (
                <SelectItem key={pipeline.id} value={pipeline.id}>
                  {pipeline.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Stats */}
          <div className="hidden md:flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <span className="font-medium text-foreground">{stats.total}</span>
              negócios
            </div>
            <Separator orientation="vertical" className="h-4" />
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <DollarSign className="h-4 w-4 text-green-600 dark:text-green-400" />
              <span className="font-medium text-green-700 dark:text-green-400">
                {formatCurrency(stats.value)}
              </span>
              em pipeline
            </div>
            <Separator orientation="vertical" className="h-4" />
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Flame className="h-4 w-4 text-orange-500 dark:text-orange-400" />
              <span className="font-medium text-orange-600 dark:text-orange-400">{stats.hot}</span>
              quentes
            </div>
          </div>
        </div>

        {/* Busca e Filtros */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar negócios..."
              value={filters.search}
              onChange={(e) => setFilters({ search: e.target.value })}
              className="pl-9 w-[200px]"
            />
          </div>

          <Button
            variant={showFilters ? 'secondary' : 'outline'}
            size="icon"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4" />
          </Button>

          <Button variant="default" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Novo Negócio
          </Button>
        </div>
      </div>

      {/* Filtros Expandidos */}
      {showFilters && (
        <div className="flex items-center gap-4 p-4 bg-muted/30 border-b">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Prioridade:</span>
            <div className="flex gap-1">
              {(['baixa', 'media', 'alta', 'urgente'] as DealPriority[]).map((priority) => (
                <Badge
                  key={priority}
                  variant={filters.priority.includes(priority) ? 'default' : 'outline'}
                  className={cn(
                    'cursor-pointer',
                    filters.priority.includes(priority) && PRIORITY_COLORS[priority]
                  )}
                  onClick={() => {
                    const newPriorities = filters.priority.includes(priority)
                      ? filters.priority.filter((p) => p !== priority)
                      : [...filters.priority, priority];
                    setFilters({ priority: newPriorities });
                  }}
                >
                  {PRIORITY_LABELS[priority]}
                </Badge>
              ))}
            </div>
          </div>

          <Separator orientation="vertical" className="h-6" />

          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-muted-foreground"
          >
            <X className="h-4 w-4 mr-1" />
            Limpar filtros
          </Button>
        </div>
      )}

      {/* Kanban Board */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <ScrollArea className="flex-1">
          <div className="flex gap-4 p-4 h-[calc(100vh-200px)] min-h-[500px]">
            {kanbanColumns.map((column, index) => (
              <KanbanColumnComponent
                key={column.stage.id}
                column={column}
                index={index}
              />
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </DragDropContext>
    </div>
  );
}
