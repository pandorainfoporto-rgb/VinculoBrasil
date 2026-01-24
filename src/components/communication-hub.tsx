/**
 * Central de Comunicação - Unifica todos os canais de atendimento
 * WhatsApp, E-mail, Chat Web com IA integrada
 *
 * Features:
 * - Templates de mensagem com cadastro
 * - Respostas padrão com cadastro
 * - Motor de aprendizado IA (Knowledge Base)
 * - Tags automáticas por tipo de solicitação
 * - Múltiplos canais de comunicação
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
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
  DialogTrigger,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
  MessageCircle,
  Paperclip,
  FileText,
  Smile,
  Circle,
  CheckCheck,
  Check,
  Plus,
  Pencil,
  Trash2,
  Sparkles,
  Brain,
  Zap,
  BookOpen,
  Settings,
  Mail,
  Globe,
  Copy,
  ThumbsUp,
  ThumbsDown,
  Eye,
  EyeOff,
  Lightbulb,
  TrendingUp,
  Activity,
  Loader2,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  useTickets,
  useTicket,
  useSendMessage,
  useAssignAgent,
  useUpdateTicketStatus,
  type Ticket,
  type Message as APIMessage,
  type ChannelType,
  type TicketStatus,
  type Priority,
  channelLabels,
  statusLabels,
  priorityLabels,
} from '@/hooks/use-tickets';

// ============= TYPES =============

type CommunicationChannel = 'whatsapp' | 'email' | 'webchat';

interface Contact {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  avatar?: string;
  lastSeen?: Date;
  isOnline?: boolean;
}

interface Message {
  id: string;
  content: string;
  timestamp: Date;
  sender: 'customer' | 'agent' | 'bot';
  senderName?: string;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  type: 'text' | 'image' | 'document' | 'audio' | 'template';
  mediaUrl?: string;
  suggestedByAI?: boolean;
  templateId?: string;
}

interface Conversation {
  id: string;
  channel: CommunicationChannel;
  contact: Contact;
  status: 'waiting' | 'bot_handling' | 'agent_handling' | 'resolved' | 'pending_response';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  department: string;
  subject: string;
  assignedAgent?: string;
  messages: Message[];
  lastMessageAt: Date;
  unreadCount: number;
  isStarred: boolean;
  tags: ConversationTag[];
  waitingTime?: number;
  contractId?: string;
  requestType?: string;
  sentiment?: 'positive' | 'neutral' | 'negative';
}

interface ConversationTag {
  id: string;
  name: string;
  color: string;
  type: 'auto' | 'manual';
  category: 'request_type' | 'handler' | 'status' | 'priority' | 'custom';
}

interface MessageTemplate {
  id: string;
  name: string;
  content: string;
  category: string;
  variables: string[];
  usageCount: number;
  isActive: boolean;
  createdAt: Date;
}

interface StandardResponse {
  id: string;
  trigger: string;
  response: string;
  category: string;
  tags: string[];
  usageCount: number;
  successRate: number;
  isActive: boolean;
  createdAt: Date;
}

interface KnowledgeEntry {
  id: string;
  question: string;
  answer: string;
  category: string;
  confidence: number;
  usageCount: number;
  feedbackPositive: number;
  feedbackNegative: number;
  source: 'manual' | 'learned' | 'imported';
  relatedEntries: string[];
  createdAt: Date;
  updatedAt: Date;
}

// ============= TAG DEFINITIONS =============

const autoTagDefinitions: ConversationTag[] = [
  // Por tipo de solicitação
  { id: 'req_pagamento', name: 'Pagamento', color: 'bg-green-500', type: 'auto', category: 'request_type' },
  { id: 'req_boleto', name: 'Boleto', color: 'bg-emerald-500', type: 'auto', category: 'request_type' },
  { id: 'req_contrato', name: 'Contrato', color: 'bg-blue-500', type: 'auto', category: 'request_type' },
  { id: 'req_vistoria', name: 'Vistoria', color: 'bg-purple-500', type: 'auto', category: 'request_type' },
  { id: 'req_manutencao', name: 'Manutenção', color: 'bg-orange-500', type: 'auto', category: 'request_type' },
  { id: 'req_documentos', name: 'Documentos', color: 'bg-cyan-500', type: 'auto', category: 'request_type' },
  { id: 'req_reclamacao', name: 'Reclamação', color: 'bg-red-500', type: 'auto', category: 'request_type' },
  { id: 'req_duvida', name: 'Dúvida', color: 'bg-yellow-500', type: 'auto', category: 'request_type' },
  { id: 'req_lead', name: 'Lead', color: 'bg-pink-500', type: 'auto', category: 'request_type' },
  { id: 'req_garantidor', name: 'Garantidor', color: 'bg-indigo-500', type: 'auto', category: 'request_type' },
  // Por handler
  { id: 'handler_ia', name: 'IA', color: 'bg-violet-500', type: 'auto', category: 'handler' },
  { id: 'handler_humano', name: 'Humano', color: 'bg-blue-600', type: 'auto', category: 'handler' },
  // Por sentimento
  { id: 'sentiment_pos', name: 'Satisfeito', color: 'bg-green-600', type: 'auto', category: 'status' },
  { id: 'sentiment_neg', name: 'Insatisfeito', color: 'bg-red-600', type: 'auto', category: 'status' },
];

// ============= MOCK DATA =============

const mockTemplates: MessageTemplate[] = [
  {
    id: 't1',
    name: 'Boas-vindas',
    content: 'Olá {{nome}}! Bem-vindo(a) à ViniPay. Sou a Vini, sua assistente virtual. Como posso ajudar você hoje?',
    category: 'Geral',
    variables: ['nome'],
    usageCount: 1250,
    isActive: true,
    createdAt: new Date('2025-01-01'),
  },
  {
    id: 't2',
    name: 'Boleto Atualizado',
    content: 'Olá {{nome}}! Seu novo boleto já está disponível. Valor: R$ {{valor}} | Vencimento: {{vencimento}}. Código de barras: {{codigo}}',
    category: 'Financeiro',
    variables: ['nome', 'valor', 'vencimento', 'codigo'],
    usageCount: 890,
    isActive: true,
    createdAt: new Date('2025-01-01'),
  },
  {
    id: 't3',
    name: 'Vistoria Agendada',
    content: 'Olá {{nome}}! Sua vistoria foi agendada para {{data}} às {{horario}}. Endereço: {{endereco}}. O vistoriador {{vistoriador}} entrará em contato.',
    category: 'Operacional',
    variables: ['nome', 'data', 'horario', 'endereco', 'vistoriador'],
    usageCount: 456,
    isActive: true,
    createdAt: new Date('2025-01-01'),
  },
  {
    id: 't4',
    name: 'Contrato Pronto',
    content: 'Olá {{nome}}! Seu contrato está pronto para assinatura digital. Acesse o link: {{link}}. Prazo: {{prazo}} dias.',
    category: 'Contratos',
    variables: ['nome', 'link', 'prazo'],
    usageCount: 345,
    isActive: true,
    createdAt: new Date('2025-01-01'),
  },
  {
    id: 't5',
    name: 'Pagamento Confirmado',
    content: 'Olá {{nome}}! Confirmamos o recebimento do pagamento ref. {{referencia}} no valor de R$ {{valor}}. Obrigado!',
    category: 'Financeiro',
    variables: ['nome', 'referencia', 'valor'],
    usageCount: 678,
    isActive: true,
    createdAt: new Date('2025-01-01'),
  },
];

const mockResponses: StandardResponse[] = [
  {
    id: 'r1',
    trigger: 'segunda via boleto',
    response: 'Claro! Vou gerar uma segunda via do boleto para você. Por favor, confirme seu CPF para localizar o contrato.',
    category: 'Financeiro',
    tags: ['boleto', 'pagamento'],
    usageCount: 234,
    successRate: 94,
    isActive: true,
    createdAt: new Date('2025-01-01'),
  },
  {
    id: 'r2',
    trigger: 'boleto vencido',
    response: 'O boleto vencido pode ser pago com acréscimo de juros de 0,33% ao dia + multa de 2%. Deseja que eu gere um novo boleto atualizado?',
    category: 'Financeiro',
    tags: ['boleto', 'pagamento', 'atraso'],
    usageCount: 189,
    successRate: 91,
    isActive: true,
    createdAt: new Date('2025-01-01'),
  },
  {
    id: 'r3',
    trigger: 'agendar vistoria',
    response: 'Vou verificar a disponibilidade para vistoria. Qual período você prefere? Manhã (8h-12h) ou Tarde (13h-18h)?',
    category: 'Operacional',
    tags: ['vistoria', 'agendamento'],
    usageCount: 156,
    successRate: 88,
    isActive: true,
    createdAt: new Date('2025-01-01'),
  },
  {
    id: 'r4',
    trigger: 'reclamar vistoriador',
    response: 'Sinto muito pelo inconveniente! Vou registrar sua reclamação e um responsável entrará em contato em até 2 horas. Pode me dar mais detalhes do ocorrido?',
    category: 'Suporte',
    tags: ['reclamacao', 'vistoria'],
    usageCount: 45,
    successRate: 78,
    isActive: true,
    createdAt: new Date('2025-01-01'),
  },
  {
    id: 'r5',
    trigger: 'rendimentos garantidor',
    response: 'Os rendimentos de garantidores são pagos no dia 5 de cada mês, via split automático na blockchain. Você pode acompanhar em tempo real no seu dashboard.',
    category: 'Garantidores',
    tags: ['garantidor', 'pagamento', 'rendimentos'],
    usageCount: 98,
    successRate: 95,
    isActive: true,
    createdAt: new Date('2025-01-01'),
  },
];

const mockKnowledge: KnowledgeEntry[] = [
  {
    id: 'k1',
    question: 'Como funciona o split de pagamentos?',
    answer: 'O split automático distribui cada pagamento recebido: 85% para o proprietário, 5% para o garantidor, 5% para a plataforma ViniPay e 5% para a administradora. Tudo é registrado na blockchain em tempo real.',
    category: 'Financeiro',
    confidence: 98,
    usageCount: 567,
    feedbackPositive: 523,
    feedbackNegative: 12,
    source: 'manual',
    relatedEntries: ['k2', 'k5'],
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-05'),
  },
  {
    id: 'k2',
    question: 'Quando recebo meus rendimentos como garantidor?',
    answer: 'Os rendimentos de garantidores são processados automaticamente no dia 5 de cada mês. O valor é transferido via blockchain para a carteira cadastrada no seu perfil.',
    category: 'Garantidores',
    confidence: 95,
    usageCount: 234,
    feedbackPositive: 198,
    feedbackNegative: 8,
    source: 'manual',
    relatedEntries: ['k1'],
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-03'),
  },
  {
    id: 'k3',
    question: 'Como agendar uma vistoria?',
    answer: 'Para agendar uma vistoria: 1) Acesse seu contrato no sistema 2) Clique em "Solicitar Vistoria" 3) Escolha data e período preferidos 4) Confirme o endereço. O vistoriador entrará em contato 24h antes.',
    category: 'Operacional',
    confidence: 92,
    usageCount: 345,
    feedbackPositive: 312,
    feedbackNegative: 15,
    source: 'learned',
    relatedEntries: [],
    createdAt: new Date('2025-01-02'),
    updatedAt: new Date('2025-01-06'),
  },
  {
    id: 'k4',
    question: 'Posso pagar boleto vencido?',
    answer: 'Sim! Boletos vencidos podem ser pagos com acréscimo de juros de 0,33% ao dia + multa de 2%. Posso gerar um novo boleto atualizado com os valores corrigidos.',
    category: 'Financeiro',
    confidence: 97,
    usageCount: 456,
    feedbackPositive: 421,
    feedbackNegative: 9,
    source: 'learned',
    relatedEntries: [],
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-07'),
  },
  {
    id: 'k5',
    question: 'Como funciona a garantia blockchain?',
    answer: 'A garantia blockchain é um smart contract que assegura o pagamento do aluguel. Garantidores depositam BRZ como colateral, recebendo 5% de rendimento sobre cada pagamento processado pelo contrato que garantem.',
    category: 'Blockchain',
    confidence: 94,
    usageCount: 189,
    feedbackPositive: 167,
    feedbackNegative: 11,
    source: 'manual',
    relatedEntries: ['k1', 'k2'],
    createdAt: new Date('2025-01-01'),
    updatedAt: new Date('2025-01-04'),
  },
];

const mockConversations: Conversation[] = [
  {
    id: 'conv1',
    channel: 'whatsapp',
    contact: {
      id: 'c1',
      name: 'Carlos Silva',
      phone: '+55 11 98765-4321',
      isOnline: true,
    },
    status: 'waiting',
    priority: 'high',
    department: 'Financeiro',
    subject: 'Dúvida sobre boleto vencido',
    requestType: 'boleto',
    sentiment: 'neutral',
    messages: [
      { id: 'm1', content: 'Olá! Meu boleto venceu ontem, consigo pagar ainda?', timestamp: new Date(Date.now() - 300000), sender: 'customer', status: 'read', type: 'text' },
      { id: 'm2', content: 'Olá Carlos! Sim, você pode pagar o boleto com acréscimo de juros de 0,33% ao dia. Deseja que eu gere um novo boleto atualizado?', timestamp: new Date(Date.now() - 240000), sender: 'bot', senderName: 'Vini IA', status: 'delivered', type: 'text', suggestedByAI: true },
      { id: 'm3', content: 'Sim, por favor! Pode me enviar o novo boleto?', timestamp: new Date(Date.now() - 60000), sender: 'customer', status: 'read', type: 'text' },
    ],
    lastMessageAt: new Date(Date.now() - 60000),
    unreadCount: 1,
    isStarred: false,
    tags: [
      { id: 'req_boleto', name: 'Boleto', color: 'bg-emerald-500', type: 'auto', category: 'request_type' },
      { id: 'handler_ia', name: 'IA', color: 'bg-violet-500', type: 'auto', category: 'handler' },
    ],
    waitingTime: 5,
    contractId: 'CTR-001',
  },
  {
    id: 'conv2',
    channel: 'whatsapp',
    contact: {
      id: 'c2',
      name: 'Maria Santos',
      phone: '+55 11 91234-5678',
      lastSeen: new Date(Date.now() - 600000),
    },
    status: 'agent_handling',
    priority: 'urgent',
    department: 'Suporte',
    subject: 'Vistoriador não compareceu',
    requestType: 'reclamacao',
    sentiment: 'negative',
    assignedAgent: 'João Suporte',
    messages: [
      { id: 'm1', content: 'O vistoriador não apareceu no horário marcado!', timestamp: new Date(Date.now() - 3600000), sender: 'customer', status: 'read', type: 'text' },
      { id: 'm2', content: 'Sinto muito pelo inconveniente, Maria. Estou verificando com nossa equipe de vistorias.', timestamp: new Date(Date.now() - 3000000), sender: 'agent', senderName: 'João Suporte', status: 'read', type: 'text' },
      { id: 'm3', content: 'Conseguimos reagendar sua vistoria para amanhã às 14h. Confirma?', timestamp: new Date(Date.now() - 1800000), sender: 'agent', senderName: 'João Suporte', status: 'delivered', type: 'text' },
    ],
    lastMessageAt: new Date(Date.now() - 1800000),
    unreadCount: 0,
    isStarred: true,
    tags: [
      { id: 'req_reclamacao', name: 'Reclamação', color: 'bg-red-500', type: 'auto', category: 'request_type' },
      { id: 'req_vistoria', name: 'Vistoria', color: 'bg-purple-500', type: 'auto', category: 'request_type' },
      { id: 'handler_humano', name: 'Humano', color: 'bg-blue-600', type: 'auto', category: 'handler' },
      { id: 'sentiment_neg', name: 'Insatisfeito', color: 'bg-red-600', type: 'auto', category: 'status' },
    ],
    contractId: 'CTR-003',
  },
  {
    id: 'conv3',
    channel: 'email',
    contact: {
      id: 'c3',
      name: 'Pedro Costa',
      email: 'pedro.costa@email.com',
    },
    status: 'bot_handling',
    priority: 'normal',
    department: 'Comercial',
    subject: 'Interesse em alugar imóvel',
    requestType: 'lead',
    sentiment: 'positive',
    messages: [
      { id: 'm1', content: 'Boa tarde! Procuro um apartamento 2 quartos em Pinheiros', timestamp: new Date(Date.now() - 900000), sender: 'customer', status: 'read', type: 'text' },
      { id: 'm2', content: 'Olá Pedro! Temos 12 opções de apartamentos 2 quartos em Pinheiros. Qual sua faixa de preço ideal?', timestamp: new Date(Date.now() - 840000), sender: 'bot', senderName: 'Vini IA', status: 'read', type: 'text', suggestedByAI: true },
      { id: 'm3', content: 'Entre R$ 2.500 e R$ 4.000', timestamp: new Date(Date.now() - 600000), sender: 'customer', status: 'read', type: 'text' },
    ],
    lastMessageAt: new Date(Date.now() - 540000),
    unreadCount: 0,
    isStarred: false,
    tags: [
      { id: 'req_lead', name: 'Lead', color: 'bg-pink-500', type: 'auto', category: 'request_type' },
      { id: 'handler_ia', name: 'IA', color: 'bg-violet-500', type: 'auto', category: 'handler' },
      { id: 'sentiment_pos', name: 'Satisfeito', color: 'bg-green-600', type: 'auto', category: 'status' },
    ],
  },
  {
    id: 'conv4',
    channel: 'webchat',
    contact: {
      id: 'c4',
      name: 'Ana Ferreira',
      email: 'ana.ferreira@empresa.com',
    },
    status: 'resolved',
    priority: 'low',
    department: 'Financeiro',
    subject: 'Comprovante de pagamento',
    requestType: 'documentos',
    sentiment: 'positive',
    messages: [
      { id: 'm1', content: 'Preciso do comprovante de pagamento do mês passado', timestamp: new Date(Date.now() - 86400000), sender: 'customer', status: 'read', type: 'text' },
      { id: 'm2', content: 'Claro! Segue o comprovante em anexo:', timestamp: new Date(Date.now() - 85800000), sender: 'bot', senderName: 'Vini IA', status: 'read', type: 'text', suggestedByAI: true },
      { id: 'm3', content: 'comprovante_dez_2025.pdf', timestamp: new Date(Date.now() - 85700000), sender: 'bot', senderName: 'Vini IA', status: 'read', type: 'document', mediaUrl: '/docs/comprovante.pdf' },
      { id: 'm4', content: 'Obrigada!', timestamp: new Date(Date.now() - 85000000), sender: 'customer', status: 'read', type: 'text' },
    ],
    lastMessageAt: new Date(Date.now() - 85000000),
    unreadCount: 0,
    isStarred: false,
    tags: [
      { id: 'req_documentos', name: 'Documentos', color: 'bg-cyan-500', type: 'auto', category: 'request_type' },
      { id: 'handler_ia', name: 'IA', color: 'bg-violet-500', type: 'auto', category: 'handler' },
    ],
    contractId: 'CTR-002',
  },
  {
    id: 'conv5',
    channel: 'whatsapp',
    contact: {
      id: 'c5',
      name: 'Roberto Santos (Garantidor)',
      phone: '+55 11 95555-4444',
      isOnline: false,
    },
    status: 'pending_response',
    priority: 'normal',
    department: 'Garantidores',
    subject: 'Dúvida sobre rendimentos',
    requestType: 'garantidor',
    sentiment: 'negative',
    messages: [
      { id: 'm1', content: 'Bom dia! Gostaria de saber quando recebo meus 5% deste mês?', timestamp: new Date(Date.now() - 7200000), sender: 'customer', status: 'read', type: 'text' },
      { id: 'm2', content: 'Bom dia Roberto! Os pagamentos de garantidores são processados no dia 5 de cada mês, junto com o split automático. Você já deve receber amanhã!', timestamp: new Date(Date.now() - 7100000), sender: 'bot', senderName: 'Vini IA', status: 'read', type: 'text', suggestedByAI: true },
      { id: 'm3', content: 'Mas já é dia 7 e não recebi ainda...', timestamp: new Date(Date.now() - 3600000), sender: 'customer', status: 'read', type: 'text' },
    ],
    lastMessageAt: new Date(Date.now() - 3600000),
    unreadCount: 1,
    isStarred: false,
    tags: [
      { id: 'req_garantidor', name: 'Garantidor', color: 'bg-indigo-500', type: 'auto', category: 'request_type' },
      { id: 'req_pagamento', name: 'Pagamento', color: 'bg-green-500', type: 'auto', category: 'request_type' },
      { id: 'handler_ia', name: 'IA', color: 'bg-violet-500', type: 'auto', category: 'handler' },
    ],
  },
];

// ============= CHANNEL CONFIG =============

const channelConfig: Record<CommunicationChannel, { label: string; icon: LucideIcon; color: string; bgColor: string }> = {
  whatsapp: { label: 'WhatsApp', icon: MessageCircle, color: 'text-green-600', bgColor: 'bg-green-100' },
  email: { label: 'E-mail', icon: Mail, color: 'text-blue-600', bgColor: 'bg-blue-100' },
  webchat: { label: 'Chat Web', icon: Globe, color: 'text-purple-600', bgColor: 'bg-purple-100' },
};

// ============= COMPONENT =============

export function CommunicationHub() {
  // State - Main
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [channelFilter, setChannelFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<string>('conversations');
  const [starredTickets, setStarredTickets] = useState<Set<string>>(new Set());

  // API Hooks
  const { data: ticketsData, isLoading: loadingTickets, refetch: refetchTickets } = useTickets({
    status: statusFilter !== 'all' ? (statusFilter as TicketStatus) : undefined,
    channel: channelFilter !== 'all' ? (channelFilter as ChannelType) : undefined,
    limit: 50,
  });

  const { data: selectedTicket, isLoading: loadingTicket } = useTicket(selectedTicketId);
  const sendMessageMutation = useSendMessage();
  const assignAgentMutation = useAssignAgent();
  const updateStatusMutation = useUpdateTicketStatus();

  // State - Templates
  const [templates, setTemplates] = useState<MessageTemplate[]>(mockTemplates);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<MessageTemplate | null>(null);
  const [newTemplate, setNewTemplate] = useState({ name: '', content: '', category: 'Geral' });
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);

  // State - Standard Responses
  const [responses, setResponses] = useState<StandardResponse[]>(mockResponses);
  const [showResponseDialog, setShowResponseDialog] = useState(false);
  const [editingResponse, setEditingResponse] = useState<StandardResponse | null>(null);
  const [newResponse, setNewResponse] = useState({ trigger: '', response: '', category: 'Geral', tags: '' });
  const [showResponseSelector, setShowResponseSelector] = useState(false);
  const [suggestedResponse, setSuggestedResponse] = useState<StandardResponse | null>(null);

  // State - Knowledge Base
  const [knowledge, setKnowledge] = useState<KnowledgeEntry[]>(mockKnowledge);
  const [showKnowledgeDialog, setShowKnowledgeDialog] = useState(false);
  const [editingKnowledge, setEditingKnowledge] = useState<KnowledgeEntry | null>(null);
  const [newKnowledge, setNewKnowledge] = useState({ question: '', answer: '', category: 'Geral' });

  // Map tickets to conversations for compatibility
  const tickets = ticketsData?.tickets || [];

  // ============= HANDLERS =============

  const handleSendMessage = async (content?: string) => {
    const msgContent = content || messageInput;
    if (!msgContent.trim() || !selectedTicketId) return;

    try {
      await sendMessageMutation.mutateAsync({
        ticketId: selectedTicketId,
        data: {
          content: msgContent,
          contentType: 'TEXT',
        },
      });
      setMessageInput('');
      setSuggestedResponse(null);
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    }
  };

  const handleAssignToMe = async (ticketId: string) => {
    try {
      // TODO: Get current user ID from auth context
      await assignAgentMutation.mutateAsync({
        ticketId,
        agentId: 'current-user-id', // Replace with actual user ID
      });
    } catch (error) {
      console.error('Erro ao atribuir ticket:', error);
    }
  };

  const handleTransferToBot = async (ticketId: string) => {
    try {
      await updateStatusMutation.mutateAsync({
        ticketId,
        status: 'WAITING',
      });
    } catch (error) {
      console.error('Erro ao transferir para IA:', error);
    }
  };

  const handleResolve = async (ticketId: string) => {
    try {
      await updateStatusMutation.mutateAsync({
        ticketId,
        status: 'RESOLVED',
      });
    } catch (error) {
      console.error('Erro ao resolver ticket:', error);
    }
  };

  const handleToggleStar = (ticketId: string) => {
    setStarredTickets(prev => {
      const newSet = new Set(prev);
      if (newSet.has(ticketId)) {
        newSet.delete(ticketId);
      } else {
        newSet.add(ticketId);
      }
      return newSet;
    });
  };

  // Find matching response based on message content
  const findMatchingResponse = (content: string): StandardResponse | null => {
    const lowercaseContent = content.toLowerCase();
    return responses.find(r =>
      r.isActive && lowercaseContent.includes(r.trigger.toLowerCase())
    ) || null;
  };

  // Suggest AI response based on last customer message
  const suggestAIResponse = () => {
    if (!selectedTicket) return;

    const lastCustomerMessage = [...selectedTicket.messages]
      .reverse()
      .find(m => m.senderType === 'CUSTOMER');

    if (lastCustomerMessage) {
      const matchedResponse = findMatchingResponse(lastCustomerMessage.content);
      if (matchedResponse) {
        setSuggestedResponse(matchedResponse);
      } else {
        // Search in knowledge base
        const matchedKnowledge = knowledge.find(k =>
          lastCustomerMessage.content.toLowerCase().includes(k.question.toLowerCase().split(' ')[0])
        );
        if (matchedKnowledge) {
          setSuggestedResponse({
            id: 'kb-' + matchedKnowledge.id,
            trigger: matchedKnowledge.question,
            response: matchedKnowledge.answer,
            category: matchedKnowledge.category,
            tags: [],
            usageCount: matchedKnowledge.usageCount,
            successRate: Math.round((matchedKnowledge.feedbackPositive / (matchedKnowledge.feedbackPositive + matchedKnowledge.feedbackNegative)) * 100) || 0,
            isActive: true,
            createdAt: matchedKnowledge.createdAt,
          });
        }
      }
    }
  };

  // Learn from interaction (now using API ticket structure)
  const learnFromInteraction = (response: string, ticket: Ticket) => {
    const lastCustomerMessage = [...ticket.messages]
      .reverse()
      .find(m => m.senderType === 'CUSTOMER');

    if (lastCustomerMessage && response.length > 20) {
      // Check if similar knowledge already exists
      const existingKnowledge = knowledge.find(k =>
        k.question.toLowerCase().includes(lastCustomerMessage.content.toLowerCase().split(' ').slice(0, 3).join(' '))
      );

      if (!existingKnowledge) {
        // Create new learned knowledge entry
        const newEntry: KnowledgeEntry = {
          id: `k${Date.now()}`,
          question: lastCustomerMessage.content,
          answer: response,
          category: 'Geral',
          confidence: 60, // Starts low, increases with positive feedback
          usageCount: 1,
          feedbackPositive: 0,
          feedbackNegative: 0,
          source: 'learned',
          relatedEntries: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        setKnowledge(prev => [...prev, newEntry]);
      }
    }
  };

  // Use template
  const applyTemplate = (template: MessageTemplate) => {
    let content = template.content;
    // Replace variables with placeholder for demo
    template.variables.forEach(v => {
      content = content.replace(`{{${v}}}`, `[${v}]`);
    });
    setMessageInput(content);
    setShowTemplateSelector(false);

    // Update usage count
    setTemplates(prev => prev.map(t =>
      t.id === template.id ? { ...t, usageCount: t.usageCount + 1 } : t
    ));
  };

  // Use standard response
  const applyResponse = (response: StandardResponse) => {
    setMessageInput(response.response);
    setShowResponseSelector(false);

    // Update usage count
    setResponses(prev => prev.map(r =>
      r.id === response.id ? { ...r, usageCount: r.usageCount + 1 } : r
    ));
  };

  // Template CRUD
  const saveTemplate = () => {
    if (editingTemplate) {
      setTemplates(prev => prev.map(t =>
        t.id === editingTemplate.id
          ? { ...t, ...newTemplate, variables: extractVariables(newTemplate.content) }
          : t
      ));
    } else {
      const template: MessageTemplate = {
        id: `t${Date.now()}`,
        name: newTemplate.name,
        content: newTemplate.content,
        category: newTemplate.category,
        variables: extractVariables(newTemplate.content),
        usageCount: 0,
        isActive: true,
        createdAt: new Date(),
      };
      setTemplates(prev => [...prev, template]);
    }
    setShowTemplateDialog(false);
    setEditingTemplate(null);
    setNewTemplate({ name: '', content: '', category: 'Geral' });
  };

  const deleteTemplate = (id: string) => {
    setTemplates(prev => prev.filter(t => t.id !== id));
  };

  // Response CRUD
  const saveResponse = () => {
    if (editingResponse) {
      setResponses(prev => prev.map(r =>
        r.id === editingResponse.id
          ? { ...r, ...newResponse, tags: newResponse.tags.split(',').map(t => t.trim()) }
          : r
      ));
    } else {
      const response: StandardResponse = {
        id: `r${Date.now()}`,
        trigger: newResponse.trigger,
        response: newResponse.response,
        category: newResponse.category,
        tags: newResponse.tags.split(',').map(t => t.trim()),
        usageCount: 0,
        successRate: 0,
        isActive: true,
        createdAt: new Date(),
      };
      setResponses(prev => [...prev, response]);
    }
    setShowResponseDialog(false);
    setEditingResponse(null);
    setNewResponse({ trigger: '', response: '', category: 'Geral', tags: '' });
  };

  const deleteResponse = (id: string) => {
    setResponses(prev => prev.filter(r => r.id !== id));
  };

  // Knowledge CRUD
  const saveKnowledge = () => {
    if (editingKnowledge) {
      setKnowledge(prev => prev.map(k =>
        k.id === editingKnowledge.id
          ? { ...k, ...newKnowledge, updatedAt: new Date() }
          : k
      ));
    } else {
      const entry: KnowledgeEntry = {
        id: `k${Date.now()}`,
        question: newKnowledge.question,
        answer: newKnowledge.answer,
        category: newKnowledge.category,
        confidence: 80,
        usageCount: 0,
        feedbackPositive: 0,
        feedbackNegative: 0,
        source: 'manual',
        relatedEntries: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setKnowledge(prev => [...prev, entry]);
    }
    setShowKnowledgeDialog(false);
    setEditingKnowledge(null);
    setNewKnowledge({ question: '', answer: '', category: 'Geral' });
  };

  const deleteKnowledge = (id: string) => {
    setKnowledge(prev => prev.filter(k => k.id !== id));
  };

  const giveKnowledgeFeedback = (id: string, positive: boolean) => {
    setKnowledge(prev => prev.map(k =>
      k.id === id
        ? {
            ...k,
            feedbackPositive: positive ? k.feedbackPositive + 1 : k.feedbackPositive,
            feedbackNegative: positive ? k.feedbackNegative : k.feedbackNegative + 1,
            confidence: positive ? Math.min(100, k.confidence + 2) : Math.max(0, k.confidence - 5),
            updatedAt: new Date(),
          }
        : k
    ));
  };

  // ============= HELPERS =============

  const extractVariables = (content: string): string[] => {
    const matches = content.match(/\{\{(\w+)\}\}/g);
    return matches ? matches.map(m => m.replace(/\{\{|\}\}/g, '')) : [];
  };

  // Filter tickets based on search query (channel/status already filtered by API)
  const filteredTickets = tickets.filter((ticket: Ticket) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return ticket.contactName.toLowerCase().includes(query) ||
           (ticket.contactPhone?.includes(query)) ||
           (ticket.contactEmail?.toLowerCase().includes(query)) ||
           (ticket.subject?.toLowerCase().includes(query));
  });

  // Map API channel to UI channel
  const mapChannelToUI = (channel: ChannelType): CommunicationChannel => {
    switch (channel) {
      case 'WHATSAPP': return 'whatsapp';
      case 'EMAIL': return 'email';
      case 'CHAT': return 'webchat';
      default: return 'webchat';
    }
  };

  const getStatusColor = (status: TicketStatus) => {
    switch (status) {
      case 'OPEN': return 'bg-amber-500';
      case 'WAITING': return 'bg-violet-500';
      case 'IN_PROGRESS': return 'bg-blue-500';
      case 'RESOLVED': return 'bg-green-500';
      case 'CLOSED': return 'bg-gray-500';
      default: return 'bg-gray-400';
    }
  };

  const getStatusLabel = (status: TicketStatus) => {
    return statusLabels[status] || status;
  };

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case 'URGENT': return 'text-red-500 bg-red-100';
      case 'HIGH': return 'text-amber-500 bg-amber-100';
      case 'MEDIUM': return 'text-blue-500 bg-blue-100';
      case 'LOW': return 'text-gray-500 bg-gray-100';
    }
  };

  const formatTime = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diff = now.getTime() - dateObj.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Agora';
    if (minutes < 60) return `${minutes}min`;
    if (hours < 24) return `${hours}h`;
    return `${days}d`;
  };

  // Stats based on API data
  const stats = {
    waiting: tickets.filter((t: Ticket) => t.status === 'OPEN' || t.status === 'WAITING').length,
    botHandling: tickets.filter((t: Ticket) => t.status === 'WAITING').length,
    agentHandling: tickets.filter((t: Ticket) => t.status === 'IN_PROGRESS').length,
    pending: tickets.filter((t: Ticket) => t.status === 'OPEN').length,
    totalUnread: tickets.length, // API doesn't have unread count, use total
    whatsapp: tickets.filter((t: Ticket) => t.channel === 'WHATSAPP').length,
    email: tickets.filter((t: Ticket) => t.channel === 'EMAIL').length,
    webchat: tickets.filter((t: Ticket) => t.channel === 'CHAT').length,
  };

  const knowledgeStats = {
    total: knowledge.length,
    learned: knowledge.filter(k => k.source === 'learned').length,
    manual: knowledge.filter(k => k.source === 'manual').length,
    avgConfidence: Math.round(knowledge.reduce((sum, k) => sum + k.confidence, 0) / knowledge.length) || 0,
  };

  // ============= RENDER =============

  return (
    <div className="h-[calc(100vh-200px)] flex flex-col">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="conversations" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Conversas
              {stats.totalUnread > 0 && (
                <Badge className="bg-red-500 text-white">{stats.totalUnread}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="responses" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Respostas Padrão
            </TabsTrigger>
            <TabsTrigger value="knowledge" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              Base de Conhecimento
            </TabsTrigger>
          </TabsList>

          {/* Channel Quick Stats */}
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <MessageCircle className="h-3 w-3 text-green-500" />
              {stats.whatsapp}
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <Mail className="h-3 w-3 text-blue-500" />
              {stats.email}
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <Globe className="h-3 w-3 text-purple-500" />
              {stats.webchat}
            </Badge>
          </div>
        </div>

        {/* CONVERSATIONS TAB */}
        <TabsContent value="conversations" className="flex-1 flex flex-col m-0">
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
                  <p className="text-xs text-emerald-600">Não Lidas</p>
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
                    <Activity className="h-5 w-5 text-primary" />
                    Central de Comunicação
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
                  <Select value={channelFilter} onValueChange={setChannelFilter}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Canal" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos Canais</SelectItem>
                      <SelectItem value="whatsapp">WhatsApp</SelectItem>
                      <SelectItem value="email">E-mail</SelectItem>
                      <SelectItem value="webchat">Chat Web</SelectItem>
                    </SelectContent>
                  </Select>
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
                </div>
              </CardHeader>

              <CardContent className="flex-1 overflow-hidden p-0">
                <ScrollArea className="h-full">
                  {loadingTickets ? (
                    <div className="p-8 text-center">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
                      <p className="text-sm text-muted-foreground mt-2">Carregando conversas...</p>
                    </div>
                  ) : filteredTickets.length === 0 ? (
                    <div className="p-8 text-center">
                      <MessageSquare className="h-8 w-8 mx-auto text-muted-foreground/50" />
                      <p className="text-sm text-muted-foreground mt-2">Nenhuma conversa encontrada</p>
                    </div>
                  ) : (
                    filteredTickets.map((ticket: Ticket) => {
                      const uiChannel = mapChannelToUI(ticket.channel);
                      const ChannelIcon = channelConfig[uiChannel].icon;
                      const lastMessage = ticket.messages?.[ticket.messages.length - 1];
                      return (
                        <div
                          key={ticket.id}
                          onClick={() => setSelectedTicketId(ticket.id)}
                          className={cn(
                            "p-3 border-b cursor-pointer hover:bg-slate-50 transition-colors",
                            selectedTicketId === ticket.id && "bg-primary/5 border-l-2 border-l-primary"
                          )}
                        >
                          <div className="flex items-start gap-3">
                            <div className="relative">
                              <Avatar className="h-10 w-10">
                                <AvatarFallback className={cn(channelConfig[uiChannel].bgColor, channelConfig[uiChannel].color)}>
                                  {ticket.contactName.charAt(0)}
                                </AvatarFallback>
                              </Avatar>
                              <div className={cn("absolute -top-1 -right-1 p-0.5 rounded-full", channelConfig[uiChannel].bgColor)}>
                                <ChannelIcon className={cn("h-3 w-3", channelConfig[uiChannel].color)} />
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-1">
                                  {starredTickets.has(ticket.id) && <Star className="h-3 w-3 fill-amber-400 text-amber-400" />}
                                  <span className="font-medium text-sm truncate">{ticket.contactName}</span>
                                </div>
                                <span className="text-xs text-muted-foreground whitespace-nowrap">
                                  {formatTime(ticket.updatedAt)}
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground truncate">{ticket.subject || 'Sem assunto'}</p>
                              <p className="text-xs text-muted-foreground truncate mt-1">
                                {lastMessage?.content?.slice(0, 50) || 'Sem mensagens'}...
                              </p>
                              <div className="flex items-center gap-1 mt-2 flex-wrap">
                                <Badge className={cn("text-xs py-0 px-1", getStatusColor(ticket.status))}>
                                  {getStatusLabel(ticket.status)}
                                </Badge>
                                {ticket.tags?.slice(0, 2).map((tag: string) => (
                                  <Badge key={tag} variant="outline" className="text-xs py-0 px-1">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
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
                        <div className="relative">
                          <Avatar className="h-10 w-10">
                            <AvatarFallback className={cn(channelConfig[mapChannelToUI(selectedTicket.channel)].bgColor, channelConfig[mapChannelToUI(selectedTicket.channel)].color)}>
                              {selectedTicket.contactName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div className={cn("absolute -bottom-1 -right-1 p-0.5 rounded-full", channelConfig[mapChannelToUI(selectedTicket.channel)].bgColor)}>
                            {(() => {
                              const ChannelIcon = channelConfig[mapChannelToUI(selectedTicket.channel)].icon;
                              return <ChannelIcon className={cn("h-3 w-3", channelConfig[mapChannelToUI(selectedTicket.channel)].color)} />;
                            })()}
                          </div>
                        </div>
                        <div>
                          <CardTitle className="text-base flex items-center gap-2">
                            {selectedTicket.contactName}
                          </CardTitle>
                          <CardDescription className="flex items-center gap-2">
                            {selectedTicket.contactPhone || selectedTicket.contactEmail}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={cn("py-0", getPriorityColor(selectedTicket.priority))}>
                          {priorityLabels[selectedTicket.priority]}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleStar(selectedTicket.id)}
                        >
                          {starredTickets.has(selectedTicket.id) ? (
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
                            <DropdownMenuItem onClick={() => handleAssignToMe(selectedTicket.id)}>
                              <Headphones className="h-4 w-4 mr-2" />Assumir Atendimento
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleTransferToBot(selectedTicket.id)}>
                              <Bot className="h-4 w-4 mr-2" />Transferir para IA
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleResolve(selectedTicket.id)}>
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
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      {selectedTicket.tags?.map((tag: string) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {selectedTicket.agent && (
                        <Badge variant="outline" className="text-xs">
                          <User className="h-3 w-3 mr-1" />{selectedTicket.agent.name}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>

                  {/* Messages */}
                  <CardContent className="flex-1 overflow-hidden p-0">
                    <ScrollArea className="h-[300px] p-4">
                      <div className="space-y-4">
                        {loadingTicket ? (
                          <div className="text-center py-8">
                            <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                          </div>
                        ) : (
                          selectedTicket.messages?.map((msg: APIMessage) => (
                            <div
                              key={msg.id}
                              className={cn(
                                "flex",
                                msg.senderType === 'CUSTOMER' ? 'justify-start' : 'justify-end'
                              )}
                            >
                              <div
                                className={cn(
                                  "max-w-[80%] rounded-lg p-3",
                                  msg.senderType === 'CUSTOMER'
                                    ? 'bg-slate-100'
                                    : msg.senderType === 'BOT'
                                    ? 'bg-violet-100'
                                    : 'bg-green-100'
                                )}
                              >
                                  <div className="flex items-center gap-2 mb-1">
                                    {msg.senderType === 'BOT' && <Bot className="h-3 w-3 text-violet-600" />}
                                    {msg.senderType === 'AGENT' && <User className="h-3 w-3 text-green-600" />}
                                    <span className="text-xs font-medium">
                                      {msg.senderType === 'CUSTOMER' ? selectedTicket.contactName : (msg.senderName || msg.sender?.name || 'Agente')}
                                    </span>
                                    <span className="text-xs text-muted-foreground">
                                      {new Date(msg.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                  </div>

                                  <p className="text-sm">{msg.content}</p>

                                  {msg.contentType === 'DOCUMENT' && (
                                    <div className="flex items-center gap-2 p-2 bg-white rounded border mt-1">
                                      <FileText className="h-5 w-5 text-red-500" />
                                      <span className="text-sm">Documento anexado</span>
                                    </div>
                                  )}

                                  {/* Message Status */}
                                  {msg.senderType !== 'CUSTOMER' && (
                                    <div className="flex justify-end mt-1">
                                      {msg.status === 'SENT' && <Check className="h-3 w-3 text-gray-400" />}
                                      {msg.status === 'DELIVERED' && <CheckCheck className="h-3 w-3 text-gray-400" />}
                                      {msg.status === 'READ' && <CheckCheck className="h-3 w-3 text-blue-500" />}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))
                          )}
                      </div>
                    </ScrollArea>
                  </CardContent>

                  {/* AI Suggestion */}
                  {suggestedResponse && (
                    <div className="mx-4 p-3 bg-violet-50 border border-violet-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Bot className="h-4 w-4 text-violet-600" />
                          <span className="text-sm font-medium text-violet-700">Sugestão da IA</span>
                          <Badge variant="outline" className="text-xs">{suggestedResponse.successRate}% sucesso</Badge>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => setSuggestedResponse(null)}>
                          <EyeOff className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-sm text-violet-800 mb-2">{suggestedResponse.response}</p>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => handleSendMessage(suggestedResponse.response)}>
                          <Send className="h-3 w-3 mr-1" />Usar Resposta
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => setMessageInput(suggestedResponse.response)}>
                          <Pencil className="h-3 w-3 mr-1" />Editar
                        </Button>
                      </div>
                    </div>
                  )}

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
                      <Button onClick={() => handleSendMessage()} className="bg-primary hover:bg-primary/90">
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Quick Actions */}
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <Button variant="outline" size="sm" className="text-xs" onClick={suggestAIResponse}>
                        <Bot className="h-3 w-3 mr-1" />Sugerir Resposta IA
                      </Button>

                      {/* Template Selector */}
                      <DropdownMenu open={showTemplateSelector} onOpenChange={setShowTemplateSelector}>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="text-xs">
                            <FileText className="h-3 w-3 mr-1" />Templates
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-80">
                          <DropdownMenuLabel>Templates Disponíveis</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <ScrollArea className="h-[200px]">
                            {templates.filter(t => t.isActive).map(template => (
                              <DropdownMenuItem key={template.id} onClick={() => applyTemplate(template)}>
                                <div className="flex flex-col">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">{template.name}</span>
                                    <Badge variant="outline" className="text-xs">{template.category}</Badge>
                                  </div>
                                  <span className="text-xs text-muted-foreground truncate max-w-[260px]">
                                    {template.content.slice(0, 60)}...
                                  </span>
                                </div>
                              </DropdownMenuItem>
                            ))}
                          </ScrollArea>
                        </DropdownMenuContent>
                      </DropdownMenu>

                      {/* Response Selector */}
                      <DropdownMenu open={showResponseSelector} onOpenChange={setShowResponseSelector}>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline" size="sm" className="text-xs">
                            <Zap className="h-3 w-3 mr-1" />Respostas
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-80">
                          <DropdownMenuLabel>Respostas Padrão</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <ScrollArea className="h-[200px]">
                            {responses.filter(r => r.isActive).map(response => (
                              <DropdownMenuItem key={response.id} onClick={() => applyResponse(response)}>
                                <div className="flex flex-col">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium">{response.trigger}</span>
                                    <Badge variant="outline" className="text-xs">{response.successRate}%</Badge>
                                  </div>
                                  <span className="text-xs text-muted-foreground truncate max-w-[260px]">
                                    {response.response.slice(0, 60)}...
                                  </span>
                                </div>
                              </DropdownMenuItem>
                            ))}
                          </ScrollArea>
                        </DropdownMenuContent>
                      </DropdownMenu>

                      {selectedTicket && selectedTicket.status !== 'RESOLVED' && selectedTicket.status !== 'CLOSED' && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-xs text-green-600"
                          onClick={() => handleResolve(selectedTicket.id)}
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
                    <Activity className="h-16 w-16 mx-auto mb-4 opacity-30 text-primary" />
                    <p className="font-medium">Selecione uma conversa</p>
                    <p className="text-sm">Escolha uma conversa da lista para visualizar</p>
                  </div>
                </CardContent>
              )}
            </Card>
          </div>
        </TabsContent>

        {/* TEMPLATES TAB */}
        <TabsContent value="templates" className="flex-1 m-0">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Templates de Mensagem
                  </CardTitle>
                  <CardDescription>
                    Crie e gerencie templates para respostas rápidas
                  </CardDescription>
                </div>
                <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
                  <DialogTrigger asChild>
                    <Button onClick={() => {
                      setEditingTemplate(null);
                      setNewTemplate({ name: '', content: '', category: 'Geral' });
                    }}>
                      <Plus className="h-4 w-4 mr-2" />Novo Template
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{editingTemplate ? 'Editar Template' : 'Novo Template'}</DialogTitle>
                      <DialogDescription>
                        Use {"{{variavel}}"} para inserir campos dinâmicos
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Nome</Label>
                        <Input
                          value={newTemplate.name}
                          onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Ex: Boas-vindas"
                        />
                      </div>
                      <div>
                        <Label>Categoria</Label>
                        <Select
                          value={newTemplate.category}
                          onValueChange={(v) => setNewTemplate(prev => ({ ...prev, category: v }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Geral">Geral</SelectItem>
                            <SelectItem value="Financeiro">Financeiro</SelectItem>
                            <SelectItem value="Operacional">Operacional</SelectItem>
                            <SelectItem value="Contratos">Contratos</SelectItem>
                            <SelectItem value="Suporte">Suporte</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Conteúdo</Label>
                        <Textarea
                          value={newTemplate.content}
                          onChange={(e) => setNewTemplate(prev => ({ ...prev, content: e.target.value }))}
                          placeholder="Olá {{nome}}! Como posso ajudar?"
                          rows={4}
                        />
                        {newTemplate.content && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Variáveis detectadas: {extractVariables(newTemplate.content).join(', ') || 'Nenhuma'}
                          </p>
                        )}
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowTemplateDialog(false)}>Cancelar</Button>
                      <Button onClick={saveTemplate}>Salvar</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Variáveis</TableHead>
                    <TableHead>Uso</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {templates.map(template => (
                    <TableRow key={template.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{template.name}</p>
                          <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                            {template.content.slice(0, 50)}...
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{template.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {template.variables.map(v => (
                            <Badge key={v} variant="secondary" className="text-xs">{v}</Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>{template.usageCount}x</TableCell>
                      <TableCell>
                        <Switch checked={template.isActive} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingTemplate(template);
                              setNewTemplate({
                                name: template.name,
                                content: template.content,
                                category: template.category,
                              });
                              setShowTemplateDialog(true);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteTemplate(template.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* RESPONSES TAB */}
        <TabsContent value="responses" className="flex-1 m-0">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5" />
                    Respostas Padrão
                  </CardTitle>
                  <CardDescription>
                    Configure respostas automáticas baseadas em gatilhos de texto
                  </CardDescription>
                </div>
                <Dialog open={showResponseDialog} onOpenChange={setShowResponseDialog}>
                  <DialogTrigger asChild>
                    <Button onClick={() => {
                      setEditingResponse(null);
                      setNewResponse({ trigger: '', response: '', category: 'Geral', tags: '' });
                    }}>
                      <Plus className="h-4 w-4 mr-2" />Nova Resposta
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{editingResponse ? 'Editar Resposta' : 'Nova Resposta Padrão'}</DialogTitle>
                      <DialogDescription>
                        Define um gatilho e a resposta automática
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Gatilho (palavras-chave)</Label>
                        <Input
                          value={newResponse.trigger}
                          onChange={(e) => setNewResponse(prev => ({ ...prev, trigger: e.target.value }))}
                          placeholder="Ex: segunda via boleto"
                        />
                      </div>
                      <div>
                        <Label>Categoria</Label>
                        <Select
                          value={newResponse.category}
                          onValueChange={(v) => setNewResponse(prev => ({ ...prev, category: v }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Geral">Geral</SelectItem>
                            <SelectItem value="Financeiro">Financeiro</SelectItem>
                            <SelectItem value="Operacional">Operacional</SelectItem>
                            <SelectItem value="Suporte">Suporte</SelectItem>
                            <SelectItem value="Garantidores">Garantidores</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Resposta</Label>
                        <Textarea
                          value={newResponse.response}
                          onChange={(e) => setNewResponse(prev => ({ ...prev, response: e.target.value }))}
                          placeholder="A resposta que será sugerida..."
                          rows={4}
                        />
                      </div>
                      <div>
                        <Label>Tags (separadas por vírgula)</Label>
                        <Input
                          value={newResponse.tags}
                          onChange={(e) => setNewResponse(prev => ({ ...prev, tags: e.target.value }))}
                          placeholder="Ex: boleto, pagamento"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowResponseDialog(false)}>Cancelar</Button>
                      <Button onClick={saveResponse}>Salvar</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Gatilho</TableHead>
                    <TableHead>Resposta</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Taxa Sucesso</TableHead>
                    <TableHead>Uso</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {responses.map(response => (
                    <TableRow key={response.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Lightbulb className="h-4 w-4 text-amber-500" />
                          <span className="font-medium">{response.trigger}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="text-sm text-muted-foreground truncate max-w-[250px]">
                          {response.response.slice(0, 80)}...
                        </p>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{response.category}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={cn(
                                "h-full rounded-full",
                                response.successRate >= 80 ? "bg-green-500" :
                                response.successRate >= 50 ? "bg-amber-500" : "bg-red-500"
                              )}
                              style={{ width: `${response.successRate}%` }}
                            />
                          </div>
                          <span className="text-sm">{response.successRate}%</span>
                        </div>
                      </TableCell>
                      <TableCell>{response.usageCount}x</TableCell>
                      <TableCell>
                        <Switch checked={response.isActive} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingResponse(response);
                              setNewResponse({
                                trigger: response.trigger,
                                response: response.response,
                                category: response.category,
                                tags: response.tags.join(', '),
                              });
                              setShowResponseDialog(true);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => deleteResponse(response.id)}
                          >
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* KNOWLEDGE BASE TAB */}
        <TabsContent value="knowledge" className="flex-1 m-0">
          <div className="grid gap-4 md:grid-cols-4 mb-4">
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 bg-violet-100 rounded-lg">
                  <Brain className="h-5 w-5 text-violet-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Conhecimento</p>
                  <p className="text-2xl font-bold">{knowledgeStats.total}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <Sparkles className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Aprendido pela IA</p>
                  <p className="text-2xl font-bold">{knowledgeStats.learned}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BookOpen className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Cadastro Manual</p>
                  <p className="text-2xl font-bold">{knowledgeStats.manual}</p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 flex items-center gap-3">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Confiança Média</p>
                  <p className="text-2xl font-bold">{knowledgeStats.avgConfidence}%</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5" />
                    Base de Conhecimento IA
                  </CardTitle>
                  <CardDescription>
                    Motor de aprendizado: perguntas e respostas geram conhecimento para futuras interações
                  </CardDescription>
                </div>
                <Dialog open={showKnowledgeDialog} onOpenChange={setShowKnowledgeDialog}>
                  <DialogTrigger asChild>
                    <Button onClick={() => {
                      setEditingKnowledge(null);
                      setNewKnowledge({ question: '', answer: '', category: 'Geral' });
                    }}>
                      <Plus className="h-4 w-4 mr-2" />Adicionar Conhecimento
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{editingKnowledge ? 'Editar Conhecimento' : 'Novo Conhecimento'}</DialogTitle>
                      <DialogDescription>
                        Adicione pergunta e resposta para treinar a IA
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label>Pergunta / Intenção</Label>
                        <Input
                          value={newKnowledge.question}
                          onChange={(e) => setNewKnowledge(prev => ({ ...prev, question: e.target.value }))}
                          placeholder="Ex: Como funciona o split de pagamentos?"
                        />
                      </div>
                      <div>
                        <Label>Categoria</Label>
                        <Select
                          value={newKnowledge.category}
                          onValueChange={(v) => setNewKnowledge(prev => ({ ...prev, category: v }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Geral">Geral</SelectItem>
                            <SelectItem value="Financeiro">Financeiro</SelectItem>
                            <SelectItem value="Operacional">Operacional</SelectItem>
                            <SelectItem value="Blockchain">Blockchain</SelectItem>
                            <SelectItem value="Garantidores">Garantidores</SelectItem>
                            <SelectItem value="Contratos">Contratos</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>Resposta</Label>
                        <Textarea
                          value={newKnowledge.answer}
                          onChange={(e) => setNewKnowledge(prev => ({ ...prev, answer: e.target.value }))}
                          placeholder="A resposta detalhada..."
                          rows={4}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowKnowledgeDialog(false)}>Cancelar</Button>
                      <Button onClick={saveKnowledge}>Salvar</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-4">
                  {knowledge.map(entry => (
                    <Card key={entry.id} className="border-l-4 border-l-violet-500">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant={entry.source === 'learned' ? 'default' : 'outline'} className="text-xs">
                                {entry.source === 'learned' ? (
                                  <><Sparkles className="h-3 w-3 mr-1" />Aprendido</>
                                ) : (
                                  <><BookOpen className="h-3 w-3 mr-1" />Manual</>
                                )}
                              </Badge>
                              <Badge variant="outline" className="text-xs">{entry.category}</Badge>
                              <div className="flex items-center gap-1 ml-auto">
                                <div className="w-12 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                  <div
                                    className={cn(
                                      "h-full rounded-full",
                                      entry.confidence >= 80 ? "bg-green-500" :
                                      entry.confidence >= 50 ? "bg-amber-500" : "bg-red-500"
                                    )}
                                    style={{ width: `${entry.confidence}%` }}
                                  />
                                </div>
                                <span className="text-xs text-muted-foreground">{entry.confidence}%</span>
                              </div>
                            </div>
                            <p className="font-medium text-sm mb-1">{entry.question}</p>
                            <p className="text-sm text-muted-foreground">{entry.answer}</p>
                            <div className="flex items-center gap-4 mt-3">
                              <span className="text-xs text-muted-foreground">
                                Usado {entry.usageCount}x
                              </span>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 px-2"
                                  onClick={() => giveKnowledgeFeedback(entry.id, true)}
                                >
                                  <ThumbsUp className="h-3 w-3 mr-1 text-green-600" />
                                  <span className="text-xs">{entry.feedbackPositive}</span>
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 px-2"
                                  onClick={() => giveKnowledgeFeedback(entry.id, false)}
                                >
                                  <ThumbsDown className="h-3 w-3 mr-1 text-red-600" />
                                  <span className="text-xs">{entry.feedbackNegative}</span>
                                </Button>
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-1 ml-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingKnowledge(entry);
                                setNewKnowledge({
                                  question: entry.question,
                                  answer: entry.answer,
                                  category: entry.category,
                                });
                                setShowKnowledgeDialog(true);
                              }}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteKnowledge(entry.id)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
