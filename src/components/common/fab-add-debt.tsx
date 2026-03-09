'use client'

import Link from 'next/link'
import { Plus } from 'lucide-react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'

export function FabAddDebt () {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      className="fixed bottom-6 right-6 z-50 hover:scale-105 transition-transform"
    >
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
    </motion.div>
  )
}
