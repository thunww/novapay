import prisma from '../config/prisma'
import { ServiceError } from '../../../shared/types'

export const notificationService = {
  async getByUserId(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit
    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.notification.count({ where: { userId } }),
    ])
    return { notifications, total, page, totalPages: Math.ceil(total / limit) }
  },

  async markAsRead(id: string, userId: string) {
    const notification = await prisma.notification.findUnique({ where: { id } })
    if (!notification) throw new ServiceError(404, 'Notification not found')
    if (notification.userId !== userId) throw new ServiceError(403, 'Forbidden')
    return prisma.notification.update({ where: { id }, data: { isRead: true } })
  },

  async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    })
  },

  async create(userId: string, message: string, transactionId?: string) {
    return prisma.notification.create({
      data: { userId, message, transactionId },
    })
  },
}
