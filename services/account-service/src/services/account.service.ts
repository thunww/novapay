import prisma from '../config/prisma'
import { cacheService } from './cache.service'
import { ServiceError } from '../../../shared/types'

export const accountService = {
  async getBalance(userId: string) {
    // Cache-aside: check Redis trước
    const cached = await cacheService.getBalance(userId)
    if (cached) {
      return { ...cached, fromCache: true }
    }

    // Cache miss → query DB
    const account = await prisma.account.findUnique({ where: { userId } })
    if (!account) throw new ServiceError(404, 'Account not found')

    const data = {
      balance: account.balance.toString(),
      currency: account.currency,
    }

    // Lưu vào cache
    await cacheService.setBalance(userId, data)

    return { ...data, fromCache: false }
  },

  async getAccountByUserId(userId: string) {
    const account = await prisma.account.findUnique({ where: { userId } })
    if (!account) throw new ServiceError(404, 'Account not found')
    return account
  },

  async getAllAccounts() {
    return prisma.account.findMany()
  },
}
