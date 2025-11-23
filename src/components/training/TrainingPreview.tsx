import React from 'react'
import GameCard from '../cards/GameCard'
import { theme } from '../../theme/theme'
import { Player } from '../../services/savegame/types'
import { getPlayerFullName } from '../../utils/playerGeneration'

interface TrainingPreviewProps {
  expectedSummary: {
    totalExpectedImprovement: number
    averagePerPlayer: number
    topExpectedImprovers: Array<{
      player: Player
      expectedImprovement: number
    }>
  }
}

export const TrainingPreview: React.FC<TrainingPreviewProps> = ({ expectedSummary }) => {
  return (
    <GameCard
      style={{
        padding: theme.spacing.lg,
        marginBottom: theme.spacing.lg,
        border: `${theme.borderWidth.default} solid ${theme.colors.primary.main}`
      }}
    >
      <h3
        style={{
          fontFamily: theme.typography.fontFamily.heading,
          fontSize: theme.typography.fontSize.xl,
          fontWeight: theme.typography.fontWeight.bold,
          color: theme.colors.text.primary,
          margin: 0,
          marginBottom: theme.spacing.md
        }}
      >
        Expected Training Results
      </h3>
      <div
        style={{
          marginBottom: theme.spacing.md,
          padding: theme.spacing.md,
          background: theme.colors.primary.main + '20',
          borderRadius: theme.borderRadius.sm
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
          <span style={{ color: theme.colors.text.secondary }}>
            Total Expected Improvement:
          </span>
          <span
            style={{
              fontSize: theme.typography.fontSize.xl,
              fontWeight: theme.typography.fontWeight.bold,
              color: theme.colors.success.main
            }}
          >
            +{expectedSummary.totalExpectedImprovement} points
          </span>
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <span style={{ color: theme.colors.text.secondary }}>Average per Player:</span>
          <span
            style={{
              fontSize: theme.typography.fontSize.base,
              fontWeight: theme.typography.fontWeight.medium,
              color: theme.colors.text.primary
            }}
          >
            +{expectedSummary.averagePerPlayer} points
          </span>
        </div>
      </div>
      {expectedSummary.topExpectedImprovers.length > 0 && (
        <div style={{ marginBottom: theme.spacing.md }}>
          <h4
            style={{
              fontFamily: theme.typography.fontFamily.heading,
              fontSize: theme.typography.fontSize.base,
              fontWeight: theme.typography.fontWeight.bold,
              color: theme.colors.text.primary,
              margin: 0,
              marginBottom: theme.spacing.sm
            }}
          >
            Top Expected Improvers:
          </h4>
          {expectedSummary.topExpectedImprovers.map(({ player, expectedImprovement }) => (
            <div
              key={player.id}
              style={{
                padding: theme.spacing.sm,
                background: theme.colors.border.default + '40',
                borderRadius: theme.borderRadius.sm,
                marginBottom: theme.spacing.xs
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <span style={{ color: theme.colors.text.primary }}>
                  {getPlayerFullName(player)}
                </span>
                <span
                  style={{
                    color: theme.colors.success.main,
                    fontWeight: theme.typography.fontWeight.bold
                  }}
                >
                  +{expectedImprovement} points
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
      <p
        style={{
          fontSize: theme.typography.fontSize.sm,
          color: theme.colors.text.secondary,
          fontStyle: 'italic',
          margin: 0
        }}
      >
        * These are estimates. Actual results may vary due to random factors.
      </p>
    </GameCard>
  )
}

