import { useEffect, useState } from 'react'
import { accountApi } from '../api/account'
import { transactionApi } from '../api/transaction'
import { useAuthStore } from '../stores/auth.store'
import { Balance, Transaction } from '../types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import TransferModal from '../components/TransferModal'

export default function Dashboard() {
  const { user } = useAuthStore()
  const [balance, setBalance] = useState<Balance | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    try {
      const [balRes, txRes] = await Promise.all([
        accountApi.getBalance(),
        transactionApi.getTransactions({ limit: 5 }),
      ])
      setBalance(balRes.data.data)
      setTransactions(txRes.data.data || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  const formatVND = (amount: string) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(amount))

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <p className="text-slate-500">Loading...</p>
    </div>
  )

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <CardHeader>
          <CardTitle className="text-sm font-medium opacity-80">Available Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-4xl font-bold">
            {balance ? formatVND(balance.balance) : '---'}
          </p>
          <p className="text-sm opacity-70 mt-1">{user?.username}</p>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <TransferModal onSuccess={fetchData} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <p className="text-center text-slate-500 py-8">No transactions yet</p>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="text-sm font-medium">
                      {tx.fromUserId === user?.id ? '→ Sent' : '← Received'}
                    </p>
                    <p className="text-xs text-slate-500">{tx.description || 'No description'}</p>
                    <p className="text-xs text-slate-400">
                      {new Date(tx.createdAt).toLocaleString('vi-VN')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${tx.fromUserId === user?.id ? 'text-red-500' : 'text-green-500'}`}>
                      {tx.fromUserId === user?.id ? '-' : '+'}{formatVND(tx.amount)}
                    </p>
                    <Badge variant={tx.status === 'SUCCESS' ? 'default' : tx.status === 'FAILED' ? 'destructive' : 'secondary'}>
                      {tx.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
