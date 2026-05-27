const buckets = new Map()

export function securityHeaders(req, res, next) {
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'DENY')
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  next()
}

export function rateLimit({ windowMs = 60000, max = 60, keyPrefix = 'global' } = {}) {
  return (req, res, next) => {
    const now = Date.now()
    const ip = req.ip || req.socket.remoteAddress || 'unknown'
    const key = `${keyPrefix}:${ip}`
    const bucket = buckets.get(key)

    if (!bucket || bucket.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + windowMs })
      return next()
    }

    bucket.count += 1
    if (bucket.count > max) {
      return res.status(429).json({ error: 'Muitas tentativas. Aguarde e tente novamente.' })
    }

    next()
  }
}
