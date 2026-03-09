'use client'

import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { formatAmount } from '@/src/lib/utils'
import { useUserCurrency } from '@/src/hooks/use-user-currency'
import type { Person } from '@/src/lib/types'
import { useDebtStore } from '@/src/store/debt-store'
import { cn } from '@/lib/utils'

type StatusType = 'owed_to_you' | 'you_owe' | 'settled'

interface PersonRowProps {
  person: Person
  status: StatusType
  amount: number
}

function getInitials (name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

function getStatusConfig (status: StatusType) {
  switch (status) {
    case 'owed_to_you':
      return { label: 'Owes You', className: 'bg-green-100 text-green-800 border-green-200' }
    case 'you_owe':
      return { label: 'You Owe', className: 'bg-red-100 text-red-800 border-red-200' }
    case 'settled':
      return { label: 'Settled', className: 'bg-muted text-muted-foreground' }
  }
}

export function PersonRow ({ person, status, amount }: PersonRowProps) {
  const currency = useUserCurrency()
  const config = getStatusConfig(status)

  return (
    <Link
      href={`/debts/${person.id}`}
      className="flex items-center gap-3 rounded-xl border border-border/50 bg-card px-4 py-3 transition-colors hover:bg-muted/50"
    >
      <Avatar size="default" className="shrink-0">
        <AvatarFallback>{getInitials(person.name)}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">{person.name}</p>
        {person.lastActive && (
          <p className="text-sm text-muted-foreground">
            Last active {person.lastActive}
          </p>
        )}
        <Badge
          variant="outline"
          className={cn('mt-1 text-xs', config.className)}
        >
          {config.label}
        </Badge>
      </div>
      <div className="shrink-0 text-right">
        <p
          className={cn(
            'font-semibold tabular-nums',
            status === 'settled'
              ? 'text-muted-foreground'
              : status === 'owed_to_you'
                ? 'text-green-600'
                : 'text-red-600'
          )}
        >
          {status === 'settled'
            ? formatAmount(0, false, currency)
            : formatAmount(amount, true, currency)}
        </p>
      </div>
      <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
    </Link>
  )
}
