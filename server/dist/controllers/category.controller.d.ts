import { type Request, type Response, type NextFunction } from 'express';
/**
 * POST /api/categories
 * Creates a new financial category with automatic level calculation
 */
export declare function createCategory(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * GET /api/categories
 * Lists all financial categories with optional filters
 * Query param: tree=true returns hierarchical structure
 */
export declare function listCategories(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>>>;
/**
 * GET /api/categories/:id
 * Gets a single category by ID with parent and children
 */
export declare function getCategory(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * PUT /api/categories/:id
 * Updates a category with automatic level recalculation if parent changes
 */
export declare function updateCategory(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * DELETE /api/categories/:id
 * Deletes a category (soft delete if has related records)
 */
export declare function deleteCategory(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>>>;
/**
 * GET /api/categories/tree
 * Gets categories organized in a tree structure
 */
export declare function getCategoryTree(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * GET /api/categories/analytical
 * Gets only analytical categories (can receive entries)
 * Useful for dropdowns in forms
 */
export declare function getAnalyticalCategories(req: Request, res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=category.controller.d.ts.map