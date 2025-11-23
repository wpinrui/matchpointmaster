/**
 * Calculation functions for match engine (R1, R2, probabilities)
 */
import { Player } from '../../services/savegame/types'
import { generateNoise } from './matchHelpers'

/**
 * Calculate R1: Footwork vs Placement
 * R1 = Player B's footwork + noise - Player A's placement + noise + consistency bonus
 * This is: (B_footwork + noise1) - (A_placement - noise2) + consistency
 * Which equals: B_footwork + noise1 - A_placement + noise2 + consistency_bonus
 */
export function calculateR1(
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
export function calculateR1Serve(
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
export function calculateR2(
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
export function calculateR2Serve(
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
export function calculateR1LossProbability(r1: number): number {
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
export function calculateR2LossProbability(r2: number): number {
  if (r2 >= 0) return 0

  const steepness = -6 // Same steepness as R1 for consistency
  const probability = 1 - Math.exp(r2 / steepness)
  return Math.min(0.95, Math.max(0, probability))
}

/**
 * Calculate loss probability based on combined R1+R2 value
 * Combined deficit uses a gentler curve to allow more rallies
 */
export function calculateCombinedLossProbability(combined: number): number {
  if (combined >= 0) return 0

  // Slightly gentler curve for combined deficit (allows more rallies when one stat is okay)
  const steepness = -12 // Less steep than individual stats, but still impactful
  const probability = 1 - Math.exp(combined / steepness)
  return Math.min(0.95, Math.max(0, probability))
}
