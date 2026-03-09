import { requireSessionWithCurrency } from '@/lib/auth-guard'

export default async function ContactsLayout ({
  children
}: {
  children: React.ReactNode
}) {
  await requireSessionWithCurrency()
  return <>{children}</>
}
