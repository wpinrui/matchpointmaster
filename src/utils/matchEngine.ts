import { FavourStyle, Player, PlayStyle, RubberType } from '../services/savegame/types'

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
 * Reduced from 10 to 8 to make stats matter more relative to variance
 */
const NOISE_RANGE = 8 // ±8 points of noise

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
 * Calculate R1: Footwork vs Placement
 * R1 = Player B's footwork + noise - Player A's placement + noise + consistency bonus
 * This is: (B_footwork + noise1) - (A_placement - noise2) + consistency
 * Which equals: B_footwork + noise1 - A_placement + noise2 + consistency_bonus
 */
function calculateR1(
  playerB: Player,
  playerA: Player,
  r1Bonus: number = 0
): {
  r1: number
  breakdown: {
    playerBFootwork: number
    playerAPlacement: number
    noise1: number
    noise2: number
    bonus: number
  }
} {
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
 * Calculate R1 for serve: Footwork vs Serve
 * R1 = B's footwork + noise - A's serve + noise
 * This is: (B_footwork + noise1) - (A_serve - noise2)
 * Which equals: B_footwork + noise1 - A_serve + noise2
 * For serve, we use serve stat instead of placement because serve affects placement difficulty
 */
function calculateR1Serve(
  playerB: Player,
  playerA: Player,
  r1Bonus: number = 0
): {
  r1: number
  breakdown: {
    playerBFootwork: number
    playerAServe: number
    noise1: number
    noise2: number
    bonus: number
  }
} {
  const playerBFootwork = playerB.skills.footwork
  const playerAServe = playerA.skills.serve
  const noise1 = generateNoise() // Noise for B's footwork
  const noise2 = generateNoise() // Noise for A's serve (positive because it's subtracted)

  // Higher R1 = B is doing better (B's footwork stronger, A's serve weaker)
  // Lower R1 = B is doing worse (B's footwork weaker, A's serve stronger)
  const r1 = playerBFootwork + noise1 - playerAServe + noise2 + r1Bonus

  return {
    r1,
    breakdown: {
      playerBFootwork,
      playerAServe,
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
  playerBModifiers: {
    spinMultiplier: number
    receiveMultiplier: number
    consistencyMultiplier: number
  },
  playerAModifiers: {
    spinMultiplier: number
    receiveMultiplier: number
    consistencyMultiplier: number
  },
  r2Bonus: number = 0
): {
  r2: number
  breakdown: {
    playerBStroke: number
    playerBSpin: number
    playerAStroke: number
    playerASpin: number
    noise1: number
    noise2: number
    bonus: number
  }
} {
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
  playerBModifiers: {
    spinMultiplier: number
    receiveMultiplier: number
    consistencyMultiplier: number
  },
  r2Bonus: number = 0
): {
  r2: number
  breakdown: {
    playerBReceive: number
    playerAServe: number
    noise1: number
    noise2: number
    bonus: number
  }
} {
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
 * Calculate loss probability based on R1 value using a curved function
 * Uses sigmoid-like curve: probability increases smoothly as R1 becomes more negative
 *
 * Extremely steep probability curve to balance footwork dominance and boost placement/serve:
 * - R1 = 0: ~0% loss chance (baseline)
 * - R1 = -5: ~11% loss chance
 * - R1 = -10: ~27% loss chance
 * - R1 = -15: ~46% loss chance
 * - R1 = -20: ~66% loss chance
 * - R1 = -25: ~82% loss chance
 * - R1 = -30: ~92% loss chance
 */
function calculateR1LossProbability(r1: number): number {
  if (r1 >= 0) return 0 // No loss chance if R1 is positive or neutral

  // Much steeper exponential curve: probability increases quickly as R1 becomes negative
  // Using: P = 1 - exp(r1 / steepness) where steeper = more impactful
  const steepness = -6 // Extremely steep curve - makes deficits devastating
  const probability = 1 - Math.exp(r1 / steepness)

  // Cap at 95% maximum (always leave small chance to recover)
  return Math.min(0.95, Math.max(0, probability))
}

/**
 * Calculate loss probability based on R2 value using a curved function
 * Same curve shape as R1
 */
function calculateR2LossProbability(r2: number): number {
  if (r2 >= 0) return 0

  const steepness = -6 // Same steepness as R1 for consistency
  const probability = 1 - Math.exp(r2 / steepness)
  return Math.min(0.95, Math.max(0, probability))
}

/**
 * Calculate loss probability based on combined R1+R2 value
 * Combined deficit uses a gentler curve to allow more rallies
 */
function calculateCombinedLossProbability(combined: number): number {
  if (combined >= 0) return 0

  // Slightly gentler curve for combined deficit (allows more rallies when one stat is okay)
  const steepness = -12 // Less steep than individual stats, but still impactful
  const probability = 1 - Math.exp(combined / steepness)
  return Math.min(0.95, Math.max(0, probability))
}

/**
 * Check if point is lost based on R1 and R2 using curved probabilities
 * Returns true if point is lost, false otherwise
 */
function checkPointLoss(
  r1: number,
  r2: number,
  r1Breakdown?: {
    playerBFootwork?: number
    playerAPlacement?: number
    playerAServe?: number
    noise1?: number
    noise2?: number
    bonus?: number
  },
  r2Breakdown?: {
    playerBStroke?: number
    playerBSpin?: number
    playerAStroke?: number
    playerASpin?: number
    playerBReceive?: number
    playerAServe?: number
    noise1?: number
    noise2?: number
    bonus?: number
  },
  isServe: boolean = false
): { lost: boolean; reason: string | null } {
  // Calculate individual probabilities
  const r1LossProb = calculateR1LossProbability(r1)
  const r2LossProb = calculateR2LossProbability(r2)
  const combinedLossProb = calculateCombinedLossProbability(r1 + r2)

  // Combine probabilities: use the maximum (worst deficit determines risk)
  // This ensures that severe deficits in any area create significant risk
  // Note: We could also use combined probability formula, but max is simpler and more intuitive
  const maxLossProb = Math.max(r1LossProb, r2LossProb, combinedLossProb)

  // Roll for loss
  if (Math.random() < maxLossProb) {
    // Generate specific commentary based on which deficit caused the loss
    let reason: string

    if (combinedLossProb >= r1LossProb && combinedLossProb >= r2LossProb) {
      // Combined deficit - analyze both
      const r1Cause = analyzeR1LossCause(r1, r1Breakdown, isServe)
      const r2Cause = analyzeR2LossCause(r2, r2Breakdown, isServe)
      reason = `lost to ${r1Cause} and ${r2Cause}`
    } else if (r1LossProb >= r2LossProb) {
      // R1 deficit
      const cause = analyzeR1LossCause(r1, r1Breakdown, isServe)
      reason = `lost to ${cause}`
    } else {
      // R2 deficit
      const cause = analyzeR2LossCause(r2, r2Breakdown, isServe)
      reason = `lost to ${cause}`
    }

    return { lost: true, reason }
  }

  return { lost: false, reason: null }
}

/**
 * Analyze what caused R1 loss - determine which stat was dominant
 */
function analyzeR1LossCause(
  r1: number,
  breakdown?: {
    playerBFootwork?: number
    playerAPlacement?: number
    playerAServe?: number
    noise1?: number
    noise2?: number
    bonus?: number
  },
  isServe: boolean = false
): string {
  if (!breakdown) {
    return isServe ? "opponent's serve" : "opponent's placement"
  }

  if (isServe && breakdown.playerAServe) {
    // For serve: opponent's serve vs my footwork
    const serveAdvantage = breakdown.playerAServe - (breakdown.playerBFootwork || 0)
    if (serveAdvantage > 10) {
      return "opponent's powerful serve"
    } else if (serveAdvantage > 5) {
      return "opponent's strong serve"
    } else {
      return "opponent's serve (my poor footwork)"
    }
  } else if (breakdown.playerAPlacement) {
    // For rally: opponent's placement vs my footwork
    const placementAdvantage =
      breakdown.playerAPlacement - (breakdown.playerBFootwork || 0)
    if (placementAdvantage > 10) {
      return "opponent's excellent placement"
    } else if (placementAdvantage > 5) {
      return "opponent's good placement"
    } else {
      return "opponent's placement (my poor footwork)"
    }
  }

  return isServe ? "opponent's serve" : "opponent's placement"
}

/**
 * Analyze what caused R2 loss - determine which stat was dominant
 */
function analyzeR2LossCause(
  r2: number,
  breakdown?: {
    playerBStroke?: number
    playerBSpin?: number
    playerAStroke?: number
    playerASpin?: number
    playerBReceive?: number
    playerAServe?: number
    noise1?: number
    noise2?: number
    bonus?: number
  },
  isServe: boolean = false
): string {
  if (!breakdown) {
    return isServe ? "opponent's serve" : "opponent's stroke/spin"
  }

  if (isServe && breakdown.playerAServe && breakdown.playerBReceive) {
    // For serve: opponent's serve vs my receive
    const serveAdvantage = breakdown.playerAServe - breakdown.playerBReceive
    if (serveAdvantage > 10) {
      return "opponent's powerful serve"
    } else if (serveAdvantage > 5) {
      return "opponent's strong serve"
    } else {
      return "opponent's serve (my poor receive)"
    }
  } else if (breakdown.playerAStroke && breakdown.playerASpin) {
    // For rally: opponent's stroke/spin vs mine
    const opponentWeighted = breakdown.playerAStroke * 0.6 + breakdown.playerASpin * 0.4
    const myWeighted =
      (breakdown.playerBStroke || 0) * 0.6 + (breakdown.playerBSpin || 0) * 0.4
    const advantage = opponentWeighted - myWeighted

    // Determine which aspect was stronger
    const strokeAdvantage =
      (breakdown.playerAStroke || 0) - (breakdown.playerBStroke || 0)
    const spinAdvantage = (breakdown.playerASpin || 0) - (breakdown.playerBSpin || 0)

    if (advantage > 10) {
      if (Math.abs(strokeAdvantage) > Math.abs(spinAdvantage)) {
        return `opponent's powerful ${breakdown.playerAStroke > 50 ? 'forehand' : 'backhand'}`
      } else {
        return "opponent's heavy spin"
      }
    } else if (advantage > 5) {
      if (Math.abs(strokeAdvantage) > Math.abs(spinAdvantage)) {
        return `opponent's strong ${breakdown.playerAStroke > 50 ? 'forehand' : 'backhand'}`
      } else {
        return "opponent's strong spin"
      }
    } else {
      return "opponent's stroke/spin (my weakness)"
    }
  }

  return isServe ? "opponent's serve" : "opponent's stroke/spin"
}

/**
 * Check if point is won based on R1 and R2
 * Returns true if point is won, false otherwise
 * Strong shots (high positive R1 or R2, or combined) can win the point
 */
function checkPointWin(
  r1: number,
  r2: number,
  rallyLength: number,
  r1Breakdown?: {
    playerBFootwork?: number
    playerAPlacement?: number
    playerAServe?: number
    noise1?: number
    noise2?: number
    bonus?: number
  },
  r2Breakdown?: {
    playerBStroke?: number
    playerBSpin?: number
    playerAStroke?: number
    playerASpin?: number
    playerBReceive?: number
    playerAServe?: number
    noise1?: number
    noise2?: number
    bonus?: number
  },
  isServe: boolean = false
): { won: boolean; reason: string | null } {
  // Very strong individual stats can win immediately
  if (r1 > 30) {
    const cause = analyzeR1WinCause(r1, r1Breakdown, isServe)
    return { won: true, reason: `overwhelming advantage through ${cause}` }
  }
  if (r2 > 30) {
    const cause = analyzeR2WinCause(r2, r2Breakdown, isServe)
    return { won: true, reason: `overwhelming advantage through ${cause}` }
  }

  // Very strong combined performance
  if (r1 + r2 > 40) {
    const r1Cause = analyzeR1WinCause(r1, r1Breakdown, isServe)
    const r2Cause = analyzeR2WinCause(r2, r2Breakdown, isServe)
    return { won: true, reason: `overwhelming advantage (${r1Cause} and ${r2Cause})` }
  }

  // Strong shots have a chance to win based on quality difference
  // Probability increases with better R1+R2, decreases with rally length
  if (r1 + r2 > 20) {
    const winChance = 0.2 + (r1 + r2 - 20) / 100 // 20% base, up to 50% at R1+R2=50
    const rallyPenalty = Math.min(0.15, rallyLength * 0.01) // Penalty for long rallies
    const adjustedChance = Math.max(0.05, winChance - rallyPenalty)

    if (Math.random() < adjustedChance) {
      const r1Cause = analyzeR1WinCause(r1, r1Breakdown, isServe)
      const r2Cause = analyzeR2WinCause(r2, r2Breakdown, isServe)
      // Determine primary cause
      const primaryCause = r1 > r2 ? r1Cause : r2Cause
      return { won: true, reason: `won with strong ${primaryCause}` }
    }
  }

  // Moderate advantage: lower chance
  if (r1 + r2 > 10) {
    const winChance = 0.1 + (r1 + r2 - 10) / 150 // 10% base, up to ~27% at R1+R2=25
    const rallyPenalty = Math.min(0.1, rallyLength * 0.01)
    const adjustedChance = Math.max(0.02, winChance - rallyPenalty)

    if (Math.random() < adjustedChance) {
      const r1Cause = analyzeR1WinCause(r1, r1Breakdown, isServe)
      const r2Cause = analyzeR2WinCause(r2, r2Breakdown, isServe)
      const primaryCause = r1 > r2 ? r1Cause : r2Cause
      return { won: true, reason: `won with good ${primaryCause}` }
    }
  }

  return { won: false, reason: null }
}

/**
 * Analyze what caused R1 win - determine which stat was dominant
 */
function analyzeR1WinCause(
  r1: number,
  breakdown?: {
    playerBFootwork?: number
    playerAPlacement?: number
    playerAServe?: number
    noise1?: number
    noise2?: number
    bonus?: number
  },
  isServe: boolean = false
): string {
  if (!breakdown) {
    return isServe ? 'powerful serve' : 'excellent placement'
  }

  if (isServe && breakdown.playerAServe) {
    // For serve: my serve vs opponent's footwork
    const serveAdvantage = breakdown.playerAServe - (breakdown.playerBFootwork || 0)
    if (serveAdvantage > 10) {
      return 'powerful serve'
    } else if (serveAdvantage > 5) {
      return 'strong serve'
    } else {
      return "serve (opponent's poor footwork)"
    }
  } else if (breakdown.playerAPlacement) {
    // For rally: my placement vs opponent's footwork
    const placementAdvantage =
      breakdown.playerAPlacement - (breakdown.playerBFootwork || 0)
    if (placementAdvantage > 10) {
      return 'excellent placement'
    } else if (placementAdvantage > 5) {
      return 'good placement'
    } else {
      return "placement (opponent's poor footwork)"
    }
  } else if (breakdown.playerBFootwork) {
    // My superior footwork
    return 'superior footwork'
  }

  return isServe ? 'serve' : 'placement'
}

/**
 * Analyze what caused R2 win - determine which stat was dominant
 */
function analyzeR2WinCause(
  r2: number,
  breakdown?: {
    playerBStroke?: number
    playerBSpin?: number
    playerAStroke?: number
    playerASpin?: number
    playerBReceive?: number
    playerAServe?: number
    noise1?: number
    noise2?: number
    bonus?: number
  },
  isServe: boolean = false
): string {
  if (!breakdown) {
    return isServe ? 'powerful serve' : 'powerful stroke'
  }

  if (isServe && breakdown.playerAServe && breakdown.playerBReceive) {
    // For serve: my serve vs opponent's receive
    const serveAdvantage = breakdown.playerAServe - breakdown.playerBReceive
    if (serveAdvantage > 10) {
      return 'powerful serve'
    } else if (serveAdvantage > 5) {
      return 'strong serve'
    } else {
      return "serve (opponent's poor receive)"
    }
  } else if (breakdown.playerBStroke && breakdown.playerBSpin) {
    // For rally: my stroke/spin vs opponent's
    const myWeighted = breakdown.playerBStroke * 0.6 + breakdown.playerBSpin * 0.4
    const opponentWeighted =
      (breakdown.playerAStroke || 0) * 0.6 + (breakdown.playerASpin || 0) * 0.4
    const advantage = myWeighted - opponentWeighted

    // Determine which aspect was stronger
    const strokeAdvantage =
      (breakdown.playerBStroke || 0) - (breakdown.playerAStroke || 0)
    const spinAdvantage = (breakdown.playerBSpin || 0) - (breakdown.playerASpin || 0)

    if (advantage > 10) {
      if (Math.abs(strokeAdvantage) > Math.abs(spinAdvantage)) {
        return `powerful ${breakdown.playerBStroke > 50 ? 'forehand' : 'backhand'}`
      } else {
        return 'heavy spin'
      }
    } else if (advantage > 5) {
      if (Math.abs(strokeAdvantage) > Math.abs(spinAdvantage)) {
        return `strong ${breakdown.playerBStroke > 50 ? 'forehand' : 'backhand'}`
      } else {
        return 'strong spin'
      }
    } else {
      return `${breakdown.playerBStroke > 50 ? 'forehand' : 'backhand'}/spin (opponent's weakness)`
    }
  } else if (breakdown.playerBReceive) {
    // My superior receive
    return 'superior receive'
  }

  return isServe ? 'serve' : 'stroke/spin'
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
  const serveErrorChance = Math.pow(1 - serveConsistencyRatio, 2) * 0.08 // Max 8% error chance (tuned down from 10%)
  const serveQualityPenalty = (1 - server.skills.serve / 100) * 0.04 // Up to 4% additional (tuned down from 5%)
  const totalServeErrorChance = Math.min(0.12, serveErrorChance + serveQualityPenalty) // Capped at 12% (down from 15%)

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
  // For service: use serve/receive stats for both R1 and R2
  // R1 uses serve stat (placement difficulty), R2 uses serve stat (speed/spin)
  // Lucky bounce: better placement (harder footwork) but net bounce = slower serve (easier receive)
  const serveR1Result = calculateR1Serve(receiver, server, serveR1Penalty)
  const serveR2Result = calculateR2Serve(
    receiver,
    server,
    receiverModifiers,
    serveR2BonusForReceiver
  )

  const serveR1 = serveR1Result.r1
  const serveR2 = serveR2Result.r2

  // No need to log return attempts - only log point wins/losses

  // Check if receiver loses point on serve return (service ace)
  const serveLossCheck = checkPointLoss(
    serveR1,
    serveR2,
    serveR1Result.breakdown,
    serveR2Result.breakdown,
    true
  )
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

  // Consistency check on receiver's return
  const receiveConsistencyRatio = receiver.skills.consistency / 100
  const receiveErrorChance = Math.pow(1 - receiveConsistencyRatio, 2) * 0.12 // Max 12% error chance (tuned down from 15%)
  const receiveQualityPenalty = (1 - (serveR1 + serveR2) / 200) * 0.08 // Penalty based on poor R1/R2 (tuned down from 10%)
  const totalReceiveErrorChance = Math.min(
    0.2,
    receiveErrorChance + receiveQualityPenalty
  ) // Capped at 20% (down from 25%)

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

  // Check if receiver wins point on serve return (strong return) - after consistency check
  const serveWinCheck = checkPointWin(
    serveR1,
    serveR2,
    rallyLength,
    serveR1Result.breakdown,
    serveR2Result.breakdown,
    true
  )
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

  // Calculate cumulative bonus for next shot: (R1+R2)/2
  cumulativeR1R2Bonus = (serveR1 + serveR2) / 2

  // Switch to receiver (now they become the hitter)
  currentPlayer = 1 - currentPlayer
  rallyLength++

  // Rally loop: Each shot follows the same pattern
  const pointWon = false
  while (!pointWon) {
    const hitter = currentPlayer === 0 ? player1 : player2
    const opponent = currentPlayer === 0 ? player2 : player1
    const hitterModifiers = getEquipmentModifiers(
      hitter.forehandBackhandTendency === FavourStyle.HEAVILY_FOREHAND ||
        hitter.forehandBackhandTendency === FavourStyle.SLIGHTLY_FOREHAND
        ? hitter.forehandRubber
        : hitter.backhandRubber
    )
    const opponentModifiers = getEquipmentModifiers(opponent.forehandRubber)

    // Consistency check before hit
    const hitterConsistencyRatio = hitter.skills.consistency / 100
    const hitterErrorChance = Math.pow(1 - hitterConsistencyRatio, 2) * 0.12 // Max 12% error chance (tuned down from 15%)
    const bonusPenalty = (1 - cumulativeR1R2Bonus / 50) * 0.04 // Penalty if previous shot was poor (tuned down from 5%)
    const totalHitterErrorChance = Math.min(0.2, hitterErrorChance + bonusPenalty) // Capped at 20% (down from 25%)

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
    const opponentStroke = isHitterForehand
      ? opponent.skills.forehand
      : opponent.skills.backhand
    const opponentWeightedStroke =
      opponentStroke * 0.6 + opponent.skills.spin * opponentModifiers.spinMultiplier * 0.4
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
    const lossCheck = checkPointLoss(
      r1,
      r2,
      r1Result.breakdown,
      r2Result.breakdown,
      false
    )
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
    const winCheck = checkPointWin(
      r1,
      r2,
      rallyLength,
      r1Result.breakdown,
      r2Result.breakdown,
      false
    )
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
    const returnErrorChance = Math.pow(1 - returnConsistencyRatio, 2) * 0.12 // Tuned down from 15%
    const returnQualityPenalty = (1 - (r1 + r2) / 200) * 0.08 // Tuned down from 10%
    const totalReturnErrorChance = Math.min(0.2, returnErrorChance + returnQualityPenalty) // Capped at 20% (down from 25%)

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

    // No need to log return attempts - only log point wins/losses

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
