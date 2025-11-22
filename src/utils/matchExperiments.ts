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
 * Run experiments to test the effect of +50 advantage in each stat
 */
export function runStatAdvantageExperiments(numPoints: number = 5000): {
  experiments: Array<{
    stat: string
    player1Points: number
    player2Points: number
    pointMargin: number
    winRate: number
  }>
  summary: {
    totalPoints: number
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

  const player2 = createTestPlayer('Player 2', 'player-2', {})

  const experiments = stats.map((stat) => {
    // Create Player 1 with +50 in this stat
    const player1Stats: Record<string, number> = {}
    player1Stats[stat] = 100 // +50 advantage

    const player1 = createTestPlayer('Player 1', 'player-1', player1Stats)

    // Run simulation
    const result = runMatchSimulation(player1, player2, numPoints)

    const winRate = (result.player1Points / numPoints) * 100

    return {
      stat,
      player1Points: result.player1Points,
      player2Points: result.player2Points,
      pointMargin: result.pointMargin,
      winRate: Math.round(winRate * 100) / 100 // Round to 2 decimal places
    }
  })

  return {
    experiments,
    summary: {
      totalPoints: numPoints,
      timestamp: new Date().toISOString()
    }
  }
}
