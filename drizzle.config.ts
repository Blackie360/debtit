import { loadEnvConfig } from '@next/env'
import { defineConfig } from 'drizzle-kit'

loadEnvConfig(process.cwd())

const databaseUrl = process.env.DATABASE_URL

if (!databaseUrl) {
  throw new Error(
    'DATABASE_URL environment variable is not set. ' +
      'drizzle-kit requires DATABASE_URL to be defined. ' +
      'Make sure your .env file is loaded or the variable is set in your environment.',
  )
}

export default defineConfig({
  schema: './lib/db/pg-schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: databaseUrl,
  },
})
