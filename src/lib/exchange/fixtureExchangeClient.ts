import { fixtureLeagues, fixtureMarketsByLeague, fixtureStashByLeague } from '../../data/exchangeFixtures'
import type { CurrencyMarketsResult, ExchangeClient } from './exchangeClient'

export class FixtureExchangeClient implements ExchangeClient {
  async getLeagues(): Promise<string[]> {
    return fixtureLeagues
  }

  async getCurrencyMarkets(league: string): Promise<CurrencyMarketsResult> {
    return {
      markets: fixtureMarketsByLeague[league] ?? [],
      dataHour: null,
    }
  }

  async getStashCurrencies(league: string) {
    return fixtureStashByLeague[league] ?? []
  }
}
