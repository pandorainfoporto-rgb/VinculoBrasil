// ============================================
// INVEST ROUTES - Pedidos de Investimento
// Compra de Recebíveis via Pix
// Blockchain Invisível ao Usuário
// ============================================
import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import investController from '../controllers/invest.controller.js';
const router = Router();
// ============================================
// ROTAS PROTEGIDAS (Requerem autenticação)
// ============================================
/**
 * POST /api/invest/order
 * Cria um pedido de investimento e gera QR Code Pix
 *
 * Body: { listingId: string }
 * Returns: { order, pix, message }
 */
router.post('/order', authMiddleware, investController.createInvestmentOrder);
/**
 * GET /api/invest/orders
 * Lista os pedidos do usuário logado
 *
 * Returns: { data: InvestmentOrder[] }
 */
router.get('/orders', authMiddleware, investController.getMyOrders);
/**
 * GET /api/invest/orders/:id
 * Busca detalhes de um pedido específico
 *
 * Returns: { order, pix?, listing }
 */
router.get('/orders/:id', authMiddleware, investController.getOrderById);
/**
 * DELETE /api/invest/orders/:id
 * Cancela um pedido pendente ou aguardando pagamento
 */
router.delete('/orders/:id', authMiddleware, investController.cancelOrder);
export default router;
//# sourceMappingURL=invest.js.map