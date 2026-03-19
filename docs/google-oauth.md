# Google sign-in (`invalid_code` / `ETIMEDOUT`)

If the callback shows **CODE: invalid_code** and the server logs **Better Auth: TypeError: fetch failed** with **`ETIMEDOUT`**, the app usually failed to reach Google’s token endpoint (`oauth2.googleapis.com`) before the auth code expired.

## What we changed in this repo

- **`instrumentation.ts`** — Uses [Undici](https://undici.nodejs.org/) with longer `connectTimeout` / body timeouts for server `fetch` (OAuth code exchange).
- **`pnpm dev`** — Sets `NODE_OPTIONS=--dns-result-order=ipv4first` (via `cross-env`) to reduce IPv6 hangups on some Windows networks.
- **`lib/auth.ts`** — Sets `trustedOrigins` for `localhost` / `127.0.0.1` and optional `BETTER_AUTH_TRUSTED_ORIGINS`.

## Check your environment

1. **`BETTER_AUTH_URL`** must match the URL you use in the browser (including port), e.g. `http://localhost:3000`. Do not mix `localhost` and `127.0.0.1` between env and the address bar.
2. **Google Cloud Console** → OAuth client → **Authorized redirect URIs** must include:
   - `{BETTER_AUTH_URL}/api/auth/callback/google`
3. **Firewall / VPN** — Allow outbound HTTPS to `*.googleapis.com` and `accounts.google.com`.
4. **Corporate proxy** — Set `HTTP_PROXY` / `HTTPS_PROXY` if required.
5. **Retry** — After a failed exchange, the authorization code is invalid; sign in again from the home page.

## Disable fetch tuning (debug)

```bash
set DISABLE_OAUTH_FETCH_TUNING=1
pnpm dev
```

(On Unix: `export DISABLE_OAUTH_FETCH_TUNING=1`.)
