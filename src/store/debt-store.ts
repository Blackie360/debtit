import { create } from 'zustand'
import type { Person, Transaction } from '@/src/lib/types'
import { MOCK_PEOPLE, MOCK_TRANSACTIONS } from '@/src/lib/mock-data'

interface DebtState {
  people: Person[]
  transactions: Transaction[]
  addPerson: (person: Omit<Person, 'id'>) => string
  addTransaction: (tx: Omit<Transaction, 'id' | 'date' | 'status'>) => void
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

function generateId(): string {
  return Math.random().toString(36).slice(2, 11)
}

export const useDebtStore = create<DebtState>((set, get) => ({
  people: MOCK_PEOPLE,
  transactions: [...MOCK_TRANSACTIONS],

  addPerson: (person) => {
    const id = generateId()
    set((s) => ({ people: [...s.people, { ...person, id }] }))
    return id
  },

  addTransaction: (tx) => {
    const id = generateId()
    const date = new Date().toISOString().slice(0, 10)
    const net =
      tx.paidBy === 'you'
        ? tx.amount
        : -tx.amount
    const status: Transaction['status'] =
      net > 0 ? 'owed_to_you' : net < 0 ? 'you_owe' : 'settled'
    set((s) => ({
      transactions: [
        { ...tx, id, date, status },
        ...s.transactions,
      ],
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
    const { people, transactions } = get()
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
