import { Router } from 'express'
import { requireAuth, requireAdmin } from '../middlewares/authMiddleware.js'
import { emailMiddleware } from '../middlewares/emailMiddleware.js'
import { passwordMiddleware } from '../middlewares/passwordMiddleware.js'
import { cpfMiddleware } from '../middlewares/cpfMiddleware.js'
import { telefoneMiddleware } from '../middlewares/telefoneMiddleware.js'
import { userController } from '../controllers/userController.js'
import { rateLimit } from '../middlewares/security.js'

const router = Router()

router.get('/', requireAdmin, userController.findAllUsers)
router.get('/me', requireAuth, userController.getMe)

router.post('/',
  emailMiddleware.validateEmail,
  passwordMiddleware.validatePassword,
  cpfMiddleware.validate,
  telefoneMiddleware.validate,
  userController.createUser
)

router.post('/login', rateLimit({ windowMs: 15 * 60000, max: 10, keyPrefix: 'user-login' }), userController.login)

export default router
