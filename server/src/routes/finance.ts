import { Router } from 'express';
import { financeController } from '../controllers/finance.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.get('/invoices', financeController.listInvoices);
router.get('/settlements', financeController.listSettlements);
router.post('/generate', financeController.generateInvoices);

export default router;
