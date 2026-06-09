import { Router } from 'express'
import { SettingsController } from '../controllers/settingsController.js'
import { requireAdmin } from '../middlewares/authMiddleware.js'

const router = Router()

router.get('/', SettingsController.show)
router.put('/', requireAdmin, SettingsController.update)
router.post('/logo', requireAdmin, SettingsController.uploadLogo)

export default router
