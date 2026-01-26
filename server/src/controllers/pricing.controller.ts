import { Request, Response } from 'express';
import { z } from 'zod';
import { pricingService } from '../services/pricing.service';

const simulateSchema = z.object({
    ownerNet: z.number().min(0),
    agencyFee: z.number().min(0).optional(),
    realtorFee: z.number().min(0).optional(),
    fireInsurance: z.number().min(0).optional(),
});

export const pricingController = {
    simulate: async (req: Request, res: Response) => {
        try {
            const input = simulateSchema.parse(req.body);
            const breakdown = pricingService.calculateRentBreakdown(input as any);
            return res.json(breakdown);
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({ errors: error.errors });
            }
            console.error(error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    },
};
