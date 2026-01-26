
import { Router } from 'express';
import { guarantorController } from '../controllers/guarantors.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

router.get('/', guarantorController.list);
router.post('/', guarantorController.create);
router.get('/:id', guarantorController.getById);
router.put('/:id', guarantorController.update);

export default router;
