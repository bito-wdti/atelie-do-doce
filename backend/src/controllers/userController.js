import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { userModel } from '../models/userModel.js'

export const userController = {

  // GET /api/users
  async findAllUsers(req, res) {
    try {
      const { role, startDate, endDate } = req.query

      const users = await userModel.findAll({ role, startDate, endDate })

      return res.json(users)
    } catch (error) {
      return res.status(500).json({ error: error.message })
    }
  },

  // POST /api/users
  async createUser(req, res) {
    try {
      const { name, email, password, cpf, telefone, role, avatar_url } = req.body

      if (!name || !email || !password) {
        return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' })
      }

      // Criptografar a senha
      const hashedPassword = await bcrypt.hash(password, 10)

      const user = await userModel.create({
        name,
        email,
        password: hashedPassword,
        cpf,
        telefone,
        role,
        avatar_url
      })

      // Gerar token JWT
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET || 'pedilivery_secret',
        { expiresIn: '8h' }
      )

      // Não retornar a senha no response
      const { password: _, ...userWithoutPassword } = user

      return res.status(201).json({ token, user: userWithoutPassword })
    } catch (error) {
      return res.status(500).json({ error: error.message })
    }
  },

  // POST /api/users/login
  async login(req, res) {
    try {
      const { email, password } = req.body

      if (!email || !password) {
        return res.status(400).json({ error: 'Email e senha são obrigatórios' })
      }

      // Buscar usuário pelo email
      const user = await userModel.findByEmail(email)

      if (!user) {
        return res.status(401).json({ error: 'Credenciais inválidas' })
      }

      // Verificar senha
      const isValid = await bcrypt.compare(password, user.password)

      if (!isValid) {
        return res.status(401).json({ error: 'Credenciais inválidas' })
      }

      // Gerar token JWT
      const token = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET || 'pedilivery_secret',
        { expiresIn: '8h' }
      )

      // Não retornar a senha no response
      const { password: _, ...userWithoutPassword } = user

      return res.json({ token, user: userWithoutPassword })
    } catch (error) {
      return res.status(500).json({ error: error.message })
    }
  },

  // GET /api/users/me — dados do usuário logado
  async getMe(req, res) {
    try {
      // req.user é preenchido pelo middleware requireAuth
      const userId = req.user.id

      const user = await userModel.findById(userId)

      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' })
      }

      // Não retornar a senha
      const { password: _, ...userWithoutPassword } = user

      return res.json(userWithoutPassword)
    } catch (error) {
      return res.status(500).json({ error: error.message })
    }
  }
}