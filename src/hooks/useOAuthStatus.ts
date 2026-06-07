import { useCallback, useEffect, useState } from 'react'

interface OAuthStatus {
  authenticated: boolean
  loading: boolean
  justConnected: boolean
}

/**
 * Polls the backend for the current OAuth session status.
 * Also detects ?oauth_success=1 in the URL on mount to surface a success message.
 */
export function useOAuthStatus(): OAuthStatus & { refetch: () => void } {
  const [authenticated, setAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [justConnected, setJustConnected] = useState(false)

  const fetchStatus = useCallback(async () => {
    try {
      const response = await fetch('/oauth/status')
      if (response.ok) {
        const data = (await response.json()) as { authenticated: boolean }
        setAuthenticated(data.authenticated)
      }
    } catch {
      // Backend unreachable — leave as unauthenticated
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // Detect successful OAuth redirect on initial load.
    const params = new URLSearchParams(window.location.search)
    if (params.has('oauth_success')) {
      setJustConnected(true)
      // Remove the query param without triggering a full navigation.
      const clean = window.location.pathname
      window.history.replaceState({}, '', clean)
    }

    void fetchStatus()
  }, [fetchStatus])

  return { authenticated, loading, justConnected, refetch: fetchStatus }
}
