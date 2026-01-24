/**
 * FlowBuilder - Editor Visual de Fluxos (Estilo Typebot/n8n)
 */

import { useCallback, useRef, useMemo, type DragEvent } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Panel,
  useReactFlow,
  type ReactFlowInstance,
  BackgroundVariant,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Save,
  Undo,
  Redo,
  Play,
  Download,
  Upload,
  Settings,
  Maximize,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';

import { nodeTypes } from './nodes';
import { Sidebar } from './sidebar';
import { PropertiesPanel } from './properties-panel';
import { useFlowBuilderStore } from './store';
import type { FlowNodeType, Flow } from './types';

interface FlowBuilderProps {
  initialFlow?: Flow;
  onSave?: (flow: Flow) => void;
}

export function FlowBuilder({ initialFlow, onSave }: FlowBuilderProps) {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const reactFlowInstance = useRef<ReactFlowInstance | null>(null);

  const {
    nodes,
    edges,
    selectedNodeId,
    isPanelOpen,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    selectNode,
    setFlow,
    exportFlow,
    undo,
    redo,
    history,
    historyIndex,
  } = useFlowBuilderStore();

  // Inicializar com fluxo inicial
  useMemo(() => {
    if (initialFlow) {
      setFlow(initialFlow);
    } else {
      // Criar fluxo padrão
      const defaultFlow: Flow = {
        id: `flow-${Date.now()}`,
        name: 'Novo Fluxo',
        description: '',
        isActive: false,
        isDefault: false,
        triggerType: 'new_conversation',
        nodes: [
          {
            id: 'start-1',
            type: 'start',
            position: { x: 250, y: 100 },
            data: {
              label: 'Início',
              triggerType: 'new_conversation',
            },
          },
        ],
        edges: [],
        variables: [],
        version: 1,
        createdBy: 'admin',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setFlow(defaultFlow);
    }
  }, [initialFlow, setFlow]);

  // Handlers
  const onDragOver = useCallback((event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: DragEvent<HTMLDivElement>) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow') as FlowNodeType;
      if (!type || !reactFlowInstance.current) return;

      const position = reactFlowInstance.current.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      addNode(type, position);
    },
    [addNode]
  );

  const onInit = useCallback((instance: ReactFlowInstance) => {
    reactFlowInstance.current = instance;
  }, []);

  const handleSave = useCallback(() => {
    const flow = exportFlow();
    if (flow && onSave) {
      onSave(flow);
    }
    console.log('Flow saved:', flow);
  }, [exportFlow, onSave]);

  const handleExportJson = useCallback(() => {
    const flow = exportFlow();
    if (flow) {
      const blob = new Blob([JSON.stringify(flow, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${flow.name.replace(/\s+/g, '_')}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  }, [exportFlow]);

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  return (
    <div className="h-full flex bg-slate-100">
      {/* Sidebar com componentes arrastáveis */}
      <Sidebar />

      {/* Canvas principal */}
      <div className="flex-1 flex flex-col" ref={reactFlowWrapper}>
        {/* Toolbar */}
        <div className="h-14 bg-white border-b px-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <Input
              defaultValue={initialFlow?.name || 'Novo Fluxo'}
              className="w-48 font-semibold border-0 shadow-none focus-visible:ring-0 text-slate-800"
            />
            <Badge variant="outline" className="text-xs">
              v{initialFlow?.version || 1}
            </Badge>
            <Badge className="bg-yellow-500/10 text-yellow-700 border-yellow-300">
              Rascunho
            </Badge>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={undo}
              disabled={!canUndo}
              title="Desfazer (Ctrl+Z)"
            >
              <Undo className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={redo}
              disabled={!canRedo}
              title="Refazer (Ctrl+Y)"
            >
              <Redo className="h-4 w-4" />
            </Button>

            <Separator orientation="vertical" className="h-6 mx-2" />

            <Button
              variant="ghost"
              size="sm"
              onClick={handleExportJson}
              title="Exportar JSON"
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" title="Importar JSON">
              <Upload className="h-4 w-4" />
            </Button>

            <Separator orientation="vertical" className="h-6 mx-2" />

            <Button
              variant="outline"
              size="sm"
              className="text-blue-600 border-blue-200 hover:bg-blue-50"
            >
              <Play className="h-4 w-4 mr-1" />
              Testar
            </Button>

            <Button
              size="sm"
              onClick={handleSave}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Save className="h-4 w-4 mr-1" />
              Salvar
            </Button>
          </div>
        </div>

        {/* React Flow Canvas */}
        <div className="flex-1 relative">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onInit={onInit}
            onDrop={onDrop}
            onDragOver={onDragOver}
            onPaneClick={() => selectNode(null)}
            nodeTypes={nodeTypes}
            fitView
            snapToGrid
            snapGrid={[15, 15]}
            defaultEdgeOptions={{
              animated: true,
              style: { stroke: '#22c55e', strokeWidth: 2 },
            }}
            connectionLineStyle={{ stroke: '#22c55e', strokeWidth: 2 }}
            proOptions={{ hideAttribution: true }}
          >
            <Background
              variant={BackgroundVariant.Dots}
              gap={20}
              size={1}
              color="#cbd5e1"
            />
            <Controls
              showZoom={false}
              showFitView={false}
              showInteractive={false}
              className="!bg-white !border !border-slate-200 !shadow-lg !rounded-lg"
            />
            <MiniMap
              nodeColor={(node) => {
                const colorMap: Record<string, string> = {
                  start: '#10b981',
                  message: '#3b82f6',
                  input: '#a855f7',
                  menu: '#f59e0b',
                  condition: '#f97316',
                  ai_agent: '#8b5cf6',
                  handoff: '#06b6d4',
                  webhook: '#475569',
                  delay: '#6b7280',
                  tag: '#ec4899',
                  variable: '#14b8a6',
                  identify_contract: '#6366f1',
                  client_tag: '#f43f5e',
                  end: '#ef4444',
                };
                return colorMap[node.type || ''] || '#94a3b8';
              }}
              maskColor="rgba(0, 0, 0, 0.1)"
              className="!bg-white !border !border-slate-200 !shadow-lg !rounded-lg"
            />

            {/* Panel de zoom customizado */}
            <Panel position="bottom-left" className="flex gap-1">
              <Button
                variant="outline"
                size="sm"
                className="bg-white"
                onClick={() => reactFlowInstance.current?.zoomOut()}
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="bg-white"
                onClick={() => reactFlowInstance.current?.zoomIn()}
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="bg-white"
                onClick={() => reactFlowInstance.current?.fitView()}
              >
                <Maximize className="h-4 w-4" />
              </Button>
            </Panel>

            {/* Instruções quando vazio */}
            {nodes.length === 0 && (
              <Panel position="top-center" className="mt-20">
                <div className="text-center p-8 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border">
                  <div className="text-4xl mb-4">🎨</div>
                  <h3 className="font-semibold text-slate-800 mb-2">
                    Comece seu fluxo
                  </h3>
                  <p className="text-sm text-slate-500 max-w-xs">
                    Arraste um componente "Início" da barra lateral para começar
                    a desenhar seu fluxo de atendimento.
                  </p>
                </div>
              </Panel>
            )}
          </ReactFlow>
        </div>
      </div>

      {/* Properties Panel */}
      {isPanelOpen && selectedNodeId && <PropertiesPanel />}
    </div>
  );
}

// Wrapper com ReactFlowProvider
import { ReactFlowProvider } from '@xyflow/react';

export function FlowBuilderWithProvider(props: FlowBuilderProps) {
  return (
    <ReactFlowProvider>
      <FlowBuilder {...props} />
    </ReactFlowProvider>
  );
}

export default FlowBuilderWithProvider;
