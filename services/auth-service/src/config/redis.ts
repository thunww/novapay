import Redis from 'ioredis'
import { env } from './env'

// Singleton Redis client
const redis = new Redis(env.REDIS_URL, {
  lazyConnect: true,
  maxRetriesPerRequest: 3,
})

redis.on('connect', () => console.log('✓ Redis connected'))
redis.on('error', (err) => console.error('Redis error:', err))

export default redis
