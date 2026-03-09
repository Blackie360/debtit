import { create } from 'zustand'
import type { Person, Transaction } from '@/src/lib/types'

interface DebtState {
  people: Person[]
  transactions: Transaction[]
  setPeople: (people: Person[]) => void
  setTransactions: (transactions: Transaction[]) => void
  addPerson: (person: Person) => void
  removePerson: (id: string) => void
  updatePerson: (id: string, updates: Partial<Person>) => void
  addTransaction: (tx: Transaction) => void
  removeTransaction: (id: string) => void
  updateTransaction: (id: string, updates: Partial<Transaction>) => void
  getPersonById: (id: string) => Person | undefined
  getTransactionsByPersonId: (personId: string) => Transaction[]
  getRecentTransactions: (limit?: number) => Transaction[]
  getPersonSummary: (personId: string) => {
    netBalance: number
    totalOwedToYou: number
    totalYouOwe: number
    lastTransactionDate?: string
  }
  getTotals: () => { owedToYou: number; youOwe: number }
}

export const useDebtStore = create<DebtState>((set, get) => ({
  people: [],
  transactions: [],

  setPeople: (people) => set({ people }),
  setTransactions: (transactions) => set({ transactions }),

  addPerson: (person) => {
    set((s) => ({ people: [...s.people, person] }))
  },

  removePerson: (id) => {
    set((s) => ({
      people: s.people.filter((p) => p.id !== id),
      transactions: s.transactions.filter((t) => t.personId !== id),
    }))
  },

  updatePerson: (id, updates) => {
    set((s) => ({
      people: s.people.map((p) => (p.id === id ? { ...p, ...updates } : p)),
    }))
  },

  addTransaction: (tx) => {
    set((s) => ({ transactions: [tx, ...s.transactions] }))
  },

  removeTransaction: (id) => {
    set((s) => ({
      transactions: s.transactions.filter((t) => t.id !== id),
    }))
  },

  updateTransaction: (id, updates) => {
    set((s) => ({
      transactions: s.transactions.map((t) =>
        t.id === id ? { ...t, ...updates } : t
      ),
    }))
  },

  getPersonById: (id) => get().people.find((p) => p.id === id),

  getTransactionsByPersonId: (personId) =>
    get()
      .transactions.filter((t) => t.personId === personId)
      .sort((a, b) => (b.date > a.date ? 1 : -1)),

  getRecentTransactions: (limit = 5) =>
    [...get().transactions]
      .sort((a, b) => (b.date > a.date ? 1 : -1))
      .slice(0, limit),

  getPersonSummary: (personId) => {
    const txs = get().getTransactionsByPersonId(personId)
    let totalOwedToYou = 0
    let totalYouOwe = 0
    let lastDate: string | undefined
    for (const t of txs) {
      const net = t.paidBy === 'you' ? t.amount : -t.amount
      if (t.status === 'settled') continue
      if (net > 0) totalOwedToYou += net
      else totalYouOwe += -net
      if (!lastDate || t.date > lastDate) lastDate = t.date
    }
    return {
      netBalance: totalOwedToYou - totalYouOwe,
      totalOwedToYou,
      totalYouOwe,
      lastTransactionDate: lastDate,
    }
  },

  getTotals: () => {
    const { transactions } = get()
    let owedToYou = 0
    let youOwe = 0
    const byPerson = new Map<string, number>()
    for (const t of transactions) {
      if (t.status === 'settled') continue
      const net = t.paidBy === 'you' ? t.amount : -t.amount
      const cur = byPerson.get(t.personId) ?? 0
      byPerson.set(t.personId, cur + net)
    }
    for (const [, net] of byPerson) {
      if (net > 0) owedToYou += net
      else youOwe += -net
    }
    return { owedToYou, youOwe }
  },
}))
