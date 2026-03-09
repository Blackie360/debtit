'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Bell, LogOut, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { authClient } from '@/lib/auth-client'
import { cn } from '@/lib/utils'

interface AppHeaderProps {
  navItems?: { label: string; href: string; active?: boolean }[]
  showAuth?: boolean
  className?: string
}

export function AppHeader ({
  navItems = [],
  showAuth = true,
  className,
}: AppHeaderProps) {
  const router = useRouter()
  const { data: session, isPending } = authClient.useSession()

  async function handleSignOut () {
    await authClient.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <header
      className={cn(
        'flex items-center justify-between bg-[var(--navy)] px-4 py-3 text-white md:px-6',
        className
      )}
    >
      <Link href="/" className="flex items-center gap-2">
        <div className="flex size-9 items-center justify-center rounded-lg bg-primary">
          <span className="text-sm font-bold text-primary-foreground">D</span>
        </div>
        <span className="font-semibold">Deni</span>
      </Link>
      {navItems.length > 0 && (
        <nav className="hidden gap-6 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'text-sm transition-colors hover:text-white/90',
                item.active
                  ? 'font-medium underline underline-offset-4'
                  : 'text-white/80'
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      )}
      {showAuth && (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 hover:text-white">
            <Bell className="size-4" />
          </Button>
          <div className="flex items-center gap-2">
            {!isPending && session?.user && (
              <span className="hidden text-sm text-white/80 sm:inline-block">
                {session.user.name ?? session.user.email}
              </span>
            )}
            <Avatar size="sm" className="border-2 border-white/20">
              {session?.user?.image ? (
                <AvatarImage src={session.user.image} alt={session.user.name ?? ''} />
              ) : null}
              <AvatarFallback className="bg-primary/80 text-primary-foreground">
                {session?.user?.name ? (
                  session.user.name.charAt(0).toUpperCase()
                ) : (
                  <User className="size-4" />
                )}
              </AvatarFallback>
            </Avatar>
            {!isPending && session?.user && (
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/10 hover:text-white"
                onClick={handleSignOut}
                title="Sign out"
              >
                <LogOut className="size-4" />
              </Button>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
