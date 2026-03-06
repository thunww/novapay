import redis from '../config/redis'

const BALANCE_PREFIX = 'balance:'
const BALANCE_TTL = 30

export interface CachedBalance {
  balance: string
  currency: string
}

export const cacheService = {
  async getBalance(userId: string): Promise<CachedBalance | null> {
    const cached = await redis.get(`${BALANCE_PREFIX}${userId}`)
    if (!cached) return null
    return JSON.parse(cached) as CachedBalance
  },

  async setBalance(userId: string, data: CachedBalance): Promise<void> {
    await redis.set(`${BALANCE_PREFIX}${userId}`, JSON.stringify(data), 'EX', BALANCE_TTL)
  },

  async invalidateBalance(userIds: string[]): Promise<void> {
    const keys = userIds.map(id => `${BALANCE_PREFIX}${id}`)
    if (keys.length > 0) await redis.del(...keys)
  },
}
