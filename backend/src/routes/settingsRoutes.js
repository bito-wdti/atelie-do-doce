import { Router } from 'express'
import { SettingsController } from '../controllers/settingsController.js'
import { requireAdmin } from '../middlewares/authMiddleware.js'

const router = Router()

// GET /api/settings             — retorna dados da loja (público, frontend usa no checkout)
router.get('/', SettingsController.show)

// PUT /api/settings             — atualiza configurações da loja [Admin]
router.put('/', requireAdmin, SettingsController.update)

export default router
