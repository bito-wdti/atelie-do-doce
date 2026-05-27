import jwt from 'jsonwebtoken'
import { requiredEnv } from '../utils/env.js'

const JWT_SECRET = requiredEnv('JWT_SECRET', { minLength: 32, reject: ['pedilivery_secret'] })

function getToken(req) {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null
  return authHeader.split(' ')[1]
}

export function decodeToken(token) {
  return jwt.verify(token, JWT_SECRET)
}

export function signToken(payload, options = {}) {
  return jwt.sign(payload, JWT_SECRET, options)
}

export function requireAuth(req, res, next) {
  const token = getToken(req)

  if (!token) {
    return res.status(401).json({ error: 'Autenticacao obrigatoria' })
  }

  try {
    req.user = decodeToken(token)
    next()
  } catch (err) {
    return res.status(401).json({ error: 'Sessao invalida ou expirada' })
  }
}

export function requireAdmin(req, res, next) {
  const token = getToken(req)

  if (!token) {
    return res.status(401).json({ error: 'Autenticacao obrigatoria' })
  }

  try {
    const decoded = decodeToken(token)

    if (!['admin', 'Admin'].includes(decoded.role)) {
      return res.status(403).json({ error: 'Acesso negado' })
    }

    req.admin = decoded
    next()
  } catch (err) {
    return res.status(401).json({ error: 'Sessao invalida ou expirada' })
  }
}

export function optionalAdmin(req, res, next) {
  const token = getToken(req)
  if (!token) return next()

  try {
    const decoded = decodeToken(token)
    if (['admin', 'Admin'].includes(decoded.role)) req.admin = decoded
  } catch (err) {
    req.admin = null
  }

  next()
}
