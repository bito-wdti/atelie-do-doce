export function errorHandler(err, req, res, next) {
  const status = err.status || 500
  const safeMessage = status >= 500 ? 'Erro interno no servidor' : err.message

  console.error(JSON.stringify({
    level: 'error',
    requestId: req.requestId,
    method: req.method,
    path: req.path,
    status,
    message: err.message
  }))

  return res.status(status).json({ error: safeMessage, requestId: req.requestId })
}
