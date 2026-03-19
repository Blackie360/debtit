'use client'

import { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { Transaction } from '@/src/lib/types'

interface EditDebtDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  transaction: Transaction | null
  onSubmit: (data: { id: string; amount?: number; paidBy?: 'you' | 'them'; note?: string; status?: string }) => Promise<void>
}

export function EditDebtDialog ({
  open,
  onOpenChange,
  transaction,
  onSubmit,
}: EditDebtDialogProps) {
  const [amount, setAmount] = useState('')
  const [paidBy, setPaidBy] = useState<'you' | 'them'>('you')
  const [note, setNote] = useState('')
  const [status, setStatus] = useState('owed_to_you')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (open && transaction) {
      setAmount(String(transaction.amount))
      setPaidBy(transaction.paidBy)
      setNote(transaction.note ?? '')
      setStatus(transaction.status)
    }
  }, [open, transaction])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!transaction) return
    const num = parseFloat(amount)
    if (isNaN(num) || num <= 0) return

    setIsSubmitting(true)
    try {
      await onSubmit({
        id: transaction.id,
        amount: num,
        paidBy,
        note: note || undefined,
        status,
      })
      onOpenChange(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Debt</DialogTitle>
          <DialogDescription>Update the debt details below.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium">Amount</label>
            <Input
              type="text"
              inputMode="decimal"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Who paid?</label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={paidBy === 'you' ? 'default' : 'outline'}
                className="flex-1"
                onClick={() => setPaidBy('you')}
                disabled={isSubmitting}
              >
                You paid
              </Button>
              <Button
                type="button"
                variant={paidBy === 'them' ? 'default' : 'outline'}
                className="flex-1"
                onClick={() => setPaidBy('them')}
                disabled={isSubmitting}
              >
                They paid
              </Button>
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Note</label>
            <Input
              placeholder="What was this for?"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">Status</label>
            <div className="flex gap-2">
              {['owed_to_you', 'you_owe', 'settled'].map((s) => (
                <Button
                  key={s}
                  type="button"
                  variant={status === s ? 'default' : 'outline'}
                  className="flex-1 text-xs"
                  onClick={() => setStatus(s)}
                  disabled={isSubmitting}
                >
                  {s === 'owed_to_you' ? 'Owed to you' : s === 'you_owe' ? 'You owe' : 'Settled'}
                </Button>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
