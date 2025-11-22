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
 * Shot quality breakdown for analysis
 */
type ShotQualityBreakdown = {
  baseQuality: number
  difficultyPenalty: number
  momentumMultiplier: number
  finalQuality: number
  primaryStat: string
  primaryStatValue: number
  shotType: ShotType
  isForehand: boolean
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
): { quality: number; breakdown: ShotQualityBreakdown } {
  const weights = SHOT_TYPE_WEIGHTS[shotType]
  const skills = player.skills

  let quality = 0
  let primaryStat = 'consistency'
  let primaryStatValue = skills.consistency
  let maxContribution = 0

  // Apply weights to relevant stats
  // For shot types with both forehand and backhand weights, use the appropriate one
  if (weights.forehand && weights.backhand) {
    // Both weights exist - use the appropriate side
    if (isForehand) {
      const contribution = skills.forehand * weights.forehand
      quality += contribution
      if (contribution > maxContribution) {
        maxContribution = contribution
        primaryStat = 'forehand'
        primaryStatValue = skills.forehand
      }
    } else {
      const contribution = skills.backhand * weights.backhand
      quality += contribution
      if (contribution > maxContribution) {
        maxContribution = contribution
        primaryStat = 'backhand'
        primaryStatValue = skills.backhand
      }
    }
  } else {
    // Only one weight exists, or neither
    if (weights.forehand && isForehand) {
      const contribution = skills.forehand * weights.forehand
      quality += contribution
      if (contribution > maxContribution) {
        maxContribution = contribution
        primaryStat = 'forehand'
        primaryStatValue = skills.forehand
      }
    }
    if (weights.backhand && !isForehand) {
      const contribution = skills.backhand * weights.backhand
      quality += contribution
      if (contribution > maxContribution) {
        maxContribution = contribution
        primaryStat = 'backhand'
        primaryStatValue = skills.backhand
      }
    }
  }
  if (weights.footwork) {
    const contribution = skills.footwork * weights.footwork
    quality += contribution
    if (contribution > maxContribution) {
      maxContribution = contribution
      primaryStat = 'footwork'
      primaryStatValue = skills.footwork
    }
  }
  if (weights.serve) {
    const contribution = skills.serve * weights.serve
    quality += contribution
    if (contribution > maxContribution) {
      maxContribution = contribution
      primaryStat = 'serve'
      primaryStatValue = skills.serve
    }
  }
  if (weights.receive) {
    const contribution =
      skills.receive * weights.receive * equipmentModifiers.receiveMultiplier
    quality += contribution
    if (contribution > maxContribution) {
      maxContribution = contribution
      primaryStat = 'receive'
      primaryStatValue = skills.receive
    }
  }
  if (weights.spin) {
    const contribution = skills.spin * weights.spin * equipmentModifiers.spinMultiplier
    quality += contribution
    if (contribution > maxContribution) {
      maxContribution = contribution
      primaryStat = 'spin'
      primaryStatValue = skills.spin
    }
  }
  if (weights.placement) {
    const contribution = skills.placement * weights.placement
    quality += contribution
    if (contribution > maxContribution) {
      maxContribution = contribution
      primaryStat = 'placement'
      primaryStatValue = skills.placement
    }
  }
  if (weights.consistency) {
    const contribution =
      skills.consistency * weights.consistency * equipmentModifiers.consistencyMultiplier
    quality += contribution
    if (contribution > maxContribution) {
      maxContribution = contribution
      primaryStat = 'consistency'
      primaryStatValue = skills.consistency
    }
  }

  const baseQuality = Math.max(0, Math.min(100, quality))

  return {
    quality: baseQuality,
    breakdown: {
      baseQuality,
      difficultyPenalty: 0, // Will be set later
      momentumMultiplier: 1, // Will be set later
      finalQuality: baseQuality,
      primaryStat,
      primaryStatValue,
      shotType,
      isForehand
    }
  }
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
): { quality: number; breakdown: ShotQualityBreakdown } {
  const skills = player.skills
  let quality = 0

  const serveContribution = skills.serve * SERVE_WEIGHTS.serve!
  const forehandContribution = skills.forehand * SERVE_WEIGHTS.forehand!
  const spinContribution =
    skills.spin * SERVE_WEIGHTS.spin! * equipmentModifiers.spinMultiplier

  quality += serveContribution
  quality += forehandContribution
  quality += spinContribution

  // Determine primary stat
  let primaryStat = 'serve'
  let primaryStatValue = skills.serve
  if (
    forehandContribution > serveContribution &&
    forehandContribution > spinContribution
  ) {
    primaryStat = 'forehand'
    primaryStatValue = skills.forehand
  } else if (
    spinContribution > serveContribution &&
    spinContribution > forehandContribution
  ) {
    primaryStat = 'spin'
    primaryStatValue = skills.spin
  }

  const baseQuality = Math.max(0, Math.min(100, quality))

  return {
    quality: baseQuality,
    breakdown: {
      baseQuality,
      difficultyPenalty: 0,
      momentumMultiplier: 1,
      finalQuality: baseQuality,
      primaryStat,
      primaryStatValue,
      shotType: ShotType.AGGRESSIVE_ATTACK, // Serve is treated as aggressive
      isForehand: true // Serves typically use forehand
    }
  }
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
  r1Bonus: number
  r2Bonus: number
} {
  // Better shots have slightly higher chance of lucky bounce
  const baseChance = 0.05 + (shotQuality / 100) * 0.05 // 5-10% chance
  const roll = Math.random()

  if (roll < baseChance) {
    // 70% net, 30% edge
    if (Math.random() < 0.7) {
      // Net: +10 to R1, -5 to R2
      return { occurred: true, type: 'net', r1Bonus: 10, r2Bonus: -5 }
    } else {
      // Edge: +30 to R1, no change to R2
      return { occurred: true, type: 'edge', r1Bonus: 30, r2Bonus: 0 }
    }
  }

  return { occurred: false, type: null, r1Bonus: 0, r2Bonus: 0 }
}

/**
 * Noise parameter for R1 and R2 calculations
 * This can be tuned through testing
 */
const NOISE_RANGE = 10 // ±10 points of noise

/**
 * Generate noise for calculations
 */
function generateNoise(): number {
  return (Math.random() - 0.5) * 2 * NOISE_RANGE // -NOISE_RANGE to +NOISE_RANGE
}

/**
 * Determine where the ball goes (forehand or backhand) based on hitter's placement and play style
 */
function determineBallPosition(
  hitter: Player,
  isHitterForehand: boolean
): { isForehand: boolean; reason: string } {
  // Placement strategists are more likely to target opponent's weakness
  // Otherwise, placement stat influences where the ball goes
  const placementFactor = hitter.skills.placement / 100

  // Higher placement = more control over ball direction
  // Play style affects tendency
  let targetForehandChance = 0.5 // Default 50/50

  if (hitter.playStyle === PlayStyle.PLACEMENT_STRATEGIST) {
    // Placement strategists favor forehand targeting (exploiting backhand weakness)
    targetForehandChance = 0.6 + placementFactor * 0.2 // 60-80% chance
  } else {
    // Other play styles: higher placement = more likely to target forehand (safer)
    targetForehandChance = 0.4 + placementFactor * 0.3 // 40-70% chance
  }

  const isForehand = Math.random() < targetForehandChance

  return {
    isForehand,
    reason: isForehand ? 'forehand' : 'backhand'
  }
}

/**
 * Generate human-friendly feedback explaining why a point was won or lost
 */
function generatePointFeedback(
  winner: number,
  winnerQuality: number,
  loserQuality: number,
  qualityDiff: number,
  winnerBreakdown: ShotQualityBreakdown | null,
  loserBreakdown: ShotQualityBreakdown | null,
  winnerName: string,
  loserName: string,
  wasError: boolean
): string {
  if (wasError) {
    return `${loserName} made an unforced error. ${loserName}'s consistency needs improvement to reduce these mistakes.`
  }

  const qualityGap = Math.abs(qualityDiff)

  if (qualityGap > 20) {
    // Large quality difference - decisive win
    if (qualityDiff > 0) {
      // Winner had much better shot
      const primaryStat = winnerBreakdown?.primaryStat || 'skill'
      const statValue = winnerBreakdown?.primaryStatValue || 50
      return `${winnerName} won with a decisive shot (quality ${Math.round(winnerQuality)} vs ${Math.round(loserQuality)}). ${winnerName}'s strong ${primaryStat} (${statValue}) was the key factor. ${loserName} struggled to handle the difficulty of the incoming ball.`
    } else {
      // Loser had much worse shot
      const primaryStat = loserBreakdown?.primaryStat || 'skill'
      const statValue = loserBreakdown?.primaryStatValue || 50
      return `${winnerName} won because ${loserName}'s return was too weak (quality ${Math.round(loserQuality)} vs ${Math.round(winnerQuality)}). ${loserName}'s ${primaryStat} (${statValue}) wasn't strong enough to handle the pressure.`
    }
  } else if (qualityGap > 10) {
    // Moderate quality difference
    if (qualityDiff > 0) {
      const primaryStat = winnerBreakdown?.primaryStat || 'skill'
      return `${winnerName} won with a solid shot (quality ${Math.round(winnerQuality)} vs ${Math.round(loserQuality)}). ${winnerName}'s ${primaryStat} gave them the edge.`
    } else {
      return `${winnerName} won as ${loserName}'s return quality (${Math.round(loserQuality)}) was insufficient against ${winnerName}'s shot (${Math.round(winnerQuality)}).`
    }
  } else {
    // Close quality difference - small margins
    if (Math.abs(qualityDiff) < 2) {
      // Essentially equal qualities - point decided by small margins or luck
      return `${winnerName} won a very close point (quality ${Math.round(winnerQuality)} vs ${Math.round(loserQuality)}). The point was decided by the smallest of margins - execution timing, positioning, or a bit of luck.`
    } else if (qualityDiff > 0) {
      return `${winnerName} won a close point (quality ${Math.round(winnerQuality)} vs ${Math.round(loserQuality)}). Small advantages in shot quality made the difference.`
    } else {
      return `${winnerName} won as ${loserName}'s return quality (${Math.round(loserQuality)}) was slightly insufficient against ${winnerName}'s shot (${Math.round(winnerQuality)}).`
    }
  }
}

/**
 * Calculate R1: Footwork vs Placement
 * R1 = Player B's footwork + noise - Player A's placement + noise
 * This is: (B_footwork + noise1) - (A_placement - noise2)
 * Which equals: B_footwork + noise1 - A_placement + noise2
 */
function calculateR1(
  playerB: Player,
  playerA: Player,
  r1Bonus: number = 0
): { r1: number; breakdown: { playerBFootwork: number; playerAPlacement: number; noise1: number; noise2: number; bonus: number } } {
  const playerBFootwork = playerB.skills.footwork
  const playerAPlacement = playerA.skills.placement
  const noise1 = generateNoise() // Noise for B's footwork
  const noise2 = generateNoise() // Noise for A's placement (positive because it's subtracted)

  // Higher R1 = B is doing better (B's footwork stronger, A's placement weaker)
  // Lower R1 = B is doing worse (B's footwork weaker, A's placement stronger)
  const r1 = playerBFootwork + noise1 - playerAPlacement + noise2 + r1Bonus

  return {
    r1,
    breakdown: {
      playerBFootwork,
      playerAPlacement,
      noise1,
      noise2,
      bonus: r1Bonus
    }
  }
}

/**
 * Calculate R2: Stroke + Spin vs Stroke + Spin
 * R2 = Weighted sum of B's stroke (forehand/backhand) and spin + noise - A's weighted sum + noise
 * This is: (B_weighted + noise1) - (A_weighted - noise2)
 * Which equals: B_weighted + noise1 - A_weighted + noise2
 */
function calculateR2(
  playerB: Player,
  playerA: Player,
  isForehand: boolean,
  playerBModifiers: { spinMultiplier: number; receiveMultiplier: number; consistencyMultiplier: number },
  playerAModifiers: { spinMultiplier: number; receiveMultiplier: number; consistencyMultiplier: number },
  r2Bonus: number = 0
): { r2: number; breakdown: { playerBStroke: number; playerBSpin: number; playerAStroke: number; playerASpin: number; noise1: number; noise2: number; bonus: number } } {
  // Weighted sum: 60% stroke, 40% spin
  const strokeWeight = 0.6
  const spinWeight = 0.4

  const playerBStroke = isForehand ? playerB.skills.forehand : playerB.skills.backhand
  const playerBSpin = playerB.skills.spin * playerBModifiers.spinMultiplier
  const playerBWeighted = playerBStroke * strokeWeight + playerBSpin * spinWeight

  const playerAStroke = isForehand ? playerA.skills.forehand : playerA.skills.backhand
  const playerASpin = playerA.skills.spin * playerAModifiers.spinMultiplier
  const playerAWeighted = playerAStroke * strokeWeight + playerASpin * spinWeight

  const noise1 = generateNoise() // Noise for B's stroke+spin
  const noise2 = generateNoise() // Noise for A's stroke+spin (positive because it's subtracted)

  // Higher R2 = B is doing better (B's stroke+spin stronger, A's stroke+spin weaker)
  // Lower R2 = B is doing worse (B's stroke+spin weaker, A's stroke+spin stronger)
  const r2 = playerBWeighted + noise1 - playerAWeighted + noise2 + r2Bonus

  return {
    r2,
    breakdown: {
      playerBStroke,
      playerBSpin,
      playerAStroke,
      playerASpin,
      noise1,
      noise2,
      bonus: r2Bonus
    }
  }
}

/**
 * Calculate R2 for service: Receive vs Serve
 * R2 = B's receive + noise - A's serve + noise
 * This is: (B_receive + noise1) - (A_serve - noise2)
 * Which equals: B_receive + noise1 - A_serve + noise2
 */
function calculateR2Serve(
  playerB: Player,
  playerA: Player,
  playerBModifiers: { spinMultiplier: number; receiveMultiplier: number; consistencyMultiplier: number },
  r2Bonus: number = 0
): { r2: number; breakdown: { playerBReceive: number; playerAServe: number; noise1: number; noise2: number; bonus: number } } {
  const playerBReceive = playerB.skills.receive * playerBModifiers.receiveMultiplier
  const playerAServe = playerA.skills.serve
  const noise1 = generateNoise() // Noise for B's receive
  const noise2 = generateNoise() // Noise for A's serve (positive because it's subtracted)

  // Higher R2 = B is doing better (B's receive stronger, A's serve weaker)
  // Lower R2 = B is doing worse (B's receive weaker, A's serve stronger)
  const r2 = playerBReceive + noise1 - playerAServe + noise2 + r2Bonus

  return {
    r2,
    breakdown: {
      playerBReceive,
      playerAServe,
      noise1,
      noise2,
      bonus: r2Bonus
    }
  }
}

/**
 * Check if point is lost based on R1 and R2
 * Returns true if point is lost, false otherwise
 */
function checkPointLoss(r1: number, r2: number): { lost: boolean; reason: string | null } {
  if (r1 < -15) {
    return { lost: true, reason: 'R1 < -15 (footwork/placement deficit too large)' }
  }
  if (r2 < -15) {
    return { lost: true, reason: 'R2 < -15 (stroke/spin deficit too large)' }
  }
  if (r1 + r2 < -20) {
    return { lost: true, reason: 'R1 + R2 < -20 (combined deficit too large)' }
  }
  return { lost: false, reason: null }
}

/**
 * Check if point is won based on R1 and R2
 * Returns true if point is won, false otherwise
 * Strong shots (high positive R1 or R2, or combined) can win the point
 */
function checkPointWin(r1: number, r2: number, rallyLength: number): { won: boolean; reason: string | null } {
  // Very strong individual stats can win immediately
  if (r1 > 30) {
    return { won: true, reason: 'R1 > 30 (superior footwork/placement)' }
  }
  if (r2 > 30) {
    return { won: true, reason: 'R2 > 30 (superior stroke/spin)' }
  }

  // Very strong combined performance
  if (r1 + r2 > 40) {
    return { won: true, reason: 'R1 + R2 > 40 (overwhelming advantage)' }
  }

  // Strong shots have a chance to win based on quality difference
  // Probability increases with better R1+R2, decreases with rally length
  if (r1 + r2 > 20) {
    const winChance = 0.2 + (r1 + r2 - 20) / 100 // 20% base, up to 50% at R1+R2=50
    const rallyPenalty = Math.min(0.15, rallyLength * 0.01) // Penalty for long rallies
    const adjustedChance = Math.max(0.05, winChance - rallyPenalty)

    if (Math.random() < adjustedChance) {
      return { won: true, reason: 'Strong shot quality wins the point' }
    }
  }

  // Moderate advantage: lower chance
  if (r1 + r2 > 10) {
    const winChance = 0.1 + (r1 + r2 - 10) / 150 // 10% base, up to ~27% at R1+R2=25
    const rallyPenalty = Math.min(0.1, rallyLength * 0.01)
    const adjustedChance = Math.max(0.02, winChance - rallyPenalty)

    if (Math.random() < adjustedChance) {
      return { won: true, reason: 'Good shot quality wins the point' }
    }
  }

  return { won: false, reason: null }
}

/**
 * Simulate a single rally using new R1/R2 mechanics
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
  let rallyLength = 0
  let cumulativeR1R2Bonus = 0 // Track (R1+R2)/2 bonus/penalty to apply to next shot

  // Serve: Player A serves to Player B
  const server = currentPlayer === 0 ? player1 : player2
  const receiver = currentPlayer === 0 ? player2 : player1
  const serverModifiers = getEquipmentModifiers(server.forehandRubber)
  const receiverModifiers = getEquipmentModifiers(receiver.forehandRubber)

  // Consistency check before serve
  const serveConsistencyRatio = server.skills.consistency / 100
  const serveErrorChance = Math.pow(1 - serveConsistencyRatio, 2) * 0.1 // Max 10% error chance
  const serveQualityPenalty = (1 - server.skills.serve / 100) * 0.05 // Up to 5% additional
  const totalServeErrorChance = Math.min(0.15, serveErrorChance + serveQualityPenalty)

  if (Math.random() < totalServeErrorChance) {
    const serverName = server.shortName || server.firstName
    const receiverName = receiver.shortName || receiver.firstName
    events.push({
      type: 'error',
      player: currentPlayer,
      description: `${serverName} serves out`,
      timestamp: Date.now()
    })
    events.push({
      type: 'point',
      player: 1 - currentPlayer,
      description: `${receiverName} wins the point (serve error)`,
      timestamp: Date.now()
    })
    return {
      winner: 1 - currentPlayer,
      events,
      newPositions: positions
    }
  }

  // Check for lucky bounce on serve
  const serveLucky = checkLuckyBounce(server.skills.serve)
  // Lucky bounce effects: net makes placement better (harder footwork) but slower/less spin (easier receive)
  // Edge makes placement better only
  const serveR1Penalty = serveLucky.occurred ? -serveLucky.r1Bonus : 0 // Makes receiver's R1 worse (harder placement)
  const serveR2BonusForReceiver = serveLucky.occurred ? -serveLucky.r2Bonus : 0 // Makes receiver's R2 better (easier receive)
  if (serveLucky.occurred) {
    events.push({
      type: 'lucky_bounce',
      player: currentPlayer,
      description: `${server.shortName || server.firstName} gets a lucky ${serveLucky.type} bounce on serve!`,
      timestamp: Date.now()
    })
  }

  events.push({
    type: 'serve',
    player: currentPlayer,
    description: `${server.shortName || server.firstName} serves`,
    timestamp: Date.now()
  })

  // Calculate R1 and R2 for serve receive
  // For service: use serve/receive stats
  // Lucky bounce: better placement (harder footwork) but net bounce = slower serve (easier receive)
  const serveR1Result = calculateR1(receiver, server, serveR1Penalty)
  const serveR2Result = calculateR2Serve(receiver, server, receiverModifiers, serveR2BonusForReceiver)

  const serveR1 = serveR1Result.r1
  const serveR2 = serveR2Result.r2

  // Check if receiver loses point on serve return
  const serveLossCheck = checkPointLoss(serveR1, serveR2)
  if (serveLossCheck.lost) {
    const serverName = server.shortName || server.firstName
    const receiverName = receiver.shortName || receiver.firstName
    events.push({
      type: 'point',
      player: currentPlayer,
      description: `${serverName} wins the point (${serveLossCheck.reason})`,
      timestamp: Date.now()
    })
    return {
      winner: currentPlayer,
      events,
      newPositions: positions
    }
  }

  // Check if receiver wins point on serve return (strong return)
  const serveWinCheck = checkPointWin(serveR1, serveR2, rallyLength)
  if (serveWinCheck.won) {
    const serverName = server.shortName || server.firstName
    const receiverName = receiver.shortName || receiver.firstName
    events.push({
      type: 'point',
      player: 1 - currentPlayer,
      description: `${receiverName} wins the point (${serveWinCheck.reason})`,
      timestamp: Date.now()
    })
    return {
      winner: 1 - currentPlayer,
      events,
      newPositions: positions
    }
  }

  // Consistency check on receiver's return
  const receiveConsistencyRatio = receiver.skills.consistency / 100
  const receiveErrorChance = Math.pow(1 - receiveConsistencyRatio, 2) * 0.15 // Max 15% error chance
  const receiveQualityPenalty = (1 - (serveR1 + serveR2) / 200) * 0.1 // Penalty based on poor R1/R2
  const totalReceiveErrorChance = Math.min(0.25, receiveErrorChance + receiveQualityPenalty)

  if (Math.random() < totalReceiveErrorChance) {
    const serverName = server.shortName || server.firstName
    const receiverName = receiver.shortName || receiver.firstName
    events.push({
      type: 'error',
      player: 1 - currentPlayer,
      description: `${receiverName} returns the ball out`,
      timestamp: Date.now()
    })
    events.push({
      type: 'point',
      player: currentPlayer,
      description: `${serverName} wins the point (receive error)`,
      timestamp: Date.now()
    })
    return {
      winner: currentPlayer,
      events,
      newPositions: positions
    }
  }

  // Calculate cumulative bonus for next shot: (R1+R2)/2
  cumulativeR1R2Bonus = (serveR1 + serveR2) / 2

  events.push({
    type: 'return',
    player: 1 - currentPlayer,
    description: `${receiver.shortName || receiver.firstName} returns (R1: ${Math.round(serveR1)}, R2: ${Math.round(serveR2)})`,
    timestamp: Date.now()
  })

  // Switch to receiver (now they become the hitter)
  currentPlayer = 1 - currentPlayer
  rallyLength++

  // Rally loop: Each shot follows the same pattern
  let pointWon = false
  while (!pointWon) {
    const hitter = currentPlayer === 0 ? player1 : player2
    const opponent = currentPlayer === 0 ? player2 : player1
    const hitterModifiers = getEquipmentModifiers(
      hitter.forehandBackhandTendency === FavourStyle.HEAVILY_FOREHAND ||
        hitter.forehandBackhandTendency === FavourStyle.SLIGHTLY_FOREHAND
        ? hitter.forehandRubber
        : hitter.backhandRubber
    )
    const opponentModifiers = getEquipmentModifiers(
      opponent.forehandRubber
    )

    // Consistency check before hit
    const hitterConsistencyRatio = hitter.skills.consistency / 100
    const hitterErrorChance = Math.pow(1 - hitterConsistencyRatio, 2) * 0.15 // Max 15% error chance
    const bonusPenalty = (1 - cumulativeR1R2Bonus / 50) * 0.05 // Penalty if previous shot was poor
    const totalHitterErrorChance = Math.min(0.25, hitterErrorChance + bonusPenalty)

    if (Math.random() < totalHitterErrorChance) {
      const hitterName = hitter.shortName || hitter.firstName
      const opponentName = opponent.shortName || opponent.firstName
      events.push({
        type: 'error',
        player: currentPlayer,
        description: `${hitterName} hits the ball out`,
        timestamp: Date.now()
      })
      events.push({
        type: 'point',
        player: 1 - currentPlayer,
        description: `${opponentName} wins the point (error)`,
        timestamp: Date.now()
      })
      return {
        winner: 1 - currentPlayer,
        events,
        newPositions: positions
      }
    }

    // Determine where the ball goes based on opponent's placement
    // The opponent just hit the ball, so determine where it goes to the hitter
    const ballPosition = determineBallPosition(opponent, true) // Assume opponent used forehand
    const isHitterForehand = ballPosition.isForehand

    // Check for lucky bounce on opponent's shot
    // The opponent just hit the ball, so check if they got a lucky bounce
    const opponentStroke = isHitterForehand ? opponent.skills.forehand : opponent.skills.backhand
    const opponentWeightedStroke = opponentStroke * 0.6 + opponent.skills.spin * opponentModifiers.spinMultiplier * 0.4
    const lucky = checkLuckyBounce(opponentWeightedStroke)

    // Lucky bounce effects on returner's R1/R2:
    // Net bounce: Better placement (harder footwork) but slower/less spin (easier to counter)
    // - R1: Placement improves → subtract from returner's R1 (harder to return) → r1Penalty = -10
    // - R2: Spin/speed reduces → add to returner's R2 (easier to counter) → r2Bonus = +5
    // Edge bounce: Better placement only, no spin change
    // - R1: Placement improves → subtract from returner's R1 (harder to return) → r1Penalty = -30
    // - R2: No change to spin/speed → r2Bonus = 0
    // Note: r1Bonus/r2Bonus from checkLuckyBounce represent benefits to the hitter
    // We apply the opposite effect to the returner's calculations
    const r1Penalty = lucky.occurred ? -lucky.r1Bonus : 0 // Makes returner's R1 worse (harder placement)
    const r2BonusForReturner = lucky.occurred ? -lucky.r2Bonus : 0 // Makes returner's R2 better (less spin/speed)

    if (lucky.occurred) {
      events.push({
        type: 'lucky_bounce',
        player: 1 - currentPlayer,
        description: `${opponent.shortName || opponent.firstName} gets a lucky ${lucky.type} bounce!`,
        timestamp: Date.now()
      })
    }

    // Calculate R1: Hitter's footwork vs Opponent's placement + cumulative bonus + lucky bounce effect
    // Lucky bounce makes opponent's placement better → subtracts from hitter's R1 (harder to return)
    const r1Result = calculateR1(hitter, opponent, cumulativeR1R2Bonus + r1Penalty)
    const r1 = r1Result.r1

    // Calculate R2: Hitter's stroke+spin vs Opponent's stroke+spin + cumulative bonus + lucky bounce effect
    // Net bounce makes opponent's shot slower/less spin → adds to hitter's R2 (easier to counter)
    const r2Result = calculateR2(
      hitter,
      opponent,
      isHitterForehand,
      hitterModifiers,
      opponentModifiers,
      cumulativeR1R2Bonus + r2BonusForReturner
    )
    const r2 = r2Result.r2

    // Check if hitter loses point
    const lossCheck = checkPointLoss(r1, r2)
    if (lossCheck.lost) {
      const hitterName = hitter.shortName || hitter.firstName
      const opponentName = opponent.shortName || opponent.firstName
      events.push({
        type: 'point',
        player: 1 - currentPlayer,
        description: `${opponentName} wins the point (${lossCheck.reason})`,
        timestamp: Date.now()
      })
      return {
        winner: 1 - currentPlayer,
        events,
        newPositions: positions
      }
    }

    // Check if hitter wins point (strong shot)
    const winCheck = checkPointWin(r1, r2, rallyLength)
    if (winCheck.won) {
      const hitterName = hitter.shortName || hitter.firstName
      const opponentName = opponent.shortName || opponent.firstName
      events.push({
        type: 'point',
        player: currentPlayer,
        description: `${hitterName} wins the point (${winCheck.reason})`,
        timestamp: Date.now()
      })
      return {
        winner: currentPlayer,
        events,
        newPositions: positions
      }
    }

    // Consistency check on hitter's return
    const returnConsistencyRatio = hitter.skills.consistency / 100
    const returnErrorChance = Math.pow(1 - returnConsistencyRatio, 2) * 0.15
    const returnQualityPenalty = (1 - (r1 + r2) / 200) * 0.1
    const totalReturnErrorChance = Math.min(0.25, returnErrorChance + returnQualityPenalty)

    if (Math.random() < totalReturnErrorChance) {
      const hitterName = hitter.shortName || hitter.firstName
      const opponentName = opponent.shortName || opponent.firstName
      events.push({
        type: 'error',
        player: currentPlayer,
        description: `${hitterName} hits the ball out`,
        timestamp: Date.now()
      })
      events.push({
        type: 'point',
        player: 1 - currentPlayer,
        description: `${opponentName} wins the point (error)`,
        timestamp: Date.now()
      })
      return {
        winner: 1 - currentPlayer,
        events,
        newPositions: positions
      }
    }

    // Calculate cumulative bonus for next shot: (R1+R2)/2
    cumulativeR1R2Bonus = (r1 + r2) / 2

    events.push({
      type: 'return',
      player: currentPlayer,
      description: `${hitter.shortName || hitter.firstName} returns (R1: ${Math.round(r1)}, R2: ${Math.round(r2)})`,
      timestamp: Date.now()
    })

    // Switch players
    currentPlayer = 1 - currentPlayer
    rallyLength++

    // Prevent infinite loops (safety check)
    if (rallyLength > 50) {
      // Long rally - decide randomly
      const winner = Math.random() > 0.5 ? currentPlayer : 1 - currentPlayer
      events.push({
        type: 'point',
        player: winner,
        description: `Point won after long rally`,
        timestamp: Date.now()
      })
      return {
        winner,
        events,
        newPositions: positions
      }
    }
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
