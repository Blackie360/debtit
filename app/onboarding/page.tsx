'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowRight, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { authClient } from '@/lib/auth-client'
import { CURRENCIES, COUNTRY_TO_CURRENCY } from '@/lib/currencies'

export default function OnboardingPage () {
  const router = useRouter()
  const [currency, setCurrency] = useState<string>('USD')
  const [detectedCurrency, setDetectedCurrency] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isDetecting, setIsDetecting] = useState(true)

  useEffect(() => {
    let cancelled = false
    async function detectCurrency () {
      try {
        const res = await fetch('https://ipapi.co/json/')
        if (!res.ok) return
        const data = await res.json()
        const countryCode = data?.country_code
        if (countryCode && COUNTRY_TO_CURRENCY[countryCode]) {
          const code = COUNTRY_TO_CURRENCY[countryCode]
          setDetectedCurrency(code)
          setCurrency(code)
        }
      } catch {
        // Fallback to USD on error
      } finally {
        if (!cancelled) setIsDetecting(false)
      }
    }
    detectCurrency()
    return () => { cancelled = true }
  }, [])

  async function handleSubmit (e: React.FormEvent) {
    e.preventDefault()
    if (!currency) return
    setIsLoading(true)
    try {
      const { error } = await authClient.updateUser({ currency })
      if (error) {
        console.error('Failed to update currency:', error)
        setIsLoading(false)
        return
      }
      router.push('/dashboard')
      router.refresh()
    } catch (err) {
      console.error(err)
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Choose your currency
          </h1>
          <p className="mt-2 text-muted-foreground">
            We&apos;ve guessed based on your location. You can change it anytime in settings.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="currency" className="text-sm font-medium">
              Currency
            </label>
            {isDetecting ? (
              <div className="flex h-9 items-center gap-2 rounded-md border border-input bg-transparent px-3 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                Detecting...
              </div>
            ) : (
              <Select
                value={currency}
                onValueChange={setCurrency}
                name="currency"
              >
                <SelectTrigger id="currency" className="w-full">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((c) => (
                    <SelectItem key={c.code} value={c.code}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {detectedCurrency && !isDetecting && (
              <p className="text-xs text-muted-foreground">
                Pre-selected based on your location
              </p>
            )}
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full rounded-xl"
            disabled={!currency || isLoading || isDetecting}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                Continue
                <ArrowRight className="ml-2 size-4" />
              </>
            )}
          </Button>
        </form>
      </motion.div>
    </div>
  )
}
