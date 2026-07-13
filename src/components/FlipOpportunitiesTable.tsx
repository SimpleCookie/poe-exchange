import { Fragment, useEffect, useState } from 'react'
import type { FlipOpportunity } from '../lib/exchange/types'

type SortKey = 'roiPercent' | 'estimatedProfitDivines' | 'hourlyVolumeReceive' | 'spreadPerUnit'

interface FlipOpportunitiesTableProps {
  loading: boolean
  opportunities: FlipOpportunity[]
  /** Unix timestamp (seconds) of the hour this data covers. */
  dataHour: number | null
}

const SORT_LABELS: Record<SortKey, string> = {
  roiPercent: 'ROI %',
  estimatedProfitDivines: 'Est. Profit',
  hourlyVolumeReceive: 'Volume',
  spreadPerUnit: 'Spread',
}

function formatDataHour(ts: number): string {
  const date = new Date(ts * 1000)
  const hh = date.getUTCHours().toString().padStart(2, '0')
  const mm = date.getUTCMinutes().toString().padStart(2, '0')
  const yyyy = date.getUTCFullYear()
  const mo = (date.getUTCMonth() + 1).toString().padStart(2, '0')
  const dd = date.getUTCDate().toString().padStart(2, '0')
  return `${yyyy}-${mo}-${dd} ${hh}:${mm} UTC`
}

/**
 * A new hourly digest becomes available two hours after `dataHour` (see poeApiExchangeClient's
 * dataHour formula: it always points at the *previous fully completed* hour).
 */
function nextUpdateAtMs(dataHour: number | null): number | null {
  return dataHour !== null ? (dataHour + 2 * 60 * 60) * 1000 : null
}

function formatCountdown(remainingMs: number): string {
  const totalSeconds = Math.max(0, Math.floor(remainingMs / 1000))
  const mm = Math.floor(totalSeconds / 60).toString().padStart(2, '0')
  const ss = (totalSeconds % 60).toString().padStart(2, '0')
  return `${mm}:${ss}`
}

/** Ticks once a second so the caller can render a live mm:ss countdown to `targetMs`. */
function useCountdownLabel(targetMs: number | null): string | null {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (targetMs === null) {
      return
    }

    const interval = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(interval)
  }, [targetMs])

  if (targetMs === null) {
    return null
  }

  return formatCountdown(targetMs - now)
}

export function FlipOpportunitiesTable({
  loading,
  opportunities,
  dataHour,
}: FlipOpportunitiesTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>('roiPercent')
  const [sortAsc, setSortAsc] = useState(false)
  const countdownLabel = useCountdownLabel(nextUpdateAtMs(dataHour))

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortAsc((prev) => !prev)
    } else {
      setSortKey(key)
      setSortAsc(false)
    }
  }

  const sorted = [...opportunities].sort((a, b) => {
    const diff = b[sortKey] - a[sortKey]
    return sortAsc ? -diff : diff
  })

  function sortIndicator(key: SortKey) {
    if (key !== sortKey) return null
    return <span className="sort-indicator">{sortAsc ? '▲' : '▼'}</span>
  }

  function sortableTh(col: SortKey, label: string) {
    return (
      <th className={`sortable${sortKey === col ? ' active' : ''}`} onClick={() => handleSort(col)}>
        {label} {sortIndicator(col)}
      </th>
    )
  }

  return (
    <section className="results">
      <div className="results-header">
        <h2>Flip Opportunities</h2>
        {dataHour !== null && (
          <span className="data-freshness">Data hour: {formatDataHour(dataHour)}</span>
        )}
        {countdownLabel !== null && (
          <span className="data-freshness">Next update in: {countdownLabel}</span>
        )}
      </div>

      <div className="sort-bar">
        <span className="sort-bar-label">Sort by:</span>
        {(Object.keys(SORT_LABELS) as SortKey[]).map((key) => (
          <button
            key={key}
            className={`sort-btn${sortKey === key ? ' active' : ''}`}
            onClick={() => handleSort(key)}
          >
            {SORT_LABELS[key]}
            {sortKey === key && (
              <span className="sort-indicator">{sortAsc ? ' ▲' : ' ▼'}</span>
            )}
          </button>
        ))}
      </div>

      {loading ? <p>Loading...</p> : null}
      {!loading && sorted.length === 0 ? <p>No profitable opportunities found.</p> : null}

      {!loading && sorted.length > 0 ? (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Market</th>
                <th>Buy ratio</th>
                <th>Sell ratio</th>
                {sortableTh('spreadPerUnit', 'Spread / unit')}
                {sortableTh('roiPercent', 'ROI %')}
                {sortableTh('hourlyVolumeReceive', 'Vol (hr)')}
                <th>Stock depth</th>
                <th>Units</th>
                <th>Capital</th>
                {sortableTh('estimatedProfitDivines', 'Est. profit')}
                <th>Flags</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((item, index) => (
                <Fragment key={item.marketId}>
                  <tr className={item.executableUnits <= 0 ? 'row-dim' : ''}>
                    <td>{index + 1}</td>
                    <td className="cell-market">
                      <span className="currency-tag">{item.payCurrency}</span>
                      <span className="arrow">→</span>
                      <span className="currency-tag">{item.receiveCurrency}</span>
                    </td>
                    <td>
                      {item.bestBuyRatio.toFixed(2)}
                      <span className="unit-label"> {item.payCurrency}</span>
                    </td>
                    <td>
                      {item.bestSellRatio.toFixed(2)}
                      <span className="unit-label"> {item.payCurrency}</span>
                    </td>
                    <td>{item.spreadPerUnit.toFixed(2)}</td>
                    <td className="cell-roi">{item.roiPercent.toFixed(1)}%</td>
                    <td>{item.hourlyVolumeReceive.toLocaleString()}</td>
                    <td>
                      {item.lowestStockReceive !== null
                        ? item.lowestStockReceive.toLocaleString()
                        : '—'}
                    </td>
                    <td>{item.executableUnits.toLocaleString()}</td>
                    <td>
                      {item.totalCapital.toFixed(0)}
                      <span className="unit-label"> {item.payCurrency}</span>
                    </td>
                    <td className="cell-profit">
                      {item.estimatedProfit.toFixed(1)}
                      <span className="unit-label"> {item.payCurrency}</span>
                      {item.estimatedProfitDivines > 0 && (
                        <span className="profit-divines">
                          {' '}
                          ({item.estimatedProfitDivines.toFixed(2)}d)
                        </span>
                      )}
                    </td>
                    <td className="cell-flags">
                      {item.isLowVolume && (
                        <span className="flag flag-warn" title="Low hourly volume">
                          low vol
                        </span>
                      )}
                      {item.isLowStock && (
                        <span className="flag flag-warn" title="Shallow stock depth">
                          low stock
                        </span>
                      )}
                    </td>
                  </tr>
                  <tr className={`row-action${item.executableUnits <= 0 ? ' row-dim' : ''}`}>
                    <td />
                    <td colSpan={11} className="cell-action">
                      {item.recommendedAction}
                    </td>
                  </tr>
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  )
}
