import { Player } from '../../services/savegame/types'
import { createTestPlayer } from './testPlayerUtils'
import { runMatchSimulation, runMultipleSimulations } from './simulationUtils'

/**
 * Run experiments to test the effect of different stat advantages
 */
export function runStatAdvantageExperiments(
  numPoints: number = 1500,
  numRuns: number = 2
): {
  experiments: Array<{
    stat: string
    advantage: number
    meanWinRate: number
    stdDev: number
    minWinRate: number
    maxWinRate: number
    pointMargin: number
  }>
  summary: {
    totalPoints: number
    numRuns: number
    timestamp: string
  }
} {
  const stats = [
    'forehand',
    'backhand',
    'footwork',
    'serve',
    'receive',
    'spin',
    'placement',
    'consistency'
  ] as const

  const advantages = [5, 10, 15, 20, 25, 30, 40, 50] // Test small to large advantages

  const player2 = createTestPlayer('Player 2', 'player-2', {})

  const experiments: Array<{
    stat: string
    advantage: number
    meanWinRate: number
    stdDev: number
    minWinRate: number
    maxWinRate: number
    pointMargin: number
  }> = []

  stats.forEach((stat) => {
    advantages.forEach((advantage) => {
      const player1Stats: Record<string, number> = {}
      player1Stats[stat] = 50 + advantage

      const player1 = createTestPlayer('Player 1', 'player-1', player1Stats)

      // Run multiple simulations for statistical significance
      const stats = runMultipleSimulations(player1, player2, numPoints, numRuns)

      // Calculate average point margin
      const avgResult = runMatchSimulation(player1, player2, numPoints)
      const pointMargin = avgResult.pointMargin

      experiments.push({
        stat,
        advantage,
        meanWinRate: stats.meanWinRate,
        stdDev: stats.stdDev,
        minWinRate: stats.minWinRate,
        maxWinRate: stats.maxWinRate,
        pointMargin
      })
    })
  })

  return {
    experiments,
    summary: {
      totalPoints: numPoints,
      numRuns,
      timestamp: new Date().toISOString()
    }
  }
}

