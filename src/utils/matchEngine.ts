import { FavourStyle, Player, PlayStyle, RubberType } from '../services/savegame/types'

/**
 * Ball position types
 */
export enum BallPosition {
  FOREHAND = 'forehand',
  BACKHAND = 'backhand',
  MIDDLE = 'middle'
}

/**
 * Ball depth types
 */
export enum BallDepth {
  LONG = 'long',
  MID = 'mid',
  SHORT = 'short'
}

/**
 * Ball spin types
 */
export enum BallSpin {
  TOPSPIN = 'topspin',
  BACKSPIN = 'backspin',
  NO_SPIN = 'no_spin'
}

/**
 * Player horizontal positioning
 */
export enum HorizontalPosition {
  NEUTRAL = 'neutral',
  FOREHAND_BIAS = 'forehand_bias',
  BACKHAND_BIAS = 'backhand_bias'
}

/**
 * Player vertical positioning
 */
export enum VerticalPosition {
  FORWARD = 'forward',
  NEUTRAL = 'neutral',
  BACKWARDS = 'backwards'
}

/**
 * Player positioning state
 */
export type PlayerPosition = {
  horizontal: HorizontalPosition
  vertical: VerticalPosition
}

/**
 * Rally event for logging
 */
export type RallyEvent = {
  type: 'serve' | 'return' | 'point' | 'error' | 'lucky_bounce' | 'ball'
  player: number // 0 or 1
  description: string
  timestamp: number
  ballDetails?: {
    position: BallPosition
    depth: BallDepth
    spin: BallSpin
    speed: number
    playerPosition: PlayerPosition
    difficulty: 'easy' | 'medium' | 'hard'
  }
}

/**
 * Match state
 */
export type MatchState = {
  sets: number[] // [player1Sets, player2Sets]
  currentSet: number // 0-4
  setScores: number[][] // [[p1, p2], ...] for each set
  currentGameScore: number[] // [p1, p2] for current game
  servingPlayer: number // 0 or 1
  playerPositions: [PlayerPosition, PlayerPosition]
  rallyEvents: RallyEvent[]
  isComplete: boolean
  winner: number | null // 0 or 1, or null if not finished
}

/**
 * Shot types
 */
enum ShotType {
  AGGRESSIVE_ATTACK = 'aggressive_attack',
  COUNTER_ATTACK = 'counter_attack',
  DEFENSIVE_PUSH = 'defensive_push',
  PLACEMENT_SHOT = 'placement_shot',
  SPIN_VARIATION = 'spin_variation'
}

/**
 * Shot type weights (weights sum to 1.0)
 */
type ShotWeights = {
  forehand?: number
  backhand?: number
  footwork?: number
  serve?: number
  receive?: number
  spin?: number
  placement?: number
  consistency?: number
}

const SHOT_TYPE_WEIGHTS: Record<ShotType, ShotWeights> = {
  [ShotType.AGGRESSIVE_ATTACK]: {
    forehand: 0.35, // Reduced from 0.4 - was too strong
    backhand: 0.35, // Reduced from 0.4
    spin: 0.2,
    placement: 0.15,
    consistency: 0.3 // Increased to compensate
  },
  [ShotType.COUNTER_ATTACK]: {
    forehand: 0.25, // Will use forehand OR backhand based on side
    backhand: 0.25, // Same weight as forehand
    receive: 0.4,
    footwork: 0.3, // Increased from 0.25 - buff footwork more
    consistency: 0.05 // Reduced to sum to 1.0
  },
  [ShotType.DEFENSIVE_PUSH]: {
    receive: 0.4,
    consistency: 0.3,
    footwork: 0.25, // Increased from 0.2 - buff footwork
    spin: 0.05 // Reduced to sum to 1.0
  },
  [ShotType.PLACEMENT_SHOT]: {
    placement: 0.55, // Increased from 0.5 - buff placement
    forehand: 0.2, // Will use forehand OR backhand based on side
    backhand: 0.2,
    consistency: 0.25
  },
  [ShotType.SPIN_VARIATION]: {
    spin: 0.4, // Further reduced from 0.45 - nerf spin
    forehand: 0.25, // Will use forehand OR backhand based on side
    backhand: 0.25,
    consistency: 0.35 // Increased to compensate
  }
}

/**
 * Serve weights (serve + forehand + spin)
 */
const SERVE_WEIGHTS: ShotWeights = {
  serve: 0.35, // Reduced from 0.4 - was too strong at 73%
  forehand: 0.3, // Reduced from 0.35 - forehand too strong at 75%
  spin: 0.35 // Increased to compensate
}

/**
 * Get equipment modifiers for stats
 */
function getEquipmentModifiers(rubber: RubberType): {
  spinMultiplier: number
  receiveMultiplier: number
  consistencyMultiplier: number
} {
  switch (rubber) {
    case RubberType.SPIN_RUBBER:
      return { spinMultiplier: 1.0, receiveMultiplier: 1.0, consistencyMultiplier: 1.0 }
    case RubberType.SHORT_PIMPLE:
      return { spinMultiplier: 0.85, receiveMultiplier: 1.1, consistencyMultiplier: 0.9 }
    case RubberType.MEDIUM_PIMPLE:
      return { spinMultiplier: 0.7, receiveMultiplier: 1.2, consistencyMultiplier: 0.7 }
    case RubberType.LONG_PIMPLE:
      return { spinMultiplier: 0.3, receiveMultiplier: 1.5, consistencyMultiplier: 0.2 }
    case RubberType.ANTISPIN_RUBBER:
      return { spinMultiplier: 0.3, receiveMultiplier: 1.5, consistencyMultiplier: 0.2 }
    case RubberType.WOOD:
      return { spinMultiplier: 0.1, receiveMultiplier: 1.8, consistencyMultiplier: 0.1 }
  }
}

/**
 * Calculate positioning bias based on player tendency
 */
function getPositioningBias(
  tendency: FavourStyle,
  playStyle: PlayStyle
): { horizontal: HorizontalPosition; vertical: VerticalPosition } {
  let horizontal: HorizontalPosition = HorizontalPosition.NEUTRAL
  if (
    tendency === FavourStyle.HEAVILY_FOREHAND ||
    tendency === FavourStyle.SLIGHTLY_FOREHAND
  ) {
    horizontal = HorizontalPosition.FOREHAND_BIAS
  } else if (
    tendency === FavourStyle.HEAVILY_BACKHAND ||
    tendency === FavourStyle.SLIGHTLY_BACKHAND
  ) {
    horizontal = HorizontalPosition.BACKHAND_BIAS
  }

  let vertical: VerticalPosition = VerticalPosition.NEUTRAL
  if (playStyle === PlayStyle.NET_PLAYER) {
    vertical = VerticalPosition.FORWARD
  } else if (playStyle === PlayStyle.CHOPPER || playStyle === PlayStyle.LOBBER) {
    vertical = VerticalPosition.BACKWARDS
  }

  return { horizontal, vertical }
}

/**
 * Determine shot type based on player tendencies and variance
 */
function determineShotType(player: Player, variance: number): ShotType {
  const playStyle = player.playStyle
  const rand = Math.random()

  // Low variance = player's preferred style, high variance = more variety
  if (variance < 0.3) {
    // Strong tendency toward preferred style
    switch (playStyle) {
      case PlayStyle.FOREHAND_ATTACKER:
      case PlayStyle.BACKHAND_SMASHER:
      case PlayStyle.AGGRESSIVE_PUSHER:
        return ShotType.AGGRESSIVE_ATTACK
      case PlayStyle.CHOPPER:
      case PlayStyle.DEFENSIVE_SPECIALIST:
      case PlayStyle.LOBBER:
        return ShotType.DEFENSIVE_PUSH
      case PlayStyle.PLACEMENT_STRATEGIST:
        return ShotType.PLACEMENT_SHOT
      case PlayStyle.SPIN_MANIPULATOR:
        return ShotType.SPIN_VARIATION
      case PlayStyle.COUNTER_DRIVER:
        return ShotType.COUNTER_ATTACK
      default:
        // ALL_ROUNDER, VARIED_PLAYER - use random
        break
    }
  }

  // Higher variance or no strong preference - weighted random
  const availableTypes = [
    ShotType.AGGRESSIVE_ATTACK,
    ShotType.COUNTER_ATTACK,
    ShotType.DEFENSIVE_PUSH,
    ShotType.PLACEMENT_SHOT,
    ShotType.SPIN_VARIATION
  ]

  // Weight based on play style
  const weights = [0.2, 0.2, 0.2, 0.2, 0.2] // Default equal weights
  if (
    playStyle === PlayStyle.FOREHAND_ATTACKER ||
    playStyle === PlayStyle.BACKHAND_SMASHER
  ) {
    weights[0] = 0.5 // Aggressive attack
  } else if (
    playStyle === PlayStyle.CHOPPER ||
    playStyle === PlayStyle.DEFENSIVE_SPECIALIST
  ) {
    weights[2] = 0.5 // Defensive push
  } else if (playStyle === PlayStyle.PLACEMENT_STRATEGIST) {
    weights[3] = 0.5 // Placement shot
  } else if (playStyle === PlayStyle.SPIN_MANIPULATOR) {
    weights[4] = 0.5 // Spin variation
  } else if (playStyle === PlayStyle.COUNTER_DRIVER) {
    weights[1] = 0.5 // Counter attack
  }

  // Select based on weights
  let cumulative = 0
  const roll = Math.random()
  for (let i = 0; i < availableTypes.length; i++) {
    cumulative += weights[i]
    if (roll < cumulative) {
      return availableTypes[i]
    }
  }

  return ShotType.COUNTER_ATTACK // Fallback
}

/**
 * Calculate shot quality (0-100) using weighted stats
 */
function calculateShotQuality(
  player: Player,
  shotType: ShotType,
  isForehand: boolean,
  equipmentModifiers: {
    spinMultiplier: number
    receiveMultiplier: number
    consistencyMultiplier: number
  }
): number {
  const weights = SHOT_TYPE_WEIGHTS[shotType]
  const skills = player.skills

  let quality = 0

  // Apply weights to relevant stats
  // For shot types with both forehand and backhand weights, use the appropriate one
  if (weights.forehand && weights.backhand) {
    // Both weights exist - use the appropriate side
    if (isForehand) {
      quality += skills.forehand * weights.forehand
    } else {
      quality += skills.backhand * weights.backhand
    }
  } else {
    // Only one weight exists, or neither
    if (weights.forehand && isForehand) {
      quality += skills.forehand * weights.forehand
    }
    if (weights.backhand && !isForehand) {
      quality += skills.backhand * weights.backhand
    }
  }
  if (weights.footwork) {
    quality += skills.footwork * weights.footwork
  }
  if (weights.serve) {
    quality += skills.serve * weights.serve
  }
  if (weights.receive) {
    quality += skills.receive * weights.receive * equipmentModifiers.receiveMultiplier
  }
  if (weights.spin) {
    quality += skills.spin * weights.spin * equipmentModifiers.spinMultiplier
  }
  if (weights.placement) {
    quality += skills.placement * weights.placement
  }
  if (weights.consistency) {
    quality +=
      skills.consistency * weights.consistency * equipmentModifiers.consistencyMultiplier
  }

  // Clamp to 0-100
  return Math.max(0, Math.min(100, quality))
}

/**
 * Calculate serve quality (0-100)
 */
function calculateServeQuality(
  player: Player,
  equipmentModifiers: {
    spinMultiplier: number
    receiveMultiplier: number
    consistencyMultiplier: number
  }
): number {
  const skills = player.skills
  let quality = 0

  quality += skills.serve * SERVE_WEIGHTS.serve!
  quality += skills.forehand * SERVE_WEIGHTS.forehand!
  quality += skills.spin * SERVE_WEIGHTS.spin! * equipmentModifiers.spinMultiplier

  return Math.max(0, Math.min(100, quality))
}

/**
 * Calculate incoming ball difficulty (0-1) from shot quality
 */
function calculateDifficulty(incomingQuality: number): number {
  // Higher quality = higher difficulty
  return incomingQuality / 100
}

/**
 * Apply difficulty penalty to return quality
 */
function applyDifficultyPenalty(
  baseQuality: number,
  difficulty: number,
  footwork: number
): number {
  // Footwork reduces difficulty penalty - increased impact
  const footworkReduction = (footwork / 100) * 0.5 // Up to 50% reduction (increased from 30%)
  const adjustedDifficulty = difficulty * (1 - footworkReduction)

  // Apply penalty: harder balls reduce return quality more
  const penalty = adjustedDifficulty * 0.4 // Max 40% penalty
  return baseQuality * (1 - penalty)
}

/**
 * Calculate momentum multiplier based on recent shot qualities
 */
function calculateMomentum(recentQualities: number[]): number {
  if (recentQualities.length === 0) return 1.0

  // Average of last 3 shots (or all if less than 3)
  const recent = recentQualities.slice(-3)
  const avg = recent.reduce((a, b) => a + b, 0) / recent.length

  // Momentum: if recent shots are good, get a boost
  // Momentum multiplier: 0.9 to 1.1 (10% boost or penalty)
  const momentum = 0.9 + (avg / 100) * 0.2
  return Math.max(0.9, Math.min(1.1, momentum))
}

/**
 * Check for lucky bounce
 */
function checkLuckyBounce(shotQuality: number): {
  occurred: boolean
  type: 'net' | 'edge' | null
  boost: number
} {
  // Better shots have slightly higher chance of lucky bounce
  const baseChance = 0.05 + (shotQuality / 100) * 0.05 // 5-10% chance
  const roll = Math.random()

  if (roll < baseChance) {
    // 70% net, 30% edge
    if (Math.random() < 0.7) {
      return { occurred: true, type: 'net', boost: 10 }
    } else {
      return { occurred: true, type: 'edge', boost: 30 }
    }
  }

  return { occurred: false, type: null, boost: 0 }
}

/**
 * Check win conditions
 */
function checkWinCondition(
  returnQuality: number,
  incomingQuality: number,
  rallyLength: number
): { won: boolean; winner: 'returner' | 'hitter' | null } {
  const qualityDiff = returnQuality - incomingQuality

  // Immediate win conditions
  if (qualityDiff > 20) {
    return { won: true, winner: 'returner' }
  }
  if (qualityDiff < -25) {
    return { won: true, winner: 'hitter' }
  }

  // Probability-based win (quality difference affects win chance)
  const winChance = 0.3 + (qualityDiff / 100) * 0.4 // 10-70% chance based on quality diff
  const rallyPenalty = Math.min(0.1, rallyLength * 0.01) // Slight penalty for long rallies
  const adjustedChance = winChance - rallyPenalty

  if (Math.random() < adjustedChance) {
    return { won: true, winner: 'returner' }
  }

  return { won: false, winner: null }
}

/**
 * Simulate a single rally
 */
export function simulateRally(
  player1: Player,
  player2: Player,
  servingPlayer: number,
  playerPositions: [PlayerPosition, PlayerPosition],
  isServe: boolean
): {
  winner: number
  events: RallyEvent[]
  newPositions: [PlayerPosition, PlayerPosition]
} {
  const events: RallyEvent[] = []
  const positions: [PlayerPosition, PlayerPosition] = [...playerPositions]
  let currentPlayer = servingPlayer
  let incomingQuality = 0
  let rallyLength = 0
  const recentQualities: number[] = [] // Track for momentum

  // Serve
  const server = currentPlayer === 0 ? player1 : player2
  const receiver = currentPlayer === 0 ? player2 : player1
  const serverModifiers = getEquipmentModifiers(server.forehandRubber)

  let serveQuality = calculateServeQuality(server, serverModifiers)

  // Check for serve error (consistency check)
  // Make serve errors rarer - serves are more controlled
  const serveConsistencyRatio = server.skills.consistency / 100
  const serveErrorChance = Math.pow(1 - serveConsistencyRatio, 2) * 0.1 // Max 10% error chance
  const serveQualityPenalty = (1 - serveQuality / 100) * 0.05 // Up to 5% additional
  const totalServeErrorChance = Math.min(0.15, serveErrorChance + serveQualityPenalty)

  if (Math.random() < totalServeErrorChance) {
    events.push({
      type: 'error',
      player: currentPlayer,
      description: `${server.shortName || server.firstName} serves out`,
      timestamp: Date.now()
    })
    events.push({
      type: 'point',
      player: 1 - currentPlayer,
      description: `${receiver.shortName || receiver.firstName} wins the point (serve error)`,
      timestamp: Date.now()
    })
    return {
      winner: 1 - currentPlayer,
      events,
      newPositions: positions
    }
  }

  // Check for lucky bounce on serve
  const serveLucky = checkLuckyBounce(serveQuality)
  if (serveLucky.occurred) {
    serveQuality += serveLucky.boost
    events.push({
      type: 'lucky_bounce',
      player: currentPlayer,
      description: `${server.shortName || server.firstName} gets a lucky ${serveLucky.type} bounce on serve!`,
      timestamp: Date.now()
    })
  }

  incomingQuality = serveQuality
  recentQualities.push(serveQuality)

  events.push({
    type: 'serve',
    player: currentPlayer,
    description: `${server.shortName || server.firstName} serves (quality: ${Math.round(serveQuality)})`,
    timestamp: Date.now()
  })

  currentPlayer = 1 - currentPlayer
  rallyLength++

  // Rally loop
  let pointWon = false
  while (!pointWon) {
    const hitter = currentPlayer === 0 ? player1 : player2
    const opponent = currentPlayer === 0 ? player2 : player1

    // Determine forehand/backhand based on tendency
    // Slightly favor backhand more to balance forehand dominance from serves
    let isForehand = true
    const tendency = hitter.forehandBackhandTendency
    const rand = Math.random()
    if (tendency === FavourStyle.HEAVILY_BACKHAND) {
      isForehand = rand < 0.15 // 15% forehand
    } else if (tendency === FavourStyle.SLIGHTLY_BACKHAND) {
      isForehand = rand < 0.35 // 35% forehand
    } else if (tendency === FavourStyle.BALANCED) {
      isForehand = rand < 0.5 // 50% forehand - truly balanced
    } else if (tendency === FavourStyle.SLIGHTLY_FOREHAND) {
      isForehand = rand < 0.6 // 60% forehand
    } else {
      // HEAVILY_FOREHAND
      isForehand = rand < 0.75 // 75% forehand (reduced from 80%)
    }

    const hitterModifiers = getEquipmentModifiers(
      isForehand ? hitter.forehandRubber : hitter.backhandRubber
    )

    // Determine shot type
    const variance = Math.random()
    const shotType = determineShotType(hitter, variance)

    // Calculate base return quality
    let returnQuality = calculateShotQuality(
      hitter,
      shotType,
      isForehand,
      hitterModifiers
    )

    // Apply difficulty penalty from incoming ball
    const difficulty = calculateDifficulty(incomingQuality)
    returnQuality = applyDifficultyPenalty(
      returnQuality,
      difficulty,
      hitter.skills.footwork
    )

    // Apply momentum
    const momentum = calculateMomentum(recentQualities)
    returnQuality *= momentum
    returnQuality = Math.max(0, Math.min(100, returnQuality))

    // Check for error (consistency check)
    // Make errors much rarer - only on very low consistency or very low quality shots
    // Base error chance scales with (1 - consistency/100)^2 to make it much rarer
    const consistencyRatio = hitter.skills.consistency / 100
    const baseErrorChance = Math.pow(1 - consistencyRatio, 2) * 0.15 // Max 15% error chance at 0 consistency
    // Lower quality shots have higher error chance
    const qualityPenalty = (1 - returnQuality / 100) * 0.1 // Up to 10% additional error chance
    const totalErrorChance = Math.min(0.25, baseErrorChance + qualityPenalty) // Cap at 25%

    if (Math.random() < totalErrorChance) {
      events.push({
        type: 'error',
        player: currentPlayer,
        description: `${hitter.shortName || hitter.firstName} hits the ball out`,
        timestamp: Date.now()
      })
      events.push({
        type: 'point',
        player: 1 - currentPlayer,
        description: `${opponent.shortName || opponent.firstName} wins the point (error)`,
        timestamp: Date.now()
      })
      pointWon = true
      return {
        winner: 1 - currentPlayer,
        events,
        newPositions: positions
      }
    }

    // Check for lucky bounce
    const lucky = checkLuckyBounce(returnQuality)
    if (lucky.occurred) {
      returnQuality += lucky.boost
      returnQuality = Math.max(0, Math.min(100, returnQuality))
      events.push({
        type: 'lucky_bounce',
        player: currentPlayer,
        description: `${hitter.shortName || hitter.firstName} gets a lucky ${lucky.type} bounce!`,
        timestamp: Date.now()
      })
    }

    recentQualities.push(returnQuality)

    events.push({
      type: 'return',
      player: currentPlayer,
      description: `${hitter.shortName || hitter.firstName} returns (quality: ${Math.round(returnQuality)})`,
      timestamp: Date.now()
    })

    // Check win condition
    const winCheck = checkWinCondition(returnQuality, incomingQuality, rallyLength)
    if (winCheck.won) {
      const winner = winCheck.winner === 'returner' ? currentPlayer : 1 - currentPlayer
      events.push({
        type: 'point',
        player: winner,
        description: `${winner === 0 ? player1.shortName || player1.firstName : player2.shortName || player2.firstName} wins the point`,
        timestamp: Date.now()
      })
      pointWon = true
      return {
        winner,
        events,
        newPositions: positions
      }
    }

    // Continue rally
    incomingQuality = returnQuality
    currentPlayer = 1 - currentPlayer
    rallyLength++
  }

  // Fallback (should never reach here, but TypeScript requires it)
  return {
    winner: 0,
    events,
    newPositions: positions
  }
}

/**
 * Initialize match state
 */
export function initializeMatch(player1: Player, player2: Player): MatchState {
  const position1 = getPositioningBias(
    player1.forehandBackhandTendency,
    player1.playStyle
  )
  const position2 = getPositioningBias(
    player2.forehandBackhandTendency,
    player2.playStyle
  )

  return {
    sets: [0, 0],
    currentSet: 0,
    setScores: [[0, 0]],
    currentGameScore: [0, 0],
    servingPlayer: Math.random() > 0.5 ? 0 : 1,
    playerPositions: [
      { horizontal: position1.horizontal, vertical: position1.vertical },
      { horizontal: position2.horizontal, vertical: position2.vertical }
    ],
    rallyEvents: [],
    isComplete: false,
    winner: null
  }
}
