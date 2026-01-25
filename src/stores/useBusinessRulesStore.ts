import { create } from "zustand";
import { persist } from "zustand/middleware";

// ============================================================
// BUSINESS ENGINE - ZERO HARDCODING
// Todas as regras de negócio são configuráveis via Store
// Simula busca do banco de dados
// ============================================================

export interface SplitRates {
  platform: number;    // Taxa da plataforma Vínculo
  insurer: number;     // Taxa da seguradora
  guarantor: number;   // Taxa do garantidor
  landlord: number;    // Percentual do proprietário
}

export interface SetupFees {
  residential: number;
  commercial: number;
  industrial: number;
  rural: number;
}

export interface CashbackRules {
  onTimePayment: number;      // Cashback por pagamento em dia
  referralBonus: number;      // Bônus por indicação
  loyaltyMultiplier: number;  // Multiplicador de fidelidade
  maxMonthlyReward: number;   // Máximo de cashback mensal
}

export interface AnticipationRules {
  minMonths: number;          // Mínimo de meses para antecipar
  maxMonths: number;          // Máximo de meses para antecipar
  discountRate: number;       // Taxa de desconto para antecipação
  platformFee: number;        // Taxa da plataforma na antecipação
}

export interface InvestorRules {
  minInvestment: number;      // Investimento mínimo
  maxInvestment: number;      // Investimento máximo por ativo
  annualYield: number;        // Rendimento anual estimado
  lockPeriodDays: number;     // Período de lock após compra
}

export interface AgencyCommissionRules {
  agencyCommissionRate: number;     // Taxa de comissão da imobiliária (ex: 0.10 = 10%)
  realtorCommissionSplit: number;   // Split do corretor sobre a comissão (ex: 0.30 = 30%)
}

export interface BusinessRulesState {
  // Taxas de Split
  splitRates: SplitRates;

  // Taxas de Setup por tipo de contrato
  setupFees: SetupFees;

  // Regras de Cashback
  cashbackRules: CashbackRules;

  // Regras de Antecipação
  anticipationRules: AnticipationRules;

  // Regras de Investimento
  investorRules: InvestorRules;

  // Regras de Comissão da Imobiliária
  agencyCommissionRules: AgencyCommissionRules;

  // Metadados
  lastUpdated: string;
  version: string;

  // Actions
  setSplitRates: (rates: Partial<SplitRates>) => void;
  setSetupFees: (fees: Partial<SetupFees>) => void;
  setCashbackRules: (rules: Partial<CashbackRules>) => void;
  setAnticipationRules: (rules: Partial<AnticipationRules>) => void;
  setInvestorRules: (rules: Partial<InvestorRules>) => void;
  setAgencyCommissionRules: (rules: Partial<AgencyCommissionRules>) => void;
  resetToDefaults: () => void;

  // Simulação de fetch do banco de dados
  fetchFromDatabase: () => Promise<void>;
}

// Valores padrão que seriam carregados do banco de dados
const DEFAULT_SPLIT_RATES: SplitRates = {
  platform: 5,      // 5%
  insurer: 5,       // 5%
  guarantor: 5,     // 5%
  landlord: 85,     // 85%
};

const DEFAULT_SETUP_FEES: SetupFees = {
  residential: 500,
  commercial: 1000,
  industrial: 2000,
  rural: 1500,
};

const DEFAULT_CASHBACK_RULES: CashbackRules = {
  onTimePayment: 1,       // 1% de cashback
  referralBonus: 50,      // R$50 por indicação
  loyaltyMultiplier: 1.5, // 1.5x após 6 meses
  maxMonthlyReward: 200,  // Máximo R$200/mês
};

const DEFAULT_ANTICIPATION_RULES: AnticipationRules = {
  minMonths: 1,
  maxMonths: 12,
  discountRate: 15,   // 15% de desconto
  platformFee: 5,     // 5% taxa da plataforma
};

const DEFAULT_INVESTOR_RULES: InvestorRules = {
  minInvestment: 100,
  maxInvestment: 100000,
  annualYield: 18,      // 18% ao ano estimado
  lockPeriodDays: 30,   // 30 dias de lock
};

const DEFAULT_AGENCY_COMMISSION_RULES: AgencyCommissionRules = {
  agencyCommissionRate: 0.10,     // 10% de comissão
  realtorCommissionSplit: 0.30,   // 30% do corretor
};

export const useBusinessRulesStore = create<BusinessRulesState>()(
  persist(
    (set, get) => ({
      // Estado inicial
      splitRates: DEFAULT_SPLIT_RATES,
      setupFees: DEFAULT_SETUP_FEES,
      cashbackRules: DEFAULT_CASHBACK_RULES,
      anticipationRules: DEFAULT_ANTICIPATION_RULES,
      investorRules: DEFAULT_INVESTOR_RULES,
      agencyCommissionRules: DEFAULT_AGENCY_COMMISSION_RULES,
      lastUpdated: new Date().toISOString(),
      version: "2.0.0",

      // Actions
      setSplitRates: (rates) =>
        set((state) => ({
          splitRates: { ...state.splitRates, ...rates },
          lastUpdated: new Date().toISOString(),
        })),

      setSetupFees: (fees) =>
        set((state) => ({
          setupFees: { ...state.setupFees, ...fees },
          lastUpdated: new Date().toISOString(),
        })),

      setCashbackRules: (rules) =>
        set((state) => ({
          cashbackRules: { ...state.cashbackRules, ...rules },
          lastUpdated: new Date().toISOString(),
        })),

      setAnticipationRules: (rules) =>
        set((state) => ({
          anticipationRules: { ...state.anticipationRules, ...rules },
          lastUpdated: new Date().toISOString(),
        })),

      setInvestorRules: (rules) =>
        set((state) => ({
          investorRules: { ...state.investorRules, ...rules },
          lastUpdated: new Date().toISOString(),
        })),

      setAgencyCommissionRules: (rules) =>
        set((state) => ({
          agencyCommissionRules: { ...state.agencyCommissionRules, ...rules },
          lastUpdated: new Date().toISOString(),
        })),

      resetToDefaults: () =>
        set({
          splitRates: DEFAULT_SPLIT_RATES,
          setupFees: DEFAULT_SETUP_FEES,
          cashbackRules: DEFAULT_CASHBACK_RULES,
          anticipationRules: DEFAULT_ANTICIPATION_RULES,
          investorRules: DEFAULT_INVESTOR_RULES,
          agencyCommissionRules: DEFAULT_AGENCY_COMMISSION_RULES,
          lastUpdated: new Date().toISOString(),
        }),

      // Simula busca do banco de dados
      fetchFromDatabase: async () => {
        // TODO: Substituir por chamada real à API
        // const response = await fetch('/api/business-rules');
        // const data = await response.json();

        // Por enquanto, simula delay de rede
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Mantém os valores atuais (em produção, atualizaria com dados do banco)
        set({ lastUpdated: new Date().toISOString() });
      },
    }),
    {
      name: "vinculo-business-rules",
    }
  )
);

// Hook helper para calcular split de pagamento
export function useCalculateSplit(rentAmount: number) {
  const { splitRates } = useBusinessRulesStore();

  return {
    platformAmount: (rentAmount * splitRates.platform) / 100,
    insurerAmount: (rentAmount * splitRates.insurer) / 100,
    guarantorAmount: (rentAmount * splitRates.guarantor) / 100,
    landlordAmount: (rentAmount * splitRates.landlord) / 100,
    total: rentAmount,
  };
}
