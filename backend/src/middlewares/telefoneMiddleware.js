export const telefoneMiddleware = {
  validate(req, res, next) {
    const { telefone } = req.body

    if (!telefone) {
      return res.status(400).json({ error: 'Telefone é obrigatório' })
    }

    if (!/^\(\d{2}\) \d{5}-\d{4}$/.test(telefone)) {
      return res.status(400).json({ error: 'Telefone deve estar no formato (XX) XXXXX-XXXX' })
    }

    next()
  }
}
