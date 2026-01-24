/**
 * Agent Inbox - Painel de Atendimento para Operadores
 *
 * Features:
 * - Visualização unificada de todas as conversas
 * - Transferência entre departamentos e agentes
 * - Histórico de conversa com IA antes de assumir
 * - Templates e respostas rápidas
 * - Métricas em tempo real
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
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
  MessageSquare,
  Send,
  Phone,
  MoreVertical,
  Search,
  Bot,
  User,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Headphones,
  Tag,
  Archive,
  Star,
  StarOff,
  Paperclip,
  FileText,
  Smile,
  Circle,
  CheckCheck,
  Check,
  ArrowRightCircle,
  Building2,
  Users,
  Zap,
  Sparkles,
  Copy,
  ExternalLink,
  Info,
  AlertTriangle,
  Timer,
  TrendingUp,
  BarChart3,
  MessageCircle,
  Inbox,
  Filter,
  X,
  ChevronDown,
  Image,
  Mic,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type {
  Ticket,
  Message,
  Contact,
  Agent,
  Department,
  TicketStatus,
  TicketPriority,
  MessageSender,
} from '@/types/omnichannel';

// Mock current agent
const currentAgent: Agent = {
  id: 'agent-current',
  userId: 'user-current',
  name: 'Você (Atendente)',
  email: 'atendente@vinculobrasil.com',
  status: 'online',
  role: 'agent',
  departmentIds: ['dept-1', 'dept-2'],
  queueIds: ['queue-1', 'queue-2'],
  maxConcurrentChats: 5,
  activeChats: 3,
  isOnline: true,
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Mock tickets
const mockTickets: Ticket[] = [
  {
    id: 'ticket-1',
    number: 1001,
    contactId: 'contact-1',
    contact: {
      id: 'contact-1',
      name: 'Carlos Silva',
      phone: '+55 11 98765-4321',
      email: 'carlos@email.com',
      isOnline: true,
      channel: 'whatsapp',
      channelId: '5511987654321',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    channel: 'whatsapp',
    status: 'agent_handling',
    priority: 'high',
    departmentId: 'dept-1',
    queueId: 'queue-1',
    subject: 'Dúvida sobre boleto vencido',
    assignedAgentId: 'agent-current',
    messages: [
      {
        id: 'm1',
        ticketId: 'ticket-1',
        contactId: 'contact-1',
        content: 'Olá! Meu boleto venceu ontem, consigo pagar ainda?',
        timestamp: new Date(Date.now() - 600000),
        sender: 'customer',
        status: 'read',
        type: 'text',
      },
      {
        id: 'm2',
        ticketId: 'ticket-1',
        contactId: 'contact-1',
        content:
          'Olá Carlos! Sim, você pode pagar o boleto com acréscimo de juros de 0,33% ao dia. Deseja que eu gere um novo boleto atualizado?',
        timestamp: new Date(Date.now() - 540000),
        sender: 'bot',
        senderName: 'Vini Financeiro',
        status: 'read',
        type: 'text',
        suggestedByAI: true,
      },
      {
        id: 'm3',
        ticketId: 'ticket-1',
        contactId: 'contact-1',
        content: 'Sim, por favor! Pode me enviar o novo boleto?',
        timestamp: new Date(Date.now() - 300000),
        sender: 'customer',
        status: 'read',
        type: 'text',
      },
      {
        id: 'm4',
        ticketId: 'ticket-1',
        contactId: 'contact-1',
        content: 'Cliente transferido para atendimento humano - Necessita de aprovação para desconto',
        timestamp: new Date(Date.now() - 240000),
        sender: 'system',
        status: 'read',
        type: 'system_event',
      },
    ],
    lastMessageAt: new Date(Date.now() - 300000),
    unreadCount: 1,
    isStarred: false,
    tags: [
      { id: 'tag-1', name: 'Pagamento', color: 'bg-green-500', type: 'auto', category: 'request_type' },
      { id: 'tag-2', name: 'Boleto', color: 'bg-emerald-500', type: 'auto', category: 'request_type' },
    ],
    sentiment: 'neutral',
    contractId: 'CTR-001',
    createdAt: new Date(Date.now() - 600000),
    updatedAt: new Date(),
  },
  {
    id: 'ticket-2',
    number: 1002,
    contactId: 'contact-2',
    contact: {
      id: 'contact-2',
      name: 'Maria Santos',
      phone: '+55 11 91234-5678',
      email: 'maria@email.com',
      isOnline: false,
      channel: 'whatsapp',
      channelId: '5511912345678',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    channel: 'whatsapp',
    status: 'waiting',
    priority: 'urgent',
    departmentId: 'dept-2',
    queueId: 'queue-2',
    subject: 'Vistoriador não compareceu',
    messages: [
      {
        id: 'm1',
        ticketId: 'ticket-2',
        contactId: 'contact-2',
        content: 'O vistoriador não apareceu no horário marcado! Estou esperando há 1 hora!',
        timestamp: new Date(Date.now() - 3600000),
        sender: 'customer',
        status: 'read',
        type: 'text',
      },
      {
        id: 'm2',
        ticketId: 'ticket-2',
        contactId: 'contact-2',
        content:
          'Sinto muito pelo inconveniente, Maria. Estou verificando o status da vistoria. Por favor, aguarde um momento.',
        timestamp: new Date(Date.now() - 3540000),
        sender: 'bot',
        senderName: 'Vini Suporte',
        status: 'read',
        type: 'text',
      },
      {
        id: 'm3',
        ticketId: 'ticket-2',
        contactId: 'contact-2',
        content: 'Transferindo para atendente especializado...',
        timestamp: new Date(Date.now() - 3500000),
        sender: 'system',
        status: 'read',
        type: 'system_event',
      },
    ],
    lastMessageAt: new Date(Date.now() - 3500000),
    unreadCount: 0,
    isStarred: true,
    tags: [
      { id: 'tag-3', name: 'Reclamação', color: 'bg-red-500', type: 'auto', category: 'request_type' },
      { id: 'tag-4', name: 'Vistoria', color: 'bg-blue-500', type: 'auto', category: 'request_type' },
    ],
    sentiment: 'negative',
    contractId: 'CTR-003',
    createdAt: new Date(Date.now() - 3600000),
    updatedAt: new Date(),
  },
  {
    id: 'ticket-3',
    number: 1003,
    contactId: 'contact-3',
    contact: {
      id: 'contact-3',
      name: 'Pedro Costa',
      phone: '+55 11 99999-8888',
      isOnline: true,
      channel: 'webchat',
      channelId: 'web-session-123',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    channel: 'webchat',
    status: 'bot_handling',
    priority: 'normal',
    departmentId: 'dept-3',
    queueId: 'queue-3',
    subject: 'Interesse em alugar imóvel',
    messages: [
      {
        id: 'm1',
        ticketId: 'ticket-3',
        contactId: 'contact-3',
        content: 'Boa tarde! Procuro um apartamento 2 quartos em Pinheiros',
        timestamp: new Date(Date.now() - 900000),
        sender: 'customer',
        status: 'read',
        type: 'text',
      },
      {
        id: 'm2',
        ticketId: 'ticket-3',
        contactId: 'contact-3',
        content:
          'Olá Pedro! Temos 12 opções de apartamentos 2 quartos em Pinheiros. Qual sua faixa de preço ideal?',
        timestamp: new Date(Date.now() - 840000),
        sender: 'bot',
        senderName: 'Vini Comercial',
        status: 'read',
        type: 'text',
      },
    ],
    lastMessageAt: new Date(Date.now() - 840000),
    unreadCount: 0,
    isStarred: false,
    tags: [
      { id: 'tag-5', name: 'Lead', color: 'bg-purple-500', type: 'auto', category: 'request_type' },
    ],
    sentiment: 'positive',
    createdAt: new Date(Date.now() - 900000),
    updatedAt: new Date(),
  },
];

const mockDepartments: Department[] = [
  {
    id: 'dept-1',
    name: 'Financeiro',
    description: 'Boletos, pagamentos e cobranças',
    color: 'bg-emerald-500',
    isActive: true,
    autoAssign: true,
    maxTicketsPerAgent: 5,
    agents: [],
    queues: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'dept-2',
    name: 'Suporte',
    description: 'Problemas técnicos',
    color: 'bg-blue-500',
    isActive: true,
    autoAssign: true,
    maxTicketsPerAgent: 4,
    agents: [],
    queues: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'dept-3',
    name: 'Comercial',
    description: 'Vendas e parcerias',
    color: 'bg-purple-500',
    isActive: true,
    autoAssign: false,
    maxTicketsPerAgent: 8,
    agents: [],
    queues: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const mockAgents: Agent[] = [
  {
    id: 'agent-1',
    userId: 'user-1',
    name: 'João Silva',
    email: 'joao@vinculobrasil.com',
    status: 'online',
    role: 'agent',
    departmentIds: ['dept-1'],
    queueIds: [],
    maxConcurrentChats: 5,
    activeChats: 3,
    isOnline: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'agent-2',
    userId: 'user-2',
    name: 'Maria Santos',
    email: 'maria@vinculobrasil.com',
    status: 'online',
    role: 'supervisor',
    departmentIds: ['dept-1', 'dept-2'],
    queueIds: [],
    maxConcurrentChats: 8,
    activeChats: 5,
    isOnline: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// Quick replies
const quickReplies = [
  { id: 'qr-1', trigger: '/ola', response: 'Olá! Como posso ajudá-lo(a) hoje?' },
  { id: 'qr-2', trigger: '/boleto', response: 'Vou gerar uma segunda via do boleto para você. Aguarde um momento.' },
  { id: 'qr-3', trigger: '/aguarde', response: 'Por favor, aguarde um momento enquanto verifico as informações.' },
  { id: 'qr-4', trigger: '/obrigado', response: 'Precisando de mais alguma coisa, estou à disposição!' },
  { id: 'qr-5', trigger: '/transferir', response: 'Vou transferir você para o setor responsável. Um momento, por favor.' },
];

export function AgentInbox() {
  const [tickets, setTickets] = useState<Ticket[]>(mockTickets);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(mockTickets[0]);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);
  const [transferType, setTransferType] = useState<'department' | 'agent'>('department');
  const [transferTargetId, setTransferTargetId] = useState('');
  const [transferNote, setTransferNote] = useState('');
  const [showQuickReplies, setShowQuickReplies] = useState(false);

  // Stats
  const stats = {
    myTickets: tickets.filter((t) => t.assignedAgentId === currentAgent.id).length,
    waiting: tickets.filter((t) => t.status === 'waiting').length,
    botHandling: tickets.filter((t) => t.status === 'bot_handling').length,
    urgent: tickets.filter((t) => t.priority === 'urgent').length,
    avgResponseTime: '2m 30s',
  };

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      ticket.contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.contact.phone?.includes(searchQuery) ||
      ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.number.toString().includes(searchQuery);
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || ticket.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedTicket) return;

    const newMessage: Message = {
      id: `m-${Date.now()}`,
      ticketId: selectedTicket.id,
      contactId: selectedTicket.contactId,
      content: messageInput,
      timestamp: new Date(),
      sender: 'agent',
      senderName: currentAgent.name,
      senderId: currentAgent.id,
      status: 'sent',
      type: 'text',
    };

    setTickets(
      tickets.map((t) =>
        t.id === selectedTicket.id
          ? {
              ...t,
              messages: [...t.messages, newMessage],
              lastMessageAt: new Date(),
              status: 'agent_handling' as TicketStatus,
              assignedAgentId: currentAgent.id,
            }
          : t
      )
    );

    setSelectedTicket((prev) =>
      prev
        ? {
            ...prev,
            messages: [...prev.messages, newMessage],
            status: 'agent_handling',
            assignedAgentId: currentAgent.id,
          }
        : null
    );

    setMessageInput('');
    setShowQuickReplies(false);
  };

  const handleAssignToMe = (ticketId: string) => {
    setTickets(
      tickets.map((t) =>
        t.id === ticketId
          ? { ...t, assignedAgentId: currentAgent.id, status: 'agent_handling' as TicketStatus }
          : t
      )
    );
  };

  const handleResolve = (ticketId: string) => {
    setTickets(
      tickets.map((t) =>
        t.id === ticketId
          ? { ...t, status: 'resolved' as TicketStatus, resolvedAt: new Date() }
          : t
      )
    );
  };

  const handleTransfer = () => {
    if (!selectedTicket || !transferTargetId) return;

    const systemMessage: Message = {
      id: `m-${Date.now()}`,
      ticketId: selectedTicket.id,
      contactId: selectedTicket.contactId,
      content: `Ticket transferido para ${transferType === 'department' ? 'departamento' : 'agente'}: ${transferTargetId}${transferNote ? `. Nota: ${transferNote}` : ''}`,
      timestamp: new Date(),
      sender: 'system',
      status: 'sent',
      type: 'system_event',
    };

    setTickets(
      tickets.map((t) =>
        t.id === selectedTicket.id
          ? {
              ...t,
              messages: [...t.messages, systemMessage],
              status: 'transferred' as TicketStatus,
              departmentId: transferType === 'department' ? transferTargetId : t.departmentId,
              assignedAgentId: transferType === 'agent' ? transferTargetId : undefined,
            }
          : t
      )
    );

    setIsTransferDialogOpen(false);
    setTransferTargetId('');
    setTransferNote('');
    setSelectedTicket(null);
  };

  const handleToggleStar = (ticketId: string) => {
    setTickets(tickets.map((t) => (t.id === ticketId ? { ...t, isStarred: !t.isStarred } : t)));
    if (selectedTicket?.id === ticketId) {
      setSelectedTicket((prev) => (prev ? { ...prev, isStarred: !prev.isStarred } : null));
    }
  };

  const handleQuickReply = (response: string) => {
    setMessageInput(response);
    setShowQuickReplies(false);
  };

  const handleInputChange = (value: string) => {
    setMessageInput(value);
    // Show quick replies when typing /
    if (value.startsWith('/')) {
      setShowQuickReplies(true);
    } else {
      setShowQuickReplies(false);
    }
  };

  const getStatusColor = (status: TicketStatus) => {
    switch (status) {
      case 'waiting':
        return 'bg-amber-500';
      case 'bot_handling':
        return 'bg-violet-500';
      case 'agent_handling':
        return 'bg-blue-500';
      case 'resolved':
        return 'bg-green-500';
      case 'pending_customer':
        return 'bg-orange-500';
      case 'transferred':
        return 'bg-cyan-500';
      default:
        return 'bg-gray-400';
    }
  };

  const getStatusLabel = (status: TicketStatus) => {
    switch (status) {
      case 'waiting':
        return 'Aguardando';
      case 'bot_handling':
        return 'IA Atendendo';
      case 'agent_handling':
        return 'Em Atendimento';
      case 'resolved':
        return 'Resolvido';
      case 'pending_customer':
        return 'Aguard. Cliente';
      case 'transferred':
        return 'Transferido';
      default:
        return status;
    }
  };

  const getPriorityColor = (priority: TicketPriority) => {
    switch (priority) {
      case 'urgent':
        return 'text-red-500 bg-red-50';
      case 'high':
        return 'text-amber-500 bg-amber-50';
      case 'normal':
        return 'text-blue-500 bg-blue-50';
      case 'low':
        return 'text-gray-500 bg-gray-50';
    }
  };

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'whatsapp':
        return (
          <svg viewBox="0 0 24 24" className="h-4 w-4 fill-green-500">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
        );
      case 'webchat':
        return <MessageCircle className="h-4 w-4 text-blue-500" />;
      case 'email':
        return <MessageSquare className="h-4 w-4 text-gray-500" />;
      default:
        return <MessageSquare className="h-4 w-4" />;
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (minutes < 1) return 'Agora';
    if (minutes < 60) return `${minutes}min`;
    if (hours < 24) return `${hours}h`;
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <div className="h-[calc(100vh-200px)] flex flex-col">
      {/* Stats Header */}
      <div className="grid gap-4 md:grid-cols-5 mb-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-3 flex items-center gap-3">
            <div className="p-2 bg-blue-500 rounded-lg">
              <Inbox className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-xs text-blue-600">Meus Tickets</p>
              <p className="text-xl font-bold text-blue-700">{stats.myTickets}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="p-3 flex items-center gap-3">
            <div className="p-2 bg-amber-500 rounded-lg">
              <Clock className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-xs text-amber-600">Aguardando</p>
              <p className="text-xl font-bold text-amber-700">{stats.waiting}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-violet-50 border-violet-200">
          <CardContent className="p-3 flex items-center gap-3">
            <div className="p-2 bg-violet-500 rounded-lg">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-xs text-violet-600">IA Atendendo</p>
              <p className="text-xl font-bold text-violet-700">{stats.botHandling}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-3 flex items-center gap-3">
            <div className="p-2 bg-red-500 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-xs text-red-600">Urgentes</p>
              <p className="text-xl font-bold text-red-700">{stats.urgent}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-3 flex items-center gap-3">
            <div className="p-2 bg-green-500 rounded-lg">
              <Timer className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-xs text-green-600">Tempo Médio</p>
              <p className="text-xl font-bold text-green-700">{stats.avgResponseTime}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="flex-1 grid gap-4 lg:grid-cols-3 overflow-hidden">
        {/* Ticket List */}
        <Card className="lg:col-span-1 flex flex-col overflow-hidden">
          <CardHeader className="pb-3 space-y-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Inbox className="h-5 w-5 text-green-500" />
                Central de Atendimento
              </CardTitle>
              <Button variant="ghost" size="sm">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar tickets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-8 text-xs flex-1">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos Status</SelectItem>
                  <SelectItem value="waiting">Aguardando</SelectItem>
                  <SelectItem value="bot_handling">IA Atendendo</SelectItem>
                  <SelectItem value="agent_handling">Em Atendimento</SelectItem>
                  <SelectItem value="pending_customer">Aguard. Cliente</SelectItem>
                  <SelectItem value="resolved">Resolvido</SelectItem>
                </SelectContent>
              </Select>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="h-8 text-xs flex-1">
                  <SelectValue placeholder="Prioridade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="urgent">Urgente</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="low">Baixa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>

          <CardContent className="flex-1 overflow-hidden p-0">
            <ScrollArea className="h-full">
              {filteredTickets.map((ticket) => (
                <div
                  key={ticket.id}
                  onClick={() => setSelectedTicket(ticket)}
                  className={cn(
                    'p-3 border-b cursor-pointer hover:bg-slate-50 transition-colors',
                    selectedTicket?.id === ticket.id &&
                      'bg-green-50 border-l-2 border-l-green-500'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={ticket.contact.avatar} />
                        <AvatarFallback className="bg-green-100 text-green-700">
                          {ticket.contact.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      {ticket.contact.isOnline && (
                        <Circle className="absolute bottom-0 right-0 h-3 w-3 fill-green-500 text-green-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1">
                          {ticket.isStarred && (
                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                          )}
                          <span className="font-medium text-sm truncate">
                            {ticket.contact.name}
                          </span>
                          {getChannelIcon(ticket.channel)}
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatTime(ticket.lastMessageAt)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        #{ticket.number} - {ticket.subject}
                      </p>
                      <p className="text-xs text-muted-foreground truncate mt-1">
                        {ticket.messages[ticket.messages.length - 1]?.content.slice(0, 50)}...
                      </p>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <Badge className={cn('text-xs py-0', getStatusColor(ticket.status))}>
                          {getStatusLabel(ticket.status)}
                        </Badge>
                        <Badge className={cn('text-xs py-0', getPriorityColor(ticket.priority))}>
                          {ticket.priority === 'urgent'
                            ? 'Urgente'
                            : ticket.priority === 'high'
                            ? 'Alta'
                            : ticket.priority === 'normal'
                            ? 'Normal'
                            : 'Baixa'}
                        </Badge>
                        {ticket.unreadCount > 0 && (
                          <Badge className="bg-green-500 text-xs py-0">
                            {ticket.unreadCount}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Chat View */}
        <Card className="lg:col-span-2 flex flex-col overflow-hidden">
          {selectedTicket ? (
            <>
              {/* Chat Header */}
              <CardHeader className="border-b pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={selectedTicket.contact.avatar} />
                      <AvatarFallback className="bg-green-100 text-green-700">
                        {selectedTicket.contact.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-base flex items-center gap-2">
                        {selectedTicket.contact.name}
                        {getChannelIcon(selectedTicket.channel)}
                        {selectedTicket.contact.isOnline && (
                          <span className="text-xs text-green-500">Online</span>
                        )}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <span>#{selectedTicket.number}</span>
                        <span>-</span>
                        <span>{selectedTicket.contact.phone}</span>
                        {selectedTicket.contractId && (
                          <Badge variant="outline" className="text-xs">
                            {selectedTicket.contractId}
                          </Badge>
                        )}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleToggleStar(selectedTicket.id)}
                          >
                            {selectedTicket.isStarred ? (
                              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                            ) : (
                              <StarOff className="h-4 w-4" />
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {selectedTicket.isStarred ? 'Remover destaque' : 'Destacar'}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {selectedTicket.assignedAgentId !== currentAgent.id && (
                          <DropdownMenuItem
                            onClick={() => handleAssignToMe(selectedTicket.id)}
                          >
                            <Headphones className="h-4 w-4 mr-2" />
                            Assumir Atendimento
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuItem onClick={() => setIsTransferDialogOpen(true)}>
                          <ArrowRightCircle className="h-4 w-4 mr-2" />
                          Transferir
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleResolve(selectedTicket.id)}>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Marcar Resolvido
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Info className="h-4 w-4 mr-2" />
                          Ver Detalhes do Contato
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Archive className="h-4 w-4 mr-2" />
                          Arquivar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Tags & Info */}
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  {selectedTicket.tags.map((tag) => (
                    <Badge
                      key={tag.id}
                      className={cn('text-xs', tag.color, 'text-white')}
                    >
                      <Tag className="h-3 w-3 mr-1" />
                      {tag.name}
                    </Badge>
                  ))}
                  {selectedTicket.sentiment && (
                    <Badge
                      variant="outline"
                      className={cn(
                        'text-xs',
                        selectedTicket.sentiment === 'positive' && 'text-green-600',
                        selectedTicket.sentiment === 'negative' && 'text-red-600',
                        selectedTicket.sentiment === 'neutral' && 'text-gray-600'
                      )}
                    >
                      {selectedTicket.sentiment === 'positive'
                        ? 'Positivo'
                        : selectedTicket.sentiment === 'negative'
                        ? 'Negativo'
                        : 'Neutro'}
                    </Badge>
                  )}
                  {selectedTicket.assignedAgentId && (
                    <Badge variant="outline" className="text-xs">
                      <User className="h-3 w-3 mr-1" />
                      {selectedTicket.assignedAgentId === currentAgent.id
                        ? 'Você'
                        : 'Outro agente'}
                    </Badge>
                  )}
                </div>
              </CardHeader>

              {/* Messages */}
              <CardContent className="flex-1 overflow-hidden p-0">
                <ScrollArea className="h-[350px] p-4">
                  <div className="space-y-4">
                    {selectedTicket.messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={cn(
                          'flex',
                          msg.sender === 'customer'
                            ? 'justify-start'
                            : msg.sender === 'system'
                            ? 'justify-center'
                            : 'justify-end'
                        )}
                      >
                        {msg.sender === 'system' ? (
                          <div className="bg-slate-100 text-slate-600 text-xs px-3 py-1 rounded-full">
                            {msg.content}
                          </div>
                        ) : (
                          <div
                            className={cn(
                              'max-w-[80%] rounded-lg p-3',
                              msg.sender === 'customer'
                                ? 'bg-slate-100'
                                : msg.sender === 'bot'
                                ? 'bg-violet-100'
                                : 'bg-green-100'
                            )}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              {msg.sender === 'bot' && (
                                <Bot className="h-3 w-3 text-violet-600" />
                              )}
                              {msg.sender === 'agent' && (
                                <User className="h-3 w-3 text-green-600" />
                              )}
                              <span className="text-xs font-medium">
                                {msg.sender === 'customer'
                                  ? selectedTicket.contact.name
                                  : msg.senderName}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {msg.timestamp.toLocaleTimeString('pt-BR', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                              {msg.suggestedByAI && (
                                <Badge
                                  variant="outline"
                                  className="text-xs py-0 text-violet-600"
                                >
                                  <Sparkles className="h-3 w-3 mr-1" />
                                  IA
                                </Badge>
                              )}
                            </div>

                            <p className="text-sm">{msg.content}</p>

                            {/* Message Status */}
                            {(msg.sender === 'agent' || msg.sender === 'bot') && (
                              <div className="flex justify-end mt-1">
                                {msg.status === 'sent' && (
                                  <Check className="h-3 w-3 text-gray-400" />
                                )}
                                {msg.status === 'delivered' && (
                                  <CheckCheck className="h-3 w-3 text-gray-400" />
                                )}
                                {msg.status === 'read' && (
                                  <CheckCheck className="h-3 w-3 text-blue-500" />
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>

              {/* Message Input */}
              <div className="p-4 border-t">
                {/* Quick Replies Popup */}
                {showQuickReplies && (
                  <div className="mb-2 p-2 bg-slate-50 rounded-lg border">
                    <p className="text-xs text-muted-foreground mb-2">Respostas Rápidas:</p>
                    <div className="space-y-1">
                      {quickReplies
                        .filter((qr) =>
                          qr.trigger.toLowerCase().includes(messageInput.toLowerCase())
                        )
                        .map((qr) => (
                          <button
                            key={qr.id}
                            onClick={() => handleQuickReply(qr.response)}
                            className="w-full text-left p-2 rounded hover:bg-slate-100 text-sm"
                          >
                            <span className="font-mono text-green-600">{qr.trigger}</span>
                            <span className="text-muted-foreground ml-2">
                              {qr.response.slice(0, 40)}...
                            </span>
                          </button>
                        ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Image className="h-4 w-4" />
                  </Button>
                  <Input
                    placeholder="Digite sua mensagem... (use / para atalhos)"
                    value={messageInput}
                    onChange={(e) => handleInputChange(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1"
                  />
                  <Button variant="ghost" size="sm">
                    <Smile className="h-4 w-4" />
                  </Button>
                  <Button
                    onClick={handleSendMessage}
                    className="bg-green-500 hover:bg-green-600"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>

                {/* Quick Actions */}
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <Button variant="outline" size="sm" className="text-xs">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Sugerir Resposta IA
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs">
                    <FileText className="h-3 w-3 mr-1" />
                    Templates
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => setIsTransferDialogOpen(true)}
                  >
                    <ArrowRightCircle className="h-3 w-3 mr-1" />
                    Transferir
                  </Button>
                  {selectedTicket.status !== 'resolved' && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs text-green-600"
                      onClick={() => handleResolve(selectedTicket.id)}
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Resolver
                    </Button>
                  )}
                </div>
              </div>
            </>
          ) : (
            <CardContent className="flex-1 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <Inbox className="h-16 w-16 mx-auto mb-4 opacity-30 text-green-500" />
                <p className="font-medium">Selecione um ticket</p>
                <p className="text-sm">Escolha um ticket da lista para iniciar o atendimento</p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>

      {/* Transfer Dialog */}
      <Dialog open={isTransferDialogOpen} onOpenChange={setIsTransferDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Transferir Atendimento</DialogTitle>
            <DialogDescription>
              Transferir o ticket #{selectedTicket?.number} para outro departamento ou agente
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Transferir para:</label>
              <div className="flex gap-2">
                <Button
                  variant={transferType === 'department' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTransferType('department')}
                  className={transferType === 'department' ? 'bg-green-600' : ''}
                >
                  <Building2 className="h-4 w-4 mr-2" />
                  Departamento
                </Button>
                <Button
                  variant={transferType === 'agent' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTransferType('agent')}
                  className={transferType === 'agent' ? 'bg-green-600' : ''}
                >
                  <User className="h-4 w-4 mr-2" />
                  Agente
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                {transferType === 'department' ? 'Departamento' : 'Agente'}
              </label>
              <Select value={transferTargetId} onValueChange={setTransferTargetId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {transferType === 'department'
                    ? mockDepartments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>
                          <div className="flex items-center gap-2">
                            <div className={cn('w-2 h-2 rounded-full', dept.color)} />
                            {dept.name}
                          </div>
                        </SelectItem>
                      ))
                    : mockAgents.map((agent) => (
                        <SelectItem key={agent.id} value={agent.id}>
                          <div className="flex items-center gap-2">
                            <div
                              className={cn(
                                'w-2 h-2 rounded-full',
                                agent.isOnline ? 'bg-green-500' : 'bg-gray-400'
                              )}
                            />
                            {agent.name}
                            {!agent.isOnline && (
                              <span className="text-xs text-muted-foreground">(offline)</span>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Nota (opcional)</label>
              <Textarea
                placeholder="Adicione uma nota sobre a transferência..."
                value={transferNote}
                onChange={(e) => setTransferNote(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTransferDialogOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleTransfer}
              disabled={!transferTargetId}
              className="bg-green-600 hover:bg-green-700"
            >
              <ArrowRightCircle className="h-4 w-4 mr-2" />
              Transferir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AgentInbox;
