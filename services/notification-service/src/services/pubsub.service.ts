import { redis, redisSub } from '../config/redis'
import { Server } from 'socket.io'

const CHANNEL_PREFIX = 'notifications:'

export const pubsubService = {
  async publish(userId: string, data: object): Promise<void> {
    await redis.publish(`${CHANNEL_PREFIX}${userId}`, JSON.stringify(data))
  },

  startSubscriber(io: Server): void {
    redisSub.psubscribe(`${CHANNEL_PREFIX}*`, (err) => {
      if (err) return console.error('Subscribe error:', err)
      console.log('✓ Redis Pub/Sub subscriber started')
    })

    redisSub.on('pmessage', (_pattern, channel, message) => {
      const userId = channel.replace(CHANNEL_PREFIX, '')
      const data = JSON.parse(message)
      io.to(userId).emit('notification', data)
      console.log(`→ Emitted notification to user ${userId}`)
    })
  },
}
