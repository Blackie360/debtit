'use client'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { formatAmount } from '@/src/lib/utils'
import { useUserCurrency } from '@/src/hooks/use-user-currency'

interface BalanceCardProps {
  title: string
  amount: number
  variant: 'owed_to_you' | 'you_owe'
  trend?: string
  subtitle?: string
  className?: string
}

export function BalanceCard ({
  title,
  amount,
  variant,
  trend,
  subtitle,
  className,
}: BalanceCardProps) {
  const currency = useUserCurrency()
  const isPositive = variant === 'owed_to_you'
  return (
    <Card
      className={cn(
        'rounded-2xl border border-border/60 shadow-sm',
        className
      )}
    >
      <CardHeader className="flex flex-row items-start justify-between gap-2 pb-1">
        <span className="text-sm font-medium text-muted-foreground">{title}</span>
        {trend && (
          <span
            className={cn(
              'rounded-full px-2 py-0.5 text-xs font-medium',
              isPositive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            )}
          >
            {trend}
          </span>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        <p
          className={cn(
            'text-2xl font-bold tabular-nums sm:text-3xl',
            isPositive ? 'text-green-600' : 'text-red-600'
          )}
        >
          {formatAmount(amount, true, currency)}
        </p>
        {subtitle && (
          <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
        )}
      </CardContent>
    </Card>
  )
}
