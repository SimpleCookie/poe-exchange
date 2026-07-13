import { fixtureLeagues, fixtureMarketsByLeague, fixtureStashByLeague } from '../../data/exchangeFixtures'
import type { CurrencyMarketsResult, ExchangeClient, GameVersion } from './exchangeClient'
import type { LeagueSummary } from './types'

export class FixtureExchangeClient implements ExchangeClient {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getLeagues(_game: GameVersion): Promise<LeagueSummary[]> {
    return fixtureLeagues
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async getCurrencyMarkets(league: string, _game: GameVersion): Promise<CurrencyMarketsResult> {
    // Mirror the real API's "previous completed hour" behaviour so the freshness/countdown
    // UI behaves the same way in fixture mode as it does against the live API.
    const dataHour = Math.floor((Date.now() - 60 * 60 * 1000) / 3_600_000) * 3600

    return {
      markets: fixtureMarketsByLeague[league] ?? [],
      dataHour,
    }
  }

  async getStashCurrencies(league: string) {
    return fixtureStashByLeague[league] ?? []
  }
}
