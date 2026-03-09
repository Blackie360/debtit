import { betterAuth } from 'better-auth'
import { nextCookies } from 'better-auth/next-js'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { db, provider } from './db'
import * as sqliteSchema from './db/sqlite-schema'
import * as pgSchema from './db/pg-schema'

const schema = provider === 'pg' ? pgSchema : sqliteSchema

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider, schema }),
  baseURL: process.env.BETTER_AUTH_URL ?? 'http://localhost:3000',
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
