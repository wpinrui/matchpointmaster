import React, { useEffect, useRef, useState } from 'react'
import GameButton from '../components/buttons/GameButton'
import GameCard from '../components/cards/GameCard'
import { PlayerCard } from '../components/players/PlayerCard'
import { ScreenProps, Screens } from '../screen_manager/screens'
import { useSaveDataContext } from '../services/savegame/SaveDataContext'
import {
  FavourStyle,
  Gender,
  GripStyle,
  Handedness,
  Player,
  PlayStyle,
  RubberType
} from '../services/savegame/types'
import { theme } from '../theme/theme'
import {
  initializeMatch,
  simulateRally,
  type MatchState,
  type RallyEvent
} from '../utils/matchEngine'

const MatchScreen: React.FC<ScreenProps> = ({ changeScreen }) => {
  const { players } = useSaveDataContext()
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(1) // 1x, 2x, 4x, etc.
  const [matchState, setMatchState] = useState<MatchState | null>(null)
  const [logEvents, setLogEvents] = useState<RallyEvent[]>([])
  const simulationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const logEndRef = useRef<HTMLDivElement | null>(null)

  // Get 2 identical test players for debugging
  const [matchPlayers, setMatchPlayers] = useState<[Player, Player] | null>(null)

  // Initialize players once - create two identical players with all stats at 50
  useEffect(() => {
    if (!matchPlayers) {
      // Create identical test players with all stats at 50, balanced all-rounder
      const createTestPlayer = (name: string, id: string): Player => ({
        id,
        firstName: name,
        lastName: 'Test',
        shortName: name,
        isChinese: false,
        gender: Gender.MALE,
        age: 15,
        year: 2,
        elo: 1500,
        skills: {
          forehand: 50,
          backhand: 50,
          footwork: 50,
          serve: 50,
          receive: 50,
          spin: 50,
          placement: 50,
          consistency: 50
        },
        handedness: Handedness.RIGHT,
        gripStyle: GripStyle.SHAKE_HAND,
        forehandRubber: RubberType.SPIN_RUBBER,
        backhandRubber: RubberType.SPIN_RUBBER,
        forehandBackhandTendency: FavourStyle.BALANCED,
        playStyle: PlayStyle.ALL_ROUNDER,
        imagePath: '',
        traits: []
      })

      const player1 = createTestPlayer('Player 1', 'test-player-1')
      const player2 = createTestPlayer('Player 2', 'test-player-2')

      setMatchPlayers([player1, player2])
    }
  }, [matchPlayers])

  // Initialize match when players are available
  useEffect(() => {
    if (matchPlayers && !matchState) {
      const [player1, player2] = matchPlayers
      const initialState = initializeMatch(player1, player2)
      setMatchState(initialState)
      setLogEvents([])
    }
  }, [matchPlayers, matchState])

  // Auto-scroll log to bottom when new events are added
  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [logEvents])

  // Auto-play functionality
  useEffect(() => {
    if (isPlaying && matchPlayers && matchState && !matchState.isComplete) {
      // Calculate interval based on speed (faster speed = shorter interval)
      const baseInterval = 1000 // 1 second base
      const interval = baseInterval / speed

      simulationIntervalRef.current = setInterval(() => {
        setMatchState((currentState) => {
          if (!currentState || currentState.isComplete || !matchPlayers) {
            setIsPlaying(false)
            return currentState
          }

          const [player1, player2] = matchPlayers
          const isServe =
            currentState.currentGameScore[0] + currentState.currentGameScore[1] === 0
          const rally = simulateRally(
            player1,
            player2,
            currentState.servingPlayer,
            currentState.playerPositions,
            isServe
          )

          // Add events to log
          setLogEvents((prev) => [...prev, ...rally.events])

          // Update game score (points in current game)
          const newGameScore = [...currentState.currentGameScore]
          newGameScore[rally.winner]++

          // Check if game is won (first to 11, win by 2, or first to 15)
          let gameWon = false
          let gameWinner: number | null = null
          const winnerScore = newGameScore[rally.winner]
          const loserScore = newGameScore[1 - rally.winner]
          if (winnerScore >= 11) {
            const lead = winnerScore - loserScore
            if (lead >= 2 || winnerScore >= 15) {
              gameWon = true
              gameWinner = rally.winner
            }
          }

          // If game is won, update set score
          const newSetScores = [...currentState.setScores]
          const newSets = [...currentState.sets]
          let newCurrentSet = currentState.currentSet
          let newServingPlayer = currentState.servingPlayer
          let newIsComplete: boolean = currentState.isComplete
          let newWinner: number | null = currentState.winner

          if (gameWon && gameWinner !== null) {
            // Update set score (games won in current set)
            const currentSetScore = [...newSetScores[newCurrentSet]]
            currentSetScore[gameWinner]++
            // Create a new array to ensure state update is detected
            newSetScores[newCurrentSet] = [...currentSetScore]

            // Check if set is won (first to 3 games wins the set)
            if (currentSetScore[gameWinner] >= 3) {
              newSets[gameWinner]++
              // Check if match is won (first to 3 sets wins the match in best of 5)
              if (newSets[gameWinner] >= 3) {
                newIsComplete = true
                newWinner = gameWinner
                setIsPlaying(false) // Stop playing when match is complete
              } else {
                // Move to next set
                newCurrentSet++
                if (newCurrentSet < 5) {
                  newSetScores.push([0, 0])
                }
              }
            }

            // Reset game score (points) and switch server
            newGameScore[0] = 0
            newGameScore[1] = 0
            newServingPlayer = 1 - newServingPlayer
          } else {
            // Switch server every 2 points
            const totalPoints = newGameScore[0] + newGameScore[1]
            if (totalPoints > 0 && totalPoints % 2 === 0) {
              newServingPlayer = 1 - newServingPlayer
            }
          }

          return {
            ...currentState,
            sets: newSets,
            currentSet: newCurrentSet,
            setScores: newSetScores,
            currentGameScore: newGameScore,
            servingPlayer: newServingPlayer,
            playerPositions: rally.newPositions,
            rallyEvents: [...currentState.rallyEvents, ...rally.events],
            isComplete: newIsComplete,
            winner: newWinner
          }
        })
      }, interval)

      return () => {
        if (simulationIntervalRef.current) {
          clearInterval(simulationIntervalRef.current)
          simulationIntervalRef.current = null
        }
      }
    } else {
      // Clear interval when paused or match is complete
      if (simulationIntervalRef.current) {
        clearInterval(simulationIntervalRef.current)
        simulationIntervalRef.current = null
      }
    }
  }, [isPlaying, speed, matchPlayers, matchState])

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const handleSpeedChange = (delta: number) => {
    const speeds = [0.5, 1, 2, 4, 8]
    const currentIndex = speeds.indexOf(speed)
    const newIndex = Math.max(0, Math.min(speeds.length - 1, currentIndex + delta))
    setSpeed(speeds[newIndex])
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

  if (!matchState) {
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
          <GameCard
            style={{
              padding: theme.spacing.xl,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {/* Simple 4 Card Scoreboard */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'flex-start',
                gap: theme.spacing.md
              }}
            >
              {/* Player 1 Current Game (Large Outer Card) */}
              <div
                style={{
                  width: '120px',
                  height: '140px',
                  background: '#000000',
                  border: '2px solid #FFFFFF',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <span
                  style={{
                    fontSize: '64px',
                    fontWeight: 'bold',
                    color: matchState.currentGameScore[0] >= 11 ? '#FF3333' : '#FFFFFF'
                  }}
                >
                  {matchState.currentGameScore[0]}
                </span>
              </div>

              {/* Player 1 Sets (Small Inner Card) */}
              <div
                style={{
                  width: '70px',
                  height: '90px',
                  background: '#000000',
                  border: '2px solid #FFFFFF',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <span
                  style={{
                    fontSize: '48px',
                    fontWeight: 'bold',
                    color: '#FFFFFF'
                  }}
                >
                  {matchState.sets[0]}
                </span>
              </div>

              {/* Player 2 Sets (Small Inner Card) */}
              <div
                style={{
                  width: '70px',
                  height: '90px',
                  background: '#000000',
                  border: '2px solid #FFFFFF',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <span
                  style={{
                    fontSize: '48px',
                    fontWeight: 'bold',
                    color: '#FFFFFF'
                  }}
                >
                  {matchState.sets[1]}
                </span>
              </div>

              {/* Player 2 Current Game (Large Outer Card) */}
              <div
                style={{
                  width: '120px',
                  height: '140px',
                  background: '#000000',
                  border: '2px solid #FFFFFF',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <span
                  style={{
                    fontSize: '64px',
                    fontWeight: 'bold',
                    color: matchState.currentGameScore[1] >= 11 ? '#FF3333' : '#FFFFFF'
                  }}
                >
                  {matchState.currentGameScore[1]}
                </span>
              </div>
            </div>
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
      <GameCard
        style={{
          padding: 0,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          minHeight: 0
        }}
      >
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            background: theme.colors.background.dark,
            padding: theme.spacing.md,
            fontFamily: theme.typography.fontFamily.primary,
            fontSize: theme.typography.fontSize.sm,
            color: theme.colors.text.secondary
          }}
        >
          {logEvents.length === 0 ? (
            <div style={{ color: theme.colors.text.light, fontStyle: 'italic' }}>
              Match log will appear here...
            </div>
          ) : (
            <div
              style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.xs }}
            >
              {logEvents.map((event, index) => (
                <div
                  key={index}
                  style={{
                    color:
                      event.type === 'point'
                        ? theme.colors.success.main
                        : event.type === 'error'
                          ? theme.colors.error.main
                          : event.type === 'lucky_bounce'
                            ? theme.colors.accent.main
                            : event.type === 'ball'
                              ? theme.colors.text.primary
                              : theme.colors.text.secondary,
                    fontSize:
                      event.type === 'ball'
                        ? theme.typography.fontSize.xs
                        : theme.typography.fontSize.sm,
                    padding: event.type === 'ball' ? theme.spacing.xs : 0,
                    borderLeft:
                      event.type === 'ball'
                        ? `2px solid ${theme.colors.border.default}`
                        : 'none',
                    paddingLeft: event.type === 'ball' ? theme.spacing.sm : 0
                  }}
                >
                  {event.description}
                </div>
              ))}
              <div ref={logEndRef} />
            </div>
          )}
        </div>
      </GameCard>
    </div>
  )
}

export default MatchScreen
