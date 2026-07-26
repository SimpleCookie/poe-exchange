import { Link, useParams, useSearchParams } from 'react-router-dom'
import '../App.css'
import { AppHeader } from '../components/AppHeader'
import { RatioCalculator } from '../components/RatioCalculator'
import { useLeagueData } from '../hooks/useLeagueData'
import { formatCurrencyLabel } from '../lib/exchange/currencyDisplay'
import type { GameVersion } from '../lib/exchange/exchangeClient'

const LOW_VOLUME_FRACTION = 0.1
const DEFAULT_QUANTITY_FALLBACK = 10

function isGameVersion(value: string | null): value is GameVersion {
  return value === 'poe1' || value === 'poe2'
}

export function TradeDetailPage() {
  const { league = '', marketId = '' } = useParams()
  const [searchParams] = useSearchParams()
  const gameParam = searchParams.get('game')
  const game: GameVersion = isGameVersion(gameParam) ? gameParam : 'poe1'

  const decodedLeague = decodeURIComponent(league)
  const decodedMarketId = decodeURIComponent(marketId)
  const [payCurrency, receiveCurrency] = decodedMarketId.split('|')

  const { markets, dataHour, loading, error } = useLeagueData(decodedLeague, game)
  const market = markets.find((entry) => entry.marketId === decodedMarketId)

  return (
    <main className="app">
      <AppHeader />

      <p>
        <Link to="/">← Back to opportunities</Link>
      </p>

      <section className="results">
        <h2>
          {payCurrency ? formatCurrencyLabel(payCurrency) : '?'} →{' '}
          {receiveCurrency ? formatCurrencyLabel(receiveCurrency) : '?'}
        </h2>
        <p className="calc-hint">
          League: {decodedLeague || 'unknown'} · Game: {game}
          {dataHour !== null && !loading ? ` · Hourly data hour: ${dataHour}` : ''}
        </p>

        {loading ? <p>Loading market data...</p> : null}
        {error ? <p className="error">{error}</p> : null}

        {!loading && !error && !market ? (
          <p>No market data found for this pair in the selected league.</p>
        ) : null}

        {!loading && !error && market && payCurrency && receiveCurrency ? (
          (() => {
            const bestBuyRatio = market.lowestRatio[payCurrency]
            const bestSellRatio = market.highestRatio[payCurrency]

            if (!bestBuyRatio || !bestSellRatio || bestSellRatio <= bestBuyRatio) {
              return <p>No profitable spread currently available for this pair.</p>
            }

            const roiPercent = ((bestSellRatio - bestBuyRatio) / bestBuyRatio) * 100
            const hourlyVolumeReceive = market.volumeTraded[receiveCurrency] ?? 0
            const lowestStockReceive =
              Object.keys(market.lowestStock).length > 0
                ? (market.lowestStock[receiveCurrency] ?? null)
                : null

            const volumeLimit = Math.floor(hourlyVolumeReceive * LOW_VOLUME_FRACTION)
            const defaultQuantity =
              [volumeLimit, lowestStockReceive].filter(
                (value): value is number => value !== null && value > 0,
              ).sort((a, b) => a - b)[0] ?? DEFAULT_QUANTITY_FALLBACK

            return (
              <>
                <dl className="calc-results">
                  <div>
                    <dt>Buy ratio (hourly)</dt>
                    <dd>
                      {bestBuyRatio.toFixed(2)} {payCurrency}
                    </dd>
                  </div>
                  <div>
                    <dt>Sell ratio (hourly)</dt>
                    <dd>
                      {bestSellRatio.toFixed(2)} {payCurrency}
                    </dd>
                  </div>
                  <div>
                    <dt>ROI %</dt>
                    <dd>{roiPercent.toFixed(1)}%</dd>
                  </div>
                  <div>
                    <dt>Vol (hr)</dt>
                    <dd>{hourlyVolumeReceive.toLocaleString()}</dd>
                  </div>
                </dl>

                <RatioCalculator
                  payCurrency={payCurrency}
                  receiveCurrency={receiveCurrency}
                  roiPercent={roiPercent}
                  defaultRatio={bestBuyRatio}
                  defaultQuantity={defaultQuantity}
                />
              </>
            )
          })()
        ) : null}
      </section>
    </main>
  )
}
