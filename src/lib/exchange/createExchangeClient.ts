import type { ExchangeClient } from './exchangeClient'
import { FixtureExchangeClient } from './fixtureExchangeClient'
import { PoeApiExchangeClient } from './poeApiExchangeClient'

export function createExchangeClient(): ExchangeClient {
  const mode = import.meta.env.VITE_EXCHANGE_CLIENT ?? 'fixture'

  if (mode === 'api') {
    return new PoeApiExchangeClient()
  }

  return new FixtureExchangeClient()
}
