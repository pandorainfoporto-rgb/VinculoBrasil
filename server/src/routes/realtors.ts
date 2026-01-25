// ============================================
// REALTORS ROUTES - Gestão de Corretores
// ============================================

import { Router } from 'express';
import {
  createRealtor,
  listRealtors,
  getRealtorById,
  updateRealtor,
  deleteRealtor,
} from '../controllers/realtor.controller.js';

const router = Router();

// Create realtor
router.post('/realtors', createRealtor);

// List realtors
router.get('/realtors', listRealtors);

// Get realtor by ID
router.get('/realtors/:id', getRealtorById);

// Update realtor
router.put('/realtors/:id', updateRealtor);

// Delete realtor (soft delete)
router.delete('/realtors/:id', deleteRealtor);

export default router;
