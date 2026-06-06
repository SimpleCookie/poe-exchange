import { useEffect, useState } from 'react'
import { exchangeClient } from '../lib/exchange/exchangeClientInstance'
import type { CurrencyExchangeMarket, StashCurrencyHolding } from '../lib/exchange/types'

export function useLeagueData(selectedLeague: string) {
  const [markets, setMarkets] = useState<CurrencyExchangeMarket[]>([])
  const [stash, setStash] = useState<StashCurrencyHolding[]>([])
  const [dataHour, setDataHour] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true

    async function loadLeagueData() {
      if (!selectedLeague) {
        setMarkets([])
        setStash([])
        setDataHour(null)
        setLoading(false)
        setError(null)
        return
      }

      setLoading(true)
      setError(null)

      try {
        const [marketResult, stashResponse] = await Promise.all([
          exchangeClient.getCurrencyMarkets(selectedLeague),
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
  }, [selectedLeague])

  return {
    markets,
    stash,
    dataHour,
    loading,
    error,
  }
}
