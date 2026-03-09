import { requireSessionWithCurrency } from '@/lib/auth-guard'

export default async function DebtsLayout ({
  children
}: {
  children: React.ReactNode
}) {
  await requireSessionWithCurrency()
  return <>{children}</>
}
