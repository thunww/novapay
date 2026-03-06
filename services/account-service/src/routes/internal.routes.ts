import { Router } from 'express'
import { internalController } from '../controllers/internal.controller'

const router = Router()

// INTERNAL ONLY — không qua Kong
router.get('/api/account/internal/balance/:userId', internalController.getBalance)
router.post('/api/account/internal/transfer', internalController.transfer)

export default router
