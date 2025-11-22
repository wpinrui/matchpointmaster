import React, { useMemo } from 'react'
import GameButton from '../../components/buttons/GameButton'
import GameCard from '../../components/cards/GameCard'
import { PlayerCard } from '../../components/players/PlayerCard'
import { ScreenProps } from '../../screen_manager/screens'
import { useSaveDataContext } from '../../services/savegame/SaveDataContext'
import { theme } from '../../theme/theme'
import { calculateMaxTeamSize } from '../../utils/schoolReputation'

const TeamOverviewScreen: React.FC<ScreenProps> = ({ changeScreen }) => {
  const { players, teamRoster, updateTeamRoster, school } = useSaveDataContext()

  // Get players currently on the team
  const teamPlayers = useMemo(() => {
    return players.filter((p) => teamRoster.includes(p.id))
  }, [players, teamRoster])

  // Calculate team statistics
  const teamStats = useMemo(() => {
    if (teamPlayers.length === 0) {
      return {
        averageElo: 0,
        totalPlayers: 0,
        byYear: { 1: 0, 2: 0, 3: 0, 4: 0 },
        lowerSecondary: 0,
        upperSecondary: 0
      }
    }

    const totalElo = teamPlayers.reduce((sum, p) => sum + p.elo, 0)
    const averageElo = Math.round(totalElo / teamPlayers.length)

    const byYear = teamPlayers.reduce(
      (acc, p) => {
        acc[p.year] = (acc[p.year] || 0) + 1
        return acc
      },
      { 1: 0, 2: 0, 3: 0, 4: 0 } as Record<number, number>
    )

    // Calculate Lower Secondary (Year 1-2) and Upper Secondary (Year 3-4)
    const lowerSecondary = (byYear[1] || 0) + (byYear[2] || 0)
    const upperSecondary = (byYear[3] || 0) + (byYear[4] || 0)

    return {
      averageElo,
      totalPlayers: teamPlayers.length,
      byYear,
      lowerSecondary,
      upperSecondary
    }
  }, [teamPlayers])

  // Calculate max team size based on funding
  const maxTeamSize = useMemo(() => {
    return calculateMaxTeamSize(school.funding)
  }, [school.funding])

  const handleRemoveFromTeam = (playerId: string) => {
    updateTeamRoster.remove(playerId)
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing.lg,
        height: '100%'
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: theme.spacing.xl
        }}
      >
        <div style={{ flex: 1 }}>
          <h1
            style={{
              fontFamily: theme.typography.fontFamily.heading,
              fontSize: theme.typography.fontSize['3xl'],
              fontWeight: theme.typography.fontWeight.extrabold,
              background: theme.gradients.primary,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              margin: 0,
              marginBottom: theme.spacing.xs
            }}
          >
            Team Overview
          </h1>
          {school.teamType && (
            <p
              style={{
                fontSize: theme.typography.fontSize.base,
                color: theme.colors.text.secondary,
                margin: 0,
                fontStyle: 'italic'
              }}
            >
              {school.teamType === 'boys'
                ? 'Boys Only Team'
                : school.teamType === 'girls'
                  ? 'Girls Only Team'
                  : 'Both Boys and Girls Teams'}
            </p>
          )}
        </div>
      </div>

      {/* Team Statistics */}
      <GameCard
        style={{
          padding: theme.spacing.lg,
          marginBottom: theme.spacing.xl
        }}
      >
        <h3
          style={{
            fontFamily: theme.typography.fontFamily.heading,
            fontSize: theme.typography.fontSize.xl,
            fontWeight: theme.typography.fontWeight.bold,
            color: theme.colors.text.primary,
            marginBottom: theme.spacing.lg,
            textAlign: 'left'
          }}
        >
          Team Statistics
        </h3>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: theme.spacing.lg
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <p
              style={{
                fontSize: theme.typography.fontSize.sm,
                color: theme.colors.text.secondary,
                margin: 0,
                marginBottom: theme.spacing.xs
              }}
            >
              Team Size
            </p>
            <p
              style={{
                fontSize: theme.typography.fontSize['2xl'],
                fontWeight: theme.typography.fontWeight.bold,
                color: theme.colors.primary.main,
                margin: 0
              }}
            >
              {teamStats.totalPlayers} / {maxTeamSize}
            </p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p
              style={{
                fontSize: theme.typography.fontSize.sm,
                color: theme.colors.text.secondary,
                margin: 0,
                marginBottom: theme.spacing.xs
              }}
            >
              Average ELO
            </p>
            <p
              style={{
                fontSize: theme.typography.fontSize['2xl'],
                fontWeight: theme.typography.fontWeight.bold,
                color: theme.colors.accent.main,
                margin: 0
              }}
            >
              {teamStats.averageElo || 'N/A'}
            </p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p
              style={{
                fontSize: theme.typography.fontSize.sm,
                color: theme.colors.text.secondary,
                margin: 0,
                marginBottom: theme.spacing.xs
              }}
            >
              Lower Secondary
            </p>
            <p
              style={{
                fontSize: theme.typography.fontSize['2xl'],
                fontWeight: theme.typography.fontWeight.bold,
                color: theme.colors.secondary.main,
                margin: 0
              }}
            >
              {teamStats.lowerSecondary}
            </p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p
              style={{
                fontSize: theme.typography.fontSize.sm,
                color: theme.colors.text.secondary,
                margin: 0,
                marginBottom: theme.spacing.xs
              }}
            >
              Upper Secondary
            </p>
            <p
              style={{
                fontSize: theme.typography.fontSize['2xl'],
                fontWeight: theme.typography.fontWeight.bold,
                color: theme.colors.secondary.main,
                margin: 0
              }}
            >
              {teamStats.upperSecondary}
            </p>
          </div>
        </div>
      </GameCard>

      {/* Team Roster */}
      {teamPlayers.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: theme.spacing.xl,
            color: theme.colors.text.secondary
          }}
        >
          <p style={{ fontSize: theme.typography.fontSize.lg }}>Your team is empty.</p>
        </div>
      ) : (
        <div>
          <h2
            style={{
              fontFamily: theme.typography.fontFamily.heading,
              fontSize: theme.typography.fontSize['2xl'],
              fontWeight: theme.typography.fontWeight.bold,
              color: theme.colors.text.primary,
              marginBottom: theme.spacing.lg
            }}
          >
            Team Roster ({teamPlayers.length})
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
              gap: theme.spacing.md
            }}
          >
            {teamPlayers.map((player) => (
              <PlayerCard
                key={player.id}
                player={player}
                actionButton={
                  <GameButton
                    variant="danger"
                    size="sm"
                    onClick={() => handleRemoveFromTeam(player.id)}
                    type="button"
                    style={{
                      width: '100%'
                    }}
                  >
                    Remove
                  </GameButton>
                }
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default TeamOverviewScreen
