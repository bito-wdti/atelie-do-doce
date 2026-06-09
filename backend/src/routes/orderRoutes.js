import { Router } from 'express'
import { OrderController } from '../controllers/orderController.js'
import { optionalAdmin, requireAdmin, requireAuth } from '../middlewares/authMiddleware.js'

const router = Router()

router.post('/', requireAuth, OrderController.create)

router.get('/', requireAdmin, OrderController.index)
router.get('/metrics/summary', requireAdmin, OrderController.metrics)
router.get('/:id', optionalAdmin, OrderController.show)

router.patch('/:id/status', requireAdmin, OrderController.updateStatus)
router.delete('/:id', requireAdmin, OrderController.destroy)

export default router
