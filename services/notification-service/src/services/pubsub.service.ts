import { redis, redisSub } from '../config/redis'
import { Server } from 'socket.io'

// Channel pattern: notifications:{userId}
const CHANNEL_PREFIX = 'notifications:'

export const pubsubService = {
  // Publisher — transaction-service gọi sau transfer thành công
  async publish(userId: string, data: object): Promise<void> {
    const channel = `${CHANNEL_PREFIX}${userId}`
    await redis.publish(channel, JSON.stringify(data))
  },

  // Subscriber — chạy 1 lần khi service khởi động
  // Lắng nghe tất cả channels, emit socket event khi có message
  startSubscriber(io: Server): void {
    // Subscribe theo pattern — lắng nghe mọi userId
    redisSub.psubscribe(`${CHANNEL_PREFIX}*`, (err) => {
      if (err) {
        console.error('Failed to subscribe:', err)
        return
      }
      console.log('✓ Redis Pub/Sub subscriber started')
    })

    redisSub.on('pmessage', (_pattern, channel, message) => {
      // Extract userId từ channel name
      const userId = channel.replace(CHANNEL_PREFIX, '')
      const data = JSON.parse(message)

      // Emit tới room của userId
      // Client đã join room này khi kết nối WebSocket
      io.to(userId).emit('notification', data)
      console.log(`→ Emitted notification to user ${userId}`)
    })
  },
}
