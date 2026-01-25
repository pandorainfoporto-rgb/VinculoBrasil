import { type Request, type Response, type NextFunction } from 'express';
/**
 * POST /api/agency/realtors
 *
 * Creates a new realtor (corretor) linked to an agency.
 *
 * Body:
 * - name: string (required)
 * - creci: string (required, unique)
 * - email: string (required)
 * - phone: string (required)
 * - cpf?: string (optional, unique)
 * - agencyId?: string (optional)
 * - customCommissionSplit?: number (optional, overrides system default)
 * - pixKey?: string (optional)
 * - pixKeyType?: string (optional)
 */
export declare function createRealtor(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * GET /api/agency/realtors
 *
 * Lists all realtors, optionally filtered by agencyId.
 *
 * Query params:
 * - agencyId?: string (filter by agency)
 * - active?: boolean (filter by active status)
 */
export declare function listRealtors(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * GET /api/agency/realtors/:id
 *
 * Gets a single realtor by ID.
 */
export declare function getRealtorById(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * PUT /api/agency/realtors/:id
 *
 * Updates a realtor's information.
 *
 * Body:
 * - name?: string
 * - email?: string
 * - phone?: string
 * - cpf?: string
 * - customCommissionSplit?: number
 * - pixKey?: string
 * - pixKeyType?: string
 * - active?: boolean
 * - terminationDate?: string
 */
export declare function updateRealtor(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * DELETE /api/agency/realtors/:id
 *
 * Soft deletes a realtor (sets active to false and terminationDate to now).
 */
export declare function deleteRealtor(req: Request, res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=realtor.controller.d.ts.map