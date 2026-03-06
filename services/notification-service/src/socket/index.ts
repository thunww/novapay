import { Server } from 'socket.io'
import { Server as HttpServer } from 'http'
import { pubsubService } from '../services/pubsub.service'

export const initSocket = (httpServer: HttpServer): Server => {
  const io = new Server(httpServer, {
    cors: {
      origin: ['http://localhost', 'http://localhost:5173'],
      credentials: true,
    },
  })

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`)

    // Client gửi userId để join room
    socket.on('join', (userId: string) => {
      socket.join(userId)
      console.log(`User ${userId} joined room`)
    })

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`)
    })
  })

  // Bắt đầu lắng nghe Redis pub/sub
  pubsubService.startSubscriber(io)

  return io
}
