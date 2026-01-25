import { create } from "zustand";
import { persist } from "zustand/middleware";

// ============================================================
// PROPERTY STORE - Gerenciamento de Imóveis
// ============================================================

export type PropertyType = "residential" | "commercial" | "industrial" | "rural";
export type PropertyStatus = "available" | "rented" | "maintenance" | "inactive";

export interface Property {
  id: string;
  agencyId: string;
  ownerId: string;
  ownerName: string;

  // Endereço
  address: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;

  // Características
  type: PropertyType;
  area: number; // m²
  bedrooms: number;
  bathrooms: number;
  parkingSpaces: number;

  // Valores
  rentValue: number;
  condoFee: number;
  iptu: number;

  // Status
  status: PropertyStatus;

  // Metadados
  createdAt: string;
  updatedAt: string;
}

interface PropertyState {
  properties: Property[];
  isLoading: boolean;

  // Actions
  addProperty: (property: Omit<Property, "id" | "createdAt" | "updatedAt">) => void;
  updateProperty: (id: string, data: Partial<Property>) => void;
  deleteProperty: (id: string) => void;
  setStatus: (id: string, status: PropertyStatus) => void;
  getPropertyById: (id: string) => Property | undefined;
  getPropertiesByAgency: (agencyId: string) => Property[];
  getPropertiesByOwner: (ownerId: string) => Property[];
}

// Dados fictícios iniciais
const MOCK_PROPERTIES: Property[] = [
  {
    id: "prop-001",
    agencyId: "agency-001",
    ownerId: "owner-001",
    ownerName: "Carlos Eduardo Silva",
    address: "Rua das Flores",
    number: "123",
    complement: "Apto 401",
    neighborhood: "Jardins",
    city: "São Paulo",
    state: "SP",
    zipCode: "01401-000",
    type: "residential",
    area: 85,
    bedrooms: 3,
    bathrooms: 2,
    parkingSpaces: 1,
    rentValue: 2500,
    condoFee: 650,
    iptu: 180,
    status: "rented",
    createdAt: "2024-01-10T10:00:00Z",
    updatedAt: "2024-01-15T14:30:00Z",
  },
  {
    id: "prop-002",
    agencyId: "agency-001",
    ownerId: "owner-002",
    ownerName: "Maria Fernanda Costa",
    address: "Av. Brasil",
    number: "456",
    complement: "Sala 12",
    neighborhood: "Centro",
    city: "São Paulo",
    state: "SP",
    zipCode: "01310-100",
    type: "commercial",
    area: 120,
    bedrooms: 0,
    bathrooms: 2,
    parkingSpaces: 2,
    rentValue: 4800,
    condoFee: 900,
    iptu: 350,
    status: "rented",
    createdAt: "2024-01-05T09:00:00Z",
    updatedAt: "2024-01-20T11:00:00Z",
  },
  {
    id: "prop-003",
    agencyId: "agency-001",
    ownerId: "owner-001",
    ownerName: "Carlos Eduardo Silva",
    address: "Rua Central",
    number: "789",
    neighborhood: "Vila Mariana",
    city: "São Paulo",
    state: "SP",
    zipCode: "04110-000",
    type: "residential",
    area: 55,
    bedrooms: 2,
    bathrooms: 1,
    parkingSpaces: 1,
    rentValue: 1800,
    condoFee: 450,
    iptu: 120,
    status: "available",
    createdAt: "2024-02-01T08:00:00Z",
    updatedAt: "2024-02-01T08:00:00Z",
  },
  {
    id: "prop-004",
    agencyId: "agency-001",
    ownerId: "owner-003",
    ownerName: "João Pedro Almeida",
    address: "Rua Augusta",
    number: "1500",
    complement: "Cobertura",
    neighborhood: "Consolação",
    city: "São Paulo",
    state: "SP",
    zipCode: "01304-001",
    type: "residential",
    area: 180,
    bedrooms: 4,
    bathrooms: 3,
    parkingSpaces: 3,
    rentValue: 8500,
    condoFee: 1800,
    iptu: 450,
    status: "rented",
    createdAt: "2023-11-15T10:00:00Z",
    updatedAt: "2024-01-10T16:00:00Z",
  },
  {
    id: "prop-005",
    agencyId: "agency-001",
    ownerId: "owner-004",
    ownerName: "Ana Paula Santos",
    address: "Av. Rebouças",
    number: "2000",
    complement: "Loja A",
    neighborhood: "Pinheiros",
    city: "São Paulo",
    state: "SP",
    zipCode: "05402-100",
    type: "commercial",
    area: 200,
    bedrooms: 0,
    bathrooms: 3,
    parkingSpaces: 5,
    rentValue: 12000,
    condoFee: 0,
    iptu: 800,
    status: "maintenance",
    createdAt: "2023-10-20T14:00:00Z",
    updatedAt: "2024-02-28T09:00:00Z",
  },
  {
    id: "prop-006",
    agencyId: "agency-002",
    ownerId: "owner-005",
    ownerName: "Roberto Mendes",
    address: "Rua Copacabana",
    number: "300",
    complement: "Apto 702",
    neighborhood: "Copacabana",
    city: "Rio de Janeiro",
    state: "RJ",
    zipCode: "22070-010",
    type: "residential",
    area: 95,
    bedrooms: 3,
    bathrooms: 2,
    parkingSpaces: 1,
    rentValue: 3500,
    condoFee: 850,
    iptu: 220,
    status: "rented",
    createdAt: "2024-01-25T10:00:00Z",
    updatedAt: "2024-02-01T14:30:00Z",
  },
];

export const usePropertyStore = create<PropertyState>()(
  persist(
    (set, get) => ({
      properties: MOCK_PROPERTIES,
      isLoading: false,

      addProperty: (propertyData) => {
        const newProperty: Property = {
          ...propertyData,
          id: `prop-${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({
          properties: [...state.properties, newProperty],
        }));
      },

      updateProperty: (id, data) => {
        set((state) => ({
          properties: state.properties.map((property) =>
            property.id === id
              ? { ...property, ...data, updatedAt: new Date().toISOString() }
              : property
          ),
        }));
      },

      deleteProperty: (id) => {
        set((state) => ({
          properties: state.properties.filter((property) => property.id !== id),
        }));
      },

      setStatus: (id, status) => {
        set((state) => ({
          properties: state.properties.map((property) =>
            property.id === id
              ? { ...property, status, updatedAt: new Date().toISOString() }
              : property
          ),
        }));
      },

      getPropertyById: (id) => {
        return get().properties.find((property) => property.id === id);
      },

      getPropertiesByAgency: (agencyId) => {
        return get().properties.filter((property) => property.agencyId === agencyId);
      },

      getPropertiesByOwner: (ownerId) => {
        return get().properties.filter((property) => property.ownerId === ownerId);
      },
    }),
    {
      name: "vinculo-properties",
    }
  )
);
