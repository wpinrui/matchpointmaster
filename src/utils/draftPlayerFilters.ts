import { Gender, Player } from '../services/savegame/types'
import { calculateOverallRating } from './cardTiers'

/**
 * Filter players by team type (boys/girls/both)
 */
export function filterPlayersByTeamType(
  players: Player[],
  teamType: 'boys' | 'girls' | 'both'
): Player[] {
  if (teamType === 'boys') {
    return players.filter((p) => p.gender === Gender.MALE)
  } else if (teamType === 'girls') {
    return players.filter((p) => p.gender === Gender.FEMALE)
  }
  // 'both' shows all players
  return players
}

/**
 * Get available players (not on team) filtered and sorted
 */
export function getAvailablePlayers(
  allPlayers: Player[],
  teamRoster: string[],
  teamType: 'boys' | 'girls' | 'both'
): Player[] {
  const available = allPlayers.filter((p) => !teamRoster.includes(p.id))
  const filtered = filterPlayersByTeamType(available, teamType)
  return filtered.sort(
    (a, b) => calculateOverallRating(b.skills) - calculateOverallRating(a.skills)
  )
}

/**
 * Get team players filtered and sorted
 */
export function getTeamPlayers(
  allPlayers: Player[],
  teamRoster: string[],
  teamType: 'boys' | 'girls' | 'both'
): Player[] {
  const teamPlayers = allPlayers.filter((p) => teamRoster.includes(p.id))
  const filtered = filterPlayersByTeamType(teamPlayers, teamType)
  return filtered.sort(
    (a, b) => calculateOverallRating(b.skills) - calculateOverallRating(a.skills)
  )
}
