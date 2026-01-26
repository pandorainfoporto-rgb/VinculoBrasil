import { type Request, type Response, type NextFunction } from 'express';
/**
 * POST /api/suppliers
 * Creates a new supplier with nested address, bankAccount, contacts
 */
export declare function createSupplier(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * GET /api/suppliers
 * Lists all suppliers with optional filters
 */
export declare function listSuppliers(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * GET /api/suppliers/:id
 * Gets a single supplier by ID with all nested data
 */
export declare function getSupplier(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * PUT /api/suppliers/:id
 * Updates a supplier with nested data (upsert strategy)
 */
export declare function updateSupplier(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * DELETE /api/suppliers/:id
 * Deletes a supplier (soft delete - sets isActive to false)
 */
export declare function deleteSupplier(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=supplier.controller.d.ts.map