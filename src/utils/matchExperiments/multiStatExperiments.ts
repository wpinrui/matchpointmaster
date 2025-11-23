import { createTestPlayer } from './testPlayerUtils'
import { runMultipleSimulations } from './simulationUtils'

/**
 * Test multiple stat combinations
 */
export function runMultiStatExperiments(
  numPoints: number = 1500,
  numRuns: number = 2
): {
  experiments: Array<{
    player1Stats: Record<string, number>
    player2Stats: Record<string, number>
    meanWinRate: number
    stdDev: number
    description: string
  }>
  summary: {
    totalPoints: number
    numRuns: number
    timestamp: string
  }
} {
  const scenarios = [
    {
      description: 'All-rounder (all 60) vs Specialist (one 80, rest 50)',
      player1Stats: {
        forehand: 60,
        backhand: 60,
        footwork: 60,
        serve: 60,
        receive: 60,
        spin: 60,
        placement: 60,
        consistency: 60
      },
      player2Stats: {
        forehand: 80,
        backhand: 50,
        footwork: 50,
        serve: 50,
        receive: 50,
        spin: 50,
        placement: 50,
        consistency: 50
      }
    },
    {
      description: 'Attacker (high forehand/spin) vs Defender (high receive/consistency)',
      player1Stats: {
        forehand: 80,
        backhand: 50,
        footwork: 60,
        serve: 60,
        receive: 50,
        spin: 80,
        placement: 60,
        consistency: 50
      },
      player2Stats: {
        forehand: 50,
        backhand: 50,
        footwork: 60,
        serve: 50,
        receive: 80,
        spin: 50,
        placement: 60,
        consistency: 80
      }
    },
    {
      description: 'Serve specialist vs Return specialist',
      player1Stats: {
        forehand: 50,
        backhand: 50,
        footwork: 50,
        serve: 80,
        receive: 50,
        spin: 50,
        placement: 50,
        consistency: 50
      },
      player2Stats: {
        forehand: 50,
        backhand: 50,
        footwork: 50,
        serve: 50,
        receive: 80,
        spin: 50,
        placement: 50,
        consistency: 50
      }
    },
    {
      description: 'High consistency (80) vs High power (80 forehand/spin)',
      player1Stats: {
        forehand: 50,
        backhand: 50,
        footwork: 50,
        serve: 50,
        receive: 50,
        spin: 50,
        placement: 50,
        consistency: 80
      },
      player2Stats: {
        forehand: 80,
        backhand: 50,
        footwork: 50,
        serve: 50,
        receive: 50,
        spin: 80,
        placement: 50,
        consistency: 50
      }
    }
  ]

  const experiments: Array<{
    player1Stats: Record<string, number>
    player2Stats: Record<string, number>
    meanWinRate: number
    stdDev: number
    description: string
  }> = []

  scenarios.forEach((scenario) => {
    const player1 = createTestPlayer('Player 1', 'player-1', scenario.player1Stats)
    const player2 = createTestPlayer('Player 2', 'player-2', scenario.player2Stats)

    const stats = runMultipleSimulations(player1, player2, numPoints, numRuns)

    experiments.push({
      player1Stats: scenario.player1Stats,
      player2Stats: scenario.player2Stats,
      meanWinRate: stats.meanWinRate,
      stdDev: stats.stdDev,
      description: scenario.description
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

