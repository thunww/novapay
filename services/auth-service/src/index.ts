import express from 'express'
import cookieParser from 'cookie-parser'
import { env } from './config/env'
import { logger } from './utils/logger'
import { errorHandler } from './middlewares/errorHandler'
import authRoutes from './routes/auth.routes'
import redis from './config/redis'
import prisma from './config/prisma'

const app = express()

app.use(express.json())
app.use(cookieParser())

// Routes
app.use(authRoutes)

// Health checks
app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'auth-service' }))

app.get('/ready', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`
    await redis.ping()
    res.json({ status: 'ready' })
  } catch (err) {
    res.status(503).json({ status: 'not ready', error: String(err) })
  }
})

app.get('/metrics', (_req, res) => {
  res.set('Content-Type', 'text/plain')
  res.send('# auth-service metrics\n')
})

// Error handler — phải đặt cuối cùng
app.use(errorHandler)

app.listen(env.PORT, () => {
  logger.info(`auth-service running on port ${env.PORT}`)
})

export default app
