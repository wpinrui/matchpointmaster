/**
 * Manager stats utility functions
 */

import { ManagerStats } from '../services/savegame/types'

/**
 * Get reputation level description
 */
export const getReputationLevel = (reputation: number): string => {
  if (reputation >= 90) return 'Legendary'
  if (reputation >= 75) return 'Excellent'
  if (reputation >= 60) return 'Good'
  if (reputation >= 40) return 'Average'
  if (reputation >= 25) return 'Below Average'
  return 'Poor'
}

/**
 * Get coaching effectiveness level description
 */
export const getCoachingLevel = (effectiveness: number): string => {
  if (effectiveness >= 90) return 'Master Coach'
  if (effectiveness >= 75) return 'Expert'
  if (effectiveness >= 60) return 'Skilled'
  if (effectiveness >= 40) return 'Competent'
  if (effectiveness >= 25) return 'Novice'
  return 'Beginner'
}

/**
 * Interpolate between two RGB colors based on a normalized value (0-1)
 * Returns a hex color string
 */
function interpolateColor(
  t: number,
  startColor: [number, number, number],
  endColor: [number, number, number]
): string {
  // Clamp t between 0 and 1
  const normalizedT = Math.max(0, Math.min(1, t))

  // Interpolate each RGB component
  const r = Math.round(startColor[0] + (endColor[0] - startColor[0]) * normalizedT)
  const g = Math.round(startColor[1] + (endColor[1] - startColor[1]) * normalizedT)
  const b = Math.round(startColor[2] + (endColor[2] - startColor[2]) * normalizedT)

  // Convert to hex string
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

/**
 * Get color for stat value (for UI display)
 * Linear gradient from bright red (piss poor) to bright green (superb)
 * Values < 25 = worst red, values > 90 = best green
 */
export const getStatColor = (value: number): string => {
  // Bright red (piss poor) - RGB(255, 80, 80) - lighter for dark theme contrast
  const worstRed: [number, number, number] = [255, 80, 80]
  // Bright green (superb) - RGB(80, 255, 80) - lighter for dark theme contrast
  const bestGreen: [number, number, number] = [80, 255, 80]

  // Clamp values: < 25 = worst red, > 90 = best green
  if (value < 25) {
    // Return worst red directly
    const [r, g, b] = worstRed
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
  }
  if (value > 90) {
    // Return best green directly
    const [r, g, b] = bestGreen
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
  }

  // Gradient only applies between 25-90
  // Map 25-90 to 0-1 for interpolation
  const normalizedValue = (value - 25) / (90 - 25)

  return interpolateColor(normalizedValue, worstRed, bestGreen)
}

/**
 * Calculate reputation impact on player intake quality
 * Higher reputation = better player intake
 */
export const getIntakeQualityFromReputation = (reputation: number): string => {
  if (reputation >= 80) return 'Excellent'
  if (reputation >= 60) return 'Above Average'
  if (reputation >= 40) return 'Average'
  if (reputation >= 20) return 'Below Average'
  return 'Poor'
}

/**
 * Get stat description with context
 */
export const getStatDescription = (
  statName: 'reputation' | 'coachingEffectiveness',
  value: number
): string => {
  if (statName === 'reputation') {
    return `Your reputation affects the quality of players who want to join your school. Higher reputation attracts better talent.`
  }
  return `Your coaching effectiveness determines how well you can develop players' skills during training. Higher effectiveness means faster skill growth.`
}

/**
 * Clamp stat value to valid range (0-100)
 */
export const clampStat = (value: number): number => {
  return Math.max(0, Math.min(100, Math.round(value)))
}

/**
 * Modify manager stats (with bounds checking)
 */
export const modifyStats = (
  currentStats: ManagerStats,
  changes: Partial<ManagerStats>
): ManagerStats => {
  return {
    reputation: clampStat((currentStats.reputation ?? 50) + (changes.reputation ?? 0)),
    coachingEffectiveness: clampStat(
      (currentStats.coachingEffectiveness ?? 50) + (changes.coachingEffectiveness ?? 0)
    )
  }
}
