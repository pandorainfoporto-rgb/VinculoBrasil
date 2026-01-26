
import { Router } from 'express';
import { listTenants, createTenant, getTenant, updateTenant } from '../controllers/tenant.controller.js';

const router = Router();

router.get('/', listTenants);
router.post('/', createTenant);
router.get('/:id', getTenant);
router.put('/:id', updateTenant);

export default router;
