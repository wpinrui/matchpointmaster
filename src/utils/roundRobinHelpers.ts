/**
 * Helper utilities for round-robin tournament
 */

import { Gender, Player, RoundRobinTeamType } from '../services/savegame/types'

/**
 * Filter players by round-robin team type
 */
export function filterPlayersByRoundRobinTeamType(
  players: Player[],
  teamType: RoundRobinTeamType
): Player[] {
  const isLowerSecondary = teamType.startsWith('C')
  const isUpperSecondary = teamType.startsWith('B')
  const isBoys = teamType.includes('boys')
  const isGirls = teamType.includes('girls')

  return players.filter((player) => {
    // Filter by year level
    if (isLowerSecondary && player.year !== 1 && player.year !== 2) {
      return false
    }
    if (isUpperSecondary && player.year !== 3 && player.year !== 4) {
      return false
    }

    // Filter by gender
    if (isBoys && player.gender !== Gender.MALE) {
      return false
    }
    if (isGirls && player.gender !== Gender.FEMALE) {
      return false
    }

    return true
  })
}

/**
 * Get available team types based on school team type
 */
export function getAvailableTeamTypes(
  schoolTeamType: 'boys' | 'girls' | 'both'
): RoundRobinTeamType[] {
  const teams: RoundRobinTeamType[] = []
  if (schoolTeamType === 'boys' || schoolTeamType === 'both') {
    teams.push('C boys', 'B boys')
  }
  if (schoolTeamType === 'girls' || schoolTeamType === 'both') {
    teams.push('C girls', 'B girls')
  }
  return teams
}
