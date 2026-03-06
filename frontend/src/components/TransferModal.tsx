import { useState } from 'react'
import { transactionApi } from '../api/transaction'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Props { onSuccess: () => void }

export default function TransferModal({ onSuccess }: Props) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({ toUserId: '', amount: '', description: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')
    try {
      await transactionApi.transfer({
        toUserId: form.toUserId,
        amount: Number(form.amount),
        description: form.description,
      })
      setSuccess('Transfer successful!')
      setForm({ toUserId: '', amount: '', description: '' })
      onSuccess()
      setTimeout(() => { setOpen(false); setSuccess('') }, 1500)
    } catch (err: any) {
      setError(err.response?.data?.error || 'Transfer failed')
    } finally {
      setLoading(false)
    }
  }

  if (!open) return (
    <Button onClick={() => setOpen(true)} className="bg-blue-600 hover:bg-blue-700">
      💸 Transfer Money
    </Button>
  )

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader><CardTitle>Transfer Money</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Recipient User ID</Label>
              <Input placeholder="Enter user ID" value={form.toUserId}
                onChange={(e) => setForm({ ...form, toUserId: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label>Amount (VND)</Label>
              <Input type="number" placeholder="100000" value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })} required min="1000" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input placeholder="Payment for..." value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            {success && <p className="text-sm text-green-500">{success}</p>}
            <div className="flex gap-2">
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? 'Processing...' : 'Send Money'}
              </Button>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
