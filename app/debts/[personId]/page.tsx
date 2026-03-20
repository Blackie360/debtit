'use client'

import { use, useMemo, useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Bell, Wallet, Pencil, Trash2 } from 'lucide-react'
import {
  createColumnHelper,
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
} from '@tanstack/react-table'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { AppHeader } from '@/src/components/layout/app-header'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { DataTable } from '@/src/components/common/data-table'
import { ContactDialog } from '@/src/components/contacts/contact-dialog'
import { ConfirmDialog } from '@/src/components/common/confirm-dialog'
import { EditDebtDialog } from '@/src/components/debts/edit-debt-dialog'
import { useDebtStore } from '@/src/store/debt-store'
import { formatAmount, formatDate } from '@/src/lib/utils'
import { useUserCurrency } from '@/src/hooks/use-user-currency'
import { cn } from '@/lib/utils'
import { getContacts, updateContact, deleteContact } from '@/app/actions/contacts'
import { getDebtsByPerson, updateDebt, deleteDebt } from '@/app/actions/debts'
import type { Transaction } from '@/src/lib/types'

function getInitials (name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

const columnHelper = createColumnHelper<Transaction>()

export default function DebtDetailsPage ({
  params,
}: {
  params: Promise<{ personId: string }>
}) {
  const { personId } = use(params)
  const router = useRouter()
  const currency = useUserCurrency()
  const queryClient = useQueryClient()

  const setPeople = useDebtStore((s) => s.setPeople)
  const setTransactions = useDebtStore((s) => s.setTransactions)
  const getPersonById = useDebtStore((s) => s.getPersonById)
  const getPersonSummary = useDebtStore((s) => s.getPersonSummary)
  const getTransactionsByPersonId = useDebtStore((s) => s.getTransactionsByPersonId)

  const [editContactOpen, setEditContactOpen] = useState(false)
  const [deleteContactOpen, setDeleteContactOpen] = useState(false)
  const [editDebtOpen, setEditDebtOpen] = useState(false)
  const [deleteDebtOpen, setDeleteDebtOpen] = useState(false)
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null)

  const { data: contactsData } = useQuery({
    queryKey: ['contacts'],
    queryFn: () => getContacts(),
  })

  const { data: debtsData } = useQuery({
    queryKey: ['personDebts', personId],
    queryFn: () => getDebtsByPerson(personId),
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

  useEffect(() => {
    if (debtsData) {
      setTransactions(debtsData.map((d: { id: string; personId: string; amount: number; paidBy: string; note: string | null; date: string | Date; status: string }) => ({
        id: d.id,
        personId: d.personId,
        amount: d.amount,
        paidBy: d.paidBy as 'you' | 'them',
        note: d.note ?? undefined,
        date: typeof d.date === 'string' ? d.date : new Date(d.date).toISOString().slice(0, 10),
        status: d.status as 'owed_to_you' | 'you_owe' | 'settled',
      })))
    }
  }, [debtsData, setTransactions])

  const updateContactMutation = useMutation({
    mutationFn: (data: { id: string; name?: string; phone?: string; avatarUrl?: string }) => updateContact(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['contacts'] }),
  })

  const deleteContactMutation = useMutation({
    mutationFn: (id: string) => deleteContact(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
      queryClient.invalidateQueries({ queryKey: ['debts'] })
      router.push('/contacts')
    },
  })

  const updateDebtMutation = useMutation({
    mutationFn: (data: { id: string; amount?: number; paidBy?: 'you' | 'them'; note?: string; status?: string }) => updateDebt(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['personDebts', personId] }),
  })

  const deleteDebtMutation = useMutation({
    mutationFn: (id: string) => deleteDebt(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personDebts', personId] })
      queryClient.invalidateQueries({ queryKey: ['debts'] })
    },
  })

  const person = getPersonById(personId)
  const summary = getPersonSummary(personId)
  const transactions = getTransactionsByPersonId(personId)

  const columns = useMemo(() => [
    columnHelper.display({
      id: 'description',
      header: 'Description',
      cell: ({ row }) => {
        const net = row.original.paidBy === 'you' ? row.original.amount : -row.original.amount
        const isPositive = net > 0
        const isSettled = row.original.status === 'settled'
        return (
          <div className="flex items-center gap-3">
            <div
              className={cn(
                'flex size-8 shrink-0 items-center justify-center rounded-full text-xs',
                isSettled
                  ? 'bg-green-100 text-green-700'
                  : isPositive
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-red-100 text-red-700'
              )}
            >
              &bull;
            </div>
            <div className="min-w-0">
              <p className="truncate font-medium">{row.original.note ?? 'No description'}</p>
              <p className="text-sm text-muted-foreground">
                {row.original.paidBy === 'you' ? 'You paid' : 'They paid'}
              </p>
            </div>
          </div>
        )
      },
    }),
    columnHelper.accessor('date', {
      header: 'Date',
      cell: ({ getValue }) => (
        <span className="text-sm text-muted-foreground">{formatDate(getValue())}</span>
      ),
    }),
    columnHelper.display({
      id: 'status',
      header: 'Status',
      cell: ({ row }) => {
        const net = row.original.paidBy === 'you' ? row.original.amount : -row.original.amount
        const isSettled = row.original.status === 'settled'
        return (
          <span className={cn(
            'text-xs font-medium',
            isSettled ? 'text-muted-foreground' : net > 0 ? 'text-green-600' : 'text-red-600'
          )}>
            {isSettled ? 'Settled' : net > 0 ? 'They owe you' : 'You owe'}
          </span>
        )
      },
    }),
    columnHelper.display({
      id: 'amount',
      header: () => <span className="block text-right">Amount</span>,
      cell: ({ row }) => {
        const net = row.original.paidBy === 'you' ? row.original.amount : -row.original.amount
        const isSettled = row.original.status === 'settled'
        return (
          <p suppressHydrationWarning className={cn(
            'text-right font-semibold tabular-nums',
            isSettled ? 'text-muted-foreground' : net > 0 ? 'text-green-600' : 'text-red-600'
          )}>
            {isSettled
              ? formatAmount(row.original.amount, false, currency)
              : formatAmount(net, true, currency)}
          </p>
        )
      },
    }),
    columnHelper.display({
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <div className="flex justify-end gap-1">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              setSelectedTx(row.original)
              setEditDebtOpen(true)
            }}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <Pencil className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              setSelectedTx(row.original)
              setDeleteDebtOpen(true)
            }}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 className="size-3.5" />
          </button>
        </div>
      ),
    }),
  ], [currency])

  const table = useReactTable({
    data: transactions,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: {
      sorting: [{ id: 'date', desc: true }],
    },
  })

  if (!person) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Person not found</p>
      </div>
    )
  }

  const totalShared = transactions.reduce(
    (acc, t) => acc + t.amount,
    0
  )
  const settledAmount = transactions
    .filter((t) => t.status === 'settled')
    .reduce((acc, t) => acc + t.amount, 0)
  const progress =
    totalShared > 0 ? Math.round((settledAmount / totalShared) * 100) : 100

  return (
    <div className="min-h-screen bg-background">
      <AppHeader
        navItems={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Debts', href: '/contacts', active: true },
        ]}
      />

      <main className="mx-auto max-w-3xl px-4 py-6 md:px-6">
        <Link
          href="/contacts"
          className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to Debts
        </Link>

        <div className="mb-8 rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <Avatar size="lg" className="size-16">
                <AvatarFallback>{getInitials(person.name)}</AvatarFallback>
              </Avatar>
              <div>
                <h1 className="text-2xl font-bold">{person.name}</h1>
                {person.phone && (
                  <p className="text-sm text-muted-foreground">{person.phone}</p>
                )}
                <p
                  suppressHydrationWarning
                  className={cn(
                    'text-xl font-bold',
                    summary.netBalance >= 0 ? 'text-green-600' : 'text-red-600'
                  )}
                >
                  {summary.netBalance >= 0 ? 'They owe you' : 'You owe'}{' '}
                  {formatAmount(Math.abs(summary.netBalance), false, currency)}
                </p>
                {summary.lastTransactionDate && (
                  <p className="text-sm text-muted-foreground">
                    Last transaction {formatDate(summary.lastTransactionDate)}
                  </p>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => setEditContactOpen(true)}>
                <Pencil className="size-4" />
                Edit
              </Button>
              <Button variant="outline" size="sm" className="text-red-600 hover:bg-red-50 hover:text-red-700" onClick={() => setDeleteContactOpen(true)}>
                <Trash2 className="size-4" />
                Delete
              </Button>
              <Button variant="outline" size="sm">
                <Bell className="size-4" />
                Nudge
              </Button>
              <Button size="sm">
                <Wallet className="size-4" />
                Settle Up
              </Button>
            </div>
          </div>

          {totalShared > 0 && (
            <div className="mt-6 border-t border-border pt-6">
              <h3 className="font-medium">Settlement Progress</h3>
              <p suppressHydrationWarning className="text-sm text-muted-foreground">
                Based on {formatAmount(totalShared, false, currency)} total shared history
              </p>
              <div className="mt-3 flex items-center gap-4">
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="font-bold text-primary">{progress}%</span>
              </div>
              <p suppressHydrationWarning className="mt-2 text-sm text-muted-foreground">
                {progress >= 100
                  ? 'All settled!'
                  : `Only ${formatAmount(Math.abs(summary.netBalance), false, currency)} left to clear.`}
              </p>
            </div>
          )}
        </div>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">Debt History</h2>
          </div>
          <DataTable table={table} />
        </section>
      </main>

      <ContactDialog
        open={editContactOpen}
        onOpenChange={setEditContactOpen}
        title="Edit Contact"
        description="Update the contact details."
        initialData={{ name: person.name, phone: person.phone ?? '', avatarUrl: person.avatarUrl }}
        onSubmit={async (data) => {
          await updateContactMutation.mutateAsync({ id: personId, ...data })
        }}
      />

      <ConfirmDialog
        open={deleteContactOpen}
        onOpenChange={setDeleteContactOpen}
        title="Delete Contact"
        description={`Are you sure you want to delete ${person.name}? This will also delete all their debts. This action cannot be undone.`}
        confirmLabel="Delete Contact"
        onConfirm={async () => {
          await deleteContactMutation.mutateAsync(personId)
        }}
      />

      <EditDebtDialog
        open={editDebtOpen}
        onOpenChange={setEditDebtOpen}
        transaction={selectedTx}
        onSubmit={async (data) => {
          await updateDebtMutation.mutateAsync(data)
        }}
      />

      <ConfirmDialog
        open={deleteDebtOpen}
        onOpenChange={setDeleteDebtOpen}
        title="Delete Debt"
        description="Are you sure you want to delete this debt? This action cannot be undone."
        confirmLabel="Delete Debt"
        onConfirm={async () => {
          if (selectedTx) {
            await deleteDebtMutation.mutateAsync(selectedTx.id)
          }
        }}
      />
    </div>
  )
}
