export function errorHandler(err, req, res, next) {
  console.error(`[${new Date().toISOString()}] ERROR:`, err.message)

  const status = err.status || 500
  const message = err.message || 'Erro interno no servidor'

  return res.status(status).json({ error: message })
}
