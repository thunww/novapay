import { Router } from 'express'
import { transferController } from '../controllers/transfer.controller'
import { transactionController } from '../controllers/transaction.controller'
import { verifyToken } from '../middlewares/verifyToken'

const router = Router()

router.post('/api/transfer', verifyToken, transferController.transfer)
router.get('/api/transactions', verifyToken, transactionController.getAll)
router.get('/api/admin/transactions', verifyToken, transactionController.adminGetAll)

export default router
