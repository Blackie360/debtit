import { requireOnboardingSession } from '@/lib/auth-guard'

export default async function OnboardingLayout ({
  children
}: {
  children: React.ReactNode
}) {
  await requireOnboardingSession()
  return <>{children}</>
}
