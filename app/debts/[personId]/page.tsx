'use client'

import { use } from 'react'
import Link from 'next/link'
import { ArrowLeft, Bell, Wallet, Filter } from 'lucide-react'
import { AppHeader } from '@/src/components/layout/app-header'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useDebtStore } from '@/src/store/debt-store'
import { formatAmount, formatDate } from '@/src/lib/utils'
import { useUserCurrency } from '@/src/hooks/use-user-currency'
import { cn } from '@/lib/utils'

function getInitials (name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export default function DebtDetailsPage ({
  params,
}: {
  params: Promise<{ personId: string }>
}) {
  const { personId } = use(params)
  const currency = useUserCurrency()
  const getPersonById = useDebtStore((s) => s.getPersonById)
  const getPersonSummary = useDebtStore((s) => s.getPersonSummary)
  const getTransactionsByPersonId = useDebtStore(
    (s) => s.getTransactionsByPersonId
  )

  const person = getPersonById(personId)
  const summary = getPersonSummary(personId)
  const transactions = getTransactionsByPersonId(personId)

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
                <p
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
            <div className="flex gap-2">
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
              <p className="text-sm text-muted-foreground">
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
              <p className="mt-2 text-sm text-muted-foreground">
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
            <Button variant="ghost" size="sm">
              <Filter className="size-4" />
              Filter
            </Button>
          </div>
          {transactions.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card/50 px-6 py-12 text-center">
              <p className="text-muted-foreground">No transactions yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {transactions.map((tx) => {
                const net =
                  tx.paidBy === 'you' ? tx.amount : -tx.amount
                const isPositive = net > 0
                const isSettled = tx.status === 'settled'
                return (
                  <div
                    key={tx.id}
                    className="flex items-center gap-3 rounded-xl border border-border/50 bg-card px-4 py-3"
                  >
                    <div
                      className={cn(
                        'flex size-10 items-center justify-center rounded-full',
                        isSettled
                          ? 'bg-green-100 text-green-700'
                          : isPositive
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-red-100 text-red-700'
                      )}
                    >
                      •
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{tx.note ?? 'No description'}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(tx.date)} •{' '}
                        {tx.paidBy === 'you' ? 'You paid' : 'They paid'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p
                        className={cn(
                          'font-semibold',
                          isSettled
                            ? 'text-muted-foreground'
                            : isPositive
                              ? 'text-blue-600'
                              : 'text-red-600'
                        )}
                      >
                        {isSettled
                          ? formatAmount(tx.amount, false, currency)
                          : formatAmount(net, true, currency)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {isSettled
                          ? 'Settled'
                          : isPositive
                            ? 'They owe you'
                            : 'You owe'}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
          {transactions.length > 0 && (
            <Link
              href="#"
              className="mt-4 block text-center text-sm text-muted-foreground hover:text-foreground"
            >
              Load older transactions
            </Link>
          )}
        </section>
      </main>
    </div>
  )
}
