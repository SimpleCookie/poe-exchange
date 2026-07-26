import { formatCurrencyLabel } from './currencyDisplay'
import type { CurrencyExchangeMarket, FlipOpportunity, StashCurrencyHolding } from './types'

export interface InvestmentBudget {
  chaos: number
  divine: number
}

/** Below this many receive-currency units traded per hour, mark as low-volume. */
const LOW_VOLUME_THRESHOLD = 10

/** Below this many units in the shallowest offer, mark as low-stock. */
const LOW_STOCK_THRESHOLD = 5

/**
 * Cap recommended quantity at this fraction of hourly receive-currency volume.
 * Taking more than 10 % risks moving the market or failing to fill.
 */
const MAX_VOLUME_FRACTION = 0.10

function determineChaosPerDivine(markets: CurrencyExchangeMarket[]): number {
  const market = markets.find((m) => m.marketId === 'chaos|divine')
  if (!market) {
    return 220
  }

  const low = market.lowestRatio.chaos
  const high = market.highestRatio.chaos
  if (!low || !high) {
    return 220
  }

  return (low + high) / 2
}

/**
 * Convert an amount of `currency` to chaos-equivalent so we can pool
 * stash + budget into a single comparable number.
 */
function toChaos(amount: number, currency: string, chaosPerDivine: number): number {
  if (currency === 'chaos') return amount
  if (currency === 'divine') return amount * chaosPerDivine
  return 0
}

/**
 * Total available capital expressed in `payCurrency` units,
 * combining both the stash holding and the budget.
 */
function availableCapital(
  payCurrency: string,
  stashByCurrency: Map<string, number>,
  budget: InvestmentBudget,
  chaosPerDivine: number,
): number {
  const stashChaos = toChaos(stashByCurrency.get('chaos') ?? 0, 'chaos', chaosPerDivine)
  const stashDivine = toChaos(stashByCurrency.get('divine') ?? 0, 'divine', chaosPerDivine)
  const budgetChaos = toChaos(budget.chaos, 'chaos', chaosPerDivine)
  const budgetDivine = toChaos(budget.divine, 'divine', chaosPerDivine)
  const totalChaos = stashChaos + stashDivine + budgetChaos + budgetDivine

  if (payCurrency === 'chaos') return totalChaos
  if (payCurrency === 'divine') return totalChaos / chaosPerDivine

  // For other currencies, only use what we already hold in that currency.
  return stashByCurrency.get(payCurrency) ?? 0
}

/**
 * Convert a profit amount in `payCurrency` to divines for cross-pair comparison.
 * Returns null when the conversion is not possible (unknown currency).
 */
function toEstimatedDivines(
  amount: number,
  payCurrency: string,
  chaosPerDivine: number,
): number | null {
  if (payCurrency === 'divine') return amount
  if (payCurrency === 'chaos') return amount / chaosPerDivine
  return null
}

export function calculateOpportunities(
  league: string,
  markets: CurrencyExchangeMarket[],
  stash: StashCurrencyHolding[],
  budget: InvestmentBudget,
): FlipOpportunity[] {
  const stashByCurrency = new Map(stash.map((entry) => [entry.currency, entry.amount]))
  const chaosPerDivine = determineChaosPerDivine(markets)

  const opportunities = markets
    .map((market): FlipOpportunity | null => {
      const [payCurrency, receiveCurrency] = market.marketId.split('|')
      if (!payCurrency || !receiveCurrency) return null

      const bestBuyRatio = market.lowestRatio[payCurrency]
      const bestSellRatio = market.highestRatio[payCurrency]

      // Need a positive spread to have any flip potential.
      if (!bestBuyRatio || !bestSellRatio || bestSellRatio <= bestBuyRatio) return null

      const spreadPerUnit = bestSellRatio - bestBuyRatio
      const spreadPercent = (spreadPerUnit / bestBuyRatio) * 100
      const roiPercent = spreadPercent

      // Volume expressed in receive-currency units (what we are actually buying).
      const hourlyVolumeReceive = market.volumeTraded[receiveCurrency] ?? 0
      const hourlyVolumePay = market.volumeTraded[payCurrency] ?? 0

      // Stock depth: conservative (shallowest offer seen during the hour).
      const lowestStockReceive =
        Object.keys(market.lowestStock).length > 0
          ? (market.lowestStock[receiveCurrency] ?? null)
          : null

      // ── Sizing ────────────────────────────────────────────────────────────
      const capital = availableCapital(payCurrency, stashByCurrency, budget, chaosPerDivine)

      // How many units of receiveCurrency can we afford?
      const maxAffordable = bestBuyRatio > 0 ? Math.floor(capital / bestBuyRatio) : 0

      // Limit to a safe fraction of hourly volume (reduces market-impact risk).
      const volumeLimit =
        hourlyVolumeReceive > 0 ? Math.floor(hourlyVolumeReceive * MAX_VOLUME_FRACTION) : 0

      // Limit to observable stock depth when available.
      const stockLimit = lowestStockReceive !== null ? lowestStockReceive : maxAffordable

      const executableUnits = Math.max(0, Math.min(maxAffordable, volumeLimit, stockLimit))
      const totalCapital = executableUnits * bestBuyRatio
      const estimatedProfit = executableUnits * spreadPerUnit

      const estimatedProfitDivines =
        toEstimatedDivines(estimatedProfit, payCurrency, chaosPerDivine) ?? 0

      // ── Risk flags ────────────────────────────────────────────────────────
      const isLowVolume = hourlyVolumeReceive < LOW_VOLUME_THRESHOLD || hourlyVolumeReceive === 0
      const isLowStock =
        lowestStockReceive !== null && lowestStockReceive < LOW_STOCK_THRESHOLD

      // ── Recommended action ────────────────────────────────────────────────
      let recommendedAction: string
      if (executableUnits <= 0) {
        recommendedAction = 'Insufficient budget, stock depth, or volume to recommend a trade'
      } else {
        const payLabel = formatCurrencyLabel(payCurrency)
        const receiveLabel = formatCurrencyLabel(receiveCurrency)
        recommendedAction =
          `Buy ${executableUnits} ${receiveLabel} at ≤${bestBuyRatio.toFixed(1)} ${payLabel} each` +
          ` → sell at ≥${bestSellRatio.toFixed(1)} ${payLabel}` +
          ` | capital: ${totalCapital.toFixed(0)} ${payLabel}` +
          ` | est. profit: ${estimatedProfit.toFixed(1)} ${payLabel} (${roiPercent.toFixed(1)}% ROI)`
      }

      return {
        league,
        marketId: market.marketId,
        payCurrency,
        receiveCurrency,
        bestBuyRatio,
        bestSellRatio,
        spreadPerUnit,
        spreadPercent,
        roiPercent,
        hourlyVolumeReceive,
        hourlyVolumePay,
        lowestStockReceive,
        executableUnits,
        totalCapital,
        estimatedProfit,
        estimatedProfitDivines,
        isLowVolume,
        isLowStock,
        recommendedAction,
      }
    })
    .filter((entry): entry is FlipOpportunity => entry !== null)

  // Primary sort: ROI % descending (comparable across all pairs regardless of scale).
  // Tiebreak: normalised profit in divines descending.
  opportunities.sort(
    (a, b) => b.roiPercent - a.roiPercent || b.estimatedProfitDivines - a.estimatedProfitDivines,
  )

  return opportunities
}
