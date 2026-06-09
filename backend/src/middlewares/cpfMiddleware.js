function isValidCpf(cpf) {
  const digits = cpf.replace(/\D/g, '')

  if (digits.length !== 11) return false
  if (/^(\d)\1{10}$/.test(digits)) return false

  let sum = 0
  for (let i = 0; i < 9; i++) sum += parseInt(digits[i]) * (10 - i)
  let remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0
  if (remainder !== parseInt(digits[9])) return false

  sum = 0
  for (let i = 0; i < 10; i++) sum += parseInt(digits[i]) * (11 - i)
  remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0
  if (remainder !== parseInt(digits[10])) return false

  return true
}

export const cpfMiddleware = {
  validate(req, res, next) {
    const { cpf } = req.body

    if (!cpf) {
      return res.status(400).json({ error: 'CPF é obrigatório' })
    }

    if (!/^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(cpf)) {
      return res.status(400).json({ error: 'CPF deve estar no formato XXX.XXX.XXX-XX' })
    }

    if (!isValidCpf(cpf)) {
      return res.status(400).json({ error: 'CPF inválido' })
    }

    next()
  }
}
