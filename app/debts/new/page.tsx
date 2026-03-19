'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Search, ArrowRight, Plus, User, X } from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SmartInput } from '@/src/components/common/smart-input'
import { ContactDialog } from '@/src/components/contacts/contact-dialog'
import { useDebtStore } from '@/src/store/debt-store'
import { useUserCurrency } from '@/src/hooks/use-user-currency'
import { cn } from '@/lib/utils'
import { getContacts, createContact } from '@/app/actions/contacts'
import { createDebt } from '@/app/actions/debts'
import type { ParsedDebt } from '@/app/actions/parse-debt'

export default function AddDebtPage () {
  const router = useRouter()
  const currency = useUserCurrency()
  const queryClient = useQueryClient()
  const [amount, setAmount] = useState('')
  const [personId, setPersonId] = useState<string | null>(null)
  const [paidBy, setPaidBy] = useState<'you' | 'them'>('you')
  const [note, setNote] = useState('')
  const [search, setSearch] = useState('')
  const [smartFilled, setSmartFilled] = useState(false)
  const [contactDialogOpen, setContactDialogOpen] = useState(false)

  const people = useDebtStore((s) => s.people)
  const setPeople = useDebtStore((s) => s.setPeople)
  const addPerson = useDebtStore((s) => s.addPerson)

  const { data: contactsData } = useQuery({
    queryKey: ['contacts'],
    queryFn: () => getContacts(),
  })

  useEffect(() => {
    if (contactsData) {
      setPeople(contactsData.map((c: { id: string; name: string; phone: string; avatarUrl: string | null }) => ({
        id: c.id,
        name: c.name,
        phone: c.phone,
        avatarUrl: c.avatarUrl ?? undefined,
      })))
    }
  }, [contactsData, setPeople])

  const createContactMutation = useMutation({
    mutationFn: createContact,
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
      if (result && 'id' in result && result.id) {
        const { id, name, phone } = result as { id: string; name: string; phone: string; avatarUrl: string | null }
        addPerson({ id, name, phone, avatarUrl: (result as { avatarUrl: string | null }).avatarUrl ?? undefined })
        setPersonId(id)
      }
    },
  })

  const createDebtMutation = useMutation({
    mutationFn: createDebt,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['debts'] })
      queryClient.invalidateQueries({ queryKey: ['recentTransactions'] })
      router.push('/dashboard')
    },
  })

  const handleSmartParsed = useCallback((data: ParsedDebt) => {
    setAmount(String(data.amount))
    setPaidBy(data.direction === 'owed' ? 'you' : 'them')
    if (data.note) setNote(data.note)

    const match = people.find(
      (p) => p.name.toLowerCase() === data.person.toLowerCase()
    )
    if (match) {
      setPersonId(match.id)
    }

    setSmartFilled(true)
  }, [people])

  const filtered = people.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const num = parseFloat(amount.replace(/[^0-9.]/g, ''))
    if (!personId || isNaN(num) || num <= 0) return

    await createDebtMutation.mutateAsync({
      personId,
      amount: num,
      paidBy,
      note: note || undefined,
    })
  }

  return (
    <div className="min-h-screen bg-muted/30">
      <header className="flex items-center justify-between border-b border-border bg-background px-4 py-3">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary">
            <span className="text-sm font-bold text-primary-foreground">D</span>
          </div>
          <span className="font-semibold">Deni</span>
        </Link>
        <Link
          href="/dashboard"
          className="rounded-full p-2 text-muted-foreground hover:bg-muted"
        >
          <X className="size-5" />
        </Link>
      </header>

      <main className="mx-auto max-w-md px-4 py-8">
        <Card className="rounded-2xl border border-border/60 shadow-sm">
          <CardHeader className="text-center">
            <h1 className="text-xl font-bold">Add a debt</h1>
            <p className="text-sm text-muted-foreground">
              Enter the details of your transaction
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <SmartInput
              knownPeople={people.map((p) => p.name)}
              userCurrency={currency}
              onParsed={handleSmartParsed}
            />

            {smartFilled && (
              <div className="rounded-lg bg-green-50 px-3 py-2 text-sm text-green-700 dark:bg-green-950/30 dark:text-green-400">
                Fields auto-filled! Review and save below.
              </div>
            )}

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">or fill manually</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Amount
                </label>
                <Input
                  type="text"
                  inputMode="decimal"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) =>
                    setAmount(e.target.value.replace(/[^0-9.]/g, ''))
                  }
                  className="h-14 text-center text-2xl font-semibold"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Who is this with?
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search or select person"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setContactDialogOpen(true)}
                    className={cn(
                      'flex size-12 flex-col items-center justify-center rounded-full border-2 transition-colors',
                      'border-border hover:border-primary/50'
                    )}
                  >
                    <Plus className="size-5" />
                    <span className="text-xs">New</span>
                  </button>
                  {filtered.slice(0, 5).map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setPersonId(p.id)}
                      className={cn(
                        'flex size-12 flex-col items-center justify-center rounded-full border-2 transition-colors',
                        personId === p.id
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      )}
                    >
                      <User className="size-5" />
                      <span className="truncate text-xs">{p.name.split(' ')[0]}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  Who paid?
                </label>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={paidBy === 'you' ? 'default' : 'outline'}
                    className="flex-1"
                    onClick={() => setPaidBy('you')}
                  >
                    You paid
                  </Button>
                  <Button
                    type="button"
                    variant={paidBy === 'them' ? 'default' : 'outline'}
                    className="flex-1"
                    onClick={() => setPaidBy('them')}
                  >
                    They paid
                  </Button>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">
                  What&apos;s this for? <span className="text-muted-foreground">(Optional)</span>
                </label>
                <Input
                  placeholder="Lunch, rent, grocery shopping..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>

              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={!personId || !amount || parseFloat(amount) <= 0 || createDebtMutation.isPending}
              >
                Save Debt
                <ArrowRight className="size-4" />
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="mt-6 flex justify-center gap-4 text-sm text-muted-foreground">
          <Link href="#" className="hover:text-foreground">
            ? Need help?
          </Link>
          <Link href="/contacts" className="hover:text-foreground">
            View recent
          </Link>
        </div>
      </main>

      <ContactDialog
        open={contactDialogOpen}
        onOpenChange={setContactDialogOpen}
        onSubmit={async (data) => {
          await createContactMutation.mutateAsync(data)
        }}
      />
    </div>
  )
}
