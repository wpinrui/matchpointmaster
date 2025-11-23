import { useState, useEffect, useRef, useCallback } from 'react'
import { Player } from '../services/savegame/types'
import {
  initializeMatch,
  simulateRally,
  type MatchState,
  type RallyEvent
} from '../utils/matchEngine'

interface UseMatchSimulationOptions {
  player1: Player | undefined
  player2: Player | undefined
  isPlaying: boolean
  speed: number
  onComplete?: () => void
}

export function useMatchSimulation({
  player1,
  player2,
  isPlaying,
  speed,
  onComplete
}: UseMatchSimulationOptions) {
  const [matchState, setMatchState] = useState<MatchState | null>(null)
  const [logEvents, setLogEvents] = useState<RallyEvent[]>([])
  const simulationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  // Initialize match when players are available
  useEffect(() => {
    if (!matchState && player1 && player2) {
      const initialState = initializeMatch(player1, player2)
      setMatchState(initialState)
      setLogEvents([])
    }
  }, [player1, player2, matchState])

  // Auto-play functionality
  useEffect(() => {
    if (isPlaying && matchState && !matchState.isComplete && player1 && player2) {
      const baseInterval = 1000 // 1 second base
      const interval = baseInterval / speed

      simulationIntervalRef.current = setInterval(() => {
        setMatchState((currentState) => {
          if (!currentState || currentState.isComplete || !player1 || !player2) {
            if (onComplete) onComplete()
            return currentState
          }

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

          // Check both players' scores to determine if game is won
          const player0Score = newGameScore[0]
          const player1Score = newGameScore[1]

          // Game is won if:
          // 1. A player reaches 11 points with at least 2-point lead, OR
          // 2. A player reaches 15 points (regardless of lead)
          // Must check both players since either could be the winner
          if (player0Score >= 11 || player1Score >= 11) {
            const scoreDiff = Math.abs(player0Score - player1Score)
            const maxScore = Math.max(player0Score, player1Score)
            const leadingPlayer = player0Score > player1Score ? 0 : 1

            // Game is won if someone has 15+ OR if someone has 11+ with 2+ point lead
            if (maxScore >= 15 || (maxScore >= 11 && scoreDiff >= 2)) {
              gameWon = true
              // Winner is the player with the higher score
              gameWinner = leadingPlayer
            }
          }

          // If game is won, update set score
          let newSetScores = [...currentState.setScores]
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
            newSetScores = [
              ...newSetScores.slice(0, newCurrentSet),
              [...currentSetScore],
              ...newSetScores.slice(newCurrentSet + 1)
            ]

            // Check if set is won (first to 3 games wins the set)
            if (currentSetScore[gameWinner] >= 3) {
              newSets[gameWinner]++
              // Check if match is won (first to 3 sets wins the match in best of 5)
              if (newSets[gameWinner] >= 3) {
                newIsComplete = true
                newWinner = gameWinner
                if (onComplete) onComplete()
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
  }, [isPlaying, speed, player1, player2, matchState, onComplete])

  const resetMatch = useCallback(() => {
    if (!player1 || !player2) return
    const initialState = initializeMatch(player1, player2)
    setMatchState(initialState)
    setLogEvents([])
  }, [player1, player2])

  return {
    matchState,
    logEvents,
    resetMatch
  }
}
