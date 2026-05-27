import { Router } from 'express'
import { AuthController } from '../controllers/authController.js'
import { requireAdmin } from '../middlewares/authMiddleware.js'
import { rateLimit } from '../middlewares/security.js'

const router = Router()

router.post('/login', rateLimit({ windowMs: 15 * 60000, max: 8, keyPrefix: 'admin-login' }), AuthController.login)
router.post('/verify', requireAdmin, AuthController.verify)

export default router
