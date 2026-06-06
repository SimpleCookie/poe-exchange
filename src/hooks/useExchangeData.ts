import { useLeagueData } from './useLeagueData'
import { useLeagues } from './useLeagues'

export function useExchangeData() {
  const {
    leagues,
    selectedLeague,
    setSelectedLeague,
    loading: leaguesLoading,
    error: leaguesError,
  } = useLeagues()
  const {
    markets,
    stash,
    dataHour,
    loading: leagueDataLoading,
    error: leagueDataError,
  } = useLeagueData(selectedLeague)

  const loading = leaguesLoading || leagueDataLoading
  const error = leaguesError ?? leagueDataError

  return {
    leagues,
    selectedLeague,
    setSelectedLeague,
    markets,
    stash,
    dataHour,
    loading,
    error,
  }
}
