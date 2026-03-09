'use client'

import Link from 'next/link'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { formatAmount, formatDate } from '@/src/lib/utils'
import { useUserCurrency } from '@/src/hooks/use-user-currency'
import type { Transaction } from '@/src/lib/types'
import { useDebtStore } from '@/src/store/debt-store'
import { cn } from '@/lib/utils'

interface DebtItemProps {
  transaction: Transaction
  showPerson?: boolean
}

function getStatusLabel (status: Transaction['status']): string {
  switch (status) {
    case 'owed_to_you':
      return 'Owed to you'
    case 'you_owe':
      return 'You owe'
    case 'settled':
      return 'Settled'
    default:
      return ''
  }
}

function getInitials (name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export function DebtItem ({
  transaction,
  showPerson = true,
}: DebtItemProps) {
  const currency = useUserCurrency()
  const getPersonById = useDebtStore((s) => s.getPersonById)
  const person = getPersonById(transaction.personId)
  const name = person?.name ?? 'Unknown'

  const net =
    transaction.paidBy === 'you'
      ? transaction.amount
      : -transaction.amount
  const isPositive = net > 0
  const isSettled = transaction.status === 'settled'

  return (
    <Link
      href={showPerson ? `/debts/${transaction.personId}` : '#'}
      className="flex items-center gap-3 rounded-xl border border-border/50 bg-card px-4 py-3 transition-colors hover:bg-muted/50"
    >
      <Avatar size="sm" className="shrink-0">
        <AvatarFallback>{getInitials(name)}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        {showPerson && (
          <p className="truncate font-medium">{name}</p>
        )}
        <p className="truncate text-sm text-muted-foreground">
          {transaction.note ?? 'No description'}
        </p>
        <p
          className={cn(
            'text-xs',
            isSettled
              ? 'text-muted-foreground'
              : isPositive
                ? 'text-blue-600'
                : 'text-red-600'
          )}
        >
          {getStatusLabel(transaction.status)}
        </p>
      </div>
      <div className="shrink-0 text-right">
        <p
          className={cn(
            'font-semibold tabular-nums',
            isSettled
              ? 'text-muted-foreground'
              : isPositive
                ? 'text-green-600'
                : 'text-red-600'
          )}
        >
          {formatAmount(net, true, currency)}
        </p>
        <p className="text-xs text-muted-foreground">
          {formatDate(transaction.date)}
        </p>
      </div>
    </Link>
  )
}
