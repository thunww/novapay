import axios from 'axios'
import { env } from '../config/env'
import { AuthUser } from '../../../shared/types'

const client = axios.create({ baseURL: env.AUTH_SERVICE_URL, timeout: 5000 })

export const verifyToken = async (token: string): Promise<AuthUser> => {
  const res = await client.get('/api/auth/verify', {
    headers: { Authorization: `Bearer ${token}` },
  })
  return res.data.data.user as AuthUser
}
