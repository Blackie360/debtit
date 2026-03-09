const isPostgres = process.env.NODE_ENV === 'production'

function createDb () {
  if (isPostgres) {
    const postgres = require('postgres')
    const { drizzle } = require('drizzle-orm/postgres-js')
    const client = postgres(process.env.DATABASE_URL!)
    return { db: drizzle(client), provider: 'pg' as const }
  }

  const Database = require('better-sqlite3')
  const { drizzle } = require('drizzle-orm/better-sqlite3')
  const sqlite = new Database('database.sqlite')
  return { db: drizzle(sqlite), provider: 'sqlite' as const }
}

const globalForDb = globalThis as unknown as {
  _db: ReturnType<typeof createDb> | undefined
}

const instance = globalForDb._db ?? createDb()

if (process.env.NODE_ENV !== 'production') {
  globalForDb._db = instance
}

export const db = instance.db
export const provider = instance.provider
