/**
 * Flow Builder Store - Gerenciamento de estado com Zustand
 */

import { create } from 'zustand';
import {
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  type Connection,
  type NodeChange,
  type EdgeChange,
} from '@xyflow/react';
import type { FlowNode, FlowEdge, Flow, FlowVariable, CustomNodeData, FlowNodeType } from './types';

interface FlowBuilderState {
  // Estado do fluxo
  flow: Flow | null;
  nodes: FlowNode[];
  edges: FlowEdge[];
  variables: FlowVariable[];

  // Estado do editor
  selectedNodeId: string | null;
  isTestMode: boolean;
  zoom: number;
  isPanelOpen: boolean;

  // Histórico para undo/redo
  history: { nodes: FlowNode[]; edges: FlowEdge[] }[];
  historyIndex: number;

  // Ações do fluxo
  setFlow: (flow: Flow) => void;
  setNodes: (nodes: FlowNode[]) => void;
  setEdges: (edges: FlowEdge[]) => void;
  onNodesChange: (changes: NodeChange<FlowNode>[]) => void;
  onEdgesChange: (changes: EdgeChange<FlowEdge>[]) => void;
  onConnect: (connection: Connection) => void;

  // Ações de nós
  addNode: (type: FlowNodeType, position: { x: number; y: number }, data?: Partial<CustomNodeData>) => void;
  updateNodeData: (nodeId: string, data: Partial<CustomNodeData>) => void;
  deleteNode: (nodeId: string) => void;
  duplicateNode: (nodeId: string) => void;

  // Ações do editor
  selectNode: (nodeId: string | null) => void;
  setTestMode: (isTestMode: boolean) => void;
  setZoom: (zoom: number) => void;
  setPanelOpen: (isOpen: boolean) => void;

  // Variáveis
  addVariable: (variable: FlowVariable) => void;
  updateVariable: (name: string, variable: Partial<FlowVariable>) => void;
  deleteVariable: (name: string) => void;

  // Histórico
  undo: () => void;
  redo: () => void;
  saveToHistory: () => void;

  // Persistência
  exportFlow: () => Flow | null;
  importFlow: (flow: Flow) => void;
}

// Labels padrão para cada tipo de nó
const defaultLabels: Record<FlowNodeType, string> = {
  start: 'Início',
  message: 'Mensagem',
  input: 'Entrada',
  menu: 'Menu',
  condition: 'Condição',
  ai_agent: 'Agente IA',
  welcome_ai: 'IA Boas-Vindas',
  handoff: 'Transferir',
  webhook: 'Webhook',
  delay: 'Aguardar',
  tag: 'Tag',
  variable: 'Variável',
  identify_contract: 'Identificar Contrato',
  client_tag: 'Tag Cliente',
  lead_capture: 'Capturar Lead',
  end: 'Fim',
};

export const useFlowBuilderStore = create<FlowBuilderState>((set, get) => ({
  // Estado inicial
  flow: null,
  nodes: [],
  edges: [],
  variables: [],
  selectedNodeId: null,
  isTestMode: false,
  zoom: 1,
  isPanelOpen: true,
  history: [],
  historyIndex: -1,

  // Ações do fluxo
  setFlow: (flow) => {
    set({
      flow,
      nodes: flow.nodes,
      edges: flow.edges,
      variables: flow.variables,
      history: [{ nodes: flow.nodes, edges: flow.edges }],
      historyIndex: 0,
    });
  },

  setNodes: (nodes) => set({ nodes }),

  setEdges: (edges) => set({ edges }),

  onNodesChange: (changes) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes) as FlowNode[],
    });
  },

  onEdgesChange: (changes) => {
    set({
      edges: applyEdgeChanges(changes, get().edges) as FlowEdge[],
    });
  },

  onConnect: (connection) => {
    set({
      edges: addEdge(
        { ...connection, animated: true },
        get().edges
      ) as FlowEdge[],
    });
    get().saveToHistory();
  },

  // Ações de nós
  addNode: (type, position, data) => {
    const id = `node-${Date.now()}`;
    const newNode: FlowNode = {
      id,
      type,
      position,
      data: {
        label: defaultLabels[type],
        ...data,
      } as CustomNodeData & Record<string, unknown>,
    };

    set({
      nodes: [...get().nodes, newNode],
      selectedNodeId: id,
      isPanelOpen: true,
    });
    get().saveToHistory();
  },

  updateNodeData: (nodeId, data) => {
    set({
      nodes: get().nodes.map((node) =>
        node.id === nodeId
          ? { ...node, data: { ...node.data, ...data } as CustomNodeData & Record<string, unknown> }
          : node
      ),
    });
  },

  deleteNode: (nodeId) => {
    set({
      nodes: get().nodes.filter((n) => n.id !== nodeId),
      edges: get().edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
      selectedNodeId: get().selectedNodeId === nodeId ? null : get().selectedNodeId,
    });
    get().saveToHistory();
  },

  duplicateNode: (nodeId) => {
    const node = get().nodes.find((n) => n.id === nodeId);
    if (!node) return;

    const id = `node-${Date.now()}`;
    const newNode: FlowNode = {
      ...node,
      id,
      position: {
        x: node.position.x + 50,
        y: node.position.y + 50,
      },
    };

    set({
      nodes: [...get().nodes, newNode],
      selectedNodeId: id,
    });
    get().saveToHistory();
  },

  // Ações do editor
  selectNode: (nodeId) => set({ selectedNodeId: nodeId, isPanelOpen: nodeId !== null }),

  setTestMode: (isTestMode) => set({ isTestMode }),

  setZoom: (zoom) => set({ zoom: Math.max(0.25, Math.min(2, zoom)) }),

  setPanelOpen: (isOpen) => set({ isPanelOpen: isOpen }),

  // Variáveis
  addVariable: (variable) => {
    set({ variables: [...get().variables, variable] });
  },

  updateVariable: (name, variable) => {
    set({
      variables: get().variables.map((v) =>
        v.name === name ? { ...v, ...variable } : v
      ),
    });
  },

  deleteVariable: (name) => {
    set({ variables: get().variables.filter((v) => v.name !== name) });
  },

  // Histórico
  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      const state = history[newIndex];
      set({
        nodes: state.nodes,
        edges: state.edges,
        historyIndex: newIndex,
      });
    }
  },

  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      const state = history[newIndex];
      set({
        nodes: state.nodes,
        edges: state.edges,
        historyIndex: newIndex,
      });
    }
  },

  saveToHistory: () => {
    const { nodes, edges, history, historyIndex } = get();
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push({ nodes: [...nodes], edges: [...edges] });

    // Limitar histórico a 50 estados
    if (newHistory.length > 50) {
      newHistory.shift();
    }

    set({
      history: newHistory,
      historyIndex: newHistory.length - 1,
    });
  },

  // Persistência
  exportFlow: () => {
    const { flow, nodes, edges, variables } = get();
    if (!flow) return null;

    return {
      ...flow,
      nodes,
      edges,
      variables,
      updatedAt: new Date(),
    };
  },

  importFlow: (flow) => {
    get().setFlow(flow);
  },
}));
