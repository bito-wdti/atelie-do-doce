import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { requiredEnv } from '../utils/env.js'

const ADMIN_PASSWORD = requiredEnv('ADMIN_PASSWORD', { reject: ['admin123', 'password', '123456'] })
const JWT_SECRET = requiredEnv('JWT_SECRET', { minLength: 32, reject: ['pedilivery_secret'] })
const ADMIN_PASSWORD_HASH = bcrypt.hashSync(ADMIN_PASSWORD, 10)

export const AuthController = {
  async login(req, res) {
    try {
      const { password } = req.body

      if (!password) {
        return res.status(400).json({ error: 'Senha obrigatoria' })
      }

      const isValid = bcrypt.compareSync(password, ADMIN_PASSWORD_HASH)

      if (!isValid) {
        return res.status(401).json({ error: 'Credenciais invalidas' })
      }

      const token = jwt.sign(
        { role: 'admin' },
        JWT_SECRET,
        { expiresIn: '8h' }
      )

      return res.json({ token, message: 'Login realizado com sucesso' })
    } catch (err) {
      return res.status(500).json({ error: 'Erro interno no servidor' })
    }
  },

  async verify(req, res) {
    return res.json({ valid: true, role: req.admin.role })
  }
}
