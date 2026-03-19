import { betterAuth } from 'better-auth'
import { nextCookies } from 'better-auth/next-js'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { db, provider } from './db'
import * as sqliteSchema from './db/sqlite-schema'
import * as pgSchema from './db/pg-schema'

const schema = provider === 'pg' ? pgSchema : sqliteSchema

const baseURL = process.env.BETTER_AUTH_URL ?? 'http://localhost:3000'

const extraTrusted =
  process.env.BETTER_AUTH_TRUSTED_ORIGINS?.split(',')
    .map((s) => s.trim())
    .filter(Boolean) ?? []

const trustedOrigins = Array.from(
  new Set([
    baseURL,
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    ...extraTrusted,
  ])
)

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider, schema }),
  baseURL,
  trustedOrigins,
  secret: process.env.BETTER_AUTH_SECRET,
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!
    }
  },
  user: {
    additionalFields: {
      currency: {
        type: 'string',
        required: false
      }
    }
  },
  plugins: [nextCookies()]
})
