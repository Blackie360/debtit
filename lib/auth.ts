import { betterAuth } from 'better-auth'
import { nextCookies } from 'better-auth/next-js'
import Database from 'better-sqlite3'

export const auth = betterAuth({
  database: new Database('database.sqlite'),
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
