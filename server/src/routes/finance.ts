import { Router } from 'express';
import { financeController } from '../controllers/finance.controller.js';
import { authMiddleware } from '../middleware/auth.js';

const router = Router();

router.use(authMiddleware);

router.get('/invoices', financeController.listInvoices);
router.get('/settlements', financeController.listSettlements);
router.post('/generate', financeController.generateBilling);

export default router;
