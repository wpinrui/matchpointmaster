import { useCallback, useEffect, useRef, useState } from 'react'
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
    if (matchState) {
      return
    }

    if (!player1 || !player2) {
      return
    }

    // Initialize new match
    const initialState = initializeMatch(player1, player2)
    setMatchState(initialState)
    setLogEvents([])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [player1?.id, player2?.id])



  const resetMatch = useCallback(() => {
    if (!player1 || !player2) return
    const initialState = initializeMatch(player1, player2)
    setMatchState(initialState)
    setLogEvents([])
  }, [player1, player2])

  // Helper function to update match state after a rally
  const updateMatchStateAfterRally = useCallback(
    (
      currentState: MatchState,
      rally: { winner: number; events: RallyEvent[]; newPositions: [any, any] }
    ): MatchState => {
      const newSetScore = [...currentState.currentSetScore]
      const previousScore = [...newSetScore]
      newSetScore[rally.winner]++

      // Debug logging (only in development)
      if (import.meta.env.DEV) {
        console.log('Point scored (updateMatchStateAfterRally):', {
          winner: rally.winner,
          previousScore: `${previousScore[0]}-${previousScore[1]}`,
          newScore: `${newSetScore[0]}-${newSetScore[1]}`,
          rallyEvents: rally.events.filter(e => e.type === 'point').map(e => e.description)
        })
      }

      // Check if set is won
      let setWon = false
      let setWinner: number | null = null

      const player0Score = newSetScore[0]
      const player1Score = newSetScore[1]

      if (player0Score >= 11 || player1Score >= 11) {
        const scoreDiff = Math.abs(player0Score - player1Score)
        const maxScore = Math.max(player0Score, player1Score)
        const leadingPlayer = player0Score > player1Score ? 0 : 1

        if (maxScore >= 15 || (maxScore >= 11 && scoreDiff >= 2)) {
          setWon = true
          setWinner = leadingPlayer
        }
      }

      const newSetScores = [...currentState.setScores]
      const newSets = [...currentState.sets]
      let newCurrentSet = currentState.currentSet
      let newServingPlayer = currentState.servingPlayer
      let newIsComplete: boolean = currentState.isComplete
      let newWinner: number | null = currentState.winner

      if (setWon && setWinner !== null) {
        newSetScores.push([...newSetScore])
        newSets[setWinner]++

        if (newSets[setWinner] >= 3) {
          newIsComplete = true
          newWinner = setWinner
          if (onComplete) onComplete()
        } else {
          newCurrentSet++
        }

        newSetScore[0] = 0
        newSetScore[1] = 0
        newServingPlayer = 1 - newServingPlayer
      } else {
        const totalPoints = newSetScore[0] + newSetScore[1]
        if (totalPoints > 0 && totalPoints % 2 === 0) {
          newServingPlayer = 1 - newServingPlayer
        }
      }

      return {
        ...currentState,
        sets: newSets,
        currentSet: newCurrentSet,
        setScores: newSetScores,
        currentSetScore: newSetScore,
        servingPlayer: newServingPlayer,
        playerPositions: rally.newPositions,
        rallyEvents: [...currentState.rallyEvents, ...rally.events],
        isComplete: newIsComplete,
        winner: newWinner
      }
    },
    [onComplete]
  )

  const skipToNextPoint = useCallback(() => {
    if (!matchState || matchState.isComplete || !player1 || !player2) return

    setMatchState((prevState) => {
      if (!prevState || prevState.isComplete || !player1 || !player2) {
        return prevState
      }

      const totalPoints = prevState.currentSetScore[0] + prevState.currentSetScore[1]
      const isServe = totalPoints % 2 === 0

      const rally = simulateRally(
        player1,
        player2,
        prevState.servingPlayer,
        prevState.playerPositions,
        isServe
      )

      setLogEvents((prev) => [...prev, ...rally.events])

      return updateMatchStateAfterRally(prevState, rally)
    })
  }, [matchState, player1, player2, updateMatchStateAfterRally])

  // Auto-play functionality - just call skipToNextPoint on an interval
  useEffect(() => {
    if (isPlaying && matchState && !matchState.isComplete) {
      const baseInterval = 1000 // 1 second base
      const interval = baseInterval / speed

      simulationIntervalRef.current = setInterval(() => {
        skipToNextPoint()
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
  }, [isPlaying, speed, matchState, skipToNextPoint])

  const skipToNextService = useCallback(() => {
    if (!matchState || matchState.isComplete || !player1 || !player2) return

    setMatchState((prevState) => {
      if (!prevState || prevState.isComplete || !player1 || !player2) {
        return prevState
      }

      let state = { ...prevState }
      const initialServingPlayer = state.servingPlayer
      const initialTotalPoints = state.currentSetScore[0] + state.currentSetScore[1]

      // Simulate rallies until service changes (every 2 points) or set ends
      while (!state.isComplete && state.servingPlayer === initialServingPlayer) {
        const totalPoints = state.currentSetScore[0] + state.currentSetScore[1]
        const isServe = totalPoints % 2 === 0
        const rally = simulateRally(
          player1,
          player2,
          state.servingPlayer,
          state.playerPositions,
          isServe
        )

        setLogEvents((prev) => [...prev, ...rally.events])
        state = updateMatchStateAfterRally(state, rally)

        // Check if service changed (every 2 points) or if we're in a new set
        const newTotalPoints = state.currentSetScore[0] + state.currentSetScore[1]
        if (
          newTotalPoints === 0 ||
          (newTotalPoints > initialTotalPoints &&
            (newTotalPoints - initialTotalPoints) % 2 === 0 &&
            newTotalPoints > 0)
        ) {
          break
        }
      }

      return state
    })
  }, [matchState, player1, player2, updateMatchStateAfterRally])

  const skipToEndOfSet = useCallback(() => {
    if (!matchState || matchState.isComplete || !player1 || !player2) return

    setMatchState((prevState) => {
      if (!prevState || prevState.isComplete || !player1 || !player2) {
        return prevState
      }

      let state = { ...prevState }
      const initialSet = state.currentSet

      // Simulate rallies until set ends
      while (!state.isComplete && state.currentSet === initialSet) {
        const totalPoints = state.currentSetScore[0] + state.currentSetScore[1]
        const isServe = totalPoints % 2 === 0
        const rally = simulateRally(
          player1,
          player2,
          state.servingPlayer,
          state.playerPositions,
          isServe
        )

        setLogEvents((prev) => [...prev, ...rally.events])
        state = updateMatchStateAfterRally(state, rally)
      }

      return state
    })
  }, [matchState, player1, player2, updateMatchStateAfterRally])

  return {
    matchState,
    logEvents,
    resetMatch,
    skipToNextPoint,
    skipToNextService,
    skipToEndOfSet
  }
}
