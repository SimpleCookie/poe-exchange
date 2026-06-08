import { useState } from 'react'
import type { GameVersion } from '../lib/exchange/exchangeClient'
import { useLeagueData } from './useLeagueData'
import { useLeagues } from './useLeagues'

export function useExchangeData() {
  const [game, setGameRaw] = useState<GameVersion>('poe1')

  const {
    leagues,
    selectedLeague,
    setSelectedLeague,
    loading: leaguesLoading,
    error: leaguesError,
  } = useLeagues(game)
  const {
    markets,
    stash,
    dataHour,
    loading: leagueDataLoading,
    error: leagueDataError,
  } = useLeagueData(selectedLeague, game)

  function setGame(next: GameVersion) {
    setSelectedLeague('')
    setGameRaw(next)
  }

  const loading = leaguesLoading || leagueDataLoading
  const error = leaguesError ?? leagueDataError

  return {
    game,
    setGame,
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
