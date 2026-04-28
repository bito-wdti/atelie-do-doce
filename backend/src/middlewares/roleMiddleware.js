import { requireAdmin } from './authMiddleware.js'

export const roleMiddleware = {

  // Verificar se role requer autenticação admin
  requireAdminForRole(req, res, next) {
    const { role } = req.body

    // Se role for diferente de 'Cliente', requer autenticação de admin
    if (role && role !== 'Cliente') {
      // Executar o middleware requireAdmin diretamente
      return requireAdmin(req, res, next)
    }

    next()
  }

}