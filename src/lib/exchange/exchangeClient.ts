import type { CurrencyExchangeMarket, StashCurrencyHolding } from './types'

export type GameVersion = 'poe1' | 'poe2'

export interface CurrencyMarketsResult {
  markets: CurrencyExchangeMarket[]
  /** Unix timestamp (seconds) of the hour this data covers, or null for fixture data */
  dataHour: number | null
}

export interface ExchangeClient {
  getLeagues(game: GameVersion): Promise<string[]>
  getCurrencyMarkets(league: string, game: GameVersion): Promise<CurrencyMarketsResult>
  getStashCurrencies(league: string): Promise<StashCurrencyHolding[]>
}
