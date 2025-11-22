import {
  Player,
  PlayerSkills,
  PlayStyle,
  FavourStyle,
  RubberType
} from '../services/savegame/types'

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
    intendedSpin = BallSpin.TOPSPIN
    power = Math.min(100, sideSkill * 0.8 + skills.placement * 0.2)
  } else {
    // Defensive shot - safe, consistent
    intendedPosition = BallPosition.MIDDLE
    intendedDepth = BallDepth.MID
    intendedSpin = BallSpin.NO_SPIN
    power = sideSkill * 0.3
  }

  // Apply equipment speed modifier
  power = Math.max(0, Math.min(100, power + equipmentModifiers.speedModifier * 100))

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
    return positioningMatch > 0.8 && sideSkill > 70 && spinReading > 0.7
  }

  // Aggressive players attack more often
  if (
    player.playStyle === PlayStyle.FOREHAND_ATTACKER ||
    player.playStyle === PlayStyle.BACKHAND_SMASHER ||
    player.playStyle === PlayStyle.AGGRESSIVE_PUSHER
  ) {
    return positioningMatch > 0.5 && sideSkill > 50
  }

  // Default: attack if conditions are good
  return positioningMatch > 0.6 && sideSkill > 60 && spinReading > 0.6
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
  // Base chance based on shot quality
  let winChance = shotQuality * 0.6

  // Position advantage - hitting away from opponent
  const opponentMatch = calculatePositioningMatch(
    intendedPosition,
    intendedDepth,
    opponentPositioning,
    opponentFootwork
  )
  const positionAdvantage = 1 - opponentMatch
  winChance += positionAdvantage * 0.3

  // Power advantage
  winChance += (power / 100) * 0.1

  // Lucky bounce chance (net or corner)
  const luckyBounceChance = calculateLuckyBounceChance(shotQuality, opponentFootwork)
  winChance += luckyBounceChance

  return Math.max(0, Math.min(1, winChance))
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

  // Factor in spin and speed
  const spinDifficulty = ball.spin === BallSpin.NO_SPIN ? 0.1 : 0.3
  const speedDifficulty = ball.speed > 70 ? 0.2 : ball.speed > 40 ? 0.1 : 0

  const totalDifficulty = 1 - positioningMatch + spinDifficulty + speedDifficulty

  if (totalDifficulty < 0.3) return 'easy'
  if (totalDifficulty < 0.6) return 'medium'
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

    // Determine serve characteristics
    const servePosition =
      Math.random() > 0.5 ? BallPosition.FOREHAND : BallPosition.BACKHAND
    const serveDepth = Math.random() > 0.3 ? BallDepth.SHORT : BallDepth.MID
    const serveSpin = Math.random() > 0.4 ? BallSpin.TOPSPIN : BallSpin.BACKSPIN

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

    // Check for errors (ball out)
    const errorChance = shot.error * (1 - hitter.skills.consistency / 100)
    if (Math.random() < errorChance * 0.1) {
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
    // Increase base win chance to prevent excessively long rallies
    const baseWinChance = calculateRallyWinChance(
      actualQuality,
      opponentPosition,
      opponent.skills.footwork,
      shot.intendedPosition,
      shot.intendedDepth,
      shot.power
    )
    // Scale win chance based on rally length to ensure points eventually end
    const rallyLengthFactor = Math.min(2, 1 + rallyLength * 0.02) // Gradually increase win chance
    const winChance = Math.min(1, baseWinChance * rallyLengthFactor)

    // Create the return ball first
    const returnQuality = applyVariance(
      (opponent.skills.receive / 100) * (1 - winChance),
      0.1
    )

    // Update positions based on shot (players adjust)
    positions[currentPlayer] = {
      horizontal:
        shot.intendedPosition === BallPosition.FOREHAND
          ? HorizontalPosition.FOREHAND_BIAS
          : shot.intendedPosition === BallPosition.BACKHAND
            ? HorizontalPosition.BACKHAND_BIAS
            : HorizontalPosition.NEUTRAL,
      vertical:
        shot.intendedDepth === BallDepth.SHORT
          ? VerticalPosition.FORWARD
          : VerticalPosition.NEUTRAL
    }

    // Create return ball with variance
    let returnPosition: BallPosition = BallPosition.MIDDLE
    const rand = Math.random()
    if (rand < 0.4) {
      returnPosition = BallPosition.FOREHAND
    } else if (rand < 0.8) {
      returnPosition = BallPosition.BACKHAND
    }

    const returnBall: Ball = {
      position: returnPosition,
      depth: returnQuality > 0.7 ? BallDepth.LONG : BallDepth.MID,
      spin: shot.intendedSpin === BallSpin.TOPSPIN ? BallSpin.BACKSPIN : BallSpin.TOPSPIN, // Opponent counters spin
      speed: shot.power * returnQuality,
      power: shot.power * returnQuality
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
