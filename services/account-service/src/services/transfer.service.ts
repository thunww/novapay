import prisma from '../config/prisma'
import { cacheService } from './cache.service'
import { ServiceError } from '../../../shared/types'
import { Decimal } from '@prisma/client/runtime/library'

export const transferService = {
  // Atomic debit + credit — được gọi bởi transaction-service
  async transfer(fromUserId: string, toUserId: string, amount: Decimal) {
    return prisma.$transaction(async (tx) => {
      // Lock và kiểm tra số dư sender
      const fromAccount = await tx.account.findUnique({ where: { userId: fromUserId } })
      if (!fromAccount) throw new ServiceError(404, 'Sender account not found')
      if (fromAccount.balance.lt(amount)) throw new ServiceError(400, 'Insufficient balance')

      const toAccount = await tx.account.findUnique({ where: { userId: toUserId } })
      if (!toAccount) throw new ServiceError(404, 'Receiver account not found')

      // Debit sender
      const updatedFrom = await tx.account.update({
        where: { userId: fromUserId },
        data: { balance: { decrement: amount } },
      })

      // Credit receiver
      const updatedTo = await tx.account.update({
        where: { userId: toUserId },
        data: { balance: { increment: amount } },
      })

      // Invalidate cache của cả 2
      await cacheService.invalidateBalance([fromUserId, toUserId])

      return {
        fromAccount: { id: updatedFrom.id, balance: updatedFrom.balance.toString() },
        toAccount: { id: updatedTo.id, balance: updatedTo.balance.toString() },
      }
    })
  },
}
