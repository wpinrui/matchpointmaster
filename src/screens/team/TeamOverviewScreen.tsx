import React, { useMemo } from 'react'
import { ScreenProps, Screens } from '../../screen_manager/screens'
import { useSaveDataContext } from '../../services/savegame/SaveDataContext'
import { PlayerCard } from '../../components/players/PlayerCard'
import GameButton from '../../components/buttons/GameButton'
import { theme } from '../../theme/theme'
import GameCard from '../../components/cards/GameCard'
import { Gender } from '../../services/savegame/types'

const TeamOverviewScreen: React.FC<ScreenProps> = ({ changeScreen }) => {
  const { players, teamRoster, updateTeamRoster } = useSaveDataContext()

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
        byGender: { Male: 0, Female: 0 }
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

    const byGender = teamPlayers.reduce(
      (acc, p) => {
        const genderKey = p.gender === Gender.MALE ? 'Male' : 'Female'
        acc[genderKey] = (acc[genderKey] || 0) + 1
        return acc
      },
      { Male: 0, Female: 0 } as Record<string, number>
    )

    return {
      averageElo,
      totalPlayers: teamPlayers.length,
      byYear,
      byGender
    }
  }, [teamPlayers])

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
          <h1
            style={{
              fontFamily: theme.typography.fontFamily.heading,
              fontSize: theme.typography.fontSize['3xl'],
              fontWeight: theme.typography.fontWeight.extrabold,
              background: theme.gradients.primary,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              margin: 0
            }}
          >
            Team Overview
          </h1>
          {teamRoster.length < 7 && (
            <GameButton
              variant="primary"
              onClick={() => changeScreen(Screens.DRAFT)}
              type="button"
            >
              Draft Players
            </GameButton>
          )}
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
              textAlign: 'center'
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
                {teamStats.totalPlayers} / 7
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
                Male Players
              </p>
              <p
                style={{
                  fontSize: theme.typography.fontSize['2xl'],
                  fontWeight: theme.typography.fontWeight.bold,
                  color: theme.colors.secondary.main,
                  margin: 0
                }}
              >
                {teamStats.byGender.Male}
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
                Female Players
              </p>
              <p
                style={{
                  fontSize: theme.typography.fontSize['2xl'],
                  fontWeight: theme.typography.fontWeight.bold,
                  color: theme.colors.secondary.main,
                  margin: 0
                }}
              >
                {teamStats.byGender.Female}
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
            <p style={{ fontSize: theme.typography.fontSize.lg, marginBottom: theme.spacing.lg }}>
              Your team is empty. Start drafting players!
            </p>
            <GameButton
              variant="primary"
              onClick={() => changeScreen(Screens.DRAFT)}
              type="button"
            >
              Go to Draft
            </GameButton>
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
                <div key={player.id} style={{ position: 'relative' }}>
                  <PlayerCard player={player} />
                  <GameButton
                    variant="danger"
                    size="sm"
                    onClick={() => handleRemoveFromTeam(player.id)}
                    type="button"
                    style={{
                      position: 'absolute',
                      top: theme.spacing.sm,
                      right: theme.spacing.sm
                    }}
                  >
                    Remove
                  </GameButton>
                </div>
              ))}
            </div>
          </div>
        )}
    </div>
  )
}

export default TeamOverviewScreen

