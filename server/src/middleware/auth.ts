// ============================================
// AUTH MIDDLEWARE
// ============================================

import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { prisma } from '../lib/prisma.js';
import { AppError } from './error-handler.js';

interface JwtPayload {
  userId: string;
  email: string;
}

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

export async function authMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
) {
  try {
    // Get token from header or cookie
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ')
      ? authHeader.slice(7)
      : req.cookies?.token;

    if (!token) {
      throw new AppError(401, 'Authentication required');
    }

    // Verify token
    const payload = jwt.verify(token, config.jwtSecret) as JwtPayload;

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        name: true,
        roleId: true,
        status: true,
        agencyId: true,
        role: {
          select: {
            id: true,
            name: true,
            permissions: true,
          },
        },
      },
    });

    if (!user) {
      throw new AppError(401, 'User not found');
    }

    if (user.status !== 'ACTIVE') {
      throw new AppError(403, 'Account is not active');
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AppError(401, 'Invalid token'));
    } else {
      next(error);
    }
  }
}

export function requirePermission(permission: string) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError(401, 'Authentication required'));
    }

    const permissions = req.user.role.permissions as string[];
    if (!permissions.includes(permission) && !permissions.includes('*')) {
      return next(new AppError(403, 'Permission denied'));
    }

    next();
  };
}
