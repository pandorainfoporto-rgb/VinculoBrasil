
import { Router } from 'express';
import { investorController } from '../controllers/investor.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.get('/', investorController.list);
router.get('/:id', investorController.getById);
router.post('/', investorController.create);
router.put('/:id', investorController.update);

export default router;
