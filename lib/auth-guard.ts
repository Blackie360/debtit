import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'

export async function requireSession () {
  const session = await auth.api.getSession({
    headers: await headers()
  })
  if (!session) {
    redirect('/')
  }
  return session
}

export async function requireSessionWithCurrency () {
  const session = await requireSession()
  const user = session.user as { currency?: string | null }
  if (!user.currency) {
    redirect('/onboarding')
  }
  return session
}

/** For onboarding: redirect to / if no session, to /dashboard if user already has currency. */
export async function requireOnboardingSession () {
  const session = await auth.api.getSession({
    headers: await headers()
  })
  if (!session) {
    redirect('/')
  }
  const user = session.user as { currency?: string | null }
  if (user.currency) {
    redirect('/dashboard')
  }
  return session
}
