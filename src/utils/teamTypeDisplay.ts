/**
 * Utility functions for displaying team type information
 */

import { SaveData } from '../services/savegame/types'

/**
 * Get a human-readable description of the team type
 */
export function getTeamTypeDescription(teamType: 'boys' | 'girls' | 'both'): string {
  switch (teamType) {
    case 'boys':
      return 'Boys Only'
    case 'girls':
      return 'Girls Only'
    case 'both':
      return 'Both Teams'
    default:
      return 'Unknown'
  }
}

/**
 * Get team composition requirements text based on team type
 */
export function getTeamCompositionRequirements(
  teamType: 'boys' | 'girls' | 'both'
): string {
  switch (teamType) {
    case 'boys':
      return `- You must draft at least 7 Secondary 1 boys to field a team for the 'C' Division Boys competition
- When we have Secondary 3 and 4 students in our team, we can also field a team of at least 7 to the 'B' Division Boys competition
- These are the minimum requirements to participate in the competitions`
    case 'girls':
      return `- You must draft at least 7 Secondary 1 girls to field a team for the 'C' Division Girls competition
- When we have Secondary 3 and 4 students in our team, we can also field a team of at least 7 to the 'B' Division Girls competition
- These are the minimum requirements to participate in the competitions`
    case 'both':
      return `- You must draft at least 7 Secondary 1 girls to field a team for the 'C' Division Girls competition
- You must draft at least 7 Secondary 1 boys to field a team for the 'C' Division Boys competition
- When we have Secondary 3 and 4 students in our team, we can also field a team of at least 7 to the 'B' Division Boys competition
- When we have Secondary 3 and 4 students in our team, we can also field a team of at least 7 to the 'B' Division Girls competition
- These are the minimum requirements to participate in the competitions`
    default:
      return ''
  }
}
