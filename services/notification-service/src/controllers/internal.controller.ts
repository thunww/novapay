import { Request, Response, NextFunction } from 'express'
import { notificationService } from '../services/notification.service'
import { pubsubService } from '../services/pubsub.service'
import { sendSuccess, sendError } from '../utils/response'
import { env } from '../config/env'

export const internalController = {
  async notify(req: Request, res: Response, next: NextFunction) {
    try {
      const secret = req.headers['x-internal-secret']
      if (secret !== env.INTERNAL_SECRET) return sendError(res, 'Unauthorized', 401)

      const { userId, message, transactionId } = req.body

      // Lưu vào DB
      const notification = await notificationService.create(userId, message, transactionId)

      // Publish lên Redis → subscriber emit socket event
      await pubsubService.publish(userId, {
        id: notification.id,
        message: notification.message,
        transactionId: notification.transactionId,
        createdAt: notification.createdAt,
      })

      return sendSuccess(res, notification, 'Notification sent')
    } catch (err) { next(err) }
  },
}
