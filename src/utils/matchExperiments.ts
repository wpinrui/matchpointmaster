import {
  FavourStyle,
  Gender,
  GripStyle,
  Handedness,
  Player,
  PlayStyle,
  RubberType
} from '../services/savegame/types'
import { initializeMatch, simulateRally } from './matchEngine'

/**
 * Create a test player with specified stats
 */
function createTestPlayer(
  name: string,
  id: string,
  stats: {
    forehand?: number
    backhand?: number
    footwork?: number
    serve?: number
    receive?: number
    spin?: number
    placement?: number
    consistency?: number
  }
): Player {
  const defaultStat = 50
  return {
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
      forehand: stats.forehand ?? defaultStat,
      backhand: stats.backhand ?? defaultStat,
      footwork: stats.footwork ?? defaultStat,
      serve: stats.serve ?? defaultStat,
      receive: stats.receive ?? defaultStat,
      spin: stats.spin ?? defaultStat,
      placement: stats.placement ?? defaultStat,
      consistency: stats.consistency ?? defaultStat
    },
    handedness: Handedness.RIGHT,
    gripStyle: GripStyle.SHAKE_HAND,
    forehandRubber: RubberType.SPIN_RUBBER,
    backhandRubber: RubberType.SPIN_RUBBER,
    forehandBackhandTendency: FavourStyle.BALANCED,
    playStyle: PlayStyle.ALL_ROUNDER,
    imagePath: '',
    traits: []
  }
}

/**
 * Run a match simulation for a specified number of points
 */
function runMatchSimulation(
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
function runMultipleSimulations(
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

/**
 * Run all comprehensive experiments
 */
export function runComprehensiveBalanceTests(
  numPoints: number = 1500,
  numRuns: number = 2
): {
  statAdvantage: ReturnType<typeof runStatAdvantageExperiments>
  headToHead: ReturnType<typeof runHeadToHeadStatExperiments>
  multiStat: ReturnType<typeof runMultiStatExperiments>
  skillLevel: ReturnType<typeof runSkillLevelExperiments>
  summary: {
    totalPoints: number
    numRuns: number
    timestamp: string
  }
} {
  return {
    statAdvantage: runStatAdvantageExperiments(numPoints, numRuns),
    headToHead: runHeadToHeadStatExperiments(numPoints, numRuns),
    multiStat: runMultiStatExperiments(numPoints, numRuns),
    skillLevel: runSkillLevelExperiments(numPoints, numRuns),
    summary: {
      totalPoints: numPoints,
      numRuns,
      timestamp: new Date().toISOString()
    }
  }
}
