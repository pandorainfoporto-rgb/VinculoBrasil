// =============================================================================
// CRM Store - Estado Global do CRM (Zustand)
// =============================================================================

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
  type Lead,
  type Deal,
  type Pipeline,
  type PipelineStage,
  type Activity,
  type KanbanColumn,
  type KanbanFilters,
  type DealPriority,
  type DealStatus,
  type CreateDealDTO,
  type MoveDealDTO,
  type CreateActivityDTO,
  DEFAULT_PIPELINE_STAGES,
} from './types';

// -----------------------------------------------------------------------------
// Tipos do Store
// -----------------------------------------------------------------------------

interface CRMState {
  // Dados
  pipelines: Pipeline[];
  leads: Lead[];
  deals: Deal[];
  activities: Activity[];

  // Estado do Kanban
  selectedPipelineId: string | null;
  kanbanColumns: KanbanColumn[];
  filters: KanbanFilters;
  isLoading: boolean;
  error: string | null;

  // Seleção
  selectedDeal: Deal | null;
  selectedLead: Lead | null;
  isDealModalOpen: boolean;
  isLeadModalOpen: boolean;

  // Ações - Pipelines
  loadPipelines: () => Promise<void>;
  selectPipeline: (pipelineId: string) => void;
  createPipeline: (name: string, type: Pipeline['type']) => Pipeline;

  // Ações - Deals
  loadDeals: (pipelineId: string) => Promise<void>;
  createDeal: (dto: CreateDealDTO) => Deal;
  updateDeal: (dealId: string, updates: Partial<Deal>) => void;
  moveDeal: (dto: MoveDealDTO) => Promise<void>;
  selectDeal: (deal: Deal | null) => void;
  closeDealModal: () => void;
  deleteDeal: (dealId: string) => void;

  // Ações - Leads
  loadLeads: () => Promise<void>;
  selectLead: (lead: Lead | null) => void;
  closeLeadModal: () => void;
  updateLead: (leadId: string, updates: Partial<Lead>) => void;
  convertLeadToDeal: (leadId: string, pipelineId: string) => Deal | null;

  // Ações - Activities
  loadActivities: (dealId: string) => Promise<void>;
  createActivity: (dto: CreateActivityDTO) => Activity;

  // Ações - Filtros
  setFilters: (filters: Partial<KanbanFilters>) => void;
  clearFilters: () => void;

  // Ações - Kanban DnD
  reorderDealsInColumn: (columnId: string, dealIds: string[]) => void;
  moveDealToColumn: (dealId: string, sourceColumnId: string, destColumnId: string, destIndex: number) => void;

  // Reset
  reset: () => void;
}

// -----------------------------------------------------------------------------
// Dados Iniciais de Demonstração
// -----------------------------------------------------------------------------

const createInitialPipelines = (): Pipeline[] => {
  const now = new Date();

  // Pipeline de Inquilinos
  const inquilinoStages: PipelineStage[] = DEFAULT_PIPELINE_STAGES.map((stage, index) => ({
    ...stage,
    id: `stage_inq_${index}`,
    pipelineId: 'pipeline_inquilino',
    createdAt: now,
    updatedAt: now,
  }));

  // Pipeline de Proprietários
  const proprietarioStages: PipelineStage[] = [
    { name: 'Novo', order: 0, color: '#6366f1', probability: 10 },
    { name: 'Primeiro Contato', order: 1, color: '#8b5cf6', probability: 20 },
    { name: 'Avaliação do Imóvel', order: 2, color: '#3b82f6', probability: 40 },
    { name: 'Proposta Enviada', order: 3, color: '#0ea5e9', probability: 60 },
    { name: 'Negociação', order: 4, color: '#14b8a6', probability: 75 },
    { name: 'Documentação', order: 5, color: '#22c55e', probability: 90 },
    { name: 'Contrato Assinado', order: 6, color: '#10b981', probability: 100 },
    { name: 'Perdido', order: 7, color: '#ef4444', probability: 0 },
  ].map((stage, index) => ({
    ...stage,
    id: `stage_prop_${index}`,
    pipelineId: 'pipeline_proprietario',
    createdAt: now,
    updatedAt: now,
  }));

  return [
    {
      id: 'pipeline_inquilino',
      name: 'Funil de Inquilinos',
      description: 'Pipeline para captação e qualificação de inquilinos',
      type: 'inquilino',
      stages: inquilinoStages,
      isDefault: true,
      isActive: true,
      automations: [],
      createdAt: now,
      updatedAt: now,
      createdBy: 'system',
    },
    {
      id: 'pipeline_proprietario',
      name: 'Funil de Proprietários',
      description: 'Pipeline para captação de imóveis de proprietários',
      type: 'locador',
      stages: proprietarioStages,
      isDefault: false,
      isActive: true,
      automations: [],
      createdAt: now,
      updatedAt: now,
      createdBy: 'system',
    },
  ];
};

const createDemoDeals = (): Deal[] => {
  // Vazio para producao - deals serao criados pelos usuarios
  return [];
};

const createDemoLeads = (): Lead[] => {
  // Vazio para producao - leads serao criados pelos usuarios
  return [];
};

// -----------------------------------------------------------------------------
// Filtros Iniciais
// -----------------------------------------------------------------------------

const initialFilters: KanbanFilters = {
  search: '',
  assignedTo: [],
  priority: [],
  tags: [],
  dateRange: {
    start: null,
    end: null,
  },
};

// -----------------------------------------------------------------------------
// Store
// -----------------------------------------------------------------------------

export const useCRMStore = create<CRMState>()(
  devtools(
    (set, get) => ({
      // Estado inicial
      pipelines: [],
      leads: [],
      deals: [],
      activities: [],
      selectedPipelineId: null,
      kanbanColumns: [],
      filters: initialFilters,
      isLoading: false,
      error: null,
      selectedDeal: null,
      selectedLead: null,
      isDealModalOpen: false,
      isLeadModalOpen: false,

      // ---------------------------------------------------------------------------
      // Ações - Pipelines
      // ---------------------------------------------------------------------------

      loadPipelines: async () => {
        set({ isLoading: true, error: null });

        // Simular chamada API
        await new Promise((resolve) => setTimeout(resolve, 300));

        const pipelines = createInitialPipelines();
        const leads = createDemoLeads();
        const deals = createDemoDeals();

        set({
          pipelines,
          leads,
          deals,
          isLoading: false,
          selectedPipelineId: pipelines[0]?.id || null,
        });

        // Carregar colunas do primeiro pipeline
        if (pipelines[0]) {
          get().selectPipeline(pipelines[0].id);
        }
      },

      selectPipeline: (pipelineId: string) => {
        const { pipelines, deals, filters } = get();
        const pipeline = pipelines.find((p) => p.id === pipelineId);

        if (!pipeline) return;

        // Filtrar deals deste pipeline
        let pipelineDeals = deals.filter((d) => d.pipelineId === pipelineId);

        // Aplicar filtros
        if (filters.search) {
          const search = filters.search.toLowerCase();
          pipelineDeals = pipelineDeals.filter(
            (d) =>
              d.title.toLowerCase().includes(search) ||
              d.tags.some((t) => t.toLowerCase().includes(search))
          );
        }

        if (filters.priority.length > 0) {
          pipelineDeals = pipelineDeals.filter((d) =>
            filters.priority.includes(d.priority)
          );
        }

        if (filters.tags.length > 0) {
          pipelineDeals = pipelineDeals.filter((d) =>
            d.tags.some((t) => filters.tags.includes(t))
          );
        }

        // Criar colunas do Kanban
        const columns: KanbanColumn[] = pipeline.stages
          .sort((a, b) => a.order - b.order)
          .map((stage) => ({
            stage,
            deals: pipelineDeals.filter((d) => d.stageId === stage.id),
            isCollapsed: false,
          }));

        set({
          selectedPipelineId: pipelineId,
          kanbanColumns: columns,
        });
      },

      createPipeline: (name: string, type: Pipeline['type']) => {
        const now = new Date();
        const id = `pipeline_${Date.now()}`;

        const stages: PipelineStage[] = DEFAULT_PIPELINE_STAGES.map((stage, index) => ({
          ...stage,
          id: `stage_${id}_${index}`,
          pipelineId: id,
          createdAt: now,
          updatedAt: now,
        }));

        const pipeline: Pipeline = {
          id,
          name,
          type,
          stages,
          isDefault: false,
          isActive: true,
          automations: [],
          createdAt: now,
          updatedAt: now,
          createdBy: 'user',
        };

        set((state) => ({
          pipelines: [...state.pipelines, pipeline],
        }));

        return pipeline;
      },

      // ---------------------------------------------------------------------------
      // Ações - Deals
      // ---------------------------------------------------------------------------

      loadDeals: async (pipelineId: string) => {
        set({ isLoading: true });

        // Simular chamada API
        await new Promise((resolve) => setTimeout(resolve, 200));

        get().selectPipeline(pipelineId);
        set({ isLoading: false });
      },

      createDeal: (dto: CreateDealDTO) => {
        const now = new Date();
        const deal: Deal = {
          id: `deal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          leadId: dto.leadId,
          pipelineId: dto.pipelineId,
          stageId: dto.stageId,
          title: dto.title,
          valorAluguel: dto.valorAluguel,
          valorCondominio: dto.valorCondominio,
          valorIPTU: dto.valorIPTU,
          valorTotal:
            dto.valorAluguel + (dto.valorCondominio || 0) + (dto.valorIPTU || 0),
          propertyId: dto.propertyId,
          status: 'aberto',
          priority: dto.priority || 'media',
          probability: 10,
          assignedTo: dto.assignedTo,
          expectedCloseDate: dto.expectedCloseDate,
          activityCount: 0,
          tags: dto.tags || [],
          createdAt: now,
          updatedAt: now,
          movedAt: now,
        };

        set((state) => ({
          deals: [...state.deals, deal],
        }));

        // Atualizar Kanban
        get().selectPipeline(dto.pipelineId);

        return deal;
      },

      updateDeal: (dealId: string, updates: Partial<Deal>) => {
        set((state) => ({
          deals: state.deals.map((d) =>
            d.id === dealId ? { ...d, ...updates, updatedAt: new Date() } : d
          ),
        }));

        // Atualizar Kanban se necessário
        const { selectedPipelineId } = get();
        if (selectedPipelineId) {
          get().selectPipeline(selectedPipelineId);
        }
      },

      moveDeal: async (dto: MoveDealDTO) => {
        const { deals, pipelines, selectedPipelineId } = get();
        const deal = deals.find((d) => d.id === dto.dealId);
        const pipeline = pipelines.find((p) => p.id === selectedPipelineId);

        if (!deal || !pipeline) return;

        const targetStage = pipeline.stages.find((s) => s.id === dto.targetStageId);
        if (!targetStage) return;

        // Atualizar deal
        const now = new Date();
        const updates: Partial<Deal> = {
          stageId: dto.targetStageId,
          probability: targetStage.probability,
          movedAt: now,
          updatedAt: now,
        };

        // Atualizar status baseado no estágio
        if (targetStage.name.toLowerCase().includes('ganho')) {
          updates.status = 'ganho';
          updates.closedAt = now;
        } else if (targetStage.name.toLowerCase().includes('perdido')) {
          updates.status = 'perdido';
          updates.closedAt = now;
          updates.lostReason = dto.note;
        } else if (targetStage.name.toLowerCase().includes('documento')) {
          updates.status = 'documentacao';
        } else if (targetStage.name.toLowerCase().includes('contrato')) {
          updates.status = 'contrato';
        } else if (targetStage.probability > 30) {
          updates.status = 'em_negociacao';
        }

        set((state) => ({
          deals: state.deals.map((d) =>
            d.id === dto.dealId ? { ...d, ...updates } : d
          ),
        }));

        // Criar atividade de movimentação
        get().createActivity({
          dealId: dto.dealId,
          type: 'sistema',
          title: `Movido para ${targetStage.name}`,
          description: dto.note,
        });

        // Atualizar Kanban
        if (selectedPipelineId) {
          get().selectPipeline(selectedPipelineId);
        }

        console.log('[CRM Store] Deal moved:', dto.dealId, '->', dto.targetStageId);
      },

      selectDeal: (deal: Deal | null) => {
        set({
          selectedDeal: deal,
          isDealModalOpen: deal !== null,
        });
      },

      closeDealModal: () => {
        set({
          selectedDeal: null,
          isDealModalOpen: false,
        });
      },

      deleteDeal: (dealId: string) => {
        set((state) => ({
          deals: state.deals.filter((d) => d.id !== dealId),
        }));

        const { selectedPipelineId } = get();
        if (selectedPipelineId) {
          get().selectPipeline(selectedPipelineId);
        }
      },

      // ---------------------------------------------------------------------------
      // Ações - Leads
      // ---------------------------------------------------------------------------

      loadLeads: async () => {
        set({ isLoading: true });
        await new Promise((resolve) => setTimeout(resolve, 200));
        set({ isLoading: false });
      },

      selectLead: (lead: Lead | null) => {
        set({
          selectedLead: lead,
          isLeadModalOpen: lead !== null,
        });
      },

      closeLeadModal: () => {
        set({
          selectedLead: null,
          isLeadModalOpen: false,
        });
      },

      updateLead: (leadId: string, updates: Partial<Lead>) => {
        set((state) => ({
          leads: state.leads.map((l) =>
            l.id === leadId ? { ...l, ...updates, updatedAt: new Date() } : l
          ),
        }));
      },

      convertLeadToDeal: (leadId: string, pipelineId: string) => {
        const { leads, pipelines } = get();
        const lead = leads.find((l) => l.id === leadId);
        const pipeline = pipelines.find((p) => p.id === pipelineId);

        if (!lead || !pipeline) return null;

        const firstStage = pipeline.stages.find((s) => s.order === 0);
        if (!firstStage) return null;

        const deal = get().createDeal({
          leadId,
          pipelineId,
          stageId: firstStage.id,
          title: `${lead.nome} - ${lead.interesseImovel || 'Novo Negócio'}`,
          valorAluguel: lead.valorMaximo || 0,
          tags: lead.tags,
        });

        // Atualizar status do lead
        get().updateLead(leadId, { status: 'convertido' });

        return deal;
      },

      // ---------------------------------------------------------------------------
      // Ações - Activities
      // ---------------------------------------------------------------------------

      loadActivities: async (dealId: string) => {
        // Em produção, chamaria a API
        await new Promise((resolve) => setTimeout(resolve, 100));
      },

      createActivity: (dto: CreateActivityDTO) => {
        const now = new Date();
        const activity: Activity = {
          id: `act_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          dealId: dto.dealId,
          leadId: dto.leadId,
          type: dto.type,
          title: dto.title,
          description: dto.description,
          scheduledAt: dto.scheduledAt,
          metadata: dto.metadata,
          createdBy: 'user',
          isAutomatic: false,
          createdAt: now,
        };

        set((state) => ({
          activities: [...state.activities, activity],
        }));

        // Atualizar contador do deal
        if (dto.dealId) {
          get().updateDeal(dto.dealId, {
            activityCount:
              (get().deals.find((d) => d.id === dto.dealId)?.activityCount || 0) + 1,
            lastActivityAt: now,
          });
        }

        return activity;
      },

      // ---------------------------------------------------------------------------
      // Ações - Filtros
      // ---------------------------------------------------------------------------

      setFilters: (filters: Partial<KanbanFilters>) => {
        set((state) => ({
          filters: { ...state.filters, ...filters },
        }));

        // Re-aplicar filtros
        const { selectedPipelineId } = get();
        if (selectedPipelineId) {
          get().selectPipeline(selectedPipelineId);
        }
      },

      clearFilters: () => {
        set({ filters: initialFilters });

        const { selectedPipelineId } = get();
        if (selectedPipelineId) {
          get().selectPipeline(selectedPipelineId);
        }
      },

      // ---------------------------------------------------------------------------
      // Ações - Kanban DnD
      // ---------------------------------------------------------------------------

      reorderDealsInColumn: (columnId: string, dealIds: string[]) => {
        set((state) => ({
          kanbanColumns: state.kanbanColumns.map((col) =>
            col.stage.id === columnId
              ? {
                  ...col,
                  deals: dealIds
                    .map((id) => col.deals.find((d) => d.id === id))
                    .filter((d): d is Deal => d !== undefined),
                }
              : col
          ),
        }));
      },

      moveDealToColumn: (
        dealId: string,
        sourceColumnId: string,
        destColumnId: string,
        destIndex: number
      ) => {
        // Chamar moveDeal para atualizar o deal no backend
        get().moveDeal({ dealId, targetStageId: destColumnId });
      },

      // ---------------------------------------------------------------------------
      // Reset
      // ---------------------------------------------------------------------------

      reset: () => {
        set({
          pipelines: [],
          leads: [],
          deals: [],
          activities: [],
          selectedPipelineId: null,
          kanbanColumns: [],
          filters: initialFilters,
          isLoading: false,
          error: null,
          selectedDeal: null,
          selectedLead: null,
          isDealModalOpen: false,
          isLeadModalOpen: false,
        });
      },
    }),
    { name: 'crm-store' }
  )
);
