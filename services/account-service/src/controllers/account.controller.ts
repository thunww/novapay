import { Request, Response, NextFunction } from 'express'
import { accountService } from '../services/account.service'
import { sendSuccess } from '../utils/response'

export const accountController = {
  async getBalance(req: Request, res: Response, next: NextFunction) {
    try {
      const balance = await accountService.getBalance(req.user!.id)
      return sendSuccess(res, balance)
    } catch (err) { next(err) }
  },

  async createAccount(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.body
      if (!userId) return res.status(400).json({ message: 'userId required' })
      const account = await accountService.createAccount(userId)
      return sendSuccess(res, account)
    } catch (err) { next(err) }
  },
  async getBalanceInternal(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params
      const data = await accountService.getBalance(userId)
      return sendSuccess(res, { accountId: userId, balance: data.balance, currency: data.currency })
    } catch (err) { next(err) }
  },
  async transferInternal(req: Request, res: Response, next: NextFunction) {
    try {
      const { fromUserId, toUserId, amount } = req.body
      const result = await accountService.transferFunds(fromUserId, toUserId, Number(amount))
      return sendSuccess(res, result)
    } catch (err) { next(err) }
  },
  async getAllUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const accounts = await accountService.getAllAccounts()
      return sendSuccess(res, accounts)
    } catch (err) { next(err) }
  },
}
