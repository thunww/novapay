import redis from '../config/redis'

// Key pattern: balance:{userId}
// TTL: 30 giây — ngắn vì balance thay đổi sau mỗi transfer
const BALANCE_PREFIX = 'balance:'
const BALANCE_TTL = 30

export interface CachedBalance {
  balance: string
  currency: string
}

export const cacheService = {
  // Cache-aside pattern: check cache trước, miss thì query DB
  async getBalance(userId: string): Promise<CachedBalance | null> {
    const cached = await redis.get(`${BALANCE_PREFIX}${userId}`)
    if (!cached) return null
    return JSON.parse(cached) as CachedBalance
  },

  async setBalance(userId: string, data: CachedBalance): Promise<void> {
    await redis.set(
      `${BALANCE_PREFIX}${userId}`,
      JSON.stringify(data),
      'EX',
      BALANCE_TTL
    )
  },

  // Invalidate cache sau khi transfer
  // Xóa cả 2 users vì balance của cả 2 đều thay đổi
  async invalidateBalance(userIds: string[]): Promise<void> {
    const keys = userIds.map(id => `${BALANCE_PREFIX}${id}`)
    if (keys.length > 0) await redis.del(...keys)
  },
}
