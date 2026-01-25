// ============================================
// ERROR HANDLER MIDDLEWARE
// ============================================

import type { Request, Response, NextFunction } from 'express';
import { logger } from '../lib/logger.js';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.message,
      statusCode: err.statusCode,
    });
  }

  // Log unexpected errors
  logger.error(`Unexpected error: ${err instanceof Error ? err.message : String(err)}`);

  return res.status(500).json({
    error: 'Internal server error',
    statusCode: 500,
  });
}
