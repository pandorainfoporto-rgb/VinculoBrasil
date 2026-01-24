/**
 * WhatsApp Inbox - Central de Atendimento via WhatsApp
 * Exibe conversas do WhatsApp configurado para atendimento
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  MessageSquare,
  Send,
  Phone,
  MoreVertical,
  Search,
  Filter,
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
  ArrowRight,
  MessageCircle,
  Paperclip,
  Image,
  FileText,
  Mic,
  Smile,
  ChevronDown,
  Circle,
  CheckCheck,
  Check,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Types
interface WhatsAppContact {
  id: string;
  name: string;
  phone: string;
  avatar?: string;
  lastSeen?: Date;
  isOnline?: boolean;
}

interface WhatsAppMessage {
  id: string;
  content: string;
  timestamp: Date;
  sender: 'customer' | 'agent' | 'bot';
  senderName?: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  type: 'text' | 'image' | 'document' | 'audio' | 'template';
  mediaUrl?: string;
}

interface WhatsAppConversation {
  id: string;
  contact: WhatsAppContact;
  status: 'waiting' | 'bot_handling' | 'agent_handling' | 'resolved' | 'pending_response';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  department: string;
  subject: string;
  assignedAgent?: string;
  messages: WhatsAppMessage[];
  lastMessageAt: Date;
  unreadCount: number;
  isStarred: boolean;
  tags: string[];
  waitingTime?: number; // em minutos
  contractId?: string;
}

// Mock data for conversations
const mockConversations: WhatsAppConversation[] = [
  {
    id: 'conv1',
    contact: {
      id: 'c1',
      name: 'Carlos Silva',
      phone: '+55 11 98765-4321',
      isOnline: true,
    },
    status: 'waiting',
    priority: 'high',
    department: 'Financeiro',
    subject: 'Duvida sobre boleto vencido',
    messages: [
      { id: 'm1', content: 'Ola! Meu boleto venceu ontem, consigo pagar ainda?', timestamp: new Date(Date.now() - 300000), sender: 'customer', status: 'read', type: 'text' },
      { id: 'm2', content: 'Ola Carlos! Sim, voce pode pagar o boleto com acrescimo de juros de 0,33% ao dia. Deseja que eu gere um novo boleto atualizado?', timestamp: new Date(Date.now() - 240000), sender: 'bot', senderName: 'Vini Financeiro', status: 'delivered', type: 'text' },
      { id: 'm3', content: 'Sim, por favor! Pode me enviar o novo boleto?', timestamp: new Date(Date.now() - 60000), sender: 'customer', status: 'read', type: 'text' },
    ],
    lastMessageAt: new Date(Date.now() - 60000),
    unreadCount: 1,
    isStarred: false,
    tags: ['pagamento', 'boleto'],
    waitingTime: 5,
    contractId: 'CTR-001',
  },
  {
    id: 'conv2',
    contact: {
      id: 'c2',
      name: 'Maria Santos',
      phone: '+55 11 91234-5678',
      lastSeen: new Date(Date.now() - 600000),
    },
    status: 'agent_handling',
    priority: 'urgent',
    department: 'Suporte',
    subject: 'Vistoriador nao compareceu',
    assignedAgent: 'Joao Suporte',
    messages: [
      { id: 'm1', content: 'O vistoriador nao apareceu no horario marcado!', timestamp: new Date(Date.now() - 3600000), sender: 'customer', status: 'read', type: 'text' },
      { id: 'm2', content: 'Sinto muito pelo inconveniente, Maria. Estou verificando com nossa equipe de vistorias.', timestamp: new Date(Date.now() - 3000000), sender: 'agent', senderName: 'Joao Suporte', status: 'read', type: 'text' },
      { id: 'm3', content: 'Conseguimos reagendar sua vistoria para amanha as 14h. Confirma?', timestamp: new Date(Date.now() - 1800000), sender: 'agent', senderName: 'Joao Suporte', status: 'delivered', type: 'text' },
    ],
    lastMessageAt: new Date(Date.now() - 1800000),
    unreadCount: 0,
    isStarred: true,
    tags: ['vistoria', 'reclamacao'],
    contractId: 'CTR-003',
  },
  {
    id: 'conv3',
    contact: {
      id: 'c3',
      name: 'Pedro Costa',
      phone: '+55 11 99999-8888',
      isOnline: true,
    },
    status: 'bot_handling',
    priority: 'normal',
    department: 'Comercial',
    subject: 'Interesse em alugar imovel',
    messages: [
      { id: 'm1', content: 'Boa tarde! Procuro um apartamento 2 quartos em Pinheiros', timestamp: new Date(Date.now() - 900000), sender: 'customer', status: 'read', type: 'text' },
      { id: 'm2', content: 'Ola Pedro! Temos 12 opcoes de apartamentos 2 quartos em Pinheiros. Qual sua faixa de preco ideal?', timestamp: new Date(Date.now() - 840000), sender: 'bot', senderName: 'Vini Comercial', status: 'read', type: 'text' },
      { id: 'm3', content: 'Entre R$ 2.500 e R$ 4.000', timestamp: new Date(Date.now() - 600000), sender: 'customer', status: 'read', type: 'text' },
      { id: 'm4', content: 'Perfeito! Encontrei 5 opcoes nessa faixa. Vou enviar as fotos:', timestamp: new Date(Date.now() - 540000), sender: 'bot', senderName: 'Vini Comercial', status: 'delivered', type: 'text' },
    ],
    lastMessageAt: new Date(Date.now() - 540000),
    unreadCount: 0,
    isStarred: false,
    tags: ['lead', 'locacao'],
  },
  {
    id: 'conv4',
    contact: {
      id: 'c4',
      name: 'Ana Ferreira',
      phone: '+55 11 97777-6666',
      lastSeen: new Date(Date.now() - 86400000),
    },
    status: 'resolved',
    priority: 'low',
    department: 'Financeiro',
    subject: 'Comprovante de pagamento',
    messages: [
      { id: 'm1', content: 'Preciso do comprovante de pagamento do mes passado', timestamp: new Date(Date.now() - 86400000), sender: 'customer', status: 'read', type: 'text' },
      { id: 'm2', content: 'Claro! Segue o comprovante em anexo:', timestamp: new Date(Date.now() - 85800000), sender: 'bot', senderName: 'Vini Financeiro', status: 'read', type: 'text' },
      { id: 'm3', content: 'comprovante_dez_2025.pdf', timestamp: new Date(Date.now() - 85700000), sender: 'bot', senderName: 'Vini Financeiro', status: 'read', type: 'document', mediaUrl: '/docs/comprovante.pdf' },
      { id: 'm4', content: 'Obrigada!', timestamp: new Date(Date.now() - 85000000), sender: 'customer', status: 'read', type: 'text' },
    ],
    lastMessageAt: new Date(Date.now() - 85000000),
    unreadCount: 0,
    isStarred: false,
    tags: ['comprovante'],
    contractId: 'CTR-002',
  },
  {
    id: 'conv5',
    contact: {
      id: 'c5',
      name: 'Roberto Santos (Garantidor)',
      phone: '+55 11 95555-4444',
      isOnline: false,
    },
    status: 'pending_response',
    priority: 'normal',
    department: 'Garantidores',
    subject: 'Duvida sobre rendimentos',
    messages: [
      { id: 'm1', content: 'Bom dia! Gostaria de saber quando recebo meus 5% deste mes?', timestamp: new Date(Date.now() - 7200000), sender: 'customer', status: 'read', type: 'text' },
      { id: 'm2', content: 'Bom dia Roberto! Os pagamentos de garantidores sao processados no dia 5 de cada mes, junto com o split automatico. Voce ja deve receber amanha!', timestamp: new Date(Date.now() - 7100000), sender: 'bot', senderName: 'Vini Financeiro', status: 'read', type: 'text' },
      { id: 'm3', content: 'Mas ja e dia 7 e nao recebi ainda...', timestamp: new Date(Date.now() - 3600000), sender: 'customer', status: 'read', type: 'text' },
    ],
    lastMessageAt: new Date(Date.now() - 3600000),
    unreadCount: 1,
    isStarred: false,
    tags: ['garantidor', 'pagamento'],
  },
];

export function WhatsAppInbox() {
  const [conversations, setConversations] = useState<WhatsAppConversation[]>(mockConversations);
  const [selectedConversation, setSelectedConversation] = useState<WhatsAppConversation | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [departmentFilter, setDepartmentFilter] = useState<string>('all');

  // Handlers
  const handleSendMessage = () => {
    if (!messageInput.trim() || !selectedConversation) return;

    const newMessage: WhatsAppMessage = {
      id: `m${Date.now()}`,
      content: messageInput,
      timestamp: new Date(),
      sender: 'agent',
      senderName: 'Voce',
      status: 'sent',
      type: 'text',
    };

    setConversations(convs => convs.map(c =>
      c.id === selectedConversation.id
        ? {
            ...c,
            messages: [...c.messages, newMessage],
            lastMessageAt: new Date(),
            status: 'agent_handling' as const,
          }
        : c
    ));

    setSelectedConversation(prev =>
      prev ? { ...prev, messages: [...prev.messages, newMessage], status: 'agent_handling' } : null
    );

    setMessageInput('');
  };

  const handleAssignToMe = (convId: string) => {
    setConversations(convs => convs.map(c =>
      c.id === convId
        ? { ...c, assignedAgent: 'Voce', status: 'agent_handling' as const }
        : c
    ));
  };

  const handleTransferToBot = (convId: string) => {
    setConversations(convs => convs.map(c =>
      c.id === convId
        ? { ...c, assignedAgent: undefined, status: 'bot_handling' as const }
        : c
    ));
  };

  const handleResolve = (convId: string) => {
    setConversations(convs => convs.map(c =>
      c.id === convId
        ? { ...c, status: 'resolved' as const }
        : c
    ));
  };

  const handleToggleStar = (convId: string) => {
    setConversations(convs => convs.map(c =>
      c.id === convId
        ? { ...c, isStarred: !c.isStarred }
        : c
    ));
  };

  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = conv.contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         conv.contact.phone.includes(searchQuery) ||
                         conv.subject.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || conv.status === statusFilter;
    const matchesDepartment = departmentFilter === 'all' || conv.department === departmentFilter;
    return matchesSearch && matchesStatus && matchesDepartment;
  });

  const getStatusColor = (status: WhatsAppConversation['status']) => {
    switch (status) {
      case 'waiting': return 'bg-amber-500';
      case 'bot_handling': return 'bg-violet-500';
      case 'agent_handling': return 'bg-blue-500';
      case 'resolved': return 'bg-green-500';
      case 'pending_response': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  const getStatusLabel = (status: WhatsAppConversation['status']) => {
    switch (status) {
      case 'waiting': return 'Aguardando';
      case 'bot_handling': return 'IA Atendendo';
      case 'agent_handling': return 'Humano';
      case 'resolved': return 'Resolvido';
      case 'pending_response': return 'Pendente';
      default: return status;
    }
  };

  const getPriorityColor = (priority: WhatsAppConversation['priority']) => {
    switch (priority) {
      case 'urgent': return 'text-red-500 bg-red-100';
      case 'high': return 'text-amber-500 bg-amber-100';
      case 'normal': return 'text-blue-500 bg-blue-100';
      case 'low': return 'text-gray-500 bg-gray-100';
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Agora';
    if (minutes < 60) return `${minutes}min`;
    if (hours < 24) return `${hours}h`;
    return `${days}d`;
  };

  // Stats
  const stats = {
    waiting: conversations.filter(c => c.status === 'waiting').length,
    botHandling: conversations.filter(c => c.status === 'bot_handling').length,
    agentHandling: conversations.filter(c => c.status === 'agent_handling').length,
    pending: conversations.filter(c => c.status === 'pending_response').length,
    totalUnread: conversations.reduce((sum, c) => sum + c.unreadCount, 0),
  };

  return (
    <div className="h-[calc(100vh-200px)] flex flex-col">
      {/* Header Stats */}
      <div className="grid gap-4 md:grid-cols-5 mb-4">
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
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-3 flex items-center gap-3">
            <div className="p-2 bg-blue-500 rounded-lg">
              <Headphones className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-xs text-blue-600">Humano</p>
              <p className="text-xl font-bold text-blue-700">{stats.agentHandling}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-3 flex items-center gap-3">
            <div className="p-2 bg-red-500 rounded-lg">
              <AlertCircle className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-xs text-red-600">Pendente</p>
              <p className="text-xl font-bold text-red-700">{stats.pending}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-emerald-50 border-emerald-200">
          <CardContent className="p-3 flex items-center gap-3">
            <div className="p-2 bg-emerald-500 rounded-lg">
              <MessageSquare className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-xs text-emerald-600">Nao Lidas</p>
              <p className="text-xl font-bold text-emerald-700">{stats.totalUnread}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="flex-1 grid gap-4 lg:grid-cols-3 overflow-hidden">
        {/* Conversation List */}
        <Card className="lg:col-span-1 flex flex-col overflow-hidden">
          <CardHeader className="pb-3 space-y-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-green-500" />
                WhatsApp Inbox
              </CardTitle>
              <Button variant="ghost" size="sm">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar conversas..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos Status</SelectItem>
                  <SelectItem value="waiting">Aguardando</SelectItem>
                  <SelectItem value="bot_handling">IA Atendendo</SelectItem>
                  <SelectItem value="agent_handling">Humano</SelectItem>
                  <SelectItem value="pending_response">Pendente</SelectItem>
                  <SelectItem value="resolved">Resolvido</SelectItem>
                </SelectContent>
              </Select>
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="h-8 text-xs">
                  <SelectValue placeholder="Depto" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="Financeiro">Financeiro</SelectItem>
                  <SelectItem value="Suporte">Suporte</SelectItem>
                  <SelectItem value="Comercial">Comercial</SelectItem>
                  <SelectItem value="Garantidores">Garantidores</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>

          <CardContent className="flex-1 overflow-hidden p-0">
            <ScrollArea className="h-full">
              {filteredConversations.map(conv => (
                <div
                  key={conv.id}
                  onClick={() => setSelectedConversation(conv)}
                  className={cn(
                    "p-3 border-b cursor-pointer hover:bg-slate-50 transition-colors",
                    selectedConversation?.id === conv.id && "bg-green-50 border-l-2 border-l-green-500"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="relative">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={conv.contact.avatar} />
                        <AvatarFallback className="bg-green-100 text-green-700">
                          {conv.contact.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      {conv.contact.isOnline && (
                        <Circle className="absolute bottom-0 right-0 h-3 w-3 fill-green-500 text-green-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1">
                          {conv.isStarred && <Star className="h-3 w-3 fill-amber-400 text-amber-400" />}
                          <span className="font-medium text-sm truncate">{conv.contact.name}</span>
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatTime(conv.lastMessageAt)}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">{conv.subject}</p>
                      <p className="text-xs text-muted-foreground truncate mt-1">
                        {conv.messages[conv.messages.length - 1]?.content.slice(0, 50)}...
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className={cn("text-xs py-0", getStatusColor(conv.status))}>
                          {getStatusLabel(conv.status)}
                        </Badge>
                        <Badge variant="outline" className="text-xs py-0">{conv.department}</Badge>
                        {conv.unreadCount > 0 && (
                          <Badge className="bg-green-500 text-xs py-0">{conv.unreadCount}</Badge>
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
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <CardHeader className="border-b pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={selectedConversation.contact.avatar} />
                      <AvatarFallback className="bg-green-100 text-green-700">
                        {selectedConversation.contact.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-base flex items-center gap-2">
                        {selectedConversation.contact.name}
                        {selectedConversation.contact.isOnline && (
                          <span className="text-xs text-green-500">Online</span>
                        )}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        {selectedConversation.contact.phone}
                        {selectedConversation.contractId && (
                          <Badge variant="outline" className="text-xs">
                            {selectedConversation.contractId}
                          </Badge>
                        )}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={cn("py-0", getPriorityColor(selectedConversation.priority))}>
                      {selectedConversation.priority === 'urgent' ? 'Urgente' :
                       selectedConversation.priority === 'high' ? 'Alta' :
                       selectedConversation.priority === 'normal' ? 'Normal' : 'Baixa'}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleStar(selectedConversation.id)}
                    >
                      {selectedConversation.isStarred ? (
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      ) : (
                        <StarOff className="h-4 w-4" />
                      )}
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Acoes</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleAssignToMe(selectedConversation.id)}>
                          <Headphones className="h-4 w-4 mr-2" />Assumir Atendimento
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleTransferToBot(selectedConversation.id)}>
                          <Bot className="h-4 w-4 mr-2" />Transferir para IA
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleResolve(selectedConversation.id)}>
                          <CheckCircle className="h-4 w-4 mr-2" />Marcar Resolvido
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Archive className="h-4 w-4 mr-2" />Arquivar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex items-center gap-2 mt-2">
                  {selectedConversation.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      <Tag className="h-3 w-3 mr-1" />{tag}
                    </Badge>
                  ))}
                  {selectedConversation.assignedAgent && (
                    <Badge variant="outline" className="text-xs">
                      <User className="h-3 w-3 mr-1" />{selectedConversation.assignedAgent}
                    </Badge>
                  )}
                </div>
              </CardHeader>

              {/* Messages */}
              <CardContent className="flex-1 overflow-hidden p-0">
                <ScrollArea className="h-[350px] p-4">
                  <div className="space-y-4">
                    {selectedConversation.messages.map(msg => (
                      <div
                        key={msg.id}
                        className={cn(
                          "flex",
                          msg.sender === 'customer' ? 'justify-start' : 'justify-end'
                        )}
                      >
                        <div
                          className={cn(
                            "max-w-[80%] rounded-lg p-3",
                            msg.sender === 'customer'
                              ? 'bg-slate-100'
                              : msg.sender === 'bot'
                              ? 'bg-violet-100'
                              : 'bg-green-100'
                          )}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            {msg.sender === 'bot' && <Bot className="h-3 w-3 text-violet-600" />}
                            {msg.sender === 'agent' && <User className="h-3 w-3 text-green-600" />}
                            <span className="text-xs font-medium">
                              {msg.sender === 'customer' ? selectedConversation.contact.name : msg.senderName}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {msg.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>

                          {msg.type === 'text' && <p className="text-sm">{msg.content}</p>}

                          {msg.type === 'document' && (
                            <div className="flex items-center gap-2 p-2 bg-white rounded border">
                              <FileText className="h-5 w-5 text-red-500" />
                              <span className="text-sm">{msg.content}</span>
                            </div>
                          )}

                          {msg.type === 'image' && (
                            <div className="flex items-center gap-2 p-2 bg-white rounded border">
                              <Image className="h-5 w-5 text-blue-500" />
                              <span className="text-sm">Imagem</span>
                            </div>
                          )}

                          {/* Message Status */}
                          {msg.sender !== 'customer' && (
                            <div className="flex justify-end mt-1">
                              {msg.status === 'sent' && <Check className="h-3 w-3 text-gray-400" />}
                              {msg.status === 'delivered' && <CheckCheck className="h-3 w-3 text-gray-400" />}
                              {msg.status === 'read' && <CheckCheck className="h-3 w-3 text-blue-500" />}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>

              {/* Message Input */}
              <div className="p-4 border-t">
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm">
                    <Paperclip className="h-4 w-4" />
                  </Button>
                  <Input
                    placeholder="Digite sua mensagem..."
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1"
                  />
                  <Button variant="ghost" size="sm">
                    <Smile className="h-4 w-4" />
                  </Button>
                  <Button onClick={handleSendMessage} className="bg-green-500 hover:bg-green-600">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>

                {/* Quick Actions */}
                <div className="flex items-center gap-2 mt-2">
                  <Button variant="outline" size="sm" className="text-xs">
                    <Bot className="h-3 w-3 mr-1" />Sugerir Resposta IA
                  </Button>
                  <Button variant="outline" size="sm" className="text-xs">
                    <FileText className="h-3 w-3 mr-1" />Template
                  </Button>
                  {selectedConversation.status !== 'resolved' && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs text-green-600"
                      onClick={() => handleResolve(selectedConversation.id)}
                    >
                      <CheckCircle className="h-3 w-3 mr-1" />Resolver
                    </Button>
                  )}
                </div>
              </div>
            </>
          ) : (
            <CardContent className="flex-1 flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <MessageCircle className="h-16 w-16 mx-auto mb-4 opacity-30 text-green-500" />
                <p className="font-medium">Selecione uma conversa</p>
                <p className="text-sm">Escolha uma conversa da lista para visualizar</p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
}
