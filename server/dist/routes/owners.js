import { Router } from 'express';
import * as OwnerController from '../controllers/owner.controller.js';
const router = Router();
// Retrieve all owners
router.get('/', OwnerController.listOwners);
// Retrieve a single owner
router.get('/:id', OwnerController.getOwner);
// Create a new owner
router.post('/', OwnerController.createOwner);
// Update an owner
router.put('/:id', OwnerController.updateOwner);
export default router;
//# sourceMappingURL=owners.js.map