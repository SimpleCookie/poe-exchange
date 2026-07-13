import type { CurrencyExchangeMarket, LeagueSummary, StashCurrencyHolding } from '../lib/exchange/types'

export const fixtureLeagues: LeagueSummary[] = [
  { id: 'Settlers', baseId: 'Settlers', startAt: '2026-06-01T00:00:00Z', hardcore: false, ssf: false },
  { id: 'Hardcore Settlers', baseId: 'Settlers', startAt: '2026-06-01T00:00:00Z', hardcore: true, ssf: false },
  { id: 'SSF Settlers', baseId: 'Settlers', startAt: '2026-06-01T00:00:00Z', hardcore: false, ssf: true },
  { id: 'HC SSF Settlers', baseId: 'Settlers', startAt: '2026-06-01T00:00:00Z', hardcore: true, ssf: true },
  { id: 'Standard', baseId: 'Standard', startAt: null, hardcore: false, ssf: false },
  { id: 'Hardcore', baseId: 'Standard', startAt: null, hardcore: true, ssf: false },
]

/**
 * Scales a league's market volumes/stock down (population is smaller in Hardcore/SSF
 * variants) while keeping the same ratios, so flip opportunities remain realistic.
 */
function scaleMarkets(markets: CurrencyExchangeMarket[], league: string, factor: number): CurrencyExchangeMarket[] {
  const scale = (record: Record<string, number>) =>
    Object.fromEntries(Object.entries(record).map(([currency, amount]) => [currency, Math.round(amount * factor)]))

  return markets.map((market) => ({
    ...market,
    league,
    volumeTraded: scale(market.volumeTraded),
    lowestStock: scale(market.lowestStock),
    highestStock: scale(market.highestStock),
  }))
}

const settlersMarkets: CurrencyExchangeMarket[] = [
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
  {
    league: 'Settlers',
    marketId: 'chaos|regret',
    volumeTraded: { chaos: 6200, regret: 4300 },
    lowestRatio: { chaos: 1.35 },
    highestRatio: { chaos: 1.5 },
    lowestStock: { regret: 30 },
    highestStock: { regret: 260 },
  },
  {
    league: 'Settlers',
    marketId: 'chaos|chance',
    volumeTraded: { chaos: 3100, chance: 9800 },
    lowestRatio: { chaos: 0.28 },
    highestRatio: { chaos: 0.34 },
    lowestStock: { chance: 120 },
    highestStock: { chance: 900 },
  },
  {
    league: 'Settlers',
    marketId: 'divine|exalted',
    volumeTraded: { divine: 210, exalted: 4700 },
    lowestRatio: { divine: 0.42 },
    highestRatio: { divine: 0.46 },
    lowestStock: { exalted: 15 },
    highestStock: { exalted: 120 },
  },
]

const standardMarkets: CurrencyExchangeMarket[] = [
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
  {
    league: 'Standard',
    marketId: 'chaos|annulment',
    volumeTraded: { chaos: 5400, annulment: 190 },
    lowestRatio: { chaos: 32 },
    highestRatio: { chaos: 35 },
    lowestStock: { annulment: 6 },
    highestStock: { annulment: 40 },
  },
  {
    league: 'Standard',
    marketId: 'divine|exalted',
    volumeTraded: { divine: 55, exalted: 1200 },
    lowestRatio: { divine: 0.44 },
    highestRatio: { divine: 0.48 },
    lowestStock: { exalted: 8 },
    highestStock: { exalted: 70 },
  },
]

export const fixtureMarketsByLeague: Record<string, CurrencyExchangeMarket[]> = {
  Settlers: settlersMarkets,
  'Hardcore Settlers': scaleMarkets(settlersMarkets, 'Hardcore Settlers', 0.35),
  'SSF Settlers': scaleMarkets(settlersMarkets, 'SSF Settlers', 0.05),
  'HC SSF Settlers': scaleMarkets(settlersMarkets, 'HC SSF Settlers', 0.02),
  Standard: standardMarkets,
  Hardcore: scaleMarkets(standardMarkets, 'Hardcore', 0.3),
}

export const fixtureStashByLeague: Record<string, StashCurrencyHolding[]> = {
  Settlers: [
    { league: 'Settlers', currency: 'chaos', amount: 1800 },
    { league: 'Settlers', currency: 'divine', amount: 8 },
    { league: 'Settlers', currency: 'exalted', amount: 22 },
  ],
  'Hardcore Settlers': [
    { league: 'Hardcore Settlers', currency: 'chaos', amount: 650 },
    { league: 'Hardcore Settlers', currency: 'divine', amount: 3 },
  ],
  'SSF Settlers': [
    { league: 'SSF Settlers', currency: 'chaos', amount: 420 },
    { league: 'SSF Settlers', currency: 'divine', amount: 1 },
  ],
  'HC SSF Settlers': [{ league: 'HC SSF Settlers', currency: 'chaos', amount: 180 }],
  Standard: [
    { league: 'Standard', currency: 'chaos', amount: 4200 },
    { league: 'Standard', currency: 'divine', amount: 30 },
  ],
  Hardcore: [
    { league: 'Hardcore', currency: 'chaos', amount: 900 },
    { league: 'Hardcore', currency: 'divine', amount: 5 },
  ],
}
