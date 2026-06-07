export interface StoredToken {
  accessToken: string
  scope: string
  /** Unix ms timestamp when the token expires, or null for tokens that never expire */
  expiresAt: number | null
}

let currentSession: StoredToken | null = null

export function setUserSession(token: StoredToken): void {
  currentSession = token
}

export function getUserSession(): StoredToken | null {
  if (!currentSession) return null

  if (currentSession.expiresAt !== null && Date.now() >= currentSession.expiresAt) {
    currentSession = null
    return null
  }

  return currentSession
}

export function clearUserSession(): void {
  currentSession = null
}

export function isAuthenticated(): boolean {
  return getUserSession() !== null
}
