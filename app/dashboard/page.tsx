'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Search } from 'lucide-react'
import {
  createColumnHelper,
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
} from '@tanstack/react-table'
import { useQuery } from '@tanstack/react-query'
import { AppHeader } from '@/src/components/layout/app-header'
import { authClient } from '@/lib/auth-client'
import { BalanceCard } from '@/src/components/debt/balance-card'
import { FabAddDebt } from '@/src/components/common/fab-add-debt'
import { DataTable } from '@/src/components/common/data-table'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useDebtStore } from '@/src/store/debt-store'
import { useUserCurrency } from '@/src/hooks/use-user-currency'
import { formatAmount, formatDate } from '@/src/lib/utils'
import { cn } from '@/lib/utils'
import { getContacts } from '@/app/actions/contacts'
import { getDebts } from '@/app/actions/debts'
import type { Transaction } from '@/src/lib/types'

function getInitials (name: string): string {
  return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
}

const columnHelper = createColumnHelper<Transaction & { personName: string }>()

export default function DashboardPage () {
  const router = useRouter()
  const currency = useUserCurrency()
  const { data: session } = authClient.useSession()

  const setPeople = useDebtStore((s) => s.setPeople)
  const setTransactions = useDebtStore((s) => s.setTransactions)
  const getTotals = useDebtStore((s) => s.getTotals)
  const people = useDebtStore((s) => s.people)
  const transactions = useDebtStore((s) => s.transactions)
  const getPersonById = useDebtStore((s) => s.getPersonById)

  const [search, setSearch] = useState('')

  const { data: contactsData } = useQuery({
    queryKey: ['contacts'],
    queryFn: () => getContacts(),
  })

  const { data: debtsData } = useQuery({
    queryKey: ['debts'],
    queryFn: () => getDebts(),
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

  const { owedToYou, youOwe } = getTotals()
  const userName = session?.user?.name ?? session?.user?.email ?? 'there'

  const recentWithNames = useMemo(() => {
    return [...transactions]
      .sort((a, b) => (b.date > a.date ? 1 : -1))
      .slice(0, 10)
      .map((tx) => ({
        ...tx,
        personName: getPersonById(tx.personId)?.name ?? 'Unknown',
      }))
  }, [transactions, people, getPersonById])

  const columns = useMemo(() => [
    columnHelper.display({
      id: 'person',
      header: 'Person',
      cell: ({ row }) => (
        <div className="flex items-center gap-3">
          <Avatar size="sm" className="shrink-0">
            <AvatarFallback>{getInitials(row.original.personName)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate font-medium">{row.original.personName}</p>
            <p className="truncate text-sm text-muted-foreground">
              {row.original.note ?? 'No description'}
            </p>
          </div>
        </div>
      ),
    }),
    columnHelper.accessor('date', {
      header: 'Date',
      cell: ({ getValue }) => (
        <span className="text-sm text-muted-foreground">{formatDate(getValue())}</span>
      ),
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: ({ getValue }) => {
        const s = getValue()
        return (
          <span className={cn(
            'text-xs font-medium',
            s === 'owed_to_you' ? 'text-green-600' : s === 'you_owe' ? 'text-red-600' : 'text-muted-foreground'
          )}>
            {s === 'owed_to_you' ? 'Owed to you' : s === 'you_owe' ? 'You owe' : 'Settled'}
          </span>
        )
      },
    }),
    columnHelper.display({
      id: 'amount',
      header: () => <span className="text-right block">Amount</span>,
      cell: ({ row }) => {
        const net = row.original.paidBy === 'you' ? row.original.amount : -row.original.amount
        const isSettled = row.original.status === 'settled'
        return (
          <p suppressHydrationWarning className={cn(
            'text-right font-semibold tabular-nums',
            isSettled ? 'text-muted-foreground' : net > 0 ? 'text-green-600' : 'text-red-600'
          )}>
            {isSettled ? formatAmount(row.original.amount, false, currency) : formatAmount(net, true, currency)}
          </p>
        )
      },
    }),
  ], [currency])

  const table = useReactTable({
    data: recentWithNames,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: 'includesString',
    state: { globalFilter: search },
    onGlobalFilterChange: setSearch,
  })

  const [greeting, setGreeting] = useState('Welcome')

  useEffect(() => {
    const h = new Date().getHours()
    if (h < 12) setGreeting('Good morning')
    else if (h < 18) setGreeting('Good afternoon')
    else setGreeting('Good evening')
  }, [])

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

        <div className="mb-8 rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search transactions, people..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-10 pl-9"
            />
          </div>
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
          <DataTable
            table={table}
            onRowClick={(row) => router.push(`/debts/${row.personId}`)}
          />
        </section>
      </main>

      <FabAddDebt />
    </div>
  )
}
