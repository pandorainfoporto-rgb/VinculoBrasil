import { type Request, type Response, type NextFunction } from 'express';
/**
 * GET /api/finance/bank-registry
 * Lists all available banks and gateways
 */
export declare function listBankRegistry(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * POST /api/finance/payables
 * Creates a new account payable (conta a pagar)
 */
export declare function createPayable(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * GET /api/finance/payables
 * Lists all accounts payable with optional filters
 */
export declare function listPayables(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * PUT /api/finance/payables/:id/pay
 * Marks a payable as paid
 */
export declare function payBill(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * PUT /api/finance/payables/:id
 * Updates a payable
 */
export declare function updatePayable(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * DELETE /api/finance/payables/:id
 * Deletes a payable
 */
export declare function deletePayable(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * POST /api/finance/receivables
 * Creates a new account receivable (conta a receber)
 */
export declare function createReceivable(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * GET /api/finance/receivables
 * Lists all accounts receivable with optional filters
 */
export declare function listReceivables(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * PUT /api/finance/receivables/:id/receive
 * Marks a receivable as received
 */
export declare function receivePayment(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * PUT /api/finance/receivables/:id
 * Updates a receivable
 */
export declare function updateReceivable(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * DELETE /api/finance/receivables/:id
 * Deletes a receivable
 */
export declare function deleteReceivable(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * POST /api/finance/bank-accounts
 * Creates a new bank account
 */
export declare function createBankAccount(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * GET /api/finance/bank-accounts
 * Lists all bank accounts with optional filters
 */
export declare function listBankAccounts(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * PUT /api/finance/bank-accounts/:id
 * Updates a bank account
 */
export declare function updateBankAccount(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * DELETE /api/finance/bank-accounts/:id
 * Deletes a bank account
 */
export declare function deleteBankAccount(req: Request, res: Response, next: NextFunction): Promise<void>;
/**
 * GET /api/finance/summary
 * Gets financial summary (dashboard data)
 */
export declare function getFinancialSummary(req: Request, res: Response, next: NextFunction): Promise<void>;
//# sourceMappingURL=finance.controller.d.ts.map