import type { StashCurrencyHolding } from '../lib/exchange/types'

interface StashCurrenciesProps {
  stash: StashCurrencyHolding[]
}

export function StashCurrencies({ stash }: StashCurrenciesProps) {
  return (
    <section className="stash">
      <h2>Stash Currencies</h2>
      {stash.length === 0 ? (
        <p>No configured stash holdings for this league.</p>
      ) : (
        <ul>
          {stash.map((entry) => (
            <li key={`${entry.league}-${entry.currency}`}>
              <span>{entry.currency}</span>
              <span>{entry.amount.toLocaleString()}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
