'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search, UserPlus, Filter } from 'lucide-react'
import { AppHeader } from '@/src/components/layout/app-header'
import { BalanceCard } from '@/src/components/debt/balance-card'
import { PersonRow } from '@/src/components/people/person-row'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { useDebtStore } from '@/src/store/debt-store'

type TabFilter = 'all' | 'owed_to_you' | 'you_owe' | 'settled'

function getStatus (netBalance: number): 'owed_to_you' | 'you_owe' | 'settled' {
  if (netBalance > 0) return 'owed_to_you'
  if (netBalance < 0) return 'you_owe'
  return 'settled'
}

export default function ContactsPage () {
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState<TabFilter>('all')

  const people = useDebtStore((s) => s.people)
  const getPersonSummary = useDebtStore((s) => s.getPersonSummary)
  const getTotals = useDebtStore((s) => s.getTotals)

  const { owedToYou, youOwe } = getTotals()

  const filtered = people
    .map((p) => ({
      person: p,
      ...getPersonSummary(p.id),
    }))
    .filter(({ person }) =>
      person.name.toLowerCase().includes(search.toLowerCase())
    )
    .filter(({ netBalance }) => {
      const status = getStatus(netBalance)
      if (tab === 'all') return true
      return status === tab
    })

  const activeCount = people.filter((p) => {
    const s = getPersonSummary(p.id)
    return s.netBalance !== 0
  }).length

  return (
    <div className="min-h-screen bg-background">
      <AppHeader
        navItems={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Contacts', href: '/contacts', active: true },
        ]}
      />

      <main className="mx-auto max-w-4xl px-4 py-8 md:px-6">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold">Contacts</h1>
            <p className="text-muted-foreground">
              You have {activeCount} active connections
            </p>
          </div>
          <Button asChild>
            <Link href="/debts/new" className="flex items-center gap-2">
              <UserPlus className="size-4" />
              Add New Contact
            </Link>
          </Button>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-2">
          <BalanceCard
            title="Total to collect"
            amount={owedToYou}
            variant="owed_to_you"
            trend="+5.2%"
          />
          <BalanceCard
            title="Total to pay"
            amount={youOwe}
            variant="you_owe"
            trend="-2.1%"
          />
        </div>

        <div className="mb-4 flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, email or status..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button variant="outline">
            <Filter className="size-4" />
            Filters
          </Button>
        </div>

        <Tabs value={tab} onValueChange={(v) => setTab(v as TabFilter)}>
          <TabsList className="mb-6 w-full sm:w-auto">
            <TabsTrigger value="all">All Contacts</TabsTrigger>
            <TabsTrigger value="owed_to_you">Owes You</TabsTrigger>
            <TabsTrigger value="you_owe">You Owe</TabsTrigger>
            <TabsTrigger value="settled">Settled</TabsTrigger>
          </TabsList>

          <TabsContent value={tab} className="mt-0">
            {filtered.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-card/50 px-6 py-12 text-center">
                <p className="text-muted-foreground">No contacts found</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filtered.map(({ person, netBalance }) => (
                  <PersonRow
                    key={person.id}
                    person={person}
                    status={getStatus(netBalance)}
                    amount={Math.abs(netBalance)}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
