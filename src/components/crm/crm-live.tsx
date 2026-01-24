// =============================================================================
// CRM Live - Super Tela Unificada (Kanban + Chat)
// =============================================================================
// Mesa de Operações: Kanban à esquerda, Chat à direita
// Quando um deal é selecionado, abre a conversa associada automaticamente
// =============================================================================

import * as React from 'react';
import { useState, useEffect, useMemo } from 'react';
import {
  DragDropContext,
  Droppable,
  Draggable,
  type DropResult,
  type DraggableProvided,
  type DroppableProvided,
} from '@hello-pangea/dnd';
import {
  MessageSquare,
  Send,
  Phone,
  Search,
  User,
  Clock,
  CheckCheck,
  Plus,
  DollarSign,
  Building2,
  Flame,
  MoreHorizontal,
  ChevronDown,
  ChevronRight,
  X,
  PanelRightClose,
  PanelRightOpen,
  ArrowUpRight,
  Pause,
  Play,
  Loader2,
  Mail,
  Smartphone,
  Filter,
  Tag,
  Zap,
  Bot,
  AlertCircle,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
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
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from '@/components/ui/resizable';
import {
  Alert,
  AlertDescription,
} from '@/components/ui/alert';

import { useCRMStore } from './store';
import {
  type Deal,
  type Lead,
  type KanbanColumn,
  PRIORITY_COLORS,
  PRIORITY_LABELS,
} from './types';
import {
  useTicket,
  useSendMessage,
  type Ticket,
  type Message,
} from '@/hooks/use-tickets';

// =============================================================================
// TYPES
// =============================================================================

interface SelectedContext {
  deal: Deal | null;
  lead: Lead | null;
  conversationId: string | null;
}

// =============================================================================
// MINI DEAL CARD (Compact for Split View)
// =============================================================================

interface MiniDealCardProps {
  deal: Deal;
  provided: DraggableProvided;
  isDragging: boolean;
  isSelected: boolean;
  onSelect: (deal: Deal) => void;
}

function MiniDealCard({ deal, provided, isDragging, isSelected, onSelect }: MiniDealCardProps) {
  const formatCurrency = (value: number) => {
    if (value >= 1000) return `R$ ${(value / 1000).toFixed(0)}k`;
    return `R$ ${value.toFixed(0)}`;
  };

  return (
    <div
      ref={provided.innerRef}
      {...provided.draggableProps}
      {...provided.dragHandleProps}
      onClick={() => onSelect(deal)}
      className={cn(
        'mb-1.5 p-2 rounded-lg border bg-card cursor-pointer transition-all text-xs',
        'hover:border-primary/40 hover:shadow-sm',
        isDragging && 'rotate-1 shadow-md ring-2 ring-primary/20',
        isSelected && 'ring-2 ring-primary border-primary bg-primary/5'
      )}
    >
      {/* Title + Value */}
      <div className="flex items-center justify-between gap-1 mb-1">
        <span className="font-medium truncate flex-1">{deal.title}</span>
        <Badge
          variant="secondary"
          className={cn('text-[9px] px-1 py-0 shrink-0', PRIORITY_COLORS[deal.priority])}
        >
          {PRIORITY_LABELS[deal.priority].charAt(0)}
        </Badge>
      </div>

      {/* Value + Indicators */}
      <div className="flex items-center justify-between text-muted-foreground">
        <span className="font-semibold text-green-700">{formatCurrency(deal.valorTotal)}</span>
        <div className="flex items-center gap-1">
          <MessageSquare className="h-3 w-3" />
          <span>{deal.activityCount}</span>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// COMPACT KANBAN COLUMN
// =============================================================================

interface CompactColumnProps {
  column: KanbanColumn;
  selectedDealId: string | null;
  onSelectDeal: (deal: Deal) => void;
}

function CompactColumn({ column, selectedDealId, onSelectDeal }: CompactColumnProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const totalValue = column.deals.reduce((sum, deal) => sum + deal.valorTotal, 0);
  const formatValue = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
    return `${value.toFixed(0)}`;
  };

  return (
    <div
      className={cn(
        'flex flex-col bg-muted/30 rounded-lg min-w-[220px] max-w-[220px] h-full border',
        isCollapsed && 'min-w-[40px] max-w-[40px]'
      )}
    >
      {/* Header */}
      <div
        className={cn(
          'p-2 flex items-center justify-between border-b bg-background/50 rounded-t-lg',
          isCollapsed && 'flex-col gap-1 py-2'
        )}
      >
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="flex items-center gap-1.5 hover:opacity-80 transition-opacity"
        >
          {isCollapsed ? (
            <ChevronRight className="h-3 w-3 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-3 w-3 text-muted-foreground" />
          )}
          <div
            className="w-2 h-2 rounded-full shrink-0"
            style={{ backgroundColor: column.stage.color }}
          />
          {!isCollapsed && (
            <span className="font-medium text-xs truncate max-w-[100px]">
              {column.stage.name}
            </span>
          )}
        </button>

        {isCollapsed ? (
          <Badge variant="secondary" className="text-[10px] px-1">
            {column.deals.length}
          </Badge>
        ) : (
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <Badge variant="secondary" className="text-[10px] px-1">
              {column.deals.length}
            </Badge>
            <span>R$ {formatValue(totalValue)}</span>
          </div>
        )}
      </div>

      {/* Cards */}
      {!isCollapsed && (
        <Droppable droppableId={column.stage.id} type="DEAL">
          {(provided: DroppableProvided, snapshot) => (
            <ScrollArea
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={cn(
                'flex-1 p-1.5 min-h-[100px]',
                snapshot.isDraggingOver && 'bg-primary/5'
              )}
            >
              {column.deals.map((deal, index) => (
                <Draggable key={deal.id} draggableId={deal.id} index={index}>
                  {(dragProvided: DraggableProvided, dragSnapshot) => (
                    <MiniDealCard
                      deal={deal}
                      provided={dragProvided}
                      isDragging={dragSnapshot.isDragging}
                      isSelected={selectedDealId === deal.id}
                      onSelect={onSelectDeal}
                    />
                  )}
                </Draggable>
              ))}
              {provided.placeholder}

              {column.deals.length === 0 && (
                <div className="flex flex-col items-center justify-center py-4 text-muted-foreground text-xs">
                  <Building2 className="h-5 w-5 mb-1 opacity-50" />
                  <p>Vazio</p>
                </div>
              )}
            </ScrollArea>
          )}
        </Droppable>
      )}
    </div>
  );
}

// =============================================================================
// CHAT PANEL
// =============================================================================

interface ChatPanelProps {
  context: SelectedContext;
  onClose: () => void;
}

function ChatPanel({ context, onClose }: ChatPanelProps) {
  const [messageText, setMessageText] = useState('');

  // Fetch ticket/conversation if we have a conversationId
  const { data: ticket, isLoading: ticketLoading } = useTicket(context.conversationId);
  const sendMessageMutation = useSendMessage();

  const handleSendMessage = async () => {
    if (!messageText.trim() || !context.conversationId) return;

    try {
      await sendMessageMutation.mutateAsync({
        ticketId: context.conversationId,
        data: { content: messageText },
      });
      setMessageText('');
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // No deal selected
  if (!context.deal) {
    return (
      <div className="flex flex-col h-full items-center justify-center text-muted-foreground p-8">
        <MessageSquare className="h-12 w-12 mb-4 opacity-30" />
        <p className="text-lg font-medium">Nenhum negócio selecionado</p>
        <p className="text-sm text-center mt-2">
          Clique em um card do Kanban para ver a conversa associada
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-3 border-b bg-background">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-primary/10 text-primary text-sm">
              {context.deal.title.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-sm">{context.deal.title}</h3>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <DollarSign className="h-3 w-3" />
              <span className="text-green-600 font-medium">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(context.deal.valorTotal)}
              </span>
              <Separator orientation="vertical" className="h-3" />
              <Badge variant="outline" className={cn('text-[10px]', PRIORITY_COLORS[context.deal.priority])}>
                {PRIORITY_LABELS[context.deal.priority]}
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* Marketing Status */}
          {context.lead?.activeEngageCampaignId && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                  >
                    {context.lead.engageStatus === 'active' ? (
                      <Zap className="h-4 w-4 text-yellow-500" />
                    ) : (
                      <Pause className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {context.lead?.engageStatus === 'active'
                    ? 'Recebendo automação de marketing - Clique para pausar'
                    : 'Marketing pausado - Clique para reativar'}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Phone className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Marketing Banner (if in campaign) */}
      {context.lead?.activeEngageCampaignId && context.lead.engageStatus === 'active' && (
        <Alert className="rounded-none border-x-0 border-t-0 bg-yellow-50 border-yellow-200">
          <Zap className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-700 text-xs flex items-center justify-between">
            <span>Este lead está em automação de marketing</span>
            <Button variant="ghost" size="sm" className="h-6 text-xs text-yellow-700 hover:text-yellow-800">
              <Pause className="h-3 w-3 mr-1" />
              Pausar
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4">
        {ticketLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : !context.conversationId ? (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <MessageSquare className="h-8 w-8 mb-2 opacity-40" />
            <p className="text-sm">Nenhuma conversa vinculada</p>
            <Button variant="outline" size="sm" className="mt-3">
              <Plus className="h-4 w-4 mr-2" />
              Iniciar Conversa
            </Button>
          </div>
        ) : ticket?.messages && ticket.messages.length > 0 ? (
          <div className="space-y-3">
            {ticket.messages.map((msg: Message) => (
              <div
                key={msg.id}
                className={cn(
                  'flex',
                  msg.senderType === 'AGENT' || msg.senderType === 'BOT' ? 'justify-end' : 'justify-start'
                )}
              >
                <div
                  className={cn(
                    'max-w-[80%] rounded-lg px-3 py-2',
                    msg.senderType === 'AGENT' || msg.senderType === 'BOT'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  )}
                >
                  {msg.senderType === 'BOT' && (
                    <div className="flex items-center gap-1 text-xs opacity-70 mb-1">
                      <Bot className="h-3 w-3" />
                      <span>Assistente IA</span>
                    </div>
                  )}
                  <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                  <div className="flex items-center justify-end gap-1 mt-1 text-[10px] opacity-70">
                    <span>
                      {new Date(msg.createdAt).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                    {msg.senderType === 'AGENT' && (
                      <CheckCheck className="h-3 w-3" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
            <MessageSquare className="h-8 w-8 mb-2 opacity-40" />
            <p className="text-sm">Nenhuma mensagem ainda</p>
          </div>
        )}
      </ScrollArea>

      {/* Message Input */}
      {context.conversationId && (
        <div className="p-3 border-t bg-background">
          <div className="flex gap-2">
            <Textarea
              placeholder="Digite sua mensagem..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              onKeyDown={handleKeyDown}
              className="min-h-[40px] max-h-[120px] resize-none text-sm"
              rows={1}
            />
            <Button
              size="icon"
              onClick={handleSendMessage}
              disabled={!messageText.trim() || sendMessageMutation.isPending}
            >
              {sendMessageMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT: CRM LIVE
// =============================================================================

export function CRMLive() {
  const {
    pipelines,
    kanbanColumns,
    selectedPipelineId,
    leads,
    filters,
    isLoading,
    loadPipelines,
    selectPipeline,
    moveDeal,
    setFilters,
  } = useCRMStore();

  const [selectedContext, setSelectedContext] = useState<SelectedContext>({
    deal: null,
    lead: null,
    conversationId: null,
  });
  const [chatPanelOpen, setChatPanelOpen] = useState(true);

  // Load pipelines on mount
  useEffect(() => {
    if (pipelines.length === 0) {
      loadPipelines();
    }
  }, [pipelines.length, loadPipelines]);

  // Handle deal selection
  const handleSelectDeal = (deal: Deal) => {
    // Find the associated lead
    const lead = leads.find(l => l.id === deal.leadId) || null;

    setSelectedContext({
      deal,
      lead,
      conversationId: lead?.lastConversationId || null,
    });
    setChatPanelOpen(true);
  };

  // Handle drag end
  const handleDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) return;

    moveDeal({
      dealId: draggableId,
      targetStageId: destination.droppableId,
    });
  };

  // Close chat panel
  const handleCloseChat = () => {
    setSelectedContext({ deal: null, lead: null, conversationId: null });
  };

  // Stats
  const stats = useMemo(() => {
    const allDeals = kanbanColumns.flatMap(col => col.deals);
    return {
      total: allDeals.length,
      value: allDeals.reduce((sum, d) => sum + d.valorTotal, 0),
      hot: allDeals.filter(d => d.priority === 'urgente' || d.priority === 'alta').length,
    };
  }, [kanbanColumns]);

  const formatCurrency = (value: number) => {
    if (value >= 1000000) return `R$ ${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `R$ ${(value / 1000).toFixed(0)}k`;
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-100px)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-100px)]">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 px-4 py-3 border-b bg-background shrink-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-primary/10 rounded-lg">
              <Flame className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="font-bold text-lg">CRM Live</h1>
              <p className="text-xs text-muted-foreground">Mesa de Operações</p>
            </div>
          </div>

          <Separator orientation="vertical" className="h-8" />

          {/* Pipeline Selector */}
          <Select value={selectedPipelineId || ''} onValueChange={selectPipeline}>
            <SelectTrigger className="w-[180px] h-9">
              <SelectValue placeholder="Funil" />
            </SelectTrigger>
            <SelectContent>
              {pipelines.map(p => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Stats */}
          <div className="hidden lg:flex items-center gap-3 text-sm">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <span className="font-semibold text-foreground">{stats.total}</span>
              negócios
            </div>
            <div className="flex items-center gap-1.5">
              <DollarSign className="h-4 w-4 text-green-600" />
              <span className="font-semibold text-green-700">{formatCurrency(stats.value)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Flame className="h-4 w-4 text-orange-500" />
              <span className="font-semibold text-orange-600">{stats.hot}</span>
              <span className="text-muted-foreground">quentes</span>
            </div>
          </div>
        </div>

        {/* Search + Actions */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar..."
              value={filters.search}
              onChange={(e) => setFilters({ search: e.target.value })}
              className="pl-8 w-[180px] h-9"
            />
          </div>

          <Button variant="outline" size="icon" className="h-9 w-9">
            <Filter className="h-4 w-4" />
          </Button>

          <Button
            variant="outline"
            size="icon"
            className="h-9 w-9"
            onClick={() => setChatPanelOpen(!chatPanelOpen)}
          >
            {chatPanelOpen ? (
              <PanelRightClose className="h-4 w-4" />
            ) : (
              <PanelRightOpen className="h-4 w-4" />
            )}
          </Button>

          <Button size="sm" className="h-9">
            <Plus className="h-4 w-4 mr-1" />
            Novo
          </Button>
        </div>
      </div>

      {/* Main Content: Resizable Panels */}
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        {/* Kanban Panel */}
        <ResizablePanel defaultSize={chatPanelOpen ? 60 : 100} minSize={40}>
          <DragDropContext onDragEnd={handleDragEnd}>
            <ScrollArea className="h-full">
              <div className="flex gap-3 p-4 h-full">
                {kanbanColumns.map((column) => (
                  <CompactColumn
                    key={column.stage.id}
                    column={column}
                    selectedDealId={selectedContext.deal?.id || null}
                    onSelectDeal={handleSelectDeal}
                  />
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </DragDropContext>
        </ResizablePanel>

        {/* Chat Panel */}
        {chatPanelOpen && (
          <>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={40} minSize={25} maxSize={50}>
              <div className="h-full border-l bg-background">
                <ChatPanel
                  context={selectedContext}
                  onClose={handleCloseChat}
                />
              </div>
            </ResizablePanel>
          </>
        )}
      </ResizablePanelGroup>
    </div>
  );
}

export default CRMLive;
