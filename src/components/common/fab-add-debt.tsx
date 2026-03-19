'use client'

import Link from 'next/link'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function FabAddDebt () {
  return (
    <div className="fixed bottom-6 right-6 z-50 animate-initial:scale-0 animate-initial:opacity-0 animate-enter:scale-100 animate-enter:opacity-100 animate-spring animate-stiffness-300 animate-damping-24">
      <div className="animate-hover:scale-105 animate-tap:scale-95 animate-spring animate-stiffness-400 animate-damping-20 transition-transform">
        <Button
          asChild
          size="lg"
          className="h-12 rounded-full px-5 shadow-lg"
        >
          <Link href="/debts/new" className="flex items-center gap-2">
            <Plus className="size-5" />
            Add Debt
          </Link>
        </Button>
      </div>
    </div>
  )
}
