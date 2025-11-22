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
 * Ball properties
 */
export type Ball = {
  position: BallPosition
  depth: BallDepth
  spin: BallSpin
  speed: number // 0-100, relative speed
  power: number // 0-100, how hard the ball is hit
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
 * Equipment modifiers
 */
interface EquipmentModifiers {
  spinApplicationPenalty: number // 0-1, multiplier
  spinReceiveBonus: number // 0-1, multiplier
  speedModifier: number // -1 to 1, additive
  unpredictability: number // 0-1, chance of unexpected behavior
  attackingStability: number // 0-1, affects power shot consistency
  spinReversal: number // 0-1, for long pimples
  spinNeutralization: number // 0-1, for anti-spin
}

/**
 * Get equipment modifiers based on rubber type
 */
function getEquipmentModifiers(rubber: RubberType): EquipmentModifiers {
  switch (rubber) {
    case RubberType.SPIN_RUBBER:
      return {
        spinApplicationPenalty: 0,
        spinReceiveBonus: 0,
        speedModifier: 0,
        unpredictability: 0,
        attackingStability: 1.0,
        spinReversal: 0,
        spinNeutralization: 0
      }
    case RubberType.SHORT_PIMPLE:
      return {
        spinApplicationPenalty: 0.15, // slight
        spinReceiveBonus: 0.1, // slight
        speedModifier: 0.1, // bonus
        unpredictability: 0.1, // slight
        attackingStability: 0.9,
        spinReversal: 0,
        spinNeutralization: 0
      }
    case RubberType.MEDIUM_PIMPLE:
      return {
        spinApplicationPenalty: 0.3, // medium
        spinReceiveBonus: 0.2, // medium
        speedModifier: -0.05, // slight penalty
        unpredictability: 0.25, // noticeable
        attackingStability: 0.7,
        spinReversal: 0,
        spinNeutralization: 0
      }
    case RubberType.LONG_PIMPLE:
      return {
        spinApplicationPenalty: 0.7, // massive
        spinReceiveBonus: 0.5, // massive
        speedModifier: -0.1, // slight penalty
        unpredictability: 0.3,
        attackingStability: 0.2, // very low
        spinReversal: 0.6, // strong
        spinNeutralization: 0
      }
    case RubberType.ANTISPIN_RUBBER:
      return {
        spinApplicationPenalty: 0.7, // massive
        spinReceiveBonus: 0.5, // massive
        speedModifier: Math.random() > 0.5 ? -0.05 : 0.05, // variable
        unpredictability: 0.2,
        attackingStability: 0.2, // very low
        spinReversal: 0,
        spinNeutralization: 0.7 // strong
      }
    case RubberType.WOOD:
      return {
        spinApplicationPenalty: 0.9, // enormous
        spinReceiveBonus: 0.8, // enormous
        speedModifier: -0.3, // massive penalty
        unpredictability: 0.1,
        attackingStability: 0.1,
        spinReversal: 0,
        spinNeutralization: 0
      }
  }
}

/**
 * Calculate positioning bias based on player tendency
 */
function getPositioningBias(
  tendency: FavourStyle,
  playStyle: PlayStyle
): { horizontal: HorizontalPosition; vertical: VerticalPosition } {
  // Horizontal positioning based on tendency
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

  // Vertical positioning based on play style
  let vertical: VerticalPosition = VerticalPosition.NEUTRAL
  if (playStyle === PlayStyle.NET_PLAYER) {
    vertical = VerticalPosition.FORWARD
  } else if (playStyle === PlayStyle.CHOPPER || playStyle === PlayStyle.LOBBER) {
    vertical = VerticalPosition.BACKWARDS
  }

  return { horizontal, vertical }
}

/**
 * Calculate how well a player can handle a ball based on positioning
 */
function calculatePositioningMatch(
  ballPosition: BallPosition,
  ballDepth: BallDepth,
  playerPosition: PlayerPosition,
  footwork: number
): number {
  // Base positioning match (0-1)
  let match = 0.5

  // Horizontal match
  if (ballPosition === BallPosition.FOREHAND) {
    if (playerPosition.horizontal === HorizontalPosition.FOREHAND_BIAS) {
      match += 0.3
    } else if (playerPosition.horizontal === HorizontalPosition.BACKHAND_BIAS) {
      match -= 0.3
    }
  } else if (ballPosition === BallPosition.BACKHAND) {
    if (playerPosition.horizontal === HorizontalPosition.BACKHAND_BIAS) {
      match += 0.3
    } else if (playerPosition.horizontal === HorizontalPosition.FOREHAND_BIAS) {
      match -= 0.3
    }
  } else {
    // Middle - neutral is best
    if (playerPosition.horizontal === HorizontalPosition.NEUTRAL) {
      match += 0.2
    }
  }

  // Depth match
  if (
    ballDepth === BallDepth.SHORT &&
    playerPosition.vertical === VerticalPosition.FORWARD
  ) {
    match += 0.2
  } else if (
    ballDepth === BallDepth.LONG &&
    playerPosition.vertical === VerticalPosition.BACKWARDS
  ) {
    match += 0.2
  } else if (
    ballDepth === BallDepth.MID &&
    playerPosition.vertical === VerticalPosition.NEUTRAL
  ) {
    match += 0.1
  }

  // Footwork reduces positioning penalties
  const footworkBonus = (footwork / 100) * 0.2
  match = Math.max(0, Math.min(1, match + footworkBonus))

  return match
}

/**
 * Calculate spin reading ability
 */
function calculateSpinReading(
  playerSpin: number,
  equipmentModifiers: EquipmentModifiers,
  incomingSpin: BallSpin
): number {
  let reading = playerSpin / 100
  reading += equipmentModifiers.spinReceiveBonus

  // Long pimples and anti-spin have special effects
  if (equipmentModifiers.spinReversal > 0 && incomingSpin !== BallSpin.NO_SPIN) {
    // Spin reversal can help or hurt depending on situation
    reading += equipmentModifiers.spinReversal * 0.3
  }

  if (equipmentModifiers.spinNeutralization > 0) {
    // Anti-spin neutralizes spin
    reading += equipmentModifiers.spinNeutralization * 0.4
  }

  return Math.max(0, Math.min(1, reading))
}

/**
 * Calculate shot quality based on player stats and conditions
 */
function calculateShotQuality(
  player: Player,
  ball: Ball,
  playerPosition: PlayerPosition,
  isForehand: boolean,
  equipmentModifiers: EquipmentModifiers
): {
  quality: number // 0-1, how good the shot is
  intendedPosition: BallPosition
  intendedDepth: BallDepth
  intendedSpin: BallSpin
  power: number
  error: number // 0-1, deviation from intended
} {
  const skills = player.skills
  const footwork = skills.footwork

  // Calculate positioning match
  const positioningMatch = calculatePositioningMatch(
    ball.position,
    ball.depth,
    playerPosition,
    footwork
  )

  // Determine which side to use
  const useForehand =
    isForehand ||
    ball.position === BallPosition.FOREHAND ||
    (ball.position === BallPosition.MIDDLE &&
      player.forehandBackhandTendency !== FavourStyle.HEAVILY_BACKHAND &&
      player.forehandBackhandTendency !== FavourStyle.SLIGHTLY_BACKHAND)

  const sideSkill = useForehand ? skills.forehand : skills.backhand

  // Calculate spin reading
  const spinReading = calculateSpinReading(skills.spin, equipmentModifiers, ball.spin)

  // Determine if player wants to attack
  const wantsToAttack = shouldAttack(
    player,
    ball,
    positioningMatch,
    sideSkill,
    spinReading
  )

  // Calculate intended shot
  let intendedPosition: BallPosition
  let intendedDepth: BallDepth
  let intendedSpin: BallSpin
  let power = 0

  if (wantsToAttack) {
    // Ideal attacking shot - away from opponent, fast, topspin
    intendedPosition = getIdealAttackPosition(playerPosition)
    intendedDepth = BallDepth.LONG
    // 80% topspin, 15% backspin (for variation), 5% no-spin
    const spinRand = Math.random()
    if (spinRand < 0.8) {
      intendedSpin = BallSpin.TOPSPIN
    } else if (spinRand < 0.95) {
      intendedSpin = BallSpin.BACKSPIN
    } else {
      intendedSpin = BallSpin.NO_SPIN
    }
    power = Math.min(100, sideSkill * 0.7 + skills.placement * 0.3)
  } else {
    // Defensive shot - safe, consistent
    // More variety in defensive shots
    const defensiveRand = Math.random()
    if (defensiveRand < 0.4) {
      intendedPosition = BallPosition.MIDDLE
    } else if (defensiveRand < 0.7) {
      intendedPosition = ball.position // Return to same side
    } else {
      intendedPosition =
        ball.position === BallPosition.FOREHAND
          ? BallPosition.BACKHAND
          : BallPosition.FOREHAND
    }

    // Depth based on ball depth - defensive players often return similar depth
    if (ball.depth === BallDepth.SHORT) {
      intendedDepth = Math.random() > 0.3 ? BallDepth.SHORT : BallDepth.MID
    } else {
      intendedDepth = Math.random() > 0.4 ? BallDepth.MID : BallDepth.LONG
    }

    // Defensive shots: 40% backspin, 35% no-spin, 25% light topspin
    const spinRand = Math.random()
    if (spinRand < 0.4) {
      intendedSpin = BallSpin.BACKSPIN
    } else if (spinRand < 0.75) {
      intendedSpin = BallSpin.NO_SPIN
    } else {
      intendedSpin = BallSpin.TOPSPIN // Light topspin
    }
    // Defensive shots need minimum power to ensure ball reaches table
    power = Math.max(15, sideSkill * 0.3 + skills.consistency * 0.2)
  }

  // Apply equipment speed modifier
  power = Math.max(0, Math.min(100, power + equipmentModifiers.speedModifier * 100))

  // Ensure minimum power for any shot (even defensive shots need some speed)
  power = Math.max(10, power)

  // Calculate error based on deviation from ideal conditions
  const idealConditions = {
    positioning: positioningMatch,
    sideSkill: sideSkill / 100,
    spinReading: spinReading,
    pressure: 0.5 // Will be calculated based on match situation
  }

  const error = calculateError(idealConditions, skills.consistency, equipmentModifiers)

  // Calculate actual shot quality
  const baseQuality = (sideSkill / 100) * positioningMatch * spinReading
  const quality = Math.max(0, Math.min(1, baseQuality * (1 - error)))

  return {
    quality,
    intendedPosition,
    intendedDepth,
    intendedSpin,
    power,
    error
  }
}

/**
 * Determine if player should attack based on style and conditions
 */
function shouldAttack(
  player: Player,
  ball: Ball,
  positioningMatch: number,
  sideSkill: number,
  spinReading: number
): boolean {
  // Defensive players only attack safest balls
  if (
    player.playStyle === PlayStyle.CHOPPER ||
    player.playStyle === PlayStyle.DEFENSIVE_SPECIALIST
  ) {
    return positioningMatch > 0.85 && sideSkill > 75 && spinReading > 0.75
  }

  // Aggressive players attack more often
  if (
    player.playStyle === PlayStyle.FOREHAND_ATTACKER ||
    player.playStyle === PlayStyle.BACKHAND_SMASHER ||
    player.playStyle === PlayStyle.AGGRESSIVE_PUSHER
  ) {
    return positioningMatch > 0.45 && sideSkill > 45
  }

  // Default: attack if conditions are good
  return positioningMatch > 0.55 && sideSkill > 55 && spinReading > 0.55
}

/**
 * Get ideal attack position (away from opponent)
 */
function getIdealAttackPosition(playerPosition: PlayerPosition): BallPosition {
  // Attack to opposite side of opponent's bias
  if (playerPosition.horizontal === HorizontalPosition.FOREHAND_BIAS) {
    return BallPosition.BACKHAND
  } else if (playerPosition.horizontal === HorizontalPosition.BACKHAND_BIAS) {
    return BallPosition.FOREHAND
  }
  return BallPosition.MIDDLE
}

/**
 * Calculate error based on deviation from ideal conditions
 */
function calculateError(
  idealConditions: {
    positioning: number
    sideSkill: number
    spinReading: number
    pressure: number
  },
  consistency: number,
  equipmentModifiers: EquipmentModifiers
): number {
  // Error increases as conditions deviate from ideal
  const positioningError = 1 - idealConditions.positioning
  const skillError = 1 - idealConditions.sideSkill
  const spinError = 1 - idealConditions.spinReading
  const pressureError = Math.abs(0.5 - idealConditions.pressure) * 2

  // Consistency reduces error
  const consistencyFactor = 1 - consistency / 100

  // Equipment unpredictability adds error
  const equipmentError = equipmentModifiers.unpredictability

  // Combine errors
  const totalError =
    (positioningError * 0.3 +
      skillError * 0.3 +
      spinError * 0.2 +
      pressureError * 0.1 +
      equipmentError * 0.1) *
    consistencyFactor

  return Math.max(0, Math.min(1, totalError))
}

/**
 * Calculate chance of winning the rally
 */
function calculateRallyWinChance(
  shotQuality: number,
  opponentPositioning: PlayerPosition,
  opponentFootwork: number,
  intendedPosition: BallPosition,
  intendedDepth: BallDepth,
  power: number
): number {
  // Base chance based on shot quality - more conservative to allow longer rallies
  let winChance = shotQuality * 0.4 // Reduced from 0.5

  // Position advantage - hitting away from opponent
  const opponentMatch = calculatePositioningMatch(
    intendedPosition,
    intendedDepth,
    opponentPositioning,
    opponentFootwork
  )
  const positionAdvantage = 1 - opponentMatch
  winChance += positionAdvantage * 0.2 // Reduced from 0.25

  // Power advantage - but diminishing returns
  const powerBonus = Math.min(0.12, (power / 100) * 0.18) // Slightly reduced
  winChance += powerBonus

  // Depth matters - long attacking shots are more likely to win
  if (intendedDepth === BallDepth.LONG && power > 50) {
    winChance += 0.04 // Slightly reduced
  }

  // Lucky bounce chance (net or corner) - already factored in separately
  // Don't double-count here

  return Math.max(0.03, Math.min(0.8, winChance)) // Cap between 3% and 80% (reduced max)
}

/**
 * Calculate chance of lucky bounce (net or corner)
 */
function calculateLuckyBounceChance(
  shotQuality: number,
  opponentFootwork: number
): number {
  // Better shots have higher lucky bounce chance, but opponent footwork reduces it
  const baseChance = shotQuality * 0.15
  const footworkReduction = (opponentFootwork / 100) * 0.1
  return Math.max(0, baseChance - footworkReduction)
}

/**
 * Check if lucky bounce occurs and if it can be saved
 */
function checkLuckyBounce(
  luckyBounceChance: number,
  opponentFootwork: number
): { occurred: boolean; saved: boolean; type: 'net' | 'corner' | null } {
  if (Math.random() > luckyBounceChance) {
    return { occurred: false, saved: false, type: null }
  }

  const bounceType = Math.random() > 0.5 ? 'net' : 'corner'
  const saveChance = bounceType === 'net' ? 0.3 : 0.1 // Net easier to save than corner
  const footworkBonus = (opponentFootwork / 100) * 0.2
  const saved = Math.random() > saveChance - footworkBonus

  return { occurred: true, saved, type: bounceType as 'net' | 'corner' }
}

/**
 * Apply statistical variance to a value
 */
function applyVariance(value: number, variance: number): number {
  const deviation = (Math.random() - 0.5) * 2 * variance
  return Math.max(0, Math.min(100, value + deviation * 100))
}

/**
 * Calculate difficulty of receiving a ball
 */
function calculateDifficulty(
  ball: Ball,
  receiverPosition: PlayerPosition,
  receiverFootwork: number
): 'easy' | 'medium' | 'hard' {
  const positioningMatch = calculatePositioningMatch(
    ball.position,
    ball.depth,
    receiverPosition,
    receiverFootwork
  )

  // Factor in spin and speed - more nuanced
  let spinDifficulty = 0
  if (ball.spin === BallSpin.NO_SPIN) {
    spinDifficulty = 0.05 // Easiest to handle
  } else if (ball.spin === BallSpin.BACKSPIN) {
    spinDifficulty = ball.depth === BallDepth.SHORT ? 0.15 : 0.2 // Short backspin is tricky
  } else {
    // Topspin
    spinDifficulty = ball.speed > 60 ? 0.3 : 0.15 // Fast topspin is hard
  }

  // Speed difficulty - more gradual
  let speedDifficulty = 0
  if (ball.speed > 80) {
    speedDifficulty = 0.25
  } else if (ball.speed > 50) {
    speedDifficulty = 0.15
  } else if (ball.speed > 25) {
    speedDifficulty = 0.05
  } else {
    speedDifficulty = 0 // Very slow balls are easy
  }

  // Depth affects difficulty
  let depthDifficulty = 0
  if (
    ball.depth === BallDepth.SHORT &&
    receiverPosition.vertical === VerticalPosition.BACKWARDS
  ) {
    depthDifficulty = 0.15 // Short ball when far back is hard
  } else if (
    ball.depth === BallDepth.LONG &&
    receiverPosition.vertical === VerticalPosition.FORWARD
  ) {
    depthDifficulty = 0.1 // Long ball when close is harder
  }

  const totalDifficulty =
    (1 - positioningMatch) * 0.5 + spinDifficulty + speedDifficulty + depthDifficulty

  // Adjusted thresholds for better distribution
  // More granular: easy < 0.3, medium < 0.65, hard >= 0.65
  if (totalDifficulty < 0.3) return 'easy'
  if (totalDifficulty < 0.65) return 'medium'
  return 'hard'
}

/**
 * Format ball details for logging
 */
function formatBallDetails(ball: Ball, playerPosition: PlayerPosition): string {
  const speedDesc = ball.speed > 70 ? 'very fast' : ball.speed > 40 ? 'fast' : 'slow'
  const spinDesc =
    ball.spin === BallSpin.TOPSPIN
      ? 'heavy topspin'
      : ball.spin === BallSpin.BACKSPIN
        ? 'backspin'
        : 'no spin'
  const positionDesc =
    ball.position === BallPosition.FOREHAND
      ? 'forehand'
      : ball.position === BallPosition.BACKHAND
        ? 'backhand'
        : 'middle'
  const depthDesc =
    ball.depth === BallDepth.LONG
      ? 'long'
      : ball.depth === BallDepth.SHORT
        ? 'short'
        : 'mid'
  const playerPosDesc = `${playerPosition.horizontal.replace('_', ' ')}, ${playerPosition.vertical}`

  return `${positionDesc} ${depthDesc}, ${speedDesc} (${Math.round(ball.speed)}), ${spinDesc}. Player at: ${playerPosDesc}`
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
  let currentPlayer = servingPlayer
  let ball: Ball | null = null
  const positions: [PlayerPosition, PlayerPosition] = [...playerPositions]

  // ALWAYS start with a serve for every point
  // Every point begins with a serve, regardless of isServe flag
  // (isServe is just for tracking, but we always need a ball to start the rally)
  {
    const server = currentPlayer === 0 ? player1 : player2
    const receiver = currentPlayer === 0 ? player2 : player1
    const serverPosition = positions[currentPlayer]
    const receiverPosition = positions[1 - currentPlayer]
    const equipmentModifiers = getEquipmentModifiers(
      server.forehandRubber // Serve typically uses forehand rubber
    )

    // Serve quality based on serve stat
    const serveQuality = applyVariance(server.skills.serve / 100, 0.1)
    const servePower = server.skills.serve * 0.7

    // Determine serve characteristics - more variety
    const servePosition =
      Math.random() > 0.5 ? BallPosition.FOREHAND : BallPosition.BACKHAND
    // Serves: 60% short, 30% mid, 10% long (long serves are risky)
    const serveDepthRand = Math.random()
    const serveDepth =
      serveDepthRand < 0.6
        ? BallDepth.SHORT
        : serveDepthRand < 0.9
          ? BallDepth.MID
          : BallDepth.LONG

    // Serve spin: 40% topspin, 45% backspin, 15% no-spin (more realistic)
    const serveSpinRand = Math.random()
    const serveSpin =
      serveSpinRand < 0.4
        ? BallSpin.TOPSPIN
        : serveSpinRand < 0.85
          ? BallSpin.BACKSPIN
          : BallSpin.NO_SPIN

    ball = {
      position: servePosition,
      depth: serveDepth,
      spin: serveSpin,
      speed: servePower,
      power: servePower
    }

    const difficulty = calculateDifficulty(
      ball,
      receiverPosition,
      receiver.skills.footwork
    )

    events.push({
      type: 'ball',
      player: currentPlayer,
      description: `${server.shortName || server.firstName} serves: ${formatBallDetails(ball, serverPosition)}. Difficulty for receiver: ${difficulty}`,
      timestamp: Date.now(),
      ballDetails: {
        position: ball.position,
        depth: ball.depth,
        spin: ball.spin,
        speed: ball.speed,
        playerPosition: serverPosition,
        difficulty
      }
    })

    currentPlayer = 1 - currentPlayer // Switch to receiver
  }

  // Rally continues until point is won
  let rallyLength = 0
  const maxRallies = 200 // Prevent infinite loops (increased to allow longer rallies with full logging)

  while (rallyLength < maxRallies && ball) {
    const hitter = currentPlayer === 0 ? player1 : player2
    const opponent = currentPlayer === 0 ? player2 : player1
    const hitterPosition = positions[currentPlayer]
    const opponentPosition = positions[1 - currentPlayer]

    // Log incoming ball
    const incomingDifficulty = calculateDifficulty(
      ball,
      hitterPosition,
      hitter.skills.footwork
    )
    events.push({
      type: 'ball',
      player: currentPlayer,
      description: `${hitter.shortName || hitter.firstName} receives: ${formatBallDetails(ball, hitterPosition)}. Difficulty: ${incomingDifficulty}`,
      timestamp: Date.now(),
      ballDetails: {
        position: ball.position,
        depth: ball.depth,
        spin: ball.spin,
        speed: ball.speed,
        playerPosition: hitterPosition,
        difficulty: incomingDifficulty
      }
    })

    // Determine which rubber to use
    const isForehand =
      ball.position === BallPosition.FOREHAND ||
      (ball.position === BallPosition.MIDDLE &&
        hitter.forehandBackhandTendency !== FavourStyle.HEAVILY_BACKHAND)

    const equipmentModifiers = getEquipmentModifiers(
      isForehand ? hitter.forehandRubber : hitter.backhandRubber
    )

    // Calculate shot
    const shot = calculateShotQuality(
      hitter,
      ball,
      hitterPosition,
      isForehand,
      equipmentModifiers
    )

    // Apply variance to shot execution
    const actualQuality = applyVariance(shot.quality, 0.15)

    // Check for errors (ball out) - more realistic error rates
    // Base error chance scales with error value and consistency
    // High consistency players make fewer errors
    const baseErrorChance = shot.error * (1 - hitter.skills.consistency / 100)

    // Adjust based on shot difficulty and rally length
    // Longer rallies increase error chance slightly
    const rallyLengthPenalty = Math.min(0.1, rallyLength * 0.005)

    // Defensive players have lower error rates on defensive shots
    const isDefensiveShot = !shouldAttack(
      hitter,
      ball,
      calculatePositioningMatch(
        ball.position,
        ball.depth,
        hitterPosition,
        hitter.skills.footwork
      ),
      isForehand ? hitter.skills.forehand : hitter.skills.backhand,
      calculateSpinReading(hitter.skills.spin, equipmentModifiers, ball.spin)
    )
    const defensiveBonus =
      isDefensiveShot &&
        (hitter.playStyle === PlayStyle.CHOPPER ||
          hitter.playStyle === PlayStyle.DEFENSIVE_SPECIALIST)
        ? 0.3
        : 1.0

    const finalErrorChance = baseErrorChance * 0.08 * defensiveBonus + rallyLengthPenalty

    if (Math.random() < finalErrorChance) {
      // Ball goes out
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
      return {
        winner: 1 - currentPlayer,
        events,
        newPositions: positions
      }
    }

    // Calculate rally win chance
    // More balanced win chance calculation
    const baseWinChance = calculateRallyWinChance(
      actualQuality,
      opponentPosition,
      opponent.skills.footwork,
      shot.intendedPosition,
      shot.intendedDepth,
      shot.power
    )

    // Rally length factor - more gradual increase
    // Average rally length in table tennis is 3-5 exchanges, so we want most points to end naturally
    const rallyLengthFactor = Math.min(1.4, 1 + rallyLength * 0.012) // Slightly slower increase

    // Also factor in consistency - high consistency players extend rallies
    const consistencyFactor =
      (hitter.skills.consistency + opponent.skills.consistency) / 200
    const extendedRallyPenalty = consistencyFactor > 0.7 ? 0.85 : 1.0 // High consistency = longer rallies (more penalty)

    // Reduce win chance slightly to allow more exchanges
    const winChance = Math.min(
      0.85,
      baseWinChance * rallyLengthFactor * extendedRallyPenalty
    )

    // Create the return ball first
    const returnQuality = applyVariance(
      (opponent.skills.receive / 100) * (1 - winChance),
      0.1
    )

    // Update positions based on shot and ball location (more dynamic)
    // Players move toward where they hit the ball, but also anticipate return
    const hitPosition = shot.intendedPosition
    const hitDepth = shot.intendedDepth

    // Horizontal: Move toward where you hit, but also consider opponent's likely return
    let newHorizontal: HorizontalPosition = HorizontalPosition.NEUTRAL
    if (hitPosition === BallPosition.FOREHAND) {
      // Hit to forehand - might move that way, but also consider recovery
      newHorizontal =
        Math.random() > 0.3
          ? HorizontalPosition.FOREHAND_BIAS
          : HorizontalPosition.NEUTRAL
    } else if (hitPosition === BallPosition.BACKHAND) {
      newHorizontal =
        Math.random() > 0.3
          ? HorizontalPosition.BACKHAND_BIAS
          : HorizontalPosition.NEUTRAL
    } else {
      // Middle shot - usually return to neutral
      newHorizontal =
        Math.random() > 0.5
          ? HorizontalPosition.NEUTRAL
          : Math.random() > 0.5
            ? HorizontalPosition.FOREHAND_BIAS
            : HorizontalPosition.BACKHAND_BIAS
    }

    // Vertical: Adjust based on shot depth and opponent's likely return
    let newVertical: VerticalPosition = VerticalPosition.NEUTRAL
    if (hitDepth === BallDepth.SHORT) {
      // Short shot - move forward
      newVertical =
        Math.random() > 0.2 ? VerticalPosition.FORWARD : VerticalPosition.NEUTRAL
    } else if (hitDepth === BallDepth.LONG) {
      // Long shot - might move back
      newVertical =
        Math.random() > 0.6 ? VerticalPosition.BACKWARDS : VerticalPosition.NEUTRAL
    } else {
      // Mid depth - usually neutral
      newVertical =
        Math.random() > 0.3
          ? VerticalPosition.NEUTRAL
          : Math.random() > 0.5
            ? VerticalPosition.FORWARD
            : VerticalPosition.BACKWARDS
    }

    positions[currentPlayer] = {
      horizontal: newHorizontal,
      vertical: newVertical
    }

    // Opponent also adjusts position based on incoming ball
    const opponentAdjustment = Math.random()
    if (opponentAdjustment > 0.4) {
      // Opponent moves toward where ball is coming
      if (hitPosition === BallPosition.FOREHAND) {
        positions[1 - currentPlayer].horizontal =
          Math.random() > 0.5
            ? HorizontalPosition.FOREHAND_BIAS
            : positions[1 - currentPlayer].horizontal
      } else if (hitPosition === BallPosition.BACKHAND) {
        positions[1 - currentPlayer].horizontal =
          Math.random() > 0.5
            ? HorizontalPosition.BACKHAND_BIAS
            : positions[1 - currentPlayer].horizontal
      }

      if (hitDepth === BallDepth.SHORT) {
        positions[1 - currentPlayer].vertical =
          Math.random() > 0.3
            ? VerticalPosition.FORWARD
            : positions[1 - currentPlayer].vertical
      } else if (hitDepth === BallDepth.LONG) {
        positions[1 - currentPlayer].vertical =
          Math.random() > 0.4
            ? VerticalPosition.BACKWARDS
            : positions[1 - currentPlayer].vertical
      }
    }

    // Create return ball with variance - more realistic placement
    // Position based on shot quality and placement skill
    let returnPosition: BallPosition = BallPosition.MIDDLE
    const placementSkill = opponent.skills.placement / 100
    const rand = Math.random()

    // Better placement = more control over where ball goes
    if (placementSkill > 0.7) {
      // High placement - can target better
      if (rand < 0.35) {
        returnPosition = BallPosition.FOREHAND
      } else if (rand < 0.7) {
        returnPosition = BallPosition.BACKHAND
      } else {
        returnPosition = BallPosition.MIDDLE
      }
    } else {
      // Lower placement - more random
      if (rand < 0.4) {
        returnPosition = BallPosition.FOREHAND
      } else if (rand < 0.8) {
        returnPosition = BallPosition.BACKHAND
      } else {
        returnPosition = BallPosition.MIDDLE
      }
    }

    // Depth based on shot quality and player style
    let returnDepth: BallDepth = BallDepth.MID
    if (returnQuality > 0.75) {
      returnDepth = Math.random() > 0.3 ? BallDepth.LONG : BallDepth.MID
    } else if (returnQuality > 0.5) {
      returnDepth = Math.random() > 0.5 ? BallDepth.MID : BallDepth.LONG
    } else {
      // Lower quality - more likely mid or short
      returnDepth = Math.random() > 0.4 ? BallDepth.MID : BallDepth.SHORT
    }

    // Defensive players tend to return shorter
    if (
      opponent.playStyle === PlayStyle.CHOPPER ||
      opponent.playStyle === PlayStyle.DEFENSIVE_SPECIALIST
    ) {
      if (returnDepth === BallDepth.LONG && Math.random() > 0.4) {
        returnDepth = BallDepth.MID
      }
    }

    // Spin - more realistic counter-spin logic
    let returnSpin: BallSpin = BallSpin.TOPSPIN
    const spinRand = Math.random()

    // Determine which side opponent will use for return
    const opponentIsForehand =
      returnPosition === BallPosition.FOREHAND ||
      (returnPosition === BallPosition.MIDDLE &&
        opponent.forehandBackhandTendency !== FavourStyle.HEAVILY_BACKHAND)

    // Opponent's spin reading affects their ability to counter
    const spinReading = calculateSpinReading(
      opponent.skills.spin,
      getEquipmentModifiers(
        opponentIsForehand ? opponent.forehandRubber : opponent.backhandRubber
      ),
      shot.intendedSpin
    )

    if (shot.intendedSpin === BallSpin.TOPSPIN) {
      // Receiving topspin
      if (spinReading > 0.7) {
        // Good spin reading - can counter with backspin or no-spin
        if (spinRand < 0.5) {
          returnSpin = BallSpin.BACKSPIN
        } else if (spinRand < 0.8) {
          returnSpin = BallSpin.NO_SPIN
        } else {
          returnSpin = BallSpin.TOPSPIN // Loop it back
        }
      } else {
        // Lower spin reading - more likely to loop back or use no-spin
        if (spinRand < 0.4) {
          returnSpin = BallSpin.TOPSPIN
        } else if (spinRand < 0.7) {
          returnSpin = BallSpin.NO_SPIN
        } else {
          returnSpin = BallSpin.BACKSPIN
        }
      }
    } else if (shot.intendedSpin === BallSpin.BACKSPIN) {
      // Receiving backspin
      if (spinReading > 0.7) {
        // Good spin reading - can lift/loop with topspin
        if (spinRand < 0.6) {
          returnSpin = BallSpin.TOPSPIN
        } else if (spinRand < 0.85) {
          returnSpin = BallSpin.NO_SPIN
        } else {
          returnSpin = BallSpin.BACKSPIN // Push back
        }
      } else {
        // Lower spin reading - more likely to push back or use no-spin
        if (spinRand < 0.5) {
          returnSpin = BallSpin.BACKSPIN
        } else if (spinRand < 0.8) {
          returnSpin = BallSpin.NO_SPIN
        } else {
          returnSpin = BallSpin.TOPSPIN
        }
      }
    } else {
      // Receiving no-spin
      // Can do anything, but topspin is common
      if (spinRand < 0.5) {
        returnSpin = BallSpin.TOPSPIN
      } else if (spinRand < 0.8) {
        returnSpin = BallSpin.NO_SPIN
      } else {
        returnSpin = BallSpin.BACKSPIN
      }
    }

    // Speed - more realistic distribution based on shot type and quality
    // Attacking shots (high power) vs defensive shots (low power) have different speed ranges
    const isAttackingShot = shot.power > 50

    let normalizedSpeed: number
    if (isAttackingShot) {
      // Attacking shots: 35-85 range, with most in 45-75
      // Use a smoother curve to avoid clustering at extremes
      const powerRatio = Math.min(1, shot.power / 100) // Normalize power to 0-1
      const attackBase = 35 + powerRatio * 40 // 35-75 base range
      const qualityBonus = returnQuality * 15 // Quality adds up to 15 speed
      const variance = (Math.random() - 0.5) * 15 // ±7.5 variance
      normalizedSpeed = attackBase + qualityBonus + variance
      // Soft cap - use a curve instead of hard cap to avoid clustering
      if (normalizedSpeed > 85) {
        normalizedSpeed = 85 + (normalizedSpeed - 85) * 0.3 // Diminishing returns above 85
      }
      normalizedSpeed = Math.min(90, Math.max(35, normalizedSpeed))
    } else {
      // Defensive shots: 15-45 range, with most in 20-35
      // Lower power shots should have slower, more controlled speeds
      const powerRatio = Math.min(1, shot.power / 50) // Normalize power to 0-1 for defensive range
      const defensiveBase = 15 + powerRatio * 20 // 15-35 base range
      const qualityBonus = returnQuality * 10 // Quality adds up to 10 speed
      const variance = (Math.random() - 0.5) * 8 // ±4 variance for defensive shots
      normalizedSpeed = defensiveBase + qualityBonus + variance
      // Soft cap for defensive shots too
      if (normalizedSpeed > 45) {
        normalizedSpeed = 45 + (normalizedSpeed - 45) * 0.4
      }
      normalizedSpeed = Math.min(50, Math.max(15, normalizedSpeed))
    }

    // Round to integer for cleaner display
    normalizedSpeed = Math.round(normalizedSpeed)

    const returnBall: Ball = {
      position: returnPosition,
      depth: returnDepth,
      spin: returnSpin,
      speed: normalizedSpeed,
      power: normalizedSpeed
    }

    // Check for lucky bounce
    const luckyBounce = checkLuckyBounce(
      calculateLuckyBounceChance(actualQuality, opponent.skills.footwork),
      opponent.skills.footwork
    )

    if (luckyBounce.occurred && !luckyBounce.saved) {
      events.push({
        type: 'lucky_bounce',
        player: currentPlayer,
        description: `${hitter.shortName || hitter.firstName} gets a lucky ${luckyBounce.type} bounce!`,
        timestamp: Date.now()
      })
      events.push({
        type: 'point',
        player: currentPlayer,
        description: `${hitter.shortName || hitter.firstName} wins the point (lucky bounce)`,
        timestamp: Date.now()
      })
      return {
        winner: currentPlayer,
        events,
        newPositions: positions
      }
    }

    // Check if rally is won (before logging the return)
    if (Math.random() < winChance) {
      // Log the winning shot
      const winningDifficulty = calculateDifficulty(
        returnBall,
        opponentPosition,
        opponent.skills.footwork
      )
      events.push({
        type: 'ball',
        player: currentPlayer,
        description: `${hitter.shortName || hitter.firstName} hits: ${formatBallDetails(returnBall, positions[currentPlayer])}. Difficulty for opponent: ${winningDifficulty}`,
        timestamp: Date.now(),
        ballDetails: {
          position: returnBall.position,
          depth: returnBall.depth,
          spin: returnBall.spin,
          speed: returnBall.speed,
          playerPosition: positions[currentPlayer],
          difficulty: winningDifficulty
        }
      })
      events.push({
        type: 'point',
        player: currentPlayer,
        description: `${hitter.shortName || hitter.firstName} wins the point`,
        timestamp: Date.now()
      })
      return {
        winner: currentPlayer,
        events,
        newPositions: positions
      }
    }

    // Log the return ball
    const returnDifficulty = calculateDifficulty(
      returnBall,
      opponentPosition,
      opponent.skills.footwork
    )
    events.push({
      type: 'ball',
      player: currentPlayer,
      description: `${hitter.shortName || hitter.firstName} returns: ${formatBallDetails(returnBall, positions[currentPlayer])}. Difficulty for opponent: ${returnDifficulty}`,
      timestamp: Date.now(),
      ballDetails: {
        position: returnBall.position,
        depth: returnBall.depth,
        spin: returnBall.spin,
        speed: returnBall.speed,
        playerPosition: positions[currentPlayer],
        difficulty: returnDifficulty
      }
    })

    // Set ball for next iteration
    ball = returnBall
    currentPlayer = 1 - currentPlayer
    rallyLength++
  }

  // If we hit max rallies, determine winner by quality
  // All balls should have been logged during the loop, but log final state if needed
  const finalQuality1 = (player1.skills.consistency + player1.skills.footwork) / 2
  const finalQuality2 = (player2.skills.consistency + player2.skills.footwork) / 2
  const winner = finalQuality1 > finalQuality2 ? 0 : 1

  // Only add point event if we haven't already added one (shouldn't happen, but safety check)
  const hasPointEvent = events.some((e) => e.type === 'point')
  if (!hasPointEvent) {
    events.push({
      type: 'point',
      player: winner,
      description: `${winner === 0 ? player1.shortName || player1.firstName : player2.shortName || player2.firstName} wins the point${rallyLength >= maxRallies ? ` (long rally - ${rallyLength} exchanges)` : ''}`,
      timestamp: Date.now()
    })
  }

  return {
    winner,
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
