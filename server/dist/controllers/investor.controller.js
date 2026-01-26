import { z } from 'zod';
import { investorService } from '../services/investor.service';
const createSchema = z.object({
    name: z.string().min(3),
    email: z.string().email(),
    cpf: z.string().optional(),
    phone: z.string().optional(),
    kycLevel: z.number().int().min(1).max(3).optional(),
    vbrzBalance: z.number().min(0).optional(),
    walletAddress: z.string().optional(),
});
const updateSchema = z.object({
    name: z.string().min(3).optional(),
    phone: z.string().optional(),
    kycLevel: z.number().int().optional(),
    vbrzBalance: z.number().optional(),
    walletAddress: z.string().optional(),
});
export const investorController = {
    list: async (req, res) => {
        try {
            const page = Number(req.query.page) || 1;
            const limit = Number(req.query.limit) || 10;
            const search = req.query.search || undefined;
            const result = await investorService.list(page, limit, search);
            return res.json(result);
        }
        catch (error) {
            console.error(error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    },
    getById: async (req, res) => {
        try {
            const id = req.params.id;
            const investor = await investorService.getById(id);
            if (!investor) {
                return res.status(404).json({ error: 'Investor not found' });
            }
            return res.json(investor);
        }
        catch (error) {
            return res.status(500).json({ error: 'Internal server error' });
        }
    },
    create: async (req, res) => {
        try {
            const payload = createSchema.parse(req.body);
            const investor = await investorService.create(payload);
            return res.status(201).json(investor);
        }
        catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({ errors: error.errors });
            }
            console.error(error); // Log detailed error for debugging (e.g. Unique constraint)
            return res.status(500).json({ error: 'Internal server error' });
        }
    },
    update: async (req, res) => {
        try {
            const id = req.params.id;
            const payload = updateSchema.parse(req.body);
            const investor = await investorService.update(id, payload);
            return res.json(investor);
        }
        catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({ errors: error.errors });
            }
            return res.status(500).json({ error: 'Internal server error' });
        }
    },
};
//# sourceMappingURL=investor.controller.js.map