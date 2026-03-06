import { Request, Response, NextFunction } from 'express'
import { transferService } from '../services/transfer.service'
import { sendSuccess } from '../utils/response'
import { z } from 'zod'

const transferSchema = z.object({
  toUserId: z.string().uuid(),
  amount: z.number().positive(),
  description: z.string().default(''),
})

export const transferController = {
  async transfer(req: Request, res: Response, next: NextFunction) {
    try {
      const body = transferSchema.parse(req.body)
      const result = await transferService.transfer(
        req.user!.id,
        body.toUserId,
        body.amount,
        body.description,
      )
      return sendSuccess(res, result, 'Transfer successful', 201)
    } catch (err) { next(err) }
  },
}
