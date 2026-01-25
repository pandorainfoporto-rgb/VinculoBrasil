import api from "./api";
import type {
  AccountPayable,
  AccountReceivable,
  BankAccount,
  CashTransaction,
  Supplier,
  FinancialCategory,
  DREReport,
  Anticipation,
} from "../types/finance";

// ============================================
// TYPES FOR FILTERS
// ============================================
export interface PayableFilters {
  status?: "pending" | "paid" | "overdue" | "cancelled" | "partial";
  supplierId?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}

export interface ReceivableFilters {
  status?: "pending" | "received" | "cancelled";
  startDate?: string;
  endDate?: string;
  search?: string;
}

export interface CashFlowFilters {
  type?: "income" | "expense";
  startDate?: string;
  endDate?: string;
  bankAccountId?: string;
}

// ============================================
// HELPER: Extrai array de resposta da API
// FASE 19: Blindagem contra estrutura { data: [...] }
// ============================================
const extractArray = <T>(response: any): T[] => {
  // Se já é um array, retorna direto
  if (Array.isArray(response)) {
    return response;
  }
  // Se é objeto com .data que é array, extrai
  if (response && Array.isArray(response.data)) {
    return response.data;
  }
  // Se é objeto com .items que é array (paginação), extrai
  if (response && Array.isArray(response.items)) {
    return response.items;
  }
  // Se é objeto com .results que é array, extrai
  if (response && Array.isArray(response.results)) {
    return response.results;
  }
  // Fallback: retorna array vazio para evitar erros
  console.warn('[financeService] Resposta inesperada, retornando array vazio:', response);
  return [];
};

// ============================================
// ACCOUNTS PAYABLE (CONTAS A PAGAR)
// ============================================
export const financeService = {
  // Contas a Pagar
  async getPayables(filters?: PayableFilters): Promise<AccountPayable[]> {
    const { data } = await api.get("/finance/payables", {
      params: filters,
    });
    return extractArray<AccountPayable>(data);
  },

  async createPayable(payload: Partial<AccountPayable>) {
    const { data } = await api.post<AccountPayable>("/finance/payables", payload);
    return data;
  },

  async updatePayable(id: string, payload: Partial<AccountPayable>) {
    const { data } = await api.put<AccountPayable>(`/finance/payables/${id}`, payload);
    return data;
  },

  async deletePayable(id: string) {
    const { data } = await api.delete(`/finance/payables/${id}`);
    return data;
  },

  async payBill(id: string) {
    const { data } = await api.post(`/finance/payables/${id}/pay`);
    return data;
  },

  // Contas a Receber
  async getReceivables(filters?: ReceivableFilters): Promise<AccountReceivable[]> {
    const { data } = await api.get("/finance/receivables", {
      params: filters,
    });
    return extractArray<AccountReceivable>(data);
  },

  async createReceivable(payload: Partial<AccountReceivable>) {
    const { data } = await api.post<AccountReceivable>("/finance/receivables", payload);
    return data;
  },

  async updateReceivable(id: string, payload: Partial<AccountReceivable>) {
    const { data } = await api.put<AccountReceivable>(`/finance/receivables/${id}`, payload);
    return data;
  },

  async deleteReceivable(id: string) {
    const { data } = await api.delete(`/finance/receivables/${id}`);
    return data;
  },

  async receivePayment(id: string) {
    const { data } = await api.post(`/finance/receivables/${id}/receive`);
    return data;
  },

  // Contas Bancárias
  async getBankAccounts(): Promise<BankAccount[]> {
    const { data } = await api.get("/finance/bank-accounts");
    return extractArray<BankAccount>(data);
  },

  async createBankAccount(payload: Partial<BankAccount>) {
    const { data } = await api.post<BankAccount>("/finance/bank-accounts", payload);
    return data;
  },

  async updateBankAccount(id: string, payload: Partial<BankAccount>) {
    const { data } = await api.put<BankAccount>(`/finance/bank-accounts/${id}`, payload);
    return data;
  },

  async deleteBankAccount(id: string) {
    const { data } = await api.delete(`/finance/bank-accounts/${id}`);
    return data;
  },

  // Fluxo de Caixa
  async getCashTransactions(filters?: CashFlowFilters): Promise<CashTransaction[]> {
    const { data } = await api.get("/finance/cash-flow", {
      params: filters,
    });
    return extractArray<CashTransaction>(data);
  },

  async createCashTransaction(payload: Partial<CashTransaction>) {
    const { data } = await api.post<CashTransaction>("/finance/cash-flow", payload);
    return data;
  },

  // Fornecedores (Nova rota /api/suppliers)
  async getSuppliers(filters?: { search?: string; isActive?: boolean }): Promise<Supplier[]> {
    const { data } = await api.get("/suppliers", { params: filters });
    return extractArray<Supplier>(data);
  },

  async createSupplier(payload: Partial<Supplier>) {
    const { data } = await api.post<Supplier>("/suppliers", payload);
    return data;
  },

  async updateSupplier(id: string, payload: Partial<Supplier>) {
    const { data } = await api.put<Supplier>(`/suppliers/${id}`, payload);
    return data;
  },

  async deleteSupplier(id: string) {
    const { data } = await api.delete(`/suppliers/${id}`);
    return data;
  },

  // Categorias Financeiras (Nova rota /api/categories)
  async getCategories(filters?: { search?: string; type?: 'EXPENSE' | 'INCOME'; isActive?: boolean }): Promise<FinancialCategory[]> {
    const { data } = await api.get("/categories", { params: filters });
    return extractArray<FinancialCategory>(data);
  },

  async createCategory(payload: Partial<FinancialCategory>) {
    const { data } = await api.post<FinancialCategory>("/categories", payload);
    return data;
  },

  async updateCategory(id: string, payload: Partial<FinancialCategory>) {
    const { data } = await api.put<FinancialCategory>(`/categories/${id}`, payload);
    return data;
  },

  async deleteCategory(id: string) {
    const { data } = await api.delete(`/categories/${id}`);
    return data;
  },

  // Plano de Contas (Chart of Accounts) - Fallback para rotas antigas
  async getFinancialCategorys(): Promise<FinancialCategory[]> {
    // Usa a nova rota de categories
    const { data } = await api.get("/categories");
    return extractArray<FinancialCategory>(data);
  },

  async createFinancialCategory(payload: Partial<FinancialCategory>) {
    const { data } = await api.post<FinancialCategory>("/categories", payload);
    return data;
  },

  // DRE (Income Statement)
  async getDRE(startDate: string, endDate: string) {
    const { data } = await api.get<DREReport>("/finance/dre", {
      params: { startDate, endDate },
    });
    return data;
  },

  // Antecipações
  async getAnticipations(): Promise<Anticipation[]> {
    const { data } = await api.get("/finance/anticipations");
    return extractArray<Anticipation>(data);
  },

  async createAnticipation(payload: Partial<Anticipation>) {
    const { data } = await api.post<Anticipation>("/finance/anticipations", payload);
    return data;
  },

  async approveAnticipation(id: string) {
    const { data } = await api.post(`/finance/anticipations/${id}/approve`);
    return data;
  },
};
