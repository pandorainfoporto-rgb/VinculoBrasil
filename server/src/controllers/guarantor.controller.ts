
import { Request, Response } from 'express';
import { z } from 'zod';
import { guarantorService } from '../services/guarantor.service';

const createSchema = z.object({
    name: z.string().min(3),
    email: z.string().email(),
    cpf: z.string().optional(),
    phone: z.string().optional(),
    totalCollateral: z.number().optional(),
    availableLimit: z.number().optional(),
    blockedAmount: z.number().optional(),
    investorProfile: z.enum(['CONSERVATIVE', 'MODERATE', 'AGGRESSIVE']).optional(),
    kycStatus: z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional(),
});

const updateSchema = z.object({
    name: z.string().min(3).optional(),
    phone: z.string().optional(),
    totalCollateral: z.number().optional(),
    availableLimit: z.number().optional(),
    blockedAmount: z.number().optional(),
    investorProfile: z.enum(['CONSERVATIVE', 'MODERATE', 'AGGRESSIVE']).optional(),
    kycStatus: z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional(),
});

export const guarantorController = {
    list: async (req: Request, res: Response) => {
        try {
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;
            const search = (req.query.search as string) || undefined;

            const result = await guarantorService.list(page, limit, search);
            return res.json(result);
        } catch (error) {
            return res.status(500).json({ error: 'Internal server error' });
        }
    },

    getById: async (req: Request, res: Response) => {
        try {
            const id = req.params.id as string;
            const guarantor = await guarantorService.getById(id);

            if (!guarantor) {
                return res.status(404).json({ error: 'Guarantor not found' });
            }

            return res.json(guarantor);
        } catch (error) {
            return res.status(500).json({ error: 'Internal server error' });
        }
    },

    create: async (req: Request, res: Response) => {
        try {
            const payload = createSchema.parse(req.body) as any;
            const guarantor = await guarantorService.create(payload);
            return res.status(201).json(guarantor);
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({ errors: error.errors });
            }
            return res.status(500).json({ error: 'Internal server error' });
        }
    },

    update: async (req: Request, res: Response) => {
        try {
            const id = req.params.id as string;
            const payload = updateSchema.parse(req.body);
            const guarantor = await guarantorService.update(id, payload);
            return res.json(guarantor);
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({ errors: error.errors });
            }
            return res.status(500).json({ error: 'Internal server error' });
        }
    }
};
