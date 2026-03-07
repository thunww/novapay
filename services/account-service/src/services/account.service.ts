import prisma from '../config/prisma'
import { cacheService } from './cache.service'
import { ServiceError } from '../../../shared/types'

export const accountService = {
  async createAccount(userId: string) {
    const existing = await prisma.account.findUnique({ where: { userId } })
    if (existing) return existing
    return await prisma.account.create({
      data: { userId, balance: 0 }
    })
  },
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

  async transferFunds(fromUserId: string, toUserId: string, amount: number) {
    const [from, to] = await Promise.all([
      prisma.account.findUnique({ where: { userId: fromUserId } }),
      prisma.account.findUnique({ where: { userId: toUserId } }),
    ])
    if (!from) throw new ServiceError(404, 'Sender account not found')
    if (!to) throw new ServiceError(404, 'Recipient account not found')
    if (Number(from.balance) < amount) throw new ServiceError(400, 'Insufficient balance')
    await prisma.$transaction([
      prisma.account.update({ where: { userId: fromUserId }, data: { balance: { decrement: amount } } }),
      prisma.account.update({ where: { userId: toUserId },   data: { balance: { increment: amount } } }),
    ])
    await Promise.all([
      cacheService.deleteBalance(fromUserId),
      cacheService.deleteBalance(toUserId),
    ])
    return { success: true }
  },
  async getAllAccounts() {
    return prisma.account.findMany()
  },
}
