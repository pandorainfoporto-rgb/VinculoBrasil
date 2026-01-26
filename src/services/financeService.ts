import api from "./api";

export const financeService = {
  listInvoices: async (filters?: { status?: string }) => {
    const response = await api.get('/finance/invoices', { params: filters });
    return response.data;
  },

  listSettlements: async (filters?: { status?: string }) => {
    const response = await api.get('/finance/settlements', { params: filters });
    return response.data;
  },

  generateNextMonthInvoices: async () => {
    const response = await api.post('/finance/generate');
    return response.data;
  }
};
