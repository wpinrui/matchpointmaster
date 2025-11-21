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
 * Get color for stat value (for UI display)
 */
export const getStatColor = (value: number): string => {
  if (value >= 75) return '#48BB78' // Green (success)
  if (value >= 50) return '#FFD23F' // Yellow (accent)
  if (value >= 25) return '#ED8936' // Orange (warning)
  return '#F56565' // Red (error)
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
