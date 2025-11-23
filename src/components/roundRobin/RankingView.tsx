/**
 * Ranking assignment view for round-robin tournament
 */

import React, { useState, useMemo, useEffect } from 'react'
import GameCard from '../cards/GameCard'
import GameButton from '../buttons/GameButton'
import { PlayerCard } from '../players/PlayerCard'
import { ResultsMatrix } from './ResultsMatrix'
import { InfoDialog } from '../dialogs/InfoDialog'
import { Player, RoundRobinTeamResults } from '../../services/savegame/types'
import { theme } from '../../theme/theme'
import { getMaxGamesToWatch } from '../../utils/roundRobinEngine'
import { Screens } from '../../screen_manager/screens'

interface RankingViewProps {
  teamResults: RoundRobinTeamResults
  players: Player[]
  onUpdateRankings: (rankings: string[]) => void
  changeScreen: (screen: Screens) => void
}

export const RankingView: React.FC<RankingViewProps> = ({
  teamResults,
  players,
  onUpdateRankings,
  changeScreen
}) => {
  const playerMap = new Map(players.map((p) => [p.id, p]))
  const selectedPlayers = teamResults.selectedPlayerIds
    .map((id: string) => playerMap.get(id))
    .filter((p): p is Player => p !== undefined)

  // Initialize rankings from coach rankings or automatic rankings
  const [rankings, setRankings] = useState<string[]>(() => {
    if (teamResults.coachRankings && teamResults.coachRankings.length > 0) {
      return teamResults.coachRankings.slice(0, 12)
    }
    // Use automatic rankings
    const rankedPlayers = [...selectedPlayers].sort((a, b) => {
      const aStats = teamResults.playerStats[a.id]
      const bStats = teamResults.playerStats[b.id]
      return aStats.automaticRanking - bStats.automaticRanking
    })
    return rankedPlayers.slice(0, 12).map((p) => p.id)
  })

  const handleSaveRankings = () => {
    // Only save top 12 rankings
    const top12Rankings = rankings.slice(0, 12)
    onUpdateRankings(top12Rankings)
    setShowSuccessDialog(true)
  }

  const handleMoveUp = (index: number) => {
    if (index === 0) return
    const newRankings = [...rankings]
    ;[newRankings[index - 1], newRankings[index]] = [
      newRankings[index],
      newRankings[index - 1]
    ]
    setRankings(newRankings)
  }

  const handleMoveDown = (index: number) => {
    if (index >= rankings.length - 1) return
    const newRankings = [...rankings]
    ;[newRankings[index], newRankings[index + 1]] = [
      newRankings[index + 1],
      newRankings[index]
    ]
    setRankings(newRankings)
  }

  const handleRemove = (index: number) => {
    const newRankings = rankings.filter((_, i) => i !== index)
    setRankings(newRankings)
  }

  const handleAddPlayer = (playerId: string) => {
    if (rankings.includes(playerId)) return
    if (rankings.length >= 12) {
      setShowMaxPlayersDialog(true)
      return
    }
    setRankings([...rankings, playerId])
  }

  const unrankedPlayers = useMemo(() => {
    return selectedPlayers.filter((p) => !rankings.includes(p.id))
  }, [selectedPlayers, rankings])

  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [showMaxPlayersDialog, setShowMaxPlayersDialog] = useState(false)

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing.lg,
        flex: 1,
        overflow: 'hidden'
      }}
    >
      <GameCard
        style={{
          padding: theme.spacing.lg
        }}
      >
        <h2
          style={{
            fontFamily: theme.typography.fontFamily.heading,
            fontSize: theme.typography.fontSize.xl,
            fontWeight: theme.typography.fontWeight.bold,
            color: theme.colors.text.primary,
            marginBottom: theme.spacing.md,
            marginTop: 0
          }}
        >
          Assign Player Rankings
        </h2>
        <p
          style={{
            fontSize: theme.typography.fontSize.base,
            color: theme.colors.text.secondary,
            marginBottom: theme.spacing.lg
          }}
        >
          Rank up to 12 players for the {teamResults.teamType} team. These ranked players
          will be registered for the zonal school tournament. You can reference the
          automatic ranking based on tournament results, but you may choose to rank
          players differently based on your observations from watching matches.
        </p>
      </GameCard>

      {/* Results Matrix */}
      <GameCard
        style={{
          padding: theme.spacing.lg,
          flex: 1,
          overflow: 'auto'
        }}
      >
        <h3
          style={{
            fontFamily: theme.typography.fontFamily.heading,
            fontSize: theme.typography.fontSize.lg,
            fontWeight: theme.typography.fontWeight.bold,
            color: theme.colors.text.primary,
            marginBottom: theme.spacing.md
          }}
        >
          Tournament Results
        </h3>
        <ResultsMatrix
          teamResults={teamResults}
          players={players}
          gamesWatched={teamResults.matchesToWatch?.length || 0}
          maxGamesToWatch={getMaxGamesToWatch()}
        />
      </GameCard>

      {/* Ranking Assignment */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: theme.spacing.lg
        }}
      >
        {/* Automatic Rankings Reference */}
        <GameCard
          style={{
            padding: theme.spacing.md,
            maxHeight: '400px',
            overflow: 'auto'
          }}
        >
          <h3
            style={{
              fontSize: theme.typography.fontSize.lg,
              fontWeight: theme.typography.fontWeight.bold,
              marginBottom: theme.spacing.md
            }}
          >
            Automatic Rankings
          </h3>
          <p
            style={{
              fontSize: theme.typography.fontSize.sm,
              color: theme.colors.text.secondary,
              marginBottom: theme.spacing.md
            }}
          >
            Reference the automatic rankings based on tournament performance:
          </p>
          {selectedPlayers
            .sort((a, b) => {
              const aStats = teamResults.playerStats[a.id]
              const bStats = teamResults.playerStats[b.id]
              return aStats.automaticRanking - bStats.automaticRanking
            })
            .map((player, index) => {
              const stats = teamResults.playerStats[player.id]
              return (
                <div
                  key={player.id}
                  style={{
                    padding: theme.spacing.sm,
                    marginBottom: theme.spacing.xs,
                    border: `1px solid ${theme.colors.neutral.gray300}`,
                    borderRadius: theme.borderRadius.md,
                    backgroundColor: theme.colors.background.nested
                  }}
                >
                  <div style={{ fontWeight: theme.typography.fontWeight.bold }}>
                    #{stats.automaticRanking} - {player.shortName || player.firstName}
                  </div>
                  <div
                    style={{
                      fontSize: theme.typography.fontSize.sm,
                      color: theme.colors.text.secondary
                    }}
                  >
                    {stats.wins}W-{stats.losses}L | Games: {stats.gamesWon}-
                    {stats.gamesLost}
                  </div>
                </div>
              )
            })}
        </GameCard>

        {/* Your Rankings */}
        <GameCard
          style={{
            padding: theme.spacing.md,
            maxHeight: '400px',
            overflow: 'auto'
          }}
        >
          <h3
            style={{
              fontSize: theme.typography.fontSize.lg,
              fontWeight: theme.typography.fontWeight.bold,
              marginBottom: theme.spacing.md
            }}
          >
            Your Rankings (Top 12 will be registered)
          </h3>
          {rankings.length === 0 && (
            <p
              style={{
                fontSize: theme.typography.fontSize.sm,
                color: theme.colors.text.secondary,
                fontStyle: 'italic'
              }}
            >
              No players ranked yet. Add players from the list below or use automatic
              rankings.
            </p>
          )}
          {rankings.slice(0, 12).map((playerId, index) => {
            const player = playerMap.get(playerId)
            if (!player) return null
            const stats = teamResults.playerStats[playerId]
            const autoRank = stats.automaticRanking

            return (
              <div
                key={playerId}
                style={{
                  padding: theme.spacing.md,
                  marginBottom: theme.spacing.sm,
                  border: `2px solid ${theme.colors.primary.main}`,
                  borderRadius: theme.borderRadius.md,
                  backgroundColor: theme.colors.primary.light + '20',
                  display: 'flex',
                  alignItems: 'center',
                  gap: theme.spacing.sm
                }}
              >
                <div
                  style={{
                    fontSize: theme.typography.fontSize.xl,
                    fontWeight: theme.typography.fontWeight.bold,
                    color: theme.colors.primary.dark,
                    minWidth: '30px'
                  }}
                >
                  #{index + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: theme.typography.fontWeight.bold }}>
                    {player.shortName || player.firstName}
                  </div>
                  <div
                    style={{
                      fontSize: theme.typography.fontSize.sm,
                      color: theme.colors.text.secondary
                    }}
                  >
                    {stats.wins}W-{stats.losses}L | Auto Rank: #{autoRank}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: theme.spacing.xs }}>
                  {index > 0 && (
                    <button
                      onClick={() => handleMoveUp(index)}
                      style={{
                        padding: theme.spacing.xs,
                        border: 'none',
                        backgroundColor: theme.colors.secondary.main,
                        color: theme.colors.text.primary,
                        borderRadius: theme.borderRadius.sm,
                        cursor: 'pointer'
                      }}
                    >
                      ↑
                    </button>
                  )}
                  {index < rankings.length - 1 && (
                    <button
                      onClick={() => handleMoveDown(index)}
                      style={{
                        padding: theme.spacing.xs,
                        border: 'none',
                        backgroundColor: theme.colors.secondary.main,
                        color: theme.colors.text.primary,
                        borderRadius: theme.borderRadius.sm,
                        cursor: 'pointer'
                      }}
                    >
                      ↓
                    </button>
                  )}
                  <button
                    onClick={() => handleRemove(index)}
                    style={{
                      padding: theme.spacing.xs,
                      border: 'none',
                      backgroundColor: theme.colors.error.main,
                      color: theme.colors.text.primary,
                      borderRadius: theme.borderRadius.sm,
                      cursor: 'pointer'
                    }}
                  >
                    ×
                  </button>
                </div>
              </div>
            )
          })}

          {/* Unranked Players */}
          {rankings.length < 12 && unrankedPlayers.length > 0 && (
            <div style={{ marginTop: theme.spacing.md }}>
              <h4
                style={{
                  fontSize: theme.typography.fontSize.base,
                  fontWeight: theme.typography.fontWeight.bold,
                  marginBottom: theme.spacing.sm
                }}
              >
                Add Players:
              </h4>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: theme.spacing.xs
                }}
              >
                {unrankedPlayers.slice(0, 10).map((player) => {
                  const stats = teamResults.playerStats[player.id]
                  return (
                    <button
                      key={player.id}
                      onClick={() => handleAddPlayer(player.id)}
                      style={{
                        padding: theme.spacing.sm,
                        border: `1px solid ${theme.colors.neutral.gray300}`,
                        borderRadius: theme.borderRadius.md,
                        backgroundColor: theme.colors.background.secondary,
                        color: theme.colors.text.primary,
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                    >
                      {player.shortName || player.firstName} (Auto Rank: #
                      {stats.automaticRanking}, {stats.wins}W-{stats.losses}L)
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </GameCard>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: theme.spacing.md }}>
        <GameButton variant="secondary" onClick={() => changeScreen(Screens.HOME)}>
          Back
        </GameButton>
        <GameButton variant="primary" onClick={handleSaveRankings}>
          Save Rankings
        </GameButton>
      </div>

      <InfoDialog
        isOpen={showSuccessDialog}
        title="Rankings Saved"
        message="The top 12 players will be registered for the zonal tournament."
        onClose={() => setShowSuccessDialog(false)}
        variant="success"
      />

      <InfoDialog
        isOpen={showMaxPlayersDialog}
        title="Maximum Players Reached"
        message="Maximum 12 players can be ranked."
        onClose={() => setShowMaxPlayersDialog(false)}
        variant="info"
      />
    </div>
  )
}
