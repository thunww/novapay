import { api } from './client'
export const transactionApi = {
  transfer: (data: { toUserId: string; amount: number; description: string }) =>
    api.post('/transfer', data),
  getTransactions: (params?: { page?: number; limit?: number; type?: string }) =>
    api.get('/transactions', { params }),
}
