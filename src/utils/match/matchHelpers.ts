/**
 * Helper functions for match engine
 */
import { FavourStyle, Player, PlayStyle, RubberType } from '../../services/savegame/types'
import { HorizontalPosition, VerticalPosition } from './matchTypes'

/**
 * Get equipment modifiers for stats
 */
export function getEquipmentModifiers(rubber: RubberType): {
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
export function getPositioningBias(
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
export function checkLuckyBounce(shotQuality: number): {
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
export function generateNoise(): number {
  return (Math.random() - 0.5) * 2 * NOISE_RANGE // -NOISE_RANGE to +NOISE_RANGE
}

/**
 * Determine where the ball goes (forehand or backhand) based on hitter's placement and play style
 */
export function determineBallPosition(
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
