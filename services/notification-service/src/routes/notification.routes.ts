import { Router } from 'express'
import { notificationController } from '../controllers/notification.controller'
import { verifyToken } from '../middlewares/verifyToken'

const router = Router()

router.get('/api/notifications', verifyToken, notificationController.getAll)
router.patch('/api/notifications/:id/read', verifyToken, notificationController.markAsRead)
router.patch('/api/notifications/read-all', verifyToken, notificationController.markAllAsRead)

router.post('/api/notifications/internal/notify', notificationController.internalNotify)
export default router
