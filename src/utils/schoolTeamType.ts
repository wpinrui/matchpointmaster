/**
 * School team type determination utilities
 */

export type TeamType = 'boys' | 'girls' | 'both'

/**
 * Determine school team type based on ranking
 * Low ranking schools (reputation/funding > 75) randomly get either boys or girls only
 * Higher ranking schools get both teams
 */
export function determineSchoolTeamType(
  reputation: number,
  funding: number,
  seed?: string
): TeamType {
  // Consider a school "low ranking" if average of reputation and funding is > 75
  // Lower numbers are better (1st is best), so > 75 means worse schools
  const averageRanking = (reputation + funding) / 2
  const isLowRanking = averageRanking > 75

  if (isLowRanking) {
    // Randomly assign either boys or girls only
    // Use seed for consistency if provided
    let randomValue: number
    if (seed) {
      // Better hash function for pseudo-random but consistent result
      // This ensures better distribution between boys and girls
      let hash = 0
      for (let i = 0; i < seed.length; i++) {
        const char = seed.charCodeAt(i)
        hash = (hash << 5) - hash + char
        hash = hash | 0 // Convert to 32-bit integer
      }
      // Use absolute value and modulo 2, but add some mixing
      // Add reputation and funding to the hash for more variation
      const combinedHash = Math.abs(hash) + reputation + funding
      randomValue = combinedHash % 2
    } else {
      randomValue = Math.random() < 0.5 ? 0 : 1
    }

    return randomValue === 0 ? 'boys' : 'girls'
  } else {
    // Higher ranking schools can afford both teams
    return 'both'
  }
}
