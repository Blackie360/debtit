'use client'

import { useState, useCallback } from 'react'
import { Loader2, Sparkles, SendHorizontal } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { Input } from '@/components/ui/input'
import { parseDebt, type ParsedDebt } from '@/app/actions/parse-debt'

interface SmartInputProps {
  knownPeople: string[]
  userCurrency: string
  onParsed: (data: ParsedDebt) => void
  compact?: boolean
}

export function SmartInput ({ knownPeople, userCurrency, onParsed, compact = false }: SmartInputProps) {
  const [text, setText] = useState('')
  const [isParsing, setIsParsing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleParse = useCallback(async (input: string) => {
    const value = input.trim()
    if (!value) return

    setIsParsing(true)
    setError(null)

    const result = await parseDebt(value, knownPeople, userCurrency)

    if (result.success) {
      onParsed(result.data)
      setText('')
    } else {
      setError(result.error)
    }

    setIsParsing(false)
  }, [knownPeople, userCurrency, onParsed])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleParse(text)
  }

  return (
    <div className={compact ? '' : 'mb-6'}>
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <Sparkles className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder='Try "Sarah owes me $20 for lunch"'
            value={text}
            onChange={(e) => { setText(e.target.value); setError(null) }}
            disabled={isParsing}
            className={`pl-9 pr-10 ${compact ? 'h-10' : 'h-12'}`}
          />
          {text && !isParsing && (
            <button
              type="submit"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <SendHorizontal className="size-4" />
            </button>
          )}
          {isParsing && (
            <Loader2 className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-primary" />
          )}
        </div>
      </form>

      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="mt-2 text-sm text-red-500"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      {!compact && !text && (
        <p className="mt-2 text-xs text-muted-foreground">
          Describe a debt in plain English and press Enter
        </p>
      )}
    </div>
  )
}
