import Redis from 'ioredis'
import { env } from './env'

// Client thường — dùng để publish + query
export const redis = new Redis(env.REDIS_URL, {
  lazyConnect: true,
  maxRetriesPerRequest: 3,
})

// Client riêng cho subscriber — khi subscribe thì bị "block"
// không dùng được cho lệnh khác
export const redisSub = new Redis(env.REDIS_URL, {
  lazyConnect: true,
  maxRetriesPerRequest: 3,
})

redis.on('connect', () => console.log('✓ Redis connected'))
redisSub.on('connect', () => console.log('✓ Redis subscriber connected'))
redis.on('error', (err) => console.error('Redis error:', err))
redisSub.on('error', (err) => console.error('Redis subscriber error:', err))
