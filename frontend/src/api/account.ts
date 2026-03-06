import { api } from './client'
export const accountApi = {
  getBalance: () => api.get('/account/balance'),
}
