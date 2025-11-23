/**
 * Round-robin tournament engine for intra-team competitions
 */

import {
  Player,
  RoundRobinMatchResult,
  RoundRobinTeamResults,
  RoundRobinTeamType
} from '../services/savegame/types'

import { initializeMatch, simulateRally, type MatchState } from './matchEngine'

const MAX_GAMES_WATCHED = 3 // Hardcoded limit for now
// TODO: In future, make this variable based on coaching attributes or badges

/**
 * Simulate a best-of-5 game match between two players
 * Returns the match result with game-by-game scores
 */
export function simulateBestOf5Match(
  player1: Player,
  player2: Player
): RoundRobinMatchResult {
  const gameResults: number[][] = []
  let player1GamesWon = 0
  let player2GamesWon = 0

  // Play up to 5 games (best of 5)
  while (player1GamesWon < 3 && player2GamesWon < 3) {
    const gameResult = simulateGame(player1, player2)
    gameResults.push(gameResult)

    if (gameResult[0] > gameResult[1]) {
      player1GamesWon++
    } else {
      player2GamesWon++
    }
  }

  const winnerId = player1GamesWon >= 3 ? player1.id : player2.id

  return {
    player1Id: player1.id,
    player2Id: player2.id,
    player1GamesWon,
    player2GamesWon,
    winnerId,
    gameResults
  }
}

/**
 * Simulate a single game (first to 11 points, win by 2, or first to 15)
 */
function simulateGame(player1: Player, player2: Player): [number, number] {
  const matchState = initializeMatch(player1, player2)
  let currentState: MatchState = { ...matchState }

  // Simulate rallies until game is won
  const maxRallies = 100 // Safety limit to prevent infinite loops
  let rallyCount = 0

  while (rallyCount < maxRallies) {
    const isServe =
      currentState.currentGameScore[0] + currentState.currentGameScore[1] === 0 ||
      (currentState.currentGameScore[0] + currentState.currentGameScore[1]) % 2 === 0

    const rally = simulateRally(
      player1,
      player2,
      currentState.servingPlayer,
      currentState.playerPositions,
      isServe
    )

    // Update game score
    const newGameScore = [...currentState.currentGameScore]
    newGameScore[rally.winner]++

    // Check if game is won (first to 11, win by 2, or first to 15)
    const winnerScore = newGameScore[rally.winner]
    const loserScore = newGameScore[1 - rally.winner]

    if (winnerScore >= 11) {
      const lead = winnerScore - loserScore
      if (lead >= 2 || winnerScore >= 15) {
        // Game won
        return [newGameScore[0], newGameScore[1]]
      }
    }

    // Update state for next rally
    currentState = {
      ...currentState,
      currentGameScore: newGameScore,
      servingPlayer:
        (newGameScore[0] + newGameScore[1]) % 2 === 0
          ? 1 - currentState.servingPlayer
          : currentState.servingPlayer,
      playerPositions: rally.newPositions
    }
    rallyCount++
  }

  // Fallback: return current score if max rallies reached (shouldn't happen)
  return [currentState.currentGameScore[0], currentState.currentGameScore[1]]
}

/**
 * Generate all possible matchups for a round-robin tournament
 */
export function generateMatchups(playerIds: string[]): Array<[string, string]> {
  const matchups: Array<[string, string]> = []
  for (let i = 0; i < playerIds.length; i++) {
    for (let j = i + 1; j < playerIds.length; j++) {
      matchups.push([playerIds[i], playerIds[j]])
    }
  }
  return matchups
}

/**
 * Run a complete round-robin tournament for a team
 */
export function runRoundRobinTournament(
  players: Player[],
  selectedPlayerIds: string[]
): RoundRobinTeamResults {
  const playerMap = new Map(players.map((p) => [p.id, p]))

  // Generate all matchups
  const matchups = generateMatchups(selectedPlayerIds)
  const matchResults: RoundRobinMatchResult[] = []

  // Simulate all matches
  for (const [player1Id, player2Id] of matchups) {
    const player1 = playerMap.get(player1Id)
    const player2 = playerMap.get(player2Id)

    if (!player1 || !player2) {
      console.error(`Player not found: ${player1Id} or ${player2Id}`)
      continue
    }

    const matchResult = simulateBestOf5Match(player1, player2)
    matchResults.push(matchResult)
  }

  // Calculate player stats
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

  // Initialize stats for all players
  for (const playerId of selectedPlayerIds) {
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

  // Calculate automatic rankings based on win rate, then games won/lost ratio
  const rankedPlayers = [...selectedPlayerIds].sort((a, b) => {
    const aStats = playerStats[a]
    const bStats = playerStats[b]

    // First by win rate
    const aWinRate = aStats.wins / (aStats.wins + aStats.losses)
    const bWinRate = bStats.wins / (bStats.wins + bStats.losses)

    if (Math.abs(aWinRate - bWinRate) > 0.001) {
      return bWinRate - aWinRate
    }

    // Then by games won/lost ratio
    const aGameRatio = aStats.gamesWon / Math.max(1, aStats.gamesWon + aStats.gamesLost)
    const bGameRatio = bStats.gamesWon / Math.max(1, bStats.gamesWon + bStats.gamesLost)

    if (Math.abs(aGameRatio - bGameRatio) > 0.001) {
      return bGameRatio - aGameRatio
    }

    // Finally by total games won
    return bStats.gamesWon - aStats.gamesWon
  })

  // Assign rankings (1 = best)
  rankedPlayers.forEach((playerId, index) => {
    playerStats[playerId].automaticRanking = index + 1
  })

  return {
    teamType: 'C boys' as RoundRobinTeamType, // Will be set by caller
    selectedPlayerIds,
    matchResults,
    playerStats,
    coachRankings: null,
    gamesWatched: 0,
    completed: false
  }
}

/**
 * Get the maximum number of games the coach can watch
 */
export function getMaxGamesToWatch(): number {
  return MAX_GAMES_WATCHED
}
