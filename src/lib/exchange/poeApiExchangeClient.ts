import type { CurrencyMarketsResult, ExchangeClient, GameVersion } from './exchangeClient'
import type { CurrencyExchangeMarket, StashCurrencyHolding } from './types'

interface LeaguesResponse {
  leagues: Array<{ id?: string; name?: string }>
}

interface CurrencyExchangeResponse {
  next_change_id?: number
  markets: Array<{
    league: string
    market_id: string
    volume_traded: Record<string, number>
    lowest_ratio: Record<string, number>
    highest_ratio: Record<string, number>
    lowest_stock: Record<string, number>
    highest_stock: Record<string, number>
  }>
}

interface StashCurrenciesResponse {
  stash: StashCurrencyHolding[]
}

export class PoeApiExchangeClient implements ExchangeClient {
  private readonly baseUrl = import.meta.env.VITE_POE_PROXY_BASE_URL ?? '/api/poe'

  async getLeagues(game: GameVersion): Promise<string[]> {
    const realm = game === 'poe2' ? 'poe2' : 'pc'
    const response = await this.requestJson<LeaguesResponse>(`/leagues?type=main&realm=${realm}`)
    return response.leagues
      .map((league) => league.id ?? league.name ?? '')
      .filter((league) => league.length > 0)
  }

  async getCurrencyMarkets(league: string, game: GameVersion): Promise<CurrencyMarketsResult> {
    // The current hour is never complete; request the previous completed hour.
    const realm = game === 'poe2' ? 'poe2' : 'pc'
    const dataHour = Math.floor((Date.now() - 60 * 60 * 1000) / 3_600_000) * 3600
    const response = await this.requestJson<CurrencyExchangeResponse>(
      `/currency-exchange?realm=${realm}&id=${dataHour}`,
    )

    const markets: CurrencyExchangeMarket[] = response.markets
      .filter((market) => market.league === league)
      .map((market) => ({
        league: market.league,
        marketId: market.market_id,
        volumeTraded: market.volume_traded,
        lowestRatio: market.lowest_ratio,
        highestRatio: market.highest_ratio,
        lowestStock: market.lowest_stock ?? {},
        highestStock: market.highest_stock ?? {},
      }))

    return { markets, dataHour }
  }

  async getStashCurrencies(league: string): Promise<StashCurrencyHolding[]> {
    const response = await this.requestJson<StashCurrenciesResponse>(
      `/stash-currencies?league=${encodeURIComponent(league)}`,
    )
    return response.stash
  }

  private async requestJson<T>(path: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      headers: {
        Accept: 'application/json',
      },
    })

    if (!response.ok) {
      const message = await this.readErrorMessage(response)
      throw new Error(message)
    }

    return (await response.json()) as T
  }

  private async readErrorMessage(response: Response): Promise<string> {
    try {
      const payload = (await response.json()) as { error?: string; details?: string }
      if (payload.error) {
        return payload.details ? `${payload.error}: ${payload.details}` : payload.error
      }
    } catch {
      // Ignore JSON parse failures and return a generic status error below.
    }

    return `PoE API request failed (${response.status})`
  }
}
