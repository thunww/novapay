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

  async getAllUsers(req: Request, res: Response, next: NextFunction) {
    try {
      const accounts = await accountService.getAllAccounts()
      return sendSuccess(res, accounts)
    } catch (err) { next(err) }
  },
}
