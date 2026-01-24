/**
 * Flow Editor - Editor Visual de Fluxos de Atendimento
 *
 * Features:
 * - Criação visual de fluxos (drag and drop)
 * - Nós de diferentes tipos (mensagem, pergunta, menu, IA, etc.)
 * - Conexões condicionais
 * - Pré-visualização do fluxo
 * - Teste de fluxo
 */

import { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
} from '@/components/ui/dialog';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Play,
  Pause,
  Save,
  Undo,
  Redo,
  ZoomIn,
  ZoomOut,
  Maximize,
  Plus,
  Trash2,
  Settings,
  Eye,
  Code,
  MessageSquare,
  HelpCircle,
  List,
  GitBranch,
  Bot,
  ArrowRightCircle,
  Clock,
  Tag,
  Variable,
  Webhook,
  CircleSlash,
  GripVertical,
  MoreVertical,
  Copy,
  Pencil,
  ChevronRight,
  ChevronDown,
  Search,
  FileText,
  Layers,
  PlayCircle,
  X,
  Check,
  AlertCircle,
  Sparkles,
  Building2,
  User,
  Zap,
  FileSearch,
  UserCheck,
  Phone,
  Mail,
  Lock,
  ListOrdered,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Flow, FlowNode, FlowNodeType, FlowEdge, FlowNodeData, FlowMenuOption } from '@/types/omnichannel';

// Definição dos tipos de nós disponíveis
interface NodeTypeDefinition {
  type: FlowNodeType;
  label: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  category: 'trigger' | 'message' | 'input' | 'logic' | 'action' | 'end';
}

const nodeTypes: NodeTypeDefinition[] = [
  {
    type: 'start',
    label: 'Início',
    description: 'Ponto inicial do fluxo',
    icon: <PlayCircle className="h-5 w-5" />,
    color: 'bg-green-500',
    category: 'trigger',
  },
  {
    type: 'message',
    label: 'Mensagem',
    description: 'Enviar mensagem de texto',
    icon: <MessageSquare className="h-5 w-5" />,
    color: 'bg-blue-500',
    category: 'message',
  },
  {
    type: 'question',
    label: 'Pergunta',
    description: 'Coletar informação do usuário',
    icon: <HelpCircle className="h-5 w-5" />,
    color: 'bg-purple-500',
    category: 'input',
  },
  {
    type: 'menu',
    label: 'Menu',
    description: 'Opções de escolha',
    icon: <List className="h-5 w-5" />,
    color: 'bg-amber-500',
    category: 'input',
  },
  {
    type: 'condition',
    label: 'Condição',
    description: 'Decisão condicional',
    icon: <GitBranch className="h-5 w-5" />,
    color: 'bg-orange-500',
    category: 'logic',
  },
  {
    type: 'ai_agent',
    label: 'Agente IA',
    description: 'Processar com IA',
    icon: <Bot className="h-5 w-5" />,
    color: 'bg-violet-500',
    category: 'logic',
  },
  {
    type: 'transfer',
    label: 'Transferir',
    description: 'Transferir para departamento/agente',
    icon: <ArrowRightCircle className="h-5 w-5" />,
    color: 'bg-cyan-500',
    category: 'action',
  },
  {
    type: 'webhook',
    label: 'Webhook',
    description: 'Chamar API externa',
    icon: <Webhook className="h-5 w-5" />,
    color: 'bg-slate-500',
    category: 'action',
  },
  {
    type: 'delay',
    label: 'Aguardar',
    description: 'Delay de tempo',
    icon: <Clock className="h-5 w-5" />,
    color: 'bg-gray-500',
    category: 'action',
  },
  {
    type: 'tag',
    label: 'Tag',
    description: 'Adicionar/remover tag',
    icon: <Tag className="h-5 w-5" />,
    color: 'bg-pink-500',
    category: 'action',
  },
  {
    type: 'variable',
    label: 'Variável',
    description: 'Definir variável',
    icon: <Variable className="h-5 w-5" />,
    color: 'bg-teal-500',
    category: 'action',
  },
  {
    type: 'identify_contract',
    label: 'Identificar Contrato',
    description: 'Vincular por CPF/Tel/Email',
    icon: <FileSearch className="h-5 w-5" />,
    color: 'bg-indigo-500',
    category: 'action',
  },
  {
    type: 'client_tag',
    label: 'Tag Cliente',
    description: 'Classificar tipo de cliente',
    icon: <UserCheck className="h-5 w-5" />,
    color: 'bg-rose-500',
    category: 'action',
  },
  {
    type: 'end',
    label: 'Fim',
    description: 'Encerrar fluxo',
    icon: <CircleSlash className="h-5 w-5" />,
    color: 'bg-red-500',
    category: 'end',
  },
];

// Mock flows
const mockFlows: Flow[] = [
  {
    id: 'flow-1',
    name: 'Boas-vindas Financeiro',
    description: 'Fluxo inicial para departamento financeiro',
    departmentId: 'dept-1',
    isActive: true,
    isDefault: true,
    triggerType: 'new_conversation',
    nodes: [
      {
        id: 'node-1',
        type: 'start',
        position: { x: 100, y: 100 },
        data: { label: 'Início' },
      },
      {
        id: 'node-2',
        type: 'message',
        position: { x: 100, y: 200 },
        data: {
          label: 'Boas-vindas',
          message: 'Olá! Bem-vindo ao setor Financeiro da Vínculo Brasil. Como posso ajudar?',
        },
      },
      {
        id: 'node-3',
        type: 'menu',
        position: { x: 100, y: 320 },
        data: {
          label: 'Menu Principal',
          menuTitle: 'Selecione uma opção:',
          menuOptions: [
            { id: 'opt-1', label: '2ª Via de Boleto', value: 'boleto' },
            { id: 'opt-2', label: 'Status do Pagamento', value: 'status' },
            { id: 'opt-3', label: 'Falar com Atendente', value: 'humano' },
          ],
        },
      },
      {
        id: 'node-4',
        type: 'ai_agent',
        position: { x: 300, y: 420 },
        data: {
          label: 'IA Financeiro',
          aiPrompt: 'Você é um assistente financeiro. Ajude o cliente com questões sobre boletos e pagamentos.',
          aiTools: ['consultar_status_contrato', 'gerar_segunda_via_boleto'],
        },
      },
      {
        id: 'node-5',
        type: 'transfer',
        position: { x: 500, y: 420 },
        data: {
          label: 'Atendente Humano',
          transferType: 'department',
          transferTargetId: 'dept-1',
          transferMessage: 'Transferindo para um atendente...',
        },
      },
    ],
    edges: [
      { id: 'edge-1', source: 'node-1', target: 'node-2' },
      { id: 'edge-2', source: 'node-2', target: 'node-3' },
      { id: 'edge-3', source: 'node-3', target: 'node-4', label: 'boleto/status', sourceHandle: 'opt-1' },
      { id: 'edge-4', source: 'node-3', target: 'node-5', label: 'humano', sourceHandle: 'opt-3' },
    ],
    variables: [],
    version: 1,
    createdBy: 'admin',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 'flow-2',
    name: 'Triagem Inicial',
    description: 'Fluxo de triagem geral para novos contatos',
    isActive: true,
    isDefault: false,
    triggerType: 'new_conversation',
    nodes: [],
    edges: [],
    variables: [],
    version: 1,
    createdBy: 'admin',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

interface FlowEditorProps {
  initialFlow?: Flow;
  onSave?: (flow: Flow) => void;
}

export function FlowEditor({ initialFlow, onSave }: FlowEditorProps) {
  const [flows, setFlows] = useState<Flow[]>(mockFlows);
  const [selectedFlow, setSelectedFlow] = useState<Flow | null>(initialFlow || mockFlows[0]);
  const [selectedNode, setSelectedNode] = useState<FlowNode | null>(null);
  const [isNodePanelOpen, setIsNodePanelOpen] = useState(false);
  const [isFlowListOpen, setIsFlowListOpen] = useState(true);
  const [isTestMode, setIsTestMode] = useState(false);
  const [testMessages, setTestMessages] = useState<{ sender: 'user' | 'bot'; content: string }[]>([]);
  const [testInput, setTestInput] = useState('');
  const [zoom, setZoom] = useState(100);
  const [searchQuery, setSearchQuery] = useState('');

  // Canvas state (simulated - in production use React Flow)
  const [canvasNodes, setCanvasNodes] = useState<FlowNode[]>(selectedFlow?.nodes || []);
  const [canvasEdges, setCanvasEdges] = useState<FlowEdge[]>(selectedFlow?.edges || []);

  const getNodeType = (type: FlowNodeType) => nodeTypes.find((n) => n.type === type);

  const handleAddNode = (type: FlowNodeType) => {
    const nodeType = getNodeType(type);
    if (!nodeType || !selectedFlow) return;

    const newNode: FlowNode = {
      id: `node-${Date.now()}`,
      type,
      position: { x: 200 + Math.random() * 100, y: 200 + canvasNodes.length * 120 },
      data: { label: nodeType.label },
    };

    setCanvasNodes([...canvasNodes, newNode]);
    setSelectedNode(newNode);
    setIsNodePanelOpen(true);
  };

  const handleDeleteNode = (nodeId: string) => {
    setCanvasNodes(canvasNodes.filter((n) => n.id !== nodeId));
    setCanvasEdges(canvasEdges.filter((e) => e.source !== nodeId && e.target !== nodeId));
    if (selectedNode?.id === nodeId) {
      setSelectedNode(null);
      setIsNodePanelOpen(false);
    }
  };

  const handleUpdateNodeData = (nodeId: string, data: Partial<FlowNodeData>) => {
    setCanvasNodes(
      canvasNodes.map((n) => (n.id === nodeId ? { ...n, data: { ...n.data, ...data } } : n))
    );
    if (selectedNode?.id === nodeId) {
      setSelectedNode({ ...selectedNode, data: { ...selectedNode.data, ...data } });
    }
  };

  const handleSaveFlow = () => {
    if (!selectedFlow) return;

    const updatedFlow: Flow = {
      ...selectedFlow,
      nodes: canvasNodes,
      edges: canvasEdges,
      updatedAt: new Date(),
    };

    setFlows(flows.map((f) => (f.id === updatedFlow.id ? updatedFlow : f)));
    onSave?.(updatedFlow);
  };

  const handleCreateFlow = () => {
    const newFlow: Flow = {
      id: `flow-${Date.now()}`,
      name: 'Novo Fluxo',
      description: '',
      isActive: false,
      isDefault: false,
      triggerType: 'new_conversation',
      nodes: [
        {
          id: 'node-start',
          type: 'start',
          position: { x: 200, y: 100 },
          data: { label: 'Início' },
        },
      ],
      edges: [],
      variables: [],
      version: 1,
      createdBy: 'admin',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setFlows([...flows, newFlow]);
    setSelectedFlow(newFlow);
    setCanvasNodes(newFlow.nodes);
    setCanvasEdges(newFlow.edges);
  };

  const handleTestFlow = () => {
    setIsTestMode(true);
    setTestMessages([
      { sender: 'bot', content: 'Iniciando teste do fluxo...' },
      { sender: 'bot', content: selectedFlow?.nodes[1]?.data.message || 'Olá! Como posso ajudar?' },
    ]);
  };

  const handleSendTestMessage = () => {
    if (!testInput.trim()) return;

    setTestMessages([
      ...testMessages,
      { sender: 'user', content: testInput },
      { sender: 'bot', content: 'Processando sua mensagem...' },
    ]);
    setTestInput('');

    // Simulate bot response
    setTimeout(() => {
      setTestMessages((prev) => [
        ...prev.slice(0, -1),
        { sender: 'bot', content: 'Entendi! Vou verificar isso para você.' },
      ]);
    }, 1000);
  };

  const filteredFlows = flows.filter(
    (f) =>
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const nodeCategories = [
    { id: 'trigger', label: 'Gatilhos', nodes: nodeTypes.filter((n) => n.category === 'trigger') },
    { id: 'message', label: 'Mensagens', nodes: nodeTypes.filter((n) => n.category === 'message') },
    { id: 'input', label: 'Entrada', nodes: nodeTypes.filter((n) => n.category === 'input') },
    { id: 'logic', label: 'Lógica', nodes: nodeTypes.filter((n) => n.category === 'logic') },
    { id: 'action', label: 'Ações', nodes: nodeTypes.filter((n) => n.category === 'action') },
    { id: 'end', label: 'Finalização', nodes: nodeTypes.filter((n) => n.category === 'end') },
  ];

  return (
    <div className="h-[calc(100vh-200px)] flex">
      {/* Left Sidebar - Flow List */}
      <div
        className={cn(
          'border-r bg-slate-50 transition-all duration-300 flex flex-col',
          isFlowListOpen ? 'w-64' : 'w-12'
        )}
      >
        <div className="p-3 border-b flex items-center justify-between">
          {isFlowListOpen && <h3 className="font-semibold text-sm">Fluxos</h3>}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsFlowListOpen(!isFlowListOpen)}
          >
            {isFlowListOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </Button>
        </div>

        {isFlowListOpen && (
          <>
            <div className="p-2">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 h-8 text-sm"
                />
              </div>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-2 space-y-1">
                {filteredFlows.map((flow) => (
                  <div
                    key={flow.id}
                    onClick={() => {
                      setSelectedFlow(flow);
                      setCanvasNodes(flow.nodes);
                      setCanvasEdges(flow.edges);
                    }}
                    className={cn(
                      'p-2 rounded-lg cursor-pointer transition-colors',
                      selectedFlow?.id === flow.id
                        ? 'bg-green-100 border-green-300 border'
                        : 'hover:bg-slate-100'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-sm truncate">{flow.name}</span>
                      {flow.isActive && (
                        <Badge className="bg-green-500 text-xs">Ativo</Badge>
                      )}
                    </div>
                    {flow.description && (
                      <p className="text-xs text-muted-foreground truncate mt-1">
                        {flow.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">
                        {flow.nodes.length} nós
                      </span>
                      {flow.isDefault && (
                        <Badge variant="outline" className="text-xs">Padrão</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="p-2 border-t">
              <Button
                onClick={handleCreateFlow}
                className="w-full bg-green-600 hover:bg-green-700"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-1" />
                Novo Fluxo
              </Button>
            </div>
          </>
        )}
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="border-b bg-white p-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Input
              value={selectedFlow?.name || ''}
              onChange={(e) => {
                if (selectedFlow) {
                  setSelectedFlow({ ...selectedFlow, name: e.target.value });
                }
              }}
              className="font-semibold border-0 shadow-none focus-visible:ring-0 w-48"
            />
            <Badge variant="outline" className="text-xs">
              v{selectedFlow?.version || 1}
            </Badge>
            {selectedFlow?.isActive ? (
              <Badge className="bg-green-500">Publicado</Badge>
            ) : (
              <Badge variant="outline">Rascunho</Badge>
            )}
          </div>

          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" title="Desfazer">
              <Undo className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" title="Refazer">
              <Redo className="h-4 w-4" />
            </Button>
            <Separator orientation="vertical" className="h-6 mx-1" />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setZoom(Math.max(50, zoom - 10))}
              title="Diminuir zoom"
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm w-12 text-center">{zoom}%</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setZoom(Math.min(200, zoom + 10))}
              title="Aumentar zoom"
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" title="Tela cheia">
              <Maximize className="h-4 w-4" />
            </Button>
            <Separator orientation="vertical" className="h-6 mx-1" />
            <Button
              variant="outline"
              size="sm"
              onClick={handleTestFlow}
              className="text-blue-600"
            >
              <Play className="h-4 w-4 mr-1" />
              Testar
            </Button>
            <Button
              onClick={handleSaveFlow}
              size="sm"
              className="bg-green-600 hover:bg-green-700"
            >
              <Save className="h-4 w-4 mr-1" />
              Salvar
            </Button>
          </div>
        </div>

        {/* Canvas + Node Panel */}
        <div className="flex-1 flex">
          {/* Canvas */}
          <div className="flex-1 bg-slate-100 overflow-auto relative">
            {/* Grid background */}
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `
                  linear-gradient(to right, #e2e8f0 1px, transparent 1px),
                  linear-gradient(to bottom, #e2e8f0 1px, transparent 1px)
                `,
                backgroundSize: '20px 20px',
              }}
            />

            {/* Nodes */}
            <div className="relative" style={{ transform: `scale(${zoom / 100})` }}>
              {canvasNodes.map((node) => {
                const nodeType = getNodeType(node.type);
                return (
                  <div
                    key={node.id}
                    onClick={() => {
                      setSelectedNode(node);
                      setIsNodePanelOpen(true);
                    }}
                    className={cn(
                      'absolute bg-white rounded-lg shadow-md border-2 p-3 min-w-[180px] cursor-pointer transition-all',
                      selectedNode?.id === node.id
                        ? 'border-green-500 ring-2 ring-green-200'
                        : 'border-transparent hover:border-slate-300'
                    )}
                    style={{
                      left: node.position.x,
                      top: node.position.y,
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <div
                        className={cn(
                          'p-1.5 rounded',
                          nodeType?.color,
                          'text-white'
                        )}
                      >
                        {nodeType?.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {node.data.label || nodeType?.label}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {nodeType?.description}
                        </p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreVertical className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem>
                            <Copy className="h-3 w-3 mr-2" />
                            Duplicar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteNode(node.id);
                            }}
                          >
                            <Trash2 className="h-3 w-3 mr-2" />
                            Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Preview content based on node type */}
                    {node.type === 'message' && node.data.message && (
                      <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-blue-700 truncate">
                        {node.data.message.slice(0, 50)}...
                      </div>
                    )}
                    {node.type === 'menu' && node.data.menuOptions && (
                      <div className="mt-2 space-y-1">
                        {node.data.menuOptions.slice(0, 2).map((opt: FlowMenuOption) => (
                          <div
                            key={opt.id}
                            className="p-1 bg-amber-50 rounded text-xs text-amber-700"
                          >
                            {opt.label}
                          </div>
                        ))}
                        {(node.data.menuOptions?.length || 0) > 2 && (
                          <span className="text-xs text-muted-foreground">
                            +{(node.data.menuOptions?.length || 0) - 2} opções
                          </span>
                        )}
                      </div>
                    )}

                    {/* Connection points */}
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
                    {node.type !== 'start' && (
                      <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-slate-400 rounded-full border-2 border-white" />
                    )}
                  </div>
                );
              })}

              {/* Empty state */}
              {canvasNodes.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center p-8">
                    <Layers className="h-12 w-12 mx-auto text-muted-foreground/30" />
                    <p className="mt-4 text-muted-foreground">
                      Arraste componentes da barra lateral para começar
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar - Node Properties or Node Palette */}
          <div className="w-72 border-l bg-white flex flex-col">
            <Tabs defaultValue="nodes" className="flex-1 flex flex-col">
              <TabsList className="w-full rounded-none border-b">
                <TabsTrigger value="nodes" className="flex-1">Componentes</TabsTrigger>
                <TabsTrigger value="properties" className="flex-1">Propriedades</TabsTrigger>
              </TabsList>

              <TabsContent value="nodes" className="flex-1 m-0 overflow-hidden">
                <ScrollArea className="h-full">
                  <div className="p-3 space-y-4">
                    {nodeCategories.map((category) => (
                      <div key={category.id}>
                        <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                          {category.label}
                        </h4>
                        <div className="grid grid-cols-2 gap-2">
                          {category.nodes.map((nodeType) => (
                            <div
                              key={nodeType.type}
                              onClick={() => handleAddNode(nodeType.type)}
                              className="flex flex-col items-center p-2 rounded-lg border cursor-pointer hover:bg-slate-50 transition-colors"
                            >
                              <div
                                className={cn(
                                  'p-2 rounded-lg mb-1',
                                  nodeType.color,
                                  'text-white'
                                )}
                              >
                                {nodeType.icon}
                              </div>
                              <span className="text-xs font-medium text-center">
                                {nodeType.label}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="properties" className="flex-1 m-0 overflow-hidden">
                <ScrollArea className="h-full">
                  {selectedNode ? (
                    <div className="p-3 space-y-4">
                      <div>
                        <Label className="text-xs">Nome do Nó</Label>
                        <Input
                          value={selectedNode.data.label || ''}
                          onChange={(e) =>
                            handleUpdateNodeData(selectedNode.id, { label: e.target.value })
                          }
                          className="mt-1"
                        />
                      </div>

                      {/* Properties based on node type */}
                      {selectedNode.type === 'message' && (
                        <div>
                          <Label className="text-xs">Mensagem</Label>
                          <Textarea
                            value={selectedNode.data.message || ''}
                            onChange={(e) =>
                              handleUpdateNodeData(selectedNode.id, { message: e.target.value })
                            }
                            placeholder="Digite a mensagem..."
                            className="mt-1"
                            rows={4}
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Use {'{variavel}'} para inserir variáveis
                          </p>
                        </div>
                      )}

                      {selectedNode.type === 'question' && (
                        <>
                          <div>
                            <Label className="text-xs">Pergunta</Label>
                            <Textarea
                              value={selectedNode.data.question || ''}
                              onChange={(e) =>
                                handleUpdateNodeData(selectedNode.id, { question: e.target.value })
                              }
                              placeholder="Digite a pergunta..."
                              className="mt-1"
                              rows={3}
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Salvar resposta em</Label>
                            <Input
                              value={selectedNode.data.variableName || ''}
                              onChange={(e) =>
                                handleUpdateNodeData(selectedNode.id, {
                                  variableName: e.target.value,
                                })
                              }
                              placeholder="nome_variavel"
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Tipo de Validação</Label>
                            <Select
                              value={selectedNode.data.validationType || 'text'}
                              onValueChange={(v) =>
                                handleUpdateNodeData(selectedNode.id, {
                                  validationType: v as FlowNodeData['validationType'],
                                })
                              }
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="text">Texto</SelectItem>
                                <SelectItem value="number">Número</SelectItem>
                                <SelectItem value="email">E-mail</SelectItem>
                                <SelectItem value="cpf">CPF</SelectItem>
                                <SelectItem value="phone">Telefone</SelectItem>
                                <SelectItem value="date">Data</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </>
                      )}

                      {selectedNode.type === 'menu' && (
                        <>
                          <div>
                            <Label className="text-xs">Título do Menu</Label>
                            <Input
                              value={selectedNode.data.menuTitle || ''}
                              onChange={(e) =>
                                handleUpdateNodeData(selectedNode.id, { menuTitle: e.target.value })
                              }
                              placeholder="Selecione uma opção:"
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <div className="flex items-center justify-between mb-2">
                              <Label className="text-xs">Opções</Label>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  const currentOptions = selectedNode.data.menuOptions || [];
                                  handleUpdateNodeData(selectedNode.id, {
                                    menuOptions: [
                                      ...currentOptions,
                                      {
                                        id: `opt-${Date.now()}`,
                                        label: 'Nova opção',
                                        value: `option_${currentOptions.length + 1}`,
                                      },
                                    ],
                                  });
                                }}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                            <div className="space-y-2">
                              {(selectedNode.data.menuOptions || []).map(
                                (opt: FlowMenuOption, idx: number) => (
                                  <div key={opt.id} className="flex items-center gap-2">
                                    <Input
                                      value={opt.label}
                                      onChange={(e) => {
                                        const newOptions = [
                                          ...(selectedNode.data.menuOptions || []),
                                        ];
                                        newOptions[idx] = { ...opt, label: e.target.value };
                                        handleUpdateNodeData(selectedNode.id, {
                                          menuOptions: newOptions,
                                        });
                                      }}
                                      className="flex-1 h-8 text-sm"
                                    />
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-8 w-8 p-0 text-red-500"
                                      onClick={() => {
                                        const newOptions = (
                                          selectedNode.data.menuOptions || []
                                        ).filter((_: FlowMenuOption, i: number) => i !== idx);
                                        handleUpdateNodeData(selectedNode.id, {
                                          menuOptions: newOptions,
                                        });
                                      }}
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                )
                              )}
                            </div>
                          </div>
                        </>
                      )}

                      {selectedNode.type === 'ai_agent' && (
                        <>
                          <div>
                            <Label className="text-xs">Prompt do Sistema</Label>
                            <Textarea
                              value={selectedNode.data.aiPrompt || ''}
                              onChange={(e) =>
                                handleUpdateNodeData(selectedNode.id, { aiPrompt: e.target.value })
                              }
                              placeholder="Você é um assistente..."
                              className="mt-1"
                              rows={4}
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Ferramentas (Tools)</Label>
                            <div className="mt-1 space-y-2">
                              {[
                                'consultar_status_contrato',
                                'gerar_segunda_via_boleto',
                                'verificar_pagamento',
                                'agendar_vistoria',
                                'transferir_para_humano',
                              ].map((tool) => (
                                <div key={tool} className="flex items-center gap-2">
                                  <Switch
                                    checked={(selectedNode.data.aiTools || []).includes(tool)}
                                    onCheckedChange={(checked) => {
                                      const currentTools = selectedNode.data.aiTools || [];
                                      const newTools = checked
                                        ? [...currentTools, tool]
                                        : currentTools.filter((t: string) => t !== tool);
                                      handleUpdateNodeData(selectedNode.id, { aiTools: newTools });
                                    }}
                                  />
                                  <span className="text-xs">{tool}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </>
                      )}

                      {selectedNode.type === 'transfer' && (
                        <>
                          <div>
                            <Label className="text-xs">Tipo de Transferência</Label>
                            <Select
                              value={selectedNode.data.transferType || 'department'}
                              onValueChange={(v) =>
                                handleUpdateNodeData(selectedNode.id, {
                                  transferType: v as FlowNodeData['transferType'],
                                })
                              }
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="department">Departamento</SelectItem>
                                <SelectItem value="queue">Fila</SelectItem>
                                <SelectItem value="agent">Agente Específico</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-xs">Destino</Label>
                            <Select
                              value={selectedNode.data.transferTargetId || ''}
                              onValueChange={(v) =>
                                handleUpdateNodeData(selectedNode.id, { transferTargetId: v })
                              }
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Selecione..." />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="dept-1">Financeiro</SelectItem>
                                <SelectItem value="dept-2">Suporte</SelectItem>
                                <SelectItem value="dept-3">Comercial</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label className="text-xs">Mensagem de Transferência</Label>
                            <Textarea
                              value={selectedNode.data.transferMessage || ''}
                              onChange={(e) =>
                                handleUpdateNodeData(selectedNode.id, {
                                  transferMessage: e.target.value,
                                })
                              }
                              placeholder="Transferindo para um atendente..."
                              className="mt-1"
                              rows={2}
                            />
                          </div>
                        </>
                      )}

                      {selectedNode.type === 'delay' && (
                        <div>
                          <Label className="text-xs">Tempo de espera (segundos)</Label>
                          <Input
                            type="number"
                            min={1}
                            max={300}
                            value={selectedNode.data.delaySeconds || 5}
                            onChange={(e) =>
                              handleUpdateNodeData(selectedNode.id, {
                                delaySeconds: parseInt(e.target.value) || 5,
                              })
                            }
                            className="mt-1"
                          />
                        </div>
                      )}

                      {selectedNode.type === 'identify_contract' && (
                        <>
                          <div>
                            <Label className="text-xs">Identificar Por</Label>
                            <Select
                              value={selectedNode.data.identifyBy || 'cpf'}
                              onValueChange={(v) =>
                                handleUpdateNodeData(selectedNode.id, {
                                  identifyBy: v as 'cpf' | 'phone' | 'email',
                                })
                              }
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="cpf">
                                  <div className="flex items-center gap-2">
                                    <FileText className="h-3 w-3" />
                                    CPF
                                  </div>
                                </SelectItem>
                                <SelectItem value="phone">
                                  <div className="flex items-center gap-2">
                                    <Phone className="h-3 w-3" />
                                    Telefone
                                  </div>
                                </SelectItem>
                                <SelectItem value="email">
                                  <div className="flex items-center gap-2">
                                    <Mail className="h-3 w-3" />
                                    E-mail
                                  </div>
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label className="text-xs flex items-center gap-1">
                                <Lock className="h-3 w-3" />
                                Travar Contrato
                              </Label>
                              <p className="text-xs text-muted-foreground">
                                Vincular ao próximo atendimento
                              </p>
                            </div>
                            <Switch
                              checked={selectedNode.data.lockContract || false}
                              onCheckedChange={(v) =>
                                handleUpdateNodeData(selectedNode.id, { lockContract: v })
                              }
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label className="text-xs flex items-center gap-1">
                                <ListOrdered className="h-3 w-3" />
                                Permitir Seleção
                              </Label>
                              <p className="text-xs text-muted-foreground">
                                Se múltiplos contratos
                              </p>
                            </div>
                            <Switch
                              checked={selectedNode.data.askForSelection || false}
                              onCheckedChange={(v) =>
                                handleUpdateNodeData(selectedNode.id, { askForSelection: v })
                              }
                            />
                          </div>
                          {selectedNode.data.askForSelection && (
                            <div>
                              <Label className="text-xs">Mensagem de Seleção</Label>
                              <Textarea
                                value={selectedNode.data.selectionMessage || 'Encontrei mais de um contrato vinculado. Digite o número para selecionar:\n\n{lista_contratos}'}
                                onChange={(e) =>
                                  handleUpdateNodeData(selectedNode.id, {
                                    selectionMessage: e.target.value,
                                  })
                                }
                                placeholder="Mensagem para seleção de contrato..."
                                className="mt-1"
                                rows={3}
                              />
                              <p className="text-xs text-muted-foreground mt-1">
                                Use {'{lista_contratos}'} para inserir a lista numerada
                              </p>
                            </div>
                          )}
                          <div>
                            <Label className="text-xs">Mensagem - Contrato não encontrado</Label>
                            <Textarea
                              value={selectedNode.data.notFoundMessage || 'Não encontrei nenhum contrato vinculado a este dado. Por favor, verifique as informações.'}
                              onChange={(e) =>
                                handleUpdateNodeData(selectedNode.id, {
                                  notFoundMessage: e.target.value,
                                })
                              }
                              placeholder="Mensagem quando não encontrar contrato..."
                              className="mt-1"
                              rows={2}
                            />
                          </div>
                        </>
                      )}

                      {selectedNode.type === 'client_tag' && (
                        <>
                          <div>
                            <Label className="text-xs">Tipo de Cliente</Label>
                            <Select
                              value={selectedNode.data.clientTagType || 'novo'}
                              onValueChange={(v) =>
                                handleUpdateNodeData(selectedNode.id, {
                                  clientTagType: v as FlowNodeData['clientTagType'],
                                })
                              }
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="novo">Novo Cliente</SelectItem>
                                <SelectItem value="recorrente">Cliente Recorrente</SelectItem>
                                <SelectItem value="vip">Cliente VIP</SelectItem>
                                <SelectItem value="inadimplente">Inadimplente</SelectItem>
                                <SelectItem value="investidor">Investidor</SelectItem>
                                <SelectItem value="garantidor">Garantidor</SelectItem>
                                <SelectItem value="imobiliaria">Imobiliária</SelectItem>
                                <SelectItem value="proprietario">Proprietário</SelectItem>
                                <SelectItem value="inquilino">Inquilino</SelectItem>
                                <SelectItem value="lead">Lead</SelectItem>
                                <SelectItem value="custom">Tag Customizada</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          {selectedNode.data.clientTagType === 'custom' && (
                            <div>
                              <Label className="text-xs">Tag Customizada</Label>
                              <Input
                                value={selectedNode.data.customClientTag || ''}
                                onChange={(e) =>
                                  handleUpdateNodeData(selectedNode.id, {
                                    customClientTag: e.target.value,
                                  })
                                }
                                placeholder="Nome da tag..."
                                className="mt-1"
                              />
                            </div>
                          )}
                          <div>
                            <Label className="text-xs">Ação</Label>
                            <Select
                              value={selectedNode.data.clientTagAction || 'add'}
                              onValueChange={(v) =>
                                handleUpdateNodeData(selectedNode.id, {
                                  clientTagAction: v as 'add' | 'remove' | 'set',
                                })
                              }
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="add">Adicionar Tag</SelectItem>
                                <SelectItem value="remove">Remover Tag</SelectItem>
                                <SelectItem value="set">Definir como Única</SelectItem>
                              </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground mt-1">
                              {selectedNode.data.clientTagAction === 'set'
                                ? 'Remove outras tags de tipo e adiciona esta'
                                : selectedNode.data.clientTagAction === 'remove'
                                ? 'Remove esta tag do cliente'
                                : 'Adiciona esta tag ao cliente'}
                            </p>
                          </div>
                        </>
                      )}

                      <Separator />

                      <Button
                        variant="destructive"
                        size="sm"
                        className="w-full"
                        onClick={() => handleDeleteNode(selectedNode.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Excluir Nó
                      </Button>
                    </div>
                  ) : (
                    <div className="p-8 text-center text-muted-foreground">
                      <Settings className="h-8 w-8 mx-auto mb-2 opacity-30" />
                      <p className="text-sm">Selecione um nó para editar suas propriedades</p>
                    </div>
                  )}
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Test Mode Dialog */}
      <Dialog open={isTestMode} onOpenChange={setIsTestMode}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <PlayCircle className="h-5 w-5 text-green-500" />
              Testar Fluxo
            </DialogTitle>
            <DialogDescription>Simule uma conversa para testar o fluxo</DialogDescription>
          </DialogHeader>

          <ScrollArea className="h-80 border rounded-lg p-3">
            <div className="space-y-3">
              {testMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={cn(
                    'flex',
                    msg.sender === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  <div
                    className={cn(
                      'max-w-[80%] rounded-lg p-2 text-sm',
                      msg.sender === 'user'
                        ? 'bg-green-500 text-white'
                        : 'bg-slate-100'
                    )}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          <div className="flex gap-2">
            <Input
              value={testInput}
              onChange={(e) => setTestInput(e.target.value)}
              placeholder="Digite uma mensagem..."
              onKeyDown={(e) => e.key === 'Enter' && handleSendTestMessage()}
            />
            <Button onClick={handleSendTestMessage} className="bg-green-600 hover:bg-green-700">
              Enviar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default FlowEditor;
