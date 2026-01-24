/**
 * Department Admin - Administração de Departamentos e Filas
 *
 * Features:
 * - CRUD de departamentos
 * - Gestão de filas de atendimento
 * - Alocação de colaboradores
 * - Configuração de horários
 * - SLAs por departamento
 */

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Building2,
  Users,
  Plus,
  MoreVertical,
  Pencil,
  Trash2,
  Settings,
  Clock,
  UserPlus,
  UserMinus,
  CheckCircle,
  XCircle,
  ArrowUpDown,
  Search,
  Filter,
  Layers,
  MessageSquare,
  Bot,
  Headphones,
  TrendingUp,
  Timer,
  AlertTriangle,
  Copy,
  Eye,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Department, Queue, Agent, WorkingHours } from '@/types/omnichannel';

// Mock data
const mockDepartments: Department[] = [
  {
    id: 'dept-1',
    name: 'Financeiro',
    description: 'Atendimento de questões financeiras, boletos e pagamentos',
    icon: 'CreditCard',
    color: 'bg-emerald-500',
    isActive: true,
    autoAssign: true,
    maxTicketsPerAgent: 5,
    whatsappWelcomeMessage: 'Olá! Você está no setor Financeiro. Como posso ajudar?',
    agents: [],
    queues: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'dept-2',
    name: 'Suporte Técnico',
    description: 'Problemas técnicos com a plataforma',
    icon: 'Headphones',
    color: 'bg-blue-500',
    isActive: true,
    autoAssign: true,
    maxTicketsPerAgent: 4,
    whatsappWelcomeMessage: 'Olá! Você está no Suporte Técnico. Descreva seu problema.',
    agents: [],
    queues: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'dept-3',
    name: 'Comercial',
    description: 'Vendas, parcerias e novas imobiliárias',
    icon: 'Building2',
    color: 'bg-purple-500',
    isActive: true,
    autoAssign: false,
    maxTicketsPerAgent: 8,
    whatsappWelcomeMessage: 'Olá! Bem-vindo ao setor Comercial da Vínculo Brasil!',
    agents: [],
    queues: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'dept-4',
    name: 'Garantidores',
    description: 'Atendimento para investidores e garantidores',
    icon: 'Users',
    color: 'bg-amber-500',
    isActive: true,
    autoAssign: true,
    maxTicketsPerAgent: 6,
    whatsappWelcomeMessage: 'Olá! Você está no setor de Garantidores. Como posso ajudar?',
    agents: [],
    queues: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const mockQueues: Queue[] = [
  {
    id: 'queue-1',
    name: 'Fila Principal',
    description: 'Atendimento geral do departamento',
    departmentId: 'dept-1',
    priority: 1,
    isActive: true,
    maxWaitTime: 30,
    agents: [],
    ticketCount: 5,
    avgWaitTime: 8,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'queue-2',
    name: 'Fila VIP',
    description: 'Clientes prioritários',
    departmentId: 'dept-1',
    priority: 0,
    isActive: true,
    maxWaitTime: 10,
    agents: [],
    ticketCount: 2,
    avgWaitTime: 3,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'queue-3',
    name: 'Fila Principal',
    departmentId: 'dept-2',
    priority: 1,
    isActive: true,
    agents: [],
    ticketCount: 8,
    avgWaitTime: 12,
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
    departmentIds: ['dept-1', 'dept-2'],
    queueIds: ['queue-1', 'queue-3'],
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
    departmentIds: ['dept-1', 'dept-2', 'dept-3'],
    queueIds: ['queue-1', 'queue-2', 'queue-3'],
    maxConcurrentChats: 8,
    activeChats: 5,
    isOnline: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'agent-3',
    userId: 'user-3',
    name: 'Carlos Oliveira',
    email: 'carlos@vinculobrasil.com',
    status: 'away',
    role: 'agent',
    departmentIds: ['dept-3'],
    queueIds: [],
    maxConcurrentChats: 5,
    activeChats: 0,
    isOnline: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'agent-4',
    userId: 'user-4',
    name: 'Ana Costa',
    email: 'ana@vinculobrasil.com',
    status: 'busy',
    role: 'agent',
    departmentIds: ['dept-4'],
    queueIds: [],
    maxConcurrentChats: 6,
    activeChats: 6,
    isOnline: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const weekDays = [
  { value: 0, label: 'Domingo' },
  { value: 1, label: 'Segunda' },
  { value: 2, label: 'Terça' },
  { value: 3, label: 'Quarta' },
  { value: 4, label: 'Quinta' },
  { value: 5, label: 'Sexta' },
  { value: 6, label: 'Sábado' },
];

const defaultWorkingHours: WorkingHours = {
  timezone: 'America/Sao_Paulo',
  schedule: weekDays.map((day) => ({
    day: day.value,
    isOpen: day.value >= 1 && day.value <= 5,
    openTime: '08:00',
    closeTime: '18:00',
  })),
};

export function DepartmentAdmin() {
  const [departments, setDepartments] = useState<Department[]>(mockDepartments);
  const [queues, setQueues] = useState<Queue[]>(mockQueues);
  const [agents] = useState<Agent[]>(mockAgents);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [isCreateDeptOpen, setIsCreateDeptOpen] = useState(false);
  const [isCreateQueueOpen, setIsCreateQueueOpen] = useState(false);
  const [isAssignAgentOpen, setIsAssignAgentOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<{ type: 'department' | 'queue'; id: string } | null>(null);
  const [isEditDeptOpen, setIsEditDeptOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [isEditQueueOpen, setIsEditQueueOpen] = useState(false);
  const [editingQueue, setEditingQueue] = useState<Queue | null>(null);
  const [isConfigDeptOpen, setIsConfigDeptOpen] = useState(false);
  const [configDept, setConfigDept] = useState<Department | null>(null);
  const [isWorkingHoursOpen, setIsWorkingHoursOpen] = useState(false);
  const [workingHoursDept, setWorkingHoursDept] = useState<Department | null>(null);

  // Form states
  const [newDeptName, setNewDeptName] = useState('');
  const [newDeptDescription, setNewDeptDescription] = useState('');
  const [newDeptWelcomeMsg, setNewDeptWelcomeMsg] = useState('');
  const [newDeptAutoAssign, setNewDeptAutoAssign] = useState(true);
  const [newDeptMaxTickets, setNewDeptMaxTickets] = useState(5);

  const [newQueueName, setNewQueueName] = useState('');
  const [newQueueDescription, setNewQueueDescription] = useState('');
  const [newQueuePriority, setNewQueuePriority] = useState(1);
  const [newQueueMaxWait, setNewQueueMaxWait] = useState(30);

  // Stats
  const stats = {
    totalDepartments: departments.length,
    activeDepartments: departments.filter((d) => d.isActive).length,
    totalQueues: queues.length,
    totalAgents: agents.length,
    onlineAgents: agents.filter((a) => a.isOnline).length,
    ticketsInQueue: queues.reduce((sum, q) => sum + (q.ticketCount || 0), 0),
  };

  const filteredDepartments = departments.filter(
    (dept) =>
      dept.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dept.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getDepartmentQueues = (deptId: string) => queues.filter((q) => q.departmentId === deptId);

  const getDepartmentAgents = (deptId: string) =>
    agents.filter((a) => a.departmentIds.includes(deptId));

  const handleCreateDepartment = () => {
    const newDept: Department = {
      id: `dept-${Date.now()}`,
      name: newDeptName,
      description: newDeptDescription,
      isActive: true,
      autoAssign: newDeptAutoAssign,
      maxTicketsPerAgent: newDeptMaxTickets,
      whatsappWelcomeMessage: newDeptWelcomeMsg,
      agents: [],
      queues: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setDepartments([...departments, newDept]);
    setIsCreateDeptOpen(false);
    resetDeptForm();
  };

  const handleCreateQueue = () => {
    if (!selectedDepartment) return;

    const newQueue: Queue = {
      id: `queue-${Date.now()}`,
      name: newQueueName,
      description: newQueueDescription,
      departmentId: selectedDepartment.id,
      priority: newQueuePriority,
      isActive: true,
      maxWaitTime: newQueueMaxWait,
      agents: [],
      ticketCount: 0,
      avgWaitTime: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setQueues([...queues, newQueue]);
    setIsCreateQueueOpen(false);
    resetQueueForm();
  };

  const handleDeleteConfirm = () => {
    if (!itemToDelete) return;

    if (itemToDelete.type === 'department') {
      setDepartments(departments.filter((d) => d.id !== itemToDelete.id));
      setQueues(queues.filter((q) => q.departmentId !== itemToDelete.id));
    } else {
      setQueues(queues.filter((q) => q.id !== itemToDelete.id));
    }

    setIsDeleteConfirmOpen(false);
    setItemToDelete(null);
  };

  const handleToggleDepartmentActive = (deptId: string) => {
    setDepartments(
      departments.map((d) => (d.id === deptId ? { ...d, isActive: !d.isActive } : d))
    );
  };

  const handleToggleQueueActive = (queueId: string) => {
    setQueues(queues.map((q) => (q.id === queueId ? { ...q, isActive: !q.isActive } : q)));
  };

  const resetDeptForm = () => {
    setNewDeptName('');
    setNewDeptDescription('');
    setNewDeptWelcomeMsg('');
    setNewDeptAutoAssign(true);
    setNewDeptMaxTickets(5);
  };

  const resetQueueForm = () => {
    setNewQueueName('');
    setNewQueueDescription('');
    setNewQueuePriority(1);
    setNewQueueMaxWait(30);
  };

  const handleEditDepartment = (dept: Department) => {
    setEditingDept(dept);
    setNewDeptName(dept.name);
    setNewDeptDescription(dept.description || '');
    setNewDeptWelcomeMsg(dept.whatsappWelcomeMessage || '');
    setNewDeptAutoAssign(dept.autoAssign);
    setNewDeptMaxTickets(dept.maxTicketsPerAgent);
    setIsEditDeptOpen(true);
  };

  const handleSaveEditDepartment = () => {
    if (!editingDept) return;
    setDepartments(
      departments.map((d) =>
        d.id === editingDept.id
          ? {
              ...d,
              name: newDeptName,
              description: newDeptDescription,
              whatsappWelcomeMessage: newDeptWelcomeMsg,
              autoAssign: newDeptAutoAssign,
              maxTicketsPerAgent: newDeptMaxTickets,
              updatedAt: new Date(),
            }
          : d
      )
    );
    setIsEditDeptOpen(false);
    setEditingDept(null);
    resetDeptForm();
  };

  const handleEditQueue = (queue: Queue) => {
    setEditingQueue(queue);
    setNewQueueName(queue.name);
    setNewQueueDescription(queue.description || '');
    setNewQueuePriority(queue.priority);
    setNewQueueMaxWait(queue.maxWaitTime || 30);
    setIsEditQueueOpen(true);
  };

  const handleSaveEditQueue = () => {
    if (!editingQueue) return;
    setQueues(
      queues.map((q) =>
        q.id === editingQueue.id
          ? {
              ...q,
              name: newQueueName,
              description: newQueueDescription,
              priority: newQueuePriority,
              maxWaitTime: newQueueMaxWait,
              updatedAt: new Date(),
            }
          : q
      )
    );
    setIsEditQueueOpen(false);
    setEditingQueue(null);
    resetQueueForm();
  };

  const handleOpenConfig = (dept: Department) => {
    setConfigDept(dept);
    setIsConfigDeptOpen(true);
  };

  const handleOpenWorkingHours = (dept: Department) => {
    setWorkingHoursDept(dept);
    setIsWorkingHoursOpen(true);
  };

  const getStatusBadge = (status: Agent['status']) => {
    switch (status) {
      case 'online':
        return <Badge className="bg-green-500">Online</Badge>;
      case 'away':
        return <Badge className="bg-amber-500">Ausente</Badge>;
      case 'busy':
        return <Badge className="bg-red-500">Ocupado</Badge>;
      case 'offline':
        return (
          <Badge variant="outline" className="text-gray-500">
            Offline
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold">Departamentos e Filas</h2>
          <p className="text-muted-foreground">
            Gerencie departamentos, filas de atendimento e alocação de colaboradores
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Dialog open={isCreateDeptOpen} onOpenChange={setIsCreateDeptOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="mr-2 h-4 w-4" />
                Novo Departamento
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>Criar Departamento</DialogTitle>
                <DialogDescription>
                  Configure um novo departamento para organizar o atendimento
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="dept-name">Nome do Departamento</Label>
                  <Input
                    id="dept-name"
                    placeholder="Ex: Financeiro, Suporte, Comercial"
                    value={newDeptName}
                    onChange={(e) => setNewDeptName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dept-description">Descrição</Label>
                  <Textarea
                    id="dept-description"
                    placeholder="Descreva as responsabilidades deste departamento"
                    value={newDeptDescription}
                    onChange={(e) => setNewDeptDescription(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dept-welcome">Mensagem de Boas-vindas (WhatsApp)</Label>
                  <Textarea
                    id="dept-welcome"
                    placeholder="Olá! Você está no setor X. Como posso ajudar?"
                    value={newDeptWelcomeMsg}
                    onChange={(e) => setNewDeptWelcomeMsg(e.target.value)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Atribuição Automática</Label>
                    <p className="text-xs text-muted-foreground">
                      Distribuir tickets automaticamente entre agentes
                    </p>
                  </div>
                  <Switch checked={newDeptAutoAssign} onCheckedChange={setNewDeptAutoAssign} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dept-max-tickets">Máximo de Tickets por Agente</Label>
                  <Input
                    id="dept-max-tickets"
                    type="number"
                    min={1}
                    max={20}
                    value={newDeptMaxTickets}
                    onChange={(e) => setNewDeptMaxTickets(parseInt(e.target.value) || 5)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDeptOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={handleCreateDepartment}
                  disabled={!newDeptName.trim()}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Criar Departamento
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building2 className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalDepartments}</p>
                <p className="text-xs text-muted-foreground">Departamentos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.activeDepartments}</p>
                <p className="text-xs text-muted-foreground">Ativos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Layers className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalQueues}</p>
                <p className="text-xs text-muted-foreground">Filas</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Users className="h-5 w-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalAgents}</p>
                <p className="text-xs text-muted-foreground">Agentes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 rounded-lg">
                <Headphones className="h-5 w-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.onlineAgents}</p>
                <p className="text-xs text-muted-foreground">Online</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <MessageSquare className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.ticketsInQueue}</p>
                <p className="text-xs text-muted-foreground">Na Fila</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar departamentos..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 max-w-md"
        />
      </div>

      {/* Departments List */}
      <div className="grid gap-6 lg:grid-cols-2">
        {filteredDepartments.map((dept) => (
          <Card key={dept.id} className={cn(!dept.isActive && 'opacity-60')}>
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={cn('p-2 rounded-lg', dept.color || 'bg-gray-500')}>
                    <Building2 className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg flex items-center gap-2">
                      {dept.name}
                      {dept.isActive ? (
                        <Badge className="bg-green-100 text-green-700">Ativo</Badge>
                      ) : (
                        <Badge variant="outline" className="text-gray-500">
                          Inativo
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="mt-1">{dept.description}</CardDescription>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Ações</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => handleEditDepartment(dept)}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleOpenConfig(dept)}>
                      <Settings className="mr-2 h-4 w-4" />
                      Configurações
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleOpenWorkingHours(dept)}>
                      <Clock className="mr-2 h-4 w-4" />
                      Horários
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleToggleDepartmentActive(dept.id)}>
                      {dept.isActive ? (
                        <>
                          <XCircle className="mr-2 h-4 w-4" />
                          Desativar
                        </>
                      ) : (
                        <>
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Ativar
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={() => {
                        setItemToDelete({ type: 'department', id: dept.id });
                        setIsDeleteConfirmOpen(true);
                      }}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Configurações rápidas */}
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Bot className="h-4 w-4" />
                  <span>Auto: {dept.autoAssign ? 'Sim' : 'Não'}</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Layers className="h-4 w-4" />
                  <span>Máx: {dept.maxTicketsPerAgent}/agente</span>
                </div>
              </div>

              <Separator />

              {/* Filas */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-sm">Filas de Atendimento</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedDepartment(dept);
                      setIsCreateQueueOpen(true);
                    }}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Fila
                  </Button>
                </div>
                <div className="space-y-2">
                  {getDepartmentQueues(dept.id).length > 0 ? (
                    getDepartmentQueues(dept.id).map((queue) => (
                      <div
                        key={queue.id}
                        className={cn(
                          'flex items-center justify-between p-2 rounded-lg border',
                          queue.isActive ? 'bg-white' : 'bg-gray-50 opacity-60'
                        )}
                      >
                        <div className="flex items-center gap-2">
                          <Layers className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">{queue.name}</span>
                          {queue.priority === 0 && (
                            <Badge className="bg-amber-100 text-amber-700 text-xs">VIP</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <MessageSquare className="h-3 w-3" />
                            {queue.ticketCount || 0}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Timer className="h-3 w-3" />~{queue.avgWaitTime || 0}min
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                <MoreVertical className="h-3 w-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditQueue(queue)}>
                                <Pencil className="mr-2 h-3 w-3" />
                                Editar
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleToggleQueueActive(queue.id)}>
                                {queue.isActive ? (
                                  <>
                                    <XCircle className="mr-2 h-3 w-3" />
                                    Desativar
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle className="mr-2 h-3 w-3" />
                                    Ativar
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-600"
                                onClick={() => {
                                  setItemToDelete({ type: 'queue', id: queue.id });
                                  setIsDeleteConfirmOpen(true);
                                }}
                              >
                                <Trash2 className="mr-2 h-3 w-3" />
                                Excluir
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-2">
                      Nenhuma fila configurada
                    </p>
                  )}
                </div>
              </div>

              <Separator />

              {/* Agentes */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-sm">Agentes Alocados</h4>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedDepartment(dept);
                      setIsAssignAgentOpen(true);
                    }}
                  >
                    <UserPlus className="h-3 w-3 mr-1" />
                    Alocar
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {getDepartmentAgents(dept.id).length > 0 ? (
                    getDepartmentAgents(dept.id).map((agent) => (
                      <div
                        key={agent.id}
                        className="flex items-center gap-2 p-2 rounded-lg border bg-white"
                      >
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={agent.avatar} />
                          <AvatarFallback className="text-xs">
                            {agent.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{agent.name}</span>
                        <div
                          className={cn(
                            'h-2 w-2 rounded-full',
                            agent.isOnline ? 'bg-green-500' : 'bg-gray-400'
                          )}
                        />
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">Nenhum agente alocado</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dialog para criar fila */}
      <Dialog open={isCreateQueueOpen} onOpenChange={setIsCreateQueueOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Fila de Atendimento</DialogTitle>
            <DialogDescription>
              Criar fila no departamento: {selectedDepartment?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="queue-name">Nome da Fila</Label>
              <Input
                id="queue-name"
                placeholder="Ex: Fila Principal, VIP, Urgente"
                value={newQueueName}
                onChange={(e) => setNewQueueName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="queue-description">Descrição</Label>
              <Textarea
                id="queue-description"
                placeholder="Descreva o propósito desta fila"
                value={newQueueDescription}
                onChange={(e) => setNewQueueDescription(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="queue-priority">Prioridade</Label>
                <Select
                  value={newQueuePriority.toString()}
                  onValueChange={(v) => setNewQueuePriority(parseInt(v))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">VIP (Máxima)</SelectItem>
                    <SelectItem value="1">Alta</SelectItem>
                    <SelectItem value="2">Normal</SelectItem>
                    <SelectItem value="3">Baixa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="queue-max-wait">Tempo Máx. Espera (min)</Label>
                <Input
                  id="queue-max-wait"
                  type="number"
                  min={1}
                  max={120}
                  value={newQueueMaxWait}
                  onChange={(e) => setNewQueueMaxWait(parseInt(e.target.value) || 30)}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateQueueOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleCreateQueue}
              disabled={!newQueueName.trim()}
              className="bg-green-600 hover:bg-green-700"
            >
              Criar Fila
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para alocar agente */}
      <Dialog open={isAssignAgentOpen} onOpenChange={setIsAssignAgentOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Alocar Agentes</DialogTitle>
            <DialogDescription>
              Selecione os agentes para o departamento: {selectedDepartment?.name}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-80">
            <div className="space-y-2 py-4">
              {agents.map((agent) => {
                const isAssigned = selectedDepartment
                  ? agent.departmentIds.includes(selectedDepartment.id)
                  : false;
                return (
                  <div
                    key={agent.id}
                    className={cn(
                      'flex items-center justify-between p-3 rounded-lg border',
                      isAssigned && 'bg-green-50 border-green-200'
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={agent.avatar} />
                        <AvatarFallback>{agent.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{agent.name}</p>
                        <p className="text-sm text-muted-foreground">{agent.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(agent.status)}
                      <Switch checked={isAssigned} />
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button onClick={() => setIsAssignAgentOpen(false)}>Concluir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Alert de confirmação de exclusão */}
      <AlertDialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              {itemToDelete?.type === 'department'
                ? 'Tem certeza que deseja excluir este departamento? Todas as filas associadas também serão removidas.'
                : 'Tem certeza que deseja excluir esta fila?'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog de editar departamento */}
      <Dialog open={isEditDeptOpen} onOpenChange={setIsEditDeptOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar Departamento</DialogTitle>
            <DialogDescription>
              Altere as configurações do departamento
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-dept-name">Nome do Departamento</Label>
              <Input
                id="edit-dept-name"
                value={newDeptName}
                onChange={(e) => setNewDeptName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-dept-description">Descrição</Label>
              <Textarea
                id="edit-dept-description"
                value={newDeptDescription}
                onChange={(e) => setNewDeptDescription(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-dept-welcome">Mensagem de Boas-vindas (WhatsApp)</Label>
              <Textarea
                id="edit-dept-welcome"
                value={newDeptWelcomeMsg}
                onChange={(e) => setNewDeptWelcomeMsg(e.target.value)}
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Atribuição Automática</Label>
                <p className="text-xs text-muted-foreground">
                  Distribuir tickets automaticamente entre agentes
                </p>
              </div>
              <Switch checked={newDeptAutoAssign} onCheckedChange={setNewDeptAutoAssign} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-dept-max-tickets">Máximo de Tickets por Agente</Label>
              <Input
                id="edit-dept-max-tickets"
                type="number"
                min={1}
                max={20}
                value={newDeptMaxTickets}
                onChange={(e) => setNewDeptMaxTickets(parseInt(e.target.value) || 5)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDeptOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSaveEditDepartment}
              disabled={!newDeptName.trim()}
              className="bg-green-600 hover:bg-green-700"
            >
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de editar fila */}
      <Dialog open={isEditQueueOpen} onOpenChange={setIsEditQueueOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Fila</DialogTitle>
            <DialogDescription>
              Altere as configurações da fila de atendimento
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-queue-name">Nome da Fila</Label>
              <Input
                id="edit-queue-name"
                value={newQueueName}
                onChange={(e) => setNewQueueName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-queue-description">Descrição</Label>
              <Textarea
                id="edit-queue-description"
                value={newQueueDescription}
                onChange={(e) => setNewQueueDescription(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-queue-priority">Prioridade</Label>
                <Select
                  value={newQueuePriority.toString()}
                  onValueChange={(v) => setNewQueuePriority(parseInt(v))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0">VIP (Máxima)</SelectItem>
                    <SelectItem value="1">Alta</SelectItem>
                    <SelectItem value="2">Normal</SelectItem>
                    <SelectItem value="3">Baixa</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-queue-max-wait">Tempo Máx. Espera (min)</Label>
                <Input
                  id="edit-queue-max-wait"
                  type="number"
                  min={1}
                  max={120}
                  value={newQueueMaxWait}
                  onChange={(e) => setNewQueueMaxWait(parseInt(e.target.value) || 30)}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditQueueOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSaveEditQueue}
              disabled={!newQueueName.trim()}
              className="bg-green-600 hover:bg-green-700"
            >
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de configurações do departamento */}
      <Dialog open={isConfigDeptOpen} onOpenChange={setIsConfigDeptOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Configurações - {configDept?.name}</DialogTitle>
            <DialogDescription>
              Configure SLAs e regras avançadas do departamento
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>SLA - Tempo de Primeira Resposta (minutos)</Label>
              <Input type="number" defaultValue={15} min={1} max={120} />
            </div>
            <div className="space-y-2">
              <Label>SLA - Tempo de Resolução (minutos)</Label>
              <Input type="number" defaultValue={60} min={1} max={480} />
            </div>
            <div className="space-y-2">
              <Label>E-mail para Escalação</Label>
              <Input type="email" placeholder="escalacao@empresa.com" />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Notificar Supervisores</Label>
                <p className="text-xs text-muted-foreground">
                  Alertar quando SLA for violado
                </p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Transferência Automática</Label>
                <p className="text-xs text-muted-foreground">
                  Transferir para outro agente após inatividade
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfigDeptOpen(false)}>
              Cancelar
            </Button>
            <Button className="bg-green-600 hover:bg-green-700" onClick={() => setIsConfigDeptOpen(false)}>
              Salvar Configurações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de horários de funcionamento */}
      <Dialog open={isWorkingHoursOpen} onOpenChange={setIsWorkingHoursOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Horários de Funcionamento - {workingHoursDept?.name}</DialogTitle>
            <DialogDescription>
              Configure os horários de atendimento do departamento
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Fuso Horário</Label>
              <Select defaultValue="America/Sao_Paulo">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="America/Sao_Paulo">América/São Paulo (GMT-3)</SelectItem>
                  <SelectItem value="America/Fortaleza">América/Fortaleza (GMT-3)</SelectItem>
                  <SelectItem value="America/Manaus">América/Manaus (GMT-4)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Separator />
            <div className="space-y-3">
              {weekDays.map((day) => (
                <div key={day.value} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Switch defaultChecked={day.value >= 1 && day.value <= 5} />
                    <span className="text-sm font-medium w-20">{day.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input type="time" defaultValue="08:00" className="w-24 h-8 text-sm" />
                    <span className="text-muted-foreground">às</span>
                    <Input type="time" defaultValue="18:00" className="w-24 h-8 text-sm" />
                  </div>
                </div>
              ))}
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Mensagem Fora do Horário</Label>
                <p className="text-xs text-muted-foreground">
                  Resposta automática fora do expediente
                </p>
              </div>
              <Switch defaultChecked />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsWorkingHoursOpen(false)}>
              Cancelar
            </Button>
            <Button className="bg-green-600 hover:bg-green-700" onClick={() => setIsWorkingHoursOpen(false)}>
              Salvar Horários
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default DepartmentAdmin;
