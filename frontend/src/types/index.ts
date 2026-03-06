export interface User {
  id: string
  username: string
  email: string
  role: 'USER' | 'ADMIN'
  createdAt: string
}

export interface Balance {
  balance: string
  currency: string
  fromCache: boolean
}

export interface Transaction {
  id: string
  fromUserId: string
  toUserId: string
  amount: string
  description: string
  status: 'PENDING' | 'SUCCESS' | 'FAILED'
  createdAt: string
}

export interface Notification {
  id: string
  userId: string
  message: string
  isRead: boolean
  transactionId?: string
  createdAt: string
}
