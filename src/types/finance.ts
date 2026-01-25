// ============================================================
// FINANCE TYPES - Tipos para o Módulo Financeiro
// FASE 23: Supplier 360 e FinancialCategory Hierarquico
// ============================================================

// ============================================================
// SUPPLIER 360 - Fornecedor Completo
// ============================================================

export type PersonType = 'FISICA' | 'JURIDICA';
export type AddressType = 'COMMERCIAL' | 'DELIVERY' | 'BILLING';
export type PixKeyType = 'CPF' | 'CNPJ' | 'EMAIL' | 'PHONE' | 'RANDOM';
export type BankAccountType = 'CHECKING' | 'SAVINGS' | 'GATEWAY';

// Endereco do Fornecedor
export interface SupplierAddress {
  id?: string;
  supplierId?: string;
  type: AddressType;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  country?: string;
  isPrimary?: boolean;
}

// Conta Bancaria do Fornecedor
export interface SupplierBankAccount {
  id?: string;
  supplierId?: string;
  bankCode: string;
  bankName?: string;
  agencyNumber: string;
  accountNumber: string;
  accountType?: BankAccountType;
  pixKey?: string;
  pixKeyType?: PixKeyType;
  holderName?: string;
  holderDocument?: string;
  isPrimary?: boolean;
}

// Contato do Fornecedor
export interface SupplierContact {
  id?: string;
  supplierId?: string;
  name: string;
  role?: string;
  email?: string;
  phone?: string;
  mobile?: string;
  department?: string;
  isPrimary?: boolean;
}

// Fornecedor 360 (Completo)
export interface Supplier {
  id: string;

  // Dados Cadastrais
  tradeName: string;
  legalName?: string;
  taxId?: string;
  personType?: PersonType;
  stateRegistration?: string;
  municipalRegistration?: string;

  // Campos legados (deprecated)
  name?: string;
  cnpj?: string;

  // Categoria e Avaliacao
  category?: string;
  rating?: number;

  // Contato Principal (legacy)
  phone?: string;
  email?: string;

  // Relacionamentos 360
  addresses?: SupplierAddress[];
  bankAccounts?: SupplierBankAccount[];
  contacts?: SupplierContact[];

  // Contadores
  _count?: {
    accountsPayable?: number;
    serviceOrders?: number;
  };

  // Metadata
  agencyId?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// ============================================================
// FINANCIAL CATEGORY - Plano de Contas Hierarquico
// ============================================================

export type FinancialCategoryType = 'EXPENSE' | 'INCOME';
export type CategoryAccountType = 'SYNTHETIC' | 'ANALYTICAL';
export type CategoryNature = 'DEBIT' | 'CREDIT';

// Categoria Financeira (Plano de Contas / DRE)
export interface FinancialCategory {
  id: string;
  name: string;
  code?: string;
  description?: string;

  // Classificacao Contabil
  type: FinancialCategoryType;
  categoryType?: CategoryAccountType;
  nature?: CategoryNature;

  // Hierarquia
  level?: number;
  path?: string;
  parentId?: string;
  parent?: {
    id: string;
    name: string;
    code?: string;
  };
  children?: FinancialCategory[];

  // Contadores
  _count?: {
    accountsPayable?: number;
  };

  // Metadata
  agencyId?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// Alias para compatibilidade com código legado
export type ChartOfAccount = FinancialCategory;

// ============================================================
// BANK ACCOUNT (Conta Bancária da Agência)
// ============================================================

export interface BankAccount {
  id: string;
  name: string;
  bankName: string;
  agencyNumber: string;
  accountNumber: string;
  type: BankAccountType;
  balance: number;
  agencyId?: string;
  active?: boolean;
  isActive?: boolean;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;

  // Campos legados (deprecated)
  bank?: string;
  agency?: string;
  accountType?: "checking" | "savings" | "investment";
}

// ============================================================
// TRANSACTIONS
// ============================================================

// Transação (Caixa)
export interface CashTransaction {
  id: string;
  type: "income" | "expense" | "transfer";
  category: string;
  subcategory?: string;
  description: string;
  amount: number;
  date: string;
  dueDate?: string;
  paidAt?: string;
  status: "pending" | "paid" | "overdue" | "cancelled";
  bankAccountId?: string;
  contractId?: string;
  propertyId?: string;
  tenantId?: string;
  landlordId?: string;
  paymentMethod?: "pix" | "boleto" | "transfer" | "cash" | "credit_card" | "debit_card";
  notes?: string;
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// ACCOUNTS PAYABLE / RECEIVABLE
// ============================================================

// Conta a Pagar
export interface AccountPayable {
  id: string;

  // Fornecedor
  supplierId?: string;
  supplier?: Supplier;
  supplierName?: string;

  // Categoria
  categoryId?: string;
  financialCategory?: FinancialCategory;
  category?: string;

  // Dados
  description: string;
  amount: number;
  dueDate: string;
  paidAt?: string;
  paymentDate?: string;
  status: "pending" | "paid" | "overdue" | "cancelled" | "partial";

  // Parcelas
  installmentNumber?: number;
  totalInstallments?: number;
  isRecurring?: boolean;
  recurrenceInterval?: string;

  // Pagamento
  bankAccountId?: string;
  paymentMethod?: string;
  barcode?: string;

  // Extras
  notes?: string;
  attachments?: string[];
  agencyId?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Conta a Receber
export interface AccountReceivable {
  id: string;
  clientId?: string;
  clientName?: string;
  origin?: string;
  clientType?: "tenant" | "landlord" | "agency" | "investor" | "other" | "TENANT" | "OWNER" | "BUYER" | "OTHER";
  description: string;
  category?: string;
  amount: number;
  dueDate: string;
  receivedAt?: string;
  receivedDate?: string;
  receivedAmount?: number;
  status: "pending" | "received" | "overdue" | "cancelled" | "partial";
  type?: "MANUAL" | "BOLETO" | "MARKETPLACE" | "RENTAL";
  installmentNumber?: number;
  totalInstallments?: number;
  contractId?: string;
  propertyId?: string;
  paymentMethod?: string;
  notes?: string;
  attachments?: string[];
  agencyId?: string;
  createdAt?: string;
  updatedAt?: string;
}

// ============================================================
// DRE - Demonstração do Resultado do Exercício
// ============================================================

export interface DREReport {
  period: {
    start: string;
    end: string;
  };
  revenue: {
    total: number;
    breakdown: {
      rentals: number;
      setupFees: number;
      commissions: number;
      platformFees: number;
      anticipationFees: number;
      otherRevenue: number;
    };
  };
  expenses: {
    total: number;
    breakdown: {
      operational: number;
      administrative: number;
      marketing: number;
      technology: number;
      personnel: number;
      taxes: number;
      financial: number;
      otherExpenses: number;
    };
  };
  grossProfit: number;
  netProfit: number;
  margin: number;
}

// ============================================================
// ANTICIPATION - Antecipação de Recebíveis
// ============================================================

export interface Anticipation {
  id: string;
  contractId: string;
  landlordId: string;
  propertyId: string;
  requestedAmount: number;
  approvedAmount?: number;
  discountRate: number;
  netAmount: number;
  monthsAnticipated: number;
  status: "pending" | "approved" | "rejected" | "disbursed" | "completed";
  requestedAt: string;
  approvedAt?: string;
  disbursedAt?: string;
  completedAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================================
// FINANCIAL SUMMARY
// ============================================================

export interface FinancialSummary {
  period: string;
  cashBalance: number;
  totalReceivables: number;
  totalPayables: number;
  overdueReceivables: number;
  overduePayables: number;
  monthlyRevenue: number;
  monthlyExpenses: number;
  netCashFlow: number;
}
