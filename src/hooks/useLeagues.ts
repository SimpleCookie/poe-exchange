import { useEffect, useState } from 'react'
import { exchangeClient } from '../lib/exchange/exchangeClientInstance'

export function useLeagues() {
  const [leagues, setLeagues] = useState<string[]>([])
  const [selectedLeague, setSelectedLeague] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function loadLeagues() {
      setLoading(true)
      setError(null)

      try {
        const response = await exchangeClient.getLeagues()
        if (!active) {
          return
        }

        setLeagues(response)
        setSelectedLeague((current) => current || response[0] || '')
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
  }, [])

  return {
    leagues,
    selectedLeague,
    setSelectedLeague,
    loading,
    error,
  }
}
