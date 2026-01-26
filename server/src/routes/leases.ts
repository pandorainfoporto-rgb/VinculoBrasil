import { Router } from 'express';
import { leaseController } from '../controllers/lease.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.post('/', leaseController.create);
router.get('/', leaseController.list);
router.get('/:id', leaseController.getById);
router.patch('/:id/end', leaseController.endLease);

export default router;
