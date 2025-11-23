import React from 'react'
import { theme } from '../../theme/theme'
import { Player, SkillSnapshot } from '../../services/savegame/types'
import { getPlayerFullName } from '../../utils/playerGeneration'
import { getMostImprovedSkill } from '../../utils/trainingInsights'
import { StyledFlex, StyledHeading, StyledText } from '../../styles'

interface TopImproversListProps {
  topImprovers: Array<{
    player: Player
    totalImprovement: number
  }>
  oldSnapshots: SkillSnapshot[]
}

export const TopImproversList: React.FC<TopImproversListProps> = ({
  topImprovers,
  oldSnapshots
}) => {
  if (topImprovers.length === 0) {
    return (
      <StyledText size="base" color="secondary" style={{ margin: 0 }}>
        No progress data available yet.
      </StyledText>
    )
  }

  return (
    <StyledFlex direction="column" gap="sm">
      <StyledHeading size="h6" margin={`0 0 ${theme.spacing.xs} 0`}>
        Top Improvers:
      </StyledHeading>
      {topImprovers.map(({ player, totalImprovement }) => {
        const oldSnapshot = oldSnapshots.find((s) => s.playerId === player.id)
        const mostImproved =
          oldSnapshot && getMostImprovedSkill(oldSnapshot.skills, player.skills)

        return (
          <div
            key={player.id}
            style={{
              padding: theme.spacing.sm,
              background: theme.colors.border.default + '40',
              borderRadius: theme.borderRadius.sm,
              border: `${theme.borderWidth.default} solid ${theme.colors.border.default}`
            }}
          >
            <StyledFlex
              justify="space-between"
              align="center"
              style={{ marginBottom: theme.spacing.xs }}
            >
              <StyledText size="sm" weight="bold" color="primary">
                {getPlayerFullName(player)}
              </StyledText>
              <StyledText
                size="sm"
                weight="bold"
                style={{ color: theme.colors.success.main }}
              >
                +{totalImprovement} total
              </StyledText>
            </StyledFlex>
            {mostImproved && (
              <StyledText size="xs" color="secondary" style={{ margin: 0 }}>
                Most improved: {mostImproved.label} (+{mostImproved.improvement})
              </StyledText>
            )}
          </div>
        )
      })}
    </StyledFlex>
  )
}
