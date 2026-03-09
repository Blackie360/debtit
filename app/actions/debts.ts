'use server'

import { headers } from 'next/headers'
import { eq, and } from 'drizzle-orm'
import { db, provider } from '@/lib/db'
import { auth } from '@/lib/auth'
import * as pgSchema from '@/lib/db/pg-schema'
import * as sqliteSchema from '@/lib/db/sqlite-schema'

const schema = provider === 'pg' ? pgSchema : sqliteSchema

async function getSessionUserId () {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) throw new Error('Unauthorized')
  return session.user.id
}

export async function getDebts () {
  const userId = await getSessionUserId()
  return db.select().from(schema.debt).where(eq(schema.debt.userId, userId))
}

export async function getDebtsByPerson (personId: string) {
  const userId = await getSessionUserId()
  return db
    .select()
    .from(schema.debt)
    .where(and(eq(schema.debt.userId, userId), eq(schema.debt.personId, personId)))
}

export async function createDebt (data: {
  personId: string
  amount: number
  paidBy: 'you' | 'them'
  note?: string
  date?: string
}) {
  const userId = await getSessionUserId()
  if (!data.personId) return { error: 'Person is required' }
  if (!data.amount || data.amount <= 0) return { error: 'Valid amount is required' }

  const id = crypto.randomUUID()
  const now = new Date()
  const net = data.paidBy === 'you' ? data.amount : -data.amount
  const status = net > 0 ? 'owed_to_you' : 'you_owe'

  await db.insert(schema.debt).values({
    id,
    userId,
    personId: data.personId,
    amount: data.amount,
    paidBy: data.paidBy,
    note: data.note || null,
    date: data.date ? new Date(data.date) : now,
    status,
    createdAt: now,
    updatedAt: now,
  })

  return { id, status }
}

export async function updateDebt (data: {
  id: string
  amount?: number
  paidBy?: 'you' | 'them'
  note?: string
  status?: string
}) {
  const userId = await getSessionUserId()

  const updates: Record<string, unknown> = { updatedAt: new Date() }
  if (data.amount !== undefined) updates.amount = data.amount
  if (data.paidBy !== undefined) updates.paidBy = data.paidBy
  if (data.note !== undefined) updates.note = data.note || null
  if (data.status !== undefined) updates.status = data.status

  if (data.amount !== undefined || data.paidBy !== undefined) {
    const rows = await db
      .select()
      .from(schema.debt)
      .where(and(eq(schema.debt.id, data.id), eq(schema.debt.userId, userId)))
    if (rows.length > 0) {
      const row = rows[0]
      const amt = data.amount ?? row.amount
      const paid = data.paidBy ?? row.paidBy
      const net = paid === 'you' ? amt : -amt
      if (!data.status) {
        updates.status = net > 0 ? 'owed_to_you' : 'you_owe'
      }
    }
  }

  await db
    .update(schema.debt)
    .set(updates)
    .where(and(eq(schema.debt.id, data.id), eq(schema.debt.userId, userId)))

  return { success: true }
}

export async function deleteDebt (id: string) {
  const userId = await getSessionUserId()
  await db
    .delete(schema.debt)
    .where(and(eq(schema.debt.id, id), eq(schema.debt.userId, userId)))
  return { success: true }
}
