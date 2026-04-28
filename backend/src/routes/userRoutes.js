import { Router } from 'express'
import { requireAuth, requireAdmin } from '../middlewares/authMiddleware.js'
import { emailMiddleware } from '../middlewares/emailMiddleware.js'
import { passwordMiddleware } from '../middlewares/passwordMiddleware.js'
import { roleMiddleware } from '../middlewares/roleMiddleware.js'
import { userController } from '../controllers/userController.js'

const router = Router()

// GET /api/users — busca todos os usuários com filtros
router.get('/', requireAdmin, userController.findAllUsers)

// GET /api/users/me — dados do usuário logado
router.get('/me', requireAuth, userController.getMe)

// POST /api/users — cria novo usuário
router.post('/', 
  emailMiddleware.validateEmail, 
  passwordMiddleware.validatePassword, 
  roleMiddleware.requireAdminForRole,
  userController.createUser
)

// POST /api/users/login — login de usuário
router.post('/login', userController.login)

export default router