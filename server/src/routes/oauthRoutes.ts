import crypto from 'node:crypto'
import type { FastifyPluginAsync } from 'fastify'
import type { AppDependencies } from '../types'
import { clearUserSession, isAuthenticated, setUserSession } from '../services/userSession'

const POE_AUTHORIZE_URL = 'https://www.pathofexile.com/oauth/authorize'
const POE_TOKEN_URL = 'https://www.pathofexile.com/oauth/token'
const ACCOUNT_SCOPE = 'account:stashes'

interface PendingAuth {
  codeVerifier: string
  createdAt: number
}

/** State tokens for in-flight PKCE flows, keyed by the random state string. */
const pendingAuths = new Map<string, PendingAuth>()

// Purge stale states that were never completed (> 10 minutes old).
setInterval(
  () => {
    const cutoff = Date.now() - 10 * 60 * 1000
    for (const [state, data] of pendingAuths.entries()) {
      if (data.createdAt < cutoff) {
        pendingAuths.delete(state)
      }
    }
  },
  5 * 60 * 1000,
)

function base64url(buf: Buffer): string {
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

function generateCodeVerifier(): string {
  return base64url(crypto.randomBytes(32))
}

function generateCodeChallenge(verifier: string): string {
  return base64url(crypto.createHash('sha256').update(verifier).digest())
}

function generateState(): string {
  return crypto.randomBytes(16).toString('hex')
}

export const oauthRoutes: FastifyPluginAsync<AppDependencies> = async (app, deps) => {
  const { config } = deps

  if (!config.oauthCallbackUrl) {
    app.log.warn('POE_OAUTH_CALLBACK_URL not set — OAuth routes disabled')
    return
  }

  /** GET /oauth/start — redirects the browser to PoE's authorization page. */
  app.get('/oauth/start', async (_request, reply) => {
    const codeVerifier = generateCodeVerifier()
    const codeChallenge = generateCodeChallenge(codeVerifier)
    const state = generateState()

    pendingAuths.set(state, { codeVerifier, createdAt: Date.now() })

    const params = new URLSearchParams({
      client_id: config.clientId,
      response_type: 'code',
      scope: ACCOUNT_SCOPE,
      state,
      redirect_uri: config.oauthCallbackUrl!,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256',
    })

    return reply.redirect(`${POE_AUTHORIZE_URL}?${params.toString()}`)
  })

  /** GET /oauth/callback — called by PoE after the user grants (or denies) access. */
  app.get('/oauth/callback', async (request, reply) => {
    const query = request.query as Record<string, string>
    const { code, state, error, error_description } = query

    if (error) {
      const msg = error_description ? `${error}: ${error_description}` : error
      app.log.warn({ msg }, 'PoE OAuth denied by user or error returned')
      return reply.redirect(
        `${config.frontendUrl}/?oauth_error=${encodeURIComponent(msg)}`,
      )
    }

    const pending = pendingAuths.get(state ?? '')
    if (!pending) {
      app.log.warn('OAuth callback received unknown or expired state')
      return reply.redirect(
        `${config.frontendUrl}/?oauth_error=${encodeURIComponent('Invalid or expired state')}`,
      )
    }

    pendingAuths.delete(state)

    // Exchange the authorization code for an access token server-side.
    // The client_secret never leaves the server.
    const body = new URLSearchParams({
      client_id: config.clientId,
      client_secret: config.clientSecret,
      grant_type: 'authorization_code',
      code,
      redirect_uri: config.oauthCallbackUrl!,
      scope: ACCOUNT_SCOPE,
      code_verifier: pending.codeVerifier,
    })

    const tokenResponse = await fetch(POE_TOKEN_URL, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': config.userAgent,
      },
      body,
    })

    const tokenData = (await tokenResponse.json()) as Record<string, unknown>

    if (!tokenResponse.ok || typeof tokenData.access_token !== 'string') {
      const msg =
        typeof tokenData.error_description === 'string'
          ? String(tokenData.error_description)
          : `Token exchange failed (${tokenResponse.status})`
      app.log.error({ tokenData }, 'OAuth token exchange failed')
      return reply.redirect(
        `${config.frontendUrl}/?oauth_error=${encodeURIComponent(msg)}`,
      )
    }

    const expiresIn = typeof tokenData.expires_in === 'number' ? tokenData.expires_in : null
    setUserSession({
      accessToken: tokenData.access_token,
      scope: typeof tokenData.scope === 'string' ? tokenData.scope : ACCOUNT_SCOPE,
      expiresAt: expiresIn !== null ? Date.now() + expiresIn * 1000 : null,
    })

    app.log.info('User OAuth session established successfully')
    return reply.redirect(`${config.frontendUrl}/?oauth_success=1`)
  })

  /** GET /oauth/logout — clears the in-memory user session. */
  app.get('/oauth/logout', async (_request, reply) => {
    clearUserSession()
    return reply.redirect(config.frontendUrl)
  })

  /** GET /oauth/status — returns whether a user session is active (used by the UI). */
  app.get('/oauth/status', async () => {
    return { authenticated: isAuthenticated() }
  })
}
