import { create } from "zustand";
import { persist } from "zustand/middleware";

// ============================================================
// CONTRACT STORE - Gerenciamento de Contratos de Aluguel
// ============================================================

export type ContractStatus = "active" | "pending" | "terminated" | "expired";

export interface RentContract {
  id: string;

  // Referências
  propertyId: string;
  agencyId: string;
  landlordId: string;
  tenantId: string;

  // Dados do imóvel (desnormalizado para performance)
  propertyAddress: string;
  propertyCity: string;

  // Dados das partes
  landlordName: string;
  tenantName: string;
  tenantEmail: string;
  tenantCpf: string;

  // Valores
  rentValue: number;
  condoFee: number;
  iptu: number;
  totalMonthly: number;

  // Datas
  startDate: string;
  endDate: string;
  paymentDueDay: number; // Dia do mês para vencimento

  // Status
  status: ContractStatus;

  // Pagamentos
  paidMonths: number;
  pendingMonths: number;
  overdueMonths: number;
  lastPaymentDate: string | null;

  // Metadados
  createdAt: string;
  updatedAt: string;
}

interface ContractState {
  contracts: RentContract[];
  isLoading: boolean;

  // Actions
  addContract: (contract: Omit<RentContract, "id" | "createdAt" | "updatedAt">) => void;
  updateContract: (id: string, data: Partial<RentContract>) => void;
  deleteContract: (id: string) => void;
  setStatus: (id: string, status: ContractStatus) => void;
  getContractById: (id: string) => RentContract | undefined;
  getContractsByAgency: (agencyId: string) => RentContract[];
  getContractsByProperty: (propertyId: string) => RentContract[];
  getActiveContracts: () => RentContract[];

  // Cálculos
  getTotalMonthlyRevenue: () => number;
  getTotalActiveContracts: () => number;
}

// Dados fictícios - 5 contratos ativos
const MOCK_CONTRACTS: RentContract[] = [
  {
    id: "contract-001",
    propertyId: "prop-001",
    agencyId: "agency-001",
    landlordId: "owner-001",
    tenantId: "tenant-001",
    propertyAddress: "Rua das Flores, 123 - Apto 401",
    propertyCity: "São Paulo/SP",
    landlordName: "Carlos Eduardo Silva",
    tenantName: "João Marcos Oliveira",
    tenantEmail: "joao.oliveira@email.com",
    tenantCpf: "123.456.789-00",
    rentValue: 2500,
    condoFee: 650,
    iptu: 180,
    totalMonthly: 3330,
    startDate: "2024-01-15",
    endDate: "2026-01-14",
    paymentDueDay: 5,
    status: "active",
    paidMonths: 12,
    pendingMonths: 0,
    overdueMonths: 0,
    lastPaymentDate: "2025-01-05",
    createdAt: "2024-01-10T10:00:00Z",
    updatedAt: "2025-01-05T14:30:00Z",
  },
  {
    id: "contract-002",
    propertyId: "prop-002",
    agencyId: "agency-001",
    landlordId: "owner-002",
    tenantId: "tenant-002",
    propertyAddress: "Av. Brasil, 456 - Sala 12",
    propertyCity: "São Paulo/SP",
    landlordName: "Maria Fernanda Costa",
    tenantName: "Empresa XYZ Comércio Ltda",
    tenantEmail: "financeiro@empresaxyz.com.br",
    tenantCpf: "12.345.678/0001-90",
    rentValue: 4800,
    condoFee: 900,
    iptu: 350,
    totalMonthly: 6050,
    startDate: "2023-06-01",
    endDate: "2026-05-31",
    paymentDueDay: 10,
    status: "active",
    paidMonths: 19,
    pendingMonths: 0,
    overdueMonths: 0,
    lastPaymentDate: "2025-01-10",
    createdAt: "2023-05-25T09:00:00Z",
    updatedAt: "2025-01-10T11:00:00Z",
  },
  {
    id: "contract-003",
    propertyId: "prop-004",
    agencyId: "agency-001",
    landlordId: "owner-003",
    tenantId: "tenant-003",
    propertyAddress: "Rua Augusta, 1500 - Cobertura",
    propertyCity: "São Paulo/SP",
    landlordName: "João Pedro Almeida",
    tenantName: "Roberto Santos Mendes",
    tenantEmail: "roberto.mendes@email.com",
    tenantCpf: "987.654.321-00",
    rentValue: 8500,
    condoFee: 1800,
    iptu: 450,
    totalMonthly: 10750,
    startDate: "2024-03-01",
    endDate: "2027-02-28",
    paymentDueDay: 15,
    status: "active",
    paidMonths: 10,
    pendingMonths: 0,
    overdueMonths: 0,
    lastPaymentDate: "2025-01-15",
    createdAt: "2024-02-20T10:00:00Z",
    updatedAt: "2025-01-15T16:00:00Z",
  },
  {
    id: "contract-004",
    propertyId: "prop-006",
    agencyId: "agency-002",
    landlordId: "owner-005",
    tenantId: "tenant-004",
    propertyAddress: "Rua Copacabana, 300 - Apto 702",
    propertyCity: "Rio de Janeiro/RJ",
    landlordName: "Roberto Mendes",
    tenantName: "Ana Carolina Lima",
    tenantEmail: "ana.lima@email.com",
    tenantCpf: "456.789.123-00",
    rentValue: 3500,
    condoFee: 850,
    iptu: 220,
    totalMonthly: 4570,
    startDate: "2024-06-01",
    endDate: "2026-05-31",
    paymentDueDay: 5,
    status: "active",
    paidMonths: 7,
    pendingMonths: 1,
    overdueMonths: 0,
    lastPaymentDate: "2024-12-05",
    createdAt: "2024-05-20T10:00:00Z",
    updatedAt: "2024-12-05T14:30:00Z",
  },
  {
    id: "contract-005",
    propertyId: "prop-003",
    agencyId: "agency-001",
    landlordId: "owner-001",
    tenantId: "tenant-005",
    propertyAddress: "Rua Central, 789",
    propertyCity: "São Paulo/SP",
    landlordName: "Carlos Eduardo Silva",
    tenantName: "Fernanda Souza Santos",
    tenantEmail: "fernanda.souza@email.com",
    tenantCpf: "789.123.456-00",
    rentValue: 1800,
    condoFee: 450,
    iptu: 120,
    totalMonthly: 2370,
    startDate: "2024-09-01",
    endDate: "2025-08-31",
    paymentDueDay: 10,
    status: "active",
    paidMonths: 4,
    pendingMonths: 0,
    overdueMonths: 0,
    lastPaymentDate: "2025-01-10",
    createdAt: "2024-08-25T10:00:00Z",
    updatedAt: "2025-01-10T14:30:00Z",
  },
];

export const useContractStore = create<ContractState>()(
  persist(
    (set, get) => ({
      contracts: MOCK_CONTRACTS,
      isLoading: false,

      addContract: (contractData) => {
        const newContract: RentContract = {
          ...contractData,
          id: `contract-${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({
          contracts: [...state.contracts, newContract],
        }));
      },

      updateContract: (id, data) => {
        set((state) => ({
          contracts: state.contracts.map((contract) =>
            contract.id === id
              ? { ...contract, ...data, updatedAt: new Date().toISOString() }
              : contract
          ),
        }));
      },

      deleteContract: (id) => {
        set((state) => ({
          contracts: state.contracts.filter((contract) => contract.id !== id),
        }));
      },

      setStatus: (id, status) => {
        set((state) => ({
          contracts: state.contracts.map((contract) =>
            contract.id === id
              ? { ...contract, status, updatedAt: new Date().toISOString() }
              : contract
          ),
        }));
      },

      getContractById: (id) => {
        return get().contracts.find((contract) => contract.id === id);
      },

      getContractsByAgency: (agencyId) => {
        return get().contracts.filter((contract) => contract.agencyId === agencyId);
      },

      getContractsByProperty: (propertyId) => {
        return get().contracts.filter((contract) => contract.propertyId === propertyId);
      },

      getActiveContracts: () => {
        return get().contracts.filter((contract) => contract.status === "active");
      },

      getTotalMonthlyRevenue: () => {
        return get()
          .contracts.filter((c) => c.status === "active")
          .reduce((sum, c) => sum + c.rentValue, 0);
      },

      getTotalActiveContracts: () => {
        return get().contracts.filter((c) => c.status === "active").length;
      },
    }),
    {
      name: "vinculo-contracts",
    }
  )
);
