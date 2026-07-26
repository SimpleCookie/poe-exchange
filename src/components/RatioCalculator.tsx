import { useState } from 'react'
import { formatCurrencyLabel } from '../lib/exchange/currencyDisplay'
import { roundToNiceFraction } from '../lib/exchange/roundRatio'

interface RatioCalculatorProps {
  payCurrency: string
  receiveCurrency: string
  /** ROI % observed in the hourly data — used to project a sell ratio from the live buy ratio. */
  roiPercent: number
  defaultRatio: number
  defaultQuantity: number
}

export function RatioCalculator({
  payCurrency,
  receiveCurrency,
  roiPercent,
  defaultRatio,
  defaultQuantity,
}: RatioCalculatorProps) {
  const [ratioInput, setRatioInput] = useState(String(defaultRatio.toFixed(2)))
  const [quantityInput, setQuantityInput] = useState(String(defaultQuantity))

  const rawRatio = Number.parseFloat(ratioInput)
  const quantity = Number.parseFloat(quantityInput)
  const hasValidRatio = Number.isFinite(rawRatio) && rawRatio > 0
  const hasValidQuantity = Number.isFinite(quantity) && quantity > 0

  const roundedRatio = hasValidRatio ? roundToNiceFraction(rawRatio) : null
  const sellRatio = roundedRatio !== null ? roundedRatio * (1 + roiPercent / 100) : null
  const capital = roundedRatio !== null && hasValidQuantity ? roundedRatio * quantity : null
  const profit = sellRatio !== null && roundedRatio !== null && hasValidQuantity
    ? (sellRatio - roundedRatio) * quantity
    : null

  const payLabel = formatCurrencyLabel(payCurrency)
  const receiveLabel = formatCurrencyLabel(receiveCurrency)

  return (
    <div className="ratio-calculator">
      <h3>Ratio calculator</h3>
      <p className="calc-hint">
        Type the ratio you currently see on the trade site to recalculate buy/sell price and
        profit — the value is snapped to a clean fraction so it&apos;s easy to list in-game.
      </p>

      <div className="calc-inputs">
        <label>
          Current ratio ({payLabel} per {receiveLabel})
          <input
            type="number"
            step="0.01"
            min="0"
            value={ratioInput}
            onChange={(event) => setRatioInput(event.target.value)}
          />
        </label>

        <label>
          Quantity ({receiveLabel})
          <input
            type="number"
            step="1"
            min="0"
            value={quantityInput}
            onChange={(event) => setQuantityInput(event.target.value)}
          />
        </label>
      </div>

      {roundedRatio !== null ? (
        <dl className="calc-results">
          <div>
            <dt>Rounded buy ratio</dt>
            <dd>
              {roundedRatio.toFixed(2)} {payLabel}
            </dd>
          </div>
          <div>
            <dt>Projected sell ratio</dt>
            <dd>{sellRatio !== null ? `${sellRatio.toFixed(2)} ${payLabel}` : '—'}</dd>
          </div>
          <div>
            <dt>Capital required</dt>
            <dd>{capital !== null ? `${capital.toFixed(1)} ${payLabel}` : '—'}</dd>
          </div>
          <div>
            <dt>Estimated profit</dt>
            <dd>{profit !== null ? `${profit.toFixed(1)} ${payLabel}` : '—'}</dd>
          </div>
        </dl>
      ) : (
        <p className="calc-hint">Enter a ratio above zero to see the calculation.</p>
      )}
    </div>
  )
}
