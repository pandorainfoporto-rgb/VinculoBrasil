// ============================================
// P2P MARKETPLACE ROUTES
// Endpoints para Cessão de Crédito Digital
// ============================================
import { Router } from 'express';
import p2pController from '../controllers/p2p.controller.js';
// import { authMiddleware } from '../middleware/auth.js';
const router = Router();
// ============================================
// ROTAS PÚBLICAS (sem autenticação)
// ============================================
// Listar ofertas ativas
router.get('/listings', p2pController.getListings);
// Detalhes de uma oferta
router.get('/listings/:id', p2pController.getListingById);
// Estatísticas do marketplace
router.get('/stats', p2pController.getStats);
// Simulador de preço (não precisa de auth)
router.post('/simulate', p2pController.simulateListing);
// ============================================
// ROTAS PROTEGIDAS (com autenticação)
// ============================================
// Criar nova oferta (vendedor)
// router.post('/listings', authMiddleware, p2pController.createListing);
router.post('/listings', p2pController.createListing);
// Cancelar oferta (vendedor)
// router.delete('/listings/:id', authMiddleware, p2pController.cancelListing);
router.delete('/listings/:id', p2pController.cancelListing);
// Minhas ofertas (vendedor)
// router.get('/my-listings', authMiddleware, p2pController.getMyListings);
router.get('/my-listings', p2pController.getMyListings);
// Minhas compras (investidor)
// router.get('/my-purchases', authMiddleware, p2pController.getMyPurchases);
router.get('/my-purchases', p2pController.getMyPurchases);
// ============================================
// COMPRA VIA PIX (Blockchain Invisível)
// O usuário paga em Reais, sistema faz o resto
// ============================================
// Criar intenção de compra (gera dados para Pix)
router.post('/buy-intent', p2pController.createBuyIntent);
// Processar compra após Pix confirmado (chamado pelo webhook Asaas)
router.post('/settle', p2pController.settlePurchase);
// ============================================
// WEBHOOKS
// ============================================
// Webhook para eventos de venda na blockchain
router.post('/webhook/sale', p2pController.handleSaleWebhook);
export default router;
//# sourceMappingURL=p2p.js.map