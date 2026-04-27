import { Router } from 'express'
import { AuthController } from '../controllers/authController.js'
import { requireAdmin } from '../middlewares/authMiddleware.js'

const router = Router()

// POST /api/auth/login — faz login e retorna JWT
router.post('/login', AuthController.login)

// POST /api/auth/verify — verifica se o token ainda é válido
router.post('/verify', requireAdmin, AuthController.verify)

export default router
