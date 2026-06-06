import type { CurrencyExchangeMarket, StashCurrencyHolding } from './types'

export interface CurrencyMarketsResult {
  markets: CurrencyExchangeMarket[]
  /** Unix timestamp (seconds) of the hour this data covers, or null for fixture data */
  dataHour: number | null
}

export interface ExchangeClient {
  getLeagues(): Promise<string[]>
  getCurrencyMarkets(league: string): Promise<CurrencyMarketsResult>
  getStashCurrencies(league: string): Promise<StashCurrencyHolding[]>
}
