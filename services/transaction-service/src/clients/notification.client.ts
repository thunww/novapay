import axios from 'axios'
import { env } from '../config/env'

const client = axios.create({ baseURL: env.NOTIFICATION_SERVICE_URL, timeout: 5000 })

const internalHeaders = { 'x-internal-secret': env.INTERNAL_SECRET }

export const notificationClient = {
  async notify(userId: string, message: string, transactionId: string) {
    await client.post('/api/notifications/internal/notify', {
      userId, message, transactionId,
    }, { headers: internalHeaders })
  },
}
