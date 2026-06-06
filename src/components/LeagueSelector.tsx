interface LeagueSelectorProps {
  leagues: string[]
  selectedLeague: string
  loading: boolean
  onChange: (league: string) => void
}

export function LeagueSelector({ leagues, selectedLeague, loading, onChange }: LeagueSelectorProps) {
  return (
    <section className="control-card controls">
      <h3>League</h3>
      <p>Choose a league to load active hourly exchange markets.</p>
      <label htmlFor="league">League</label>
      <select
        id="league"
        value={selectedLeague}
        onChange={(event) => onChange(event.target.value)}
        disabled={loading || leagues.length === 0}
      >
        {leagues.map((league) => (
          <option key={league} value={league}>
            {league}
          </option>
        ))}
      </select>
    </section>
  )
}
