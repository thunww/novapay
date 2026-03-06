import { Request, Response, NextFunction } from 'express'
import { transactionService } from '../services/transaction.service'
import { sendSuccess } from '../utils/response'

export const transactionController = {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const page = Number(req.query.page) || 1
      const limit = Number(req.query.limit) || 10
      const type = req.query.type as string | undefined
      const result = await transactionService.getByUserId(req.user!.id, page, limit, type)
      return sendSuccess(res, result.transactions, undefined, 200)
    } catch (err) { next(err) }
  },

  async adminGetAll(req: Request, res: Response, next: NextFunction) {
    try {
      const page = Number(req.query.page) || 1
      const limit = Number(req.query.limit) || 20
      const result = await transactionService.getAll(page, limit)
      return sendSuccess(res, result)
    } catch (err) { next(err) }
  },
}
