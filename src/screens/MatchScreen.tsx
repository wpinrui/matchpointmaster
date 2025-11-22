import React, { useMemo, useState, useEffect, useRef, useCallback } from 'react'
import { ScreenProps, Screens } from '../screen_manager/screens'
import { useSaveDataContext } from '../services/savegame/SaveDataContext'
import { EditablePlayerCard } from '../components/players/EditablePlayerCard'
import { theme } from '../theme/theme'
import GameButton from '../components/buttons/GameButton'
import GameCard from '../components/cards/GameCard'
import {
  initializeMatch,
  simulateRally,
  type MatchState,
  type RallyEvent
} from '../utils/matchEngine'
import { runStatAdvantageExperiments } from '../utils/matchExperiments'
import {
  Player,
  Gender,
  Handedness,
  GripStyle,
  RubberType,
  FavourStyle,
  PlayStyle
} from '../services/savegame/types'

/**
 * Download text as a file
 */
function downloadTextFile(text: string, filename: string): void {
  try {
    const blob = new Blob([text], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Error downloading file:', error)
  }
}

const MatchScreen: React.FC<ScreenProps> = ({ changeScreen }) => {
  const { players } = useSaveDataContext()
  const [isPlaying, setIsPlaying] = useState(false)
  const [speed, setSpeed] = useState(1) // 1x, 2x, 4x, etc.
  const [matchState, setMatchState] = useState<MatchState | null>(null)
  const [logEvents, setLogEvents] = useState<RallyEvent[]>([])
  const [totalPoints, setTotalPoints] = useState<[number, number]>([0, 0]) // Track total points won for debugging
  const [isRunningExperiments, setIsRunningExperiments] = useState(false)
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
      setTotalPoints([0, 0]) // Reset total points
    }
  }, [matchPlayers, matchState])

  // Auto-scroll log to bottom when new events are added
  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [logEvents])

  const playSingleRally = useCallback(
    (player1: Player, player2: Player) => {
      if (!matchState || matchState.isComplete || !matchPlayers) return

      setMatchState((currentState) => {
        if (!currentState || currentState.isComplete) return currentState

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

        // Update game score
        const newGameScore = [...currentState.currentGameScore]
        newGameScore[rally.winner]++

        // Update total points won for debugging
        setTotalPoints((prev) => {
          const newTotal = [...prev]
          newTotal[rally.winner]++
          return newTotal as [number, number]
        })

        // Check if game is won (first to 11, win by 2, or first to 15 in case of 14-14)
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
          // Update set score
          const currentSetScore = [...newSetScores[newCurrentSet]]
          currentSetScore[gameWinner]++
          newSetScores[newCurrentSet] = currentSetScore

          // Check if set is won (first to 3 sets in best of 5)
          if (currentSetScore[gameWinner] >= 3) {
            newSets[gameWinner]++
            // Check if match is won
            if (newSets[gameWinner] >= 3) {
              newIsComplete = true
              newWinner = gameWinner
            } else {
              // Move to next set
              newCurrentSet++
              if (newCurrentSet < 5) {
                newSetScores.push([0, 0])
              }
            }
          }

          // Reset game score and switch server
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
    },
    [matchState, matchPlayers]
  )

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
    if (!matchState || matchState.isComplete || !matchPlayers) return

    setIsPlaying(false)
    const [player1, player2] = matchPlayers
    const targetSet = matchState.currentSet
    let state = { ...matchState }
    const newLogEvents: RallyEvent[] = []
    const newTotalPoints: [number, number] = [...totalPoints] as [number, number]

    // Simulate until set is complete
    while (!state.isComplete && state.currentSet === targetSet) {
      const isServe = state.currentGameScore[0] + state.currentGameScore[1] === 0
      const rally = simulateRally(
        player1,
        player2,
        state.servingPlayer,
        state.playerPositions,
        isServe
      )

      newLogEvents.push(...rally.events)

      // Update state
      const newGameScore = [...state.currentGameScore]
      newGameScore[rally.winner]++

      // Update total points won
      newTotalPoints[rally.winner]++

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

      const newSetScores = [...state.setScores]
      const newSets = [...state.sets]
      let newCurrentSet = state.currentSet
      let newServingPlayer = state.servingPlayer
      let newIsComplete: boolean = state.isComplete
      let newWinner: number | null = state.winner

      if (gameWon && gameWinner !== null) {
        const currentSetScore = [...newSetScores[newCurrentSet]]
        currentSetScore[gameWinner]++
        newSetScores[newCurrentSet] = currentSetScore

        if (currentSetScore[gameWinner] >= 3) {
          newSets[gameWinner]++
          if (newSets[gameWinner] >= 3) {
            newIsComplete = true
            newWinner = gameWinner
          } else {
            newCurrentSet++
            if (newCurrentSet < 5) {
              newSetScores.push([0, 0])
            }
          }
        }

        newGameScore[0] = 0
        newGameScore[1] = 0
        newServingPlayer = 1 - newServingPlayer
      } else {
        const totalPoints = newGameScore[0] + newGameScore[1]
        if (totalPoints > 0 && totalPoints % 2 === 0) {
          newServingPlayer = 1 - newServingPlayer
        }
      }

      state = {
        ...state,
        sets: newSets,
        currentSet: newCurrentSet,
        setScores: newSetScores,
        currentGameScore: newGameScore,
        servingPlayer: newServingPlayer,
        playerPositions: rally.newPositions,
        rallyEvents: [...state.rallyEvents, ...rally.events],
        isComplete: newIsComplete,
        winner: newWinner
      }
    }

    setLogEvents((prev) => [...prev, ...newLogEvents])
    setMatchState(state)
    setTotalPoints(newTotalPoints)
  }

  const handleSimulatePoint = () => {
    if (!matchState || matchState.isComplete || !matchPlayers) return

    const [player1, player2] = matchPlayers
    // Every point starts with a serve - check if this is the start of a new point
    // A new point starts when the total points is 0 (game start) or when we just reset the score
    const totalPoints = matchState.currentGameScore[0] + matchState.currentGameScore[1]
    const isServe = totalPoints === 0
    const rally = simulateRally(
      player1,
      player2,
      matchState.servingPlayer,
      matchState.playerPositions,
      isServe
    )

    // Add events to log
    setLogEvents((prev) => [...prev, ...rally.events])

    // Update game score
    const newGameScore = [...matchState.currentGameScore]
    newGameScore[rally.winner]++

    // Update total points won for debugging
    setTotalPoints((prev) => {
      const newTotal = [...prev]
      newTotal[rally.winner]++
      return newTotal as [number, number]
    })

    // Check if game is won (first to 11, win by 2, or first to 15 in case of 14-14)
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
    const newSetScores = [...matchState.setScores]
    const newSets = [...matchState.sets]
    let newCurrentSet = matchState.currentSet
    let newServingPlayer = matchState.servingPlayer
    let newIsComplete: boolean = matchState.isComplete
    let newWinner: number | null = matchState.winner

    if (gameWon && gameWinner !== null) {
      // Update set score
      const currentSetScore = [...newSetScores[newCurrentSet]]
      currentSetScore[gameWinner]++
      newSetScores[newCurrentSet] = currentSetScore

      // Check if set is won (first to 3 sets in best of 5)
      if (currentSetScore[gameWinner] >= 3) {
        newSets[gameWinner]++
        // Check if match is won
        if (newSets[gameWinner] >= 3) {
          newIsComplete = true
          newWinner = gameWinner
        } else {
          // Move to next set
          newCurrentSet++
          if (newCurrentSet < 5) {
            newSetScores.push([0, 0])
          }
        }
      }

      // Reset game score and switch server
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

    setMatchState({
      ...matchState,
      sets: newSets,
      currentSet: newCurrentSet,
      setScores: newSetScores,
      currentGameScore: newGameScore,
      servingPlayer: newServingPlayer,
      playerPositions: rally.newPositions,
      rallyEvents: [...matchState.rallyEvents, ...rally.events],
      isComplete: newIsComplete,
      winner: newWinner
    })
  }

  const handleExportLog = () => {
    if (logEvents.length === 0) return

    const player1Name =
      matchPlayers?.[0]?.shortName || matchPlayers?.[0]?.firstName || 'Player 1'
    const player2Name =
      matchPlayers?.[1]?.shortName || matchPlayers?.[1]?.firstName || 'Player 2'

    let logText = `Match Simulation Log\n`
    logText += `Players: ${player1Name} vs ${player2Name}\n`
    logText += `Date: ${new Date().toLocaleString()}\n`
    logText += `Total Events: ${logEvents.length}\n`
    logText += `Points Simulated: ${logEvents.filter((e) => e.type === 'point').length}\n`
    logText += `\n${'='.repeat(80)}\n\n`

    // Add player attributes
    if (matchPlayers) {
      const [p1, p2] = matchPlayers
      logText += `PLAYER ATTRIBUTES\n`
      logText += `${'='.repeat(80)}\n\n`

      // Player 1
      logText += `${player1Name}:\n`
      logText += `  Skills:\n`
      logText += `    Forehand: ${Math.round(p1.skills.forehand)}\n`
      logText += `    Backhand: ${Math.round(p1.skills.backhand)}\n`
      logText += `    Footwork: ${Math.round(p1.skills.footwork)}\n`
      logText += `    Serve: ${Math.round(p1.skills.serve)}\n`
      logText += `    Receive: ${Math.round(p1.skills.receive)}\n`
      logText += `    Spin: ${Math.round(p1.skills.spin)}\n`
      logText += `    Placement: ${Math.round(p1.skills.placement)}\n`
      logText += `    Consistency: ${Math.round(p1.skills.consistency)}\n`
      logText += `  Play Style: ${p1.playStyle}\n`
      logText += `  Forehand/Backhand Tendency: ${p1.forehandBackhandTendency}\n`
      logText += `  Equipment: ${p1.gripStyle} • ${p1.forehandRubber} / ${p1.backhandRubber}\n`
      logText += `  Handedness: ${p1.handedness}\n`
      logText += `\n`

      // Player 2
      logText += `${player2Name}:\n`
      logText += `  Skills:\n`
      logText += `    Forehand: ${Math.round(p2.skills.forehand)}\n`
      logText += `    Backhand: ${Math.round(p2.skills.backhand)}\n`
      logText += `    Footwork: ${Math.round(p2.skills.footwork)}\n`
      logText += `    Serve: ${Math.round(p2.skills.serve)}\n`
      logText += `    Receive: ${Math.round(p2.skills.receive)}\n`
      logText += `    Spin: ${Math.round(p2.skills.spin)}\n`
      logText += `    Placement: ${Math.round(p2.skills.placement)}\n`
      logText += `    Consistency: ${Math.round(p2.skills.consistency)}\n`
      logText += `  Play Style: ${p2.playStyle}\n`
      logText += `  Forehand/Backhand Tendency: ${p2.forehandBackhandTendency}\n`
      logText += `  Equipment: ${p2.gripStyle} • ${p2.forehandRubber} / ${p2.backhandRubber}\n`
      logText += `  Handedness: ${p2.handedness}\n`
      logText += `\n${'='.repeat(80)}\n\n`
    }

    let pointNumber = 0
    let inPoint = false

    logEvents.forEach((event, index) => {
      // Check if this is the start of a new point (serve event)
      if (event.type === 'serve') {
        pointNumber++
        inPoint = true
        logText += `\n${'='.repeat(80)}\n`
        logText += `POINT ${pointNumber}\n`
        logText += `${'='.repeat(80)}\n\n`
      }

      // Write the event
      const prefix = event.type === 'ball' ? '  ' : ''
      logText += `${prefix}${event.description}\n`

      // Add ball details if available
      if (event.ballDetails) {
        const details = event.ballDetails
        logText += `    Position: ${details.position}, Depth: ${details.depth}\n`
        logText += `    Speed: ${Math.round(details.speed)}, Spin: ${details.spin}\n`
        logText += `    Player Position: ${details.playerPosition.horizontal}, ${details.playerPosition.vertical}\n`
        logText += `    Difficulty: ${details.difficulty}\n`
      }

      // Check if this is the end of a point
      if (event.type === 'point' && inPoint) {
        logText += `\n--- Point ${pointNumber} Complete ---\n\n`
        inPoint = false
      }
    })

    // Add match summary
    if (matchState) {
      logText += `\n${'='.repeat(80)}\n`
      logText += `MATCH SUMMARY\n`
      logText += `${'='.repeat(80)}\n\n`
      logText += `Sets: ${matchState.sets[0]} - ${matchState.sets[1]}\n`
      logText += `Current Set: ${matchState.currentSet + 1} / 5\n`
      logText += `Current Game Score: ${matchState.currentGameScore[0]} - ${matchState.currentGameScore[1]}\n`
      if (matchState.isComplete && matchState.winner !== null) {
        const winnerName = matchState.winner === 0 ? player1Name : player2Name
        logText += `Winner: ${winnerName}\n`
      }
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
    const filename = `match-log-${timestamp}.txt`
    downloadTextFile(logText, filename)
  }

  const handleSimulate200Points = () => {
    if (!matchState || !matchPlayers) return

    setIsPlaying(false)
    const [player1, player2] = matchPlayers
    let state = { ...matchState }
    const newLogEvents: RallyEvent[] = []
    let pointsSimulated = 0
    const targetPoints = 200
    const newTotalPoints: [number, number] = [...totalPoints] as [number, number]

    // Simulate 200 points without ending the match
    while (pointsSimulated < targetPoints) {
      const isServe = state.currentGameScore[0] + state.currentGameScore[1] === 0
      const rally = simulateRally(
        player1,
        player2,
        state.servingPlayer,
        state.playerPositions,
        isServe
      )

      newLogEvents.push(...rally.events)

      const newGameScore = [...state.currentGameScore]
      newGameScore[rally.winner]++

      // Update total points won
      newTotalPoints[rally.winner]++

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

      let newSetScores = [...state.setScores]
      let newSets = [...state.sets]
      let newCurrentSet = state.currentSet
      let newServingPlayer = state.servingPlayer
      const newIsComplete: boolean = false // Never mark as complete in debug mode
      const newWinner: number | null = null // Never set winner in debug mode

      if (gameWon && gameWinner !== null) {
        const currentSetScore = [...newSetScores[newCurrentSet]]
        currentSetScore[gameWinner]++
        newSetScores[newCurrentSet] = currentSetScore

        // Don't end match - just continue to next set if needed
        if (currentSetScore[gameWinner] >= 3) {
          newSets[gameWinner]++
          // Don't check for match win - just move to next set
          newCurrentSet++
          if (newCurrentSet >= 5) {
            // Reset to first set if we've gone through all 5
            newCurrentSet = 0
            newSetScores = [[0, 0]]
            newSets = [0, 0]
          } else {
            newSetScores.push([0, 0])
          }
        }

        newGameScore[0] = 0
        newGameScore[1] = 0
        newServingPlayer = 1 - newServingPlayer
      } else {
        const totalPoints = newGameScore[0] + newGameScore[1]
        if (totalPoints > 0 && totalPoints % 2 === 0) {
          newServingPlayer = 1 - newServingPlayer
        }
      }

      state = {
        ...state,
        sets: newSets,
        currentSet: newCurrentSet,
        setScores: newSetScores,
        currentGameScore: newGameScore,
        servingPlayer: newServingPlayer,
        playerPositions: rally.newPositions,
        rallyEvents: [...state.rallyEvents, ...rally.events],
        isComplete: newIsComplete,
        winner: newWinner
      }

      pointsSimulated++
    }

    setLogEvents((prev) => [...prev, ...newLogEvents])
    setMatchState(state)
    setTotalPoints(newTotalPoints)
  }

  const handleRunExperiments = () => {
    setIsRunningExperiments(true)

    // Run experiments in a timeout to allow UI to update first
    setTimeout(() => {
      try {
        // Run experiments (this may take a while)
        const results = runStatAdvantageExperiments(5000)

        // Convert to JSON and download
        const jsonString = JSON.stringify(results, null, 2)
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
        const filename = `stat-advantage-experiments-${timestamp}.json`
        downloadTextFile(jsonString, filename)

        // Also log to console for easy viewing
        console.log('Experiment Results:', results)
        alert(`Experiments complete! Results saved to ${filename}`)
      } catch (error) {
        console.error('Error running experiments:', error)
        alert('Error running experiments. Check console for details.')
      } finally {
        setIsRunningExperiments(false)
      }
    }, 100)
  }

  const handleSkipToEndOfMatch = () => {
    if (!matchState || matchState.isComplete || !matchPlayers) return

    setIsPlaying(false)
    const [player1, player2] = matchPlayers
    let state = { ...matchState }
    const newLogEvents: RallyEvent[] = []
    const newTotalPoints: [number, number] = [...totalPoints] as [number, number]

    // Fast-forward to end of match
    while (!state.isComplete) {
      const isServe = state.currentGameScore[0] + state.currentGameScore[1] === 0
      const rally = simulateRally(
        player1,
        player2,
        state.servingPlayer,
        state.playerPositions,
        isServe
      )

      newLogEvents.push(...rally.events)

      const newGameScore = [...state.currentGameScore]
      newGameScore[rally.winner]++

      // Update total points won
      newTotalPoints[rally.winner]++

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

      const newSetScores = [...state.setScores]
      const newSets = [...state.sets]
      let newCurrentSet = state.currentSet
      let newServingPlayer = state.servingPlayer
      let newIsComplete: boolean = state.isComplete
      let newWinner: number | null = state.winner

      if (gameWon && gameWinner !== null) {
        const currentSetScore = [...newSetScores[newCurrentSet]]
        currentSetScore[gameWinner]++
        newSetScores[newCurrentSet] = currentSetScore

        if (currentSetScore[gameWinner] >= 3) {
          newSets[gameWinner]++
          if (newSets[gameWinner] >= 3) {
            newIsComplete = true
            newWinner = gameWinner
          } else {
            newCurrentSet++
            if (newCurrentSet < 5) {
              newSetScores.push([0, 0])
            }
          }
        }

        newGameScore[0] = 0
        newGameScore[1] = 0
        newServingPlayer = 1 - newServingPlayer
      } else {
        const totalPointsInGame = newGameScore[0] + newGameScore[1]
        if (totalPointsInGame > 0 && totalPointsInGame % 2 === 0) {
          newServingPlayer = 1 - newServingPlayer
        }
      }

      state = {
        ...state,
        sets: newSets,
        currentSet: newCurrentSet,
        setScores: newSetScores,
        currentGameScore: newGameScore,
        servingPlayer: newServingPlayer,
        playerPositions: rally.newPositions,
        rallyEvents: [...state.rallyEvents, ...rally.events],
        isComplete: newIsComplete,
        winner: newWinner
      }
    }

    setLogEvents((prev) => [...prev, ...newLogEvents])
    setMatchState(state)
    setTotalPoints(newTotalPoints)
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
          <EditablePlayerCard
            player={player1}
            onPlayerChange={(updatedPlayer) => {
              if (matchPlayers) {
                setMatchPlayers([updatedPlayer, matchPlayers[1]])
              }
            }}
          />
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
              justifyContent: 'center',
              gap: theme.spacing.lg
            }}
          >
            {/* Total Points Scoreboard (Debug Mode) */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                width: '100%',
                gap: theme.spacing.xl
              }}
            >
              <div
                style={{
                  fontSize: theme.typography.fontSize['5xl'],
                  fontWeight: theme.typography.fontWeight.extrabold,
                  color: theme.colors.primary.main,
                  textAlign: 'center'
                }}
              >
                {totalPoints[0]}
              </div>
              <div
                style={{
                  fontSize: theme.typography.fontSize['5xl'],
                  fontWeight: theme.typography.fontWeight.extrabold,
                  color: theme.colors.text.secondary,
                  textAlign: 'center'
                }}
              >
                :
              </div>
              <div
                style={{
                  fontSize: theme.typography.fontSize['5xl'],
                  fontWeight: theme.typography.fontWeight.extrabold,
                  color: theme.colors.secondary.main,
                  textAlign: 'center'
                }}
              >
                {totalPoints[1]}
              </div>
            </div>
            <div
              style={{
                fontSize: theme.typography.fontSize.sm,
                color: theme.colors.text.light,
                fontStyle: 'italic'
              }}
            >
              Total Points Won
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
              variant="primary"
              onClick={handleSimulatePoint}
              size="md"
              disabled={matchState.isComplete || isPlaying}
            >
              🎾 Simulate Point
            </GameButton>
            <GameButton
              variant="primary"
              onClick={handleSimulate200Points}
              size="md"
              disabled={matchState.isComplete || isPlaying}
            >
              🎾🎾 Simulate 200 Points
            </GameButton>
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
              disabled={speed <= 0.5 || matchState.isComplete}
            >
              ⏪ Slow Down ({speed}x)
            </GameButton>
            <GameButton
              variant="secondary"
              onClick={() => handleSpeedChange(1)}
              size="md"
              disabled={speed >= 8 || matchState.isComplete}
            >
              ⏩ Speed Up ({speed}x)
            </GameButton>
            <GameButton
              variant="accent"
              onClick={handleSkipToEndOfSet}
              size="md"
              disabled={matchState.isComplete}
            >
              ⏭ Skip to End of Set
            </GameButton>
            <GameButton
              variant="accent"
              onClick={handleSkipToEndOfMatch}
              size="md"
              disabled={matchState.isComplete}
            >
              ⏩⏩ Skip to End of Match
            </GameButton>
            <GameButton
              variant="success"
              onClick={handleRunExperiments}
              size="md"
              disabled={isRunningExperiments}
            >
              {isRunningExperiments
                ? '⏳ Running Experiments...'
                : '🔬 Run Stat Experiments'}
            </GameButton>
          </div>
        </div>

        {/* Player 2 Card */}
        <div style={{ flex: '0 0 300px' }}>
          <EditablePlayerCard
            player={player2}
            onPlayerChange={(updatedPlayer) => {
              if (matchPlayers) {
                setMatchPlayers([matchPlayers[0], updatedPlayer])
              }
            }}
          />
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
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: theme.spacing.md
          }}
        >
          <h3
            style={{
              fontFamily: theme.typography.fontFamily.heading,
              fontSize: theme.typography.fontSize.lg,
              fontWeight: theme.typography.fontWeight.bold,
              color: theme.colors.text.primary,
              margin: 0
            }}
          >
            Match Log
          </h3>
          <div
            style={{
              display: 'flex',
              gap: theme.spacing.md,
              alignItems: 'center'
            }}
          >
            {logEvents.length > 0 && (
              <span
                style={{
                  fontSize: theme.typography.fontSize.sm,
                  color: theme.colors.text.secondary
                }}
              >
                {logEvents.filter((e) => e.type === 'point').length} point
                {logEvents.filter((e) => e.type === 'point').length !== 1 ? 's' : ''}{' '}
                simulated
              </span>
            )}
            {logEvents.length > 0 && (
              <GameButton
                variant="secondary"
                size="sm"
                onClick={handleExportLog}
                type="button"
              >
                📥 Export Log
              </GameButton>
            )}
          </div>
        </div>
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
