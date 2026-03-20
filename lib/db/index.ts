import Database from 'better-sqlite3'
import postgres from 'postgres'
import { drizzle as drizzleSqlite } from 'drizzle-orm/better-sqlite3'
import { drizzle as drizzlePg } from 'drizzle-orm/postgres-js'

const isPostgres = process.env.NODE_ENV === 'production'

function createDb () {
  if (isPostgres) {
    const client = postgres(process.env.DATABASE_URL!)
    return { db: drizzlePg(client), provider: 'pg' as const }
  }

  const sqlite = new Database('database.sqlite')
  return { db: drizzleSqlite(sqlite), provider: 'sqlite' as const }
}

const globalForDb = globalThis as unknown as {
  _db: ReturnType<typeof createDb> | undefined
}

const instance = globalForDb._db ?? createDb()

if (process.env.NODE_ENV !== 'production') {
  globalForDb._db = instance
}

/** Dual driver: Drizzle’s pg/sqlite DB types form an unusable callable union; runtime matches `provider`. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- single export for both drivers; callers use `provider` for schema
export const db: any = instance.db
export const provider = instance.provider
