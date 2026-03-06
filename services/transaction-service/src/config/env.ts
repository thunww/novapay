import { z } from 'zod'

const schema = z.object({
  NODE_ENV:                  z.enum(['development', 'production', 'test']).default('development'),
  PORT:                      z.string().default('3003').transform(Number),
  DATABASE_URL:              z.string().min(1),
  AUTH_SERVICE_URL:          z.string().min(1),
  ACCOUNT_SERVICE_URL:       z.string().min(1),
  NOTIFICATION_SERVICE_URL:  z.string().min(1),
  INTERNAL_SECRET:           z.string().min(1),
})

const parsed = schema.safeParse(process.env)
if (!parsed.success) {
  console.error('❌ Invalid environment variables:')
  console.error(parsed.error.flatten().fieldErrors)
  process.exit(1)
}

export const env = parsed.data
