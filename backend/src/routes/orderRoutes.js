import { Router } from 'express'
import { OrderController } from '../controllers/orderController.js'
import { requireAdmin } from '../middlewares/authMiddleware.js'

const router = Router()

// ─── Rotas públicas ──────────────────────────────────────────────────────────
// POST /api/orders              — cliente finaliza compra
router.post('/', OrderController.create)

// GET  /api/orders/:id          — cliente rastreia pedido pelo ID
router.get('/:id', OrderController.show)

// ─── Rotas protegidas (admin) ────────────────────────────────────────────────
// GET  /api/orders              — lista todos os pedidos com filtros
router.get('/', requireAdmin, OrderController.index)

// GET  /api/orders/metrics/summary — métricas para o dashboard
router.get('/metrics/summary', requireAdmin, OrderController.metrics)

// PATCH /api/orders/:id/status  — atualiza status do pedido
router.patch('/:id/status', requireAdmin, OrderController.updateStatus)

// DELETE /api/orders/:id        — remove pedido
router.delete('/:id', requireAdmin, OrderController.destroy)

export default router
