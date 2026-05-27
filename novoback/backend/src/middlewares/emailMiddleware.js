import { userModel } from '../models/userModel.js'

export const emailMiddleware = {

  // Validar email antes de criar usuário
  async validateEmail(req, res, next) {
    try {
      const { email } = req.body

      if (!email) {
        return res.status(400).json({ error: 'Email é obrigatório' })
      }

      // Validar formato semântico do email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Email inválido' })
      }

      // Verificar se email já está cadastrado
      const existingUser = await userModel.findByEmail(email)
      if (existingUser) {
        return res.status(409).json({ error: 'Email já cadastrado' })
      }

      next()
    } catch (error) {
      return res.status(500).json({ error: error.message })
    }
  }

}