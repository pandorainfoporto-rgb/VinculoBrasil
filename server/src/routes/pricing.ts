import { Router } from 'express';
import { pricingController } from '../controllers/pricing.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.post('/simulate', pricingController.simulate);

export default router;
