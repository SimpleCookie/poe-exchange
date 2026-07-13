import { useEffect, useRef, useState } from 'react'
import { exchangeClient } from '../lib/exchange/exchangeClientInstance'
import type { GameVersion } from '../lib/exchange/exchangeClient'
import type { CurrencyExchangeMarket, StashCurrencyHolding } from '../lib/exchange/types'

const HOUR_MS = 60 * 60 * 1000
// Small buffer past the hour boundary so the backend's per-hour PoE fetch/cache has settled.
const REFRESH_BUFFER_MS = 5_000

function msUntilNextRefresh(): number {
  const now = Date.now()
  return HOUR_MS - (now % HOUR_MS) + REFRESH_BUFFER_MS
}

export function useLeagueData(selectedLeague: string, game: GameVersion) {
  const [markets, setMarkets] = useState<CurrencyExchangeMarket[]>([])
  const [stash, setStash] = useState<StashCurrencyHolding[]>([])
  const [dataHour, setDataHour] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [refreshTick, setRefreshTick] = useState(0)
  const previousKeyRef = useRef<string | null>(null)

  // Schedule a single refetch at each hour boundary — the backend's own cache already limits
  // upstream PoE calls to once per hour, this just keeps the frontend in sync with it.
  useEffect(() => {
    const timer = setTimeout(() => {
      setRefreshTick((tick) => tick + 1)
    }, msUntilNextRefresh())

    return () => clearTimeout(timer)
  }, [refreshTick])

  useEffect(() => {
    let active = true

    // Only show the loading state for genuine league/game changes — hourly auto-refreshes
    // happen silently in the background so the table doesn't flicker away every hour.
    const key = `${selectedLeague}:${game}`
    const isBackgroundRefresh = previousKeyRef.current === key
    previousKeyRef.current = key

    async function loadLeagueData() {
      if (!selectedLeague) {
        setMarkets([])
        setStash([])
        setDataHour(null)
        setLoading(false)
        setError(null)
        return
      }

      if (!isBackgroundRefresh) {
        setLoading(true)
      }
      setError(null)

      try {
        const [marketResult, stashResponse] = await Promise.all([
          exchangeClient.getCurrencyMarkets(selectedLeague, game),
          exchangeClient.getStashCurrencies(selectedLeague),
        ])

        if (!active) {
          return
        }

        setMarkets(marketResult.markets)
        setDataHour(marketResult.dataHour)
        setStash(stashResponse)
      } catch (cause) {
        if (!active) {
          return
        }

        const message = cause instanceof Error ? cause.message : 'Unable to load market data'
        setError(message)
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void loadLeagueData()

    return () => {
      active = false
    }
  }, [selectedLeague, game, refreshTick])

  return {
    markets,
    stash,
    dataHour,
    loading,
    error,
  }
}
