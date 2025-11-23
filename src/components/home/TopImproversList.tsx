import React from 'react'
import { theme } from '../../theme/theme'
import { Player, SkillSnapshot } from '../../services/savegame/types'
import { getPlayerFullName } from '../../utils/playerGeneration'
import { getMostImprovedSkill } from '../../utils/trainingInsights'

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
      <p
        style={{
          fontSize: theme.typography.fontSize.base,
          color: theme.colors.text.secondary,
          margin: 0
        }}
      >
        No progress data available yet.
      </p>
    )
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: theme.spacing.sm
      }}
    >
      <h3
        style={{
          fontFamily: theme.typography.fontFamily.heading,
          fontSize: theme.typography.fontSize.base,
          fontWeight: theme.typography.fontWeight.bold,
          color: theme.colors.text.primary,
          margin: 0,
          marginBottom: theme.spacing.xs
        }}
      >
        Top Improvers:
      </h3>
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
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: theme.spacing.xs
              }}
            >
              <strong
                style={{
                  color: theme.colors.text.primary,
                  fontSize: theme.typography.fontSize.sm
                }}
              >
                {getPlayerFullName(player)}
              </strong>
              <span
                style={{
                  fontSize: theme.typography.fontSize.sm,
                  fontWeight: theme.typography.fontWeight.bold,
                  color: theme.colors.success.main
                }}
              >
                +{totalImprovement} total
              </span>
            </div>
            {mostImproved && (
              <p
                style={{
                  fontSize: theme.typography.fontSize.xs,
                  color: theme.colors.text.secondary,
                  margin: 0
                }}
              >
                Most improved: {mostImproved.label} (+{mostImproved.improvement})
              </p>
            )}
          </div>
        )
      })}
    </div>
  )
}
