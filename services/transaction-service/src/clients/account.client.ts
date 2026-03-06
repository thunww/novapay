import axios from 'axios'
import { env } from '../config/env'

const client = axios.create({ baseURL: env.ACCOUNT_SERVICE_URL, timeout: 5000 })

const internalHeaders = { 'x-internal-secret': env.INTERNAL_SECRET }

export const accountClient = {
  async getBalance(userId: string) {
    const res = await client.get(`/api/account/internal/balance/${userId}`, {
      headers: internalHeaders,
    })
    return res.data.data as { accountId: string; balance: string; currency: string }
  },

  async transfer(fromUserId: string, toUserId: string, amount: string) {
    const res = await client.post('/api/account/internal/transfer', {
      fromUserId, toUserId, amount,
    }, { headers: internalHeaders })
    return res.data.data
  },
}
