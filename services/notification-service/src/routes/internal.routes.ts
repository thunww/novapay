import { Router } from 'express'
import { internalController } from '../controllers/internal.controller'

const router = Router()

router.post('/api/notifications/internal/notify', internalController.notify)

export default router
