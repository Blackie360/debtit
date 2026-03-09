'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { authClient } from '@/lib/auth-client'
import {
  ArrowRight,
  Eye,
  Plus,
  Shield,
  UserPlus,
  Zap,
  ArrowUpRight,
  ArrowDownLeft,
  ChevronRight,
  Receipt,
  Bell,
  CheckCircle2
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }
  })
}

const stagger = {
  visible: { transition: { staggerChildren: 0.08 } }
}

const FEATURES = [
  {
    icon: Eye,
    title: 'Transparent',
    desc: 'See exactly who owes what at a glance. Real-time updates for everyone involved.'
  },
  {
    icon: Zap,
    title: 'Automatic',
    desc: 'Smart reminders handle the awkwardness for you. Get notified when it\'s time to settle up.'
  },
  {
    icon: Shield,
    title: 'Secure',
    desc: 'Bank-level encryption keeps your data private. Your finances, your business.'
  }
]

const STEPS = [
  {
    icon: UserPlus,
    title: 'Add your people',
    desc: 'Import contacts or invite friends. Build your circle in seconds.'
  },
  {
    icon: Receipt,
    title: 'Log a debt',
    desc: 'Split a bill, track an IOU, or record a payment. It takes 5 seconds.'
  },
  {
    icon: Bell,
    title: 'Get reminders',
    desc: 'Automated nudges do the asking so you don\'t have to. Stay stress-free.'
  },
  {
    icon: CheckCircle2,
    title: 'Settle up',
    desc: 'Mark debts as paid and keep a clean ledger. Friendships intact.'
  }
]

function AppPreview () {
  return (
    <div className="relative mx-auto w-full max-w-sm">
      {/* Phone frame */}
      <div className="overflow-hidden rounded-3xl border border-border/80 bg-card shadow-xl">
        {/* Status bar */}
        <div className="flex items-center justify-between bg-card px-5 pb-1 pt-3">
          <span className="text-xs font-medium text-muted-foreground">9:41</span>
          <div className="flex gap-1.5">
            <div className="h-2 w-4 rounded-sm bg-muted-foreground/40" />
            <div className="h-2 w-3 rounded-sm bg-muted-foreground/40" />
            <div className="h-2 w-2.5 rounded-sm bg-muted-foreground/40" />
          </div>
        </div>

        {/* App content */}
        <div className="space-y-4 px-5 pb-6 pt-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Good morning</p>
              <p className="text-sm font-semibold">Felix</p>
            </div>
            <div className="flex size-8 items-center justify-center rounded-full bg-primary/10">
              <span className="text-xs font-bold text-primary">F</span>
            </div>
          </div>

          {/* Balance cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-green-50 p-3 dark:bg-green-950/30">
              <div className="mb-1 flex items-center gap-1">
                <ArrowDownLeft className="size-3 text-green-600" />
                <span className="text-[10px] text-green-700 dark:text-green-400">Owed to you</span>
              </div>
              <p className="text-lg font-bold text-green-600">$245.00</p>
            </div>
            <div className="rounded-xl bg-red-50 p-3 dark:bg-red-950/30">
              <div className="mb-1 flex items-center gap-1">
                <ArrowUpRight className="size-3 text-red-600" />
                <span className="text-[10px] text-red-700 dark:text-red-400">You owe</span>
              </div>
              <p className="text-lg font-bold text-red-600">$82.50</p>
            </div>
          </div>

          {/* Recent transactions */}
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">Recent</p>
            <div className="space-y-2">
              {[
                { name: 'Sarah M.', amount: '+$45.00', positive: true, label: 'Dinner split' },
                { name: 'Jake R.', amount: '-$22.50', positive: false, label: 'Groceries' },
                { name: 'Priya K.', amount: '+$120.00', positive: true, label: 'Rent share' }
              ].map((tx) => (
                <div
                  key={tx.name}
                  className="flex items-center justify-between rounded-lg bg-background/60 px-3 py-2.5"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="flex size-7 items-center justify-center rounded-full bg-muted text-[10px] font-semibold">
                      {tx.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-medium">{tx.name}</p>
                      <p className="text-[10px] text-muted-foreground">{tx.label}</p>
                    </div>
                  </div>
                  <span
                    className={`text-xs font-semibold tabular-nums ${
                      tx.positive ? 'text-green-600' : 'text-red-500'
                    }`}
                  >
                    {tx.amount}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Decorative glow */}
      <div className="pointer-events-none absolute -inset-4 -z-10 rounded-[2rem] bg-gradient-to-b from-primary/5 via-transparent to-transparent blur-2xl" />
    </div>
  )
}

export default function LandingPage () {
  return (
    <div className="min-h-screen bg-background">
      {/* ── Header ── */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg bg-foreground">
              <span className="text-sm font-bold text-background">D</span>
            </div>
            <span className="text-lg font-semibold tracking-tight">Deni</span>
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            <a href="#features" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              Features
            </a>
            <a href="#how-it-works" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              How it works
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => authClient.signIn.social({ provider: 'google', callbackURL: '/dashboard' })}
            >
              Log in
            </Button>
            <Button
              size="sm"
              className="rounded-lg"
              onClick={() => authClient.signIn.social({ provider: 'google', callbackURL: '/dashboard' })}
            >
              Get Started
              <ArrowRight className="ml-1 size-3.5" />
            </Button>
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="overflow-hidden">
        <div className="mx-auto max-w-6xl px-4 pb-16 pt-16 md:px-8 md:pb-24 md:pt-24">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={stagger}
              className="space-y-8"
            >
              <motion.span
                variants={fadeUp}
                custom={0}
                className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card px-3.5 py-1.5 text-xs font-medium text-muted-foreground shadow-sm"
              >
                <span className="relative flex size-2">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-60" />
                  <span className="relative inline-flex size-2 rounded-full bg-primary" />
                </span>
                Now with smart bill splitting
              </motion.span>

              <motion.h1
                variants={fadeUp}
                custom={1}
                className="text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-[3.5rem]"
              >
                Track shared debts.{' '}
                <span className="bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
                  Stay clear. Stay paid.
                </span>
              </motion.h1>

              <motion.p
                variants={fadeUp}
                custom={2}
                className="max-w-lg text-lg leading-relaxed text-muted-foreground"
              >
                The simplest way to manage IOUs, split bills, and keep
                your friendships stress-free. No awkward conversations
                &mdash; just clarity.
              </motion.p>

              <motion.div
                variants={fadeUp}
                custom={3}
                className="flex flex-wrap gap-3"
              >
                <Button
                  size="lg"
                  className="rounded-xl px-6"
                  onClick={() => authClient.signIn.social({ provider: 'google', callbackURL: '/dashboard' })}
                >
                  Start for free
                  <ArrowRight className="ml-1.5 size-4" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-xl px-6"
                  onClick={() => authClient.signIn.social({ provider: 'google', callbackURL: '/dashboard' })}
                >
                  <Plus className="size-4" />
                  Import contacts
                </Button>
              </motion.div>

              <motion.div
                variants={fadeUp}
                custom={4}
                className="flex items-center gap-3 pt-2"
              >
                <div className="flex -space-x-2.5">
                  {['bg-blue-200', 'bg-amber-200', 'bg-emerald-200', 'bg-violet-200'].map((bg, i) => (
                    <div
                      key={i}
                      className={`flex size-8 items-center justify-center rounded-full border-2 border-background text-[10px] font-semibold text-foreground/60 ${bg}`}
                    >
                      {['S', 'J', 'P', 'A'][i]}
                    </div>
                  ))}
                </div>
                <div className="text-sm">
                  <span className="font-medium">10,000+</span>{' '}
                  <span className="text-muted-foreground">roommates & friends</span>
                </div>
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="flex justify-center lg:justify-end"
            >
              <AppPreview />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="border-t border-border/40 bg-card/30">
        <div className="mx-auto max-w-6xl px-4 py-20 md:px-8 md:py-28">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={stagger}
            className="text-center"
          >
            <motion.p
              variants={fadeUp}
              className="text-sm font-medium uppercase tracking-widest text-muted-foreground"
            >
              Why Deni
            </motion.p>
            <motion.h2
              variants={fadeUp}
              custom={1}
              className="mx-auto mt-3 max-w-xl text-3xl font-bold tracking-tight sm:text-4xl"
            >
              Everything you need to keep money simple
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={stagger}
            className="mt-14 grid gap-6 sm:grid-cols-3"
          >
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                variants={fadeUp}
                custom={i}
                className="group rounded-2xl border border-border/60 bg-card p-7 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="mb-4 flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <f.icon className="size-5" strokeWidth={1.8} />
                </div>
                <h3 className="text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {f.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how-it-works">
        <div className="mx-auto max-w-6xl px-4 py-20 md:px-8 md:py-28">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            variants={stagger}
            className="text-center"
          >
            <motion.p
              variants={fadeUp}
              className="text-sm font-medium uppercase tracking-widest text-muted-foreground"
            >
              How it works
            </motion.p>
            <motion.h2
              variants={fadeUp}
              custom={1}
              className="mx-auto mt-3 max-w-lg text-3xl font-bold tracking-tight sm:text-4xl"
            >
              From &ldquo;you owe me&rdquo; to settled &mdash; in four steps
            </motion.h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={stagger}
            className="mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4"
          >
            {STEPS.map((step, i) => (
              <motion.div
                key={step.title}
                variants={fadeUp}
                custom={i}
                className="relative text-center"
              >
                {i < STEPS.length - 1 && (
                  <ChevronRight className="absolute -right-4 top-8 hidden size-5 text-border lg:block" />
                )}
                <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl bg-foreground text-background">
                  <step.icon className="size-6" strokeWidth={1.6} />
                </div>
                <span className="mb-1 block text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Step {i + 1}
                </span>
                <h3 className="text-base font-semibold">{step.title}</h3>
                <p className="mx-auto mt-1.5 max-w-[220px] text-sm leading-relaxed text-muted-foreground">
                  {step.desc}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="border-t border-border/40">
        <div className="mx-auto max-w-6xl px-4 py-20 md:px-8 md:py-28">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-60px' }}
            variants={stagger}
            className="mx-auto max-w-2xl text-center"
          >
            <motion.h2
              variants={fadeUp}
              className="text-3xl font-bold tracking-tight sm:text-4xl"
            >
              Ready to settle things?
            </motion.h2>
            <motion.p
              variants={fadeUp}
              custom={1}
              className="mx-auto mt-4 max-w-md text-lg text-muted-foreground"
            >
              Join thousands of people who track debts the easy way.
              Free to use, forever.
            </motion.p>
            <motion.div
              variants={fadeUp}
              custom={2}
              className="mt-8 flex flex-wrap justify-center gap-3"
            >
              <Button
                size="lg"
                className="rounded-xl px-8"
                onClick={() => authClient.signIn.social({ provider: 'google', callbackURL: '/dashboard' })}
              >
                Get started &mdash; it&apos;s free
                <ArrowRight className="ml-1.5 size-4" />
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-border/40 bg-card/30">
        <div className="mx-auto max-w-6xl px-4 py-10 md:px-8">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-md bg-foreground">
                <span className="text-xs font-bold text-background">D</span>
              </div>
              <span className="text-sm font-semibold">Deni</span>
            </div>
            <nav className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
              <Link href="#" className="transition-colors hover:text-foreground">
                Privacy
              </Link>
              <Link href="#" className="transition-colors hover:text-foreground">
                Terms
              </Link>
              <Link href="#" className="transition-colors hover:text-foreground">
                Help
              </Link>
            </nav>
            <p className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} Deni. Built for better relationships.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
