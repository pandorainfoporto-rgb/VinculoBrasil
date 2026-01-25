// ============================================
// REALTOR CONTROLLER - Gestão de Corretores
// ============================================

import { type Request, type Response, type NextFunction } from 'express';
import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';
import { AppError } from '../middleware/error-handler.js';

// ============================================
// TYPES
// ============================================

interface CreateRealtorBody {
  name: string;
  creci: string;
  email: string;
  phone: string;
  cpf?: string;
  agencyId?: string;
  customCommissionSplit?: number;
  pixKey?: string;
  pixKeyType?: string;
}

interface UpdateRealtorBody {
  name?: string;
  email?: string;
  phone?: string;
  cpf?: string;
  customCommissionSplit?: number;
  pixKey?: string;
  pixKeyType?: string;
  active?: boolean;
  terminationDate?: string;
}

// ============================================
// 1. CREATE REALTOR
// ============================================

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
export async function createRealtor(req: Request, res: Response, next: NextFunction) {
  try {
    const {
      name,
      creci,
      email,
      phone,
      cpf,
      agencyId,
      customCommissionSplit,
      pixKey,
      pixKeyType,
    }: CreateRealtorBody = req.body;

    // Validation
    if (!name || !creci || !email || !phone) {
      throw new AppError('Missing required fields: name, creci, email, phone', 400);
    }

    // Check if CRECI already exists
    const existing = await prisma.realtor.findUnique({
      where: { creci },
    });

    if (existing) {
      throw new AppError(`Realtor with CRECI ${creci} already exists`, 409);
    }

    // Create realtor
    const realtor = await prisma.realtor.create({
      data: {
        name,
        creci,
        email,
        phone,
        cpf,
        agencyId,
        customCommissionSplit,
        pixKey,
        pixKeyType,
        active: true,
      },
      include: {
        agency: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    logger.info(`[Realtor] Created: ${realtor.id} - ${realtor.name} (CRECI: ${realtor.creci})`);

    res.status(201).json({
      success: true,
      data: realtor,
    });
  } catch (error) {
    next(error);
  }
}

// ============================================
// 2. LIST REALTORS
// ============================================

/**
 * GET /api/agency/realtors
 *
 * Lists all realtors, optionally filtered by agencyId.
 *
 * Query params:
 * - agencyId?: string (filter by agency)
 * - active?: boolean (filter by active status)
 */
export async function listRealtors(req: Request, res: Response, next: NextFunction) {
  try {
    const { agencyId, active } = req.query;

    const where: any = {};

    if (agencyId) {
      where.agencyId = agencyId as string;
    }

    if (active !== undefined) {
      where.active = active === 'true';
    }

    const realtors = await prisma.realtor.findMany({
      where,
      include: {
        agency: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    res.json({
      success: true,
      data: realtors,
    });
  } catch (error) {
    next(error);
  }
}

// ============================================
// 3. GET REALTOR BY ID
// ============================================

/**
 * GET /api/agency/realtors/:id
 *
 * Gets a single realtor by ID.
 */
export async function getRealtorById(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;

    const realtor = await prisma.realtor.findUnique({
      where: { id },
      include: {
        agency: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!realtor) {
      throw new AppError('Realtor not found', 404);
    }

    res.json({
      success: true,
      data: realtor,
    });
  } catch (error) {
    next(error);
  }
}

// ============================================
// 4. UPDATE REALTOR
// ============================================

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
export async function updateRealtor(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const updateData: UpdateRealtorBody = req.body;

    // Check if realtor exists
    const existing = await prisma.realtor.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new AppError('Realtor not found', 404);
    }

    // Update realtor
    const realtor = await prisma.realtor.update({
      where: { id },
      data: {
        ...updateData,
        terminationDate: updateData.terminationDate ? new Date(updateData.terminationDate) : undefined,
      },
      include: {
        agency: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    logger.info(`[Realtor] Updated: ${realtor.id} - ${realtor.name}`);

    res.json({
      success: true,
      data: realtor,
    });
  } catch (error) {
    next(error);
  }
}

// ============================================
// 5. DELETE REALTOR (Soft Delete)
// ============================================

/**
 * DELETE /api/agency/realtors/:id
 *
 * Soft deletes a realtor (sets active to false and terminationDate to now).
 */
export async function deleteRealtor(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;

    // Check if realtor exists
    const existing = await prisma.realtor.findUnique({
      where: { id },
    });

    if (!existing) {
      throw new AppError('Realtor not found', 404);
    }

    // Soft delete
    const realtor = await prisma.realtor.update({
      where: { id },
      data: {
        active: false,
        terminationDate: new Date(),
      },
    });

    logger.info(`[Realtor] Deleted (soft): ${realtor.id} - ${realtor.name}`);

    res.json({
      success: true,
      message: 'Realtor deactivated successfully',
      data: realtor,
    });
  } catch (error) {
    next(error);
  }
}
