// =============================================================================
// Vínculo Engage - Zustand Store
// =============================================================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  type MarketingCampaign,
  type MessageTemplate,
  type AudienceSegment,
  type SmtpConfig,
  type CommunicationRule,
  type CampaignMessage,
  type QueueStats,
  type EngageDashboardStats,
  type CampaignStatus,
  type ChannelType,
} from './types';

// -----------------------------------------------------------------------------
// Interface da Store
// -----------------------------------------------------------------------------

interface EngageState {
  // Campanhas
  campaigns: MarketingCampaign[];
  selectedCampaign: MarketingCampaign | null;
  campaignFilter: {
    status?: CampaignStatus;
    channel?: ChannelType;
    search: string;
  };

  // Templates
  templates: MessageTemplate[];
  selectedTemplate: MessageTemplate | null;

  // Segmentos
  segments: AudienceSegment[];
  selectedSegment: AudienceSegment | null;

  // Configurações SMTP
  smtpConfigs: SmtpConfig[];
  selectedSmtpConfig: SmtpConfig | null;

  // Réguas de Comunicação
  communicationRules: CommunicationRule[];
  selectedRule: CommunicationRule | null;

  // Mensagens de Campanha
  campaignMessages: CampaignMessage[];

  // Estatísticas
  dashboardStats: EngageDashboardStats | null;
  queueStats: QueueStats | null;

  // UI State
  isLoading: boolean;
  activeTab: 'dashboard' | 'campaigns' | 'templates' | 'segments' | 'rules' | 'smtp' | 'queue';

  // Actions - Campanhas
  addCampaign: (campaign: MarketingCampaign) => void;
  updateCampaign: (id: string, updates: Partial<MarketingCampaign>) => void;
  deleteCampaign: (id: string) => void;
  selectCampaign: (campaign: MarketingCampaign | null) => void;
  setCampaignFilter: (filter: Partial<EngageState['campaignFilter']>) => void;
  updateCampaignStatus: (id: string, status: CampaignStatus) => void;

  // Actions - Templates
  addTemplate: (template: MessageTemplate) => void;
  updateTemplate: (id: string, updates: Partial<MessageTemplate>) => void;
  deleteTemplate: (id: string) => void;
  selectTemplate: (template: MessageTemplate | null) => void;

  // Actions - Segmentos
  addSegment: (segment: AudienceSegment) => void;
  updateSegment: (id: string, updates: Partial<AudienceSegment>) => void;
  deleteSegment: (id: string) => void;
  selectSegment: (segment: AudienceSegment | null) => void;

  // Actions - SMTP
  addSmtpConfig: (config: SmtpConfig) => void;
  updateSmtpConfig: (id: string, updates: Partial<SmtpConfig>) => void;
  deleteSmtpConfig: (id: string) => void;
  selectSmtpConfig: (config: SmtpConfig | null) => void;
  setDefaultSmtpConfig: (id: string) => void;

  // Actions - Réguas
  addCommunicationRule: (rule: CommunicationRule) => void;
  updateCommunicationRule: (id: string, updates: Partial<CommunicationRule>) => void;
  deleteCommunicationRule: (id: string) => void;
  selectCommunicationRule: (rule: CommunicationRule | null) => void;

  // Actions - Mensagens
  setCampaignMessages: (messages: CampaignMessage[]) => void;

  // Actions - Stats
  setDashboardStats: (stats: EngageDashboardStats) => void;
  setQueueStats: (stats: QueueStats) => void;

  // Actions - UI
  setLoading: (loading: boolean) => void;
  setActiveTab: (tab: EngageState['activeTab']) => void;

  // Helpers
  getFilteredCampaigns: () => MarketingCampaign[];
  getTemplatesByChannel: (channel: ChannelType) => MessageTemplate[];
  getDefaultSmtpConfig: () => SmtpConfig | undefined;
}

// -----------------------------------------------------------------------------
// Dados Iniciais - ZERADOS PARA PRODUCAO
// Os dados reais virao do backend
// -----------------------------------------------------------------------------

const initialTemplates: MessageTemplate[] = [];

const initialSegments: AudienceSegment[] = [];

const initialCampaigns: MarketingCampaign[] = [];

const initialSmtpConfigs: SmtpConfig[] = [];

const initialDashboardStats: EngageDashboardStats = {
  totalCampaigns: 0,
  activeCampaigns: 0,
  totalSent: 0,
  totalDelivered: 0,
  deliveryRate: 0,
  openRate: 0,
  clickRate: 0,
  bounceRate: 0,
  emailStats: {
    sent: 0,
    delivered: 0,
    opened: 0,
    clicked: 0,
  },
  whatsappStats: {
    sent: 0,
    delivered: 0,
    read: 0,
    replied: 0,
  },
  dailyStats: [],
  recentCampaigns: [],
  queueStats: {
    waiting: 0,
    active: 0,
    completed: 0,
    failed: 0,
    delayed: 0,
    paused: false,
  },
};

// -----------------------------------------------------------------------------
// Criação da Store
// -----------------------------------------------------------------------------

export const useEngageStore = create<EngageState>()(
  persist(
    (set, get) => ({
      // Estado Inicial
      campaigns: initialCampaigns,
      selectedCampaign: null,
      campaignFilter: { search: '' },
      templates: initialTemplates,
      selectedTemplate: null,
      segments: initialSegments,
      selectedSegment: null,
      smtpConfigs: initialSmtpConfigs,
      selectedSmtpConfig: null,
      communicationRules: [],
      selectedRule: null,
      campaignMessages: [],
      dashboardStats: initialDashboardStats,
      queueStats: initialDashboardStats.queueStats,
      isLoading: false,
      activeTab: 'dashboard',

      // Actions - Campanhas
      addCampaign: (campaign) =>
        set((state) => ({
          campaigns: [campaign, ...state.campaigns],
        })),

      updateCampaign: (id, updates) =>
        set((state) => ({
          campaigns: state.campaigns.map((c) =>
            c.id === id ? { ...c, ...updates, updatedAt: new Date() } : c
          ),
          selectedCampaign:
            state.selectedCampaign?.id === id
              ? { ...state.selectedCampaign, ...updates, updatedAt: new Date() }
              : state.selectedCampaign,
        })),

      deleteCampaign: (id) =>
        set((state) => ({
          campaigns: state.campaigns.filter((c) => c.id !== id),
          selectedCampaign:
            state.selectedCampaign?.id === id ? null : state.selectedCampaign,
        })),

      selectCampaign: (campaign) => set({ selectedCampaign: campaign }),

      setCampaignFilter: (filter) =>
        set((state) => ({
          campaignFilter: { ...state.campaignFilter, ...filter },
        })),

      updateCampaignStatus: (id, status) =>
        set((state) => ({
          campaigns: state.campaigns.map((c) =>
            c.id === id ? { ...c, status, updatedAt: new Date() } : c
          ),
        })),

      // Actions - Templates
      addTemplate: (template) =>
        set((state) => ({
          templates: [template, ...state.templates],
        })),

      updateTemplate: (id, updates) =>
        set((state) => ({
          templates: state.templates.map((t) =>
            t.id === id ? { ...t, ...updates, updatedAt: new Date() } : t
          ),
          selectedTemplate:
            state.selectedTemplate?.id === id
              ? { ...state.selectedTemplate, ...updates, updatedAt: new Date() }
              : state.selectedTemplate,
        })),

      deleteTemplate: (id) =>
        set((state) => ({
          templates: state.templates.filter((t) => t.id !== id),
          selectedTemplate:
            state.selectedTemplate?.id === id ? null : state.selectedTemplate,
        })),

      selectTemplate: (template) => set({ selectedTemplate: template }),

      // Actions - Segmentos
      addSegment: (segment) =>
        set((state) => ({
          segments: [segment, ...state.segments],
        })),

      updateSegment: (id, updates) =>
        set((state) => ({
          segments: state.segments.map((s) =>
            s.id === id ? { ...s, ...updates, updatedAt: new Date() } : s
          ),
          selectedSegment:
            state.selectedSegment?.id === id
              ? { ...state.selectedSegment, ...updates, updatedAt: new Date() }
              : state.selectedSegment,
        })),

      deleteSegment: (id) =>
        set((state) => ({
          segments: state.segments.filter((s) => s.id !== id),
          selectedSegment:
            state.selectedSegment?.id === id ? null : state.selectedSegment,
        })),

      selectSegment: (segment) => set({ selectedSegment: segment }),

      // Actions - SMTP
      addSmtpConfig: (config) =>
        set((state) => ({
          smtpConfigs: [config, ...state.smtpConfigs],
        })),

      updateSmtpConfig: (id, updates) =>
        set((state) => ({
          smtpConfigs: state.smtpConfigs.map((s) =>
            s.id === id ? { ...s, ...updates, updatedAt: new Date() } : s
          ),
          selectedSmtpConfig:
            state.selectedSmtpConfig?.id === id
              ? { ...state.selectedSmtpConfig, ...updates, updatedAt: new Date() }
              : state.selectedSmtpConfig,
        })),

      deleteSmtpConfig: (id) =>
        set((state) => ({
          smtpConfigs: state.smtpConfigs.filter((s) => s.id !== id),
          selectedSmtpConfig:
            state.selectedSmtpConfig?.id === id ? null : state.selectedSmtpConfig,
        })),

      selectSmtpConfig: (config) => set({ selectedSmtpConfig: config }),

      setDefaultSmtpConfig: (id) =>
        set((state) => ({
          smtpConfigs: state.smtpConfigs.map((s) => ({
            ...s,
            isDefault: s.id === id,
          })),
        })),

      // Actions - Réguas
      addCommunicationRule: (rule) =>
        set((state) => ({
          communicationRules: [rule, ...state.communicationRules],
        })),

      updateCommunicationRule: (id, updates) =>
        set((state) => ({
          communicationRules: state.communicationRules.map((r) =>
            r.id === id ? { ...r, ...updates, updatedAt: new Date() } : r
          ),
          selectedRule:
            state.selectedRule?.id === id
              ? { ...state.selectedRule, ...updates, updatedAt: new Date() }
              : state.selectedRule,
        })),

      deleteCommunicationRule: (id) =>
        set((state) => ({
          communicationRules: state.communicationRules.filter((r) => r.id !== id),
          selectedRule:
            state.selectedRule?.id === id ? null : state.selectedRule,
        })),

      selectCommunicationRule: (rule) => set({ selectedRule: rule }),

      // Actions - Mensagens
      setCampaignMessages: (messages) => set({ campaignMessages: messages }),

      // Actions - Stats
      setDashboardStats: (stats) => set({ dashboardStats: stats }),
      setQueueStats: (stats) => set({ queueStats: stats }),

      // Actions - UI
      setLoading: (loading) => set({ isLoading: loading }),
      setActiveTab: (tab) => set({ activeTab: tab }),

      // Helpers
      getFilteredCampaigns: () => {
        const { campaigns, campaignFilter } = get();
        return campaigns.filter((c) => {
          if (campaignFilter.status && c.status !== campaignFilter.status) return false;
          if (campaignFilter.channel && c.channel !== campaignFilter.channel) return false;
          if (
            campaignFilter.search &&
            !c.name.toLowerCase().includes(campaignFilter.search.toLowerCase())
          )
            return false;
          return true;
        });
      },

      getTemplatesByChannel: (channel) => {
        return get().templates.filter((t) => t.channel === channel && t.isActive);
      },

      getDefaultSmtpConfig: () => {
        return get().smtpConfigs.find((s) => s.isDefault && s.isActive);
      },
    }),
    {
      name: 'vinculo-engage-storage',
      partialize: (state) => ({
        campaigns: state.campaigns,
        templates: state.templates,
        segments: state.segments,
        smtpConfigs: state.smtpConfigs,
        communicationRules: state.communicationRules,
      }),
    }
  )
);
