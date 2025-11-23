/**
 * Handle round-robin tournament completion
 */

import {
  Email,
  EmailTag,
  RoundRobinData,
  RoundRobinTeamResults
} from '../services/savegame/types'
import { GamePhase, getNextPhase } from './gamePhases'
import { getInGameTimestamp } from './emailGenerator'

/**
 * Generate email for round-robin tournament completion
 */
export function generateRoundRobinCompletionEmail(
  managerName: string,
  schoolName: string,
  roundRobinData: RoundRobinData
): Email {
  // Use last day of the month for tournament completion email
  const timestamp = getInGameTimestamp(
    roundRobinData.year,
    roundRobinData.month,
    31,
    16,
    0
  )

  // Count completed teams
  const completedTeams = Object.values(roundRobinData.teamResults).filter(
    (result) => result?.completed === true
  )
  const totalTeams = Object.values(roundRobinData.teamResults).filter(
    (result) => result !== null
  ).length

  const body = `Dear ${managerName},

The intra-team round-robin tournament has been completed for all teams.

## Tournament Summary

All ${completedTeams.length} team${completedTeams.length > 1 ? 's' : ''} have completed their round-robin tournaments. 

You can now review the results and assign player rankings on the home screen. The top 12 ranked players from each team will be registered for the upcoming zonal school tournament.

**Next Steps:**
1. Review tournament results on the home screen
2. Assign player rankings (or use automatic rankings)
3. Prepare for the zonal school tournament next month

Best regards,
School Administration`

  return {
    id: `round-robin-${roundRobinData.year}-${roundRobinData.month}-${Date.now()}`,
    from: 'School Administration',
    subject: 'Round-Robin Tournament Complete',
    body,
    timestamp,
    read: false,
    tags: [EmailTag.TOURNAMENT, EmailTag.ADMINISTRATIVE]
  }
}

/**
 * Check if all teams have completed their tournaments
 */
export function areAllTeamsCompleted(roundRobinData: RoundRobinData | null): boolean {
  if (!roundRobinData) return false

  const teams = Object.values(roundRobinData.teamResults).filter(
    (result) => result !== null
  )
  if (teams.length === 0) return false

  return teams.every((result) => result?.completed === true)
}
