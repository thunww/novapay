import Redis from 'ioredis'
import { env } from './env'

export const redis = new Redis(env.REDIS_URL, {
  lazyConnect: true,
  maxRetriesPerRequest: 3,
})

// Subscriber cần client riêng vì khi subscribe thì bị block
export const redisSub = new Redis(env.REDIS_URL, {
  lazyConnect: true,
  maxRetriesPerRequest: 3,
})

redis.on('connect', () => console.log('✓ Redis connected'))
redisSub.on('connect', () => console.log('✓ Redis subscriber connected'))
redis.on('error', (err) => console.error('Redis error:', err))
redisSub.on('error', (err) => console.error('Redis sub error:', err))
