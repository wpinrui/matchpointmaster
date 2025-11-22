/**
 * School reputation and funding calculation utilities
 */

/**
 * Calculate school reputation from history
 * Reputation = (mean of past 10 years + median of past 10 years) / 2
 * Lower number is better (closer to 1st place)
 */
export function calculateSchoolReputation(reputationHistory: number[]): number {
  if (reputationHistory.length === 0) {
    return 50 // Default starting reputation
  }

  // Use last 10 years, or all available if less than 10
  const recentHistory = reputationHistory.slice(-10)

  // Calculate mean
  const mean = recentHistory.reduce((sum, val) => sum + val, 0) / recentHistory.length

  // Calculate median
  const sorted = [...recentHistory].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  const median =
    sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid]

  // Return average of mean and median
  return (mean + median) / 2
}

/**
 * Calculate next year's funding based on previous funding and result
 * Next year funding = previous year funding + relative result
 * Example: 10th funding + 32nd result = 22nd funding
 * Lower number is better (1st is best)
 */
export function calculateNextYearFunding(
  currentFunding: number,
  currentYearResult: number
): number {
  // Average of previous funding and result
  // This gives a weighted average where both matter
  return Math.round((currentFunding + currentYearResult) / 2)
}

/**
 * Calculate school attractiveness score
 * Combines reputation, funding, and coach reputation
 * Lower scores are better (closer to 1st)
 */
export function calculateSchoolAttractiveness(
  schoolReputation: number,
  schoolFunding: number,
  coachReputation: number
): number {
  // Average all three factors
  // Lower is better, so we want schools with lower numbers to be more attractive
  return (schoolReputation + schoolFunding + coachReputation) / 3
}

/**
 * Convert attractiveness to intake quality
 * Better schools (lower numbers) get better players
 */
export function attractivenessToIntakeQuality(attractiveness: number): {
  quality: 'poor' | 'below_average' | 'average' | 'above_average' | 'excellent'
  poolSize: number
} {
  // Lower attractiveness = better school = better players and more of them
  // Scale from 1 (best) to 100 (worst)

  if (attractiveness <= 10) {
    return { quality: 'excellent', poolSize: 15 }
  } else if (attractiveness <= 25) {
    return { quality: 'above_average', poolSize: 12 }
  } else if (attractiveness <= 50) {
    return { quality: 'average', poolSize: 8 }
  } else if (attractiveness <= 75) {
    return { quality: 'below_average', poolSize: 5 }
  } else {
    return { quality: 'poor', poolSize: 2 }
  }
}

/**
 * Calculate maximum team size based on school funding and team type
 * Co-ed schools: 4 teams (C boys, C girls, B boys, B girls) = minimum 7 per team = 28 total
 * Single gender schools: 2 teams (C and B) = minimum 7 per team = 14 total
 * Better funding = more slots for development
 */
export function calculateMaxTeamSize(
  schoolFunding: number,
  teamType: 'boys' | 'girls' | 'both' = 'both'
): number {
  // Determine minimum based on team type
  // Co-ed: 4 teams × 7 minimum = 28
  // Single gender: 2 teams × 7 minimum = 14
  const minSize = teamType === 'both' ? 28 : 14
  const maxSize = teamType === 'both' ? 56 : 28 // Max: 14 per team for co-ed, 14 per team for single gender
  const funding = schoolFunding || 50

  // Lower funding rank = better funding = more slots
  // Scale from minSize (worst funding, rank 100) to maxSize (best funding, rank 1)
  // Formula: minSize + ((100 - funding) / 99) * (maxSize - minSize)
  const additionalSlots = Math.round(((100 - funding) / 99) * (maxSize - minSize))
  const calculatedSize = minSize + additionalSlots

  // Clamp to ensure it's always between minSize and maxSize
  return Math.max(minSize, Math.min(maxSize, calculatedSize))
}

/**
 * Calculate initial player pool size based on school attractiveness
 * Scales from 7 (worst schools) to 15 (best schools)
 * Uses the same attractiveness calculation as team quality
 */
export function calculatePlayerPoolSize(schoolAttractiveness: number): number {
  const minPoolSize = 7 // Minimum pool size
  const maxPoolSize = 15 // Maximum pool size

  // Lower attractiveness = better school = more players in pool
  // Scale from 7 (worst attractiveness, rank 100) to 15 (best attractiveness, rank 1)
  // Formula: minPoolSize + ((100 - attractiveness) / 99) * (maxPoolSize - minPoolSize)
  const additionalPlayers = Math.round(
    ((100 - schoolAttractiveness) / 99) * (maxPoolSize - minPoolSize)
  )
  const calculatedSize = minPoolSize + additionalPlayers

  // Clamp to ensure it's always between 7 and 15
  return Math.max(minPoolSize, Math.min(maxPoolSize, calculatedSize))
}
