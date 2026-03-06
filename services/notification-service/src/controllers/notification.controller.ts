import { Request, Response, NextFunction } from 'express'
import { notificationService } from '../services/notification.service'
import { sendSuccess } from '../utils/response'

export const notificationController = {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const page = Number(req.query.page) || 1
      const limit = Number(req.query.limit) || 20
      const result = await notificationService.getByUserId(req.user!.id, page, limit)
      return sendSuccess(res, result.notifications, undefined, 200)
    } catch (err) { next(err) }
  },

  async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const notification = await notificationService.markAsRead(req.params.id, req.user!.id)
      return sendSuccess(res, notification)
    } catch (err) { next(err) }
  },

  async markAllAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      await notificationService.markAllAsRead(req.user!.id)
      return sendSuccess(res, null, 'All notifications marked as read')
    } catch (err) { next(err) }
  },
}
