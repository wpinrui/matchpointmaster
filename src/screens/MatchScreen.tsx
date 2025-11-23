import React, { useCallback, useEffect, useState } from 'react'
import SkipNextIcon from '@mui/icons-material/SkipNext'
import FastForwardIcon from '@mui/icons-material/FastForward'
import FlagIcon from '@mui/icons-material/Flag'
import GameButton from '../components/buttons/GameButton'
import { MatchLog } from '../components/match/MatchLog'
import { Scoreboard } from '../components/match/Scoreboard'
import { CommentaryBox } from '../components/match/CommentaryBox'
import { MatchInsights } from '../components/match/MatchInsights'
import { PlayerCard } from '../components/players/PlayerCard'
import { useMatchSimulation } from '../hooks/useMatchSimulation'
import { ScreenProps, Screens } from '../screen_manager/screens'
import { Player } from '../services/savegame/types'
import { theme } from '../theme/theme'
import { createTestPlayer } from '../utils/testPlayers'
import { useSaveDataContext } from '../services/savegame/SaveDataContext'

const MatchScreen: React.FC<ScreenProps> = ({ changeScreen }) => {
  const { players } = useSaveDataContext()
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(1) // 1x, 2x, 4x, etc.
  const [matchPlayers, setMatchPlayers] = useState<[Player, Player] | null>(null)
  const [returnScreen, setReturnScreen] = useState<Screens | null>(null)

  // Check for round-robin match or test players
  useEffect(() => {
    // Only initialize once
    if (matchPlayers) return

    const roundRobinMatch = sessionStorage.getItem('roundRobinMatch')
    if (roundRobinMatch) {
      try {
        const matchData = JSON.parse(roundRobinMatch)
        const player1 = players.find((p) => p.id === matchData.player1Id)
        const player2 = players.find((p) => p.id === matchData.player2Id)

        if (player1 && player2) {
          setMatchPlayers([player1, player2])
          setReturnScreen(matchData.returnTo || Screens.HOME)
          // Don't clear session storage here - it's needed for match result saving
          // It will be cleared after the match completes
        } else {
          console.error('Could not find players for round-robin match:', {
            player1Id: matchData.player1Id,
            player2Id: matchData.player2Id,
            availablePlayerIds: players.map((p) => p.id)
          })
          // Fallback to test players if players not found
          const testPlayer1 = createTestPlayer('Player 1', 'test-player-1')
          const testPlayer2 = createTestPlayer('Player 2', 'test-player-2')
          setMatchPlayers([testPlayer1, testPlayer2])
        }
      } catch (e) {
        console.error('Error parsing round-robin match data:', e)
        // Fallback to test players on error
        const testPlayer1 = createTestPlayer('Player 1', 'test-player-1')
        const testPlayer2 = createTestPlayer('Player 2', 'test-player-2')
        setMatchPlayers([testPlayer1, testPlayer2])
      }
    } else {
      // Fallback to test players if no round-robin match
      const testPlayer1 = createTestPlayer('Player 1', 'test-player-1')
      const testPlayer2 = createTestPlayer('Player 2', 'test-player-2')
      setMatchPlayers([testPlayer1, testPlayer2])
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [players]) // Only depend on players - matchPlayers is set inside, so we check for it at the start

  // Function to save match result
  const saveMatchResult = useCallback(
    (state: typeof matchState) => {
      if (
        returnScreen === Screens.ROUND_ROBIN &&
        state?.isComplete &&
        matchPlayers &&
        state.winner !== null
      ) {
        // Extract match result from matchState
        const player1SetsWon = state.sets[0]
        const player2SetsWon = state.sets[1]
        const winnerId = state.winner === 0 ? matchPlayers[0].id : matchPlayers[1].id

        // Extract set results
        const gameResults: number[][] = []
        for (let i = 0; i < state.setScores.length; i++) {
          const setScore = state.setScores[i]
          gameResults.push([setScore[0], setScore[1]])
        }

        // Get match data from session storage
        const matchDataStr = sessionStorage.getItem('roundRobinMatch')
        if (matchDataStr) {
          try {
            const matchData = JSON.parse(matchDataStr)

            // Store match result
            sessionStorage.setItem(
              'roundRobinMatchResult',
              JSON.stringify({
                player1Id: matchPlayers[0].id,
                player2Id: matchPlayers[1].id,
                player1GamesWon: player1SetsWon,
                player2GamesWon: player2SetsWon,
                winnerId,
                gameResults,
                matchKey: matchData.matchKey,
                currentMatchIndex: matchData.currentMatchIndex
              })
            )
            sessionStorage.setItem('roundRobinMatchCompleted', 'true')
            // Clear match state storage
            sessionStorage.removeItem('matchpointMaster_matchState')
            sessionStorage.removeItem('matchpointMaster_matchLogEvents')
          } catch (e) {
            console.error('Error saving round-robin match result:', e)
          }
        }
      }
    },
    [returnScreen, matchPlayers]
  )

  // Use match simulation hook
  const { matchState, logEvents, skipToNextPoint, skipToNextService, skipToEndOfSet } =
    useMatchSimulation({
      player1: matchPlayers?.[0],
      player2: matchPlayers?.[1],
      isPlaying,
      speed,
      onComplete: () => {
        setIsPlaying(false)
        // Save result when match completes
        if (matchState) {
          saveMatchResult(matchState)
        }
      }
    })

  // Save result when match state becomes complete (even if onComplete didn't fire)
  useEffect(() => {
    if (matchState?.isComplete && matchState.winner !== null) {
      saveMatchResult(matchState)
    }
  }, [matchState, saveMatchResult])

  // Save result on unmount if match is complete (handles navigation away)
  useEffect(() => {
    return () => {
      if (matchState?.isComplete && matchState.winner !== null) {
        saveMatchResult(matchState)
      }
    }
  }, [matchState, saveMatchResult])

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
        <GameButton
          variant="secondary"
          onClick={() => changeScreen(returnScreen || Screens.HOME)}
        >
          {returnScreen === Screens.ROUND_ROBIN ? 'Back to Tournament' : 'Back to Home'}
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
            <GameButton
              variant="secondary"
              onClick={skipToNextPoint}
              size="md"
              disabled={matchState.isComplete || isPlaying}
            >
              <span
                style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.xs }}
              >
                <SkipNextIcon style={{ fontSize: '18px' }} />
                <span>Next Point</span>
              </span>
            </GameButton>
            <GameButton
              variant="secondary"
              onClick={skipToNextService}
              size="md"
              disabled={matchState.isComplete || isPlaying}
            >
              <span
                style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.xs }}
              >
                <FastForwardIcon style={{ fontSize: '18px' }} />
                <span>Next Service</span>
              </span>
            </GameButton>
            <GameButton
              variant="secondary"
              onClick={skipToEndOfSet}
              size="md"
              disabled={matchState.isComplete || isPlaying}
            >
              <span
                style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.xs }}
              >
                <FlagIcon style={{ fontSize: '18px' }} />
                <span>End of Set</span>
              </span>
            </GameButton>
          </div>

          {/* Commentary Box */}
          <CommentaryBox logEvents={logEvents} />
        </div>

        {/* Player 2 Card */}
        <div style={{ flex: '0 0 300px' }}>
          <PlayerCard player={player2} />
        </div>
      </div>

      {/* Bottom Section: Log and Insights */}
      <div
        style={{
          display: 'flex',
          gap: theme.spacing.lg,
          flex: 1,
          minHeight: 0,
          overflow: 'hidden'
        }}
      >
        {/* Match Log - Narrower */}
        <div
          style={{
            flex: '0 0 300px',
            minWidth: 0,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            height: '100%'
          }}
        >
          <MatchLog logEvents={logEvents} />
        </div>

        {/* Match Insights */}
        <div
          style={{
            flex: 1,
            minWidth: 0,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            height: '100%'
          }}
        >
          {matchPlayers && (
            <MatchInsights
              matchState={matchState}
              logEvents={logEvents}
              player1={matchPlayers[0]}
              player2={matchPlayers[1]}
            />
          )}
        </div>
      </div>
    </div>
  )
}

export default MatchScreen
