// ============================================
// USERS ROUTES
// ============================================

import { Router } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../middleware/error-handler.js';
import { requirePermission } from '../middleware/auth.js';

const router = Router();

// List users
router.get('/', requirePermission('users.view'), async (req, res, next) => {
  try {
    const { page = '1', limit = '10', search, roleId, status } = req.query;

    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } },
      ];
    }
    if (roleId) where.roleId = roleId;
    if (status) where.status = status;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: { role: { select: { id: true, name: true } } },
        skip: (parseInt(page as string) - 1) * parseInt(limit as string),
        take: parseInt(limit as string),
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    res.json({
      users: users.map(({ passwordHash: _, ...user }) => user),
      total,
      page: parseInt(page as string),
      totalPages: Math.ceil(total / parseInt(limit as string)),
    });
  } catch (error) {
    next(error);
  }
});

// Get user by ID
router.get('/:id', requirePermission('users.view'), async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.params.id },
      include: {
        role: true,
        wallets: true,
        cashbackBalance: true,
      },
    });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    const { passwordHash: _, ...userData } = user;
    res.json(userData);
  } catch (error) {
    next(error);
  }
});

// Create user
router.post('/', requirePermission('users.create'), async (req, res, next) => {
  try {
    const schema = z.object({
      email: z.string().email(),
      password: z.string().min(8),
      name: z.string().min(2),
      phone: z.string().optional(),
      cpf: z.string().optional(),
      roleId: z.string().uuid(),
    });

    const data = schema.parse(req.body);

    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existing) {
      throw new AppError(400, 'Email already registered');
    }

    const passwordHash = await bcrypt.hash(data.password, 12);

    const user = await prisma.user.create({
      data: {
        ...data,
        passwordHash,
      },
      include: { role: true },
    });

    const { passwordHash: _, ...userData } = user;
    res.status(201).json(userData);
  } catch (error) {
    next(error);
  }
});

// Update user
router.patch('/:id', requirePermission('users.update'), async (req, res, next) => {
  try {
    const schema = z.object({
      name: z.string().min(2).optional(),
      phone: z.string().optional(),
      cpf: z.string().optional(),
      roleId: z.string().uuid().optional(),
      status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED']).optional(),
    });

    const data = schema.parse(req.body);

    const user = await prisma.user.update({
      where: { id: req.params.id },
      data,
      include: { role: true },
    });

    const { passwordHash: _, ...userData } = user;
    res.json(userData);
  } catch (error) {
    next(error);
  }
});

// Delete user
router.delete('/:id', requirePermission('users.delete'), async (req, res, next) => {
  try {
    await prisma.user.delete({
      where: { id: req.params.id },
    });

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export default router;
