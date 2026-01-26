import { z } from 'zod';
import { TenantService } from '../services/tenant.service.js';
import { TenantStatus } from '@prisma/client';
const createTenantSchema = z.object({
    name: z.string().min(3),
    email: z.string().email(),
    cpf: z.string().min(11),
    phone: z.string().optional(),
    monthlyIncome: z.number().optional(),
    creditScore: z.number().int().optional(),
    notes: z.string().optional(),
});
const updateTenantSchema = z.object({
    name: z.string().optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    monthlyIncome: z.number().optional(),
    creditScore: z.number().int().optional(),
    notes: z.string().optional(),
    status: z.nativeEnum(TenantStatus).optional(),
});
export async function listTenants(req, res, next) {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const search = req.query.search;
        const status = req.query.status;
        const result = await TenantService.listTenants({ page, limit, search, status });
        res.json(result);
    }
    catch (error) {
        next(error);
    }
}
export async function createTenant(req, res, next) {
    try {
        const data = createTenantSchema.parse(req.body);
        const tenant = await TenantService.createTenant(data);
        res.status(201).json(tenant);
    }
    catch (error) {
        next(error);
    }
}
export async function getTenant(req, res, next) {
    try {
        const { id } = req.params;
        const tenant = await TenantService.getTenantById(String(id));
        res.json(tenant);
    }
    catch (error) {
        next(error);
    }
}
export async function updateTenant(req, res, next) {
    try {
        const { id } = req.params;
        const data = updateTenantSchema.parse(req.body);
        const tenant = await TenantService.updateTenant(String(id), data);
        res.json(tenant);
    }
    catch (error) {
        next(error);
    }
}
//# sourceMappingURL=tenant.controller.js.map