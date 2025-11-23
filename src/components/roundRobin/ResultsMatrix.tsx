/**
 * Results matrix component showing round-robin match results
 */

import React from 'react'
import GameCard from '../cards/GameCard'
import { Player, RoundRobinTeamResults } from '../../services/savegame/types'
import { theme } from '../../theme/theme'

interface ResultsMatrixProps {
  teamResults: RoundRobinTeamResults
  players: Player[]
  onWatchMatch?: (player1Id: string, player2Id: string) => void
  gamesWatched: number
  maxGamesToWatch: number
}

export const ResultsMatrix: React.FC<ResultsMatrixProps> = ({
  teamResults,
  players,
  onWatchMatch,
  gamesWatched,
  maxGamesToWatch
}) => {
  const playerMap = new Map(players.map((p) => [p.id, p]))
  const selectedPlayers = teamResults.selectedPlayerIds
    .map((id) => playerMap.get(id))
    .filter((p): p is Player => p !== undefined)

  // Create a map of match results by player pair (sorted IDs for consistency)
  const matchMap = new Map<string, RoundRobinTeamResults['matchResults'][0]>()
  teamResults.matchResults.forEach((match) => {
    const key = [match.player1Id, match.player2Id].sort().join('-')
    matchMap.set(key, match)
  })

  const canWatchMoreGames = gamesWatched < maxGamesToWatch

  return (
    <GameCard
      style={{
        padding: theme.spacing.lg,
        overflow: 'auto',
        flex: 1
      }}
    >
      <div
        style={{
          marginBottom: theme.spacing.md,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: theme.spacing.md
        }}
      >
        <h2
          style={{
            fontFamily: theme.typography.fontFamily.heading,
            fontSize: theme.typography.fontSize.xl,
            fontWeight: theme.typography.fontWeight.bold,
            color: theme.colors.text.primary,
            margin: 0
          }}
        >
          Match Results Matrix
        </h2>
        <div
          style={{
            fontSize: theme.typography.fontSize.sm,
            color: theme.colors.text.secondary
          }}
        >
          Games watched: {gamesWatched} / {maxGamesToWatch}
        </div>
      </div>

      {selectedPlayers.length === 0 ? (
        <p style={{ color: theme.colors.text.secondary }}>No players selected</p>
      ) : (
        <div
          style={{
            overflow: 'auto',
            border: `1px solid ${theme.colors.neutral.gray300}`,
            borderRadius: theme.borderRadius.md
          }}
        >
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              minWidth: '600px'
            }}
          >
            <thead>
              <tr>
                <th
                  style={{
                    padding: theme.spacing.sm,
                    textAlign: 'left',
                    borderBottom: `2px solid ${theme.colors.neutral.gray400}`,
                    backgroundColor: theme.colors.background.nested,
                    position: 'sticky',
                    left: 0,
                    zIndex: 10,
                    color: theme.colors.text.primary
                  }}
                >
                  Player
                </th>
                {selectedPlayers.map((player) => (
                  <th
                    key={player.id}
                    style={{
                      padding: theme.spacing.sm,
                      textAlign: 'center',
                      borderBottom: `2px solid ${theme.colors.neutral.gray400}`,
                      backgroundColor: theme.colors.background.nested,
                      minWidth: '80px',
                      color: theme.colors.text.primary
                    }}
                  >
                    <div
                      style={{
                        fontSize: theme.typography.fontSize.xs,
                        fontWeight: theme.typography.fontWeight.medium,
                        color: theme.colors.text.secondary
                      }}
                    >
                      {player.shortName || player.firstName}
                    </div>
                  </th>
                ))}
                <th
                  style={{
                    padding: theme.spacing.sm,
                    textAlign: 'center',
                    borderBottom: `2px solid ${theme.colors.neutral.gray400}`,
                    backgroundColor: theme.colors.background.nested,
                    fontWeight: theme.typography.fontWeight.bold,
                    color: theme.colors.text.primary
                  }}
                >
                  W-L
                </th>
                <th
                  style={{
                    padding: theme.spacing.sm,
                    textAlign: 'center',
                    borderBottom: `2px solid ${theme.colors.neutral.gray400}`,
                    backgroundColor: theme.colors.background.nested,
                    fontWeight: theme.typography.fontWeight.bold,
                    color: theme.colors.text.primary
                  }}
                >
                  Games
                </th>
              </tr>
            </thead>
            <tbody>
              {selectedPlayers.map((player1) => {
                const stats = teamResults.playerStats[player1.id] || {
                  wins: 0,
                  losses: 0,
                  gamesWon: 0,
                  gamesLost: 0,
                  automaticRanking: 0
                }
                return (
                  <tr key={player1.id}>
                    <td
                      style={{
                        padding: theme.spacing.sm,
                        borderBottom: `1px solid ${theme.colors.neutral.gray200}`,
                        backgroundColor: theme.colors.background.secondary,
                        position: 'sticky',
                        left: 0,
                        zIndex: 5,
                        fontWeight: theme.typography.fontWeight.medium,
                        color: theme.colors.text.primary
                      }}
                    >
                      {player1.shortName || player1.firstName}
                    </td>
                    {selectedPlayers.map((player2) => {
                      if (player1.id === player2.id) {
                        return (
                          <td
                            key={player2.id}
                            style={{
                              padding: theme.spacing.sm,
                              textAlign: 'center',
                              borderBottom: `1px solid ${theme.colors.neutral.gray200}`,
                              backgroundColor: theme.colors.background.nested,
                              color: theme.colors.text.secondary
                            }}
                          >
                            -
                          </td>
                        )
                      }

                      const matchKey = [player1.id, player2.id].sort().join('-')
                      const match = matchMap.get(matchKey)

                      if (!match) {
                        return (
                          <td
                            key={player2.id}
                            style={{
                              padding: theme.spacing.sm,
                              textAlign: 'center',
                              borderBottom: `1px solid ${theme.colors.neutral.gray200}`,
                              backgroundColor: theme.colors.background.secondary,
                              color: theme.colors.text.secondary
                            }}
                          >
                            -
                          </td>
                        )
                      }

                      const isPlayer1First = match.player1Id === player1.id
                      const player1GamesWon = isPlayer1First
                        ? match.player1GamesWon
                        : match.player2GamesWon
                      const player2GamesWon = isPlayer1First
                        ? match.player2GamesWon
                        : match.player1GamesWon
                      const won = match.winnerId === player1.id

                      return (
                        <td
                          key={player2.id}
                          style={{
                            padding: theme.spacing.sm,
                            textAlign: 'center',
                            borderBottom: `1px solid ${theme.colors.neutral.gray200}`,
                            backgroundColor: won
                              ? theme.colors.success.light
                              : theme.colors.error.light,
                            cursor:
                              onWatchMatch && canWatchMoreGames ? 'pointer' : 'default',
                            opacity: onWatchMatch && !canWatchMoreGames ? 0.6 : 1
                          }}
                          onClick={() => {
                            if (onWatchMatch && canWatchMoreGames) {
                              onWatchMatch(player1.id, player2.id)
                            }
                          }}
                          title={
                            onWatchMatch && canWatchMoreGames
                              ? 'Click to watch this match'
                              : won
                                ? `Won ${player1GamesWon}-${player2GamesWon}`
                                : `Lost ${player1GamesWon}-${player2GamesWon}`
                          }
                        >
                          <div
                            style={{
                              fontSize: theme.typography.fontSize.sm,
                              fontWeight: theme.typography.fontWeight.bold,
                              color: won
                                ? theme.colors.success.dark
                                : theme.colors.error.dark
                            }}
                          >
                            {won ? 'W' : 'L'}
                          </div>
                          <div
                            style={{
                              fontSize: theme.typography.fontSize.xs,
                              color: theme.colors.text.secondary
                            }}
                          >
                            {player1GamesWon}-{player2GamesWon}
                          </div>
                          {onWatchMatch && canWatchMoreGames && (
                            <div
                              style={{
                                fontSize: theme.typography.fontSize.xs,
                                color: theme.colors.primary.main,
                                marginTop: theme.spacing.xs
                              }}
                            >
                              👁 Watch
                            </div>
                          )}
                        </td>
                      )
                    })}
                    <td
                      style={{
                        padding: theme.spacing.sm,
                        textAlign: 'center',
                        borderBottom: `1px solid ${theme.colors.neutral.gray200}`,
                        fontWeight: theme.typography.fontWeight.bold,
                        backgroundColor: theme.colors.background.secondary,
                        color: theme.colors.text.primary
                      }}
                    >
                      {stats.wins}-{stats.losses}
                    </td>
                    <td
                      style={{
                        padding: theme.spacing.sm,
                        textAlign: 'center',
                        borderBottom: `1px solid ${theme.colors.neutral.gray200}`,
                        fontWeight: theme.typography.fontWeight.bold,
                        backgroundColor: theme.colors.background.secondary,
                        color: theme.colors.text.primary
                      }}
                    >
                      {stats.gamesWon}-{stats.gamesLost}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </GameCard>
  )
}
