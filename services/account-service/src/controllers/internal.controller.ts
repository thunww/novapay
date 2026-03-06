import { Request, Response, NextFunction } from 'express'
import { accountService } from '../services/account.service'
import { transferService } from '../services/transfer.service'
import { sendSuccess, sendError } from '../utils/response'
import { env } from '../config/env'
import { Decimal } from '@prisma/client/runtime/library'

// Verify internal secret
const verifyInternalSecret = (req: Request, res: Response): boolean => {
  const secret = req.headers['x-internal-secret']
  if (secret !== env.INTERNAL_SECRET) {
    sendError(res, 'Unauthorized internal call', 401)
    return false
  }
  return true
}

export const internalController = {
  async getBalance(req: Request, res: Response, next: NextFunction) {
    try {
      if (!verifyInternalSecret(req, res)) return
      const { userId } = req.params
      const account = await accountService.getAccountByUserId(userId)
      return sendSuccess(res, {
        accountId: account.id,
        balance: account.balance.toString(),
        currency: account.currency,
      })
    } catch (err) { next(err) }
  },

  async transfer(req: Request, res: Response, next: NextFunction) {
    try {
      if (!verifyInternalSecret(req, res)) return
      const { fromUserId, toUserId, amount } = req.body
      const result = await transferService.transfer(fromUserId, toUserId, new Decimal(amount))
      return sendSuccess(res, result)
    } catch (err) { next(err) }
  },
}
