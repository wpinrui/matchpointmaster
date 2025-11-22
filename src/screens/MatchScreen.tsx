import React, { useMemo, useState } from 'react'
import { ScreenProps, Screens } from '../screen_manager/screens'
import { useSaveDataContext } from '../services/savegame/SaveDataContext'
import { PlayerCard } from '../components/players/PlayerCard'
import { theme } from '../theme/theme'
import GameButton from '../components/buttons/GameButton'
import GameCard from '../components/cards/GameCard'

const MatchScreen: React.FC<ScreenProps> = ({ changeScreen }) => {
  const { players } = useSaveDataContext()
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(1) // 1x, 2x, 4x, etc.

  // Match state - best of 5 sets
  const [sets, setSets] = useState<number[]>([0, 0]) // [player1Sets, player2Sets]
  const [currentSet, setCurrentSet] = useState(0) // Current set index (0-4)
  const [setScores, setSetScores] = useState<number[][]>([[0, 0]]) // Scores for each set [[p1, p2], ...]
  const [currentGameScore, setCurrentGameScore] = useState<number[]>([0, 0]) // Current game score [p1, p2]

  // Get 2 random players
  const matchPlayers = useMemo(() => {
    if (players.length < 2) {
      // If not enough players, return null and show message
      return null
    }
    const shuffled = [...players].sort(() => Math.random() - 0.5)
    return [shuffled[0], shuffled[1]]
  }, [players])

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const handleSpeedChange = (delta: number) => {
    const speeds = [0.5, 1, 2, 4, 8]
    const currentIndex = speeds.indexOf(speed)
    const newIndex = Math.max(0, Math.min(speeds.length - 1, currentIndex + delta))
    setSpeed(speeds[newIndex])
  }

  const handleSkipToEndOfSet = () => {
    // For now, just mark as completed - will be implemented later
    console.log('Skip to end of set')
  }

  const handleSkipToEndOfMatch = () => {
    // For now, just mark as completed - will be implemented later
    console.log('Skip to end of match')
  }

  if (!matchPlayers) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          gap: theme.spacing.lg
        }}
      >
        <h2
          style={{
            fontFamily: theme.typography.fontFamily.heading,
            fontSize: theme.typography.fontSize['2xl'],
            color: theme.colors.text.primary
          }}
        >
          Not enough players
        </h2>
        <p style={{ color: theme.colors.text.secondary }}>
          You need at least 2 players to start a match.
        </p>
        <GameButton variant="primary" onClick={() => changeScreen(Screens.HOME)}>
          Back to Home
        </GameButton>
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
          <GameCard
            style={{
              padding: theme.spacing.xl,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: theme.spacing.lg
            }}
          >
            {/* Match Score (Sets) */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                width: '100%',
                alignItems: 'center',
                marginBottom: theme.spacing.md
              }}
            >
              <div
                style={{
                  fontSize: theme.typography.fontSize['2xl'],
                  fontWeight: theme.typography.fontWeight.bold,
                  color: theme.colors.text.primary,
                  textAlign: 'center',
                  flex: 1
                }}
              >
                {sets[0]}
              </div>
              <div
                style={{
                  fontSize: theme.typography.fontSize.lg,
                  color: theme.colors.text.secondary,
                  textAlign: 'center',
                  flex: 1
                }}
              >
                Sets
              </div>
              <div
                style={{
                  fontSize: theme.typography.fontSize['2xl'],
                  fontWeight: theme.typography.fontWeight.bold,
                  color: theme.colors.text.primary,
                  textAlign: 'center',
                  flex: 1
                }}
              >
                {sets[1]}
              </div>
            </div>

            {/* Table Tennis Table Visual */}
            <div
              style={{
                width: '100%',
                height: '200px',
                background: theme.gradients.secondary,
                borderRadius: theme.borderRadius.lg,
                border: `${theme.borderWidth.default} solid ${theme.colors.border.default}`,
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: `${theme.spacing.lg} 0`
              }}
            >
              {/* Net */}
              <div
                style={{
                  position: 'absolute',
                  width: '100%',
                  height: '4px',
                  background: theme.colors.neutral.white,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  boxShadow: `0 0 10px ${theme.colors.neutral.white}`
                }}
              />
              {/* Center line */}
              <div
                style={{
                  position: 'absolute',
                  width: '2px',
                  height: '100%',
                  background: theme.colors.border.default,
                  left: '50%',
                  transform: 'translateX(-50%)'
                }}
              />
            </div>

            {/* Current Set Score */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                width: '100%',
                alignItems: 'center',
                marginTop: theme.spacing.md
              }}
            >
              <div
                style={{
                  fontSize: theme.typography.fontSize['4xl'],
                  fontWeight: theme.typography.fontWeight.extrabold,
                  color: theme.colors.primary.main,
                  textAlign: 'center',
                  flex: 1
                }}
              >
                {currentGameScore[0]}
              </div>
              <div
                style={{
                  fontSize: theme.typography.fontSize.lg,
                  color: theme.colors.text.secondary,
                  textAlign: 'center',
                  flex: 1
                }}
              >
                Set {currentSet + 1} / 5
              </div>
              <div
                style={{
                  fontSize: theme.typography.fontSize['4xl'],
                  fontWeight: theme.typography.fontWeight.extrabold,
                  color: theme.colors.secondary.main,
                  textAlign: 'center',
                  flex: 1
                }}
              >
                {currentGameScore[1]}
              </div>
            </div>

            {/* Set History */}
            {setScores.length > 0 && (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: theme.spacing.xs,
                  width: '100%',
                  marginTop: theme.spacing.md
                }}
              >
                <div
                  style={{
                    fontSize: theme.typography.fontSize.sm,
                    color: theme.colors.text.secondary,
                    textAlign: 'center',
                    marginBottom: theme.spacing.xs
                  }}
                >
                  Set Scores
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-around',
                    gap: theme.spacing.sm
                  }}
                >
                  {setScores.map((score, index) => (
                    <div
                      key={index}
                      style={{
                        display: 'flex',
                        gap: theme.spacing.xs,
                        fontSize: theme.typography.fontSize.base,
                        color: theme.colors.text.primary
                      }}
                    >
                      <span
                        style={{
                          fontWeight:
                            score[0] > score[1]
                              ? theme.typography.fontWeight.bold
                              : theme.typography.fontWeight.normal
                        }}
                      >
                        {score[0]}
                      </span>
                      <span style={{ color: theme.colors.text.secondary }}>-</span>
                      <span
                        style={{
                          fontWeight:
                            score[1] > score[0]
                              ? theme.typography.fontWeight.bold
                              : theme.typography.fontWeight.normal
                        }}
                      >
                        {score[1]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </GameCard>

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
            >
              {isPlaying ? '⏸ Pause' : '▶ Play'}
            </GameButton>
            <GameButton
              variant="secondary"
              onClick={() => handleSpeedChange(-1)}
              size="md"
              disabled={speed <= 0.5}
            >
              ⏪ Slow Down ({speed}x)
            </GameButton>
            <GameButton
              variant="secondary"
              onClick={() => handleSpeedChange(1)}
              size="md"
              disabled={speed >= 8}
            >
              ⏩ Speed Up ({speed}x)
            </GameButton>
            <GameButton variant="accent" onClick={handleSkipToEndOfSet} size="md">
              ⏭ Skip to End of Set
            </GameButton>
            <GameButton variant="accent" onClick={handleSkipToEndOfMatch} size="md">
              ⏩⏩ Skip to End of Match
            </GameButton>
          </div>
        </div>

        {/* Player 2 Card */}
        <div style={{ flex: '0 0 300px' }}>
          <PlayerCard player={player2} />
        </div>
      </div>

      {/* Output Log */}
      <GameCard
        style={{
          padding: theme.spacing.lg,
          flex: '0 0 200px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        <h3
          style={{
            fontFamily: theme.typography.fontFamily.heading,
            fontSize: theme.typography.fontSize.lg,
            fontWeight: theme.typography.fontWeight.bold,
            color: theme.colors.text.primary,
            margin: 0,
            marginBottom: theme.spacing.md
          }}
        >
          Match Log
        </h3>
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            background: theme.colors.background.dark,
            borderRadius: theme.borderRadius.md,
            padding: theme.spacing.md,
            fontFamily: theme.typography.fontFamily.mono,
            fontSize: theme.typography.fontSize.sm,
            color: theme.colors.text.secondary,
            border: `${theme.borderWidth.default} solid ${theme.colors.border.dark}`
          }}
        >
          {/* Log will be populated here later */}
          <div style={{ color: theme.colors.text.light, fontStyle: 'italic' }}>
            Match log will appear here...
          </div>
        </div>
      </GameCard>
    </div>
  )
}

export default MatchScreen
