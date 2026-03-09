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

export async function getContacts () {
  const userId = await getSessionUserId()
  return db.select().from(schema.person).where(eq(schema.person.userId, userId))
}

export async function createContact (data: {
  name: string
  phone: string
  avatarUrl?: string
}) {
  const userId = await getSessionUserId()
  if (!data.name.trim()) return { error: 'Name is required' }
  if (!data.phone.trim()) return { error: 'Phone is required' }

  const id = crypto.randomUUID()
  const now = new Date()

  await db.insert(schema.person).values({
    id,
    userId,
    name: data.name.trim(),
    phone: data.phone.trim(),
    avatarUrl: data.avatarUrl || null,
    createdAt: now,
    updatedAt: now,
  })

  return { id, name: data.name.trim(), phone: data.phone.trim(), avatarUrl: data.avatarUrl || null }
}

export async function updateContact (data: {
  id: string
  name?: string
  phone?: string
  avatarUrl?: string
}) {
  const userId = await getSessionUserId()

  const updates: Record<string, unknown> = { updatedAt: new Date() }
  if (data.name !== undefined) updates.name = data.name.trim()
  if (data.phone !== undefined) updates.phone = data.phone.trim()
  if (data.avatarUrl !== undefined) updates.avatarUrl = data.avatarUrl || null

  await db
    .update(schema.person)
    .set(updates)
    .where(and(eq(schema.person.id, data.id), eq(schema.person.userId, userId)))

  return { success: true }
}

export async function deleteContact (id: string) {
  const userId = await getSessionUserId()
  await db
    .delete(schema.person)
    .where(and(eq(schema.person.id, id), eq(schema.person.userId, userId)))
  return { success: true }
}
