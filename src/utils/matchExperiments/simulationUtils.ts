import { Player } from '../../services/savegame/types'
import { initializeMatch, simulateRally } from '../matchEngine'

/**
 * Run a match simulation for a specified number of points
 */
export function runMatchSimulation(
  player1: Player,
  player2: Player,
  numPoints: number
): { player1Points: number; player2Points: number; pointMargin: number } {
  let state = initializeMatch(player1, player2)
  let player1Points = 0
  let player2Points = 0
  let pointsSimulated = 0

  while (pointsSimulated < numPoints) {
    const isServe = state.currentGameScore[0] + state.currentGameScore[1] === 0
    const rally = simulateRally(
      player1,
      player2,
      state.servingPlayer,
      state.playerPositions,
      isServe
    )

    // Track point winner
    if (rally.winner === 0) {
      player1Points++
    } else {
      player2Points++
    }

    // Update game score
    const newGameScore = [...state.currentGameScore]
    newGameScore[rally.winner]++

    // Check if game is won
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

    // Update state
    let newSetScores = [...state.setScores]
    let newSets = [...state.sets]
    let newCurrentSet = state.currentSet
    let newServingPlayer = state.servingPlayer

    if (gameWon && gameWinner !== null) {
      const currentSetScore = [...newSetScores[newCurrentSet]]
      currentSetScore[gameWinner]++
      newSetScores[newCurrentSet] = currentSetScore

      if (currentSetScore[gameWinner] >= 3) {
        newSets[gameWinner]++
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
      isComplete: false,
      winner: null
    }

    pointsSimulated++
  }

  return {
    player1Points,
    player2Points,
    pointMargin: player1Points - player2Points
  }
}

/**
 * Run multiple simulations and calculate statistics
 */
export function runMultipleSimulations(
  player1: Player,
  player2: Player,
  numPoints: number,
  numRuns: number = 5
): {
  meanWinRate: number
  stdDev: number
  minWinRate: number
  maxWinRate: number
  results: number[]
} {
  const results: number[] = []

  for (let i = 0; i < numRuns; i++) {
    const result = runMatchSimulation(player1, player2, numPoints)
    const winRate = (result.player1Points / numPoints) * 100
    results.push(winRate)
  }

  const mean = results.reduce((a, b) => a + b, 0) / results.length
  const variance =
    results.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / results.length
  const stdDev = Math.sqrt(variance)
  const minWinRate = Math.min(...results)
  const maxWinRate = Math.max(...results)

  return {
    meanWinRate: Math.round(mean * 100) / 100,
    stdDev: Math.round(stdDev * 100) / 100,
    minWinRate: Math.round(minWinRate * 100) / 100,
    maxWinRate: Math.round(maxWinRate * 100) / 100,
    results
  }
}
