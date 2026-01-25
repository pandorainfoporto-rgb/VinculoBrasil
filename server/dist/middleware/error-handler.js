// ============================================
// ERROR HANDLER MIDDLEWARE
// ============================================
import { logger } from '../lib/logger.js';
export class AppError extends Error {
    statusCode;
    message;
    isOperational;
    constructor(statusCode, message, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.message = message;
        this.isOperational = isOperational;
        Object.setPrototypeOf(this, AppError.prototype);
    }
}
export function errorHandler(err, _req, res, _next) {
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
//# sourceMappingURL=error-handler.js.map