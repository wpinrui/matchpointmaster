import React, { useMemo } from 'react'
import GameCard from '../cards/GameCard'
import GameButton from '../buttons/GameButton'
import { theme } from '../../theme/theme'
import { useSaveDataContext } from '../../services/savegame/SaveDataContext'
import { RoundRobinTeamType, RoundRobinData } from '../../services/savegame/types'
import { getAvailableTeamTypes } from '../../utils/roundRobinHelpers'
import { Screens } from '../../screen_manager/screens'

interface RoundRobinResultsCardProps {
  changeScreen: (screen: Screens) => void
}

export const RoundRobinResultsCard: React.FC<RoundRobinResultsCardProps> = ({
  changeScreen
}) => {
  const { roundRobinData, school, season, players, teamRoster } = useSaveDataContext()

  const availableTeams = useMemo(
    () => getAvailableTeamTypes(school.teamType),
    [school.teamType]
  )

  // Check if we have completed round-robin data
  const hasCompletedTournament = useMemo(() => {
    if (!roundRobinData) return false
    const teams = Object.values(roundRobinData.teamResults).filter((r) => r !== null)
    return teams.length > 0 && teams.every((r) => r?.completed === true)
  }, [roundRobinData])

  // Check if all teams have rankings assigned
  const allTeamsRanked = useMemo(() => {
    if (!roundRobinData) return false
    const teams = Object.values(roundRobinData.teamResults).filter((r) => r !== null)
    return teams.every((r) => r?.coachRankings !== null && r.coachRankings.length > 0)
  }, [roundRobinData])

  if (!hasCompletedTournament) {
    return null
  }

  return (
    <GameCard
      style={{
        padding: theme.spacing.lg,
        display: 'flex',
        flexDirection: 'column',
        height: '100%'
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
        Round-Robin Tournament Results
      </h2>
      <p
        style={{
          fontSize: theme.typography.fontSize.base,
          color: theme.colors.text.secondary,
          marginBottom: theme.spacing.md
        }}
      >
        The intra-team round-robin tournament has been completed for all teams. Review
        results and assign player rankings.
      </p>

      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: theme.spacing.sm,
          marginBottom: theme.spacing.lg
        }}
      >
        {availableTeams.map((teamType) => {
          const teamResult = roundRobinData?.teamResults[teamType]
          if (!teamResult || !teamResult.completed) return null

          const teamPlayers = players.filter(
            (p) =>
              teamRoster.includes(p.id) && teamResult.selectedPlayerIds.includes(p.id)
          )
          const hasRankings =
            teamResult.coachRankings && teamResult.coachRankings.length > 0

          return (
            <div
              key={teamType}
              style={{
                padding: theme.spacing.md,
                border: `1px solid ${theme.colors.neutral.gray300}`,
                borderRadius: theme.borderRadius.md,
                backgroundColor: theme.colors.background.nested
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: theme.spacing.xs
                }}
              >
                <span
                  style={{
                    fontWeight: theme.typography.fontWeight.bold,
                    color: theme.colors.text.primary
                  }}
                >
                  {teamType}
                </span>
                <span
                  style={{
                    fontSize: theme.typography.fontSize.sm,
                    color: hasRankings
                      ? theme.colors.success.main
                      : theme.colors.text.secondary
                  }}
                >
                  {hasRankings ? '✓ Ranked' : 'Not Ranked'}
                </span>
              </div>
              <div
                style={{
                  fontSize: theme.typography.fontSize.sm,
                  color: theme.colors.text.secondary
                }}
              >
                {teamResult.matchResults.length} matches played • {teamPlayers.length}{' '}
                players
              </div>
            </div>
          )
        })}
      </div>

      <div
        style={{
          display: 'flex',
          gap: theme.spacing.md,
          marginTop: 'auto'
        }}
      >
        <GameButton
          variant="primary"
          size="md"
          onClick={() => changeScreen(Screens.ROUND_ROBIN)}
          style={{ flex: 1 }}
        >
          {allTeamsRanked ? 'View Rankings' : 'Assign Rankings'}
        </GameButton>
      </div>
    </GameCard>
  )
}

