import React, { useCallback, useEffect, useState } from 'react'
import GameButton from '../components/buttons/GameButton'
import { MatchLog } from '../components/match/MatchLog'
import { Scoreboard } from '../components/match/Scoreboard'
import { PlayerCard } from '../components/players/PlayerCard'
import { useMatchSimulation } from '../hooks/useMatchSimulation'
import { ScreenProps, Screens } from '../screen_manager/screens'
import { Player } from '../services/savegame/types'
import { theme } from '../theme/theme'
import { createTestPlayer } from '../utils/testPlayers'

const MatchScreen: React.FC<ScreenProps> = ({ changeScreen }) => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(1) // 1x, 2x, 4x, etc.
  const [matchPlayers, setMatchPlayers] = useState<[Player, Player] | null>(null)

  // Initialize test players
  useEffect(() => {
    if (!matchPlayers) {
      const player1 = createTestPlayer('Player 1', 'test-player-1')
      const player2 = createTestPlayer('Player 2', 'test-player-2')
      setMatchPlayers([player1, player2])
    }
  }, [matchPlayers])

  // Use match simulation hook
  const { matchState, logEvents } = useMatchSimulation({
    player1: matchPlayers?.[0],
    player2: matchPlayers?.[1],
    isPlaying,
    speed,
    onComplete: () => setIsPlaying(false)
  })

  const handlePlayPause = useCallback(() => {
    setIsPlaying(!isPlaying)
  }, [isPlaying])

  const handleSpeedChange = useCallback(
    (delta: number) => {
      const speeds = [0.5, 1, 2, 4, 8]
      const currentIndex = speeds.indexOf(speed)
      const newIndex = Math.max(0, Math.min(speeds.length - 1, currentIndex + delta))
      setSpeed(speeds[newIndex])
    },
    [speed]
  )

  if (!matchPlayers || !matchState) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%'
        }}
      >
        <div style={{ color: theme.colors.text.secondary }}>Initializing match...</div>
      </div>
    )
  }

  const [player1, player2] = matchPlayers

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        padding: theme.spacing.lg,
        gap: theme.spacing.lg,
        overflow: 'hidden'
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <h1
          style={{
            fontFamily: theme.typography.fontFamily.heading,
            fontSize: theme.typography.fontSize['3xl'],
            fontWeight: theme.typography.fontWeight.bold,
            background: theme.gradients.primary,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            margin: 0
          }}
        >
          Match Simulation
          {matchState.isComplete && matchState.winner !== null && (
            <span
              style={{
                fontSize: theme.typography.fontSize.lg,
                marginLeft: theme.spacing.md,
                color: theme.colors.text.secondary
              }}
            >
              - {matchState.winner === 0 ? player1.shortName : player2.shortName} Wins!
            </span>
          )}
        </h1>
        <GameButton variant="secondary" onClick={() => changeScreen(Screens.HOME)}>
          Back to Home
        </GameButton>
      </div>

      {/* Main Match View */}
      <div
        style={{
          display: 'flex',
          gap: theme.spacing.xl,
          flex: 1,
          overflow: 'hidden',
          minHeight: 0
        }}
      >
        {/* Player 1 Card */}
        <div style={{ flex: '0 0 300px' }}>
          <PlayerCard player={player1} />
        </div>

        {/* Scoreboard */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            gap: theme.spacing.lg,
            minWidth: 0
          }}
        >
          <Scoreboard matchState={matchState} />

          {/* Control Buttons */}
          <div
            style={{
              display: 'flex',
              gap: theme.spacing.md,
              justifyContent: 'center',
              flexWrap: 'wrap'
            }}
          >
            <GameButton
              variant={isPlaying ? 'secondary' : 'success'}
              onClick={handlePlayPause}
              size="md"
              disabled={matchState.isComplete}
            >
              {isPlaying ? '⏸ Pause' : '▶ Play'}
            </GameButton>
            <GameButton
              variant="secondary"
              onClick={() => handleSpeedChange(-1)}
              size="md"
              disabled={speed <= 0.5 || matchState.isComplete || isPlaying}
            >
              ⏪ Slow Down ({speed}x)
            </GameButton>
            <GameButton
              variant="secondary"
              onClick={() => handleSpeedChange(1)}
              size="md"
              disabled={speed >= 8 || matchState.isComplete || isPlaying}
            >
              ⏩ Speed Up ({speed}x)
            </GameButton>
          </div>
        </div>

        {/* Player 2 Card */}
        <div style={{ flex: '0 0 300px' }}>
          <PlayerCard player={player2} />
        </div>
      </div>

      {/* Output Log */}
      <MatchLog logEvents={logEvents} />
    </div>
  )
}

export default MatchScreen
