'use client'

import { authClient } from '@/lib/auth-client'

export function useUserCurrency (): string {
  const { data: session } = authClient.useSession()
  const user = session?.user as { currency?: string | null } | undefined
  return user?.currency ?? 'USD'
}
