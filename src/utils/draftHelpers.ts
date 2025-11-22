/**
 * Helper utilities for draft screen
 */

export const MIN_TEAM_SIZE = 1

/**
 * Check if team is empty
 */
export function isTeamEmpty(teamRoster: string[]): boolean {
  return teamRoster.length < MIN_TEAM_SIZE
}

/**
 * Validate team before leaving draft
 */
export function validateTeamBeforeDraft(teamRoster: string[]): {
  isValid: boolean
  errorMessage?: string
} {
  if (isTeamEmpty(teamRoster)) {
    return {
      isValid: false,
      errorMessage:
        'You cannot leave the draft with an empty team. Please add at least one player before leaving.'
    }
  }
  return { isValid: true }
}
