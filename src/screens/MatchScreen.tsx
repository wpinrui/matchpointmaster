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

  // Use match simulation hook
  const { matchState, logEvents } = useMatchSimulation({
    player1: matchPlayers?.[0],
    player2: matchPlayers?.[1],
    isPlaying,
    speed,
    onComplete: () => {
      setIsPlaying(false)
      // If this was a round-robin match, save the result
      if (
        returnScreen === Screens.ROUND_ROBIN &&
        matchState?.isComplete &&
        matchPlayers
      ) {
        // Extract match result from matchState
        // In MatchState, sets[0] = player1 sets won, sets[1] = player2 sets won
        // setScores contains game scores for each set: [[p1Games, p2Games], ...]
        const player1GamesWon = matchState.sets[0]
        const player2GamesWon = matchState.sets[1]
        const winnerId = matchState.winner === 0 ? matchPlayers[0].id : matchPlayers[1].id

        // Extract game results - in best-of-5 match format, each set has games
        // setScores contains [player1Games, player2Games] for each set (best of 5 sets)
        // We need to extract individual game scores. Since we track sets won, we can
        // reconstruct approximate game results from the set scores.
        const gameResults: number[][] = []

        // Extract completed sets only
        for (
          let i = 0;
          i <= matchState.currentSet && i < matchState.setScores.length;
          i++
        ) {
          if (matchState.setScores[i]) {
            const setScore = matchState.setScores[i]
            // Each set score represents games won in that set
            // For round-robin, we store the final set scores as game results
            gameResults.push([setScore[0], setScore[1]])
          }
        }

        // Get match data from session storage (it should still be there)
        const matchDataStr = sessionStorage.getItem('roundRobinMatch')
        if (matchDataStr) {
          try {
            const matchData = JSON.parse(matchDataStr)

            // Store match result in RoundRobinMatchResult format
            sessionStorage.setItem(
              'roundRobinMatchResult',
              JSON.stringify({
                player1Id: matchPlayers[0].id,
                player2Id: matchPlayers[1].id,
                player1GamesWon,
                player2GamesWon,
                winnerId,
                gameResults, // Array of [player1Games, player2Games] per set
                matchKey: matchData.matchKey,
                currentMatchIndex: matchData.currentMatchIndex
              })
            )
            sessionStorage.setItem('roundRobinMatchCompleted', 'true')
            // Clear the match data now that we've saved the result
            sessionStorage.removeItem('roundRobinMatch')
          } catch (e) {
            console.error('Error saving round-robin match result:', e)
          }
        }
      }
    }
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
