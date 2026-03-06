import redis from '../config/redis'

// Key pattern: blacklist:{jti}
// TTL = thời gian còn lại của token (không lưu token đã expired)
const BLACKLIST_PREFIX = 'blacklist:'

export const blacklistService = {
  // Thêm token vào blacklist khi logout
  async add(jti: string, ttlSeconds: number): Promise<void> {
    if (ttlSeconds <= 0) return  // token đã expired, không cần blacklist
    await redis.set(`${BLACKLIST_PREFIX}${jti}`, '1', 'EX', ttlSeconds)
  },

  // Check token có trong blacklist không
  async isBlacklisted(jti: string): Promise<boolean> {
    const result = await redis.get(`${BLACKLIST_PREFIX}${jti}`)
    return result === '1'
  },
}
