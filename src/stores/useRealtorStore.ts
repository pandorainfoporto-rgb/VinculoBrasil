import { create } from "zustand";
import { persist } from "zustand/middleware";

// ============================================================
// REALTOR STORE - Gerenciamento de Corretores
// ============================================================

export type RealtorStatus = "active" | "inactive" | "pending";

export interface Realtor {
  id: string;
  agencyId: string;          // Imobiliária vinculada
  name: string;
  email: string;
  phone: string;
  cpf: string;
  creci: string;             // Registro no CRECI
  creciState: string;        // Estado do CRECI (ex: "SP", "RJ")
  status: RealtorStatus;
  commissionSplit: number;   // Split individual (override do padrão 30%)
  contractsCount: number;    // Quantidade de contratos fechados
  totalCommission: number;   // Total de comissões recebidas
  createdAt: string;
  updatedAt: string;
}

interface RealtorState {
  realtors: Realtor[];
  isLoading: boolean;

  // Actions
  addRealtor: (realtor: Omit<Realtor, "id" | "createdAt" | "updatedAt" | "contractsCount" | "totalCommission">) => void;
  updateRealtor: (id: string, data: Partial<Realtor>) => void;
  deleteRealtor: (id: string) => void;
  setStatus: (id: string, status: RealtorStatus) => void;
  getRealtorById: (id: string) => Realtor | undefined;
  getRealtorsByAgency: (agencyId: string) => Realtor[];
  getActiveRealtors: () => Realtor[];
}

// Dados fictícios iniciais
const MOCK_REALTORS: Realtor[] = [
  {
    id: "realtor-001",
    agencyId: "agency-001",
    name: "Ricardo Santos",
    email: "ricardo.santos@imoveispremium.com.br",
    phone: "(11) 98765-4321",
    cpf: "123.456.789-01",
    creci: "123456-F",
    creciState: "SP",
    status: "active",
    commissionSplit: 0.30,
    contractsCount: 15,
    totalCommission: 45000,
    createdAt: "2024-01-20T10:00:00Z",
    updatedAt: "2025-01-15T14:30:00Z",
  },
  {
    id: "realtor-002",
    agencyId: "agency-001",
    name: "Juliana Oliveira",
    email: "juliana.oliveira@imoveispremium.com.br",
    phone: "(11) 97654-3210",
    cpf: "234.567.890-12",
    creci: "234567-F",
    creciState: "SP",
    status: "active",
    commissionSplit: 0.35,
    contractsCount: 22,
    totalCommission: 72000,
    createdAt: "2023-06-15T09:00:00Z",
    updatedAt: "2025-01-10T11:00:00Z",
  },
  {
    id: "realtor-003",
    agencyId: "agency-001",
    name: "Fernando Lima",
    email: "fernando.lima@imoveispremium.com.br",
    phone: "(11) 96543-2109",
    cpf: "345.678.901-23",
    creci: "345678-F",
    creciState: "SP",
    status: "pending",
    commissionSplit: 0.30,
    contractsCount: 0,
    totalCommission: 0,
    createdAt: "2025-01-10T08:00:00Z",
    updatedAt: "2025-01-10T08:00:00Z",
  },
  {
    id: "realtor-004",
    agencyId: "agency-002",
    name: "Mariana Costa",
    email: "mariana.costa@casanova.com.br",
    phone: "(21) 95432-1098",
    cpf: "456.789.012-34",
    creci: "456789-F",
    creciState: "RJ",
    status: "active",
    commissionSplit: 0.30,
    contractsCount: 18,
    totalCommission: 54000,
    createdAt: "2024-03-01T10:00:00Z",
    updatedAt: "2025-01-12T16:00:00Z",
  },
  {
    id: "realtor-005",
    agencyId: "agency-004",
    name: "Paulo Henrique Souza",
    email: "paulo.souza@sulimoveis.com.br",
    phone: "(51) 94321-0987",
    cpf: "567.890.123-45",
    creci: "567890-F",
    creciState: "RS",
    status: "active",
    commissionSplit: 0.32,
    contractsCount: 28,
    totalCommission: 89600,
    createdAt: "2023-09-15T10:00:00Z",
    updatedAt: "2025-01-08T14:30:00Z",
  },
];

export const useRealtorStore = create<RealtorState>()(
  persist(
    (set, get) => ({
      realtors: MOCK_REALTORS,
      isLoading: false,

      addRealtor: (realtorData) => {
        const newRealtor: Realtor = {
          ...realtorData,
          id: `realtor-${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          contractsCount: 0,
          totalCommission: 0,
        };
        set((state) => ({
          realtors: [...state.realtors, newRealtor],
        }));
      },

      updateRealtor: (id, data) => {
        set((state) => ({
          realtors: state.realtors.map((realtor) =>
            realtor.id === id
              ? { ...realtor, ...data, updatedAt: new Date().toISOString() }
              : realtor
          ),
        }));
      },

      deleteRealtor: (id) => {
        set((state) => ({
          realtors: state.realtors.filter((realtor) => realtor.id !== id),
        }));
      },

      setStatus: (id, status) => {
        set((state) => ({
          realtors: state.realtors.map((realtor) =>
            realtor.id === id
              ? { ...realtor, status, updatedAt: new Date().toISOString() }
              : realtor
          ),
        }));
      },

      getRealtorById: (id) => {
        return get().realtors.find((realtor) => realtor.id === id);
      },

      getRealtorsByAgency: (agencyId) => {
        return get().realtors.filter((realtor) => realtor.agencyId === agencyId);
      },

      getActiveRealtors: () => {
        return get().realtors.filter((realtor) => realtor.status === "active");
      },
    }),
    {
      name: "vinculo-realtors",
    }
  )
);
