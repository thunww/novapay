import express from 'express'
import cookieParser from 'cookie-parser'
import { env } from './config/env'
import { logger } from './utils/logger'
import { errorHandler } from './middlewares/errorHandler'
import routes from './routes/index'
import prisma from './config/prisma'

const app = express()

app.use(express.json())
app.use(cookieParser())
app.use(routes)

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'transaction-service' }))

app.get('/ready', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`
    res.json({ status: 'ready' })
  } catch (err) {
    res.status(503).json({ status: 'not ready', error: String(err) })
  }
})

app.use(errorHandler)

app.listen(env.PORT, () => {
  logger.info(`transaction-service running on port ${env.PORT}`)
})

export default app
