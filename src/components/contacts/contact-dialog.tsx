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

interface ContactDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: { name: string; phone: string; avatarUrl?: string }) => Promise<void>
  initialData?: { name: string; phone: string; avatarUrl?: string }
  title?: string
  description?: string
}

export function ContactDialog ({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  title = 'Add New Contact',
  description = 'Enter the contact details. Name and phone are required.',
}: ContactDialogProps) {
  const [name, setName] = useState(initialData?.name ?? '')
  const [phone, setPhone] = useState(initialData?.phone ?? '')
  const [avatarUrl, setAvatarUrl] = useState(initialData?.avatarUrl ?? '')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setName(initialData?.name ?? '')
      setPhone(initialData?.phone ?? '')
      setAvatarUrl(initialData?.avatarUrl ?? '')
      setError(null)
    }
  }, [open, initialData])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return setError('Name is required')
    if (!phone.trim()) return setError('Phone number is required')

    setIsSubmitting(true)
    setError(null)
    try {
      await onSubmit({ name: name.trim(), phone: phone.trim(), avatarUrl: avatarUrl.trim() || undefined })
      onOpenChange(false)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Name <span className="text-red-500">*</span>
            </label>
            <Input
              placeholder="e.g. Sarah Jenkins"
              value={name}
              onChange={(e) => { setName(e.target.value); setError(null) }}
              disabled={isSubmitting}
              autoFocus
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Phone <span className="text-red-500">*</span>
            </label>
            <Input
              type="tel"
              placeholder="e.g. +1 234 567 890"
              value={phone}
              onChange={(e) => { setPhone(e.target.value); setError(null) }}
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">
              Avatar URL <span className="text-muted-foreground">(optional)</span>
            </label>
            <Input
              placeholder="https://..."
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
              {initialData ? 'Save Changes' : 'Add Contact'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
