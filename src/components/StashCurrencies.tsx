import type { StashCurrencyHolding } from '../lib/exchange/types'
import { useOAuthStatus } from '../hooks/useOAuthStatus'

interface StashCurrenciesProps {
  stash: StashCurrencyHolding[]
}

export function StashCurrencies({ stash }: StashCurrenciesProps) {
  const { authenticated, loading, justConnected, refetch } = useOAuthStatus()

  return (
    <section className="stash">
      <h2>Stash Currencies</h2>

      {justConnected && (
        <p className="oauth-success">
          PoE account connected. Your stash will be used for calculations.
        </p>
      )}

      {!loading && !authenticated && (
        <div className="oauth-connect">
          <p>Connect your PoE account to read live stash holdings.</p>
          <a href="/oauth/start" className="btn-connect">
            Connect PoE Account
          </a>
        </div>
      )}

      {authenticated && (
        <div className="oauth-connected">
          <span className="oauth-badge">Connected</span>
          <button
            className="btn-logout"
            onClick={() => {
              void fetch('/oauth/logout').then(() => refetch())
            }}
          >
            Disconnect
          </button>
        </div>
      )}

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
