'use client'

import Link from 'next/link'
import { AppHeader } from '@/src/components/layout/app-header'
import { authClient } from '@/lib/auth-client'
import { BalanceCard } from '@/src/components/debt/balance-card'
import { DebtItem } from '@/src/components/debt/debt-item'
import { FabAddDebt } from '@/src/components/common/fab-add-debt'
import { useDebtStore } from '@/src/store/debt-store'

export default function DashboardPage () {
  const { data: session } = authClient.useSession()
  const getTotals = useDebtStore((s) => s.getTotals)
  const getRecentTransactions = useDebtStore((s) => s.getRecentTransactions)
  const { owedToYou, youOwe } = getTotals()
  const recent = getRecentTransactions(5)
  const userName = session?.user?.name ?? session?.user?.email ?? 'there'

  const greeting = (() => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 18) return 'Good afternoon'
    return 'Good evening'
  })()

  return (
    <div className="min-h-screen bg-background">
      <AppHeader
        navItems={[
          { label: 'Dashboard', href: '/dashboard', active: true },
          { label: 'Debts', href: '/contacts' },
          { label: 'Settings', href: '#' },
        ]}
      />

      <main className="mx-auto max-w-4xl px-4 py-8 md:px-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">{greeting}, {userName.split(' ')[0] ?? userName}</h1>
          <p className="text-muted-foreground">
            Here is what&apos;s happening with your finances today.
          </p>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-2">
          <BalanceCard
            title="You are owed"
            amount={owedToYou}
            variant="owed_to_you"
            trend="+5.2%"
            subtitle="From 3 people"
          />
          <BalanceCard
            title="You owe"
            amount={youOwe}
            variant="you_owe"
            trend="-2.1%"
            subtitle="Next payment due in 3 days"
          />
        </div>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold">Recent Transactions</h2>
            <Link
              href="/contacts"
              className="text-sm font-medium text-primary hover:underline"
            >
              View all →
            </Link>
          </div>
          {recent.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border bg-card/50 px-6 py-12 text-center">
              <p className="text-muted-foreground">No transactions yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Add a debt to get started
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {recent.map((tx) => (
                <DebtItem
                  key={tx.id}
                  transaction={tx}
                  showPerson={true}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      <FabAddDebt />
    </div>
  )
}
