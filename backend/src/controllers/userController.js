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
      const userId = req.user.id

      const user = await userModel.findById(userId)

      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' })
      }

      const { password: _, ...userWithoutPassword } = user

      return res.json(userWithoutPassword)
    } catch (error) {
      return res.status(500).json({ error: error.message })
    }
  },

  // PATCH /api/users/me — atualiza dados permitidos do usuário logado
  async updateMe(req, res) {
    try {
      const userId = req.user.id
      const { delivery_address, name, telefone, avatar_url, currentPassword, newPassword } = req.body

      // Validar telefone se fornecido
      if (telefone !== undefined && !/^\(\d{2}\) \d{5}-\d{4}$/.test(telefone.trim())) {
        return res.status(400).json({ error: 'Telefone deve estar no formato (XX) XXXXX-XXXX' })
      }

      // Validar CEP dentro do delivery_address se fornecido
      if (delivery_address !== undefined) {
        try {
          const addr = JSON.parse(delivery_address)
          if (!addr.cep || !/^\d{5}-\d{3}$/.test(addr.cep)) {
            return res.status(400).json({ error: 'CEP inválido. Use o formato 00000-000' })
          }
        } catch {
          return res.status(400).json({ error: 'Formato de endereço inválido' })
        }
      }

      // Validar nova senha se fornecida
      if (newPassword) {
        if (!currentPassword) {
          return res.status(400).json({ error: 'Senha atual obrigatória para alterar a senha' })
        }
        const pwErrors = []
        if (newPassword.length < 8) pwErrors.push('Mínimo 8 caracteres')
        if (!/[A-Z]/.test(newPassword)) pwErrors.push('Uma letra maiúscula')
        if (!/[0-9]/.test(newPassword)) pwErrors.push('Um número')
        if (!/[!@#$%^&*(),.?":{}|<>]/.test(newPassword)) pwErrors.push('Um símbolo especial')
        if (pwErrors.length > 0) {
          return res.status(400).json({ error: `Senha não atende aos requisitos: ${pwErrors.join(', ')}` })
        }
        const currentUser = await userModel.findById(userId)
        const isValid = await bcrypt.compare(currentPassword, currentUser.password)
        if (!isValid) {
          return res.status(400).json({ error: 'Senha atual incorreta' })
        }
      }

      const allowed = {}
      if (delivery_address !== undefined) allowed.delivery_address = delivery_address
      if (name !== undefined && name.trim()) allowed.name = name.trim()
      if (telefone !== undefined) allowed.telefone = telefone.trim()
      if (avatar_url !== undefined) allowed.avatar_url = avatar_url
      if (newPassword) allowed.password = await bcrypt.hash(newPassword, 10)

      if (Object.keys(allowed).length === 0) {
        return res.status(400).json({ error: 'Nenhum campo válido para atualizar' })
      }

      const user = await userModel.updateById(userId, allowed)

      const { password: _, ...userWithoutPassword } = user

      return res.json(userWithoutPassword)
    } catch (error) {
      return res.status(500).json({ error: error.message })
    }
  }
}