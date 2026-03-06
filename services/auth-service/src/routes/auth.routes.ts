import { Router } from 'express'
import { authController } from '../controllers/auth.controller'
import { verifyToken } from '../middlewares/verifyToken'

const router = Router()

router.post('/api/auth/register', authController.register)
router.post('/api/auth/login',    authController.login)
router.post('/api/auth/logout',   verifyToken, authController.logout)
router.post('/api/auth/refresh',  authController.refresh)

// INTERNAL — chỉ services khác gọi, không expose qua Kong
router.get('/api/auth/verify', verifyToken, authController.verify)

// Public — lấy thông tin user hiện tại
router.get('/api/me', verifyToken, authController.getMe)

export default router
