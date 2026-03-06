import http from 'http'
import express from 'express'
import cookieParser from 'cookie-parser'
import { env } from './config/env'
import { logger } from './utils/logger'
import { errorHandler } from './middlewares/errorHandler'
import notificationRoutes from './routes/notification.routes'
import internalRoutes from './routes/internal.routes'
import { initSocket } from './socket/index'
import { redis } from './config/redis'
import prisma from './config/prisma'

const app = express()
const httpServer = http.createServer(app)

app.use(express.json())
app.use(cookieParser())

app.use(notificationRoutes)
app.use(internalRoutes)

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'notification-service' }))

app.get('/ready', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`
    await redis.ping()
    res.json({ status: 'ready' })
  } catch (err) {
    res.status(503).json({ status: 'not ready', error: String(err) })
  }
})

app.use(errorHandler)

// Init Socket.io
initSocket(httpServer)

httpServer.listen(env.PORT, () => {
  logger.info(`notification-service running on port ${env.PORT}`)
})

export default app
