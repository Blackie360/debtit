export type DebtStatus = 'owed_to_you' | 'you_owe' | 'settled'

export interface Person {
  id: string
  name: string
  phone: string
  avatarUrl?: string
  lastActive?: string
}

export interface Transaction {
  id: string
  personId: string
  amount: number
  paidBy: 'you' | 'them'
  note?: string
  date: string
  status: DebtStatus
}

export interface DebtSummary {
  personId: string
  netBalance: number
  totalOwedToYou: number
  totalYouOwe: number
  lastTransactionDate?: string
}
