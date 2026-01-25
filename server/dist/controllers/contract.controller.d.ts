import { type Request, type Response, type NextFunction } from 'express';
/**
 * POST /api/contracts/mint
 *
 * Creates a Smart Contract NFT on Polygon blockchain.
 * The admin wallet pays the gas (custodial model).
 * The NFT represents the rental agreement with inspection hash.
 *
 * Body:
 * - propertyId: string (required)
 * - rentValue: number (required)
 * - inspectionHash: string (optional, from AI inspection)
 * - startDate: string (optional, ISO date)
 * - endDate: string (optional, ISO date)
 */
export declare const mintContract: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>>>;
/**
 * GET /api/contracts/blockchain-status
 *
 * Returns blockchain configuration and connection status.
 */
export declare const getBlockchainStatus: (_req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
/**
 * GET /api/contracts/:id/nft
 *
 * Returns NFT details for a specific contract.
 */
export declare const getContractNFT: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>>>;
/**
 * GET /api/contracts/estimate-mint
 *
 * Estimates the gas cost for minting a contract NFT.
 */
export declare const estimateMintCost: (_req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=contract.controller.d.ts.map