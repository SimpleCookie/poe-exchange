import { useMemo } from 'react'
import type { LeagueSummary } from '../lib/exchange/types'

interface LeagueSelectorProps {
  leagues: LeagueSummary[]
  selectedLeague: string
  loading: boolean
  onChange: (league: string) => void
}

function findExact(
  leagues: LeagueSummary[],
  baseId: string,
  hardcore: boolean,
  ssf: boolean,
): LeagueSummary | undefined {
  return leagues.find((league) => league.baseId === baseId && league.hardcore === hardcore && league.ssf === ssf)
}

/** Falls back to the closest available variant when the exact hardcore/ssf combo doesn't exist for a base league. */
function findBestMatch(
  leagues: LeagueSummary[],
  baseId: string,
  hardcore: boolean,
  ssf: boolean,
): LeagueSummary | undefined {
  const variants = leagues.filter((league) => league.baseId === baseId)
  return findExact(leagues, baseId, hardcore, ssf) ?? variants.find((league) => league.hardcore === hardcore) ?? variants[0]
}

export function LeagueSelector({ leagues, selectedLeague, loading, onChange }: LeagueSelectorProps) {
  const current = leagues.find((league) => league.id === selectedLeague)

  const baseIds = useMemo(() => {
    const seen = new Set<string>()
    const ordered: string[] = []
    for (const league of leagues) {
      if (!seen.has(league.baseId)) {
        seen.add(league.baseId)
        ordered.push(league.baseId)
      }
    }
    return ordered
  }, [leagues])

  const hardcoreTarget = current
    ? findExact(leagues, current.baseId, !current.hardcore, current.ssf)
    : undefined
  const ssfTarget = current ? findExact(leagues, current.baseId, current.hardcore, !current.ssf) : undefined

  function handleBaseChange(baseId: string) {
    const next = findBestMatch(leagues, baseId, current?.hardcore ?? false, current?.ssf ?? false)
    if (next) {
      onChange(next.id)
    }
  }

  return (
    <section className="control-card controls">
      <h3>League</h3>
      <p>Choose a league to load active hourly exchange markets.</p>
      <label htmlFor="league">League</label>
      <select
        id="league"
        value={current?.baseId ?? ''}
        onChange={(event) => handleBaseChange(event.target.value)}
        disabled={loading || baseIds.length === 0}
      >
        {baseIds.map((baseId) => (
          <option key={baseId} value={baseId}>
            {baseId}
          </option>
        ))}
      </select>

      <div className="league-mode-toggles" role="group" aria-label="League mode">
        <button
          type="button"
          className={`mode-btn${current?.hardcore ? ' active' : ''}`}
          aria-pressed={current?.hardcore ?? false}
          disabled={loading || !hardcoreTarget}
          onClick={() => hardcoreTarget && onChange(hardcoreTarget.id)}
        >
          Hardcore
        </button>
        <button
          type="button"
          className={`mode-btn${current?.ssf ? ' active' : ''}`}
          aria-pressed={current?.ssf ?? false}
          disabled={loading || !ssfTarget}
          onClick={() => ssfTarget && onChange(ssfTarget.id)}
        >
          SSF
        </button>
      </div>
    </section>
  )
}
