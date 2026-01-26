import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { billingService } from '../services/billing.service.js';

export const financeController = {
  /**
   * List all invoices (receivables)
   */
  listInvoices: async (req: Request, res: Response) => {
    try {
      const invoices = await prisma.invoice.findMany({
        include: {
          lease: {
            include: {
              property: true,
              tenant: true
            }
          },
          payer: true
        },
        orderBy: { dueDate: 'desc' },
        take: 100
      });
      return res.json(invoices);
    } catch (error) {
      console.error('Error listing invoices:', error);
      return res.status(500).json({ error: 'Failed to list invoices' });
    }
  },

  /**
   * List all settlements (payables)
   */
  listSettlements: async (req: Request, res: Response) => {
    try {
      const settlements = await prisma.settlement.findMany({
        include: {
          invoice: {
            include: {
              lease: {
                include: {
                  property: true
                }
              }
            }
          },
          recipient: true
        },
        orderBy: { scheduledDate: 'desc' },
        take: 100
      });
      return res.json(settlements);
    } catch (error) {
      console.error('Error listing settlements:', error);
      return res.status(500).json({ error: 'Failed to list settlements' });
    }
  },

  /**
   * Get financial dashboard summary
   */
  getDashboard: async (req: Request, res: Response) => {
    try {
      // Get summary stats
      const [
        totalInvoices,
        pendingInvoices,
        totalSettlements,
        pendingSettlements
      ] = await Promise.all([
        prisma.invoice.count(),
        prisma.invoice.count({ where: { status: 'PENDING' } }),
        prisma.settlement.count(),
        prisma.settlement.count({ where: { status: 'SCHEDULED' } })
      ]);

      // Get recent invoices and settlements
      const [recentInvoices, recentSettlements] = await Promise.all([
        prisma.invoice.findMany({
          include: {
            lease: {
              include: {
                property: true,
                tenant: true
              }
            }
          },
          orderBy: { dueDate: 'desc' },
          take: 5
        }),
        prisma.settlement.findMany({
          include: {
            invoice: {
              include: {
                lease: {
                  include: {
                    property: true
                  }
                }
              }
            },
            recipient: true
          },
          orderBy: { scheduledDate: 'desc' },
          take: 5
        })
      ]);

      return res.json({
        summary: {
          totalInvoices,
          pendingInvoices,
          totalSettlements,
          pendingSettlements
        },
        recentInvoices,
        recentSettlements
      });
    } catch (error) {
      console.error('Error getting dashboard:', error);
      return res.status(500).json({ error: 'Failed to get dashboard data' });
    }
  },

  /**
   * Generate billing for current month
   */
  generateBilling: async (req: Request, res: Response) => {
    try {
      const result = await billingService.generateNextMonthInvoices();
      return res.json(result);
    } catch (error: any) {
      console.error('Error generating billing:', error);
      return res.status(500).json({
        error: error.message || 'Failed to generate billing'
      });
    }
  }
};
