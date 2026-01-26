import { OwnerService } from '../services/owner.service.js';
export const createOwner = async (req, res, next) => {
    try {
        const owner = await OwnerService.createOwner(req.body);
        res.status(201).json({ success: true, data: owner });
    }
    catch (error) {
        next(error);
    }
};
export const listOwners = async (req, res, next) => {
    try {
        const { page, limit, search, agencyId } = req.query;
        const result = await OwnerService.listOwners({
            page: page ? Number(page) : undefined,
            limit: limit ? Number(limit) : undefined,
            search: search ? String(search) : undefined,
            agencyId: agencyId ? String(agencyId) : undefined
        });
        res.json(result);
    }
    catch (error) {
        next(error);
    }
};
export const getOwner = async (req, res, next) => {
    try {
        const owner = await OwnerService.getOwnerById(req.params.id);
        res.json({ success: true, data: owner });
    }
    catch (error) {
        next(error);
    }
};
export const updateOwner = async (req, res, next) => {
    try {
        const owner = await OwnerService.updateOwner(req.params.id, req.body);
        res.json({ success: true, data: owner });
    }
    catch (error) {
        next(error);
    }
};
//# sourceMappingURL=owner.controller.js.map