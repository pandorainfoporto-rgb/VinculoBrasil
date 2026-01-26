import { Request, Response } from 'express';
import { billingService } from '../services/billing.service';

export const financeController = {
  listInvoices: async (req: Request, res: Response) => {
    try {
      const { status } = req.query;
      const invoices = await billingService.listInvoices({
        status: typeof status === 'string' ? status : undefined
      });
      return res.json(invoices);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to list invoices' });
    }
  },

  listSettlements: async (req: Request, res: Response) => {
    try {
      const { status } = req.query;
      const settlements = await billingService.listSettlements({
        status: typeof status === 'string' ? status : undefined
      });
      return res.json(settlements);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to list settlements' });
    }
  },

  generateInvoices: async (req: Request, res: Response) => {
    try {
      const results = await billingService.generateNextMonthInvoices();
      return res.json(results);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to generate invoices' });
    }
  }
};
