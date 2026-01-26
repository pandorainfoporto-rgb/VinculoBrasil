import { Request, Response } from 'express';
import { z } from 'zod';
import { leaseService } from '../services/lease.service';

const createLeaseSchema = z.object({
    propertyId: z.string().uuid(),
    tenantId: z.string().uuid(),
    ownerId: z.string().uuid(),
    guarantorId: z.string().uuid().optional(),
    ownerNetValue: z.number().positive(),
    startDate: z.string().transform(str => new Date(str)),
    durationMonths: z.number().int().positive(),
    paymentDay: z.number().int().min(1).max(31).optional(),
});

export const leaseController = {
    create: async (req: Request, res: Response) => {
        try {
            const data = createLeaseSchema.parse(req.body);
            const lease = await leaseService.create(data as any);
            return res.status(201).json(lease);
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({ errors: error.errors });
            }
            console.error(error);
            return res.status(500).json({ error: 'Failed to create lease' });
        }
    },

    list: async (req: Request, res: Response) => {
        try {
            const { status, search } = req.query;
            const leases = await leaseService.list({
                status: typeof status === 'string' ? status : undefined,
                search: typeof search === 'string' ? search : undefined,
            });
            return res.json(leases);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Failed to list leases' });
        }
    },

    getById: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            if (!id || typeof id !== 'string') {
                return res.status(400).json({ error: 'Invalid lease ID' });
            }
            const lease = await leaseService.getById(id);
            if (!lease) {
                return res.status(404).json({ error: 'Lease not found' });
            }
            return res.json(lease);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Failed to get lease' });
        }
    },

    endLease: async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            if (!id || typeof id !== 'string') {
                return res.status(400).json({ error: 'Invalid lease ID' });
            }
            const lease = await leaseService.endLease(id);
            return res.json(lease);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Failed to end lease' });
        }
    },
};
