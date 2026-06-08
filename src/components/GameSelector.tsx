import type { GameVersion } from '../lib/exchange/exchangeClient'

interface GameSelectorProps {
  game: GameVersion
  onChange: (game: GameVersion) => void
}

export function GameSelector({ game, onChange }: GameSelectorProps) {
  return (
    <div className="game-selector">
      <button
        className={`game-btn${game === 'poe1' ? ' active' : ''}`}
        onClick={() => onChange('poe1')}
      >
        PoE 1
      </button>
      <button
        className={`game-btn${game === 'poe2' ? ' active' : ''}`}
        onClick={() => onChange('poe2')}
      >
        PoE 2
      </button>
    </div>
  )
}
