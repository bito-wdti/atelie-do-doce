export const passwordMiddleware = {

  // Validar senha antes de criar usuário
  async validatePassword(req, res, next) {
    try {
      const { password } = req.body

      if (!password) {
        return res.status(400).json({ error: 'Senha é obrigatória' })
      }

      const errors = []

      // Comprimento mínimo de 8 caracteres
      if (password.length < 8) {
        errors.push('Senha deve ter pelo menos 8 caracteres')
      }

      // Pelo menos uma letra maiúscula
      if (!/[A-Z]/.test(password)) {
        errors.push('Senha deve conter pelo menos uma letra maiúscula')
      }

      // Pelo menos um número
      if (!/[0-9]/.test(password)) {
        errors.push('Senha deve conter pelo menos um número')
      }

      // Pelo menos um símbolo
      if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
        errors.push('Senha deve conter pelo menos um símbolo')
      }

      if (errors.length > 0) {
        return res.status(400).json({ errors })
      }

      next()
    } catch (error) {
      return res.status(500).json({ error: error.message })
    }
  }

}