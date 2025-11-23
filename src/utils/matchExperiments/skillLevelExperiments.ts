import { createTestPlayer } from './testPlayerUtils'
import { runMultipleSimulations } from './simulationUtils'

/**
 * Test stat effectiveness at different skill levels
 */
export function runSkillLevelExperiments(
  numPoints: number = 1500,
  numRuns: number = 2
): {
  experiments: Array<{
    baselineLevel: number
    stat: string
    advantage: number
    meanWinRate: number
    stdDev: number
  }>
  summary: {
    totalPoints: number
    numRuns: number
    timestamp: string
  }
} {
  const baselineLevels = [50, 70] // Medium and high skill (removed low to reduce points)
  const stats = ['forehand', 'serve'] as const // Removed consistency to reduce points
  const advantage = 20

  const experiments: Array<{
    baselineLevel: number
    stat: string
    advantage: number
    meanWinRate: number
    stdDev: number
  }> = []

  baselineLevels.forEach((baseline) => {
    stats.forEach((stat) => {
      const player1Stats: Record<string, number> = {}
      player1Stats[stat] = baseline + advantage

      // Player 2 has baseline in all stats (default is 50, so we need to set all)
      const player2Stats: Record<string, number> = {
        forehand: baseline,
        backhand: baseline,
        footwork: baseline,
        serve: baseline,
        receive: baseline,
        spin: baseline,
        placement: baseline,
        consistency: baseline
      }

      const player1 = createTestPlayer('Player 1', 'player-1', player1Stats)
      const player2 = createTestPlayer('Player 2', 'player-2', player2Stats)

      const statsResult = runMultipleSimulations(player1, player2, numPoints, numRuns)

      experiments.push({
        baselineLevel: baseline,
        stat,
        advantage,
        meanWinRate: statsResult.meanWinRate,
        stdDev: statsResult.stdDev
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

