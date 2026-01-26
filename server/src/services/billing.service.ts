import { prisma } from '../lib/prisma.js';
import { addMonths } from 'date-fns';

export const billingService = {
    /**
     * Generate invoice for a specific lease
     */
    generateInvoiceForLease: async (leaseId: string, dueDate: Date) => {
        const lease = await prisma.lease.findUnique({
            where: { id: leaseId },
            include: { property: true }
        });

        if (!lease) throw new Error('Lease not found');

        // Create Invoice (Tenant Receivable)
        const invoice = await prisma.invoice.create({
            data: {
                leaseId: lease.id,
                payerId: lease.tenantId,
                amount: lease.rentAmount,
                adminFee: lease.adminFeeValue,
                netAmount: lease.ownerNetValue,
                dueDate: dueDate,
                status: 'PENDING',
            }
        });

        // Create Settlement (Owner Payable)
        await prisma.settlement.create({
            data: {
                invoiceId: invoice.id,
                recipientId: lease.ownerId,
                amount: lease.ownerNetValue,
                scheduledDate: addMonths(dueDate, 0), // Same month payment for now
                status: 'SCHEDULED',
            }
        });

        return invoice;
    },

    /**
     * Generate invoices for all active leases for next month
     */
    generateNextMonthInvoices: async () => {
        const activeLeases = await prisma.lease.findMany({
            where: { status: 'ACTIVE' }
        });

        const nextMonth = addMonths(new Date(), 1);
        const results = [];

        for (const lease of activeLeases) {
            // Calculate due date based on paymentDay
            const dueDate = new Date(nextMonth.getFullYear(), nextMonth.getMonth(), lease.paymentDay);

            try {
                const invoice = await billingService.generateInvoiceForLease(lease.id, dueDate);
                results.push({ leaseId: lease.id, status: 'SUCCESS', invoiceId: invoice.id });
            } catch (error) {
                console.error(`Failed to generate invoice for lease ${lease.id}`, error);
                results.push({ leaseId: lease.id, status: 'FAILED', error });
            }
        }

        return results;
    },

    /**
     * List invoices with filters
     */
    listInvoices: async (filters?: { status?: string }) => {
        const where: any = {};
        if (filters?.status) where.status = filters.status;

        return prisma.invoice.findMany({
            where,
            include: {
                payer: { select: { name: true, email: true } },
                lease: { include: { property: { select: { street: true, number: true } } } }
            },
            orderBy: { dueDate: 'asc' }
        });
    },

    /**
     * List settlements with filters
     */
    listSettlements: async (filters?: { status?: string }) => {
        const where: any = {};
        if (filters?.status) where.status = filters.status;

        return prisma.settlement.findMany({
            where,
            include: {
                recipient: { select: { name: true, email: true } },
                invoice: { select: { id: true, amount: true, fee: false } } // Simplified include
            },
            orderBy: { scheduledDate: 'asc' }
        });
    }
};
