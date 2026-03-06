import prisma from '../config/prisma'

export const transactionService = {
  async getByUserId(userId: string, page = 1, limit = 10, type?: string) {
    const skip = (page - 1) * limit

    const where = type === 'sent'
      ? { fromUserId: userId }
      : type === 'received'
      ? { toUserId: userId }
      : { OR: [{ fromUserId: userId }, { toUserId: userId }] }

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.transaction.count({ where }),
    ])

    return { transactions, total, page, totalPages: Math.ceil(total / limit) }
  },

  async getAll(page = 1, limit = 20) {
    const skip = (page - 1) * limit
    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.transaction.count(),
    ])
    return { transactions, total, page, totalPages: Math.ceil(total / limit) }
  },
}
