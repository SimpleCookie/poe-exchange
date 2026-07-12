export interface CurrencyExchangeMarket {
  league: string
  marketId: string
  volumeTraded: Record<string, number>
  lowestRatio: Record<string, number>
  highestRatio: Record<string, number>
  lowestStock: Record<string, number>
  highestStock: Record<string, number>
}

export interface LeagueSummary {
  id: string
  /** League name with known Hardcore/SSF prefixes stripped, shared by all mode variants. */
  baseId: string
  startAt: string | null
  hardcore: boolean
  ssf: boolean
}

export interface StashCurrencyHolding {
  league: string
  currency: string
  amount: number
}

export interface FlipOpportunity {
  league: string
  marketId: string
  payCurrency: string
  receiveCurrency: string
  /** Cheapest rate seen in the hour: pay-currency units per receive-currency unit */
  bestBuyRatio: number
  /** Most expensive rate seen in the hour: pay-currency units per receive-currency unit */
  bestSellRatio: number
  /** Absolute spread per receive-currency unit (bestSellRatio − bestBuyRatio) */
  spreadPerUnit: number
  /** Spread as a percentage of the buy ratio */
  spreadPercent: number
  /** Same as spreadPercent — profit on capital deployed */
  roiPercent: number
  /** Total receive-currency units traded during the hour */
  hourlyVolumeReceive: number
  /** Total pay-currency units traded during the hour */
  hourlyVolumePay: number
  /** Minimum stock depth for receive currency seen across all offers */
  lowestStockReceive: number | null
  /** How many receive-currency units we recommend buying given budget + depth + volume */
  executableUnits: number
  /** Pay-currency capital required for executableUnits */
  totalCapital: number
  /** Estimated profit in pay-currency */
  estimatedProfit: number
  /** Estimated profit normalised to divines for cross-pair comparison */
  estimatedProfitDivines: number
  /** True when hourly receive-currency volume is very low */
  isLowVolume: boolean
  /** True when lowest stock depth is very shallow */
  isLowStock: boolean
  /** Human-readable recommended action with rates and quantities */
  recommendedAction: string
}
