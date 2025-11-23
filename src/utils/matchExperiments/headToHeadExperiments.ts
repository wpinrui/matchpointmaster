import { createTestPlayer } from './testPlayerUtils'
import { runMultipleSimulations } from './simulationUtils'

/**
 * Test head-to-head stat comparisons (e.g., 70 forehand vs 70 backhand)
 */
export function runHeadToHeadStatExperiments(
  numPoints: number = 1500,
  numRuns: number = 2
): {
  experiments: Array<{
    stat1: string
    stat1Value: number
    stat2: string
    stat2Value: number
    meanWinRate: number
    stdDev: number
    winner: string
  }>
  summary: {
    totalPoints: number
    numRuns: number
    timestamp: string
  }
} {
  const comparisons = [
    { stat1: 'forehand', stat1Value: 70, stat2: 'backhand', stat2Value: 70 },
    { stat1: 'serve', stat1Value: 70, stat2: 'receive', stat2Value: 70 },
    { stat1: 'spin', stat1Value: 70, stat2: 'placement', stat2Value: 70 },
    { stat1: 'footwork', stat1Value: 70, stat2: 'consistency', stat2Value: 70 },
    { stat1: 'forehand', stat1Value: 80, stat2: 'backhand', stat2Value: 60 },
    { stat1: 'serve', stat1Value: 80, stat2: 'receive', stat2Value: 60 }
  ]

  const experiments: Array<{
    stat1: string
    stat1Value: number
    stat2: string
    stat2Value: number
    meanWinRate: number
    stdDev: number
    winner: string
  }> = []

  comparisons.forEach((comp) => {
    const player1Stats: Record<string, number> = {}
    player1Stats[comp.stat1] = comp.stat1Value

    const player2Stats: Record<string, number> = {}
    player2Stats[comp.stat2] = comp.stat2Value

    const player1 = createTestPlayer('Player 1', 'player-1', player1Stats)
    const player2 = createTestPlayer('Player 2', 'player-2', player2Stats)

    const stats = runMultipleSimulations(player1, player2, numPoints, numRuns)
    const winner = stats.meanWinRate > 50 ? comp.stat1 : comp.stat2

    experiments.push({
      stat1: comp.stat1,
      stat1Value: comp.stat1Value,
      stat2: comp.stat2,
      stat2Value: comp.stat2Value,
      meanWinRate: stats.meanWinRate,
      stdDev: stats.stdDev,
      winner
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

