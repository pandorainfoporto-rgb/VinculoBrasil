// ============================================
// AUTH ROUTES
// ============================================

import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { config } from '../config/index.js';
import { prisma } from '../lib/prisma.js';
import { AppError } from '../middleware/error-handler.js';
import { authMiddleware } from '../middleware/auth.js';
import { createManagedWallet } from '../services/wallet.service.js';
import { logger } from '../lib/logger.js';

const router = Router();

// Schemas
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
  phone: z.string().optional(),
});

// Login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email },
      include: { role: true },
    });

    if (!user) {
      throw new AppError(401, 'Invalid credentials');
    }

    const validPassword = await bcrypt.compare(password, user.passwordHash);
    if (!validPassword) {
      throw new AppError(401, 'Invalid credentials');
    }

    if (user.status !== 'ACTIVE') {
      throw new AppError(403, 'Account is not active');
    }

    // Generate tokens
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn } as any
    );

    const refreshToken = jwt.sign(
      { userId: user.id, type: 'refresh' },
      config.jwtSecret,
      { expiresIn: config.jwtRefreshExpiresIn } as any
    );

    // Create session
    await prisma.session.create({
      data: {
        userId: user.id,
        token,
        refreshToken,
        userAgent: req.headers['user-agent'],
        ipAddress: req.ip,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: config.nodeEnv === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: {
          name: user.role.name,
          slug: user.role.slug,
        },
        agencyId: user.agencyId,
      },
      token,
      refreshToken,
    });
  } catch (error) {
    next(error);
  }
});

// Register
router.post('/register', async (req, res, next) => {
  try {
    const data = registerSchema.parse(req.body);

    // Check if email exists
    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existing) {
      throw new AppError(400, 'Email already registered');
    }

    // Get default role
    const defaultRole = await prisma.role.findFirst({
      where: { slug: 'user' },
    });

    if (!defaultRole) {
      throw new AppError(500, 'Default role not configured');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(data.password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash,
        name: data.name,
        phone: data.phone,
        roleId: defaultRole.id,
      },
    });

    // ============================================
    // CARTEIRA INVISÍVEL - Blockchain nos bastidores
    // O usuário nunca vê isso, mas tem uma carteira Polygon
    // ============================================
    try {
      const walletAddress = await createManagedWallet(user.id);
      logger.info(`[Auth] Carteira criada para ${user.email}: ${walletAddress}`);
    } catch (walletError) {
      // Não bloqueia o cadastro se a carteira falhar
      // O sistema pode tentar criar novamente depois
      logger.error(`[Auth] Falha ao criar carteira para ${user.email}:`, walletError);
    }

    res.status(201).json({
      message: 'Registration successful',
      userId: user.id,
    });
  } catch (error) {
    next(error);
  }
});

// Logout
router.post('/logout', authMiddleware, async (req, res, next) => {
  try {
    const token = req.headers.authorization?.slice(7) || req.cookies?.token;

    if (token) {
      await prisma.session.deleteMany({
        where: { token },
      });
    }

    res.clearCookie('token');
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    next(error);
  }
});

// Get current user
router.get('/me', authMiddleware, async (req, res) => {
  res.json({ user: req.user });
});

// Refresh token
router.post('/refresh', async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new AppError(400, 'Refresh token required');
    }

    const payload = jwt.verify(refreshToken, config.jwtSecret) as { userId: string; type: string };

    if (payload.type !== 'refresh') {
      throw new AppError(401, 'Invalid refresh token');
    }

    const session = await prisma.session.findFirst({
      where: { refreshToken },
      include: { user: true },
    });

    if (!session) {
      throw new AppError(401, 'Session not found');
    }

    // Generate new token
    const newToken = jwt.sign(
      { userId: session.userId, email: session.user.email },
      config.jwtSecret,
      { expiresIn: config.jwtExpiresIn } as any
    );

    // Update session
    await prisma.session.update({
      where: { id: session.id },
      data: { token: newToken },
    });

    res.json({ token: newToken });
  } catch (error) {
    next(error);
  }
});

export default router;
