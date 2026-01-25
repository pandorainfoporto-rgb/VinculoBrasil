import { create } from "zustand";
import { persist } from "zustand/middleware";

// ============================================================
// AGENCY STORE - Gerenciamento de Imobiliárias
// ============================================================

export type AgencyStatus = "active" | "pending" | "suspended" | "inactive";

export interface Agency {
  id: string;
  name: string;
  cnpj: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  address: string;
  status: AgencyStatus;
  createdAt: string;
  updatedAt: string;
  propertiesCount: number;
  contractsCount: number;
  monthlyRevenue: number;
}

interface AgencyState {
  agencies: Agency[];
  isLoading: boolean;

  // Actions
  addAgency: (agency: Omit<Agency, "id" | "createdAt" | "updatedAt" | "propertiesCount" | "contractsCount" | "monthlyRevenue">) => void;
  updateAgency: (id: string, data: Partial<Agency>) => void;
  deleteAgency: (id: string) => void;
  setStatus: (id: string, status: AgencyStatus) => void;
  getAgencyById: (id: string) => Agency | undefined;
}

// Dados fictícios iniciais
const MOCK_AGENCIES: Agency[] = [
  {
    id: "agency-001",
    name: "Imóveis Premium SP",
    cnpj: "12.345.678/0001-90",
    email: "contato@imoveispremium.com.br",
    phone: "(11) 99999-1234",
    city: "São Paulo",
    state: "SP",
    address: "Av. Paulista, 1000 - Bela Vista",
    status: "active",
    createdAt: "2024-01-15T10:00:00Z",
    updatedAt: "2024-01-20T14:30:00Z",
    propertiesCount: 48,
    contractsCount: 42,
    monthlyRevenue: 125000,
  },
  {
    id: "agency-002",
    name: "Casa Nova Imóveis",
    cnpj: "23.456.789/0001-01",
    email: "contato@casanova.com.br",
    phone: "(21) 98888-5678",
    city: "Rio de Janeiro",
    state: "RJ",
    address: "Rua Copacabana, 500 - Copacabana",
    status: "active",
    createdAt: "2024-02-01T09:00:00Z",
    updatedAt: "2024-02-10T11:00:00Z",
    propertiesCount: 35,
    contractsCount: 28,
    monthlyRevenue: 89000,
  },
  {
    id: "agency-003",
    name: "Horizonte Negócios Imobiliários",
    cnpj: "34.567.890/0001-12",
    email: "comercial@horizonteimoveis.com.br",
    phone: "(31) 97777-9012",
    city: "Belo Horizonte",
    state: "MG",
    address: "Av. Afonso Pena, 2000 - Centro",
    status: "pending",
    createdAt: "2024-03-01T08:00:00Z",
    updatedAt: "2024-03-01T08:00:00Z",
    propertiesCount: 0,
    contractsCount: 0,
    monthlyRevenue: 0,
  },
  {
    id: "agency-004",
    name: "Sul Imóveis",
    cnpj: "45.678.901/0001-23",
    email: "atendimento@sulimoveis.com.br",
    phone: "(51) 96666-3456",
    city: "Porto Alegre",
    state: "RS",
    address: "Rua dos Andradas, 800 - Centro Histórico",
    status: "active",
    createdAt: "2023-11-10T10:00:00Z",
    updatedAt: "2024-01-15T16:00:00Z",
    propertiesCount: 62,
    contractsCount: 55,
    monthlyRevenue: 175000,
  },
  {
    id: "agency-005",
    name: "Nordeste Lar",
    cnpj: "56.789.012/0001-34",
    email: "contato@nordestelar.com.br",
    phone: "(81) 95555-7890",
    city: "Recife",
    state: "PE",
    address: "Av. Boa Viagem, 3000 - Boa Viagem",
    status: "suspended",
    createdAt: "2023-09-20T14:00:00Z",
    updatedAt: "2024-02-28T09:00:00Z",
    propertiesCount: 25,
    contractsCount: 18,
    monthlyRevenue: 0,
  },
];

export const useAgencyStore = create<AgencyState>()(
  persist(
    (set, get) => ({
      agencies: MOCK_AGENCIES,
      isLoading: false,

      addAgency: (agencyData) => {
        const newAgency: Agency = {
          ...agencyData,
          id: `agency-${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          propertiesCount: 0,
          contractsCount: 0,
          monthlyRevenue: 0,
        };
        set((state) => ({
          agencies: [...state.agencies, newAgency],
        }));
      },

      updateAgency: (id, data) => {
        set((state) => ({
          agencies: state.agencies.map((agency) =>
            agency.id === id
              ? { ...agency, ...data, updatedAt: new Date().toISOString() }
              : agency
          ),
        }));
      },

      deleteAgency: (id) => {
        set((state) => ({
          agencies: state.agencies.filter((agency) => agency.id !== id),
        }));
      },

      setStatus: (id, status) => {
        set((state) => ({
          agencies: state.agencies.map((agency) =>
            agency.id === id
              ? { ...agency, status, updatedAt: new Date().toISOString() }
              : agency
          ),
        }));
      },

      getAgencyById: (id) => {
        return get().agencies.find((agency) => agency.id === id);
      },
    }),
    {
      name: "vinculo-agencies",
    }
  )
);
