import { config } from 'dotenv'
config()  // load .env trước khi parse
import { z } from 'zod'

const schema = z.object({
  NODE_ENV:                z.enum(['development', 'production', 'test']).default('development'),
  PORT:                    z.string().default('3001').transform(Number),
  DATABASE_URL:            z.string().min(1),
  REDIS_URL:               z.string().min(1),
  JWT_SECRET:              z.string().min(32),
  JWT_ACCESS_EXPIRES_IN:   z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN:  z.string().default('7d'),
  INTERNAL_SECRET:         z.string().min(1),
  ACCOUNT_SERVICE_URL:     z.string().url().default('http://localhost:3002'),
})

const parsed = schema.safeParse(process.env)

if (!parsed.success) {
  console.error('❌ Invalid environment variables:')
  console.error(parsed.error.flatten().fieldErrors)
  process.exit(1)  // crash ngay nếu thiếu env
}

export const env = parsed.data
