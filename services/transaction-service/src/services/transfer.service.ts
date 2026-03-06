import prisma from '../config/prisma'
import { accountClient } from '../clients/account.client'
import { notificationClient } from '../clients/notification.client'
import { ServiceError } from '../../../shared/types'
import { logger } from '../utils/logger'

export const transferService = {
  async transfer(fromUserId: string, toUserId: string, amount: number, description: string) {
    if (fromUserId === toUserId) throw new ServiceError(400, 'Cannot transfer to yourself')
    if (amount <= 0) throw new ServiceError(400, 'Amount must be positive')

    // Bước 1: Kiểm tra số dư
    const fromAccount = await accountClient.getBalance(fromUserId)
    if (parseFloat(fromAccount.balance) < amount) {
      throw new ServiceError(400, 'Insufficient balance')
    }

    const toAccount = await accountClient.getBalance(toUserId)

    // Bước 2: Tạo transaction PENDING
    const transaction = await prisma.transaction.create({
      data: {
        fromUserId,
        toUserId,
        fromAccountId: fromAccount.accountId,
        toAccountId: toAccount.accountId,
        amount,
        description,
        status: 'PENDING',
      },
    })

    try {
      // Bước 3: Thực hiện debit + credit atomic
      await accountClient.transfer(fromUserId, toUserId, amount.toString())

      // Bước 4: Update status SUCCESS
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: { status: 'SUCCESS' },
      })

      // Bước 5: Gửi notification cho receiver
      try {
        await notificationClient.notify(
          toUserId,
          `Bạn nhận được ${amount.toLocaleString('vi-VN')} VND từ tài khoản của ${fromUserId}`,
          transaction.id,
        )
      } catch (notifErr) {
        // Không fail transfer nếu notification lỗi
        logger.warn({ notifErr }, 'Failed to send notification')
      }

      logger.info({ transactionId: transaction.id, amount }, 'Transfer successful')

      return { ...transaction, status: 'SUCCESS' }
    } catch (err) {
      // Bước 4 fail: Update status FAILED
      await prisma.transaction.update({
        where: { id: transaction.id },
        data: { status: 'FAILED' },
      })

      logger.error({ err, transactionId: transaction.id }, 'Transfer failed')
      throw err
    }
  },
}
