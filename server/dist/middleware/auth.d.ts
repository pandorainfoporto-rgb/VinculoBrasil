import type { Request, Response, NextFunction } from 'express';
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                email: string;
                name: string;
                roleId: string;
                agencyId: string | null;
                role: {
                    id: string;
                    name: string;
                    permissions: unknown;
                };
            };
        }
    }
}
export declare function authMiddleware(req: Request, _res: Response, next: NextFunction): Promise<void>;
export declare function requirePermission(permission: string): (req: Request, _res: Response, next: NextFunction) => void;
//# sourceMappingURL=auth.d.ts.map