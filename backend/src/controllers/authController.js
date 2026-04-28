import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

// Em produção, a senha ficaria no banco. 
// Por ora, usamos a variável de ambiente ADMIN_PASSWORD.
const ADMIN_PASSWORD_HASH = bcrypt.hashSync(process.env.ADMIN_PASSWORD || 'admin123', 10)

export const AuthController = {

  // POST /api/auth/login
  async login(req, res) {
    try {
      const { password } = req.body

      if (!password) {
        return res.status(400).json({ error: 'Senha é obrigatória' })
      }

      const isValid = bcrypt.compareSync(password, ADMIN_PASSWORD_HASH)

      if (!isValid) {
        return res.status(401).json({ error: 'Senha incorreta' })
      }

      const token = jwt.sign(
        { role: 'admin' },
        process.env.JWT_SECRET || 'pedilivery_secret',
        { expiresIn: '8h' }
      )

      return res.json({ token, message: 'Login realizado com sucesso' })
    } catch (err) {
      return res.status(500).json({ error: 'Erro interno no servidor' })
    }
  },

  // POST /api/auth/verify
  async verify(req, res) {
    // O middleware já verificou o token, se chegou aqui é válido
    return res.json({ valid: true, role: req.admin.role })
  }
}
