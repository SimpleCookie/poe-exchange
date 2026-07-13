import crypto from 'node:crypto'

export interface StoredToken {
  accessToken: string
  scope: string
  /** Unix ms timestamp when the token expires, or null for tokens that never expire */
  expiresAt: number | null
}

/** Name of the httpOnly cookie that identifies a browser's session. */
export const SESSION_COOKIE_NAME = 'poe_session'

/** Backstop TTL so an idle session doesn't live forever even if the PoE token itself has no expiry. */
const SESSION_IDLE_TTL_MS = 24 * 60 * 60 * 1000

interface SessionEntry {
  token: StoredToken
  expiresAt: number
}

/** Sessions keyed by the opaque, unguessable session id stored in the user's cookie. */
const sessions = new Map<string, SessionEntry>()

export function createSessionId(): string {
  return crypto.randomBytes(32).toString('hex')
}

export function setUserSession(sessionId: string, token: StoredToken): void {
  sessions.set(sessionId, { token, expiresAt: Date.now() + SESSION_IDLE_TTL_MS })
}

export function getUserSession(sessionId: string | undefined): StoredToken | null {
  if (!sessionId) {
    return null
  }

  const entry = sessions.get(sessionId)
  if (!entry) {
    return null
  }

  const isIdleExpired = entry.expiresAt <= Date.now()
  const isTokenExpired = entry.token.expiresAt !== null && Date.now() >= entry.token.expiresAt
  if (isIdleExpired || isTokenExpired) {
    sessions.delete(sessionId)
    return null
  }

  return entry.token
}

export function clearUserSession(sessionId: string | undefined): void {
  if (sessionId) {
    sessions.delete(sessionId)
  }
}

export function isAuthenticated(sessionId: string | undefined): boolean {
  return getUserSession(sessionId) !== null
}

// Purge idle-expired sessions periodically so the map doesn't grow unbounded.
setInterval(
  () => {
    const now = Date.now()
    for (const [id, entry] of sessions.entries()) {
      if (entry.expiresAt <= now) {
        sessions.delete(id)
      }
    }
  },
  15 * 60 * 1000,
)
