import type { CurrencyExchangeMarket, StashCurrencyHolding } from '../lib/exchange/types'

export const fixtureLeagues = ['Settlers', 'Standard']

export const fixtureMarketsByLeague: Record<string, CurrencyExchangeMarket[]> = {
  Settlers: [
    {
      league: 'Settlers',
      marketId: 'chaos|divine',
      volumeTraded: { chaos: 25600, divine: 180 },
      lowestRatio: { chaos: 220 },
      highestRatio: { chaos: 229 },
      lowestStock: { divine: 8 },
      highestStock: { divine: 42 },
    },
    {
      league: 'Settlers',
      marketId: 'chaos|exalted',
      volumeTraded: { chaos: 40000, exalted: 950 },
      lowestRatio: { chaos: 96 },
      highestRatio: { chaos: 102 },
      lowestStock: { exalted: 20 },
      highestStock: { exalted: 200 },
    },
    {
      league: 'Settlers',
      marketId: 'chaos|annulment',
      volumeTraded: { chaos: 21000, annulment: 780 },
      lowestRatio: { chaos: 28 },
      highestRatio: { chaos: 31 },
      lowestStock: { annulment: 10 },
      highestStock: { annulment: 80 },
    },
    {
      league: 'Settlers',
      marketId: 'chaos|vaal',
      volumeTraded: { chaos: 8500, vaal: 6500 },
      lowestRatio: { chaos: 1.08 },
      highestRatio: { chaos: 1.18 },
      lowestStock: { vaal: 50 },
      highestStock: { vaal: 500 },
    },
  ],
  Standard: [
    {
      league: 'Standard',
      marketId: 'chaos|divine',
      volumeTraded: { chaos: 8000, divine: 40 },
      lowestRatio: { chaos: 240 },
      highestRatio: { chaos: 248 },
      lowestStock: { divine: 3 },
      highestStock: { divine: 15 },
    },
    {
      league: 'Standard',
      marketId: 'chaos|exalted',
      volumeTraded: { chaos: 13000, exalted: 160 },
      lowestRatio: { chaos: 114 },
      highestRatio: { chaos: 122 },
      lowestStock: { exalted: 12 },
      highestStock: { exalted: 60 },
    },
  ],
}

export const fixtureStashByLeague: Record<string, StashCurrencyHolding[]> = {
  Settlers: [
    { league: 'Settlers', currency: 'chaos', amount: 1800 },
    { league: 'Settlers', currency: 'divine', amount: 8 },
    { league: 'Settlers', currency: 'exalted', amount: 22 },
  ],
  Standard: [
    { league: 'Standard', currency: 'chaos', amount: 4200 },
    { league: 'Standard', currency: 'divine', amount: 30 },
  ],
}
