/**
 * Sequential round-robin tournament simulation with match-by-match progression
 */

import { Player, RoundRobinMatchResult } from '../services/savegame/types'
import { simulateBestOf5Match } from './roundRobinEngine'

export type TournamentSimulationState = {
  currentMatchIndex: number
  isPlaying: boolean
  speed: number
  isComplete: boolean
}

/**
 * Get match key for a matchup (sorted IDs for consistency)
 */
export function getMatchKey(player1Id: string, player2Id: string): string {
  return [player1Id, player2Id].sort().join('-')
}

/**
 * Parse match key back to player IDs
 */
export function parseMatchKey(matchKey: string): [string, string] {
  const [id1, id2] = matchKey.split('-')
  return [id1, id2]
}

/**
 * Generate ordered list of matchups for display and simulation
 */
export function generateOrderedMatchups(playerIds: string[]): Array<{
  matchKey: string
  player1Id: string
  player2Id: string
  index: number
}> {
  const matchups: Array<{
    matchKey: string
    player1Id: string
    player2Id: string
    index: number
  }> = []
  let index = 0
  for (let i = 0; i < playerIds.length; i++) {
    for (let j = i + 1; j < playerIds.length; j++) {
      matchups.push({
        matchKey: getMatchKey(playerIds[i], playerIds[j]),
        player1Id: playerIds[i],
        player2Id: playerIds[j],
        index: index++
      })
    }
  }
  return matchups
}

/**
 * Simulate a single match (used during sequential simulation)
 */
export function simulateMatch(player1: Player, player2: Player): RoundRobinMatchResult {
  return simulateBestOf5Match(player1, player2)
}

/**
 * Calculate player stats from completed match results
 */
export function calculatePlayerStats(
  playerIds: string[],
  matchResults: RoundRobinMatchResult[]
): Record<
  string,
  {
    wins: number
    losses: number
    gamesWon: number
    gamesLost: number
    automaticRanking: number
  }
> {
  const playerStats: Record<
    string,
    {
      wins: number
      losses: number
      gamesWon: number
      gamesLost: number
      automaticRanking: number
    }
  > = {}

  // Initialize stats
  for (const playerId of playerIds) {
    playerStats[playerId] = {
      wins: 0,
      losses: 0,
      gamesWon: 0,
      gamesLost: 0,
      automaticRanking: 0
    }
  }

  // Calculate stats from match results
  for (const match of matchResults) {
    const p1Stats = playerStats[match.player1Id]
    const p2Stats = playerStats[match.player2Id]

    if (match.winnerId === match.player1Id) {
      p1Stats.wins++
      p2Stats.losses++
    } else {
      p2Stats.wins++
      p1Stats.losses++
    }

    p1Stats.gamesWon += match.player1GamesWon
    p1Stats.gamesLost += match.player2GamesWon

    p2Stats.gamesWon += match.player2GamesWon
    p2Stats.gamesLost += match.player1GamesWon
  }

  // Calculate automatic rankings
  const rankedPlayers = [...playerIds].sort((a, b) => {
    const aStats = playerStats[a]
    const bStats = playerStats[b]

    const aWinRate = aStats.wins / Math.max(1, aStats.wins + aStats.losses)
    const bWinRate = bStats.wins / Math.max(1, bStats.wins + bStats.losses)

    if (Math.abs(aWinRate - bWinRate) > 0.001) {
      return bWinRate - aWinRate
    }

    const aGameRatio = aStats.gamesWon / Math.max(1, aStats.gamesWon + aStats.gamesLost)
    const bGameRatio = bStats.gamesWon / Math.max(1, bStats.gamesWon + bStats.gamesLost)

    if (Math.abs(aGameRatio - bGameRatio) > 0.001) {
      return bGameRatio - aGameRatio
    }

    return bStats.gamesWon - aStats.gamesWon
  })

  rankedPlayers.forEach((playerId, index) => {
    playerStats[playerId].automaticRanking = index + 1
  })

  return playerStats
}

