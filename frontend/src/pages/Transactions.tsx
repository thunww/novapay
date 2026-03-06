import { useEffect, useState } from 'react'
import { transactionApi } from '../api/transaction'
import { useAuthStore } from '../stores/auth.store'
import { Transaction } from '../types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export default function Transactions() {
  const { user } = useAuthStore()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filter, setFilter] = useState<'all' | 'sent' | 'received'>('all')
  const [loading, setLoading] = useState(true)

  const fetchTransactions = async () => {
    setLoading(true)
    try {
      const res = await transactionApi.getTransactions({
        page, limit: 10,
        type: filter === 'all' ? undefined : filter,
      })
      const data = res.data.data
      setTransactions(data.transactions || data || [])
      setTotalPages(data.totalPages || 1)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchTransactions() }, [page, filter])

  const formatVND = (amount: string) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(Number(amount))

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {(['all', 'sent', 'received'] as const).map((f) => (
          <Button key={f} variant={filter === f ? 'default' : 'outline'} size="sm"
            onClick={() => { setFilter(f); setPage(1) }}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </Button>
        ))}
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Transaction History</CardTitle></CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-center py-8 text-slate-500">Loading...</p>
          ) : transactions.length === 0 ? (
            <p className="text-center py-8 text-slate-500">No transactions found</p>
          ) : (
            <div className="space-y-3">
              {transactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between py-3 border-b last:border-0">
                  <div>
                    <p className="text-sm font-medium">
                      {tx.fromUserId === user?.id ? '→ Sent' : '← Received'}
                    </p>
                    <p className="text-xs text-slate-500">{tx.description || 'No description'}</p>
                    <p className="text-xs text-slate-400">{new Date(tx.createdAt).toLocaleString('vi-VN')}</p>
                  </div>
                  <div className="text-right space-y-1">
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
          <div className="flex justify-between items-center mt-4">
            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
            <span className="text-sm text-slate-500">Page {page} / {totalPages}</span>
            <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
