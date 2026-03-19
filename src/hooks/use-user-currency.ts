'use client'

import { useState, useEffect } from 'react'
import { authClient } from '@/lib/auth-client'

export function useUserCurrency (): string {
  const { data: session } = authClient.useSession()
  const user = session?.user as { currency?: string | null } | undefined
  const sessionCurrency = user?.currency ?? 'USD'

  const [currency, setCurrency] = useState('USD')

  useEffect(() => {
    setCurrency(sessionCurrency)
  }, [sessionCurrency])

  return currency
}
