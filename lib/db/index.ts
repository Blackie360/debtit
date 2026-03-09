// Use Postgres when DATABASE_URL is set; fall back to SQLite for local dev
const usePostgres = !!process.env.DATABASE_URL

function createDb () {
  if (usePostgres) {
    const postgres = require('postgres')
    const { drizzle } = require('drizzle-orm/postgres-js')
    // max:1 prevents connection pool exhaustion in serverless/Next.js runtimes
    const client = postgres(process.env.DATABASE_URL!, {
      max: 1,
      idle_timeout: 20,
      connect_timeout: 5,
    })
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
