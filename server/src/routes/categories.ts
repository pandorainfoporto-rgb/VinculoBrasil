// ============================================
// FINANCIAL CATEGORY ROUTES - Plano de Contas
// ============================================

import { Router } from 'express';
import {
  createCategory,
  listCategories,
  getCategory,
  updateCategory,
  deleteCategory,
  getCategoryTree,
  getAnalyticalCategories,
} from '../controllers/category.controller.js';

const router = Router();

// Get category tree (must be before /:id to avoid conflict)
router.get('/tree', getCategoryTree);

// Get analytical categories only (for dropdowns)
router.get('/analytical', getAnalyticalCategories);

// Create category
router.post('/', createCategory);

// List categories
router.get('/', listCategories);

// Get category by ID
router.get('/:id', getCategory);

// Update category
router.put('/:id', updateCategory);

// Delete category
router.delete('/:id', deleteCategory);

export default router;
