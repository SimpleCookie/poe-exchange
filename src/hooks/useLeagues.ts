import { useEffect, useState } from 'react'
import { exchangeClient } from '../lib/exchange/exchangeClientInstance'
import type { GameVersion } from '../lib/exchange/exchangeClient'
import type { LeagueSummary } from '../lib/exchange/types'

export function useLeagues(game: GameVersion) {
  const [leagues, setLeagues] = useState<LeagueSummary[]>([])
  const [selectedLeague, setSelectedLeague] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function loadLeagues() {
      setLoading(true)
      setError(null)

      try {
        const response = await exchangeClient.getLeagues(game)
        if (!active) {
          return
        }

        setLeagues(response)
        setSelectedLeague((current) => current || response[0]?.id || '')
      } catch (cause) {
        if (!active) {
          return
        }

        const message = cause instanceof Error ? cause.message : 'Unable to load leagues'
        setError(message)
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void loadLeagues()

    return () => {
      active = false
    }
  }, [game])

  return {
    leagues,
    selectedLeague,
    setSelectedLeague,
    loading,
    error,
  }
}
