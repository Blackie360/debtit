/**
 * Relaxes Undici timeouts for server-side fetch (used by Better Auth for Google
 * token exchange). Default connect timeouts are tight; slow or IPv6-routed
 * networks often hit ETIMEDOUT → invalid_code on the OAuth callback.
 */
export async function register () {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return
  if (process.env.DISABLE_OAUTH_FETCH_TUNING === '1') return

  const { Agent, setGlobalDispatcher } = await import('undici')
  setGlobalDispatcher(
    new Agent({
      connectTimeout: 60_000,
      headersTimeout: 120_000,
      bodyTimeout: 120_000,
      keepAliveTimeout: 30_000,
    })
  )
}
