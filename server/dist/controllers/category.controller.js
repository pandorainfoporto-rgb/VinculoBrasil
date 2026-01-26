// ============================================
// FINANCIAL CATEGORY CONTROLLER - Plano de Contas
// FASE 23: Arvore Hierarquica com Level Automatico
// ============================================
import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';
import { AppError } from '../middleware/error-handler.js';
// ============================================
// HELPER: Calculate level and path
// ============================================
async function calculateLevelAndPath(parentId) {
    if (!parentId) {
        return { level: 1, path: '' };
    }
    const parent = await prisma.financialCategory.findUnique({
        where: { id: parentId },
        select: { level: true, path: true, id: true },
    });
    if (!parent) {
        return { level: 1, path: '' };
    }
    const newLevel = (parent.level || 1) + 1;
    const newPath = parent.path ? `${parent.path}/${parent.id}` : `/${parent.id}`;
    return { level: newLevel, path: newPath };
}
// ============================================
// HELPER: Generate automatic code
// Generates hierarchical code like 1.1, 1.2, 1.1.1
// ============================================
async function generateAutoCode(parentId, type) {
    // Get parent's code and count existing siblings
    if (!parentId) {
        // Root level - count existing root categories of same type
        const rootCount = await prisma.financialCategory.count({
            where: {
                parentId: null,
                type,
            },
        });
        // EXPENSE starts at 4, INCOME starts at 3 (common accounting convention)
        const baseNumber = type === 'EXPENSE' ? 4 : 3;
        return `${baseNumber}.${rootCount + 1}`;
    }
    // Has parent - get parent's code and count siblings
    const parent = await prisma.financialCategory.findUnique({
        where: { id: parentId },
        select: { code: true },
    });
    const siblingCount = await prisma.financialCategory.count({
        where: { parentId },
    });
    const parentCode = parent?.code || '';
    const newIndex = siblingCount + 1;
    // Generate code: parentCode.newIndex (e.g., 4.1.1, 4.1.2)
    if (parentCode) {
        return `${parentCode}.${newIndex}`;
    }
    // Fallback if parent has no code
    return `${newIndex}`;
}
function buildTree(categories, parentId = null) {
    return categories
        .filter(cat => cat.parentId === parentId)
        .map(cat => ({
        id: cat.id,
        name: cat.name,
        code: cat.code,
        type: cat.type,
        categoryType: cat.categoryType,
        nature: cat.nature,
        level: cat.level,
        isActive: cat.isActive,
        description: cat.description,
        parentId: cat.parentId,
        _count: cat._count,
        children: buildTree(categories, cat.id),
    }))
        .sort((a, b) => (a.code || '').localeCompare(b.code || ''));
}
// ============================================
// CREATE CATEGORY
// ============================================
/**
 * POST /api/categories
 * Creates a new financial category with automatic level calculation
 */
export async function createCategory(req, res, next) {
    try {
        const { name, type, categoryType, nature, code, description, parentId, agencyId, isActive, } = req.body;
        // Validation
        if (!name) {
            throw new AppError('Missing required field: name', 400);
        }
        if (!type || !['EXPENSE', 'INCOME'].includes(type)) {
            throw new AppError('Invalid type. Must be EXPENSE or INCOME', 400);
        }
        // If parentId provided, check if parent exists and validate type match
        if (parentId) {
            const parent = await prisma.financialCategory.findUnique({
                where: { id: parentId },
            });
            if (!parent) {
                throw new AppError('Parent category not found', 404);
            }
            // Ensure child has same type as parent
            if (parent.type !== type) {
                throw new AppError('Child category must have same type as parent', 400);
            }
        }
        // Calculate level and path automatically
        const { level, path } = await calculateLevelAndPath(parentId);
        // Generate automatic code if not provided
        const finalCode = code || await generateAutoCode(parentId, type);
        // Determine nature based on type if not provided
        const defaultNature = type === 'EXPENSE' ? 'DEBIT' : 'CREDIT';
        // Create category
        const category = await prisma.financialCategory.create({
            data: {
                name,
                type,
                categoryType: categoryType || 'ANALYTICAL',
                nature: nature || defaultNature,
                code: finalCode,
                description,
                parentId,
                level,
                path,
                agencyId,
                isActive: isActive !== undefined ? isActive : true,
            },
            include: {
                parent: {
                    select: {
                        id: true,
                        name: true,
                        code: true,
                    },
                },
            },
        });
        logger.info(`[Category] Created: ${category.id} - ${category.name} (Level ${level}, ${category.type})`);
        res.status(201).json({
            success: true,
            data: category,
        });
    }
    catch (error) {
        next(error);
    }
}
// ============================================
// LIST CATEGORIES (Flat list with tree option)
// ============================================
/**
 * GET /api/categories
 * Lists all financial categories with optional filters
 * Query param: tree=true returns hierarchical structure
 */
export async function listCategories(req, res, next) {
    try {
        const { agencyId, search, isActive, type, categoryType, parentId, tree } = req.query;
        const where = {};
        if (agencyId) {
            where.agencyId = agencyId;
        }
        if (isActive !== undefined) {
            where.isActive = isActive === 'true';
        }
        if (type) {
            where.type = type;
        }
        if (categoryType) {
            where.categoryType = categoryType;
        }
        if (parentId === 'null') {
            where.parentId = null;
        }
        else if (parentId) {
            where.parentId = parentId;
        }
        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { code: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }
        const categories = await prisma.financialCategory.findMany({
            where,
            include: {
                parent: {
                    select: {
                        id: true,
                        name: true,
                        code: true,
                    },
                },
                _count: {
                    select: {
                        accountsPayable: true,
                    },
                },
            },
            orderBy: [
                { level: 'asc' },
                { code: 'asc' },
                { name: 'asc' },
            ],
        });
        // Return tree structure if requested
        if (tree === 'true') {
            const treeData = buildTree(categories, null);
            return res.json({
                success: true,
                data: treeData,
            });
        }
        res.json({
            success: true,
            data: categories,
        });
    }
    catch (error) {
        next(error);
    }
}
// ============================================
// GET CATEGORY BY ID
// ============================================
/**
 * GET /api/categories/:id
 * Gets a single category by ID with parent and children
 */
export async function getCategory(req, res, next) {
    try {
        const { id } = req.params;
        const category = await prisma.financialCategory.findUnique({
            where: { id },
            include: {
                parent: {
                    select: {
                        id: true,
                        name: true,
                        code: true,
                        level: true,
                    },
                },
                children: {
                    select: {
                        id: true,
                        name: true,
                        code: true,
                        type: true,
                        categoryType: true,
                        level: true,
                        isActive: true,
                    },
                    orderBy: { code: 'asc' },
                },
                accountsPayable: {
                    take: 10,
                    orderBy: { createdAt: 'desc' },
                },
            },
        });
        if (!category) {
            throw new AppError('Category not found', 404);
        }
        res.json({
            success: true,
            data: category,
        });
    }
    catch (error) {
        next(error);
    }
}
// ============================================
// UPDATE CATEGORY
// ============================================
/**
 * PUT /api/categories/:id
 * Updates a category with automatic level recalculation if parent changes
 */
export async function updateCategory(req, res, next) {
    try {
        const { id } = req.params;
        const { name, type, categoryType, nature, code, description, parentId, isActive, } = req.body;
        // Check if category exists
        const existing = await prisma.financialCategory.findUnique({
            where: { id },
        });
        if (!existing) {
            throw new AppError('Category not found', 404);
        }
        // Prevent circular reference
        if (parentId === id) {
            throw new AppError('Category cannot be its own parent', 400);
        }
        // If changing parent, recalculate level and path
        let updateData = {
            ...(name && { name }),
            ...(type && { type }),
            ...(categoryType && { categoryType }),
            ...(nature && { nature }),
            ...(code !== undefined && { code }),
            ...(description !== undefined && { description }),
            ...(isActive !== undefined && { isActive }),
        };
        if (parentId !== undefined && parentId !== existing.parentId) {
            // Validate new parent exists and has matching type
            if (parentId) {
                const newParent = await prisma.financialCategory.findUnique({
                    where: { id: parentId },
                });
                if (!newParent) {
                    throw new AppError('New parent category not found', 404);
                }
                // Check it's not a descendant (prevent circular)
                const isDescendant = newParent.path?.includes(id);
                if (isDescendant) {
                    throw new AppError('Cannot set a descendant as parent (circular reference)', 400);
                }
            }
            const { level, path } = await calculateLevelAndPath(parentId);
            updateData.parentId = parentId;
            updateData.level = level;
            updateData.path = path;
            // TODO: Recursively update children levels (future improvement)
        }
        // Update category
        const category = await prisma.financialCategory.update({
            where: { id },
            data: updateData,
            include: {
                parent: {
                    select: {
                        id: true,
                        name: true,
                        code: true,
                    },
                },
            },
        });
        logger.info(`[Category] Updated: ${category.id} - ${category.name}`);
        res.json({
            success: true,
            data: category,
        });
    }
    catch (error) {
        next(error);
    }
}
// ============================================
// DELETE CATEGORY
// ============================================
/**
 * DELETE /api/categories/:id
 * Deletes a category (soft delete if has related records)
 */
export async function deleteCategory(req, res, next) {
    try {
        const { id } = req.params;
        // Check if category exists
        const existing = await prisma.financialCategory.findUnique({
            where: { id },
        });
        if (!existing) {
            throw new AppError('Category not found', 404);
        }
        // Check for related records
        const [relatedPayables, relatedChildren] = await Promise.all([
            prisma.accountsPayable.count({
                where: { categoryId: id },
            }),
            prisma.financialCategory.count({
                where: { parentId: id },
            }),
        ]);
        if (relatedPayables > 0 || relatedChildren > 0) {
            // Soft delete - just deactivate
            const category = await prisma.financialCategory.update({
                where: { id },
                data: { isActive: false },
            });
            logger.info(`[Category] Soft deleted (has ${relatedPayables} payables, ${relatedChildren} children): ${id}`);
            return res.json({
                success: true,
                message: 'Category deactivated (has related records)',
                data: category,
            });
        }
        // Hard delete if no related records
        await prisma.financialCategory.delete({
            where: { id },
        });
        logger.info(`[Category] Deleted: ${id}`);
        res.json({
            success: true,
            message: 'Category deleted successfully',
        });
    }
    catch (error) {
        next(error);
    }
}
// ============================================
// GET CATEGORY TREE (Hierarquia completa)
// ============================================
/**
 * GET /api/categories/tree
 * Gets categories organized in a tree structure
 */
export async function getCategoryTree(req, res, next) {
    try {
        const { agencyId, type, includeInactive } = req.query;
        const where = {};
        if (agencyId) {
            where.agencyId = agencyId;
        }
        if (type) {
            where.type = type;
        }
        if (includeInactive !== 'true') {
            where.isActive = true;
        }
        // Fetch all categories and build tree in memory
        const allCategories = await prisma.financialCategory.findMany({
            where,
            include: {
                _count: {
                    select: {
                        accountsPayable: true,
                    },
                },
            },
            orderBy: [
                { level: 'asc' },
                { code: 'asc' },
                { name: 'asc' },
            ],
        });
        // Build tree structure
        const tree = buildTree(allCategories, null);
        res.json({
            success: true,
            data: tree,
        });
    }
    catch (error) {
        next(error);
    }
}
// ============================================
// GET ANALYTICAL CATEGORIES (Only lançáveis)
// ============================================
/**
 * GET /api/categories/analytical
 * Gets only analytical categories (can receive entries)
 * Useful for dropdowns in forms
 */
export async function getAnalyticalCategories(req, res, next) {
    try {
        const { agencyId, type } = req.query;
        const where = {
            categoryType: 'ANALYTICAL',
            isActive: true,
        };
        if (agencyId) {
            where.agencyId = agencyId;
        }
        if (type) {
            where.type = type;
        }
        const categories = await prisma.financialCategory.findMany({
            where,
            select: {
                id: true,
                name: true,
                code: true,
                type: true,
                level: true,
            },
            orderBy: [
                { type: 'asc' },
                { code: 'asc' },
                { name: 'asc' },
            ],
        });
        // Format for dropdown with indentation
        const formatted = categories.map(cat => ({
            ...cat,
            displayName: cat.code ? `${cat.code} - ${cat.name}` : cat.name,
            indent: '  '.repeat((cat.level || 1) - 1),
        }));
        res.json({
            success: true,
            data: formatted,
        });
    }
    catch (error) {
        next(error);
    }
}
//# sourceMappingURL=category.controller.js.map