import { Router } from 'express';
import { web3Controller } from '../controllers/web3.controller';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

router.post('/mint/:leaseId', web3Controller.mintLease);
router.get('/status/:leaseId', web3Controller.getStatus);
router.get('/explorer/:hash', web3Controller.getExplorerUrl);

export default router;
