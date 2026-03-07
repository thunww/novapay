import { Router } from 'express'
import { accountController } from '../controllers/account.controller'
import { verifyToken } from '../middlewares/verifyToken'
import { isAdmin } from '../middlewares/isAdmin'

const router = Router()

router.get('/api/account/balance', verifyToken, accountController.getBalance)
router.get('/api/admin/users', verifyToken, isAdmin, accountController.getAllUsers)

router.post('/api/account/internal/create', accountController.createAccount)
router.get('/api/account/internal/balance/:userId', accountController.getBalanceInternal)
router.post('/api/account/internal/transfer', accountController.transferInternal)
export default router
