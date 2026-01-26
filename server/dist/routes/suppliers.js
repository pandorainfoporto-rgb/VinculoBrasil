// ============================================
// SUPPLIER ROUTES - Gestão de Fornecedores
// ============================================
import { Router } from 'express';
import { createSupplier, listSuppliers, getSupplier, updateSupplier, deleteSupplier, } from '../controllers/supplier.controller.js';
const router = Router();
// Create supplier
router.post('/', createSupplier);
// List suppliers
router.get('/', listSuppliers);
// Get supplier by ID
router.get('/:id', getSupplier);
// Update supplier
router.put('/:id', updateSupplier);
// Delete supplier
router.delete('/:id', deleteSupplier);
export default router;
//# sourceMappingURL=suppliers.js.map