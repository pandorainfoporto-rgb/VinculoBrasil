import { prisma } from '../lib/prisma.js';
import { pricingService } from './pricing.service.js';

export const leaseService = {
    /**
     * Create a new lease contract
     * Integrates with pricing service to calculate financial breakdown
     */
    create: async (data: {
        propertyId: string;
        tenantId: string;
        ownerId: string;
        guarantorId?: string;
        ownerNetValue: number;
        startDate: Date;
        durationMonths: number;
        paymentDay?: number;
    }) => {
        // Calculate financial breakdown using pricing service
        const pricing = pricingService.calculateRentBreakdown({
            ownerNet: data.ownerNetValue,
        });

        // Calculate end date
        const endDate = new Date(data.startDate);
        endDate.setMonth(endDate.getMonth() + data.durationMonths);

        // Create lease
        const lease = await prisma.lease.create({
            data: {
                propertyId: data.propertyId,
                tenantId: data.tenantId,
                ownerId: data.ownerId,
                guarantorId: data.guarantorId,
                rentAmount: pricing.tenantTotal,
                ownerNetValue: pricing.ownerNet,
                adminFeeValue: pricing.platformRevenue,
                startDate: data.startDate,
                endDate: endDate,
                durationMonths: data.durationMonths,
                paymentDay: data.paymentDay || 10,
                status: 'ACTIVE',
            },
            include: {
                property: true,
                tenant: { select: { id: true, name: true, email: true } },
                owner: { select: { id: true, name: true, email: true } },
                guarantor: { select: { id: true, name: true, email: true } },
            },
        });

        // Update property status to RENTED
        await prisma.property.update({
            where: { id: data.propertyId },
            data: { status: 'RENTED' },
        });

        return lease;
    },

    /**
     * List leases with filters
     */
    list: async (filters?: { status?: string; search?: string }) => {
        const where: any = {};

        if (filters?.status) {
            where.status = filters.status;
        }

        const leases = await prisma.lease.findMany({
            where,
            include: {
                property: { select: { id: true, street: true, number: true, city: true } },
                tenant: { select: { id: true, name: true, email: true } },
                owner: { select: { id: true, name: true } },
            },
            orderBy: { createdAt: 'desc' },
        });

        return leases;
    },

    /**
     * Get lease by ID with full details
     */
    getById: async (id: string) => {
        const lease = await prisma.lease.findUnique({
            where: { id },
            include: {
                property: true,
                tenant: { select: { id: true, name: true, email: true, phone: true } },
                owner: { select: { id: true, name: true, email: true, phone: true } },
                guarantor: { select: { id: true, name: true, email: true, phone: true } },
            },
        });

        return lease;
    },

    /**
     * End a lease contract
     */
    endLease: async (id: string) => {
        const lease = await prisma.lease.update({
            where: { id },
            data: { status: 'ENDED' },
        });

        // Update property status back to VACANT
        await prisma.property.update({
            where: { id: lease.propertyId },
            data: { status: 'VACANT' },
        });

        return lease;
    },
};
