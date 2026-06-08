import { fixtureLeagues, fixtureMarketsByLeague, fixtureStashByLeague } from '../../data/exchangeFixtures'
import type { CurrencyMarketsResult, ExchangeClient, GameVersion } from './exchangeClient'

export class FixtureExchangeClient implements ExchangeClient {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getLeagues(_game: GameVersion): Promise<string[]> {
    return fixtureLeagues
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getCurrencyMarkets(league: string, _game: GameVersion): Promise<CurrencyMarketsResult> {
    return {
      markets: fixtureMarketsByLeague[league] ?? [],
      dataHour: null,
    }
  }

  async getStashCurrencies(league: string) {
    return fixtureStashByLeague[league] ?? []
  }
}
