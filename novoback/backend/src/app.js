import 'dotenv/config'
import express from 'express'
import cors from 'cors'

import authRoutes from './routes/authRoutes.js'
import productRoutes from './routes/productRoutes.js'
import orderRoutes from './routes/orderRoutes.js'
import settingsRoutes from './routes/settingsRoutes.js'
import userRoutes from './routes/userRoutes.js'
import { errorHandler } from './middlewares/errorHandler.js'
import { rateLimit, securityHeaders } from './middlewares/security.js'

const app = express()
const PORT = process.env.PORT || 3001
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173,http://localhost:3000')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean)

app.disable('x-powered-by')
app.use(securityHeaders)
app.use(rateLimit({ windowMs: 60000, max: 240, keyPrefix: 'api' }))

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true)
    return callback(new Error('Origem nao permitida pelo CORS'))
  },
  credentials: true
}))

app.use(express.json({ limit: '5mb' }))

app.use((req, res, next) => {
  req.requestId = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
  res.setHeader('X-Request-Id', req.requestId)
  next()
})

app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/settings', settingsRoutes)
app.use('/api/users', userRoutes)

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.use((req, res) => {
  res.status(404).json({ error: `Rota ${req.method} ${req.path} nao encontrada` })
})

app.use(errorHandler)

app.listen(PORT, () => {
  console.log(JSON.stringify({
    level: 'info',
    message: 'Pedilivery Backend iniciado',
    port: PORT,
    endpoints: ['/api/health', '/api/auth/login', '/api/products', '/api/orders', '/api/settings']
  }))
})

export default app
