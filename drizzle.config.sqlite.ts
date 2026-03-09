import { defineConfig } from 'drizzle-kit'

export default defineConfig({
  schema: './lib/db/sqlite-schema.ts',
  out: './drizzle-sqlite',
  dialect: 'sqlite',
  dbCredentials: {
    url: 'database.sqlite'
  }
})
