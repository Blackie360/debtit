import type { Person, Transaction } from './types'

export const MOCK_PEOPLE: Person[] = [
  { id: '1', name: 'Sarah Jenkins', phone: '+1 555 0101', lastActive: '2 days ago' },
  { id: '2', name: 'Mike Ross', phone: '+1 555 0102', lastActive: '1 day ago' },
  { id: '3', name: 'Alex Rivera', phone: '+1 555 0103', lastActive: '3 days ago' },
  { id: '4', name: 'Marcus Brown', phone: '+1 555 0104', lastActive: '5 days ago' },
  { id: '5', name: 'Jordan Lee', phone: '+1 555 0105', lastActive: '1 week ago' },
]

export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: 't1',
    personId: '1',
    amount: 150,
    paidBy: 'them',
    note: 'Dinner at Gusto',
    date: '2023-10-24',
    status: 'owed_to_you',
  },
  {
    id: 't2',
    personId: '2',
    amount: 420,
    paidBy: 'you',
    note: 'New Headphones',
    date: '2023-10-22',
    status: 'you_owe',
  },
  {
    id: 't3',
    personId: '3',
    amount: 85,
    paidBy: 'you',
    note: 'Concert Tickets',
    date: '2023-10-20',
    status: 'settled',
  },
  {
    id: 't4',
    personId: '1',
    amount: 15,
    paidBy: 'you',
    note: 'Lunch at Tacos',
    date: '2023-10-24',
    status: 'you_owe',
  },
  {
    id: 't5',
    personId: '1',
    amount: 30,
    paidBy: 'them',
    note: 'Shared Grocery Run',
    date: '2023-10-22',
    status: 'you_owe',
  },
]
