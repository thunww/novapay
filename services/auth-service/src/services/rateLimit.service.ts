import redis from '../config/redis'

// Key pattern: login_attempts:{ip}
// Max 5 lần trong 15 phút
const PREFIX = 'login_attempts:'
const MAX_ATTEMPTS = 5
const WINDOW_SECONDS = 15 * 60  // 15 phút

export const rateLimitService = {
  async checkAndIncrement(ip: string): Promise<{ allowed: boolean; remaining: number }> {
    const key = `${PREFIX}${ip}`
    const current = await redis.get(key)
    const attempts = current ? parseInt(current) : 0

    if (attempts >= MAX_ATTEMPTS) {
      return { allowed: false, remaining: 0 }
    }

    // Increment + set TTL nếu là lần đầu
    const newCount = await redis.incr(key)
    if (newCount === 1) {
      await redis.expire(key, WINDOW_SECONDS)
    }

    return {
      allowed: true,
      remaining: MAX_ATTEMPTS - newCount,
    }
  },

  async reset(ip: string): Promise<void> {
    await redis.del(`${PREFIX}${ip}`)
  },
}
