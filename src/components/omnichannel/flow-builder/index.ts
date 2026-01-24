/**
 * Flow Builder - Editor Visual de Fluxos
 *
 * Componentes principais para o editor de fluxos estilo Typebot/n8n
 */

export { FlowBuilderWithProvider as FlowBuilder, FlowBuilderWithProvider as default } from './flow-builder';
export { Sidebar } from './sidebar';
export { PropertiesPanel } from './properties-panel';
export { nodeTypes } from './nodes';
export { useFlowBuilderStore } from './store';
export { FlowEngine, runFlow } from './engine';

// Types
export type {
  FlowNodeType,
  FlowNode,
  FlowEdge,
  Flow,
  FlowVariable,
  CustomNodeData,
  FlowExecutionContext,
  NodeExecutionResult,
} from './types';
